'use client';

interface GameControlsProps {
  day: number;
  isRunning: boolean;
  sliderSpeed: number; // 200 (1x), 800 (2x), 1200 (4x)
  isEnded: boolean;
  onNextDay: () => void;
  onTogglePlay: () => void;
  onSpeedChange: (speed: number) => void;
}

export function GameControls({
  day,
  isRunning,
  sliderSpeed,
  isEnded,
  onNextDay,
  onTogglePlay,
  onSpeedChange,
}: GameControlsProps) {
  // Speed options mapping: label -> sliderSpeed value
  const SPEEDS = [
    { label: '1x', val: 200 },
    { label: '2x', val: 800 },
    { label: '4x', val: 1200 },
  ];

  return (
    <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-2 sm:px-4 sm:py-2.5 shadow-2xl backdrop-blur-xl flex items-center justify-between sm:justify-center gap-2 sm:gap-4 text-xs select-none">
      {/* Play/Pause Button */}
      <button
        onClick={onTogglePlay}
        disabled={isEnded}
        className={`px-3.5 py-2 rounded-xl font-bold transition-all border shadow-lg active:scale-95 cursor-pointer disabled:cursor-not-allowed flex items-center gap-1.5 ${
          isRunning
            ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 border-amber-400 shadow-amber-950/40'
            : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500 shadow-emerald-950/40'
        }`}
      >
        <span>{isRunning ? '⏸️' : '▶️'}</span>
        <span className="hidden sm:inline">{isRunning ? 'หยุดชั่วคราว' : 'เล่นต่อเนื่อง'}</span>
      </button>

      {/* Step +1 Day Button */}
      <button
        onClick={onNextDay}
        disabled={isRunning || isEnded}
        className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 disabled:border-slate-800 text-white font-bold transition-all border border-indigo-500/50 shadow-lg shadow-indigo-950/50 active:scale-95 cursor-pointer disabled:cursor-not-allowed flex items-center gap-1.5"
      >
        <span>⏩</span>
        <span>+1 วัน</span>
      </button>

      <div className="h-5 w-px bg-slate-800 hidden sm:block" />

      {/* Discrete Speed Selectors: 1x, 2x, 4x */}
      <div className="flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
        {SPEEDS.map((s) => {
          const isActive = Math.abs(sliderSpeed - s.val) < 250;
          return (
            <button
              key={s.label}
              onClick={() => onSpeedChange(s.val)}
              className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-bold transition-all cursor-pointer ${
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

      {/* Status indicator */}
      <div className="hidden md:flex items-center gap-2 pl-1 font-mono text-[11px] text-slate-400">
        <div
          className={`w-2 h-2 rounded-full ${
            isEnded
              ? 'bg-rose-500'
              : isRunning
              ? 'bg-emerald-400 animate-pulse'
              : 'bg-slate-600'
          }`}
        />
        <span>วันที่ {day}</span>
      </div>
    </div>
  );
}
