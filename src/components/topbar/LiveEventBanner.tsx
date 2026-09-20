'use client';

import { useState } from 'react';
import { GameLogEvent } from '../../lib/types';

interface LiveEventBannerProps {
  events: GameLogEvent[];
  onOpenHistory: () => void;
}

export function LiveEventBanner({ events, onOpenHistory }: LiveEventBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [prevLatestId, setPrevLatestId] = useState(events[0]?.id);

  // Automatically reset to the newest event when a new event arrives
  if (events[0]?.id !== prevLatestId) {
    setPrevLatestId(events[0]?.id);
    setCurrentIndex(0);
  }

  if (!events || events.length === 0) return null;

  const currentEvent = events[currentIndex] || events[0];
  const totalEvents = Math.min(events.length, 10); // Cycle up to 10 latest events

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : totalEvents - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev < totalEvents - 1 ? prev + 1 : 0));
  };

  const getEventBadge = (type: GameLogEvent['type']) => {
    switch (type) {
      case 'danger':
        return {
          icon: '🚨',
          label: 'วิกฤต',
          bg: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
        };
      case 'warn':
        return {
          icon: '⚠️',
          label: 'เฝ้าระวัง',
          bg: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
        };
      case 'success':
        return {
          icon: '🎉',
          label: 'สำเร็จ',
          bg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
        };
      case 'action':
        return {
          icon: '🚀',
          label: 'สั่งการ',
          bg: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
        };
      default:
        return {
          icon: '📢',
          label: 'สถานการณ์',
          bg: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
        };
    }
  };

  const badge = getEventBadge(currentEvent.type);

  return (
    <div className="w-full bg-slate-950/95 border-b border-slate-800/80 px-4 sm:px-6 py-1.5 flex items-center justify-between gap-3 text-xs z-20 flex-shrink-0 backdrop-blur-md select-none shadow-sm">
      {/* Left: Badge + Event Message */}
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        {/* Category Pill */}
        <div
          className={`flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-[10.5px] border flex-shrink-0 ${badge.bg}`}
        >
          <span>{badge.icon}</span>
          <span>{badge.label}</span>
          <span className="opacity-70 font-mono text-[9.5px]">วัน {currentEvent.day}</span>
        </div>

        {/* Full Message Text (Clean & Static with generous width) */}
        <div
          key={currentEvent.id}
          className="text-slate-200 text-xs truncate leading-normal flex-1 animate-fadeIn font-medium"
        >
          {currentEvent.text}
        </div>
      </div>

      {/* Right: Controls & History Shortcut */}
      <div className="flex items-center gap-2 flex-shrink-0 text-slate-400">
        {/* Event Cycle Navigator (if multiple events) */}
        {totalEvents > 1 && (
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg px-1.5 py-0.5 text-[10px] font-mono">
            <button
              type="button"
              onClick={handlePrev}
              className="hover:text-white px-1 cursor-pointer transition-colors"
              title="ข้อความก่อนหน้า"
            >
              ◀
            </button>
            <span className="text-slate-500 select-none">
              {currentIndex + 1}/{totalEvents}
            </span>
            <button
              type="button"
              onClick={handleNext}
              className="hover:text-white px-1 cursor-pointer transition-colors"
              title="ข้อความถัดไป"
            >
              ▶
            </button>
          </div>
        )}

        {/* Open History Drawer */}
        <button
          type="button"
          onClick={onOpenHistory}
          className="text-[11px] hover:text-indigo-300 transition-colors flex items-center gap-1 pl-1 cursor-pointer hover:underline"
          title="เปิดดูประวัติเหตุการณ์ทั้งหมดในหน้าต่างข้อมูลวิเคราะห์"
        >
          <span className="hidden sm:inline">ประวัติเหตุการณ์</span>
          <span className="font-mono text-[10px]">({events.length})</span>
          <span>➔</span>
        </button>
      </div>
    </div>
  );
}
