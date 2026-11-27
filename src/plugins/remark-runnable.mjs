/**
 * Turns fenced code blocks marked with `run` into runnable boxes:
 *
 *   ```sql run            ->  <RunSQL code="..." />
 *   ```python run         ->  <RunPython code="..." />
 *   ```python run title="Python + NumPy"
 *
 * Writing code as a normal fence keeps its indentation exactly
 * (MDX can strip spaces from code written inside nested components).
 */
import { visit } from 'unist-util-visit';

const COMPONENTS = { sql: 'RunSQL', python: 'RunPython', py: 'RunPython' };

const attr = (name, value) => ({ type: 'mdxJsxAttribute', name, value });

function importNode(names) {
	return {
		type: 'mdxjsEsm',
		value: '',
		data: {
			estree: {
				type: 'Program',
				sourceType: 'module',
				body: [
					{
						type: 'ImportDeclaration',
						specifiers: names.map((n) => ({
							type: 'ImportSpecifier',
							imported: { type: 'Identifier', name: n },
							local: { type: 'Identifier', name: `__${n}` },
						})),
						source: { type: 'Literal', value: '@components' },
					},
				],
			},
		},
	};
}

export default function remarkRunnable() {
	return (tree) => {
		const used = new Set();
		visit(tree, 'code', (node, index, parent) => {
			const component = COMPONENTS[node.lang ?? ''];
			if (!component || !parent || index === undefined || !/(^|\s)run(\s|$)/.test(node.meta ?? '')) return;
			const attributes = [attr('code', node.value)];
			const title = /title=["']([^"']+)["']/.exec(node.meta ?? '')?.[1];
			if (title) attributes.push(attr('title', title));
			used.add(component);
			parent.children[index] = {
				type: 'mdxJsxFlowElement',
				name: `__${component}`,
				attributes,
				children: [],
			};
		});
		if (used.size) tree.children.unshift(importNode([...used]));
	};
}
