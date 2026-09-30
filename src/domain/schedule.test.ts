import { describe, expect, it } from 'vitest';
import { PLAN } from '@/data/plan';
import { defaultState, normalize } from '@/store/store';
import type { AppState } from '@/store/types';
import { activePlan } from './activePlan';
import { addDays } from './dates';
import { formatPace, parseDuration } from './format';
import { parseIcs } from './ics';
import { eventsToUnits, extractKm } from './importedPlan';
import { dayStatus, dayUnits, weightSeries } from './logs';
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
      weights: { [addDays(START, 7)]: '74,5' },
      days: { [addDays(START, 2)]: { u: {}, extra: [], well: { weight: '75' } } },
    });
    expect(weightSeries(s)).toEqual([{ monday: START, kg: 75 }, { monday: addDays(START, 7), kg: 74.5 }]);
  });

  it('übernimmt alte Gewichte nach Wochennummer beim Laden', () => {
    const s = normalize({ settings: { start: START }, days: {}, weights: { 2: '74,5' } });
    expect(s.weights).toEqual({ [addDays(START, 7)]: '74,5' });
  });
});

describe('Plan-Import (.ics)', () => {
  const ICS = [
    'BEGIN:VCALENDAR',
    'X-WR-CALNAME:FlexMarathon',
    'BEGIN:VEVENT',
    'DTSTART;VALUE=DATE:20261006',
    'SUMMARY:Longjog 12 km',
    'DESCRIPTION:Ruhig laufen\\, Pace 6:10 min/km (9.7 km/h)\\nPuls 130-145',
    'END:VEVENT',
    'BEGIN:VEVENT',
    'DTSTART:20261001T050000Z',
    'SUMMARY:Tempo',
    ' lauf 8 km',
    'END:VEVENT',
    'BEGIN:VEVENT',
    'DTSTART;VALUE=DATE:20261004',
    'SUMMARY:Ruhetag',
    'END:VEVENT',
    'BEGIN:VEVENT',
    'DTSTART;VALUE=DATE:20270124',
    'SUMMARY:Marathon',
    'DESCRIPTION:42.2 km – viel Erfolg!',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  it('liest Termine, entfaltet Zeilen und sortiert', () => {
    const cal = parseIcs(ICS);
    expect(cal.name).toBe('FlexMarathon');
    expect(cal.events.map(e => [e.date, e.title])).toEqual([
      ['2026-10-01', 'Tempolauf 8 km'],
      ['2026-10-04', 'Ruhetag'],
      ['2026-10-06', 'Longjog 12 km'],
      ['2027-01-24', 'Marathon'],
    ]);
    expect(cal.events[2]!.description).toBe('Ruhig laufen, Pace 6:10 min/km (9.7 km/h)\nPuls 130-145');
  });

  it('erkennt Art, km und Wettkampf', () => {
    expect(extractKm('Pace 9.7 km/h', 'Longjog 12,5 km')).toBe(12.5);
    const { byDate, raceDate } = eventsToUnits(parseIcs(ICS).events);
    expect(byDate.get('2026-10-01')![0]).toMatchObject({ type: 'run', target: 8 });
    expect(byDate.get('2026-10-04')![0]!.type).toBe('rest');
    expect(raceDate).toBe('2027-01-24');
  });

  it('baut Wochen ab dem Montag der ersten Einheit', () => {
    const s = state({ plan: { source: 'ics', name: 'Test', importedAt: '', events: parseIcs(ICS).events } });
    const plan = activePlan(s);
    expect(plan.start).toBe('2026-09-28');
    expect(plan.weeks[0]).toMatchObject({ w: 1, km: 8 });
    expect(plan.weeks[1]).toMatchObject({ w: 2, km: 12 });
    expect(dayUnits(s, '2026-10-06')[0]!.title).toBe('Longjog 12 km');
    expect(plan.supportsTournaments).toBe(false);
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
