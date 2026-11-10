import type { BuildLogEntry, DailyTargetEntry, LoopEntry } from './types';

function addDays(isoDate: string, dayOffset: number): string | undefined {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);
  if (!match) return undefined;

  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  if (Number.isNaN(date.valueOf())) return undefined;
  date.setUTCDate(date.getUTCDate() + dayOffset);
  return date.toISOString().slice(0, 10);
}

function newYorkToday(now = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export function deriveBuildLog(
  loop: LoopEntry | undefined,
  targets: DailyTargetEntry[],
  now = new Date(),
): BuildLogEntry[] {
  if (!loop?.startDate) return [];

  const today = newYorkToday(now);
  const grouped = new Map<number, DailyTargetEntry[]>();
  for (const target of targets) {
    if (!target.loopIds.includes(loop.notionId) || !Number.isInteger(target.day) || target.day < 1) {
      continue;
    }
    const dayTargets = grouped.get(target.day) ?? [];
    dayTargets.push(target);
    grouped.set(target.day, dayTargets);
  }

  const entries: BuildLogEntry[] = [];
  for (const [day, dayTargets] of [...grouped.entries()].sort(([left], [right]) => left - right)) {
    const dateTime = addDays(loop.startDate, day - 1);
    if (!dateTime) continue;

    const visibleTargets = dateTime < today ? dayTargets.filter((target) => target.done) : dayTargets;
    if (visibleTargets.length === 0) continue;

    const allDone = visibleTargets.every((target) => target.done);
    const status = dateTime === today ? 'today' : dateTime < today ? 'done' : 'planned';
    entries.push({
      date: `DAY ${String(day).padStart(2, '0')}`,
      dateTime,
      status,
      fallbackStatus: status === 'today' ? (allDone ? 'done' : 'planned') : undefined,
      title: visibleTargets.map((target) => target.task).join(' · '),
    });
  }

  return entries;
}
