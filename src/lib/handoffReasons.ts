import type { CategoryKey } from '../types';

export interface HandoffReason {
  id: string;
  label: string;
  description: string;
  preferredOwner?: 'csm' | 'se_lead' | 'se' | 'adoption' | 'expansion';
  promptHint: string;
}

export const HANDOFF_REASONS: HandoffReason[] = [
  {
    id: 'tech_config',
    label: 'Technical / configuration issue',
    description:
      'Looks like a config, integration, or lead source mapping problem. Needs a solutions engineer.',
    preferredOwner: 'se_lead',
    promptHint:
      'This handoff was triggered because the diagnosis is a configuration or integration issue, not training. Draft this as an INTERNAL ticket to solutions engineering with specific asks (audit config, pull non-converting conversations, check source mapping).',
  },
  {
    id: 'training_gap',
    label: 'Training / adoption gap',
    description:
      'Team needs hands-on training, not a configuration fix. Route to adoption.',
    preferredOwner: 'adoption',
    promptHint:
      'Frame this as an adoption initiative. Offer a hands-on training session for the leasing team and a one-pager for leadership showing the conversion upside.',
  },
  {
    id: 'save_call',
    label: 'Save call needed',
    description:
      'Account is at risk. Customer success owns the conversation.',
    preferredOwner: 'csm',
    promptHint:
      'Frame this as an urgent retention conversation. Acknowledge the gap without sounding alarmist, propose a 30-minute call this week, and bring specific failure modes you can investigate together.',
  },
  {
    id: 'expansion',
    label: 'Renewal or expansion opportunity',
    description:
      'Numbers are strong. Account is ready for a referral, case study, or new buildings.',
    preferredOwner: 'expansion',
    promptHint:
      'This account is performing well. Tone should be warm and confident. Make two asks: a referral and either a case study OR an expansion conversation about additional buildings.',
  },
  {
    id: 'capacity',
    label: 'Capacity / load-balancing',
    description:
      'No diagnostic change. Just moving this off the current owner to free up time.',
    promptHint:
      'No change in diagnosis. Keep the existing playbook tone; the email content should still match the account category.',
  },
  {
    id: 'other',
    label: 'Other (custom note)',
    description: 'Different reason. Add context in a free-form note.',
    promptHint: '',
  },
];

export function getReason(id: string | undefined): HandoffReason | undefined {
  if (!id) return undefined;
  return HANDOFF_REASONS.find((r) => r.id === id);
}

// Suggest reasons that fit the current category
export function suggestedReasonsForCategory(
  category: CategoryKey
): HandoffReason[] {
  const order = (() => {
    switch (category) {
      case 'churn':
        return ['save_call', 'tech_config', 'training_gap', 'capacity', 'other'];
      case 'stuck':
        return ['tech_config', 'training_gap', 'save_call', 'capacity', 'other'];
      case 'sleeping':
        return ['training_gap', 'expansion', 'save_call', 'capacity', 'other'];
      case 'reference':
        return ['expansion', 'capacity', 'training_gap', 'other'];
    }
  })();
  return order
    .map((id) => HANDOFF_REASONS.find((r) => r.id === id))
    .filter((r): r is HandoffReason => !!r);
}
