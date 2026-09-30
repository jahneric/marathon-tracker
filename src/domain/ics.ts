import { toKey, type DateKey } from './dates';

export interface PlanEvent {
  date: DateKey;
  title: string;
  description: string;
}

/** Zeilen entfalten (RFC 5545: Folgezeilen beginnen mit Leerzeichen oder Tab) */
const unfold = (text: string): string[] => text.replace(/\r\n|\r/g, '\n').replace(/\n[ \t]/g, '').split('\n');

const unescapeText = (v: string): string =>
  v.replace(/\\([nN,;\\])/g, (_, c: string) => (c === 'n' || c === 'N' ? '\n' : c));

/** DTSTART-Wert → lokaler Kalendertag */
function parseDate(value: string): DateKey | null {
  const m = /^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})(Z)?)?/.exec(value.trim());
  if (!m) return null;
  const [, y, mo, d, h, mi, s, z] = m;
  if (z) return toKey(new Date(Date.UTC(+y!, +mo! - 1, +d!, +h!, +mi!, +s!)));
  return `${y}-${mo}-${d}`;
}

export interface IcsCalendar {
  /** Kalendername (X-WR-CALNAME), falls vorhanden */
  name?: string;
  /** chronologisch sortiert */
  events: PlanEvent[];
}

/** Liest alle Termine (VEVENT) einer iCalendar-Datei */
export function parseIcs(text: string): IcsCalendar {
  const events: PlanEvent[] = [];
  let name: string | undefined;
  let cur: Partial<PlanEvent> | null = null;

  for (const raw of unfold(text)) {
    const line = raw.trimEnd();
    if (line === 'BEGIN:VEVENT') {
      cur = {};
      continue;
    }
    if (line === 'END:VEVENT') {
      if (cur?.date) events.push({ date: cur.date, title: cur.title?.trim() || 'Training', description: cur.description?.trim() ?? '' });
      cur = null;
      continue;
    }
    const i = line.indexOf(':');
    if (i < 0) continue;
    const prop = line.slice(0, i).split(';')[0]!.toUpperCase();
    const value = line.slice(i + 1);
    if (!cur) {
      if (prop === 'X-WR-CALNAME') name = unescapeText(value).trim() || undefined;
      continue;
    }
    if (prop === 'DTSTART') cur.date = parseDate(value) ?? undefined;
    else if (prop === 'SUMMARY') cur.title = unescapeText(value);
    else if (prop === 'DESCRIPTION') cur.description = unescapeText(value);
  }

  events.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  return { name, events };
}
