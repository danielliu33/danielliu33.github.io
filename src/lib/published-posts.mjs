import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

/** src/content/writing, resolved from the project root (builds run there). */
export const writingDir = () => join(process.cwd(), 'src', 'content', 'writing');

/**
 * Name of the private drafts folder inside src/content/writing. It is
 * git-ignored, and production builds never load it (see content.config.ts).
 */
export const DRAFTS_DIR = 'drafts';

/** True when a collection entry id (path relative to src/content/writing) is inside drafts/. */
export const isInDraftsDir = (id) => id === DRAFTS_DIR || id.startsWith(`${DRAFTS_DIR}/`);

/**
 * `draft: true` in front matter, in any spelling YAML reads as true
 * (true/True/TRUE), with or without a trailing comment: `draft: true  # wip`.
 */
export const DRAFT_LINE = /^draft:\s*(?:true|True|TRUE)\s*(?:#.*)?$/m;

/** Every post file the "writing" collection would load (.md/.mdx, not starting with "_"). */
function postFiles(root, { includeDrafts }) {
  if (!existsSync(root)) return [];
  const found = [];
  const stack = [root];
  while (stack.length) {
    const current = stack.pop();
    for (const name of readdirSync(current)) {
      const full = join(current, name);
      if (statSync(full).isDirectory()) {
        if (includeDrafts || !(current === root && name === DRAFTS_DIR)) stack.push(full);
        continue;
      }
      if (!name.startsWith('_') && /\.(md|mdx)$/.test(name)) found.push(full);
    }
  }
  return found;
}

/**
 * True when the collection has any file to load. The dev server also loads
 * drafts/; production builds do not, so they pass includeDrafts: false.
 */
export function hasWritingFiles({ includeDrafts = true, root = writingDir() } = {}) {
  return postFiles(root, { includeDrafts }).length > 0;
}

/**
 * Config-time check (astro.config.mjs uses it for the sitemap): true when at
 * least one post outside drafts/ is not `draft: true`.
 */
export function hasPublishedPosts(root = writingDir()) {
  return postFiles(root, { includeDrafts: false }).some((file) => {
    const head = readFileSync(file, 'utf8').match(/^---\r?\n([\s\S]*?)\r?\n---/);
    return !(head && DRAFT_LINE.test(head[1]));
  });
}
