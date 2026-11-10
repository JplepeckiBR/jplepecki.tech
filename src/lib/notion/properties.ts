import type { RichTextSpan, SerializedImage } from './types';
import type { RawRecord } from './source';
import { localizeImage } from './images';

const BLOCKED_HOST_PATTERN = /(?:^|\.)(?:notion\.so|notion\.site|notionusercontent\.com|notion-static\.com)$/i;

function safeHref(value: unknown): string | undefined {
  if (typeof value !== 'string' || !value.trim()) return undefined;
  try {
    const url = new URL(value);
    if (!['http:', 'https:', 'mailto:'].includes(url.protocol)) return undefined;
    if (BLOCKED_HOST_PATTERN.test(url.hostname) || url.hostname.includes('prod-files-secure')) return undefined;
    return url.toString();
  } catch {
    return value.startsWith('#') || value.startsWith('/') ? value : undefined;
  }
}

export function richText(value: unknown): RichTextSpan[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item): RichTextSpan | undefined => {
      const text = typeof item?.plain_text === 'string'
        ? item.plain_text
        : typeof item?.text?.content === 'string'
          ? item.text.content
          : '';
      if (!text) return undefined;
      const annotations = item.annotations ?? {};
      const href = safeHref(item.href ?? item.text?.link?.url);
      return {
        text,
        href,
        bold: annotations.bold === true || undefined,
        italic: annotations.italic === true || undefined,
        code: annotations.code === true || undefined,
        strikethrough: annotations.strikethrough === true || undefined,
        underline: annotations.underline === true || undefined,
      };
    })
    .filter((item): item is RichTextSpan => Boolean(item));
}

export function plainText(value: unknown): string | undefined {
  const text = richText(value).map((item) => item.text).join('').trim();
  return text || undefined;
}

function property(page: RawRecord, name: string): RawRecord | undefined {
  const candidate = page.properties?.[name];
  return candidate && typeof candidate === 'object' ? candidate : undefined;
}

export function titleProperty(page: RawRecord, name: string): string | undefined {
  const value = property(page, name);
  return value?.type === 'title' ? plainText(value.title) : undefined;
}

export function textProperty(page: RawRecord, name: string): string | undefined {
  const value = property(page, name);
  return value?.type === 'rich_text' ? plainText(value.rich_text) : undefined;
}

export function selectProperty(page: RawRecord, name: string): string | undefined {
  const value = property(page, name);
  if (value?.type === 'select') return typeof value.select?.name === 'string' ? value.select.name.trim() || undefined : undefined;
  if (value?.type === 'status') return typeof value.status?.name === 'string' ? value.status.name.trim() || undefined : undefined;
  return undefined;
}

export function numberProperty(page: RawRecord, name: string): number | undefined {
  const value = property(page, name);
  return value?.type === 'number' && typeof value.number === 'number' && Number.isFinite(value.number)
    ? value.number
    : undefined;
}

export function checkboxProperty(page: RawRecord, name: string): boolean {
  const value = property(page, name);
  return value?.type === 'checkbox' && value.checkbox === true;
}

export function dateProperty(page: RawRecord, name: string): { start?: string; end?: string } {
  const value = property(page, name);
  if (value?.type !== 'date' || !value.date) return {};
  return {
    start: typeof value.date.start === 'string' ? value.date.start.slice(0, 10) : undefined,
    end: typeof value.date.end === 'string' ? value.date.end.slice(0, 10) : undefined,
  };
}

export function relationProperty(page: RawRecord, name: string): string[] {
  const value = property(page, name);
  if (value?.type !== 'relation' || !Array.isArray(value.relation)) return [];
  return value.relation
    .map((item: RawRecord) => (typeof item?.id === 'string' ? item.id : undefined))
    .filter((id: string | undefined): id is string => Boolean(id));
}

export function multiSelectProperty(page: RawRecord, name: string): string[] {
  const value = property(page, name);
  if (value?.type !== 'multi_select' || !Array.isArray(value.multi_select)) return [];
  return value.multi_select
    .map((item: RawRecord) => (typeof item?.name === 'string' ? item.name.trim() : ''))
    .filter(Boolean);
}

export function imageReference(value: RawRecord, fallbackAlt: string): {
  url?: string;
  fixturePath?: string;
  alt: string;
  caption?: string;
  name?: string;
} | undefined {
  const caption = plainText(value.caption);
  if (value.type === 'fixture' && typeof value.fixture?.path === 'string') {
    return {
      fixturePath: value.fixture.path,
      alt: typeof value.fixture.alt === 'string' ? value.fixture.alt : caption ?? fallbackAlt,
      caption,
      name: value.name,
    };
  }
  const url = value.type === 'file' ? value.file?.url : value.type === 'external' ? value.external?.url : undefined;
  return typeof url === 'string' ? { url, alt: caption ?? fallbackAlt, caption, name: value.name } : undefined;
}

export async function filesProperty(
  page: RawRecord,
  name: string,
  fallbackAlt: string,
  context: string,
): Promise<SerializedImage[]> {
  const value = property(page, name);
  if (value?.type !== 'files' || !Array.isArray(value.files)) return [];
  const localized: SerializedImage[] = [];
  for (const [index, file] of value.files.entries()) {
    const reference = imageReference(file, fallbackAlt);
    if (reference) localized.push(await localizeImage(reference, `${context} file ${index + 1}`));
  }
  return localized;
}

export async function pageCover(
  page: RawRecord,
  fallbackAlt: string,
  context: string,
): Promise<SerializedImage | undefined> {
  const reference = page.cover ? imageReference(page.cover, fallbackAlt) : undefined;
  return reference ? localizeImage(reference, context) : undefined;
}
