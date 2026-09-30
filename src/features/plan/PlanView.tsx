import { useEffect, useState } from 'react';
import { activePlan, weekNumber } from '@/domain/activePlan';
import type { DateKey } from '@/domain/dates';
import type { AppState } from '@/store/types';
import { WeekRow } from './WeekRow';
import styles from './plan.module.css';

export function PlanView({ state, today }: { state: AppState; today: DateKey }) {
  const plan = activePlan(state);
  const current = weekNumber(plan, today);
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
        {plan.kind === 'builtin' && <span><i data-k="deload" />Entlastung</span>}
        <span><i data-k="race" />Wettkampf</span>
      </div>
      {plan.weeks.map((week, i) => {
        const phase = week.phase;
        const newPhase = phase && plan.weeks[i - 1]?.phase?.id !== phase.id;
        return (
          <div key={week.w} className={styles.group}>
            {newPhase && (
              <div className={styles.phase}>
                <h2>
                  Phase {phase.id}: {phase.name} <span className="muted small">· {phase.time}</span>
                </h2>
                <p className="small muted">{phase.summary}</p>
              </div>
            )}
            <WeekRow
              state={state}
              today={today}
              plan={plan}
              week={week}
              current={week.w === current}
              past={week.w < current}
              open={openWeek === week.w}
              onToggle={() => setOpenWeek(w => (w === week.w ? null : week.w))}
            />
          </div>
        );
      })}
    </>
  );
}
