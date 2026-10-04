import { CalendarPlus, ExternalLink, RotateCcw } from 'lucide-react';
import type { ChangeEvent } from 'react';
import { activePlan } from '@/domain/activePlan';
import { formatDate, weekday } from '@/domain/dates';
import { parseIcs } from '@/domain/ics';
import { resetToStandardPlan, setImportedPlan, setSetting } from '@/store/actions';
import type { AppState } from '@/store/types';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { confirmDialog, toast } from '@/ui/feedback';
import { Field } from '@/ui/Field';
import { PlanGenerator } from './PlanGenerator';
import styles from './settings.module.css';

const LAUFTIPPS_PLANS = 'https://lauftipps.ch/kostenlose-trainingsplaene/';
const fmt = (k: string) => formatDate(k, { day: '2-digit', month: '2-digit', year: 'numeric' });

export function PlanCard({ state }: { state: AppState }) {
  const plan = activePlan(state);
  const { settings } = state;

  const onImport = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const text = await file.text();
    const cal = parseIcs(text);
    if (!cal.events.length) return toast('Keine Trainings in der Datei gefunden');

    const first = cal.events[0]!.date, last = cal.events.at(-1)!.date;
    const fromLauftipps = /lauftipps/i.test(text);
    const name = cal.name || file.name.replace(/\.ics$/i, '').replace(/[_-]+/g, ' ').trim() || 'Importierter Plan';
    const ok = await confirmDialog({
      title: 'Plan importieren?',
      message: `„${name}“: ${cal.events.length} Einheiten vom ${fmt(first)} bis ${fmt(last)}. Der Plan ersetzt den aktuellen Plan – deine bisherigen Einträge bleiben gespeichert.`,
      confirmLabel: 'Importieren',
    });
    if (!ok) return;
    setImportedPlan({ source: fromLauftipps ? 'lauftipps' : 'ics', name, importedAt: new Date().toISOString(), events: cal.events });
    toast('Plan importiert ✓');
  };

  return (
    <Card title="Trainingsplan">
      <div className={styles.planInfo}>
        <div className="grow">
          <b>{plan.name}</b>
          <div className="tiny muted">
            {plan.kind === 'builtin'
              ? 'Standardplan · 52 Wochen · Laufen, Kraft, Beachvolleyball'
              : `${state.plan?.source === 'lauftipps' ? 'von lauftipps.ch · ' : state.plan?.source === 'generated' ? 'automatisch erstellt · ' : 'importiert · '}${plan.weeks.length} Wochen · ${fmt(plan.start)} – ${fmt(plan.end)}`}
          </div>
        </div>
        {plan.kind === 'imported' && (
          <Button
            size="sm"
            variant="ghost"
            icon={<RotateCcw />}
            onClick={async () => {
              if (await confirmDialog({ title: 'Zurück zum Standardplan?', message: 'Der aktuelle Plan wird entfernt. Deine Einträge bleiben gespeichert.', confirmLabel: 'Zurück wechseln' })) {
                resetToStandardPlan();
              }
            }}
          >
            Standardplan
          </Button>
        )}
      </div>

      {plan.kind === 'builtin' && (
        <div className="grid2" style={{ marginTop: 12 }}>
          <Field label="Planstart (Montag W1)">
            <input
              type="date"
              value={settings.start}
              onChange={e => {
                const v = e.target.value;
                if (!v) return;
                if (weekday(v) !== 0) return toast('Der Planstart muss ein Montag sein');
                setSetting('start', v);
                toast('Plan verschoben');
              }}
            />
          </Field>
          <Field label="Zielzeit">
            <input type="text" value={settings.goal} onChange={e => setSetting('goal', e.target.value)} />
          </Field>
        </div>
      )}
      {plan.kind === 'builtin' && plan.raceDate && (
        <p className="tiny muted" style={{ marginTop: 10 }}>
          Marathon: {formatDate(plan.raceDate, { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}. Bei anderem Renndatum den Start so verschieben, dass der Renntag am Sonntag von W52 liegt.
        </p>
      )}

      <PlanGenerator state={state} />

      <div className={styles.importBox}>
        <p className="small">
          <b>Fertigen Plan importieren:</b> Plan auf lauftipps.ch erstellen, dort „Terminkalender-Export“ wählen und die heruntergeladene <code>.ics</code>-Datei hier importieren. Andere Kalenderdateien mit Trainings funktionieren auch.
        </p>
        <div className="row wrap">
          <label className={styles.fileBtn}>
            <CalendarPlus aria-hidden /> Plan importieren (.ics)
            <input type="file" accept=".ics,text/calendar" onChange={onImport} className="visually-hidden" />
          </label>
          <a className={styles.link} href={LAUFTIPPS_PLANS} target="_blank" rel="noopener noreferrer">
            Pläne auf lauftipps.ch <ExternalLink aria-hidden />
          </a>
        </div>
      </div>
    </Card>
  );
}
