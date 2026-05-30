import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { COLORS, GAME_CONSTANTS } from '../constants';

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
    { name: 'Frenzied Strike', desc: 'attacks in a frenzied rush!' },
    { name: 'Overwhelming Blow', desc: 'overwhelms you with sheer numbers!' },
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
  // Dialogue / taunt state
  showTauntBoxes,
  enemyDialogue,
  enemyTauntResponse,
  playerTaunt,
  isTauntAvailable,
  // Player state
  playerFlash,
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
  // Callbacks
  attack,
  useCrushingBlow,
  useSmite,
  specialAttack,
  useTacticalSkill,
  useHealth,
  flee,
  dodge,
  taunt,
  advance,
  die,
  addLog,
  setStamina,
  setStaminaPots,
  getRarityColor,
}) => {
  // ── Local effect state ──────────────────────────────────────────────────────
  const [floatingNumbers, setFloatingNumbers] = useState([]);
  const [shaking, setShaking] = useState(false);
  const [phaseCard, setPhaseCard] = useState(null);
  const [turnPhase, setTurnPhase] = useState('player'); // 'player' | 'narrating'
  const [battleLine, setBattleLine] = useState('');
  const turnTimers = useRef([]);
  const logRef = useRef(null);
  const prevBossHp = useRef(bossHp);
  const prevPlayerHp = useRef(hp);
  const prevPhase2 = useRef(inPhase2);
  const prevPhase3 = useRef(inPhase3);
  const floatId = useRef(0);

  // Floating number helper
  const spawnFloat = (value, type) => {
    const id = ++floatId.current;
    setFloatingNumbers(prev => [...prev, { id, value, type, x: Math.random() * 60 - 30 }]);
    setTimeout(() => setFloatingNumbers(prev => prev.filter(n => n.id !== id)), 1100);
  };

  // Boss damage floats
  useEffect(() => {
    if (bossHp < prevBossHp.current && prevBossHp.current > 0) {
      spawnFloat(`-${prevBossHp.current - bossHp}`, 'boss');
    }
    prevBossHp.current = bossHp;
  }, [bossHp]);

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

  const schedule = (fn, delay) => {
    const id = setTimeout(fn, delay);
    turnTimers.current.push(id);
  };

  // Pokémon-style: show player action text → enemy move text → return control
  const handlePlayerAction = (actionFn, playerActionName, skipEnemyTurn = false) => {
    if (turnPhase !== 'player') return;

    const CHAR_SPEED = 25; // must match TypewriterText speed prop
    const READ_PAUSE = 1000; // ms to hold after typing finishes before advancing

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
    const enemyTextDuration = enemyText.length * CHAR_SPEED + READ_PAUSE;
    schedule(() => {
      setBattleLine('');
      setTurnPhase('player');
    }, enemyActDelay + enemyTextDuration);
  };

  // ── Derived values ──────────────────────────────────────────────────────────
  const bossHpPct = (bossHp / bossMax) * 100;
  const playerHpPct = (hp / getMaxHp()) * 100;
  const staminaPct = (stamina / getMaxStamina()) * 100;

  const phaseLabel = isFinalBoss
    ? (inPhase3 ? 'PHASE 3 — ABYSS AWAKENING' : inPhase2 ? 'PHASE 2 — THE PRESSURE' : 'THE UNDYING LEGEND')
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
      style={{ background: 'radial-gradient(ellipse at 50% 20%, rgb(80, 5, 12) 0%, rgb(4, 0, 0) 65%)' }}
    >
      {/* ── Floating damage/heal numbers overlay ─────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 50 }}>
        <AnimatePresence>
          {floatingNumbers.map(n => (
            <motion.div
              key={n.id}
              initial={{ opacity: 1, y: 0 }}
              animate={{ opacity: [1, 1, 0], y: n.type === 'boss' ? -90 : n.type === 'damage' ? 70 : -70 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2.0, ease: 'easeOut', times: n.type === 'boss' ? [0, 0.5, 1] : [0, 0.45, 1] }}
              style={{
                position: 'absolute',
                top: n.type === 'boss' ? '28%' : '62%',
                left: `calc(50% + ${n.x}px)`,
                transform: 'translateX(-50%)',
                fontFamily: 'Cinzel, serif',
                fontSize: '2.2rem',
                fontWeight: 900,
                color: n.type === 'heal' ? '#4ADE80' : '#FF3333',
                textShadow: n.type === 'heal'
                  ? '0 0 20px rgba(74,222,128,0.9), 0 2px 0 rgba(0,0,0,0.8)'
                  : '0 0 20px rgba(255,0,0,0.9), 0 2px 0 rgba(0,0,0,0.8)',
                whiteSpace: 'nowrap',
              }}
            >
              {n.value}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Scanline overlay */}
      <div className="fixed inset-0 pointer-events-none" style={{
        background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.04) 3px, rgba(0,0,0,0.04) 4px)',
        zIndex: 1,
      }} />

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

          {/* Boss Name */}
          {bossName && (
            <motion.h1
              className="text-center font-black mb-2"
              style={{
                fontFamily: 'Cinzel, serif',
                fontSize: 'clamp(2.2rem, 6vw, 3.8rem)',
                color: bossFlash ? '#FF3333' : (isFinalBoss ? '#D4AF37' : '#E8E8E8'),
                textShadow: bossFlash
                  ? '0 0 40px rgba(255, 68, 68, 0.9), 0 0 80px rgba(255, 0, 0, 0.4)'
                  : isFinalBoss
                  ? '0 0 30px rgba(212, 175, 55, 0.6), 0 2px 0 rgba(0,0,0,0.8)'
                  : '0 0 20px rgba(220, 50, 50, 0.4), 0 2px 0 rgba(0,0,0,0.8)',
                transition: 'color 0.1s, text-shadow 0.1s',
                letterSpacing: '0.04em',
              }}
            >
              {bossName}
            </motion.h1>
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
              <span className="text-sm uppercase tracking-widest" style={{ color: '#CD7F32' }}>Enemy HP</span>
              <span className="text-base font-bold" style={{ color: '#F5F5DC' }}>{bossHp} / {bossMax}</span>
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

          {/* Enemy Dialogue */}
          <AnimatePresence>
            {(showTauntBoxes || enemyDialogue) && (
              <motion.div
                key={showTauntBoxes ? 'taunt' : 'dialogue'}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="rounded p-3 relative"
                style={{ backgroundColor: 'rgba(0,0,0,0.5)', border: '1px solid rgba(139, 0, 0, 0.4)' }}
              >
                <p className="text-base italic text-center" style={{ color: 'rgba(245,245,220,0.85)' }}>
                  "{showTauntBoxes ? (enemyTauntResponse || '...') : enemyDialogue}"
                </p>
              </motion.div>
            )}
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

          {/* Player Taunt */}
          {showTauntBoxes && playerTaunt && (
            <div className="rounded p-2 mb-3" style={{ backgroundColor: 'rgba(0,0,0,0.5)', border: '1px solid rgba(59, 130, 246, 0.4)' }}>
              <p className="text-base" style={{ color: '#F5F5DC' }}>"{playerTaunt}"</p>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════ */}
          {/*  BATTLE ACTIONS                                                   */}
          {/* ══════════════════════════════════════════════════════════════════ */}
          {battling && bossHp > 0 && hp > 0 && (
            <div>
              <AnimatePresence mode="wait">

                {/* ── Main Menu ── */}
                {turnPhase === 'player' && battleMenu === 'main' && (
                  <motion.div key="main" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.12 }}>
                    <div className={`grid gap-3 mb-3 ${canFlee || showDodgeButton ? 'grid-cols-3' : 'grid-cols-2'}`}>
                      <button onClick={() => setBattleMenu('fight')}
                        className="py-4 rounded font-black text-base uppercase tracking-widest transition-all hover:scale-105 active:scale-95"
                        style={{ background: 'linear-gradient(to bottom, rgba(160, 8, 8, 0.9), rgba(90, 4, 4, 0.9))', border: '2px solid rgba(200, 30, 30, 0.7)', color: '#F5F5DC', boxShadow: '0 4px 15px rgba(139, 0, 0, 0.4)', fontFamily: 'Cinzel, serif', letterSpacing: '0.15em' }}>
                        Fight
                      </button>

                      <button onClick={() => setBattleMenu('items')}
                        disabled={healthPots === 0 && staminaPots === 0}
                        className="py-4 rounded font-black text-base uppercase tracking-widest transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{ background: (healthPots > 0 || staminaPots > 0) ? 'linear-gradient(to bottom, rgba(180, 130, 10, 0.9), rgba(110, 80, 6, 0.9))' : 'rgba(30, 40, 55, 0.7)', border: `2px solid ${(healthPots > 0 || staminaPots > 0) ? 'rgba(212, 175, 55, 0.6)' : 'rgba(80,80,80,0.3)'}`, color: '#F5F5DC', boxShadow: (healthPots > 0 || staminaPots > 0) ? '0 4px 15px rgba(180, 130, 10, 0.3)' : 'none', fontFamily: 'Cinzel, serif', letterSpacing: '0.15em' }}>
                        Items
                      </button>

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

                    {isTauntAvailable && (
                      <button onClick={() => handlePlayerAction(taunt, 'Taunt')}
                        className="w-full py-3 rounded font-bold uppercase tracking-widest transition-all hover:scale-105 active:scale-95 animate-pulse"
                        style={{ background: 'linear-gradient(to right, rgba(180, 60, 0, 0.6), rgba(220, 90, 0, 0.6), rgba(180, 60, 0, 0.6))', border: '1px solid rgba(220, 90, 0, 0.5)', color: '#FB923C', fontSize: '1rem', letterSpacing: '0.25em' }}>
                        Taunt Enemy (Enrage)
                      </button>
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
                        const noSP = stamina < 17;
                        const unavail = locked || noSP || cd;
                        return (
                          <button onClick={() => handlePlayerAction(useCrushingBlow, 'Crushing Blow')} disabled={unavail}
                            className="py-4 px-3 rounded font-bold transition-all border-2 hover:scale-105 active:scale-95 disabled:cursor-not-allowed relative overflow-hidden"
                            title={locked ? `Unlocks at Level ${GAME_CONSTANTS.SKILL_UNLOCK_LEVELS.basicSkill}` : 'Powerful strike. Cannot be used twice in a row.'}
                            style={{ background: !unavail ? 'linear-gradient(to bottom, rgba(165, 42, 42, 0.85), rgba(100, 25, 25, 0.85))' : 'rgba(30, 40, 55, 0.6)', borderColor: !unavail ? 'rgba(165, 42, 42, 0.6)' : 'rgba(80,80,80,0.3)', color: '#F5F5DC', opacity: unavail ? 0.55 : 1 }}>
                            {cd && <div className="absolute inset-0 pointer-events-none" style={{ background: 'repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(0,0,0,0.25) 4px, rgba(0,0,0,0.25) 8px)' }} />}
                            <div className="text-base uppercase tracking-wide">Crushing Blow</div>
                            <div className="text-sm mt-0.5 opacity-70">
                              {locked ? <span className="text-red-400">🔒 Lvl {GAME_CONSTANTS.SKILL_UNLOCK_LEVELS.basicSkill}</span>
                                : cd ? <span className="text-yellow-300">⏳ On Cooldown</span>
                                : '17 SP'}
                            </div>
                          </button>
                        );
                      })()}

                      {/* Crusader: Smite */}
                      {hero?.class?.name === 'Crusader' && (() => {
                        const cd = onCooldown(crusaderSmiteCooldown);
                        const locked = level < GAME_CONSTANTS.SKILL_UNLOCK_LEVELS.basicSkill;
                        const unavail = locked || stamina < 15 || cd;
                        return (
                          <button onClick={() => handlePlayerAction(useSmite, 'Smite')} disabled={unavail}
                            className="py-4 px-3 rounded font-bold transition-all border-2 hover:scale-105 active:scale-95 disabled:cursor-not-allowed relative overflow-hidden"
                            title={locked ? `Unlocks at Level ${GAME_CONSTANTS.SKILL_UNLOCK_LEVELS.basicSkill}` : 'Holy strike that heals.'}
                            style={{ background: !unavail ? 'linear-gradient(to bottom, rgba(218, 165, 32, 0.85), rgba(160, 120, 10, 0.85))' : 'rgba(30, 40, 55, 0.6)', borderColor: !unavail ? 'rgba(218, 165, 32, 0.6)' : 'rgba(80,80,80,0.3)', color: '#F5F5DC', opacity: unavail ? 0.55 : 1 }}>
                            {cd && <div className="absolute inset-0 pointer-events-none" style={{ background: 'repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(0,0,0,0.25) 4px, rgba(0,0,0,0.25) 8px)' }} />}
                            <div className="text-base uppercase tracking-wide">Smite</div>
                            <div className="text-sm mt-0.5 opacity-70">
                              {locked ? <span className="text-red-400">🔒 Lvl {GAME_CONSTANTS.SKILL_UNLOCK_LEVELS.basicSkill}</span>
                                : cd ? <span className="text-yellow-300">⏳ On Cooldown</span>
                                : '15 SP'}
                            </div>
                          </button>
                        );
                      })()}

                      {/* Special Attack */}
                      {hero?.class && GAME_CONSTANTS.SPECIAL_ATTACKS[hero.class.name] && (() => {
                        const spec = GAME_CONSTANTS.SPECIAL_ATTACKS[hero.class.name];
                        const locked = level < GAME_CONSTANTS.SKILL_UNLOCK_LEVELS.special;
                        const cd = (hero.class.name === 'Wizard' && wizardTemporalCooldown) || (hero.class.name === 'Crusader' && crusaderJudgmentCooldown);
                        const unavail = locked || stamina < spec.cost || (spec.hpCost && hp <= spec.hpCost) || cd;
                        return (
                          <button onClick={() => handlePlayerAction(specialAttack, spec.name)} disabled={unavail}
                            className="py-4 px-3 rounded font-bold transition-all border-2 hover:scale-105 active:scale-95 disabled:cursor-not-allowed relative overflow-hidden"
                            title={locked ? `Unlocks at Level ${GAME_CONSTANTS.SKILL_UNLOCK_LEVELS.special}` : spec.effect}
                            style={{ background: !unavail ? 'linear-gradient(to bottom, rgba(13, 116, 142, 0.85), rgba(8, 77, 94, 0.85))' : 'rgba(30, 40, 55, 0.6)', borderColor: !unavail ? 'rgba(13, 116, 142, 0.6)' : 'rgba(80,80,80,0.3)', color: '#F5F5DC', opacity: unavail ? 0.55 : 1 }}>
                            {cd && <div className="absolute inset-0 pointer-events-none" style={{ background: 'repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(0,0,0,0.25) 4px, rgba(0,0,0,0.25) 8px)' }} />}
                            <div className="text-base uppercase tracking-wide">{spec.name}</div>
                            <div className="text-sm mt-0.5 opacity-70">
                              {locked ? <span className="text-red-400">🔒 Lvl {GAME_CONSTANTS.SKILL_UNLOCK_LEVELS.special}</span>
                                : cd ? <span className="text-yellow-300">⏳ On Cooldown</span>
                                : <>{spec.cost} SP{spec.hpCost ? ` · ${spec.hpCost + (recklessStacks * 10)} HP` : ''}</>}
                            </div>
                          </button>
                        );
                      })()}

                      {/* Tactical Skill */}
                      {hero?.class && GAME_CONSTANTS.TACTICAL_SKILLS[hero.class.name] && (() => {
                        const tac = GAME_CONSTANTS.TACTICAL_SKILLS[hero.class.name];
                        const locked = level < GAME_CONSTANTS.SKILL_UNLOCK_LEVELS.tactical;
                        const cd = (hero.class.name === 'Knight' && knightRallyingRoarCooldown) ||
                          (hero.class.name === 'Wizard' && wizardEtherealBarrierCooldown) ||
                          (hero.class.name === 'Assassin' && assassinMarkForDeathCooldown) ||
                          (hero.class.name === 'Crusader' && crusaderBastionOfFaithCooldown);
                        const unavail = locked || stamina < tac.cost || cd;
                        return (
                          <button onClick={() => handlePlayerAction(useTacticalSkill, tac.name)} disabled={unavail}
                            className="py-4 px-3 rounded font-bold transition-all border-2 hover:scale-105 active:scale-95 disabled:cursor-not-allowed relative overflow-hidden"
                            title={locked ? `Unlocks at Level ${GAME_CONSTANTS.SKILL_UNLOCK_LEVELS.tactical}` : tac.effect}
                            style={{ background: !unavail ? 'linear-gradient(to bottom, rgba(184, 134, 11, 0.85), rgba(120, 87, 7, 0.85))' : 'rgba(30, 40, 55, 0.6)', borderColor: !unavail ? 'rgba(184, 134, 11, 0.6)' : 'rgba(80,80,80,0.3)', color: '#F5F5DC', opacity: unavail ? 0.55 : 1 }}>
                            {cd && <div className="absolute inset-0 pointer-events-none" style={{ background: 'repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(0,0,0,0.25) 4px, rgba(0,0,0,0.25) 8px)' }} />}
                            <div className="text-base uppercase tracking-wide">{tac.name}</div>
                            <div className="text-sm mt-0.5 opacity-70">
                              {locked ? <span className="text-red-400">🔒 Lvl {GAME_CONSTANTS.SKILL_UNLOCK_LEVELS.tactical}</span>
                                : cd ? <span className="text-yellow-300">⏳ On Cooldown</span>
                                : <>{tac.cost} SP</>}
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
