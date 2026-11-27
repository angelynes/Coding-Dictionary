// Reading and writing dictionary entries inside the .mdx note files.
// No dependencies, so it runs on Vercel as is and can be tested with plain Node.

const FENCE_RE = /^(`{3,})([^\n]*)\n([\s\S]*?)\n\1[ \t]*$/m;

/** Make a URL/file friendly name: "List comprehensions" → "list-comprehensions". */
export function slugify(text) {
	return String(text)
		.toLowerCase()
		.normalize('NFKD')
		.replace(/[̀-ͯ]/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '');
}

/** Write a JSX attribute safely: term="LEFT JOIN", or term={"a \"quoted\" name"}. */
function attr(name, value) {
	if (!/["{}<>]/.test(value)) return `${name}="${value}"`;
	return `${name}={${JSON.stringify(value)}}`;
}

/** Read the attributes of an <Entry ...> tag. Handles "..", '..' and {".."}. */
function parseAttrs(text) {
	const out = {};
	const re = /([a-zA-Z]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|\{\s*("(?:[^"\\]|\\.)*")\s*\}))?/g;
	let m;
	while ((m = re.exec(text))) {
		const [, name, dq, sq, js] = m;
		if (dq !== undefined) out[name] = dq;
		else if (sq !== undefined) out[name] = sq;
		else if (js !== undefined) out[name] = JSON.parse(js);
		else out[name] = true;
	}
	return out;
}

/** Find where an <Entry ...> opening tag ends, skipping over quotes and braces. */
function tagEnd(source, from) {
	let quote = null;
	let depth = 0;
	for (let i = from; i < source.length; i++) {
		const c = source[i];
		if (quote) {
			if (c === '\\') i++;
			else if (c === quote) quote = null;
		} else if (c === '"' || c === "'") quote = c;
		else if (c === '{') depth++;
		else if (c === '}') depth--;
		else if (c === '>' && depth === 0) return i;
	}
	return -1;
}

/** Every <Entry> in a file, with its position and parsed fields. */
export function listEntries(source) {
	const entries = [];
	let from = 0;
	while (true) {
		const start = source.indexOf('<Entry', from);
		if (start === -1) break;
		const open = tagEnd(source, start + 6);
		const close = source.indexOf('</Entry>', open);
		if (open === -1 || close === -1) break;
		const attrs = parseAttrs(source.slice(start + 6, open));
		const inner = source.slice(open + 1, close);
		entries.push({ start, end: close + '</Entry>'.length, attrs, inner });
		from = close + 1;
	}
	return entries;
}

// Text typed in the form is plain Markdown. MDX treats { } and < specially,
// so escape them outside `code`, and undo that when showing it in the form again.
const ALLOWED_TAGS = /^<\/?(Value|Concept|Keyword|kbd|br)\b/;

function mapOutsideCode(text, fn) {
	// Split into fenced blocks / inline code (kept) and the rest (mapped).
	const parts = text.split(/(```[\s\S]*?```|`[^`\n]*`)/g);
	return parts.map((p, i) => (i % 2 ? p : fn(p))).join('');
}

export function escapeMarkdown(text) {
	return mapOutsideCode(text, (t) =>
		t
			.replace(/(?<!\\)([{}])/g, '\\$1')
			.replace(/<(?!\/?(Value|Concept|Keyword|kbd|br)\b)/g, '&lt;'),
	);
}

export function unescapeMarkdown(text) {
	return mapOutsideCode(text, (t) => t.replace(/\\([{}])/g, '$1').replace(/&lt;/g, '<'));
}

/** The fields of one entry, as shown in the edit form. */
export function entryFields(entry) {
	const { attrs, inner } = entry;
	let explanation = inner;
	let code = '';
	let lang = '';
	let run = false;
	let codeIsRaw = false;
	const frag = inner.match(/<Fragment slot="code">([\s\S]*?)<\/Fragment>/);
	if (frag) {
		explanation = inner.replace(frag[0], '');
		const body = frag[1].trim();
		const fences = body.match(/^`{3,}/gm) || [];
		const m = body.match(FENCE_RE);
		if (m && fences.length === 2 && m.index === 0 && m[0].length === body.length) {
			const info = m[2].trim().split(/\s+/);
			lang = info[0] || '';
			run = info.includes('run');
			code = m[3];
		} else {
			// Several code blocks: edit them as Markdown.
			code = body;
			codeIsRaw = true;
		}
	}
	return {
		term: attrs.term ?? '',
		short: typeof attrs.short === 'string' ? attrs.short : '',
		explanation: unescapeMarkdown(explanation.trim()),
		code,
		lang,
		run,
		codeIsRaw,
	};
}

/** Build the MDX for one entry from form fields. */
export function buildEntry({ term, short, explanation, code, lang, run, codeIsRaw }) {
	term = String(term || '').trim();
	if (!term) throw new Error('The term is empty.');
	const lines = [`<Entry ${attr('term', term)}${short?.trim() ? ' ' + attr('short', short.trim()) : ''}>`];
	code = String(code || '').replace(/\s+$/, '');
	if (code) {
		let block;
		if (codeIsRaw) block = code;
		else {
			const ticks = '`'.repeat(Math.max(3, ...(code.match(/`+/g) || ['']).map((t) => t.length + 1)));
			const info = [lang?.trim() || 'text', run ? 'run' : ''].filter(Boolean).join(' ');
			block = `${ticks}${info}\n${code}\n${ticks}`;
		}
		lines.push('<Fragment slot="code">', '', block, '', '</Fragment>');
	}
	const text = escapeMarkdown(String(explanation || '').trim());
	lines.push('', text || ' ', '', '</Entry>');
	return lines.join('\n');
}

/** Section headings ("## …") in a file, for the "where" picker. */
export function listSections(source) {
	return [...source.matchAll(/^## +(.+?)\s*$/gm)].map((m) => m[1]);
}

/** Add an entry at the end of a section (or the end of the page). */
export function insertEntry(source, block, section) {
	let at = source.length;
	if (section) {
		const heads = [...source.matchAll(/^## +(.+?)\s*$/gm)];
		const i = heads.findIndex((h) => h[1] === section);
		if (i !== -1) at = i + 1 < heads.length ? heads[i + 1].index : source.length;
	}
	const before = source.slice(0, at).replace(/\s+$/, '');
	const after = source.slice(at);
	return `${before}\n\n${block}\n${after ? '\n' + after.replace(/^\s+/, '') : ''}`;
}

/** Replace the entry whose term is `originalTerm`. */
export function replaceEntry(source, originalTerm, block) {
	const entry = listEntries(source).find((e) => e.attrs.term === originalTerm);
	if (!entry) throw new Error(`Couldn't find “${originalTerm}” on this page. It may have been changed; reload and try again.`);
	return source.slice(0, entry.start) + block + source.slice(entry.end);
}

/** Make sure the page imports Entry (and the colour components). */
export function ensureImports(source) {
	if (/import\s*\{[^}]*\bEntry\b[^}]*\}\s*from\s*'@components'/.test(source)) return source;
	const fm = source.match(/^---\n[\s\S]*?\n---\n/);
	const at = fm ? fm[0].length : 0;
	return `${source.slice(0, at)}\nimport { Value, Concept, Keyword, Entry } from '@components';\n${source.slice(at)}`;
}

const yaml = (s) => JSON.stringify(String(s));

/** A new, empty topic page. */
export function newTopicFile({ title, description, order, label }) {
	return `---
title: ${yaml(title)}
description: ${yaml(description || `Notes on ${title}.`)}
sidebar:
${label ? `  label: ${yaml(label)}\n` : ''}  order: ${order}
---

import { Value, Concept, Keyword, Entry } from '@components';

## ${title}
`;
}
