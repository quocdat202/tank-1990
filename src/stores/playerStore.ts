import { create } from 'zustand';
import type { Direction, PlayerState } from '../types/game';
import { PLAYER1_SPAWN, PLAYER2_SPAWN, PLAYER_LIVES, SPAWN_PROTECTION } from '../data/constants';
import { PLAYER_TANK_LEVELS } from '../data/tankTypes';

interface PlayerStore {
  player1: PlayerState;
  player2: PlayerState;
  getPlayer: (id: string) => PlayerState;
  setPosition: (id: string, x: number, y: number) => void;
  setDirection: (id: string, direction: Direction) => void;
  setMoving: (id: string, isMoving: boolean) => void;
  shoot: (id: string) => boolean;
  bulletDestroyed: (id: string) => void;
  upgradePlayer: (id: string) => void;
  maxUpgradePlayer: (id: string) => void;
  addLife: (id: string) => void;
  addScore: (id: string, points: number) => void;
  addKill: (id: string, enemyType: number) => void;
  setShielded: (id: string, shielded: boolean) => void;
  die: (id: string) => void;
  respawn: (id: string) => void;
  resetKillCounts: () => void;
  reset: () => void;
}

const createPlayer = (id: string, spawn: { x: number; y: number }): PlayerState => ({
  id,
  x: spawn.x + 0.5,
  y: spawn.y + 0.5,
  direction: 'UP',
  level: 1,
  lives: PLAYER_LIVES,
  isAlive: true,
  isShielded: true,
  isMoving: false,
  shootCooldown: 0,
  maxBullets: 1,
  activeBullets: 0,
  score: 0,
  killCounts: [0, 0, 0, 0],
});

const pk = (id: string): 'player1' | 'player2' => (id === 'player2' ? 'player2' : 'player1');

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  player1: createPlayer('player1', PLAYER1_SPAWN),
  player2: createPlayer('player2', PLAYER2_SPAWN),
  getPlayer: (id) => get()[pk(id)],
  setPosition: (id, x, y) => { const k = pk(id); set((s) => ({ [k]: { ...s[k], x, y } })); },
  setDirection: (id, direction) => { const k = pk(id); set((s) => ({ [k]: { ...s[k], direction } })); },
  setMoving: (id, isMoving) => { const k = pk(id); set((s) => ({ [k]: { ...s[k], isMoving } })); },
  shoot: (id) => {
    const k = pk(id);
    const p = get()[k];
    if (p.activeBullets >= p.maxBullets) return false;
    set((s) => ({ [k]: { ...s[k], activeBullets: s[k].activeBullets + 1 } }));
    return true;
  },
  bulletDestroyed: (id) => { const k = pk(id); set((s) => ({ [k]: { ...s[k], activeBullets: Math.max(0, s[k].activeBullets - 1) } })); },
  upgradePlayer: (id) => {
    const k = pk(id);
    set((s) => {
      const p = s[k];
      const nl = Math.min(4, p.level + 1);
      const ld = PLAYER_TANK_LEVELS[nl - 1];
      return { [k]: { ...p, level: nl, maxBullets: ld.maxBullets } };
    });
  },
  maxUpgradePlayer: (id) => {
    const k = pk(id);
    const ld = PLAYER_TANK_LEVELS[3];
    set((s) => ({ [k]: { ...s[k], level: 4, maxBullets: ld.maxBullets } }));
  },
  addLife: (id) => { const k = pk(id); set((s) => ({ [k]: { ...s[k], lives: s[k].lives + 1 } })); },
  addScore: (id, points) => { const k = pk(id); set((s) => ({ [k]: { ...s[k], score: s[k].score + points } })); },
  addKill: (id, enemyType) => {
    const k = pk(id);
    set((s) => {
      const p = s[k];
      const kc: [number, number, number, number] = [...p.killCounts];
      kc[enemyType] = (kc[enemyType] || 0) + 1;
      return { [k]: { ...p, killCounts: kc } };
    });
  },
  setShielded: (id, shielded) => { const k = pk(id); set((s) => ({ [k]: { ...s[k], isShielded: shielded } })); },
  die: (id) => {
    const k = pk(id);
    set((s) => ({ [k]: { ...s[k], isAlive: false, lives: s[k].lives - 1, level: 1, maxBullets: 1, activeBullets: 0 } }));
  },
  respawn: (id) => {
    const k = pk(id);
    const spawn = id === 'player2' ? PLAYER2_SPAWN : PLAYER1_SPAWN;
    set((s) => ({
      [k]: { ...s[k], x: spawn.x + 0.5, y: spawn.y + 0.5, direction: 'UP' as Direction, isAlive: true, isShielded: true, isMoving: false, activeBullets: 0 },
    }));
    setTimeout(() => { set((s) => ({ [k]: { ...s[k], isShielded: false } })); }, SPAWN_PROTECTION);
  },
  resetKillCounts: () => set((s) => ({
    player1: { ...s.player1, killCounts: [0, 0, 0, 0] },
    player2: { ...s.player2, killCounts: [0, 0, 0, 0] },
  })),
  reset: () => set({ player1: createPlayer('player1', PLAYER1_SPAWN), player2: createPlayer('player2', PLAYER2_SPAWN) }),
}));
