'use client';

import { useState } from 'react';
import { DIFFICULTIES, PATHOGENS, PROVINCES } from '../lib/constants';
import { DifficultyId, PathogenId } from '../lib/types';
import { BaseModal } from './shared/BaseModal';

interface GameSetupModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onStart: (labId: string, pathogenId: PathogenId, difficultyId: DifficultyId) => void;
}

export function GameSetupModal({ isOpen, onClose, onStart }: GameSetupModalProps) {
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyId>('casual');
  const [selectedPathogen, setSelectedPathogen] = useState<PathogenId>('flu');
  const [selectedLabId, setSelectedLabId] = useState<string>('bkk');

  const pathogenList = Object.values(PATHOGENS);
  const difficultyList = Object.values(DIFFICULTIES);

  const renderStatBar = (label: string, value: number) => {
    const barColor =
      value <= 2 ? 'bg-emerald-400' : value <= 3 ? 'bg-amber-400' : 'bg-rose-500';
    return (
      <div className="flex items-center gap-1.5 text-xs">
        <span className="text-slate-300 w-14 flex-shrink-0 text-left whitespace-nowrap font-medium">{label}</span>
        <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden">
          <div
            className={`h-full rounded-full ${barColor}`}
            style={{ width: `${value * 20}%` }}
          />
        </div>
        <span className="text-slate-200 font-mono text-[11px] w-3 text-right font-bold">{value}</span>
      </div>
    );
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-5xl"
      zIndex="z-[60]"
      showCloseButton={Boolean(onClose)}
      className="gap-3 p-5 sm:p-6"
    >
      {/* Title Header */}
      <div className="text-center space-y-1 pb-1">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/15 text-rose-300 text-xs font-bold border border-rose-500/30">
          <span>☣️ DEFCON 1</span>
          <span>•</span>
          <span>ศูนย์บัญชาการแผนเผชิญเหตุโรคระบาด 10 จังหวัดภาคกลาง</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide uppercase">
          ตั้งค่าพารามิเตอร์จำลองสถานการณ์ (Mission Setup)
        </h2>
      </div>

      {/* 1. Difficulty Selection */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs sm:text-sm">
          <label className="font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
            <span>💰 1. ระดับความยาก & งบประมาณสนับสนุน</span>
          </label>
          <span className="text-xs text-slate-400">เลือกโหมดที่เหมาะกับสไตล์คุณ</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {difficultyList.map((d) => {
            const isSelected = selectedDifficulty === d.id;
            return (
              <div
                key={d.id}
                onClick={() => setSelectedDifficulty(d.id)}
                className={`p-3 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-indigo-950/70 border-indigo-500 ring-2 ring-indigo-500/40 shadow-md shadow-indigo-950/40'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">{d.icon}</span>
                    <div className="font-bold text-sm sm:text-base text-white">{d.name}</div>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed min-h-[36px]">
                    {d.desc}
                  </p>
                </div>

                <div className="pt-2 mt-1.5 border-t border-slate-800/80 flex items-center justify-between text-xs sm:text-sm font-mono">
                  <span className="text-amber-400 font-bold">เริ่ม {d.initialBudget}G</span>
                  <span className="text-emerald-400 font-bold">+{d.dailyBudgetGain}G/วัน</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Pathogen Selection (4 Columns, Large Readable Text) */}
      <div className="space-y-1.5">
        <label className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
          <span>🧬 2. เลือกชนิดเชื้อก่อโรค (Pathogen Type)</span>
        </label>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
          {pathogenList.map((p) => {
            const isSelected = selectedPathogen === p.id;
            return (
              <div
                key={p.id}
                onClick={() => setSelectedPathogen(p.id)}
                className={`p-3 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-rose-950/60 border-rose-500 ring-2 ring-rose-500/40 shadow-md shadow-rose-950/40'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-2xl flex-shrink-0">{p.icon}</span>
                      <div className="font-bold text-xs sm:text-sm text-white truncate">{p.name}</div>
                    </div>
                    <span className="text-[11px] text-amber-300 font-mono font-bold bg-amber-500/20 px-2 py-0.5 rounded-md border border-amber-500/30 flex-shrink-0 whitespace-nowrap">
                      วิจัย {(p.treatability * 100).toFixed(0)}%
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed mb-2 min-h-[36px]">
                    {p.desc}
                  </p>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                  {renderStatBar('แพร่เชื้อ', p.stats.spread)}
                  {renderStatBar('รุนแรง', p.stats.lethal)}
                  {renderStatBar('ดื้อยา', p.stats.hard)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Origin Province Selection (5 Columns, Clear Fonts) */}
      <div className="space-y-1.5">
        <label className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
          <span>📍 3. เลือกจังหวัดต้นตอการระบาด (Outbreak Origin)</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {PROVINCES.map((p) => {
            const isSelected = selectedLabId === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedLabId(p.id)}
                className={`py-2 px-2.5 rounded-xl border text-center cursor-pointer transition-all active:scale-95 ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-950/50 font-bold'
                    : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <div className="font-bold text-xs sm:text-sm truncate">{p.name}</div>
                <div className="text-[11px] opacity-80 font-mono mt-0.5">{(p.pop / 1000000).toFixed(1)}M คน</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tactical Hint */}
      <div className="bg-indigo-950/30 border border-indigo-500/30 rounded-xl px-3.5 py-2 text-xs text-indigo-200 leading-relaxed flex items-center gap-2.5">
        <span className="text-base flex-shrink-0">💡</span>
        <p>
          <strong>คำแนะนำยุทธวิธี:</strong> ทุ่มงบวิจัยวัคซีน (25G) ให้ครบ 100% เพื่อกวาดล้างเชื้อ และตั้งด่านตรวจ (🚧 Checkpoint) ที่ กทม. ช่วยสกัดการแพร่ข้ามจังหวัดลง 50%
        </p>
      </div>

      {/* Start Game Action Buttons */}
      <div className="pt-1 flex items-center gap-3">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="py-3 px-6 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-medium text-xs sm:text-sm border border-slate-700 transition-all active:scale-98 cursor-pointer flex-shrink-0"
          >
            ยกเลิก
          </button>
        )}
        <button
          onClick={() => onStart(selectedLabId, selectedPathogen, selectedDifficulty)}
          className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-rose-600 via-rose-500 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-sm sm:text-base shadow-xl shadow-rose-950/60 transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2"
        >
          <span>🚀</span>
          <span>เริ่มภารกิจใหม่ (Deploy Protocol)</span>
        </button>
      </div>
    </BaseModal>
  );
}
