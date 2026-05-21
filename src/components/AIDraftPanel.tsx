import { useState } from 'react';
import type { DraftRecord } from '../types';
import { InfoTip } from './InfoTip';

interface Props {
  draft: DraftRecord | null;
  streamingText: string;
  isStreaming: boolean;
  usedFallback: boolean;
  capRemaining: number;
  capLimit: number;
  hasSent: boolean;
  onRegenerate: () => void;
  onSend: () => void;
  onPin: () => void;
}

export function AIDraftPanel({
  draft,
  streamingText,
  isStreaming,
  usedFallback,
  capRemaining,
  capLimit,
  hasSent,
  onRegenerate,
  onSend,
  onPin,
}: Props) {
  const [copied, setCopied] = useState(false);

  const displayText = isStreaming
    ? streamingText
    : draft?.draft ?? '';

  function handleCopy() {
    if (!displayText) return;
    navigator.clipboard.writeText(displayText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  }

  const subject = isStreaming
    ? streamingText.match(/^subject:\s*(.+)/i)?.[1] ?? ''
    : draft?.subject ?? '';
  const body = isStreaming
    ? streamingText.replace(/^subject:.+\n?/i, '').trim()
    : draft?.body ?? '';

  return (
    <div className="panel-flat p-3 flex flex-col gap-2.5">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5">
          <span className="label-eyebrow">AI-drafted outreach</span>
          <span className="chip bg-brand-50 text-brand-700">AI draft</span>
          {usedFallback && (
            <span
              className="chip bg-signal-stuckBg text-signal-stuckFg"
              title="OpenRouter unavailable or quota reached. Using deterministic template fallback."
            >
              fallback
            </span>
          )}
          <InfoTip
            text="The model writes a first version using the retrieved context and category playbook. You read, edit, and send. Human-in-the-loop is the point."
            side="bottom"
          />
        </div>
        <div className="text-2xs text-ink-500 tabular-nums">
          {capRemaining}/{capLimit} drafts left this session
        </div>
      </div>

      <div className="bg-surface-0 border border-surface-200 rounded-md min-h-[220px] flex flex-col">
        {subject && (
          <div className="px-3 py-2 border-b border-surface-200 text-13 font-semibold">
            {subject}
          </div>
        )}
        <pre
          className={
            'flex-1 px-3 py-2 text-13 leading-relaxed whitespace-pre-wrap font-sans ' +
            (isStreaming ? 'streaming-caret' : '')
          }
        >
          {body || (
            <span className="text-ink-400">
              {isStreaming
                ? 'Connecting to model…'
                : 'Click "Generate draft" to produce an email tuned to this account.'}
            </span>
          )}
        </pre>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          className="btn-primary"
          onClick={onSend}
          disabled={!draft || isStreaming || hasSent}
          title="Triggers a webhook simulation: POSTs the draft to a mock endpoint and tracks the reply. Nothing leaves your browser in this demo."
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none">
            <path
              d="M5 12l4 4L19 6"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {hasSent ? 'Sent (simulated)' : 'Send (simulated)'}
        </button>
        <button className="btn-outline" onClick={handleCopy} disabled={!displayText}>
          {copied ? 'Copied' : 'Copy'}
        </button>
        <button
          className="btn-outline"
          onClick={onRegenerate}
          disabled={isStreaming || capRemaining === 0}
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none">
            <path
              d="M4 12a8 8 0 0114-5.3L20 8M20 12a8 8 0 01-14 5.3L4 16M20 4v4h-4M4 20v-4h4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {isStreaming ? 'Generating…' : 'Regenerate'}
        </button>
        <button className="btn-ghost" onClick={onPin} disabled={!draft}>
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none">
            <path
              d="M12 17v5M9 9l6 0M7 13h10l-2-4V4H9v5l-2 4z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>
          Pin as golden
        </button>
      </div>

      {draft && !isStreaming && (
        <div className="text-2xs text-ink-500 font-mono">
          {draft.model} · {draft.latencyMs}ms · {draft.promptTokens}+
          {draft.completionTokens} tok
        </div>
      )}
    </div>
  );
}
