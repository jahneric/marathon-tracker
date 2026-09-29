/** Datums-Schlüssel im Format YYYY-MM-DD (lokale Zeit) */
export type DateKey = string;

const pad = (n: number) => String(n).padStart(2, '0');

export const toKey = (d: Date): DateKey => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const fromKey = (k: DateKey): Date => {
  const [y = 1970, m = 1, d = 1] = k.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const addDays = (k: DateKey, n: number): DateKey => {
  const d = fromKey(k);
  d.setDate(d.getDate() + n);
  return toKey(d);
};

/** Anzahl Tage von b bis a */
export const daysBetween = (a: DateKey, b: DateKey): number =>
  Math.round((fromKey(a).getTime() - fromKey(b).getTime()) / 864e5);

/** Wochentag, 0 = Montag */
export const weekday = (k: DateKey): number => (fromKey(k).getDay() + 6) % 7;

export const todayKey = (): DateKey => toKey(new Date());

export const WEEKDAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'] as const;
export const WEEKDAYS_LONG = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'] as const;

export const formatDate = (k: DateKey, opt: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit' }): string =>
  fromKey(k).toLocaleDateString('de-DE', opt);
