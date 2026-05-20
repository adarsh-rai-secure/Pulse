import { useMemo } from 'react';
import { TEAM } from '../data/team';
import { CATEGORIES, CATEGORY_ORDER } from '../data/categories';
import type {
  CaseStatus,
  CategoryKey,
  Property,
  Thresholds,
} from '../types';
import { classify } from '../lib/classify';
import { activity, formatRelativeTime } from '../lib/activity';

interface Props {
  properties: Property[];
  thresholds: Thresholds;
  cases: Record<string, { ownerId: string; status: CaseStatus; notes: string }>;
  onShowQueue: (ownerId: string) => void;
  nonce: number;
}

const ICON: Record<string, string> = {
  draft_generated: '✎',
  draft_pinned: '★',
  mailto_opened: '↗',
  owner_changed: '⟳',
  status_changed: '◐',
  notes_edited: '✐',
  data_loaded: '⤓',
  reply_received: '↩',
};

export function TeamSection({
  properties,
  thresholds,
  cases,
  onShowQueue,
  nonce,
}: Props) {
  const workload = useMemo(() => {
    const owners: Record<string, { count: number; byCat: Record<CategoryKey, number> }> =
      {};
    for (const m of TEAM) {
      owners[m.id] = {
        count: 0,
        byCat: { churn: 0, stuck: 0, sleeping: 0, reference: 0 },
      };
    }
    for (const p of properties) {
      const cat = classify(p.userAdoption, p.conversionRate, thresholds);
      const ownerId = cases[p.id]?.ownerId ?? CATEGORIES[cat].defaultOwner;
      const bucket = owners[ownerId];
      if (!bucket) continue;
      bucket.count++;
      bucket.byCat[cat]++;
    }
    return owners;
  }, [properties, thresholds, cases]);

  const allEvents = useMemo(() => activity.all(), [nonce]);

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {TEAM.map((m) => {
        const w = workload[m.id] ?? {
          count: 0,
          byCat: { churn: 0, stuck: 0, sleeping: 0, reference: 0 },
        };
        const primary = (Object.keys(CATEGORIES) as CategoryKey[]).find(
          (k) => CATEGORIES[k].defaultOwner === m.id
        );
        const recent = allEvents.filter((e) => e.ownerId === m.id).slice(0, 3);

        return (
          <div key={m.id} className="panel-flat p-3 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-900 flex items-center justify-center font-semibold text-13">
                  {m.name
                    .split(' ')
                    .map((s) => s[0])
                    .join('')}
                </div>
                <div className="min-w-0">
                  <div className="font-medium text-ink-900">{m.name}</div>
                  <div className="text-2xs text-ink-500 truncate">{m.role}</div>
                </div>
              </div>
              {primary && (
                <span
                  className="chip"
                  style={{
                    background: CATEGORIES[primary].badgeBg,
                    color: CATEGORIES[primary].badgeFg,
                  }}
                >
                  Owns {CATEGORIES[primary].label}
                </span>
              )}
            </div>

            <div>
              <div className="flex items-baseline justify-between mb-1">
                <span className="label-eyebrow">Current queue</span>
                <span className="text-13 font-semibold tabular-nums">
                  {w.count} account{w.count === 1 ? '' : 's'}
                </span>
              </div>
              <div className="flex h-2 rounded-full overflow-hidden bg-surface-100">
                {CATEGORY_ORDER.map((k) => {
                  const n = w.byCat[k];
                  if (n === 0) return null;
                  const pct = (n / Math.max(1, w.count)) * 100;
                  return (
                    <div
                      key={k}
                      style={{ width: `${pct}%`, background: CATEGORIES[k].dot }}
                      title={`${CATEGORIES[k].label}: ${n}`}
                    />
                  );
                })}
              </div>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {CATEGORY_ORDER.map((k) => {
                  const n = w.byCat[k];
                  if (n === 0) return null;
                  return (
                    <span
                      key={k}
                      className="chip"
                      style={{
                        background: CATEGORIES[k].badgeBg,
                        color: CATEGORIES[k].badgeFg,
                      }}
                    >
                      {n} {CATEGORIES[k].label.toLowerCase()}
                    </span>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="label-eyebrow mb-1">Recent activity</div>
              {recent.length === 0 ? (
                <p className="text-2xs text-ink-400 italic">
                  No activity yet for this teammate.
                </p>
              ) : (
                <ul className="space-y-1">
                  {recent.map((e) => (
                    <li
                      key={e.id}
                      className="text-2xs text-ink-700 flex items-start gap-2"
                    >
                      <span className="text-brand-700 font-mono w-3 text-center">
                        {ICON[e.type] ?? '•'}
                      </span>
                      <div className="min-w-0 flex-1">
                        <span className="text-ink-700">{e.summary}</span>{' '}
                        <span className="text-ink-400">
                          · {formatRelativeTime(e.timestamp)}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <button
              className="btn-outline self-start"
              onClick={() => onShowQueue(m.id)}
              disabled={w.count === 0}
            >
              Show {m.name.split(' ')[0]}'s queue
            </button>
          </div>
        );
      })}
    </div>
  );
}
