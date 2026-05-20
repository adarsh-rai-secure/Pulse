import type { QuadrantStats } from '../lib/classify';
import { InfoTip } from './InfoTip';

interface Props {
  stats: QuadrantStats;
}

export function PortfolioSummary({ stats }: Props) {
  const cards = [
    {
      label: 'Accounts in portfolio',
      value: String(stats.total),
      tone: 'default' as const,
      tip: 'The total number of deployed client accounts in the loaded dataset.',
    },
    {
      label: 'Churn risk',
      value: String(stats.byCategory.churn),
      tone: 'churn' as const,
      tip: 'Low adoption and low conversion. These accounts need a save call this week or you lose them at renewal.',
    },
    {
      label: 'Avg adoption',
      value: `${stats.avgUA}%`,
      tone: 'default' as const,
      tip: 'Mean user adoption across all accounts. Cross this with the threshold slider to see how aggressive your bar is.',
    },
    {
      label: 'Avg conversion',
      value: `${stats.avgCR}%`,
      tone: 'default' as const,
      tip: 'Mean AI-handled lead conversion across all accounts.',
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
