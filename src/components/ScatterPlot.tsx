import { useMemo, useState } from 'react';
import type { CategoryKey, Property, Thresholds } from '../types';
import { classify } from '../lib/classify';
import { CATEGORIES } from '../data/categories';

interface Props {
  properties: Property[];
  thresholds: Thresholds;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const W = 720;
const H = 360;
const PAD = { top: 28, right: 24, bottom: 36, left: 44 };
const X_MAX = 100;
const Y_MAX = 50;

function sx(x: number): number {
  return PAD.left + (x / X_MAX) * (W - PAD.left - PAD.right);
}
function sy(y: number): number {
  return H - PAD.bottom - (y / Y_MAX) * (H - PAD.top - PAD.bottom);
}

export function ScatterPlot({
  properties,
  thresholds,
  selectedId,
  onSelect,
}: Props) {
  const [hover, setHover] = useState<{ id: string; x: number; y: number } | null>(
    null
  );

  const counts = useMemo(() => {
    const c: Record<CategoryKey, number> = {
      churn: 0,
      stuck: 0,
      sleeping: 0,
      reference: 0,
    };
    for (const p of properties)
      c[classify(p.userAdoption, p.conversionRate, thresholds)]++;
    return c;
  }, [properties, thresholds]);

  const tx = sx(thresholds.ua);
  const ty = sy(thresholds.cr);

  return (
    <div className="panel-flat p-2 relative overflow-hidden">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        className="block"
        style={{ aspectRatio: `${W} / ${H}` }}
      >
        {/* Quadrant backgrounds */}
        <rect
          x={PAD.left}
          y={ty}
          width={tx - PAD.left}
          height={H - PAD.bottom - ty}
          fill={CATEGORIES.churn.quadrantFill}
        />
        <rect
          x={tx}
          y={ty}
          width={W - PAD.right - tx}
          height={H - PAD.bottom - ty}
          fill={CATEGORIES.stuck.quadrantFill}
        />
        <rect
          x={PAD.left}
          y={PAD.top}
          width={tx - PAD.left}
          height={ty - PAD.top}
          fill={CATEGORIES.sleeping.quadrantFill}
        />
        <rect
          x={tx}
          y={PAD.top}
          width={W - PAD.right - tx}
          height={ty - PAD.top}
          fill={CATEGORIES.reference.quadrantFill}
        />

        {/* Axes */}
        <line
          x1={PAD.left}
          x2={W - PAD.right}
          y1={H - PAD.bottom}
          y2={H - PAD.bottom}
          stroke="#C8C8D4"
          strokeWidth={1}
        />
        <line
          x1={PAD.left}
          x2={PAD.left}
          y1={PAD.top}
          y2={H - PAD.bottom}
          stroke="#C8C8D4"
          strokeWidth={1}
        />

        {/* Threshold lines */}
        <line
          x1={tx}
          x2={tx}
          y1={PAD.top}
          y2={H - PAD.bottom}
          stroke="#534AB7"
          strokeWidth={1}
          strokeDasharray="4 3"
          opacity={0.6}
        />
        <line
          x1={PAD.left}
          x2={W - PAD.right}
          y1={ty}
          y2={ty}
          stroke="#534AB7"
          strokeWidth={1}
          strokeDasharray="4 3"
          opacity={0.6}
        />

        {/* Quadrant labels */}
        <text x={PAD.left + 8} y={H - PAD.bottom - 8} fill={CATEGORIES.churn.badgeFg} fontSize="11" fontWeight={600}>
          Churn risk · {counts.churn}
        </text>
        <text x={tx + 8} y={H - PAD.bottom - 8} fill={CATEGORIES.stuck.badgeFg} fontSize="11" fontWeight={600}>
          Stuck · {counts.stuck}
        </text>
        <text x={PAD.left + 8} y={PAD.top + 14} fill={CATEGORIES.sleeping.badgeFg} fontSize="11" fontWeight={600}>
          Sleeping champion · {counts.sleeping}
        </text>
        <text x={tx + 8} y={PAD.top + 14} fill={CATEGORIES.reference.badgeFg} fontSize="11" fontWeight={600}>
          Reference · {counts.reference}
        </text>

        {/* Axis ticks + labels */}
        {[0, 25, 50, 75, 100].map((v) => (
          <g key={'xt' + v}>
            <line
              x1={sx(v)}
              x2={sx(v)}
              y1={H - PAD.bottom}
              y2={H - PAD.bottom + 4}
              stroke="#C8C8D4"
            />
            <text
              x={sx(v)}
              y={H - PAD.bottom + 16}
              textAnchor="middle"
              fontSize="10"
              fill="#8B8B9A"
            >
              {v}%
            </text>
          </g>
        ))}
        {[0, 10, 20, 30, 40, 50].map((v) => (
          <g key={'yt' + v}>
            <line
              x1={PAD.left}
              x2={PAD.left - 4}
              y1={sy(v)}
              y2={sy(v)}
              stroke="#C8C8D4"
            />
            <text
              x={PAD.left - 6}
              y={sy(v) + 3}
              textAnchor="end"
              fontSize="10"
              fill="#8B8B9A"
            >
              {v}%
            </text>
          </g>
        ))}

        <text
          x={W / 2}
          y={H - 6}
          textAnchor="middle"
          fontSize="11"
          fill="#5A5A6E"
        >
          User adoption (%)
        </text>
        <text
          x={-(H / 2)}
          y={12}
          transform="rotate(-90)"
          textAnchor="middle"
          fontSize="11"
          fill="#5A5A6E"
        >
          Conversion rate (%)
        </text>

        {/* Dots */}
        {properties.map((p) => {
          const cat = classify(p.userAdoption, p.conversionRate, thresholds);
          const color = CATEGORIES[cat].dot;
          const cx = sx(p.userAdoption);
          const cy = sy(Math.min(Y_MAX, p.conversionRate));
          const isSelected = p.id === selectedId;
          return (
            <g key={p.id}>
              {isSelected && (
                <circle cx={cx} cy={cy} r={11} fill={color} opacity={0.25} />
              )}
              <circle
                cx={cx}
                cy={cy}
                r={isSelected ? 6.5 : 5}
                fill={color}
                stroke={isSelected ? '#0B0B14' : 'white'}
                strokeWidth={isSelected ? 1.2 : 1}
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHover({ id: p.id, x: cx, y: cy })}
                onMouseLeave={() => setHover(null)}
                onClick={() => onSelect(p.id)}
              />
            </g>
          );
        })}
      </svg>
      {hover &&
        (() => {
          const p = properties.find((q) => q.id === hover.id);
          if (!p) return null;
          const left = `calc(${(hover.x / W) * 100}% + 8px)`;
          const top = `calc(${(hover.y / H) * 100}% - 4px)`;
          return (
            <div
              className="absolute pointer-events-none bg-ink-900 text-white text-2xs rounded-md px-2 py-1 shadow-panel"
              style={{ left, top }}
            >
              <div className="font-medium">{p.name}</div>
              <div className="opacity-80">
                UA {p.userAdoption}% · CR {p.conversionRate}%
              </div>
            </div>
          );
        })()}
    </div>
  );
}
