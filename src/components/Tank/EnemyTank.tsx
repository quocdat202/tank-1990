import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Group } from 'three';
import type { EnemyTank as EnemyTankType } from '../../types/game';
import { TankModel } from './TankModel';

const ENEMY_SCHEMES: { body: string; accent: string; emissive: string }[] = [
  { body: '#5A5A5A', accent: '#888888', emissive: '#666666' },  // Basic - gunmetal
  { body: '#1A5C8A', accent: '#3AAADE', emissive: '#2090CC' },  // Fast - electric blue
  { body: '#2A7A2A', accent: '#44DD44', emissive: '#22BB22' },  // Power - toxic green
  { body: '#8A4A1A', accent: '#FF8800', emissive: '#DD6600' },  // Armor - molten orange
];

const ARMOR_DAMAGE_COLORS: { body: string; accent: string; emissive: string }[] = [
  { body: '#8A4A1A', accent: '#FF8800', emissive: '#DD6600' },
  { body: '#7A6A1A', accent: '#FFCC00', emissive: '#DDAA00' },
  { body: '#5A2A2A', accent: '#FF4444', emissive: '#DD2222' },
  { body: '#5A5A5A', accent: '#CCCCCC', emissive: '#999999' },
];

const RED_SCHEME = { body: '#8B0000', accent: '#FF0000', emissive: '#FF0000' };

interface EnemyTankProps {
  enemy: EnemyTankType;
}

export function EnemyTankMesh({ enemy }: EnemyTankProps) {
  const groupRef = useRef<Group>(null);
  const flashRef = useRef(0);
  const [isRedPhase, setIsRedPhase] = useState(false);

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.position.x = enemy.x;
    groupRef.current.position.z = enemy.y;

    switch (enemy.direction) {
      case 'UP': groupRef.current.rotation.y = 0; break;
      case 'DOWN': groupRef.current.rotation.y = Math.PI; break;
      case 'LEFT': groupRef.current.rotation.y = Math.PI / 2; break;
      case 'RIGHT': groupRef.current.rotation.y = -Math.PI / 2; break;
    }

    if (enemy.spawnTimer > 0) {
      flashRef.current += 0.2;
      groupRef.current.visible = Math.sin(flashRef.current * 10) > 0;
    } else {
      groupRef.current.visible = true;
    }

    // Update flashing state for power-up carriers inside useFrame
    if (enemy.isFlashing) {
      const red = Math.sin(state.clock.getElapsedTime() * 6) > 0;
      if (red !== isRedPhase) setIsRedPhase(red);
    }
  });

  if (!enemy.isAlive) return null;

  let scheme = ENEMY_SCHEMES[enemy.typeIndex] || ENEMY_SCHEMES[0];

  if (enemy.typeIndex === 3) {
    const hpIndex = Math.max(0, Math.min(3, 4 - enemy.hp));
    scheme = ARMOR_DAMAGE_COLORS[hpIndex];
  }

  const showRed = enemy.isFlashing && isRedPhase;
  const finalScheme = showRed ? RED_SCHEME : scheme;

  return (
    <group ref={groupRef} position={[enemy.x, 0, enemy.y]}>
      <TankModel
        bodyColor={finalScheme.body}
        accentColor={finalScheme.accent}
        emissiveColor={finalScheme.emissive}
        trackColor="#1A1A1A"
        emissiveIntensity={showRed ? 0.8 : 0.3}
        level={enemy.typeIndex >= 2 ? 2 : 1}
      />
    </group>
  );
}
