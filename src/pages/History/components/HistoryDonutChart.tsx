type HistoryDonutChartItem = {
  label: string;
  value: number;
  displayValue: string;
  color: string;
};

type HistoryDonutChartProps = {
  items: HistoryDonutChartItem[];
  emptyLabel: string;
  totalLabel: string;
  centerValue: string;
};

const SVG_SIZE = 196;
const STROKE_WIDTH = 28;
const RADIUS = (SVG_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function formatSharePercentage(value: number, total: number) {
  const share = (value / total) * 100;
  return share % 1 === 0 ? `${Math.round(share)}%` : `${share.toFixed(1).replace(".", ",")}%`;
}

export function HistoryDonutChart({
  items,
  emptyLabel,
  totalLabel,
  centerValue,
}: HistoryDonutChartProps) {
  const total = items.reduce((sum, item) => sum + item.value, 0);

  if (total === 0) {
    return (
      <div className="flex h-full min-h-[320px] flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border bg-muted/20 px-4 text-center">
        <div className="relative flex size-40 items-center justify-center">
          <svg
            viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
            className="size-40"
            aria-hidden
          >
            <circle
              cx={SVG_SIZE / 2}
              cy={SVG_SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke="rgba(148, 163, 184, 0.18)"
              strokeWidth={STROKE_WIDTH}
            />
          </svg>
        </div>
        <p className="max-w-xs text-sm text-muted-foreground">{emptyLabel}</p>
      </div>
    );
  }

  let offset = 0;

  return (
    <div className="flex min-w-0 flex-col gap-5 lg:flex-row lg:items-center">
      <div className="relative mx-auto flex size-48 shrink-0 items-center justify-center">
        <svg
          viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
          className="size-44 sm:size-48"
          role="img"
          aria-label={totalLabel}
        >
          <circle
            cx={SVG_SIZE / 2}
            cy={SVG_SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="rgba(148, 163, 184, 0.16)"
            strokeWidth={STROKE_WIDTH}
          />
          {items.map((item) => {
            const segmentLength = (item.value / total) * CIRCUMFERENCE;
            const dashArray = `${segmentLength} ${CIRCUMFERENCE - segmentLength}`;
            const currentOffset = offset;
            offset += segmentLength;

            return (
              <circle
                key={item.label}
                cx={SVG_SIZE / 2}
                cy={SVG_SIZE / 2}
                r={RADIUS}
                fill="none"
                stroke={item.color}
                strokeWidth={STROKE_WIDTH}
                strokeDasharray={dashArray}
                strokeDashoffset={-currentOffset}
                strokeLinecap="butt"
                transform={`rotate(-90 ${SVG_SIZE / 2} ${SVG_SIZE / 2})`}
              />
            );
          })}
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
          <span className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            {totalLabel}
          </span>
          <span className="text-lg font-semibold leading-tight tracking-tight text-foreground sm:text-xl">
            {centerValue}
          </span>
        </div>
      </div>

      <div className="grid min-w-0 flex-1 content-center gap-2.5">
        {items.map((item) => {
          const percentage = Math.round((item.value / total) * 100);
          const shareLabel = formatSharePercentage(item.value, total);

          return (
            <div
              key={item.label}
              className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] grid-rows-[auto_auto] items-center gap-x-3 gap-y-1.5 rounded-2xl border border-border/70 bg-muted/10 px-4 py-3"
            >
              <span
                className="row-span-2 size-2.5 shrink-0 self-center rounded-full"
                style={{ backgroundColor: item.color }}
                aria-hidden
              />
              <span className="min-w-0 truncate text-sm font-medium leading-snug text-foreground">
                {item.label}
              </span>
              <span className="shrink-0 text-sm font-semibold leading-snug tabular-nums text-foreground">
                {item.displayValue}
              </span>
              <div
                className="h-1 overflow-hidden rounded-full bg-border/60"
                role="presentation"
                aria-hidden
              >
                <div
                  className="h-full rounded-full"
                  style={{ width: `${percentage}%`, backgroundColor: item.color }}
                />
              </div>
              <span className="text-right text-xs tabular-nums text-muted-foreground">
                {shareLabel}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
