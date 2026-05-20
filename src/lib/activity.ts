const KEY = 'pulse.activity.v1';
const LIMIT = 500;

export type ActivityType =
  | 'draft_generated'
  | 'draft_pinned'
  | 'mailto_opened'
  | 'owner_changed'
  | 'status_changed'
  | 'notes_edited'
  | 'data_loaded'
  | 'reply_received';

export interface ActivityEvent {
  id: string;
  type: ActivityType;
  propertyId?: string;
  ownerId?: string;
  timestamp: number;
  summary: string;
  meta?: Record<string, string | number>;
}

function readAll(): ActivityEvent[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ActivityEvent[];
  } catch {
    return [];
  }
}

function writeAll(events: ActivityEvent[]): void {
  try {
    const trimmed = events.slice(0, LIMIT);
    localStorage.setItem(KEY, JSON.stringify(trimmed));
  } catch {
    // ignore quota
  }
}

export const activity = {
  log(event: Omit<ActivityEvent, 'id' | 'timestamp'>): ActivityEvent {
    const full: ActivityEvent = {
      ...event,
      id: `${event.type}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: Date.now(),
    };
    const all = readAll();
    all.unshift(full);
    writeAll(all);
    return full;
  },
  all(): ActivityEvent[] {
    return readAll();
  },
  forProperty(propertyId: string): ActivityEvent[] {
    return readAll().filter((e) => e.propertyId === propertyId);
  },
  forOwner(ownerId: string): ActivityEvent[] {
    return readAll().filter((e) => e.ownerId === ownerId);
  },
  clear(): void {
    localStorage.removeItem(KEY);
  },
};

export function formatRelativeTime(ts: number, now = Date.now()): string {
  const sec = Math.round((now - ts) / 1000);
  if (sec < 5) return 'just now';
  if (sec < 60) return `${sec}s ago`;
  const min = Math.round(sec / 60);
  if (min < 60) return `${min} min ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr} hr ago`;
  const day = Math.round(hr / 24);
  if (day < 30) return `${day} day${day === 1 ? '' : 's'} ago`;
  const mo = Math.round(day / 30);
  return `${mo} mo ago`;
}
