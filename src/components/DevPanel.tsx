import { Modal } from './Modal';
import { MODELS, formatCost } from '../lib/models';
import type { DraftRecord } from '../types';
import { ragStore } from '../lib/ragStore';

interface Props {
  open: boolean;
  onClose: () => void;
  modelId: string;
  onModelChange: (id: string) => void;
  lastDraft: DraftRecord | undefined;
  pinnedCount: number;
  onClearStore: () => void;
}

export function DevPanel({
  open,
  onClose,
  modelId,
  onModelChange,
  lastDraft,
  pinnedCount,
  onClearStore,
}: Props) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Developer view"
      width="max-w-3xl"
    >
      <div className="space-y-5 text-13">
        <section>
          <div className="label-eyebrow mb-1.5">Model</div>
          <div className="space-y-1.5">
            {MODELS.map((m) => (
              <label
                key={m.id}
                className={
                  'flex items-center justify-between gap-3 border rounded-md px-3 py-2 cursor-pointer ' +
                  (m.id === modelId
                    ? 'border-brand-500 bg-brand-50'
                    : 'border-surface-200 bg-surface-0 hover:bg-surface-50')
                }
              >
                <div className="flex items-center gap-2 min-w-0">
                  <input
                    type="radio"
                    checked={m.id === modelId}
                    onChange={() => onModelChange(m.id)}
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium">{m.label}</span>
                      <span className="chip bg-surface-100 text-ink-500">
                        {m.tier}
                      </span>
                    </div>
                    <div className="text-2xs text-ink-500 font-mono truncate">
                      {m.id}
                    </div>
                  </div>
                </div>
                <div className="text-2xs text-ink-700 text-right whitespace-nowrap font-mono">
                  <div>${m.promptCostPerM.toFixed(3)}/M in · ${m.completionCostPerM.toFixed(3)}/M out</div>
                  <div className="text-brand-700 font-semibold">
                    {formatCost(m.per100Queries)}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </section>

        <section>
          <div className="label-eyebrow mb-1.5">Last draft observability</div>
          {!lastDraft ? (
            <div className="text-ink-500 italic text-2xs">
              Generate a draft to see telemetry here.
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <Stat label="Model" value={lastDraft.model} />
                <Stat label="Latency" value={`${lastDraft.latencyMs}ms`} />
                <Stat
                  label="Prompt tokens"
                  value={String(lastDraft.promptTokens)}
                />
                <Stat
                  label="Completion tokens"
                  value={String(lastDraft.completionTokens)}
                />
              </div>
              <Code label="System prompt" text={lastDraft.systemPrompt} />
              <Code label="User prompt" text={lastDraft.userPrompt} />
              <Code label="Draft (full)" text={lastDraft.draft} />
            </div>
          )}
        </section>

        <section>
          <div className="label-eyebrow mb-1.5">Storage</div>
          <div className="flex items-center justify-between gap-3 border border-surface-200 rounded-md px-3 py-2">
            <div className="text-ink-700">
              {pinnedCount} pinned draft{pinnedCount === 1 ? '' : 's'} in localStorage.
            </div>
            <button
              className="btn-outline"
              onClick={() => {
                ragStore.clearAll();
                onClearStore();
              }}
            >
              Clear browser-side cases & drafts
            </button>
          </div>
        </section>
      </div>
    </Modal>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-surface-200 rounded-md p-2">
      <div className="label-eyebrow">{label}</div>
      <div className="text-13 font-mono truncate">{value}</div>
    </div>
  );
}

function Code({ label, text }: { label: string; text: string }) {
  return (
    <div>
      <div className="label-eyebrow mb-1">{label}</div>
      <pre className="bg-ink-900 text-surface-100 rounded-md p-3 text-2xs font-mono max-h-[200px] overflow-auto whitespace-pre-wrap">
        {text}
      </pre>
    </div>
  );
}
