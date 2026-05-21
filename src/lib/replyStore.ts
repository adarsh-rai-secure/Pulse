import type { ReplyRecord } from '../types';

const KEY = 'pulse.replies.v1';

function readAll(): Record<string, ReplyRecord> {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, ReplyRecord>;
  } catch {
    return {};
  }
}

function writeAll(value: Record<string, ReplyRecord>) {
  try {
    localStorage.setItem(KEY, JSON.stringify(value));
  } catch {
    // quota
  }
}

export const replyStore = {
  loadAll(): Record<string, ReplyRecord> {
    return readAll();
  },
  get(propertyId: string): ReplyRecord | undefined {
    return readAll()[propertyId];
  },
  set(propertyId: string, record: ReplyRecord): void {
    const all = readAll();
    all[propertyId] = record;
    writeAll(all);
  },
  clear(): void {
    localStorage.removeItem(KEY);
  },
};
