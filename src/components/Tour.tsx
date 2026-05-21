import { useEffect, useLayoutEffect, useState } from 'react';

export interface TourStep {
  target: string; // CSS selector
  title: string;
  body: string;
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  beforeShow?: () => void;
  scroll?: boolean;
}

interface Props {
  steps: TourStep[];
  open: boolean;
  onClose: () => void;
  initialStep?: number;
}

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const PADDING = 8;

function getRect(selector: string): Rect | null {
  if (selector === 'body') {
    return {
      top: 0,
      left: 0,
      width: window.innerWidth,
      height: window.innerHeight,
    };
  }
  const el = document.querySelector(selector);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return {
    top: r.top - PADDING,
    left: r.left - PADDING,
    width: r.width + PADDING * 2,
    height: r.height + PADDING * 2,
  };
}

export function Tour({ steps, open, onClose, initialStep = 0 }: Props) {
  const [stepIdx, setStepIdx] = useState(initialStep);
  const [rect, setRect] = useState<Rect | null>(null);
  const step = steps[stepIdx];

  useEffect(() => {
    if (open) setStepIdx(initialStep);
  }, [open, initialStep]);

  useLayoutEffect(() => {
    if (!open || !step) return;
    step.beforeShow?.();

    let raf = 0;
    const tick = () => {
      const next = getRect(step.target);
      setRect(next);
      raf = requestAnimationFrame(tick);
    };

    if (step.scroll !== false && step.target !== 'body') {
      const el = document.querySelector(step.target);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [open, stepIdx, step]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, stepIdx]);

  function goNext() {
    if (stepIdx >= steps.length - 1) {
      onClose();
      return;
    }
    setStepIdx((s) => s + 1);
  }
  function goPrev() {
    if (stepIdx === 0) return;
    setStepIdx((s) => s - 1);
  }

  if (!open || !step) return null;

  const placement = step.placement ?? 'bottom';
  const tooltipStyle = computeTooltipStyle(rect, placement);

  return (
    <div className="fixed inset-0 z-[60] pointer-events-none">
      {rect && step.target !== 'body' && (
        <svg
          className="absolute inset-0 w-full h-full pointer-events-auto"
          onClick={(e) => {
            // Click on the dim overlay = advance
            const target = e.target as SVGElement;
            if (target.tagName === 'rect' && target.getAttribute('data-overlay')) {
              goNext();
            }
          }}
        >
          <defs>
            <mask id="pulse-tour-mask">
              <rect width="100%" height="100%" fill="white" />
              <rect
                x={rect.left}
                y={rect.top}
                width={rect.width}
                height={rect.height}
                rx={10}
                fill="black"
              />
            </mask>
          </defs>
          <rect
            data-overlay="1"
            width="100%"
            height="100%"
            fill="rgba(11, 11, 20, 0.55)"
            mask="url(#pulse-tour-mask)"
          />
          <rect
            x={rect.left}
            y={rect.top}
            width={rect.width}
            height={rect.height}
            rx={10}
            fill="none"
            stroke="#7F77DD"
            strokeWidth={2}
          />
        </svg>
      )}

      {step.target === 'body' && (
        <div className="absolute inset-0 bg-ink-900/55 pointer-events-auto" onClick={goNext} />
      )}

      <div
        className="absolute pointer-events-auto bg-surface-0 border border-surface-200 rounded-xl shadow-panel p-4 w-[340px] max-w-[calc(100vw-32px)]"
        style={tooltipStyle}
      >
        <div className="flex items-center justify-between mb-1.5">
          <span className="label-eyebrow text-brand-700">
            Step {stepIdx + 1} of {steps.length}
          </span>
          <button
            className="text-2xs text-ink-500 hover:text-ink-900 underline"
            onClick={onClose}
          >
            Skip tour
          </button>
        </div>
        <h3 className="text-13 font-semibold mb-1">{step.title}</h3>
        <p className="text-13 text-ink-700 leading-snug">{step.body}</p>
        <div className="flex items-center justify-between mt-3">
          <button
            className="btn-ghost"
            onClick={goPrev}
            disabled={stepIdx === 0}
          >
            ← Back
          </button>
          <div className="flex items-center gap-1">
            {steps.map((_, i) => (
              <span
                key={i}
                className={
                  'w-1.5 h-1.5 rounded-full ' +
                  (i === stepIdx ? 'bg-brand-700' : 'bg-surface-200')
                }
              />
            ))}
          </div>
          <button className="btn-primary" onClick={goNext}>
            {stepIdx === steps.length - 1 ? 'Finish' : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  );
}

function computeTooltipStyle(
  rect: Rect | null,
  placement: 'top' | 'bottom' | 'left' | 'right' | 'center'
): React.CSSProperties {
  if (!rect || placement === 'center') {
    return {
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
    };
  }

  const tipW = 340;
  const tipH = 160;
  let top = rect.top + rect.height + 12;
  let left = rect.left + rect.width / 2 - tipW / 2;

  if (placement === 'top') {
    top = rect.top - tipH - 12;
    left = rect.left + rect.width / 2 - tipW / 2;
  } else if (placement === 'left') {
    top = rect.top + rect.height / 2 - tipH / 2;
    left = rect.left - tipW - 12;
  } else if (placement === 'right') {
    top = rect.top + rect.height / 2 - tipH / 2;
    left = rect.left + rect.width + 12;
  }

  // Clamp to viewport
  const margin = 8;
  if (left < margin) left = margin;
  if (left + tipW > window.innerWidth - margin) {
    left = window.innerWidth - tipW - margin;
  }
  if (top < margin) top = margin;
  if (top + tipH > window.innerHeight - margin) {
    top = window.innerHeight - tipH - margin;
  }

  return { top, left };
}
