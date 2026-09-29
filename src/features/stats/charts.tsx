import { useState, type PointerEvent, type ReactNode } from 'react';
import styles from './charts.module.css';

const W = 360;

/** Index des Datenpunkts unter dem Zeiger (für Tipp und Hover) */
function indexFromPointer(e: PointerEvent<SVGSVGElement>, x0: number, x1: number, n: number): number {
  const r = e.currentTarget.getBoundingClientRect();
  const x = ((e.clientX - r.left) / r.width) * W;
  if (n <= 1) return 0;
  return Math.max(0, Math.min(n - 1, Math.round(((x - x0) / (x1 - x0)) * (n - 1))));
}

/* ---------- Wochenkilometer: geplant (Umriss) vs. gelaufen (Balken) ---------- */

export interface KmBar { w: number; planned: number; actual: number; label: string }

export function WeeklyKmChart({ bars, current }: { bars: KmBar[]; current: number }) {
  const [sel, setSel] = useState<number | null>(null);
  const H = 180, L = 28, B = 20, T = 8;
  const max = Math.max(75, ...bars.map(b => Math.max(b.planned, b.actual)));
  const bw = (W - L) / bars.length;
  const y = (v: number) => T + (H - T - B) * (1 - v / max);
  const ticks = [0, 25, 50, 75].filter(v => v <= max);
  const active = sel != null ? bars[sel] : bars.find(b => b.w === current);

  return (
    <figure className={styles.figure}>
      <svg
        className={styles.chart}
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="Wochenkilometer: geplant und gelaufen"
        onPointerMove={e => setSel(Math.floor(indexFromPointer(e, L + bw / 2, W - bw / 2, bars.length)))}
        onPointerDown={e => setSel(indexFromPointer(e, L + bw / 2, W - bw / 2, bars.length))}
        onPointerLeave={e => e.pointerType === 'mouse' && setSel(null)}
      >
        <g className={styles.grid}>
          {ticks.map(v => (
            <g key={v}>
              <line x1={L} x2={W} y1={y(v)} y2={y(v)} />
              <text x={L - 6} y={y(v) + 3} textAnchor="end">{v}</text>
            </g>
          ))}
        </g>
        {bars.map((b, i) => {
          const x = L + i * bw;
          const on = active?.w === b.w;
          return (
            <g key={b.w} opacity={active && !on && sel != null ? 0.55 : 1}>
              <rect className={styles.planned} x={x + 1} y={y(b.planned)} width={bw - 2} height={y(0) - y(b.planned)} rx={2} />
              {b.actual > 0 && (
                <rect className={styles.actual} x={x + 1.5} y={y(Math.min(b.actual, max))} width={bw - 3} height={y(0) - y(Math.min(b.actual, max))} rx={2} />
              )}
              {b.w === current && <path className={styles.marker} d={`M${x + bw / 2 - 3.5} ${H - 1} l3.5 -6 l3.5 6z`} />}
              {b.w % 4 === 1 && (
                <text className={styles.axisLabel} x={x + bw / 2} y={H - 8} textAnchor="middle">{b.w}</text>
              )}
            </g>
          );
        })}
      </svg>
      <figcaption className={styles.readout}>
        {active ? (
          <>
            <b>W{active.w}</b> {active.label} · gelaufen <b>{fmt(active.actual)} km</b> von {fmt(active.planned)} km
          </>
        ) : (
          'Balken antippen für Details'
        )}
      </figcaption>
    </figure>
  );
}

const fmt = (n: number) => (Math.round(n * 10) / 10).toLocaleString('de-DE');

/* ---------- Linie mit Punkten (Gewicht, Kraft) ---------- */

export interface LinePoint { x: string; y: number; detail?: ReactNode }

interface LineChartProps {
  points: LinePoint[];
  color: string;
  unit: string;
  label: string;
  empty: ReactNode;
}

export function LineChart({ points, color, unit, label, empty }: LineChartProps) {
  const [sel, setSel] = useState<number | null>(null);
  if (!points.length) return <p className={styles.empty}>{empty}</p>;

  const H = 160, L = 34, R = 12, B = 20, T = 12;
  const ys = points.map(p => p.y);
  const lo = Math.min(...ys), hi = Math.max(...ys);
  const padding = Math.max(1, (hi - lo) * 0.2);
  const y0 = Math.floor(lo - padding), y1 = Math.ceil(hi + padding);
  const x = (i: number) => (points.length === 1 ? (L + W - R) / 2 : L + ((W - L - R) * i) / (points.length - 1));
  const y = (v: number) => T + (H - T - B) * (1 - (v - y0) / (y1 - y0));
  const idx = sel ?? points.length - 1;
  const active = points[idx]!;

  return (
    <figure className={styles.figure}>
      <svg
        className={styles.chart}
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={label}
        onPointerMove={e => setSel(indexFromPointer(e, L, W - R, points.length))}
        onPointerDown={e => setSel(indexFromPointer(e, L, W - R, points.length))}
        onPointerLeave={e => e.pointerType === 'mouse' && setSel(null)}
      >
        <g className={styles.grid}>
          {[y0, (y0 + y1) / 2, y1].map(v => (
            <g key={v}>
              <line x1={L} x2={W - R} y1={y(v)} y2={y(v)} />
              <text x={L - 6} y={y(v) + 3} textAnchor="end">{Math.round(v)}</text>
            </g>
          ))}
        </g>
        {sel != null && <line className={styles.crosshair} x1={x(idx)} x2={x(idx)} y1={T} y2={H - B} />}
        <polyline fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" points={points.map((p, i) => `${x(i)},${y(p.y)}`).join(' ')} />
        {points.map((p, i) => (
          <circle key={i} cx={x(i)} cy={y(p.y)} r={i === idx ? 5.5 : 4} fill={color} className={styles.dot} />
        ))}
        {points.length > 1 && (
          <>
            <text className={styles.axisLabel} x={L} y={H - 4}>{points[0]!.x}</text>
            <text className={styles.axisLabel} x={W - R} y={H - 4} textAnchor="end">{points.at(-1)!.x}</text>
          </>
        )}
      </svg>
      <figcaption className={styles.readout}>
        <b>{active.x}</b>: <b>{active.y.toLocaleString('de-DE')} {unit}</b>
        {active.detail && <> · {active.detail}</>}
      </figcaption>
    </figure>
  );
}
