#!/usr/bin/env node
/**
 * Renders /cv/ to public/cv.pdf with headless Chrome.
 *
 *   npm run pdf
 *
 * 1. builds the site,
 * 2. serves dist/ with `astro preview` on a free local port,
 * 3. prints /cv/ to public/cv.pdf (US Letter, no header/footer),
 * 4. checks the PDF: at most 2 Letter pages, only static EB Garamond fonts,
 *    no Type 3 fonts (needs poppler's pdfinfo and pdffonts),
 * 5. records which CV content the PDF was printed from
 *    (scripts/cv-pdf-source.json; the post-build check compares it),
 * 6. rebuilds so dist/ contains the new PDF.
 *
 * Set CHROME_PATH to use a different Chrome/Chromium binary.
 */
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync, statSync, writeFileSync } from 'node:fs';
import net from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { cvLockFile, cvSourceHash, fileHash } from './cv-fingerprint.mjs';

const MAX_PAGES = 2;

const root = fileURLToPath(new URL('..', import.meta.url));
const astroBin = join(root, 'node_modules', 'astro', 'bin', 'astro.mjs');
const outFile = join(root, 'public', 'cv.pdf');
const chrome =
  process.env.CHROME_PATH ||
  [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
  ].find((p) => existsSync(p));

const log = (msg) => console.log(`[pdf] ${msg}`);

function fail(msg) {
  console.error(`[pdf] ${msg}`);
  process.exit(1);
}

function build({ pdfPending = false } = {}) {
  log('building site…');
  // The first build runs before the new PDF exists; tell check-dist not to require it.
  const env = { ...process.env, ...(pdfPending ? { CV_PDF_PENDING: '1' } : {}) };
  const r = spawnSync(process.execPath, [astroBin, 'build'], { cwd: root, stdio: 'inherit', env });
  if (r.status !== 0) fail('astro build failed');
  const check = spawnSync(process.execPath, [join(root, 'scripts', 'check-dist.mjs')], { cwd: root, stdio: 'inherit', env });
  if (check.status !== 0) fail('post-build checks failed');
}

function freePort() {
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.unref();
    srv.on('error', reject);
    srv.listen(0, '127.0.0.1', () => {
      const { port } = srv.address();
      srv.close(() => resolve(port));
    });
  });
}

async function waitFor(url, timeoutMs = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      // not up yet
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(`timed out waiting for ${url}`);
}

function poppler(tool, file) {
  const r = spawnSync(tool, [file], { encoding: 'utf8' });
  if (r.error || r.status !== 0) {
    fail(`${tool} failed or is not installed (brew install poppler). It is needed to check the PDF.\n${r.stderr || ''}`);
  }
  return r.stdout;
}

/** At most MAX_PAGES pages, all US Letter (612 x 792 pt). */
function checkPages(file) {
  const info = poppler('pdfinfo', file);
  const pages = Number((info.match(/^Pages:\s+(\d+)/m) || [])[1]);
  if (!pages) fail(`could not read the page count:\n${info}`);
  if (pages > MAX_PAGES) {
    fail(`cv.pdf has ${pages} pages; the limit is ${MAX_PAGES}. Tighten the print styles in src/pages/cv.astro.`);
  }
  if (!/^Page size:\s+612 x 792 pts/m.test(info)) fail(`cv.pdf is not US Letter:\n${info}`);
  return pages;
}

/**
 * Every font must be embedded static EB Garamond. Chrome embeds variable fonts
 * as Type 3 (garbled copy-paste in macOS Preview and some applicant-tracking
 * systems), and any other font means a character fell back to a system font.
 */
function checkFonts(file) {
  const out = poppler('pdffonts', file);
  const rows = out.split('\n').slice(2).filter((l) => l.trim());
  if (rows.length === 0) fail('pdffonts found no fonts in cv.pdf');
  const bad = rows.filter((l) => /\bType 3\b/.test(l) || !/EBGaramond/i.test(l.split(/\s+/)[0]));
  const unembedded = rows.filter((l) => {
    const cols = l.trim().split(/\s+/);
    // columns from the right: object ID (2 cols), uni, sub, emb
    return cols[cols.length - 5] !== 'yes';
  });
  if (bad.length > 0 || unembedded.length > 0) {
    fail(`cv.pdf must embed only static EB Garamond (no Type 3, no fallback fonts):\n${out}`);
  }
  return rows.map((l) => l.split(/\s+/)[0].replace(/^[A-Z]{6}\+/, ''));
}

async function main() {
  if (!chrome) fail('Chrome not found. Set CHROME_PATH to a Chrome or Chromium binary.');

  build({ pdfPending: true });
  const sourceHash = cvSourceHash(join(root, 'dist'));

  const port = await freePort();
  const base = `http://127.0.0.1:${port}`;
  log(`serving dist/ on ${base}`);
  const server = spawn(
    process.execPath,
    [astroBin, 'preview', '--port', String(port), '--host', '127.0.0.1', '--ignore-lock'],
    { cwd: root, stdio: 'ignore' },
  );

  const profile = mkdtempSync(join(tmpdir(), 'cv-pdf-'));
  try {
    await waitFor(`${base}/cv/`);
    log('printing /cv/ with headless Chrome…');
    const r = spawnSync(
      chrome,
      [
        '--headless',
        '--disable-gpu',
        '--no-first-run',
        '--no-default-browser-check',
        '--disable-extensions',
        `--user-data-dir=${profile}`,
        '--no-pdf-header-footer',
        '--run-all-compositor-stages-before-draw',
        '--virtual-time-budget=10000',
        `--print-to-pdf=${outFile}`,
        `${base}/cv/`,
      ],
      { encoding: 'utf8' },
    );
    if (r.status !== 0 || !existsSync(outFile) || statSync(outFile).size === 0) {
      fail(`Chrome failed to print the PDF.\n${r.stderr || ''}`);
    }
  } finally {
    server.kill('SIGTERM');
    rmSync(profile, { recursive: true, force: true });
  }

  const pages = checkPages(outFile);
  const fonts = checkFonts(outFile);
  writeFileSync(cvLockFile, `${JSON.stringify({ source: sourceHash, pdf: fileHash(outFile) }, null, 2)}\n`);
  log(`wrote public/cv.pdf (${pages} page${pages === 1 ? '' : 's'}, ${Math.round(statSync(outFile).size / 1024)} KB; fonts: ${[...new Set(fonts)].join(', ')})`);

  build();
  log('done');
}

main().catch((err) => fail(err?.stack || String(err)));
