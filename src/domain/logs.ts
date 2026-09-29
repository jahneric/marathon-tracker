import { exercise, MOBILITY } from '@/data/exercises';
import type { AppState, DayLog, PainLevel, PainSpot, SetLog, Unit, UnitLog, UnitType } from '@/store/types';
import { addDays, daysBetween, type DateKey } from './dates';
import { formatDuration, formatKm, formatPace, parseDuration, parseNum } from './format';
import { plannedUnits, raceDate, weekStart } from './schedule';

export const FEEL = ['sehr schwer', 'schwer', 'okay', 'gut', 'super'] as const;

export const PAIN_LABEL: Record<PainSpot, string> = {
  achilles: 'Achillessehne', shin: 'Schienbein', knee: 'Knie', hip: 'Hüfte',
  shoulder: 'Schulter', back: 'Rücken', foot: 'Fuß', other: 'Sonstiges',
};

export const isDone = (l: UnitLog | null | undefined): boolean => l?.status === 'done';

export const dayUnits = (s: AppState, k: DateKey): Unit[] => plannedUnits(s, k).concat(s.days[k]?.extra ?? []);

export const unitLog = (s: AppState, k: DateKey, id: string): UnitLog | undefined => s.days[k]?.u[id];

export const emptyDay = (): DayLog => ({ u: {}, extra: [], well: {} });

export interface LogEntry { k: DateKey; id: string; log: UnitLog }

/** Alle Einträge chronologisch */
export function allLogs(s: AppState, type?: UnitType): LogEntry[] {
  const out: LogEntry[] = [];
  for (const k of Object.keys(s.days).sort()) {
    for (const [id, log] of Object.entries(s.days[k]?.u ?? {})) {
      if (!type || log.t === type) out.push({ k, id, log });
    }
  }
  return out;
}

// Die Tage sind immutabel (Immer) – daher reicht ein WeakMap-Cache
const kmCache = new WeakMap<AppState['days'], Map<DateKey, number>>();

/** Gelaufene km pro Tag (nur erledigte Läufe) */
export function runKmByDay(s: AppState): Map<DateKey, number> {
  let m = kmCache.get(s.days);
  if (!m) {
    m = new Map();
    for (const { k, log } of allLogs(s, 'run')) {
      if (isDone(log)) m.set(k, (m.get(k) ?? 0) + (parseNum(log.km) ?? 0));
    }
    kmCache.set(s.days, m);
  }
  return m;
}

export function weekKm(s: AppState, w: number): number {
  const byDay = runKmByDay(s);
  const ws = weekStart(s.settings.start, w);
  let sum = 0;
  for (let i = 0; i < 7; i++) sum += byDay.get(addDays(ws, i)) ?? 0;
  return sum;
}

const hasValue = (x: SetLog | null | undefined) => !!x && !!(x.kg || x.r || x.s);

/** Die letzten Sätze einer Übung vor dem Datum k */
export function lastSets(s: AppState, k: DateKey, exId: string): { k: DateKey; sets: (SetLog | null)[] } | null {
  const logs = allLogs(s, 'kraft').filter(x => x.k < k && x.log.ex?.[exId]?.some(hasValue));
  const last = logs.at(-1);
  return last ? { k: last.k, sets: last.log.ex![exId]! } : null;
}

export const shoeKm = (s: AppState, id: string): number =>
  allLogs(s, 'run').filter(x => isDone(x.log) && x.log.shoe === id).reduce((a, x) => a + (parseNum(x.log.km) ?? 0), 0);

/** Beschwerden am Tag k oder am Vortag */
export function recentPain(s: AppState, k: DateKey): [PainSpot, PainLevel][] {
  const spots = new Map<PainSpot, PainLevel>();
  for (const x of [k, addDays(k, -1)]) {
    for (const [spot, v] of Object.entries(s.days[x]?.well.pain ?? {}) as [PainSpot, PainLevel][]) {
      if (v && !spots.has(spot)) spots.set(spot, v);
    }
  }
  return [...spots];
}

export function formatSets(sets: (SetLog | null)[], kind: 'w' | 's' | 'c'): string {
  return sets.filter((x): x is SetLog => !!x)
    .map(x => (kind === 's' ? `${x.s || '–'} s` : `${x.kg ?? '–'}×${x.r ?? '–'}`))
    .join(', ');
}

/** Kurze Zusammenfassung eines Eintrags für die Karte */
export function summarize(u: Unit, l: UnitLog): string {
  if (l.status === 'skip') return 'Ausgelassen' + (l.note ? ` · ${l.note}` : '');
  const parts: string[] = [];
  switch (u.type) {
    case 'run': {
      const km = parseNum(l.km), sec = parseDuration(l.dur);
      if (km) parts.push(`${formatKm(km)} km`);
      if (sec) parts.push(formatDuration(sec));
      if (km && sec) parts.push(`${formatPace(sec / km)} /km`);
      if (l.feel) parts.push(FEEL[Number(l.feel) - 1] ?? '');
      if (l.hr) parts.push(`♥ ${l.hr}`);
      break;
    }
    case 'kraft': {
      const ex = Object.entries(l.ex ?? {});
      const n = ex.filter(([, a]) => a.some(x => x && (x.kg || x.r || x.s || x.c))).length;
      if (n) parts.push(`${n} Übungen`);
      const top = ex
        .map(([id, a]) => [id, Math.max(0, ...a.map(x => parseNum(x?.kg) ?? 0))] as const)
        .filter(([id, kg]) => kg > 0 && exercise(id))
        .sort((a, b) => b[1] - a[1])[0];
      if (top) parts.push(`Top: ${exercise(top[0])!.name} ${formatKm(top[1])} kg`);
      if (l.variant) parts.push(l.variant === 'AT' ? 'Übergang' : l.variant);
      break;
    }
    case 'vb':
      if (l.min) parts.push(`${l.min} min`);
      if (l.kind) parts.push(l.kind);
      if (l.int) parts.push(`Intensität ${l.int}/5`);
      if (l.result) parts.push(l.result);
      break;
    case 'mob': {
      const n = Object.values(l.m ?? {}).filter(Boolean).length;
      if (n) parts.push(`${n}/${MOBILITY.length} Übungen`);
      break;
    }
    case 'other':
      if (l.what) parts.push(l.what);
      if (l.min) parts.push(`${l.min} min`);
      break;
  }
  if (l.note) parts.push(`„${l.note}“`);
  return parts.filter(Boolean).join(' · ');
}

export interface Totals {
  totalKm: number;
  runs: number;
  longest: number;
  kraft: number;
  vb: number;
  vbHours: number;
  mob: number;
  /** Anteil erledigter Pflicht-Einheiten bis gestern (0–1) */
  adherence: number | null;
  /** Ø Pace der letzten 28 Tage in s/km */
  recentPace: number | null;
  daysToRace: number;
}

export function totals(s: AppState, today: DateKey): Totals {
  const runs = allLogs(s, 'run').filter(x => isDone(x.log));
  const doneOf = (t: UnitType) => allLogs(s, t).filter(x => isDone(x.log));
  const vbs = doneOf('vb');

  const recent = runs.filter(x => daysBetween(today, x.k) < 28 && parseNum(x.log.km) && parseDuration(x.log.dur));
  const rk = recent.reduce((a, x) => a + parseNum(x.log.km)!, 0);
  const rs = recent.reduce((a, x) => a + parseDuration(x.log.dur)!, 0);

  let planned = 0, did = 0;
  const race = raceDate(s.settings.start);
  for (let k = s.settings.start; k < today && k <= race; k = addDays(k, 1)) {
    for (const u of plannedUnits(s, k)) {
      if (u.type === 'rest' || u.optional) continue;
      planned++;
      if (isDone(unitLog(s, k, u.id))) did++;
    }
  }

  return {
    totalKm: runs.reduce((a, x) => a + (parseNum(x.log.km) ?? 0), 0),
    runs: runs.length,
    longest: runs.reduce((a, x) => Math.max(a, parseNum(x.log.km) ?? 0), 0),
    kraft: doneOf('kraft').length,
    vb: vbs.length,
    vbHours: vbs.reduce((a, x) => a + (parseNum(x.log.min) ?? 0), 0) / 60,
    mob: doneOf('mob').length,
    adherence: planned ? did / planned : null,
    recentPace: rk ? rs / rk : null,
    daysToRace: Math.max(0, daysBetween(race, today)),
  };
}

export function painCounts(s: AppState, today: DateKey, days = 28): [PainSpot, number][] {
  const cnt = new Map<PainSpot, number>();
  for (let i = 0; i < days; i++) {
    for (const [spot, v] of Object.entries(s.days[addDays(today, -i)]?.well.pain ?? {}) as [PainSpot, PainLevel][]) {
      if (v) cnt.set(spot, (cnt.get(spot) ?? 0) + 1);
    }
  }
  return [...cnt].sort((a, b) => b[1] - a[1]);
}

export type DayState = 'done' | 'partial' | 'missed' | 'open' | 'rest';

export interface DayStatus {
  state: DayState;
  /** Pflicht-Einheiten (ohne Ruhe und optionale) */
  required: number;
  done: number;
  skipped: number;
}

/**
 * Hat das Training an diesem Tag stattgefunden?
 * done = alle Pflicht-Einheiten erledigt, partial = teilweise,
 * missed = vergangener Tag ohne Erledigtes, open = heute/Zukunft noch offen, rest = nichts Pflichtiges geplant
 */
export function dayStatus(s: AppState, k: DateKey, today: DateKey): DayStatus {
  const required = dayUnits(s, k).filter(u => u.type !== 'rest' && !u.optional && !u.extra);
  const logs = required.map(u => unitLog(s, k, u.id));
  const done = logs.filter(isDone).length;
  const skipped = logs.filter(l => l?.status === 'skip').length;
  const extraDone = (s.days[k]?.extra ?? []).some(u => isDone(unitLog(s, k, u.id)));

  let state: DayState;
  if (!required.length) state = 'rest';
  else if (done === required.length) state = 'done';
  else if (done > 0 || extraDone) state = 'partial';
  else state = k < today ? 'missed' : 'open';
  return { state, required: required.length, done, skipped };
}

export interface WeightPoint { w: number; kg: number }

/** Gewicht pro Woche; ohne Wocheneintrag wird das zuletzt im Befinden eingetragene Tagesgewicht verwendet */
export function weightSeries(s: AppState): WeightPoint[] {
  const out = new Map<number, number>();
  for (const k of Object.keys(s.days).sort()) {
    const kg = parseNum(s.days[k]?.well.weight);
    if (kg) out.set(Math.floor(daysBetween(k, s.settings.start) / 7) + 1, kg);
  }
  for (const [w, v] of Object.entries(s.weights)) {
    const kg = parseNum(v);
    if (kg) out.set(Number(w), kg);
  }
  return [...out].map(([w, kg]) => ({ w, kg })).sort((a, b) => a.w - b.w);
}

export interface StrengthPoint { k: DateKey; kg: number; sets: (SetLog | null)[] }

export function strengthHistory(s: AppState, exId: string): StrengthPoint[] {
  return allLogs(s, 'kraft')
    .filter(x => x.log.ex?.[exId])
    .map(x => {
      const sets = x.log.ex![exId]!;
      const kgs = sets.map(z => parseNum(z?.kg)).filter((v): v is number => v != null);
      return { k: x.k, kg: kgs.length ? Math.max(...kgs) : NaN, sets };
    })
    .filter(p => Number.isFinite(p.kg));
}
