import { create } from 'zustand';
import type { Bullet, Direction } from '../types/game';
import { BULLET_SPEED } from '../data/constants';
import { PLAYER_TANK_LEVELS } from '../data/tankTypes';

let bulletIdCounter = 0;

interface BulletStore {
  bullets: Bullet[];
  addBullet: (x: number, y: number, direction: Direction, ownerId: string, isPlayerBullet: boolean, playerLevel?: number, bulletSpeed?: number) => void;
  removeBullet: (id: string) => void;
  clearBullets: () => void;
}

export const useBulletStore = create<BulletStore>((set) => ({
  bullets: [],

  addBullet: (x, y, direction, ownerId, isPlayerBullet, playerLevel = 1, bulletSpeed) => {
    let speed: number;
    let canBreakSteel = false;

    if (isPlayerBullet) {
      const ld = PLAYER_TANK_LEVELS[playerLevel - 1];
      speed = ld?.bulletSpeed ?? BULLET_SPEED;
      canBreakSteel = ld?.canBreakSteel ?? false;
    } else {
      speed = bulletSpeed ?? BULLET_SPEED;
    }

    const bullet: Bullet = {
      id: `bullet_${bulletIdCounter++}`,
      x, y, direction, speed, ownerId, isPlayerBullet, canBreakSteel,
    };
    set((s) => ({ bullets: [...s.bullets, bullet] }));
  },

  removeBullet: (id) => set((s) => ({ bullets: s.bullets.filter((b) => b.id !== id) })),
  clearBullets: () => { bulletIdCounter = 0; set({ bullets: [] }); },
}));
