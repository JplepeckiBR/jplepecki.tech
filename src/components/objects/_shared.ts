import type { ImageMetadata } from 'astro';

const TODO = /TODO(?:\(JP\))?(?::|\b)/i;
const BRACKETED = /\[[^\]]*\]/;

export function cleanText(value: unknown): string | undefined {
  if (typeof value !== 'string' && typeof value !== 'number') return undefined;
  const text = String(value).trim();
  if (!text || TODO.test(text) || BRACKETED.test(text)) return undefined;
  return text;
}

export function cleanHref(value: unknown): string | undefined {
  const href = cleanText(value);
  if (!href) return undefined;

  if (href.startsWith('/') && !href.startsWith('//')) return href;
  if (/^https:\/\/[^\s]+$/i.test(href)) return href;
  if (/^mailto:[^\s@]+@[^\s@]+\.[^\s@]+$/i.test(href)) return href;
  return undefined;
}

export function clampRotation(value: unknown, fallback = 0): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  return Math.min(3, Math.max(-3, value));
}

export function clampNumber(
  value: unknown,
  minimum: number,
  maximum: number,
  fallback: number,
): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  return Math.min(maximum, Math.max(minimum, value));
}

export function isImageMetadata(value: unknown): value is ImageMetadata {
  if (!value || typeof value !== 'object') return false;
  const image = value as Partial<ImageMetadata>;
  return (
    typeof image.src === 'string' &&
    image.src.length > 0 &&
    typeof image.width === 'number' &&
    image.width > 0 &&
    typeof image.height === 'number' &&
    image.height > 0
  );
}
