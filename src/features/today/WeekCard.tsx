import { Pin, TriangleAlert } from 'lucide-react';
import type { ActivePlan, PlanWeekView } from '@/domain/activePlan';
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

export function WeekCard({ state, plan, week }: { state: AppState; plan: ActivePlan; week: PlanWeekView }) {
  const done = weekKm(state, week.start);
  const tour = plan.supportsTournaments && isTournament(state, week.w);

  return (
    <Card>
      <div className="row between wrap">
        <div className="row wrap" style={{ gap: 6 }}>
          {week.phase ? <Badge tone="accent">Phase {week.phase.id}</Badge> : <Badge tone="accent">Woche {week.w}</Badge>}
          {week.deload && <Badge tone="deload">Entlastung</Badge>}
          {week.race && <Badge tone="race">Wettkampf</Badge>}
          {tour && <Badge tone="tour">Turnierwoche</Badge>}
        </div>
        {week.km > 0 && (
          <div className="small text-2 num">
            <b className={styles.kmDone}>{formatKm(done)}</b> / {formatKm(week.km)} km
          </div>
        )}
      </div>
      {week.km > 0 && (
        <div style={{ marginTop: 10 }}>
          <Progress value={done / week.km} label="Wochenkilometer" />
        </div>
      )}

      {week.note && (
        <p className={styles.note}>
          <Pin aria-hidden /> {week.note}
        </p>
      )}

      <div className={styles.weekRows}>
        {plan.supportsTournaments && (
          <>
            <div className="row between">
              <span className="small text-2">Turnier am Wochenende?</span>
              <Button size="sm" active={tour} onClick={() => toggleTournament(week.w)}>
                {tour ? 'Ja – Turnierwoche' : 'Nein'}
              </Button>
            </div>
            {tour && week.w >= 45 && (
              <p className={styles.warn}>
                <TriangleAlert aria-hidden /> Ab Woche 45 und im Taper möglichst keine Turniere mehr.
              </p>
            )}
          </>
        )}
        <div className="row between">
          <span className="small text-2">Körpergewicht diese Woche</span>
          <WeightInput state={state} monday={week.start} label={`Körpergewicht Woche ${week.w} in kg`} />
        </div>
      </div>
    </Card>
  );
}
