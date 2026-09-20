'use client';

import { MAP_CONFIG } from '../../lib/ui-constants';
import { Province, ProvinceState } from '../../lib/types';
import { getNodeColor } from './map-utils';

interface MapNodeProps {
  province: Province;
  provinceState: ProvinceState;
  isSelected: boolean;
  onSelect: (provinceId: string) => void;
  canClick: () => boolean;
}

export function MapNode({
  province,
  provinceState,
  isSelected,
  onSelect,
  canClick,
}: MapNodeProps) {
  const frac = provinceState.infected / province.pop;
  const colors = getNodeColor(frac, provinceState.collapsed, provinceState.rioting);
  const radius = Math.round(
    MAP_CONFIG.node.baseRadius + Math.sqrt(province.pop) / MAP_CONFIG.node.populationScaleDivisor
  );

  const measures = provinceState.measures;
  const hasMeasures = (measures.health ?? 0) > 0 || (measures.checkpoint ?? 0) > 0 || (measures.medical ?? 0) > 0;

  return (
    <g
      transform={`translate(${province.x}, ${province.y})`}
      onClick={(e) => {
        e.stopPropagation();
        if (canClick()) onSelect(province.id);
      }}
      className="cursor-pointer group select-none"
    >
      {/* Pulse ring for danger */}
      {(frac > 0.05 || provinceState.rioting) && !provinceState.collapsed && (
        <circle
          r={radius + 8}
          fill="none"
          stroke={colors.stroke}
          strokeWidth={1.5}
          className="animate-ping opacity-35 pointer-events-none"
        />
      )}

      {/* Selection indicator */}
      {isSelected && (
        <circle
          r={radius + 6}
          fill="none"
          stroke="#38bdf8"
          strokeWidth={2.5}
          strokeDasharray="4,2"
          className="animate-[spin_6s_linear_infinite] pointer-events-none"
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

      {/* Hub badge */}
      {province.hub && (
        <g className="pointer-events-none select-none">
          <circle r={radius - 4} fill="none" stroke="#ffffff33" strokeWidth={1} strokeDasharray="2,2" />
          <text x={radius - 5} y={-radius + 7} fontSize="9" fill="#38bdf8" className="font-bold">✈</text>
        </g>
      )}

      {/* Consolidated Center Status: 💀 / 🔥 / % text in single tag */}
      <text
        textAnchor="middle"
        dominantBaseline="central"
        fill="#f8fafc"
        fontSize={provinceState.rioting ? '16' : provinceState.collapsed ? '13' : radius > 20 ? '11' : '10'}
        fontWeight="bold"
        className={`pointer-events-none select-none font-mono ${provinceState.rioting ? 'animate-bounce-subtle' : ''}`}
      >
        {provinceState.collapsed
          ? '💀'
          : provinceState.rioting
          ? '🔥'
          : frac >= 0.001
          ? `${(frac * 100).toFixed(0)}%`
          : '0%'}
      </text>

      {/* Active Measures Badges */}
      {hasMeasures && (
        <g transform={`translate(${radius - 4}, ${-radius + 4})`} className="pointer-events-none select-none">
          {(measures.health ?? 0) > 0 && <text x={-14} y={-4} fontSize="9">🏥</text>}
          {(measures.checkpoint ?? 0) > 0 && <text x={-4} y={-4} fontSize="9">🚧</text>}
          {(measures.medical ?? 0) > 0 && <text x={6} y={-4} fontSize="9">🚑</text>}
        </g>
      )}

      {/* Province Labels */}
      <text
        y={radius + 13}
        textAnchor="middle"
        fill={isSelected ? '#38bdf8' : '#e2e8f0'}
        fontSize="11"
        fontWeight={isSelected ? 'bold' : '500'}
        className="pointer-events-none drop-shadow-md select-none transition-colors"
      >
        {province.name}
      </text>
      <text
        y={radius + 23}
        textAnchor="middle"
        fill="#64748b"
        fontSize="8.5"
        className="pointer-events-none select-none font-sans"
      >
        {province.nameEn}
      </text>
    </g>
  );
}
