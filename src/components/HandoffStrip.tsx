import { useMemo, useState } from 'react';
import type { ActivityEvent } from '../lib/activity';
import { activity, formatRelativeTime } from '../lib/activity';
import { getMember, TEAM } from '../data/team';
import {
  HANDOFF_REASONS,
  suggestedReasonsForCategory,
  getReason,
} from '../lib/handoffReasons';
import type { CategoryKey } from '../types';

interface Props {
  propertyId: string;
  currentOwnerId: string;
  category: CategoryKey;
  lastReasonId?: string;
  nonce: number;
  onHandoff: (newOwnerId: string, reasonId: string, note?: string) => void;
}

type Step = 'closed' | 'pick-reason' | 'pick-owner';

export function HandoffStrip({
  propertyId,
  currentOwnerId,
  category,
  lastReasonId,
  nonce,
  onHandoff,
}: Props) {
  const [step, setStep] = useState<Step>('closed');
  const [reasonId, setReasonId] = useState<string>('');
  const [note, setNote] = useState('');

  const handoffs: ActivityEvent[] = useMemo(
    () =>
      activity
        .forProperty(propertyId)
        .filter((e) => e.type === 'owner_changed')
        .slice(0, 5),
    [propertyId, nonce]
  );

  const currentOwner = getMember(currentOwnerId);
  const previous = handoffs[1];
  const reasons = useMemo(
    () => suggestedReasonsForCategory(category),
    [category]
  );
  const reasonObj = getReason(reasonId);
  const lastReason = getReason(lastReasonId);

  function reset() {
    setStep('closed');
    setReasonId('');
    setNote('');
  }

  function confirm(newOwnerId: string) {
    if (!reasonId) return;
    onHandoff(newOwnerId, reasonId, note.trim() || undefined);
    reset();
  }

  return (
    <div className="border border-surface-200 rounded-lg bg-surface-50 px-3 py-2.5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 min-w-0 flex-wrap">
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
                from{' '}
                <span className="text-ink-700">
                  {getMember(previous.ownerId).name}
                </span>{' '}
                {formatRelativeTime(previous.timestamp)}
                {lastReason && (
                  <>
                    {' '}
                    · <span className="text-brand-700">{lastReason.label}</span>
                  </>
                )}
              </span>
            </div>
          )}
        </div>
        <button
          className="btn-outline"
          onClick={() => (step === 'closed' ? setStep('pick-reason') : reset())}
        >
          {step === 'closed' ? 'Hand off…' : 'Cancel'}
        </button>
      </div>

      {step === 'pick-reason' && (
        <div className="mt-3 pt-3 border-t border-surface-200 space-y-2">
          <div className="label-eyebrow">Why are you reassigning?</div>
          <p className="text-2xs text-ink-500">
            The reason gets logged with the handoff and shapes the next AI
            draft for the new owner.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {reasons.map((r) => {
              const isSuggested = r === reasons[0];
              const isSelected = r.id === reasonId;
              return (
                <button
                  key={r.id}
                  onClick={() => setReasonId(r.id)}
                  className={
                    'text-left px-2.5 py-2 rounded-md border transition-colors ' +
                    (isSelected
                      ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-200'
                      : 'border-surface-200 bg-surface-0 hover:border-brand-200 hover:bg-brand-50/40')
                  }
                >
                  <div className="text-13 font-medium flex items-center gap-1.5">
                    {r.label}
                    {isSuggested && !isSelected && (
                      <span className="text-2xs text-brand-700 font-normal">
                        · suggested
                      </span>
                    )}
                  </div>
                  <div className="text-2xs text-ink-500 leading-snug">
                    {r.description}
                  </div>
                </button>
              );
            })}
          </div>
          {reasonObj?.id === 'other' && (
            <textarea
              className="input min-h-[60px]"
              placeholder="Reason for handoff (free-form)…"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          )}
          <div className="flex justify-end gap-2 pt-1">
            <button className="btn-outline" onClick={reset}>
              Cancel
            </button>
            <button
              className="btn-primary"
              disabled={!reasonId || (reasonId === 'other' && !note.trim())}
              onClick={() => setStep('pick-owner')}
            >
              Pick who's taking over →
            </button>
          </div>
        </div>
      )}

      {step === 'pick-owner' && (
        <div className="mt-3 pt-3 border-t border-surface-200 space-y-2">
          <div className="label-eyebrow">Reassign to</div>
          {reasonObj && (
            <div className="text-2xs text-ink-500">
              Reason:{' '}
              <span className="text-brand-700 font-medium">
                {reasonObj.label}
              </span>
              {reasonObj.preferredOwner && (
                <>
                  {' '}
                  · recommended:{' '}
                  <span className="text-ink-700 font-medium">
                    {getMember(reasonObj.preferredOwner).name}
                  </span>
                </>
              )}
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {TEAM.map((m) => {
              const isCurrent = m.id === currentOwnerId;
              const isRecommended = reasonObj?.preferredOwner === m.id;
              return (
                <button
                  key={m.id}
                  disabled={isCurrent}
                  onClick={() => confirm(m.id)}
                  className={
                    'text-left px-2.5 py-2 rounded-md border transition-colors ' +
                    (isCurrent
                      ? 'border-brand-200 bg-brand-50 text-brand-900 cursor-default'
                      : isRecommended
                        ? 'border-brand-500 bg-brand-50/60 hover:bg-brand-50'
                        : 'border-surface-200 bg-surface-0 hover:border-brand-200 hover:bg-brand-50/40')
                  }
                >
                  <div className="text-13 font-medium flex items-center gap-1.5">
                    {m.name}
                    {isCurrent && (
                      <span className="text-2xs text-brand-700 font-normal">
                        · current
                      </span>
                    )}
                    {isRecommended && !isCurrent && (
                      <span className="text-2xs text-brand-700 font-normal">
                        · recommended
                      </span>
                    )}
                  </div>
                  <div className="text-2xs text-ink-500">{m.role}</div>
                </button>
              );
            })}
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              className="btn-outline"
              onClick={() => setStep('pick-reason')}
            >
              ← Back
            </button>
          </div>
        </div>
      )}

      {handoffs.length > 0 && step === 'closed' && (
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

      {/* Unused but kept as proof these exports are valid */}
      <span hidden>{HANDOFF_REASONS.length}</span>
    </div>
  );
}
