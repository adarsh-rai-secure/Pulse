import type { CategoryKey, Property, Thresholds } from '../types';
import { classify, sortForCaseTable } from '../lib/classify';
import { CATEGORIES } from '../data/categories';
import { useMemo } from 'react';

interface Props {
  properties: Property[];
  thresholds: Thresholds;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onJumpToAll: () => void;
  limit?: number;
}

function reasonFor(p: Property, cat: CategoryKey): string {
  switch (cat) {
    case 'churn':
      return `Almost no one is logging in and almost nothing is closing. Call this account this week.`;
    case 'stuck':
      return `The team is using the tool, but leads are not converting. Likely a configuration issue, not a training one.`;
    case 'sleeping':
      return `Leads convert really well, but the team barely uses the tool. Get them trained and this account doubles.`;
    case 'reference':
      return `Both numbers are strong. Good candidate for a referral or a case study.`;
  }
}

export function TopPriorities({
  properties,
  thresholds,
  selectedId,
  onSelect,
  onJumpToAll,
  limit = 6,
}: Props) {
  const sorted = useMemo(
    () => sortForCaseTable(properties, thresholds),
    [properties, thresholds]
  );
  const top = sorted.slice(0, limit);
  const hidden = Math.max(0, sorted.length - limit);

  if (top.length === 0) {
    return (
      <div className="panel-flat p-6 text-center text-13 text-ink-500">
        No accounts to triage. Upload a CSV or load the sample portfolio.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {top.map((p) => {
        const cat = classify(p.userAdoption, p.conversionRate, thresholds);
        const c = CATEGORIES[cat];
        const selected = p.id === selectedId;
        return (
          <button
            key={p.id}
            onClick={() => onSelect(p.id)}
            className={
              'w-full text-left panel-flat px-3 py-2.5 transition-colors hover:border-brand-200 ' +
              (selected ? 'border-brand-500 bg-brand-50/50' : '')
            }
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className="chip flex-shrink-0"
                    style={{ background: c.badgeBg, color: c.badgeFg }}
                  >
                    {c.label}
                  </span>
                  <span className="text-13 font-medium text-ink-900 truncate">
                    {p.name}
                  </span>
                  <span className="text-2xs text-ink-500">
                    {p.city} · {p.units} units
                  </span>
                </div>
                <p className="text-2xs text-ink-700 mt-1 leading-snug">
                  {reasonFor(p, cat)}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-2xs text-ink-500">use / convert</div>
                <div className="text-13 font-semibold tabular-nums">
                  {p.userAdoption}% · {p.conversionRate}%
                </div>
              </div>
            </div>
          </button>
        );
      })}

      {hidden > 0 && (
        <button
          onClick={onJumpToAll}
          className="w-full text-13 text-brand-700 hover:text-brand-900 underline underline-offset-2 py-2"
        >
          Show all {sorted.length} accounts →
        </button>
      )}
    </div>
  );
}
