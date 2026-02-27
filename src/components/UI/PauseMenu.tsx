import { useGameStore } from '../../stores/gameStore';

export function PauseMenu() {
  const togglePause = useGameStore((s) => s.togglePause);
  const reset = useGameStore((s) => s.reset);

  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.7)', color: '#fff', fontFamily: 'monospace',
      zIndex: 100,
    }}>
      <h2 style={{ fontSize: 32, marginBottom: 40, color: '#FFD700' }}>PAUSED</h2>
      <button onClick={togglePause} style={btnStyle}>RESUME</button>
      <button onClick={reset} style={{ ...btnStyle, marginTop: 15 }}>QUIT TO MENU</button>
      <p style={{ marginTop: 30, fontSize: 12, color: '#888' }}>Press ESC to resume</p>
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  padding: '12px 40px', fontSize: 16, fontFamily: 'monospace',
  background: 'transparent', border: '2px solid #FFD700', color: '#FFD700',
  cursor: 'pointer', letterSpacing: 2,
};
