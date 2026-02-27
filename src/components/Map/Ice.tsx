import { TILE_SIZE } from '../../data/constants';

interface IceProps {
  x: number;
  y: number;
}

const HALF = TILE_SIZE / 2;

export function Ice({ x, y }: IceProps) {
  return (
    <mesh position={[x + HALF, 0.01, y + HALF]}>
      <boxGeometry args={[TILE_SIZE, 0.02, TILE_SIZE]} />
      <meshStandardMaterial color="#ADD8E6" metalness={0.3} roughness={0.1} />
    </mesh>
  );
}
