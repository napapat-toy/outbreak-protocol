'use client';

import { useEffect, useRef, useState } from 'react';
import { MAP_CONFIG } from '../lib/ui-constants';

interface UseMapPanZoomOptions {
  initialZoom?: number;
  initialPan?: { x: number; y: number };
}

export function useMapPanZoom(options: UseMapPanZoomOptions = {}) {
  const [pan, setPan] = useState<{ x: number; y: number }>(options.initialPan ?? { x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(options.initialZoom ?? 1);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const hasDraggedRef = useRef<boolean>(false);

  // Wheel zoom with passive: false to allow e.preventDefault()
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const factor = e.deltaY < 0 ? MAP_CONFIG.zoom.wheelFactorIn : MAP_CONFIG.zoom.wheelFactorOut;
      setZoom((prev) =>
        Math.min(MAP_CONFIG.zoom.max, Math.max(MAP_CONFIG.zoom.min, +(prev * factor).toFixed(2)))
      );
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', onWheel);
    };
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Left click only
    setIsDragging(true);
    hasDraggedRef.current = false;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    panStartRef.current = { ...pan };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;

    // Movement deadzone: avoids triggering drag on slight clicks
    if (!hasDraggedRef.current) {
      if (Math.abs(dx) > MAP_CONFIG.dragDeadzone.mouse || Math.abs(dy) > MAP_CONFIG.dragDeadzone.mouse) {
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

    if (!hasDraggedRef.current) {
      if (Math.abs(dx) > MAP_CONFIG.dragDeadzone.touch || Math.abs(dy) > MAP_CONFIG.dragDeadzone.touch) {
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

  const zoomIn = () => {
    setZoom((z) => Math.min(MAP_CONFIG.zoom.max, +(z + MAP_CONFIG.zoom.step).toFixed(2)));
  };

  const zoomOut = () => {
    setZoom((z) => Math.max(MAP_CONFIG.zoom.min, +(z - MAP_CONFIG.zoom.step).toFixed(2)));
  };

  const resetView = () => {
    setPan({ x: 0, y: 0 });
    setZoom(1);
  };

  const centerOnPoint = (pointX: number, pointY: number, targetCenterX = MAP_CONFIG.dockOffsetCenter.x, targetCenterY = MAP_CONFIG.dockOffsetCenter.y) => {
    const newPanX = (targetCenterX - pointX) * zoom;
    const newPanY = (targetCenterY - pointY) * zoom;
    setPan({
      x: Math.round(newPanX),
      y: Math.round(newPanY),
    });
  };

  return {
    pan,
    zoom,
    isDragging,
    hasDraggedRef,
    containerRef,
    zoomIn,
    zoomOut,
    resetView,
    centerOnPoint,
    dragProps: {
      onMouseDown: handleMouseDown,
      onMouseMove: handleMouseMove,
      onMouseUp: handleMouseUp,
      onMouseLeave: handleMouseUp,
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
  };
}
