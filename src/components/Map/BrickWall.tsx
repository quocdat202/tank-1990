import { useMapStore } from '../../stores/mapStore';
import { TILE_SIZE } from '../../data/constants';
import type { BrickSubTiles } from '../../types/game';

interface BrickWallProps {
  x: number;
  y: number;
}

const HALF = TILE_SIZE / 2;
const QUARTER = TILE_SIZE / 4;
const HEIGHT = 0.4;

function SubTile({ offsetX, offsetZ }: { offsetX: number; offsetZ: number }) {
  return (
    <mesh position={[offsetX, HEIGHT / 2, offsetZ]}>
      <boxGeometry args={[HALF, HEIGHT, HALF]} />
      <meshStandardMaterial color="#B85C38" />
    </mesh>
  );
}

export function BrickWall({ x, y }: BrickWallProps) {
  const brickSubTiles = useMapStore((s) => s.brickSubTiles);
  const key = `${x},${y}`;
  const sub: BrickSubTiles | undefined = brickSubTiles[key];

  if (!sub) return null;

  // sub = [topLeft, topRight, bottomLeft, bottomRight]
  // In 3D: top = +z (higher y in grid), bottom = -z
  return (
    <group position={[x + HALF, 0, y + HALF]}>
      {sub[0] && <SubTile offsetX={-QUARTER} offsetZ={QUARTER} />}
      {sub[1] && <SubTile offsetX={QUARTER} offsetZ={QUARTER} />}
      {sub[2] && <SubTile offsetX={-QUARTER} offsetZ={-QUARTER} />}
      {sub[3] && <SubTile offsetX={QUARTER} offsetZ={-QUARTER} />}
    </group>
  );
}
