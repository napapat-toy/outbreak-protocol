'use client';

import { TOTAL_POPULATION } from '../lib/constants';
import { GameState } from '../lib/types';

interface MissionObjectivesProps {
  state: GameState;
  onOpenGuide: () => void;
}

export function MissionObjectives({ state, onOpenGuide }: MissionObjectivesProps) {
  let totalInfected = 0;
  let riotingCount = 0;

  for (const prov of Object.values(state.provinces)) {
    totalInfected += prov.infected;
    if (prov.rioting) riotingCount += 1;
  }

  const frac = totalInfected / TOTAL_POPULATION;
  const isVaccineDone = state.vaccineReady;
  const isContainmentNear = state.peaked && frac < 0.001;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 shadow-lg flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
      <div className="flex items-center gap-2">
        <span className="text-base">🎯</span>
        <div className="font-bold text-slate-200">
          เป้าหมายภารกิจเพื่อชัยชนะ:
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        {/* Objective 1: Vaccine */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-mono ${
            isVaccineDone
              ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-300'
              : 'bg-slate-950/60 border-slate-800 text-slate-300'
          }`}
        >
          <span>{isVaccineDone ? '✅' : '💉'}</span>
          <span>วิจัยวัคซีน 100%:</span>
          <span className="font-bold">
            {isVaccineDone ? 'สำเร็จ (ฉีด 5%/วัน)' : `${Math.floor(state.research)}%`}
          </span>
        </div>

        {/* Objective 2: Containment */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-mono ${
            isContainmentNear
              ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-300'
              : 'bg-slate-950/60 border-slate-800 text-slate-300'
          }`}
        >
          <span>{isContainmentNear ? '✅' : '📉'}</span>
          <span>กดผู้ติดเชื้อ &lt; 0.1%:</span>
          <span className="font-bold text-rose-400">
            {(frac * 100).toFixed(1)}%
          </span>
        </div>

        {/* Objective 3: Riots */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-mono ${
            riotingCount >= 2
              ? 'bg-rose-950/60 border-rose-500 text-rose-300 animate-pulse'
              : 'bg-slate-950/60 border-slate-800 text-slate-400'
          }`}
        >
          <span>{riotingCount > 0 ? '🔥' : '🛡️'}</span>
          <span>จลาจล:</span>
          <span className={riotingCount >= 3 ? 'text-rose-400 font-bold' : 'text-slate-300'}>
            {riotingCount}/4 จว.
          </span>
        </div>

        {/* Info button */}
        <button
          onClick={onOpenGuide}
          className="text-slate-400 hover:text-indigo-300 cursor-pointer underline text-[11px] ml-1"
        >
          รายละเอียด ➔
        </button>
      </div>
    </div>
  );
}
