import { useMemo, useState } from 'react';
import type { CaseStatus, CategoryKey, Property, Thresholds } from '../types';
import { classify } from '../lib/classify';
import { CATEGORIES } from '../data/categories';
import { TEAM } from '../data/team';
import { InfoTip } from './InfoTip';

interface Props {
  properties: Property[];
  thresholds: Thresholds;
  selectedId: string | null;
  onSelect: (id: string) => void;
  cases: Record<string, { ownerId: string; status: CaseStatus }>;
  onStatusChange: (propertyId: string, status: CaseStatus) => void;
  pageSize?: number;
}

const STATUS_LABEL: Record<CaseStatus, string> = {
  new: 'New',
  in_progress: 'In progress',
  waiting: 'Waiting',
  completed: 'Completed',
};

export function CaseTable({
  properties,
  thresholds,
  selectedId,
  onSelect,
  cases,
  onStatusChange,
  pageSize = 10,
}: Props) {
  const [page, setPage] = useState(0);
  const pageCount = Math.max(1, Math.ceil(properties.length / pageSize));

  const pageRows = useMemo(() => {
    if (page * pageSize >= properties.length) {
      const lastPage = Math.max(0, pageCount - 1);
      return properties.slice(lastPage * pageSize, lastPage * pageSize + pageSize);
    }
    return properties.slice(page * pageSize, page * pageSize + pageSize);
  }, [properties, page, pageSize, pageCount]);

  if (properties.length === 0) {
    return (
      <div className="panel-flat p-8 text-center text-13 text-ink-500">
        No accounts match the current filters.
      </div>
    );
  }

  const from = page * pageSize + 1;
  const to = Math.min(properties.length, (page + 1) * pageSize);

  return (
    <div className="space-y-2">
      <div className="panel-flat overflow-hidden">
        <table className="w-full text-13">
          <thead>
            <tr className="text-left bg-surface-50 border-b border-surface-200">
              <Th>
                Account
                <InfoTip
                  text="Property name, city, and unit count. Click a row to open the action panel."
                  side="right"
                />
              </Th>
              <Th className="text-right pr-3">
                Use{' '}
                <InfoTip
                  text="User adoption: how often the team uses the AI platform. Higher is better."
                  side="left"
                />
              </Th>
              <Th className="text-right pr-3">
                Close{' '}
                <InfoTip
                  text="Conversion rate: what percent of AI-handled leads turned into tours or signed leases. Higher is better."
                  side="left"
                />
              </Th>
              <Th>Health</Th>
              <Th>What to do</Th>
              <Th>Owner</Th>
              <Th>
                Status
                <InfoTip
                  text="Working state for this case. Change ownership in the action panel by clicking a row."
                  side="left"
                />
              </Th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((p) => {
              const cat: CategoryKey = classify(
                p.userAdoption,
                p.conversionRate,
                thresholds
              );
              const c = CATEGORIES[cat];
              const cs =
                cases[p.id] ??
                { ownerId: c.defaultOwner, status: 'new' as CaseStatus };
              const selected = p.id === selectedId;
              return (
                <tr
                  key={p.id}
                  onClick={() => onSelect(p.id)}
                  className={
                    'border-b border-surface-100 cursor-pointer hover:bg-surface-50 ' +
                    (selected ? 'bg-brand-50/60' : '')
                  }
                >
                  <Td>
                    <div className="font-medium text-ink-900 leading-tight">
                      {p.name}
                    </div>
                    <div className="text-2xs text-ink-500">
                      {p.city} · {p.units} units
                    </div>
                  </Td>
                  <Td className="text-right pr-3 tabular-nums">
                    {p.userAdoption}%
                  </Td>
                  <Td className="text-right pr-3 tabular-nums">
                    {p.conversionRate}%
                  </Td>
                  <Td>
                    <span
                      className="chip"
                      style={{ background: c.badgeBg, color: c.badgeFg }}
                    >
                      {c.label}
                    </span>
                  </Td>
                  <Td className="text-ink-700">{c.action}</Td>
                  <Td className="text-ink-700">
                    {TEAM.find((m) => m.id === cs.ownerId)?.name ?? 'Unassigned'}
                  </Td>
                  <Td onClick={(e) => e.stopPropagation()}>
                    <select
                      className="input py-1 text-13"
                      value={cs.status}
                      onChange={(e) =>
                        onStatusChange(p.id, e.target.value as CaseStatus)
                      }
                    >
                      {(Object.keys(STATUS_LABEL) as CaseStatus[]).map((s) => (
                        <option key={s} value={s}>
                          {STATUS_LABEL[s]}
                        </option>
                      ))}
                    </select>
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-2xs text-ink-500 px-1">
        <span>
          Showing {from} to {to} of {properties.length}
        </span>
        {pageCount > 1 && (
          <div className="flex items-center gap-1">
            <button
              className="btn-ghost px-2 py-1 disabled:opacity-40"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              aria-label="Previous page"
            >
              ← Prev
            </button>
            <span className="px-2 tabular-nums">
              {page + 1} / {pageCount}
            </span>
            <button
              className="btn-ghost px-2 py-1 disabled:opacity-40"
              onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
              disabled={page >= pageCount - 1}
              aria-label="Next page"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Th({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={
        'label-eyebrow font-medium py-2 px-3 whitespace-nowrap ' + (className ?? '')
      }
    >
      {children}
    </th>
  );
}

function Td({
  children,
  className,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
}) {
  return (
    <td className={'py-2.5 px-3 align-middle ' + (className ?? '')} onClick={onClick}>
      {children}
    </td>
  );
}
