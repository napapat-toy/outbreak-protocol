'use client';


interface GameControlsProps {
  day: number;
  isRunning: boolean;
  sliderSpeed: number; // 200 to 1200
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
  const tickDelay = 1400 - sliderSpeed;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 shadow-lg flex flex-wrap items-center justify-between gap-3 text-sm">
      {/* Primary Action Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={onNextDay}
          disabled={isRunning || isEnded}
          className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 disabled:border-slate-800 text-white font-semibold transition-all border border-indigo-500/50 shadow-md shadow-indigo-950/40 active:scale-95 cursor-pointer disabled:cursor-not-allowed flex items-center gap-1.5"
        >
          <span>⏩</span>
          <span>+1 วัน</span>
        </button>

        <button
          onClick={onTogglePlay}
          disabled={isEnded}
          className={`px-4 py-2 rounded-lg font-semibold transition-all border shadow-md active:scale-95 cursor-pointer disabled:cursor-not-allowed flex items-center gap-1.5 ${
            isRunning
              ? 'bg-amber-600 hover:bg-amber-500 text-white border-amber-500 shadow-amber-950/40'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500 shadow-emerald-950/40'
          }`}
        >
          <span>{isRunning ? '⏸️' : '▶️'}</span>
          <span>{isRunning ? 'หยุดชั่วคราว' : 'เล่นต่อเนื่อง'}</span>
        </button>
      </div>

      {/* Speed Slider & Day Status */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">ความเร็ว:</span>
          <input
            type="range"
            min={200}
            max={1200}
            step={50}
            value={sliderSpeed}
            onChange={(e) => onSpeedChange(Number(e.target.value))}
            className="w-24 sm:w-32 accent-indigo-500 cursor-pointer"
            title={`รอบละ ${tickDelay} ms`}
          />
          <span className="text-[11px] font-mono text-slate-400 min-w-[52px]">
            {(1000 / tickDelay).toFixed(1)}x/วินาที
          </span>
        </div>

        <div className="h-4 w-px bg-slate-800 hidden sm:block" />

        <div className="flex items-center gap-2">
          <div
            className={`w-2.5 h-2.5 rounded-full ${
              isEnded
                ? 'bg-rose-500'
                : isRunning
                ? 'bg-emerald-400 animate-pulse'
                : 'bg-slate-500'
            }`}
          />
          <span className="text-xs text-slate-300 font-mono">
            {isEnded ? 'จบเกม' : isRunning ? `กำลังจำลอง... (วันที่ ${day})` : `พร้อมเดินหน้า (วันที่ ${day})`}
          </span>
        </div>
      </div>
    </div>
  );
}
