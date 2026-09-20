'use client';

import { ACTIONS, RELIEF_UNREST_REDUCTION } from '../../lib/constants';
import { ActionType, ProvinceState } from '../../lib/types';
import { cn } from '../../lib/utils';

interface ProvinceActionGridProps {
  provinceId: string;
  provinceState: ProvinceState;
  budget: number;
  isGameEnded: boolean;
  onDeployAction: (provinceId: string, actionKey: ActionType) => void;
}

const ACTION_TITLES: Record<ActionType, string> = {
  health: 'สาธารณสุข',
  checkpoint: 'ปิดด่าน',
  medical: 'ทีมแพทย์',
  relief: 'เยียวยาฉุกเฉิน',
};

export function ProvinceActionGrid({
  provinceId,
  provinceState,
  budget,
  isGameEnded,
  onDeployAction,
}: ProvinceActionGridProps) {
  const canDeployStandard = !isGameEnded && !provinceState.rioting && !provinceState.collapsed;
  const canDeployRelief = !isGameEnded && !provinceState.collapsed;

  return (
    <div className="grid grid-cols-2 gap-2">
      {(Object.keys(ACTIONS) as ActionType[]).map((actionKey) => {
        const action = ACTIONS[actionKey];
        const isRelief = actionKey === 'relief';
        const activeDays = provinceState.measures[actionKey] ?? 0;
        const isActive = activeDays > 0;
        const hasBudget = budget >= action.cost;
        const canDeploy = isRelief ? canDeployRelief : canDeployStandard;
        const isDisabled = !canDeploy || !hasBudget;
        const isReliefHighlight = isRelief && provinceState.rioting && hasBudget;

        return (
          <button
            key={actionKey}
            onClick={() => onDeployAction(provinceId, actionKey)}
            disabled={isDisabled}
            className={cn(
              'p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 text-center transition-all cursor-pointer active:scale-95 disabled:cursor-not-allowed relative',
              isReliefHighlight
                ? 'bg-amber-950/70 border-amber-400 text-amber-200 ring-2 ring-amber-500/40 shadow-lg shadow-amber-950/50 animate-pulse'
                : isActive
                ? 'bg-indigo-950/80 border-indigo-400 text-white shadow-md shadow-indigo-950/50'
                : 'bg-slate-950/80 border-slate-800 hover:border-slate-600 disabled:bg-slate-900/50 disabled:border-slate-850 text-slate-200 disabled:text-slate-600'
            )}
          >
            <span className="text-xl">{action.icon}</span>
            <span className="text-[11px] font-bold truncate max-w-full">
              {ACTION_TITLES[actionKey]}
            </span>
            <span
              className={cn(
                'text-[9px] font-mono font-semibold',
                isReliefHighlight
                  ? 'text-amber-300'
                  : isActive
                  ? 'text-indigo-300'
                  : hasBudget
                  ? 'text-slate-400'
                  : 'text-rose-500/70'
              )}
            >
              {isActive
                ? `เหลือ ${activeDays} วัน`
                : isRelief
                ? `${action.cost}G • ลด ${RELIEF_UNREST_REDUCTION}%`
                : `${action.cost}G • ${action.duration} วัน`}
            </span>
          </button>
        );
      })}
    </div>
  );
}
