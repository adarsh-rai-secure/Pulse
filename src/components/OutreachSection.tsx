import { useMemo, useState } from 'react';
import type { DraftRecord, Property } from '../types';
import { activity, formatRelativeTime } from '../lib/activity';
import type { ActivityEvent } from '../lib/activity';
import { getMember, TEAM } from '../data/team';

interface Props {
  properties: Property[];
  drafts: Record<string, DraftRecord>;
  onSelect: (propertyId: string) => void;
  nonce: number; // bump to force refresh of activity readback
}

const ICON: Record<string, string> = {
  draft_generated: '✎',
  draft_pinned: '★',
  mailto_opened: '↗',
  owner_changed: '⟳',
  status_changed: '◐',
  notes_edited: '✐',
  data_loaded: '⤓',
  reply_received: '↩',
};

export function OutreachSection({ properties, drafts, onSelect, nonce }: Props) {
  const propsById = useMemo(() => {
    const m = new Map<string, Property>();
    for (const p of properties) m.set(p.id, p);
    return m;
  }, [properties]);

  const events: ActivityEvent[] = useMemo(() => activity.all(), [nonce]);

  const byProperty = useMemo(() => {
    const map = new Map<
      string,
      { events: ActivityEvent[]; latest: ActivityEvent }
    >();
    for (const e of events) {
      if (!e.propertyId) continue;
      const existing = map.get(e.propertyId);
      if (existing) existing.events.push(e);
      else map.set(e.propertyId, { events: [e], latest: e });
    }
    return map;
  }, [events]);

  const [openId, setOpenId] = useState<string | null>(null);

  if (byProperty.size === 0) {
    return (
      <div className="panel-flat p-6 text-13 text-ink-500">
        No outreach activity yet. Open an account, generate a draft, and the log
        will fill in here.
      </div>
    );
  }

  const entries = Array.from(byProperty.entries()).sort(
    (a, b) => b[1].latest.timestamp - a[1].latest.timestamp
  );

  return (
    <div className="space-y-2">
      {entries.map(([propertyId, info]) => {
        const property = propsById.get(propertyId);
        const draft = drafts[propertyId];
        const isOpen = openId === propertyId;
        const ownerEvent = info.events.find((e) => e.ownerId);
        const owner = ownerEvent
          ? TEAM.find((m) => m.id === ownerEvent.ownerId) ?? null
          : null;

        return (
          <div key={propertyId} className="panel-flat overflow-hidden">
            <button
              onClick={() => setOpenId(isOpen ? null : propertyId)}
              className="w-full text-left flex items-center justify-between gap-3 p-3 hover:bg-surface-50"
            >
              <div className="min-w-0">
                <div className="text-13 font-medium text-ink-900">
                  {property?.name ?? propertyId}
                </div>
                <div className="text-2xs text-ink-500">
                  {info.events.length} event
                  {info.events.length === 1 ? '' : 's'} ·{' '}
                  {ICON[info.latest.type] ?? '•'} {info.latest.summary} ·{' '}
                  {formatRelativeTime(info.latest.timestamp)}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {owner && (
                  <span className="text-2xs text-ink-500">{owner.name}</span>
                )}
                <span className="text-2xs text-ink-400">
                  {isOpen ? '▾' : '▸'}
                </span>
              </div>
            </button>

            {isOpen && (
              <div className="border-t border-surface-200 p-3 space-y-3">
                {draft && (
                  <div className="bg-surface-50 border border-surface-200 rounded-md p-2.5">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="label-eyebrow">
                        Most recent draft
                      </span>
                      <span className="text-2xs font-mono text-ink-500">
                        {draft.model} · {draft.latencyMs}ms
                      </span>
                    </div>
                    {draft.subject && (
                      <div className="text-13 font-semibold mb-1">
                        {draft.subject}
                      </div>
                    )}
                    <pre className="whitespace-pre-wrap text-13 font-sans text-ink-700 max-h-40 overflow-auto">
                      {draft.body}
                    </pre>
                  </div>
                )}

                <div>
                  <div className="label-eyebrow mb-1.5">Timeline</div>
                  <ol className="space-y-1.5">
                    {info.events.map((e) => (
                      <li
                        key={e.id}
                        className="flex items-start gap-2 text-13 text-ink-700"
                      >
                        <span className="text-brand-700 font-mono w-4 text-center">
                          {ICON[e.type] ?? '•'}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div>{e.summary}</div>
                          <div className="text-2xs text-ink-500">
                            {formatRelativeTime(e.timestamp)}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>

                {property && (
                  <button
                    className="btn-outline"
                    onClick={() => onSelect(propertyId)}
                  >
                    Open in action panel
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
