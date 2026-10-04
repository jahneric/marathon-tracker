// Trainingsplan Marathon 2027 – Daten aus der PDF

export type PhaseId = 1 | 2 | 3 | 4 | 5 | 6;

export interface PlanWeek {
  w: number;
  ph: PhaseId;
  /** geplante Wochenkilometer */
  km: number;
  /** Langer Lauf (Sa) als Text aus dem Plan */
  long: string;
  /** Qualitätseinheit (Do) */
  quality: string;
  note: string;
  longKm: number;
  deload: boolean;
  race: boolean;
}

type Row = [w: number, ph: PhaseId, km: number, long: string, quality: string, note: string];

const ROWS: Row[] = [
  [1, 1, 13, '6', 'Lockerer Lauf', 'Turnier am Wochenende: langer Lauf auf Do'],
  [2, 1, 15, '6', 'Lockerer Lauf', ''],
  [3, 1, 18, '7', '4 Steigerungen', ''],
  [4, 1, 13, '6', 'Steigerungen', 'Entlastung'],
  [5, 1, 20, '9', 'Fahrtspiel 6 × 1 min', '4. Lauf (Mo) kommt dazu'],
  [6, 1, 25, '11', 'Bergsprints 8 × 10 s', ''],
  [7, 1, 28, '12', 'Fahrtspiel 8 × 1 min', ''],
  [8, 1, 20, '9', 'Steigerungen', 'Entlastung'],
  [9, 1, 28, '12', 'Schwelle 3 × 8 min', 'Sportuhr bis hier sinnvoll'],
  [10, 1, 31, '13', 'Bergsprints 10 × 10 s', ''],
  [11, 1, 34, '14', 'Schwelle 3 × 10 min', ''],
  [12, 1, 24, '10', 'Steigerungen', 'Entlastung'],
  [13, 1, 26, '12', 'locker + Steigerungen', 'Weihnachten – flexibel'],
  [14, 2, 30, '14', 'Fahrtspiel 8 × 1 min', 'Silvester – flexibel · Kraft A: Übergang beginnt'],
  [15, 2, 34, '15', 'Schwelle 3 × 10 min', ''],
  [16, 2, 37, '16', 'Hügel 8 × 45 s', ''],
  [17, 2, 40, '17', 'Schwelle 4 × 8 min', ''],
  [18, 2, 30, '13', 'Steigerungen', 'Entlastung'],
  [19, 2, 40, '18', 'Tempodauerlauf 20 min', 'Kraft A jetzt komplett A2'],
  [20, 2, 43, '19', 'Intervalle 6 × 800 m', ''],
  [21, 2, 46, '20', 'Schwelle 3 × 12 min', ''],
  [22, 2, 34, '14', 'Steigerungen', 'Entlastung'],
  [23, 2, 45, '21', 'Intervalle 5 × 1000 m', ''],
  [24, 2, 48, '22', 'Tempodauerlauf 25 min', ''],
  [25, 2, 50, '24', 'Schwelle 4 × 10 min', ''],
  [26, 2, 36, '16', 'Steigerungen', 'Entlastung'],
  [27, 3, 46, '22', 'Intervalle 6 × 1000 m', 'Ostern'],
  [28, 3, 49, '24', 'Schwelle 2 × 20 min', ''],
  [29, 3, 52, '25', 'Intervalle 5 × 1200 m', ''],
  [30, 3, 38, '16', 'Steigerungen', 'Entlastung'],
  [31, 3, 44, '18', '3 × 3 km HM-Tempo', 'Mini-Taper'],
  [32, 3, 36, 'HM am So', 'Di: 3 × 1 km HM-Tempo', 'HALBMARATHON-TEST'],
  [33, 3, 32, '14', 'nur locker', 'Regeneration · Zielzeit + Tempi neu festlegen'],
  [34, 3, 48, '22', 'Schwelle 3 × 15 min', ''],
  [35, 3, 52, '24', 'Intervalle 6 × 1000 m', ''],
  [36, 4, 54, '26', 'Schwelle 3 × 12 min', '5. Lauf (So regenerativ)'],
  [37, 4, 40, '18', 'Steigerungen', 'Entlastung'],
  [38, 4, 56, '26, davon 8 km MT', 'Intervalle 5 × 1000 m', ''],
  [39, 4, 58, '28', 'Schwelle 2 × 20 min', ''],
  [40, 4, 62, '29, davon 10 km MT', 'Tempodauerlauf 30 min', ''],
  [41, 4, 44, '18', 'Steigerungen', 'Entlastung'],
  [42, 4, 60, '30, davon 12 km MT', 'Intervalle 6 × 1000 m', ''],
  [43, 4, 64, '30', 'Schwelle 3 × 15 min', ''],
  [44, 4, 66, '32', 'Tempodauerlauf 35 min', ''],
  [45, 5, 48, '20', 'Steigerungen', 'Entlastung · ab jetzt keine Turniere'],
  [46, 5, 66, '30, davon 16 km MT', 'Intervalle 5 × 1200 m', ''],
  [47, 5, 70, '32', 'Schwelle 3 × 15 min', ''],
  [48, 5, 68, '28 inkl. 20 km MT', 'locker + Steigerungen', 'Generalprobe: Schuhe, Verpflegung testen'],
  [49, 5, 70, '32', 'Tempodauerlauf 30 min', 'letzter sehr langer Lauf'],
  [50, 6, 52, '24', 'MT 3 × 3 km', 'Taper'],
  [51, 6, 40, '18', 'MT 2 × 3 km', 'Taper'],
  [52, 6, 57.2, 'MARATHON So', 'Di: 3 × 1 km MT', 'Rennwoche (15 km + 42,2 km)'],
];

export const HALF_MARATHON_WEEK = 32;
export const RACE_WEEK = 52;
export const PLAN_WEEKS = ROWS.length;

export const PLAN: PlanWeek[] = ROWS.map(([w, ph, km, long, quality, note]) => ({
  w, ph, km, long, quality, note,
  longKm: w === HALF_MARATHON_WEEK ? 21.1 : w === RACE_WEEK ? 42.2 : parseFloat(long),
  deload: /Entlastung/.test(note),
  race: w === HALF_MARATHON_WEEK || w === RACE_WEEK,
}));

export interface Phase {
  name: string;
  time: string;
  run: string;
  kraft: string;
  vb: string;
}

export const PHASES: Record<PhaseId, Phase> = {
  1: { name: 'Allgemeine Vorbereitung', time: 'Okt – Dez', run: 'Grundlage, 3–4 Läufe, 13–34 km/Woche, sanfter Einstieg, lange Läufe bis 14 km', kraft: 'W1–4 Eingewöhnung (2 × 12–15, leicht), ab W5 Hypertrophie (3 × 8–12) an Maschinen (A1) · Fußprogramm im Aufwärmen', vb: 'Nebensaison, nach Lust' },
  2: { name: 'Grundlage II', time: 'Jan – März', run: '4 Läufe, bis 50 km/Woche, erste Tempodauerläufe und Intervalle, lange Läufe bis 24 km', kraft: 'Maximalkraft (4 × 4–6) · Übergang A1 → A2 im Januar, ab Februar komplexe Übungen (A2)', vb: 'Halle, falls möglich' },
  3: { name: 'Aufbau + Test', time: 'Apr – Mai', run: '4–5 Läufe, Schwelle und Intervalle, Halbmarathon-Test in W32', kraft: 'A2 schwer (3 × 3–5) plus Sprünge, weniger Beinvolumen', vb: 'Saisonstart' },
  4: { name: 'Marathonspezifisch I', time: 'Juni – Juli', run: '5 Läufe, bis 66 km/Woche, lange Läufe bis 32 km mit MT-Abschnitten', kraft: 'Erhalt: kurz und schwer (2 × 3–5, ca. 45 min)', vb: 'Hauptsaison, Turniere nach Turnierwoche-Regel' },
  5: { name: 'Marathonspezifisch II', time: 'Aug – Anfang Sept', run: 'Spitzenumfang ~70 km, 2 × 32 km, Generalprobe 20 km MT', kraft: 'Erhalt, wenig Beinvolumen, kein schweres Beintraining 48 h vor langem Lauf', vb: 'reduzieren, keine Turniere' },
  6: { name: 'Taper + Rennen', time: 'Sept', run: 'Umfang auf ca. 75 % / 55 % / 25 %, Intensität kurz halten', kraft: 'nur leicht, letzte 10 Tage keine Beine', vb: 'Pause' },
};

export interface Paces {
  easy: string;
  mt: string;
  thr: string;
  int: string;
  hm: string;
}

export const DEFAULT_PACES: Paces = { easy: '6:15–6:50', mt: '5:25', thr: '5:00', int: '4:40', hm: '5:10' };

export const RULES: [title: string, text: string][] = [
  ['Locker heißt locker.', 'Wenn der lockere Lauf sich anstrengend anfühlt, langsamer laufen – nicht die Uhr, sondern das Gefühl entscheidet.'],
  ['Schmerz vor Plan.', 'Zwickt es an Achillessehne, Schienbein oder Knie: zuerst den optionalen Lauf streichen, dann Umfang reduzieren. Stechender oder zunehmender Schmerz = Pause und abklären lassen.'],
  ['Verpasste Einheiten nicht nachholen.', 'Einfach mit dem Plan weitermachen. Fehlt eine ganze Woche, die letzte Woche wiederholen.'],
  ['Turniere ersetzen eine harte Einheit.', 'Turnierwoche-Regel anwenden.'],
  ['Schlaf und Essen sind Teil des Trainings.', 'Ab Phase 4 bei langen Läufen über 90 min Verpflegung üben (Gels/Getränk wie im Rennen).'],
  ['Schuhe nach ca. 600–800 km wechseln.', 'Im Frühjahr ein zweites Paar zum Abwechseln anschaffen.'],
];
