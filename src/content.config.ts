import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

export const collections = {
	docs: defineCollection({
		loader: docsLoader(),
		schema: docsSchema({
			extend: z.object({
				// Flashcards for this page. They show at the bottom of the page
				// and are also collected on the /revise page.
				flashcards: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
			}),
		}),
	}),
};
