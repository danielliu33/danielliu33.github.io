import type { APIContext } from 'astro';
import { site, links, twitter, bio, papers } from '../data/profile';
import { inlinePlain } from '../lib/inline-links';
import { getPosts, postHref } from '../lib/posts';
import { getWork, workHref } from '../lib/work';

/** Plain-text overview for people who paste this site into an LLM (https://llmstxt.org). */
export async function GET(context: APIContext) {
  const base = context.site ?? site.url;
  const abs = (path: string) => new URL(path, base).href;
  const work = await getWork();
  const posts = await getPosts();

  const lines = [
    `# ${site.name}`,
    '',
    `> ${site.metaDescription}`,
    '',
    ...bio.map((p) => inlinePlain(p, base)).flatMap((p) => [p, '']),
    '## Links',
    '',
    `- [CV (PDF)](${abs(links.cvPdf)})`,
    `- [LinkedIn](${links.linkedin})`,
    ...(twitter ? [`- [Twitter](${twitter.url})`] : []),
    '',
    '## Work',
    '',
    ...work.map((w) => `- [${w.data.title}](${abs(workHref(w))}) (${w.data.years}): ${w.data.one_liner}`),
    '',
    '## Papers & patents',
    '',
    ...papers.map((p) => `- [${p.title}](${p.url}) (${p.year}): ${p.note}`),
  ];

  if (posts.length > 0) {
    lines.push('', '## Writing', '', ...posts.map((p) => `- [${p.data.title}](${abs(postHref(p))}): ${p.data.description}`));
  }

  return new Response(lines.join('\n') + '\n', {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
