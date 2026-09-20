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

  return (
    <g
      transform={`translate(${province.x}, ${province.y})`}
      onClick={(e) => {
        e.stopPropagation();
        if (canClick()) {
          onSelect(province.id);
        }
      }}
      className="cursor-pointer group select-none"
    >
      {/* Pulsing ring for high infection or riot */}
      {(frac > 0.05 || provinceState.rioting) && !provinceState.collapsed && (
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
      {province.hub && (
        <g>
          <circle
            r={radius - 4}
            fill="none"
            stroke="#ffffff33"
            strokeWidth={1}
            strokeDasharray="2,2"
          />
          <text
            x={radius - 5}
            y={-radius + 7}
            fontSize="9"
            fill="#38bdf8"
            className="pointer-events-none select-none font-bold"
          >
            ✈
          </text>
        </g>
      )}

      {/* Status Badges on Node */}
      {provinceState.collapsed ? (
        <text textAnchor="middle" dominantBaseline="central" fontSize="13">
          💀
        </text>
      ) : provinceState.rioting ? (
        <text
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="16"
          className="animate-bounce-subtle"
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
        {(provinceState.measures.health ?? 0) > 0 && (
          <text x={-14} y={-4} fontSize="9">🏥</text>
        )}
        {(provinceState.measures.checkpoint ?? 0) > 0 && (
          <text x={-4} y={-4} fontSize="9">🚧</text>
        )}
        {(provinceState.measures.medical ?? 0) > 0 && (
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
        {province.name}
      </text>

      {/* English Name (smaller subtitle) */}
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
