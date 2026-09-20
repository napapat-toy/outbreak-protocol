'use client';

import { useState } from 'react';
import { DIFFICULTIES, PATHOGENS, PROVINCES } from '../lib/constants';
import { DifficultyId, PathogenId } from '../lib/types';

interface GameSetupModalProps {
  isOpen: boolean;
  onStart: (labId: string, pathogenId: PathogenId, difficultyId: DifficultyId) => void;
}

export function GameSetupModal({ isOpen, onStart }: GameSetupModalProps) {
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyId>('casual');
  const [selectedPathogen, setSelectedPathogen] = useState<PathogenId>('flu');
  const [selectedLabId, setSelectedLabId] = useState<string>('bkk');

  if (!isOpen) return null;

  const pathogenList = Object.values(PATHOGENS);
  const difficultyList = Object.values(DIFFICULTIES);

  const renderStatBar = (label: string, value: number) => {
    const barColor =
      value <= 2 ? 'bg-emerald-400' : value <= 3 ? 'bg-amber-400' : 'bg-rose-500';
    return (
      <div className="flex items-center gap-1.5 text-[10px]">
        <span className="text-slate-400 w-12 flex-shrink-0 text-left">{label}</span>
        <div className="flex-1 h-1.5 rounded-full bg-slate-800 overflow-hidden">
          <div
            className={`h-full rounded-full ${barColor}`}
            style={{ width: `${value * 20}%` }}
          />
        </div>
        <span className="text-slate-400 font-mono text-[9px] w-3 text-right">{value}</span>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl flex flex-col gap-5 text-slate-100 max-h-[92vh] overflow-y-auto">
        {/* Title Header */}
        <div className="text-center space-y-1 border-b border-slate-800 pb-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-500/30">
            <span>☣️</span> ศูนย์บัญชาการแผนเผชิญเหตุโรคระบาด
          </div>
          <h2 className="text-2xl font-black text-white tracking-wide uppercase">
            Outbreak Protocol
          </h2>
          <p className="text-xs text-slate-400">
            ตั้งค่าพารามิเตอร์การจำลองสถานการณ์วิกฤต 10 จังหวัดภาคกลาง
          </p>
        </div>

        {/* 1. Difficulty Selection */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <span>💰 1. ระดับความยาก & งบประมาณสนับสนุน</span>
            </label>
            <span className="text-[11px] text-slate-400">เลือกโหมดที่เหมาะกับสไตล์คุณ</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {difficultyList.map((d) => {
              const isSelected = selectedDifficulty === d.id;
              return (
                <div
                  key={d.id}
                  onClick={() => setSelectedDifficulty(d.id)}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between gap-2 ${
                    isSelected
                      ? 'bg-indigo-950/50 border-indigo-500 ring-2 ring-indigo-500/40 shadow-lg shadow-indigo-950/40'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{d.icon}</span>
                      <div className="font-bold text-xs text-white">{d.name}</div>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-snug">
                      {d.desc}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
                    <span className="text-amber-400 font-bold">เริ่ม {d.initialBudget}G</span>
                    <span className="text-emerald-400 font-bold">+{d.dailyBudgetGain}G/วัน</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Pathogen Selection */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <span>🧬 2. เลือกชนิดเชื้อก่อโรค (Pathogen Type)</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {pathogenList.map((p) => {
              const isSelected = selectedPathogen === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedPathogen(p.id)}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-rose-950/40 border-rose-500 ring-2 ring-rose-500/40 shadow-lg shadow-rose-950/40'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">{p.icon}</span>
                    <div>
                      <div className="font-bold text-xs text-white">{p.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        ความเร็ววิจัย: {(p.treatability * 100).toFixed(0)}%
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-snug mb-2">
                    {p.desc}
                  </p>

                  <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                    {renderStatBar('แพร่เชื้อ', p.stats.spread)}
                    {renderStatBar('ความรุนแรง', p.stats.lethal)}
                    {renderStatBar('รักษายาก', p.stats.hard)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Origin Province Selection */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
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
                  className={`p-2 rounded-xl border text-xs font-medium transition-all text-center cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-950/50'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <div className="font-bold">{p.name}</div>
                  <div className="text-[9px] opacity-70">{(p.pop / 1000000).toFixed(1)}M คน</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tactical Intel Hint */}
        <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-2xl p-3 text-xs text-indigo-200 space-y-1">
          <div className="font-bold flex items-center gap-1.5 text-indigo-300">
            <span>💡 กฎเหล็กการเอาชีวิตรอด:</span>
          </div>
          <p className="text-[11px] text-indigo-200/90 leading-relaxed">
            • <strong>วิธีชนะ:</strong> โรคนี้มีภูมิคุ้มกันเสื่อมถอย ผู้ป่วยที่หายจะวนกลับมาติดเชื้อใหม่ได้เรื่อยๆ <strong>ทางรอดเดียวคือทุ่มวิจัยวัคซีน (25G) ให้ครบ 100%</strong> เพื่อแจกจ่ายวัคซีนถาวรวันละ 5% จนกดดันยอดติดเชื้อให้ต่ำกว่า 0.1%<br />
            • <strong>การบริหารงบ:</strong> ใช้ <strong>จุดตรวจ (🚧 Checkpoint)</strong> สกัดกั้นกรุงเทพฯ จะตัดการแพร่ข้ามจังหวัดลง 50% ทันที ประหยัดงบส่งทีมแพทย์ได้มหาศาล!
          </p>
        </div>

        {/* Start Game Action */}
        <div className="pt-2 border-t border-slate-800">
          <button
            onClick={() => onStart(selectedLabId, selectedPathogen, selectedDifficulty)}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 via-rose-500 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-sm shadow-xl shadow-rose-950/60 transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2"
          >
            <span>🚀</span>
            <span>เริ่มภารกิจควบคุมการระบาด (Deploy Protocol)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
