'use client';

import { AnalyticsDrawer } from '../components/AnalyticsDrawer';
import { GameControls } from '../components/GameControls';
import { GameMap } from '../components/GameMap';
import { GameOverModal } from '../components/GameOverModal';
import { GameSetupModal } from '../components/GameSetupModal';
import { GuideModal } from '../components/GuideModal';
import { LiveEventBanner } from '../components/topbar/LiveEventBanner';
import { StartScreen } from '../components/StartScreen';
import { TopBar } from '../components/TopBar';
import { useGameEngine } from '../hooks/useGameEngine';

export default function GamePage() {
  const {
    isInMainMenu,
    gameState,
    isRunning,
    sliderSpeed,
    events,
    selectedProvinceId,
    modals,
    actions,
  } = useGameEngine();

  return (
    <div className="h-screen w-screen bg-[#070b14] text-slate-100 flex flex-col font-sans select-none overflow-hidden">
      {isInMainMenu ? (
        /* Title / Start Screen */
        <StartScreen
          onContinue={actions.continueGame}
          onNewGame={modals.openSetup}
          onOpenGuide={modals.openGuide}
        />
      ) : (
        /* Main Command Bridge & Tactical Map */
        <>
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
            onReturnToMenu={actions.returnToMainMenu}
          />

          {/* Sub-Header Live Event Banner */}
          <LiveEventBanner
            events={events}
            onOpenHistory={modals.openAnalytics}
          />

          {/* Main Map Arena - Edge-to-Edge Full Viewport */}
          <main className="flex-1 w-full h-full relative overflow-hidden flex flex-col">
            {/* Tactical Map with integrated side dock */}
            <GameMap
              state={gameState}
              selectedProvinceId={selectedProvinceId}
              onSelectProvince={actions.setSelectedProvinceId}
              onDeployAction={actions.deployAction}
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
          </main>

          {/* Minimal Bottom Bar */}
          <footer className="border-t border-slate-900/80 bg-slate-950/90 py-1 px-4 text-[11px] text-slate-500 flex-shrink-0 flex items-center justify-between z-10">
            <span className="hidden sm:inline">Outbreak Protocol • ศูนย์บัญชาการแผนเผชิญเหตุโรคระบาด 10 จังหวัดภาคกลาง</span>
            <span className="mx-auto sm:mx-0">คลิกที่จังหวัดบนแผนที่เพื่อสั่งการ • ลากแผนที่ (Pan) หรือซูมเข้าออกได้อย่างอิสระ</span>
            <span className="hidden md:inline font-mono text-[10px] text-slate-600">v0.2.0 • SIR-V Model</span>
          </footer>

          {/* Analytics & Deep Intel Drawer */}
          <AnalyticsDrawer
            isOpen={modals.isAnalyticsOpen}
            state={gameState}
            events={events}
            onClose={modals.closeAnalytics}
          />
        </>
      )}

      {/* Modals (available from both StartScreen and Game Screen) */}
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
