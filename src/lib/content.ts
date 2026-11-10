import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'posts'>;
export type Loop = CollectionEntry<'loops'>;
export type Project = CollectionEntry<'projects'>;
export type DailyTarget = CollectionEntry<'dailyTargets'>;
export type ShippedContent = CollectionEntry<'content'>;
type Readme = CollectionEntry<'readme'>;

interface SiteCollections {
  posts: Post[];
  loops: Loop[];
  dailyTargets: DailyTarget[];
  projects: Project[];
  content: ShippedContent[];
  readme: Readme[];
}

const PLANNING_FIXTURE_SLUG = 'planning-the-setup';
const KNOWN_FILTER_FIXTURES = new Set(['fixture-draft-filter-sentinel', 'fixture-published-post']);
let collectionPromise: Promise<SiteCollections> | undefined;

export interface LoopMetrics {
  day: number;
  length: number;
}

export function containsPlaceholder(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  const text = value.trim();
  return /TODO(?:\(JP\))?/i.test(text) || /^\[[^\]]+\]$/.test(text);
}

export function optionalVisitorText(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const text = value.trim();
  return text && !containsPlaceholder(text) ? text : undefined;
}

function preparePost(post: Post): Post {
  return {
    ...post,
    data: {
      ...post.data,
      blocks: post.data.blocks.filter(
        (block) => !(block.type === 'youtube' && block.videoId === '00000000000'),
      ),
    },
  };
}

export function visitorPosts(posts: Post[]): Post[] {
  return posts.filter((post) => {
    const { slug, title } = post.data;
    if (!slug || !title || containsPlaceholder(title)) return false;
    if (slug === PLANNING_FIXTURE_SLUG) return true;
    if (KNOWN_FILTER_FIXTURES.has(slug)) return false;
    return !/^fixture(?:-|\s)/i.test(slug) && !/^fixture\s/i.test(title);
  });
}

function dateValue(value?: string): number {
  if (!value) return Number.NEGATIVE_INFINITY;
  const parsed = Date.parse(`${value}T00:00:00Z`);
  return Number.isFinite(parsed) ? parsed : Number.NEGATIVE_INFINITY;
}

export function sortPostsNewestFirst(posts: Post[]): Post[] {
  const sortValue = (post: Post) =>
    post.data.publishedDate
      ? dateValue(post.data.publishedDate)
      : post.data.inProgress
        ? Number.POSITIVE_INFINITY
        : Number.NEGATIVE_INFINITY;

  return [...posts].sort((a, b) => {
    const aDate = sortValue(a);
    const bDate = sortValue(b);
    if (aDate !== bDate) return bDate - aDate;
    if (a.data.inProgress !== b.data.inProgress) return a.data.inProgress ? -1 : 1;
    return a.data.title.localeCompare(b.data.title);
  });
}

export function formatDate(value?: string, fallback?: string): string | undefined {
  if (!value) return fallback;
  const date = new Date(`${value}T00:00:00Z`);
  if (!Number.isFinite(date.getTime())) return fallback;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

function dateOnlyInNewYork(now: Date): number {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const read = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value ?? 0);
  return Date.UTC(read('year'), read('month') - 1, read('day'));
}

function isoDateValue(value?: string): number | undefined {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const parsed = Date.parse(`${value}T00:00:00Z`);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function loopMetrics(loop?: Loop, now = new Date()): LoopMetrics | undefined {
  const start = isoDateValue(loop?.data.startDate);
  const end = isoDateValue(loop?.data.endDate);
  if (start === undefined || end === undefined || end < start) return undefined;

  const length = Math.floor((end - start) / 86_400_000) + 1;
  const elapsed = Math.floor((dateOnlyInNewYork(now) - start) / 86_400_000) + 1;
  return { day: Math.min(length, Math.max(1, elapsed)), length };
}

export function loopNumber(loop: Loop | undefined, loops: Loop[]): number | undefined {
  if (!loop) return undefined;
  const ordered = [...loops].sort((a, b) => {
    const byDate = dateValue(a.data.startDate) - dateValue(b.data.startDate);
    return byDate || a.data.name.localeCompare(b.data.name);
  });
  const index = ordered.findIndex((candidate) => candidate.data.notionId === loop.data.notionId);
  return index >= 0 ? index + 1 : undefined;
}

function textFromRichText(spans: Array<{ text?: string }> | undefined): string {
  return spans?.map((span) => span.text ?? '').join(' ') ?? '';
}

function blockText(block: Post['data']['blocks'][number]): string {
  const values: string[] = [];
  if ('richText' in block) values.push(textFromRichText(block.richText));
  if (block.type === 'toggle') {
    values.push(textFromRichText(block.summary), ...block.children.map(blockText));
  }
  if (block.type === 'bulletedList' || block.type === 'numberedList') {
    for (const item of block.items) {
      values.push(textFromRichText(item.richText), ...item.children.map(blockText));
    }
  }
  if (block.type === 'code') values.push(block.code, block.caption ?? '');
  return values.join(' ');
}

export function readingMinutes(post: Post): number {
  const body = post.data.blocks.map(blockText).join(' ');
  const words = `${post.data.title} ${post.data.excerpt ?? ''} ${body}`
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
}

export function postSeriesLabel(post: Post): string | undefined {
  const series = optionalVisitorText(post.data.series);
  const part = Number.isFinite(post.data.part) ? `Part ${post.data.part}` : undefined;
  return [series, part].filter(Boolean).join(' · ') || undefined;
}

export function projectPostHref(project: Project): string {
  return `/posts?project=${encodeURIComponent(project.data.slug)}`;
}

function projectForLoop(loop: Loop | undefined, projects: Project[]): Project | undefined {
  if (!loop) return undefined;
  return projects.find((project) => loop.data.projectIds.includes(project.data.notionId));
}

function currentPostForLoop(loop: Loop | undefined, posts: Post[]): Post | undefined {
  if (!loop) return undefined;
  return sortPostsNewestFirst(
    posts.filter((post) => post.data.loopIds.includes(loop.data.notionId)),
  )[0];
}

async function loadCollections(): Promise<SiteCollections> {
  const [posts, loops, dailyTargets, projects, content, readme] = await Promise.all([
    getCollection('posts'),
    getCollection('loops'),
    getCollection('dailyTargets'),
    getCollection('projects'),
    getCollection('content'),
    getCollection('readme'),
  ]);

  return {
    posts: posts.map(preparePost),
    loops,
    dailyTargets,
    projects,
    content,
    readme,
  };
}

function collections(): Promise<SiteCollections> {
  collectionPromise ??= loadCollections().catch((error) => {
    collectionPromise = undefined;
    throw error;
  });
  return collectionPromise;
}

export async function getSiteCollections(): Promise<SiteCollections> {
  const loaded = await collections();
  return {
    ...loaded,
    posts: sortPostsNewestFirst(visitorPosts(loaded.posts)),
  };
}

export async function getHomeData() {
  const loaded = await getSiteCollections();
  const currentLoop = loaded.loops.find((loop) => loop.data.isCurrent);
  const metrics = loopMetrics(currentLoop);
  const number = loopNumber(currentLoop, loaded.loops);
  const project = projectForLoop(currentLoop, loaded.projects);
  const currentPost = currentPostForLoop(currentLoop, loaded.posts);
  const targets = currentLoop && metrics
    ? loaded.dailyTargets.filter(
        (target) =>
          target.data.day === metrics.day &&
          target.data.loopIds.includes(currentLoop.data.notionId),
      )
    : [];
  const shippedPosts = currentLoop
    ? loaded.content.filter(
        (entry) =>
          entry.data.loopIds.includes(currentLoop.data.notionId) &&
          entry.data.format?.toLowerCase() === 'post' &&
          /^(published|shipped)$/i.test(entry.data.status ?? ''),
      ).length
    : 0;

  return {
    ...loaded,
    currentLoop,
    metrics,
    loopNumber: number,
    project,
    currentPost,
    targets,
    shippedPosts,
  };
}

export function seriesNeighbors(post: Post, posts: Post[]) {
  const series = post.data.series;
  if (!series || !Number.isFinite(post.data.part)) return {};
  const entries = posts
    .filter((candidate) => candidate.data.series === series && Number.isFinite(candidate.data.part))
    .sort((a, b) => (a.data.part ?? 0) - (b.data.part ?? 0));
  const index = entries.findIndex((candidate) => candidate.data.slug === post.data.slug);
  return {
    previous: index > 0 ? entries[index - 1] : undefined,
    next: index >= 0 && index < entries.length - 1 ? entries[index + 1] : undefined,
  };
}

export function relatedProjectSlugs(post: Post, projects: Project[]): string[] {
  return projects
    .filter((project) => post.data.projectIds.includes(project.data.notionId))
    .map((project) => project.data.slug);
}
