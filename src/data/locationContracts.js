// Named location contracts — tied to specific map locations.
// Accepting one on the board sends you to that location on the map.
// Winning the battle moves it to pending. Clicking Complete on the
// card collects all rewards and seals the contract.

export const LOCATION_CONTRACTS = [
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
    name: 'Scouting Report',
    desc: 'Scouts sent to the outpost never came back. Raiders have claimed it — fortified, armed, and not leaving quietly. Take it back and bring word of what they were after.',
    zone: 1,
    encounter: {
      enemyType: 'bandit',
      waveSize: 3,
      enemyNames: ['Canopy Raider', 'Treetop Scout', 'Outpost Guard'],
      dialogue: [
        "Move along. This post is ours now.",
        "You won't be filing any reports.",
        "Nobody leaves the outpost alive.",
      ],
    },
    rewards: [
      { type: 'fusionCrystals', amount: 1  },
      { type: 'gold',           amount: 20 },
      { type: 'xp',             amount: 45 },
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
