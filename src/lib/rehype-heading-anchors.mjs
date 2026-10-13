/**
 * Adds a small "#" link to h2–h4 headings that already have an id.
 * The visible "#" comes from CSS (::after), so the heading text that
 * Astro collects stays clean.
 */
export function rehypeHeadingAnchors() {
  const levels = new Set(['h2', 'h3', 'h4']);
  // Visible text only: skip KaTeX's aria-hidden HTML copy and its TeX <annotation>.
  const skip = (node) =>
    node.type === 'element' &&
    (node.tagName === 'annotation' ||
      node.properties?.ariaHidden === 'true' ||
      node.properties?.ariaHidden === true);
  const textOf = (node) =>
    node.type === 'text'
      ? node.value
      : Array.isArray(node.children) && !skip(node)
        ? node.children.map(textOf).join('')
        : '';
  const walk = (node) => {
    if (!node || !Array.isArray(node.children)) return;
    for (const child of node.children) {
      if (child.type === 'element' && levels.has(child.tagName)) {
        const id = child.properties && child.properties.id;
        if (typeof id === 'string' && id) {
          const label = textOf(child).trim();
          child.children.push({
            type: 'element',
            tagName: 'a',
            properties: {
              className: ['heading-anchor'],
              href: `#${id}`,
              ariaLabel: label ? `Link to section: ${label}` : 'Link to this section',
            },
            children: [],
          });
        }
        continue;
      }
      walk(child);
    }
  };
  return (tree) => walk(tree);
}
