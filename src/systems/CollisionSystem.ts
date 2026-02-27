import { useMapStore } from '../stores/mapStore';
import { TILE, GRID_SIZE, TILE_SIZE } from '../data/constants';
import type { Direction } from '../types/game';

const TANK_HALF = TILE_SIZE / 2;

export function canTankMoveTo(
  cx: number, cy: number, direction: Direction, speed: number,
): { canMove: boolean; newX: number; newY: number } {
  const mapStore = useMapStore.getState();
  let newX = cx, newY = cy;

  switch (direction) {
    case 'UP': newY = cy + speed; break;
    case 'DOWN': newY = cy - speed; break;
    case 'LEFT': newX = cx - speed; break;
    case 'RIGHT': newX = cx + speed; break;
  }

  newX = Math.max(TANK_HALF, Math.min(GRID_SIZE - TANK_HALF, newX));
  newY = Math.max(TANK_HALF, Math.min(GRID_SIZE - TANK_HALF, newY));

  const left = newX - TANK_HALF + 0.05;
  const right = newX + TANK_HALF - 0.05;
  const bottom = newY - TANK_HALF + 0.05;
  const top = newY + TANK_HALF - 0.05;

  const minTileX = Math.floor(left);
  const maxTileX = Math.floor(right);
  const minTileY = Math.floor(bottom);
  const maxTileY = Math.floor(top);

  for (let ty = minTileY; ty <= maxTileY; ty++) {
    for (let tx = minTileX; tx <= maxTileX; tx++) {
      if (tx < 0 || tx >= GRID_SIZE || ty < 0 || ty >= GRID_SIZE) continue;
      if (!mapStore.isPassable(tx, ty)) {
        return slideAlongWall(cx, cy, newX, newY, direction);
      }
    }
  }

  return { canMove: true, newX, newY };
}

function slideAlongWall(
  oldX: number, oldY: number, _newX: number, _newY: number, direction: Direction,
): { canMove: boolean; newX: number; newY: number } {
  const mapStore = useMapStore.getState();

  if (direction === 'UP' || direction === 'DOWN') {
    const snappedX = Math.round(oldX * 2) / 2;
    const testLeft = snappedX - TANK_HALF + 0.05;
    const testRight = snappedX + TANK_HALF - 0.05;
    const testBottom = (direction === 'DOWN' ? _newY : oldY) - TANK_HALF + 0.05;
    const testTop = (direction === 'UP' ? _newY : oldY) + TANK_HALF - 0.05;
    let blocked = false;
    for (let ty = Math.floor(testBottom); ty <= Math.floor(testTop); ty++) {
      for (let tx = Math.floor(testLeft); tx <= Math.floor(testRight); tx++) {
        if (!mapStore.isPassable(tx, ty)) { blocked = true; break; }
      }
      if (blocked) break;
    }
    if (!blocked && Math.abs(snappedX - oldX) < 0.3) {
      return { canMove: true, newX: snappedX, newY: _newY };
    }
  } else {
    const snappedY = Math.round(oldY * 2) / 2;
    const testLeft = (direction === 'LEFT' ? _newX : oldX) - TANK_HALF + 0.05;
    const testRight = (direction === 'RIGHT' ? _newX : oldX) + TANK_HALF - 0.05;
    const testBottom = snappedY - TANK_HALF + 0.05;
    const testTop = snappedY + TANK_HALF - 0.05;
    let blocked = false;
    for (let ty = Math.floor(testBottom); ty <= Math.floor(testTop); ty++) {
      for (let tx = Math.floor(testLeft); tx <= Math.floor(testRight); tx++) {
        if (!mapStore.isPassable(tx, ty)) { blocked = true; break; }
      }
      if (blocked) break;
    }
    if (!blocked && Math.abs(snappedY - oldY) < 0.3) {
      return { canMove: true, newX: _newX, newY: snappedY };
    }
  }
  return { canMove: false, newX: oldX, newY: oldY };
}

export function checkBulletTileCollision(
  bx: number, by: number, direction: Direction, canBreakSteel: boolean,
): { hit: boolean; tileX?: number; tileY?: number; isBase?: boolean; tileType?: number } {
  const mapStore = useMapStore.getState();
  const tileX = Math.floor(bx);
  const tileY = Math.floor(by);

  if (tileX < 0 || tileX >= GRID_SIZE || tileY < 0 || tileY >= GRID_SIZE) {
    return { hit: true };
  }

  const tile = mapStore.getTile(tileX, tileY);

  if (tile === TILE.BRICK) {
    mapStore.destroyBrick(tileX, tileY, direction);
    return { hit: true, tileX, tileY, tileType: TILE.BRICK };
  }
  if (tile === TILE.STEEL) {
    if (canBreakSteel) mapStore.destroyTile(tileX, tileY);
    return { hit: true, tileX, tileY, tileType: TILE.STEEL };
  }
  if (tile === TILE.BASE) {
    mapStore.destroyTile(tileX, tileY);
    return { hit: true, tileX, tileY, isBase: true, tileType: TILE.BASE };
  }

  return { hit: false };
}

export function checkTankCollision(
  x1: number, y1: number, x2: number, y2: number, size: number = 0.9,
): boolean {
  return Math.abs(x1 - x2) < size && Math.abs(y1 - y2) < size;
}

export function checkBulletHitTank(
  bx: number, by: number, tx: number, ty: number, tankSize: number = 0.45,
): boolean {
  return Math.abs(bx - tx) < tankSize && Math.abs(by - ty) < tankSize;
}
