'use client';

import { useState } from 'react';
import { COLLAPSE_FRACTION } from '../lib/constants';
import { getConnectedProvinces, getProvinceById } from '../lib/simulation';
import { ActionType, GameState } from '../lib/types';
import { ActionInfoGuide } from './shared/ActionInfoGuide';
import { NeighborQuickJump } from './shared/NeighborQuickJump';
import { PopulationSegmentBar } from './shared/PopulationSegmentBar';
import { ProvinceActionGrid } from './shared/ProvinceActionGrid';
import { UnrestMeter } from './shared/UnrestMeter';

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

  // Find connected neighboring provinces via simulation logic
  const neighbors = getConnectedProvinces(province.id);

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="h-full w-72 sm:w-80 bg-slate-900/95 border-l border-slate-700/80 shadow-2xl backdrop-blur-2xl text-slate-100 flex flex-col justify-between p-3.5 sm:p-4 select-none animate-fadeIn overflow-y-auto"
    >
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
            className="btn-close"
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
              <div className="text-[10px] text-zinc-400">ประชากรเสียชีวิตเกิน {Math.round(COLLAPSE_FRACTION * 100)}%</div>
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
        <PopulationSegmentBar
          total={province.pop}
          infected={pState.infected}
          recovered={pState.recovered}
          vaccinated={pState.vaccinated}
          dead={pState.dead}
        />

        {/* Unrest Bar */}
        <UnrestMeter unrest={pState.unrest} />

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
          {showInfo && <ActionInfoGuide />}

          {/* Action Grid Custom Component */}
          <ProvinceActionGrid
            provinceId={province.id}
            provinceState={pState}
            budget={state.budget}
            isGameEnded={state.ended}
            onDeployAction={onDeployAction}
          />
        </div>
      </div>

      {/* Connected Neighbor Provinces Custom Component */}
      <NeighborQuickJump
        neighbors={neighbors}
        provinceStates={state.provinces}
        onSelectProvince={onSelectProvince}
      />
    </div>
  );
}
