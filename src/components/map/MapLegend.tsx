'use client';

const LEGEND_ITEMS = [
  { color: 'bg-emerald-500', label: '< 1% ปลอดภัย' },
  { color: 'bg-amber-500', label: '1% - 10% เฝ้าระวัง' },
  { color: 'bg-rose-500', label: '> 10% วิกฤต' },
  { color: 'bg-red-600', label: '🔥 จลาจล' },
  { color: 'bg-cyan-400', label: 'จุดตรวจ/ปิดด่าน', isLine: true },
];

export function MapLegend() {
  return (
    <div className="absolute top-3 left-3 bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 text-[11px] backdrop-blur-md z-10 text-slate-400 space-y-1 shadow-lg hidden sm:block select-none">
      <div className="font-semibold text-slate-300 text-xs mb-1 flex items-center gap-1.5">
        <span>🗺️ ระดับการระบาด</span>
      </div>
      {LEGEND_ITEMS.map((item) => (
        <div
          key={item.label}
          className={`flex items-center gap-2 ${item.isLine ? 'pt-0.5 border-t border-slate-800' : ''}`}
        >
          <span
            className={`${item.isLine ? 'w-3.5 h-0.5' : 'w-2.5 h-2.5 rounded-full'} ${item.color} inline-block`}
          />
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}
