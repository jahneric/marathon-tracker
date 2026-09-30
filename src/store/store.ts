import { produce } from 'immer';
import { useSyncExternalStore } from 'react';
import { DEFAULT_PACES } from '@/data/plan';
import { addDays } from '@/domain/dates';
import type { AppState } from './types';

const STORAGE_KEY = 'mt27';

export const defaultState = (): AppState => ({
  v: 1,
  settings: { start: '2026-09-28', paces: { ...DEFAULT_PACES }, theme: 'auto', goal: '3:30 – 3:45 h' },
  days: {},
  tournaments: {},
  shoes: [],
  weights: {},
  plan: null,
});

/** Füllt fehlende Felder auf (ältere Stände, importierte Backups) */
export function normalize(raw: unknown): AppState {
  const d = defaultState();
  if (!raw || typeof raw !== 'object') return d;
  const s = raw as Partial<AppState>;
  const settings = { ...d.settings, ...s.settings, paces: { ...d.settings.paces, ...s.settings?.paces } };
  return {
    ...d,
    ...s,
    v: 1,
    settings,
    days: s.days ?? {},
    tournaments: s.tournaments ?? {},
    shoes: s.shoes ?? [],
    weights: migrateWeights(s.weights ?? {}, settings.start),
    plan: s.plan ?? null,
  };
}

/** Früher waren Gewichte nach Wochennummer gespeichert, jetzt nach Montag der Kalenderwoche */
function migrateWeights(weights: Record<string, string>, start: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(weights)) {
    out[/^-?\d+$/.test(k) ? addDays(start, (Number(k) - 1) * 7) : k] = v;
  }
  return out;
}

export const isBackup = (raw: unknown): boolean =>
  !!raw && typeof raw === 'object' && 'days' in raw && 'settings' in raw;

function load(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return normalize(JSON.parse(raw));
  } catch (e) {
    console.error('Laden fehlgeschlagen', e);
  }
  return defaultState();
}

let state: AppState = load();
const listeners = new Set<() => void>();
let saveTimer: ReturnType<typeof setTimeout> | undefined;
let onSaveError: (() => void) | undefined;

function persist() {
  clearTimeout(saveTimer);
  saveTimer = undefined;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Speichern fehlgeschlagen', e);
    onSaveError?.();
  }
}

function commit(next: AppState, immediate = false) {
  if (next === state) return;
  state = next;
  clearTimeout(saveTimer);
  if (immediate) persist();
  else saveTimer = setTimeout(persist, 250);
  listeners.forEach(l => l());
}

export const getState = () => state;

export function update(recipe: (draft: AppState) => void) {
  commit(produce(state, recipe));
}

export function replaceState(next: AppState) {
  commit(next, true);
}

export function flush() {
  if (saveTimer !== undefined) persist();
}

export function setSaveErrorHandler(fn: () => void) {
  onSaveError = fn;
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export function useAppState(): AppState {
  return useSyncExternalStore(subscribe, getState);
}

if (typeof window !== 'undefined') {
  window.addEventListener('pagehide', flush);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) flush();
  });
  // Änderungen aus einem anderen Tab übernehmen
  window.addEventListener('storage', e => {
    if (e.key === STORAGE_KEY && e.newValue) {
      try {
        state = normalize(JSON.parse(e.newValue));
        listeners.forEach(l => l());
      } catch {
        /* ignorieren */
      }
    }
  });
}
