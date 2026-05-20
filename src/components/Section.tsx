import { InfoTip } from './InfoTip';

interface Props {
  id: string;
  title: string;
  subtitle?: string;
  tip?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}

export function Section({ id, title, subtitle, tip, right, children }: Props) {
  return (
    <section id={id} className="scroll-mt-20 space-y-3">
      <header className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-[18px] font-semibold tracking-tight">{title}</h2>
            {tip && <InfoTip text={tip} side="right" />}
          </div>
          {subtitle && (
            <p className="text-2xs text-ink-500 mt-0.5">{subtitle}</p>
          )}
        </div>
        {right}
      </header>
      {children}
    </section>
  );
}
