import { useMemo, useState } from 'react';
import type { ActivityEvent } from '../lib/activity';
import { activity, formatRelativeTime } from '../lib/activity';
import { getMember, TEAM } from '../data/team';

interface Props {
  propertyId: string;
  currentOwnerId: string;
  nonce: number;
  onPickOwner: (ownerId: string) => void;
}

export function HandoffStrip({
  propertyId,
  currentOwnerId,
  nonce,
  onPickOwner,
}: Props) {
  const [picking, setPicking] = useState(false);

  const handoffs: ActivityEvent[] = useMemo(
    () =>
      activity
        .forProperty(propertyId)
        .filter((e) => e.type === 'owner_changed')
        .slice(0, 5),
    [propertyId, nonce]
  );

  const currentOwner = getMember(currentOwnerId);
  const previous = handoffs[1]; // most recent before current

  return (
    <div className="border border-surface-200 rounded-lg bg-surface-50 px-3 py-2.5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-900 flex items-center justify-center font-semibold text-2xs flex-shrink-0">
              {currentOwner.name
                .split(' ')
                .map((s) => s[0])
                .join('')}
            </div>
            <div className="min-w-0">
              <div className="text-2xs label-eyebrow">Currently owned by</div>
              <div className="text-13 font-medium truncate">
                {currentOwner.name}{' '}
                <span className="text-ink-500 font-normal">
                  · {currentOwner.role}
                </span>
              </div>
            </div>
          </div>
          {previous && previous.ownerId && previous.ownerId !== currentOwnerId && (
            <div className="text-2xs text-ink-500 flex items-center gap-1.5">
              <span className="text-ink-300">⟵</span>
              <span>
                handed off from{' '}
                <span className="text-ink-700">
                  {getMember(previous.ownerId).name}
                </span>{' '}
                {formatRelativeTime(previous.timestamp)}
              </span>
            </div>
          )}
        </div>
        <button
          className="btn-outline"
          onClick={() => setPicking((v) => !v)}
        >
          {picking ? 'Cancel' : 'Hand off…'}
        </button>
      </div>

      {picking && (
        <div className="mt-3 pt-3 border-t border-surface-200 space-y-1.5">
          <div className="label-eyebrow mb-1">Reassign this account to</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {TEAM.map((m) => {
              const isCurrent = m.id === currentOwnerId;
              return (
                <button
                  key={m.id}
                  disabled={isCurrent}
                  onClick={() => {
                    onPickOwner(m.id);
                    setPicking(false);
                  }}
                  className={
                    'text-left px-2.5 py-2 rounded-md border transition-colors ' +
                    (isCurrent
                      ? 'border-brand-200 bg-brand-50 text-brand-900 cursor-default'
                      : 'border-surface-200 bg-surface-0 hover:border-brand-200 hover:bg-brand-50/40')
                  }
                >
                  <div className="text-13 font-medium">
                    {m.name}{' '}
                    {isCurrent && (
                      <span className="text-2xs text-brand-700 font-normal">
                        · current
                      </span>
                    )}
                  </div>
                  <div className="text-2xs text-ink-500">{m.role}</div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {handoffs.length > 0 && !picking && (
        <details className="mt-2 group">
          <summary className="text-2xs text-ink-500 cursor-pointer hover:text-ink-700 select-none">
            Handoff history ({handoffs.length})
          </summary>
          <ol className="mt-2 space-y-1 text-2xs text-ink-700">
            {handoffs.map((h) => (
              <li key={h.id} className="flex items-baseline gap-2">
                <span className="text-brand-700">⟳</span>
                <span>{h.summary}</span>
                <span className="text-ink-400">
                  · {formatRelativeTime(h.timestamp)}
                </span>
              </li>
            ))}
          </ol>
        </details>
      )}
    </div>
  );
}
