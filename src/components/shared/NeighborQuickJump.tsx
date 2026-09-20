'use client';

import { Province, ProvinceState } from '../../lib/types';
import { cn } from '../../lib/utils';

interface NeighborQuickJumpProps {
  neighbors: (Province | undefined)[];
  provinceStates: Record<string, ProvinceState>;
  onSelectProvince?: (provinceId: string) => void;
}

export function NeighborQuickJump({
  neighbors,
  provinceStates,
  onSelectProvince,
}: NeighborQuickJumpProps) {
  const validNeighbors = neighbors.filter((n): n is Province => Boolean(n));
  if (validNeighbors.length === 0) return null;

  return (
    <div className="pt-3 mt-2 border-t border-slate-800/80">
      <div className="text-[10px] font-semibold text-slate-400 mb-1.5">
        เส้นทางเชื่อมต่อ ({validNeighbors.length}):
      </div>
      <div className="flex flex-wrap gap-1.5">
        {validNeighbors.map((n) => {
          const nState = provinceStates[n.id];
          const isNRioting = nState?.rioting;
          const isNInfected = (nState?.infected ?? 0) > 100;

          return (
            <button
              key={n.id}
              onClick={() => onSelectProvince?.(n.id)}
              className={cn(
                'text-[10px] px-2 py-1 rounded-lg border flex items-center gap-1 transition-all cursor-pointer active:scale-95',
                isNRioting
                  ? 'bg-rose-950/40 border-rose-800/60 text-rose-300 hover:border-rose-600'
                  : isNInfected
                  ? 'bg-amber-950/40 border-amber-800/60 text-amber-300 hover:border-amber-600'
                  : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
              )}
              title={`สลับมุมมองไปยัง ${n.name}`}
            >
              <span>{isNRioting ? '🔥' : isNInfected ? '⚠️' : '📍'}</span>
              <span>{n.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
