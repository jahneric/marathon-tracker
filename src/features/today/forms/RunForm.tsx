import type { DateKey } from '@/domain/dates';
import { formatKm, formatPace, parseDuration, parseNum } from '@/domain/format';
import { FEEL } from '@/domain/logs';
import { setLogField, toggleField } from '@/store/actions';
import type { AppState, Unit, UnitLog } from '@/store/types';
import { Field } from '@/ui/Field';
import { Segmented } from '@/ui/Segmented';
import styles from './forms.module.css';

const FEEL_OPTIONS = FEEL.map((label, i) => ({ value: String(i + 1), label }));

interface Props { state: AppState; date: DateKey; unit: Unit; log: Partial<UnitLog> }

export function RunForm({ state, date, unit: u, log: l }: Props) {
  const km = parseNum(l.km), sec = parseDuration(l.dur);
  const shoes = state.shoes.filter(s => !s.retired);

  return (
    <>
      <div className="grid2">
        <Field label={`Distanz (km)${u.target ? ` · geplant ${formatKm(u.target)}` : ''}`}>
          <input type="text" inputMode="decimal" value={l.km ?? ''} placeholder={u.target ? formatKm(u.target) : 'km'} onChange={e => setLogField(date, u, 'km', e.target.value)} />
        </Field>
        <Field label="Zeit (mm:ss / h:mm:ss)">
          <input type="text" inputMode="numeric" value={l.dur ?? ''} placeholder="z. B. 52:30" onChange={e => setLogField(date, u, 'dur', e.target.value)} />
        </Field>
      </div>

      <div className={styles.pace}>
        <span>Pace</span>
        <b className="num">{km && sec ? `${formatPace(sec / km)} /km` : '–'}</b>
      </div>

      <div className="grid2">
        <Field label="Ø Puls (optional)">
          <input type="text" inputMode="numeric" value={l.hr ?? ''} onChange={e => setLogField(date, u, 'hr', e.target.value)} />
        </Field>
        <Field label="Schuh">
          <select value={l.shoe ?? ''} onChange={e => setLogField(date, u, 'shoe', e.target.value)}>
            <option value="">–</option>
            {shoes.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Gefühl" asLabel={false}>
        <Segmented options={FEEL_OPTIONS} value={l.feel} onChange={v => toggleField(date, u, 'feel', v)} label="Gefühl" size="sm" />
      </Field>

      {!shoes.length && <p className="tiny muted">Tipp: Unter „Mehr“ Laufschuhe anlegen, um die km pro Paar zu zählen.</p>}
    </>
  );
}
