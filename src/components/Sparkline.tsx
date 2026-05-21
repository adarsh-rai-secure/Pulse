interface Props {
  values: number[];
  max: number;
  color?: string;
  width?: number;
  height?: number;
  delta?: number;
}

export function Sparkline({
  values,
  max,
  color = '#534AB7',
  width = 90,
  height = 26,
  delta,
}: Props) {
  if (values.length === 0) return null;
  const stepX = width / (values.length - 1);
  const points = values
    .map((v, i) => {
      const x = i * stepX;
      const y = height - (v / max) * height;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
  const lastX = (values.length - 1) * stepX;
  const lastY = height - (values[values.length - 1] / max) * height;

  const deltaSign = (delta ?? 0) >= 0 ? '+' : '';
  const deltaColor =
    delta === undefined
      ? '#8B8B9A'
      : delta > 1
        ? '#15803D'
        : delta < -1
          ? '#B91C1C'
          : '#8B8B9A';

  return (
    <div className="inline-flex items-center gap-1.5">
      <svg width={width} height={height} aria-hidden viewBox={`0 0 ${width} ${height}`}>
        <polyline
          fill="none"
          stroke={color}
          strokeWidth={1.5}
          strokeLinejoin="round"
          strokeLinecap="round"
          points={points}
        />
        <circle cx={lastX} cy={lastY} r={1.8} fill={color} />
      </svg>
      {delta !== undefined && (
        <span
          className="text-2xs font-mono tabular-nums"
          style={{ color: deltaColor }}
          title={`${deltaSign}${delta} vs 8 weeks ago`}
        >
          {deltaSign}
          {delta}
        </span>
      )}
    </div>
  );
}
