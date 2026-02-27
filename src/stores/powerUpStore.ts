import { create } from 'zustand';
import type { PowerUp, PowerUpType } from '../types/game';
import { GRID_SIZE, POWERUP_DISAPPEAR_TIME } from '../data/constants';

let powerUpIdCounter = 0;

const POWER_UP_TYPES: PowerUpType[] = ['star', 'shield', 'bomb', 'timer', 'life', 'fortress', 'gun'];

interface PowerUpStore {
  powerUps: PowerUp[];
  spawnPowerUp: () => void;
  removePowerUp: (id: string) => void;
  clearExpired: () => void;
  reset: () => void;
}

export const usePowerUpStore = create<PowerUpStore>((set) => ({
  powerUps: [],

  spawnPowerUp: () => {
    const type = POWER_UP_TYPES[Math.floor(Math.random() * POWER_UP_TYPES.length)];
    const x = Math.floor(Math.random() * (GRID_SIZE - 2)) + 1 + 0.5;
    const y = Math.floor(Math.random() * (GRID_SIZE - 4)) + 2 + 0.5;

    const pu: PowerUp = {
      id: `pu_${powerUpIdCounter++}`,
      x,
      y,
      type,
      spawnTime: Date.now(),
    };
    set((s) => ({ powerUps: [...s.powerUps, pu] }));
  },

  removePowerUp: (id) => {
    set((s) => ({ powerUps: s.powerUps.filter((p) => p.id !== id) }));
  },

  clearExpired: () => {
    const now = Date.now();
    set((s) => ({
      powerUps: s.powerUps.filter((p) => now - p.spawnTime < POWERUP_DISAPPEAR_TIME),
    }));
  },

  reset: () => { powerUpIdCounter = 0; set({ powerUps: [] }); },
}));
