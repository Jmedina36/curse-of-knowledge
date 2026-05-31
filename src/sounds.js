let audioCtx = null;

const ctx = () => {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
};

// ── Primitives ────────────────────────────────────────────────────────────────

const tone = (freq, dur, type = 'sine', vol = 0.25, delay = 0) => {
  try {
    const ac = ctx();
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ac.currentTime + delay);
    gain.gain.setValueAtTime(0.001, ac.currentTime + delay);
    gain.gain.linearRampToValueAtTime(vol, ac.currentTime + delay + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + delay + dur);
    osc.start(ac.currentTime + delay);
    osc.stop(ac.currentTime + delay + dur + 0.02);
  } catch (e) {}
};

const sweep = (f1, f2, dur, type = 'sine', vol = 0.2, delay = 0) => {
  try {
    const ac = ctx();
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(f1, ac.currentTime + delay);
    osc.frequency.exponentialRampToValueAtTime(f2, ac.currentTime + delay + dur);
    gain.gain.setValueAtTime(vol, ac.currentTime + delay);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + delay + dur);
    osc.start(ac.currentTime + delay);
    osc.stop(ac.currentTime + delay + dur + 0.02);
  } catch (e) {}
};

// Filtered white noise burst — the key ingredient for punchy impact sounds
const noise = (dur, vol = 0.2, delay = 0, hpFreq = 0, lpFreq = 8000) => {
  try {
    const ac = ctx();
    const bufSize = Math.floor(ac.sampleRate * (dur + 0.1));
    const buf = ac.createBuffer(1, bufSize, ac.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;

    const src = ac.createBufferSource();
    src.buffer = buf;

    const gain = ac.createGain();
    gain.gain.setValueAtTime(vol, ac.currentTime + delay);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + delay + dur);

    const lp = ac.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = lpFreq;

    if (hpFreq > 0) {
      const hp = ac.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.value = hpFreq;
      src.connect(hp);
      hp.connect(lp);
    } else {
      src.connect(lp);
    }
    lp.connect(gain);
    gain.connect(ac.destination);
    src.start(ac.currentTime + delay);
  } catch (e) {}
};

// ── Combat sounds ─────────────────────────────────────────────────────────────

export const sounds = {

  // ── Boss takes damage: metallic clang + body thump ──────────────────────────
  bossDamage: () => {
    // Metallic impact ring (sword vs flesh/armor)
    sweep(420, 180, 0.14, 'sawtooth', 0.28);
    tone(800, 0.06, 'square', 0.18);
    // Noise punch — mid-band crunch
    noise(0.07, 0.35, 0, 400, 3500);
    // Deep sub thump
    sweep(140, 55, 0.2, 'sine', 0.32, 0.02);
    // Metallic ring-out
    tone(1100, 0.22, 'sine', 0.1, 0.04);
  },

  // ── Player takes damage: heavy thud + low hurt tone ─────────────────────────
  playerDamage: () => {
    // Heavy body impact
    sweep(280, 70, 0.22, 'sawtooth', 0.32);
    // Low punch thud (noise + sub)
    noise(0.1, 0.4, 0, 60, 600);
    sweep(90, 40, 0.28, 'sine', 0.28, 0.01);
    // Dissonant sting — "that hurt"
    tone(220, 0.12, 'square', 0.12, 0.03);
  },

  // ── Critical hit: sharp crack + extra resonance ──────────────────────────────
  critHit: () => {
    // Sharp crack (high noise burst)
    noise(0.05, 0.45, 0, 1200, 7000);
    // Dramatic pitch drop
    sweep(700, 100, 0.16, 'sawtooth', 0.38);
    // Heavy sub
    sweep(200, 50, 0.28, 'sine', 0.3, 0.03);
    // Ringing overtone
    tone(1600, 0.25, 'sine', 0.14, 0.03);
    tone(900, 0.3, 'sine', 0.1, 0.07);
  },

  // ── Charged Strike: electric buildup + massive impact ───────────────────────
  chargedStrike: () => {
    // Crackling electric sizzle
    noise(0.06, 0.18, 0, 2500, 9000);
    // Rising electric whine
    sweep(600, 2400, 0.12, 'sawtooth', 0.22);
    // IMPACT — everything hits at once
    sweep(500, 55, 0.35, 'sawtooth', 0.45, 0.1);
    noise(0.18, 0.55, 0.1, 150, 2800);
    sweep(80, 30, 0.4, 'sine', 0.38, 0.11);
    // Metallic ring-out
    tone(1400, 0.35, 'sine', 0.18, 0.11);
    tone(980, 0.45, 'sine', 0.12, 0.16);
    // Electric tail
    noise(0.12, 0.1, 0.22, 3000, 8000);
  },

  // ── Charge gained: subtle electric tick ─────────────────────────────────────
  chargeGain: () => {
    sweep(380, 580, 0.07, 'sine', 0.14);
    noise(0.04, 0.08, 0, 2000, 6000);
  },

  // ── Charges full: electric shimmer alert ────────────────────────────────────
  chargeFull: () => {
    [700, 900, 1100, 1500].forEach((f, i) => tone(f, 0.13, 'sine', 0.16, i * 0.045));
    sweep(500, 1800, 0.28, 'sine', 0.22, 0.12);
    noise(0.14, 0.12, 0.12, 2800, 8000);
  },

  // ── Special attack: class ability whoosh ────────────────────────────────────
  specialAttack: () => {
    sweep(300, 1100, 0.22, 'sine', 0.28);
    sweep(250, 850, 0.28, 'triangle', 0.18, 0.05);
    noise(0.14, 0.22, 0.08, 600, 4500);
    tone(880, 0.32, 'sine', 0.2, 0.18);
    tone(660, 0.4, 'sine', 0.12, 0.24);
  },

  // ── Boss / enemy entrance: deep cinematic boom ──────────────────────────────
  bossEntrance: () => {
    // Sub boom
    sweep(130, 38, 0.55, 'sine', 0.38);
    noise(0.35, 0.28, 0, 20, 250);
    // Rising swell
    [200, 260, 330].forEach((f, i) => sweep(f * 0.4, f, 0.65, 'sawtooth', 0.12, i * 0.09));
    // Impact crack
    noise(0.08, 0.38, 0.3, 500, 3500);
    sweep(400, 90, 0.2, 'sawtooth', 0.3, 0.3);
  },

  // ── Battle victory: triumphant resolved fanfare ──────────────────────────────
  victory: () => {
    // Opening chord
    [523, 659, 784].forEach((f, i) => tone(f, 0.28, 'sine', 0.22, i * 0.04));
    // Rise
    setTimeout(() => [659, 784, 1047].forEach((f, i) => tone(f, 0.32, 'sine', 0.24, i * 0.04)), 260);
    // Triumphant peak
    setTimeout(() => {
      tone(1319, 0.65, 'sine', 0.3);
      tone(1047, 0.55, 'sine', 0.18, 0.04);
      tone(784, 0.55, 'sine', 0.14, 0.08);
      noise(0.08, 0.1, 0, 1500, 7000);
    }, 560);
  },

  // ── Task completed: two-tone success chime ──────────────────────────────────
  taskComplete: () => {
    tone(660, 0.14, 'sine', 0.22);
    tone(880, 0.22, 'sine', 0.2, 0.1);
    tone(1100, 0.18, 'sine', 0.14, 0.2);
  },

  // ── Level up: ascending arpeggio ────────────────────────────────────────────
  levelUp: () => {
    [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, 0.24, 'sine', 0.28, i * 0.09));
    setTimeout(() => noise(0.12, 0.1, 0, 1000, 6000), 480);
  },

  // ── Potion use: upward glug sweep ───────────────────────────────────────────
  potionUse: () => {
    sweep(300, 700, 0.28, 'sine', 0.2);
    sweep(400, 900, 0.2, 'sine', 0.12, 0.1);
  },

  // ── Gold earned: bright coin ping ───────────────────────────────────────────
  goldEarned: () => {
    tone(1400, 0.07, 'sine', 0.18);
    tone(1800, 0.12, 'sine', 0.14, 0.06);
    tone(2200, 0.08, 'sine', 0.08, 0.12);
  },

  // ── Achievement unlocked: fanfare ───────────────────────────────────────────
  achievementUnlock: () => {
    [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.28, 'triangle', 0.22, i * 0.07));
    tone(1319, 0.55, 'sine', 0.28, 0.34);
    setTimeout(() => noise(0.1, 0.08, 0, 1000, 5000), 420);
  },

  // ── Flee: descending shame tones ────────────────────────────────────────────
  flee: () => {
    [380, 300, 220, 160, 110].forEach((f, i) => tone(f, 0.16, 'sawtooth', 0.16, i * 0.1));
  },

  // ── Curse cleanse: mystical sweep ───────────────────────────────────────────
  cleanse: () => {
    sweep(200, 900, 0.42, 'sine', 0.22);
    sweep(400, 1300, 0.32, 'sine', 0.14, 0.16);
    noise(0.25, 0.1, 0.1, 1500, 6000);
  },

  // ── Open modal: soft click ───────────────────────────────────────────────────
  openModal: () => tone(700, 0.08, 'sine', 0.12),
};
