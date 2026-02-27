import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Mesh } from 'three';
import type { PowerUp } from '../../types/game';
import { POWERUP_BLINK_TIME } from '../../data/constants';

const POWER_UP_COLORS: Record<string, string> = {
  star: '#FFD700',
  shield: '#00BFFF',
  bomb: '#FF4500',
  timer: '#9370DB',
  life: '#FF69B4',
  fortress: '#8B4513',
  gun: '#00FF00',
};

interface Props {
  powerUp: PowerUp;
}

export function PowerUpMesh({ powerUp }: Props) {
  const meshRef = useRef<Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const elapsed = Date.now() - powerUp.spawnTime;
    if (elapsed > POWERUP_BLINK_TIME) {
      meshRef.current.visible = Math.sin(state.clock.getElapsedTime() * 20) > 0;
    }
    meshRef.current.position.y = 0.3 + Math.sin(state.clock.getElapsedTime() * 3) * 0.1;
    meshRef.current.rotation.y += 0.03;
  });

  const color = POWER_UP_COLORS[powerUp.type] || '#FFFFFF';

  return (
    <mesh ref={meshRef} position={[powerUp.x, 0.3, powerUp.y]}>
      <boxGeometry args={[0.6, 0.6, 0.6]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
    </mesh>
  );
}
