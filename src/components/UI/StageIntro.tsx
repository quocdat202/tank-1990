import { useEffect, useState } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { playStageStart, playGameBGM } from '../../systems/AudioSystem';

export function StageIntro() {
  const stage = useGameStore((s) => s.stage);
  const setPhase = useGameStore((s) => s.setPhase);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setVisible(true);
    playStageStart();
    const timer = setTimeout(() => {
      setVisible(false);
      playGameBGM();
      setPhase('PLAYING');
    }, 2500);
    return () => clearTimeout(timer);
  }, [stage, setPhase]);

  if (!visible) return null;

  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      background: '#636363', color: '#000', fontFamily: 'monospace',
      zIndex: 100, transition: 'opacity 0.3s',
    }}>
      <h1 style={{ fontSize: 36, letterSpacing: 6 }}>
        STAGE {stage}
      </h1>
    </div>
  );
}
