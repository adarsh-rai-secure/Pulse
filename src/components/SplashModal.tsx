import { useState } from 'react';
import { Modal } from './Modal';

interface Props {
  open: boolean;
  onClose: () => void;
  onUploadInstead: () => void;
  onPreviewSample: () => void;
}

const PANELS = [
  {
    label: 'The problem',
    title: 'One AI product, fifty different clients.',
    body: 'Adoption looks wildly different at every client. One uses it daily and closes 38% of leads. The next runs the same software and closes 4%. The customer success team has to figure out who needs help, what kind, and what to say — every single morning.',
  },
  {
    label: 'How Pulse helps',
    title: 'Sort accounts into four health groups. Act on the right ones first.',
    body: 'Upload your portfolio. Pulse classifies each client by how often the team uses the tool and how many leads they close. You get one of four labels per account: churn risk, stuck, sleeping champion, or reference. Each label comes with a playbook and an AI-drafted email.',
  },
  {
    label: 'Try it now',
    title: 'Two ways to start.',
    body: "Use the bundled 52-client sample portfolio to explore, or upload your own CSV. Want to look at the sample first? You can preview it before loading it. Swap data any time from the header.",
  },
];

export function SplashModal({
  open,
  onClose,
  onUploadInstead,
  onPreviewSample,
}: Props) {
  const [step, setStep] = useState(0);
  const isLast = step === PANELS.length - 1;

  return (
    <Modal open={open} onClose={onClose} width="max-w-xl">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-brand-700 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none">
                <path
                  d="M3 13h4l2-5 3 10 2-6 1.5 3H21"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="text-13 font-semibold">Welcome to Pulse</div>
          </div>
          <div className="flex items-center gap-1">
            {PANELS.map((_, i) => (
              <span
                key={i}
                className={
                  'w-5 h-1 rounded-full ' +
                  (i === step ? 'bg-brand-700' : 'bg-surface-200')
                }
              />
            ))}
          </div>
        </div>

        <div className="space-y-2 min-h-[200px]">
          <div className="label-eyebrow text-brand-700">{PANELS[step].label}</div>
          <h2 className="text-[20px] font-semibold tracking-tight leading-snug">
            {PANELS[step].title}
          </h2>
          <p className="text-13 text-ink-700 leading-relaxed">
            {PANELS[step].body}
          </p>
        </div>

        {isLast && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
            <button
              className="btn-primary justify-center py-2.5"
              onClick={onClose}
            >
              Use sample data
            </button>
            <button
              className="btn-outline justify-center py-2.5"
              onClick={() => {
                onClose();
                onPreviewSample();
              }}
            >
              Preview sample
            </button>
            <button
              className="btn-outline justify-center py-2.5"
              onClick={() => {
                onClose();
                onUploadInstead();
              }}
            >
              Upload my CSV
            </button>
          </div>
        )}

        {!isLast && (
          <div className="flex items-center justify-between pt-1">
            <button className="btn-ghost" onClick={onClose}>
              Skip
            </button>
            <button
              className="btn-primary"
              onClick={() => setStep((s) => s + 1)}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}
