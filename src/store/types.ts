import type { Paces } from '@/data/plan';
import type { WorkoutId } from '@/data/exercises';
import type { DateKey } from '@/domain/dates';

// Achtung: Dieses Schema ist mit v1 (localStorage „mt27“) kompatibel.
// Eingabewerte bleiben Strings, damit alte Backups ohne Migration funktionieren.

export type UnitType = 'run' | 'kraft' | 'vb' | 'mob' | 'rest' | 'other';
export type UnitStatus = 'done' | 'skip' | null;

/** Eine geplante oder manuell hinzugefügte Einheit */
export interface Unit {
  id: string;
  type: UnitType;
  title: string;
  detail?: string;
  time?: string;
  optional?: boolean;
  /** manuell hinzugefügt */
  extra?: boolean;
  workout?: WorkoutId;
  /** geplante km */
  target?: number;
  race?: boolean;
  tournament?: boolean;
}

export interface SetLog {
  kg?: string;
  r?: string;
  s?: string;
  c?: boolean;
}

export interface UnitLog {
  t: UnitType;
  title: string;
  status?: UnitStatus;
  note?: string;
  // Laufen
  km?: string;
  dur?: string;
  hr?: string;
  shoe?: string;
  feel?: string | null;
  // Kraft
  variant?: string | null;
  ex?: Record<string, (SetLog | null)[]>;
  // Volleyball / Sonstiges
  min?: string;
  kind?: string | null;
  int?: string | null;
  result?: string;
  where?: string;
  what?: string;
  // Mobility
  m?: Record<string, boolean>;
}

export type PainSpot = 'achilles' | 'shin' | 'knee' | 'hip' | 'shoulder' | 'back' | 'foot' | 'other';
/** 0 = nichts, 1 = zwickt, 2 = Schmerz */
export type PainLevel = 0 | 1 | 2;

export interface Wellbeing {
  sleep?: string;
  weight?: string;
  energy?: string | null;
  pain?: Partial<Record<PainSpot, PainLevel>>;
  note?: string;
}

export interface DayLog {
  u: Record<string, UnitLog>;
  extra: Unit[];
  well: Wellbeing;
}

export interface Shoe {
  id: string;
  name: string;
  baseKm: string;
  retired?: boolean;
}

export type Theme = 'auto' | 'light' | 'dark';

export interface Settings {
  /** Montag der Woche 1 */
  start: DateKey;
  paces: Paces;
  theme: Theme;
  goal: string;
}

export interface AppState {
  v: 1;
  settings: Settings;
  days: Record<DateKey, DayLog>;
  /** Wochennummer → true */
  tournaments: Record<string, boolean>;
  shoes: Shoe[];
  /** Körpergewicht pro Woche: Wochennummer → kg (Eingabe-String) */
  weights: Record<string, string>;
}
