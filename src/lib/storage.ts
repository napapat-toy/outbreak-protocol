import { GameLogEvent, GameState } from './types';
import { DIFFICULTIES, PATHOGENS, TOTAL_POPULATION } from './constants';

export const STORAGE_KEY = 'outbreak_protocol_save';
export const LEGACY_STORAGE_KEY = 'outbreak_protocol_save_v1';

export interface SavedGame {
  savedAt: number; // Date.now()
  gameState: GameState;
  events: GameLogEvent[];
  selectedProvinceId: string | null;
}

export interface SavedGameSummary {
  day: number;
  savedAt: number;
  savedAtFormatted: string;
  pathogenName: string;
  pathogenIcon: string;
  difficultyName: string;
  difficultyIcon: string;
  budget: number;
  infectedCount: number;
  infectedPct: number;
  deadCount: number;
  isEnded: boolean;
}

/**
 * Get raw saved string from LocalStorage, checking current and legacy keys
 */
export function getRawSavedData(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return (
      window.localStorage.getItem(STORAGE_KEY) ||
      window.localStorage.getItem(LEGACY_STORAGE_KEY)
    );
  } catch {
    return null;
  }
}

/**
 * Save the current game state to LocalStorage
 */
export function saveGame(
  gameState: GameState,
  events: GameLogEvent[],
  selectedProvinceId: string | null
): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const payload: SavedGame = {
      savedAt: Date.now(),
      gameState,
      events: events.slice(0, 50),
      selectedProvinceId,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    return true;
  } catch (err) {
    console.error('Failed to save game to localStorage:', err);
    return false;
  }
}

/**
 * Load the saved game from LocalStorage by validating structure directly
 */
export function loadGame(): SavedGame | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = getRawSavedData();
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (
      !parsed ||
      typeof parsed !== 'object' ||
      !parsed.gameState ||
      typeof parsed.gameState !== 'object' ||
      !parsed.gameState.provinces ||
      typeof parsed.gameState.provinces !== 'object'
    ) {
      return null;
    }

    const state = parsed.gameState as GameState;
    if (typeof state.day !== 'number' || typeof state.budget !== 'number') {
      return null;
    }

    return {
      savedAt: typeof parsed.savedAt === 'number' ? parsed.savedAt : Date.now(),
      gameState: state,
      events: Array.isArray(parsed.events) ? parsed.events : [],
      selectedProvinceId:
        typeof parsed.selectedProvinceId === 'string' ? parsed.selectedProvinceId : null,
    };
  } catch (err) {
    console.error('Failed to load game from localStorage:', err);
    return null;
  }
}

/**
 * Check if a valid saved game exists
 */
export function hasSavedGame(): boolean {
  return loadGame() !== null;
}

/**
 * Delete the saved game from LocalStorage
 */
export function clearSavedGame(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    window.localStorage.removeItem(LEGACY_STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear saved game:', err);
  }
}

/**
 * Extract summary information for display on the Start Screen
 */
export function getSavedGameSummary(): SavedGameSummary | null {
  const save = loadGame();
  if (!save) return null;

  const { gameState, savedAt } = save;
  const pathogen = PATHOGENS[gameState.pathogenId] || PATHOGENS.flu;
  const difficulty = DIFFICULTIES[gameState.difficultyId] || DIFFICULTIES.standard;

  let totalInfected = 0;
  let totalDead = 0;

  for (const prov of Object.values(gameState.provinces)) {
    totalInfected += prov.infected;
    totalDead += prov.dead;
  }

  const infectedPct = (totalInfected / TOTAL_POPULATION) * 100;

  const d = new Date(savedAt);
  const timeStr = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  const dateStr = `${d.getDate()}/${d.getMonth() + 1}`;
  const savedAtFormatted = `บันทึกเมื่อ ${dateStr} เวลา ${timeStr} น.`;

  return {
    day: gameState.day,
    savedAt,
    savedAtFormatted,
    pathogenName: pathogen.name,
    pathogenIcon: pathogen.icon,
    difficultyName: difficulty.name.split(' ')[0],
    difficultyIcon: difficulty.icon,
    budget: Math.floor(gameState.budget),
    infectedCount: Math.round(totalInfected),
    infectedPct,
    deadCount: Math.round(totalDead),
    isEnded: gameState.ended,
  };
}
