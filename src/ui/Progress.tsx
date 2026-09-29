import styles from './Progress.module.css';

export function Progress({ value, color = 'var(--run)', label }: { value: number; color?: string; label?: string }) {
  const pct = Math.max(0, Math.min(100, value * 100));
  return (
    <div className={styles.track} role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
      <div className={styles.bar} style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}
