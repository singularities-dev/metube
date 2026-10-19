import { useId, useMemo, useState } from 'react';
import { useI18n } from './i18n';

export interface Bar {
  key: string;
  value: number;
  /** Shown in the tooltip and the table. */
  label: string;
  /** Axis tick text, or omitted for no tick under this bar. */
  tick?: string;
}

/**
 * Single-series bar chart: one hue (the mood's chart token), thin bars with a 2px
 * gap, rounded data ends on the baseline, recessive grid, hover tooltip, and a
 * table view for screen readers and anyone who prefers numbers.
 */
export function BarChart({
  bars,
  height = 160,
  formatValue,
  valueHeading,
  caption,
}: {
  bars: Bar[];
  height?: number;
  /** A value with its unit, e.g. (n) => t('common.videos', { count: n }). */
  formatValue: (n: number) => string;
  /** Heading of the table's value column, e.g. "Videos". */
  valueHeading: string;
  caption: string;
}) {
  const { t, fmt } = useI18n();
  const [hover, setHover] = useState<number | null>(null);
  const id = useId();
  const max = Math.max(1, ...bars.map((b) => b.value));
  const ticks = useMemo(() => niceTicks(max), [max]);
  const top = ticks.at(-1) ?? max;
  const n = bars.length;
  const W = 1000;
  const H = height;
  const pad = { l: 36, r: 4, t: 8, b: 22 };
  const plotW = W - pad.l - pad.r;
  const plotH = H - pad.t - pad.b;
  const slot = plotW / Math.max(1, n);
  const gap = Math.min(2 * (W / 600), slot * 0.3);
  const bw = Math.max(1, slot - gap);
  const y = (v: number) => pad.t + plotH - (v / top) * plotH;
  const hovered = hover !== null ? bars[hover] : undefined;
  const peak = bars.reduce<Bar | undefined>((p, b) => (b.value > (p?.value ?? 0) ? b : p), undefined);

  return (
    <figure className="chart">
      <div className="chart-plot" onMouseLeave={() => setHover(null)}>
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-labelledby={`${id}-cap`}>
          {ticks.map((v) => (
            <g key={v}>
              <line x1={pad.l} x2={W - pad.r} y1={y(v)} y2={y(v)} className="chart-grid" vectorEffect="non-scaling-stroke" />
            </g>
          ))}
          {bars.map((b, i) => {
            const x = pad.l + i * slot + gap / 2;
            const h = Math.max(b.value > 0 ? 1.5 : 0, y(0) - y(b.value));
            const r = Math.min(4, bw / 2, h);
            return (
              <g key={b.key} onMouseEnter={() => setHover(i)}>
                {/* Hit target: the full column, bigger than the mark. */}
                <rect x={pad.l + i * slot} y={pad.t} width={slot} height={plotH} fill="transparent" />
                {h > 0 && (
                  <path
                    className="chart-bar"
                    data-dim={hover !== null && hover !== i ? true : undefined}
                    d={`M${x},${y(0)} V${y(0) - h + r} Q${x},${y(0) - h} ${x + r},${y(0) - h} H${x + bw - r} Q${x + bw},${y(0) - h} ${x + bw},${y(0) - h + r} V${y(0)} Z`}
                  />
                )}
              </g>
            );
          })}
          <line x1={pad.l} x2={W - pad.r} y1={y(0)} y2={y(0)} className="chart-axis" vectorEffect="non-scaling-stroke" />
        </svg>
        {/* Labels in HTML so they don't stretch with the SVG. */}
        <div className="chart-yticks" aria-hidden>
          {ticks.map((v) => (
            <span key={v} style={{ top: `${(y(v) / H) * 100}%` }}>{fmt.compact(v)}</span>
          ))}
        </div>
        <div className="chart-xticks" aria-hidden>
          {bars.map((b, i) =>
            b.tick ? (
              <span key={b.key} style={{ left: `${((pad.l + (i + 0.5) * slot) / W) * 100}%` }}>{b.tick}</span>
            ) : null,
          )}
        </div>
        {hovered && hover !== null && (
          <div
            className="chart-tip glass"
            aria-hidden
            style={{ left: `${((pad.l + (hover + 0.5) * slot) / W) * 100}%`, top: `${(y(hovered.value) / H) * 100}%` }}
          >
            <span className="chart-tip-label">{hovered.label}</span>
            <span className="chart-tip-value">{formatValue(hovered.value)}</span>
          </div>
        )}
      </div>
      <figcaption id={`${id}-cap`} className="sr-only">
        {caption}{peak && ` ${t('chart.busiest', { label: peak.label, value: formatValue(peak.value) })}`}
      </figcaption>
      <details className="chart-table">
        <summary>{t('chart.showTable')}</summary>
        <table>
          <thead><tr><th>{t('chart.period')}</th><th>{valueHeading}</th></tr></thead>
          <tbody>{bars.map((b) => <tr key={b.key}><td>{b.label}</td><td>{fmt.number(b.value)}</td></tr>)}</tbody>
        </table>
      </details>
    </figure>
  );
}

function niceTicks(max: number): number[] {
  const rough = max / 3;
  const pow = Math.pow(10, Math.floor(Math.log10(rough)));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * pow).find((s) => s >= rough) ?? rough;
  const out: number[] = [];
  for (let v = step; v < max + step; v += step) out.push(Math.round(v * 100) / 100);
  return out.slice(0, 4);
}
