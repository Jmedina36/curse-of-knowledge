// Refined Medieval Color Scheme - Reduced Visual Noise
export const COLORS = {
  // Primary Actions (Attack, Combat) - Brighter, more readable
  crimson: { base: '#B91C1C', hover: '#DC2626', border: '#EF4444' },
  ruby: { base: '#B91C1C', hover: '#DC2626', border: '#EF4444' },
  
  // Secondary Actions (Heal, Support)
  emerald: { base: '#2F5233', hover: '#3D6B45', border: '#9B8B7E' },
  sapphire: { base: '#1E3A5F', hover: '#2B5082', border: '#9B8B7E' },
  amber: { base: '#8B6914', hover: '#B8860B', border: '#9B8B7E' },
  
  // Special/Elite Actions
  amethyst: { base: '#5A2472', hover: '#6B2C91', border: '#9B8B7E' },
  teal: { base: '#004D4D', hover: '#006666', border: '#9B8B7E' },
  obsidian: { base: '#1C1C1C', hover: '#2D2D2D', border: '#9B8B7E' },
  
  // Danger/Warning - Brighter, more readable
  burgundy: { base: '#991B1B', hover: '#B91C1C', border: '#DC2626' },
  darkOrange: { base: '#C2410C', hover: '#EA580C', border: '#F97316' },
  
  // Utility - Neutral palette
  slate: { base: '#2C3E50', hover: '#34495E', border: '#9B8B7E' },
  cream: '#F5F5DC',
  gold: '#C9A961',        // Less saturated gold
  silver: '#9B8B7E',      // Warmer silver
  bronze: '#8B7355',      // Muted bronze
  
  // Background tones
  bg: {
    primary: '#0A0A0A',     // Deep black
    secondary: '#1A1612',   // Warm dark brown
    tertiary: '#252118',    // Lighter warm brown
    paper: '#2A241C'        // Parchment-like
  }
};

// Refined Visual Styles - Reduced Noise
export const VISUAL_STYLES = {
  // Subtle shadows instead of heavy glows
  shadow: {
    subtle: '0 2px 8px rgba(0, 0, 0, 0.3)',
    medium: '0 4px 12px rgba(0, 0, 0, 0.4)',
    elevated: '0 8px 24px rgba(0, 0, 0, 0.5)',
    // Only use glow for truly special items
    glow: (color, intensity = 0.15) => `0 0 12px ${color}${Math.floor(intensity * 255).toString(16).padStart(2, '0')}`
  },
  
  // Modal backgrounds - warm, neutral
  modal: {
    default: 'linear-gradient(to bottom, rgba(42, 36, 28, 0.97), rgba(26, 22, 18, 0.97))',
    dark: 'linear-gradient(to bottom, rgba(26, 22, 18, 0.97), rgba(15, 13, 10, 0.97))',
    paper: 'linear-gradient(to bottom, rgba(50, 44, 36, 0.95), rgba(42, 36, 28, 0.95))'
  },
  
  // Card/container backgrounds
  card: {
    default: 'rgba(37, 33, 24, 0.6)',
    elevated: 'rgba(42, 36, 28, 0.8)',
    subtle: 'rgba(26, 22, 18, 0.4)'
  },
  
  // Decorative dividers - more subtle
  divider: {
    gold: (width = '80px') => ({
      left: { width, height: '1px', background: `linear-gradient(to right, transparent, rgba(201, 169, 97, 0.3))` },
      right: { width, height: '1px', background: `linear-gradient(to left, transparent, rgba(201, 169, 97, 0.3))` },
      diamond: { color: 'rgba(201, 169, 97, 0.4)', fontSize: '8px' }
    })
  }
};

export const GAME_CONSTANTS = {
  MAX_HP: 100,
  MAX_STAMINA: 100,
  BASE_ATTACK: 25,
  BASE_DEFENSE: 5,
  PLAYER_HP_PER_DAY: 8,
  PLAYER_SP_PER_DAY: 8,
  PLAYER_ATK_PER_DAY: 2,
  HEALTH_POTION_HEAL_PERCENT: 30, // 30% of max HP
  HEALTH_POTION_MIN: 30, // Minimum heal amount
  STAMINA_POTION_RESTORE_PERCENT: 50, // 50% of max stamina
  STAMINA_POTION_MIN: 50, // Minimum restore amount
  STAMINA_PER_TASK: 20,
  LOOT_RATES: {
    HEALTH_POTION: 0.25,
    STAMINA_POTION: 0.50,
    WEAPON: 0.65,
    ARMOR: 0.80
  },
  MINI_BOSS_LOOT_RATES: {
    HEALTH_POTION: 0.15,
    STAMINA_POTION: 0.30,
    WEAPON: 0.50,
    ARMOR: 0.70,
    PENDANT: 0.85,
    RING: 1.00
  },
  XP_REWARDS: {
    easy: 5,           // Regular combat (was 10)
    medium: 12,        // Medium combat (was 25)
    hard: 25,          // Hard combat (was 50)
    miniBoss: 30,      // Elite boss (was 50)
    finalBoss: 60      // Gauntlet (was 100)
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
  MINI_BOSS_BASE: 140,
  MINI_BOSS_DAY_SCALING: 12,
  MINI_BOSS_ATK_BASE: 16,
  MINI_BOSS_ATK_SCALING: 2.5,
  FINAL_BOSS_BASE: 200,
  FINAL_BOSS_DAY_SCALING: 16,
  BOSS_ATTACK_BASE: 20,
  BOSS_ATTACK_DAY_SCALING: 3,
  ENEMY_DEFENSE: {
    regular: 3,
    elite: 6,
    gauntlet: 8
  },
  
  // NEW COMBAT SYSTEMS - Engineered Balance
  ARMOR_K_CONSTANT: 60, // Diminishing returns formula constant
  
  SCALING_CONFIG: {
    normal: {
      hpBase: 60,
      hpGrowth: 1.25,        // 25% per day exponential
      damageBase: 16,
      damageGrowth: 1.20,
      defenseBase: 3,
      defenseGrowth: 1.15,
      attackSpeed: 1.0
    },
    elite: {
      hpBase: 140,
      hpGrowth: 1.18,
      damageBase: 16,
      damageGrowth: 1.18,
      defenseBase: 6,
      defenseGrowth: 1.12,
      attackSpeed: 1.0
    },
    boss: {
      hpBase: 200,
      hpGrowth: 1.12,
      damageBase: 20,
      damageGrowth: 1.15,
      defenseBase: 8,
      defenseGrowth: 1.10,
      attackSpeed: 1.0
    }
  },
  
  CRIT_SYSTEM: {
    baseCritChance: 10,      // 10% base crit chance
    baseCritMultiplier: 2.0   // 2x damage on crit
  },
  
  RARITY_TIERS: {
    common: { color: '#9E9E9E', dropRate: 50, name: 'Common' },
    uncommon: { color: '#4CAF50', dropRate: 30, name: 'Uncommon' },
    rare: { color: '#2196F3', dropRate: 15, name: 'Rare' },
    epic: { color: '#9C27B0', dropRate: 4, name: 'Epic' },
    legendary: { color: '#FF9800', dropRate: 1, name: 'Legendary' }
  },
  
  GEAR_BUDGET: {
    common: { totalBudget: 10, affixCount: 1, affixPowerRange: [8, 12] },
    uncommon: { totalBudget: 18, affixCount: 2, affixPowerRange: [7, 11] },
    rare: { totalBudget: 28, affixCount: 3, affixPowerRange: [7, 12] },
    epic: { totalBudget: 40, affixCount: 4, affixPowerRange: [8, 12] },
    legendary: { totalBudget: 55, affixCount: 5, affixPowerRange: [9, 13] }
  },
  
  AFFIX_COSTS: {
    weapon: {
      flatDamage: 1,           // 1 budget = +1 damage
      percentDamage: 3,        // 1 budget = +0.33% damage
      critChance: 5,           // 1 budget = +0.2% crit
      critMultiplier: 10,      // 1 budget = +0.1x crit damage
      poisonChance: 2,         // 1 budget = +0.5% poison chance
      poisonDamage: 1.5        // 1 budget = +0.66 poison damage/turn
    },
    armor: {
      flatArmor: 1,            // 1 budget = +1 armor
      percentDR: 8,            // 1 budget = +0.125% DR
      flatHP: 2                // 1 budget = +0.5 HP
    }
  },
  
  ECONOMY_CONFIG: {
    // Combat gold scaling: base + (day * dayScale)
    combatGoldBase: 4,
    combatGoldDayScale: 2,
    eliteMultiplier: 1.5,
    bossMultiplier: 3.0,
    
    // Daily quest completion reward: 20 + (day * 8)
    dailyBaseGold: 20,
    dailyDayScale: 8,
    dailyStreakBonus: 5, // per consecutive day, max 7
    
    // Sell value percentages (of base shop price, before market modifiers)
    sellValuePercent: {
      common: 0.25,
      uncommon: 0.30,
      rare: 0.35,
      epic: 0.35,
      legendary: 0.20
    }
  },
  
  // Legacy - kept for compatibility, but not used
  CURRENCY_REWARDS: {
    normal: { min: 20, max: 35 },
    elite: { min: 40, max: 70 },
    boss: { min: 80, max: 120 }
  },
  
  SHOP_CONFIG: {
    refreshInterval: 2,       // Shop opens every 2 days
    itemCount: 6,            // 6 items per shop
    costs: {
      common: 50,
      uncommon: 100,
      rare: 200,
      epic: 400,
      legendary: 800
    }
  },
  
  CRAFTING_COSTS: {
    common: 25,
    uncommon: 50,
    rare: 100,
    epic: 200,
    legendary: 500
  },
  
  PITY_TIMER_THRESHOLD: 10,  // Guaranteed upgrade after 10 fights
  
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
  DEEP_WORK_BONUS: 30,
  PERFECT_DAY_BONUS: 25,
  
  // Charge System - builds with normal attacks
  CHARGE_SYSTEM: {
    maxCharges: 3,
    chargePerAttack: 1,
    chargeBonus: 0.25 // +25% damage at max charges
  },
  
  BASIC_ATTACK_NAMES: {
    Knight: 'Shield Bash',
    Crusader: 'Holy Strike',
    Wizard: 'Arcane Bolt',
    Assassin: 'Quick Slash'
  },
  
  SPECIAL_ATTACKS: {
    Knight: { 
      name: 'Blood Oath', 
      cost: 35, 
      hpCostPercent: 0.10, // 10% of current HP
      hpCostEscalation: 0.05, // +5% per consecutive use
      damageMultiplier: 3.5, 
      effect: 'Sacrifice HP for overwhelming power. 2 turns: +50% damage, -30% defense (take more damage). HP cost escalates.',
      buffTurns: 2,
      buffDamage: 0.50,
      defenseReduction: 0.30
    },
    Wizard: { 
      name: 'Temporal Rift', 
      cost: 35, 
      damageMultiplier: 2.8, 
      effect: 'Boss skips counter-attack. Restore 15 stamina next turn. Next attack deals +25% damage. Reduces AOE damage by 50%.',
      staminaRegen: 15,
      nextAttackBonus: 0.25,
      aoeReduction: 0.50
    },
    Assassin: { 
      name: 'Shadow Venom', 
      cost: 30, 
      damageMultiplier: 1.8, 
      effect: 'Apply poison (5 dmg/turn for 5 turns). Each poison tick restores 5 stamina. Reapplying detonates poison for burst. Max 2 stacks.',
      poisonDamage: 5,
      poisonTurns: 5,
      staminaPerTick: 5,
      maxStacks: 2
    },
    Crusader: { 
      name: 'Judgment of Light', 
      cost: 30, 
      damageMultiplier: 2.6, 
      effect: 'Deal damage and heal 20 HP. Holy Empowerment (3 turns): +25% damage, +15% crit, heal 5 HP per attack.',
      healAmount: 20,
      empowermentTurns: 3,
      empowermentDamage: 0.25,
      empowermentCrit: 15,
      empowermentHeal: 5
    }
  },
  
  TACTICAL_SKILLS: {
    Knight: {
      name: 'Rallying Roar',
      cost: 25,
      duration: 3,
      effect: 'For 3 turns: +40% Defense, immune to crits, -30% stamina costs. Synergy: Reduces Blood Oath HP cost by 5%.',
      defenseBonus: 0.40,
      staminaEfficiency: 0.30,
      critImmunity: true,
      bloodOathReduction: 0.05
    },
    Wizard: {
      name: 'Ethereal Barrier',
      cost: 25,
      duration: 2,
      effect: 'For 2 turns: 30% damage reduction, reflect 10% damage. Synergy: +15% Temporal Rift damage if active.',
      damageReduction: 0.30,
      damageReflect: 0.10,
      riftBonus: 0.15
    },
    Assassin: {
      name: 'Mark for Death',
      cost: 20,
      duration: 2,
      effect: 'For 2 turns: Enemy loses 20% Defense, poison damage +50%, +10% crit. Synergy: Extends active poison by 2 turns.',
      defenseReduction: 0.20,
      poisonBonus: 0.50,
      critBonus: 10,
      poisonExtension: 2
    },
    Crusader: {
      name: 'Bastion of Faith',
      cost: 25,
      duration: 4,
      effect: 'For 4 turns: +15% Damage, +20% Defense. Synergy: Doubles Holy Empowerment heal-on-hit (10 HP per attack).',
      damageBonus: 0.15,
      defenseBonus: 0.20,
      empowermentHealBonus: 2.0
    }
  },
  
  BASIC_SKILLS: {
    Knight: {
      name: 'Crushing Blow',
      cost: 17,
      damageMultiplier: 1.8,
      effect: 'A powerful strike that cannot be used twice in a row.',
      cooldown: true,
      unlockLevel: 3
    },
    Crusader: {
      name: 'Smite',
      cost: 15,
      damageMultiplier: 1.7,
      healAmount: 10,
      effect: 'Holy strike that heals. Cannot be used twice in a row.',
      cooldown: true,
      unlockLevel: 3
    }
  },
  
  SKILL_UNLOCK_LEVELS: {
    basicSkill: 3,    // Crushing Blow / Smite
    special: 5,       // Blood Oath / Temporal Rift / Shadow Venom / Judgment
    tactical: 7       // Rallying Roar / Ethereal Barrier / Mark for Death / Bastion
  },
  
  ARMOR_STAT_RANGES: {
    helmet: { min: 1, max: 5 },
    chest: { min: 2, max: 8 },
    gloves: { min: 1, max: 5 },
    boots: { min: 1, max: 5 }
  },
  
  ARMOR_NAMES: {
    helmet: {
      common: ['Worn Cap', 'Leather Hood', 'Simple Helm', 'Patched Coif', 'Tattered Cowl', 'Cloth Hat', 'Iron Helmet'],
      uncommon: ['Quality Helm', 'Sturdy Cap', 'Reinforced Hood', 'Well-Made Coif', 'Balanced Visor', 'Strong Helmet', 'Padded Helm'],
      rare: ['Battle Helm', 'Guardian\'s Crown', 'Steel Visage', 'Warden\'s Headguard', 'Reinforced Coif', 'Knight\'s Helm', 'Sentinel\'s Visor'],
      epic: ['Dragonhelm', 'Titanforged Crown', 'Demonward Visor', 'Wyrm\'s Crest', 'Stormcrown', 'Voidgazer', 'Soulkeeper\'s Helm'],
      legendary: ['Crown of Infinity', 'Eternity\'s Watch', 'The Omniscient', 'Worldkeeper\'s Gaze', 'Heaven\'s Authority', 'Judgment\'s Visage', 'Apex Sovereign']
    },
    chest: {
      common: ['Torn Tunic', 'Worn Vest', 'Patched Mail', 'Simple Breastplate', 'Tattered Robes', 'Frayed Armor', 'Crude Cuirass'],
      uncommon: ['Quality Vest', 'Sturdy Mail', 'Reinforced Tunic', 'Well-Made Breastplate', 'Balanced Armor', 'Strong Cuirass', 'Padded Plate'],
      rare: ['Forged Plate', 'Battle Harness', 'Guardian\'s Mail', 'Reinforced Cuirass', 'Steel Aegis', 'Knight\'s Plate', 'Warden\'s Vestments'],
      epic: ['Dragonscale Hauberk', 'Titanplate', 'Demonhide Vest', 'Soulforged Armor', 'Voidplate', 'Stormbreaker Mail', 'Wyrm\'s Protection'],
      legendary: ['Eternity\'s Embrace', 'The Unyielding', 'World\'s Bulwark', 'Heaven\'s Aegis', 'Immortal Vestment', 'Cosmos Shell', 'Invincible Plate']
    },
    gloves: {
      common: ['Torn Gloves', 'Worn Gauntlets', 'Patched Mitts', 'Simple Handguards', 'Frayed Wraps', 'Crude Grips', 'Cloth Gloves'],
      uncommon: ['Quality Gauntlets', 'Sturdy Gloves', 'Reinforced Mitts', 'Well-Made Handguards', 'Balanced Grips', 'Strong Gauntlets', 'Padded Wraps'],
      rare: ['Steel Gauntlets', 'Battle Grips', 'Forged Fists', 'Guardian\'s Handguards', 'Reinforced Gloves', 'Knight\'s Gauntlets', 'Duelist\'s Wraps'],
      epic: ['Titan\'s Grasp', 'Dragongrip Gauntlets', 'Soulbound Fists', 'Voidgrasp', 'Stormhands', 'Demonward Grips', 'Wyrmclaw Gloves'],
      legendary: ['Heaven\'s Hands', 'Worldshaper\'s Touch', 'Eternity\'s Grasp', 'Infinity\'s Reach', 'The Unbreakable', 'Fate\'s Grip', 'Omnipotent Fists']
    },
    boots: {
      common: ['Worn Boots', 'Tattered Shoes', 'Simple Greaves', 'Patched Footwraps', 'Frayed Sabatons', 'Crude Sandals', 'Cloth Boots'],
      uncommon: ['Quality Boots', 'Sturdy Greaves', 'Reinforced Shoes', 'Well-Made Sabatons', 'Balanced Footwear', 'Strong Boots', 'Padded Greaves'],
      rare: ['Steel Greaves', 'Battle Boots', 'Forged Sabatons', 'Guardian\'s Treads', 'Reinforced Footguards', 'Knight\'s Boots', 'Swift Treads'],
      epic: ['Titan\'s Stride', 'Dragonscale Boots', 'Soulwalker Greaves', 'Voidstep Sabatons', 'Stormstriders', 'Demonward Treads', 'Wyrmfoot Boots'],
      legendary: ['Heaven\'s Path', 'Worldwalker\'s Stride', 'Eternity\'s Journey', 'Infinity\'s Steps', 'The Unshakable', 'Fate\'s March', 'Omnipresent Treads']
    }
  },
  
  ACCESSORY_STAT_RANGES: {
    pendant: { min: 5, max: 25 },
    ring: { min: 5, max: 25 }
  },
  
  ACCESSORY_NAMES: {
    pendant: {
      common: ['Cracked Pendant', 'Worn Charm', 'Simple Talisman', 'Tarnished Medallion', 'Crude Necklace', 'Faded Amulet', 'Plain Pendant'],
      uncommon: ['Quality Pendant', 'Sturdy Charm', 'Well-Made Talisman', 'Polished Medallion', 'Balanced Necklace', 'Clear Amulet', 'Solid Pendant'],
      rare: ['Enchanted Medallion', 'Battle Charm', 'Mystic Pendant', 'Guardian\'s Talisman', 'Forged Amulet', 'Knight\'s Sigil', 'Warden\'s Necklace'],
      epic: ['Dragonheart Pendant', 'Soulstone Amulet', 'Voidkeeper Charm', 'Titan\'s Medallion', 'Stormshard Talisman', 'Demonward Sigil', 'Wyrmheart Necklace'],
      legendary: ['Eternity\'s Heart', 'The Infinite Soul', 'Heaven\'s Tear', 'World\'s Core', 'Fate\'s Promise', 'Cosmos Shard', 'The Primordial']
    },
    ring: {
      common: ['Bent Ring', 'Tarnished Band', 'Simple Loop', 'Worn Circle', 'Crude Band', 'Rusty Ring', 'Plain Loop'],
      uncommon: ['Quality Ring', 'Sturdy Band', 'Well-Made Loop', 'Polished Circle', 'Balanced Band', 'Strong Ring', 'Solid Loop'],
      rare: ['Engraved Band', 'Battle Ring', 'Enchanted Loop', 'Warden\'s Signet', 'Forged Circle', 'Knight\'s Ring', 'Mystic Band'],
      epic: ['Dragonbone Ring', 'Soulbound Band', 'Voidcircle', 'Titan\'s Loop', 'Stormband', 'Demonward Ring', 'Wyrmscale Signet'],
      legendary: ['Eternity Band', 'The Infinite Loop', 'Heaven\'s Circle', 'Worldbinder\'s Ring', 'Fate\'s Signet', 'Cosmos Ring', 'The Eternal']
    }
  },
  
  STARTING_EQUIPMENT: {
    Knight: {
      helmet: { name: 'Iron Cap', defense: 1 },
      chest: { name: 'Chainmail Vest', defense: 2 },
      gloves: { name: 'Leather Grips', defense: 1 },
      boots: { name: 'Steel-toed Boots', defense: 1 },
      pendant: null,
      ring: null
    },
    Crusader: {
      helmet: { name: 'Holy Circlet', defense: 1 },
      chest: { name: 'Blessed Tunic', defense: 2 },
      gloves: { name: 'Prayer Wraps', defense: 1 },
      boots: { name: 'Temple Sandals', defense: 1 },
      pendant: null,
      ring: null
    },
    Assassin: {
      helmet: { name: 'Shadow Cowl', defense: 1 },
      chest: { name: 'Dark Leather', defense: 2 },
      gloves: { name: 'Fingerless Gloves', defense: 1 },
      boots: { name: 'Soft Boots', defense: 1 },
      pendant: { name: 'Lucky Charm', hp: 10 },
      ring: null
    },
    Wizard: {
      helmet: { name: 'Apprentice Hat', defense: 1 },
      chest: { name: "Scholar's Robe", defense: 2 },
      gloves: { name: 'Silk Wraps', defense: 1 },
      boots: { name: 'Cloth Slippers', defense: 1 },
      pendant: null,
      ring: { name: 'Focusing Band', stamina: 10 }
    }
  },
  
  BASE_DEFENSE_BY_CLASS: {
    Knight: 5,
    Crusader: 4,
    Assassin: 3,
    Wizard: 2
  },
  
  WEAPON_STAT_RANGES: {
    min: 4,
    max: 12
  },
  
  WEAPON_NAMES: {
    common: [
      'Iron Sword', 'Steel Blade', 'Simple Longsword', 'Worn Saber', 'Rusty Greatsword',
      'Iron Axe', 'Crude Hatchet', 'Worn Cleaver', 'Simple Battleaxe', 'Chipped Waraxe',
      'Iron Dagger', 'Worn Knife', 'Simple Stiletto', 'Rusty Dirk', 'Crude Shiv',
      'Simple Bow', 'Worn Longbow', 'Crude Shortbow', 'Hunter\'s Bow', 'Bent Recurve',
      'Wooden Staff', 'Worn Rod', 'Simple Cane', 'Crude Scepter', 'Old Walking Stick'
    ],
    uncommon: [
      'Quality Sword', 'Balanced Blade', 'Well-Made Longsword', 'Sharp Saber', 'Sturdy Greatsword',
      'Quality Axe', 'Sharp Hatchet', 'Balanced Cleaver', 'Heavy Battleaxe', 'Keen Waraxe',
      'Sharp Dagger', 'Quality Knife', 'Balanced Stiletto', 'Keen Dirk', 'Well-Made Shiv',
      'Quality Bow', 'Balanced Longbow', 'Accurate Shortbow', 'Tracker\'s Bow', 'Sturdy Recurve',
      'Quality Staff', 'Balanced Rod', 'Well-Made Cane', 'Sturdy Scepter', 'Traveler\'s Staff'
    ],
    rare: [
      'Forged Edge', 'Battle Brand', 'Tempered Longsword', 'Honed Saber', 'Masterwork Blade',
      'Forged Cleaver', 'Brutal Edge', 'Executioner\'s Axe', 'Warden\'s Hatchet', 'Masterwork Waraxe',
      'Shadow Fang', 'Silent Edge', 'Assassin\'s Kiss', 'Viper\'s Tooth', 'Masterwork Stiletto',
      'Masterwork Longbow', 'Sniper\'s Edge', 'Ranger\'s Pride', 'Keen Shooter', 'Precision Bow',
      'Arcane Focus', 'Enchanted Staff', 'Mage\'s Companion', 'Crystal Rod', 'Sorcerer\'s Reach'
    ],
    epic: [
      'Dragonbane', 'Wyrmfang', 'Soulcleaver', 'Demonrender', 'Titanbreaker',
      'Bonecrusher', 'Skullsplitter', 'Gorehowl', 'Frostbite', 'Stormbreaker',
      'Heartpiercer', 'Soulstealer', 'Widow\'s Embrace', 'Deathwhisper', 'Venomfang',
      'Windseeker', 'Eagleye', 'Stormcaller', 'Dragonpiercer', 'Starshot',
      'Stormcaller', 'Frostweaver', 'Flameheart', 'Voidtouch', 'Mindbender'
    ],
    legendary: [
      'Worldbreaker', 'Starfall', 'Oblivion\'s Edge', 'Eternity Blade', 'Cataclysm',
      'Ragnarok', 'The Decimator', 'Apocalypse', 'Thunderfall', 'Worldsplitter',
      'The Betrayer', 'Eternal Night', 'Last Breath', 'Fate\'s End', 'Oblivion Shard',
      'Heaven\'s Fury', 'The Sunbreaker', 'Horizon\'s End', 'Infinity\'s Reach', 'Fate\'s Arrow',
      'The Universe', 'Cosmos Eternal', 'Reality Bender', 'Infinity\'s Grasp', 'The Beginning'
    ]
  },

  
  STARTING_WEAPONS: {
    Knight: { name: 'Iron Longsword', attack: 4 },
    Crusader: { name: 'Blessed Mace', attack: 3 },
    Assassin: { name: 'Sharp Dagger', attack: 3 },
    Wizard: { name: 'Wooden Staff', attack: 3 }
  },
  
  BASE_ATTACK_BY_CLASS: {
    Knight: 12,
    Crusader: 10,
    Assassin: 11,
    Wizard: 9
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
  
  // ACHIEVEMENTS SYSTEM
  ACHIEVEMENTS: [
    // STUDY
    { id: 'first_card', name: 'First Steps', desc: 'Create your first flashcard', category: 'STUDY', rarity: 'COMMON', req: { type: 'cards_created', count: 1 }, reward: { xp: 10 } },
    { id: 'deck_master', name: 'Deck Master', desc: 'Create 5 flashcard decks', category: 'STUDY', rarity: 'RARE', req: { type: 'decks_created', count: 5 }, reward: { xp: 50, maxSP: 5 } },
    { id: 'perfect_recall', name: 'Perfect Recall', desc: 'Master 50 flashcards', category: 'STUDY', rarity: 'EPIC', req: { type: 'cards_mastered', count: 50 }, reward: { xp: 100, maxHP: 10 } },
    // COMBAT
    { id: 'first_blood', name: 'First Blood', desc: 'Win your first battle', category: 'COMBAT', rarity: 'COMMON', req: { type: 'battles_won', count: 1 }, reward: { xp: 10, weapon: 2 } },
    { id: 'boss_slayer', name: 'Elite Slayer', desc: 'Defeat an elite boss', category: 'COMBAT', rarity: 'RARE', req: { type: 'elite_bosses_defeated', count: 1 }, reward: { xp: 50, armor: 5 } },
    { id: 'gauntlet_champion', name: 'Gauntlet Champion', desc: 'Complete the Gauntlet trial', category: 'COMBAT', rarity: 'EPIC', req: { type: 'gauntlet_completed', count: 1 }, reward: { xp: 100, weapon: 5, armor: 5 } },
    // PERSISTENCE
    { id: 'committed', name: 'Committed', desc: 'Complete 3 days without skipping', category: 'PERSISTENCE', rarity: 'COMMON', req: { type: 'streak_days', count: 3 }, reward: { xp: 25 }, progress: true },
    { id: 'unbroken_spirit', name: 'Unbroken Spirit', desc: '7-day streak without skipping', category: 'PERSISTENCE', rarity: 'RARE', req: { type: 'streak_days', count: 7 }, reward: { xp: 75, maxHP: 10, maxSP: 10 }, progress: true },
    { id: 'iron_will', name: 'Iron Will', desc: '14-day streak without skipping', category: 'PERSISTENCE', rarity: 'EPIC', req: { type: 'streak_days', count: 14 }, reward: { xp: 150, weapon: 10, armor: 10 }, progress: true },
    { id: 'curse_breaker', name: 'Curse Breaker', desc: 'Complete a full 7-day cycle', category: 'PERSISTENCE', rarity: 'RARE', req: { type: 'cycles_completed', count: 1 }, reward: { xp: 100 }, progress: true },
    // MASTERY
    { id: 'rising_hero', name: 'Rising Hero', desc: 'Reach level 5', category: 'MASTERY', rarity: 'COMMON', req: { type: 'level_reached', count: 5 }, reward: { xp: 50 } },
    { id: 'veteran_warrior', name: 'Veteran Warrior', desc: 'Reach level 10', category: 'MASTERY', rarity: 'EPIC', req: { type: 'level_reached', count: 10 }, reward: { xp: 200, maxHP: 20, maxSP: 20 } },
    { id: 'perfect_day', name: 'Perfect Day', desc: 'Complete every task in a single day', category: 'MASTERY', rarity: 'RARE', req: { type: 'perfect_days', count: 1 }, reward: { xp: 75 }, progress: true },
    { id: 'perfectionist', name: 'Perfectionist', desc: 'Achieve 5 perfect days', category: 'MASTERY', rarity: 'LEGENDARY', req: { type: 'perfect_days', count: 5 }, reward: { xp: 300, weapon: 15, armor: 15 }, progress: true }
  ],
  
  ACHIEVEMENT_CATEGORIES: {
    ALL: { name: 'All Trials' },
    STUDY: { name: 'Study' },
    COMBAT: { name: 'Combat' },
    PERSISTENCE: { name: 'Persistence' },
    MASTERY: { name: 'Mastery' }
  },
  
  RARITY_COLORS: {
    COMMON: '#9CA3AF',
    RARE: '#60A5FA',
    EPIC: '#A78BFA',
    LEGENDARY: '#FBBF24'
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

export const HERO_TITLES = ['Novice', 'Seeker', 'Wanderer', 'Survivor', 'Warrior', 'Champion', 'Legend'];

// Global CSS to hide scrollbars
export const globalStyles = `
  ::-webkit-scrollbar {
    display: none;
  }
  * {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`;

export const HERO_CLASSES = [
  { name: 'Knight', color: 'red', emblem: '⚔︎', gradient: ['from-red-900', 'from-red-800', 'from-red-700', 'from-red-600'], glow: ['shadow-red-900/50', 'shadow-red-700/60', 'shadow-red-600/70', 'shadow-red-500/80'] },
  { name: 'Wizard', color: 'blue', emblem: '✦', gradient: ['from-blue-700', 'from-blue-600', 'from-blue-500', 'from-blue-400'], glow: ['shadow-blue-700/60', 'shadow-blue-600/70', 'shadow-blue-500/80', 'shadow-blue-400/90'] },
  { name: 'Assassin', color: 'green', emblem: '†', gradient: ['from-green-900', 'from-green-800', 'from-green-700', 'from-green-600'], glow: ['shadow-green-900/50', 'shadow-green-700/60', 'shadow-green-600/70', 'shadow-green-500/80'] },
  { name: 'Crusader', color: 'white', emblem: '✙', gradient: ['from-gray-100', 'from-gray-50', 'from-white', 'from-white'], glow: ['shadow-gray-200/80', 'shadow-gray-100/90', 'shadow-white/95', 'shadow-white/100'] }
];

export const STARTING_ABILITIES = {
  Knight:   { str: 16, dex: 12, con: 14, int: 8,  wis: 10, cha: 10 },
  Wizard:   { str: 8,  dex: 12, con: 10, int: 16, wis: 14, cha: 10 },
  Assassin: { str: 10, dex: 16, con: 10, int: 12, wis: 8,  cha: 14 },
  Crusader: { str: 14, dex: 8,  con: 16, int: 10, wis: 12, cha: 10 },
};

export const PRIMARY_ABILITY = {
  Knight: 'str', Wizard: 'int', Assassin: 'dex', Crusader: 'con',
};

export const SECONDARY_ABILITY = {
  Knight: 'con', Wizard: 'wis', Assassin: 'cha', Crusader: 'str',
};
