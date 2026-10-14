// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { unified, rehypeHeadingIds } from '@astrojs/markdown-remark';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { rehypeHeadingAnchors } from './src/lib/rehype-heading-anchors.mjs';
import { remarkMathExtras } from './src/lib/remark-math-extras.mjs';
import { hasPublishedPosts } from './src/lib/published-posts.mjs';
import { shikiContrast } from './src/lib/shiki-contrast.mjs';
import { legacyPages } from './src/lib/legacy-redirects.mjs';

const writingIsLive = hasPublishedPosts();

// Pages that are never in the sitemap: the CV print source (noindex) and the
// redirect pages for old URLs.
const unlisted = ['/404/', '/cv/', ...Object.keys(legacyPages)];

export default defineConfig({
  site: 'https://danielliu33.github.io',
  trailingSlash: 'always',
  build: { format: 'directory' },
  devToolbar: { enabled: false },
  // Static redirect pages (meta refresh + canonical + noindex) for old URLs.
  redirects: legacyPages,
  integrations: [
    mdx(),
    sitemap({
      // Keep the empty Writing section out of the sitemap until a post is published.
      filter: (page) => {
        const path = new URL(page).pathname;
        return !unlisted.includes(path) && (writingIsLive || !path.startsWith('/writing/'));
      },
    }),
  ],
  markdown: {
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
      // Colors are applied from CSS variables, so code follows the light/dark color scheme.
      defaultColor: false,
      transformers: [shikiContrast()],
    },
    processor: unified({
      // Obsidian-style math: $…$ and $$…$$ inline, $$…$$ alone (one line or fenced) as display.
      // Write a literal dollar sign as \$ (e.g. \$5).
      remarkPlugins: [remarkMath, remarkMathExtras],
      // Heading ids come from the raw TeX, before KaTeX expands it.
      rehypePlugins: [rehypeHeadingIds, rehypeKatex, rehypeHeadingAnchors],
    }),
  },
});
