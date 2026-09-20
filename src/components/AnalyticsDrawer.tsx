'use client';

import { useState } from 'react';
import { PROVINCES } from '../lib/constants';
import { GameLogEvent, GameState } from '../lib/types';
import { EpidemicChart } from './EpidemicChart';
import { EventLog } from './EventLog';

interface AnalyticsDrawerProps {
  isOpen: boolean;
  state: GameState;
  events: GameLogEvent[];
  onClose: () => void;
}

export function AnalyticsDrawer({
  isOpen,
  state,
  events,
  onClose,
}: AnalyticsDrawerProps) {
  const [activeTab, setActiveTab] = useState<'chart' | 'provinces' | 'logs'>('chart');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border-l border-slate-800 w-full max-w-xl h-full shadow-2xl flex flex-col text-slate-100 animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xl">📊</span>
            <div>
              <h2 className="font-bold text-sm text-white">ศูนย์วิเคราะห์และสถิติระบาดวิทยา</h2>
              <p className="text-[11px] text-slate-400">ข้อมูลเชิงลึกและบันทึกสถานการณ์</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 p-1 gap-1 text-xs">
          <button
            onClick={() => setActiveTab('chart')}
            className={`flex-1 py-2 rounded-lg font-semibold transition-all cursor-pointer ${
              activeTab === 'chart'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            📈 กราฟการระบาด
          </button>
          <button
            onClick={() => setActiveTab('provinces')}
            className={`flex-1 py-2 rounded-lg font-semibold transition-all cursor-pointer ${
              activeTab === 'provinces'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            📍 ตาราง 10 จังหวัด
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`flex-1 py-2 rounded-lg font-semibold transition-all cursor-pointer ${
              activeTab === 'logs'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            📡 ข่าวกรอง & Logs
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {activeTab === 'chart' && (
            <div className="space-y-3">
              <EpidemicChart history={state.history} />
              <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-3 text-xs text-slate-400 space-y-1 leading-relaxed">
                <div className="font-bold text-slate-300">💡 การอ่านกราฟการระบาด:</div>
                <p>
                  • เส้นกราฟแสดงสัดส่วนผู้ติดเชื้อสะสมทั้ง 10 จังหวัดตามเวลา<br />
                  • หากเส้นกราฟผ่านจุดสูงสุด (Peak &gt; 1%) และกดลงต่ำกว่า 0.1% ได้หลังวันที่ 6 จะถือว่าสยบการระบาดสำเร็จ (WIN)!
                </p>
              </div>
            </div>
          )}

          {activeTab === 'provinces' && (
            <div className="space-y-2">
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-[10px] uppercase text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="p-2.5 font-bold">จังหวัด</th>
                      <th className="p-2.5 font-bold">ประชากร</th>
                      <th className="p-2.5 font-bold text-rose-400">ติดเชื้อ</th>
                      <th className="p-2.5 font-bold text-emerald-400">หายแล้ว</th>
                      <th className="p-2.5 font-bold text-slate-400">ตาย</th>
                      <th className="p-2.5 font-bold text-amber-400">Unrest</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {PROVINCES.map((p) => {
                      const s = state.provinces[p.id];
                      return (
                        <tr key={p.id} className="hover:bg-slate-800/30">
                          <td className="p-2.5 font-medium text-white flex items-center gap-1.5">
                            {s.collapsed ? '💀' : s.rioting ? '🔥' : '●'}
                            <span>{p.name}</span>
                          </td>
                          <td className="p-2.5 font-mono text-[11px] text-slate-400">
                            {p.pop.toLocaleString()}
                          </td>
                          <td className="p-2.5 font-mono text-[11px] text-rose-400 font-bold">
                            {Math.round(s.infected).toLocaleString()}
                          </td>
                          <td className="p-2.5 font-mono text-[11px] text-emerald-400">
                            {Math.round(s.recovered).toLocaleString()}
                          </td>
                          <td className="p-2.5 font-mono text-[11px] text-slate-400">
                            {Math.round(s.dead).toLocaleString()}
                          </td>
                          <td className="p-2.5 font-mono text-[11px] text-amber-400 font-bold">
                            {Math.round(s.unrest)}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="h-full max-h-[500px]">
              <EventLog events={events} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
