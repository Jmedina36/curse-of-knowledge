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
    desc: 'Something ancient hunts within the grove. Drive it out before the tree falls dark.',
    zone: 1,
    encounter: {
      enemyType: 'creature',
      waveSize: 2,
      tierWeights: { 1: 3, 2: 7, 3: 0 },
    },
    rewards: [
      { type: 'staminaPots', amount: 2  },
      { type: 'gold',        amount: 15 },
      { type: 'xp',         amount: 40 },
    ],
  },
  {
    id: 'lc_canopy',
    locationId: 'canopy_outpost',
    locationName: 'Canopy Outpost',
    name: 'Scouting Report',
    desc: 'The outpost has gone silent. Fight through what lurks there and bring back word.',
    zone: 1,
    encounter: {
      enemyType: 'creature',
      waveSize: 2,
      tierWeights: { 1: 7, 2: 3, 3: 0 },
    },
    rewards: [
      { type: 'fusionCrystals', amount: 1  },
      { type: 'gold',           amount: 15 },
      { type: 'xp',             amount: 35 },
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
