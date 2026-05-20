import type { ModelOption } from '../types';

// Cost figures are USD per million tokens from OpenRouter as of 2025.
// per100Queries assumes ~400 prompt tokens + ~250 completion tokens per draft.
const PROMPT_TOKENS_PER_Q = 400;
const COMPLETION_TOKENS_PER_Q = 250;

function per100({
  promptCostPerM,
  completionCostPerM,
}: {
  promptCostPerM: number;
  completionCostPerM: number;
}): number {
  const dollars =
    100 *
    ((PROMPT_TOKENS_PER_Q / 1_000_000) * promptCostPerM +
      (COMPLETION_TOKENS_PER_Q / 1_000_000) * completionCostPerM);
  return Math.round(dollars * 10000) / 10000;
}

const RAW: Omit<ModelOption, 'per100Queries'>[] = [
  {
    id: 'google/gemini-flash-1.5-8b',
    label: 'Gemini Flash 1.5 8B',
    provider: 'Google',
    promptCostPerM: 0.0375,
    completionCostPerM: 0.15,
    tier: 'cheap',
  },
  {
    id: 'google/gemini-2.0-flash-lite-001',
    label: 'Gemini 2.0 Flash Lite',
    provider: 'Google',
    promptCostPerM: 0.075,
    completionCostPerM: 0.3,
    tier: 'cheap',
  },
  {
    id: 'anthropic/claude-haiku-4.5',
    label: 'Claude Haiku 4.5',
    provider: 'Anthropic',
    promptCostPerM: 1.0,
    completionCostPerM: 5.0,
    tier: 'balanced',
  },
  {
    id: 'openai/gpt-4o-mini',
    label: 'GPT-4o mini',
    provider: 'OpenAI',
    promptCostPerM: 0.15,
    completionCostPerM: 0.6,
    tier: 'balanced',
  },
  {
    id: 'anthropic/claude-sonnet-4.6',
    label: 'Claude Sonnet 4.6',
    provider: 'Anthropic',
    promptCostPerM: 3.0,
    completionCostPerM: 15.0,
    tier: 'quality',
  },
];

export const MODELS: ModelOption[] = RAW.map((m) => ({
  ...m,
  per100Queries: per100(m),
}));

export const DEFAULT_MODEL_ID = 'google/gemini-2.0-flash-lite-001';

export function getModel(id: string): ModelOption {
  return MODELS.find((m) => m.id === id) ?? MODELS[0];
}

export function formatCost(usd: number): string {
  if (usd < 0.01) return `$${(usd * 100).toFixed(2)}¢ / 100 drafts`;
  return `$${usd.toFixed(3)} / 100 drafts`;
}
