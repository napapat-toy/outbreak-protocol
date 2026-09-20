'use client';

import { TOTAL_POPULATION } from '../lib/constants';
import { GameState } from '../lib/types';
import { BaseModal } from './shared/BaseModal';

interface GameOverModalProps {
  isOpen: boolean;
  state: GameState;
  onRestart: () => void;
  onQuickRestart?: () => void;
  onClose?: () => void;
}

export function GameOverModal({
  isOpen,
  state,
  onRestart,
  onQuickRestart,
  onClose,
}: GameOverModalProps) {
  if (!isOpen || !state.ended || !state.endResult) return null;

  const { endResult } = state;
  const isWon = endResult.won;

  let totalDead = 0;
  for (const prov of Object.values(state.provinces)) {
    totalDead += prov.dead;
  }
  const deathPct = ((totalDead / TOTAL_POPULATION) * 100).toFixed(2);

  const gradeColors: Record<string, string> = {
    S: 'from-amber-400 to-yellow-300 text-amber-950 border-amber-300 shadow-amber-500/50',
    A: 'from-emerald-400 to-teal-300 text-emerald-950 border-emerald-300 shadow-emerald-500/50',
    B: 'from-cyan-400 to-blue-300 text-cyan-950 border-cyan-300 shadow-cyan-500/50',
    C: 'from-orange-400 to-amber-300 text-orange-950 border-orange-300 shadow-orange-500/50',
    D: 'from-rose-400 to-red-300 text-rose-950 border-rose-300 shadow-rose-500/50',
    F: 'from-zinc-600 to-zinc-800 text-white border-zinc-500 shadow-zinc-900/50',
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-lg"
      className="items-center text-center gap-5 p-6"
    >
      {/* Banner Icon */}
        <div
          className={`w-20 h-20 rounded-3xl flex items-center justify-center text-4xl shadow-xl border ${
            isWon
              ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-400 shadow-emerald-950/60'
              : 'bg-rose-950/60 border-rose-500/60 text-rose-400 shadow-rose-950/60'
          }`}
        >
          {isWon ? '🏆' : '💀'}
        </div>

        {/* Title & Description */}
        <div className="space-y-1.5">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {isWon ? 'ภารกิจลุล่วง • Mission Accomplished' : 'ภารกิจล้มเหลว • Mission Failed'}
          </div>
          <h2 className="text-2xl font-black text-white">{endResult.title}</h2>
          <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
            {endResult.description}
          </p>
        </div>

        {/* Grade Badge (For Win) */}
        {isWon && endResult.grade && (
          <div className="flex flex-col items-center gap-1.5 py-1">
            <div
              className={`w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center text-3xl font-black shadow-lg border ${
                gradeColors[endResult.grade] || 'bg-slate-700 text-white'
              }`}
            >
              {endResult.grade}
            </div>
            <span className="text-xs font-semibold text-amber-300">
              {endResult.gradeDesc}
            </span>
          </div>
        )}

        {/* Final Metrics Summary */}
        <div className="grid grid-cols-3 gap-2 w-full pt-3 border-t border-slate-800 text-xs">
          <div className="card-mini">
            <div className="text-[10px] text-slate-400">ระยะเวลา</div>
            <div className="font-bold text-sm text-white mt-0.5">{state.day} วัน</div>
          </div>
          <div className="card-mini">
            <div className="text-[10px] text-slate-400">ผู้เสียชีวิต</div>
            <div className="font-bold text-sm text-rose-400 mt-0.5">
              {deathPct}%
            </div>
            <div className="text-[9px] text-slate-500">
              ({Math.round(totalDead).toLocaleString()} คน)
            </div>
          </div>
          <div className="card-mini" title="คะแนนความเสียหายสะสม (Infected-Days: ยิ่งคุมโรคได้ไว คะแนนยิ่งต่ำ)">
            <div className="text-[10px] text-slate-400">ความเสียหายสะสม</div>
            <div className="font-bold text-sm text-amber-400 mt-0.5 font-mono">
              {Math.round(state.severityScore).toLocaleString()}
            </div>
            <div className="text-[9px] text-slate-500">คน-วัน (ยิ่งน้อยยิ่งดี)</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2.5 w-full">
          {onQuickRestart && (
            <button
              onClick={onQuickRestart}
              className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs border border-slate-700 transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
            >
              <span>⚡</span>
              <span>เล่นซ้ำทันที (Quick Retry)</span>
            </button>
          )}

          <button
            onClick={onRestart}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-xl shadow-indigo-950/50 transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>🔄</span>
            <span>เลือกเชื้อ & เริ่มใหม่</span>
          </button>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors cursor-pointer py-1"
          >
            สำรวจแผนที่หลังจบภารกิจ ➔
          </button>
        )}
    </BaseModal>
  );
}
