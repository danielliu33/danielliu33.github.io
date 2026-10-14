#!/usr/bin/env node
/**
 * Post-build checks on dist/ (runs automatically after `npm run build`).
 * Fails the build when:
 *
 * 1. anything from the private drafts folder was built,
 * 2. a page contains a KaTeX error (invalid TeX renders as red text, silently),
 * 3. the sitemap lists a page marked noindex,
 * 4. the CV PDF the home page links to is missing, or is stale: the CV content
 *    or links changed since it was printed (`npm run pdf` writes it and
 *    scripts/cv-pdf-source.json; its own first build sets CV_PDF_PENDING=1),
 * 5. a redirect page for an old URL is missing, or a page still links to an old URL,
 * 6. a page links to a site path or #anchor that does not exist.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { legacyPages, legacyFiles } from '../src/lib/legacy-redirects.mjs';
import { cvLockFile, cvSourceHash, fileHash } from './cv-fingerprint.mjs';

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

// 4. The CV PDF: present, and printed from the current CV content.
if (!process.env.CV_PDF_PENDING) {
  const stale = 'run `npm run pdf` and commit public/cv.pdf and scripts/cv-pdf-source.json';
  if (!existsSync(join(dist, 'cv.pdf'))) {
    problems.push(`cv.pdf missing: ${stale}`);
  } else if (!existsSync(cvLockFile)) {
    problems.push(`scripts/cv-pdf-source.json missing: ${stale}`);
  } else {
    const lock = JSON.parse(readFileSync(cvLockFile, 'utf8'));
    if (lock.pdf !== fileHash(join(dist, 'cv.pdf'))) {
      problems.push(`cv.pdf is not the PDF recorded in scripts/cv-pdf-source.json: ${stale}`);
    } else if (lock.source !== cvSourceHash(dist)) {
      problems.push(`cv.pdf is stale (the CV content or links changed since it was printed): ${stale}`);
    }
  }
}

// 5. Old URLs: redirect pages exist, and no page links to an old URL.
const oldUrls = [...Object.keys(legacyPages), ...Object.keys(legacyFiles)];
for (const [from, to] of Object.entries(legacyPages)) {
  const page = join(dist, from, 'index.html');
  const html = existsSync(page) ? readFileSync(page, 'utf8') : '';
  if (!html.includes(`url=${to}`) || !html.includes('noindex')) problems.push(`redirect page missing or wrong: ${from} -> ${to}`);
}
for (const f of all.filter((f) => f.endsWith('.html'))) {
  const r = rel(f);
  if (oldUrls.some((u) => r === `${u.replace(/^\//, '')}index.html`)) continue; // the redirect pages themselves
  for (const u of oldUrls) {
    if (readFileSync(f, 'utf8').includes(`href="${u}"`)) problems.push(`links to old URL ${u}: ${r}`);
  }
}

// 6. Internal links and anchors.
const htmlFiles = all.filter((f) => f.endsWith('.html'));
const idsCache = new Map();
const idsOf = (file) => {
  if (!idsCache.has(file)) {
    idsCache.set(file, new Set([...readFileSync(file, 'utf8').matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])));
  }
  return idsCache.get(file);
};
const resolvePath = (path) => {
  let decoded;
  try {
    decoded = decodeURIComponent(path);
  } catch {
    return null;
  }
  const target = join(dist, decoded);
  if (decoded.endsWith('/')) return existsSync(join(target, 'index.html')) ? join(target, 'index.html') : null;
  if (existsSync(target) && statSync(target).isFile()) return target;
  return existsSync(join(target, 'index.html')) ? join(target, 'index.html') : null;
};
for (const f of htmlFiles) {
  const r = rel(f);
  const html = readFileSync(f, 'utf8');
  for (const [, attr, value] of html.matchAll(/\s(href|src)="([^"]*)"/g)) {
    const url = value.replace(/&amp;/g, '&');
    if (!url.startsWith('#') && !(url.startsWith('/') && !url.startsWith('//'))) continue;
    const [beforeHash, fragment] = url.split('#');
    const path = beforeHash.split('?')[0];
    const target = path ? resolvePath(path) : f;
    if (!target) {
      problems.push(`broken link ${attr}="${value}": ${r}`);
      continue;
    }
    if (fragment && target.endsWith('.html') && !idsOf(target).has(decodeURIComponent(fragment))) {
      problems.push(`missing anchor ${attr}="${value}": ${r}`);
    }
  }
}

if (problems.length > 0) {
  console.error(`[check-dist] ${problems.length} problem(s):\n  - ${problems.join('\n  - ')}`);
  process.exit(1);
}
console.log(`[check-dist] ok (${all.length} files)`);
