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
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <div className="flex-1 min-w-[220px] relative">
        <svg viewBox="0 0 24 24" className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-400" fill="none">
          <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="1.5" />
          <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <input
          className="input pl-8"
          placeholder="Search account name, city, or notes…"
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
          onChange={(e) => onCategoryFilter(e.target.value as CategoryKey | 'all')}
        >
          <option value="all">All quadrants</option>
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
          text="Hides accounts whose case status is marked Completed. Useful for working through fresh queues."
          side="left"
        />
      </label>
    </div>
  );
}
