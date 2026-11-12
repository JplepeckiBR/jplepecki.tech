import { readFile } from 'node:fs/promises';
import path from 'node:path';
import NotionSdk from '@notionhq/client';
import type { Client as NotionClient } from '@notionhq/client';

const { Client } = NotionSdk;
const viteEnvironment = import.meta.env as Record<string, string | undefined>;

function environment(name: string): string | undefined {
  return viteEnvironment[name] ?? process.env[name];
}

export type DataSourceKey = 'posts' | 'loops' | 'dailyTargets' | 'projects' | 'content';
export type RawRecord = Record<string, any>;

export interface PipelineLogger {
  info(message: string): void;
  warn(message: string): void;
}

interface SourceDataSource {
  name: string;
  properties: RawRecord;
  pages: RawRecord[];
}

export interface NotionSource {
  mode: 'fixture' | 'live';
  dataSources: Record<DataSourceKey, SourceDataSource>;
  readmeId: string;
  readmeBlocks?: RawRecord[];
  getPageBlocks(page: RawRecord): Promise<RawRecord[]>;
  getBlockChildren(blockId: string, embedded?: RawRecord[]): Promise<RawRecord[]>;
}

const PROPERTY_REQUIREMENTS: Record<DataSourceKey, Record<string, string | string[]>> = {
  posts: {
    Title: 'title',
    Slug: 'rich_text',
    'Site status': 'select',
    'Published date': 'date',
    Series: 'select',
    Part: 'number',
    Excerpt: 'rich_text',
    Hero: 'files',
  },
  loops: {
    Name: 'title',
    Dates: 'date',
    Status: ['status', 'select'],
    Stage: 'select',
    Goal: 'rich_text',
    'Post target': 'number',
    Project: 'relation',
  },
  dailyTargets: {
    Task: 'title',
    Done: 'checkbox',
    Day: ['number', 'date'],
    KPI: ['rich_text', 'select'],
    Loop: 'relation',
  },
  projects: {
    Name: 'title',
    Status: ['status', 'select'],
    'What it is': 'rich_text',
    'Next action': 'rich_text',
    'On site': 'checkbox',
    Loops: 'relation',
  },
  content: {
    Title: 'title',
    Status: ['status', 'select'],
    Format: 'select',
    'Publish date': 'date',
    Loop: 'relation',
    Project: 'relation',
    Link: 'url',
  },
};

const ENV_IDS: Record<DataSourceKey, string> = {
  posts: 'NOTION_DS_STUDIES',
  loops: 'NOTION_DS_LOOPS',
  dailyTargets: 'NOTION_DS_DAILY_TARGETS',
  projects: 'NOTION_DS_PROJECTS',
  content: 'NOTION_DS_CONTENT',
};

const DISPLAY_NAMES: Record<DataSourceKey, string> = {
  posts: 'Studies & Blog',
  loops: 'Loops',
  dailyTargets: 'Daily targets',
  projects: 'Projects',
  content: 'Content',
};

function cleanPlainText(value: unknown): string {
  return Array.isArray(value)
    ? value.map((item) => (typeof item?.plain_text === 'string' ? item.plain_text : '')).join('').trim()
    : '';
}

function validateSchema(key: DataSourceKey, source: SourceDataSource): void {
  for (const [propertyName, expectedType] of Object.entries(PROPERTY_REQUIREMENTS[key])) {
    const property = source.properties[propertyName];
    const actualType = typeof property?.type === 'string' ? property.type : 'missing';
    const expectedTypes = Array.isArray(expectedType) ? expectedType : [expectedType];
    if (!expectedTypes.includes(actualType)) {
      throw new Error(
        `Notion data source "${source.name}" property "${propertyName}" expected type ${expectedTypes.map((type) => `"${type}"`).join(' or ')}, got "${actualType}"`,
      );
    }
  }
}

function requireEnvironment(name: string): string {
  const value = environment(name)?.trim();
  if (!value) throw new Error(`Missing required environment variable ${name} for live Notion loading`);
  return value;
}

async function paginateQuery(client: NotionClient, dataSourceId: string): Promise<RawRecord[]> {
  const results: RawRecord[] = [];
  let startCursor: string | undefined;
  do {
    const response = await client.dataSources.query({
      data_source_id: dataSourceId,
      page_size: 100,
      start_cursor: startCursor,
      result_type: 'page',
    });
    for (const result of response.results) {
      if (result.object === 'page' && 'properties' in result) results.push(result as RawRecord);
    }
    startCursor = response.has_more ? (response.next_cursor ?? undefined) : undefined;
  } while (startCursor);
  return results;
}

async function paginateChildren(client: NotionClient, blockId: string): Promise<RawRecord[]> {
  const results: RawRecord[] = [];
  let startCursor: string | undefined;
  do {
    const response = await client.blocks.children.list({
      block_id: blockId,
      page_size: 100,
      start_cursor: startCursor,
    });
    for (const result of response.results) {
      if ('type' in result) results.push(result as RawRecord);
    }
    startCursor = response.has_more ? (response.next_cursor ?? undefined) : undefined;
  } while (startCursor);
  return results;
}

async function loadLiveSource(token: string, logger: PipelineLogger): Promise<NotionSource> {
  const client = new Client({ auth: token, notionVersion: '2025-09-03' });
  const dataSources = {} as Record<DataSourceKey, SourceDataSource>;
  for (const key of Object.keys(ENV_IDS) as DataSourceKey[]) {
    const id = requireEnvironment(ENV_IDS[key]);
    const response = (await client.dataSources.retrieve({ data_source_id: id })) as RawRecord;
    const name = cleanPlainText(response.title) || DISPLAY_NAMES[key];
    const source = {
      name,
      properties: response.properties ?? {},
      pages: await paginateQuery(client, id),
    };
    validateSchema(key, source);
    dataSources[key] = source;
  }

  logger.info('Loaded content from the live Notion data sources');
  const readmeId = requireEnvironment('NOTION_PAGE_README');
  return {
    mode: 'live',
    dataSources,
    readmeId,
    getPageBlocks: (page) => paginateChildren(client, page.id),
    getBlockChildren: (blockId) => paginateChildren(client, blockId),
  };
}

async function loadFixtureSource(logger: PipelineLogger): Promise<NotionSource> {
  const fixturePath = path.resolve('fixtures/notion.json');
  const fixture = JSON.parse(await readFile(fixturePath, 'utf8')) as RawRecord;
  if (fixture.version !== 1 || !fixture.dataSources || !fixture.readme) {
    throw new Error('fixtures/notion.json must contain version 1 dataSources and readme records');
  }

  const dataSources = {} as Record<DataSourceKey, SourceDataSource>;
  for (const key of Object.keys(PROPERTY_REQUIREMENTS) as DataSourceKey[]) {
    const fixtureSource = fixture.dataSources[key];
    if (!fixtureSource || !Array.isArray(fixtureSource.pages)) {
      throw new Error(`Fixture is missing the ${key} data source`);
    }
    const source = {
      name: fixtureSource.name ?? DISPLAY_NAMES[key],
      properties: fixtureSource.properties ?? {},
      pages: fixtureSource.pages,
    };
    validateSchema(key, source);
    dataSources[key] = source;
  }

  logger.info('NOTION_TOKEN is not set; loaded fixtures/notion.json');
  return {
    mode: 'fixture',
    dataSources,
    readmeId: fixture.readme.id,
    readmeBlocks: Array.isArray(fixture.readme.blocks) ? fixture.readme.blocks : [],
    getPageBlocks: async (page) => (Array.isArray(page.blocks) ? page.blocks : []),
    getBlockChildren: async (_blockId, embedded) => (Array.isArray(embedded) ? embedded : []),
  };
}

export async function loadNotionSource(logger: PipelineLogger): Promise<NotionSource> {
  if (environment('CF_PAGES') && environment('INCLUDE_DRAFTS')?.trim().toLowerCase() === 'true') {
    throw new Error('INCLUDE_DRAFTS=true is forbidden when CF_PAGES is set');
  }
  const token = environment('NOTION_TOKEN')?.trim();
  return token ? loadLiveSource(token, logger) : loadFixtureSource(logger);
}
