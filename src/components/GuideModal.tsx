import { Modal } from './Modal';
import { CATEGORIES, CATEGORY_ORDER } from '../data/categories';
import { TEAM } from '../data/team';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function GuideModal({ open, onClose }: Props) {
  return (
    <Modal open={open} onClose={onClose} title="Reference guide" width="max-w-3xl">
      <div className="space-y-5 text-13 leading-relaxed">
        <section>
          <h3 className="font-semibold text-ink-900 mb-1">How classification works</h3>
          <p className="text-ink-700">
            Each account is placed in one of four quadrants by comparing its
            user adoption (UA) and conversion rate (CR) against the threshold
            sliders. Move the sliders and watch the scatter plot regroup in
            real time. Defaults are UA 30% and CR 20%.
          </p>
        </section>

        <section>
          <h3 className="font-semibold text-ink-900 mb-2">Quadrants</h3>
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
                      default owner: {TEAM.find((t) => t.id === c.defaultOwner)?.name}
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
          <h3 className="font-semibold text-ink-900 mb-2">Team</h3>
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
          <h3 className="font-semibold text-ink-900 mb-1">
            Under the hood
          </h3>
          <ul className="list-disc pl-5 text-ink-700 space-y-1">
            <li>
              <strong>RAG context store</strong>: each account's profile and
              your notes are chunked and stored in browser localStorage, then
              retrieved at draft time.
            </li>
            <li>
              <strong>Semantic search</strong>: TF-IDF cosine similarity over
              the chunked corpus surfaces 3 related accounts for the model to
              reason from.
            </li>
            <li>
              <strong>Streaming generation</strong>: drafts arrive via Server-Sent
              Events from OpenRouter. The token caret blinks as content lands.
            </li>
            <li>
              <strong>Observability</strong>: the Dev panel shows the exact
              system + user prompt, model, latency, and token counts.
            </li>
          </ul>
        </section>
      </div>
    </Modal>
  );
}
