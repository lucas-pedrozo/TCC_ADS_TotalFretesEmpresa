import { useState } from "react";

type HomeLineChartProps = {
  labels: string[];
  published: number[];
  completed: number[];
};

type Point = {
  x: number;
  y: number;
};

const SVG_WIDTH = 720;
const SVG_HEIGHT = 280;
const PADDING_TOP = 12;
const PADDING_RIGHT = 16;
const PADDING_BOTTOM = 28;
const PADDING_LEFT = 44;
const TOOLTIP_WIDTH = 128;
const TOOLTIP_HEIGHT = 92;

function buildTicks(maxValue: number) {
  if (maxValue <= 4) return [0, 1, 2, 3, 4];
  if (maxValue <= 8) return [0, 2, 4, 6, 8];
  if (maxValue <= 20) return [0, 5, 10, 15, 20];

  const step = Math.max(10, Math.ceil(maxValue / 4 / 10) * 10);
  return Array.from({ length: 5 }, (_, index) => index * step);
}

function buildPoints(values: number[], yAxisMax: number): Point[] {
  const chartWidth = SVG_WIDTH - PADDING_LEFT - PADDING_RIGHT;
  const chartHeight = SVG_HEIGHT - PADDING_TOP - PADDING_BOTTOM;
  const lastIndex = Math.max(values.length - 1, 1);

  return values.map((value, index) => ({
    x: PADDING_LEFT + (chartWidth * index) / lastIndex,
    y:
      PADDING_TOP +
      chartHeight -
      (Math.max(0, value) / Math.max(1, yAxisMax)) * chartHeight,
  }));
}

function buildSmoothPath(points: Point[]) {
  if (points.length === 0) return "";
  if (points.length === 1) {
    return `M ${points[0].x},${points[0].y}`;
  }

  let path = `M ${points[0].x},${points[0].y}`;

  for (let index = 0; index < points.length - 1; index += 1) {
    const current = points[index];
    const next = points[index + 1];
    const controlX = (current.x + next.x) / 2;

    path += ` C ${controlX},${current.y} ${controlX},${next.y} ${next.x},${next.y}`;
  }

  return path;
}

function buildAreaPath(points: Point[]) {
  if (points.length === 0) return "";

  const first = points[0];
  const last = points[points.length - 1];
  const linePath = buildSmoothPath(points);
  const baselineY = SVG_HEIGHT - PADDING_BOTTOM;

  return `${linePath} L ${last.x},${baselineY} L ${first.x},${baselineY} Z`;
}

export function HomeLineChart({ labels, published, completed }: HomeLineChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const yAxisTicks = buildTicks(Math.max(0, ...published, ...completed));
  const yAxisMax = yAxisTicks[yAxisTicks.length - 1] ?? 4;
  const normalizedPublished = labels.map((_, index) => published[index] ?? 0);
  const normalizedCompleted = labels.map((_, index) => completed[index] ?? 0);
  const publishedPoints = buildPoints(normalizedPublished, yAxisMax);
  const completedPoints = buildPoints(normalizedCompleted, yAxisMax);
  const chartBottomY = SVG_HEIGHT - PADDING_BOTTOM;
  const activePublishedPoint =
    hoveredIndex != null ? publishedPoints[hoveredIndex] : null;
  const activeCompletedPoint =
    hoveredIndex != null ? completedPoints[hoveredIndex] : null;
  const activeX = activePublishedPoint?.x ?? activeCompletedPoint?.x ?? null;

  const tooltipX = (() => {
    if (activeX == null) return null;
    const preferredX = activeX + 14;
    return Math.min(
      Math.max(PADDING_LEFT + 6, preferredX),
      SVG_WIDTH - PADDING_RIGHT - TOOLTIP_WIDTH
    );
  })();

  const tooltipY = (() => {
    if (!activePublishedPoint || !activeCompletedPoint) return null;
    const anchorY = Math.min(activePublishedPoint.y, activeCompletedPoint.y);
    return Math.min(
      Math.max(PADDING_TOP + 8, anchorY - TOOLTIP_HEIGHT / 2),
      chartBottomY - TOOLTIP_HEIGHT - 8
    );
  })();

  return (
    <div className="min-w-0">
      <div className="min-w-0 overflow-hidden rounded-2xl border border-border/60 bg-muted/10 px-2 py-3 sm:px-3">
        <svg
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          className="block h-[280px] w-full"
          role="img"
          aria-label="Grafico de evolucao dos fretes"
        >
          <defs>
            <linearGradient id="home-published-gradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#115339" stopOpacity="0.20" />
              <stop offset="100%" stopColor="#115339" stopOpacity="0.02" />
            </linearGradient>
            <linearGradient id="home-completed-gradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#66dd66" stopOpacity="0.24" />
              <stop offset="100%" stopColor="#66dd66" stopOpacity="0.03" />
            </linearGradient>
          </defs>

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

          <path d={buildAreaPath(publishedPoints)} fill="url(#home-published-gradient)" />
          <path d={buildAreaPath(completedPoints)} fill="url(#home-completed-gradient)" />

          <path
            d={buildSmoothPath(publishedPoints)}
            fill="none"
            stroke="#115339"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d={buildSmoothPath(completedPoints)}
            fill="none"
            stroke="#66dd66"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {publishedPoints.map((point, index) => (
            <circle
              key={`published-${index}`}
              cx={point.x}
              cy={point.y}
              r={hoveredIndex === index ? "5" : "3.5"}
              fill="#115339"
              stroke="#ffffff"
              strokeWidth="2"
            />
          ))}

          {completedPoints.map((point, index) => (
            <circle
              key={`completed-${index}`}
              cx={point.x}
              cy={point.y}
              r={hoveredIndex === index ? "5" : "3.5"}
              fill="#66dd66"
              stroke="#ffffff"
              strokeWidth="2"
            />
          ))}

          {activeX != null ? (
            <line
              x1={activeX}
              x2={activeX}
              y1={PADDING_TOP}
              y2={chartBottomY}
              stroke="rgba(15, 23, 42, 0.16)"
            />
          ) : null}

          {tooltipX != null &&
          tooltipY != null &&
          hoveredIndex != null &&
          activePublishedPoint &&
          activeCompletedPoint ? (
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
                {`Publicados : ${normalizedPublished[hoveredIndex] ?? 0}`}
              </text>
              <text
                x={tooltipX + 14}
                y={tooltipY + 76}
                fontSize="14"
                fill="#66dd66"
              >
                {`Concluídos : ${normalizedCompleted[hoveredIndex] ?? 0}`}
              </text>
            </g>
          ) : null}

          {labels.map((label, index) => {
            const point = publishedPoints[index];
            if (!point) return null;

            return (
              <text
                key={label}
                x={point.x}
                y={SVG_HEIGHT - 8}
                textAnchor="middle"
                fontSize="12"
                fill="#64748b"
              >
                {label}
              </text>
            );
          })}

          {publishedPoints.map((point, index) => {
            const previousPoint = publishedPoints[index - 1];
            const nextPoint = publishedPoints[index + 1];
            const regionStartX =
              index === 0
                ? PADDING_LEFT
                : (previousPoint.x + point.x) / 2;
            const regionEndX =
              index === publishedPoints.length - 1
                ? SVG_WIDTH - PADDING_RIGHT
                : (point.x + nextPoint.x) / 2;

            return (
              <rect
                key={`hover-region-${labels[index] ?? index}`}
                x={regionStartX}
                y={PADDING_TOP}
                width={Math.max(1, regionEndX - regionStartX)}
                height={chartBottomY - PADDING_TOP}
                fill="transparent"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseMove={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex((current) => (current === index ? null : current))}
              />
            );
          })}
        </svg>
      </div>
    </div>
  );
}
