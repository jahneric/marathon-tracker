import { describe, expect, it } from 'vitest';
import { PLAN } from '@/data/plan';
import { defaultState } from '@/store/store';
import type { AppState } from '@/store/types';
import { addDays } from './dates';
import { formatPace, parseDuration } from './format';
import { dayStatus, weightSeries } from './logs';
import { kmSplit, plannedUnits, raceDate, weekInfo } from './schedule';

const START = '2026-09-28'; // Montag

const state = (patch: Partial<AppState> = {}): AppState => ({ ...defaultState(), ...patch });

describe('Plan', () => {
  it('hat 52 Wochen und das Rennen am Sonntag der letzten Woche', () => {
    expect(PLAN).toHaveLength(52);
    expect(raceDate(START)).toBe('2027-09-26');
    expect(new Date(2027, 8, 26).getDay()).toBe(0);
  });

  it('ordnet Tage den Wochen zu', () => {
    expect(weekInfo(START, START)).toMatchObject({ w: 1, dow: 0 });
    expect(weekInfo(START, '2026-10-04')).toMatchObject({ w: 1, dow: 6 });
    expect(weekInfo(START, '2026-10-05').w).toBe(2);
    expect(weekInfo(START, '2026-09-27').plan).toBeNull();
  });

  it('verteilt die Wochen-km ungefähr auf den Plan', () => {
    for (const p of PLAN) {
      if (p.race) continue;
      const split = kmSplit(p, false);
      const sum = Object.values(split).reduce((a, b) => a + b, 0) + p.longKm;
      expect(Math.abs(sum - p.km)).toBeLessThanOrEqual(1.5);
    }
  });

  it('ersetzt in Turnierwochen den Qualitätslauf', () => {
    const s = state({ tournaments: { 6: true } });
    const thursday = addDays(START, 5 * 7 + 3);
    const [run] = plannedUnits(s, thursday);
    expect(run?.title).toMatch(/Turnierwoche/);
    const saturday = addDays(START, 5 * 7 + 5);
    expect(plannedUnits(s, saturday).map(u => u.id)).toEqual(['tour']);
  });

  it('plant am Renntag den Marathon', () => {
    const units = plannedUnits(state(), raceDate(START));
    expect(units[0]).toMatchObject({ type: 'run', race: true, target: 42.2 });
  });
});

describe('Tagesstatus', () => {
  const tuesday = addDays(START, 1);

  it('ist „verpasst“ für vergangene Tage ohne Eintrag', () => {
    expect(dayStatus(state(), tuesday, addDays(tuesday, 1)).state).toBe('missed');
    expect(dayStatus(state(), tuesday, tuesday).state).toBe('open');
  });

  it('unterscheidet teilweise und vollständig erledigt', () => {
    const partial = state({ days: { [tuesday]: { u: { run: { t: 'run', title: 'Lauf', status: 'done' } }, extra: [], well: {} } } });
    expect(dayStatus(partial, tuesday, tuesday)).toMatchObject({ state: 'partial', done: 1, required: 2 });

    const full = state({
      days: {
        [tuesday]: {
          u: { run: { t: 'run', title: 'Lauf', status: 'done' }, mob: { t: 'mob', title: 'Mob', status: 'done' } },
          extra: [],
          well: {},
        },
      },
    });
    expect(dayStatus(full, tuesday, tuesday).state).toBe('done');
  });
});

describe('Gewicht', () => {
  it('nutzt Wochenwerte und fällt auf alte Tageswerte zurück', () => {
    const s = state({
      weights: { 2: '74,5' },
      days: { [addDays(START, 2)]: { u: {}, extra: [], well: { weight: '75' } } },
    });
    expect(weightSeries(s)).toEqual([{ w: 1, kg: 75 }, { w: 2, kg: 74.5 }]);
  });
});

describe('Formatierung', () => {
  it('liest Zeiten und formatiert Pace', () => {
    expect(parseDuration('52:30')).toBe(3150);
    expect(parseDuration('1:45:00')).toBe(6300);
    expect(parseDuration('45')).toBe(2700);
    expect(formatPace(3150 / 10)).toBe('5:15');
    expect(formatPace(359.7)).toBe('6:00');
  });
});
