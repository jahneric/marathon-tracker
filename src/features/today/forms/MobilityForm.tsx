import { Check, Pause, Play } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { MOBILITY, type MobilityDrill } from '@/data/exercises';
import type { DateKey } from '@/domain/dates';
import { formatDuration } from '@/domain/format';
import { beep, vibrate } from '@/lib/signals';
import { toggleMobility } from '@/store/actions';
import type { Unit, UnitLog } from '@/store/types';
import { toast } from '@/ui/feedback';
import styles from './forms.module.css';

export function MobilityForm({ date, unit: u, log: l }: { date: DateKey; unit: Unit; log: Partial<UnitLog> }) {
  const [running, setRunning] = useState<string | null>(null);
  const m = l.m ?? {};

  return (
    <>
      <div className={styles.mobList}>
        {MOBILITY.map(x => (
          <div key={x.id} className={styles.mobItem}>
            <button type="button" className={styles.mobCheck} aria-pressed={!!m[x.id]} aria-label={`${x.name} erledigt`} onClick={() => toggleMobility(date, u, x.id)}>
              <Check />
            </button>
            <div className="grow">
              <div className={styles.mobName}>{x.name}</div>
              <div className="tiny muted">{x.amount}</div>
            </div>
            {x.sec && (
              <DrillTimer
                drill={x}
                running={running === x.id}
                onStart={() => setRunning(x.id)}
                onStop={() => setRunning(null)}
                onFinish={() => {
                  setRunning(null);
                  toggleMobility(date, u, x.id, true);
                }}
              />
            )}
          </div>
        ))}
      </div>
      <p className="tiny muted">Vor Intervallen oder Volleyball nur dynamisch, kein langes Halten. Wenn nur zwei gehen: Couch Stretch + 90/90.</p>
    </>
  );
}

interface TimerProps {
  drill: MobilityDrill;
  running: boolean;
  onStart: () => void;
  onStop: () => void;
  onFinish: () => void;
}

function DrillTimer({ drill, running, onStart, onStop, onFinish }: TimerProps) {
  const perSide = drill.sec ?? 0;
  const total = perSide * (drill.sides ? 2 : 1);
  const [left, setLeft] = useState(total);
  const finish = useRef(onFinish);
  useEffect(() => {
    finish.current = onFinish;
  });

  useEffect(() => {
    if (!running) return;
    const end = Date.now() + total * 1000;
    let switched = false;
    beep(660);
    const iv = setInterval(() => {
      const rest = Math.max(0, Math.round((end - Date.now()) / 1000));
      setLeft(rest);
      if (drill.sides && !switched && rest <= perSide) {
        switched = true;
        beep(990);
        vibrate(200);
        toast('Seite wechseln');
      }
      if (rest <= 0) {
        clearInterval(iv);
        beep(880, 0.4);
        vibrate([200, 100, 200]);
        finish.current();
      }
    }, 250);
    return () => {
      clearInterval(iv);
      setLeft(total);
    };
  }, [running, total, perSide, drill.sides]);

  const side = drill.sides && running ? (left > perSide ? ' L' : ' R') : '';
  return (
    <button type="button" className={styles.timer} aria-pressed={running} onClick={running ? onStop : onStart}>
      {running ? <Pause /> : <Play />}
      <span className="num">
        {formatDuration(running ? left : total)}
        {side}
      </span>
    </button>
  );
}
