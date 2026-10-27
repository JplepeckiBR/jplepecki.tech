import type { APIContext } from 'astro';
import { getPosts } from '../../../lib/content';
import { renderOg, ogResponse } from '../../../lib/og';

export async function getStaticPaths() {
  const posts = await getPosts();
  return posts.map((post) => ({
    params: { slug: post.id },
    props: { post },
  }));
}

export async function GET({ props }: APIContext) {
  const { post } = props as { post: Awaited<ReturnType<typeof getPosts>>[number] };
  const png = await renderOg({
    kicker: 'BLOG',
    title: post.data.title,
    subtitle: post.data.description,
  });
  return ogResponse(png);
}
