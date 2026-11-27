// Save a change to the dictionary by committing it to GitHub.
// Vercel then rebuilds the site, so the change is live in about a minute.
//
// POST /api/save with JSON { action, ... }:
//   add-term     { file, section?, term, short, explanation, code, lang, run }
//   edit-term    { file, originalTerm, term, short, explanation, code, lang, run, codeIsRaw }
//   add-topic    { volume, title, description? }
//   add-volume   { name, description, spine?, topics: [title, …] }
import { getSession, json } from './_lib/session.js';
import { getFile, listFolder, commitFiles } from './_lib/github.js';
import { buildEntry, insertEntry, replaceEntry, ensureImports, newTopicFile, slugify } from './_lib/mdx.js';

const DOCS = 'src/content/docs';
const VOLUMES = 'src/volumes.json';

/** Only allow note files inside a dictionary folder. */
export function checkFile(path) {
	if (typeof path !== 'string' || !/^src\/content\/docs\/[a-z0-9-]+\/[a-z0-9-]+\.mdx$/.test(path)) {
		throw new Error('That is not a dictionary page.');
	}
	return path;
}

const text = (v, max = 4000) => String(v ?? '').slice(0, max);
const pageUrl = (path) => '/' + path.replace(`${DOCS}/`, '').replace(/(\/index)?\.mdx$/, '/');

async function addTerm(token, body) {
	const path = checkFile(body.file);
	const file = await getFile(token, path);
	if (!file) throw new Error('That page no longer exists.');
	const block = buildEntry(body);
	const updated = insertEntry(ensureImports(file.text), block, text(body.section, 200));
	const commit = await commitFiles(token, [{ path, text: updated }], `Add ${text(body.term, 80)}`);
	return { commit, page: pageUrl(path) };
}

async function editTerm(token, body) {
	const path = checkFile(body.file);
	const file = await getFile(token, path);
	if (!file) throw new Error('That page no longer exists.');
	const updated = replaceEntry(file.text, text(body.originalTerm, 300), buildEntry(body));
	if (updated === file.text) return { commit: null, page: pageUrl(path), unchanged: true };
	const commit = await commitFiles(token, [{ path, text: updated }], `Edit ${text(body.term, 80)}`);
	return { commit, page: pageUrl(path) };
}

async function readVolumes(token) {
	const file = await getFile(token, VOLUMES);
	if (!file) throw new Error('src/volumes.json is missing.');
	return JSON.parse(file.text);
}

async function addTopic(token, body) {
	const volumes = await readVolumes(token);
	const volume = volumes.find((v) => v.id === body.volume);
	if (!volume) throw new Error('Unknown dictionary.');
	const title = text(body.title, 120).trim();
	if (!title) throw new Error('The topic needs a name.');
	const slug = slugify(title);
	if (!slug || slug === 'index') throw new Error('Please choose a different name.');
	const existing = await listFolder(token, `${DOCS}/${volume.id}`);
	if (existing.includes(`${slug}.mdx`)) throw new Error(`There is already a “${title}” page.`);
	const path = `${DOCS}/${volume.id}/${slug}.mdx`;
	const order = existing.filter((f) => f.endsWith('.mdx')).length;
	const commit = await commitFiles(
		token,
		[{ path, text: newTopicFile({ title, description: text(body.description, 300).trim(), order }) }],
		`Add ${volume.name} topic: ${title}`,
	);
	return { commit, page: pageUrl(path) };
}

async function addVolume(token, body) {
	const volumes = await readVolumes(token);
	const name = text(body.name, 60).trim();
	const id = slugify(name);
	if (!id) throw new Error('The dictionary needs a name.');
	if (volumes.some((v) => v.id === id)) throw new Error(`There is already a ${name} dictionary.`);
	if (id === 'api' || id === 'guide' || id === 'revise') throw new Error('Please choose a different name.');
	const spine = /^#[0-9a-f]{6}$/i.test(body.spine) ? body.spine : undefined;
	volumes.push({ id, name, description: text(body.description, 160).trim(), ...(spine ? { spine } : {}) });

	const topics = (Array.isArray(body.topics) ? body.topics : [])
		.map((t) => text(t, 120).trim())
		.filter(Boolean)
		.slice(0, 20);
	const files = [
		{ path: VOLUMES, text: JSON.stringify(volumes, null, '\t') + '\n' },
		{
			path: `${DOCS}/${id}/index.mdx`,
			text: newTopicFile({ title: `${name} basics`, description: `The basics of ${name}.`, order: 0, label: 'Overview' }),
		},
	];
	const used = new Set(['index']);
	topics.forEach((title, i) => {
		const slug = slugify(title);
		if (!slug || used.has(slug)) return;
		used.add(slug);
		files.push({ path: `${DOCS}/${id}/${slug}.mdx`, text: newTopicFile({ title, order: i + 1 }) });
	});
	const commit = await commitFiles(token, files, `Add ${name} dictionary`);
	return { commit, page: `/${id}/` };
}

const actions = { 'add-term': addTerm, 'edit-term': editTerm, 'add-topic': addTopic, 'add-volume': addVolume };

export async function POST(request) {
	const session = await getSession(request);
	if (!session) return json({ error: 'Please sign in again.' }, 401);
	if (!(request.headers.get('content-type') || '').includes('application/json')) {
		return json({ error: 'Expected JSON.' }, 415);
	}
	let body;
	try {
		body = await request.json();
	} catch {
		return json({ error: 'Could not read the form.' }, 400);
	}
	const action = actions[body?.action];
	if (!action) return json({ error: 'Unknown action.' }, 400);
	try {
		return json({ ok: true, ...(await action(session.token, body)) });
	} catch (e) {
		const conflict = /GitHub said 422|GitHub said 409/.test(e.message);
		return json(
			{ error: conflict ? 'Someone (maybe you, in another tab) saved at the same time. Please try again.' : e.message },
			conflict ? 409 : 400,
		);
	}
}
