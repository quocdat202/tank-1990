import { create } from 'zustand';
import type { ExplosionData } from '../types/game';

let effectIdCounter = 0;

interface EffectStore {
  explosions: ExplosionData[];
  addExplosion: (x: number, y: number, big?: boolean) => void;
  removeExplosion: (id: string) => void;
  reset: () => void;
}

export const useEffectStore = create<EffectStore>((set) => ({
  explosions: [],

  addExplosion: (x, y, big = false) => {
    const id = `exp_${effectIdCounter++}`;
    set((s) => ({ explosions: [...s.explosions, { id, x, y, big }] }));
    // Auto-remove after animation
    setTimeout(() => {
      set((s) => ({ explosions: s.explosions.filter((e) => e.id !== id) }));
    }, big ? 600 : 400);
  },

  removeExplosion: (id) => {
    set((s) => ({ explosions: s.explosions.filter((e) => e.id !== id) }));
  },

  reset: () => { effectIdCounter = 0; set({ explosions: [] }); },
}));
