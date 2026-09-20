'use client';

interface MapControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
}

export function MapControls({ zoom, onZoomIn, onZoomOut, onResetView }: MapControlsProps) {
  return (
    <div
      onMouseDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
      className="absolute bottom-4 left-4 z-10 flex flex-col items-center gap-1 bg-slate-900/90 border border-slate-700/80 rounded-2xl p-1 shadow-2xl backdrop-blur-md select-none"
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onZoomIn();
        }}
        className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center font-bold text-xs sm:text-sm transition-all cursor-pointer active:scale-90"
        title="ซูมเข้า (+)"
      >
        ➕
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onZoomOut();
        }}
        className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center font-bold text-xs sm:text-sm transition-all cursor-pointer active:scale-90"
        title="ซูมออก (-)"
      >
        ➖
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onResetView();
        }}
        className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center text-[10px] font-mono transition-all cursor-pointer active:scale-90"
        title="รีเซ็ตตำแหน่งแผนที่"
      >
        🎯
      </button>
      <span className="text-[9px] font-mono text-slate-400 py-0.5">
        {Math.round(zoom * 100)}%
      </span>
    </div>
  );
}
