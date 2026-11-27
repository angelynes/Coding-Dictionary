// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import remarkRunnable from './src/plugins/remark-runnable.mjs';

export default defineConfig({
	// Published at https://angelynes.github.io/Coding-Dictionary/
	site: 'https://angelynes.github.io',
	base: '/Coding-Dictionary',
	// ```sql run / ```python run code blocks become runnable boxes
	markdown: { remarkPlugins: [remarkRunnable] },
	integrations: [
		starlight({
			title: 'Coding Dictionary',
			description: 'My personal dictionary of everything I have studied in Python and SQL.',
			logo: { src: './src/assets/logo.svg', replacesTitle: false },
			customCss: ['./src/styles/theme.css'],
			lastUpdated: false,
			expressiveCode: {
				themes: ['github-light', 'github-dark'],
				styleOverrides: { borderRadius: '0.5rem' },
			},
			components: {
				// Adds the flashcards for each page under its content.
				MarkdownContent: './src/components/overrides/MarkdownContent.astro',
			},
			sidebar: [
				{ label: 'Start here', items: [{ label: 'How to use this', slug: 'guide' }, { label: 'Revise (flashcards)', link: '/revise/' }] },
				// Pages are added automatically from each folder.
				// Order them with `sidebar: { order: N }` in a page's frontmatter.
				{ label: 'Python', items: [{ autogenerate: { directory: 'python' } }] },
				{ label: 'SQL', items: [{ autogenerate: { directory: 'sql' } }] },
			],
		}),
	],
});
