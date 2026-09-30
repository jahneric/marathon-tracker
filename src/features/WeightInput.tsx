import type { DateKey } from '@/domain/dates';
import { parseNum } from '@/domain/format';
import { setWeekWeight } from '@/store/actions';
import type { AppState } from '@/store/types';
import styles from './WeightInput.module.css';

/** kg-Eingabe für eine Kalenderwoche (ab `monday`), zeigt die Veränderung zum letzten Eintrag */
export function WeightInput({ state, monday, label }: { state: AppState; monday: DateKey; label: string }) {
  const value = state.weights[monday] ?? '';
  const prev = previousWeight(state, monday);
  const cur = parseNum(value);
  const delta = cur != null && prev != null ? cur - prev : null;

  return (
    <div className={styles.wrap}>
      {delta != null && Math.abs(delta) >= 0.05 && (
        <span className={styles.delta}>
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
          onChange={e => setWeekWeight(monday, e.target.value)}
          aria-label={label}
        />
        <span>kg</span>
      </label>
    </div>
  );
}

function previousWeight(state: AppState, monday: DateKey): number | null {
  const earlier = Object.keys(state.weights).filter(k => k < monday).sort();
  for (let i = earlier.length - 1; i >= 0; i--) {
    const kg = parseNum(state.weights[earlier[i]!]);
    if (kg != null) return kg;
  }
  return null;
}
