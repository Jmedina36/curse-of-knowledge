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
  bossEntrance: () => sfxPlay('EliteLaugh2.wav', 0.85),

  // ── Regular enemy entrance: monster growl ───────────────────────────────────
  creatureIntro:  () => sfxPlay('RegularCreatureIntro.wav', 0.8),
  creatureTaunt:  () => sfxPlay('RegularCreaturetaunt.wav', 0.8),
  lostSoulsMale:   () => sfxPlay('LostSoulsMale.mp3', 0.8),
  lostSoulsFemale: () => sfxPlay('LostSoulsFemale.mp3', 0.8),
  eliteIntro:      () => sfxPlay('EliteLaugh2.wav', 0.85),
  eliteTaunt:      () => sfxPlay('EliteLaugh1.mp3', 0.85),
  eliteLaugh3:     () => sfxPlay('EliteLaugh3.wav', 0.85),


  // ── Final boss entrance: monster evil voice + soft evil storm ───────────────
  finalBossEntrance: () => sfxPlay('EliteLaugh3.wav', 0.9),
  finalBossStorm:    () => sfxPlay('mixkit-evil-storm-atmosphere-2404.wav', 0.35),

  // ── Daughters of Dusk entrance laughs ────────────────────────────────────────
  daughtersLaugh1: () => sfxPlay('DaughtersLaugh2.wav', 0.8),
  daughtersLaugh2: () => sfxPlay('DaughterLaugh2.wav', 0.8),
  daughtersIntro:  () => sfxPlay('DaughtersLaugh1.mp3', 0.8),
  daughtersTaunt:  () => sfxPlay('DaughtersLaugh2.wav', 0.8),


  // ── Bandit laugh ─────────────────────────────────────────────────────────────
  banditLaugh:    () => sfxPlay('BanditLaugh2.mp3', 0.8),
  banditIntro:    () => sfxPlay('BanditLaugh2.mp3', 0.8),
  banditTaunt:    () => sfxPlay('BanitLaugh1.mp3', 0.8),
  demonicLaugh:   () => sfxPlay('LostSoulsMale.mp3', 0.9),
  possessedLaugh: () => sfxPlay('LostSoulsFemale.mp3', 0.9),

  // ── Battle victory ───────────────────────────────────────────────────────────
  victory: () => sfxPlay('mixkit-winning-notification-2018.wav', 0.75),

  // ── Task completed ───────────────────────────────────────────────────────────
  taskComplete: () => sfxPlay('mixkit-completion-of-a-level-2063.wav', 0.65),

  // ── Level up ─────────────────────────────────────────────────────────────────
  levelUp: () => sfxPlay('mixkit-game-level-completed-2059.wav', 0.75),

  // ── Potion use ───────────────────────────────────────────────────────────────
  potionUse: () => sfxPlay('mixkit-magic-wand-sparkle-3062.wav', 0.65),


  // ── Achievement unlocked ─────────────────────────────────────────────────────
  achievementUnlock: () => sfxPlay('mixkit-video-game-treasure-2066.wav', 0.75),


  // ── Curse cleanse ────────────────────────────────────────────────────────────
  cleanse: () => sfxPlay('mixkit-magic-wand-sparkle-3062.wav', 0.8),

  // ── UI button click ──────────────────────────────────────────────────────────
  click: () => sfxPlay('mixkit-gear-fast-lock-tap-2857.wav', 0.45),

};
