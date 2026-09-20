import {
  clearSavedGame,
  getSavedGameSummary,
  hasSavedGame,
  loadGame,
  saveGame,
  STORAGE_KEY,
} from './storage';
import { freshState } from './simulation';
import { GameLogEvent } from './types';

describe('Storage Module', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  const mockEvents: GameLogEvent[] = [
    {
      id: 'e-1',
      day: 0,
      text: 'First event',
      type: 'warn',
    },
  ];

  it('returns null when no save game exists', () => {
    expect(hasSavedGame()).toBe(false);
    expect(loadGame()).toBeNull();
    expect(getSavedGameSummary()).toBeNull();
  });

  it('saves and loads a game state correctly', () => {
    const state = freshState('bkk', 'flu', 'casual');
    const success = saveGame(state, mockEvents, 'bkk');
    expect(success).toBe(true);

    expect(hasSavedGame()).toBe(true);
    const loaded = loadGame();
    expect(loaded).not.toBeNull();
    expect(loaded?.gameState.day).toBe(0);
    expect(loaded?.gameState.budget).toBe(160);
    expect(loaded?.selectedProvinceId).toBe('bkk');
    expect(loaded?.events.length).toBe(1);
  });

  it('clears saved game successfully', () => {
    const state = freshState('bkk', 'flu', 'casual');
    saveGame(state, mockEvents, 'bkk');
    expect(hasSavedGame()).toBe(true);

    clearSavedGame();
    expect(hasSavedGame()).toBe(false);
    expect(loadGame()).toBeNull();
  });

  it('extracts saved game summary with correct metrics', () => {
    const state = freshState('bkk', 'pneumo', 'standard');
    saveGame(state, mockEvents, 'non');

    const summary = getSavedGameSummary();
    expect(summary).not.toBeNull();
    expect(summary?.day).toBe(0);
    expect(summary?.pathogenName).toBe('ไวรัสปอดอักเสบรุนแรง');
    expect(summary?.difficultyName).toBe('มาตรฐาน');
    expect(summary?.budget).toBe(100);
    expect(summary?.isEnded).toBe(false);
  });

  it('handles corrupted storage data gracefully', () => {
    window.localStorage.setItem(STORAGE_KEY, 'invalid-json-content{{{');
    expect(hasSavedGame()).toBe(false);
    expect(loadGame()).toBeNull();
    expect(getSavedGameSummary()).toBeNull();
  });
});
