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
    contractTier: 'gold',
    storyContract: true,
    desc: "The warden stopped reporting weeks ago. The spring still flows — but something foul has taken root in the water, and the locals who relied on it have gone quiet. Find out what happened and drive it out.",
    storyNote: "The warden's body is in the lower chamber. No sigil. No seal. Just a blade wound and a folded note tucked inside his boot: 'Keep the spring clear. Route will pass through before the season ends. Do not interfere.' Unsigned. Whoever left it didn't need to sign their work. They expected no one to look.",
    journalEntry: {
      title: 'The Route',
      location: 'Wellspring',
      zone: 2,
      text: `The warden didn't vanish. He was killed for finding something he wasn't supposed to find.\n\nThere was a note in his boot. No sigil, no name — just a single instruction: keep the spring clear, a route will pass through before the season ends, don't interfere. Someone is treating this water source as a waypoint. Not poisoning it. Securing it.\n\nThe harbor fell. The grove fell. The outpost fell. They haven't stopped. They're building something that runs through this entire region — and they're quietly removing anything that gets in the way.`,
    },
    zone: 2,
    encounter: {
      enemyType: 'wave',
      waveSize: 3,
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
    journalEntry: {
      title: 'The Parchment at the Harbor',
      location: 'Ghost Harbor',
      zone: 1,
      text: `Dray is dead. Found orders on him — folded parchment, red wax seal. A six-pointed sigil I've never seen. The message was short: secure the harbor, let nothing move, wait for the signal. Signed only with a C.\n\nThis wasn't a shakedown. Someone organized this. The harbor was a piece of something larger. I don't know what yet.`,
    },
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
    requiredContracts: ['lc_harbor'],
    desc: "The sacred tree is dying from the roots up. Witnesses report robed women circling it at night, chanting over a carved ritual circle. The grove keeper hasn't been seen in days.",
    storyNote: "The ritual circle still smolders after the Daughters fall. At its heart, carved into the oldest root, is a six-pointed sigil — the same mark from the harbor. Different faction. Same order. Whatever they serve, it moves through more than one hand.",
    journalEntry: {
      title: 'The Same Mark',
      location: 'The Sacred Grove',
      zone: 1,
      text: `The sigil again. Carved into the root of the sacred tree, inside a ritual circle the Daughters were maintaining. The grove keeper is dead. Briar wouldn't say anything before the end.\n\nBandits at the harbor. Daughters of Dusk at the grove. Two factions. One mark. Whatever this order is, it doesn't care about allegiances. It uses who it needs.`,
    },
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
    journalEntry: {
      title: 'The Third Blade',
      location: 'Canopy Outpost',
      zone: 1,
      text: `He said I was the third blade sent against him. Meant it as a taunt. It wasn't.\n\nThree separate attempts to take this outpost. That means the order has been watching me since the harbor — maybe before. They sent two others first. I don't know if they were testing me or just underestimating me.\n\nThe banner bore the same sigil. Whatever C is building, this outpost was part of it. I've taken it back. I don't think that ends anything.`,
    },
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

  // ── Zone 2 Story Contracts ────────────────────────────────────────────────────
  {
    id: 'lc_ivy_crossing',
    locationId: 'ivy_crossing',
    locationName: 'Ivy Crossing',
    name: 'The Quiet Toll',
    contractTier: 'gold',
    storyContract: true,
    requiredContracts: ['mc_lysse_kira'],
    desc: "The road through Ivy Crossing has been sealed for two weeks. Merchants report armed men turning back specific travelers — not collecting coin, consulting a list. The vines have been cultivated as cover. Someone is controlling who comes and goes.",
    storyNote: "In the toll post you find a ledger — every person turned back was named. Not random shakedowns. Targeted. The ledger is stamped with a six-pointed sigil. The same mark. A different road. The same hand.",
    journalEntry: {
      title: 'The Ledger',
      location: 'Ivy Crossing',
      zone: 2,
      text: `Finn claimed he was just following orders. He wasn't wrong — there was a ledger in the toll post. Every name in it was specific. Merchants, travelers, a healer. Not random. Targeted.\n\nThe ledger was stamped with the six-pointed sigil.\n\nThey're controlling movement. Who gets through, who gets turned back. I don't know what they're containing — or what they're protecting.`,
    },
    zone: 2,
    encounter: {
      enemyType: 'bandit',
      waveSize: 1,
      enemyNames: ['Finn'],
      dialogue: [
        "Nobody gets through without clearance. Those are my orders. I don't write them.",
      ],
    },
    rewards: [
      { type: 'gold',        amount: 50 },
      { type: 'healthPots',  amount: 2  },
      { type: 'xp',          amount: 100 },
    ],
  },
  {
    id: 'lc_whisper_forest',
    locationId: 'whisper_forest',
    locationName: 'Whisper Forest',
    name: 'The Deep Working',
    contractTier: 'gold',
    storyContract: true,
    requiredContracts: ['lc_wellspring'],
    desc: "The Daughters of Dusk have moved deeper into Whisper Forest and stopped hunting outward. Witnesses say they've been there for weeks — chanting, building something. No one who went to look has come back. The forest feels wrong at the edges.",
    storyNote: "The ritual site is still active when the Daughter falls. At its center: a summoning circle bearing the six-pointed sigil — but inverted. Not calling something in. Sending a signal out. The order is using this forest as a relay node, the same way they used the spring, the grove, the harbor. Whatever they're building spans more ground than you thought.",
    journalEntry: {
      title: 'The Relay',
      location: 'Whisper Forest',
      zone: 2,
      text: `The ritual circle was still burning when Vayne fell. I've seen the sigil carved and stamped and sealed in wax — this time it was inverted. Vayne said I keep finding them like it was a problem I was causing.\n\nThe circle wasn't summoning anything. It was broadcasting. A relay point, passing something outward across the forest.\n\nThey have nodes. The harbor, the grove, the wellspring — now this forest. Whatever network they're building, it doesn't follow roads. It follows routes they've already cleared.`,
    },
    zone: 2,
    encounter: {
      enemyType: 'daughters',
      waveSize: 1,
      enemyNames: ['Vayne'],
      dialogue: [
        "You keep finding us. That's going to become a problem for you.",
      ],
    },
    rewards: [
      { type: 'staminaPots', amount: 2  },
      { type: 'gold',        amount: 50 },
      { type: 'xp',          amount: 100 },
    ],
  },
  {
    id: 'lc_outskirts',
    locationId: 'outskirts',
    locationName: 'The Outskirts',
    name: "Ironblood's Answer",
    contractTier: 'blood',
    zone: 2,
    requiredContracts: ['mc_conn_dar'],
    desc: "A warband has fortified the Outskirts under a banner bearing the six-pointed sigil. Their commander arrived two days after the crossing fell silent. She wasn't already here. She was sent.",
    journalEntry: {
      title: 'Sent',
      location: 'The Outskirts',
      zone: 2,
      text: `Gryvara said my employer sends regards. Those were her last words.\n\nShe knew who I was. She arrived two days after I cleared the crossing — that's not coincidence. Someone told her I was coming. Someone is watching every move I make and deploying answers.\n\nI've been cutting threads. C knows. And C is not done.`,
    },
    encounter: {
      enemyType: 'elite',
      eliteId: 'e4',
      waveSize: 1,
      dialogue: "You've been cutting threads that weren't yours to cut. My employer sends regards.",
    },
    rewards: [
      { type: 'fusionCrystals', amount: 2   },
      { type: 'gold',           amount: 65  },
      { type: 'xp',             amount: 150 },
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
        { img: '/cursed/young-princess.png', name: 'Sela', hp: 75, gender: 'f', dialogue: "Is someone finally here? Or is this another dream?" },
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
    requiredContracts: ['lc_whisper_forest'],
    desc: "An elven pathfinder and her escort never made it back from the flats. Locals say they still wander the wasteland at the edge of the road — circling the same stretch of ground they walked before the curse took them.",
    encounter: {
      enemyType: 'cursed',
      members: [
        { img: '/cursed/elven-girl.png', name: 'Lysse', hp: 150, gender: 'f', dialogue: "The source is close. I know it. I've always known it." },
        { img: '/cursed/mongolian-princess.png', name: 'Kira', hp: 135, gender: 'f', dialogue: "I was supposed to keep her safe. I'm still trying." },
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
    requiredContracts: ['lc_ivy_crossing'],
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
  // ── Zone 3 Story Contracts ────────────────────────────────────────────────────
  {
    id: 'lc_old_crossing',
    locationId: 'old_crossing',
    locationName: 'The Old Crossing',
    name: 'The Road That Watches',
    contractTier: 'gold',
    storyContract: true,
    zone: 3,
    desc: "The old road into the third zone was abandoned after the last war. Someone has cleared it, repaired its bridges, and posted sentries at every turn. This isn't a patrol. It's an operation. The crossing is being managed.",
    storyNote: "The sentry had a route card — a schedule of shifts, patrol windows, and a handwritten note in the corner: 'Nothing through until the monolith is ready. Hold all traffic.' They aren't just controlling the road. They're controlling who reaches the interior. Whatever is being prepared deeper in the zone, this crossing is the last checkpoint before it.",
    journalEntry: {
      title: 'The Checkpoint',
      location: 'The Old Crossing',
      zone: 3,
      text: `The road wasn't cleared for travelers. It was cleared for logistics.\n\nThe sentry's route card had shift rotations, patrol windows, a hold order: nothing through until the monolith is ready. I don't know what the monolith is. I know it's further in.\n\nThey're running this zone like a construction site. The crossing is the gate. I'm through it now. Whatever is being built inside, I'm going to find it.`,
    },
    encounter: {
      enemyType: 'bandit',
      waveSize: 2,
      dialogue: [
        "Road's closed. Turn back or we make sure you do.",
      ],
    },
    rewards: [
      { type: 'gold',       amount: 60  },
      { type: 'healthPots', amount: 2   },
      { type: 'xp',         amount: 130 },
    ],
  },
  {
    id: 'lc_withered_woods',
    locationId: 'withered_woods',
    locationName: 'The Withered Woods',
    name: 'What Killed the Trees',
    contractTier: 'gold',
    storyContract: true,
    zone: 3,
    requiredContracts: ['lc_old_crossing'],
    desc: "The forest died from the inside out. No fire, no blight — the trees simply stopped. Rangers who entered to investigate stopped sending reports. The ones who came back said the silence in there wasn't natural. They said it felt like something had been listening.",
    storyNote: "The Daughters weren't performing a ritual — they were maintaining a silence. A working threaded through the whole forest, dampening sound, dampening thought, dampening the instinct to ask questions. On the central altar stone: a diagram of the zone's interior, with the monolith marked and a single annotation — 'When the silence holds, the work can begin.' They've been preparing the land itself.",
    journalEntry: {
      title: 'The Silence',
      location: 'The Withered Woods',
      zone: 3,
      text: `The trees didn't die. They were quieted.\n\nThe Daughters had a working running through the entire forest — not destructive, just suppressive. Damp everything down. Keep travelers from thinking clearly, from asking why the road was cleared, from looking toward the interior.\n\nOn the altar stone: a map of the zone, the monolith marked at the center, a note saying the silence needed to hold until the work was complete.\n\nThey've been preparing this land for months. I don't think anyone who entered this forest uninvited was supposed to leave it.`,
    },
    encounter: {
      enemyType: 'daughters',
      waveSize: 2,
      dialogue: [
        "You weren't supposed to think clearly enough to find us. Interesting.",
      ],
    },
    rewards: [
      { type: 'gold',        amount: 65  },
      { type: 'staminaPots', amount: 2   },
      { type: 'xp',          amount: 140 },
    ],
  },
  {
    id: 'lc_stonehenge',
    locationId: 'stonehenge',
    locationName: 'The Stonehenge',
    name: 'The Old Calendar',
    contractTier: 'gold',
    storyContract: true,
    zone: 3,
    requiredContracts: ['lc_withered_woods'],
    desc: "The standing stones have been here longer than any map. They've never done anything — until six months ago, when scholars began reporting faint resonance readings at the site. Now no one is permitted within a mile. Bandits enforce the perimeter. Something is happening inside the ring.",
    storyNote: "The stones aren't generating the resonance — they're receiving it. Someone has wired them into a larger network, carved fresh channels into the ancient rock that route energy outward toward the monolith. At the base of the central stone, a sealed container: a progress ledger, dated, showing regular readings over six months. The last entry reads: 'Channel calibration complete. All nodes aligned. Awaiting monolith activation.' The stonehenge is a relay. It was never the source.",
    journalEntry: {
      title: 'The Relay',
      location: 'The Stonehenge',
      zone: 3,
      text: `They didn't build this place. They found it and wired it into something larger.\n\nFresh channels carved into thousand-year-old stone, routing energy toward the monolith. The ledger at the base showed six months of calibration work — precise, patient, methodical. Last entry: channel calibration complete, all nodes aligned, awaiting monolith activation.\n\nThis isn't an ancient ritual. It's an engineered system. Someone who understands both old power and how to direct it built this. C has people who know what they're doing.\n\nI need to reach the monolith before they finish whatever they started.`,
    },
    encounter: {
      enemyType: 'bandit',
      waveSize: 3,
      dialogue: [
        "The stones aren't for you. Nothing in this zone is for you.",
      ],
    },
    rewards: [
      { type: 'gold',          amount: 70  },
      { type: 'healthPots',    amount: 2   },
      { type: 'xp',            amount: 150 },
    ],
  },
  {
    id: 'lc_dungeon_fallen',
    locationId: 'dungeon_fallen',
    locationName: 'Dungeon of the Fallen',
    name: 'What Was Left Behind',
    contractTier: 'gold',
    storyContract: true,
    zone: 3,
    requiredContracts: ['mc_bryn_solveig'],
    desc: "The old dungeon was sealed after the last war — not locked, sealed. Whatever was inside was not meant to come out. Now the seals are broken from the inside, and something is being moved through in organized shifts. The Daughters have been running transports through it for weeks.",
    storyNote: "They weren't releasing something — they were using the dungeon as a transit point. The chambers below connect to a passage network that surfaces near the monolith. Efficient. Invisible. At the far end of the lowest level, a staging area: equipment, materials, and a message written on the wall in chalk — 'Last transit. Leave nothing. The work ends at the monolith.' Whatever they needed the dungeon for, they're done with it. They're moving to the final stage.",
    journalEntry: {
      title: 'The Transit',
      location: 'Dungeon of the Fallen',
      zone: 3,
      text: `They broke the seals to use it as a road.\n\nThe old dungeon connects underground to the monolith's base. The Daughters have been running materials and personnel through it for weeks — quiet, invisible, undetectable from the surface.\n\nThe staging area at the bottom level was mostly cleared. On the wall in chalk: 'Last transit. Leave nothing. The work ends at the monolith.'\n\nThey're done moving things. They're done preparing. Whatever is happening at the monolith, it's starting now. I need to move.`,
    },
    encounter: {
      enemyType: 'daughters',
      waveSize: 2,
      dialogue: [
        "You're too late. The last transit already went through.",
      ],
    },
    rewards: [
      { type: 'gold',        amount: 75  },
      { type: 'staminaPots', amount: 2   },
      { type: 'xp',          amount: 160 },
    ],
  },
  {
    id: 'lc_the_pillars',
    locationId: 'the_pillars',
    locationName: 'The Pillars',
    name: 'The Frame',
    contractTier: 'gold',
    storyContract: true,
    zone: 3,
    requiredContracts: ['lc_dungeon_fallen'],
    desc: "The ancient pillars stand in a perfect arc facing the monolith. They were thought to be decorative — remnants of a structure long since collapsed. Scholars who examined them two years ago found no function. The scholars who examined them last month didn't come back.",
    storyNote: "The pillars aren't decorative and they aren't remnants. They're a frame — each one carved with binding sigils on the interior face, invisible from the outside. Together they form a containment arc pointing at the monolith. Whatever the monolith is going to release, the pillars are meant to direct it. Shape it. Keep it from spreading in every direction at once. Someone has been planning this for a very long time. The containment wasn't added recently. It was built into the original design.",
    journalEntry: {
      title: 'The Shape of It',
      location: 'The Pillars',
      zone: 3,
      text: `The sigils face inward. You'd never see them unless you were looking for them — or unless you knew they were there.\n\nEach pillar is a binding point. Together they form a directed arc aimed at the monolith. Whatever is activated there, the pillars will shape the output — funnel it, focus it, prevent it from going everywhere at once.\n\nThis wasn't added to the site. It was built into the original construction, centuries ago. Someone designed this place to do exactly what it's about to do. C didn't create this plan. They found it. And then they waited for the right moment to use it.\n\nI don't know what that means for anyone in range of the output.`,
    },
    encounter: {
      enemyType: 'bandit',
      waveSize: 3,
      dialogue: [
        "You read the pillars. That means you understand what's coming. And you still can't stop it.",
      ],
    },
    rewards: [
      { type: 'gold',          amount: 80  },
      { type: 'healthPots',    amount: 2   },
      { type: 'fusionCrystals', amount: 1  },
      { type: 'xp',            amount: 170 },
    ],
  },
  {
    id: 'lc_arcane_monolith',
    locationId: 'arcane_monolith',
    locationName: 'The Arcane Monolith',
    name: 'The Work',
    contractTier: 'gold',
    storyContract: true,
    zone: 3,
    requiredContracts: ['lc_the_pillars'],
    desc: "The monolith has stood since before any record. It has never been active. Three days ago it began to hum. Travelers thirty miles out report hearing it in their sleep. The order's full strength is stationed here — not to guard it. To operate it.",
    storyNote: "You reach the monolith to find it mid-activation — channels open, the stonehenge relay feeding it, the pillar arc directing its output toward the horizon. The engineer overseeing the work says C won't be here to see it. C is never at the point of completion. They only build. At the center of the control platform: a sealed letter addressed to no one. Inside, in C's hand: 'If you're reading this, you arrived in time to witness it. Not in time to stop it. That distinction matters. — C.' You destroy the control platform. The monolith goes dark. The relay breaks. You don't know what it was meant to do. You know it didn't do it.",
    journalEntry: {
      title: 'What Was Stopped',
      location: 'The Arcane Monolith',
      zone: 3,
      text: `The monolith was mid-activation when I reached it. The relay running, the arc directing, the channels open. Everything in motion.\n\nC's letter was on the control platform. 'If you're reading this, you arrived in time to witness it. Not in time to stop it.' Wrong.\n\nI destroyed the platform. The monolith went dark. The hum stopped. I don't know what it would have done if I had arrived an hour later. I know it didn't do it.\n\nC builds systems and walks away. Somewhere they're already building the next one. This one is finished. On to the next.`,
    },
    encounter: {
      enemyType: 'daughters',
      waveSize: 3,
      dialogue: [
        "The letter said you might make it this far. It also said it wouldn't matter. Let's find out which of you was right.",
      ],
    },
    rewards: [
      { type: 'gold',          amount: 90  },
      { type: 'staminaPots',   amount: 2   },
      { type: 'fusionCrystals', amount: 2  },
      { type: 'xp',            amount: 190 },
    ],
  },
  {
    id: 'lc_old_nexus',
    locationId: 'old_nexus',
    locationName: 'The Old Nexus',
    name: 'The Weight of the Work',
    contractTier: 'blood',
    zone: 3,
    requiredContracts: ['lc_arcane_monolith'],
    desc: "After the monolith went dark, something moved. Not the order — something older. The Old Nexus was a convergence point before any of this began, and whatever was drawn here by C's work is still here, still waiting. The nexus has an occupant now. It has for a long time.",
    journalEntry: {
      title: 'The Convergence',
      location: 'The Old Nexus',
      zone: 3,
      text: `C's work drew it here. But it was already coming.\n\nThe nexus was a convergence point before any map was drawn — a place where old forces met and held. Whatever this entity is, it recognized the activation attempt as an invitation. It arrived before the monolith went dark.\n\nIt said C hadn't sent it. It said C had simply opened a door that was already there.\n\nAfter it fell, the nexus was quiet for the first time. Not the Daughters' quiet — the real kind. The kind that means nothing is waiting inside it anymore.\n\nI still don't know what C intended to do with that activation. I know they didn't need an ancient entity to do it. Whatever they were building, they were building it themselves.`,
    },
    encounter: {
      enemyType: 'elite',
      eliteId: 'e3',
      waveSize: 1,
      dialogue: "Your employer opened a door. They didn't know what was on the other side. Now you do.",
    },
    rewards: [
      { type: 'fusionCrystals', amount: 3   },
      { type: 'gold',           amount: 100 },
      { type: 'xp',             amount: 220 },
    ],
  },

  {
    id: 'mc_bryn_solveig',
    locationId: 'the_hollow',
    locationName: 'The Hollow',
    name: 'The Shield Does Not Break',
    contractTier: 'gold',
    mercyContract: true,
    zone: 3,
    requiredContracts: ['mc_maren_sunwen'],
    desc: "Two veteran fighters were last seen near The Hollow — a shield-captain from the Northern Reach and the skjaldmær who rode beside her. Both still standing. Neither aware the war they're fighting is already over.",
    encounter: {
      enemyType: 'cursed',
      members: [
        { img: '/cursed/warrior-lady.png', name: 'Bryn', hp: 245, gender: 'f', dialogue: "Hold the line. We hold the line." },
        { img: '/cursed/viking-woman.png', name: 'Solveig', hp: 225, gender: 'f', dialogue: "Forward. Always forward. That's all there is." },
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
    locationId: 'barrow_ruins',
    locationName: 'The Barrow Ruins',
    name: 'Second Crossing',
    contractTier: 'gold',
    mercyContract: true,
    zone: 3,
    requiredContracts: ['lc_stonehenge'],
    desc: "A survivor of the second expedition who walked back in, and the foreign prince who found her on the road. They reached the Old Nexus and stopped. Whatever they found here, they couldn't leave it.",
    encounter: {
      enemyType: 'cursed',
      members: [
        { img: '/cursed/young-lady.png', name: 'Maren', hp: 260, gender: 'f', dialogue: "I saw something. I had to come back. I had to see if it was real." },
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
        { img: '/cursed/viking-warrior.png', name: 'Jarl Sigrun', hp: 360, gender: 'f', dialogue: "Not their fight. Never was. But this one is mine." },
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
        { img: '/cursed/warrior-queen.png', name: 'Queen Sera', hp: 490, gender: 'f', dialogue: "My kingdom is ash. My name is ash. I have nothing left to lose." },
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

  // ── The Order — Mythril Contracts ─────────────────────────────────────────────
  {
    id: 'order_cutter',
    locationId: 'ironhold',
    locationName: 'The Ironhold',
    name: 'The Bandit Lord',
    contractTier: 'mythril',
    zone: 4,
    encounter: { enemyType: 'antagonist', antagonistId: 'cutter' },
    journalEntry: {
      title: 'Cutter',
      location: 'The Ironhold',
      zone: 4,
      text: `He was waiting. No ambush, no speech. Just standing in the middle of the room like a man who had done this before.

Cutter was the first piece C placed. The harbor, the ledger, the banner at the canopy — all of it ran through him. He didn't ask questions. He built what he was told to build and held what he was told to hold.

He's done now.`,
    },
    rewards: [
      { type: 'fusionCrystals', amount: 3  },
      { type: 'gold',           amount: 100 },
      { type: 'xp',             amount: 300 },
    ],
  },
  {
    id: 'order_mira',
    locationId: 'dusk_sanctum',
    locationName: 'The Dusk Sanctum',
    name: 'The Dusk Queen',
    contractTier: 'mythril',
    zone: 4,
    requiredContracts: ['order_cutter'],
    encounter: { enemyType: 'antagonist', antagonistId: 'mira' },
    journalEntry: {
      title: 'Mira',
      location: 'The Dusk Sanctum',
      zone: 4,
      text: `She knew everything before I walked in. The harbor. The crossing. Every name I've put down. She catalogued it like she was proud of me.

Mira built the ritual network — the relay in Whisper Forest, the circle at the grove. She wasn't following the order's instructions. She was extending them. She believed in whatever C is building.

Two leaders down. Whatever is above them hasn't moved yet.`,
    },
    rewards: [
      { type: 'fusionCrystals', amount: 3  },
      { type: 'gold',           amount: 100 },
      { type: 'xp',             amount: 300 },
    ],
  },
  {
    id: 'order_sylvaris',
    locationId: 'sunken_throne',
    locationName: 'The Sunken Throne',
    name: 'Queen of Ruin',
    contractTier: 'mythril',
    zone: 5,
    requiredContracts: ['order_mira'],
    encounter: { enemyType: 'antagonist', antagonistId: 'sylvaris' },
    journalEntry: {
      title: 'Sylvaris',
      location: 'The Sunken Throne',
      zone: 5,
      text: `She wasn't angry. That's what I remember. Just quiet, and then not quiet.

Sylvaris wasn't recruited by the order — she founded part of it. Whatever C is, Sylvaris was there at the beginning. She told me that before we started. I think she wanted me to understand the scale of what I was undoing.

One left.`,
    },
    rewards: [
      { type: 'fusionCrystals', amount: 5  },
      { type: 'gold',           amount: 150 },
      { type: 'xp',             amount: 500 },
    ],
  },
  {
    id: 'order_malachar',
    locationId: 'lich_vault',
    locationName: 'The Lich Vault',
    name: 'The Eternal Lich',
    contractTier: 'mythril',
    zone: 5,
    requiredContracts: ['order_sylvaris'],
    encounter: { enemyType: 'antagonist', antagonistId: 'malachar' },
    journalEntry: {
      title: 'Malachar',
      location: 'The Lich Vault',
      zone: 5,
      text: `He said he had died seventeen times. He was counting on eighteen.

Malachar is C. Or C answers to Malachar. I'm still not sure which. He built the order over decades, placing each piece across the region like a man who had all the time in the world — because he did.

It's done. Whatever the order was building, it ends here. I don't know if that's true. But he's gone. And for now, that's enough.`,
    },
    rewards: [
      { type: 'fusionCrystals', amount: 8  },
      { type: 'gold',           amount: 200 },
      { type: 'xp',             amount: 800 },
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
