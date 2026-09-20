'use client';

import { CONNECTIONS, PROVINCES } from '../lib/constants';
import { GameState, Province } from '../lib/types';

interface GameMapProps {
  state: GameState;
  selectedProvinceId: string | null;
  onSelectProvince: (id: string) => void;
}

export function GameMap({
  state,
  selectedProvinceId,
  onSelectProvince,
}: GameMapProps) {
  // Helper to get node color based on infection fraction
  const getNodeColor = (frac: number, collapsed: boolean, rioting: boolean) => {
    if (collapsed) return { fill: '#18181b', stroke: '#3f3f46', glow: 'none' };
    if (rioting) return { fill: '#b91c1c', stroke: '#ef4444', glow: '#ef4444' };
    if (frac <= 0.01) return { fill: '#065f46', stroke: '#10b981', glow: '#10b981' };
    if (frac <= 0.10) return { fill: '#854d0e', stroke: '#eab308', glow: '#eab308' };
    if (frac <= 0.40) return { fill: '#c2410c', stroke: '#f97316', glow: '#f97316' };
    return { fill: '#9f1239', stroke: '#f43f5e', glow: '#f43f5e' };
  };

  const provinceMap = new Map<string, Province>(PROVINCES.map((p) => [p.id, p]));

  return (
    <div className="relative w-full h-full min-h-[480px] bg-slate-950/80 border border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center p-2">
      {/* Background Grid & Radar styling */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/50 pointer-events-none" />

      {/* Map Legend */}
      <div className="absolute top-3 left-3 bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 text-[11px] backdrop-blur-md z-10 text-slate-400 space-y-1.5 shadow-lg hidden sm:block">
        <div className="font-semibold text-slate-300 text-xs mb-1 flex items-center gap-1.5">
          <span>🗺️ เครือข่ายการเดินทาง</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
          <span>ติดเชื้อ &lt; 1% (ปลอดภัย)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
          <span>ติดเชื้อ 1% - 10% (เฝ้าระวัง)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
          <span>ติดเชื้อ &gt; 10% (วิกฤต)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block" />
          <span>🔥 จลาจล (Unrest &ge; 70)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-zinc-900 border border-zinc-600 inline-block" />
          <span>💀 เขตมรณะ (เสียชีวิต &ge; 90%)</span>
        </div>
        <div className="flex items-center gap-2 pt-0.5 border-t border-slate-800">
          <span className="w-4 h-0.5 bg-cyan-400 inline-block" />
          <span>จุดตรวจ/ปิดด่าน (ลดแพร่ 50%)</span>
        </div>
      </div>

      {/* SVG Canvas */}
      <svg
        viewBox="180 80 360 360"
        className="w-full h-full max-h-[580px] select-none"
      >
        <defs>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Connections (Edges) */}
        <g className="connections">
          {CONNECTIONS.map(([idA, idB, weight], index) => {
            const pA = provinceMap.get(idA);
            const pB = provinceMap.get(idB);
            if (!pA || !pB) return null;

            const sA = state.provinces[idA];
            const sB = state.provinces[idB];

            const isCheckpoint =
              (sA?.measures.checkpoint ?? 0) > 0 || (sB?.measures.checkpoint ?? 0) > 0;
            const isCollapsed = sA?.collapsed || sB?.collapsed;

            let strokeColor = '#334155'; // default slate-700
            let strokeDasharray = 'none';

            if (isCollapsed) {
              strokeColor = '#1e293b';
              strokeDasharray = '2,4';
            } else if (isCheckpoint) {
              strokeColor = '#06b6d4'; // cyan
              strokeDasharray = '4,3';
            }

            const strokeWidth = isCheckpoint ? 3 : Math.max(1.5, weight * 4);

            return (
              <g key={`edge-${idA}-${idB}-${index}`}>
                <line
                  x1={pA.x}
                  y1={pA.y}
                  x2={pB.x}
                  y2={pB.y}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeLinecap="round"
                  className="transition-all duration-300"
                />
                {isCheckpoint && (
                  <circle
                    cx={(pA.x + pB.x) / 2}
                    cy={(pA.y + pB.y) / 2}
                    r={5}
                    fill="#0891b2"
                    stroke="#a5f3fc"
                    strokeWidth={1}
                  />
                )}
              </g>
            );
          })}
        </g>

        {/* Province Nodes */}
        <g className="nodes">
          {PROVINCES.map((p) => {
            const pState = state.provinces[p.id];
            const frac = pState.infected / p.pop;
            const isSelected = selectedProvinceId === p.id;
            const colors = getNodeColor(frac, pState.collapsed, pState.rioting);

            // Radius scales slightly with population
            const radius = p.hub ? 22 : 18;

            return (
              <g
                key={`node-${p.id}`}
                transform={`translate(${p.x}, ${p.y})`}
                onClick={() => onSelectProvince(p.id)}
                className="cursor-pointer group"
              >
                {/* Pulsing ring for high infection or riot */}
                {(frac > 0.05 || pState.rioting) && !pState.collapsed && (
                  <circle
                    r={radius + 8}
                    fill="none"
                    stroke={colors.stroke}
                    strokeWidth={1.5}
                    className="animate-ping opacity-35"
                  />
                )}

                {/* Selection indicator ring */}
                {isSelected && (
                  <circle
                    r={radius + 6}
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth={2.5}
                    strokeDasharray="4,2"
                    className="animate-[spin_6s_linear_infinite]"
                  />
                )}

                {/* Main Node Circle */}
                <circle
                  r={radius}
                  fill={colors.fill}
                  stroke={isSelected ? '#38bdf8' : colors.stroke}
                  strokeWidth={isSelected ? 3 : 2}
                  className="transition-all duration-200 group-hover:brightness-125 shadow-lg"
                />

                {/* Hub indicator badge */}
                {p.hub && (
                  <circle
                    r={radius - 4}
                    fill="none"
                    stroke="#ffffff22"
                    strokeWidth={1}
                    strokeDasharray="2,2"
                  />
                )}

                {/* Status Badges on Node */}
                {pState.collapsed ? (
                  <text
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize="13"
                  >
                    💀
                  </text>
                ) : pState.rioting ? (
                  <text
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize="13"
                    className="animate-bounce"
                  >
                    🔥
                  </text>
                ) : (
                  <text
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="#f8fafc"
                    fontSize={radius > 20 ? '11' : '10'}
                    fontWeight="bold"
                    className="pointer-events-none font-mono"
                  >
                    {frac >= 0.001 ? `${(frac * 100).toFixed(0)}%` : '0%'}
                  </text>
                )}

                {/* Active Measure mini-icons */}
                <g transform={`translate(${radius - 4}, ${-radius + 4})`}>
                  {(pState.measures.health ?? 0) > 0 && (
                    <text x={-14} y={-4} fontSize="9">🏥</text>
                  )}
                  {(pState.measures.checkpoint ?? 0) > 0 && (
                    <text x={-4} y={-4} fontSize="9">🚧</text>
                  )}
                  {(pState.measures.medical ?? 0) > 0 && (
                    <text x={6} y={-4} fontSize="9">🚑</text>
                  )}
                </g>

                {/* Province Label (Thai Name) */}
                <text
                  y={radius + 13}
                  textAnchor="middle"
                  fill={isSelected ? '#38bdf8' : '#e2e8f0'}
                  fontSize="11"
                  fontWeight={isSelected ? 'bold' : '500'}
                  className="pointer-events-none drop-shadow-md select-none transition-colors"
                >
                  {p.name}
                </text>

                {/* English Name (smaller subtitle) */}
                <text
                  y={radius + 23}
                  textAnchor="middle"
                  fill="#64748b"
                  fontSize="8.5"
                  className="pointer-events-none select-none font-sans"
                >
                  {p.nameEn}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
