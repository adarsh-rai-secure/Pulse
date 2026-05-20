export type CategoryKey = 'churn' | 'stuck' | 'sleeping' | 'reference';

export type CaseStatus = 'new' | 'in_progress' | 'waiting' | 'completed';

export interface Property {
  id: string;
  name: string;
  city: string;
  units: number;
  userAdoption: number;
  conversionRate: number;
  notes: string;
}

export interface CaseState {
  ownerId: string;
  status: CaseStatus;
  notes: string;
  draftCache?: DraftRecord;
}

export interface Thresholds {
  ua: number;
  cr: number;
}

export interface Category {
  key: CategoryKey;
  label: string;
  description: string;
  action: string;
  defaultOwner: string;
  priority: number;
  playbook: string[];
  badgeBg: string;
  badgeFg: string;
  dot: string;
  quadrantFill: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
}

export interface ModelOption {
  id: string;
  label: string;
  provider: string;
  promptCostPerM: number;
  completionCostPerM: number;
  per100Queries: number;
  tier: 'cheap' | 'balanced' | 'quality';
}

export interface DraftRecord {
  draft: string;
  subject: string;
  body: string;
  model: string;
  latencyMs: number;
  promptTokens: number;
  completionTokens: number;
  timestamp: number;
  systemPrompt: string;
  userPrompt: string;
  retrievedChunks: RetrievedChunk[];
  pinned?: boolean;
}

export interface RetrievedChunk {
  source: string;
  text: string;
  score: number;
}

export interface SimilarAccount {
  propertyId: string;
  propertyName: string;
  category: CategoryKey;
  score: number;
}
