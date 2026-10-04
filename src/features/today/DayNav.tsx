import { ChevronLeft, ChevronRight } from '@/ui/icons';
import { addDays, formatDate, WEEKDAYS, WEEKDAYS_LONG, weekday, type DateKey } from '@/domain/dates';
import { dayStatus } from '@/domain/logs';
import { activePlan, planWeek, weekNumber } from '@/domain/activePlan';
import { navigate } from '@/hooks/useRoute';
import type { AppState } from '@/store/types';
import { Button, IconButton } from '@/ui/Button';
import styles from './DayNav.module.css';

const go = (date: DateKey, today: DateKey) => navigate({ tab: 'heute', date: date === today ? undefined : date }, { replace: true });

export function DayNav({ state, today, date }: { state: AppState; today: DateKey; date: DateKey }) {
  const plan = activePlan(state);
  const w = weekNumber(plan, date);
  const monday = addDays(date, -weekday(date));
  const isToday = date === today;

  return (
    <div className={styles.wrap}>
      <div className={styles.head}>
        <IconButton label="Vorheriger Tag" onClick={() => go(addDays(date, -1), today)}>
          <ChevronLeft />
        </IconButton>
        <div className={styles.center}>
          <div className={styles.date}>
            {isToday ? 'Heute' : WEEKDAYS_LONG[weekday(date)]}, {formatDate(date, { day: 'numeric', month: 'long' })}
          </div>
          <div className="small muted">
            {planWeek(plan, w) ? `Woche ${w}` : w < 1 ? 'vor Planstart' : 'nach dem Plan'}
            {!isToday && (
              <>
                {' · '}
                <Button size="sm" variant="ghost" className={styles.todayBtn} onClick={() => go(today, today)}>
                  zu heute
                </Button>
              </>
            )}
          </div>
        </div>
        <IconButton label="Nächster Tag" onClick={() => go(addDays(date, 1), today)}>
          <ChevronRight />
        </IconButton>
      </div>

      <div className={styles.strip} role="tablist" aria-label="Wochentage">
        {WEEKDAYS.map((label, i) => {
          const k = addDays(monday, i);
          const st = dayStatus(state, k, today).state;
          return (
            <button
              key={k}
              type="button"
              role="tab"
              aria-selected={k === date}
              className={styles.day}
              data-today={k === today || undefined}
              onClick={() => go(k, today)}
            >
              <span className={styles.dow}>{label}</span>
              <span className={styles.num}>{formatDate(k, { day: 'numeric' })}</span>
              <span className={styles.dot} data-state={st} aria-label={STATE_LABEL[st]} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

const STATE_LABEL = { done: 'erledigt', partial: 'teilweise', missed: 'verpasst', open: 'offen', rest: 'Ruhetag' } as const;
