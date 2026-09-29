import styles from './Segmented.module.css';

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
}

interface SegmentedProps<T extends string> {
  options: readonly SegmentOption<T>[];
  value: string | null | undefined;
  onChange: (value: T) => void;
  label?: string;
  size?: 'sm' | 'md';
}

/** Auswahl-Chips; erneutes Antippen der aktiven Option wird ebenfalls gemeldet (zum Abwählen) */
export function Segmented<T extends string>({ options, value, onChange, label, size = 'md' }: SegmentedProps<T>) {
  return (
    <div className={styles.seg} role="group" aria-label={label} data-size={size}>
      {options.map(o => {
        const on = String(value ?? '') === o.value;
        return (
          <button key={o.value} type="button" className={on ? styles.on : undefined} aria-pressed={on} onClick={() => onChange(o.value)}>
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
