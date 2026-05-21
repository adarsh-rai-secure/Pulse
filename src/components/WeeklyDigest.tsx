import { useMemo } from 'react';
import type { CategoryKey, Property, Thresholds } from '../types';
import { classify } from '../lib/classify';
import { CATEGORIES } from '../data/categories';
import { trendFor } from '../lib/trends';

interface Props {
  properties: Property[];
  thresholds: Thresholds;
  onClickCategory: (k: CategoryKey) => void;
}

interface Movement {
  property: Property;
  from: CategoryKey;
  to: CategoryKey;
  uaDelta: number;
  crDelta: number;
}

// Use the synthetic trends to infer where each account WAS 8 weeks ago, then
// detect movements across the threshold lines. Stable per dataset + threshold.
function detectMovements(
  properties: Property[],
  t: Thresholds
): Movement[] {
  const out: Movement[] = [];
  for (const p of properties) {
    const tr = trendFor(p);
    const pastUA = tr.ua.values[0];
    const pastCR = tr.cr.values[0];
    const from = classify(pastUA, pastCR, t);
    const to = classify(p.userAdoption, p.conversionRate, t);
    if (from !== to) {
      out.push({
        property: p,
        from,
        to,
        uaDelta: p.userAdoption - pastUA,
        crDelta: p.conversionRate - pastCR,
      });
    }
  }
  return out;
}

function priorityOf(k: CategoryKey): number {
  return CATEGORIES[k].priority;
}

export function WeeklyDigest({ properties, thresholds, onClickCategory }: Props) {
  const movements = useMemo(
    () => detectMovements(properties, thresholds),
    [properties, thresholds]
  );

  const deteriorating = movements
    .filter((m) => priorityOf(m.to) < priorityOf(m.from))
    .slice(0, 4);
  const improving = movements
    .filter((m) => priorityOf(m.to) > priorityOf(m.from))
    .slice(0, 4);

  return (
    <div className="panel-flat p-3">
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="label-eyebrow">This week's movement</div>
          <p className="text-2xs text-ink-500">
            Accounts that crossed a health-group line in the last 8 weeks.
          </p>
        </div>
        <span className="text-2xs text-ink-500 font-mono">
          {movements.length} movements
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <DigestColumn
          title="Trending down"
          tone="down"
          items={deteriorating}
          onClickCategory={onClickCategory}
        />
        <DigestColumn
          title="Trending up"
          tone="up"
          items={improving}
          onClickCategory={onClickCategory}
        />
      </div>
    </div>
  );
}

function DigestColumn({
  title,
  tone,
  items,
  onClickCategory,
}: {
  title: string;
  tone: 'up' | 'down';
  items: Movement[];
  onClickCategory: (k: CategoryKey) => void;
}) {
  const arrow = tone === 'down' ? '↓' : '↑';
  const accent = tone === 'down' ? 'text-signal-churnFg' : 'text-signal-refFg';
  return (
    <div className="border border-surface-200 rounded-md p-2.5 bg-surface-0">
      <div className="flex items-center gap-1.5 mb-2">
        <span className={`text-13 font-semibold ${accent}`}>{arrow}</span>
        <span className="text-13 font-medium">{title}</span>
        <span className="text-2xs text-ink-500">({items.length})</span>
      </div>
      {items.length === 0 ? (
        <p className="text-2xs text-ink-400 italic">Nothing this week.</p>
      ) : (
        <ul className="space-y-1.5">
          {items.map((m) => {
            const from = CATEGORIES[m.from];
            const to = CATEGORIES[m.to];
            return (
              <li
                key={m.property.id}
                className="flex items-center justify-between gap-2 text-2xs"
              >
                <span className="text-ink-700 truncate flex-1">
                  {m.property.name}
                </span>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    className="chip cursor-pointer"
                    style={{ background: from.badgeBg, color: from.badgeFg }}
                    onClick={() => onClickCategory(m.from)}
                  >
                    {from.label}
                  </button>
                  <span className="text-ink-400">→</span>
                  <button
                    className="chip cursor-pointer"
                    style={{ background: to.badgeBg, color: to.badgeFg }}
                    onClick={() => onClickCategory(m.to)}
                  >
                    {to.label}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
