// Small GitHub REST helpers: read files and commit changes to the repo.
import { REPO, BRANCH } from './session.js';

async function gh(token, path, options = {}) {
	const res = await fetch(`https://api.github.com${path}`, {
		...options,
		headers: {
			accept: 'application/vnd.github+json',
			authorization: `Bearer ${token}`,
			'x-github-api-version': '2022-11-28',
			'user-agent': 'coding-dictionary',
			...(options.body ? { 'content-type': 'application/json' } : {}),
		},
	});
	if (!res.ok) {
		const text = await res.text();
		const err = new Error(`GitHub said ${res.status}: ${text.slice(0, 200)}`);
		err.status = res.status;
		throw err;
	}
	return res.status === 204 ? null : res.json();
}

/** A file's text and its sha, or null if it doesn't exist. */
export async function getFile(token, path) {
	try {
		const data = await gh(token, `/repos/${REPO}/contents/${encodeURI(path)}?ref=${BRANCH}`);
		return { text: Buffer.from(data.content, 'base64').toString('utf8'), sha: data.sha };
	} catch (e) {
		if (e.status === 404) return null;
		throw e;
	}
}

/** List the files in a folder (names only), or [] if it doesn't exist. */
export async function listFolder(token, path) {
	try {
		const data = await gh(token, `/repos/${REPO}/contents/${encodeURI(path)}?ref=${BRANCH}`);
		return Array.isArray(data) ? data.map((f) => f.name) : [];
	} catch (e) {
		if (e.status === 404) return [];
		throw e;
	}
}

/**
 * Commit several files at once.
 * files: [{ path, text }]. Returns the commit's web address.
 */
export async function commitFiles(token, files, message) {
	const ref = await gh(token, `/repos/${REPO}/git/ref/heads/${BRANCH}`);
	const parent = ref.object.sha;
	const parentCommit = await gh(token, `/repos/${REPO}/git/commits/${parent}`);
	const tree = await gh(token, `/repos/${REPO}/git/trees`, {
		method: 'POST',
		body: JSON.stringify({
			base_tree: parentCommit.tree.sha,
			tree: files.map((f) => ({ path: f.path, mode: '100644', type: 'blob', content: f.text })),
		}),
	});
	const commit = await gh(token, `/repos/${REPO}/git/commits`, {
		method: 'POST',
		body: JSON.stringify({ message, tree: tree.sha, parents: [parent] }),
	});
	await gh(token, `/repos/${REPO}/git/refs/heads/${BRANCH}`, {
		method: 'PATCH',
		body: JSON.stringify({ sha: commit.sha }),
	});
	return commit.html_url;
}
