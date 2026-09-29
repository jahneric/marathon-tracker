import type { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './Button.module.css';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: 'sm' | 'md';
  icon?: ReactNode;
  active?: boolean;
}

export function Button({ variant = 'secondary', size = 'md', icon, active, className, children, ...rest }: ButtonProps) {
  const cls = [styles.btn, styles[variant], styles[size], active && styles.active, className].filter(Boolean).join(' ');
  return (
    <button type="button" className={cls} {...rest}>
      {icon}
      {children}
    </button>
  );
}

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
}

export function IconButton({ label, className, children, ...rest }: IconButtonProps) {
  return (
    <button type="button" aria-label={label} title={label} className={[styles.iconBtn, className].filter(Boolean).join(' ')} {...rest}>
      {children}
    </button>
  );
}
