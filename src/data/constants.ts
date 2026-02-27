export const GRID_SIZE = 26;
export const TILE_SIZE = 1;
export const HALF_TILE = TILE_SIZE / 2;

// Tank
export const TANK_SIZE = 1; // Tank chiếm 1x1 tile
export const TANK_SPEED = 3; // units per second
export const FAST_TANK_SPEED = 4.5;

// Bullet
export const BULLET_SPEED = 8;
export const FAST_BULLET_SPEED = 12;
export const BULLET_SIZE = 0.2;

// Enemy
export const MAX_ENEMIES_ON_MAP = 4;
export const TOTAL_ENEMIES_PER_STAGE = 20;
export const ENEMY_SPAWN_INTERVAL = 3000; // ms

// Player
export const PLAYER_LIVES = 3;
export const SPAWN_PROTECTION = 3000; // ms

// Power-ups
export const SHIELD_DURATION = 10000;
export const FREEZE_DURATION = 10000;
export const FORTRESS_DURATION = 20000;
export const POWERUP_BLINK_TIME = 25000;
export const POWERUP_DISAPPEAR_TIME = 30000;

// Spawn positions (grid coordinates)
export const PLAYER1_SPAWN = { x: 8, y: 0 }; // bottom row, left of base
export const PLAYER2_SPAWN = { x: 16, y: 0 }; // bottom row, right of base
export const ENEMY_SPAWN_POSITIONS = [
  { x: 0, y: 25 },  // top-left
  { x: 12, y: 25 }, // top-center
  { x: 24, y: 25 }, // top-right
];

// Camera
export const CAMERA_POSITION: [number, number, number] = [GRID_SIZE / 2, 30, GRID_SIZE / 2];
export const CAMERA_ZOOM = 37;

// Tile types
export const TILE = {
  EMPTY: 0,
  BRICK: 1,
  STEEL: 2,
  WATER: 3,
  TREE: 4,
  ICE: 5,
  BASE: 6,
} as const;

// Directions
export const DIRECTION = {
  UP: 'UP',
  DOWN: 'DOWN',
  LEFT: 'LEFT',
  RIGHT: 'RIGHT',
} as const;

export const DIRECTION_VECTORS = {
  UP: { x: 0, y: 1 },
  DOWN: { x: 0, y: -1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
} as const;
