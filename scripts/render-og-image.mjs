#!/usr/bin/env node
/**
 * Renders the default social card (public/og-default.png, 1200×630) with
 * headless Chrome. Run only when the name or headline changes:
 *
 *   npm run og
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const outFile = join(root, 'public', 'og-default.png');
const chrome =
  process.env.CHROME_PATH ||
  [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
  ].find((p) => existsSync(p));
if (!chrome) {
  console.error('[og] Chrome not found. Set CHROME_PATH.');
  process.exit(1);
}

// Keep in sync with src/data/profile.ts.
const name = 'Daniel Liu';
const headline = 'I build AI agents, and the evaluations that decide whether they ship.';
const host = 'danielliu33.github.io';

const fontFile = (weight) =>
  readFileSync(join(root, `node_modules/@fontsource/eb-garamond/files/eb-garamond-latin-${weight}-normal.woff2`)).toString('base64');

// Same look as the site: EB Garamond, black on #f4f4f3, no decoration.
const html = `<!doctype html>
<html><head><meta charset="utf-8"><style>
@font-face { font-family: 'EB Garamond'; src: url(data:font/woff2;base64,${fontFile(400)}) format('woff2'); font-weight: 400; }
@font-face { font-family: 'EB Garamond'; src: url(data:font/woff2;base64,${fontFile(500)}) format('woff2'); font-weight: 500; }
html, body { margin: 0; width: 1200px; height: 630px; overflow: hidden; }
body { background: #f4f4f3; color: #000; font-family: 'EB Garamond', Georgia, serif;
  display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box; padding: 96px 110px 84px; }
.name { font-size: 44px; font-weight: 400; margin: 0; }
.headline { font-size: 72px; line-height: 1.12; font-weight: 400; margin: 0; max-width: 960px; }
.foot { font-size: 30px; color: #3f3f6d; margin: 0; }
</style></head><body>
<p class="name">${name}</p>
<p class="headline">${headline}</p>
<p class="foot">${host}</p>
</body></html>`;

const dir = mkdtempSync(join(tmpdir(), 'og-'));
const page = join(dir, 'og.html');
writeFileSync(page, html);
try {
  const r = spawnSync(
    chrome,
    [
      '--headless',
      '--disable-gpu',
      '--no-first-run',
      '--no-default-browser-check',
      `--user-data-dir=${join(dir, 'profile')}`,
      '--hide-scrollbars',
      '--force-device-scale-factor=1',
      '--window-size=1200,630',
      '--virtual-time-budget=3000',
      `--screenshot=${outFile}`,
      pathToFileURL(page).href,
    ],
    { encoding: 'utf8' },
  );
  if (r.status !== 0 || !existsSync(outFile)) {
    console.error(`[og] Chrome failed.\n${r.stderr || ''}`);
    process.exit(1);
  }
  console.log('[og] wrote public/og-default.png');
} finally {
  rmSync(dir, { recursive: true, force: true });
}
