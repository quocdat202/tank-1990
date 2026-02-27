import { useGameStore } from '../../stores/gameStore';
import { usePlayerStore } from '../../stores/playerStore';
import { useEnemyStore } from '../../stores/enemyStore';
import { TOTAL_ENEMIES_PER_STAGE } from '../../data/constants';

export function HUD() {
  const stage = useGameStore((s) => s.stage);
  const mode = useGameStore((s) => s.mode);
  const p1 = usePlayerStore((s) => s.player1);
  const p2 = usePlayerStore((s) => s.player2);
  const totalSpawned = useEnemyStore((s) => s.totalSpawned);
  const enemies = useEnemyStore((s) => s.enemies);
  const aliveEnemies = enemies.filter((e) => e.isAlive).length;
  const remainingEnemies = TOTAL_ENEMIES_PER_STAGE - totalSpawned + aliveEnemies;

  const enemyIcons = [];
  for (let i = 0; i < remainingEnemies; i++) {
    enemyIcons.push(
      <div key={i} style={{
        width: 12, height: 12, background: '#C00', margin: 1, borderRadius: 1,
      }} />,
    );
  }

  return (
    <div style={{
      position: 'absolute', right: 10, top: 10, bottom: 10, width: 50,
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      fontFamily: 'monospace', color: '#fff', fontSize: 10,
      zIndex: 50,
    }}>
      {/* Enemy count */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', width: 30, gap: 0, marginBottom: 20,
        justifyContent: 'center',
      }}>
        {enemyIcons}
      </div>

      {/* P1 info */}
      <div style={{ marginTop: 'auto', textAlign: 'center' }}>
        <div style={{ color: '#FFD700', fontWeight: 'bold', fontSize: 11 }}>1P</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
          <span style={{ fontSize: 14 }}>&#9813;</span>
          <span>{Math.max(0, p1.lives)}</span>
        </div>
        <div style={{ fontSize: 9, color: '#aaa', marginTop: 2 }}>
          {p1.score}
        </div>
      </div>

      {/* P2 info */}
      {mode === '2P' && (
        <div style={{ marginTop: 15, textAlign: 'center' }}>
          <div style={{ color: '#40C040', fontWeight: 'bold', fontSize: 11 }}>2P</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
            <span style={{ fontSize: 14 }}>&#9813;</span>
            <span>{Math.max(0, p2.lives)}</span>
          </div>
          <div style={{ fontSize: 9, color: '#aaa', marginTop: 2 }}>
            {p2.score}
          </div>
        </div>
      )}

      {/* Stage */}
      <div style={{ marginTop: 15, textAlign: 'center', marginBottom: 10 }}>
        <div style={{ fontSize: 14 }}>&#9873;</div>
        <div style={{ fontWeight: 'bold' }}>{stage}</div>
      </div>
    </div>
  );
}
