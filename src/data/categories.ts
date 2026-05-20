import type { Category, CategoryKey } from '../types';

export const CATEGORIES: Record<CategoryKey, Category> = {
  churn: {
    key: 'churn',
    label: 'Churn risk',
    description:
      'Low adoption and low conversion. Nobody is using the product and it is not producing results.',
    action: 'Schedule save call',
    defaultOwner: 'csm',
    priority: 1,
    playbook: [
      'Schedule an executive save call within 7 days',
      'Pull conversation logs and identify specific failure modes',
      'Book an executive business review with their leadership',
      'If no response in 5 business days, escalate to your director',
    ],
    badgeBg: '#FCEBEB',
    badgeFg: '#B91C1C',
    dot: '#E24B4A',
    quadrantFill: 'rgba(226, 75, 74, 0.08)',
  },
  stuck: {
    key: 'stuck',
    label: 'Stuck',
    description:
      'High adoption, low conversion. The team uses the platform actively, but leads are not converting. This is a technical problem.',
    action: 'Open SE ticket',
    defaultOwner: 'se_lead',
    priority: 2,
    playbook: [
      'Open a solutions engineering ticket with full context',
      'Audit AI configuration, integrations, and source mapping',
      'Pull 25 recent non-converting conversations and tag failure types',
      'Book a 30-minute technical review with their ops lead',
    ],
    badgeBg: '#FAEEDA',
    badgeFg: '#B45309',
    dot: '#EF9F27',
    quadrantFill: 'rgba(239, 159, 39, 0.08)',
  },
  sleeping: {
    key: 'sleeping',
    label: 'Sleeping champion',
    description:
      'Low adoption, high conversion. The product converts well but the team barely touches it. The highest-upside category in the portfolio.',
    action: 'Drive adoption',
    defaultOwner: 'adoption',
    priority: 3,
    playbook: [
      'Identify the team member best positioned as an internal champion',
      'Book a 45-minute training session for the wider leasing team',
      'Send leadership a one-pager showing conversion results',
      'Set a 14-day follow-up to review adoption metrics',
    ],
    badgeBg: '#EEEDFE',
    badgeFg: '#534AB7',
    dot: '#7F77DD',
    quadrantFill: 'rgba(127, 119, 221, 0.10)',
  },
  reference: {
    key: 'reference',
    label: 'Reference',
    description:
      'High adoption and high conversion. Both numbers are green. These accounts are the engine for expansion, case studies, and referrals.',
    action: 'Ask for referral',
    defaultOwner: 'expansion',
    priority: 4,
    playbook: [
      'Send a referral request and ask for one warm intro',
      'Offer to feature them as a case study',
      'Open an expansion conversation for additional buildings',
      'Confirm renewal terms 90 days before contract end',
    ],
    badgeBg: '#EAF3DE',
    badgeFg: '#15803D',
    dot: '#639922',
    quadrantFill: 'rgba(99, 153, 34, 0.10)',
  },
};

export const CATEGORY_ORDER: CategoryKey[] = [
  'churn',
  'stuck',
  'sleeping',
  'reference',
];
