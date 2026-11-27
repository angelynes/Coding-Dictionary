import data from './volumes.json';

/**
 * The dictionaries ("volumes") on the home page.
 * The list lives in volumes.json; each one matches a folder in src/content/docs/
 * and gets its own sidebar group automatically (see astro.config.mjs).
 * Adding a language on the live site writes to volumes.json for you.
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

export const volumes: Volume[] = data;

const numerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
export const volumeNumber = (index: number) => numerals[index] ?? String(index + 1);

export const findVolume = (id: string | undefined) => {
	const index = volumes.findIndex((v) => v.id === id);
	return index === -1 ? undefined : { ...volumes[index], number: volumeNumber(index) };
};
