import { Plus } from 'lucide-react';
import { EXERCISES, isWorkoutId, WORKOUTS, type ExerciseId, type WorkoutId } from '@/data/exercises';
import { formatDate, type DateKey } from '@/domain/dates';
import { formatSets, lastSets } from '@/domain/logs';
import { addSet, setSet, toggleField, toggleSetCheck } from '@/store/actions';
import type { AppState, Unit, UnitLog } from '@/store/types';
import { Button } from '@/ui/Button';
import { Field } from '@/ui/Field';
import { Segmented } from '@/ui/Segmented';
import styles from './forms.module.css';

interface Props { state: AppState; date: DateKey; unit: Unit; log: Partial<UnitLog> }

const variantOptions = (ids: WorkoutId[]) => ids.map(id => ({ value: id, label: WORKOUTS[id].short }));

export function KraftForm({ state, date, unit: u, log: l }: Props) {
  const variant: WorkoutId = isWorkoutId(l.variant) ? l.variant : u.workout ?? 'B';
  const isA = variant.startsWith('A');
  const showChooser = isA || u.extra;

  return (
    <>
      {showChooser && (
        <Field label="Programm" asLabel={false}>
          <Segmented
            options={variantOptions(u.extra ? ['A1', 'AT', 'A2', 'B', 'C'] : ['A1', 'AT', 'A2'])}
            value={variant}
            onChange={v => toggleField(date, u, 'variant', v)}
            label="Programm"
            size="sm"
          />
          {isA && !u.extra && (
            <p className="tiny muted">Wechsle erst auf A2, wenn die einbeinige Kniebeuge auf der Box sauber klappt – lieber zwei Wochen später als zu früh.</p>
          )}
        </Field>
      )}
      <p className="tiny muted">1–2 Wiederholungen im Tank lassen, nie bis zum Muskelversagen.</p>
      <div className={styles.exList}>
        {WORKOUTS[variant].ex.map(exId => (
          <ExerciseBlock key={exId} state={state} date={date} unit={u} log={l} exId={exId} />
        ))}
      </div>
    </>
  );
}

function ExerciseBlock({ state, date, unit: u, log: l, exId }: Props & { exId: ExerciseId }) {
  const e = EXERCISES[exId];
  const sets = l.ex?.[exId] ?? [];
  const n = Math.max(e.sets, sets.length);
  const last = lastSets(state, date, exId);

  return (
    <div className={styles.ex}>
      <div className={styles.exHead}>
        <span className={styles.exName}>{e.name}</span>
        <span className="tiny muted num">{e.sets} × {e.reps}</span>
      </div>
      <p className="tiny muted">
        {e.hint}
        {last && e.kind !== 'c' && (
          <>
            {' · '}
            <b className="text-2">Zuletzt ({formatDate(last.k)}):</b> {formatSets(last.sets, e.kind)}
          </>
        )}
      </p>
      <div className={styles.sets}>
        {Array.from({ length: n }, (_, i) => {
          const s = sets[i] ?? {};
          const prev = last?.sets[i] ?? {};
          if (e.kind === 'c') {
            return (
              <button key={i} type="button" className={styles.setCheck} aria-pressed={!!s.c} onClick={() => toggleSetCheck(date, u, exId, i)}>
                {i + 1}
              </button>
            );
          }
          if (e.kind === 's') {
            return (
              <div key={i} className={styles.set}>
                <input type="text" inputMode="numeric" value={s.s ?? ''} placeholder={prev.s || 's'} aria-label={`Satz ${i + 1} Sekunden`} onChange={ev => setSet(date, u, exId, i, 's', ev.target.value)} />
                <span>s</span>
              </div>
            );
          }
          return (
            <div key={i} className={styles.set}>
              <input type="text" inputMode="decimal" value={s.kg ?? ''} placeholder={prev.kg ?? 'kg'} aria-label={`Satz ${i + 1} Gewicht`} onChange={ev => setSet(date, u, exId, i, 'kg', ev.target.value)} />
              <span>×</span>
              <input type="text" inputMode="numeric" value={s.r ?? ''} placeholder={prev.r ?? 'Wdh'} aria-label={`Satz ${i + 1} Wiederholungen`} onChange={ev => setSet(date, u, exId, i, 'r', ev.target.value)} />
            </div>
          );
        })}
        {e.kind !== 'c' && (
          <Button size="sm" variant="ghost" icon={<Plus />} onClick={() => addSet(date, u, exId)}>
            Satz
          </Button>
        )}
      </div>
    </div>
  );
}
