import type { Paces } from '@/data/plan';
import { EXERCISES, type ExerciseId, type WorkoutId } from '@/data/exercises';
import type { DateKey } from '@/domain/dates';
import { formatKm } from '@/domain/format';
import { emptyDay } from '@/domain/logs';
import { defaultState, normalize, replaceState, update } from './store';
import type { AppState, DayLog, ImportedPlan, PainLevel, PainSpot, SetLog, Settings, Unit, UnitLog, UnitType, Wellbeing } from './types';

const uid = (prefix: string) => prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);

function day(s: AppState, k: DateKey): DayLog {
  return (s.days[k] ??= emptyDay());
}

function log(s: AppState, k: DateKey, u: Unit): UnitLog {
  return (day(s, k).u[u.id] ??= { t: u.type, title: u.title });
}

export function editLog(k: DateKey, u: Unit, recipe: (l: UnitLog) => void) {
  update(s => recipe(log(s, k, u)));
}

/** Feld setzen; Eingabe von Menge/Zeit markiert die Einheit als erledigt */
export function setLogField<F extends keyof UnitLog>(k: DateKey, u: Unit, field: F, value: UnitLog[F]) {
  editLog(k, u, l => {
    l[field] = value;
    if ((field === 'km' || field === 'min' || field === 'dur') && value && !l.status) l.status = 'done';
  });
}

export function toggleField(k: DateKey, u: Unit, field: 'feel' | 'kind' | 'int' | 'variant', value: string) {
  editLog(k, u, l => {
    l[field] = l[field] === value ? null : value;
  });
}

export function toggleDone(k: DateKey, u: Unit): boolean {
  let done = false;
  editLog(k, u, l => {
    l.status = l.status === 'done' ? null : 'done';
    done = l.status === 'done';
    if (done && u.type === 'run' && !l.km && u.target) l.km = formatKm(u.target);
  });
  return done;
}

export function setStatus(k: DateKey, u: Unit, status: 'done' | 'skip') {
  editLog(k, u, l => {
    l.status = status;
  });
}

export function setSet(k: DateKey, u: Unit, exId: ExerciseId, i: number, field: 'kg' | 'r' | 's', value: string) {
  editLog(k, u, l => {
    const arr = ((l.ex ??= {})[exId] ??= []);
    const entry: SetLog = (arr[i] ??= {});
    entry[field] = value.replace(',', '.');
    if (!l.status && value) l.status = 'done';
  });
}

export function toggleSetCheck(k: DateKey, u: Unit, exId: ExerciseId, i: number) {
  editLog(k, u, l => {
    const arr = ((l.ex ??= {})[exId] ??= []);
    const entry: SetLog = (arr[i] ??= {});
    entry.c = !entry.c;
    if (!l.status) l.status = 'done';
  });
}

export function addSet(k: DateKey, u: Unit, exId: ExerciseId) {
  editLog(k, u, l => {
    const arr = ((l.ex ??= {})[exId] ??= []);
    const n = Math.max(EXERCISES[exId].sets, arr.length);
    for (let i = arr.length; i < n; i++) arr[i] = null;
    arr[n] = {};
  });
}

export function toggleMobility(k: DateKey, u: Unit, drillId: string, force?: boolean) {
  editLog(k, u, l => {
    const m = (l.m ??= {});
    m[drillId] = force ?? !m[drillId];
    if (Object.values(m).some(Boolean) && !l.status) l.status = 'done';
  });
}

export function toggleTournament(w: number) {
  update(s => {
    if (s.tournaments[w]) delete s.tournaments[w];
    else s.tournaments[w] = true;
  });
}

const EXTRA_TITLES: Record<Exclude<UnitType, 'rest'>, string> = {
  run: 'Zusätzlicher Lauf', kraft: 'Zusätzliche Krafteinheit', vb: 'Beachvolleyball', mob: 'Mobility', other: 'Sonstiges Training',
};

export function addExtra(k: DateKey, type: Exclude<UnitType, 'rest'>): string {
  const u: Unit = { id: uid('x'), type, title: EXTRA_TITLES[type], extra: true };
  if (type === 'kraft') u.workout = 'B' satisfies WorkoutId;
  update(s => {
    day(s, k).extra.push(u);
  });
  return u.id;
}

export function removeExtra(k: DateKey, id: string) {
  update(s => {
    const d = day(s, k);
    d.extra = d.extra.filter(x => x.id !== id);
    delete d.u[id];
  });
}

export function setWell<F extends keyof Wellbeing>(k: DateKey, field: F, value: Wellbeing[F]) {
  update(s => {
    day(s, k).well[field] = value;
  });
}

export function toggleEnergy(k: DateKey, v: string) {
  update(s => {
    const w = day(s, k).well;
    w.energy = w.energy === v ? null : v;
  });
}

/** zwickt → Schmerz → aus */
export function cyclePain(k: DateKey, spot: PainSpot) {
  update(s => {
    const pain = (day(s, k).well.pain ??= {});
    pain[spot] = (((pain[spot] ?? 0) + 1) % 3) as PainLevel;
  });
}

/** Körpergewicht der Kalenderwoche ab `monday` */
export function setWeekWeight(monday: DateKey, kg: string) {
  update(s => {
    if (kg.trim()) s.weights[monday] = kg.trim();
    else delete s.weights[monday];
  });
}

export function setImportedPlan(plan: ImportedPlan) {
  update(s => {
    s.plan = plan;
  });
}

export function resetToStandardPlan() {
  update(s => {
    s.plan = null;
  });
}

/** Alle geplanten Pflicht-Einheiten eines Tages als erledigt markieren */
export function markDayDone(k: DateKey, units: Unit[]) {
  update(s => {
    for (const u of units) {
      if (u.type === 'rest' || u.optional) continue;
      const l = log(s, k, u);
      if (l.status) continue;
      l.status = 'done';
      if (u.type === 'run' && !l.km && u.target) l.km = formatKm(u.target);
    }
  });
}

export function addShoe(name: string, baseKm: string) {
  update(s => {
    s.shoes.push({ id: uid('s'), name, baseKm });
  });
}

export function toggleShoeRetired(id: string) {
  update(s => {
    const shoe = s.shoes.find(x => x.id === id);
    if (shoe) shoe.retired = !shoe.retired;
  });
}

export function setSetting<F extends keyof Settings>(field: F, value: Settings[F]) {
  update(s => {
    s.settings[field] = value;
  });
}

export function setPace(field: keyof Paces, value: string) {
  update(s => {
    s.settings.paces[field] = value;
  });
}

export function importBackup(raw: unknown) {
  replaceState(normalize(raw));
}

export function resetAll() {
  replaceState(defaultState());
}
