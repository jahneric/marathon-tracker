import type { DateKey } from '@/domain/dates';
import { setLogField, toggleField } from '@/store/actions';
import type { Unit, UnitLog } from '@/store/types';
import { Field } from '@/ui/Field';
import { Segmented } from '@/ui/Segmented';

const KINDS = ['Training', 'Spiel', 'Turnier', 'Halle'].map(v => ({ value: v, label: v }));
const INTENSITY = ['1', '2', '3', '4', '5'].map(v => ({ value: v, label: v }));

export function VolleyForm({ date, unit: u, log: l }: { date: DateKey; unit: Unit; log: Partial<UnitLog> }) {
  const f = u.tournament ? 'result' : 'where';
  return (
    <>
      <div className="grid2">
        <Field label="Dauer (min)">
          <input type="text" inputMode="numeric" value={l.min ?? ''} placeholder="90" onChange={e => setLogField(date, u, 'min', e.target.value)} />
        </Field>
        <Field label={u.tournament ? 'Ergebnis / Platzierung' : 'Partner:in / Ort'}>
          <input type="text" value={l[f] ?? ''} onChange={e => setLogField(date, u, f, e.target.value)} />
        </Field>
      </div>
      <Field label="Art" asLabel={false}>
        <Segmented options={KINDS} value={l.kind} onChange={v => toggleField(date, u, 'kind', v)} label="Art" size="sm" />
      </Field>
      <Field label="Intensität" asLabel={false}>
        <Segmented options={INTENSITY} value={l.int} onChange={v => toggleField(date, u, 'int', v)} label="Intensität" size="sm" />
      </Field>
    </>
  );
}
