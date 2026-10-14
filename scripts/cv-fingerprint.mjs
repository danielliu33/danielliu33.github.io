/**
 * Ties the committed CV PDF to the CV content it was printed from.
 *
 * `npm run pdf` records two hashes in scripts/cv-pdf-source.json:
 *   - source: the text, link targets and email parts of the built /cv/ page
 *     (content only; styling is not included),
 *   - pdf: the bytes of public/cv.pdf.
 * The post-build check recomputes both and fails when the CV content changed
 * (for example links.twitter or the cv data in src/data/profile.ts) but the
 * PDF was not regenerated. Needs no Chrome or poppler, so it also runs in CI.
 */
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const cvLockFile = fileURLToPath(new URL('./cv-pdf-source.json', import.meta.url));

const sha256 = (data) => createHash('sha256').update(data).digest('hex');

/** Hash of what the CV shows, read from dist/cv/index.html. */
export function cvSourceHash(distDir) {
  const html = readFileSync(join(distDir, 'cv', 'index.html'), 'utf8');
  const article = (html.match(/<article class="cv\b[\s\S]*?<\/article>/) || [])[0];
  if (!article) throw new Error('dist/cv/index.html has no <article class="cv">');
  const attrs = [...article.matchAll(/\s(href|data-eu|data-ed|data-label)="([^"]*)"/g)].map(([, k, v]) => `${k}=${v}`);
  const text = article
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return sha256(JSON.stringify({ text, attrs }));
}

/** Hash of a PDF file's bytes. */
export function fileHash(file) {
  return sha256(readFileSync(file));
}
