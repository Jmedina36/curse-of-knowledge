// src/App.jsx
// Full game component (refactored) that uses useBattle hook for all battle logic.
// This file reuses and preserves your game systems: tasks, persistence, timers, loot, skips, XP,
// and delegates battle responsibilities to the hook via callbacks.

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Zap } from 'lucide-react';
import useBattle from './hooks/useBattle';

// Game constants (kept consistent with your original)
const GAME_CONSTANTS = {
  LATE_START_PENALTY: 15,
  LATE_START_HOUR: 8,
  MAX_HP: 100,
  MAX_STAMINA: 100,
  BASE_ATTACK: 10,
  BASE_DEFENSE: 5,

  PLAYER_HP_PER_DAY: 8,
  PLAYER_SP_PER_DAY: 8,
  PLAYER_ATK_PER_DAY: 2,
  PLAYER_DEF_PER_DAY: 1,

  HEALTH_POTION_HEAL: 30,
  STAMINA_POTION_RESTORE: 50,
  STAMINA_PER_TASK: 20,
  CLEANSE_POTION_COST: 100,

  LOOT_RATES: {
    HEALTH_POTION: 0.20,
    STAMINA_POTION: 0.50,
    WEAPON: 0.70,
    ARMOR: 0.90
  },

  XP_REWARDS: {
    easy: 10,
    medium: 25,
    hard: 50,
    miniBoss: 50,
    finalBoss: 100
  },

  XP_PER_LEVEL: 100,
  XP_MULTIPLIERS: [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0],

  DAY_NAMES: [
    { name: 'Moonday', subtitle: 'Day of Beginnings', theme: 'A new cycle begins...' },
    { name: 'Tideday', subtitle: 'Day of Flow', theme: 'The curse stirs...' },
    { name: 'Fireday', subtitle: 'Day of Trials', theme: 'The pressure mounts...' },
    { name: 'Thornday', subtitle: 'Day of Struggle', theme: 'Darkness deepens...' },
    { name: 'Voidday', subtitle: 'Day of Despair', theme: 'The abyss beckons...' },
    { name: 'Doomday', subtitle: 'Day of Reckoning', theme: 'Almost there... or almost consumed?' },
    { name: 'Endday', subtitle: 'Day of Liberation', theme: 'Today you break free or die trying.' }
  ],

  MINI_BOSS_BASE: 60,
  MINI_BOSS_DAY_SCALING: 30,
  MINI_BOSS_ATK_BASE: 15,
  MINI_BOSS_ATK_SCALING: 3,

  FINAL_BOSS_BASE: 200,
  FINAL_BOSS_DAY_SCALING: 40,

  BOSS_ATTACK_BASE: 18,
  BOSS_ATTACK_DAY_SCALING: 4.5,
  BOSS_ATTACK_DELAY: 1000,

  LOG_MAX_ENTRIES: 8,

  SKIP_PENALTIES: [
    { hp: 20, message: '💀 The curse festers... -20 HP', levelLoss: 0, equipmentDebuff: 0.25, cursed: false },
    { hp: 30, message: '💀 The curse tightens its grip... -30 HP, -1 Level, Equipment weakened', levelLoss: 1, equipmentDebuff: 0.25, cursed: false },
    { hp: 50, message: '💀 YOU ARE CURSED. The abyss consumes you... -50 HP', levelLoss: 0, equipmentDebuff: 0, cursed: true },
    { hp: 0, message: '☠️ YOU DIED. The curse has claimed your soul.', levelLoss: 0, equipmentDebuff: 0, death: true }
  ],

  SKIP_REDEMPTION_DAYS: 3,
  MAX_SKIPS_BEFORE_DEATH: 4,
  TOTAL_DAYS: 7,

  PRIORITY_XP_MULTIPLIERS: {
    urgent: 1.5,
    important: 1.25,
    routine: 1.0
  },

  EARLY_BIRD_BONUS: 20,
  DEEP_WORK_BONUS: 30,
  PERFECT_DAY_BONUS: 50,

  FLEE_HP_COST_PERCENT: 0.1,

  SPECIAL_ATTACKS: {
    Warrior: { name: 'Reckless Strike', cost: 30, hpCost: 15, damageMultiplier: 3.0, effect: 'Massive damage but costs HP' },
    Mage: { name: 'Arcane Blast', cost: 40, damageMultiplier: 2.0, effect: 'Boss stunned - no counter-attack' },
    Rogue: { name: "Venom's Ruin", cost: 30, damageMultiplier: 1.3, effect: 'Boss poisoned +15% vulnerability' },
    Paladin: { name: 'Divine Smite', cost: 30, damageMultiplier: 1.5, effect: 'Heals you for 20 HP' },
    Ranger: { name: 'Marked Shot', cost: 35, damageMultiplier: 1.5, effect: 'Next attack +25% damage' }
  }
};

const STORAGE_KEY = 'fantasyStudyQuest';

const FantasyStudyQuest = () => {
  // Core state
  const [activeTab, setActiveTab] = useState('quest');
  const [currentDay, setCurrentDay] = useState(1);
  const [hasStarted, setHasStarted] = useState(false);
  const [hero, setHero] = useState(null);

  // Character stats
  const [hp, setHp] = useState(GAME_CONSTANTS.MAX_HP);
  const [stamina, setStamina] = useState(GAME_CONSTANTS.MAX_STAMINA);
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);

  // Equipment - now tracked with base values
  const [baseWeapon, setBaseWeapon] = useState(0);
  const [baseArmor, setBaseArmor] = useState(0);
  const [weaponDebuff, setWeaponDebuff] = useState(0);
  const [armorDebuff, setArmorDebuff] = useState(0);

  // Inventory
  const [healthPots, setHealthPots] = useState(0);
  const [staminaPots, setStaminaPots] = useState(0);
  const [cleansePots, setCleansePots] = useState(0);

  // Tasks
  const [tasks, setTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', time: 30, priority: 'important' });
  const [activeTask, setActiveTask] = useState(null);
  const [timer, setTimer] = useState(0);
  const [running, setRunning] = useState(false);

  // Debug mode
  const [showDebug, setShowDebug] = useState(false);

  // History
  const [log, setLog] = useState([]);
  const [graveyard, setGraveyard] = useState([]);
  const [heroes, setHeroes] = useState([]);

  // Skip day system
  const [skipCount, setSkipCount] = useState(0);
  const [consecutiveDays, setConsecutiveDays] = useState(0);
  const [lastPlayedDate, setLastPlayedDate] = useState(null);
  const [isCursed, setIsCursed] = useState(false);

  // Productivity tracking
  const [studyStats, setStudyStats] = useState({
    totalMinutesToday: 0,
    totalMinutesWeek: 0,
    sessionsToday: 0,
    longestStreak: 0,
    currentStreak: 0,
    tasksCompletedToday: 0,
    deepWorkSessions: 0,
    earlyBirdDays: 0,
    perfectDays: 0,
    weeklyHistory: []
  });

  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [taskPauseCount, setTaskPauseCount] = useState(0);

  // Audio for timer notification
  const audioContextRef = useRef(null);

  const titles = ['Novice', 'Seeker', 'Wanderer', 'Survivor', 'Warrior', 'Champion', 'Legend'];

  const classes = [
    { name: 'Warrior', color: 'red', emblem: '⚔︎' },
    { name: 'Mage', color: 'purple', emblem: '✦' },
    { name: 'Rogue', color: 'green', emblem: '†' },
    { name: 'Paladin', color: 'yellow', emblem: '✙' },
    { name: 'Ranger', color: 'amber', emblem: '➶' }
  ];

  const addLog = useCallback((msg) => {
    setLog(prev => [...prev, msg].slice(-200));
  }, []);

  // Helper to play notification sound
  const playNotification = useCallback(() => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.value = 800;
      gainNode.gain.value = 0.3;

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.2);

      setTimeout(() => {
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.frequency.value = 600;
        gain2.gain.value = 0.3;
        osc2.start(ctx.currentTime);
        osc2.stop(ctx.currentTime + 0.2);
      }, 100);
    } catch (e) {
      console.error('Audio notification failed:', e);
    }
  }, []);

  // Close audio context on unmount to avoid leaking resources
  useEffect(() => {
    return () => {
      if (audioContextRef.current && typeof audioContextRef.current.close === 'function') {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, []);

  const makeName = useCallback(() => {
    const first = {
      male: ['Azrael', 'Godfrey', 'Cyrus', 'Aldric', 'Roderick', 'Lancelot'],
      female: ['Elizabeth', 'Seraphina', 'Minerva', 'Aria', 'Eve', 'Maria', 'Michelle']
    };
    const last = ['Ironheart', 'Stormborn', 'Lightbringer', 'Shadowend', 'Dawnseeker'];
    const gender = Math.random() > 0.5 ? 'male' : 'female';
    const heroClass = classes[Math.floor(Math.random() * classes.length)];
    return {
      name: `${first[gender][Math.floor(Math.random() * first[gender].length)]} ${last[Math.floor(Math.random() * last.length)]}`,
      gender,
      title: titles[0],
      day: 1,
      survived: 0,
      class: heroClass
    };
  }, []);

  const makeBossName = useCallback(() => {
    const first = ['Malakar', 'Zarathos', 'Lilith', 'Nyxen', 'Azazel', 'Alastor', 'Barbatos', 'Furcas', 'Moloch', 'Xaphan'];
    const last = ['the Kind', 'the Blind', 'Deathbringer', 'the Wretched', 'the Fallen Angel', 'Rotten', 'Void Walker', 'the Forgotten', 'the Holy', 'Dread Lord', 'the Forsaken', 'the Tormentor'];
    return `${first[Math.floor(Math.random() * first.length)]} ${last[Math.floor(Math.random() * last.length)]}`;
  }, []);

  // Centralized stat calculation
  const getMaxHp = useCallback(() => {
    return GAME_CONSTANTS.MAX_HP + (currentDay - 1) * GAME_CONSTANTS.PLAYER_HP_PER_DAY + (level - 1) * 5;
  }, [currentDay, level]);

  const getMaxStamina = useCallback(() => {
    return GAME_CONSTANTS.MAX_STAMINA + (currentDay - 1) * GAME_CONSTANTS.PLAYER_SP_PER_DAY;
  }, [currentDay]);

  const getBaseAttack = useCallback(() => {
    return GAME_CONSTANTS.BASE_ATTACK + (currentDay - 1) * GAME_CONSTANTS.PLAYER_ATK_PER_DAY + (level - 1) * 1;
  }, [currentDay, level]);

  const getBaseDefense = useCallback(() => {
    return GAME_CONSTANTS.BASE_DEFENSE + (currentDay - 1) * GAME_CONSTANTS.PLAYER_DEF_PER_DAY + (level - 1) * 1;
  }, [currentDay, level]);

  const getWeapon = useCallback(() => Math.floor(baseWeapon * (1 - weaponDebuff)), [baseWeapon, weaponDebuff]);
  const getArmor = useCallback(() => Math.floor(baseArmor * (1 - armorDebuff)), [baseArmor, armorDebuff]);

  // calculateXP (safe)
  const calculateXP = useCallback((difficulty, priority = 'important') => {
    const baseXp = GAME_CONSTANTS.XP_REWARDS[difficulty] || 0;
    const idx = Math.max(0, Math.min(currentDay - 1, GAME_CONSTANTS.XP_MULTIPLIERS.length - 1));
    let multiplier = GAME_CONSTANTS.XP_MULTIPLIERS[idx] || 1;
    multiplier *= GAME_CONSTANTS.PRIORITY_XP_MULTIPLIERS[priority] || 1;
    if (isCursed) multiplier *= 0.5;
    return Math.floor(baseXp * multiplier);
  }, [currentDay, isCursed]);

  // Load game state (safe: don't overwrite saved hero)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        const loadedHero = data.hero || null;

        if (loadedHero) setHero(loadedHero);
        if (data.currentDay) setCurrentDay(data.currentDay);
        if (data.hp !== undefined) setHp(data.hp);
        if (data.stamina !== undefined) setStamina(data.stamina);
        if (data.xp !== undefined) setXp(data.xp);
        if (data.level !== undefined) setLevel(data.level);
        if (data.healthPots !== undefined) setHealthPots(data.healthPots);
        if (data.staminaPots !== undefined) setStaminaPots(data.staminaPots);
        if (data.cleansePots !== undefined) setCleansePots(data.cleansePots);

        if (data.baseWeapon !== undefined) {
          setBaseWeapon(data.baseWeapon);
          setWeaponDebuff(data.weaponDebuff || 0);
        } else if (data.weapon !== undefined) {
          setBaseWeapon(data.weapon);
          setWeaponDebuff(0);
        }

        if (data.baseArmor !== undefined) {
          setBaseArmor(data.baseArmor);
          setArmorDebuff(data.armorDebuff || 0);
        } else if (data.armor !== undefined) {
          setBaseArmor(data.armor);
          setArmorDebuff(0);
        }

        if (data.tasks) setTasks(data.tasks);
        if (data.graveyard) setGraveyard(data.graveyard);
        if (data.heroes) setHeroes(data.heroes);
        if (data.hasStarted !== undefined) setHasStarted(data.hasStarted);
        if (data.skipCount !== undefined) setSkipCount(data.skipCount);
        if (data.consecutiveDays !== undefined) setConsecutiveDays(data.consecutiveDays);
        if (data.lastPlayedDate) setLastPlayedDate(data.lastPlayedDate);
        if (data.isCursed !== undefined) setIsCursed(data.isCursed);
        if (data.studyStats) setStudyStats(data.studyStats);

        if (!loadedHero) setHero(makeName());
        return;
      }
    } catch (e) {
      console.error('Failed to load save:', e);
      addLog('⚠️ Failed to load previous game. Starting fresh.');
    }
    setHero(makeName());
  }, [makeName, addLog]);

  // Save game state
  useEffect(() => {
    if (!hero) return;
    try {
      const saveData = {
        hero,
        currentDay,
        hp,
        stamina,
        xp,
        level,
        healthPots,
        staminaPots,
        cleansePots,
        baseWeapon,
        baseArmor,
        weaponDebuff,
        armorDebuff,
        tasks,
        graveyard,
        heroes,
        hasStarted,
        skipCount,
        consecutiveDays,
        lastPlayedDate,
        isCursed,
        studyStats
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saveData));
    } catch (e) {
      console.error('Failed to save game:', e);
      if (e && e.name === 'QuotaExceededError') {
        addLog('⚠️ Storage full! Game may not save.');
      }
    }
  }, [hero, currentDay, hp, stamina, xp, level, healthPots, staminaPots, cleansePots, baseWeapon, baseArmor, weaponDebuff, armorDebuff, tasks, graveyard, heroes, hasStarted, skipCount, consecutiveDays, lastPlayedDate, isCursed, studyStats, addLog]);

  // Timer effect
  useEffect(() => {
    let int;
    if (running && timer > 0) {
      int = setInterval(() => {
        setTimer(t => {
          if (t <= 1) {
            setRunning(false);
            if (activeTask) {
              const task = tasks.find(task => task.id === activeTask);
              playNotification();
              addLog(`⏰ Time's up for: ${task?.title || 'task'}! Complete it when ready.`);
            }
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(int);
  }, [running, timer, activeTask, tasks, addLog, playNotification]);

  // Level up effect
  useEffect(() => {
    const newLevel = Math.floor(xp / GAME_CONSTANTS.XP_PER_LEVEL) + 1;
    if (newLevel > level) {
      setLevel(newLevel);
      addLog(`🎉 LEVEL UP! Now level ${newLevel}`);
      setHp(h => Math.min(getMaxHp(), h + 20));
    }
  }, [xp, level, addLog, getMaxHp]);

  // applySkipPenalty: accept explicit index to avoid reliance on async skipCount
  const applySkipPenalty = useCallback((explicitIndex = null) => {
    const newIndex = explicitIndex !== null ? explicitIndex : skipCount + 1;
    setSkipCount(s => Math.min(GAME_CONSTANTS.MAX_SKIPS_BEFORE_DEATH, s + 1));
    setConsecutiveDays(0);

    const penaltyIndex = Math.min(newIndex - 1, GAME_CONSTANTS.SKIP_PENALTIES.length - 1);
    const penalty = GAME_CONSTANTS.SKIP_PENALTIES[penaltyIndex];

    addLog(penalty.message);

    setHp(h => {
      const newHp = Math.max(0, h - penalty.hp);
      if (newHp <= 0 || penalty.death) {
        setTimeout(() => die(), 1000);
      }
      return newHp;
    });

    if (penalty.levelLoss > 0) {
      setLevel(l => Math.max(1, l - penalty.levelLoss));
      addLog(`⬇️ Lost ${penalty.levelLoss} level${penalty.levelLoss > 1 ? 's' : ''}!`);
    }

    if (penalty.equipmentDebuff > 0) {
      setWeaponDebuff(w => Math.min(0.75, w + penalty.equipmentDebuff));
      setArmorDebuff(a => Math.min(0.75, a + penalty.equipmentDebuff));
      addLog(`⚠️ Equipment weakened by ${penalty.equipmentDebuff * 100}%!`);
    }

    if (penalty.cursed) {
      setIsCursed(true);
      addLog('🌑 YOU ARE CURSED. XP gains halved until tomorrow.');
    }
  }, [skipCount, addLog]);

  // Skip day check (ISO date strings)
  useEffect(() => {
    if (!hero || !hasStarted) return;

    if (!lastPlayedDate) {
      const todayISO = new Date().toISOString().slice(0, 10);
      setLastPlayedDate(todayISO);
      return;
    }

    const lastDate = new Date(lastPlayedDate);
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    lastDate.setHours(0, 0, 0, 0);

    const daysDiff = Math.floor((currentDate - lastDate) / (1000 * 60 * 60 * 24));
    const completedTasksLastSession = tasks.filter(t => t.done).length;

    if (daysDiff > 0 && completedTasksLastSession === 0) {
      const possibleSkips = GAME_CONSTANTS.MAX_SKIPS_BEFORE_DEATH - skipCount;
      const times = Math.min(daysDiff, Math.max(0, possibleSkips));
      for (let i = 0; i < times; i++) {
        applySkipPenalty(skipCount + i + 1);
      }
    }

    const todayISO = new Date().toISOString().slice(0, 10);
    setLastPlayedDate(todayISO);
  }, [hero, lastPlayedDate, hasStarted, tasks, skipCount, applySkipPenalty]);

  const getDifficulty = (timeInMinutes) => {
    if (timeInMinutes <= 20) return 'easy';
    if (timeInMinutes <= 45) return 'medium';
    return 'hard';
  };

  const start = () => {
    const todayISO = new Date().toISOString().slice(0, 10);
    const currentHour = new Date().getHours();
    setLastPlayedDate(todayISO);

    if (lastPlayedDate && lastPlayedDate !== todayISO) {
      setStudyStats(prev => ({
        ...prev,
        weeklyHistory: [...prev.weeklyHistory, prev.totalMinutesToday].slice(-7),
        totalMinutesToday: 0,
        sessionsToday: 0,
        tasksCompletedToday: 0,
        deepWorkSessions: 0
      }));
    }

    if (isCursed) {
      setIsCursed(false);
      addLog('✨ The curse lifts... for now.');
    }

    let earlyBirdBonus = false;
    if (currentHour < GAME_CONSTANTS.LATE_START_HOUR) {
      setXp(x => x + GAME_CONSTANTS.EARLY_BIRD_BONUS);
      setStudyStats(prev => ({ ...prev, earlyBirdDays: prev.earlyBirdDays + 1 }));
      addLog(`🌅 Early Bird! +${GAME_CONSTANTS.EARLY_BIRD_BONUS} XP`);
      earlyBirdBonus = true;
    }

    if (currentHour >= GAME_CONSTANTS.LATE_START_HOUR && !earlyBirdBonus) {
      setHp(h => Math.max(0, h - GAME_CONSTANTS.LATE_START_PENALTY));
      addLog(`⚠️ Late start! -${GAME_CONSTANTS.LATE_START_PENALTY} HP`);
    } else if (!earlyBirdBonus) {
      addLog('✨ Day begins...');
    }

    setHasStarted(true);
  };

  // Task management
  const addTask = () => {
    if (newTask.title && newTask.time > 0) {
      const difficulty = getDifficulty(newTask.time);
      const title = newTask.title;
      setTasks(prev => [...prev, {
        ...newTask,
        difficulty,
        id: Date.now(),
        done: false,
        time: newTask.time,
        originalTime: newTask.time,
        priority: newTask.priority
      }]);
      setNewTask({ title: '', time: 30, priority: 'important' });
      setShowModal(false);
      addLog(`📜 New trial: ${title}`);
    }
  };

  const startTask = (id) => {
    const task = tasks.find(t => t.id === id);
    if (task && !task.done && !activeTask) {
      setActiveTask(id);
      setTimer(task.time * 60);
      setRunning(true);
      setSessionStartTime(Date.now());
      setTaskPauseCount(0);
      addLog(`⚔️ Starting: ${task.title}`);
    }
  };

  // useBattle hook integration
  const {
    bossState,
    spawnMiniBoss,
    spawnFinalBoss,
    attack: battleAttack,
    specialAttack: battleSpecialAttack,
    flee: battleFlee,
    resetBattle
  } = useBattle({
    currentDay,
    getBaseAttack,
    getWeapon,
    getBaseDefense,
    getArmor,
    getMaxHp,
    heroClassName: hero?.class?.name || null,
    onPlayerDamaged: useCallback((amount) => {
      // apply damage to player; if hp <= 0 trigger die()
      setHp(h => {
        const newHp = Math.max(0, h - amount);
        addLog(`💥 You took ${amount} damage! (${newHp}/${getMaxHp()})`);
        if (newHp <= 0) {
          setTimeout(() => {
            die();
          }, 250);
        }
        return newHp;
      });
    }, [addLog, getMaxHp]),
    onVictory: useCallback(({ isFinal, xpGain }) => {
      setXp(x => x + xpGain);
      addLog(`🎊 VICTORY! +${xpGain} XP`);
      if (!isFinal) {
        // loot roll (same rules as before)
        const lootRoll = Math.random();
        if (lootRoll < 0.25) {
          setHealthPots(h => h + 1);
          addLog('💎 Looted: Health Potion!');
        } else if (lootRoll < 0.60) {
          setStaminaPots(s => s + 1);
          addLog('💎 Looted: Stamina Potion!');
        } else if (lootRoll < 0.80) {
          const gain = 4 + Math.floor(currentDay / 3);
          setBaseWeapon(w => w + gain);
          addLog(`💎 Looted: Weapon Upgrade! +${gain}`);
        } else {
          const gain = 4 + Math.floor(currentDay / 3);
          setBaseArmor(a => a + gain);
          addLog(`💎 Looted: Armor Upgrade! +${gain}`);
        }
        // heal player after miniboss victory
        setHp(getMaxHp());
        addLog('✨ Fully healed!');
      } else {
        // final boss victory: add hero to hall and reset loop
        setHeroes(prev => [...prev, {
          ...hero,
          lvl: level,
          xp,
          title: titles[6],
          day: currentDay,
          skipCount
        }]);
        addLog('🏆 THE CURSE IS BROKEN! YOU ARE FREE!');
        // reset for a new run
        const newHero = makeName();
        setHero(newHero);
        setCurrentDay(1);
        setHp(GAME_CONSTANTS.MAX_HP);
        setStamina(GAME_CONSTANTS.MAX_STAMINA);
        setXp(0);
        setLevel(1);
        setBaseWeapon(0);
        setBaseArmor(0);
        setWeaponDebuff(0);
        setArmorDebuff(0);
        setTasks([]);
        setActiveTask(null);
        setTimer(0);
        setRunning(false);
        setHasStarted(false);
        setShowModal(false);
        setSkipCount(0);
        setConsecutiveDays(0);
        setLastPlayedDate(null);
        setIsCursed(false);
      }
    }, [addLog, currentDay, getMaxHp, hero, level, xp, skipCount, makeName]),
    onDefeat: useCallback(() => {
      addLog('💀 You have been defeated.');
      // minimal defeat flow - parent handles full die() behavior
      die();
    }, [addLog]),
    onLog: addLog,
    makeBossName
  });

  // When tasks are completed, we may want to spawn miniboss
  const spawnRandomMiniBoss = (force = false) => {
    if (force) {
      setStamina(getMaxStamina());
    }
    spawnMiniBoss(force);
  };

  // Complete task
  const complete = useCallback((id) => {
    const task = tasks.find(t => t.id === id);
    if (task && !task.done) {
      const sessionDuration = sessionStartTime ? Math.floor((Date.now() - sessionStartTime) / 1000 / 60) : task.time;
      const isDeepWork = sessionDuration >= 60 && taskPauseCount === 0;

      let xpGain = calculateXP(task.difficulty, task.priority);
      const bonusMessages = [];

      if (isDeepWork) {
        xpGain += GAME_CONSTANTS.DEEP_WORK_BONUS;
        bonusMessages.push(`🧠 Deep Work! +${GAME_CONSTANTS.DEEP_WORK_BONUS} XP`);
      }

      setXp(x => x + xpGain);

      setStudyStats(prev => ({
        ...prev,
        totalMinutesToday: prev.totalMinutesToday + sessionDuration,
        totalMinutesWeek: prev.totalMinutesWeek + sessionDuration,
        sessionsToday: prev.sessionsToday + 1,
        tasksCompletedToday: prev.tasksCompletedToday + 1,
        deepWorkSessions: isDeepWork ? prev.deepWorkSessions + 1 : prev.deepWorkSessions
      }));

      const completedCount = tasks.filter(t => t.done).length + 1;
      if (completedCount === 1) {
        const newConsecutive = consecutiveDays + 1;
        setConsecutiveDays(newConsecutive);

        if (newConsecutive >= GAME_CONSTANTS.SKIP_REDEMPTION_DAYS && skipCount > 0) {
          setSkipCount(s => Math.max(0, s - 1));
          setConsecutiveDays(0);
          addLog(`🙏 REDEMPTION! ${GAME_CONSTANTS.SKIP_REDEMPTION_DAYS} days of dedication. Skip forgiven.`);
        }
      }

      const roll = Math.random();
      if (roll < GAME_CONSTANTS.LOOT_RATES.HEALTH_POTION) {
        setHealthPots(h => h + 1);
        addLog('💊 Found Health Potion!');
      } else if (roll < GAME_CONSTANTS.LOOT_RATES.STAMINA_POTION) {
        setStaminaPots(s => s + 1);
        addLog('⚡ Found Stamina Potion!');
      } else if (roll < GAME_CONSTANTS.LOOT_RATES.WEAPON) {
        const gain = 1 + Math.floor(currentDay / 2);
        setBaseWeapon(w => w + gain);
        addLog(`⚔️ Weapon upgraded! +${gain}`);
      } else if (roll < GAME_CONSTANTS.LOOT_RATES.ARMOR) {
        const gain = 1 + Math.floor(currentDay / 2);
        setBaseArmor(a => a + gain);
        addLog(`🛡️ Armor upgraded! +${gain}`);
      }

      setTasks(prev => prev.map(t => t.id === id ? { ...t, done: true } : t));
      setActiveTask(null);
      setRunning(false);
      setSessionStartTime(null);

      setStamina(s => Math.min(getMaxStamina(), s + GAME_CONSTANTS.STAMINA_PER_TASK));

      let completionMsg = `✅ Completed: ${task.title} (+${xpGain} XP`;
      if (task.priority === 'urgent') completionMsg += ' • URGENT';
      if (task.priority === 'important') completionMsg += ' • IMPORTANT';
      if (isCursed) completionMsg += ' • CURSED';
      completionMsg += `)`;

      addLog(completionMsg);
      bonusMessages.forEach(msg => addLog(msg));
      addLog(`⏱️ Studied: ${sessionDuration} minutes`);

      const spawnRoll = Math.random();
      if (spawnRoll < 0.25 && hp > getMaxHp() * 0.5) {
        setTimeout(() => spawnRandomMiniBoss(), 1000);
      }
    }
  }, [tasks, sessionStartTime, taskPauseCount, calculateXP, currentDay, addLog, isCursed, hp, getMaxStamina]);

  // Actions bridging UI to hook
  const attack = () => {
    battleAttack();
  };

  const specialAttack = () => {
    // enforce stamina/costs here if desired
    const cls = hero?.class?.name;
    const special = GAME_CONSTANTS.SPECIAL_ATTACKS[cls];
    if (special && stamina < special.cost) {
      addLog(`⚠️ Need ${special.cost} stamina to use ${special.name}.`);
      return;
    }
    if (special) {
      setStamina(s => Math.max(0, s - special.cost));
      if (special.hpCost) {
        setHp(h => Math.max(1, h - special.hpCost));
      }
    }
    battleSpecialAttack();
  };

  const flee = () => battleFlee();

  const useHealth = () => {
    if (healthPots > 0 && hp < getMaxHp()) {
      setHealthPots(h => h - 1);
      setHp(h => Math.min(getMaxHp(), h + GAME_CONSTANTS.HEALTH_POTION_HEAL));
      addLog(`💊 Used Health Potion! +${GAME_CONSTANTS.HEALTH_POTION_HEAL} HP`);
    }
  };

  const useStamina = () => {
    if (staminaPots > 0 && stamina < getMaxStamina()) {
      setStaminaPots(s => s - 1);
      setStamina(s => Math.min(getMaxStamina(), s + GAME_CONSTANTS.STAMINA_POTION_RESTORE));
      addLog(`⚡ Used Stamina Potion! +${GAME_CONSTANTS.STAMINA_POTION_RESTORE} Stamina`);
    }
  };

  const useCleanse = () => {
    if (cleansePots > 0 && isCursed) {
      setCleansePots(c => c - 1);
      setIsCursed(false);
      addLog('✨ Used Cleanse Potion! Curse removed!');
    }
  };

  const craftCleanse = () => {
    if (xp >= GAME_CONSTANTS.CLEANSE_POTION_COST) {
      setXp(x => x - GAME_CONSTANTS.CLEANSE_POTION_COST);
      setCleansePots(c => c + 1);
      addLog(`🧪 Crafted Cleanse Potion! -${GAME_CONSTANTS.CLEANSE_POTION_COST} XP`);
    }
  };

  // death handler
  const die = () => {
    const completedTasks = tasks.filter(t => t.done).length;
    const totalTasks = tasks.length;

    // ensure any battle timers are cleared
    resetBattle();

    setBattlingFallbackFalse(); // helper below to ensure UI shows non-battle state (compat)
    setGraveyard(prev => [...prev, {
      ...hero,
      day: currentDay,
      lvl: level,
      xp,
      tasks: completedTasks,
      total: totalTasks,
      skipCount,
      cursed: isCursed
    }]);

    addLog('💀 You have fallen...');

    const newHero = makeName();
    setHero(newHero);
    setCurrentDay(1);
    setHp(GAME_CONSTANTS.MAX_HP);
    setStamina(GAME_CONSTANTS.MAX_STAMINA);
    setXp(0);
    setLevel(1);
    setHealthPots(0);
    setStaminaPots(0);
    setCleansePots(0);
    setBaseWeapon(0);
    setBaseArmor(0);
    setWeaponDebuff(0);
    setArmorDebuff(0);
    setTasks([]);
    setActiveTask(null);
    setTimer(0);
    setRunning(false);
    setHasStarted(false);
    setSkipCount(0);
    setConsecutiveDays(0);
    setLastPlayedDate(null);
    setIsCursed(false);
    setMiniBossCountFallbackZero();
    setTimeout(() => setActiveTab('grave'), 1000);
  };

  // Helpers to handle references to removed battle state in older code (compat/visual fallback)
  // These are minimal: the hook manages battle state. These helpers ensure code paths that used
  // local battling/miniboss values still work visually if referenced elsewhere.
  const setBattlingFallbackFalse = () => { /* no-op (hook manages battle state) */ };
  const setMiniBossCountFallbackZero = () => { /* no-op (hook manages miniBossCount) */ };

  // Advance day (called after a non-final boss victory in original logic)
  const advance = () => {
    // If final boss was defeated, onVictory already handled reset. For miniboss completion,
    // the hook calls onVictory which already awarded xp and loot; here we advance day if boss is dead.
    const nextDay = currentDay + 1;

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.done).length;
    if (totalTasks > 0 && completedTasks === totalTasks) {
      setStudyStats(prev => ({ ...prev, perfectDays: prev.perfectDays + 1 }));
      setXp(x => x + GAME_CONSTANTS.PERFECT_DAY_BONUS);
      addLog(`⭐ PERFECT DAY! +${GAME_CONSTANTS.PERFECT_DAY_BONUS} XP`);
    }

    if (nextDay <= GAME_CONSTANTS.TOTAL_DAYS) {
      setCurrentDay(nextDay);
      setHero(prev => ({
        ...prev,
        day: nextDay,
        title: titles[nextDay - 1],
        survived: prev.survived + 1
      }));
      addLog(`${GAME_CONSTANTS.DAY_NAMES[nextDay - 1].name} begins... ${GAME_CONSTANTS.DAY_NAMES[nextDay - 1].theme}`);
    }

    setHealthPots(0);
    setStaminaPots(0);
    setTasks([]);
    setActiveTask(null);
    setTimer(0);
    setRunning(false);
    setHasStarted(false);
    setIsCursed(false);
  };

  const fmt = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-900 text-green-400';
      case 'medium': return 'bg-yellow-900 text-yellow-400';
      case 'hard': return 'bg-red-900 text-red-400';
      default: return 'bg-gray-900 text-gray-400';
    }
  };

  if (!hero) return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="text-2xl">Loading your fate...</div>
    </div>
  );

  // UI shows boss state from hook
  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <div className="relative z-10 p-6">
        <div className="max-w-6xl mx-auto">
          <header className="text-center mb-8">
            <h1 className="text-6xl font-black text-red-400 mb-2 tracking-wider" style={{ fontFamily: 'Cinzel, serif', textShadow: '0 0 30px rgba(220, 38, 38, 0.8)' }}>
              CURSE OF KNOWLEDGE
            </h1>
            <p className="text-gray-400 text-sm mb-4 italic">"Study or be consumed by the abyss..."</p>
          </header>

          <div className="text-center py-6">
            <p className="text-2xl text-yellow-400 mb-2">🎮 Game Ready to Play!</p>
            <p className="text-gray-300">Start your day to begin the quest...</p>
            <div className="mt-4">
              <button onClick={start} className="px-3 py-1 bg-green-700 rounded mr-2">Start Day</button>
              <button onClick={() => spawnRandomMiniBoss(false)} className="px-3 py-1 bg-yellow-700 rounded mr-2">Spawn Mini (test)</button>
              <button onClick={() => spawnFinalBoss()} className="px-3 py-1 bg-red-700 rounded">Spawn Final (test)</button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="col-span-2 bg-slate-800 p-4 rounded">
              <h2 className="text-xl mb-2">Hero</h2>
              <div className="mb-2"><strong>{hero.name}</strong> • {hero.class?.name} • {hero.title}</div>
              <div className="mb-2">
                HP: {hp}/{getMaxHp()} • Stamina: {stamina}/{getMaxStamina()} • XP: {xp} • Lvl: {level}
              </div>
              <div className="mb-2">Weapon: {baseWeapon} (atk {getWeapon()}) • Armor: {baseArmor} (def {getArmor()})</div>

              <div className="mt-4">
                <button onClick={attack} className="px-3 py-1 bg-blue-600 rounded mr-2">Attack</button>
                <button onClick={specialAttack} className="px-3 py-1 bg-yellow-600 rounded mr-2">Special</button>
                <button onClick={flee} className="px-3 py-1 bg-gray-600 rounded mr-2">Flee</button>
                <button onClick={useHealth} className="px-3 py-1 bg-pink-700 rounded mr-2">Use Health ({healthPots})</button>
                <button onClick={useStamina} className="px-3 py-1 bg-indigo-700 rounded">Use Stamina ({staminaPots})</button>
              </div>
            </div>

            <div className="bg-slate-800 p-4 rounded">
              <h2 className="text-xl mb-2">Boss</h2>
              <div><strong>{bossState.bossName || 'No enemy'}</strong></div>
              <div>HP: {bossState.bossHp}/{bossState.bossMax}</div>
              <div>Debuffs: {JSON.stringify(bossState.bossDebuffs)}</div>
            </div>
          </div>

          <div className="mt-6 bg-slate-800 p-4 rounded">
            <h2 className="text-xl mb-2">Log</h2>
            <div style={{ maxHeight: 240, overflowY: 'auto', background: '#061018', padding: 10 }}>
              {log.map((l, i) => <div key={i} className="text-sm text-slate-200 py-0.5">{l}</div>)}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default FantasyStudyQuest;
