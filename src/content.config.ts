import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

export const collections = {
	docs: defineCollection({
		loader: docsLoader(),
		schema: docsSchema({
			extend: z.object({
				// Flashcards for this page. Not shown on the site for now,
				// kept so they can be brought back later.
				flashcards: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
			}),
		}),
	}),
};
