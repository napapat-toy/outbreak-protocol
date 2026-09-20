'use client';

import { GameLogEvent } from '../lib/types';

interface EventLogProps {
  events: GameLogEvent[];
}

export function EventLog({ events }: EventLogProps) {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col gap-2.5 h-full flex-1 min-h-0">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
        <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
          <span>📡 บันทึกรายงานสถานการณ์ (Live Intel)</span>
        </span>
        <span className="text-[10px] text-slate-500 font-mono">
          {events.length} เหตุการณ์
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-xs">
        {events.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs">
            ยังไม่มีเหตุการณ์ผิดปกติ
          </div>
        ) : (
          events.map((evt) => {
            const badgeStyles = {
              danger: 'bg-rose-950/60 text-rose-300 border-rose-800/50',
              warn: 'bg-amber-950/60 text-amber-300 border-amber-800/50',
              success: 'bg-emerald-950/60 text-emerald-300 border-emerald-800/50',
              action: 'bg-sky-950/60 text-sky-300 border-sky-800/50',
              info: 'bg-slate-800/60 text-slate-300 border-slate-700/50',
            }[evt.type] || 'bg-slate-800 text-slate-300';

            return (
              <div
                key={evt.id}
                className={`p-2 rounded-xl border text-[11px] leading-relaxed transition-all flex items-start gap-2 ${badgeStyles}`}
              >
                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-black/40 text-slate-400 shrink-0">
                  D{evt.day}
                </span>
                <span className="flex-1">{evt.text}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
