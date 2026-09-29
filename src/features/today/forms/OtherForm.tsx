import type { DateKey } from '@/domain/dates';
import { setLogField } from '@/store/actions';
import type { Unit, UnitLog } from '@/store/types';
import { Field } from '@/ui/Field';

export function OtherForm({ date, unit: u, log: l }: { date: DateKey; unit: Unit; log: Partial<UnitLog> }) {
  return (
    <div className="grid2">
      <Field label="Was?">
        <input type="text" value={l.what ?? ''} placeholder="Radfahren, Schwimmen …" onChange={e => setLogField(date, u, 'what', e.target.value)} />
      </Field>
      <Field label="Dauer (min)">
        <input type="text" inputMode="numeric" value={l.min ?? ''} onChange={e => setLogField(date, u, 'min', e.target.value)} />
      </Field>
    </div>
  );
}
