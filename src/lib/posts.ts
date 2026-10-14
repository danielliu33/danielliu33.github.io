import { getCollection, type CollectionEntry } from 'astro:content';
import { hasWritingFiles, isInDraftsDir } from './published-posts.mjs';

export type Post = CollectionEntry<'writing'>;

/** A post is a draft if it says `draft: true` or lives in the private drafts/ folder. */
export const isDraft = (post: Post): boolean => post.data.draft || isInDraftsDir(post.id);

/**
 * Posts that should appear on the site, newest first.
 * Production builds drop drafts (both kinds); the dev server shows them, labelled.
 */
export async function getPosts(): Promise<Post[]> {
  // Skip the lookup (and Astro's "collection is empty" warning) when there are no post files.
  if (!hasWritingFiles({ includeDrafts: !import.meta.env.PROD })) return [];
  const posts = await getCollection('writing', (post) => (import.meta.env.PROD ? !isDraft(post) : true));
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export const postHref = (post: Post): string => `/writing/${post.id}/`;

export const tagSlug = (tag: string): string =>
  tag
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export const tagHref = (tag: string): string => `/writing/tags/${tagSlug(tag)}/`;

/** Minutes to read, from the raw Markdown body (code blocks and markup stripped). */
export function readingMinutes(body: string = ''): number {
  const text = body
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/\$\$[\s\S]*?\$\$/g, ' ')
    .replace(/(?<!\\)\$[^$\n]+\$/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[#>*_`[\]()!|-]/g, ' ');
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 230));
}

/** Post dates show year and month only: "2026 Oct" in lists. */
export function formatMonth(date: Date): string {
  const month = date.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' });
  return `${date.getUTCFullYear()} ${month}`;
}

/** "October 2026", for the post page. */
export function formatMonthLong(date: Date): string {
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', timeZone: 'UTC' });
}

/** Machine-readable month for <time datetime>: "2026-10". */
export const isoMonth = (date: Date): string => date.toISOString().slice(0, 7);
