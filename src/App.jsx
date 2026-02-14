// FANTASY STUDY QUEST - v4.13.0
// Modal system polish - Consistent color semantics, ritual chamber aesthetics, compacted battle box

import React, { useState, useEffect, useCallback } from 'react';
import { Sword, Shield, Heart, Zap, Skull, Trophy, Plus, Play, Pause, X, Calendar, Hammer, Swords, ShieldCheck, HeartPulse, Sparkles, User, Target, GripVertical } from 'lucide-react';

// Import Cinzel font from Google Fonts (with duplicate prevention)
if (!document.querySelector('style[data-font="cinzel"]')) {
  const style = document.createElement('style');
  style.setAttribute('data-font', 'cinzel');
  style.textContent = "@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700;800;900&display=swap');";
  document.head.appendChild(style);
}

// Refined Medieval Color Scheme - Reduced Visual Noise
const COLORS = {
  // Primary Actions (Attack, Combat) - Deeper, less saturated
  crimson: { base: '#6B1318', hover: '#8B1A28', border: '#9B8B7E' },
  ruby: { base: '#7A1520', hover: '#9B1B30', border: '#9B8B7E' },
  
  // Secondary Actions (Heal, Support)
  emerald: { base: '#2F5233', hover: '#3D6B45', border: '#9B8B7E' },
  sapphire: { base: '#1E3A5F', hover: '#2B5082', border: '#9B8B7E' },
  amber: { base: '#8B6914', hover: '#B8860B', border: '#9B8B7E' },
  
  // Special/Elite Actions
  amethyst: { base: '#5A2472', hover: '#6B2C91', border: '#9B8B7E' },
  teal: { base: '#004D4D', hover: '#006666', border: '#9B8B7E' },
  obsidian: { base: '#1C1C1C', hover: '#2D2D2D', border: '#9B8B7E' },
  
  // Danger/Warning - More muted
  burgundy: { base: '#5A0E15', hover: '#6B0F1A', border: '#9B8B7E' },
  darkOrange: { base: '#A64400', hover: '#CC5500', border: '#9B8B7E' },
  
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
const VISUAL_STYLES = {
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

const GAME_CONSTANTS = {
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
      cooldown: true
    },
    Crusader: {
      name: 'Smite',
      cost: 15,
      damageMultiplier: 1.7,
      healAmount: 10,
      effect: 'Holy strike that heals. Cannot be used twice in a row.',
      cooldown: true
    }
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

const HERO_TITLES = ['Novice', 'Seeker', 'Wanderer', 'Survivor', 'Warrior', 'Champion', 'Legend'];

// Global CSS to hide scrollbars
const globalStyles = `
  ::-webkit-scrollbar {
    display: none;
  }
  * {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`;

const FantasyStudyQuest = () => {
  const [activeTab, setActiveTab] = useState('quest');
  const [plannerSubTab, setPlannerSubTab] = useState('weekly');
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
    { name: 'Wizard', color: 'purple', emblem: '✦', gradient: ['from-purple-900', 'from-purple-800', 'from-purple-700', 'from-purple-600'], glow: ['shadow-purple-900/50', 'shadow-purple-700/60', 'shadow-purple-600/70', 'shadow-purple-500/80'] },
    { name: 'Assassin', color: 'green', emblem: '†', gradient: ['from-green-900', 'from-green-800', 'from-green-700', 'from-green-600'], glow: ['shadow-green-900/50', 'shadow-green-700/60', 'shadow-green-600/70', 'shadow-green-500/80'] },
    { name: 'Crusader', color: 'yellow', emblem: '✙', gradient: ['from-yellow-900', 'from-yellow-800', 'from-yellow-700', 'from-yellow-600'], glow: ['shadow-yellow-900/50', 'shadow-yellow-700/60', 'shadow-yellow-600/70', 'shadow-yellow-500/80'] }
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
    
    // Show notification
    setShowAchievementNotification(achievement);
    setTimeout(() => setShowAchievementNotification(null), 5000);
    
    // Log unlock
    addLog(`🏆 Achievement Unlocked: ${achievement.name}!`);
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
  isDayActive, marketModifiers, lastMarketUpdateDay, shopInventory, daysSinceShop, dailyQuestCompleted
};
      localStorage.setItem('fantasyStudyQuest', JSON.stringify(saveData));
      
      // Show auto-save indicator
      setShowSavedIndicator(true);
      setTimeout(() => setShowSavedIndicator(false), 1500);
    }
 }, [hero, currentDay, hp, stamina, xp, gold, level, healthPots, staminaPots, cleansePots, weapon, armor, equippedWeapon, weaponInventory, equippedArmor, armorInventory, equippedPendant, equippedRing, pendantInventory, ringInventory, tasks, graveyard, heroes, hasStarted, skipCount, consecutiveDays, lastPlayedDate, curseLevel, eliteBossDefeatedToday, lastRealDay, studyStats, weeklyPlan, calendarTasks, calendarFocus, calendarEvents, flashcardDecks, gauntletMilestone, gauntletUnlocked, isDayActive, marketModifiers, lastMarketUpdateDay, shopInventory, daysSinceShop, dailyQuestCompleted]);
  
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
      addLog(`The hero has grown stronger! Now level ${newLevel}`);
      setHp(h => Math.min(getMaxHp(), h + 20));
    }
  }, [xp, level, addLog, getMaxHp]);
  
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
  const sellEquipment = (item, itemType, inventorySetter) => {
    const sellPrice = calculateSellPrice(item, itemType);
    
    setGold(g => g + sellPrice);
    
    // Remove from inventory
    if (itemType === 'weapon') {
      setWeaponInventory(prev => prev.filter(w => w.id !== item.id));
    } else if (itemType === 'armor') {
      const slot = item.slot;
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
  
  const attack = () => {
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
    setTimeout(() => setBossFlash(false), 200);
    
    if (newBossHp <= 0) {
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
            
            const names = GAME_CONSTANTS.ACCESSORY_NAMES.pendant;
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
            
            const names = GAME_CONSTANTS.ACCESSORY_NAMES.ring;
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
            
            const names = GAME_CONSTANTS.ACCESSORY_NAMES.pendant;
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
            
            const names = GAME_CONSTANTS.ACCESSORY_NAMES.ring;
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
    }, GAME_CONSTANTS.BOSS_ATTACK_DELAY);
  };
  
  const specialAttack = () => {
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
            
            // Reset Assassin poison stacks when poison expires
            if (bossDebuffs.poisonTurns - 1 === 0) {
              setAssassinPoisonStacks(0);
            }
          }
        }, 200);
      }, GAME_CONSTANTS.BOSS_ATTACK_DELAY);
    } else {
      // Counter-attack skipped (Wizard Temporal Rift)
      setBossDebuffs(prev => ({ ...prev, stunned: false }));
    }
  };
  
  const useCrushingBlow = () => {
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
      
      // Loot would go here (skipping for brevity, same as regular attack)
      setVictoryLoot([]);
      setVictoryFlash(true);
      setTimeout(() => setVictoryFlash(false), 400);
      
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
      
    }, 1000);
  };
  
  const useSmite = () => {
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
      
      setVictoryLoot([]);
      setVictoryFlash(true);
      setTimeout(() => setVictoryFlash(false), 400);
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
      
    }, 1000);
  };
  
  const useTacticalSkill = () => {
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
      
    }, 1000); // Delay counter-attack like normal
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
              <div className="bg-black bg-opacity-40 rounded-lg p-3 mb-4 border border-gray-800">
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



          {activeTab === 'quest' && (
            <div className="space-y-4">
            <div className="rounded-xl p-4 max-w-2xl mx-auto relative overflow-hidden" style={{
              background: (() => {
                const colorMap = {
                  red: '#3D0A0A',      // Warrior - Deep crimson red (darker, richer)
                  purple: '#2A1A3D',   // Mage - Deep royal purple (more saturated)
                  green: '#1A2A3A',    // Rogue - Deep indigo/midnight blue (stealth, shadows)
                  yellow: '#3D3A1F',   // Paladin - Deep gold/bronze (less muddy)
                  amber: '#1E3A2E'     // Ranger - Forest green (nature theme)
                };
                return colorMap[hero.class.color] || colorMap.yellow;
              })(),
              border: '2px solid rgba(0, 0, 0, 0.5)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5), inset 0 0 50px rgba(0, 0, 0, 0.3)'
            }}>
              
              {heroCardCollapsed ? (
                // Collapsed state - minimal medieval theme
                <div className="relative">
                  {/* Large watermark emblem in center background */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{fontSize: '8rem', lineHeight: 1, opacity: 0.05, color: '#F5F5DC'}}>
                    {getCardStyle(hero.class, currentDay).emblem}
                  </div>
                  
                  {/* Level badge in top right corner */}
                  <div className="absolute top-2 right-2 px-3 py-1 rounded-lg border-2" style={{
                    background: 'rgba(0, 0, 0, 0.8)',
                    borderColor: 'rgba(212, 175, 55, 0.6)',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
                  }}>
                    <span className="text-xs font-bold" style={{color: '#D4AF37', letterSpacing: '0.1em'}}>LVL {level}</span>
                  </div>
                  
                  <div className="relative z-10 py-1">
                    {/* Hero name - large and prominent in beige */}
                    <div className="text-center mb-1">
                      <h3 className="text-3xl font-black" style={{color: '#F5F5DC', letterSpacing: '0.08em'}}>{hero.name}</h3>
                      <p className="text-sm mt-1" style={{color: COLORS.silver}}>{hero.class.name}</p>
                    </div>
                    
                    {/* HP and Stamina side-by-side */}
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      {/* HP Bar */}
                      <div className="rounded-lg p-2" style={{background: 'rgba(0, 0, 0, 0.3)', border: '1px solid rgba(139, 0, 0, 0.3)'}}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs uppercase tracking-wide" style={{color: COLORS.silver}}>HP</span>
                          <span className="text-xs font-bold" style={{color: hp <= 10 ? '#DC2626' : '#F5F5DC'}}>{hp}/{getMaxHp()}</span>
                        </div>
                        <div className="rounded-full h-1.5 overflow-hidden" style={{background: 'rgba(0, 0, 0, 0.5)'}}>
                          <div 
                            className="h-1.5 rounded-full transition-all" 
                            style={{
                              width: `${(hp / getMaxHp()) * 100}%`,
                              background: hp <= 10 ? 'linear-gradient(to right, #5A0E15, #8B1A28)' : 'linear-gradient(to right, #6B1318, #9B1B30)'
                            }}
                          />
                        </div>
                      </div>
                      
                      {/* Stamina Bar */}
                      <div className="rounded-lg p-2" style={{background: 'rgba(0, 0, 0, 0.3)', border: '1px solid rgba(30, 58, 95, 0.3)'}}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs uppercase tracking-wide" style={{color: COLORS.silver}}>SP</span>
                          <span className="text-xs font-bold" style={{color: '#93C5FD'}}>{stamina}/{getMaxStamina()}</span>
                        </div>
                        <div className="rounded-full h-1.5 overflow-hidden" style={{background: 'rgba(0, 0, 0, 0.5)'}}>
                          <div 
                            className="h-1.5 rounded-full transition-all" 
                            style={{
                              width: `${(stamina / getMaxStamina()) * 100}%`,
                              background: 'linear-gradient(to right, #0C4A6E, #0EA5E9)'
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Curse Status - Collapsed View */}
                    {curseLevel > 0 && (
                      <div 
                        className={`rounded-lg p-2 mb-2 border ${curseLevel === 3 ? 'animate-pulse' : ''}`}
                        style={{
                          backgroundColor: 'rgba(107, 44, 145, 0.3)',
                          borderColor: curseLevel === 3 ? 'rgba(220, 38, 38, 0.6)' : 'rgba(138, 59, 181, 0.5)',
                          boxShadow: curseLevel === 3 ? '0 0 15px rgba(220, 38, 38, 0.3)' : '0 0 10px rgba(138, 59, 181, 0.2)'
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span style={{fontSize: '1rem'}}>
                              {curseLevel === 1 ? '🌑' : curseLevel === 2 ? '🌑🌑' : '☠️'}
                            </span>
                            <p className="text-xs font-bold uppercase" style={{color: curseLevel === 3 ? '#FF6B6B' : '#B794F4'}}>
                              {curseLevel === 1 ? 'CURSED' : curseLevel === 2 ? 'DEEPLY CURSED' : 'CONDEMNED'}
                            </p>
                          </div>
                          <p className="text-xs" style={{color: '#B794F4'}}>
                            {curseLevel}/3
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {/* Expand Button - Centered */}
                    <div className="flex justify-center">
                      <button
                        onClick={() => setHeroCardCollapsed(!heroCardCollapsed)}
                        className="px-3 py-1 rounded transition-all border-2 hover:scale-105"
                        style={{
                          background: 'rgba(0, 0, 0, 0.5)',
                          borderColor: 'rgba(212, 175, 55, 0.4)',
                          color: '#D4AF37',
                          fontSize: '0.7rem',
                          letterSpacing: '0.1em'
                        }}
                      >
                        ▼ EXPAND HERO CARD
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                // Expanded state - full hero card
                <>
              {/* Large watermark emblem in center background */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{fontSize: '20rem', lineHeight: 1, opacity: 0.05, color: '#F5F5DC'}}>
                {getCardStyle(hero.class, currentDay).emblem}
              </div>
              
              {/* Day badge in top left corner */}
              <div className="absolute top-0 left-0 px-3 py-1 rounded-br-lg border-2 z-20" style={{
                background: 'rgba(0, 0, 0, 0.5)',
                borderColor: 'rgba(212, 175, 55, 0.4)',
                borderTop: 'none',
                borderLeft: 'none'
              }}>
                <span className="text-xs font-bold" style={{color: '#D4AF37', letterSpacing: '0.1em'}}>DAY {currentDay}</span>
              </div>
              
              {/* Level badge in top right corner */}
              <div className="absolute top-0 right-0 px-3 py-1 rounded-bl-lg border-2 z-20" style={{
                background: 'rgba(0, 0, 0, 0.5)',
                borderColor: 'rgba(212, 175, 55, 0.4)',
                borderTop: 'none',
                borderRight: 'none'
              }}>
                <span className="text-xs font-bold" style={{color: '#D4AF37', letterSpacing: '0.1em'}}>LVL {level}</span>
              </div>
              
              <div className="relative z-10">
                {/* Hero name and title */}
                <div className="text-center mb-3 pt-6">
                  <h2 className="text-4xl font-bold mb-1 uppercase" style={{color: '#F5F5DC', letterSpacing: '0.1em'}}>{hero.name}</h2>
                  <p className="text-sm uppercase tracking-wide" style={{color: '#F5F5DC'}}>{hero.title} {hero.class.name}</p>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <div style={{width: '40px', height: '1px', background: 'rgba(245, 245, 220, 0.3)'}}></div>
                    <span style={{color: 'rgba(245, 245, 220, 0.5)', fontSize: '8px'}}>◆</span>
                    <div style={{width: '40px', height: '1px', background: 'rgba(245, 245, 220, 0.3)'}}></div>
                  </div>
                </div>
                
                {/* Experience bar */}
                <div className="mb-3 rounded-lg p-2" style={{backgroundColor: 'rgba(0, 0, 0, 0.35)', border: '2px solid rgba(0, 0, 0, 0.3)'}}>
                  <div className="flex justify-between text-sm mb-1" style={{color: '#D4AF37'}}>
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
                  <div className="rounded-full h-3 overflow-hidden" style={{backgroundColor: 'rgba(0, 0, 0, 0.5)'}}>
                    <div className="h-3 rounded-full transition-all duration-300" style={{
                      background: (() => {
                        const gradientMap = {
                          red: 'linear-gradient(90deg, #8B0000 0%, #DC143C 100%)',           // Warrior - unchanged
                          purple: 'linear-gradient(90deg, #4B0082 0%, #9370DB 100%)',        // Mage - unchanged
                          green: 'linear-gradient(90deg, #1E3A5F 0%, #3B82F6 100%)',         // Rogue - dark indigo to blue (stealth theme)
                          yellow: 'linear-gradient(90deg, #B8860B 0%, #FFD700 100%)',        // Paladin - dark gold to bright gold
                          amber: 'linear-gradient(90deg, #166534 0%, #22C55E 100%)'          // Ranger - dark forest to bright green
                        };
                        return gradientMap[hero.class.color] || 'linear-gradient(90deg, #B8860B 0%, #FFD700 100%)';
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
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {/* HP */}
                  <div className="rounded-lg p-2 text-center" style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.35)',
                    border: '2px solid rgba(0, 0, 0, 0.3)',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
                  }}>
                    <div className="flex justify-center mb-1">
                      <HeartPulse size={20} style={{color: '#FF6B6B'}}/>
                    </div>
                    <p className="text-xl font-bold mb-1" style={{color: '#F5F5DC'}}>{hp}/{getMaxHp()}</p>
                    <div className="rounded-full h-2 overflow-hidden" style={{backgroundColor: 'rgba(0, 0, 0, 0.5)'}}>
                      <div className="h-2 rounded-full transition-all duration-300" style={{backgroundColor: '#DC2626', width: `${(hp / getMaxHp()) * 100}%`}}></div>
                    </div>
                  </div>
                  
                  {/* Stamina */}
                  <div className="rounded-lg p-2 text-center" style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.35)',
                    border: '2px solid rgba(0, 0, 0, 0.3)',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
                  }}>
                    <div className="flex justify-center mb-1">
                      <Sparkles size={20} style={{color: '#3B82F6'}}/>
                    </div>
                    <p className="text-xl font-bold mb-1" style={{color: '#F5F5DC'}}>{stamina}/{getMaxStamina()}</p>
                    <div className="rounded-full h-2 overflow-hidden" style={{backgroundColor: 'rgba(0, 0, 0, 0.5)'}}>
                      <div className="h-2 rounded-full transition-all duration-300" style={{backgroundColor: '#3B82F6', width: `${(stamina / getMaxStamina()) * 100}%`}}></div>
                    </div>
                  </div>
                  
                  {/* Attack */}
                  <div className="rounded-lg p-2 text-center" style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.35)',
                    border: '2px solid rgba(0, 0, 0, 0.3)',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
                  }}>
                    <div className="flex justify-center mb-1">
                      <Swords size={20} style={{color: '#F59E0B'}}/>
                    </div>
                    <p className="text-xl font-bold mb-1" style={{color: '#F5F5DC'}}>{getBaseAttack()}</p>
                    <p className="text-xs uppercase" style={{color: '#F5F5DC'}}>Damage Per Hit</p>
                  </div>
                  
                  {/* Defense */}
                  <div className="rounded-lg p-2 text-center" style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.35)',
                    border: '2px solid rgba(0, 0, 0, 0.3)',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
                  }}>
                    <div className="flex justify-center mb-1">
                      <ShieldCheck size={20} style={{color: '#F5F5DC'}}/>
                    </div>
                    <p className="text-2xl font-bold mb-1" style={{color: '#F5F5DC'}}>{Math.floor((getBaseDefense() / (getBaseDefense() + 50)) * 100)}%</p>
                    <p className="text-xs uppercase" style={{color: '#F5F5DC'}}>Damage Resist</p>
                  </div>
                </div>
                
                {/* Curse Status Display */}
                {curseLevel > 0 && (
                  <div 
                    className={`rounded-lg p-2 mb-3 border-2 ${curseLevel === 3 ? 'animate-pulse' : ''}`}
                    style={{
                      backgroundColor: 'rgba(107, 44, 145, 0.3)',
                      borderColor: curseLevel === 3 ? 'rgba(220, 38, 38, 0.8)' : 'rgba(138, 59, 181, 0.6)',
                      boxShadow: curseLevel === 3 ? VISUAL_STYLES.shadow.glow('#DC2626', 0.2) : VISUAL_STYLES.shadow.glow('#8A3BB5', 0.15)
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span style={{fontSize: '1.5rem'}}>
                          {curseLevel === 1 ? '🌑' : curseLevel === 2 ? '🌑🌑' : '☠️'}
                        </span>
                        <div>
                          <p className="font-bold text-sm uppercase" style={{color: curseLevel === 3 ? '#FF6B6B' : '#B794F4'}}>
                            {curseLevel === 1 ? 'CURSED' : curseLevel === 2 ? 'DEEPLY CURSED' : 'CONDEMNED'}
                          </p>
                          <p className="text-xs" style={{color: '#F5F5DC', opacity: 0.8}}>
                            Level {curseLevel}/3
                            {curseLevel === 3 && ' - One more death...'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs" style={{color: '#B794F4'}}>
                          {curseLevel === 1 ? '75% XP' : curseLevel === 2 ? '50% XP' : '25% XP'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
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
                
                {/* Supplies and Merchant buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => {
                      setSuppliesTab('potions');
                      setShowInventoryModal(true);
                    }}
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
                    Supplies
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
                
                {/* Collapse Button - Centered at bottom */}
                <div className="flex justify-center mt-4">
                  <button
                    onClick={() => setHeroCardCollapsed(!heroCardCollapsed)}
                    className="px-3 py-1 rounded transition-all border-2 hover:scale-105"
                    style={{
                      background: 'rgba(0, 0, 0, 0.5)',
                      borderColor: 'rgba(212, 175, 55, 0.4)',
                      color: '#D4AF37',
                      fontSize: '0.7rem',
                      letterSpacing: '0.1em'
                    }}
                  >
                    {heroCardCollapsed ? '▼ EXPAND HERO CARD' : '▲ COLLAPSE HERO CARD'}
                  </button>
                </div>
              </div>
              </>
              )}
            </div>
              {!hasStarted ? (
                <div className="rounded-xl p-8 text-center" style={{
                  background: 'linear-gradient(to bottom, rgba(42, 36, 28, 0.97), rgba(26, 22, 18, 0.97))',
                  borderColor: '#D4AF37',
                  borderWidth: '2px',
                  borderStyle: 'solid',
                  boxShadow: '0 0 30px rgba(212, 175, 55, 0.3), inset 0 0 60px rgba(212, 175, 55, 0.1)'
                }}>
                  
                  {/* Decorative divider above */}
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <div style={{width: '80px', height: '1px', background: 'linear-gradient(to right, transparent, rgba(212, 175, 55, 0.5))'}}></div>
                    <span style={{color: 'rgba(212, 175, 55, 0.6)', fontSize: '8px'}}>◆</span>
                    <div style={{width: '80px', height: '1px', background: 'linear-gradient(to left, transparent, rgba(212, 175, 55, 0.5))'}}></div>
                  </div>
                  
                  {/* Date Section */}
                  <h2 className="text-3xl font-bold mb-2 uppercase" style={{
                    color: '#D4AF37',
                    fontFamily: 'Cinzel, serif',
                    letterSpacing: '0.15em',
                    textShadow: '0 0 8px rgba(212, 175, 55, 0.6)'
                  }}>
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </h2>
                  <p className="text-base mb-2" style={{color: 'rgba(156, 163, 175, 0.8)'}}>
                    {new Date().toLocaleDateString('en-US', { year: 'numeric' })}
                  </p>
                  
                  {/* Decorative divider */}
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <div style={{width: '60px', height: '1px', background: 'linear-gradient(to right, transparent, rgba(212, 175, 55, 0.5))'}}></div>
                    <span style={{color: 'rgba(212, 175, 55, 0.6)', fontSize: '8px'}}>◆</span>
                    <div style={{width: '60px', height: '1px', background: 'linear-gradient(to left, transparent, rgba(212, 175, 55, 0.5))'}}></div>
                  </div>
                  
                  <p className="text-sm italic mb-3" style={{color: '#FF6B6B'}}>BEGIN YOUR TRIALS</p>
                  <p className="text-xs italic mb-6" style={{color: '#DAA520'}}>
                    "{GAME_CONSTANTS.DAY_NAMES[currentDay].theme}"
                  </p>
                  
                  <button 
                    onClick={start} 
                    className="px-8 py-3 rounded-lg font-bold text-xl transition-all" 
                    style={{
                      backgroundColor: COLORS.gold,
                      color: COLORS.obsidian.base,
                      boxShadow: '0 4px 12px rgba(212, 175, 55, 0.4)'
                    }} 
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#FFD700';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 16px rgba(212, 175, 55, 0.5)';
                    }} 
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = COLORS.gold;
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(212, 175, 55, 0.4)';
                    }}
                  >START DAY</button>
                  
                  {/* Decorative divider below */}
                  <div className="flex items-center justify-center gap-2 mt-6">
                    <div style={{width: '80px', height: '1px', background: 'linear-gradient(to right, transparent, rgba(212, 175, 55, 0.5))'}}></div>
                    <span style={{color: 'rgba(212, 175, 55, 0.6)', fontSize: '8px'}}>◆</span>
                    <div style={{width: '80px', height: '1px', background: 'linear-gradient(to left, transparent, rgba(212, 175, 55, 0.5))'}}></div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="bg-black bg-opacity-50 rounded-xl p-6 border-2" style={{borderColor: 'rgba(212, 175, 55, 0.6)'}}>
                    {/* Section header with decorative divider */}
                    <div className="text-center mb-4">
                      <h2 className="text-4xl font-bold mb-4" style={{color: COLORS.gold, letterSpacing: '0.15em'}}>TRIALS OF THE CURSED</h2>
                      <div className="flex items-center justify-center gap-2">
                        <div style={VISUAL_STYLES.divider.gold('80px').left}></div>
                        <span style={VISUAL_STYLES.divider.gold().diamond}>◆</span>
                        <div style={VISUAL_STYLES.divider.gold('80px').right}></div>
                      </div>
                    </div>
                    {tasks.length > 0 && (
                    
                      <p className="text-sm mb-6 italic text-center" style={{color: COLORS.silver}}>"Complete your trials or be consumed by the curse..."</p>
                    )}
                    <div className="flex gap-3 justify-center mb-6">
                      <button 
                        onClick={() => setShowImportModal(true)} 
                        className="flex items-center gap-2 px-8 py-3 rounded-lg transition-all border-2 uppercase text-sm font-bold" 
                        style={{backgroundColor: 'rgba(120, 53, 15, 0.6)', borderColor: '#92400E', color: '#F5F5DC'}} 
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(120, 53, 15, 0.8)';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(120, 53, 15, 0.4)';
                        }} 
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(120, 53, 15, 0.6)';
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '';
                        }}
                      >
                        <Calendar size={18}/>Import from Planner
                      </button>
                      <button 
                        onClick={() => setShowModal(true)} 
                        className="flex items-center gap-2 px-8 py-3 rounded-lg transition-all border-2 uppercase text-sm font-bold" 
                        style={{backgroundColor: COLORS.amber.base, borderColor: COLORS.amber.border, color: '#1C1C1C'}} 
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(234, 179, 8, 0.9)';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(234, 179, 8, 0.4)';
                        }} 
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = COLORS.amber.base;
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '';
                        }}
                      >
                        <Plus size={18}/>Accept Trial
                      </button>
                    </div>
                    
                    {tasks.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-base font-semibold tracking-wide" style={{color: '#F5F5DC', letterSpacing: '0.08em'}}>Your journey begins here.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {[...tasks].sort((a, b) => {
  // Incomplete tasks first, completed tasks last
  if (!a.done && b.done) return -1;
  if (a.done && !b.done) return 1;
  
  // Among incomplete tasks: overdue first, then important, then routine
  if (!a.done && !b.done) {
    // Overdue tasks always come first
    if (a.overdue && !b.overdue) return -1;
    if (!a.overdue && b.overdue) return 1;
    
    // If both overdue or both not overdue, sort by priority
    if (a.priority === 'important' && b.priority !== 'important') return -1;
    if (a.priority !== 'important' && b.priority === 'important') return 1;
  }
  return 0;
})
.filter(task => !hideCompletedTasks || !task.done)
.map(t => (
  <div key={t.id} className={`rounded-lg p-4 border-2 ${
    t.done 
      ? 'opacity-60' 
      : t.overdue
        ? 'bg-red-900/20 border-red-600 opacity-80'
      : t.priority === 'important'
        ? `bg-gradient-to-r from-yellow-900/30 to-gray-800`
        : 'bg-gradient-to-r from-blue-900/30 to-gray-800 border-blue-500'
  }`}
  style={{
    backgroundColor: t.done 
      ? 'rgba(30, 41, 59, 0.4)' 
      : t.overdue 
        ? undefined 
        : t.priority === 'important' 
          ? undefined 
          : undefined,
    borderColor: t.done 
      ? 'rgba(34, 197, 94, 0.6)' 
      : t.overdue
        ? undefined
        : t.priority === 'important'
          ? COLORS.gold
          : undefined,
    position: 'relative',
    overflow: 'hidden',
    animation: t.overdue && !t.done 
      ? 'pulse-red-border 2s ease-in-out infinite' 
      : undefined,
    boxShadow: t.priority === 'important' && !t.done && !t.overdue
      ? `0 0 20px ${COLORS.gold}99`
      : t.done
        ? '0 1px 3px rgba(0, 0, 0, 0.1)'
        : '0 2px 4px rgba(0, 0, 0, 0.2)'
  }}
  draggable={!t.done}
  onDragStart={(e) => handleDragStart(e, t)}
  onDragEnd={handleDragEnd}
  onDragOver={handleDragOver}
  onDrop={(e) => handleDrop(e, t)}
  >
    {/* OVERDUE watermark - centered from left edge to Focus button */}
    {t.overdue && !t.done && (
      <div className="absolute left-0 inset-y-0 flex items-center pointer-events-none" style={{zIndex: 0, right: '180px', justifyContent: 'center'}}>
        <span style={{
          fontSize: '3rem',
          fontWeight: 900,
          color: '#DC2626',
          opacity: 0.08,
          letterSpacing: '0.2em'
        }}>OVERDUE</span>
      </div>
    )}
    {/* COMPLETED watermark - centered horizontally */}
    {t.done && (
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{zIndex: 0}}>
        <span style={{
          fontSize: '3rem',
          fontWeight: 900,
          color: '#22C55E',
          opacity: 0.15,
          letterSpacing: '0.2em'
        }}>COMPLETED</span>
      </div>
    )}
    <div className="flex items-center gap-3" style={{position: 'relative', zIndex: 1}}>
      {!t.done && (
        <div style={{opacity: 0.3, cursor: 'grab'}} onMouseEnter={(e) => e.currentTarget.style.opacity = 0.7} onMouseLeave={(e) => e.currentTarget.style.opacity = 0.3}>
          <GripVertical size={20} style={{color: '#C0C0C0'}}/>
        </div>
      )}
      <div className="flex-1">
        <p className={t.done ? 'line-through text-gray-500' : t.overdue ? 'text-red-300 font-medium text-lg' : 'text-white font-medium text-lg'}>
          {t.title}
        </p>
        <p className="text-sm mt-1" style={{color: t.priority === 'important' ? COLORS.gold : '#9CA3AF'}}>
          {t.priority === 'important' ? 'IMPORTANT • 1.25x XP' : 'ROUTINE • 1.0x XP'}
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
            className="px-3 py-1 rounded transition-all flex items-center gap-1 border-2" style={{backgroundColor: COLORS.amethyst.base, borderColor: COLORS.amethyst.border, color: '#F5F5DC'}} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.amethyst.hover} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = COLORS.amethyst.base}
          >
            Focus
          </button>
          <button 
            onClick={() => complete(t.id)} 
            className="px-3 py-1 rounded font-bold transition-all flex items-center gap-1 border-2" style={{backgroundColor: COLORS.emerald.base, borderColor: COLORS.emerald.border, color: '#F5F5DC'}} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.emerald.hover} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = COLORS.emerald.base}
          >
            Complete
          </button>
        </div>
      )}
    </div>
  </div>
))}   
                      </div>
                    )}
                    
                    {/* Hide completed tasks toggle - at bottom */}
                    {tasks.length > 0 && tasks.some(t => t.done) && (
                      <div className="flex items-center justify-center gap-2 py-3 mt-4">
                        <input 
                          type="checkbox" 
                          id="hideCompleted"
                          checked={hideCompletedTasks}
                          onChange={(e) => setHideCompletedTasks(e.target.checked)}
                          className="w-4 h-4 cursor-pointer"
                          style={{accentColor: '#D4AF37'}}
                        />
                        <label 
                          htmlFor="hideCompleted" 
                          className="text-sm cursor-pointer"
                          style={{color: '#C0C0C0'}}
                        >
                          Hide completed tasks
                        </label>
                      </div>
                    )}
                  </div>
                  
                  {/* Elite Boss Warning - State Machine with Emotional Feedback */}
                  {isDayActive && !eliteBossDefeatedToday && (() => {
                    const currentHour = new Date().getHours();
                    const hasEnoughXP = xp >= 200;
                    
                    let state;
                    
                    // Use debug state if set, otherwise calculate normally
                    if (debugWarningState) {
                      state = debugWarningState;
                    } else {
                      if (!hasEnoughXP) {
                        state = 'locked'; // Progress phase
                      } else if (currentHour < 18) {
                        state = 'unlocked'; // Confrontation available
                      } else if (currentHour >= 18 && currentHour < 22) {
                        state = 'evening'; // Temporal urgency begins
                      } else {
                        state = 'finalhour'; // Critical window
                      }
                    }
                    
                    const stateConfig = {
                      locked: {
                        bg: 'rgba(0, 0, 0, 0.5)',
                        border: 'rgba(212, 175, 55, 0.4)',
                        shadow: 'none',
                        textColor: '#D4AF37',
                        animate: false,
                        message: "Progress to unlock today's challenge."
                      },
                      unlocked: {
                        bg: 'rgba(0, 0, 0, 0.5)',
                        border: 'rgba(184, 134, 11, 0.5)',
                        shadow: '0 0 8px rgba(184, 134, 11, 0.2)',
                        textColor: '#DAA520',
                        animate: false,
                        message: 'The darkness awaits.'
                      },
                      evening: {
                        bg: 'rgba(0, 0, 0, 0.5)',
                        border: 'rgba(212, 175, 55, 0.6)',
                        shadow: '0 0 10px rgba(212, 175, 55, 0.15)',
                        textColor: '#EF4444',
                        animate: false,
                        message: 'Midnight approaches. The curse stirs.'
                      },
                      finalhour: {
                        bg: 'rgba(139, 0, 0, 0.3)',
                        border: 'rgba(220, 38, 38, 0.8)',
                        shadow: '0 0 20px rgba(220, 38, 38, 0.4)',
                        textColor: '#FF6B6B',
                        animate: true,
                        message: 'Final hour. Defeat the Darkness.'
                      }
                    };
                    
                    const config = stateConfig[state];
                    
                    if (!config) return null;
                    
                    return (
                      <div 
                        className={`rounded-lg p-4 mb-4 border-2 ${config.animate ? 'animate-pulse' : ''}`}
                        style={{
                          backgroundColor: config.bg,
                          borderColor: config.border,
                          boxShadow: config.shadow
                        }}
                      >
                        <div className="text-center">
                          <p className="font-bold text-sm" style={{color: config.textColor}}>
                            {config.message}
                          </p>
                        </div>
                      </div>
                    );
                  })()}
                  
                  <div className="grid md:grid-cols-2 gap-4 mt-6">
                    <button 
  onClick={miniBoss} 
  disabled={!isDayActive || eliteBossDefeatedToday || xp < 150} 
  className="px-8 py-6 rounded-xl font-bold text-xl transition-all border-2 disabled:cursor-not-allowed uppercase" style={{backgroundColor: (!isDayActive || eliteBossDefeatedToday || xp < 150) ? 'rgba(30, 41, 59, 0.5)' : 'rgba(30, 41, 59, 0.8)', borderColor: (!isDayActive || eliteBossDefeatedToday || xp < 150) ? 'rgba(71, 85, 105, 0.5)' : 'rgba(71, 85, 105, 0.8)', color: '#F5F5DC', opacity: (!isDayActive || eliteBossDefeatedToday || xp < 150) ? 0.5 : 1}} onMouseEnter={(e) => {if (isDayActive && !eliteBossDefeatedToday && xp >= 150) e.currentTarget.style.backgroundColor = 'rgba(51, 65, 85, 0.9)'}} onMouseLeave={(e) => {if (isDayActive && !eliteBossDefeatedToday && xp >= 150) e.currentTarget.style.backgroundColor = 'rgba(30, 41, 59, 0.8)'}}
>
  <div className="text-center">
    <div className="mb-2">FACE THE DARKNESS</div>
    {!isDayActive ? (
      <div className="text-xs font-normal uppercase" style={{color: '#9CA3AF'}}>Day dormant — add tasks to begin</div>
    ) : eliteBossDefeatedToday ? (
      <div className="text-xs font-normal uppercase" style={{color: '#4ADE80'}}>✓ Today's trial complete</div>
    ) : (
      <div className="text-xs font-normal uppercase" style={{color: xp >= 150 ? '#4ADE80' : '#FBBF24'}}>
        {xp >= 150 ? `Ready • 150 XP` : `${150 - xp} XP needed`}
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
                    <div className="text-center mb-4">
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
            <div className="bg-black bg-opacity-50 rounded-xl p-6 border-2" style={{borderColor: 'rgba(212, 175, 55, 0.6)'}}>
              {/* Section header with decorative divider */}
              <div className="text-center mb-4">
                <h2 className="text-4xl font-bold mb-4" style={{color: '#D4AF37', letterSpacing: '0.15em'}}>BATTLE PLANNER</h2>
                <div className="flex items-center justify-center gap-2">
                  <div style={{width: '80px', height: '1px', background: 'linear-gradient(to right, transparent, rgba(212, 175, 55, 0.5))'}}></div>
                  <span style={{color: 'rgba(212, 175, 55, 0.6)', fontSize: '8px'}}>◆</span>
                  <div style={{width: '80px', height: '1px', background: 'linear-gradient(to left, transparent, rgba(212, 175, 55, 0.5))'}}></div>
                </div>
              </div>
              <p className="text-sm mb-6 italic text-center" style={{color: COLORS.silver}}>"Chart your path through the coming trials..."</p>
              
              {/* Sub-navigation tabs */}
              <div className="flex gap-2 justify-center mb-6">
                <button 
                  onClick={() => setPlannerSubTab('weekly')}
                  className="px-4 py-2 rounded-lg transition-all border-2"
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
                  className="px-4 py-2 rounded-lg transition-all border-2"
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
              <>
              <div className="grid gap-4">
                {Object.keys(weeklyPlan).map((day, dayIndex) => {
                  const dayTheme = GAME_CONSTANTS.DAY_NAMES[dayIndex] || { name: day, subtitle: '', theme: '' };
                  const today = new Date();
                  const todayDayName = today.toLocaleDateString('en-US', { weekday: 'long' });
                  const isToday = day === todayDayName;
                  
                  // Determine temporal status (past, today, future)
                  const dayOrder = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                  const todayIndex = dayOrder.indexOf(todayDayName);
                  const thisDayIndex = dayOrder.indexOf(day);
                  const isPast = thisDayIndex < todayIndex;
                  const isFuture = thisDayIndex > todayIndex;
                  
                  // Progressive emphasis styling
                  let cardStyle, titleColor, titleShadow, themeColor, borderColor, borderWidth, shadowStyle, dividerColor;
                  
                  if (isToday) {
                    // TODAY: Full opacity, subtle glow, stronger border, lifted shadow
                    cardStyle = weeklyPlan[day].length > 0 
                      ? 'linear-gradient(135deg, rgba(70, 15, 15, 0.22) 0%, rgba(45, 10, 10, 0.38) 50%, rgba(28, 8, 8, 0.52) 100%)'
                      : 'linear-gradient(to bottom, rgba(42, 36, 28, 0.97), rgba(26, 22, 18, 0.97))';
                    titleColor = '#D4AF37'; // Standard gold to match other tabs
                    titleShadow = '0 0 8px rgba(212, 175, 55, 0.6)'; // Sharper shadow, slightly stronger
                    themeColor = '#DAA520';
                    borderColor = '#D4AF37';
                    borderWidth = '2px';
                    shadowStyle = weeklyPlan[day].length > 0
                      ? '0 8px 16px rgba(0, 0, 0, 0.5), 0 0 20px rgba(70, 15, 15, 0.15)'
                      : '0 0 30px rgba(212, 175, 55, 0.3), inset 0 0 60px rgba(212, 175, 55, 0.1)';
                    dividerColor = 'rgba(212, 175, 55, 0.5)';
                  } else if (isFuture) {
                    // FUTURE: 70% opacity, no glow, thinner border, muted colors
                    cardStyle = 'linear-gradient(135deg, rgba(15, 23, 42, 0.55) 0%, rgba(30, 41, 59, 0.42) 100%)';
                    titleColor = 'rgba(192, 192, 192, 0.75)'; // +5% brightness for legibility
                    titleShadow = 'none';
                    themeColor = 'rgba(156, 163, 175, 0.6)';
                    borderColor = 'rgba(100, 116, 139, 0.35)';
                    borderWidth = '1px';
                    shadowStyle = '0 2px 4px rgba(0, 0, 0, 0.2)';
                    dividerColor = 'rgba(156, 163, 175, 0.25)';
                  } else {
                    // PAST: 50% opacity, desaturated, subdued, no emphasis
                    cardStyle = 'linear-gradient(135deg, rgba(15, 23, 42, 0.4) 0%, rgba(30, 41, 59, 0.3) 100%)';
                    titleColor = 'rgba(156, 163, 175, 0.55)'; // +5% brightness for legibility
                    titleShadow = 'none';
                    themeColor = 'rgba(156, 163, 175, 0.4)';
                    borderColor = 'rgba(100, 116, 139, 0.25)';
                    borderWidth = '1px';
                    shadowStyle = '0 1px 2px rgba(0, 0, 0, 0.15)';
                    dividerColor = 'rgba(156, 163, 175, 0.2)';
                  }
                  
                  return (
                  <div 
                    key={day} 
                    className="rounded-lg p-6 relative overflow-hidden transition-all duration-300" 
                    style={{
                      background: cardStyle,
                      borderColor: borderColor,
                      borderWidth: borderWidth,
                      borderStyle: 'solid',
                      boxShadow: shadowStyle,
                      opacity: isPast ? 0.85 : 1
                    }}
                  >
                    {/* Day header with medieval styling */}
                    <div className="flex justify-between items-center mb-4 relative z-10">
                      <div className="flex-1 text-center">
                        <div className="mb-2">
                          <h3 className="text-2xl font-bold uppercase mb-1" style={{
                            color: titleColor,
                            fontFamily: 'Cinzel, serif',
                            letterSpacing: '0.15em',
                            textShadow: titleShadow
                          }}>
                            {day}
                          </h3>
                          {dayTheme.theme && (
                            <p className="text-xs italic mt-1" style={{color: themeColor}}>
                              "{dayTheme.theme}"
                            </p>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <div style={{width: '60px', height: '1px', background: `linear-gradient(to right, transparent, ${dividerColor})`}}></div>
                          <span style={{color: dividerColor, fontSize: '8px'}}>◆</span>
                          <div style={{width: '60px', height: '1px', background: `linear-gradient(to left, transparent, ${dividerColor})`}}></div>
                        </div>
                        
                        <p className="text-xs mb-2">
                          {isToday ? (
                            <span className="font-bold px-3 py-1 rounded-lg" style={{
                              color: '#1C1C1C',
                              background: 'linear-gradient(to right, #D4AF37, #DAA520)',
                              boxShadow: '0 2px 8px rgba(212, 175, 55, 0.4)'
                            }}>
                              TODAY
                            </span>
                          ) : (
                            <span style={{color: '#9CA3AF'}}>
                              {getNextDayOfWeek(day).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                          )}
                        </p>
                        
                        {weeklyPlan[day].length === 0 && (
                          <div className="mt-4 p-3 rounded-lg border border-dashed" style={{
                            borderColor: isToday ? 'rgba(212, 175, 55, 0.3)' : 'rgba(156, 163, 175, 0.2)',
                            backgroundColor: 'rgba(0, 0, 0, 0.2)'
                          }}>
                            <p className="text-sm italic" style={{
                              color: isToday ? 'rgba(156, 163, 175, 0.8)' : 'rgba(156, 163, 175, 0.5)'
                            }}>
                              No battles planned... yet.
                            </p>
                          </div>
                        )}
                      </div>
                      
                      <button 
                        onClick={() => { setSelectedDay(day); setShowPlanModal(true); }} 
                        className="px-4 py-2 rounded-lg text-sm transition-all flex items-center gap-2 ml-4" 
                        style={{
                          background: isToday 
                            ? 'rgba(0, 0, 0, 0.5)' 
                            : isFuture
                              ? 'linear-gradient(to bottom, rgba(120, 53, 15, 0.7), rgba(92, 40, 11, 0.7))'
                              : 'linear-gradient(to bottom, rgba(100, 43, 12, 0.6), rgba(76, 33, 9, 0.6))',
                          borderColor: isToday ? '#D4AF37' : isFuture ? 'rgba(212, 175, 55, 0.6)' : 'rgba(212, 175, 55, 0.45)',
                          borderWidth: isToday ? '2px' : '1.5px',
                          borderStyle: 'solid',
                          color: isToday ? '#D4AF37' : isFuture ? 'rgba(212, 175, 55, 0.85)' : 'rgba(192, 192, 192, 0.7)',
                          boxShadow: isToday ? '0 0 15px rgba(212, 175, 55, 0.3)' : 'none'
                        }} 
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = isToday 
                            ? 'rgba(0, 0, 0, 0.7)' 
                            : isFuture
                              ? 'linear-gradient(to bottom, rgba(120, 53, 15, 0.85), rgba(92, 40, 11, 0.85))'
                              : 'linear-gradient(to bottom, rgba(100, 43, 12, 0.75), rgba(76, 33, 9, 0.75))';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                        }} 
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = isToday 
                            ? 'rgba(0, 0, 0, 0.5)' 
                            : isFuture
                              ? 'linear-gradient(to bottom, rgba(120, 53, 15, 0.7), rgba(92, 40, 11, 0.7))'
                              : 'linear-gradient(to bottom, rgba(100, 43, 12, 0.6), rgba(76, 33, 9, 0.6))';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                      >
                        <Plus size={16}/> ADD TASK
                      </button>
                    </div>
                    
                    {weeklyPlan[day].length > 0 && (
                      <div className="space-y-2">
                      {[...weeklyPlan[day]].sort((a, b) => {
  // Incomplete tasks first, completed tasks last
  if (!a.completed && b.completed) return -1;
  if (a.completed && !b.completed) return 1;
  
  // Among incomplete: sort by priority
  if (!a.completed && !b.completed) {
    if (a.priority === 'important' && b.priority !== 'important') return -1;
    if (a.priority !== 'important' && b.priority === 'important') return 1;
  }
  return 0;
})
.filter(item => !hidePlannerCompleted || !item.completed)
.map((item) => {
  const idx = weeklyPlan[day].indexOf(item);
  return (
    <div 
      key={idx} 
      className={`rounded-lg p-4 transition-all duration-300 ${
        item.completed 
          ? 'opacity-60' 
          : ''
      }`}
      style={{
        background: item.completed 
          ? 'rgba(30, 41, 59, 0.4)' 
          : item.priority === 'important'
            ? 'linear-gradient(to right, rgba(184, 134, 11, 0.15), rgba(31, 41, 55, 0.6))'
            : 'linear-gradient(to right, rgba(30, 58, 95, 0.2), rgba(31, 41, 55, 0.6))',
        borderColor: item.completed 
          ? 'rgba(34, 197, 94, 0.6)' 
          : item.priority === 'important'
            ? COLORS.gold
            : 'rgba(59, 130, 246, 0.5)',
        borderWidth: isToday ? '2px' : '1px',
        borderStyle: 'solid',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: item.priority === 'important' && !item.completed && isToday
          ? `0 0 20px ${COLORS.gold}99`
          : item.completed
            ? '0 1px 3px rgba(0, 0, 0, 0.1)'
            : isToday 
              ? '0 2px 4px rgba(0, 0, 0, 0.2)'
              : '0 1px 2px rgba(0, 0, 0, 0.15)',
        opacity: isPast ? 0.7 : 1,
        filter: isPast ? 'saturate(0.7)' : 'none'
      }}
      draggable={!item.completed}
      onDragStart={(e) => handlePlanDragStart(e, {...item, day})}
      onDragEnd={handlePlanDragEnd}
      onDragOver={handlePlanDragOver}
      onDrop={(e) => handlePlanDrop(e, item, day)}
    >
      {/* COMPLETED watermark - centered horizontally */}
      {item.completed && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{zIndex: 0}}>
          <span style={{
            fontSize: '3rem',
            fontWeight: 900,
            color: '#22C55E',
            opacity: 0.15,
            letterSpacing: '0.2em'
          }}>COMPLETED</span>
        </div>
      )}
      <div className="flex items-center gap-3" style={{position: 'relative', zIndex: 1}}>
        {!item.completed && (
          <div style={{opacity: 0.3, cursor: 'grab'}} onMouseEnter={(e) => e.currentTarget.style.opacity = 0.7} onMouseLeave={(e) => e.currentTarget.style.opacity = 0.3}>
            <GripVertical size={20} style={{color: '#C0C0C0'}}/>
          </div>
        )}
        <div className="flex-1">
          <p className={`font-medium ${item.completed ? 'line-through text-gray-500' : 'text-white'}`}>
            {item.title}
            {item.priority === 'important' && (
              <span className="text-xs ml-2" style={{color: COLORS.gold}}>• IMPORTANT</span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => {
              const today = new Date();
              const todayDayName = today.toLocaleDateString('en-US', { weekday: 'long' });
              const isToday = day === todayDayName;
              
              const confirmMsg = isToday 
                ? `Delete "${item.title}" from today's plan? This will also remove it from your quest tasks.`
                : `Delete "${item.title}" from ${day}'s plan?`;
              
              if (window.confirm(confirmMsg)) {
                // Remove from weekly plan
                setWeeklyPlan(prev => ({
                  ...prev,
                  [day]: prev[day].filter((_, i) => i !== idx)
                }));
                
                // Only remove from quest tab if deleting from today
                if (isToday) {
                  setTasks(prevTasks => prevTasks.filter(t => t.title !== item.title));
                  addLog(`Deleted "${item.title}" from today's plan and tasks`);
                } else {
                  addLog(`Deleted "${item.title}" from ${day} plan`);
                }
              }
            }}
            className="text-red-400 hover:text-red-300"
          >
            <X size={16}/>
          </button>
        </div>
      </div>
    </div>
  );
})}
    
                      </div>
                    )}
                  </div>
                  );
                })}
              </div>
              
              {/* Hide completed tasks toggle - global for all days */}
              {Object.values(weeklyPlan).some(dayTasks => dayTasks.some(t => t.completed)) && (
                <div className="flex items-center justify-center gap-2 py-3 mt-4">
                  <input 
                    type="checkbox" 
                    id="hidePlannerCompleted"
                    checked={hidePlannerCompleted}
                    onChange={(e) => setHidePlannerCompleted(e.target.checked)}
                    className="w-4 h-4 cursor-pointer"
                    style={{accentColor: '#D4AF37'}}
                  />
                  <label 
                    htmlFor="hidePlannerCompleted" 
                    className="text-sm cursor-pointer"
                    style={{color: '#C0C0C0'}}
                  >
                    Hide completed tasks
                  </label>
                </div>
              )}
              </>
              )}
              
              {/* Calendar Content */}
              {plannerSubTab === 'calendar' && (
              <div>
              <div className="flex justify-between items-center mb-6">
                <button onClick={() => { if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1); } else { setCurrentMonth(currentMonth - 1); } }} className="px-4 py-2 rounded-lg transition-all border-2 font-bold" style={{
                  background: 'linear-gradient(to bottom, rgba(51, 65, 85, 0.7), rgba(30, 41, 59, 0.8))',
                  borderColor: 'rgba(100, 116, 139, 0.6)',
                  color: '#F5F5DC',
                  cursor: 'pointer'
                }} onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(to bottom, rgba(71, 85, 105, 0.8), rgba(51, 65, 85, 0.9))';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }} onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(to bottom, rgba(51, 65, 85, 0.7), rgba(30, 41, 59, 0.8))';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}>
                  ← PREV
                </button>
                <h3 className="text-2xl font-bold uppercase tracking-wider" style={{color: '#F5F5DC'}}>{new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long' }).toUpperCase()} {currentYear}</h3>
                <button onClick={() => { if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1); } else { setCurrentMonth(currentMonth + 1); } }} className="px-4 py-2 rounded-lg transition-all border-2 font-bold" style={{
                  background: 'linear-gradient(to bottom, rgba(51, 65, 85, 0.7), rgba(30, 41, 59, 0.8))',
                  borderColor: 'rgba(100, 116, 139, 0.6)',
                  color: '#F5F5DC',
                  cursor: 'pointer'
                }} onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(to bottom, rgba(71, 85, 105, 0.8), rgba(51, 65, 85, 0.9))';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }} onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(to bottom, rgba(51, 65, 85, 0.7), rgba(30, 41, 59, 0.8))';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}>
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
                      const isToday = isCurrentMonth && today.getDate() === day;
                      const isPast = isCurrentMonth ? day < today.getDate() : (currentYear < today.getFullYear() || (currentYear === today.getFullYear() && currentMonth < today.getMonth()));
                      const isFuture = isCurrentMonth ? day > today.getDate() : (currentYear > today.getFullYear() || (currentYear === today.getFullYear() && currentMonth > today.getMonth()));
                      
                      // Progressive emphasis styling
                      let bgColor, borderColor, borderWidth, textColor, shadowStyle;
                      
                      if (isToday) {
                        // TODAY: Bright gold, subtle glow, sharp
                        bgColor = 'rgba(234, 179, 8, 0.4)';
                        borderColor = '#E8C547'; // Brighter gold like day titles
                        borderWidth = '2px';
                        textColor = '#E8C547'; // Bright gold text
                        shadowStyle = '0 0 12px rgba(234, 179, 8, 0.4), 0 2px 4px rgba(0, 0, 0, 0.3)';
                      } else if (isFuture) {
                        // FUTURE: 80-85% brightness, clear, readable
                        bgColor = 'rgba(30, 41, 59, 0.5)';
                        borderColor = 'rgba(100, 116, 139, 0.4)';
                        borderWidth = '1px';
                        textColor = 'rgba(245, 245, 220, 0.85)'; // 85% brightness
                        shadowStyle = '0 1px 3px rgba(0, 0, 0, 0.15)';
                      } else if (isPast) {
                        // PAST: 60-70% brightness, muted, subdued
                        bgColor = 'rgba(30, 41, 59, 0.3)';
                        borderColor = 'rgba(100, 116, 139, 0.25)';
                        borderWidth = '1px';
                        textColor = 'rgba(156, 163, 175, 0.65)'; // 65% brightness
                        shadowStyle = '0 1px 2px rgba(0, 0, 0, 0.1)';
                      } else {
                        // OTHER MONTH: Very muted
                        bgColor = 'rgba(30, 41, 59, 0.3)';
                        borderColor = 'rgba(51, 65, 85, 0.3)';
                        borderWidth = '1px';
                        textColor = 'rgba(156, 163, 175, 0.5)';
                        shadowStyle = '0 1px 2px rgba(0, 0, 0, 0.1)';
                      }
                      
                      days.push(
                        <button 
                          key={day} 
                          onClick={() => { setSelectedDate(dateKey); setShowCalendarModal(true); }} 
                          className="aspect-square rounded-lg p-2 transition-all hover:scale-105 relative flex flex-col items-center justify-center"
                          style={{
                            backgroundColor: bgColor, 
                            borderColor: borderColor,
                            borderWidth: borderWidth,
                            borderStyle: 'solid',
                            boxShadow: shadowStyle
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(1.05)';
                            if (isToday) {
                              e.currentTarget.style.boxShadow = '0 0 16px rgba(234, 179, 8, 0.5), 0 4px 8px rgba(0, 0, 0, 0.3)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.boxShadow = shadowStyle;
                          }}
                        >
                          <div className="text-lg font-bold" style={{color: textColor}}>{day}</div>
                          {calendarFocus[dateKey] && (
                            <div className="text-sm mt-1 text-center truncate w-full px-1 font-bold" style={{color: '#EF4444'}}>
                              {calendarFocus[dateKey]}
                            </div>
                          )}
                          {calendarEvents[dateKey] && Array.isArray(calendarEvents[dateKey]) && calendarEvents[dateKey].length > 0 && (
                            <div className="text-xs mt-1 text-center w-full px-1" style={{
                              color: isToday ? 'rgba(218, 165, 32, 0.9)' : 'rgba(156, 163, 175, 0.7)'
                            }}>
                              {calendarEvents[dateKey].length} event{calendarEvents[dateKey].length > 1 ? 's' : ''}
                            </div>
                          )}
                          {isToday && (<div className="absolute top-1 right-1 w-2 h-2 rounded-full animate-pulse" style={{backgroundColor: '#FBBF24'}}></div>)}
                        </button>
                      );
                    }
                    return days;
                  })()}
                </div>
              </div>
              </div>
              )}
            </div>
          )}

          {activeTab === 'study' && (
  <div className="bg-black bg-opacity-50 rounded-xl p-6 border-2" style={{
    borderColor: 'rgba(212, 175, 55, 0.6)'
  }}>
    <div className="text-center mb-4">
      <h2 className="text-4xl font-bold mb-4" style={{color: '#D4AF37', letterSpacing: '0.15em'}}>KNOWLEDGE FORGE</h2>
      <div className="flex items-center justify-center gap-2">
        <div style={{width: '80px', height: '1px', background: 'linear-gradient(to right, transparent, rgba(212, 175, 55, 0.5))'}}></div>
        <span style={{color: 'rgba(212, 175, 55, 0.6)', fontSize: '8px'}}>◆</span>
        <div style={{width: '80px', height: '1px', background: 'linear-gradient(to left, transparent, rgba(212, 175, 55, 0.5))'}}></div>
      </div>
    </div>
    <p className="text-sm mb-6 italic text-center" style={{color: COLORS.silver}}>"Sharpen your mind, temper your wisdom..."</p>
    
    <div className="flex justify-between items-center mb-6">
      <div>
        <p className="text-lg" style={{color: '#F5F5DC'}}>Your Decks: <span className="font-bold" style={{color: '#D4AF37'}}>{flashcardDecks.length}</span></p>
        <p className="text-sm" style={{color: '#95A5A6'}}>Study to earn XP and loot!</p>
      </div>
      <button 
        onClick={() => setShowDeckModal(true)}
        className="px-4 py-2 rounded-lg transition-all flex items-center gap-2 border-2"
        style={{
          background: 'linear-gradient(to bottom, #B8860B, #8B6914)',
          borderColor: '#CD7F32',
          color: '#F5F5DC',
          boxShadow: '0 2px 8px rgba(184, 134, 11, 0.3)'
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(to bottom, #DAA520, #B8860B)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'linear-gradient(to bottom, #B8860B, #8B6914)'}
      >
        <Plus size={20}/> New Deck
      </button>
    </div>
    
    {flashcardDecks.length === 0 ? (
      <div className="text-center py-12 rounded-lg border-2" style={{
        background: 'rgba(0, 0, 0, 0.5)',
        borderColor: 'rgba(212, 175, 55, 0.6)'
      }}>
        <p className="mb-2 text-lg" style={{color: '#C0C0C0'}}>The forge stands empty...</p>
        <p className="text-sm" style={{color: '#95A5A6'}}>Create your first deck to begin forging knowledge</p>
      </div>
    ) : (
      <div className="space-y-4">
        {flashcardDecks.map((deck, idx) => (
          <div key={idx} className="rounded-lg p-4 border-2" style={{
            background: 'rgba(0, 0, 0, 0.55)',
            borderColor: 'rgba(212, 175, 55, 0.6)',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3), inset 0 0 30px rgba(212, 175, 55, 0.03)'
          }}>
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <h3 className="text-xl font-bold" style={{
                  color: '#D4AF37',
                  fontFamily: 'Cinzel, serif'
                }}>{deck.name}</h3>
                <p className="text-sm" style={{color: '#C0C0C0'}}>
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
                className="transition-all"
                style={{color: '#9B1B30'}}
                onMouseEnter={(e) => e.currentTarget.style.color = '#B8293E'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#9B1B30'}
              >
                <X size={20}/>
              </button>
            </div>
            
            {/* Add Card Button - Top */}
            <button
              onClick={() => {
                setSelectedDeck(idx);
                setShowCardModal(true);
              }}
              className="w-full py-2 rounded transition-all border-2 mb-2"
              style={{
                background: 'linear-gradient(to bottom, #B8860B, #8B6914)',
                borderColor: '#CD7F32',
                color: '#F5F5DC'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(to bottom, #DAA520, #B8860B)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'linear-gradient(to bottom, #B8860B, #8B6914)'}
            >
              Add Card
            </button>
            
            {deck.cards.length > 0 && (
              <div className="mt-1 pt-3" style={{borderTop: '1px solid rgba(212, 175, 55, 0.3)'}}>
                <p className="text-xs mb-2" style={{color: '#B8B8B8'}}>Cards in this deck:</p>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {deck.cards.map((card, cardIdx) => (
                    <div key={cardIdx} className="flex justify-between items-center text-sm rounded p-2" style={{
                      background: 'rgba(20, 20, 20, 0.6)',
                      border: '1px solid rgba(212, 175, 55, 0.3)'
                    }}>
                      <span className="flex-1 truncate" style={{color: '#F5F5DC'}}>
                        {card.mastered && '✓ '}{card.front}
                      </span>
                      <button
                        onClick={() => {
                          setFlashcardDecks(prev => prev.map((d, i) => 
                            i === idx ? {...d, cards: d.cards.filter((_, ci) => ci !== cardIdx)} : d
                          ));
                        }}
                        className="ml-2 transition-all"
                        style={{color: '#9B1B30'}}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#B8293E'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#9B1B30'}
                      >
                        <X size={14}/>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Study Mode Buttons - Bottom */}
            <div className="flex gap-2 mt-3">
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
                className="flex-1 py-2 rounded transition-all border-2 disabled:cursor-not-allowed"
                style={{
                  background: deck.cards.length === 0 ? '#2C3E50' : 'linear-gradient(to bottom, #2F5233, #1E3421)',
                  borderColor: deck.cards.length === 0 ? '#95A5A6' : '#C0C0C0',
                  color: '#F5F5DC',
                  opacity: deck.cards.length === 0 ? 0.5 : 1
                }}
                onMouseEnter={(e) => { if (deck.cards.length > 0) e.currentTarget.style.background = 'linear-gradient(to bottom, #3D6B45, #2F5233)'; }}
                onMouseLeave={(e) => { if (deck.cards.length > 0) e.currentTarget.style.background = 'linear-gradient(to bottom, #2F5233, #1E3421)'; }}
              >
                Review
              </button>
              <button
                onClick={() => {
                  if (deck.cards.length < 4) {
                    alert('Need at least 4 cards for Match!');
                    return;
                  }
                  startMatchGame(idx);
                }}
                disabled={deck.cards.length < 4}
                className="flex-1 py-2 rounded transition-all border-2 disabled:cursor-not-allowed"
                style={{
                  background: deck.cards.length < 4 ? '#2C3E50' : 'linear-gradient(to bottom, #5C2E5C, #3D1F3D)',
                  borderColor: deck.cards.length < 4 ? '#95A5A6' : '#C0C0C0',
                  color: '#F5F5DC',
                  opacity: deck.cards.length < 4 ? 0.5 : 1
                }}
                onMouseEnter={(e) => { if (deck.cards.length >= 4) e.currentTarget.style.background = 'linear-gradient(to bottom, #7A3C7A, #5C2E5C)'; }}
                onMouseLeave={(e) => { if (deck.cards.length >= 4) e.currentTarget.style.background = 'linear-gradient(to bottom, #5C2E5C, #3D1F3D)'; }}
              >
                Match
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
                className="flex-1 py-2 rounded transition-all border-2 disabled:cursor-not-allowed"
                style={{
                  background: deck.cards.length < 4 ? '#2C3E50' : 'linear-gradient(to bottom, #1E3A5F, #152840)',
                  borderColor: deck.cards.length < 4 ? '#95A5A6' : '#C0C0C0',
                  color: '#F5F5DC',
                  opacity: deck.cards.length < 4 ? 0.5 : 1
                }}
                onMouseEnter={(e) => { if (deck.cards.length >= 4) e.currentTarget.style.background = 'linear-gradient(to bottom, #2B5082, #1E3A5F)'; }}
                onMouseLeave={(e) => { if (deck.cards.length >= 4) e.currentTarget.style.background = 'linear-gradient(to bottom, #1E3A5F, #152840)'; }}
              >
                Quiz
              </button>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
)}

          {activeTab === 'progress' && (
            <div className="bg-black bg-opacity-50 rounded-xl p-6 border-2" style={{borderColor: 'rgba(212, 175, 55, 0.6)'}}>
              {/* Header */}
              <div className="text-center mb-6">
                <h2 className="text-4xl font-bold mb-2" style={{color: '#D4AF37', letterSpacing: '0.15em'}}>TRIALS CONQUERED</h2>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div style={{width: '120px', height: '1px', background: 'linear-gradient(to right, transparent, rgba(212, 175, 55, 0.3))'}}></div>
                  <span style={{color: 'rgba(212, 175, 55, 0.4)', fontSize: '8px'}}>◆</span>
                  <div style={{width: '120px', height: '1px', background: 'linear-gradient(to left, transparent, rgba(212, 175, 55, 0.3))'}}></div>
                </div>
                <p className="text-xl" style={{color: '#D4AF37'}}>{unlockedAchievements.length} / {GAME_CONSTANTS.ACHIEVEMENTS.length}</p>
                
                {/* Progress bar */}
                <div className="mt-4 mx-auto max-w-md">
                  <div className="h-3 rounded-full overflow-hidden" style={{background: 'rgba(0, 0, 0, 0.4)'}}>
                    <div 
                      className="h-3 rounded-full transition-all duration-500"
                      style={{
                        width: `${(unlockedAchievements.length / GAME_CONSTANTS.ACHIEVEMENTS.length) * 100}%`,
                        background: 'linear-gradient(to right, #B8860B, #D4AF37, #FFD700)'
                      }}
                    ></div>
                  </div>
                </div>
              </div>
              
              {/* Category tabs */}
              <div className="flex justify-center gap-2 mb-6 flex-wrap">
                {Object.entries(GAME_CONSTANTS.ACHIEVEMENT_CATEGORIES).map(([key, cat]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedCategory(key)}
                    className="px-4 py-2 rounded-lg transition-all border-2 text-sm font-bold uppercase"
                    style={{
                      backgroundColor: selectedCategory === key ? 'rgba(212, 175, 55, 0.3)' : 'rgba(0, 0, 0, 0.3)',
                      borderColor: selectedCategory === key ? '#D4AF37' : 'rgba(212, 175, 55, 0.3)',
                      color: selectedCategory === key ? '#D4AF37' : COLORS.silver
                    }}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
              {/* Achievement Grid */}
              <div className="max-w-5xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {GAME_CONSTANTS.ACHIEVEMENTS
                    .filter(ach => selectedCategory === 'ALL' || ach.category === selectedCategory)
                    .map(achievement => {
                      const isUnlocked = unlockedAchievements.includes(achievement.id);
                      const statValue = achievementStats[achievement.req.type] || 0;
                      const progress = Math.min(statValue / achievement.req.count, 1);
                      const rarityColor = GAME_CONSTANTS.RARITY_COLORS[achievement.rarity];
                      
                      return (
                        <div
                          key={achievement.id}
                          className="rounded-lg p-3 border-2 transition-all relative overflow-hidden"
                          style={{
                            background: isUnlocked 
                              ? `linear-gradient(135deg, rgba(60, 10, 10, 0.9), rgba(80, 20, 20, 0.9), rgba(40, 0, 0, 0.9))`
                              : 'linear-gradient(135deg, rgba(25, 25, 25, 0.8), rgba(35, 35, 35, 0.8), rgba(20, 20, 20, 0.8))',
                            borderColor: isUnlocked ? rarityColor : 'rgba(100, 100, 100, 0.3)',
                            borderWidth: '2px',
                            borderStyle: 'double',
                            opacity: isUnlocked ? 1 : 0.7,
                            boxShadow: isUnlocked 
                              ? `0 0 20px ${rarityColor}60, inset 0 0 30px rgba(0,0,0,0.5)` 
                              : 'inset 0 0 20px rgba(0,0,0,0.4)'
                          }}
                        >
                          {/* Decorative corner elements */}
                          {isUnlocked && (
                            <>
                              <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '30px',
                                height: '30px',
                                borderTop: `3px solid ${rarityColor}40`,
                                borderLeft: `3px solid ${rarityColor}40`,
                              }}></div>
                              <div style={{
                                position: 'absolute',
                                top: 0,
                                right: 0,
                                width: '30px',
                                height: '30px',
                                borderTop: `3px solid ${rarityColor}40`,
                                borderRight: `3px solid ${rarityColor}40`,
                              }}></div>
                              <div style={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                width: '30px',
                                height: '30px',
                                borderBottom: `3px solid ${rarityColor}40`,
                                borderLeft: `3px solid ${rarityColor}40`,
                              }}></div>
                              <div style={{
                                position: 'absolute',
                                bottom: 0,
                                right: 0,
                                width: '30px',
                                height: '30px',
                                borderBottom: `3px solid ${rarityColor}40`,
                                borderRight: `3px solid ${rarityColor}40`,
                              }}></div>
                            </>
                          )}
                          
                          <div style={{position: 'relative', zIndex: 1}}>
                            <div className="flex items-center justify-between mb-1.5">
                              <h3 className="font-bold text-base flex-1" style={{
                                color: isUnlocked ? COLORS.gold : COLORS.silver,
                                textShadow: isUnlocked ? '0 0 8px rgba(212, 175, 55, 0.5)' : 'none',
                                letterSpacing: '0.02em'
                              }}>
                                {achievement.name}
                              </h3>
                              <span 
                                className="text-xs px-2 py-0.5 rounded uppercase font-bold ml-2"
                                style={{
                                  backgroundColor: `${rarityColor}30`,
                                  color: rarityColor,
                                  border: `1px solid ${rarityColor}`,
                                  textShadow: `0 0 5px ${rarityColor}80`
                                }}
                              >
                                {achievement.rarity}
                              </span>
                            </div>
                            
                            <p className="text-xs mb-2 italic" style={{
                              color: isUnlocked ? '#C0C0C0' : '#888',
                              lineHeight: '1.3'
                            }}>
                              {achievement.desc}
                            </p>
                            
                            {/* Progress bar for incremental achievements */}
                            {!isUnlocked && (
                              <div className="mb-2">
                                <div className="h-1.5 rounded-full overflow-hidden" style={{
                                  background: 'rgba(0, 0, 0, 0.6)',
                                  border: '1px solid rgba(100, 100, 100, 0.3)'
                                }}>
                                  <div 
                                    className="h-1.5 rounded-full transition-all"
                                    style={{
                                      width: `${progress * 100}%`,
                                      background: `linear-gradient(to right, ${rarityColor}60, ${rarityColor})`,
                                      boxShadow: `0 0 8px ${rarityColor}80`
                                    }}
                                  ></div>
                                </div>
                                <p className="text-xs mt-0.5" style={{
                                  color: rarityColor,
                                  fontWeight: 'bold'
                                }}>
                                  {statValue} / {achievement.req.count}
                                </p>
                              </div>
                            )}
                            
                            {/* Rewards - compact display */}
                            <div className="mt-2 pt-2" style={{
                              borderTop: `1px solid ${isUnlocked ? 'rgba(212, 175, 55, 0.3)' : 'rgba(100, 100, 100, 0.2)'}`
                            }}>
                              <div className="flex items-center gap-1.5 flex-wrap text-xs font-bold" style={{
                                color: isUnlocked ? COLORS.gold : '#666'
                              }}>
                                {achievement.reward.xp && (
                                  <span className="px-1.5 py-0.5 rounded" style={{
                                    background: 'rgba(0, 0, 0, 0.4)',
                                    border: '1px solid rgba(100, 100, 100, 0.3)'
                                  }}>
                                    +{achievement.reward.xp} XP
                                  </span>
                                )}
                                {achievement.reward.maxHP && (
                                  <span className="px-1.5 py-0.5 rounded" style={{
                                    background: 'rgba(139, 0, 0, 0.3)',
                                    border: '1px solid rgba(220, 20, 60, 0.5)'
                                  }}>
                                    +{achievement.reward.maxHP} HP
                                  </span>
                                )}
                                {achievement.reward.maxSP && (
                                  <span className="px-1.5 py-0.5 rounded" style={{
                                    background: 'rgba(0, 100, 200, 0.3)',
                                    border: '1px solid rgba(100, 149, 237, 0.5)'
                                  }}>
                                    +{achievement.reward.maxSP} SP
                                  </span>
                                )}
                                {achievement.reward.weapon && (
                                  <span className="px-1.5 py-0.5 rounded" style={{
                                    background: 'rgba(255, 140, 0, 0.3)',
                                    border: '1px solid rgba(255, 140, 0, 0.5)'
                                  }}>
                                    +{achievement.reward.weapon} ATK
                                  </span>
                                )}
                                {achievement.reward.armor && (
                                  <span className="px-1.5 py-0.5 rounded" style={{
                                    background: 'rgba(46, 139, 87, 0.3)',
                                    border: '1px solid rgba(46, 139, 87, 0.5)'
                                  }}>
                                    +{achievement.reward.armor} DEF
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'legacy' && (
            <div className="space-y-6">
              {/* Main Page Header */}
              <div className="text-center mb-6">
                <h2 className="text-4xl font-bold mb-4" style={{color: '#D4AF37', letterSpacing: '0.15em'}}>HALL OF LEGENDS</h2>
                <div className="flex items-center justify-center gap-2">
                  <div style={{width: '80px', height: '1px', background: 'linear-gradient(to right, transparent, rgba(212, 175, 55, 0.5))'}}></div>
                  <span style={{color: 'rgba(212, 175, 55, 0.6)', fontSize: '8px'}}>◆</span>
                  <div style={{width: '80px', height: '1px', background: 'linear-gradient(to left, transparent, rgba(212, 175, 55, 0.5))'}}></div>
                </div>
                <p className="text-sm mb-6 italic text-center" style={{color: COLORS.silver}}>"Remember the fallen... Honor the victorious..."</p>
              </div>
              
              {/* The Liberated Section */}
              <div className="bg-black bg-opacity-50 rounded-xl p-6 border-2" style={{borderColor: 'rgba(212, 175, 55, 0.6)'}}>
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-yellow-400 mb-2">THE LIBERATED</h2>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <div style={{width: '150px', height: '1px', background: 'linear-gradient(to right, transparent, rgba(250, 204, 21, 0.3))'}}></div>
                    <span style={{color: 'rgba(250, 204, 21, 0.4)', fontSize: '8px'}}>◆</span>
                    <div style={{width: '150px', height: '1px', background: 'linear-gradient(to left, transparent, rgba(250, 204, 21, 0.3))'}}></div>
                  </div>
                  <p className="text-green-400 text-sm italic">"Those who broke free from the curse..."</p>
                </div>
                {heroes.length === 0 ? (<div className="text-center py-12"><Trophy size={64} className="mx-auto mb-4 text-gray-700"/><p className="text-gray-400">None have escaped the curse... yet.</p><p className="text-sm text-gray-500 mt-2">Survive all 7 days to break free!</p></div>) : (<div className="space-y-4">{heroes.slice().reverse().map((hero, i) => (<div key={i} className={`bg-gradient-to-r ${hero.class ? hero.class.gradient[3] : 'from-yellow-900'} ${hero.class && hero.class.color === 'yellow' ? 'to-orange-400' : hero.class && hero.class.color === 'red' ? 'to-orange-500' : hero.class && hero.class.color === 'purple' ? 'to-pink-500' : hero.class && hero.class.color === 'green' ? 'to-teal-500' : 'to-yellow-500'} rounded-lg p-6 border-4 border-yellow-400 shadow-2xl shadow-yellow-500/50`}><div className="flex items-center gap-4"><div className="text-6xl animate-pulse">{hero.class ? hero.class.emblem : '✨'}</div><div className="flex-1"><h3 className="text-2xl font-bold text-white">{hero.name}</h3><p className="text-xl text-white text-opacity-90">{hero.title} {hero.class ? hero.class.name : ''}</p><p className="text-white">Level {hero.lvl} • {hero.xp} XP</p>{hero.skipCount !== undefined && hero.skipCount === 0 && (<p className="text-green-300 font-bold mt-1">✨ FLAWLESS RUN - No skips!</p>)}{hero.skipCount > 0 && (<p className="text-yellow-200 text-sm mt-1">Overcame {hero.skipCount} skip{hero.skipCount > 1 ? 's' : ''}</p>)}<p className="text-yellow-300 font-bold mt-2">✨ CURSE BROKEN ✨</p><p className="text-green-400 text-sm italic">"Free at last from the eternal torment..."</p></div></div></div>))}</div>)}
              </div>
              
              {/* The Consumed Section */}
              <div className="bg-black bg-opacity-50 rounded-xl p-6 border-2" style={{borderColor: 'rgba(212, 175, 55, 0.6)'}}>
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-400 mb-2">THE CONSUMED</h2>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <div style={{width: '150px', height: '1px', background: 'linear-gradient(to right, transparent, rgba(156, 163, 175, 0.3))'}}></div>
                    <span style={{color: 'rgba(156, 163, 175, 0.4)', fontSize: '8px'}}>◆</span>
                    <div style={{width: '150px', height: '1px', background: 'linear-gradient(to left, transparent, rgba(156, 163, 175, 0.3))'}}></div>
                  </div>
                  <p className="text-red-400 text-sm italic">"Those who fell to the curse..."</p>
                </div>
                {graveyard.length === 0 ? (<div className="text-center py-12"><Skull size={64} className="mx-auto mb-4 text-gray-700"/><p className="text-gray-500">No fallen heroes... yet.</p></div>) : (<div className="space-y-4">{graveyard.slice().reverse().map((fallen, i) => (<div key={i} className="bg-gray-900 rounded-lg p-4 border-2 border-red-900 opacity-70 hover:opacity-90 transition-opacity"><div className="flex items-center gap-4"><div className="text-4xl opacity-50">{fallen.class ? fallen.class.emblem : '☠️'}</div><div className="flex-1"><h3 className="text-xl font-bold text-red-400">{fallen.name}</h3><p className="text-gray-400">{fallen.title} {fallen.class ? fallen.class.name : ''} • Level {fallen.lvl}</p><p className="text-red-300">Fell on {fallen.day ? GAME_CONSTANTS.DAY_NAMES[fallen.day - 1]?.name || `Day ${fallen.day}` : 'Day 1'} • {fallen.xp} XP earned</p><p className="text-gray-300">Trials completed: {fallen.tasks}/{fallen.total}</p>{fallen.skipCount > 0 && (<p className="text-red-400 text-sm mt-1">💀 Skipped {fallen.skipCount} day{fallen.skipCount > 1 ? 's' : ''}</p>)}{fallen.cursed && (<p className="text-purple-400 text-sm">🌑 Died while cursed</p>)}<p className="text-red-500 text-sm italic mt-2">"The curse claimed another soul..."</p></div></div></div>))}</div>)}
              </div>
            </div>
          )}

          {showInventoryModal && (
            <div className="fixed inset-0 bg-black bg-opacity-90 flex items-start justify-center p-4 z-50 overflow-y-auto" onClick={() => setShowInventoryModal(false)}>
              <div className="rounded-xl p-6 max-w-lg w-full border-2 relative my-8" style={{background: VISUAL_STYLES.modal.paper, borderColor: COLORS.silver, boxShadow: VISUAL_STYLES.shadow.elevated}} onClick={e => e.stopPropagation()}>
                <button 
                  onClick={() => setShowInventoryModal(false)} 
                  className="absolute top-4 right-4 p-2 rounded-lg border-2 transition-all"
                  style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    borderColor: 'rgba(212, 175, 55, 0.4)',
                    color: '#D4AF37'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
                    e.currentTarget.style.borderColor = '#D4AF37';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
                    e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.4)';
                  }}
                >
                  <X size={20}/>
                </button>
                
                <div className="text-center mb-6">
                  <h2 className="text-3xl font-bold mb-2" style={{color: COLORS.gold, letterSpacing: '0.1em'}}>SUPPLIES</h2>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <div style={{width: '120px', height: '1px', background: `linear-gradient(to right, transparent, rgba(212, 175, 55, 0.3))`}}></div>
                    <span style={{color: 'rgba(212, 175, 55, 0.4)', fontSize: '8px'}}>◆</span>
                    <div style={{width: '120px', height: '1px', background: `linear-gradient(to left, transparent, rgba(212, 175, 55, 0.3))`}}></div>
                  </div>
                  <p className="text-sm mt-2 italic" style={{color: COLORS.silver}}>"What keeps you alive in the darkness..."</p>
                </div>
                
                {/* Tabs */}
                <div className="grid grid-cols-4 gap-2 mb-6">
                  <button
                    onClick={() => setSuppliesTab('potions')}
                    className="py-2 rounded-lg font-bold uppercase text-sm transition-all border-2"
                    style={{
                      backgroundColor: suppliesTab === 'potions' ? 'rgba(139, 0, 0, 0.8)' : 'rgba(139, 0, 0, 0.3)',
                      borderColor: suppliesTab === 'potions' ? '#8B0000' : 'rgba(139, 0, 0, 0.5)',
                      color: '#F5F5DC'
                    }}
                  >
                    Potions
                  </button>
                  <button
                    onClick={() => setSuppliesTab('weapons')}
                    className="py-2 rounded-lg font-bold uppercase text-sm transition-all border-2"
                    style={{
                      backgroundColor: suppliesTab === 'weapons' ? 'rgba(192, 192, 192, 0.8)' : 'rgba(192, 192, 192, 0.3)',
                      borderColor: suppliesTab === 'weapons' ? '#C0C0C0' : 'rgba(192, 192, 192, 0.5)',
                      color: '#F5F5DC'
                    }}
                  >
                    Weapons
                  </button>
                  <button
                    onClick={() => setSuppliesTab('armor')}
                    className="py-2 rounded-lg font-bold uppercase text-sm transition-all border-2"
                    style={{
                      backgroundColor: suppliesTab === 'armor' ? 'rgba(184, 134, 11, 0.8)' : 'rgba(184, 134, 11, 0.3)',
                      borderColor: suppliesTab === 'armor' ? '#B8860B' : 'rgba(184, 134, 11, 0.5)',
                      color: '#F5F5DC'
                    }}
                  >
                    Armor
                  </button>
                  <button
                    onClick={() => setSuppliesTab('gear')}
                    className="py-2 rounded-lg font-bold uppercase text-sm transition-all border-2"
                    style={{
                      backgroundColor: suppliesTab === 'gear' ? 'rgba(75, 0, 130, 0.8)' : 'rgba(75, 0, 130, 0.3)',
                      borderColor: suppliesTab === 'gear' ? '#4B0082' : 'rgba(75, 0, 130, 0.5)',
                      color: '#F5F5DC'
                    }}
                  >
                    Gear
                  </button>
                </div>
                
                <div className="space-y-4">
                  {suppliesTab === 'potions' ? (
                    <>
                  {/* Health Potions */}
                  <div className="rounded-lg p-4 border-2" style={{backgroundColor: 'rgba(100, 0, 0, 0.2)', borderColor: 'rgba(139, 0, 0, 0.5)'}}>
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <p className="font-bold text-lg" style={{color: '#F5F5DC'}}>Health Potion</p>
                        <p className="text-sm mb-1" style={{color: '#FF6B6B'}}>Restores 30 HP</p>
                        <p className="text-xs italic" style={{color: COLORS.silver}}>"Crimson elixir. Mends wounds."</p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold mb-2" style={{color: '#FF6B6B', opacity: 0.9}}>{healthPots}</p>
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
                  <div className="rounded-lg p-4 border-2" style={{backgroundColor: 'rgba(30, 58, 95, 0.25)', borderColor: 'rgba(30, 58, 95, 0.5)'}}>
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <p className="font-bold text-lg" style={{color: '#F5F5DC'}}>Stamina Potion</p>
                        <p className="text-sm mb-1" style={{color: '#6BB6FF'}}>Restores 50% SP</p>
                        <p className="text-xs italic" style={{color: COLORS.silver}}>"Azure draught. Vigor renewed."</p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold mb-2" style={{color: '#6BB6FF', opacity: 0.9}}>{staminaPots}</p>
                        <button 
                          onClick={() => { 
                            if (staminaPots > 0 && stamina < getMaxStamina()) { 
                              setStaminaPots(s => s - 1);
                              const maxStamina = getMaxStamina();
                              const restoreAmount = Math.max(
                                GAME_CONSTANTS.STAMINA_POTION_MIN,
                                Math.floor(maxStamina * (GAME_CONSTANTS.STAMINA_POTION_RESTORE_PERCENT / 100))
                              );
                              setStamina(s => Math.min(maxStamina, s + restoreAmount)); 
                              addLog(`Used Stamina Potion! +${restoreAmount} SP`); 
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
                  <div className={`rounded-lg p-4 border-2 ${curseLevel > 0 ? 'animate-pulse' : ''}`} style={{backgroundColor: 'rgba(107, 44, 145, 0.2)', borderColor: curseLevel > 0 ? 'rgba(138, 59, 181, 0.6)' : 'rgba(107, 44, 145, 0.4)', boxShadow: curseLevel > 0 ? VISUAL_STYLES.shadow.glow('#8A3BB5', 0.15) : 'none'}}>
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <p className="font-bold text-lg" style={{color: '#F5F5DC'}}>Cleanse Potion</p>
                        <p className="text-sm mb-1" style={{color: '#B794F4'}}>Removes 1 curse level</p>
                        <p className="text-xs italic" style={{color: COLORS.silver}}>"Purifying brew. Breaks the hold."</p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold mb-2" style={{color: '#B794F4', opacity: 0.9}}>{cleansePots}</p>
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
                        <p className="font-bold text-lg mb-1" style={{color: '#F5F5DC'}}>Fortune Philter</p>
                        <p className="text-sm mb-1" style={{color: '#68D391'}}>2x loot from next elite boss</p>
                        <p className="text-xs italic" style={{color: COLORS.silver}}>"Fortune favors the bold."</p>
                        <p className="text-xs mt-2" style={{color: '#68D391'}}>Active</p>
                      </div>
                    </div>
                  )}
                    </>
                  ) : suppliesTab === 'weapons' ? (
                    <>
                  {/* Weapon Section */}
                  <div className="rounded-lg p-4 border-2 mb-4" style={{backgroundColor: 'rgba(100, 0, 0, 0.2)', borderColor: 'rgba(120, 0, 0, 0.5)'}}>
                    <h3 className="font-bold text-lg mb-3 text-center" style={{color: '#FF6B6B'}}>EQUIPPED WEAPON</h3>
                    
                    <div className="rounded p-4 border-2 mb-3" style={{
                      backgroundColor: 'rgba(0, 0, 0, 0.4)', 
                      borderColor: equippedWeapon ? getRarityColor(equippedWeapon.rarity || 'common') : 'rgba(192, 192, 192, 0.3)',
                      boxShadow: equippedWeapon ? `0 0 15px ${getRarityColor(equippedWeapon.rarity || 'common')}50` : 'none'
                    }}>
                      {equippedWeapon ? (
                        <div>
                          <p className="text-xl font-bold text-center mb-1" style={{color: getRarityColor(equippedWeapon.rarity || 'common')}}>{equippedWeapon.name}</p>
                          {equippedWeapon.rarity && (
                            <p className="text-xs italic text-center mb-2" style={{color: getRarityColor(equippedWeapon.rarity)}}>
                              {GAME_CONSTANTS.RARITY_TIERS[equippedWeapon.rarity].name}
                            </p>
                          )}
                          <p className="text-base text-center mb-3" style={{color: '#68D391'}}>+{equippedWeapon.attack} Attack</p>
                          {equippedWeapon.affixes && Object.keys(equippedWeapon.affixes).length > 0 && (
                            <>
                              <div className="border-t mx-6 mb-3" style={{borderColor: 'rgba(192, 192, 192, 0.3)'}}></div>
                              <div className="space-y-1">
                                {equippedWeapon.affixes.flatDamage && (
                                  <p className="text-xs" style={{color: '#90EE90'}}>+{Math.floor(equippedWeapon.affixes.flatDamage)} Attack Damage</p>
                                )}
                                {equippedWeapon.affixes.percentDamage && (
                                  <p className="text-xs" style={{color: '#90EE90'}}>+{Math.floor(equippedWeapon.affixes.percentDamage)}% Bonus Damage</p>
                                )}
                                {equippedWeapon.affixes.critChance && (
                                  <p className="text-xs" style={{color: '#FFD700'}}>+{Math.floor(equippedWeapon.affixes.critChance)}% Critical Hit Chance</p>
                                )}
                                {equippedWeapon.affixes.critMultiplier && (
                                  <p className="text-xs" style={{color: '#FFD700'}}>+{equippedWeapon.affixes.critMultiplier.toFixed(1)}x Critical Hit Damage</p>
                                )}
                                {equippedWeapon.affixes.poisonChance && (
                                  <p className="text-xs" style={{color: '#9370DB'}}>+{Math.floor(equippedWeapon.affixes.poisonChance)}% Poison Chance</p>
                                )}
                                {equippedWeapon.affixes.poisonDamage && (
                                  <p className="text-xs" style={{color: '#9370DB'}}>+{Math.floor(equippedWeapon.affixes.poisonDamage)} Poison Damage per Turn</p>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm italic text-center" style={{color: '#95A5A6'}}>No weapon equipped</p>
                      )}
                    </div>
                    
                    <div className="text-center pt-2 border-t" style={{borderColor: 'rgba(192, 192, 192, 0.2)'}}>
                      <p className="text-sm" style={{color: COLORS.silver}}>
                        Total Attack: <span className="font-bold text-lg" style={{color: '#68D391'}}>{getBaseAttack()}</span>
                      </p>
                    </div>
                  </div>
                  
                  {/* Collected Weapons */}
                  {weaponInventory.length > 0 ? (
                    <div className="rounded-lg p-4 border-2 mb-4" style={{backgroundColor: 'rgba(107, 44, 145, 0.2)', borderColor: 'rgba(107, 44, 145, 0.5)'}}>
                      <h3 className="font-bold text-lg mb-2 text-center" style={{color: '#B794F4'}}>COLLECTED WEAPONS</h3>
                      <p className="text-xs text-center mb-3 italic" style={{color: COLORS.silver}}>Weapons found in battle or unequipped</p>
                      
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {sortByRarity(weaponInventory)
                          .map((wpn) => (
                          <div key={wpn.id} className="rounded p-3 border-2 flex justify-between items-center" style={{
                            backgroundColor: 'rgba(0, 0, 0, 0.4)', 
                            borderColor: getRarityColor(wpn.rarity || 'common'),
                            boxShadow: `0 0 10px ${getRarityColor(wpn.rarity || 'common')}40`
                          }}>
                            <div className="flex-1">
                              <p className="text-base font-bold text-center mb-1" style={{color: getRarityColor(wpn.rarity || 'common')}}>{wpn.name}</p>
                              {wpn.rarity && (
                                <p className="text-xs italic text-center mb-1" style={{color: getRarityColor(wpn.rarity)}}>
                                  {GAME_CONSTANTS.RARITY_TIERS[wpn.rarity].name}
                                </p>
                              )}
                              <p className="text-sm text-center mb-2" style={{color: '#68D391'}}>+{wpn.attack} Attack</p>
                              {wpn.affixes && Object.keys(wpn.affixes).length > 0 && (
                                <>
                                  <div className="border-t mx-4 mb-2" style={{borderColor: 'rgba(192, 192, 192, 0.3)'}}></div>
                                  <div className="space-y-0.5">
                                    {wpn.affixes.flatDamage && <p className="text-xs" style={{color: '#90EE90'}}>+{Math.floor(wpn.affixes.flatDamage)} Attack Damage</p>}
                                    {wpn.affixes.percentDamage && <p className="text-xs" style={{color: '#90EE90'}}>+{Math.floor(wpn.affixes.percentDamage)}% Bonus Damage</p>}
                                    {wpn.affixes.critChance && <p className="text-xs" style={{color: '#FFD700'}}>+{Math.floor(wpn.affixes.critChance)}% Critical Hit Chance</p>}
                                    {wpn.affixes.critMultiplier && <p className="text-xs" style={{color: '#FFD700'}}>+{wpn.affixes.critMultiplier.toFixed(1)}x Critical Hit Damage</p>}
                                    {wpn.affixes.poisonChance && <p className="text-xs" style={{color: '#9370DB'}}>+{Math.floor(wpn.affixes.poisonChance)}% Poison Chance</p>}
                                    {wpn.affixes.poisonDamage && <p className="text-xs" style={{color: '#9370DB'}}>+{Math.floor(wpn.affixes.poisonDamage)} Poison Damage per Turn</p>}
                                  </div>
                                </>
                              )}
                            </div>
                            <button
                              onClick={() => {
                                const oldWeapon = equippedWeapon;
                                setEquippedWeapon(wpn);
                                setWeaponInventory(prev => [
                                  ...prev.filter(w => w.id !== wpn.id),
                                  ...(oldWeapon ? [oldWeapon] : [])
                                ]);
                                addLog(`Equipped: ${wpn.name} (+${wpn.attack} Attack)`);
                                if (oldWeapon) {
                                  addLog(`Unequipped: ${oldWeapon.name}`);
                                }
                              }}
                              className="px-3 py-1 rounded-lg text-xs border-2 transition-all font-bold"
                              style={{
                                background: 'linear-gradient(to bottom, rgba(59, 130, 246, 0.7), rgba(29, 78, 216, 0.8))',
                                borderColor: '#3B82F6',
                                color: '#F5F5DC',
                                cursor: 'pointer'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'linear-gradient(to bottom, rgba(96, 165, 250, 0.8), rgba(59, 130, 246, 0.9))';
                                e.currentTarget.style.transform = 'translateY(-1px)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'linear-gradient(to bottom, rgba(59, 130, 246, 0.7), rgba(29, 78, 216, 0.8))';
                                e.currentTarget.style.transform = 'translateY(0)';
                              }}
                            >
                              Equip
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-lg p-6 border-2 text-center mb-4" style={{backgroundColor: 'rgba(107, 44, 145, 0.1)', borderColor: 'rgba(107, 44, 145, 0.3)'}}>
                      <p className="text-sm italic" style={{color: '#95A5A6'}}>No weapons collected yet. Defeat enemies to find weapons.</p>
                    </div>
                  )}
                    </>
                  ) : suppliesTab === 'armor' ? (
                    <>
                  {/* Equipment Section */}
                  <div className="rounded-lg p-4 border-2" style={{backgroundColor: 'rgba(184, 134, 11, 0.2)', borderColor: 'rgba(184, 134, 11, 0.5)'}}>
                    <h3 className="font-bold text-lg mb-3 text-center" style={{color: COLORS.gold}}>EQUIPPED ARMOR</h3>
                    
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      {/* Helmet */}
                      <div className="rounded p-3 border-2" style={{
                        backgroundColor: 'rgba(0, 0, 0, 0.4)', 
                        borderColor: equippedArmor.helmet ? getRarityColor(equippedArmor.helmet.rarity || 'common') : 'rgba(192, 192, 192, 0.3)',
                        boxShadow: equippedArmor.helmet ? `0 0 8px ${getRarityColor(equippedArmor.helmet.rarity || 'common')}40` : 'none'
                      }}>
                        <p className="text-xs uppercase mb-2 text-center font-bold" style={{color: COLORS.silver}}>Helmet</p>
                        {equippedArmor.helmet ? (
                          <div>
                            <p className="text-sm font-bold text-center mb-1" style={{color: getRarityColor(equippedArmor.helmet.rarity || 'common')}}>{equippedArmor.helmet.name}</p>
                            <p className="text-xs text-center mb-1" style={{color: '#68D391'}}>+{equippedArmor.helmet.defense} Defense</p>
                            {equippedArmor.helmet.affixes && Object.keys(equippedArmor.helmet.affixes).length > 0 && (
                              <>
                                <div className="border-t mx-2 mb-1 mt-2" style={{borderColor: 'rgba(192, 192, 192, 0.3)'}}></div>
                                <div className="space-y-0.5">
                                  {equippedArmor.helmet.affixes.flatArmor && <p className="text-xs" style={{color: '#68D391'}}>+{Math.floor(equippedArmor.helmet.affixes.flatArmor)} Armor</p>}
                                  {equippedArmor.helmet.affixes.percentDR && <p className="text-xs" style={{color: '#68D391'}}>+{Math.floor(equippedArmor.helmet.affixes.percentDR)}% Damage Reduction</p>}
                                  {equippedArmor.helmet.affixes.flatHP && <p className="text-xs" style={{color: '#68D391'}}>+{Math.floor(equippedArmor.helmet.affixes.flatHP)} Maximum Health</p>}
                                </div>
                              </>
                            )}
                          </div>
                        ) : (
                          <p className="text-xs italic text-center" style={{color: '#95A5A6'}}>Empty</p>
                        )}
                      </div>
                      
                      {/* Chest */}
                      <div className="rounded p-3 border-2" style={{
                        backgroundColor: 'rgba(0, 0, 0, 0.4)', 
                        borderColor: equippedArmor.chest ? getRarityColor(equippedArmor.chest.rarity || 'common') : 'rgba(192, 192, 192, 0.3)',
                        boxShadow: equippedArmor.chest ? `0 0 8px ${getRarityColor(equippedArmor.chest.rarity || 'common')}40` : 'none'
                      }}>
                        <p className="text-xs uppercase mb-2 text-center font-bold" style={{color: COLORS.silver}}>Chest</p>
                        {equippedArmor.chest ? (
                          <div>
                            <p className="text-sm font-bold text-center mb-1" style={{color: getRarityColor(equippedArmor.chest.rarity || 'common')}}>{equippedArmor.chest.name}</p>
                            <p className="text-xs text-center mb-1" style={{color: '#68D391'}}>+{equippedArmor.chest.defense} Defense</p>
                            {equippedArmor.chest.affixes && Object.keys(equippedArmor.chest.affixes).length > 0 && (
                              <>
                                <div className="border-t mx-2 mb-1 mt-2" style={{borderColor: 'rgba(192, 192, 192, 0.3)'}}></div>
                                <div className="space-y-0.5">
                                  {equippedArmor.chest.affixes.flatArmor && <p className="text-xs" style={{color: '#68D391'}}>+{Math.floor(equippedArmor.chest.affixes.flatArmor)} Armor</p>}
                                  {equippedArmor.chest.affixes.percentDR && <p className="text-xs" style={{color: '#68D391'}}>+{Math.floor(equippedArmor.chest.affixes.percentDR)}% Damage Reduction</p>}
                                  {equippedArmor.chest.affixes.flatHP && <p className="text-xs" style={{color: '#68D391'}}>+{Math.floor(equippedArmor.chest.affixes.flatHP)} Maximum Health</p>}
                                </div>
                              </>
                            )}
                          </div>
                        ) : (
                          <p className="text-xs italic text-center" style={{color: '#95A5A6'}}>Empty</p>
                        )}
                      </div>
                      
                      {/* Gloves */}
                      <div className="rounded p-3 border-2" style={{
                        backgroundColor: 'rgba(0, 0, 0, 0.4)', 
                        borderColor: equippedArmor.gloves ? getRarityColor(equippedArmor.gloves.rarity || 'common') : 'rgba(192, 192, 192, 0.3)',
                        boxShadow: equippedArmor.gloves ? `0 0 8px ${getRarityColor(equippedArmor.gloves.rarity || 'common')}40` : 'none'
                      }}>
                        <p className="text-xs uppercase mb-2 text-center font-bold" style={{color: COLORS.silver}}>Gloves</p>
                        {equippedArmor.gloves ? (
                          <div>
                            <p className="text-sm font-bold text-center mb-1" style={{color: getRarityColor(equippedArmor.gloves.rarity || 'common')}}>{equippedArmor.gloves.name}</p>
                            <p className="text-xs text-center mb-1" style={{color: '#68D391'}}>+{equippedArmor.gloves.defense} Defense</p>
                            {equippedArmor.gloves.affixes && Object.keys(equippedArmor.gloves.affixes).length > 0 && (
                              <>
                                <div className="border-t mx-2 mb-1 mt-2" style={{borderColor: 'rgba(192, 192, 192, 0.3)'}}></div>
                                <div className="space-y-0.5">
                                  {equippedArmor.gloves.affixes.flatArmor && <p className="text-xs" style={{color: '#68D391'}}>+{Math.floor(equippedArmor.gloves.affixes.flatArmor)} Armor</p>}
                                  {equippedArmor.gloves.affixes.percentDR && <p className="text-xs" style={{color: '#68D391'}}>+{Math.floor(equippedArmor.gloves.affixes.percentDR)}% Damage Reduction</p>}
                                  {equippedArmor.gloves.affixes.flatHP && <p className="text-xs" style={{color: '#68D391'}}>+{Math.floor(equippedArmor.gloves.affixes.flatHP)} Maximum Health</p>}
                                </div>
                              </>
                            )}
                          </div>
                        ) : (
                          <p className="text-xs italic text-center" style={{color: '#95A5A6'}}>Empty</p>
                        )}
                      </div>
                      
                      {/* Boots */}
                      <div className="rounded p-3 border-2" style={{
                        backgroundColor: 'rgba(0, 0, 0, 0.4)', 
                        borderColor: equippedArmor.boots ? getRarityColor(equippedArmor.boots.rarity || 'common') : 'rgba(192, 192, 192, 0.3)',
                        boxShadow: equippedArmor.boots ? `0 0 8px ${getRarityColor(equippedArmor.boots.rarity || 'common')}40` : 'none'
                      }}>
                        <p className="text-xs uppercase mb-2 text-center font-bold" style={{color: COLORS.silver}}>Boots</p>
                        {equippedArmor.boots ? (
                          <div>
                            <p className="text-sm font-bold text-center mb-1" style={{color: getRarityColor(equippedArmor.boots.rarity || 'common')}}>{equippedArmor.boots.name}</p>
                            <p className="text-xs text-center mb-1" style={{color: '#68D391'}}>+{equippedArmor.boots.defense} Defense</p>
                            {equippedArmor.boots.affixes && Object.keys(equippedArmor.boots.affixes).length > 0 && (
                              <>
                                <div className="border-t mx-2 mb-1 mt-2" style={{borderColor: 'rgba(192, 192, 192, 0.3)'}}></div>
                                <div className="space-y-0.5">
                                  {equippedArmor.boots.affixes.flatArmor && <p className="text-xs" style={{color: '#68D391'}}>+{Math.floor(equippedArmor.boots.affixes.flatArmor)} Armor</p>}
                                  {equippedArmor.boots.affixes.percentDR && <p className="text-xs" style={{color: '#68D391'}}>+{Math.floor(equippedArmor.boots.affixes.percentDR)}% Damage Reduction</p>}
                                  {equippedArmor.boots.affixes.flatHP && <p className="text-xs" style={{color: '#68D391'}}>+{Math.floor(equippedArmor.boots.affixes.flatHP)} Maximum Health</p>}
                                </div>
                              </>
                            )}
                          </div>
                        ) : (
                          <p className="text-xs italic text-center" style={{color: '#95A5A6'}}>Empty</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-center pt-2 border-t" style={{borderColor: 'rgba(192, 192, 192, 0.2)'}}>
                      <p className="text-sm" style={{color: COLORS.silver}}>
                        Total Defense: <span className="font-bold text-lg" style={{color: COLORS.gold}}>{getBaseDefense()}</span>
                      </p>
                    </div>
                  </div>
                  
                  {/* Armor Inventory */}
                  {(armorInventory.helmet.length > 0 || armorInventory.chest.length > 0 || armorInventory.gloves.length > 0 || armorInventory.boots.length > 0) ? (
                    <div className="rounded-lg p-4 border-2" style={{backgroundColor: 'rgba(47, 82, 51, 0.2)', borderColor: 'rgba(47, 82, 51, 0.5)'}}>
                      <h3 className="font-bold text-lg mb-2 text-center" style={{color: '#68D391'}}>COLLECTED ARMOR</h3>
                      <p className="text-xs text-center mb-3 italic" style={{color: COLORS.silver}}>Pieces found in battle or unequipped</p>
                      
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {['helmet', 'chest', 'gloves', 'boots'].map(slot => 
                          armorInventory[slot].length > 0 ? (
                            <div key={slot}>
                              <p className="text-xs uppercase mb-2 font-bold" style={{color: COLORS.silver}}>{slot}s</p>
                              {sortByRarity(armorInventory[slot])
                                .map((piece, idx) => (
                                <div key={piece.id} className="rounded p-3 mb-2 border-2 flex justify-between items-center" style={{
                                  backgroundColor: 'rgba(0, 0, 0, 0.4)', 
                                  borderColor: getRarityColor(piece.rarity || 'common'),
                                  boxShadow: `0 0 10px ${getRarityColor(piece.rarity || 'common')}40`
                                }}>
                                  <div className="flex-1">
                                    <p className="text-base font-bold text-center mb-1" style={{color: getRarityColor(piece.rarity || 'common')}}>{piece.name}</p>
                                    {piece.rarity && (
                                      <p className="text-xs italic text-center mb-1" style={{color: getRarityColor(piece.rarity)}}>
                                        {GAME_CONSTANTS.RARITY_TIERS[piece.rarity].name}
                                      </p>
                                    )}
                                    <p className="text-sm text-center mb-2" style={{color: '#68D391'}}>+{piece.defense} Defense</p>
                                    {piece.affixes && Object.keys(piece.affixes).length > 0 && (
                                      <>
                                        <div className="border-t mx-4 mb-2" style={{borderColor: 'rgba(192, 192, 192, 0.3)'}}></div>
                                        <div className="space-y-0.5">
                                          {piece.affixes.flatArmor && <p className="text-xs" style={{color: '#68D391'}}>+{Math.floor(piece.affixes.flatArmor)} Armor</p>}
                                          {piece.affixes.percentDR && <p className="text-xs" style={{color: '#68D391'}}>+{Math.floor(piece.affixes.percentDR)}% Damage Reduction</p>}
                                          {piece.affixes.flatHP && <p className="text-xs" style={{color: '#68D391'}}>+{Math.floor(piece.affixes.flatHP)} Maximum Health</p>}
                                        </div>
                                      </>
                                    )}
                                  </div>
                                  <button
                                    onClick={() => {
                                      // Get the currently equipped piece (if any)
                                      const oldPiece = equippedArmor[slot];
                                      
                                      // Equip the new piece
                                      setEquippedArmor(prev => ({ ...prev, [slot]: piece }));
                                      
                                      // Update inventory: remove the new piece, add the old piece (if it exists)
                                      setArmorInventory(prev => ({
                                        ...prev,
                                        [slot]: [
                                          ...prev[slot].filter(p => p.id !== piece.id),
                                          ...(oldPiece ? [oldPiece] : [])
                                        ]
                                      }));
                                      
                                      addLog(`Equipped: ${piece.name} (+${piece.defense} Defense)`);
                                      if (oldPiece) {
                                        addLog(`Unequipped: ${oldPiece.name}`);
                                      }
                                    }}
                                    className="px-3 py-1 rounded-lg text-xs border-2 transition-all font-bold"
                                    style={{
                                      background: 'linear-gradient(to bottom, rgba(59, 130, 246, 0.7), rgba(29, 78, 216, 0.8))',
                                      borderColor: '#3B82F6',
                                      color: '#F5F5DC',
                                      cursor: 'pointer'
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.background = 'linear-gradient(to bottom, rgba(96, 165, 250, 0.8), rgba(59, 130, 246, 0.9))';
                                      e.currentTarget.style.transform = 'translateY(-1px)';
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.background = 'linear-gradient(to bottom, rgba(59, 130, 246, 0.7), rgba(29, 78, 216, 0.8))';
                                      e.currentTarget.style.transform = 'translateY(0)';
                                    }}
                                  >
                                    Equip
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : null
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-lg p-6 border-2 text-center" style={{backgroundColor: 'rgba(47, 82, 51, 0.1)', borderColor: 'rgba(47, 82, 51, 0.3)'}}>
                      <p className="text-sm italic" style={{color: '#95A5A6'}}>No armor collected yet. Defeat enemies to find armor pieces.</p>
                    </div>
                  )}
                    </>
                  ) : (
                    <>
                  {/* Gear Section - Pendant and Ring */}
                  <div className="rounded-lg p-4 border-2 mb-4" style={{backgroundColor: 'rgba(75, 0, 130, 0.2)', borderColor: 'rgba(75, 0, 130, 0.5)'}}>
                    <h3 className="font-bold text-lg mb-3 text-center" style={{color: '#9370DB'}}>EQUIPPED GEAR</h3>
                    
                    <div className="space-y-3 mb-4">
                      {/* Pendant */}
                      <div className="rounded p-3 border" style={{backgroundColor: 'rgba(0, 0, 0, 0.4)', borderColor: 'rgba(192, 192, 192, 0.4)'}}>
                        <p className="text-xs uppercase mb-2" style={{color: COLORS.silver}}>Pendant</p>
                        {equippedPendant ? (
                          <div>
                            <p className="text-sm font-bold" style={{color: getRarityColor(equippedPendant.rarity || 'common')}}>{equippedPendant.name}</p>
                            <p className="text-xs" style={{color: '#68D391'}}>+{equippedPendant.hp} Health</p>
                            {equippedPendant.rarity && (
                              <p className="text-xs italic mt-1" style={{color: getRarityColor(equippedPendant.rarity)}}>
                                {GAME_CONSTANTS.RARITY_TIERS[equippedPendant.rarity].name}
                              </p>
                            )}
                          </div>
                        ) : (
                          <p className="text-xs italic" style={{color: '#95A5A6'}}>Empty</p>
                        )}
                      </div>
                      
                      {/* Ring */}
                      <div className="rounded p-3 border" style={{backgroundColor: 'rgba(0, 0, 0, 0.4)', borderColor: 'rgba(192, 192, 192, 0.4)'}}>
                        <p className="text-xs uppercase mb-2" style={{color: COLORS.silver}}>Ring</p>
                        {equippedRing ? (
                          <div>
                            <p className="text-sm font-bold" style={{color: getRarityColor(equippedRing.rarity || 'common')}}>{equippedRing.name}</p>
                            <p className="text-xs" style={{color: '#4FC3F7'}}>+{equippedRing.stamina} STA</p>
                            {equippedRing.rarity && (
                              <p className="text-xs italic mt-1" style={{color: getRarityColor(equippedRing.rarity)}}>
                                {GAME_CONSTANTS.RARITY_TIERS[equippedRing.rarity].name}
                              </p>
                            )}
                          </div>
                        ) : (
                          <p className="text-xs italic" style={{color: '#95A5A6'}}>Empty</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-center pt-2 border-t" style={{borderColor: 'rgba(192, 192, 192, 0.2)'}}>
                      <p className="text-sm" style={{color: COLORS.silver}}>
                        Max HP: <span className="font-bold text-lg" style={{color: '#FF6B6B', opacity: 0.95}}>{getMaxHp()}</span>
                        {' | '}
                        Max STA: <span className="font-bold text-lg" style={{color: '#4FC3F7', opacity: 0.95}}>{getMaxStamina()}</span>
                      </p>
                    </div>
                  </div>
                  
                  {/* Collected Pendants */}
                  {pendantInventory.length > 0 && (
                    <div className="rounded-lg p-4 border-2 mb-4" style={{backgroundColor: 'rgba(139, 0, 0, 0.2)', borderColor: 'rgba(139, 0, 0, 0.5)'}}>
                      <h3 className="font-bold text-lg mb-2 text-center" style={{color: '#FF6B6B'}}>PENDANTS</h3>
                      <p className="text-xs text-center mb-3 italic" style={{color: COLORS.silver}}>Increase maximum health</p>
                      
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {sortByRarity(pendantInventory)
                          .map((pend) => (
                          <div key={pend.id} className="rounded p-2 border flex justify-between items-center" style={{backgroundColor: 'rgba(0, 0, 0, 0.3)', borderColor: 'rgba(192, 192, 192, 0.3)'}}>
                            <div>
                              <p className="text-sm font-bold" style={{color: getRarityColor(pend.rarity || 'common')}}>{pend.name}</p>
                              <p className="text-xs" style={{color: '#68D391'}}>+{pend.hp} Health</p>
                              {pend.rarity && (
                                <p className="text-xs italic" style={{color: getRarityColor(pend.rarity)}}>
                                  {GAME_CONSTANTS.RARITY_TIERS[pend.rarity].name}
                                </p>
                              )}
                            </div>
                            <button
                              onClick={() => {
                                const oldPendant = equippedPendant;
                                setEquippedPendant(pend);
                                setPendantInventory(prev => [
                                  ...prev.filter(p => p.id !== pend.id),
                                  ...(oldPendant ? [oldPendant] : [])
                                ]);
                                addLog(`Equipped: ${pend.name} (+${pend.hp} Health)`);
                                if (oldPendant) {
                                  addLog(`Unequipped: ${oldPendant.name}`);
                                }
                              }}
                              className="px-3 py-1 rounded-lg text-xs border-2 transition-all font-bold"
                              style={{
                                background: 'linear-gradient(to bottom, rgba(59, 130, 246, 0.7), rgba(29, 78, 216, 0.8))',
                                borderColor: '#3B82F6',
                                color: '#F5F5DC',
                                cursor: 'pointer'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'linear-gradient(to bottom, rgba(96, 165, 250, 0.8), rgba(59, 130, 246, 0.9))';
                                e.currentTarget.style.transform = 'translateY(-1px)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'linear-gradient(to bottom, rgba(59, 130, 246, 0.7), rgba(29, 78, 216, 0.8))';
                                e.currentTarget.style.transform = 'translateY(0)';
                              }}
                            >
                              Equip
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Collected Rings */}
                  {ringInventory.length > 0 && (
                    <div className="rounded-lg p-4 border-2 mb-4" style={{backgroundColor: 'rgba(0, 150, 255, 0.2)', borderColor: 'rgba(0, 150, 255, 0.5)'}}>
                      <h3 className="font-bold text-lg mb-2 text-center" style={{color: '#4FC3F7'}}>RINGS</h3>
                      <p className="text-xs text-center mb-3 italic" style={{color: COLORS.silver}}>Increase maximum stamina</p>
                      
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {sortByRarity(ringInventory)
                          .map((rng) => (
                          <div key={rng.id} className="rounded p-2 border flex justify-between items-center" style={{backgroundColor: 'rgba(0, 0, 0, 0.3)', borderColor: 'rgba(192, 192, 192, 0.3)'}}>
                            <div>
                              <p className="text-sm font-bold" style={{color: getRarityColor(rng.rarity || 'common')}}>{rng.name}</p>
                              <p className="text-xs" style={{color: '#4FC3F7'}}>+{rng.stamina} STA</p>
                              {rng.rarity && (
                                <p className="text-xs italic" style={{color: getRarityColor(rng.rarity)}}>
                                  {GAME_CONSTANTS.RARITY_TIERS[rng.rarity].name}
                                </p>
                              )}
                            </div>
                            <button
                              onClick={() => {
                                const oldRing = equippedRing;
                                setEquippedRing(rng);
                                setRingInventory(prev => [
                                  ...prev.filter(r => r.id !== rng.id),
                                  ...(oldRing ? [oldRing] : [])
                                ]);
                                addLog(`Equipped: ${rng.name} (+${rng.stamina} STA)`);
                                if (oldRing) {
                                  addLog(`Unequipped: ${oldRing.name}`);
                                }
                              }}
                              className="px-3 py-1 rounded-lg text-xs border-2 transition-all font-bold"
                              style={{
                                background: 'linear-gradient(to bottom, rgba(59, 130, 246, 0.7), rgba(29, 78, 216, 0.8))',
                                borderColor: '#3B82F6',
                                color: '#F5F5DC',
                                cursor: 'pointer'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'linear-gradient(to bottom, rgba(96, 165, 250, 0.8), rgba(59, 130, 246, 0.9))';
                                e.currentTarget.style.transform = 'translateY(-1px)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'linear-gradient(to bottom, rgba(59, 130, 246, 0.7), rgba(29, 78, 216, 0.8))';
                                e.currentTarget.style.transform = 'translateY(0)';
                              }}
                            >
                              Equip
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {pendantInventory.length === 0 && ringInventory.length === 0 && (
                    <div className="rounded-lg p-6 border-2 text-center" style={{backgroundColor: 'rgba(75, 0, 130, 0.1)', borderColor: 'rgba(75, 0, 130, 0.3)'}}>
                      <p className="text-sm italic" style={{color: '#95A5A6'}}>No accessories collected yet. Defeat enemies to find pendants and rings.</p>
                    </div>
                  )}
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {showCraftingModal && (
            <div className="fixed inset-0 bg-black bg-opacity-90 flex items-start justify-center p-4 z-50 overflow-y-auto" onClick={() => setShowCraftingModal(false)}>
              <div className="rounded-xl p-6 max-w-2xl w-full border-2 my-8 relative" style={{background: VISUAL_STYLES.modal.paper, borderColor: COLORS.silver, boxShadow: VISUAL_STYLES.shadow.elevated}} onClick={e => e.stopPropagation()}>
                <button 
                  onClick={() => setShowCraftingModal(false)} 
                  className="absolute top-4 right-4 p-2 rounded-lg border-2 transition-all"
                  style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    borderColor: 'rgba(212, 175, 55, 0.4)',
                    color: '#D4AF37'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
                    e.currentTarget.style.borderColor = '#D4AF37';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
                    e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.4)';
                  }}
                >
                  <X size={20}/>
                </button>
                
                <div className="text-center mb-6">
                  <h2 className="text-3xl font-bold mb-2" style={{
                    color: '#D4AF37',
                    fontFamily: 'Cinzel, serif',
                    letterSpacing: '0.1em',
                    textShadow: '0 0 20px rgba(212, 175, 55, 0.3)'
                  }}>
                    THE MERCHANT
                  </h2>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <div style={{width: '120px', height: '1px', background: 'linear-gradient(to right, transparent, rgba(212, 175, 55, 0.5))'}}></div>
                    <span style={{color: 'rgba(212, 175, 55, 0.6)', fontSize: '8px'}}>◆</span>
                    <div style={{width: '120px', height: '1px', background: 'linear-gradient(to left, transparent, rgba(212, 175, 55, 0.5))'}}></div>
                  </div>
                  <p className="text-sm mt-2 italic" style={{color: COLORS.silver}}>"{getMerchantDialogue()}"</p>
                </div>
                
                {/* Main Tabs: Potions / Equipment */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <button
                    onClick={() => {
                      if (merchantTab === 'buy' || merchantTab === 'sellPotions') {
                        setMerchantTab('buy'); // Stay in potions section
                      } else {
                        setMerchantTab('buy'); // Enter potions section
                      }
                    }}
                    className="py-3 rounded-lg font-bold uppercase text-sm transition-all border-2"
                    style={{
                      background: (merchantTab === 'buy' || merchantTab === 'sellPotions') 
                        ? 'linear-gradient(to bottom, rgba(168, 85, 247, 0.7), rgba(126, 34, 206, 0.8))' 
                        : 'linear-gradient(to bottom, rgba(80, 40, 120, 0.3), rgba(60, 30, 90, 0.4))',
                      borderColor: (merchantTab === 'buy' || merchantTab === 'sellPotions') ? '#A855F7' : 'rgba(168, 85, 247, 0.4)',
                      color: '#F5F5DC',
                      boxShadow: (merchantTab === 'buy' || merchantTab === 'sellPotions') ? '0 0 15px rgba(168, 85, 247, 0.3)' : 'none'
                    }}
                    onMouseEnter={(e) => {
                      if (merchantTab === 'buy' || merchantTab === 'sellPotions') {
                        e.currentTarget.style.background = 'linear-gradient(to bottom, rgba(192, 132, 252, 0.8), rgba(147, 51, 234, 0.9))';
                      } else {
                        e.currentTarget.style.background = 'linear-gradient(to bottom, rgba(100, 50, 150, 0.4), rgba(80, 40, 120, 0.5))';
                      }
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      if (merchantTab === 'buy' || merchantTab === 'sellPotions') {
                        e.currentTarget.style.background = 'linear-gradient(to bottom, rgba(168, 85, 247, 0.7), rgba(126, 34, 206, 0.8))';
                      } else {
                        e.currentTarget.style.background = 'linear-gradient(to bottom, rgba(80, 40, 120, 0.3), rgba(60, 30, 90, 0.4))';
                      }
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    Potions
                  </button>
                  <button
                    onClick={() => {
                      if (merchantTab === 'buyEquipment' || merchantTab === 'sellEquipment') {
                        setMerchantTab('buyEquipment'); // Stay in equipment section
                      } else {
                        setMerchantTab('buyEquipment'); // Enter equipment section
                      }
                    }}
                    className="py-3 rounded-lg font-bold uppercase text-sm transition-all border-2"
                    style={{
                      background: (merchantTab === 'buyEquipment' || merchantTab === 'sellEquipment') 
                        ? 'linear-gradient(to bottom, rgba(220, 38, 38, 0.7), rgba(153, 27, 27, 0.8))' 
                        : 'linear-gradient(to bottom, rgba(100, 20, 20, 0.3), rgba(80, 15, 15, 0.4))',
                      borderColor: (merchantTab === 'buyEquipment' || merchantTab === 'sellEquipment') ? '#DC2626' : 'rgba(220, 38, 38, 0.4)',
                      color: '#F5F5DC',
                      boxShadow: (merchantTab === 'buyEquipment' || merchantTab === 'sellEquipment') ? '0 0 15px rgba(220, 38, 38, 0.3)' : 'none'
                    }}
                    onMouseEnter={(e) => {
                      if (merchantTab === 'buyEquipment' || merchantTab === 'sellEquipment') {
                        e.currentTarget.style.background = 'linear-gradient(to bottom, rgba(239, 68, 68, 0.8), rgba(185, 28, 28, 0.9))';
                      } else {
                        e.currentTarget.style.background = 'linear-gradient(to bottom, rgba(120, 25, 25, 0.4), rgba(100, 20, 20, 0.5))';
                      }
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      if (merchantTab === 'buyEquipment' || merchantTab === 'sellEquipment') {
                        e.currentTarget.style.background = 'linear-gradient(to bottom, rgba(220, 38, 38, 0.7), rgba(153, 27, 27, 0.8))';
                      } else {
                        e.currentTarget.style.background = 'linear-gradient(to bottom, rgba(100, 20, 20, 0.3), rgba(80, 15, 15, 0.4))';
                      }
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    Equipment
                  </button>
                </div>
                
                {/* Potions Sub-tabs (Buy/Sell) - Appear below when Potions is selected */}
                {(merchantTab === 'buy' || merchantTab === 'sellPotions') && (
                  <div className="rounded-lg p-2 mb-6 border" style={{
                    background: 'rgba(168, 85, 247, 0.15)',
                    borderColor: 'rgba(168, 85, 247, 0.3)'
                  }}>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setMerchantTab('buy')}
                        className="py-2 rounded-lg font-bold text-sm transition-all border-2"
                        style={{
                          background: merchantTab === 'buy' 
                            ? 'linear-gradient(to bottom, rgba(184, 134, 11, 0.8), rgba(139, 101, 8, 0.8))' 
                            : 'rgba(0, 0, 0, 0.3)',
                          borderColor: merchantTab === 'buy' ? '#D4AF37' : 'rgba(184, 134, 11, 0.3)',
                          color: '#F5F5DC',
                          cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => {
                          if (merchantTab === 'buy') {
                            e.currentTarget.style.background = 'linear-gradient(to bottom, rgba(218, 165, 32, 0.9), rgba(184, 134, 11, 0.9))';
                          } else {
                            e.currentTarget.style.background = 'rgba(40, 40, 40, 0.4)';
                          }
                          e.currentTarget.style.transform = 'translateY(-1px)';
                        }}
                        onMouseLeave={(e) => {
                          if (merchantTab === 'buy') {
                            e.currentTarget.style.background = 'linear-gradient(to bottom, rgba(184, 134, 11, 0.8), rgba(139, 101, 8, 0.8))';
                          } else {
                            e.currentTarget.style.background = 'rgba(0, 0, 0, 0.3)';
                          }
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                      >
                        Buy
                      </button>
                      <button
                        onClick={() => setMerchantTab('sellPotions')}
                        className="py-2 rounded-lg font-bold text-sm transition-all border-2"
                        style={{
                          background: merchantTab === 'sellPotions' 
                            ? 'linear-gradient(to bottom, rgba(34, 197, 94, 0.8), rgba(22, 163, 74, 0.8))' 
                            : 'rgba(0, 0, 0, 0.3)',
                          borderColor: merchantTab === 'sellPotions' ? '#22C55E' : 'rgba(34, 197, 94, 0.3)',
                          color: '#F5F5DC',
                          cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => {
                          if (merchantTab === 'sellPotions') {
                            e.currentTarget.style.background = 'linear-gradient(to bottom, rgba(74, 222, 128, 0.9), rgba(34, 197, 94, 0.9))';
                          } else {
                            e.currentTarget.style.background = 'rgba(40, 40, 40, 0.4)';
                          }
                          e.currentTarget.style.transform = 'translateY(-1px)';
                        }}
                        onMouseLeave={(e) => {
                          if (merchantTab === 'sellPotions') {
                            e.currentTarget.style.background = 'linear-gradient(to bottom, rgba(34, 197, 94, 0.8), rgba(22, 163, 74, 0.8))';
                          } else {
                            e.currentTarget.style.background = 'rgba(0, 0, 0, 0.3)';
                          }
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                      >
                        Sell
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Equipment Sub-tabs (Buy/Sell) - Appear below when Equipment is selected */}
                {(merchantTab === 'buyEquipment' || merchantTab === 'sellEquipment') && (
                  <div className="rounded-lg p-2 mb-6 border" style={{
                    background: 'rgba(139, 0, 0, 0.15)',
                    borderColor: 'rgba(139, 0, 0, 0.3)'
                  }}>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setMerchantTab('buyEquipment')}
                        className="py-2 rounded-lg font-bold text-sm transition-all border-2"
                        style={{
                          background: merchantTab === 'buyEquipment' 
                            ? 'linear-gradient(to bottom, rgba(184, 134, 11, 0.8), rgba(139, 101, 8, 0.8))' 
                            : 'rgba(0, 0, 0, 0.3)',
                          borderColor: merchantTab === 'buyEquipment' ? '#D4AF37' : 'rgba(184, 134, 11, 0.3)',
                          color: '#F5F5DC',
                          cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => {
                          if (merchantTab === 'buyEquipment') {
                            e.currentTarget.style.background = 'linear-gradient(to bottom, rgba(218, 165, 32, 0.9), rgba(184, 134, 11, 0.9))';
                          } else {
                            e.currentTarget.style.background = 'rgba(40, 40, 40, 0.4)';
                          }
                          e.currentTarget.style.transform = 'translateY(-1px)';
                        }}
                        onMouseLeave={(e) => {
                          if (merchantTab === 'buyEquipment') {
                            e.currentTarget.style.background = 'linear-gradient(to bottom, rgba(184, 134, 11, 0.8), rgba(139, 101, 8, 0.8))';
                          } else {
                            e.currentTarget.style.background = 'rgba(0, 0, 0, 0.3)';
                          }
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                      >
                        Buy
                      </button>
                      <button
                        onClick={() => setMerchantTab('sellEquipment')}
                        className="py-2 rounded-lg font-bold text-sm transition-all border-2"
                        style={{
                          background: merchantTab === 'sellEquipment' 
                            ? 'linear-gradient(to bottom, rgba(34, 197, 94, 0.8), rgba(22, 163, 74, 0.8))' 
                            : 'rgba(0, 0, 0, 0.3)',
                          borderColor: merchantTab === 'sellEquipment' ? '#22C55E' : 'rgba(34, 197, 94, 0.3)',
                          color: '#F5F5DC',
                          cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => {
                          if (merchantTab === 'sellEquipment') {
                            e.currentTarget.style.background = 'linear-gradient(to bottom, rgba(74, 222, 128, 0.9), rgba(34, 197, 94, 0.9))';
                          } else {
                            e.currentTarget.style.background = 'rgba(40, 40, 40, 0.4)';
                          }
                          e.currentTarget.style.transform = 'translateY(-1px)';
                        }}
                        onMouseLeave={(e) => {
                          if (merchantTab === 'sellEquipment') {
                            e.currentTarget.style.background = 'linear-gradient(to bottom, rgba(34, 197, 94, 0.8), rgba(22, 163, 74, 0.8))';
                          } else {
                            e.currentTarget.style.background = 'rgba(0, 0, 0, 0.3)';
                          }
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                      >
                        Sell
                      </button>
                    </div>
                  </div>
                )}
                
                
                <div className="rounded-lg p-4 mb-6 border-2" style={{
                  background: 'rgba(184, 134, 11, 0.2)',
                  borderColor: 'rgba(212, 175, 55, 0.4)'
                }}>
                  <p className="text-center text-lg">
                    <span style={{color: COLORS.silver}}>Current Gold:</span> 
                    <span className="font-bold text-2xl ml-2" style={{color: '#D4AF37'}}>{gold}</span>
                  </p>
                </div>
                
                {/* Buy Potions Tab */}
                {merchantTab === 'buy' && (
                <div>
                  {/* Potion Market Status */}
                  <div className="rounded-lg p-3 mb-4 border" style={{
                    background: 'rgba(0, 0, 0, 0.3)',
                    borderColor: 'rgba(212, 175, 55, 0.3)'
                  }}>
                    <p className="text-xs font-bold mb-2 text-center" style={{color: '#D4AF37'}}>TODAY'S MARKET RATES</p>
                    <div className="flex justify-center gap-4 text-xs">
                      <div className="text-center">
                        <p style={{color: COLORS.silver}}>Health</p>
                        <p className="font-bold" style={{color: marketModifiers.healthPotion < 0.9 ? '#68D391' : marketModifiers.healthPotion > 1.1 ? '#FF6B6B' : '#F5F5DC'}}>
                          {marketModifiers.healthPotion < 0.9 ? 'SALE' : marketModifiers.healthPotion > 1.1 ? 'HIGH' : 'NORMAL'}
                        </p>
                      </div>
                      <div className="text-center">
                        <p style={{color: COLORS.silver}}>Stamina</p>
                        <p className="font-bold" style={{color: marketModifiers.staminaPotion < 0.9 ? '#68D391' : marketModifiers.staminaPotion > 1.1 ? '#FF6B6B' : '#F5F5DC'}}>
                          {marketModifiers.staminaPotion < 0.9 ? 'SALE' : marketModifiers.staminaPotion > 1.1 ? 'HIGH' : 'NORMAL'}
                        </p>
                      </div>
                      <div className="text-center">
                        <p style={{color: COLORS.silver}}>Cleanse</p>
                        <p className="font-bold" style={{color: marketModifiers.cleansePotion < 0.9 ? '#68D391' : marketModifiers.cleansePotion > 1.1 ? '#FF6B6B' : '#F5F5DC'}}>
                          {marketModifiers.cleansePotion < 0.9 ? 'SALE' : marketModifiers.cleansePotion > 1.1 ? 'HIGH' : 'NORMAL'}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs italic text-center mt-2" style={{color: '#9CA3AF'}}>Prices refresh daily</p>
                  </div>
                  
                <div className="grid grid-cols-3 gap-2">
                  {(() => {
                    const healthPrice = getPotionPrice('healthPotion', 25);
                    const staminaPrice = getPotionPrice('staminaPotion', 20);
                    const cleansePrice = getPotionPrice('cleansePotion', 250);
                    const weaponOilPrice = getPotionPrice('weaponOil', 40);
                    const armorPolishPrice = getPotionPrice('armorPolish', 40);
                    const luckyCharmPrice = getPotionPrice('luckyCharm', 80);
                    
                    return (<>
                  <button 
                    onClick={() => craftItem('healthPotion')} 
                    disabled={gold < healthPrice}
                    className="p-2 rounded-lg border-2 transition-all cursor-pointer relative overflow-hidden" 
                    style={{
                      background: gold >= healthPrice 
                        ? 'linear-gradient(135deg, rgba(180, 35, 35, 0.35) 0%, rgba(130, 25, 25, 0.4) 50%, rgba(100, 22, 22, 0.45) 100%)' 
                        : 'rgba(44, 62, 80, 0.3)', 
                      borderColor: gold >= healthPrice ? 'rgba(180, 35, 35, 0.6)' : 'rgba(149, 165, 166, 0.3)', 
                      opacity: gold >= healthPrice ? 1 : 0.5, 
                      cursor: gold >= healthPrice ? 'pointer' : 'not-allowed',
                      boxShadow: gold >= healthPrice ? VISUAL_STYLES.shadow.subtle : 'none'
                    }} 
                    onMouseEnter={(e) => {
                      if (gold >= healthPrice) {
                        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(200, 40, 40, 0.4) 0%, rgba(150, 30, 30, 0.45) 50%, rgba(120, 25, 25, 0.5) 100%)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }
                    }} 
                    onMouseLeave={(e) => {
                      if (gold >= healthPrice) {
                        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(180, 35, 35, 0.35) 0%, rgba(130, 25, 25, 0.4) 50%, rgba(100, 22, 22, 0.45) 100%)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }
                    }}
                  >
                    <div>
                      <p className="font-bold text-sm mb-1" style={{color: '#F5F5DC'}}>Health Potion</p>
                      <p className="text-xs font-bold mb-1" style={{color: '#D4AF37'}}>
                        {healthPrice}g
                      </p>
                      <p className="text-xs mb-1" style={{color: '#FF6B6B'}}>30% Health</p>
                      <p className="text-xs italic" style={{color: COLORS.silver, fontSize: '10px'}}>"Crimson elixir"</p>
                    </div>
                  </button>
                  
                  <button 
                    onClick={() => craftItem('staminaPotion')} 
                    disabled={gold < staminaPrice}
                    className="p-2 rounded-lg border-2 transition-all relative overflow-hidden" 
                    style={{
                      background: gold >= staminaPrice 
                        ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.35) 0%, rgba(30, 64, 175, 0.4) 50%, rgba(29, 78, 216, 0.45) 100%)' 
                        : 'rgba(44, 62, 80, 0.3)', 
                      borderColor: gold >= staminaPrice ? 'rgba(59, 130, 246, 0.65)' : 'rgba(149, 165, 166, 0.3)', 
                      opacity: gold >= staminaPrice ? 1 : 0.5, 
                      cursor: gold >= staminaPrice ? 'pointer' : 'not-allowed',
                      boxShadow: gold >= staminaPrice ? VISUAL_STYLES.shadow.subtle : 'none'
                    }} 
                    onMouseEnter={(e) => {
                      if (gold >= staminaPrice) {
                        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(80, 150, 250, 0.4) 0%, rgba(59, 130, 246, 0.45) 50%, rgba(37, 99, 235, 0.5) 100%)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }
                    }} 
                    onMouseLeave={(e) => {
                      if (gold >= staminaPrice) {
                        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(59, 130, 246, 0.35) 0%, rgba(30, 64, 175, 0.4) 50%, rgba(29, 78, 216, 0.45) 100%)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }
                    }}
                  >
                    <div>
                      <p className="font-bold text-sm mb-1" style={{color: '#F5F5DC'}}>Stamina Potion</p>
                      <p className="text-xs font-bold mb-1" style={{color: '#D4AF37'}}>
                        {staminaPrice}g
                      </p>
                      <p className="text-xs mb-1" style={{color: '#6BB6FF'}}>50% Stamina</p>
                      <p className="text-xs italic" style={{color: COLORS.silver, fontSize: '10px'}}>"Azure draught"</p>
                    </div>
                  </button>
                  
                  <button 
                    onClick={() => craftItem('cleansePotion')} 
                    disabled={gold < cleansePrice || cleansePotionPurchasedToday}
                    className="p-2 rounded-lg border-2 transition-all relative overflow-hidden" 
                    style={{
                      background: (gold >= cleansePrice && !cleansePotionPurchasedToday) 
                        ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.35) 0%, rgba(126, 34, 206, 0.4) 50%, rgba(107, 33, 168, 0.45) 100%)' 
                        : 'rgba(44, 62, 80, 0.3)', 
                      borderColor: (gold >= cleansePrice && !cleansePotionPurchasedToday) ? 'rgba(168, 85, 247, 0.65)' : 'rgba(149, 165, 166, 0.3)', 
                      opacity: (gold >= cleansePrice && !cleansePotionPurchasedToday) ? 1 : 0.5, 
                      cursor: (gold >= cleansePrice && !cleansePotionPurchasedToday) ? 'pointer' : 'not-allowed',
                      boxShadow: (gold >= cleansePrice && !cleansePotionPurchasedToday) ? '0 0 15px rgba(168, 85, 247, 0.2)' : 'none'
                    }} 
                    onMouseEnter={(e) => {
                      if (gold >= cleansePrice && !cleansePotionPurchasedToday) {
                        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(192, 132, 252, 0.4) 0%, rgba(147, 51, 234, 0.45) 50%, rgba(126, 34, 206, 0.5) 100%)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }
                    }} 
                    onMouseLeave={(e) => {
                      if (gold >= cleansePrice && !cleansePotionPurchasedToday) {
                        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(168, 85, 247, 0.35) 0%, rgba(126, 34, 206, 0.4) 50%, rgba(107, 33, 168, 0.45) 100%)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }
                    }}
                  >
                    <div>
                      <p className="font-bold text-sm mb-1" style={{color: '#F5F5DC'}}>Cleanse Potion</p>
                      <p className="text-xs font-bold mb-1" style={{color: '#D4AF37'}}>
                        {cleansePrice}g
                      </p>
                      <p className="text-xs mb-1" style={{color: '#B794F4'}}>Removes 1 curse level</p>
                      <p className="text-xs italic" style={{color: COLORS.silver, fontSize: '10px'}}>{cleansePotionPurchasedToday ? "Sold out today" : "Purifying brew"}</p>
                      {cleansePotionPurchasedToday && (
                        <p className="text-xs mt-1" style={{color: '#EF4444'}}>Daily limit reached</p>
                      )}
                    </div>
                  </button>
                  
                  <button 
                    onClick={() => craftItem('weaponOil')} 
                    disabled={gold < weaponOilPrice || weaponOilActive}
                    className="p-2 rounded-lg border-2 transition-all relative overflow-hidden" 
                    style={{
                      background: (gold >= weaponOilPrice && !weaponOilActive) 
                        ? 'linear-gradient(135deg, rgba(234, 179, 8, 0.35) 0%, rgba(202, 138, 4, 0.4) 50%, rgba(161, 98, 7, 0.45) 100%)' 
                        : 'rgba(44, 62, 80, 0.3)', 
                      borderColor: (gold >= weaponOilPrice && !weaponOilActive) ? 'rgba(234, 179, 8, 0.65)' : 'rgba(149, 165, 166, 0.3)', 
                      opacity: (gold >= weaponOilPrice && !weaponOilActive) ? 1 : 0.5, 
                      cursor: (gold >= weaponOilPrice && !weaponOilActive) ? 'pointer' : 'not-allowed',
                      boxShadow: (gold >= weaponOilPrice && !weaponOilActive) ? '0 0 12px rgba(234, 179, 8, 0.2)' : 'none'
                    }} 
                    onMouseEnter={(e) => {
                      if (gold >= weaponOilPrice && !weaponOilActive) {
                        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(250, 204, 21, 0.4) 0%, rgba(234, 179, 8, 0.45) 50%, rgba(202, 138, 4, 0.5) 100%)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }
                    }} 
                    onMouseLeave={(e) => {
                      if (gold >= weaponOilPrice && !weaponOilActive) {
                        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(234, 179, 8, 0.35) 0%, rgba(202, 138, 4, 0.4) 50%, rgba(161, 98, 7, 0.45) 100%)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }
                    }}
                  >
                    <div>
                      <p className="font-bold text-sm mb-1" style={{color: '#F5F5DC'}}>Fury Elixir</p>
                      <p className="text-xs font-bold mb-1" style={{color: '#D4AF37'}}>
                        {weaponOilPrice}g
                      </p>
                      <p className="text-xs mb-1" style={{color: '#DAA520'}}>+5 Attack{weaponOilActive && <span className="ml-1" style={{color: '#90EE90'}}>✓</span>}</p>
                      <p className="text-xs italic" style={{color: COLORS.silver, fontSize: '10px'}}>"Rage incarnate"</p>
                    </div>
                  </button>
                  
                  <button 
                    onClick={() => craftItem('armorPolish')} 
                    disabled={gold < armorPolishPrice || armorPolishActive}
                    className="p-2 rounded-lg border-2 transition-all relative overflow-hidden" 
                    style={{
                      background: (gold >= armorPolishPrice && !armorPolishActive) 
                        ? 'linear-gradient(135deg, rgba(20, 184, 166, 0.35) 0%, rgba(13, 148, 136, 0.4) 50%, rgba(15, 118, 110, 0.45) 100%)' 
                        : 'rgba(44, 62, 80, 0.3)', 
                      borderColor: (gold >= armorPolishPrice && !armorPolishActive) ? 'rgba(20, 184, 166, 0.65)' : 'rgba(149, 165, 166, 0.3)', 
                      opacity: (gold >= armorPolishPrice && !armorPolishActive) ? 1 : 0.5, 
                      cursor: (gold >= armorPolishPrice && !armorPolishActive) ? 'pointer' : 'not-allowed',
                      boxShadow: (gold >= armorPolishPrice && !armorPolishActive) ? '0 0 12px rgba(20, 184, 166, 0.2)' : 'none'
                    }} 
                    onMouseEnter={(e) => {
                      if (gold >= armorPolishPrice && !armorPolishActive) {
                        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(45, 212, 191, 0.4) 0%, rgba(20, 184, 166, 0.45) 50%, rgba(13, 148, 136, 0.5) 100%)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }
                    }} 
                    onMouseLeave={(e) => {
                      if (gold >= armorPolishPrice && !armorPolishActive) {
                        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(20, 184, 166, 0.35) 0%, rgba(13, 148, 136, 0.4) 50%, rgba(15, 118, 110, 0.45) 100%)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }
                    }}
                  >
                    <div>
                      <p className="font-bold text-sm mb-1" style={{color: '#F5F5DC'}}>Ironbark Tonic</p>
                      <p className="text-xs font-bold mb-1" style={{color: '#D4AF37'}}>
                        {armorPolishPrice}g
                      </p>
                      <p className="text-xs mb-1" style={{color: '#6BB6FF'}}>+5 Defense{armorPolishActive && <span className="ml-1" style={{color: '#90EE90'}}>✓</span>}</p>
                      <p className="text-xs italic" style={{color: COLORS.silver, fontSize: '10px'}}>"Stone-hard skin"</p>
                    </div>
                  </button>
                  
                  <button 
                    onClick={() => craftItem('luckyCharm')} 
                    disabled={gold < luckyCharmPrice || luckyCharmActive}
                    className="p-2 rounded-lg border-2 transition-all relative overflow-hidden" 
                    style={{
                      background: (gold >= luckyCharmPrice && !luckyCharmActive) 
                        ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.35) 0%, rgba(22, 163, 74, 0.4) 50%, rgba(21, 128, 61, 0.45) 100%)' 
                        : 'rgba(44, 62, 80, 0.3)', 
                      borderColor: (gold >= luckyCharmPrice && !luckyCharmActive) ? 'rgba(34, 197, 94, 0.65)' : 'rgba(149, 165, 166, 0.3)', 
                      opacity: (gold >= luckyCharmPrice && !luckyCharmActive) ? 1 : 0.5, 
                      cursor: (gold >= luckyCharmPrice && !luckyCharmActive) ? 'pointer' : 'not-allowed',
                      boxShadow: (gold >= luckyCharmPrice && !luckyCharmActive) ? '0 0 12px rgba(34, 197, 94, 0.2)' : 'none'
                    }} 
                    onMouseEnter={(e) => {
                      if (gold >= luckyCharmPrice && !luckyCharmActive) {
                        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(74, 222, 128, 0.4) 0%, rgba(34, 197, 94, 0.45) 50%, rgba(22, 163, 74, 0.5) 100%)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }
                    }} 
                    onMouseLeave={(e) => {
                      if (gold >= luckyCharmPrice && !luckyCharmActive) {
                        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(34, 197, 94, 0.35) 0%, rgba(22, 163, 74, 0.4) 50%, rgba(21, 128, 61, 0.45) 100%)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }
                    }}
                  >
                    <div>
                      <p className="font-bold text-sm mb-1" style={{color: '#F5F5DC'}}>Fortune Philter</p>
                      <p className="text-xs font-bold mb-1" style={{color: '#D4AF37'}}>
                        {luckyCharmPrice}g
                      </p>
                      <p className="text-xs mb-1" style={{color: '#68D391'}}>2x loot{luckyCharmActive && <span className="ml-1" style={{color: '#90EE90'}}>✓</span>}</p>
                      <p className="text-xs italic" style={{color: COLORS.silver, fontSize: '10px'}}>"Liquid luck"</p>
                    </div>
                  </button>
                  </>);
                  })()}
                </div>
                </div>
                )}
                
                {/* Sell Equipment Tab */}
                {/* Sell Potions Tab */}
                {merchantTab === 'sellPotions' && (
                <div>
                  {/* Market Status Indicator for Potions */}
                  <div className="rounded-lg p-3 mb-4 border" style={{
                    background: 'rgba(0, 0, 0, 0.3)',
                    borderColor: 'rgba(212, 175, 55, 0.3)'
                  }}>
                    <p className="text-xs font-bold mb-2 text-center" style={{color: '#D4AF37'}}>TODAY'S MARKET RATES</p>
                    <div className="flex justify-center gap-4 text-xs">
                      <div className="text-center">
                        <p style={{color: COLORS.silver}}>Health</p>
                        <p className="font-bold" style={{color: marketModifiers.healthPotion < 0.9 ? '#68D391' : marketModifiers.healthPotion > 1.1 ? '#FF6B6B' : '#F5F5DC'}}>
                          {marketModifiers.healthPotion < 0.9 ? 'SALE' : marketModifiers.healthPotion > 1.1 ? 'HIGH' : 'NORMAL'}
                        </p>
                      </div>
                      <div className="text-center">
                        <p style={{color: COLORS.silver}}>Stamina</p>
                        <p className="font-bold" style={{color: marketModifiers.staminaPotion < 0.9 ? '#68D391' : marketModifiers.staminaPotion > 1.1 ? '#FF6B6B' : '#F5F5DC'}}>
                          {marketModifiers.staminaPotion < 0.9 ? 'SALE' : marketModifiers.staminaPotion > 1.1 ? 'HIGH' : 'NORMAL'}
                        </p>
                      </div>
                      <div className="text-center">
                        <p style={{color: COLORS.silver}}>Cleanse</p>
                        <p className="font-bold" style={{color: marketModifiers.cleansePotion < 0.9 ? '#68D391' : marketModifiers.cleansePotion > 1.1 ? '#FF6B6B' : '#F5F5DC'}}>
                          {marketModifiers.cleansePotion < 0.9 ? 'SALE' : marketModifiers.cleansePotion > 1.1 ? 'HIGH' : 'NORMAL'}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs italic text-center mt-2" style={{color: '#9CA3AF'}}>Prices refresh daily</p>
                  </div>
                  
                  {/* Potions */}
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {(healthPots > 0 || staminaPots > 0 || cleansePots > 0) ? (
                      <div>
                        <h3 className="font-bold text-sm mb-2" style={{color: '#D4AF37'}}>POTIONS</h3>
                        <div className="space-y-2">
                          {healthPots > 0 && (
                            <div className="rounded-lg p-3 border flex justify-between items-center" style={{
                              background: 'rgba(0, 0, 0, 0.3)',
                              borderColor: 'rgba(220, 38, 38, 0.6)'
                            }}>
                              <div className="flex-1">
                                <p className="text-sm font-bold" style={{color: '#FF6B6B'}}>Health Potion</p>
                                <p className="text-xs" style={{color: '#F5F5DC'}}>Quantity: {healthPots}</p>
                              </div>
                              <button
                                onClick={() => sellPotion('healthPotion')}
                                className="px-4 py-2 rounded-lg text-sm font-bold border-2 transition-all"
                                style={{
                                  background: 'linear-gradient(to bottom, rgba(184, 134, 11, 0.5), rgba(139, 101, 8, 0.55))',
                                  borderColor: 'rgba(212, 175, 55, 0.7)',
                                  color: '#F5F5DC'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(to bottom, rgba(218, 165, 32, 0.6), rgba(184, 134, 11, 0.65))'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'linear-gradient(to bottom, rgba(184, 134, 11, 0.5), rgba(139, 101, 8, 0.55))'}
                              >
                                Sell: {Math.floor(25 * (marketModifiers.healthPotion || 1.0) * 0.7)} Gold
                              </button>
                            </div>
                          )}
                          
                          {staminaPots > 0 && (
                            <div className="rounded-lg p-3 border flex justify-between items-center" style={{
                              background: 'rgba(0, 0, 0, 0.3)',
                              borderColor: 'rgba(59, 130, 246, 0.6)'
                            }}>
                              <div className="flex-1">
                                <p className="text-sm font-bold" style={{color: '#6BB6FF'}}>Stamina Potion</p>
                                <p className="text-xs" style={{color: '#F5F5DC'}}>Quantity: {staminaPots}</p>
                              </div>
                              <button
                                onClick={() => sellPotion('staminaPotion')}
                                className="px-4 py-2 rounded-lg text-sm font-bold border-2 transition-all"
                                style={{
                                  background: 'linear-gradient(to bottom, rgba(184, 134, 11, 0.5), rgba(139, 101, 8, 0.55))',
                                  borderColor: 'rgba(212, 175, 55, 0.7)',
                                  color: '#F5F5DC'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(to bottom, rgba(218, 165, 32, 0.6), rgba(184, 134, 11, 0.65))'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'linear-gradient(to bottom, rgba(184, 134, 11, 0.5), rgba(139, 101, 8, 0.55))'}
                              >
                                Sell: {Math.floor(20 * (marketModifiers.staminaPotion || 1.0) * 0.7)} Gold
                              </button>
                            </div>
                          )}
                          
                          {cleansePots > 0 && (
                            <div className="rounded-lg p-3 border flex justify-between items-center" style={{
                              background: 'rgba(0, 0, 0, 0.3)',
                              borderColor: 'rgba(168, 85, 247, 0.6)'
                            }}>
                              <div className="flex-1">
                                <p className="text-sm font-bold" style={{color: '#B794F4'}}>Cleanse Potion</p>
                                <p className="text-xs" style={{color: '#F5F5DC'}}>Quantity: {cleansePots}</p>
                              </div>
                              <button
                                onClick={() => sellPotion('cleansePotion')}
                                className="px-4 py-2 rounded-lg text-sm font-bold border-2 transition-all"
                                style={{
                                  background: 'linear-gradient(to bottom, rgba(184, 134, 11, 0.5), rgba(139, 101, 8, 0.55))',
                                  borderColor: 'rgba(212, 175, 55, 0.7)',
                                  color: '#F5F5DC'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(to bottom, rgba(218, 165, 32, 0.6), rgba(184, 134, 11, 0.65))'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'linear-gradient(to bottom, rgba(184, 134, 11, 0.5), rgba(139, 101, 8, 0.55))'}
                              >
                                Sell: {Math.floor(50 * (marketModifiers.cleansePotion || 1.0) * 0.7)} Gold
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-lg p-8 border-2 text-center" style={{
                        background: 'rgba(0, 0, 0, 0.3)',
                        borderColor: 'rgba(212, 175, 55, 0.3)'
                      }}>
                        <p className="text-sm italic" style={{color: '#9CA3AF'}}>
                          No potions to sell. Purchase potions or defeat enemies to gather them.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                )}
                
                {/* Buy Equipment Tab */}
                {merchantTab === 'buyEquipment' && (
                <div>
                  {/* Market Status Indicator */}
                  <div className="rounded-lg p-3 mb-4 border" style={{
                    background: 'rgba(0, 0, 0, 0.3)',
                    borderColor: 'rgba(212, 175, 55, 0.3)'
                  }}>
                    <p className="text-xs font-bold mb-2 text-center" style={{color: '#D4AF37'}}>TODAY'S MARKET RATES</p>
                    <div className="grid grid-cols-4 gap-2 text-xs">
                      <div className="text-center">
                        <p style={{color: COLORS.silver}}>Weapons</p>
                        <p className="font-bold" style={{color: marketModifiers.weapon < 0.9 ? '#68D391' : marketModifiers.weapon > 1.1 ? '#FF6B6B' : '#F5F5DC'}}>
                          {marketModifiers.weapon < 0.9 ? 'SALE' : marketModifiers.weapon > 1.1 ? 'HIGH' : 'NORMAL'}
                        </p>
                      </div>
                      <div className="text-center">
                        <p style={{color: COLORS.silver}}>Armor</p>
                        <p className="font-bold" style={{color: marketModifiers.armor < 0.9 ? '#68D391' : marketModifiers.armor > 1.1 ? '#FF6B6B' : '#F5F5DC'}}>
                          {marketModifiers.armor < 0.9 ? 'SALE' : marketModifiers.armor > 1.1 ? 'HIGH' : 'NORMAL'}
                        </p>
                      </div>
                      <div className="text-center">
                        <p style={{color: COLORS.silver}}>Pendants</p>
                        <p className="font-bold" style={{color: marketModifiers.pendant < 0.9 ? '#68D391' : marketModifiers.pendant > 1.1 ? '#FF6B6B' : '#F5F5DC'}}>
                          {marketModifiers.pendant < 0.9 ? 'SALE' : marketModifiers.pendant > 1.1 ? 'HIGH' : 'NORMAL'}
                        </p>
                      </div>
                      <div className="text-center">
                        <p style={{color: COLORS.silver}}>Rings</p>
                        <p className="font-bold" style={{color: marketModifiers.ring < 0.9 ? '#68D391' : marketModifiers.ring > 1.1 ? '#FF6B6B' : '#F5F5DC'}}>
                          {marketModifiers.ring < 0.9 ? 'SALE' : marketModifiers.ring > 1.1 ? 'HIGH' : 'NORMAL'}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs italic text-center mt-2" style={{color: '#9CA3AF'}}>Prices refresh every 2 days</p>
                  </div>
                  
                  {/* Shop Items */}
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {shopInventory.length > 0 ? (
                      sortByRarity(shopInventory).map(item => {
                        const basePrice = GAME_CONSTANTS.SHOP_CONFIG.costs[item.rarity];
                        const itemType = item.type === 'armor' ? 'armor' : item.type;
                        const marketMod = marketModifiers[itemType] || 1.0;
                        const finalPrice = Math.floor(basePrice * marketMod);
                        const canAfford = gold >= finalPrice;
                        
                        return (
                          <div key={item.id} className="rounded-lg p-3 border-2 transition-all" style={{
                            background: 'rgba(0, 0, 0, 0.4)',
                            borderColor: getRarityColor(item.rarity)
                          }}>
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex-1">
                                <p className="text-sm font-bold mb-1" style={{color: getRarityColor(item.rarity)}}>
                                  {item.name}
                                </p>
                                <p className="text-xs mb-1" style={{color: COLORS.silver}}>
                                  {GAME_CONSTANTS.RARITY_TIERS[item.rarity].name} {item.type === 'armor' ? item.slot : item.type}
                                </p>
                                {item.type === 'weapon' && (
                                  <p className="text-xs" style={{color: '#68D391'}}>+{item.attack} Attack</p>
                                )}
                                {item.type === 'armor' && (
                                  <p className="text-xs" style={{color: '#6BB6FF'}}>+{item.defense} Defense</p>
                                )}
                                {item.type === 'pendant' && (
                                  <p className="text-xs" style={{color: '#68D391'}}>+{item.hp} Health</p>
                                )}
                                {item.type === 'ring' && (
                                  <p className="text-xs" style={{color: '#6BB6FF'}}>+{item.stamina} STA</p>
                                )}
                                {item.affixes && Object.keys(item.affixes).length > 0 && (
                                  <div className="mt-1">
                                    {Object.entries(item.affixes).map(([affix, value]) => (
                                      <p key={affix} className="text-xs" style={{color: '#D4AF37'}}>
                                        +{Math.round(value * 10) / 10} {affix.replace(/([A-Z])/g, ' $1').toLowerCase()}
                                      </p>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <button
                                onClick={() => purchaseShopItem(item)}
                                disabled={!canAfford}
                                className="px-4 py-2 rounded-lg font-bold text-sm transition-all border-2 ml-3"
                                style={{
                                  background: canAfford ? 'linear-gradient(to bottom, rgba(184, 134, 11, 0.6), rgba(139, 101, 8, 0.65))' : 'rgba(60, 60, 60, 0.5)',
                                  borderColor: canAfford ? 'rgba(212, 175, 55, 0.7)' : '#555',
                                  color: canAfford ? '#F5F5DC' : '#888',
                                  cursor: canAfford ? 'pointer' : 'not-allowed',
                                  opacity: canAfford ? 1 : 0.5
                                }}
                                onMouseEnter={(e) => {
                                  if (canAfford) {
                                    e.currentTarget.style.background = 'linear-gradient(to bottom, rgba(218, 165, 32, 0.7), rgba(184, 134, 11, 0.75))';
                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (canAfford) {
                                    e.currentTarget.style.background = 'linear-gradient(to bottom, rgba(184, 134, 11, 0.6), rgba(139, 101, 8, 0.65))';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                  }
                                }}
                              >
                                {finalPrice}g
                              </button>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-8">
                        <p style={{color: COLORS.silver}}>The merchant's shelves are empty.</p>
                        <p className="text-xs mt-2" style={{color: '#9CA3AF'}}>Check back in {2 - (currentDay % 2)} day(s)</p>
                      </div>
                    )}
                  </div>
                </div>
                )}
                
                {/* Sell Equipment Tab */}
                {merchantTab === 'sellEquipment' && (
                <div>
                  {/* Market Status Indicator */}
                  <div className="rounded-lg p-4 mb-4 border-2" style={{
                    background: 'rgba(0, 0, 0, 0.3)',
                    borderColor: 'rgba(212, 175, 55, 0.3)'
                  }}>
                    <p className="text-xs font-bold mb-2 text-center" style={{color: '#D4AF37'}}>TODAY'S MARKET RATES</p>
                    <div className="grid grid-cols-4 gap-2 text-xs">
                      <div className="text-center">
                        <p style={{color: COLORS.silver}}>Weapons</p>
                        <p className="font-bold" style={{color: marketModifiers.weapon < 0.9 ? '#68D391' : marketModifiers.weapon > 1.1 ? '#FF6B6B' : '#F5F5DC'}}>
                          {marketModifiers.weapon < 0.9 ? 'SALE' : marketModifiers.weapon > 1.1 ? 'HIGH' : 'NORMAL'}
                        </p>
                      </div>
                      <div className="text-center">
                        <p style={{color: COLORS.silver}}>Armor</p>
                        <p className="font-bold" style={{color: marketModifiers.armor < 0.9 ? '#68D391' : marketModifiers.armor > 1.1 ? '#FF6B6B' : '#F5F5DC'}}>
                          {marketModifiers.armor < 0.9 ? 'SALE' : marketModifiers.armor > 1.1 ? 'HIGH' : 'NORMAL'}
                        </p>
                      </div>
                      <div className="text-center">
                        <p style={{color: COLORS.silver}}>Pendants</p>
                        <p className="font-bold" style={{color: marketModifiers.pendant < 0.9 ? '#68D391' : marketModifiers.pendant > 1.1 ? '#FF6B6B' : '#F5F5DC'}}>
                          {marketModifiers.pendant < 0.9 ? 'SALE' : marketModifiers.pendant > 1.1 ? 'HIGH' : 'NORMAL'}
                        </p>
                      </div>
                      <div className="text-center">
                        <p style={{color: COLORS.silver}}>Rings</p>
                        <p className="font-bold" style={{color: marketModifiers.ring < 0.9 ? '#68D391' : marketModifiers.ring > 1.1 ? '#FF6B6B' : '#F5F5DC'}}>
                          {marketModifiers.ring < 0.9 ? 'SALE' : marketModifiers.ring > 1.1 ? 'HIGH' : 'NORMAL'}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs italic text-center mt-2" style={{color: '#9CA3AF'}}>Prices refresh daily</p>
                  </div>
                  
                  {/* Sellable Equipment Lists */}
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {/* Weapons */}
                    {weaponInventory.length > 0 && (
                      <div>
                        <h3 className="font-bold text-sm mb-2" style={{color: '#D4AF37'}}>WEAPONS</h3>
                        <div className="space-y-2">
                          {sortByRarity(weaponInventory).map(wpn => {
                            const sellPrice = calculateSellPrice(wpn, 'weapon');
                            return (
                              <div key={wpn.id} className="rounded-lg p-3 border flex justify-between items-center" style={{
                                background: 'rgba(0, 0, 0, 0.3)',
                                borderColor: getRarityColor(wpn.rarity || 'common')
                              }}>
                                <div className="flex-1">
                                  <p className="text-sm font-bold" style={{color: getRarityColor(wpn.rarity || 'common')}}>{wpn.name}</p>
                                  <p className="text-xs" style={{color: '#F5F5DC'}}>+{wpn.attack} Attack</p>
                                  {wpn.rarity && (
                                    <p className="text-xs italic" style={{color: getRarityColor(wpn.rarity)}}>
                                      {GAME_CONSTANTS.RARITY_TIERS[wpn.rarity].name}
                                    </p>
                                  )}
                                </div>
                                <button
                                  onClick={() => sellEquipment(wpn, 'weapon')}
                                  className="px-4 py-2 rounded-lg text-sm font-bold border-2 transition-all"
                                  style={{
                                    background: 'linear-gradient(to bottom, rgba(184, 134, 11, 0.5), rgba(139, 101, 8, 0.55))',
                                    borderColor: 'rgba(212, 175, 55, 0.7)',
                                    color: '#F5F5DC'
                                  }}
                                  onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(to bottom, rgba(218, 165, 32, 0.6), rgba(184, 134, 11, 0.65))'}
                                  onMouseLeave={(e) => e.currentTarget.style.background = 'linear-gradient(to bottom, rgba(184, 134, 11, 0.5), rgba(139, 101, 8, 0.55))'}
                                >
                                  Sell: {sellPrice} Gold
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    
                    {/* Armor - loop through each slot */}
                    {(armorInventory.helmet.length > 0 || armorInventory.chest.length > 0 || armorInventory.gloves.length > 0 || armorInventory.boots.length > 0) && (
                      <div>
                        <h3 className="font-bold text-sm mb-2" style={{color: '#D4AF37'}}>ARMOR</h3>
                        <div className="space-y-2">
                          {Object.entries(armorInventory).map(([slot, items]) => 
                            sortByRarity(items).map(arm => {
                              const sellPrice = calculateSellPrice(arm, 'armor');
                              return (
                                <div key={arm.id} className="rounded-lg p-3 border flex justify-between items-center" style={{
                                  background: 'rgba(0, 0, 0, 0.3)',
                                  borderColor: getRarityColor(arm.rarity || 'common')
                                }}>
                                  <div className="flex-1">
                                    <p className="text-sm font-bold" style={{color: getRarityColor(arm.rarity || 'common')}}>{arm.name}</p>
                                    <p className="text-xs" style={{color: '#F5F5DC'}}>+{arm.defense} Defense • {slot.charAt(0).toUpperCase() + slot.slice(1)}</p>
                                    {arm.rarity && (
                                      <p className="text-xs italic" style={{color: getRarityColor(arm.rarity)}}>
                                        {GAME_CONSTANTS.RARITY_TIERS[arm.rarity].name}
                                      </p>
                                    )}
                                  </div>
                                  <button
                                    onClick={() => sellEquipment(arm, 'armor')}
                                    className="px-4 py-2 rounded-lg text-sm font-bold border-2 transition-all"
                                    style={{
                                      background: 'linear-gradient(to bottom, rgba(184, 134, 11, 0.5), rgba(139, 101, 8, 0.55))',
                                      borderColor: 'rgba(212, 175, 55, 0.7)',
                                      color: '#F5F5DC'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(to bottom, rgba(218, 165, 32, 0.6), rgba(184, 134, 11, 0.65))'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'linear-gradient(to bottom, rgba(184, 134, 11, 0.5), rgba(139, 101, 8, 0.55))'}
                                  >
                                    Sell: {sellPrice} Gold
                                  </button>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Pendants */}
                    {pendantInventory.length > 0 && (
                      <div>
                        <h3 className="font-bold text-sm mb-2" style={{color: '#D4AF37'}}>PENDANTS</h3>
                        <div className="space-y-2">
                          {sortByRarity(pendantInventory).map(pnd => {
                            const sellPrice = calculateSellPrice(pnd, 'pendant');
                            return (
                              <div key={pnd.id} className="rounded-lg p-3 border flex justify-between items-center" style={{
                                background: 'rgba(0, 0, 0, 0.3)',
                                borderColor: getRarityColor(pnd.rarity || 'common')
                              }}>
                                <div className="flex-1">
                                  <p className="text-sm font-bold" style={{color: getRarityColor(pnd.rarity || 'common')}}>{pnd.name}</p>
                                  <p className="text-xs" style={{color: '#68D391'}}>+{pnd.hp} Health</p>
                                  {pnd.rarity && (
                                    <p className="text-xs italic" style={{color: getRarityColor(pnd.rarity)}}>
                                      {GAME_CONSTANTS.RARITY_TIERS[pnd.rarity].name}
                                    </p>
                                  )}
                                </div>
                                <button
                                  onClick={() => sellEquipment(pnd, 'pendant')}
                                  className="px-4 py-2 rounded-lg text-sm font-bold border-2 transition-all"
                                  style={{
                                    background: 'linear-gradient(to bottom, rgba(184, 134, 11, 0.5), rgba(139, 101, 8, 0.55))',
                                    borderColor: 'rgba(212, 175, 55, 0.7)',
                                    color: '#F5F5DC'
                                  }}
                                  onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(to bottom, rgba(218, 165, 32, 0.6), rgba(184, 134, 11, 0.65))'}
                                  onMouseLeave={(e) => e.currentTarget.style.background = 'linear-gradient(to bottom, rgba(184, 134, 11, 0.5), rgba(139, 101, 8, 0.55))'}
                                >
                                  Sell: {sellPrice} Gold
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    
                    {/* Rings */}
                    {ringInventory.length > 0 && (
                      <div>
                        <h3 className="font-bold text-sm mb-2" style={{color: '#D4AF37'}}>RINGS</h3>
                        <div className="space-y-2">
                          {sortByRarity(ringInventory).map(rng => {
                            const sellPrice = calculateSellPrice(rng, 'ring');
                            return (
                              <div key={rng.id} className="rounded-lg p-3 border flex justify-between items-center" style={{
                                background: 'rgba(0, 0, 0, 0.3)',
                                borderColor: getRarityColor(rng.rarity || 'common')
                              }}>
                                <div className="flex-1">
                                  <p className="text-sm font-bold" style={{color: getRarityColor(rng.rarity || 'common')}}>{rng.name}</p>
                                  <p className="text-xs" style={{color: '#4FC3F7'}}>+{rng.stamina} STA</p>
                                  {rng.rarity && (
                                    <p className="text-xs italic" style={{color: getRarityColor(rng.rarity)}}>
                                      {GAME_CONSTANTS.RARITY_TIERS[rng.rarity].name}
                                    </p>
                                  )}
                                </div>
                                <button
                                  onClick={() => sellEquipment(rng, 'ring')}
                                  className="px-4 py-2 rounded-lg text-sm font-bold border-2 transition-all"
                                  style={{
                                    background: 'linear-gradient(to bottom, rgba(184, 134, 11, 0.5), rgba(139, 101, 8, 0.55))',
                                    borderColor: 'rgba(212, 175, 55, 0.7)',
                                    color: '#F5F5DC'
                                  }}
                                  onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(to bottom, rgba(218, 165, 32, 0.6), rgba(184, 134, 11, 0.65))'}
                                  onMouseLeave={(e) => e.currentTarget.style.background = 'linear-gradient(to bottom, rgba(184, 134, 11, 0.5), rgba(139, 101, 8, 0.55))'}
                                >
                                  Sell: {sellPrice} Gold
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    
                    {/* Empty State */}
                    {weaponInventory.length === 0 && 
                     armorInventory.helmet.length === 0 && 
                     armorInventory.chest.length === 0 && 
                     armorInventory.gloves.length === 0 && 
                     armorInventory.boots.length === 0 && 
                     pendantInventory.length === 0 && 
                     ringInventory.length === 0 && (
                      <div className="rounded-lg p-8 border-2 text-center" style={{
                        background: 'rgba(0, 0, 0, 0.3)',
                        borderColor: 'rgba(212, 175, 55, 0.3)'
                      }}>
                        <p className="text-sm italic" style={{color: '#9CA3AF'}}>
                          No equipment to sell. Defeat enemies to gather loot.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                )}
                
              </div>
            </div>
          )}

          {showCustomizeModal && (
  <div className="fixed inset-0 bg-black bg-opacity-90 flex items-start justify-center p-4 z-50 overflow-y-auto" onClick={() => setShowCustomizeModal(false)}>
    <div className="rounded-xl p-6 max-w-md w-full border-2 my-8" style={{background: VISUAL_STYLES.modal.dark, borderColor: COLORS.burgundy.base, boxShadow: VISUAL_STYLES.shadow.elevated}} onClick={e => e.stopPropagation()}>
      <div className="mb-6 relative">
        <button 
          onClick={() => setShowCustomizeModal(false)} 
          className="absolute -top-2 -right-2 p-2 rounded-lg border-2 transition-all"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            borderColor: 'rgba(212, 175, 55, 0.4)',
            color: '#D4AF37'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
            e.currentTarget.style.borderColor = '#D4AF37';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
            e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.4)';
          }}
        >
          <X size={20}/>
        </button>
        <div className="text-center">
          <h3 className="text-3xl font-bold mb-2" style={{color: '#D4AF37', letterSpacing: '0.1em'}}>CUSTOMIZE YOUR HERO</h3>
          <div className="flex items-center justify-center gap-2">
            <div style={{width: '100px', height: '1px', background: 'linear-gradient(to right, transparent, rgba(212, 175, 55, 0.3))'}}></div>
            <span style={{color: 'rgba(212, 175, 55, 0.4)', fontSize: '8px'}}>◆</span>
            <div style={{width: '100px', height: '1px', background: 'linear-gradient(to left, transparent, rgba(212, 175, 55, 0.3))'}}></div>
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
          spellCheck="true"
          autoCorrect="on"
          autoCapitalize="words"
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
              addLog(`The hero has been customized! ${customName.trim() ? `Name: ${customName.trim()}` : ''} ${customClass ? `Class: ${customClass.name}` : ''}`);
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
  <div className="fixed inset-0 bg-black bg-opacity-90 flex items-start justify-center p-4 z-50 overflow-y-auto" onClick={() => setShowDeckModal(false)}>
    <div className="rounded-xl p-6 max-w-md w-full border-2 relative my-8" style={{
      background: 'linear-gradient(to bottom, rgba(50, 8, 8, 0.95), rgba(35, 5, 5, 0.95), rgba(22, 3, 5, 0.95))',
      borderColor: COLORS.gold,
      boxShadow: '0 0 15px rgba(212, 175, 55, 0.25), 0 0 30px rgba(212, 175, 55, 0.1)'
    }} onClick={e => e.stopPropagation()}>
      <div className="mb-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-2" style={{color: '#D4AF37', letterSpacing: '0.1em'}}>CREATE DECK</h2>
          <div className="flex items-center justify-center gap-2 mb-2">
            <div style={{width: '120px', height: '1px', background: 'linear-gradient(to right, transparent, rgba(212, 175, 55, 0.3))'}}></div>
            <span style={{color: 'rgba(212, 175, 55, 0.4)', fontSize: '8px'}}>◆</span>
            <div style={{width: '120px', height: '1px', background: 'linear-gradient(to left, transparent, rgba(212, 175, 55, 0.3))'}}></div>
          </div>
          <p className="text-sm mt-2 italic" style={{color: COLORS.silver}}>"Forge knowledge in the fires of determination..."</p>
        </div>
      </div>
      
      <input 
        type="text" 
        placeholder="Deck name (e.g., Spanish Vocabulary)" 
        value={newDeck.name} 
        onChange={e => setNewDeck({name: e.target.value})} 
        spellCheck="true"
        autoCorrect="on"
        autoCapitalize="words"
        className="w-full p-3 rounded-lg mb-4 border focus:outline-none" 
        style={{
          background: 'rgba(0, 0, 0, 0.5)',
          color: '#F5F5DC',
          borderColor: 'rgba(139, 26, 40, 0.4)',
          boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.2)'
        }}
        onFocus={(e) => e.target.style.borderColor = 'rgba(139, 26, 40, 0.8)'}
        onBlur={(e) => e.target.style.borderColor = 'rgba(139, 26, 40, 0.4)'}
        autoFocus 
      />
      
      <div className="flex gap-2">
        <button 
          onClick={() => {
            if (newDeck.name.trim()) {
              setFlashcardDecks(prev => [...prev, { name: newDeck.name, cards: [] }]);
              addLog(`Created deck: ${newDeck.name}`);
              updateAchievementStat('decks_created');
              setNewDeck({name: ''});
              setShowDeckModal(false);
            }
          }}
          disabled={!newDeck.name.trim()} 
          className="flex-1 py-2 rounded-lg transition-all border-2" 
          style={{
            backgroundColor: !newDeck.name.trim() ? 'rgba(44, 62, 80, 0.5)' : 'rgba(139, 26, 40, 0.8)',
            borderColor: !newDeck.name.trim() ? 'rgba(149, 165, 166, 0.3)' : 'rgba(184, 134, 11, 0.7)',
            color: '#F5F5DC',
            cursor: !newDeck.name.trim() ? 'not-allowed' : 'pointer',
            opacity: !newDeck.name.trim() ? 0.5 : 1
          }} 
          onMouseEnter={(e) => {if (newDeck.name.trim()) e.currentTarget.style.backgroundColor = 'rgba(155, 27, 48, 0.9)'}} 
          onMouseLeave={(e) => {if (newDeck.name.trim()) e.currentTarget.style.backgroundColor = 'rgba(139, 26, 40, 0.8)'}}
        >
          Create Deck
        </button>
        <button 
          onClick={() => { setShowDeckModal(false); setNewDeck({name: ''}); }} 
          className="flex-1 py-2 rounded-lg transition-all border-2" 
          style={{
            backgroundColor: COLORS.slate.base,
            borderColor: COLORS.slate.border,
            color: '#F5F5DC'
          }} 
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.slate.hover} 
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = COLORS.slate.base}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}

{showCardModal && selectedDeck !== null && flashcardDecks[selectedDeck] && (
  <div className="fixed inset-0 bg-black bg-opacity-90 flex items-start justify-center p-4 z-50 overflow-y-auto" onClick={() => setShowCardModal(false)}>
    <div className="rounded-xl p-6 max-w-md w-full border-2 relative my-8" style={{
      background: 'linear-gradient(to bottom, rgba(50, 8, 8, 0.95), rgba(35, 5, 5, 0.95), rgba(22, 3, 5, 0.95))',
      borderColor: COLORS.gold,
      boxShadow: '0 0 15px rgba(212, 175, 55, 0.25), 0 0 30px rgba(212, 175, 55, 0.1)'
    }} onClick={e => e.stopPropagation()}>
      <div className="mb-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-2" style={{color: '#D4AF37', letterSpacing: '0.1em'}}>ADD CARD</h2>
          <div className="flex items-center justify-center gap-2 mb-2">
            <div style={{width: '120px', height: '1px', background: 'linear-gradient(to right, transparent, rgba(212, 175, 55, 0.3))'}}></div>
            <span style={{color: 'rgba(212, 175, 55, 0.4)', fontSize: '8px'}}>◆</span>
            <div style={{width: '120px', height: '1px', background: 'linear-gradient(to left, transparent, rgba(212, 175, 55, 0.3))'}}></div>
          </div>
          <p className="text-sm mt-2 italic" style={{color: COLORS.silver}}>"{flashcardDecks[selectedDeck].name}"</p>
        </div>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm mb-2" style={{color: COLORS.silver}}>Front (Question)</label>
        <textarea 
          placeholder="e.g., What is the capital of France?" 
          value={newCard.front} 
          onChange={e => setNewCard({...newCard, front: e.target.value})} 
          className="w-full p-3 rounded-lg border focus:outline-none resize-none" 
          style={{
            background: 'rgba(0, 0, 0, 0.5)',
            color: '#F5F5DC',
            borderColor: 'rgba(139, 26, 40, 0.4)',
            boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.2)'
          }}
          onFocus={(e) => e.target.style.borderColor = 'rgba(139, 26, 40, 0.8)'}
          onBlur={(e) => e.target.style.borderColor = 'rgba(139, 26, 40, 0.4)'}
          rows="3"
          autoFocus 
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-sm mb-2" style={{color: COLORS.silver}}>Back (Answer)</label>
        <textarea 
          placeholder="e.g., Paris" 
          value={newCard.back} 
          onChange={e => setNewCard({...newCard, back: e.target.value})} 
          className="w-full p-3 rounded-lg border focus:outline-none resize-none" 
          style={{
            background: 'rgba(0, 0, 0, 0.5)',
            color: '#F5F5DC',
            borderColor: 'rgba(139, 26, 40, 0.4)',
            boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.2)'
          }}
          onFocus={(e) => e.target.style.borderColor = 'rgba(139, 26, 40, 0.8)'}
          onBlur={(e) => e.target.style.borderColor = 'rgba(139, 26, 40, 0.4)'}
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
              addLog(`Added card to ${flashcardDecks[selectedDeck].name}`);
              updateAchievementStat('cards_created');
              setNewCard({front: '', back: ''});
              setShowCardModal(false);
            }
          }}
          disabled={!newCard.front.trim() || !newCard.back.trim()} 
          className="flex-1 py-2 rounded-lg transition-all border-2"
          style={{
            backgroundColor: (!newCard.front.trim() || !newCard.back.trim()) ? 'rgba(44, 62, 80, 0.5)' : 'rgba(139, 26, 40, 0.8)',
            borderColor: (!newCard.front.trim() || !newCard.back.trim()) ? 'rgba(149, 165, 166, 0.3)' : 'rgba(184, 134, 11, 0.7)',
            color: '#F5F5DC',
            cursor: (!newCard.front.trim() || !newCard.back.trim()) ? 'not-allowed' : 'pointer',
            opacity: (!newCard.front.trim() || !newCard.back.trim()) ? 0.5 : 1
          }}
          onMouseEnter={(e) => {if (newCard.front.trim() && newCard.back.trim()) e.currentTarget.style.backgroundColor = 'rgba(155, 27, 48, 0.9)'}}
          onMouseLeave={(e) => {if (newCard.front.trim() && newCard.back.trim()) e.currentTarget.style.backgroundColor = 'rgba(139, 26, 40, 0.8)'}}
        >
          Add Card
        </button>
        <button 
          onClick={() => { setShowCardModal(false); setNewCard({front: '', back: ''}); }} 
          className="flex-1 py-2 rounded-lg transition-all border-2"
          style={{
            backgroundColor: COLORS.slate.base,
            borderColor: COLORS.slate.border,
            color: '#F5F5DC'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.slate.hover}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = COLORS.slate.base}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}

{showStudyModal && selectedDeck !== null && flashcardDecks[selectedDeck] && (
  <div className="fixed inset-0 bg-black bg-opacity-90 flex items-start justify-center p-4 z-50 overflow-y-auto">
    <div className="rounded-xl p-8 max-w-2xl w-full border-2 relative my-8" style={{
      background: 'linear-gradient(to bottom, rgba(50, 8, 8, 0.95), rgba(35, 5, 5, 0.95), rgba(22, 3, 5, 0.95))',
      borderColor: COLORS.gold,
      boxShadow: '0 0 15px rgba(212, 175, 55, 0.25), 0 0 30px rgba(212, 175, 55, 0.1)'
    }}>
      <div className="mb-6 relative">
        <button 
          onClick={() => {
            if (reviewingMistakes) {
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
          className="absolute -top-2 -right-2 p-2 rounded-lg border-2 transition-all"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            borderColor: 'rgba(212, 175, 55, 0.4)',
            color: '#D4AF37'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
            e.currentTarget.style.borderColor = '#D4AF37';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
            e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.4)';
          }}
        >
          <X size={20}/>
        </button>
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-2" style={{color: '#D4AF37', letterSpacing: '0.1em', fontFamily: 'Cinzel, serif'}}>{flashcardDecks[selectedDeck].name}</h2>
          <div className="flex items-center justify-center gap-2 mb-2">
            <div style={{width: '150px', height: '1px', background: 'linear-gradient(to right, transparent, rgba(212, 175, 55, 0.3))'}}></div>
            <span style={{color: 'rgba(212, 175, 55, 0.4)', fontSize: '8px'}}>◆</span>
            <div style={{width: '150px', height: '1px', background: 'linear-gradient(to left, transparent, rgba(212, 175, 55, 0.3))'}}></div>
          </div>
          <p className="text-sm mt-2 italic" style={{color: COLORS.silver}}>"Each card brings you closer to mastery..."</p>
        </div>
      </div>
      
      <div 
        onClick={() => setIsFlipped(!isFlipped)}
        className="rounded-xl p-12 mb-6 min-h-[300px] flex items-center justify-center cursor-pointer transition-all border-2"
        style={{
          background: 'rgba(0, 0, 0, 0.4)',
          borderColor: 'rgba(139, 0, 0, 0.6)'
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(40, 0, 0, 0.5)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0, 0, 0, 0.4)'}
      >
        <div className="text-center">
          <p className="text-sm mb-4" style={{color: COLORS.silver}}>{isFlipped ? 'ANSWER' : 'QUESTION'}</p>
          <p className="text-2xl whitespace-pre-wrap" style={{color: '#F5F5DC'}}>
            {isFlipped 
              ? flashcardDecks[selectedDeck].cards[studyQueue[0]].back 
              : flashcardDecks[selectedDeck].cards[studyQueue[0]].front}
          </p>
          <p className="text-sm mt-6 italic" style={{color: COLORS.silver}}>Click to flip</p>
        </div>
      </div>
      
      <div className="rounded-full h-2 mb-6" style={{background: 'rgba(0, 0, 0, 0.4)'}}>
        <div 
          className="h-2 rounded-full transition-all" 
          style={{
            width: `${((flashcardDecks[selectedDeck].cards.length - studyQueue.length) / flashcardDecks[selectedDeck].cards.length) * 100}%`,
            background: 'linear-gradient(to right, #8B0000, #DC143C)'
          }}
        />
      </div>
      
      {isFlipped && (
        <div className="flex gap-4">
          <button
            onClick={() => {
              const currentCard = studyQueue[0];
              const newQueue = [...studyQueue.slice(1), currentCard];
              setStudyQueue(newQueue);
              setIsFlipped(false);
            }}
            className="flex-1 py-4 rounded-lg font-bold text-lg transition-all border-2"
            style={{
              backgroundColor: COLORS.burgundy.base,
              borderColor: COLORS.burgundy.border,
              color: '#F5F5DC'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.burgundy.hover}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = COLORS.burgundy.base}
          >
            Review Again
          </button>
          
          <button
            onClick={() => {
              const currentCard = studyQueue[0];
              setFlashcardDecks(prev => prev.map((deck, idx) => 
                idx === selectedDeck 
                  ? {...deck, cards: deck.cards.map((card, cardIdx) => 
                      cardIdx === currentCard ? {...card, mastered: true} : card
                    )}
                  : deck
              ));
              
              updateAchievementStat('cards_mastered');
              setXp(x => x + 5);
              
              const newQueue = studyQueue.slice(1);
              
              if (newQueue.length === 0) {
                const cardsStudied = flashcardDecks[selectedDeck].cards.length;
                const xpGain = 25;
                setXp(x => x + xpGain);
                addLog(`Completed deck! +${xpGain} bonus XP`);
                
                const roll = Math.random();
                if (roll < 0.3) {
                  setHealthPots(h => h + 1);
                  addLog('Found Health Potion!');
                } else if (roll < 0.5) {
                  setStaminaPots(s => s + 1);
                  addLog('Found Stamina Potion!');
                }
                
                if (reviewingMistakes) {
                  setMistakesReviewed(true);
                  setReviewingMistakes(false);
                  setShowStudyModal(false);
                  setShowQuizModal(true);
                  setShowQuizResults(true);
                  setIsFlipped(false);
                  addLog('Mistakes reviewed! Retake unlocked.');
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
            className="flex-1 py-4 rounded-lg font-bold text-lg transition-all border-2"
            style={{
              backgroundColor: COLORS.crimson.base,
              borderColor: COLORS.crimson.border,
              color: '#F5F5DC'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.crimson.hover}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = COLORS.crimson.base}
          >
            Got It! (+5 XP)
          </button>
        </div>
      )}
      
      {/* Cards Remaining Stats at Bottom */}
      <div className="mt-6 text-center">
        <p className="text-xs" style={{color: '#95A5A6'}}>
          Cards Remaining: <span className="font-bold" style={{color: '#D4AF37'}}>{studyQueue.length}</span> | 
          Total Studied: <span className="font-bold" style={{color: '#68D391'}}>{flashcardDecks[selectedDeck].cards.length - studyQueue.length + 1}</span>
        </p>
      </div>
    </div>
  </div>
)}

{showQuizModal && selectedDeck !== null && flashcardDecks[selectedDeck] && (
  <div className="fixed inset-0 bg-black bg-opacity-90 flex items-start justify-center p-4 z-50 overflow-y-auto">
    <div className="rounded-xl p-8 max-w-2xl w-full border-2 relative my-8" style={{
      background: 'linear-gradient(to bottom, rgba(50, 8, 8, 0.95), rgba(35, 5, 5, 0.95), rgba(22, 3, 5, 0.95))',
      borderColor: COLORS.gold,
      boxShadow: '0 0 15px rgba(212, 175, 55, 0.25), 0 0 30px rgba(212, 175, 55, 0.1)'
    }}>
      {!showQuizResults ? (
        <>
          <div className="mb-6 relative">
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
              className="absolute -top-2 -right-2 p-2 rounded-lg border-2 transition-all"
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                borderColor: 'rgba(212, 175, 55, 0.4)',
                color: '#D4AF37'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
                e.currentTarget.style.borderColor = '#D4AF37';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
                e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.4)';
              }}
            >
              <X size={20}/>
            </button>
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-2" style={{color: '#D4AF37', letterSpacing: '0.1em', fontFamily: 'Cinzel, serif'}}>{flashcardDecks[selectedDeck].name}</h2>
              <div className="flex items-center justify-center gap-2 mb-2">
                <div style={{width: '150px', height: '1px', background: 'linear-gradient(to right, transparent, rgba(212, 175, 55, 0.3))'}}></div>
                <span style={{color: 'rgba(212, 175, 55, 0.4)', fontSize: '8px'}}>◆</span>
                <div style={{width: '150px', height: '1px', background: 'linear-gradient(to left, transparent, rgba(212, 175, 55, 0.3))'}}></div>
              </div>
              <p className="text-sm mt-2 italic" style={{color: COLORS.silver}}>"Test your knowledge in the crucible of trial..."</p>
            </div>
          </div>
          
          <div className="rounded-xl p-8 mb-6 min-h-[200px] border-2" style={{
            background: 'rgba(0, 0, 0, 0.4)',
            borderColor: 'rgba(139, 0, 0, 0.6)'
          }}>
            <p className="text-sm mb-4" style={{color: COLORS.silver}}>QUESTION</p>
            <p className="text-2xl mb-8" style={{color: '#F5F5DC'}}>{quizQuestions[currentQuizIndex]?.question}</p>
            
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
          
          <div className="rounded-full h-2 mb-6" style={{background: 'rgba(0, 0, 0, 0.4)'}}>
            <div 
              className="h-2 rounded-full transition-all" 
              style={{
                width: `${((currentQuizIndex + 1) / quizQuestions.length) * 100}%`,
                background: 'linear-gradient(to right, #8B0000, #DC143C)'
              }}
            />
          </div>
          
          {/* Quiz Stats at Bottom */}
          <div className="mb-6 text-center">
            <p className="text-xs" style={{color: '#95A5A6'}}>
              Question: <span className="font-bold" style={{color: '#D4AF37'}}>{currentQuizIndex + 1}</span>/{quizQuestions.length} | 
              Score: <span className="font-bold" style={{color: '#68D391'}}>{quizScore}</span>/{quizQuestions.length}
            </p>
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
                  addLog(`Quiz complete! +${xpGain} XP${isRetakeQuiz ? ' (retake)' : ''}`);
                  
                  // Loot for good performance (70%+) - only on first attempt
                  if (!isRetakeQuiz && finalScore >= quizQuestions.length * 0.7) {
                    const roll = Math.random();
                    if (roll < 0.4) {
                      setHealthPots(h => h + 1);
                      addLog('Found Health Potion!');
                    } else if (roll < 0.7) {
                      setStaminaPots(s => s + 1);
                      addLog('Found Stamina Potion!');
                    }
                  }
                  
                  setShowQuizResults(true);
                } else {
                  setCurrentQuizIndex(nextIndex);
                  setSelectedAnswer(null);
                }
              }}
              className="w-full py-4 rounded-lg font-bold text-lg transition-all border-2"
              style={{
                backgroundColor: COLORS.crimson.base,
                borderColor: COLORS.crimson.border,
                color: '#F5F5DC'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.crimson.hover}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = COLORS.crimson.base}
            >
              {currentQuizIndex + 1 === quizQuestions.length ? 'See Results' : 'Next Question →'}
            </button>
          )}
        </>
      ) : (
        <div className="text-center">
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
            className="absolute top-4 right-4 text-gray-400 hover:text-white"
          >
            <X size={32}/>
          </button>
          
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2" style={{color: '#D4AF37', letterSpacing: '0.1em'}}>TRIAL COMPLETE</h2>
            <div className="flex items-center justify-center gap-2 mb-4">
              <div style={{width: '120px', height: '1px', background: 'linear-gradient(to right, transparent, rgba(212, 175, 55, 0.3))'}}></div>
              <span style={{color: 'rgba(212, 175, 55, 0.4)', fontSize: '8px'}}>◆</span>
              <div style={{width: '120px', height: '1px', background: 'linear-gradient(to left, transparent, rgba(212, 175, 55, 0.3))'}}></div>
            </div>
            <p className="text-5xl font-bold mb-4" style={{color: '#F5F5DC'}}>{quizScore} / {quizQuestions.length}</p>
            <p className="text-xl mb-2" style={{color: COLORS.silver}}>
              {quizScore === quizQuestions.length && 'Flawless Victory!'}
              {quizScore >= quizQuestions.length * 0.7 && quizScore < quizQuestions.length && 'Well Fought!'}
              {quizScore < quizQuestions.length * 0.7 && 'The Path Demands More...'}
            </p>
            {wrongCardIndices.length > 0 && (
              <p className="mt-2 italic" style={{color: '#FF6B6B'}}>{wrongCardIndices.length} question{wrongCardIndices.length !== 1 ? 's' : ''} yet unmastered</p>
            )}
          </div>
          
          <div className="rounded-lg p-6 mb-6 border-2" style={{
            background: 'rgba(184, 134, 11, 0.2)',
            borderColor: 'rgba(212, 175, 55, 0.4)'
          }}>
            <p className="text-xl mb-2" style={{color: COLORS.gold}}>+{isRetakeQuiz ? Math.floor(quizScore * 10 * 0.5) : quizScore * 10} XP Earned{isRetakeQuiz ? ' (Retake - 50%)' : ''}</p>
            {!isRetakeQuiz && quizScore >= quizQuestions.length * 0.7 && (
              <p style={{color: COLORS.silver}}>Bonus loot awarded! Check your inventory.</p>
            )}
          </div>
          
          <div className="space-y-3">
            {wrongCardIndices.length > 0 && !mistakesReviewed && (
              <button
                onClick={() => {
                  setStudyQueue([...wrongCardIndices]);
                  setReviewingMistakes(true);
                  setShowQuizModal(false);
                  setShowQuizResults(false);
                  setIsFlipped(false);
                  setShowStudyModal(true);
                }}
                className="w-full py-4 rounded-lg font-bold text-lg transition-all border-2"
                style={{
                  backgroundColor: COLORS.burgundy.base,
                  borderColor: COLORS.burgundy.border,
                  color: '#F5F5DC'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.burgundy.hover}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = COLORS.burgundy.base}
              >
                Review Mistakes ({wrongCardIndices.length} card{wrongCardIndices.length !== 1 ? 's' : ''})
              </button>
            )}
            
            <button
              onClick={() => {
                setShowQuizModal(false);
                setShowQuizResults(false);
                generateQuiz(selectedDeck, true);
              }}
              disabled={wrongCardIndices.length > 0 && !mistakesReviewed}
              className="w-full py-4 rounded-lg font-bold text-lg transition-all border-2"
              style={{
                backgroundColor: (wrongCardIndices.length > 0 && !mistakesReviewed) ? 'rgba(44, 62, 80, 0.5)' : COLORS.crimson.base,
                borderColor: (wrongCardIndices.length > 0 && !mistakesReviewed) ? 'rgba(149, 165, 166, 0.3)' : COLORS.crimson.border,
                color: (wrongCardIndices.length > 0 && !mistakesReviewed) ? COLORS.silver : '#F5F5DC',
                cursor: (wrongCardIndices.length > 0 && !mistakesReviewed) ? 'not-allowed' : 'pointer',
                opacity: (wrongCardIndices.length > 0 && !mistakesReviewed) ? 0.5 : 1
              }}
              onMouseEnter={(e) => {if (!(wrongCardIndices.length > 0 && !mistakesReviewed)) e.currentTarget.style.backgroundColor = COLORS.crimson.hover}}
              onMouseLeave={(e) => {if (!(wrongCardIndices.length > 0 && !mistakesReviewed)) e.currentTarget.style.backgroundColor = COLORS.crimson.base}}
            >
              {wrongCardIndices.length > 0 && !mistakesReviewed ? 'Review Mistakes First' : 'Retake Quiz (50% XP)'}
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
              className="w-full py-4 rounded-lg font-bold text-lg transition-all border-2"
              style={{
                backgroundColor: COLORS.slate.base,
                borderColor: COLORS.slate.border,
                color: '#F5F5DC'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.slate.hover}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = COLORS.slate.base}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  </div>
)}

{/* Match Game Modal */}
{showMatchModal && selectedDeck !== null && flashcardDecks[selectedDeck] && (
  <div className="fixed inset-0 bg-black bg-opacity-90 flex items-start justify-center p-4 z-50 overflow-y-auto">
    <div className="rounded-xl p-8 max-w-4xl w-full border-2 relative my-8" style={{
      background: 'linear-gradient(to bottom, rgba(30, 10, 40, 0.95), rgba(20, 0, 30, 0.95), rgba(15, 0, 20, 0.95))',
      borderColor: COLORS.gold,
      boxShadow: '0 0 15px rgba(212, 175, 55, 0.25), 0 0 30px rgba(212, 175, 55, 0.1)'
    }}>
      <div className="mb-6 relative">
        <button 
          onClick={() => {
            setShowMatchModal(false);
            setSelectedDeck(null);
            setMatchCards([]);
            setSelectedMatchCards([]);
            setMatchedPairs([]);
            setMatchGlowCards([]);
          }}
          className="absolute -top-2 -right-2 p-2 rounded-lg border-2 transition-all"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            borderColor: 'rgba(212, 175, 55, 0.4)',
            color: '#D4AF37'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
            e.currentTarget.style.borderColor = '#D4AF37';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
            e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.4)';
          }}
        >
          <X size={20}/>
        </button>
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-2" style={{color: '#D4AF37', letterSpacing: '0.1em', fontFamily: 'Cinzel, serif'}}>{flashcardDecks[selectedDeck].name}</h2>
          <div className="flex items-center justify-center gap-2 mb-2">
            <div style={{width: '150px', height: '1px', background: 'linear-gradient(to right, transparent, rgba(212, 175, 55, 0.3))'}}></div>
            <span style={{color: 'rgba(212, 175, 55, 0.4)', fontSize: '8px'}}>◆</span>
            <div style={{width: '150px', height: '1px', background: 'linear-gradient(to left, transparent, rgba(212, 175, 55, 0.3))'}}></div>
          </div>
          <p className="text-sm mt-2 italic" style={{color: COLORS.silver}}>"Match the pairs before time slips away..."</p>
        </div>
      </div>
      
      {matchedPairs.length === matchCards.length / 2 ? (
        // Victory screen
        <div className="text-center py-12">
          <h3 className="text-4xl font-bold mb-4" style={{color: '#D4AF37'}}>COMPLETE!</h3>
          <p className="text-2xl mb-6" style={{color: '#68D391'}}>
            Time: {Math.floor((Date.now() - matchStartTime) / 1000)} seconds
          </p>
          <p className="text-lg mb-6" style={{color: COLORS.silver}}>
            All pairs matched!
          </p>
          <button
            onClick={() => {
              // Award XP based on speed
              const timeBonus = Math.max(10, 50 - Math.floor((Date.now() - matchStartTime) / 1000));
              setXp(x => x + timeBonus);
              setGold(g => g + 5);
              addLog(`Match game completed! +${timeBonus} XP, +5 Gold`);
              
              setShowMatchModal(false);
              setSelectedDeck(null);
              setMatchCards([]);
              setSelectedMatchCards([]);
              setMatchedPairs([]);
              setMatchGlowCards([]);
            }}
            className="px-8 py-3 rounded-lg font-bold transition-all border-2"
            style={{
              background: 'linear-gradient(to bottom, #68D391, #48BB78)',
              borderColor: '#9AE6B4',
              color: '#F5F5DC'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(to bottom, #48BB78, #38A169)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'linear-gradient(to bottom, #68D391, #48BB78)'}
          >
            Collect Rewards
          </button>
        </div>
      ) : (
        // Game grid
        <div className={`grid gap-3 ${matchCards.length <= 8 ? 'grid-cols-4' : 'grid-cols-4'}`}>
          {matchCards.map((card, idx) => {
            const isSelected = selectedMatchCards.includes(idx);
            const isMatched = card.matched;
            const isGlowing = matchGlowCards.includes(idx);
            
            return (
              <button
                key={card.id}
                onClick={() => {
                  if (isMatched || selectedMatchCards.includes(idx) || selectedMatchCards.length >= 2) return;
                  
                  const newSelected = [...selectedMatchCards, idx];
                  setSelectedMatchCards(newSelected);
                  
                  if (newSelected.length === 2) {
                    // Check if they match
                    const card1 = matchCards[newSelected[0]];
                    const card2 = matchCards[newSelected[1]];
                    
                    if (card1.pairId === card2.pairId) {
                      // Match!
                      setMatchGlowCards(newSelected);
                      
                      setTimeout(() => {
                        setMatchCards(prev => prev.map((c, i) => 
                          newSelected.includes(i) ? {...c, matched: true} : c
                        ));
                        setMatchedPairs(prev => [...prev, card1.pairId]);
                        setSelectedMatchCards([]);
                        setMatchGlowCards([]);
                      }, 800);
                    } else {
                      // No match
                      setTimeout(() => {
                        setSelectedMatchCards([]);
                      }, 1000);
                    }
                  }
                }}
                disabled={isMatched}
                className={`p-4 rounded-lg border-2 transition-all min-h-[100px] flex items-center justify-center text-center ${
                  isMatched ? 'opacity-0 pointer-events-none' : ''
                } ${isGlowing ? 'animate-pulse' : ''}`}
                style={{
                  backgroundColor: isMatched 
                    ? 'transparent'
                    : isGlowing
                      ? 'rgba(104, 211, 145, 0.4)'
                      : isSelected 
                        ? 'rgba(184, 134, 11, 0.3)'
                        : 'rgba(0, 0, 0, 0.4)',
                  borderColor: isMatched
                    ? 'transparent'
                    : isGlowing
                      ? '#68D391'
                      : isSelected
                        ? '#D4AF37'
                        : 'rgba(139, 0, 0, 0.6)',
                  boxShadow: isGlowing
                    ? '0 0 20px rgba(104, 211, 145, 0.8), 0 0 40px rgba(104, 211, 145, 0.4)'
                    : isSelected
                      ? '0 0 10px rgba(212, 175, 55, 0.4)'
                      : 'none',
                  color: '#F5F5DC',
                  cursor: isMatched ? 'default' : 'pointer'
                }}
              >
                <span className="text-sm">{card.text}</span>
              </button>
            );
          })}
        </div>
      )}
      
      {/* Match Stats at Bottom */}
      {matchedPairs.length < matchCards.length / 2 && (
        <div className="mt-6 text-center">
          <p className="text-xs" style={{color: '#95A5A6'}}>
            Matched: <span className="font-bold" style={{color: '#D4AF37'}}>{matchedPairs.length}</span>/{matchCards.length / 2} pairs
            {matchStartTime && <span> | Time: <span className="font-bold" style={{color: '#68D391'}}>{Math.floor((Date.now() - matchStartTime) / 1000)}s</span></span>}
          </p>
        </div>
      )}
    </div>
  </div>
)}

         {showModal && (
  <div className="fixed inset-0 bg-black bg-opacity-90 flex items-start justify-center p-4 z-50 overflow-y-auto" onClick={() => setShowModal(false)}>
    <div className="rounded-xl p-6 max-w-md w-full border-2 relative" style={{background: 'linear-gradient(to bottom, rgba(50, 8, 8, 0.95), rgba(35, 5, 5, 0.95), rgba(22, 3, 5, 0.95))', borderColor: COLORS.gold, boxShadow: '0 0 15px rgba(212, 175, 55, 0.25), 0 0 30px rgba(212, 175, 55, 0.1)'}} onClick={e => e.stopPropagation()}>
      <div className="mb-6 relative">
        <button 
          onClick={() => setShowModal(false)} 
          className="absolute -top-2 -right-2 p-2 rounded-lg border-2 transition-all"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            borderColor: 'rgba(212, 175, 55, 0.4)',
            color: '#D4AF37'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
            e.currentTarget.style.borderColor = '#D4AF37';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
            e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.4)';
          }}
        >
          <X size={20}/>
        </button>
        <div className="text-center">
          <h3 className="text-3xl font-bold mb-2" style={{color: '#D4AF37', letterSpacing: '0.1em'}}>NEW TRIAL</h3>
          <div className="flex items-center justify-center gap-2 mb-2">
            <div style={{width: '120px', height: '1px', background: 'linear-gradient(to right, transparent, rgba(212, 175, 55, 0.3))'}}></div>
            <span style={{color: 'rgba(212, 175, 55, 0.4)', fontSize: '8px'}}>◆</span>
            <div style={{width: '120px', height: '1px', background: 'linear-gradient(to left, transparent, rgba(212, 175, 55, 0.3))'}}></div>
          </div>
          <p className="text-sm mt-2 italic" style={{color: COLORS.silver}}>"The darkness demands sacrifice..."</p>
        </div>
      </div>
      
      <input 
        type="text" 
        placeholder="Name your trial" 
        value={newTask.title} 
        onChange={e => setNewTask({...newTask, title: e.target.value})} 
        spellCheck="true"
        autoCorrect="on"
        autoCapitalize="sentences"
        onKeyDown={e => {
          if (e.key === 'Enter' && newTask.title) {
            addTask();
          }
        }}
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
              backgroundColor: newTask.priority === 'important' ? 'rgba(194, 144, 21, 0.35)' : 'rgba(0, 0, 0, 0.3)',
              borderColor: newTask.priority === 'important' ? COLORS.gold : 'rgba(128, 128, 128, 0.3)',
              color: '#F5F5DC',
              boxShadow: newTask.priority === 'important' ? 'inset 0 1px 0 rgba(212, 175, 55, 0.1)' : 'none'
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
            backgroundColor: !newTask.title ? '#2C3E50' : 'rgba(139, 26, 40, 0.8)',
            borderColor: !newTask.title ? '#95A5A6' : 'rgba(184, 134, 11, 0.7)',
            color: '#F5F5DC',
            cursor: !newTask.title ? 'not-allowed' : 'pointer',
            opacity: !newTask.title ? 0.5 : 1
          }}
          onMouseEnter={(e) => {if (newTask.title) e.currentTarget.style.backgroundColor = 'rgba(155, 27, 48, 0.9)'}}
          onMouseLeave={(e) => {if (newTask.title) e.currentTarget.style.backgroundColor = 'rgba(139, 26, 40, 0.8)'}}
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
  <div className="fixed inset-0 bg-black bg-opacity-90 flex items-start justify-center p-4 z-50 overflow-y-auto" onClick={() => setShowImportModal(false)}>
    <div className="rounded-xl p-6 max-w-md w-full border-2 relative" style={{background: 'linear-gradient(to bottom, rgba(0, 35, 35, 0.95), rgba(0, 26, 26, 0.95), rgba(0, 18, 18, 0.95))', borderColor: COLORS.gold, boxShadow: '0 0 12px rgba(212, 175, 55, 0.25), 0 0 20px rgba(212, 175, 55, 0.1)'}} onClick={e => e.stopPropagation()}>
      <div className="mb-6 relative">
        <button 
          onClick={() => setShowImportModal(false)} 
          className="absolute -top-2 -right-2 p-2 rounded-lg border-2 transition-all"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            borderColor: 'rgba(212, 175, 55, 0.4)',
            color: '#D4AF37'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
            e.currentTarget.style.borderColor = '#D4AF37';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
            e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.4)';
          }}
        >
          <X size={20}/>
        </button>
        <div className="text-center">
          <h3 className="text-3xl font-bold mb-2" style={{color: '#D4AF37', letterSpacing: '0.1em'}}>IMPORT FROM PLANNER</h3>
          <div className="flex items-center justify-center gap-2 mb-2">
            <div style={{width: '100px', height: '1px', background: 'linear-gradient(to right, transparent, rgba(212, 175, 55, 0.3))'}}></div>
            <span style={{color: 'rgba(212, 175, 55, 0.4)', fontSize: '8px'}}>◆</span>
            <div style={{width: '100px', height: '1px', background: 'linear-gradient(to left, transparent, rgba(212, 175, 55, 0.3))'}}></div>
          </div>
          <p className="text-sm mt-2 italic" style={{color: COLORS.silver}}>"Draw upon your prepared plans..."</p>
        </div>
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
                  ? 'rgba(0, 82, 82, 0.45)' 
                  : taskCount > 0 
                    ? 'rgba(0, 0, 0, 0.3)' 
                    : 'rgba(0, 0, 0, 0.3)',
                borderColor: isRealWorldToday 
                  ? 'rgba(93, 211, 211, 0.7)' 
                  : taskCount > 0 
                    ? 'rgba(128, 128, 128, 0.3)' 
                    : 'rgba(128, 128, 128, 0.3)',
                opacity: taskCount === 0 ? 0.5 : 1,
                cursor: taskCount === 0 ? 'not-allowed' : 'pointer'
              }}
              onMouseEnter={(e) => {
                if (taskCount > 0 && !isRealWorldToday) {
                  e.currentTarget.style.borderColor = 'rgba(93, 211, 211, 0.6)';
                  e.currentTarget.style.borderLeft = '3px solid rgba(93, 211, 211, 0.7)';
                  e.currentTarget.style.backgroundColor = 'rgba(0, 50, 50, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (taskCount > 0 && !isRealWorldToday) {
                  e.currentTarget.style.borderColor = 'rgba(128, 128, 128, 0.3)';
                  e.currentTarget.style.borderLeft = '2px solid transparent';
                  e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
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
        style={{backgroundColor: 'rgba(30, 50, 50, 0.6)', borderColor: 'rgba(128, 128, 128, 0.4)', color: '#F5F5DC'}}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(35, 60, 60, 0.7)';
          e.currentTarget.style.borderColor = 'rgba(93, 211, 211, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(30, 50, 50, 0.6)';
          e.currentTarget.style.borderColor = 'rgba(128, 128, 128, 0.4)';
        }}
      >
        Cancel
      </button>
    </div>
  </div>
)}

         {showPlanModal && selectedDay && (
  <div className="fixed inset-0 bg-black bg-opacity-90 flex items-start justify-center p-4 z-50 overflow-y-auto" onClick={() => setShowPlanModal(false)}>
    <div className="rounded-xl p-6 max-w-md w-full border-2" style={{background: 'linear-gradient(to bottom, rgba(10, 40, 60, 0.95), rgba(5, 28, 45, 0.95), rgba(0, 18, 32, 0.95))', borderColor: COLORS.gold, boxShadow: '0 0 15px rgba(212, 175, 55, 0.25), 0 0 30px rgba(212, 175, 55, 0.1)'}} onClick={e => e.stopPropagation()}>
      <div className="mb-6">
        <div className="text-center">
          <h3 className="text-3xl font-bold mb-2" style={{color: '#D4AF37', letterSpacing: '0.1em'}}>PLAN FOR {selectedDay.toUpperCase()}</h3>
          <div className="flex items-center justify-center gap-2">
            <div style={{width: '100px', height: '1px', background: 'linear-gradient(to right, transparent, rgba(212, 175, 55, 0.3))'}}></div>
            <span style={{color: 'rgba(212, 175, 55, 0.4)', fontSize: '8px'}}>◆</span>
            <div style={{width: '100px', height: '1px', background: 'linear-gradient(to left, transparent, rgba(212, 175, 55, 0.3))'}}></div>
          </div>
        </div>
      </div>
      
      <input 
        type="text" 
        placeholder="What do you need to do?" 
        value={newPlanItem.title} 
        onChange={e => setNewPlanItem({...newPlanItem, title: e.target.value})} 
        spellCheck="true"
        autoCorrect="on"
        autoCapitalize="sentences"
        onKeyDown={e => {
          if (e.key === 'Enter' && newPlanItem.title) {
            addPlanTask();
          }
        }}
        className="w-full p-3 rounded-lg mb-4 border focus:outline-none" 
        style={{backgroundColor: 'rgba(0, 0, 0, 0.4)', color: '#F5F5DC', borderColor: 'rgba(96, 165, 250, 0.3)', fontFamily: 'Cinzel, serif'}}
        onFocus={e => e.target.style.borderColor = '#60A5FA'}
        onBlur={e => e.target.style.borderColor = 'rgba(96, 165, 250, 0.3)'}
        autoFocus 
      />
      
      <div className="mb-4">
        <label className="block text-sm mb-2 text-center" style={{color: COLORS.silver}}>Priority Level</label>
        <div className="grid grid-cols-2 gap-3">
          <button 
            type="button" 
            onClick={() => setNewPlanItem({...newPlanItem, priority: 'important'})} 
            className="p-4 rounded-lg border-2 transition-all"
            style={{
              backgroundColor: newPlanItem.priority === 'important' ? 'rgba(194, 144, 21, 0.35)' : 'rgba(0, 0, 0, 0.3)',
              borderColor: newPlanItem.priority === 'important' ? 'rgba(212, 175, 55, 0.7)' : 'rgba(128, 128, 128, 0.3)',
              color: '#F5F5DC',
              boxShadow: newPlanItem.priority === 'important' ? 'inset 0 1px 0 rgba(212, 175, 55, 0.1)' : 'none'
            }}
          >
            <div className="font-bold">IMPORTANT</div>
            <div className="text-xs mt-1" style={{color: COLORS.gold}}>1.25x XP</div>
          </button>
          
          <button 
            type="button" 
            onClick={() => setNewPlanItem({...newPlanItem, priority: 'routine'})} 
            className="p-4 rounded-lg border-2 transition-all"
            style={{
              backgroundColor: newPlanItem.priority === 'routine' ? 'rgba(30, 58, 95, 0.3)' : 'rgba(0, 0, 0, 0.3)',
              borderColor: newPlanItem.priority === 'routine' ? 'rgba(30, 58, 95, 0.6)' : 'rgba(128, 128, 128, 0.3)',
              color: '#F5F5DC'
            }}
          >
            <div className="font-bold">ROUTINE</div>
            <div className="text-xs mt-1" style={{color: '#6BB6FF'}}>1.0x XP</div>
          </button>
        </div>
      </div>
      
      <div className="flex gap-2">
        <button 
          onClick={addPlanTask}
          disabled={!newPlanItem.title} 
          className="flex-1 py-2 rounded-lg transition-all border-2"
          style={{
            backgroundColor: !newPlanItem.title ? '#2C3E50' : 'rgba(43, 80, 130, 0.8)',
            borderColor: !newPlanItem.title ? '#95A5A6' : 'rgba(96, 165, 250, 0.7)',
            color: '#F5F5DC',
            cursor: !newPlanItem.title ? 'not-allowed' : 'pointer',
            opacity: !newPlanItem.title ? 0.5 : 1
          }}
          onMouseEnter={(e) => {if (newPlanItem.title) e.currentTarget.style.backgroundColor = 'rgba(53, 100, 160, 0.9)'}}
          onMouseLeave={(e) => {if (newPlanItem.title) e.currentTarget.style.backgroundColor = 'rgba(43, 80, 130, 0.8)'}}
        >
          Add Task
        </button>
        <button 
          onClick={() => { 
            setShowPlanModal(false); 
            setNewPlanItem({ title: '', priority: 'routine' }); 
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
          {showCalendarModal && selectedDate && (
  <div className="fixed inset-0 bg-black bg-opacity-90 flex items-start justify-center p-4 z-50 overflow-y-auto" onClick={() => setShowCalendarModal(false)}>
    <div className="rounded-xl p-6 max-w-md w-full border-2 my-8" style={{background: 'linear-gradient(to bottom, rgba(10, 36, 18, 0.95), rgba(6, 28, 14, 0.95), rgba(3, 20, 10, 0.95))', borderColor: COLORS.gold, boxShadow: '0 0 15px rgba(212, 175, 55, 0.25), 0 0 30px rgba(212, 175, 55, 0.1), inset 0 0 40px rgba(0, 0, 0, 0.15)'}} onClick={e => e.stopPropagation()}>
      <div className="mb-6 relative">
        <button 
          onClick={() => setShowCalendarModal(false)} 
          className="absolute -top-2 -right-2 p-2 rounded-lg border-2 transition-all"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            borderColor: 'rgba(212, 175, 55, 0.4)',
            color: '#D4AF37'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
            e.currentTarget.style.borderColor = '#D4AF37';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
            e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.4)';
          }}
        >
          <X size={20}/>
        </button>
        <div className="text-center">
          <div className="text-4xl font-bold" style={{color: '#D4AF37', letterSpacing: '0.1em'}}>
  {(() => {
    const [year, month, day] = selectedDate.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const weekday = date.toLocaleDateString('default', { weekday: 'long' }).toUpperCase();
    const monthDay = date.toLocaleDateString('default', { month: 'long', day: 'numeric' }).toUpperCase();
    return (
      <>
        <div>{weekday}</div>
        <div className="text-2xl mt-1">{monthDay}</div>
      </>
    );
  })()}
</div>
          <div className="flex items-center justify-center gap-2 mt-2">
            <div style={{width: '100px', height: '1px', background: 'linear-gradient(to right, transparent, rgba(88, 180, 120, 0.3))'}}></div>
            <span style={{color: 'rgba(88, 180, 120, 0.4)', fontSize: '8px'}}>◆</span>
            <div style={{width: '100px', height: '1px', background: 'linear-gradient(to left, transparent, rgba(88, 180, 120, 0.3))'}}></div>
          </div>
        </div>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm mb-2 text-center" style={{color: COLORS.silver}}>Today's Focus Class</label>
        <div className="flex gap-2 mb-2">
          <input 
            type="text" 
            placeholder="e.g., Math, Physics, Chemistry..." 
            value={newFocus} 
            onChange={e => setNewFocus(e.target.value)} 
            spellCheck="true"
            autoCorrect="on"
            autoCapitalize="words"
            onKeyPress={e => {
              if (e.key === 'Enter' && newFocus.trim()) {
                setCalendarFocus(prev => ({...prev, [selectedDate]: newFocus.trim()}));
                setNewFocus('');
              }
            }}
            className="flex-1 p-3 rounded-lg border focus:outline-none" 
            style={{backgroundColor: 'rgba(0, 0, 0, 0.5)', color: '#F5F5DC', borderColor: 'rgba(88, 180, 120, 0.4)', fontFamily: 'Cinzel, serif', boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.2)'}}
            onFocus={e => {
              e.target.style.borderColor = 'rgba(88, 180, 120, 0.8)';
              // Pre-fill with current focus if exists
              if (!newFocus && calendarFocus[selectedDate]) {
                setNewFocus(calendarFocus[selectedDate]);
              }
            }}
            onBlur={e => e.target.style.borderColor = 'rgba(88, 180, 120, 0.4)'}
          />
          <button
            onClick={() => {
              if (newFocus.trim()) {
                setCalendarFocus(prev => ({...prev, [selectedDate]: newFocus.trim()}));
                setNewFocus('');
              }
            }}
            disabled={!newFocus.trim()}
            className="px-4 py-2 rounded-lg transition-all border-2"
            style={{
              backgroundColor: !newFocus.trim() ? '#2C3E50' : 'rgba(61, 107, 69, 0.85)',
              borderColor: !newFocus.trim() ? '#95A5A6' : 'rgba(88, 180, 120, 0.7)',
              color: '#F5F5DC',
              cursor: !newFocus.trim() ? 'not-allowed' : 'pointer',
              opacity: !newFocus.trim() ? 0.5 : 1
            }}
            onMouseEnter={(e) => {if (newFocus.trim()) e.currentTarget.style.backgroundColor = 'rgba(75, 130, 85, 0.95)'}}
            onMouseLeave={(e) => {if (newFocus.trim()) e.currentTarget.style.backgroundColor = 'rgba(61, 107, 69, 0.85)'}}
          >
            Save
          </button>
        </div>
        {calendarFocus[selectedDate] && (
          <div className="flex items-center justify-between p-2 rounded bg-gray-800/50">
            <span className="text-sm font-bold" style={{color: '#EF4444'}}>Current: {calendarFocus[selectedDate]}</span>
            <button
              onClick={() => {
                setCalendarFocus(prev => {
                  const updated = {...prev};
                  delete updated[selectedDate];
                  return updated;
                });
                setNewFocus('');
              }}
              className="text-red-400 hover:text-red-300"
            >
              <X size={16}/>
            </button>
          </div>
        )}
      </div>
      
      {/* Decorative divider */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <div style={{width: '100px', height: '1px', background: 'linear-gradient(to right, transparent, rgba(88, 180, 120, 0.3))'}}></div>
        <span style={{color: 'rgba(88, 180, 120, 0.4)', fontSize: '8px'}}>◆</span>
        <div style={{width: '100px', height: '1px', background: 'linear-gradient(to left, transparent, rgba(88, 180, 120, 0.3))'}}></div>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm mb-2 text-center" style={{color: COLORS.silver}}>Add Event</label>
        <div className="flex gap-2 mb-4">
          <input 
            type="text" 
            placeholder="e.g., Midterm Exam, Office Hours..." 
            value={newEvent} 
            onChange={e => setNewEvent(e.target.value)} 
            spellCheck="true"
            autoCorrect="on"
            autoCapitalize="words"
            onKeyPress={e => {
              if (e.key === 'Enter' && newEvent.trim()) {
                setCalendarEvents(prev => ({
                  ...prev,
                  [selectedDate]: [...(prev[selectedDate] || []), newEvent.trim()]
                }));
                setNewEvent('');
              }
            }}
            className="flex-1 p-3 rounded-lg border focus:outline-none" 
            style={{backgroundColor: 'rgba(0, 0, 0, 0.5)', color: '#F5F5DC', borderColor: 'rgba(88, 180, 120, 0.4)', fontFamily: 'Cinzel, serif', boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.2)'}}
            onFocus={e => e.target.style.borderColor = 'rgba(88, 180, 120, 0.8)'}
            onBlur={e => e.target.style.borderColor = 'rgba(88, 180, 120, 0.4)'}
          />
          <button
            onClick={() => {
              if (newEvent.trim()) {
                setCalendarEvents(prev => ({
                  ...prev,
                  [selectedDate]: [...(prev[selectedDate] || []), newEvent.trim()]
                }));
                setNewEvent('');
              }
            }}
            disabled={!newEvent.trim()}
            className="px-4 py-2 rounded-lg transition-all border-2"
            style={{
              backgroundColor: !newEvent.trim() ? '#2C3E50' : 'rgba(61, 107, 69, 0.85)',
              borderColor: !newEvent.trim() ? '#95A5A6' : 'rgba(88, 180, 120, 0.7)',
              color: '#F5F5DC',
              cursor: !newEvent.trim() ? 'not-allowed' : 'pointer',
              opacity: !newEvent.trim() ? 0.5 : 1
            }}
            onMouseEnter={(e) => {if (newEvent.trim()) e.currentTarget.style.backgroundColor = 'rgba(75, 130, 85, 0.95)'}}
            onMouseLeave={(e) => {if (newEvent.trim()) e.currentTarget.style.backgroundColor = 'rgba(61, 107, 69, 0.85)'}}
          >
            Add
          </button>
        </div>
        
        {/* Event list */}
        {calendarEvents[selectedDate] && Array.isArray(calendarEvents[selectedDate]) && calendarEvents[selectedDate].length > 0 && (
          <div className="space-y-2">
            {calendarEvents[selectedDate].map((event, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 rounded bg-gray-800/50">
                <span className="text-sm italic" style={{color: '#9CA3AF'}}>{event}</span>
                <button
                  onClick={() => {
                    setCalendarEvents(prev => ({
                      ...prev,
                      [selectedDate]: prev[selectedDate].filter((_, i) => i !== idx)
                    }));
                  }}
                  className="text-red-400 hover:text-red-300"
                >
                  <X size={16}/>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
)}

          {showBoss && (
            <div className="fixed inset-0 flex items-start justify-center p-4 z-50 overflow-y-auto" style={{background: 'radial-gradient(ellipse at center, rgba(90, 14, 21, 0.3) 0%, rgba(0, 0, 0, 0.95) 70%)'}}>
              <div className={`rounded-2xl p-8 max-w-3xl w-full relative boss-enter my-8 ${bossFlash ? 'damage-flash-boss' : ''}`} style={{
                background: 'linear-gradient(to bottom, rgba(42, 36, 28, 0.98), rgba(26, 22, 18, 0.98))',
                border: '2px solid rgba(155, 139, 126, 0.5)',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6), inset 0 0 20px rgba(0, 0, 0, 0.4)'
              }}>
                {/* Header Section */}
                <div className="text-center mb-6">
                  <p className="text-xs uppercase tracking-[0.3em] mb-4" style={{color: '#CD7F32', letterSpacing: '0.3em'}}>
                    {isFinalBoss ? (inPhase3 ? 'PHASE 3: ABYSS AWAKENING' : inPhase2 ? 'PHASE 2: THE PRESSURE' : 'THE UNDYING LEGEND') : 
                     battleType === 'elite' ? 'TORMENTED CHAMPION' : 
                     battleType === 'wave' ? `WAVE ASSAULT - Enemy ${currentWaveEnemy}/${totalWaveEnemies}` : 
                     'ENEMY ENCOUNTER'}
                  </p>
                  
                  {bossName && (
                    <h2 className="text-5xl font-bold mb-2" style={{
                      fontFamily: 'Cinzel, serif',
                      color: '#D4AF37',
                      textShadow: '0 0 20px rgba(212, 175, 55, 0.4)',
                      letterSpacing: '0.05em'
                    }}>
                      {bossName}
                      {bossDebuffs.poisonTurns > 0 && <span className="ml-3 text-lg text-green-400 animate-pulse"> ☠️ POISONED ({bossDebuffs.poisonTurns})</span>}
                      {bossDebuffs.stunned && <span className="ml-3 text-lg text-purple-400 animate-pulse"> ✨ STUNNED</span>}
                    </h2>
                  )}
                  
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <div style={{width: '80px', height: '1px', background: 'linear-gradient(to right, transparent, rgba(212, 175, 55, 0.3))'}}></div>
                    <span style={{color: 'rgba(212, 175, 55, 0.5)', fontSize: '8px'}}>◆</span>
                    <div style={{width: '80px', height: '1px', background: 'linear-gradient(to left, transparent, rgba(212, 175, 55, 0.3))'}}></div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {/* Enemy HP Section */}
                  <div className="rounded-lg p-3" style={{backgroundColor: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(139, 0, 0, 0.5)'}}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm uppercase tracking-wider" style={{color: '#CD7F32'}}>
                        {bossName || 'Enemy'}
                        {enragedTurns > 0 && <span className="ml-3 text-orange-400 font-bold animate-pulse"> ENRAGED ({enragedTurns})</span>}
                      </span>
                      <span style={{color: '#F5F5DC'}}>{bossHp}/{bossMax}</span>
                    </div>
                    <div className="rounded-full h-3 overflow-hidden" style={{backgroundColor: 'rgba(0, 0, 0, 0.6)'}}>
                      <div className={`h-3 rounded-full transition-all duration-300 ${bossFlash ? 'hp-pulse' : ''}`} style={{
                        width: `${(bossHp / bossMax) * 100}%`,
                        background: 'linear-gradient(to right, #DC143C, #FF6B6B)'
                      }}></div>
                    </div>
                  </div>
                  
                  {/* Phase 2 Warning */}
                  {inPhase2 && !inPhase3 && phase2DamageStacks > 0 && (
                    <div className="rounded-lg p-3" style={{backgroundColor: 'rgba(204, 85, 0, 0.2)', border: '1px solid rgba(255, 140, 0, 0.5)'}}>
                      <p className="text-xs uppercase tracking-wider text-center mb-1" style={{color: '#CD7F32'}}>RAMPING PRESSURE</p>
                      <p className="text-white text-center text-sm">Boss damage: +{phase2DamageStacks * 5}% ({phase2DamageStacks} stacks)</p>
                    </div>
                  )}
                  
                  {/* Shadow Adds */}
                  {(inPhase2 || inPhase3) && shadowAdds.length > 0 && (
                    <div className="rounded-lg p-3" style={{backgroundColor: 'rgba(107, 44, 145, 0.2)', border: '1px solid rgba(147, 51, 234, 0.5)'}}>
                      <p className="text-xs uppercase tracking-wider text-center mb-2" style={{color: '#B794F4'}}>Shadow Add{shadowAdds.length > 1 ? 's' : ''} ({shadowAdds.length})</p>
                      <div className="space-y-2">
                        {shadowAdds.map((add, idx) => (
                          <div key={add.id} className="flex items-center gap-3">
                            <span className="text-xs" style={{color: '#F5F5DC'}}>#{idx + 1}</span>
                            <div className="flex-1 rounded-full h-2 overflow-hidden" style={{backgroundColor: 'rgba(0, 0, 0, 0.6)'}}>
                              <div className="h-2 rounded-full" style={{width: `${(add.hp / add.maxHp) * 100}%`, backgroundColor: '#B794F4'}}></div>
                            </div>
                            <span className="text-xs" style={{color: '#B794F4'}}>{add.hp}/{add.maxHp}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* AOE Warning */}
                  {aoeWarning && inPhase3 && (
                    <div className="rounded-lg p-4 animate-pulse" style={{backgroundColor: 'rgba(139, 0, 0, 0.4)', border: '2px solid #FBBF24'}}>
                      <p className="text-yellow-400 font-bold text-center">⚠️ DEVASTATING AOE INCOMING!</p>
                      <p className="text-white text-center text-sm mt-1">Next turn: 35 damage slam!</p>
                    </div>
                  )}
                  
                  {/* Enemy Dialogue */}
                  {showTauntBoxes ? (
                    <div className="rounded-lg p-3 relative" style={{backgroundColor: 'rgba(0, 0, 0, 0.6)', border: '1px solid rgba(139, 0, 0, 0.5)'}}>
                      <div className="absolute -top-2 left-3 px-2 py-0.5 rounded" style={{backgroundColor: 'rgba(139, 0, 0, 0.9)', border: '1px solid rgba(220, 38, 38, 0.6)'}}>
                        <p className="text-xs uppercase tracking-wider" style={{color: '#F5F5DC', fontSize: '10px'}}>Enemy</p>
                      </div>
                      <p className="text-sm italic mt-2 text-center" style={{color: '#F5F5DC'}}>"{enemyTauntResponse || '...'}"</p>
                    </div>
                  ) : enemyDialogue ? (
                    <div className="rounded-lg p-3 relative" style={{backgroundColor: 'rgba(0, 0, 0, 0.6)', border: '1px solid rgba(100, 100, 100, 0.3)'}}>
                      <div className="absolute -top-2 left-3 px-2 py-0.5 rounded" style={{backgroundColor: 'rgba(139, 0, 0, 0.9)', border: '1px solid rgba(220, 38, 38, 0.6)'}}>
                        <p className="text-xs uppercase tracking-wider" style={{color: '#F5F5DC', fontSize: '10px'}}>Enemy</p>
                      </div>
                      <p className="text-sm italic mt-2 text-center" style={{color: '#F5F5DC'}}>"{enemyDialogue}"</p>
                    </div>
                  ) : null}
                  
                  {/* VS Divider */}
                  <div className="text-center py-2">
                    <div className="flex items-center justify-center gap-3">
                      <div style={{width: '80px', height: '1px', background: 'linear-gradient(to right, transparent, rgba(212, 175, 55, 0.5))'}}></div>
                      <p className="text-xl font-bold uppercase tracking-wider" style={{
                        color: '#D4AF37',
                        textShadow: '0 0 10px rgba(212, 175, 55, 0.5)',
                        letterSpacing: '0.2em'
                      }}>VS</p>
                      <div style={{width: '80px', height: '1px', background: 'linear-gradient(to left, transparent, rgba(212, 175, 55, 0.5))'}}></div>
                    </div>
                  </div>
                  
                  {/* Player Section */}
                  <div className="rounded-lg p-3" style={{backgroundColor: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(0, 100, 0, 0.5)'}}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm uppercase tracking-wider" style={{color: '#68D391'}}>{hero.name}</span>
                      <span style={{color: '#F5F5DC'}}>HP: {hp}/{getMaxHp()} | SP: {stamina}/{getMaxStamina()}</span>
                    </div>
                    <div className="rounded-full h-3 overflow-hidden mb-1" style={{backgroundColor: 'rgba(0, 0, 0, 0.6)'}}>
                      <div className={`h-3 rounded-full transition-all duration-300 ${playerFlash ? 'hp-pulse' : ''}`} style={{
                        width: `${(hp / getMaxHp()) * 100}%`,
                        background: 'linear-gradient(to right, #2F5233, #68D391)'
                      }}></div>
                    </div>
                    <div className="rounded-full h-2 overflow-hidden" style={{backgroundColor: 'rgba(0, 0, 0, 0.6)'}}>
                      <div className="h-2 rounded-full transition-all duration-300" style={{
                        width: `${(stamina / getMaxStamina()) * 100}%`,
                        background: 'linear-gradient(to right, #0E7490, #06B6D4)'
                      }}></div>
                    </div>
                  </div>
                  
                  {/* Charge Stacks Only */}
                  {chargeStacks > 0 && (
                    <div className="rounded-lg p-2 text-center" style={{backgroundColor: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(212, 175, 55, 0.3)'}}>
                      <div className="flex items-center justify-center gap-1">
                        <span className="text-xs" style={{color: COLORS.gold}}>CHARGES:</span>
                        {[1, 2, 3].map(i => (
                          <div 
                            key={i}
                            className={`w-2 h-2 rounded-full transition-all`}
                            style={{
                              backgroundColor: i <= chargeStacks ? COLORS.gold : '#4B5563',
                              boxShadow: i <= chargeStacks ? `0 0 6px ${COLORS.gold}` : 'none'
                            }}
                          />
                        ))}
                        {chargeStacks === 3 && <span className="text-xs font-bold ml-1" style={{color: COLORS.gold}}>⚡ READY</span>}
                      </div>
                    </div>
                  )}
                  
                  {/* Player Dialogue */}
                  {showTauntBoxes && (
                    <div className="rounded-lg p-3" style={{backgroundColor: 'rgba(0, 0, 0, 0.6)', border: '1px solid rgba(59, 130, 246, 0.5)'}}>
                      <p className="text-sm" style={{color: '#F5F5DC'}}>"{playerTaunt}"</p>
                    </div>
                  )}
                  
                  {/* Actions Section */}
                  {battling && bossHp > 0 && hp > 0 && (
                    <>
                      <div className="text-center pt-2 pb-2">
                        <p className="text-sm font-bold uppercase tracking-[0.3em] mb-1" style={{color: '#D4AF37'}}>Actions</p>
                        <div className="flex items-center justify-center gap-2">
                          <div style={{width: '200px', height: '2px', background: 'linear-gradient(to right, transparent, rgba(212, 175, 55, 0.6), transparent)'}}></div>
                        </div>
                      </div>
                      
                      {/* Main Menu */}
                      {battleMenu === 'main' && (
                        <div className="grid grid-cols-3 gap-3">
                          <button 
                            onClick={() => setBattleMenu('fight')} 
                            className="rounded-lg py-3 px-4 font-bold transition-all border-2 hover:scale-105 active:scale-95"
                            style={{
                              background: 'linear-gradient(to bottom, rgba(139, 0, 0, 0.8), rgba(80, 0, 0, 0.8))',
                              borderColor: 'rgba(139, 0, 0, 0.6)',
                              color: '#F5F5DC'
                            }}
                          >
                            <div className="text-base uppercase">Fight</div>
                          </button>
                          
                          <button 
                            onClick={() => setBattleMenu('items')}
                            disabled={healthPots === 0 && staminaPots === 0}
                            className="rounded-lg py-3 px-4 font-bold transition-all border-2 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{
                              background: (healthPots > 0 || staminaPots > 0) ? 'linear-gradient(to bottom, rgba(184, 134, 11, 0.8), rgba(120, 87, 7, 0.8))' : 'rgba(44, 62, 80, 0.6)',
                              borderColor: (healthPots > 0 || staminaPots > 0) ? 'rgba(184, 134, 11, 0.6)' : 'rgba(128, 128, 128, 0.3)',
                              color: '#F5F5DC'
                            }}
                          >
                            <div className="text-base uppercase">Items</div>
                          </button>
                          
                          {canFlee && (
                            <button 
                              onClick={flee}
                              disabled={stamina < 25}
                              className="rounded-lg py-3 px-4 font-bold transition-all border-2 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                              style={{
                                background: stamina >= 25 ? 'linear-gradient(to bottom, rgba(47, 82, 51, 0.8), rgba(30, 52, 33, 0.8))' : 'rgba(44, 62, 80, 0.6)',
                                borderColor: stamina >= 25 ? 'rgba(47, 82, 51, 0.6)' : 'rgba(128, 128, 128, 0.3)',
                                color: '#F5F5DC'
                              }}
                            >
                              <div className="text-base uppercase">Flee</div>
                              {stamina >= 25 && <div className="text-xs mt-1 opacity-75">25 SP</div>}
                            </button>
                          )}
                          
                          {showDodgeButton && (
                            <button 
                              onClick={dodge}
                              className="rounded-lg py-3 px-4 font-bold transition-all border-2 hover:scale-105 active:scale-95 animate-pulse"
                              style={{
                                background: 'linear-gradient(to bottom, rgba(30, 58, 95, 0.8), rgba(20, 40, 65, 0.8))',
                                borderColor: 'rgba(30, 58, 95, 0.6)',
                                color: '#F5F5DC'
                              }}
                            >
                              <div className="text-base uppercase">Dodge</div>
                              <div className="text-xs mt-1 opacity-75">Avoid AOE</div>
                            </button>
                          )}
                        </div>
                      )}
                      
                      {/* Fight Submenu */}
                      {battleMenu === 'fight' && (
                        <>
                          <div className="grid grid-cols-4 gap-3 mb-4">
                            <button 
                              onClick={attack}
                              className="rounded-lg py-3 px-4 font-bold transition-all border-2 hover:scale-105 active:scale-95"
                              style={{
                                background: 'linear-gradient(to bottom, rgba(139, 0, 0, 0.8), rgba(80, 0, 0, 0.8))',
                                borderColor: 'rgba(139, 0, 0, 0.6)',
                                color: '#F5F5DC'
                              }}
                            >
                              <div className="text-base uppercase">Attack</div>
                              <div className="text-xs mt-1 opacity-75">Basic Strike</div>
                            </button>
                            
                            {/* Knight Crushing Blow */}
                            {hero && hero.class && hero.class.name === 'Knight' && (
                              <button 
                                onClick={useCrushingBlow}
                                disabled={stamina < 17 || knightCrushingBlowCooldown}
                                className="rounded-lg py-3 px-4 font-bold transition-all border-2 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{
                                  background: (stamina >= 17 && !knightCrushingBlowCooldown) 
                                    ? 'linear-gradient(to bottom, rgba(165, 42, 42, 0.8), rgba(100, 25, 25, 0.8))' 
                                    : 'rgba(44, 62, 80, 0.6)',
                                  borderColor: (stamina >= 17 && !knightCrushingBlowCooldown) 
                                    ? 'rgba(165, 42, 42, 0.6)' 
                                    : 'rgba(128, 128, 128, 0.3)',
                                  color: '#F5F5DC'
                                }}
                                title="Powerful strike that cannot be used twice in a row"
                              >
                                <div className="text-sm uppercase">Crushing Blow</div>
                                <div className="text-xs mt-1 opacity-75">
                                  {knightCrushingBlowCooldown ? (
                                    <span className="text-yellow-400">⏳ Cooldown</span>
                                  ) : (
                                    <>17 SP</>
                                  )}
                                </div>
                              </button>
                            )}
                            
                            {/* Crusader Smite */}
                            {hero && hero.class && hero.class.name === 'Crusader' && (
                              <button 
                                onClick={useSmite}
                                disabled={stamina < 15 || crusaderSmiteCooldown}
                                className="rounded-lg py-3 px-4 font-bold transition-all border-2 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{
                                  background: (stamina >= 15 && !crusaderSmiteCooldown) 
                                    ? 'linear-gradient(to bottom, rgba(218, 165, 32, 0.8), rgba(184, 134, 11, 0.8))' 
                                    : 'rgba(44, 62, 80, 0.6)',
                                  borderColor: (stamina >= 15 && !crusaderSmiteCooldown) 
                                    ? 'rgba(218, 165, 32, 0.6)' 
                                    : 'rgba(128, 128, 128, 0.3)',
                                  color: '#F5F5DC'
                                }}
                                title="Holy strike that heals. Cannot be used twice in a row."
                              >
                                <div className="text-sm uppercase">Smite</div>
                                <div className="text-xs mt-1 opacity-75">
                                  {crusaderSmiteCooldown ? (
                                    <span className="text-yellow-400">⏳ Cooldown</span>
                                  ) : (
                                    <>15 SP</>
                                  )}
                                </div>
                              </button>
                            )}
                            
                            {hero && hero.class && GAME_CONSTANTS.SPECIAL_ATTACKS[hero.class.name] && (
                              <button 
                                onClick={specialAttack}
                                disabled={
                                  stamina < GAME_CONSTANTS.SPECIAL_ATTACKS[hero.class.name].cost || 
                                  (GAME_CONSTANTS.SPECIAL_ATTACKS[hero.class.name].hpCost && hp <= GAME_CONSTANTS.SPECIAL_ATTACKS[hero.class.name].hpCost) ||
                                  (hero.class.name === 'Wizard' && wizardTemporalCooldown) ||
                                  (hero.class.name === 'Crusader' && crusaderJudgmentCooldown)
                                }
                                className="rounded-lg py-3 px-4 font-bold transition-all border-2 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{
                                  background: (stamina >= GAME_CONSTANTS.SPECIAL_ATTACKS[hero.class.name].cost && 
                                              !(hero.class.name === 'Wizard' && wizardTemporalCooldown) && 
                                              !(hero.class.name === 'Crusader' && crusaderJudgmentCooldown)) 
                                              ? 'linear-gradient(to bottom, rgba(13, 116, 142, 0.8), rgba(8, 77, 94, 0.8))' : 'rgba(44, 62, 80, 0.6)',
                                  borderColor: (stamina >= GAME_CONSTANTS.SPECIAL_ATTACKS[hero.class.name].cost && 
                                               !(hero.class.name === 'Wizard' && wizardTemporalCooldown) && 
                                               !(hero.class.name === 'Crusader' && crusaderJudgmentCooldown)) 
                                               ? 'rgba(13, 116, 142, 0.6)' : 'rgba(128, 128, 128, 0.3)',
                                  color: '#F5F5DC'
                                }}
                                title={GAME_CONSTANTS.SPECIAL_ATTACKS[hero.class.name].effect}
                              >
                                <div className="text-sm uppercase">{GAME_CONSTANTS.SPECIAL_ATTACKS[hero.class.name].name}</div>
                                <div className="text-xs mt-1 opacity-75">
                                  {hero.class.name === 'Wizard' && wizardTemporalCooldown ? (
                                    <span className="text-yellow-400">⏳ On Cooldown</span>
                                  ) : hero.class.name === 'Crusader' && crusaderJudgmentCooldown ? (
                                    <span className="text-yellow-400">⏳ On Cooldown</span>
                                  ) : (
                                    <>{GAME_CONSTANTS.SPECIAL_ATTACKS[hero.class.name].cost} SP{GAME_CONSTANTS.SPECIAL_ATTACKS[hero.class.name].hpCost && ` • ${GAME_CONSTANTS.SPECIAL_ATTACKS[hero.class.name].hpCost + (recklessStacks * 10)} HP`}</>
                                  )}
                                </div>
                              </button>
                            )}
                            
                            {hero && hero.class && GAME_CONSTANTS.TACTICAL_SKILLS[hero.class.name] && (
                              <button 
                                onClick={useTacticalSkill}
                                disabled={
                                  stamina < GAME_CONSTANTS.TACTICAL_SKILLS[hero.class.name].cost ||
                                  (hero.class.name === 'Knight' && knightRallyingRoarCooldown) ||
                                  (hero.class.name === 'Wizard' && wizardEtherealBarrierCooldown) ||
                                  (hero.class.name === 'Assassin' && assassinMarkForDeathCooldown) ||
                                  (hero.class.name === 'Crusader' && crusaderBastionOfFaithCooldown)
                                }
                                className="rounded-lg py-3 px-4 font-bold transition-all border-2 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{
                                  background: (stamina >= GAME_CONSTANTS.TACTICAL_SKILLS[hero.class.name].cost &&
                                              !((hero.class.name === 'Knight' && knightRallyingRoarCooldown) ||
                                                (hero.class.name === 'Wizard' && wizardEtherealBarrierCooldown) ||
                                                (hero.class.name === 'Assassin' && assassinMarkForDeathCooldown) ||
                                                (hero.class.name === 'Crusader' && crusaderBastionOfFaithCooldown)))
                                              ? 'linear-gradient(to bottom, rgba(184, 134, 11, 0.8), rgba(120, 87, 7, 0.8))' : 'rgba(44, 62, 80, 0.6)',
                                  borderColor: (stamina >= GAME_CONSTANTS.TACTICAL_SKILLS[hero.class.name].cost &&
                                               !((hero.class.name === 'Knight' && knightRallyingRoarCooldown) ||
                                                 (hero.class.name === 'Wizard' && wizardEtherealBarrierCooldown) ||
                                                 (hero.class.name === 'Assassin' && assassinMarkForDeathCooldown) ||
                                                 (hero.class.name === 'Crusader' && crusaderBastionOfFaithCooldown)))
                                               ? 'rgba(184, 134, 11, 0.6)' : 'rgba(128, 128, 128, 0.3)',
                                  color: '#F5F5DC'
                                }}
                                title={GAME_CONSTANTS.TACTICAL_SKILLS[hero.class.name].effect}
                              >
                                <div className="text-sm uppercase">{GAME_CONSTANTS.TACTICAL_SKILLS[hero.class.name].name}</div>
                                <div className="text-xs mt-1 opacity-75">
                                  {((hero.class.name === 'Knight' && knightRallyingRoarCooldown) ||
                                    (hero.class.name === 'Wizard' && wizardEtherealBarrierCooldown) ||
                                    (hero.class.name === 'Assassin' && assassinMarkForDeathCooldown) ||
                                    (hero.class.name === 'Crusader' && crusaderBastionOfFaithCooldown)) ? (
                                    <span className="text-yellow-400">⏳ On Cooldown</span>
                                  ) : (
                                    <>{GAME_CONSTANTS.TACTICAL_SKILLS[hero.class.name].cost} SP</>
                                  )}
                                </div>
                              </button>
                            )}
                          </div>
                          
                          <button 
                            onClick={() => setBattleMenu('main')}
                            className="w-full rounded-lg py-3 px-4 font-bold transition-all border-2 hover:scale-105 active:scale-95"
                            style={{
                              background: 'rgba(44, 62, 80, 0.6)',
                              borderColor: 'rgba(128, 128, 128, 0.3)',
                              color: '#F5F5DC'
                            }}
                          >
                            <div className="text-sm uppercase">Back</div>
                          </button>
                        </>
                      )}
                      
                      {/* Items Submenu */}
                      {battleMenu === 'items' && (
                        <>
                          <div className="grid grid-cols-2 gap-3 mb-4">
                            <button 
                              onClick={useHealth}
                              disabled={healthPots === 0}
                              className="rounded-lg py-3 px-4 font-bold transition-all border-2 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                              style={{
                                background: healthPots > 0 ? 'linear-gradient(to bottom, rgba(220, 38, 38, 0.8), rgba(153, 27, 27, 0.8))' : 'rgba(44, 62, 80, 0.6)',
                                borderColor: healthPots > 0 ? 'rgba(220, 38, 38, 0.6)' : 'rgba(128, 128, 128, 0.3)',
                                color: '#F5F5DC'
                              }}
                            >
                              <div className="text-base uppercase">Health Potion</div>
                              <div className="text-xs mt-1 opacity-75">x{healthPots}</div>
                            </button>
                            
                            <button 
                              onClick={() => { 
                                if (staminaPots > 0) {
                                  const maxStamina = getMaxStamina();
                                  const restoreAmount = Math.max(
                                    GAME_CONSTANTS.STAMINA_POTION_MIN,
                                    Math.floor(maxStamina * (GAME_CONSTANTS.STAMINA_POTION_RESTORE_PERCENT / 100))
                                  );
                                  setStamina(Math.min(stamina + restoreAmount, maxStamina)); 
                                  setStaminaPots(staminaPots - 1); 
                                  addLog(`💙 Used Stamina Potion (+${restoreAmount} SP)`);
                                }
                              }}
                              disabled={staminaPots === 0}
                              className="rounded-lg py-3 px-4 font-bold transition-all border-2 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                              style={{
                                background: staminaPots > 0 ? 'linear-gradient(to bottom, rgba(6, 182, 212, 0.8), rgba(8, 145, 178, 0.8))' : 'rgba(44, 62, 80, 0.6)',
                                borderColor: staminaPots > 0 ? 'rgba(6, 182, 212, 0.6)' : 'rgba(128, 128, 128, 0.3)',
                                color: '#F5F5DC'
                              }}
                            >
                              <div className="text-base uppercase">Stamina Potion</div>
                              <div className="text-xs mt-1 opacity-75">x{staminaPots}</div>
                            </button>
                          </div>
                          
                          <button 
                            onClick={() => setBattleMenu('main')}
                            className="w-full rounded-lg py-3 px-4 font-bold transition-all border-2 hover:scale-105 active:scale-95"
                            style={{
                              background: 'rgba(44, 62, 80, 0.6)',
                              borderColor: 'rgba(128, 128, 128, 0.3)',
                              color: '#F5F5DC'
                            }}
                          >
                            <div className="text-sm uppercase">Back</div>
                          </button>
                        </>
                      )}
                      
                      {/* Taunt Button - Full Width Below Main Actions */}
                      {battleMenu === 'main' && isTauntAvailable && (
                        <button 
                          onClick={taunt}
                          className="w-full mt-3 rounded-lg py-3 px-4 font-bold transition-all border-2 hover:scale-105 active:scale-95 animate-pulse fade-in"
                          style={{
                            background: 'linear-gradient(to bottom, rgba(204, 85, 0, 0.8), rgba(153, 64, 0, 0.8))',
                            borderColor: 'rgba(204, 85, 0, 0.6)',
                            color: '#F5F5DC'
                          }}
                        >
                          <div className="text-base uppercase">Taunt Enemy (Enrage)</div>
                        </button>
                      )}
                    </>
                  )}
                  
                  {/* Victory/Defeat */}
                  {bossHp <= 0 && (
                    <div className="text-center pt-4">
                      {hasFled ? (
                        <>
                          <p className="text-4xl font-bold mb-4 animate-pulse" style={{color: '#FBBF24'}}>FLED</p>
                          <p className="text-lg mb-6 italic" style={{color: '#F5F5DC'}}>"Cowardice is also a strategy..."</p>
                        </>
                      ) : (
                        <>
                          <div className="mb-6">
                            <div className="flex items-center justify-center gap-3 mb-2">
                              <div style={{width: '100px', height: '2px', background: 'linear-gradient(to right, transparent, rgba(104, 211, 145, 0.6))'}}></div>
                              <p className="text-5xl font-bold" style={{
                                color: '#68D391', 
                                fontFamily: 'Cinzel, serif',
                                textShadow: '0 0 20px rgba(104, 211, 145, 0.5)',
                                letterSpacing: '0.1em'
                              }}>
                                {isFinalBoss ? 'CURSE BROKEN!' : 'VICTORY'}
                              </p>
                              <div style={{width: '100px', height: '2px', background: 'linear-gradient(to left, transparent, rgba(104, 211, 145, 0.6))'}}></div>
                            </div>
                            <p className="text-sm italic" style={{color: '#F5F5DC'}}>{isFinalBoss ? '"You are finally free..."' : '"The beast falls. You are healed and rewarded."'}</p>
                          </div>
                        </>
                      )}
                      
                      {!hasFled && victoryLoot.length > 0 && (
                        <div className="rounded-lg p-6 mb-6 fade-in" style={{
                          background: 'linear-gradient(to bottom, rgba(212, 175, 55, 0.15), rgba(184, 134, 11, 0.1))',
                          border: '2px solid rgba(212, 175, 55, 0.6)',
                          boxShadow: '0 0 30px rgba(212, 175, 55, 0.3)'
                        }}>
                          <div className="flex items-center justify-center gap-3 mb-4">
                            <div style={{width: '60px', height: '1px', background: 'linear-gradient(to right, transparent, rgba(212, 175, 55, 0.5))'}}></div>
                            <p className="font-bold text-lg uppercase tracking-wider" style={{
                              color: '#D4AF37',
                              textShadow: '0 0 10px rgba(212, 175, 55, 0.5)'
                            }}>Spoils of Battle</p>
                            <div style={{width: '60px', height: '1px', background: 'linear-gradient(to left, transparent, rgba(212, 175, 55, 0.5))'}}></div>
                          </div>
                          <div className="space-y-2">
                            {victoryLoot.map((loot, idx) => (
                              <div key={idx} className="rounded px-4 py-2 fade-in" style={{
                                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                                border: '1px solid rgba(212, 175, 55, 0.3)',
                                animationDelay: `${idx * 0.1}s`
                              }}>
                                <p className="text-base font-semibold" style={{color: '#F5F5DC'}}>{loot}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {(battleType === 'elite' || isFinalBoss) && (
                        <button 
                          onClick={advance}
                          className="px-8 py-3 rounded-lg font-bold text-xl transition-all border-2 hover:scale-105"
                          style={{
                            background: 'linear-gradient(to bottom, #D4AF37, #B8860B)',
                            borderColor: '#1C1C1C',
                            color: '#1C1C1C',
                            boxShadow: '0 0 20px rgba(212, 175, 55, 0.4)'
                          }}
                        >
                          {isFinalBoss ? 'CLAIM FREEDOM' : 'CONTINUE'}
                        </button>
                      )}
                      {(battleType === 'regular' || battleType === 'wave') && (
                        <button 
                          onClick={() => { setShowBoss(false); setHasFled(false); addLog('⚔️ Ready for your next trial...'); }}
                          className="px-8 py-3 rounded-lg font-bold text-xl transition-all border-2 hover:scale-105"
                          style={{
                            background: 'linear-gradient(to bottom, rgba(47, 82, 51, 0.8), rgba(30, 52, 33, 0.8))',
                            borderColor: 'rgba(192, 192, 192, 0.6)',
                            color: '#F5F5DC'
                          }}
                        >
                          CONTINUE
                        </button>
                      )}
                    </div>
                  )}
                  
                  {hp <= 0 && (
                    <div className="text-center pt-4">
                      <p className="text-4xl font-bold mb-2" style={{color: '#9B1B30', fontFamily: 'Cinzel, serif'}}>DEFEATED</p>
                      <p className="text-sm mb-4 italic" style={{color: '#F5F5DC'}}>"The curse claims another victim..."</p>
                      <button 
                        onClick={() => { setShowBoss(false); die(); }}
                        className="px-8 py-3 rounded-lg font-bold text-xl transition-all border-2 hover:scale-105"
                        style={{
                          background: 'linear-gradient(to bottom, rgba(107, 15, 26, 0.8), rgba(60, 8, 14, 0.8))',
                          borderColor: 'rgba(205, 127, 50, 0.6)',
                          color: '#F5F5DC'
                        }}
                      >
                        CONTINUE
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          {showPomodoro && pomodoroTask && (
  <div className="fixed inset-0 bg-black bg-opacity-90 flex items-start justify-center p-4 z-50 overflow-y-auto">
    <div className="rounded-xl p-12 max-w-2xl w-full border-2 relative my-8" style={{
      background: 'linear-gradient(to bottom, rgba(60, 10, 10, 0.95), rgba(40, 0, 0, 0.95), rgba(20, 0, 10, 0.95))',
      borderColor: COLORS.gold,
      boxShadow: '0 0 15px rgba(212, 175, 55, 0.25), 0 0 30px rgba(212, 175, 55, 0.1)'
    }}>
      <div className="mb-6 relative">
        <button 
          onClick={() => {
            setShowPomodoro(false);
            setPomodoroTask(null);
            setPomodoroRunning(false);
            addLog(`Focus session ended. Completed ${pomodorosCompleted} pomodoro${pomodorosCompleted !== 1 ? 's' : ''}.`);
          }}
          className="absolute -top-2 -right-2 p-2 rounded-lg border-2 transition-all"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            borderColor: 'rgba(212, 175, 55, 0.4)',
            color: '#D4AF37'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
            e.currentTarget.style.borderColor = '#D4AF37';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
            e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.4)';
          }}
        >
          <X size={20}/>
        </button>
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-2" style={{
            color: '#D4AF37',
            letterSpacing: '0.1em',
            fontFamily: 'Cinzel, serif'
          }}>
            {isBreak ? 'RESPITE' : 'DEEP FOCUS'}
          </h2>
          <p className="text-sm italic mb-4" style={{color: COLORS.silver}}>
            {isBreak ? '"Rest now, warrior. The battle awaits."' : '"Through focus, victory is forged."'}
          </p>
          <div className="flex items-center justify-center gap-2 mb-4">
            <div style={{width: '120px', height: '1px', background: 'linear-gradient(to right, transparent, rgba(212, 175, 55, 0.3))'}}></div>
            <span style={{color: 'rgba(212, 175, 55, 0.4)', fontSize: '8px'}}>◆</span>
            <div style={{width: '120px', height: '1px', background: 'linear-gradient(to left, transparent, rgba(212, 175, 55, 0.3))'}}></div>
          </div>
          <p className="text-xl mb-8" style={{color: COLORS.silver}}>{pomodoroTask.title}</p>
        </div>
      </div>
      
      <div className="text-center">
        <div className="mb-8">
          <div className="text-8xl font-bold mb-4" style={{color: '#F5F5DC'}}>
            {Math.floor(pomodoroTimer / 60)}:{String(pomodoroTimer % 60).padStart(2, '0')}
          </div>
          <div className="text-lg" style={{color: '#95A5A6'}}>
            {isBreak ? '5 minute respite' : '25 minute battle'}
          </div>
        </div>
        
        <div className="mb-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-xl" style={{color: '#F5F5DC'}}>Sessions Completed: {pomodorosCompleted}</span>
          </div>
          <div className="rounded-full h-3 overflow-hidden" style={{background: 'rgba(0, 0, 0, 0.4)'}}>
            <div 
              className="h-3 rounded-full transition-all"
              style={{
                width: `${((isBreak ? 5 * 60 : 25 * 60) - pomodoroTimer) / (isBreak ? 5 * 60 : 25 * 60) * 100}%`,
                background: isBreak 
                  ? 'linear-gradient(to right, #52C77A, #84E1A0)' 
                  : 'linear-gradient(to right, #B8860B, #D4AF37)'
              }}
            ></div>
          </div>
        </div>
        
        <div className="flex gap-4 justify-center mb-6">
          <button 
            onClick={() => setPomodoroRunning(!pomodoroRunning)}
            className="px-8 py-3 rounded-lg font-bold text-xl transition-all border-2"
            style={{
              backgroundColor: 'rgba(139, 0, 0, 0.6)',
              borderColor: '#8B0000',
              color: '#F5F5DC'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(139, 0, 0, 0.8)';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(139, 0, 0, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(139, 0, 0, 0.6)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '';
            }}
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
              className="px-8 py-3 rounded-lg font-bold text-xl transition-all border-2"
              style={{
                backgroundColor: 'rgba(184, 134, 11, 0.6)',
                borderColor: '#B8860B',
                color: '#F5F5DC'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(184, 134, 11, 0.8)';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(184, 134, 11, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(184, 134, 11, 0.6)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '';
              }}
            >
              Skip Break
            </button>
          )}
        </div>
      </div>
    </div>
  </div>
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
          <p className="text-xs text-gray-600">v4.12.0 - Knight Crushing Blow + Tactical Overhaul</p>
        </div>
      </div>
      )}
    </div>
  );
};

export default FantasyStudyQuest;
