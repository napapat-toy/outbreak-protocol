/**
 * UI Constants for Outbreak Protocol
 * Keeps presentation tokens, map dimensions, speed options, and visual thresholds separate from simulation logic.
 */

export const MAP_CONFIG = {
  viewBox: {
    x: 180,
    y: 80,
    width: 360,
    height: 360,
  },
  center: {
    x: 360,
    y: 260,
  },
  dockOffsetCenter: {
    x: 310,
    y: 260,
  },
  zoom: {
    min: 0.65,
    max: 2.8,
    step: 0.25,
    wheelFactorIn: 1.12,
    wheelFactorOut: 0.89,
  },
  dragDeadzone: {
    mouse: 6,
    touch: 8,
  },
  node: {
    baseRadius: 14,
    populationScaleDivisor: 140,
  },
} as const;

export const GAME_SPEED_OPTIONS = [1, 2, 4] as const;
export type GameSpeed = (typeof GAME_SPEED_OPTIONS)[number];

export const SEVERITY_LEVELS = {
  low: {
    max: 20,
    label: 'สถานการณ์ปกติ',
    badgeColor: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    icon: '🟢',
  },
  medium: {
    max: 50,
    label: 'เริ่มตึงมือ',
    badgeColor: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
    icon: '🟡',
  },
  high: {
    label: 'วิกฤตรุนแรง',
    badgeColor: 'text-rose-400 border-rose-500/30 bg-rose-500/10',
    icon: '🔴',
  },
} as const;

export function getSeverityInfo(score: number) {
  if (score < SEVERITY_LEVELS.low.max) {
    return SEVERITY_LEVELS.low;
  }
  if (score < SEVERITY_LEVELS.medium.max) {
    return SEVERITY_LEVELS.medium;
  }
  return SEVERITY_LEVELS.high;
}
