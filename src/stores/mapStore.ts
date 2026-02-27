import { create } from 'zustand';
import type { TileType, BrickSubTiles } from '../types/game';
import { levels } from '../data/levels';
import { TILE, GRID_SIZE } from '../data/constants';

interface MapState {
  tiles: TileType[][];
  // Track sub-tiles for brick walls: key = "x,y", value = [tl, tr, bl, br]
  brickSubTiles: Record<string, BrickSubTiles>;

  loadStage: (stage: number) => void;
  getTile: (x: number, y: number) => TileType;
  isPassable: (x: number, y: number) => boolean;
  isBulletPassable: (x: number, y: number) => boolean;
  destroyBrick: (x: number, y: number, direction: string) => void;
  destroyTile: (x: number, y: number) => void;
}

export const useMapStore = create<MapState>((set, get) => ({
  tiles: [],
  brickSubTiles: {},

  loadStage: (stage: number) => {
    const level = levels[stage - 1];
    if (!level) return;

    const tiles = level.tiles.map((row) => [...row]);
    const brickSubTiles: Record<string, BrickSubTiles> = {};

    // Initialize sub-tiles for all brick walls
    for (let y = 0; y < tiles.length; y++) {
      for (let x = 0; x < tiles[y].length; x++) {
        if (tiles[y][x] === TILE.BRICK) {
          brickSubTiles[`${x},${y}`] = [true, true, true, true];
        }
      }
    }

    set({ tiles, brickSubTiles });
  },

  getTile: (x: number, y: number): TileType => {
    const { tiles } = get();
    if (y < 0 || y >= tiles.length || x < 0 || x >= (tiles[0]?.length ?? 0)) {
      return TILE.EMPTY;
    }
    return tiles[y][x];
  },

  isPassable: (x: number, y: number): boolean => {
    if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) return false;
    const tile = get().getTile(x, y);
    return tile === TILE.EMPTY || tile === TILE.TREE || tile === TILE.ICE;
  },

  isBulletPassable: (x: number, y: number): boolean => {
    if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) return false;
    const tile = get().getTile(x, y);
    // Bullet passes through empty, tree, ice, water
    return tile === TILE.EMPTY || tile === TILE.TREE || tile === TILE.ICE || tile === TILE.WATER;
  },

  destroyBrick: (x: number, y: number, direction: string) => {
    const { brickSubTiles, tiles } = get();
    const key = `${x},${y}`;
    const sub = brickSubTiles[key];
    if (!sub) return;

    const newSub: BrickSubTiles = [...sub];

    // Destroy half of the brick based on bullet direction
    switch (direction) {
      case 'UP':
        newSub[2] = false; // bottom-left
        newSub[3] = false; // bottom-right
        break;
      case 'DOWN':
        newSub[0] = false; // top-left
        newSub[1] = false; // top-right
        break;
      case 'LEFT':
        newSub[1] = false; // top-right
        newSub[3] = false; // bottom-right
        break;
      case 'RIGHT':
        newSub[0] = false; // top-left
        newSub[2] = false; // bottom-left
        break;
    }

    // If all sub-tiles destroyed, remove the brick entirely
    if (!newSub[0] && !newSub[1] && !newSub[2] && !newSub[3]) {
      const newTiles = tiles.map((row) => [...row]);
      newTiles[y][x] = TILE.EMPTY;
      const newBrickSubTiles = { ...brickSubTiles };
      delete newBrickSubTiles[key];
      set({ tiles: newTiles, brickSubTiles: newBrickSubTiles });
    } else {
      set({
        brickSubTiles: { ...brickSubTiles, [key]: newSub },
      });
    }
  },

  destroyTile: (x: number, y: number) => {
    const { tiles, brickSubTiles } = get();
    if (y < 0 || y >= tiles.length || x < 0 || x >= (tiles[0]?.length ?? 0)) return;
    const newTiles = tiles.map((row) => [...row]);
    newTiles[y][x] = TILE.EMPTY;
    const newBrickSubTiles = { ...brickSubTiles };
    delete newBrickSubTiles[`${x},${y}`];
    set({ tiles: newTiles, brickSubTiles: newBrickSubTiles });
  },
}));
