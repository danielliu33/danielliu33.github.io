import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';
import { site, links } from '../data/profile';
import { getPosts, postHref } from '../lib/posts';

/** Plain-text overview for people who paste this site into an LLM (https://llmstxt.org). */
export async function GET(context: APIContext) {
  const abs = (path: string) => new URL(path, context.site).href;
  const work = (await getCollection('work')).sort((a, b) => a.data.order - b.data.order);
  const posts = await getPosts();

  const lines = [
    `# ${site.name}`,
    '',
    `> ${site.metaDescription}`,
    '',
    site.shortBio,
    '',
    '## Pages',
    '',
    `- [About](${abs('/about/')}): background, focus areas, education and research`,
    `- [Résumé](${abs('/resume/')}): one-page résumé (PDF: ${abs(links.resumePdf)})`,
    `- [LinkedIn](${links.linkedin})`,
    '',
    '## Selected work',
    '',
    ...work.map((w) => `- [${w.data.title}](${abs(`/work/${w.id}/`)}): ${w.data.one_liner}`),
  ];

  if (posts.length > 0) {
    lines.push('', '## Writing', '', ...posts.map((p) => `- [${p.data.title}](${abs(postHref(p))}): ${p.data.description}`));
  }

  return new Response(lines.join('\n') + '\n', {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
