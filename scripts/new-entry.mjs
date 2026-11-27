#!/usr/bin/env node
// Create a new dictionary page from a template.
//   npm run new -- python "List comprehensions"
//   npm run new -- sql "Date functions"
//   npm run new -- pandas "DataFrames"      (a new folder = a new topic)
import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const [topic, ...words] = process.argv.slice(2);
const title = words.join(' ').trim();
if (!topic || !title) {
	console.error('Usage: npm run new -- <topic> "<Page title>"   e.g. npm run new -- python "List comprehensions"');
	process.exit(1);
}

const folder = topic.toLowerCase();
const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const dir = join('src', 'content', 'docs', folder);
const file = join(dir, `${slug}.mdx`);
if (existsSync(file)) {
	console.error(`${file} already exists.`);
	process.exit(1);
}
mkdirSync(dir, { recursive: true });
const order = readdirSync(dir).filter((f) => /\.mdx?$/.test(f)).length;
const lang = folder === 'pandas' || folder === 'numpy' ? 'python' : folder;
const runnable = lang === 'python' || lang === 'sql' ? ' run' : '';
const fence = '```';

writeFileSync(
	file,
	`---
title: ${title}
description: One line about what this page covers.
sidebar:
  order: ${order}
flashcards:
  - q: A question to test yourself
    a: "The answer. Use \`backticks\` for code."
---

import { Value, Concept, Keyword, Entry } from '@components';

## First section

<Entry term="name_of_thing()" short="Very short meaning (under ~40 characters)">
<Fragment slot="code">

${fence}${lang}
# code goes here
${fence}

</Fragment>

The full explanation, shown when the entry is opened. Mark a <Concept>concept</Concept>, a <Value>value</Value> or a <Keyword>keyword</Keyword>.

</Entry>

Try it:

${fence}${lang}${runnable}
# editable example
${fence}
`,
);
console.log(`Created ${file}`);
if (!['python', 'sql'].includes(folder)) {
	console.log(
		`New dictionary! Also:\n  1. Add it to src/volumes.ts: { id: '${folder}', name: '${topic}', description: '…' },\n  2. Add its sidebar group in astro.config.mjs (label must match the name):\n     { label: '${topic}', items: [{ autogenerate: { directory: '${folder}' } }] },`,
	);
}
