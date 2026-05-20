import type { DraftRecord, CaseStatus } from '../types';

const CASE_KEY = 'pulse.cases.v1';
const DRAFT_KEY = 'pulse.drafts.v1';
const GOLDEN_KEY = 'pulse.golden.v1';

interface PersistedCase {
  ownerId: string;
  status: CaseStatus;
  notes: string;
}

type CaseMap = Record<string, PersistedCase>;
type DraftMap = Record<string, DraftRecord>;

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // quota exceeded; silently drop
  }
}

export const ragStore = {
  loadCases(): CaseMap {
    return readJson<CaseMap>(CASE_KEY, {});
  },
  saveCase(propertyId: string, state: PersistedCase): void {
    const all = readJson<CaseMap>(CASE_KEY, {});
    all[propertyId] = state;
    writeJson(CASE_KEY, all);
  },
  loadDrafts(): DraftMap {
    return readJson<DraftMap>(DRAFT_KEY, {});
  },
  getDraft(propertyId: string): DraftRecord | undefined {
    return this.loadDrafts()[propertyId];
  },
  saveDraft(propertyId: string, record: DraftRecord): void {
    const all = this.loadDrafts();
    all[propertyId] = record;
    writeJson(DRAFT_KEY, all);
  },
  clearDraft(propertyId: string): void {
    const all = this.loadDrafts();
    delete all[propertyId];
    writeJson(DRAFT_KEY, all);
  },
  pinGolden(propertyId: string, record: DraftRecord): void {
    const all = readJson<Record<string, DraftRecord>>(GOLDEN_KEY, {});
    all[propertyId] = { ...record, pinned: true };
    writeJson(GOLDEN_KEY, all);
  },
  loadGolden(): Record<string, DraftRecord> {
    return readJson<Record<string, DraftRecord>>(GOLDEN_KEY, {});
  },
  clearAll(): void {
    localStorage.removeItem(CASE_KEY);
    localStorage.removeItem(DRAFT_KEY);
    localStorage.removeItem(GOLDEN_KEY);
  },
};
