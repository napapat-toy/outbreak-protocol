'use client';

import { useState } from 'react';
import { ACTIONS, CONNECTIONS, PROVINCES, UNREST_RIOT_THRESHOLD } from '../lib/constants';
import { getProvinceById, getSusceptible } from '../lib/simulation';
import { ActionType, GameState } from '../lib/types';

interface ProvinceFloatingMenuProps {
  provinceId: string | null;
  state: GameState;
  onDeployAction: (provinceId: string, actionKey: ActionType) => void;
  onClose: () => void;
  onSelectProvince?: (provinceId: string) => void;
}

export function ProvinceFloatingMenu({
  provinceId,
  state,
  onDeployAction,
  onClose,
  onSelectProvince,
}: ProvinceFloatingMenuProps) {
  const [showInfo, setShowInfo] = useState(false);

  if (!provinceId) return null;

  const province = getProvinceById(provinceId);
  const pState = state.provinces[provinceId];
  if (!province || !pState) return null;

  const susceptible = getSusceptible(province.pop, pState);
  const total = province.pop;

  // Segmented health bar percentages
  const infPct = (pState.infected / total) * 100;
  const deadPct = (pState.dead / total) * 100;
  const vaccPct = (pState.vaccinated / total) * 100;
  const recPct = (pState.recovered / total) * 100;
  const healthyPct = Math.max(0, 100 - infPct - deadPct - vaccPct - recPct);

  const unrestVal = Math.round(pState.unrest);
  const canDeployStandard = !state.ended && !pState.rioting && !pState.collapsed;
  const canDeployRelief = !state.ended && !pState.collapsed;

  // Find connected neighboring provinces
  const neighborIds = CONNECTIONS
    .filter(([a, b]) => a === province.id || b === province.id)
    .map(([a, b]) => (a === province.id ? b : a));
  const neighbors = neighborIds
    .map((id) => PROVINCES.find((p) => p.id === id))
    .filter(Boolean);

  return (
    <div className="h-full w-72 sm:w-80 bg-slate-900/95 border-l border-slate-700/80 shadow-2xl backdrop-blur-2xl text-slate-100 flex flex-col justify-between p-3.5 sm:p-4 select-none animate-fadeIn overflow-y-auto">
      <div className="flex flex-col gap-3">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800/80 pb-2.5">
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-base text-white tracking-wide">{province.name}</h3>
              {province.hub && (
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 font-bold border border-sky-500/30">
                  HUB
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              {province.nameEn} • {province.pop.toLocaleString()} คน
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800/80 cursor-pointer text-xs transition-colors"
            title="ปิดหน้าต่าง"
          >
            ✕
          </button>
        </div>

        {/* Emergency Status Alert */}
        {pState.collapsed ? (
          <div className="bg-zinc-950 border border-zinc-700 text-zinc-300 px-2.5 py-1.5 rounded-xl text-[11px] flex items-center gap-2">
            <span className="text-base">💀</span>
            <div>
              <div className="font-bold text-white">เขตมรณะ</div>
              <div className="text-[10px] text-zinc-400">ประชากรเสียชีวิตเกิน 90%</div>
            </div>
          </div>
        ) : pState.rioting ? (
          <div className="bg-rose-950/80 border border-rose-600/80 text-rose-200 px-2.5 py-2 rounded-xl text-[11px] flex items-start gap-2 shadow-lg shadow-rose-950/50">
            <span className="text-base animate-bounce-subtle">🔥</span>
            <div className="flex-1">
              <div className="font-bold text-rose-300">เกิดการจลาจล!</div>
              <div className="text-[10px] text-rose-200/90 leading-tight">
                ส่ง 3 หน่วยงานหลักไม่ได้ แต่ส่ง <strong>[📦 เยียวยาฉุกเฉิน]</strong> เพื่อลด Unrest ได้
              </div>
            </div>
          </div>
        ) : null}

        {/* Segmented Population Bar */}
        <div className="space-y-1.5 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/60">
          <div className="flex items-center justify-between text-[10px] font-mono">
            <span className="text-slate-300">
              ติดเชื้อ: <strong className="text-rose-400 font-bold">{Math.round(pState.infected).toLocaleString()}</strong>
            </span>
            <span className="text-slate-400 font-medium">
              {infPct.toFixed(1)}% ของพื้นที่
            </span>
          </div>

          {/* Single Segmented Bar */}
          <div className="w-full h-2 rounded-full overflow-hidden flex bg-slate-950 border border-slate-800">
            <div style={{ width: `${infPct}%` }} className="bg-rose-500" title="ติดเชื้อ" />
            <div style={{ width: `${recPct}%` }} className="bg-amber-400" title="หายป่วย" />
            <div style={{ width: `${vaccPct}%` }} className="bg-indigo-400" title="ฉีดวัคซีน" />
            <div style={{ width: `${deadPct}%` }} className="bg-zinc-700" title="เสียชีวิต" />
            <div style={{ width: `${healthyPct}%` }} className="bg-emerald-500/70" title="ปลอดภัย" />
          </div>

          <div className="flex justify-between text-[9px] text-slate-400 pt-0.5 font-mono">
            <span className="text-emerald-400">● ปลอดภัย {Math.round(susceptible).toLocaleString()}</span>
            {pState.dead > 0 && <span className="text-slate-400">● ตาย {Math.round(pState.dead).toLocaleString()}</span>}
          </div>
        </div>

        {/* Unrest Bar */}
        <div className="space-y-1 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/60 text-[10px]">
          <div className="flex items-center justify-between">
            <span className="text-slate-300 flex items-center gap-1.5">
              <span className="text-xs">{unrestVal >= UNREST_RIOT_THRESHOLD ? '😡' : unrestVal >= 40 ? '😐' : '🙂'}</span>
              <span className="font-medium">ความไม่พอใจ (Unrest)</span>
            </span>
            <span
              className={`font-mono font-bold ${
                unrestVal >= UNREST_RIOT_THRESHOLD
                  ? 'text-rose-400 animate-pulse'
                  : unrestVal >= 40
                  ? 'text-amber-400'
                  : 'text-emerald-400'
              }`}
            >
              {unrestVal}% {unrestVal >= UNREST_RIOT_THRESHOLD && '(จลาจล)'}
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden relative">
            <div
              className={`h-full transition-all duration-300 ${
                unrestVal >= UNREST_RIOT_THRESHOLD
                  ? 'bg-rose-500'
                  : unrestVal >= 40
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${unrestVal}%` }}
            />
          </div>
        </div>

        {/* 4 Minimal Actions */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
              มาตรการสั่งการ:
            </div>
            <button
              onClick={() => setShowInfo((prev) => !prev)}
              className="text-[10px] text-sky-400 hover:text-sky-300 flex items-center gap-1 cursor-pointer transition-colors px-1.5 py-0.5 rounded hover:bg-slate-800"
              title="ดูคำอธิบายแต่ละหน่วยงาน"
            >
              <span>ℹ️</span>
              <span>{showInfo ? 'ซ่อนคำแนะนำ' : 'วิธีใช้'}</span>
            </button>
          </div>

          {/* Collapsible Quick Info Guide */}
          {showInfo && (
            <div className="bg-slate-950/80 border border-slate-800 p-2.5 rounded-xl text-[10px] text-slate-300 space-y-1.5 animate-fadeIn">
              <div className="flex items-center gap-1.5 text-white font-semibold">
                <span>🏥</span> สาธารณสุข (15G) : ลดการแพร่เชื้อในจังหวัด
              </div>
              <div className="flex items-center gap-1.5 text-white font-semibold">
                <span>🚧</span> ปิดด่าน (20G) : ตัดเส้นทางระบาดสู่จังหวัดข้างเคียง 50%
              </div>
              <div className="flex items-center gap-1.5 text-white font-semibold">
                <span>🚑</span> ทีมแพทย์ (25G) : เร่งรักษาหาย 3 เท่า + ลดอัตราตาย
              </div>
              <div className="flex items-center gap-1.5 text-amber-300 font-semibold">
                <span>📦</span> เยียวยา (20G) : ลด Unrest ทันที 25% (ใช้สยบจลาจล)
              </div>
            </div>
          )}

          {/* Action Grid */}
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(ACTIONS) as ActionType[]).map((actionKey) => {
              const action = ACTIONS[actionKey];
              const isRelief = actionKey === 'relief';
              const activeDays = pState.measures[actionKey] ?? 0;
              const isActive = activeDays > 0;
              const hasBudget = state.budget >= action.cost;
              const canDeploy = isRelief ? canDeployRelief : canDeployStandard;
              const isDisabled = !canDeploy || !hasBudget;

              const isReliefHighlight = isRelief && pState.rioting && hasBudget;

              return (
                <button
                  key={actionKey}
                  onClick={() => onDeployAction(province.id, actionKey)}
                  disabled={isDisabled}
                  className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 text-center transition-all cursor-pointer active:scale-95 disabled:cursor-not-allowed relative ${
                    isReliefHighlight
                      ? 'bg-amber-950/70 border-amber-400 text-amber-200 ring-2 ring-amber-500/40 shadow-lg shadow-amber-950/50 animate-pulse'
                      : isActive
                      ? 'bg-indigo-950/80 border-indigo-400 text-white shadow-md shadow-indigo-950/50'
                      : 'bg-slate-950/80 border-slate-800 hover:border-slate-600 disabled:bg-slate-900/50 disabled:border-slate-850 text-slate-200 disabled:text-slate-600'
                  }`}
                >
                  <span className="text-xl">{action.icon}</span>
                  <span className="text-[11px] font-bold truncate max-w-full">
                    {actionKey === 'health'
                      ? 'สาธารณสุข'
                      : actionKey === 'checkpoint'
                      ? 'ปิดด่าน'
                      : actionKey === 'medical'
                      ? 'ทีมแพทย์'
                      : 'เยียวยาฉุกเฉิน'}
                  </span>
                  <span
                    className={`text-[9px] font-mono font-semibold ${
                      isReliefHighlight
                        ? 'text-amber-300'
                        : isActive
                        ? 'text-indigo-300'
                        : hasBudget
                        ? 'text-slate-400'
                        : 'text-rose-500/70'
                    }`}
                  >
                    {isActive
                      ? `เหลือ ${activeDays} วัน`
                      : isRelief
                      ? `${action.cost}G • ลด 25%`
                      : `${action.cost}G • 5 วัน`}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Connected Neighbor Provinces (Tactical Quick-Jump) */}
      {neighbors.length > 0 && (
        <div className="pt-3 mt-2 border-t border-slate-800/80">
          <div className="text-[10px] font-semibold text-slate-400 mb-1.5">
            เส้นทางเชื่อมต่อ ({neighbors.length}):
          </div>
          <div className="flex flex-wrap gap-1.5">
            {neighbors.map((n) => {
              if (!n) return null;
              const nState = state.provinces[n.id];
              const isNRioting = nState?.rioting;
              const isNInfected = (nState?.infected ?? 0) > 100;

              return (
                <button
                  key={n.id}
                  onClick={() => onSelectProvince?.(n.id)}
                  className={`text-[10px] px-2 py-1 rounded-lg border flex items-center gap-1 transition-all cursor-pointer active:scale-95 ${
                    isNRioting
                      ? 'bg-rose-950/40 border-rose-800/60 text-rose-300 hover:border-rose-600'
                      : isNInfected
                      ? 'bg-amber-950/40 border-amber-800/60 text-amber-300 hover:border-amber-600'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                  }`}
                  title={`สลับมุมมองไปยัง ${n.name}`}
                >
                  <span>{isNRioting ? '🔥' : isNInfected ? '⚠️' : '📍'}</span>
                  <span>{n.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
