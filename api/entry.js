// The current text of one term, to fill in the edit form.
// GET /api/entry?file=src/content/docs/sql/joins-and-set-operations.mdx&term=LEFT%20JOIN
import { getSession, json } from './_lib/session.js';
import { getFile } from './_lib/github.js';
import { entryFields, listEntries, listSections } from './_lib/mdx.js';
import { checkFile } from './save.js';

export async function GET(request) {
	const session = await getSession(request);
	if (!session) return json({ error: 'Please sign in again.' }, 401);
	const url = new URL(request.url);
	try {
		const path = checkFile(url.searchParams.get('file'));
		const term = url.searchParams.get('term');
		const file = await getFile(session.token, path);
		if (!file) return json({ error: 'That page no longer exists.' }, 404);
		const sections = listSections(file.text);
		if (!term) return json({ sections });
		const entry = listEntries(file.text).find((e) => e.attrs.term === term);
		if (!entry) return json({ error: `Couldn't find “${term}” on this page.` }, 404);
		return json({ ...entryFields(entry), sections });
	} catch (e) {
		return json({ error: e.message }, 400);
	}
}
