// FANTASY STUDY QUEST - v3.3 SEVEN DAYS EDITION (CALENDAR FIX)
// PART 1 OF 3 - Copy this first
// Last updated: 2026-01-14
// FIXES: Calendar sync, date display on planner, missing dependencies, poison bug

import React, { useState, useEffect, useCallback } from 'react';
import { Sword, Shield, Heart, Zap, Skull, Trophy, Plus, Play, Pause, X, Calendar } from 'lucide-react';

const GAME_CONSTANTS = {
  LATE_START_PENALTY: 15,
  LATE_START_HOUR: 8,
  MAX_HP: 100,
  MAX_STAMINA: 100,
  BASE_ATTACK: 15,
  BASE_DEFENSE: 10,
  PLAYER_HP_PER_DAY: 8,
  PLAYER_SP_PER_DAY: 8,
  PLAYER_ATK_PER_DAY: 2,
  PLAYER_DEF_PER_DAY: 1,
  HEALTH_POTION_HEAL: 30,
  STAMINA_POTION_RESTORE: 50,
  STAMINA_PER_TASK: 20,
  CLEANSE_POTION_COST: 100,
  LOOT_RATES: {
    HEALTH_POTION: 0.25,
    STAMINA_POTION: 0.50,
    WEAPON: 0.75,
    ARMOR: 1.00
  },
  MINI_BOSS_LOOT_RATES: {
    HEALTH_POTION: 0.25,
    STAMINA_POTION: 0.50,
    WEAPON: 0.75,
    ARMOR: 1.00
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
  MINI_BOSS_BASE: 66,
  MINI_BOSS_DAY_SCALING: 33,
  MINI_BOSS_ATK_BASE: 15,
  MINI_BOSS_ATK_SCALING: 3.06,
  FINAL_BOSS_BASE: 220,
  FINAL_BOSS_DAY_SCALING: 44,
  BOSS_ATTACK_BASE: 18.36,
  BOSS_ATTACK_DAY_SCALING: 4.59,
  BOSS_ATTACK_DELAY: 1000,
  LOG_MAX_ENTRIES: 8,
  SKIP_PENALTIES: [
    { hp: 20, message: '💀 The curse festers... -20 HP', levelLoss: 0, equipmentDebuff: 0, cursed: false },
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
  SPECIAL_ATTACKS: {
    Warrior: { name: 'Reckless Strike', cost: 30, hpCost: 15, damageMultiplier: 3.3, effect: 'Massive damage but costs 15 HP' },
    Mage: { name: 'Arcane Blast', cost: 40, damageMultiplier: 2.3, effect: 'Boss stunned - no counter-attack this turn' },
    Rogue: { name: "Venom's Ruin", cost: 30, damageMultiplier: 1.6, effect: 'Boss takes 5 damage per turn. Poisoned enemies take +15% damage from all attacks' },
    Paladin: { name: 'Divine Smite', cost: 30, damageMultiplier: 1.8, effect: 'Heals you for 20 HP' },
    Ranger: { name: 'Marked Shot', cost: 35, damageMultiplier: 1.8, effect: 'Boss takes +35% damage from your next attack. Creates devastating combos' }
  }
};

const FantasyStudyQuest = () => {
  const [activeTab, setActiveTab] = useState('quest');
  const [currentDay, setCurrentDay] = useState(1);
  const [playerProgressDay, setPlayerProgressDay] = useState(1); // Your actual progression (1-7)

// Helper to get real calendar day (1=Mon, 7=Sun)
const getRealDayNumber = useCallback(() => {
  const dayOfWeek = new Date().getDay(); // 0=Sun, 1=Mon, 2=Tue...
  return dayOfWeek === 0 ? 7 : dayOfWeek; // Convert Sunday to 7
}, []);
  const [hasStarted, setHasStarted] = useState(false);
  const [hero, setHero] = useState(null);
  const [hp, setHp] = useState(GAME_CONSTANTS.MAX_HP);
  const [stamina, setStamina] = useState(GAME_CONSTANTS.MAX_STAMINA);
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  
  const getMaxHp = useCallback(() => {
  return GAME_CONSTANTS.MAX_HP + (playerProgressDay - 1) * GAME_CONSTANTS.PLAYER_HP_PER_DAY;
}, [playerProgressDay]);

const getMaxStamina = useCallback(() => {
  return GAME_CONSTANTS.MAX_STAMINA + (playerProgressDay - 1) * GAME_CONSTANTS.PLAYER_SP_PER_DAY;
}, [playerProgressDay]);

const getBaseAttack = useCallback(() => {
  return GAME_CONSTANTS.BASE_ATTACK + (playerProgressDay - 1) * GAME_CONSTANTS.PLAYER_ATK_PER_DAY;
}, [playerProgressDay]);

const getBaseDefense = useCallback(() => {
  return GAME_CONSTANTS.BASE_DEFENSE + (playerProgressDay - 1) * GAME_CONSTANTS.PLAYER_DEF_PER_DAY;
}, [playerProgressDay]);
  
  const [healthPots, setHealthPots] = useState(0);
  const [staminaPots, setStaminaPots] = useState(0);
  const [cleansePots, setCleansePots] = useState(0);
  const [weapon, setWeapon] = useState(0);
  const [armor, setArmor] = useState(0);
  const [tasks, setTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);
 const [newTask, setNewTask] = useState({ title: '', priority: 'routine' });
  const [activeTask, setActiveTask] = useState(null);
  const [timer, setTimer] = useState(0);
  const [running, setRunning] = useState(false);
  const [showPomodoro, setShowPomodoro] = useState(false);
const [pomodoroTask, setPomodoroTask] = useState(null);
const [pomodoroTimer, setPomodoroTimer] = useState(25 * 60);
const [pomodoroRunning, setPomodoroRunning] = useState(false);
const [isBreak, setIsBreak] = useState(false);
const [pomodorosCompleted, setPomodorosCompleted] = useState(0);
  const [timerEndTime, setTimerEndTime] = useState(null);
  const [overdueTask, setOverdueTask] = useState(null);
  
  const [weeklyPlan, setWeeklyPlan] = useState({
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: []
  });
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [newPlanItem, setNewPlanItem] = useState({ title: '', priority: 'routine' });
  
  const [calendarTasks, setCalendarTasks] = useState({});
  const [flashcardDecks, setFlashcardDecks] = useState([]);
const [showDeckModal, setShowDeckModal] = useState(false);
const [showCardModal, setShowCardModal] = useState(false);
const [showStudyModal, setShowStudyModal] = useState(false);
const [selectedDeck, setSelectedDeck] = useState(null);
const [currentCardIndex, setCurrentCardIndex] = useState(0);
const [isFlipped, setIsFlipped] = useState(false);
const [newDeck, setNewDeck] = useState({ name: '' });
const [newCard, setNewCard] = useState({ front: '', back: '' });
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [newCalendarTask, setNewCalendarTask] = useState({ title: '', priority: 'routine' });
  
  const [showBoss, setShowBoss] = useState(false);
  const [bossHp, setBossHp] = useState(0);
  const [bossMax, setBossMax] = useState(0);
  const [battleType, setBattleType] = useState('regular');
const [waveCount, setWaveCount] = useState(0);
const [currentWaveEnemy, setCurrentWaveEnemy] = useState(0);
const [totalWaveEnemies, setTotalWaveEnemies] = useState(0);
  const [battling, setBattling] = useState(false);
  const [isFinalBoss, setIsFinalBoss] = useState(false);
  const [miniBossCount, setMiniBossCount] = useState(0);
  const [bossName, setBossName] = useState('');
  const [canFlee, setCanFlee] = useState(false);
  const [bossDebuffs, setBossDebuffs] = useState({ 
    poisonTurns: 0, 
    poisonDamage: 0, 
    poisonedVulnerability: 0,
    marked: false,
    stunned: false 
  });
  const [recklessStacks, setRecklessStacks] = useState(0);
  
  const [currentAnimation, setCurrentAnimation] = useState(null);
  const [battleMode, setBattleMode] = useState(false);
  const [bossFlash, setBossFlash] = useState(false);
  const [playerFlash, setPlayerFlash] = useState(false);
  const [victoryFlash, setVictoryFlash] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [canCustomize, setCanCustomize] = useState(true);
const [showCustomizeModal, setShowCustomizeModal] = useState(false);
const [customName, setCustomName] = useState('');
const [customClass, setCustomClass] = useState(null);
  const [log, setLog] = useState([]);
  const [graveyard, setGraveyard] = useState([]);
  const [heroes, setHeroes] = useState([]);
  const [skipCount, setSkipCount] = useState(0);
  const [consecutiveDays, setConsecutiveDays] = useState(0);
  const [lastPlayedDate, setLastPlayedDate] = useState(null);
  const [curseLevel, setCurseLevel] = useState(0); // 0 = none, 1-3 = curse levels
const [eliteBossDefeatedToday, setEliteBossDefeatedToday] = useState(false);
const [lastRealDay, setLastRealDay] = useState(null);
  
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
  
  const titles = ['Novice', 'Seeker', 'Wanderer', 'Survivor', 'Warrior', 'Champion', 'Legend'];
  
  const classes = [
    { name: 'Warrior', color: 'red', emblem: '⚔︎', gradient: ['from-red-900', 'from-red-800', 'from-red-700', 'from-red-600'], glow: ['shadow-red-900/50', 'shadow-red-700/60', 'shadow-red-600/70', 'shadow-red-500/80'] },
    { name: 'Mage', color: 'purple', emblem: '✦', gradient: ['from-purple-900', 'from-purple-800', 'from-purple-700', 'from-purple-600'], glow: ['shadow-purple-900/50', 'shadow-purple-700/60', 'shadow-purple-600/70', 'shadow-purple-500/80'] },
    { name: 'Rogue', color: 'green', emblem: '†', gradient: ['from-green-900', 'from-green-800', 'from-green-700', 'from-green-600'], glow: ['shadow-green-900/50', 'shadow-green-700/60', 'shadow-green-600/70', 'shadow-green-500/80'] },
    { name: 'Paladin', color: 'yellow', emblem: '✙', gradient: ['from-yellow-900', 'from-yellow-800', 'from-yellow-700', 'from-yellow-600'], glow: ['shadow-yellow-900/50', 'shadow-yellow-700/60', 'shadow-yellow-600/70', 'shadow-yellow-500/80'] },
    { name: 'Ranger', color: 'amber', emblem: '➶', gradient: ['from-amber-900', 'from-amber-800', 'from-amber-700', 'from-amber-600'], glow: ['shadow-amber-900/50', 'shadow-amber-700/60', 'shadow-amber-600/70', 'shadow-amber-500/80'] }
  ];

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
  
  const makeBossName = () => {
    const first = ['Malakar', 'Zarathos', 'Lilith', 'Nyxen', 'Azazel', 'Alastor', 'Barbatos', 'Furcas', 'Moloch', 'Xaphan'];
    const last = ['the Kind', 'the Blind', 'Deathbringer', 'the Wretched', 'the Fallen Angel', 'Rotten', 'Void Walker', 'the Forgotten', 'the Holy', 'Dread Lord', 'the Forsaken', 'the Tormentor'];
    return `${first[Math.floor(Math.random() * first.length)]} ${last[Math.floor(Math.random() * last.length)]}`;
  };
  
// FIXED: Helper function to get next occurrence of a day of week
const getNextDayOfWeek = useCallback((dayName) => {
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const targetDayIndex = daysOfWeek.indexOf(dayName);
  const today = new Date();
  const todayIndex = today.getDay();
  
  let daysUntil = targetDayIndex - todayIndex;
  if (daysUntil <= 0) daysUntil += 7;
  
  const targetDate = new Date(today);
  targetDate.setDate(today.getDate() + daysUntil);
  return targetDate;
}, []);

// Helper to create consistent date keys
const getDateKey = useCallback((date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}, []);

  const getCardStyle = (heroClass, day) => {
    const borders = ['3px solid', '3px solid', '3px solid', '4px solid', '4px solid', '5px solid', '5px solid'];
    const borderColors = {
      red: ['#8B0000', '#8B0000', '#B22222', '#DC143C', '#DC143C', '#FF4500', '#FF4500'],
      purple: ['#4B0082', '#4B0082', '#6A0DAD', '#8B008B', '#8B008B', '#9370DB', '#9370DB'],
      green: ['#004d00', '#004d00', '#006400', '#228B22', '#228B22', '#32CD32', '#32CD32'],
      yellow: ['#B8860B', '#B8860B', '#DAA520', '#FFD700', '#FFD700', '#FFEC8B', '#FFEC8B'],
      amber: ['#8B4513', '#8B4513', '#A0522D', '#CD853F', '#CD853F', '#DEB887', '#DEB887']
    };
    const toColors = {
      red: ['to-red-800', 'to-red-800', 'to-red-700', 'to-red-600', 'to-red-600', 'to-orange-500', 'to-orange-500'],
      purple: ['to-purple-800', 'to-purple-800', 'to-purple-700', 'to-indigo-600', 'to-indigo-600', 'to-pink-500', 'to-pink-500'],
      green: ['to-green-800', 'to-green-800', 'to-green-700', 'to-emerald-600', 'to-emerald-600', 'to-teal-500', 'to-teal-500'],
      yellow: ['to-yellow-800', 'to-yellow-800', 'to-yellow-700', 'to-amber-600', 'to-amber-600', 'to-orange-400', 'to-orange-400'],
      amber: ['to-amber-800', 'to-amber-800', 'to-orange-700', 'to-orange-600', 'to-orange-600', 'to-yellow-500', 'to-yellow-500']
    };
    
    const d = day - 1;
    const pulse = day === 7 ? ' animate-pulse' : '';
    
    return {
      border: `${borders[d]} ${borderColors[heroClass.color][d]}`,
      bg: `${heroClass.gradient[Math.min(d, 3)]} ${toColors[heroClass.color][d]}`,
      glow: `shadow-xl ${heroClass.glow[Math.min(d, 3)]}${pulse}`,
      emblem: heroClass.emblem
    };
  };
  
  const addLog = useCallback((msg) => {
    setLog(prev => [...prev, msg].slice(-GAME_CONSTANTS.LOG_MAX_ENTRIES));
  }, []);
  
  useEffect(() => {
    const saved = localStorage.getItem('fantasyStudyQuest');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.hero) setHero(data.hero);
        if (data.currentDay) setCurrentDay(data.currentDay);
        if (data.hp !== undefined) setHp(data.hp);
        if (data.stamina !== undefined) setStamina(data.stamina);
        if (data.xp !== undefined) setXp(data.xp);
        if (data.level !== undefined) setLevel(data.level);
        if (data.healthPots !== undefined) setHealthPots(data.healthPots);
        if (data.staminaPots !== undefined) setStaminaPots(data.staminaPots);
        if (data.cleansePots !== undefined) setCleansePots(data.cleansePots);
        if (data.weapon !== undefined) setWeapon(data.weapon);
        if (data.armor !== undefined) setArmor(data.armor);
        if (data.tasks) setTasks(data.tasks);
        if (data.flashcardDecks) setFlashcardDecks(data.flashcardDecks);
        if (data.graveyard) setGraveyard(data.graveyard);
        if (data.heroes) setHeroes(data.heroes);
        if (data.hasStarted !== undefined) setHasStarted(data.hasStarted);
        if (data.skipCount !== undefined) setSkipCount(data.skipCount);
        if (data.consecutiveDays !== undefined) setConsecutiveDays(data.consecutiveDays);
        if (data.lastPlayedDate) setLastPlayedDate(data.lastPlayedDate);
       if (data.curseLevel !== undefined) setCurseLevel(data.curseLevel);
       if (data.playerProgressDay !== undefined) setPlayerProgressDay(data.playerProgressDay);
if (data.eliteBossDefeatedToday !== undefined) setEliteBossDefeatedToday(data.eliteBossDefeatedToday);
if (data.lastRealDay) setLastRealDay(data.lastRealDay);
        if (data.studyStats) setStudyStats(data.studyStats);
        if (data.weeklyPlan) setWeeklyPlan(data.weeklyPlan);
        if (data.calendarTasks) setCalendarTasks(data.calendarTasks);
      } catch (e) {
        console.error('Failed to load save:', e);
      }
    }
   if (!hero) {
  const newHero = makeName();
  setHero(newHero);
}
// Always sync currentDay to real calendar day
setCurrentDay(getRealDayNumber());
    
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);
  
  useEffect(() => {
    if (hero) {
      const saveData = {
  hero, currentDay, playerProgressDay, hp, stamina, xp, level, healthPots, staminaPots, cleansePots,
  weapon, armor, tasks, flashcardDecks, graveyard, heroes, hasStarted, skipCount, consecutiveDays,
  lastPlayedDate, curseLevel, eliteBossDefeatedToday, lastRealDay, studyStats, weeklyPlan, calendarTasks
};
      localStorage.setItem('fantasyStudyQuest', JSON.stringify(saveData));
    }
 }, [hero, currentDay, playerProgressDay, hp, stamina, xp, level, healthPots, staminaPots, cleansePots, weapon, armor, tasks, graveyard, heroes, hasStarted, skipCount, consecutiveDays, lastPlayedDate, curseLevel, eliteBossDefeatedToday, lastRealDay, studyStats, weeklyPlan, calendarTasks, flashcardDecks]);
  
  useEffect(() => {
    let int;
    if (running && timerEndTime) {
      int = setInterval(() => {
        const now = Date.now();
        const remaining = Math.max(0, Math.ceil((timerEndTime - now) / 1000));
        setTimer(remaining);
        
        if (remaining <= 0) {
          setRunning(false);
          setTimerEndTime(null);
          setOverdueTask(activeTask);
          setHp(h => Math.max(1, h - 10));
          
          if (Notification.permission === "granted" && activeTask) {
            const task = tasks.find(t => t.id === activeTask);
            new Notification("⏰ Task Complete!", {
              body: `${task?.title || 'Task'} - Time to mark it done!`,
              icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100'><text y='75' font-size='75'>⏰</text></svg>"
            });
          }
          
          if (activeTask) {
            const task = tasks.find(t => t.id === activeTask);
            addLog(`⏰ Time's up for: ${task?.title || 'task'}!`);
            addLog(`💔 Ran out of time! Lost 10 HP as penalty.`);
          }
        }
      }, 1000);
    }
    return () => clearInterval(int);
  }, [running, timerEndTime, activeTask, tasks, addLog]);

  useEffect(() => {
  let interval;
  if (pomodoroRunning && pomodoroTimer > 0) {
    interval = setInterval(() => {
      setPomodoroTimer(t => {
        if (t <= 1) {
          // Timer finished
          setPomodoroRunning(false);
          
          // Play sound and show notification
          if (Notification.permission === "granted") {
            new Notification(isBreak ? "Break Over! 🎯" : "Pomodoro Complete! 🍅", {
              body: isBreak ? "Time to get back to work!" : "Great work! Take a 5 minute break.",
              icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100'><text y='75' font-size='75'>🍅</text></svg>"
            });
          }
          
          if (!isBreak) {
            // Work session done - start break
            setPomodorosCompleted(p => p + 1);
            addLog(`🍅 Pomodoro #${pomodorosCompleted + 1} completed!`);
            setIsBreak(true);
            setPomodoroTimer(5 * 60); // 5 minute break
          } else {
            // Break done - start work session
            addLog(`✨ Break over! Ready for another pomodoro?`);
            setIsBreak(false);
            setPomodoroTimer(25 * 60); // 25 minute work session
          }
          
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  }
  return () => clearInterval(interval);
}, [pomodoroRunning, pomodoroTimer, isBreak, pomodorosCompleted, addLog]);
  
  useEffect(() => {
    const newLevel = Math.floor(xp / GAME_CONSTANTS.XP_PER_LEVEL) + 1;
    if (newLevel > level) {
      setLevel(newLevel);
      addLog(`🎉 LEVEL UP! Now level ${newLevel}`);
      setHp(h => Math.min(getMaxHp(), h + 20));
    }
  }, [xp, level, addLog, getMaxHp]);
  
  const applySkipPenalty = useCallback(() => {
    const newSkipCount = skipCount + 1;
    setSkipCount(newSkipCount);
    setConsecutiveDays(0);
    
    const penaltyIndex = Math.min(newSkipCount - 1, GAME_CONSTANTS.SKIP_PENALTIES.length - 1);
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
      setWeapon(w => Math.floor(w * (1 - penalty.equipmentDebuff)));
      setArmor(a => Math.floor(a * (1 - penalty.equipmentDebuff)));
      addLog(`⚠️ Equipment weakened by ${penalty.equipmentDebuff * 100}%!`);
    }
    
  }, [skipCount, addLog]);
  
 const start = () => {
  // === DAILY CHECK SYSTEM ===
  const today = new Date().toDateString();
  const realDay = getRealDayNumber();
  
  // Check if real day has changed
  if (lastRealDay && lastRealDay !== today) {
    // New real day started!
    
    // Check if we defeated yesterday's elite boss
    if (!eliteBossDefeatedToday) {
      // Didn't beat boss - apply curse penalty
      const newCurseLevel = curseLevel + 1;
      setCurseLevel(newCurseLevel);
      
      if (newCurseLevel >= 4) {
        // 4th missed boss = death
        addLog('☠️ THE CURSE CONSUMES YOU. Four failures... the abyss claims your soul.');
        setTimeout(() => die(), 2000);
        return;
      }
      
      // Apply curse penalties
      const cursePenalties = [
        { hp: 20, msg: '🌑 CURSED. The curse takes root... -20 HP' },
        { hp: 40, msg: '🌑🌑 DEEPLY CURSED. The curse tightens its grip... -40 HP' },
        { hp: 60, msg: '☠️ CONDEMNED. One more failure... and the abyss claims you. -60 HP' }
      ];
      
      const penalty = cursePenalties[newCurseLevel - 1];
      setHp(h => Math.max(1, h - penalty.hp));
      addLog(penalty.msg);
    }
    
    // Reset daily flags
    setEliteBossDefeatedToday(false);
    
    // Increment player progression
    setPlayerProgressDay(d => d + 1);
  }
  
  // Always sync currentDay to real calendar
  setCurrentDay(realDay);
  
  // Set today as last played day
  setLastRealDay(today);
  
  // === END DAILY CHECK ===
  
  const currentHour = new Date().getHours();
  const dayOfWeek = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  if (lastPlayedDate && lastPlayedDate !== today) {
    setStudyStats(prev => ({
      ...prev,
      weeklyHistory: [...prev.weeklyHistory, prev.totalMinutesToday].slice(-7),
      totalMinutesToday: 0,
      sessionsToday: 0,
      tasksCompletedToday: 0,
      deepWorkSessions: 0
    }));
  }
  
  setLastPlayedDate(today);
  
  const plannedTasks = weeklyPlan[dayOfWeek] || [];

  if (tasks.length === 0) {
    const newTasks = [];
    
    plannedTasks.forEach((item, idx) => {
      newTasks.push({
        title: item.title,
        priority: item.priority || 'routine',
        id: Date.now() + idx,
        done: false
      });
    });
    
    if (newTasks.length > 0) {
      setTasks(newTasks);
      addLog(`📋 Loaded ${newTasks.length} tasks from ${dayOfWeek}'s plan`);
    }
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
  
  // ... rest of start function continues below
    
const currentHour = new Date().getHours();
  const dayOfWeek = new Date().toLocaleDateString('en-US', { weekday: 'long' });

    setLastPlayedDate(today);
    
    if (lastPlayedDate && lastPlayedDate !== today) {
      setStudyStats(prev => ({
        ...prev,
        weeklyHistory: [...prev.weeklyHistory, prev.totalMinutesToday].slice(-7),
        totalMinutesToday: 0,
        sessionsToday: 0,
        tasksCompletedToday: 0,
        deepWorkSessions: 0
      }));
    }
    
    
    const plannedTasks = weeklyPlan[dayOfWeek] || [];

if (tasks.length === 0) {
  const newTasks = [];
  
  plannedTasks.forEach((item, idx) => {
    newTasks.push({
      title: item.title,
      priority: item.priority || 'routine',
      id: Date.now() + idx,
      done: false
    });
  });
      
      if (newTasks.length > 0) {
        setTasks(newTasks);
        addLog(`📋 Loaded ${newTasks.length} tasks from ${dayOfWeek}'s plan`);
      }
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

// END OF PART 1 - Continue with part 2
// PART 2 OF 3 - Copy this after part 1

  const addTask = () => {
  if (newTask.title) {
    const today = new Date();
    const todayDayName = today.toLocaleDateString('en-US', { weekday: 'long' });
    const dateKey = getDateKey(today);
    
    // Add to tasks
    const newTaskObj = {
      title: newTask.title,
      priority: newTask.priority,
      id: Date.now(),
      done: false
    };
    
    setTasks(prev => [...prev, newTaskObj]);
    
    // Add to today's planner
    setWeeklyPlan(prev => ({
      ...prev,
      [todayDayName]: [...prev[todayDayName], { 
        title: newTask.title, 
        priority: newTask.priority,
        completed: false 
      }]
    }));
    
    // Add to today's calendar
    setCalendarTasks(prev => ({
      ...prev,
      [dateKey]: [...(prev[dateKey] || []), {
        title: newTask.title,
        priority: newTask.priority,
        done: false
      }]
    }));
    
    setNewTask({ title: '', priority: 'routine' });
    setShowModal(false);
    addLog(`📜 New trial: ${newTask.title}`);
  }
};
  
  const startTask = (id) => {
    if (canCustomize) {
  setCanCustomize(false);
}
    const task = tasks.find(t => t.id === id);
    if (task && !task.done && !activeTask) {
      setActiveTask(id);
      const seconds = task.time * 60;
      setTimer(seconds);
      setTimerEndTime(Date.now() + (seconds * 1000));
      setRunning(true);
      setSessionStartTime(Date.now());
      setTaskPauseCount(0);
      addLog(`⚔️ Starting: ${task.title}`);
    }
  };
  
  // FIXED: Added weapon, armor, overdueTask to dependencies
  const complete = useCallback((id) => {
  const task = tasks.find(t => t.id === id);
  if (task && !task.done) {
    // Base XP for completing a task
    const baseXp = 25;
    
   // Apply priority multiplier
const priorityMultiplier = task.priority === 'important' ? 1.25 : 1.0;
let xpMultiplier = GAME_CONSTANTS.XP_MULTIPLIERS[playerProgressDay - 1] * priorityMultiplier;

// Apply curse debuff based on level
if (curseLevel === 1) {
  xpMultiplier *= 0.5; // 50% XP
} else if (curseLevel === 2) {
  xpMultiplier *= 0.25; // 25% XP
} else if (curseLevel === 3) {
  xpMultiplier *= 0.1; // 10% XP
}
    
    let xpGain = Math.floor(baseXp * xpMultiplier);
    
    setXp(x => x + xpGain);
    
    setStudyStats(prev => ({
      ...prev,
      tasksCompletedToday: prev.tasksCompletedToday + 1
    }));
    
    // Check for redemption
    const completedCount = tasks.filter(t => t.done).length + 1;
    if (completedCount === 1) {
      const newConsecutive = consecutiveDays + 1;
      setConsecutiveDays(newConsecutive);
      
      if (newConsecutive >= GAME_CONSTANTS.SKIP_REDEMPTION_DAYS && skipCount > 0) {
        setSkipCount(s => s - 1);
        setConsecutiveDays(0);
        addLog(`🙏 REDEMPTION! ${GAME_CONSTANTS.SKIP_REDEMPTION_DAYS} days of dedication. Skip forgiven.`);
      }
    }
    
    // Loot drop
    const roll = Math.random();
    if (roll < GAME_CONSTANTS.LOOT_RATES.HEALTH_POTION) {
      setHealthPots(h => h + 1);
      addLog('💊 Found Health Potion!');
    } else if (roll < GAME_CONSTANTS.LOOT_RATES.STAMINA_POTION) {
      setStaminaPots(s => s + 1);
      addLog('⚡ Found Stamina Potion!');
    } else if (roll < GAME_CONSTANTS.LOOT_RATES.WEAPON) {
      const gain = 1 + Math.floor(currentDay / 2);
      setWeapon(w => w + gain);
      addLog(`⚔️ Weapon upgraded! +${gain}`);
    } else if (roll < GAME_CONSTANTS.LOOT_RATES.ARMOR) {
      const gain = 1 + Math.floor(currentDay / 2);
      setArmor(a => a + gain);
      addLog(`🛡️ Armor upgraded! +${gain}`);
    }
    
    // Mark task as done
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: true } : t));
    
    // Sync with calendar
    const today = new Date().toISOString().split('T')[0];
    setCalendarTasks(prev => {
      if (prev[today]) {
        return {
          ...prev,
          [today]: prev[today].map(ct => 
            ct.title === task.title ? { ...ct, done: true } : ct
          )
        };
      }
      return prev;
    });
    
    // Sync with planner
    const todayDayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    setWeeklyPlan(prev => ({
      ...prev,
      [todayDayName]: prev[todayDayName].map(item =>
        item.title === task.title ? { ...item, completed: true } : item
      )
    }));
    
    setStamina(s => Math.min(getMaxStamina(), s + GAME_CONSTANTS.STAMINA_PER_TASK));
    
    let completionMsg = `✅ Completed: ${task.title} (+${xpGain} XP`;
    if (task.priority === 'important') completionMsg += ' • IMPORTANT';
    completionMsg += `)`;
    
    addLog(completionMsg);

// Always spawn enemy after task completion
setTimeout(() => {
  // 20% chance for wave attack
  const waveRoll = Math.random();
  if (waveRoll < 0.2) {
    // Wave attack: 2-4 enemies
    const numEnemies = Math.floor(Math.random() * 3) + 2; // 2, 3, or 4
    setWaveCount(numEnemies);
    addLog(`⚠️ WAVE INCOMING! ${numEnemies} enemies detected!`);
    setTimeout(() => spawnRegularEnemy(true, 1, numEnemies), 1000);
  } else {
    // Regular single enemy
    spawnRegularEnemy(false, 0, 1);
  }
}, 1000);
  }

}, [tasks, playerProgressDay, addLog, consecutiveDays, skipCount, curseLevel, hp, sessionStartTime, taskPauseCount, getMaxHp, getMaxStamina, weapon, armor, overdueTask, calendarTasks, setCalendarTasks]);
  
const spawnRegularEnemy = useCallback((isWave = false, waveIndex = 0, totalWaves = 1) => {
  if (canCustomize) setCanCustomize(false);
  
  const baseHp = 25;
  const dayScaling = 25;
  const enemyHp = baseHp + (playerProgressDay * dayScaling);
  
  setCurrentAnimation('screen-shake');
  setTimeout(() => setCurrentAnimation(null), 500);
  
  const enemyName = makeBossName();
  setBossName(enemyName);
  setBossHp(enemyHp);
  setBossMax(enemyHp);
  setShowBoss(true);
  setBattling(true);
  setBattleMode(true);
  setIsFinalBoss(false);
  setCanFlee(false);
  setBossDebuffs({ poisonTurns: 0, poisonDamage: 0, poisonedVulnerability: 0, marked: false, stunned: false });
  
  if (isWave) {
    setBattleType('wave');
    setCurrentWaveEnemy(waveIndex);
    setTotalWaveEnemies(totalWaves);
    addLog(`⚠️ WAVE ASSAULT - Enemy ${waveIndex}/${totalWaves}: ${enemyName}`);
  } else {
    setBattleType('regular');
    addLog(`⚔️ ${enemyName} appears!`);
  }
}, [playerProgressDay, canCustomize, addLog]);

  const spawnRandomMiniBoss = (force = false) => {
    const completedTasks = tasks.filter(t => t.done).length;
    const totalTasks = tasks.length;
    
    if (!force && totalTasks === 0) return;
    if (force) setStamina(getMaxStamina());
    
    const bossNumber = miniBossCount + 1;
    const completionRate = totalTasks > 0 ? completedTasks / totalTasks : 0.5;
    const baseHp = GAME_CONSTANTS.MINI_BOSS_BASE + (playerProgressDay * GAME_CONSTANTS.MINI_BOSS_DAY_SCALING);
    const scaledHp = Math.floor(baseHp * (1 + bossNumber * 0.2));
    const bossHealth = Math.floor(scaledHp * (2 - completionRate));
    
    setCurrentAnimation('screen-shake');
    setTimeout(() => setCurrentAnimation(null), 500);
    
    const bossNameGenerated = makeBossName();
    setBossName(bossNameGenerated);
    setBossHp(bossHealth);
    setBossMax(bossHealth);
    setShowBoss(true);
    setBattling(true);
    setBattleMode(true);
    setIsFinalBoss(false);
    setCanFlee(true);
    setMiniBossCount(bossNumber);
    setBossDebuffs({ poisonTurns: 0, poisonDamage: 0, poisonedVulnerability: 0, marked: false, stunned: false });
    addLog(`⚔️ AMBUSH! ${bossNameGenerated} appears!`);
  };
  
  const useHealth = () => {
  if (curseLevel === 3) {
    addLog('☠️ CONDEMNED - Cannot use Health Potions!');
    return;
  }
  if (healthPots > 0 && hp < getMaxHp()) {
    setHealthPots(h => h - 1);
    setHp(h => Math.min(getMaxHp(), h + 50));
    addLog('💊 Used Health Potion! +50 HP');
  }
};
  const useStamina = () => {
    const staminaCost = 5;
    const timeBonus = 5 * 60;
    
    if (stamina >= staminaCost && activeTask) {
      setStamina(s => s - staminaCost);
      setTimer(t => t + timeBonus);
      
      if (overdueTask === activeTask) {
        setOverdueTask(null);
      }
      
      if (!running || timer <= 0) {
        setRunning(true);
        setTimerEndTime(Date.now() + ((timer + timeBonus) * 1000));
      } else {
        setTimerEndTime(prev => prev ? prev + (timeBonus * 1000) : null);
      }
      
      addLog(`⚡ Spent ${staminaCost} Stamina! +5 minutes to timer`);
    }
  };
  
 const useCleanse = () => {
  if (cleansePots > 0 && curseLevel > 0) {
    setCleansePots(c => c - 1);
    const removedLevel = curseLevel;
    setCurseLevel(0);
    addLog(`✨ Used Cleanse Potion! ${removedLevel === 3 ? 'CONDEMNATION' : removedLevel === 2 ? 'DEEP CURSE' : 'CURSE'} removed!`);
  }
};
  
  const craftCleanse = () => {
    if (xp >= GAME_CONSTANTS.CLEANSE_POTION_COST) {
      setXp(x => x - GAME_CONSTANTS.CLEANSE_POTION_COST);
      setCleansePots(c => c + 1);
      addLog(`🧪 Crafted Cleanse Potion! -${GAME_CONSTANTS.CLEANSE_POTION_COST} XP`);
    }
  };
  
  const miniBoss = () => {
  const completedTasks = tasks.filter(t => t.done).length;
  const totalTasks = tasks.length;
  
  if (totalTasks === 0) {
    addLog('⚠️ No trials accepted! Create some first.');
    return;
  }
  
  if (totalTasks < 5) {
    addLog(`⚠️ Need at least 5 tasks! (Currently have ${totalTasks})`);
    return;
  }
  
  if (completedTasks < totalTasks * 0.9) {
    addLog(`⚠️ Need 90% completion! (${completedTasks}/${totalTasks} = ${Math.floor(completedTasks/totalTasks*100)}%)`);
    return;
  }
  
  setBattleType('elite');
  spawnRandomMiniBoss();
  setCanFlee(false);
};
  
  const finalBoss = () => {
  const completedTasks = tasks.filter(t => t.done).length;
  const totalTasks = tasks.length;
  const isRealSunday = new Date().getDay() === 0;
  
  if (!isRealSunday) {
    addLog('⚠️ THE FINAL RECKONING only available on Sunday!');
    return;
  }
  
  if (totalTasks === 0) {
    addLog('⚠️ No trials accepted! Create some first.');
    return;
  }
  
  if (completedTasks < totalTasks) {
    addLog(`⚠️ Must complete ALL trials! (${completedTasks}/${totalTasks} done)`);
    return;
  }
  
  const baseHp = GAME_CONSTANTS.FINAL_BOSS_BASE + (playerProgressDay * GAME_CONSTANTS.FINAL_BOSS_DAY_SCALING);
  const completionRate = totalTasks > 0 ? completedTasks / totalTasks : 1.0;
  const bossHealth = Math.floor(baseHp * (1.5 - completionRate * 0.5));
  
  setCurrentAnimation('screen-shake');
  setTimeout(() => setCurrentAnimation(null), 500);
  
  const bossNameGenerated = makeBossName();
  setBossName(bossNameGenerated);
  setBossHp(bossHealth);
  setBossMax(bossHealth);
  setBattleType('final');
  setShowBoss(true);
  setBattling(true);
  setBattleMode(true);
  setIsFinalBoss(true);
  setCanFlee(false);
  addLog(`👹 ${bossNameGenerated.toUpperCase()} - THE FINAL RECKONING!`);
};
   
  const attack = () => {
    if (!battling || bossHp <= 0) return;
    
    if (recklessStacks > 0) setRecklessStacks(0);
    
    setCurrentAnimation('battle-shake');
    setTimeout(() => setCurrentAnimation(null), 250);
    
    const damage = getBaseAttack() + weapon + Math.floor(Math.random() * 10) + (level - 1) * 2;
    let finalDamage = damage;
    let bonusMessages = [];
    
    if (bossDebuffs.marked) {
      const markBonus = Math.floor(damage * 0.35);
      finalDamage = damage + markBonus;
      bonusMessages.push(`🎯 WEAK POINT! +${markBonus} bonus damage (Mark consumed)`);
      setBossDebuffs(prev => ({ ...prev, marked: false }));
    }
    
    if (bossDebuffs.poisonTurns > 0) {
      const poisonBonus = Math.floor(finalDamage * bossDebuffs.poisonedVulnerability);
      finalDamage += poisonBonus;
      bonusMessages.push(`☠️ +${poisonBonus} from poison vulnerability`);
    }
    
    const newBossHp = Math.max(0, bossHp - finalDamage);
    setBossHp(newBossHp);
    
    if (bossDebuffs.marked || bossDebuffs.poisonTurns > 0) {
      addLog(`⚔️ Attack: ${damage} base damage`);
      bonusMessages.forEach(msg => addLog(msg));
      addLog(`💥 TOTAL DAMAGE: ${finalDamage}!`);
    } else {
      addLog(`⚔️ Dealt ${finalDamage} damage!`);
    }
    
    setBossFlash(true);
    setTimeout(() => setBossFlash(false), 200);
    
    if (newBossHp <= 0) {
  setTimeout(() => {
    setCurrentAnimation('battle-shake');
    setTimeout(() => setCurrentAnimation(null), 250);
  }, 100);
  
  setRecklessStacks(0);
  
  // Different XP based on battle type
  let xpGain;
  if (isFinalBoss) {
    xpGain = GAME_CONSTANTS.XP_REWARDS.finalBoss;
  } else if (battleType === 'elite') {
    xpGain = GAME_CONSTANTS.XP_REWARDS.miniBoss;
  } else {
    xpGain = 25; // Regular enemy
  }
  
  setXp(x => x + xpGain);
  addLog(`🎊 VICTORY! +${xpGain} XP`);

  // Elite boss defeated - remove curses and set daily flag
if (battleType === 'elite') {
  if (curseLevel > 0) {
    setCurseLevel(0);
    addLog('🌅 THE CURSE BREAKS! You are free... for now.');
  }
  setEliteBossDefeatedToday(true);
  addLog('✨ Today\'s trial complete. You may advance when ready.');
}
  
  // Check if wave continues
  if (battleType === 'wave' && currentWaveEnemy < totalWaveEnemies) {
    // More enemies in wave
    const nextEnemy = currentWaveEnemy + 1;
    addLog(`⚠️ Next wave enemy incoming...`);
    setTimeout(() => spawnRegularEnemy(true, nextEnemy, totalWaveEnemies), 1500);
    setShowBoss(false);
    setBattling(false);
    setBattleMode(false);
    return;
  }
  
  // Wave complete bonus
  if (battleType === 'wave') {
    setXp(x => x + 25);
    addLog(`🌊 Wave defeated! +25 bonus XP`);
  }
  
  setBattling(false);
  setBattleMode(false);
      
      if (!isFinalBoss) {
        const lootRoll = Math.random();
        if (lootRoll < GAME_CONSTANTS.MINI_BOSS_LOOT_RATES.HEALTH_POTION) {
          setHealthPots(h => h + 1);
          addLog('💎 Looted: Health Potion!');
        } else if (lootRoll < GAME_CONSTANTS.MINI_BOSS_LOOT_RATES.STAMINA_POTION) {
          setStaminaPots(s => s + 1);
          addLog('💎 Looted: Stamina Potion!');
        } else if (lootRoll < GAME_CONSTANTS.MINI_BOSS_LOOT_RATES.WEAPON) {
          const gain = 4 + Math.floor(currentDay / 3);
          setWeapon(w => w + gain);
          addLog(`💎 Looted: Weapon Upgrade! +${gain} (Total: ${weapon + gain})`);
        } else {
          const gain = 4 + Math.floor(currentDay / 3);
          setArmor(a => a + gain);
          addLog(`💎 Looted: Armor Upgrade! +${gain} (Total: ${armor + gain})`);
        }
        
        setHp(getMaxHp());
        addLog('✨ Fully healed!');
      }
      
      setVictoryFlash(true);
      setTimeout(() => setVictoryFlash(false), 400);
      return;
    }
    
    setTimeout(() => {
      if (!battling || hp <= 0) return;
      
      setCurrentAnimation('battle-shake');
      setTimeout(() => setCurrentAnimation(null), 250);
      
      // Regular enemies hit softer
let baseAttack, attackScaling;
if (battleType === 'regular' || battleType === 'wave') {
  baseAttack = 25;
  attackScaling = 2;
} else {
  // Elite and Final bosses use normal stats
  baseAttack = GAME_CONSTANTS.BOSS_ATTACK_BASE;
  attackScaling = GAME_CONSTANTS.BOSS_ATTACK_DAY_SCALING;
}

let bossDamage = Math.max(1, Math.floor(
  baseAttack + 
  (playerProgressDay * attackScaling) - 
  (getBaseDefense() + armor)
));

// Curse level increases enemy damage
if (curseLevel === 2) {
  bossDamage = Math.floor(bossDamage * 1.2); // 20% harder
} else if (curseLevel === 3) {
  bossDamage = Math.floor(bossDamage * 1.4); // 40% harder
}
      
      setPlayerFlash(true);
      setTimeout(() => setPlayerFlash(false), 200);
      
      setHp(currentHp => {
        const newHp = Math.max(0, currentHp - bossDamage);
        if (newHp <= 0) {
          setTimeout(() => {
            addLog('💀 You have been defeated!');
            die();
          }, 500);
        }
        return newHp;
      });
      addLog(`💥 Boss strikes! -${bossDamage} HP`);
      
      setTimeout(() => {
        if (!battling) return;
        
        if (bossDebuffs.poisonTurns > 0) {
          const poisonDmg = bossDebuffs.poisonDamage;
          setBossHp(h => {
            const newHp = Math.max(0, h - poisonDmg);
            if (newHp > 0) {
              addLog(`☠️ Poison deals ${poisonDmg} damage! (${bossDebuffs.poisonTurns - 1} turns left)`);
            } else {
              addLog(`☠️ Poison deals ${poisonDmg} damage!`);
              addLog(`💀 Boss succumbed to poison!`);
              
              setTimeout(() => {
                const xpGain = isFinalBoss ? GAME_CONSTANTS.XP_REWARDS.finalBoss : GAME_CONSTANTS.XP_REWARDS.miniBoss;
                setXp(x => x + xpGain);
                addLog(`🎊 VICTORY! +${xpGain} XP`);
                setBattling(false);
                setBattleMode(false);
                setRecklessStacks(0);
                
                if (!isFinalBoss) {
                  setHp(getMaxHp());
                  addLog('✨ Fully healed!');
                }
                
                setVictoryFlash(true);
                setTimeout(() => setVictoryFlash(false), 400);
              }, 500);
            }
            return newHp;
          });
          // FIXED: Check > 1 instead of > 0
          setBossDebuffs(prev => ({
            ...prev,
            poisonTurns: prev.poisonTurns - 1,
            poisonedVulnerability: prev.poisonTurns > 1 ? 0.15 : 0
          }));
        }
      }, 200);
    }, GAME_CONSTANTS.BOSS_ATTACK_DELAY);
  };
  
  const specialAttack = () => {
    if (!battling || bossHp <= 0 || !hero || !hero.class) return;
    
    const special = GAME_CONSTANTS.SPECIAL_ATTACKS[hero.class.name];
    if (!special) return;
    
    if (hero.class.name === 'Ranger' && bossDebuffs.marked) {
      addLog(`⚠️ Target already marked! Use a normal attack to exploit the weak point first.`);
      return;
    }
    
    if (stamina < special.cost) {
      addLog(`⚠️ Need ${special.cost} stamina! (Have ${stamina})`);
      return;
    }
    
    let hpCost = special.hpCost || 0;
    if (special.hpCost && hero.class.name === 'Warrior') {
      hpCost = special.hpCost + (recklessStacks * 10);
      if (hp <= hpCost) {
        addLog(`⚠️ Reckless Strike requires more than ${hpCost} HP! (Current: ${hp} HP)`);
        return;
      }
    }
    
    setStamina(s => s - special.cost);
    
    if (hpCost > 0) {
      setHp(h => Math.max(1, h - hpCost));
      if (recklessStacks === 0) {
        addLog(`💔 Reckless! Lost ${hpCost} HP for massive power!`);
      } else {
        addLog(`💔 BERSERKER RAGE! Lost ${hpCost} HP! (Escalating: ${recklessStacks + 1}x)`);
      }
      setRecklessStacks(s => s + 1);
    }
    
    setCurrentAnimation('battle-shake');
    setTimeout(() => setCurrentAnimation(null), 250);
    
    let damage = Math.floor((getBaseAttack() + weapon + Math.floor(Math.random() * 10) + (level - 1) * 2) * special.damageMultiplier);
    
    const wasMarked = bossDebuffs.marked;
    if (wasMarked && hero.class.name !== 'Ranger') {
      const markBonus = Math.floor(damage * 0.35);
      damage += markBonus;
    }
    
    const wasPoisoned = bossDebuffs.poisonTurns > 0;
    if (wasPoisoned && bossDebuffs.poisonedVulnerability > 0) {
      const bonusDamage = Math.floor(damage * bossDebuffs.poisonedVulnerability);
      damage += bonusDamage;
    }
    
    let effectMessage = '';
    let skipCounterAttack = false;
    
    if (hero.class.name === 'Warrior') {
      effectMessage = '⚔️ DEVASTATING BLOW!';
      if (wasMarked) {
        setBossDebuffs(prev => ({ ...prev, marked: false }));
      }
    } else if (hero.class.name === 'Mage') {
      setBossDebuffs(prev => ({ ...prev, stunned: true, marked: false }));
      skipCounterAttack = true;
      effectMessage = '✨ Boss stunned!';
    } else if (hero.class.name === 'Rogue') {
      setBossDebuffs(prev => ({ ...prev, poisonTurns: 5, poisonDamage: 5, poisonedVulnerability: 0.15, marked: false }));
      effectMessage = "☠️ Boss poisoned! Takes +15% damage from all attacks!";
    } else if (hero.class.name === 'Paladin') {
      setHp(h => Math.min(getMaxHp(), h + 20));
      effectMessage = '✨ Healed for 20 HP!';
      if (wasMarked) {
        setBossDebuffs(prev => ({ ...prev, marked: false }));
      }
    } else if (hero.class.name === 'Ranger') {
      setBossDebuffs(prev => ({ ...prev, marked: true }));
      effectMessage = '🎯 TARGET MARKED! Your next attack will deal +35% bonus damage!';
    }
    
    const newBossHp = Math.max(0, bossHp - damage);
    setBossHp(newBossHp);
    
    let damageLog = `⚡ ${special.name}! Dealt ${damage} damage!`;
    let bonusMessages = [];
    
    if (wasMarked && hero.class.name !== 'Ranger') {
      const markBonus = Math.floor((damage / 1.35) * 0.35);
      bonusMessages.push(`🎯 +${markBonus} from weak point!`);
    }
    
    if (wasPoisoned && bossDebuffs.poisonedVulnerability > 0) {
      const bonusDmg = Math.floor((damage / (1 + bossDebuffs.poisonedVulnerability)) * bossDebuffs.poisonedVulnerability);
      bonusMessages.push(`☠️ +${bonusDmg} from poison vulnerability`);
    }
    
    addLog(damageLog);
    bonusMessages.forEach(msg => addLog(msg));
    if (effectMessage) addLog(effectMessage);
    
    setBossFlash(true);
    setTimeout(() => setBossFlash(false), 200);
    
    if (newBossHp <= 0) {
      setTimeout(() => {
        setCurrentAnimation('battle-shake');
        setTimeout(() => setCurrentAnimation(null), 250);
      }, 100);
      
      setRecklessStacks(0);
      
      const xpGain = isFinalBoss ? GAME_CONSTANTS.XP_REWARDS.finalBoss : GAME_CONSTANTS.XP_REWARDS.miniBoss;
      setXp(x => x + xpGain);
      addLog(`🎊 VICTORY! +${xpGain} XP`);
      setBattling(false);
      setBattleMode(false);
      
      if (!isFinalBoss) {
  // Regular/wave enemies: potions only
  if (battleType === 'regular' || battleType === 'wave') {
    const lootRoll = Math.random();
    if (lootRoll < 0.2) {
      setHealthPots(h => h + 1);
      addLog('💊 Looted: Health Potion!');
    } else if (lootRoll < 0.55) {
      setStaminaPots(s => s + 1);
      addLog('⚡ Looted: Stamina Potion!');
    }
  } else {
    // Elite bosses: weapon/armor upgrades
    const lootRoll = Math.random();
    if (lootRoll < GAME_CONSTANTS.MINI_BOSS_LOOT_RATES.HEALTH_POTION) {
      setHealthPots(h => h + 1);
      addLog('💎 Looted: Health Potion!');
    } else if (lootRoll < GAME_CONSTANTS.MINI_BOSS_LOOT_RATES.STAMINA_POTION) {
      setStaminaPots(s => s + 1);
      addLog('💎 Looted: Stamina Potion!');
    } else if (lootRoll < GAME_CONSTANTS.MINI_BOSS_LOOT_RATES.WEAPON) {
      const gain = 4 + Math.floor(currentDay / 3);
      setWeapon(w => w + gain);
      addLog(`💎 Looted: Weapon Upgrade! +${gain} (Total: ${weapon + gain})`);
    } else {
      const gain = 4 + Math.floor(currentDay / 3);
      setArmor(a => a + gain);
      addLog(`💎 Looted: Armor Upgrade! +${gain} (Total: ${armor + gain})`);
    }
  }
        
        setHp(getMaxHp());
        addLog('✨ Fully healed!');
      }
      
      setVictoryFlash(true);
      setTimeout(() => setVictoryFlash(false), 400);
      
      return;
    }
    
    if (!skipCounterAttack) {
      setTimeout(() => {
        if (!battling || hp <= 0) return;
        
        setBossDebuffs(prev => ({ ...prev, stunned: false }));
        
        setCurrentAnimation('battle-shake');
        setTimeout(() => setCurrentAnimation(null), 250);
        
        // Regular enemies hit softer
let baseAttack, attackScaling;
if (battleType === 'regular' || battleType === 'wave') {
  baseAttack = 25;
  attackScaling = 2;
} else {
  // Elite and Final bosses use normal stats
  baseAttack = GAME_CONSTANTS.BOSS_ATTACK_BASE;
  attackScaling = GAME_CONSTANTS.BOSS_ATTACK_DAY_SCALING;
}

let bossDamage = Math.max(1, Math.floor(
  baseAttack + 
  (playerProgressDay * attackScaling) - 
  (getBaseDefense() + armor)
));

// Curse level increases enemy damage
if (curseLevel === 2) {
  bossDamage = Math.floor(bossDamage * 1.2); // 20% harder
} else if (curseLevel === 3) {
  bossDamage = Math.floor(bossDamage * 1.4); // 40% harder
}
        
        setPlayerFlash(true);
        setTimeout(() => setPlayerFlash(false), 200);
        
        setHp(currentHp => {
          const newHp = Math.max(0, currentHp - bossDamage);
          if (newHp <= 0) {
            setTimeout(() => {
              addLog('💀 You have been defeated!');
              die();
            }, 500);
          }
          return newHp;
        });
        addLog(`💥 Boss strikes! -${bossDamage} HP`);
        
        setTimeout(() => {
          if (!battling) return;
          
          if (bossDebuffs.poisonTurns > 0) {
            const poisonDmg = bossDebuffs.poisonDamage;
            setBossHp(h => {
              const newHp = Math.max(0, h - poisonDmg);
              if (newHp > 0) {
                addLog(`☠️ Poison deals ${poisonDmg} damage! (${bossDebuffs.poisonTurns - 1} turns left)`);
              } else {
                addLog(`☠️ Poison deals ${poisonDmg} damage!`);
                addLog(`💀 Boss succumbed to poison!`);
                
                setTimeout(() => {
                  const xpGain = isFinalBoss ? GAME_CONSTANTS.XP_REWARDS.finalBoss : GAME_CONSTANTS.XP_REWARDS.miniBoss;
                  setXp(x => x + xpGain);
                  addLog(`🎊 VICTORY! +${xpGain} XP`);
                  setBattling(false);
                  setBattleMode(false);
                  setRecklessStacks(0);
                  
                  if (!isFinalBoss) {
                    setHp(getMaxHp());
                    addLog('✨ Fully healed!');
                  }
                  
                  setVictoryFlash(true);
                  setTimeout(() => setVictoryFlash(false), 400);
                }, 500);
              }
              return newHp;
            });
            setBossDebuffs(prev => ({
              ...prev,
              poisonTurns: prev.poisonTurns - 1,
              poisonedVulnerability: prev.poisonTurns > 1 ? 0.15 : 0
            }));
          }
        }, 200);
      }, GAME_CONSTANTS.BOSS_ATTACK_DELAY);
    } else {
      setBossDebuffs(prev => ({ ...prev, stunned: false }));
    }
  };
  
  const flee = () => {
    if (!canFlee) return;
    
    setBattling(false);
    setShowBoss(false);
    setBattleMode(false);
    setRecklessStacks(0);
    
    const fleePenalty = Math.floor(getMaxHp() * 0.1);
    setHp(h => Math.max(1, h - fleePenalty));
    
    addLog(`🏃 Fled from ${bossName}! Lost ${fleePenalty} HP.`);
  };
  
  const die = () => {
    if (hp === GAME_CONSTANTS.MAX_HP && currentDay === 1 && level === 1) return;
    
    const completedTasks = tasks.filter(t => t.done).length;
    const totalTasks = tasks.length;
    
    setBattling(false);
    setShowBoss(false);
    setBattleMode(false);
    setRecklessStacks(0);
    
   setGraveyard(prev => [...prev, { 
  ...hero, 
  day: currentDay, 
  lvl: level,
  xp: xp,
  tasks: completedTasks, 
  total: totalTasks,
  skipCount: skipCount
}]);
    
    addLog('💀 You have fallen...');
    
    const newHero = makeName();
    setHero(newHero);
    setCanCustomize(true);
    setCurrentDay(1);
    setHp(GAME_CONSTANTS.MAX_HP);
    setStamina(GAME_CONSTANTS.MAX_STAMINA);
    setXp(0);
    setLevel(1);
    setHealthPots(0);
    setStaminaPots(0);
    setCleansePots(0);
    setWeapon(0);
    setArmor(0);
    
    setStudyStats(prev => ({
      totalMinutesToday: 0,
      totalMinutesWeek: 0,
      sessionsToday: 0,
      longestStreak: prev.longestStreak,
      currentStreak: 0,
      tasksCompletedToday: 0,
      deepWorkSessions: 0,
      earlyBirdDays: prev.earlyBirdDays,
      perfectDays: prev.perfectDays,
      weeklyHistory: []
    }));
    
   setTasks([]);
setActiveTask(null);
setTimer(0);
setRunning(false);
setHasStarted(false);
setSkipCount(0);
setConsecutiveDays(0);
setLastPlayedDate(null);
setMiniBossCount(0);
setPlayerProgressDay(1);
    
    setTimeout(() => setActiveTab('grave'), 1000);
  };


// PART 3 OF 6 - Copy this after part 2

  const advance = () => {
    if (isFinalBoss && bossHp <= 0) {
      setHeroes(prev => [...prev, { 
        ...hero, 
        lvl: level, 
        xp: xp, 
        title: titles[6],
        day: currentDay,
        skipCount: skipCount
      }]);
      addLog('🏆 THE CURSE IS BROKEN! YOU ARE FREE!');
      
      const newHero = makeName();
      setHero(newHero);
      setCanCustomize(true);
      setCurrentDay(1);
      setPlayerProgressDay(1);
      setHp(GAME_CONSTANTS.MAX_HP);
      setStamina(GAME_CONSTANTS.MAX_STAMINA);
      setXp(0);
      setLevel(1);
      setHealthPots(0);
      setStaminaPots(0);
      setCleansePots(0);
      setWeapon(0);
      setArmor(0);
      
      setStudyStats(prev => ({
        totalMinutesToday: 0,
        totalMinutesWeek: 0,
        sessionsToday: 0,
        longestStreak: prev.longestStreak,
        currentStreak: 0,
        tasksCompletedToday: 0,
        deepWorkSessions: 0,
        earlyBirdDays: prev.earlyBirdDays,
        perfectDays: prev.perfectDays,
        weeklyHistory: []
      }));
      
      setTasks([]);
setActiveTask(null);
setTimer(0);
setRunning(false);
setHasStarted(false);
setShowBoss(false);
setSkipCount(0);
setConsecutiveDays(0);
setLastPlayedDate(null);
setMiniBossCount(0);
setBattleMode(false);
      
      setTimeout(() => setActiveTab('hall'), 1000);
    } else if (!isFinalBoss && bossHp <= 0) {
      const nextDay = currentDay + 1;
      
      const totalTasks = tasks.length;
      const completedTasks = tasks.filter(t => t.done).length;
      if (totalTasks > 0 && completedTasks === totalTasks) {
        setStudyStats(prev => ({ ...prev, perfectDays: prev.perfectDays + 1 }));
        setXp(x => x + GAME_CONSTANTS.PERFECT_DAY_BONUS);
        addLog(`⭐ PERFECT DAY! +${GAME_CONSTANTS.PERFECT_DAY_BONUS} XP`);
      }
      
    // Increment player progression
setPlayerProgressDay(d => Math.min(7, d + 1));

// Sync display to real calendar
const realDay = getRealDayNumber();
setCurrentDay(realDay);

setHero(prev => ({
  ...prev,
  day: playerProgressDay + 1,
  survived: prev.survived + 1,
  title: titles[Math.min(playerProgressDay, 6)]
}));

addLog(`Day ${playerProgressDay + 1} begins...`);
      
      setHp(getMaxHp());
      setStamina(getMaxStamina());
      setHealthPots(0);
      setStaminaPots(0);
      setCleansePots(0);
      
      setStudyStats(prev => ({
        ...prev,
        weeklyHistory: [...prev.weeklyHistory, prev.totalMinutesToday].slice(-7),
        totalMinutesToday: 0,
        sessionsToday: 0,
        tasksCompletedToday: 0,
        deepWorkSessions: 0
      }));
      
      setTasks([]);
      setActiveTask(null);
      setTimer(0);
      setRunning(false);
      setHasStarted(false);
      setShowBoss(false);
      setMiniBossCount(0);
      setBattling(false);
      setBattleMode(false);
      setRecklessStacks(0);
      setBossDebuffs({ poisonTurns: 0, poisonDamage: 0, poisonedVulnerability: 0, marked: false, stunned: false });
      
      addLog(`🌅 New day! Fully rested. HP: ${getMaxHp()} | SP: ${getMaxStamina()}`);
    }
  };
  
  const fmt = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const getColor = (difficulty) => {
    switch(difficulty) {
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

  return (
  <div className={`min-h-screen bg-black text-white relative overflow-hidden ${currentAnimation || ''} ${
    curseLevel === 3 ? 'border-8 border-red-600 animate-pulse' : ''
  }`}>
      {victoryFlash && (
        <div className="fixed inset-0 pointer-events-none z-50 victory-flash"></div>
      )}
      
      {battleMode && (
        <div className="fixed inset-0 pointer-events-none z-40" style={{
          border: '10px solid rgba(220, 38, 38, 0.8)',
          animation: 'battle-pulse 1s ease-in-out infinite',
          boxShadow: 'inset 0 0 100px rgba(220, 38, 38, 0.3)'
        }}></div>
      )}
      
      {playerFlash && (
        <div className="fixed inset-0 pointer-events-none z-45 damage-flash-player"></div>
      )}
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&display=swap');
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        @keyframes screen-shake {
          0%, 100% { transform: translate(0, 0); }
          10% { transform: translate(-5px, -5px); }
          20% { transform: translate(5px, 5px); }
          30% { transform: translate(-5px, 5px); }
          40% { transform: translate(5px, -5px); }
          50% { transform: translate(-5px, -5px); }
          60% { transform: translate(5px, 5px); }
          70% { transform: translate(-5px, 5px); }
          80% { transform: translate(5px, -5px); }
          90% { transform: translate(-5px, 0); }
        }
        @keyframes battle-shake {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(-4px, -2px); }
          50% { transform: translate(4px, 2px); }
          75% { transform: translate(-3px, -1px); }
        }
        @keyframes battle-pulse {
          0%, 100% { 
            box-shadow: 0 0 40px rgba(220, 38, 38, 0.8), inset 0 0 60px rgba(220, 38, 38, 0.3);
            border-color: rgba(220, 38, 38, 0.9);
          }
          50% { 
            box-shadow: 0 0 80px rgba(220, 38, 38, 1), inset 0 0 80px rgba(220, 38, 38, 0.5);
            border-color: rgba(220, 38, 38, 1);
          }
        }
        @keyframes damage-flash-red {
          0% { background-color: transparent; }
          50% { background-color: rgba(220, 38, 38, 0.95); }
          100% { background-color: transparent; }
        }
        @keyframes damage-flash-player {
          0% { background-color: transparent; }
          50% { background-color: rgba(239, 68, 68, 0.9); }
          100% { background-color: transparent; }
        }
        @keyframes victory-flash {
          0% { opacity: 0; background-color: white; }
          50% { opacity: 0.9; background-color: white; }
          100% { opacity: 0; background-color: white; }
        }
        @keyframes boss-entrance {
          0% { transform: scale(0.5) translateY(-50px); opacity: 0; }
          60% { transform: scale(1.1) translateY(0); opacity: 1; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        @keyframes hp-bar-pulse {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(1.1); }
        }
        .screen-shake {
          animation: screen-shake 0.5s ease-in-out;
        }
        .battle-shake {
          animation: battle-shake 0.25s ease-out;
        }
        .battle-border {
          animation: battle-pulse 1s ease-in-out infinite;
          border: 8px solid rgba(220, 38, 38, 0.8) !important;
          padding: 20px;
        }
        .damage-flash-boss {
          animation: damage-flash-red 0.2s ease-in-out;
        }
        .damage-flash-player {
          animation: damage-flash-player 0.2s ease-in-out;
        }
        .victory-flash {
          animation: victory-flash 0.4s ease-out;
        }
        .boss-enter {
          animation: boss-entrance 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
        .hp-pulse {
          animation: hp-bar-pulse 0.5s ease-in-out;
        }
      `}</style>



      <div className="absolute inset-0 bg-gradient-to-b from-red-950 via-black to-purple-950 opacity-60"></div>
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-black to-black opacity-80"></div>
      <div className="absolute inset-0" style={{
        backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(139, 0, 0, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(75, 0, 130, 0.1) 0%, transparent 50%)',
        animation: 'pulse-glow 8s ease-in-out infinite'
      }}></div>
      
      {!hero ? (
        <div className="relative z-10 p-6">
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-6xl font-black text-red-400 mb-4">Loading...</h1>
            <p className="text-gray-400">Preparing your journey...</p>
          </div>
        </div>
      ) : (
      
      <div className="relative z-10 p-6">
        <div className={`max-w-6xl mx-auto rounded-xl transition-all`}>
          <header className="text-center mb-8">
            <h1 className="text-6xl font-black text-red-400 mb-2 tracking-wider" style={{fontFamily: 'Cinzel, serif', textShadow: '0 0 30px rgba(220, 38, 38, 0.8), 0 0 60px rgba(139, 0, 0, 0.5)', letterSpacing: '0.15em'}}>
              CURSE OF KNOWLEDGE
            </h1>
            <p className="text-gray-400 text-sm mb-4 italic">"Study or be consumed by the abyss..."</p>
            
            <div className={`bg-gradient-to-br ${getCardStyle(hero.class, currentDay).bg} rounded-xl p-6 max-w-2xl mx-auto relative overflow-hidden ${getCardStyle(hero.class, currentDay).glow}`} style={{border: getCardStyle(hero.class, currentDay).border}}>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white opacity-15 pointer-events-none" style={{fontSize: '20rem', lineHeight: 1}}>
                {getCardStyle(hero.class, currentDay).emblem}
              </div>
              
              <div className="relative z-10">
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-5xl">{getCardStyle(hero.class, currentDay).emblem}</div>
                    <div className="text-right">
                      <p className="text-xs text-white text-opacity-70 uppercase tracking-wide">{GAME_CONSTANTS.DAY_NAMES[currentDay - 1].name}</p>
<p className="text-sm text-white text-opacity-80">Progress: Day {playerProgressDay}/7</p>
                      <p className="text-2xl font-bold text-white">Lvl {level}</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-white leading-tight">{hero.name}</p>
                    <p className="text-lg text-white text-opacity-90">{hero.title} {hero.class.name}</p>
                  </div>
                </div>
                
                <div className="mb-4 bg-black bg-opacity-40 rounded-lg p-3 border border-white border-opacity-20">
                  <div className="flex justify-between text-sm text-white mb-2">
                    <span className="flex items-center gap-2 font-bold"><Trophy size={16}/>EXPERIENCE</span>
                    <span className="font-bold">{xp} / {level * GAME_CONSTANTS.XP_PER_LEVEL}</span>
                  </div>
                  <div className="bg-black bg-opacity-50 rounded-full h-4 overflow-hidden">
                    <div className="bg-gradient-to-r from-yellow-500 to-orange-400 h-4 rounded-full transition-all duration-300 shadow-lg" style={{width: `${(xp % GAME_CONSTANTS.XP_PER_LEVEL) / GAME_CONSTANTS.XP_PER_LEVEL * 100}%`}}></div>
                  </div>
                  <p className="text-xs text-white text-opacity-60 mt-1 text-right">{GAME_CONSTANTS.XP_PER_LEVEL - (xp % GAME_CONSTANTS.XP_PER_LEVEL)} XP to next level</p>
                </div>
                
                {skipCount > 0 && (
                  <div className={`mb-4 rounded-lg p-3 border-2 ${
                    skipCount >= 3 ? 'bg-black border-red-600 animate-pulse' : 
                    skipCount >= 2 ? 'bg-red-950 bg-opacity-50 border-red-700' : 
                    'bg-gray-900 bg-opacity-50 border-red-800'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Skull className="text-red-500" size={20}/>
                        <span className="font-bold text-red-400 uppercase tracking-wide">
                          {skipCount === 3 ? '☠️ FINAL WARNING ☠️' : 'Curse Progress'}
                        </span>
                      </div>
                      <span className="text-2xl font-bold text-red-400">{skipCount}/4</span>
                    </div>
                    {skipCount === 3 && (
                      <p className="text-xs text-red-300 mt-2 italic">One more skip and you die. No mercy.</p>
                    )}
                    {consecutiveDays > 0 && skipCount > 0 && (
                      <p className="text-xs text-green-400 mt-2">
                        🙏 Redemption: {consecutiveDays}/{GAME_CONSTANTS.SKIP_REDEMPTION_DAYS} days
                      </p>
                    )}
                  </div>
                )}
                
                {curseLevel > 0 && (
  <div className={`mb-4 rounded-lg p-3 border-2 animate-pulse ${
    curseLevel === 3 ? 'bg-red-950 bg-opacity-90 border-red-500' :
    curseLevel === 2 ? 'bg-purple-950 bg-opacity-80 border-purple-500' :
    'bg-purple-950 bg-opacity-70 border-purple-600'
  }`}>
    <div className="flex items-center gap-2">
      <span className="text-2xl">
        {curseLevel === 3 ? '☠️' : curseLevel === 2 ? '🌑🌑' : '🌑'}
      </span>
      <div>
        <p className={`font-bold uppercase ${
          curseLevel === 3 ? 'text-red-300' : 'text-purple-300'
        }`}>
          {curseLevel === 3 ? 'CONDEMNED' : curseLevel === 2 ? 'DEEPLY CURSED' : 'CURSED'}
        </p>
        <p className={`text-xs ${
          curseLevel === 3 ? 'text-red-400' : 'text-purple-400'
        }`}>
          {curseLevel === 3 ? '90% XP penalty • One failure from death' :
           curseLevel === 2 ? '75% XP penalty • Enemies hit harder' :
           '50% XP penalty'}
        </p>
      </div>
    </div>
  </div>
)}
                
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-black bg-opacity-40 rounded-lg p-3 border border-red-500 border-opacity-30">
                    <div className="flex items-center gap-2 mb-1">
                      <Heart size={16} className="text-red-400"/>
                      <span className="text-xs text-white text-opacity-70">HP</span>
                    </div>
                    <p className="text-xl font-bold text-white">{hp}/{getMaxHp()}</p>
                    <div className="bg-black bg-opacity-30 rounded-full h-2 overflow-hidden mt-1">
                      <div className="bg-red-500 h-2 rounded-full transition-all duration-300" style={{width: `${(hp / getMaxHp()) * 100}%`}}></div>
                    </div>
                  </div>
                  
                  <div className="bg-black bg-opacity-40 rounded-lg p-3 border border-cyan-500 border-opacity-30">
                    <div className="flex items-center gap-2 mb-1">
                      <Zap size={16} className="text-cyan-400"/>
                      <span className="text-xs text-white text-opacity-70">SP</span>
                    </div>
                    <p className="text-xl font-bold text-white">{stamina}/{getMaxStamina()}</p>
                    <div className="bg-black bg-opacity-30 rounded-full h-2 overflow-hidden mt-1">
                      <div className="bg-cyan-500 h-2 rounded-full transition-all duration-300" style={{width: `${(stamina / getMaxStamina()) * 100}%`}}></div>
                    </div>
                  </div>
                  
                  <div className="bg-black bg-opacity-40 rounded-lg p-3 border border-orange-500 border-opacity-30">
                    <div className="flex items-center gap-2 mb-1">
                      <Sword size={16} className="text-orange-400"/>
                      <span className="text-xs text-white text-opacity-70">POWER</span>
                    </div>
                    <p className="text-xl font-bold text-white">{getBaseAttack() + weapon + (level - 1) * 2}</p>
                    <p className="text-xs text-white text-opacity-50">damage per hit</p>
                  </div>
                  
                  <div className="bg-black bg-opacity-40 rounded-lg p-3 border border-blue-500 border-opacity-30">
                    <div className="flex items-center gap-2 mb-1">
                      <Shield size={16} className="text-blue-400"/>
                      <span className="text-xs text-white text-opacity-70">RESILIENCE</span>
                    </div>
                    <p className="text-xl font-bold text-white">{Math.floor(((getBaseDefense() + armor) / ((getBaseDefense() + armor) + 50)) * 100)}%</p>
                    <p className="text-xs text-white text-opacity-50">damage resist</p>
                  </div>
                </div>
                
                <div className={`grid grid-cols-2 gap-3 pt-3 border-t-2 border-white border-opacity-20`}>
                  <button 
                    onClick={useHealth}
                    disabled={healthPots === 0 || hp >= getMaxHp()}
                    className="bg-black bg-opacity-40 rounded-lg p-3 border border-red-500 border-opacity-30 hover:bg-opacity-60 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Heart className="text-red-400" size={20}/>
                        <div className="text-left">
                          <p className="text-sm text-white font-bold">Health Potion</p>
                          <p className="text-xs text-white text-opacity-60">+{GAME_CONSTANTS.HEALTH_POTION_HEAL} HP</p>
                        </div>
                      </div>
                      <span className="text-xl font-bold text-white">{healthPots}</span>
                    </div>
                  </button>
                  
                  <button 
                    onClick={() => {
                      if (staminaPots > 0 && stamina < getMaxStamina()) {
                        setStaminaPots(s => s - 1);
                        setStamina(s => Math.min(getMaxStamina(), s + GAME_CONSTANTS.STAMINA_POTION_RESTORE));
                        addLog(`⚡ Used Stamina Potion! +${GAME_CONSTANTS.STAMINA_POTION_RESTORE} SP`);
                      }
                    }}
                    disabled={staminaPots === 0 || stamina >= getMaxStamina()}
                    className="bg-black bg-opacity-40 rounded-lg p-3 border border-cyan-500 border-opacity-30 hover:bg-opacity-60 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Zap className="text-cyan-400" size={20}/>
                        <div className="text-left">
                          <p className="text-sm text-white font-bold">Stamina Potion</p>
                          <p className="text-xs text-white text-opacity-60">+{GAME_CONSTANTS.STAMINA_POTION_RESTORE} SP</p>
                        </div>
                      </div>
                      <span className="text-xl font-bold text-white">{staminaPots}</span>
                    </div>
                  </button>
                  
                 {curseLevel > 0 && (
  <button 
    onClick={useCleanse}
    disabled={cleansePots === 0}
                      className="bg-black bg-opacity-40 rounded-lg p-3 border border-purple-500 border-opacity-30 hover:bg-opacity-60 transition-all disabled:opacity-40 disabled:cursor-not-allowed col-span-2 animate-pulse"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">✨</span>
                          <div className="text-left">
                            <p className="text-sm text-white font-bold">Cleanse Potion</p>
                            <p className="text-xs text-purple-300">Remove Curse</p>
                          </div>
                        </div>
                        <span className="text-xl font-bold text-purple-400">{cleansePots}</span>
                      </div>
                    </button>
                  )}
                </div>
                {canCustomize && (
  <div className="pt-3 border-t-2 border-white border-opacity-20 mt-3">
    <button 
      onClick={() => setShowCustomizeModal(true)}
      className="w-full bg-blue-600 hover:bg-blue-700 px-4 py-3 rounded-lg transition-all font-bold text-white"
    >
      Customize Your Hero!
    </button>
  </div>
)}
              </div>
            </div>
          </header>

          <nav className="flex gap-2 mb-6 justify-center flex-wrap">
            {[
              {id:'quest', icon:Sword, label:'Quests'},
              {id:'planner', icon:Calendar, label:'Weekly Planner'},
              {id:'calendar', icon:Calendar, label:'Calendar'},
              {id:'study', icon:Calendar, label:'Study'},
              {id:'inv', icon:Heart, label:'Inventory'},
              {id:'grave', icon:Skull, label:'The Consumed'},
              {id:'hall', icon:Trophy, label:'The Liberated'},
              {id:'progress', icon:Trophy, label:'Progress'},
            ].map(t => (
              <button 
                key={t.id} 
                onClick={() => setActiveTab(t.id)} 
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  activeTab === t.id 
                    ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/50' 
                    : 'bg-black bg-opacity-50 text-yellow-300 hover:bg-opacity-70'
                }`}
              >
                <t.icon size={18}/>{t.label}
              </button>
            ))}
          </nav>

          {showDebug && (
            <div className="bg-purple-950 bg-opacity-50 border-2 border-purple-600 rounded-xl p-4 mb-6">
              <h3 className="text-lg font-bold text-purple-300 mb-3 text-center">Debug / Testing Panel</h3>
              
              <div className="mb-3">
                <h4 className="text-sm font-semibold text-purple-200 mb-2">⚡ Stats & Resources</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <button onClick={() => { setHp(30); addLog('Debug: HP set to 30'); }} className="bg-orange-700 hover:bg-orange-600 px-3 py-2 rounded text-sm transition-all">Set HP to 30</button>
                  <button onClick={() => { setHp(getMaxHp()); addLog('Debug: Full heal'); }} className="bg-green-700 hover:bg-green-600 px-3 py-2 rounded text-sm transition-all">Full Heal</button>
                  <button onClick={() => { setXp(x => x + 50); addLog('Debug: +50 XP'); }} className="bg-yellow-700 hover:bg-yellow-600 px-3 py-2 rounded text-sm transition-all">+50 XP</button>
                  <button onClick={() => { setXp(x => x + 100); addLog('Debug: +100 XP (craft cost)'); }} className="bg-yellow-800 hover:bg-yellow-700 px-3 py-2 rounded text-sm transition-all">+100 XP</button>
                </div>
              </div>

              <div className="mb-3">
                <h4 className="text-sm font-semibold text-purple-200 mb-2">🎒 Items & Equipment</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  <button onClick={() => { setHealthPots(h => h + 3); setStaminaPots(s => s + 3); addLog('Debug: +3 of each potion'); }} className="bg-green-700 hover:bg-green-600 px-3 py-2 rounded text-sm transition-all">+3 Potions</button>
                  <button onClick={() => { setCleansePots(c => c + 1); addLog('Debug: +1 Cleanse Potion'); }} className="bg-purple-700 hover:bg-purple-600 px-3 py-2 rounded text-sm transition-all">+1 Cleanse Potion</button>
                  <button onClick={() => { setWeapon(w => w + 10); setArmor(a => a + 10); addLog('Debug: +10 weapon/armor'); }} className="bg-purple-700 hover:bg-purple-600 px-3 py-2 rounded text-sm transition-all">+10 Weapon/Armor</button>
                </div>
              </div>

              <div className="mb-3">
  <h4 className="text-sm font-semibold text-purple-200 mb-2">⚔️ Combat & Progression</h4>
  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
    <button onClick={() => spawnRegularEnemy(false, 0, 1)} className="bg-orange-700 hover:bg-orange-600 px-3 py-2 rounded text-sm transition-all">Spawn Regular Enemy</button>
    <button onClick={() => {
      const numEnemies = Math.floor(Math.random() * 3) + 2;
      setWaveCount(numEnemies);
      addLog(`⚠️ DEBUG WAVE: ${numEnemies} enemies`);
      spawnRegularEnemy(true, 1, numEnemies);
    }} className="bg-red-700 hover:bg-red-600 px-3 py-2 rounded text-sm transition-all">Spawn Wave (2-4)</button>
    <button onClick={() => { 
      setBattleType('elite'); 
      spawnRandomMiniBoss(true); 
    }} className="bg-red-700 hover:bg-red-600 px-3 py-2 rounded text-sm transition-all">Spawn Elite Boss</button>
    <button onClick={() => {
      setBattleType('final');
      const bossHealth = 300;
      const bossNameGenerated = makeBossName();
      setBossName(bossNameGenerated);
      setBossHp(bossHealth);
      setBossMax(bossHealth);
      setShowBoss(true);
      setBattling(true);
      setBattleMode(true);
      setIsFinalBoss(true);
      setCanFlee(false);
      addLog(`👹 DEBUG: ${bossNameGenerated} - THE UNDYING!`);
    }} className="bg-purple-700 hover:bg-purple-600 px-3 py-2 rounded text-sm transition-all">Spawn Final Boss</button>
    <button onClick={() => { 
      const currentIndex = classes.findIndex(c => c.name === hero.class.name); 
      const nextIndex = (currentIndex + 1) % classes.length; 
      setHero(prev => ({ ...prev, class: classes[nextIndex] })); 
      addLog(`Debug: Changed to ${classes[nextIndex].name}`); 
    }} className="bg-blue-700 hover:bg-blue-600 px-3 py-2 rounded text-sm transition-all">Change Class</button>
    <button onClick={() => { 
      setSkipCount(s => Math.min(3, s + 1)); 
      addLog('Debug: +1 skip count'); 
    }} className="bg-red-900 hover:bg-red-800 px-3 py-2 rounded text-sm transition-all">+1 Skip Count</button>
  </div>
</div>

              <div className="mb-3">
  <h4 className="text-sm font-semibold text-purple-200 mb-2">🌙 Curse Level</h4>
  <div className="grid grid-cols-4 gap-2">
    <button onClick={() => { setCurseLevel(0); addLog('Debug: Curse cleared'); }} className="bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded text-sm transition-all">Clear</button>
    <button onClick={() => { setCurseLevel(1); addLog('Debug: Cursed (Lvl 1)'); }} className="bg-purple-800 hover:bg-purple-700 px-3 py-2 rounded text-sm transition-all">Lvl 1</button>
    <button onClick={() => { setCurseLevel(2); addLog('Debug: Deep Curse (Lvl 2)'); }} className="bg-purple-900 hover:bg-purple-800 px-3 py-2 rounded text-sm transition-all">Lvl 2</button>
    <button onClick={() => { setCurseLevel(3); addLog('Debug: CONDEMNED (Lvl 3)'); }} className="bg-red-900 hover:bg-red-800 px-3 py-2 rounded text-sm transition-all">Lvl 3</button>
  </div>
</div>

              <div>
  <h4 className="text-sm font-semibold text-purple-200 mb-2">🗑️ Data Management</h4>
  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
    <button onClick={() => { setLog([]); addLog('Debug: Chronicle cleared'); }} className="bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded text-sm transition-all">Clear Chronicle</button>
    <button onClick={() => { setGraveyard([]); setHeroes([]); addLog('Debug: Consumed tab cleared'); }} className="bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded text-sm transition-all">Clear Consumed</button>
    <button onClick={() => { if (window.confirm('Clear ALL achievements & history?')) { setGraveyard([]); setHeroes([]); setStudyStats({ totalMinutesToday: 0, totalMinutesWeek: 0, sessionsToday: 0, longestStreak: 0, currentStreak: 0, tasksCompletedToday: 0, deepWorkSessions: 0, earlyBirdDays: 0, perfectDays: 0, weeklyHistory: [] }); addLog('Debug: Achievements cleared'); } }} className="bg-purple-700 hover:bg-purple-600 px-3 py-2 rounded text-sm transition-all">Clear Achievements</button>
    <button onClick={() => { if (window.confirm('Clear all calendar tasks?')) { setCalendarTasks({}); addLog('Debug: Calendar cleared'); } }} className="bg-green-700 hover:bg-green-600 px-3 py-2 rounded text-sm transition-all">Clear Calendar</button>
    <button onClick={() => { if (window.confirm('Clear weekly planner?')) { setWeeklyPlan({ Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: [], Sunday: [] }); addLog('Debug: Planner cleared'); } }} className="bg-blue-700 hover:bg-blue-600 px-3 py-2 rounded text-sm transition-all">Clear Planner</button>
    <button onClick={() => { localStorage.removeItem('fantasyStudyQuest'); alert('LocalStorage cleared! Refresh the page to start fresh.'); }} className="bg-orange-700 hover:bg-orange-600 px-3 py-2 rounded text-sm transition-all">Clear LocalStorage</button>
  </div>
  
  <button 
    onClick={() => { 
      if (window.confirm('⚠️ FULL RESET - Delete EVERYTHING and start completely fresh? This cannot be undone!')) {
        const newHero = makeName();
        setHero(newHero);
        setCanCustomize(true);
        setCurrentDay(1);
        setPlayerProgressDay(1);
        setHasStarted(false);
        setHp(GAME_CONSTANTS.MAX_HP);
        setStamina(GAME_CONSTANTS.MAX_STAMINA);
        setXp(0);
        setLevel(1);
        setHealthPots(0);
        setStaminaPots(0);
        setCleansePots(0);
        setWeapon(0);
        setArmor(0);
        setTasks([]);
        setActiveTask(null);
        setTimer(0);
        setRunning(false);
        setShowPomodoro(false);
        setPomodoroTask(null);
        setWeeklyPlan({ Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: [], Sunday: [] });
        setCalendarTasks({});
        setShowBoss(false);
        setBattling(false);
        setLog([]);
        setGraveyard([]);
        setHeroes([]);
        setSkipCount(0);
        setConsecutiveDays(0);
        setLastPlayedDate(null);
        setMiniBossCount(0);
        setStudyStats({ totalMinutesToday: 0, totalMinutesWeek: 0, sessionsToday: 0, longestStreak: 0, currentStreak: 0, tasksCompletedToday: 0, deepWorkSessions: 0, earlyBirdDays: 0, perfectDays: 0, weeklyHistory: [] });
        localStorage.removeItem('fantasyStudyQuest');
        addLog('🔄 FULL RESET - Everything cleared!');
        setActiveTab('quest');
      }
    }}
    className="w-full mt-3 bg-red-900 hover:bg-red-800 px-4 py-3 rounded text-sm font-bold transition-all border-2 border-red-500 animate-pulse"
  >
    🔄 FULL RESET - Delete Everything
  </button>
</div>

              <p className="text-xs text-gray-400 mt-3 italic">
  Current: {hero.class.name} • Day {currentDay} • HP: {hp} • SP: {stamina} • Level: {level} • XP: {xp} • Skips: {skipCount} • Curse Lvl: {curseLevel} • Cleanse: {cleansePots}
</p>
            </div>
          )}



          {activeTab === 'quest' && (
            <div className="space-y-6">
              {!hasStarted ? (
                <div className="bg-black bg-opacity-50 rounded-xl p-8 text-center border-2 border-red-900">
                  <h2 className="text-3xl font-bold text-yellow-400 mb-2">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </h2>
                  <p className="text-lg text-gray-300 mb-2">{new Date().toLocaleDateString('en-US', { year: 'numeric' })}</p>
                  <p className="text-sm text-gray-400 italic mb-4">"Begin your trials for today..."</p>
                  <p className="mb-4 text-sm text-gray-400">⚠️ Start before {GAME_CONSTANTS.LATE_START_HOUR} AM or lose {GAME_CONSTANTS.LATE_START_PENALTY} HP</p>
                  <button onClick={start} className="bg-yellow-500 text-black px-8 py-3 rounded-lg font-bold text-xl hover:bg-yellow-400 transition-all shadow-lg shadow-yellow-500/50">START DAY</button>
                </div>
              ) : (
                <>
                  <div className="bg-black bg-opacity-50 rounded-xl p-6 border-2 border-red-900">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h2 className="text-2xl font-bold text-red-400">Trials of the Cursed</h2>
                        <p className="text-sm text-gray-400">{GAME_CONSTANTS.DAY_NAMES[currentDay - 1].name} • XP Rate: {Math.floor(GAME_CONSTANTS.XP_MULTIPLIERS[currentDay - 1] * 100)}%</p>
                      </div>
                      <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-red-600 px-4 py-2 rounded-lg hover:bg-red-700 transition-all">
                        <Plus size={20}/>Accept Trial
                      </button>
                    </div>
                    
                    {tasks.length === 0 ? (
                      <div className="text-center py-8 text-gray-400">
                        <p>No trials yet. Accept your first trial to begin.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {[...tasks].sort((a, b) => {
  // Important tasks first
  if (a.priority === 'important' && b.priority !== 'important') return -1;
  if (a.priority !== 'important' && b.priority === 'important') return 1;
  return 0;
}).map(t => (
  <div key={t.id} className={`rounded-lg p-4 border-2 ${
    t.done 
      ? 'bg-gray-800 border-green-700 opacity-60' 
      : t.priority === 'important'
        ? 'bg-gradient-to-r from-yellow-900/30 to-gray-800 border-yellow-500 shadow-lg shadow-yellow-500/20'
        : 'bg-gray-800 border-gray-700'
  }`}>
    <div className="flex items-center gap-3">
      {t.priority === 'important' && !t.done && (
        <span className="text-2xl">⭐</span>
      )}
      <div className="flex-1">
        <p className={t.done ? 'line-through text-gray-500' : 'text-white font-medium text-lg'}>
          {t.title}
        </p>
        <p className="text-sm text-gray-400 mt-1">
          {t.priority === 'important' ? '⭐ IMPORTANT • 1.25x XP' : '📋 ROUTINE • 1.0x XP'}
        </p>
      </div>
      
      {!t.done && (
        <div className="flex gap-2">
          <button 
            onClick={() => {
              setPomodoroTask(t);
              setShowPomodoro(true);
              setPomodoroTimer(25 * 60);
              setPomodorosCompleted(0);
              setIsBreak(false);
              setPomodoroRunning(true);
              addLog(`🍅 Starting focus session: ${t.title}`);
            }} 
            className="bg-purple-600 px-3 py-1 rounded hover:bg-purple-700 transition-all flex items-center gap-1"
          >
            🍅 Focus
          </button>
          <button 
            onClick={() => complete(t.id)} 
            className="bg-green-600 px-4 py-1 rounded font-bold hover:bg-green-700 transition-all flex items-center gap-1"
          >
            ✓ Complete
          </button>
        </div>
      )}
      {t.done && (<span className="text-green-400 font-bold flex items-center gap-1">✓ Done</span>)}
    </div>
  </div>
))}   
                      </div>
                    )}
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                 <button 
  onClick={miniBoss} 
  disabled={
    eliteBossDefeatedToday || 
    tasks.length < 5 || 
    tasks.filter(t => t.done).length < tasks.length * 0.9
  } 
  className="bg-red-900 px-6 py-4 rounded-xl font-bold text-xl hover:bg-red-800 transition-all shadow-lg shadow-red-900/50 border-2 border-red-700 disabled:bg-gray-700 disabled:cursor-not-allowed disabled:shadow-none disabled:border-gray-600"
>
  Face the Darkness
  {eliteBossDefeatedToday ? (
    <div className="text-sm font-normal mt-1 text-green-400">✓ Today's trial complete</div>
  ) : tasks.length < 5 ? (
    <div className="text-sm font-normal mt-1 text-red-400">Need at least 5 tasks ({tasks.length}/5)</div>
  ) : tasks.length > 0 ? (
    <div className="text-sm font-normal mt-1">
      {Math.floor((tasks.filter(t => t.done).length / tasks.length) * 100)}% complete - need 90%
      <div className="text-xs text-gray-400 mt-1">
        ({tasks.filter(t => t.done).length}/{tasks.length} tasks done)
      </div>
    </div>
  ) : null}
</button>
                 <button 
  onClick={finalBoss} 
  disabled={
    new Date().getDay() !== 0 || 
    tasks.length === 0 || 
    tasks.filter(t => t.done).length < tasks.length
  } 
  className="bg-purple-900 px-6 py-4 rounded-xl font-bold text-xl hover:bg-purple-800 transition-all shadow-lg shadow-purple-900/50 border-2 border-red-500 disabled:bg-gray-700 disabled:cursor-not-allowed disabled:shadow-none disabled:border-gray-600"
>
  THE FINAL RECKONING
  {new Date().getDay() !== 0 ? (
    <div className="text-sm font-normal mt-1">🔒 Only available on Sunday (Endday)</div>
  ) : tasks.length > 0 ? (
    <div className="text-sm font-normal mt-1">
      ({tasks.filter(t => t.done).length}/{tasks.length} required)
      <div className="text-xs text-gray-400 mt-1">Day {playerProgressDay} difficulty</div>
    </div>
  ) : null}
</button>
                  </div>
                  
                  <div className="bg-black bg-opacity-50 rounded-xl p-4 border border-gray-800">
                    <h3 className="text-lg font-bold text-red-400 mb-2">Chronicle of Events</h3>
                    {log.length === 0 ? (<p className="text-sm text-gray-500 italic">The journey begins...</p>) : (<div className="space-y-1">{log.map((l, i) => (<p key={i} className="text-sm text-gray-300">{l}</p>))}</div>)}
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'planner' && (
            <div className="bg-black bg-opacity-50 rounded-xl p-6 border-2 border-blue-900">
              <h2 className="text-2xl font-bold text-blue-400 mb-2 text-center">📅 WEEKLY PLANNER</h2>
              <p className="text-gray-400 text-sm mb-6 italic text-center">"Plan your studies, conquer your week..."</p>
              
              <div className="grid gap-4">
                {Object.keys(weeklyPlan).map(day => (
                  <div key={day} className="bg-gray-800 rounded-lg p-4 border-2 border-gray-700">
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-blue-300">{day}</h3>
                        <p className="text-xs">
  {(() => {
    const today = new Date();
    const todayDayName = today.toLocaleDateString('en-US', { weekday: 'long' });
    if (day === todayDayName) {
      return <span className="text-yellow-400 font-bold">Today</span>;
    } else {
      return <span className="text-gray-400">{getNextDayOfWeek(day).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>;
    }
  })()}
</p>
                      </div>
                      <button onClick={() => { setSelectedDay(day); setShowPlanModal(true); }} className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm transition-all flex items-center gap-1">
                        <Plus size={16}/> Add Task
                      </button>
                    </div>
                    
                    {weeklyPlan[day].length === 0 ? (
                      <p className="text-gray-500 text-sm italic">No tasks planned</p>
                    ) : (
                      <div className="space-y-2">
                      {[...weeklyPlan[day]].sort((a, b) => {
  if (a.priority === 'important' && b.priority !== 'important') return -1;
  if (a.priority !== 'important' && b.priority === 'important') return 1;
  return 0;
}).map((item) => {
  const idx = weeklyPlan[day].indexOf(item);
  return (
    <div 
      key={idx} 
      className={`rounded p-3 flex justify-between items-start ${
        item.completed 
          ? 'bg-gray-900 opacity-60' 
          : item.priority === 'important'
            ? 'bg-gradient-to-r from-yellow-900/30 to-gray-900 border border-yellow-500'
            : 'bg-gray-900'
      }`}
    >
      <div className="flex-1 flex items-start gap-2">
        {item.priority === 'important' && !item.completed && (
          <span className="text-xl">⭐</span>
        )}
        <div>
          <p className={`font-medium ${item.completed ? 'line-through text-gray-500' : 'text-white'}`}>
            {item.completed && '✓ '}{item.title}
          </p>
          {item.priority === 'important' && (
            <p className="text-xs text-yellow-400 mt-1">IMPORTANT • 1.25x XP</p>
          )}
        </div>
      </div>
      <div className="flex gap-2 ml-2">
        <button 
          onClick={() => {
            if (window.confirm(`Delete "${item.title}" from weekly plan? This will also remove it from all future calendar dates.`)) {
              setWeeklyPlan(prev => ({
                ...prev,
                [day]: prev[day].filter((_, i) => i !== idx)
              }));
              
              setCalendarTasks(prev => {
                const updated = { ...prev };
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                
                Object.keys(updated).forEach(dateKey => {
                  const [year, month, dayNum] = dateKey.split('-').map(Number);
                  const date = new Date(year, month - 1, dayNum);
                  const dateDayName = date.toLocaleDateString('en-US', { weekday: 'long' });
                  
                  if (dateDayName === day && date >= today) {
                    updated[dateKey] = updated[dateKey].filter(t => 
                      !(t.title === item.title && t.fromPlanner === true)
                    );
                    if (updated[dateKey].length === 0) {
                      delete updated[dateKey];
                    }
                  }
                });
                return updated;
              });
              
              addLog(`🗑️ Deleted "${item.title}" from ${day} plan and future calendar dates`);
            }
          }}
          className="text-red-400 hover:text-red-300"
        >
          <X size={16}/>
        </button>
      </div>
    </div>
  );
})}
    
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'calendar' && (
            <div className="bg-black bg-opacity-50 rounded-xl p-6 border-2 border-green-900">
              <h2 className="text-2xl font-bold text-green-400 mb-2 text-center">📆 MONTHLY CALENDAR</h2>
              <p className="text-gray-400 text-sm mb-6 italic text-center">"Track your progress across time..."</p>
              
              <div className="flex justify-between items-center mb-6">
                <button onClick={() => { if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1); } else { setCurrentMonth(currentMonth - 1); } }} className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded transition-all">← Previous</button>
                <h3 className="text-2xl font-bold text-green-300">{new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long' })} {currentYear}</h3>
                <button onClick={() => { if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1); } else { setCurrentMonth(currentMonth + 1); } }} className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded transition-all">Next →</button>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="grid grid-cols-7 gap-2 mb-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (<div key={day} className="text-center text-gray-400 font-bold text-sm py-2">{day}</div>))}
                </div>
                
                <div className="grid grid-cols-7 gap-2">
                  {(() => {
                    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
                    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
                    const today = new Date();
                    const isCurrentMonth = today.getMonth() === currentMonth && today.getFullYear() === currentYear;
                    const days = [];
                    for (let i = 0; i < firstDay; i++) { days.push(<div key={`empty-${i}`} className="aspect-square"></div>); }
                    for (let day = 1; day <= daysInMonth; day++) {
                      const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                      const dayTasks = calendarTasks[dateKey] || [];
                      const isToday = isCurrentMonth && today.getDate() === day;
                      const hasTasks = dayTasks.length > 0;
                      const completedTasks = dayTasks.filter(t => t.done).length;
                      const allDone = hasTasks && completedTasks === dayTasks.length;
                      days.push(
                        <button key={day} onClick={() => { setSelectedDate(dateKey); setShowCalendarModal(true); }} className={`aspect-square rounded-lg p-2 transition-all hover:scale-105 relative ${isToday ? 'bg-blue-600 border-2 border-blue-400 shadow-lg' : hasTasks ? allDone ? 'bg-green-700 border-2 border-green-500' : 'bg-yellow-700 border-2 border-yellow-500' : 'bg-gray-700 hover:bg-gray-600'}`}>
                          <div className="text-lg font-bold text-white">{day}</div>
                          {hasTasks && (<div className="text-xs text-white mt-1">{completedTasks}/{dayTasks.length}</div>)}
                          {isToday && (<div className="absolute top-0 right-0 w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>)}
                        </button>
                      );
                    }
                    return days;
                  })()}
                </div>
              </div>
              
              <div className="mt-4 flex flex-wrap gap-4 justify-center text-sm">
                <div className="flex items-center gap-2"><div className="w-4 h-4 bg-blue-600 border-2 border-blue-400 rounded"></div><span className="text-gray-300">Today</span></div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 bg-yellow-700 border-2 border-yellow-500 rounded"></div><span className="text-gray-300">Has Tasks (In Progress)</span></div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 bg-green-700 border-2 border-green-500 rounded"></div><span className="text-gray-300">All Tasks Complete</span></div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 bg-gray-700 rounded"></div><span className="text-gray-300">No Tasks</span></div>
              </div>
            </div>
          )}

          {activeTab === 'study' && (
  <div className="bg-black bg-opacity-50 rounded-xl p-6 border-2 border-purple-900">
    <h2 className="text-2xl font-bold text-purple-400 mb-2 text-center">📚 FLASHCARD STUDY</h2>
    <p className="text-gray-400 text-sm mb-6 italic text-center">"Master your knowledge, earn rewards..."</p>
    
    <div className="flex justify-between items-center mb-6">
      <div>
        <p className="text-lg text-gray-300">Your Decks: <span className="font-bold text-purple-400">{flashcardDecks.length}</span></p>
        <p className="text-sm text-gray-500">Study to earn XP and loot!</p>
      </div>
      <button 
        onClick={() => setShowDeckModal(true)}
        className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-all flex items-center gap-2"
      >
        <Plus size={20}/> New Deck
      </button>
    </div>
    
    {flashcardDecks.length === 0 ? (
      <div className="text-center py-12 bg-gray-800 rounded-lg border-2 border-gray-700">
        <div className="text-6xl mb-4">📚</div>
        <p className="text-gray-400 mb-2">No flashcard decks yet</p>
        <p className="text-sm text-gray-500">Create your first deck to start studying!</p>
      </div>
    ) : (
      <div className="space-y-4">
        {flashcardDecks.map((deck, idx) => (
          <div key={idx} className="bg-gray-800 rounded-lg p-4 border-2 border-purple-700">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-purple-300">{deck.name}</h3>
                <p className="text-sm text-gray-400">
                  {deck.cards.length} card{deck.cards.length !== 1 ? 's' : ''} • 
                  {deck.cards.filter(c => c.mastered).length} mastered
                </p>
              </div>
              <button
                onClick={() => {
                  if (window.confirm(`Delete deck "${deck.name}"?`)) {
                    setFlashcardDecks(prev => prev.filter((_, i) => i !== idx));
                    addLog(`🗑️ Deleted deck: ${deck.name}`);
                  }
                }}
                className="text-red-400 hover:text-red-300"
              >
                <X size={20}/>
              </button>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => {
                  if (deck.cards.length === 0) {
                    alert('Add some cards first!');
                    return;
                  }
                  setSelectedDeck(idx);
                  setCurrentCardIndex(0);
                  setIsFlipped(false);
                  setShowStudyModal(true);
                }}
                disabled={deck.cards.length === 0}
                className="flex-1 bg-purple-600 hover:bg-purple-700 py-2 rounded transition-all disabled:bg-gray-600 disabled:cursor-not-allowed"
              >
                📖 Study Deck
              </button>
              <button
                onClick={() => {
                  setSelectedDeck(idx);
                  setShowCardModal(true);
                }}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition-all"
              >
                ➕ Add Card
              </button>
            </div>
            
            {deck.cards.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-700">
                <p className="text-xs text-gray-500 mb-2">Cards in this deck:</p>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {deck.cards.map((card, cardIdx) => (
                    <div key={cardIdx} className="flex justify-between items-center text-sm bg-gray-900 rounded p-2">
                      <span className="text-gray-300 flex-1 truncate">
                        {card.mastered && '✓ '}{card.front}
                      </span>
                      <button
                        onClick={() => {
                          setFlashcardDecks(prev => prev.map((d, i) => 
                            i === idx ? {...d, cards: d.cards.filter((_, ci) => ci !== cardIdx)} : d
                          ));
                        }}
                        className="text-red-400 hover:text-red-300 ml-2"
                      >
                        <X size={14}/>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    )}
  </div>
)}

          {activeTab === 'progress' && (
            <div className="bg-black bg-opacity-50 rounded-xl p-6 border-2 border-yellow-900">
              <h2 className="text-2xl font-bold text-yellow-400 mb-2 text-center">STUDY PROGRESS</h2>
              <p className="text-gray-400 text-sm mb-6 italic text-center">"Track your journey to mastery..."</p>
              
              <div className="mb-6 bg-gradient-to-r from-blue-900 to-purple-900 rounded-xl p-6 border-2 border-blue-600">
                <h3 className="text-xl font-bold text-blue-300 mb-4 text-center">Today's Performance</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-black bg-opacity-40 rounded-lg p-4"><p className="text-sm text-gray-400">Study Time</p><p className="text-3xl font-bold text-blue-400">{studyStats.totalMinutesToday}</p><p className="text-xs text-gray-500">minutes</p></div>
                  <div className="bg-black bg-opacity-40 rounded-lg p-4"><p className="text-sm text-gray-400">Sessions</p><p className="text-3xl font-bold text-green-400">{studyStats.sessionsToday}</p><p className="text-xs text-gray-500">completed</p></div>
                  <div className="bg-black bg-opacity-40 rounded-lg p-4"><p className="text-sm text-gray-400">Tasks Done</p><p className="text-3xl font-bold text-yellow-400">{studyStats.tasksCompletedToday}</p><p className="text-xs text-gray-500">today</p></div>
                  <div className="bg-black bg-opacity-40 rounded-lg p-4"><p className="text-sm text-gray-400">Deep Work</p><p className="text-3xl font-bold text-purple-400">{studyStats.deepWorkSessions}</p><p className="text-xs text-gray-500">60+ min</p></div>
                </div>
              </div>
              
              <div className="mb-6 bg-gradient-to-r from-green-900 to-teal-900 rounded-xl p-6 border-2 border-green-600">
                <h3 className="text-xl font-bold text-green-300 mb-4 text-center">This Week</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-black bg-opacity-40 rounded-lg p-4"><p className="text-sm text-gray-400">Total Time</p><p className="text-3xl font-bold text-green-400">{studyStats.totalMinutesWeek}</p><p className="text-xs text-gray-500">minutes ({(studyStats.totalMinutesWeek / 60).toFixed(1)} hours)</p></div>
                  <div className="bg-black bg-opacity-40 rounded-lg p-4"><p className="text-sm text-gray-400">Current Streak</p><p className="text-3xl font-bold text-orange-400">{consecutiveDays}</p><p className="text-xs text-gray-500">days</p></div>
                  <div className="bg-black bg-opacity-40 rounded-lg p-4"><p className="text-sm text-gray-400">Perfect Days</p><p className="text-3xl font-bold text-yellow-400">{studyStats.perfectDays}</p><p className="text-xs text-gray-500">100% completion</p></div>
                </div>
                
                {studyStats.weeklyHistory.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Daily Study Time (Last 7 Days)</p>
                    <div className="flex items-end justify-between gap-2 h-32">
                      {studyStats.weeklyHistory.map((minutes, i) => {
                        const maxMinutes = Math.max(...studyStats.weeklyHistory, 60);
                        const height = (minutes / maxMinutes) * 100;
                        return (<div key={i} className="flex-1 flex flex-col items-center"><div className="w-full bg-gradient-to-t from-green-600 to-green-400 rounded-t transition-all duration-300" style={{ height: `${height}%`, minHeight: minutes > 0 ? '4px' : '0' }}></div><p className="text-xs text-gray-500 mt-1">{minutes}m</p></div>);
                      })}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="bg-gradient-to-r from-purple-900 to-pink-900 rounded-xl p-6 border-2 border-purple-600">
                <h3 className="text-xl font-bold text-purple-300 mb-4 text-center">Achievements</h3>
                <div className="space-y-3">
                  <div className={`flex items-center gap-3 p-3 rounded-lg ${studyStats.earlyBirdDays > 0 ? 'bg-yellow-900 bg-opacity-50' : 'bg-gray-800 opacity-50'}`}><span className="text-2xl">🌅</span><div className="flex-1"><p className="font-bold text-white">Early Bird</p><p className="text-xs text-gray-400">Start before 8 AM</p></div><span className="text-lg font-bold text-yellow-400">{studyStats.earlyBirdDays}</span></div>
                  <div className={`flex items-center gap-3 p-3 rounded-lg ${studyStats.deepWorkSessions > 0 ? 'bg-purple-900 bg-opacity-50' : 'bg-gray-800 opacity-50'}`}><span className="text-2xl">🧠</span><div className="flex-1"><p className="font-bold text-white">Deep Work Master</p><p className="text-xs text-gray-400">60+ min without pause</p></div><span className="text-lg font-bold text-purple-400">{studyStats.deepWorkSessions}</span></div>
                  <div className={`flex items-center gap-3 p-3 rounded-lg ${consecutiveDays >= 7 ? 'bg-green-900 bg-opacity-50' : 'bg-gray-800 opacity-50'}`}><span className="text-2xl">🔥</span><div className="flex-1"><p className="font-bold text-white">Week Warrior</p><p className="text-xs text-gray-400">7-day streak</p></div><span className="text-lg font-bold text-green-400">{consecutiveDays >= 7 ? '✓' : `${consecutiveDays}/7`}</span></div>
                  <div className={`flex items-center gap-3 p-3 rounded-lg ${studyStats.totalMinutesWeek >= 600 ? 'bg-blue-900 bg-opacity-50' : 'bg-gray-800 opacity-50'}`}><span className="text-2xl">⏰</span><div className="flex-1"><p className="font-bold text-white">10 Hour Club</p><p className="text-xs text-gray-400">10+ hours this week</p></div><span className="text-lg font-bold text-blue-400">{studyStats.totalMinutesWeek >= 600 ? '✓' : `${(studyStats.totalMinutesWeek / 60).toFixed(1)}/10`}</span></div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'inv' && (
  <div className="bg-black bg-opacity-50 rounded-xl p-6 border-2 border-red-900">
    <h2 className="text-2xl font-bold text-red-400 mb-6 text-center">Cursed Arsenal</h2>
    <div className="grid md:grid-cols-2 gap-6">
      <div className="bg-red-900 bg-opacity-50 rounded-lg p-4 flex justify-between items-center border border-red-700"><div className="flex items-center gap-3"><Heart className="text-red-400" size={32}/><div><p className="font-bold text-white">Health Potions</p><p className="text-2xl text-red-400">{healthPots}</p><p className="text-xs text-gray-400">Restores {GAME_CONSTANTS.HEALTH_POTION_HEAL} HP</p></div></div><button onClick={useHealth} disabled={healthPots === 0 || hp >= getMaxHp()} className="bg-red-600 px-4 py-2 rounded disabled:bg-gray-600 disabled:cursor-not-allowed hover:bg-red-700 transition-all">Use</button></div>
      <div className="bg-cyan-900 bg-opacity-50 rounded-lg p-4 flex justify-between items-center border border-cyan-700"><div className="flex items-center gap-3"><Zap className="text-cyan-400" size={32}/><div><p className="font-bold text-white">Stamina Potions</p><p className="text-2xl text-cyan-400">{staminaPots}</p><p className="text-xs text-gray-400">Restores {GAME_CONSTANTS.STAMINA_POTION_RESTORE} SP</p></div></div><button onClick={() => { if (staminaPots > 0 && stamina < getMaxStamina()) { setStaminaPots(s => s - 1); setStamina(s => Math.min(getMaxStamina(), s + GAME_CONSTANTS.STAMINA_POTION_RESTORE)); addLog(`⚡ Used Stamina Potion! +${GAME_CONSTANTS.STAMINA_POTION_RESTORE} SP`); } }} disabled={staminaPots === 0 || stamina >= getMaxStamina()} className="bg-cyan-600 px-4 py-2 rounded disabled:bg-gray-600 disabled:cursor-not-allowed hover:bg-cyan-700 transition-all">Use</button></div>
      <div className={`bg-purple-900 bg-opacity-50 rounded-lg p-4 border-2 ${curseLevel > 0 ? 'border-purple-400 ring-2 ring-purple-500 animate-pulse' : 'border-purple-700'}`}><div className="flex justify-between items-center mb-3"><div className="flex items-center gap-3"><span className="text-4xl">✨</span><div><p className="font-bold text-white">Cleanse Potions</p><p className="text-2xl text-purple-400">{cleansePots}</p><p className="text-xs text-gray-400">Removes curse</p></div></div><button onClick={useCleanse} disabled={cleansePots === 0 || curseLevel === 0} className="bg-purple-600 px-4 py-2 rounded disabled:bg-gray-600 disabled:cursor-not-allowed hover:bg-purple-700 transition-all">Use</button></div><div className="pt-3 border-t-2 border-purple-600"><p className="text-xs text-gray-300 mb-2 text-center font-bold">CRAFT POTION</p><button onClick={craftCleanse} disabled={xp < GAME_CONSTANTS.CLEANSE_POTION_COST} className={`w-full px-4 py-3 rounded transition-all text-sm font-bold ${xp >= GAME_CONSTANTS.CLEANSE_POTION_COST ? 'bg-purple-700 hover:bg-purple-600 text-white' : 'bg-gray-700 text-gray-500 cursor-not-allowed'}`}>{xp >= GAME_CONSTANTS.CLEANSE_POTION_COST ? `Craft Cleanse Potion (-${GAME_CONSTANTS.CLEANSE_POTION_COST} XP)` : `Need ${GAME_CONSTANTS.CLEANSE_POTION_COST - xp} more XP`}</button><p className="text-xs text-gray-400 mt-2 text-center">Sacrifice XP to create cleanse potion</p></div></div>
      <div className="bg-orange-900 bg-opacity-50 rounded-lg p-4 flex items-center gap-3 border border-orange-700"><Sword className="text-orange-400" size={32}/><div><p className="font-bold text-white">Weapon Power</p><p className="text-2xl text-orange-400">+{weapon}</p><p className="text-xs text-gray-400">Total Attack: {getBaseAttack() + weapon + (level - 1) * 2}</p></div></div>
      <div className="bg-blue-900 bg-opacity-50 rounded-lg p-4 flex items-center gap-3 border border-blue-700"><Shield className="text-blue-400" size={32}/><div><p className="font-bold text-white">Armor Rating</p><p className="text-2xl text-blue-400">+{armor}</p><p className="text-xs text-gray-400">Total Defense: {getBaseDefense() + armor}</p></div></div>
    </div>
  </div>
)}

          {activeTab === 'grave' && (
            <div className="bg-black bg-opacity-50 rounded-xl p-6 border-2 border-gray-800">
              <h2 className="text-2xl font-bold text-gray-400 mb-2 text-center">THE CONSUMED</h2>
              <p className="text-red-400 text-sm mb-6 italic text-center">"Those who fell to the curse..."</p>
              {graveyard.length === 0 ? (<div className="text-center py-12"><Skull size={64} className="mx-auto mb-4 text-gray-700"/><p className="text-gray-500">No fallen heroes... yet.</p></div>) : (<div className="space-y-4">{graveyard.slice().reverse().map((fallen, i) => (<div key={i} className="bg-gray-900 rounded-lg p-4 border-2 border-red-900 opacity-70 hover:opacity-90 transition-opacity"><div className="flex items-center gap-4"><div className="text-4xl opacity-50">{fallen.class ? fallen.class.emblem : '☠️'}</div><div className="flex-1"><h3 className="text-xl font-bold text-red-400">{fallen.name}</h3><p className="text-gray-400">{fallen.title} {fallen.class ? fallen.class.name : ''} • Level {fallen.lvl}</p><p className="text-red-300">Fell on {fallen.day ? GAME_CONSTANTS.DAY_NAMES[fallen.day - 1]?.name || `Day ${fallen.day}` : 'Day 1'} • {fallen.xp} XP earned</p><p className="text-gray-300">Trials completed: {fallen.tasks}/{fallen.total}</p>{fallen.skipCount > 0 && (<p className="text-red-400 text-sm mt-1">💀 Skipped {fallen.skipCount} day{fallen.skipCount > 1 ? 's' : ''}</p>)}{fallen.cursed && (<p className="text-purple-400 text-sm">🌑 Died while cursed</p>)}<p className="text-red-500 text-sm italic mt-2">"The curse claimed another soul..."</p></div></div></div>))}</div>)}
            </div>
          )}

          {activeTab === 'hall' && (
            <div className="bg-black bg-opacity-50 rounded-xl p-6 border-2 border-yellow-900">
              <h2 className="text-2xl font-bold text-yellow-400 mb-2 text-center">THE LIBERATED</h2>
              <p className="text-green-400 text-sm mb-6 italic text-center">"Those who broke free from the curse..."</p>
              {heroes.length === 0 ? (<div className="text-center py-12"><Trophy size={64} className="mx-auto mb-4 text-gray-700"/><p className="text-gray-400">None have escaped the curse... yet.</p><p className="text-sm text-gray-500 mt-2">Survive all 7 days to break free!</p></div>) : (<div className="space-y-4">{heroes.slice().reverse().map((hero, i) => (<div key={i} className={`bg-gradient-to-r ${hero.class ? hero.class.gradient[3] : 'from-yellow-900'} ${hero.class && hero.class.color === 'yellow' ? 'to-orange-400' : hero.class && hero.class.color === 'red' ? 'to-orange-500' : hero.class && hero.class.color === 'purple' ? 'to-pink-500' : hero.class && hero.class.color === 'green' ? 'to-teal-500' : 'to-yellow-500'} rounded-lg p-6 border-4 border-yellow-400 shadow-2xl shadow-yellow-500/50`}><div className="flex items-center gap-4"><div className="text-6xl animate-pulse">{hero.class ? hero.class.emblem : '✨'}</div><div className="flex-1"><h3 className="text-2xl font-bold text-white">{hero.name}</h3><p className="text-xl text-white text-opacity-90">{hero.title} {hero.class ? hero.class.name : ''}</p><p className="text-white">Level {hero.lvl} • {hero.xp} XP</p>{hero.skipCount !== undefined && hero.skipCount === 0 && (<p className="text-green-300 font-bold mt-1">✨ FLAWLESS RUN - No skips!</p>)}{hero.skipCount > 0 && (<p className="text-yellow-200 text-sm mt-1">Overcame {hero.skipCount} skip{hero.skipCount > 1 ? 's' : ''}</p>)}<p className="text-yellow-300 font-bold mt-2">✨ CURSE BROKEN ✨</p><p className="text-green-400 text-sm italic">"Free at last from the eternal torment..."</p></div></div></div>))}</div>)}
            </div>
          )}

          {showCustomizeModal && (
  <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50" onClick={() => setShowCustomizeModal(false)}>
    <div className="bg-gray-900 rounded-xl p-6 max-w-md w-full border-2 border-blue-500" onClick={e => e.stopPropagation()}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-blue-400">CUSTOMIZE YOUR HERO</h3>
        <button onClick={() => setShowCustomizeModal(false)} className="text-gray-400 hover:text-white">
          <X size={24}/>
        </button>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm text-gray-400 mb-2">Hero Name</label>
        <input 
          type="text" 
          placeholder="Enter your hero's name" 
          value={customName}
          onChange={e => setCustomName(e.target.value)}
          className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none" 
          autoFocus 
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-sm text-gray-400 mb-2">Choose Your Class</label>
        <div className="grid grid-cols-2 gap-2">
          {classes.map(cls => (
            <button
              key={cls.name}
              type="button"
              onClick={() => setCustomClass(cls)}
              className={`p-4 rounded-lg border-2 transition-all ${
                customClass?.name === cls.name 
                  ? `bg-${cls.color}-900 border-${cls.color}-500` 
                  : 'bg-gray-800 border-gray-700 hover:border-gray-500'
              }`}
            >
              <div className="text-4xl mb-2">{cls.emblem}</div>
              <div className="font-bold text-white">{cls.name}</div>
            </button>
          ))}
        </div>
      </div>
      
      <div className="flex gap-2">
        <button 
          onClick={() => {
            if (customName.trim() || customClass) {
              setHero(prev => ({
                ...prev,
                name: customName.trim() || prev.name,
                class: customClass || prev.class
              }));
              setCustomName('');
              setCustomClass(null);
              setShowCustomizeModal(false);
              addLog(`✨ Hero customized! ${customName.trim() ? `Name: ${customName.trim()}` : ''} ${customClass ? `Class: ${customClass.name}` : ''}`);
            }
          }}
          className="flex-1 bg-blue-600 py-2 rounded-lg hover:bg-blue-700 transition-all"
        >
          Confirm
        </button>
        <button 
          onClick={() => {
            setCustomName('');
            setCustomClass(null);
            setShowCustomizeModal(false);
          }} 
          className="flex-1 bg-gray-700 py-2 rounded-lg hover:bg-gray-600 transition-all"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}

{showDeckModal && (
  <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50" onClick={() => setShowDeckModal(false)}>
    <div className="bg-gray-900 rounded-xl p-6 max-w-md w-full border-2 border-purple-500" onClick={e => e.stopPropagation()}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-purple-400">Create New Deck</h3>
        <button onClick={() => setShowDeckModal(false)} className="text-gray-400 hover:text-white">
          <X size={24}/>
        </button>
      </div>
      
      <input 
        type="text" 
        placeholder="Deck name (e.g., Spanish Vocabulary)" 
        value={newDeck.name} 
        onChange={e => setNewDeck({name: e.target.value})} 
        className="w-full p-3 bg-gray-800 text-white rounded-lg mb-4 border border-gray-700 focus:border-purple-500 focus:outline-none" 
        autoFocus 
      />
      
      <div className="flex gap-2">
        <button 
          onClick={() => {
            if (newDeck.name.trim()) {
              setFlashcardDecks(prev => [...prev, { name: newDeck.name, cards: [] }]);
              addLog(`📚 Created deck: ${newDeck.name}`);
              setNewDeck({name: ''});
              setShowDeckModal(false);
            }
          }}
          disabled={!newDeck.name.trim()} 
          className="flex-1 bg-purple-600 py-2 rounded-lg hover:bg-purple-700 transition-all disabled:bg-gray-700 disabled:cursor-not-allowed"
        >
          Create Deck
        </button>
        <button 
          onClick={() => { setShowDeckModal(false); setNewDeck({name: ''}); }} 
          className="flex-1 bg-gray-700 py-2 rounded-lg hover:bg-gray-600 transition-all"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}

{showCardModal && selectedDeck !== null && (
  <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50" onClick={() => setShowCardModal(false)}>
    <div className="bg-gray-900 rounded-xl p-6 max-w-md w-full border-2 border-blue-500" onClick={e => e.stopPropagation()}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-blue-400">Add Card to {flashcardDecks[selectedDeck]?.name}</h3>
        <button onClick={() => setShowCardModal(false)} className="text-gray-400 hover:text-white">
          <X size={24}/>
        </button>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm text-gray-400 mb-2">Front (Question)</label>
        <textarea 
          placeholder="e.g., What is the capital of France?" 
          value={newCard.front} 
          onChange={e => setNewCard({...newCard, front: e.target.value})} 
          className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none resize-none" 
          rows="3"
          autoFocus 
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-sm text-gray-400 mb-2">Back (Answer)</label>
        <textarea 
          placeholder="e.g., Paris" 
          value={newCard.back} 
          onChange={e => setNewCard({...newCard, back: e.target.value})} 
          className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none resize-none" 
          rows="3"
        />
      </div>
      
      <div className="flex gap-2">
        <button 
          onClick={() => {
            if (newCard.front.trim() && newCard.back.trim()) {
              setFlashcardDecks(prev => prev.map((deck, idx) => 
                idx === selectedDeck 
                  ? {...deck, cards: [...deck.cards, {...newCard, mastered: false}]}
                  : deck
              ));
              addLog(`📝 Added card to ${flashcardDecks[selectedDeck].name}`);
              setNewCard({front: '', back: ''});
              setShowCardModal(false);
            }
          }}
          disabled={!newCard.front.trim() || !newCard.back.trim()} 
          className="flex-1 bg-blue-600 py-2 rounded-lg hover:bg-blue-700 transition-all disabled:bg-gray-700 disabled:cursor-not-allowed"
        >
          Add Card
        </button>
        <button 
          onClick={() => { setShowCardModal(false); setNewCard({front: '', back: ''}); }} 
          className="flex-1 bg-gray-700 py-2 rounded-lg hover:bg-gray-600 transition-all"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}

{showStudyModal && selectedDeck !== null && flashcardDecks[selectedDeck] && (
  <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center p-4 z-50">
    <div className="bg-gradient-to-b from-purple-900 to-black rounded-xl p-8 max-w-2xl w-full border-4 border-purple-600 shadow-2xl">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-purple-400">{flashcardDecks[selectedDeck].name}</h2>
          <p className="text-gray-400">Card {currentCardIndex + 1} of {flashcardDecks[selectedDeck].cards.length}</p>
        </div>
        <button 
          onClick={() => {
            setShowStudyModal(false);
            setSelectedDeck(null);
            setCurrentCardIndex(0);
            setIsFlipped(false);
          }}
          className="text-gray-400 hover:text-white"
        >
          <X size={32}/>
        </button>
      </div>
      
      <div 
        onClick={() => setIsFlipped(!isFlipped)}
        className="bg-gray-800 rounded-xl p-12 mb-6 min-h-[300px] flex items-center justify-center cursor-pointer hover:bg-gray-750 transition-all border-2 border-purple-500"
      >
        <div className="text-center">
          <p className="text-sm text-gray-500 mb-4">{isFlipped ? 'ANSWER' : 'QUESTION'}</p>
          <p className="text-2xl text-white whitespace-pre-wrap">
            {isFlipped 
              ? flashcardDecks[selectedDeck].cards[currentCardIndex].back 
              : flashcardDecks[selectedDeck].cards[currentCardIndex].front}
          </p>
          <p className="text-sm text-gray-500 mt-6 italic">Click to flip</p>
        </div>
      </div>
      
      <div className="bg-gray-800 rounded-full h-2 mb-6">
        <div 
          className="bg-purple-500 h-2 rounded-full transition-all" 
          style={{width: `${((currentCardIndex + 1) / flashcardDecks[selectedDeck].cards.length) * 100}%`}}
        />
      </div>
      
      {isFlipped && (
        <div className="flex gap-4">
          <button
            onClick={() => {
              // Mark as needs review, move to next
              const nextIndex = currentCardIndex + 1;
              if (nextIndex >= flashcardDecks[selectedDeck].cards.length) {
                // Deck complete
                const cardsStudied = flashcardDecks[selectedDeck].cards.length;
                const xpGain = cardsStudied * 5 + 25;
                setXp(x => x + xpGain);
                addLog(`🎓 Completed deck! +${xpGain} XP`);
                
                // Loot chance
                const roll = Math.random();
                if (roll < 0.3) {
                  setHealthPots(h => h + 1);
                  addLog('💊 Found Health Potion!');
                } else if (roll < 0.5) {
                  setStaminaPots(s => s + 1);
                  addLog('⚡ Found Stamina Potion!');
                }
                
                setShowStudyModal(false);
                setSelectedDeck(null);
                setCurrentCardIndex(0);
                setIsFlipped(false);
              } else {
                setCurrentCardIndex(nextIndex);
                setIsFlipped(false);
              }
            }}
            className="flex-1 bg-red-600 hover:bg-red-700 py-4 rounded-lg font-bold text-lg transition-all"
          >
            ❌ Review Again
          </button>
          
          <button
            onClick={() => {
              // Mark as mastered, give XP, move to next
              setFlashcardDecks(prev => prev.map((deck, idx) => 
                idx === selectedDeck 
                  ? {...deck, cards: deck.cards.map((card, cardIdx) => 
                      cardIdx === currentCardIndex ? {...card, mastered: true} : card
                    )}
                  : deck
              ));
              
              setXp(x => x + 5);
              
              const nextIndex = currentCardIndex + 1;
              if (nextIndex >= flashcardDecks[selectedDeck].cards.length) {
                // Deck complete
                const cardsStudied = flashcardDecks[selectedDeck].cards.length;
                const xpGain = 25;
                setXp(x => x + xpGain);
                addLog(`🎓 Completed deck! +${xpGain} bonus XP`);
                
                // Loot chance
                const roll = Math.random();
                if (roll < 0.3) {
                  setHealthPots(h => h + 1);
                  addLog('💊 Found Health Potion!');
                } else if (roll < 0.5) {
                  setStaminaPots(s => s + 1);
                  addLog('⚡ Found Stamina Potion!');
                }
                
                setShowStudyModal(false);
                setSelectedDeck(null);
                setCurrentCardIndex(0);
                setIsFlipped(false);
              } else {
                setCurrentCardIndex(nextIndex);
                setIsFlipped(false);
              }
            }}
            className="flex-1 bg-green-600 hover:bg-green-700 py-4 rounded-lg font-bold text-lg transition-all"
          >
            ✓ Got It! (+5 XP)
          </button>
        </div>
      )}
    </div>
  </div>
)}
         {showModal && (
  <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50" onClick={() => setShowModal(false)}>
    <div className="bg-gray-900 rounded-xl p-6 max-w-md w-full border-2 border-red-500" onClick={e => e.stopPropagation()}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-red-400">Accept New Trial</h3>
        <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white"><X size={24}/></button>
      </div>
      
      <input 
        type="text" 
        placeholder="Task name (e.g., Study for Biology test)" 
        value={newTask.title} 
        onChange={e => setNewTask({...newTask, title: e.target.value})} 
        className="w-full p-3 bg-gray-800 text-white rounded-lg mb-4 border border-gray-700 focus:border-red-500 focus:outline-none" 
        autoFocus 
      />
      
      <div className="mb-4">
        <label className="block text-sm text-gray-400 mb-2">Priority Level</label>
        <div className="grid grid-cols-2 gap-3">
          <button 
            type="button" 
            onClick={() => setNewTask({...newTask, priority: 'important'})} 
            className={`p-4 rounded-lg border-2 transition-all ${
              newTask.priority === 'important' 
                ? 'bg-yellow-900 border-yellow-500 text-yellow-200 shadow-lg shadow-yellow-500/50' 
                : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-yellow-700'
            }`}
          >
            <div className="text-2xl mb-1">⭐</div>
            <div className="font-bold">IMPORTANT</div>
            <div className="text-xs mt-1">1.25x XP</div>
          </button>
          
          <button 
            type="button" 
            onClick={() => setNewTask({...newTask, priority: 'routine'})} 
            className={`p-4 rounded-lg border-2 transition-all ${
              newTask.priority === 'routine' 
                ? 'bg-blue-900 border-blue-500 text-blue-200 shadow-lg shadow-blue-500/50' 
                : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-blue-700'
            }`}
          >
            <div className="text-2xl mb-1">📋</div>
            <div className="font-bold">ROUTINE</div>
            <div className="text-xs mt-1">1.0x XP</div>
          </button>
        </div>
      </div>
      
      <div className="flex gap-2">
        <button 
          onClick={addTask} 
          disabled={!newTask.title} 
          className="flex-1 bg-red-600 py-2 rounded-lg hover:bg-red-700 transition-all disabled:bg-gray-700 disabled:cursor-not-allowed"
        >
          Accept Trial
        </button>
        <button 
          onClick={() => setShowModal(false)} 
          className="flex-1 bg-gray-700 py-2 rounded-lg hover:bg-gray-600 transition-all"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}

         {showPlanModal && selectedDay && (
  <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50" onClick={() => setShowPlanModal(false)}>
    <div className="bg-gray-900 rounded-xl p-6 max-w-md w-full border-2 border-blue-500" onClick={e => e.stopPropagation()}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-blue-400">Plan for {selectedDay}</h3>
        <button onClick={() => setShowPlanModal(false)} className="text-gray-400 hover:text-white"><X size={24}/></button>
      </div>
      
      <input 
        type="text" 
        placeholder="What do you need to do?" 
        value={newPlanItem.title} 
        onChange={e => setNewPlanItem({...newPlanItem, title: e.target.value})} 
        className="w-full p-3 bg-gray-800 text-white rounded-lg mb-4 border border-gray-700 focus:border-blue-500 focus:outline-none" 
        autoFocus 
      />
      
      <div className="mb-4">
        <label className="block text-sm text-gray-400 mb-2">Priority Level</label>
        <div className="grid grid-cols-2 gap-3">
          <button 
            type="button" 
            onClick={() => setNewPlanItem({...newPlanItem, priority: 'important'})} 
            className={`p-4 rounded-lg border-2 transition-all ${
              newPlanItem.priority === 'important' 
                ? 'bg-yellow-900 border-yellow-500 text-yellow-200 shadow-lg shadow-yellow-500/50' 
                : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-yellow-700'
            }`}
          >
            <div className="text-2xl mb-1">⭐</div>
            <div className="font-bold">IMPORTANT</div>
            <div className="text-xs mt-1">1.25x XP</div>
          </button>
          
          <button 
            type="button" 
            onClick={() => setNewPlanItem({...newPlanItem, priority: 'routine'})} 
            className={`p-4 rounded-lg border-2 transition-all ${
              newPlanItem.priority === 'routine' 
                ? 'bg-blue-900 border-blue-500 text-blue-200 shadow-lg shadow-blue-500/50' 
                : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-blue-700'
            }`}
          >
            <div className="text-2xl mb-1">📋</div>
            <div className="font-bold">ROUTINE</div>
            <div className="text-xs mt-1">1.0x XP</div>
          </button>
        </div>
      </div>
      
      <div className="flex gap-2">
        <button 
          onClick={() => { 
            if (newPlanItem.title) { 
              setWeeklyPlan(prev => ({ 
                ...prev, 
                [selectedDay]: [...prev[selectedDay], {
                  ...newPlanItem, 
                  completed: false
                }] 
              })); 
              const targetDate = getNextDayOfWeek(selectedDay);
              const dateKey = getDateKey(targetDate);
              setCalendarTasks(prev => ({ 
                ...prev, 
                [dateKey]: [...(prev[dateKey] || []), { 
                  title: newPlanItem.title,
                  priority: newPlanItem.priority || 'routine',
                  done: false, 
                  fromPlanner: true 
                }] 
              })); 
              setNewPlanItem({ title: '', priority: 'routine' }); 
              setShowPlanModal(false); 
              addLog(`📅 Added "${newPlanItem.title}" to ${selectedDay}`); 
            } 
          }}
          disabled={!newPlanItem.title} 
          className="flex-1 bg-blue-600 py-2 rounded-lg hover:bg-blue-700 transition-all disabled:bg-gray-700 disabled:cursor-not-allowed"
        >
          Add Task
        </button>
        <button 
          onClick={() => { 
            setShowPlanModal(false); 
            setNewPlanItem({ title: '', priority: 'routine' }); 
          }} 
          className="flex-1 bg-gray-700 py-2 rounded-lg hover:bg-gray-600 transition-all"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}
          </div>  // ← ADD THIS - closes max-w-6xl container
        
        {showCalendarModal && selectedDate && (
  <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50" onClick={() => setShowCalendarModal(false)}>
    <div className="bg-gray-900 rounded-xl p-6 max-w-md w-full border-2 border-green-500" onClick={e => e.stopPropagation()}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-green-400">
  {(() => {
    const [year, month, day] = selectedDate.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  })()}
</h3>
        <button onClick={() => setShowCalendarModal(false)} className="text-gray-400 hover:text-white">
          <X size={24}/>
        </button>
      </div>
      
      <div className="mb-4">
        <input 
          type="text" 
          placeholder="Add new task..." 
          value={newCalendarTask.title} 
          onChange={e => setNewCalendarTask({...newCalendarTask, title: e.target.value})} 
          className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-green-500 focus:outline-none mb-3" 
          autoFocus 
        />
        
        <div className="mb-3">
          <label className="block text-sm text-gray-400 mb-2">Priority Level</label>
          <div className="grid grid-cols-2 gap-2">
            <button 
              type="button" 
              onClick={() => setNewCalendarTask({...newCalendarTask, priority: 'important'})} 
              className={`p-3 rounded-lg border-2 transition-all ${
                newCalendarTask.priority === 'important' 
                  ? 'bg-yellow-900 border-yellow-500 text-yellow-200' 
                  : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-yellow-700'
              }`}
            >
              <div className="text-xl mb-1">⭐</div>
              <div className="font-bold text-sm">IMPORTANT</div>
            </button>
            
            <button 
              type="button" 
              onClick={() => setNewCalendarTask({...newCalendarTask, priority: 'routine'})} 
              className={`p-3 rounded-lg border-2 transition-all ${
                newCalendarTask.priority === 'routine' 
                  ? 'bg-blue-900 border-blue-500 text-blue-200' 
                  : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-blue-700'
              }`}
            >
              <div className="text-xl mb-1">📋</div>
              <div className="font-bold text-sm">ROUTINE</div>
            </button>
          </div>
        </div>
        
        <button 
          onClick={() => { 
            if (newCalendarTask.title.trim()) { 
              const date = new Date(selectedDate);
              const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
              
              // Add to calendar
              setCalendarTasks(prev => ({ 
                ...prev, 
                [selectedDate]: [...(prev[selectedDate] || []), { 
                  title: newCalendarTask.title,
                  priority: newCalendarTask.priority,
                  done: false 
                }] 
              }));
              
              // Add to planner for that day
              setWeeklyPlan(prev => ({
                ...prev,
                [dayName]: [...prev[dayName], {
                  title: newCalendarTask.title,
                  priority: newCalendarTask.priority,
                  completed: false
                }]
              }));
              
              setNewCalendarTask({ title: '', priority: 'routine' }); 
            } 
          }} 
          disabled={!newCalendarTask.title.trim()} 
          className="w-full bg-green-600 py-2 rounded-lg hover:bg-green-700 transition-all disabled:bg-gray-700 disabled:cursor-not-allowed"
        >
          Add Task
        </button>
      </div>
      
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {(!calendarTasks[selectedDate] || calendarTasks[selectedDate].length === 0) ? (
          <p className="text-gray-500 text-center py-4 italic">No tasks for this day</p>
        ) : (
          [...calendarTasks[selectedDate]].sort((a, b) => {
            if (a.priority === 'important' && b.priority !== 'important') return -1;
            if (a.priority !== 'important' && b.priority === 'important') return 1;
            return 0;
          }).map((task, idx) => {
            const originalIdx = calendarTasks[selectedDate].indexOf(task);
            return (
              <div 
                key={originalIdx} 
                className={`rounded-lg p-3 flex items-center gap-3 ${
                  task.priority === 'important' && !task.done
                    ? 'bg-gradient-to-r from-yellow-900/30 to-gray-800 border border-yellow-500'
                    : 'bg-gray-800'
                }`}
              >
                {task.priority === 'important' && !task.done && (
                  <span className="text-xl">⭐</span>
                )}
                <input 
                  type="checkbox" 
                  checked={task.done} 
                  onChange={() => { 
                    setCalendarTasks(prev => ({ 
                      ...prev, 
                      [selectedDate]: prev[selectedDate].map((t, i) => 
                        i === originalIdx ? { ...t, done: !t.done } : t
                      ) 
                    })); 
                  }} 
                  className="w-5 h-5 cursor-pointer" 
                />
                <span className={`flex-1 ${task.done ? 'line-through text-gray-500' : 'text-white'}`}>
                  {task.title}
                </span>
                <button 
                  onClick={() => { 
                    setCalendarTasks(prev => ({ 
                      ...prev, 
                      [selectedDate]: prev[selectedDate].filter((_, i) => i !== originalIdx) 
                    })); 
                  }} 
                  className="text-red-400 hover:text-red-300"
                >
                  <X size={18}/>
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  </div>
)}

          {showBoss && (
            <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-50">
              <div className={`bg-gradient-to-b from-red-900 to-black rounded-xl p-8 max-w-2xl w-full border-4 border-red-600 shadow-2xl shadow-red-900/50 boss-enter ${bossFlash ? 'damage-flash-boss' : ''}`}>
               <h2 className="text-4xl font-bold text-center text-red-400 mb-2">
  {isFinalBoss ? 'THE UNDYING LEGEND' : 
   battleType === 'elite' ? 'TORMENTED CHAMPION' : 
   battleType === 'wave' ? `⚠️ WAVE ASSAULT - Enemy ${currentWaveEnemy}/${totalWaveEnemies}` : 
   '⚔️ ENEMY ENCOUNTER'}
</h2>
                {bossName && (<p className="text-2xl text-center text-yellow-400 mb-4 font-bold" style={{fontFamily: 'Cinzel, serif'}}>{bossName}{bossDebuffs.poisonTurns > 0 && (<span className="ml-3 text-lg text-green-400 animate-pulse">☠️ POISONED ({bossDebuffs.poisonTurns})</span>)}{bossDebuffs.marked && (<span className="ml-3 text-lg text-cyan-400 animate-pulse">🎯 MARKED</span>)}{bossDebuffs.stunned && (<span className="ml-3 text-lg text-purple-400 animate-pulse">✨ STUNNED</span>)}</p>)}
                <div className="space-y-6"><div><div className="flex justify-between mb-2"><span className="text-red-400 font-bold">{bossName || 'Boss'}</span><span className="text-red-400">{bossHp}/{bossMax}</span></div><div className="bg-gray-800 rounded-full h-6 overflow-hidden"><div className={`bg-red-600 h-6 rounded-full transition-all duration-300 ${bossFlash ? 'hp-pulse' : ''}`} style={{width: `${(bossHp / bossMax) * 100}%`}}></div></div></div><div><div className="flex justify-between mb-2"><span className="text-green-400 font-bold">{hero.name}</span><span className="text-green-400">HP: {hp}/{getMaxHp()} | SP: {stamina}/{getMaxStamina()}</span></div><div className="bg-gray-800 rounded-full h-6 overflow-hidden mb-2"><div className={`bg-green-600 h-6 rounded-full transition-all duration-300 ${playerFlash ? 'hp-pulse' : ''}`} style={{width: `${(hp / getMaxHp()) * 100}%`}}></div></div><div className="bg-gray-800 rounded-full h-4 overflow-hidden"><div className="bg-cyan-500 h-4 rounded-full transition-all duration-300" style={{width: `${(stamina / getMaxStamina()) * 100}%`}}></div></div></div>
                  {battling && bossHp > 0 && hp > 0 && (<><div className="flex gap-4"><button onClick={attack} className="flex-1 bg-red-600 px-6 py-4 rounded-lg font-bold text-xl hover:bg-red-700 transition-all shadow-lg hover:shadow-red-600/50 hover:scale-105 active:scale-95">ATTACK</button>{hero && hero.class && GAME_CONSTANTS.SPECIAL_ATTACKS[hero.class.name] && (<button onClick={specialAttack} disabled={stamina < GAME_CONSTANTS.SPECIAL_ATTACKS[hero.class.name].cost || (GAME_CONSTANTS.SPECIAL_ATTACKS[hero.class.name].hpCost && hp <= GAME_CONSTANTS.SPECIAL_ATTACKS[hero.class.name].hpCost) || (hero.class.name === 'Ranger' && bossDebuffs.marked)} className="flex-1 bg-cyan-600 px-6 py-4 rounded-lg font-bold text-xl hover:bg-cyan-700 transition-all shadow-lg hover:shadow-cyan-600/50 hover:scale-105 active:scale-95 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:scale-100"><div>{GAME_CONSTANTS.SPECIAL_ATTACKS[hero.class.name].name.toUpperCase()}</div><div className="text-sm">({GAME_CONSTANTS.SPECIAL_ATTACKS[hero.class.name].cost} SP{GAME_CONSTANTS.SPECIAL_ATTACKS[hero.class.name].hpCost && ` • ${GAME_CONSTANTS.SPECIAL_ATTACKS[hero.class.name].hpCost + (recklessStacks * 10)} HP`})</div></button>)}{healthPots > 0 && (<button onClick={useHealth} className="bg-green-600 px-6 py-4 rounded-lg font-bold hover:bg-green-700 transition-all hover:scale-105 active:scale-95">HEAL</button>)}{canFlee && (<button onClick={flee} className="bg-yellow-600 px-6 py-4 rounded-lg font-bold hover:bg-yellow-700 transition-all hover:scale-105 active:scale-95" title="Lose 10 HP to escape">FLEE</button>)}</div>{canFlee && (<p className="text-xs text-gray-400 text-center italic">💨 Fleeing costs 10 HP but lets you escape</p>)}{showDebug && (<button onClick={() => { setBossHp(0); }} className="w-full bg-purple-700 px-4 py-2 rounded-lg text-sm hover:bg-purple-600 transition-all mt-2 border-2 border-purple-400">🛠️ DEBUG: Kill Boss Instantly</button>)}</>)}
                  {bossHp <= 0 && (<div className="text-center"><p className="text-3xl font-bold text-green-400 mb-2">{isFinalBoss ? 'CURSE BROKEN!' : 'VICTORY'}</p><p className="text-gray-400 text-sm mb-4 italic">{isFinalBoss ? '"You are finally free..."' : '"The beast falls. You are healed and rewarded."'}</p><button onClick={advance} className="bg-yellow-500 text-black px-8 py-3 rounded-lg font-bold text-xl hover:bg-yellow-400 transition-all shadow-lg shadow-yellow-500/50">{isFinalBoss ? 'CLAIM FREEDOM' : 'CONTINUE'}</button></div>)}
                  {hp <= 0 && (<div className="text-center"><p className="text-3xl font-bold text-red-400 mb-2">DEFEATED</p><p className="text-gray-400 text-sm mb-4 italic">"The curse claims another victim..."</p><button onClick={() => { setShowBoss(false); die(); }} className="bg-red-600 text-white px-8 py-3 rounded-lg font-bold text-xl hover:bg-red-700 transition-all shadow-lg shadow-red-600/50">CONTINUE</button></div>)}
                </div>
              </div>
            </div>
          )}
          {showPomodoro && pomodoroTask && (
  <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center p-4 z-50">
    <div className="bg-gradient-to-b from-purple-900 to-black rounded-xl p-12 max-w-2xl w-full border-4 border-purple-600 shadow-2xl">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-purple-400 mb-2">
          {isBreak ? '☕ BREAK TIME' : '🍅 FOCUS SESSION'}
        </h2>
        <p className="text-xl text-gray-300 mb-8">{pomodoroTask.title}</p>
        
        <div className="mb-8">
          <div className="text-8xl font-bold text-white mb-4">
            {Math.floor(pomodoroTimer / 60)}:{String(pomodoroTimer % 60).padStart(2, '0')}
          </div>
          <div className="text-gray-400 text-lg">
            {isBreak ? '5 minute break' : '25 minute work session'}
          </div>
        </div>
        
        <div className="mb-6">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="text-yellow-400 text-2xl">🍅</span>
            <span className="text-white text-xl">Pomodoros Completed: {pomodorosCompleted}</span>
          </div>
          <div className="bg-gray-800 rounded-full h-3 overflow-hidden">
            <div 
              className={`h-3 rounded-full transition-all ${isBreak ? 'bg-green-500' : 'bg-purple-500'}`} 
              style={{width: `${((isBreak ? 5 * 60 : 25 * 60) - pomodoroTimer) / (isBreak ? 5 * 60 : 25 * 60) * 100}%`}}
            ></div>
          </div>
        </div>
        
        <div className="flex gap-4 justify-center mb-6">
          <button 
            onClick={() => setPomodoroRunning(!pomodoroRunning)}
            className="bg-blue-600 px-8 py-3 rounded-lg font-bold text-xl hover:bg-blue-700 transition-all"
          >
            {pomodoroRunning ? '⏸️ Pause' : '▶️ Resume'}
          </button>
          
          {isBreak && (
            <button 
              onClick={() => {
                setIsBreak(false);
                setPomodoroTimer(25 * 60);
                setPomodoroRunning(true);
                addLog('⏭️ Skipped break - back to work!');
              }}
              className="bg-yellow-600 px-8 py-3 rounded-lg font-bold text-xl hover:bg-yellow-700 transition-all"
            >
              ⏭️ Skip Break
            </button>
          )}
        </div>
        
        <button 
          onClick={() => {
            setShowPomodoro(false);
            setPomodoroTask(null);
            setPomodoroRunning(false);
            addLog(`📊 Focus session ended. Completed ${pomodorosCompleted} pomodoro${pomodorosCompleted !== 1 ? 's' : ''}.`);
          }}
          className="bg-gray-700 px-8 py-3 rounded-lg font-bold hover:bg-gray-600 transition-all"
        >
          🏁 Finish Task & Return
        </button>
      </div>
    </div>
  </div>
)}                    // closes pomodoro modal
        
        <div className="flex justify-center mt-8 pb-6">
          <button onClick={() => setShowDebug(!showDebug)}>
            {showDebug ? '▲ Hide' : '▼ Show'} Debug Panel
          </button>
        </div>
      </div>          // closes "relative z-10 p-6"
    )}                // closes ternary operator
  </div>              // closes outer wrapper
  );                  // ✅ semicolon, not closing brace!
}                   // closes component

export default FantasyStudyQuest;

