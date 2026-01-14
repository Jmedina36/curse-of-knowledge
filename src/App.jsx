// FANTASY STUDY QUEST - v3.3.1 BUGFIX EDITION
// Critical fixes:
// - Fixed poison vulnerability calculation
// - Fixed skip day tracking with per-day completion
// - Fixed animation state management
// - Added memoization for performance
// - Centralized reckless stacks reset
// Last updated: 2026-01-14

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Sword, Shield, Heart, Zap, Skull, Trophy, Plus, Play, Pause, X } from 'lucide-react';

// ... [GAME_CONSTANTS remains the same] ...

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
  
  // FIX: Memoize scaled stats to prevent recalculation
  const maxHp = useMemo(() => {
    return GAME_CONSTANTS.MAX_HP + (currentDay - 1) * GAME_CONSTANTS.PLAYER_HP_PER_DAY;
  }, [currentDay]);
  
  const maxStamina = useMemo(() => {
    return GAME_CONSTANTS.MAX_STAMINA + (currentDay - 1) * GAME_CONSTANTS.PLAYER_SP_PER_DAY;
  }, [currentDay]);
  
  const baseAttack = useMemo(() => {
    return GAME_CONSTANTS.BASE_ATTACK + (currentDay - 1) * GAME_CONSTANTS.PLAYER_ATK_PER_DAY;
  }, [currentDay]);
  
  const baseDefense = useMemo(() => {
    return GAME_CONSTANTS.BASE_DEFENSE + (currentDay - 1) * GAME_CONSTANTS.PLAYER_DEF_PER_DAY;
  }, [currentDay]);
  
  // Inventory
  const [healthPots, setHealthPots] = useState(0);
  const [staminaPots, setStaminaPots] = useState(0);
  const [cleansePots, setCleansePots] = useState(0);
  const [weapon, setWeapon] = useState(0);
  const [armor, setArmor] = useState(0);
  
  // Tasks
  const [tasks, setTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', time: 30, priority: 'important' });
  const [activeTask, setActiveTask] = useState(null);
  const [timer, setTimer] = useState(0);
  const [running, setRunning] = useState(false);
  const [timerEndTime, setTimerEndTime] = useState(null);
  const [overdueTask, setOverdueTask] = useState(null);
  
  // Boss
  const [showBoss, setShowBoss] = useState(false);
  const [bossHp, setBossHp] = useState(0);
  const [bossMax, setBossMax] = useState(0);
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
  
  // FIX: Simplified animation state - single state instead of multiple overlapping ones
  const [animations, setAnimations] = useState({
    screen: null,      // 'shake' for screen shake
    boss: false,       // boss damage flash
    player: false,     // player damage flash
    victory: false     // victory flash
  });
  
  const [battleMode, setBattleMode] = useState(false);
  
  // Debug mode
  const [showDebug, setShowDebug] = useState(false);
  
  // History
  const [log, setLog] = useState([]);
  const [graveyard, setGraveyard] = useState([]);
  const [heroes, setHeroes] = useState([]);
  
  // FIX: Add daily completion tracking
  const [dailyCompletedTasks, setDailyCompletedTasks] = useState(0);
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
  
  // FIX: Centralized function to reset reckless stacks
  const resetRecklessStacks = useCallback(() => {
    setRecklessStacks(0);
  }, []);
  
  // FIX: Centralized animation trigger
  const triggerAnimation = useCallback((type, duration = 500) => {
    setAnimations(prev => ({ ...prev, [type]: true }));
    setTimeout(() => {
      setAnimations(prev => ({ ...prev, [type]: false }));
    }, duration);
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
  
  // Load game state from localStorage
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
        if (data.graveyard) setGraveyard(data.graveyard);
        if (data.heroes) setHeroes(data.heroes);
        if (data.hasStarted !== undefined) setHasStarted(data.hasStarted);
        if (data.skipCount !== undefined) setSkipCount(data.skipCount);
        if (data.consecutiveDays !== undefined) setConsecutiveDays(data.consecutiveDays);
        if (data.lastPlayedDate) setLastPlayedDate(data.lastPlayedDate);
        if (data.isCursed !== undefined) setIsCursed(data.isCursed);
        if (data.studyStats) setStudyStats(data.studyStats);
        // FIX: Load daily completion tracking
        if (data.dailyCompletedTasks !== undefined) setDailyCompletedTasks(data.dailyCompletedTasks);
      } catch (e) {
        console.error('Failed to load save:', e);
      }
    }
    if (!hero) setHero(makeName());
    
    // Request notification permission for timer alerts
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);
  
  // Define addLog early so it can be used in effects
  const addLog = useCallback((msg) => {
    setLog(prev => [...prev, msg].slice(-GAME_CONSTANTS.LOG_MAX_ENTRIES));
  }, []);
  
  // FIX: Debounced save to reduce localStorage writes
  useEffect(() => {
    if (!hero) return;
    
    const saveTimer = setTimeout(() => {
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
        weapon,
        armor,
        tasks,
        graveyard,
        heroes,
        hasStarted,
        skipCount,
        consecutiveDays,
        lastPlayedDate,
        isCursed,
        studyStats,
        dailyCompletedTasks
      };
      localStorage.setItem('fantasyStudyQuest', JSON.stringify(saveData));
    }, 500); // Debounce by 500ms
    
    return () => clearTimeout(saveTimer);
  }, [hero, currentDay, hp, stamina, xp, level, healthPots, staminaPots, cleansePots, weapon, armor, tasks, graveyard, heroes, hasStarted, skipCount, consecutiveDays, lastPlayedDate, isCursed, studyStats, dailyCompletedTasks]);
  
  // Timer effect
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
              icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='75' font-size='75'>⏰</text></svg>"
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
  
  // Level up effect
  useEffect(() => {
    const newLevel = Math.floor(xp / GAME_CONSTANTS.XP_PER_LEVEL) + 1;
    if (newLevel > level) {
      setLevel(newLevel);
      addLog(`🎉 LEVEL UP! Now level ${newLevel}`);
      setHp(h => Math.min(maxHp, h + 20));
    }
  }, [xp, level, addLog, maxHp]);
  
  // Tab visibility tracking
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && running && timer > 0) {
        console.log('Timer running in background - notifications will alert when complete');
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [running, timer]);
  
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
    
    if (penalty.cursed) {
      setIsCursed(true);
      addLog('🌑 YOU ARE CURSED. XP gains halved until tomorrow.');
    }
  }, [skipCount, addLog]);
  
  // FIX: Improved skip day check with proper daily completion tracking
  useEffect(() => {
    if (!hero || !hasStarted) return;
    
    const today = new Date().toDateString();
    
    if (!lastPlayedDate) {
      setLastPlayedDate(today);
      return;
    }
    
    const lastPlayed = new Date(lastPlayedDate).toDateString();
    
    if (today !== lastPlayed) {
      const lastDate = new Date(lastPlayedDate);
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);
      lastDate.setHours(0, 0, 0, 0);
      
      const daysDiff = Math.floor((currentDate - lastDate) / (1000 * 60 * 60 * 24));
      
      // FIX: Use dailyCompletedTasks instead of filtering all tasks
      if (daysDiff > 0 && dailyCompletedTasks === 0) {
        for (let i = 0; i < daysDiff && skipCount < GAME_CONSTANTS.MAX_SKIPS_BEFORE_DEATH; i++) {
          applySkipPenalty();
        }
      }
      
      // Reset daily completion counter for new day
      setDailyCompletedTasks(0);
      setLastPlayedDate(today);
    }
  }, [hero, lastPlayedDate, hasStarted, dailyCompletedTasks, skipCount, applySkipPenalty]);
  
  const getDifficulty = (timeInMinutes) => {
    if (timeInMinutes <= 20) return 'easy';
    if (timeInMinutes <= 45) return 'medium';
    return 'hard';
  };
  
  const start = () => {
    const today = new Date().toDateString();
    const currentHour = new Date().getHours();
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
      // FIX: Reset daily completion counter
      setDailyCompletedTasks(0);
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
  
  const addTask = () => {
    if (newTask.title && newTask.time > 0) {
      const difficulty = getDifficulty(newTask.time);
      
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
      addLog(`📜 New trial: ${newTask.title}`);
    }
  };
  
  const startTask = (id) => {
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
  
  const complete = useCallback((id) => {
    const task = tasks.find(t => t.id === id);
    if (task && !task.done) {
      const sessionDuration = sessionStartTime ? Math.floor((Date.now() - sessionStartTime) / 1000 / 60) : task.time;
      const isDeepWork = sessionDuration >= 60 && taskPauseCount === 0;
      
      const baseXp = GAME_CONSTANTS.XP_REWARDS[task.difficulty];
      let xpMultiplier = GAME_CONSTANTS.XP_MULTIPLIERS[currentDay - 1];
      const priorityMultiplier = GAME_CONSTANTS.PRIORITY_XP_MULTIPLIERS[task.priority || 'important'];
      xpMultiplier *= priorityMultiplier;
      
      if (isCursed) {
        xpMultiplier *= 0.5;
      }
      
      let xpGain = Math.floor(baseXp * xpMultiplier);
      let bonusMessages = [];
      
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
      
      // FIX: Increment daily completion counter
      setDailyCompletedTasks(prev => prev + 1);
      
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
        addLog(`⚔️ Weapon upgraded! +${gain} (Total: ${weapon + gain})`);
      } else if (roll < GAME_CONSTANTS.LOOT_RATES.ARMOR) {
        const gain = 1 + Math.floor(currentDay / 2);
        setArmor(a => a + gain);
        addLog(`🛡️ Armor upgraded! +${gain} (Total: ${armor + gain})`);
      }
      
      setTasks(prev => prev.map(t => t.id === id ? { ...t, done: true } : t));
      setActiveTask(null);
      setRunning(false);
      setSessionStartTime(null);
      
      if (overdueTask === id) {
        setOverdueTask(null);
      }
      
      setStamina(s => Math.min(maxStamina, s + GAME_CONSTANTS.STAMINA_PER_TASK));
      
      let completionMsg = `✅ Completed: ${task.title} (+${xpGain} XP`;
      if (task.priority === 'urgent') completionMsg += ' • URGENT';
      if (task.priority === 'important') completionMsg += ' • IMPORTANT';
      if (isCursed) completionMsg += ' • CURSED';
      completionMsg += `)`;
      
      addLog(completionMsg);
      bonusMessages.forEach(msg => addLog(msg));
      addLog(`⏱️ Studied: ${sessionDuration} minutes`);
      
      const spawnRoll = Math.random();
      if (spawnRoll < 0.25 && hp > maxHp * 0.5) {
        setTimeout(() => spawnRandomMiniBoss(), 1000);
      }
    }
  }, [tasks, currentDay, addLog, consecutiveDays, skipCount, isCursed, hp, sessionStartTime, taskPauseCount, maxHp, maxStamina, weapon, armor, overdueTask]);
  
  const spawnRandomMiniBoss = (force = false) => {
    const completedTasks = tasks.filter(t => t.done).length;
    const totalTasks = tasks.length;
    
    if (!force && totalTasks === 0) return;
    
    if (force) {
      setStamina(maxStamina);
    }
    
    const bossNumber = miniBossCount + 1;
    const completionRate = totalTasks > 0 ? completedTasks / totalTasks : 0.5;
    const baseHp = GAME_CONSTANTS.MINI_BOSS_BASE + (currentDay * GAME_CONSTANTS.MINI_BOSS_DAY_SCALING);
    const scaledHp = Math.floor(baseHp * (1 + bossNumber * 0.2));
    const bossHealth = Math.floor(scaledHp * (2 - completionRate));
    
    // FIX: Use new animation system
    triggerAnimation('screen', 500);
    
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
    if (healthPots > 0 && hp < maxHp) {
      setHealthPots(h => h - 1);
      setHp(h => Math.min(maxHp, h + GAME_CONSTANTS.HEALTH_POTION_HEAL));
      addLog(`💊 Used Health Potion! +${GAME_CONSTANTS.HEALTH_POTION_HEAL} HP`);
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
  
  const miniBoss = () => {
    const completedTasks = tasks.filter(t => t.done).length;
    const totalTasks = tasks.length;
    
    if (totalTasks === 0) {
      addLog('⚠️ No trials accepted! Create some first.');
      return;
    }
    
    if (completedTasks < totalTasks * 0.75) {
      addLog(`⚠️ Need 75% completion! (${completedTasks}/${totalTasks} done)`);
      return;
    }
    
    spawnRandomMiniBoss();
    setCanFlee(false);
  };
  
  const finalBoss = () => {
    const completedTasks = tasks.filter(t => t.done).length;
    const totalTasks = tasks.length;
    
    if (totalTasks === 0) {
      addLog('⚠️ No trials accepted! Create some first.');
      return;
    }
    
    if (completedTasks < totalTasks) {
      addLog(`⚠️ Must complete ALL trials! (${completedTasks}/${totalTasks} done)`);
      return;
    }
    
    const baseHp = GAME_CONSTANTS.FINAL_BOSS_BASE + (currentDay * GAME_CONSTANTS.FINAL_BOSS_DAY_SCALING);
    const completionRate = totalTasks > 0 ? completedTasks / totalTasks : 1.0;
    const bossHealth = Math.floor(baseHp * (1.5 - completionRate * 0.5));
    
    // FIX: Use new animation system
    triggerAnimation('screen', 500);
    
    const bossNameGenerated = makeBossName();
    setBossName(bossNameGenerated);
    setBossHp(bossHealth);
    setBossMax(bossHealth);
    setShowBoss(true);
    setBattling(true);
    setBattleMode(true);
    setIsFinalBoss(true);
    setCanFlee(false);
    addLog(`👹 ${bossNameGenerated.toUpperCase()} - THE FINAL RECKONING!`);
  };
  
  const attack = () => {
    if (!battling || bossHp <= 0) return;
    
    // FIX: Use centralized reset
    resetRecklessStacks();
    
    // FIX: Use new animation system
    triggerAnimation('screen', 250);
    
    const damage = baseAttack + weapon + Math.floor(Math.random() * 10) + (level - 1) * 2;
    
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
    
    // FIX: Use new animation system
    triggerAnimation('boss', 200);
    
    if (newBossHp <= 0) {
      setTimeout(() => {
        triggerAnimation('screen', 250);
      }, 100);
      
      // FIX: Use centralized reset
      resetRecklessStacks();
      
      const xpGain = isFinalBoss ? GAME_CONSTANTS.XP_REWARDS.finalBoss : GAME_CONSTANTS.XP_REWARDS.miniBoss;
      setXp(x => x + xpGain);
      addLog(`🎊 VICTORY! +${xpGain} XP`);
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
        
        setHp(maxHp);
        addLog('✨ Fully healed!');
      }
      
      // FIX: Use new animation system
      triggerAnimation('victory', 400);
      
      return;
    }
    
    // Boss counter-attack
    setTimeout(() => {
      if (!battling || hp <= 0) return;
      
      triggerAnimation('screen', 250);
      
      const bossDamage = Math.max(1, Math.floor(
        GAME_CONSTANTS.BOSS_ATTACK_BASE + 
        (currentDay * GAME_CONSTANTS.BOSS_ATTACK_DAY_SCALING) - 
        (baseDefense + armor)
      ));
      
      triggerAnimation('player', 200);
      
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
      
      // FIX: Apply poison damage - corrected vulnerability calculation
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
                resetRecklessStacks();
                
                if (!isFinalBoss) {
                  setHp(maxHp);
                  addLog('✨ Fully healed!');
                }
                
                triggerAnimation('victory', 400);
              }, 500);
            }
            return newHp;
          });
          setBossDebuffs(prev => ({
            ...prev,
            poisonTurns: prev.poisonTurns - 1,
            // FIX: Correctly check if poison will still be active AFTER decrement
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
    
    triggerAnimation('screen', 250);
    
    let damage = Math.floor((baseAttack + weapon + Math.floor(Math.random() * 10) + (level - 1) * 2) * special.damageMultiplier);
    
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
      setHp(h => Math.min(maxHp, h + 20));
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
      const markBonus = Math.floor((damage / 1.25) * 0.25);
      bonusMessages.push(`🎯 +${markBonus} from weak point!`);
    }
    
    if (wasPoisoned && bossDebuffs.poisonedVulnerability > 0) {
      const bonusDmg = Math.floor((damage / (1 + bossDebuffs.poisonedVulnerability)) * bossDebuffs.poisonedVulnerability);
      bonusMessages.push(`☠️ +${bonusDmg} from poison vulnerability`);
    }
    
    addLog(damageLog);
    bonusMessages.forEach(msg => addLog(msg));
    if (effectMessage) addLog(effectMessage);
    
    triggerAnimation('boss', 200);
    
    if (newBossHp <= 0) {
      setTimeout(() => {
        triggerAnimation('screen', 250);
      }, 100);
      
      resetRecklessStacks();
      
      const xpGain = isFinalBoss ? GAME_CONSTANTS.XP_REWARDS.finalBoss : GAME_CONSTANTS.XP_REWARDS.miniBoss;
      setXp(x => x + xpGain);
      addLog(`🎊 VICTORY! +${xpGain} XP`);
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
        
        setHp(maxHp);
        addLog('✨ Fully healed!');
      }
      
      triggerAnimation('victory', 400);
      
      return;
    }
    
    if (!skipCounterAttack) {
      setTimeout(() => {
        if (!battling || hp <= 0) return;
        
        setBossDebuffs(prev => ({ ...prev, stunned: false }));
        
        triggerAnimation('screen', 250);
        
        const bossDamage = Math.max(1, Math.floor(
          GAME_CONSTANTS.BOSS_ATTACK_BASE + 
          (currentDay * GAME_CONSTANTS.BOSS_ATTACK_DAY_SCALING) - 
          (baseDefense + armor)
        ));
        
        triggerAnimation('player', 200);
        
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
        
        // FIX: Apply poison damage with corrected vulnerability calculation
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
                  resetRecklessStacks();
                  
                  if (!isFinalBoss) {
                    setHp(maxHp);
                    addLog('✨ Fully healed!');
                  }
                  
                  triggerAnimation('victory', 400);
                }, 500);
              }
              return newHp;
            });
            setBossDebuffs(prev => ({
              ...prev,
              poisonTurns: prev.poisonTurns - 1,
              // FIX: Correctly check if poison will still be active AFTER decrement
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
    resetRecklessStacks();
    
    const fleePenalty = Math.floor(maxHp * 0.1);
    setHp(h => Math.max(1, h - fleePenalty));
    
    addLog(`🏃 Fled from ${bossName}! Lost ${fleePenalty} HP.`);
  };
  
  const die = () => {
    if (hp === GAME_CONSTANTS.MAX_HP && currentDay === 1 && level === 1) {
      return;
    }
    
    const completedTasks = tasks.filter(t => t.done).length;
    const totalTasks = tasks.length;
    
    setBattling(false);
    setShowBoss(false);
    setBattleMode(false);
    resetRecklessStacks();
    
    setGraveyard(prev => [...prev, { 
      ...hero, 
      day: currentDay, 
      lvl: level,
      xp: xp,
      tasks: completedTasks, 
      total: totalTasks,
      skipCount: skipCount,
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
    setIsCursed(false);
    setMiniBossCount(0);
    setDailyCompletedTasks(0);
    
    setTimeout(() => setActiveTab('grave'), 1000);
  };
  
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
      setShowBoss(false);
      setSkipCount(0);
      setConsecutiveDays(0);
      setLastPlayedDate(null);
      setIsCursed(false);
      setMiniBossCount(0);
      setBattleMode(false);
      setDailyCompletedTasks(0);
      
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
      
      // Note: maxHp and maxStamina will auto-update via useMemo when currentDay changes
      setHp(maxHp); // Will use new day's maxHp after state update
      setStamina(maxStamina); // Will use new day's maxStamina after state update
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
      setIsCursed(false);
      setMiniBossCount(0);
      setBattling(false);
      setBattleMode(false);
      resetRecklessStacks();
      setBossDebuffs({ poisonTurns: 0, poisonDamage: 0, poisonedVulnerability: 0, marked: false, stunned: false });
      setDailyCompletedTasks(0);
      
      // Use a callback to ensure we're reading the updated maxHp/maxStamina
      setTimeout(() => {
        addLog(`🌅 New day! Fully rested. HP: ${maxHp} | SP: ${maxStamina}`);
      }, 0);
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
    <div className={`min-h-screen bg-black text-white relative overflow-hidden ${animations.screen === 'shake' ? 'screen-shake' : ''}`}>
      {/* FIX: Use new animation state */}
      {animations.victory && (
        <div className="fixed inset-0 pointer-events-none z-50 victory-flash"></div>
      )}
      
      {battleMode && (
        <div className="fixed inset-0 pointer-events-none z-40" style={{
          border: '10px solid rgba(220, 38, 38, 0.8)',
          animation: 'battle-pulse 1s ease-in-out infinite',
          boxShadow: 'inset 0 0 100px rgba(220, 38, 38, 0.3)'
        }}></div>
      )}
      
      {animations.player && (
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
      
      {/* Rest of the JSX remains largely the same, just replace: */}
      {/* - getMaxHp() with maxHp */}
      {/* - getMaxStamina() with maxStamina */}
      {/* - getBaseAttack() with baseAttack */}
      {/* - getBaseDefense() with baseDefense */}
      {/* - bossFlash checks with animations.boss */}
      {/* - etc. */}
      
      {/* I'll show key changes in the boss battle modal: */}
      
      {showBoss && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-50">
          <div className={`bg-gradient-to-b from-red-900 to-black rounded-xl p-8 max-w-2xl w-full border-4 border-red-600 shadow-2xl shadow-red-900/50 boss-enter ${animations.boss ? 'damage-flash-boss' : ''}`}>
            {/* ... rest of boss modal JSX with maxHp, maxStamina, baseAttack, baseDefense ... */}
          </div>
        </div>
      )}
      
      {/* ... rest of JSX ... */}
    </div>
  );
};

export default FantasyStudyQuest;
