interface Props {
  onUploadClick: () => void;
  onGuideClick: () => void;
  onDevPanelClick: () => void;
  onWhyClick: () => void;
}

export function Header({
  onUploadClick,
  onGuideClick,
  onDevPanelClick,
  onWhyClick,
}: Props) {
  return (
    <header className="w-full border-b border-surface-200 bg-surface-0">
      <div className="max-w-[1200px] mx-auto px-6 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-brand-700 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none">
              <path
                d="M3 13h4l2-5 3 10 2-6 1.5 3H21"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="leading-tight">
            <div className="text-[15px] font-semibold tracking-tight">Pulse</div>
            <div className="text-2xs text-ink-500">
              AI deployment health scoring
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="btn-ghost" onClick={onWhyClick}>
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
              <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Why this exists
          </button>
          <button className="btn-outline" onClick={onUploadClick}>
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none">
              <path
                d="M12 16V4m0 0l-4 4m4-4l4 4M5 18v1a2 2 0 002 2h10a2 2 0 002-2v-1"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Upload CSV
          </button>
          <button className="btn-outline" onClick={onGuideClick}>
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none">
              <path
                d="M4 5a2 2 0 012-2h12v18H6a2 2 0 01-2-2V5z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <path d="M4 18h14" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            Guide
          </button>
          <button className="btn-ghost" onClick={onDevPanelClick} title="Developer view">
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none">
              <path
                d="M8 6l-5 6 5 6M16 6l5 6-5 6M14 4l-4 16"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Dev
          </button>
          <div className="ml-1 flex items-center gap-2 px-2 py-1 rounded-md bg-surface-100 border border-surface-200">
            <div className="w-5 h-5 rounded-full bg-brand-200 flex items-center justify-center text-2xs font-semibold text-brand-900">
              AR
            </div>
            <span className="text-2xs text-ink-700">Adarsh</span>
          </div>
        </div>
      </div>
    </header>
  );
}
