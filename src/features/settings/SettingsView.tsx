import { Download, Monitor, Moon, Plus, Sun, Trash2, Upload } from '@/ui/icons';
import { useState, type ChangeEvent } from 'react';
import type { Paces } from '@/data/plan';
import { todayKey } from '@/domain/dates';
import { formatKm, parseNum } from '@/domain/format';
import { shoeKm } from '@/domain/logs';
import { addShoe, importBackup, resetAll, setPace, setSetting, toggleShoeRetired } from '@/store/actions';
import { PlanCard } from './PlanCard';
import { flush, isBackup } from '@/store/store';
import type { AppState, Theme } from '@/store/types';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { confirmDialog, toast } from '@/ui/feedback';
import { Field } from '@/ui/Field';
import { Segmented } from '@/ui/Segmented';
import styles from './settings.module.css';

const PACE_FIELDS: [keyof Paces, string][] = [['easy', 'Locker'], ['mt', 'Marathontempo'], ['thr', 'Schwelle'], ['int', 'Intervalle'], ['hm', 'HM-Tempo']];
const THEMES = [{ value: 'auto', label: 'System' }, { value: 'light', label: 'Hell' }, { value: 'dark', label: 'Dunkel' }] as const;
const THEME_ICON = { auto: Monitor, light: Sun, dark: Moon };

export function SettingsView({ state }: { state: AppState }) {
  const { settings } = state;
  const ThemeIcon = THEME_ICON[settings.theme];

  return (
    <>
      <PlanCard state={state} />

      <Card title="Tempi (min/km)">
        <div className="grid2">
          {PACE_FIELDS.map(([id, label]) => (
            <Field key={id} label={label}>
              <input type="text" value={settings.paces[id]} onChange={e => setPace(id, e.target.value)} />
            </Field>
          ))}
        </div>
        <p className="tiny muted" style={{ marginTop: 10 }}>Nach dem HM-Test (W32) hier neu eintragen.</p>
      </Card>

      <ShoesCard state={state} />

      <Card title="Darstellung" action={<ThemeIcon className={styles.themeIcon} aria-hidden />}>
        <Segmented options={THEMES} value={settings.theme} onChange={v => setSetting('theme', v as Theme)} label="Farbschema" />
      </Card>

      <BackupCard state={state} />

      <Card title="Auf dem Handy installieren">
        <div className="stack small">
          <p><b>iPhone (Safari):</b> Teilen-Symbol → „Zum Home-Bildschirm“.</p>
          <p><b>Android (Chrome):</b> Menü ⋮ → „App installieren“.</p>
          <p className="muted">Danach läuft die App im Vollbild und auch offline. Updates werden automatisch angeboten.</p>
        </div>
      </Card>

      <p className="tiny muted" style={{ textAlign: 'center' }}>Version {__APP_VERSION__}</p>
    </>
  );
}

function ShoesCard({ state }: { state: AppState }) {
  const [name, setName] = useState('');
  const [base, setBase] = useState('');

  return (
    <Card title="Laufschuhe">
      {state.shoes.length > 0 && (
        <ul className={styles.shoes}>
          {state.shoes.map(s => (
            <li key={s.id} data-retired={s.retired || undefined}>
              <div className="grow">
                <b>{s.name}</b>
                <div className="tiny muted num">
                  {formatKm(shoeKm(state, s.id) + (parseNum(s.baseKm) ?? 0))} km{s.retired ? ' · aussortiert' : ''}
                </div>
              </div>
              <Button size="sm" onClick={() => toggleShoeRetired(s.id)}>{s.retired ? 'Aktivieren' : 'Aussortieren'}</Button>
            </li>
          ))}
        </ul>
      )}
      <form
        className={styles.shoeForm}
        onSubmit={e => {
          e.preventDefault();
          if (!name.trim()) return toast('Bitte Namen eingeben');
          addShoe(name.trim(), base.trim());
          setName('');
          setBase('');
          toast('Schuh hinzugefügt');
        }}
      >
        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Name, z. B. Pegasus 41" aria-label="Schuhname" />
        <input type="text" inputMode="decimal" value={base} onChange={e => setBase(e.target.value)} placeholder="bisherige km" aria-label="Bisherige Kilometer" />
        <Button type="submit" icon={<Plus />}>Hinzufügen</Button>
      </form>
    </Card>
  );
}

function BackupCard({ state }: { state: AppState }) {
  const exportBackup = () => {
    flush();
    const blob = new Blob([JSON.stringify(state, null, 1)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `marathon27-backup-${todayKey()}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  };

  const onImport = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const data: unknown = JSON.parse(await file.text());
      if (!isBackup(data)) throw new Error('kein Backup');
      if (await confirmDialog({ title: 'Backup importieren?', message: 'Die aktuellen Daten auf diesem Gerät werden ersetzt.', confirmLabel: 'Importieren' })) {
        importBackup(data);
        toast('Backup importiert ✓');
      }
    } catch {
      toast('Datei ist kein gültiges Backup');
    }
  };

  const onReset = async () => {
    if (await confirmDialog({ title: 'Alle Daten löschen?', message: 'Alle Einträge auf diesem Gerät werden gelöscht. Das kann nicht rückgängig gemacht werden.', confirmLabel: 'Alles löschen', danger: true })) {
      resetAll();
      toast('Alle Daten gelöscht');
    }
  };

  return (
    <Card title="Daten sichern">
      <p className="small text-2">
        Alle Daten liegen nur auf diesem Gerät. Exportiere regelmäßig ein Backup (z. B. in iCloud/Google Drive), um nichts zu verlieren oder die Daten auf ein anderes Gerät zu übertragen.
      </p>
      <div className="row wrap" style={{ marginTop: 12 }}>
        <Button variant="primary" icon={<Download />} onClick={exportBackup}>Backup exportieren</Button>
        <label className={styles.fileBtn}>
          <Upload aria-hidden /> Backup importieren
          <input type="file" accept="application/json,.json" onChange={onImport} className="visually-hidden" />
        </label>
      </div>
      <div className="row between" style={{ marginTop: 14 }}>
        <span className="tiny muted">{Object.keys(state.days).length} Tage mit Einträgen gespeichert</span>
        <Button size="sm" variant="danger" icon={<Trash2 />} onClick={onReset}>Alle Daten löschen</Button>
      </div>
    </Card>
  );
}
