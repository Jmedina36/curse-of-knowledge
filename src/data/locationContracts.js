// Named location contracts — tied to specific map locations.
// Accepting one on the board sends you to that location on the map.
// Winning the battle moves it to pending. Clicking Complete on the
// card collects all rewards and seals the contract.

export const LOCATION_CONTRACTS = [
  {
    id: 'lc_wellspring',
    locationId: 'fountain',
    locationName: 'Wellspring',
    name: "The Warden's Request",
    desc: 'The warden stopped reporting weeks ago. The spring still flows — but something foul has taken root in the water. Find out what happened and drive it out.',
    zone: 2,
    encounter: {
      enemyType: 'bandit',
      waveSize: 3,
      enemyNames: ['Spring Defiler', 'Venom Bearer', 'Foul Keeper'],
      dialogue: [
        "The warden won't be coming back.",
        "The spring belongs to us now.",
        "The water runs dark for a reason.",
      ],
    },
    rewards: [
      { type: 'cleansePots', amount: 2  },
      { type: 'gold',        amount: 20 },
      { type: 'xp',         amount: 50 },
    ],
  },
  {
    id: 'lc_harbor',
    locationId: 'harbor',
    locationName: 'Ghost Harbor',
    name: 'Missing Crew',
    desc: 'Ships rot at the docks. The crew didn\'t disappear — they were taken. Whatever took them is still there.',
    zone: 1,
    encounter: {
      enemyType: 'bandit',
      waveSize: 3,
      enemyNames: ['Harbor Thug', 'Dock Lurker', 'Salvager'],
      dialogue: [
        "You shouldn't have come looking.",
        "The harbor belongs to us now.",
        "The crew's gone. And so are you.",
      ],
    },
    rewards: [
      { type: 'gold',       amount: 25 },
      { type: 'healthPots', amount: 2  },
      { type: 'xp',         amount: 50 },
    ],
  },
  {
    id: 'lc_holy_tree',
    locationId: 'holy_tree',
    locationName: 'The Sacred Grove',
    name: 'Protect the Grove',
    desc: 'The sacred tree is dying. A cult has taken root in the grove — draining it, defiling it. Drive them out before the corruption becomes permanent.',
    zone: 1,
    encounter: {
      enemyType: 'bandit',
      waveSize: 3,
      enemyNames: ['Grove Cultist', 'Defiler', 'Dark Acolyte'],
      dialogue: [
        "The tree belongs to the darkness now.",
        "Your blood will feed the ritual.",
        "The grove will fall. You cannot stop it.",
      ],
    },
    rewards: [
      { type: 'staminaPots', amount: 2  },
      { type: 'gold',        amount: 20 },
      { type: 'xp',         amount: 50 },
    ],
  },
  {
    id: 'lc_canopy',
    locationId: 'canopy_outpost',
    locationName: 'Canopy Outpost',
    name: "The Warlord's Mark",
    contractTier: 'blood',
    desc: "The outpost wasn't just raided — it was claimed. A warbanner flies at the peak bearing a symbol none of the scouts recognized. An orc warlord has fortified the position in the name of an order no one has heard of. Drive him out before he signals reinforcements.",
    zone: 1,
    requiresZone1Complete: true,
    encounter: {
      enemyType: 'elite',
      eliteId: 'e5',
      waveSize: 1,
      dialogue: '"You are the third blade sent against me. Bring a fourth."',
    },
    rewards: [
      { type: 'fusionCrystals', amount: 2  },
      { type: 'gold',           amount: 50 },
      { type: 'xp',             amount: 120 },
    ],
  },
];

export const REWARD_LABELS = {
  gold:          'Gold',
  xp:            'XP',
  healthPots:    'Health Potion',
  staminaPots:   'Stamina Potion',
  cleansePots:   'Cleanse Potion',
  fusionCrystals:'Fusion Crystal',
};

export const REWARD_COLORS = {
  gold:           'rgba(212,175,55,0.95)',
  xp:             'rgba(130,220,100,0.95)',
  healthPots:     'rgba(220,80,80,0.95)',
  staminaPots:    'rgba(80,160,220,0.95)',
  cleansePots:    'rgba(180,100,220,0.95)',
  fusionCrystals: 'rgba(100,220,220,0.95)',
};
