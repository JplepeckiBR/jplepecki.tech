import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import type { SerializedImage } from './types';

const CACHE_DIRECTORY = path.resolve('src/assets/notion-cache');
const MAX_IMAGE_BYTES = 20 * 1024 * 1024;
const MIME_EXTENSIONS: Record<string, string> = {
  'image/avif': 'avif',
  'image/gif': 'gif',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/svg+xml': 'svg',
  'image/tiff': 'tiff',
  'image/webp': 'webp',
};

interface ImageReference {
  url?: string;
  fixturePath?: string;
  alt?: string;
  caption?: string;
  name?: string;
}

function cleanText(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const cleaned = value.trim();
  return cleaned || undefined;
}

function safeFixturePath(candidate: string): string {
  const fixtureRoot = path.resolve('src/assets/notion-fixtures');
  const resolved = path.resolve(candidate);
  if (resolved !== fixtureRoot && !resolved.startsWith(`${fixtureRoot}${path.sep}`)) {
    throw new Error(`Fixture image must be inside src/assets/notion-fixtures: ${candidate}`);
  }
  return resolved;
}

function validateSvg(bytes: Buffer, context: string): void {
  const source = bytes.toString('utf8', 0, Math.min(bytes.length, 4096));
  if (!/<svg(?:\s|>)/i.test(source) || /<script(?:\s|>)/i.test(source)) {
    throw new Error(`${context}: invalid or unsafe SVG image`);
  }
}

async function validateImage(bytes: Buffer, mime: string, context: string): Promise<void> {
  if (bytes.length === 0 || bytes.length > MAX_IMAGE_BYTES) {
    throw new Error(`${context}: image size must be between 1 byte and ${MAX_IMAGE_BYTES} bytes`);
  }
  if (mime === 'image/svg+xml') {
    validateSvg(bytes, context);
    return;
  }
  try {
    const metadata = await sharp(bytes).metadata();
    if (!metadata.width || !metadata.height || !metadata.format) {
      throw new Error('missing dimensions or format');
    }
  } catch (error) {
    throw new Error(`${context}: image bytes could not be decoded`, { cause: error });
  }
}

function extensionFromName(name: string | undefined): string | undefined {
  if (!name) return undefined;
  const extension = path.extname(name).slice(1).toLowerCase();
  return extension === 'jpeg' ? 'jpg' : extension || undefined;
}

export async function localizeImage(
  reference: ImageReference,
  context: string,
): Promise<SerializedImage> {
  const alt = cleanText(reference.alt) ?? cleanText(reference.caption);
  if (!alt) throw new Error(`${context}: image requires alt text or a caption`);

  if (reference.fixturePath) {
    const resolved = safeFixturePath(reference.fixturePath);
    const bytes = await readFile(resolved);
    const extension = extensionFromName(resolved);
    const mime = Object.entries(MIME_EXTENSIONS).find(([, value]) => value === extension)?.[0];
    if (!mime || !extension) throw new Error(`${context}: unsupported fixture image type`);
    await validateImage(bytes, mime, context);
    return {
      asset: `../assets/notion-fixtures/${path.basename(resolved)}`,
      alt,
      caption: cleanText(reference.caption),
    };
  }

  if (!reference.url) throw new Error(`${context}: image has no downloadable URL`);
  let response: Response;
  try {
    response = await fetch(reference.url, { signal: AbortSignal.timeout(30_000) });
  } catch (error) {
    throw new Error(`${context}: image download failed`, { cause: error });
  }
  if (!response.ok) throw new Error(`${context}: image download returned HTTP ${response.status}`);

  const declaredLength = Number(response.headers.get('content-length'));
  if (Number.isFinite(declaredLength) && declaredLength > MAX_IMAGE_BYTES) {
    throw new Error(`${context}: image exceeds ${MAX_IMAGE_BYTES} bytes`);
  }

  const mime = response.headers.get('content-type')?.split(';')[0]?.trim().toLowerCase() ?? '';
  const extension = MIME_EXTENSIONS[mime];
  if (!extension) throw new Error(`${context}: unsupported image MIME type ${mime || 'missing'}`);

  const bytes = Buffer.from(await response.arrayBuffer());
  await validateImage(bytes, mime, context);
  const requestedExtension = extensionFromName(reference.name);
  if (requestedExtension && requestedExtension !== extension) {
    throw new Error(`${context}: file extension ${requestedExtension} does not match MIME type ${mime}`);
  }

  const hash = createHash('sha256').update(bytes).digest('hex');
  const filename = `${hash}.${extension}`;
  await mkdir(CACHE_DIRECTORY, { recursive: true });
  await writeFile(path.join(CACHE_DIRECTORY, filename), bytes);

  return {
    asset: `../assets/notion-cache/${filename}`,
    alt,
    caption: cleanText(reference.caption),
  };
}
