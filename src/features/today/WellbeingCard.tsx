import type { DateKey } from '@/domain/dates';
import { PAIN_LABEL } from '@/domain/logs';
import { cyclePain, setWell, toggleEnergy } from '@/store/actions';
import type { PainSpot, Wellbeing } from '@/store/types';
import { Card } from '@/ui/Card';
import { Field } from '@/ui/Field';
import { Segmented } from '@/ui/Segmented';
import styles from './today.module.css';

const ENERGY = ['1', '2', '3', '4', '5'].map(v => ({ value: v, label: v }));

export function WellbeingCard({ date, well }: { date: DateKey; well: Wellbeing }) {
  const pain = well.pain ?? {};
  return (
    <Card title="Befinden">
      <div className="stack">
        <Field label="Schlaf (h)">
          <input type="text" inputMode="decimal" value={well.sleep ?? ''} onChange={e => setWell(date, 'sleep', e.target.value)} />
        </Field>
        <Field label="Energie" asLabel={false}>
          <Segmented options={ENERGY} value={well.energy} onChange={v => toggleEnergy(date, v)} label="Energie" size="sm" />
        </Field>
        <Field label="Beschwerden" hint="Antippen: zwickt → Schmerz → aus" asLabel={false}>
          <div className={styles.pain}>
            {(Object.entries(PAIN_LABEL) as [PainSpot, string][]).map(([id, name]) => (
              <button key={id} type="button" data-level={pain[id] || undefined} onClick={() => cyclePain(date, id)}>
                {name}
              </button>
            ))}
          </div>
        </Field>
        <Field label="Tagesnotiz">
          <textarea value={well.note ?? ''} onChange={e => setWell(date, 'note', e.target.value)} />
        </Field>
      </div>
    </Card>
  );
}
