// FANTASY STUDY QUEST - v4.15.1
// Refactored: App.jsx split into components

import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { sounds } from './sounds';
import { Sword, Shield, Heart, Zap, Skull, Trophy, Plus, Play, Pause, X, Calendar, Hammer, Swords, ShieldCheck, HeartPulse, Sparkles, User, Target, GripVertical } from 'lucide-react';
import { COLORS, VISUAL_STYLES, GAME_CONSTANTS, HERO_TITLES, globalStyles, HERO_CLASSES } from './constants';
import QuestTab from './components/QuestTab';
import PlannerTab from './components/PlannerTab';
import ForgeTab from './components/ForgeTab';
import ProgressTab from './components/ProgressTab';
import LegacyTab from './components/LegacyTab';
import InventoryModal from './components/InventoryModal';
import CraftingModal from './components/CraftingModal';
import CustomizeModal from './components/CustomizeModal';
import FlashcardModals from './components/FlashcardModals';
import ImportModal from './components/ImportModal';
import PlanModal from './components/PlanModal';
import CalendarModal from './components/CalendarModal';
import BattleModal from './components/BattleModal';
import PomodoroModal from './components/PomodoroModal';

const FantasyStudyQuest = () => {
  const [activeTab, setActiveTab] = useState('quest');
  const [plannerSubTab, setPlannerSubTab] = useState('weekly');
  const [forgeSubTab, setForgeSubTab] = useState('flashcards'); // 'flashcards' or 'resources'
  const [heroCardCollapsed, setHeroCardCollapsed] = useState(false);
  const [currentDay, setCurrentDay] = useState(1);
  const [hasStarted, setHasStarted] = useState(false);
  const [hero, setHero] = useState(null);
  const [hp, setHp] = useState(GAME_CONSTANTS.MAX_HP);
  const [stamina, setStamina] = useState(GAME_CONSTANTS.MAX_STAMINA);
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [gold, setGold] = useState(0); // Currency from combat
  const [currency, setCurrency] = useState(0); // Gold for shop purchases
  const [dailyQuestCompleted, setDailyQuestCompleted] = useState(false); // Track if today's quests are done
  const [merchantTab, setMerchantTab] = useState('buy'); // 'buy' or 'sell'
  const [marketModifiers, setMarketModifiers] = useState({
    weapon: 1.0,
    armor: 1.0,
    pendant: 1.0,
    ring: 1.0,
    healthPotion: 1.0,
    staminaPotion: 1.0,
    cleansePotion: 1.0,
    weaponOil: 1.0,
    armorPolish: 1.0,
    luckyCharm: 1.0
  }); // Dynamic market prices (1.0 = normal, 1.5 = 50% bonus, etc.)
  const [lastMarketUpdateDay, setLastMarketUpdateDay] = useState(0); // Track last day market was updated
  const [pityCounter, setPityCounter] = useState(0); // Fights without upgrade (pity timer)
  const [shopInventory, setShopInventory] = useState([]); // Current shop items
  const [showShop, setShowShop] = useState(false); // Shop modal visibility
  const [daysSinceShop, setDaysSinceShop] = useState(0); // Track shop refresh
  const [gauntletMilestone, setGauntletMilestone] = useState(1500); // Next XP threshold for Gauntlet (increased from 1000)
  const [gauntletUnlocked, setGauntletUnlocked] = useState(false); // Is Gauntlet currently available
  const [timeUntilMidnight, setTimeUntilMidnight] = useState(''); // Countdown to day reset
  const [isDayActive, setIsDayActive] = useState(false); // Is current game day active (vs dormant)
  
  const [healthPots, setHealthPots] = useState(0);
  const [staminaPots, setStaminaPots] = useState(0);
  const [cleansePots, setCleansePots] = useState(0);
  const [weapon, setWeapon] = useState(0);
  const [armor, setArmor] = useState(0);
  
  // Weapon system
  const [equippedWeapon, setEquippedWeapon] = useState(null);
  const [weaponInventory, setWeaponInventory] = useState([]);
  
  // Armor equipment system
  const [equippedArmor, setEquippedArmor] = useState({
    helmet: null,
    chest: null,
    gloves: null,
    boots: null
  });
  const [armorInventory, setArmorInventory] = useState({
    helmet: [],
    chest: [],
    gloves: [],
    boots: []
  });
  
  // Accessory equipment system
  const [equippedPendant, setEquippedPendant] = useState(null);
  const [equippedRing, setEquippedRing] = useState(null);
  const [pendantInventory, setPendantInventory] = useState([]);
  const [ringInventory, setRingInventory] = useState([]);
  
  const getMaxHp = useCallback(() => {
    const pendantBonus = equippedPendant ? equippedPendant.hp : 0;
    
    // Add flatHP from armor affixes
    let armorHpBonus = 0;
    Object.values(equippedArmor).forEach(piece => {
      if (piece && piece.affixes && piece.affixes.flatHP) {
        armorHpBonus += piece.affixes.flatHP;
      }
    });
    
    return Math.floor(GAME_CONSTANTS.MAX_HP + pendantBonus + armorHpBonus);
  }, [equippedPendant, equippedArmor]);
  
  const getMaxStamina = useCallback(() => {
    const ringBonus = equippedRing ? equippedRing.stamina : 0;
    return Math.floor(GAME_CONSTANTS.MAX_STAMINA + ringBonus);
  }, [equippedRing]);
  
  const getBaseAttack = useCallback(() => {
    if (!hero || !hero.class || !hero.class.name) return 10;
    
    // Get base attack from class
    const baseAttack = GAME_CONSTANTS.BASE_ATTACK_BY_CLASS[hero.class.name] || 8;
    
    // Add equipped weapon attack
    const weaponAttack = equippedWeapon ? equippedWeapon.attack : 0;
    
    // Add weapon affixes
    let affixBonus = 0;
    if (equippedWeapon && equippedWeapon.affixes) {
      const affixes = equippedWeapon.affixes;
      
      // Flat damage bonus
      if (affixes.flatDamage) {
        affixBonus += affixes.flatDamage;
      }
      
      // Percent damage bonus (applied to total)
      if (affixes.percentDamage) {
        const percentBonus = (baseAttack + weaponAttack + affixBonus) * (affixes.percentDamage / 100);
        affixBonus += percentBonus;
      }
    }
    
    return Math.floor(baseAttack + weaponAttack + affixBonus);
  }, [hero, equippedWeapon]);
  
  const getBaseDefense = useCallback(() => {
    if (!hero || !hero.class || !hero.class.name) return 5;
    
    // Get base defense from class
    const baseDefense = GAME_CONSTANTS.BASE_DEFENSE_BY_CLASS[hero.class.name] || 5;
    
    // Calculate total defense from equipped armor
    const armorDefense = Object.values(equippedArmor).reduce((total, piece) => {
      return total + (piece ? piece.defense : 0);
    }, 0);
    
    // Add armor affixes
    let affixBonus = 0;
    Object.values(equippedArmor).forEach(piece => {
      if (piece && piece.affixes) {
        if (piece.affixes.flatArmor) {
          affixBonus += piece.affixes.flatArmor;
        }
      }
    });
    
    return Math.floor(baseDefense + armorDefense + affixBonus);
  }, [hero, equippedArmor]);
  
  // Rarity rolling system
  const rollRarity = useCallback((enemyType = 'normal') => {
    const roll = Math.random() * 100;
    
    // Elite and boss enemies have better drop rates
    const rates = enemyType === 'boss' ? {
      common: 5,
      uncommon: 15,
      rare: 35,
      epic: 30,
      legendary: 15
    } : enemyType === 'elite' ? {
      common: 30,
      uncommon: 35,
      rare: 25,
      epic: 8,
      legendary: 2
    } : {
      common: 50,
      uncommon: 30,
      rare: 15,
      epic: 4,
      legendary: 1
    };
    
    let cumulative = 0;
    for (const [rarity, chance] of Object.entries(rates)) {
      cumulative += chance;
      if (roll < cumulative) {
        return rarity;
      }
    }
    return 'common';
  }, []);
  
  // Get rarity color
  const getRarityColor = useCallback((rarity) => {
    return GAME_CONSTANTS.RARITY_TIERS[rarity]?.color || '#9E9E9E';
  }, []);
  
  // Sort items by rarity (legendary > epic > rare > uncommon > common)
  const sortByRarity = useCallback((items) => {
    const rarityOrder = { legendary: 5, epic: 4, rare: 3, uncommon: 2, common: 1 };
    return [...items].sort((a, b) => (rarityOrder[b.rarity] || 0) - (rarityOrder[a.rarity] || 0));
  }, []);
  
  // Scale stats by rarity (multipliers)
  const getRarityMultiplier = useCallback((rarity) => {
    const multipliers = {
      common: 1.0,
      uncommon: 1.3,
      rare: 1.6,
      epic: 2.0,
      legendary: 2.5
    };
    return multipliers[rarity] || 1.0;
  }, []);
  
  // Generate affixes for equipment based on rarity
  const generateAffixes = useCallback((rarity, type = 'weapon') => {
    const budget = GAME_CONSTANTS.GEAR_BUDGET[rarity];
    if (!budget) return {};
    
    const affixCosts = GAME_CONSTANTS.AFFIX_COSTS[type];
    const affixTypes = Object.keys(affixCosts);
    
    // Randomly select affixes
    const selectedAffixes = [];
    const availableAffixes = [...affixTypes];
    
    for (let i = 0; i < budget.affixCount && availableAffixes.length > 0; i++) {
      const randomIndex = Math.floor(Math.random() * availableAffixes.length);
      selectedAffixes.push(availableAffixes[randomIndex]);
      availableAffixes.splice(randomIndex, 1);
    }
    
    // Distribute budget across selected affixes
    const affixes = {};
    let remainingBudget = budget.totalBudget;
    
    selectedAffixes.forEach((affixType, index) => {
      const isLast = index === selectedAffixes.length - 1;
      const cost = affixCosts[affixType];
      
      if (isLast) {
        // Give remaining budget to last affix
        affixes[affixType] = remainingBudget / cost;
      } else {
        // Random allocation between powerRange
        const minAlloc = Math.floor(budget.affixPowerRange[0]);
        const maxAlloc = Math.floor(budget.affixPowerRange[1]);
        const budgetPoints = Math.min(
          remainingBudget,
          Math.floor(Math.random() * (maxAlloc - minAlloc + 1)) + minAlloc
        );
        affixes[affixType] = budgetPoints / cost;
        remainingBudget -= budgetPoints;
      }
    });
    
    return affixes;
  }, []);
  
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
  
  // Study Links Feature
  const [studyWebsites, setStudyWebsites] = useState([]);
  const [newWebsiteName, setNewWebsiteName] = useState('');
  const [newWebsiteUrl, setNewWebsiteUrl] = useState('');
  const [newWebsiteCategory, setNewWebsiteCategory] = useState('uncategorized');
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [newPlanItem, setNewPlanItem] = useState({ title: '', priority: 'routine' });
  const [showImportModal, setShowImportModal] = useState(false);
  
  const [calendarTasks, setCalendarTasks] = useState({});
  const [calendarFocus, setCalendarFocus] = useState({}); // Store focus class for each date
  const [calendarEvents, setCalendarEvents] = useState({}); // Store simple events for each date
  const [flashcardDecks, setFlashcardDecks] = useState([]);
const [showDeckModal, setShowDeckModal] = useState(false);
const [showCardModal, setShowCardModal] = useState(false);
const [showStudyModal, setShowStudyModal] = useState(false);
const [selectedDeck, setSelectedDeck] = useState(null);
const [currentCardIndex, setCurrentCardIndex] = useState(0);
const [studyQueue, setStudyQueue] = useState([]); // Queue of card indices to study
const [isFlipped, setIsFlipped] = useState(false);
const [newDeck, setNewDeck] = useState({ name: '' });
const [newCard, setNewCard] = useState({ front: '', back: '' });
const [showQuizModal, setShowQuizModal] = useState(false);
const [quizQuestions, setQuizQuestions] = useState([]);
const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
const [quizScore, setQuizScore] = useState(0);
const [selectedAnswer, setSelectedAnswer] = useState(null);

  // Achievement system state
  const [achievementStats, setAchievementStats] = useState({
    cards_created: 0,
    decks_created: 0,
    cards_mastered: 0,
    battles_won: 0,
    elite_bosses_defeated: 0,
    gauntlet_completed: 0,
    streak_days: 0,
    cycles_completed: 0,
    level_reached: 1,
    perfect_days: 0
  });
  const [unlockedAchievements, setUnlockedAchievements] = useState([]);
  const [showAchievementNotification, setShowAchievementNotification] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
const [showQuizResults, setShowQuizResults] = useState(false);
const [wrongCardIndices, setWrongCardIndices] = useState([]);
const [isRetakeQuiz, setIsRetakeQuiz] = useState(false);
const [mistakesReviewed, setMistakesReviewed] = useState(false);
const [reviewingMistakes, setReviewingMistakes] = useState(false);

// Match game state
const [showMatchModal, setShowMatchModal] = useState(false);
const [matchCards, setMatchCards] = useState([]); // Array of {id, text, type: 'term'|'definition', pairId, matched}
const [selectedMatchCards, setSelectedMatchCards] = useState([]); // Array of selected card indices
const [matchedPairs, setMatchedPairs] = useState([]); // Array of pairIds that have been matched
const [matchStartTime, setMatchStartTime] = useState(null);
const [matchGlowCards, setMatchGlowCards] = useState([]); // Cards currently glowing

  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [newCalendarTask, setNewCalendarTask] = useState({ title: '', priority: 'routine' });
  const [newEvent, setNewEvent] = useState('');
  const [newFocus, setNewFocus] = useState('');
  
  const [showBoss, setShowBoss] = useState(false);
  const [bossHp, setBossHp] = useState(0);
  const [bossMax, setBossMax] = useState(0);
  const [battleType, setBattleType] = useState('regular');
const [waveCount, setWaveCount] = useState(0);
const [currentWaveEnemy, setCurrentWaveEnemy] = useState(0);
const [totalWaveEnemies, setTotalWaveEnemies] = useState(0);
const [waveGoldTotal, setWaveGoldTotal] = useState(0);
  const [battling, setBattling] = useState(false);
  const [battleMenu, setBattleMenu] = useState('main'); // 'main', 'fight', 'items'
  const [isFinalBoss, setIsFinalBoss] = useState(false);
  const [miniBossCount, setMiniBossCount] = useState(0);
  const [bossName, setBossName] = useState('');
  const [canFlee, setCanFlee] = useState(false);
  const [hasFled, setHasFled] = useState(false);
  const [bossDebuffs, setBossDebuffs] = useState({ 
    poisonTurns: 0, 
    poisonDamage: 0, 
    poisonedVulnerability: 0,
    stunned: false
  });
  const [recklessStacks, setRecklessStacks] = useState(0);
  
  // New special attack mechanics
  const [chargeStacks, setChargeStacks] = useState(0); // 0-3 charges for all classes
  const [knightBloodOathTurns, setKnightBloodOathTurns] = useState(0); // Buff duration
  const [knightConsecutiveUses, setKnightConsecutiveUses] = useState(0); // HP cost escalation
  const [knightCrushingBlowCooldown, setKnightCrushingBlowCooldown] = useState(false); // Can't use twice in a row
  const [wizardTemporalBuff, setWizardTemporalBuff] = useState(false); // Next attack bonus
  const [wizardStaminaRegen, setWizardStaminaRegen] = useState(false); // Regen flag
  const [wizardTemporalCooldown, setWizardTemporalCooldown] = useState(false); // Can't use twice in a row
  const [assassinPoisonStacks, setAssassinPoisonStacks] = useState(0); // 0-2 stacks
  const [crusaderHolyEmpowerment, setCrusaderHolyEmpowerment] = useState(0); // Holy Empowerment turns remaining
  const [crusaderJudgmentCooldown, setCrusaderJudgmentCooldown] = useState(false); // Can't spam Judgment
  const [crusaderSmiteCooldown, setCrusaderSmiteCooldown] = useState(false); // Can't spam Smite
  
  // Tactical skills state
  const [knightRallyingRoar, setKnightRallyingRoar] = useState(0); // Turns remaining
  const [knightRallyingRoarCooldown, setKnightRallyingRoarCooldown] = useState(false);
  const [wizardEtherealBarrier, setWizardEtherealBarrier] = useState(0); // Turns remaining
  const [wizardEtherealBarrierCooldown, setWizardEtherealBarrierCooldown] = useState(false);
  const [assassinMarkForDeath, setAssassinMarkForDeath] = useState(0); // Turns remaining
  const [assassinMarkForDeathCooldown, setAssassinMarkForDeathCooldown] = useState(false);
  const [crusaderBastionOfFaith, setCrusaderBastionOfFaith] = useState(0); // Turns remaining
  const [crusaderBastionOfFaithCooldown, setCrusaderBastionOfFaithCooldown] = useState(false);
  
  // Phase 3 Gauntlet mechanics
  const [inPhase3, setInPhase3] = useState(false);
  const [inPhase2, setInPhase2] = useState(false);
  const [inPhase1, setInPhase1] = useState(false);
  const [phase1TurnCounter, setPhase1TurnCounter] = useState(0);
  const [phase2TurnCounter, setPhase2TurnCounter] = useState(0);
  const [phase2DamageStacks, setPhase2DamageStacks] = useState(0);
  const [hasSpawnedPreviewAdd, setHasSpawnedPreviewAdd] = useState(false);
  const [shadowAdds, setShadowAdds] = useState([]); // Array of {id, hp, maxHp}
  const [aoeWarning, setAoeWarning] = useState(false);
  const [showDodgeButton, setShowDodgeButton] = useState(false);
  const [dodgeReady, setDodgeReady] = useState(false);
  const [phase3TurnCounter, setPhase3TurnCounter] = useState(0);
  const [lifeDrainCounter, setLifeDrainCounter] = useState(0);
  
  const [currentAnimation, setCurrentAnimation] = useState(null);
  const [battleMode, setBattleMode] = useState(false);
  const [bossFlash, setBossFlash] = useState(false);
  const [playerFlash, setPlayerFlash] = useState(false);
  const [victoryFlash, setVictoryFlash] = useState(false);
  const [victoryLoot, setVictoryLoot] = useState([]);
  const [showDebug, setShowDebug] = useState(false);
  const [canCustomize, setCanCustomize] = useState(true);
const [showCustomizeModal, setShowCustomizeModal] = useState(false);
const [customName, setCustomName] = useState('');
const [customClass, setCustomClass] = useState(null);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [suppliesTab, setSuppliesTab] = useState('potions'); // 'potions' or 'armor'
  const [showCraftingModal, setShowCraftingModal] = useState(false);
  const [craftingTab, setCraftingTab] = useState('craft'); // 'craft', 'manage', 'disenchant', 'links'
  const [weaponOilActive, setWeaponOilActive] = useState(false);
  const [armorPolishActive, setArmorPolishActive] = useState(false);
  const [luckyCharmActive, setLuckyCharmActive] = useState(false);
  const [enemyDialogue, setEnemyDialogue] = useState('');
  const [playerTaunt, setPlayerTaunt] = useState('');
  const [enemyTauntResponse, setEnemyTauntResponse] = useState('');
  const [showTauntBoxes, setShowTauntBoxes] = useState(false);
  const [isTauntAvailable, setIsTauntAvailable] = useState(false);
  const [hasTriggeredLowHpTaunt, setHasTriggeredLowHpTaunt] = useState(false);
  const [enragedTurns, setEnragedTurns] = useState(0);
  const [log, setLog] = useState([]);
  const [graveyard, setGraveyard] = useState([]);
  const [heroes, setHeroes] = useState([]);
  const [skipCount, setSkipCount] = useState(0);
  const [consecutiveDays, setConsecutiveDays] = useState(0);
  const [lastPlayedDate, setLastPlayedDate] = useState(null);
  const [curseLevel, setCurseLevel] = useState(0); // 0 = none, 1-3 = curse levels
const [eliteBossDefeatedToday, setEliteBossDefeatedToday] = useState(false);
const [cleansePotionPurchasedToday, setCleansePotionPurchasedToday] = useState(false);
const [lastRealDay, setLastRealDay] = useState(null);
const [debugWarningState, setDebugWarningState] = useState(null); // null = auto, or 'locked', 'unlocked', 'evening', 'finalhour'
  
  // QoL state variables
  const [showSavedIndicator, setShowSavedIndicator] = useState(false);
  const [hideCompletedTasks, setHideCompletedTasks] = useState(false);
  const [draggedTask, setDraggedTask] = useState(null);
  const [draggedPlanTask, setDraggedPlanTask] = useState(null);
  const [hidePlannerCompleted, setHidePlannerCompleted] = useState(false);
  
  const [studyStats, setStudyStats] = useState({
    totalMinutesToday: 0,
    totalMinutesWeek: 0,
    sessionsToday: 0,
    longestStreak: 0,
    currentStreak: 0,
    tasksCompletedToday: 0,
    deepWorkSessions: 0,
    perfectDays: 0,
    weeklyHistory: []
  });
  
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [taskPauseCount, setTaskPauseCount] = useState(0);
  
  const classes = [
    { name: 'Knight', color: 'red', emblem: '⚔︎', gradient: ['from-red-900', 'from-red-800', 'from-red-700', 'from-red-600'], glow: ['shadow-red-900/50', 'shadow-red-700/60', 'shadow-red-600/70', 'shadow-red-500/80'] },
    { name: 'Wizard', color: 'blue', emblem: '✦', gradient: ['from-blue-700', 'from-blue-600', 'from-blue-500', 'from-blue-400'], glow: ['shadow-blue-700/60', 'shadow-blue-600/70', 'shadow-blue-500/80', 'shadow-blue-400/90'] },
    { name: 'Assassin', color: 'green', emblem: '†', gradient: ['from-green-900', 'from-green-800', 'from-green-700', 'from-green-600'], glow: ['shadow-green-900/50', 'shadow-green-700/60', 'shadow-green-600/70', 'shadow-green-500/80'] },
    { name: 'Crusader', color: 'white', emblem: '✙', gradient: ['from-gray-100', 'from-gray-50', 'from-white', 'from-white'], glow: ['shadow-gray-200/80', 'shadow-gray-100/90', 'shadow-white/95', 'shadow-white/100'] }
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
      title: HERO_TITLES[0],
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
      blue: ['#2563EB', '#2563EB', '#3B82F6', '#60A5FA', '#60A5FA', '#93C5FD', '#93C5FD'],
      green: ['#004d00', '#004d00', '#006400', '#228B22', '#228B22', '#32CD32', '#32CD32'],
      white: ['#D1D5DB', '#D1D5DB', '#E5E7EB', '#F3F4F6', '#F9FAFB', '#FFFFFF', '#FFFFFF'],
      purple: ['#4B0082', '#4B0082', '#6A0DAD', '#8B008B', '#8B008B', '#9370DB', '#9370DB'],
      yellow: ['#B8860B', '#B8860B', '#DAA520', '#FFD700', '#FFD700', '#FFEC8B', '#FFEC8B'],
      amber: ['#8B4513', '#8B4513', '#A0522D', '#CD853F', '#CD853F', '#DEB887', '#DEB887']
    };
    const toColors = {
      red: ['to-red-800', 'to-red-800', 'to-red-700', 'to-red-600', 'to-red-600', 'to-orange-500', 'to-orange-500'],
      blue: ['to-blue-600', 'to-blue-600', 'to-blue-500', 'to-blue-400', 'to-blue-400', 'to-blue-300', 'to-blue-300'],
      green: ['to-green-800', 'to-green-800', 'to-green-700', 'to-emerald-600', 'to-emerald-600', 'to-teal-500', 'to-teal-500'],
      white: ['to-gray-200', 'to-gray-200', 'to-gray-100', 'to-gray-50', 'to-gray-50', 'to-white', 'to-white'],
      purple: ['to-purple-800', 'to-purple-800', 'to-purple-700', 'to-indigo-600', 'to-indigo-600', 'to-pink-500', 'to-pink-500'],
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
  
  // Study Links Functions
  const addStudyWebsite = useCallback(() => {
    if (!newWebsiteName.trim() || !newWebsiteUrl.trim()) {
      alert('Please enter both a name and URL');
      return;
    }
    
    // Add https:// if missing
    let url = newWebsiteUrl.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    
    const newSite = {
      id: Date.now(),
      name: newWebsiteName.trim(),
      url: url,
      category: newWebsiteCategory,
      addedDate: new Date().toISOString(),
      clicks: 0
    };
    
    setStudyWebsites(prev => [...prev, newSite]);
    setNewWebsiteName('');
    setNewWebsiteUrl('');
    setNewWebsiteCategory('uncategorized');
    
    // Gold reward for organizing resources
    const goldReward = 5;
    setGold(g => g + goldReward);
    addLog(`⚔️ Knowledge relic forged! +${goldReward} Gold`);
  }, [newWebsiteName, newWebsiteUrl, newWebsiteCategory, addLog]);
  
  const removeStudyWebsite = useCallback((id) => {
    setStudyWebsites(prev => prev.filter(site => site.id !== id));
  }, []);
  
  const trackWebsiteClick = useCallback((id) => {
    setStudyWebsites(prev => prev.map(site => 
      site.id === id ? { ...site, clicks: site.clicks + 1 } : site
    ));
  }, []);
  
  // Achievement system functions
  const checkAchievements = useCallback((stats = achievementStats) => {
    GAME_CONSTANTS.ACHIEVEMENTS.forEach(achievement => {
      // Skip if already unlocked
      if (unlockedAchievements.includes(achievement.id)) return;
      
      // Check if requirement is met
      const statValue = stats[achievement.req.type] || 0;
      if (statValue >= achievement.req.count) {
        unlockAchievement(achievement);
      }
    });
  }, [achievementStats, unlockedAchievements]);
  
  const unlockAchievement = useCallback((achievement) => {
    // Add to unlocked list
    setUnlockedAchievements(prev => [...prev, achievement.id]);
    
    // Grant rewards
    const reward = achievement.reward;
    if (reward.xp) setXp(prev => prev + reward.xp);
    if (reward.maxHP) setHp(prev => prev + reward.maxHP); // Directly increase HP
    if (reward.maxSP) setStamina(prev => prev + reward.maxSP); // Directly increase stamina
    if (reward.weapon) setWeapon(prev => prev + reward.weapon);
    if (reward.armor) setArmor(prev => prev + reward.armor);
    
    // Gold reward based on achievement rarity
    const goldRewards = {
      COMMON: 15,
      RARE: 30,
      EPIC: 50,
      LEGENDARY: 100
    };
    const goldReward = goldRewards[achievement.rarity] || 20;
    setGold(prev => prev + goldReward);
    
    // Show notification
    setShowAchievementNotification(achievement);
    sounds.achievementUnlock();
    setTimeout(() => setShowAchievementNotification(null), 5000);
    
    // Log unlock
    addLog(`🏆 Achievement Unlocked: ${achievement.name}! +${goldReward} Gold`);
  }, [addLog]);
  
  const updateAchievementStat = useCallback((type, increment = 1) => {
    setAchievementStats(prev => {
      const newStats = { ...prev, [type]: prev[type] + increment };
      checkAchievements(newStats);
      return newStats;
    });
  }, [checkAchievements]);
  
  const generateQuiz = useCallback((deckIndex, isRetake = false) => {
    const deck = flashcardDecks[deckIndex];
    if (!deck || deck.cards.length < 4) {
      alert('Need at least 4 cards to generate a quiz!');
      return;
    }
    
    // Shuffle cards for quiz order
    const shuffledCards = [...deck.cards].sort(() => Math.random() - 0.5);
    
    const questions = shuffledCards.map((card, idx) => {
      // Get the original index of this card in the deck
      const originalIndex = deck.cards.indexOf(card);
      
      // Get 3 random wrong answers from other cards
      const otherCards = deck.cards.filter((_, i) => i !== originalIndex);
      const wrongAnswers = otherCards
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map(c => c.back);
      
      // Combine correct and wrong answers, then shuffle
      const allChoices = [card.back, ...wrongAnswers].sort(() => Math.random() - 0.5);
      
      return {
        question: card.front,
        correctAnswer: card.back,
        choices: allChoices,
        cardIndex: originalIndex // Store original index
      };
    });
    
    setQuizQuestions(questions);
    setCurrentQuizIndex(0);
    setQuizScore(0);
    setSelectedAnswer(null);
    setShowQuizResults(false);
    setWrongCardIndices([]);
    setIsRetakeQuiz(isRetake);
    setMistakesReviewed(false);
    setReviewingMistakes(false);
    setShowQuizModal(true);
  }, [flashcardDecks]);
  
  const startMatchGame = useCallback((deckIndex) => {
    const deck = flashcardDecks[deckIndex];
    if (!deck || deck.cards.length < 4) {
      alert('Need at least 4 cards for Match!');
      return;
    }
    
    // Take up to 8 cards (so 16 total cards in the grid)
    const cardsToUse = deck.cards.slice(0, Math.min(8, deck.cards.length));
    
    // Create array with both terms and definitions
    const matchCardsArray = [];
    cardsToUse.forEach((card, idx) => {
      matchCardsArray.push({
        id: `term-${idx}`,
        text: card.front,
        type: 'term',
        pairId: idx,
        matched: false
      });
      matchCardsArray.push({
        id: `def-${idx}`,
        text: card.back,
        type: 'definition',
        pairId: idx,
        matched: false
      });
    });
    
    // Shuffle the cards
    const shuffled = matchCardsArray.sort(() => Math.random() - 0.5);
    
    setMatchCards(shuffled);
    setSelectedMatchCards([]);
    setMatchedPairs([]);
    setMatchGlowCards([]);
    setMatchStartTime(Date.now());
    setSelectedDeck(deckIndex);
    setShowMatchModal(true);
  }, [flashcardDecks]);
  
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
        // Migrate old "essence" saves to "gold"
        if (data.gold !== undefined) {
          setGold(data.gold);
        } else if (data.essence !== undefined) {
          setGold(data.essence); // Backwards compatibility
        }
        if (data.gauntletMilestone !== undefined) setGauntletMilestone(data.gauntletMilestone);
        if (data.gauntletUnlocked !== undefined) setGauntletUnlocked(data.gauntletUnlocked);
        if (data.isDayActive !== undefined) setIsDayActive(data.isDayActive);
        if (data.marketModifiers) setMarketModifiers(data.marketModifiers);
        if (data.lastMarketUpdateDay !== undefined) setLastMarketUpdateDay(data.lastMarketUpdateDay);
        if (data.shopInventory) setShopInventory(data.shopInventory);
        if (data.daysSinceShop !== undefined) setDaysSinceShop(data.daysSinceShop);
        if (data.dailyQuestCompleted !== undefined) setDailyQuestCompleted(data.dailyQuestCompleted);
        if (data.level !== undefined) setLevel(data.level);
        if (data.healthPots !== undefined) setHealthPots(data.healthPots);
        if (data.staminaPots !== undefined) setStaminaPots(data.staminaPots);
        if (data.cleansePots !== undefined) setCleansePots(data.cleansePots);
        if (data.weapon !== undefined) setWeapon(data.weapon);
        if (data.armor !== undefined) setArmor(data.armor);
        if (data.equippedWeapon) setEquippedWeapon(data.equippedWeapon);
        if (data.weaponInventory) setWeaponInventory(data.weaponInventory);
        if (data.equippedArmor) setEquippedArmor(data.equippedArmor);
        if (data.armorInventory) setArmorInventory(data.armorInventory);
        if (data.equippedPendant) setEquippedPendant(data.equippedPendant);
        if (data.equippedRing) setEquippedRing(data.equippedRing);
        if (data.pendantInventory) setPendantInventory(data.pendantInventory);
        if (data.ringInventory) setRingInventory(data.ringInventory);
        if (data.tasks) setTasks(data.tasks);
        if (data.flashcardDecks) setFlashcardDecks(data.flashcardDecks);
        if (data.graveyard) setGraveyard(data.graveyard);
        if (data.heroes) setHeroes(data.heroes);
        if (data.hasStarted !== undefined) setHasStarted(data.hasStarted);
        if (data.skipCount !== undefined) setSkipCount(data.skipCount);
        if (data.consecutiveDays !== undefined) setConsecutiveDays(data.consecutiveDays);
        if (data.lastPlayedDate) setLastPlayedDate(data.lastPlayedDate);
       if (data.curseLevel !== undefined) setCurseLevel(data.curseLevel);
if (data.eliteBossDefeatedToday !== undefined) setEliteBossDefeatedToday(data.eliteBossDefeatedToday);
if (data.lastRealDay) setLastRealDay(data.lastRealDay);
        if (data.studyStats) setStudyStats(data.studyStats);
        if (data.weeklyPlan) setWeeklyPlan(data.weeklyPlan);
        if (data.calendarTasks) setCalendarTasks(data.calendarTasks);
        if (data.calendarFocus) setCalendarFocus(data.calendarFocus);
        if (data.calendarEvents) {
          // Migrate old string format to array format
          const migratedEvents = {};
          Object.keys(data.calendarEvents).forEach(dateKey => {
            const eventData = data.calendarEvents[dateKey];
            if (typeof eventData === 'string') {
              // Old format: single string
              migratedEvents[dateKey] = eventData ? [eventData] : [];
            } else if (Array.isArray(eventData)) {
              // New format: already array
              migratedEvents[dateKey] = eventData;
            } else {
              // Invalid format: skip
              migratedEvents[dateKey] = [];
            }
          });
          setCalendarEvents(migratedEvents);
        }
        if (data.studyWebsites) setStudyWebsites(data.studyWebsites);
      } catch (e) {
        console.error('Failed to load save:', e);
        // If saved data is corrupted, generate new hero
        setHero(makeName());
      }
    } else {
      // No saved data exists - generate new hero
      setHero(makeName());
    }
    
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);
  
  // Initialize starting equipment when hero is created
  useEffect(() => {
    if (hero && hero.class && hero.class.name) {
      // Initialize weapon if not already set
      if (!equippedWeapon) {
        const startingWeapon = GAME_CONSTANTS.STARTING_WEAPONS[hero.class.name];
        if (startingWeapon) {
          setEquippedWeapon(startingWeapon);
        }
      }
      
      // Initialize armor if not already set
      if (!equippedArmor.helmet) {
        const startingGear = GAME_CONSTANTS.STARTING_EQUIPMENT[hero.class.name];
        if (startingGear) {
          setEquippedArmor({
            helmet: startingGear.helmet,
            chest: startingGear.chest,
            gloves: startingGear.gloves,
            boots: startingGear.boots
          });
          
          // Initialize accessories
          if (startingGear.pendant) {
            setEquippedPendant(startingGear.pendant);
          }
          if (startingGear.ring) {
            setEquippedRing(startingGear.ring);
          }
        }
      }
    }
  }, [hero, equippedArmor.helmet, equippedWeapon]);
  
  useEffect(() => {
    if (hero) {
     const saveData = {
  hero, currentDay, hp, stamina, xp, gold, level, healthPots, staminaPots, cleansePots,
  weapon, armor, equippedWeapon, weaponInventory, equippedArmor, armorInventory, 
  equippedPendant, equippedRing, pendantInventory, ringInventory,
  tasks, flashcardDecks, graveyard, heroes, hasStarted, skipCount, consecutiveDays,
  lastPlayedDate, curseLevel, eliteBossDefeatedToday, lastRealDay, studyStats, weeklyPlan, calendarTasks, calendarFocus, calendarEvents,
  gauntletMilestone, gauntletUnlocked,
  isDayActive, marketModifiers, lastMarketUpdateDay, shopInventory, daysSinceShop, dailyQuestCompleted,
  studyWebsites
};
      localStorage.setItem('fantasyStudyQuest', JSON.stringify(saveData));
      
      // Show auto-save indicator
      setShowSavedIndicator(true);
      setTimeout(() => setShowSavedIndicator(false), 1500);
    }
 }, [hero, currentDay, hp, stamina, xp, gold, level, healthPots, staminaPots, cleansePots, weapon, armor, equippedWeapon, weaponInventory, equippedArmor, armorInventory, equippedPendant, equippedRing, pendantInventory, ringInventory, tasks, graveyard, heroes, hasStarted, skipCount, consecutiveDays, lastPlayedDate, curseLevel, eliteBossDefeatedToday, lastRealDay, studyStats, weeklyPlan, calendarTasks, calendarFocus, calendarEvents, flashcardDecks, gauntletMilestone, gauntletUnlocked, isDayActive, marketModifiers, lastMarketUpdateDay, shopInventory, daysSinceShop, dailyQuestCompleted, studyWebsites]);
  
  // ESC key to close modals
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setShowModal(false);
        setShowPlanModal(false);
        setShowCalendarModal(false);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);
  
  // Check if XP crosses Gauntlet milestone
  useEffect(() => {
    if (xp >= gauntletMilestone && !gauntletUnlocked) {
      setGauntletUnlocked(true);
      addLog(`The Gauntlet has been unlocked! Face the trial when ready...`);
    }
  }, [xp, gauntletMilestone, gauntletUnlocked, addLog]);
  
  // Update countdown to midnight every second (only shows last hour)
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      
      const diff = midnight - now;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      // Only show countdown if less than 1 hour remains
      if (hours < 1) {
        setTimeUntilMidnight(`${minutes}m ${seconds}s`);
      } else {
        setTimeUntilMidnight('');
      }
    };
    
    updateCountdown(); // Initial update
    const interval = setInterval(updateCountdown, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Detect when real calendar day changes and auto-advance
  useEffect(() => {
    const checkDayChange = () => {
      const today = new Date().toDateString();
      
      if (lastRealDay && lastRealDay !== today) {
        // New day detected!
        
        // Check if day is dormant
        if (!isDayActive) {
          // Dormant day - no midnight logic, no curse, no advancement
          // (Silent - no log message)
        } else {
          // Active day - check midnight consequences
          const nextDay = currentDay + 1;
          
          // Check curse before advancing
          if (!eliteBossDefeatedToday) {
            // Didn't beat elite boss - apply curse penalty
            addLog('Elite Boss sealed - Midnight passed, opportunity missed');
            
            const newCurseLevel = curseLevel + 1;
            setCurseLevel(newCurseLevel);
            
            if (newCurseLevel >= 4) {
              // 4th missed boss = death
              addLog('The curse consumes the hero. Four failures... the abyss claims your soul.');
              setTimeout(() => die(), 2000);
              return;
            }
            
            // Apply curse penalties
            const cursePenalties = [
              { hp: 10, msg: '🌑 CURSED. The curse takes root... -10 HP' },
              { hp: 20, msg: '🌑🌑 DEEPLY CURSED. The curse tightens its grip... -20 HP' },
              { hp: 40, msg: '☠️ CONDEMNED. One more failure... and the abyss claims you. -40 HP' }
            ];
            
            const penalty = cursePenalties[newCurseLevel - 1];
            setHp(h => Math.max(1, h - penalty.hp));
            addLog(penalty.msg);
          } else {
            // Beat yesterday's boss - clear curse if present
            if (curseLevel > 0) {
              setCurseLevel(0);
              addLog('The curse lifts! Yesterday\'s trial complete.');
            }
          }
          
          // Reset daily elite boss flag for new day
          setEliteBossDefeatedToday(false);
          setCleansePotionPurchasedToday(false);
          
          // Advance day
          setCurrentDay(nextDay);
          
          // Track cycle completion (every 7 days)
          if (currentDay === 7) {
            updateAchievementStat('cycles_completed');
          }
          
          setHero(prev => ({
            ...prev,
            day: nextDay,
          title: HERO_TITLES[(nextDay - 1) % HERO_TITLES.length], // Wrap titles
          survived: prev.survived + 1
        }));
        
        // Handle tasks on day change
        const completedCount = tasks.filter(t => t.done).length;
        const incompleteCount = tasks.filter(t => !t.done).length;
        
        // Mark incomplete tasks as overdue
        setTasks(prevTasks => 
          prevTasks
            .filter(t => !t.done) // Remove completed tasks
            .map(t => ({ ...t, overdue: true })) // Mark remaining as overdue
        );
        
        if (completedCount > 0) {
          addLog(`The hero cleared ${completedCount} completed task${completedCount > 1 ? 's' : ''}`);
        }
        if (incompleteCount > 0) {
          addLog(`Warning: ${incompleteCount} incomplete task${incompleteCount > 1 ? 's' : ''} marked OVERDUE`);
        }
        
        addLog('Midnight has passed - Day auto-advanced');
        addLog(`The chronicle continues on Day ${nextDay} (Dormant)`);
        
        // Set day to dormant until next engagement
        setIsDayActive(false);
        }
      }
      
      // Always update to current day
      setLastRealDay(today);
    };
    
    checkDayChange(); // Check on mount
    const interval = setInterval(checkDayChange, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, [lastRealDay, currentDay, eliteBossDefeatedToday, curseLevel, isDayActive, tasks, addLog]);
  
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
            addLog(`Time expired for: ${task?.title || 'task'}!`);
            addLog(`Time ran out! Lost 10 HP as penalty.`);
          }
        }
      }, 1000);
    }
    return () => clearInterval(int);
  }, [running, timerEndTime, activeTask, tasks, addLog]);
  
  // Track level achievements
  useEffect(() => {
    const currentLevel = Math.floor(xp / GAME_CONSTANTS.XP_PER_LEVEL) + 1;
    if (currentLevel > achievementStats.level_reached) {
      setAchievementStats(prev => ({ ...prev, level_reached: currentLevel }));
      checkAchievements({ ...achievementStats, level_reached: currentLevel });
    }
  }, [xp, achievementStats, checkAchievements]);

  useEffect(() => {
  let interval;
  if (pomodoroRunning && pomodoroTimer > 0) {
    interval = setInterval(() => {
      setPomodoroTimer(t => {
        if (t <= 1) {
          // Timer finished
          
          // Play sound and show notification
          if (Notification.permission === "granted") {
            new Notification(isBreak ? "Break Over! 🎯" : "Pomodoro Complete! 🍅", {
              body: isBreak ? "Time to get back to work!" : "Great work! Take a 5 minute break.",
              icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100'><text y='75' font-size='75'>🍅</text></svg>"
            });
          }
          
          if (!isBreak) {
            // Work session done - start break automatically
            setPomodorosCompleted(p => p + 1);
            addLog(`Pomodoro session #${pomodorosCompleted + 1} completed! Starting break...`);
            setIsBreak(true);
            setPomodoroTimer(5 * 60); // 5 minute break
            // Keep running so break auto-starts
          } else {
            // Break done - stop and wait for user to resume
            addLog(`The break ends. Ready for another pomodoro?`);
            setIsBreak(false);
            setPomodoroTimer(25 * 60); // 25 minute work session
            setPomodoroRunning(false); // Stop here so user can choose to continue
          }
          
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  }
  return () => clearInterval(interval);
}, [pomodoroRunning, pomodoroTimer, isBreak, pomodorosCompleted, addLog]);

  // Update market prices daily (not when merchant opens)
  useEffect(() => {
    if (currentDay > lastMarketUpdateDay) {
      updateMarketPrices();
      setLastMarketUpdateDay(currentDay);
      addLog('Market prices have shifted overnight...');
    }
  }, [currentDay]);
  
  // Check for daily quest completion and award bonus
  useEffect(() => {
    if (currentDay > 0 && tasks.length > 0 && !dailyQuestCompleted) {
      const allTasksDone = tasks.every(t => t.done);
      
      if (allTasksDone) {
        const config = GAME_CONSTANTS.ECONOMY_CONFIG;
        const baseReward = config.dailyBaseGold + (currentDay * config.dailyDayScale);
        const streakBonus = Math.min(consecutiveDays, 7) * config.dailyStreakBonus;
        const totalReward = baseReward + streakBonus;
        
        setGold(g => g + totalReward);
        setDailyQuestCompleted(true);
        
        if (streakBonus > 0) {
          addLog(`Daily quests complete! Earned ${totalReward} Gold (${baseReward} base + ${streakBonus} streak bonus)`);
        } else {
          addLog(`Daily quests complete! Earned ${totalReward} Gold`);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks, currentDay, dailyQuestCompleted, consecutiveDays]);
  
  // Reset daily quest flag when day changes
  useEffect(() => {
    setDailyQuestCompleted(false);
  }, [currentDay]);
  
  // Refresh shop inventory on merchant open if it's a refresh day
  useEffect(() => {
    if (showCraftingModal && currentDay > 0) {
      // Calculate if we're on a refresh day (1, 3, 5, 7...)
      const shouldHaveShop = currentDay % GAME_CONSTANTS.SHOP_CONFIG.refreshInterval === 1;
      
      if (shouldHaveShop && daysSinceShop !== currentDay) {
        generateShopInventory();
        setDaysSinceShop(currentDay);
      } else if (!shouldHaveShop && shopInventory.length === 0 && daysSinceShop === 0) {
        // First time opening, generate initial shop
        generateShopInventory();
        setDaysSinceShop(currentDay);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showCraftingModal, currentDay, daysSinceShop, shopInventory.length]);
  
  useEffect(() => {
    // Exponential XP curve: Level 1→2 = 100 XP, Level 2→3 = 130 XP, Level 3→4 = 169 XP, etc.
    let xpNeeded = 0;
    let newLevel = 1;
    let currentXp = xp;
    
    while (currentXp >= xpNeeded) {
      xpNeeded = Math.floor(GAME_CONSTANTS.XP_PER_LEVEL * Math.pow(1.3, newLevel - 1));
      if (currentXp >= xpNeeded) {
        newLevel++;
        currentXp -= xpNeeded;
      } else {
        break;
      }
    }
    
    if (newLevel > level) {
      setLevel(newLevel);
      sounds.levelUp();
      addLog(`The hero has grown stronger! Now level ${newLevel}`);
      setHp(h => Math.min(getMaxHp(), h + 20));
      
      // Skill unlock notifications
      if (newLevel === GAME_CONSTANTS.SKILL_UNLOCK_LEVELS.basicSkill && hero?.class) {
        const skillName = GAME_CONSTANTS.BASIC_SKILLS[hero.class.name]?.name;
        if (skillName) {
          addLog(`⚔️ NEW SKILL UNLOCKED: ${skillName}!`);
        }
      } else if (newLevel === GAME_CONSTANTS.SKILL_UNLOCK_LEVELS.special && hero?.class) {
        const skillName = GAME_CONSTANTS.SPECIAL_ATTACKS[hero.class.name]?.name;
        if (skillName) {
          addLog(`✨ SPECIAL ATTACK UNLOCKED: ${skillName}!`);
        }
      } else if (newLevel === GAME_CONSTANTS.SKILL_UNLOCK_LEVELS.tactical && hero?.class) {
        const skillName = GAME_CONSTANTS.TACTICAL_SKILLS[hero.class.name]?.name;
        if (skillName) {
          addLog(`🛡️ TACTICAL SKILL UNLOCKED: ${skillName}!`);
        }
      }
    }
  }, [xp, level, addLog, getMaxHp, hero]);
  
  const applySkipPenalty = useCallback(() => {
    const newSkipCount = skipCount + 1;
    setSkipCount(newSkipCount);
    setConsecutiveDays(0);
    
    // Reset streak when skipping
    setAchievementStats(prev => ({ ...prev, streak_days: 0 }));
    
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
      addLog(`The hero lost ${penalty.levelLoss} level${penalty.levelLoss > 1 ? 's' : ''}!`);
    }
    
    if (penalty.equipmentDebuff > 0) {
      setWeapon(w => Math.floor(w * (1 - penalty.equipmentDebuff)));
      setArmor(a => Math.floor(a * (1 - penalty.equipmentDebuff)));
      addLog(`The hero's equipment has been weakened by ${penalty.equipmentDebuff * 100}%!`);
    }
    
  }, [skipCount, addLog]);
  
  const start = () => {
  const today = new Date().toDateString();
  const currentHour = new Date().getHours();
  
  // Map game day (1-7, 8-14, etc.) to planner day name
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const plannerDayName = dayNames[(currentDay - 1) % 7]; // Wrap around every 7 days

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
    
    
    const plannedTasks = weeklyPlan[plannerDayName] || [];

if (tasks.length === 0) {
  const newTasks = [];
  
  plannedTasks.forEach((item, idx) => {
    newTasks.push({
      title: item.title,
      priority: item.priority || 'routine',
      id: Date.now() + idx,
      done: false,
      overdue: false
    });
  });
      
      if (newTasks.length > 0) {
        setTasks(newTasks);
        addLog(`Loaded ${newTasks.length} tasks from ${plannerDayName}'s plan`);
      }
    }
    
    addLog("The day's trials await...");
    
    setHasStarted(true);
    setIsDayActive(true);
    
    // Track streak (day started without skipping)
    updateAchievementStat('streak_days');
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
      done: false,
      overdue: false
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
    
    setNewTask({ title: '', priority: 'routine' });
    setShowModal(false);
    
    // Activate day on first task
    if (!isDayActive) {
      setIsDayActive(true);
      addLog(`Day ${currentDay} ACTIVATED - Complete tasks before midnight!`);
    }
    
    addLog(`A new challenge appears: ${newTask.title}`);
  }
};

  const addPlanTask = () => {
    if (newPlanItem.title) {
      // Add to weekly plan
      setWeeklyPlan(prev => ({ 
        ...prev, 
        [selectedDay]: [...prev[selectedDay], {
          ...newPlanItem, 
          completed: false
        }] 
      })); 
      
      // Auto-import to quest tab if it's today
      const today = new Date();
      const todayDayName = today.toLocaleDateString('en-US', { weekday: 'long' });
      if (selectedDay === todayDayName) {
        setTasks(prevTasks => [...prevTasks, {
          title: newPlanItem.title,
          priority: newPlanItem.priority || 'routine',
          id: Date.now() + Math.random(),
          done: false,
          overdue: false
        }]);
        addLog(`Added "${newPlanItem.title}" to ${selectedDay} and imported to today's tasks`);
      } else {
        addLog(`Added "${newPlanItem.title}" to ${selectedDay}`);
      }
      
      setNewPlanItem({ title: '', priority: 'routine' }); 
      setShowPlanModal(false);
    }
  };

  const importFromPlanner = (dayName) => {
    const plannedTasks = weeklyPlan[dayName] || [];
    
    if (plannedTasks.length === 0) {
      addLog(`No tasks planned for ${dayName}`);
      return;
    }
    
    const newTasks = [];
    plannedTasks.forEach((item, idx) => {
      newTasks.push({
        title: item.title,
        priority: item.priority || 'routine',
        id: Date.now() + idx + Math.random(),
        done: false,
        overdue: false
      });
    });
    
    // Preserve existing overdue tasks and merge with new tasks
    setTasks(prevTasks => {
      const overdueTasksToKeep = prevTasks.filter(t => t.overdue && !t.done);
      return [...overdueTasksToKeep, ...newTasks];
    });
    setHasStarted(true);
    
    // Activate day on import
    if (!isDayActive) {
      setIsDayActive(true);
      addLog(`Day ${currentDay} ACTIVATED - Complete tasks before midnight!`);
    }
    
    const overdueCount = tasks.filter(t => t.overdue && !t.done).length;
    if (overdueCount > 0) {
      addLog(`Imported ${newTasks.length} tasks from ${dayName}'s plan (${overdueCount} overdue tasks carried over)`);
    } else {
      addLog(`Imported ${newTasks.length} tasks from ${dayName}'s plan`);
    }
    setShowImportModal(false);
  };

  const getMerchantDialogue = () => {
    // Curse-based dialogue (highest priority)
    if (curseLevel === 3) {
      return "CONDEMNED. One more death and the abyss claims your soul forever.";
    }
    if (curseLevel === 2) {
      return "The darkness tightens its grip. You'll need more than supplies soon.";
    }
    if (curseLevel === 1) {
      return "I see the mark upon you. The curse is hungry.";
    }
    
    // Gold-based dialogue
    if (gold >= 200) {
      return "Ah, a successful hunter. The darkness has been generous.";
    }
    if (gold >= 100) {
      return "You've gathered enough. Choose wisely.";
    }
    if (gold >= 50) {
      return "Modest spoils, but sufficient for survival.";
    }
    if (gold < 20) {
      return "Empty-handed? The forge requires gold to work.";
    }
    
    // Default
    return "What do you seek, traveler?";
  };

  // Calculate sell price for equipment
  // Calculate combat gold based on day and enemy type
  const calculateCombatGold = useCallback((enemyType) => {
    const config = GAME_CONSTANTS.ECONOMY_CONFIG;
    const baseGold = config.combatGoldBase + (currentDay * config.combatGoldDayScale);
    
    if (enemyType === 'boss' || enemyType === 'final') {
      return Math.floor(baseGold * config.bossMultiplier);
    } else if (enemyType === 'elite') {
      return Math.floor(baseGold * config.eliteMultiplier);
    } else if (enemyType === 'wave') {
      return Math.floor(baseGold * 0.8); // Wave enemies slightly less
    } else {
      return baseGold; // Normal enemies
    }
  }, [currentDay]);

  const calculateSellPrice = (item, itemType) => {
    // Use shop base prices for consistency
    const shopBasePrice = GAME_CONSTANTS.SHOP_CONFIG.costs[item.rarity || 'common'];
    
    // Apply sell value percentage based on rarity
    const sellPercent = GAME_CONSTANTS.ECONOMY_CONFIG.sellValuePercent[item.rarity || 'common'];
    let sellValue = Math.floor(shopBasePrice * sellPercent);
    
    // Affix multiplier (each affix adds modest value)
    if (item.affixes) {
      const affixCount = Object.keys(item.affixes).length;
      sellValue = Math.floor(sellValue * (1.0 + affixCount * 0.1)); // +10% per affix
    }
    
    // Market modifier slightly affects sell price (but never exceeds buy price)
    const marketMod = marketModifiers[itemType] || 1.0;
    const marketAdjusted = Math.floor(sellValue * marketMod);
    
    // Hard cap: never sell for more than 50% of current market buy price
    const currentBuyPrice = Math.floor(shopBasePrice * marketMod);
    const maxSellPrice = Math.floor(currentBuyPrice * 0.5);
    
    return Math.min(marketAdjusted, maxSellPrice);
  };

  // Update market modifiers (called daily or when entering merchant)
  const updateMarketPrices = () => {
    const newModifiers = {};
    const types = ['weapon', 'armor', 'pendant', 'ring', 'healthPotion', 'staminaPotion', 'cleansePotion', 'weaponOil', 'armorPolish', 'luckyCharm'];
    
    types.forEach(type => {
      // Random fluctuation between 0.7x and 1.3x
      const fluctuation = 0.7 + (Math.random() * 0.6);
      newModifiers[type] = Math.round(fluctuation * 100) / 100;
    });
    
    console.log('Market prices updated:', newModifiers);
    setMarketModifiers(newModifiers);
  };

  // Generate shop inventory based on current day
  const generateShopInventory = useCallback(() => {
    const items = [];
    const itemCount = 6; // 6 items per shop
    
    // Determine available rarities based on current day
    const availableRarities = [];
    if (currentDay >= 1) {
      availableRarities.push({ rarity: 'common', weight: 40 });
      availableRarities.push({ rarity: 'uncommon', weight: 30 });
    }
    if (currentDay >= 3) {
      availableRarities.push({ rarity: 'rare', weight: 20 });
    }
    if (currentDay >= 5) {
      availableRarities.push({ rarity: 'epic', weight: 8 });
    }
    if (currentDay >= 7) {
      availableRarities.push({ rarity: 'legendary', weight: 2 });
    }
    
    // Generate items
    for (let i = 0; i < itemCount; i++) {
      // Roll rarity based on weighted distribution
      const totalWeight = availableRarities.reduce((sum, r) => sum + r.weight, 0);
      let roll = Math.random() * totalWeight;
      let selectedRarity = 'common';
      
      for (const { rarity, weight } of availableRarities) {
        roll -= weight;
        if (roll <= 0) {
          selectedRarity = rarity;
          break;
        }
      }
      
      const multiplier = getRarityMultiplier(selectedRarity);
      
      // Randomly select item type (weapon, armor, pendant, ring)
      const typeRoll = Math.random();
      let item;
      
      if (typeRoll < 0.35) {
        // Weapon
        const range = GAME_CONSTANTS.WEAPON_STAT_RANGES;
        const baseAttack = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
        const attack = Math.floor(baseAttack * multiplier);
        const names = GAME_CONSTANTS.WEAPON_NAMES[selectedRarity];
        const name = names[Math.floor(Math.random() * names.length)];
        const affixes = generateAffixes(selectedRarity, 'weapon');
        
        item = {
          id: `shop-${Date.now()}-${i}`,
          type: 'weapon',
          name,
          attack,
          rarity: selectedRarity,
          affixes
        };
      } else if (typeRoll < 0.70) {
        // Armor
        const slots = ['helmet', 'chest', 'gloves', 'boots'];
        const slot = slots[Math.floor(Math.random() * slots.length)];
        const range = GAME_CONSTANTS.ARMOR_STAT_RANGES[slot];
        const baseDefense = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
        const defense = Math.floor(baseDefense * multiplier);
        const names = GAME_CONSTANTS.ARMOR_NAMES[slot][selectedRarity];
        const name = names[Math.floor(Math.random() * names.length)];
        const affixes = generateAffixes(selectedRarity, 'armor');
        
        item = {
          id: `shop-${Date.now()}-${i}`,
          type: 'armor',
          slot,
          name,
          defense,
          rarity: selectedRarity,
          affixes
        };
      } else if (typeRoll < 0.85) {
        // Pendant
        const range = GAME_CONSTANTS.ACCESSORY_STAT_RANGES.pendant;
        const baseHp = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
        const hp = Math.floor(baseHp * multiplier);
        const names = GAME_CONSTANTS.ACCESSORY_NAMES.pendant[selectedRarity];
        const name = names[Math.floor(Math.random() * names.length)];
        
        item = {
          id: `shop-${Date.now()}-${i}`,
          type: 'pendant',
          name,
          hp,
          rarity: selectedRarity
        };
      } else {
        // Ring
        const range = GAME_CONSTANTS.ACCESSORY_STAT_RANGES.ring;
        const baseStamina = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
        const stamina = Math.floor(baseStamina * multiplier);
        const names = GAME_CONSTANTS.ACCESSORY_NAMES.ring[selectedRarity];
        const name = names[Math.floor(Math.random() * names.length)];
        
        item = {
          id: `shop-${Date.now()}-${i}`,
          type: 'ring',
          name,
          stamina,
          rarity: selectedRarity
        };
      }
      
      items.push(item);
    }
    
    setShopInventory(items);
    // Don't log here - causes circular dependency
  }, [currentDay, getRarityMultiplier, generateAffixes]);

  // Get current price for a potion/item
  const getCurrentPrice = (itemType, basePrice) => {
    const marketMod = marketModifiers[itemType] || 1.0;
    return Math.floor(basePrice * marketMod);
  };

  // Get dynamic price for potions
  const getPotionPrice = (itemType, basePrice) => {
    const marketMod = marketModifiers[itemType] || 1.0;
    return Math.floor(basePrice * marketMod);
  };

  // Sell equipment function
  const sellEquipment = (item, itemType, slot = null) => {
    const sellPrice = calculateSellPrice(item, itemType);
    
    setGold(g => g + sellPrice);
    
    // Remove from inventory
    if (itemType === 'weapon') {
      setWeaponInventory(prev => prev.filter(w => w.id !== item.id));
    } else if (itemType === 'armor') {
      // Slot must be provided for armor
      if (!slot) {
        console.error('Armor slot not provided to sellEquipment');
        return;
      }
      setArmorInventory(prev => ({
        ...prev,
        [slot]: prev[slot].filter(a => a.id !== item.id)
      }));
    } else if (itemType === 'pendant') {
      setPendantInventory(prev => prev.filter(p => p.id !== item.id));
    } else if (itemType === 'ring') {
      setRingInventory(prev => prev.filter(r => r.id !== item.id));
    }
    
    const marketBonus = marketModifiers[itemType] > 1.0 ? ' (Market Bonus!)' : '';
    addLog(`Sold ${item.name} for ${sellPrice} Gold${marketBonus}`);
  };

  // Sell potions function
  const sellPotion = (potionType) => {
    const basePrices = {
      healthPotion: 25,
      staminaPotion: 20,
      cleansePotion: 50
    };
    
    const basePrice = basePrices[potionType];
    // Sell price is 70% of current market buy price
    const marketMod = marketModifiers[potionType] || 1.0;
    const sellPrice = Math.floor(basePrice * marketMod * 0.7);
    
    setGold(g => g + sellPrice);
    
    // Remove from inventory
    if (potionType === 'healthPotion') {
      setHealthPots(h => h - 1);
    } else if (potionType === 'staminaPotion') {
      setStaminaPots(s => s - 1);
    } else if (potionType === 'cleansePotion') {
      setCleansePots(c => c - 1);
    }
    
    const potionNames = {
      healthPotion: 'Health Potion',
      staminaPotion: 'Stamina Potion',
      cleansePotion: 'Cleanse Potion'
    };
    
    const marketBonus = marketModifiers[potionType] > 1.0 ? ' (High Demand!)' : '';
    addLog(`Sold ${potionNames[potionType]} for ${sellPrice} Gold${marketBonus}`);
  };

  const craftItem = (itemType) => {
    const basePrices = {
      healthPotion: { cost: 25, name: 'Health Potion', emoji: '💊' },
      staminaPotion: { cost: 20, name: 'Stamina Potion', emoji: '⚡' },
      cleansePotion: { cost: 250, name: 'Cleanse Potion', emoji: '🧪' },
      weaponOil: { cost: 40, name: 'Fury Elixir', emoji: '⚔️' },
      armorPolish: { cost: 40, name: 'Ironbark Tonic', emoji: '🛡️' },
      luckyCharm: { cost: 80, name: 'Fortune Philter', emoji: '🍀' }
    };
    
    const recipe = basePrices[itemType];
    
    // Apply market modifier to potions
    const marketMod = marketModifiers[itemType] || 1.0;
    const finalCost = Math.floor(recipe.cost * marketMod);
    
    if (gold < finalCost) {
      addLog(`The hero needs ${finalCost} Gold to craft ${recipe.name} (have ${gold})`);
      return;
    }
    
    // Check Cleanse Potion daily limit
    if (itemType === 'cleansePotion' && cleansePotionPurchasedToday) {
      addLog('The merchant shakes his head: "Only one Cleanse Potion per day, friend."');
      return;
    }
    
    setGold(e => e - finalCost);
    
    switch(itemType) {
      case 'healthPotion':
        setHealthPots(h => h + 1);
        break;
      case 'staminaPotion':
        setStaminaPots(s => s + 1);
        break;
      case 'cleansePotion':
        setCleansePots(c => c + 1);
        setCleansePotionPurchasedToday(true);
        break;
      case 'weaponOil':
        setWeaponOilActive(true);
        break;
      case 'armorPolish':
        setArmorPolishActive(true);
        break;
      case 'luckyCharm':
        setLuckyCharmActive(true);
        break;
    }
    
    const dealText = marketMod < 0.9 ? ' (SALE!)' : marketMod > 1.1 ? ' (High Demand)' : '';
    addLog(`The hero forged: ${recipe.emoji} ${recipe.name} (-${finalCost} Gold${dealText})`);
  };

  // Purchase item from shop
  const purchaseShopItem = (item) => {
    // Calculate price with market modifier
    const basePrice = GAME_CONSTANTS.SHOP_CONFIG.costs[item.rarity];
    const itemType = item.type === 'armor' ? 'armor' : item.type; // armor slot types all use 'armor' modifier
    const marketMod = marketModifiers[itemType] || 1.0;
    const finalPrice = Math.floor(basePrice * marketMod);
    
    if (gold < finalPrice) {
      addLog(`Not enough gold. Need ${finalPrice}g (have ${gold}g)`);
      return;
    }
    
    // Deduct gold
    setGold(g => g - finalPrice);
    
    // Add item to inventory
    if (item.type === 'weapon') {
      setWeaponInventory(prev => sortByRarity([...prev, { ...item, id: Date.now() }]));
      addLog(`Purchased: ${item.name} (+${item.attack} Attack) for ${finalPrice}g`);
    } else if (item.type === 'armor') {
      setArmorInventory(prev => ({
        ...prev,
        [item.slot]: sortByRarity([...prev[item.slot], { ...item, id: Date.now() }])
      }));
      addLog(`Purchased: ${item.name} (+${item.defense} Defense) for ${finalPrice}g`);
    } else if (item.type === 'pendant') {
      setPendantInventory(prev => sortByRarity([...prev, { ...item, id: Date.now() }]));
      addLog(`Purchased: ${item.name} (+${item.hp} Health) for ${finalPrice}g`);
    } else if (item.type === 'ring') {
      setRingInventory(prev => sortByRarity([...prev, { ...item, id: Date.now() }]));
      addLog(`Purchased: ${item.name} (+${item.stamina} STA) for ${finalPrice}g`);
    }
    
    // Remove from shop inventory
    setShopInventory(prev => prev.filter(i => i.id !== item.id));
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
      addLog(`The hero begins the trial: ${task.title}`);
    }
  };
  
  // FIXED: Added weapon, armor, overdueTask to dependencies
  const complete = useCallback((id) => {
  const task = tasks.find(t => t.id === id);
  if (task && !task.done) {
    // Base XP for completing a task (reduced for better pacing)
    const baseXp = 12;
    
   // Apply priority multiplier
const priorityMultiplier = task.priority === 'important' ? 1.25 : 1.0;
let xpMultiplier = GAME_CONSTANTS.XP_MULTIPLIERS[(currentDay - 1) % 7] * priorityMultiplier;

// Apply curse debuff based on level
if (curseLevel === 1) {
  xpMultiplier *= 0.75; // 75% XP (was 50%)
} else if (curseLevel === 2) {
  xpMultiplier *= 0.5; // 50% XP (was 25%)
} else if (curseLevel === 3) {
  xpMultiplier *= 0.25; // 25% XP (was 10%)
}

// Apply overdue penalty
if (task.overdue) {
  xpMultiplier *= 0.5; // 50% XP penalty for overdue tasks
}
    
    let xpGain = Math.floor(baseXp * xpMultiplier);
    
    setXp(x => x + xpGain);
    sounds.taskComplete();
    
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
        addLog(`Redemption earned! ${GAME_CONSTANTS.SKIP_REDEMPTION_DAYS} days of dedication. Skip forgiven.`);
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
      // Generate random weapon
      const rarity = rollRarity('normal');
      const multiplier = getRarityMultiplier(rarity);
      
      const range = GAME_CONSTANTS.WEAPON_STAT_RANGES;
      const baseAttack = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
      const attack = Math.floor(baseAttack * multiplier);
      const names = GAME_CONSTANTS.WEAPON_NAMES[rarity];
      const name = names[Math.floor(Math.random() * names.length)];
      const rarityName = GAME_CONSTANTS.RARITY_TIERS[rarity].name;
      
      const affixes = generateAffixes(rarity, 'weapon');
      const newWeapon = { name, attack, rarity, affixes, id: Date.now() };
      setWeaponInventory(prev => sortByRarity([...prev, newWeapon]));
      
      addLog(`Weapon found: ${rarityName} ${name} (+${attack} Attack)`);
    } else if (roll < GAME_CONSTANTS.LOOT_RATES.ARMOR) {
      // Generate random armor piece
      const rarity = rollRarity('normal');
      const multiplier = getRarityMultiplier(rarity);
      
      const slots = ['helmet', 'chest', 'gloves', 'boots'];
      const slot = slots[Math.floor(Math.random() * slots.length)];
      const range = GAME_CONSTANTS.ARMOR_STAT_RANGES[slot];
      const baseDefense = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
      const defense = Math.floor(baseDefense * multiplier);
      const names = GAME_CONSTANTS.ARMOR_NAMES[slot][rarity];
      const name = names[Math.floor(Math.random() * names.length)];
      const rarityName = GAME_CONSTANTS.RARITY_TIERS[rarity].name;
      
      const affixes = generateAffixes(rarity, 'armor');
      const newArmor = { name, defense, rarity, affixes, id: Date.now() };
      setArmorInventory(prev => ({
        ...prev,
        [slot]: sortByRarity([...prev[slot], newArmor])
      }));
      
      addLog(`Armor found: ${rarityName} ${name} (+${defense} Defense)`);
    }
    
    // Mark task as done
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: true } : t));
    
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
    if (task.overdue) completionMsg += ' • OVERDUE';
    completionMsg += `)`;
    
    addLog(completionMsg);

// Always spawn enemy after task completion
setTimeout(() => {
  // 20% chance for wave attack
  const waveRoll = Math.random();
  if (waveRoll < 0.2) {
    // Wave attack: 2-4 enemies
    const numEnemies = Math.floor(Math.random() * 2) + 2; // 2 or 3
    setWaveCount(numEnemies);
    addLog(`Wave incoming! ${numEnemies} enemies detected!`);
    setTimeout(() => spawnRegularEnemy(true, 1, numEnemies), 1000);
  } else {
    // Regular single enemy
    spawnRegularEnemy(false, 0, 1);
  }
}, 1000);
  }

}, [tasks, currentDay, addLog, consecutiveDays, skipCount, curseLevel, hp, sessionStartTime, taskPauseCount, getMaxHp, getMaxStamina, weapon, armor, overdueTask]);
  
  // Drag-and-drop handlers for daily quest tasks
  const handleDragStart = (e, task) => {
    setDraggedTask(task);
    e.currentTarget.style.opacity = '0.4';
  };
  
  const handleDragEnd = (e) => {
    e.currentTarget.style.opacity = '1';
    setDraggedTask(null);
  };
  
  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.style.cursor = 'move';
  };
  
  const handleDrop = (e, targetTask) => {
    e.preventDefault();
    
    if (!draggedTask || draggedTask.id === targetTask.id) return;
    
    const currentTasks = [...tasks];
    const draggedIndex = currentTasks.findIndex(t => t.id === draggedTask.id);
    const targetIndex = currentTasks.findIndex(t => t.id === targetTask.id);
    
    // Remove dragged task and insert at target position
    currentTasks.splice(draggedIndex, 1);
    currentTasks.splice(targetIndex, 0, draggedTask);
    
    setTasks(currentTasks);
  };
  
  // Drag-and-drop handlers for weekly planner
  const handlePlanDragStart = (e, task) => {
    setDraggedPlanTask(task);
    e.currentTarget.style.opacity = '0.4';
  };
  
  const handlePlanDragEnd = (e) => {
    e.currentTarget.style.opacity = '1';
    setDraggedPlanTask(null);
  };
  
  const handlePlanDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.style.cursor = 'move';
  };
  
  const handlePlanDrop = (e, targetTask, day) => {
    e.preventDefault();
    
    if (!draggedPlanTask || draggedPlanTask.title === targetTask.title || draggedPlanTask.day !== day) return;
    
    const currentDayTasks = [...weeklyPlan[day]];
    const draggedIndex = currentDayTasks.findIndex(t => t.title === draggedPlanTask.title);
    const targetIndex = currentDayTasks.findIndex(t => t.title === targetTask.title);
    
    // Remove dragged task and insert at target position
    currentDayTasks.splice(draggedIndex, 1);
    currentDayTasks.splice(targetIndex, 0, draggedPlanTask);
    
    setWeeklyPlan(prev => ({
      ...prev,
      [day]: currentDayTasks
    }));
  };

  // Reusable loot generation function - called from all victory paths
  const generateVictoryLoot = useCallback((battleType, isFinalBoss, goldGain, waveGoldTotal = 0) => {
    const lootMessages = [];
    
    if (!isFinalBoss) {
      // Regular/wave enemies: potions, weapons, armor, and accessories
      if (battleType === 'regular' || battleType === 'wave') {
        const isWave = battleType === 'wave';
        const healthPotRate = isWave ? 0.22 : 0.18; // 22% wave, 18% regular
        const staminaPotRate = isWave ? 0.52 : 0.43; // 52% wave cumulative, 43% regular cumulative
        
        const lootRoll = Math.random();
        if (lootRoll < healthPotRate) {
          // Health Potion
          setHealthPots(h => h + 1);
          lootMessages.push('Health Potion');
          addLog('The hero found a Health Potion among the remains!');
        } else if (lootRoll < staminaPotRate) {
          // Stamina Potion
          setStaminaPots(s => s + 1);
          lootMessages.push('Stamina Potion');
          addLog('The hero discovered a Stamina Potion in the aftermath!');
        } else if (lootRoll < 0.50) {
          // 20% Weapon with rarity
          const rarity = rollRarity('normal');
          const multiplier = getRarityMultiplier(rarity);
          
          const range = GAME_CONSTANTS.WEAPON_STAT_RANGES;
          const baseAttack = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
          const attack = Math.floor(baseAttack * multiplier);
          
          const names = GAME_CONSTANTS.WEAPON_NAMES[rarity];
          const name = names[Math.floor(Math.random() * names.length)];
          const rarityName = GAME_CONSTANTS.RARITY_TIERS[rarity].name;
          
          const affixes = generateAffixes(rarity, 'weapon');
          const newWeapon = { name, attack, rarity, affixes, id: Date.now() };
          setWeaponInventory(prev => sortByRarity([...prev, newWeapon]));
          
          lootMessages.push(`${rarityName} ${name} (+${attack} Attack)`);
          addLog(`Weapon found: ${rarityName} ${name} (+${attack} Attack)`);
        } else if (lootRoll < 0.70) {
          // 20% Armor with rarity
          const rarity = rollRarity('normal');
          const multiplier = getRarityMultiplier(rarity);
          
          const slots = ['helmet', 'chest', 'gloves', 'boots'];
          const slot = slots[Math.floor(Math.random() * slots.length)];
          const range = GAME_CONSTANTS.ARMOR_STAT_RANGES[slot];
          const baseDefense = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
          const defense = Math.floor(baseDefense * multiplier);
          
          const names = GAME_CONSTANTS.ARMOR_NAMES[slot][rarity];
          const name = names[Math.floor(Math.random() * names.length)];
          const rarityName = GAME_CONSTANTS.RARITY_TIERS[rarity].name;
          
          const affixes = generateAffixes(rarity, 'armor');
          const newArmor = { name, defense, rarity, affixes, id: Date.now() };
          setArmorInventory(prev => ({
            ...prev,
            [slot]: sortByRarity([...prev[slot], newArmor])
          }));
          
          lootMessages.push(`${rarityName} ${name} (+${defense} Defense)`);
          addLog(`Armor found: ${rarityName} ${name} (+${defense} Defense)`);
        } else if (lootRoll < 0.80) {
          // 10% Pendant with rarity
          const rarity = rollRarity('normal');
          const multiplier = getRarityMultiplier(rarity);
          
          const range = GAME_CONSTANTS.ACCESSORY_STAT_RANGES.pendant;
          const baseHp = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
          const hp = Math.floor(baseHp * multiplier);
          
          const names = GAME_CONSTANTS.ACCESSORY_NAMES.pendant[rarity];
          const name = names[Math.floor(Math.random() * names.length)];
          const rarityName = GAME_CONSTANTS.RARITY_TIERS[rarity].name;
          
          const newPendant = { name, hp, rarity, id: Date.now() };
          setPendantInventory(prev => sortByRarity([...prev, newPendant]));
          
          lootMessages.push(`${rarityName} ${name} (+${hp} Health)`);
          addLog(`Pendant found: ${rarityName} ${name} (+${hp} Health)`);
        } else if (lootRoll < 0.90) {
          // 10% Ring with rarity
          const rarity = rollRarity('normal');
          const multiplier = getRarityMultiplier(rarity);
          
          const range = GAME_CONSTANTS.ACCESSORY_STAT_RANGES.ring;
          const baseStamina = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
          const stamina = Math.floor(baseStamina * multiplier);
          
          const names = GAME_CONSTANTS.ACCESSORY_NAMES.ring[rarity];
          const name = names[Math.floor(Math.random() * names.length)];
          const rarityName = GAME_CONSTANTS.RARITY_TIERS[rarity].name;
          
          const newRing = { name, stamina, rarity, id: Date.now() };
          setRingInventory(prev => sortByRarity([...prev, newRing]));
          
          lootMessages.push(`${rarityName} ${name} (+${stamina} STA)`);
          addLog(`Ring found: ${rarityName} ${name} (+${stamina} STA)`);
        }
        // 10% chance of no loot
      } else {
        // Elite bosses: weapon/armor upgrades
        const lootRoll = Math.random();
        const luckMultiplier = luckyCharmActive ? 2 : 1;
        
        if (lootRoll < GAME_CONSTANTS.MINI_BOSS_LOOT_RATES.HEALTH_POTION) {
          setHealthPots(h => h + luckMultiplier);
          lootMessages.push(`Health Potion${luckyCharmActive ? ' x2' : ''}`);
          addLog(`The hero claimed a precious Health Potion${luckyCharmActive ? ' - the lucky charm doubles the bounty!' : ' from the fallen champion!'}`);
        } else if (lootRoll < GAME_CONSTANTS.MINI_BOSS_LOOT_RATES.STAMINA_POTION) {
          setStaminaPots(s => s + luckMultiplier);
          lootMessages.push(`Stamina Potion${luckyCharmActive ? ' x2' : ''}`);
          addLog(`The hero secured a rare Stamina Potion${luckyCharmActive ? ' - fortune favors the prepared!' : ' from the defeated foe!'}`);
        } else if (lootRoll < GAME_CONSTANTS.MINI_BOSS_LOOT_RATES.WEAPON) {
          // Generate random weapon with better rarity for elites
          const rarity = rollRarity('elite');
          const multiplier = getRarityMultiplier(rarity);
          
          const range = GAME_CONSTANTS.WEAPON_STAT_RANGES;
          const baseAttack = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
          const attack = Math.floor(baseAttack * multiplier);
          
          const names = GAME_CONSTANTS.WEAPON_NAMES[rarity];
          const name = names[Math.floor(Math.random() * names.length)];
          const rarityName = GAME_CONSTANTS.RARITY_TIERS[rarity].name;
          
          const affixes = generateAffixes(rarity, 'weapon');
          const newWeapon = { name, attack, rarity, affixes, id: Date.now() };
          setWeaponInventory(prev => sortByRarity([...prev, newWeapon]));
          
          lootMessages.push(`${rarityName} ${name} (+${attack} Attack)`);
          addLog(`Weapon found: ${rarityName} ${name} (+${attack} Attack)${luckyCharmActive ? ' - blessed by fortune!' : ''}`);
        } else if (lootRoll < GAME_CONSTANTS.MINI_BOSS_LOOT_RATES.ARMOR) {
          // Generate random armor piece with better rarity for elites
          const rarity = rollRarity('elite');
          const multiplier = getRarityMultiplier(rarity);
          
          const slots = ['helmet', 'chest', 'gloves', 'boots'];
          const slot = slots[Math.floor(Math.random() * slots.length)];
          const range = GAME_CONSTANTS.ARMOR_STAT_RANGES[slot];
          const baseDefense = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
          const defense = Math.floor(baseDefense * multiplier);
          
          const names = GAME_CONSTANTS.ARMOR_NAMES[slot][rarity];
          const name = names[Math.floor(Math.random() * names.length)];
          const rarityName = GAME_CONSTANTS.RARITY_TIERS[rarity].name;
          
          const affixes = generateAffixes(rarity, 'armor');
          const newArmor = { name, defense, rarity, affixes, id: Date.now() };
          setArmorInventory(prev => ({
            ...prev,
            [slot]: sortByRarity([...prev[slot], newArmor])
          }));
          
          lootMessages.push(`${rarityName} ${name} (+${defense} Defense)`);
          addLog(`Armor found: ${rarityName} ${name} (+${defense} Defense)${luckyCharmActive ? ' - blessed by fortune!' : ''}`);
        } else if (lootRoll < GAME_CONSTANTS.MINI_BOSS_LOOT_RATES.PENDANT) {
          // Generate random pendant with elite rarity
          const rarity = rollRarity('elite');
          const multiplier = getRarityMultiplier(rarity);
          
          const range = GAME_CONSTANTS.ACCESSORY_STAT_RANGES.pendant;
          const baseHp = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
          const hp = Math.floor(baseHp * multiplier);
          
          const names = GAME_CONSTANTS.ACCESSORY_NAMES.pendant[rarity];
          const name = names[Math.floor(Math.random() * names.length)];
          const rarityName = GAME_CONSTANTS.RARITY_TIERS[rarity].name;
          
          const newPendant = { name, hp, rarity, id: Date.now() };
          setPendantInventory(prev => sortByRarity([...prev, newPendant]));
          
          lootMessages.push(`${rarityName} ${name} (+${hp} Health)`);
          addLog(`Pendant found: ${rarityName} ${name} (+${hp} Health)${luckyCharmActive ? ' - blessed by fortune!' : ''}`);
        } else {
          // Generate random ring with elite rarity
          const rarity = rollRarity('elite');
          const multiplier = getRarityMultiplier(rarity);
          
          const range = GAME_CONSTANTS.ACCESSORY_STAT_RANGES.ring;
          const baseStamina = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
          const stamina = Math.floor(baseStamina * multiplier);
          
          const names = GAME_CONSTANTS.ACCESSORY_NAMES.ring[rarity];
          const name = names[Math.floor(Math.random() * names.length)];
          const rarityName = GAME_CONSTANTS.RARITY_TIERS[rarity].name;
          
          const newRing = { name, stamina, rarity, id: Date.now() };
          setRingInventory(prev => sortByRarity([...prev, newRing]));
          
          lootMessages.push(`${rarityName} ${name} (+${stamina} STA)`);
          addLog(`Ring found: ${rarityName} ${name} (+${stamina} STA)${luckyCharmActive ? ' - blessed by fortune!' : ''}`);
        }
        
        if (luckyCharmActive) {
          setLuckyCharmActive(false);
          addLog('The lucky charm crumbles to dust, its magic spent.');
        }
      }
    }
    
    // Add gold gain to loot display
    const displayGold = battleType === 'wave' ? waveGoldTotal : goldGain;
    lootMessages.unshift(`+${displayGold} Gold`);
    
    setVictoryLoot(lootMessages);
    setVictoryFlash(true);
    setTimeout(() => setVictoryFlash(false), 400);
  }, [luckyCharmActive, addLog, rollRarity, getRarityMultiplier, generateAffixes, sortByRarity]);

const spawnRegularEnemy = useCallback((isWave = false, waveIndex = 0, totalWaves = 1) => {
  if (canCustomize) setCanCustomize(false);
  
  // Exponential scaling from SCALING_CONFIG
  const config = GAME_CONSTANTS.SCALING_CONFIG.normal;
  const enemyHp = Math.floor(config.hpBase * Math.pow(config.hpGrowth, currentDay - 1));
  
  setCurrentAnimation('screen-shake');
  setTimeout(() => setCurrentAnimation(null), 500);
  
  const enemyName = makeBossName();
  setBossName(enemyName);
  setBossHp(enemyHp);
  setBossMax(enemyHp);
  setShowBoss(true);
  setBattling(true);
  setBattleMenu('main'); // Reset to main menu
  setBattleMode(true);
  setIsFinalBoss(false);
  setCanFlee(true); // Allow fleeing from regular and wave enemies
  setBossDebuffs({ poisonTurns: 0, poisonDamage: 0, poisonedVulnerability: 0, stunned: false });
  setVictoryLoot([]); // Clear previous loot
  
  // Reset charges at start of each battle
  setChargeStacks(0);
  
  // Set meta dialogue for regular enemies
  const dialoguePool = isWave ? GAME_CONSTANTS.ENEMY_DIALOGUE.WAVE : GAME_CONSTANTS.ENEMY_DIALOGUE.REGULAR;
  const randomDialogue = dialoguePool[Math.floor(Math.random() * dialoguePool.length)];
  setEnemyDialogue(randomDialogue);
  
  // Reset taunt state
  setIsTauntAvailable(false);
  setHasTriggeredLowHpTaunt(false);
  setEnragedTurns(0);
  setPlayerTaunt('');
  setEnemyTauntResponse('');
  setShowTauntBoxes(false);
  setHasFled(false); // Reset fled status
  
  if (isWave) {
    setBattleType('wave');
    setCurrentWaveEnemy(waveIndex);
    setTotalWaveEnemies(totalWaves);
    if (waveIndex === 1) {
      setWaveGoldTotal(0); // Reset total at start of wave
    }
    addLog(`Wave assault - Enemy ${waveIndex}/${totalWaves}: ${enemyName}`);
  } else {
    setBattleType('regular');
    addLog(`${enemyName} emerges from the shadows!`);
  }
}, [currentDay, canCustomize, addLog]);

  const spawnRandomMiniBoss = (force = false) => {
    const completedTasks = tasks.filter(t => t.done).length;
    const totalTasks = tasks.length;
    
    if (!force && totalTasks === 0) return;
    if (force) setStamina(getMaxStamina());
    
    const bossNumber = miniBossCount + 1;
    const completionRate = totalTasks > 0 ? completedTasks / totalTasks : 0.5;
    
    // Exponential scaling from SCALING_CONFIG
    const config = GAME_CONSTANTS.SCALING_CONFIG.elite;
    const baseHp = Math.floor(config.hpBase * Math.pow(config.hpGrowth, currentDay - 1));
    
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
    setBattleMenu('main'); // Reset to main menu
    setBattleMode(true);
    setIsFinalBoss(false);
    setCanFlee(true);
    setMiniBossCount(bossNumber);
    setBossDebuffs({ poisonTurns: 0, poisonDamage: 0, poisonedVulnerability: 0, stunned: false });
    setVictoryLoot([]); // Clear previous loot
    
    // Reset charges at start of each battle
    setChargeStacks(0);
    
    // Reset taunt state
    setIsTauntAvailable(false);
    setHasTriggeredLowHpTaunt(false);
    setEnragedTurns(0);
    setPlayerTaunt('');
    setEnemyTauntResponse('');
    setShowTauntBoxes(false);
    setHasFled(false); // Reset fled status
    
    // Set cycling boss dialogue (day 1-7 repeating)
    const bossDialogueKey = `DAY_${((currentDay - 1) % 7) + 1}`;
    const bossDialogue = GAME_CONSTANTS.BOSS_DIALOGUE[bossDialogueKey];
    if (bossDialogue) {
      setEnemyDialogue(bossDialogue.START);
    }
    
    addLog(`AMBUSH! ${bossNameGenerated} emerges from the shadows!`);
  };
  
  const useHealth = () => {
  if (curseLevel === 3) {
    addLog('Condemned - Cannot use Health Potions!');
    return;
  }
  if (healthPots > 0 && hp < getMaxHp()) {
    setHealthPots(h => h - 1);
    const maxHp = getMaxHp();
    const healAmount = Math.max(
      GAME_CONSTANTS.HEALTH_POTION_MIN,
      Math.floor(maxHp * (GAME_CONSTANTS.HEALTH_POTION_HEAL_PERCENT / 100))
    );
    setHp(h => Math.min(maxHp, h + healAmount));
    sounds.potionUse();
    addLog(`💊 Used Health Potion! +${healAmount} HP`);
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
    sounds.cleanse();
    const oldLevel = curseLevel;
    const newLevel = curseLevel - 1;
    setCurseLevel(newLevel);
    
    const curseNames = ['CURSED', 'DEEPLY CURSED', 'CONDEMNED'];
    if (newLevel === 0) {
      addLog(`💜 Cleanse Potion used! ${curseNames[oldLevel - 1]} removed! You are purified.`);
    } else {
      addLog(`💜 Cleanse Potion used! ${curseNames[oldLevel - 1]} reduced to ${curseNames[newLevel - 1]}.`);
    }
  }
};
  
  const miniBoss = () => {
    const eliteXpRequired = 150;
    
    if (xp < eliteXpRequired) {
      addLog(`The hero needs ${eliteXpRequired} XP to face the darkness! (${xp}/${eliteXpRequired})`);
      return;
    }
    
    setBattleType('elite');
    spawnRandomMiniBoss();
    setCanFlee(false);
  };
  
  const finalBoss = () => {
    if (!gauntletUnlocked) {
      addLog(`The Gauntlet remains sealed. Reach ${gauntletMilestone} XP to unlock.`);
      return;
    }
    
    const completedTasks = tasks.filter(t => t.done).length;
    const totalTasks = tasks.length;
    
    if (totalTasks === 0) {
      addLog('Warning: No trials accepted! Create some first.');
      return;
    }
    
    if (completedTasks < totalTasks) {
      addLog(`The hero must complete all trials! (${completedTasks}/${totalTasks} done)`);
      return;
    }
    
    // Exponential scaling from SCALING_CONFIG
    const config = GAME_CONSTANTS.SCALING_CONFIG.boss;
    const baseHp = Math.floor(config.hpBase * Math.pow(config.hpGrowth, currentDay - 1));
    
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
    setBattleMenu('main'); // Reset to main menu
    setBattleMode(true);
    setIsFinalBoss(true);
    setCanFlee(false);
    setVictoryLoot([]); // Clear previous loot
    
    // Reset charges at start of each battle
    setChargeStacks(0);
    
    // Reset taunt state
    setIsTauntAvailable(false);
    setHasTriggeredLowHpTaunt(false);
    setEnragedTurns(0);
    setPlayerTaunt('');
    setEnemyTauntResponse('');
    setShowTauntBoxes(false);
    setHasFled(false); // Reset fled status
    
    // Reset Phase 3 states
    setInPhase3(false);
    setInPhase2(false);
    setInPhase1(true); // Start in Phase 1
    setPhase1TurnCounter(0);
    setPhase2TurnCounter(0);
    setPhase2DamageStacks(0);
    setHasSpawnedPreviewAdd(false);
    setShadowAdds([]);
    setAoeWarning(false);
    setShowDodgeButton(false);
    setDodgeReady(false);
    setPhase3TurnCounter(0);
    setLifeDrainCounter(0);
    
    // Set Gauntlet dialogue
    const bossDialogue = GAME_CONSTANTS.BOSS_DIALOGUE.GAUNTLET;
    setEnemyDialogue(bossDialogue.START);
    
    addLog(`👹 ${bossNameGenerated.toUpperCase()} - THE GAUNTLET!`);
  };
  
  const taunt = () => {
    if (!battling || !isTauntAvailable) return;
    
    // Get appropriate taunt pool
    let tauntPool;
    if (battleType === 'elite' || battleType === 'final') {
      const dayKey = battleType === 'final' ? 'GAUNTLET' : `DAY_${((currentDay - 1) % 7) + 1}`;
      tauntPool = GAME_CONSTANTS.BOSS_DIALOGUE[dayKey].TAUNTS;
    } else if (battleType === 'wave') {
      tauntPool = GAME_CONSTANTS.ENEMY_DIALOGUE.TAUNTS.WAVE;
    } else {
      tauntPool = GAME_CONSTANTS.ENEMY_DIALOGUE.TAUNTS.REGULAR;
    }
    
    // Pick random taunt
    const randomTaunt = tauntPool[Math.floor(Math.random() * tauntPool.length)];
    
    // Show both dialogue boxes immediately
    setShowTauntBoxes(true);
    
    // Player text appears immediately
    setPlayerTaunt(randomTaunt.player);
    setEnemyTauntResponse(''); // Clear enemy text initially
    addLog(`The hero declares: "${randomTaunt.player}"`);
    
    // Delay enemy response (text appears after 1 second)
    setTimeout(() => {
      setEnemyTauntResponse(randomTaunt.enemy);
      addLog(`😡 ${bossName}: "${randomTaunt.enemy}"`);
      setEnemyDialogue(randomTaunt.enemy);
      
      // Apply ENRAGED status
      setEnragedTurns(3); // Lasts 3 turns
      addLog(`The enemy flies into a rage! It takes more damage but strikes harder and with less precision for 3 turns.`);
    }, 1000);
    
    // Consume taunt
    setIsTauntAvailable(false);
  };
  
  const attack = (enemyDelay = GAME_CONSTANTS.BOSS_ATTACK_DELAY) => {
    if (!battling || bossHp <= 0) return;
    
    // Wizard Temporal Rift - restore stamina at start of next turn
    if (wizardStaminaRegen && hero?.class?.name === 'Wizard') {
      const restored = Math.min(GAME_CONSTANTS.SPECIAL_ATTACKS.Wizard.staminaRegen, getMaxStamina() - stamina);
      if (restored > 0) {
        setStamina(s => Math.min(getMaxStamina(), s + restored));
        addLog(`✨ Temporal energy restored: +${restored} stamina`);
      }
      setWizardStaminaRegen(false);
    }
    
    // Clear Wizard cooldown when using normal attack
    if (wizardTemporalCooldown && hero?.class?.name === 'Wizard') {
      setWizardTemporalCooldown(false);
    }
    
    // Clear Crusader cooldown when using normal attack
    if (crusaderJudgmentCooldown && hero?.class?.name === 'Crusader') {
      setCrusaderJudgmentCooldown(false);
    }
    if (crusaderSmiteCooldown && hero?.class?.name === 'Crusader') {
      setCrusaderSmiteCooldown(false);
    }
    
    // Clear tactical skill cooldowns when using normal attack
    if (knightRallyingRoarCooldown && hero?.class?.name === 'Knight') {
      setKnightRallyingRoarCooldown(false);
    }
    if (knightCrushingBlowCooldown && hero?.class?.name === 'Knight') {
      setKnightCrushingBlowCooldown(false);
    }
    if (wizardEtherealBarrierCooldown && hero?.class?.name === 'Wizard') {
      setWizardEtherealBarrierCooldown(false);
    }
    if (assassinMarkForDeathCooldown && hero?.class?.name === 'Assassin') {
      setAssassinMarkForDeathCooldown(false);
    }
    if (crusaderBastionOfFaithCooldown && hero?.class?.name === 'Crusader') {
      setCrusaderBastionOfFaithCooldown(false);
    }
    
    // Auto-target shadow adds first in Phase 2 and Phase 3
    if ((inPhase2 || inPhase3) && shadowAdds.length > 0) {
      const targetAdd = shadowAdds[0];
      const damage = Math.floor((getBaseAttack() + (weaponOilActive ? 5 : 0)) * 0.7); // Reduced damage to adds
      const newAddHp = Math.max(0, targetAdd.hp - damage);
      
      if (newAddHp <= 0) {
        setShadowAdds(prev => prev.slice(1));
        addLog(`The hero banished the shadow manifestation with ${damage} damage!`);
      } else {
        setShadowAdds(prev => {
          const updated = [...prev];
          updated[0] = { ...updated[0], hp: newAddHp };
          return updated;
        });
        addLog(`The hero struck the shadow for ${damage} damage! (${newAddHp}/${targetAdd.maxHp} HP remaining)`);
      }
      
      // Still trigger boss counter-attack after killing add
      setTimeout(() => {
        if (!battling || hp <= 0) return;
        
        setCurrentAnimation('battle-shake');
        setTimeout(() => setCurrentAnimation(null), 250);
        
        // Use same boss attack formula as normal counter-attacks
        const dayScaling = Math.floor(Math.sqrt(currentDay) * 5);
        let baseAttack = GAME_CONSTANTS.BOSS_ATTACK_BASE + dayScaling;
        baseAttack = Math.min(baseAttack, 50); // Cap at 50
        
        const baseDamage = Math.max(1, Math.floor(
          baseAttack - 
          (getBaseDefense() + (armorPolishActive ? 5 : 0))
        ));
        
        setHp(h => Math.max(0, h - baseDamage));
        addLog(`The enemy retaliates, dealing ${baseDamage} damage to the hero!`);
        setPlayerFlash(true);
        sounds.playerDamage();
        setTimeout(() => setPlayerFlash(false), 200);
      }, 1000);
      
      return;
    }
    
    if (recklessStacks > 0) setRecklessStacks(0);
    
    setCurrentAnimation('battle-shake');
    setTimeout(() => setCurrentAnimation(null), 250);
    
    // Get enemy defense based on battle type
    let enemyDef = GAME_CONSTANTS.ENEMY_DEFENSE.regular;
    if (battleType === 'elite') {
      enemyDef = GAME_CONSTANTS.ENEMY_DEFENSE.elite;
    } else if (battleType === 'final' || isFinalBoss) {
      enemyDef = GAME_CONSTANTS.ENEMY_DEFENSE.gauntlet;
    }
    
    // Assassin Mark for Death: Reduce enemy defense by 20%
    if (assassinMarkForDeath > 0 && hero?.class?.name === 'Assassin') {
      enemyDef = Math.floor(enemyDef * (1 - GAME_CONSTANTS.TACTICAL_SKILLS.Assassin.defenseReduction));
    }
    
    // Calculate base damage
    const rawDamage = getBaseAttack() + (weaponOilActive ? 5 : 0) + Math.floor(Math.random() * 10);
    
    // Crit system with weapon affixes
    let critChance = GAME_CONSTANTS.CRIT_SYSTEM.baseCritChance;
    let critMultiplier = GAME_CONSTANTS.CRIT_SYSTEM.baseCritMultiplier;
    
    // Crusader Sanctified: +10% crit chance
    if (crusaderHolyEmpowerment > 0 && hero?.class?.name === 'Crusader') {
      critChance += GAME_CONSTANTS.SPECIAL_ATTACKS.Crusader.sanctifiedCrit;
    }
    
    // Assassin Mark for Death: +10% crit chance
    if (assassinMarkForDeath > 0 && hero?.class?.name === 'Assassin') {
      critChance += GAME_CONSTANTS.TACTICAL_SKILLS.Assassin.critBonus;
    }
    if (crusaderHolyEmpowerment > 0 && hero?.class?.name === 'Crusader') {
      critChance += GAME_CONSTANTS.SPECIAL_ATTACKS.Crusader.sanctifiedCrit;
    }
    
    // Add weapon affixes to crit
    if (equippedWeapon && equippedWeapon.affixes) {
      if (equippedWeapon.affixes.critChance) {
        critChance += equippedWeapon.affixes.critChance;
      }
      if (equippedWeapon.affixes.critMultiplier) {
        critMultiplier += equippedWeapon.affixes.critMultiplier;
      }
    }
    
    const critRoll = Math.random() * 100;
    const isCrit = critRoll < critChance;
    const actualCritMultiplier = isCrit ? critMultiplier : 1.0;
    
    // Apply crit and enemy defense
    const damage = Math.max(1, (rawDamage * actualCritMultiplier) - enemyDef);
    let finalDamage = damage;
    let bonusMessages = [];
    
    if (isCrit) {
      bonusMessages.push(`💥 CRITICAL HIT! (${actualCritMultiplier.toFixed(1)}x damage)`);
    }
    
    // Check for poison proc from weapon affixes
    if (equippedWeapon && equippedWeapon.affixes && equippedWeapon.affixes.poisonChance) {
      const poisonProcRoll = Math.random() * 100;
      if (poisonProcRoll < equippedWeapon.affixes.poisonChance) {
        const poisonDmg = Math.floor(equippedWeapon.affixes.poisonDamage || 5);
        setBossDebuffs(prev => ({
          ...prev,
          poisonTurns: 5,
          poisonDamage: poisonDmg,
          poisonedVulnerability: 0.15
        }));
        bonusMessages.push(`☠️ Poison applied! (${poisonDmg} dmg/turn, +15% vulnerability)`);
      }
    }
    
    if (bossDebuffs.poisonTurns > 0) {
      const poisonBonus = Math.floor(finalDamage * bossDebuffs.poisonedVulnerability);
      finalDamage += poisonBonus;
      bonusMessages.push(`☠️ +${poisonBonus} from poison vulnerability`);
    }
    
    // AOE Warning - Boss vulnerable but will counter-attack
    if (aoeWarning && inPhase3) {
      const vulnerableBonus = Math.floor(finalDamage * 0.5);
      finalDamage += vulnerableBonus;
      bonusMessages.push(`⚠️ +${vulnerableBonus} - Boss is VULNERABLE!`);
      addLog(`A risky gambit! Boss takes extra damage but WILL counter!`);
      setShowDodgeButton(false); // Can't dodge after attacking
    }
    
    // Apply enraged bonus (enemy takes +20% damage when enraged)
    if (enragedTurns > 0) {
      const enragedBonus = Math.floor(finalDamage * 0.2);
      finalDamage += enragedBonus;
      bonusMessages.push(`🔥 +${enragedBonus} from ENRAGED!`);
    }
    
    // Apply Wizard's Temporal Rift bonus (+25% damage on next attack)
    if (wizardTemporalBuff && hero?.class?.name === 'Wizard') {
      const temporalBonus = Math.floor(finalDamage * 0.25);
      finalDamage += temporalBonus;
      bonusMessages.push(`✨ +${temporalBonus} from Temporal Rift`);
      setWizardTemporalBuff(false);
    }
    
    // Apply Knight's Blood Oath damage bonus (Rallying Roar no longer gives damage)
    if (knightBloodOathTurns > 0 && hero?.class?.name === 'Knight') {
      const bloodOathBonus = Math.floor(finalDamage * GAME_CONSTANTS.SPECIAL_ATTACKS.Knight.buffDamage);
      finalDamage += bloodOathBonus;
      bonusMessages.push(`⚔️ +${bloodOathBonus} from Blood Oath (+50%)`);
    }
    
    // Apply Crusader's Holy Empowerment damage bonus
    if (crusaderHolyEmpowerment > 0 && hero?.class?.name === 'Crusader') {
      const empowermentBonus = Math.floor(finalDamage * GAME_CONSTANTS.SPECIAL_ATTACKS.Crusader.empowermentDamage);
      finalDamage += empowermentBonus;
      bonusMessages.push(`✙ +${empowermentBonus} from Holy Empowerment (+25%)`);
    }
    
    // Apply Crusader's Bastion of Faith damage bonus
    if (crusaderBastionOfFaith > 0 && hero?.class?.name === 'Crusader') {
      const bastionBonus = Math.floor(finalDamage * GAME_CONSTANTS.TACTICAL_SKILLS.Crusader.damageBonus);
      finalDamage += bastionBonus;
      bonusMessages.push(`✙ +${bastionBonus} from Bastion of Faith (+15%)`);
    }
    
    const newBossHp = Math.max(0, bossHp - finalDamage);
    setBossHp(newBossHp);
    
    // Crusader Holy Empowerment: heal on hit
    if (crusaderHolyEmpowerment > 0 && hero?.class?.name === 'Crusader') {
      let empowermentHeal = GAME_CONSTANTS.SPECIAL_ATTACKS.Crusader.empowermentHeal;
      
      // Bastion synergy: double the heal
      if (crusaderBastionOfFaith > 0) {
        empowermentHeal = Math.floor(empowermentHeal * GAME_CONSTANTS.TACTICAL_SKILLS.Crusader.empowermentHealBonus);
      }
      
      setHp(h => Math.min(getMaxHp(), h + empowermentHeal));
      bonusMessages.push(`✙ +${empowermentHeal} HP from Holy Empowerment`);
    }
    
    // Build charges for special attacks
    if (chargeStacks < GAME_CONSTANTS.CHARGE_SYSTEM.maxCharges) {
      setChargeStacks(c => Math.min(c + GAME_CONSTANTS.CHARGE_SYSTEM.chargePerAttack, GAME_CONSTANTS.CHARGE_SYSTEM.maxCharges));
      if (chargeStacks + 1 === GAME_CONSTANTS.CHARGE_SYSTEM.maxCharges) {
        addLog(`⚡ SPECIAL CHARGED! (Next special deals +25% damage)`);
      }
    }
    
    // Update dialogue based on HP phase
    const hpPercent = newBossHp / bossMax;
    
    // Phase 1 - Enrage at 80% HP (Gauntlet only)
    if (battleType === 'final' && hpPercent <= 0.80 && hpPercent > 0.79 && enragedTurns === 0) {
      setEnragedTurns(2);
      addLog(`Boss ENRAGED at 80% HP! (2 turns)`);
      addLog(`Enemy deals +15% damage but has 25% miss chance!`);
    }
    
    // Phase 2 detection for Gauntlet boss (66% HP)
    if (battleType === 'final' && !inPhase2 && hpPercent <= 0.66 && hpPercent > 0.33) {
      setInPhase1(false); // Exit Phase 1
      setInPhase2(true);
      setPhase1TurnCounter(0); // Reset Phase 1 counter
      setPhase2TurnCounter(0);
      setPhase2DamageStacks(0);
      addLog(`PHASE 2: THE PRESSURE!`);
      addLog(`Boss damage increases each turn!`);
      
      const bossDialogue = GAME_CONSTANTS.BOSS_DIALOGUE.GAUNTLET;
      setEnemyDialogue(bossDialogue.PHASE2);
    }
    
    // Phase 2 - Spawn preview add at 50% HP
    if (battleType === 'final' && inPhase2 && !hasSpawnedPreviewAdd && hpPercent <= 0.50 && hpPercent > 0.49) {
      const addId = `preview_add_${Date.now()}`;
      const addHp = 18;
      setShadowAdds([{ id: addId, hp: addHp, maxHp: addHp }]);
      setHasSpawnedPreviewAdd(true);
      addLog(`👤 A Shadow has materialized! (Preview of what's to come...)`);
    }
    
    // Phase 3 detection for Gauntlet boss
    if (battleType === 'final' && !inPhase3 && hpPercent <= 0.33 && hpPercent > 0) {
      setInPhase3(true);
      setInPhase2(false); // Exit Phase 2
      setPhase2DamageStacks(0); // Reset ramping stacks
      setPhase3TurnCounter(0);
      setLifeDrainCounter(0);
      addLog(`💀 PHASE 3: ABYSS AWAKENING!`);
      addLog(`🌑 The darkness intensifies... Shadows stir!`);
      
      const bossDialogue = GAME_CONSTANTS.BOSS_DIALOGUE.GAUNTLET;
      setEnemyDialogue(bossDialogue.PHASE3);
    }
    
    if (battleType === 'elite' || battleType === 'final') {
      // Boss dialogue (GAUNTLET for final, cycling for elite)
      const bossDialogueKey = battleType === 'final' ? 'GAUNTLET' : `DAY_${((currentDay - 1) % 7) + 1}`;
      const bossDialogue = GAME_CONSTANTS.BOSS_DIALOGUE[bossDialogueKey];
      
      // For Gauntlet, only use HP-based dialogue if not in any active phase (phases have cycling dialogue)
      // For elite bosses, use normal HP-based dialogue
      const isGauntletInActivePhase = battleType === 'final' && (inPhase1 || inPhase2 || inPhase3);
      
      if (bossDialogue && !isGauntletInActivePhase) {
        if (hpPercent <= 0.25 && hpPercent > 0) {
          setEnemyDialogue(bossDialogue.LOW);
        } else if (hpPercent <= 0.5) {
          setEnemyDialogue(bossDialogue.MID);
        }
      }
    } else if (battleType === 'regular' || battleType === 'wave') {
      // Regular enemy dialogue - switch to desperate at 33% HP
      if (hpPercent <= 0.33 && hpPercent > 0) {
        const lowHpQuotes = GAME_CONSTANTS.ENEMY_DIALOGUE.LOW_HP;
        const randomQuote = lowHpQuotes[Math.floor(Math.random() * lowHpQuotes.length)];
        setEnemyDialogue(randomQuote);
      }
    }
    
    // Context-based taunt triggers
    if (!isTauntAvailable && newBossHp > 0) {
      // Trigger 1: Enemy drops below 50% HP (one time only)
      if (hpPercent <= 0.5 && !hasTriggeredLowHpTaunt) {
        setIsTauntAvailable(true);
        setHasTriggeredLowHpTaunt(true);
        addLog(`💬 [TAUNT AVAILABLE]`);
      }
      // Trigger 2: Deal 30+ damage in one hit (15% chance)
      else if (finalDamage >= 30 && Math.random() < 0.15) {
        setIsTauntAvailable(true);
        addLog(`The enemy's rage is building... an opportunity to provoke!`);
      }
    }
    
    if (bossDebuffs.poisonTurns > 0 || enragedTurns > 0) {
      addLog(`The hero strikes with ${damage} base damage`);
      bonusMessages.forEach(msg => addLog(msg));
      addLog(`The enemy reels from ${finalDamage} total damage!`);
    } else {
      addLog(`The hero dealt ${finalDamage} damage to the enemy!`);
    }
    
    setBossFlash(true);
    sounds.bossDamage();
    setTimeout(() => setBossFlash(false), 200);
    
    if (newBossHp <= 0) {
      sounds.victory();
  setTimeout(() => {
    setCurrentAnimation('battle-shake');
    setTimeout(() => setCurrentAnimation(null), 250);
  }, 100);
  
  setRecklessStacks(0);
  
  // Different XP based on battle type
  let xpGain;
  let goldGain;
  if (isFinalBoss) {
    xpGain = GAME_CONSTANTS.XP_REWARDS.finalBoss;
    goldGain = 100; // Final boss
  } else if (battleType === 'elite') {
    xpGain = GAME_CONSTANTS.XP_REWARDS.miniBoss;
    goldGain = 50; // Elite boss
  } else if (battleType === 'wave') {
    xpGain = 15; // Wave enemy XP (reduced from 30)
    goldGain = 12; // Wave enemies drop more
  } else {
    xpGain = 10; // Regular enemy XP (reduced from 25)
    goldGain = 10; // Regular enemies
  }
  
  setXp(x => x + xpGain);
  setGold(e => e + goldGain);
  
  // Accumulate wave gold for final display
  if (battleType === 'wave') {
    setWaveGoldTotal(t => t + goldGain);
  }
  
  addLog(`Victory! The hero earned +${xpGain} XP, +${goldGain} Gold`);
  
  // Set victory dialogue
  if (battleType === 'elite' || battleType === 'final') {
    const bossDialogueKey = battleType === 'final' ? 'GAUNTLET' : `DAY_${((currentDay - 1) % 7) + 1}`;
    const bossDialogue = GAME_CONSTANTS.BOSS_DIALOGUE[bossDialogueKey];
    if (bossDialogue) {
      setEnemyDialogue(bossDialogue.VICTORY_PLAYER);
    }
  } else {
    // Regular enemy victory dialogue
    const victoryQuotes = GAME_CONSTANTS.ENEMY_DIALOGUE.VICTORY_PLAYER;
    const randomQuote = victoryQuotes[Math.floor(Math.random() * victoryQuotes.length)];
    setEnemyDialogue(randomQuote);
  }

  // Elite boss defeated - set daily flag (curse cleared at midnight)
if (battleType === 'elite') {
  setEliteBossDefeatedToday(true);
  addLog('Today\'s elite trial complete. Curse will be cleared at midnight.');
}
  
  // Check if wave continues
  if (battleType === 'wave' && currentWaveEnemy < totalWaveEnemies) {
    // More enemies in wave - keep battle screen open
    const nextEnemy = currentWaveEnemy + 1;
    addLog(`Next wave enemy incoming...`);
    setTimeout(() => spawnRegularEnemy(true, nextEnemy, totalWaveEnemies), 1500);
    // Don't close battle screen - let it transition to next enemy
    return;
  }
  
  // Wave complete bonus
  if (battleType === 'wave') {
    setXp(x => x + 20);
    addLog(`The wave is vanquished! +20 bonus XP`);
  }
  
  setBattling(false);
  setBattleMode(false);
  setKnightConsecutiveUses(0); // Reset HP cost escalation on combat end
  setKnightCrushingBlowCooldown(false); // Reset Crushing Blow cooldown
  setCrusaderSmiteCooldown(false); // Reset Smite cooldown
  setRecklessStacks(0);
      
      // Generate loot using reusable function
      generateVictoryLoot(battleType, isFinalBoss, goldGain, waveGoldTotal);
      
      // No auto-close - let player click continue button
      
      return;
    }
    
    setTimeout(() => {
      if (!battling || hp <= 0) return;
      
      setCurrentAnimation('battle-shake');
      setTimeout(() => setCurrentAnimation(null), 250);
      
      // Enemy attack damage
let baseAttack, attackScaling;
if (battleType === 'regular' || battleType === 'wave') {
  baseAttack = 16;
  attackScaling = 1.5;
} else {
  // Elite and Final bosses use constants
  baseAttack = battleType === 'final' ? GAME_CONSTANTS.BOSS_ATTACK_BASE : GAME_CONSTANTS.MINI_BOSS_ATK_BASE;
  attackScaling = battleType === 'final' ? GAME_CONSTANTS.BOSS_ATTACK_DAY_SCALING : GAME_CONSTANTS.MINI_BOSS_ATK_SCALING;
}

// Diminishing returns armor formula: damage * (K / (K + armor))
const rawEnemyDamage = baseAttack + (currentDay * attackScaling);
const playerArmor = getBaseDefense() + (armorPolishActive ? 5 : 0);
const K = GAME_CONSTANTS.ARMOR_K_CONSTANT; // 60
const damageReduction = K / (K + playerArmor);
let bossDamage = Math.max(1, Math.floor(rawEnemyDamage * damageReduction));

// Apply percentDR from armor affixes
let percentDR = 0;
Object.values(equippedArmor).forEach(piece => {
  if (piece && piece.affixes && piece.affixes.percentDR) {
    percentDR += piece.affixes.percentDR;
  }
});
if (percentDR > 0) {
  bossDamage = Math.floor(bossDamage * (1 - percentDR / 100));
}

// Curse level increases enemy damage
if (curseLevel === 2) {
  bossDamage = Math.floor(bossDamage * 1.2); // 20% harder
} else if (curseLevel === 3) {
  bossDamage = Math.floor(bossDamage * 1.4); // 40% harder
}

// Phase 2 ramping damage (Gauntlet only)
if (inPhase2 && battleType === 'final' && !inPhase3) {
  const rampBonus = Math.floor(bossDamage * (phase2DamageStacks * 0.05));
  if (rampBonus > 0) {
    bossDamage += rampBonus;
  }
  setPhase2DamageStacks(prev => prev + 1);
}

// Enraged enemies hit +15% harder
if (enragedTurns > 0) {
  const enragedBonus = Math.floor(bossDamage * 0.15);
  bossDamage += enragedBonus;
  
  // 25% miss chance when enraged (wild swings)
  if (Math.random() < 0.25) {
    addLog(`The enemy's wild strike misses!`);
    
    // Decrement enraged turns even on miss
    setEnragedTurns(prev => {
      const newTurns = prev - 1;
      if (newTurns === 0) {
        addLog(`😤 Enemy is no longer ENRAGED`);
        setPlayerTaunt('');
        setEnemyTauntResponse('');
        setShowTauntBoxes(false);
      }
      return newTurns;
    });
    
    // Taunt becomes available on enemy miss
    if (!isTauntAvailable) {
      setIsTauntAvailable(true);
      addLog(`💬 [TAUNT AVAILABLE] - Enemy missed! Opening spotted!`);
    }
    return; // Skip damage entirely
  }
}


// Knight defense modifiers (additive stacking)
let knightDefenseModifier = 0;

// Blood Oath: -30% defense (TAKE MORE DAMAGE - glass cannon)
if (knightBloodOathTurns > 0 && hero?.class?.name === 'Knight') {
  knightDefenseModifier -= GAME_CONSTANTS.SPECIAL_ATTACKS.Knight.defenseReduction; // -0.30
}

// Rallying Roar: +40% defense (TANK MODE)
if (knightRallyingRoar > 0 && hero?.class?.name === 'Knight') {
  knightDefenseModifier += GAME_CONSTANTS.TACTICAL_SKILLS.Knight.defenseBonus; // +0.40
}

// Apply net modifier (can be positive or negative)
if (knightDefenseModifier !== 0) {
  if (knightDefenseModifier > 0) {
    // Defense buff - reduce incoming damage
    const reduction = Math.floor(bossDamage * knightDefenseModifier);
    bossDamage = Math.max(1, bossDamage - reduction);
  } else {
    // Defense penalty - INCREASE incoming damage
    const penalty = Math.floor(bossDamage * Math.abs(knightDefenseModifier));
    bossDamage += penalty;
  }
}

// Wizard Ethereal Barrier: 30% damage reduction + 10% reflection
if (wizardEtherealBarrier > 0 && hero?.class?.name === 'Wizard') {
  const originalDamage = bossDamage;
  const reduction = Math.floor(bossDamage * GAME_CONSTANTS.TACTICAL_SKILLS.Wizard.damageReduction);
  bossDamage = Math.max(1, bossDamage - reduction);
  
  // Reflect 10% of original damage back to boss
  const reflectDamage = Math.floor(originalDamage * GAME_CONSTANTS.TACTICAL_SKILLS.Wizard.damageReflect);
  if (reflectDamage > 0) {
    setBossHp(h => Math.max(0, h - reflectDamage));
    addLog(`✨ Ethereal Barrier reflects ${reflectDamage} damage!`);
  }
}

// Crusader Bastion of Faith: +20% defense
if (crusaderBastionOfFaith > 0 && hero?.class?.name === 'Crusader') {
  const reduction = Math.floor(bossDamage * GAME_CONSTANTS.TACTICAL_SKILLS.Crusader.defenseBonus);
  bossDamage = Math.max(1, bossDamage - reduction);
}
      
      setPlayerFlash(true);
      sounds.playerDamage();
      setTimeout(() => setPlayerFlash(false), 200);
      
      // Check for AOE execution (Phase 3 gauntlet)
      if (aoeWarning && inPhase3 && battleType === 'final') {
        if (dodgeReady) {
          // Player dodged successfully
          addLog(`The hero dodged! AOE DODGED!`);
          setDodgeReady(false);
        } else {
          // AOE hits - check for Wizard's Temporal Rift reduction
          let aoeDamage = 35;
          
          // Wizard's Temporal Rift reduces AOE damage by 50%
          if (bossDebuffs.stunned && hero?.class?.name === 'Wizard') {
            aoeDamage = Math.floor(aoeDamage * 0.5);
            addLog(`✨ Temporal Rift reduces AOE damage!`);
            addLog(`💥 AOE SLAM! -${aoeDamage} HP (reduced from 35)`);
          } else {
            addLog(`💥 DEVASTATING AOE SLAM! -${aoeDamage} HP`);
          }
          
          setHp(currentHp => {
            const newHp = Math.max(0, currentHp - aoeDamage);
            if (newHp <= 0) {
              setTimeout(() => {
                addLog('💀 You have been defeated by the AOE!');
                die();
              }, 500);
            }
            return newHp;
          });
        }
        setAoeWarning(false);
        setShowDodgeButton(false);
        // Skip normal attack this turn
        return;
      }
      
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
      addLog(`💥 Boss strikes! -${bossDamage} HP${enragedTurns > 0 ? ' (ENRAGED!)' : ''}`);
      
      // Taunt trigger: 25% chance after taking damage
      if (!isTauntAvailable && bossDamage > 0 && Math.random() < 0.25) {
        setIsTauntAvailable(true);
        addLog(`💬 [TAUNT AVAILABLE] - Enemy left an opening!`);
      }
      
      // Decrement enraged turns
      if (enragedTurns > 0) {
        setEnragedTurns(prev => {
          const newTurns = prev - 1;
          if (newTurns === 0) {
            addLog(`😤 Enemy is no longer ENRAGED`);
            setPlayerTaunt(''); // Clear taunt dialogue when enraged expires
            setEnemyTauntResponse('');
            setShowTauntBoxes(false);
          }
          return newTurns;
        });
      }
      
      // Decrement Crusader Holy Empowerment turns
      if (crusaderHolyEmpowerment > 0) {
        setCrusaderHolyEmpowerment(prev => {
          const newTurns = prev - 1;
          if (newTurns === 0) {
            addLog(`✙ Holy Empowerment fades...`);
          }
          return newTurns;
        });
      }
      
      // Decrement Knight Blood Oath turns
      if (knightBloodOathTurns > 0) {
        setKnightBloodOathTurns(prev => {
          const newTurns = prev - 1;
          if (newTurns === 0) {
            addLog(`⚔️ Blood Oath fades...`);
            setKnightConsecutiveUses(0); // Reset escalation when buff expires
          }
          return newTurns;
        });
      }
      
      // Decrement tactical skill turns
      if (knightRallyingRoar > 0) {
        setKnightRallyingRoar(prev => {
          const newTurns = prev - 1;
          if (newTurns === 0) addLog(`⚔️ Rallying Roar fades...`);
          return newTurns;
        });
      }
      if (wizardEtherealBarrier > 0) {
        setWizardEtherealBarrier(prev => {
          const newTurns = prev - 1;
          if (newTurns === 0) addLog(`✨ Ethereal Barrier fades...`);
          return newTurns;
        });
      }
      if (assassinMarkForDeath > 0) {
        setAssassinMarkForDeath(prev => {
          const newTurns = prev - 1;
          if (newTurns === 0) addLog(`☠️ Mark for Death fades...`);
          return newTurns;
        });
      }
      if (crusaderBastionOfFaith > 0) {
        setCrusaderBastionOfFaith(prev => {
          const newTurns = prev - 1;
          if (newTurns === 0) addLog(`✙ Bastion of Faith fades...`);
          return newTurns;
        });
      }
      
      setTimeout(() => {
        if (!battling) return;
        
        if (bossDebuffs.poisonTurns > 0) {
          let poisonDmg = bossDebuffs.poisonDamage;
          
          // Assassin Mark for Death: +50% poison damage
          if (assassinMarkForDeath > 0 && hero?.class?.name === 'Assassin') {
            poisonDmg = Math.floor(poisonDmg * (1 + GAME_CONSTANTS.TACTICAL_SKILLS.Assassin.poisonBonus));
          }
          
          setBossHp(h => {
            const newHp = Math.max(0, h - poisonDmg);
            if (newHp > 0) {
              // Assassin gains stamina from poison ticks
              if (hero?.class?.name === 'Assassin') {
                const staminaGain = GAME_CONSTANTS.SPECIAL_ATTACKS.Assassin.staminaPerTick;
                setStamina(s => Math.min(getMaxStamina(), s + staminaGain));
                addLog(`☠️ Poison deals ${poisonDmg} damage! +${staminaGain} stamina (${bossDebuffs.poisonTurns - 1} turns left)`);
              } else {
                addLog(`Poison coursing through veins deals ${poisonDmg} damage! (${bossDebuffs.poisonTurns - 1} turns left)`);
              }
            } else {
              addLog(`Poison coursing through veins deals ${poisonDmg} damage!`);
              addLog(`💀 Boss succumbed to poison!`);
              
              setTimeout(() => {
                const xpGain = isFinalBoss ? GAME_CONSTANTS.XP_REWARDS.finalBoss : GAME_CONSTANTS.XP_REWARDS.miniBoss;
                const goldGain = calculateCombatGold(isFinalBoss ? 'final' : (battleType === 'elite' ? 'elite' : 'normal'));
                setXp(x => x + xpGain);
                setGold(e => e + goldGain);
                addLog(`Victory! The hero earned +${xpGain} XP, +${goldGain} Gold`);
                
                // Set victory dialogue
                if (battleType === 'elite' || battleType === 'final') {
                  const bossDialogueKey = battleType === 'final' ? 'GAUNTLET' : `DAY_${((currentDay - 1) % 7) + 1}`;
                  const bossDialogue = GAME_CONSTANTS.BOSS_DIALOGUE[bossDialogueKey];
                  if (bossDialogue) {
                    setEnemyDialogue(bossDialogue.VICTORY_PLAYER);
                  }
                } else {
                  const victoryQuotes = GAME_CONSTANTS.ENEMY_DIALOGUE.VICTORY_PLAYER;
                  const randomQuote = victoryQuotes[Math.floor(Math.random() * victoryQuotes.length)];
                  setEnemyDialogue(randomQuote);
                }
                
                setBattling(false);
                setBattleMode(false);
                setRecklessStacks(0);
                
                if (!isFinalBoss) {
                  setHp(getMaxHp());
                  addLog('The hero is fully healed!');
                }
                
                // Generate loot using reusable function
                generateVictoryLoot(battleType, isFinalBoss, goldGain);
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
          
          // Reset Assassin poison stacks when poison expires
          if (bossDebuffs.poisonTurns - 1 === 0) {
            setAssassinPoisonStacks(0);
          }
        }
        
        
        // Phase 1 mechanics for Gauntlet boss
        if (inPhase1 && battleType === 'final' && bossHp > 0 && !inPhase2 && !inPhase3) {
          setPhase1TurnCounter(prev => prev + 1);
          
          // Cycle Phase 1 dialogue every 3 turns
          if (phase1TurnCounter > 0 && phase1TurnCounter % 3 === 0) {
            const bossDialogue = GAME_CONSTANTS.BOSS_DIALOGUE.GAUNTLET;
            const cycleDialogue = bossDialogue.PHASE1_CYCLE;
            const randomLine = cycleDialogue[Math.floor(Math.random() * cycleDialogue.length)];
            setEnemyDialogue(randomLine);
          }
        }
        
        // Phase 2 mechanics for Gauntlet boss
        if (inPhase2 && battleType === 'final' && bossHp > 0 && !inPhase3) {
          setPhase2TurnCounter(prev => prev + 1);
          
          // Cycle Phase 2 dialogue every 3 turns
          if (phase2TurnCounter > 0 && phase2TurnCounter % 3 === 0) {
            const bossDialogue = GAME_CONSTANTS.BOSS_DIALOGUE.GAUNTLET;
            const cycleDialogue = bossDialogue.PHASE2_CYCLE;
            const randomLine = cycleDialogue[Math.floor(Math.random() * cycleDialogue.length)];
            setEnemyDialogue(randomLine);
          }
        }
        
        // Phase 3 mechanics for Gauntlet boss
        if (inPhase3 && battleType === 'final' && bossHp > 0) {
          setPhase3TurnCounter(prev => prev + 1);
          setLifeDrainCounter(prev => prev + 1);
          
          // Cycle Phase 3 dialogue every 3 turns
          if (phase3TurnCounter > 0 && phase3TurnCounter % 3 === 0) {
            const bossDialogue = GAME_CONSTANTS.BOSS_DIALOGUE.GAUNTLET;
            const cycleDialogue = bossDialogue.PHASE3_CYCLE;
            const randomLine = cycleDialogue[Math.floor(Math.random() * cycleDialogue.length)];
            setEnemyDialogue(randomLine);
          }
          
          // Spawn shadow add every 4 turns
          if (phase3TurnCounter > 0 && phase3TurnCounter % 4 === 0) {
            const addId = `add_${Date.now()}`;
            const addHp = 18;
            setShadowAdds(prev => [...prev, { id: addId, hp: addHp, maxHp: addHp }]);
            addLog(`👤 A Shadow emerges from the abyss! (${addHp} HP)`);
          }
          
          // Life drain every 5 turns
          if (lifeDrainCounter >= 5) {
            const drainAmount = 15;
            setHp(h => Math.max(0, h - drainAmount));
            setBossHp(b => Math.min(bossMax, b + drainAmount));
            addLog(`🩸 LIFE DRAIN! Boss drains ${drainAmount} HP from you!`);
            setLifeDrainCounter(0);
          }
          
          // AOE warning every 5 turns (offset from life drain)
          if (phase3TurnCounter > 0 && phase3TurnCounter % 5 === 2) {
            setAoeWarning(true);
            setShowDodgeButton(true);
            addLog(`The enemy raises ITS WEAPON TO THE SKY!`);
            addLog(`A chance to dodge the incoming attack! - or attack for bonus damage!`);
          }
          
          // Shadow adds heal boss if alive
          if (shadowAdds.length > 0) {
            const healPerAdd = 8;
            const healAmount = shadowAdds.length * healPerAdd;
            setBossHp(b => Math.min(bossMax, b + healAmount));
            addLog(`👤 ${shadowAdds.length} Shadow Add${shadowAdds.length > 1 ? 's' : ''} heal boss for ${healAmount} HP!`);
          }
        }
      }, 200);
    }, enemyDelay);
  };
  
  const specialAttack = (enemyDelay = GAME_CONSTANTS.BOSS_ATTACK_DELAY) => {
    if (!battling || bossHp <= 0 || !hero || !hero.class) return;
    
    const special = GAME_CONSTANTS.SPECIAL_ATTACKS[hero.class.name];
    if (!special) return;
    
    if (stamina < special.cost) {
      addLog(`The hero needs ${special.cost} stamina! (Have ${stamina})`);
      return;
    }
    
    let hpCost = 0;
    let totalPercent = 0; // DECLARE HERE to fix scope bug
    
    if (hero.class.name === 'Knight') {
      // NEW: Blood Oath - percentage-based HP cost with escalation
      let basePercent = GAME_CONSTANTS.SPECIAL_ATTACKS.Knight.hpCostPercent;
      const escalation = GAME_CONSTANTS.SPECIAL_ATTACKS.Knight.hpCostEscalation;
      
      // Synergy: Rallying Roar reduces HP cost by 5%
      if (knightRallyingRoar > 0) {
        basePercent -= GAME_CONSTANTS.TACTICAL_SKILLS.Knight.bloodOathReduction;
        addLog(`⚔️ Rallying Roar synergy: HP cost reduced by 5%!`);
      }
      
      totalPercent = basePercent + (knightConsecutiveUses * escalation);
      hpCost = Math.floor(hp * totalPercent);
      
      if (hp <= hpCost) {
        addLog(`⚔️ Blood Oath requires more than ${hpCost} HP! (${Math.floor(totalPercent * 100)}% of current HP)`);
        return;
      }
    }
    
    setStamina(s => s - special.cost);
    
    if (hpCost > 0 && hero.class.name === 'Knight') {
      setHp(h => Math.max(1, h - hpCost));
      const percentUsed = Math.floor(totalPercent * 100); // FIX: use totalPercent directly
      addLog(`⚔️ Blood Oath! Sacrificed ${hpCost} HP (${percentUsed}% of current HP)`);
      setKnightConsecutiveUses(u => u + 1);
    }
    
    setCurrentAnimation('battle-shake');
    setTimeout(() => setCurrentAnimation(null), 250);
    
    // Get enemy defense based on battle type
    let enemyDef = GAME_CONSTANTS.ENEMY_DEFENSE.regular;
    if (battleType === 'elite') {
      enemyDef = GAME_CONSTANTS.ENEMY_DEFENSE.elite;
    } else if (battleType === 'final' || isFinalBoss) {
      enemyDef = GAME_CONSTANTS.ENEMY_DEFENSE.gauntlet;
    }
    
    // Calculate base damage with special multiplier
    const baseDamage = getBaseAttack() + Math.floor(Math.random() * 10);
    
    // Crit system (specials can crit too!)
    const critRoll = Math.random() * 100;
    let critChance = GAME_CONSTANTS.CRIT_SYSTEM.baseCritChance;
    
    // Crusader Sanctified: +10% crit chance
    if (crusaderHolyEmpowerment > 0 && hero?.class?.name === 'Crusader') {
      critChance += GAME_CONSTANTS.SPECIAL_ATTACKS.Crusader.sanctifiedCrit;
    }
    
    const isCrit = critRoll < critChance;
    const critMultiplier = isCrit ? GAME_CONSTANTS.CRIT_SYSTEM.baseCritMultiplier : 1.0;
    
    const rawDamage = (baseDamage * critMultiplier) * special.damageMultiplier;
    let damage = Math.max(1, Math.floor(rawDamage - enemyDef));
    
    // Apply charge bonus if at max charges
    if (chargeStacks === GAME_CONSTANTS.CHARGE_SYSTEM.maxCharges) {
      const chargeBonus = Math.floor(damage * GAME_CONSTANTS.CHARGE_SYSTEM.chargeBonus);
      damage += chargeBonus;
      addLog(`⚡ CHARGED SPECIAL! +${chargeBonus} damage (+25%)`);
      setChargeStacks(0); // Consume charges
    } else {
      setChargeStacks(0); // Still consume any partial charges
    }
    
    if (isCrit) {
      addLog(`💥 CRITICAL ${special.name.toUpperCase()}!`);
    }
    
    const wasPoisoned = bossDebuffs.poisonTurns > 0;
    if (wasPoisoned && bossDebuffs.poisonedVulnerability > 0) {
      const bonusDamage = Math.floor(damage * bossDebuffs.poisonedVulnerability);
      damage += bonusDamage;
    }
    
    // Wizard Ethereal Barrier synergy: +15% damage to Temporal Rift
    if (wizardEtherealBarrier > 0 && hero.class.name === 'Wizard') {
      const barrierBonus = Math.floor(damage * GAME_CONSTANTS.TACTICAL_SKILLS.Wizard.riftBonus);
      damage += barrierBonus;
      addLog(`✨ Ethereal Barrier synergy: +${barrierBonus} damage (+15%)`);
    }
    
    // AOE Warning - Boss vulnerable but will counter-attack (special attacks too)
    if (aoeWarning && inPhase3) {
      const vulnerableBonus = Math.floor(damage * 0.5);
      damage += vulnerableBonus;
      addLog(`The enemy is vulnerable! +${vulnerableBonus} bonus damage!`);
      setShowDodgeButton(false); // Can't dodge after attacking
    }
    
    let effectMessage = '';
    let skipCounterAttack = false;
    
    if (hero.class.name === 'Knight') {
      // NEW: Blood Oath buff (2 turns: +20% damage, -20% incoming)
      setKnightBloodOathTurns(GAME_CONSTANTS.SPECIAL_ATTACKS.Knight.buffTurns);
      effectMessage = `⚔️ BLOOD OATH! +50% damage, -30% defense for ${GAME_CONSTANTS.SPECIAL_ATTACKS.Knight.buffTurns} turns (GLASS CANNON MODE)`;
    } else if (hero.class.name === 'Wizard') {
      // Check cooldown - can't use twice in a row
      if (wizardTemporalCooldown) {
        addLog(`✨ Temporal Rift is still recovering! Use a normal attack first.`);
        return;
      }
      
      // NEW: Temporal Rift mechanics
      setBossDebuffs(prev => ({ ...prev, stunned: true }));
      
      // Set next-turn buffs
      setWizardTemporalBuff(true); // Next attack deals +25% damage
      setWizardStaminaRegen(true); // Restore 15 stamina next turn
      setWizardTemporalCooldown(true); // Can't use again until after next attack
      
      // During AOE warning, boss WILL counter-attack but damage is reduced
      skipCounterAttack = !aoeWarning;
      
      if (aoeWarning) {
        effectMessage = '✨ TEMPORAL RIFT! Time slows - AOE reduced!';
        addLog('✨ AOE damage reduced by 50%!');
      } else {
        effectMessage = '✨ TEMPORAL RIFT! Boss frozen in time!';
      }
    } else if (hero.class.name === 'Assassin') {
      // NEW: Shadow Venom mechanics
      const existingTurns = bossDebuffs.poisonTurns || 0;
      const existingDamage = bossDebuffs.poisonDamage || 0;
      
      if (existingTurns > 0) {
        // DETONATE existing poison for burst damage
        const burstDamage = existingTurns * existingDamage * 2;
        setBossHp(h => Math.max(0, h - burstDamage));
        addLog(`💀 POISON DETONATION! ${burstDamage} burst damage (${existingTurns} turns × ${existingDamage} dmg × 2)`);
        
        // Reapply with increased stacks
        if (assassinPoisonStacks < GAME_CONSTANTS.SPECIAL_ATTACKS.Assassin.maxStacks) {
          const newStacks = assassinPoisonStacks + 1;
          setAssassinPoisonStacks(newStacks);
          const newPoisonDmg = GAME_CONSTANTS.SPECIAL_ATTACKS.Assassin.poisonDamage * newStacks;
          setBossDebuffs(prev => ({
            ...prev,
            poisonTurns: GAME_CONSTANTS.SPECIAL_ATTACKS.Assassin.poisonTurns,
            poisonDamage: newPoisonDmg,
            poisonedVulnerability: 0.15
          }));
          effectMessage = `☠️ SHADOW VENOM! Detonated + Reapplied (Stack ${newStacks}/${GAME_CONSTANTS.SPECIAL_ATTACKS.Assassin.maxStacks})`;
        } else {
          // Max stacks - just reapply
          setBossDebuffs(prev => ({
            ...prev,
            poisonTurns: GAME_CONSTANTS.SPECIAL_ATTACKS.Assassin.poisonTurns,
            poisonDamage: existingDamage,
            poisonedVulnerability: 0.15
          }));
          effectMessage = `☠️ SHADOW VENOM! Detonated + Refreshed (Max Stacks)`;
        }
      } else {
        // Initial poison application
        setAssassinPoisonStacks(1);
        setBossDebuffs(prev => ({
          ...prev,
          poisonTurns: GAME_CONSTANTS.SPECIAL_ATTACKS.Assassin.poisonTurns,
          poisonDamage: GAME_CONSTANTS.SPECIAL_ATTACKS.Assassin.poisonDamage,
          poisonedVulnerability: 0.15
        }));
        effectMessage = `☠️ SHADOW VENOM! Boss poisoned (${GAME_CONSTANTS.SPECIAL_ATTACKS.Assassin.poisonDamage} dmg/turn, 5 turns)`;
      }
    } else if (hero.class.name === 'Crusader') {
      // Check cooldown - can't use twice in a row
      if (crusaderJudgmentCooldown) {
        addLog(`✙ Judgment of Light is still recovering! Use a normal attack first.`);
        return;
      }
      
      // NEW: Judgment of Light mechanics
      const healAmount = GAME_CONSTANTS.SPECIAL_ATTACKS.Crusader.healAmount;
      
      setHp(h => Math.min(getMaxHp(), h + healAmount));
      
      // Apply Holy Empowerment buff (3 turns)
      setCrusaderHolyEmpowerment(GAME_CONSTANTS.SPECIAL_ATTACKS.Crusader.empowermentTurns);
      setCrusaderJudgmentCooldown(true); // Can't use again until after next attack
      
      effectMessage = `✙ JUDGMENT OF LIGHT! +${healAmount} HP, Holy Empowerment (3 turns: +25% dmg, +15% crit, heal on hit)`;
    }
    
    const newBossHp = Math.max(0, bossHp - damage);
    setBossHp(newBossHp);
    
    // Update dialogue based on HP phase
    const hpPercent = newBossHp / bossMax;
    
    if (battleType === 'elite' || battleType === 'final') {
      // Boss dialogue (GAUNTLET for final, cycling for elite)
      const bossDialogueKey = battleType === 'final' ? 'GAUNTLET' : `DAY_${((currentDay - 1) % 7) + 1}`;
      const bossDialogue = GAME_CONSTANTS.BOSS_DIALOGUE[bossDialogueKey];
      
      // For Gauntlet, only use HP-based dialogue if not in any active phase (phases have cycling dialogue)
      // For elite bosses, use normal HP-based dialogue
      const isGauntletInActivePhase = battleType === 'final' && (inPhase1 || inPhase2 || inPhase3);
      
      if (bossDialogue && !isGauntletInActivePhase) {
        if (hpPercent <= 0.25 && hpPercent > 0) {
          setEnemyDialogue(bossDialogue.LOW);
        } else if (hpPercent <= 0.5) {
          setEnemyDialogue(bossDialogue.MID);
        }
      }
    } else if (battleType === 'regular' || battleType === 'wave') {
      // Regular enemy dialogue - switch to desperate at 33% HP
      if (hpPercent <= 0.33 && hpPercent > 0) {
        const lowHpQuotes = GAME_CONSTANTS.ENEMY_DIALOGUE.LOW_HP;
        const randomQuote = lowHpQuotes[Math.floor(Math.random() * lowHpQuotes.length)];
        setEnemyDialogue(randomQuote);
      }
    }
    
    // Context-based taunt triggers
    if (!isTauntAvailable && newBossHp > 0) {
      // Trigger 1: Enemy drops below 50% HP (one time only)
      if (hpPercent <= 0.5 && !hasTriggeredLowHpTaunt) {
        setIsTauntAvailable(true);
        setHasTriggeredLowHpTaunt(true);
        addLog(`💬 [TAUNT AVAILABLE]`);
      }
      // Trigger 2: Deal 30+ damage in one hit (15% chance)
      else if (damage >= 30 && Math.random() < 0.15) {
        setIsTauntAvailable(true);
        addLog(`💬 [TAUNT AVAILABLE]`);
      }
    }
    
    let damageLog = `⚡ ${special.name}! Dealt ${damage} damage!`;
    let bonusMessages = [];
    
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
      const goldGain = calculateCombatGold(isFinalBoss ? 'final' : (battleType === 'elite' ? 'elite' : (battleType === 'wave' ? 'wave' : 'normal')));
      setXp(x => x + xpGain);
      setGold(e => e + goldGain);
      
      // Accumulate wave gold for final display
      if (battleType === 'wave') {
        setWaveGoldTotal(t => t + goldGain);
      }
      
      addLog(`Victory! The hero earned +${xpGain} XP, +${goldGain} Gold`);
      
      // Set victory dialogue
      if (battleType === 'elite' || battleType === 'final') {
        const bossDialogueKey = battleType === 'final' ? 'GAUNTLET' : `DAY_${((currentDay - 1) % 7) + 1}`;
        const bossDialogue = GAME_CONSTANTS.BOSS_DIALOGUE[bossDialogueKey];
        if (bossDialogue) {
          setEnemyDialogue(bossDialogue.VICTORY_PLAYER);
        }
      } else {
        const victoryQuotes = GAME_CONSTANTS.ENEMY_DIALOGUE.VICTORY_PLAYER;
        const randomQuote = victoryQuotes[Math.floor(Math.random() * victoryQuotes.length)];
        setEnemyDialogue(randomQuote);
      }
      
      setBattling(false);
      setBattleMode(false);
      setKnightConsecutiveUses(0); // Reset HP cost escalation on combat end
      setKnightCrushingBlowCooldown(false); // Reset Crushing Blow cooldown
      setCrusaderSmiteCooldown(false); // Reset Smite cooldown
      setRecklessStacks(0);
      
      const lootMessages = [];
      
      if (!isFinalBoss) {
  // Regular/wave enemies: potions only
  if (battleType === 'regular' || battleType === 'wave') {
    const lootRoll = Math.random();
    if (lootRoll < 0.2) {
      setHealthPots(h => h + 1);
      lootMessages.push('💊 Health Potion');
      addLog('💊 Looted: Health Potion!');
    } else if (lootRoll < 0.55) {
      setStaminaPots(s => s + 1);
      lootMessages.push('⚡ Stamina Potion');
      addLog('⚡ Looted: Stamina Potion!');
    }
  } else {
    // Elite bosses: weapon/armor upgrades
    const lootRoll = Math.random();
    const luckMultiplier = luckyCharmActive ? 2 : 1;
    
    if (lootRoll < GAME_CONSTANTS.MINI_BOSS_LOOT_RATES.HEALTH_POTION) {
      setHealthPots(h => h + luckMultiplier);
      lootMessages.push(`💎 Health Potion${luckyCharmActive ? ' x2' : ''}`);
      addLog(`💎 Looted: Health Potion${luckyCharmActive ? ' x2 (Lucky Charm!)' : '!'}`);
    } else if (lootRoll < GAME_CONSTANTS.MINI_BOSS_LOOT_RATES.STAMINA_POTION) {
      setStaminaPots(s => s + luckMultiplier);
      lootMessages.push(`💎 Stamina Potion${luckyCharmActive ? ' x2' : ''}`);
      addLog(`💎 Looted: Stamina Potion${luckyCharmActive ? ' x2 (Lucky Charm!)' : '!'}`);
    } else if (lootRoll < GAME_CONSTANTS.MINI_BOSS_LOOT_RATES.WEAPON) {
      // Generate random weapon with boss-tier rarity
      const rarity = rollRarity('boss');
      const multiplier = getRarityMultiplier(rarity);
      
      const range = GAME_CONSTANTS.WEAPON_STAT_RANGES;
      const baseAttack = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
      const attack = Math.floor(baseAttack * multiplier);
      
      const names = GAME_CONSTANTS.WEAPON_NAMES[rarity];
      const name = names[Math.floor(Math.random() * names.length)];
      const rarityName = GAME_CONSTANTS.RARITY_TIERS[rarity].name;
      
      const affixes = generateAffixes(rarity, 'weapon');
      const newWeapon = { name, attack, rarity, affixes, id: Date.now() };
      setWeaponInventory(prev => sortByRarity([...prev, newWeapon]));
      
      lootMessages.push(`${rarityName} ${name} (+${attack} Attack)`);
      addLog(`💎 Looted: ${rarityName} ${name} (+${attack} Attack)${luckyCharmActive ? ' (Lucky Charm!)' : '!'}`);
    } else if (lootRoll < GAME_CONSTANTS.MINI_BOSS_LOOT_RATES.ARMOR) {
      // Generate random armor piece with boss-tier rarity
      const rarity = rollRarity('boss');
      const multiplier = getRarityMultiplier(rarity);
      
      const slots = ['helmet', 'chest', 'gloves', 'boots'];
      const slot = slots[Math.floor(Math.random() * slots.length)];
      const range = GAME_CONSTANTS.ARMOR_STAT_RANGES[slot];
      const baseDefense = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
      const defense = Math.floor(baseDefense * multiplier);
      
      const names = GAME_CONSTANTS.ARMOR_NAMES[slot][rarity];
      const name = names[Math.floor(Math.random() * names.length)];
      const rarityName = GAME_CONSTANTS.RARITY_TIERS[rarity].name;
      
      const affixes = generateAffixes(rarity, 'armor');
      const newArmor = { name, defense, rarity, affixes, id: Date.now() };
      setArmorInventory(prev => ({
        ...prev,
        [slot]: sortByRarity([...prev[slot], newArmor])
      }));
      
      lootMessages.push(`${rarityName} ${name} (+${defense} Defense)`);
      addLog(`💎 Looted: ${rarityName} ${name} (+${defense} Defense)${luckyCharmActive ? ' (Lucky Charm!)' : '!'}`);
    } else if (lootRoll < GAME_CONSTANTS.MINI_BOSS_LOOT_RATES.PENDANT) {
      // Generate random pendant with boss-tier rarity
      const rarity = rollRarity('boss');
      const multiplier = getRarityMultiplier(rarity);
      
      const range = GAME_CONSTANTS.ACCESSORY_STAT_RANGES.pendant;
      const baseHp = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
      const hp = Math.floor(baseHp * multiplier);
      
      const names = GAME_CONSTANTS.ACCESSORY_NAMES.pendant;
      const name = names[Math.floor(Math.random() * names.length)];
      const rarityName = GAME_CONSTANTS.RARITY_TIERS[rarity].name;
      
      const newPendant = { name, hp, rarity, id: Date.now() };
      setPendantInventory(prev => sortByRarity([...prev, newPendant]));
      
      lootMessages.push(`${rarityName} ${name} (+${hp} Health)`);
      addLog(`💎 Looted: ${rarityName} ${name} (+${hp} Health)${luckyCharmActive ? ' (Lucky Charm!)' : '!'}`);
    } else {
      // Generate random ring with boss-tier rarity
      const rarity = rollRarity('boss');
      const multiplier = getRarityMultiplier(rarity);
      
      const range = GAME_CONSTANTS.ACCESSORY_STAT_RANGES.ring;
      const baseStamina = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
      const stamina = Math.floor(baseStamina * multiplier);
      
      const names = GAME_CONSTANTS.ACCESSORY_NAMES.ring;
      const name = names[Math.floor(Math.random() * names.length)];
      const rarityName = GAME_CONSTANTS.RARITY_TIERS[rarity].name;
      
      const newRing = { name, stamina, rarity, id: Date.now() };
      setRingInventory(prev => sortByRarity([...prev, newRing]));
      
      lootMessages.push(`${rarityName} ${name} (+${stamina} STA)`);
      addLog(`💎 Looted: ${rarityName} ${name} (+${stamina} STA)${luckyCharmActive ? ' (Lucky Charm!)' : '!'}`);
    }
    
    if (luckyCharmActive) {
      setLuckyCharmActive(false);
      addLog('🍀 Lucky Charm consumed!');
    }
  }
        
        // Auto-heal removed - player must manage HP between battles
      }
      
      // Add gold gain to loot display
      const displayGold = battleType === 'wave' ? waveGoldTotal : goldGain;
      lootMessages.unshift(`+${displayGold} Gold`);
      
      setVictoryLoot(lootMessages);
      setVictoryFlash(true);
      setTimeout(() => setVictoryFlash(false), 400);
      
      // No auto-close - let player click continue button
      
      return;
    }
    
    if (!skipCounterAttack) {
      setTimeout(() => {
        if (!battling || hp <= 0) return;
        
        setBossDebuffs(prev => ({ ...prev, stunned: false }));
        
        setCurrentAnimation('battle-shake');
        setTimeout(() => setCurrentAnimation(null), 250);
        
        // Enemy attack damage
let baseAttack, attackScaling;
if (battleType === 'regular' || battleType === 'wave') {
  baseAttack = 16;
  attackScaling = 1.5;
} else {
  // Elite and Final bosses use constants
  baseAttack = battleType === 'final' ? GAME_CONSTANTS.BOSS_ATTACK_BASE : GAME_CONSTANTS.MINI_BOSS_ATK_BASE;
  attackScaling = battleType === 'final' ? GAME_CONSTANTS.BOSS_ATTACK_DAY_SCALING : GAME_CONSTANTS.MINI_BOSS_ATK_SCALING;
}

// Diminishing returns armor formula: damage * (K / (K + armor))
const rawEnemyDamage = baseAttack + (currentDay * attackScaling);
const playerArmor = getBaseDefense() + (armorPolishActive ? 5 : 0);
const K = GAME_CONSTANTS.ARMOR_K_CONSTANT; // 60
const damageReduction = K / (K + playerArmor);
let bossDamage = Math.max(1, Math.floor(rawEnemyDamage * damageReduction));

// Apply percentDR from armor affixes
let percentDR = 0;
Object.values(equippedArmor).forEach(piece => {
  if (piece && piece.affixes && piece.affixes.percentDR) {
    percentDR += piece.affixes.percentDR;
  }
});
if (percentDR > 0) {
  bossDamage = Math.floor(bossDamage * (1 - percentDR / 100));
}

// Curse level increases enemy damage
if (curseLevel === 2) {
  bossDamage = Math.floor(bossDamage * 1.2); // 20% harder
} else if (curseLevel === 3) {
  bossDamage = Math.floor(bossDamage * 1.4); // 40% harder
}

// Phase 2 ramping damage (Gauntlet only)
if (inPhase2 && battleType === 'final' && !inPhase3) {
  const rampBonus = Math.floor(bossDamage * (phase2DamageStacks * 0.05));
  if (rampBonus > 0) {
    bossDamage += rampBonus;
  }
  setPhase2DamageStacks(prev => prev + 1);
}

// Enraged enemies hit +15% harder
if (enragedTurns > 0) {
  const enragedBonus = Math.floor(bossDamage * 0.15);
  bossDamage += enragedBonus;
  
  // 25% miss chance when enraged (wild swings)
  if (Math.random() < 0.25) {
    addLog(`The enemy's wild strike misses!`);
    
    // Decrement enraged turns even on miss
    setEnragedTurns(prev => {
      const newTurns = prev - 1;
      if (newTurns === 0) {
        addLog(`😤 Enemy is no longer ENRAGED`);
        setPlayerTaunt('');
        setEnemyTauntResponse('');
        setShowTauntBoxes(false);
      }
      return newTurns;
    });
    
    // Taunt becomes available on enemy miss
    if (!isTauntAvailable) {
      setIsTauntAvailable(true);
      addLog(`💬 [TAUNT AVAILABLE] - Enemy missed! Opening spotted!`);
    }
    return; // Skip damage entirely
  }
}


// Knight defense modifiers (additive stacking)
let knightDefenseModifier = 0;

// Blood Oath: -30% defense (TAKE MORE DAMAGE - glass cannon)
if (knightBloodOathTurns > 0 && hero?.class?.name === 'Knight') {
  knightDefenseModifier -= GAME_CONSTANTS.SPECIAL_ATTACKS.Knight.defenseReduction; // -0.30
}

// Rallying Roar: +40% defense (TANK MODE)
if (knightRallyingRoar > 0 && hero?.class?.name === 'Knight') {
  knightDefenseModifier += GAME_CONSTANTS.TACTICAL_SKILLS.Knight.defenseBonus; // +0.40
}

// Apply net modifier (can be positive or negative)
if (knightDefenseModifier !== 0) {
  if (knightDefenseModifier > 0) {
    // Defense buff - reduce incoming damage
    const reduction = Math.floor(bossDamage * knightDefenseModifier);
    bossDamage = Math.max(1, bossDamage - reduction);
  } else {
    // Defense penalty - INCREASE incoming damage
    const penalty = Math.floor(bossDamage * Math.abs(knightDefenseModifier));
    bossDamage += penalty;
  }
}

// Wizard Ethereal Barrier: 30% damage reduction + 10% reflection
if (wizardEtherealBarrier > 0 && hero?.class?.name === 'Wizard') {
  const originalDamage = bossDamage;
  const reduction = Math.floor(bossDamage * GAME_CONSTANTS.TACTICAL_SKILLS.Wizard.damageReduction);
  bossDamage = Math.max(1, bossDamage - reduction);
  
  // Reflect 10% of original damage back to boss
  const reflectDamage = Math.floor(originalDamage * GAME_CONSTANTS.TACTICAL_SKILLS.Wizard.damageReflect);
  if (reflectDamage > 0) {
    setBossHp(h => Math.max(0, h - reflectDamage));
    addLog(`✨ Ethereal Barrier reflects ${reflectDamage} damage!`);
  }
}

// Crusader Bastion of Faith: +20% defense
if (crusaderBastionOfFaith > 0 && hero?.class?.name === 'Crusader') {
  const reduction = Math.floor(bossDamage * GAME_CONSTANTS.TACTICAL_SKILLS.Crusader.defenseBonus);
  bossDamage = Math.max(1, bossDamage - reduction);
}
        
        setPlayerFlash(true);
        sounds.playerDamage();
        setTimeout(() => setPlayerFlash(false), 200);
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
        addLog(`💥 Boss strikes! -${bossDamage} HP${enragedTurns > 0 ? ' (ENRAGED!)' : ''}`);
        
        // Taunt trigger: 25% chance after taking damage
        if (!isTauntAvailable && bossDamage > 0 && Math.random() < 0.25) {
          setIsTauntAvailable(true);
          addLog(`💬 [TAUNT AVAILABLE] - Enemy left an opening!`);
        }
        
        // Decrement enraged turns
        if (enragedTurns > 0) {
          setEnragedTurns(prev => {
            const newTurns = prev - 1;
            if (newTurns === 0) {
              addLog(`😤 Enemy is no longer ENRAGED`);
              setPlayerTaunt(''); // Clear taunt dialogue when enraged expires
              setEnemyTauntResponse('');
              setShowTauntBoxes(false);
            }
            return newTurns;
          });
        }
        
        // Decrement Crusader Holy Empowerment turns
        if (crusaderHolyEmpowerment > 0) {
          setCrusaderHolyEmpowerment(prev => {
            const newTurns = prev - 1;
            if (newTurns === 0) {
              addLog(`✙ Holy Empowerment fades...`);
            }
            return newTurns;
          });
        }
        
        // Decrement Knight Blood Oath turns
        if (knightBloodOathTurns > 0) {
          setKnightBloodOathTurns(prev => {
            const newTurns = prev - 1;
            if (newTurns === 0) {
              addLog(`⚔️ Blood Oath fades...`);
              setKnightConsecutiveUses(0); // Reset escalation
            }
            return newTurns;
          });
        }
        
        // Decrement tactical skill turns
        if (knightRallyingRoar > 0) {
          setKnightRallyingRoar(prev => {
            const newTurns = prev - 1;
            if (newTurns === 0) addLog(`⚔️ Rallying Roar fades...`);
            return newTurns;
          });
        }
        if (wizardEtherealBarrier > 0) {
          setWizardEtherealBarrier(prev => {
            const newTurns = prev - 1;
            if (newTurns === 0) addLog(`✨ Ethereal Barrier fades...`);
            return newTurns;
          });
        }
        if (assassinMarkForDeath > 0) {
          setAssassinMarkForDeath(prev => {
            const newTurns = prev - 1;
            if (newTurns === 0) addLog(`☠️ Mark for Death fades...`);
            return newTurns;
          });
        }
        if (crusaderBastionOfFaith > 0) {
          setCrusaderBastionOfFaith(prev => {
            const newTurns = prev - 1;
            if (newTurns === 0) addLog(`✙ Bastion of Faith fades...`);
            return newTurns;
          });
        }
        
        setTimeout(() => {
          if (!battling) return;
          
          if (bossDebuffs.poisonTurns > 0) {
            let poisonDmg = bossDebuffs.poisonDamage;
            
            // Assassin Mark for Death: +50% poison damage
            if (assassinMarkForDeath > 0 && hero?.class?.name === 'Assassin') {
              poisonDmg = Math.floor(poisonDmg * (1 + GAME_CONSTANTS.TACTICAL_SKILLS.Assassin.poisonBonus));
            }
            
            setBossHp(h => {
              const newHp = Math.max(0, h - poisonDmg);
              if (newHp > 0) {
                // Assassin gains stamina from poison ticks
                if (hero?.class?.name === 'Assassin') {
                  const staminaGain = GAME_CONSTANTS.SPECIAL_ATTACKS.Assassin.staminaPerTick;
                  setStamina(s => Math.min(getMaxStamina(), s + staminaGain));
                  addLog(`☠️ Poison deals ${poisonDmg} damage! +${staminaGain} stamina (${bossDebuffs.poisonTurns - 1} turns left)`);
                } else {
                  addLog(`Poison coursing through veins deals ${poisonDmg} damage! (${bossDebuffs.poisonTurns - 1} turns left)`);
                }
              } else {
                addLog(`Poison coursing through veins deals ${poisonDmg} damage!`);
                addLog(`💀 Boss succumbed to poison!`);
                
                setTimeout(() => {
                  const xpGain = isFinalBoss ? GAME_CONSTANTS.XP_REWARDS.finalBoss : GAME_CONSTANTS.XP_REWARDS.miniBoss;
                  const goldGain = isFinalBoss ? 100 : (battleType === 'elite' ? 50 : 10);
                  setXp(x => x + xpGain);
                  setGold(e => e + goldGain);
                  addLog(`Victory! The hero earned +${xpGain} XP, +${goldGain} Gold`);
                  
                  // Set victory dialogue
                  if (battleType === 'elite' || battleType === 'final') {
                    const bossDialogueKey = battleType === 'final' ? 'GAUNTLET' : `DAY_${((currentDay - 1) % 7) + 1}`;
                    const bossDialogue = GAME_CONSTANTS.BOSS_DIALOGUE[bossDialogueKey];
                    if (bossDialogue) {
                      setEnemyDialogue(bossDialogue.VICTORY_PLAYER);
                    }
                  } else {
                    const victoryQuotes = GAME_CONSTANTS.ENEMY_DIALOGUE.VICTORY_PLAYER;
                    const randomQuote = victoryQuotes[Math.floor(Math.random() * victoryQuotes.length)];
                    setEnemyDialogue(randomQuote);
                  }
                  
                  setBattling(false);
                  setBattleMode(false);
                  setRecklessStacks(0);
                  
                  if (!isFinalBoss) {
                    setHp(getMaxHp());
                    addLog('The hero is fully healed!');
                  }
                  
                  // Generate loot using reusable function
                  generateVictoryLoot(battleType, isFinalBoss, goldGain);
                }, 500);
              }
              return newHp;
            });
            setBossDebuffs(prev => ({
              ...prev,
              poisonTurns: prev.poisonTurns - 1,
              poisonedVulnerability: prev.poisonTurns > 1 ? 0.15 : 0
            }));
            
            // Reset Assassin poison stacks when poison expires
            if (bossDebuffs.poisonTurns - 1 === 0) {
              setAssassinPoisonStacks(0);
            }
          }
        }, 200);
      }, enemyDelay);
    } else {
      // Counter-attack skipped (Wizard Temporal Rift)
      setBossDebuffs(prev => ({ ...prev, stunned: false }));
    }
  };
  
  const useCrushingBlow = (enemyDelay = 1000) => {
    if (!battling || bossHp <= 0 || !hero || hero.class.name !== 'Knight') return;
    
    const skill = GAME_CONSTANTS.BASIC_SKILLS.Knight;
    
    // Check cooldown
    if (knightCrushingBlowCooldown) {
      addLog(`⚔️ Crushing Blow is recovering! Use a different attack first.`);
      return;
    }
    
    // Check stamina
    if (stamina < skill.cost) {
      addLog(`The hero needs ${skill.cost} stamina! (Have ${stamina})`);
      return;
    }
    
    // Clear other Knight cooldowns
    if (knightRallyingRoarCooldown) {
      setKnightRallyingRoarCooldown(false);
    }
    
    setStamina(s => s - skill.cost);
    setKnightCrushingBlowCooldown(true); // Set cooldown
    
    setCurrentAnimation('battle-shake');
    setTimeout(() => setCurrentAnimation(null), 250);
    
    // Get enemy defense based on battle type
    let enemyDef = GAME_CONSTANTS.ENEMY_DEFENSE.regular;
    if (battleType === 'elite') {
      enemyDef = GAME_CONSTANTS.ENEMY_DEFENSE.elite;
    } else if (battleType === 'final' || isFinalBoss) {
      enemyDef = GAME_CONSTANTS.ENEMY_DEFENSE.gauntlet;
    }
    
    // Assassin Mark for Death: Reduce enemy defense by 20%
    if (assassinMarkForDeath > 0 && hero?.class?.name === 'Assassin') {
      enemyDef = Math.floor(enemyDef * (1 - GAME_CONSTANTS.TACTICAL_SKILLS.Assassin.defenseReduction));
    }
    
    // Calculate base damage with Crushing Blow multiplier
    const rawDamage = getBaseAttack() + (weaponOilActive ? 5 : 0) + Math.floor(Math.random() * 10);
    
    // Crit system
    let critChance = GAME_CONSTANTS.CRIT_SYSTEM.baseCritChance;
    let critMultiplier = GAME_CONSTANTS.CRIT_SYSTEM.baseCritMultiplier;
    
    // Add weapon affixes to crit
    if (equippedWeapon && equippedWeapon.affixes) {
      if (equippedWeapon.affixes.critChance) {
        critChance += equippedWeapon.affixes.critChance;
      }
      if (equippedWeapon.affixes.critMultiplier) {
        critMultiplier += equippedWeapon.affixes.critMultiplier;
      }
    }
    
    const critRoll = Math.random() * 100;
    const isCrit = critRoll < critChance;
    const actualCritMultiplier = isCrit ? critMultiplier : 1.0;
    
    // Apply crit and skill multiplier
    const baseDamage = (rawDamage * actualCritMultiplier) * skill.damageMultiplier;
    let damage = Math.max(1, Math.floor(baseDamage - enemyDef));
    let finalDamage = damage;
    let bonusMessages = [];
    
    if (isCrit) {
      bonusMessages.push(`💥 CRITICAL HIT! (${actualCritMultiplier.toFixed(1)}x damage)`);
    }
    
    // Check for poison vulnerability
    if (bossDebuffs.poisonTurns > 0) {
      const poisonBonus = Math.floor(finalDamage * bossDebuffs.poisonedVulnerability);
      finalDamage += poisonBonus;
      bonusMessages.push(`☠️ +${poisonBonus} from poison vulnerability`);
    }
    
    // Apply enraged bonus
    if (enragedTurns > 0) {
      const enragedBonus = Math.floor(finalDamage * 0.2);
      finalDamage += enragedBonus;
      bonusMessages.push(`🔥 +${enragedBonus} from ENRAGED!`);
    }
    
    // Apply Knight's Blood Oath damage bonus
    if (knightBloodOathTurns > 0) {
      const bloodOathBonus = Math.floor(finalDamage * GAME_CONSTANTS.SPECIAL_ATTACKS.Knight.buffDamage);
      finalDamage += bloodOathBonus;
      bonusMessages.push(`⚔️ +${bloodOathBonus} from Blood Oath (+50%)`);
    }
    
    const newBossHp = Math.max(0, bossHp - finalDamage);
    setBossHp(newBossHp);
    
    // Build charges for special attacks
    if (chargeStacks < GAME_CONSTANTS.CHARGE_SYSTEM.maxCharges) {
      setChargeStacks(c => Math.min(c + GAME_CONSTANTS.CHARGE_SYSTEM.chargePerAttack, GAME_CONSTANTS.CHARGE_SYSTEM.maxCharges));
      if (chargeStacks + 1 === GAME_CONSTANTS.CHARGE_SYSTEM.maxCharges) {
        addLog(`⚡ SPECIAL CHARGED! (Next special deals +25% damage)`);
      }
    }
    
    addLog(`⚔️ CRUSHING BLOW! Dealt ${finalDamage} damage!`);
    bonusMessages.forEach(msg => addLog(msg));
    
    setBossFlash(true);
    setTimeout(() => setBossFlash(false), 200);
    
    if (newBossHp <= 0) {
      // Victory logic (same as regular attack)
      setTimeout(() => {
        setCurrentAnimation('battle-shake');
        setTimeout(() => setCurrentAnimation(null), 250);
      }, 100);
      
      setRecklessStacks(0);
      
      let xpGain;
      let goldGain;
      if (isFinalBoss) {
        xpGain = GAME_CONSTANTS.XP_REWARDS.finalBoss;
        goldGain = 100;
      } else if (battleType === 'elite') {
        xpGain = GAME_CONSTANTS.XP_REWARDS.miniBoss;
        goldGain = 50;
      } else if (battleType === 'wave') {
        xpGain = 15;
        goldGain = 12;
      } else {
        xpGain = 10;
        goldGain = 10;
      }
      
      setXp(x => x + xpGain);
      setGold(e => e + goldGain);
      
      if (battleType === 'wave') {
        setWaveGoldTotal(t => t + goldGain);
      }
      
      addLog(`Victory! The hero earned +${xpGain} XP, +${goldGain} Gold`);
      
      // Set victory dialogue
      if (battleType === 'elite' || battleType === 'final') {
        const bossDialogueKey = battleType === 'final' ? 'GAUNTLET' : `DAY_${((currentDay - 1) % 7) + 1}`;
        const bossDialogue = GAME_CONSTANTS.BOSS_DIALOGUE[bossDialogueKey];
        if (bossDialogue) {
          setEnemyDialogue(bossDialogue.VICTORY_PLAYER);
        }
      } else {
        const victoryQuotes = GAME_CONSTANTS.ENEMY_DIALOGUE.VICTORY_PLAYER;
        const randomQuote = victoryQuotes[Math.floor(Math.random() * victoryQuotes.length)];
        setEnemyDialogue(randomQuote);
      }
      
      if (battleType === 'elite') {
        setEliteBossDefeatedToday(true);
        addLog('Today\'s elite trial complete. Curse will be cleared at midnight.');
      }
      
      if (battleType === 'wave' && currentWaveEnemy < totalWaveEnemies) {
        const nextEnemy = currentWaveEnemy + 1;
        addLog(`Next wave enemy incoming...`);
        setTimeout(() => spawnRegularEnemy(true, nextEnemy, totalWaveEnemies), 1500);
        return;
      }
      
      if (battleType === 'wave') {
        setXp(x => x + 20);
        addLog(`The wave is vanquished! +20 bonus XP`);
      }
      
      setBattling(false);
      setBattleMode(false);
      setKnightConsecutiveUses(0);
      setRecklessStacks(0);
      
      // Generate loot using reusable function
      generateVictoryLoot(battleType, isFinalBoss, goldGain, waveGoldTotal);
      
      return;
    }
    
    // Boss counter-attack (same as regular attack)
    setTimeout(() => {
      if (!battling || hp <= 0) return;
      
      setCurrentAnimation('battle-shake');
      setTimeout(() => setCurrentAnimation(null), 250);
      
      const dayScaling = Math.floor(Math.sqrt(currentDay) * 5);
      let baseAttack = GAME_CONSTANTS.BOSS_ATTACK_BASE + dayScaling;
      
      if (battleType === 'elite') {
        const eliteDay = ((currentDay - 1) % 7) + 1;
        const baseDmg = GAME_CONSTANTS.MINI_BOSS_ATK_BASE;
        const scaling = GAME_CONSTANTS.MINI_BOSS_ATK_SCALING;
        baseAttack = Math.floor(baseDmg + (eliteDay * scaling));
      } else if (battleType === 'final' || isFinalBoss) {
        const baseDmg = GAME_CONSTANTS.BOSS_ATTACK_BASE;
        const scaling = GAME_CONSTANTS.BOSS_ATTACK_DAY_SCALING;
        baseAttack = Math.floor(baseDmg + (currentDay * scaling));
      }
      
      let bossDamage = Math.max(1, Math.floor(
        baseAttack - getBaseDefense()
      ));
      
      // Phase 2 ramping damage
      if (inPhase2 && battleType === 'final') {
        const rampBonus = Math.floor(bossDamage * (phase2DamageStacks * 0.05));
        if (rampBonus > 0) {
          bossDamage += rampBonus;
        }
        setPhase2DamageStacks(prev => prev + 1);
      }
      
      // Enraged enemies
      if (enragedTurns > 0) {
        const enragedBonus = Math.floor(bossDamage * 0.15);
        bossDamage += enragedBonus;
        
        if (Math.random() < 0.25) {
          addLog(`The enemy's wild strike misses!`);
          setEnragedTurns(prev => {
            const newTurns = prev - 1;
            if (newTurns === 0) {
              addLog(`😤 Enemy is no longer ENRAGED`);
              setPlayerTaunt('');
              setEnemyTauntResponse('');
              setShowTauntBoxes(false);
            }
            return newTurns;
          });
          if (!isTauntAvailable) {
            setIsTauntAvailable(true);
            addLog(`💬 [TAUNT AVAILABLE] - Enemy missed! Opening spotted!`);
          }
          return;
        }
      }
      
      // Knight defense modifiers
      let knightDefenseModifier = 0;
      if (knightBloodOathTurns > 0) {
        knightDefenseModifier -= GAME_CONSTANTS.SPECIAL_ATTACKS.Knight.defenseReduction;
      }
      if (knightRallyingRoar > 0) {
        knightDefenseModifier += GAME_CONSTANTS.TACTICAL_SKILLS.Knight.defenseBonus;
      }
      
      if (knightDefenseModifier !== 0) {
        if (knightDefenseModifier > 0) {
          const reduction = Math.floor(bossDamage * knightDefenseModifier);
          bossDamage = Math.max(1, bossDamage - reduction);
        } else {
          const penalty = Math.floor(bossDamage * Math.abs(knightDefenseModifier));
          bossDamage += penalty;
        }
      }
      
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
      
      addLog(`💥 Boss strikes! -${bossDamage} HP${enragedTurns > 0 ? ' (ENRAGED!)' : ''}`);
      setPlayerFlash(true);
      sounds.playerDamage();
      setTimeout(() => setPlayerFlash(false), 200);
      
      // Decrement buff turns
      if (knightBloodOathTurns > 0) {
        setKnightBloodOathTurns(prev => {
          const newTurns = prev - 1;
          if (newTurns === 0) {
            addLog(`⚔️ Blood Oath fades...`);
            setKnightConsecutiveUses(0);
          }
          return newTurns;
        });
      }
      
      if (knightRallyingRoar > 0) {
        setKnightRallyingRoar(prev => {
          const newTurns = prev - 1;
          if (newTurns === 0) addLog(`⚔️ Rallying Roar fades...`);
          return newTurns;
        });
      }
      
      if (enragedTurns > 0) {
        setEnragedTurns(prev => {
          const newTurns = prev - 1;
          if (newTurns === 0) {
            addLog(`😤 Enemy is no longer ENRAGED`);
            setPlayerTaunt('');
            setEnemyTauntResponse('');
            setShowTauntBoxes(false);
          }
          return newTurns;
        });
      }
      
    }, enemyDelay);
  };
  
  const useSmite = (enemyDelay = 1000) => {
    if (!battling || bossHp <= 0 || !hero || hero.class.name !== 'Crusader') return;
    
    const skill = GAME_CONSTANTS.BASIC_SKILLS.Crusader;
    
    // Check cooldown
    if (crusaderSmiteCooldown) {
      addLog(`✙ Smite is recovering! Use a different attack first.`);
      return;
    }
    
    // Check stamina
    if (stamina < skill.cost) {
      addLog(`The hero needs ${skill.cost} stamina! (Have ${stamina})`);
      return;
    }
    
    // Clear other Crusader cooldowns
    if (crusaderJudgmentCooldown) {
      setCrusaderJudgmentCooldown(false);
    }
    
    setStamina(s => s - skill.cost);
    setCrusaderSmiteCooldown(true);
    
    setCurrentAnimation('battle-shake');
    setTimeout(() => setCurrentAnimation(null), 250);
    
    // Get enemy defense
    let enemyDef = GAME_CONSTANTS.ENEMY_DEFENSE.regular;
    if (battleType === 'elite') {
      enemyDef = GAME_CONSTANTS.ENEMY_DEFENSE.elite;
    } else if (battleType === 'final' || isFinalBoss) {
      enemyDef = GAME_CONSTANTS.ENEMY_DEFENSE.gauntlet;
    }
    
    // Calculate damage with Smite multiplier
    const rawDamage = getBaseAttack() + (weaponOilActive ? 5 : 0) + Math.floor(Math.random() * 10);
    
    // Crit system
    let critChance = GAME_CONSTANTS.CRIT_SYSTEM.baseCritChance;
    let critMultiplier = GAME_CONSTANTS.CRIT_SYSTEM.baseCritMultiplier;
    
    // Holy Empowerment: +15% crit
    if (crusaderHolyEmpowerment > 0) {
      critChance += GAME_CONSTANTS.SPECIAL_ATTACKS.Crusader.empowermentCrit;
    }
    
    // Weapon affixes
    if (equippedWeapon && equippedWeapon.affixes) {
      if (equippedWeapon.affixes.critChance) {
        critChance += equippedWeapon.affixes.critChance;
      }
      if (equippedWeapon.affixes.critMultiplier) {
        critMultiplier += equippedWeapon.affixes.critMultiplier;
      }
    }
    
    const critRoll = Math.random() * 100;
    const isCrit = critRoll < critChance;
    const actualCritMultiplier = isCrit ? critMultiplier : 1.0;
    
    const baseDamage = (rawDamage * actualCritMultiplier) * skill.damageMultiplier;
    let damage = Math.max(1, Math.floor(baseDamage - enemyDef));
    let finalDamage = damage;
    let bonusMessages = [];
    
    if (isCrit) {
      bonusMessages.push(`💥 CRITICAL HIT! (${actualCritMultiplier.toFixed(1)}x damage)`);
    }
    
    // Apply Holy Empowerment damage bonus
    if (crusaderHolyEmpowerment > 0) {
      const empowermentBonus = Math.floor(finalDamage * GAME_CONSTANTS.SPECIAL_ATTACKS.Crusader.empowermentDamage);
      finalDamage += empowermentBonus;
      bonusMessages.push(`✙ +${empowermentBonus} from Holy Empowerment (+25%)`);
    }
    
    // Apply Bastion of Faith damage bonus
    if (crusaderBastionOfFaith > 0) {
      const bastionBonus = Math.floor(finalDamage * GAME_CONSTANTS.TACTICAL_SKILLS.Crusader.damageBonus);
      finalDamage += bastionBonus;
      bonusMessages.push(`✙ +${bastionBonus} from Bastion of Faith (+15%)`);
    }
    
    const newBossHp = Math.max(0, bossHp - finalDamage);
    setBossHp(newBossHp);
    
    // Heal from Smite
    const healAmount = skill.healAmount;
    setHp(h => Math.min(getMaxHp(), h + healAmount));
    addLog(`✙ SMITE! Dealt ${finalDamage} damage and healed ${healAmount} HP!`);
    bonusMessages.forEach(msg => addLog(msg));
    
    // Holy Empowerment: heal on hit
    if (crusaderHolyEmpowerment > 0) {
      let empowermentHeal = GAME_CONSTANTS.SPECIAL_ATTACKS.Crusader.empowermentHeal;
      
      // Bastion synergy: double the heal
      if (crusaderBastionOfFaith > 0) {
        empowermentHeal = Math.floor(empowermentHeal * GAME_CONSTANTS.TACTICAL_SKILLS.Crusader.empowermentHealBonus);
      }
      
      setHp(h => Math.min(getMaxHp(), h + empowermentHeal));
      addLog(`✙ Holy Empowerment: +${empowermentHeal} HP`);
    }
    
    setBossFlash(true);
    setTimeout(() => setBossFlash(false), 200);
    
    // Build charges
    if (chargeStacks < GAME_CONSTANTS.CHARGE_SYSTEM.maxCharges) {
      setChargeStacks(c => Math.min(c + GAME_CONSTANTS.CHARGE_SYSTEM.chargePerAttack, GAME_CONSTANTS.CHARGE_SYSTEM.maxCharges));
      if (chargeStacks + 1 === GAME_CONSTANTS.CHARGE_SYSTEM.maxCharges) {
        addLog(`⚡ SPECIAL CHARGED! (Next special deals +25% damage)`);
      }
    }
    
    if (newBossHp <= 0) {
      // Victory - simplified version
      setTimeout(() => {
        setCurrentAnimation('battle-shake');
        setTimeout(() => setCurrentAnimation(null), 250);
      }, 100);
      
      setRecklessStacks(0);
      
      let xpGain = isFinalBoss ? GAME_CONSTANTS.XP_REWARDS.finalBoss : (battleType === 'elite' ? GAME_CONSTANTS.XP_REWARDS.miniBoss : 10);
      let goldGain = isFinalBoss ? 100 : (battleType === 'elite' ? 50 : 10);
      
      setXp(x => x + xpGain);
      setGold(e => e + goldGain);
      addLog(`Victory! The hero earned +${xpGain} XP, +${goldGain} Gold`);
      
      setBattling(false);
      setBattleMode(false);
      setKnightConsecutiveUses(0);
      setKnightCrushingBlowCooldown(false);
      setCrusaderSmiteCooldown(false);
      setRecklessStacks(0);
      
      // Generate loot using reusable function
      generateVictoryLoot(battleType, isFinalBoss, goldGain);
      return;
    }
    
    // Boss counter-attack (simplified)
    setTimeout(() => {
      if (!battling || hp <= 0) return;
      
      setCurrentAnimation('battle-shake');
      setTimeout(() => setCurrentAnimation(null), 250);
      
      const dayScaling = Math.floor(Math.sqrt(currentDay) * 5);
      let baseAttack = GAME_CONSTANTS.BOSS_ATTACK_BASE + dayScaling;
      
      if (battleType === 'elite') {
        const eliteDay = ((currentDay - 1) % 7) + 1;
        baseAttack = Math.floor(GAME_CONSTANTS.MINI_BOSS_ATK_BASE + (eliteDay * GAME_CONSTANTS.MINI_BOSS_ATK_SCALING));
      } else if (battleType === 'final' || isFinalBoss) {
        baseAttack = Math.floor(GAME_CONSTANTS.BOSS_ATTACK_BASE + (currentDay * GAME_CONSTANTS.BOSS_ATTACK_DAY_SCALING));
      }
      
      let bossDamage = Math.max(1, Math.floor(baseAttack - getBaseDefense()));
      
      // Bastion of Faith: +20% defense (reduce incoming damage)
      if (crusaderBastionOfFaith > 0) {
        const reduction = Math.floor(bossDamage * GAME_CONSTANTS.TACTICAL_SKILLS.Crusader.defenseBonus);
        bossDamage = Math.max(1, bossDamage - reduction);
      }
      
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
      setPlayerFlash(true);
      sounds.playerDamage();
      setTimeout(() => setPlayerFlash(false), 200);
      
      // Decrement buff turns
      if (crusaderHolyEmpowerment > 0) {
        setCrusaderHolyEmpowerment(prev => {
          const newTurns = prev - 1;
          if (newTurns === 0) addLog(`✙ Holy Empowerment fades...`);
          return newTurns;
        });
      }
      
      if (crusaderBastionOfFaith > 0) {
        setCrusaderBastionOfFaith(prev => {
          const newTurns = prev - 1;
          if (newTurns === 0) addLog(`✙ Bastion of Faith fades...`);
          return newTurns;
        });
      }
      
    }, enemyDelay);
  };
  
  const useTacticalSkill = (enemyDelay = 1000) => {
    if (!battling || bossHp <= 0 || !hero || !hero.class) return;
    
    const skill = GAME_CONSTANTS.TACTICAL_SKILLS[hero.class.name];
    if (!skill) return;
    
    // Check cooldown
    if (hero.class.name === 'Knight' && knightRallyingRoarCooldown) {
      addLog(`⚔️ Rallying Roar is still recovering! Use an attack first.`);
      return;
    }
    if (hero.class.name === 'Wizard' && wizardEtherealBarrierCooldown) {
      addLog(`✨ Ethereal Barrier is still recovering! Use an attack first.`);
      return;
    }
    if (hero.class.name === 'Assassin' && assassinMarkForDeathCooldown) {
      addLog(`☠️ Mark for Death is still recovering! Use an attack first.`);
      return;
    }
    if (hero.class.name === 'Crusader' && crusaderBastionOfFaithCooldown) {
      addLog(`✙ Bastion of Faith is still recovering! Use an attack first.`);
      return;
    }
    
    // Check stamina
    if (stamina < skill.cost) {
      addLog(`The hero needs ${skill.cost} stamina! (Have ${stamina})`);
      return;
    }
    
    setStamina(s => s - skill.cost);
    
    // Apply class-specific effects
    if (hero.class.name === 'Knight') {
      setKnightRallyingRoar(skill.duration);
      setKnightRallyingRoarCooldown(true);
      addLog(`⚔️ RALLYING ROAR! +40% DEF, crit immunity, -30% stamina costs for ${skill.duration} turns`);
    } else if (hero.class.name === 'Wizard') {
      setWizardEtherealBarrier(skill.duration);
      setWizardEtherealBarrierCooldown(true);
      addLog(`✨ ETHEREAL BARRIER! 30% DR, 10% reflect for ${skill.duration} turns`);
    } else if (hero.class.name === 'Assassin') {
      setAssassinMarkForDeath(skill.duration);
      setAssassinMarkForDeathCooldown(true);
      
      // Synergy: Extend poison if already applied
      if (bossDebuffs.poisonTurns > 0) {
        setBossDebuffs(prev => ({
          ...prev,
          poisonTurns: prev.poisonTurns + skill.poisonExtension
        }));
        addLog(`☠️ MARK FOR DEATH! Poison extended by ${skill.poisonExtension} turns! -20% DEF, +50% poison dmg, +10% crit for ${skill.duration} turns`);
      } else {
        addLog(`☠️ MARK FOR DEATH! -20% DEF, +50% poison dmg, +10% crit for ${skill.duration} turns`);
      }
    } else if (hero.class.name === 'Crusader') {
      setCrusaderBastionOfFaith(skill.duration);
      setCrusaderBastionOfFaithCooldown(true);
      addLog(`✙ BASTION OF FAITH! +15% damage, +20% defense for ${skill.duration} turns`);
    }
    
    // CRITICAL: Trigger enemy counter-attack (tactical skill ends your turn)
    setTimeout(() => {
      if (!battling || hp <= 0) return;
      
      setCurrentAnimation('battle-shake');
      setTimeout(() => setCurrentAnimation(null), 250);
      
      // Calculate boss damage (same formula as regular attacks)
      const dayScaling = Math.floor(Math.sqrt(currentDay) * 5);
      let baseAttack = GAME_CONSTANTS.BOSS_ATTACK_BASE + dayScaling;
      
      if (battleType === 'elite') {
        const eliteDay = ((currentDay - 1) % 7) + 1;
        const baseDmg = GAME_CONSTANTS.MINI_BOSS_ATK_BASE;
        const scaling = GAME_CONSTANTS.MINI_BOSS_ATK_SCALING;
        baseAttack = Math.floor(baseDmg + (eliteDay * scaling));
      } else if (battleType === 'final' || isFinalBoss) {
        const baseDmg = GAME_CONSTANTS.BOSS_ATTACK_BASE;
        const scaling = GAME_CONSTANTS.BOSS_ATTACK_DAY_SCALING;
        baseAttack = Math.floor(baseDmg + (currentDay * scaling));
      }
      
      let bossDamage = Math.max(1, Math.floor(
        baseAttack - getBaseDefense()
      ));
      
      // Apply Knight defense modifiers (same as attack function)
      let knightDefenseModifier = 0;
      if (knightBloodOathTurns > 0 && hero?.class?.name === 'Knight') {
        knightDefenseModifier -= GAME_CONSTANTS.SPECIAL_ATTACKS.Knight.defenseReduction;
      }
      if (knightRallyingRoar > 0 && hero?.class?.name === 'Knight') {
        knightDefenseModifier += GAME_CONSTANTS.TACTICAL_SKILLS.Knight.defenseBonus;
      }
      
      if (knightDefenseModifier !== 0) {
        if (knightDefenseModifier > 0) {
          const reduction = Math.floor(bossDamage * knightDefenseModifier);
          bossDamage = Math.max(1, bossDamage - reduction);
        } else {
          const penalty = Math.floor(bossDamage * Math.abs(knightDefenseModifier));
          bossDamage += penalty;
        }
      }
      
      // Apply other defensive buffs (Wizard, Crusader, etc.)
      if (wizardEtherealBarrier > 0 && hero?.class?.name === 'Wizard') {
        const originalDamage = bossDamage;
        const reduction = Math.floor(bossDamage * GAME_CONSTANTS.TACTICAL_SKILLS.Wizard.damageReduction);
        bossDamage = Math.max(1, bossDamage - reduction);
        
        const reflectDamage = Math.floor(originalDamage * GAME_CONSTANTS.TACTICAL_SKILLS.Wizard.damageReflect);
        if (reflectDamage > 0) {
          setBossHp(h => Math.max(0, h - reflectDamage));
          addLog(`✨ Ethereal Barrier reflects ${reflectDamage} damage!`);
        }
      }
      
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
      
      addLog(`💥 Boss retaliates! -${bossDamage} HP`);
      setPlayerFlash(true);
      sounds.playerDamage();
      setTimeout(() => setPlayerFlash(false), 200);
      
      // Decrement buff turns
      if (knightBloodOathTurns > 0) {
        setKnightBloodOathTurns(prev => {
          const newTurns = prev - 1;
          if (newTurns === 0) {
            addLog(`⚔️ Blood Oath fades...`);
            setKnightConsecutiveUses(0);
          }
          return newTurns;
        });
      }
      
      if (knightRallyingRoar > 0) {
        setKnightRallyingRoar(prev => {
          const newTurns = prev - 1;
          if (newTurns === 0) addLog(`⚔️ Rallying Roar fades...`);
          return newTurns;
        });
      }
      
      if (wizardEtherealBarrier > 0) {
        setWizardEtherealBarrier(prev => {
          const newTurns = prev - 1;
          if (newTurns === 0) addLog(`✨ Ethereal Barrier fades...`);
          return newTurns;
        });
      }
      
      if (assassinMarkForDeath > 0) {
        setAssassinMarkForDeath(prev => {
          const newTurns = prev - 1;
          if (newTurns === 0) addLog(`☠️ Mark for Death fades...`);
          return newTurns;
        });
      }
      
      if (crusaderBastionOfFaith > 0) {
        setCrusaderBastionOfFaith(prev => {
          const newTurns = prev - 1;
          if (newTurns === 0) addLog(`✙ Bastion of Faith fades...`);
          return newTurns;
        });
      }
      
      if (crusaderHolyEmpowerment > 0) {
        setCrusaderSanctified(prev => {
          const newTurns = prev - 1;
          if (newTurns === 0) addLog(`✨ Sanctified fades...`);
          return newTurns;
        });
      }
      
    }, enemyDelay); // Delay counter-attack like normal
  };
  
  const flee = () => {
    if (!canFlee) return;
    
    // Check stamina requirement
    if (stamina < 25) {
      addLog('Warning: Not enough stamina to flee! (Need 25 SP)');
      return;
    }
    
    // Cost 25 stamina to flee
    setStamina(s => Math.max(0, s - 25));
    
    // Enemy mocks you for fleeing - show in enemy dialogue box
    const fleeDialogue = GAME_CONSTANTS.ENEMY_DIALOGUE.FLEE[
      Math.floor(Math.random() * GAME_CONSTANTS.ENEMY_DIALOGUE.FLEE.length)
    ];
    
    setEnemyDialogue(fleeDialogue); // Show insult in enemy dialogue box
    setVictoryLoot([]); // No loot when fleeing
    setHasFled(true); // Mark that we fled
    setBossHp(0); // Trigger victory screen
    setBattling(false);
    setBattleMode(false); // Clear battle border
    setKnightConsecutiveUses(0); // Reset HP cost escalation on combat end
    setKnightCrushingBlowCooldown(false); // Reset Crushing Blow cooldown
    setCrusaderSmiteCooldown(false); // Reset Smite cooldown
    setRecklessStacks(0);
    
    addLog(`The hero fled from ${bossName}! Lost 25 Stamina.`);
    addLog(`💬 ${bossName}: "${fleeDialogue}"`);
  };
  
  const dodge = () => {
    if (!showDodgeButton || !aoeWarning) return;
    
    setDodgeReady(true);
    setShowDodgeButton(false);
    addLog(`🛡️ You prepare to dodge the incoming AOE!`);
    addLog(`🌀 Ready to roll...`);
  };
  
  const die = () => {
    if (hp === GAME_CONSTANTS.MAX_HP && currentDay === 1 && level === 1) return;
    
    setBattling(false);
    setShowBoss(false);
    setBattleMode(false);
    setKnightConsecutiveUses(0); // Reset HP cost escalation on combat end
    setKnightCrushingBlowCooldown(false); // Reset Crushing Blow cooldown
    setCrusaderSmiteCooldown(false); // Reset Smite cooldown
    setRecklessStacks(0);
    
    // Add curse level instead of permadeath
    const newCurseLevel = curseLevel + 1;
    
    if (newCurseLevel >= 4) {
      // 4th curse level = actual permadeath
      const completedTasks = tasks.filter(t => t.done).length;
      const totalTasks = tasks.length;
      
      setGraveyard(prev => [...prev, { 
        ...hero, 
        day: currentDay, 
        lvl: level,
        xp: xp,
        tasks: completedTasks, 
        total: totalTasks,
        skipCount: skipCount
      }]);
      
      addLog('☠️ FOUR CURSES. The abyss claims your soul...');
      
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
      setCurseLevel(0);
      setEquippedWeapon(null);
      setWeaponInventory([]);
      setEquippedArmor({ helmet: null, chest: null, gloves: null, boots: null });
      setArmorInventory({ helmet: [], chest: [], gloves: [], boots: [] });
      setEquippedPendant(null);
      setPendantInventory([]);
      setEquippedRing(null);
      setRingInventory([]);
      
      setStudyStats(prev => ({
        totalMinutesToday: 0,
        totalMinutesWeek: 0,
        sessionsToday: 0,
        longestStreak: prev.longestStreak,
        currentStreak: 0,
        tasksCompletedToday: 0,
        deepWorkSessions: 0,
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
      
      setTimeout(() => setActiveTab('grave'), 1000);
    } else {
      // Add curse and respawn
      setCurseLevel(newCurseLevel);
      setHp(getMaxHp());
      setStamina(getMaxStamina());
      
      const curseNames = ['CURSED', 'DEEPLY CURSED', 'CONDEMNED'];
      addLog(`💀 You have fallen... The abyss marks you.`);
      addLog(`🌑 ${curseNames[newCurseLevel - 1]}! (Curse Level ${newCurseLevel}/3)`);
      
      if (newCurseLevel === 3) {
        addLog('⚠️ WARNING: One more death and your soul is forfeit.');
      }
    }
  };


// PART 3 OF 6 - Copy this after part 2

  const advance = () => {
    if (isFinalBoss && bossHp <= 0) {
      // Gauntlet defeated - lock until next milestone
      setGauntletUnlocked(false);
      setGauntletMilestone(m => m + 1500);
      updateAchievementStat('gauntlet_completed');
      updateAchievementStat('battles_won');
      addLog(`The Gauntlet has fallen! Next trial at ${gauntletMilestone + 1500} XP.`);
      
      // Close battle but keep all progress
      setShowBoss(false);
      setHasFled(false);
      setBattling(false);
      setBattleMode(false);
      setIsFinalBoss(false);
      
      setTimeout(() => setActiveTab('home'), 1000);
    } else if (!isFinalBoss && bossHp <= 0) {
      // Elite boss defeated - just close screen (day advances at midnight)
      updateAchievementStat('elite_bosses_defeated');
      updateAchievementStat('battles_won');
      
      // Ensure elite boss defeated flag is set (in case of React batching issues)
      if (battleType === 'elite') {
        setEliteBossDefeatedToday(true);
      }
      
      const totalTasks = tasks.length;
      const completedTasks = tasks.filter(t => t.done).length;
      if (totalTasks > 0 && completedTasks === totalTasks) {
        updateAchievementStat('perfect_days');
        setStudyStats(prev => ({ ...prev, perfectDays: prev.perfectDays + 1 }));
        setXp(x => x + GAME_CONSTANTS.PERFECT_DAY_BONUS);
        addLog(`A perfect day of dedication! +${GAME_CONSTANTS.PERFECT_DAY_BONUS} XP`);
      }
      
      // Close battle
      setShowBoss(false);
      setHasFled(false);
      setBattling(false);
      setBattleMode(false);
      
      addLog(`Elite boss has been defeated! Day continues until midnight...`);
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
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center" style={{ fontFamily: "'Cinzel', serif" }}>
      <div className="text-2xl">Loading your fate...</div>
    </div>
  );

  return (
  <div className={`min-h-screen text-white relative overflow-hidden ${currentAnimation || ''} ${
    curseLevel === 3 ? 'border-8 border-red-600 animate-pulse' : ''
  }`} style={{ fontFamily: "'Cinzel', serif", background: 'linear-gradient(to bottom, #0F0D0A, #1A1612)' }}>
      <style>{globalStyles}</style>
      
      {/* Auto-save indicator */}
      {showSavedIndicator && (
        <div className="fixed top-4 right-4 z-50 px-4 py-2 rounded-lg" style={{
          backgroundColor: 'rgba(34, 197, 94, 0.9)',
          color: '#F5F5DC',
          boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)',
          animation: 'fadeIn 0.2s ease-in'
        }}>
          <span style={{fontSize: '14px', fontWeight: 'bold'}}>✓ Saved</span>
        </div>
      )}
      
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
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700;800;900&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Pirata+One&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=IM+Fell+English+SC&display=swap');
        
        * {
          font-family: 'Cinzel', serif;
        }
        
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        @keyframes pulse-red-border {
          0%, 100% { 
            border-color: rgba(220, 38, 38, 0.6);
            box-shadow: 0 0 10px rgba(220, 38, 38, 0.3);
          }
          50% { 
            border-color: rgba(220, 38, 38, 1);
            box-shadow: 0 0 20px rgba(220, 38, 38, 0.6);
          }
        }
        @keyframes gold-glow {
          0%, 100% { 
            box-shadow: 0 0 15px rgba(234, 179, 8, 0.4);
          }
          50% { 
            box-shadow: 0 0 25px rgba(234, 179, 8, 0.7);
          }
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
        @keyframes fade-in {
          0% { opacity: 0; transform: translateY(-10px); }
          100% { opacity: 1; transform: translateY(0); }
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
        .fade-in {
          animation: fade-in 0.4s ease-out;
        }
      `}</style>



      <div className="absolute inset-0 bg-gradient-to-b from-red-950 via-black to-purple-950 opacity-60"></div>
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-black to-black opacity-80"></div>
      <div className="absolute inset-0" style={{
        backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(89, 69, 52, 0.08) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(75, 60, 45, 0.08) 0%, transparent 50%)',
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
            {/* Small decorative line above title */}
            <div className="flex items-center justify-center gap-3 mb-4">
              <div style={{width: '100px', height: '1px', background: 'linear-gradient(to right, transparent, rgba(255, 107, 107, 0.3), transparent)'}}></div>
            </div>
            
            <h1 className="text-6xl mb-2" style={{
              fontFamily: "'Cinzel', serif", 
              fontWeight: 900,
              background: 'linear-gradient(to bottom, #FF6B6B 0%, #8B0000 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textShadow: 'none',
              letterSpacing: '0.1em',
              filter: 'drop-shadow(0 0 15px rgba(255, 107, 107, 0.4)) drop-shadow(0 0 30px rgba(255, 107, 107, 0.25))'
            }}>
              CURSE OF KNOWLEDGE
            </h1>
            
            {/* Larger decorative line below title */}
            <div className="flex items-center justify-center gap-3 mb-4">
              <div style={{width: '150px', height: '1px', background: 'linear-gradient(to right, transparent, rgba(255, 107, 107, 0.3), transparent)'}}></div>
            </div>
            
            <p className="text-sm mb-6 italic text-center" style={{color: COLORS.silver}}>"Study or be consumed by the abyss..."</p>
            
          </header>
        </div>

        {/* Navigation Section - Full Width */}
        <nav className="flex gap-4 justify-center items-center mb-8 pt-6 pb-6 border-t-2 border-b-2" style={{
          marginLeft: 'calc(-50vw + 50%)',
          marginRight: 'calc(-50vw + 50%)',
          borderColor: 'rgba(212, 175, 55, 0.2)',
          background: 'linear-gradient(to bottom, rgba(40, 10, 10, 0.4), rgba(30, 0, 0, 0.4))',
          boxShadow: 'inset 0 0 30px rgba(0, 0, 0, 0.3)'
        }}>
          {[
                {id:'quest', icon:Sword, label:'Quests'},
                {id:'planner', icon:Calendar, label:'Planner'},
                {id:'study', icon:Hammer, label:'Forge'},
                {id:'legacy', icon:Skull, label:'Legacy'},
                {id:'progress', icon:Trophy, label:'Progress'},
              ].map(t => (
                <button 
                  key={t.id} 
                  onClick={() => setActiveTab(t.id)} 
                  className="flex flex-col items-center gap-2 px-8 py-3 rounded-lg transition-all border-2"
                  style={{
                    backgroundColor: activeTab === t.id ? 'rgba(184, 134, 11, 0.3)' : 'transparent',
                    borderColor: activeTab === t.id ? '#D4AF37' : 'transparent',
                    opacity: activeTab === t.id ? 1 : 0.7
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = 1;
                    if (activeTab !== t.id) e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    if (activeTab !== t.id) {
                      e.currentTarget.style.opacity = 0.7;
                      e.currentTarget.style.borderColor = 'transparent';
                    }
                  }}
                >
                  <t.icon size={24} style={{color: activeTab === t.id ? '#D4AF37' : '#F5F5DC'}}/>
                  <span 
                    className="text-xs uppercase tracking-wider"
                    style={{
                      color: activeTab === t.id ? '#D4AF37' : '#F5F5DC',
                      fontWeight: activeTab === t.id ? 'bold' : 'normal'
                    }}
                  >
                    {t.label}
                  </span>
                </button>
              ))}
        </nav>

        <div className="max-w-6xl mx-auto">
          {showDebug && (
            <div className="max-w-4xl mx-auto mb-6 rounded-xl p-6 border-2 relative" style={{
              background: 'linear-gradient(to bottom, rgba(40, 20, 10, 0.95), rgba(20, 10, 5, 0.95))',
              borderColor: 'rgba(139, 0, 0, 0.6)',
              boxShadow: '0 0 30px rgba(139, 0, 0, 0.3), inset 0 0 50px rgba(0, 0, 0, 0.5)'
            }}>
              <div className="text-center mb-6">
                <h3 className="text-3xl font-bold mb-2" style={{color: '#D4AF37', letterSpacing: '0.1em'}}>ARCANE CONSOLE</h3>
                <div className="flex items-center justify-center gap-2">
                  <div style={{width: '60px', height: '1px', background: 'linear-gradient(to right, transparent, rgba(212, 175, 55, 0.5))'}}></div>
                  <span style={{color: 'rgba(212, 175, 55, 0.6)', fontSize: '8px'}}>◆</span>
                  <div style={{width: '60px', height: '1px', background: 'linear-gradient(to left, transparent, rgba(212, 175, 55, 0.5))'}}></div>
                </div>
                <p className="text-sm italic mt-2" style={{color: '#C0C0C0'}}>"Bend reality to your will..."</p>
              </div>

              {/* Quick Stats Display */}
              <div className="bg-black bg-opacity-40 rounded-lg p-2 mb-4 border border-gray-800">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-center">
                  <div><span className="text-gray-400">Day:</span> <span className="text-white font-bold">{currentDay}</span></div>
                  <div><span className="text-gray-400">HP:</span> <span className="font-bold" style={{color: COLORS.cream}}>{hp}/{getMaxHp()}</span></div>
                  <div><span className="text-gray-400">SP:</span> <span className="text-blue-400 font-bold">{stamina}/{getMaxStamina()}</span></div>
                  <div><span className="text-gray-400">Level:</span> <span className="text-yellow-400 font-bold">{level}</span></div>
                  <div><span className="text-gray-400">XP:</span> <span className="text-yellow-400 font-bold">{xp}</span></div>
                  <div><span className="text-gray-400">Skips:</span> <span className="text-orange-400 font-bold">{skipCount}/4</span></div>
                  <div><span className="text-gray-400">Curse:</span> <span className="text-purple-400 font-bold">{curseLevel}</span></div>
                  <div><span className="text-gray-400">Class:</span> <span className="text-white font-bold">{hero.class.name}</span></div>
                </div>
              </div>
              
              {/* Resources */}
              <div className="mb-4">
                <h4 className="text-center text-sm font-bold mb-2" style={{color: '#D4AF37', letterSpacing: '0.1em'}}>RESOURCES</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <button onClick={() => { setHp(getMaxHp()); addLog('Debug: Full heal'); }} className="bg-green-800 hover:bg-green-700 px-4 py-2 rounded text-xs transition-all border border-green-600" style={{color: '#F5F5DC'}}>Full Heal</button>
                  <button onClick={() => { setStamina(getMaxStamina()); addLog('Debug: Full stamina'); }} className="bg-blue-800 hover:bg-blue-700 px-4 py-2 rounded text-xs transition-all border border-blue-600" style={{color: '#F5F5DC'}}>Full Stamina</button>
                  <button onClick={() => { setXp(x => x + 100); addLog('Debug: +100 XP'); }} className="bg-yellow-800 hover:bg-yellow-700 px-4 py-2 rounded text-xs transition-all border border-yellow-600" style={{color: '#F5F5DC'}}>+100 XP</button>
                  <button onClick={() => { setHealthPots(h => h + 3); setStaminaPots(s => s + 3); setCleansePots(c => c + 1); addLog('Debug: +Potions'); }} className="bg-purple-800 hover:bg-purple-700 px-4 py-2 rounded text-xs transition-all border border-purple-600" style={{color: '#F5F5DC'}}>+All Potions</button>
                  <button onClick={() => {
                    const rarity = rollRarity('normal');
                    const multiplier = getRarityMultiplier(rarity);
                    const slots = ['helmet', 'chest', 'gloves', 'boots'];
                    const slot = slots[Math.floor(Math.random() * slots.length)];
                    const range = GAME_CONSTANTS.ARMOR_STAT_RANGES[slot];
                    const baseDefense = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
                    const defense = Math.floor(baseDefense * multiplier);
                    const names = GAME_CONSTANTS.ARMOR_NAMES[slot][rarity];
                    const name = names[Math.floor(Math.random() * names.length)];
                    const rarityName = GAME_CONSTANTS.RARITY_TIERS[rarity].name;
                    const affixes = generateAffixes(rarity, 'armor');
                    const newArmor = { name, defense, rarity, affixes, id: Date.now() };
                    setArmorInventory(prev => ({
                      ...prev,
                      [slot]: [...prev[slot], newArmor]
                    }));
                    addLog(`Debug: Found ${rarityName} ${name} (+${defense} Defense)`);
                  }} className="bg-amber-800 hover:bg-amber-700 px-4 py-2 rounded text-xs transition-all border border-amber-600" style={{color: '#F5F5DC'}}>+Random Armor</button>
                  <button onClick={() => {
                    const rarity = rollRarity('normal');
                    const multiplier = getRarityMultiplier(rarity);
                    const range = GAME_CONSTANTS.WEAPON_STAT_RANGES;
                    const baseAttack = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
                    const attack = Math.floor(baseAttack * multiplier);
                    const names = GAME_CONSTANTS.WEAPON_NAMES[rarity];
                    const name = names[Math.floor(Math.random() * names.length)];
                    const rarityName = GAME_CONSTANTS.RARITY_TIERS[rarity].name;
                    const affixes = generateAffixes(rarity, 'weapon');
                    const newWeapon = { name, attack, rarity, affixes, id: Date.now() };
                    setWeaponInventory(prev => [...prev, newWeapon]);
                    addLog(`Debug: Found ${rarityName} ${name} (+${attack} Attack)`);
                  }} className="bg-red-800 hover:bg-red-700 px-4 py-2 rounded text-xs transition-all border border-red-600" style={{color: '#F5F5DC'}}>+Random Weapon</button>
                </div>
              </div>
              
              {/* Warning Box State Testing */}
              <div className="mb-4">
                <h4 className="text-center text-sm font-bold mb-2" style={{color: '#D4AF37', letterSpacing: '0.1em'}}>WARNING BOX STATE</h4>
                <div className="flex justify-center gap-2">
                  <button 
                    onClick={() => {
                      const states = [null, 'locked', 'unlocked', 'evening', 'finalhour'];
                      const currentIndex = states.indexOf(debugWarningState);
                      const nextIndex = (currentIndex + 1) % states.length;
                      setDebugWarningState(states[nextIndex]);
                      const stateName = states[nextIndex] || 'AUTO';
                      addLog(`Debug: Warning state → ${stateName}`);
                    }} 
                    className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded text-xs transition-all border border-gray-600" 
                    style={{color: '#F5F5DC'}}
                  >
                    Cycle: {debugWarningState ? debugWarningState.toUpperCase() : 'AUTO'}
                  </button>
                  <button 
                    onClick={() => {
                      if (debugWarningState === 'evening') {
                        setDebugWarningState('finalhour');
                        addLog('Debug: Warning state → FINALHOUR');
                      } else {
                        setDebugWarningState('evening');
                        addLog('Debug: Warning state → EVENING');
                      }
                    }} 
                    className="bg-red-800 hover:bg-red-700 px-4 py-2 rounded text-xs transition-all border border-red-600" 
                    style={{color: '#F5F5DC'}}
                  >
                    Test Urgency
                  </button>
                </div>
              </div>
              
              {/* Loot Testing */}
              <div className="mb-4">
                <h4 className="text-center text-sm font-bold mb-2" style={{color: '#D4AF37', letterSpacing: '0.1em'}}>LOOT TESTING</h4>
                
                {/* Weapons by Rarity */}
                <div className="mb-3">
                  <p className="text-xs text-center mb-2" style={{color: '#C0C0C0'}}>Spawn Weapons:</p>
                  <div className="grid grid-cols-5 gap-2">
                    {['common', 'uncommon', 'rare', 'epic', 'legendary'].map(rarity => (
                      <button key={rarity} onClick={() => {
                        const multiplier = getRarityMultiplier(rarity);
                        const range = GAME_CONSTANTS.WEAPON_STAT_RANGES;
                        const baseAttack = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
                        const attack = Math.floor(baseAttack * multiplier);
                        const names = GAME_CONSTANTS.WEAPON_NAMES[rarity];
                        const name = names[Math.floor(Math.random() * names.length)];
                        const rarityName = GAME_CONSTANTS.RARITY_TIERS[rarity].name;
                        const affixes = generateAffixes(rarity, 'weapon');
                        const newWeapon = { name, attack, rarity, affixes, id: Date.now() };
                        setWeaponInventory(prev => [...prev, newWeapon]);
                        addLog(`Debug: ${rarityName} ${name} (+${attack} Attack)`);
                      }} className="hover:brightness-110 px-2 py-2 rounded text-xs transition-all border-2" style={{
                        backgroundColor: GAME_CONSTANTS.RARITY_TIERS[rarity].color + '40',
                        borderColor: GAME_CONSTANTS.RARITY_TIERS[rarity].color,
                        color: '#F5F5DC'
                      }}>
                        {GAME_CONSTANTS.RARITY_TIERS[rarity].name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Armor by Rarity */}
                <div className="mb-3">
                  <p className="text-xs text-center mb-2" style={{color: '#C0C0C0'}}>Spawn Armor:</p>
                  <div className="grid grid-cols-5 gap-2">
                    {['common', 'uncommon', 'rare', 'epic', 'legendary'].map(rarity => (
                      <button key={rarity} onClick={() => {
                        const multiplier = getRarityMultiplier(rarity);
                        const slots = ['helmet', 'chest', 'gloves', 'boots'];
                        const slot = slots[Math.floor(Math.random() * slots.length)];
                        const range = GAME_CONSTANTS.ARMOR_STAT_RANGES[slot];
                        const baseDefense = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
                        const defense = Math.floor(baseDefense * multiplier);
                        const names = GAME_CONSTANTS.ARMOR_NAMES[slot][rarity];
                        const name = names[Math.floor(Math.random() * names.length)];
                        const rarityName = GAME_CONSTANTS.RARITY_TIERS[rarity].name;
                        const affixes = generateAffixes(rarity, 'armor');
                        const newArmor = { name, defense, rarity, affixes, id: Date.now() };
                        setArmorInventory(prev => ({
                          ...prev,
                          [slot]: [...prev[slot], newArmor]
                        }));
                        addLog(`Debug: ${rarityName} ${name} (+${defense} Defense)`);
                      }} className="hover:brightness-110 px-2 py-2 rounded text-xs transition-all border-2" style={{
                        backgroundColor: GAME_CONSTANTS.RARITY_TIERS[rarity].color + '40',
                        borderColor: GAME_CONSTANTS.RARITY_TIERS[rarity].color,
                        color: '#F5F5DC'
                      }}>
                        {GAME_CONSTANTS.RARITY_TIERS[rarity].name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Special Affix Testing */}
                <div>
                  <p className="text-xs text-center mb-2" style={{color: '#C0C0C0'}}>Special Affixes:</p>
                  <div className="grid grid-cols-3 gap-2">
                    <button onClick={() => {
                      const rarity = 'epic';
                      const multiplier = getRarityMultiplier(rarity);
                      const range = GAME_CONSTANTS.WEAPON_STAT_RANGES;
                      const baseAttack = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
                      const attack = Math.floor(baseAttack * multiplier);
                      const names = GAME_CONSTANTS.WEAPON_NAMES[rarity];
                      const name = names[Math.floor(Math.random() * names.length)];
                      // Force poison affixes
                      const affixes = {
                        poisonChance: 20,
                        poisonDamage: 8,
                        flatDamage: 10
                      };
                      const newWeapon = { name, attack, rarity, affixes, id: Date.now() };
                      setWeaponInventory(prev => [...prev, newWeapon]);
                      addLog(`Debug: Poisonous ${name} (20% poison, 8 dmg/turn)`);
                    }} className="bg-purple-800 hover:bg-purple-700 px-3 py-2 rounded text-xs transition-all border border-purple-600" style={{color: '#F5F5DC'}}>
                      Poison Weapon
                    </button>
                    <button onClick={() => {
                      const rarity = 'epic';
                      const multiplier = getRarityMultiplier(rarity);
                      const range = GAME_CONSTANTS.WEAPON_STAT_RANGES;
                      const baseAttack = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
                      const attack = Math.floor(baseAttack * multiplier);
                      const names = GAME_CONSTANTS.WEAPON_NAMES[rarity];
                      const name = names[Math.floor(Math.random() * names.length)];
                      // Force crit affixes
                      const affixes = {
                        critChance: 8,
                        critMultiplier: 0.8,
                        percentDamage: 15
                      };
                      const newWeapon = { name, attack, rarity, affixes, id: Date.now() };
                      setWeaponInventory(prev => [...prev, newWeapon]);
                      addLog(`Debug: Critical ${name} (8% crit, +0.8x mult)`);
                    }} className="bg-yellow-800 hover:bg-yellow-700 px-3 py-2 rounded text-xs transition-all border border-yellow-600" style={{color: '#F5F5DC'}}>
                      Crit Weapon
                    </button>
                    <button onClick={() => {
                      const rarity = 'epic';
                      const multiplier = getRarityMultiplier(rarity);
                      const slots = ['helmet', 'chest', 'gloves', 'boots'];
                      const slot = slots[Math.floor(Math.random() * slots.length)];
                      const range = GAME_CONSTANTS.ARMOR_STAT_RANGES[slot];
                      const baseDefense = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
                      const defense = Math.floor(baseDefense * multiplier);
                      const names = GAME_CONSTANTS.ARMOR_NAMES[slot][rarity];
                      const name = names[Math.floor(Math.random() * names.length)];
                      // Force tank affixes
                      const affixes = {
                        flatArmor: 10,
                        percentDR: 5,
                        flatHP: 20
                      };
                      const newArmor = { name, defense, rarity, affixes, id: Date.now() };
                      setArmorInventory(prev => ({
                        ...prev,
                        [slot]: [...prev[slot], newArmor]
                      }));
                      addLog(`Debug: Tank ${name} (+10 armor, +5% DR, +20 HP)`);
                    }} className="bg-blue-800 hover:bg-blue-700 px-3 py-2 rounded text-xs transition-all border border-blue-600" style={{color: '#F5F5DC'}}>
                      Tank Armor
                    </button>
                  </div>
                </div>
              </div>

              {/* Combat */}
              <div className="mb-4">
                <h4 className="text-center text-sm font-bold mb-2" style={{color: '#D4AF37', letterSpacing: '0.1em'}}>COMBAT</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  <button onClick={() => spawnRegularEnemy(false, 0, 1)} className="bg-orange-800 hover:bg-orange-700 px-4 py-2 rounded text-xs transition-all border border-orange-600" style={{color: '#F5F5DC'}}>Regular Enemy</button>
                  <button onClick={() => {
                    setBattleType('wave');
                    setTotalWaveEnemies(3);
                    setCurrentWaveEnemy(1);
                    spawnRegularEnemy(true, 1, 3);
                  }} className="bg-yellow-800 hover:bg-yellow-700 px-4 py-2 rounded text-xs transition-all border border-yellow-600" style={{color: '#F5F5DC'}}>Spawn Wave (3)</button>
                  <button onClick={() => { setBattleType('elite'); spawnRandomMiniBoss(true); }} className="bg-red-800 hover:bg-red-700 px-4 py-2 rounded text-xs transition-all border border-red-600" style={{color: '#F5F5DC'}}>Elite Boss</button>
                  <button onClick={() => {
                    setBattleType('final');
                    const bossHealth = 300;
                    const bossNameGenerated = makeBossName();
                    setBossName(bossNameGenerated);
                    setBossHp(bossHealth);
                    setBossMax(bossHealth);
                    setShowBoss(true);
                    setBattling(true);
                    setBattleMenu('main');
                    setBattleMode(true);
                    setIsFinalBoss(true);
                    setCanFlee(false);
                    setVictoryLoot([]);
                    addLog(`👹 DEBUG: ${bossNameGenerated} - THE UNDYING!`);
                  }} className="bg-purple-900 hover:bg-purple-800 px-4 py-2 rounded text-xs transition-all border border-purple-600" style={{color: '#F5F5DC'}}>Final Boss</button>
                </div>
              </div>

              {/* Day & Curse */}
              <div className="mb-4">
                <h4 className="text-center text-sm font-bold mb-2" style={{color: '#D4AF37', letterSpacing: '0.1em'}}>DAY & CURSE</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <button onClick={() => { setCurrentDay(d => d + 1); addLog(`Debug: Advanced to Day ${currentDay + 1}`); }} className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded text-xs transition-all border border-gray-600" style={{color: '#F5F5DC'}}>+1 Day</button>
                  <button onClick={() => { setCurseLevel(0); addLog('Debug: Curse cleared'); }} className="bg-green-800 hover:bg-green-700 px-4 py-2 rounded text-xs transition-all border border-green-600" style={{color: '#F5F5DC'}}>Clear Curse</button>
                  <button onClick={() => { setCurseLevel(1); addLog('Debug: Cursed'); }} className="bg-purple-800 hover:bg-purple-700 px-4 py-2 rounded text-xs transition-all border border-purple-600" style={{color: '#F5F5DC'}}>Curse Lvl 1</button>
                  <button onClick={() => { setCurseLevel(3); addLog('Debug: CONDEMNED'); }} className="bg-red-900 hover:bg-red-800 px-4 py-2 rounded text-xs transition-all border border-red-600" style={{color: '#F5F5DC'}}>Curse Lvl 3</button>
                </div>
              </div>

              {/* Tasks */}
              <div className="mb-4">
                <h4 className="text-center text-sm font-bold mb-2" style={{color: '#D4AF37', letterSpacing: '0.1em'}}>TASKS</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  <button onClick={() => { 
                    setTasks(t => [...t, { id: Date.now(), title: 'Test Task', priority: 'routine', done: false, overdue: false }]); 
                    addLog('Debug: Added test task'); 
                  }} className="bg-blue-800 hover:bg-blue-700 px-4 py-2 rounded text-xs transition-all border border-blue-600" style={{color: '#F5F5DC'}}>+Test Task</button>
                  <button onClick={() => { 
                    setTasks(t => [...t, { id: Date.now(), title: 'Important Task', priority: 'important', done: false, overdue: false }]); 
                    addLog('Debug: Added important task'); 
                  }} className="bg-yellow-800 hover:bg-yellow-700 px-4 py-2 rounded text-xs transition-all border border-yellow-600" style={{color: '#F5F5DC'}}>+Important Task</button>
                  <button onClick={() => { 
                    setTasks(t => t.map(task => ({ ...task, overdue: true }))); 
                    addLog('Debug: All tasks now overdue'); 
                  }} className="bg-red-800 hover:bg-red-700 px-4 py-2 rounded text-xs transition-all border border-red-600" style={{color: '#F5F5DC'}}>Mark All Overdue</button>
                  <button onClick={() => { 
                    setTasks(t => t.map(task => ({ ...task, done: true }))); 
                    addLog('Debug: Completed all tasks'); 
                  }} className="bg-green-800 hover:bg-green-700 px-4 py-2 rounded text-xs transition-all border border-green-600" style={{color: '#F5F5DC'}}>Complete All</button>
                  <button onClick={() => { 
                    setTasks([]); 
                    addLog('Debug: Tasks cleared'); 
                  }} className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded text-xs transition-all border border-gray-600" style={{color: '#F5F5DC'}}>Clear Tasks</button>
                </div>
              </div>

              {/* Game State Resets */}
              <div className="mb-4">
                <h4 className="text-center text-sm font-bold mb-2" style={{color: '#D4AF37', letterSpacing: '0.1em'}}>GAME STATE</h4>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => { 
                    setEliteBossDefeatedToday(false);
                    addLog('Debug: Face the Darkness reset - can fight elite boss again today'); 
                  }} className="bg-cyan-800 hover:bg-cyan-700 px-4 py-2 rounded text-xs transition-all border border-cyan-600" style={{color: '#F5F5DC'}}>Reset Face Darkness</button>
                  <button onClick={() => { 
                    setGauntletMilestone(1500);
                    setGauntletUnlocked(false);
                    addLog('Debug: Gauntlet reset - next unlock at 1500 XP'); 
                  }} className="bg-purple-800 hover:bg-purple-700 px-4 py-2 rounded text-xs transition-all border border-purple-600" style={{color: '#F5F5DC'}}>Reset Gauntlet</button>
                </div>
              </div>

              {/* Data Management */}
              <div className="mb-4">
                <h4 className="text-center text-sm font-bold mb-2" style={{color: '#D4AF37', letterSpacing: '0.1em'}}>DATA</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  <button onClick={() => { setLog([]); addLog('Debug: Chronicle cleared'); }} className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded text-xs transition-all border border-gray-600" style={{color: '#F5F5DC'}}>Clear Chronicle</button>
                  <button onClick={() => { if (window.confirm('Clear calendar?')) { setCalendarTasks({}); addLog('Debug: Calendar cleared'); } }} className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded text-xs transition-all border border-gray-600" style={{color: '#F5F5DC'}}>Clear Calendar</button>
                  <button onClick={() => { if (window.confirm('Clear planner?')) { setWeeklyPlan({ Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: [], Sunday: [] }); addLog('Debug: Planner cleared'); } }} className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded text-xs transition-all border border-gray-600" style={{color: '#F5F5DC'}}>Clear Planner</button>
                  <button onClick={() => { 
                    if (window.confirm('⚠️ Clear saved game data from browser? Will need to refresh page after.')) { 
                      localStorage.removeItem('fantasyStudyQuestSave');
                      addLog('Debug: Save data cleared from localStorage - please refresh page'); 
                    } 
                  }} className="bg-red-800 hover:bg-red-700 px-4 py-2 rounded text-xs transition-all border border-red-600" style={{color: '#F5F5DC'}}>Clear Save Data</button>
                </div>
              </div>

              {/* Full Reset */}
              <button 
                onClick={() => { 
                  if (window.confirm('⚠️ FULL RESET - Delete EVERYTHING and start fresh? Cannot be undone!')) {
                    const newHero = makeName();
                    setHero(newHero);
                    setCanCustomize(true);
                    setCurrentDay(1);
                    setHasStarted(false);
                    setHp(GAME_CONSTANTS.MAX_HP);
                    setStamina(GAME_CONSTANTS.MAX_STAMINA);
                    setXp(0);
                    setLevel(1);
                    setHealthPots(0);
                    setStaminaPots(0);
                    setCleansePots(0);
                    
                    // Reset old gear system (for compatibility)
                    setWeapon(0);
                    setArmor(0);
                    
                    // Reset new loot system
                    setGold(0);
                    setEquippedWeapon(null);
                    setWeaponInventory([]);
                    setEquippedArmor({ helmet: null, chest: null, gloves: null, boots: null });
                    setArmorInventory({ helmet: [], chest: [], gloves: [], boots: [] });
                    setEquippedPendant(null);
                    setEquippedRing(null);
                    setPendantInventory([]);
                    setRingInventory([]);
                    setWaveGoldTotal(0);
                    
                    setTasks([]);
                    setActiveTask(null);
                    setTimer(0);
                    setRunning(false);
                    setShowPomodoro(false);
                    setPomodoroTask(null);
                    setWeeklyPlan({ Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: [], Sunday: [] });
                    setCalendarTasks({});
                    setCalendarFocus({});
                    setCalendarEvents({});
                    
                    // Reset battle/boss system
                    setShowBoss(false);
                    setBattling(false);
                    setBattleMode(false);
                    setBossHp(0);
                    setBossMax(0);
                    setBattleType('regular');
                    setBattleMenu('main');
                    setIsFinalBoss(false);
                    setBossName('');
                    setBossDebuffs({ poisonTurns: 0, poisonDamage: 0, poisonedVulnerability: 0, stunned: false });
                    setRecklessStacks(0);
                    setInPhase1(false);
                    setInPhase2(false);
                    setInPhase3(false);
                    setPhase1TurnCounter(0);
                    setPhase2TurnCounter(0);
                    setPhase2DamageStacks(0);
                    setPhase3TurnCounter(0);
                    setShadowAdds([]);
                    setAoeWarning(false);
                    setBossFlash(false);
                    setPlayerFlash(false);
                    setCurrentWaveEnemy(0);
                    setTotalWaveEnemies(1);
                    
                    // Reset taunt system
                    setEnemyDialogue('');
                    setPlayerTaunt('');
                    setEnemyTauntResponse('');
                    setShowTauntBoxes(false);
                    setIsTauntAvailable(false);
                    setHasTriggeredLowHpTaunt(false);
                    setEnragedTurns(0);
                    
                    setLog([]);
                    setGraveyard([]);
                    setHeroes([]);
                    setSkipCount(0);
                    setConsecutiveDays(0);
                    setLastPlayedDate(null);
                    setMiniBossCount(0);
                    setCurseLevel(0);
                    setEliteBossDefeatedToday(false);
                    setIsDayActive(false);
                    setStudyStats({ totalMinutesToday: 0, totalMinutesWeek: 0, sessionsToday: 0, longestStreak: 0, currentStreak: 0, tasksCompletedToday: 0, deepWorkSessions: 0, perfectDays: 0, weeklyHistory: [] });
                    
                    // Reset flashcard system
                    setFlashcardDecks([]);
                    setSelectedDeck(null);
                    setCurrentCardIndex(0);
                    setStudyQueue([]);
                    setWrongCardIndices([]);
                    
                    // Reset achievements
                    setAchievementStats({
                      tasksCompleted: 0,
                      studyMinutes: 0,
                      deepWorkSessions: 0,
                      perfectDays: 0,
                      bossesDefeated: 0,
                      eliteBossesDefeated: 0,
                      battlesFled: 0,
                      battlesWon: 0,
                      cardsStudied: 0,
                      consecutiveDays: 0
                    });
                    setUnlockedAchievements([]);
                    
                    localStorage.removeItem('fantasyStudyQuest');
                    addLog('🔄 FULL RESET - Everything cleared!');
                    setActiveTab('quest');
                  }
                }}
                className="w-full bg-red-900 hover:bg-red-800 px-4 py-2 rounded text-sm font-bold transition-all border-2 border-red-600"
                style={{color: '#F5F5DC', letterSpacing: '0.1em'}}
              >
                🔄 FULL RESET
              </button>
            </div>
          )}



          <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
          >
          {activeTab === 'quest' && (
            <QuestTab
              hero={hero} hp={hp} stamina={stamina} xp={xp} level={level} gold={gold}
              currentDay={currentDay} curseLevel={curseLevel} hasStarted={hasStarted}
              isDayActive={isDayActive} timeUntilMidnight={timeUntilMidnight}
              consecutiveDays={consecutiveDays} skipCount={skipCount} miniBossCount={miniBossCount}
              gauntletUnlocked={gauntletUnlocked} gauntletMilestone={gauntletMilestone}
              eliteBossDefeatedToday={eliteBossDefeatedToday} debugWarningState={debugWarningState}
              heroCardCollapsed={heroCardCollapsed} setHeroCardCollapsed={setHeroCardCollapsed}
              canCustomize={canCustomize} setShowCustomizeModal={setShowCustomizeModal}
              equippedWeapon={equippedWeapon} equippedArmor={equippedArmor}
              equippedPendant={equippedPendant} equippedRing={equippedRing}
              weaponOilActive={weaponOilActive} armorPolishActive={armorPolishActive} luckyCharmActive={luckyCharmActive}
              getMaxHp={getMaxHp} getMaxStamina={getMaxStamina}
              getBaseAttack={getBaseAttack} getBaseDefense={getBaseDefense} getCardStyle={getCardStyle}
              tasks={tasks} setTasks={setTasks} showModal={showModal} setShowModal={setShowModal}
              newTask={newTask} setNewTask={setNewTask} activeTask={activeTask} setActiveTask={setActiveTask}
              timer={timer} setTimer={setTimer} running={running} setRunning={setRunning}
              overdueTask={overdueTask} hideCompletedTasks={hideCompletedTasks}
              setHideCompletedTasks={setHideCompletedTasks} draggedTask={draggedTask} setDraggedTask={setDraggedTask}
              complete={complete} handleDragStart={handleDragStart} handleDragEnd={handleDragEnd} handleDragOver={handleDragOver} handleDrop={handleDrop}
              setShowPomodoro={setShowPomodoro} setPomodoroTask={setPomodoroTask}
              setPomodoroTimer={setPomodoroTimer} setPomodoroRunning={setPomodoroRunning}
              setIsBreak={setIsBreak} setPomodorosCompleted={setPomodorosCompleted}
              start={start} miniBoss={miniBoss} finalBoss={finalBoss}
              setSuppliesTab={setSuppliesTab} setShowInventoryModal={setShowInventoryModal}
              setShowCraftingModal={setShowCraftingModal} setShowImportModal={setShowImportModal}
              log={log} studyStats={studyStats} addLog={addLog}
            />
          )}

          {activeTab === 'planner' && (
            <PlannerTab
              weeklyPlan={weeklyPlan} setWeeklyPlan={setWeeklyPlan}
              plannerSubTab={plannerSubTab} setPlannerSubTab={setPlannerSubTab}
              hidePlannerCompleted={hidePlannerCompleted} setHidePlannerCompleted={setHidePlannerCompleted}
              currentMonth={currentMonth} setCurrentMonth={setCurrentMonth}
              currentYear={currentYear} setCurrentYear={setCurrentYear}
              calendarTasks={calendarTasks} calendarEvents={calendarEvents} calendarFocus={calendarFocus}
              draggedPlanTask={draggedPlanTask} setDraggedPlanTask={setDraggedPlanTask}
              handlePlanDragEnd={handlePlanDragEnd} handlePlanDragOver={handlePlanDragOver}
              getNextDayOfWeek={getNextDayOfWeek}
              setSelectedDate={setSelectedDate} setSelectedDay={setSelectedDay}
              setShowCalendarModal={setShowCalendarModal} setShowPlanModal={setShowPlanModal}
              addLog={addLog}
            />
          )}
          {activeTab === 'study' && (
            <ForgeTab
              forgeSubTab={forgeSubTab} setForgeSubTab={setForgeSubTab}
              flashcardDecks={flashcardDecks} setFlashcardDecks={setFlashcardDecks}
              selectedDeck={selectedDeck} setSelectedDeck={setSelectedDeck}
              showDeckModal={showDeckModal} setShowDeckModal={setShowDeckModal}
              showCardModal={showCardModal} setShowCardModal={setShowCardModal}
              showStudyModal={showStudyModal} setShowStudyModal={setShowStudyModal}
              currentCardIndex={currentCardIndex} setCurrentCardIndex={setCurrentCardIndex}
              studyQueue={studyQueue} setStudyQueue={setStudyQueue}
              isFlipped={isFlipped} setIsFlipped={setIsFlipped}
              studyWebsites={studyWebsites}
              newWebsiteUrl={newWebsiteUrl} setNewWebsiteUrl={setNewWebsiteUrl}
              newWebsiteName={newWebsiteName} setNewWebsiteName={setNewWebsiteName}
              newWebsiteCategory={newWebsiteCategory} setNewWebsiteCategory={setNewWebsiteCategory}
              addStudyWebsite={addStudyWebsite} removeStudyWebsite={removeStudyWebsite}
              trackWebsiteClick={trackWebsiteClick}
              generateQuiz={generateQuiz} startMatchGame={startMatchGame}
              addLog={addLog}
            />
          )}
          {activeTab === 'progress' && (
            <ProgressTab
              unlockedAchievements={unlockedAchievements} achievementStats={achievementStats}
              selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory}
            />
          )}
          {activeTab === 'legacy' && (
            <LegacyTab graveyard={graveyard} heroes={heroes} />
          )}
          </motion.div>
          </AnimatePresence>
          {showInventoryModal && (
            <InventoryModal
              suppliesTab={suppliesTab} setSuppliesTab={setSuppliesTab}
              setShowInventoryModal={setShowInventoryModal}
              hp={hp} stamina={stamina} setStamina={setStamina} level={level} gold={gold} curseLevel={curseLevel}
              getMaxHp={getMaxHp} getMaxStamina={getMaxStamina}
              getBaseAttack={getBaseAttack} getBaseDefense={getBaseDefense}
              healthPots={healthPots} staminaPots={staminaPots} setStaminaPots={setStaminaPots}
              cleansePots={cleansePots}
              equippedWeapon={equippedWeapon} setEquippedWeapon={setEquippedWeapon}
              equippedArmor={equippedArmor} setEquippedArmor={setEquippedArmor}
              equippedPendant={equippedPendant} setEquippedPendant={setEquippedPendant}
              equippedRing={equippedRing} setEquippedRing={setEquippedRing}
              weaponInventory={weaponInventory} setWeaponInventory={setWeaponInventory}
              armorInventory={armorInventory} setArmorInventory={setArmorInventory}
              pendantInventory={pendantInventory} setPendantInventory={setPendantInventory}
              ringInventory={ringInventory} setRingInventory={setRingInventory}
              luckyCharmActive={luckyCharmActive}
              getRarityColor={getRarityColor} sortByRarity={sortByRarity}
              addLog={addLog} useHealth={useHealth} useCleanse={useCleanse}
            />
          )}
          {showCraftingModal && (
            <CraftingModal
              setShowCraftingModal={setShowCraftingModal}
              craftingTab={craftingTab} setCraftingTab={setCraftingTab}
              level={level} gold={gold} currentDay={currentDay}
              hp={hp} stamina={stamina} healthPots={healthPots} staminaPots={staminaPots}
              cleansePots={cleansePots}
              cleansePotionPurchasedToday={cleansePotionPurchasedToday}
              weaponOilActive={weaponOilActive} setWeaponOilActive={setWeaponOilActive}
              armorPolishActive={armorPolishActive} setArmorPolishActive={setArmorPolishActive}
              luckyCharmActive={luckyCharmActive} setLuckyCharmActive={setLuckyCharmActive}
              equippedWeapon={equippedWeapon} setEquippedWeapon={setEquippedWeapon}
              equippedArmor={equippedArmor} setEquippedArmor={setEquippedArmor}
              equippedPendant={equippedPendant} setEquippedPendant={setEquippedPendant}
              equippedRing={equippedRing} setEquippedRing={setEquippedRing}
              weaponInventory={weaponInventory} setWeaponInventory={setWeaponInventory}
              armorInventory={armorInventory} setArmorInventory={setArmorInventory}
              pendantInventory={pendantInventory} setPendantInventory={setPendantInventory}
              ringInventory={ringInventory} setRingInventory={setRingInventory}
              shopInventory={shopInventory} setShopInventory={setShopInventory}
              merchantTab={merchantTab} setMerchantTab={setMerchantTab}
              marketModifiers={marketModifiers}
              studyWebsites={studyWebsites} setStudyWebsites={setStudyWebsites}
              newWebsiteUrl={newWebsiteUrl} setNewWebsiteUrl={setNewWebsiteUrl}
              newWebsiteName={newWebsiteName} setNewWebsiteName={setNewWebsiteName}
              newWebsiteCategory={newWebsiteCategory} setNewWebsiteCategory={setNewWebsiteCategory}
              getMerchantDialogue={getMerchantDialogue}
              getPotionPrice={getPotionPrice}
              calculateSellPrice={calculateSellPrice}
              getRarityColor={getRarityColor} sortByRarity={sortByRarity}
              addLog={addLog}
              purchaseShopItem={purchaseShopItem}
              sellEquipment={sellEquipment} sellPotion={sellPotion} craftItem={craftItem}
              addStudyWebsite={addStudyWebsite} removeStudyWebsite={removeStudyWebsite}
              trackWebsiteClick={trackWebsiteClick}
            />
          )}
          {showCustomizeModal && (
            <CustomizeModal
              setShowCustomizeModal={setShowCustomizeModal}
              customName={customName} setCustomName={setCustomName}
              customClass={customClass} setCustomClass={setCustomClass}
              setHero={setHero} addLog={addLog}
            />
          )}
          <FlashcardModals
            showDeckModal={showDeckModal} setShowDeckModal={setShowDeckModal}
            showCardModal={showCardModal} setShowCardModal={setShowCardModal}
            showStudyModal={showStudyModal} setShowStudyModal={setShowStudyModal}
            showQuizModal={showQuizModal} setShowQuizModal={setShowQuizModal}
            showMatchModal={showMatchModal} setShowMatchModal={setShowMatchModal}
            flashcardDecks={flashcardDecks} setFlashcardDecks={setFlashcardDecks}
            selectedDeck={selectedDeck} setSelectedDeck={setSelectedDeck}
            newDeck={newDeck} setNewDeck={setNewDeck}
            newCard={newCard} setNewCard={setNewCard}
            currentCardIndex={currentCardIndex} setCurrentCardIndex={setCurrentCardIndex}
            studyQueue={studyQueue} setStudyQueue={setStudyQueue}
            isFlipped={isFlipped} setIsFlipped={setIsFlipped}
            quizQuestions={quizQuestions} setQuizQuestions={setQuizQuestions}
            currentQuizIndex={currentQuizIndex} setCurrentQuizIndex={setCurrentQuizIndex}
            quizScore={quizScore} setQuizScore={setQuizScore}
            selectedAnswer={selectedAnswer} setSelectedAnswer={setSelectedAnswer}
            showQuizResults={showQuizResults} setShowQuizResults={setShowQuizResults}
            wrongCardIndices={wrongCardIndices} setWrongCardIndices={setWrongCardIndices}
            isRetakeQuiz={isRetakeQuiz} setIsRetakeQuiz={setIsRetakeQuiz}
            mistakesReviewed={mistakesReviewed} setMistakesReviewed={setMistakesReviewed}
            reviewingMistakes={reviewingMistakes} setReviewingMistakes={setReviewingMistakes}
            matchCards={matchCards} setMatchCards={setMatchCards}
            selectedMatchCards={selectedMatchCards} setSelectedMatchCards={setSelectedMatchCards}
            matchedPairs={matchedPairs} setMatchedPairs={setMatchedPairs}
            matchStartTime={matchStartTime}
            matchGlowCards={matchGlowCards} setMatchGlowCards={setMatchGlowCards}
            generateQuiz={generateQuiz} addLog={addLog} updateAchievementStat={updateAchievementStat}
            gold={gold} setGold={setGold} xp={xp} setXp={setXp}
            setHealthPots={setHealthPots} setStaminaPots={setStaminaPots}
            newTask={newTask} setNewTask={setNewTask} addTask={addTask} showModal={showModal} setShowModal={setShowModal}
          />
          {showImportModal && (
            <ImportModal
              setShowImportModal={setShowImportModal}
              weeklyPlan={weeklyPlan} importFromPlanner={importFromPlanner}
              flashcardDecks={flashcardDecks} setFlashcardDecks={setFlashcardDecks}
              addLog={addLog} updateAchievementStat={updateAchievementStat}
            />
          )}
          {showPlanModal && selectedDay && (
            <PlanModal
              selectedDay={selectedDay} setShowPlanModal={setShowPlanModal}
              newPlanItem={newPlanItem} setNewPlanItem={setNewPlanItem}
              addPlanTask={addPlanTask}
            />
          )}
          {showCalendarModal && selectedDate && (
            <CalendarModal
              selectedDate={selectedDate} setShowCalendarModal={setShowCalendarModal}
              calendarTasks={calendarTasks} setCalendarTasks={setCalendarTasks}
              calendarEvents={calendarEvents} setCalendarEvents={setCalendarEvents}
              calendarFocus={calendarFocus} setCalendarFocus={setCalendarFocus}
              newCalendarTask={newCalendarTask} setNewCalendarTask={setNewCalendarTask}
              newEvent={newEvent} setNewEvent={setNewEvent}
              newFocus={newFocus} setNewFocus={setNewFocus}
              getDateKey={getDateKey} addLog={addLog}
            />
          )}
          {showBoss && (
            <BattleModal
              bossHp={bossHp} bossMax={bossMax} bossName={bossName}
              bossFlash={bossFlash} bossDebuffs={bossDebuffs} enragedTurns={enragedTurns}
              playerFlash={playerFlash}
              battleType={battleType} isFinalBoss={isFinalBoss}
              currentWaveEnemy={currentWaveEnemy} totalWaveEnemies={totalWaveEnemies} waveCount={waveCount}
              inPhase2={inPhase2} inPhase3={inPhase3}
              phase2DamageStacks={phase2DamageStacks} shadowAdds={shadowAdds}
              aoeWarning={aoeWarning} showDodgeButton={showDodgeButton}
              showTauntBoxes={showTauntBoxes} enemyDialogue={enemyDialogue} setEnemyDialogue={setEnemyDialogue}
              enemyTauntResponse={enemyTauntResponse} playerTaunt={playerTaunt}
              isTauntAvailable={isTauntAvailable}
              hp={hp} getMaxHp={getMaxHp} stamina={stamina} getMaxStamina={getMaxStamina}
              level={level} hero={hero} gold={gold}
              healthPots={healthPots} staminaPots={staminaPots} curseLevel={curseLevel}
              battling={battling} battleMenu={battleMenu} setBattleMenu={setBattleMenu}
              canFlee={canFlee} hasFled={hasFled} setHasFled={setHasFled}
              setShowBoss={setShowBoss}
              chargeStacks={chargeStacks} recklessStacks={recklessStacks}
              knightCrushingBlowCooldown={knightCrushingBlowCooldown}
              knightRallyingRoarCooldown={knightRallyingRoarCooldown}
              wizardTemporalCooldown={wizardTemporalCooldown}
              wizardEtherealBarrierCooldown={wizardEtherealBarrierCooldown}
              assassinMarkForDeathCooldown={assassinMarkForDeathCooldown}
              crusaderJudgmentCooldown={crusaderJudgmentCooldown}
              crusaderSmiteCooldown={crusaderSmiteCooldown}
              crusaderBastionOfFaithCooldown={crusaderBastionOfFaithCooldown}
              victoryLoot={victoryLoot} log={log}
              attack={attack} useCrushingBlow={useCrushingBlow}
              useSmite={useSmite} specialAttack={specialAttack}
              useTacticalSkill={useTacticalSkill} useHealth={useHealth}
              flee={flee} dodge={dodge} taunt={taunt} advance={advance} die={die}
              addLog={addLog} setStamina={setStamina} setStaminaPots={setStaminaPots}
              getRarityColor={getRarityColor}
            />
          )}
          {showPomodoro && pomodoroTask && (
            <PomodoroModal
              pomodoroTask={pomodoroTask} pomodoroTimer={pomodoroTimer}
              pomodoroRunning={pomodoroRunning} setPomodoroRunning={setPomodoroRunning}
              isBreak={isBreak} setIsBreak={setIsBreak}
              pomodorosCompleted={pomodorosCompleted} setPomodorosCompleted={setPomodorosCompleted}
              setShowPomodoro={setShowPomodoro} setPomodoroTask={setPomodoroTask}
              setPomodoroTimer={setPomodoroTimer} addLog={addLog}
            />
          )}

        </div> {/* Close max-w-6xl container */}
        
        {/* Achievement Unlock Notification */}
        {showAchievementNotification && (
          <div className="fixed top-20 right-4 z-50 animate-bounce">
            <div 
              className="rounded-lg p-4 border-2 shadow-2xl max-w-sm"
              style={{
                background: 'linear-gradient(to bottom, rgba(60, 10, 10, 0.95), rgba(40, 0, 0, 0.95))',
                borderColor: GAME_CONSTANTS.RARITY_TIERS[showAchievementNotification.rarity.toLowerCase()]?.color || '#9E9E9E',
                boxShadow: `0 0 30px ${GAME_CONSTANTS.RARITY_TIERS[showAchievementNotification.rarity.toLowerCase()]?.color || '#9E9E9E'}80`
              }}
            >
              <div className="mb-2">
                <p className="text-xs uppercase font-bold mb-1" style={{color: GAME_CONSTANTS.RARITY_TIERS[showAchievementNotification.rarity.toLowerCase()]?.color || '#9E9E9E'}}>
                  {showAchievementNotification.rarity} ACHIEVEMENT UNLOCKED
                </p>
                <h3 className="font-bold text-xl mb-1" style={{color: COLORS.gold}}>
                  {showAchievementNotification.name}
                </h3>
                <p className="text-sm mb-2" style={{color: COLORS.silver}}>
                  {showAchievementNotification.desc}
                </p>
              </div>
              <div className="text-xs font-bold" style={{color: COLORS.gold}}>
                Rewards: {showAchievementNotification.reward.xp && `+${showAchievementNotification.reward.xp} XP `}
                {showAchievementNotification.reward.maxHP && `+${showAchievementNotification.reward.maxHP} HP `}
                {showAchievementNotification.reward.maxSP && `+${showAchievementNotification.reward.maxSP} SP `}
                {showAchievementNotification.reward.weapon && `+${showAchievementNotification.reward.weapon} Weapon `}
                {showAchievementNotification.reward.armor && `+${showAchievementNotification.reward.armor} Armor `}
              </div>
            </div>
          </div>
        )}
        
        <div className="flex justify-center mt-8 pb-6">
          <button onClick={() => setShowDebug(!showDebug)} className="text-xs px-4 py-2 bg-gray-800 text-gray-400 rounded hover:bg-gray-700 transition-all border border-gray-700">{showDebug ? '▲ Hide' : '▼ Show'} Debug Panel</button>
        </div>
        
        <div className="text-center pb-4">
          <p className="text-xs text-gray-600">v4.15.1 - Forged Links + Skill Unlocks - Level-gated progression</p>
        </div>
      </div>
      )}
    </div>
  );
};

export default FantasyStudyQuest;
