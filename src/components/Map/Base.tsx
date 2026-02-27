import { TILE_SIZE } from '../../data/constants';

interface BaseProps {
  x: number;
  y: number;
}

const HALF = TILE_SIZE / 2;
const HEIGHT = 0.3;

export function Base({ x, y }: BaseProps) {
  return (
    <group position={[x + HALF, 0, y + HALF]}>
      {/* Base platform */}
      <mesh position={[0, HEIGHT / 2, 0]}>
        <boxGeometry args={[TILE_SIZE * 0.8, HEIGHT, TILE_SIZE * 0.8]} />
        <meshStandardMaterial color="#FFD700" />
      </mesh>
      {/* Eagle/flag symbol on top */}
      <mesh position={[0, HEIGHT + 0.1, 0]}>
        <coneGeometry args={[0.2, 0.3, 4]} />
        <meshStandardMaterial color="#FF4500" />
      </mesh>
    </group>
  );
}
