/**
 * Two small additions to remark-math, so posts written in Obsidian render the
 * same way here:
 *
 * 1. A paragraph that is only `$$…$$` on one line becomes display math
 *    (remark-math alone would render it inline).
 * 2. Pages that contain math get `math: true` in their remark frontmatter, so
 *    the KaTeX stylesheet is loaded only where it is needed.
 */
export function remarkMathExtras() {
  const displayFrom = (value, position) => ({
    type: 'math',
    meta: null,
    value,
    position,
    data: {
      hName: 'pre',
      hChildren: [
        {
          type: 'element',
          tagName: 'code',
          properties: { className: ['language-math', 'math-display'] },
          children: [{ type: 'text', value }],
        },
      ],
    },
  });

  const isBlank = (node) => node.type === 'text' && node.value.trim() === '';

  return (tree, file) => {
    const source = String(file.value ?? '');
    let found = false;

    const walk = (node) => {
      if (!node || !Array.isArray(node.children)) return;
      node.children = node.children.map((child) => {
        if (child.type === 'paragraph') {
          const parts = child.children.filter((c) => !isBlank(c));
          const only = parts.length === 1 ? parts[0] : null;
          const start = only?.position?.start?.offset;
          if (only && only.type === 'inlineMath' && typeof start === 'number' && source.startsWith('$$', start)) {
            found = true;
            return displayFrom(only.value, child.position);
          }
        }
        if (child.type === 'math' || child.type === 'inlineMath') found = true;
        walk(child);
        return child;
      });
    };
    walk(tree);

    if (found) {
      file.data.astro ??= {};
      file.data.astro.frontmatter ??= {};
      file.data.astro.frontmatter.math = true;
    }
  };
}
