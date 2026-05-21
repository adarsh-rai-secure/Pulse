import { useEffect, useMemo, useRef, useState } from 'react';
import type {
  CaseStatus,
  DraftRecord,
  Property,
  Thresholds,
} from '../types';
import { classify } from '../lib/classify';
import { CATEGORIES } from '../data/categories';
import { TEAM, getMember } from '../data/team';
import { chunkContext, findSimilar } from '../lib/tfidf';
import { generateDraft } from '../lib/openrouter';
import { getCapState, incrementCap } from '../lib/sessionCap';
import { ragStore } from '../lib/ragStore';
import { RetrievedChunks } from './RetrievedChunks';
import { AIDraftPanel } from './AIDraftPanel';
import { HandoffStrip } from './HandoffStrip';
import { ConversationView } from './ConversationView';
import { InfoTip } from './InfoTip';
import type { ReplyRecord } from '../types';

interface Props {
  property: Property;
  allProperties: Property[];
  thresholds: Thresholds;
  caseState: { ownerId: string; status: CaseStatus; notes: string };
  modelId: string;
  activityNonce: number;
  reply: ReplyRecord | undefined;
  isWaitingForReply: boolean;
  replyStreaming: string;
  onOwnerChange: (ownerId: string) => void;
  onStatusChange: (status: CaseStatus) => void;
  onNotesChange: (notes: string) => void;
  onDraftChange: (record: DraftRecord) => void;
  onMailtoOpened?: () => void;
  onDraftPinned?: () => void;
  draftRecord: DraftRecord | undefined;
}

const STATUS: { v: CaseStatus; l: string }[] = [
  { v: 'new', l: 'New' },
  { v: 'in_progress', l: 'In progress' },
  { v: 'waiting', l: 'Waiting' },
  { v: 'completed', l: 'Completed' },
];

export function ActionPanel({
  property,
  allProperties,
  thresholds,
  caseState,
  modelId,
  activityNonce,
  reply,
  isWaitingForReply,
  replyStreaming,
  onOwnerChange,
  onStatusChange,
  onNotesChange,
  onDraftChange,
  onMailtoOpened,
  onDraftPinned,
  draftRecord,
}: Props) {
  const category = classify(
    property.userAdoption,
    property.conversionRate,
    thresholds
  );
  const cat = CATEGORIES[category];
  const owner = getMember(caseState.ownerId);

  const enrichedProperty: Property = useMemo(
    () => ({ ...property, notes: caseState.notes || property.notes }),
    [property, caseState.notes]
  );

  const chunks = useMemo(() => chunkContext(enrichedProperty), [enrichedProperty]);
  const similar = useMemo(
    () => findSimilar(enrichedProperty, allProperties, thresholds, 3),
    [enrichedProperty, allProperties, thresholds]
  );

  const [streamingText, setStreamingText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [cap, setCap] = useState(getCapState());
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    setStreamingText('');
    setIsStreaming(false);
    if (abortRef.current) abortRef.current.abort();
  }, [property.id]);

  async function runGeneration() {
    if (isStreaming) return;
    const state = getCapState();
    if (state.remaining === 0) {
      setCap(state);
      return;
    }
    setIsStreaming(true);
    setStreamingText('');
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    const result = await generateDraft(
      {
        property: enrichedProperty,
        category,
        ownerName: owner.name,
        ownerRole: owner.role,
        chunks,
        similar,
        thresholds,
      },
      {
        modelId,
        signal: ctrl.signal,
        onToken: (acc) => setStreamingText(acc),
      }
    );

    if (!result.usedFallback) {
      const next = incrementCap();
      setCap(next);
    } else {
      setCap(getCapState());
    }

    onDraftChange(result.record);
    ragStore.saveDraft(property.id, result.record);
    setIsStreaming(false);
    setStreamingText('');
  }

  function onMailto() {
    const subj = draftRecord?.subject ?? 'Outreach draft';
    const body = draftRecord?.body ?? '';
    window.location.href = `mailto:?subject=${encodeURIComponent(subj)}&body=${encodeURIComponent(body)}`;
    onMailtoOpened?.();
  }

  function onPin() {
    if (!draftRecord) return;
    ragStore.pinGolden(property.id, draftRecord);
    onDraftPinned?.();
  }

  const usedFallback = (draftRecord?.model ?? '') === 'fallback/template';

  return (
    <div className="panel p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="flex flex-col gap-3 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="text-[16px] font-semibold text-ink-900 leading-tight">
              {property.name}
            </div>
            <div className="text-2xs text-ink-500 mt-0.5">
              {property.city} · {property.units} units
            </div>
          </div>
          <span
            className="chip"
            style={{ background: cat.badgeBg, color: cat.badgeFg }}
          >
            {cat.label}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <MetricCard label="User adoption" value={`${property.userAdoption}%`} />
          <MetricCard
            label="Conversion rate"
            value={`${property.conversionRate}%`}
          />
        </div>

        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="label-eyebrow">Playbook</span>
            <InfoTip
              text="Standard plays for this quadrant. The model uses these as the basis for the ask in the outreach email."
              side="right"
            />
          </div>
          <ol className="text-13 text-ink-700 space-y-1.5 list-decimal pl-5">
            {cat.playbook.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </div>

        <HandoffStrip
          propertyId={property.id}
          currentOwnerId={caseState.ownerId}
          nonce={activityNonce}
          onPickOwner={onOwnerChange}
        />

        <div>
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="label-eyebrow">Case status</span>
            <InfoTip
              text="Working state for this case. 'New' is fresh, 'In progress' is being worked on, 'Waiting' is on the client, 'Completed' means closed out. Status changes are logged in the outreach log."
              side="right"
            />
          </div>
          <select
            className="input w-auto"
            value={caseState.status}
            onChange={(e) => onStatusChange(e.target.value as CaseStatus)}
          >
            {STATUS.map((s) => (
              <option key={s.v} value={s.v}>
                {s.l}
              </option>
            ))}
          </select>
        </div>

        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <span className="label-eyebrow">Internal notes</span>
            <InfoTip
              text="Anything you add here gets indexed into the RAG context store and pulled into the next AI draft."
              side="right"
            />
          </div>
          <textarea
            className="input min-h-[88px] resize-y"
            value={caseState.notes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="POC changed last week. Renewal in 90 days. Yardi sync failed after their upgrade…"
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 min-w-0">
        <RetrievedChunks chunks={chunks} similar={similar} />
        <AIDraftPanel
          draft={draftRecord ?? null}
          streamingText={streamingText}
          isStreaming={isStreaming}
          usedFallback={usedFallback}
          capRemaining={cap.remaining}
          capLimit={cap.limit}
          onRegenerate={runGeneration}
          onMailto={onMailto}
          onPin={onPin}
        />
        {!draftRecord && !isStreaming && (
          <button className="btn-primary self-start" onClick={runGeneration}>
            Generate draft
          </button>
        )}
        <ConversationView
          draft={draftRecord}
          reply={reply}
          isWaitingForReply={isWaitingForReply}
          replyStreaming={replyStreaming}
        />
      </div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="panel-flat p-2.5">
      <div className="label-eyebrow">{label}</div>
      <div className="text-[18px] font-semibold tracking-tight tabular-nums">
        {value}
      </div>
    </div>
  );
}
