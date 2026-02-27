import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { TILE_SIZE } from '../../data/constants';
import type { Mesh } from 'three';

interface WaterProps {
  x: number;
  y: number;
}

const HALF = TILE_SIZE / 2;

export function Water({ x, y }: WaterProps) {
  const meshRef = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      // Subtle wave animation
      meshRef.current.position.y = -0.05 + Math.sin(clock.getElapsedTime() * 2 + x + y) * 0.02;
    }
  });

  return (
    <mesh ref={meshRef} position={[x + HALF, -0.05, y + HALF]}>
      <boxGeometry args={[TILE_SIZE, 0.1, TILE_SIZE]} />
      <meshStandardMaterial color="#1E90FF" transparent opacity={0.7} />
    </mesh>
  );
}
