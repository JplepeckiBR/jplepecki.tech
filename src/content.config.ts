import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { notionCollectionLoader } from './lib/notion/loader';

const optionalText = z.string().trim().min(1).optional();
const notionId = z.string().trim().min(1);
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const relationIds = z.array(notionId);

const richTextSpan = z.object({
  text: z.string().min(1),
  href: z.string().refine((value) => !/(?:notion\.so|notion\.site|notionusercontent|notion-static|prod-files-secure)/i.test(value), 'Notion URLs are forbidden').optional(),
  bold: z.literal(true).optional(),
  italic: z.literal(true).optional(),
  code: z.literal(true).optional(),
  strikethrough: z.literal(true).optional(),
  underline: z.literal(true).optional(),
});
const richText = z.array(richTextSpan);

const buildLogEntry = z.object({
  date: z.string().min(1),
  dateTime: isoDate,
  status: z.enum(['done', 'today', 'planned']),
  fallbackStatus: z.enum(['done', 'planned']).optional(),
  title: z.string().min(1),
});

const posts = defineCollection({
  loader: notionCollectionLoader('posts'),
  schema: ({ image }) => {
    const localizedImage = z.object({
      asset: image(),
      alt: z.string().trim().min(1),
      caption: optionalText,
    });
    const tableColumn = z.object({
      label: z.string().trim().min(1),
      align: z.enum(['left', 'center', 'right']).optional(),
    });
    const tableRow = z.object({
      cells: z.array(z.string()),
      isMaximum: z.literal(true).optional(),
    });
    const blockSchema: z.ZodType<any> = z.lazy(() => z.discriminatedUnion('type', [
      z.object({ id: notionId, type: z.literal('paragraph'), richText }),
      z.object({ id: notionId, type: z.literal('heading2'), richText, anchor: z.string().min(1) }),
      z.object({ id: notionId, type: z.literal('heading3'), richText, anchor: z.string().min(1) }),
      z.object({
        id: notionId,
        type: z.literal('bulletedList'),
        items: z.array(z.object({ richText, children: z.array(blockSchema) })),
      }),
      z.object({
        id: notionId,
        type: z.literal('numberedList'),
        items: z.array(z.object({ richText, children: z.array(blockSchema) })),
      }),
      z.object({ id: notionId, type: z.literal('quote'), richText }),
      z.object({ id: notionId, type: z.literal('divider') }),
      z.object({ id: notionId, type: z.literal('code'), code: z.string().min(1), language: optionalText, caption: optionalText }),
      z.object({ id: notionId, type: z.literal('image'), image: localizedImage }),
      z.object({
        id: notionId,
        type: z.literal('table'),
        caption: z.string().min(1),
        columns: z.array(tableColumn).min(1),
        rows: z.array(tableRow).min(1),
      }),
      z.object({
        id: notionId,
        type: z.literal('receipt'),
        store: z.string().min(1),
        items: z.array(z.object({ label: z.string().min(1), value: z.string().min(1) })).min(1),
        total: z.object({ label: z.string().min(1), value: z.string().min(1) }),
      }),
      z.object({
        id: notionId,
        type: z.literal('plantStakes'),
        stakes: z.array(z.object({ name: z.string().min(1), role: optionalText, note: optionalText, price: optionalText })).min(1),
      }),
      z.object({ id: notionId, type: z.literal('marginNote'), image: localizedImage }),
      z.object({ id: notionId, type: z.literal('toggle'), summary: richText, children: z.array(blockSchema) }),
      z.object({ id: notionId, type: z.literal('youtube'), videoId: z.string().regex(/^[A-Za-z0-9_-]{11}$/), title: z.string().min(1) }),
    ]));

    return z.object({
      notionId,
      title: z.string().trim().min(1),
      slug: z.string().trim().min(1),
      siteStatus: z.enum(['Draft', 'In progress', 'Published']),
      inProgress: z.boolean(),
      publishedDate: isoDate.optional(),
      series: optionalText,
      part: z.number().finite().optional(),
      excerpt: optionalText,
      hero: localizedImage.optional(),
      status: optionalText,
      topics: z.array(z.string().min(1)),
      projectIds: relationIds,
      workIds: relationIds,
      loopIds: relationIds,
      blocks: z.array(blockSchema),
      contents: z.array(z.object({ href: z.string().regex(/^#[a-z0-9][a-z0-9_-]*$/), label: z.string().min(1) })),
      buildLog: z.array(buildLogEntry),
      buildLogSource: optionalText,
    });
  },
});

const loops = defineCollection({
  loader: notionCollectionLoader('loops'),
  schema: z.object({
    notionId,
    name: z.string().trim().min(1),
    startDate: isoDate.optional(),
    endDate: isoDate.optional(),
    status: optionalText,
    stage: z.enum(['Ask', 'Study', 'Build', 'Ship']).optional(),
    goal: optionalText,
    postTarget: z.number().finite().optional(),
    projectIds: relationIds,
    isCurrent: z.boolean(),
  }),
});

const dailyTargets = defineCollection({
  loader: notionCollectionLoader('dailyTargets'),
  schema: z.object({
    notionId,
    task: z.string().trim().min(1),
    done: z.boolean(),
    day: z.number().int().positive(),
    kpi: optionalText,
    loopIds: relationIds,
  }),
});

const projects = defineCollection({
  loader: notionCollectionLoader('projects'),
  schema: ({ image }) => z.object({
    notionId,
    name: z.string().trim().min(1),
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    status: optionalText,
    whatItIs: optionalText,
    nextAction: optionalText,
    cover: z.object({ asset: image(), alt: z.string().trim().min(1), caption: optionalText }).optional(),
  }),
});

const content = defineCollection({
  loader: notionCollectionLoader('content'),
  schema: z.object({
    notionId,
    title: z.string().trim().min(1),
    status: optionalText,
    format: optionalText,
    publishDate: isoDate.optional(),
    loopIds: relationIds,
  }),
});

const readme = defineCollection({
  loader: notionCollectionLoader('readme'),
  schema: z.object({
    notionId,
    loopNotes: z.array(z.string().trim().min(1)),
    changelog: z.array(z.object({ date: optionalText, change: z.string().trim().min(1) })),
  }),
});

export const collections = { posts, loops, dailyTargets, projects, content, readme };
