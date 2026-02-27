import { create } from 'zustand';
import type { GamePhase, GameMode } from '../types/game';

interface GameState {
  phase: GamePhase;
  stage: number;
  mode: GameMode;
  freezeTimer: number;
  fortressTimer: number;

  setPhase: (phase: GamePhase) => void;
  setStage: (stage: number) => void;
  setMode: (mode: GameMode) => void;
  togglePause: () => void;
  setFreezeTimer: (t: number) => void;
  setFortressTimer: (t: number) => void;
  startGame: (mode: GameMode) => void;
  nextStage: () => void;
  reset: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  phase: 'MENU',
  stage: 1,
  mode: '1P',
  freezeTimer: 0,
  fortressTimer: 0,

  setPhase: (phase) => set({ phase }),
  setStage: (stage) => set({ stage }),
  setMode: (mode) => set({ mode }),
  togglePause: () => {
    const { phase } = get();
    if (phase === 'PLAYING') set({ phase: 'PAUSED' });
    else if (phase === 'PAUSED') set({ phase: 'PLAYING' });
  },
  setFreezeTimer: (t) => set({ freezeTimer: t }),
  setFortressTimer: (t) => set({ fortressTimer: t }),
  startGame: (mode) =>
    set({ phase: 'STAGE_INTRO', stage: 1, mode, freezeTimer: 0, fortressTimer: 0 }),
  nextStage: () => {
    const { stage } = get();
    set({ stage: stage + 1, phase: 'STAGE_INTRO', freezeTimer: 0, fortressTimer: 0 });
  },
  reset: () =>
    set({ phase: 'MENU', stage: 1, mode: '1P', freezeTimer: 0, fortressTimer: 0 }),
}));
