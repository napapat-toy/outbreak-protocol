'use client';

import { DIFFICULTIES, PATHOGENS, TOTAL_POPULATION } from '../lib/constants';
import { GameState } from '../lib/types';

interface TopBarProps {
  state: GameState;
  onNewGame: () => void;
  onOpenGuide: () => void;
}

export function TopBar({ state, onNewGame, onOpenGuide }: TopBarProps) {
  const pathogen = PATHOGENS[state.pathogenId];
  const difficulty = DIFFICULTIES[state.difficultyId] || DIFFICULTIES.standard;

  let totalInfected = 0;
  let totalRecovered = 0;
  let totalDead = 0;

  for (const prov of Object.values(state.provinces)) {
    totalInfected += prov.infected;
    totalRecovered += prov.recovered;
    totalDead += prov.dead;
  }

  const infectedFrac = (totalInfected / TOTAL_POPULATION) * 100;
  const deadFrac = (totalDead / TOTAL_POPULATION) * 100;

  return (
    <header className="bg-slate-900/95 border-b border-slate-800 backdrop-blur-md px-4 py-3 sticky top-0 z-30 select-none shadow-xl">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-amber-600 flex items-center justify-center text-white shadow-lg shadow-rose-950/50 text-xl font-bold">
            ☣️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-wider text-slate-100 uppercase">
                Outbreak Protocol
              </h1>
              <span className={`text-[10px] px-2 py-0.5 rounded font-semibold border ${difficulty.badgeColor}`}>
                {difficulty.icon} {difficulty.name.split(' ')[0]}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>{pathogen.icon} {pathogen.name}</span>
              <span>•</span>
              <span className="text-amber-400 font-medium">วันที่ {state.day}</span>
            </div>
          </div>
        </div>

        {/* Global Statistics Grid */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
          {/* Budget */}
          <div className="bg-slate-800/80 border border-slate-700/60 rounded-lg px-3 py-1.5 flex flex-col min-w-[95px]">
            <span className="text-slate-400 text-[10px] uppercase font-medium">งบประมาณ</span>
            <div className="flex items-baseline gap-1">
              <span className="text-amber-400 font-bold text-sm tracking-wide">
                💰 {Math.floor(state.budget)} G
              </span>
              <span className="text-[10px] text-emerald-400 font-mono font-medium">
                (+{difficulty.dailyBudgetGain})
              </span>
            </div>
          </div>

          {/* Active Infected */}
          <div className="bg-rose-950/40 border border-rose-800/40 rounded-lg px-3 py-1.5 flex flex-col min-w-[100px]">
            <span className="text-rose-300 text-[10px] uppercase font-medium">ผู้ติดเชื้อ</span>
            <span className="text-rose-400 font-bold text-sm">
              {Math.round(totalInfected).toLocaleString()} คน
              <span className="text-[10px] font-normal text-rose-300/70 ml-1">
                ({infectedFrac.toFixed(1)}%)
              </span>
            </span>
          </div>

          {/* Recovered */}
          <div className="bg-emerald-950/40 border border-emerald-800/40 rounded-lg px-3 py-1.5 flex flex-col min-w-[90px]">
            <span className="text-emerald-300 text-[10px] uppercase font-medium">หายป่วย</span>
            <span className="text-emerald-400 font-bold text-sm">
              {Math.round(totalRecovered).toLocaleString()} คน
            </span>
          </div>

          {/* Dead */}
          <div className="bg-slate-800/80 border border-slate-700/60 rounded-lg px-3 py-1.5 flex flex-col min-w-[90px]">
            <span className="text-slate-400 text-[10px] uppercase font-medium">เสียชีวิต</span>
            <span className="text-slate-200 font-bold text-sm">
              💀 {Math.round(totalDead).toLocaleString()} คน
              <span className="text-[10px] font-normal text-slate-400 ml-1">
                ({deadFrac.toFixed(2)}%)
              </span>
            </span>
          </div>

          {/* Vaccine */}
          <div className="bg-indigo-950/40 border border-indigo-800/40 rounded-lg px-3 py-1.5 flex flex-col min-w-[105px]">
            <span className="text-indigo-300 text-[10px] uppercase font-medium">วัคซีน</span>
            <div className="flex items-center gap-1.5">
              <span className="text-indigo-300 font-bold text-sm">
                💉 {state.vaccineReady ? 'พร้อมใช้ (5%/วัน)' : `${Math.floor(state.research)}%`}
              </span>
            </div>
          </div>

          {/* Guide Button */}
          <button
            onClick={onOpenGuide}
            className="px-3 py-2 rounded-lg bg-indigo-950/60 hover:bg-indigo-900/80 text-indigo-300 hover:text-white border border-indigo-500/40 text-xs font-semibold transition-all active:scale-95 cursor-pointer ml-1 flex items-center gap-1.5"
            title="เปิดอ่านคู่มือและเป้าหมายภารกิจ"
          >
            <span>📖</span>
            <span className="hidden sm:inline">คู่มือ</span>
          </button>

          {/* New Game Button */}
          <button
            onClick={onNewGame}
            className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition-all active:scale-95 cursor-pointer"
            title="เริ่มเกมใหม่ / ปรับระดับความยาก"
          >
            🔄 เริ่มใหม่
          </button>
        </div>
      </div>
    </header>
  );
}
