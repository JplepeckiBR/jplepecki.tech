import { imageReference, plainText, richText } from './properties';
import { localizeImage } from './images';
import type { NotionSource, PipelineLogger, RawRecord } from './source';
import type { ContentBlock, PlantStakeRecord, RichTextSpan, SerializedImage, TableRow } from './types';

function slugify(value: string, fallback: string): string {
  const slug = value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return slug || fallback;
}

function emojiIcon(block: RawRecord): string | undefined {
  const icon = block.callout?.icon;
  return icon?.type === 'emoji' && typeof icon.emoji === 'string' ? icon.emoji : undefined;
}

function linePairs(text: string): Array<{ label: string; value: string }> {
  return text
    .split(/\r?\n/)
    .map((line) => line.split('│').map((part) => part.trim()))
    .filter((parts) => parts.length === 2 && Boolean(parts[0] && parts[1]))
    .map(([label, value]) => ({ label, value }));
}

function tableRows(blocks: RawRecord[]): string[][] {
  return blocks
    .filter((block) => block.type === 'table_row' && Array.isArray(block.table_row?.cells))
    .map((block) => block.table_row.cells.map((cell: unknown) => plainText(cell) ?? ''));
}

function normalizeTable(id: string, rows: string[][], caption: string): ContentBlock | undefined {
  if (rows.length < 2 || rows[0].length === 0 || rows[0].some((cell) => !cell)) return undefined;
  const columns = rows[0].map((label, index) => ({
    label,
    align: index === 0 ? ('left' as const) : ('right' as const),
  }));
  const normalizedRows: TableRow[] = rows
    .slice(1)
    .filter((cells) => cells.length === columns.length && cells.every(Boolean))
    .map((cells) => ({ cells, isMaximum: /^MAX\b/i.test(cells[0]) || undefined }));
  if (normalizedRows.length === 0) return undefined;
  return { id, type: 'table', caption, columns, rows: normalizedRows };
}

function normalizePlantStakes(rows: string[][]): PlantStakeRecord[] {
  if (rows.length < 2) return [];
  const indexes = Object.fromEntries(rows[0].map((heading, index) => [heading.trim().toLowerCase(), index]));
  if (indexes.name === undefined) return [];
  return rows.slice(1).flatMap((cells) => {
    const name = cells[indexes.name]?.trim();
    if (!name) return [];
    return [{
      name,
      role: indexes.role === undefined ? undefined : cells[indexes.role]?.trim() || undefined,
      note: indexes.note === undefined ? undefined : cells[indexes.note]?.trim() || undefined,
      price: indexes.price === undefined ? undefined : cells[indexes.price]?.trim() || undefined,
    }];
  });
}

function youtubeId(rawUrl: unknown): string | undefined {
  if (typeof rawUrl !== 'string') return undefined;
  try {
    const url = new URL(rawUrl);
    const host = url.hostname.toLowerCase().replace(/^www\./, '');
    const candidate = host === 'youtu.be'
      ? url.pathname.split('/').filter(Boolean)[0]
      : host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtube-nocookie.com'
        ? url.searchParams.get('v') ?? url.pathname.split('/').filter(Boolean).pop()
        : undefined;
    return candidate && /^[A-Za-z0-9_-]{11}$/.test(candidate) ? candidate : undefined;
  } catch {
    return undefined;
  }
}

async function childrenFor(source: NotionSource, block: RawRecord): Promise<RawRecord[]> {
  if (!block.has_children && !Array.isArray(block.children)) return [];
  return source.getBlockChildren(block.id, block.children);
}

async function localizeBlockImage(
  block: RawRecord,
  pageTitle: string,
  context: string,
): Promise<SerializedImage | undefined> {
  const reference = imageReference(block.image ?? {}, `${pageTitle} illustration`);
  return reference ? localizeImage(reference, context) : undefined;
}

async function convertBlock(
  block: RawRecord,
  pageTitle: string,
  source: NotionSource,
  logger: PipelineLogger,
  headingCounts: Map<string, number>,
): Promise<ContentBlock | undefined> {
  const id = typeof block.id === 'string' ? block.id : `${slugify(pageTitle, 'page')}-${String(block.type ?? 'block')}`;
  switch (block.type) {
    case 'paragraph':
      return richText(block.paragraph?.rich_text).length
        ? { id, type: 'paragraph', richText: richText(block.paragraph.rich_text) }
        : undefined;
    case 'heading_2':
    case 'heading_3': { 
      const text = richText(block[block.type]?.rich_text);
      const label = text.map((span) => span.text).join('').trim();
      if (!label) return undefined;
      const base = slugify(label, id.replace(/[^a-zA-Z0-9_-]/g, '-'));
      const count = headingCounts.get(base) ?? 0;
      headingCounts.set(base, count + 1);
      return {
        id,
        type: block.type === 'heading_2' ? 'heading2' : 'heading3',
        richText: text,
        anchor: count === 0 ? base : `${base}-${count + 1}`,
      };
    }
    case 'quote': {
      const text = richText(block.quote?.rich_text);
      return text.length ? { id, type: 'quote', richText: text } : undefined;
    }
    case 'divider':
      return { id, type: 'divider' };
    case 'code': {
      const code = plainText(block.code?.rich_text);
      if (!code) return undefined;
      return {
        id,
        type: 'code',
        code,
        language: typeof block.code?.language === 'string' ? block.code.language : undefined,
        caption: plainText(block.code?.caption),
      };
    }
    case 'image': {
      const image = await localizeBlockImage(block, pageTitle, `${pageTitle}, image block ${id}`);
      return image ? { id, type: 'image', image } : undefined;
    }
    case 'table': {
      const children = await childrenFor(source, block);
      return normalizeTable(id, tableRows(children), `${pageTitle} data table`);
    }
    case 'callout': {
      const icon = emojiIcon(block);
      const children = await childrenFor(source, block);
      if (icon === '🧾') {
        const pairs = linePairs(plainText(block.callout?.rich_text) ?? '');
        const total = pairs.at(-1);
        if (!total || total.label.toUpperCase() !== 'TOTAL' || pairs.length < 2) {
          throw new Error(`${pageTitle}, receipt block ${id}: final line must be TOTAL │ price`);
        }
        return { id, type: 'receipt', store: 'BUILD RECEIPT', items: pairs.slice(0, -1), total };
      }
      if (icon === '🏷️') {
        const table = children.find((child) => child.type === 'table');
        const tableChildren = table ? await childrenFor(source, table) : [];
        const stakes = normalizePlantStakes(tableRows(tableChildren));
        if (stakes.length === 0) throw new Error(`${pageTitle}, plant-stakes block ${id}: expected a child table with Name, Role, Note, Price columns`);
        return { id, type: 'plantStakes', stakes };
      }
      if (icon === '✍️') {
        const imageBlock = children.find((child) => child.type === 'image');
        const image = imageBlock
          ? await localizeBlockImage(imageBlock, pageTitle, `${pageTitle}, margin-note block ${id}`)
          : undefined;
        if (!image) throw new Error(`${pageTitle}, margin-note block ${id}: expected a child image with alt text`);
        return { id, type: 'marginNote', image };
      }
      logger.warn(`Skipping unsupported block on "${pageTitle}": callout (${id})`);
      return undefined;
    }
    case 'toggle': {
      const summary = richText(block.toggle?.rich_text);
      if (summary.length === 0) return undefined;
      const children = await convertBlocks(await childrenFor(source, block), pageTitle, source, logger, headingCounts);
      return { id, type: 'toggle', summary, children };
    }
    case 'video':
    case 'embed': {
      const value = block[block.type];
      const url = value?.type === 'file' ? value.file?.url : value?.type === 'external' ? value.external?.url : value?.url;
      const videoId = youtubeId(url);
      if (!videoId) {
        logger.warn(`Skipping unsupported block on "${pageTitle}": ${block.type} (${id})`);
        return undefined;
      }
      return { id, type: 'youtube', videoId, title: plainText(value?.caption) ?? `${pageTitle} video` };
    }
    default:
      logger.warn(`Skipping unsupported block on "${pageTitle}": ${String(block.type ?? 'unknown')} (${id})`);
      return undefined;
  }
}

async function convertListItem(
  block: RawRecord,
  pageTitle: string,
  source: NotionSource,
  logger: PipelineLogger,
  headingCounts: Map<string, number>,
): Promise<{ richText: RichTextSpan[]; children: ContentBlock[] }> {
  const value = block[block.type];
  return {
    richText: richText(value?.rich_text),
    children: await convertBlocks(await childrenFor(source, block), pageTitle, source, logger, headingCounts),
  };
}

async function convertBlocks(
  blocks: RawRecord[],
  pageTitle: string,
  source: NotionSource,
  logger: PipelineLogger,
  headingCounts: Map<string, number>,
): Promise<ContentBlock[]> {
  const output: ContentBlock[] = [];
  for (let index = 0; index < blocks.length; index += 1) {
    const block = blocks[index];
    if (block.type === 'bulleted_list_item' || block.type === 'numbered_list_item') {
      const notionType = block.type;
      const items = [];
      while (index < blocks.length && blocks[index].type === notionType) {
        items.push(await convertListItem(blocks[index], pageTitle, source, logger, headingCounts));
        index += 1;
      }
      index -= 1;
      const validItems = items.filter((item) => item.richText.length > 0);
      if (validItems.length) {
        output.push({
          id: block.id,
          type: notionType === 'bulleted_list_item' ? 'bulletedList' : 'numberedList',
          items: validItems,
        });
      }
      continue;
    }
    const converted = await convertBlock(block, pageTitle, source, logger, headingCounts);
    if (converted) output.push(converted);
  }
  return output;
}

export async function normalizePageBlocks(
  page: RawRecord,
  pageTitle: string,
  source: NotionSource,
  logger: PipelineLogger,
): Promise<ContentBlock[]> {
  return convertBlocks(await source.getPageBlocks(page), pageTitle, source, logger, new Map());
}

export function tableOfContents(blocks: ContentBlock[]): Array<{ href: string; label: string }> {
  const items: Array<{ href: string; label: string }> = [];
  const visit = (values: ContentBlock[]) => {
    for (const block of values) {
      if (block.type === 'heading2' || block.type === 'heading3') {
        items.push({ href: `#${block.anchor}`, label: block.richText.map((span) => span.text).join('') });
      } else if (block.type === 'toggle') {
        visit(block.children);
      }
    }
  };
  visit(blocks);
  return items;
}
