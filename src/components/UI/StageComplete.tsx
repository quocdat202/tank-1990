import { useEffect, useState } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { usePlayerStore } from '../../stores/playerStore';
import { ENEMY_TANK_TYPES } from '../../data/tankTypes';
import { levels } from '../../data/levels';
import { playMenuConfirm, stopBGM } from '../../systems/AudioSystem';

export function StageComplete() {
  const stage = useGameStore((s) => s.stage);
  const nextStage = useGameStore((s) => s.nextStage);
  const reset = useGameStore((s) => s.reset);
  const p1 = usePlayerStore((s) => s.player1);
  const [show, setShow] = useState(false);

  useEffect(() => {
    stopBGM();
    const t = setTimeout(() => setShow(true), 500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!show) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'Enter' || e.code === 'Space') {
        playMenuConfirm();
        if (stage < levels.length) {
          usePlayerStore.getState().resetKillCounts();
          nextStage();
        } else {
          reset();
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [show, stage, nextStage, reset]);

  const totalKills = p1.killCounts.reduce((a, b) => a + b, 0);
  const totalPoints = p1.killCounts.reduce((sum, count, i) => sum + count * ENEMY_TANK_TYPES[i].points, 0);

  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.9)', color: '#fff', fontFamily: 'monospace',
      zIndex: 100, opacity: show ? 1 : 0, transition: 'opacity 0.5s',
    }}>
      <h2 style={{ fontSize: 24, color: '#FFD700', marginBottom: 30, letterSpacing: 4 }}>
        STAGE {stage} CLEAR
      </h2>

      <div style={{ width: 300, fontSize: 13 }}>
        {ENEMY_TANK_TYPES.map((type, i) => (
          <div key={type.name} style={{
            display: 'flex', justifyContent: 'space-between', padding: '6px 0',
            borderBottom: '1px solid #333',
          }}>
            <span style={{ color: type.color }}>{type.name}</span>
            <span>{p1.killCounts[i]} x {type.points} = {p1.killCounts[i] * type.points}</span>
          </div>
        ))}
        <div style={{
          display: 'flex', justifyContent: 'space-between', padding: '10px 0',
          fontWeight: 'bold', color: '#FFD700', fontSize: 15,
        }}>
          <span>TOTAL</span>
          <span>{totalKills} kills / {totalPoints} pts</span>
        </div>
      </div>

      <div style={{ marginTop: 20, fontSize: 16, color: '#FFD700' }}>
        SCORE: {p1.score}
      </div>

      {show && (
        <p style={{ marginTop: 30, fontSize: 12, color: '#888' }}>
          {stage < levels.length ? 'PRESS ENTER FOR NEXT STAGE' : 'PRESS ENTER - YOU WON!'}
        </p>
      )}
    </div>
  );
}
