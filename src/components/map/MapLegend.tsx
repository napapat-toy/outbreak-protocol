'use client';

export function MapLegend() {
  return (
    <div className="absolute top-3 left-3 bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 text-[11px] backdrop-blur-md z-10 text-slate-400 space-y-1 shadow-lg hidden sm:block select-none">
      <div className="font-semibold text-slate-300 text-xs mb-1 flex items-center gap-1.5">
        <span>🗺️ ระดับการระบาด</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
        <span>&lt; 1% ปลอดภัย</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
        <span>1% - 10% เฝ้าระวัง</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
        <span>&gt; 10% วิกฤต</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block" />
        <span>🔥 จลาจล</span>
      </div>
      <div className="flex items-center gap-2 pt-0.5 border-t border-slate-800">
        <span className="w-3.5 h-0.5 bg-cyan-400 inline-block" />
        <span>จุดตรวจ/ปิดด่าน</span>
      </div>
    </div>
  );
}
