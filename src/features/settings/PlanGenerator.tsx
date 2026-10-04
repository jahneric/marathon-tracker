import { Sparkles } from '@/ui/icons';
import { useMemo, useState } from 'react';
import { mondayOf } from '@/domain/activePlan';
import { addDays, formatDate, todayKey, weekday } from '@/domain/dates';
import { parseDuration, parseNum } from '@/domain/format';
import { generatePlan, RACES, type GenOutcome, type RaceKind } from '@/domain/generator';
import { setGeneratedPlan } from '@/store/actions';
import type { AppState } from '@/store/types';
import { Button } from '@/ui/Button';
import { confirmDialog, toast } from '@/ui/feedback';
import { Field } from '@/ui/Field';
import { Segmented } from '@/ui/Segmented';
import styles from './settings.module.css';

const RACE_OPTIONS = (Object.keys(RACES) as RaceKind[]).map(value => ({ value, label: RACES[value].name }));
const DAY_OPTIONS = [{ value: '3', label: '3' }, { value: '4', label: '4' }, { value: '5', label: '5' }] as const;
const STRENGTH_OPTIONS = [{ value: '0', label: 'keine' }, { value: '2', label: '2× pro Woche' }, { value: '3', label: '3× pro Woche' }] as const;
const MOB_OPTIONS = [{ value: '1', label: 'ja' }, { value: '0', label: 'nein' }] as const;

const nextMonday = () => {
  const today = todayKey();
  return weekday(today) === 0 ? today : addDays(mondayOf(today), 7);
};

/** Plan aus Kennzahlen errechnen: Wettkampf, Termin, aktueller Stand */
export function PlanGenerator({ state }: { state: AppState }) {
  const [race, setRace] = useState<RaceKind>('hm');
  const [raceDate, setRaceDate] = useState('');
  const [start, setStart] = useState(nextMonday);
  const [weeklyKm, setWeeklyKm] = useState('');
  const [longRun, setLongRun] = useState('');
  const [runDays, setRunDays] = useState<'3' | '4' | '5'>('3');
  const [refKm, setRefKm] = useState('10');
  const [refTime, setRefTime] = useState('');
  const [strength, setStrength] = useState<'0' | '2' | '3'>('0');
  const [mobility, setMobility] = useState<'0' | '1'>('1');

  const outcome = useMemo<GenOutcome | null>(() => {
    const km = parseNum(weeklyKm), long = parseNum(longRun);
    if (!raceDate || !start || km == null || long == null) return null;
    const refSec = parseDuration(refTime);
    return generatePlan({
      race, raceDate, start, weeklyKm: km, longRun: long,
      runDays: Number(runDays) as 3 | 4 | 5,
      strength: Number(strength) as 0 | 2 | 3,
      mobility: mobility === '1',
      ...(refSec ? { refKm: Number(refKm), refSec } : {}),
    });
  }, [race, raceDate, start, weeklyKm, longRun, runDays, refKm, refTime, strength, mobility]);

  const apply = async () => {
    if (!outcome?.ok) return;
    const ok = await confirmDialog({
      title: 'Plan übernehmen?',
      message: `„${outcome.plan.name}“ ersetzt den aktuellen Plan${state.plan ? ` „${state.plan.name}“` : ''}. Deine bisherigen Einträge bleiben gespeichert.${outcome.paces ? ' Tempobereiche und Zielzeit werden aus deiner Bestzeit neu gesetzt.' : ''}`,
      confirmLabel: 'Übernehmen',
    });
    if (!ok) return;
    setGeneratedPlan(outcome.plan, outcome.paces, outcome.prediction && `${outcome.prediction} h (Prognose)`);
    toast('Plan erstellt ✓ – Übersicht im Tab „Plan“');
  };

  return (
    <details className={styles.gen}>
      <summary>Plan automatisch erstellen</summary>
      <div className={styles.genBody}>
        <p className="small muted">
          Wettkampf, Termin und deinen aktuellen Stand eingeben – die App errechnet daraus Wochenumfänge, lange Läufe, Tempoeinheiten und den Taper.
        </p>
        <Field label="Wettkampf" asLabel={false}>
          <Segmented options={RACE_OPTIONS} value={race} onChange={setRace} label="Wettkampf" size="sm" />
        </Field>
        <div className="grid2">
          <Field label="Wettkampftermin">
            <input type="date" value={raceDate} min={start} onChange={e => setRaceDate(e.target.value)} />
          </Field>
          <Field label="Planstart (Montag)">
            <input type="date" value={start} onChange={e => setStart(e.target.value)} />
          </Field>
          <Field label="Aktuelle km pro Woche" hint="Schnitt der letzten 4 Wochen">
            <input type="text" inputMode="decimal" value={weeklyKm} placeholder="z. B. 12" onChange={e => setWeeklyKm(e.target.value)} />
          </Field>
          <Field label="Längster Lauf zuletzt (km)" hint="in den letzten 4 Wochen">
            <input type="text" inputMode="decimal" value={longRun} placeholder="z. B. 7" onChange={e => setLongRun(e.target.value)} />
          </Field>
        </div>
        <Field label="Läufe pro Woche" asLabel={false}>
          <Segmented options={DAY_OPTIONS} value={runDays} onChange={setRunDays} label="Läufe pro Woche" size="sm" />
        </Field>
        <div className="grid2">
          <Field label="Aktuelle Bestzeit über">
            <select value={refKm} onChange={e => setRefKm(e.target.value)}>
              <option value="5">5 km</option>
              <option value="10">10 km</option>
              <option value="21.0975">Halbmarathon</option>
              <option value="42.195">Marathon</option>
            </select>
          </Field>
          <Field label="Zeit (optional)" hint="für Tempi und Prognose">
            <input type="text" inputMode="numeric" value={refTime} placeholder="z. B. 52:30" onChange={e => setRefTime(e.target.value)} />
          </Field>
        </div>
        <Field label="Krafttraining" asLabel={false}>
          <Segmented options={STRENGTH_OPTIONS} value={strength} onChange={setStrength} label="Krafttraining" size="sm" />
        </Field>
        <Field label="Hüft-Mobility nach den Läufen" asLabel={false}>
          <Segmented options={MOB_OPTIONS} value={mobility} onChange={setMobility} label="Mobility" size="sm" />
        </Field>

        {!outcome && <p className="small muted">Termin, Wochenkilometer und längsten Lauf ausfüllen – dann erscheint hier die Vorschau.</p>}
        {outcome && !outcome.ok && <p className={styles.genWarn}>{outcome.error}</p>}
        {outcome?.ok && (
          <>
            <div className={styles.genStats}>
              <div><span className="tiny muted">Dauer</span><b>{outcome.weeks.length} Wochen</b></div>
              <div><span className="tiny muted">Spitzenumfang</span><b>{outcome.peakKm} km</b></div>
              <div><span className="tiny muted">Längster Lauf</span><b>{outcome.longest} km</b></div>
              {outcome.prediction && <div><span className="tiny muted">Prognose</span><b>{outcome.prediction} h</b></div>}
            </div>
            {outcome.paces && (
              <p className="small text-2 num">
                Tempi pro km: locker {outcome.paces.easy} · Schwelle {outcome.paces.thr} · Intervalle {outcome.paces.int}
                {race === 'hm' && ` · HM-Tempo ${outcome.paces.hm}`}
                {race === 'm' && ` · Marathontempo ${outcome.paces.mt}`}
              </p>
            )}
            {outcome.warnings.map(w => <p key={w} className={styles.genWarn}>{w}</p>)}
            <div className={styles.genScroll}>
              <table className={styles.genTable}>
                <thead><tr><th>W</th><th>ab</th><th>km</th><th>lang</th><th>Tempoeinheit</th></tr></thead>
                <tbody>
                  {outcome.weeks.map(w => (
                    <tr key={w.w} data-deload={w.deload || undefined}>
                      <td className="num">{w.w}</td>
                      <td className="num">{formatDate(w.start)}</td>
                      <td className="num">{Math.round(w.km)}</td>
                      <td className="num">{w.long}</td>
                      <td>{w.race ? `${RACES[race].name} · davor ${w.quality}` : w.deload ? `Entlastung · ${w.quality}` : w.quality}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Button variant="primary" icon={<Sparkles />} onClick={apply}>Plan übernehmen</Button>
          </>
        )}
      </div>
    </details>
  );
}
