import { useEffect, useRef } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { useMapStore } from '../../stores/mapStore';
import { useEnemyStore } from '../../stores/enemyStore';
import { usePlayerStore } from '../../stores/playerStore';
import { useBulletStore } from '../../stores/bulletStore';
import { useEffectStore } from '../../stores/effectStore';
import { usePowerUpStore } from '../../stores/powerUpStore';
import { GameMap } from '../Map/GameMap';
import { PlayerTank } from '../Tank/PlayerTank';
import { EnemyTankMesh } from '../Tank/EnemyTank';
import { BulletManager } from '../Bullet/BulletManager';
import { GameLoop } from './GameLoop';
import { PowerUpMesh } from '../PowerUp/PowerUpMesh';
import { Explosion } from '../Effects/Explosion';

export function GameScene() {
  const phase = useGameStore((s) => s.phase);
  const stage = useGameStore((s) => s.stage);
  const mode = useGameStore((s) => s.mode);
  const enemies = useEnemyStore((s) => s.enemies);
  const explosions = useEffectStore((s) => s.explosions);
  const powerUps = usePowerUpStore((s) => s.powerUps);
  const initializedStageRef = useRef(-1);

  // Initialize stage only once when a new stage starts playing
  useEffect(() => {
    if (phase === 'PLAYING' && initializedStageRef.current !== stage) {
      initializedStageRef.current = stage;
      useMapStore.getState().loadStage(stage);
      useEnemyStore.getState().initStage(stage);
      useBulletStore.getState().clearBullets();
      useEffectStore.getState().reset();
      usePowerUpStore.getState().reset();
      usePlayerStore.getState().respawn('player1');
      if (mode === '2P') usePlayerStore.getState().respawn('player2');
    }
  }, [phase, stage, mode]);

  // Reset initialized stage when going back to menu
  useEffect(() => {
    if (phase === 'MENU') {
      initializedStageRef.current = -1;
    }
  }, [phase]);

  if (phase !== 'PLAYING' && phase !== 'PAUSED') return null;

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 20, 10]} intensity={0.8} />

      <GameMap />
      <PlayerTank playerId="player1" />
      {mode === '2P' && <PlayerTank playerId="player2" />}

      {enemies.filter((e) => e.isAlive).map((enemy) => (
        <EnemyTankMesh key={enemy.id} enemy={enemy} />
      ))}

      <BulletManager />

      {powerUps.map((pu) => (
        <PowerUpMesh key={pu.id} powerUp={pu} />
      ))}

      {explosions.map((exp) => (
        <Explosion key={exp.id} x={exp.x} y={exp.y} big={exp.big} />
      ))}

      <GameLoop />
    </>
  );
}
