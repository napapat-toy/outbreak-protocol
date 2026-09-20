'use client';

import { CONNECTIONS, PROVINCES } from '../lib/constants';
import { ActionType, GameState, Province } from '../lib/types';
import { MAP_CONFIG } from '../lib/ui-constants';
import { useMapPanZoom } from '../hooks/useMapPanZoom';
import { MapControls } from './map/MapControls';
import { MapEdge } from './map/MapEdge';
import { MapLegend } from './map/MapLegend';
import { MapNode } from './map/MapNode';
import { ProvinceFloatingMenu } from './ProvinceFloatingMenu';

interface GameMapProps {
  state: GameState;
  selectedProvinceId: string | null;
  onSelectProvince: (id: string | null) => void;
  onDeployAction: (provinceId: string, actionKey: ActionType) => void;
}

const PROVINCE_MAP = new Map<string, Province>(PROVINCES.map((p) => [p.id, p]));

export function GameMap({
  state,
  selectedProvinceId,
  onSelectProvince,
  onDeployAction,
}: GameMapProps) {
  const {
    pan,
    zoom,
    isDragging,
    hasDraggedRef,
    containerRef,
    zoomIn,
    zoomOut,
    resetView,
    centerOnPoint,
    dragProps,
  } = useMapPanZoom();

  // Center on province and notify parent when selected
  const handleSelectProvince = (id: string | null) => {
    onSelectProvince(id);
    if (id) {
      const p = PROVINCE_MAP.get(id);
      if (p) {
        centerOnPoint(p.x, p.y);
      }
    }
  };

  return (
    <div
      ref={containerRef}
      {...dragProps}
      onClick={() => {
        if (!hasDraggedRef.current) {
          handleSelectProvince(null);
        }
      }}
      className={`relative w-full h-full flex-1 bg-[#070b14] overflow-hidden flex items-center justify-center select-none ${
        isDragging ? 'cursor-grabbing' : 'cursor-grab'
      }`}
    >
      {/* Background Grid & Radar styling */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/40 pointer-events-none" />

      {/* Map Legend (Top Left) */}
      <MapLegend />

      {/* Zoom / Pan Controls (Bottom Left) */}
      <MapControls
        zoom={zoom}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onResetView={resetView}
      />

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
        viewBox={`${MAP_CONFIG.viewBox.x} ${MAP_CONFIG.viewBox.y} ${MAP_CONFIG.viewBox.width} ${MAP_CONFIG.viewBox.height}`}
        className="w-full h-full select-none pointer-events-auto overflow-visible"
      >
        {/* Background Click to dismiss selection */}
        <rect
          x={MAP_CONFIG.viewBox.x}
          y={MAP_CONFIG.viewBox.y}
          width={MAP_CONFIG.viewBox.width}
          height={MAP_CONFIG.viewBox.height}
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
            transformOrigin: `${MAP_CONFIG.center.x}px ${MAP_CONFIG.center.y}px`,
            transition: isDragging ? 'none' : 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {/* Connections (Edges) */}
          <g className="connections">
            {CONNECTIONS.map(([idA, idB, weight], index) => {
              const pA = PROVINCE_MAP.get(idA);
              const pB = PROVINCE_MAP.get(idB);
              if (!pA || !pB) return null;

              return (
                <MapEdge
                  key={`edge-${idA}-${idB}-${index}`}
                  provinceA={pA}
                  provinceB={pB}
                  stateA={state.provinces[idA]}
                  stateB={state.provinces[idB]}
                  weight={weight}
                />
              );
            })}
          </g>

          {/* Province Nodes */}
          <g className="nodes">
            {PROVINCES.map((p) => (
              <MapNode
                key={`node-${p.id}`}
                province={p}
                provinceState={state.provinces[p.id]}
                isSelected={selectedProvinceId === p.id}
                onSelect={handleSelectProvince}
                canClick={() => !hasDraggedRef.current}
              />
            ))}
          </g>
        </g>
      </svg>
    </div>
  );
}
