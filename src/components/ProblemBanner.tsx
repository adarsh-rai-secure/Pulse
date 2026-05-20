import { useState } from 'react';

export function ProblemBanner() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-brand-50 border-b border-brand-200">
      <div className="max-w-[1200px] mx-auto px-6 py-2.5 flex items-start gap-3 text-13">
        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-brand-700 text-white flex items-center justify-center mt-px text-[11px] font-bold">
          ?
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-brand-900">
              You sell an AI product to 50+ clients. Who is using it, who is not, and who needs a call this week?
            </span>
            <button
              onClick={() => setExpanded((v) => !v)}
              className="text-2xs text-brand-700 underline underline-offset-2 hover:text-brand-900"
            >
              {expanded ? 'less' : 'read the full setup'}
            </button>
          </div>
          {expanded && (
            <div className="mt-2 text-ink-700 leading-relaxed max-w-[800px]">
              <p className="mb-1.5">
                AI leasing tools get deployed across hundreds of multifamily
                properties, and adoption looks wildly different at every account.
                One property converts 38% of leads. The next one, running the same
                software, converts 4%.
              </p>
              <p className="mb-1.5">
                A single customer success manager owns 40 to 60 of these accounts.
                Their morning is three tabs, one spreadsheet, and an hour of
                triage. By the time they figure out what to send to whom, the day
                is half gone.
              </p>
              <p>
                Pulse replaces that hour. Upload portfolio metrics, classify each
                account into a health quadrant, and let the model draft the
                outreach. The CSM clicks, reads, edits, sends.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
