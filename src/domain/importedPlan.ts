import type { Unit, UnitType } from '@/store/types';
import type { DateKey } from './dates';
import { parseNum } from './format';
import type { PlanEvent } from './ics';

/** „12 km“, „8,5km“ – aber nicht „10 km/h“ */
const KM_RE = /(\d+(?:[.,]\d+)?)\s?km\b(?!\s*\/\s*h)/i;
const RACE_RE = /\b(halb)?marathon\b|wettkampf|rennen|\brace\b|renntag|lauftag/i;

export function extractKm(...texts: string[]): number | undefined {
  for (const t of texts) {
    const m = KM_RE.exec(t);
    if (m) return parseNum(m[1]) ?? undefined;
  }
  return undefined;
}

export function inferType(title: string, description: string): UnitType {
  const t = `${title} ${description}`;
  if (/kraft|stabi|core|athletik|gym/i.test(title)) return 'kraft';
  if (/\b(rad|velo|bike|schwimm|aquajog|crosstrain|alternativ)/i.test(title)) return 'other';
  if (/ruhetag|\bruhe\b|\bpause\b|trainingsfrei|\bfrei\b/i.test(title) && !KM_RE.test(t)) return 'rest';
  if (/mobility|dehnen|stretch|yoga/i.test(title)) return 'mob';
  return 'run';
}

/** Die ersten Zeilen der Beschreibung als kurzer Hinweis */
function shortDetail(description: string): string {
  const lines = description.split('\n').map(l => l.trim()).filter(Boolean);
  const text = lines.slice(0, 2).join(' · ');
  return text.length > 180 ? `${text.slice(0, 177)}…` : text;
}

/** Termine → Einheiten pro Tag. Die IDs sind stabil, solange dieselbe Datei importiert wird. */
export function eventsToUnits(events: PlanEvent[]): { byDate: Map<DateKey, Unit[]>; raceDate: DateKey | null } {
  const byDate = new Map<DateKey, Unit[]>();
  const last = events.at(-1);
  let raceDate: DateKey | null = null;

  for (const e of events) {
    const list = byDate.get(e.date) ?? [];
    const type = e.type ?? inferType(e.title, e.description);
    const target = e.type ? e.target : type === 'run' ? extractKm(e.title, e.description) : undefined;
    const race = e.type ? !!e.race : type === 'run' && e.date === last?.date && RACE_RE.test(`${e.title} ${e.description}`);
    if (race) raceDate = e.date;
    list.push({
      id: e.id ?? `i${list.length}`,
      type,
      title: e.title,
      detail: shortDetail(e.description),
      info: e.description || undefined,
      target,
      race: race || undefined,
      optional: e.optional,
      workout: e.workout,
      time: e.time,
    });
    byDate.set(e.date, list);
  }
  return { byDate, raceDate };
}
