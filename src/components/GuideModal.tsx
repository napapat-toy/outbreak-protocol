'use client';

import { useEffect, useState } from 'react';
import {
  ACTIONS,
  DEATH_LOSE_FRACTION,
  PATHOGENS,
  RELIEF_UNREST_REDUCTION,
  RESEARCH_COST,
  RIOT_BUDGET_PENALTY,
  RIOT_COLLAPSE_COUNT,
  UNREST_RIOT_THRESHOLD,
  VACCINE_ROLLOUT_RATE,
} from '../lib/constants';
import { PathogenId } from '../lib/types';
import { BaseModal } from './shared/BaseModal';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  pathogenId?: PathogenId;
}

const TOTAL_PAGES = 4;

export function GuideModal({ isOpen, onClose, pathogenId }: GuideModalProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  // Reset to first page when modal opens (React pattern for adjusting state upon prop change)
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setCurrentPage(0);
    }
  }

  // Arrow key navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        e.preventDefault();
        setCurrentPage((prev) => Math.min(prev + 1, TOTAL_PAGES - 1));
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        setCurrentPage((prev) => Math.max(prev - 1, 0));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const currentPathogen = pathogenId ? PATHOGENS[pathogenId] : null;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-3xl"
      zIndex="z-[70]"
      showCloseButton
    >
      <div className="flex flex-col gap-4 text-slate-100">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 pr-8">
          <div className="flex items-center gap-3">
            <span className="text-3xl">📖</span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-white tracking-wide">
                  คู่มือยุทธวิธีและเป้าหมายภารกิจ
                </h2>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {currentPage + 1}/{TOTAL_PAGES}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Outbreak Protocol • ศูนย์บัญชาการแผนเผชิญเหตุโรคระบาด 10 จังหวัดภาคกลาง
              </p>
            </div>
          </div>
        </div>

        {/* Step Indicator Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs">
          {[
            { title: '1. กฎแพ้-ชนะ', icon: '🏆' },
            { title: '2. วัคซีน & การระบาด', icon: '💉' },
            { title: '3. 4 มาตรการสั่งการ (%)', icon: '🚀' },
            { title: '4. ยุทธวิธี & คีย์ลัด', icon: '💡' },
          ].map((tab, idx) => {
            const isActive = currentPage === idx;
            return (
              <button
                key={tab.title}
                type="button"
                onClick={() => setCurrentPage(idx)}
                className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600/30 text-indigo-200 border-indigo-500/60 shadow-md shadow-indigo-950/40 ring-1 ring-indigo-500/40'
                    : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border-slate-800 hover:border-slate-700'
                }`}
              >
                <span>{tab.icon}</span>
                <span className="truncate">{tab.title}</span>
              </button>
            );
          })}
        </div>

        {/* Page Content Container with smooth transition */}
        <div className="min-h-[350px] sm:min-h-[370px] flex flex-col justify-center">
          {/* PAGE 1: Victory & Defeat Rules */}
          {currentPage === 0 && (
            <div className="space-y-3.5 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* Victory Box */}
                <div className="bg-emerald-950/30 border border-emerald-500/40 rounded-2xl p-4 space-y-2.5 shadow-lg shadow-emerald-950/20">
                  <div className="font-bold text-emerald-300 text-sm sm:text-base flex items-center gap-2">
                    <span className="text-xl">🏆</span> เงื่อนไขชัยชนะ (Victory Condition)
                  </div>
                  <ul className="text-xs sm:text-[13px] text-slate-200 space-y-2 leading-relaxed">
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">✓</span>
                      <span>
                        <strong>ผ่านจุดระบาดสูงสุด (Peak Infection):</strong> ยอดผู้ติดเชื้อสะสมรวมทั้งภูมิภาคเคยเกิน <strong>1% (&gt; 140,000 คน)</strong>
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">✓</span>
                      <span>
                        <strong>กดดันผู้ติดเชื้อต่ำกว่า 0.1%:</strong> ลดยอดผู้ป่วยพร้อมกันทั้ง 10 จังหวัดให้เหลือ <strong>น้อยกว่า 14,000 คน</strong>
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">✓</span>
                      <span>
                        <strong>หลังวันที่ 6 เป็นต้นไป:</strong> เพื่อพิสูจน์ว่าควบคุมการระบาดได้อย่างยั่งยืน
                      </span>
                    </li>
                  </ul>
                </div>

                {/* Defeat Box */}
                <div className="bg-rose-950/30 border border-rose-500/40 rounded-2xl p-4 space-y-2.5 shadow-lg shadow-rose-950/20">
                  <div className="font-bold text-rose-300 text-sm sm:text-base flex items-center gap-2">
                    <span className="text-xl">💀</span> 3 เงื่อนไขพ่ายแพ้ (Defeat Conditions)
                  </div>
                  <ul className="text-xs sm:text-[13px] text-slate-200 space-y-2 leading-relaxed">
                    <li className="flex items-start gap-2">
                      <span className="text-rose-400 font-bold">✕</span>
                      <span>
                        <strong>รัฐบาลล่มสลาย:</strong> เกิดการจลาจลพร้อมกันตั้งแต่ <strong>{RIOT_COLLAPSE_COUNT} จังหวัดขึ้นไป</strong>
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-rose-400 font-bold">✕</span>
                      <span>
                        <strong>มนุษยชาติสูญพันธุ์:</strong> ประชากรสะสมเสียชีวิตเกิน <strong>{Math.round(DEATH_LOSE_FRACTION * 100)}%</strong> ทั่วภูมิภาค
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-rose-400 font-bold">✕</span>
                      <span>
                        <strong>ระบาดหลุดการควบคุม:</strong> มีผู้ติดเชื้อพร้อมกันทั่วประเทศเกิน <strong>85%</strong>
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Evaluation Rating Callout */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 sm:p-3.5 text-xs text-slate-300 flex items-center gap-3">
                <span className="text-2xl flex-shrink-0">🎖️</span>
                <p className="leading-relaxed">
                  <strong>ระบบประเมินเกรดการบริหาร (Grade S, A, B, C, F):</strong> คำนวณจากจำนวนวันที่ใช้และจำนวนการสูญเสียชีวิต ยิ่งควบคุมได้รวดเร็วและรักษาชีวิตประชาชนได้มาก จะได้รับเกรดยุทธวิธีระดับสูง
                </p>
              </div>
            </div>
          )}

          {/* PAGE 2: Vaccine & SIR-V Mechanics */}
          {currentPage === 1 && (
            <div className="space-y-3.5 animate-fadeIn">
              <div className="bg-indigo-950/30 border border-indigo-500/40 rounded-2xl p-4 space-y-3 shadow-lg shadow-indigo-950/20">
                <div className="font-bold text-indigo-300 text-sm sm:text-base flex items-center gap-2">
                  <span className="text-xl">💉</span> กลไกวัคซีน: ทางรอดเดียวที่จะชนะเกมได้!
                </div>
                <div className="text-xs sm:text-[13px] text-slate-200 space-y-3 leading-relaxed">
                  <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 flex items-start gap-2.5">
                    <span className="text-amber-400 text-lg flex-shrink-0">⚠️</span>
                    <div>
                      <strong className="text-amber-300">ทำไมการปล่อยให้คนป่วยหายเองถึงไม่มีวันชนะ?</strong>
                      <p className="text-slate-300 text-xs mt-1">
                        โรคระบาดนี้มีกลไก <strong>ภูมิคุ้มกันเสื่อมถอย (Waning Immunity)</strong> ผู้ป่วยที่หายตามธรรมชาติจะมีภูมิคุ้มกันชั่วคราว และจะทยอยเสื่อมลงเฉลี่ย ~83 วัน ทำให้กลับมาเป็นผู้เสี่ยงติดเชื้อซ้ำ (Susceptible) ได้เรื่อยๆ การรอให้หายเองจึงไม่ทำให้เชื้อหมดไป
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 space-y-1">
                      <div className="text-indigo-300 font-bold flex items-center gap-1.5 text-xs sm:text-sm">
                        <span>🧪</span> การทุ่มงบวิจัย (Research)
                      </div>
                      <p className="text-slate-300 text-xs">
                        กดปุ่มวิจัยวัคซีนบนแถบด้านบนครั้งละ <strong>{RESEARCH_COST}G</strong> จนความคืบหน้าครบ <strong>100%</strong> ยิ่งเชื้อต้านทานยาก การวิจัยจะใช้จำนวนครั้งมากขึ้น
                      </p>
                    </div>

                    <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 space-y-1">
                      <div className="text-emerald-300 font-bold flex items-center gap-1.5 text-xs sm:text-sm">
                        <span>🛡️</span> ภูมิคุ้มกันถาวร (Vaccinated)
                      </div>
                      <p className="text-slate-300 text-xs">
                        เมื่อวิจัยสำเร็จ ระบบจะเริ่ม<strong>แจกจ่ายฉีดวัคซีนถาวรให้ประชาชนกลุ่มเสี่ยง {Math.round(VACCINE_ROLLOUT_RATE * 100)}% ต่อวันโดยอัตโนมัติ</strong> จนเกิดภูมิคุ้มกันหมู่และกวาดล้างเชื้อจนหมดสิ้น
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PAGE 3: 4 Provincial Actions & Percentages */}
          {currentPage === 2 && (
            <div className="space-y-3 animate-fadeIn">
              <div className="text-xs text-slate-300 flex items-center justify-between">
                <span className="font-semibold text-slate-200">
                  คลิกที่จังหวัดบนแผนที่เพื่อส่ง 4 หน่วยงานเข้าปฏิบัติการ:
                </span>
                {currentPathogen && (
                  <span className="text-[11px] text-amber-300 font-mono bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                    กำลังระบาด: {currentPathogen.icon} {currentPathogen.name}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* 1. Health */}
                <div className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 p-3.5 rounded-2xl space-y-1.5 shadow-md">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-white text-sm flex items-center gap-1.5">
                      <span>{ACTIONS.health.icon}</span> {ACTIONS.health.name}
                    </div>
                    <span className="text-amber-400 font-mono font-bold text-xs">
                      {ACTIONS.health.cost}G • 5 วัน
                    </span>
                  </div>
                  <div className="text-emerald-400 font-semibold text-xs flex items-center gap-1">
                    <span>📉</span> ลดการแพร่เชื้อในจังหวัด 10% – 40%
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    ส่งเจ้าหน้าที่คัดกรองและกักกันโรค ประสิทธิภาพแปรผันตามเชื้อ (ไข้หวัดใหญ่ลด <strong>40%</strong>, เชื้อแล็บลด <strong>20%</strong>, ซูเปอร์บั๊กลด <strong>10%</strong>)
                  </p>
                </div>

                {/* 2. Checkpoint */}
                <div className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 p-3.5 rounded-2xl space-y-1.5 shadow-md">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-white text-sm flex items-center gap-1.5">
                      <span>{ACTIONS.checkpoint.icon}</span> {ACTIONS.checkpoint.name}
                    </div>
                    <span className="text-amber-400 font-mono font-bold text-xs">
                      {ACTIONS.checkpoint.cost}G • 5 วัน
                    </span>
                  </div>
                  <div className="text-sky-400 font-semibold text-xs flex items-center gap-1">
                    <span>🚧</span> ลดการแพร่ข้ามจังหวัด 50%
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    เป็นมาตรการทางกายภาพ ตัดการสัญจรเชื่อมต่อทุกเส้นทางลง <strong>50%</strong> (หากปลายทางตั้งด้วยจะลดถึง <strong>75%</strong>) แต่จะเพิ่มความตึงเครียด (Unrest) <strong>+2.5/วัน</strong>
                  </p>
                </div>

                {/* 3. Medical */}
                <div className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 p-3.5 rounded-2xl space-y-1.5 shadow-md">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-white text-sm flex items-center gap-1.5">
                      <span>{ACTIONS.medical.icon}</span> {ACTIONS.medical.name}
                    </div>
                    <span className="text-amber-400 font-mono font-bold text-xs">
                      {ACTIONS.medical.cost}G • 5 วัน
                    </span>
                  </div>
                  <div className="text-indigo-400 font-semibold text-xs flex items-center gap-1">
                    <span>❤️‍🩹</span> หายเร็วขึ้น +15% ถึง +60% • ลดตาย 12.5% – 50%
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    เร่งการรักษาผู้ป่วยและลดอัตราเสียชีวิตลงอย่างเห็นได้ชัด เหมาะสำหรับส่งเข้ากู้วิกฤตในจังหวัดที่มีผู้ป่วยหนักเพื่อลดความโกรธแค้นของประชาชน
                  </p>
                </div>

                {/* 4. Relief */}
                <div className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 p-3.5 rounded-2xl space-y-1.5 shadow-md">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-white text-sm flex items-center gap-1.5">
                      <span>{ACTIONS.relief.icon}</span> {ACTIONS.relief.name}
                    </div>
                    <span className="text-amber-400 font-mono font-bold text-xs">
                      {ACTIONS.relief.cost}G • ทันที
                    </span>
                  </div>
                  <div className="text-amber-400 font-semibold text-xs flex items-center gap-1">
                    <span>📦</span> ลดความไม่พอใจ (Unrest) ทันที {RELIEF_UNREST_REDUCTION}%
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    แจกถุงยังชีพและงบเยียวยา <strong className="text-amber-300">เป็นมาตรการเดียวที่กดส่งเข้าพื้นที่จลาจลได้!</strong> เพื่อดึง Unrest ให้ต่ำกว่า {UNREST_RIOT_THRESHOLD} และหยุดยั้งการจลาจล
                  </p>
                </div>
              </div>

              {/* Dynamic Pathogen Stats Banner if in-game */}
              {currentPathogen && (
                <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-2.5 text-[11px] text-slate-300 flex items-center justify-between">
                  <span>
                    🎯 <strong>ประสิทธิภาพสำหรับ {currentPathogen.name}:</strong> สาธารณสุขลดแพร่เชื้อ{' '}
                    <strong className="text-emerald-300">{Math.round(40 * currentPathogen.treatability)}%</strong> • ทีมแพทย์หายเร็ว{' '}
                    <strong className="text-indigo-300">+{Math.round(60 * currentPathogen.treatability)}%</strong> / ลดตาย{' '}
                    <strong className="text-indigo-300">-{Math.round(50 * currentPathogen.treatability)}%</strong>
                  </span>
                </div>
              )}
            </div>
          )}

          {/* PAGE 4: Tactics & Control Hotkeys */}
          {currentPage === 3 && (
            <div className="space-y-3.5 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* Tactics Column */}
                <div className="bg-amber-950/20 border border-amber-500/40 rounded-2xl p-4 space-y-2.5 shadow-lg shadow-amber-950/20">
                  <div className="font-bold text-amber-300 text-sm sm:text-base flex items-center gap-2">
                    <span>💡</span> กลยุทธ์บริหารงบฉบับเซียน
                  </div>
                  <ul className="text-xs sm:text-[12.5px] text-slate-200 space-y-2 leading-relaxed">
                    <li>
                      <strong>1. อย่าเลี้ยงทุกจังหวัด:</strong> ได้งบจำกัด (+12G/วัน) ห้ามหว่านส่งหน่วยงาน ให้ความสำคัญกับศูนย์วิจัยวัคซีนและด่านตรวจ กทม. เป็นหลัก
                    </li>
                    <li>
                      <strong>2. สกัด Hub กรุงเทพฯ:</strong> กทม. มีเส้นทางเชื่อมโยงกับปริมณฑลมากที่สุด การตั้งด่านสกัดที่ กทม. จะช่วยหยุดการกระจายของโรคได้ดีที่สุด
                    </li>
                    <li>
                      <strong>3. ระวังเส้นตายจลาจล (Unrest &ge; {UNREST_RIOT_THRESHOLD}):</strong> ถ้าเกิดจลาจล จะถูกหักงบ {RIOT_BUDGET_PENALTY}G ทันที และห้ามส่งหน่วยงานเข้าไปจนกว่าจะส่งถุงยังชีพช่วย
                    </li>
                  </ul>
                </div>

                {/* Keyboard Shortcuts Column */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-2.5 shadow-lg">
                  <div className="font-bold text-white text-sm sm:text-base flex items-center gap-2">
                    <span>⌨️</span> ระบบการควบคุม & คีย์ลัด
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">เดินเวลา / พักเกม</span>
                      <kbd className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 font-mono text-[11px] border border-slate-700">
                        Spacebar
                      </kbd>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">เดินเวลาทีละ 1 วัน (+1 Tick)</span>
                      <kbd className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 font-mono text-[11px] border border-slate-700">
                        Enter / ➔
                      </kbd>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">ปรับความเร็วเวลา (1x / 2x / 3x)</span>
                      <kbd className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 font-mono text-[11px] border border-slate-700">
                        1 / 2 / 3
                      </kbd>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">สั่งการจังหวัด / ดูสถิติ</span>
                      <span className="text-slate-300 font-medium">คลิกที่โหนดบนแผนที่</span>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <span className="text-slate-400">ปิดหน้าต่าง / ยกเลิก</span>
                      <kbd className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 font-mono text-[11px] border border-slate-700">
                        Esc
                      </kbd>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Navigation */}
        <div className="flex items-center justify-between border-t border-slate-800/80 pt-3 mt-1">
          {/* Previous Page Button */}
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 0))}
            disabled={currentPage === 0}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              currentPage === 0
                ? 'opacity-30 cursor-not-allowed text-slate-500 bg-slate-900'
                : 'bg-slate-800 hover:bg-slate-700 text-white cursor-pointer active:scale-95'
            }`}
          >
            <span>◀</span>
            <span>ย้อนกลับ</span>
          </button>

          {/* Page Dots Indicator */}
          <div className="flex items-center gap-1.5">
            {Array.from({ length: TOTAL_PAGES }).map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentPage(idx)}
                aria-label={`ไปที่หน้า ${idx + 1}`}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  currentPage === idx
                    ? 'w-6 bg-indigo-500 shadow-sm shadow-indigo-500/50'
                    : 'w-2 bg-slate-700 hover:bg-slate-600'
                }`}
              />
            ))}
          </div>

          {/* Next / Finish Button */}
          {currentPage < TOTAL_PAGES - 1 ? (
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, TOTAL_PAGES - 1))}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-950/60 active:scale-95"
            >
              <span>ถัดไป</span>
              <span>▶</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-950/60 active:scale-95"
            >
              <span>🚀 เข้าใจแล้ว เข้าสู่ภารกิจ</span>
            </button>
          )}
        </div>
      </div>
    </BaseModal>
  );
}
