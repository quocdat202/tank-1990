import { TILE_SIZE } from '../../data/constants';

interface TreeProps {
  x: number;
  y: number;
}

const HALF = TILE_SIZE / 2;

export function Tree({ x, y }: TreeProps) {
  return (
    <mesh position={[x + HALF, 0.6, y + HALF]}>
      <boxGeometry args={[TILE_SIZE, 0.05, TILE_SIZE]} />
      <meshStandardMaterial color="#228B22" transparent opacity={0.85} />
    </mesh>
  );
}
