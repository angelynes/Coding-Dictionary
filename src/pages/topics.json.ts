// A list of every dictionary and its topics, used by the editing forms
// (for example to pick where a new term goes when adding from a phone).
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { volumes } from '../volumes';

export const GET: APIRoute = async () => {
	const docs = await getCollection('docs');
	const data = volumes.map((v) => ({
		id: v.id,
		name: v.name,
		topics: docs
			.filter((d) => d.id === v.id || d.id.startsWith(`${v.id}/`))
			.sort((a, b) => (a.data.sidebar.order ?? 99) - (b.data.sidebar.order ?? 99))
			.map((d) => ({
				title: d.data.sidebar.label ?? d.data.title,
				file: d.filePath,
				sections: [...(d.body ?? '').matchAll(/^## +(.+?)\s*$/gm)].map((m) => m[1]),
			})),
	}));
	return new Response(JSON.stringify(data), { headers: { 'content-type': 'application/json' } });
};
