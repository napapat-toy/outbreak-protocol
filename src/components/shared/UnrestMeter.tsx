'use client';

import { UNREST_RIOT_THRESHOLD } from '../../lib/constants';

interface UnrestMeterProps {
  unrest: number;
  showTitle?: boolean;
}

export function UnrestMeter({ unrest, showTitle = true }: UnrestMeterProps) {
  const unrestVal = Math.round(unrest);
  const isRiot = unrestVal >= UNREST_RIOT_THRESHOLD;
  const isWarning = unrestVal >= 40;

  const moodIcon = isRiot ? '😡' : isWarning ? '😐' : '🙂';
  const textColor = isRiot
    ? 'text-rose-400 animate-pulse'
    : isWarning
    ? 'text-amber-400'
    : 'text-emerald-400';
  const barColor = isRiot ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500';

  return (
    <div className="space-y-1 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/60 text-[10px] select-none">
      {showTitle && (
        <div className="flex items-center justify-between">
          <span className="text-slate-300 flex items-center gap-1.5">
            <span className="text-xs">{moodIcon}</span>
            <span className="font-medium">ความไม่พอใจ (Unrest)</span>
          </span>
          <span className={`font-mono font-bold ${textColor}`}>
            {unrestVal}% {isRiot && '(จลาจล)'}
          </span>
        </div>
      )}
      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden relative">
        <div
          className={`h-full transition-all duration-300 ${barColor}`}
          style={{ width: `${Math.min(100, Math.max(0, unrestVal))}%` }}
        />
      </div>
    </div>
  );
}
