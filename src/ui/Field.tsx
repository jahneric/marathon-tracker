import type { ReactNode } from 'react';
import styles from './Field.module.css';

interface FieldProps {
  label: ReactNode;
  children: ReactNode;
  hint?: ReactNode;
  /** false, wenn children kein einzelnes Eingabefeld ist (dann <div> statt <label>) */
  asLabel?: boolean;
}

export function Field({ label, children, hint, asLabel = true }: FieldProps) {
  const Tag = asLabel ? 'label' : 'div';
  return (
    <Tag className={styles.field}>
      <span className={styles.label}>{label}</span>
      {children}
      {hint && <span className={styles.hint}>{hint}</span>}
    </Tag>
  );
}
