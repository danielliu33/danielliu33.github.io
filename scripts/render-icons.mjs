#!/usr/bin/env node
/**
 * Renders the raster icons from public/favicon.svg with headless Chrome:
 *
 *   public/apple-touch-icon.png  180×180, full-bleed (iOS rounds the corners)
 *   public/favicon.ico           32×32 PNG inside an ICO container
 *
 *   npm run icons
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const chrome =
  process.env.CHROME_PATH ||
  [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
  ].find((p) => existsSync(p));
if (!chrome) {
  console.error('[icons] Chrome not found. Set CHROME_PATH.');
  process.exit(1);
}

const svg = readFileSync(join(root, 'public', 'favicon.svg')).toString('base64');

// Draw the SVG into canvases and write the PNG data URLs into the DOM, which
// Chrome prints with --dump-dom.
const html = `<!doctype html><html><body><script>
const img = new Image();
img.onload = () => {
  const out = {};
  for (const [name, size, bleed] of [['touch', 180, true], ['ico', 32, false]]) {
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const g = c.getContext('2d');
    if (bleed) { g.fillStyle = '#1d1b18'; g.fillRect(0, 0, size, size); }
    g.drawImage(img, 0, 0, size, size);
    out[name] = c.toDataURL('image/png');
  }
  const pre = document.createElement('pre');
  pre.id = 'out';
  pre.textContent = JSON.stringify(out);
  document.body.appendChild(pre);
};
img.src = 'data:image/svg+xml;base64,${svg}';
</script></body></html>`;

const dir = mkdtempSync(join(tmpdir(), 'icons-'));
try {
  const page = join(dir, 'icons.html');
  writeFileSync(page, html);
  const r = spawnSync(
    chrome,
    [
      '--headless',
      '--disable-gpu',
      '--no-first-run',
      '--no-default-browser-check',
      `--user-data-dir=${join(dir, 'profile')}`,
      '--virtual-time-budget=3000',
      '--dump-dom',
      pathToFileURL(page).href,
    ],
    { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 },
  );
  const m = r.stdout && r.stdout.match(/<pre id="out">([^<]+)<\/pre>/);
  if (r.status !== 0 || !m) {
    console.error(`[icons] Chrome failed.\n${r.stderr || ''}`);
    process.exit(1);
  }
  const out = JSON.parse(m[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&'));
  const png = (dataUrl) => Buffer.from(dataUrl.split(',')[1], 'base64');

  writeFileSync(join(root, 'public', 'apple-touch-icon.png'), png(out.touch));

  // ICO container with one embedded 32×32 PNG.
  const ico32 = png(out.ico);
  const header = Buffer.alloc(6 + 16);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(1, 4); // one image
  header.writeUInt8(32, 6); // width
  header.writeUInt8(32, 7); // height
  header.writeUInt8(0, 8); // no palette
  header.writeUInt8(0, 9); // reserved
  header.writeUInt16LE(1, 10); // color planes
  header.writeUInt16LE(32, 12); // bits per pixel
  header.writeUInt32LE(ico32.length, 14); // image size
  header.writeUInt32LE(22, 18); // image offset
  writeFileSync(join(root, 'public', 'favicon.ico'), Buffer.concat([header, ico32]));

  console.log('[icons] wrote public/apple-touch-icon.png and public/favicon.ico');
} finally {
  rmSync(dir, { recursive: true, force: true });
}
