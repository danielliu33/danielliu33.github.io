import { defineCollection } from 'astro:content';
import { glob, type Loader } from 'astro/loaders';
import { z } from 'astro/zod';
import { DRAFTS_DIR, hasWritingFiles } from './lib/published-posts.mjs';

const postsBase = './src/content/writing';
const postsPattern = '**/[^_]*.{md,mdx}';

/**
 * Loads blog posts.
 *
 * - Dev server (it has a file watcher): every post, including the git-ignored
 *   drafts/ folder, so drafts can be previewed (they are labelled "Draft").
 * - Production build (no watcher): drafts/ is never read, so a private draft
 *   cannot reach dist/ even if it lacks `draft: true`. With no post files at
 *   all, loading is skipped (avoids an "empty collection" warning).
 */
function writingLoader(): Loader {
  const dev = glob({ pattern: postsPattern, base: postsBase });
  const prod = glob({ pattern: [postsPattern, `!${DRAFTS_DIR}/**`], base: postsBase });
  return {
    name: 'writing-loader',
    load: async (context) => {
      if (context.watcher) return dev.load(context);
      if (!hasWritingFiles({ includeDrafts: false })) {
        context.store.clear();
        return;
      }
      return prod.load(context);
    },
  };
}

// Case studies ("Selected work").
const work = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/work' }),
  schema: z.object({
    title: z.string(),
    org: z.string(),
    years: z.string(),
    one_liner: z.string(),
    order: z.number(),
  }),
});

// Blog posts. Files in src/content/writing/drafts/ are git-ignored (never committed)
// and never built for production; `draft: true` posts are excluded from production too.
const writing = defineCollection({
  loader: writingLoader(),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    // Lower-case slugs only ("evaluation", "post-training"), so every tag has a valid URL.
    tags: z
      .array(z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Tags must be lower-case slugs, e.g. "post-training".'))
      .default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { work, writing };
