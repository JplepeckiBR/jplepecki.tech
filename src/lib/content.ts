// Shared content queries. Centralizes draft-filtering and sorting so pages stay
// thin and the rules (hide drafts in prod, newest-first, etc.) live in one place.
import { getCollection, type CollectionEntry } from 'astro:content';

const isProd = import.meta.env.PROD;

/** Projects, drafts hidden in prod, sorted by `order` then start date desc. */
export async function getProjects(): Promise<CollectionEntry<'projects'>[]> {
  const all = await getCollection('projects', ({ data }) => !isProd || !data.draft);
  return all.sort((a, b) => {
    if (a.data.order !== b.data.order) return a.data.order - b.data.order;
    return b.data.startDate.getTime() - a.data.startDate.getTime();
  });
}

/** Blog posts, drafts hidden in prod, newest first. */
export async function getPosts(): Promise<CollectionEntry<'blog'>[]> {
  const all = await getCollection('blog', ({ data }) => !isProd || !data.draft);
  return all.sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());
}

/** Videos, drafts hidden in prod, newest first. */
export async function getVideos(): Promise<CollectionEntry<'videos'>[]> {
  const all = await getCollection('videos', ({ data }) => !isProd || !data.draft);
  return all.sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());
}

/** Posts that reference a given project slug. */
export async function getRelatedPosts(projectId: string): Promise<CollectionEntry<'blog'>[]> {
  const posts = await getPosts();
  return posts.filter((p) => p.data.project?.id === projectId);
}

/** Videos that reference a given project slug. */
export async function getProjectVideos(projectId: string): Promise<CollectionEntry<'videos'>[]> {
  const vids = await getVideos();
  return vids.filter((v) => v.data.project?.id === projectId);
}
