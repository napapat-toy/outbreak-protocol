'use client';

import { AnalyticsDrawer } from '../components/AnalyticsDrawer';
import { GameControls } from '../components/GameControls';
import { GameMap } from '../components/GameMap';
import { GameOverModal } from '../components/GameOverModal';
import { GameSetupModal } from '../components/GameSetupModal';
import { GuideModal } from '../components/GuideModal';
import { TopBar } from '../components/TopBar';
import { useGameEngine } from '../hooks/useGameEngine';

export default function GamePage() {
  const {
    gameState,
    isRunning,
    sliderSpeed,
    events,
    selectedProvinceId,
    modals,
    actions,
  } = useGameEngine();

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans select-none">
      {/* Top Header & HUD */}
      <TopBar
        state={gameState}
        onNewGame={() => {
          modals.dismissGameOver();
          modals.openSetup();
        }}
        onOpenGuide={modals.openGuide}
        onToggleAnalytics={() =>
          modals.isAnalyticsOpen ? modals.closeAnalytics() : modals.openAnalytics()
        }
        isAnalyticsOpen={modals.isAnalyticsOpen}
        onInvestResearch={actions.investResearch}
      />

      {/* Main Map Arena */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-2 sm:p-4 flex flex-col items-center justify-center relative">
        <div className="w-full relative">
          {/* Tactical Map with integrated side dock & alert ticker */}
          <GameMap
            state={gameState}
            selectedProvinceId={selectedProvinceId}
            onSelectProvince={actions.setSelectedProvinceId}
            onDeployAction={actions.deployAction}
            latestEvent={events[0]}
          />

          {/* Floating Time Controls Bar (Capsule at bottom center) */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 pointer-events-auto">
            <GameControls
              day={gameState.day}
              isRunning={isRunning}
              sliderSpeed={sliderSpeed}
              isEnded={gameState.ended}
              onNextDay={actions.nextDay}
              onTogglePlay={actions.togglePlay}
              onSpeedChange={actions.setSliderSpeed}
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
        isOpen={modals.isAnalyticsOpen}
        state={gameState}
        events={events}
        onClose={modals.closeAnalytics}
      />

      {/* Modals */}
      <GameSetupModal
        isOpen={modals.isSetupOpen}
        onClose={modals.closeSetup}
        onStart={(labId, pathogenId, difficultyId) => {
          actions.startGame(labId, pathogenId, difficultyId);
          modals.closeSetup();
        }}
      />

      <GuideModal
        isOpen={modals.isGuideOpen}
        onClose={modals.closeGuide}
      />

      <GameOverModal
        isOpen={modals.showGameOverModal}
        state={gameState}
        onRestart={() => {
          modals.dismissGameOver();
          modals.openSetup();
        }}
        onQuickRestart={actions.quickRestart}
        onClose={modals.dismissGameOver}
      />
    </div>
  );
}
