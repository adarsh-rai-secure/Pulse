import { useEffect, useLayoutEffect, useRef, useState } from 'react';

export interface TourState {
  thresholdUA: number;
  thresholdCR: number;
  dataPreviewOpened: boolean;
  selectedId: string | null;
  hasDraftForSelected: boolean;
  hasReplyForSelected: boolean;
  hasHandoffForSelected: boolean;
  teamSectionOpen: boolean;
}

export interface TourStep {
  target: string; // CSS selector. 'body' = centered, full overlay
  title: string;
  body: string;
  task?: string; // call-to-action shown in the green task strip
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  isComplete?: (state: TourState) => boolean; // returns true when the user has done the step
}

interface Props {
  steps: TourStep[];
  open: boolean;
  state: TourState;
  onClose: () => void;
  onStepChange?: (nextStep: number, prevStep: number) => void;
  initialStep?: number;
}

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const PADDING = 8;
const AUTO_ADVANCE_DELAY_MS = 700;
const MASK_FILL = 'rgba(11, 11, 20, 0.32)';

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

export function Tour({
  steps,
  open,
  state,
  onClose,
  onStepChange,
  initialStep = 0,
}: Props) {
  const [stepIdx, setStepIdx] = useState(initialStep);
  const [rect, setRect] = useState<Rect | null>(null);
  const [completed, setCompleted] = useState(false);
  const [drag, setDrag] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ x: number; y: number; ox: number; oy: number } | null>(
    null
  );
  const completedAtRef = useRef<number>(0);
  const step = steps[stepIdx];

  useEffect(() => {
    if (open) {
      setStepIdx(initialStep);
      setCompleted(false);
      setDrag({ x: 0, y: 0 });
    }
  }, [open, initialStep]);

  // Track rect updates + scroll target into view
  useLayoutEffect(() => {
    if (!open || !step) return;
    let raf = 0;
    const tick = () => {
      const next = getRect(step.target);
      setRect(next);
      raf = requestAnimationFrame(tick);
    };
    if (step.target !== 'body') {
      const el = document.querySelector(step.target);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [open, stepIdx, step]);

  // Reset completion flag + drag offset whenever step changes
  useEffect(() => {
    setCompleted(false);
    setDrag({ x: 0, y: 0 });
  }, [stepIdx]);

  // Watch for completion of interactive steps
  useEffect(() => {
    if (!open || !step?.isComplete) return;
    if (completed) return;
    if (step.isComplete(state)) {
      setCompleted(true);
      completedAtRef.current = Date.now();
      const t = window.setTimeout(() => {
        if (open) goNext();
      }, AUTO_ADVANCE_DELAY_MS);
      return () => window.clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, step, open, completed]);

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
    const prev = stepIdx;
    const next = stepIdx + 1;
    setStepIdx(next);
    onStepChange?.(next, prev);
  }
  function goPrev() {
    if (stepIdx === 0) return;
    const prev = stepIdx;
    const next = stepIdx - 1;
    setStepIdx(next);
    onStepChange?.(next, prev);
  }

  function onDragStart(e: React.PointerEvent) {
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = {
      x: e.clientX,
      y: e.clientY,
      ox: drag.x,
      oy: drag.y,
    };
    setIsDragging(true);
  }
  function onDragMove(e: React.PointerEvent) {
    if (!dragRef.current) return;
    setDrag({
      x: dragRef.current.ox + (e.clientX - dragRef.current.x),
      y: dragRef.current.oy + (e.clientY - dragRef.current.y),
    });
  }
  function onDragEnd(e: React.PointerEvent) {
    if (!dragRef.current) return;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    dragRef.current = null;
    setIsDragging(false);
  }

  if (!open || !step) return null;

  const placement = step.placement ?? 'bottom';
  const base = computeTooltipStyle(rect, placement);
  const tooltipStyle: React.CSSProperties = applyDrag(base, drag);
  const isInteractive = !!step.isComplete;

  return (
    <div className="fixed inset-0 z-[60] pointer-events-none">
      {rect && step.target !== 'body' && (
        <svg
          className="absolute inset-0 w-full h-full"
          style={{ pointerEvents: 'none' }}
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
            width="100%"
            height="100%"
            fill={MASK_FILL}
            mask="url(#pulse-tour-mask)"
          />
          <rect
            x={rect.left}
            y={rect.top}
            width={rect.width}
            height={rect.height}
            rx={10}
            fill="none"
            stroke={completed ? '#639922' : '#7F77DD'}
            strokeWidth={2.5}
          />
        </svg>
      )}

      {step.target === 'body' && (
        <div
          className="absolute inset-0 pointer-events-auto"
          style={{ background: MASK_FILL }}
          onClick={goNext}
        />
      )}

      <div
        className={
          'absolute pointer-events-auto bg-surface-0 border border-surface-200 rounded-xl shadow-panel p-4 w-[360px] max-w-[calc(100vw-32px)] select-none ' +
          (isDragging ? 'cursor-grabbing' : '')
        }
        style={tooltipStyle}
      >
        <div
          className="flex items-center justify-between mb-1.5"
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
          onPointerDown={onDragStart}
          onPointerMove={onDragMove}
          onPointerUp={onDragEnd}
          onPointerCancel={onDragEnd}
          title="Drag to move this tooltip out of the way"
        >
          <div className="flex items-center gap-1.5">
            <DragHandle />
            <span className="label-eyebrow text-brand-700">
              Step {stepIdx + 1} of {steps.length}
            </span>
          </div>
          <button
            className="text-2xs text-ink-500 hover:text-ink-900 underline"
            onClick={onClose}
            onPointerDown={(e) => e.stopPropagation()}
          >
            Skip tour
          </button>
        </div>
        <h3 className="text-13 font-semibold mb-1">{step.title}</h3>
        <p className="text-13 text-ink-700 leading-snug">{step.body}</p>

        {step.task && (
          <div
            className={
              'mt-3 rounded-md px-2.5 py-2 text-13 leading-snug flex items-start gap-2 ' +
              (completed
                ? 'bg-signal-refBg text-signal-refFg'
                : 'bg-brand-50 text-brand-900 border border-brand-200')
            }
          >
            <span className="font-bold mt-0.5">
              {completed ? '✓' : '→'}
            </span>
            <span>
              {completed ? (
                <strong>Done!</strong>
              ) : (
                <>
                  <strong>Try it:</strong> {step.task}
                </>
              )}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between mt-3 gap-2">
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
          {isInteractive && !completed ? (
            <button
              className="btn-outline"
              onClick={goNext}
              title="Skip this step without doing it"
            >
              Skip step →
            </button>
          ) : (
            <button className="btn-primary" onClick={goNext}>
              {stepIdx === steps.length - 1 ? 'Finish' : 'Next →'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function DragHandle() {
  return (
    <svg
      viewBox="0 0 16 16"
      className="w-3.5 h-3.5 text-ink-400"
      aria-hidden
    >
      <g fill="currentColor">
        <circle cx="5" cy="3.5" r="1.2" />
        <circle cx="11" cy="3.5" r="1.2" />
        <circle cx="5" cy="8" r="1.2" />
        <circle cx="11" cy="8" r="1.2" />
        <circle cx="5" cy="12.5" r="1.2" />
        <circle cx="11" cy="12.5" r="1.2" />
      </g>
    </svg>
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

  const tipW = 360;
  const tipH = 220;
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

function applyDrag(
  base: React.CSSProperties,
  drag: { x: number; y: number }
): React.CSSProperties {
  if (drag.x === 0 && drag.y === 0) return base;
  // Centered placement uses transform: translate(-50%, -50%); add the drag delta to it
  if (base.transform) {
    return {
      ...base,
      transform: `${base.transform} translate(${drag.x}px, ${drag.y}px)`,
    };
  }
  const top = typeof base.top === 'number' ? base.top + drag.y : base.top;
  const left = typeof base.left === 'number' ? base.left + drag.x : base.left;
  return { ...base, top, left };
}
