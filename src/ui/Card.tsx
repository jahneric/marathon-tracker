import type { HTMLAttributes, ReactNode } from 'react';
import styles from './Card.module.css';

interface CardProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  title?: ReactNode;
  action?: ReactNode;
}

export function Card({ title, action, className, children, ...rest }: CardProps) {
  return (
    <section className={[styles.card, className].filter(Boolean).join(' ')} {...rest}>
      {(title || action) && (
        <header className={styles.head}>
          {title && <h3 className={styles.title}>{title}</h3>}
          {action}
        </header>
      )}
      {children}
    </section>
  );
}
