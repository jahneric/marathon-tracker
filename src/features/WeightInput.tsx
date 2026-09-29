import { parseNum } from '@/domain/format';
import { setWeekWeight } from '@/store/actions';
import type { AppState } from '@/store/types';
import styles from './WeightInput.module.css';

/** kg-Eingabe für eine Trainingswoche, zeigt die Veränderung zur Vorwoche */
export function WeightInput({ state, week }: { state: AppState; week: number }) {
  const value = state.weights[week] ?? '';
  const prev = previousWeight(state, week);
  const cur = parseNum(value);
  const delta = cur != null && prev != null ? cur - prev : null;

  return (
    <div className={styles.wrap}>
      {delta != null && Math.abs(delta) >= 0.05 && (
        <span className={styles.delta} data-dir={delta > 0 ? 'up' : 'down'}>
          {delta > 0 ? '+' : '−'}
          {Math.abs(delta).toLocaleString('de-DE', { maximumFractionDigits: 1 })}
        </span>
      )}
      <label className={styles.field}>
        <input
          type="text"
          inputMode="decimal"
          value={value}
          placeholder={prev != null ? prev.toLocaleString('de-DE') : '–'}
          onChange={e => setWeekWeight(week, e.target.value)}
          aria-label={`Körpergewicht Woche ${week} in kg`}
        />
        <span>kg</span>
      </label>
    </div>
  );
}

function previousWeight(state: AppState, week: number): number | null {
  for (let w = week - 1; w >= -10; w--) {
    const kg = parseNum(state.weights[w]);
    if (kg != null) return kg;
  }
  return null;
}
