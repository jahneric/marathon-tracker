import { Pin, TriangleAlert } from 'lucide-react';
import type { PlanWeek } from '@/data/plan';
import { formatKm } from '@/domain/format';
import { weekKm } from '@/domain/logs';
import { isTournament } from '@/domain/schedule';
import { toggleTournament } from '@/store/actions';
import type { AppState } from '@/store/types';
import { Badge } from '@/ui/Badge';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { Progress } from '@/ui/Progress';
import { WeightInput } from '../WeightInput';
import styles from './today.module.css';

export function WeekCard({ state, week, plan }: { state: AppState; week: number; plan: PlanWeek }) {
  const done = weekKm(state, week);
  const tour = isTournament(state, week);

  return (
    <Card>
      <div className="row between wrap">
        <div className="row wrap" style={{ gap: 6 }}>
          <Badge tone="accent">Phase {plan.ph}</Badge>
          {plan.deload && <Badge tone="deload">Entlastung</Badge>}
          {plan.race && <Badge tone="race">Wettkampf</Badge>}
          {tour && <Badge tone="tour">Turnierwoche</Badge>}
        </div>
        <div className="small text-2 num">
          <b className={styles.kmDone}>{formatKm(done)}</b> / {formatKm(plan.km)} km
        </div>
      </div>
      <div style={{ marginTop: 10 }}>
        <Progress value={done / plan.km} label="Wochenkilometer" />
      </div>

      {plan.note && (
        <p className={styles.note}>
          <Pin aria-hidden /> {plan.note}
        </p>
      )}

      <div className={styles.weekRows}>
        <div className="row between">
          <span className="small text-2">Turnier am Wochenende?</span>
          <Button size="sm" active={tour} onClick={() => toggleTournament(week)}>
            {tour ? 'Ja – Turnierwoche' : 'Nein'}
          </Button>
        </div>
        {tour && week >= 45 && (
          <p className={styles.warn}>
            <TriangleAlert aria-hidden /> Ab Woche 45 und im Taper möglichst keine Turniere mehr.
          </p>
        )}
        <div className="row between">
          <span className="small text-2">Körpergewicht diese Woche</span>
          <WeightInput state={state} week={week} />
        </div>
      </div>
    </Card>
  );
}
