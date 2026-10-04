import { CircleCheck, CircleDashed, CircleX, CircleDot, Moon } from '@/ui/icons';
import type { DateKey } from '@/domain/dates';
import { dayStatus, type DayState } from '@/domain/logs';
import { markDayDone } from '@/store/actions';
import type { AppState, Unit } from '@/store/types';
import { Button } from '@/ui/Button';
import { toast } from '@/ui/feedback';
import styles from './today.module.css';

const TEXT: Record<DayState, { title: string; Icon: typeof CircleCheck }> = {
  done: { title: 'Training erledigt', Icon: CircleCheck },
  partial: { title: 'Teilweise erledigt', Icon: CircleDot },
  missed: { title: 'Nicht trainiert', Icon: CircleX },
  open: { title: 'Noch offen', Icon: CircleDashed },
  rest: { title: 'Kein Pflichttraining', Icon: Moon },
};

/** Beantwortet auf einen Blick: Habe ich das Training für diesen Tag gemacht? */
export function DayStatusCard({ state, today, date, units }: { state: AppState; today: DateKey; date: DateKey; units: Unit[] }) {
  const st = dayStatus(state, date, today);
  const { title, Icon } = TEXT[st.state];
  const canMarkAll = st.required > 0 && st.done + st.skipped < st.required && date <= today;

  return (
    <div className={styles.status} data-state={st.state}>
      <Icon aria-hidden className={styles.statusIcon} />
      <div className="grow">
        <div className={styles.statusTitle}>{title}</div>
        {st.required > 0 && (
          <div className="tiny text-2 num">
            {st.done} von {st.required} Einheiten{st.skipped ? ` · ${st.skipped} ausgelassen` : ''}
          </div>
        )}
      </div>
      {canMarkAll && (
        <Button
          size="sm"
          variant="secondary"
          onClick={() => {
            markDayDone(date, units);
            toast('Alle Einheiten erledigt ✓');
          }}
        >
          Alles erledigt
        </Button>
      )}
    </div>
  );
}
