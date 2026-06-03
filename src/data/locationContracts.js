// Named location contracts — tied to specific map locations.
// Accepting one on the board sends you to that location on the map.
// Winning a battle there completes it and awards the listed rewards.

export const LOCATION_CONTRACTS = [
  {
    id: 'lc_harbor',
    locationId: 'harbor',
    locationName: 'Ghost Harbor',
    name: 'Missing Crew',
    desc: 'Ships rot at the docks. Trace the last crew\'s path before something else does.',
    zone: 1,
    xpReward: 40,
    goldReward: 15,
  },
  {
    id: 'lc_holy_tree',
    locationId: 'holy_tree',
    locationName: 'The Sacred Grove',
    name: 'Protect the Grove',
    desc: 'Something hunts within the sacred grove. Drive it out before the tree falls dark.',
    zone: 1,
    xpReward: 35,
    goldReward: 12,
  },
  {
    id: 'lc_canopy',
    locationId: 'canopy_outpost',
    locationName: 'Canopy Outpost',
    name: 'Scouting Report',
    desc: 'The outpost has gone silent. Fight through what lurks there and bring back word.',
    zone: 1,
    xpReward: 30,
    goldReward: 10,
  },
];
