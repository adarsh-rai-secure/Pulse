import type { DraftRecord, ReplyRecord } from '../types';
import { formatRelativeTime } from '../lib/activity';

interface Props {
  draft: DraftRecord | undefined;
  reply: ReplyRecord | undefined;
  isWaitingForReply: boolean;
  replyStreaming: string;
}

const TONE_STYLE: Record<
  'positive' | 'neutral' | 'negative',
  { bg: string; fg: string; label: string }
> = {
  positive: {
    bg: 'bg-signal-refBg',
    fg: 'text-signal-refFg',
    label: 'Positive',
  },
  neutral: {
    bg: 'bg-signal-stuckBg',
    fg: 'text-signal-stuckFg',
    label: 'Neutral',
  },
  negative: {
    bg: 'bg-signal-churnBg',
    fg: 'text-signal-churnFg',
    label: 'Negative',
  },
};

export function ConversationView({
  draft,
  reply,
  isWaitingForReply,
  replyStreaming,
}: Props) {
  if (!draft && !reply && !isWaitingForReply) return null;

  return (
    <div className="border-l-2 border-brand-200 pl-4 space-y-3">
      <div className="label-eyebrow">Conversation</div>

      {draft && (
        <div className="bg-brand-50/40 border border-brand-200 rounded-md p-2.5">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-2xs font-semibold text-brand-700">
              You (AI-drafted) → client
            </span>
            <span className="text-2xs text-ink-500">
              {formatRelativeTime(draft.timestamp)}
            </span>
          </div>
          <div className="text-13 font-semibold mb-0.5">{draft.subject}</div>
          <pre className="whitespace-pre-wrap text-13 font-sans text-ink-700 max-h-32 overflow-auto">
            {draft.body}
          </pre>
        </div>
      )}

      {isWaitingForReply && !reply && (
        <div className="bg-surface-50 border border-dashed border-surface-200 rounded-md p-2.5">
          <div className="flex items-center gap-2 text-2xs text-ink-500">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
            {replyStreaming
              ? 'Client reply incoming…'
              : 'Tracking response from client…'}
          </div>
          {replyStreaming && (
            <pre className="whitespace-pre-wrap text-13 font-sans text-ink-700 mt-2 streaming-caret">
              {replyStreaming}
            </pre>
          )}
        </div>
      )}

      {reply && (
        <div className="bg-surface-50 border border-surface-200 rounded-md p-2.5">
          <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
            <span className="text-2xs font-semibold text-ink-700">
              Client → you
            </span>
            <div className="flex items-center gap-1.5">
              <span
                className={`chip ${TONE_STYLE[reply.tone].bg} ${TONE_STYLE[reply.tone].fg}`}
              >
                {TONE_STYLE[reply.tone].label}
              </span>
              <span className="text-2xs text-ink-500">
                {formatRelativeTime(reply.timestamp)}
              </span>
            </div>
          </div>
          <div className="text-13 font-semibold mb-0.5">{reply.subject}</div>
          <pre className="whitespace-pre-wrap text-13 font-sans text-ink-700 max-h-40 overflow-auto">
            {reply.body}
          </pre>
          <div className="text-2xs text-ink-400 font-mono mt-1.5">
            {reply.model} · {reply.latencyMs}ms
            {reply.usedFallback && ' · fallback'}
          </div>
        </div>
      )}
    </div>
  );
}
