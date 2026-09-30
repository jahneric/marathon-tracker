import { Flag } from 'lucide-react';
import { activePlan, planWeek, weekNumber } from '@/domain/activePlan';
import { daysBetween, type DateKey } from '@/domain/dates';
import type { AppState } from '@/store/types';
import styles from './TopBar.module.css';

export function TopBar({ state, today }: { state: AppState; today: DateKey }) {
  const plan = activePlan(state);
  const w = weekNumber(plan, today);
  const week = planWeek(plan, w);
  const toRace = plan.raceDate ? daysBetween(plan.raceDate, today) : -1;

  let sub: string;
  if (w < 1) sub = `Planstart in ${daysBetween(plan.start, today)} Tagen`;
  else if (week) sub = `Woche ${w}/${plan.weeks.length}${week.phase ? ` · ${week.phase.name}` : ''}`;
  else sub = 'Plan abgeschlossen';

  return (
    <header className={styles.bar}>
      <div className={styles.inner}>
        <div className="grow">
          <h1 className={styles.title}>{plan.name}</h1>
          <p className={styles.sub}>{sub}</p>
        </div>
        {toRace >= 0 && (
          <div className={styles.countdown} title="Tage bis zum Wettkampf">
            <Flag aria-hidden />
            <span className="num">{toRace}</span>
            <span className={styles.unit}>Tage</span>
          </div>
        )}
      </div>
    </header>
  );
}
