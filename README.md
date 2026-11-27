# Coding Dictionary

My personal, searchable dictionary of everything I've studied in Python and SQL,
built with [Astro Starlight](https://starlight.astro.build).

- **Search**: press `/` or `⌘K`
- **Runnable code**: any ` ```python run ` or ` ```sql run ` block becomes an editable box
  (Python runs on Pyodide; SQL runs on SQLite with `src/data/sample-db.sql`)
- **Flashcards**: add `flashcards:` to a page's frontmatter; all of them appear on `/revise`

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the site at http://localhost:4321 (updates as you type) |
| `npm run new -- python "Page title"` | Create a new page from the template |
| `npm run build` | Build the final site into `dist/` |

## Where things live

- `src/content/docs/python/`, `src/content/docs/sql/`: one `.mdx` file per topic
- `src/components/`: `Entry`, `Value`, `Concept`, `Keyword`, `Legend`, `RunPython`, `RunSQL`, `Flashcards`
- `src/styles/theme.css`: colours (lavender headers, Value / CODE / CONCEPT legend)
- `astro.config.mjs`: site title and sidebar

## Publishing on GitHub Pages

1. Create a GitHub repo named `coding-dictionary` and push this folder to it.
2. In `astro.config.mjs`, set `site: 'https://<username>.github.io'` and `base: '/coding-dictionary'`.
3. On GitHub: **Settings → Pages → Source: GitHub Actions**. Every push to `main` then redeploys.
