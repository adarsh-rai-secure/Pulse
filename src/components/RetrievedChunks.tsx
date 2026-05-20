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
        <span className="label-eyebrow">RAG context store</span>
        <span className="chip bg-brand-50 text-brand-700">
          {chunks.length} chunk{chunks.length === 1 ? '' : 's'}
        </span>
        <InfoTip
          text="These are the exact context passages we inject into the prompt before asking the model. Real retrieval: the account profile, your notes, and the top similar accounts ranked by TF-IDF cosine. Persisted in browser storage between sessions."
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
        <span className="label-eyebrow">Similar accounts (TF-IDF)</span>
        <InfoTip
          text="We tokenize every account's notes + profile, compute TF-IDF weights, and rank by cosine similarity. The top matches are added to the prompt as precedent so the model can reason from in-portfolio examples."
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
                <span className="font-mono text-ink-500 tabular-nums">
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
