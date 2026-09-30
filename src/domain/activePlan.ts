import { PHASES, PLAN, type PlanWeek } from '@/data/plan';
import type { AppState, ImportedPlan, Unit } from '@/store/types';
import { addDays, daysBetween, todayKey, weekday, type DateKey } from './dates';
import { eventsToUnits } from './importedPlan';
import { plannedUnits, raceDate as builtinRaceDate } from './schedule';

export interface PlanPhase {
  id: number;
  name: string;
  time: string;
  summary: string;
}

/** Eine Woche des aktiven Plans – einheitlich für Standard- und importierten Plan */
export interface PlanWeekView {
  w: number;
  /** Montag */
  start: DateKey;
  /** geplante Laufkilometer */
  km: number;
  /** Kurzbeschreibung, z. B. „Sa 12 km · Do Schwelle 3 × 8 min“ */
  headline: string;
  note: string;
  deload: boolean;
  race: boolean;
  phase: PlanPhase | null;
}

export interface ActivePlan {
  kind: 'builtin' | 'imported';
  name: string;
  /** Montag der Woche 1 */
  start: DateKey;
  /** Wettkampftag, falls bekannt */
  raceDate: DateKey | null;
  /** letzter Tag des Plans */
  end: DateKey;
  weeks: PlanWeekView[];
  /** Turnierwochen gibt es nur im Standardplan */
  supportsTournaments: boolean;
  units: (k: DateKey) => Unit[];
}

export const mondayOf = (k: DateKey): DateKey => addDays(k, -weekday(k));

/** Wochennummer im Plan (kann < 1 oder > Anzahl Wochen sein) */
export const weekNumber = (plan: ActivePlan, k: DateKey): number => Math.floor(daysBetween(k, plan.start) / 7) + 1;

export const planWeek = (plan: ActivePlan, w: number): PlanWeekView | null => plan.weeks[w - 1] ?? null;

export const weekStartOf = (plan: ActivePlan, w: number): DateKey => addDays(plan.start, (w - 1) * 7);

const phaseOf = (p: PlanWeek): PlanPhase => ({ id: p.ph, name: PHASES[p.ph].name, time: PHASES[p.ph].time, summary: PHASES[p.ph].run });

function builtinPlan(s: AppState): ActivePlan {
  const { start } = s.settings;
  const race = builtinRaceDate(start);
  return {
    kind: 'builtin',
    name: 'Marathon 2027',
    start,
    raceDate: race,
    end: race,
    supportsTournaments: true,
    weeks: PLAN.map(p => ({
      w: p.w,
      start: addDays(start, (p.w - 1) * 7),
      km: p.km,
      headline: `Sa ${/^\d/.test(p.long) && !/km/.test(p.long) ? `${p.long} km` : p.long} · Do ${p.quality}`,
      note: p.note,
      deload: p.deload,
      race: p.race,
      phase: phaseOf(p),
    })),
    units: k => plannedUnits(s, k),
  };
}

function importedPlan(plan: ImportedPlan): ActivePlan {
  const { byDate, raceDate } = eventsToUnits(plan.events);
  const first = plan.events[0]?.date ?? todayKey();
  const last = plan.events.at(-1)?.date ?? first;
  const start = mondayOf(first);
  const count = Math.floor(daysBetween(last, start) / 7) + 1;

  const weeks: PlanWeekView[] = Array.from({ length: count }, (_, i) => {
    const ws = addDays(start, i * 7);
    const units = Array.from({ length: 7 }, (_, d) => byDate.get(addDays(ws, d)) ?? []).flat();
    const runs = units.filter(u => u.type === 'run');
    const km = runs.reduce((a, u) => a + (u.target ?? 0), 0);
    const longest = Math.max(0, ...runs.map(u => u.target ?? 0));
    const n = units.filter(u => u.type !== 'rest').length;
    const parts = [n === 1 ? '1 Einheit' : `${n} Einheiten`];
    if (longest) parts.push(`längster Lauf ${longest.toLocaleString('de-DE')} km`);
    return {
      w: i + 1,
      start: ws,
      km,
      headline: parts.join(' · '),
      note: '',
      deload: false,
      race: units.some(u => u.race),
      phase: null,
    };
  });

  return {
    kind: 'imported',
    name: plan.name,
    start,
    raceDate,
    end: last,
    supportsTournaments: false,
    weeks,
    units: k => byDate.get(k) ?? [],
  };
}

// Der aktive Plan ändert sich nur mit Einstellungen, Turnieren oder Import – daher einfacher Cache
let cache: { settings: unknown; tournaments: unknown; plan: unknown; value: ActivePlan } | null = null;

export function activePlan(s: AppState): ActivePlan {
  if (cache && cache.settings === s.settings && cache.tournaments === s.tournaments && cache.plan === s.plan) return cache.value;
  const value = s.plan ? importedPlan(s.plan) : builtinPlan(s);
  cache = { settings: s.settings, tournaments: s.tournaments, plan: s.plan, value };
  return value;
}
