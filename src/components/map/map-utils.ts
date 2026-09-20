/**
 * Utility functions for SVG Map rendering and color interpolation
 */

export const hexToRgb = (hex: string): [number, number, number] => {
  const clean = hex.replace('#', '');
  const num = parseInt(clean, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
};

export const lerpColor = (c1: string, c2: string, t: number): string => {
  const [r1, g1, b1] = hexToRgb(c1);
  const [r2, g2, b2] = hexToRgb(c2);
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);
  return `rgb(${r}, ${g}, ${b})`;
};

export const getNodeColor = (frac: number, collapsed: boolean, rioting: boolean) => {
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
