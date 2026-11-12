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

// ── Signature attacks ───────────────────────────────────────────────────────
// Three named regular attacks per creature, used for battle narration only
// (no damage effect). Narrated as: "<Name> used <name>! <Short name> <desc>"
// Tone by tier: T1 blunt/animal · T2 cunning/elemental · T3 unnatural ·
// T4 personal/martial · T5 mythic. Keep desc short (~8 words) — it types out.
const a = (name, desc) => ({ name, desc });
export const CREATURE_ATTACKS = {
  // T1 — Grunts
  c1:  [a('Iron Jaw', 'bites down hard enough to crush iron.'), a('Blood Scent', 'bolts for the smell of your wounds.'), a('Mauling Frenzy', 'mauls you in a snarling blur.')],
  c4:  [a('Blight Touch', 'smears rot across your skin.'), a('Spore Burst', 'bursts in a cloud of sickly spores.'), a('Creeping Rot', 'oozes over you, eating as it goes.')],
  c6:  [a('Fever Claw', 'rakes you with hot, sickly claws.'), a('Plague Breath', 'coughs a choking cloud into your face.'), a('Swamp Slam', 'slams into you, reeking of fever-swamp.')],
  c8:  [a('Essence Siphon', 'sips the warmth right out of you.'), a('Hollowing Grasp', 'takes hold, and something drains away.'), a('Life Leech', 'latches on and feeds.')],
  c9:  [a('Venom Bite', 'sinks dripping fangs into you.'), a('Corroding Spit', 'spits venom that hisses on your skin.'), a('Dark Pounce', 'leaps from the dark, fangs first.')],
  c10: [a('Numbing Touch', 'brushes you with fingers of frozen air.'), a('Rime Gust', 'blasts you with a freezing gale.'), a('Cold Snap', 'waits for you to slow, then snaps.')],
  c12: [a('Ember Fist', 'pounds you with fists of smoldering ash.'), a('Cinder Burst', 'showers you in burning embers.'), a("Fallen's Wrath", 'rages with the fury of a razed village.')],
  c22: [a('Mire Grasp', 'grabs you with hands of black mud.'), a('Sludge Slam', 'buries you in a wave of bog-muck.'), a('Drowning Pull', 'tries to drag you beneath the mire.')],

  // T2 — Predators
  c2:  [a('Grave Slam', 'falls on you with the weight of a mass grave.'), a('Unstoppable Advance', 'shambles straight through your guard.'), a('Bone Grinder', 'grinds you beneath its bulk.')],
  c5:  [a('Bone Plate Bash', 'rams you with fused bone armor.'), a('Spined Tail', 'whips a bone-ridged tail across your ribs.'), a('Ossified Claw', 'tears at you with claws of solid bone.')],
  c11: [a('Barbed Tendril', 'hooks barbed vines into your flesh.'), a('Thorn Snare', 'tightens a snare of thorns around you.'), a('Bloodletting', 'drinks through a hundred tiny barbs.')],
  c15: [a('Charged Ram', 'charges, hide crackling with lightning.'), a('Static Discharge', 'jolts you with a crackling arc.'), a('Thunder Stomp', 'stomps, and lightning races through the ground.')],
  c16: [a('Silent Lunge', 'lunges from the brush without a sound.'), a('Thicket Ambush', 'erupts from a spot you thought was empty.'), a("Hunter's Rend", 'rends you with practiced precision.')],
  c17: [a('Searing Wail', 'screams, and the air itself burns.'), a('Burning Grasp', 'clutches you with hands still aflame.'), a('Heat Wave', 'scorches everything around it.')],
  c18: [a('Mindvenom Bite', 'bites, and your thoughts begin to blur.'), a('Serpent Coil', 'coils around you from the shadows.'), a('Shade Fang', "darts from a shadow that wasn't there.")],
  c19: [a('Petrifying Grip', 'grips you with fingers of creeping stone.'), a('Hardening Crush', 'presses you into the hardening ground.'), a('Stonefall', 'drops a fist like falling rock.')],
  c21: [a('Lightning Call', 'shrieks, and lightning answers.'), a('Diving Talons', 'dives from above, talons first.'), a('Thunderclap Shriek', 'screeches with a crack like thunder.')],

  // T3 — Horrors
  c3:  [a('Phase Strike', 'vanishes, then is suddenly inside your guard.'), a('Umbral Grasp', 'reaches for you with arms of living darkness.'), a('Fleshshift Maul', 'becomes flesh just long enough to hit.')],
  c7:  [a('Hollow Blow', 'hits without pain or hesitation.'), a('Death Pulse', 'pulses with leftover death magic.'), a('Relentless Grip', 'clamps on and never lets go.')],
  c13: [a("Warden's Blow", 'brings down a blow practiced for a thousand years.'), a('Crypt Shield', 'smashes you with an ancient tomb shield.'), a('Broken Oath', 'fights for an oath long since broken.')],
  c14: [a('Twilight Wail', 'wails, and your body locks in place.'), a('Dusk Touch', 'passes a chilling hand through your chest.'), a('Last Light', 'snuffs out the light around you.')],
  c20: [a('Crypt Rend', 'claws at you with grave-dirt talons.'), a('Hatred of the Living', 'hurls itself at you in pure loathing.'), a('Burial Crush', 'pulls you down as if into the earth.')],
  c23: [a('Void Bite', 'bites, and part of you simply vanishes.'), a('Endless Hunger', 'devours everything within reach.'), a('Null Tendril', 'wraps you in a tendril of nothing.')],
  c24: [a('Molten Fist', 'pummels you with molten rock.'), a('Magma Spew', 'spews burning magma across you.'), a('Fissure Eruption', 'splits the ground, and fire pours out.')],
  c25: [a('Planar Rend', 'opens a wound that refuses to close.'), a('Rift Step', 'slips between worlds and appears behind you.'), a('Otherworld Claw', 'rakes you with claws from another world.')],

  // T4 — Elites
  e1:  [a("Winter's Execution", 'swings the axe that ended him.'), a('Frozen Rage', 'attacks with a fury that never thawed.'), a('Gravefrost Grip', 'seizes you with a hand cold as the grave.')],
  e2:  [a('Bloodless Whisper', 'whispers, and your strength drains away.'), a('Crimson Kiss', "goes for your throat with a priestess's grace."), a('Sanguine Rite', 'turns an old prayer into a curse.')],
  e3:  [a('Unbroken Fist', 'hits with fists no blade has stopped.'), a("Challenger's End", 'finishes you as he finished all the rest.'), a('Earthshaker', 'drives both fists into the ground.')],
  e4:  [a('Warband Charge', 'charges like a dozen warbands at once.'), a('Ironblood Cleave', 'cleaves with a blade forged for war.'), a('Ironblood Rally', 'bellows a war-cry and crashes into you.')],
  e5:  [a("Veteran's Feint", 'fakes high, then cuts low.'), a("Warlord's Hammer", 'swings a hammer notched by forty years of war.'), a('Execution Stroke', 'aims for the neck, as always.')],

  // T5 — Legends
  l1:  [a('Unmaking', 'dismantles your defenses piece by piece.'), a('Ashen Decree', 'speaks, and the ashes rise against you.'), a("Empire's Fall", "topples everything you've built.")],
  l2:  [a("Phylactery's Wrath", 'draws power from a soul no one can find.'), a('Death Remembered', 'unleashes every death he has returned from.'), a("Lich's Touch", 'touches you, and your life begins to fade.')],
};

// Look up a creature's attacks by its display name (bosses are named after
// their CREATURE_INDEX entry). Returns null for non-creature enemies
// (bandits, Daughters of Dusk, the final boss) so callers can fall back.
export const getCreatureAttacks = (name) => {
  const creature = CREATURE_INDEX.find(c => c.name === name);
  return (creature && CREATURE_ATTACKS[creature.id]) || null;
};

// "Morvane, the Frozen Condemned" → "Morvane"; "Seraphine the Bloodless" → "Seraphine".
// Used for the second mention in narration so long titles don't repeat.
export const shortCreatureName = (name) => (name || '').split(/,| the /)[0].trim();

// Only T1–T3 creatures appear as random encounters
const ENCOUNTER_POOL = CREATURE_INDEX.filter(c => c.tier <= 3);

// Tier weights per day — harder creatures appear more often as days progress
const TIER_WEIGHTS_BY_DAY = [
  { 1: 10, 2: 0,  3: 0  }, // day 1 — zone 1 (grunts only)
  { 1: 10, 2: 0,  3: 0  }, // day 2 — zone 2 (grunts only)
  { 1: 3,  2: 7,  3: 0  }, // day 3 — zone 3 (predators unlock)
  { 1: 1,  2: 9,  3: 0  }, // day 4 — zone 4 (mostly predators)
  { 1: 0,  2: 3,  3: 7  }, // day 5 — zone 5 (dire unlock)
  { 1: 0,  2: 2,  3: 8  }, // day 6
  { 1: 0,  2: 1,  3: 9  }, // day 7
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
