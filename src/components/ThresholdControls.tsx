import type { Thresholds } from '../types';
import { InfoTip } from './InfoTip';

interface Props {
  thresholds: Thresholds;
  onChange: (t: Thresholds) => void;
}

export function ThresholdControls({ thresholds, onChange }: Props) {
  return (
    <div className="panel p-4 flex flex-col gap-4">
      <div>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1.5">
            <span className="label-eyebrow">User adoption threshold</span>
            <InfoTip
              text="Pulse calls an account 'high adoption' if user adoption is at or above this value. Drag to see what happens when you raise the bar."
              side="right"
            />
          </div>
          <span className="text-13 font-semibold tabular-nums">
            {thresholds.ua}%
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={thresholds.ua}
          onChange={(e) =>
            onChange({ ...thresholds, ua: Number(e.target.value) })
          }
        />
        <div className="flex justify-between text-2xs text-ink-400 mt-0.5">
          <span>0%</span>
          <span>100%</span>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1.5">
            <span className="label-eyebrow">Conversion rate threshold</span>
            <InfoTip
              text="Above this conversion rate, an account counts as 'high conversion'. Together with the adoption threshold, this defines all four quadrants."
              side="right"
            />
          </div>
          <span className="text-13 font-semibold tabular-nums">
            {thresholds.cr}%
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={50}
          value={thresholds.cr}
          onChange={(e) =>
            onChange({ ...thresholds, cr: Number(e.target.value) })
          }
        />
        <div className="flex justify-between text-2xs text-ink-400 mt-0.5">
          <span>0%</span>
          <span>50%</span>
        </div>
      </div>

      <div className="text-2xs text-ink-500 leading-snug">
        Defaults are <span className="font-medium text-ink-700">UA 30 / CR 20</span>.
        Adjust to match your own definitions of 'using it' and 'converting'.
      </div>
    </div>
  );
}
