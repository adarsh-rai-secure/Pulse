import { Modal } from './Modal';
import { CATEGORIES, CATEGORY_ORDER } from '../data/categories';
import { TEAM } from '../data/team';
import { SEARCH_HINTS } from '../lib/search';

interface Props {
  open: boolean;
  onClose: () => void;
  onReplayTour?: () => void;
}

export function GuideModal({ open, onClose, onReplayTour }: Props) {
  return (
    <Modal open={open} onClose={onClose} title="Guide" width="max-w-3xl">
      <div className="space-y-5 text-13 leading-relaxed">
        {onReplayTour && (
          <div className="flex items-center justify-between gap-3 border border-brand-200 bg-brand-50/50 rounded-md p-3">
            <div>
              <div className="text-13 font-medium text-brand-900">
                Replay the walkthrough
              </div>
              <p className="text-2xs text-ink-500">
                Re-run the 9-step interactive tour with coachmarks for every
                main control.
              </p>
            </div>
            <button className="btn-primary" onClick={onReplayTour}>
              Start tour
            </button>
          </div>
        )}

        <section>
          <h3 className="font-semibold text-ink-900 mb-1">In plain English</h3>
          <p className="text-ink-700">
            Pulse takes your client portfolio and sorts every account by two
            numbers: how often the team uses your AI tool ("usage") and how many
            AI-handled leads turned into leases ("close rate"). It groups
            accounts by health, tells you what to do for each, and writes a
            first-draft email when you click an account.
          </p>
        </section>

        <section>
          <h3 className="font-semibold text-ink-900 mb-2">The four health groups</h3>
          <div className="grid sm:grid-cols-2 gap-2">
            {CATEGORY_ORDER.map((k) => {
              const c = CATEGORIES[k];
              return (
                <div
                  key={k}
                  className="border border-surface-200 rounded-lg p-3"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className="chip"
                      style={{ background: c.badgeBg, color: c.badgeFg }}
                    >
                      {c.label}
                    </span>
                    <span className="text-2xs text-ink-500">
                      default owner:{' '}
                      {TEAM.find((t) => t.id === c.defaultOwner)?.name}
                    </span>
                  </div>
                  <p className="text-ink-700 mb-2">{c.description}</p>
                  <ol className="list-decimal pl-4 text-ink-700 space-y-0.5">
                    {c.playbook.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ol>
                </div>
              );
            })}
          </div>
        </section>

        <section>
          <h3 className="font-semibold text-ink-900 mb-2">How search works</h3>
          <p className="text-ink-700 mb-2">
            Type into the search box on the "All accounts" section. You can
            combine any of these:
          </p>
          <ul className="space-y-1">
            {SEARCH_HINTS.map((h) => (
              <li key={h.token} className="flex items-baseline gap-2">
                <code className="text-2xs bg-surface-100 px-1.5 py-0.5 rounded font-mono">
                  {h.token}
                </code>
                <span className="text-ink-700">{h.meaning}</span>
              </li>
            ))}
          </ul>
          <p className="text-2xs text-ink-500 mt-2">
            Anything that's not a special token searches across account name,
            city (full state names also work, so "Texas" matches "TX"), notes, and
            owner name.
          </p>
        </section>

        <section>
          <h3 className="font-semibold text-ink-900 mb-2">Team roles</h3>
          <div className="grid sm:grid-cols-2 gap-2">
            {TEAM.map((m) => (
              <div
                key={m.id}
                className="border border-surface-200 rounded-md p-2.5 text-ink-700"
              >
                <div className="font-medium text-ink-900">{m.name}</div>
                <div className="text-2xs text-ink-500">{m.role}</div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h3 className="font-semibold text-ink-900 mb-1">Under the hood</h3>
          <ul className="list-disc pl-5 text-ink-700 space-y-1">
            <li>
              <strong>Account memory (RAG context store):</strong> each
              account's profile and your notes are chunked and stored in browser
              localStorage. We pull them back as "retrieved context" right
              before the model writes.
            </li>
            <li>
              <strong>Similar accounts (TF-IDF cosine):</strong> the corpus is
              the chunked text from every account. We compute term-frequency
              inverse-document-frequency weights, then rank by cosine similarity
              and blend with metric distance. Runs entirely in the browser.
            </li>
            <li>
              <strong>Streaming generation:</strong> drafts arrive as
              Server-Sent Events from OpenRouter and render token-by-token with
              a blinking caret.
            </li>
            <li>
              <strong>Observability:</strong> the Dev button in the header opens
              the full system + user prompt, model, latency, and token counts
              for the latest draft.
            </li>
          </ul>
        </section>
      </div>
    </Modal>
  );
}
