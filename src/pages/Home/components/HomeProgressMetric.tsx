type HomeProgressMetricProps = {
  label: string;
  value: number;
  helper?: string;
};

function clampPercentage(value: number) {
  if (Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(100, value));
}

export function HomeProgressMetric({
  label,
  value,
  helper,
}: HomeProgressMetricProps) {
  const percentage = clampPercentage(value);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">{label}</p>
          {helper ? <p className="text-xs text-muted-foreground">{helper}</p> : null}
        </div>
        <span className="shrink-0 text-sm font-semibold tabular-nums text-foreground">
          {Math.round(percentage)}%
        </span>
      </div>

      <div className="h-2.5 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-brand-green-dark transition-[width]"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
