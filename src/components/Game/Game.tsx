import { useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrthographicCamera } from '@react-three/drei';
import { GameScene } from './GameScene';
import { useGameStore } from '../../stores/gameStore';
import { MainMenu } from '../UI/MainMenu';
import { HUD } from '../UI/HUD';
import { PauseMenu } from '../UI/PauseMenu';
import { GameOver } from '../UI/GameOver';
import { StageIntro } from '../UI/StageIntro';
import { StageComplete } from '../UI/StageComplete';
import { GRID_SIZE } from '../../data/constants';

export function Game() {
  const phase = useGameStore((s) => s.phase);
  const half = GRID_SIZE / 2;

  // Global keyboard state (accessible from useFrame)
  useEffect(() => {
    const keys = new Set<string>();
    (window as unknown as { __keys: Set<string> }).__keys = keys;

    const onDown = (e: KeyboardEvent) => {
      keys.add(e.code);
      // Pause toggle
      if (e.code === 'Escape') {
        useGameStore.getState().togglePause();
      }
    };
    const onUp = (e: KeyboardEvent) => keys.delete(e.code);

    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
    };
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000', position: 'relative' }}>
      {/* 3D Canvas (always mounted for performance) */}
      <Canvas style={{ position: 'absolute', inset: 0 }}>
        <OrthographicCamera
          makeDefault
          position={[half, 30, half]}
          rotation={[-Math.PI / 2, 0, 0]}
          zoom={28}
          near={0.1}
          far={100}
        />
        <GameScene />
      </Canvas>

      {/* UI Overlays */}
      {phase === 'MENU' && <MainMenu />}
      {phase === 'STAGE_INTRO' && <StageIntro />}
      {(phase === 'PLAYING' || phase === 'PAUSED') && <HUD />}
      {phase === 'PAUSED' && <PauseMenu />}
      {phase === 'GAME_OVER' && <GameOver />}
      {phase === 'STAGE_COMPLETE' && <StageComplete />}
    </div>
  );
}
