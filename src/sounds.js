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

  // ── Elite / final boss entrance: dragon roar ────────────────────────────────
  bossEntrance: () => sfxPlay('mixkit-angry-dragon-growl-309.wav', 0.85),

  // ── Regular enemy entrance: monster growl ───────────────────────────────────
  enemyEntrance: () => sfxPlay('mixkit-monster-growl-1966.wav', 0.8),

  // ── Wave battle entrance: evil storm ────────────────────────────────────────
  waveEntrance: () => sfxPlay('mixkit-evil-storm-atmosphere-2404.wav', 0.7),

  // ── Final boss entrance: monster evil voice + soft evil storm ───────────────
  finalBossEntrance: () => sfxPlay('mixkit-monster-evil-voice-290.wav', 0.9),
  finalBossStorm:    () => sfxPlay('mixkit-evil-storm-atmosphere-2404.wav', 0.35),

  // 25002500 Daughters of Dusk entrance laughs 2500250025002500250025002500250025002500250025002500250025002500250025002500250025002500250025002500250025002500250025002500250025002500250025002500250025002500
  daughtersLaugh1: () => sfxPlay('mixkit-female-long-laugh-426.wav', 0.8),
  daughtersLaugh2: () => sfxPlay('mixkit-females-laugh-425.wav', 0.8),
  daughtersLaugh3: () => sfxPlay('dragon-studio-evil-girl-laughing-401720.mp3', 0.8),

  // ── Beg screen opens: shadow acknowledges you ────────────────────────────────
  negotiateOpen: () => sfxPlay('mixkit-monster-evil-voice-290.wav', 0.75),

  // ── Bandit laugh ─────────────────────────────────────────────────────────────
  banditLaugh:    () => sfxPlay('freesound_community-evil-laugh-89423.mp3', 0.8),
  banditLaugh2:   () => sfxPlay('freesound_community-evil-laugh-47891.mp3', 0.8),
  banditLaugh3:   () => sfxPlay('freesound_community-muahaha-evil-laughter-83217.mp3', 0.8),
  demonicLaugh:   () => sfxPlay('freesound_community-evil-demonic-laugh-6925.mp3', 0.9),
  possessedLaugh: () => sfxPlay('freesound_community-possessed-laugh-94851.mp3', 0.9),
  cursedLaugh3:   () => sfxPlay('freesound_community-evil-laugh-6125.mp3', 0.85),

  // ── Negotiate / beg fails: shadow laughs ────────────────────────────────────
  negotiateFail: () => sfxPlay('mixkit-troll-warrior-laugh-409.wav', 0.8),

  // ── Battle victory ───────────────────────────────────────────────────────────
  victory: () => sfxPlay('mixkit-winning-notification-2018.wav', 0.75),

  // ── Task completed ───────────────────────────────────────────────────────────
  taskComplete: () => sfxPlay('mixkit-completion-of-a-level-2063.wav', 0.65),

  // ── Level up ─────────────────────────────────────────────────────────────────
  levelUp: () => sfxPlay('mixkit-game-level-completed-2059.wav', 0.75),

  // ── Potion use ───────────────────────────────────────────────────────────────
  potionUse: () => sfxPlay('mixkit-magic-wand-sparkle-3062.wav', 0.65),

  // ── Gold earned ──────────────────────────────────────────────────────────────
  goldEarned: () => sfxPlay('mixkit-game-treasure-coin-2038.wav', 0.6),

  // ── Achievement unlocked ─────────────────────────────────────────────────────
  achievementUnlock: () => sfxPlay('mixkit-video-game-treasure-2066.wav', 0.75),

  // ── Flee ─────────────────────────────────────────────────────────────────────
  flee: () => sfxPlay('mixkit-dagger-woosh-1487.wav', 0.7),

  // ── Curse cleanse ────────────────────────────────────────────────────────────
  cleanse: () => sfxPlay('mixkit-magic-wand-sparkle-3062.wav', 0.8),

  // ── UI button click ──────────────────────────────────────────────────────────
  click: () => sfxPlay('mixkit-gear-fast-lock-tap-2857.wav', 0.45),

  // ── Open modal ───────────────────────────────────────────────────────────────
  openModal: () => sfxPlay('mixkit-typewriter-soft-click-1125.wav', 0.4),
};
