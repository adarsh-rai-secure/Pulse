import { useState } from 'react';

interface Props {
  text: string;
  side?: 'top' | 'bottom' | 'right' | 'left';
}

export function InfoTip({ text, side = 'top' }: Props) {
  const [open, setOpen] = useState(false);

  const pos =
    side === 'top'
      ? 'bottom-full mb-1.5 left-1/2 -translate-x-1/2'
      : side === 'bottom'
        ? 'top-full mt-1.5 left-1/2 -translate-x-1/2'
        : side === 'left'
          ? 'right-full mr-1.5 top-1/2 -translate-y-1/2'
          : 'left-full ml-1.5 top-1/2 -translate-y-1/2';

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        aria-label="More info"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={(e) => {
          e.preventDefault();
          setOpen((v) => !v);
        }}
        className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full text-[9px] font-semibold bg-surface-100 text-ink-500 hover:bg-brand-50 hover:text-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-200"
      >
        i
      </button>
      {open && (
        <span
          role="tooltip"
          className={`absolute ${pos} z-50 w-64 text-2xs leading-snug bg-ink-900 text-white rounded-md px-2.5 py-2 shadow-panel`}
        >
          {text}
        </span>
      )}
    </span>
  );
}
