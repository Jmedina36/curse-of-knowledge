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
    name: 'Blood on the Water',
    contractTier: 'gold',
    storyContract: true,
    desc: "Ships have been rotting at the docks for weeks. The crew didn't abandon them — they were taken. Locals say armed men arrived quietly and sealed the harbor. No one has left since.",
    storyNote: "Among the bodies you find orders on folded parchment, sealed in red wax — a six-pointed sigil you don't recognize. The text is brief: 'Secure the harbor. Nothing moves without clearance. Await the signal. — C.' The ink is fresh. Whoever C is, they planned this.",
    zone: 1,
    encounter: {
      enemyType: 'bandit',
      waveSize: 3,
      enemyNames: ['Dock Enforcer', 'Tide Watcher', "Quartermaster's Dog"],
      dialogue: [
        "You shouldn't have come looking.",
        "We have our orders. You're not part of them.",
        "The crew's gone. You'll join them.",
      ],
    },
    rewards: [
      { type: 'gold',       amount: 40 },
      { type: 'healthPots', amount: 2  },
      { type: 'xp',         amount: 80 },
    ],
  },
  {
    id: 'lc_holy_tree',
    locationId: 'holy_tree',
    locationName: 'The Sacred Grove',
    name: 'The Rite at the Grove',
    contractTier: 'gold',
    storyContract: true,
    desc: "The sacred tree is dying from the roots up. Witnesses report robed women circling it at night, chanting over a carved ritual circle. The grove keeper hasn't been seen in days.",
    storyNote: "The ritual circle still smolders after the Daughters fall. At its heart, carved into the oldest root, is a six-pointed sigil — the same mark from the harbor. Different faction. Same order. Whatever they serve, it moves through more than one hand.",
    zone: 1,
    encounter: {
      enemyType: 'daughters',
      waveSize: 3,
      enemyNames: ['Grove Ritualist', 'Dusk Acolyte', 'Blood Tender'],
      dialogue: [
        "The tree belongs to the darkness now.",
        "Your blood will feed the rite.",
        "The convergence cannot be stopped.",
      ],
    },
    rewards: [
      { type: 'staminaPots', amount: 2  },
      { type: 'gold',        amount: 40 },
      { type: 'xp',         amount: 80 },
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
    requiredContracts: ['lc_harbor', 'lc_holy_tree'],
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
