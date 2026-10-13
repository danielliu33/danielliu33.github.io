/** Curly quotes and apostrophes for frontmatter strings (Markdown bodies get this from SmartyPants). */
export function smart(text: string): string {
  return text
    .replace(/(^|[\s([{—–-])"/g, '$1“')
    .replace(/"/g, '”')
    .replace(/(^|[\s([{—–-])'/g, '$1‘')
    .replace(/'/g, '’');
}
