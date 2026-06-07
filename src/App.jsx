// FANTASY STUDY QUEST - v4.15.1
// Refactored: App.jsx split into components

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { sounds } from './sounds';
import { audioManager, TRACKS } from './audioManager';
import { Sword, Play, Calendar, Map, BookOpen, Settings, ScrollText, LogIn, LogOut } from 'lucide-react';
import { COLORS, GAME_CONSTANTS, HERO_TITLES, globalStyles, STARTING_ABILITIES, PRIMARY_ABILITY } from './constants';
import { pickCreatureForDay, pickCreatureForZone, rollCreatureStats, CREATURE_INDEX } from './creatures';
import WorldMapTab from './components/WorldMapTab';
import QuestTab from './components/QuestTab';
import ContractsTab from './components/ContractsTab';
import PlannerTab from './components/PlannerTab';
import ForgeTab from './components/ForgeTab';
import BestiaryTab from './components/BestiaryTab';
import JournalTab from './components/JournalTab';
import InventoryModal from './components/InventoryModal';
import CraftingModal from './components/CraftingModal';
import CustomizeModal from './components/CustomizeModal';
import FlashcardModals from './components/FlashcardModals';
import ImportModal from './components/ImportModal';
import PlanModal from './components/PlanModal';
import DiceRollModal from './components/DiceRollModal';
import EncounterModal from './components/EncounterModal';
import InitiativeModal from './components/InitiativeModal';
import DeathSaveModal from './components/DeathSaveModal';
import ContractFulfilledModal from './components/ContractFulfilledModal';
import HealerModal from './components/HealerModal';
import ASIModal from './components/ASIModal';
import ChargedCritModal from './components/ChargedCritModal';
import { DAILY_ENCOUNTERS } from './data/encounters';
import { LOCATION_CONTRACTS, REWARD_LABELS } from './data/locationContracts';
import CalendarModal from './components/CalendarModal';
import BattleModal from './components/BattleModal';
import PomodoroModal from './components/PomodoroModal';
import AuthModal from './components/AuthModal';
import SetPasswordModal from './components/SetPasswordModal';
import { supabase } from './lib/supabase';
import { loadSave, writeSave } from './lib/saveManager';

const NARRATION_PAGES = [
  "Once, knowledge kept the darkness at bay.\n\nScholars, warriors, seekers of truth. They held the line together.\n\nThen, one by one, they stopped.",
  "The Abyss does not conquer.\n\nIt waits.\n\nEvery abandoned lesson, every surrendered hour gives it strength. Until the shadows learn to hunt.",
  "Old roads are no longer safe.\nShadows move with purpose.\nThings that should not exist do.\n\nThey are not the cause of the world’s suffering.\nThey are its symptom.",
  "But the chaos is not random.\n\nThere are whispers of something behind it. A force with purpose, with patience, with a plan no champion has lived long enough to understand.\n\nRumors. Nothing more.\n\nFor now.",
  "A holy order, ancient and dwindling, has sent you.\n\nNot to fight. To understand.\n\nFind the root of the chaos. Learn what no champion before you could.",
  "The flame is yours now.\n\nStudy. Endure. Push back the dark.\n\nHow long can you hold the Abyss at bay?",
];

// ─── Bandit faction data ────────────────────────────────────────────────────
const BANDIT_POOL = {
  grunts: [
    { img: '/bandits/bandit-1.png', name: 'Rook'  },
    { img: '/bandits/bandit-2.png', name: 'Slag'  },
    { img: '/bandits/bandit-3.png', name: 'Finn'  },
    { img: '/bandits/bandit-4.png', name: 'Gorse' },
    { img: '/bandits/bandit-5.png', name: 'Mace'  },
    { img: '/bandits/bandit-6.png', name: 'Dray'  },
    { img: '/bandits/bandit-7.png', name: 'Vetch' },
  ],
  captains: [
    { img: '/bandits/captain-1.png', name: 'Harrow', title: 'Blade Captain' },
    { img: '/bandits/captain-2.png', name: 'Sable',  title: 'Blade Captain' },
    { img: '/bandits/captain-3.png', name: 'Vorn',   title: 'Blade Captain' },
  ],
  leader: { img: '/bandits/leader.png', name: 'Cutter', title: 'Bandit Lord' },
};

const buildBanditLineup = (waveNumber, captainsDefeated, defeatedImgs = [], day = 1) => {
  const lineup = [];
  const waveSize = 3;
  const availableGrunts = BANDIT_POOL.grunts.filter(g => !defeatedImgs.includes(g.img));

  // 1 named grunt if alive, rest are creatures
  if (availableGrunts.length > 0) {
    const g = availableGrunts[Math.floor(Math.random() * availableGrunts.length)];
    lineup.push({ img: g.img, name: g.name, isCapt: false, isLeader: false });
  }
  const creatureSlots = waveSize - lineup.length;
  for (let i = 0; i < creatureSlots; i++) {
    const c = pickCreatureForDay(day);
    lineup.push({ img: c.img, name: c.name, isCapt: false, isLeader: false, isCreature: true });
  }
  // Shuffle so named member isn't always first
  lineup.sort(() => Math.random() - 0.5);

  // Captain at wave 5+ (if alive)
  if (waveNumber >= 5) {
    const available = BANDIT_POOL.captains.filter((c, i) => !captainsDefeated.includes(i) && !defeatedImgs.includes(c.img));
    const pick = available[Math.floor(Math.random() * available.length)];
    if (pick) lineup.push({ ...pick, isCapt: true, isLeader: false });
  }
  return lineup;
};

// ─── Daughters of Dusk faction data ─────────────────────────────────────────
const DAUGHTERS_POOL = {
  members: [
    { img: '/daughters-of-dusk/member-1.png', name: 'Vael'  },
    { img: '/daughters-of-dusk/member-2.png', name: 'Zira'  },
    { img: '/daughters-of-dusk/member-3.png', name: 'Ash'   },
    { img: '/daughters-of-dusk/member-4.png', name: 'Briar' },
    { img: '/daughters-of-dusk/member-5.png', name: 'Knell' },
  ],
  captains: [
    { img: '/daughters-of-dusk/captain-1.png', name: 'Lyra',   title: 'Dusk Captain' },
    { img: '/daughters-of-dusk/captain-2.png', name: 'Seris',  title: 'Dusk Captain' },
    { img: '/daughters-of-dusk/captain-3.png', name: 'Vayne',  title: 'Dusk Captain' },
  ],
  leader: { img: '/daughters-of-dusk/leader.png', name: 'Mira', title: 'Dusk Queen' },
};

const buildDaughtersLineup = (waveNumber, captainsDefeated, defeatedImgs = [], day = 1) => {
  const lineup = [];
  const waveSize = 3;
  const availableMembers = DAUGHTERS_POOL.members.filter(m => !defeatedImgs.includes(m.img));

  // 1 named member if alive, rest are creatures
  if (availableMembers.length > 0) {
    const m = availableMembers[Math.floor(Math.random() * availableMembers.length)];
    lineup.push({ img: m.img, name: m.name, isCapt: false, isLeader: false });
  }
  const creatureSlots = waveSize - lineup.length;
  for (let i = 0; i < creatureSlots; i++) {
    const c = pickCreatureForDay(day);
    lineup.push({ img: c.img, name: c.name, isCapt: false, isLeader: false, isCreature: true });
  }
  lineup.sort(() => Math.random() - 0.5);

  // Captain at wave 5+ (if alive)
  if (waveNumber >= 5) {
    const available = DAUGHTERS_POOL.captains.filter((c, i) => !captainsDefeated.includes(i) && !defeatedImgs.includes(c.img));
    const pick = available[Math.floor(Math.random() * available.length)];
    if (pick) lineup.push({ ...pick, isCapt: true, isLeader: false });
  }
  return lineup;
};

const FantasyStudyQuest = () => {
  const [activeTab, setActiveTab] = useState('quest');
  const [plannerSubTab, setPlannerSubTab] = useState('weekly');
  const [forgeSubTab, setForgeSubTab] = useState('flashcards'); // 'flashcards' or 'resources'
  const [introPhase, setIntroPhase] = useState('visible'); // 'visible' | 'revealed' | 'confirm' | 'narrating' | 'fading' | 'done'
  const [narrationIndex, setNarrationIndex] = useState(0);
  const [narrationActive, setNarrationActive] = useState(false); // keeps narration content visible during fade-out
  const [charCreateActive, setCharCreateActive] = useState(false);
  const [charCreateStep, setCharCreateStep] = useState(0); // 0=name, 1=class, 2=closing
  const [charCreateName, setCharCreateName] = useState('');
  const [charCreateClass, setCharCreateClass] = useState(null);
  const [charCreateGender, setCharCreateGender] = useState(null);
  const introTimers = useRef([]);
  const supabaseUserRef = useRef(null);
  const enterDyingRef = useRef(false); // guard against re-entry during death saves
  const [diceRoll, setDiceRoll] = useState(null); // { roll, bonusXP, bonusGold }
  const [currentEncounter, setCurrentEncounter] = useState(null);
  const [lastEncounterDay, setLastEncounterDay] = useState(0);
  const [dayBonuses, setDayBonuses] = useState({ xpMultiplier: 1.0 });
  const [initiativeRoll, setInitiativeRoll] = useState(null);
  const [playerStunned, setPlayerStunned] = useState(false);
  const [isDying, setIsDying] = useState(false);
  const [asiPending, setAsiPending] = useState(null); // { newLevel }
  const [chargedCritRoll, setChargedCritRoll] = useState(null); // { roll, multiplier, attackName }
  const [dayBannerOverlay, setDayBannerOverlay] = useState(null); // { day, theme }
  const [curseOverlay, setCurseOverlay] = useState(null); // { level, name, isFinal }
  const [levelUpOverlay, setLevelUpOverlay] = useState(null); // { level, className, primaryAbility, skillUnlocked }
  const [lootFanfare, setLootFanfare] = useState(null); // { rarity, name, rarityName }
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
    grimoire: 1.0,
    tome: 1.0,
    healthPotion: 1.0,
    staminaPotion: 1.0,
    cleansePotion: 1.0,
    weaponOil: 1.0,
    armorPolish: 1.0,
    luckyCharm: 1.0
  }); // Dynamic market prices (1.0 = normal, 1.5 = 50% bonus, etc.)
  const [lastMarketUpdateDay, setLastMarketUpdateDay] = useState(0); // Track last day market was updated
  const pityCounterRef = useRef(0); // Fights without a rare+ drop (pity timer)
  const pendingBattleSpawnRef = useRef(null); // Spawn deferred until D20 modal closes
  const [shopInventory, setShopInventory] = useState([]); // Current shop items
  const [daysSinceShop, setDaysSinceShop] = useState(0); // Track shop refresh
  const [gauntletMilestone, setGauntletMilestone] = useState(1500); // Next XP threshold for Gauntlet (increased from 1000)
  const [gauntletUnlocked, setGauntletUnlocked] = useState(false); // Is Gauntlet currently available
  const [timeUntilMidnight, setTimeUntilMidnight] = useState(''); // Countdown to day reset
  const [isDayActive, setIsDayActive] = useState(false); // Is current game day active (vs dormant)
  
  const [healthPots, setHealthPots] = useState(0);
  const [staminaPots, setStaminaPots] = useState(0);
  const [cleansePots, setCleansePots] = useState(0);
  const [fusionCrystals, setFusionCrystals] = useState(0);
  const [capturedMonsters, setCapturedMonsters] = useState([]);
  const [defeatedFactionMembers, setDefeatedFactionMembers] = useState([]);
  const [restedCursed, setRestedCursed] = useState([]);
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
  const [equippedGrimoire, setEquippedGrimoire] = useState(null);
  const [equippedTome, setEquippedTome] = useState(null);
  const [grimoireInventory, setGrimoireInventory] = useState([]);
  const [tomeInventory, setTomeInventory] = useState([]);
  
  const getMaxHp = useCallback(() => {
    const pendantBonus = equippedGrimoire ? equippedGrimoire.hp : 0;
    const pendantFlatHP = Math.floor(equippedGrimoire?.affixes?.flatHP || 0);

    // Add flatHP from armor affixes
    let armorHpBonus = 0;
    Object.values(equippedArmor).forEach(piece => {
      if (piece && piece.affixes && piece.affixes.flatHP) {
        armorHpBonus += piece.affixes.flatHP;
      }
    });

    const conMod = hero?.abilities ? Math.max(0, Math.floor((hero.abilities.con - 10) / 2)) : 0;
    return Math.floor(GAME_CONSTANTS.MAX_HP + pendantBonus + pendantFlatHP + armorHpBonus + conMod * 5);
  }, [equippedGrimoire, equippedArmor]);
  
  const getMaxStamina = useCallback(() => {
    const ringBonus = equippedTome ? equippedTome.stamina : 0;
    const ringFlatStamina = Math.floor(equippedTome?.affixes?.flatStamina || 0);
    return Math.floor(GAME_CONSTANTS.MAX_STAMINA + ringBonus + ringFlatStamina);
  }, [equippedTome]);
  
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
    
    const strMod = hero?.abilities ? Math.max(0, Math.floor((hero.abilities.str - 10) / 2)) : 0;
    return Math.floor(baseAttack + weaponAttack + affixBonus + strMod);
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
    const t = Math.min((currentDay - 1) / 6, 1);
    const lerp = (a, b) => a + (b - a) * t;

    // Drop rates scale with day (normal/elite); boss rates stay fixed
    const rates = enemyType === 'boss' ? {
      common: 5,
      uncommon: 15,
      rare: 35,
      epic: 30,
      legendary: 15
    } : enemyType === 'elite' ? {
      common:    lerp(30, 15),
      uncommon:  lerp(35, 30),
      rare:      lerp(25, 35),
      epic:      lerp(8,  15),
      legendary: lerp(2,  5)
    } : {
      common:    lerp(50, 35),
      uncommon:  30,
      rare:      lerp(15, 22),
      epic:      lerp(4,  9),
      legendary: lerp(1,  4)
    };

    let cumulative = 0;
    for (const [rarity, chance] of Object.entries(rates)) {
      cumulative += chance;
      if (roll < cumulative) return rarity;
    }
    return 'common';
  }, [currentDay]);

  // Wraps rollRarity with a pity guarantee: rare+ after 10 consecutive non-rare drops
  const rollRarityWithPity = useCallback((enemyType) => {
    const rarityOrder = { common: 1, uncommon: 2, rare: 3, epic: 4, legendary: 5 };
    const rarity = rollRarity(enemyType);
    if (pityCounterRef.current >= GAME_CONSTANTS.PITY_TIMER_THRESHOLD) {
      pityCounterRef.current = 0;
      return rarityOrder[rarity] >= 3 ? rarity : 'rare';
    }
    if (rarityOrder[rarity] >= 3) {
      pityCounterRef.current = 0;
    } else {
      pityCounterRef.current += 1;
    }
    return rarity;
  }, [rollRarity]);
  
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
  const [currentBattleCreature, setCurrentBattleCreature] = useState(null);
  const [selectedZone, setSelectedZone] = useState(null);
  const selectedZoneRef = useRef(null);
  const [activeContract, setActiveContract] = useState(null);
  const [completedLocationContracts, setCompletedLocationContracts] = useState([]);
  const [pendingLocationRewards, setPendingLocationRewards] = useState([]);
  const [huntingChallenges, setHuntingChallenges] = useState({}); // { locationId: timestamp }
  const [debugUnlockedZones, setDebugUnlockedZones] = useState([]);
  const contractEncounterRef = useRef(null); // tier weights for active location contract battle
  const wildCreatureOverrideRef = useRef(null); // map wild encounter: override name/img in spawnRegularEnemy
  const activeContractRef = useRef(null);
  const [battleType, setBattleType] = useState('regular');
const [waveCount, setWaveCount] = useState(0);
const [currentWaveEnemy, setCurrentWaveEnemy] = useState(0);
const [totalWaveEnemies, setTotalWaveEnemies] = useState(0);
const [waveGoldTotal, setWaveGoldTotal] = useState(0);
const [isBanditWave, setIsBanditWave] = useState(false);
const banditLineupRef = useRef([]);
const banditLineupIdxRef = useRef(0);
const [banditCaptainsDefeated, setBanditCaptainsDefeated] = useState([]);
const [banditWaveNumber, setBanditWaveNumber] = useState(0);
const [banditEnemyImg, setBanditEnemyImg] = useState('');
const [isDaughtersWave, setIsDaughtersWave] = useState(false);
const daughtersLineupRef = useRef([]);
const daughtersLineupIdxRef = useRef(0);
const [daughtersCaptainsDefeated, setDaughtersCaptainsDefeated] = useState([]);
const [daughtersWaveNumber, setDaughtersWaveNumber] = useState(0);
const [isCursedWave, setIsCursedWave] = useState(false);
const cursedLineupRef = useRef([]);
const cursedLineupIdxRef = useRef(0);
const [isEliteWave, setIsEliteWave] = useState(false);
const eliteWaveRef = useRef({ creatures: [], eliteId: null, eliteDialogue: null, creatureIdx: 0 });
const [isOrderFinal, setIsOrderFinal] = useState(false);
const orderFinalLineupRef = useRef([]);
const orderFinalIdxRef = useRef(0);
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
  const [playerDebuffs, setPlayerDebuffs] = useState({
    bleedTurns: 0,
    bleedDamage: 0,
    armorShredTurns: 0,
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
  const [finalBossPhase, setFinalBossPhase] = useState(0);
  const finalBossPhaseRef = useRef(0);
  const [lifeDrainCounter, setLifeDrainCounter] = useState(0);
  
  const [currentAnimation, setCurrentAnimation] = useState(null);
  const [battleMode, setBattleMode] = useState(false);
  const [bossFlash, setBossFlash] = useState(false);
  const [playerFlash, setPlayerFlash] = useState(false);
  const [victoryFlash, setVictoryFlash] = useState(false);
  const [victoryLoot, setVictoryLoot] = useState([]);
  const [victoryChest, setVictoryChest] = useState(null); // { rarity, img }
  const [showDebug, setShowDebug] = useState(false);
  const [canCustomize, setCanCustomize] = useState(true);
const [showCustomizeModal, setShowCustomizeModal] = useState(false);
const [customName, setCustomName] = useState('');
const [customClass, setCustomClass] = useState(null);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [showCraftingModal, setShowCraftingModal] = useState(false);
  const [showHealerModal, setShowHealerModal] = useState(false);
  const [craftingTab, setCraftingTab] = useState('craft'); // 'craft', 'manage', 'disenchant', 'links'
  const [weaponOilActive, setWeaponOilActive] = useState(false);
  const [armorPolishActive, setArmorPolishActive] = useState(false);
  const [luckyCharmActive, setLuckyCharmActive] = useState(false);
  const [enemyDialogue, setEnemyDialogue] = useState('');
  const [enragedTurns, setEnragedTurns] = useState(0);
  const [log, setLog] = useState([]);
  const [graveyard, setGraveyard] = useState([]);
  const [skipCount, setSkipCount] = useState(0);
  const [consecutiveDays, setConsecutiveDays] = useState(0);
  const [lastPlayedDate, setLastPlayedDate] = useState(null);
  const [curseLevel, setCurseLevel] = useState(0); // 0 = none, 1-3 = curse levels
const [eliteBossDefeatedToday, setEliteBossDefeatedToday] = useState(false);
const [contractFulfilled, setContractFulfilled] = useState(null); // { xpEarned, tier }
const [guildPoints, setGuildPoints] = useState(0);

const GUILD_RANKS = [
  { name: 'Initiate',  min: 0,   color: 'rgba(180,160,120,0.75)' },
  { name: 'Copper',    min: 15,  color: '#CD7F32' },
  { name: 'Silver',    min: 50,  color: '#C8C8C8' },
  { name: 'Gold',      min: 120, color: '#D4AF37' },
  { name: 'Platinum',  min: 250, color: '#E8E8E8' },
  { name: 'Mythril',   min: 500, color: '#7DF9FF' },
];
const guildRank = [...GUILD_RANKS].reverse().find(r => guildPoints >= r.min) || GUILD_RANKS[0];
const [cleansePotionPurchasedToday, setCleansePotionPurchasedToday] = useState(false);
const [lastRealDay, setLastRealDay] = useState(null);
const [debugWarningState, setDebugWarningState] = useState(null); // null = auto, or 'locked', 'unlocked', 'evening', 'finalhour'
const [godMode, setGodMode] = useState(false);
  
  // Auth state
  const [supabaseUser, setSupabaseUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSetPasswordModal, setShowSetPasswordModal] = useState(false);
  const inactivityTimerRef = useRef(null);

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

  // Keep selectedZoneRef in sync for use inside useCallback closures
  useEffect(() => { selectedZoneRef.current = selectedZone; }, [selectedZone]);
  useEffect(() => { activeContractRef.current = activeContract; }, [activeContract]);

  const collectLocationReward = (contractId) => {
    const lc = LOCATION_CONTRACTS.find(c => c.id === contractId);
    if (!lc) return;
    lc.rewards.forEach(r => {
      if (r.type === 'gold')           setGold(g => g + r.amount);
      else if (r.type === 'xp')        setXp(x => x + r.amount);
      else if (r.type === 'healthPots')    setHealthPots(p => p + r.amount);
      else if (r.type === 'staminaPots')   setStaminaPots(p => p + r.amount);
      else if (r.type === 'cleansePots')   setCleansePots(p => p + r.amount);
      else if (r.type === 'fusionCrystals') setFusionCrystals(f => f + r.amount);
    });
    const rewardText = lc.rewards.map(r => `+${r.amount} ${REWARD_LABELS[r.type]}`).join(', ');
    addLog(`Reward collected: "${lc.name}" — ${rewardText}.`);
    setCompletedLocationContracts(prev => [...prev, contractId]);
    setPendingLocationRewards(prev => prev.filter(id => id !== contractId));
  };

  // Study Links Functions
  const addStudyWebsite = useCallback(() => {
    if (!newWebsiteName.trim() || !newWebsiteUrl.trim()) {
      alert('Please enter both a name and URL');
      return;
    }
    
    // Validate URL — only allow http/https
    let url = newWebsiteUrl.trim();
    try {
      const parsed = new URL(url.includes('://') ? url : 'https://' + url);
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        alert('Only http:// and https:// URLs are allowed.');
        return;
      }
      url = parsed.href;
    } catch {
      alert('Please enter a valid URL.');
      return;
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
  
  // Daily encounter trigger
  useEffect(() => {
    if (isDayActive && hero && currentDay !== lastEncounterDay) {
      const encounter = DAILY_ENCOUNTERS[Math.floor(Math.random() * DAILY_ENCOUNTERS.length)];
      setCurrentEncounter(encounter);
      setLastEncounterDay(currentDay);
    }
  }, [isDayActive, currentDay]);

  // Backfill ability scores for existing heroes that predate this feature
  useEffect(() => {
    if (hero && !hero.abilities) {
      const defaults = STARTING_ABILITIES[hero.class?.name] || STARTING_ABILITIES.Knight;
      setHero(prev => ({ ...prev, abilities: { ...defaults } }));
    }
  }, [hero?.name, hero?.class?.name]);

  // Intro cinematic on mount
  useEffect(() => {
    const advance = () => {
      audioManager.play(TRACKS.nightVigil);
      introTimers.current.forEach(clearTimeout);
      // Already signed in — skip mode-select entirely
      setIntroPhase(supabaseUserRef.current ? 'revealed' : 'mode-select');
    };
    const onKey = (e) => { if (e.key === 'Enter') advance(); };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      introTimers.current.forEach(clearTimeout);
    };
  }, []);

    useEffect(() => {
    // Restore existing session on mount (returning user — skip mode select)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        supabaseUserRef.current = session.user;
        setSupabaseUser(session.user);
      }
    });

    // Keep session in sync across tabs / token refresh
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const user = session?.user ?? null;
      supabaseUserRef.current = user;
      setSupabaseUser(user);
      if (event === 'SIGNED_IN') {
        setIntroPhase(p => p === 'mode-select' ? 'revealed' : p);
        setShowAuthModal(false);
        const cloudData = await loadSave();
        if (cloudData) applyLoadedData(cloudData);
      }
      if (event === 'PASSWORD_RECOVERY') {
        setShowSetPasswordModal(true);
      }
      if (event === 'SIGNED_OUT') {
        setSupabaseUser(null);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  // Auto-logout after 30 minutes of inactivity
  useEffect(() => {
    if (!supabaseUser) {
      clearTimeout(inactivityTimerRef.current);
      return;
    }
    const TIMEOUT = 30 * 60 * 1000;
    const resetTimer = () => {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = setTimeout(async () => {
        await supabase.auth.signOut();
        setSupabaseUser(null);
        supabaseUserRef.current = null;
      }, TIMEOUT);
    };
    const events = ['mousemove', 'keydown', 'click', 'touchstart', 'scroll'];
    events.forEach(ev => window.addEventListener(ev, resetTimer, { passive: true }));
    resetTimer();
    return () => {
      clearTimeout(inactivityTimerRef.current);
      events.forEach(ev => window.removeEventListener(ev, resetTimer));
    };
  }, [supabaseUser]);

  function applyLoadedData(data) {
        if (data.hero) setHero(data.hero);
        if (data.currentDay) setCurrentDay(data.currentDay);
        if (data.hp !== undefined) setHp(data.hp);
        if (data.stamina !== undefined) setStamina(data.stamina);
        if (data.xp !== undefined) setXp(data.xp);
        if (data.gold !== undefined) { setGold(data.gold); } else if (data.essence !== undefined) { setGold(data.essence); }
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
        if (data.fusionCrystals !== undefined) setFusionCrystals(data.fusionCrystals);
        if (data.capturedMonsters !== undefined) setCapturedMonsters(data.capturedMonsters);
        if (data.weapon !== undefined) setWeapon(data.weapon);
        if (data.armor !== undefined) setArmor(data.armor);
        if (data.equippedWeapon) setEquippedWeapon(data.equippedWeapon);
        if (data.weaponInventory) setWeaponInventory(data.weaponInventory);
        if (data.equippedArmor) setEquippedArmor(data.equippedArmor);
        if (data.armorInventory) setArmorInventory(data.armorInventory);
        if (data.equippedGrimoire) setEquippedGrimoire(data.equippedGrimoire);
        if (data.equippedTome) setEquippedTome(data.equippedTome);
        if (data.grimoireInventory) setGrimoireInventory(data.grimoireInventory);
        if (data.tomeInventory) setTomeInventory(data.tomeInventory);
        if (data.tasks) setTasks(data.tasks);
        if (data.flashcardDecks) setFlashcardDecks(data.flashcardDecks);
        if (data.graveyard) setGraveyard(data.graveyard);
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
          const migratedEvents = {};
          Object.keys(data.calendarEvents).forEach(dateKey => {
            const eventData = data.calendarEvents[dateKey];
            if (typeof eventData === 'string') {
              migratedEvents[dateKey] = eventData ? [eventData] : [];
            } else if (Array.isArray(eventData)) {
              migratedEvents[dateKey] = eventData;
            } else {
              migratedEvents[dateKey] = [];
            }
          });
          setCalendarEvents(migratedEvents);
        }
        if (data.studyWebsites) setStudyWebsites(data.studyWebsites);
        if (data.guildPoints !== undefined) setGuildPoints(data.guildPoints);
        if (data.completedLocationContracts) setCompletedLocationContracts(data.completedLocationContracts);
        if (data.pendingLocationRewards) setPendingLocationRewards(data.pendingLocationRewards);
        if (data.huntingChallenges) setHuntingChallenges(data.huntingChallenges);
        if (data.defeatedFactionMembers) setDefeatedFactionMembers(data.defeatedFactionMembers);
        if (data.restedCursed) setRestedCursed(data.restedCursed);
        if (data.lastEncounterDay !== undefined) setLastEncounterDay(data.lastEncounterDay);
  }

    useEffect(() => {
    (async () => {
      try {
        const data = await loadSave();
        if (data) {
          applyLoadedData(data);
        } else {
          setHero(makeName());
        }
      } catch (e) {
        console.error('Failed to load save:', e);
        setHero(makeName());
      }
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }
    })();
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
          if (startingGear.grimoire) {
            setEquippedGrimoire(startingGear.grimoire);
          }
          if (startingGear.tome) {
            setEquippedTome(startingGear.tome);
          }
        }
      }
    }
  }, [hero, equippedArmor.helmet, equippedWeapon]);
  
  useEffect(() => {
    if (hero) {
     const saveData = {
  hero, currentDay, hp, stamina, xp, gold, level, healthPots, staminaPots, cleansePots, fusionCrystals, capturedMonsters,
  weapon, armor, equippedWeapon, weaponInventory, equippedArmor, armorInventory, 
  equippedGrimoire, equippedTome, grimoireInventory, tomeInventory,
  tasks, flashcardDecks, graveyard, hasStarted, skipCount, consecutiveDays,
  lastPlayedDate, curseLevel, eliteBossDefeatedToday, lastRealDay, studyStats, weeklyPlan, calendarTasks, calendarFocus, calendarEvents,
  gauntletMilestone, gauntletUnlocked,
  isDayActive, marketModifiers, lastMarketUpdateDay, shopInventory, daysSinceShop, dailyQuestCompleted,
  studyWebsites, guildPoints, completedLocationContracts, pendingLocationRewards, huntingChallenges, defeatedFactionMembers,
  restedCursed, lastEncounterDay,
};
      writeSave(saveData);
      
      // Show auto-save indicator
      setShowSavedIndicator(true);
      setTimeout(() => setShowSavedIndicator(false), 1500);
    }
 }, [hero, currentDay, hp, stamina, xp, gold, level, healthPots, staminaPots, cleansePots, fusionCrystals, capturedMonsters, weapon, armor, equippedWeapon, weaponInventory, equippedArmor, armorInventory, equippedGrimoire, equippedTome, grimoireInventory, tomeInventory, tasks, graveyard, hasStarted, skipCount, consecutiveDays, lastPlayedDate, curseLevel, eliteBossDefeatedToday, lastRealDay, studyStats, weeklyPlan, calendarTasks, calendarFocus, calendarEvents, flashcardDecks, gauntletMilestone, gauntletUnlocked, isDayActive, marketModifiers, lastMarketUpdateDay, shopInventory, daysSinceShop, dailyQuestCompleted, studyWebsites, guildPoints, completedLocationContracts, pendingLocationRewards, huntingChallenges, defeatedFactionMembers, restedCursed, lastEncounterDay]);
  
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
        setDayBonuses({ xpMultiplier: 1.0 });
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
            // If started from the map, auto-close pomodoro and spawn battle
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

  // ── Battle music / title music ────────────────────────────────────────────────
  useEffect(() => {
    if (battling) {
      const track = isFinalBoss ? TRACKS.boss : battleType === 'elite' ? TRACKS.darkling : battleType === 'wave' ? TRACKS.malicious : TRACKS.unholyKnight;
      audioManager.play(track);
    } else if (hasStarted) {
      audioManager.play(TRACKS.midnightTale);
    }
  }, [battling, battleType, isFinalBoss]);

  // Play guild music once title screen is dismissed
  useEffect(() => {
    if (introPhase === 'done' && hasStarted && !battling) {
      audioManager.play(TRACKS.midnightTale);
    }
  }, [introPhase, battling]);
  
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

      // Grow ability scores — primary auto-increments; even levels open ASI choice modal
      let primaryAbility = null;
      if (hero?.class?.name) {
        primaryAbility = PRIMARY_ABILITY[hero.class.name];
        setHero(prev => {
          const ab = { ...(prev.abilities || STARTING_ABILITIES[hero.class.name] || STARTING_ABILITIES.Knight) };
          ab[primaryAbility] = (ab[primaryAbility] || 10) + 1;
          return { ...prev, abilities: ab };
        });
        addLog(`${primaryAbility.toUpperCase()} increased!`);
        if (newLevel % 2 === 0) setAsiPending({ newLevel });
      }

      // Skill unlock notifications
      let skillUnlocked = null;
      if (newLevel === GAME_CONSTANTS.SKILL_UNLOCK_LEVELS.basicSkill && hero?.class) {
        const skillName = GAME_CONSTANTS.BASIC_SKILLS[hero.class.name]?.name;
        if (skillName) {
          skillUnlocked = { label: 'SKILL UNLOCKED', name: skillName };
          addLog(`SKILL UNLOCKED: ${skillName}!`);
        }
      } else if (newLevel === GAME_CONSTANTS.SKILL_UNLOCK_LEVELS.special && hero?.class) {
        const skillName = GAME_CONSTANTS.SPECIAL_ATTACKS[hero.class.name]?.name;
        if (skillName) {
          skillUnlocked = { label: 'SPECIAL ATTACK UNLOCKED', name: skillName };
          addLog(`SPECIAL ATTACK UNLOCKED: ${skillName}!`);
        }
      } else if (newLevel === GAME_CONSTANTS.SKILL_UNLOCK_LEVELS.tactical && hero?.class) {
        const skillName = GAME_CONSTANTS.TACTICAL_SKILLS[hero.class.name]?.name;
        if (skillName) {
          skillUnlocked = { label: 'TACTICAL SKILL UNLOCKED', name: skillName };
          addLog(`TACTICAL SKILL UNLOCKED: ${skillName}!`);
        }
      }

      // Trigger level-up cinematic
      const overlayDuration = skillUnlocked ? 3200 : 2600;
      setLevelUpOverlay({
        level: newLevel,
        className: hero?.class?.name || '',
        primaryAbility,
        skillUnlocked,
      });
      setTimeout(() => setLevelUpOverlay(null), overlayDuration);
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
  
  const applyEncounter = (encounter) => {
    const e = encounter.effect;
    if (e.type === 'xp')           setXp(x => x + e.value);
    if (e.type === 'gold')         setGold(g => g + e.value);
    if (e.type === 'hp')           setHp(h => Math.min(h + e.value, getMaxHp()));
    if (e.type === 'stamina')      setStamina(s => Math.min(s + e.value, getMaxStamina()));
    if (e.type === 'full_restore') { setHp(getMaxHp()); setStamina(getMaxStamina()); }
    if (e.type === 'xp_multiplier') setDayBonuses(prev => ({ ...prev, xpMultiplier: e.value }));
    if (e.type !== 'none') addLog(`✨ Encounter: ${encounter.title} — ${encounter.effectText}`);
    setCurrentEncounter(null);
  };

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

    const dayTheme = GAME_CONSTANTS.DAY_NAMES[currentDay]?.theme || '';
    setDayBannerOverlay({ day: currentDay, theme: dayTheme });
    setTimeout(() => setDayBannerOverlay(null), 2400);

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
    const types = ['weapon', 'armor', 'grimoire', 'tome', 'healthPotion', 'staminaPotion', 'cleansePotion', 'weaponOil', 'armorPolish', 'luckyCharm'];
    
    types.forEach(type => {
      // Random fluctuation between 0.7x and 1.3x
      const fluctuation = 0.7 + (Math.random() * 0.6);
      newModifiers[type] = Math.round(fluctuation * 100) / 100;
    });
    
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
        const range = GAME_CONSTANTS.ACCESSORY_STAT_RANGES.grimoire;
        const baseHp = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
        const hp = Math.floor(baseHp * multiplier);
        const names = GAME_CONSTANTS.ACCESSORY_NAMES.grimoire[selectedRarity];
        const name = names[Math.floor(Math.random() * names.length)];
        
        item = {
          id: `shop-${Date.now()}-${i}`,
          type: 'grimoire',
          name,
          hp,
          rarity: selectedRarity,
          affixes: generateAffixes(selectedRarity, 'grimoire')
        };
      } else {
        // Ring
        const range = GAME_CONSTANTS.ACCESSORY_STAT_RANGES.tome;
        const baseStamina = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
        const stamina = Math.floor(baseStamina * multiplier);
        const names = GAME_CONSTANTS.ACCESSORY_NAMES.tome[selectedRarity];
        const name = names[Math.floor(Math.random() * names.length)];

        item = {
          id: `shop-${Date.now()}-${i}`,
          type: 'tome',
          name,
          stamina,
          rarity: selectedRarity,
          affixes: generateAffixes(selectedRarity, 'tome')
        };
      }
      
      items.push(item);
    }
    
    setShopInventory(items);
    // Don't log here - causes circular dependency
  }, [currentDay, getRarityMultiplier, generateAffixes]);

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
    } else if (itemType === 'grimoire') {
      setGrimoireInventory(prev => prev.filter(p => p.id !== item.id));
    } else if (itemType === 'tome') {
      setTomeInventory(prev => prev.filter(r => r.id !== item.id));
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
    } else if (item.type === 'grimoire') {
      setGrimoireInventory(prev => sortByRarity([...prev, { ...item, id: Date.now() }]));
      addLog(`Purchased: ${item.name} (+${item.hp} Health) for ${finalPrice}g`);
    } else if (item.type === 'tome') {
      setTomeInventory(prev => sortByRarity([...prev, { ...item, id: Date.now() }]));
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
const intMod = hero?.abilities ? Math.max(0, Math.floor((hero.abilities.int - 10) / 2)) : 0;
let xpMultiplier = GAME_CONSTANTS.XP_MULTIPLIERS[(currentDay - 1) % 7] * priorityMultiplier * dayBonuses.xpMultiplier * (1 + intMod * 0.02);

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
    // D20 task completion roll
    const _d20 = Math.ceil(Math.random() * 20);
    let _bonusXP = 0, _bonusGold = 0;
    if (_d20 === 20)      { _bonusXP = Math.round(xpGain * 0.5);  _bonusGold = 10; }
    else if (_d20 >= 15) { _bonusXP = Math.round(xpGain * 0.20); _bonusGold = 5; }
    else if (_d20 >= 10) { _bonusXP = Math.round(xpGain * 0.10); }
    if (_bonusXP > 0)   setXp(x => x + _bonusXP);
    if (_bonusGold > 0) setGold(g => g + _bonusGold);
    const gpEarned = task.priority === 'important' ? 3 : 1;
    setGuildPoints(p => p + gpEarned);
    setDiceRoll({ roll: _d20, bonusXP: _bonusXP, bonusGold: _bonusGold, guildPointsEarned: gpEarned });
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

// Store spawn — fires when the player closes the D20 modal
pendingBattleSpawnRef.current = () => {
  const waveRoll = Math.random();
  if (waveRoll < 0.2) {
    const numEnemies = Math.floor(Math.random() * 2) + 2;
    setWaveCount(numEnemies);
    addLog(`Wave incoming! ${numEnemies} enemies detected!`);
    setTimeout(() => spawnRegularEnemy(true, 1, numEnemies), 1000);
  } else {
    spawnRegularEnemy(false, 0, 1);
  }
};
  }

}, [tasks, currentDay, addLog, consecutiveDays, skipCount, curseLevel, getMaxHp, getMaxStamina, dayBonuses, hero, rollRarity, getRarityMultiplier, generateAffixes, sortByRarity]);
  
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
        const healthPotRate = isWave ? 0.14 : 0.10; // 14% wave, 10% regular
        const staminaPotRate = isWave ? 0.35 : 0.28; // 35% wave cumulative, 28% regular cumulative
        
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
          const rarity = rollRarityWithPity('normal');
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
          const rarity = rollRarityWithPity('normal');
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
          const rarity = rollRarityWithPity('normal');
          const multiplier = getRarityMultiplier(rarity);
          
          const range = GAME_CONSTANTS.ACCESSORY_STAT_RANGES.grimoire;
          const baseHp = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
          const hp = Math.floor(baseHp * multiplier);
          
          const names = GAME_CONSTANTS.ACCESSORY_NAMES.grimoire[rarity];
          const name = names[Math.floor(Math.random() * names.length)];
          const rarityName = GAME_CONSTANTS.RARITY_TIERS[rarity].name;
          const affixes = generateAffixes(rarity, 'grimoire');
          const newGrimoire = { name, hp, rarity, affixes, id: Date.now() };
          setGrimoireInventory(prev => sortByRarity([...prev, newGrimoire]));

          lootMessages.push(`${rarityName} ${name} (+${hp} Health)`);
          addLog(`Grimoire found: ${rarityName} ${name} (+${hp} Health)`);
        } else if (lootRoll < 0.90) {
          // 10% Ring with rarity
          const rarity = rollRarityWithPity('normal');
          const multiplier = getRarityMultiplier(rarity);

          const range = GAME_CONSTANTS.ACCESSORY_STAT_RANGES.tome;
          const baseStamina = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
          const stamina = Math.floor(baseStamina * multiplier);

          const names = GAME_CONSTANTS.ACCESSORY_NAMES.tome[rarity];
          const name = names[Math.floor(Math.random() * names.length)];
          const rarityName = GAME_CONSTANTS.RARITY_TIERS[rarity].name;
          const affixes = generateAffixes(rarity, 'tome');
          const newTome = { name, stamina, rarity, affixes, id: Date.now() };
          setTomeInventory(prev => sortByRarity([...prev, newTome]));

          lootMessages.push(`${rarityName} ${name} (+${stamina} STA)`);
          addLog(`Tome found: ${rarityName} ${name} (+${stamina} STA)`);
        }
        // 10% chance of no loot
        // ~35% chance of fusion crystal from any battle
        if (Math.random() < 0.35) {
          setFusionCrystals(c => c + 1);
          addLog('A fusion crystal glimmers among the remains!');
        }
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
          const rarity = rollRarityWithPity('elite');
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
          const rarity = rollRarityWithPity('elite');
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
          const rarity = rollRarityWithPity('elite');
          const multiplier = getRarityMultiplier(rarity);
          
          const range = GAME_CONSTANTS.ACCESSORY_STAT_RANGES.grimoire;
          const baseHp = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
          const hp = Math.floor(baseHp * multiplier);
          
          const names = GAME_CONSTANTS.ACCESSORY_NAMES.grimoire[rarity];
          const name = names[Math.floor(Math.random() * names.length)];
          const rarityName = GAME_CONSTANTS.RARITY_TIERS[rarity].name;
          const affixes = generateAffixes(rarity, 'grimoire');
          const newGrimoire = { name, hp, rarity, affixes, id: Date.now() };
          setGrimoireInventory(prev => sortByRarity([...prev, newGrimoire]));

          lootMessages.push(`${rarityName} ${name} (+${hp} Health)`);
          addLog(`Grimoire found: ${rarityName} ${name} (+${hp} Health)${luckyCharmActive ? ' - blessed by fortune!' : ''}`);
        } else {
          // Generate random ring with elite rarity
          const rarity = rollRarityWithPity('elite');
          const multiplier = getRarityMultiplier(rarity);

          const range = GAME_CONSTANTS.ACCESSORY_STAT_RANGES.tome;
          const baseStamina = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
          const stamina = Math.floor(baseStamina * multiplier);

          const names = GAME_CONSTANTS.ACCESSORY_NAMES.tome[rarity];
          const name = names[Math.floor(Math.random() * names.length)];
          const rarityName = GAME_CONSTANTS.RARITY_TIERS[rarity].name;
          const affixes = generateAffixes(rarity, 'tome');
          const newTome = { name, stamina, rarity, affixes, id: Date.now() };
          setTomeInventory(prev => sortByRarity([...prev, newTome]));

          lootMessages.push(`${rarityName} ${name} (+${stamina} STA)`);
          addLog(`Tome found: ${rarityName} ${name} (+${stamina} STA)${luckyCharmActive ? ' - blessed by fortune!' : ''}`);
        }

        if (luckyCharmActive) {
          setLuckyCharmActive(false);
          addLog('The lucky charm crumbles to dust, its magic spent.');
        }
      }
    }
    
    // Determine chest rarity from best item found (before gold is added)
    const _rarityOrder = ['legendary', 'epic', 'rare', 'uncommon', 'common'];
    const _rarityRank = { common: 1, uncommon: 2, rare: 3, epic: 4, legendary: 5 };
    let chestRarity = 'common';
    for (const r of _rarityOrder) {
      const rName = GAME_CONSTANTS.RARITY_TIERS[r].name;
      if (lootMessages.some(m => m.startsWith(rName + ' '))) { chestRarity = r; break; }
    }
    // Guaranteed minimums by battle type
    if (isFinalBoss) chestRarity = 'legendary';
    else if (battleType === 'elite' && _rarityRank[chestRarity] < 3) chestRarity = 'rare';
    else if (battleType === 'wave'  && _rarityRank[chestRarity] < 2) chestRarity = 'uncommon';

    // Gold bonus scales with chest rarity
    const _goldBonus = { common: 0, uncommon: 10, rare: 25, epic: 60, legendary: 150 };
    const rarityBonus = _goldBonus[chestRarity] || 0;
    if (rarityBonus > 0) setGold(g => g + rarityBonus);

    const displayGold = (battleType === 'wave' ? waveGoldTotal : goldGain) + rarityBonus;
    lootMessages.unshift(`+${displayGold} Gold`);

    setVictoryLoot(lootMessages);
    setVictoryFlash(true);
    setTimeout(() => setVictoryFlash(false), 400);
    setVictoryChest({ rarity: chestRarity, img: `/items/CHEST-${_rarityRank[chestRarity]}.png` });
  }, [luckyCharmActive, addLog, rollRarityWithPity, getRarityMultiplier, generateAffixes, sortByRarity]);

  const handleChestOpen = useCallback((loot) => {
    for (const fr of ['legendary', 'epic', 'rare']) {
      const ft = GAME_CONSTANTS.RARITY_TIERS[fr].name;
      const fm = loot.find(m => m.startsWith(ft));
      if (fm) {
        const fi = fm.slice(ft.length + 1).split(' (+')[0];
        setLootFanfare({ rarity: fr, name: fi, rarityName: ft });
        setTimeout(() => setLootFanfare(null), fr === 'legendary' ? 2800 : fr === 'epic' ? 2400 : 2000);
        break;
      }
    }
  }, []);

const spawnRegularEnemy = useCallback((isWave = false, waveIndex = 0, totalWaves = 1) => {
  if (canCustomize) setCanCustomize(false);

  // Pick a creature — contract encounter overrides zone, zone overrides day
  const zone = contractEncounterRef.current || selectedZoneRef.current;
  const creature = zone?.tierWeights
    ? pickCreatureForZone(zone.tierWeights)
    : pickCreatureForDay(currentDay);
  const rolled = rollCreatureStats(creature);
  setCurrentBattleCreature(rolled);

  // Exponential scaling from SCALING_CONFIG, modified by creature's HP profile
  const config = GAME_CONSTANTS.SCALING_CONFIG.normal;
  const enemyHp = Math.floor(config.hpBase * Math.pow(config.hpGrowth, currentDay - 1) * rolled.rolledHpMult);

  setCurrentAnimation('screen-shake');
  setTimeout(() => setCurrentAnimation(null), 500);
  sounds.enemyEntrance();

  // Wild encounter overrides the creature's display name/img with the map popup creature
  const wildOverride = wildCreatureOverrideRef.current;
  wildCreatureOverrideRef.current = null;

  setBossName(wildOverride ? wildOverride.name : creature.name);
  setBanditEnemyImg(wildOverride ? wildOverride.img : creature.img);
  setBossHp(enemyHp);
  setBossMax(enemyHp);
  setShowBoss(true);
  setBattling(true);
  setBattleMenu('main'); // Reset to main menu
  setBattleMode(true);
  setIsFinalBoss(false);
  setCanFlee(true); // Allow fleeing from regular and wave enemies
  setBossDebuffs({ poisonTurns: 0, poisonDamage: 0, poisonedVulnerability: 0, stunned: false });
  setPlayerDebuffs({ bleedTurns: 0, bleedDamage: 0, armorShredTurns: 0 });
  setVictoryLoot([]);
    setVictoryChest(null); // Clear previous loot
  
  // Reset charges at start of each battle
  setChargeStacks(0);
  setPlayerDebuffs({ bleedTurns: 0, bleedDamage: 0, armorShredTurns: 0 });

  // Set meta dialogue for regular enemies
  const dialoguePool = isWave ? GAME_CONSTANTS.ENEMY_DIALOGUE.WAVE : GAME_CONSTANTS.ENEMY_DIALOGUE.REGULAR;
  const randomDialogue = dialoguePool[Math.floor(Math.random() * dialoguePool.length)];
  setEnemyDialogue(randomDialogue);
  
  setEnragedTurns(0);
  setHasFled(false); // Reset fled status
  
  if (isWave) {
    setBattleType('wave');
    audioManager.play(TRACKS.malicious);
    setCurrentWaveEnemy(waveIndex);
    setTotalWaveEnemies(totalWaves);
    if (waveIndex === 1) {
      setWaveGoldTotal(0); // Reset total at start of wave
    }
    addLog(`Wave assault - Enemy ${waveIndex}/${totalWaves}: ${creature.name}`);
  } else {
    setBattleType('regular');
    audioManager.play(TRACKS.unholyKnight);
    addLog(`${wildOverride ? wildOverride.name : creature.name} emerges from the shadows!`);
  }

  // Initiative — player D20+DEX vs enemy D20
  const _dexMod_init = hero?.abilities ? Math.floor((hero.abilities.dex - 10) / 2) : 0;
  const _wis_init = hero?.abilities ? Math.max(0, Math.floor((hero.abilities.wis - 10) / 2)) : 0;
  const _rawAtk_init = GAME_CONSTANTS.BOSS_ATTACK_BASE + currentDay * GAME_CONSTANTS.BOSS_ATTACK_DAY_SCALING;
  const _pRoll_init = Math.ceil(Math.random() * 20);
  const _pTotal_init = _pRoll_init + _dexMod_init;
  const _eMod_init = 0;
  const _eRoll_init = Math.ceil(Math.random() * 20);
  const _eTotal_init = _eRoll_init + _eMod_init;
  const _pFirst_init = _pTotal_init >= _eTotal_init;
  const _margin_init = Math.abs(_pTotal_init - _eTotal_init);
  const _decisive_init = _margin_init >= 5;
  const _openDmg_init = _pFirst_init ? 0 : Math.max(3, Math.floor(_rawAtk_init * (_decisive_init ? 0.65 : 0.40) * (1 - _wis_init * 0.02)));
  const _stunned_init = !_pFirst_init && _decisive_init;
  setTimeout(() => setInitiativeRoll({
    playerRoll: _pRoll_init, playerMod: _dexMod_init, playerTotal: _pTotal_init,
    enemyRoll: _eRoll_init, enemyMod: _eMod_init, enemyTotal: _eTotal_init,
    playerFirst: _pFirst_init, decisive: _decisive_init, margin: _margin_init,
    openingDamage: _openDmg_init, stunned: _stunned_init,
    openingLog: _pFirst_init ? '' : `Enemy strikes first for ${_openDmg_init} damage.${_stunned_init ? ' You are stunned.' : ''}`,
  }), 3200);
}, [currentDay, canCustomize, addLog, hero]);

  const spawnBanditEnemy = (enemy, idx, total) => {
    const config = GAME_CONSTANTS.SCALING_CONFIG.normal;
    const base = Math.floor(config.hpBase * Math.pow(config.hpGrowth, currentDay - 1));
    const enemyHp = enemy.isLeader ? Math.floor(base * 2.5)
      : enemy.isCapt ? Math.floor(base * 1.8)
      : base;

    [sounds.banditLaugh, sounds.banditLaugh2, sounds.banditLaugh3][Math.floor(Math.random() * 3)]();
    setCurrentAnimation('screen-shake');
    setTimeout(() => setCurrentAnimation(null), 500);

    setBossName(enemy.name);
    setBossHp(enemyHp);
    setBossMax(enemyHp);
    setBanditEnemyImg(enemy.img);
    setShowBoss(true);
    setBattling(true);
    setBattleMenu('main');
    setBattleMode(true);
    setIsFinalBoss(false);
    setCanFlee(true);
    setBossDebuffs({ poisonTurns: 0, poisonDamage: 0, poisonedVulnerability: 0, stunned: false });
    setPlayerDebuffs({ bleedTurns: 0, bleedDamage: 0, armorShredTurns: 0 });
    setVictoryLoot([]);
    setVictoryChest(null);
    setChargeStacks(0);
    setRecklessStacks(0);
    setEnragedTurns(0);
    setHasFled(false);
    setIsBanditWave(true);
    banditLineupIdxRef.current = idx;
    setBattleType('wave');
    setCurrentWaveEnemy(idx + 1);
    setTotalWaveEnemies(total);
    if (idx === 0) setWaveGoldTotal(0);
    audioManager.play(TRACKS.malicious);

    const label = enemy.isLeader
      ? `⚔️ BANDIT LORD: ${enemy.name} steps forward!`
      : enemy.isCapt
      ? `⚠️ Captain ${enemy.name} steps forward! (${idx + 1}/${total})`
      : `Bandit ${enemy.name} charges! (${idx + 1}/${total})`;
    addLog(label);

    setEnemyDialogue(
      enemy.contractDialogue
        ? enemy.contractDialogue
        : enemy.isLeader ? "You've made a grave mistake coming here."
        : enemy.isCapt ? "Stand down, or I'll make you regret it."
        : "Your coin or your life!"
    );

    const dexMod = hero?.abilities ? Math.floor((hero.abilities.dex - 10) / 2) : 0;
    const wisMod = hero?.abilities ? Math.max(0, Math.floor((hero.abilities.wis - 10) / 2)) : 0;
    const rawAtk = GAME_CONSTANTS.BOSS_ATTACK_BASE + currentDay * GAME_CONSTANTS.BOSS_ATTACK_DAY_SCALING;
    const pRoll = Math.ceil(Math.random() * 20);
    const pTotal = pRoll + dexMod;
    const eMod = 0;
    const eRoll = Math.ceil(Math.random() * 20);
    const eTotal = eRoll + eMod;
    const playerFirst = pTotal >= eTotal;
    const margin = Math.abs(pTotal - eTotal);
    const decisive = margin >= 5;
    const openDmg = playerFirst ? 0 : Math.max(3, Math.floor(rawAtk * (decisive ? 0.65 : 0.40) * (1 - wisMod * 0.02)));
    const stunned = !playerFirst && decisive;
    setTimeout(() => setInitiativeRoll({
      playerRoll: pRoll, playerMod: dexMod, playerTotal: pTotal,
      enemyRoll: eRoll, enemyMod: eMod, enemyTotal: eTotal,
      playerFirst, decisive, margin,
      openingDamage: openDmg, stunned,
      openingLog: playerFirst ? '' : `Enemy strikes first for ${openDmg} damage.${stunned ? ' You are stunned.' : ''}`,
    }), 3200);
  };

  const spawnBanditWave = (waveNum, captainsDefeated) => {
    const lineup = buildBanditLineup(waveNum, captainsDefeated, defeatedFactionMembers, currentDay);
    banditLineupRef.current = lineup;
    banditLineupIdxRef.current = 0;
    setBanditWaveNumber(waveNum);
    setWaveCount(wc => wc + 1);
    spawnBanditEnemy(lineup[0], 0, lineup.length);
  };

  const handleBeg = () => {
    // Reset the current wave — no xp/gold credit
    sounds.banditLaugh();
    addLog('🏃 You begged for mercy. The bandits laugh and reset their formation...');
    setIsBanditWave(false);
    setBattling(false);
    setBattleMode(false);
    setShowBoss(false);
    // Re-spawn the same wave after a short delay
    const waveNum = banditWaveNumber;
    const captDefeated = banditCaptainsDefeated;
    setTimeout(() => spawnBanditWave(waveNum, captDefeated), 1500);
  };

  const spawnDaughtersEnemy = (enemy, idx, total) => {
    const config = GAME_CONSTANTS.SCALING_CONFIG.normal;
    const base = Math.floor(config.hpBase * Math.pow(config.hpGrowth, currentDay - 1));
    const enemyHp = enemy.isLeader ? Math.floor(base * 2.8)
      : enemy.isCapt ? Math.floor(base * 2.0)
      : Math.floor(base * 1.1);

    [sounds.daughtersLaugh1, sounds.daughtersLaugh2, sounds.daughtersLaugh3][Math.floor(Math.random() * 3)]();
    setCurrentAnimation('screen-shake');
    setTimeout(() => setCurrentAnimation(null), 500);

    setBossName(enemy.name);
    setBossHp(enemyHp);
    setBossMax(enemyHp);
    setBanditEnemyImg(enemy.img);
    setShowBoss(true);
    setBattling(true);
    setBattleMenu('main');
    setBattleMode(true);
    setIsFinalBoss(false);
    setCanFlee(true);
    setBossDebuffs({ poisonTurns: 0, poisonDamage: 0, poisonedVulnerability: 0, stunned: false });
    setPlayerDebuffs({ bleedTurns: 0, bleedDamage: 0, armorShredTurns: 0 });
    setVictoryLoot([]);
    setVictoryChest(null);
    setChargeStacks(0);
    setRecklessStacks(0);
    setEnragedTurns(0);
    setHasFled(false);
    setIsBanditWave(false);
    setIsDaughtersWave(true);
    daughtersLineupIdxRef.current = idx;
    setBattleType('wave');
    setCurrentWaveEnemy(idx + 1);
    setTotalWaveEnemies(total);
    if (idx === 0) setWaveGoldTotal(0);
    audioManager.play(TRACKS.malicious);

    const label = enemy.isLeader
      ? `🌑 DUSK QUEEN: ${enemy.name} steps from the shadows!`
      : enemy.isCapt
      ? `⚠️ ${enemy.title} ${enemy.name} appears! (${idx + 1}/${total})`
      : `${enemy.name} of the Daughters of Dusk strikes! (${idx + 1}/${total})`;
    addLog(label);

    setEnemyDialogue(
      enemy.isLeader ? "You should not have come here. There is no leaving the Dusk."
      : enemy.isCapt ? "The Daughters do not forgive. They do not forget."
      : "Darkness take you."
    );

    const dexMod = hero?.abilities ? Math.floor((hero.abilities.dex - 10) / 2) : 0;
    const wisMod = hero?.abilities ? Math.max(0, Math.floor((hero.abilities.wis - 10) / 2)) : 0;
    const rawAtk = GAME_CONSTANTS.BOSS_ATTACK_BASE + currentDay * GAME_CONSTANTS.BOSS_ATTACK_DAY_SCALING;
    const pRoll = Math.ceil(Math.random() * 20);
    const pTotal = pRoll + dexMod;
    const eMod = 1;
    const eRoll = Math.ceil(Math.random() * 20);
    const eTotal = eRoll + eMod;
    const playerFirst = pTotal >= eTotal;
    const margin = Math.abs(pTotal - eTotal);
    const decisive = margin >= 5;
    const openDmg = playerFirst ? 0 : Math.max(3, Math.floor(rawAtk * (decisive ? 0.65 : 0.45) * (1 - wisMod * 0.02)));
    const stunned = !playerFirst && decisive;
    setTimeout(() => setInitiativeRoll({
      playerRoll: pRoll, playerMod: dexMod, playerTotal: pTotal,
      enemyRoll: eRoll, enemyMod: eMod, enemyTotal: eTotal,
      playerFirst, decisive, margin,
      openingDamage: openDmg, stunned,
      openingLog: playerFirst ? '' : `Enemy strikes first for ${openDmg} damage.${stunned ? ' You are stunned.' : ''}`,
    }), 3200);
  };

  const spawnDaughtersWave = (waveNum, captainsDefeated) => {
    const lineup = buildDaughtersLineup(waveNum, captainsDefeated, defeatedFactionMembers, currentDay);
    daughtersLineupRef.current = lineup;
    daughtersLineupIdxRef.current = 0;
    setDaughtersWaveNumber(waveNum);
    setWaveCount(wc => wc + 1);
    spawnDaughtersEnemy(lineup[0], 0, lineup.length);
  };

  const spawnCursedEnemy = (enemy, idx, total) => {
    const hp = enemy.hp || 100;
    enemy.gender === 'f'
      ? sounds.possessedLaugh()
      : [sounds.demonicLaugh, sounds.cursedLaugh3][Math.floor(Math.random() * 2)]();
    setCurrentAnimation('screen-shake');
    setTimeout(() => setCurrentAnimation(null), 500);
    setBossName(enemy.name);
    setBossHp(hp);
    setBossMax(hp);
    setBanditEnemyImg(enemy.img);
    setShowBoss(true);
    setBattling(true);
    setBattleMenu('main');
    setBattleMode(true);
    setIsFinalBoss(false);
    setCanFlee(true);
    setBossDebuffs({ poisonTurns: 0, poisonDamage: 0, poisonedVulnerability: 0, stunned: false });
    setPlayerDebuffs({ bleedTurns: 0, bleedDamage: 0, armorShredTurns: 0 });
    setVictoryLoot([]);
    setVictoryChest(null);
    setChargeStacks(0);
    setRecklessStacks(0);
    setEnragedTurns(0);
    setHasFled(false);
    setIsCursedWave(true);
    cursedLineupIdxRef.current = idx;
    setBattleType('wave');
    setCurrentWaveEnemy(idx + 1);
    setTotalWaveEnemies(total);
    if (idx === 0) { setWaveGoldTotal(0); audioManager.play(TRACKS.grimIdol); }
    addLog(`The Cursed ${enemy.name} stirs... (${idx + 1}/${total})`);
    setEnemyDialogue(enemy.dialogue || '...');
    const dexMod = hero?.abilities ? Math.floor((hero.abilities.dex - 10) / 2) : 0;
    const wisMod = hero?.abilities ? Math.max(0, Math.floor((hero.abilities.wis - 10) / 2)) : 0;
    const rawAtk = GAME_CONSTANTS.BOSS_ATTACK_BASE + currentDay * GAME_CONSTANTS.BOSS_ATTACK_DAY_SCALING;
    const pRoll = Math.ceil(Math.random() * 20);
    const pTotal = pRoll + dexMod;
    const eRoll = Math.ceil(Math.random() * 20);
    const eTotal = eRoll + 0;
    const playerFirst = pTotal >= eTotal;
    const margin = Math.abs(pTotal - eTotal);
    const decisive = margin >= 5;
    const openDmg = playerFirst ? 0 : Math.max(3, Math.floor(rawAtk * (decisive ? 0.65 : 0.40) * (1 - wisMod * 0.02)));
    const stunned = !playerFirst && decisive;
    setTimeout(() => setInitiativeRoll({
      playerRoll: pRoll, playerMod: dexMod, playerTotal: pTotal,
      enemyRoll: eRoll, enemyMod: 0, enemyTotal: eTotal,
      playerFirst, decisive, margin,
      openingDamage: openDmg, stunned,
      openingLog: playerFirst ? '' : `Enemy strikes first for ${openDmg} damage.${stunned ? ' You are stunned.' : ''}`,
    }), 3200);
  };

  const handleDaughtersBeg = () => {
    addLog('🏳️ You plead for mercy. The Daughters melt back into the shadows... and regroup.');
    setIsDaughtersWave(false);
    setBattling(false);
    setBattleMode(false);
    setShowBoss(false);
    const waveNum = daughtersWaveNumber;
    const captDefeated = daughtersCaptainsDefeated;
    setTimeout(() => spawnDaughtersWave(waveNum, captDefeated), 1500);
  };

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
    sounds.bossEntrance();

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
  setPlayerDebuffs({ bleedTurns: 0, bleedDamage: 0, armorShredTurns: 0 });
    setVictoryLoot([]);
    setVictoryChest(null); // Clear previous loot
    
    // Reset charges at start of each battle
    setChargeStacks(0);
    
    setEnragedTurns(0);
    setHasFled(false); // Reset fled status
    
    // Set cycling boss dialogue (day 1-7 repeating)
    const bossDialogueKey = `DAY_${((currentDay - 1) % 7) + 1}`;
    const bossDialogue = GAME_CONSTANTS.BOSS_DIALOGUE[bossDialogueKey];
    if (bossDialogue) {
      setEnemyDialogue(bossDialogue.START);
    }
    
    addLog(`AMBUSH! ${bossNameGenerated} emerges from the shadows!`);
  // Initiative — player D20+DEX vs elite D20+2
  const _dexMod_mb = hero?.abilities ? Math.floor((hero.abilities.dex - 10) / 2) : 0;
  const _wis_mb = hero?.abilities ? Math.max(0, Math.floor((hero.abilities.wis - 10) / 2)) : 0;
  const _rawAtk_mb = GAME_CONSTANTS.BOSS_ATTACK_BASE + currentDay * GAME_CONSTANTS.BOSS_ATTACK_DAY_SCALING;
  const _pRoll_mb = Math.ceil(Math.random() * 20);
  const _pTotal_mb = _pRoll_mb + _dexMod_mb;
  const _eMod_mb = 2;
  const _eRoll_mb = Math.ceil(Math.random() * 20);
  const _eTotal_mb = _eRoll_mb + _eMod_mb;
  const _mbFirst = _pTotal_mb >= _eTotal_mb;
  const _margin_mb = Math.abs(_pTotal_mb - _eTotal_mb);
  const _decisive_mb = _margin_mb >= 5;
  const _openDmg_mb = _mbFirst ? 0 : Math.max(3, Math.floor(_rawAtk_mb * (_decisive_mb ? 0.65 : 0.40) * (1 - _wis_mb * 0.02)));
  const _stunned_mb = !_mbFirst && _decisive_mb;
  setTimeout(() => setInitiativeRoll({
    playerRoll: _pRoll_mb, playerMod: _dexMod_mb, playerTotal: _pTotal_mb,
    enemyRoll: _eRoll_mb, enemyMod: _eMod_mb, enemyTotal: _eTotal_mb,
    playerFirst: _mbFirst, decisive: _decisive_mb, margin: _margin_mb,
    openingDamage: _openDmg_mb, stunned: _stunned_mb,
    openingLog: _mbFirst ? '' : `Enemy strikes first for ${_openDmg_mb} damage.${_stunned_mb ? ' You are stunned.' : ''}`,
  }), 3200);
  };
  
  const ANTAGONISTS = {
    cutter:   { name: 'Cutter',                    img: '/bandits/leader.png',             hpMult: 2.8, music: TRACKS.cutter,   sfx: () => sounds.banditLaugh(),      dialogue: '"The order didn\'t send me. I came because I wanted to."' },
    mira:     { name: 'Mira',                       img: '/daughters-of-dusk/leader.png',   hpMult: 2.8, music: TRACKS.mira,     sfx: () => sounds.daughtersLaugh1(),  dialogue: '"You spilled bandit blood. Now you face the dark."' },
    sylvaris: { name: 'Sylvaris, Queen of Ruin',    img: '/bosses/dark-elf-queen.png',      hpMult: 4.0, music: TRACKS.sylvaris, sfx: () => sounds.possessedLaugh(),   dialogue: '"Impressive. Truly. But this ends now."' },
    malachar: { name: 'Malachar, the Eternal Lich', img: '/undead-king.png',                hpMult: 5.5, music: TRACKS.malachar, sfx: () => sounds.demonicLaugh(),     dialogue: '"I have died seventeen times. I will not die tonight."' },
    the_omen: { name: 'The Omen',                   img: '/main bad.png',                   hpMult: 8.0, music: TRACKS.malachar, sfx: () => sounds.demonicLaugh(),     dialogue: '...' },
  };

  const spawnAntagonist = (antagonistId) => {
    const a = ANTAGONISTS[antagonistId];
    if (!a) return;
    const completedTasks = tasks.filter(t => t.done).length;
    const totalTasks = tasks.length;
    const completionRate = totalTasks > 0 ? completedTasks / totalTasks : 0.5;
    const config = GAME_CONSTANTS.SCALING_CONFIG.elite;
    const baseHp = Math.floor(config.hpBase * Math.pow(config.hpGrowth, currentDay - 1));
    const bossHealth = Math.floor(baseHp * a.hpMult * (2 - completionRate));
    setCurrentAnimation('screen-shake');
    setTimeout(() => setCurrentAnimation(null), 500);
    sounds.bossEntrance();
    a.sfx();
    audioManager.cut();
    audioManager.play(a.music);
    setBattleType('elite');
    setBossName(a.name);
    setBanditEnemyImg(a.img);
    setBossHp(bossHealth);
    setBossMax(bossHealth);
    setShowBoss(true);
    setBattling(true);
    setBattleMenu('main');
    setBattleMode(true);
    setIsFinalBoss(false);
    setCanFlee(false);
    setBossDebuffs({ poisonTurns: 0, poisonDamage: 0, poisonedVulnerability: 0, stunned: false });
    setPlayerDebuffs({ bleedTurns: 0, bleedDamage: 0, armorShredTurns: 0 });
    setVictoryLoot([]);
    setVictoryChest(null);
    setChargeStacks(0);
    setEnragedTurns(0);
    setHasFled(false);
    setEnemyDialogue(a.dialogue);
    addLog(`⚔️ ${a.name} stands before you!`);
    const _dexMod = hero?.abilities ? Math.floor((hero.abilities.dex - 10) / 2) : 0;
    const _wis = hero?.abilities ? Math.max(0, Math.floor((hero.abilities.wis - 10) / 2)) : 0;
    const _rawAtk = GAME_CONSTANTS.BOSS_ATTACK_BASE + currentDay * GAME_CONSTANTS.BOSS_ATTACK_DAY_SCALING;
    const _pRoll = Math.ceil(Math.random() * 20);
    const _pTotal = _pRoll + _dexMod;
    const _eRoll = Math.ceil(Math.random() * 20);
    const _eTotal = _eRoll + 4;
    const _first = _pTotal >= _eTotal;
    const _margin = Math.abs(_pTotal - _eTotal);
    const _decisive = _margin >= 5;
    const _openDmg = _first ? 0 : Math.max(3, Math.floor(_rawAtk * (_decisive ? 0.65 : 0.40) * (1 - _wis * 0.02)));
    const _stunned = !_first && _decisive;
    if (!_first) {
      if (!godMode) setHp(prev => Math.max(0, prev - _openDmg));
      addLog(`Initiative: ${a.name} acts first — ${_decisive ? 'decisive' : 'narrow'} edge. ${_openDmg} damage.`);
      if (_stunned) { setPlayerDebuffs(prev => ({ ...prev, stunned: true })); addLog('You are stunned for 1 turn!'); }
    } else {
      addLog(`Initiative: You act first (${_pTotal} vs ${_eTotal}).`);
    }
  };

  const spawnSpecificElite = (creatureId, dialogue) => {
    const creature = CREATURE_INDEX.find(c => c.id === creatureId);
    if (!creature) return;
    const completedTasks = tasks.filter(t => t.done).length;
    const totalTasks = tasks.length;
    const completionRate = totalTasks > 0 ? completedTasks / totalTasks : 0.5;
    const config = GAME_CONSTANTS.SCALING_CONFIG.elite;
    const baseHp = Math.floor(config.hpBase * Math.pow(config.hpGrowth, currentDay - 1));
    const bossNumber = miniBossCount + 1;
    const scaledHp = Math.floor(baseHp * (1 + bossNumber * 0.2) * (creature.hpMod || 1));
    const bossHealth = Math.floor(scaledHp * (2 - completionRate));
    setCurrentAnimation('screen-shake');
    setTimeout(() => setCurrentAnimation(null), 500);
    sounds.bossEntrance();
    setBattleType('elite');
    audioManager.cut();
    audioManager.play(TRACKS.darkling);
    setBossName(creature.name);
    setBanditEnemyImg(creature.img);
    setBossHp(bossHealth);
    setBossMax(bossHealth);
    setShowBoss(true);
    setBattling(true);
    setBattleMenu('main');
    setBattleMode(true);
    setIsFinalBoss(false);
    setCanFlee(false);
    setMiniBossCount(bossNumber);
    setBossDebuffs({ poisonTurns: 0, poisonDamage: 0, poisonedVulnerability: 0, stunned: false });
    setPlayerDebuffs({ bleedTurns: 0, bleedDamage: 0, armorShredTurns: 0 });
    setVictoryLoot([]);
    setVictoryChest(null);
    setChargeStacks(0);
    setEnragedTurns(0);
    setHasFled(false);
    if (dialogue) setEnemyDialogue(dialogue);
    addLog(`⚔️ ${creature.name} blocks your path!`);
    const _dexMod_se = hero?.abilities ? Math.floor((hero.abilities.dex - 10) / 2) : 0;
    const _wis_se = hero?.abilities ? Math.max(0, Math.floor((hero.abilities.wis - 10) / 2)) : 0;
    const _rawAtk_se = GAME_CONSTANTS.BOSS_ATTACK_BASE + currentDay * GAME_CONSTANTS.BOSS_ATTACK_DAY_SCALING;
    const _pRoll_se = Math.ceil(Math.random() * 20);
    const _pTotal_se = _pRoll_se + _dexMod_se;
    const _eRoll_se = Math.ceil(Math.random() * 20);
    const _eTotal_se = _eRoll_se + 2;
    const _seFirst = _pTotal_se >= _eTotal_se;
    const _margin_se = Math.abs(_pTotal_se - _eTotal_se);
    const _decisive_se = _margin_se >= 5;
    const _openDmg_se = _seFirst ? 0 : Math.max(3, Math.floor(_rawAtk_se * (_decisive_se ? 0.65 : 0.40) * (1 - _wis_se * 0.02)));
    const _stunned_se = !_seFirst && _decisive_se;
    setTimeout(() => setInitiativeRoll({
      playerRoll: _pRoll_se, playerMod: _dexMod_se, playerTotal: _pTotal_se,
      enemyRoll: _eRoll_se, enemyMod: 2, enemyTotal: _eTotal_se,
      playerFirst: _seFirst, decisive: _decisive_se, margin: _margin_se,
      openingDamage: _openDmg_se, stunned: _stunned_se,
      openingLog: _seFirst ? '' : `${creature.name} strikes first for ${_openDmg_se} damage.${_stunned_se ? ' You are stunned.' : ''}`,
    }), 3200);
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
    const completedTasks = tasks.filter(t => t.done).length;
    const requiredTasks = Math.min(3, tasks.length);

    if (tasks.length === 0 || completedTasks < requiredTasks) {
      addLog(`Complete ${requiredTasks} tasks to summon the Blood Contract guardian. (${completedTasks}/${requiredTasks})`);
      return;
    }
    
    setBattleType('elite');
    audioManager.cut();
    audioManager.play(TRACKS.darkling);
    spawnRandomMiniBoss();
    setCanFlee(false);
  };
  
  const spawnFinalBossPhase = (phase) => {
    const config = GAME_CONSTANTS.SCALING_CONFIG.boss;
    const baseHp = Math.floor(config.hpBase * Math.pow(config.hpGrowth, currentDay - 1));
    const completedTasks = tasks.filter(t => t.done).length;
    const totalTasks = tasks.length;
    const completionRate = totalTasks > 0 ? completedTasks / totalTasks : 1.0;
    setCurrentAnimation('screen-shake');
    setTimeout(() => setCurrentAnimation(null), 500);
    setEnragedTurns(0);
    setPlayerDebuffs({ bleedTurns: 0, bleedDamage: 0, armorShredTurns: 0 });
    setChargeStacks(0);
    setBattleMenu('main');
    setBattling(true);
    setBattleMode(true);
    if (phase === 2) {
      const hp = Math.floor(baseHp * 0.55);
      setBossName('Mira');
      setBossHp(hp); setBossMax(hp);
      setBanditEnemyImg('/daughters-of-dusk/leader.png');
      Math.random() < 0.5 ? sounds.daughtersLaugh1() : sounds.daughtersLaugh2();
      audioManager.play(TRACKS.mira);
      setEnemyDialogue('"You spilled bandit blood. Now you face the dark."');
      addLog('🌑 MIRA, DUSK QUEEN STEPS FORWARD!');
    } else if (phase === 3) {
      const hp = Math.floor(baseHp * 0.85);
      setBossName('Sylvaris, Queen of Ruin');
      setBossHp(hp); setBossMax(hp);
      setBanditEnemyImg('/bosses/dark-elf-queen.png');
      sounds.finalBossEntrance();
      sounds.finalBossStorm();
      sounds.possessedLaugh();
      audioManager.play(TRACKS.sylvaris);
      setEnemyDialogue('"Impressive. Truly. But this ends now."');
      addLog('⚡ PHASE 2 — SYLVARIS, QUEEN OF RUIN!');
    } else if (phase === 4) {
      const hp = Math.floor(baseHp * (1.5 - completionRate * 0.5));
      setBossName('Malachar, the Eternal Lich');
      setBossHp(hp); setBossMax(hp);
      setBanditEnemyImg('/undead-king.png');
      sounds.finalBossEntrance();
      sounds.finalBossStorm();
      sounds.demonicLaugh();
      audioManager.play(TRACKS.malachar);
      setEnemyDialogue('"I have died seventeen times. I will not die tonight."');
      addLog('💀 PHASE 3 — MALACHAR, THE ETERNAL LICH!');
    }
  };

  const advanceFinalBossPhase = () => {
    const phase = finalBossPhaseRef.current;
    if (phase === 0 || phase >= 4) return false;
    sounds.victory();
    setEnragedTurns(0);
    setPlayerDebuffs({ bleedTurns: 0, bleedDamage: 0, armorShredTurns: 0 });
    setChargeStacks(0);
    const transitions = {
      1: { log: '⚔️ Cutter falls. "...The order will hear of this."',    dialogue: '"The order will hear of this..."' },
      2: { log: '🌑 The Dusk Queen falls. The shadows retreat.',          dialogue: '"Sylvaris... they are here..."' },
      3: { log: '⚡ Sylvaris staggers. A cold silence falls.',            dialogue: '"Malachar... finish... this..."' },
    };
    const t = transitions[phase];
    if (t) { addLog(t.log); setEnemyDialogue(t.dialogue); }
    if (phase === 1) setDefeatedFactionMembers(prev => prev.includes('/bandits/leader.png') ? prev : [...prev, '/bandits/leader.png']);
    if (phase === 2) setDefeatedFactionMembers(prev => prev.includes('/daughters-of-dusk/leader.png') ? prev : [...prev, '/daughters-of-dusk/leader.png']);
    finalBossPhaseRef.current = phase + 1;
    setFinalBossPhase(phase + 1);
    setTimeout(() => spawnFinalBossPhase(phase + 1), 2500);
    return true;
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
    sounds.bossEntrance();
    setBattleType('final');
    audioManager.play(TRACKS.cutter);
    setShowBoss(true);
    setBattling(true);
    setBattleMenu('main'); // Reset to main menu
    setBattleMode(true);
    setIsFinalBoss(true);
    setCanFlee(false);
    setVictoryLoot([]);
    setVictoryChest(null); // Clear previous loot

    // Reset charges at start of each battle
    setChargeStacks(0);
    setPlayerDebuffs({ bleedTurns: 0, bleedDamage: 0, armorShredTurns: 0 });

    setEnragedTurns(0);
    setHasFled(false); // Reset fled status
    
    // Reset phase states
    setInPhase3(false); setInPhase2(false); setInPhase1(false);
    setPhase1TurnCounter(0); setPhase2TurnCounter(0); setPhase2DamageStacks(0);
    setHasSpawnedPreviewAdd(false); setShadowAdds([]);
    setAoeWarning(false); setShowDodgeButton(false); setDodgeReady(false);
    setPhase3TurnCounter(0); setLifeDrainCounter(0);
    finalBossPhaseRef.current = 1;
    setFinalBossPhase(1);

    // Phase 1 — Cutter, Bandit Lord
    const cutterHp = Math.floor(bossHealth * 0.55);
    setBossName('Cutter');
    setBossHp(cutterHp);
    setBossMax(cutterHp);
    setBanditEnemyImg('/bandits/leader.png');
    sounds.banditLaugh();
    setEnemyDialogue('"The order didn\'t send me. I came because I wanted to."');
    addLog('⚔️ THE GAUNTLET BEGINS — CUTTER, BANDIT LORD!');
  // Initiative — player D20+DEX vs final boss D20+4
  const _dexMod_fb = hero?.abilities ? Math.floor((hero.abilities.dex - 10) / 2) : 0;
  const _wis_fb = hero?.abilities ? Math.max(0, Math.floor((hero.abilities.wis - 10) / 2)) : 0;
  const _rawAtk_fb = GAME_CONSTANTS.BOSS_ATTACK_BASE + currentDay * GAME_CONSTANTS.BOSS_ATTACK_DAY_SCALING;
  const _pRoll_fb = Math.ceil(Math.random() * 20);
  const _pTotal_fb = _pRoll_fb + _dexMod_fb;
  const _eMod_fb = 4;
  const _eRoll_fb = Math.ceil(Math.random() * 20);
  const _eTotal_fb = _eRoll_fb + _eMod_fb;
  const _fbFirst = _pTotal_fb >= _eTotal_fb;
  const _margin_fb = Math.abs(_pTotal_fb - _eTotal_fb);
  const _decisive_fb = _margin_fb >= 5;
  const _openDmg_fb = _fbFirst ? 0 : Math.max(3, Math.floor(_rawAtk_fb * (_decisive_fb ? 0.75 : 0.50) * (1 - _wis_fb * 0.02)));
  const _stunned_fb = !_fbFirst && _decisive_fb;
  setTimeout(() => setInitiativeRoll({
    playerRoll: _pRoll_fb, playerMod: _dexMod_fb, playerTotal: _pTotal_fb,
    enemyRoll: _eRoll_fb, enemyMod: _eMod_fb, enemyTotal: _eTotal_fb,
    playerFirst: _fbFirst, decisive: _decisive_fb, margin: _margin_fb,
    openingDamage: _openDmg_fb, stunned: _stunned_fb,
    openingLog: _fbFirst ? '' : `Enemy strikes first for ${_openDmg_fb} damage.${_stunned_fb ? ' You are stunned.' : ''}`,
  }), 3200);
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
        
        if (!godMode) setHp(h => Math.max(0, h - baseDamage));
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
    enemyDef += Math.floor((currentDay - 1) * GAME_CONSTANTS.ENEMY_DEFENSE_DAY_SCALE);
    enemyDef = Math.floor(enemyDef * (currentBattleCreature?.rolledDefMult ?? 1));

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
    
    // Add weapon and ring affixes to crit
    if (equippedWeapon && equippedWeapon.affixes) {
      if (equippedWeapon.affixes.critChance) {
        critChance += equippedWeapon.affixes.critChance;
      }
      if (equippedWeapon.affixes.critMultiplier) {
        critMultiplier += equippedWeapon.affixes.critMultiplier;
      }
    }
    if (equippedTome?.affixes?.critChance) {
      critChance += equippedTome.affixes.critChance;
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
      sounds.critHit();
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
    
    const newBossHp = godMode ? 0 : Math.max(0, bossHp - finalDamage);
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
    
    // Build charges via basic attack only
    if (chargeStacks < GAME_CONSTANTS.CHARGE_SYSTEM.maxCharges) {
      setChargeStacks(c => Math.min(c + GAME_CONSTANTS.CHARGE_SYSTEM.chargePerAttack, GAME_CONSTANTS.CHARGE_SYSTEM.maxCharges));
      if (chargeStacks + 1 === GAME_CONSTANTS.CHARGE_SYSTEM.maxCharges) {
        sounds.chargeFull();
      } else {
        sounds.chargeGain();
      }
    }

    // Update dialogue based on HP phase
    const hpPercent = newBossHp / bossMax;
    
    
    if (battleType === 'elite' || battleType === 'final') {
      // Boss dialogue (GAUNTLET for final, cycling for elite)
      const bossDialogueKey = battleType === 'final' ? 'GAUNTLET' : `DAY_${((currentDay - 1) % 7) + 1}`;
      const bossDialogue = GAME_CONSTANTS.BOSS_DIALOGUE[bossDialogueKey];
      
      if (bossDialogue) {
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
      if (advanceFinalBossPhase()) return;
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
  
  const grimoireXpBonus = 1 + (equippedGrimoire?.affixes?.xpBonus || 0) / 100;
  const tomeGoldBonus  = 1 + (equippedTome?.affixes?.goldBonus  || 0) / 100;
  const chaMod = Math.max(0, Math.floor(((hero?.abilities?.cha || 10) - 10) / 2));
  setXp(x => x + Math.round(xpGain * dayBonuses.xpMultiplier * grimoireXpBonus));
  setGold(e => e + Math.round(goldGain * (1 + chaMod * 0.05) * tomeGoldBonus));
  
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
  setGuildPoints(p => p + 15);
  setContractFulfilled({ xpEarned: GAME_CONSTANTS.XP_REWARDS.miniBoss, tier: 'platinum' });
  addLog('Today\'s elite trial complete. Curse will be cleared at midnight.');
}
  
  // Location contract bandit wave — handle separately from the raid system
  let skipBanditRaidHandler = false;
  if (isBanditWave && (activeContractRef.current?.type === 'location' || activeContractRef.current?.type === 'wild')) {
    const nextIdx = banditLineupIdxRef.current + 1;
    const lineup = banditLineupRef.current;
    if (nextIdx < lineup.length) {
      addLog(`Another closes in...`);
      setTimeout(() => spawnBanditEnemy(lineup[nextIdx], nextIdx, lineup.length), 1500);
      return;
    }
    // All contract enemies down — clear bandit flag and fall through to regular victory path
    setIsBanditWave(false);
    skipBanditRaidHandler = true;
  }

  // Check if bandit RAID wave continues
  if (isBanditWave && !skipBanditRaidHandler) {
    const nextIdx = banditLineupIdxRef.current + 1;
    const lineup = banditLineupRef.current;
    const defeatedEnemy = lineup[banditLineupIdxRef.current];

    // Track faction member defeats by img path
    if (defeatedEnemy?.img) {
      setDefeatedFactionMembers(prev => prev.includes(defeatedEnemy.img) ? prev : [...prev, defeatedEnemy.img]);
    }

    // Track captain defeats
    if (defeatedEnemy?.isCapt) {
      const captIdx = BANDIT_POOL.captains.findIndex(c => c.name === defeatedEnemy.name);
      if (captIdx !== -1) {
        setBanditCaptainsDefeated(prev => prev.includes(captIdx) ? prev : [...prev, captIdx]);
      }
    }

    if (nextIdx < lineup.length) {
      addLog(`Next bandit incoming...`);
      setTimeout(() => spawnBanditEnemy(lineup[nextIdx], nextIdx, lineup.length), 1500);
      return;
    }

    // Bandit wave cleared
    setXp(x => x + 20);
    addLog(`Bandit wave cleared! +20 bonus XP`);

    // Check if all 3 captains now defeated → spawn leader
    const totalDefeated = banditCaptainsDefeated.length + (defeatedEnemy?.isCapt ? 1 : 0);
    if (totalDefeated >= 3 && !defeatedEnemy?.isLeader) {
      addLog(`All captains have fallen... Cutter emerges!`);
      const leader = { ...BANDIT_POOL.leader, isCapt: false, isLeader: true };
      banditLineupRef.current = [leader];
      setTimeout(() => spawnBanditEnemy(leader, 0, 1), 2000);
      return;
    }

    setIsBanditWave(false);
    setBattling(false);
    setBattleMode(false);
    generateVictoryLoot(battleType, isFinalBoss, goldGain, waveGoldTotal + goldGain);
    return;
  }

  // Check if Daughters of Dusk wave continues
  if (isDaughtersWave) {
    const nextIdx = daughtersLineupIdxRef.current + 1;
    const lineup = daughtersLineupRef.current;
    const defeatedEnemy = lineup[daughtersLineupIdxRef.current];

    // Track faction member defeats by img path
    if (defeatedEnemy?.img) {
      setDefeatedFactionMembers(prev => prev.includes(defeatedEnemy.img) ? prev : [...prev, defeatedEnemy.img]);
    }

    if (defeatedEnemy?.isCapt) {
      const captIdx = DAUGHTERS_POOL.captains.findIndex(c => c.name === defeatedEnemy.name);
      if (captIdx !== -1) setDaughtersCaptainsDefeated(prev => prev.includes(captIdx) ? prev : [...prev, captIdx]);
    }

    if (nextIdx < lineup.length) {
      addLog(`The next Daughter steps forward...`);
      setTimeout(() => spawnDaughtersEnemy(lineup[nextIdx], nextIdx, lineup.length), 1500);
      return;
    }

    setXp(x => x + 20);
    addLog(`The Daughters retreat into the dark! +20 bonus XP`);

    const totalDefeated = daughtersCaptainsDefeated.length + (defeatedEnemy?.isCapt ? 1 : 0);
    if (totalDefeated >= 3 && !defeatedEnemy?.isLeader) {
      addLog(`All captains fallen... Mira, the Dusk Queen, reveals herself!`);
      const leader = { ...DAUGHTERS_POOL.leader, isCapt: false, isLeader: true };
      daughtersLineupRef.current = [leader];
      setTimeout(() => spawnDaughtersEnemy(leader, 0, 1), 2000);
      return;
    }

    setIsDaughtersWave(false);
    setBattling(false);
    setBattleMode(false);
    generateVictoryLoot(battleType, isFinalBoss, goldGain, waveGoldTotal + goldGain);
    return;
  }

  // Check if Cursed mercy contract wave continues
  if (isCursedWave) {
    const nextIdx = cursedLineupIdxRef.current + 1;
    const lineup = cursedLineupRef.current;
    if (nextIdx < lineup.length) {
      addLog(`They cannot stop. Neither can you.`);
      setTimeout(() => spawnCursedEnemy(lineup[nextIdx], nextIdx, lineup.length), 1500);
      return;
    }
    // All members defeated — mark them all at rest
    const allImgs = lineup.map(m => m.img);
    setRestedCursed(prev => {
      const updated = [...prev];
      allImgs.forEach(img => { if (!updated.includes(img)) updated.push(img); });
      return updated;
    });
    addLog(`They are finally at rest.`);
    setIsCursedWave(false);
    setBattling(false);
    setBattleMode(false);
    generateVictoryLoot(battleType, isFinalBoss, goldGain, waveGoldTotal + goldGain);
    return;
  }

  // Check if elite wave contract continues (creatures → elite)
  if (isEliteWave) {
    const ew = eliteWaveRef.current;
    const nextCreatureIdx = ew.creatureIdx + 1;
    if (nextCreatureIdx < ew.creatures.length) {
      // More creatures
      ew.creatureIdx = nextCreatureIdx;
      setCurrentWaveEnemy(nextCreatureIdx + 1);
      addLog(`Another creature closes in...`);
      setTimeout(() => spawnRegularEnemy(false), 1500);
      return;
    }
    if (nextCreatureIdx === ew.creatures.length) {
      // All creatures down — spawn the elite
      ew.creatureIdx = nextCreatureIdx;
      setCurrentWaveEnemy(ew.creatures.length + 1);
      addLog(`The elite emerges from the chaos!`);
      setTimeout(() => spawnSpecificElite(ew.eliteId, ew.eliteDialogue), 1500);
      return;
    }
    // Elite defeated — wave complete
    setIsEliteWave(false);
    setBattling(false);
    setBattleMode(false);
    generateVictoryLoot(battleType, false, goldGain, waveGoldTotal + goldGain);
    return;
  }

  // Check if order final wave continues (Cutter → Mira)
  if (isOrderFinal) {
    const nextIdx = orderFinalIdxRef.current + 1;
    const lineup = orderFinalLineupRef.current;
    if (nextIdx < lineup.length) {
      orderFinalIdxRef.current = nextIdx;
      const next = lineup[nextIdx];
      setCurrentWaveEnemy(nextIdx + 1);
      addLog(`${next.name} steps forward — the order is not finished.`);
      if (next.faction === 'bandit') setTimeout(() => spawnBanditEnemy(next, nextIdx, lineup.length), 1500);
      else setTimeout(() => spawnDaughtersEnemy(next, nextIdx, lineup.length), 1500);
      return;
    }
    // Full order defeated
    setIsOrderFinal(false);
    setDefeatedFactionMembers(prev => {
      const imgs = lineup.map(m => m.img);
      return [...prev, ...imgs.filter(i => !prev.includes(i))];
    });
    setBattling(false);
    setBattleMode(false);
    generateVictoryLoot(battleType, true, goldGain, waveGoldTotal + goldGain);
    return;
  }

  // Check if regular wave continues
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
  setCurrentBattleCreature(null);

  // Complete active contract on regular battle victory
  const _ac = activeContractRef.current;
  if (_ac?.type === 'task') {
    complete(_ac.task.id);
    pendingBattleSpawnRef.current = null;
    setActiveContract(null);
  } else if (_ac?.type === 'location') {
    contractEncounterRef.current = null;
    setPendingLocationRewards(prev => [...prev, _ac.contract.id]);
    addLog(`Contract fulfilled: "${_ac.contract.name}" — return to the board to collect your reward.`);
    setActiveContract(null);
  } else if (_ac?.type === 'wild') {
    setActiveContract(null);
    const wildZone = _ac.zone || 1;
    const wildGold = 5 + wildZone * 4 + Math.floor(Math.random() * 8);
    setGold(g => g + wildGold);
    generateVictoryLoot('regular', false, wildGold);
  } else if (_ac?.type === 'challenge') {
    const chalZone = _ac.zone || 1;
    const chalGoldBase = [0, 30, 50, 75, 100, 150][chalZone] || 30;
    const chalXpBase   = [0, 60, 100, 150, 200, 300][chalZone] || 60;
    const chalGold = chalGoldBase + Math.floor(Math.random() * Math.floor(chalGoldBase * 0.3));
    const chalXp   = chalXpBase   + Math.floor(Math.random() * Math.floor(chalXpBase   * 0.2));
    const crystalDrop = Math.random() < 0.25;
    setGold(g => g + chalGold);
    setXp(x => x + chalXp);
    if (crystalDrop) setFusionCrystals(f => f + 1);
    setHuntingChallenges(prev => ({ ...prev, [_ac.locationId]: Date.now() }));
    addLog(`Challenge complete — ${chalGold} gold, ${chalXp} XP${crystalDrop ? ', Fusion Crystal' : ''} earned.`);
    setActiveContract(null);
    generateVictoryLoot('regular', false, chalGold);
  }

  // Pendant regenHP: restore HP after combat victory
  if (equippedGrimoire?.affixes?.regenHP) {
    const regen = Math.floor(equippedGrimoire.affixes.regenHP);
    if (regen > 0) {
      setHp(h => Math.min(h + regen, getMaxHp()));
      addLog(`✨ ${equippedGrimoire.name} restores ${regen} HP.`);
    }
  }

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
  attackScaling = 2.0;
} else {
  // Elite and Final bosses use constants
  baseAttack = battleType === 'final' ? GAME_CONSTANTS.BOSS_ATTACK_BASE : GAME_CONSTANTS.MINI_BOSS_ATK_BASE;
  attackScaling = battleType === 'final' ? GAME_CONSTANTS.BOSS_ATTACK_DAY_SCALING : GAME_CONSTANTS.MINI_BOSS_ATK_SCALING;
}

// Diminishing returns armor formula: damage * (K / (K + armor))
const rawEnemyDamage = Math.floor((baseAttack + (currentDay * attackScaling)) * (currentBattleCreature?.rolledAtkMult ?? 1));

// Apply bleed DoT tick
if (playerDebuffs.bleedTurns > 0) {
  const bleedDmg = playerDebuffs.bleedDamage;
  setHp(h => {
    const next = godMode ? h : Math.max(0, h - bleedDmg);
    if (next <= 0) setTimeout(() => enterDyingState(), 200);
    return next;
  });
  addLog(`Bleeding! -${bleedDmg} HP`);
  setPlayerDebuffs(prev => ({ ...prev, bleedTurns: prev.bleedTurns - 1 }));
}

// Decrement armor shred
if (playerDebuffs.armorShredTurns > 0) {
  setPlayerDebuffs(prev => ({ ...prev, armorShredTurns: prev.armorShredTurns - 1 }));
}

// Enemy special move (final boss has its own phase system — skip)
let overwhelmingForceUsed = false;
if (battleType !== 'final') {
  const specialChance = battleType === 'elite'
    ? 0.25 + (currentDay - 1) * 0.025
    : battleType === 'wave'
    ? 0.10
    : 0.18 + (currentDay - 1) * 0.02;

  if (Math.random() < specialChance) {
    const canBleed = playerDebuffs.bleedTurns === 0;
    const canShred = playerDebuffs.armorShredTurns === 0;
    const pool = [];
    if (canBleed) pool.push('bleed');
    if (canShred && battleType !== 'wave') pool.push('armorBreak');
    pool.push('overwhelmingForce');

    const move = pool[Math.floor(Math.random() * pool.length)];
    if (move === 'bleed') {
      const dmg = Math.max(3, Math.floor(rawEnemyDamage * 0.28));
      setPlayerDebuffs(prev => ({ ...prev, bleedTurns: 3, bleedDamage: dmg }));
      addLog(`Enemy opens a deep wound! You bleed for ${dmg} damage per turn (3 turns).`);
      return; // skip normal attack this turn
    } else if (move === 'armorBreak') {
      setPlayerDebuffs(prev => ({ ...prev, armorShredTurns: 2 }));
      addLog(`Enemy SHATTERS your guard! Defense reduced 35% for 2 turns.`);
      return; // skip normal attack this turn
    } else {
      overwhelmingForceUsed = true; // 2.5× damage applied after calc
    }
  }
}

const shredMultiplier = playerDebuffs.armorShredTurns > 0 ? 0.65 : 1;
const playerArmor = Math.floor((getBaseDefense() + (armorPolishActive ? 5 : 0)) * shredMultiplier);
const K = GAME_CONSTANTS.ARMOR_K_CONSTANT; // 60
const damageReduction = K / (K + playerArmor);
let bossDamage = Math.max(1, Math.floor(rawEnemyDamage * damageReduction));

if (overwhelmingForceUsed) {
  bossDamage = Math.floor(bossDamage * 2.5);
  addLog(`OVERWHELMING FORCE! The enemy attacks with devastating power!`);
}

// Apply percentDR from armor affixes
let percentDR = 0;
Object.values(equippedArmor).forEach(piece => {
  if (piece && piece.affixes && piece.affixes.percentDR) {
    percentDR += piece.affixes.percentDR;
  }
});
if (percentDR > 0) {
  bossDamage = Math.floor(bossDamage * (1 - Math.min(percentDR, 40) / 100));
}

// Curse level increases enemy damage
if (curseLevel === 2) {
  bossDamage = Math.floor(bossDamage * 1.2); // 20% harder
} else if (curseLevel === 3) {
  bossDamage = Math.floor(bossDamage * 1.4); // 40% harder
}
// WIS damage reduction (2% per modifier point above 10)
const _wisMod = hero?.abilities ? Math.max(0, Math.floor((hero.abilities.wis - 10) / 2)) : 0;
if (_wisMod > 0) bossDamage = Math.max(1, Math.floor(bossDamage * (1 - _wisMod * 0.02)));
// DEX dodge (3% per modifier point, cap 20%) — exits enemy turn early
const _dexMod = hero?.abilities ? Math.max(0, Math.floor((hero.abilities.dex - 10) / 2)) : 0;
if (_dexMod > 0 && Math.random() < Math.min(0.20, _dexMod * 0.03)) {
  addLog(`⚡ You dodge the attack! (DEX)`);
  return;
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
        addLog('Enemy is no longer ENRAGED');
      }
      return newTurns;
    });
    
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
                addLog('💀 AOE slams you down! Roll for death!');
                enterDyingState();
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
            addLog('💀 You fall! Roll for death!');
            enterDyingState();
          }, 500);
        }
        return newHp;
      });
      addLog(`💥 Boss strikes! -${bossDamage} HP${enragedTurns > 0 ? ' (ENRAGED!)' : ''}`);
      
      // Decrement enraged turns
      if (enragedTurns > 0) {
        setEnragedTurns(prev => {
          const newTurns = prev - 1;
          if (newTurns === 0) {
            addLog('Enemy is no longer ENRAGED');
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
            const newHp = godMode ? h : Math.max(0, h - poisonDmg);
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
                setXp(x => x + Math.round(xpGain * dayBonuses.xpMultiplier));
                setGold(e => e + Math.round(goldGain * (1 + Math.max(0, Math.floor(((hero?.abilities?.cha || 10) - 10) / 2)) * 0.05)));
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
            if (!godMode) setHp(h => Math.max(0, h - drainAmount));
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
    sounds.specialAttack();

    // Get enemy defense based on battle type
    let enemyDef = GAME_CONSTANTS.ENEMY_DEFENSE.regular;
    if (battleType === 'elite') {
      enemyDef = GAME_CONSTANTS.ENEMY_DEFENSE.elite;
    } else if (battleType === 'final' || isFinalBoss) {
      enemyDef = GAME_CONSTANTS.ENEMY_DEFENSE.gauntlet;
    }
    enemyDef += Math.floor((currentDay - 1) * GAME_CONSTANTS.ENEMY_DEFENSE_DAY_SCALE);
    enemyDef = Math.floor(enemyDef * (currentBattleCreature?.rolledDefMult ?? 1));

    // Calculate base damage with special multiplier
    const baseDamage = getBaseAttack() + Math.floor(Math.random() * 10);
    
    // Crit system — regular crit chance (D20 charged crits belong to Charged Strike, not specials)
    let critChance = GAME_CONSTANTS.CRIT_SYSTEM.baseCritChance;
    if (crusaderHolyEmpowerment > 0 && hero?.class?.name === 'Crusader') {
      critChance += GAME_CONSTANTS.SPECIAL_ATTACKS.Crusader.sanctifiedCrit;
    }
    if (equippedTome?.affixes?.critChance) {
      critChance += equippedTome.affixes.critChance;
    }
    const isCrit = (Math.random() * 100) < critChance;
    const critMultiplier = isCrit ? GAME_CONSTANTS.CRIT_SYSTEM.baseCritMultiplier : 1.0;

    const rawDamage = (baseDamage * critMultiplier) * special.damageMultiplier;
    let damage = Math.max(1, Math.floor(rawDamage - enemyDef));

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
    
    const newBossHp = godMode ? 0 : Math.max(0, bossHp - damage);
    setBossHp(newBossHp);
    
    // Update dialogue based on HP phase
    const hpPercent = newBossHp / bossMax;
    
    if (battleType === 'elite' || battleType === 'final') {
      // Boss dialogue (GAUNTLET for final, cycling for elite)
      const bossDialogueKey = battleType === 'final' ? 'GAUNTLET' : `DAY_${((currentDay - 1) % 7) + 1}`;
      const bossDialogue = GAME_CONSTANTS.BOSS_DIALOGUE[bossDialogueKey];
      
      if (bossDialogue) {
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
      if (advanceFinalBossPhase()) return;
      setTimeout(() => {
        setCurrentAnimation('battle-shake');
        setTimeout(() => setCurrentAnimation(null), 250);
      }, 100);

      setRecklessStacks(0);

      const xpGain = isFinalBoss ? GAME_CONSTANTS.XP_REWARDS.finalBoss : GAME_CONSTANTS.XP_REWARDS.miniBoss;
      const goldGain = calculateCombatGold(isFinalBoss ? 'final' : (battleType === 'elite' ? 'elite' : (battleType === 'wave' ? 'wave' : 'normal')));
      setXp(x => x + Math.round(xpGain * dayBonuses.xpMultiplier));
      setGold(e => e + Math.round(goldGain * (1 + Math.max(0, Math.floor(((hero?.abilities?.cha || 10) - 10) / 2)) * 0.05)));
      
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
      const rarity = rollRarityWithPity('boss');
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
      const rarity = rollRarityWithPity('boss');
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
      const rarity = rollRarityWithPity('boss');
      const multiplier = getRarityMultiplier(rarity);
      
      const range = GAME_CONSTANTS.ACCESSORY_STAT_RANGES.grimoire;
      const baseHp = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
      const hp = Math.floor(baseHp * multiplier);
      
      const names = GAME_CONSTANTS.ACCESSORY_NAMES.grimoire[rarity];
      const name = names[Math.floor(Math.random() * names.length)];
      const rarityName = GAME_CONSTANTS.RARITY_TIERS[rarity].name;
      const affixes = generateAffixes(rarity, 'grimoire');
      const newGrimoire = { name, hp, rarity, affixes, id: Date.now() };
      setGrimoireInventory(prev => sortByRarity([...prev, newGrimoire]));

      lootMessages.push(`${rarityName} ${name} (+${hp} Health)`);
      addLog(`💎 Looted: ${rarityName} ${name} (+${hp} Health)${luckyCharmActive ? ' (Lucky Charm!)' : '!'}`);
    } else {
      // Generate random ring with boss-tier rarity
      const rarity = rollRarityWithPity('boss');
      const multiplier = getRarityMultiplier(rarity);

      const range = GAME_CONSTANTS.ACCESSORY_STAT_RANGES.tome;
      const baseStamina = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
      const stamina = Math.floor(baseStamina * multiplier);

      const names = GAME_CONSTANTS.ACCESSORY_NAMES.tome[rarity];
      const name = names[Math.floor(Math.random() * names.length)];
      const rarityName = GAME_CONSTANTS.RARITY_TIERS[rarity].name;
      const affixes = generateAffixes(rarity, 'tome');
      const newTome = { name, stamina, rarity, affixes, id: Date.now() };
      setTomeInventory(prev => sortByRarity([...prev, newTome]));

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
  attackScaling = 2.0;
} else {
  // Elite and Final bosses use constants
  baseAttack = battleType === 'final' ? GAME_CONSTANTS.BOSS_ATTACK_BASE : GAME_CONSTANTS.MINI_BOSS_ATK_BASE;
  attackScaling = battleType === 'final' ? GAME_CONSTANTS.BOSS_ATTACK_DAY_SCALING : GAME_CONSTANTS.MINI_BOSS_ATK_SCALING;
}

// Diminishing returns armor formula: damage * (K / (K + armor))
const rawEnemyDamage = Math.floor((baseAttack + (currentDay * attackScaling)) * (currentBattleCreature?.rolledAtkMult ?? 1));

// Apply bleed DoT tick (counter-attack turn)
if (playerDebuffs.bleedTurns > 0) {
  const bleedDmg = playerDebuffs.bleedDamage;
  setHp(h => {
    const next = godMode ? h : Math.max(0, h - bleedDmg);
    if (next <= 0) setTimeout(() => enterDyingState(), 200);
    return next;
  });
  addLog(`Bleeding! -${bleedDmg} HP`);
  setPlayerDebuffs(prev => ({ ...prev, bleedTurns: prev.bleedTurns - 1 }));
}

// Decrement armor shred (counter-attack turn)
if (playerDebuffs.armorShredTurns > 0) {
  setPlayerDebuffs(prev => ({ ...prev, armorShredTurns: prev.armorShredTurns - 1 }));
}

// Enemy special move (counter-attack — no specials, just plain damage)
const shredMult2 = playerDebuffs.armorShredTurns > 0 ? 0.65 : 1;
const playerArmor = Math.floor((getBaseDefense() + (armorPolishActive ? 5 : 0)) * shredMult2);
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
  bossDamage = Math.floor(bossDamage * (1 - Math.min(percentDR, 40) / 100));
}

// Curse level increases enemy damage
if (curseLevel === 2) {
  bossDamage = Math.floor(bossDamage * 1.2); // 20% harder
} else if (curseLevel === 3) {
  bossDamage = Math.floor(bossDamage * 1.4); // 40% harder
}
// WIS damage reduction (2% per modifier point above 10)
const _wisMod = hero?.abilities ? Math.max(0, Math.floor((hero.abilities.wis - 10) / 2)) : 0;
if (_wisMod > 0) bossDamage = Math.max(1, Math.floor(bossDamage * (1 - _wisMod * 0.02)));
// DEX dodge (3% per modifier point, cap 20%) — exits enemy turn early
const _dexMod = hero?.abilities ? Math.max(0, Math.floor((hero.abilities.dex - 10) / 2)) : 0;
if (_dexMod > 0 && Math.random() < Math.min(0.20, _dexMod * 0.03)) {
  addLog(`⚡ You dodge the attack! (DEX)`);
  return;
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
        addLog('Enemy is no longer ENRAGED');
      }
      return newTurns;
    });
    
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
              addLog('💀 You fall! Roll for death!');
              enterDyingState();
            }, 500);
          }
          return newHp;
        });
        addLog(`💥 Boss strikes! -${bossDamage} HP${enragedTurns > 0 ? ' (ENRAGED!)' : ''}`);
        
        // Decrement enraged turns
        if (enragedTurns > 0) {
          setEnragedTurns(prev => {
            const newTurns = prev - 1;
            if (newTurns === 0) {
              addLog('Enemy is no longer ENRAGED');
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
              const newHp = godMode ? h : Math.max(0, h - poisonDmg);
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
                  setXp(x => x + Math.round(xpGain * dayBonuses.xpMultiplier));
                  setGold(e => e + Math.round(goldGain * (1 + Math.max(0, Math.floor(((hero?.abilities?.cha || 10) - 10) / 2)) * 0.05)));
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

  // ── Charged Strike: standalone D20 crit attack powered by full charges ───────
  const chargedStrike = (enemyDelay = GAME_CONSTANTS.BOSS_ATTACK_DELAY) => {
    if (!battling || bossHp <= 0 || chargeStacks < GAME_CONSTANTS.CHARGE_SYSTEM.maxCharges) return;

    setCurrentAnimation('battle-shake');
    setTimeout(() => setCurrentAnimation(null), 250);
    sounds.chargedStrike();

    // Enemy defense
    let enemyDef = GAME_CONSTANTS.ENEMY_DEFENSE.regular;
    if (battleType === 'elite') enemyDef = GAME_CONSTANTS.ENEMY_DEFENSE.elite;
    else if (battleType === 'final' || isFinalBoss) enemyDef = GAME_CONSTANTS.ENEMY_DEFENSE.gauntlet;
    enemyDef += Math.floor((currentDay - 1) * GAME_CONSTANTS.ENEMY_DEFENSE_DAY_SCALE);
    enemyDef = Math.floor(enemyDef * (currentBattleCreature?.rolledDefMult ?? 1));

    // D20 crit roll
    const d20 = Math.ceil(Math.random() * 20);
    let critMult;
    if      (d20 === 1)  critMult = 1.5;
    else if (d20 <= 9)   critMult = 2.0;
    else if (d20 <= 17)  critMult = 2.5;
    else if (d20 <= 19)  critMult = 3.0;
    else                  critMult = 4.0;

    const chargedAttackName = GAME_CONSTANTS.CHARGED_ATTACK_NAMES[hero?.class?.name] || 'Charged Strike';
    setChargedCritRoll({ roll: d20, multiplier: critMult, attackName: chargedAttackName });
    setChargeStacks(0);

    const baseDamage = getBaseAttack() + Math.floor(Math.random() * 10);
    let damage = Math.max(1, Math.floor((baseDamage * critMult) - enemyDef));

    // Poison vulnerability bonus
    if (bossDebuffs.poisonTurns > 0 && bossDebuffs.poisonedVulnerability > 0) {
      damage += Math.floor(damage * bossDebuffs.poisonedVulnerability);
    }

    const tierLabel = critMult >= 4 ? 'LEGENDARY STRIKE' : critMult >= 3 ? 'DEVASTATING CRIT' : critMult >= 2.5 ? 'HEAVY CRIT' : critMult >= 2 ? 'CRITICAL HIT' : 'GLANCING CRIT';
    addLog(`⚡ ${chargedAttackName.toUpperCase()}! ${tierLabel}! (${critMult}x) — ${damage} damage!`);

    const newBossHp = godMode ? 0 : Math.max(0, bossHp - damage);
    setBossHp(newBossHp);
    setBossFlash(true);
    setTimeout(() => setBossFlash(false), 200);

    // Update enemy dialogue based on HP
    const hpPct = newBossHp / bossMax;
    if (battleType === 'elite' || battleType === 'final') {
      const key = battleType === 'final' ? 'GAUNTLET' : `DAY_${((currentDay - 1) % 7) + 1}`;
      const dlg = GAME_CONSTANTS.BOSS_DIALOGUE[key];
      if (dlg) {
        if (hpPct <= 0.25 && hpPct > 0) setEnemyDialogue(dlg.LOW);
        else if (hpPct <= 0.5) setEnemyDialogue(dlg.MID);
      }
    } else if ((battleType === 'regular' || battleType === 'wave') && hpPct <= 0.33 && hpPct > 0) {
      const q = GAME_CONSTANTS.ENEMY_DIALOGUE.LOW_HP;
      setEnemyDialogue(q[Math.floor(Math.random() * q.length)]);
    }

    if (newBossHp <= 0) {
      if (advanceFinalBossPhase()) return;
      setTimeout(() => { setCurrentAnimation('battle-shake'); setTimeout(() => setCurrentAnimation(null), 250); }, 100);
      setRecklessStacks(0);
      const xpGain = isFinalBoss ? GAME_CONSTANTS.XP_REWARDS.finalBoss : GAME_CONSTANTS.XP_REWARDS.miniBoss;
      const goldGain = calculateCombatGold(isFinalBoss ? 'final' : (battleType === 'elite' ? 'elite' : (battleType === 'wave' ? 'wave' : 'normal')));
      setXp(x => x + Math.round(xpGain * dayBonuses.xpMultiplier));
      setGold(e => e + Math.round(goldGain * (1 + Math.max(0, Math.floor(((hero?.abilities?.cha || 10) - 10) / 2)) * 0.05)));
      if (battleType === 'wave') setWaveGoldTotal(t => t + goldGain);
      addLog(`Victory! The hero earned +${xpGain} XP, +${goldGain} Gold`);
      if (battleType === 'elite' || battleType === 'final') {
        const key = battleType === 'final' ? 'GAUNTLET' : `DAY_${((currentDay - 1) % 7) + 1}`;
        const dlg = GAME_CONSTANTS.BOSS_DIALOGUE[key];
        if (dlg) setEnemyDialogue(dlg.VICTORY_PLAYER);
      } else {
        const vq = GAME_CONSTANTS.ENEMY_DIALOGUE.VICTORY_PLAYER;
        setEnemyDialogue(vq[Math.floor(Math.random() * vq.length)]);
      }
      setBattling(false);
      setBattleMode(false);
      setKnightConsecutiveUses(0);
      setKnightCrushingBlowCooldown(false);
      setCrusaderSmiteCooldown(false);
      setRecklessStacks(0);
      generateVictoryLoot(battleType, isFinalBoss, goldGain);
      return;
    }

    // Enemy counter-attack
    setTimeout(() => {
      if (!battling || hp <= 0) return;
      setBossDebuffs(prev => ({ ...prev, stunned: false }));
      setCurrentAnimation('battle-shake');
      setTimeout(() => setCurrentAnimation(null), 250);

      let baseAtk, atkScale;
      if (battleType === 'regular' || battleType === 'wave') { baseAtk = 16; atkScale = 1.5; }
      else { baseAtk = battleType === 'final' ? GAME_CONSTANTS.BOSS_ATTACK_BASE : GAME_CONSTANTS.MINI_BOSS_ATK_BASE; atkScale = battleType === 'final' ? GAME_CONSTANTS.BOSS_ATTACK_DAY_SCALING : GAME_CONSTANTS.MINI_BOSS_ATK_SCALING; }

      const rawEnemy = baseAtk + (currentDay * atkScale);

      if (playerDebuffs.bleedTurns > 0) {
        const bleedDmg = playerDebuffs.bleedDamage;
        if (!godMode) setHp(h => { const n = Math.max(0, h - bleedDmg); if (n <= 0) setTimeout(() => enterDyingState(), 200); return n; });
        addLog(`Bleeding! -${bleedDmg} HP`);
        setPlayerDebuffs(prev => ({ ...prev, bleedTurns: prev.bleedTurns - 1 }));
      }
      if (playerDebuffs.armorShredTurns > 0) setPlayerDebuffs(prev => ({ ...prev, armorShredTurns: prev.armorShredTurns - 1 }));

      const shredMult = playerDebuffs.armorShredTurns > 0 ? 0.65 : 1;
      const pArmor = Math.floor((getBaseDefense() + (armorPolishActive ? 5 : 0)) * shredMult);
      const K = GAME_CONSTANTS.ARMOR_K_CONSTANT;
      let bDmg = Math.max(1, Math.floor(rawEnemy * (K / (K + pArmor))));

      let pctDR = 0;
      Object.values(equippedArmor).forEach(p => { if (p?.affixes?.percentDR) pctDR += p.affixes.percentDR; });
      if (pctDR > 0) bDmg = Math.floor(bDmg * (1 - Math.min(pctDR, 40) / 100));

      if (curseLevel === 2) bDmg = Math.floor(bDmg * 1.2);
      else if (curseLevel === 3) bDmg = Math.floor(bDmg * 1.4);

      const wisMod = hero?.abilities ? Math.max(0, Math.floor((hero.abilities.wis - 10) / 2)) : 0;
      if (wisMod > 0) bDmg = Math.max(1, Math.floor(bDmg * (1 - wisMod * 0.02)));

      const dexMod = hero?.abilities ? Math.max(0, Math.floor((hero.abilities.dex - 10) / 2)) : 0;
      if (dexMod > 0 && Math.random() < Math.min(0.20, dexMod * 0.03)) { addLog(`⚡ You dodge the attack! (DEX)`); return; }

      let knightDef = 0;
      if (knightBloodOathTurns > 0 && hero?.class?.name === 'Knight') knightDef -= GAME_CONSTANTS.SPECIAL_ATTACKS.Knight.defenseReduction;
      if (knightRallyingRoar > 0 && hero?.class?.name === 'Knight') knightDef += GAME_CONSTANTS.TACTICAL_SKILLS.Knight.defenseBonus;
      if (knightDef > 0) bDmg = Math.max(1, bDmg - Math.floor(bDmg * knightDef));
      else if (knightDef < 0) bDmg += Math.floor(bDmg * Math.abs(knightDef));

      if (wizardEtherealBarrier > 0 && hero?.class?.name === 'Wizard') {
        const ref = Math.floor(bDmg * GAME_CONSTANTS.TACTICAL_SKILLS.Wizard.damageReflect);
        bDmg = Math.max(1, bDmg - Math.floor(bDmg * GAME_CONSTANTS.TACTICAL_SKILLS.Wizard.damageReduction));
        if (ref > 0) { setBossHp(h => Math.max(0, h - ref)); addLog(`✨ Ethereal Barrier reflects ${ref} damage!`); }
      }
      if (crusaderBastionOfFaith > 0 && hero?.class?.name === 'Crusader') {
        bDmg = Math.max(1, bDmg - Math.floor(bDmg * GAME_CONSTANTS.TACTICAL_SKILLS.Crusader.defenseBonus));
      }

      setPlayerFlash(true);
      sounds.playerDamage();
      setTimeout(() => setPlayerFlash(false), 200);
      setHp(cur => { const n = Math.max(0, cur - bDmg); if (n <= 0) setTimeout(() => { addLog('💀 You fall! Roll for death!'); enterDyingState(); }, 500); return n; });
      addLog(`💥 Boss strikes! -${bDmg} HP`);

      if (crusaderHolyEmpowerment > 0) setCrusaderHolyEmpowerment(prev => { const n = prev - 1; if (n === 0) addLog(`✙ Holy Empowerment fades...`); return n; });
      if (knightBloodOathTurns > 0) setKnightBloodOathTurns(prev => { const n = prev - 1; if (n === 0) { addLog(`⚔️ Blood Oath fades...`); setKnightConsecutiveUses(0); } return n; });
      if (knightRallyingRoar > 0) setKnightRallyingRoar(prev => { const n = prev - 1; if (n === 0) addLog(`⚔️ Rallying Roar fades...`); return n; });
      if (wizardEtherealBarrier > 0) setWizardEtherealBarrier(prev => { const n = prev - 1; if (n === 0) addLog(`✨ Ethereal Barrier fades...`); return n; });
      if (assassinMarkForDeath > 0) setAssassinMarkForDeath(prev => { const n = prev - 1; if (n === 0) addLog(`☠️ Mark for Death fades...`); return n; });
      if (crusaderBastionOfFaith > 0) setCrusaderBastionOfFaith(prev => { const n = prev - 1; if (n === 0) addLog(`✙ Bastion of Faith fades...`); return n; });
    }, enemyDelay);
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
    enemyDef += Math.floor((currentDay - 1) * GAME_CONSTANTS.ENEMY_DEFENSE_DAY_SCALE);
    enemyDef = Math.floor(enemyDef * (currentBattleCreature?.rolledDefMult ?? 1));

    // Assassin Mark for Death: Reduce enemy defense by 20%
    if (assassinMarkForDeath > 0 && hero?.class?.name === 'Assassin') {
      enemyDef = Math.floor(enemyDef * (1 - GAME_CONSTANTS.TACTICAL_SKILLS.Assassin.defenseReduction));
    }
    
    // Calculate base damage with Crushing Blow multiplier
    const rawDamage = getBaseAttack() + (weaponOilActive ? 5 : 0) + Math.floor(Math.random() * 10);
    
    // Crit system
    let critChance = GAME_CONSTANTS.CRIT_SYSTEM.baseCritChance;
    let critMultiplier = GAME_CONSTANTS.CRIT_SYSTEM.baseCritMultiplier;
    
    // Add weapon and ring affixes to crit
    if (equippedWeapon && equippedWeapon.affixes) {
      if (equippedWeapon.affixes.critChance) {
        critChance += equippedWeapon.affixes.critChance;
      }
      if (equippedWeapon.affixes.critMultiplier) {
        critMultiplier += equippedWeapon.affixes.critMultiplier;
      }
    }
    if (equippedTome?.affixes?.critChance) {
      critChance += equippedTome.affixes.critChance;
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
    
    const newBossHp = godMode ? 0 : Math.max(0, bossHp - finalDamage);
    setBossHp(newBossHp);
    
    addLog(`⚔️ CRUSHING BLOW! Dealt ${finalDamage} damage!`);
    bonusMessages.forEach(msg => addLog(msg));
    
    setBossFlash(true);
    setTimeout(() => setBossFlash(false), 200);
    
    if (newBossHp <= 0) {
      if (advanceFinalBossPhase()) return;
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
      
      setXp(x => x + Math.round(xpGain * dayBonuses.xpMultiplier));
      setGold(e => e + Math.round(goldGain * (1 + Math.max(0, Math.floor(((hero?.abilities?.cha || 10) - 10) / 2)) * 0.05)));
      
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
        setGuildPoints(p => p + 15);
        setContractFulfilled({ xpEarned: GAME_CONSTANTS.XP_REWARDS.miniBoss, tier: 'platinum' });
        addLog('Today\'s elite trial complete. Curse will be cleared at midnight.');
      }

      if (isBanditWave) {
        const nextIdx = banditLineupIdxRef.current + 1;
        const lineup = banditLineupRef.current;
        const defeatedEnemy = lineup[banditLineupIdxRef.current];
        if (defeatedEnemy?.isCapt) {
          const captIdx = BANDIT_POOL.captains.findIndex(c => c.name === defeatedEnemy.name);
          if (captIdx !== -1) setBanditCaptainsDefeated(prev => prev.includes(captIdx) ? prev : [...prev, captIdx]);
        }
        if (nextIdx < lineup.length) {
          addLog(`Next bandit incoming...`);
          setTimeout(() => spawnBanditEnemy(lineup[nextIdx], nextIdx, lineup.length), 1500);
          return;
        }
        setXp(x => x + 20);
        addLog(`Bandit wave cleared! +20 bonus XP`);
        const totalDefeated = banditCaptainsDefeated.length + (defeatedEnemy?.isCapt ? 1 : 0);
        if (totalDefeated >= 3 && !defeatedEnemy?.isLeader) {
          addLog(`All captains have fallen... Cutter emerges!`);
          const leader = { ...BANDIT_POOL.leader, isCapt: false, isLeader: true };
          banditLineupRef.current = [leader];
          setTimeout(() => spawnBanditEnemy(leader, 0, 1), 2000);
          return;
        }
        setIsBanditWave(false);
        setBattling(false);
        setBattleMode(false);
        generateVictoryLoot(battleType, isFinalBoss, goldGain, waveGoldTotal + goldGain);
        return;
      }

      if (isDaughtersWave) {
        const nextIdx = daughtersLineupIdxRef.current + 1;
        const lineup = daughtersLineupRef.current;
        const defeatedEnemy = lineup[daughtersLineupIdxRef.current];
        if (defeatedEnemy?.isCapt) {
          const captIdx = DAUGHTERS_POOL.captains.findIndex(c => c.name === defeatedEnemy.name);
          if (captIdx !== -1) setDaughtersCaptainsDefeated(prev => prev.includes(captIdx) ? prev : [...prev, captIdx]);
        }
        if (nextIdx < lineup.length) {
          addLog(`The next Daughter steps forward...`);
          setTimeout(() => spawnDaughtersEnemy(lineup[nextIdx], nextIdx, lineup.length), 1500);
          return;
        }
        setXp(x => x + 20);
        addLog(`The Daughters retreat into the dark! +20 bonus XP`);
        const totalDefeated = daughtersCaptainsDefeated.length + (defeatedEnemy?.isCapt ? 1 : 0);
        if (totalDefeated >= 3 && !defeatedEnemy?.isLeader) {
          addLog(`All captains fallen... Mira, the Dusk Queen, reveals herself!`);
          const leader = { ...DAUGHTERS_POOL.leader, isCapt: false, isLeader: true };
          daughtersLineupRef.current = [leader];
          setTimeout(() => spawnDaughtersEnemy(leader, 0, 1), 2000);
          return;
        }
        setIsDaughtersWave(false);
        setBattling(false);
        setBattleMode(false);
        generateVictoryLoot(battleType, isFinalBoss, goldGain, waveGoldTotal + goldGain);
        return;
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
      // WIS damage reduction
      const _wisMod2 = hero?.abilities ? Math.max(0, Math.floor((hero.abilities.wis - 10) / 2)) : 0;
      if (_wisMod2 > 0) bossDamage = Math.max(1, Math.floor(bossDamage * (1 - _wisMod2 * 0.02)));
      // DEX dodge
      const _dexMod2 = hero?.abilities ? Math.max(0, Math.floor((hero.abilities.dex - 10) / 2)) : 0;
      if (_dexMod2 > 0 && Math.random() < Math.min(0.20, _dexMod2 * 0.03)) {
        addLog(`⚡ You dodge the attack! (DEX)`);
        return;
      }
      
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
              addLog('Enemy is no longer ENRAGED');
            }
            return newTurns;
          });
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
            addLog('💀 You fall! Roll for death!');
            enterDyingState();
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
            addLog('Enemy is no longer ENRAGED');
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
    enemyDef += Math.floor((currentDay - 1) * GAME_CONSTANTS.ENEMY_DEFENSE_DAY_SCALE);
    enemyDef = Math.floor(enemyDef * (currentBattleCreature?.rolledDefMult ?? 1));

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
    
    const newBossHp = godMode ? 0 : Math.max(0, bossHp - finalDamage);
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
    
    if (newBossHp <= 0) {
      if (advanceFinalBossPhase()) return;
      // Victory - simplified version
      setTimeout(() => {
        setCurrentAnimation('battle-shake');
        setTimeout(() => setCurrentAnimation(null), 250);
      }, 100);

      setRecklessStacks(0);
      
      let xpGain = isFinalBoss ? GAME_CONSTANTS.XP_REWARDS.finalBoss : (battleType === 'elite' ? GAME_CONSTANTS.XP_REWARDS.miniBoss : 10);
      let goldGain = isFinalBoss ? 100 : (battleType === 'elite' ? 50 : 10);
      
      setXp(x => x + Math.round(xpGain * dayBonuses.xpMultiplier));
      setGold(e => e + Math.round(goldGain * (1 + Math.max(0, Math.floor(((hero?.abilities?.cha || 10) - 10) / 2)) * 0.05)));
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
      // WIS damage reduction
      const _wisMod3 = hero?.abilities ? Math.max(0, Math.floor((hero.abilities.wis - 10) / 2)) : 0;
      if (_wisMod3 > 0) bossDamage = Math.max(1, Math.floor(bossDamage * (1 - _wisMod3 * 0.02)));
      // DEX dodge
      const _dexMod3 = hero?.abilities ? Math.max(0, Math.floor((hero.abilities.dex - 10) / 2)) : 0;
      if (_dexMod3 > 0 && Math.random() < Math.min(0.20, _dexMod3 * 0.03)) {
        addLog(`⚡ You dodge the attack! (DEX)`);
        return;
      }
      
      // Bastion of Faith: +20% defense (reduce incoming damage)
      if (crusaderBastionOfFaith > 0) {
        const reduction = Math.floor(bossDamage * GAME_CONSTANTS.TACTICAL_SKILLS.Crusader.defenseBonus);
        bossDamage = Math.max(1, bossDamage - reduction);
      }
      
      setHp(currentHp => {
        const newHp = Math.max(0, currentHp - bossDamage);
        if (newHp <= 0) {
          setTimeout(() => {
            addLog('💀 You fall! Roll for death!');
            enterDyingState();
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
      // WIS damage reduction
      const _wisMod4 = hero?.abilities ? Math.max(0, Math.floor((hero.abilities.wis - 10) / 2)) : 0;
      if (_wisMod4 > 0) bossDamage = Math.max(1, Math.floor(bossDamage * (1 - _wisMod4 * 0.02)));
      // DEX dodge
      const _dexMod4 = hero?.abilities ? Math.max(0, Math.floor((hero.abilities.dex - 10) / 2)) : 0;
      if (_dexMod4 > 0 && Math.random() < Math.min(0.20, _dexMod4 * 0.03)) {
        addLog(`⚡ You dodge the attack! (DEX)`);
        return;
      }
      
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
            addLog('💀 You fall! Roll for death!');
            enterDyingState();
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
    setVictoryLoot([]);
    setVictoryChest(null); // No loot when fleeing
    setHasFled(true); // Mark that we fled
    setIsEliteWave(false);
    setIsOrderFinal(false);
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
  

  const shakedownEnemy = () => {
    const day = Math.max(1, currentDay || 1);
    const goldGained = Math.floor(5 + Math.random() * day * 3);
    setGold(g => g + goldGained);
    addLog(`You shake down the weakened creature for ${goldGained} gold!`);
    return goldGained;
  };

  const captureMonster = (bossName, bossHpPct, battleType, isFinalBoss, img, preRolledStats) => {
    if (capturedMonsters.length >= 4) {
      addLog('Your stable is full! Release a monster first.');
      return { success: false, reason: 'full' };
    }
    // No resource cost — success purely determined by stats + enemy HP
    // WIS improves persuasion, CHA improves rapport; lower enemy HP = much better odds
    const wisMod = Math.floor(((hero?.abilities?.wis || 10) - 10) / 2);
    const chaMod = Math.floor(((hero?.abilities?.cha || 10) - 10) / 2);
    const statBonus = (wisMod + chaMod) * 0.06; // each point above 10 adds ~3% per stat
    const hpBonus = (1 - bossHpPct) * 0.55;     // up to +55% when near death
    const chance = Math.min(0.92, 0.15 + hpBonus + statBonus);
    const success = Math.random() < chance;
    if (success) {
      // Derive tier: use creature's actual tier if available, else fall back to battle type
      const tier = currentBattleCreature?.tier ?? (isFinalBoss ? 5 : battleType === 'elite' ? 4 : 1);
      const quality = currentBattleCreature?.roll ?? null;
      const stats = preRolledStats || (() => {
        const roll = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
        const ranges = {
          1: { hp:[40,120],   atk:[5,14],   def:[3,10],  spd:[4,10],  mag:[2,8]   },
          2: { hp:[100,220],  atk:[12,28],  def:[8,20],  spd:[8,16],  mag:[8,20]  },
          3: { hp:[180,380],  atk:[20,45],  def:[15,30], spd:[12,22], mag:[15,35] },
          4: { hp:[180,380],  atk:[18,38],  def:[14,28], spd:[10,20], mag:[12,28] },
          5: { hp:[500,900],  atk:[55,95],  def:[40,65], spd:[18,35], mag:[40,80] },
        };
        const r = ranges[tier] || ranges[1];
        return { hp: roll(...r.hp), atk: roll(...r.atk), def: roll(...r.def), spd: roll(...r.spd), mag: roll(...r.mag) };
      })();
      const monster = { id: Date.now(), name: bossName, tier, img, stats, quality };
      setCapturedMonsters(prev => [...prev, monster]);
      addLog(`${bossName} has been captured! Added to your stable.`);
      return { success: true, chance: Math.round(chance * 100) };
    } else {
      addLog(`${bossName} resisted capture! The creature breaks free.`);
      return { success: false, reason: 'resisted', chance: Math.round(chance * 100) };
    }
  };

  const releaseMonster = (id) => {
    setCapturedMonsters(prev => prev.filter(m => m.id !== id));
    addLog('Monster released back into the wild.');
  };

  const negotiate = (method, bribeAmount = 0) => {
    const wisMod = Math.floor(((hero.abilities?.wis || 10) - 10) / 2);

    let success = false;
    let resultLine = '';

    if (method === 'persuade') {
      const chance = Math.max(0.05, 0.30 + wisMod * 0.08);
      success = Math.random() < chance;
      resultLine = success
        ? `...You remind me of something I once knew. Go. Before I change my mind.`
        : `Mercy is for the living. You are already dead.`;
    } else if (method === 'bribe') {
      if (gold < bribeAmount) {
        addLog(`Not enough gold. The shadow demands ${bribeAmount}g.`);
        setEnemyDialogue(`Gold? You insult me with empty hands.`);
        return { success: false, enraged: false };
      }
      setGold(g => g - bribeAmount);
      success = true;
      resultLine = `Gold. How predictable. But... acceptable.`;
    }

    if (success) {
      const loot = method === 'bribe'
        ? [`-${bribeAmount} Gold`, 'Shadow Dismissed', '✓ Survived']
        : ['Shadow Dismissed', '✓ Survived'];
      setEnemyDialogue(resultLine);
      addLog(`You survived by ${method === 'bribe' ? 'gold' : 'words'}.`);
      setVictoryLoot(loot);
      setBossHp(0);
      setBattling(false);
      setBattleMode(false);
      setKnightConsecutiveUses(0);
      setKnightCrushingBlowCooldown(false);
      setCrusaderSmiteCooldown(false);
      setRecklessStacks(0);
      return { success: true, enraged: false };
    } else {
      setEnemyDialogue(resultLine);
      isBanditWave ? sounds.banditLaugh() : sounds.negotiateFail();
      return { success: false, enraged: true };
    }
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

      setCurseOverlay({ level: 4, name: 'THE ABYSS CLAIMS YOUR SOUL', isFinal: true });
      setTimeout(() => setCurseOverlay(null), 3000);

      addLog('FOUR CURSES. The abyss claims your soul...');
      
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
      setEquippedGrimoire(null);
      setGrimoireInventory([]);
      setEquippedTome(null);
      setTomeInventory([]);
      
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
      const curseName = curseNames[newCurseLevel - 1];
      setCurseOverlay({ level: newCurseLevel, name: curseName, isFinal: false });
      setTimeout(() => setCurseOverlay(null), 2600);

      addLog(`You have fallen... The abyss marks you.`);
      addLog(`${curseName}! (Curse Level ${newCurseLevel}/3)`);

      if (newCurseLevel === 3) {
        addLog('WARNING: One more death and your soul is forfeit.');
      }
    }
  };


// PART 3 OF 6 - Copy this after part 2

  // Death save entry point — guards against re-entry with a ref
  const enterDyingState = () => {
    if (enterDyingRef.current) return;
    enterDyingRef.current = true;
    setIsDying(true);
  };

  const handleDeathSaveClose = (survived) => {
    enterDyingRef.current = false;
    setIsDying(false);
    if (survived) {
      setHp(1);
      addLog('💪 You stabilize at 1 HP! Fight on!');
    } else {
      die();
    }
  };

  const handleASIConfirm = (updatedAbilities) => {
    setHero(prev => {
      const gained = Object.entries(updatedAbilities)
        .filter(([k, v]) => v > (prev.abilities?.[k] ?? 0))
        .map(([k]) => k.toUpperCase()).join(' & ');
      addLog(`\u2b06\ufe0f ASI: ${gained || 'stat'} increased!`);
      return { ...prev, abilities: updatedAbilities };
    });
    setAsiPending(null);
  };

  const advance = () => {
    if (isFinalBoss && bossHp <= 0) {
      // Gauntlet defeated - lock until next milestone
      setGauntletUnlocked(false);
      setGauntletMilestone(m => m + 1500);
      setGuildPoints(p => p + 30);
      setContractFulfilled({ xpEarned: GAME_CONSTANTS.XP_REWARDS.finalBoss, tier: 'mythril' });
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
        setGuildPoints(p => p + 15);
        setContractFulfilled({ xpEarned: GAME_CONSTANTS.XP_REWARDS.miniBoss, tier: 'platinum' });
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
  }`} style={{ fontFamily: "'Cinzel', serif", background: 'linear-gradient(to bottom, #0A0907, #111009)' }}>
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
        @keyframes title-pulse {
          0%, 100% { filter: brightness(1); }
          50% { filter: brightness(1.25); }
        }
        @keyframes intro-slam {
          0% { opacity: 0; transform: scale(1.5); filter: blur(10px); }
          55% { opacity: 1; filter: blur(0px); }
          100% { opacity: 1; transform: scale(1); filter: blur(0px); }
        }
        @keyframes intro-fade-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes intro-hint-pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.9; }
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
        @keyframes day-banner-bg {
          0% { opacity: 0; }
          15% { opacity: 1; }
          70% { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes day-banner-slam {
          0% { opacity: 0; transform: scale(2.2); filter: blur(12px); }
          30% { opacity: 1; filter: blur(0); }
          70% { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(0.95); }
        }
        @keyframes day-banner-sub {
          0%, 20% { opacity: 0; transform: translateY(14px); }
          40% { opacity: 1; transform: translateY(0); }
          75% { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes curse-bg {
          0% { opacity: 0; }
          12% { opacity: 1; }
          72% { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes curse-slam {
          0% { opacity: 0; transform: scale(1.8) skewX(-4deg); filter: blur(8px); }
          25% { opacity: 1; filter: blur(0); }
          65% { opacity: 1; transform: scale(1) skewX(0deg); }
          100% { opacity: 0; transform: scale(0.92); }
        }
        @keyframes curse-sub {
          0%, 22% { opacity: 0; transform: translateY(10px); }
          40% { opacity: 1; transform: translateY(0); }
          70% { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes loot-fanfare-bg {
          0% { opacity: 0; }
          12% { opacity: 1; }
          68% { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes loot-fanfare-card {
          0% { opacity: 0; transform: translateY(28px) scale(0.93); }
          22% { opacity: 1; transform: translateY(0) scale(1); }
          70% { opacity: 1; }
          100% { opacity: 0; transform: translateY(-10px) scale(0.97); }
        }
        @keyframes loot-fanfare-label {
          0%, 10% { opacity: 0; transform: translateY(6px); }
          28% { opacity: 1; transform: translateY(0); }
          70% { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes loot-fanfare-glow {
          0% { opacity: 0; transform: scale(0.6); }
          30% { opacity: 1; transform: scale(1.05); }
          65% { opacity: 0.6; transform: scale(1); }
          100% { opacity: 0; }
        }
        @keyframes levelup-bg {
          0% { opacity: 0; }
          10% { opacity: 1; }
          72% { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes levelup-burst {
          0% { opacity: 0; transform: scale(0.4); }
          30% { opacity: 0.35; transform: scale(1.1); }
          65% { opacity: 0.18; transform: scale(1); }
          100% { opacity: 0; }
        }
        @keyframes levelup-label {
          0% { opacity: 0; transform: translateY(-8px) scale(0.9); }
          18% { opacity: 1; transform: translateY(0) scale(1); }
          72% { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes levelup-number {
          0% { opacity: 0; transform: scale(2.4); filter: blur(14px); }
          28% { opacity: 1; filter: blur(0); }
          68% { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(0.94); }
        }
        @keyframes levelup-sub {
          0%, 26% { opacity: 0; transform: translateY(12px); }
          42% { opacity: 1; transform: translateY(0); }
          72% { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes levelup-skill {
          0%, 40% { opacity: 0; transform: translateY(8px); }
          55% { opacity: 1; transform: translateY(0); }
          75% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>

      {/* ── Intro / menu overlay — one screen, title never moves ── */}
      {introPhase !== 'done' && (
        <div
          onClick={introPhase === 'visible' ? () => {
            audioManager.play(TRACKS.nightVigil);
            setIntroPhase(supabaseUserRef.current ? 'revealed' : 'mode-select');
          } : undefined}
          style={{
            position: 'fixed', inset: 0, zIndex: 200,
            background: 'radial-gradient(ellipse at center, #1a0000 0%, #0d0000 45%, #000000 100%)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            opacity: introPhase === 'fading' ? 0 : 1,
            transition: 'opacity 0.8s ease-in-out',
            cursor: introPhase === 'visible' ? 'pointer' : 'default',
            pointerEvents: introPhase === 'fading' ? 'none' : 'auto',
            overflow: 'hidden',
            userSelect: 'none',
          }}
        >
          {/* Atmospheric scanlines */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px)',
          }} />

          {/* Radial red glow */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: 'radial-gradient(ellipse at 50% 38%, rgba(140,0,0,0.22) 0%, transparent 60%)',
          }} />

          {/* ── Narration screen ── */}
          {narrationActive && (
            <div
              onClick={() => {
                if (narrationIndex < NARRATION_PAGES.length - 1) {
                  setNarrationIndex(i => i + 1);
                } else {
                  introTimers.current.forEach(clearTimeout);
                  setCharCreateStep(0);
                  setCharCreateName('');
                  setCharCreateClass(null);
                  setNarrationActive(false);
                  setCharCreateActive(true);
                }
              }}
              style={{
                position: 'absolute', inset: 0, zIndex: 1,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', padding: '48px 32px',
              }}
            >
              {/* Skip */}
              <button
                onClick={e => {
                  e.stopPropagation();
                  introTimers.current.forEach(clearTimeout);
                  setCharCreateStep(0);
                  setCharCreateName('');
                  setCharCreateClass(null);
                  setNarrationActive(false);
                  setCharCreateActive(true);
                }}
                style={{
                  position: 'absolute', top: '24px', right: '28px',
                  fontFamily: "'Cinzel', serif", fontSize: '0.65rem',
                  letterSpacing: '0.25em', textTransform: 'uppercase',
                  color: 'rgba(180,180,180,0.3)', background: 'none', border: 'none',
                  cursor: 'pointer', transition: 'color 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = 'rgba(220,220,220,0.7)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(180,180,180,0.3)'; }}
              >
                Skip ›
              </button>

              {/* Narration text — key forces re-animation on each page */}
              <div
                key={narrationIndex}
                style={{ maxWidth: '580px', textAlign: 'center', animation: 'intro-fade-up 0.8s ease-out both' }}
              >
                <p style={{
                  fontFamily: "'Cinzel', serif",
                  fontSize: 'clamp(0.9rem, 2.2vw, 1.1rem)',
                  lineHeight: 2,
                  letterSpacing: '0.04em',
                  color: 'rgba(210,190,170,0.82)',
                  whiteSpace: 'pre-line',
                  textShadow: 'none',
                }}>
                  {NARRATION_PAGES[narrationIndex]}
                </p>
              </div>

              {/* Progress dots */}
              <div style={{ display: 'flex', gap: '7px', marginTop: '52px' }}>
                {NARRATION_PAGES.map((_, i) => (
                  <div key={i} style={{
                    width: i === narrationIndex ? '18px' : '5px',
                    height: '5px',
                    borderRadius: '3px',
                    background: i === narrationIndex ? 'rgba(212,175,55,0.75)' : 'rgba(255,255,255,0.12)',
                    transition: 'all 0.4s ease',
                  }} />
                ))}
              </div>

              {/* Continue hint */}
              <p style={{
                position: 'absolute', bottom: '28px',
                fontFamily: "'Cinzel', serif", fontSize: '0.58rem',
                letterSpacing: '0.3em', textTransform: 'uppercase',
                color: 'rgba(212,175,55,0.3)',
                animation: 'intro-hint-pulse 2.5s ease-in-out 1.2s infinite',
              }}>
                {narrationIndex < NARRATION_PAGES.length - 1 ? '✦ click to continue ✦' : '✦ click to begin your journey ✦'}
              </p>
            </div>
          )}

          {/* ── Character Creation ── */}
          {charCreateActive && (
            <div style={{ position: 'absolute', inset: 0, zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 32px' }}>

              {/* Step 0: Name */}
              {charCreateStep === 0 && (
                <div key="cc-name" style={{ maxWidth: '520px', width: '100%', textAlign: 'center', animation: 'intro-fade-up 0.7s ease-out both' }}>
                  <p style={{ fontFamily: "'Cinzel', serif", fontSize: 'clamp(0.75rem, 1.8vw, 0.9rem)', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.5)', marginBottom: '28px' }}>
                    ✶ The Narrator Speaks ✶
                  </p>
                  <p style={{ fontFamily: "'Cinzel', serif", fontSize: 'clamp(1rem, 2.5vw, 1.25rem)', lineHeight: 1.9, letterSpacing: '0.04em', color: 'rgba(210,190,170,0.88)', whiteSpace: 'pre-line', marginBottom: '40px' }}>
                    {"Before you step into the darkness,\n\nI must know your name.\n\nWhat shall history remember you as?"}
                  </p>
                  <input
                    type="text"
                    placeholder="Enter your name..."
                    value={charCreateName}
                    onChange={e => setCharCreateName(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && charCreateName.trim()) setCharCreateStep(1); }}
                    maxLength={30}
                    autoFocus
                    style={{
                      fontFamily: "'Cinzel', serif", fontSize: '1.1rem', letterSpacing: '0.1em',
                      textAlign: 'center', width: '100%', maxWidth: '360px',
                      padding: '14px 20px', background: 'rgba(0,0,0,0.5)',
                      border: '1px solid rgba(212,175,55,0.35)', borderRadius: '4px',
                      color: '#F5F5DC', outline: 'none', marginBottom: '24px',
                    }}
                    onFocus={e => { e.target.style.borderColor = 'rgba(212,175,55,0.75)'; }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(212,175,55,0.35)'; }}
                  />
                  <br />
                  <button
                    onClick={() => { if (charCreateName.trim()) setCharCreateStep(1); }}
                    disabled={!charCreateName.trim()}
                    style={{
                      fontFamily: "'Cinzel', serif", fontWeight: 700,
                      fontSize: '0.8rem', letterSpacing: '0.3em', textTransform: 'uppercase',
                      color: charCreateName.trim() ? 'rgba(212,175,55,0.85)' : 'rgba(212,175,55,0.25)',
                      background: 'none', border: 'none', cursor: charCreateName.trim() ? 'pointer' : 'default',
                      transition: 'all 0.25s', padding: '8px 0',
                    }}
                    onMouseEnter={e => { if (charCreateName.trim()) e.currentTarget.style.color = '#D4AF37'; }}
                    onMouseLeave={e => { if (charCreateName.trim()) e.currentTarget.style.color = 'rgba(212,175,55,0.85)'; }}
                  >
                    ✶ Continue ✶
                  </button>
                </div>
              )}

              {/* Step 1: Class Selection */}
              {charCreateStep === 1 && (() => {
                const CLASS_LORE = {
                  Knight:   'Strength without knowledge breaks. You carry the lessons the fallen left behind.',
                  Wizard:   'Every page turned is a blow against the dark. Knowledge is your only real weapon.',
                  Assassin: 'The darkness buries what it fears. You recover what others let die.',
                  Crusader: 'Faith without discipline is hollow. Your light is earned, not given.',
                };
                const CC_CLASSES = [
                  { name: 'Knight',   emblem: '⚔︎', color: '#c0392b' },
                  { name: 'Wizard',   emblem: '✶',  color: '#2980b9' },
                  { name: 'Assassin', emblem: '†',  color: '#27ae60' },
                  { name: 'Crusader', emblem: '✙',  color: '#bdc3c7' },
                ];
                return (
                  <div key="cc-class" style={{ maxWidth: '600px', width: '100%', textAlign: 'center', animation: 'intro-fade-up 0.7s ease-out both' }}>
                    <p style={{ fontFamily: "'Cinzel', serif", fontSize: 'clamp(0.75rem, 1.8vw, 0.9rem)', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.5)', marginBottom: '20px' }}>
                      ✶ The Narrator Speaks ✶
                    </p>
                    <p style={{ fontFamily: "'Cinzel', serif", fontSize: 'clamp(0.95rem, 2.2vw, 1.15rem)', lineHeight: 1.9, letterSpacing: '0.04em', color: 'rgba(210,190,170,0.88)', marginBottom: '32px' }}>
                      {charCreateName.trim()}, the flame needs a wielder.<br />What is your profession?
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                      {CC_CLASSES.map(cls => (
                        <button
                          key={cls.name}
                          onClick={() => setCharCreateClass(cls)}
                          style={{
                            fontFamily: "'Cinzel', serif", textAlign: 'center',
                            padding: '16px 18px',
                            background: charCreateClass && charCreateClass.name === cls.name ? 'rgba(212,175,55,0.08)' : 'rgba(0,0,0,0.4)',
                            border: charCreateClass && charCreateClass.name === cls.name ? '1px solid rgba(212,175,55,0.6)' : '1px solid rgba(255,255,255,0.08)',
                            borderRadius: '4px', cursor: 'pointer', transition: 'all 0.2s',
                          }}
                          onMouseEnter={e => { if (!charCreateClass || charCreateClass.name !== cls.name) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.background = 'rgba(0,0,0,0.55)'; } }}
                          onMouseLeave={e => { if (!charCreateClass || charCreateClass.name !== cls.name) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.background = 'rgba(0,0,0,0.4)'; } }}
                        >
                          <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                            <span style={{ fontWeight: 700, fontSize: '0.95rem', letterSpacing: '0.12em', color: '#F5F5DC' }}>{cls.name}</span>
                          </div>
                          <p style={{ fontSize: '0.7rem', lineHeight: 1.6, color: 'rgba(180,165,150,0.7)', letterSpacing: '0.02em', margin: 0, textAlign: 'center' }}>
                            {CLASS_LORE[cls.name]}
                          </p>
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => { if (charCreateClass) { setCharCreateGender(null); setCharCreateStep(2); } }}
                      disabled={!charCreateClass}
                      style={{
                        fontFamily: "'Cinzel', serif", fontWeight: 700,
                        fontSize: '0.8rem', letterSpacing: '0.3em', textTransform: 'uppercase',
                        color: charCreateClass ? 'rgba(212,175,55,0.85)' : 'rgba(212,175,55,0.25)',
                        background: 'none', border: 'none', cursor: charCreateClass ? 'pointer' : 'default',
                        transition: 'all 0.25s', padding: '8px 0',
                      }}
                      onMouseEnter={e => { if (charCreateClass) e.currentTarget.style.color = '#D4AF37'; }}
                      onMouseLeave={e => { if (charCreateClass) e.currentTarget.style.color = 'rgba(212,175,55,0.85)'; }}
                    >
                      ✶ Confirm ✶
                    </button>
                  </div>
                );
              })()}

              {/* Step 2: Gender Selection */}
              {charCreateStep === 2 && (() => {
                const PORTRAIT_MAP = {
                  Knight:   { m: '/npcs/knight-m.png',   f: '/npcs/knight-f.png'   },
                  Wizard:   { m: '/npcs/sorcerer-m.png', f: '/npcs/sorcerer-f.png' },
                  Assassin: { m: '/npcs/thief-m.png',    f: '/npcs/thief-f.png'    },
                  Crusader: { m: '/npcs/crusader-m.png', f: '/npcs/crusader-f.png' },
                };
                const portraits = charCreateClass ? (PORTRAIT_MAP[charCreateClass.name] || PORTRAIT_MAP.Knight) : PORTRAIT_MAP.Knight;
                return (
                  <div key="cc-gender" style={{ maxWidth: '520px', width: '100%', textAlign: 'center', animation: 'intro-fade-up 0.7s ease-out both' }}>
                    <p style={{ fontFamily: "'Cinzel', serif", fontSize: 'clamp(0.75rem, 1.8vw, 0.9rem)', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.5)', marginBottom: '20px' }}>
                      ✶ The Narrator Speaks ✶
                    </p>
                    <p style={{ fontFamily: "'Cinzel', serif", fontSize: 'clamp(0.95rem, 2.2vw, 1.15rem)', lineHeight: 1.9, letterSpacing: '0.04em', color: 'rgba(210,190,170,0.88)', marginBottom: '32px' }}>
                      Who steps forward to carry the flame?
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '32px' }}>
                      {[{ key: 'm', label: 'Male' }, { key: 'f', label: 'Female' }].map(({ key, label }) => (
                        <button
                          key={key}
                          onClick={() => { setCharCreateGender(key); setCharCreateStep(3); }}
                          style={{
                            background: 'rgba(0,0,0,0.4)', border: `2px solid ${charCreateClass ? charCreateClass.color : 'rgba(212,175,55,0.4)'}`,
                            borderRadius: '8px', padding: '16px 12px', cursor: 'pointer',
                            transition: 'all 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.6)'; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 8px 24px rgba(0,0,0,0.5)`; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.4)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                        >
                          <img
                            src={portraits[key]}
                            alt={label}
                            style={{ width: '140px', height: '140px', objectFit: 'cover', objectPosition: 'top', borderRadius: '6px', border: `1px solid ${charCreateClass ? charCreateClass.color : 'rgba(212,175,55,0.4)'}` }}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Step 3: Closing Message */}
              {charCreateStep === 3 && (() => {
                const CLASS_SENDOFF = {
                  Knight:   'A Knight who never stops learning is the only kind the world remembers.',
                  Wizard:   'Every page you turn is a spell cast against the darkness.',
                  Assassin: 'What you recover from the shadows may be the last light the world has left.',
                  Crusader: 'Your faith will be tested. Let your knowledge be the answer.',
                };
                const sendoff = charCreateClass ? (CLASS_SENDOFF[charCreateClass.name] || '') : '';
                const fullClasses = [
                  { name: 'Knight',   color: 'red',   emblem: '⚔︎', gradient: ['from-red-900','from-red-800','from-red-700','from-red-600'],    glow: ['shadow-red-900/50','shadow-red-700/60','shadow-red-600/70','shadow-red-500/80'] },
                  { name: 'Wizard',   color: 'blue',  emblem: '✶',  gradient: ['from-blue-700','from-blue-600','from-blue-500','from-blue-400'],  glow: ['shadow-blue-700/60','shadow-blue-600/70','shadow-blue-500/80','shadow-blue-400/90'] },
                  { name: 'Assassin', color: 'green', emblem: '†',  gradient: ['from-green-900','from-green-800','from-green-700','from-green-600'], glow: ['shadow-green-900/50','shadow-green-700/60','shadow-green-600/70','shadow-green-500/80'] },
                  { name: 'Crusader', color: 'white', emblem: '✙', gradient: ['from-gray-100','from-gray-50','from-white','from-white'],          glow: ['shadow-gray-200/80','shadow-gray-100/90','shadow-white/95','shadow-white/100'] },
                ];
                return (
                  <div
                    key="cc-closing"
                    onClick={() => {
                      const fullClass = fullClasses.find(c => c.name === (charCreateClass && charCreateClass.name)) || null;
                      setHero(prev => ({
                        ...prev,
                        name: charCreateName.trim() || prev.name,
                        class: fullClass || prev.class,
                        gender: charCreateGender || 'm',
                      }));
                      introTimers.current.forEach(clearTimeout);
                      audioManager.play(TRACKS.midnightTale);
                      setIntroPhase('fading');
                      const t = setTimeout(() => {
                        setCharCreateActive(false);
                        setIntroPhase('done');
                      }, 900);
                      introTimers.current = [t];
                    }}
                    style={{ maxWidth: '560px', width: '100%', textAlign: 'center', cursor: 'pointer', animation: 'intro-fade-up 0.7s ease-out both' }}
                  >
                    <p style={{ fontFamily: "'Cinzel', serif", fontSize: 'clamp(0.75rem, 1.8vw, 0.9rem)', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.5)', marginBottom: '28px' }}>
                      ✶ The Narrator Speaks ✶
                    </p>
                    <p style={{ fontFamily: "'Cinzel', serif", fontSize: 'clamp(1rem, 2.4vw, 1.2rem)', lineHeight: 2, letterSpacing: '0.04em', color: 'rgba(245,245,220,0.93)', whiteSpace: 'pre-line', marginBottom: '12px', textShadow: '0 0 30px rgba(200,30,30,0.35)' }}>
                      {charCreateName.trim() + ".\n\n" + sendoff + "\n\nHave faith when the darkness is absolute.\nHave hope when every champion before you has failed.\nHave perseverance — because the Abyss is counting on you to stop.\n\nYour chronicle begins now."}
                    </p>
                    <p style={{ fontFamily: "'Cinzel', serif", fontSize: '0.58rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.3)', marginTop: '40px', animation: 'intro-hint-pulse 2.5s ease-in-out 1s infinite' }}>
                      ✶ click to enter the world ✶
                    </p>
                  </div>
                );
              })()}

            </div>
          )}

          {/* ── Title / menu content (hidden during narration and char creation) ── */}
          {!narrationActive && !charCreateActive && (
            <>
          {/* Title — animates once on mount, stays frozen after */}
          <div style={{ animation: 'intro-slam 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both', textAlign: 'center' }}>
            <h1 style={{
              fontFamily: "'Cinzel', serif",
              fontWeight: 900,
              fontSize: 'clamp(3.5rem, 12vw, 8rem)',
              letterSpacing: '0.12em',
              lineHeight: 1,
              color: '#F5F5DC',
              textShadow: '0 0 20px rgba(200,30,30,0.95), 0 0 55px rgba(180,0,0,0.75), 0 0 110px rgba(140,0,0,0.45), 0 3px 6px rgba(0,0,0,1)',
              animation: 'title-pulse 3s ease-in-out infinite',
            }}>CURSE OF KNOWLEDGE</h1>
          </div>

          {/* Ornament lines */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0 16px', animation: 'intro-fade-up 0.6s ease-out 1.1s both' }}>
            <div style={{ width: '180px', height: '1px', background: 'linear-gradient(to right, transparent, rgba(255,60,60,0.7))' }} />
            <span style={{ color: 'rgba(255,60,60,0.7)', fontSize: '10px', letterSpacing: '0.4em' }}>✦ ✦ ✦</span>
            <div style={{ width: '180px', height: '1px', background: 'linear-gradient(to left, transparent, rgba(255,60,60,0.7))' }} />
          </div>

          {/* Tagline */}
          <p style={{
            fontFamily: "'Cinzel', serif",
            fontSize: '0.85rem',
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: 'rgba(210,160,160,0.85)',
            animation: 'intro-fade-up 0.6s ease-out 1.4s both',
          }}>Study or be consumed by the abyss</p>

          {/* Bottom slot — cycles through: hint → menu → confirm */}
          <div style={{ marginTop: '48px', minHeight: '160px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>

            {/* Hint */}
            {introPhase === 'visible' && (
              <p style={{
                fontFamily: "'Cinzel', serif",
                fontSize: 'clamp(0.95rem, 2.5vw, 1.2rem)',
                letterSpacing: '0.35em',
                textTransform: 'uppercase',
                color: 'rgba(212,175,55,0.75)',
                animation: 'intro-fade-up 0.5s ease-out 2.8s both, intro-hint-pulse 2s ease-in-out 3.3s infinite',
              }}>✦ press enter or tap to begin ✦</p>
            )}

            {/* Mode select */}
            {introPhase === 'mode-select' && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', animation: 'intro-fade-up 0.45s ease-out both' }}>
                <p style={{
                  fontFamily: "'Cinzel', serif",
                  fontSize: 'clamp(0.6rem, 1.5vw, 0.72rem)',
                  letterSpacing: '0.28em',
                  textTransform: 'uppercase',
                  color: 'rgba(212,175,55,0.4)',
                  marginBottom: '8px',
                }}>Choose your path</p>

                <button
                  onClick={() => { setShowAuthModal(true); }}
                  style={{
                    fontFamily: "'Cinzel', serif", fontWeight: 700,
                    fontSize: 'clamp(1rem, 2.5vw, 1.3rem)', letterSpacing: '0.25em',
                    textTransform: 'uppercase', color: '#F5F5DC',
                    background: 'none', border: 'none', padding: '14px 64px',
                    cursor: 'pointer', minWidth: '300px', transition: 'all 0.25s',
                    textShadow: '0 0 16px rgba(200,30,30,0.6)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.textShadow = '0 0 28px rgba(220,50,50,1), 0 0 60px rgba(180,0,0,0.7)'; e.currentTarget.style.transform = 'scale(1.06)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = '#F5F5DC'; e.currentTarget.style.textShadow = '0 0 16px rgba(200,30,30,0.6)'; e.currentTarget.style.transform = 'scale(1)'; }}
                >
                  Play Online
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '240px' }}>
                  <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, transparent, rgba(212,175,55,0.2))' }} />
                  <span style={{ color: 'rgba(212,175,55,0.25)', fontSize: '7px' }}>◆</span>
                  <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to left, transparent, rgba(212,175,55,0.2))' }} />
                </div>

                <button
                  onClick={() => { setIntroPhase('revealed'); }}
                  style={{
                    fontFamily: "'Cinzel', serif", fontWeight: 600,
                    fontSize: 'clamp(0.85rem, 2vw, 1rem)', letterSpacing: '0.25em',
                    textTransform: 'uppercase', color: 'rgba(212,175,55,0.55)',
                    background: 'none', border: 'none', padding: '12px 64px',
                    cursor: 'pointer', minWidth: '300px', transition: 'all 0.25s',
                    textShadow: '0 0 10px rgba(212,175,55,0.2)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'rgba(212,175,55,0.9)'; e.currentTarget.style.textShadow = '0 0 20px rgba(212,175,55,0.5)'; e.currentTarget.style.transform = 'scale(1.04)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'rgba(212,175,55,0.55)'; e.currentTarget.style.textShadow = '0 0 10px rgba(212,175,55,0.2)'; e.currentTarget.style.transform = 'scale(1)'; }}
                >
                  Play Offline
                </button>
              </div>
            )}

            {/* Continue / New Adventure */}
            {(introPhase === 'revealed' || introPhase === 'fading') && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center', animation: 'intro-fade-up 0.45s ease-out both' }}>
                <button
                  onClick={() => {
                    introTimers.current.forEach(clearTimeout);
                    audioManager.play(TRACKS.midnightTale);
                    setIntroPhase('fading');
                    const t = setTimeout(() => setIntroPhase('done'), 800);
                    introTimers.current = [t];
                  }}
                  style={{
                    fontFamily: "'Cinzel', serif", fontWeight: 700,
                    fontSize: 'clamp(1.1rem, 3vw, 1.5rem)', letterSpacing: '0.25em',
                    textTransform: 'uppercase', color: '#F5F5DC',
                    background: 'none', border: 'none', padding: '16px 64px',
                    cursor: 'pointer', minWidth: '300px', transition: 'all 0.25s',
                    textShadow: '0 0 16px rgba(200,30,30,0.6)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.textShadow = '0 0 28px rgba(220,50,50,1), 0 0 60px rgba(180,0,0,0.7)'; e.currentTarget.style.transform = 'scale(1.06)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = '#F5F5DC'; e.currentTarget.style.textShadow = '0 0 16px rgba(200,30,30,0.6)'; e.currentTarget.style.transform = 'scale(1)'; }}
                >
                  Continue
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '240px' }}>
                  <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, transparent, rgba(212,175,55,0.25))' }} />
                  <span style={{ color: 'rgba(212,175,55,0.3)', fontSize: '7px' }}>◆</span>
                  <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to left, transparent, rgba(212,175,55,0.25))' }} />
                </div>

                <button
                  onClick={() => setIntroPhase('confirm')}
                  style={{
                    fontFamily: "'Cinzel', serif", fontWeight: 600,
                    fontSize: 'clamp(1rem, 2.5vw, 1.3rem)', letterSpacing: '0.25em',
                    textTransform: 'uppercase', color: 'rgba(212,175,55,0.65)',
                    background: 'none', border: 'none', padding: '16px 64px',
                    cursor: 'pointer', minWidth: '300px', transition: 'all 0.25s',
                    textShadow: '0 0 12px rgba(212,175,55,0.3)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#D4AF37'; e.currentTarget.style.textShadow = '0 0 28px rgba(212,175,55,0.9), 0 0 60px rgba(180,140,0,0.5)'; e.currentTarget.style.transform = 'scale(1.06)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'rgba(212,175,55,0.65)'; e.currentTarget.style.textShadow = '0 0 12px rgba(212,175,55,0.3)'; e.currentTarget.style.transform = 'scale(1)'; }}
                >
                  New Adventure
                </button>
              </div>
            )}

            {/* Confirmation */}
            {introPhase === 'confirm' && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', animation: 'intro-fade-up 0.35s ease-out both' }}>
                <p style={{
                  fontFamily: "'Cinzel', serif",
                  fontSize: 'clamp(0.75rem, 2vw, 0.9rem)',
                  letterSpacing: '0.15em',
                  textAlign: 'center',
                  color: 'rgba(210,160,160,0.8)',
                  maxWidth: '340px',
                  lineHeight: 1.7,
                }}>
                  Your current chronicle will be<br />erased forever. Are you certain?
                </p>

                <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
                  <button
                    onClick={() => {
                      // Full reset
                      const newHero = makeName();
                      setHero(newHero);
                      setCanCustomize(true);
                      setCurrentDay(1);
                      setHasStarted(false);
                      setHp(GAME_CONSTANTS.MAX_HP);
                      setStamina(GAME_CONSTANTS.MAX_STAMINA);
                      setXp(0);
                      setLevel(1);
                      setGold(0);
                      setCurrency(0);
                      setHealthPots(0);
                      setStaminaPots(0);
                      setCleansePots(0);
                      setWeapon(0);
                      setArmor(0);
                      setEquippedWeapon(null);
                      setWeaponInventory([]);
                      setEquippedArmor({ helmet: null, chest: null, gloves: null, boots: null });
                      setArmorInventory({ helmet: [], chest: [], gloves: [], boots: [] });
                      setEquippedGrimoire(null);
                      setEquippedTome(null);
                      setGrimoireInventory([]);
                      setTomeInventory([]);
                      setTasks([]);
                      setActiveTask(null);
                      setTimer(0);
                      setRunning(false);
                      setWeeklyPlan({ Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: [], Sunday: [] });
                      setCalendarTasks({});
                      setCalendarFocus({});
                      setCalendarEvents({});
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
                      setPlayerDebuffs({ bleedTurns: 0, bleedDamage: 0, armorShredTurns: 0 });
                      setRecklessStacks(0);
                      setLog([]);
                      setGraveyard([]);
                      setSkipCount(0);
                      setConsecutiveDays(0);
                      setLastPlayedDate(null);
                      setMiniBossCount(0);
                      setCurseLevel(0);
                      setEliteBossDefeatedToday(false);
                      setIsDayActive(false);
                      setFlashcardDecks([]);
                      setAchievementStats({ tasksCompleted: 0, studyMinutes: 0, deepWorkSessions: 0, perfectDays: 0, bossesDefeated: 0, eliteBossesDefeated: 0, battlesFled: 0, battlesWon: 0, cardsStudied: 0, consecutiveDays: 0 });
                      setUnlockedAchievements([]);
                      localStorage.removeItem('fantasyStudyQuest');
                      // Start Night Vigil and launch the narration
                      audioManager.play(TRACKS.nightVigil);
                      setNarrationIndex(0);
                      setNarrationActive(true);
                      setIntroPhase('narrating');
                    }}
                    style={{
                      fontFamily: "'Cinzel', serif", fontWeight: 700,
                      fontSize: 'clamp(0.95rem, 2.5vw, 1.15rem)', letterSpacing: '0.2em',
                      textTransform: 'uppercase', color: '#F5F5DC',
                      background: 'none', border: 'none', padding: '12px 40px',
                      cursor: 'pointer', transition: 'all 0.25s',
                      textShadow: '0 0 14px rgba(200,30,30,0.6)',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.textShadow = '0 0 24px rgba(220,50,50,1)'; e.currentTarget.style.transform = 'scale(1.06)'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = '#F5F5DC'; e.currentTarget.style.textShadow = '0 0 14px rgba(200,30,30,0.6)'; e.currentTarget.style.transform = 'scale(1)'; }}
                  >
                    New Adventure
                  </button>

                  <button
                    onClick={() => setIntroPhase('revealed')}
                    style={{
                      fontFamily: "'Cinzel', serif", fontWeight: 500,
                      fontSize: 'clamp(0.8rem, 2vw, 0.95rem)', letterSpacing: '0.15em',
                      textTransform: 'uppercase', color: 'rgba(180,180,180,0.5)',
                      background: 'none', border: 'none', padding: '12px 40px',
                      cursor: 'pointer', transition: 'all 0.25s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.color = 'rgba(220,220,220,0.85)'; e.currentTarget.style.transform = 'scale(1.04)'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'rgba(180,180,180,0.5)'; e.currentTarget.style.transform = 'scale(1)'; }}
                  >
                    Go Back
                  </button>
                </div>
              </div>
            )}

          </div>
            </>
          )}
        </div>
      )}



      <div className="absolute inset-0 bg-gradient-to-b from-stone-950 via-neutral-950 to-stone-900 opacity-70"></div>
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

        </div>

        {/* Navigation Section - Full Width */}
        <nav className="flex flex-wrap gap-4 justify-center items-center mb-8 pt-6 pb-6 border-t-2 border-b-2" style={{
          marginLeft: 'calc(-50vw + 50%)',
          marginRight: 'calc(-50vw + 50%)',
          borderColor: 'rgba(212, 175, 55, 0.2)',
          background: 'linear-gradient(to bottom, rgba(28, 22, 14, 0.6), rgba(18, 14, 9, 0.6))',
          boxShadow: 'inset 0 0 30px rgba(0, 0, 0, 0.3)'
        }}>
          {[
                {id:'quest', icon:Sword, label:'Guild'},
                {id:'contracts', icon:Calendar, label:'Contracts'},
                {id:'map', icon:Map, label:'Map'},
                {id:'planner', icon:BookOpen, label:'Codex'},
                {id:'journal', icon:ScrollText, label:'Journal'},
                {id:'debug', icon:Settings, label:'Debug'},
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => { sounds.click(); setActiveTab(t.id); }}
                  className="flex flex-col items-center gap-2 px-4 py-3 rounded-lg transition-all border-2"
                  style={{
                    backgroundColor: activeTab === t.id ? 'rgba(184, 134, 11, 0.3)' : 'transparent',
                    borderColor: activeTab === t.id ? '#D4AF37' : 'transparent',
                    opacity: activeTab === t.id ? 1 : 0.7,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.opacity = 1; if (activeTab !== t.id) e.currentTarget.style.borderColor = 'rgba(212,175,55,0.3)'; }}
                  onMouseLeave={e => { if (activeTab !== t.id) { e.currentTarget.style.opacity = 0.7; e.currentTarget.style.borderColor = 'transparent'; } }}
                >
                  <t.icon size={24} style={{ color: activeTab === t.id ? '#D4AF37' : '#F5F5DC' }} />
                  <span className="text-xs uppercase tracking-wider" style={{ color: activeTab === t.id ? '#D4AF37' : '#F5F5DC', fontWeight: activeTab === t.id ? 'bold' : 'normal' }}>
                    {t.label}
                  </span>
                </button>
              ))}

          {/* Account button — matches tab style */}
          <button
            onClick={async () => {
              sounds.click();
              if (supabaseUser) {
                await supabase.auth.signOut();
                setSupabaseUser(null);
              } else {
                setShowAuthModal(true);
              }
            }}
            className="flex flex-col items-center gap-2 px-4 py-3 rounded-lg transition-all border-2"
            style={{
              backgroundColor: 'transparent',
              borderColor: 'transparent',
              opacity: 0.7,
            }}
            onMouseEnter={e => { e.currentTarget.style.opacity = 1; e.currentTarget.style.borderColor = 'rgba(212,175,55,0.3)'; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = 0.7; e.currentTarget.style.borderColor = 'transparent'; }}
            title={supabaseUser ? `Sign out (${supabaseUser.email})` : 'Sign in to sync across devices'}
          >
            {supabaseUser
              ? <LogOut size={24} style={{ color: '#F5F5DC' }} />
              : <LogIn size={24} style={{ color: '#F5F5DC' }} />}
            <span className="text-xs uppercase tracking-wider" style={{ color: '#F5F5DC', fontWeight: 'normal' }}>
              {supabaseUser ? 'Sign Out' : 'Sign In'}
            </span>
          </button>
        </nav>

        <div className="max-w-6xl mx-auto">

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
              hero={hero} hp={hp} stamina={stamina} xp={xp} level={level}
              currentDay={currentDay} curseLevel={curseLevel}
              getMaxHp={getMaxHp} getMaxStamina={getMaxStamina}
              getBaseAttack={getBaseAttack} getBaseDefense={getBaseDefense} getCardStyle={getCardStyle}
              setShowInventoryModal={setShowInventoryModal}
              setShowCraftingModal={setShowCraftingModal}
              onOpenHealer={() => setShowHealerModal(true)}
              guildRank={guildRank}
              onOpenBestiary={() => setActiveTab('bestiary')}
              onOpenForge={() => setActiveTab('study')}
            />
          )}

          {activeTab === 'contracts' && (
            <ContractsTab
              hasStarted={hasStarted} isDayActive={isDayActive} currentDay={currentDay}
              eliteBossDefeatedToday={eliteBossDefeatedToday}
              tasks={tasks} setShowModal={setShowModal}
              hideCompletedTasks={hideCompletedTasks} setHideCompletedTasks={setHideCompletedTasks}
              handleDragStart={handleDragStart} handleDragEnd={handleDragEnd}
              handleDragOver={handleDragOver} handleDrop={handleDrop}
              start={start}
              activeContract={activeContract} setActiveContract={setActiveContract}
              setActiveTab={setActiveTab}
              setShowImportModal={setShowImportModal}
              log={log}
              guildPoints={guildPoints} guildRank={guildRank} guildRanks={GUILD_RANKS}
              locationContracts={LOCATION_CONTRACTS}
              completedLocationContracts={completedLocationContracts}
              pendingLocationRewards={pendingLocationRewards}
              onCollectLocationReward={collectLocationReward}
              debugUnlockedZones={debugUnlockedZones}
            />
          )}

          {activeTab === 'planner' && (
            <PlannerTab
              weeklyPlan={weeklyPlan} setWeeklyPlan={setWeeklyPlan}
              plannerSubTab={plannerSubTab} setPlannerSubTab={setPlannerSubTab}
              hidePlannerCompleted={hidePlannerCompleted} setHidePlannerCompleted={setHidePlannerCompleted}
              currentMonth={currentMonth} setCurrentMonth={setCurrentMonth}
              currentYear={currentYear} setCurrentYear={setCurrentYear}
              calendarEvents={calendarEvents} calendarFocus={calendarFocus}
              handlePlanDragStart={handlePlanDragStart} handlePlanDragEnd={handlePlanDragEnd}
              handlePlanDragOver={handlePlanDragOver} handlePlanDrop={handlePlanDrop}
              getNextDayOfWeek={getNextDayOfWeek}
              setSelectedDate={setSelectedDate} setSelectedDay={setSelectedDay}
              setShowCalendarModal={setShowCalendarModal} setShowPlanModal={setShowPlanModal}
              setTasks={setTasks} addLog={addLog}
            />
          )}
          {activeTab === 'study' && (
            <ForgeTab
              forgeSubTab={forgeSubTab} setForgeSubTab={setForgeSubTab}
              flashcardDecks={flashcardDecks} setFlashcardDecks={setFlashcardDecks}
              setSelectedDeck={setSelectedDeck} setShowDeckModal={setShowDeckModal}
              setShowCardModal={setShowCardModal} setShowStudyModal={setShowStudyModal}
              setCurrentCardIndex={setCurrentCardIndex}
              setStudyQueue={setStudyQueue} setIsFlipped={setIsFlipped}
              studyWebsites={studyWebsites}
              newWebsiteUrl={newWebsiteUrl} setNewWebsiteUrl={setNewWebsiteUrl}
              newWebsiteName={newWebsiteName} setNewWebsiteName={setNewWebsiteName}
              addStudyWebsite={addStudyWebsite} removeStudyWebsite={removeStudyWebsite}
              trackWebsiteClick={trackWebsiteClick}
              generateQuiz={generateQuiz} startMatchGame={startMatchGame}
              addLog={addLog}
            />
          )}
          {activeTab === 'journal' && (
            <JournalTab
              completedLocationContracts={completedLocationContracts}
            />
          )}
          {activeTab === 'bestiary' && (
            <BestiaryTab
              defeatedFactionMembers={defeatedFactionMembers}
              restedCursed={restedCursed}
            />
          )}
          {activeTab === 'map' && (
            <WorldMapTab
              currentDay={currentDay}
              level={level}
              gold={gold}
              hp={hp}
              maxHp={getMaxHp()}
              selectedZone={selectedZone}
              setSelectedZone={setSelectedZone}
              activeContract={activeContract}
              setActiveContract={setActiveContract}
              isDayActive={isDayActive}
              completedLocationContracts={completedLocationContracts}
              debugUnlockedZones={debugUnlockedZones}
              huntingChallenges={huntingChallenges}
              onOpenBestiary={() => setActiveTab('bestiary')}
              onHuntingChallenge={({ locationId, zone, faction }) => {
                const challengeTierWeights = { 1:{1:6,2:4,3:0}, 2:{1:2,2:6,3:2}, 3:{1:0,2:4,3:6}, 4:{1:0,2:2,3:8}, 5:{1:0,2:0,3:10} };
                contractEncounterRef.current = { tierWeights: challengeTierWeights[zone] || challengeTierWeights[1] };
                if (faction === 'bandit') {
                  const grunt = BANDIT_POOL.grunts[Math.floor(Math.random() * BANDIT_POOL.grunts.length)];
                  wildCreatureOverrideRef.current = { name: grunt.names[Math.floor(Math.random() * grunt.names.length)], img: grunt.img };
                } else if (faction === 'daughters') {
                  const member = DAUGHTERS_POOL.members[Math.floor(Math.random() * DAUGHTERS_POOL.members.length)];
                  wildCreatureOverrideRef.current = { name: member.names[Math.floor(Math.random() * member.names.length)], img: member.img };
                }
                setIsBanditWave(false);
                setActiveContract({ type: 'challenge', locationId, zone });
                setTimeout(() => { spawnRegularEnemy(false); contractEncounterRef.current = null; }, 1000);
              }}
              onDebugToggleZone={(zone, currentlyDone) => {
                const ids = LOCATION_CONTRACTS.filter(c => c.zone === zone).map(c => c.id);
                if (ids.length > 0) {
                  if (currentlyDone) {
                    setCompletedLocationContracts(prev => prev.filter(id => !ids.includes(id)));
                  } else {
                    setCompletedLocationContracts(prev => [...new Set([...prev, ...ids])]);
                  }
                } else {
                  if (currentlyDone) {
                    setDebugUnlockedZones(prev => prev.filter(z => z !== zone));
                  } else {
                    setDebugUnlockedZones(prev => [...prev, zone]);
                  }
                }
              }}
              onWildEncounter={({ monster, zone }) => {
                // Use zone-appropriate tier weights so HP/ATK scale correctly
                const wildTierWeights = { 1:{1:10,2:0,3:0}, 2:{1:5,2:5,3:0}, 3:{1:1,2:5,3:4}, 4:{1:0,2:2,3:8}, 5:{1:0,2:0,3:10} };
                contractEncounterRef.current = { tierWeights: wildTierWeights[zone] || wildTierWeights[1] };
                // Override display name/img with the specific creature from the map popup
                wildCreatureOverrideRef.current = { name: monster.name, img: monster.img };
                setIsBanditWave(false);
                setActiveContract({ type: 'wild', zone });
                setTimeout(() => { spawnRegularEnemy(false); contractEncounterRef.current = null; }, 1000);
              }}
              onBeginContract={() => {
                const _ac = activeContractRef.current;
                if (_ac?.type === 'location') {
                  const lc = _ac.contract;
                  const { enemyType, waveSize, tierWeights } = lc.encounter;
                  addLog(`Contract battle: "${lc.name}" — ${waveSize} enemies stand between you and your reward.`);
                  if (enemyType === 'bandit') {
                    const { enemyNames, dialogue, members: fixedMembers } = lc.encounter;
                    let lineup = [];
                    if (fixedMembers) {
                      // Fixed wave lineup (e.g. grunt → captain → leader)
                      lineup = fixedMembers.map((m, i) => ({ ...m, contractDialogue: i === 0 ? (dialogue?.[0] || null) : null }));
                    } else {
                      // Named member first — check grunts then captains
                      const namedName = enemyNames?.[0];
                      const namedGrunt = BANDIT_POOL.grunts.find(g => g.name === namedName);
                      const namedCapt  = BANDIT_POOL.captains.find(c => c.name === namedName);
                      const namedBandit = namedGrunt || namedCapt || BANDIT_POOL.grunts[Math.floor(Math.random() * BANDIT_POOL.grunts.length)];
                      lineup.push({ img: namedBandit.img, name: namedBandit.name, isCapt: !!namedCapt, isLeader: false, contractDialogue: dialogue?.[0] || null });
                      // Fill rest with creatures
                      for (let i = lineup.length; i < 3; i++) {
                        const c = pickCreatureForDay(currentDay);
                        lineup.push({ img: c.img, name: c.name, isCapt: false, isLeader: false, isCreature: true });
                      }
                      lineup.sort(() => Math.random() - 0.5);
                    }
                    banditLineupRef.current = lineup;
                    banditLineupIdxRef.current = 0;
                    setTimeout(() => spawnBanditEnemy(lineup[0], 0, lineup.length), 1000);
                  } else if (enemyType === 'daughters') {
                    const { enemyNames, dialogue, members: fixedMembers } = lc.encounter;
                    let lineup = [];
                    if (fixedMembers) {
                      // Fixed wave lineup (e.g. member → captain → leader)
                      lineup = fixedMembers.map((m, i) => ({ ...m, contractDialogue: i === 0 ? (dialogue?.[0] || null) : null }));
                    } else {
                      // Named member first — check members then captains
                      const namedName = enemyNames?.[0];
                      const namedMember = DAUGHTERS_POOL.members.find(m => m.name === namedName);
                      const namedCapt   = DAUGHTERS_POOL.captains.find(c => c.name === namedName);
                      const namedDaughter = namedMember || namedCapt || DAUGHTERS_POOL.members[Math.floor(Math.random() * DAUGHTERS_POOL.members.length)];
                      lineup.push({ img: namedDaughter.img, name: namedDaughter.name, isCapt: !!namedCapt, isLeader: false, contractDialogue: dialogue?.[0] || null });
                      // Fill rest with creatures
                      for (let i = lineup.length; i < 3; i++) {
                        const c = pickCreatureForDay(currentDay);
                        lineup.push({ img: c.img, name: c.name, isCapt: false, isLeader: false, isCreature: true });
                      }
                      lineup.sort(() => Math.random() - 0.5);
                    }
                    daughtersLineupRef.current = lineup;
                    daughtersLineupIdxRef.current = 0;
                    setTimeout(() => spawnDaughtersEnemy(lineup[0], 0, lineup.length), 1000);
                  } else if (enemyType === 'elite') {
                    const { eliteId, dialogue: eliteDialogue } = lc.encounter;
                    setTimeout(() => spawnSpecificElite(eliteId, eliteDialogue), 1000);
                  } else if (enemyType === 'elite_wave') {
                    const { eliteId, creatureCount, dialogue: eliteDialogue } = lc.encounter;
                    const creatures = Array.from({ length: creatureCount }, () => ({ ...pickCreatureForDay(currentDay), isCreature: true }));
                    eliteWaveRef.current = { creatures, eliteId, eliteDialogue: eliteDialogue?.[0] || null, creatureIdx: 0 };
                    setIsEliteWave(true);
                    setBattleType('wave');
                    setCurrentWaveEnemy(1);
                    setTotalWaveEnemies(creatureCount + 1);
                    addLog(`${creatureCount} creatures guard the way — and something worse waits behind them.`);
                    setTimeout(() => spawnRegularEnemy(false), 1000);
                  } else if (enemyType === 'order_final') {
                    const lineup = [
                      { img: '/bandits/leader.png',         name: 'Cutter', isCapt: false, isLeader: true, faction: 'bandit'    },
                      { img: '/daughters-of-dusk/leader.png', name: 'Mira', isCapt: false, isLeader: true, faction: 'daughters' },
                    ];
                    orderFinalLineupRef.current = lineup;
                    orderFinalIdxRef.current = 0;
                    setIsOrderFinal(true);
                    setBattleType('wave');
                    setCurrentWaveEnemy(1);
                    setTotalWaveEnemies(2);
                    addLog(`The order makes its final stand. Cutter and Mira — together.`);
                    setTimeout(() => spawnBanditEnemy(lineup[0], 0, 2), 1000);
                  } else if (enemyType === 'cursed') {
                    const { members } = lc.encounter;
                    cursedLineupRef.current = members;
                    cursedLineupIdxRef.current = 0;
                    setTimeout(() => spawnCursedEnemy(members[0], 0, members.length), 1000);
                  } else if (enemyType === 'antagonist') {
                    const { antagonistId } = lc.encounter;
                    setTimeout(() => spawnAntagonist(antagonistId), 1000);
                  } else {
                    contractEncounterRef.current = { tierWeights };
                    setWaveCount(waveSize);
                    setTimeout(() => spawnRegularEnemy(true, 1, waveSize), 1000);
                  }
                } else {
                  const waveRoll = Math.random();
                  if (waveRoll < 0.2) {
                    const numEnemies = Math.floor(Math.random() * 2) + 2;
                    setWaveCount(numEnemies);
                    addLog(`Wave incoming! ${numEnemies} enemies detected!`);
                    setTimeout(() => spawnRegularEnemy(true, 1, numEnemies), 1000);
                  } else {
                    spawnRegularEnemy(false, 0, 1);
                  }
                }
              }}
              onStartPomodoro={(task) => {
                const t = task || { title: selectedZoneRef.current?.name || 'Hunt', id: '_map_hunt_' + Date.now() };
                setPomodoroTask(t);
                setShowPomodoro(true);
                setPomodoroTimer(25 * 60);
                setPomodorosCompleted(0);
                setIsBreak(false);
                setPomodoroRunning(true);
                addLog(`Focus session: "${t.title}"`);
              }}
              onEliteBoss={miniBoss}
              onFinalBoss={finalBoss}
            />
          )}
          {activeTab === 'debug' && (
            <div className="max-w-4xl mx-auto mb-6 rounded-xl p-6 border-2 relative" style={{
              background: 'linear-gradient(to bottom, rgba(40, 20, 10, 0.95), rgba(20, 10, 5, 0.95))',
              borderColor: 'rgba(139, 0, 0, 0.6)',
              boxShadow: '0 0 30px rgba(139, 0, 0, 0.3), inset 0 0 50px rgba(0, 0, 0, 0.5)'
            }}>
              {/* Header */}
              <div className="text-center mb-6">
                <h3 className="text-3xl font-bold mb-2" style={{color: '#D4AF37', letterSpacing: '0.1em'}}>ARCANE CONSOLE</h3>
                <div className="flex items-center justify-center gap-2">
                  <div style={{width: '60px', height: '1px', background: 'linear-gradient(to right, transparent, rgba(212,175,55,0.5))'}}></div>
                  <span style={{color: 'rgba(212,175,55,0.6)', fontSize: '8px'}}>◆</span>
                  <div style={{width: '60px', height: '1px', background: 'linear-gradient(to left, transparent, rgba(212,175,55,0.5))'}}></div>
                </div>
                <p className="text-sm italic mt-2" style={{color: '#C0C0C0'}}>"Bend reality to your will..."</p>
              </div>

              {/* ── CLOUD SYNC ── */}
              <div className="bg-black bg-opacity-40 rounded-lg p-3 mb-4 border border-gray-800 flex items-center justify-between">
                <div className="text-xs" style={{ color: supabaseUser ? 'rgba(120,200,120,0.8)' : 'rgba(160,140,100,0.6)' }}>
                  {supabaseUser ? `☁ Synced — ${supabaseUser.email}` : '○ Offline — progress saved locally only'}
                </div>
                <button
                  onClick={async () => { if (supabaseUser) { await supabase.auth.signOut(); setSupabaseUser(null); } else { setShowAuthModal(true); } }}
                  className="text-xs px-3 py-1 rounded border"
                  style={{ borderColor: 'rgba(212,175,55,0.3)', color: 'rgba(212,175,55,0.7)', background: 'transparent', cursor: 'pointer', fontFamily: 'Cinzel, serif', letterSpacing: '0.08em' }}
                >
                  {supabaseUser ? 'Sign Out' : 'Sign In'}
                </button>
              </div>

              {/* ── QUICK STATS ── */}
              <div className="bg-black bg-opacity-40 rounded-lg p-3 mb-4 border border-gray-800">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs text-center">
                  <div><span className="text-gray-400">Day:</span> <span className="text-white font-bold">{currentDay}</span></div>
                  <div><span className="text-gray-400">Level:</span> <span className="text-yellow-400 font-bold">{level}</span></div>
                  <div><span className="text-gray-400">HP:</span> <span className="font-bold" style={{color: COLORS.cream}}>{hp}/{getMaxHp()}</span></div>
                  <div><span className="text-gray-400">SP:</span> <span className="text-blue-400 font-bold">{stamina}/{getMaxStamina()}</span></div>
                  <div><span className="text-gray-400">XP:</span> <span className="text-yellow-400 font-bold">{xp}</span></div>
                  <div><span className="text-gray-400">Gold:</span> <span className="text-amber-400 font-bold">{gold}</span></div>
                  <div><span className="text-gray-400">Curse:</span> <span className="text-purple-400 font-bold">{curseLevel}</span></div>
                  <div><span className="text-gray-400">Class:</span> <span className="text-white font-bold">{hero.class.name}</span></div>
                  <div><span className="text-gray-400">Contracts:</span> <span className="text-green-400 font-bold">{completedLocationContracts.length}</span></div>
                  <div><span className="text-gray-400">Skips:</span> <span className="text-orange-400 font-bold">{skipCount}/4</span></div>
                </div>
              </div>

              {/* ── GOD MODE ── */}
              <div className="mb-4">
                <button
                  onClick={() => { setGodMode(g => !g); addLog(godMode ? 'Debug: God Mode OFF' : 'Debug: God Mode ON — 1-hit kills + full immunity'); }}
                  style={{
                    width: '100%', padding: '14px 8px', borderRadius: '8px', cursor: 'pointer',
                    border: '2px solid', transition: 'all 0.25s',
                    background: godMode ? 'rgba(212,175,55,0.2)' : 'rgba(35,25,10,0.6)',
                    borderColor: godMode ? 'rgba(212,175,55,0.75)' : 'rgba(90,70,35,0.45)',
                    color: godMode ? '#FFD700' : 'rgba(160,140,90,0.7)',
                    fontSize: '0.85rem', fontWeight: 'bold', letterSpacing: '0.14em',
                    boxShadow: godMode ? '0 0 24px rgba(212,175,55,0.25), inset 0 0 12px rgba(212,175,55,0.08)' : 'none',
                  }}
                >
                  {godMode ? '✦ GOD MODE — ACTIVE' : '✦ GOD MODE — OFF'}
                </button>
                {godMode && (
                  <p className="text-xs text-center mt-2" style={{color: 'rgba(212,175,55,0.55)', fontStyle: 'italic'}}>
                    Enemies die in 1 hit · Hero immune to all damage
                  </p>
                )}
              </div>

              {/* ── RESOURCES ── */}
              <div className="mb-4">
                <h4 className="text-center text-sm font-bold mb-2" style={{color: '#D4AF37', letterSpacing: '0.1em'}}>RESOURCES</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <button onClick={() => { setHp(getMaxHp()); addLog('Debug: Full heal'); }} className="bg-green-800 hover:bg-green-700 px-4 py-2 rounded text-xs transition-all border border-green-600" style={{color: '#F5F5DC'}}>Full Heal</button>
                  <button onClick={() => { setStamina(getMaxStamina()); addLog('Debug: Full stamina'); }} className="bg-blue-800 hover:bg-blue-700 px-4 py-2 rounded text-xs transition-all border border-blue-600" style={{color: '#F5F5DC'}}>Full Stamina</button>
                  <button onClick={() => { setXp(x => x + 500); addLog('Debug: +500 XP'); }} className="bg-yellow-800 hover:bg-yellow-700 px-4 py-2 rounded text-xs transition-all border border-yellow-600" style={{color: '#F5F5DC'}}>+500 XP</button>
                  <button onClick={() => { setLevel(l => Math.min(l + 1, 50)); addLog('Debug: Level up'); }} className="bg-yellow-700 hover:bg-yellow-600 px-4 py-2 rounded text-xs transition-all border border-yellow-500" style={{color: '#F5F5DC'}}>Level Up</button>
                  <button onClick={() => { setGold(g => g + 500); addLog('Debug: +500 Gold'); }} className="bg-amber-700 hover:bg-amber-600 px-4 py-2 rounded text-xs transition-all border border-amber-500" style={{color: '#F5F5DC'}}>+500 Gold</button>
                  <button onClick={() => { setFusionCrystals(f => f + 5); addLog('Debug: +5 Crystals'); }} className="bg-cyan-800 hover:bg-cyan-700 px-4 py-2 rounded text-xs transition-all border border-cyan-600" style={{color: '#F5F5DC'}}>+5 Crystals</button>
                  <button onClick={() => { setHealthPots(h => h + 3); setStaminaPots(s => s + 3); setCleansePots(c => c + 1); addLog('Debug: +Potions'); }} className="bg-purple-800 hover:bg-purple-700 px-4 py-2 rounded text-xs transition-all border border-purple-600" style={{color: '#F5F5DC'}}>+All Potions</button>
                  <button onClick={() => { setHp(getMaxHp()); setStamina(getMaxStamina()); setGold(g => g + 500); setXp(x => x + 500); setHealthPots(h => h + 3); setStaminaPots(s => s + 3); addLog('Debug: Full restore'); }} className="bg-teal-700 hover:bg-teal-600 px-4 py-2 rounded text-xs transition-all border border-teal-500" style={{color: '#F5F5DC'}}>Full Restore</button>
                </div>
              </div>

              {/* ── COMBAT — STANDARD ── */}
              <div className="mb-4">
                <h4 className="text-center text-sm font-bold mb-2" style={{color: '#D4AF37', letterSpacing: '0.1em'}}>COMBAT — STANDARD</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <button onClick={() => { spawnRegularEnemy(false, 0, 1); addLog('Debug: Regular enemy'); }} className="bg-orange-800 hover:bg-orange-700 px-4 py-2 rounded text-xs transition-all border border-orange-600" style={{color: '#F5F5DC'}}>Regular Enemy</button>
                  <button onClick={() => {
                    setBattleType('wave'); audioManager.play(TRACKS.malicious);
                    setTotalWaveEnemies(3); setCurrentWaveEnemy(1); spawnRegularEnemy(true, 1, 3);
                    addLog('Debug: Wave (3)');
                  }} className="bg-yellow-800 hover:bg-yellow-700 px-4 py-2 rounded text-xs transition-all border border-yellow-600" style={{color: '#F5F5DC'}}>Wave (3)</button>
                  <button onClick={() => { setBattleType('elite'); audioManager.cut(); audioManager.play(TRACKS.darkling); spawnRandomMiniBoss(true); addLog('Debug: Elite boss'); }} className="bg-red-800 hover:bg-red-700 px-4 py-2 rounded text-xs transition-all border border-red-600" style={{color: '#F5F5DC'}}>Elite Boss</button>
                  <button onClick={() => {
                    const lineup = [
                      { img: '/cursed/young-paladin.png', name: 'Aldric', hp: 90, dialogue: "I can't stop. I can't remember how." },
                      { img: '/cursed/young-princess.png', name: 'Sela', hp: 75, gender: 'f', dialogue: "Is someone finally here? Or is this another dream?" }
                    ];
                    cursedLineupRef.current = lineup;
                    spawnCursedEnemy(lineup[0], 0, lineup.length);
                    addLog('Debug: Cursed/Mercy (Aldric & Sela)');
                  }} className="bg-indigo-800 hover:bg-indigo-700 px-4 py-2 rounded text-xs transition-all border border-indigo-600" style={{color: '#F5F5DC'}}>Cursed (Mercy)</button>
                </div>
              </div>

              {/* ── COMBAT — FACTIONS ── */}
              <div className="mb-4">
                <h4 className="text-center text-sm font-bold mb-2" style={{color: '#D4AF37', letterSpacing: '0.1em'}}>COMBAT — FACTIONS</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="rounded-lg p-3 border" style={{background: 'rgba(139,0,0,0.12)', borderColor: 'rgba(180,50,50,0.35)'}}>
                    <p className="text-xs font-bold mb-2 text-center" style={{color: 'rgba(240,120,120,0.9)'}}>Bandit Faction</p>
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => { audioManager.play(TRACKS.boss); spawnBanditWave(1, []); addLog('Debug: Bandit Wave 1 — Grunts'); }} className="bg-red-900 hover:bg-red-800 px-3 py-2 rounded text-xs border border-red-700" style={{color: '#F5F5DC'}}>Wave 1 — Grunts</button>
                      <button onClick={() => { audioManager.play(TRACKS.boss); spawnBanditWave(2, []); addLog('Debug: Bandit Wave 2 — Captain'); }} className="bg-red-900 hover:bg-red-800 px-3 py-2 rounded text-xs border border-red-700" style={{color: '#F5F5DC'}}>Wave 2 — Captain</button>
                      <button onClick={() => { audioManager.play(TRACKS.boss); spawnBanditWave(3, ['captain-1', 'captain-2']); addLog('Debug: Bandit Wave 3 — Captain'); }} className="bg-red-900 hover:bg-red-800 px-3 py-2 rounded text-xs border border-red-700" style={{color: '#F5F5DC'}}>Wave 3 — Captain</button>
                      <button onClick={() => { audioManager.play(TRACKS.boss); spawnBanditWave(4, ['captain-1', 'captain-2', 'captain-3']); addLog('Debug: Bandit Wave 4 — Cutter'); }} className="bg-red-800 hover:bg-red-700 px-3 py-2 rounded text-xs border border-red-500 font-bold" style={{color: '#FFD700'}}>Wave 4 — Cutter</button>
                    </div>
                  </div>
                  <div className="rounded-lg p-3 border" style={{background: 'rgba(80,0,120,0.12)', borderColor: 'rgba(150,60,200,0.35)'}}>
                    <p className="text-xs font-bold mb-2 text-center" style={{color: 'rgba(200,140,255,0.9)'}}>Daughters of Dusk</p>
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => { audioManager.play(TRACKS.boss); spawnDaughtersWave(1, []); addLog('Debug: Daughters Wave 1 — Members'); }} className="bg-purple-900 hover:bg-purple-800 px-3 py-2 rounded text-xs border border-purple-700" style={{color: '#F5F5DC'}}>Wave 1 — Members</button>
                      <button onClick={() => { audioManager.play(TRACKS.boss); spawnDaughtersWave(2, []); addLog('Debug: Daughters Wave 2 — Captain'); }} className="bg-purple-900 hover:bg-purple-800 px-3 py-2 rounded text-xs border border-purple-700" style={{color: '#F5F5DC'}}>Wave 2 — Captain</button>
                      <button onClick={() => { audioManager.play(TRACKS.boss); spawnDaughtersWave(3, ['captain-1', 'captain-2']); addLog('Debug: Daughters Wave 3 — Captain'); }} className="bg-purple-900 hover:bg-purple-800 px-3 py-2 rounded text-xs border border-purple-700" style={{color: '#F5F5DC'}}>Wave 3 — Captain</button>
                      <button onClick={() => { audioManager.play(TRACKS.boss); spawnDaughtersWave(4, ['captain-1', 'captain-2', 'captain-3']); addLog('Debug: Daughters Wave 4 — Mira'); }} className="bg-purple-800 hover:bg-purple-700 px-3 py-2 rounded text-xs border border-purple-500 font-bold" style={{color: '#FFD700'}}>Wave 4 — Mira</button>
                    </div>
                  </div>
                </div>
              </div>

                            {/* ── BANDITS — INDIVIDUALS ── */}
              <div className="mb-4">
                <h4 className="text-center text-sm font-bold mb-2" style={{color: '#D4AF37', letterSpacing: '0.1em'}}>BANDITS — INDIVIDUALS</h4>
                <div className="rounded-lg p-3 mb-2 border" style={{background: 'rgba(139,0,0,0.12)', borderColor: 'rgba(180,50,50,0.35)'}}>
                  <p className="text-xs mb-2" style={{color: 'rgba(200,120,120,0.8)'}}>Grunts</p>
                  <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                    {BANDIT_POOL.grunts.map(grunt => (
                      <button key={grunt.name} onClick={() => {
                        const enemy = { ...grunt, isCapt: false, isLeader: false };
                        banditLineupRef.current = [enemy];
                        banditLineupIdxRef.current = 0;
                        setIsBanditWave(true); setBanditWaveNumber(1); setBanditCaptainsDefeated([]);
                        audioManager.play(TRACKS.malicious);
                        spawnBanditEnemy(enemy, 0, 1);
                        addLog('Debug: Bandit grunt ' + grunt.name);
                      }} className="bg-red-900 hover:bg-red-800 px-2 py-2 rounded text-xs border border-red-800 transition-all" style={{color: '#F5F5DC'}}>{grunt.name}</button>
                    ))}
                  </div>
                </div>
                <div className="rounded-lg p-3 border" style={{background: 'rgba(139,0,0,0.18)', borderColor: 'rgba(200,60,60,0.4)'}}>
                  <p className="text-xs mb-2" style={{color: 'rgba(240,160,100,0.9)'}}>Captains &amp; Lord</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {BANDIT_POOL.captains.map(capt => (
                      <button key={capt.name} onClick={() => {
                        const enemy = { ...capt, isCapt: true, isLeader: false };
                        banditLineupRef.current = [enemy];
                        banditLineupIdxRef.current = 0;
                        setIsBanditWave(true); setBanditWaveNumber(1); setBanditCaptainsDefeated([]);
                        audioManager.play(TRACKS.malicious);
                        spawnBanditEnemy(enemy, 0, 1);
                        addLog('Debug: Bandit captain ' + capt.name);
                      }} className="bg-red-800 hover:bg-red-700 px-2 py-2 rounded text-xs border border-red-600 transition-all" style={{color: '#FFD700'}}>{capt.name}<br/><span style={{fontSize:'0.55rem', opacity:0.65}}>{capt.title}</span></button>
                    ))}
                    <button onClick={() => {
                      const leader = { ...BANDIT_POOL.leader, isCapt: false, isLeader: true };
                      banditLineupRef.current = [leader];
                      banditLineupIdxRef.current = 0;
                      setIsBanditWave(true); setBanditWaveNumber(1); setBanditCaptainsDefeated(['captain-1','captain-2','captain-3']);
                      audioManager.play(TRACKS.malicious);
                      spawnBanditEnemy(leader, 0, 1);
                      addLog('Debug: Bandit Lord Cutter');
                    }} className="bg-red-700 hover:bg-red-600 px-2 py-2 rounded text-xs border-2 border-red-400 transition-all font-bold" style={{color: '#FFD700'}}>Cutter<br/><span style={{fontSize:'0.55rem', fontWeight:'normal'}}>Bandit Lord</span></button>
                  </div>
                </div>
              </div>

              {/* ── DAUGHTERS — INDIVIDUALS ── */}
              <div className="mb-4">
                <h4 className="text-center text-sm font-bold mb-2" style={{color: '#D4AF37', letterSpacing: '0.1em'}}>DAUGHTERS OF DUSK — INDIVIDUALS</h4>
                <div className="rounded-lg p-3 mb-2 border" style={{background: 'rgba(80,0,120,0.12)', borderColor: 'rgba(150,60,200,0.35)'}}>
                  <p className="text-xs mb-2" style={{color: 'rgba(200,150,255,0.8)'}}>Members</p>
                  <div className="grid grid-cols-5 gap-2">
                    {DAUGHTERS_POOL.members.map(member => (
                      <button key={member.name} onClick={() => {
                        const enemy = { ...member, isCapt: false, isLeader: false };
                        daughtersLineupRef.current = [enemy];
                        daughtersLineupIdxRef.current = 0;
                        setIsDaughtersWave(true); setDaughtersWaveNumber(1); setDaughtersCaptainsDefeated([]);
                        audioManager.play(TRACKS.malicious);
                        spawnDaughtersEnemy(enemy, 0, 1);
                        addLog('Debug: Daughters member ' + member.name);
                      }} className="bg-purple-900 hover:bg-purple-800 px-2 py-2 rounded text-xs border border-purple-800 transition-all" style={{color: '#F5F5DC'}}>{member.name}</button>
                    ))}
                  </div>
                </div>
                <div className="rounded-lg p-3 border" style={{background: 'rgba(80,0,120,0.18)', borderColor: 'rgba(180,80,240,0.4)'}}>
                  <p className="text-xs mb-2" style={{color: 'rgba(220,170,255,0.9)'}}>Captains &amp; Queen</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {DAUGHTERS_POOL.captains.map(capt => (
                      <button key={capt.name} onClick={() => {
                        const enemy = { ...capt, isCapt: true, isLeader: false };
                        daughtersLineupRef.current = [enemy];
                        daughtersLineupIdxRef.current = 0;
                        setIsDaughtersWave(true); setDaughtersWaveNumber(1); setDaughtersCaptainsDefeated([]);
                        audioManager.play(TRACKS.malicious);
                        spawnDaughtersEnemy(enemy, 0, 1);
                        addLog('Debug: Daughters captain ' + capt.name);
                      }} className="bg-purple-800 hover:bg-purple-700 px-2 py-2 rounded text-xs border border-purple-600 transition-all" style={{color: '#FFD700'}}>{capt.name}<br/><span style={{fontSize:'0.55rem', opacity:0.65}}>{capt.title}</span></button>
                    ))}
                    <button onClick={() => {
                      const leader = { ...DAUGHTERS_POOL.leader, isCapt: false, isLeader: true };
                      daughtersLineupRef.current = [leader];
                      daughtersLineupIdxRef.current = 0;
                      setIsDaughtersWave(true); setDaughtersWaveNumber(1); setDaughtersCaptainsDefeated(['captain-1','captain-2','captain-3']);
                      audioManager.play(TRACKS.malicious);
                      spawnDaughtersEnemy(leader, 0, 1);
                      addLog('Debug: Dusk Queen Mira');
                    }} className="bg-purple-700 hover:bg-purple-600 px-2 py-2 rounded text-xs border-2 border-purple-400 transition-all font-bold" style={{color: '#FFD700'}}>Mira<br/><span style={{fontSize:'0.55rem', fontWeight:'normal'}}>Dusk Queen</span></button>
                  </div>
                </div>
              </div>

              {/* ── LOST SOULS — INDIVIDUALS ── */}
              <div className="mb-4">
                <h4 className="text-center text-sm font-bold mb-2" style={{color: '#D4AF37', letterSpacing: '0.1em'}}>LOST SOULS — INDIVIDUALS</h4>
                <p className="text-xs text-center mb-3" style={{color: 'rgba(160,145,110,0.55)', fontStyle: 'italic'}}>Each soul spawns as a solo mercy battle with Grim Idol music.</p>
                {[
                  { group: 'Zone I', souls: [
                    { img: '/cursed/young-paladin.png',       name: 'Aldric',       hp: 90,  dialogue: "I can't stop. I can't remember how." },
                    { img: '/cursed/young-princess.png',      name: 'Sela',         hp: 75,  gender: 'f', dialogue: "Is someone finally here? Or is this another dream?" },
                  ]},
                  { group: 'Zone II', souls: [
                    { img: '/cursed/elven-girl.png',          name: 'Lysse',        hp: 150, gender: 'f', dialogue: "The source is close. I know it." },
                    { img: '/cursed/mongolian-princess.png',  name: 'Kira',         hp: 135, gender: 'f', dialogue: "I was supposed to keep her safe. I'm still trying." },
                    { img: '/cursed/mercenary.png',           name: 'Conn',         hp: 165, dialogue: "Still getting paid for this, far as I'm concerned." },
                    { img: '/cursed/robber.png',              name: 'Dar',          hp: 140, dialogue: "I don't even know why I'm still here." },
                  ]},
                  { group: 'Zone III', souls: [
                    { img: '/cursed/warrior-lady.png',        name: 'Bryn',         hp: 245, gender: 'f', dialogue: "Hold the line. We hold the line." },
                    { img: '/cursed/viking-woman.png',        name: 'Solveig',      hp: 225, gender: 'f', dialogue: "Forward. Always forward." },
                    { img: '/cursed/young-lady.png',          name: 'Maren',        hp: 260, gender: 'f', dialogue: "I saw something. I had to come back." },
                    { img: '/cursed/young-korean-prince.png', name: 'Sun Wen',      hp: 235, dialogue: "I followed her here. I don't regret it." },
                  ]},
                  { group: 'Zone IV', souls: [
                    { img: '/cursed/viking-warrior.png',      name: 'Jarl Sigrun',  hp: 360, gender: 'f', dialogue: "Not their fight. Never was. But this one is mine." },
                    { img: '/cursed/viking-noble-man.png',    name: 'Lord Halvard', hp: 330, dialogue: "I understand the curse completely now." },
                  ]},
                  { group: 'Zone V', souls: [
                    { img: '/cursed/warrior-queen.png',       name: 'Queen Sera',   hp: 490, gender: 'f', dialogue: "My kingdom is ash. I have nothing left to lose." },
                    { img: '/cursed/old-noble-man.png',       name: 'Edric',        hp: 450, dialogue: "I was wrong about one thing. Knowing it doesn't make it smaller." },
                    { img: '/cursed/gladiator.png',           name: 'Brek',         hp: 620, dialogue: "Sixty-two. I've been counting. Come on then." },
                  ]},
                ].map(({ group, souls }) => (
                  <div key={group} className="mb-3">
                    <p className="text-xs mb-2" style={{color: 'rgba(180,165,130,0.65)', letterSpacing: '0.08em'}}>{group}</p>
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                      {souls.map(soul => (
                        <button key={soul.name} onClick={() => {
                          cursedLineupRef.current = [soul];
                          spawnCursedEnemy(soul, 0, 1);
                          addLog('Debug: Lost Soul ' + soul.name + ' (' + soul.hp + ' HP)');
                        }} style={{
                          background: 'rgba(40,30,60,0.5)', borderColor: 'rgba(120,100,180,0.4)',
                          border: '1px solid', borderRadius: '6px', padding: '8px 6px', cursor: 'pointer',
                          color: '#C8B8E8', fontSize: '0.72rem', textAlign: 'center', transition: 'filter 0.15s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.3)'}
                        onMouseLeave={e => e.currentTarget.style.filter = 'brightness(1)'}
                        >
                          <div style={{fontWeight: 'bold'}}>{soul.name}</div>
                          <div style={{fontSize: '0.55rem', opacity: 0.55, marginTop: '2px'}}>{soul.hp} HP</div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* ── COMBAT — THE ORDER ── */}
              <div className="mb-4">
                <h4 className="text-center text-sm font-bold mb-2" style={{color: '#D4AF37', letterSpacing: '0.1em'}}>COMBAT — THE ORDER</h4>
                <p className="text-xs text-center mb-3" style={{color: 'rgba(180,165,130,0.55)', fontStyle: 'italic'}}>Each antagonist has unique music, SFX, HP scaling, and opening dialogue.</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { id: 'cutter',   label: 'Cutter',   subtitle: 'Bandit Lord',      tier: 'Zone IV', bg: 'rgba(160,30,30,0.2)',   border: 'rgba(220,70,70,0.5)',   text: '#FF9999' },
                    { id: 'mira',     label: 'Mira',     subtitle: 'Dusk Queen',       tier: 'Zone IV', bg: 'rgba(110,30,170,0.2)',   border: 'rgba(170,80,240,0.5)',  text: '#CC99FF' },
                    { id: 'sylvaris', label: 'Sylvaris', subtitle: 'Queen of Ruin',    tier: 'Zone V',  bg: 'rgba(30,60,160,0.2)',    border: 'rgba(80,130,240,0.5)',  text: '#99BBFF' },
                    { id: 'malachar', label: 'Malachar', subtitle: 'The Eternal Lich', tier: 'Zone V',  bg: 'rgba(15,10,35,0.6)',     border: 'rgba(90,70,150,0.6)',   text: '#BBAAFF' },
                  ].map(({ id, label, subtitle, tier, bg, border, text }) => (
                    <button key={id} onClick={() => { spawnAntagonist(id); addLog(`Debug: Spawn ${label}`); }}
                      style={{ background: bg, borderColor: border, border: '2px solid', borderRadius: '8px', padding: '12px 8px', cursor: 'pointer', transition: 'filter 0.15s', textAlign: 'center', color: text }}
                      onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.25)'}
                      onMouseLeave={e => e.currentTarget.style.filter = 'brightness(1)'}
                    >
                      <div style={{fontSize: '0.8rem', fontWeight: 'bold'}}>{label}</div>
                      <div style={{fontSize: '0.6rem', opacity: 0.7, fontStyle: 'italic', marginTop: '2px'}}>{subtitle}</div>
                      <div style={{fontSize: '0.55rem', opacity: 0.5, marginTop: '4px', letterSpacing: '0.05em'}}>{tier} · Mythril</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* ── JOURNAL & CONTRACTS ── */}
              <div className="mb-4">
                <h4 className="text-center text-sm font-bold mb-2" style={{color: '#D4AF37', letterSpacing: '0.1em'}}>JOURNAL & CONTRACTS</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
                  <button onClick={() => {
                    const ids = LOCATION_CONTRACTS.filter(lc => lc.journalEntry).map(lc => lc.id);
                    setCompletedLocationContracts(prev => [...new Set([...prev, ...ids])]);
                    addLog('Debug: All journal entries unlocked');
                  }} className="bg-amber-900 hover:bg-amber-800 px-4 py-2 rounded text-xs border border-amber-700" style={{color: '#F5F5DC'}}>Unlock All Journal</button>
                  <button onClick={() => {
                    const ids = LOCATION_CONTRACTS.map(lc => lc.id);
                    setCompletedLocationContracts(prev => [...new Set([...prev, ...ids])]);
                    addLog('Debug: All contracts complete');
                  }} className="bg-green-900 hover:bg-green-800 px-4 py-2 rounded text-xs border border-green-700" style={{color: '#F5F5DC'}}>Complete All</button>
                  <button onClick={() => {
                    const ids = ['order_cutter', 'order_mira', 'order_sylvaris', 'order_malachar'];
                    setCompletedLocationContracts(prev => [...new Set([...prev, ...ids])]);
                    addLog('Debug: The Order contracts completed');
                  }} className="bg-indigo-900 hover:bg-indigo-800 px-4 py-2 rounded text-xs border border-indigo-700" style={{color: '#F5F5DC'}}>Complete The Order</button>
                  <button onClick={() => {
                    const ids = LOCATION_CONTRACTS.filter(lc => lc.mercyContract).map(lc => lc.id);
                    setCompletedLocationContracts(prev => [...new Set([...prev, ...ids])]);
                    addLog('Debug: All mercy contracts complete');
                  }} className="bg-teal-900 hover:bg-teal-800 px-4 py-2 rounded text-xs border border-teal-700" style={{color: '#F5F5DC'}}>Complete All Mercy</button>
                  <button onClick={() => {
                    setCompletedLocationContracts([]);
                    setDebugUnlockedZones([]);
                    addLog('Debug: All contracts reset');
                  }} className="bg-orange-900 hover:bg-orange-800 px-4 py-2 rounded text-xs border border-orange-700" style={{color: '#F5F5DC'}}>Reset All</button>
                  <button onClick={() => {
                    setDebugUnlockedZones([1, 2, 3, 4, 5]);
                    addLog('Debug: All zones unlocked');
                  }} className="bg-yellow-900 hover:bg-yellow-800 px-4 py-2 rounded text-xs border border-yellow-700" style={{color: '#F5F5DC'}}>Unlock All Zones</button>
                </div>
                <p className="text-xs text-center mb-2" style={{color: 'rgba(160,145,110,0.6)'}}>Unlock by zone:</p>
                <div className="grid grid-cols-5 gap-2">
                  {[1,2,3,4,5].map(z => {
                    const zoneIds = LOCATION_CONTRACTS.filter(lc => lc.zone === z).map(lc => lc.id);
                    const doneCount = zoneIds.filter(id => completedLocationContracts.includes(id)).length;
                    return (
                      <button key={z} onClick={() => {
                        setCompletedLocationContracts(prev => [...new Set([...prev, ...zoneIds])]);
                        setDebugUnlockedZones(prev => [...new Set([...prev, z])]);
                        addLog(`Debug: Zone ${z} contracts unlocked`);
                      }} style={{
                        background: doneCount === zoneIds.length ? 'rgba(40,110,40,0.35)' : 'rgba(50,35,15,0.5)',
                        borderColor: doneCount === zoneIds.length ? 'rgba(70,180,70,0.5)' : 'rgba(100,75,35,0.4)',
                        border: '1px solid', borderRadius: '6px', padding: '8px 4px', cursor: 'pointer',
                        color: '#F5F5DC', fontSize: '0.7rem', textAlign: 'center', transition: 'filter 0.15s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.2)'}
                      onMouseLeave={e => e.currentTarget.style.filter = 'brightness(1)'}
                      >
                        Zone {z}<br/><span style={{fontSize:'0.55rem', opacity: 0.55}}>{doneCount}/{zoneIds.length}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ── LOOT TESTING ── */}
              <div className="mb-4">
                <h4 className="text-center text-sm font-bold mb-2" style={{color: '#D4AF37', letterSpacing: '0.1em'}}>LOOT TESTING</h4>
                <div className="mb-3">
                  <p className="text-xs text-center mb-2" style={{color: '#C0C0C0'}}>Spawn Weapons:</p>
                  <div className="grid grid-cols-5 gap-2">
                    {['common', 'uncommon', 'rare', 'epic', 'legendary'].map(rarity => (
                      <button key={rarity} onClick={() => {
                        const multiplier = getRarityMultiplier(rarity);
                        const range = GAME_CONSTANTS.WEAPON_STAT_RANGES;
                        const attack = Math.floor((Math.floor(Math.random() * (range.max - range.min + 1)) + range.min) * multiplier);
                        const names = GAME_CONSTANTS.WEAPON_NAMES[rarity];
                        const name = names[Math.floor(Math.random() * names.length)];
                        const affixes = generateAffixes(rarity, 'weapon');
                        setWeaponInventory(prev => [...prev, { name, attack, rarity, affixes, id: Date.now() }]);
                        addLog(`Debug: ${GAME_CONSTANTS.RARITY_TIERS[rarity].name} ${name} (+${attack} Atk)`);
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
                <div className="mb-3">
                  <p className="text-xs text-center mb-2" style={{color: '#C0C0C0'}}>Spawn Armor:</p>
                  <div className="grid grid-cols-5 gap-2">
                    {['common', 'uncommon', 'rare', 'epic', 'legendary'].map(rarity => (
                      <button key={rarity} onClick={() => {
                        const multiplier = getRarityMultiplier(rarity);
                        const slots = ['helmet', 'chest', 'gloves', 'boots'];
                        const slot = slots[Math.floor(Math.random() * slots.length)];
                        const range = GAME_CONSTANTS.ARMOR_STAT_RANGES[slot];
                        const defense = Math.floor((Math.floor(Math.random() * (range.max - range.min + 1)) + range.min) * multiplier);
                        const names = GAME_CONSTANTS.ARMOR_NAMES[slot][rarity];
                        const name = names[Math.floor(Math.random() * names.length)];
                        const affixes = generateAffixes(rarity, 'armor');
                        setArmorInventory(prev => ({ ...prev, [slot]: [...prev[slot], { name, defense, rarity, affixes, id: Date.now() }] }));
                        addLog(`Debug: ${GAME_CONSTANTS.RARITY_TIERS[rarity].name} ${name} (+${defense} Def)`);
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
                <div>
                  <p className="text-xs text-center mb-2" style={{color: '#C0C0C0'}}>Special Affixes:</p>
                  <div className="grid grid-cols-3 gap-2">
                    <button onClick={() => {
                      const rarity = 'epic'; const mult = getRarityMultiplier(rarity);
                      const r = GAME_CONSTANTS.WEAPON_STAT_RANGES;
                      const attack = Math.floor((Math.floor(Math.random() * (r.max - r.min + 1)) + r.min) * mult);
                      const name = GAME_CONSTANTS.WEAPON_NAMES[rarity][Math.floor(Math.random() * GAME_CONSTANTS.WEAPON_NAMES[rarity].length)];
                      setWeaponInventory(prev => [...prev, { name, attack, rarity, affixes: { poisonChance: 20, poisonDamage: 8, flatDamage: 10 }, id: Date.now() }]);
                      addLog('Debug: Poison weapon (20% chance, 8/turn)');
                    }} className="bg-purple-800 hover:bg-purple-700 px-3 py-2 rounded text-xs border border-purple-600" style={{color: '#F5F5DC'}}>Poison Weapon</button>
                    <button onClick={() => {
                      const rarity = 'epic'; const mult = getRarityMultiplier(rarity);
                      const r = GAME_CONSTANTS.WEAPON_STAT_RANGES;
                      const attack = Math.floor((Math.floor(Math.random() * (r.max - r.min + 1)) + r.min) * mult);
                      const name = GAME_CONSTANTS.WEAPON_NAMES[rarity][Math.floor(Math.random() * GAME_CONSTANTS.WEAPON_NAMES[rarity].length)];
                      setWeaponInventory(prev => [...prev, { name, attack, rarity, affixes: { critChance: 8, critMultiplier: 0.8, percentDamage: 15 }, id: Date.now() }]);
                      addLog('Debug: Crit weapon (8% crit, +0.8x)');
                    }} className="bg-yellow-800 hover:bg-yellow-700 px-3 py-2 rounded text-xs border border-yellow-600" style={{color: '#F5F5DC'}}>Crit Weapon</button>
                    <button onClick={() => {
                      const rarity = 'epic'; const mult = getRarityMultiplier(rarity);
                      const slots = ['helmet', 'chest', 'gloves', 'boots'];
                      const slot = slots[Math.floor(Math.random() * slots.length)];
                      const range = GAME_CONSTANTS.ARMOR_STAT_RANGES[slot];
                      const defense = Math.floor((Math.floor(Math.random() * (range.max - range.min + 1)) + range.min) * mult);
                      const name = GAME_CONSTANTS.ARMOR_NAMES[slot][rarity][Math.floor(Math.random() * GAME_CONSTANTS.ARMOR_NAMES[slot][rarity].length)];
                      setArmorInventory(prev => ({ ...prev, [slot]: [...prev[slot], { name, defense, rarity, affixes: { flatArmor: 10, percentDR: 5, flatHP: 20 }, id: Date.now() }] }));
                      addLog('Debug: Tank armor (+10 armor, +5% DR, +20 HP)');
                    }} className="bg-blue-800 hover:bg-blue-700 px-3 py-2 rounded text-xs border border-blue-600" style={{color: '#F5F5DC'}}>Tank Armor</button>
                  </div>
                </div>
              </div>

              {/* ── WARNING BOX STATE ── */}
              <div className="mb-4">
                <h4 className="text-center text-sm font-bold mb-2" style={{color: '#D4AF37', letterSpacing: '0.1em'}}>WARNING BOX STATE</h4>
                <div className="flex justify-center gap-2 flex-wrap">
                  {[null, 'locked', 'unlocked', 'evening', 'finalhour'].map(state => (
                    <button key={String(state)} onClick={() => { setDebugWarningState(state); addLog(`Debug: Warning → ${state || 'AUTO'}`); }}
                      className="px-4 py-2 rounded text-xs border transition-all"
                      style={{
                        background: debugWarningState === state ? 'rgba(212,175,55,0.2)' : 'rgba(40,30,20,0.5)',
                        borderColor: debugWarningState === state ? 'rgba(212,175,55,0.6)' : 'rgba(100,80,50,0.3)',
                        color: '#F5F5DC',
                      }}
                    >{state ? state.toUpperCase() : 'AUTO'}</button>
                  ))}
                </div>
              </div>

              {/* ── DAY & CURSE ── */}
              <div className="mb-4">
                <h4 className="text-center text-sm font-bold mb-2" style={{color: '#D4AF37', letterSpacing: '0.1em'}}>DAY & CURSE</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <button onClick={() => { setCurrentDay(d => d + 1); addLog(`Debug: Day → ${currentDay + 1}`); }} className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded text-xs border border-gray-600" style={{color: '#F5F5DC'}}>+1 Day</button>
                  <button onClick={() => { setCurrentDay(d => d + 7); addLog('Debug: +7 days'); }} className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded text-xs border border-gray-600" style={{color: '#F5F5DC'}}>+7 Days</button>
                  <button onClick={() => { setCurseLevel(0); addLog('Debug: Curse cleared'); }} className="bg-green-800 hover:bg-green-700 px-4 py-2 rounded text-xs border border-green-600" style={{color: '#F5F5DC'}}>Clear Curse</button>
                  <button onClick={() => { setCurseLevel(1); addLog('Debug: Cursed Lvl 1'); }} className="bg-purple-800 hover:bg-purple-700 px-4 py-2 rounded text-xs border border-purple-600" style={{color: '#F5F5DC'}}>Curse Lvl 1</button>
                  <button onClick={() => { setCurseLevel(2); addLog('Debug: Cursed Lvl 2'); }} className="bg-purple-900 hover:bg-purple-800 px-4 py-2 rounded text-xs border border-purple-700" style={{color: '#F5F5DC'}}>Curse Lvl 2</button>
                  <button onClick={() => { setCurseLevel(3); addLog('Debug: CONDEMNED'); }} className="bg-red-900 hover:bg-red-800 px-4 py-2 rounded text-xs border border-red-600" style={{color: '#F5F5DC'}}>Curse Lvl 3</button>
                  <button onClick={() => { setEliteBossDefeatedToday(false); addLog('Debug: Elite boss cooldown reset'); }} className="bg-cyan-800 hover:bg-cyan-700 px-4 py-2 rounded text-xs border border-cyan-600" style={{color: '#F5F5DC'}}>Reset Elite CD</button>
                  <button onClick={() => { setHuntingChallenges({}); addLog('Debug: Challenge cooldowns cleared'); }} className="bg-teal-800 hover:bg-teal-700 px-4 py-2 rounded text-xs border border-teal-600" style={{color: '#F5F5DC'}}>Reset Challenges</button>
                </div>
              </div>

              {/* ── TASKS ── */}
              <div className="mb-4">
                <h4 className="text-center text-sm font-bold mb-2" style={{color: '#D4AF37', letterSpacing: '0.1em'}}>TASKS</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  <button onClick={() => { setTasks(t => [...t, { id: Date.now(), title: 'Test Task', priority: 'routine', done: false, overdue: false }]); addLog('Debug: +Routine task'); }} className="bg-blue-800 hover:bg-blue-700 px-4 py-2 rounded text-xs border border-blue-600" style={{color: '#F5F5DC'}}>+Routine Task</button>
                  <button onClick={() => { setTasks(t => [...t, { id: Date.now(), title: 'Important Task', priority: 'important', done: false, overdue: false }]); addLog('Debug: +Important task'); }} className="bg-yellow-800 hover:bg-yellow-700 px-4 py-2 rounded text-xs border border-yellow-600" style={{color: '#F5F5DC'}}>+Important Task</button>
                  <button onClick={() => { setTasks(t => t.map(task => ({ ...task, overdue: true }))); addLog('Debug: All tasks → overdue'); }} className="bg-red-800 hover:bg-red-700 px-4 py-2 rounded text-xs border border-red-600" style={{color: '#F5F5DC'}}>Mark All Overdue</button>
                  <button onClick={() => { setTasks(t => t.map(task => ({ ...task, done: true }))); addLog('Debug: All tasks completed'); }} className="bg-green-800 hover:bg-green-700 px-4 py-2 rounded text-xs border border-green-600" style={{color: '#F5F5DC'}}>Complete All</button>
                  <button onClick={() => { setTasks([]); addLog('Debug: Tasks cleared'); }} className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded text-xs border border-gray-600" style={{color: '#F5F5DC'}}>Clear Tasks</button>
                </div>
              </div>

              {/* ── DATA ── */}
              <div className="mb-4">
                <h4 className="text-center text-sm font-bold mb-2" style={{color: '#D4AF37', letterSpacing: '0.1em'}}>DATA</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  <button onClick={() => { setLog([]); addLog('Debug: Chronicle cleared'); }} className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded text-xs border border-gray-600" style={{color: '#F5F5DC'}}>Clear Chronicle</button>
                  <button onClick={() => { if (window.confirm('Clear calendar?')) { setCalendarTasks({}); addLog('Debug: Calendar cleared'); } }} className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded text-xs border border-gray-600" style={{color: '#F5F5DC'}}>Clear Calendar</button>
                  <button onClick={() => { if (window.confirm('Clear planner?')) { setWeeklyPlan({ Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: [], Sunday: [] }); addLog('Debug: Planner cleared'); } }} className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded text-xs border border-gray-600" style={{color: '#F5F5DC'}}>Clear Planner</button>
                  <button onClick={() => { if (window.confirm('Clear save data from localStorage?')) { localStorage.removeItem('fantasyStudyQuestSave'); addLog('Debug: Save cleared — refresh to apply'); } }} className="bg-red-800 hover:bg-red-700 px-4 py-2 rounded text-xs border border-red-600" style={{color: '#F5F5DC'}}>Clear Save Data</button>
                </div>
              </div>

              {/* ── FULL RESET ── */}
              <button
                onClick={() => {
                  if (window.confirm('FULL RESET — Delete everything and start fresh?')) {
                    const newHero = makeName();
                    setHero(newHero); setCanCustomize(true); setCurrentDay(1); setHasStarted(false);
                    setHp(GAME_CONSTANTS.MAX_HP); setStamina(GAME_CONSTANTS.MAX_STAMINA);
                    setXp(0); setLevel(1); setHealthPots(0); setStaminaPots(0); setCleansePots(0); setFusionCrystals(0);
                    setCapturedMonsters([]); setWeapon(0); setArmor(0); setGold(0);
                    setEquippedWeapon(null); setWeaponInventory([]);
                    setEquippedArmor({ helmet: null, chest: null, gloves: null, boots: null });
                    setArmorInventory({ helmet: [], chest: [], gloves: [], boots: [] });
                    setEquippedGrimoire(null); setEquippedTome(null); setGrimoireInventory([]); setTomeInventory([]);
                    setWaveGoldTotal(0);
                    setMarketModifiers({ weapon: 1.0, armor: 1.0, grimoire: 1.0, tome: 1.0, healthPotion: 1.0, staminaPotion: 1.0, cleansePotion: 1.0, weaponOil: 1.0, armorPolish: 1.0, luckyCharm: 1.0 });
                    setLastMarketUpdateDay(0); setShopInventory([]); setDaysSinceShop(0); setDailyQuestCompleted(false);
                    setGuildPoints(0); setGauntletMilestone(1500); setGauntletUnlocked(false); setLastRealDay(null);
                    setSelectedZone(null); setActiveContract(null);
                    setCompletedLocationContracts([]); setDebugUnlockedZones([]); setPendingLocationRewards([]);
                    contractEncounterRef.current = null;
                    setTasks([]); setActiveTask(null); setTimer(0); setRunning(false); setShowPomodoro(false); setPomodoroTask(null);
                    setWeeklyPlan({ Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: [], Sunday: [] });
                    setCalendarTasks({}); setCalendarFocus({}); setCalendarEvents({});
                    setShowBoss(false); setBattling(false); setBattleMode(false);
                    setBossHp(0); setBossMax(0); setBattleType('regular'); setBattleMenu('main');
                    setIsFinalBoss(false); setBossName('');
                    setBossDebuffs({ poisonTurns: 0, poisonDamage: 0, poisonedVulnerability: 0, stunned: false });
                    setPlayerDebuffs({ bleedTurns: 0, bleedDamage: 0, armorShredTurns: 0 });
                    setRecklessStacks(0); setInPhase1(false); setInPhase2(false); setInPhase3(false);
                    setPhase1TurnCounter(0); setPhase2TurnCounter(0); setPhase2DamageStacks(0); setPhase3TurnCounter(0);
                    setShadowAdds([]); setAoeWarning(false); setBossFlash(false); setPlayerFlash(false);
                    setCurrentWaveEnemy(0); setTotalWaveEnemies(1); setWaveCount(0); setCurrentBattleCreature(null);
                    setIsBanditWave(false); setBanditWaveNumber(0); setBanditCaptainsDefeated([]);
                    setIsDaughtersWave(false); setDaughtersWaveNumber(0); setDaughtersCaptainsDefeated([]);
                    setIsEliteWave(false); setIsOrderFinal(false);
                    setChargeStacks(0); setEnemyDialogue(''); setEnragedTurns(0);
                    setLog([]); setGraveyard([]); setSkipCount(0); setConsecutiveDays(0);
                    setLastPlayedDate(null); setMiniBossCount(0); setCurseLevel(0);
                    setEliteBossDefeatedToday(false); setIsDayActive(false);
                    setStudyStats({ totalMinutesToday: 0, totalMinutesWeek: 0, sessionsToday: 0, longestStreak: 0, currentStreak: 0, tasksCompletedToday: 0, deepWorkSessions: 0, perfectDays: 0, weeklyHistory: [] });
                    setFlashcardDecks([]); setSelectedDeck(null); setCurrentCardIndex(0); setStudyQueue([]); setWrongCardIndices([]);
                    setAchievementStats({ tasksCompleted: 0, studyMinutes: 0, deepWorkSessions: 0, perfectDays: 0, bossesDefeated: 0, eliteBossesDefeated: 0, battlesFled: 0, battlesWon: 0, cardsStudied: 0, consecutiveDays: 0 });
                    setUnlockedAchievements([]);
                    localStorage.removeItem('fantasyStudyQuest');
                    addLog('Debug: FULL RESET complete');
                    setActiveTab('quest');
                  }
                }}
                className="w-full bg-red-900 hover:bg-red-800 px-4 py-2 rounded text-sm font-bold border-2 border-red-600 mt-2"
                style={{color: '#F5F5DC', letterSpacing: '0.1em'}}
              >
                🔄 FULL RESET
              </button>
            </div>

          )}
          </motion.div>
          </AnimatePresence>
          {showInventoryModal && (
            <InventoryModal
              setShowInventoryModal={setShowInventoryModal}
              currentDay={currentDay}
              hp={hp} stamina={stamina} setStamina={setStamina} level={level} gold={gold} curseLevel={curseLevel}
              getMaxHp={getMaxHp} getMaxStamina={getMaxStamina}
              getBaseAttack={getBaseAttack} getBaseDefense={getBaseDefense}
              healthPots={healthPots} staminaPots={staminaPots} setStaminaPots={setStaminaPots}
              cleansePots={cleansePots}
              equippedWeapon={equippedWeapon} setEquippedWeapon={setEquippedWeapon}
              equippedArmor={equippedArmor} setEquippedArmor={setEquippedArmor}
              equippedGrimoire={equippedGrimoire} setEquippedGrimoire={setEquippedGrimoire}
              equippedTome={equippedTome} setEquippedTome={setEquippedTome}
              weaponInventory={weaponInventory} setWeaponInventory={setWeaponInventory}
              armorInventory={armorInventory} setArmorInventory={setArmorInventory}
              grimoireInventory={grimoireInventory} setGrimoireInventory={setGrimoireInventory}
              tomeInventory={tomeInventory} setTomeInventory={setTomeInventory}
              luckyCharmActive={luckyCharmActive}
              getRarityColor={getRarityColor} sortByRarity={sortByRarity}
              addLog={addLog} useHealth={useHealth} useCleanse={useCleanse}
            />
          )}
          {showHealerModal && (
            <HealerModal
              setShowHealerModal={setShowHealerModal}
              hp={hp} getMaxHp={getMaxHp} gold={gold} setGold={setGold} setHp={setHp}
              stamina={stamina} getMaxStamina={getMaxStamina} setStamina={setStamina}
              healthPots={healthPots} staminaPots={staminaPots} cleansePots={cleansePots}
              setHealthPots={setHealthPots} setStaminaPots={setStaminaPots} setCleansePots={setCleansePots}
              curseLevel={curseLevel}
              cleansePotionPurchasedToday={cleansePotionPurchasedToday}
              setCleansePotionPurchasedToday={setCleansePotionPurchasedToday}
              marketModifiers={marketModifiers}
              getPotionPrice={getPotionPrice}
              addLog={addLog}
              useHealth={useHealth}
              useCleanse={useCleanse}
            />
          )}
          {showCraftingModal && (
            <CraftingModal
              setShowCraftingModal={setShowCraftingModal}
              craftingTab={craftingTab} setCraftingTab={setCraftingTab}
              level={level} gold={gold} currentDay={currentDay}
              healthPots={healthPots} staminaPots={staminaPots}
              cleansePots={cleansePots}
              cleansePotionPurchasedToday={cleansePotionPurchasedToday}
              weaponOilActive={weaponOilActive}
              armorPolishActive={armorPolishActive}
              luckyCharmActive={luckyCharmActive}
              weaponInventory={weaponInventory} armorInventory={armorInventory}
              grimoireInventory={grimoireInventory} tomeInventory={tomeInventory}
              shopInventory={shopInventory}
              merchantTab={merchantTab} setMerchantTab={setMerchantTab}
              marketModifiers={marketModifiers}
              studyWebsites={studyWebsites}
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
              playerFlash={playerFlash} playerDebuffs={playerDebuffs}
              battleType={battleType} isFinalBoss={isFinalBoss}
              currentWaveEnemy={currentWaveEnemy} totalWaveEnemies={totalWaveEnemies} waveCount={waveCount}
              inPhase2={inPhase2} inPhase3={inPhase3}
              phase2DamageStacks={phase2DamageStacks} shadowAdds={shadowAdds}
              aoeWarning={aoeWarning} showDodgeButton={showDodgeButton}
              enemyDialogue={enemyDialogue} setEnemyDialogue={setEnemyDialogue}
              hp={hp} getMaxHp={getMaxHp} stamina={stamina} getMaxStamina={getMaxStamina}
              level={level} hero={hero} gold={gold}
              healthPots={healthPots} staminaPots={staminaPots} curseLevel={curseLevel}
              currentDay={currentDay} battling={battling} battleMenu={battleMenu} setBattleMenu={setBattleMenu}
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
              victoryLoot={victoryLoot} victoryChest={victoryChest} onChestOpen={handleChestOpen} log={log}
              attack={attack} useCrushingBlow={useCrushingBlow}
              useSmite={useSmite} specialAttack={specialAttack} chargedStrike={chargedStrike}
              useTacticalSkill={useTacticalSkill} useHealth={useHealth}
              flee={flee} dodge={dodge} advance={advance} die={die}
              addLog={addLog} setStamina={setStamina} setStaminaPots={setStaminaPots}
              getRarityColor={getRarityColor}
              fusionCrystals={fusionCrystals} capturedMonsters={capturedMonsters}
              onCapture={captureMonster}
              isBanditWave={isBanditWave || isDaughtersWave || isCursedWave} banditEnemyImg={banditEnemyImg}
              raidFaction={isBanditWave ? 'bandit' : isDaughtersWave ? 'daughters' : isCursedWave ? 'cursed' : null}
              playerStunned={playerStunned} setPlayerStunned={setPlayerStunned}
              currentBattleCreature={currentBattleCreature}
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
        

        
      </div>
      )}
      {/* D&D modals — fixed overlays */}
      {diceRoll && introPhase === 'done' && (
        <DiceRollModal
          roll={diceRoll.roll} bonusXP={diceRoll.bonusXP} bonusGold={diceRoll.bonusGold} guildPointsEarned={diceRoll.guildPointsEarned} guildRank={guildRank}
          onClose={() => {
            setDiceRoll(null);
            if (pendingBattleSpawnRef.current) {
              const spawn = pendingBattleSpawnRef.current;
              pendingBattleSpawnRef.current = null;
              setTimeout(spawn, 300);
            }
          }}
        />
      )}
      {currentEncounter && introPhase === 'done' && (
        <EncounterModal
          encounter={currentEncounter}
          onAccept={() => applyEncounter(currentEncounter)}
        />
      )}
      {initiativeRoll && (
        <InitiativeModal data={initiativeRoll} onClose={() => {
          if (initiativeRoll.openingDamage > 0) {
            setTimeout(() => {
              setHp(h => Math.max(1, h - initiativeRoll.openingDamage));
              addLog(initiativeRoll.openingLog);
            }, 350);
          }
          if (initiativeRoll.stunned) setPlayerStunned(true);
          setInitiativeRoll(null);
        }} />
      )}
      {isDying && (
        <DeathSaveModal
          conMod={hero?.abilities ? Math.floor((hero.abilities.con - 10) / 2) : 0}
          onClose={handleDeathSaveClose}
        />
      )}
      {chargedCritRoll && (
        <ChargedCritModal data={chargedCritRoll} onClose={() => setChargedCritRoll(null)} />
      )}
      {contractFulfilled && (
        <ContractFulfilledModal
          tasks={tasks}
          xpEarned={contractFulfilled.xpEarned}
          tier={contractFulfilled.tier}
          onClose={() => setContractFulfilled(null)}
        />
      )}
      {asiPending && (
        <ASIModal
          hero={hero}
          newLevel={asiPending.newLevel}
          onClose={handleASIConfirm}
        />
      )}

      {/* Day-start banner */}
      {dayBannerOverlay && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 190, pointerEvents: 'none',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          background: 'radial-gradient(ellipse at center, rgba(15,10,5,0.97) 0%, rgba(5,3,0,0.98) 100%)',
          animation: 'day-banner-bg 2.4s ease-in-out forwards',
        }}>
          {/* Ornament line */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px',
            animation: 'day-banner-sub 2.4s ease-in-out forwards' }}>
            <div style={{ width: '120px', height: '1px', background: 'linear-gradient(to right, transparent, rgba(212,175,55,0.6))' }} />
            <span style={{ color: 'rgba(212,175,55,0.5)', fontSize: '9px', letterSpacing: '0.5em' }}>DAY {dayBannerOverlay.day}</span>
            <div style={{ width: '120px', height: '1px', background: 'linear-gradient(to left, transparent, rgba(212,175,55,0.6))' }} />
          </div>
          {/* Day number slam */}
          <div style={{
            fontFamily: "'Cinzel', serif", fontWeight: 900,
            fontSize: 'clamp(4rem, 16vw, 9rem)',
            letterSpacing: '0.08em', lineHeight: 1,
            color: '#F5F5DC',
            textShadow: '0 0 30px rgba(212,175,55,0.9), 0 0 70px rgba(180,130,0,0.5), 0 4px 8px rgba(0,0,0,1)',
            animation: 'day-banner-slam 2.4s cubic-bezier(0.16,1,0.3,1) forwards',
          }}>
            {String(dayBannerOverlay.day).padStart(2, '0')}
          </div>
          {/* Theme quote */}
          {dayBannerOverlay.theme && (
            <p style={{
              fontFamily: "'Cinzel', serif", fontSize: '0.8rem',
              letterSpacing: '0.25em', textTransform: 'uppercase',
              color: 'rgba(210,170,100,0.8)', marginTop: '22px', maxWidth: '480px', textAlign: 'center',
              animation: 'day-banner-sub 2.4s ease-in-out forwards',
            }}>
              "{dayBannerOverlay.theme}"
            </p>
          )}
        </div>
      )}

      {/* Loot fanfare */}
      {lootFanfare && (() => {
        const dur = lootFanfare.rarity === 'legendary' ? '2.8s' : lootFanfare.rarity === 'epic' ? '2.4s' : '2.0s';
        const col = GAME_CONSTANTS.RARITY_TIERS[lootFanfare.rarity].color;
        const colRgb = lootFanfare.rarity === 'legendary' ? '255,152,0'
          : lootFanfare.rarity === 'epic' ? '156,39,176' : '33,150,243';
        const label = lootFanfare.rarity === 'legendary' ? 'LEGENDARY' : lootFanfare.rarity === 'epic' ? 'EPIC FIND' : 'RARE FIND';
        return (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 195, pointerEvents: 'none',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            background: `radial-gradient(ellipse at center, rgba(${colRgb},0.18) 0%, rgba(0,0,0,0.88) 65%)`,
            animation: `loot-fanfare-bg ${dur} ease-in-out forwards`,
          }}>
            {/* Radial glow burst */}
            <div style={{
              position: 'absolute', inset: 0,
              background: `radial-gradient(ellipse at center, rgba(${colRgb},0.28) 0%, transparent 55%)`,
              animation: `loot-fanfare-glow ${dur} ease-out forwards`,
            }} />
            {/* Card */}
            <div style={{
              position: 'relative',
              padding: '28px 48px',
              border: `2px solid rgba(${colRgb},0.7)`,
              borderRadius: '10px',
              background: `linear-gradient(to bottom, rgba(${colRgb},0.12), rgba(0,0,0,0.6))`,
              boxShadow: `0 0 40px rgba(${colRgb},0.35), 0 0 80px rgba(${colRgb},0.12)`,
              textAlign: 'center',
              animation: `loot-fanfare-card ${dur} cubic-bezier(0.16,1,0.3,1) forwards`,
            }}>
              {/* Rarity label */}
              <p style={{
                fontFamily: "'Cinzel', serif", fontWeight: 700,
                fontSize: lootFanfare.rarity === 'legendary' ? '0.9rem' : '0.72rem',
                letterSpacing: '0.55em', textTransform: 'uppercase',
                color: col,
                textShadow: `0 0 12px rgba(${colRgb},0.9)`,
                marginBottom: '12px',
                animation: `loot-fanfare-label ${dur} ease-out forwards`,
              }}>{label}</p>
              {/* Item name */}
              <p style={{
                fontFamily: "'Cinzel', serif", fontWeight: 900,
                fontSize: 'clamp(1.2rem, 4vw, 2rem)',
                letterSpacing: '0.06em',
                color: '#F5F5DC',
                textShadow: `0 0 20px rgba(${colRgb},0.7), 0 2px 6px rgba(0,0,0,1)`,
                animation: `loot-fanfare-card ${dur} cubic-bezier(0.16,1,0.3,1) forwards`,
              }}>{lootFanfare.name}</p>
              {/* Bottom ornament */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '10px', marginTop: '14px',
                animation: `loot-fanfare-label ${dur} ease-out forwards`,
              }}>
                <div style={{ flex: 1, height: '1px', background: `linear-gradient(to right, transparent, rgba(${colRgb},0.5))` }} />
                <span style={{ color: `rgba(${colRgb},0.6)`, fontSize: '8px' }}>✦</span>
                <div style={{ flex: 1, height: '1px', background: `linear-gradient(to left, transparent, rgba(${colRgb},0.5))` }} />
              </div>
            </div>
          </div>
        );
      })()}

      {/* Level-up cinematic */}
      {levelUpOverlay && (() => {
        const dur = levelUpOverlay.skillUnlocked ? '3.2s' : '2.6s';
        return (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 190, pointerEvents: 'none',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            background: 'radial-gradient(ellipse at center, rgba(10,8,2,0.97) 0%, rgba(3,2,0,0.98) 100%)',
            animation: `levelup-bg ${dur} ease-in-out forwards`,
          }}>
            {/* Radial gold burst */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'radial-gradient(ellipse at center, rgba(212,175,55,0.45) 0%, rgba(180,130,0,0.15) 40%, transparent 70%)',
              animation: `levelup-burst ${dur} ease-out forwards`,
            }} />
            {/* LEVEL UP label */}
            <p style={{
              fontFamily: "'Cinzel', serif", fontWeight: 700,
              fontSize: '0.75rem', letterSpacing: '0.55em', textTransform: 'uppercase',
              color: 'rgba(212,175,55,0.85)', marginBottom: '10px',
              animation: `levelup-label ${dur} ease-out forwards`,
            }}>LEVEL UP</p>
            {/* Level number */}
            <div style={{
              fontFamily: "'Cinzel', serif", fontWeight: 900,
              fontSize: 'clamp(5rem, 18vw, 10rem)',
              letterSpacing: '0.06em', lineHeight: 1,
              color: '#F5F5DC',
              textShadow: '0 0 30px rgba(212,175,55,1), 0 0 80px rgba(180,130,0,0.7), 0 0 140px rgba(140,100,0,0.35), 0 4px 10px rgba(0,0,0,1)',
              animation: `levelup-number ${dur} cubic-bezier(0.16,1,0.3,1) forwards`,
            }}>
              {String(levelUpOverlay.level).padStart(2, '0')}
            </div>
            {/* Class + stat line */}
            <p style={{
              fontFamily: "'Cinzel', serif", fontSize: '0.78rem',
              letterSpacing: '0.3em', textTransform: 'uppercase',
              color: 'rgba(210,175,90,0.75)', marginTop: '18px',
              animation: `levelup-sub ${dur} ease-out forwards`,
            }}>
              {[levelUpOverlay.className, levelUpOverlay.primaryAbility ? `${levelUpOverlay.primaryAbility.toUpperCase()} +1` : null]
                .filter(Boolean).join('  ·  ')}
            </p>
            {/* Skill unlock banner */}
            {levelUpOverlay.skillUnlocked && (
              <div style={{
                marginTop: '22px', padding: '10px 28px',
                border: '1px solid rgba(212,175,55,0.5)',
                borderRadius: '6px',
                background: 'rgba(0,0,0,0.4)',
                textAlign: 'center',
                animation: `levelup-skill ${dur} ease-out forwards`,
              }}>
                <p style={{
                  fontFamily: "'Cinzel', serif", fontSize: '0.6rem',
                  letterSpacing: '0.45em', textTransform: 'uppercase',
                  color: 'rgba(212,175,55,0.65)', marginBottom: '4px',
                }}>{levelUpOverlay.skillUnlocked.label}</p>
                <p style={{
                  fontFamily: "'Cinzel', serif", fontWeight: 700,
                  fontSize: '0.95rem', letterSpacing: '0.1em',
                  color: '#F5F5DC',
                }}>{levelUpOverlay.skillUnlocked.name}</p>
              </div>
            )}
          </div>
        );
      })()}

      {/* Curse / death overlay */}
      {curseOverlay && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 190, pointerEvents: 'none',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          background: curseOverlay.isFinal
            ? 'radial-gradient(ellipse at center, rgba(20,0,30,0.98) 0%, rgba(0,0,0,0.99) 100%)'
            : 'radial-gradient(ellipse at center, rgba(30,0,0,0.97) 0%, rgba(5,0,10,0.98) 100%)',
          animation: `curse-bg ${curseOverlay.isFinal ? '3s' : '2.6s'} ease-in-out forwards`,
        }}>
          {/* Level badge */}
          {!curseOverlay.isFinal && (
            <p style={{
              fontFamily: "'Cinzel', serif", fontSize: '0.7rem', letterSpacing: '0.5em',
              textTransform: 'uppercase', color: 'rgba(180,80,80,0.8)', marginBottom: '12px',
              animation: 'curse-sub 2.6s ease-in-out forwards',
            }}>
              CURSE LEVEL {curseOverlay.level} / 3
            </p>
          )}
          {/* Main title */}
          <div style={{
            fontFamily: "'Cinzel', serif", fontWeight: 900,
            fontSize: curseOverlay.isFinal ? 'clamp(2.2rem, 8vw, 5rem)' : 'clamp(3rem, 12vw, 7rem)',
            letterSpacing: '0.1em', lineHeight: 1.1, textAlign: 'center',
            color: curseOverlay.isFinal ? '#C084FC' : '#EF4444',
            textShadow: curseOverlay.isFinal
              ? '0 0 25px rgba(192,132,252,0.9), 0 0 60px rgba(150,80,220,0.5), 0 4px 8px rgba(0,0,0,1)'
              : '0 0 25px rgba(239,68,68,0.9), 0 0 60px rgba(180,0,0,0.5), 0 4px 8px rgba(0,0,0,1)',
            animation: `curse-slam ${curseOverlay.isFinal ? '3s' : '2.6s'} cubic-bezier(0.16,1,0.3,1) forwards`,
            maxWidth: '600px', padding: '0 24px',
          }}>
            {curseOverlay.name}
          </div>
          {/* Subtitle */}
          <p style={{
            fontFamily: "'Cinzel', serif", fontSize: '0.72rem', letterSpacing: '0.3em',
            textTransform: 'uppercase', marginTop: '20px', textAlign: 'center',
            color: curseOverlay.isFinal ? 'rgba(192,132,252,0.6)' : 'rgba(239,68,68,0.55)',
            animation: `curse-sub ${curseOverlay.isFinal ? '3s' : '2.6s'} ease-in-out forwards`,
          }}>
            {curseOverlay.isFinal ? 'A new soul must take up the burden...' : 'You have fallen. The abyss marks you.'}
          </p>
        </div>
      )}

      {showAuthModal && (
        <AuthModal
          onClose={() => {
            setShowAuthModal(false);
            if (introPhase === 'mode-select') setIntroPhase('revealed');
          }}
          onSignIn={(user) => {
            setSupabaseUser(user);
            setShowAuthModal(false);
            if (introPhase === 'mode-select') setIntroPhase('revealed');
          }}
        />
      )}

      {showSetPasswordModal && (
        <SetPasswordModal onClose={() => setShowSetPasswordModal(false)} />
      )}

    </div>
  );
};

export default FantasyStudyQuest;
