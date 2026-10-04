import { KRAFT_PHASES, scaledKraftPhase, type WorkoutId } from '@/data/exercises';
import type { Paces } from '@/data/plan';
import type { ImportedPlan, PlanWeekMeta } from '@/store/types';
import { addDays, daysBetween, formatDate, weekday, WEEKDAYS, type DateKey } from './dates';
import { formatDuration, formatKm, formatPace, roundHalf } from './format';
import type { PlanEvent } from './ics';

export type RaceKind = '10k' | 'hm' | 'm';

export interface GenConfig {
  race: RaceKind;
  raceDate: DateKey;
  /** Montag der ersten Woche */
  start: DateKey;
  /** aktuelle Laufkilometer pro Woche */
  weeklyKm: number;
  /** längster Lauf der letzten vier Wochen */
  longRun: number;
  runDays: 3 | 4 | 5;
  /** Krafteinheiten pro Woche */
  strength: 0 | 2 | 3;
  mobility: boolean;
  /** aktuelle Bestzeit als Grundlage für Tempi und Prognose */
  refKm?: number;
  refSec?: number;
}

interface RaceDef {
  name: string;
  km: number;
  /** Spitzenumfang bei 4 Läufen pro Woche */
  peak: number;
  longCap: number;
  longStep: number;
  /** Umfang der Taperwochen vor der Rennwoche (Anteil vom erreichten Umfang) */
  taper: number[];
  /** ab diesem längsten Lauf gilt die Vorbereitung als solide */
  longOk: number;
}

export const RACES: Record<RaceKind, RaceDef> = {
  '10k': { name: '10-km-Lauf', km: 10, peak: 35, longCap: 14, longStep: 1, taper: [0.85], longOk: 10 },
  hm: { name: 'Halbmarathon', km: 21.1, peak: 45, longCap: 20, longStep: 1, taper: [0.7], longOk: 16 },
  m: { name: 'Marathon', km: 42.2, peak: 65, longCap: 32, longStep: 2, taper: [0.75, 0.55], longOk: 28 },
};

const DAYS_FACTOR = { 3: 0.8, 4: 1, 5: 1.15 } as const;
const LONG_SHARE = { 3: 0.5, 4: 0.45, 5: 0.4 } as const;

const BASE = ['Lockerer Lauf', 'Lockerer Lauf + 4 Steigerungen', 'Fahrtspiel 6 × 1 min', 'Lockerer Lauf + 6 Steigerungen', 'Fahrtspiel 8 × 1 min', 'Hügelläufe 6 × 30 s'];
const BUILD: Record<RaceKind, string[]> = {
  '10k': ['Schwelle 3 × 8 min', 'Intervalle 5 × 800 m', 'Schwelle 4 × 8 min', 'Intervalle 6 × 800 m', 'Tempodauerlauf 20 min', 'Intervalle 5 × 1000 m'],
  hm: ['Schwelle 3 × 8 min', 'Intervalle 5 × 1000 m', 'Schwelle 3 × 10 min', 'Tempodauerlauf 20 min', 'Schwelle 4 × 10 min', 'Intervalle 6 × 1000 m'],
  m: ['Schwelle 3 × 8 min', 'Intervalle 5 × 1000 m', 'Schwelle 3 × 10 min', 'Tempodauerlauf 25 min', 'Schwelle 3 × 12 min', 'Intervalle 6 × 1000 m'],
};
const SPECIFIC: Record<RaceKind, string[]> = {
  '10k': ['3 × 2 km im 10-km-Tempo', 'Intervalle 6 × 1000 m', '4 × 2 km im 10-km-Tempo', 'Intervalle 5 × 1000 m'],
  hm: ['3 × 3 km im HM-Tempo', 'Schwelle 2 × 20 min', '4 × 3 km im HM-Tempo', 'Tempodauerlauf 30 min'],
  m: ['Schwelle 2 × 20 min', '3 × 4 km im Marathontempo', 'Tempodauerlauf 30 min', '3 × 5 km im Marathontempo'],
};

const PHASE_INFO: Record<number, [name: string, summary: string]> = {
  1: ['Grundlage', 'fast nur locker laufen, Umfang behutsam steigern, erste Steigerungen und Fahrtspiele'],
  2: ['Aufbau', 'Schwelle und Intervalle kommen dazu, der lange Lauf wächst weiter'],
  3: ['Wettkampfspezifisch', 'Einheiten im Renntempo, längste Läufe der Vorbereitung'],
  4: ['Taper + Rennen', 'Umfang runter, Intensität kurz halten, ausgeruht an den Start'],
};

export interface GenWeek {
  w: number;
  start: DateKey;
  phase: number;
  km: number;
  long: number;
  quality: string;
  deload: boolean;
  race: boolean;
}

export interface GenResult {
  ok: true;
  plan: ImportedPlan;
  weeks: GenWeek[];
  peakKm: number;
  longest: number;
  /** nur mit Bestzeit */
  paces?: Paces;
  prediction?: string;
  warnings: string[];
}

export type GenOutcome = GenResult | { ok: false; error: string };

/** Rennzeit-Hochrechnung nach Riegel: T2 = T1 × (D2 / D1)^1,06 */
const riegel = (refKm: number, refSec: number, km: number): number => refSec * (km / refKm) ** 1.06;

interface PaceSet { easyLo: number; easyHi: number; m: number; hm: number; thr: number; k10: number; int: number }

function paceSet(refKm: number, refSec: number): PaceSet {
  const pace = (km: number) => riegel(refKm, refSec, km) / km;
  const m = pace(42.195);
  return { easyLo: m + 45, easyHi: m + 85, m, hm: pace(21.0975), thr: pace(15), k10: pace(10), int: pace(5) };
}

function qualityHint(q: string, p: PaceSet | null): string {
  const at = (sec: number) => (p ? ` ~${formatPace(sec)} /km` : '');
  if (/10-km-Tempo/.test(q)) return `10-km-Tempo${at(p?.k10 ?? 0)}, dazwischen 2–3 min traben`;
  if (/HM-Tempo/.test(q)) return `Halbmarathon-Tempo${at(p?.hm ?? 0)}, dazwischen 2–3 min traben`;
  if (/Marathontempo/.test(q)) return `Marathontempo${at(p?.m ?? 0)}, dazwischen 3 min traben`;
  if (/Schwelle|Tempodauerlauf/.test(q)) return `Schwelle${at(p?.thr ?? 0)} – zügig, aber kontrolliert`;
  if (/Intervalle/.test(q)) return `Intervalle${at(p?.int ?? 0)}, Trabpause 2–3 min`;
  if (/Fahrtspiel/.test(q)) return 'Belastung zügig, Pausen locker traben';
  if (/Hügel/.test(q)) return 'bergauf kräftig, zurück locker traben oder gehen';
  if (/Steigerungen/.test(q)) return 'am Ende 20 s zügig, dazwischen volle Erholung';
  return '';
}

/** Kilometer im Tempobereich einer Einheit (0 = lockerer Lauf mit kurzen Einlagen) */
function workKm(q: string, p: PaceSet | null): number {
  if (/Fahrtspiel/.test(q)) return 0;
  const thr = p?.thr ?? 330;
  let m: RegExpExecArray | null;
  if ((m = /(\d+) × (\d+) min/.exec(q))) return (+m[1]! * +m[2]! * 60) / thr;
  if ((m = /(\d+) × (\d+) m\b/.exec(q))) return (+m[1]! * +m[2]!) / 1000;
  if ((m = /(\d+) × (\d+) km/.exec(q))) return +m[1]! * +m[2]!;
  if ((m = /Tempodauerlauf (\d+) min/.exec(q))) return (+m[1]! * 60) / thr;
  return 0;
}

/** Nötige Strecke inkl. Trabpausen und je ca. 1,5 km Ein- und Auslaufen */
const needKm = (q: string, p: PaceSet | null): number => {
  const work = workKm(q, p);
  return work ? roundHalf(work * 1.15 + 3) : 0;
};

/** Kürzt eine Tempoeinheit (weniger Wiederholungen / Minuten), bis sie in die verfügbaren km passt */
function fitQuality(q: string, km: number, p: PaceSet | null): string {
  while (needKm(q, p) > km) {
    const reps = /^(.*?)(\d+)( × .*)$/.exec(q);
    const tempo = /^Tempodauerlauf (\d+) min$/.exec(q);
    if (reps && +reps[2]! > 2) q = `${reps[1]}${+reps[2]! - 1}${reps[3]}`;
    else if (tempo && +tempo[1]! > 10) q = `Tempodauerlauf ${+tempo[1]! - 5} min`;
    else break;
  }
  return q;
}

const clamp =(n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));
const fmtDay = (k: DateKey) => formatDate(k, { day: '2-digit', month: '2-digit' });

/** Erstellt einen Trainingsplan aus wenigen Kennzahlen */
export function generatePlan(cfg: GenConfig): GenOutcome {
  const race = RACES[cfg.race];
  if (weekday(cfg.start) !== 0) return { ok: false, error: 'Der Planstart muss ein Montag sein.' };
  if (daysBetween(cfg.raceDate, cfg.start) < 0) return { ok: false, error: 'Der Wettkampf liegt vor dem Planstart.' };

  const L = weekday(cfg.raceDate);
  const n = Math.floor(daysBetween(cfg.raceDate, cfg.start) / 7) + 1;
  const build = n - race.taper.length - 1;
  if (build < 4) return { ok: false, error: `Zu wenig Zeit: Für einen ${race.name} braucht der Plan mindestens ${race.taper.length + 5} Wochen.` };
  if (n > 60) return { ok: false, error: 'Der Wettkampf liegt mehr als 60 Wochen entfernt – wähle einen späteren Planstart.' };

  const p = cfg.refKm && cfg.refSec ? paceSet(cfg.refKm, cfg.refSec) : null;
  const easy = p ? `locker ${formatPace(p.easyLo)}–${formatPace(p.easyHi)} /km` : 'locker – so, dass du in ganzen Sätzen reden kannst';

  // 1. Wochenumfänge: 3 Wochen steigern (max. ca. 8 %), jede 4. Woche entlasten
  const peak = Math.max(race.peak * DAYS_FACTOR[cfg.runDays], cfg.weeklyKm);
  const share = cfg.race === 'm' ? 0.5 : LONG_SHARE[cfg.runDays];
  let level = clamp(cfg.weeklyKm, 8, peak);
  let longLevel = clamp(cfg.longRun, 4, race.longCap);
  const counters = [0, 0, 0, 0];
  const weeks: GenWeek[] = [];

  for (let i = 0; i < build; i++) {
    const deload = (i + 1) % 4 === 0 && i < build - 1;
    if (i > 0 && !deload) {
      level = Math.min(peak, Math.max(level * 1.08, level + 1));
      longLevel = Math.min(race.longCap, longLevel + race.longStep);
    }
    const f = i / build;
    const phase = f < 0.35 ? 1 : f < 0.7 ? 2 : 3;
    const km = Math.round(level * (deload ? 0.75 : 1));
    // Anteil am Wochenumfang begrenzen, aber nie unter den Lauf, den du ohnehin schon schaffst
    const cut = deload ? 0.75 : 1;
    const long = Math.round(Math.min(longLevel * cut, Math.max(km * share, Math.min(cfg.longRun, longLevel) * cut)));
    let quality = 'Lockerer Lauf + Steigerungen';
    if (!deload) {
      const c = counters[phase]!++;
      quality = phase === 1 ? (BASE[c] ?? BASE[2 + ((c - 2) % 4)]!) : phase === 2 ? BUILD[cfg.race][c % 6]! : SPECIFIC[cfg.race][c % 4]!;
    }
    weeks.push({ w: i + 1, start: addDays(cfg.start, i * 7), phase, km, long, quality, deload, race: false });
  }

  const longest = Math.max(...weeks.map(w => w.long));
  const lastLoad = weeks.findLast(w => !w.deload)!;
  race.taper.forEach((f, j) => {
    const i = build + j;
    weeks.push({
      w: i + 1, start: addDays(cfg.start, i * 7), phase: 4,
      km: Math.round(lastLoad.km * f), long: Math.round(lastLoad.long * f),
      quality: cfg.race === 'm' ? '3 × 3 km im Marathontempo' : cfg.race === 'hm' ? '3 × 2 km im HM-Tempo' : '4 × 1 km im 10-km-Tempo',
      deload: false, race: false,
    });
  });
  weeks.push({ w: n, start: addDays(cfg.start, (n - 1) * 7), phase: 4, km: 0, long: race.km, quality: '3 × 1 km im Wettkampftempo', deload: false, race: true });

  // 2. Einheiten: Tage relativ zum Wochentag des Wettkampfs (langer Lauf am selben Wochentag)
  const events: PlanEvent[] = [];
  const meta: PlanWeekMeta[] = [];
  const prediction = p ? formatDuration(riegel(cfg.refKm!, cfg.refSec!, race.km)) : undefined;

  for (const wk of weeks) {
    const day = (off: number) => addDays(wk.start, (L + off + 7) % 7);
    const kp = scaledKraftPhase(wk.w, n);
    const kraftDetail = `${KRAFT_PHASES[kp].name}: ${KRAFT_PHASES[kp].effort}`;
    const list: PlanEvent[] = [];
    const add = (off: number, e: Omit<PlanEvent, 'date' | 'description'> & { description?: string }) =>
      list.push({ description: '', ...e, date: day(off) });
    const run = (off: number, title: string, km: number | undefined, description: string, extra: Partial<PlanEvent> = {}) =>
      add(off, { id: 'run', type: 'run', title, target: km, description: km && !extra.race ? `ca. ${formatKm(km)} km · ${description}` : description, ...extra });

    // Kraft (morgens, daher vor den Läufen)
    if (cfg.strength && !wk.race) {
      const legs: WorkoutId = kp === 'intro' || kp === 'hyp' ? 'A1' : kp === 'max' ? 'AT' : 'A2';
      const kraft = (off: number, workout: WorkoutId, title: string) =>
        add(off, { id: `kraft${workout[0]}`, type: 'kraft', title, description: kraftDetail, workout, time: 'morgens' });
      if (cfg.strength === 3) {
        kraft(-6, 'B', 'Kraft B – Oberkörper Pull');
        kraft(-4, 'C', 'Kraft C – Oberkörper Push');
      } else if (wk.w % 2) kraft(-6, 'B', 'Kraft B – Oberkörper Pull');
      else kraft(-6, 'C', 'Kraft C – Oberkörper Push');
      // letzte 10 Tage vor dem Rennen keine Beine
      if (wk.w < n - 1) kraft(-2, legs, 'Kraft A – Unterkörper');
    }

    if (wk.race) {
      const short = roundHalf(clamp(lastLoad.km * 0.12, 4, 8));
      run(-5, 'Lockerer Lauf', short, easy);
      run(-3, 'Lockerer Lauf mit 3 × 1 km im Wettkampftempo', short + 1, 'Renntempo anlaufen, Rest locker');
      if (cfg.runDays > 3) run(-1, 'Optional 15–20 min ganz locker', undefined, 'mit 2–3 Steigerungen, Beine wach halten', { optional: true });
      run(0, race.name, race.km, `${formatKm(race.km)} km · ${prediction ? `Prognose ${prediction} h` : 'gleichmäßig starten, die zweite Hälfte entscheidet'}`, { race: true });
      wk.km = short * 2 + 1 + race.km;
    } else {
      const parts: [off: number, weight: number][] = [[-5, 1], [-3, 1.5]];
      if (cfg.runDays > 3) parts.push([-1, 0.6]);
      if (cfg.runDays > 4) parts.push([-4, 0.6]);
      const sum = parts.reduce((a, [, x]) => a + x, 0);
      const kms = new Map(parts.map(([off, x]) => [off, Math.max(3, roundHalf(((wk.km - wk.long) * x) / sum))]));
      const km = (off: number) => kms.get(off)!;
      // Tempoeinheit an den Umfang anpassen; reicht es trotzdem nicht, km vom lockeren Lauf abziehen
      wk.quality = fitQuality(wk.quality, km(-3), p);
      const need = needKm(wk.quality, p);
      if (need > km(-3)) {
        kms.set(-5, Math.max(3, km(-5) - (need - km(-3))));
        kms.set(-3, need);
      }

      run(-5, 'Lockerer Lauf', km(-5), easy);
      if (cfg.runDays > 4) run(-4, 'Regenerativer Lauf', km(-4), 'sehr locker');
      const hint = qualityHint(wk.quality, p);
      run(-3, wk.quality, km(-3), hint ? `inkl. Ein-/Auslaufen · ${hint}` : easy);
      if (cfg.runDays > 3) run(-1, 'Kurzer, sehr lockerer Lauf', km(-1), easy);
      const mt = cfg.race === 'm' && wk.phase === 3 && wk.w % 2 === 0 ? Math.round(wk.long * 0.35) : 0;
      run(0, `Langer Lauf – ${wk.long} km`, wk.long, mt ? `${easy} · davon ${mt} km im Marathontempo${p ? ` ~${formatPace(p.m)} /km` : ''}` : easy);
      wk.km = parts.reduce((a, [off]) => a + km(off), 0) + wk.long;
    }

    if (cfg.mobility) {
      for (const off of wk.race ? [-5, -3] : [-5, -3, 0]) {
        add(off, { id: 'mob', type: 'mob', title: 'Hüft-Mobility', description: off === 0 ? 'nach dem langen Lauf – mindestens Couch Stretch + 90/90' : 'nach dem Lauf, 10–15 min' });
      }
    }

    events.push(...list.filter(e => e.date <= cfg.raceDate));

    const [name, summary] = PHASE_INFO[wk.phase]!;
    const inPhase = weeks.filter(x => x.phase === wk.phase);
    meta.push({
      headline: wk.race ? `${race.name} am ${WEEKDAYS[L]}` : `${WEEKDAYS[L]} ${wk.long} km · ${wk.quality}`,
      note: wk.deload ? 'Entlastung' : wk.race ? 'Rennwoche' : wk.phase === 4 ? 'Taper' : '',
      deload: wk.deload,
      phase: { id: wk.phase, name, summary, time: `${fmtDay(inPhase[0]!.start)} – ${fmtDay(addDays(inPhase.at(-1)!.start, 6))}` },
    });
  }
  events.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));

  const peakKm = Math.max(...weeks.filter(w => !w.race).map(w => w.km));
  const warnings: string[] = [];
  if (longest < race.longOk) {
    warnings.push(`Der längste Lauf erreicht nur ${longest} km – für einen ${race.name} wären etwa ${race.longOk} km sinnvoll. Mit mehr Vorlaufzeit oder einem späteren Rennen wird die Vorbereitung sicherer.`);
  }
  if (cfg.weeklyKm < 8) warnings.push('Du startest fast ohne Laufumfang – der Plan beginnt bei 8 km pro Woche. Wenn sich das zu viel anfühlt, die erste Woche wiederholen.');

  return {
    ok: true,
    plan: {
      source: 'generated',
      name: `${race.name} ${formatDate(cfg.raceDate, { day: '2-digit', month: '2-digit', year: 'numeric' })}`,
      importedAt: new Date().toISOString(),
      events,
      meta,
    },
    weeks,
    peakKm,
    longest,
    paces: p
      ? { easy: `${formatPace(p.easyLo)}–${formatPace(p.easyHi)}`, mt: formatPace(p.m), thr: formatPace(p.thr), int: formatPace(p.int), hm: formatPace(p.hm) }
      : undefined,
    prediction,
    warnings,
  };
}
