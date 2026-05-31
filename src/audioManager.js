// ── Audio Manager ─────────────────────────────────────────────────────────────
// Handles looping background music with smooth fade in/out.
// SFX are handled separately in sounds.js via Web Audio API.
//
// SETUP: Place audio files in /public/sounds/music/ and update TRACKS below.
// Free sources: incompetech.com (CC BY), opengameart.org, freesound.org
//
// Recommended tracks:
//   battle.mp3    — Kevin MacLeod "Clash Defiant" or "Killers"
//   boss.mp3      — Kevin MacLeod "Volatile Reaction" or "Dark Times"
//   ambient.mp3   — Kevin MacLeod "Mystical Theme" (quiet menu/idle loop)

export const TRACKS = {
  nightVigil:   '/sounds/music/Night Vigil.mp3',
  ancientWinds: '/sounds/music/Ancient Winds.mp3',
  midnightTale: '/sounds/music/Midnight Tale.mp3',
  unholyKnight: '/sounds/music/Unholy Knight.mp3',
  battle:     '/sounds/music/battle.mp3',
  boss:       '/sounds/music/boss.mp3',
  ambient:    '/sounds/music/ambient.mp3',
};

const FADE_IN_MS  = 1400;
const FADE_OUT_MS = 900;
const MUSIC_VOL   = 0.32;
const STEPS       = 40;

class AudioManager {
  constructor() {
    this._el       = null;   // current HTMLAudioElement
    this._track    = null;   // current src string
    this._fadeId   = null;
    this._muted    = false;
    this._vol      = MUSIC_VOL;
  }

  // ── Public API ──────────────────────────────────────────────────────────────

  /** Start a looping music track. No-ops if already playing the same track. */
  play(src, { loop = true, fadeIn = true } = {}) {
    if (this._track === src && this._el && !this._el.paused) return;
    this._stopFade();

    if (this._el && !this._el.paused) {
      // Fade out current track, then start new one
      this._fadeOut(this._el, () => this._start(src, loop, fadeIn));
    } else {
      this._start(src, loop, fadeIn);
    }
  }

  /** Stop music with optional fade. */
  stop(fade = true) {
    if (!this._el || this._el.paused) return;
    this._stopFade();
    if (fade) {
      this._fadeOut(this._el, () => {
        this._el.pause();
        this._track = null;
      });
    } else {
      this._el.pause();
      this._track = null;
    }
  }

  /** Instantly cut music (for flee/death moments). */
  cut() { this.stop(false); }

  setMuted(val) {
    this._muted = val;
    if (this._el) this._el.volume = val ? 0 : this._vol;
  }

  setVolume(vol) {
    this._vol = Math.max(0, Math.min(1, vol));
    if (this._el && !this._muted) this._el.volume = this._vol;
  }

  get muted() { return this._muted; }

  // ── Internals ───────────────────────────────────────────────────────────────

  _start(src, loop, fadeIn) {
    if (this._el) { this._el.pause(); this._el.src = ''; }

    const el = new Audio(src);
    el.loop   = loop;
    el.volume = fadeIn ? 0 : (this._muted ? 0 : this._vol);
    this._el    = el;
    this._track = src;

    el.play().catch(() => {
      // Browser blocked autoplay — will play on next user interaction
      const unlock = () => {
        el.play().catch(() => {});
        window.removeEventListener('click', unlock);
        window.removeEventListener('keydown', unlock);
      };
      window.addEventListener('click', unlock, { once: true });
      window.addEventListener('keydown', unlock, { once: true });
    });

    if (fadeIn) this._fadeIn(el, this._muted ? 0 : this._vol);
  }

  _fadeIn(el, target) {
    this._stopFade();
    const step     = target / STEPS;
    const interval = FADE_IN_MS / STEPS;
    this._fadeId = setInterval(() => {
      const next = Math.min(el.volume + step, target);
      el.volume  = next;
      if (next >= target) this._stopFade();
    }, interval);
  }

  _fadeOut(el, onDone) {
    this._stopFade();
    const step     = el.volume / STEPS;
    const interval = FADE_OUT_MS / STEPS;
    this._fadeId = setInterval(() => {
      const next = Math.max(el.volume - step, 0);
      el.volume  = next;
      if (next <= 0.001) {
        this._stopFade();
        if (onDone) onDone();
      }
    }, interval);
  }

  _stopFade() {
    if (this._fadeId) { clearInterval(this._fadeId); this._fadeId = null; }
  }
}

export const audioManager = new AudioManager();
