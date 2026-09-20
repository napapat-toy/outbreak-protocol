'use client';

import { PATHOGENS, RESEARCH_COST, RESEARCH_GAIN_BASE, VACCINE_ROLLOUT_RATE } from '../lib/constants';
import { GameState } from '../lib/types';

interface ResearchPanelProps {
  state: GameState;
  onInvest: () => void;
}

export function ResearchPanel({ state, onInvest }: ResearchPanelProps) {
  const pathogen = PATHOGENS[state.pathogenId];
  const progress = Math.min(100, Math.round(state.research));
  const gainPerInvest = (RESEARCH_GAIN_BASE * pathogen.treatability).toFixed(1);
  const canInvest = !state.ended && !state.vaccineReady && state.budget >= RESEARCH_COST;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col gap-3 text-slate-200">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-xl">🧬</span>
          <div>
            <h3 className="text-sm font-bold text-white">ศูนย์วิจัยและพัฒนาวัคซีน</h3>
            <p className="text-[11px] text-slate-400">
              ความยากในการวิจัย: {pathogen.stats.hard}/5 (ประสิทธิภาพวิจัย +{gainPerInvest}%/ครั้ง)
            </p>
          </div>
        </div>

        {state.vaccineReady ? (
          <span className="text-[11px] px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40 flex items-center gap-1">
            <span>✅</span> สำเร็จแล้ว
          </span>
        ) : (
          <span className="text-xs font-mono font-bold text-indigo-400">
            {progress}% / 100%
          </span>
        )}
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800/80 p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              state.vaccineReady
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                : 'bg-gradient-to-r from-indigo-600 via-purple-500 to-pink-500'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span>
            {state.vaccineReady
              ? `🚀 กำลังแจกจ่ายวัคซีน ${(VACCINE_ROLLOUT_RATE * 100)}% ของผู้ยังไม่ติดเชื้อต่อวัน`
              : `ใช้งบประมาณ ${RESEARCH_COST}G ต่อการค้นคว้า 1 รอบ`}
          </span>
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={onInvest}
        disabled={!canInvest}
        className={`w-full py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-md active:scale-98 cursor-pointer disabled:cursor-not-allowed ${
          state.vaccineReady
            ? 'bg-slate-800 text-slate-500 border border-slate-700'
            : canInvest
            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-indigo-950/50 border border-indigo-500/30'
            : 'bg-slate-800/80 text-slate-500 border border-slate-800'
        }`}
      >
        <span>🧪</span>
        <span>
          {state.vaccineReady
            ? 'วัคซีนพร้อมใช้งานแล้ว (ฉีดอัตโนมัติ)'
            : `ทุ่มงบวิจัยวัคซีน (${RESEARCH_COST}G)`}
        </span>
      </button>
    </div>
  );
}
