'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { EpidemicChart } from '../components/EpidemicChart';
import { EventLog } from '../components/EventLog';
import { GameControls } from '../components/GameControls';
import { GameMap } from '../components/GameMap';
import { GameOverModal } from '../components/GameOverModal';
import { GameSetupModal } from '../components/GameSetupModal';
import { GuideModal } from '../components/GuideModal';
import { MissionObjectives } from '../components/MissionObjectives';
import { ProvincePanel } from '../components/ProvincePanel';
import { ResearchPanel } from '../components/ResearchPanel';
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
  const [sliderSpeed, setSliderSpeed] = useState<number>(800); // 1400 - 800 = 600ms per tick
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
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <TopBar
        state={gameState}
        onNewGame={handleOpenSetup}
        onOpenGuide={() => setIsGuideOpen(true)}
      />

      {/* Main Content Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left Column: Mission HUD + Controls + Interactive SVG Map + Epidemic Curve (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-3 sm:gap-4">
          {/* Mission Objectives HUD */}
          <MissionObjectives
            state={gameState}
            onOpenGuide={() => setIsGuideOpen(true)}
          />

          {/* Time & Speed Controls */}
          <GameControls
            day={gameState.day}
            isRunning={isRunning}
            sliderSpeed={sliderSpeed}
            isEnded={gameState.ended}
            onNextDay={handleNextDay}
            onTogglePlay={() => setIsRunning((prev) => !prev)}
            onSpeedChange={setSliderSpeed}
          />

          {/* Tactical SVG Map */}
          <GameMap
            state={gameState}
            selectedProvinceId={selectedProvinceId}
            onSelectProvince={setSelectedProvinceId}
          />

          {/* Epidemic Curve Chart */}
          <EpidemicChart history={gameState.history} />
        </div>

        {/* Right Column: Province Detail + Vaccine Research + Event Logs (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Province Panel */}
          <ProvincePanel
            provinceId={selectedProvinceId}
            state={gameState}
            onDeployAction={handleDeployAction}
            onClose={() => setSelectedProvinceId(null)}
          />

          {/* Research Panel */}
          <ResearchPanel state={gameState} onInvest={handleInvestResearch} />

          {/* Live Intel / Event Log */}
          <EventLog events={events} />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-3 px-4 text-center text-[11px] text-slate-500">
        Outbreak Protocol v0.1.0 • Thai Outbreak Strategy Game • อ้างอิงระบบระบาดวิทยา 10 จังหวัดภาคกลาง
      </footer>

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
