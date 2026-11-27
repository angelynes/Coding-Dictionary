// Small helpers shared by the Python and SQL runners.

/** Make a textarea behave a little like a code editor. */
export function enhanceEditor(ta: HTMLTextAreaElement, onRun: () => void) {
	const fit = () => {
		ta.rows = Math.max(3, ta.value.split('\n').length + 1);
	};
	fit();
	ta.addEventListener('input', fit);
	ta.addEventListener('keydown', (e) => {
		if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
			e.preventDefault();
			onRun();
			return;
		}
		if (e.key === 'Tab' && !e.shiftKey) {
			e.preventDefault();
			const { selectionStart: s, selectionEnd: end } = ta;
			ta.setRangeText('    ', s, end, 'end');
			fit();
		}
	});
	return fit;
}

const loaded = new Map<string, Promise<void>>();

/** Load a <script src> once per page. */
export function loadScript(src: string): Promise<void> {
	let p = loaded.get(src);
	if (!p) {
		p = new Promise((resolve, reject) => {
			const s = document.createElement('script');
			s.src = src;
			s.onload = () => resolve();
			s.onerror = () => {
				loaded.delete(src);
				reject(new Error(`Could not load ${src}. Are you online?`));
			};
			document.head.append(s);
		});
		loaded.set(src, p);
	}
	return p;
}

export function escapeHtml(s: string) {
	return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}
