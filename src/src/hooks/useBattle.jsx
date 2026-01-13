// src/hooks/useBattle.jsx
// Battle hook extracted from the main game.
// Responsibilities:
// - Own boss state and status effects (HP, debuffs, marked/stun/poison, mini/final)
// - Schedule boss counterattacks and poison ticks with proper cleanup
// - Provide actions: spawnMiniBoss, spawnFinalBoss, attack, specialAttack, flee, resetBattle
// - Report events to parent via callbacks (onPlayerDamaged, onVictory, onDefeat, onLog)
//
// The hook intentionally does NOT mutate player state directly — it reports events so the parent
// (App) can apply HP/XP/loot/persistence logic.

import { useCallback, useEffect, useRef, useState } from 'react';

const DEFAULTS = {
  MINI_BOSS_BASE: 60,
  MINI_BOSS_DAY_SCALING: 30,
  FINAL_BOSS_BASE: 200,
  FINAL_BOSS_DAY_SCALING: 40,
  BOSS_ATTACK_BASE: 18,
  BOSS_ATTACK_DAY_SCALING: 4.5,
  BOSS_ATTACK_DELAY: 1000,
  XP_REWARDS: { miniBoss: 50, finalBoss: 100 }
};

export default function useBattle({
  currentDay = 1,
  getBaseAttack = () => 0,
  getWeapon = () => 0,
  getBaseDefense = () => 0,
  getArmor = () => 0,
  getMaxHp = () => 100,
  heroClassName = null,
  onPlayerDamaged = () => {},
  onVictory = () => {},
  onDefeat = () => {},
  onLog = () => {},
  makeBossName = () => 'Unnamed'
} = {}) {
  // Boss state (owned by hook)
  const [bossHp, setBossHp] = useState(0);
  const [bossMax, setBossMax] = useState(0);
  const [bossName, setBossName] = useState('');
  const [battling, setBattling] = useState(false);
  const [isFinalBoss, setIsFinalBoss] = useState(false);
  const [miniBossCount, setMiniBossCount] = useState(0);
  const [canFlee, setCanFlee] = useState(false);

  // Debuffs / status
  const [bossDebuffs, setBossDebuffs] = useState({
    poisonTurns: 0,
    poisonDamage: 0,
    poisonedVulnerability: 0,
    marked: false,
    stunned: false
  });
  const [recklessStacks, setRecklessStacks] = useState(0);

  // Refs to most recent values (avoid stale closure issues in timers)
  const bossHpRef = useRef(bossHp);
  const battlingRef = useRef(battling);
  const bossDebuffsRef = useRef(bossDebuffs);
  const timersRef = useRef(new Set());

  useEffect(() => { bossHpRef.current = bossHp; }, [bossHp]);
  useEffect(() => { battlingRef.current = battling; }, [battling]);
  useEffect(() => { bossDebuffsRef.current = bossDebuffs; }, [bossDebuffs]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      timersRef.current.forEach(t => clearTimeout(t));
      timersRef.current.clear();
    };
  }, []);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(t => clearTimeout(t));
    timersRef.current.clear();
  }, []);

  const schedule = useCallback((fn, delay = 0) => {
    const t = setTimeout(() => {
      try { fn(); } finally { timersRef.current.delete(t); }
    }, delay);
    timersRef.current.add(t);
    return t;
  }, []);

  // Spawn a boss (internal helper)
  const spawn = useCallback((hpValue, finalFlag = false, allowFlee = true) => {
    clearTimers();
    setBossHp(hpValue);
    setBossMax(hpValue);
    const name = makeBossName();
    setBossName(name);
    setBattling(true);
    setIsFinalBoss(finalFlag);
    setCanFlee(allowFlee && !finalFlag);
    setBossDebuffs({
      poisonTurns: 0,
      poisonDamage: 0,
      poisonedVulnerability: 0,
      marked: false,
      stunned: false
    });
    if (!finalFlag) setMiniBossCount(c => c + 1);
    onLog(`⚔️ ${finalFlag ? 'FINAL BOSS' : 'AMBUSH'}! ${name} appears!`);
  }, [clearTimers, makeBossName, onLog]);

  // Public spawns
  const spawnMiniBoss = useCallback((force = false) => {
    const bossNumber = miniBossCount + 1;
    const baseHp = DEFAULTS.MINI_BOSS_BASE + ((currentDay - 1) * DEFAULTS.MINI_BOSS_DAY_SCALING);
    const scaledHp = Math.floor(baseHp * (1 + bossNumber * 0.2));
    spawn(scaledHp, false, true);
    if (force) {
      // parent may refill stamina on force — parent handles that
    }
  }, [currentDay, miniBossCount, spawn]);

  const spawnFinalBoss = useCallback(() => {
    const baseHp = DEFAULTS.FINAL_BOSS_BASE + ((currentDay - 1) * DEFAULTS.FINAL_BOSS_DAY_SCALING);
    spawn(baseHp, true, false);
  }, [currentDay, spawn]);

  // Boss counter attack + poison tick
  const bossCounterAttack = useCallback(() => {
    if (!battlingRef.current) return;

    const rawBossAtk = Math.round(DEFAULTS.BOSS_ATTACK_BASE + ((currentDay - 1) * DEFAULTS.BOSS_ATTACK_DAY_SCALING));
    const playerDefense = getBaseDefense() + getArmor();
    const bossDamage = Math.max(1, rawBossAtk - playerDefense);

    onPlayerDamaged(bossDamage);
    onLog(`💥 Boss strikes! -${bossDamage} HP`);

    // poison tick handling
    setBossDebuffs(prev => {
      if (prev.poisonTurns > 0) {
        const poisonDmg = prev.poisonDamage;
        setBossHp(h => {
          const newHp = Math.max(0, h - poisonDmg);
          if (newHp > 0) {
            onLog(`☠️ Poison deals ${poisonDmg} damage! (${prev.poisonTurns - 1} turns left)`);
          }
          return newHp;
        });
        return {
          ...prev,
          poisonTurns: prev.poisonTurns - 1,
          poisonedVulnerability: prev.poisonTurns - 1 > 0 ? 0.15 : 0
        };
      }
      return prev;
    });
  }, [currentDay, getBaseDefense, getArmor, onPlayerDamaged, onLog]);

  // Check for boss death and call onVictory
  const checkBossDeathAndResolve = useCallback((maybeDelay = 0) => {
    schedule(() => {
      if (bossHpRef.current <= 0) {
        const xpGain = isFinalBoss ? DEFAULTS.XP_REWARDS.finalBoss : DEFAULTS.XP_REWARDS.miniBoss;
        clearTimers();
        setBattling(false);
        onVictory({ isFinal: isFinalBoss, xpGain, loot: null });
        onLog(`🎊 VICTORY! +${xpGain} XP`);
      }
    }, maybeDelay);
  }, [isFinalBoss, onVictory, onLog, schedule, clearTimers]);

  // Player attack
  const attack = useCallback(() => {
    if (!battlingRef.current || bossHpRef.current <= 0) return;

    const damageBase = getBaseAttack() + getWeapon() + Math.floor(Math.random() * 10);
    let finalDamage = damageBase;

    setBossDebuffs(prev => {
      const next = { ...prev };
      if (prev.marked) {
        const markBonus = Math.floor(damageBase * 0.25);
        finalDamage += markBonus;
        next.marked = false;
        onLog(`🎯 Weak point exploited! +${markBonus} damage`);
      }
      if (prev.poisonTurns > 0 && prev.poisonedVulnerability) {
        const pv = Math.floor(finalDamage * prev.poisonedVulnerability);
        finalDamage += pv;
        onLog(`☠️ +${pv} from poison vulnerability`);
      }
      return next;
    });

    setBossHp(h => {
      const newHp = Math.max(0, h - finalDamage);
      onLog(`⚔️ Dealt ${finalDamage} damage!`);
      return newHp;
    });

    checkBossDeathAndResolve(0);

    // schedule counterattack unless boss stunned
    schedule(() => {
      const deb = bossDebuffsRef.current;
      if (deb && deb.stunned) {
        onLog('✨ Boss is stunned and does not counterattack!');
        setBossDebuffs(prev => ({ ...prev, stunned: false }));
        return;
      }
      bossCounterAttack();
    }, DEFAULTS.BOSS_ATTACK_DELAY);
  }, [getBaseAttack, getWeapon, checkBossDeathAndResolve, schedule, bossCounterAttack, onLog]);

  // Player special attack (class-dependent behaviors)
  const specialAttack = useCallback(() => {
    if (!battlingRef.current || bossHpRef.current <= 0) return;

    let multiplier = 1.5;
    let skipCounter = false;
    let applyPoison = null;
    let healAmt = 0;

    if (heroClassName === 'Warrior') {
      multiplier = 3.0;
    } else if (heroClassName === 'Mage') {
      multiplier = 2.0;
      skipCounter = true;
      setBossDebuffs(prev => ({ ...prev, stunned: true }));
    } else if (heroClassName === 'Rogue') {
      multiplier = 1.3;
      applyPoison = { turns: 5, damage: 5, vulnerability: 0.15 };
    } else if (heroClassName === 'Paladin') {
      multiplier = 1.5;
      healAmt = 20;
    } else if (heroClassName === 'Ranger') {
      multiplier = 1.5;
      setBossDebuffs(prev => ({ ...prev, marked: true }));
      onLog('🎯 Target marked! Next attack +25% damage!');
    }

    const damage = Math.floor((getBaseAttack() + getWeapon() + Math.floor(Math.random() * 10)) * multiplier);

    if (applyPoison) {
      setBossDebuffs(prev => ({ ...prev, poisonTurns: applyPoison.turns, poisonDamage: applyPoison.damage, poisonedVulnerability: applyPoison.vulnerability }));
      onLog('☠️ Boss poisoned! Takes extra damage over time.');
    }

    if (healAmt > 0) {
      onLog(`✨ You heal ${healAmt} HP (Paladin effect).`);
      // parent should actually heal the player if desired
    }

    setBossHp(h => {
      const newHp = Math.max(0, h - damage);
      onLog(`⚡ Special Attack: dealt ${damage} damage!`);
      return newHp;
    });

    checkBossDeathAndResolve(0);

    if (!skipCounter) {
      schedule(() => { bossCounterAttack(); }, DEFAULTS.BOSS_ATTACK_DELAY);
    } else {
      onLog('✨ Boss stunned — no counterattack this turn.');
    }
  }, [heroClassName, getBaseAttack, getWeapon, schedule, bossCounterAttack, checkBossDeathAndResolve, onLog]);

  // Flee: apply HP penalty to player (parent applies actual deduction)
  const flee = useCallback(() => {
    if (!battlingRef.current || !canFlee) return;
    clearTimers();
    setBattling(false);
    setBossHp(0);
    const fleePenalty = Math.floor(getMaxHp() * 0.1);
    onPlayerDamaged(fleePenalty);
    onLog(`🏃 You fled! Lost ${fleePenalty} HP.`);
  }, [canFlee, clearTimers, getMaxHp, onLog, onPlayerDamaged]);

  const resetBattle = useCallback(() => {
    clearTimers();
    setBossHp(0);
    setBossMax(0);
    setBossName('');
    setBattling(false);
    setIsFinalBoss(false);
    setBossDebuffs({ poisonTurns: 0, poisonDamage: 0, poisonedVulnerability: 0, marked: false, stunned: false });
    setCanFlee(false);
  }, [clearTimers]);

  const bossState = {
    bossHp,
    bossMax,
    bossName,
    battling,
    isFinalBoss,
    bossDebuffs,
    canFlee,
    miniBossCount,
    recklessStacks
  };

  return {
    bossState,
    spawnMiniBoss,
    spawnFinalBoss,
    attack,
    specialAttack,
    flee,
    resetBattle,
    setBossDebuffs // exposed if parent needs to directly set debuffs (use sparingly)
  };
}
