#!/usr/bin/env node
/**
 * Renders /resume/ to public/resume.pdf with headless Chrome.
 *
 *   npm run pdf
 *
 * 1. builds the site,
 * 2. serves dist/ with `astro preview` on a free local port,
 * 3. prints /resume/ to public/resume.pdf (US Letter, no header/footer),
 * 4. checks the PDF is exactly one page,
 * 5. rebuilds so dist/ contains the new PDF.
 *
 * Set CHROME_PATH to use a different Chrome/Chromium binary.
 */
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, statSync } from 'node:fs';
import net from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const astroBin = join(root, 'node_modules', 'astro', 'bin', 'astro.mjs');
const outFile = join(root, 'public', 'resume.pdf');
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

function build() {
  log('building site…');
  const r = spawnSync(process.execPath, [astroBin, 'build'], { cwd: root, stdio: 'inherit' });
  if (r.status !== 0) fail('astro build failed');
  const check = spawnSync(process.execPath, [join(root, 'scripts', 'check-dist.mjs')], { cwd: root, stdio: 'inherit' });
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

function countPages(file) {
  const info = spawnSync('pdfinfo', [file], { encoding: 'utf8' });
  if (info.status === 0) {
    const m = info.stdout.match(/^Pages:\s+(\d+)/m);
    if (m) return Number(m[1]);
  }
  // Fallback without poppler: count page objects.
  const raw = readFileSync(file, 'latin1');
  return (raw.match(/\/Type\s*\/Page(?!s)/g) || []).length;
}

/**
 * Chrome embeds variable fonts as Type 3, which copy-pastes as garbled text in
 * macOS Preview and some ATS parsers. Fail if any slipped in (needs poppler).
 */
function checkFonts(file) {
  const r = spawnSync('pdffonts', [file], { encoding: 'utf8' });
  if (r.status !== 0) {
    log('pdffonts not found; skipped the Type 3 font check');
    return;
  }
  if (/\bType 3\b/.test(r.stdout)) {
    fail(`resume.pdf embeds Type 3 (variable) fonts. Print styles must use static fonts.\n${r.stdout}`);
  }
}

async function main() {
  if (!chrome) fail('Chrome not found. Set CHROME_PATH to a Chrome or Chromium binary.');

  build();

  const port = await freePort();
  const base = `http://127.0.0.1:${port}`;
  log(`serving dist/ on ${base}`);
  const server = spawn(
    process.execPath,
    [astroBin, 'preview', '--port', String(port), '--host', '127.0.0.1', '--ignore-lock'],
    { cwd: root, stdio: 'ignore' },
  );

  const profile = mkdtempSync(join(tmpdir(), 'resume-pdf-'));
  try {
    await waitFor(`${base}/resume/`);
    log('printing /resume/ with headless Chrome…');
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
        `${base}/resume/`,
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

  const pages = countPages(outFile);
  if (pages !== 1) fail(`resume.pdf has ${pages} pages; it must be exactly 1. Tighten the print styles in src/pages/resume.astro.`);
  checkFonts(outFile);
  log(`wrote public/resume.pdf (1 page, ${Math.round(statSync(outFile).size / 1024)} KB)`);

  build();
  log('done');
}

main().catch((err) => fail(err?.stack || String(err)));
