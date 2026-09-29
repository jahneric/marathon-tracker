/** w = kg × Wdh, s = Sekunden, c = nur abhaken */
export type ExerciseKind = 'w' | 's' | 'c';

export interface Exercise {
  name: string;
  sets: number;
  reps: string;
  kind: ExerciseKind;
  hint: string;
}

export const EXERCISES = {
  warmA: { name: 'Goblet Squat Hold, Cossack Squat, tiefer Split Squat', sets: 2, reps: 'je 2 Sätze', kind: 'c', hint: 'Aufwärmen / Mobility mit Gewicht' },
  legpress: { name: 'Beinpresse', sets: 4, reps: '6–8', kind: 'w', hint: 'Hauptübung, schwer, Gewicht progressiv steigern' },
  legext: { name: 'Beinstrecker', sets: 3, reps: '8–10', kind: 'w', hint: 'schwer, kontrolliert absenken' },
  legcurl: { name: 'Beinbeuger', sets: 3, reps: '8–10', kind: 'w', hint: 'schwer, kontrolliert absenken' },
  calfpress: { name: 'Wadenpresse', sets: 4, reps: '8–10', kind: 'w', hint: 'volle Bewegungsweite, unten kurz halten' },
  tibialis: { name: 'Tibialis Raises', sets: 2, reps: '15', kind: 'w', hint: 'Schienbeinschutz für Laufen und Sand' },
  pistol: { name: 'Einbeinige Kniebeuge', sets: 4, reps: '5–6 / Seite', kind: 'w', hint: 'anfangs auf Box oder mit Halt, später tiefer und mit Zusatzgewicht' },
  airplane: { name: 'Hüftrotationen (Hip Airplanes)', sets: 3, reps: '5 / Seite', kind: 'w', hint: 'langsam, Becken kontrolliert öffnen und schließen' },
  copenhagen: { name: 'Copenhagen Plank', sets: 3, reps: '20–30 s / Seite', kind: 's', hint: 'Adduktoren, Hebel mit der Zeit verlängern' },
  calfsingle: { name: 'Wadenheben einbeinig', sets: 3, reps: '10–12', kind: 'w', hint: 'auf Stufe, später mit Kurzhantel' },
  pallof: { name: 'Pallof Press', sets: 3, reps: '3 Sätze', kind: 'w', hint: 'Core' },
  sideplank: { name: 'Side Plank', sets: 3, reps: '3 Sätze', kind: 's', hint: 'Core' },
  extrot: { name: 'Außenrotation mit Band', sets: 2, reps: '15', kind: 'c', hint: 'Aufwärmen, Schulter-Prehab – fest drin lassen' },
  pullup: { name: 'Klimmzüge', sets: 4, reps: '6–8', kind: 'w', hint: 'ggf. mit Band (negatives kg) oder Zusatzgewicht · Griff wöchentlich wechseln' },
  rowclose: { name: 'Rudern eng (Kabel / Maschine)', sets: 3, reps: '6–8', kind: 'w', hint: 'schwer, Ellbogen nah am Körper' },
  rowwide: { name: 'Rudern breit (Kabel / Maschine)', sets: 3, reps: '10–12', kind: 'w', hint: 'moderat, Ellbogen nach außen – hintere Schulter' },
  revfly: { name: 'Reverse Butterfly', sets: 3, reps: '12–15', kind: 'w', hint: 'mäßiges Gewicht, sauber und langsam' },
  deadbug: { name: 'Dead Bug', sets: 3, reps: '3 Sätze', kind: 'c', hint: 'Core' },
  hollow: { name: 'Hollow Hold', sets: 3, reps: '3 Sätze', kind: 's', hint: 'Core' },
  hipfin: { name: 'Hüft-Finisher: Monster Walks, Clamshells', sets: 2, reps: 'je 15', kind: 'c', hint: 'optional, 5 min, Hüftstabilität' },
  bench: { name: 'Bankdrücken', sets: 4, reps: '6–8', kind: 'w', hint: 'Hauptübung, Gewicht progressiv steigern' },
  dips: { name: 'Dips', sets: 3, reps: '6–10', kind: 'w', hint: 'Oberkörper leicht nach vorn, nur schmerzfrei tief; ggf. Zusatzgewicht' },
  ohp: { name: 'Schulterdrücken', sets: 3, reps: '8', kind: 'w', hint: 'Kurzhantel oder Langhantel' },
  lateral: { name: 'Seitheben', sets: 3, reps: '12–15', kind: 'w', hint: 'leicht, kontrolliert, kein Schwung' },
} as const satisfies Record<string, Exercise>;

export type ExerciseId = keyof typeof EXERCISES;

export const exercise = (id: string): Exercise | undefined => (EXERCISES as Record<string, Exercise>)[id];

export const WEIGHTED_EXERCISES = (Object.keys(EXERCISES) as ExerciseId[]).filter(id => EXERCISES[id].kind === 'w');

export type WorkoutId = 'A1' | 'AT' | 'A2' | 'B' | 'C';

export const WORKOUTS: Record<WorkoutId, { name: string; short: string; ex: ExerciseId[] }> = {
  A1: { name: 'Kraft A1 – Unterkörper an Maschinen', short: 'A1', ex: ['warmA', 'legpress', 'legext', 'legcurl', 'calfpress', 'tibialis', 'pallof', 'sideplank'] },
  AT: { name: 'Kraft A – Übergang A1 → A2', short: 'Übergang', ex: ['warmA', 'legpress', 'calfpress', 'pistol', 'airplane', 'tibialis', 'pallof', 'sideplank'] },
  A2: { name: 'Kraft A2 – Komplexe Übungen', short: 'A2', ex: ['warmA', 'pistol', 'airplane', 'copenhagen', 'calfsingle', 'tibialis', 'pallof', 'sideplank'] },
  B: { name: 'Kraft B – Oberkörper Pull', short: 'B', ex: ['extrot', 'pullup', 'rowclose', 'rowwide', 'revfly', 'deadbug', 'hollow', 'hipfin'] },
  C: { name: 'Kraft C – Oberkörper Push', short: 'C', ex: ['extrot', 'bench', 'dips', 'ohp', 'lateral', 'pallof', 'sideplank'] },
};

export const isWorkoutId = (v: unknown): v is WorkoutId => typeof v === 'string' && v in WORKOUTS;

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
  { id: 'mcouch', name: 'Couch Stretch (Hüftbeuger)', amount: '1–2 min / Seite', sec: 90, sides: true },
  { id: 'mfrog', name: 'Frog Stretch', amount: '1–2 min', sec: 90 },
  { id: 'mpigeon', name: 'Taube (Pigeon)', amount: '1 min / Seite', sec: 60, sides: true },
  { id: 'mwgs', name: "World's Greatest Stretch", amount: '5 / Seite' },
  { id: 'mcars', name: 'Hip CARs im Vierfüßlerstand', amount: '5 / Richtung und Seite' },
];
