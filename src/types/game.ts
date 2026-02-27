import { DIRECTION, TILE } from '../data/constants';

export type Direction = (typeof DIRECTION)[keyof typeof DIRECTION];
export type TileType = (typeof TILE)[keyof typeof TILE];

export type GamePhase = 'MENU' | 'STAGE_INTRO' | 'PLAYING' | 'PAUSED' | 'STAGE_COMPLETE' | 'GAME_OVER';
export type GameMode = '1P' | '2P';

export interface Position {
  x: number;
  y: number;
}

export interface GridPosition {
  x: number;
  y: number;
}

export type BrickSubTiles = [boolean, boolean, boolean, boolean];

export interface MapTile {
  type: TileType;
  subTiles?: BrickSubTiles;
}

export interface LevelData {
  stage: number;
  tiles: TileType[][];
  enemyTypes?: number[];
}

export interface Bullet {
  id: string;
  x: number;
  y: number;
  direction: Direction;
  speed: number;
  ownerId: string;
  isPlayerBullet: boolean;
  canBreakSteel: boolean;
}

export interface PlayerState {
  id: string;
  x: number;
  y: number;
  direction: Direction;
  level: number;
  lives: number;
  isAlive: boolean;
  isShielded: boolean;
  isMoving: boolean;
  shootCooldown: number;
  maxBullets: number;
  activeBullets: number;
  score: number;
  killCounts: [number, number, number, number];
}

export interface EnemyTank {
  id: string;
  x: number;
  y: number;
  direction: Direction;
  typeIndex: number;
  hp: number;
  speed: number;
  bulletSpeed: number;
  color: string;
  points: number;
  isAlive: boolean;
  isFlashing: boolean;
  moveTimer: number;
  shootTimer: number;
  spawnTimer: number;
}

export type PowerUpType = 'star' | 'shield' | 'bomb' | 'timer' | 'life' | 'fortress' | 'gun';

export interface PowerUp {
  id: string;
  x: number;
  y: number;
  type: PowerUpType;
  spawnTime: number;
}

export interface ExplosionData {
  id: string;
  x: number;
  y: number;
  big: boolean;
}
