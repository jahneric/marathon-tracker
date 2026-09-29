import { Flag } from 'lucide-react';
import { PHASES, PLAN_WEEKS } from '@/data/plan';
import { daysBetween, type DateKey } from '@/domain/dates';
import { raceDate, weekInfo } from '@/domain/schedule';
import type { AppState } from '@/store/types';
import styles from './TopBar.module.css';

export function TopBar({ state, today }: { state: AppState; today: DateKey }) {
  const { start } = state.settings;
  const { w, plan } = weekInfo(start, today);
  const toRace = daysBetween(raceDate(start), today);

  let sub: string;
  if (w < 1) sub = `Planstart in ${daysBetween(start, today)} Tagen`;
  else if (plan) sub = `Woche ${w}/${PLAN_WEEKS} · ${PHASES[plan.ph].name}`;
  else sub = 'Regeneration nach dem Marathon';

  return (
    <header className={styles.bar}>
      <div className={styles.inner}>
        <div className="grow">
          <h1 className={styles.title}>Marathon 2027</h1>
          <p className={styles.sub}>{sub}</p>
        </div>
        {toRace >= 0 && (
          <div className={styles.countdown} title="Tage bis zum Marathon">
            <Flag aria-hidden />
            <span className="num">{toRace}</span>
            <span className={styles.unit}>Tage</span>
          </div>
        )}
      </div>
    </header>
  );
}
