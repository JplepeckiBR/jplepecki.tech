import { plainText } from './properties';
import type { NotionSource, PipelineLogger, RawRecord } from './source';
import type { ReadmeEntry } from './types';

function headingText(block: RawRecord): string | undefined {
  return block.type === 'heading_1' || block.type === 'heading_2' || block.type === 'heading_3'
    ? plainText(block[block.type]?.rich_text)
    : undefined;
}

async function childrenFor(source: NotionSource, block: RawRecord): Promise<RawRecord[]> {
  return source.getBlockChildren(block.id, block.children);
}

function rowText(blocks: RawRecord[]): string[][] {
  return blocks
    .filter((block) => block.type === 'table_row' && Array.isArray(block.table_row?.cells))
    .map((block) => block.table_row.cells.map((cell: unknown) => plainText(cell) ?? ''));
}

export async function normalizeReadme(source: NotionSource, logger: PipelineLogger): Promise<ReadmeEntry> {
  const root = source.mode === 'fixture'
    ? { id: source.readmeId, blocks: source.readmeBlocks ?? [] }
    : { id: source.readmeId };
  const blocks = await source.getPageBlocks(root);
  const loopNotes: string[] = [];
  const changelog: Array<{ date?: string; change: string }> = [];

  const loopHeading = blocks.findIndex((block) => headingText(block)?.toLowerCase() === 'the loop');
  if (loopHeading >= 0) {
    for (let index = loopHeading + 1; index < blocks.length; index += 1) {
      if (headingText(blocks[index])) break;
      if (blocks[index].type === 'bulleted_list_item') {
        const note = plainText(blocks[index].bulleted_list_item?.rich_text);
        if (note) loopNotes.push(note);
      }
    }
  }

  const changelogHeading = blocks.findIndex((block) => headingText(block)?.toLowerCase() === 'framework changelog');
  if (changelogHeading >= 0) {
    const section = blocks.slice(changelogHeading + 1);
    const nextHeading = section.findIndex((block) => Boolean(headingText(block)));
    const table = (nextHeading >= 0 ? section.slice(0, nextHeading) : section).find((block) => block.type === 'table');
    if (table) {
      const rows = rowText(await childrenFor(source, table));
      const header = rows[0]?.map((cell) => cell.trim().toLowerCase()) ?? [];
      const dateIndex = header.indexOf('date');
      const changeIndex = header.indexOf('change');
      if (changeIndex >= 0) {
        for (const cells of rows.slice(1)) {
          const change = cells[changeIndex]?.trim();
          if (change) changelog.push({ date: dateIndex >= 0 ? cells[dateIndex]?.trim() || undefined : undefined, change });
        }
      }
    }
  }

  if (loopHeading < 0) logger.warn('README page: heading "The loop" was not found');
  if (changelogHeading < 0) logger.warn('README page: heading "Framework changelog" was not found');
  return { notionId: source.readmeId, loopNotes, changelog };
}
