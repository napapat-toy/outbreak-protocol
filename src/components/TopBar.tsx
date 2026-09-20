'use client';

import { useEffect } from 'react';
import {
  DIFFICULTIES,
  PATHOGENS,
  TOTAL_POPULATION,
} from '../lib/constants';
import { GameState } from '../lib/types';
import { cn } from '../lib/utils';
import { VaccineResearchHUD } from './topbar/VaccineResearchHUD';

interface TopBarProps {
  state: GameState;
  onNewGame: () => void;
  onOpenGuide: () => void;
  onToggleAnalytics: () => void;
  isAnalyticsOpen: boolean;
  onInvestResearch: () => void;
  onReturnToMenu?: () => void;
  // Time controls
  isRunning?: boolean;
  sliderSpeed?: number;
  onNextDay?: () => void;
  onTogglePlay?: () => void;
  onSpeedChange?: (speed: number) => void;
  onEscape?: () => void;
  disabledShortcuts?: boolean;
}

export function TopBar({
  state,
  onNewGame,
  onOpenGuide,
  onToggleAnalytics,
  isAnalyticsOpen,
  onInvestResearch,
  onReturnToMenu,
  isRunning = false,
  sliderSpeed = 800,
  onNextDay,
  onTogglePlay,
  onSpeedChange,
  onEscape,
  disabledShortcuts = false,
}: TopBarProps) {
  // Tactical keyboard shortcuts for time controls
  useEffect(() => {
    if (disabledShortcuts) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        onTogglePlay?.();
      } else if (e.code === 'ArrowRight' || e.code === 'Enter') {
        e.preventDefault();
        if (!isRunning && !state.ended) {
          onNextDay?.();
        }
      } else if (e.key === '1') {
        onSpeedChange?.(200);
      } else if (e.key === '2') {
        onSpeedChange?.(800);
      } else if (e.key === '3') {
        onSpeedChange?.(1200);
      } else if (e.key === 'Escape') {
        onEscape?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [disabledShortcuts, isRunning, state.ended, onTogglePlay, onNextDay, onSpeedChange, onEscape]);

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
        <div className="flex items-center gap-2.5 flex-shrink-0">
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

        {/* Time Engine Controls */}
        {onTogglePlay && onNextDay && (
          <div className="flex items-center gap-1.5 bg-slate-950/70 p-1 rounded-2xl border border-slate-800 shadow-inner flex-shrink-0">
            {/* Play/Pause Button */}
            <button
              onClick={onTogglePlay}
              disabled={state.ended}
              className={cn(
                'py-1.5 px-3 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-md',
                isRunning ? 'btn-warning' : 'btn-success'
              )}
              title={isRunning ? 'หยุดชั่วคราว (Space)' : 'เล่นต่อเนื่อง (Space)'}
            >
              <span>{isRunning ? '⏸️' : '▶️'}</span>
              <span className="hidden xl:inline">{isRunning ? 'หยุด' : 'เดินเวลา'}</span>
            </button>

            {/* +1 Day Step Button */}
            <button
              onClick={onNextDay}
              disabled={isRunning || state.ended}
              className="btn-primary py-1.5 px-3 text-xs"
              title="ก้าวไปข้างหน้า 1 วัน (Enter หรือ →)"
            >
              <span>⏩</span>
              <span>+1 วัน</span>
            </button>

            {/* Speed Selectors: 1x, 2x, 4x */}
            {onSpeedChange && (
              <div className="hidden sm:flex items-center gap-0.5 bg-slate-900/90 p-0.5 rounded-xl border border-slate-800/80">
                {[
                  { label: '1x', val: 200 },
                  { label: '2x', val: 800 },
                  { label: '4x', val: 1200 },
                ].map((s) => {
                  const isActive = Math.abs(sliderSpeed - s.val) < 250;
                  return (
                    <button
                      key={s.label}
                      onClick={() => onSpeedChange(s.val)}
                      className={`px-2 py-0.5 rounded-lg font-mono text-[10px] font-bold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {s.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Center: Vaccine Primary Goal Capsule */}
        <VaccineResearchHUD state={state} onInvestResearch={onInvestResearch} />

        {/* Right: Vital Stats & Actions */}
        <div className="order-2 md:order-3 flex items-center gap-1.5 sm:gap-2 text-xs">
          {/* Budget */}
          <div className="chip-stat" title="งบประมาณคงเหลือ">
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
          <div className="chip-stat hidden lg:flex flex-col" title="จำนวนผู้เสียชีวิตรวม">
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
            className="btn-nav"
            title="เปิดอ่านคู่มือและเงื่อนไขแพ้ชนะ"
          >
            📖
          </button>

          {/* New Game Button */}
          <button
            onClick={onNewGame}
            className="btn-nav"
            title="เริ่มเกมใหม่ / ปรับระดับความยาก"
          >
            🔄
          </button>

          {/* Main Menu Button */}
          {onReturnToMenu && (
            <button
              onClick={onReturnToMenu}
              className="btn-nav"
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
