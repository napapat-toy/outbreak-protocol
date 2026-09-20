import { ProvinceState } from './types';

/**
 * Formats a number with comma separators for clean localized display.
 */
export function formatNumber(value: number): string {
  return Math.round(value).toLocaleString();
}

/**
 * Formats a ratio or percentage into a percentage string (e.g. 12.4%).
 * If input is already 0-100 (isFraction = false), uses it directly.
 */
export function formatPercent(value: number, decimals: number = 1, isFraction: boolean = false): string {
  const pct = isFraction ? value * 100 : value;
  return `${pct.toFixed(decimals)}%`;
}

/**
 * Formats budget / currency (e.g. 120G)
 */
export function formatCurrency(value: number): string {
  return `${Math.floor(value).toLocaleString()}G`;
}

export type ProvinceStatusLevel = 'collapsed' | 'rioting' | 'critical' | 'warning' | 'stable' | 'safe';

export interface ProvinceStatusInfo {
  level: ProvinceStatusLevel;
  icon: string;
  label: string;
  badgeClass: string;
  infectedPct: number;
  deadPct: number;
}

/**
 * Computes diagnostic status, icon, and styling classes for a province state.
 */
export function getProvinceStatus(pState: ProvinceState, pop: number): ProvinceStatusInfo {
  const infectedPct = pop > 0 ? (pState.infected / pop) * 100 : 0;
  const deadPct = pop > 0 ? (pState.dead / pop) * 100 : 0;

  if (pState.collapsed) {
    return {
      level: 'collapsed',
      icon: '💀',
      label: 'เขตมรณะ',
      badgeClass: 'text-zinc-400 bg-zinc-900 border-zinc-700',
      infectedPct,
      deadPct,
    };
  }

  if (pState.rioting) {
    return {
      level: 'rioting',
      icon: '🔥',
      label: 'จลาจล',
      badgeClass: 'text-rose-300 bg-rose-950/80 border-rose-600/80 animate-pulse',
      infectedPct,
      deadPct,
    };
  }

  if (infectedPct >= 30) {
    return {
      level: 'critical',
      icon: '🔴',
      label: 'วิกฤต',
      badgeClass: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
      infectedPct,
      deadPct,
    };
  }

  if (infectedPct >= 5 || pState.unrest >= 40) {
    return {
      level: 'warning',
      icon: '🟡',
      label: 'เฝ้าระวัง',
      badgeClass: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
      infectedPct,
      deadPct,
    };
  }

  if (infectedPct > 0.05) {
    return {
      level: 'stable',
      icon: '🟠',
      label: 'ปานกลาง',
      badgeClass: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
      infectedPct,
      deadPct,
    };
  }

  return {
    level: 'safe',
    icon: '🟢',
    label: 'ปลอดภัย',
    badgeClass: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    infectedPct,
    deadPct,
  };
}
