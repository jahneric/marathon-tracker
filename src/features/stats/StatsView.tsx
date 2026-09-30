import { useMemo, useState } from 'react';
import { EXERCISES, WEIGHTED_EXERCISES, type ExerciseId } from '@/data/exercises';
import { formatDate, type DateKey } from '@/domain/dates';
import { formatKm, formatPace, parseNum } from '@/domain/format';
import { formatSets, painCounts, PAIN_LABEL, shoeKm, strengthHistory, totals, weekKm, weightSeries } from '@/domain/logs';
import { activePlan, weekNumber } from '@/domain/activePlan';
import type { AppState } from '@/store/types';
import { Card } from '@/ui/Card';
import { LineChart, WeeklyKmChart } from './charts';
import styles from './stats.module.css';

export function StatsView({ state, today }: { state: AppState; today: DateKey }) {
  const t = useMemo(() => totals(state, today), [state, today]);
  const plan = activePlan(state);
  const current = weekNumber(plan, today);
  const [exId, setExId] = useState<ExerciseId>('legpress');

  const bars = plan.weeks.map(wk => ({ w: wk.w, planned: wk.km, actual: weekKm(state, wk.start), label: `(ab ${formatDate(wk.start)})` }));

  const weights = weightSeries(state).map(p => ({ x: formatDate(p.monday), y: p.kg }));
  const firstW = weights[0]?.y, lastW = weights.at(-1)?.y;

  const strength = strengthHistory(state, exId).map(p => ({
    x: formatDate(p.k, { day: '2-digit', month: '2-digit', year: '2-digit' }),
    y: p.kg,
    detail: formatSets(p.sets, 'w'),
  }));

  const pains = painCounts(state, today);

  return (
    <>
      <div className={styles.tiles}>
        <Tile value={formatKm(t.totalKm)} label="km gelaufen" accent />
        <Tile value={String(t.runs)} label="Läufe" />
        <Tile value={formatKm(t.longest)} label="längster Lauf (km)" />
        <Tile value={t.adherence != null ? `${Math.round(t.adherence * 100)} %` : '–'} label="Plantreue" />
        <Tile value={formatPace(t.recentPace)} label="Ø Pace 4 Wochen" />
        <Tile value={t.daysToRace != null ? String(t.daysToRace) : '–'} label="Tage bis Wettkampf" />
        <Tile value={String(t.kraft)} label="Krafteinheiten" />
        <Tile value={String(t.vb)} label={`Volleyball (${Math.round(t.vbHours)} h)`} />
        <Tile value={String(t.mob)} label="Mobility" />
      </div>

      <Card title="Wochenumfang Laufen">
        <div className={styles.legend}>
          <span><i className={styles.legPlanned} />geplant</span>
          <span><i className={styles.legActual} />gelaufen</span>
        </div>
        <WeeklyKmChart bars={bars} current={current} />
      </Card>

      <Card
        title="Körpergewicht"
        action={
          firstW != null && lastW != null && weights.length > 1 ? (
            <span className="small text-2 num">
              {lastW - firstW > 0 ? '+' : lastW - firstW < 0 ? '−' : '±'}
              {Math.abs(lastW - firstW).toLocaleString('de-DE', { maximumFractionDigits: 1 })} kg seit Start
            </span>
          ) : undefined
        }
      >
        <LineChart points={weights} color="var(--text-2)" unit="kg" label="Körpergewicht pro Woche" empty="Noch kein Gewicht eingetragen – auf „Heute“ oder im Plan pro Woche erfassen." />
      </Card>

      <Card title="Kraft-Progression">
        <select className={styles.select} value={exId} onChange={e => setExId(e.target.value as ExerciseId)} aria-label="Übung">
          {WEIGHTED_EXERCISES.map(id => (
            <option key={id} value={id}>{EXERCISES[id].name}</option>
          ))}
        </select>
        <LineChart points={strength} color="var(--kraft)" unit="kg" label="Höchstes Gewicht pro Einheit" empty="Noch keine Sätze mit Gewicht eingetragen." />
      </Card>

      <Card title="Beschwerden (letzte 28 Tage)">
        {pains.length ? (
          <table className={styles.table}>
            <thead><tr><th>Stelle</th><th>Tage</th></tr></thead>
            <tbody>
              {pains.map(([s, n]) => (
                <tr key={s}><td>{PAIN_LABEL[s]}</td><td className="num">{n}</td></tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="small muted">Keine Beschwerden eingetragen. 👍</p>
        )}
      </Card>

      {state.shoes.length > 0 && (
        <Card title="Laufschuhe">
          <table className={styles.table}>
            <thead><tr><th>Schuh</th><th>km</th><th /></tr></thead>
            <tbody>
              {state.shoes.map(s => {
                const km = shoeKm(state, s.id) + (parseNum(s.baseKm) ?? 0);
                return (
                  <tr key={s.id}>
                    <td>{s.name}{s.retired && <span className="muted small"> (aussortiert)</span>}</td>
                    <td className="num">{formatKm(km)}</td>
                    <td className="small">
                      {km >= 800 ? <span style={{ color: 'var(--bad)' }}>tauschen</span> : km >= 600 ? <span style={{ color: 'var(--warn)' }}>bald tauschen</span> : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}
    </>
  );
}

function Tile({ value, label, accent }: { value: string; label: string; accent?: boolean }) {
  return (
    <div className={styles.tile} data-accent={accent || undefined}>
      <div className={styles.tileValue}>{value}</div>
      <div className={styles.tileLabel}>{label}</div>
    </div>
  );
}
