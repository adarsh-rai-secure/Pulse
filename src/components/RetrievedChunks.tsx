import type { RetrievedChunk, SimilarAccount } from '../types';
import { CATEGORIES } from '../data/categories';
import { InfoTip } from './InfoTip';

interface Props {
  chunks: RetrievedChunk[];
  similar: SimilarAccount[];
}

export function RetrievedChunks({ chunks, similar }: Props) {
  return (
    <div className="panel-flat p-3">
      <div className="flex items-center gap-1.5 mb-2">
        <span className="label-eyebrow">Account memory</span>
        <span className="chip bg-brand-50 text-brand-700" title="Retrieval-Augmented Generation context store">
          {chunks.length} chunk{chunks.length === 1 ? '' : 's'}
        </span>
        <InfoTip
          text="What we feed into the model before it writes. The account profile and your notes are pulled in as 'chunks' — this is the RAG context store under the hood. Persisted in browser storage so your notes survive a refresh."
          side="bottom"
        />
      </div>
      <div className="space-y-1.5 mb-3">
        {chunks.map((c, i) => (
          <div
            key={i}
            className="font-mono text-2xs text-ink-700 bg-surface-100 rounded-md p-2 border border-surface-200"
          >
            <span className="text-brand-700 font-semibold">{c.source}</span>
            <span className="text-ink-400"> · </span>
            <span>{c.text}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-1.5 mb-1.5">
        <span className="label-eyebrow">Similar accounts</span>
        <InfoTip
          text="The three most similar accounts in your portfolio, based on how their notes and profiles line up with this one. Uses TF-IDF cosine similarity in the browser — no external service. Gives the model precedent to reason from."
          side="bottom"
        />
      </div>
      {similar.length === 0 ? (
        <div className="text-2xs text-ink-400 italic">
          No similar accounts above the relevance floor.
        </div>
      ) : (
        <div className="space-y-1">
          {similar.map((s) => {
            const cat = CATEGORIES[s.category];
            return (
              <div
                key={s.propertyId}
                className="flex items-center justify-between text-2xs bg-surface-0 border border-surface-200 rounded-md px-2 py-1"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="chip flex-shrink-0"
                    style={{ background: cat.badgeBg, color: cat.badgeFg }}
                  >
                    {cat.label}
                  </span>
                  <span className="truncate text-ink-700">{s.propertyName}</span>
                </div>
                <span
                  className="font-mono text-ink-500 tabular-nums"
                  title="Cosine similarity score (higher = more similar)"
                >
                  {s.score.toFixed(3)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
