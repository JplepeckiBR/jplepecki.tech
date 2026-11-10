const BRACKETED_PLACEHOLDER = /^\[[\s\S]*\]$/;
const TODO_PLACEHOLDER = /^TODO(?:\(JP\))?(?::|\b)/i;

export function cleanText(value: unknown): string | undefined {
  if (typeof value !== 'string' && typeof value !== 'number') return undefined;

  const text = String(value).trim();
  if (!text || BRACKETED_PLACEHOLDER.test(text) || TODO_PLACEHOLDER.test(text)) {
    return undefined;
  }

  return text;
}

export function isIsoDate(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function isSafeFragment(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    value.length > 1 &&
    value.startsWith('#') &&
    !/[\s<>"'`]/.test(value)
  );
}

export function isLocalAssetPath(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  const path = value.trim();
  return Boolean(path) && (path.startsWith('/') || path.startsWith('./') || path.startsWith('../'));
}

export function clampRotation(value: unknown, fallback = 0): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  return Math.max(-3, Math.min(3, value));
}
