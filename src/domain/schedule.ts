import { HALF_MARATHON_WEEK, PHASES, PLAN, PLAN_WEEKS, RACE_WEEK, type Paces, type PlanWeek } from '@/data/plan';
import type { WorkoutId } from '@/data/exercises';
import type { AppState, Unit } from '@/store/types';
import { addDays, daysBetween, formatDate, weekday, type DateKey } from './dates';
import { formatKm, roundHalf } from './format';

export type PlanContext = Pick<AppState, 'settings' | 'tournaments'>;

export const raceDate = (start: DateKey): DateKey => addDays(start, (PLAN_WEEKS - 1) * 7 + 6);
export const weekStart = (start: DateKey, w: number): DateKey => addDays(start, (w - 1) * 7);

export interface WeekInfo {
  /** Wochennummer (kann < 1 oder > 52 sein) */
  w: number;
  /** 0 = Montag */
  dow: number;
  plan: PlanWeek | null;
}

export function weekInfo(start: DateKey, k: DateKey): WeekInfo {
  const w = Math.floor(daysBetween(k, start) / 7) + 1;
  return { w, dow: weekday(k), plan: (w >= 1 && w <= PLAN_WEEKS && PLAN[w - 1]) || null };
}

export const isTournament = (ctx: PlanContext, w: number): boolean => !!ctx.tournaments[w];

const isRaceWeek = (w: number) => w === HALF_MARATHON_WEEK || w === RACE_WEEK;

export function paceHint(paces: Paces, quality: string): string {
  if (/Schwelle|Tempodauerlauf/.test(quality)) return `Schwelle ~${paces.thr} /km`;
  if (/Intervalle/.test(quality)) return `Intervalle ~${paces.int} /km, Trabpause`;
  if (/HM-Tempo/.test(quality)) return `HM-Tempo ~${paces.hm} /km`;
  if (/MT/.test(quality)) return `Marathontempo ~${paces.mt} /km`;
  if (/Fahrtspiel/.test(quality)) return 'Belastung zügig, Pausen locker traben';
  if (/Bergsprints|Hügel/.test(quality)) return 'bergauf kräftig, zurück locker traben/gehen';
  if (/Steigerungen/.test(quality)) return `locker ${paces.easy} /km + 4–6 × 20 s zügig, volle Erholung`;
  return `locker ${paces.easy} /km`;
}

export type RunDay = 'mo' | 'di' | 'do' | 'so';

/** Verteilt die übrigen Wochen-km auf die lockeren Tage */
export function kmSplit(p: PlanWeek, tournament: boolean): Partial<Record<RunDay, number>> {
  const special = isRaceWeek(p.w);
  const base = p.w === RACE_WEEK ? 15 : p.km - p.longKm;
  const days: [RunDay, number][] = [];
  if (p.w >= 5) days.push(['mo', 0.7]);
  days.push(['di', 1]);
  if (!tournament) days.push(['do', special ? 1 : 1.2]);
  if (p.w >= 36 && !special && !tournament) days.push(['so', 0.6]);
  const sum = days.reduce((a, [, x]) => a + x, 0);
  const out: Partial<Record<RunDay, number>> = {};
  for (const [d, x] of days) out[d] = roundHalf((base * x) / sum);
  if (tournament) out.do = roundHalf(p.longKm * 0.7);
  return out;
}

export const kraftVariant = (w: number): WorkoutId => (w <= 13 ? 'A1' : w <= 18 ? 'AT' : 'A2');

const KRAFT_A_DETAIL: Record<number, (w: number) => string> = {
  1: () => 'schwer, 1–2 Wdh. im Tank',
  2: w => (w <= 18 ? 'Übergang: Beinpresse + Wadenpresse bleiben, dazu einbeinige Kniebeuge + Hip Airplanes' : 'komplexe, einbeinige Übungen'),
  3: () => 'A2 schwer, weniger Beinvolumen',
  4: () => 'Erhalt: kurz und schwer (ca. 45 min)',
  5: () => 'Erhalt, wenig Beinvolumen',
  6: () => 'nur leicht',
};

/** Die geplanten Einheiten eines Tages */
export function plannedUnits(ctx: PlanContext, k: DateKey): Unit[] {
  const { start, paces: P, goal } = ctx.settings;
  const { w, dow: d, plan: p } = weekInfo(start, k);
  const U: Unit[] = [];
  const add = (id: string, type: Unit['type'], title: string, detail: string, extra: Partial<Unit> = {}) =>
    U.push({ id, type, title, detail, ...extra });

  if (!p) {
    if (w < 1) {
      add('mob', 'mob', 'Hüft-Mobility', `Planstart am ${formatDate(start, { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' })}`);
    } else {
      add('run', 'run', 'Regeneration', '2–3 Wochen nach dem Marathon: nur locker oder gar nicht', { optional: true });
      add('mob', 'mob', 'Mobility', 'Volleyball wieder nach Lust');
    }
    return U;
  }

  const tour = isTournament(ctx, w);
  const km = kmSplit(p, tour);
  const kmTxt = (n: number | undefined) => formatKm(n ?? 0);
  const ph = p.ph;
  const prevTour = w > 1 && isTournament(ctx, w - 1);
  const easy = `locker ${P.easy} /km`;

  switch (d) {
    case 0: { // Montag
      if (w === RACE_WEEK) {
        add('mob', 'mob', 'Mobility statt Kraft A', 'Letzte 10 Tage vor dem Rennen: keine Beine');
      } else {
        const detail = prevTour ? 'Nach dem Turnier: ca. 70 % Gewicht oder nur Mobility' : (KRAFT_A_DETAIL[ph]?.(w) ?? '');
        add('kraftA', 'kraft', 'Kraft A – Unterkörper', detail, { workout: kraftVariant(w), time: 'morgens' });
      }
      if (w >= 5) add('run', 'run', 'Kurzer, sehr lockerer Lauf', `ca. ${kmTxt(km.mo)} km · ${easy}`, { target: km.mo, time: 'abends' });
      else if (prevTour) add('run', 'run', 'Optional 30 min locker', easy, { optional: true });
      break;
    }
    case 1: { // Dienstag
      let title = 'Lockerer Lauf', detail = `ca. ${kmTxt(km.di)} km · ${easy}`;
      if (w === HALF_MARATHON_WEEK) { title = 'Lauf mit 3 × 1 km HM-Tempo'; detail = `ca. ${kmTxt(km.di)} km · HM-Tempo ~${P.hm} /km, Rest locker`; }
      if (w === RACE_WEEK) { title = 'Lauf mit 3 × 1 km MT'; detail = `ca. ${kmTxt(km.di)} km · MT ~${P.mt} /km, Rest locker`; }
      add('run', 'run', title, detail, { target: km.di });
      add('mob', 'mob', 'Hüft-Mobility', 'nach dem Lauf, 10–15 min');
      break;
    }
    case 2: { // Mittwoch
      add('kraftB', 'kraft', 'Kraft B – Oberkörper Pull', 'vor dem Volleyball · Pull statt Push schont die Schulter', { workout: 'B', time: 'morgens' });
      if (ph < 6) add('vb', 'vb', 'Beachvolleyball-Training', PHASES[ph].vb, { time: 'nachmittags' });
      break;
    }
    case 3: { // Donnerstag
      if (tour) add('run', 'run', 'Verkürzter langer Lauf (Turnierwoche)', `ca. ${kmTxt(km.do)} km (70 %) · ${easy} · Qualitätslauf entfällt`, { target: km.do });
      else if (isRaceWeek(w)) add('run', 'run', 'Lockerer Lauf', `ca. ${kmTxt(km.do)} km · ${easy}`, { target: km.do });
      else add('run', 'run', p.quality, `ca. ${kmTxt(km.do)} km inkl. Ein-/Auslaufen · ${paceHint(P, p.quality)}`, { target: km.do });
      break;
    }
    case 4: { // Freitag
      add('kraftC', 'kraft', 'Kraft C – Oberkörper Push',
        tour ? 'Turnierwoche: normal, aber kein Satz nah ans Limit – Schultern schonen' : 'Hauptübung Bankdrücken progressiv steigern',
        { workout: 'C', time: 'morgens' });
      break;
    }
    case 5: { // Samstag
      if (tour) add('tour', 'vb', 'Turnier', 'harte Belastung – kein zusätzlicher Lauf', { tournament: true });
      else if (isRaceWeek(w)) add('rest', 'rest', 'Ruhe vor dem Rennen', 'optional 15–20 min ganz locker mit 2–3 Steigerungen');
      else {
        let detail = easy;
        if (/MT/.test(p.long)) detail += ` · MT-Abschnitt ~${P.mt} /km`;
        if (ph >= 4) detail += ' · Verpflegung üben (Gels/Getränk)';
        add('run', 'run', `Langer Lauf – ${p.long} km`, detail, { target: p.longKm });
        add('mob', 'mob', 'Hüft-Mobility', 'nach dem langen Lauf – mindestens Couch Stretch + 90/90');
      }
      break;
    }
    case 6: { // Sonntag
      if (tour) add('tour', 'vb', 'Turnier', 'harte Belastung – kein zusätzlicher Lauf', { tournament: true });
      else if (w === HALF_MARATHON_WEEK) add('run', 'run', 'Halbmarathon-Test', '21,1 km · danach Zielzeit und Tempi neu festlegen', { target: 21.1, race: true });
      else if (w === RACE_WEEK) add('run', 'run', 'Marathon', `42,2 km · Ziel ${goal} · MT ~${P.mt} /km`, { target: 42.2, race: true });
      else {
        if (w >= 36) add('run', 'run', 'Regenerativer Lauf (optional)', '30–40 min · sehr locker', { target: km.so, optional: true });
        else add('rest', 'rest', 'Ruhetag', 'Erholung ist Training');
        add('mob', 'mob', 'Hüft-Mobility', '10–15 min');
      }
      break;
    }
  }
  return U;
}
