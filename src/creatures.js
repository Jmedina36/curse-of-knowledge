// Shared creature registry — imported by BestiaryTab and App

export const CREATURE_INDEX = [
  // ── T1 GRUNT ─────────────────────────────────────────────────────────────
  { id: 'c1',  tier: 1, name: 'Bloodmaw',          img: '/creatures/creature1.png',
    hpMod: 0.9,  atkMod: 1.3, defMod: 0.7, variance: 0.15,
    desc: 'A savage predator that hunts by scent alone. Its jaws can crush iron.' },
  { id: 'c4',  tier: 1, name: 'Rot Creeper',        img: '/creatures/creature4.png',
    hpMod: 1.1,  atkMod: 0.9, defMod: 1.0, variance: 0.15,
    desc: 'A colony of decay given form. Its touch spreads blight to living tissue.' },
  { id: 'c6',  tier: 1, name: 'Plagueborn',          img: '/creatures/creature6.png',
    hpMod: 1.4,  atkMod: 0.7, defMod: 0.9, variance: 0.15,
    desc: 'Born in the fever-swamps. Where it walks, sickness follows.' },
  { id: 'c8',  tier: 1, name: 'Soulblight',          img: '/creatures/creature8.png',
    hpMod: 0.8,  atkMod: 1.4, defMod: 0.6, variance: 0.15,
    desc: 'Feeds on the vital essence of the living, leaving hollow shells in its wake.' },
  { id: 'c9',  tier: 1, name: 'Darkfang',            img: '/creatures/creature9.png',
    hpMod: 0.9,  atkMod: 1.3, defMod: 0.7, variance: 0.15,
    desc: 'Its venom corrodes both body and will. Survivors rarely speak of the encounter.' },
  { id: 'c10', tier: 1, name: 'Frostveil',            img: '/creatures/creature10.png',
    hpMod: 1.0,  atkMod: 0.6, defMod: 1.4, variance: 0.15,
    desc: 'A wraith of frozen air that numbs its prey into stillness before striking.' },
  { id: 'c12', tier: 1, name: 'Ashborn',              img: '/creatures/creature12.png',
    hpMod: 1.0,  atkMod: 1.0, defMod: 1.0, variance: 0.15,
    desc: 'Forged in the embers of a razed village. It carries the wrath of the fallen.' },
  { id: 'c22', tier: 1, name: 'Bog Fiend',            img: '/creatures/creature22.png',
    hpMod: 1.5,  atkMod: 0.7, defMod: 1.0, variance: 0.15,
    desc: 'Pulls victims beneath the mire. None have returned from its domain.' },

  // ── T2 PREDATOR ──────────────────────────────────────────────────────────
  { id: 'c2',  tier: 2, name: 'Graveborn Crusher',   img: '/creatures/creature2.png',
    hpMod: 1.5,  atkMod: 0.8, defMod: 1.3, variance: 0.12,
    desc: 'Risen from mass graves, it shambles forward with unstoppable weight.' },
  { id: 'c5',  tier: 2, name: 'Bonescale Fiend',      img: '/creatures/creature5.png',
    hpMod: 1.1,  atkMod: 1.0, defMod: 1.4, variance: 0.12,
    desc: 'Plated in fused bone, it shrugs off blows that would fell a lesser beast.' },
  { id: 'c11', tier: 2, name: 'Bloodthorn',            img: '/creatures/creature11.png',
    hpMod: 1.0,  atkMod: 1.4, defMod: 0.8, variance: 0.12,
    desc: 'A cursed bramble-creature that bleeds its victims dry through barbed tendrils.' },
  { id: 'c15', tier: 2, name: 'Thunderhide',           img: '/creatures/creature15.png',
    hpMod: 1.4,  atkMod: 1.1, defMod: 1.0, variance: 0.12,
    desc: 'A brute whose hide conducts lightning. Striking it risks a deadly discharge.' },
  { id: 'c16', tier: 2, name: 'Briarhunter',           img: '/creatures/creature16.png',
    hpMod: 0.9,  atkMod: 1.5, defMod: 0.7, variance: 0.12,
    desc: 'Stalks prey through dense undergrowth. Silent until the moment it lunges.' },
  { id: 'c17', tier: 2, name: 'Emberspecter',          img: '/creatures/creature17.png',
    hpMod: 0.9,  atkMod: 1.4, defMod: 0.6, variance: 0.12,
    desc: 'The ghost of something burned alive. It radiates searing heat in all directions.' },
  { id: 'c18', tier: 2, name: 'Viperous Shade',        img: '/creatures/creature18.png',
    hpMod: 0.8,  atkMod: 1.6, defMod: 0.5, variance: 0.12,
    desc: 'Half serpent, half shadow. Its bite poisons the mind as much as the body.' },
  { id: 'c19', tier: 2, name: 'Stoneblight',           img: '/creatures/creature19.png',
    hpMod: 1.2,  atkMod: 0.6, defMod: 1.8, variance: 0.12,
    desc: 'A slow, grinding horror. Its presence petrifies the ground beneath it.' },
  { id: 'c21', tier: 2, name: 'Stormscreech',          img: '/creatures/creature21.png',
    hpMod: 1.0,  atkMod: 1.3, defMod: 0.8, variance: 0.12,
    desc: 'A flying predator that calls lightning down on fleeing prey.' },

  // ── T3 DIRE ───────────────────────────────────────────────────────────────
  { id: 'c3',  tier: 3, name: 'Shadowflesh',          img: '/creatures/creature3.png',
    hpMod: 1.1,  atkMod: 1.3, defMod: 1.1, variance: 0.10,
    desc: 'Its body shifts between shadow and flesh, making it nearly impossible to strike.' },
  { id: 'c7',  tier: 3, name: 'Death Hollow',          img: '/creatures/creature7.png',
    hpMod: 1.4,  atkMod: 0.9, defMod: 1.5, variance: 0.10,
    desc: 'A hollow vessel animated by residual death magic. It knows no pain.' },
  { id: 'c13', tier: 3, name: 'Grave Sentinel',        img: '/creatures/creature13.png',
    hpMod: 1.2,  atkMod: 1.0, defMod: 1.6, variance: 0.10,
    desc: 'An ancient guardian bound to protect a tomb long since plundered.' },
  { id: 'c14', tier: 3, name: 'Dusk Wraith',           img: '/creatures/creature14.png',
    hpMod: 1.0,  atkMod: 1.6, defMod: 0.8, variance: 0.10,
    desc: 'Emerges only at twilight. Its wail paralyzes those who hear it.' },
  { id: 'c20', tier: 3, name: 'Tomb Horror',           img: '/creatures/creature20.png',
    hpMod: 1.4,  atkMod: 1.2, defMod: 1.2, variance: 0.10,
    desc: 'Dragged from the deep dark of burial crypts. It despises the living.' },
  { id: 'c23', tier: 3, name: 'Void Spawn',            img: '/creatures/creature23.png',
    hpMod: 1.2,  atkMod: 1.5, defMod: 0.9, variance: 0.10,
    desc: 'A fragment of the void given grotesque form. It hungers without end.' },
  { id: 'c24', tier: 3, name: 'Lava Fiend',            img: '/creatures/creature24.png',
    hpMod: 1.3,  atkMod: 1.5, defMod: 0.8, variance: 0.10,
    desc: 'Crawls from volcanic fissures. Its body burns at temperatures that melt steel.' },
  { id: 'c25', tier: 3, name: 'Rift Horror',           img: '/creatures/creature25.png',
    hpMod: 1.1,  atkMod: 1.3, defMod: 1.3, variance: 0.10,
    desc: 'Slips between planes of existence. Wounds from it do not heal naturally.' },

  // ── T4 ELITE ──────────────────────────────────────────────────────────────
  { id: 'e1', tier: 4, name: 'Morvane, the Frozen Condemned', img: '/bosses/frozen-zombie.png',
    hpMod: 1.0, atkMod: 1.0, defMod: 1.0, variance: 0,
    desc: 'A warrior executed in winter and cursed to walk forever. His rage has not thawed in three centuries.' },
  { id: 'e2', tier: 4, name: 'Seraphine the Bloodless',        img: '/bosses/undead-vampire-woman.png',
    hpMod: 1.0, atkMod: 1.0, defMod: 1.0, variance: 0,
    desc: 'Once a high priestess, now an undying predator. She drains life with a whisper.' },
  { id: 'e3', tier: 4, name: 'Grakthar the Unbroken',          img: '/bosses/orc-chief.png',
    hpMod: 1.0, atkMod: 1.0, defMod: 1.0, variance: 0,
    desc: 'No blade has ever drawn his blood. He has crushed every challenger beneath his fists.' },
  { id: 'e4', tier: 4, name: 'Gryvara, Ironblood Matriarch',   img: '/bosses/orc-lady.png',
    hpMod: 1.0, atkMod: 1.0, defMod: 1.0, variance: 0,
    desc: 'Commander of a dozen warbands. She leads from the front and leaves nothing standing.' },
  { id: 'e5', tier: 4, name: 'Korruk the Merciless',           img: '/bosses/orc-warrior.png',
    hpMod: 1.0, atkMod: 1.0, defMod: 1.0, variance: 0,
    desc: 'Has never offered quarter and never asked for it. His battlefield record spans forty years of war.' },

  // ── T5 LEGENDARY ──────────────────────────────────────────────────────────
  { id: 'l1', tier: 5, name: 'Sylvaris, Queen of Ruin',   img: '/bosses/dark-elf-queen.png',
    hpMod: 1.0, atkMod: 1.0, defMod: 1.0, variance: 0,
    desc: 'She dismantled an empire from within. Now she builds something far worse from its ashes.' },
  { id: 'l2', tier: 5, name: 'Malachar, the Eternal Lich', img: '/undead-king.png',
    hpMod: 1.0, atkMod: 1.0, defMod: 1.0, variance: 0,
    desc: 'His phylactery has never been found. He has died seventeen times and returned each time stronger.' },
];

// Only T1–T3 creatures appear as random encounters
const ENCOUNTER_POOL = CREATURE_INDEX.filter(c => c.tier <= 3);

// Tier weights per day — harder creatures appear more often as days progress
const TIER_WEIGHTS_BY_DAY = [
  { 1: 10, 2: 0,  3: 0  }, // day 1
  { 1: 8,  2: 2,  3: 0  }, // day 2
  { 1: 6,  2: 4,  3: 0  }, // day 3
  { 1: 4,  2: 5,  3: 1  }, // day 4
  { 1: 2,  2: 5,  3: 3  }, // day 5
  { 1: 1,  2: 4,  3: 5  }, // day 6
  { 1: 0,  2: 3,  3: 7  }, // day 7
];

export const pickCreatureForZone = (tierWeights) => {
  const pool = [];
  [1, 2, 3].forEach(t => {
    const w = tierWeights[t] || 0;
    if (w === 0) return;
    const creatures = ENCOUNTER_POOL.filter(c => c.tier === t);
    for (let i = 0; i < w; i++) pool.push(...creatures);
  });
  return pool[Math.floor(Math.random() * pool.length)];
};

export const pickCreatureForDay = (day) => {
  const weights = TIER_WEIGHTS_BY_DAY[Math.min(day - 1, 6)];
  const pool = [];
  [1, 2, 3].forEach(t => {
    const w = weights[t];
    if (w === 0) return;
    const creatures = ENCOUNTER_POOL.filter(c => c.tier === t);
    for (let i = 0; i < w; i++) pool.push(...creatures);
  });
  return pool[Math.floor(Math.random() * pool.length)];
};

export const rollCreatureStats = (creature) => {
  const v = creature.variance || 0;
  const roll = v > 0 ? 1 + (Math.random() * 2 - 1) * v : 1;
  return {
    ...creature,
    roll,
    rolledHpMult:  creature.hpMod  * roll,
    rolledAtkMult: creature.atkMod * roll,
    rolledDefMult: creature.defMod * roll,
  };
};

// Quality label + color based on the roll value
export const getCreatureQuality = (roll) => {
  if (roll >= 1.08) return { label: 'Superior', color: '#F59E0B' };
  if (roll >= 1.03) return { label: 'Strong',   color: '#A855F7' };
  if (roll >= 0.97) return { label: 'Average',  color: '#9CA3AF' };
  return               { label: 'Weak',      color: '#6B7280' };
};
