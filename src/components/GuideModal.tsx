'use client';

import {
  ACTIONS,
  DEATH_LOSE_FRACTION,
  DIFFICULTIES,
  RELIEF_UNREST_REDUCTION,
  RESEARCH_COST,
  RIOT_BUDGET_PENALTY,
  RIOT_COLLAPSE_COUNT,
  UNREST_RIOT_THRESHOLD,
  VACCINE_ROLLOUT_RATE,
} from '../lib/constants';
import { BaseModal } from './shared/BaseModal';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GUIDE_ACTIONS = [
  { ...ACTIONS.health, desc: 'ลดอัตราการแพร่เชื้อในจังหวัด เหมาะสำหรับชะลอการระบาดในพื้นที่ติดเชื้อ' },
  { ...ACTIONS.checkpoint, desc: <><strong>ลดการแพร่ข้ามจังหวัดลง 50%</strong> (แนะนำตั้งที่ กทม. เพื่อกันเชื้อกระจาย)</> },
  { ...ACTIONS.medical, desc: 'เร่งการรักษาและลดอัตราตาย ใช้กู้วิกฤตก่อนที่ประชาชนจะทนไม่ไหว' },
  { ...ACTIONS.relief, desc: <>ส่งถุงยังชีพ <strong>ลดความไม่พอใจ (Unrest) ทันที {RELIEF_UNREST_REDUCTION}%</strong> กดใช้ได้แม้กำลังจลาจล!</> },
];

export function GuideModal({ isOpen, onClose }: GuideModalProps) {
  return (
    <BaseModal isOpen={isOpen} onClose={onClose} maxWidth="max-w-2xl" zIndex="z-[70]" showCloseButton>
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 pr-8">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">📖</span>
            <div>
              <h2 className="text-lg font-bold text-white">คู่มือยุทธวิธีและเป้าหมายภารกิจ</h2>
              <p className="text-xs text-slate-400">Outbreak Protocol • คู่มือสำหรับผู้บัญชาการควบคุมโรค</p>
            </div>
          </div>
        </div>

        {/* 1. Victory & Defeat Conditions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="card-callout card-callout-emerald">
            <div className="font-bold text-emerald-300 flex items-center gap-1.5">
              <span>🏆</span> เงื่อนไขชัยชนะ (How to Win)
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              • ต้องผ่านจุดสูงสุดของการระบาด (Infected &gt; 1% ของทั้งภูมิภาค)<br />
              • กดดันยอดผู้ติดเชื้อรวมทั้ง 10 จังหวัดให้<strong>ต่ำกว่า 0.1%</strong> (&lt; 14,000 คน)<br />
              • หลังจากวันที่ 6 เป็นต้นไป
            </p>
          </div>

          <div className="card-callout card-callout-rose">
            <div className="font-bold text-rose-300 flex items-center gap-1.5">
              <span>💀</span> เงื่อนไขพ่ายแพ้ (Defeat Conditions)
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              • <strong>รัฐบาลล่มสลาย:</strong> เกิดจลาจลพร้อมกัน &ge; {RIOT_COLLAPSE_COUNT} จังหวัด<br />
              • <strong>สูญพันธุ์:</strong> ประชากรสะสมเสียชีวิตเกิน {Math.round(DEATH_LOSE_FRACTION * 100)}%<br />
              • <strong>ระบาดหลุดการควบคุม:</strong> ผู้ติดเชื้อพร้อมกันทั่วประเทศ &gt; 85%
            </p>
          </div>
        </div>

        {/* 2. Core Loop: The Vaccine */}
        <div className="card-callout card-callout-indigo">
          <div className="font-bold text-indigo-300 flex items-center gap-1.5">
            <span>💉</span> หัวใจสำคัญ: วัคซีนคือทางรอดเดียว!
          </div>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            โรคระบาดนี้มี <strong>การเสื่อมของภูมิคุ้มกัน (Waning Immunity)</strong> ผู้ที่รักษาหายจะกลายเป็นผู้มีความเสี่ยงติดเชื้อซ้ำได้อีกเรื่อยๆ ดังนั้นการรอให้หายเองจะไม่ทำให้ชนะเกมได้<br />
            <strong>ทางออก:</strong> ทุ่มงบวิจัยวัคซีน ({RESEARCH_COST}G) ในศูนย์วิจัยจนครบ 100% เมื่อสำเร็จ ระบบจะ<strong>ฉีดวัคซีนถาวรให้ประชาชน {Math.round(VACCINE_ROLLOUT_RATE * 100)}% ต่อวันโดยอัตโนมัติ</strong> จนเกิดภูมิคุ้มกันหมู่และกวาดล้างเชื้อจนหมดสิ้น
          </p>
        </div>

        {/* 3. The Deployment Actions */}
        <div className="space-y-2">
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            🚀 มาตรการสั่งการประจำจังหวัด
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
            {GUIDE_ACTIONS.map((a) => (
              <div key={a.name} className="card-mini">
                <div className="font-bold text-white flex items-center gap-1">
                  <span>{a.icon}</span> {a.name}
                </div>
                <div className="text-amber-400 font-mono text-[10px] my-0.5">
                  ราคา {a.cost}G • {a.duration > 0 ? `${a.duration} วัน` : 'ทันที'}
                </div>
                <p className="text-[10px] text-slate-400 leading-snug">
                  {a.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Pro-Tips */}
        <div className="card-callout card-callout-amber">
          <div className="font-bold text-amber-300 flex items-center gap-1.5">
            <span>💡</span> กลยุทธ์การบริหารงบฉบับเซียน:
          </div>
          <ul className="list-disc list-inside text-[11px] text-slate-300 space-y-0.5 leading-relaxed">
            <li><strong>อย่าเลี้ยงทุกจังหวัด:</strong> ในช่วงแรก ให้เงินไปที่วัคซีนและด่านตรวจ กทม. เป็นหลัก</li>
            <li><strong>ระวัง Unrest &ge; {UNREST_RIOT_THRESHOLD}:</strong> ถ้าจังหวัดใดจลาจล จะถูกหักงบ {RIOT_BUDGET_PENALTY}G ทันที และห้ามส่งหน่วยงานเข้าไปจนกว่าจะสงบ</li>
            <li><strong>เลือกระดับความยากที่ชอบ:</strong> หากรู้สึกว่าเงินตึงมือเกินไป สามารถเลือกโหมด &quot;{DIFFICULTIES.casual.name}&quot; (+{DIFFICULTIES.casual.dailyBudgetGain}G/วัน) ได้จากหน้าเริ่มเกมใหม่</li>
          </ul>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 cursor-pointer transition-all active:scale-98"
        >
          เข้าใจแล้ว กลับสู่ภารกิจ
        </button>
      </div>
    </BaseModal>
  );
}
