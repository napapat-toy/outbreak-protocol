'use client';

import {
  DIFFICULTIES,
  PATHOGENS,
  TOTAL_POPULATION,
} from '../lib/constants';
import { GameState } from '../lib/types';
import { VaccineResearchHUD } from './topbar/VaccineResearchHUD';

interface TopBarProps {
  state: GameState;
  onNewGame: () => void;
  onOpenGuide: () => void;
  onToggleAnalytics: () => void;
  isAnalyticsOpen: boolean;
  onInvestResearch: () => void;
  onReturnToMenu?: () => void;
}

export function TopBar({
  state,
  onNewGame,
  onOpenGuide,
  onToggleAnalytics,
  isAnalyticsOpen,
  onInvestResearch,
  onReturnToMenu,
}: TopBarProps) {
  const pathogen = PATHOGENS[state.pathogenId];
  const difficulty = DIFFICULTIES[state.difficultyId] || DIFFICULTIES.standard;

  let totalInfected = 0;
  let totalDead = 0;

  for (const prov of Object.values(state.provinces)) {
    totalInfected += prov.infected;
    totalDead += prov.dead;
  }

  const infectedFrac = (totalInfected / TOTAL_POPULATION) * 100;
  const deadFrac = (totalDead / TOTAL_POPULATION) * 100;

  return (
    <header className="bg-slate-900/95 border-b border-slate-800 backdrop-blur-md px-4 sm:px-6 py-2 sticky top-0 z-30 select-none shadow-xl w-full flex-shrink-0">
      <div className="w-full flex items-center justify-between gap-3">
        {/* Left: Brand & Day info */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-amber-600 flex items-center justify-center text-white shadow-lg shadow-rose-950/50 text-lg font-bold">
            ☣️
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base font-black tracking-wider text-slate-100 uppercase">
                Outbreak Protocol
              </h1>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold border ${difficulty.badgeColor}`}>
                {difficulty.icon} {difficulty.name.split(' ')[0]}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span className="truncate max-w-[120px]">{pathogen.icon} {pathogen.name}</span>
              <span>•</span>
              <span className="text-amber-400 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                วันที่ {state.day}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Vaccine Primary Goal Capsule */}
        <VaccineResearchHUD state={state} onInvestResearch={onInvestResearch} />

        {/* Right: Vital Stats & Actions */}
        <div className="order-2 md:order-3 flex items-center gap-1.5 sm:gap-2 text-xs">
          {/* Budget */}
          <div className="bg-slate-800/80 border border-slate-700/60 rounded-lg px-2.5 py-1 flex items-baseline gap-1" title="งบประมาณคงเหลือ">
            <span className="text-amber-400 font-bold text-xs sm:text-sm tracking-wide">
              💰 {Math.floor(state.budget)}G
            </span>
            <span className="text-[10px] text-emerald-400 font-mono font-medium">
              +{difficulty.dailyBudgetGain}
            </span>
          </div>

          {/* Active Infected */}
          <div className="bg-rose-950/40 border border-rose-800/40 rounded-lg px-2.5 py-1 hidden sm:flex flex-col" title="จำนวนผู้ติดเชื้อรวมทั้งประเทศ">
            <span className="text-rose-400 font-bold text-xs sm:text-sm">
              🔴 {Math.round(totalInfected).toLocaleString()}
              <span className="text-[10px] font-normal text-rose-300/70 ml-1">
                ({infectedFrac.toFixed(1)}%)
              </span>
            </span>
          </div>

          {/* Dead */}
          <div className="bg-slate-800/80 border border-slate-700/60 rounded-lg px-2.5 py-1 hidden lg:flex flex-col" title="จำนวนผู้เสียชีวิตรวม">
            <span className="text-slate-200 font-bold text-xs sm:text-sm">
              💀 {Math.round(totalDead).toLocaleString()}
              <span className="text-[10px] font-normal text-slate-400 ml-1">
                ({deadFrac.toFixed(1)}%)
              </span>
            </span>
          </div>

          {/* Analytics Drawer Button */}
          <button
            onClick={onToggleAnalytics}
            className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 ${
              isAnalyticsOpen
                ? 'bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-950/50'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border-slate-700'
            }`}
            title="เปิดดูสถิติ กราฟการระบาด และบันทึกสถานการณ์"
          >
            <span>📊</span>
            <span className="hidden sm:inline">ข้อมูลวิเคราะห์</span>
          </button>

          {/* Guide Button */}
          <button
            onClick={onOpenGuide}
            className="p-1.5 sm:px-2 sm:py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition-all active:scale-95 cursor-pointer"
            title="เปิดอ่านคู่มือและเงื่อนไขแพ้ชนะ"
          >
            📖
          </button>

          {/* New Game Button */}
          <button
            onClick={onNewGame}
            className="p-1.5 sm:px-2 sm:py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition-all active:scale-98 cursor-pointer"
            title="เริ่มเกมใหม่ / ปรับระดับความยาก"
          >
            🔄
          </button>

          {/* Main Menu Button */}
          {onReturnToMenu && (
            <button
              onClick={onReturnToMenu}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition-all active:scale-98 cursor-pointer flex items-center gap-1.5"
              title="บันทึกและกลับสู่หน้าเมนูหลัก"
            >
              <span>🏠</span>
              <span className="hidden md:inline text-[11px]">เมนูหลัก</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
