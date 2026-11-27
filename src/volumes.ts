/**
 * The dictionaries ("volumes") on the home page.
 * Each one matches a folder in src/content/docs/ and a group in the sidebar.
 * To add a language: add it here, add its sidebar group in astro.config.mjs,
 * and create its folder with an index.mdx.
 */
export interface Volume {
	/** Folder name in src/content/docs/ */
	id: string;
	/** Shown on the card and in the sidebar */
	name: string;
	/** One line on the home card */
	description: string;
	/** Colour of the card's spine */
	spine?: string;
}

export const volumes: Volume[] = [
	{
		id: 'python',
		name: 'Python',
		description: 'Strings, lists, dictionaries, loops, functions, files…',
	},
	{
		id: 'sql',
		name: 'SQL',
		description: 'Filtering, joins, window functions, CTEs…',
	},
];

const numerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
export const volumeNumber = (index: number) => numerals[index] ?? String(index + 1);

export const findVolume = (id: string | undefined) => {
	const index = volumes.findIndex((v) => v.id === id);
	return index === -1 ? undefined : { ...volumes[index], number: volumeNumber(index) };
};
