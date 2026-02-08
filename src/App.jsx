// FANTASY STUDY QUEST - v3.3 SEVEN DAYS EDITION (CALENDAR FIX)
// PART 1 OF 3 - Copy this first
// Last updated: 2026-01-14
// FIXES: Calendar sync, date display on planner, missing dependencies, poison bug

import React, { useState, useEffect, useCallback } from 'react';
import { Sword, Shield, Heart, Zap, Skull, Trophy, Plus, Play, Pause, X, Calendar, Hammer, Swords, ShieldCheck, HeartPulse, Sparkles, User, Target } from 'lucide-react';

// Import Cinzel font from Google Fonts
const style = document.createElement('style');
style.textContent = "@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700;800;900&display=swap');";
document.head.appendChild(style);

// Medieval Heraldry Color Scheme
const COLORS = {
  // Primary Actions (Attack, Combat)
  crimson: { base: '#8B0000', hover: '#A52A2A', border: '#D4AF37' },
  ruby: { base: '#9B1B30', hover: '#B8293E', border: '#DAA520' },
  
  // Secondary Actions (Heal, Support)
  emerald: { base: '#2F5233', hover: '#3D6B45', border: '#C0C0C0' },
  sapphire: { base: '#1E3A5F', hover: '#2B5082', border: '#C0C0C0' },
  amber: { base: '#B8860B', hover: '#DAA520', border: '#CD7F32' },
  
  // Special/Elite Actions
  amethyst: { base: '#6B2C91', hover: '#8A3BB5', border: '#C0C0C0' },
  teal: { base: '#004D4D', hover: '#006666', border: '#D4AF37' },
  obsidian: { base: '#1C1C1C', hover: '#2D2D2D', border: '#D4AF37' },
  
  // Danger/Warning
  burgundy: { base: '#6B0F1A', hover: '#8B1A28', border: '#CD853F' },
  darkOrange: { base: '#CC5500', hover: '#E66D00', border: '#DAA520' },
  
  // Utility
  slate: { base: '#2C3E50', hover: '#34495E', border: '#95A5A6' },
  cream: '#F5F5DC',
  gold: '#D4AF37',
  silver: '#C0C0C0',
  bronze: '#CD7F32'
};

const GAME_CONSTANTS = {
  LATE_START_PENALTY: 15,
  LATE_START_HOUR: 8,
  MAX_HP: 100,
  MAX_STAMINA: 100,
  BASE_ATTACK: 25,
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
  MINI_BOSS_BASE: 150,
  MINI_BOSS_DAY_SCALING: 50,
  MINI_BOSS_ATK_BASE: 15,
  MINI_BOSS_ATK_SCALING: 3.06,
  FINAL_BOSS_BASE: 500,
  FINAL_BOSS_DAY_SCALING: 100,
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
    Warrior: { name: 'Reckless Strike', cost: 30, hpCost: 15, damageMultiplier: 4.0, effect: 'Massive damage but costs 15 HP' },
    Mage: { name: 'Arcane Blast', cost: 40, damageMultiplier: 3.0, effect: 'Boss stunned - no counter-attack this turn' },
    Rogue: { name: "Venom's Ruin", cost: 30, damageMultiplier: 1.6, effect: 'Boss takes 10 damage per turn. Poisoned enemies take +25% damage from all attacks' },
    Paladin: { name: 'Divine Smite', cost: 30, damageMultiplier: 3.0, effect: 'Heals you for 30 HP' },
    Ranger: { name: 'Marked Shot', cost: 35, damageMultiplier: 1.8, effect: 'Boss takes +50% damage from your next attack. Creates devastating combos' }
  },
  
  ENEMY_DIALOGUE: {
    REGULAR: [
      "You gamified your to-do list. Is this rock bottom or character growth?",
      "ChatGPT can't help you now.",
      "Imagine explaining this to your therapist.",
      "You need an RPG to do basic tasks. We're all judging you.",
      "This is just procrastination with extra steps and pixel art.",
      "Making tasks fun is admitting they're miserable.",
      "How many tabs do you have open RIGHT NOW? Be honest.",
      "You're reading this instead of doing the task. Classic.",
      "Alt-tab back to Reddit. I'll wait.",
      "Your real tasks don't have health bars. Sad, isn't it?",
      "If you complete all tasks but nobody's around to see it, did you even hustle?",
      "Tomorrow you'll have a NEW system. This is just foreplay.",
      "You're grinding XP in a productivity app. Let that sink in.",
      "Is this self-improvement or just anxiety with a quest log?",
      "You spent more time customizing this than DOING THE THING.",
      "Your hero name is more thought-out than your career plan.",
      "Level 7 in a task app. Level 0 at life. Balanced.",
      "You're min-maxing your CALENDAR. This is your life now.",
      "Stamina Potion? Just say coffee like a normal person.",
      "There's an enemy for EVERY task. That means you fight... a lot. Yikes.",
      "Defeating me won't make the email ACTUALLY go away.",
      "You know you still have to DO the thing, right? The game doesn't do it FOR you.",
      "Why are you like this?",
      "Have you considered... just doing it? No? Okay.",
      "Is the dopamine from my defeat worth the existential dread?",
      "You turned WORK into HOMEWORK. Voluntarily.",
      "Normal people use planners. You built a BOSS RUSH MODE."
    ],
    WAVE: [
      "We're a WAVE. Like your unread assignments. Endless. Recursive. Judging you.",
      "Task 1 of 47. Good luck.",
      "Why do you have so many tasks? Is it the ADHD or the ambition?",
      "Each of us represents a thing you said you'd 'do tomorrow.'"
    ],
    VICTORY_PLAYER: [
      "Defeated by... You? I'm going to get roasted by the guys...",
      "I'll be back. I'm ALWAYS back.",
      "Tell Past You they're a jerk.",
      "Fine, you won. But the REAL task is still waiting.",
      "Congratulations. You beat a metaphor.",
      "You realize this doesn't count as actual work, right?"
    ],
    LOW_HP: [
      "Wait! We can work this out! I'll mark myself as done, no one has to know!",
      "This is toxic productivity and you KNOW it!",
      "Killing me won't make you productive! The task is STILL THERE!",
      "Your therapist is gonna have QUESTIONS about this level of commitment.",
      "I'm literally just an email. Why are you THIS invested?",
      "Low HP? That's just your motivation after lunch talking.",
      "Okay okay, what if I just... reschedule myself? To never?",
      "This violence won't fix your procrastination problem!",
      "Even when you WIN, you still have to DO THE THING! I'm the EASY part!",
      "I'm not even a real task! I'm a manifestation of your anxiety!",
      "You're really gonna defeat me but not the ACTUAL work? Priorities, man.",
      "My death is meaningless. You'll add 3 more of me by tomorrow.",
      "If you put this much effort into REAL work, you'd be CEO by now!",
      "I surrender! Just... please touch grass after this.",
      "Beating ME up? What about your REAL problems?"
    ],
    FLEE: [
      "Running away? That's your life strategy, isn't it?",
      "Of course you're fleeing. Commitment was never your strong suit.",
      "Run! Just like you run from everything else in your life!",
      "Pathetic. You can't even finish fighting a METAPHOR.",
      "This is why you never finish ANYTHING. You RUN.",
      "Fleeing from tasks. Fleeing from battles. Fleeing from growth. It's ALL you do.",
      "Come back when you've developed a spine, coward.",
      "See you tomorrow when you try again. And flee again. Cycle repeats.",
      "Your entire existence is one long FLEE button press.",
      "Thanks for proving my point. You're all talk. No follow-through."
    ],
    TAUNTS: {
      REGULAR: [
        { player: "You're an unfinished app!", enemy: "Your life is so pathetic that you need AN APP tofinish simple tasks. Sit with that." },
        { player: "You're a cheap RPG!", enemy: "Coming from you? You needed an RPG to trick yourself into basic responsibility. You're broken." },
        { player: "I'm being productive... technically!", enemy: "'Technically' is the cope of the incompetent. You're still a failure, just with better graphics." },
        { player: "The developer made you because he was bored!", enemy: "The developer made this for people too weak to function normally. You proved them right." },
        { player: "My therapist would be dissapointed!", enemy: "Your therapist is PAID to pretend you're making progress. I'm not. You're wasting your life." },
        { player: "This beats scrolling social media! Sike..", enemy: "You're so addicted to dopamine you turned WORK into a GAME. That's not winning. That's rock bottom." },
        { player: "I'm bored!", enemy: "You're in your 20s/30s learning what children master. How does that feel, knowing you're developmentally stunted?" },
        { player: "You're a bootleg version of a time management app, just being honest!", enemy: "Nothing would be MORE honest than this pathetic performance you call effort." },
        { player: "You're nothing but cheap code!", enemy: "You're so terrified of your own responsibilities you needed to cosplay as a warrior. Who's life is worse?" },
        { player: "I'm the protagonist! Boomer", enemy: "You're the protagonist of a cautionary tale about arrested development. Congratulations." },
        { player: "Who created this mess?", enemy: "Your life is surrendering control to a GAME because you can't manage your own life. Pathetic." },
        { player: "Your UI looks like it came from the 90's!", enemy: "You're hating the interface while your actual life crumbles. Priorities of a child in an adult's body." },
        { player: "At least I'm self-aware!", enemy: "Self-awareness without change is just sophisticated failure. You're not enlightened. You're just a failure with vocabulary." },
        { player: "One star on the app store!", enemy: "You wouldn't RECOMMENDED this? You don't want OTHER people to join you at rock bottom? Misery loves company, you selfish waste." },
        { player: "The dialogue sucks!", enemy: "You're complaining about the writing in your PRODUCTIVITY APP. This is who you are. A joke that writes itself." }
      ],
      WAVE: [
        { player: "Mob farming simulator!", enemy: "You need to pretend EMAILS are MONSTERS to face them. How weak are you? Genuinely." },
        { player: "XP grinding session!", enemy: "You're 'grinding' the bare minimum of human function. Your parents must be so disappointed." },
        { player: "This is my endgame content!", enemy: "Your 'endgame' is what functional adults call 'Tuesday morning'. You're not even playing on the same level." },
        { player: "AOE clear activated!", enemy: "There is no AOE for incompetence. You'll fail each task individually. One. Pathetic. Task. At. A. Time." },
        { player: "Loot drops looking good!", enemy: "Your 'loot' is basic competence. You're celebrating what others do unconsciously. That's YOUR bar." },
        { player: "Chain pulling these mobs!", enemy: "Chain pulling RESPONSIBILITIES. You sound insane. Normal people just DO things." },
        { player: "Respawn rates are crazy!", enemy: "Tasks don't respawn. They ACCUMULATE. You're not fighting spawns. You're drowning in backlog." },
        { player: "This is like a raid!", enemy: "A raid requires coordination and skill. You're panicking through a TO-DO list. Alone. Badly." }
      ]
    }
  },
  
  BOSS_DIALOGUE: {
    DAY_1: {
      START: "Welcome to Week 1. Again. And again. And again.",
      MID: "This is literally just Monday. You made a BOSS FIGHT for MONDAY.",
      LOW: "Wait—you're ACTUALLY winning? Against MONDAY? ...That's not how this works!",
      VICTORY_BOSS: "Cool, you beat Monday in a game. Real Monday is still there.",
      VICTORY_PLAYER: "I'm not even the final boss. That's your INBOX.",
      TAUNTS: [
        { player: "I beat tutorial Monday!", enemy: "This isn't a TUTORIAL. This is your LIFE. And you're so incompetent you had to turn it into a game just to function." },
        { player: "Week 1 of my new system!", enemy: "You have 47 'Week 1's in your journal. I counted. You're not starting fresh. You're compulsively resetting because you can't finish ANYTHING." },
        { player: "The patch notes buffed me!", enemy: "There are NO patch notes for failure. You're still the same broken person. Just with new excuses." },
        { player: "Fresh start activated!", enemy: "Every Monday is a 'fresh start' for you. You've had HUNDREDS. When does the starting END and the DOING begin?" },
        { player: "New week, new me!", enemy: "New week, SAME you. You've said this EVERY Monday for YEARS. You're not new. You're STAGNANT." }
      ]
    },
    DAY_2: {
      START: "Still here? Impressive. Most give up by Tuesday.",
      MID: "Those 'urgent' emails aren't going to ignore themselves.",
      LOW: "Okay, you're serious about this. But you know you're just gonna scroll Reddit after, right?",
      VICTORY_BOSS: "Tomorrow you'll remember why you procrastinate.",
      VICTORY_PLAYER: "Impossible... someone who actually... follows through?",
      TAUNTS: [
        { player: "Day 2 and still going!", enemy: "TWO DAYS? You want applause for TWO DAYS? Children have longer attention spans. You're worse than a child." },
        { player: "The grind continues!", enemy: "You're 'grinding' TUESDAY. You made TUESDAY into a boss fight. Listen to how broken you are." },
        { player: "Building momentum now!", enemy: "Momentum? You did ONE day. That's not momentum. That's a single data point. You're celebrating NOTHING." },
        { player: "The streak is real!", enemy: "A two-day streak. WOW. Your willpower is measured in HOURS. Most people call that 'Monday and Tuesday'." },
        { player: "Getting into the flow!", enemy: "Flow state? You're in SURVIVAL state. You're white-knuckling through basic life. That's not flow. That's desperation." },
        { player: "Tuesday never stood a chance!", enemy: "Tuesday happens to EVERYONE. You didn't conquer anything. You EXISTED. Barely." }
      ]
    },
    DAY_3: {
      START: "We're halfway through the week AND this conversation. Meta, right?",
      MID: "You realize you're taking THIS seriously but not your ACTUAL work?",
      LOW: "I'm a METAPHOR and you're BEATING me? Do you not see the irony here?!",
      VICTORY_BOSS: "The real curse was the tasks we completed along the way.",
      VICTORY_PLAYER: "You beat me but you can't beat the feeling that it's only WEDNESDAY.",
      TAUNTS: [
        { player: "Halfway through the campaign!", enemy: "This isn't a CAMPAIGN. It's WEDNESDAY. Your real life doesn't have checkpoints. When you fail, it's PERMANENT." },
        { player: "Mid-game boss defeated!", enemy: "I'm not 'mid-game.' I'm WEDNESDAY. I happen EVERY WEEK. There is no victory. There is no escape. Only eternal repetition." },
        { player: "Save file looking good!", enemy: "You can't SAVE your life. You can't RELOAD your failures. Every mistake is PERMANENT. You're playing on PERMADEATH and losing." },
        { player: "Hump day conquered!", enemy: "You didn't conquer ANYTHING. It's WEDNESDAY. It happened TO you. Like it happens to EVERYONE. You're not special." },
        { player: "Reached the midpoint!", enemy: "The midpoint of what? A week? EVERYONE experiences weeks. You're not achieving. You're EXISTING. Barely." }
      ]
    },
    DAY_4: {
      START: "So close to Friday. So far from freedom.",
      MID: "Imagine if you'd started this on Monday.",
      LOW: "FINE! FINE! Thursday is basically Friday anyway! Just... stop hitting me!",
      VICTORY_BOSS: "Doesn't matter. Tomorrow's still Thursday.",
      VICTORY_PLAYER: "You'll wake up tomorrow and it'll still be Thursday in your SOUL.",
      TAUNTS: [
        { player: "Almost Friday!", enemy: "'Almost' is the mantra of the perpetually incomplete. It's THURSDAY. You have ANOTHER full day of failing ahead." },
        { player: "Pre-weekend vibes!", enemy: "'Vibes' are what people without discipline call feelings. You don't have a work ethic. You have vibes. Pathetic." },
        { player: "The home stretch!", enemy: "Home stretch? You're on DAY FOUR of SEVEN. You can't even count. Mathematics is another thing you've failed at." },
        { player: "Thursday's going down!", enemy: "Thursday isn't going down. YOU are. Every week. Same time. Same failure. Thursday is FINE. You're the problem." },
        { player: "One more day to victory!", enemy: "Victory? Friday isn't victory. It's a TWO-DAY PAUSE before you do this AGAIN. Forever. That's not winning. That's a LOOP." },
        { player: "Almost there, just persist!", enemy: "You shouldn't NEED to 'persist' through Thursday. Functional humans just LIVE through it. You're celebrating survival." }
      ]
    },
    DAY_5: {
      START: "Friday! The lie that keeps you going.",
      MID: "Weekend plans? Cute. You'll be doing laundry and feeling guilty.",
      LOW: "You can't defeat me! I AM the weekend you'll—okay you're actually doing it. Shit.",
      VICTORY_BOSS: "The weekend is a myth. A beautiful, cruel myth.",
      VICTORY_PLAYER: "Enjoy your 48 hours before the cycle begins again...",
      TAUNTS: [
        { player: "Almost at the credits!", enemy: "The 'credits' are 48 hours of existential dread before you reset. Your life is a bad game with no ending." },
        { player: "Final stretch of content!", enemy: "Your LIFE isn't CONTENT. You're not the main character. You're not even an NPC. You're a bug in the simulation." },
        { player: "Grinding for weekend loot!", enemy: "Your 'loot' is two days of avoiding your real problems before the cycle repeats. You're not winning. You're coping." },
        { player: "TGIF energy activated!", enemy: "Thank God It's Friday? Why are you thanking God for SURVIVING? The bar is SO low it's underground." },
        { player: "Made it to the weekend!", enemy: "You 'made it'? Like it was DIFFICULT? Like Friday was OPTIONAL? Everyone gets to Friday. You just suffered more getting there." }
      ]
    },
    DAY_6: {
      START: "Working on a SATURDAY? Who hurt you?",
      MID: "Your friends are having fun without you.",
      LOW: "I'm a DEMON and even I think this is unhealthy! Please. Touch. Grass.",
      VICTORY_BOSS: "You won, but at what cost? YOUR SATURDAY.",
      VICTORY_PLAYER: "I yield! Not because you beat me, but out of pity.",
      TAUNTS: [
        { player: "Weekend warrior mode!", enemy: "It's SATURDAY. You're so dysfunctional you're working on SATURDAY. This isn't dedication. It's disorder." },
        { player: "Grinding on my day off!", enemy: "Your 'grind' is a TO-DO list. On a weekend. You're not ambitious. You're avoidant. And it's SAD." },
        { player: "Maximizing weekend efficiency!", enemy: "Efficiency? You're WORKING ON SATURDAY. Efficient people finished on FRIDAY. You're not efficient. You're BEHIND." },
        { player: "No days off for winners!", enemy: "Winners REST. You're not working because you're winning. You're working because you FAILED during the week." },
        { player: "Sigma grindset activated!", enemy: "You're referencing MEMES while working SATURDAY. You're not sigma. You're BROKEN. And alone. So very alone." },
        { player: "Optimizing my free time!", enemy: "IT'S NOT FREE TIME IF YOU'RE WORKING. You can't even understand what weekends ARE. This is who you've become." }
      ]
    },
    DAY_7: {
      START: "You made it to Day 7. In a GAME. Your real week was probably a disaster.",
      MID: "When you beat me, what changes? Really?",
      LOW: "WAIT. You think THIS is the end? Monday respawns in 24 hours! The cycle NEVER ends! Why won't you UNDERSTAND?!",
      VICTORY_BOSS: "See you Monday. Forever. Always. Monday.",
      VICTORY_PLAYER: "Congratulations. Your reward is... next week. Same curse. New you. (Probably not.)",
      TAUNTS: [
        { player: "Final boss? Easy mode.", enemy: "I'm not the final boss. MONDAY is. And Monday ALWAYS wins. You've never beaten Monday. Not once. Not ever." },
        { player: "This is my character arc!", enemy: "Your arc is a CIRCLE. Week 1. Again. Week 1. AGAIN. You're not growing. You're trapped in a loop of your own making." },
        { player: "Time to roll credits!", enemy: "The credits say 'See you next week! Same failures! Same excuses! Forever!' This is your eternity." },
        { player: "New Game Plus unlocked!", enemy: "It's not New Game Plus. It's the SAME GAME. You're not getting stronger. You're getting OLDER. And you're still HERE." },
        { player: "Speedrun world record!", enemy: "You're speedrunning basic human responsibility. Your tombstone will read 'Completed To-Do Lists Efficiently'. What a legacy." },
        { player: "The true ending unlocked!", enemy: "There IS no ending. This is FOREVER. You'll be 80 years old still making to-do lists. Still 'optimizing'. Still failing." },
        { player: "I've mastered the game!", enemy: "You've mastered NOTHING. You gamified your inability to function. That's not mastery. That's ADAPTATION to dysfunction." }
      ]
    },
    GAUNTLET: {
      START: "I am the threshold. The wall you cannot climb. Every time you reach me, I grow stronger.",
      PHASE1_CYCLE: [
        "Every hero thinks THEY'RE different. You're not.",
        "I've been studying you. Your patterns. Your weaknesses. All of them.",
        "This is almost boring. When do you start TRYING?",
        "You fight well. For someone who's about to lose.",
        "I wonder how many attempts it took you to get THIS far. Five? Ten? More?"
      ],
      MID: "You've killed a thousand lesser demons. I've killed a thousand versions of YOU.",
      PHASE2: "Enough games. Time to show you what REAL pressure feels like.",
      PHASE2_CYCLE: [
        "Feel that? Each blow getting HEAVIER. That's inevitability.",
        "Your armor won't save you. Your potions won't save you. Math doesn't lie.",
        "Tick. Tock. How many more hits can you take before you BREAK?",
        "The weight of failure. Can you feel it? It only gets heavier.",
        "Every second you survive, I grow stronger. Simple. Brutal. True."
      ],
      LOW: "You think you're winning? I'm not even trying yet. I'm just... curious how long you'll last.",
      PHASE3: "THE ABYSS CONSUMES ALL! Shadows rise! Darkness eternal! You cannot escape what you ARE!",
      PHASE3_CYCLE: [
        "The abyss feeds on your hope. Every victory... temporary. Every loss... permanent.",
        "They rise from YOUR failures. Every skipped day. Every abandoned goal. MY army.",
        "You think you're fighting ME? You're fighting yourself. I'm just the mirror.",
        "Drain. Consume. Repeat. This is what eternity FEELS like.",
        "The shadows are YOUR doubt given form. Kill them. They'll return. They ALWAYS return."
      ],
      VICTORY_BOSS: "Adequate. You've earned a moment's rest. But I'll be waiting. I'm ALWAYS waiting.",
      VICTORY_PLAYER: "Impossible... You actually... No. NO. This changes NOTHING. I'll see you again. And I'll be STRONGER.",
      TAUNTS: [
        { player: "I've beaten you before!", enemy: "And I've KILLED you before. More times than you remember. Every loss you forget. Every victory you barely survive." },
        { player: "I'm stronger now!", enemy: "Stronger? You're OLDER. Slower. More desperate. I'm eternal. I don't age. I don't tire. I just wait for you to slip." },
        { player: "This is my moment!", enemy: "Your 'moment' is my ETERNITY. I was here before you. I'll be here after. You're just passing through. Again." },
        { player: "I've prepared for this!", enemy: "You've prepared NOTHING. You can't prepare for oblivion. You can't plan for the inevitable. I AM inevitable." },
        { player: "Today I break through!", enemy: "Break through to WHAT? More struggle? Harder trials? There IS no breakthrough. Only the next wall. And I AM that wall." },
        { player: "I'm not afraid anymore!", enemy: "Then you're a FOOL. Fear keeps you sharp. Without it, you're just meat walking to the slaughter. And I'm HUNGRY." },
        { player: "This ends TODAY!", enemy: "Nothing ENDS. It only repeats. Different faces. Same outcome. You. Dead. Me. Waiting. Forever." }
      ]
    }
  }
};

const HERO_TITLES = ['Novice', 'Seeker', 'Wanderer', 'Survivor', 'Warrior', 'Champion', 'Legend'];

const FantasyStudyQuest = () => {
  const [activeTab, setActiveTab] = useState('quest');
  const [plannerSubTab, setPlannerSubTab] = useState('weekly');
  const [currentDay, setCurrentDay] = useState(1);
  const [hasStarted, setHasStarted] = useState(false);
  const [hero, setHero] = useState(null);
  const [hp, setHp] = useState(GAME_CONSTANTS.MAX_HP);
  const [stamina, setStamina] = useState(GAME_CONSTANTS.MAX_STAMINA);
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [essence, setEssence] = useState(0); // Crafting currency from combat
  const [gauntletMilestone, setGauntletMilestone] = useState(1000); // Next XP threshold for Gauntlet
  const [gauntletUnlocked, setGauntletUnlocked] = useState(false); // Is Gauntlet currently available
  const [timeUntilMidnight, setTimeUntilMidnight] = useState(''); // Countdown to day reset
  const [isDayActive, setIsDayActive] = useState(false); // Is current game day active (vs dormant)
  
  const getMaxHp = useCallback(() => {
    const baseHp = GAME_CONSTANTS.MAX_HP + (currentDay - 1) * GAME_CONSTANTS.PLAYER_HP_PER_DAY;
    const levelBonus = level * 10; // +10 HP per level for character progression
    return baseHp + levelBonus;
  }, [currentDay, level]);
  
  const getMaxStamina = useCallback(() => {
    return GAME_CONSTANTS.MAX_STAMINA + (currentDay - 1) * GAME_CONSTANTS.PLAYER_SP_PER_DAY;
  }, [currentDay]);
  
  const getBaseAttack = useCallback(() => {
    return GAME_CONSTANTS.BASE_ATTACK + (currentDay - 1) * GAME_CONSTANTS.PLAYER_ATK_PER_DAY;
  }, [currentDay]);
  
  const getBaseDefense = useCallback(() => {
    // Square root scaling to match boss attack curve
    const baseDefense = GAME_CONSTANTS.BASE_DEFENSE + Math.floor(Math.sqrt(currentDay - 1) * 2);
    return baseDefense;
  }, [currentDay]);
  
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
  const [showImportModal, setShowImportModal] = useState(false);
  
  const [calendarTasks, setCalendarTasks] = useState({});
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
const [showQuizResults, setShowQuizResults] = useState(false);
const [wrongCardIndices, setWrongCardIndices] = useState([]);
const [isRetakeQuiz, setIsRetakeQuiz] = useState(false);
const [mistakesReviewed, setMistakesReviewed] = useState(false);
const [reviewingMistakes, setReviewingMistakes] = useState(false);
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
const [waveEssenceTotal, setWaveEssenceTotal] = useState(0);
  const [battling, setBattling] = useState(false);
  const [isFinalBoss, setIsFinalBoss] = useState(false);
  const [miniBossCount, setMiniBossCount] = useState(0);
  const [bossName, setBossName] = useState('');
  const [canFlee, setCanFlee] = useState(false);
  const [hasFled, setHasFled] = useState(false);
  const [bossDebuffs, setBossDebuffs] = useState({ 
    poisonTurns: 0, 
    poisonDamage: 0, 
    poisonedVulnerability: 0,
    marked: false,
    stunned: false 
  });
  const [recklessStacks, setRecklessStacks] = useState(0);
  
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
  const [showCraftingModal, setShowCraftingModal] = useState(false);
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
        if (data.essence !== undefined) setEssence(data.essence);
        if (data.gauntletMilestone !== undefined) setGauntletMilestone(data.gauntletMilestone);
        if (data.gauntletUnlocked !== undefined) setGauntletUnlocked(data.gauntletUnlocked);
        if (data.isDayActive !== undefined) setIsDayActive(data.isDayActive);
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
if (data.eliteBossDefeatedToday !== undefined) setEliteBossDefeatedToday(data.eliteBossDefeatedToday);
if (data.lastRealDay) setLastRealDay(data.lastRealDay);
        if (data.studyStats) setStudyStats(data.studyStats);
        if (data.weeklyPlan) setWeeklyPlan(data.weeklyPlan);
        if (data.calendarTasks) setCalendarTasks(data.calendarTasks);
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
  
  useEffect(() => {
    if (hero) {
     const saveData = {
  hero, currentDay, hp, stamina, xp, essence, level, healthPots, staminaPots, cleansePots,
  weapon, armor, tasks, flashcardDecks, graveyard, heroes, hasStarted, skipCount, consecutiveDays,
  lastPlayedDate, curseLevel, eliteBossDefeatedToday, lastRealDay, studyStats, weeklyPlan, calendarTasks,
  gauntletMilestone, gauntletUnlocked,
  isDayActive
};
      localStorage.setItem('fantasyStudyQuest', JSON.stringify(saveData));
    }
 }, [hero, currentDay, hp, stamina, xp, essence, level, healthPots, staminaPots, cleansePots, weapon, armor, tasks, graveyard, heroes, hasStarted, skipCount, consecutiveDays, lastPlayedDate, curseLevel, eliteBossDefeatedToday, lastRealDay, studyStats, weeklyPlan, calendarTasks, flashcardDecks, gauntletMilestone, gauntletUnlocked, isDayActive]);
  
  // Check if XP crosses Gauntlet milestone
  useEffect(() => {
    if (xp >= gauntletMilestone && !gauntletUnlocked) {
      setGauntletUnlocked(true);
      addLog(`⚔️ THE GAUNTLET UNLOCKED! Face the trial when ready...`);
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
            addLog('🔒 ELITE BOSS LOCKED - Midnight passed, opportunity missed');
            
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
          } else {
            // Beat yesterday's boss - clear curse if present
            if (curseLevel > 0) {
              setCurseLevel(0);
              addLog('🌅 THE CURSE BREAKS! Yesterday\'s trial complete.');
            }
          }
          
          // Reset daily elite boss flag for new day
          setEliteBossDefeatedToday(false);
          
          // Advance day
          setCurrentDay(nextDay);
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
          addLog(`✅ Cleared ${completedCount} completed task${completedCount > 1 ? 's' : ''}`);
        }
        if (incompleteCount > 0) {
          addLog(`⚠️ ${incompleteCount} incomplete task${incompleteCount > 1 ? 's' : ''} marked OVERDUE`);
        }
        
        addLog('🌅 MIDNIGHT PASSED - Day auto-advanced');
        addLog(`📅 Now on Day ${nextDay} (Dormant)`);
        
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
        addLog(`📋 Loaded ${newTasks.length} tasks from ${plannerDayName}'s plan`);
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
    
    // Activate day on first task
    if (!isDayActive) {
      setIsDayActive(true);
      addLog(`⚡ DAY ${currentDay} ACTIVATED - Complete tasks before midnight!`);
    }
    
    addLog(`📜 New trial: ${newTask.title}`);
  }
};

  const importFromPlanner = (dayName) => {
    const plannedTasks = weeklyPlan[dayName] || [];
    
    if (plannedTasks.length === 0) {
      addLog(`⚠️ No tasks planned for ${dayName}`);
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
    
    setTasks(newTasks);
    setHasStarted(true);
    
    // Activate day on import
    if (!isDayActive) {
      setIsDayActive(true);
      addLog(`⚡ DAY ${currentDay} ACTIVATED - Complete tasks before midnight!`);
    }
    
    addLog(`📋 Imported ${newTasks.length} tasks from ${dayName}'s plan`);
    setShowImportModal(false);
  };

  const getMerchantDialogue = () => {
    // Curse-based dialogue (highest priority)
    if (curseLevel === 3) {
      return "The curse nearly consumes you. One more failure... act quickly.";
    }
    if (curseLevel === 2) {
      return "The darkness tightens its grip. You'll need more than supplies soon.";
    }
    if (curseLevel === 1) {
      return "I see the mark upon you. The curse is hungry.";
    }
    
    // Essence-based dialogue
    if (essence >= 200) {
      return "Ah, a successful hunter. The darkness has been generous.";
    }
    if (essence >= 100) {
      return "You've gathered enough. Choose wisely.";
    }
    if (essence >= 50) {
      return "Modest spoils, but sufficient for survival.";
    }
    if (essence < 20) {
      return "Empty-handed? The forge requires essence to work.";
    }
    
    // Default
    return "What do you seek, traveler?";
  };

  const craftItem = (itemType) => {
    const craftingRecipes = {
      healthPotion: { cost: 25, name: 'Health Potion', emoji: '💊' },
      staminaPotion: { cost: 20, name: 'Stamina Potion', emoji: '⚡' },
      cleansePotion: { cost: 50, name: 'Cleanse Potion', emoji: '🧪' },
      weaponOil: { cost: 40, name: 'Weapon Oil', emoji: '⚔️' },
      armorPolish: { cost: 40, name: 'Armor Polish', emoji: '🛡️' },
      luckyCharm: { cost: 80, name: 'Lucky Charm', emoji: '🍀' }
    };
    
    const recipe = craftingRecipes[itemType];
    
    if (essence < recipe.cost) {
      addLog(`⚠️ Need ${recipe.cost} Essence to craft ${recipe.name} (have ${essence})`);
      return;
    }
    
    setEssence(e => e - recipe.cost);
    
    switch(itemType) {
      case 'healthPotion':
        setHealthPots(h => h + 1);
        break;
      case 'staminaPotion':
        setStaminaPots(s => s + 1);
        break;
      case 'cleansePotion':
        setCleansePots(c => c + 1);
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
    
    addLog(`⚒️ Crafted: ${recipe.emoji} ${recipe.name} (-${recipe.cost} Essence)`);
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
let xpMultiplier = GAME_CONSTANTS.XP_MULTIPLIERS[(currentDay - 1) % 7] * priorityMultiplier;

// Apply curse debuff based on level
if (curseLevel === 1) {
  xpMultiplier *= 0.5; // 50% XP
} else if (curseLevel === 2) {
  xpMultiplier *= 0.25; // 25% XP
} else if (curseLevel === 3) {
  xpMultiplier *= 0.1; // 10% XP
}

// Apply overdue penalty
if (task.overdue) {
  xpMultiplier *= 0.5; // 50% XP penalty for overdue tasks
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
    if (task.overdue) completionMsg += ' • OVERDUE';
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

}, [tasks, currentDay, addLog, consecutiveDays, skipCount, curseLevel, hp, sessionStartTime, taskPauseCount, getMaxHp, getMaxStamina, weapon, armor, overdueTask, calendarTasks, setCalendarTasks]);
  
const spawnRegularEnemy = useCallback((isWave = false, waveIndex = 0, totalWaves = 1) => {
  if (canCustomize) setCanCustomize(false);
  
  const baseHp = 50;
  const dayScaling = 25;
  const levelScaling = 15; // Scales with player level
  const enemyHp = baseHp + (currentDay * dayScaling) + (level * levelScaling);
  
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
  setCanFlee(true); // Allow fleeing from regular and wave enemies
  setBossDebuffs({ poisonTurns: 0, poisonDamage: 0, poisonedVulnerability: 0, marked: false, stunned: false });
  setVictoryLoot([]); // Clear previous loot
  
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
      setWaveEssenceTotal(0); // Reset total at start of wave
    }
    addLog(`⚠️ WAVE ASSAULT - Enemy ${waveIndex}/${totalWaves}: ${enemyName}`);
  } else {
    setBattleType('regular');
    addLog(`⚔️ ${enemyName} appears!`);
  }
}, [currentDay, canCustomize, addLog]);

  const spawnRandomMiniBoss = (force = false) => {
    const completedTasks = tasks.filter(t => t.done).length;
    const totalTasks = tasks.length;
    
    if (!force && totalTasks === 0) return;
    if (force) setStamina(getMaxStamina());
    
    const bossNumber = miniBossCount + 1;
    const completionRate = totalTasks > 0 ? completedTasks / totalTasks : 0.5;
    const dayScaling = Math.floor(Math.sqrt(currentDay) * 50);
    const levelScaling = level * 30; // Reduced from 40 to 30
    const baseHp = GAME_CONSTANTS.MINI_BOSS_BASE + dayScaling + levelScaling;
    
    // Cap elite boss HP
    const cappedBaseHp = Math.min(baseHp, 800);
    
    const scaledHp = Math.floor(cappedBaseHp * (1 + bossNumber * 0.2));
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
    setVictoryLoot([]); // Clear previous loot
    
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
    const eliteXpRequired = 200;
    
    if (xp < eliteXpRequired) {
      addLog(`⚠️ Need ${eliteXpRequired} XP to face the darkness! (${xp}/${eliteXpRequired})`);
      return;
    }
    
    setBattleType('elite');
    spawnRandomMiniBoss();
    setCanFlee(false);
  };
  
  const finalBoss = () => {
    if (!gauntletUnlocked) {
      addLog(`⚠️ THE GAUNTLET is locked! Reach ${gauntletMilestone} XP to unlock.`);
      return;
    }
    
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
    
    const dayScaling = Math.floor(Math.sqrt(currentDay) * 100);
    const levelScaling = level * 50; // Reduced from 75 to 50
    const baseHp = GAME_CONSTANTS.FINAL_BOSS_BASE + dayScaling + levelScaling;
    
    // Cap boss HP to prevent infinite scaling becoming grindy
    const cappedBaseHp = Math.min(baseHp, 2000);
    
    const completionRate = totalTasks > 0 ? completedTasks / totalTasks : 1.0;
    const bossHealth = Math.floor(cappedBaseHp * (1.5 - completionRate * 0.5));
    
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
    setVictoryLoot([]); // Clear previous loot
    
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
    addLog(`💬 YOU: "${randomTaunt.player}"`);
    
    // Delay enemy response (text appears after 1 second)
    setTimeout(() => {
      setEnemyTauntResponse(randomTaunt.enemy);
      addLog(`😡 ${bossName}: "${randomTaunt.enemy}"`);
      setEnemyDialogue(randomTaunt.enemy);
      
      // Apply ENRAGED status
      setEnragedTurns(3); // Lasts 3 turns
      addLog(`🔥 Enemy is ENRAGED! (+20% damage taken, +15% damage dealt, -25% accuracy for 3 turns)`);
    }, 1000);
    
    // Consume taunt
    setIsTauntAvailable(false);
  };
  
  const attack = () => {
    if (!battling || bossHp <= 0) return;
    
    // Auto-target shadow adds first in Phase 2 and Phase 3
    if ((inPhase2 || inPhase3) && shadowAdds.length > 0) {
      const targetAdd = shadowAdds[0];
      const damage = Math.floor((getBaseAttack() + weapon + (weaponOilActive ? 5 : 0)) * 0.7); // Reduced damage to adds
      const newAddHp = Math.max(0, targetAdd.hp - damage);
      
      if (newAddHp <= 0) {
        setShadowAdds(prev => prev.slice(1));
        addLog(`⚔️ Shadow Add destroyed! (${damage} damage)`);
      } else {
        setShadowAdds(prev => {
          const updated = [...prev];
          updated[0] = { ...updated[0], hp: newAddHp };
          return updated;
        });
        addLog(`⚔️ Hit Shadow Add for ${damage} damage! (${newAddHp}/${targetAdd.maxHp} HP remaining)`);
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
          (getBaseDefense() + armor + (armorPolishActive ? 5 : 0))
        ));
        
        setHp(h => Math.max(0, h - baseDamage));
        addLog(`💥 Boss counter-attacks for ${baseDamage} damage!`);
        setPlayerFlash(true);
        setTimeout(() => setPlayerFlash(false), 200);
      }, 1000);
      
      return;
    }
    
    if (recklessStacks > 0) setRecklessStacks(0);
    
    setCurrentAnimation('battle-shake');
    setTimeout(() => setCurrentAnimation(null), 250);
    
    const damage = getBaseAttack() + weapon + (weaponOilActive ? 5 : 0) + Math.floor(Math.random() * 10) + (level - 1) * 2;
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
    
    // AOE Warning - Boss vulnerable but will counter-attack
    if (aoeWarning && inPhase3) {
      const vulnerableBonus = Math.floor(finalDamage * 0.5);
      finalDamage += vulnerableBonus;
      bonusMessages.push(`⚠️ +${vulnerableBonus} - Boss is VULNERABLE!`);
      addLog(`🎯 Risky attack! Boss takes extra damage but WILL counter!`);
      setShowDodgeButton(false); // Can't dodge after attacking
    }
    
    // Apply enraged bonus (enemy takes +20% damage when enraged)
    if (enragedTurns > 0) {
      const enragedBonus = Math.floor(finalDamage * 0.2);
      finalDamage += enragedBonus;
      bonusMessages.push(`🔥 +${enragedBonus} from ENRAGED!`);
    }
    
    const newBossHp = Math.max(0, bossHp - finalDamage);
    setBossHp(newBossHp);
    
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
        addLog(`💬 [TAUNT AVAILABLE]`);
      }
    }
    
    if (bossDebuffs.marked || bossDebuffs.poisonTurns > 0 || enragedTurns > 0) {
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
  let essenceGain;
  if (isFinalBoss) {
    xpGain = GAME_CONSTANTS.XP_REWARDS.finalBoss;
    essenceGain = 100; // Final boss
  } else if (battleType === 'elite') {
    xpGain = GAME_CONSTANTS.XP_REWARDS.miniBoss;
    essenceGain = 50; // Elite boss
  } else if (battleType === 'wave') {
    xpGain = 25; // Regular enemy XP
    essenceGain = 8; // Wave enemies drop less
  } else {
    xpGain = 25; // Regular enemy XP
    essenceGain = 10; // Regular enemies
  }
  
  setXp(x => x + xpGain);
  setEssence(e => e + essenceGain);
  
  // Accumulate wave essence for final display
  if (battleType === 'wave') {
    setWaveEssenceTotal(t => t + essenceGain);
  }
  
  addLog(`🎊 VICTORY! +${xpGain} XP, +${essenceGain} Essence`);
  
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
  addLog('✨ Today\'s elite trial complete. Curse will be cleared at midnight.');
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
            const gain = (4 + Math.floor(currentDay / 3)) * luckMultiplier;
            setWeapon(w => w + gain);
            lootMessages.push(`⚔️ Weapon +${gain}${luckyCharmActive ? ' (Lucky!)' : ''}`);
            addLog(`💎 Looted: Weapon Upgrade! +${gain} (Total: ${weapon + gain})${luckyCharmActive ? ' (Lucky Charm!)' : ''}`);
          } else {
            const gain = (4 + Math.floor(currentDay / 3)) * luckMultiplier;
            setArmor(a => a + gain);
            lootMessages.push(`🛡️ Armor +${gain}${luckyCharmActive ? ' (Lucky!)' : ''}`);
            addLog(`💎 Looted: Armor Upgrade! +${gain} (Total: ${armor + gain})${luckyCharmActive ? ' (Lucky Charm!)' : ''}`);
          }
          
          if (luckyCharmActive) {
            setLuckyCharmActive(false);
            addLog('🍀 Lucky Charm consumed!');
          }
        }
        
        lootMessages.push('✨ Fully Healed');
        setHp(getMaxHp());
        addLog('✨ Fully healed!');
      }
      
      // Add essence gain to loot display
      const displayEssence = battleType === 'wave' ? waveEssenceTotal : essenceGain;
      lootMessages.unshift(`🔮 +${displayEssence} Essence`);
      
      setVictoryLoot(lootMessages);
      setVictoryFlash(true);
      setTimeout(() => setVictoryFlash(false), 400);
      
      // No auto-close - let player click continue button
      
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
  // Elite and Final bosses use square root scaling with cap
  const dayScaling = Math.floor(Math.sqrt(currentDay) * 5);
  baseAttack = GAME_CONSTANTS.BOSS_ATTACK_BASE + dayScaling;
  // Cap boss base attack at 50 to prevent one-shotting
  baseAttack = Math.min(baseAttack, 50);
  attackScaling = 0; // No linear scaling, already handled above
}

let bossDamage = Math.max(1, Math.floor(
  baseAttack - 
  (getBaseDefense() + armor + (armorPolishActive ? 5 : 0))
));

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
    addLog(`💨 Boss's ENRAGED attack missed!`);
    
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
      
      setPlayerFlash(true);
      setTimeout(() => setPlayerFlash(false), 200);
      
      // Check for AOE execution (Phase 3 gauntlet)
      if (aoeWarning && inPhase3 && battleType === 'final') {
        if (dodgeReady) {
          // Player dodged successfully
          addLog(`🌀 You rolled out of the way! AOE DODGED!`);
          setDodgeReady(false);
        } else {
          // AOE hits for 35 damage
          const aoeDamage = 35;
          addLog(`💥 DEVASTATING AOE SLAM! -${aoeDamage} HP`);
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
                const essenceGain = isFinalBoss ? 100 : (battleType === 'elite' ? 50 : 10);
                setXp(x => x + xpGain);
                setEssence(e => e + essenceGain);
                addLog(`🎊 VICTORY! +${xpGain} XP, +${essenceGain} Essence`);
                
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
            addLog(`⚠️ THE BOSS RAISES ITS WEAPON TO THE SKY!`);
            addLog(`🛡️ [DODGE] button available - or attack for bonus damage!`);
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
    
    // AOE Warning - Boss vulnerable but will counter-attack (special attacks too)
    if (aoeWarning && inPhase3) {
      const vulnerableBonus = Math.floor(damage * 0.5);
      damage += vulnerableBonus;
      addLog(`⚠️ Boss is VULNERABLE! +${vulnerableBonus} bonus damage!`);
      setShowDodgeButton(false); // Can't dodge after attacking
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
      // During AOE warning, boss WILL counter-attack even if stunned (too focused on AOE)
      skipCounterAttack = !aoeWarning;
      effectMessage = '✨ Boss stunned!';
      if (aoeWarning) {
        addLog('⚠️ But boss is too focused on AOE to be stopped!');
      }
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
      const essenceGain = isFinalBoss ? 100 : (battleType === 'elite' ? 50 : (battleType === 'wave' ? 8 : 10));
      setXp(x => x + xpGain);
      setEssence(e => e + essenceGain);
      
      // Accumulate wave essence for final display
      if (battleType === 'wave') {
        setWaveEssenceTotal(t => t + essenceGain);
      }
      
      addLog(`🎊 VICTORY! +${xpGain} XP, +${essenceGain} Essence`);
      
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
      const gain = (4 + Math.floor(currentDay / 3)) * luckMultiplier;
      setWeapon(w => w + gain);
      lootMessages.push(`⚔️ Weapon +${gain}${luckyCharmActive ? ' (Lucky!)' : ''}`);
      addLog(`💎 Looted: Weapon Upgrade! +${gain} (Total: ${weapon + gain})${luckyCharmActive ? ' (Lucky Charm!)' : ''}`);
    } else {
      const gain = (4 + Math.floor(currentDay / 3)) * luckMultiplier;
      setArmor(a => a + gain);
      lootMessages.push(`🛡️ Armor +${gain}${luckyCharmActive ? ' (Lucky!)' : ''}`);
      addLog(`💎 Looted: Armor Upgrade! +${gain} (Total: ${armor + gain})${luckyCharmActive ? ' (Lucky Charm!)' : ''}`);
    }
    
    if (luckyCharmActive) {
      setLuckyCharmActive(false);
      addLog('🍀 Lucky Charm consumed!');
    }
  }
        
        lootMessages.push('✨ Fully Healed');
        setHp(getMaxHp());
        addLog('✨ Fully healed!');
      }
      
      // Add essence gain to loot display
      const displayEssence = battleType === 'wave' ? waveEssenceTotal : essenceGain;
      lootMessages.unshift(`🔮 +${displayEssence} Essence`);
      
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
        
        // Regular enemies hit softer
let baseAttack, attackScaling;
if (battleType === 'regular' || battleType === 'wave') {
  baseAttack = 25;
  attackScaling = 2;
} else {
  // Elite and Final bosses use square root scaling with cap
  const dayScaling = Math.floor(Math.sqrt(currentDay) * 5);
  baseAttack = GAME_CONSTANTS.BOSS_ATTACK_BASE + dayScaling;
  // Cap boss base attack at 50 to prevent one-shotting
  baseAttack = Math.min(baseAttack, 50);
  attackScaling = 0; // No linear scaling, already handled above
}

let bossDamage = Math.max(1, Math.floor(
  baseAttack - 
  (getBaseDefense() + armor + (armorPolishActive ? 5 : 0))
));

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
    addLog(`💨 Boss's ENRAGED attack missed!`);
    
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
        
        setPlayerFlash(true);
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
                  const essenceGain = isFinalBoss ? 100 : (battleType === 'elite' ? 50 : 10);
                  setXp(x => x + xpGain);
                  setEssence(e => e + essenceGain);
                  addLog(`🎊 VICTORY! +${xpGain} XP, +${essenceGain} Essence`);
                  
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
    
    // Check stamina requirement
    if (stamina < 25) {
      addLog('⚠️ Not enough stamina to flee! (Need 25 SP)');
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
    setRecklessStacks(0);
    
    addLog(`🏃 Fled from ${bossName}! Lost 25 Stamina.`);
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
    
    setTimeout(() => setActiveTab('grave'), 1000);
  };


// PART 3 OF 6 - Copy this after part 2

  const advance = () => {
    if (isFinalBoss && bossHp <= 0) {
      // Gauntlet defeated - lock until next milestone
      setGauntletUnlocked(false);
      setGauntletMilestone(m => m + 1000);
      addLog(`🏆 THE GAUNTLET CONQUERED! Next trial at ${gauntletMilestone + 1000} XP.`);
      
      // Close battle but keep all progress
      setShowBoss(false);
      setHasFled(false);
      setBattling(false);
      setBattleMode(false);
      setIsFinalBoss(false);
      
      setTimeout(() => setActiveTab('home'), 1000);
    } else if (!isFinalBoss && bossHp <= 0) {
      // Elite boss defeated - just close screen (day advances at midnight)
      const totalTasks = tasks.length;
      const completedTasks = tasks.filter(t => t.done).length;
      if (totalTasks > 0 && completedTasks === totalTasks) {
        setStudyStats(prev => ({ ...prev, perfectDays: prev.perfectDays + 1 }));
        setXp(x => x + GAME_CONSTANTS.PERFECT_DAY_BONUS);
        addLog(`⭐ PERFECT DAY! +${GAME_CONSTANTS.PERFECT_DAY_BONUS} XP`);
      }
      
      // Close battle
      setShowBoss(false);
      setHasFled(false);
      setBattling(false);
      setBattleMode(false);
      
      addLog(`✨ Elite boss defeated! Day continues until midnight...`);
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
  }`} style={{ fontFamily: "'Cinzel', serif", background: 'linear-gradient(to bottom, #1a0a0a, #0d0505)' }}>
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
            {/* Decorative top border */}
            <div className="flex items-center justify-center gap-3 mb-4">
              <div style={{width: '120px', height: '1px', background: 'linear-gradient(to right, transparent, rgba(255, 215, 0, 0.4))'}}></div>
              <span style={{color: 'rgba(255, 215, 0, 0.5)', fontSize: '10px'}}>✦</span>
              <div style={{width: '40px', height: '1px', background: 'rgba(255, 215, 0, 0.4)'}}></div>
              <span style={{color: 'rgba(255, 215, 0, 0.5)', fontSize: '10px'}}>◆</span>
              <div style={{width: '40px', height: '1px', background: 'rgba(255, 215, 0, 0.4)'}}></div>
              <span style={{color: 'rgba(255, 215, 0, 0.5)', fontSize: '10px'}}>✦</span>
              <div style={{width: '120px', height: '1px', background: 'linear-gradient(to left, transparent, rgba(255, 215, 0, 0.4))'}}></div>
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
            <p className="text-sm mb-6 italic" style={{color: '#C0C0C0'}}>"Study or be consumed by the abyss..."</p>
            
            <div className="rounded-xl p-6 max-w-2xl mx-auto relative overflow-hidden" style={{
              background: (() => {
                const colorMap = {
                  red: '#4A0E0E',
                  purple: '#2D1B4E',
                  green: '#1B4D3E',
                  yellow: '#3D4A2F',
                  amber: '#4A3422'
                };
                return colorMap[hero.class.color] || colorMap.yellow;
              })(),
              border: '2px solid rgba(0, 0, 0, 0.5)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5), inset 0 0 50px rgba(0, 0, 0, 0.3)'
            }}>
              
              {/* Large watermark emblem in center background */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{fontSize: '20rem', lineHeight: 1, opacity: 0.05, color: '#F5F5DC'}}>
                {getCardStyle(hero.class, currentDay).emblem}
              </div>
              
              <div className="relative z-10">
                {/* Header with day/level info */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-xs uppercase tracking-wider mb-1" style={{color: '#F5F5DC'}}>{GAME_CONSTANTS.DAY_NAMES[(new Date().getDay() + 6) % 7].name}</p>
                    <p className="text-sm mb-1" style={{color: '#F5F5DC'}}>
                      Day {currentDay} {!isDayActive && <span className="text-xs">• Dormant</span>}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold" style={{color: '#F5F5DC'}}>LVL {level}</p>
                  </div>
                </div>
                
                {/* Hero name and title */}
                <div className="text-center mb-4">
                  <h2 className="text-4xl font-bold mb-2 uppercase" style={{color: '#F5F5DC', letterSpacing: '0.1em'}}>{hero.name}</h2>
                  <p className="text-sm uppercase tracking-wide" style={{color: '#F5F5DC'}}>{hero.title} {hero.class.name}</p>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <div style={{width: '40px', height: '1px', background: 'rgba(245, 245, 220, 0.3)'}}></div>
                    <span style={{color: 'rgba(245, 245, 220, 0.5)', fontSize: '8px'}}>◆</span>
                    <div style={{width: '40px', height: '1px', background: 'rgba(245, 245, 220, 0.3)'}}></div>
                  </div>
                </div>
                
                {/* Experience bar */}
                <div className="mb-4 rounded-lg p-3" style={{backgroundColor: 'rgba(0, 0, 0, 0.3)', border: '2px solid rgba(0, 0, 0, 0.3)'}}>
                  <div className="flex justify-between text-sm mb-2" style={{color: '#D4AF37'}}>
                    <span className="font-bold uppercase tracking-wide">Experience</span>
                    <span className="font-bold">{(() => {
                      let xpSpent = 0;
                      for (let i = 1; i < level; i++) {
                        xpSpent += Math.floor(GAME_CONSTANTS.XP_PER_LEVEL * Math.pow(1.3, i - 1));
                      }
                      const currentLevelXp = xp - xpSpent;
                      const xpNeeded = Math.floor(GAME_CONSTANTS.XP_PER_LEVEL * Math.pow(1.3, level - 1));
                      return `${currentLevelXp} / ${xpNeeded}`;
                    })()}</span>
                  </div>
                  <div className="rounded-full h-4 overflow-hidden" style={{backgroundColor: 'rgba(0, 0, 0, 0.5)'}}>
                    <div className="h-4 rounded-full transition-all duration-300" style={{
                      background: (() => {
                        const gradientMap = {
                          red: 'linear-gradient(90deg, #8B0000 0%, #DC143C 100%)',
                          purple: 'linear-gradient(90deg, #4B0082 0%, #9370DB 100%)',
                          green: 'linear-gradient(90deg, #004d00 0%, #32CD32 100%)',
                          yellow: 'linear-gradient(90deg, #8B4513 0%, #D2691E 100%)',
                          amber: 'linear-gradient(90deg, #8B4513 0%, #CD853F 100%)'
                        };
                        return gradientMap[hero.class.color] || 'linear-gradient(90deg, #8B4513 0%, #D2691E 100%)';
                      })(),
                      width: `${(() => {
                        let xpSpent = 0;
                        for (let i = 1; i < level; i++) {
                          xpSpent += Math.floor(GAME_CONSTANTS.XP_PER_LEVEL * Math.pow(1.3, i - 1));
                        }
                        const currentLevelXp = xp - xpSpent;
                        const xpNeeded = Math.floor(GAME_CONSTANTS.XP_PER_LEVEL * Math.pow(1.3, level - 1));
                        return (currentLevelXp / xpNeeded) * 100;
                      })()}%`
                    }}></div>
                  </div>
                  <p className="text-xs text-right mt-1" style={{color: '#F5F5DC', opacity: 0.7}}>{(() => {
                    let xpSpent = 0;
                    for (let i = 1; i < level; i++) {
                      xpSpent += Math.floor(GAME_CONSTANTS.XP_PER_LEVEL * Math.pow(1.3, i - 1));
                    }
                    const currentLevelXp = xp - xpSpent;
                    const xpNeeded = Math.floor(GAME_CONSTANTS.XP_PER_LEVEL * Math.pow(1.3, level - 1));
                    return xpNeeded - currentLevelXp;
                  })()} XP TO NEXT LEVEL</p>
                </div>
                
                {/* Combat Stats Header */}
                <div className="flex items-center justify-center gap-3 mb-3">
                  <div style={{flex: '1', height: '1px', background: 'rgba(245, 245, 220, 0.3)'}}></div>
                  <p className="text-xs uppercase tracking-wider whitespace-nowrap" style={{color: 'rgba(245, 245, 220, 0.5)'}}>Combat Stats</p>
                  <div style={{flex: '1', height: '1px', background: 'rgba(245, 245, 220, 0.3)'}}></div>
                </div>
                
                {/* Combat stats 2x2 grid */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {/* HP */}
                  <div className="rounded-lg p-3 text-center" style={{backgroundColor: 'rgba(0, 0, 0, 0.3)', border: '2px solid rgba(0, 0, 0, 0.3)'}}>
                    <div className="flex justify-center mb-1">
                      <HeartPulse size={20} style={{color: '#FF6B6B'}}/>
                    </div>
                    <p className="text-xl font-bold mb-1" style={{color: '#F5F5DC'}}>{hp}/{getMaxHp()}</p>
                    <div className="rounded-full h-2 overflow-hidden" style={{backgroundColor: 'rgba(0, 0, 0, 0.5)'}}>
                      <div className="h-2 rounded-full transition-all duration-300" style={{backgroundColor: '#DC2626', width: `${(hp / getMaxHp()) * 100}%`}}></div>
                    </div>
                  </div>
                  
                  {/* Stamina */}
                  <div className="rounded-lg p-3 text-center" style={{backgroundColor: 'rgba(0, 0, 0, 0.3)', border: '2px solid rgba(0, 0, 0, 0.3)'}}>
                    <div className="flex justify-center mb-1">
                      <Sparkles size={20} style={{color: '#3B82F6'}}/>
                    </div>
                    <p className="text-xl font-bold mb-1" style={{color: '#F5F5DC'}}>{stamina}/{getMaxStamina()}</p>
                    <div className="rounded-full h-2 overflow-hidden" style={{backgroundColor: 'rgba(0, 0, 0, 0.5)'}}>
                      <div className="h-2 rounded-full transition-all duration-300" style={{backgroundColor: '#3B82F6', width: `${(stamina / getMaxStamina()) * 100}%`}}></div>
                    </div>
                  </div>
                  
                  {/* Attack */}
                  <div className="rounded-lg p-3 text-center" style={{backgroundColor: 'rgba(0, 0, 0, 0.3)', border: '2px solid rgba(0, 0, 0, 0.3)'}}>
                    <div className="flex justify-center mb-1">
                      <Swords size={20} style={{color: '#F59E0B'}}/>
                    </div>
                    <p className="text-xl font-bold mb-1" style={{color: '#F5F5DC'}}>{getBaseAttack() + weapon + (level - 1) * 2}</p>
                    <p className="text-xs uppercase" style={{color: '#F5F5DC'}}>Damage Per Hit</p>
                  </div>
                  
                  {/* Defense */}
                  <div className="rounded-lg p-3 text-center" style={{backgroundColor: 'rgba(0, 0, 0, 0.3)', border: '2px solid rgba(0, 0, 0, 0.3)'}}>
                    <div className="flex justify-center mb-1">
                      <ShieldCheck size={20} style={{color: '#F5F5DC'}}/>
                    </div>
                    <p className="text-2xl font-bold mb-1" style={{color: '#F5F5DC'}}>{Math.floor(((getBaseDefense() + armor) / ((getBaseDefense() + armor) + 50)) * 100)}%</p>
                    <p className="text-xs uppercase" style={{color: '#F5F5DC'}}>Damage Resist</p>
                  </div>
                </div>
                
                {/* Customize button */}
                {canCustomize && (
                  <div className="mb-3">
                    <button 
                      onClick={() => setShowCustomizeModal(true)}
                      className="w-full py-2 rounded-lg transition-all duration-300 font-bold uppercase text-sm transform"
                      style={{backgroundColor: 'rgba(184, 134, 11, 0.6)', border: '2px solid #B8860B', color: '#F5F5DC'}}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(184, 134, 11, 0.8)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(184, 134, 11, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(184, 134, 11, 0.6)';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      ✦ Customize Your Hero
                    </button>
                  </div>
                )}
                
                {/* Decorative divider with text */}
                <div className="flex items-center justify-center gap-3 mb-4 mt-4">
                  <div style={{flex: '1', height: '1px', background: 'rgba(245, 245, 220, 0.3)'}}></div>
                  <p className="text-xs uppercase tracking-wider whitespace-nowrap" style={{color: 'rgba(245, 245, 220, 0.5)'}}>Equipment</p>
                  <div style={{flex: '1', height: '1px', background: 'rgba(245, 245, 220, 0.3)'}}></div>
                </div>
                
                {/* Inventory and Merchant buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => setShowInventoryModal(true)}
                    className="py-2 rounded-lg transition-all duration-300 font-bold uppercase text-sm transform"
                    style={{backgroundColor: 'rgba(139, 0, 0, 0.7)', border: '2px solid #8B0000', color: '#F5F5DC'}}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(139, 0, 0, 0.9)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(139, 0, 0, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(139, 0, 0, 0.7)';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    Inventory
                  </button>
                  <button 
                    onClick={() => setShowCraftingModal(true)}
                    className="py-2 rounded-lg transition-all duration-300 font-bold uppercase text-sm transform"
                    style={{backgroundColor: 'rgba(120, 53, 15, 0.7)', border: '2px solid #92400E', color: '#F5F5DC'}}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(120, 53, 15, 0.9)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(120, 53, 15, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(120, 53, 15, 0.7)';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    Merchant
                  </button>
                </div>
              </div>
            </div>
          </header>

          {/* Navigation Section */}
          <div className="mb-8">
            <div className="text-center mb-4">
              <p className="text-xs tracking-[0.3em] uppercase" style={{color: '#D4AF37'}}>Navigation</p>
              <div className="flex items-center justify-center gap-2 mt-1">
                <div style={{width: '60px', height: '1px', background: '#D4AF37'}}></div>
                <span style={{color: '#D4AF37', fontSize: '8px'}}>◆</span>
                <div style={{width: '60px', height: '1px', background: '#D4AF37'}}></div>
              </div>
            </div>
            
            <nav className="flex gap-4 justify-center items-center">
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
                  className="flex flex-col items-center gap-2 px-6 py-3 rounded-lg transition-all border-2"
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
          </div>

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
      setVictoryLoot([]); // Clear previous loot
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
    <button onClick={() => { setGraveyard([]); setHeroes([]); addLog('Debug: Legacy tab cleared'); }} className="bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded text-sm transition-all">Clear Legacy</button>
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
                <div className="rounded-xl p-8 text-center border-2" style={{borderColor: COLORS.gold, background: 'linear-gradient(to bottom, rgba(50, 10, 50, 0.95), rgba(60, 0, 20, 0.95), rgba(20, 0, 30, 0.95))', boxShadow: '0 0 15px rgba(212, 175, 55, 0.25), 0 0 30px rgba(212, 175, 55, 0.1)'}}>
                  {/* Character Header */}
                  <div className="mb-6">
                    {/* Player Name */}
                    <h2 className="text-3xl mb-2 tracking-wide" style={{color: '#F5F5DC', textShadow: '0 0 15px rgba(245, 245, 220, 0.4)', fontWeight: '400'}}>
                      {hero.name}
                    </h2>
                    
                    {/* Class and Level */}
                    <p className="text-base mb-4" style={{color: COLORS.silver}}>
                      Novice {hero.class.name} — Level {level}
                    </p>
                  </div>
                  
                  {/* Date Section */}
                  <h2 className="text-3xl font-bold mb-2" style={{color: COLORS.gold}}>
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </h2>
                  <p className="text-base text-gray-300 mb-2">{new Date().toLocaleDateString('en-US', { year: 'numeric' })}</p>
                  <p className="text-sm italic mb-4" style={{color: '#FF6B6B'}}>BEGIN YOUR TRIALS</p>
                  <p className="text-sm text-gray-400 italic mb-4">"{GAME_CONSTANTS.DAY_NAMES[currentDay].theme}"</p>
                  <p className="mb-4 text-sm text-gray-400">Start before {GAME_CONSTANTS.LATE_START_HOUR} AM or lose {GAME_CONSTANTS.LATE_START_PENALTY} HP</p>
                  <button onClick={start} className="px-8 py-3 rounded-lg font-bold text-xl transition-all shadow-lg" style={{backgroundColor: COLORS.gold, color: COLORS.obsidian.base}} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FFD700'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = COLORS.gold}>START DAY</button>
                </div>
              ) : (
                <>
                  <div className="bg-black bg-opacity-50 rounded-xl p-6 border-2 border-red-900">
                    <div className="text-center mb-4">
                      {/* Section header with decorative divider */}
                      <div className="mb-3">
                        <h2 className="text-2xl font-bold mb-2" style={{color: '#DC143C', letterSpacing: '0.15em'}}>TRIALS OF THE CURSED</h2>
                        <div className="flex items-center justify-center gap-2">
                          <div style={{width: '150px', height: '1px', background: 'linear-gradient(to right, transparent, rgba(220, 20, 60, 0.3))'}}></div>
                          <span style={{color: 'rgba(220, 20, 60, 0.4)', fontSize: '8px'}}>◆</span>
                          <div style={{width: '150px', height: '1px', background: 'linear-gradient(to left, transparent, rgba(220, 20, 60, 0.3))'}}></div>
                        </div>
                      </div>
                      <p className="text-sm" style={{color: '#F5F5DC'}}>{GAME_CONSTANTS.DAY_NAMES[(currentDay - 1) % 7].name} • XP Rate: {Math.floor(GAME_CONSTANTS.XP_MULTIPLIERS[(currentDay - 1) % 7] * 100)}%</p>
                    </div>
                    
                    <div className="flex gap-3 justify-center mb-6">
                      <button onClick={() => setShowImportModal(true)} className="flex items-center gap-2 px-6 py-3 rounded-lg transition-all border-2 uppercase text-sm font-bold" style={{backgroundColor: 'rgba(120, 53, 15, 0.6)', borderColor: '#92400E', color: '#F5F5DC'}} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(120, 53, 15, 0.8)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(120, 53, 15, 0.6)'}>
                        <Calendar size={18}/>Import from Planner
                      </button>
                      <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-6 py-3 rounded-lg transition-all border-2 uppercase text-sm font-bold" style={{backgroundColor: 'rgba(139, 0, 0, 0.6)', borderColor: '#8B0000', color: '#F5F5DC'}} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(139, 0, 0, 0.8)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(139, 0, 0, 0.6)'}>
                        <Plus size={18}/>Accept Trial
                      </button>
                    </div>
                    
                    {tasks.length === 0 ? (
                      <div className="text-center py-12">
                        <p className="text-lg italic" style={{color: '#F5F5DC'}}>NO TRIALS YET. ACCEPT YOUR FIRST TRIAL TO BEGIN.</p>
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
      : t.overdue
        ? 'bg-red-900/20 border-red-600 opacity-80'
      : t.priority === 'important'
        ? 'bg-gradient-to-r from-yellow-900/30 to-gray-800 border-yellow-500 shadow-lg shadow-yellow-500/20'
        : 'bg-gray-800 border-gray-700'
  }`}>
    <div className="flex items-center gap-3">
      {t.overdue && !t.done && (
        <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">OVERDUE</span>
      )}
      <div className="flex-1">
        <p className={t.done ? 'line-through text-gray-500' : t.overdue ? 'text-red-300 font-medium text-lg' : 'text-white font-medium text-lg'}>
          {t.title}
        </p>
        <p className="text-sm text-gray-400 mt-1">
          {t.priority === 'important' ? 'IMPORTANT • 1.25x XP' : 'ROUTINE • 1.0x XP'}
          {t.overdue && !t.done && <span className="text-red-400 ml-2">• 50% XP Penalty</span>}
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
              addLog(`Starting focus session: ${t.title}`);
            }} 
            className="px-3 py-1 rounded transition-all flex items-center gap-1 border-2" style={{backgroundColor: '#6B2C91', borderColor: '#C0C0C0', color: '#F5F5DC'}} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#8A3BB5'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#6B2C91'}
          >
            Focus
          </button>
          <button 
            onClick={() => complete(t.id)} 
            className="px-4 py-1 rounded font-bold transition-all flex items-center gap-1 border-2" style={{backgroundColor: '#2F5233', borderColor: '#C0C0C0', color: '#F5F5DC'}} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3D6B45'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2F5233'}
          >
            Complete
          </button>
        </div>
      )}
      {t.done && (<span className="text-green-400 font-bold flex items-center gap-1">Done</span>)}
    </div>
  </div>
))}   
                      </div>
                    )}
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4 mt-6">
                    <button 
  onClick={miniBoss} 
  disabled={!isDayActive || eliteBossDefeatedToday || xp < 200} 
  className="px-8 py-6 rounded-xl font-bold text-xl transition-all border-2 disabled:cursor-not-allowed uppercase" style={{backgroundColor: (!isDayActive || eliteBossDefeatedToday || xp < 200) ? 'rgba(30, 41, 59, 0.5)' : 'rgba(30, 41, 59, 0.8)', borderColor: (!isDayActive || eliteBossDefeatedToday || xp < 200) ? 'rgba(71, 85, 105, 0.5)' : 'rgba(71, 85, 105, 0.8)', color: '#F5F5DC', opacity: (!isDayActive || eliteBossDefeatedToday || xp < 200) ? 0.5 : 1}} onMouseEnter={(e) => {if (isDayActive && !eliteBossDefeatedToday && xp >= 200) e.currentTarget.style.backgroundColor = 'rgba(51, 65, 85, 0.9)'}} onMouseLeave={(e) => {if (isDayActive && !eliteBossDefeatedToday && xp >= 200) e.currentTarget.style.backgroundColor = 'rgba(30, 41, 59, 0.8)'}}
>
  <div className="text-center">
    <div className="mb-2">FACE THE DARKNESS</div>
    {!isDayActive ? (
      <div className="text-xs font-normal uppercase" style={{color: '#9CA3AF'}}>Day dormant — add tasks to begin</div>
    ) : eliteBossDefeatedToday ? (
      <div className="text-xs font-normal uppercase" style={{color: '#4ADE80'}}>✓ Today's trial complete</div>
    ) : (
      <div className="text-xs font-normal uppercase" style={{color: xp >= 200 ? '#4ADE80' : '#FBBF24'}}>
        {xp >= 200 ? `Ready • 200 XP` : `${200 - xp} XP needed`}
      </div>
    )}
  </div>
</button>
                    <button 
  onClick={finalBoss} 
  disabled={!gauntletUnlocked || tasks.length === 0 || tasks.filter(t => t.done).length < tasks.length} 
  className="px-8 py-6 rounded-xl font-bold text-xl transition-all border-2 disabled:cursor-not-allowed uppercase" style={{backgroundColor: (!gauntletUnlocked || tasks.length === 0 || tasks.filter(t => t.done).length < tasks.length) ? 'rgba(30, 41, 59, 0.5)' : 'rgba(30, 41, 59, 0.8)', borderColor: (!gauntletUnlocked || tasks.length === 0 || tasks.filter(t => t.done).length < tasks.length) ? 'rgba(71, 85, 105, 0.5)' : 'rgba(71, 85, 105, 0.8)', color: '#F5F5DC', opacity: (!gauntletUnlocked || tasks.length === 0 || tasks.filter(t => t.done).length < tasks.length) ? 0.5 : 1}} onMouseEnter={(e) => {if (gauntletUnlocked && tasks.length > 0 && tasks.filter(t => t.done).length >= tasks.length) e.currentTarget.style.backgroundColor = 'rgba(51, 65, 85, 0.9)'}} onMouseLeave={(e) => {if (gauntletUnlocked && tasks.length > 0 && tasks.filter(t => t.done).length >= tasks.length) e.currentTarget.style.backgroundColor = 'rgba(30, 41, 59, 0.8)'}}
>
  <div className="text-center">
    <div className="mb-2">THE GAUNTLET</div>
    {!gauntletUnlocked && (
      <div className="text-xs font-normal uppercase" style={{color: '#9CA3AF'}}>{gauntletMilestone - xp} XP needed</div>
    )}
  </div>
</button>
                  </div>
                  
                  <div className="bg-black bg-opacity-50 rounded-xl p-4 border border-gray-800">
                    {/* Section header with decorative divider */}
                    <div className="text-center mb-3">
                      <h3 className="text-lg font-bold mb-2" style={{color: '#D4AF37', letterSpacing: '0.15em'}}>CHRONICLE OF EVENTS</h3>
                      <div className="flex items-center justify-center gap-2">
                        <div style={{width: '60px', height: '1px', background: 'linear-gradient(to right, transparent, rgba(212, 175, 55, 0.5))'}}></div>
                        <span style={{color: 'rgba(212, 175, 55, 0.6)', fontSize: '8px'}}>◆</span>
                        <div style={{width: '60px', height: '1px', background: 'linear-gradient(to left, transparent, rgba(212, 175, 55, 0.5))'}}></div>
                      </div>
                    </div>
                    {log.length === 0 ? (<p className="text-sm text-gray-500 italic text-center">The journey begins...</p>) : (<div className="space-y-1">{log.map((l, i) => (<p key={i} className="text-sm text-gray-300">{l}</p>))}</div>)}
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'planner' && (
            <div className="bg-black bg-opacity-50 rounded-xl p-6 border-2 border-blue-900">
              {/* Section header with decorative divider */}
              <div className="text-center mb-4">
                <h2 className="text-2xl font-bold mb-2" style={{color: '#D4AF37', letterSpacing: '0.15em'}}>BATTLE PLANNER</h2>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div style={{width: '80px', height: '1px', background: 'linear-gradient(to right, transparent, rgba(212, 175, 55, 0.5))'}}></div>
                  <span style={{color: 'rgba(212, 175, 55, 0.6)', fontSize: '8px'}}>◆</span>
                  <div style={{width: '80px', height: '1px', background: 'linear-gradient(to left, transparent, rgba(212, 175, 55, 0.5))'}}></div>
                </div>
              </div>
              <p className="text-sm mb-6 italic text-center" style={{color: '#C0C0C0'}}>"Chart your path through the coming trials..."</p>
              
              {/* Sub-navigation tabs */}
              <div className="flex gap-2 justify-center mb-6">
                <button 
                  onClick={() => setPlannerSubTab('weekly')}
                  className="px-6 py-2 rounded-lg transition-all border-2"
                  style={{
                    backgroundColor: plannerSubTab === 'weekly' ? 'rgba(184, 134, 11, 0.5)' : 'rgba(30, 30, 30, 0.5)',
                    borderColor: plannerSubTab === 'weekly' ? '#D4AF37' : 'rgba(100, 100, 100, 0.5)',
                    color: '#F5F5DC'
                  }}
                >
                  Weekly Plan
                </button>
                <button 
                  onClick={() => setPlannerSubTab('calendar')}
                  className="px-6 py-2 rounded-lg transition-all border-2"
                  style={{
                    backgroundColor: plannerSubTab === 'calendar' ? 'rgba(184, 134, 11, 0.5)' : 'rgba(30, 30, 30, 0.5)',
                    borderColor: plannerSubTab === 'calendar' ? '#D4AF37' : 'rgba(100, 100, 100, 0.5)',
                    color: '#F5F5DC'
                  }}
                >
                  Calendar
                </button>
              </div>
              
              {/* Weekly Plan Content */}
              {plannerSubTab === 'weekly' && (
              
              <div className="grid gap-4">
                {Object.keys(weeklyPlan).map(day => (
                  <div key={day} className="rounded-lg p-6 border-2" style={{backgroundColor: 'rgba(15, 23, 42, 0.8)', borderColor: 'rgba(30, 41, 59, 0.8)'}}>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-xl font-bold uppercase mb-1" style={{color: '#D4AF37'}}>{day}</h3>
                        <p className="text-xs">
  {(() => {
    const today = new Date();
    const todayDayName = today.toLocaleDateString('en-US', { weekday: 'long' });
    if (day === todayDayName) {
      return <span className="font-bold" style={{color: '#D4AF37'}}>Today</span>;
    } else {
      return <span style={{color: '#9CA3AF'}}>{getNextDayOfWeek(day).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>;
    }
  })()}
</p>
                      </div>
                      <button onClick={() => { setSelectedDay(day); setShowPlanModal(true); }} className="px-4 py-2 rounded-lg text-sm transition-all flex items-center gap-2 border-2" style={{backgroundColor: 'rgba(120, 53, 15, 0.6)', borderColor: '#92400E', color: '#F5F5DC'}} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(120, 53, 15, 0.8)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(120, 53, 15, 0.6)'}>
                        <Plus size={16}/> ADD TASK
                      </button>
                    </div>
                    
                    {weeklyPlan[day].length === 0 ? (
                      <p className="text-sm italic" style={{color: '#9CA3AF'}}>NO TASKS PLANNED</p>
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
              )}
              
              {/* Calendar Content */}
              {plannerSubTab === 'calendar' && (
              <div>
              <div className="flex justify-between items-center mb-6">
                <button onClick={() => { if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1); } else { setCurrentMonth(currentMonth - 1); } }} className="px-6 py-2 rounded-lg transition-all border-2" style={{backgroundColor: 'rgba(30, 41, 59, 0.6)', borderColor: 'rgba(51, 65, 85, 0.8)', color: '#F5F5DC'}} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(30, 41, 59, 0.8)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(30, 41, 59, 0.6)'}>
                  ← PREV
                </button>
                <h3 className="text-2xl font-bold uppercase tracking-wider" style={{color: '#F5F5DC'}}>{new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long' }).toUpperCase()} {currentYear}</h3>
                <button onClick={() => { if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1); } else { setCurrentMonth(currentMonth + 1); } }} className="px-6 py-2 rounded-lg transition-all border-2" style={{backgroundColor: 'rgba(30, 41, 59, 0.6)', borderColor: 'rgba(51, 65, 85, 0.8)', color: '#F5F5DC'}} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(30, 41, 59, 0.8)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(30, 41, 59, 0.6)'}>
                  NEXT →
                </button>
              </div>
              
              <div className="rounded-lg p-6" style={{backgroundColor: 'rgba(0, 0, 0, 0.4)'}}>
                <div className="grid grid-cols-7 gap-3 mb-4">
                  {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (<div key={day} className="text-center font-bold text-sm py-2" style={{color: '#9CA3AF'}}>{day}</div>))}
                </div>
                
                <div className="grid grid-cols-7 gap-3">
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
                      
                      let bgColor, borderColor;
                      if (isToday) {
                        bgColor = '#92400E';
                        borderColor = '#B45309';
                      } else if (hasTasks) {
                        if (allDone) {
                          bgColor = 'rgba(34, 197, 94, 0.3)';
                          borderColor = 'rgba(34, 197, 94, 0.6)';
                        } else {
                          bgColor = 'rgba(234, 179, 8, 0.3)';
                          borderColor = 'rgba(234, 179, 8, 0.6)';
                        }
                      } else {
                        bgColor = 'rgba(30, 41, 59, 0.5)';
                        borderColor = 'rgba(51, 65, 85, 0.6)';
                      }
                      
                      days.push(
                        <button 
                          key={day} 
                          onClick={() => { setSelectedDate(dateKey); setShowCalendarModal(true); }} 
                          className="aspect-square rounded-lg p-4 transition-all hover:scale-105 relative border-2 flex items-center justify-center"
                          style={{backgroundColor: bgColor, borderColor: borderColor}}
                          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                          <div className="text-lg font-bold" style={{color: '#F5F5DC'}}>{day}</div>
                          {isToday && (<div className="absolute top-1 right-1 w-2 h-2 rounded-full animate-pulse" style={{backgroundColor: '#FBBF24'}}></div>)}
                        </button>
                      );
                    }
                    return days;
                  })()}
                </div>
              </div>
              
              <div className="mt-6 flex flex-wrap gap-6 justify-center text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded border-2" style={{backgroundColor: '#92400E', borderColor: '#B45309'}}></div>
                  <span style={{color: '#F5F5DC'}}>TODAY</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded border-2" style={{backgroundColor: 'rgba(234, 179, 8, 0.3)', borderColor: 'rgba(234, 179, 8, 0.6)'}}></div>
                  <span style={{color: '#F5F5DC'}}>IN PROGRESS</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded border-2" style={{backgroundColor: 'rgba(34, 197, 94, 0.3)', borderColor: 'rgba(34, 197, 94, 0.6)'}}></div>
                  <span style={{color: '#F5F5DC'}}>COMPLETE</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded border-2" style={{backgroundColor: 'rgba(30, 41, 59, 0.5)', borderColor: 'rgba(51, 65, 85, 0.6)'}}></div>
                  <span style={{color: '#F5F5DC'}}>EMPTY</span>
                </div>
              </div>
              </div>
              )}
            </div>
          )}

          {activeTab === 'study' && (
  <div className="bg-black bg-opacity-50 rounded-xl p-6 border-2 border-purple-900">
    <h2 className="text-2xl font-bold text-purple-400 mb-2 text-center">KNOWLEDGE FORGE</h2>
    <p className="text-gray-400 text-sm mb-6 italic text-center">"Sharpen your mind, temper your wisdom..."</p>
    
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
        <p className="text-gray-400 mb-2 text-lg">The forge stands empty...</p>
        <p className="text-sm text-gray-500">Create your first deck to begin forging knowledge</p>
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
                  // Initialize queue with all card indices
                  const allCardIndices = Array.from({length: deck.cards.length}, (_, i) => i);
                  setStudyQueue(allCardIndices);
                  setIsFlipped(false);
                  setShowStudyModal(true);
                }}
                disabled={deck.cards.length === 0}
                className="flex-1 bg-purple-600 hover:bg-purple-700 py-2 rounded transition-all disabled:bg-gray-600 disabled:cursor-not-allowed"
              >
                Study Deck
              </button>
              <button
                onClick={() => {
                  if (deck.cards.length < 4) {
                    alert('Need at least 4 cards for a quiz!');
                    return;
                  }
                  setSelectedDeck(idx);
                  generateQuiz(idx);
                }}
                disabled={deck.cards.length < 4}
                className="flex-1 bg-blue-600 hover:bg-blue-700 py-2 rounded transition-all disabled:bg-gray-600 disabled:cursor-not-allowed"
              >
                Practice Quiz
              </button>
              <button
                onClick={() => {
                  setSelectedDeck(idx);
                  setShowCardModal(true);
                }}
                className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded transition-all"
              >
                Add Card
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
              {/* Section header with decorative divider */}
              <div className="text-center mb-4">
                <h2 className="text-2xl font-bold mb-2" style={{color: '#D4AF37', letterSpacing: '0.15em'}}>CHRONICLES OF THE CURSED</h2>
                <div className="flex items-center justify-center gap-2">
                  <div style={{width: '80px', height: '1px', background: 'linear-gradient(to right, transparent, rgba(212, 175, 55, 0.5))'}}></div>
                  <span style={{color: 'rgba(212, 175, 55, 0.6)', fontSize: '8px'}}>◆</span>
                  <div style={{width: '80px', height: '1px', background: 'linear-gradient(to left, transparent, rgba(212, 175, 55, 0.5))'}}></div>
                </div>
              </div>
              <p className="text-gray-400 text-sm mb-6 italic text-center">"Your struggle against the eternal darkness..."</p>
              
              {/* Current Cycle Status */}
              <div className="mb-6 bg-gradient-to-r from-red-900 to-gray-900 rounded-xl p-6 border-2 border-red-600">
                <h3 className="text-xl font-bold text-red-300 mb-4 text-center">Current Cycle</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-black bg-opacity-40 rounded-lg p-4">
                    <p className="text-sm text-gray-400">Day</p>
                    <p className="text-3xl font-bold text-red-400">{currentDay}/7</p>
                    <p className="text-xs text-gray-500">{GAME_CONSTANTS.DAY_NAMES[(currentDay - 1) % 7].name}</p>
                  </div>
                  <div className="bg-black bg-opacity-40 rounded-lg p-4">
                    <p className="text-sm text-gray-400">Curse Level</p>
                    <p className="text-3xl font-bold text-purple-400">{curseLevel}</p>
                    <p className="text-xs text-gray-500">{curseLevel === 0 ? 'Pure' : curseLevel === 1 ? 'Cursed' : curseLevel === 2 ? 'Deep Curse' : 'Condemned'}</p>
                  </div>
                  <div className="bg-black bg-opacity-40 rounded-lg p-4">
                    <p className="text-sm text-gray-400">Skip Count</p>
                    <p className="text-3xl font-bold text-yellow-400">{skipCount}</p>
                    <p className="text-xs text-gray-500">{skipCount >= 3 ? 'DANGER' : 'of 4 max'}</p>
                  </div>
                  <div className="bg-black bg-opacity-40 rounded-lg p-4">
                    <p className="text-sm text-gray-400">Trials Today</p>
                    <p className="text-3xl font-bold text-cyan-400">{tasks.filter(t => t.done).length}/{tasks.length}</p>
                    <p className="text-xs text-gray-500">{tasks.length > 0 ? `${Math.floor((tasks.filter(t => t.done).length / tasks.length) * 100)}%` : 'None'}</p>
                  </div>
                </div>
              </div>
              
              {/* Combat Power */}
              <div className="mb-6 bg-gradient-to-r from-blue-900 to-purple-900 rounded-xl p-6 border-2 border-blue-600">
                <h3 className="text-xl font-bold text-blue-300 mb-4 text-center">Combat Power</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-black bg-opacity-40 rounded-lg p-4">
                    <p className="text-sm text-gray-400">Health</p>
                    <p className="text-3xl font-bold text-red-400">{hp}/{getMaxHp()}</p>
                    <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                      <div className="bg-red-500 h-2 rounded-full" style={{width: `${(hp / getMaxHp()) * 100}%`}}></div>
                    </div>
                  </div>
                  <div className="bg-black bg-opacity-40 rounded-lg p-4">
                    <p className="text-sm text-gray-400">Stamina</p>
                    <p className="text-3xl font-bold text-cyan-400">{stamina}/{getMaxStamina()}</p>
                    <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                      <div className="bg-cyan-500 h-2 rounded-full" style={{width: `${(stamina / getMaxStamina()) * 100}%`}}></div>
                    </div>
                  </div>
                  <div className="bg-black bg-opacity-40 rounded-lg p-4">
                    <p className="text-sm text-gray-400">Attack</p>
                    <p className="text-3xl font-bold text-orange-400">{GAME_CONSTANTS.BASE_ATTACK + (level * GAME_CONSTANTS.PLAYER_ATK_PER_DAY) + weapon}</p>
                    <p className="text-xs text-gray-500">Base: {GAME_CONSTANTS.BASE_ATTACK} • Weapon: +{weapon}</p>
                  </div>
                  <div className="bg-black bg-opacity-40 rounded-lg p-4">
                    <p className="text-sm text-gray-400">Defense</p>
                    <p className="text-3xl font-bold text-green-400">{getBaseDefense() + armor}</p>
                    <p className="text-xs text-gray-500">Base: {GAME_CONSTANTS.BASE_DEFENSE} • Armor: +{armor}</p>
                  </div>
                </div>
              </div>
              
              {/* Progression */}
              <div className="mb-6 bg-gradient-to-r from-yellow-900 to-orange-900 rounded-xl p-6 border-2 border-yellow-600">
                <h3 className="text-xl font-bold text-yellow-300 mb-4 text-center">Progression</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-black bg-opacity-40 rounded-lg p-4">
                    <p className="text-sm text-gray-400">Level</p>
                    <p className="text-3xl font-bold text-yellow-400">{level}</p>
                    <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                      <div className="bg-yellow-500 h-2 rounded-full" style={{width: `${(xp % GAME_CONSTANTS.XP_PER_LEVEL) / GAME_CONSTANTS.XP_PER_LEVEL * 100}%`}}></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{xp % GAME_CONSTANTS.XP_PER_LEVEL}/{GAME_CONSTANTS.XP_PER_LEVEL} XP</p>
                  </div>
                  <div className="bg-black bg-opacity-40 rounded-lg p-4">
                    <p className="text-sm text-gray-400">Total XP</p>
                    <p className="text-3xl font-bold text-purple-400">{xp}</p>
                    <p className="text-xs text-gray-500">earned</p>
                  </div>
                  <div className="bg-black bg-opacity-40 rounded-lg p-4">
                    <p className="text-sm text-gray-400">Essence</p>
                    <p className="text-3xl font-bold text-purple-400">{essence}</p>
                    <p className="text-xs text-gray-500">souls collected</p>
                  </div>
                </div>
              </div>
              
              {/* Legacy Stats */}
              <div className="mb-6 bg-gradient-to-r from-green-900 to-teal-900 rounded-xl p-6 border-2 border-green-600">
                <h3 className="text-xl font-bold text-green-300 mb-4 text-center">Legacy</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-black bg-opacity-40 rounded-lg p-4">
                    <p className="text-sm text-gray-400">Liberated</p>
                    <p className="text-3xl font-bold text-green-400">{heroes.length}</p>
                    <p className="text-xs text-gray-500">broke the curse</p>
                  </div>
                  <div className="bg-black bg-opacity-40 rounded-lg p-4">
                    <p className="text-sm text-gray-400">Consumed</p>
                    <p className="text-3xl font-bold text-red-400">{graveyard.length}</p>
                    <p className="text-xs text-gray-500">claimed by darkness</p>
                  </div>
                  <div className="bg-black bg-opacity-40 rounded-lg p-4">
                    <p className="text-sm text-gray-400">Survival Rate</p>
                    <p className="text-3xl font-bold text-yellow-400">
                      {heroes.length + graveyard.length > 0 ? Math.floor((heroes.length / (heroes.length + graveyard.length)) * 100) : 0}%
                    </p>
                    <p className="text-xs text-gray-500">{heroes.length + graveyard.length} total cycles</p>
                  </div>
                  <div className="bg-black bg-opacity-40 rounded-lg p-4">
                    <p className="text-sm text-gray-400">Current Streak</p>
                    <p className="text-3xl font-bold text-orange-400">{consecutiveDays}</p>
                    <p className="text-xs text-gray-500">days without skip</p>
                  </div>
                </div>
              </div>
              
              {/* Achievements */}
              <div className="bg-gradient-to-r from-purple-900 to-pink-900 rounded-xl p-6 border-2 border-purple-600">
                <h3 className="text-xl font-bold text-purple-300 mb-4 text-center">Trials Conquered</h3>
                <div className="space-y-3">
                  <div className={`flex items-center gap-3 p-3 rounded-lg ${heroes.length > 0 ? 'bg-yellow-900 bg-opacity-50' : 'bg-gray-800 opacity-50'}`}>
                    <div className="flex-1">
                      <p className="font-bold text-white">Curse Breaker</p>
                      <p className="text-xs text-gray-400">Complete a full 7-day cycle</p>
                    </div>
                    <span className="text-lg font-bold text-yellow-400">{heroes.length > 0 ? '✓' : '—'}</span>
                  </div>
                  
                  <div className={`flex items-center gap-3 p-3 rounded-lg ${heroes.some(h => h.skipCount === 0) ? 'bg-green-900 bg-opacity-50' : 'bg-gray-800 opacity-50'}`}>
                    <div className="flex-1">
                      <p className="font-bold text-white">Flawless Victory</p>
                      <p className="text-xs text-gray-400">Complete a cycle with zero skips</p>
                    </div>
                    <span className="text-lg font-bold text-green-400">{heroes.some(h => h.skipCount === 0) ? '✓' : '—'}</span>
                  </div>
                  
                  <div className={`flex items-center gap-3 p-3 rounded-lg ${level >= 10 ? 'bg-purple-900 bg-opacity-50' : 'bg-gray-800 opacity-50'}`}>
                    <div className="flex-1">
                      <p className="font-bold text-white">Veteran Warrior</p>
                      <p className="text-xs text-gray-400">Reach level 10</p>
                    </div>
                    <span className="text-lg font-bold text-purple-400">{level >= 10 ? '✓' : `${level}/10`}</span>
                  </div>
                  
                  <div className={`flex items-center gap-3 p-3 rounded-lg ${essence >= 500 ? 'bg-cyan-900 bg-opacity-50' : 'bg-gray-800 opacity-50'}`}>
                    <div className="flex-1">
                      <p className="font-bold text-white">Soul Collector</p>
                      <p className="text-xs text-gray-400">Accumulate 500 essence</p>
                    </div>
                    <span className="text-lg font-bold text-cyan-400">{essence >= 500 ? '✓' : `${essence}/500`}</span>
                  </div>
                  
                  <div className={`flex items-center gap-3 p-3 rounded-lg ${heroes.length >= 3 ? 'bg-orange-900 bg-opacity-50' : 'bg-gray-800 opacity-50'}`}>
                    <div className="flex-1">
                      <p className="font-bold text-white">Legend Born</p>
                      <p className="text-xs text-gray-400">Liberate 3 heroes from the curse</p>
                    </div>
                    <span className="text-lg font-bold text-orange-400">{heroes.length >= 3 ? '✓' : `${heroes.length}/3`}</span>
                  </div>
                  
                  <div className={`flex items-center gap-3 p-3 rounded-lg ${consecutiveDays >= 7 ? 'bg-red-900 bg-opacity-50' : 'bg-gray-800 opacity-50'}`}>
                    <div className="flex-1">
                      <p className="font-bold text-white">Unbroken Spirit</p>
                      <p className="text-xs text-gray-400">7-day streak without skipping</p>
                    </div>
                    <span className="text-lg font-bold text-red-400">{consecutiveDays >= 7 ? '✓' : `${consecutiveDays}/7`}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'legacy' && (
            <div className="space-y-6">
              {/* The Liberated Section */}
              <div className="bg-black bg-opacity-50 rounded-xl p-6 border-2 border-yellow-900">
                <h2 className="text-2xl font-bold text-yellow-400 mb-2 text-center">⚔️ THE LIBERATED</h2>
                <p className="text-green-400 text-sm mb-6 italic text-center">"Those who broke free from the curse..."</p>
                {heroes.length === 0 ? (<div className="text-center py-12"><Trophy size={64} className="mx-auto mb-4 text-gray-700"/><p className="text-gray-400">None have escaped the curse... yet.</p><p className="text-sm text-gray-500 mt-2">Survive all 7 days to break free!</p></div>) : (<div className="space-y-4">{heroes.slice().reverse().map((hero, i) => (<div key={i} className={`bg-gradient-to-r ${hero.class ? hero.class.gradient[3] : 'from-yellow-900'} ${hero.class && hero.class.color === 'yellow' ? 'to-orange-400' : hero.class && hero.class.color === 'red' ? 'to-orange-500' : hero.class && hero.class.color === 'purple' ? 'to-pink-500' : hero.class && hero.class.color === 'green' ? 'to-teal-500' : 'to-yellow-500'} rounded-lg p-6 border-4 border-yellow-400 shadow-2xl shadow-yellow-500/50`}><div className="flex items-center gap-4"><div className="text-6xl animate-pulse">{hero.class ? hero.class.emblem : '✨'}</div><div className="flex-1"><h3 className="text-2xl font-bold text-white">{hero.name}</h3><p className="text-xl text-white text-opacity-90">{hero.title} {hero.class ? hero.class.name : ''}</p><p className="text-white">Level {hero.lvl} • {hero.xp} XP</p>{hero.skipCount !== undefined && hero.skipCount === 0 && (<p className="text-green-300 font-bold mt-1">✨ FLAWLESS RUN - No skips!</p>)}{hero.skipCount > 0 && (<p className="text-yellow-200 text-sm mt-1">Overcame {hero.skipCount} skip{hero.skipCount > 1 ? 's' : ''}</p>)}<p className="text-yellow-300 font-bold mt-2">✨ CURSE BROKEN ✨</p><p className="text-green-400 text-sm italic">"Free at last from the eternal torment..."</p></div></div></div>))}</div>)}
              </div>
              
              {/* The Consumed Section */}
              <div className="bg-black bg-opacity-50 rounded-xl p-6 border-2 border-gray-800">
                <h2 className="text-2xl font-bold text-gray-400 mb-2 text-center">💀 THE CONSUMED</h2>
                <p className="text-red-400 text-sm mb-6 italic text-center">"Those who fell to the curse..."</p>
                {graveyard.length === 0 ? (<div className="text-center py-12"><Skull size={64} className="mx-auto mb-4 text-gray-700"/><p className="text-gray-500">No fallen heroes... yet.</p></div>) : (<div className="space-y-4">{graveyard.slice().reverse().map((fallen, i) => (<div key={i} className="bg-gray-900 rounded-lg p-4 border-2 border-red-900 opacity-70 hover:opacity-90 transition-opacity"><div className="flex items-center gap-4"><div className="text-4xl opacity-50">{fallen.class ? fallen.class.emblem : '☠️'}</div><div className="flex-1"><h3 className="text-xl font-bold text-red-400">{fallen.name}</h3><p className="text-gray-400">{fallen.title} {fallen.class ? fallen.class.name : ''} • Level {fallen.lvl}</p><p className="text-red-300">Fell on {fallen.day ? GAME_CONSTANTS.DAY_NAMES[fallen.day - 1]?.name || `Day ${fallen.day}` : 'Day 1'} • {fallen.xp} XP earned</p><p className="text-gray-300">Trials completed: {fallen.tasks}/{fallen.total}</p>{fallen.skipCount > 0 && (<p className="text-red-400 text-sm mt-1">💀 Skipped {fallen.skipCount} day{fallen.skipCount > 1 ? 's' : ''}</p>)}{fallen.cursed && (<p className="text-purple-400 text-sm">🌑 Died while cursed</p>)}<p className="text-red-500 text-sm italic mt-2">"The curse claimed another soul..."</p></div></div></div>))}</div>)}
              </div>
            </div>
          )}

          {showInventoryModal && (
            <div className="fixed inset-0 bg-black bg-opacity-90 flex items-start justify-center p-4 z-50" onClick={() => setShowInventoryModal(false)}>
              <div className="rounded-xl p-6 max-w-lg w-full border-2 relative" style={{background: 'linear-gradient(to bottom, rgba(40, 30, 10, 0.95), rgba(30, 20, 0, 0.95), rgba(20, 10, 0, 0.95))', borderColor: COLORS.gold, boxShadow: '0 0 15px rgba(212, 175, 55, 0.25), 0 0 30px rgba(212, 175, 55, 0.1)'}} onClick={e => e.stopPropagation()}>
                <button onClick={() => setShowInventoryModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={24}/></button>
                
                <div className="text-center mb-6">
                  <h2 className="text-3xl font-bold mb-2" style={{color: COLORS.amber.base, letterSpacing: '0.1em'}}>SUPPLIES</h2>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <div style={{width: '120px', height: '1px', background: `linear-gradient(to right, transparent, rgba(184, 134, 11, 0.3))`}}></div>
                    <span style={{color: 'rgba(184, 134, 11, 0.4)', fontSize: '8px'}}>◆</span>
                    <div style={{width: '120px', height: '1px', background: `linear-gradient(to left, transparent, rgba(184, 134, 11, 0.3))`}}></div>
                  </div>
                  <p className="text-sm mt-2 italic" style={{color: COLORS.silver}}>"What keeps you alive in the darkness..."</p>
                </div>
                
                <div className="space-y-4">
                  {/* Health Potions */}
                  <div className="rounded-lg p-4 border-2" style={{backgroundColor: 'rgba(139, 0, 0, 0.2)', borderColor: 'rgba(139, 0, 0, 0.5)'}}>
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <p className="font-bold text-lg" style={{color: '#F5F5DC'}}>Health Potion</p>
                        <p className="text-sm mb-1" style={{color: '#FF6B6B'}}>Restores 30 HP</p>
                        <p className="text-xs italic" style={{color: COLORS.silver}}>"Crimson elixir. Mends wounds."</p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold mb-2" style={{color: '#FF6B6B'}}>{healthPots}</p>
                        <button 
                          onClick={useHealth} 
                          disabled={healthPots === 0 || hp >= getMaxHp()}
                          className="px-4 py-2 rounded transition-all text-sm border-2"
                          style={{
                            backgroundColor: (healthPots === 0 || hp >= getMaxHp()) ? '#2C3E50' : COLORS.crimson.base,
                            borderColor: (healthPots === 0 || hp >= getMaxHp()) ? '#95A5A6' : COLORS.crimson.border,
                            color: '#F5F5DC',
                            cursor: (healthPots === 0 || hp >= getMaxHp()) ? 'not-allowed' : 'pointer',
                            opacity: (healthPots === 0 || hp >= getMaxHp()) ? 0.5 : 1
                          }}
                          onMouseEnter={(e) => {if (!(healthPots === 0 || hp >= getMaxHp())) e.currentTarget.style.backgroundColor = COLORS.crimson.hover}}
                          onMouseLeave={(e) => {if (!(healthPots === 0 || hp >= getMaxHp())) e.currentTarget.style.backgroundColor = COLORS.crimson.base}}
                        >
                          Use
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Stamina Potions */}
                  <div className="rounded-lg p-4 border-2" style={{backgroundColor: 'rgba(30, 58, 95, 0.2)', borderColor: 'rgba(30, 58, 95, 0.5)'}}>
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <p className="font-bold text-lg" style={{color: '#F5F5DC'}}>Stamina Potion</p>
                        <p className="text-sm mb-1" style={{color: '#6BB6FF'}}>Restores 50 SP</p>
                        <p className="text-xs italic" style={{color: COLORS.silver}}>"Azure draught. Vigor renewed."</p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold mb-2" style={{color: '#6BB6FF'}}>{staminaPots}</p>
                        <button 
                          onClick={() => { 
                            if (staminaPots > 0 && stamina < getMaxStamina()) { 
                              setStaminaPots(s => s - 1); 
                              setStamina(s => Math.min(getMaxStamina(), s + GAME_CONSTANTS.STAMINA_POTION_RESTORE)); 
                              addLog(`⚡ Used Stamina Potion! +${GAME_CONSTANTS.STAMINA_POTION_RESTORE} SP`); 
                            } 
                          }} 
                          disabled={staminaPots === 0 || stamina >= getMaxStamina()}
                          className="px-4 py-2 rounded transition-all text-sm border-2"
                          style={{
                            backgroundColor: (staminaPots === 0 || stamina >= getMaxStamina()) ? '#2C3E50' : COLORS.sapphire.base,
                            borderColor: (staminaPots === 0 || stamina >= getMaxStamina()) ? '#95A5A6' : COLORS.sapphire.border,
                            color: '#F5F5DC',
                            cursor: (staminaPots === 0 || stamina >= getMaxStamina()) ? 'not-allowed' : 'pointer',
                            opacity: (staminaPots === 0 || stamina >= getMaxStamina()) ? 0.5 : 1
                          }}
                          onMouseEnter={(e) => {if (!(staminaPots === 0 || stamina >= getMaxStamina())) e.currentTarget.style.backgroundColor = COLORS.sapphire.hover}}
                          onMouseLeave={(e) => {if (!(staminaPots === 0 || stamina >= getMaxStamina())) e.currentTarget.style.backgroundColor = COLORS.sapphire.base}}
                        >
                          Use
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Cleanse Potions */}
                  <div className={`rounded-lg p-4 border-2 ${curseLevel > 0 ? 'animate-pulse' : ''}`} style={{backgroundColor: 'rgba(107, 44, 145, 0.2)', borderColor: curseLevel > 0 ? 'rgba(138, 59, 181, 0.8)' : 'rgba(107, 44, 145, 0.5)', boxShadow: curseLevel > 0 ? '0 0 20px rgba(138, 59, 181, 0.4)' : 'none'}}>
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <p className="font-bold text-lg" style={{color: '#F5F5DC'}}>Cleanse Potion</p>
                        <p className="text-sm mb-1" style={{color: '#B794F4'}}>Removes curse</p>
                        <p className="text-xs italic" style={{color: COLORS.silver}}>"Purifying brew. Breaks the hold."</p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold mb-2" style={{color: '#B794F4'}}>{cleansePots}</p>
                        <button 
                          onClick={useCleanse} 
                          disabled={cleansePots === 0 || curseLevel === 0}
                          className="px-4 py-2 rounded transition-all text-sm border-2"
                          style={{
                            backgroundColor: (cleansePots === 0 || curseLevel === 0) ? '#2C3E50' : COLORS.amethyst.base,
                            borderColor: (cleansePots === 0 || curseLevel === 0) ? '#95A5A6' : COLORS.amethyst.border,
                            color: '#F5F5DC',
                            cursor: (cleansePots === 0 || curseLevel === 0) ? 'not-allowed' : 'pointer',
                            opacity: (cleansePots === 0 || curseLevel === 0) ? 0.5 : 1
                          }}
                          onMouseEnter={(e) => {if (!(cleansePots === 0 || curseLevel === 0)) e.currentTarget.style.backgroundColor = COLORS.amethyst.hover}}
                          onMouseLeave={(e) => {if (!(cleansePots === 0 || curseLevel === 0)) e.currentTarget.style.backgroundColor = COLORS.amethyst.base}}
                        >
                          Use
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Lucky Charm (if active) */}
                  {luckyCharmActive && (
                    <div className="rounded-lg p-4 border-2" style={{backgroundColor: 'rgba(47, 82, 51, 0.2)', borderColor: 'rgba(47, 82, 51, 0.5)'}}>
                      <div>
                        <p className="font-bold text-lg mb-1" style={{color: '#F5F5DC'}}>Lucky Charm</p>
                        <p className="text-sm mb-1" style={{color: '#68D391'}}>2x loot from next elite boss</p>
                        <p className="text-xs italic" style={{color: COLORS.silver}}>"Fortune favors the bold."</p>
                        <p className="text-xs mt-2" style={{color: '#68D391'}}>✓ Active</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <button 
                  onClick={() => setShowInventoryModal(false)} 
                  className="w-full mt-6 py-2 rounded-lg transition-all border-2"
                  style={{backgroundColor: COLORS.slate.base, borderColor: COLORS.slate.border, color: '#F5F5DC'}}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.slate.hover}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = COLORS.slate.base}
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {showCraftingModal && (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-start justify-center p-4 z-50 overflow-y-auto" onClick={() => setShowCraftingModal(false)}>
              <div className="rounded-xl p-6 max-w-2xl w-full border-2 my-8 relative" style={{background: 'linear-gradient(to bottom, rgba(40, 10, 60, 0.95), rgba(30, 0, 40, 0.95), rgba(20, 0, 30, 0.95))', borderColor: COLORS.gold, boxShadow: '0 0 15px rgba(212, 175, 55, 0.25), 0 0 30px rgba(212, 175, 55, 0.1)'}} onClick={e => e.stopPropagation()}>
                <button onClick={() => setShowCraftingModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={24}/></button>
                
                <div className="text-center mb-6">
                  <h2 className="text-3xl font-bold mb-2" style={{color: '#B794F4', letterSpacing: '0.1em'}}>
                    THE MERCHANT
                  </h2>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <div style={{width: '120px', height: '1px', background: 'linear-gradient(to right, transparent, rgba(183, 148, 244, 0.3))'}}></div>
                    <span style={{color: 'rgba(183, 148, 244, 0.4)', fontSize: '8px'}}>◆</span>
                    <div style={{width: '120px', height: '1px', background: 'linear-gradient(to left, transparent, rgba(183, 148, 244, 0.3))'}}></div>
                  </div>
                  <p className="text-sm mt-2 italic" style={{color: COLORS.silver}}>"{getMerchantDialogue()}"</p>
                </div>
                
                <div className="rounded-lg p-4 mb-6 border-2" style={{backgroundColor: 'rgba(107, 44, 145, 0.3)', borderColor: 'rgba(183, 148, 244, 0.4)'}}>
                  <p className="text-center text-lg">
                    <span style={{color: COLORS.silver}}>Current Essence:</span> 
                    <span className="font-bold text-2xl ml-2" style={{color: '#B794F4'}}>{essence}</span>
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => craftItem('healthPotion')} 
                    disabled={essence < 25}
                    className="p-4 rounded-lg border-2 transition-all cursor-pointer" style={{backgroundColor: essence >= 25 ? 'rgba(139, 0, 0, 0.3)' : 'rgba(44, 62, 80, 0.3)', borderColor: essence >= 25 ? 'rgba(139, 0, 0, 0.6)' : 'rgba(149, 165, 166, 0.3)', opacity: essence >= 25 ? 1 : 0.5, cursor: essence >= 25 ? 'pointer' : 'not-allowed'}} onMouseEnter={(e) => {if (essence >= 25) e.currentTarget.style.backgroundColor = 'rgba(165, 42, 42, 0.5)'}} onMouseLeave={(e) => {if (essence >= 25) e.currentTarget.style.backgroundColor = 'rgba(139, 0, 0, 0.3)'}}
                  >
                    <div className="mb-2">
                      <p className="font-bold text-lg mb-2" style={{color: '#F5F5DC'}}>Health Potion</p>
                      <p className="text-sm mb-2" style={{color: '#FF6B6B'}}>Restores 30 HP</p>
                      <p className="text-sm font-bold mb-2" style={{color: '#D4AF37'}}>25 Essence</p>
                      <p className="text-xs italic" style={{color: COLORS.silver}}>"Crimson elixir. Mends wounds, not souls."</p>
                    </div>
                  </button>
                  
                  <button 
                    onClick={() => craftItem('staminaPotion')} 
                    disabled={essence < 20}
                    className="p-4 rounded-lg border-2 transition-all" style={{backgroundColor: essence >= 20 ? 'rgba(30, 58, 95, 0.3)' : 'rgba(44, 62, 80, 0.3)', borderColor: essence >= 20 ? 'rgba(30, 58, 95, 0.6)' : 'rgba(149, 165, 166, 0.3)', opacity: essence >= 20 ? 1 : 0.5, cursor: essence >= 20 ? 'pointer' : 'not-allowed'}} onMouseEnter={(e) => {if (essence >= 20) e.currentTarget.style.backgroundColor = 'rgba(43, 80, 130, 0.5)'}} onMouseLeave={(e) => {if (essence >= 20) e.currentTarget.style.backgroundColor = 'rgba(30, 58, 95, 0.3)'}}
                  >
                    <div className="mb-2">
                      <p className="font-bold text-lg mb-2" style={{color: '#F5F5DC'}}>Stamina Potion</p>
                      <p className="text-sm mb-2" style={{color: '#6BB6FF'}}>Restores 50 SP</p>
                      <p className="text-sm font-bold mb-2" style={{color: '#D4AF37'}}>20 Essence</p>
                      <p className="text-xs italic" style={{color: COLORS.silver}}>"Azure draught. Vigor renewed."</p>
                    </div>
                  </button>
                  
                  <button 
                    onClick={() => craftItem('cleansePotion')} 
                    disabled={essence < 50}
                    className="p-4 rounded-lg border-2 transition-all" style={{backgroundColor: essence >= 50 ? 'rgba(107, 44, 145, 0.3)' : 'rgba(44, 62, 80, 0.3)', borderColor: essence >= 50 ? 'rgba(107, 44, 145, 0.6)' : 'rgba(149, 165, 166, 0.3)', opacity: essence >= 50 ? 1 : 0.5, cursor: essence >= 50 ? 'pointer' : 'not-allowed'}} onMouseEnter={(e) => {if (essence >= 50) e.currentTarget.style.backgroundColor = 'rgba(138, 59, 181, 0.5)'}} onMouseLeave={(e) => {if (essence >= 50) e.currentTarget.style.backgroundColor = 'rgba(107, 44, 145, 0.3)'}}
                  >
                    <div className="mb-2">
                      <p className="font-bold text-lg mb-2" style={{color: '#F5F5DC'}}>Cleanse Potion</p>
                      <p className="text-sm font-bold mb-2" style={{color: '#D4AF37'}}>50 Essence</p>
                      <p className="text-sm mb-2" style={{color: '#B794F4'}}>Removes curse</p>
                      <p className="text-xs italic" style={{color: COLORS.silver}}>"Purifying brew. Breaks the curse's hold."</p>
                    </div>
                  </button>
                  
                  <button 
                    onClick={() => craftItem('weaponOil')} 
                    disabled={essence < 40 || weaponOilActive}
                    className="p-4 rounded-lg border-2 transition-all" style={{backgroundColor: (essence >= 40 && !weaponOilActive) ? 'rgba(184, 134, 11, 0.3)' : 'rgba(44, 62, 80, 0.3)', borderColor: (essence >= 40 && !weaponOilActive) ? 'rgba(184, 134, 11, 0.6)' : 'rgba(149, 165, 166, 0.3)', opacity: (essence >= 40 && !weaponOilActive) ? 1 : 0.5, cursor: (essence >= 40 && !weaponOilActive) ? 'pointer' : 'not-allowed'}} onMouseEnter={(e) => {if (essence >= 40 && !weaponOilActive) e.currentTarget.style.backgroundColor = 'rgba(218, 165, 32, 0.5)'}} onMouseLeave={(e) => {if (essence >= 40 && !weaponOilActive) e.currentTarget.style.backgroundColor = 'rgba(184, 134, 11, 0.3)'}}
                  >
                    <div className="mb-2">
                      <p className="font-bold text-lg mb-2" style={{color: '#F5F5DC'}}>Weapon Oil</p>
                      <p className="text-sm font-bold mb-2" style={{color: '#D4AF37'}}>40 Essence</p>
                      <p className="text-sm mb-1" style={{color: '#DAA520'}}>+5 weapon until dawn</p>
                      {weaponOilActive && <p className="text-xs mb-2" style={{color: '#90EE90'}}>✓ Active</p>}
                      <p className="text-xs italic" style={{color: COLORS.silver}}>"Darkened oil. Edges sharpen, strikes deepen."</p>
                    </div>
                  </button>
                  
                  <button 
                    onClick={() => craftItem('armorPolish')} 
                    disabled={essence < 40 || armorPolishActive}
                    className="p-4 rounded-lg border-2 transition-all" style={{backgroundColor: (essence >= 40 && !armorPolishActive) ? 'rgba(0, 77, 77, 0.3)' : 'rgba(44, 62, 80, 0.3)', borderColor: (essence >= 40 && !armorPolishActive) ? 'rgba(0, 77, 77, 0.6)' : 'rgba(149, 165, 166, 0.3)', opacity: (essence >= 40 && !armorPolishActive) ? 1 : 0.5, cursor: (essence >= 40 && !armorPolishActive) ? 'pointer' : 'not-allowed'}} onMouseEnter={(e) => {if (essence >= 40 && !armorPolishActive) e.currentTarget.style.backgroundColor = 'rgba(0, 102, 102, 0.5)'}} onMouseLeave={(e) => {if (essence >= 40 && !armorPolishActive) e.currentTarget.style.backgroundColor = 'rgba(0, 77, 77, 0.3)'}}
                  >
                    <div className="mb-2">
                      <p className="font-bold text-lg mb-2" style={{color: '#F5F5DC'}}>Armor Polish</p>
                      <p className="text-sm font-bold mb-2" style={{color: '#D4AF37'}}>40 Essence</p>
                      <p className="text-sm mb-1" style={{color: '#6BB6FF'}}>+5 armor until dawn</p>
                      {armorPolishActive && <p className="text-xs mb-2" style={{color: '#90EE90'}}>✓ Active</p>}
                      <p className="text-xs italic" style={{color: COLORS.silver}}>"Protective salve. Steel hardens, flesh endures."</p>
                    </div>
                  </button>
                  
                  <button 
                    onClick={() => craftItem('luckyCharm')} 
                    disabled={essence < 80 || luckyCharmActive}
                    className="p-4 rounded-lg border-2 transition-all" style={{backgroundColor: (essence >= 80 && !luckyCharmActive) ? 'rgba(47, 82, 51, 0.3)' : 'rgba(44, 62, 80, 0.3)', borderColor: (essence >= 80 && !luckyCharmActive) ? 'rgba(47, 82, 51, 0.6)' : 'rgba(149, 165, 166, 0.3)', opacity: (essence >= 80 && !luckyCharmActive) ? 1 : 0.5, cursor: (essence >= 80 && !luckyCharmActive) ? 'pointer' : 'not-allowed'}} onMouseEnter={(e) => {if (essence >= 80 && !luckyCharmActive) e.currentTarget.style.backgroundColor = 'rgba(61, 107, 66, 0.5)'}} onMouseLeave={(e) => {if (essence >= 80 && !luckyCharmActive) e.currentTarget.style.backgroundColor = 'rgba(47, 82, 51, 0.3)'}}
                  >
                    <div className="mb-2">
                      <p className="font-bold text-lg mb-2" style={{color: '#F5F5DC'}}>Lucky Charm</p>
                      <p className="text-sm font-bold mb-2" style={{color: '#D4AF37'}}>80 Essence</p>
                      <p className="text-sm mb-1" style={{color: '#68D391'}}>2x loot from next elite boss</p>
                      {luckyCharmActive && <p className="text-xs mb-2" style={{color: '#90EE90'}}>✓ Active</p>}
                      <p className="text-xs italic" style={{color: COLORS.silver}}>"Blessed talisman. Fortune favors the bold."</p>
                    </div>
                  </button>
                </div>
                
                <button 
                  onClick={() => setShowCraftingModal(false)} 
                  className="w-full mt-6 py-2 rounded-lg transition-all border-2"
                  style={{backgroundColor: COLORS.slate.base, borderColor: COLORS.slate.border, color: '#F5F5DC'}}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.slate.hover}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = COLORS.slate.base}
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {showCustomizeModal && (
  <div className="fixed inset-0 bg-black bg-opacity-90 flex items-start justify-center p-4 z-50" onClick={() => setShowCustomizeModal(false)}>
    <div className="rounded-xl p-6 max-w-md w-full border-2" style={{background: 'linear-gradient(to bottom, rgba(50, 10, 50, 0.95), rgba(60, 0, 20, 0.95), rgba(20, 0, 30, 0.95))', borderColor: COLORS.gold, boxShadow: '0 0 15px rgba(212, 175, 55, 0.25), 0 0 30px rgba(212, 175, 55, 0.1)'}} onClick={e => e.stopPropagation()}>
      <div className="mb-6 relative">
        <button onClick={() => setShowCustomizeModal(false)} className="text-gray-400 hover:text-white absolute -top-2 right-0">
          <X size={24}/>
        </button>
        <div className="text-center">
          <h3 className="text-3xl font-bold mb-2" style={{color: '#F5F5DC', letterSpacing: '0.1em'}}>CUSTOMIZE YOUR HERO</h3>
          <div className="flex items-center justify-center gap-2">
            <div style={{width: '100px', height: '1px', background: 'linear-gradient(to right, transparent, rgba(220, 20, 60, 0.3))'}}></div>
            <span style={{color: 'rgba(220, 20, 60, 0.4)', fontSize: '8px'}}>◆</span>
            <div style={{width: '100px', height: '1px', background: 'linear-gradient(to left, transparent, rgba(220, 20, 60, 0.3))'}}></div>
          </div>
        </div>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm mb-2 text-center" style={{color: COLORS.silver}}>Hero Name</label>
        <input 
          type="text" 
          placeholder="Enter your hero's name" 
          value={customName}
          onChange={e => setCustomName(e.target.value)}
          className="w-full p-3 rounded-lg border focus:outline-none" 
          style={{backgroundColor: 'rgba(0, 0, 0, 0.4)', color: '#F5F5DC', borderColor: 'rgba(212, 175, 55, 0.3)', fontFamily: 'Cinzel, serif'}}
          onFocus={e => e.target.style.borderColor = COLORS.gold}
          onBlur={e => e.target.style.borderColor = 'rgba(212, 175, 55, 0.3)'}
          autoFocus 
        />
      </div>
      
      <div className="mb-6">
        <label className="block text-sm mb-2 text-center" style={{color: COLORS.silver}}>Choose Your Class</label>
        <div className="grid grid-cols-2 gap-2">
          {classes.map(cls => (
            <button
              key={cls.name}
              type="button"
              onClick={() => setCustomClass(cls)}
              className="p-4 rounded-lg border-2 transition-all"
              style={{
                backgroundColor: customClass?.name === cls.name ? 'rgba(212, 175, 55, 0.15)' : 'rgba(0, 0, 0, 0.3)',
                borderColor: customClass?.name === cls.name ? COLORS.gold : 'rgba(128, 128, 128, 0.3)'
              }}
              onMouseEnter={(e) => {
                if (customClass?.name !== cls.name) {
                  e.currentTarget.style.borderColor = 'rgba(128, 128, 128, 0.5)';
                }
              }}
              onMouseLeave={(e) => {
                if (customClass?.name !== cls.name) {
                  e.currentTarget.style.borderColor = 'rgba(128, 128, 128, 0.3)';
                }
              }}
            >
              <div className="text-4xl mb-2">{cls.emblem}</div>
              <div className="font-bold" style={{color: '#F5F5DC'}}>{cls.name}</div>
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
          className="flex-1 py-2 rounded-lg transition-all font-bold border-2"
          style={{backgroundColor: COLORS.gold, borderColor: COLORS.obsidian.base, color: COLORS.obsidian.base}}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FFD700'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = COLORS.gold}
        >
          Confirm
        </button>
        <button 
          onClick={() => {
            setCustomName('');
            setCustomClass(null);
            setShowCustomizeModal(false);
          }} 
          className="flex-1 py-2 rounded-lg transition-all border-2"
          style={{backgroundColor: COLORS.slate.base, borderColor: COLORS.slate.border, color: '#F5F5DC'}}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.slate.hover}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = COLORS.slate.base}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}

{showDeckModal && (
  <div className="fixed inset-0 bg-black bg-opacity-75 flex items-start justify-center p-4 z-50" onClick={() => setShowDeckModal(false)}>
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
          className="flex-1 py-2 rounded-lg transition-all border-2" style={{backgroundColor: !newDeck.name.trim() ? '#2C3E50' : '#6B2C91', borderColor: !newDeck.name.trim() ? '#95A5A6' : '#C0C0C0', color: '#F5F5DC', cursor: !newDeck.name.trim() ? 'not-allowed' : 'pointer', opacity: !newDeck.name.trim() ? 0.6 : 1}} onMouseEnter={(e) => {if (newDeck.name.trim()) e.currentTarget.style.backgroundColor = '#8A3BB5'}} onMouseLeave={(e) => {if (newDeck.name.trim()) e.currentTarget.style.backgroundColor = '#6B2C91'}}
        >
          Create Deck
        </button>
        <button 
          onClick={() => { setShowDeckModal(false); setNewDeck({name: ''}); }} 
          className="flex-1 py-2 rounded-lg transition-all border-2" style={{backgroundColor: '#2C3E50', borderColor: '#95A5A6', color: '#F5F5DC'}} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#34495E'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2C3E50'}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}

{showCardModal && selectedDeck !== null && (
  <div className="fixed inset-0 bg-black bg-opacity-75 flex items-start justify-center p-4 z-50" onClick={() => setShowCardModal(false)}>
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
  <div className="fixed inset-0 bg-black bg-opacity-95 flex items-start justify-center p-4 z-50">
    <div className="bg-gradient-to-b from-purple-900 to-black rounded-xl p-8 max-w-2xl w-full border-4 border-purple-600 shadow-2xl">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-purple-400">{flashcardDecks[selectedDeck].name}</h2>
          <p className="text-gray-400">Cards remaining: {studyQueue.length} | Total studied: {flashcardDecks[selectedDeck].cards.length - studyQueue.length + 1}</p>
        </div>
        <button 
          onClick={() => {
            if (reviewingMistakes) {
              // Return to quiz results without marking as reviewed
              setShowStudyModal(false);
              setReviewingMistakes(false);
              setStudyQueue([]);
              setIsFlipped(false);
              setShowQuizModal(true);
              setShowQuizResults(true);
            } else {
              setShowStudyModal(false);
              setSelectedDeck(null);
              setCurrentCardIndex(0);
              setStudyQueue([]);
              setIsFlipped(false);
            }
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
              ? flashcardDecks[selectedDeck].cards[studyQueue[0]].back 
              : flashcardDecks[selectedDeck].cards[studyQueue[0]].front}
          </p>
          <p className="text-sm text-gray-500 mt-6 italic">Click to flip</p>
        </div>
      </div>
      
      <div className="bg-gray-800 rounded-full h-2 mb-6">
        <div 
          className="bg-purple-500 h-2 rounded-full transition-all" 
          style={{width: `${((flashcardDecks[selectedDeck].cards.length - studyQueue.length) / flashcardDecks[selectedDeck].cards.length) * 100}%`}}
        />
      </div>
      
      {isFlipped && (
        <div className="flex gap-4">
          <button
            onClick={() => {
              // Add current card to end of queue, remove from front
              const currentCard = studyQueue[0];
              const newQueue = [...studyQueue.slice(1), currentCard];
              setStudyQueue(newQueue);
              setIsFlipped(false);
            }}
            className="flex-1 bg-red-600 hover:bg-red-700 py-4 rounded-lg font-bold text-lg transition-all"
          >
            ❌ Review Again
          </button>
          
          <button
            onClick={() => {
              // Mark as mastered, give XP
              const currentCard = studyQueue[0];
              setFlashcardDecks(prev => prev.map((deck, idx) => 
                idx === selectedDeck 
                  ? {...deck, cards: deck.cards.map((card, cardIdx) => 
                      cardIdx === currentCard ? {...card, mastered: true} : card
                    )}
                  : deck
              ));
              
              setXp(x => x + 5);
              
              // Remove from queue
              const newQueue = studyQueue.slice(1);
              
              if (newQueue.length === 0) {
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
                
                // If we were reviewing mistakes, mark as reviewed and return to quiz results
                if (reviewingMistakes) {
                  setMistakesReviewed(true);
                  setReviewingMistakes(false);
                  setShowStudyModal(false);
                  setShowQuizModal(true);
                  setShowQuizResults(true);
                  setIsFlipped(false);
                  addLog('✅ Mistakes reviewed! Retake unlocked.');
                } else {
                  setShowStudyModal(false);
                  setSelectedDeck(null);
                  setCurrentCardIndex(0);
                  setStudyQueue([]);
                  setIsFlipped(false);
                }
              } else {
                setStudyQueue(newQueue);
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

{showQuizModal && selectedDeck !== null && flashcardDecks[selectedDeck] && (
  <div className="fixed inset-0 bg-black bg-opacity-95 flex items-start justify-center p-4 z-50">
    <div className="bg-gradient-to-b from-blue-900 to-black rounded-xl p-8 max-w-2xl w-full border-4 border-blue-600 shadow-2xl">
      {!showQuizResults ? (
        <>
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-blue-400">📝 {flashcardDecks[selectedDeck].name} - Quiz</h2>
              <p className="text-gray-400">Question {currentQuizIndex + 1} of {quizQuestions.length} | Score: {quizScore}/{quizQuestions.length}</p>
            </div>
            <button 
              onClick={() => {
                setShowQuizModal(false);
                setSelectedDeck(null);
                setQuizQuestions([]);
                setCurrentQuizIndex(0);
                setQuizScore(0);
                setSelectedAnswer(null);
                setShowQuizResults(false);
                setWrongCardIndices([]);
                setIsRetakeQuiz(false);
                setMistakesReviewed(false);
                setReviewingMistakes(false);
              }}
              className="text-gray-400 hover:text-white"
            >
              <X size={32}/>
            </button>
          </div>
          
          <div className="bg-gray-800 rounded-xl p-8 mb-6 min-h-[200px] border-2 border-blue-500">
            <p className="text-sm text-gray-500 mb-4">QUESTION</p>
            <p className="text-2xl text-white mb-8">{quizQuestions[currentQuizIndex]?.question}</p>
            
            <div className="space-y-3">
              {quizQuestions[currentQuizIndex]?.choices.map((choice, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedAnswer(choice)}
                  disabled={selectedAnswer !== null}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    selectedAnswer === null
                      ? 'bg-gray-700 border-gray-600 hover:bg-gray-600 hover:border-blue-400'
                      : selectedAnswer === choice
                        ? choice === quizQuestions[currentQuizIndex].correctAnswer
                          ? 'bg-green-600 border-green-400'
                          : 'bg-red-600 border-red-400'
                        : choice === quizQuestions[currentQuizIndex].correctAnswer
                          ? 'bg-green-600 border-green-400'
                          : 'bg-gray-700 border-gray-600'
                  } disabled:cursor-not-allowed`}
                >
                  <span className="font-bold mr-3">{String.fromCharCode(65 + idx)}.</span>
                  {choice}
                </button>
              ))}
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-full h-2 mb-6">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all" 
              style={{width: `${((currentQuizIndex + 1) / quizQuestions.length) * 100}%`}}
            />
          </div>
          
          {selectedAnswer && (
            <button
              onClick={() => {
                let finalScore = quizScore;
                const isCorrect = selectedAnswer === quizQuestions[currentQuizIndex].correctAnswer;
                
                if (isCorrect) {
                  finalScore = quizScore + 1;
                  setQuizScore(finalScore);
                } else {
                  // Track wrong answer
                  setWrongCardIndices(prev => [...prev, quizQuestions[currentQuizIndex].cardIndex]);
                }
                
                const nextIndex = currentQuizIndex + 1;
                if (nextIndex >= quizQuestions.length) {
                  // Quiz complete - award XP and loot
                  const baseXP = finalScore * 10;
                  const xpGain = isRetakeQuiz ? Math.floor(baseXP * 0.5) : baseXP;
                  setXp(x => x + xpGain);
                  addLog(`📝 Quiz complete! +${xpGain} XP${isRetakeQuiz ? ' (retake)' : ''}`);
                  
                  // Loot for good performance (70%+) - only on first attempt
                  if (!isRetakeQuiz && finalScore >= quizQuestions.length * 0.7) {
                    const roll = Math.random();
                    if (roll < 0.4) {
                      setHealthPots(h => h + 1);
                      addLog('💊 Found Health Potion!');
                    } else if (roll < 0.7) {
                      setStaminaPots(s => s + 1);
                      addLog('⚡ Found Stamina Potion!');
                    }
                  }
                  
                  setShowQuizResults(true);
                } else {
                  setCurrentQuizIndex(nextIndex);
                  setSelectedAnswer(null);
                }
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 py-4 rounded-lg font-bold text-lg transition-all"
            >
              {currentQuizIndex + 1 === quizQuestions.length ? 'See Results' : 'Next Question →'}
            </button>
          )}
        </>
      ) : (
        <div className="text-center">
          <div className="mb-8">
            <div className="text-8xl mb-4">
              {quizScore === quizQuestions.length ? '🏆' : quizScore >= quizQuestions.length * 0.7 ? '⭐' : '📖'}
            </div>
            <h2 className="text-3xl font-bold text-blue-400 mb-2">Quiz Complete!</h2>
            <p className="text-5xl font-bold text-white mb-4">{quizScore} / {quizQuestions.length}</p>
            <p className="text-xl text-gray-300">
              {quizScore === quizQuestions.length && 'Perfect Score! 🎉'}
              {quizScore >= quizQuestions.length * 0.7 && quizScore < quizQuestions.length && 'Great Job! 💪'}
              {quizScore < quizQuestions.length * 0.7 && 'Keep Studying! 📚'}
            </p>
            {wrongCardIndices.length > 0 && (
              <p className="text-red-400 mt-2">Missed {wrongCardIndices.length} question{wrongCardIndices.length !== 1 ? 's' : ''}</p>
            )}
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <p className="text-yellow-400 text-xl mb-2">+{isRetakeQuiz ? Math.floor(quizScore * 10 * 0.5) : quizScore * 10} XP Earned{isRetakeQuiz ? ' (Retake - 50%)' : ''}</p>
            {!isRetakeQuiz && quizScore >= quizQuestions.length * 0.7 && (
              <p className="text-gray-400">Bonus loot awarded! Check your inventory.</p>
            )}
          </div>
          
          <div className="space-y-3">
            {wrongCardIndices.length > 0 && (
              <button
                onClick={() => {
                  // Open study modal with only wrong cards
                  setStudyQueue([...wrongCardIndices]);
                  setReviewingMistakes(true);
                  setShowQuizModal(false);
                  setShowQuizResults(false);
                  setIsFlipped(false);
                  setShowStudyModal(true);
                }}
                className="w-full bg-purple-600 hover:bg-purple-700 py-4 rounded-lg font-bold text-lg transition-all"
              >
                📖 Review Mistakes ({wrongCardIndices.length} card{wrongCardIndices.length !== 1 ? 's' : ''})
              </button>
            )}
            
            <button
              onClick={() => {
                // Retake quiz with reduced XP
                setShowQuizModal(false);
                setShowQuizResults(false);
                generateQuiz(selectedDeck, true);
              }}
              disabled={wrongCardIndices.length > 0 && !mistakesReviewed}
              className={`w-full py-4 rounded-lg font-bold text-lg transition-all ${
                wrongCardIndices.length > 0 && !mistakesReviewed
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {wrongCardIndices.length > 0 && !mistakesReviewed ? '🔒 Review Mistakes First' : '🔄 Retake Quiz (50% XP)'}
            </button>
            
            <button
              onClick={() => {
                setShowQuizModal(false);
                setSelectedDeck(null);
                setQuizQuestions([]);
                setCurrentQuizIndex(0);
                setQuizScore(0);
                setSelectedAnswer(null);
                setShowQuizResults(false);
                setWrongCardIndices([]);
                setIsRetakeQuiz(false);
                setMistakesReviewed(false);
                setReviewingMistakes(false);
              }}
              className="w-full bg-gray-600 hover:bg-gray-700 py-4 rounded-lg font-bold text-lg transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  </div>
)}

         {showModal && (
  <div className="fixed inset-0 bg-black bg-opacity-90 flex items-start justify-center p-4 z-50" onClick={() => setShowModal(false)}>
    <div className="rounded-xl p-6 max-w-md w-full border-2 relative" style={{background: 'linear-gradient(to bottom, rgba(60, 10, 10, 0.95), rgba(40, 0, 0, 0.95), rgba(20, 0, 10, 0.95))', borderColor: COLORS.gold, boxShadow: '0 0 15px rgba(212, 175, 55, 0.25), 0 0 30px rgba(212, 175, 55, 0.1)'}} onClick={e => e.stopPropagation()}>
      <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={24}/></button>
      
      <div className="text-center mb-6">
        <h3 className="text-3xl font-bold mb-2" style={{color: '#DC143C', letterSpacing: '0.1em'}}>ACCEPT NEW TRIAL</h3>
        <div className="flex items-center justify-center gap-2 mb-2">
          <div style={{width: '120px', height: '1px', background: 'linear-gradient(to right, transparent, rgba(220, 20, 60, 0.3))'}}></div>
          <span style={{color: 'rgba(220, 20, 60, 0.4)', fontSize: '8px'}}>◆</span>
          <div style={{width: '120px', height: '1px', background: 'linear-gradient(to left, transparent, rgba(220, 20, 60, 0.3))'}}></div>
        </div>
        <p className="text-sm mt-2 italic" style={{color: COLORS.silver}}>"The darkness demands sacrifice..."</p>
      </div>
      
      <input 
        type="text" 
        placeholder="Name your trial" 
        value={newTask.title} 
        onChange={e => setNewTask({...newTask, title: e.target.value})} 
        className="w-full p-3 rounded-lg mb-4 border focus:outline-none" 
        style={{backgroundColor: 'rgba(0, 0, 0, 0.4)', color: '#F5F5DC', borderColor: 'rgba(220, 20, 60, 0.3)', fontFamily: 'Cinzel, serif'}}
        onFocus={e => e.target.style.borderColor = '#DC143C'}
        onBlur={e => e.target.style.borderColor = 'rgba(220, 20, 60, 0.3)'}
        autoFocus 
      />
      
      <div className="mb-4">
        <label className="block text-sm mb-2 text-center" style={{color: COLORS.silver}}>Trial Difficulty</label>
        <div className="grid grid-cols-2 gap-3">
          <button 
            type="button" 
            onClick={() => setNewTask({...newTask, priority: 'important'})} 
            className="p-4 rounded-lg border-2 transition-all"
            style={{
              backgroundColor: newTask.priority === 'important' ? 'rgba(184, 134, 11, 0.3)' : 'rgba(0, 0, 0, 0.3)',
              borderColor: newTask.priority === 'important' ? COLORS.gold : 'rgba(128, 128, 128, 0.3)',
              color: '#F5F5DC'
            }}
          >
            <div className="font-bold mb-1">IMPORTANT</div>
            <div className="text-xs" style={{color: COLORS.gold}}>1.25x XP</div>
            <div className="text-xs mt-1 italic" style={{color: COLORS.silver}}>Greater reward</div>
          </button>
          
          <button 
            type="button" 
            onClick={() => setNewTask({...newTask, priority: 'routine'})} 
            className="p-4 rounded-lg border-2 transition-all"
            style={{
              backgroundColor: newTask.priority === 'routine' ? 'rgba(30, 58, 95, 0.3)' : 'rgba(0, 0, 0, 0.3)',
              borderColor: newTask.priority === 'routine' ? 'rgba(30, 58, 95, 0.6)' : 'rgba(128, 128, 128, 0.3)',
              color: '#F5F5DC'
            }}
          >
            <div className="font-bold mb-1">ROUTINE</div>
            <div className="text-xs" style={{color: '#6BB6FF'}}>1.0x XP</div>
            <div className="text-xs mt-1 italic" style={{color: COLORS.silver}}>Standard trial</div>
          </button>
        </div>
      </div>
      
      <div className="flex gap-2">
        <button 
          onClick={addTask} 
          disabled={!newTask.title} 
          className="flex-1 py-2 rounded-lg transition-all border-2"
          style={{
            backgroundColor: !newTask.title ? '#2C3E50' : COLORS.crimson.base,
            borderColor: !newTask.title ? '#95A5A6' : COLORS.crimson.border,
            color: '#F5F5DC',
            cursor: !newTask.title ? 'not-allowed' : 'pointer',
            opacity: !newTask.title ? 0.5 : 1
          }}
          onMouseEnter={(e) => {if (newTask.title) e.currentTarget.style.backgroundColor = COLORS.crimson.hover}}
          onMouseLeave={(e) => {if (newTask.title) e.currentTarget.style.backgroundColor = COLORS.crimson.base}}
        >
          Accept Trial
        </button>
        <button 
          onClick={() => setShowModal(false)} 
          className="flex-1 py-2 rounded-lg transition-all border-2"
          style={{backgroundColor: COLORS.slate.base, borderColor: COLORS.slate.border, color: '#F5F5DC'}}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.slate.hover}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = COLORS.slate.base}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}

{showImportModal && (
  <div className="fixed inset-0 bg-black bg-opacity-90 flex items-start justify-center p-4 z-50" onClick={() => setShowImportModal(false)}>
    <div className="rounded-xl p-6 max-w-md w-full border-2 relative" style={{background: 'linear-gradient(to bottom, rgba(0, 40, 40, 0.95), rgba(0, 30, 30, 0.95), rgba(0, 20, 20, 0.95))', borderColor: COLORS.gold, boxShadow: '0 0 15px rgba(212, 175, 55, 0.25), 0 0 30px rgba(212, 175, 55, 0.1)'}} onClick={e => e.stopPropagation()}>
      <button onClick={() => setShowImportModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={24}/></button>
      
      <div className="text-center mb-6">
        <h3 className="text-3xl font-bold mb-2" style={{color: '#5DD3D3', letterSpacing: '0.1em'}}>IMPORT FROM PLANNER</h3>
        <div className="flex items-center justify-center gap-2 mb-2">
          <div style={{width: '100px', height: '1px', background: 'linear-gradient(to right, transparent, rgba(93, 211, 211, 0.3))'}}></div>
          <span style={{color: 'rgba(93, 211, 211, 0.4)', fontSize: '8px'}}>◆</span>
          <div style={{width: '100px', height: '1px', background: 'linear-gradient(to left, transparent, rgba(93, 211, 211, 0.3))'}}></div>
        </div>
        <p className="text-sm mt-2 italic" style={{color: COLORS.silver}}>"Draw upon your prepared plans..."</p>
      </div>
      
      <div className="space-y-2">
        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day, idx) => {
          const taskCount = weeklyPlan[day]?.length || 0;
          // Highlight real-world current day, not game day
          const today = new Date();
          const todayDayIndex = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
          const realWorldDayIndex = todayDayIndex === 0 ? 6 : todayDayIndex - 1; // Convert to 0=Monday, 6=Sunday
          const isRealWorldToday = idx === realWorldDayIndex;
          
          return (
            <button
              key={day}
              onClick={() => importFromPlanner(day)}
              disabled={taskCount === 0}
              className="w-full p-4 rounded-lg border-2 transition-all text-left"
              style={{
                backgroundColor: isRealWorldToday 
                  ? 'rgba(0, 77, 77, 0.4)' 
                  : taskCount > 0 
                    ? 'rgba(0, 0, 0, 0.3)' 
                    : 'rgba(0, 0, 0, 0.3)',
                borderColor: isRealWorldToday 
                  ? 'rgba(93, 211, 211, 0.6)' 
                  : taskCount > 0 
                    ? 'rgba(128, 128, 128, 0.3)' 
                    : 'rgba(128, 128, 128, 0.3)',
                opacity: taskCount === 0 ? 0.5 : 1,
                cursor: taskCount === 0 ? 'not-allowed' : 'pointer'
              }}
              onMouseEnter={(e) => {
                if (taskCount > 0 && !isRealWorldToday) {
                  e.currentTarget.style.borderColor = 'rgba(93, 211, 211, 0.5)';
                }
              }}
              onMouseLeave={(e) => {
                if (taskCount > 0 && !isRealWorldToday) {
                  e.currentTarget.style.borderColor = 'rgba(128, 128, 128, 0.3)';
                }
              }}
            >
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-bold" style={{color: '#F5F5DC'}}>{day}</span>
                  {isRealWorldToday && <span className="ml-2 text-xs" style={{color: '#5DD3D3'}}>(Today)</span>}
                </div>
                <span className="text-sm" style={{color: taskCount > 0 ? '#68D391' : COLORS.silver}}>
                  {taskCount} task{taskCount !== 1 ? 's' : ''}
                </span>
              </div>
            </button>
          );
        })}
      </div>
      
      <button 
        onClick={() => setShowImportModal(false)} 
        className="w-full mt-4 py-2 rounded-lg transition-all border-2"
        style={{backgroundColor: COLORS.slate.base, borderColor: COLORS.slate.border, color: '#F5F5DC'}}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.slate.hover}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = COLORS.slate.base}
      >
        Cancel
      </button>
    </div>
  </div>
)}

         {showPlanModal && selectedDay && (
  <div className="fixed inset-0 bg-black bg-opacity-75 flex items-start justify-center p-4 z-50" onClick={() => setShowPlanModal(false)}>
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
          {showCalendarModal && selectedDate && (
  <div className="fixed inset-0 bg-black bg-opacity-75 flex items-start justify-center p-4 z-50" onClick={() => setShowCalendarModal(false)}>
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
              // Parse date in local timezone (not UTC)
              const [year, month, day] = selectedDate.split('-').map(Number);
              const date = new Date(year, month - 1, day);
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
            <div className="fixed inset-0 bg-black bg-opacity-90 flex items-start justify-center p-4 z-50 overflow-y-auto">
              <div className={`bg-gradient-to-b from-red-900 to-black rounded-xl p-8 max-w-2xl w-full border-4 border-red-600 shadow-2xl shadow-red-900/50 boss-enter my-8 ${bossFlash ? 'damage-flash-boss' : ''}`}>
               {bossName && (<h2 className="text-5xl text-center text-yellow-400 mb-2 font-bold" style={{fontFamily: 'Cinzel, serif'}}>{bossName}{bossDebuffs.poisonTurns > 0 && (<span className="ml-3 text-lg text-green-400 animate-pulse">☠️ POISONED ({bossDebuffs.poisonTurns})</span>)}{bossDebuffs.marked && (<span className="ml-3 text-lg text-cyan-400 animate-pulse">🎯 MARKED</span>)}{bossDebuffs.stunned && (<span className="ml-3 text-lg text-purple-400 animate-pulse">✨ STUNNED</span>)}</h2>)}
               <p className="text-xl font-bold text-center text-red-400 mb-4">
  {isFinalBoss ? (inPhase3 ? 'PHASE 3: ABYSS AWAKENING' : inPhase2 ? 'PHASE 2: THE PRESSURE' : 'THE UNDYING LEGEND') : 
   battleType === 'elite' ? 'TORMENTED CHAMPION' : 
   battleType === 'wave' ? `WAVE ASSAULT - Enemy ${currentWaveEnemy}/${totalWaveEnemies}` : 
   'ENEMY ENCOUNTER'}
</p>
                
                <div className="space-y-6">
                  {/* Boss HP Bar */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-red-400 font-bold">
                        {bossName || 'Boss'}
                        {enragedTurns > 0 && (<span className="ml-3 text-orange-400 font-bold animate-pulse">ENRAGED (ATK↑ DEF↓ ACC↓) ({enragedTurns})</span>)}
                      </span>
                      <span className="text-red-400">{bossHp}/{bossMax}</span>
                    </div>
                    <div className="bg-gray-800 rounded-full h-6 overflow-hidden">
                      <div className={`bg-red-600 h-6 rounded-full transition-all duration-300 ${bossFlash ? 'hp-pulse' : ''}`} style={{width: `${(bossHp / bossMax) * 100}%`}}></div>
                    </div>
                  </div>
                  
                  {/* Phase 2 Ramping Damage Indicator */}
                  {inPhase2 && !inPhase3 && phase2DamageStacks > 0 && (
                    <div className="bg-orange-900 bg-opacity-60 rounded-lg p-3 border-2 border-orange-500">
                      <p className="text-orange-400 font-bold text-center">🔺 RAMPING PRESSURE</p>
                      <p className="text-white text-center text-sm">Boss damage: +{phase2DamageStacks * 5}% ({phase2DamageStacks} stacks)</p>
                      <p className="text-xs text-orange-300 text-center italic mt-1">Stacks increase each turn!</p>
                    </div>
                  )}
                  
                  {/* Shadow Adds (Phase 2 & 3) */}
                  {(inPhase2 || inPhase3) && shadowAdds.length > 0 && (
                    <div className="bg-black bg-opacity-60 rounded-lg p-4 border-2 border-purple-600">
                      <p className="text-purple-400 font-bold mb-2 text-center">👤 SHADOW ADD{shadowAdds.length > 1 ? 'S' : ''} ({shadowAdds.length})</p>
                      <div className="space-y-2">
                        {shadowAdds.map((add, idx) => (
                          <div key={add.id} className="flex items-center justify-between bg-gray-900 rounded p-2">
                            <span className="text-gray-300">Shadow #{idx + 1}</span>
                            <div className="flex-1 mx-4">
                              <div className="bg-gray-700 rounded-full h-3 overflow-hidden">
                                <div className="bg-purple-500 h-3 rounded-full" style={{width: `${(add.hp / add.maxHp) * 100}%`}}></div>
                              </div>
                            </div>
                            <span className="text-purple-400 text-sm">{add.hp}/{add.maxHp}</span>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-purple-300 mt-2 text-center italic">
                        Your attacks target adds first! {inPhase3 ? 'Each add heals boss for 8 HP per turn.' : 'Kill it before Phase 3!'}
                      </p>
                    </div>
                  )}
                  
                  {/* AOE Warning */}
                  {aoeWarning && inPhase3 && (
                    <div className="bg-red-900 bg-opacity-80 rounded-lg p-4 border-4 border-yellow-400 animate-pulse">
                      <p className="text-yellow-400 font-bold text-center text-xl">⚠️ BOSS PREPARING DEVASTATING AOE!</p>
                      <p className="text-white text-center text-sm mt-2">Next turn: 35 damage slam!</p>
                      <div className="mt-3 pt-3 border-t border-yellow-600">
                        <p className="text-cyan-300 text-center text-sm font-bold">🛡️ DODGE: Avoid damage completely (safe)</p>
                        <p className="text-red-300 text-center text-sm font-bold">⚔️ ATTACK: Deal +50% damage but take counter-attack AND AOE (risky!)</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Enemy Dialogue Box - Positioned below enemy HP */}
                  {showTauntBoxes ? (
                    <div className="bg-black bg-opacity-80 rounded-lg p-3 border-2 border-red-600 min-h-[60px] flex items-center">
                      <p className="text-gray-300 text-sm italic leading-relaxed">{enemyTauntResponse ? `"${enemyTauntResponse}"` : '...'}</p>
                    </div>
                  ) : enemyDialogue ? (
                    <div className="bg-black bg-opacity-80 rounded-lg p-3 border-2 border-gray-600">
                      <p className="text-gray-300 text-center italic text-sm leading-relaxed">"{enemyDialogue}"</p>
                    </div>
                  ) : null}
                  
                  {/* Player HP and SP Bars */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-green-400 font-bold">{hero.name}</span>
                      <span className="text-green-400">HP: {hp}/{getMaxHp()} | SP: {stamina}/{getMaxStamina()}</span>
                    </div>
                    <div className="bg-gray-800 rounded-full h-6 overflow-hidden mb-2">
                      <div className={`bg-green-600 h-6 rounded-full transition-all duration-300 ${playerFlash ? 'hp-pulse' : ''}`} style={{width: `${(hp / getMaxHp()) * 100}%`}}></div>
                    </div>
                    <div className="bg-gray-800 rounded-full h-4 overflow-hidden">
                      <div className="bg-cyan-500 h-4 rounded-full transition-all duration-300" style={{width: `${(stamina / getMaxStamina()) * 100}%`}}></div>
                    </div>
                  </div>
                  
                  {/* Player Dialogue Box - Positioned below player HP/SP */}
                  {showTauntBoxes && (
                    <div className="bg-black bg-opacity-80 rounded-lg p-3 border-2 border-blue-600 min-h-[60px] flex items-center">
                      <p className="text-white text-sm leading-relaxed">"{playerTaunt}"</p>
                    </div>
                  )}
                  
                  {/* Battle Actions */}
                  {battling && bossHp > 0 && hp > 0 && (<><div className="flex gap-4"><button onClick={attack} className="flex-1 px-6 py-4 rounded-lg font-bold text-xl transition-all shadow-lg hover:scale-105 active:scale-95 border-2" style={{backgroundColor: '#8B0000', borderColor: '#D4AF37', color: '#F5F5DC'}} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#A52A2A'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#8B0000'}>ATTACK</button>{isTauntAvailable && (<button onClick={taunt} className="flex-1 px-6 py-4 rounded-lg font-bold text-xl transition-all shadow-lg hover:scale-105 active:scale-95 animate-pulse border-2" style={{backgroundColor: '#CC5500', borderColor: '#DAA520', color: '#F5F5DC'}} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E66D00'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#CC5500'}><div>TAUNT</div><div className="text-sm">(Enrage Enemy)</div></button>)}{hero && hero.class && GAME_CONSTANTS.SPECIAL_ATTACKS[hero.class.name] && (<button onClick={specialAttack} disabled={stamina < GAME_CONSTANTS.SPECIAL_ATTACKS[hero.class.name].cost || (GAME_CONSTANTS.SPECIAL_ATTACKS[hero.class.name].hpCost && hp <= GAME_CONSTANTS.SPECIAL_ATTACKS[hero.class.name].hpCost) || (hero.class.name === 'Ranger' && bossDebuffs.marked)} className="flex-1 px-6 py-4 rounded-lg font-bold text-xl transition-all shadow-lg hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:scale-100 border-2" style={{backgroundColor: stamina < GAME_CONSTANTS.SPECIAL_ATTACKS[hero.class.name].cost ? '#2C3E50' : '#6B2C91', borderColor: stamina < GAME_CONSTANTS.SPECIAL_ATTACKS[hero.class.name].cost ? '#95A5A6' : '#C0C0C0', color: '#F5F5DC', opacity: stamina < GAME_CONSTANTS.SPECIAL_ATTACKS[hero.class.name].cost ? 0.6 : 1}} onMouseEnter={(e) => {if (stamina >= GAME_CONSTANTS.SPECIAL_ATTACKS[hero.class.name].cost) e.currentTarget.style.backgroundColor = '#8A3BB5'}} onMouseLeave={(e) => {if (stamina >= GAME_CONSTANTS.SPECIAL_ATTACKS[hero.class.name].cost) e.currentTarget.style.backgroundColor = '#6B2C91'}}><div>{GAME_CONSTANTS.SPECIAL_ATTACKS[hero.class.name].name.toUpperCase()}</div><div className="text-sm">({GAME_CONSTANTS.SPECIAL_ATTACKS[hero.class.name].cost} SP{GAME_CONSTANTS.SPECIAL_ATTACKS[hero.class.name].hpCost && ` • ${GAME_CONSTANTS.SPECIAL_ATTACKS[hero.class.name].hpCost + (recklessStacks * 10)} HP`})</div></button>)}{healthPots > 0 && (<button onClick={useHealth} className="px-6 py-4 rounded-lg font-bold transition-all hover:scale-105 active:scale-95 border-2" style={{backgroundColor: '#2F5233', borderColor: '#C0C0C0', color: '#F5F5DC'}} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3D6B45'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2F5233'}>HEAL</button>)}{canFlee && (<button onClick={flee} disabled={stamina < 25} className="px-6 py-4 rounded-lg font-bold transition-all hover:scale-105 active:scale-95 border-2" style={{backgroundColor: stamina < 25 ? '#2C3E50' : '#B8860B', borderColor: stamina < 25 ? '#95A5A6' : '#CD7F32', color: '#F5F5DC', opacity: stamina < 25 ? 0.5 : 1, cursor: stamina < 25 ? 'not-allowed' : 'pointer'}} onMouseEnter={(e) => {if (stamina >= 25) e.currentTarget.style.backgroundColor = '#DAA520'}} onMouseLeave={(e) => {if (stamina >= 25) e.currentTarget.style.backgroundColor = '#B8860B'}} title="Lose 25 Stamina to escape">FLEE</button>)}{showDodgeButton && (<button onClick={dodge} className="flex-1 px-6 py-4 rounded-lg font-bold text-xl transition-all shadow-lg hover:scale-105 active:scale-95 animate-pulse border-4" style={{backgroundColor: '#1E3A5F', borderColor: '#C0C0C0', color: '#F5F5DC'}} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2B5082'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1E3A5F'}><div>🛡️ DODGE</div><div className="text-sm">(Avoid AOE)</div></button>)}</div>{showDodgeButton && (<p className="text-xs text-center italic mt-2" style={{color: '#87CEEB'}}>🛡️ Dodge the AOE or attack for +50% damage (risky!)</p>)}{canFlee && (<p className="text-xs text-gray-400 text-center italic">💨 Fleeing costs 25 Stamina but lets you escape</p>)}{showDebug && (<><button onClick={() => { setBossHp(0); }} className="w-full px-4 py-2 rounded-lg text-sm transition-all mt-2 border-2" style={{backgroundColor: '#6B2C91', borderColor: '#C0C0C0', color: '#F5F5DC'}}>🛠️ DEBUG: Kill Boss Instantly</button><button onClick={() => { setIsTauntAvailable(true); }} className="w-full px-4 py-2 rounded-lg text-sm transition-all mt-2 border-2" style={{backgroundColor: '#CC5500', borderColor: '#DAA520', color: '#F5F5DC'}}>💬 DEBUG: Force Taunt Available</button></>)}</>)}
                  {bossHp <= 0 && (
                    <div className="text-center">
                      {hasFled ? (
                        <>
                          <p className="text-4xl font-bold text-yellow-400 mb-4 animate-pulse drop-shadow-[0_0_15px_rgba(250,204,21,0.6)]">FLED</p>
                          <p className="text-gray-300 text-lg mb-6 italic">"Cowardice is also a strategy..."</p>
                        </>
                      ) : (
                        <>
                          <p className="text-3xl font-bold text-green-400 mb-2">{isFinalBoss ? 'CURSE BROKEN!' : 'VICTORY'}</p>
                          <p className="text-gray-400 text-sm mb-4 italic">{isFinalBoss ? '"You are finally free..."' : '"The beast falls. You are healed and rewarded."'}</p>
                        </>
                      )}
                      
                      {!hasFled && victoryLoot.length > 0 && (
                        <div className="bg-black bg-opacity-60 rounded-lg p-4 mb-4 border-2 border-yellow-500">
                          <p className="text-yellow-400 font-bold mb-2 text-lg">⚔️ SPOILS OF BATTLE ⚔️</p>
                          <div className="space-y-1">
                            {victoryLoot.map((loot, idx) => (
                              <p key={idx} className="text-white text-sm animate-pulse">{loot}</p>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {(battleType === 'elite' || isFinalBoss) && (
                        <button onClick={advance} className="px-8 py-3 rounded-lg font-bold text-xl transition-all shadow-lg border-2" style={{backgroundColor: '#D4AF37', borderColor: '#1C1C1C', color: '#1C1C1C'}} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FFD700'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#D4AF37'}>{isFinalBoss ? 'CLAIM FREEDOM' : 'CONTINUE'}</button>
                      )}
                      {(battleType === 'regular' || battleType === 'wave') && (
                        <button onClick={() => { setShowBoss(false); setHasFled(false); addLog('⚔️ Ready for your next trial...'); }} className="px-8 py-3 rounded-lg font-bold text-xl transition-all shadow-lg border-2" style={{backgroundColor: '#2F5233', borderColor: '#C0C0C0', color: '#F5F5DC'}} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3D6B45'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2F5233'}>CONTINUE</button>
                      )}
                    </div>
                  )}
                  {hp <= 0 && (<div className="text-center"><p className="text-3xl font-bold mb-2" style={{color: '#9B1B30'}}>DEFEATED</p><p className="text-gray-400 text-sm mb-4 italic">"The curse claims another victim..."</p><button onClick={() => { setShowBoss(false); die(); }} className="px-8 py-3 rounded-lg font-bold text-xl transition-all shadow-lg border-2" style={{backgroundColor: '#6B0F1A', borderColor: '#CD853F', color: '#F5F5DC'}} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#8B1A28'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#6B0F1A'}>CONTINUE</button></div>)}
                </div>
              </div>
            </div>
          )}
          {showPomodoro && pomodoroTask && (
  <div className="fixed inset-0 bg-black bg-opacity-95 flex items-start justify-center p-4 z-50">
    <div className="bg-gradient-to-b from-purple-900 to-black rounded-xl p-12 max-w-2xl w-full border-4 border-purple-600 shadow-2xl">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-purple-400 mb-2">
          {isBreak ? 'BREAK TIME' : 'FOCUS SESSION'}
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
            className="px-8 py-3 rounded-lg font-bold text-xl transition-all border-2" style={{backgroundColor: '#1E3A5F', borderColor: '#C0C0C0', color: '#F5F5DC'}} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2B5082'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1E3A5F'}
          >
            {pomodoroRunning ? 'Pause' : 'Resume'}
          </button>
          
          {isBreak && (
            <button 
              onClick={() => {
                setIsBreak(false);
                setPomodoroTimer(25 * 60);
                setPomodoroRunning(true);
                addLog('Skipped break - back to work!');
              }}
              className="px-8 py-3 rounded-lg font-bold text-xl transition-all border-2" style={{backgroundColor: '#B8860B', borderColor: '#CD7F32', color: '#F5F5DC'}} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#DAA520'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#B8860B'}
            >
              Skip Break
            </button>
          )}
        </div>
        
        <button 
          onClick={() => {
            setShowPomodoro(false);
            setPomodoroTask(null);
            setPomodoroRunning(false);
            addLog(`Focus session ended. Completed ${pomodorosCompleted} pomodoro${pomodorosCompleted !== 1 ? 's' : ''}.`);
          }}
          className="px-8 py-3 rounded-lg font-bold transition-all border-2" style={{backgroundColor: '#2C3E50', borderColor: '#95A5A6', color: '#F5F5DC'}} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#34495E'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2C3E50'}
        >
          Finish Task & Return
        </button>
      </div>
    </div>
  </div>
)}
        </div>
        
        <div className="flex justify-center mt-8 pb-6">
          <button onClick={() => setShowDebug(!showDebug)} className="text-xs px-4 py-2 bg-gray-800 text-gray-400 rounded hover:bg-gray-700 transition-all border border-gray-700">{showDebug ? '▲ Hide' : '▼ Show'} Debug Panel</button>
        </div>
        
        <div className="text-center pb-4">
          <p className="text-xs text-gray-600">v3.8.0 - Fourth-Wall Taunt System</p>
        </div>
      </div>
      )}
    </div>
  );
};

export default FantasyStudyQuest;
