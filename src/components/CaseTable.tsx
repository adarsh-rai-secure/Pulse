import type { CaseStatus, CategoryKey, Property, Thresholds } from '../types';
import { classify } from '../lib/classify';
import { CATEGORIES } from '../data/categories';
import { TEAM } from '../data/team';

interface Props {
  properties: Property[];
  thresholds: Thresholds;
  selectedId: string | null;
  onSelect: (id: string) => void;
  cases: Record<string, { ownerId: string; status: CaseStatus }>;
  onOwnerChange: (propertyId: string, ownerId: string) => void;
  onStatusChange: (propertyId: string, status: CaseStatus) => void;
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
  onOwnerChange,
  onStatusChange,
}: Props) {
  if (properties.length === 0) {
    return (
      <div className="panel-flat p-8 text-center text-13 text-ink-500">
        No accounts match the current filters.
      </div>
    );
  }
  return (
    <div className="panel-flat overflow-hidden">
      <table className="w-full text-13">
        <thead>
          <tr className="text-left bg-surface-50 border-b border-surface-200">
            <Th>Property</Th>
            <Th className="text-right pr-3">UA</Th>
            <Th className="text-right pr-3">CR</Th>
            <Th>Health</Th>
            <Th>Next step</Th>
            <Th>Owner</Th>
            <Th>Status</Th>
          </tr>
        </thead>
        <tbody>
          {properties.map((p) => {
            const cat: CategoryKey = classify(
              p.userAdoption,
              p.conversionRate,
              thresholds
            );
            const c = CATEGORIES[cat];
            const cs =
              cases[p.id] ?? { ownerId: c.defaultOwner, status: 'new' as CaseStatus };
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
                <Td className="text-right pr-3 tabular-nums">{p.userAdoption}%</Td>
                <Td className="text-right pr-3 tabular-nums">{p.conversionRate}%</Td>
                <Td>
                  <span
                    className="chip"
                    style={{ background: c.badgeBg, color: c.badgeFg }}
                  >
                    {c.label}
                  </span>
                </Td>
                <Td className="text-ink-700">{c.action}</Td>
                <Td onClick={(e) => e.stopPropagation()}>
                  <select
                    className="input py-1 text-13"
                    value={cs.ownerId}
                    onChange={(e) => onOwnerChange(p.id, e.target.value)}
                  >
                    {TEAM.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
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
  );
}

function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <th
      className={
        'label-eyebrow font-medium py-2 px-3 ' + (className ?? '')
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
