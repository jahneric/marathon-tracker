const pad = (n: number) => String(n).padStart(2, '0');

/** Zahl aus Nutzereingabe („12,5“ oder „12.5“) */
export const parseNum = (v: unknown): number | null => {
  if (v == null || v === '') return null;
  const n = parseFloat(String(v).replace(',', '.'));
  return Number.isFinite(n) ? n : null;
};

export const formatKm = (n: number): string =>
  (Math.round(n * 10) / 10).toLocaleString('de-DE', { maximumFractionDigits: 1 });

/** auf 0,5 runden, nie negativ */
export const roundHalf = (n: number): number => Math.max(0, Math.round(n * 2) / 2);

/** „52:30“, „1:45:00“ oder „45“ (Minuten) → Sekunden */
export const parseDuration = (s: unknown): number | null => {
  if (s == null || s === '') return null;
  const parts = String(s).trim().split(/[:.]/).map(x => parseInt(x, 10));
  if (parts.some(Number.isNaN)) return null;
  const [a = 0, b = 0, c = 0] = parts;
  if (parts.length === 1) return a * 60;
  if (parts.length === 2) return a * 60 + b;
  return a * 3600 + b * 60 + c;
};

export const formatDuration = (sec: number | null | undefined): string => {
  if (sec == null) return '';
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = Math.round(sec % 60);
  return h ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
};

export const formatPace = (secPerKm: number | null | undefined): string => {
  if (!secPerKm || !Number.isFinite(secPerKm)) return '–';
  let m = Math.floor(secPerKm / 60), s = Math.round(secPerKm % 60);
  if (s === 60) { m += 1; s = 0; }
  return `${m}:${pad(s)}`;
};
