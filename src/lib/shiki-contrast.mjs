/**
 * Shiki transformer: nudges token colors until they reach WCAG AA (4.5:1)
 * against this site's code-block backgrounds, in both themes. Works with
 * dual themes rendered as CSS variables (--shiki-light / --shiki-dark).
 */
const BACKGROUNDS = { light: '#f2eee6', dark: '#24211d' };
const MIN_RATIO = 4.6;

const parse = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const toHex = (rgb) => '#' + rgb.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');

function luminance([r, g, b]) {
  const f = (c) => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

function ratio(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const cache = new Map();

function adjust(hex, mode) {
  const key = `${mode}:${hex}`;
  if (cache.has(key)) return cache.get(key);
  const bg = parse(BACKGROUNDS[mode]);
  const target = mode === 'light' ? [0, 0, 0] : [255, 255, 255];
  let rgb = parse(hex);
  for (let i = 0; i < 60 && ratio(rgb, bg) < MIN_RATIO; i++) {
    rgb = rgb.map((v, j) => v + (target[j] - v) * 0.06);
  }
  const out = toHex(rgb);
  cache.set(key, out);
  return out;
}

export function shikiContrast() {
  return {
    name: 'site:contrast',
    span(node) {
      const style = node.properties && node.properties.style;
      if (typeof style !== 'string') return;
      node.properties.style = style.replace(
        /--shiki-(light|dark):\s*(#[0-9a-fA-F]{6})\b/g,
        (_, mode, color) => `--shiki-${mode}:${adjust(color.toLowerCase(), mode)}`,
      );
    },
  };
}
