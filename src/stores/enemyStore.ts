import { create } from 'zustand';
import type { EnemyTank } from '../types/game';
import { ENEMY_SPAWN_POSITIONS, MAX_ENEMIES_ON_MAP, TOTAL_ENEMIES_PER_STAGE } from '../data/constants';
import { ENEMY_TANK_TYPES } from '../data/tankTypes';

let enemyIdCounter = 0;

const ARMOR_COLORS = ['#FFD700', '#32CD32', '#FF4444', '#808080'];

interface EnemyStore {
  enemies: EnemyTank[];
  spawnQueue: number[]; // typeIndex queue
  totalSpawned: number;
  spawnTimer: number;

  initStage: (stage: number) => void;
  spawnEnemy: () => void;
  updateEnemy: (id: string, updates: Partial<EnemyTank>) => void;
  damageEnemy: (id: string) => { destroyed: boolean; typeIndex: number; points: number; isFlashing: boolean };
  removeEnemy: (id: string) => void;
  freezeAll: () => void;
  destroyAll: () => void;
  reset: () => void;
}

function generateSpawnQueue(stage: number): number[] {
  const queue: number[] = [];
  for (let i = 0; i < TOTAL_ENEMIES_PER_STAGE; i++) {
    if (stage <= 3) {
      queue.push(i % 2 === 0 ? 0 : 1);
    } else if (stage <= 8) {
      queue.push(i % 4);
    } else {
      const types = [0, 1, 2, 3, 2, 3, 1, 3];
      queue.push(types[i % types.length]);
    }
  }
  // Mark 4th, 11th, and 18th as flashing (power-up carriers)
  return queue;
}

const FLASHING_INDICES = [3, 10, 17];

export const useEnemyStore = create<EnemyStore>((set, get) => ({
  enemies: [],
  spawnQueue: [],
  totalSpawned: 0,
  spawnTimer: 0,

  initStage: (stage) => {
    enemyIdCounter = 0;
    set({
      enemies: [],
      spawnQueue: generateSpawnQueue(stage),
      totalSpawned: 0,
      spawnTimer: 0,
    });
  },

  spawnEnemy: () => {
    const { enemies, spawnQueue, totalSpawned } = get();
    if (enemies.filter((e) => e.isAlive).length >= MAX_ENEMIES_ON_MAP) return;
    if (totalSpawned >= TOTAL_ENEMIES_PER_STAGE) return;
    if (spawnQueue.length === 0) return;

    const typeIndex = spawnQueue[0];
    const typeDef = ENEMY_TANK_TYPES[typeIndex];
    const spawnIdx = totalSpawned % ENEMY_SPAWN_POSITIONS.length;
    const sp = ENEMY_SPAWN_POSITIONS[spawnIdx];

    // Check if spawn position is clear
    const blocked = enemies.some(
      (e) => e.isAlive && Math.abs(e.x - (sp.x + 0.5)) < 1 && Math.abs(e.y - (sp.y + 0.5)) < 1,
    );
    if (blocked) return;

    const isFlashing = FLASHING_INDICES.includes(totalSpawned);
    const enemy: EnemyTank = {
      id: `enemy_${enemyIdCounter++}`,
      x: sp.x + 0.5,
      y: sp.y + 0.5,
      direction: 'DOWN',
      typeIndex,
      hp: typeDef.hp,
      speed: typeDef.speed,
      bulletSpeed: typeDef.bulletSpeed,
      color: typeDef.color,
      points: typeDef.points,
      isAlive: true,
      isFlashing,
      moveTimer: 0,
      shootTimer: Math.random() * 2000,
      spawnTimer: 1500,
    };

    set({
      enemies: [...enemies, enemy],
      spawnQueue: spawnQueue.slice(1),
      totalSpawned: totalSpawned + 1,
    });
  },

  updateEnemy: (id, updates) => {
    set((s) => ({
      enemies: s.enemies.map((e) => (e.id === id ? { ...e, ...updates } : e)),
    }));
  },

  damageEnemy: (id) => {
    const enemy = get().enemies.find((e) => e.id === id);
    if (!enemy) return { destroyed: false, typeIndex: 0, points: 0, isFlashing: false };

    const newHp = enemy.hp - 1;
    if (newHp <= 0) {
      set((s) => ({
        enemies: s.enemies.map((e) => (e.id === id ? { ...e, hp: 0, isAlive: false } : e)),
      }));
      return { destroyed: true, typeIndex: enemy.typeIndex, points: enemy.points, isFlashing: enemy.isFlashing };
    }

    // Armor tank changes color on hit
    const newColor = ARMOR_COLORS[Math.max(0, newHp - 1)] || '#808080';
    set((s) => ({
      enemies: s.enemies.map((e) => (e.id === id ? { ...e, hp: newHp, color: newColor } : e)),
    }));
    return { destroyed: false, typeIndex: enemy.typeIndex, points: 0, isFlashing: enemy.isFlashing };
  },

  removeEnemy: (id) => {
    set((s) => ({ enemies: s.enemies.filter((e) => e.id !== id) }));
  },

  freezeAll: () => {
    // handled via gameStore.freezeTimer
  },

  destroyAll: () => {
    set((s) => ({
      enemies: s.enemies.map((e) => ({ ...e, isAlive: false, hp: 0 })),
    }));
  },

  reset: () => set({ enemies: [], spawnQueue: [], totalSpawned: 0, spawnTimer: 0 }),
}));
