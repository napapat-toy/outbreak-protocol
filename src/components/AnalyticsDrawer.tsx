'use client';

import { useState } from 'react';
import { PROVINCES } from '../lib/constants';
import { GameLogEvent, GameState } from '../lib/types';
import { cn } from '../lib/utils';
import { EpidemicChart } from './EpidemicChart';
import { EventLog } from './EventLog';
import { ProvinceStatsTable } from './shared/ProvinceStatsTable';

interface AnalyticsDrawerProps {
  isOpen: boolean;
  state: GameState;
  events: GameLogEvent[];
  onClose: () => void;
  onSelectProvince?: (provinceId: string) => void;
  selectedProvinceId?: string | null;
}

export function AnalyticsDrawer({
  isOpen,
  state,
  events,
  onClose,
  onSelectProvince,
  selectedProvinceId,
}: AnalyticsDrawerProps) {
  const [activeTab, setActiveTab] = useState<'chart' | 'provinces' | 'logs'>('chart');

  if (!isOpen) return null;

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer-box" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="panel-header">
          <div className="flex items-center gap-2">
            <span className="text-xl">📊</span>
            <div>
              <h2 className="font-bold text-sm text-white">ศูนย์วิเคราะห์และสถิติระบาดวิทยา</h2>
              <p className="text-[11px] text-slate-400">ข้อมูลเชิงลึกและบันทึกสถานการณ์</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn-close"
            title="ปิดหน้าต่าง"
          >
            ✕
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 p-1 gap-1 text-xs">
          <button
            onClick={() => setActiveTab('chart')}
            className={cn('btn-tab', activeTab === 'chart' ? 'btn-tab-active' : 'btn-tab-inactive')}
          >
            📈 กราฟการระบาด
          </button>
          <button
            onClick={() => setActiveTab('provinces')}
            className={cn('btn-tab', activeTab === 'provinces' ? 'btn-tab-active' : 'btn-tab-inactive')}
          >
            📍 ตาราง 10 จังหวัด
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={cn('btn-tab', activeTab === 'logs' ? 'btn-tab-active' : 'btn-tab-inactive')}
          >
            📡 ข่าวกรอง & Logs
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col min-h-0 space-y-4">
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
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                <span>คลิกที่หัวตารางเพื่อจัดเรียง • คลิกที่แถวจังหวัดเพื่อดูบนแผนที่</span>
              </div>
              <ProvinceStatsTable
                provinces={PROVINCES}
                provinceStates={state.provinces}
                selectedProvinceId={selectedProvinceId}
                onSelectProvince={(id) => {
                  onSelectProvince?.(id);
                  onClose();
                }}
              />
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="flex-1 flex flex-col min-h-0 h-full">
              <EventLog events={events} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
