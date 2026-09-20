'use client';

import { ACTIONS, UNREST_RIOT_THRESHOLD } from '../lib/constants';
import { getProvinceById, getSusceptible } from '../lib/simulation';
import { ActionType, GameState } from '../lib/types';

interface ProvincePanelProps {
  provinceId: string | null;
  state: GameState;
  onDeployAction: (provinceId: string, actionKey: ActionType) => void;
  onClose?: () => void;
}

export function ProvincePanel({
  provinceId,
  state,
  onDeployAction,
  onClose,
}: ProvincePanelProps) {
  if (!provinceId) {
    return (
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 text-center flex flex-col items-center justify-center h-full min-h-[320px] text-slate-500 shadow-xl">
        <div className="text-4xl mb-3 opacity-60">📍</div>
        <p className="font-medium text-slate-400 text-sm">คลิกเลือกจังหวัดบนแผนที่</p>
        <p className="text-xs text-slate-600 mt-1 max-w-[200px]">
          เพื่อตรวจสอบข้อมูลประชากร ระดับความไม่พอใจ และสั่งการส่งหน่วยงาน
        </p>
      </div>
    );
  }

  const province = getProvinceById(provinceId);
  const pState = state.provinces[provinceId];
  if (!province || !pState) return null;

  const susceptible = getSusceptible(province.pop, pState);
  const susceptiblePct = ((susceptible / province.pop) * 100).toFixed(1);
  const infectedPct = ((pState.infected / province.pop) * 100).toFixed(1);
  const deadPct = ((pState.dead / province.pop) * 100).toFixed(2);
  const unrestPct = Math.round(pState.unrest);

  const canDeploy = !state.ended && !pState.rioting && !pState.collapsed;

  return (
    <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col gap-4 text-slate-200">
      {/* Province Header */}
      <div className="flex items-start justify-between border-b border-slate-800/80 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white">{province.name}</h2>
            {province.hub && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 font-semibold border border-sky-500/30">
                HUB
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400">{province.nameEn} • ประชากร {province.pop.toLocaleString()} คน</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            ✕
          </button>
        )}
      </div>

      {/* Status Badges */}
      {pState.collapsed ? (
        <div className="bg-zinc-950 border border-zinc-700 text-zinc-300 px-3 py-2 rounded-xl text-xs flex items-center gap-2">
          <span className="text-lg">💀</span>
          <div>
            <div className="font-bold text-white">เขตมรณะ (ล่มสลาย)</div>
            <div className="text-[11px] text-zinc-400">ประชากรเสียชีวิตเกิน 90% ระบบสาธารณสุขล่มสลายถาวร</div>
          </div>
        </div>
      ) : pState.rioting ? (
        <div className="bg-rose-950/80 border border-rose-600 text-rose-200 px-3 py-2 rounded-xl text-xs flex items-center gap-2 animate-pulse">
          <span className="text-lg">🔥</span>
          <div>
            <div className="font-bold text-rose-300">เกิดการจลาจลรุนแรง!</div>
            <div className="text-[11px] text-rose-400">ความไม่พอใจเกินเกณฑ์ ไม่สามารถส่งหน่วยงานเข้าพื้นที่ได้</div>
          </div>
        </div>
      ) : null}

      {/* Population breakdown grid */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-slate-950/60 border border-slate-800/60 rounded-xl p-2.5">
          <div className="text-[10px] text-slate-400 uppercase font-semibold">ยังไม่ติดเชื้อ (เสี่ยง)</div>
          <div className="text-base font-bold text-slate-300 mt-0.5">
            {Math.round(susceptible).toLocaleString()} คน
          </div>
          <div className="text-[10px] text-slate-500">{susceptiblePct}% ของประชากร</div>
        </div>

        <div className="bg-slate-950/60 border border-slate-800/60 rounded-xl p-2.5">
          <div className="text-[10px] text-rose-400 uppercase font-semibold">ผู้ติดเชื้อปัจจุบัน</div>
          <div className="text-base font-bold text-rose-400 mt-0.5">
            {Math.round(pState.infected).toLocaleString()} คน
          </div>
          <div className="text-[10px] text-slate-400">{infectedPct}% ของประชากร</div>
        </div>

        <div className="bg-slate-950/60 border border-slate-800/60 rounded-xl p-2.5">
          <div className="text-[10px] text-emerald-400 uppercase font-semibold">รักษาหายแล้ว</div>
          <div className="text-base font-bold text-emerald-400 mt-0.5">
            {Math.round(pState.recovered).toLocaleString()} คน
          </div>
          <div className="text-[10px] text-slate-400">ภูมิคุ้มกันชั่วคราว</div>
        </div>

        <div className="bg-slate-950/60 border border-slate-800/60 rounded-xl p-2.5">
          <div className="text-[10px] text-indigo-400 uppercase font-semibold">ฉีดวัคซีนแล้ว</div>
          <div className="text-base font-bold text-indigo-400 mt-0.5">
            {Math.round(pState.vaccinated).toLocaleString()} คน
          </div>
          <div className="text-[10px] text-slate-400">ภูมิคุ้มกันถาวร</div>
        </div>

        <div className="bg-slate-950/60 border border-slate-800/60 rounded-xl p-2.5 col-span-2 sm:col-span-1">
          <div className="text-[10px] text-slate-400 uppercase font-semibold">เสียชีวิตสะสม</div>
          <div className="text-base font-bold text-slate-300 mt-0.5">
            💀 {Math.round(pState.dead).toLocaleString()} คน
          </div>
          <div className="text-[10px] text-slate-500">{deadPct}% ของประชากร</div>
        </div>
      </div>

      {/* Unrest Meter */}
      <div className="space-y-1.5 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/60">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-300 flex items-center gap-1.5">
            <span>😡 ความไม่พอใจประชาชน (Unrest)</span>
          </span>
          <span
            className={`font-bold font-mono ${
              unrestPct >= UNREST_RIOT_THRESHOLD
                ? 'text-rose-400'
                : unrestPct >= 40
                ? 'text-amber-400'
                : 'text-emerald-400'
            }`}
          >
            {unrestPct} / 100
          </span>
        </div>
        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden relative">
          <div
            className={`h-full transition-all duration-300 ${
              unrestPct >= UNREST_RIOT_THRESHOLD
                ? 'bg-rose-500'
                : unrestPct >= 40
                ? 'bg-amber-500'
                : 'bg-emerald-500'
            }`}
            style={{ width: `${unrestPct}%` }}
          />
          {/* Riot threshold marker at 70% */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-red-400 z-10"
            style={{ left: '70%' }}
            title="ขีดจำกัดจลาจล (70%)"
          />
        </div>
        <div className="flex justify-between text-[10px] text-slate-500">
          <span>สงบ</span>
          <span className="text-rose-400">ขีดจำกัดจลาจล 70%</span>
          <span>วิกฤต</span>
        </div>
      </div>

      {/* Deployment Actions Panel */}
      <div className="space-y-2">
        <div className="text-xs font-semibold text-slate-300 flex items-center justify-between">
          <span>🚀 คำสั่งส่งหน่วยงาน</span>
          {!canDeploy && (
            <span className="text-[10px] text-rose-400 font-normal">
              {pState.rioting ? '(ถูกระงับเนื่องจากจลาจล)' : '(ไม่พร้อมใช้งาน)'}
            </span>
          )}
        </div>

        <div className="space-y-2">
          {(Object.keys(ACTIONS) as ActionType[]).map((actionKey) => {
            const action = ACTIONS[actionKey];
            const activeDays = pState.measures[actionKey] ?? 0;
            const isActive = activeDays > 0;
            const hasBudget = state.budget >= action.cost;
            const isButtonDisabled = !canDeploy || !hasBudget;

            return (
              <div
                key={actionKey}
                className={`p-2.5 rounded-xl border transition-all ${
                  isActive
                    ? 'bg-indigo-950/40 border-indigo-500/50'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{action.icon}</span>
                    <div>
                      <div className="font-semibold text-xs text-white flex items-center gap-1.5">
                        <span>{action.name}</span>
                        {isActive && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/30 text-indigo-300 font-mono border border-indigo-500/40">
                            เหลือ {activeDays} วัน
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 leading-tight mt-0.5">
                        {action.desc}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onDeployAction(province.id, actionKey)}
                    disabled={isButtonDisabled}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95 cursor-pointer disabled:cursor-not-allowed whitespace-nowrap ${
                      isActive
                        ? 'bg-indigo-600/60 hover:bg-indigo-600 text-white'
                        : 'bg-slate-800 hover:bg-slate-700 disabled:bg-slate-900 disabled:text-slate-600 text-slate-200 border border-slate-700'
                    }`}
                  >
                    {isActive ? `ต่ออายุ (${action.cost}G)` : `ส่ง (${action.cost}G)`}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
