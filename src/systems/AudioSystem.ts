// Web Audio API synthesized sound effects - no external files needed

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Utility: play a noise burst (for explosions, hits)
function noiseBurst(
  duration: number,
  volume: number,
  filterFreq: number,
  filterType: BiquadFilterType = 'lowpass',
) {
  const ctx = getCtx();
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = filterType;
  filter.frequency.setValueAtTime(filterFreq, ctx.currentTime);
  filter.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + duration);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

  source.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  source.start();
}

// Utility: play a tone sweep
function toneSweep(
  startFreq: number,
  endFreq: number,
  duration: number,
  volume: number,
  type: OscillatorType = 'square',
) {
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  osc.type = type;
  osc.frequency.setValueAtTime(startFreq, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(endFreq, ctx.currentTime + duration);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + duration);
}

// --- Sound Effects ---

export function playShoot() {
  toneSweep(1200, 300, 0.08, 0.15, 'square');
}

export function playEnemyShoot() {
  toneSweep(800, 200, 0.06, 0.08, 'sawtooth');
}

export function playHitBrick() {
  noiseBurst(0.08, 0.12, 2000);
}

export function playHitSteel() {
  const ctx = getCtx();
  // Metallic ping
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(3000, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.15);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.12, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.15);
}

export function playExplosionSmall() {
  noiseBurst(0.2, 0.2, 1500);
}

export function playExplosionBig() {
  noiseBurst(0.5, 0.35, 800);
  // Extra low rumble
  setTimeout(() => {
    noiseBurst(0.3, 0.15, 300);
  }, 80);
}

export function playPowerUp() {
  // Ascending arpeggio
  const ctx = getCtx();
  const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.value = freq;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.06);
    gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + i * 0.06 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.06 + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime + i * 0.06);
    osc.stop(ctx.currentTime + i * 0.06 + 0.1);
  });
}

export function playExtraLife() {
  // Cheerful double beep
  toneSweep(880, 1320, 0.1, 0.15, 'square');
  setTimeout(() => {
    toneSweep(1320, 1760, 0.15, 0.15, 'square');
  }, 120);
}

export function playGameOver() {
  // Descending sad melody
  const ctx = getCtx();
  const notes = [440, 392, 349, 262]; // A4, G4, F4, C4
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.value = freq;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.2);
    gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + i * 0.2 + 0.05);
    gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + i * 0.2 + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.2 + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime + i * 0.2);
    osc.stop(ctx.currentTime + i * 0.2 + 0.25);
  });
}

export function playStageStart() {
  // Fanfare
  const ctx = getCtx();
  const notes = [523, 659, 784]; // C5, E5, G5
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.value = freq;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.12);
    gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + i * 0.12 + 0.03);
    gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + i * 0.12 + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.2);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime + i * 0.12);
    osc.stop(ctx.currentTime + i * 0.12 + 0.2);
  });
}

export function playStageComplete() {
  // Victory jingle
  const ctx = getCtx();
  const notes = [523, 659, 784, 1047, 784, 1047]; // C5 E5 G5 C6 G5 C6
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.value = freq;

    const gain = ctx.createGain();
    const start = i * 0.1;
    gain.gain.setValueAtTime(0, ctx.currentTime + start);
    gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + start + 0.02);
    gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + start + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime + start);
    osc.stop(ctx.currentTime + start + 0.15);
  });
}

export function playMenuSelect() {
  toneSweep(600, 900, 0.06, 0.1, 'square');
}

export function playMenuConfirm() {
  toneSweep(400, 800, 0.1, 0.12, 'square');
  setTimeout(() => {
    toneSweep(800, 1200, 0.08, 0.1, 'square');
  }, 100);
}

export function playPlayerDeath() {
  noiseBurst(0.6, 0.3, 600);
  toneSweep(400, 80, 0.5, 0.15, 'sawtooth');
}

export function playBaseDestroyed() {
  // Dramatic low explosion
  noiseBurst(0.8, 0.4, 400);
  toneSweep(200, 40, 0.8, 0.2, 'sawtooth');
  setTimeout(() => {
    noiseBurst(0.5, 0.25, 200);
  }, 200);
}

export function playBulletBounce() {
  toneSweep(2000, 500, 0.05, 0.08, 'sine');
}

export function playFreeze() {
  toneSweep(2000, 4000, 0.2, 0.1, 'sine');
  setTimeout(() => {
    toneSweep(4000, 2000, 0.2, 0.08, 'sine');
  }, 150);
}

export function playBomb() {
  noiseBurst(0.8, 0.4, 1000);
  setTimeout(() => {
    noiseBurst(0.4, 0.3, 600);
  }, 100);
  setTimeout(() => {
    noiseBurst(0.3, 0.2, 300);
  }, 250);
}

// === BACKGROUND MUSIC ===

// Track active music nodes for cleanup
let bgmNodes: { oscs: OscillatorNode[]; gains: GainNode[]; timer: number } | null = null;

export function stopBGM() {
  if (!bgmNodes) return;
  clearTimeout(bgmNodes.timer);
  const fadeTime = 0.3;
  const ctx = getCtx();
  for (const g of bgmNodes.gains) {
    g.gain.cancelScheduledValues(ctx.currentTime);
    g.gain.setValueAtTime(g.gain.value, ctx.currentTime);
    g.gain.linearRampToValueAtTime(0, ctx.currentTime + fadeTime);
  }
  const oscs = bgmNodes.oscs;
  setTimeout(() => {
    for (const o of oscs) {
      try { o.stop(); } catch { /* already stopped */ }
    }
  }, fadeTime * 1000 + 50);
  bgmNodes = null;
}

// Menu BGM - chill retro loop
export function playMenuBGM() {
  stopBGM();
  const ctx = getCtx();

  // Melody notes: a calm, nostalgic 8-bit loop
  // Pattern repeats every ~4 seconds
  const melody = [
    // [freq, startBeat, duration]
    [330, 0, 0.4],    // E4
    [392, 0.5, 0.4],  // G4
    [440, 1, 0.4],    // A4
    [523, 1.5, 0.8],  // C5
    [440, 2.5, 0.4],  // A4
    [392, 3, 0.4],    // G4
    [330, 3.5, 0.8],  // E4
    [294, 4.5, 0.4],  // D4
    [330, 5, 0.4],    // E4
    [392, 5.5, 0.8],  // G4
    [440, 6.5, 0.4],  // A4
    [392, 7, 0.4],    // G4
    [330, 7.5, 0.8],  // E4
  ] as [number, number, number][];

  // Bass line
  const bass = [
    [165, 0, 1.8],    // E3
    [131, 2, 1.8],    // C3
    [147, 4, 1.8],    // D3
    [165, 6, 1.8],    // E3
  ] as [number, number, number][];

  const beatLen = 0.22; // seconds per beat
  const loopLen = 8.5 * beatLen * 1000; // ms

  const allOscs: OscillatorNode[] = [];
  const allGains: GainNode[] = [];

  function scheduleLoop() {
    const now = ctx.currentTime;

    // Melody
    for (const [freq, beat, dur] of melody) {
      const osc = ctx.createOscillator();
      osc.type = 'square';
      osc.frequency.value = freq;

      const gain = ctx.createGain();
      const start = now + beat * beatLen;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.06, start + 0.02);
      gain.gain.setValueAtTime(0.06, start + dur * beatLen - 0.03);
      gain.gain.linearRampToValueAtTime(0, start + dur * beatLen);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + dur * beatLen + 0.01);
      allOscs.push(osc);
      allGains.push(gain);
    }

    // Bass
    for (const [freq, beat, dur] of bass) {
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.value = freq;

      const gain = ctx.createGain();
      const start = now + beat * beatLen;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.07, start + 0.02);
      gain.gain.setValueAtTime(0.07, start + dur * beatLen - 0.05);
      gain.gain.linearRampToValueAtTime(0, start + dur * beatLen);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + dur * beatLen + 0.01);
      allOscs.push(osc);
      allGains.push(gain);
    }

    // Schedule next loop
    const timer = window.setTimeout(scheduleLoop, loopLen);
    if (bgmNodes) bgmNodes.timer = timer;
  }

  bgmNodes = { oscs: allOscs, gains: allGains, timer: 0 };
  scheduleLoop();
}

// In-game BGM - intense, driving beat
export function playGameBGM() {
  stopBGM();
  const ctx = getCtx();

  // Driving melody - more intense, martial feel
  const melody = [
    [392, 0, 0.3],    // G4
    [440, 0.5, 0.3],  // A4
    [523, 1, 0.5],    // C5
    [494, 1.75, 0.3], // B4
    [440, 2.25, 0.5], // A4
    [392, 3, 0.3],    // G4
    [349, 3.5, 0.3],  // F4
    [392, 4, 0.5],    // G4
    [440, 4.75, 0.3], // A4
    [523, 5.25, 0.3], // C5
    [587, 5.75, 0.5], // D5
    [523, 6.5, 0.3],  // C5
    [440, 7, 0.5],    // A4
    [392, 7.75, 0.5], // G4
  ] as [number, number, number][];

  // Driving bass
  const bass = [
    [196, 0, 0.8],    // G3
    [175, 1, 0.8],    // F3
    [165, 2, 0.8],    // E3
    [147, 3, 0.8],    // D3
    [196, 4, 0.8],    // G3
    [220, 5, 0.8],    // A3
    [175, 6, 0.8],    // F3
    [196, 7, 0.8],    // G3
  ] as [number, number, number][];

  // Percussion-like pulse (noise kicks on beats)
  const kicks = [0, 1, 2, 3, 4, 5, 6, 7];

  const beatLen = 0.18; // faster tempo
  const loopLen = 8.5 * beatLen * 1000;

  const allOscs: OscillatorNode[] = [];
  const allGains: GainNode[] = [];

  function scheduleLoop() {
    const now = ctx.currentTime;

    // Melody
    for (const [freq, beat, dur] of melody) {
      const osc = ctx.createOscillator();
      osc.type = 'square';
      osc.frequency.value = freq;

      const gain = ctx.createGain();
      const start = now + beat * beatLen;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.05, start + 0.015);
      gain.gain.setValueAtTime(0.05, start + dur * beatLen - 0.02);
      gain.gain.linearRampToValueAtTime(0, start + dur * beatLen);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + dur * beatLen + 0.01);
      allOscs.push(osc);
      allGains.push(gain);
    }

    // Bass
    for (const [freq, beat, dur] of bass) {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.value = freq;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 400;

      const gain = ctx.createGain();
      const start = now + beat * beatLen;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.08, start + 0.02);
      gain.gain.setValueAtTime(0.08, start + dur * beatLen - 0.03);
      gain.gain.linearRampToValueAtTime(0, start + dur * beatLen);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + dur * beatLen + 0.01);
      allOscs.push(osc);
      allGains.push(gain);
    }

    // Kick-like percussion
    for (const beat of kicks) {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      const start = now + beat * beatLen;
      osc.frequency.setValueAtTime(150, start);
      osc.frequency.exponentialRampToValueAtTime(40, start + 0.08);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.1, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.1);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.12);
      allOscs.push(osc);
      allGains.push(gain);
    }

    const timer = window.setTimeout(scheduleLoop, loopLen);
    if (bgmNodes) bgmNodes.timer = timer;
  }

  bgmNodes = { oscs: allOscs, gains: allGains, timer: 0 };
  scheduleLoop();
}

// Initialize audio context on first user interaction
export function initAudio() {
  getCtx();
}
