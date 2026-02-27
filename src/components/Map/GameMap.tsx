import { useEffect } from 'react';
import { useMapStore } from '../../stores/mapStore';
import { useGameStore } from '../../stores/gameStore';
import { TILE, GRID_SIZE, TILE_SIZE } from '../../data/constants';
import { BrickWall } from './BrickWall';
import { SteelWall } from './SteelWall';
import { Water } from './Water';
import { Tree } from './Tree';
import { Ice } from './Ice';
import { Base } from './Base';

export function GameMap() {
  const tiles = useMapStore((s) => s.tiles);
  const loadStage = useMapStore((s) => s.loadStage);
  const stage = useGameStore((s) => s.stage);

  useEffect(() => {
    loadStage(stage);
  }, [stage, loadStage]);

  if (tiles.length === 0) return null;

  const tileElements: React.ReactElement[] = [];

  for (let y = 0; y < tiles.length; y++) {
    for (let x = 0; x < tiles[y].length; x++) {
      const tile = tiles[y][x];
      const key = `${x}-${y}`;

      switch (tile) {
        case TILE.BRICK:
          tileElements.push(<BrickWall key={key} x={x} y={y} />);
          break;
        case TILE.STEEL:
          tileElements.push(<SteelWall key={key} x={x} y={y} />);
          break;
        case TILE.WATER:
          tileElements.push(<Water key={key} x={x} y={y} />);
          break;
        case TILE.TREE:
          tileElements.push(<Tree key={key} x={x} y={y} />);
          break;
        case TILE.ICE:
          tileElements.push(<Ice key={key} x={x} y={y} />);
          break;
        case TILE.BASE:
          tileElements.push(<Base key={key} x={x} y={y} />);
          break;
      }
    }
  }

  return (
    <group>
      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[GRID_SIZE / 2, -0.01, GRID_SIZE / 2]}>
        <planeGeometry args={[GRID_SIZE * TILE_SIZE, GRID_SIZE * TILE_SIZE]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>

      {/* Border */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[GRID_SIZE / 2, -0.02, GRID_SIZE / 2]}>
        <planeGeometry args={[(GRID_SIZE + 1) * TILE_SIZE, (GRID_SIZE + 1) * TILE_SIZE]} />
        <meshStandardMaterial color="#636363" />
      </mesh>

      {/* All tiles */}
      {tileElements}
    </group>
  );
}
