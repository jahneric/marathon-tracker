import { TriangleAlert } from 'lucide-react';
import type { DateKey } from '@/domain/dates';
import { PAIN_LABEL, recentPain } from '@/domain/logs';
import type { AppState } from '@/store/types';
import styles from './today.module.css';

/** „Schmerz vor Plan“ – erscheint bei Beschwerden am Tag selbst oder am Vortag */
export function PainAlert({ state, date }: { state: AppState; date: DateKey }) {
  const spots = recentPain(state, date);
  if (!spots.length) return null;
  const hard = spots.some(([, v]) => v >= 2);
  return (
    <div className={styles.alert} data-level={hard ? 'bad' : 'warn'} role="alert">
      <TriangleAlert aria-hidden />
      <div>
        <b>Schmerz vor Plan.</b> {spots.map(([s, v]) => `${PAIN_LABEL[s]} (${v >= 2 ? 'Schmerz' : 'zwickt'})`).join(', ')}.
        <br />
        {hard ? 'Stechender oder zunehmender Schmerz = Pause und abklären lassen.' : 'Zuerst den optionalen Lauf streichen, dann Umfang reduzieren.'}
      </div>
    </div>
  );
}
