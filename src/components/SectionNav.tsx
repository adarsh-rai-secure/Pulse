import { useScrollSpy } from '../hooks/useScrollSpy';

interface NavItem {
  id: string;
  label: string;
  count?: number;
  tone?: 'default' | 'churn';
}

interface Props {
  items: NavItem[];
}

export function SectionNav({ items }: Props) {
  const active = useScrollSpy(
    items.map((i) => i.id),
    120
  );

  function jump(id: string) {
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top, behavior: 'smooth' });
  }

  return (
    <nav
      aria-label="Section navigation"
      className="sticky top-4 self-start space-y-1 text-13"
    >
      <div className="label-eyebrow mb-2 px-2">On this page</div>
      {items.map((item) => {
        const isActive = item.id === active;
        return (
          <button
            key={item.id}
            onClick={() => jump(item.id)}
            className={
              'w-full text-left px-2.5 py-1.5 rounded-md flex items-center justify-between gap-2 transition-colors ' +
              (isActive
                ? 'bg-brand-50 text-brand-900 font-medium'
                : 'text-ink-700 hover:bg-surface-50')
            }
          >
            <span
              className={
                'flex items-center gap-2 truncate ' +
                (isActive ? '' : 'text-ink-700')
              }
            >
              <span
                className={
                  'w-1 h-4 rounded-full ' +
                  (isActive ? 'bg-brand-700' : 'bg-transparent')
                }
                aria-hidden
              />
              {item.label}
            </span>
            {typeof item.count === 'number' && (
              <span
                className={
                  'text-2xs tabular-nums ' +
                  (item.tone === 'churn'
                    ? 'text-signal-churnFg font-semibold'
                    : 'text-ink-500')
                }
              >
                {item.count}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
