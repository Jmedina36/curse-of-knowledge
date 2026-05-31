// ── SFX file player ──────────────────────────────────────────────────────────
// Audio files are loaded from /public/sounds/sfx/.
// Synthesized bass/sub layers are kept underneath for physical feel.
const SFX_DIR = '/sounds/sfx/';
const _sfxCache = {};

const sfxPlay = (filename, vol = 0.7) => {
  try {
    if (!_sfxCache[filename]) {
      const el = new Audio(SFX_DIR + filename);
      el.preload = 'auto';
      _sfxCache[filename] = el;
    }
    const el = _sfxCache[filename];
    el.volume = vol;
    el.currentTime = 0;
    el.play().catch(() => {});
  } catch (e) {}
};

// Returns true if we should play the file version instead of synthesis
const hasSfx = (filename) => {
  // Optimistically return true; if the file 404s it will just silently fail
  return true;
};

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

  // ── Enemy takes damage: medieval sword strike ───────────────────────────────
  bossDamage: () => {
    sfxPlay('mixkit-sword-blade-attack-in-medieval-battle-2762.wav', 0.75);
    sweep(140, 55, 0.2, 'sine', 0.15, 0.02); // sub thump underneath
  },

  // ── Player takes damage: blow impact ────────────────────────────────────────
  playerDamage: () => {
    sfxPlay('mixkit-impact-of-a-blow-2150.wav', 0.8);
    noise(0.08, 0.2, 0, 60, 500);
    sweep(90, 40, 0.22, 'sine', 0.18, 0.01);
  },

  // ── Critical hit: metal hit whoosh ──────────────────────────────────────────
  critHit: () => {
    sfxPlay('mixkit-metal-hit-woosh-1485.wav', 0.85);
    sweep(200, 50, 0.28, 'sine', 0.2, 0.03);
  },

  // ── Charged Strike: quick saber cut ─────────────────────────────────────────
  chargedStrike: () => {
    sfxPlay('mixkit-quick-saber-cut-2158.mp3', 0.9);
    noise(0.06, 0.15, 0, 2500, 9000); // electric crackle buildup
    sweep(80, 30, 0.4, 'sine', 0.28, 0.08);
  },

  // ── Charge gained: magic sparkle tick ───────────────────────────────────────
  chargeGain: () => {
    sfxPlay('mixkit-magic-sparkle-whoosh-2350.wav', 0.35);
  },

  // ── Charges full: magic sparkle shimmer ─────────────────────────────────────
  chargeFull: () => {
    sfxPlay('mixkit-magic-sparkle-whoosh-2350.wav', 0.6);
    [700, 900, 1100, 1500].forEach((f, i) => tone(f, 0.12, 'sine', 0.12, i * 0.045));
  },

  // ── Special attack: sword blade swish ───────────────────────────────────────
  specialAttack: () => {
    sfxPlay('mixkit-sword-blade-swish-1506.wav', 0.75);
    sweep(300, 1100, 0.18, 'sine', 0.14);
  },

  // ── Boss / enemy entrance: deep cinematic boom ──────────────────────────────
  bossEntrance: () => {
    sweep(130, 38, 0.55, 'sine', 0.38);
    noise(0.35, 0.28, 0, 20, 250);
    [200, 260, 330].forEach((f, i) => sweep(f * 0.4, f, 0.65, 'sawtooth', 0.12, i * 0.09));
    noise(0.08, 0.38, 0.3, 500, 3500);
    sweep(400, 90, 0.2, 'sawtooth', 0.3, 0.3);
  },

  // ── Battle victory ───────────────────────────────────────────────────────────
  victory: () => {
    sfxPlay('mixkit-video-game-win-2016.wav', 0.7);
  },

  // ── Task completed ───────────────────────────────────────────────────────────
  taskComplete: () => {
    sfxPlay('mixkit-completion-of-a-level-2063.wav', 0.65);
  },

  // ── Level up ─────────────────────────────────────────────────────────────────
  levelUp: () => {
    sfxPlay('mixkit-game-level-completed-2059.wav', 0.75);
  },

  // ── Potion use: magic wand sparkle ───────────────────────────────────────────
  potionUse: () => {
    sfxPlay('mixkit-magic-wand-sparkle-3062.wav', 0.65);
  },

  // ── Gold earned: treasure coin ───────────────────────────────────────────────
  goldEarned: () => {
    sfxPlay('mixkit-game-treasure-coin-2038.wav', 0.6);
  },

  // ── Achievement unlocked: treasure fanfare ───────────────────────────────────
  achievementUnlock: () => {
    sfxPlay('mixkit-video-game-treasure-2066.wav', 0.75);
  },

  // ── Flee: dagger whoosh ───────────────────────────────────────────────────────
  flee: () => {
    sfxPlay('mixkit-dagger-woosh-1487.wav', 0.7);
  },

  // ── Curse cleanse: magic sparkle ─────────────────────────────────────────────
  cleanse: () => {
    sfxPlay('mixkit-magic-wand-sparkle-3062.wav', 0.8);
    sweep(200, 900, 0.42, 'sine', 0.14);
  },

  // ── Open modal: soft UI click ────────────────────────────────────────────────
  openModal: () => {
    sfxPlay('mixkit-typewriter-soft-click-1125.wav', 0.4);
  },
};
