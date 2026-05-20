const KEY = 'pulse.session.calls';
const RESET_KEY = 'pulse.session.resetAt';
const LIMIT = 50;
const WINDOW_MS = 24 * 60 * 60 * 1000;

interface CapState {
  used: number;
  limit: number;
  remaining: number;
  resetAt: number;
}

function readState(): CapState {
  const now = Date.now();
  let resetAt = Number(localStorage.getItem(RESET_KEY));
  let used = Number(localStorage.getItem(KEY));
  if (!Number.isFinite(resetAt) || resetAt < now) {
    resetAt = now + WINDOW_MS;
    used = 0;
    localStorage.setItem(RESET_KEY, String(resetAt));
    localStorage.setItem(KEY, '0');
  }
  if (!Number.isFinite(used)) used = 0;
  return { used, limit: LIMIT, remaining: Math.max(0, LIMIT - used), resetAt };
}

export function getCapState(): CapState {
  return readState();
}

export function incrementCap(): CapState {
  const s = readState();
  const next = s.used + 1;
  localStorage.setItem(KEY, String(next));
  return { ...s, used: next, remaining: Math.max(0, LIMIT - next) };
}

export function canCallApi(): boolean {
  return readState().remaining > 0;
}
