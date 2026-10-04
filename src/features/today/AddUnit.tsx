import { Plus, X } from '@/ui/icons';
import { useState } from 'react';
import type { DateKey } from '@/domain/dates';
import { addExtra } from '@/store/actions';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { UNIT_META } from '../unitMeta';
import styles from './today.module.css';

const TYPES = ['run', 'kraft', 'vb', 'mob', 'other'] as const;

export function AddUnit({ date, onAdded }: { date: DateKey; onAdded: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <Card
      title="Einheit hinzufügen"
      action={
        <Button size="sm" variant="ghost" icon={open ? <X /> : <Plus />} onClick={() => setOpen(o => !o)}>
          {open ? 'Schließen' : 'Hinzufügen'}
        </Button>
      }
      className={open ? undefined : styles.collapsed}
    >
      {open && (
        <div className={styles.addGrid}>
          {TYPES.map(t => {
            const { Icon, label, color, soft } = UNIT_META[t];
            return (
              <button
                key={t}
                type="button"
                className={styles.addType}
                style={{ '--c': color, '--c-soft': soft } as React.CSSProperties}
                onClick={() => {
                  onAdded(addExtra(date, t));
                  setOpen(false);
                }}
              >
                <Icon aria-hidden />
                {label}
              </button>
            );
          })}
        </div>
      )}
    </Card>
  );
}
