"use client";

import { useId, useState } from "react";

type DailyPoint = { date: string; visits: number; clicks: number };

type TrendChartProps = {
  data: DailyPoint[];
};

const WIDTH = 600;
const HEIGHT = 180;
const PADDING_X = 8;
const PADDING_Y = 12;

function formatDay(dateStr: string) {
  const [, month, day] = dateStr.split("-");
  return `${day}/${month}`;
}

function buildPath(values: number[], max: number, width: number, height: number) {
  if (values.length === 0) return { line: "", area: "" };
  const stepX = values.length > 1 ? width / (values.length - 1) : 0;
  const points = values.map((v, i) => {
    const x = i * stepX;
    const y = height - (v / max) * height;
    return [x, y] as const;
  });

  const line = points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y}`).join(" ");
  const area = `${line} L${points[points.length - 1][0]},${height} L0,${height} Z`;

  return { line, area, points };
}

export function TrendChart({ data }: TrendChartProps) {
  const gradientId = useId();
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const max = Math.max(1, ...data.map((d) => Math.max(d.visits, d.clicks)));
  const innerWidth = WIDTH - PADDING_X * 2;
  const innerHeight = HEIGHT - PADDING_Y * 2;

  const visits = buildPath(
    data.map((d) => d.visits),
    max,
    innerWidth,
    innerHeight
  );
  const clicks = buildPath(
    data.map((d) => d.clicks),
    max,
    innerWidth,
    innerHeight
  );

  const stepX = data.length > 1 ? innerWidth / (data.length - 1) : 0;
  const hovered = hoverIndex != null ? data[hoverIndex] : null;
  const labelEvery = data.length > 14 ? Math.ceil(data.length / 7) : 1;

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full h-44"
        preserveAspectRatio="none"
        role="img"
        aria-label="Gráfico de visitas e cliques por dia"
      >
        <defs>
          <linearGradient id={`${gradientId}-mint`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-mint-500)" stopOpacity={0.25} />
            <stop offset="100%" stopColor="var(--color-mint-500)" stopOpacity={0} />
          </linearGradient>
          <linearGradient id={`${gradientId}-peach`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-peach-500)" stopOpacity={0.25} />
            <stop offset="100%" stopColor="var(--color-peach-500)" stopOpacity={0} />
          </linearGradient>
        </defs>

        <g transform={`translate(${PADDING_X}, ${PADDING_Y})`}>
          {visits.area && (
            <path d={visits.area} fill={`url(#${gradientId}-mint)`} stroke="none" />
          )}
          {clicks.area && (
            <path d={clicks.area} fill={`url(#${gradientId}-peach)`} stroke="none" />
          )}

          {visits.line && (
            <path
              d={visits.line}
              fill="none"
              stroke="var(--color-mint-500)"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
          {clicks.line && (
            <path
              d={clicks.line}
              fill="none"
              stroke="var(--color-peach-500)"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {hoverIndex != null && (
            <line
              x1={hoverIndex * stepX}
              x2={hoverIndex * stepX}
              y1={0}
              y2={innerHeight}
              stroke="#d1d5db"
              strokeWidth={1}
              strokeDasharray="3,3"
            />
          )}

          {data.map((_, i) => (
            <rect
              key={i}
              x={i * stepX - stepX / 2}
              y={0}
              width={stepX || innerWidth}
              height={innerHeight}
              fill="transparent"
              onMouseEnter={() => setHoverIndex(i)}
              onMouseLeave={() => setHoverIndex(null)}
            />
          ))}
        </g>
      </svg>

      {hovered && (
        <div className="absolute top-0 right-0 bg-gray-800 text-white text-xs rounded-lg px-3 py-2 shadow-lg pointer-events-none">
          <p className="font-medium mb-1">{formatDay(hovered.date)}</p>
          <p className="text-mint-300">Visitas: {hovered.visits}</p>
          <p className="text-peach-300">Cliques: {hovered.clicks}</p>
        </div>
      )}

      <div className="flex justify-between mt-2 text-[10px] text-gray-400 px-1">
        {data.map((d, i) =>
          i % labelEvery === 0 ? <span key={d.date}>{formatDay(d.date)}</span> : <span key={d.date} />
        )}
      </div>
    </div>
  );
}
