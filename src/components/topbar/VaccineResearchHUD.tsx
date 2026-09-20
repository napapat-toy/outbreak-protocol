'use client';

import {
  MAX_RESEARCH_QUEUE_DAYS,
  RESEARCH_CONTRACT_DAYS,
  RESEARCH_COST,
  VACCINE_ROLLOUT_RATE,
} from '../../lib/constants';
import { GameState } from '../../lib/types';

interface VaccineResearchHUDProps {
  state: GameState;
  onInvestResearch: () => void;
}

export function VaccineResearchHUD({ state, onInvestResearch }: VaccineResearchHUDProps) {
  const researchPct = Math.min(100, Math.floor(state.research));
  const isQueuedMax = state.researchDaysRemaining >= MAX_RESEARCH_QUEUE_DAYS;
  const canInvest =
    !state.ended && !state.vaccineReady && state.budget >= RESEARCH_COST && !isQueuedMax;

  return (
    <div className="order-3 md:order-2 w-full md:w-auto flex items-center justify-center select-none">
      <div className="w-full md:w-auto bg-slate-950/70 border border-indigo-500/30 rounded-xl px-3 py-1.5 flex items-center justify-between md:justify-start gap-3 shadow-inner">
        <div className="flex items-center gap-2">
          <span className="text-base">
            {state.vaccineReady
              ? '🎉'
              : state.researchDaysRemaining > 0
              ? '🔬'
              : '⏸️'}
          </span>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-200">
                {state.vaccineReady
                  ? 'วัคซีนสำเร็จแล้ว'
                  : state.researchDaysRemaining > 0
                  ? `กำลังวิจัย (เหลือ ${state.researchDaysRemaining}ว.)`
                  : 'วิจัยวัคซีน (หยุดชั่วคราว)'}
              </span>
              <span className="text-[11px] font-mono font-bold text-indigo-400">
                {state.vaccineReady ? `ฉีด ${Math.round(VACCINE_ROLLOUT_RATE * 100)}%/วัน` : `${researchPct}%`}
              </span>
            </div>
            {/* Mini progress bar */}
            <div className="w-24 sm:w-36 h-1.5 bg-slate-800 rounded-full overflow-hidden mt-0.5">
              <div
                className={`h-full transition-all duration-300 ${
                  state.vaccineReady
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                    : state.researchDaysRemaining > 0
                    ? 'bg-gradient-to-r from-indigo-500 to-pink-500 animate-pulse'
                    : 'bg-slate-600'
                }`}
                style={{ width: `${researchPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Quick Invest button */}
        {!state.vaccineReady && (
          <button
            onClick={onInvestResearch}
            disabled={!canInvest}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 active:scale-95 shadow-md ${
              canInvest
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-indigo-900/50 cursor-pointer animate-pulse'
                : 'bg-slate-800/80 text-slate-500 border border-slate-700/60 cursor-not-allowed'
            }`}
            title={
              isQueuedMax
                ? `จองคิววิจัยล่วงหน้าเต็มแล้ว (${MAX_RESEARCH_QUEUE_DAYS} วัน)`
                : state.budget < RESEARCH_COST
                ? `ต้องการงบ ${RESEARCH_COST}G (ขาดอีก ${RESEARCH_COST - Math.floor(state.budget)}G)`
                : `ลงทุนวิจัยวัคซีน (+สัญญาเร่งวิจัย ${RESEARCH_CONTRACT_DAYS} วัน)`
            }
          >
            <span>💉</span>
            <span>
              {isQueuedMax
                ? 'คิวเต็ม'
                : state.researchDaysRemaining > 0
                ? `ต่อสัญญา ${RESEARCH_COST}G`
                : `วิจัย ${RESEARCH_COST}G`}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
