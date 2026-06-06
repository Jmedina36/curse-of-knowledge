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
      waveSize: 1,
      enemyNames: ['Dray'],
      dialogue: [
        "You shouldn't have come looking. I handle problems quietly. You've made that difficult.",
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
      waveSize: 1,
      enemyNames: ['Briar'],
      dialogue: [
        "I've been watching you since the road. I wondered when you'd finally arrive.",
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

  // ── Mercy Contracts — The Cursed ──────────────────────────────────────────────
  // Fallen heroes who cannot leave until someone puts them to rest.
  // Completing one marks those members as restedCursed in the Bestiary.
  {
    id: 'mc_aldric_sela',
    locationId: 'wardens_stone',
    locationName: "The Warden's Stone",
    name: 'Mercy for the Oath',
    contractTier: 'gold',
    mercyContract: true,
    zone: 1,
    desc: "Two of the cursed still linger at the Warden's Stone — a young knight who swore an oath he couldn't keep, and the girl who followed him into the dark. Neither can leave. Neither can rest. Someone has to end it.",
    encounter: {
      enemyType: 'cursed',
      members: [
        { img: '/cursed/young-paladin.png', name: 'Aldric', hp: 90, dialogue: "I can't stop. I can't remember how." },
        { img: '/cursed/young-princess.png', name: 'Sela', hp: 75, dialogue: "Is someone finally here? Or is this another dream?" },
      ],
    },
    rewards: [
      { type: 'xp',          amount: 65  },
      { type: 'gold',        amount: 25  },
      { type: 'healthPots',  amount: 1   },
    ],
  },
  {
    id: 'mc_lysse_kira',
    locationId: 'cactus_flats',
    locationName: 'The Cactus Flats',
    name: 'Lost on the Road',
    contractTier: 'gold',
    mercyContract: true,
    zone: 2,
    desc: "An elven pathfinder and her escort never made it back from the flats. Locals say they still wander the wasteland at the edge of the road — circling the same stretch of ground they walked before the curse took them.",
    encounter: {
      enemyType: 'cursed',
      members: [
        { img: '/cursed/elven-girl.png', name: 'Lysse', hp: 150, dialogue: "The source is close. I know it. I've always known it." },
        { img: '/cursed/mongolian-princess.png', name: 'Kira', hp: 135, dialogue: "I was supposed to keep her safe. I'm still trying." },
      ],
    },
    rewards: [
      { type: 'xp',          amount: 110 },
      { type: 'gold',        amount: 40  },
      { type: 'healthPots',  amount: 1   },
    ],
  },
  {
    id: 'mc_conn_dar',
    locationId: 'ghost_fleet',
    locationName: 'The Ghost Fleet',
    name: 'No Refunds',
    contractTier: 'gold',
    mercyContract: true,
    zone: 2,
    desc: "Two sell-swords — a mercenary sergeant and the opportunist who followed his company — haven't left the harbor ruins in months. One took the contract for money. One didn't take it at all. Now they're both stuck.",
    encounter: {
      enemyType: 'cursed',
      members: [
        { img: '/cursed/mercenary.png', name: 'Conn', hp: 165, dialogue: "Still getting paid for this, far as I'm concerned." },
        { img: '/cursed/robber.png', name: 'Dar', hp: 140, dialogue: "I don't even know why I'm still here. I never know." },
      ],
    },
    rewards: [
      { type: 'xp',          amount: 110 },
      { type: 'gold',        amount: 45  },
      { type: 'staminaPots', amount: 1   },
    ],
  },
  {
    id: 'mc_bryn_solveig',
    locationId: 'old_tree',
    locationName: 'The Hollow',
    name: 'The Shield Does Not Break',
    contractTier: 'gold',
    mercyContract: true,
    zone: 3,
    desc: "Two veteran fighters were last seen near The Hollow — a shield-captain from the Northern Reach and the skjaldmær who rode beside her. Both still standing. Neither aware the war they're fighting is already over.",
    encounter: {
      enemyType: 'cursed',
      members: [
        { img: '/cursed/warrior-lady.png', name: 'Bryn', hp: 245, dialogue: "Hold the line. We hold the line." },
        { img: '/cursed/viking-woman.png', name: 'Solveig', hp: 225, dialogue: "Forward. Always forward. That's all there is." },
      ],
    },
    rewards: [
      { type: 'xp',          amount: 180 },
      { type: 'gold',        amount: 65  },
      { type: 'healthPots',  amount: 2   },
    ],
  },
  {
    id: 'mc_maren_sunwen',
    locationId: 'old_nexus',
    locationName: 'The Old Nexus',
    name: 'Second Crossing',
    contractTier: 'gold',
    mercyContract: true,
    zone: 3,
    desc: "A survivor of the second expedition who walked back in, and the foreign prince who found her on the road. They reached the Old Nexus and stopped. Whatever they found here, they couldn't leave it.",
    encounter: {
      enemyType: 'cursed',
      members: [
        { img: '/cursed/young-lady.png', name: 'Maren', hp: 260, dialogue: "I saw something. I had to come back. I had to see if it was real." },
        { img: '/cursed/young-korean-prince.png', name: 'Sun Wen', hp: 235, dialogue: "I followed her here. I don't regret it. I don't think." },
      ],
    },
    rewards: [
      { type: 'xp',          amount: 180 },
      { type: 'gold',        amount: 65  },
      { type: 'staminaPots', amount: 2   },
    ],
  },
  {
    id: 'mc_sigrun_halvard',
    locationId: 'precipice',
    locationName: 'The Precipice',
    name: 'The Last Crossing',
    contractTier: 'gold',
    mercyContract: true,
    zone: 4,
    desc: "A jarl who sent his men home and a steward who stopped managing and started walking — both found at the edge of the mapped world. They made it further than anyone expected. They can't make the last step alone.",
    encounter: {
      enemyType: 'cursed',
      members: [
        { img: '/cursed/viking-warrior.png', name: 'Jarl Sigrun', hp: 360, dialogue: "Not their fight. Never was. But this one is mine." },
        { img: '/cursed/viking-noble-man.png', name: 'Lord Halvard', hp: 330, dialogue: "I understand the curse completely now. That doesn't help." },
      ],
    },
    rewards: [
      { type: 'xp',           amount: 280 },
      { type: 'gold',         amount: 90  },
      { type: 'fusionCrystals', amount: 1 },
    ],
  },
  {
    id: 'mc_sera_edric',
    locationId: 'crystal_lava',
    locationName: 'The Melt',
    name: 'The Last Mandate',
    contractTier: 'gold',
    mercyContract: true,
    zone: 5,
    desc: "A queen who abdicated her throne to face the curse herself, and the lorekeeper who spent forty years studying it — both trapped at The Melt. She crossed it once. He mapped it twice. Neither could cross it a final time.",
    encounter: {
      enemyType: 'cursed',
      members: [
        { img: '/cursed/warrior-queen.png', name: 'Queen Sera', hp: 490, dialogue: "My kingdom is ash. My name is ash. I have nothing left to lose." },
        { img: '/cursed/old-noble-man.png', name: 'Edric', hp: 450, dialogue: "I was wrong about one thing. Knowing it doesn't make it smaller." },
      ],
    },
    rewards: [
      { type: 'xp',           amount: 380 },
      { type: 'gold',         amount: 120 },
      { type: 'fusionCrystals', amount: 2 },
    ],
  },
  {
    id: 'mc_brek',
    locationId: 'skull_cave',
    locationName: 'Skull Cavern',
    name: 'The Last Man Standing',
    contractTier: 'gold',
    mercyContract: true,
    zone: 5,
    desc: "Three expeditions in. Still standing. The Cursed who was never defeated in life has never been defeated in death either. He is the last one. He doesn't know how to stop.",
    encounter: {
      enemyType: 'cursed',
      members: [
        { img: '/cursed/gladiator.png', name: 'Brek', hp: 620, dialogue: "Sixty-two. I've been counting. Come on then." },
      ],
    },
    rewards: [
      { type: 'xp',           amount: 420 },
      { type: 'gold',         amount: 140 },
      { type: 'fusionCrystals', amount: 2 },
      { type: 'healthPots',   amount: 2   },
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
