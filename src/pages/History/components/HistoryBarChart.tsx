import { BarChart3 } from "lucide-react";
import { useState } from "react";

type HistoryBarChartProps = {
  labels: string[];
  completed: number[];
  cancelled: number[];
  completedLabel: string;
  cancelledLabel: string;
  emptyLabel: string;
};

type PointGeometry = {
  x: number;
  groupX: number;
  groupWidth: number;
  completedY: number;
  cancelledY: number;
  completedHeight: number;
  cancelledHeight: number;
};

const SVG_WIDTH = 760;
const SVG_HEIGHT = 280;
const PADDING_TOP = 16;
const PADDING_RIGHT = 16;
const PADDING_BOTTOM = 34;
const PADDING_LEFT = 42;
const BAR_WIDTH = 18;
const BAR_GAP = 8;
const TOOLTIP_WIDTH = 148;
const TOOLTIP_HEIGHT = 92;

function buildTicks(maxValue: number) {
  if (maxValue <= 4) return [0, 1, 2, 3, 4];
  if (maxValue <= 8) return [0, 2, 4, 6, 8];
  if (maxValue <= 20) return [0, 5, 10, 15, 20];

  const step = Math.max(10, Math.ceil(maxValue / 4 / 10) * 10);
  return Array.from({ length: 5 }, (_, index) => index * step);
}

function buildGeometry(
  labels: string[],
  completed: number[],
  cancelled: number[],
  yAxisMax: number
): PointGeometry[] {
  const chartWidth = SVG_WIDTH - PADDING_LEFT - PADDING_RIGHT;
  const chartHeight = SVG_HEIGHT - PADDING_TOP - PADDING_BOTTOM;
  const groupWidth = chartWidth / Math.max(labels.length, 1);

  return labels.map((_, index) => {
    const groupX = PADDING_LEFT + groupWidth * index;
    const centerX = groupX + groupWidth / 2;
    const completedValue = Math.max(0, completed[index] ?? 0);
    const cancelledValue = Math.max(0, cancelled[index] ?? 0);
    const completedHeight = (completedValue / Math.max(1, yAxisMax)) * chartHeight;
    const cancelledHeight = (cancelledValue / Math.max(1, yAxisMax)) * chartHeight;

    return {
      x: centerX,
      groupX,
      groupWidth,
      completedY: SVG_HEIGHT - PADDING_BOTTOM - completedHeight,
      cancelledY: SVG_HEIGHT - PADDING_BOTTOM - cancelledHeight,
      completedHeight,
      cancelledHeight,
    };
  });
}

export function HistoryBarChart({
  labels,
  completed,
  cancelled,
  completedLabel,
  cancelledLabel,
  emptyLabel,
}: HistoryBarChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const yAxisTicks = buildTicks(Math.max(0, ...completed, ...cancelled));
  const yAxisMax = yAxisTicks[yAxisTicks.length - 1] ?? 4;
  const geometry = buildGeometry(labels, completed, cancelled, yAxisMax);
  const hasValues = completed.some((value) => value > 0) || cancelled.some((value) => value > 0);
  const chartBottomY = SVG_HEIGHT - PADDING_BOTTOM;
  const activeBar = hoveredIndex != null ? geometry[hoveredIndex] : null;
  const activeCompletedValue = hoveredIndex != null ? (completed[hoveredIndex] ?? 0) : 0;
  const activeCancelledValue = hoveredIndex != null ? (cancelled[hoveredIndex] ?? 0) : 0;

  const tooltipX = (() => {
    if (!activeBar) return null;
    const preferredX = activeBar.x + 14;
    return Math.min(
      Math.max(PADDING_LEFT + 6, preferredX),
      SVG_WIDTH - PADDING_RIGHT - TOOLTIP_WIDTH
    );
  })();

  const tooltipY = (() => {
    if (!activeBar) return null;
    const anchorY = Math.min(activeBar.completedY, activeBar.cancelledY);
    return Math.min(
      Math.max(PADDING_TOP + 8, anchorY - TOOLTIP_HEIGHT / 2),
      chartBottomY - TOOLTIP_HEIGHT - 8
    );
  })();

  if (!hasValues) {
    return (
      <div className="flex h-[280px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-muted/20 px-4 text-center">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <BarChart3 className="size-5" />
        </div>
        <p className="max-w-sm text-sm text-muted-foreground">{emptyLabel}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-brand-green-dark" aria-hidden />
          <span>{completedLabel}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-red-400" aria-hidden />
          <span>{cancelledLabel}</span>
        </div>
      </div>

      <div className="min-w-0 overflow-x-auto overflow-y-hidden rounded-2xl border border-border/60 bg-muted/10 px-2 py-3 sm:px-3">
        <svg
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          className="block h-[280px] min-w-[620px] w-full"
          role="img"
          aria-label={`${completedLabel} e ${cancelledLabel}`}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          {yAxisTicks.map((tick) => {
            const ratio = tick / Math.max(1, yAxisMax);
            const y =
              PADDING_TOP +
              (SVG_HEIGHT - PADDING_TOP - PADDING_BOTTOM) * (1 - ratio);

            return (
              <g key={tick}>
                <line
                  x1={PADDING_LEFT}
                  x2={SVG_WIDTH - PADDING_RIGHT}
                  y1={y}
                  y2={y}
                  stroke="rgba(148, 163, 184, 0.35)"
                  strokeDasharray="3 4"
                />
                <text
                  x={PADDING_LEFT - 10}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="12"
                  fill="#64748b"
                >
                  {tick}
                </text>
              </g>
            );
          })}

          {geometry.map((bar, index) => {
            const groupCenter = bar.x;
            const completedX = groupCenter - BAR_GAP / 2 - BAR_WIDTH;
            const cancelledX = groupCenter + BAR_GAP / 2;

            return (
              <g key={labels[index]}>
                <rect
                  x={completedX}
                  y={bar.completedY}
                  width={BAR_WIDTH}
                  height={Math.max(bar.completedHeight, 0)}
                  rx="7"
                  fill="#115339"
                />
                <rect
                  x={cancelledX}
                  y={bar.cancelledY}
                  width={BAR_WIDTH}
                  height={Math.max(bar.cancelledHeight, 0)}
                  rx="7"
                  fill="#f87171"
                />
                <text
                  x={groupCenter}
                  y={SVG_HEIGHT - 10}
                  textAnchor="middle"
                  fontSize="12"
                  fill="#64748b"
                >
                  {labels[index]}
                </text>
              </g>
            );
          })}

          {activeBar ? (
            <line
              x1={activeBar.x}
              x2={activeBar.x}
              y1={PADDING_TOP}
              y2={chartBottomY}
              stroke="rgba(15, 23, 42, 0.16)"
            />
          ) : null}

          {tooltipX != null && tooltipY != null && hoveredIndex != null ? (
            <g pointerEvents="none">
              <rect
                x={tooltipX}
                y={tooltipY}
                rx="14"
                ry="14"
                width={TOOLTIP_WIDTH}
                height={TOOLTIP_HEIGHT}
                fill="#ffffff"
                stroke="rgba(148, 163, 184, 0.25)"
              />
              <text
                x={tooltipX + 14}
                y={tooltipY + 24}
                fontSize="14"
                fontWeight="500"
                fill="#0f172a"
              >
                {labels[hoveredIndex]}
              </text>
              <text
                x={tooltipX + 14}
                y={tooltipY + 52}
                fontSize="14"
                fill="#115339"
              >
                {`${completedLabel}: ${activeCompletedValue}`}
              </text>
              <text
                x={tooltipX + 14}
                y={tooltipY + 76}
                fontSize="14"
                fill="#f87171"
              >
                {`${cancelledLabel}: ${activeCancelledValue}`}
              </text>
            </g>
          ) : null}

          {geometry.map((bar, index) => (
            <rect
              key={`hover-region-${labels[index] ?? index}`}
              x={bar.groupX}
              y={PADDING_TOP}
              width={bar.groupWidth}
              height={chartBottomY - PADDING_TOP}
              fill="transparent"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseMove={() => setHoveredIndex(index)}
            />
          ))}
        </svg>
      </div>
    </div>
  );
}
