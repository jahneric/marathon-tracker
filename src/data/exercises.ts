/** w = kg × Wdh, s = Sekunden, c = nur abhaken */
export type ExerciseKind = 'w' | 's' | 'c';

export interface Exercise {
  name: string;
  sets: number;
  reps: string;
  kind: ExerciseKind;
  hint: string;
  /** Sätze × Wdh. richten sich nach der Kraftphase (main = Hauptübung, acc = Zusatzübung) */
  load?: 'main' | 'acc';
  /** Wiederholungen pro Seite */
  side?: boolean;
}

export const EXERCISES = {
  warmA: { name: 'Goblet Squat Hold, Cossack Squat, tiefer Split Squat', sets: 2, reps: 'je 2 Sätze', kind: 'c', hint: 'Aufwärmen / Mobility mit Gewicht' },
  shortfoot: { name: 'Short Foot – Fußgewölbe aufrichten', sets: 2, reps: '8 × 5 s / Seite', kind: 'c', hint: 'barfuß, Großzehenballen Richtung Ferse ziehen, Zehen bleiben lang und locker' },
  heelball: { name: 'Fersenheben mit Ball zwischen den Fersen', sets: 2, reps: '12', kind: 'c', hint: 'Ball zusammendrücken, Fersen kippen oben nicht nach außen – Tibialis posterior' },
  footadd: { name: 'Fuß einwärts drehen gegen Band', sets: 2, reps: '15 / Seite', kind: 'c', hint: 'nur der Fuß bewegt sich, Knie bleibt still – stützt das Sprunggelenk innen' },
  balance: { name: 'Einbeinstand mit aktivem Gewölbe', sets: 2, reps: '30 s / Seite', kind: 'c', hint: 'Knöchel bleibt über dem Fuß und kippt nicht nach innen' },
  jumps: { name: 'Sprünge: Pogo Hops + Box Jumps', sets: 3, reps: '6–8', kind: 'c', hint: 'frisch und explosiv, volle Pause – Qualität vor Menge' },
  legpress: { name: 'Beinpresse', sets: 4, reps: '6–8', kind: 'w', hint: 'Hauptübung, tief und über die volle Bewegungsweite', load: 'main' },
  legext: { name: 'Beinstrecker', sets: 3, reps: '8–10', kind: 'w', hint: 'kontrolliert absenken', load: 'acc' },
  legcurl: { name: 'Beinbeuger', sets: 3, reps: '8–10', kind: 'w', hint: 'kontrolliert absenken', load: 'acc' },
  calfpress: { name: 'Wadenpresse', sets: 4, reps: '8–10', kind: 'w', hint: 'volle Bewegungsweite, unten kurz halten', load: 'acc' },
  tibialis: { name: 'Tibialis Raises', sets: 2, reps: '15', kind: 'w', hint: 'Schienbeinschutz für Laufen und Sand' },
  pistol: { name: 'Einbeinige Kniebeuge', sets: 4, reps: '5–6 / Seite', kind: 'w', hint: 'anfangs auf Box oder mit Halt, später tiefer und mit Zusatzgewicht', load: 'main', side: true },
  airplane: { name: 'Hüftrotationen (Hip Airplanes)', sets: 3, reps: '5 / Seite', kind: 'w', hint: 'langsam, Becken kontrolliert öffnen und schließen' },
  copenhagen: { name: 'Copenhagen Plank', sets: 3, reps: '20–30 s / Seite', kind: 's', hint: 'Adduktoren, Hebel mit der Zeit verlängern' },
  calfsingle: { name: 'Wadenheben einbeinig', sets: 3, reps: '10–12', kind: 'w', hint: 'auf Stufe, später mit Kurzhantel', load: 'acc' },
  pallof: { name: 'Pallof Press', sets: 3, reps: '3 Sätze', kind: 'w', hint: 'Core' },
  sideplank: { name: 'Side Plank', sets: 3, reps: '3 Sätze', kind: 's', hint: 'Core' },
  extrot: { name: 'Außenrotation mit Band', sets: 2, reps: '15', kind: 'c', hint: 'Aufwärmen, Schulter-Prehab – fest drin lassen' },
  pullup: { name: 'Klimmzüge', sets: 4, reps: '6–8', kind: 'w', hint: 'Band (negatives kg) oder Zusatzgewicht so wählen, dass der Wdh.-Bereich sauber klappt · Griff wöchentlich wechseln', load: 'main' },
  rowclose: { name: 'Rudern eng (Kabel / Maschine)', sets: 3, reps: '6–8', kind: 'w', hint: 'Ellbogen nah am Körper', load: 'acc' },
  rowwide: { name: 'Rudern breit (Kabel / Maschine)', sets: 3, reps: '10–12', kind: 'w', hint: 'Ellbogen nach außen – hintere Schulter', load: 'acc' },
  revfly: { name: 'Reverse Butterfly', sets: 3, reps: '12–15', kind: 'w', hint: 'mäßiges Gewicht, sauber und langsam', load: 'acc' },
  deadbug: { name: 'Dead Bug', sets: 3, reps: '3 Sätze', kind: 'c', hint: 'Core' },
  hollow: { name: 'Hollow Hold', sets: 3, reps: '3 Sätze', kind: 's', hint: 'Core' },
  hipfin: { name: 'Hüft-Finisher: Monster Walks, Clamshells', sets: 2, reps: 'je 15', kind: 'c', hint: 'optional, 5 min, Hüftstabilität' },
  bench: { name: 'Bankdrücken', sets: 4, reps: '6–8', kind: 'w', hint: 'Hauptübung', load: 'main' },
  dips: { name: 'Dips', sets: 3, reps: '6–10', kind: 'w', hint: 'Oberkörper leicht nach vorn, nur schmerzfrei tief; ggf. Zusatzgewicht', load: 'acc' },
  ohp: { name: 'Schulterdrücken', sets: 3, reps: '8', kind: 'w', hint: 'Kurzhantel oder Langhantel', load: 'acc' },
  lateral: { name: 'Seitheben', sets: 3, reps: '12–15', kind: 'w', hint: 'leicht, kontrolliert, kein Schwung', load: 'acc' },
} as const satisfies Record<string, Exercise>;

export type ExerciseId = keyof typeof EXERCISES;

export const exercise = (id: string): Exercise | undefined => (EXERCISES as Record<string, Exercise>)[id];

export const WEIGHTED_EXERCISES = (Object.keys(EXERCISES) as ExerciseId[]).filter(id => EXERCISES[id].kind === 'w');

export type WorkoutId = 'A1' | 'AT' | 'A2' | 'B' | 'C';

export const WORKOUTS: Record<WorkoutId, { name: string; short: string; ex: ExerciseId[] }> = {
  A1: { name: 'Kraft A1 – Unterkörper an Maschinen', short: 'A1', ex: ['warmA', 'shortfoot', 'heelball', 'footadd', 'balance', 'legpress', 'legext', 'legcurl', 'calfpress', 'tibialis', 'pallof', 'sideplank'] },
  AT: { name: 'Kraft A – Übergang A1 → A2', short: 'Übergang', ex: ['warmA', 'shortfoot', 'heelball', 'footadd', 'balance', 'legpress', 'calfpress', 'pistol', 'airplane', 'tibialis', 'pallof', 'sideplank'] },
  A2: { name: 'Kraft A2 – Komplexe Übungen', short: 'A2', ex: ['warmA', 'shortfoot', 'heelball', 'footadd', 'balance', 'pistol', 'airplane', 'copenhagen', 'calfsingle', 'tibialis', 'pallof', 'sideplank'] },
  B: { name: 'Kraft B – Oberkörper Pull', short: 'B', ex: ['extrot', 'shortfoot', 'heelball', 'footadd', 'balance', 'pullup', 'rowclose', 'rowwide', 'revfly', 'deadbug', 'hollow', 'hipfin'] },
  C: { name: 'Kraft C – Oberkörper Push', short: 'C', ex: ['extrot', 'shortfoot', 'heelball', 'footadd', 'balance', 'bench', 'dips', 'ohp', 'lateral', 'pallof', 'sideplank'] },
};

export const isWorkoutId = (v: unknown): v is WorkoutId => typeof v === 'string' && v in WORKOUTS;

export type KraftPhaseId = 'intro' | 'hyp' | 'max' | 'power' | 'maintain' | 'taper';

type Dose = [sets: number, reps: string];

export interface KraftPhase {
  name: string;
  weeks: string;
  /** Anstrengung: wie viele Wiederholungen im Tank bleiben */
  effort: string;
  main: Dose;
  acc: Dose;
}

export const KRAFT_PHASES: Record<KraftPhaseId, KraftPhase> = {
  intro: { name: 'Eingewöhnung', weeks: 'W1 – 4', effort: 'leicht, ca. 4 Wdh. im Tank – Technik und Bewegungsweite vor Gewicht', main: [2, '12–15'], acc: [2, '12–15'] },
  hyp: { name: 'Hypertrophie', weeks: 'W5 – 13', effort: 'mittel, 2–3 Wdh. im Tank – erst Wdh. steigern, dann Gewicht', main: [3, '8–12'], acc: [3, '10–15'] },
  max: { name: 'Maximalkraft', weeks: 'W14 – 26', effort: 'schwer, 1–2 Wdh. im Tank, nie bis zum Muskelversagen', main: [4, '4–6'], acc: [3, '8–10'] },
  power: { name: 'Kraft + Sprünge', weeks: 'W27 – 35', effort: 'schwer und explosiv, 1–2 Wdh. im Tank', main: [3, '3–5'], acc: [2, '8–10'] },
  maintain: { name: 'Erhalt', weeks: 'W36 – 49', effort: 'kurz und schwer, 2 Wdh. im Tank – Gewicht halten, nicht steigern', main: [2, '3–5'], acc: [2, '8–10'] },
  taper: { name: 'Taper', weeks: 'ab W50', effort: 'nur leicht, weit weg vom Limit', main: [2, '5'], acc: [1, '10'] },
};

export const kraftPhase = (w: number): KraftPhaseId =>
  w <= 4 ? 'intro' : w <= 13 ? 'hyp' : w <= 26 ? 'max' : w <= 35 ? 'power' : w <= 49 ? 'maintain' : 'taper';

/** Kraftphase für Pläne beliebiger Länge: die Phasen werden auf n Wochen verteilt */
export function scaledKraftPhase(w: number, n: number): KraftPhaseId {
  if (w > n - 2) return 'taper';
  const intro = Math.min(4, Math.max(2, Math.round(n * 0.15)));
  if (w <= intro) return 'intro';
  const f = (w - intro) / Math.max(1, n - 2 - intro);
  return f <= 0.35 ? 'hyp' : f <= 0.65 ? 'max' : f <= 0.8 ? 'power' : 'maintain';
}

/** Sätze × Wdh. einer Übung in der jeweiligen Kraftphase */
export function prescription(id: ExerciseId, phase: KraftPhaseId): { sets: number; reps: string } {
  const e: Exercise = EXERCISES[id];
  if (!e.load) return { sets: e.sets, reps: e.reps };
  const [sets, reps] = KRAFT_PHASES[phase][e.load];
  return { sets, reps: e.side ? `${reps} / Seite` : reps };
}

/** Übungen eines Programms – in der Sprungphase kommen beim Beintag Sprünge nach dem Aufwärmen dazu */
export function workoutExercises(id: WorkoutId, phase: KraftPhaseId): ExerciseId[] {
  const ex = WORKOUTS[id].ex;
  if (phase !== 'power' || !id.startsWith('A')) return ex;
  const i = ex.indexOf('balance') + 1;
  return [...ex.slice(0, i), 'jumps', ...ex.slice(i)];
}

export interface MobilityDrill {
  id: string;
  name: string;
  amount: string;
  /** Haltedauer pro Seite in Sekunden (falls ein Timer sinnvoll ist) */
  sec?: number;
  sides?: boolean;
}

export const MOBILITY: MobilityDrill[] = [
  { id: 'm9090', name: '90/90 Sitz mit Seitenwechsel', amount: '2 min', sec: 120 },
  { id: 'mirlift', name: '90/90 Innenrotation: hinteren Fuß aktiv abheben', amount: '8 / Seite, oben 2 s halten' },
  { id: 'miriso', name: 'Innenrotation im Sitzen: Fuß gegen Widerstand nach außen drücken', amount: '5 × 10 s / Seite' },
  { id: 'mcouch', name: 'Couch Stretch (Hüftbeuger)', amount: '1–2 min / Seite', sec: 90, sides: true },
  { id: 'mfrog', name: 'Frog Stretch', amount: '1–2 min', sec: 90 },
  { id: 'mpigeon', name: 'Taube (Pigeon)', amount: '1 min / Seite', sec: 60, sides: true },
  { id: 'mwgs', name: "World's Greatest Stretch", amount: '5 / Seite' },
  { id: 'mcars', name: 'Hip CARs im Vierfüßlerstand', amount: '5 / Richtung und Seite' },
];
