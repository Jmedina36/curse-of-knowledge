// ── SFX file player ──────────────────────────────────────────────────────────
// Audio files are loaded from /public/sounds/sfx/.
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

// ── Synthesized primitives — used only for bossEntrance ───────────────────────
let audioCtx = null;
const ctx = () => {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
};
const sweep = (f1, f2, dur, type = 'sine', vol = 0.2, delay = 0) => {
  try {
    const ac = ctx();
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.connect(gain); gain.connect(ac.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(f1, ac.currentTime + delay);
    osc.frequency.exponentialRampToValueAtTime(f2, ac.currentTime + delay + dur);
    gain.gain.setValueAtTime(vol, ac.currentTime + delay);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + delay + dur);
    osc.start(ac.currentTime + delay);
    osc.stop(ac.currentTime + delay + dur + 0.02);
  } catch (e) {}
};
const noise = (dur, vol = 0.2, delay = 0, hpFreq = 0, lpFreq = 8000) => {
  try {
    const ac = ctx();
    const bufSize = Math.floor(ac.sampleRate * (dur + 0.1));
    const buf = ac.createBuffer(1, bufSize, ac.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
    const src = ac.createBufferSource(); src.buffer = buf;
    const gain = ac.createGain();
    gain.gain.setValueAtTime(vol, ac.currentTime + delay);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + delay + dur);
    const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = lpFreq;
    if (hpFreq > 0) {
      const hp = ac.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = hpFreq;
      src.connect(hp); hp.connect(lp);
    } else { src.connect(lp); }
    lp.connect(gain); gain.connect(ac.destination);
    src.start(ac.currentTime + delay);
  } catch (e) {}
};

export const sounds = {

  // ── Enemy takes damage ───────────────────────────────────────────────────────
  bossDamage: () => sfxPlay('mixkit-sword-blade-attack-in-medieval-battle-2762.wav', 0.75),

  // ── Player takes damage ──────────────────────────────────────────────────────
  playerDamage: () => sfxPlay('mixkit-impact-of-a-blow-2150.wav', 0.8),

  // ── Critical hit ─────────────────────────────────────────────────────────────
  critHit: () => sfxPlay('mixkit-metal-hit-woosh-1485.wav', 0.85),

  // ── Charged Strike ───────────────────────────────────────────────────────────
  chargedStrike: () => sfxPlay('mixkit-quick-saber-cut-2158.mp3', 0.9),

  // ── Charge gained ────────────────────────────────────────────────────────────
  chargeGain: () => sfxPlay('mixkit-magic-sparkle-whoosh-2350.wav', 0.35),

  // ── Charges full ─────────────────────────────────────────────────────────────
  chargeFull: () => sfxPlay('mixkit-magic-sparkle-whoosh-2350.wav', 0.6),

  // ── Special attack ───────────────────────────────────────────────────────────
  specialAttack: () => sfxPlay('mixkit-sword-blade-swish-1506.wav', 0.75),

  // ── Boss / enemy entrance: synthesized cinematic boom (no file yet) ──────────
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
