import { getCollection, type CollectionEntry } from 'astro:content';
import { selectedWork } from '../data/profile';

export type WorkEntry = CollectionEntry<'work'> & { text: string };

/**
 * Case studies in the order of `selectedWork` (src/data/profile.ts), each with
 * its one-line summary for the home page. Fails the build if the two disagree.
 */
export async function getWork(): Promise<WorkEntry[]> {
  const entries = await getCollection('work');
  const byId = new Map(entries.map((e) => [e.id, e]));
  const listed = new Set(selectedWork.map((w) => w.slug));
  const unlisted = entries.filter((e) => !listed.has(e.id)).map((e) => e.id);
  if (unlisted.length > 0) {
    throw new Error(`Add these case studies to selectedWork in src/data/profile.ts: ${unlisted.join(', ')}`);
  }
  return selectedWork.map((w) => {
    const entry = byId.get(w.slug);
    if (!entry) throw new Error(`selectedWork in src/data/profile.ts names a missing case study: ${w.slug}`);
    return Object.assign(entry, { text: w.text });
  });
}

export const workHref = (entry: CollectionEntry<'work'>): string => `/work/${entry.id}/`;
