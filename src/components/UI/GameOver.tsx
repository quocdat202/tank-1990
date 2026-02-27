import { useEffect, useState } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { usePlayerStore } from '../../stores/playerStore';
import { playGameOver, playMenuConfirm, stopBGM } from '../../systems/AudioSystem';

export function GameOver() {
  const reset = useGameStore((s) => s.reset);
  const p1 = usePlayerStore((s) => s.player1);
  const stage = useGameStore((s) => s.stage);
  const [show, setShow] = useState(false);

  useEffect(() => {
    stopBGM();
    playGameOver();
    const timer = setTimeout(() => setShow(true), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!show) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'Enter' || e.code === 'Space') {
        playMenuConfirm();
        reset();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [show, reset]);

  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.85)', color: '#fff', fontFamily: 'monospace',
      zIndex: 100, transition: 'opacity 0.5s', opacity: show ? 1 : 0,
    }}>
      <h1 style={{ fontSize: 48, color: '#FF0000', marginBottom: 30, letterSpacing: 6 }}>
        GAME OVER
      </h1>
      <div style={{ fontSize: 14, color: '#aaa', marginBottom: 10 }}>
        STAGE {stage}
      </div>
      <div style={{ fontSize: 18, color: '#FFD700', marginBottom: 40 }}>
        SCORE: {p1.score}
      </div>
      {show && (
        <p style={{ fontSize: 14, color: '#888', animation: 'blink 1s infinite' }}>
          PRESS ENTER TO CONTINUE
        </p>
      )}
    </div>
  );
}
