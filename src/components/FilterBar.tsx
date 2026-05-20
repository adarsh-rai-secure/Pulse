import { TEAM } from '../data/team';
import { CATEGORIES, CATEGORY_ORDER } from '../data/categories';
import type { CategoryKey } from '../types';
import { InfoTip } from './InfoTip';

interface Props {
  search: string;
  onSearch: (v: string) => void;
  ownerFilter: string;
  onOwnerFilter: (id: string) => void;
  categoryFilter: CategoryKey | 'all';
  onCategoryFilter: (k: CategoryKey | 'all') => void;
  hideCompleted: boolean;
  onHideCompleted: (v: boolean) => void;
  hints?: string[];
}

export function FilterBar({
  search,
  onSearch,
  ownerFilter,
  onOwnerFilter,
  categoryFilter,
  onCategoryFilter,
  hideCompleted,
  onHideCompleted,
  hints = [],
}: Props) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="flex-1 min-w-[220px] relative">
          <svg
            viewBox="0 0 24 24"
            className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-400"
            fill="none"
          >
            <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="1.5" />
            <path
              d="M20 20l-3.5-3.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          <input
            className="input pl-8"
            placeholder="Search by name, city, notes, or try churn / TX / owner:alex"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-1.5">
          <span className="label-eyebrow">Owner</span>
          <select
            className="input w-auto"
            value={ownerFilter}
            onChange={(e) => onOwnerFilter(e.target.value)}
          >
            <option value="all">Anyone</option>
            {TEAM.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="label-eyebrow">Health</span>
          <select
            className="input w-auto"
            value={categoryFilter}
            onChange={(e) =>
              onCategoryFilter(e.target.value as CategoryKey | 'all')
            }
          >
            <option value="all">All groups</option>
            {CATEGORY_ORDER.map((k) => (
              <option key={k} value={k}>
                {CATEGORIES[k].label}
              </option>
            ))}
          </select>
        </div>

        <label className="flex items-center gap-1.5 text-13 text-ink-700 cursor-pointer">
          <input
            type="checkbox"
            checked={hideCompleted}
            onChange={(e) => onHideCompleted(e.target.checked)}
          />
          Hide completed
          <InfoTip
            text="Hides accounts whose case status is marked Completed. Useful for working through a fresh queue."
            side="left"
          />
        </label>
      </div>

      {hints.length > 0 && search.length === 0 && (
        <div className="flex items-center gap-1.5 flex-wrap text-2xs text-ink-500">
          <span>Try:</span>
          {hints.slice(0, 6).map((h) => (
            <button
              key={h}
              onClick={() => onSearch(h)}
              className="font-mono bg-surface-100 hover:bg-brand-50 hover:text-brand-700 px-1.5 py-0.5 rounded transition-colors"
            >
              {h}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
