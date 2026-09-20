'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ACTIONS, DIFFICULTIES, PATHOGENS } from '../lib/constants';
import {
  applyAction,
  freshState,
  getProvinceById,
  investResearch,
  simulateTick,
} from '../lib/simulation';
import { ActionType, DifficultyId, GameLogEvent, GameState, PathogenId } from '../lib/types';

export function useGameEngine() {
  const [gameState, setGameState] = useState<GameState>(() =>
    freshState('bkk', 'flu', 'casual')
  );
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [sliderSpeed, setSliderSpeed] = useState<number>(800); // 800 -> 600ms per tick (2x speed)
  const [selectedProvinceId, setSelectedProvinceId] = useState<string | null>('bkk');
  const [events, setEvents] = useState<GameLogEvent[]>([
    {
      id: 'init-1',
      day: 0,
      text: '🚨 ตรวจพบเคสผู้ติดเชื้อต้องสงสัยรายแรกในพื้นที่กรุงเทพมหานคร ขอให้ติดตามสถานการณ์อย่างใกล้ชิด',
      type: 'warn',
    },
  ]);

  // Modal visibility states
  const [isSetupOpen, setIsSetupOpen] = useState<boolean>(false);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState<boolean>(false);
  const [isGameOverDismissed, setIsGameOverDismissed] = useState<boolean>(false);

  const showGameOverModal = gameState.ended && !isGameOverDismissed;

  const gameStateRef = useRef(gameState);
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  // Advance 1 day
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

  // Timer loop for auto run
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
        text: `🚀 ส่ง${action.name}เข้าประจำการ ณ ${province?.name} (${action.duration > 0 ? `ระยะเวลา ${action.duration} วัน` : 'มีผลทันที'})`,
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

  const handleStartGame = (labProvinceId: string, pathogenId: PathogenId, difficultyId: DifficultyId) => {
    const next = freshState(labProvinceId, pathogenId, difficultyId);
    setGameState(next);
    setIsRunning(false);
    setSelectedProvinceId(labProvinceId);
    setIsGameOverDismissed(false);
    setIsSetupOpen(false);

    const labProv = getProvinceById(labProvinceId);
    const pathogen = PATHOGENS[pathogenId];
    const diff = DIFFICULTIES[difficultyId];

    setEvents([
      {
        id: `start-${Date.now()}`,
        day: 0,
        text: `🦠 เริ่มต้นภารกิจควบคุม ${pathogen.name} ณ ${labProv?.name} (ระดับ: ${diff.name})`,
        type: 'danger',
      },
    ]);
  };

  const handleQuickRestart = () => {
    handleStartGame(selectedProvinceId || 'bkk', gameState.pathogenId, gameState.difficultyId);
  };

  return {
    gameState,
    isRunning,
    sliderSpeed,
    events,
    selectedProvinceId,
    modals: {
      isSetupOpen,
      isGuideOpen,
      isAnalyticsOpen,
      showGameOverModal,
      openSetup: () => setIsSetupOpen(true),
      closeSetup: () => setIsSetupOpen(false),
      openGuide: () => setIsGuideOpen(true),
      closeGuide: () => setIsGuideOpen(false),
      openAnalytics: () => setIsAnalyticsOpen(true),
      closeAnalytics: () => setIsAnalyticsOpen(false),
      dismissGameOver: () => setIsGameOverDismissed(true),
    },
    actions: {
      nextDay: handleNextDay,
      togglePlay: () => setIsRunning((prev) => !prev),
      setSliderSpeed,
      setSelectedProvinceId,
      deployAction: handleDeployAction,
      investResearch: handleInvestResearch,
      startGame: handleStartGame,
      quickRestart: handleQuickRestart,
    },
  };
}
