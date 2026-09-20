'use client';

import { useState } from 'react';
import { clearSavedGame, getSavedGameSummary, SavedGameSummary } from '../lib/storage';

interface StartScreenProps {
  onContinue: () => void;
  onNewGame: () => void;
  onOpenGuide: () => void;
}

export function StartScreen({
  onContinue,
  onNewGame,
  onOpenGuide,
}: StartScreenProps) {
  const [saveSummary, setSaveSummary] = useState<SavedGameSummary | null>(() =>
    getSavedGameSummary()
  );
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDeleteSave = () => {
    clearSavedGame();
    setSaveSummary(null);
    setShowDeleteConfirm(false);
  };

  return (
    <div className="min-h-screen bg-[#060912] text-slate-100 flex flex-col items-center justify-center p-4 relative overflow-hidden select-none">
      {/* Dynamic Background Atmosphere */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
        {/* Ambient Gradient Glows */}
        <div className="absolute w-[600px] h-[600px] rounded-full bg-rose-600/10 blur-[140px] -top-20 -left-20 animate-pulse" />
        <div className="absolute w-[500px] h-[500px] rounded-full bg-indigo-600/10 blur-[130px] -bottom-20 -right-20" />

        {/* Tactical Radar Rings */}
        <div className="absolute w-[500px] h-[500px] rounded-full border border-slate-800/40 opacity-30 animate-[spin_60s_linear_infinite]" />
        <div className="absolute w-[800px] h-[800px] rounded-full border border-slate-800/20 opacity-20" />
        <div className="absolute w-[1100px] h-[1100px] rounded-full border border-dashed border-slate-800/15 opacity-20" />
      </div>

      {/* Main Command Hub Card */}
      <div className="max-w-xl w-full relative z-10 flex flex-col items-center text-center space-y-6 animate-fadeIn">
        {/* Biohazard Icon Badge */}
        <div className="relative">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br from-rose-600 via-rose-500 to-amber-600 flex items-center justify-center text-4xl sm:text-5xl shadow-2xl shadow-rose-950/60 border border-rose-400/40 animate-pulse">
            ☣️
          </div>
          <div className="absolute -inset-1 rounded-3xl bg-rose-500/20 blur-sm -z-10" />
        </div>

        {/* Title & Subtitle */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/15 text-rose-300 text-xs font-bold border border-rose-500/30">
            <span>🔴 DEFCON 1</span>
            <span>•</span>
            <span>ศูนย์บัญชาการแผนเผชิญเหตุโรคระบาด</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-wider uppercase drop-shadow-md">
            Outbreak Protocol
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
            ระบบจำลองยุทธศาสตร์การควบคุมการแพร่ระบาดฉุกเฉิน 10 จังหวัดภาคกลาง
          </p>
        </div>

        {/* Action Panel */}
        <div className="w-full space-y-3 pt-2">
          {/* Continue Game Card (if save exists) */}
          {saveSummary && (
            <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-4 text-left shadow-xl hover:border-slate-600 transition-all group">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    ข้อมูลภารกิจที่บันทึกไว้
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  {saveSummary.savedAtFormatted}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 py-2 border-y border-slate-800/80 my-2 text-xs">
                <div>
                  <div className="text-[10px] text-slate-500">วันที่จำลอง</div>
                  <div className="font-bold text-amber-400">วันที่ {saveSummary.day}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500">เชื้อก่อโรค</div>
                  <div className="font-semibold text-slate-200 truncate">
                    {saveSummary.pathogenIcon} {saveSummary.pathogenName}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500">ผู้ติดเชื้อ</div>
                  <div className="font-bold text-rose-400">
                    {saveSummary.infectedPct.toFixed(1)}%
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500">งบประมาณ</div>
                  <div className="font-bold text-amber-300">
                    💰 {saveSummary.budget}G
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={onContinue}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-950/50 transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>▶</span>
                  <span>เล่นภารกิจต่อ (Continue)</span>
                </button>

                {!showDeleteConfirm ? (
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-rose-950/50 text-slate-400 hover:text-rose-300 border border-slate-700 hover:border-rose-700/50 text-xs transition-colors cursor-pointer"
                    title="ลบข้อมูลเซฟ"
                  >
                    🗑️
                  </button>
                ) : (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={handleDeleteSave}
                      className="py-2 px-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold transition-all cursor-pointer"
                    >
                      ยืนยันลบ
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="py-2 px-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white text-[11px] cursor-pointer"
                    >
                      ยกเลิก
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* New Game Button */}
          <button
            type="button"
            onClick={onNewGame}
            className={`w-full py-3.5 px-5 rounded-2xl font-bold text-sm sm:text-base shadow-xl transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2.5 ${
              !saveSummary
                ? 'bg-gradient-to-r from-rose-600 via-rose-500 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white shadow-rose-950/60 ring-2 ring-rose-500/30'
                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700'
            }`}
          >
            <span>🚀</span>
            <span>เริ่มภารกิจใหม่ (New Game)</span>
          </button>

          {/* Field Manual Guide Button */}
          <button
            type="button"
            onClick={onOpenGuide}
            className="w-full py-3 px-5 rounded-2xl bg-slate-900/60 hover:bg-slate-800/80 text-slate-300 hover:text-white border border-slate-800/80 hover:border-slate-700 font-medium text-xs sm:text-sm transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2"
          >
            <span>📖</span>
            <span>คู่มือยุทธวิธี & กฎการเอาชีวิตรอด (Field Manual)</span>
          </button>
        </div>

        {/* Footer Meta */}
        <div className="text-[11px] text-slate-500 pt-4 flex items-center justify-center gap-3">
          <span>Outbreak Protocol v0.2.0</span>
          <span>•</span>
          <span>โมเดลระบาดวิทยาภาคกลาง 10 จังหวัด</span>
        </div>
      </div>
    </div>
  );
}
