import { useEffect, useState } from 'react';
import { PHASES, PLAN } from '@/data/plan';
import type { DateKey } from '@/domain/dates';
import { weekInfo } from '@/domain/schedule';
import type { AppState } from '@/store/types';
import { WeekRow } from './WeekRow';
import styles from './plan.module.css';

export function PlanView({ state, today }: { state: AppState; today: DateKey }) {
  const current = weekInfo(state.settings.start, today).w;
  const [openWeek, setOpenWeek] = useState<number | null>(current);

  useEffect(() => {
    document.getElementById(`wk${current}`)?.scrollIntoView({ block: 'center' });
  }, [current]);

  return (
    <>
      <div className={styles.legend}>
        <span><i data-k="done" />erledigt</span>
        <span><i data-k="partial" />teilweise</span>
        <span><i data-k="missed" />verpasst</span>
        <span><i data-k="deload" />Entlastung</span>
        <span><i data-k="race" />Wettkampf</span>
      </div>
      {PLAN.map((p, i) => (
        <div key={p.w} className={styles.group}>
          {PLAN[i - 1]?.ph !== p.ph && (
            <div className={styles.phase}>
              <h2>
                Phase {p.ph}: {PHASES[p.ph].name} <span className="muted small">· {PHASES[p.ph].time}</span>
              </h2>
              <p className="small muted">{PHASES[p.ph].run}</p>
            </div>
          )}
          <WeekRow
            state={state}
            today={today}
            plan={p}
            current={p.w === current}
            past={p.w < current}
            open={openWeek === p.w}
            onToggle={() => setOpenWeek(w => (w === p.w ? null : p.w))}
          />
        </div>
      ))}
    </>
  );
}
