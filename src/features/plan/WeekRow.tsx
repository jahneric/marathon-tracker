import { ChevronDown, Pin, Scale } from 'lucide-react';
import type { PlanWeek } from '@/data/plan';
import { addDays, formatDate, WEEKDAYS, type DateKey } from '@/domain/dates';
import { formatKm } from '@/domain/format';
import { dayStatus, dayUnits, isDone, unitLog, weekKm } from '@/domain/logs';
import { isTournament, weekStart } from '@/domain/schedule';
import { navigate } from '@/hooks/useRoute';
import { toggleTournament } from '@/store/actions';
import type { AppState } from '@/store/types';
import { Badge } from '@/ui/Badge';
import { Button } from '@/ui/Button';
import { UNIT_META } from '../unitMeta';
import { WeightInput } from '../WeightInput';
import styles from './plan.module.css';

interface Props {
  state: AppState;
  today: DateKey;
  plan: PlanWeek;
  current: boolean;
  past: boolean;
  open: boolean;
  onToggle: () => void;
}

export function WeekRow({ state, today, plan: p, current, past, open, onToggle }: Props) {
  const ws = weekStart(state.settings.start, p.w);
  const done = weekKm(state, p.w);
  const tour = isTournament(state, p.w);
  const days = Array.from({ length: 7 }, (_, i) => addDays(ws, i));
  const statuses = days.map(k => dayStatus(state, k, today));
  const trained = statuses.filter(s => s.state === 'done').length;
  const trainingDays = statuses.filter(s => s.state !== 'rest').length;
  const weight = state.weights[p.w];
  const longLabel = /^\d/.test(p.long) && !/km/.test(p.long) ? `${p.long} km` : p.long;

  return (
    <article
      id={`wk${p.w}`}
      className={styles.week}
      data-current={current || undefined}
      data-past={past || undefined}
      data-kind={p.race ? 'race' : p.deload ? 'deload' : undefined}
    >
      <button type="button" className={styles.head} onClick={onToggle} aria-expanded={open}>
        <span className={styles.no}>W{p.w}</span>
        <span className="grow">
          <span className={styles.meta}>
            ab {formatDate(ws, { day: '2-digit', month: '2-digit', year: '2-digit' })}
            {tour && <Badge tone="tour">Turnier</Badge>}
            {weight && (
              <span className={styles.weight}>
                <Scale aria-hidden /> {weight} kg
              </span>
            )}
          </span>
          <span className={styles.summary}>
            <b>Sa</b> {longLabel} · <b>Do</b> {p.quality}
          </span>
        </span>
        <span className={styles.km}>
          {(done > 0 || past || current) && <b>{formatKm(done)}</b>}
          {(done > 0 || past || current) && ' / '}
          {formatKm(p.km)} km
        </span>
        <ChevronDown aria-hidden className={styles.chev} />
      </button>

      <div className={styles.strip} aria-label={`${trained} von ${trainingDays} Trainingstagen erledigt`}>
        {statuses.map((s, i) => (
          <span key={i} className={styles.cell} data-state={s.state} title={`${WEEKDAYS[i]}: ${s.done}/${s.required}`} />
        ))}
      </div>

      {p.note && (
        <p className={styles.note}>
          <Pin aria-hidden /> {p.note}
        </p>
      )}

      {open && (
        <div className={styles.details}>
          <div className={styles.days}>
            {days.map((k, i) => {
              const units = dayUnits(state, k).filter(u => u.type !== 'rest');
              return (
                <button
                  key={k}
                  type="button"
                  className={styles.day}
                  data-state={statuses[i]!.state}
                  data-today={k === today || undefined}
                  onClick={() => navigate({ tab: 'heute', date: k === today ? undefined : k })}
                >
                  <b>{WEEKDAYS[i]}</b>
                  <span className="tiny">{formatDate(k, { day: 'numeric' })}.</span>
                  <span className={styles.dots}>
                    {units.map(u => (
                      <i key={u.id} style={{ background: isDone(unitLog(state, k, u.id)) ? UNIT_META[u.type].color : undefined }} />
                    ))}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="row between">
            <span className="small text-2">Körpergewicht</span>
            <WeightInput state={state} week={p.w} />
          </div>
          <div className="row between">
            <span className="small text-2">Turnier am Wochenende?</span>
            <Button size="sm" active={tour} onClick={() => toggleTournament(p.w)}>
              {tour ? 'Ja' : 'Nein'}
            </Button>
          </div>
        </div>
      )}
    </article>
  );
}
