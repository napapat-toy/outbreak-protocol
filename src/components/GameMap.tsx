'use client';

import { useEffect, useRef, useState } from 'react';
import { CONNECTIONS, PROVINCES } from '../lib/constants';
import { ActionType, GameLogEvent, GameState, Province } from '../lib/types';
import { ProvinceFloatingMenu } from './ProvinceFloatingMenu';

interface GameMapProps {
  state: GameState;
  selectedProvinceId: string | null;
  onSelectProvince: (id: string | null) => void;
  onDeployAction: (provinceId: string, actionKey: ActionType) => void;
  latestEvent?: GameLogEvent;
}

const PROVINCE_MAP = new Map<string, Province>(PROVINCES.map((p) => [p.id, p]));

export function GameMap({
  state,
  selectedProvinceId,
  onSelectProvince,
  onDeployAction,
  latestEvent,
}: GameMapProps) {
  // Pan and Zoom state
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(1);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const hasDraggedRef = useRef<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  // Center on province and notify parent when selected
  const handleSelectProvince = (id: string | null) => {
    onSelectProvince(id);
    if (id) {
      const p = PROVINCE_MAP.get(id);
      if (p) {
        // Target visual center: slightly to the left of SVG center (360, 260) to account for the right Side Dock
        const targetCenterX = 310;
        const targetCenterY = 260;
        const newPanX = (targetCenterX - p.x) * zoom;
        const newPanY = (targetCenterY - p.y) * zoom;
        setPan({
          x: Math.round(newPanX),
          y: Math.round(newPanY),
        });
      }
    }
  };

  // Wheel zoom with preventDefault on container
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.12 : 0.89;
      setZoom((prev) => Math.min(2.8, Math.max(0.65, +(prev * zoomFactor).toFixed(2))));
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', onWheel);
    };
  }, []);

  // Mouse pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    // Left click only
    if (e.button !== 0) return;
    setIsDragging(true);
    hasDraggedRef.current = false;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    panStartRef.current = { ...pan };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;

    // Movement deadzone: Don't drag or set hasDragged on slight hand jitters during clicks
    if (!hasDraggedRef.current) {
      if (Math.abs(dx) > 6 || Math.abs(dy) > 6) {
        hasDraggedRef.current = true;
      } else {
        return;
      }
    }

    setPan({
      x: panStartRef.current.x + dx,
      y: panStartRef.current.y + dy,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch pan handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const t = e.touches[0];
      setIsDragging(true);
      hasDraggedRef.current = false;
      dragStartRef.current = { x: t.clientX, y: t.clientY };
      panStartRef.current = { ...pan };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    const t = e.touches[0];
    const dx = t.clientX - dragStartRef.current.x;
    const dy = t.clientY - dragStartRef.current.y;

    // Movement deadzone for touch
    if (!hasDraggedRef.current) {
      if (Math.abs(dx) > 8 || Math.abs(dy) > 8) {
        hasDraggedRef.current = true;
      } else {
        return;
      }
    }

    setPan({
      x: panStartRef.current.x + dx,
      y: panStartRef.current.y + dy,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const resetView = () => {
    setPan({ x: 0, y: 0 });
    setZoom(1);
  };

  const hexToRgb = (hex: string): [number, number, number] => {
    const clean = hex.replace('#', '');
    const num = parseInt(clean, 16);
    return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
  };

  const lerpColor = (c1: string, c2: string, t: number): string => {
    const [r1, g1, b1] = hexToRgb(c1);
    const [r2, g2, b2] = hexToRgb(c2);
    const r = Math.round(r1 + (r2 - r1) * t);
    const g = Math.round(g1 + (g2 - g1) * t);
    const b = Math.round(b1 + (b2 - b1) * t);
    return `rgb(${r}, ${g}, ${b})`;
  };

  // Helper to get node color based on infection fraction with smooth gradient
  const getNodeColor = (frac: number, collapsed: boolean, rioting: boolean) => {
    if (collapsed) return { fill: '#18181b', stroke: '#ef4444' };
    if (rioting) return { fill: '#7f1d1d', stroke: '#ef4444' };
    if (frac <= 0.001) return { fill: '#064e3b', stroke: '#10b981' };
    if (frac < 0.25) {
      const fill = lerpColor('#064e3b', '#b45309', frac / 0.25);
      const stroke = lerpColor('#10b981', '#f59e0b', frac / 0.25);
      return { fill, stroke };
    }
    const fill = lerpColor('#b45309', '#881337', Math.min(1, (frac - 0.25) / 0.5));
    const stroke = lerpColor('#f59e0b', '#f43f5e', Math.min(1, (frac - 0.25) / 0.5));
    return { fill, stroke };
  };

  const provinceMap = PROVINCE_MAP;

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={() => {
        if (!hasDraggedRef.current) {
          handleSelectProvince(null);
        }
      }}
      className={`relative w-full h-[540px] sm:h-[600px] lg:h-[660px] bg-slate-950/80 border border-slate-800/80 rounded-3xl overflow-hidden shadow-2xl flex items-center justify-center p-2 select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
    >
      {/* Background Grid & Radar styling */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/40 pointer-events-none" />

      {/* Map Legend (Top Left) */}
      <div className="absolute top-3 left-3 bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 text-[11px] backdrop-blur-md z-10 text-slate-400 space-y-1 shadow-lg hidden sm:block">
        <div className="font-semibold text-slate-300 text-xs mb-1 flex items-center gap-1.5">
          <span>🗺️ ระดับการระบาด</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
          <span>&lt; 1% ปลอดภัย</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
          <span>1% - 10% เฝ้าระวัง</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
          <span>&gt; 10% วิกฤต</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block" />
          <span>🔥 จลาจล</span>
        </div>
        <div className="flex items-center gap-2 pt-0.5 border-t border-slate-800">
          <span className="w-3.5 h-0.5 bg-cyan-400 inline-block" />
          <span>จุดตรวจ/ปิดด่าน</span>
        </div>
      </div>

      {/* Live Alert Ticker (Top Right) */}
      {latestEvent && (
        <div
          className={`absolute top-3 z-10 flex items-center gap-2 shadow-lg animate-fadeIn max-w-xs sm:max-w-md bg-slate-900/90 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs backdrop-blur-md transition-all duration-300 ${
            selectedProvinceId ? 'right-3 sm:right-[340px]' : 'right-3'
          }`}
        >
          <span className="text-sm">
            {latestEvent.type === 'danger' || latestEvent.type === 'warn'
              ? '🚨'
              : latestEvent.type === 'success'
                ? '🎉'
                : latestEvent.type === 'action'
                  ? '🚀'
                  : '📢'}
          </span>
          <span className="truncate text-slate-300 text-[11px] font-medium">
            {latestEvent.text}
          </span>
        </div>
      )}

      {/* Zoom / Pan Controls (Bottom Left) */}
      <div
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        className="absolute bottom-4 left-4 z-10 flex flex-col items-center gap-1 bg-slate-900/90 border border-slate-700/80 rounded-2xl p-1 shadow-2xl backdrop-blur-md"
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            setZoom((z) => Math.min(2.8, +(z + 0.25).toFixed(2)));
          }}
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center font-bold text-xs sm:text-sm transition-all cursor-pointer active:scale-90"
          title="ซูมเข้า (+)"
        >
          ➕
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setZoom((z) => Math.max(0.65, +(z - 0.25).toFixed(2)));
          }}
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center font-bold text-xs sm:text-sm transition-all cursor-pointer active:scale-90"
          title="ซูมออก (-)"
        >
          ➖
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            resetView();
          }}
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center text-[10px] font-mono transition-all cursor-pointer active:scale-90"
          title="รีเซ็ตตำแหน่งแผนที่"
        >
          🎯
        </button>
        <span className="text-[9px] font-mono text-slate-400 py-0.5">
          {Math.round(zoom * 100)}%
        </span>
      </div>

      {/* Tactical Province Action Side Dock */}
      {selectedProvinceId && (
        <div
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          className="absolute top-0 right-0 h-full z-20 pointer-events-auto shadow-2xl"
        >
          <ProvinceFloatingMenu
            provinceId={selectedProvinceId}
            state={state}
            onDeployAction={onDeployAction}
            onClose={() => handleSelectProvince(null)}
            onSelectProvince={handleSelectProvince}
          />
        </div>
      )}

      {/* SVG Canvas */}
      <svg
        viewBox="180 80 360 360"
        className="w-full h-full max-h-[600px] select-none pointer-events-auto"
      >
        {/* Background Click to dismiss selection */}
        <rect
          x="180"
          y="80"
          width="360"
          height="360"
          fill="transparent"
          onClick={() => {
            if (!hasDraggedRef.current) handleSelectProvince(null);
          }}
        />
        <defs>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Master Pan & Zoom Group */}
        <g
          transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}
          style={{
            transformOrigin: '360px 260px',
            transition: isDragging ? 'none' : 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >

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

              // Radius scales dynamically with real population (14 + sqrt(pop)/140)
              const radius = Math.round(14 + Math.sqrt(p.pop) / 140);

              return (
                <g
                  key={`node-${p.id}`}
                  transform={`translate(${p.x}, ${p.y})`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!hasDraggedRef.current) {
                      handleSelectProvince(p.id);
                    }
                  }}
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
          {/* End Master Pan & Zoom Group */}
        </g>
      </svg>
    </div>
  );
}
