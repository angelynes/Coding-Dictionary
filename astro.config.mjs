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
			head: [
				{ tag: 'link', attrs: { rel: 'preconnect', href: 'https://fonts.googleapis.com' } },
				{ tag: 'link', attrs: { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: true } },
				{
					tag: 'link',
					attrs: {
						rel: 'stylesheet',
						href: 'https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400..700;1,400..700&family=JetBrains+Mono:wght@400;500&display=swap',
					},
				},
			],
			// Inside a dictionary, the sidebar shows only that dictionary's topics.
			routeMiddleware: './src/routeData.ts',
			// Book spine: rust on paper, light on dark.
			logo: { light: './src/assets/logo-light.svg', dark: './src/assets/logo-dark.svg', replacesTitle: false },
			customCss: ['./src/styles/theme.css'],
			lastUpdated: false,
			expressiveCode: {
				themes: ['github-light', 'github-dark'],
				styleOverrides: {
					borderRadius: '0.4rem',
					borderColor: 'var(--cd-rule)',
					codeBackground: 'var(--cd-code-bg)',
					frames: {
						shadowColor: 'transparent',
						editorBackground: 'var(--cd-code-bg)',
						editorTabBarBackground: 'var(--cd-code-bg)',
						editorActiveTabBackground: 'var(--cd-code-bg)',
						terminalBackground: 'var(--cd-code-bg)',
						terminalTitlebarBackground: 'var(--cd-code-bg)',
					},
				},
			},
			components: {
				// Dictionary name and switch on top, colour key at the bottom.
				Sidebar: './src/components/overrides/Sidebar.astro',
			},
			sidebar: [
				{ label: 'Start here', items: [{ label: 'How to use this', slug: 'guide' }] },
				// Pages are added automatically from each folder.
				// Order them with `sidebar: { order: N }` in a page's frontmatter.
				{ label: 'Python', items: [{ autogenerate: { directory: 'python' } }] },
				{ label: 'SQL', items: [{ autogenerate: { directory: 'sql' } }] },
			],
		}),
	],
});
