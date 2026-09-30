import { Check, Minus, Pencil, Trash2, X } from 'lucide-react';
import type { DateKey } from '@/domain/dates';
import { summarize, unitLog } from '@/domain/logs';
import { removeExtra, setLogField, setStatus, toggleDone } from '@/store/actions';
import type { AppState, Unit } from '@/store/types';
import { Button } from '@/ui/Button';
import { confirmDialog, toast } from '@/ui/feedback';
import { UNIT_META } from '../unitMeta';
import { KraftForm } from './forms/KraftForm';
import { MobilityForm } from './forms/MobilityForm';
import { OtherForm } from './forms/OtherForm';
import { RunForm } from './forms/RunForm';
import { VolleyForm } from './forms/VolleyForm';
import styles from './UnitCard.module.css';

interface Props {
  state: AppState;
  date: DateKey;
  unit: Unit;
  open: boolean;
  onToggle: () => void;
}

export function UnitCard({ state, date, unit: u, open, onToggle }: Props) {
  const log = unitLog(state, date, u.id);
  const status = log?.status;
  const meta = UNIT_META[u.type];
  const isRest = u.type === 'rest';
  const summary = log && !open ? summarize(u, log) : '';
  const hasEntry = !!log && (!!status || Object.keys(log).length > 2);

  const tags = [meta.label, u.time, u.optional && 'optional', u.extra && 'zusätzlich'].filter(Boolean).join(' · ');

  return (
    <article className={styles.card} data-status={status ?? undefined} data-race={u.race || undefined} style={{ '--c': meta.color, '--c-soft': meta.soft } as React.CSSProperties}>
      <div className={styles.main}>
        <button type="button" className={styles.body} onClick={isRest ? undefined : onToggle} disabled={isRest} aria-expanded={isRest ? undefined : open}>
          <span className={styles.icon}>
            <meta.Icon aria-hidden />
          </span>
          <span className={styles.text}>
            <span className={styles.tags}>{tags}</span>
            <span className={styles.title}>{u.title}</span>
            {u.detail && <span className={styles.detail}>{u.detail}</span>}
          </span>
        </button>
        {!isRest && (
          <button
            type="button"
            className={styles.check}
            data-status={status ?? undefined}
            aria-label={status === 'done' ? 'Als offen markieren' : 'Als erledigt markieren'}
            aria-pressed={status === 'done'}
            onClick={() => {
              if (toggleDone(date, u)) toast('Erledigt ✓');
            }}
          >
            {status === 'skip' ? <Minus /> : <Check />}
          </button>
        )}
      </div>

      {summary && <p className={styles.summary}>{summary}</p>}

      {!isRest && !open && (
        <Button size="sm" variant="ghost" icon={<Pencil />} className={styles.editBtn} onClick={onToggle}>
          {hasEntry ? 'Bearbeiten' : 'Eintragen'}
        </Button>
      )}

      {open && !isRest && (
        <div className={styles.form}>
          {u.info && u.info !== u.detail && <p className={styles.info}>{u.info}</p>}
          {u.type === 'run' && <RunForm state={state} date={date} unit={u} log={log ?? {}} />}
          {u.type === 'kraft' && <KraftForm state={state} date={date} unit={u} log={log ?? {}} />}
          {u.type === 'vb' && <VolleyForm date={date} unit={u} log={log ?? {}} />}
          {u.type === 'mob' && <MobilityForm date={date} unit={u} log={log ?? {}} />}
          {u.type === 'other' && <OtherForm date={date} unit={u} log={log ?? {}} />}

          <label className={styles.noteField}>
            <span>Notiz</span>
            <textarea value={log?.note ?? ''} placeholder="Wie lief's?" onChange={e => setLogField(date, u, 'note', e.target.value)} />
          </label>

          <div className={styles.actions}>
            <Button
              variant="primary"
              icon={<Check />}
              onClick={() => {
                setStatus(date, u, 'done');
                onToggle();
                toast('Gespeichert ✓');
              }}
            >
              Erledigt
            </Button>
            <Button
              icon={<X />}
              onClick={() => {
                setStatus(date, u, 'skip');
                onToggle();
              }}
            >
              Ausgelassen
            </Button>
            <Button variant="ghost" onClick={onToggle}>
              Schließen
            </Button>
            {u.extra && (
              <Button
                variant="danger"
                icon={<Trash2 />}
                className={styles.delete}
                onClick={async () => {
                  if (await confirmDialog({ title: 'Einheit löschen?', message: `„${u.title}“ und alle Einträge dazu werden entfernt.`, confirmLabel: 'Löschen', danger: true })) {
                    removeExtra(date, u.id);
                  }
                }}
              >
                Löschen
              </Button>
            )}
          </div>
        </div>
      )}
    </article>
  );
}
