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
            <span className="label-eyebrow">"High usage" starts at</span>
            <InfoTip
              text="Pulse marks an account as 'high usage' (user adoption) if the team uses the platform this often or more. Drag the slider to raise or lower the bar and watch the dots regroup."
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
            <span className="label-eyebrow">"Strong close rate" starts at</span>
            <InfoTip
              text="Above this conversion rate, an account counts as 'closing leads well'. The two sliders together define all four health groups."
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
        Defaults are{' '}
        <span className="font-medium text-ink-700">usage 30% / close 20%</span>.
        Adjust to match your own bar for "using it" and "converting".
      </div>
    </div>
  );
}
