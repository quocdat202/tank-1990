import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { usePlayerStore } from '../../stores/playerStore';
import { useBulletStore } from '../../stores/bulletStore';
import { useGameStore } from '../../stores/gameStore';
import { canTankMoveTo } from '../../systems/CollisionSystem';
import { TANK_SPEED, DIRECTION_VECTORS } from '../../data/constants';
import { TankModel } from './TankModel';
import { playShoot } from '../../systems/AudioSystem';
import type { Direction } from '../../types/game';
import type { Group } from 'three';

const P1_COLORS = { body: '#C8960A', accent: '#FFD700', emissive: '#FFAA00' };
const P2_COLORS = { body: '#0A8A7A', accent: '#00FFD0', emissive: '#00DDAA' };

interface Props {
  playerId: string;
}

export function PlayerTank({ playerId }: Props) {
  const groupRef = useRef<Group>(null);
  const lastShootRef = useRef(0);

  useFrame((_, delta) => {
    const phase = useGameStore.getState().phase;
    if (phase !== 'PLAYING') return;

    const player = usePlayerStore.getState().getPlayer(playerId);
    if (!player.isAlive) return;

    const dt = Math.min(delta, 0.05);

    const keys = (window as unknown as { __keys?: Set<string> }).__keys;
    if (!keys) return;

    let direction: Direction | null = null;
    if (playerId === 'player1') {
      if (keys.has('ArrowUp') || keys.has('KeyW')) direction = 'UP';
      else if (keys.has('ArrowDown') || keys.has('KeyS')) direction = 'DOWN';
      else if (keys.has('ArrowLeft') || keys.has('KeyA')) direction = 'LEFT';
      else if (keys.has('ArrowRight') || keys.has('KeyD')) direction = 'RIGHT';
    } else {
      if (keys.has('Numpad8')) direction = 'UP';
      else if (keys.has('Numpad5') || keys.has('Numpad2')) direction = 'DOWN';
      else if (keys.has('Numpad4')) direction = 'LEFT';
      else if (keys.has('Numpad6')) direction = 'RIGHT';
    }

    if (direction) {
      if (direction !== player.direction) {
        usePlayerStore.getState().setDirection(playerId, direction);
      }
      const speed = TANK_SPEED * dt;
      const result = canTankMoveTo(player.x, player.y, direction, speed);
      if (result.canMove) {
        usePlayerStore.getState().setPosition(playerId, result.newX, result.newY);
      }
      usePlayerStore.getState().setMoving(playerId, true);
    } else {
      usePlayerStore.getState().setMoving(playerId, false);
    }

    const shootKey = playerId === 'player1' ? 'Space' : 'Numpad0';
    if (keys.has(shootKey)) {
      const now = performance.now();
      if (now - lastShootRef.current > 250) {
        const p = usePlayerStore.getState().getPlayer(playerId);
        const canShoot = usePlayerStore.getState().shoot(playerId);
        if (canShoot) {
          const dir = DIRECTION_VECTORS[p.direction];
          useBulletStore.getState().addBullet(
            p.x + dir.x * 0.5, p.y + dir.y * 0.5,
            p.direction, playerId, true, p.level,
          );
          playShoot();
          lastShootRef.current = now;
        }
      }
    }

    if (groupRef.current) {
      const p = usePlayerStore.getState().getPlayer(playerId);
      groupRef.current.position.x = p.x;
      groupRef.current.position.z = p.y;

      switch (p.direction) {
        case 'UP': groupRef.current.rotation.y = 0; break;
        case 'DOWN': groupRef.current.rotation.y = Math.PI; break;
        case 'LEFT': groupRef.current.rotation.y = Math.PI / 2; break;
        case 'RIGHT': groupRef.current.rotation.y = -Math.PI / 2; break;
      }
    }
  });

  const colors = playerId === 'player1' ? P1_COLORS : P2_COLORS;
  const player = usePlayerStore((s) => s[playerId === 'player2' ? 'player2' : 'player1']);

  if (!player.isAlive) return null;

  return (
    <group ref={groupRef} position={[player.x, 0, player.y]}>
      <TankModel
        bodyColor={colors.body}
        accentColor={colors.accent}
        emissiveColor={colors.emissive}
        emissiveIntensity={0.4}
        isMoving={player.isMoving}
        isShielded={player.isShielded}
        level={player.level}
      />
    </group>
  );
}
