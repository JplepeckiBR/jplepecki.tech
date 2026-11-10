import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const DEFAULT_RAMP = ' .:-=+*#%@';

export interface AsciiOptions {
  columns?: number;
  characterAspectRatio?: number;
  ramp?: string;
}

export interface AsciiResult {
  text: string;
  columns: number;
  rows: number;
}

/**
 * Converts a local image into fixed-width ASCII during the Astro build.
 * Rows are reduced to compensate for mono characters being taller than wide.
 */
export async function imageToAscii(
  input: string | URL | Buffer,
  options: AsciiOptions = {},
): Promise<AsciiResult> {
  const columns = clampInteger(options.columns, 16, 120, 48);
  const characterAspectRatio = clampNumber(options.characterAspectRatio, 0.25, 1, 0.5);
  const ramp = normalizeRamp(options.ramp);
  const source = input instanceof URL ? fileURLToPath(input) : input;
  const pipeline = sharp(source, { failOn: 'error' }).rotate();
  const metadata = await pipeline.metadata();

  if (!metadata.width || !metadata.height) {
    throw new Error('ASCII portrait source has no readable dimensions.');
  }

  const rows = Math.max(
    1,
    Math.round((metadata.height / metadata.width) * columns * characterAspectRatio),
  );
  const { data, info } = await pipeline
    .resize(columns, rows, { fit: 'fill' })
    .grayscale()
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const lines: string[] = [];
  for (let y = 0; y < info.height; y += 1) {
    let line = '';
    for (let x = 0; x < info.width; x += 1) {
      const luminance = data[y * info.width + x] ?? 0;
      const rampIndex = Math.round((luminance / 255) * (ramp.length - 1));
      line += ramp[rampIndex];
    }
    lines.push(line);
  }

  return { text: lines.join('\n'), columns: info.width, rows: info.height };
}

function normalizeRamp(value: unknown): string {
  if (typeof value !== 'string') return DEFAULT_RAMP;
  const characters = Array.from(value);
  return characters.length >= 2 ? characters.join('') : DEFAULT_RAMP;
}

function clampInteger(
  value: unknown,
  minimum: number,
  maximum: number,
  fallback: number,
): number {
  return Math.round(clampNumber(value, minimum, maximum, fallback));
}

function clampNumber(
  value: unknown,
  minimum: number,
  maximum: number,
  fallback: number,
): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  return Math.min(maximum, Math.max(minimum, value));
}
