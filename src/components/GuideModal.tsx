'use client';

import { ACTIONS } from '../lib/constants';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GuideModal({ isOpen, onClose }: GuideModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl flex flex-col gap-4 text-slate-100 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">📖</span>
            <div>
              <h2 className="text-lg font-bold text-white">คู่มือยุทธวิธีและเป้าหมายภารกิจ</h2>
              <p className="text-xs text-slate-400">Outbreak Protocol • คู่มือสำหรับผู้บัญชาการควบคุมโรค</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* 1. Victory & Defeat Conditions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="bg-emerald-950/30 border border-emerald-500/40 rounded-2xl p-3 space-y-1.5">
            <div className="font-bold text-emerald-300 flex items-center gap-1.5">
              <span>🏆</span> เงื่อนไขชัยชนะ (How to Win)
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              • ต้องผ่านจุดสูงสุดของการระบาด (Infected &gt; 1% ของทั้งภูมิภาค)<br />
              • กดดันยอดผู้ติดเชื้อรวมทั้ง 10 จังหวัดให้<strong>ต่ำกว่า 0.1%</strong> (&lt; 14,000 คน)<br />
              • หลังจากวันที่ 6 เป็นต้นไป
            </p>
          </div>

          <div className="bg-rose-950/30 border border-rose-500/40 rounded-2xl p-3 space-y-1.5">
            <div className="font-bold text-rose-300 flex items-center gap-1.5">
              <span>💀</span> เงื่อนไขพ่ายแพ้ (Defeat Conditions)
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              • <strong>รัฐบาลล่มสลาย:</strong> เกิดจลาจลพร้อมกัน &ge; 4 จังหวัด<br />
              • <strong>สูญพันธุ์:</strong> ประชากรสะสมเสียชีวิตเกิน 95%<br />
              • <strong>ระบาดหลุดการควบคุม:</strong> ผู้ติดเชื้อพร้อมกันทั่วประเทศ &gt; 85%
            </p>
          </div>
        </div>

        {/* 2. Core Loop: The Vaccine */}
        <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-2xl p-3 text-xs space-y-1.5">
          <div className="font-bold text-indigo-300 flex items-center gap-1.5">
            <span>💉</span> หัวใจสำคัญ: วัคซีนคือทางรอดเดียว!
          </div>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            โรคระบาดนี้มี <strong>การเสื่อมของภูมิคุ้มกัน (Waning Immunity)</strong> ผู้ที่รักษาหายจะกลายเป็นผู้มีความเสี่ยงติดเชื้อซ้ำได้อีกเรื่อยๆ ดังนั้นการรอให้หายเองจะไม่ทำให้ชนะเกมได้<br />
            <strong>ทางออก:</strong> ทุ่มงบวิจัยวัคซีน (25G) ในศูนย์วิจัยจนครบ 100% เมื่อสำเร็จ ระบบจะ<strong>ฉีดวัคซีนถาวรให้ประชาชน 5% ต่อวันโดยอัตโนมัติ</strong> จนเกิดภูมิคุ้มกันหมู่และกวาดล้างเชื้อจนหมดสิ้น
          </p>
        </div>

        {/* 3. The 3 Deployment Actions */}
        <div className="space-y-2">
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            🚀 3 มาตรการสั่งการประจำจังหวัด
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-2.5">
              <div className="font-bold text-white flex items-center gap-1">
                <span>{ACTIONS.health.icon}</span> {ACTIONS.health.name}
              </div>
              <div className="text-amber-400 font-mono text-[10px] my-0.5">ราคา 15G • 5 วัน</div>
              <p className="text-[10px] text-slate-400 leading-snug">
                ลดอัตราการแพร่เชื้อในจังหวัด เหมาะสำหรับชะลอการระบาดในพื้นที่ติดเชื้อ
              </p>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-2.5">
              <div className="font-bold text-white flex items-center gap-1">
                <span>{ACTIONS.checkpoint.icon}</span> {ACTIONS.checkpoint.name}
              </div>
              <div className="text-amber-400 font-mono text-[10px] my-0.5">ราคา 20G • 5 วัน</div>
              <p className="text-[10px] text-slate-400 leading-snug">
                <strong>ลดการแพร่ข้ามจังหวัดลง 50%</strong> (แนะนำให้ตั้งที่ กทม. เพื่อกันไม่ให้เชื้อกระจายสู่ปริมณฑล)
              </p>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-2.5">
              <div className="font-bold text-white flex items-center gap-1">
                <span>{ACTIONS.medical.icon}</span> {ACTIONS.medical.name}
              </div>
              <div className="text-amber-400 font-mono text-[10px] my-0.5">ราคา 25G • 5 วัน</div>
              <p className="text-[10px] text-slate-400 leading-snug">
                เร่งการรักษาและลดอัตราตาย ใช้กู้วิกฤตก่อนที่ประชาชนจะหมดความอดทนจนจลาจล
              </p>
            </div>
          </div>
        </div>

        {/* 4. Pro-Tips */}
        <div className="bg-amber-950/30 border border-amber-500/30 rounded-2xl p-3 text-xs space-y-1">
          <div className="font-bold text-amber-300 flex items-center gap-1.5">
            <span>💡</span> กลยุทธ์การบริหารงบฉบับเซียน:
          </div>
          <ul className="list-disc list-inside text-[11px] text-slate-300 space-y-0.5 leading-relaxed">
            <li><strong>อย่าเลี้ยงทุกจังหวัด:</strong> ในช่วงแรก ให้เงินไปที่วัคซีนและด่านตรวจ กทม. เป็นหลัก</li>
            <li><strong>ระวัง Unrest &ge; 70:</strong> ถ้าจังหวัดใดจลาจล จะถูกหักงบ 15G ทันที และห้ามส่งหน่วยงานเข้าไปจนกว่าจะสงบ</li>
            <li><strong>เลือกระดับความยากที่ชอบ:</strong> หากรู้สึกว่าเงินตึงมือเกินไป สามารถเลือกโหมด &quot;สนับสนุนพิเศษ (Casual)&quot; (+18G/วัน) ได้จากหน้าเริ่มเกมใหม่</li>
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
    </div>
  );
}
