import type { Loader } from 'astro/loaders';
import { deriveBuildLog } from './build-log';
import { normalizePageBlocks, tableOfContents } from './blocks';
import {
  checkboxProperty,
  dateProperty,
  filesProperty,
  multiSelectProperty,
  numberProperty,
  pageCover,
  relationProperty,
  selectProperty,
  textProperty,
  titleProperty,
} from './properties';
import { normalizeReadme } from './readme';
import { loadNotionSource, type PipelineLogger, type RawRecord } from './source';
import type {
  DailyTargetEntry,
  LoopEntry,
  LoopStage,
  NotionDataset,
  PostEntry,
  ProjectEntry,
  ShippedContentEntry,
  SiteStatus,
} from './types';

let datasetPromise: Promise<NotionDataset> | undefined;

function requiredText(value: string | undefined, context: string): string {
  if (!value) throw new Error(`${context} must not be empty`);
  return value;
}

function slugify(value: string): string {
  const slug = value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  if (!slug) throw new Error(`Could not create a public slug from "${value}"`);
  return slug;
}

function pageContext(sourceName: string, page: RawRecord): string {
  return `${sourceName} page ${typeof page.id === 'string' ? page.id : '(missing id)'}`;
}

function includeDrafts(): boolean {
  const viteEnvironment = import.meta.env as Record<string, string | undefined>;
  const enabled = (viteEnvironment.INCLUDE_DRAFTS ?? process.env.INCLUDE_DRAFTS)?.trim().toLowerCase() === 'true';
  const cloudflare = viteEnvironment.CF_PAGES ?? process.env.CF_PAGES;
  if (enabled && cloudflare) throw new Error('INCLUDE_DRAFTS=true is forbidden when CF_PAGES is set');
  return enabled;
}

function assertNoRetainedNotionUrls(dataset: NotionDataset): void {
  const serialized = JSON.stringify(dataset);
  const match = /notion\.so|notion\.site|notionusercontent\.com|notion-static\.com|prod-files-secure/i.exec(serialized);
  if (match) throw new Error(`Normalized content retained a forbidden Notion host (${match[0]})`);
}

function validateFixtureCoverage(dataset: NotionDataset): void {
  const planning = dataset.posts.find((post) => post.title === 'Planning the setup');
  if (planning) {
    const blockTypes = new Set(planning.blocks.map((block) => block.type));
    for (const required of ['receipt', 'plantStakes', 'table'] as const) {
      if (!blockTypes.has(required)) throw new Error(`Fixture post "Planning the setup" must include a ${required} block`);
    }
    if (planning.series !== 'Smart Vivarium' || planning.part !== 1 || !planning.inProgress) {
      throw new Error('Fixture post "Planning the setup" must be Smart Vivarium part 1 and In progress');
    }
    if (planning.buildLog.length === 0) throw new Error('Fixture post "Planning the setup" must include a BuildLog derived from Daily targets');
  }
  if (!dataset.loops.length || !dataset.dailyTargets.length || !dataset.projects.length || !dataset.content.length) {
    throw new Error('Fixture must exercise loops, daily targets, projects, and content');
  }
  if (!dataset.readme[0]?.loopNotes.length || !dataset.readme[0]?.changelog.length) {
    throw new Error('Fixture README must exercise The loop notes and Framework changelog');
  }
}

async function buildDataset(logger: PipelineLogger): Promise<NotionDataset> {
  const source = await loadNotionSource(logger);
  const loops: LoopEntry[] = source.dataSources.loops.pages.map((page) => {
    const context = pageContext(source.dataSources.loops.name, page);
    const dates = dateProperty(page, 'Dates');
    const stageValue = selectProperty(page, 'Stage');
    const allowedStages = new Set<LoopStage>(['Ask', 'Study', 'Build', 'Ship']);
    if (stageValue && !allowedStages.has(stageValue as LoopStage)) {
      throw new Error(`${context} property "Stage" has unsupported value "${stageValue}"`);
    }
    const status = selectProperty(page, 'Status');
    return {
      notionId: requiredText(page.id, `${context} id`),
      name: requiredText(titleProperty(page, 'Name'), `${context} property "Name"`),
      startDate: dates.start,
      endDate: dates.end,
      status,
      stage: stageValue as LoopStage | undefined,
      goal: textProperty(page, 'Goal'),
      postTarget: numberProperty(page, 'Post target'),
      projectIds: relationProperty(page, 'Project'),
      isCurrent: status === 'In progress',
    };
  });
  const currentLoops = loops.filter((loop) => loop.isCurrent);
  if (currentLoops.length > 1) {
    throw new Error(`Loops data source contains ${currentLoops.length} entries with Status "In progress"; expected at most one`);
  }

  // "Day" may be a day number, or a calendar date counted from the linked loop's start (day 1 = start date).
  const loopStarts = new Map(loops.map((loop) => [loop.notionId, loop.startDate]));
  const dayNumber = (page: RawRecord, loopIds: string[]): number | undefined => {
    const number = numberProperty(page, 'Day');
    if (number !== undefined) return number;
    const date = dateProperty(page, 'Day').start?.slice(0, 10);
    const start = loopIds.map((id) => loopStarts.get(id)).find(Boolean)?.slice(0, 10);
    if (!date || !start) return undefined;
    return Math.round((Date.parse(`${date}T00:00:00Z`) - Date.parse(`${start}T00:00:00Z`)) / 86_400_000) + 1;
  };

  const dailyTargets: DailyTargetEntry[] = [];
  for (const page of source.dataSources.dailyTargets.pages) {
    const context = pageContext(source.dataSources.dailyTargets.name, page);
    const loopIds = relationProperty(page, 'Loop');
    const day = dayNumber(page, loopIds);
    if (!Number.isInteger(day) || (day ?? 0) < 1) {
      // A target without a usable day (no date, no loop, or dated before the loop) is skipped, not fatal,
      // so one incomplete Notion row cannot stop the hourly production rebuild.
      logger.warn(`${context} skipped: "Day" is empty, unlinked to a loop, or before the loop start`);
      continue;
    }
    dailyTargets.push({
      notionId: requiredText(page.id, `${context} id`),
      task: requiredText(titleProperty(page, 'Task'), `${context} property "Task"`),
      done: checkboxProperty(page, 'Done'),
      day: day as number,
      kpi: textProperty(page, 'KPI') ?? selectProperty(page, 'KPI'),
      loopIds,
    });
  }

  const projects: ProjectEntry[] = [];
  for (const page of source.dataSources.projects.pages) {
    const context = pageContext(source.dataSources.projects.name, page);
    const name = requiredText(titleProperty(page, 'Name'), `${context} property "Name"`);
    projects.push({
      notionId: requiredText(page.id, `${context} id`),
      name,
      slug: slugify(name),
      status: selectProperty(page, 'Status'),
      whatItIs: textProperty(page, 'What it is'),
      nextAction: textProperty(page, 'Next action'),
      cover: await pageCover(page, `${name} project cover`, `${context} cover`),
    });
  }

  const content: ShippedContentEntry[] = source.dataSources.content.pages.map((page) => {
    const context = pageContext(source.dataSources.content.name, page);
    return {
      notionId: requiredText(page.id, `${context} id`),
      title: requiredText(titleProperty(page, 'Title'), `${context} property "Title"`),
      status: selectProperty(page, 'Status'),
      format: selectProperty(page, 'Format'),
      publishDate: dateProperty(page, 'Publish date').start,
      loopIds: relationProperty(page, 'Loop'),
    };
  });

  const posts: PostEntry[] = [];
  const slugs = new Set<string>();
  for (const page of source.dataSources.posts.pages) {
    const context = pageContext(source.dataSources.posts.name, page);
    const title = requiredText(titleProperty(page, 'Title'), `${context} property "Title"`);
    // An empty "Site status" means the note was never marked for the site: treat it as a draft.
    const siteStatus = selectProperty(page, 'Site status') ?? 'Draft';
    if (!['Draft', 'In progress', 'Published'].includes(siteStatus)) {
      throw new Error(`${context} property "Site status" must be Draft, In progress, or Published`);
    }
    if (siteStatus === 'Draft' && !includeDrafts()) continue;

    const slug = requiredText(textProperty(page, 'Slug'), `${context} property "Slug"`);
    if (slugs.has(slug)) throw new Error(`${context} property "Slug" duplicates "${slug}"`);
    slugs.add(slug);

    const heroImages = await filesProperty(page, 'Hero', `${title} hero image`, `${context} Hero`);
    const blocks = await normalizePageBlocks(page, title, source, logger);
    const loopIds = relationProperty(page, 'Loop');
    const loop = loops.find((candidate) => loopIds.includes(candidate.notionId));
    const buildLog = deriveBuildLog(loop, dailyTargets);
    if (loopIds.length > 0 && !loop) logger.warn(`${context} links to a loop that was not returned by the Loops data source`);

    posts.push({
      notionId: requiredText(page.id, `${context} id`),
      title,
      slug,
      siteStatus: siteStatus as SiteStatus,
      inProgress: siteStatus === 'In progress',
      publishedDate: dateProperty(page, 'Published date').start,
      series: selectProperty(page, 'Series'),
      part: numberProperty(page, 'Part'),
      excerpt: textProperty(page, 'Excerpt'),
      hero: heroImages[0],
      status: selectProperty(page, 'Status'),
      topics: multiSelectProperty(page, 'Topics'),
      projectIds: relationProperty(page, 'Projects'),
      workIds: relationProperty(page, 'Work'),
      loopIds,
      blocks,
      contents: tableOfContents(blocks),
      buildLog,
      buildLogSource: buildLog.length > 0
        ? source.mode === 'fixture'
          ? 'fixture sample schedule · not published content'
          : 'daily targets from Lab Loop HQ'
        : undefined,
    });
  }

  const publicProjectIds = new Set([
    ...loops.flatMap((loop) => loop.projectIds),
    ...posts.flatMap((post) => post.projectIds),
  ]);
  const publicProjects = projects.filter((project) => publicProjectIds.has(project.notionId));
  if (publicProjects.length < projects.length) {
    logger.info(`Omitted ${projects.length - publicProjects.length} project(s) not linked from a loop or included post`);
  }

  const dataset: NotionDataset = {
    posts,
    loops,
    dailyTargets,
    projects: publicProjects,
    content,
    readme: [await normalizeReadme(source, logger)],
  };
  assertNoRetainedNotionUrls(dataset);
  if (source.mode === 'fixture') validateFixtureCoverage(dataset);
  return dataset;
}

function getDataset(logger: PipelineLogger): Promise<NotionDataset> {
  datasetPromise ??= buildDataset(logger).catch((error) => {
    datasetPromise = undefined;
    throw error;
  });
  return datasetPromise;
}

export function notionCollectionLoader(collection: keyof NotionDataset): Loader {
  return {
    name: `notion-${collection}`,
    async load({ store, parseData, generateDigest, logger }) {
      store.clear();
      const dataset = await getDataset(logger);
      const filePath = 'src/content/notion.json';
      const entries = dataset[collection];
      for (const entry of entries) {
        const id = collection === 'posts' ? (entry as PostEntry).slug : entry.notionId;
        const data = await parseData({ id, data: entry as unknown as Record<string, unknown>, filePath });
        store.set({ id, data, filePath, digest: generateDigest(data) });
      }
      logger.info(`Stored ${entries.length} ${collection} entr${entries.length === 1 ? 'y' : 'ies'}`);
    },
  };
}
