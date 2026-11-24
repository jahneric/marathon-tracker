import { activePlan } from '@/domain/activePlan';
import { emptyDay } from '@/domain/logs';
import type { AppState, Unit, UnitLog } from './types';

const isPlainObject = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
const isEmpty = (v: unknown) => v == null || v === '' || (Array.isArray(v) && v.length === 0);

/** Feldweise zusammenführen: Werte aus `cur` gewinnen, leere Felder werden aus `old` ergänzt */
function fill<T>(old: T, cur: T): T {
  if (!isPlainObject(old) || !isPlainObject(cur)) return isEmpty(cur) ? old : cur;
  const out: Record<string, unknown> = { ...old };
  for (const [k, v] of Object.entries(cur)) out[k] = k in old ? fill(old[k], v) : v;
  return out as T;
}

export interface MergeResult {
  state: AppState;
  /** Tage, die nur im Backup standen */
  addedDays: number;
  /** Tage, die in beiden Ständen vorkamen und ergänzt wurden */
  mergedDays: number;
}

/**
 * Führt ein älteres Backup in den aktuellen Stand ein. Bei Konflikten gewinnt der aktuelle Stand;
 * Plan und Einstellungen bleiben unverändert.
 */
export function mergeStates(cur: AppState, old: AppState): MergeResult {
  // gleiche Schuhe (per Name) nicht doppelt anlegen, Einträge auf den aktuellen Schuh umbiegen
  const shoeId = new Map<string, string>();
  const shoes = [...cur.shoes];
  for (const s of old.shoes) {
    const same = cur.shoes.find(c => c.id === s.id || c.name.trim().toLowerCase() === s.name.trim().toLowerCase());
    if (same) shoeId.set(s.id, same.id);
    else shoes.push(s);
  }

  const state: AppState = {
    ...cur,
    shoes,
    days: { ...cur.days },
    tournaments: { ...old.tournaments, ...cur.tournaments },
    weights: fill(old.weights, cur.weights),
  };
  const plan = activePlan(state);
  let addedDays = 0, mergedDays = 0;

  for (const [k, oldDay] of Object.entries(old.days)) {
    const u: Record<string, UnitLog> = {};
    for (const [id, l] of Object.entries(oldDay.u)) u[id] = l.shoe && shoeId.has(l.shoe) ? { ...l, shoe: shoeId.get(l.shoe)! } : l;
    const curDay = cur.days[k];
    if (curDay) mergedDays++;
    else addedDays++;
    const day = curDay ?? emptyDay();

    const extra = [...day.extra];
    for (const x of oldDay.extra ?? []) if (!extra.some(e => e.id === x.id)) extra.push(x);
    // Einträge zu Einheiten, die der aktuelle Plan an diesem Tag nicht hat, als eigene Einheit behalten
    const known = new Set([...plan.units(k).map(x => x.id), ...extra.map(x => x.id)]);
    for (const [id, l] of Object.entries(u)) {
      if (!known.has(id) && !day.u[id]) extra.push({ id, type: l.t, title: l.title, extra: true } satisfies Unit);
    }

    const logs: Record<string, UnitLog> = { ...u };
    for (const [id, l] of Object.entries(day.u)) logs[id] = u[id] ? fill(u[id], l) : l;
    state.days[k] = { u: logs, extra, well: fill(oldDay.well ?? {}, day.well) };
  }

  return { state, addedDays, mergedDays };
}
