import type { APIRoute, GetStaticPaths } from 'astro';
import { getSiteCollections, optionalVisitorText, postSeriesLabel, type Post } from '../../lib/content';
import { ogResponse, renderOg } from '../../lib/og';

interface Props { post: Post }

export const getStaticPaths = (async () => {
  const { posts } = await getSiteCollections();
  return posts.map((post) => {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(post.data.slug) || post.data.slug === 'default') {
      throw new Error(`Post slug "${post.data.slug}" cannot be used for an Open Graph image`);
    }
    return { params: { slug: post.data.slug }, props: { post } };
  });
}) satisfies GetStaticPaths;

export const GET: APIRoute<Props> = async ({ props }) => {
  const series = postSeriesLabel(props.post);
  return ogResponse(await renderOg({
    kicker: series?.toUpperCase() ?? 'LAB NOTEBOOK',
    title: props.post.data.title,
    subtitle: optionalVisitorText(props.post.data.excerpt),
  }));
};
