import type { QuadrantStats } from '../lib/classify';
import { InfoTip } from './InfoTip';

interface Props {
  stats: QuadrantStats;
}

export function PortfolioSummary({ stats }: Props) {
  const cards = [
    {
      label: 'Accounts loaded',
      value: String(stats.total),
      tone: 'default' as const,
      tip: 'Total client accounts in the current dataset. Replace the data any time using "Upload CSV" in the header.',
    },
    {
      label: 'Needs a save call',
      value: String(stats.byCategory.churn),
      tone: 'churn' as const,
      tip: 'Accounts in the "churn risk" group: low usage AND low conversion. Call these before they decide not to renew.',
    },
    {
      label: 'Avg usage',
      value: `${stats.avgUA}%`,
      tone: 'default' as const,
      tip: 'Average user adoption across the portfolio. Move the usage slider on the left to change what counts as "high enough".',
    },
    {
      label: 'Avg leads closed',
      value: `${stats.avgCR}%`,
      tone: 'default' as const,
      tip: 'Average percent of AI-handled leads that turned into tours or signed leases.',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {cards.map((c) => (
        <div key={c.label} className="panel-flat p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="label-eyebrow">{c.label}</span>
            <InfoTip text={c.tip} side="bottom" />
          </div>
          <div
            className={
              'text-xl font-semibold tracking-tight ' +
              (c.tone === 'churn' ? 'text-signal-churnFg' : 'text-ink-900')
            }
          >
            {c.value}
          </div>
        </div>
      ))}
    </div>
  );
}
