'use client';

import { Province, ProvinceState } from '../../lib/types';

interface MapEdgeProps {
  provinceA: Province;
  provinceB: Province;
  stateA?: ProvinceState;
  stateB?: ProvinceState;
  weight: number;
}

export function MapEdge({
  provinceA,
  provinceB,
  stateA,
  stateB,
  weight,
}: MapEdgeProps) {
  const isCheckpoint = (stateA?.measures.checkpoint ?? 0) > 0 || (stateB?.measures.checkpoint ?? 0) > 0;
  const isCollapsed = stateA?.collapsed || stateB?.collapsed;

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
    <g>
      <line
        x1={provinceA.x}
        y1={provinceA.y}
        x2={provinceB.x}
        y2={provinceB.y}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeDasharray={strokeDasharray}
        strokeLinecap="round"
        className="transition-all duration-300"
      />
      {isCheckpoint && (
        <circle
          cx={(provinceA.x + provinceB.x) / 2}
          cy={(provinceA.y + provinceB.y) / 2}
          r={5}
          fill="#0891b2"
          stroke="#a5f3fc"
          strokeWidth={1}
        />
      )}
    </g>
  );
}
