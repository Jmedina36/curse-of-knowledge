import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { COLORS, GAME_CONSTANTS } from '../constants';
import { audioManager } from '../audioManager';
import { sounds } from '../sounds';

// ─── Enemy move pools by battle type ─────────────────────────────────────────
const ENEMY_MOVES = {
  regular: [
    { name: 'Strike',      desc: 'lunges at you with reckless force!' },
    { name: 'Slam',        desc: 'slams down with crushing weight!' },
    { name: 'Rend',        desc: 'tears into you with savage claws!' },
    { name: 'Bash',        desc: 'bashes you with brute force!' },
  ],
  elite: [
    { name: 'Tormented Strike',    desc: 'channels its torment into a vicious strike!' },
    { name: 'Soul Rend',           desc: 'tears at the threads of your soul!' },
    { name: 'Exhausting Assault',  desc: 'unleashes a relentless, draining assault!' },
    { name: 'Cursed Slash',        desc: 'slashes with a curse-infused blade!' },
    { name: 'Double Strike',       desc: 'strikes twice in rapid, brutal succession!' },
  ],
  wave: [
    { name: 'Frenzied Strike',     desc: 'attacks in a frenzied rush!' },
    { name: 'Overwhelming Blow',   desc: 'overwhelms you with sheer numbers!' },
    { name: 'Coordinated Assault', desc: 'coordinates a devastating group assault!' },
  ],
  final: [
    { name: 'Curse Slam',           desc: 'brings the full weight of the curse crashing down!' },
    { name: 'Abyssal Strike',       desc: 'strikes from the depths of the abyss!' },
    { name: 'Void Drain',           desc: 'reaches into your being and drains your will to fight!' },
    { name: 'Shadow Barrage',       desc: 'erupts in a relentless barrage of shadow strikes!' },
    { name: 'Wrath of the Undying', desc: 'is consumed by ancient, undying wrath!' },
    { name: 'Abyss Awakens',        desc: 'channels the roaring void into a single devastating blow!' },
  ],
};


const pickMove = (isFinalBoss, battleType) => {
  const pool = isFinalBoss ? ENEMY_MOVES.final
    : battleType === 'elite' ? ENEMY_MOVES.elite
    : battleType === 'wave'  ? ENEMY_MOVES.wave
    : ENEMY_MOVES.regular;
  return pool[Math.floor(Math.random() * pool.length)];
};

// ─── Typewriter text component ───────────────────────────────────────────────
const TypewriterText = ({ text, speed = 28, color = '#F5F5DC' }) => {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  useEffect(() => {
    setDisplayed('');
    setDone(false);
    if (!text) return;
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) { clearInterval(id); setDone(true); }
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);
  return (
    <span style={{ color, fontFamily: 'Cinzel, serif' }}>
      {displayed}
      {!done && <span className="animate-pulse" style={{ opacity: 0.7 }}>▌</span>}
    </span>
  );
};

// ─── Log entry color coding ───────────────────────────────────────────────────
const getLogColor = (entry) => {
  if (/❤|heal|Heal|restored|recovered/i.test(entry)) return '#4ADE80';
  if (/💙|Stamina|stamina potion/i.test(entry)) return '#22D3EE';
  if (/☠|[Pp]oison/i.test(entry)) return '#A3E635';
  if (/[Bb]leed/i.test(entry)) return '#F87171';
  if (/SHATTERS|[Aa]rmor shred/i.test(entry)) return '#FB923C';
  if (/OVERWHELMING FORCE/i.test(entry)) return '#EF4444';
  if (/✨|[Ss]tun/i.test(entry)) return '#C084FC';
  if (/💰|[Gg]old|XP|⭐|[Ll]evel/i.test(entry)) return '#FBBF24';
  if (/🏃|[Ff]le[ed]/i.test(entry)) return '#94A3B8';
  if (/🛡|[Bb]lock|[Bb]arrier|[Dd]odge/i.test(entry)) return '#60A5FA';
  if (/⚡|[Ee]nrage|[Rr]ampage/i.test(entry)) return '#FB923C';
  if (/⚔|[Ss]trike|[Aa]ttack|[Bb]low|[Ss]mite|[Dd]amage|[Hh]it/i.test(entry)) return '#FCA5A5';
  if (/PHASE|[Pp]hase/i.test(entry)) return '#FF6B6B';
  return 'rgba(245,245,220,0.65)';
};


const BattleModal = ({
  // Enemy state
  bossHp,
  bossMax,
  bossName,
  bossFlash,
  bossDebuffs,
  enragedTurns,
  battleType,
  isFinalBoss,
  // Wave state
  currentWaveEnemy,
  totalWaveEnemies,
  waveCount,
  // Boss phase state
  inPhase2,
  inPhase3,
  phase2DamageStacks,
  shadowAdds,
  aoeWarning,
  showDodgeButton,
  // Dialogue state
  enemyDialogue,
  // Player state
  playerFlash,
  playerDebuffs,
  hp,
  getMaxHp,
  stamina,
  getMaxStamina,
  level,
  hero,
  gold,
  healthPots,
  staminaPots,
  curseLevel,
  // Battle UI state
  currentDay,
  battling,
  battleMenu,
  setBattleMenu,
  canFlee,
  hasFled,
  setHasFled,
  setShowBoss,
  // Skill/ability state
  chargeStacks,
  recklessStacks,
  knightCrushingBlowCooldown,
  knightRallyingRoarCooldown,
  wizardTemporalCooldown,
  wizardEtherealBarrierCooldown,
  assassinMarkForDeathCooldown,
  crusaderJudgmentCooldown,
  crusaderSmiteCooldown,
  crusaderBastionOfFaithCooldown,
  // Victory
  victoryLoot,
  // Battle log
  log,
  setEnemyDialogue,
  // Callbacks
  attack,
  useCrushingBlow,
  useSmite,
  specialAttack,
  chargedStrike,
  useTacticalSkill,
  useHealth,
  flee,
  dodge,
  advance,
  die,
  negotiate,
  addLog,
  setStamina,
  setStaminaPots,
  getRarityColor,
  fusionCrystals,
  capturedMonsters,
  onShakedown,
  onCapture,
  isBanditWave,
  banditEnemyImg,
  onBeg,
  raidFaction,
}) => {
  // ── Elite boss pool ────────────────────────────────────────────────────────
  const ELITE_BOSSES = [
    { img: '/bosses/frozen-zombie.png',        name: 'Rotgar the Frozen'      }, // male
    { img: '/bosses/undead-vampire-woman.png',  name: 'Lady Seraphine'         }, // female
    { img: '/bosses/orc-chief.png',             name: 'Warchief Thrakk'        }, // male
    { img: '/bosses/orc-lady.png',              name: 'Varka the Fierce'       }, // female
    { img: '/bosses/orc-warrior.png',           name: 'Krag Stonefist'         }, // male
  ];

  // ── Creature sprite helper ─────────────────────────────────────────────────
  const getCreatureImg = (name, battleType, isFinalBoss) => {
    const seed = (name || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    if (isFinalBoss)            return '/undead-king.png';
    if (battleType === 'elite') return ELITE_BOSSES[seed % ELITE_BOSSES.length].img;
    return                             `/creatures/creature${1  + (seed % 8)}.png`;
  };

  const getEliteName = (name) => {
    const seed = (name || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    return ELITE_BOSSES[seed % ELITE_BOSSES.length].name;
  };
  // ── Local effect state ──────────────────────────────────────────────────────
  const [floatingNumbers, setFloatingNumbers] = useState([]);
  const [shaking, setShaking] = useState(false);
  const [musicMuted, setMusicMuted] = useState(() => audioManager.muted);
  const [phaseCard, setPhaseCard] = useState(null);
  const [critAnim, setCritAnim] = useState(false);
  const [negotiatePhase, setNegotiatePhase] = useState('idle'); // 'idle'|'open'|'result'
  const [negotiateResult, setNegotiateResult] = useState(null); // {success,enraged}
  const [hasBeggedThisBattle, setHasBeggedThisBattle] = useState(false);
  const [heroDialogue, setHeroDialogue] = useState('');
  const [negotiateOutcome, setNegotiateOutcome] = useState(null); // null | 'success' | 'fail'
  // Bribe cost fixed per battle — CHA lowers the price
  const [bribeCost] = useState(() => {
    const chaMod = Math.floor(((hero?.abilities?.cha || 10) - 10) / 2);
    const day = Math.max(1, currentDay || 1);
    const base = Math.floor(day * 4 + Math.random() * day * 3);
    return Math.max(5, Math.floor(base * Math.max(0.5, 1 - chaMod * 0.1)));
  });


  const [enemySpecialAnim, setEnemySpecialAnim] = useState(null); // 'bleed' | 'armorBreak' | 'overwhelmingForce'
  const [turnPhase, setTurnPhase] = useState('player'); // 'player' | 'narrating'
  const [battleLine, setBattleLine] = useState('');
  const [bossEntered, setBossEntered] = useState(false);
  const [hasShookDown, setHasShookDown] = useState(false);
  const [capturePhase, setCapturePhase] = useState('idle'); // 'idle'|'result'
  const [captureResult, setCaptureResult] = useState(null);
  const [battleBgIdx] = useState(() => Math.floor(Math.random() * 8) + 1);
  const turnTimers = useRef([]);
  const turnCountRef = useRef(0);
  const logRef = useRef(null);
  const prevBossHp = useRef(bossHp);
  const prevPlayerHp = useRef(hp);
  const prevPhase2 = useRef(inPhase2);
  const prevPhase3 = useRef(inPhase3);
  const floatId = useRef(0);
  const prevLogLen = useRef(0);

  // Floating number helper
  const spawnFloat = (value, type) => {
    const id = ++floatId.current;
    setFloatingNumbers(prev => [...prev, { id, value, type, x: Math.random() * 60 - 30 }]);
    setTimeout(() => setFloatingNumbers(prev => prev.filter(n => n.id !== id)), 1100);
  };

  // Boss damage floats — gold for crits
  useEffect(() => {
    if (bossHp < prevBossHp.current && prevBossHp.current > 0) {
      const recentEntries = log.slice(Math.max(0, log.length - 3));
      const isCritHit = recentEntries.some(e => /💥 CRITICAL/.test(e));
      spawnFloat(`-${prevBossHp.current - bossHp}`, isCritHit ? 'crit' : 'boss');
    }
    prevBossHp.current = bossHp;
  }, [bossHp, log]);

  // Detect new log entries → trigger crit or enemy special animations
  useEffect(() => {
    if (log.length <= prevLogLen.current) return;
    const newEntries = log.slice(prevLogLen.current);
    prevLogLen.current = log.length;

    if (newEntries.some(e => /CRITICAL/.test(e))) {
      setCritAnim(true);
      setShaking(true);
      const t1 = setTimeout(() => setShaking(false), 450);
      const t2 = setTimeout(() => setCritAnim(false), 950);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
    if (newEntries.some(e => /OVERWHELMING FORCE/.test(e))) {
      setEnemySpecialAnim('overwhelmingForce');
      setShaking(true);
      const t1 = setTimeout(() => setShaking(false), 500);
      const t2 = setTimeout(() => setEnemySpecialAnim(null), 1100);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
    if (newEntries.some(e => /deep wound/.test(e))) {
      setEnemySpecialAnim('bleed');
      const t = setTimeout(() => setEnemySpecialAnim(null), 1400);
      return () => clearTimeout(t);
    }
    if (newEntries.some(e => /SHATTERS your guard/.test(e))) {
      setEnemySpecialAnim('armorBreak');
      const t = setTimeout(() => setEnemySpecialAnim(null), 1200);
      return () => clearTimeout(t);
    }
  }, [log]);

  // Player damage / heal floats + screen shake
  useEffect(() => {
    if (hp < prevPlayerHp.current && prevPlayerHp.current > 0) {
      spawnFloat(`-${prevPlayerHp.current - hp}`, 'damage');
      setShaking(true);
      setTimeout(() => setShaking(false), 450);
    } else if (hp > prevPlayerHp.current) {
      spawnFloat(`+${hp - prevPlayerHp.current}`, 'heal');
    }
    prevPlayerHp.current = hp;
  }, [hp]);

  // Phase transition cinematic
  useEffect(() => {
    if (inPhase2 && !prevPhase2.current) {
      setPhaseCard({ line1: 'PHASE 2', line2: 'THE PRESSURE', color: '#FF8C42' });
      setTimeout(() => setPhaseCard(null), 2800);
    }
    prevPhase2.current = inPhase2;
  }, [inPhase2]);

  useEffect(() => {
    if (inPhase3 && !prevPhase3.current) {
      setPhaseCard({ line1: 'PHASE 3', line2: 'ABYSS AWAKENING', color: '#FF4444' });
      setTimeout(() => setPhaseCard(null), 2800);
    }
    prevPhase3.current = inPhase3;
  }, [inPhase3]);

  // Auto-scroll battle log
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [log]);

  // Cancel narration immediately on battle end
  useEffect(() => {
    if (bossHp <= 0 || hp <= 0) {
      turnTimers.current.forEach(clearTimeout);
      turnTimers.current = [];
      setTurnPhase('player');
      setBattleLine('');
    }
  }, [bossHp, hp]);

  // Boss entrance sequence on mount
  useEffect(() => {
    // Slam shake at the moment the name crashes in (~900ms)
    const shakeTimer = setTimeout(() => {
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
    }, 900);
    // Dismiss entrance overlay after full sequence
    const doneTimer = setTimeout(() => setBossEntered(true), 3000);
    return () => { clearTimeout(shakeTimer); clearTimeout(doneTimer); };
  }, []);

  const schedule = (fn, delay) => {
    const id = setTimeout(fn, delay);
    turnTimers.current.push(id);
  };

  // Pokémon-style: show player action text → enemy move text → return control
  const handlePlayerAction = (actionFn, playerActionName, skipEnemyTurn = false) => {
    if (turnPhase !== 'player') return;

    const CHAR_SPEED = 25;        // must match TypewriterText speed prop
    const READ_PAUSE = 1000;      // pause after player text finishes
    const ENEMY_READ_PAUSE = 2200; // pause after enemy text finishes (longer so it sinks in)

    const heroName = hero?.name || 'You';
    const enemyName = bossName || 'The enemy';
    const playerText = `${heroName} used ${playerActionName}!`;

    // Delay before enemy acts = time for player text to fully type + read pause
    const enemyActDelay = playerText.length * CHAR_SPEED + READ_PAUSE;

    // Pass the delay so the enemy counter-attack fires in sync with the text
    actionFn(skipEnemyTurn ? undefined : enemyActDelay);
    if (skipEnemyTurn) return;

    const move = pickMove(isFinalBoss, battleType);
    const enemyText = `${enemyName} used ${move.name}! ${enemyName} ${move.desc}`;

    turnTimers.current.forEach(clearTimeout);
    turnTimers.current = [];

    setBattleLine(playerText);
    setTurnPhase('narrating');

    // Show enemy text at the exact moment enemy damage fires
    schedule(() => {
      setBattleLine(enemyText);
    }, enemyActDelay);

    // After enemy text finishes typing, return control to player
    const enemyTextDuration = enemyText.length * CHAR_SPEED + ENEMY_READ_PAUSE;
    schedule(() => {
      setBattleLine('');
      setTurnPhase('player');
      turnCountRef.current++;
    }, enemyActDelay + enemyTextDuration);
  };

  // ── Derived values ──────────────────────────────────────────────────────────
  const bossHpPct = (bossHp / bossMax) * 100;
  const playerHpPct = (hp / getMaxHp()) * 100;
  const staminaPct = (stamina / getMaxStamina()) * 100;

  const phaseLabel = isFinalBoss
    ? (inPhase3 ? 'PHASE 3 — ABYSS AWAKENING' : inPhase2 ? 'PHASE 2 — THE PRESSURE' : 'THE UNDYING LEGEND')
    : raidFaction === 'daughters' ? `DAUGHTERS OF DUSK · ${currentWaveEnemy}/${totalWaveEnemies}`
    : raidFaction === 'bandit' ? `BANDIT RAID · ${currentWaveEnemy}/${totalWaveEnemies}`
    : isBanditWave ? `RAID · ${currentWaveEnemy}/${totalWaveEnemies}`
    : battleType === 'elite' ? 'TORMENTED CHAMPION'
    : battleType === 'wave' ? `WAVE ASSAULT · Enemy ${currentWaveEnemy}/${totalWaveEnemies}`
    : 'ENEMY ENCOUNTER';

  const onCooldown = (cd) => !!cd;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col overflow-y-auto"
      animate={shaking
        ? { x: [-9, 9, -7, 7, -4, 4, -2, 2, 0] }
        : { x: 0 }
      }
      transition={{ duration: 0.45, ease: 'easeOut' }}
      style={{
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        background: (() => {
          const overlay = (r,g,b,a1,a2,a3) =>
            `radial-gradient(ellipse at 50% 0%, rgba(${r},${g},${b},${a1}) 0%, transparent 50%), radial-gradient(ellipse at 20% 65%, rgba(${r},${g},${b},${a2}) 0%, transparent 40%), radial-gradient(ellipse at 80% 70%, rgba(${r},${g},${b},${a3}) 0%, transparent 40%)`;
          const img = isFinalBoss ? 'url(/battle-backgrounds/bg10.png)'
            : battleType === 'elite' ? 'url(/battle-backgrounds/bg9.png)'
            : `url(/battle-backgrounds/bg${battleBgIdx}.png)`;
          if (isFinalBoss)           return `${overlay(100,0,140,0.75,0.4,0.35)}, ${img} center/cover no-repeat`;
          if (battleType === 'elite') return `${overlay(160,60,0,0.75,0.4,0.35)}, ${img} center/cover no-repeat`;
          if (battleType === 'wave')  return `${overlay(0,45,120,0.75,0.4,0.35)}, ${img} center/cover no-repeat`;
          return                             `${overlay(130,8,15,0.75,0.4,0.35)}, ${img} center/cover no-repeat`;
        })()
      }}
    >
      {/* ── Vignette — darkens edges to focus the eye ─────────────────────── */}
      <div className="fixed inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at 50% 50%, transparent 35%, rgba(0,0,0,0.75) 100%)',
        zIndex: 2,
      }} />

      {/* ── Pulsing atmospheric aura ──────────────────────────────────────── */}
      <motion.div
        className="fixed inset-0 pointer-events-none"
        animate={{ opacity: [0.04, 0.18, 0.04] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          background: (() => {
            if (isFinalBoss)           return 'radial-gradient(ellipse at 50% 25%, rgba(150,0,220,0.5) 0%, transparent 55%)';
            if (battleType === 'elite') return 'radial-gradient(ellipse at 50% 25%, rgba(220,90,0,0.5) 0%, transparent 55%)';
            if (battleType === 'wave')  return 'radial-gradient(ellipse at 50% 25%, rgba(0,80,200,0.5) 0%, transparent 55%)';
            return                            'radial-gradient(ellipse at 50% 25%, rgba(200,0,0,0.5) 0%, transparent 55%)';
          })(),
          zIndex: 0,
        }}
      />

      {/* ── Floating damage/heal numbers overlay ─────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 50 }}>
        <AnimatePresence>
          {floatingNumbers.map(n => (
            <motion.div
              key={n.id}
              initial={{ opacity: 1, y: 0, scale: n.type === 'crit' ? 1.6 : 1 }}
              animate={{ opacity: [1, 1, 0], y: n.type === 'boss' || n.type === 'crit' ? -110 : n.type === 'damage' ? 70 : -70, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: n.type === 'crit' ? 1.6 : 2.0, ease: 'easeOut', times: [0, 0.5, 1] }}
              style={{
                position: 'absolute',
                top: n.type === 'boss' || n.type === 'crit' ? '28%' : '62%',
                left: `calc(50% + ${n.x}px)`,
                transform: 'translateX(-50%)',
                fontFamily: 'Cinzel, serif',
                fontSize: n.type === 'crit' ? '3rem' : '2.2rem',
                fontWeight: 900,
                color: n.type === 'heal' ? '#4ADE80' : n.type === 'crit' ? '#F59E0B' : '#FF3333',
                textShadow: n.type === 'heal'
                  ? '0 0 20px rgba(74,222,128,0.9), 0 2px 0 rgba(0,0,0,0.8)'
                  : n.type === 'crit'
                  ? '0 0 24px rgba(245,158,11,1), 0 0 48px rgba(245,158,11,0.5), 0 3px 0 rgba(0,0,0,0.9)'
                  : '0 0 20px rgba(255,0,0,0.9), 0 2px 0 rgba(0,0,0,0.8)',
                whiteSpace: 'nowrap',
              }}
            >
              {n.value}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* ── Critical Hit overlay ──────────────────────────────────────────── */}
      <AnimatePresence>
        {critAnim && (
          <motion.div
            key="crit-overlay"
            className="fixed inset-0 flex items-center justify-center pointer-events-none"
            style={{ zIndex: 90 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
          >
            {/* Gold radial pulse */}
            <motion.div
              className="fixed inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.5, 0] }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              style={{ background: 'radial-gradient(ellipse at 50% 38%, rgba(245,158,11,0.45) 0%, transparent 60%)' }}
            />
            {/* CRITICAL HIT text slam */}
            <motion.p
              initial={{ scale: 2.8, opacity: 0, y: -10 }}
              animate={{ scale: [2.8, 1.0, 0.9], opacity: [0, 1, 0] }}
              transition={{ duration: 0.82, times: [0, 0.28, 1], ease: 'easeOut' }}
              style={{
                fontFamily: 'Cinzel, serif', fontWeight: 900,
                fontSize: 'clamp(2.2rem, 7vw, 4.5rem)',
                letterSpacing: '0.12em',
                color: '#F59E0B',
                textShadow: '0 0 50px rgba(245,158,11,1), 0 0 100px rgba(245,158,11,0.5), 0 4px 0 rgba(0,0,0,0.9)',
                whiteSpace: 'nowrap',
                zIndex: 1,
              }}
            >
              CRITICAL HIT!
            </motion.p>
          </motion.div>
        )}

        {/* Enemy special move overlays */}
        {enemySpecialAnim === 'bleed' && (
          <motion.div
            key="bleed-overlay"
            className="fixed inset-0 flex flex-col items-center justify-center pointer-events-none"
            style={{ zIndex: 90 }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
          >
            <motion.div className="fixed inset-0"
              initial={{ opacity: 0 }} animate={{ opacity: [0, 0.55, 0] }}
              transition={{ duration: 1.1, ease: 'easeOut' }}
              style={{ background: 'radial-gradient(ellipse at 50% 55%, rgba(185,28,28,0.35) 0%, transparent 65%), linear-gradient(to bottom, rgba(100,0,0,0.3) 0%, transparent 40%, transparent 60%, rgba(100,0,0,0.3) 100%)' }}
            />
            <motion.p
              initial={{ scale: 1.4, opacity: 0, y: -12 }}
              animate={{ scale: [1.4, 1.0, 0.96], opacity: [0, 1, 0] }}
              transition={{ duration: 1.1, times: [0, 0.22, 1], ease: 'easeOut' }}
              style={{ fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: 'clamp(1.8rem, 5.5vw, 3.2rem)', letterSpacing: '0.14em', color: '#F87171', textShadow: '0 0 40px rgba(248,113,113,0.9), 0 3px 0 rgba(0,0,0,0.9)', whiteSpace: 'nowrap', zIndex: 1 }}
            >DEEP WOUND</motion.p>
            <motion.p
              initial={{ opacity: 0, y: 4 }} animate={{ opacity: [0, 0.85, 0] }}
              transition={{ duration: 1.0, delay: 0.18, times: [0, 0.2, 1] }}
              style={{ fontFamily: 'Cinzel, serif', fontSize: 'clamp(0.75rem, 2vw, 1rem)', letterSpacing: '0.22em', color: '#FCA5A5', marginTop: '0.5rem', zIndex: 1 }}
            >BLEEDING — 3 TURNS</motion.p>
          </motion.div>
        )}

        {enemySpecialAnim === 'armorBreak' && (
          <motion.div
            key="armor-overlay"
            className="fixed inset-0 flex flex-col items-center justify-center pointer-events-none"
            style={{ zIndex: 90 }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
          >
            <motion.div className="fixed inset-0"
              initial={{ opacity: 0 }} animate={{ opacity: [0, 0.5, 0] }}
              transition={{ duration: 0.9, ease: 'easeOut' }}
              style={{ background: 'radial-gradient(ellipse at 50% 48%, rgba(194,65,12,0.4) 0%, transparent 60%)' }}
            />
            <motion.p
              initial={{ scale: 2.2, opacity: 0, y: 0 }}
              animate={{ scale: [2.2, 1.0, 0.95], opacity: [0, 1, 0] }}
              transition={{ duration: 0.95, times: [0, 0.25, 1], ease: 'easeOut' }}
              style={{ fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: 'clamp(1.5rem, 4.5vw, 2.8rem)', letterSpacing: '0.12em', color: '#FB923C', textShadow: '0 0 40px rgba(251,146,60,0.9), 0 3px 0 rgba(0,0,0,0.9)', whiteSpace: 'nowrap', zIndex: 1 }}
            >ARMOR SHATTERED</motion.p>
            <motion.p
              initial={{ opacity: 0, y: 4 }} animate={{ opacity: [0, 0.85, 0] }}
              transition={{ duration: 0.85, delay: 0.15, times: [0, 0.22, 1] }}
              style={{ fontFamily: 'Cinzel, serif', fontSize: 'clamp(0.75rem, 2vw, 1rem)', letterSpacing: '0.22em', color: '#FED7AA', marginTop: '0.5rem', zIndex: 1 }}
            >DEFENSE −35% — 2 TURNS</motion.p>
          </motion.div>
        )}

        {enemySpecialAnim === 'overwhelmingForce' && (
          <motion.div
            key="force-overlay"
            className="fixed inset-0 flex items-center justify-center pointer-events-none"
            style={{ zIndex: 90 }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.08 }}
          >
            <motion.div className="fixed inset-0"
              initial={{ opacity: 0 }} animate={{ opacity: [0, 0.6, 0] }}
              transition={{ duration: 0.75, ease: 'easeOut' }}
              style={{ background: 'radial-gradient(ellipse at 50% 42%, rgba(153,27,27,0.5) 0%, transparent 58%)' }}
            />
            <motion.p
              initial={{ scale: 2.8, opacity: 0, y: -10 }}
              animate={{ scale: [2.8, 1.0, 0.9], opacity: [0, 1, 0] }}
              transition={{ duration: 0.78, times: [0, 0.26, 1], ease: 'easeOut' }}
              style={{ fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: 'clamp(1.5rem, 4.8vw, 3rem)', letterSpacing: '0.1em', color: '#EF4444', textShadow: '0 0 50px rgba(239,68,68,1), 0 0 90px rgba(239,68,68,0.4), 0 4px 0 rgba(0,0,0,0.9)', whiteSpace: 'nowrap', zIndex: 1 }}
            >OVERWHELMING FORCE</motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scanline overlay */}
      <div className="fixed inset-0 pointer-events-none" style={{
        background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 3px)',
        zIndex: 3,
      }} />

      {/* ── Boss Entrance Cinematic ───────────────────────────────────────── */}
      <AnimatePresence>
        {!bossEntered && (
          <motion.div
            key="boss-entrance"
            className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden"
            style={{ zIndex: 300, background: 'rgba(0,0,0,0.97)' }}
            exit={{ opacity: 0, transition: { duration: 0.7, ease: 'easeInOut' } }}
          >
            {/* Ominous opening text */}
            <motion.p
              initial={{ opacity: 0, letterSpacing: '0.8em' }}
              animate={{ opacity: [0, 0.7, 0.5], letterSpacing: ['0.8em', '0.3em', '0.3em'] }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="uppercase text-sm font-bold mb-8"
              style={{ color: 'rgba(200,200,200,0.5)', fontFamily: 'Cinzel, serif' }}
            >
              {isFinalBoss ? 'The curse awakens' : battleType === 'elite' ? 'A dark presence stirs' : battleType === 'wave' ? 'They come for you' : 'An enemy appears'}
            </motion.p>

            {/* Horizontal crack that widens before the name slams in */}
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: [0, 1, 1], opacity: [0, 1, 0] }}
              transition={{ duration: 0.5, delay: 0.55, times: [0, 0.5, 1] }}
              style={{
                position: 'absolute', top: '50%', left: 0, right: 0,
                height: '2px',
                background: isFinalBoss ? 'linear-gradient(to right, transparent, rgba(160,40,200,0.9), transparent)'
                  : battleType === 'elite' ? 'linear-gradient(to right, transparent, rgba(220,120,0,0.9), transparent)'
                  : battleType === 'wave'  ? 'linear-gradient(to right, transparent, rgba(30,120,220,0.9), transparent)'
                  : 'linear-gradient(to right, transparent, rgba(220,30,30,0.9), transparent)',
                boxShadow: isFinalBoss ? '0 0 20px rgba(160,40,200,0.8)' : battleType === 'elite' ? '0 0 20px rgba(220,120,0,0.8)' : battleType === 'wave' ? '0 0 20px rgba(30,120,220,0.8)' : '0 0 20px rgba(220,30,30,0.8)',
              }}
            />

            {/* Boss name — slams in from large scale */}
            <motion.h1
              initial={{ scale: 3.5, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.35, ease: [0.12, 0, 0.28, 1] }}
              className="uppercase font-black text-center"
              style={{
                fontFamily: 'Cinzel, serif',
                fontSize: 'clamp(3rem, 10vw, 7rem)',
                letterSpacing: '0.1em',
                lineHeight: 1,
                color: isFinalBoss ? '#D4AF37' : battleType === 'elite' ? '#FB923C' : battleType === 'wave' ? '#60A5FA' : '#E8E8E8',
                textShadow: isFinalBoss
                  ? '0 0 60px rgba(212,175,55,1), 0 0 120px rgba(212,175,55,0.5)'
                  : battleType === 'elite'
                  ? '0 0 60px rgba(251,146,60,1), 0 0 120px rgba(220,80,0,0.5)'
                  : battleType === 'wave'
                  ? '0 0 60px rgba(96,165,250,1), 0 0 120px rgba(30,100,220,0.5)'
                  : '0 0 60px rgba(255,60,60,1), 0 0 120px rgba(200,0,0,0.5)',
              }}
            >
              {battleType === 'wave' ? 'WAVE ASSAULT' : battleType === 'elite' ? getEliteName(bossName) : bossName}
            </motion.h1>

            {/* Battle type subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 0.6, y: 0 }}
              transition={{ delay: 1.35, duration: 0.4 }}
              className="uppercase text-sm font-bold mt-4 tracking-[0.4em]"
              style={{ color: 'rgba(245,245,220,0.5)', fontFamily: 'Cinzel, serif' }}
            >
              {isFinalBoss ? '— Final Confrontation —' : battleType === 'elite' ? '— Elite Trial —' : battleType === 'wave' ? `— ${bossName} —` : '— Battle —'}
            </motion.p>

            {/* Bottom flash — pulses once then fades */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.35, 0] }}
              transition={{ delay: 0.85, duration: 0.4 }}
              className="fixed inset-0 pointer-events-none"
              style={{
                background: isFinalBoss ? 'radial-gradient(ellipse at 50% 50%, rgba(160,40,200,0.4) 0%, transparent 70%)'
                  : battleType === 'elite' ? 'radial-gradient(ellipse at 50% 50%, rgba(220,120,0,0.4) 0%, transparent 70%)'
                  : battleType === 'wave'  ? 'radial-gradient(ellipse at 50% 50%, rgba(30,120,220,0.4) 0%, transparent 70%)'
                  : 'radial-gradient(ellipse at 50% 50%, rgba(220,30,30,0.4) 0%, transparent 70%)',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Phase Transition Cinematic ─────────────────────────────────────── */}
      <AnimatePresence>
        {phaseCard && (
          <motion.div
            key="phase-card"
            className="fixed inset-0 flex flex-col items-center justify-center pointer-events-none"
            style={{ zIndex: 100, background: 'rgba(0,0,0,0.75)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.3, opacity: 0 }}
              transition={{ duration: 0.4, ease: 'backOut' }}
              className="text-center"
            >
              <p className="font-black uppercase tracking-[0.6em] mb-2" style={{
                fontFamily: 'Cinzel, serif',
                fontSize: 'clamp(0.9rem, 3vw, 1.4rem)',
                color: phaseCard.color,
                textShadow: `0 0 30px ${phaseCard.color}`,
              }}>
                {phaseCard.line1}
              </p>
              <div style={{ width: '100%', height: '2px', background: `linear-gradient(to right, transparent, ${phaseCard.color}, transparent)`, marginBottom: '0.5rem' }} />
              <p className="font-black uppercase tracking-[0.3em]" style={{
                fontFamily: 'Cinzel, serif',
                fontSize: 'clamp(2rem, 8vw, 5rem)',
                color: '#F5F5DC',
                textShadow: `0 0 40px ${phaseCard.color}, 0 0 80px ${phaseCard.color}60`,
              }}>
                {phaseCard.line2}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative flex flex-col min-h-screen" style={{ zIndex: 2 }}>

        {/* Music mute toggle */}
        <button
          onClick={() => {
            const next = !musicMuted;
            setMusicMuted(next);
            audioManager.setMuted(next);
          }}
          title={musicMuted ? 'Unmute music' : 'Mute music'}
          style={{
            position: 'absolute', top: 12, right: 12, zIndex: 10,
            background: 'rgba(0,0,0,0.45)', border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '6px', padding: '5px 8px', cursor: 'pointer',
            color: musicMuted ? 'rgba(245,245,220,0.3)' : 'rgba(245,245,220,0.65)',
            fontSize: '0.85rem', lineHeight: 1,
          }}
        >
          {musicMuted ? '🔇' : '🎵'}
        </button>

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/*  ENEMY SECTION                                                    */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        <div className="flex-1 flex flex-col justify-end px-6 pt-6 pb-4">

          {/* Phase Label */}
          <div className="text-center mb-2">
            <motion.p
              key={phaseLabel}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm uppercase tracking-[0.4em]"
              style={{ color: inPhase3 ? '#FF6B6B' : inPhase2 ? '#FF8C42' : '#CD7F32' }}
            >
              {phaseLabel}
            </motion.p>
          </div>

          {/* Enemy name (small label) + Creature image */}
          {bossName && (
            <div className="text-center mb-2">
              {/* Small name label */}
              <p className="uppercase font-bold tracking-[0.2em] mb-2" style={{
                fontFamily: 'Cinzel, serif',
                fontSize: 'clamp(0.85rem, 2vw, 1.1rem)',
                color: bossFlash ? '#FF3333'
                  : isFinalBoss ? '#D4AF37'
                  : battleType === 'elite' ? '#FB923C'
                  : battleType === 'wave'  ? '#60A5FA'
                  : '#E8E8E8',
                textShadow: isFinalBoss ? '0 0 15px rgba(212,175,55,0.7)'
                  : battleType === 'elite' ? '0 0 15px rgba(251,146,60,0.7)'
                  : '0 0 12px rgba(220,50,50,0.6)',
                transition: 'color 0.1s',
              }}>
                {battleType === 'elite' ? getEliteName(bossName) : bossName}
              </p>
              {/* Creature image — fades in after intro */}
              <AnimatePresence>
                {bossEntered && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: [0, -8, 0] }}
                    transition={{ opacity: { duration: 0.5 }, scale: { duration: 0.5 }, y: { duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.5 } }}
                    style={{ display: 'flex', justifyContent: 'center' }}
                  >
                    <img
                      src={isBanditWave && banditEnemyImg ? banditEnemyImg : getCreatureImg(bossName, battleType, isFinalBoss)}
                      alt={bossName}
                      style={{
                        height: isBanditWave ? 'clamp(140px, 20vh, 260px)' : 'clamp(120px, 18vh, 220px)',
                        objectFit: 'contain',
                        objectPosition: 'top',
                        filter: bossFlash
                          ? 'drop-shadow(0 0 20px rgba(255,50,50,0.9)) brightness(1.4)'
                          : isBanditWave ? 'drop-shadow(0 0 18px rgba(239,68,68,0.6))'
                          : isFinalBoss ? 'drop-shadow(0 0 24px rgba(160,40,200,0.8))'
                          : battleType === 'elite' ? 'drop-shadow(0 0 20px rgba(220,120,0,0.7))'
                          : 'drop-shadow(0 0 16px rgba(220,50,50,0.5))',
                        transition: 'filter 0.1s',
                      }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
              {/* Underline accent */}
              <div className="flex items-center justify-center gap-2 mt-2">
                <div style={{ width: '40px', height: '1px', background: isFinalBoss ? 'linear-gradient(to right, transparent, rgba(212,175,55,0.7))' : battleType === 'elite' ? 'linear-gradient(to right, transparent, rgba(251,146,60,0.7))' : 'linear-gradient(to right, transparent, rgba(220,50,50,0.7))' }} />
                <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: isFinalBoss ? '#D4AF37' : battleType === 'elite' ? '#FB923C' : '#DC3232' }} />
                <div style={{ width: '40px', height: '1px', background: isFinalBoss ? 'linear-gradient(to left, transparent, rgba(212,175,55,0.7))' : battleType === 'elite' ? 'linear-gradient(to left, transparent, rgba(251,146,60,0.7))' : 'linear-gradient(to left, transparent, rgba(220,50,50,0.7))' }} />
              </div>
            </div>
          )}

          {/* Debuff badges */}
          {(bossDebuffs.poisonTurns > 0 || bossDebuffs.stunned || enragedTurns > 0) && (
            <div className="flex justify-center gap-2 mb-3 flex-wrap">
              {bossDebuffs.poisonTurns > 0 && (
                <span className="px-3 py-1 rounded text-sm font-bold animate-pulse" style={{ backgroundColor: 'rgba(34, 197, 94, 0.2)', border: '1px solid rgba(34, 197, 94, 0.5)', color: '#4ADE80' }}>
                  ☠ POISONED ({bossDebuffs.poisonTurns})
                </span>
              )}
              {bossDebuffs.stunned && (
                <span className="px-3 py-1 rounded text-sm font-bold animate-pulse" style={{ backgroundColor: 'rgba(168, 85, 247, 0.2)', border: '1px solid rgba(168, 85, 247, 0.5)', color: '#C084FC' }}>
                  ✦ STUNNED
                </span>
              )}
              {enragedTurns > 0 && (
                <span className="px-3 py-1 rounded text-sm font-bold animate-pulse" style={{ backgroundColor: 'rgba(249, 115, 22, 0.2)', border: '1px solid rgba(249, 115, 22, 0.5)', color: '#FB923C' }}>
                  ⚡ ENRAGED ({enragedTurns})
                </span>
              )}
            </div>
          )}

          {/* Boss HP Bar */}
          <div className="mb-2">
            <div className="flex justify-between items-baseline mb-1">
              <span className="text-base uppercase tracking-widest font-bold" style={{ color: '#CD7F32' }}>Enemy HP</span>
              <span className="text-lg font-bold" style={{ color: '#F5F5DC' }}>{bossHp} / {bossMax}</span>
            </div>
            <div className="h-7 w-full rounded-sm overflow-hidden" style={{ backgroundColor: 'rgba(0,0,0,0.7)', border: '1px solid rgba(139,0,0,0.5)', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)' }}>
              <motion.div
                className={`h-full ${bossFlash ? 'hp-pulse' : ''}`}
                animate={{ width: `${bossHpPct}%` }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                style={{
                  background: bossHpPct > 50
                    ? 'linear-gradient(to right, #7B0000, #DC143C, #FF4444)'
                    : bossHpPct > 25
                    ? 'linear-gradient(to right, #5B0000, #B22222, #DC143C)'
                    : 'linear-gradient(to right, #3B0000, #7B0000, #B22222)',
                  boxShadow: '0 0 8px rgba(220, 20, 60, 0.5)',
                }}
              />
            </div>
          </div>

          {/* ── Beg (bandit waves only, < 40% HP) ── */}
          {isBanditWave && bossEntered && bossHp > 0 && bossHpPct < 40 && (
            <div className="mb-3 rounded-lg p-3" style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(239,68,68,0.25)' }}>
              <p className="text-xs text-center uppercase tracking-widest mb-2" style={{ color: 'rgba(239,68,68,0.7)', fontFamily: 'Cinzel, serif' }}>
                {raidFaction === 'daughters' ? 'You could plead to the shadows...' : 'You could beg for mercy...'}
              </p>
              <button
                disabled={turnPhase !== 'player'}
                onClick={() => { if (turnPhase !== 'player') return; onBeg(); }}
                style={{
                  width: '100%', padding: '8px', borderRadius: '8px', fontSize: '11px', fontWeight: 700,
                  fontFamily: 'Cinzel, serif', letterSpacing: '0.05em',
                  background: 'linear-gradient(to bottom, rgba(127,29,29,0.6), rgba(100,20,20,0.65))',
                  border: '1px solid rgba(239,68,68,0.5)', color: '#F5F5DC', cursor: 'pointer',
                }}
              >
                🏳️ Beg for Mercy (Wave resets — no credit)
              </button>
            </div>
          )}

          {/* ── Capture Buttons (< 40% HP, non-boss, non-bandit) ── */}
          {!isBanditWave && bossEntered && !isFinalBoss && bossHp > 0 && bossHpPct < 40 && (
            <div className="mb-3 rounded-lg p-3" style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(212,175,55,0.25)' }}>
              <p className="text-xs text-center uppercase tracking-widest mb-2" style={{ color: 'rgba(212,175,55,0.7)', fontFamily: 'Cinzel, serif' }}>
                The creature is weakened...
              </p>
              <div className="grid grid-cols-2 gap-2">
                {/* Shake Down */}
                <button
                  disabled={hasShookDown || turnPhase !== 'player'}
                  onClick={() => {
                    if (hasShookDown) return;
                    setHasShookDown(true);
                    const gained = onShakedown();
                    setCaptureResult({ type: 'shakedown', gold: gained });
                    setTimeout(() => setCaptureResult(null), 2000);
                  }}
                  style={{
                    padding: '8px 6px', borderRadius: '8px', fontSize: '11px', fontWeight: 700,
                    fontFamily: 'Cinzel, serif', letterSpacing: '0.05em',
                    background: hasShookDown ? 'rgba(60,60,60,0.4)' : 'linear-gradient(to bottom, rgba(184,134,11,0.6), rgba(139,101,8,0.65))',
                    border: `1px solid ${hasShookDown ? 'rgba(155,139,126,0.3)' : 'rgba(212,175,55,0.6)'}`,
                    color: hasShookDown ? 'rgba(245,245,220,0.3)' : '#F5F5DC',
                    cursor: hasShookDown ? 'not-allowed' : 'pointer',
                  }}
                >
                  {hasShookDown ? 'Shook Down' : '💰 Shake Down'}
                </button>
                {/* Capture */}
                <button
                  disabled={capturedMonsters?.length >= 4 || turnPhase !== 'player'}
                  onClick={() => {
                    if (capturedMonsters?.length >= 4) return;
                    const captureImg = isBanditWave && banditEnemyImg
                      ? banditEnemyImg
                      : getCreatureImg(bossName, battleType, isFinalBoss);
                    const result = onCapture(bossName, bossHpPct / 100, battleType, isFinalBoss, captureImg);
                    setCaptureResult({ type: 'capture', ...result });
                    setTimeout(() => setCaptureResult(null), 2500);
                  }}
                  style={{
                    padding: '8px 6px', borderRadius: '8px', fontSize: '11px', fontWeight: 700,
                    fontFamily: 'Cinzel, serif', letterSpacing: '0.05em',
                    background: capturedMonsters?.length >= 4 ? 'rgba(60,60,60,0.4)' : 'linear-gradient(to bottom, rgba(107,33,168,0.6), rgba(76,29,149,0.65))',
                    border: `1px solid ${capturedMonsters?.length >= 4 ? 'rgba(155,139,126,0.3)' : 'rgba(168,85,247,0.6)'}`,
                    color: capturedMonsters?.length >= 4 ? 'rgba(245,245,220,0.3)' : '#F5F5DC',
                    cursor: capturedMonsters?.length >= 4 ? 'not-allowed' : 'pointer',
                  }}
                >
                  {capturedMonsters?.length >= 4 ? 'Stable Full' : '🔮 Negotiate'}
                </button>
              </div>
              {/* Result flash */}
              {captureResult && (
                <p className="text-xs text-center mt-2 animate-pulse" style={{
                  color: captureResult.type === 'shakedown' ? '#D4AF37'
                    : captureResult.success ? '#4ADE80' : '#FF6B6B',
                  fontFamily: 'Cinzel, serif',
                }}>
                  {captureResult.type === 'shakedown'
                    ? `+${captureResult.gold} gold seized!`
                    : captureResult.success ? 'Captured!'
                    : captureResult.reason === 'full' ? 'Stable is full!'
                    : 'The creature resisted!'}
                </p>
              )}
            </div>
          )}

          {/* Phase 2 Pressure */}
          {inPhase2 && !inPhase3 && phase2DamageStacks > 0 && (
            <div className="rounded p-2 mb-2 text-center" style={{ backgroundColor: 'rgba(204, 85, 0, 0.15)', border: '1px solid rgba(255, 140, 0, 0.4)' }}>
              <span className="text-sm" style={{ color: '#FB923C' }}>
                ⚠ RAMPING PRESSURE — Boss damage +{phase2DamageStacks * 5}% ({phase2DamageStacks} stacks)
              </span>
            </div>
          )}

          {/* Shadow Adds */}
          {(inPhase2 || inPhase3) && shadowAdds.length > 0 && (
            <div className="rounded p-2 mb-2" style={{ backgroundColor: 'rgba(107, 44, 145, 0.15)', border: '1px solid rgba(147, 51, 234, 0.4)' }}>
              <p className="text-sm uppercase tracking-widest text-center mb-2" style={{ color: '#B794F4' }}>Shadow Add{shadowAdds.length > 1 ? 's' : ''} ({shadowAdds.length})</p>
              <div className="space-y-1">
                {shadowAdds.map((add, idx) => (
                  <div key={add.id} className="flex items-center gap-2">
                    <span className="text-sm w-5" style={{ color: '#B794F4' }}>#{idx + 1}</span>
                    <div className="flex-1 rounded-full h-2 overflow-hidden" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
                      <div className="h-2 rounded-full" style={{ width: `${(add.hp / add.maxHp) * 100}%`, backgroundColor: '#B794F4' }} />
                    </div>
                    <span className="text-sm" style={{ color: '#B794F4' }}>{add.hp}/{add.maxHp}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AOE Warning */}
          {aoeWarning && inPhase3 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded p-3 mb-2 text-center animate-pulse"
              style={{ backgroundColor: 'rgba(139, 0, 0, 0.4)', border: '2px solid #FBBF24', boxShadow: '0 0 20px rgba(251, 191, 36, 0.3)' }}
            >
              <p className="text-yellow-400 font-bold">⚠ DEVASTATING AOE INCOMING!</p>
              <p className="text-white text-sm mt-1">Next turn: 35 damage slam!</p>
            </motion.div>
          )}

          {/* Enemy Dialogue — Speech Bubble */}
          <AnimatePresence>
            {enemyDialogue && (() => {
              const borderColor = isFinalBoss ? 'rgba(160,40,200,0.7)' : battleType === 'elite' ? 'rgba(220,120,0,0.7)' : battleType === 'wave' ? 'rgba(30,120,220,0.7)' : 'rgba(180,20,20,0.7)';
              const glowColor   = isFinalBoss ? 'rgba(160,40,200,0.2)' : battleType === 'elite' ? 'rgba(220,120,0,0.15)' : battleType === 'wave' ? 'rgba(30,120,220,0.15)' : 'rgba(180,20,20,0.15)';
              const dialogueText = enemyDialogue;
              return (
                <motion.div
                  key={dialogueText}
                  initial={{ opacity: 0, y: 10, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.22 }}
                  className="rounded-lg px-5 py-4 relative mt-2"
                  style={{ backgroundColor: 'rgba(0,0,0,0.75)', border: '2px solid ' + borderColor, boxShadow: '0 0 24px ' + glowColor + ', inset 0 1px 0 rgba(255,255,255,0.04)' }}
                >
                  <div style={{ position: 'absolute', top: '-11px', left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '10px solid transparent', borderRight: '10px solid transparent', borderBottom: '11px solid ' + borderColor }} />
                  <p className="text-xl italic text-center leading-snug" style={{ color: '#F5F5DC', fontFamily: 'Cinzel, serif' }}>
                    "<TypewriterText key={dialogueText} text={dialogueText} speed={20} />"
                  </p>
                </motion.div>
              );
            })()}
          </AnimatePresence>
        </div>

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/*  VS DIVIDER                                                       */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        <div
          className="flex items-center px-6 py-2"
          style={{
            borderTop: '1px solid rgba(139, 0, 0, 0.25)',
            borderBottom: '1px solid rgba(139, 0, 0, 0.25)',
            background: 'linear-gradient(to right, transparent, rgba(100, 5, 10, 0.2), transparent)',
          }}
        >
          <div style={{ flex: 1, height: '2px', background: 'linear-gradient(to right, transparent, rgba(212, 175, 55, 0.7))' }} />
          <p
            className="mx-5 font-black tracking-[0.5em]"
            style={{
              fontFamily: 'Cinzel, serif',
              fontSize: '1.75rem',
              color: '#D4AF37',
              textShadow: '0 0 25px rgba(212, 175, 55, 0.8), 0 0 50px rgba(212, 175, 55, 0.3)',
            }}
          >
            VS
          </p>
          <div style={{ flex: 1, height: '2px', background: 'linear-gradient(to left, transparent, rgba(212, 175, 55, 0.7))' }} />
        </div>

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/*  PLAYER SECTION                                                   */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        <div className="flex-1 flex flex-col px-6 pt-4 pb-6">

          {/* Player identity */}
          <div className="flex justify-between items-baseline mb-2">
            <span className="font-bold" style={{ fontFamily: 'Cinzel, serif', color: '#68D391', fontSize: '1.4rem' }}>{hero?.name}</span>
            <span className="text-sm uppercase tracking-widest" style={{ color: '#A0AEC0' }}>Lv.{level} {hero?.class?.name}</span>
          </div>

          {/* Player HP */}
          <div className="mb-1">
            <div className="flex justify-between items-baseline mb-1">
              <span className="text-sm uppercase tracking-widest" style={{ color: '#68D391' }}>HP</span>
              <span className="text-base font-bold" style={{ color: '#F5F5DC' }}>{hp} / {getMaxHp()}</span>
            </div>
            <div className="h-6 w-full rounded-sm overflow-hidden" style={{ backgroundColor: 'rgba(0,0,0,0.7)', border: '1px solid rgba(0, 100, 0, 0.4)', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)' }}>
              <motion.div
                className={`h-full ${playerFlash ? 'hp-pulse' : ''}`}
                animate={{ width: `${playerHpPct}%` }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                style={{
                  background: playerHpPct > 50
                    ? 'linear-gradient(to right, #1A4020, #2F6B3A, #68D391)'
                    : playerHpPct > 25
                    ? 'linear-gradient(to right, #5A4010, #B8860B, #D4A843)'
                    : 'linear-gradient(to right, #5A1010, #B82020, #DC2626)',
                  boxShadow: '0 0 6px rgba(104, 211, 145, 0.4)',
                  transition: 'background 0.5s',
                }}
              />
            </div>
          </div>

          {/* Player Stamina */}
          <div className="mb-3">
            <div className="flex justify-between items-baseline mb-1">
              <span className="text-sm uppercase tracking-widest" style={{ color: '#06B6D4' }}>SP</span>
              <span className="text-sm" style={{ color: '#A0AEC0' }}>{stamina} / {getMaxStamina()}</span>
            </div>
            <div className="h-4 w-full rounded-sm overflow-hidden" style={{ backgroundColor: 'rgba(0,0,0,0.7)', border: '1px solid rgba(6, 182, 212, 0.3)' }}>
              <motion.div
                className="h-full"
                animate={{ width: `${staminaPct}%` }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                style={{ background: 'linear-gradient(to right, #0E7490, #06B6D4)', boxShadow: '0 0 6px rgba(6, 182, 212, 0.4)' }}
              />
            </div>
          </div>

          {/* Player debuff badges */}
          {playerDebuffs && (playerDebuffs.bleedTurns > 0 || playerDebuffs.armorShredTurns > 0) && (
            <div className="flex gap-2 mb-2 flex-wrap">
              {playerDebuffs.bleedTurns > 0 && (
                <span className="px-2 py-0.5 rounded text-xs font-bold animate-pulse" style={{ backgroundColor: 'rgba(220, 38, 38, 0.2)', border: '1px solid rgba(220, 38, 38, 0.5)', color: '#F87171' }}>
                  🩸 BLEEDING ×{playerDebuffs.bleedTurns} ({playerDebuffs.bleedDamage}/turn)
                </span>
              )}
              {playerDebuffs.armorShredTurns > 0 && (
                <span className="px-2 py-0.5 rounded text-xs font-bold animate-pulse" style={{ backgroundColor: 'rgba(249, 115, 22, 0.2)', border: '1px solid rgba(249, 115, 22, 0.5)', color: '#FB923C' }}>
                  ⚔️ ARMOR SHRED ×{playerDebuffs.armorShredTurns}
                </span>
              )}
            </div>
          )}

          {/* Charge stacks */}
          {chargeStacks > 0 && (
            <div className="flex items-center justify-center gap-2 mb-3 py-1.5 rounded" style={{ backgroundColor: 'rgba(212, 175, 55, 0.08)', border: '1px solid rgba(212, 175, 55, 0.2)' }}>
              <span className="text-sm uppercase tracking-widest" style={{ color: COLORS.gold }}>Charges</span>
              {[1, 2, 3].map(i => (
                <div key={i} className="w-4 h-4 rounded-full transition-all" style={{
                  backgroundColor: i <= chargeStacks ? COLORS.gold : '#374151',
                  boxShadow: i <= chargeStacks ? `0 0 8px ${COLORS.gold}` : 'none',
                }} />
              ))}
              {chargeStacks === 3 && <span className="text-sm font-bold ml-1" style={{ color: COLORS.gold }}>⚡ READY</span>}
            </div>
          )}

          {/* Hero Dialogue — Speech Bubble */}
          <AnimatePresence>
            {heroDialogue && (
              <motion.div
                key={heroDialogue}
                initial={{ opacity: 0, y: 10, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.22 }}
                className="rounded-lg px-5 py-4 relative mb-3"
                style={{ backgroundColor: 'rgba(0,0,0,0.75)', border: '2px solid rgba(104,211,145,0.6)', boxShadow: '0 0 20px rgba(104,211,145,0.12), inset 0 1px 0 rgba(255,255,255,0.04)' }}
              >
                <div style={{ position: 'absolute', top: '-11px', left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '10px solid transparent', borderRight: '10px solid transparent', borderBottom: '11px solid rgba(104,211,145,0.6)' }} />
                <p className="text-base italic text-center leading-snug" style={{ color: '#F5F5DC', fontFamily: 'Cinzel, serif' }}>
                  "<TypewriterText key={heroDialogue} text={heroDialogue} speed={22} />"
                </p>
                <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.58rem', letterSpacing: '0.15em', color: 'rgba(104,211,145,0.55)', textAlign: 'center', marginTop: '6px', textTransform: 'uppercase' }}>
                  — {hero?.name}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ══════════════════════════════════════════════════════════════════ */}
          {/*  BATTLE ACTIONS                                                   */}
          {/* ══════════════════════════════════════════════════════════════════ */}
          {battling && bossHp > 0 && hp > 0 && (
            <div>
              <AnimatePresence mode="wait">

                {/* ── Main Menu ── */}
                {turnPhase === 'player' && battleMenu === 'main' && (
                  <motion.div key="main" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.12 }}>

                    {/* ⚡ Charged Strike — standalone D20 crit, no SP cost, shown at max charges */}
                    {chargeStacks === GAME_CONSTANTS.CHARGE_SYSTEM.maxCharges && (() => {
                      const locked = level < GAME_CONSTANTS.SKILL_UNLOCK_LEVELS.special;
                      const canUse = !locked;
                      return (
                        <motion.button
                          key="unleash"
                          initial={{ opacity: 0, scale: 0.94 }}
                          animate={{ opacity: 1, scale: 1 }}
                          onClick={() => canUse && handlePlayerAction(chargedStrike, 'Charged Strike')}
                          disabled={!canUse}
                          className="w-full py-3 rounded font-black uppercase transition-all border-2 mb-3 disabled:cursor-not-allowed"
                          style={{
                            background: canUse
                              ? 'linear-gradient(to bottom, rgba(212,175,55,0.92), rgba(155,110,5,0.96))'
                              : 'rgba(30,40,55,0.7)',
                            borderColor: canUse ? '#D4AF37' : 'rgba(80,80,80,0.3)',
                            color: canUse ? '#120d00' : '#888',
                            opacity: canUse ? 1 : 0.5,
                            boxShadow: canUse ? '0 0 24px rgba(212,175,55,0.55), 0 4px 14px rgba(212,175,55,0.22)' : 'none',
                            fontFamily: 'Cinzel, serif',
                            letterSpacing: '0.18em',
                            animation: canUse ? 'intro-hint-pulse 1.6s ease-in-out infinite' : 'none',
                          }}
                        >
                          ⚡ CHARGED STRIKE
                          <div className="text-xs font-normal mt-0.5 opacity-75" style={{ letterSpacing: '0.08em' }}>
                            {locked ? `Unlocks at Level ${GAME_CONSTANTS.SKILL_UNLOCK_LEVELS.special}` : 'Free · D20 Crit Roll'}
                          </div>
                        </motion.button>
                      );
                    })()}

                    <div className={`grid gap-3 mb-3 ${(battleType === 'regular' || battleType === 'wave') && hp / getMaxHp() <= 0.40 ? 'grid-cols-3' : (canFlee || showDodgeButton) ? 'grid-cols-3' : 'grid-cols-2'}`}>
                      <button onClick={() => { sounds.click(); setBattleMenu('fight'); }}
                        className="py-4 rounded font-black text-base uppercase tracking-widest transition-all hover:scale-105 active:scale-95"
                        style={{ background: 'linear-gradient(to bottom, rgba(160, 8, 8, 0.9), rgba(90, 4, 4, 0.9))', border: '2px solid rgba(200, 30, 30, 0.7)', color: '#F5F5DC', boxShadow: '0 4px 15px rgba(139, 0, 0, 0.4)', fontFamily: 'Cinzel, serif', letterSpacing: '0.15em' }}>
                        Fight
                      </button>

                      <button onClick={() => { sounds.click(); setBattleMenu('items'); }}
                        disabled={healthPots === 0 && staminaPots === 0}
                        className="py-4 rounded font-black text-base uppercase tracking-widest transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{ background: (healthPots > 0 || staminaPots > 0) ? 'linear-gradient(to bottom, rgba(180, 130, 10, 0.9), rgba(110, 80, 6, 0.9))' : 'rgba(30, 40, 55, 0.7)', border: `2px solid ${(healthPots > 0 || staminaPots > 0) ? 'rgba(212, 175, 55, 0.6)' : 'rgba(80,80,80,0.3)'}`, color: '#F5F5DC', boxShadow: (healthPots > 0 || staminaPots > 0) ? '0 4px 15px rgba(180, 130, 10, 0.3)' : 'none', fontFamily: 'Cinzel, serif', letterSpacing: '0.15em' }}>
                        Items
                      </button>

                      {(battleType === 'regular' || battleType === 'wave') && hp / getMaxHp() <= 0.40 && !hasBeggedThisBattle && (
                        <button onClick={() => { sounds.negotiateOpen(); setBattleMenu('negotiate'); setNegotiatePhase('open'); }}
                          className="py-4 rounded font-black text-base uppercase tracking-widest transition-all hover:scale-105 active:scale-95 animate-pulse"
                          style={{ background: 'linear-gradient(to bottom, rgba(80,10,10,0.95), rgba(50,5,5,0.95))', border: '2px solid rgba(200,50,50,0.7)', color: '#FCA5A5', fontFamily: 'Cinzel, serif', letterSpacing: '0.15em', boxShadow: '0 0 12px rgba(200,50,50,0.4)' }}>
                          Beg
                        </button>
                      )}

                      {canFlee && (
                        <button onClick={() => handlePlayerAction(flee, 'Flee', true)}
                          disabled={stamina < 25}
                          className="py-4 rounded font-black text-base uppercase tracking-widest transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                          style={{ background: stamina >= 25 ? 'linear-gradient(to bottom, rgba(30, 70, 35, 0.9), rgba(15, 40, 18, 0.9))' : 'rgba(30, 40, 55, 0.7)', border: `2px solid ${stamina >= 25 ? 'rgba(60, 160, 70, 0.6)' : 'rgba(80,80,80,0.3)'}`, color: '#F5F5DC', fontFamily: 'Cinzel, serif', letterSpacing: '0.15em' }}>
                          Flee
                          {stamina >= 25 && <div className="text-sm font-normal mt-0.5 opacity-60">25 SP</div>}
                        </button>
                      )}

                      {showDodgeButton && (
                        <button onClick={() => handlePlayerAction(dodge, 'Dodge', true)}
                          className="py-4 rounded font-black text-base uppercase tracking-widest transition-all hover:scale-105 active:scale-95 animate-pulse"
                          style={{ background: 'linear-gradient(to bottom, rgba(20, 50, 100, 0.9), rgba(10, 30, 60, 0.9))', border: '2px solid rgba(96, 165, 250, 0.7)', color: '#93C5FD', fontFamily: 'Cinzel, serif', letterSpacing: '0.15em' }}>
                          Dodge
                          <div className="text-sm font-normal mt-0.5 opacity-70">Avoid AOE</div>
                        </button>
                      )}
                    </div>

                  </motion.div>
                )}

                {/* ── Negotiate Submenu ── */}
                {turnPhase === 'player' && battleMenu === 'negotiate' && (
                  <motion.div key="negotiate" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.12 }}>
                    {negotiatePhase === 'open' && (
                      <>
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <button
                            disabled={hasBeggedThisBattle}
                            onClick={() => {
                              if (turnPhase !== 'player' || hasBeggedThisBattle) return;
                              setHeroDialogue("I am not ready. Not here, not like this... There is still so much left unfinished. Please.");
                              setHasBeggedThisBattle(true);
                              // Wait for hero text to finish before enemy responds
                              setTimeout(() => {
                                const result = negotiate('persuade');
                                if (result?.success) {
                                  setNegotiateOutcome('success');
                                } else {
                                  setNegotiateOutcome('fail');
                                  setTimeout(() => {
                                    setBattleMenu('main');
                                    setNegotiatePhase('idle');
                                    setNegotiateOutcome(null);
                                  }, 4000);
                                }
                              }, 2200);
                            }}
                            className="py-4 rounded font-black text-sm uppercase tracking-widest transition-all hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed"
                            style={{ background: 'linear-gradient(to bottom, rgba(30,60,100,0.9), rgba(15,35,60,0.9))', border: '2px solid rgba(96,165,250,0.5)', color: '#93C5FD', fontFamily: 'Cinzel, serif', letterSpacing: '0.12em' }}
                          >
                            Persuade
                            <div style={{ fontSize: '0.6rem', fontWeight: 'normal', marginTop: '3px', opacity: 0.65 }}>
                              WIS · {Math.round(Math.max(5, 30 + Math.floor(((hero?.abilities?.wis||10)-10)/2) * 8))}% chance
                            </div>
                          </button>
                          <button
                            disabled={hasBeggedThisBattle}
                            onClick={() => {
                              if (turnPhase !== 'player' || hasBeggedThisBattle) return;
                              setHeroDialogue("Take the gold. All of it. I want nothing but my life — is that not worth more to you?");
                              setHasBeggedThisBattle(true);
                              // Wait for hero text to finish before enemy responds
                              setTimeout(() => {
                                const result = negotiate('bribe', bribeCost);
                                if (result?.success) {
                                  setNegotiateOutcome('success');
                                } else {
                                  setNegotiateOutcome('fail');
                                  setTimeout(() => {
                                    setBattleMenu('main');
                                    setNegotiatePhase('idle');
                                    setNegotiateOutcome(null);
                                  }, 4000);
                                }
                              }, 2200);
                            }}
                            className="py-4 rounded font-black text-sm uppercase tracking-widest transition-all hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed"
                            style={{ background: 'linear-gradient(to bottom, rgba(100,70,10,0.9), rgba(60,40,5,0.9))', border: '2px solid rgba(180,140,30,0.5)', color: '#FCD34D', fontFamily: 'Cinzel, serif', letterSpacing: '0.12em' }}
                          >
                            Bribe
                            <div style={{ fontSize: '0.6rem', fontWeight: 'normal', marginTop: '3px', opacity: 0.65 }}>
                              {bribeCost}g · CHA price
                            </div>
                          </button>
                        </div>
                        <button onClick={() => { setBattleMenu('main'); setNegotiatePhase('idle'); setHeroDialogue(''); setEnemyDialogue(''); setNegotiateOutcome(null); }}
                          className="w-full py-2 rounded text-sm uppercase tracking-widest transition-all hover:opacity-80"
                          style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(80,80,80,0.3)', color: 'rgba(180,180,180,0.6)', fontFamily: 'Cinzel, serif' }}>
                          ← Back
                        </button>
                      </>
                    )}
                  </motion.div>
                )}

                {/* ── Fight Submenu ── */}
                {turnPhase === 'player' && battleMenu === 'fight' && (
                  <motion.div key="fight" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.12 }}>
                    <div className="grid grid-cols-2 gap-2 mb-2">

                      {/* Basic Attack */}
                      <button onClick={() => handlePlayerAction(attack, hero?.class?.name ? (GAME_CONSTANTS.BASIC_ATTACK_NAMES[hero.class.name] || 'Attack') : 'Attack')}
                        className="py-4 px-3 rounded font-bold transition-all border-2 hover:scale-105 active:scale-95"
                        style={{ background: 'linear-gradient(to bottom, rgba(160, 8, 8, 0.85), rgba(90, 4, 4, 0.85))', borderColor: 'rgba(200, 30, 30, 0.6)', color: '#F5F5DC' }}>
                        <div className="text-base uppercase tracking-wide">{hero?.class?.name ? GAME_CONSTANTS.BASIC_ATTACK_NAMES[hero.class.name] : 'Attack'}</div>
                        <div className="text-sm mt-0.5 opacity-60">Basic Strike</div>
                      </button>

                      {/* Knight: Crushing Blow */}
                      {hero?.class?.name === 'Knight' && (() => {
                        const cd = onCooldown(knightCrushingBlowCooldown);
                        const locked = level < GAME_CONSTANTS.SKILL_UNLOCK_LEVELS.basicSkill;
                        if (locked) return null;
                        const noSP = stamina < 17;
                        const unavail = noSP || cd;
                        return (
                          <button onClick={() => handlePlayerAction(useCrushingBlow, 'Crushing Blow')} disabled={unavail}
                            className="py-4 px-3 rounded font-bold transition-all border-2 hover:scale-105 active:scale-95 disabled:cursor-not-allowed relative overflow-hidden"
                            title={locked ? `Unlocks at Level ${GAME_CONSTANTS.SKILL_UNLOCK_LEVELS.basicSkill}` : 'Powerful strike. Cannot be used twice in a row.'}
                            style={{ background: !unavail ? 'linear-gradient(to bottom, rgba(165, 42, 42, 0.85), rgba(100, 25, 25, 0.85))' : 'rgba(30, 40, 55, 0.6)', borderColor: !unavail ? 'rgba(165, 42, 42, 0.6)' : 'rgba(80,80,80,0.3)', color: '#F5F5DC', opacity: unavail ? 0.55 : 1 }}>
                            {cd && <div className="absolute inset-0 pointer-events-none" style={{ background: 'repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(0,0,0,0.25) 4px, rgba(0,0,0,0.25) 8px)' }} />}
                            <div className="text-base uppercase tracking-wide">Crushing Blow</div>
                            <div className="text-sm mt-0.5 opacity-70">
                              {cd ? <span className="text-yellow-300">⏳ On Cooldown</span> : '17 SP'}
                            </div>
                          </button>
                        );
                      })()}

                      {/* Crusader: Smite */}
                      {hero?.class?.name === 'Crusader' && (() => {
                        const cd = onCooldown(crusaderSmiteCooldown);
                        const locked = level < GAME_CONSTANTS.SKILL_UNLOCK_LEVELS.basicSkill;
                        if (locked) return null;
                        const unavail = stamina < 15 || cd;
                        return (
                          <button onClick={() => handlePlayerAction(useSmite, 'Smite')} disabled={unavail}
                            className="py-4 px-3 rounded font-bold transition-all border-2 hover:scale-105 active:scale-95 disabled:cursor-not-allowed relative overflow-hidden"
                            title={locked ? `Unlocks at Level ${GAME_CONSTANTS.SKILL_UNLOCK_LEVELS.basicSkill}` : 'Holy strike that heals.'}
                            style={{ background: !unavail ? 'linear-gradient(to bottom, rgba(218, 165, 32, 0.85), rgba(160, 120, 10, 0.85))' : 'rgba(30, 40, 55, 0.6)', borderColor: !unavail ? 'rgba(218, 165, 32, 0.6)' : 'rgba(80,80,80,0.3)', color: '#F5F5DC', opacity: unavail ? 0.55 : 1 }}>
                            {cd && <div className="absolute inset-0 pointer-events-none" style={{ background: 'repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(0,0,0,0.25) 4px, rgba(0,0,0,0.25) 8px)' }} />}
                            <div className="text-base uppercase tracking-wide">Smite</div>
                            <div className="text-sm mt-0.5 opacity-70">
                              {cd ? <span className="text-yellow-300">⏳ On Cooldown</span> : '15 SP'}
                            </div>
                          </button>
                        );
                      })()}

                      {/* Special Attack */}
                      {hero?.class && GAME_CONSTANTS.SPECIAL_ATTACKS[hero.class.name] && (() => {
                        const spec = GAME_CONSTANTS.SPECIAL_ATTACKS[hero.class.name];
                        const locked = level < GAME_CONSTANTS.SKILL_UNLOCK_LEVELS.special;
                        if (locked) return null;
                        const cd = (hero.class.name === 'Wizard' && wizardTemporalCooldown) || (hero.class.name === 'Crusader' && crusaderJudgmentCooldown);
                        const unavail = stamina < spec.cost || (spec.hpCost && hp <= spec.hpCost) || cd;
                        return (
                          <button onClick={() => handlePlayerAction(specialAttack, spec.name)} disabled={unavail}
                            className="py-4 px-3 rounded font-bold transition-all border-2 hover:scale-105 active:scale-95 disabled:cursor-not-allowed relative overflow-hidden"
                            title={locked ? `Unlocks at Level ${GAME_CONSTANTS.SKILL_UNLOCK_LEVELS.special}` : spec.effect}
                            style={{ background: !unavail ? 'linear-gradient(to bottom, rgba(13, 116, 142, 0.85), rgba(8, 77, 94, 0.85))' : 'rgba(30, 40, 55, 0.6)', borderColor: !unavail ? 'rgba(13, 116, 142, 0.6)' : 'rgba(80,80,80,0.3)', color: '#F5F5DC', opacity: unavail ? 0.55 : 1 }}>
                            {cd && <div className="absolute inset-0 pointer-events-none" style={{ background: 'repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(0,0,0,0.25) 4px, rgba(0,0,0,0.25) 8px)' }} />}
                            <div className="text-base uppercase tracking-wide">{spec.name}</div>
                            <div className="text-sm mt-0.5 opacity-70">
                              {cd ? <span className="text-yellow-300">⏳ On Cooldown</span> : <>{spec.cost} SP{spec.hpCost ? ` · ${spec.hpCost + (recklessStacks * 10)} HP` : ''}</>}
                            </div>
                          </button>
                        );
                      })()}

                      {/* Tactical Skill */}
                      {hero?.class && GAME_CONSTANTS.TACTICAL_SKILLS[hero.class.name] && (() => {
                        const tac = GAME_CONSTANTS.TACTICAL_SKILLS[hero.class.name];
                        const locked = level < GAME_CONSTANTS.SKILL_UNLOCK_LEVELS.tactical;
                        if (locked) return null;
                        const cd = (hero.class.name === 'Knight' && knightRallyingRoarCooldown) ||
                          (hero.class.name === 'Wizard' && wizardEtherealBarrierCooldown) ||
                          (hero.class.name === 'Assassin' && assassinMarkForDeathCooldown) ||
                          (hero.class.name === 'Crusader' && crusaderBastionOfFaithCooldown);
                        const unavail = stamina < tac.cost || cd;
                        return (
                          <button onClick={() => handlePlayerAction(useTacticalSkill, tac.name)} disabled={unavail}
                            className="py-4 px-3 rounded font-bold transition-all border-2 hover:scale-105 active:scale-95 disabled:cursor-not-allowed relative overflow-hidden"
                            title={locked ? `Unlocks at Level ${GAME_CONSTANTS.SKILL_UNLOCK_LEVELS.tactical}` : tac.effect}
                            style={{ background: !unavail ? 'linear-gradient(to bottom, rgba(184, 134, 11, 0.85), rgba(120, 87, 7, 0.85))' : 'rgba(30, 40, 55, 0.6)', borderColor: !unavail ? 'rgba(184, 134, 11, 0.6)' : 'rgba(80,80,80,0.3)', color: '#F5F5DC', opacity: unavail ? 0.55 : 1 }}>
                            {cd && <div className="absolute inset-0 pointer-events-none" style={{ background: 'repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(0,0,0,0.25) 4px, rgba(0,0,0,0.25) 8px)' }} />}
                            <div className="text-base uppercase tracking-wide">{tac.name}</div>
                            <div className="text-sm mt-0.5 opacity-70">
                              {cd ? <span className="text-yellow-300">⏳ On Cooldown</span> : <>{tac.cost} SP</>}
                            </div>
                          </button>
                        );
                      })()}
                    </div>

                    <button onClick={() => setBattleMenu('main')}
                      className="w-full py-3 rounded text-base uppercase tracking-widest transition-all hover:opacity-80"
                      style={{ background: 'rgba(30, 40, 55, 0.6)', border: '1px solid rgba(80,80,80,0.3)', color: '#9CA3AF' }}>
                      ← Back
                    </button>
                  </motion.div>
                )}

                {/* ── Items Submenu ── */}
                {turnPhase === 'player' && battleMenu === 'items' && (
                  <motion.div key="items" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.12 }}>
                    <div className="grid grid-cols-2 gap-3 mb-2">
                      <button onClick={() => handlePlayerAction(useHealth, 'Health Potion')} disabled={healthPots === 0}
                        className="py-4 rounded font-bold transition-all border-2 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{ background: healthPots > 0 ? 'linear-gradient(to bottom, rgba(180, 30, 30, 0.85), rgba(120, 15, 15, 0.85))' : 'rgba(30, 40, 55, 0.6)', borderColor: healthPots > 0 ? 'rgba(220, 50, 50, 0.6)' : 'rgba(80,80,80,0.3)', color: '#F5F5DC' }}>
                        <div className="text-base uppercase tracking-wide">Health Potion</div>
                        <div className="text-sm mt-1 opacity-60">x{healthPots}</div>
                      </button>

                      <button
                        onClick={() => {
                          if (staminaPots > 0) {
                            const maxStamina = getMaxStamina();
                            const restoreAmount = Math.max(GAME_CONSTANTS.STAMINA_POTION_MIN, Math.floor(maxStamina * (GAME_CONSTANTS.STAMINA_POTION_RESTORE_PERCENT / 100)));
                            setStamina(Math.min(stamina + restoreAmount, maxStamina));
                            setStaminaPots(staminaPots - 1);
                            addLog(`Used Stamina Potion (+${restoreAmount} SP)`);
                          }
                        }}
                        disabled={staminaPots === 0}
                        className="py-4 rounded font-bold transition-all border-2 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{ background: staminaPots > 0 ? 'linear-gradient(to bottom, rgba(6, 140, 170, 0.85), rgba(4, 90, 110, 0.85))' : 'rgba(30, 40, 55, 0.6)', borderColor: staminaPots > 0 ? 'rgba(6, 182, 212, 0.6)' : 'rgba(80,80,80,0.3)', color: '#F5F5DC' }}>
                        <div className="text-base uppercase tracking-wide">Stamina Potion</div>
                        <div className="text-sm mt-1 opacity-60">x{staminaPots}</div>
                      </button>
                    </div>

                    <button onClick={() => setBattleMenu('main')}
                      className="w-full py-3 rounded text-base uppercase tracking-widest transition-all hover:opacity-80"
                      style={{ background: 'rgba(30, 40, 55, 0.6)', border: '1px solid rgba(80,80,80,0.3)', color: '#9CA3AF' }}>
                      ← Back
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── Pokémon-style text box ── */}
              <div className="rounded mt-3 px-5 py-4 min-h-[6rem] flex items-center" style={{
                background: 'rgba(0,0,0,0.55)',
                border: '2px solid rgba(212,175,55,0.25)',
                boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.4)',
              }}>
                <AnimatePresence mode="wait">
                  {turnPhase === 'narrating' && battleLine ? (
                    <motion.p key={battleLine}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="text-2xl leading-relaxed"
                      style={{ color: '#F5F5DC' }}>
                      <TypewriterText text={battleLine} speed={25} />
                    </motion.p>
                  ) : battleMenu === 'negotiate' && negotiateOutcome === 'fail' ? (
                    <motion.p key="beg-fail"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="text-base uppercase tracking-[0.2em] w-full text-center"
                      style={{ color: '#FCA5A5', fontFamily: 'Cinzel, serif' }}>
                      ✗ The shadow refuses. Brace yourself...
                    </motion.p>
                  ) : battleMenu === 'negotiate' ? (
                    <motion.p key="beg-event"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="text-base uppercase tracking-[0.25em] w-full text-center animate-pulse"
                      style={{ color: '#FCA5A5', fontFamily: 'Cinzel, serif' }}>
                      ⚠ {hero?.name || 'The hero'} begs for mercy...
                    </motion.p>
                  ) : (
                    <motion.p key="idle"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="text-xl uppercase tracking-[0.3em] w-full text-center"
                      style={{ color: '#FFFFFF' }}>
                      What will {hero?.name || 'you'} do?
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════ */}
          {/*  VICTORY                                                          */}
          {/* ══════════════════════════════════════════════════════════════════ */}
          {bossHp <= 0 && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center pt-2">
              {hasFled ? (
                <>
                  <p className="text-4xl font-bold mb-3 animate-pulse" style={{ color: '#FBBF24', fontFamily: 'Cinzel, serif' }}>FLED</p>
                  <p className="text-base italic mb-6" style={{ color: '#A0AEC0' }}>"Cowardice is also a strategy..."</p>
                </>
              ) : (
                <div className="mb-4">
                  <div className="flex items-center justify-center gap-3 mb-1">
                    <div style={{ width: '80px', height: '2px', background: 'linear-gradient(to right, transparent, rgba(104, 211, 145, 0.7))' }} />
                    <p className="font-black" style={{ fontFamily: 'Cinzel, serif', fontSize: 'clamp(2.5rem, 7vw, 4rem)', color: '#68D391', textShadow: '0 0 30px rgba(104, 211, 145, 0.6), 0 0 60px rgba(104, 211, 145, 0.2)', letterSpacing: '0.1em' }}>
                      {isFinalBoss ? 'CURSE BROKEN!' : 'VICTORY'}
                    </p>
                    <div style={{ width: '80px', height: '2px', background: 'linear-gradient(to left, transparent, rgba(104, 211, 145, 0.7))' }} />
                  </div>
                  <p className="text-sm italic" style={{ color: '#A0AEC0' }}>
                    {isFinalBoss ? '"You are finally free..."' : '"The beast falls. You are healed and rewarded."'}
                  </p>
                </div>
              )}

              {!hasFled && victoryLoot.length > 0 && (
                <div className="rounded p-4 mb-4" style={{ background: 'linear-gradient(to bottom, rgba(212, 175, 55, 0.12), rgba(180, 130, 10, 0.06))', border: '1px solid rgba(212, 175, 55, 0.5)', boxShadow: '0 0 25px rgba(212, 175, 55, 0.2)' }}>
                  <p className="text-xs uppercase tracking-[0.3em] text-center mb-3" style={{ color: '#D4AF37' }}>Spoils of Battle</p>
                  <div className="space-y-1.5">
                    {victoryLoot.map((loot, idx) => (
                      <motion.div key={idx} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.08 }}
                        className="rounded px-3 py-1.5" style={{ backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(212, 175, 55, 0.2)' }}>
                        <p className="text-sm" style={{ color: '#F5F5DC' }}>{loot}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {(battleType === 'elite' || isFinalBoss) && (
                <button onClick={advance} className="px-10 py-3 rounded font-black text-lg uppercase tracking-widest transition-all hover:scale-105"
                  style={{ background: 'linear-gradient(to bottom, #D4AF37, #B8860B)', border: '2px solid rgba(212, 175, 55, 0.8)', color: '#1C1C1C', boxShadow: '0 0 25px rgba(212, 175, 55, 0.5)', fontFamily: 'Cinzel, serif' }}>
                  {isFinalBoss ? 'CLAIM FREEDOM' : 'CONTINUE'}
                </button>
              )}
              {(battleType === 'regular' || battleType === 'wave') && (
                <button onClick={() => { setShowBoss(false); setHasFled(false); addLog('⚔️ Ready for your next trial...'); }}
                  className="px-10 py-3 rounded font-black text-lg uppercase tracking-widest transition-all hover:scale-105"
                  style={{ background: 'linear-gradient(to bottom, rgba(40, 80, 45, 0.9), rgba(20, 50, 25, 0.9))', border: '2px solid rgba(60, 160, 70, 0.6)', color: '#F5F5DC', fontFamily: 'Cinzel, serif' }}>
                  CONTINUE
                </button>
              )}
            </motion.div>
          )}

          {/* ══════════════════════════════════════════════════════════════════ */}
          {/*  DEFEAT                                                           */}
          {/* ══════════════════════════════════════════════════════════════════ */}
          {hp <= 0 && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center pt-2">
              <p className="font-black mb-2" style={{ fontFamily: 'Cinzel, serif', fontSize: 'clamp(2.5rem, 7vw, 4rem)', color: '#9B1B30', textShadow: '0 0 30px rgba(155, 27, 48, 0.7)', letterSpacing: '0.08em' }}>DEFEATED</p>
              <p className="text-sm italic mb-6" style={{ color: '#A0AEC0' }}>"The curse claims another victim..."</p>
              <button onClick={() => { setShowBoss(false); die(); }}
                className="px-10 py-3 rounded font-black text-lg uppercase tracking-widest transition-all hover:scale-105"
                style={{ background: 'linear-gradient(to bottom, rgba(100, 10, 20, 0.9), rgba(55, 5, 10, 0.9))', border: '2px solid rgba(200, 30, 30, 0.5)', color: '#F5F5DC', fontFamily: 'Cinzel, serif' }}>
                CONTINUE
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default BattleModal;
