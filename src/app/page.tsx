'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AnalyticsDrawer } from '../components/AnalyticsDrawer';
import { GameControls } from '../components/GameControls';
import { GameMap } from '../components/GameMap';
import { GameOverModal } from '../components/GameOverModal';
import { GameSetupModal } from '../components/GameSetupModal';
import { GuideModal } from '../components/GuideModal';
import { TopBar } from '../components/TopBar';
import { ACTIONS, DIFFICULTIES, PATHOGENS } from '../lib/constants';
import {
  applyAction,
  freshState,
  getProvinceById,
  investResearch,
  simulateTick,
} from '../lib/simulation';
import { ActionType, DifficultyId, GameLogEvent, GameState, PathogenId } from '../lib/types';

export default function GamePage() {
  const [gameState, setGameState] = useState<GameState>(() =>
    freshState('bkk', 'flu', 'casual')
  );
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [sliderSpeed, setSliderSpeed] = useState<number>(800); // default 2x speed (600ms per tick)
  const [selectedProvinceId, setSelectedProvinceId] = useState<string | null>('bkk');
  const [events, setEvents] = useState<GameLogEvent[]>([
    {
      id: 'init-1',
      day: 0,
      text: '🚨 ตรวจพบเคสผู้ติดเชื้อต้องสงสัยรายแรกในพื้นที่กรุงเทพมหานคร ขอให้ติดตามสถานการณ์อย่างใกล้ชิด',
      type: 'warn',
    },
  ]);
  const [isSetupOpen, setIsSetupOpen] = useState<boolean>(false);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState<boolean>(false);
  const [isGameOverDismissed, setIsGameOverDismissed] = useState<boolean>(false);

  const showGameOverModal = gameState.ended && !isGameOverDismissed;

  const gameStateRef = useRef(gameState);
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  // Single tick step
  const handleNextDay = useCallback(() => {
    if (gameStateRef.current.ended) {
      setIsRunning(false);
      return;
    }

    const { nextState, events: newEvents } = simulateTick(gameStateRef.current);
    setGameState(nextState);

    if (newEvents.length > 0) {
      setEvents((prev) => [...newEvents.reverse(), ...prev].slice(0, 50));
    }

    if (nextState.ended) {
      setIsRunning(false);
    }
  }, []);

  // Timer loop for auto play
  useEffect(() => {
    if (!isRunning || gameState.ended) return;

    const delay = Math.max(100, 1400 - sliderSpeed);
    const interval = setInterval(() => {
      handleNextDay();
    }, delay);

    return () => clearInterval(interval);
  }, [isRunning, sliderSpeed, gameState.ended, handleNextDay]);

  // Player action deployment
  const handleDeployAction = (provinceId: string, actionKey: ActionType) => {
    const province = getProvinceById(provinceId);
    const action = ACTIONS[actionKey];

    const result = applyAction(gameState, provinceId, actionKey);
    if (!result.success) {
      setEvents((prev) => [
        {
          id: `err-${Date.now()}`,
          day: gameState.day,
          text: `❌ ไม่สามารถส่ง${action.name}ได้: ${result.reason}`,
          type: 'warn',
        },
        ...prev,
      ]);
      return;
    }

    setGameState(result.nextState);
    setEvents((prev) => [
      {
        id: `deploy-${Date.now()}`,
        day: gameState.day,
        text: `🚀 ส่ง${action.name}เข้าประจำการ ณ ${province?.name} (ระยะเวลา ${action.duration} วัน)`,
        type: 'action',
      },
      ...prev,
    ]);
  };

  // Vaccine research investment
  const handleInvestResearch = () => {
    const result = investResearch(gameState);
    if (!result.success) return;

    setGameState(result.nextState);
    const pathogen = PATHOGENS[gameState.pathogenId];

    if (result.nextState.vaccineReady && !gameState.vaccineReady) {
      setEvents((prev) => [
        {
          id: `vac-ready-${Date.now()}`,
          day: gameState.day,
          text: `🎉 วิจัยวัคซีนต้าน ${pathogen.name} สำเร็จแล้ว! เริ่มแจกจ่ายฉีดวัคซีนวันละ 5% ของผู้ยังไม่ติดเชื้อทันที`,
          type: 'success',
        },
        ...prev,
      ]);
    } else {
      setEvents((prev) => [
        {
          id: `res-${Date.now()}`,
          day: gameState.day,
          text: `🧪 ทุ่มงบวิจัยวัคซีน 25G — ความคืบหน้าเพิ่มขึ้นเป็น ${Math.round(result.nextState.research)}%`,
          type: 'info',
        },
        ...prev,
      ]);
    }
  };

  // Start new game from modal
  const handleStartGame = (
    labId: string,
    pathogenId: PathogenId,
    difficultyId: DifficultyId = 'standard'
  ) => {
    const initialState = freshState(labId, pathogenId, difficultyId);
    const originProv = getProvinceById(labId);
    const pathogen = PATHOGENS[pathogenId];
    const diff = DIFFICULTIES[difficultyId] || DIFFICULTIES.standard;

    setGameState(initialState);
    setSelectedProvinceId(labId);
    setIsRunning(false);
    setIsSetupOpen(false);
    setIsGameOverDismissed(false);

    setEvents([
      {
        id: `init-${Date.now()}`,
        day: 0,
        text: `☣️ เริ่มภารกิจควบคุมโรค: ${pathogen.icon} ${pathogen.name} ณ ${originProv?.name} [โหมด: ${diff.name}]`,
        type: 'warn',
      },
    ]);
  };

  // Quick restart with current pathogen and province
  const handleQuickRestart = () => {
    handleStartGame(selectedProvinceId || 'bkk', gameState.pathogenId, gameState.difficultyId);
  };

  const handleOpenSetup = () => {
    setIsGameOverDismissed(true);
    setIsSetupOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans select-none">
      {/* Top Header */}
      <TopBar
        state={gameState}
        onNewGame={handleOpenSetup}
        onOpenGuide={() => setIsGuideOpen(true)}
        onToggleAnalytics={() => setIsAnalyticsOpen((prev) => !prev)}
        isAnalyticsOpen={isAnalyticsOpen}
        onInvestResearch={handleInvestResearch}
      />

      {/* Main Map Arena */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-2 sm:p-4 flex flex-col items-center justify-center relative">
        <div className="w-full relative">
          {/* Tactical Map with integrated floating action popover & alert ticker */}
          <GameMap
            state={gameState}
            selectedProvinceId={selectedProvinceId}
            onSelectProvince={setSelectedProvinceId}
            onDeployAction={handleDeployAction}
            latestEvent={events[0]}
          />

          {/* Floating Time Controls Bar (Capsule at bottom center) */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 pointer-events-auto">
            <GameControls
              day={gameState.day}
              isRunning={isRunning}
              sliderSpeed={sliderSpeed}
              isEnded={gameState.ended}
              onNextDay={handleNextDay}
              onTogglePlay={() => setIsRunning((prev) => !prev)}
              onSpeedChange={setSliderSpeed}
            />
          </div>
        </div>
      </main>

      {/* Minimal Bottom Bar */}
      <footer className="border-t border-slate-900 py-2.5 px-4 text-center text-[11px] text-slate-500">
        Outbreak Protocol • คลิกที่จังหวัดบนแผนที่เพื่อส่งหน่วยงาน • เปิดดูสถิติกราฟที่ปุ่ม &quot;ข้อมูลวิเคราะห์&quot; มุมขวาบน
      </footer>

      {/* Analytics & Deep Intel Drawer */}
      <AnalyticsDrawer
        isOpen={isAnalyticsOpen}
        state={gameState}
        events={events}
        onClose={() => setIsAnalyticsOpen(false)}
      />

      {/* Modals */}
      <GameSetupModal
        isOpen={isSetupOpen}
        onStart={handleStartGame}
      />

      <GuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />

      <GameOverModal
        isOpen={showGameOverModal}
        state={gameState}
        onRestart={handleOpenSetup}
        onQuickRestart={handleQuickRestart}
        onClose={() => setIsGameOverDismissed(true)}
      />
    </div>
  );
}
