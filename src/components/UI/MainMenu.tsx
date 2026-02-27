import { useState, useEffect } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { initAudio, playMenuSelect, playMenuConfirm, playMenuBGM, stopBGM } from '../../systems/AudioSystem';
import type { GameMode } from '../../types/game';

export function MainMenu() {
  const [selected, setSelected] = useState(0);
  const startGame = useGameStore((s) => s.startGame);

  const options: { label: string; mode: GameMode }[] = [
    { label: '1 PLAYER', mode: '1P' },
    { label: '2 PLAYERS', mode: '2P' },
  ];

  // Start menu BGM on first interaction
  const [bgmStarted, setBgmStarted] = useState(false);

  useEffect(() => {
    if (bgmStarted) return;
    const startBgm = () => {
      initAudio();
      playMenuBGM();
      setBgmStarted(true);
      window.removeEventListener('keydown', startBgm);
      window.removeEventListener('click', startBgm);
    };
    window.addEventListener('keydown', startBgm);
    window.addEventListener('click', startBgm);
    return () => {
      window.removeEventListener('keydown', startBgm);
      window.removeEventListener('click', startBgm);
    };
  }, [bgmStarted]);

  // Stop menu BGM on unmount
  useEffect(() => {
    return () => { stopBGM(); };
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'ArrowUp' || e.code === 'KeyW') {
        setSelected((s) => (s - 1 + options.length) % options.length);
        initAudio();
        playMenuSelect();
      } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        setSelected((s) => (s + 1) % options.length);
        initAudio();
        playMenuSelect();
      } else if (e.code === 'Enter' || e.code === 'Space') {
        initAudio();
        playMenuConfirm();
        startGame(options[selected].mode);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [selected, startGame]);

  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      background: '#000', color: '#fff', fontFamily: '"Press Start 2P", monospace',
      zIndex: 100,
    }}>
      <div style={{ marginBottom: 60 }}>
        <h1 style={{
          fontSize: 48, color: '#FFD700', textShadow: '3px 3px 0 #B8860B, 6px 6px 0 #8B6508',
          letterSpacing: 4, marginBottom: 8,
        }}>
          TANK 1990
        </h1>
        <p style={{ fontSize: 12, color: '#888', textAlign: 'center' }}>BATTLE CITY</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 40 }}>
        {options.map((opt, i) => (
          <div
            key={opt.mode}
            onClick={() => startGame(opt.mode)}
            style={{
              fontSize: 20, cursor: 'pointer', padding: '10px 30px',
              color: selected === i ? '#FFD700' : '#fff',
              display: 'flex', alignItems: 'center', gap: 15,
            }}
          >
            <span style={{ visibility: selected === i ? 'visible' : 'hidden', color: '#FFD700' }}>
              &#9654;
            </span>
            {opt.label}
          </div>
        ))}
      </div>

      <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 12, fontSize: 11, color: '#666' }}>
        <p>WASD / Arrows - Move | Space - Shoot</p>
        <p>P2: Numpad 8/4/5/6 - Move | Numpad 0 - Shoot</p>
        <p>ESC - Pause</p>
      </div>

      <div style={{ position: 'absolute', bottom: 30, fontSize: 10, color: '#444' }}>
        PRESS ENTER TO START
      </div>
    </div>
  );
}
