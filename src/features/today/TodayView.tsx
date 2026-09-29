import { useState } from 'react';
import type { DateKey } from '@/domain/dates';
import { dayUnits } from '@/domain/logs';
import { weekInfo } from '@/domain/schedule';
import type { AppState } from '@/store/types';
import { AddUnit } from './AddUnit';
import { DayNav } from './DayNav';
import { DayStatusCard } from './DayStatusCard';
import { PainAlert } from './PainAlert';
import { UnitCard } from './UnitCard';
import { WeekCard } from './WeekCard';
import { WellbeingCard } from './WellbeingCard';

interface Props {
  state: AppState;
  today: DateKey;
  date: DateKey;
}

export function TodayView({ state, today, date }: Props) {
  // Beim Tageswechsel alle Formulare schließen
  return <DayPage key={date} state={state} today={today} date={date} />;
}

function DayPage({ state, today, date }: Props) {
  const [openId, setOpenId] = useState<string | null>(null);
  const units = dayUnits(state, date);
  const { w, plan } = weekInfo(state.settings.start, date);

  return (
    <>
      <DayNav state={state} today={today} date={date} />
      <PainAlert state={state} date={date} />
      {plan && <WeekCard state={state} week={w} plan={plan} />}
      <DayStatusCard state={state} today={today} date={date} units={units} />
      {units.map(u => (
        <UnitCard
          key={u.id}
          state={state}
          date={date}
          unit={u}
          open={openId === u.id}
          onToggle={() => setOpenId(id => (id === u.id ? null : u.id))}
        />
      ))}
      <AddUnit date={date} onAdded={setOpenId} />
      <WellbeingCard date={date} well={state.days[date]?.well ?? {}} />
    </>
  );
}
