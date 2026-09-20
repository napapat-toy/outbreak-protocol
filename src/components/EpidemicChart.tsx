'use client';


interface EpidemicChartProps {
  history: { day: number; frac: number }[];
}

export function EpidemicChart({ history }: EpidemicChartProps) {
  if (!history || history.length === 0) return null;

  const width = 360;
  const height = 110;
  const padding = { top: 12, right: 12, bottom: 20, left: 35 };

  const maxDay = Math.max(10, history[history.length - 1].day);
  const maxFrac = Math.max(
    0.1,
    Math.min(1.0, Math.ceil(Math.max(...history.map((h) => h.frac), 0.05) * 10) / 10)
  );

  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  const points = history.map((item) => {
    const x = padding.left + (item.day / maxDay) * innerWidth;
    const y = padding.top + innerHeight - (item.frac / maxFrac) * innerHeight;
    return { x, y, ...item };
  });

  const pathD = points.reduce((acc, pt, i) => {
    return i === 0 ? `M ${pt.x},${pt.y}` : `${acc} L ${pt.x},${pt.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x},${padding.top + innerHeight} L ${padding.left},${padding.top + innerHeight} Z`;

  const latestFrac = history[history.length - 1].frac;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 shadow-xl flex flex-col gap-2">
      <div className="flex items-center justify-between text-xs border-b border-slate-800/80 pb-1.5">
        <span className="font-semibold text-slate-300 flex items-center gap-1.5">
          <span>📈 กราฟการระบาด (Epidemic Curve)</span>
        </span>
        <span className="font-mono text-slate-400 text-[11px]">
          ปัจจุบัน: <span className="text-rose-400 font-bold">{(latestFrac * 100).toFixed(1)}%</span>
        </span>
      </div>

      <div className="w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible select-none"
        >
          <defs>
            <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line
            x1={padding.left}
            y1={padding.top}
            x2={width - padding.right}
            y2={padding.top}
            stroke="#334155"
            strokeDasharray="2,2"
            strokeWidth="0.8"
          />
          <line
            x1={padding.left}
            y1={padding.top + innerHeight / 2}
            x2={width - padding.right}
            y2={padding.top + innerHeight / 2}
            stroke="#334155"
            strokeDasharray="2,2"
            strokeWidth="0.8"
          />
          <line
            x1={padding.left}
            y1={padding.top + innerHeight}
            x2={width - padding.right}
            y2={padding.top + innerHeight}
            stroke="#475569"
            strokeWidth="1"
          />

          {/* Y Axis Labels */}
          <text
            x={padding.left - 6}
            y={padding.top + 4}
            textAnchor="end"
            fontSize="8.5"
            fill="#64748b"
            className="font-mono"
          >
            {(maxFrac * 100).toFixed(0)}%
          </text>
          <text
            x={padding.left - 6}
            y={padding.top + innerHeight / 2 + 3}
            textAnchor="end"
            fontSize="8.5"
            fill="#64748b"
            className="font-mono"
          >
            {((maxFrac * 100) / 2).toFixed(0)}%
          </text>
          <text
            x={padding.left - 6}
            y={padding.top + innerHeight + 3}
            textAnchor="end"
            fontSize="8.5"
            fill="#64748b"
            className="font-mono"
          >
            0%
          </text>

          {/* Area Fill */}
          <path d={areaD} fill="url(#curveGradient)" />

          {/* Stroke Path */}
          <path
            d={pathD}
            fill="none"
            stroke="#f43f5e"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Current point */}
          {points.length > 0 && (
            <circle
              cx={points[points.length - 1].x}
              cy={points[points.length - 1].y}
              r="3.5"
              fill="#fb7185"
              stroke="#881337"
              strokeWidth="1.5"
            />
          )}

          {/* X Axis labels */}
          <text
            x={padding.left}
            y={height - 5}
            textAnchor="start"
            fontSize="8.5"
            fill="#64748b"
            className="font-mono"
          >
            Day 0
          </text>
          <text
            x={width - padding.right}
            y={height - 5}
            textAnchor="end"
            fontSize="8.5"
            fill="#64748b"
            className="font-mono"
          >
            Day {maxDay}
          </text>
        </svg>
      </div>
    </div>
  );
}
