export interface TankTypeDefinition {
  name: string;
  speed: number;
  bulletSpeed: number;
  hp: number;
  points: number;
  color: string;
}

export const PLAYER_TANK_LEVELS = [
  { level: 1, bulletSpeed: 8, maxBullets: 1, canBreakSteel: false },
  { level: 2, bulletSpeed: 12, maxBullets: 1, canBreakSteel: false },
  { level: 3, bulletSpeed: 12, maxBullets: 2, canBreakSteel: false },
  { level: 4, bulletSpeed: 12, maxBullets: 2, canBreakSteel: true },
];

export const ENEMY_TANK_TYPES: TankTypeDefinition[] = [
  { name: 'Basic', speed: 2, bulletSpeed: 6, hp: 1, points: 100, color: '#808080' },
  { name: 'Fast', speed: 4, bulletSpeed: 6, hp: 1, points: 200, color: '#87CEEB' },
  { name: 'Power', speed: 2, bulletSpeed: 10, hp: 1, points: 300, color: '#32CD32' },
  { name: 'Armor', speed: 2, bulletSpeed: 10, hp: 4, points: 400, color: '#FFD700' },
];
