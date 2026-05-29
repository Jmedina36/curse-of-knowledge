let audioCtx = null;

const ctx = () => {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
};

const tone = (freq, dur, type = 'sine', vol = 0.25, delay = 0) => {
  try {
    const ac = ctx();
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ac.currentTime + delay);
    gain.gain.setValueAtTime(vol, ac.currentTime + delay);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + delay + dur);
    osc.start(ac.currentTime + delay);
    osc.stop(ac.currentTime + delay + dur + 0.01);
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
    osc.stop(ac.currentTime + delay + dur + 0.01);
  } catch (e) {}
};

export const sounds = {
  // Task completed - two-tone success chime
  taskComplete: () => {
    tone(660, 0.12, 'sine', 0.22);
    tone(880, 0.2, 'sine', 0.18, 0.1);
  },

  // Level up - ascending arpeggio
  levelUp: () => {
    [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, 0.22, 'sine', 0.28, i * 0.09));
  },

  // Boss takes damage - sharp impact
  bossDamage: () => {
    tone(180, 0.08, 'sawtooth', 0.3);
    tone(120, 0.15, 'square', 0.18, 0.06);
  },

  // Player takes damage - lower hurt tone
  playerDamage: () => {
    tone(220, 0.08, 'sawtooth', 0.28);
    tone(160, 0.18, 'sawtooth', 0.15, 0.05);
  },

  // Potion use - upward sweep (drink/glug)
  potionUse: () => {
    sweep(300, 700, 0.28, 'sine', 0.2);
    sweep(400, 900, 0.2, 'sine', 0.12, 0.1);
  },

  // Gold earned - metallic coin ping
  goldEarned: () => {
    tone(1400, 0.06, 'sine', 0.18);
    tone(1800, 0.1, 'sine', 0.12, 0.05);
  },

  // Achievement unlocked - fanfare
  achievementUnlock: () => {
    [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.28, 'triangle', 0.22, i * 0.07));
    tone(1319, 0.5, 'sine', 0.28, 0.33);
  },

  // Battle victory - resolved chord
  victory: () => {
    [523, 659, 784].forEach((f, i) => tone(f, 0.18, 'sine', 0.25, i * 0.06));
    setTimeout(() => [659, 784, 1047].forEach((f, i) => tone(f, 0.28, 'sine', 0.25, i * 0.06)), 280);
    setTimeout(() => tone(1319, 0.5, 'sine', 0.3), 580);
  },

  // Flee / defeat - descending tone
  flee: () => {
    [400, 320, 240, 180].forEach((f, i) => tone(f, 0.14, 'sawtooth', 0.18, i * 0.09));
  },

  // Curse cleanse - mystical sweep
  cleanse: () => {
    sweep(200, 800, 0.4, 'sine', 0.2);
    sweep(400, 1200, 0.3, 'sine', 0.12, 0.15);
  },

  // Open modal - soft click
  openModal: () => tone(700, 0.08, 'sine', 0.12),
};
