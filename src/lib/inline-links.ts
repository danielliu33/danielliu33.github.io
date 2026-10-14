/** A run of text, linked when `href` is set. */
export interface Part {
  text: string;
  href?: string;
}

/** [text](https://…) or [text](/path/) */
const linkPattern = /\[([^\]]+)\]\(((?:https:\/\/|\/)[^)\s]*)\)/g;

/** Split a paragraph with Markdown-style inline links into text and link parts. */
export function inlineParts(paragraph: string): Part[] {
  const out: Part[] = [];
  let last = 0;
  for (const m of paragraph.matchAll(linkPattern)) {
    const index = m.index ?? 0;
    if (index > last) out.push({ text: paragraph.slice(last, index) });
    out.push({ text: m[1], href: m[2] });
    last = index + m[0].length;
  }
  if (last < paragraph.length) out.push({ text: paragraph.slice(last) });
  return out;
}

/** Plain-text form for llms.txt: "text (absolute URL)". */
export function inlinePlain(paragraph: string, base: string | URL): string {
  return inlineParts(paragraph)
    .map((p) => (p.href ? `${p.text} (${new URL(p.href, base).href})` : p.text))
    .join('');
}
