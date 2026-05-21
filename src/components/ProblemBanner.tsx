import { useState } from 'react';

export function ProblemBanner() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="bg-brand-50 border-b border-brand-200"
      data-tour="problem-banner"
    >
      <div className="max-w-[1280px] mx-auto px-6 py-2.5 flex items-start gap-3 text-13">
        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-brand-700 text-white flex items-center justify-center mt-px text-[11px] font-bold">
          ?
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-brand-900">
              Your AI product is live at fifty clients. Who needs a call this week, who needs a fix, who is doing great?
            </span>
            <button
              onClick={() => setExpanded((v) => !v)}
              className="text-2xs text-brand-700 underline underline-offset-2 hover:text-brand-900"
            >
              {expanded ? 'less' : 'read the full setup'}
            </button>
          </div>
          {expanded && (
            <div className="mt-2 text-ink-700 leading-relaxed max-w-[820px]">
              <p className="mb-1.5">
                Your AI tool is deployed across dozens of client accounts. Some
                clients use it every day and close 38% of their leads. Other
                clients run the same software and close 4%. Same product, very
                different outcomes.
              </p>
              <p className="mb-1.5">
                One customer success manager usually owns 40 to 60 of those
                accounts. Their morning is three browser tabs and a spreadsheet,
                and by the time they figure out who to call first, an hour is
                gone.
              </p>
              <p>
                Pulse replaces that hour. Load the portfolio, see who is in
                trouble, click the account, read the AI draft, edit it, send it.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
