#!/usr/bin/env node
/**
 * Post-build checks on dist/ (runs automatically after `npm run build`).
 * Fails the build when:
 *
 * 1. anything from the private drafts folder was built,
 * 2. a page contains a KaTeX error (invalid TeX renders as red text, silently),
 * 3. the sitemap lists a page marked noindex.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const dist = join(root, 'dist');
const problems = [];

if (!existsSync(dist)) {
  console.error('[check-dist] dist/ not found; run the build first.');
  process.exit(1);
}

function* files(dir) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) yield* files(full);
    else yield full;
  }
}

const all = [...files(dist)];
const rel = (f) => relative(dist, f).split(sep).join('/');

// 1. Private drafts.
for (const f of all) {
  if (/(^|\/)drafts(\/|$)/.test(rel(f))) problems.push(`draft built: ${rel(f)}`);
}
for (const f of all.filter((f) => /\.(html|xml|txt)$/.test(f))) {
  if (readFileSync(f, 'utf8').includes('/writing/drafts/')) problems.push(`links to a draft: ${rel(f)}`);
}

// 2. KaTeX errors.
for (const f of all.filter((f) => f.endsWith('.html'))) {
  if (readFileSync(f, 'utf8').includes('katex-error')) problems.push(`KaTeX error (invalid TeX): ${rel(f)}`);
}

// 3. noindex pages in the sitemap.
for (const f of all.filter((f) => /sitemap-\d+\.xml$/.test(f))) {
  for (const [, loc] of readFileSync(f, 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)) {
    const path = new URL(loc).pathname;
    const page = join(dist, path, path.endsWith('/') ? 'index.html' : '');
    if (existsSync(page) && /<meta name="robots" content="noindex"/.test(readFileSync(page, 'utf8'))) {
      problems.push(`noindex page in sitemap: ${path}`);
    }
  }
}

if (problems.length > 0) {
  console.error(`[check-dist] ${problems.length} problem(s):\n  - ${problems.join('\n  - ')}`);
  process.exit(1);
}
console.log(`[check-dist] ok (${all.length} files)`);
