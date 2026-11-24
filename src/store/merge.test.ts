import { describe, expect, it } from 'vitest';
import { skipReasonCounts } from '@/domain/logs';
import { mergeStates } from './merge';
import { normalize } from './store';

describe('Gründe fürs Auslassen', () => {
  it('zählt Tage je Grund, mehrere Einheiten am selben Tag nur einmal', () => {
    const s = normalize({
      days: {
        '2026-11-02': { u: { a: { t: 'run', title: 'a', status: 'skip', reason: 'sick' }, b: { t: 'kraft', title: 'b', status: 'skip', reason: 'sick' } }, extra: [], well: {} },
        '2026-11-03': { u: { a: { t: 'run', title: 'a', status: 'skip', reason: 'sick' } }, extra: [], well: {} },
        '2026-11-05': { u: { a: { t: 'run', title: 'a', status: 'skip', reason: 'uni' }, c: { t: 'run', title: 'c', status: 'skip' } }, extra: [], well: {} },
        '2026-11-06': { u: { a: { t: 'run', title: 'a', status: 'done', reason: 'uni' } }, extra: [], well: {} },
      },
    });
    expect(skipReasonCounts(s)).toEqual([['krank', 2], ['Uni', 1], ['ohne Grund', 1]]);
    expect(skipReasonCounts(s, '2026-11-04')).toEqual([['Uni', 1], ['ohne Grund', 1]]);
  });
});

describe('Backup ergänzen', () => {
  const old = normalize({
    days: {
      '2026-10-01': { u: { run: { t: 'run', title: 'Lauf', km: '8', dur: '45:00', shoe: 'shoeOld', status: 'done' } }, extra: [], well: { sleep: '7' } },
      '2026-10-03': { u: { x1: { t: 'run', title: 'Lauf alt', km: '12', status: 'done' } }, extra: [], well: {} },
    },
    shoes: [{ id: 'shoeOld', name: 'Pegasus ', baseKm: '0' }, { id: 'shoe2', name: 'Trail', baseKm: '50' }],
    weights: { '2026-09-28': '78', '2026-10-05': '77,5' },
    settings: { goal: 'alt' },
  });
  const cur = normalize({
    days: {
      '2026-10-01': { u: { run: { t: 'run', title: 'Lauf', km: '8,2', dur: '', status: 'done' } }, extra: [], well: { weight: '77' } },
      '2026-11-20': { u: { run: { t: 'run', title: 'Lauf', km: '10', status: 'done' } }, extra: [], well: {} },
    },
    shoes: [{ id: 'shoeNew', name: 'pegasus', baseKm: '20' }],
    weights: { '2026-10-05': '77' },
    settings: { goal: 'neu' },
  });

  it('ergänzt alte Tage und behält aktuelle Einträge', () => {
    const { state, addedDays, mergedDays } = mergeStates(cur, old);
    expect(addedDays).toBe(1);
    expect(mergedDays).toBe(1);
    expect(Object.keys(state.days).sort()).toEqual(['2026-10-01', '2026-10-03', '2026-11-20']);
    // aktueller Wert gewinnt, leeres Feld wird aus dem Backup gefüllt
    expect(state.days['2026-10-01']!.u.run).toMatchObject({ km: '8,2', dur: '45:00', shoe: 'shoeNew' });
    expect(state.days['2026-10-01']!.well).toEqual({ sleep: '7', weight: '77' });
    expect(state.weights).toEqual({ '2026-09-28': '78', '2026-10-05': '77' });
    expect(state.settings.goal).toBe('neu');
  });

  it('legt gleiche Schuhe nicht doppelt an', () => {
    const { state } = mergeStates(cur, old);
    expect(state.shoes.map(s => s.id)).toEqual(['shoeNew', 'shoe2']);
  });

  it('macht Einträge ohne passende Planeinheit als eigene Einheit sichtbar', () => {
    const { state } = mergeStates(cur, old);
    expect(state.days['2026-10-03']!.extra).toEqual([{ id: 'x1', type: 'run', title: 'Lauf alt', extra: true }]);
  });

  it('ändert nichts, wenn dasselbe Backup zweimal ergänzt wird', () => {
    const once = mergeStates(cur, old).state;
    expect(mergeStates(once, old).state.days).toEqual(once.days);
  });
});
