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
    default: 'rgba(37, 33, 24, 0.88)',
    elevated: 'rgba(42, 36, 28, 0.95)',
    subtle: 'rgba(26, 22, 18, 0.75)'
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
  HEALTH_POTION_HEAL_PERCENT: 22, // 22% of max HP
  HEALTH_POTION_MIN: 22, // Minimum heal amount
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
    regular: 5,
    elite: 8,
    gauntlet: 10
  },
  ENEMY_DEFENSE_DAY_SCALE: 1.0, // +1 enemy defense per day
  
  // NEW COMBAT SYSTEMS - Engineered Balance
  ARMOR_K_CONSTANT: 75, // Diminishing returns formula constant — higher = less effective armor stacking
  
  SCALING_CONFIG: {
    normal: {
      hpBase: 75,
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
    epic: { totalBudget: 33, affixCount: 4, affixPowerRange: [7, 10] },
    legendary: { totalBudget: 44, affixCount: 5, affixPowerRange: [8, 10] }
  },
  
  AFFIX_COSTS: {
    weapon: {
      flatDamage: 1,           // 1 budget = +1 damage
      percentDamage: 1.5,      // 1 budget = +0.67% damage
      critChance: 5,           // 1 budget = +0.2% crit
      critMultiplier: 10,      // 1 budget = +0.1x crit damage
      poisonChance: 2,         // 1 budget = +0.5% poison chance
      poisonDamage: 1.5        // 1 budget = +0.66 poison damage/turn
    },
    armor: {
      flatArmor: 1,            // 1 budget = +1 armor
      percentDR: 3,            // 1 budget = +0.33% DR (capped at 40% total)
      flatHP: 2                // 1 budget = +0.5 HP
    },
    grimoire: {
      flatHP: 1.5,             // 1 budget = +0.67 max HP
      regenHP: 3,              // 1 budget = +0.33 HP restored after combat
      xpBonus: 6               // 1 budget = +0.17% XP gain
    },
    tome: {
      flatStamina: 1.5,        // 1 budget = +0.67 max stamina
      critChance: 5,           // 1 budget = +0.2% crit chance
      goldBonus: 4             // 1 budget = +0.25% combat gold
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

  CHARGED_ATTACK_NAMES: {
    Knight: 'Shattering Blow',
    Crusader: 'Divine Wrath',
    Wizard: 'Arcane Overload',
    Assassin: 'Lethal Flurry'
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
    grimoire: { min: 5, max: 25 },
    tome: { min: 5, max: 25 }
  },

  ACCESSORY_NAMES: {
    grimoire: {
      common: ['Worn Spellbook', 'Faded Grimoire', 'Tattered Codex', 'Cracked Folio', 'Crude Compendium', 'Dusty Manual', 'Plain Spellbook'],
      uncommon: ['Studied Grimoire', 'Bound Codex', 'Solid Compendium', 'Polished Manual', 'Clear Folio', 'Sturdy Spellbook', 'Well-Read Grimoire'],
      rare: ['Arcane Grimoire', 'Scholar\'s Codex', 'Battle Manual', 'Guardian\'s Tome', 'Forged Compendium', 'Knight\'s Folio', 'Warden\'s Spellbook'],
      epic: ['Dragonblood Grimoire', 'Soulscribed Codex', 'Voidkeeper\'s Manual', 'Titan\'s Tome', 'Stormshard Compendium', 'Demonward Folio', 'Wyrmheart Spellbook'],
      legendary: ['Eternity\'s Script', 'The Infinite Word', 'Heaven\'s Chronicle', 'World\'s Verse', 'Fate\'s Inscription', 'Cosmos Text', 'The Primordial Script']
    },
    tome: {
      common: ['Tattered Tome', 'Worn Pages', 'Simple Guide', 'Crude Handbook', 'Faded Folio', 'Dusty Codex', 'Plain Manual'],
      uncommon: ['Studied Tome', 'Bound Guide', 'Solid Handbook', 'Polished Folio', 'Clear Codex', 'Sturdy Pages', 'Well-Read Tome'],
      rare: ['Arcane Tome', 'Scholar\'s Guide', 'Battle Handbook', 'Guardian\'s Folio', 'Forged Manual', 'Knight\'s Codex', 'Warden\'s Tome'],
      epic: ['Dragonbone Tome', 'Soulbound Guide', 'Voidscribed Handbook', 'Titan\'s Manual', 'Stormbound Folio', 'Demonward Codex', 'Wyrmscale Tome'],
      legendary: ['Eternity\'s Knowledge', 'The Infinite Guide', 'Heaven\'s Tome', 'Worldbinder\'s Manual', 'Fate\'s Codex', 'Cosmos Handbook', 'The Eternal Knowledge']
    }
  },
  
  STARTING_EQUIPMENT: {
    Knight: {
      helmet: { name: 'Iron Cap', defense: 1 },
      chest: { name: 'Chainmail Vest', defense: 2 },
      gloves: { name: 'Leather Grips', defense: 1 },
      boots: { name: 'Steel-toed Boots', defense: 1 },
      grimoire: null,
      tome: null
    },
    Crusader: {
      helmet: { name: 'Holy Circlet', defense: 1 },
      chest: { name: 'Blessed Tunic', defense: 2 },
      gloves: { name: 'Prayer Wraps', defense: 1 },
      boots: { name: 'Temple Sandals', defense: 1 },
      grimoire: null,
      tome: null
    },
    Assassin: {
      helmet: { name: 'Shadow Cowl', defense: 1 },
      chest: { name: 'Dark Leather', defense: 2 },
      gloves: { name: 'Fingerless Gloves', defense: 1 },
      boots: { name: 'Soft Boots', defense: 1 },
      grimoire: { name: 'Worn Spellbook', hp: 10 },
      tome: null
    },
    Wizard: {
      helmet: { name: 'Apprentice Hat', defense: 1 },
      chest: { name: "Scholar's Robe", defense: 2 },
      gloves: { name: 'Silk Wraps', defense: 1 },
      boots: { name: 'Cloth Slippers', defense: 1 },
      grimoire: null,
      tome: { name: 'Field Manual', stamina: 10 }
    }
  },
  
  BASE_DEFENSE_BY_CLASS: {
    Knight: 5,
    Crusader: 4,
    Assassin: 3,
    Wizard: 2
  },
  
  WEAPON_STAT_RANGES: {
    min: 3,
    max: 9
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
      "You smell of something I haven't tasted in years. Fear.",
      "Every hero that came before you is ash. Join them.",
      "I have broken stronger things than you.",
      "Do you hear that? That's the sound of your last moment stretching thin.",
      "Come then. The darkness has been patient.",
      "Your blood will be warm. That's something, at least.",
      "Look at you. Standing here like it matters.",
      "I've killed better than you. I've killed worse. You're neither.",
      "The last one who faced me begged before the end. Will you?",
      "Run while you still have legs to carry you.",
      "I can smell how alive you are. It offends me.",
      "This ends the same way it always does.",
      "Your kind always looks surprised when it hurts.",
      "I have nowhere else to be. Do you?",
      "Whatever you came here for — it isn't worth this.",
      "I don't want your gold. I want what's underneath.",
      "There's no glory in this. Only darkness and then quiet.",
      "You stepped into my shadow. That was your first mistake."
    ],
    WAVE: [
      "We do not stop. We are not one thing. We are everything at once.",
      "You cannot count us. You cannot stop us. You can only fall.",
      "The tide comes. Rest is not something you get today.",
      "None of the others made it through. But step forward.",
      "Before you stands everything you have been running from."
    ],
    VICTORY_PLAYER: [
      "Not strong enough. Perhaps not ever.",
      "You fought well. It didn't matter.",
      "This is where your story ends. Here. In the dark.",
      "Lie still. It hurts less when you stop fighting it.",
      "The curse does not break for the weak.",
      "Another one. They always try. They always fall.",
      "I told you.",
      "There was never going to be another outcome."
    ],
    LOW_HP: [
      "You actually hurt me. Good. Now I'm going to end this.",
      "More. Show me more of that.",
      "That's it. That's the rage I wanted to see.",
      "Pain is familiar to me. It won't save you.",
      "I don't beg. I endure. And then I destroy.",
      "You've drawn blood. I won't forget that.",
      "My strength comes from wounds. Keep swinging.",
      "You think I break? I've been broken before. I came back meaner.",
      "I have died before. It didn't take.",
      "Getting close. Are you sure you want to finish this?",
      "You're not killing me. You're making me angry."
    ],
    FLEE: [
      "Running is still a choice. For now.",
      "I'll remember your scent.",
      "Smart. Come back when you're worth killing.",
      "The darkness follows. You already know that.",
      "Go. Let the thought of me follow you home.",
      "Fleeing won't make the dark any shorter.",
      "I'll be here when you return. I always am.",
      "Coward. But a living one. Come back and fix that.",
      "Run. But know that something is always behind you.",
      "You chose to live another moment. Spend it wisely."
    ],
    PLAYER_LOW_HP: [
      "Ha. There it is. That's the sound of something breaking.",
      "Look at you now. Still standing? Impressive. Pointless.",
      "Your blood is telling me you're almost done.",
      "Can you feel it? That cold creeping in? That's me winning.",
      "Don't stop now. I want to see how far you push this.",
      "You're almost out of time. Spend what's left wisely.",
      "Does it hurt? It should. You're almost mine.",
      "Keep fighting. The longer you last, the more I enjoy it.",
      "There isn't much of you left. Make it count.",
      "Almost. I can almost taste the end of this.",
      "That trembling in your hands — that's not anger. That's certainty."
    ],
    UPPER_HAND: [
      "You're fading. I can see it in the way you move.",
      "This is the part where lesser warriors give up. Are you lesser?",
      "Every hit you take makes me stronger. Do you feel that?",
      "I've broken harder things than you. It never takes long.",
      "You're running out of ways to survive this.",
      "The gap between us grows. You feel it too, don't you?",
      "I don't even need to rush. You're doing this to yourself.",
      "Desperation is a weapon. Unfortunately for you, it's mine."
    ]
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
      START: "Another one. They always look so certain at the start.",
      MID: "You've lasted longer than most. I'll try to remember your face.",
      LOW: "Impossible... you're still standing...",
      VICTORY_BOSS: "Rest now. The dream is over.",
      VICTORY_PLAYER: "Well done. But the curse... the curse does not end here."
    },
    DAY_2: {
      START: "You returned. Brave or foolish — the end is the same.",
      MID: "You fight with purpose. I respect that. It won't save you.",
      LOW: "What... what are you?",
      VICTORY_BOSS: "Sleep well, warrior. Your story ends here.",
      VICTORY_PLAYER: "You broke something in me I thought unbreakable."
    },
    DAY_3: {
      START: "Three days. Most crumble before reaching me. You're not most.",
      MID: "You're bleeding. I can smell it from here.",
      LOW: "Every wound you deal makes me angrier. You've made a mistake.",
      VICTORY_BOSS: "The warlord falls. The war does not.",
      VICTORY_PLAYER: "You fought like something with nothing left to lose."
    },
    DAY_4: {
      START: "Four days walking through darkness. And still you haven't broken. Curious.",
      MID: "The shadows are hungry tonight. So am I.",
      LOW: "You actually mean to end this. Don't you.",
      VICTORY_BOSS: "The dark was patient. You were not.",
      VICTORY_PLAYER: "Light... I had forgotten what that felt like."
    },
    DAY_5: {
      START: "Five days. You've earned the right to face me. That is all.",
      MID: "Pride has kept me sharp for centuries. Nothing breaks it today.",
      LOW: "No... I will NOT fall to something like you...",
      VICTORY_BOSS: "Another name written in blood. Yours.",
      VICTORY_PLAYER: "You fight like something the darkness itself made. I can respect that."
    },
    DAY_6: {
      START: "Six days. Most collapse long before reaching me. You should have.",
      MID: "I can feel you pushing. Good. It makes the breaking sweeter.",
      LOW: "I am something ancient. And even ancient things die screaming.",
      VICTORY_BOSS: "So close. That's always the cruelest part.",
      VICTORY_PLAYER: "Go then. The seventh night waits. And it will not be kind."
    },
    DAY_7: {
      START: "Seven days. You have walked through everything I have placed before you. And still. You. Come.",
      MID: "This is the edge of your road. I am what waits at the end.",
      LOW: "If you break me... the curse breaks with me. For now.",
      VICTORY_BOSS: "The cycle continues. It always does.",
      VICTORY_PLAYER: "You broke it. For now. But curses... curses always return. Sleep well. You've earned it."
    },
    GAUNTLET: {
      START: "I have been waiting at the end of this road since before you drew your first breath.",
      PHASE1_CYCLE: [
        "Every warrior thinks they are different. They are not.",
        "I have studied you. Your patterns. Your weaknesses. All of them.",
        "This is almost disappointingly slow. When do you start trying?",
        "You fight well. For someone who is about to lose.",
        "I wonder what broke the ones who came before you. I'm about to find out with you."
      ],
      MID: "You've killed a hundred lesser horrors. I've killed a hundred versions of you.",
      PHASE2: "No more patience. No more waiting. Now you see what I truly am.",
      PHASE2_CYCLE: [
        "Feel that? Each blow getting heavier. That is inevitability.",
        "Your armor cannot save you. Math does not lie.",
        "How many more can you take before something inside you simply stops?",
        "The weight of this — can you feel it? It only grows.",
        "Every second you survive, I grow stronger. Simple. Brutal. True."
      ],
      LOW: "You think you are winning? I am not even trying. I am curious how far you will push this.",
      PHASE3: "THEN FALL WITH ME. INTO THE DARK. INTO THE VOID. INTO WHAT I HAVE ALWAYS BEEN.",
      PHASE3_CYCLE: [
        "The abyss feeds on hope. Every victory you have... was only delay.",
        "They rise from the places you were weakest. My army. Your doubt.",
        "You think you fight me? You fight yourself. I am only the mirror.",
        "Drain. Consume. Break. This is what the end feels like.",
        "Kill them. They return. They always return. Because you made them."
      ],
      VICTORY_BOSS: "Adequate. You've earned a moment's rest. But I will be waiting. I am always waiting.",
      VICTORY_PLAYER: "Then... then it is done. You have killed something that was never meant to die. Carry that weight. It will not leave you."
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

