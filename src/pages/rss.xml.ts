import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { site } from '../data/profile';
import { getPosts, postHref } from '../lib/posts';

export async function GET(context: APIContext) {
  const posts = await getPosts();
  return rss({
    title: `${site.name} — Writing`,
    description: `Essays and notes by ${site.name} on AI agents, evaluation, and post-training.`,
    site: context.site ?? site.url,
    trailingSlash: true,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: postHref(post),
      categories: post.data.tags,
    })),
    xmlns: { atom: 'http://www.w3.org/2005/Atom' },
    customData: `<language>en-us</language><atom:link href="${new URL('/rss.xml', context.site ?? site.url).href}" rel="self" type="application/rss+xml"/>`,
  });
}
