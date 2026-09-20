'use client';

interface PopulationSegmentBarProps {
  total: number;
  infected: number;
  recovered: number;
  vaccinated: number;
  dead: number;
  showDetails?: boolean;
}

export function PopulationSegmentBar({
  total,
  infected,
  recovered,
  vaccinated,
  dead,
  showDetails = true,
}: PopulationSegmentBarProps) {
  const infPct = total > 0 ? (infected / total) * 100 : 0;
  const deadPct = total > 0 ? (dead / total) * 100 : 0;
  const vaccPct = total > 0 ? (vaccinated / total) * 100 : 0;
  const recPct = total > 0 ? (recovered / total) * 100 : 0;
  const healthyPct = Math.max(0, 100 - infPct - deadPct - vaccPct - recPct);
  const susceptible = Math.max(0, total - infected - recovered - dead - vaccinated);

  return (
    <div className="space-y-1.5 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/60 select-none">
      {showDetails && (
        <div className="flex items-center justify-between text-[10px] font-mono">
          <span className="text-slate-300">
            ติดเชื้อ: <strong className="text-rose-400 font-bold">{Math.round(infected).toLocaleString()}</strong>
          </span>
          <span className="text-slate-400 font-medium">
            {infPct.toFixed(1)}% ของพื้นที่
          </span>
        </div>
      )}

      {/* Single Segmented Bar */}
      <div className="w-full h-2 rounded-full overflow-hidden flex bg-slate-950 border border-slate-800">
        <div style={{ width: `${infPct}%` }} className="bg-rose-500 transition-all duration-300" title="ติดเชื้อ" />
        <div style={{ width: `${recPct}%` }} className="bg-amber-400 transition-all duration-300" title="หายป่วย" />
        <div style={{ width: `${vaccPct}%` }} className="bg-indigo-400 transition-all duration-300" title="ฉีดวัคซีน" />
        <div style={{ width: `${deadPct}%` }} className="bg-zinc-700 transition-all duration-300" title="เสียชีวิต" />
        <div style={{ width: `${healthyPct}%` }} className="bg-emerald-500/70 transition-all duration-300" title="ปลอดภัย" />
      </div>

      {showDetails && (
        <div className="flex justify-between text-[9px] text-slate-400 pt-0.5 font-mono">
          <span className="text-emerald-400">● ปลอดภัย {Math.round(susceptible).toLocaleString()}</span>
          {dead > 0 && <span className="text-slate-400">● ตาย {Math.round(dead).toLocaleString()}</span>}
        </div>
      )}
    </div>
  );
}
