import { TILE_SIZE } from '../../data/constants';

interface SteelWallProps {
  x: number;
  y: number;
}

const HALF = TILE_SIZE / 2;
const HEIGHT = 0.5;

export function SteelWall({ x, y }: SteelWallProps) {
  return (
    <mesh position={[x + HALF, HEIGHT / 2, y + HALF]}>
      <boxGeometry args={[TILE_SIZE, HEIGHT, TILE_SIZE]} />
      <meshStandardMaterial color="#C0C0C0" metalness={0.8} roughness={0.2} />
    </mesh>
  );
}
