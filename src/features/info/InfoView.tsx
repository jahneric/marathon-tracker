import type { ReactNode } from 'react';
import { EXERCISES, MOBILITY, WORKOUTS, type WorkoutId } from '@/data/exercises';
import { PHASES, RULES, type PhaseId } from '@/data/plan';
import { formatDate } from '@/domain/dates';
import { raceDate } from '@/domain/schedule';
import type { AppState } from '@/store/types';
import { Card } from '@/ui/Card';
import styles from './info.module.css';

function Section({ title, open, children }: { title: string; open?: boolean; children: ReactNode }) {
  return (
    <details className={styles.section} open={open}>
      <summary>{title}</summary>
      <div className={styles.body}>{children}</div>
    </details>
  );
}

function WorkoutTable({ id }: { id: WorkoutId }) {
  return (
    <table className={styles.table}>
      <thead><tr><th>Übung</th><th>Sätze × Wdh.</th></tr></thead>
      <tbody>
        {WORKOUTS[id].ex.map(e => (
          <tr key={e}>
            <td>{EXERCISES[e].name}<div className="tiny muted">{EXERCISES[e].hint}</div></td>
            <td className="num">{EXERCISES[e].sets} × {EXERCISES[e].reps}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function InfoView({ state }: { state: AppState }) {
  const { paces: P, goal, start } = state.settings;
  return (
    <>
      <Card>
        <div className="row between">
          <div>
            <div className="small muted">Zielzeit</div>
            <div className={styles.big}>{goal}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="small muted">Marathon</div>
            <div className={styles.date}>{formatDate(raceDate(start), { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' })}</div>
          </div>
        </div>
        <p className="small muted" style={{ marginTop: 10 }}>
          Ausgangsniveau: 10 km knapp unter 50 min · Prognose zu Beginn ca. 3:50 h. Zielzeit nach dem HM-Test im Mai festlegen.
        </p>
      </Card>

      <Section title="Tempobereiche" open>
        <table className={styles.table}>
          <thead><tr><th>Bereich</th><th>Tempo</th><th>Wofür</th></tr></thead>
          <tbody>
            <tr><td>Locker</td><td className="num">{P.easy}</td><td>ca. 80 % aller km, lange Läufe – ganze Sätze reden</td></tr>
            <tr><td>Marathontempo</td><td className="num">~{P.mt}</td><td>ab Phase 3 als Abschnitte im langen Lauf</td></tr>
            <tr><td>HM-Tempo</td><td className="num">~{P.hm}</td><td>W31/32 (nicht in der PDF – anpassbar unter „Mehr“)</td></tr>
            <tr><td>Schwelle</td><td className="num">~{P.thr}</td><td>Tempodauerläufe, Schwellenintervalle</td></tr>
            <tr><td>Intervalle</td><td className="num">~{P.int}</td><td>800–1200 m Wiederholungen</td></tr>
            <tr><td>Steigerungen</td><td>zügig, locker</td><td>4–6 × 20 s nach lockeren Läufen</td></tr>
          </tbody>
        </table>
        <p className="tiny muted">Nach dem Halbmarathon-Test (W32) neu berechnen – unter „Mehr“ änderbar.</p>
      </Section>

      <Section title="Wochenstruktur">
        <table className={styles.table}>
          <thead><tr><th>Tag</th><th>Morgens</th><th>Nachmittag / Abend</th></tr></thead>
          <tbody>
            <tr><td>Mo</td><td>Kraft A – Unterkörper</td><td>ab W5: kurzer, sehr lockerer Lauf</td></tr>
            <tr><td>Di</td><td>–</td><td>lockerer Lauf · danach Hüft-Mobility</td></tr>
            <tr><td>Mi</td><td>Kraft B – Pull</td><td>Beachvolleyball-Training</td></tr>
            <tr><td>Do</td><td>–</td><td>Qualitätslauf</td></tr>
            <tr><td>Fr</td><td>Kraft C – Push</td><td>–</td></tr>
            <tr><td>Sa</td><td>–</td><td>Langer Lauf · danach Hüft-Mobility</td></tr>
            <tr><td>So</td><td>–</td><td>Ruhe, Hüft-Mobility · ab Phase 4 optional 30–40 min regenerativ</td></tr>
          </tbody>
        </table>
        <p className="tiny muted">
          Qualitätslauf am Do, damit er nicht direkt nach dem Beintag kommt. Pull am Mi, weil Drücken über Kopf die Schulter vor dem Volleyball stärker ermüden würde.
        </p>
      </Section>

      <Section title="Turnierwoche">
        <table className={styles.table}>
          <tbody>
            <tr><td>Mo – Mi</td><td>wie normal</td></tr>
            <tr><td>Do</td><td>Qualitätslauf entfällt · verkürzter langer Lauf (ca. 70 %), locker</td></tr>
            <tr><td>Fr</td><td>Kraft C normal, aber kein Satz nah ans Limit</td></tr>
            <tr><td>Sa / So</td><td>Turnier = harte Belastung, kein zusätzlicher Lauf</td></tr>
            <tr><td>Mo danach</td><td>Kraft A mit ca. 70 % Gewicht oder nur Mobility, optional 30 min locker</td></tr>
          </tbody>
        </table>
        <p className="tiny muted">
          Ab Woche 45 (August) und im Taper möglichst keine Turniere mehr. Turnierwochen markierst du auf „Heute“ oder im Plan – die App passt die Tage automatisch an.
        </p>
      </Section>

      <Section title="Kraft A1 – Maschinen (Okt – Dez)"><WorkoutTable id="A1" /></Section>
      <Section title="Kraft A – Übergang (W14 – 18)">
        <WorkoutTable id="AT" />
        <p className="tiny muted">Erst wechseln, wenn die einbeinige Kniebeuge auf der Box sauber und ohne einknickendes Knie klappt.</p>
      </Section>
      <Section title="Kraft A2 – Komplex (ab Februar)"><WorkoutTable id="A2" /></Section>
      <Section title="Kraft B – Oberkörper Pull (Mi)">
        <WorkoutTable id="B" />
        <p className="tiny muted">Klimmzug-Griff wöchentlich zwischen breit und schulterbreit/Untergriff wechseln.</p>
      </Section>
      <Section title="Kraft C – Oberkörper Push (Fr)"><WorkoutTable id="C" /></Section>

      <Section title="Hüft-Mobility (3–4× pro Woche)">
        <table className={styles.table}>
          <tbody>
            {MOBILITY.map(m => (
              <tr key={m.id}><td>{m.name}</td><td>{m.amount}</td></tr>
            ))}
          </tbody>
        </table>
        <p className="tiny muted">Am besten Di und Sa nach dem Lauf sowie So. Wenn nur zwei Übungen gehen: Couch Stretch und 90/90 nach dem langen Lauf.</p>
      </Section>

      <Section title="Periodisierung">
        {(Object.entries(PHASES) as [string, (typeof PHASES)[PhaseId]][]).map(([n, ph]) => (
          <div key={n} className={styles.phase}>
            <b>Phase {n}: {ph.name}</b> <span className="muted small">({ph.time})</span>
            <ul>
              <li><span>Laufen</span>{ph.run}</li>
              <li><span>Kraft</span>{ph.kraft}</li>
              <li><span>Volleyball</span>{ph.vb}</li>
            </ul>
          </div>
        ))}
        <div className={styles.phase}>
          <b>Regeneration</b> <span className="muted small">(2–3 Wochen danach)</span>
          <p className="small">nur locker oder gar nicht · Mobility · Volleyball wieder nach Lust</p>
        </div>
        <p className="tiny muted">Drei Wochen steigern, eine Woche entlasten. Laufumfang nie mehr als ca. 10 % pro Woche steigern.</p>
      </Section>

      <Section title="Regeln, die immer gelten" open>
        <ol className={styles.rules}>
          {RULES.map(([a, b]) => (
            <li key={a}><b>{a}</b> <span className="small text-2">{b}</span></li>
          ))}
        </ol>
      </Section>
    </>
  );
}
