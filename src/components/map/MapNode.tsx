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
  const activeMeasures: string[] = [];
  if ((measures.health ?? 0) > 0) activeMeasures.push('🏥');
  if ((measures.checkpoint ?? 0) > 0) activeMeasures.push('🚧');
  if ((measures.medical ?? 0) > 0) activeMeasures.push('🚑');

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

      {/* Hub badge (Dedicated Bottom-Left Arc - completely clear of top measures) */}
      {province.hub && (
        <g className="pointer-events-none select-none">
          <circle
            cx={-radius * 0.72}
            cy={radius * 0.70}
            r={7}
            fill="#090d16"
            stroke="#38bdf8"
            strokeWidth={1.2}
          />
          <text
            x={-radius * 0.72}
            y={radius * 0.70}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="8"
            fill="#38bdf8"
          >
            ✈
          </text>
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

      {/* Active Measures Badges (Floating Centered Pill Above Node) */}
      {activeMeasures.length > 0 && (
        <g
          transform={`translate(0, ${-radius - 8})`}
          className="pointer-events-none select-none"
        >
          {(() => {
            const pillWidth = activeMeasures.length * 15 + 6;
            const startX = -pillWidth / 2;
            return (
              <>
                <rect
                  x={startX}
                  y={-8}
                  width={pillWidth}
                  height={16}
                  rx={8}
                  fill="#090d16"
                  stroke="#334155"
                  strokeWidth={1}
                />
                {activeMeasures.map((icon, idx) => (
                  <text
                    key={idx}
                    x={startX + 10.5 + idx * 15}
                    y={0.5}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize="9.5"
                  >
                    {icon}
                  </text>
                ))}
              </>
            );
          })()}
        </g>
      )}

      {/* Province Labels with crisp dark outline */}
      <text
        y={radius + 15}
        textAnchor="middle"
        fill={isSelected ? '#38bdf8' : '#e2e8f0'}
        fontSize="11"
        fontWeight={isSelected ? 'bold' : '600'}
        stroke="#070b14"
        strokeWidth="3.5"
        paintOrder="stroke fill"
        strokeLinejoin="round"
        className="pointer-events-none select-none transition-colors"
      >
        {province.name}
      </text>
      <text
        y={radius + 26}
        textAnchor="middle"
        fill={isSelected ? '#93c5fd' : '#64748b'}
        fontSize="8.5"
        stroke="#070b14"
        strokeWidth="2.5"
        paintOrder="stroke fill"
        strokeLinejoin="round"
        className="pointer-events-none select-none font-sans"
      >
        {province.nameEn}
      </text>
    </g>
  );
}
