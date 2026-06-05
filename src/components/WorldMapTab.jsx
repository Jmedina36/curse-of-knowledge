import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LOCATION_CONTRACTS } from '../data/locationContracts';

// Zone types:
//   'hunting'  — selectable hunting ground, drives encounter pool
//   'contract' — special contract location, not a hunting ground
//
// Positions are % of the FULL portrait map image.
// Day 1 (safe) at the bottom, Day 6+ (dire) near the top.

// Map regions (as % of full portrait image):
//   Sandy island (Day 1):      x 44-80%,  y 65-96%
//   Green island (Day 1-2):    x  6-38%,  y 60-82%
//   Central landmass (Day 2-4):x 14-82%,  y 30-57%
//   Top-left mass (Day 5-6):   x  6-38%,  y  6-28%
//   Top-right island (Day 6+): x 44-88%,  y  2-15%

const LOCATIONS = [
  // ── SANDY ISLAND — Level 1 safe (bottom-right) ────────────────────────────
  {
    id: 'outskirts',
    name: 'The Outskirts',
    subtitle: 'Village Edge',
    desc: 'The last stretch of land before the wilds swallow the road. Weak, but nothing out here is friendly.',
    marker: '/worldmap/wooden-house.png',
    type: 'hunting',
    tierWeights: { 1: 10, 2: 0, 3: 0 },
    unlockLevel: 3,
    position: { left: '56%', top: '80%' },
    danger: 1, dangerLabel: 'Tame', dangerColor: '#9CA3AF',
  },
  {
    id: 'fountain',
    name: 'Wellspring',
    subtitle: 'Ancient Fountain',
    desc: 'The fountain still flows, but the warden has gone quiet. Something is wrong with the spring.',
    marker: '/worldmap/fountain.png',
    type: 'contract',
    contractZone: 1,
    unlockLevel: 3,
    position: { left: '68%', top: '62%' },
    danger: 1, dangerLabel: 'Tame', dangerColor: '#9CA3AF',
    contract: 'The Warden\'s Request',
  },
  {
    id: 'harbor',
    name: 'Ghost Harbor',
    contractZone: 1,
    subtitle: 'Abandoned Port',
    desc: 'Ships rot at the docks. The crews didn\'t vanish — they were taken by the men who now run this harbor.',
    marker: '/worldmap/big-ship.png',
    type: 'contract',
    unlockLevel: 1,
    position: { left: '28%', top: '79%' },
    danger: 1, dangerLabel: 'Tame', dangerColor: '#9CA3AF',
    contract: 'Missing Crew',
  },

  {
    id: 'wardens_stone',
    name: "The Warden's Stone",
    subtitle: 'Forest Marker',
    desc: 'A weathered stone marker at the edge of the old forest. The inscription is worn beyond reading, but hunters say it marks where the grove\'s first warden stood watch.',
    marker: '/worldmap/rustic-stone.png',
    type: 'landmark',
    unlockLevel: 1,
    position: { left: '22%', top: '71%' },
    markerSize: 54,
    danger: 1, dangerLabel: 'Tame', dangerColor: '#9CA3AF',
  },
  {
    id: 'old_nexus',
    name: 'The Old Nexus',
    subtitle: 'Convergence Point',
    desc: 'A place where ley lines cross and old power pools. No one built it — it was always here. Hunters use it as a waypoint. Nothing lingers here long.',
    marker: '/worldmap/stone-crystal.png',
    type: 'landmark',
    unlockLevel: 3,
    position: { left: '28%', top: '31%' },
    markerSize: 54,
    danger: 2, dangerLabel: 'Moderate', dangerColor: '#CD7F32',
  },
  {
    id: 'ghost_fleet',
    name: 'The Ghost Fleet',
    subtitle: 'Sunken Wreck',
    desc: 'A ship that never made it out of the harbor. The crew of the Missing Crew contract were last seen boarding here. It sits half-submerged, listing toward the dark.',
    marker: '/worldmap/small-ship.png',
    type: 'landmark',
    unlockLevel: 1,
    position: { left: '34%', top: '84%' },
    markerSize: 54,
    danger: 1, dangerLabel: 'Tame', dangerColor: '#9CA3AF',
  },
  {
    id: 'cactus_flats',
    name: 'The Cactus Flats',
    subtitle: 'Sandy Landmark',
    desc: 'Two ancient cacti that have stood here longer than any map. Travelers use them to mark the far edge of the island before the wilds begin.',
    marker: '/worldmap/cactus-1.png',
    type: 'landmark',
    unlockLevel: 3,
    position: { left: '78%', top: '82%' },
    markerSize: 62,
    danger: 1, dangerLabel: 'Tame', dangerColor: '#9CA3AF',
  },

  // ── GREEN ISLAND — Level 1-3 (bottom-left) ────────────────────────────────
  {
    id: 'canopy_outpost',
    name: 'Canopy Outpost',
    contractZone: 1,
    subtitle: 'Scout Post',
    desc: 'A watchtower built into the oldest tree in the canopy. Raiders claimed it — no scouts have reported back since.',
    marker: '/worldmap/tree-house.png',
    type: 'contract',
    unlockLevel: 1,
    position: { left: '26%', top: '62%' },
    danger: 1, dangerLabel: 'Tame', dangerColor: '#9CA3AF',
    contract: 'Scouting Report',
  },
  {
    id: 'whisper_forest',
    name: 'Whisper Forest',
    subtitle: 'Ancient Woodland',
    desc: 'Ancient trees, dense enough to swallow sound. The things inside learned to use that.',
    marker: '/worldmap/tree.png',
    type: 'hunting',
    tierWeights: { 1: 5, 2: 5, 3: 0 },
    unlockLevel: 3,
    position: { left: '83%', top: '71%' },
    danger: 2, dangerLabel: 'Moderate', dangerColor: '#CD7F32',
  },
  {
    id: 'holy_tree',
    name: 'The Sacred Grove',
    contractZone: 1,
    subtitle: 'Holy Ground',
    desc: 'The sacred tree is darkening. Cultists have taken root in the grove and are draining it dry.',
    marker: '/worldmap/holy-tree.png',
    type: 'contract',
    unlockLevel: 1,
    position: { left: '43%', top: '67%' },
    danger: 2, dangerLabel: 'Moderate', dangerColor: '#CD7F32',
    contract: 'Protect the Grove',
  },
  {
    id: 'ivy_crossing',
    name: 'Ivy Crossing',
    contractZone: 2,
    subtitle: 'Overgrown Path',
    desc: 'The road is gone beneath the thornvine. Whatever is growing here has been at it for years and isn\'t done.',
    marker: '/worldmap/thorny-ivy.png',
    type: 'contract',
    unlockLevel: 3,
    position: { left: '66%', top: '93%' },
    danger: 2, dangerLabel: 'Moderate', dangerColor: '#CD7F32',
    contract: 'Clear the Road',
  },

  // ── CENTRAL LANDMASS — Level 3-5 ──────────────────────────────────────────
  {
    id: 'stone_bridge',
    name: 'The Old Crossing',
    contractZone: 2,
    subtitle: 'Ancient Bridge',
    desc: 'A bridge that outlasted the kingdom that built it. The river below has something old and patient living in it.',
    marker: '/worldmap/rock-bridge.png',
    type: 'contract',
    unlockLevel: 3,
    position: { left: '58%', top: '55%' },
    danger: 2, dangerLabel: 'Moderate', dangerColor: '#CD7F32',
    contract: 'Toll of the Deep',
  },
  {
    id: 'treasure_vault',
    name: 'The Vault',
    contractZone: 4,
    subtitle: 'Hidden Cache',
    desc: 'A vault sealed by someone who never returned for it. The guardians they posted are still at their post.',
    marker: '/worldmap/treasure-chest.png',
    type: 'contract',
    unlockLevel: 8,
    position: { left: '38%', top: '24%' },
    danger: 4, dangerLabel: 'Dire', dangerColor: '#7C3AED',
    contract: 'The Lost Cache',
  },
  {
    id: 'barrow_ruins',
    name: 'Barrow Ruins',
    subtitle: 'Forgotten Battleground',
    desc: 'Old battlefield, old bones. Predators have made a home of it — they feed well here.',
    marker: '/worldmap/old-swords.png',
    type: 'hunting',
    tierWeights: { 1: 2, 2: 6, 3: 2 },
    unlockLevel: 5,
    position: { left: '48%', top: '47%' },
    danger: 3, dangerLabel: 'Dangerous', dangerColor: '#DC2626',
  },
  {
    id: 'old_tree',
    name: 'The Hollow',
    contractZone: 3,
    subtitle: 'Dead Landmark',
    desc: 'Hunters used this dead giant as a waypoint for a century. Nobody stops there anymore.',
    marker: '/worldmap/old-tree.png',
    type: 'contract',
    unlockLevel: 5,
    position: { left: '82%', top: '50%' },
    danger: 3, dangerLabel: 'Dangerous', dangerColor: '#DC2626',
    contract: 'Extermination Order',
  },
  {
    id: 'runic_circle',
    name: 'Runic Circle',
    contractZone: 3,
    subtitle: 'Arcane Site',
    desc: 'Runes cut into bedrock that pulse without heat or wind. The ritual is still running — no one knows what it\'s building toward.',
    marker: '/worldmap/runic-stone.png',
    type: 'contract',
    unlockLevel: 5,
    position: { left: '14%', top: '50%' },
    danger: 3, dangerLabel: 'Dangerous', dangerColor: '#DC2626',
    contract: 'Silence the Stones',
  },
  {
    id: 'stonehenge_wilds',
    name: 'Stonehenge Wilds',
    subtitle: 'Ancient Circle',
    desc: 'An ancient circle of standing stones. The power that gathered here never left — and neither do the creatures drawn to it.',
    marker: '/worldmap/stonehenge.png',
    type: 'hunting',
    tierWeights: { 1: 1, 2: 4, 3: 5 },
    unlockLevel: 5,
    position: { left: '30%', top: '44%' },
    danger: 3, dangerLabel: 'Dangerous', dangerColor: '#DC2626',
  },
  {
    id: 'magic_stone',
    name: 'The Arcane Monolith',
    contractZone: 3,
    subtitle: 'Power Node',
    desc: 'The monolith radiates something unnamed. The creatures that gather around it are not what they were before.',
    marker: '/worldmap/magic-stone.png',
    type: 'contract',
    unlockLevel: 5,
    position: { left: '50%', top: '34%' },
    danger: 3, dangerLabel: 'Dangerous', dangerColor: '#DC2626',
    contract: 'Shatter the Node',
  },
  {
    id: 'column_ruins',
    name: 'The Pillars',
    contractZone: 3,
    subtitle: 'Fallen Temple',
    desc: 'A god\'s temple, now rubble and pillars. The god it honored hasn\'t gone anywhere.',
    marker: '/worldmap/column.png',
    type: 'contract',
    unlockLevel: 5,
    position: { left: '62%', top: '28%' },
    danger: 3, dangerLabel: 'Dangerous', dangerColor: '#DC2626',
    contract: 'Temple Cleansing',
  },
  {
    id: 'dungeon',
    name: 'Dungeon of the Fallen',
    subtitle: 'Elite Territory',
    desc: 'Ruins above, dungeon below. Elite hunters go in. Not all come out. Enter when the contract calls for it.',
    marker: '/worldmap/dungeon.png',
    type: 'contract',
    unlockLevel: 5,
    isElite: true,
    position: { left: '74%', top: '42%' },
    danger: 5, dangerLabel: 'Elite', dangerColor: '#A855F7',
    contract: 'Blood Contract',
  },

  // ── TOP-LEFT MASS — Level 8+ dire ─────────────────────────────────────────
  {
    id: 'stoneback_cave',
    name: 'Stoneback Cavern',
    subtitle: 'The Deep Dark',
    desc: 'A cave system that goes deeper than anyone has mapped. No light reaches the bottom — only dire things live down there.',
    marker: '/worldmap/cave.png',
    type: 'hunting',
    tierWeights: { 1: 0, 2: 2, 3: 8 },
    unlockLevel: 8,
    position: { left: '16%', top: '24%' },
    danger: 4, dangerLabel: 'Dire', dangerColor: '#7C3AED',
  },
  {
    id: 'precipice',
    name: 'The Precipice',
    contractZone: 4,
    subtitle: 'Sheer Cliff Face',
    desc: 'The edge of the mapped world. Beyond the cliff face is uncharted dark — and something that doesn\'t want you at the edge.',
    marker: '/worldmap/cliff.png',
    type: 'contract',
    unlockLevel: 8,
    position: { left: '22%', top: '14%' },
    danger: 4, dangerLabel: 'Dire', dangerColor: '#7C3AED',
    contract: 'Edge of the World',
  },
  {
    id: 'dry_tree',
    name: 'The Withered Wood',
    contractZone: 3,
    subtitle: 'Ashen Forest',
    desc: 'A forest that burned from the inside out and never recovered. The dead trees move when you aren\'t looking directly at them.',
    marker: '/worldmap/dry-tree.png',
    type: 'contract',
    unlockLevel: 5,
    position: { left: '36%', top: '53%' },
    danger: 3, dangerLabel: 'Dangerous', dangerColor: '#DC2626',
    contract: 'The Restless Dead',
  },
  {
    id: 'crystal_stones',
    name: 'Crystal Wastes',
    contractZone: 4,
    subtitle: 'Corrupted Ground',
    desc: 'Crystals that grew from poisoned ground. They spread into everything — stone, soil, bone. Nothing that feeds on them stays what it was.',
    marker: '/worldmap/crystal-stones.png',
    type: 'contract',
    unlockLevel: 8,
    position: { left: '20%', top: '5%' },
    danger: 4, dangerLabel: 'Dire', dangerColor: '#7C3AED',
    contract: 'Purge the Corruption',
  },

  // ── TOP-RIGHT ISLAND — Level 8+ dire / Legendary ──────────────────────────
  {
    id: 'lava_wastes',
    name: 'Lava Wastes',
    subtitle: 'Scorched Earth',
    desc: 'Scorched earth and boiling stone as far as you can see. What lives here was built for one purpose.',
    marker: '/worldmap/lava-lake.png',
    type: 'hunting',
    tierWeights: { 1: 0, 2: 0, 3: 10 },
    unlockLevel: 10,
    position: { left: '58%', top: '14%' },
    danger: 4, dangerLabel: 'Dire', dangerColor: '#7C3AED',
  },
  {
    id: 'crystal_lava',
    name: 'The Melt',
    contractZone: 5,
    subtitle: 'Crystallized Hellscape',
    desc: 'Lava fused with corruption crystal into something that shouldn\'t exist. What survives here didn\'t survive as anything natural.',
    marker: '/worldmap/crystal-lava.png',
    type: 'contract',
    unlockLevel: 10,
    position: { left: '50%', top: '5%' },
    danger: 4, dangerLabel: 'Dire', dangerColor: '#7C3AED',
    contract: 'Into the Melt',
  },
  {
    id: 'crystal_column',
    name: 'Void Spire',
    contractZone: 5,
    subtitle: 'Dimensional Fracture',
    desc: 'A crystal spire that appeared where nothing should grow. The space around it behaves differently — distances are wrong, sounds arrive late.',
    marker: '/worldmap/crystal-column.png',
    type: 'contract',
    unlockLevel: 10,
    position: { left: '76%', top: '19%' },
    danger: 4, dangerLabel: 'Dire', dangerColor: '#7C3AED',
    contract: 'Seal the Fracture',
  },
  {
    id: 'skull_cave',
    name: 'Skull Cavern',
    subtitle: 'Legendary Darkness',
    desc: 'The last point on the map. No record of what\'s inside. The few who came back couldn\'t describe it — or wouldn\'t.',
    marker: '/worldmap/skull-cave.png',
    type: 'contract',
    unlockLevel: 10,
    isLegendary: true,
    position: { left: '82%', top: '4%' },
    markerSize: 132,
    danger: 5, dangerLabel: 'Legendary', dangerColor: '#F59E0B',
    contract: 'The Black Contract',
  },
];

// Non-interactive decorative assets — anchored near confirmed location markers.
// Keep size <= 42px so they stay visually subordinate to location markers (76px+).
//
// Confirmed land anchors used for placement:
//   Sandy island:   outskirts(56,80) fountain(62,67) whisper_forest(72,77) ivy_crossing(72,88)
//   Green island:   harbor(28,79) canopy_outpost(22,63) holy_tree(38,67)
//   Central:        runic_circle(20,46) stonehenge(36,38) barrow_ruins(48,47)
//                   treasure_vault(36,53) stone_bridge(58,55) magic_stone(50,34)
//                   old_tree(72,44) column_ruins(62,40) dungeon(74,36)
//   Top-left:       crystal_stones(20,10) stoneback_cave(22,18) precipice(10,24) dry_tree(34,27)
//   Top-right:      crystal_lava(50,5) lava_wastes(58,14) crystal_column(70,7) skull_cave(82,4)
const DECORATIONS = [
  // zone = geographic zone for wild encounter scaling and lock gating
  {
    src: '/worldmap/tree-2.png',              pos: { left: '14%', top: '67%' }, size: 48, zone: 1,
    name: 'The Gnarled Oak',
    desc: 'A twisted old tree at the edge of the island trail. Travelers mark it as the last safe waypoint before the wilds begin.',
  },
  {
    src: '/worldmap/dry-wood-1.png',          pos: { left: '32%', top: '66%' }, size: 42, zone: 1,
    name: 'Fallen Timber',
    desc: 'A massive trunk brought down long ago. Something hollowed it out from the inside.',
  },
  {
    src: '/worldmap/stone-arch.png',          pos: { left: '54%', top: '42%' }, size: 44, zone: 3,
    name: 'The Broken Arch',
    desc: "The remains of a structure no one can date. Half of it collapsed inward. The other half should have followed, but hasn't.",
  },
  {
    src: '/worldmap/rock-2.png',              pos: { left: '88%', top: '42%' }, size: 38, zone: 3,
    name: 'The Outcrop',
    desc: 'A jagged shelf of rock jutting out from the eastern ridge. Things nest in the crevices below.',
  },
  {
    src: '/worldmap/rock-column.png',         pos: { left: '34%', top: '37%' }, size: 42, zone: 3,
    name: 'The Standing Stone',
    desc: 'A single column of rock, too regular to be natural. No inscription. No origin. It simply stands.',
  },
  {
    src: '/worldmap/rocks-1.png',             pos: { left: '32%', top: '2%'  }, size: 40, zone: 4,
    name: 'The Scree',
    desc: 'A loose field of shattered rock from a collapse long past. Crossing it announces your presence to anything nearby.',
  },
  {
    src: '/worldmap/rock-1.png',              pos: { left: '68%', top: '80%' }, size: 38, zone: 2,
    name: 'Coastal Boulder',
    desc: "A lone boulder at the island's edge, worn smooth by wind and salt. Something carved marks into the base.",
  },
  {
    src: '/worldmap/sharp-rocks-1.png',       pos: { left: '8%',  top: '18%' }, size: 42, zone: 4,
    name: 'The Jagged Spire',
    desc: 'A cluster of upthrust rock that tears at anything passing too close. The ground around it is stained dark.',
  },
  {
    src: '/worldmap/red-rocks.png',           pos: { left: '30%', top: '20%' }, size: 40, zone: 4,
    name: 'The Crimson Shelf',
    desc: 'Iron-rich stone that bleeds red in the light. The color is natural. The smell is not.',
  },
  {
    src: '/worldmap/dry-wood-2.png',          pos: { left: '42%', top: '75%' }, size: 42, zone: 1,
    name: 'The Dry Thicket',
    desc: 'A cluster of dead brush that refuses to rot. The wood is bone-white and snaps at a touch.',
  },
  {
    src: '/worldmap/lava.png',                pos: { left: '74%', top: '13%' }, size: 42, zone: 5,
    name: 'Lava Vent',
    desc: 'A fissure in the earth venting heat from below. The ground around it shifts. Slowly. Then stops.',
  },
  {
    src: '/worldmap/old-lava.png',            pos: { left: '88%', top: '16%' }, size: 40, zone: 5,
    name: 'The Cooled Flow',
    desc: 'Hardened lava from an eruption old enough that no one recorded it. The surface still radiates heat at night.',
  },
  {
    src: '/worldmap/lava-pit.png',            pos: { left: '36%', top: '9%'  }, size: 38, zone: 4,
    name: 'The Ember Pit',
    desc: 'A shallow depression filled with glowing coals that never fully die. No fire burns here. It simply remains.',
  },
  {
    src: '/worldmap/green-crystal-stone.png', pos: { left: '68%', top: '70%' }, size: 58, zone: 2,
    name: 'Crystal Formation',
    desc: 'A growth of pale green crystal pushing through the sand. It hums faintly at dusk. No one knows why.',
  },
];

const WILD_ENCOUNTERS = {
  1: [
    { name: 'Stray Wolf',    desc: "A mangy predator lurking the outer trails. It has been watching you.",       img: '/bandits/bandit-1.png' },
    { name: 'Marsh Creeper', desc: "Something slow and patient. It has been following you since the tree line.", img: '/bandits/bandit-2.png' },
  ],
  2: [
    { name: 'Road Marauder', desc: "Armed and looking for easy prey. You fit the description.",                  img: '/bandits/bandit-3.png' },
    { name: 'Feral Tracker', desc: "Hunts by scent through the undergrowth. It found you first.",               img: '/bandits/bandit-4.png' },
  ],
  3: [
    { name: 'Hollow Beast',  desc: "Something twisted and wrong. It doesn't belong to the natural world.",      img: '/bandits/bandit-5.png' },
    { name: 'Wilds Prowler', desc: "Patient. Dangerous. It has been circling you for some time.",               img: '/bandits/bandit-6.png' },
  ],
  4: [
    { name: 'Stone Wraith',  desc: "An ancient spirit bound to the crags. Your presence disturbed it.",         img: '/bandits/bandit-7.png' },
    { name: 'Blightcrawler', desc: "Corrupted and hostile to everything living. It will not stop.",             img: '/bandits/captain-1.png' },
  ],
  5: [
    { name: 'Lava Spawn',    desc: "Born from the fractures below. It hunts by heat signature.",                img: '/bandits/captain-2.png' },
    { name: 'Void Stalker',  desc: "It shouldn't exist here. Yet here it is, and it has noticed you.",         img: '/bandits/captain-3.png' },
  ],
};

// Minimum player level required per zone
const ZONE_MIN_LEVEL = { 1: 1, 2: 3, 3: 5, 4: 8, 5: 10 };

const TIER_META = {
  1: { label: 'Grunt',    color: '#A8A8A8' },
  2: { label: 'Predator', color: '#CD7F32' },
  3: { label: 'Dire',     color: '#DC2626' },
};

const WorldMapTab = ({
  currentDay, level, selectedZone, setSelectedZone,
  activeContract, setActiveContract,
  onBeginContract, onStartPomodoro, onEliteBoss, onFinalBoss,
  isDayActive, eliteBossDefeatedToday, gauntletUnlocked, tasks,
  completedLocationContracts, onWildEncounter,
}) => {
  const [activeLocation, setActiveLocation] = useState(null);
  const [activeDecos, setActiveDecos] = useState([]);
  const [decoPopup, setDecoPopup] = useState(null); // { decoIdx, monster, zone }
  const [selectedDeco, setSelectedDeco] = useState(null); // index of selected decoration
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  // Returns true if a deco's zone is accessible (level + contract completion gate)
  const isDecoZoneUnlocked = (decoZone) => {
    if ((level ?? 1) < (ZONE_MIN_LEVEL[decoZone] ?? 1)) return false;
    if (decoZone <= 1) return true;
    const prevZoneContracts = LOCATION_CONTRACTS.filter(c => c.zone === decoZone - 1);
    return prevZoneContracts.length === 0 ||
      prevZoneContracts.every(c => completedLocationContracts?.includes(c.id));
  };

  // Activate a random unlocked decoration every 2 minutes (max 3 active at once)
  useEffect(() => {
    if (!isDayActive) return;
    const activate = () => {
      // Compute unlocked indices here (not inside setState) so closure uses fresh values
      const unlockedIndices = DECORATIONS
        .map((d, i) => ({ d, i }))
        .filter(({ d }) => {
          if ((level ?? 1) < (ZONE_MIN_LEVEL[d.zone] ?? 1)) return false;
          if (d.zone <= 1) return true;
          const prev = LOCATION_CONTRACTS.filter(c => c.zone === d.zone - 1);
          return prev.length === 0 || prev.every(c => completedLocationContracts?.includes(c.id));
        })
        .map(({ i }) => i);
      setActiveDecos(prev => {
        if (prev.length >= 3) return prev;
        const available = unlockedIndices.filter(i => !prev.includes(i));
        if (available.length === 0) return prev;
        const idx = available[Math.floor(Math.random() * available.length)];
        return [...prev, idx];
      });
    };
    const t = setTimeout(activate, 15 * 1000); // first after 15s
    const iv = setInterval(activate, 2 * 60 * 1000);
    return () => { clearTimeout(t); clearInterval(iv); };
  }, [isDayActive, level, completedLocationContracts]);

  // Auto-select a random available location when a task contract is accepted
  useEffect(() => {
    if (activeContract?.type !== 'task') return;
    const available = LOCATIONS.filter(l =>
      !l.isElite && !l.isLegendary &&
      (level ?? 1) >= (l.unlockLevel ?? 1)
    );
    if (available.length > 0) {
      setSelectedZone(available[Math.floor(Math.random() * available.length)]);
    }
  }, [activeContract?.type === 'task' ? activeContract.task?.id : null]);

  const isZoneContractUnlocked = (loc) => {
    if (loc.type !== 'contract' || !loc.contractZone || loc.contractZone <= 1) return true;
    const prevZoneContracts = LOCATION_CONTRACTS.filter(c => c.zone === loc.contractZone - 1);
    return prevZoneContracts.length === 0 ||
      prevZoneContracts.every(c => completedLocationContracts?.includes(c.id));
  };

  const isUnlocked = (loc) => {
    if (loc.unlockLevel !== null && (level ?? 1) < loc.unlockLevel) return false;
    return isZoneContractUnlocked(loc);
  };

  const displayed = activeLocation
    ? LOCATIONS.find(l => l.id === activeLocation)
    : selectedZone
      ? LOCATIONS.find(l => l.id === selectedZone.id)
      : null;

  return (
    <div style={{ maxWidth: '980px', margin: '0 auto', paddingBottom: '40px' }}>
      {/* Header */}
      <div className="text-center mb-5">
        <p style={{ fontSize: '0.6rem', color: 'rgba(212,175,55,0.4)', letterSpacing: '0.35em', textTransform: 'uppercase', marginBottom: '6px' }}>World of</p>
        <h2 style={{
          fontFamily: "'Cinzel', serif", fontSize: 'clamp(1.4rem, 3vw, 2rem)',
          letterSpacing: '0.25em', color: '#D4AF37', textTransform: 'uppercase',
          textShadow: '0 0 30px rgba(212,175,55,0.3)',
        }}>Ararlul</h2>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginTop: '6px' }}>
          <div style={{ width: '40px', height: '1px', background: 'linear-gradient(to right, transparent, rgba(212,175,55,0.4))' }} />
          <p style={{ fontSize: '0.6rem', color: 'rgba(180,165,150,0.4)', letterSpacing: '0.25em', textTransform: 'uppercase' }}>
            {LOCATIONS.filter(l => l.type === 'hunting').length} Hunting Grounds · {LOCATIONS.filter(l => l.type === 'contract').length} Contract Locations
          </p>
          <div style={{ width: '40px', height: '1px', background: 'linear-gradient(to left, transparent, rgba(212,175,55,0.4))' }} />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>

        {/* Scrollable map */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            ref={scrollRef}
            style={{
              height: '560px',
              overflowY: 'scroll',
              borderRadius: '8px',
              border: '1px solid rgba(212,175,55,0.18)',
              boxShadow: '0 0 40px rgba(0,0,0,0.6)',
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(212,175,55,0.2) rgba(0,0,0,0.3)',
            }}
          >
            <div style={{ position: 'relative', width: '100%' }}>
              <img src="/worldmap/terrain.png" alt="Ararlul" style={{ width: '100%', display: 'block' }} />

              {/* Overlay */}
              <div style={{
                position: 'absolute', inset: 0, pointerEvents: 'none',
                background: 'linear-gradient(to bottom, rgba(0,0,0,0.28) 0%, rgba(0,0,0,0.04) 25%, rgba(0,0,0,0.04) 75%, rgba(0,0,0,0.18) 100%)',
              }} />

              {/* Decorative assets — terrain-matched, occasionally active for wild encounters */}
              {DECORATIONS.map((d, i) => {
                const isLocked = !isDecoZoneUnlocked(d.zone);
                const hasCreature = !isLocked && isDayActive && activeDecos.includes(i);
                const isWild = hasCreature && !activeContract;
                const pool = WILD_ENCOUNTERS[d.zone] || WILD_ENCOUNTERS[1];
                return (
                  <motion.div
                    key={`deco-${i}`}
                    style={{
                      position: 'absolute',
                      left: d.pos.left,
                      top: d.pos.top,
                      transform: 'translate(-50%, -50%)',
                      pointerEvents: 'auto',
                      zIndex: hasCreature ? 8 : selectedDeco === i ? 6 : 3,
                      cursor: 'pointer',
                    }}
                    onClick={() => {
                      if (isWild) {
                        const monster = pool[Math.floor(Math.random() * pool.length)];
                        setDecoPopup({ decoIdx: i, monster, zone: d.zone, location: d.name });
                        setActiveDecos(prev => prev.filter(idx => idx !== i));
                      } else {
                        setSelectedDeco(i);
                        setActiveLocation(null);
                      }
                    }}
                  >
                    {hasCreature && (
                      <motion.div
                        animate={{ opacity: [0.4, 1, 0.4], scale: [0.8, 1.2, 0.8] }}
                        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                        style={{
                          position: 'absolute', inset: '-10px',
                          borderRadius: '50%',
                          background: 'radial-gradient(circle, rgba(220,40,40,0.35) 0%, transparent 70%)',
                          boxShadow: '0 0 18px rgba(220,40,40,0.7)',
                          pointerEvents: 'none',
                        }}
                      />
                    )}
                    <img
                      src={d.src}
                      alt=""
                      style={{
                        width: `${d.size}px`,
                        height: `${d.size}px`,
                        objectFit: 'contain',
                        display: 'block',
                        filter: hasCreature
                          ? 'drop-shadow(0 0 8px rgba(220,40,40,0.9)) brightness(1.15)'
                          : isLocked
                            ? 'grayscale(1) brightness(0.3)'
                            : 'drop-shadow(0 2px 4px rgba(0,0,0,0.75))',
                        opacity: 0.8,
                        transition: 'filter 0.3s',
                      }}
                    />
                    {/* Lock overlay */}
                    {isLocked && (
                      <div style={{
                        position: 'absolute', inset: 0,
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center',
                        pointerEvents: 'none',
                      }}>
                        <div style={{
                          background: 'rgba(0,0,0,0.72)',
                          borderRadius: '6px',
                          padding: '2px 5px',
                          display: 'flex', flexDirection: 'column',
                          alignItems: 'center', gap: '1px',
                        }}>
                          <span style={{ fontSize: '13px', lineHeight: 1 }}>🔒</span>
                          <span style={{ fontSize: '6px', color: '#9CA3AF', fontWeight: 700, letterSpacing: '0.05em', lineHeight: 1 }}>
                            Lv {ZONE_MIN_LEVEL[d.zone]}
                          </span>
                        </div>
                      </div>
                    )}
                    {/* Selected ring */}
                    {selectedDeco === i && !isWild && (
                      <div style={{
                        position: 'absolute', inset: '-8px',
                        borderRadius: '50%',
                        border: '1px solid rgba(180,150,90,0.5)',
                        pointerEvents: 'none',
                      }} />
                    )}
                  </motion.div>
                );
              })}

              {/* All location markers */}
              {LOCATIONS.map(loc => {
                const unlocked = isUnlocked(loc);
                const isHunting = loc.type === 'hunting';
                const isActive = activeLocation === loc.id || selectedZone?.id === loc.id;

                // Glow when this location has an accepted active contract
                const isTaskEligible = !loc.isElite && !loc.isLegendary && unlocked;
                const hasActiveContract =
                  (isTaskEligible && activeContract?.type === 'task' && selectedZone?.id === loc.id) ||
                  (loc.id === 'dungeon' && activeContract?.type === 'elite') ||
                  (loc.id === 'skull_cave' && activeContract?.type === 'final') ||
                  (activeContract?.type === 'location' && activeContract.contract.locationId === loc.id);

                // Selected zone with active task contract pulses a different color
                const isActiveHuntZone = selectedZone?.id === loc.id && activeContract?.type === 'task';
                const pulseColor = isActiveHuntZone ? loc.dangerColor : '#D4AF37';

                return (
                  <motion.div
                    key={loc.id}
                    style={{
                      position: 'absolute',
                      left: loc.position.left,
                      top: loc.position.top,
                      x: '-50%',
                      y: '-50%',
                      cursor: 'pointer',
                      zIndex: hasActiveContract ? 15 : isActive ? 10 : 5,
                    }}
                    whileHover={{ scale: 1.15 }}
                    onClick={() => {
                      setActiveLocation(loc.id);
                      setSelectedDeco(null);
                      if (unlocked && !loc.isElite && !loc.isLegendary && activeContract?.type !== 'task') setSelectedZone(loc);
                    }}
                  >
                    {/* Contract pulse ring */}
                    {hasActiveContract && (
                      <motion.div
                        animate={{ opacity: [0.5, 1, 0.5], scale: [0.85, 1.15, 0.85] }}
                        transition={{ duration: isActiveHuntZone ? 1.2 : 1.8, repeat: Infinity, ease: 'easeInOut' }}
                        style={{
                          position: 'absolute', inset: isActiveHuntZone ? '-16px' : '-14px',
                          borderRadius: '50%',
                          border: `2px solid ${pulseColor}`,
                          boxShadow: `0 0 ${isActiveHuntZone ? 24 : 16}px ${pulseColor}99`,
                          pointerEvents: 'none',
                        }}
                      />
                    )}

                    {/* Active ring */}
                    {isActive && !hasActiveContract && (
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        style={{
                          position: 'absolute', inset: '-10px',
                          borderRadius: '50%',
                          border: `2px solid ${loc.dangerColor}`,
                          boxShadow: `0 0 14px ${loc.dangerColor}88`,
                        }}
                      />
                    )}

                    <img
                      src={loc.marker}
                      alt={loc.name}
                      style={{
                        width: `${loc.markerSize || 76}px`, height: `${loc.markerSize || 76}px`,
                        objectFit: 'contain',
                        filter: unlocked
                          ? isActive
                            ? `drop-shadow(0 0 10px ${loc.dangerColor}) brightness(1.1)`
                            : 'drop-shadow(0 2px 6px rgba(0,0,0,0.95))'
                          : 'grayscale(1) brightness(0.3)',
                        transition: 'filter 0.2s',
                      }}
                    />

                    {/* Type indicator dot */}
                    <div style={{
                      position: 'absolute', bottom: '-2px', right: '-2px',
                      width: '8px', height: '8px',
                      borderRadius: '50%',
                      background: isHunting ? loc.dangerColor : loc.type === 'landmark' ? 'rgba(180,160,140,0.4)' : 'rgba(212,175,55,0.85)',
                      border: '1px solid rgba(0,0,0,0.6)',
                      boxShadow: `0 0 4px ${isHunting ? loc.dangerColor : loc.type === 'landmark' ? 'rgba(180,160,140,0.4)' : '#D4AF37'}`,
                    }} />

                    {/* Lock overlay */}
                    {!unlocked && (
                      <div style={{
                        position: 'absolute', inset: 0,
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center',
                        pointerEvents: 'none',
                      }}>
                        <div style={{
                          background: 'rgba(0,0,0,0.72)',
                          borderRadius: '6px',
                          padding: '2px 5px',
                          display: 'flex', flexDirection: 'column',
                          alignItems: 'center', gap: '1px',
                        }}>
                          <span style={{ fontSize: '13px', lineHeight: 1 }}>🔒</span>
                          <span style={{ fontSize: '6px', color: '#9CA3AF', fontWeight: 700, letterSpacing: '0.05em', lineHeight: 1 }}>
                            Lv {loc.unlockLevel}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Name label */}
                    <div style={{
                      position: 'absolute',
                      top: '100%', left: '50%',
                      transform: 'translateX(-50%)',
                      marginTop: '3px',
                      whiteSpace: 'nowrap',
                      pointerEvents: 'none',
                    }}>
                      <div style={{
                        fontSize: '0.5rem', fontWeight: 700,
                        color: isActive ? loc.dangerColor : 'rgba(235,220,200,0.8)',
                        textShadow: '0 1px 4px rgba(0,0,0,1), 0 0 8px rgba(0,0,0,0.9)',
                        background: 'rgba(0,0,0,0.5)',
                        padding: '1px 4px', borderRadius: '2px',
                        letterSpacing: '0.05em',
                      }}>
                        {loc.name}
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {/* Cardinal directions */}
              <img src="/worldmap/cardinal.png" alt="" style={{
                position: 'absolute', bottom: '14px', right: '14px',
                width: '52px', height: '52px', objectFit: 'contain',
                opacity: 0.45, pointerEvents: 'none',
              }} />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#DC2626', boxShadow: '0 0 4px #DC2626' }} />
              <span style={{ fontSize: '0.5rem', color: 'rgba(180,160,140,0.4)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Hunting Ground</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#D4AF37', boxShadow: '0 0 4px #D4AF37' }} />
              <span style={{ fontSize: '0.5rem', color: 'rgba(180,160,140,0.4)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Contract Location</span>
            </div>
            <span style={{ fontSize: '0.5rem', color: 'rgba(180,160,140,0.3)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>· scroll to explore · day 1 at bottom ·</span>
          </div>
        </div>

        {/* Wild encounter popup */}
        <AnimatePresence>
          {decoPopup && (
            <motion.div
              key="wild-popup"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              style={{
                position: 'absolute', inset: 0, zIndex: 50,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(0,0,0,0.65)',
              }}
            >
              <div style={{
                background: 'linear-gradient(160deg,rgba(35,20,15,0.97),rgba(20,10,8,0.97))',
                border: '1px solid rgba(220,40,40,0.5)',
                boxShadow: '0 0 40px rgba(220,40,40,0.25)',
                borderRadius: '6px',
                padding: '20px',
                width: '220px',
                textAlign: 'center',
              }}>
                {/* Monster portrait */}
                <div style={{
                  width: '80px', height: '80px', margin: '0 auto 12px',
                  borderRadius: '50%',
                  border: '2px solid rgba(220,40,40,0.6)',
                  boxShadow: '0 0 20px rgba(220,40,40,0.3)',
                  overflow: 'hidden',
                  background: 'rgba(0,0,0,0.4)',
                }}>
                  <img src={decoPopup.monster.img} alt={decoPopup.monster.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>

                {/* Location name + zone badge */}
                <div style={{ marginBottom: '10px' }}>
                  <p style={{
                    fontFamily: 'Cinzel,serif', fontSize: '0.72rem', fontWeight: 600,
                    color: 'rgba(200,180,140,0.9)', letterSpacing: '0.08em', marginBottom: '3px',
                  }}>{decoPopup.location}</p>
                  <div style={{
                    fontSize: '0.58rem', letterSpacing: '0.2em', textTransform: 'uppercase',
                    color: 'rgba(220,80,80,0.7)',
                  }}>Wild Encounter · Zone {decoPopup.zone}</div>
                </div>

                {/* Monster name */}
                <p style={{
                  fontFamily: 'Cinzel,serif', fontSize: '1rem', fontWeight: 700,
                  color: '#F5F0E0', marginBottom: '8px', letterSpacing: '0.05em',
                }}>{decoPopup.monster.name}</p>

                {/* Monster description */}
                <p style={{
                  fontSize: '0.7rem', color: 'rgba(180,160,130,0.75)',
                  lineHeight: 1.55, fontStyle: 'italic', marginBottom: '16px',
                }}>{decoPopup.monster.desc}</p>

                {/* Buttons */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => {
                      onWildEncounter({ monster: decoPopup.monster, zone: decoPopup.zone });
                      setDecoPopup(null);
                    }}
                    style={{
                      flex: 1, fontFamily: 'Cinzel,serif', fontSize: '0.75rem',
                      letterSpacing: '0.12em', padding: '7px 10px', borderRadius: '3px',
                      background: 'rgba(160,30,30,0.7)',
                      border: '1px solid rgba(220,60,60,0.6)',
                      color: 'rgba(255,180,180,0.95)', cursor: 'pointer',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(200,40,40,0.85)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(160,30,30,0.7)'}
                  >Fight</button>
                  <button
                    onClick={() => setDecoPopup(null)}
                    style={{
                      flex: 1, fontFamily: 'Cinzel,serif', fontSize: '0.75rem',
                      letterSpacing: '0.12em', padding: '7px 10px', borderRadius: '3px',
                      background: 'rgba(30,20,15,0.7)',
                      border: '1px solid rgba(120,100,80,0.35)',
                      color: 'rgba(160,140,110,0.7)', cursor: 'pointer',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(50,35,25,0.85)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(30,20,15,0.7)'}
                  >Ignore</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info panel */}
        <div style={{ width: '215px', flexShrink: 0 }}>
          <AnimatePresence mode="wait">
            {selectedDeco !== null && DECORATIONS[selectedDeco] ? (() => {
              const d = DECORATIONS[selectedDeco];
              const isActive = activeDecos.includes(selectedDeco);
              const zoneUnlocked = isDecoZoneUnlocked(d.zone);
              return (
                <motion.div
                  key={`deco-info-${selectedDeco}`}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  transition={{ duration: 0.18 }}
                  style={{
                    background: 'linear-gradient(to bottom, rgba(22,10,6,0.98), rgba(10,4,2,0.98))',
                    border: '1px solid rgba(180,150,90,0.2)',
                    borderRadius: '8px',
                    padding: '14px',
                  }}
                >
                  {/* Type pill */}
                  <div style={{ marginBottom: '10px' }}>
                    <div style={{
                      display: 'inline-block',
                      fontSize: '0.48rem', fontWeight: 700,
                      letterSpacing: '0.14em', textTransform: 'uppercase',
                      color: isActive ? 'rgba(220,80,80,0.9)' : 'rgba(180,160,140,0.5)',
                      background: isActive ? 'rgba(220,40,40,0.1)' : 'rgba(180,160,140,0.06)',
                      border: `1px solid ${isActive ? 'rgba(220,80,80,0.3)' : 'rgba(180,160,140,0.15)'}`,
                      padding: '2px 6px', borderRadius: '3px',
                    }}>
                      {isActive ? 'Creature Nearby' : `Zone ${d.zone} Terrain`}
                    </div>
                  </div>

                  {/* Name */}
                  <div style={{ marginBottom: '10px' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#F5F5DC', letterSpacing: '0.07em', lineHeight: 1.2 }}>
                      {d.name}
                    </div>
                  </div>

                  {/* Divider */}
                  <div style={{ height: '1px', background: 'rgba(180,150,90,0.12)', marginBottom: '10px' }} />

                  {/* Description */}
                  <p style={{ fontSize: '0.68rem', color: 'rgba(180,165,140,0.7)', lineHeight: 1.6, fontStyle: 'italic', marginBottom: '12px' }}>
                    {d.desc}
                  </p>

                  {/* Zone info */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ fontSize: '0.52rem', color: 'rgba(160,140,110,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                      Zone {d.zone}
                    </span>
                    {!zoneUnlocked && (
                      <span style={{ fontSize: '0.52rem', color: 'rgba(180,80,80,0.7)', letterSpacing: '0.08em' }}>
                        Locked
                      </span>
                    )}
                  </div>

                  {/* Status message */}
                  {!zoneUnlocked ? (
                    <div style={{
                      fontSize: '0.56rem', color: '#555',
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: '4px', padding: '6px 8px',
                      textAlign: 'center', letterSpacing: '0.08em',
                    }}>
                      {(level ?? 1) < (ZONE_MIN_LEVEL[d.zone] ?? 1)
                        ? `Unlocks at Level ${ZONE_MIN_LEVEL[d.zone]}`
                        : `Complete Zone ${d.zone - 1} contracts to unlock`}
                    </div>
                  ) : isActive ? (
                    activeContract ? (
                      <div style={{
                        fontSize: '0.56rem', color: 'rgba(220,100,100,0.5)',
                        background: 'rgba(220,40,40,0.05)',
                        border: '1px solid rgba(220,80,80,0.15)',
                        borderRadius: '4px', padding: '6px 8px',
                        textAlign: 'center', letterSpacing: '0.06em', fontStyle: 'italic',
                      }}>Something stirs nearby — finish your contract first.</div>
                    ) : (
                      <button
                        onClick={() => {
                          const pool = WILD_ENCOUNTERS[d.zone] || WILD_ENCOUNTERS[1];
                          const monster = pool[Math.floor(Math.random() * pool.length)];
                          setDecoPopup({ decoIdx: selectedDeco, monster, zone: d.zone, location: d.name });
                          setActiveDecos(prev => prev.filter(idx => idx !== selectedDeco));
                          setSelectedDeco(null);
                        }}
                        style={{
                          width: '100%', fontSize: '0.6rem', fontWeight: 700,
                          color: '#000',
                          background: 'rgba(220,60,60,0.85)',
                          border: '1px solid rgba(220,80,80,0.5)',
                          borderRadius: '4px', padding: '7px 8px',
                          cursor: 'pointer', letterSpacing: '0.1em', textTransform: 'uppercase',
                          boxShadow: '0 0 12px rgba(220,40,40,0.4)',
                          transition: 'all 0.15s',
                        }}
                      >Investigate</button>
                    )
                  ) : (
                    <div style={{ fontSize: '0.56rem', color: 'rgba(180,150,90,0.35)', textAlign: 'center', letterSpacing: '0.08em' }}>
                      No activity detected
                    </div>
                  )}
                </motion.div>
              );
            })() : displayed ? (
              <motion.div
                key={displayed.id}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                transition={{ duration: 0.18 }}
                style={{
                  background: 'linear-gradient(to bottom, rgba(22,10,6,0.98), rgba(10,4,2,0.98))',
                  border: `1px solid ${displayed.dangerColor}28`,
                  borderRadius: '8px',
                  padding: '14px',
                  boxShadow: `0 0 24px ${displayed.dangerColor}0e`,
                }}
              >
                {/* Type pill */}
                <div style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{
                    fontSize: '0.48rem', fontWeight: 700,
                    letterSpacing: '0.14em', textTransform: 'uppercase',
                    color: displayed.type === 'hunting' ? displayed.dangerColor : displayed.type === 'landmark' ? 'rgba(180,160,140,0.5)' : '#D4AF37',
                    background: displayed.type === 'hunting' ? `${displayed.dangerColor}14` : displayed.type === 'landmark' ? 'rgba(180,160,140,0.06)' : 'rgba(212,175,55,0.08)',
                    border: `1px solid ${displayed.type === 'hunting' ? displayed.dangerColor + '30' : displayed.type === 'landmark' ? 'rgba(180,160,140,0.15)' : 'rgba(212,175,55,0.2)'}`,
                    padding: '2px 6px', borderRadius: '3px',
                  }}>
                    {displayed.type === 'hunting' ? 'Hunting Ground' : displayed.type === 'landmark' ? 'Landmark' : 'Contract Location'}
                  </div>
                </div>

                {/* Name */}
                <div style={{ marginBottom: '10px' }}>
                  <div style={{ fontSize: '0.5rem', color: 'rgba(180,160,140,0.4)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '3px' }}>
                    {displayed.subtitle}
                  </div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#F5F5DC', letterSpacing: '0.07em', lineHeight: 1.2 }}>
                    {displayed.name}
                  </div>
                </div>

                {/* Danger */}
                <div style={{ marginBottom: '10px' }}>
                  <div style={{ fontSize: '0.48rem', color: 'rgba(180,160,140,0.4)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '4px' }}>Danger</div>
                  <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
                    {Array.from({ length: 5 }, (_, i) => (
                      <span key={i} style={{ fontSize: '0.48rem', color: i < displayed.danger ? displayed.dangerColor : 'rgba(255,255,255,0.08)' }}>◆</span>
                    ))}
                    <span style={{ fontSize: '0.58rem', fontWeight: 700, color: displayed.dangerColor, letterSpacing: '0.1em', textTransform: 'uppercase', marginLeft: '4px' }}>
                      {displayed.dangerLabel}
                    </span>
                  </div>
                </div>

                {/* Creature tiers for hunting grounds */}
                {displayed.tierWeights && (
                  <div style={{ marginBottom: '10px' }}>
                    <div style={{ fontSize: '0.48rem', color: 'rgba(180,160,140,0.4)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '6px' }}>Creatures</div>
                    {[1, 2, 3].map(tier => {
                      const w = displayed.tierWeights[tier] || 0;
                      const total = Object.values(displayed.tierWeights).reduce((a, b) => a + b, 0);
                      const pct = total > 0 ? Math.round((w / total) * 100) : 0;
                      if (pct === 0) return null;
                      const { label, color } = TIER_META[tier];
                      return (
                        <div key={tier} style={{ marginBottom: '5px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                            <span style={{ fontSize: '0.56rem', color, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</span>
                            <span style={{ fontSize: '0.56rem', color: 'rgba(180,160,140,0.45)' }}>{pct}%</span>
                          </div>
                          <div style={{ height: '3px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px' }}>
                            <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '2px', opacity: 0.6 }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Contract name — only when active */}
                {displayed.contract && (
                  (displayed.id === 'dungeon' && activeContract?.type === 'elite') ||
                  (displayed.id === 'skull_cave' && activeContract?.type === 'final') ||
                  (activeContract?.type === 'location' && activeContract.contract.locationId === displayed.id)
                ) && (
                  <div style={{ marginBottom: '10px' }}>
                    <div style={{ fontSize: '0.48rem', color: 'rgba(212,175,55,0.5)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '3px' }}>Active Contract</div>
                    <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#D4AF37', letterSpacing: '0.08em' }}>"{displayed.contract}"</div>
                  </div>
                )}

                {/* Lore */}
                <p style={{ fontSize: '0.6rem', color: 'rgba(180,165,150,0.55)', lineHeight: 1.65, marginBottom: '12px', fontStyle: 'italic' }}>
                  {displayed.desc}
                </p>

                {/* Status / Action */}
                {displayed.id === 'dungeon' ? (
                  // Elite boss location
                  activeContract?.type === 'elite' ? (
                    <button
                      onClick={() => { onEliteBoss(); setActiveContract(null); }}
                      disabled={!isDayActive}
                      style={{
                        width: '100%', fontSize: '0.56rem', fontWeight: 700,
                        color: isDayActive ? '#000' : 'rgba(168,85,247,0.3)',
                        background: isDayActive ? '#A855F7' : 'rgba(20,10,30,0.5)',
                        border: '1px solid rgba(168,85,247,0.5)',
                        borderRadius: '4px', padding: '8px',
                        cursor: isDayActive ? 'pointer' : 'not-allowed',
                        letterSpacing: '0.12em', textTransform: 'uppercase',
                        boxShadow: isDayActive ? '0 0 16px rgba(168,85,247,0.4)' : 'none',
                        animation: isDayActive ? 'intro-hint-pulse 2s ease-in-out infinite' : 'none',
                      }}
                    >Begin Blood Contract</button>
                  ) : (
                    <div style={{ fontSize: '0.56rem', color: 'rgba(168,85,247,0.45)', textAlign: 'center', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                      Accept on Contracts Board
                    </div>
                  )
                ) : displayed.id === 'skull_cave' ? (
                  // Legendary boss location
                  !isUnlocked(displayed) ? (
                    <div style={{
                      fontSize: '0.56rem', color: '#555',
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: '4px', padding: '6px 8px',
                      textAlign: 'center', letterSpacing: '0.08em',
                    }}>{displayed.contractZone > 1 && isZoneContractUnlocked(displayed) === false
                      ? `Complete Zone ${displayed.contractZone - 1} contracts to unlock`
                      : `Unlocks at Level ${displayed.unlockLevel}`
                    }</div>
                  ) : activeContract?.type === 'final' ? (
                    <button
                      onClick={() => { onFinalBoss(); setActiveContract(null); }}
                      disabled={!isDayActive}
                      style={{
                        width: '100%', fontSize: '0.56rem', fontWeight: 700,
                        color: isDayActive ? '#000' : 'rgba(245,158,11,0.3)',
                        background: isDayActive ? '#F59E0B' : 'rgba(20,12,0,0.5)',
                        border: '1px solid rgba(245,158,11,0.5)',
                        borderRadius: '4px', padding: '8px',
                        cursor: isDayActive ? 'pointer' : 'not-allowed',
                        letterSpacing: '0.12em', textTransform: 'uppercase',
                        boxShadow: isDayActive ? '0 0 20px rgba(245,158,11,0.5)' : 'none',
                        animation: isDayActive ? 'intro-hint-pulse 2s ease-in-out infinite' : 'none',
                      }}
                    >Enter the Gauntlet</button>
                  ) : (
                    <div style={{ fontSize: '0.56rem', color: 'rgba(245,158,11,0.4)', textAlign: 'center', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                      Accept on Contracts Board
                    </div>
                  )
                ) : !isUnlocked(displayed) ? (
                  <div style={{
                    fontSize: '0.56rem', color: '#555',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '4px', padding: '6px 8px',
                    textAlign: 'center', letterSpacing: '0.08em',
                  }}>Unlocks at Level {displayed.unlockLevel}</div>
                ) : displayed.type === 'hunting' || (activeContract?.type === 'task' && !displayed.isElite && !displayed.isLegendary) ? (
                  selectedZone?.id === displayed.id ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {/* Active task contract label */}
                      {activeContract?.type === 'task' && (
                        <div style={{
                          fontSize: '0.52rem', color: '#D4AF37',
                          background: 'rgba(212,175,55,0.08)',
                          border: '1px solid rgba(212,175,55,0.25)',
                          borderRadius: '3px', padding: '5px 8px',
                          letterSpacing: '0.08em',
                        }}>✦ {activeContract.task.title}</div>
                      )}
                      {/* Begin Contract / Hunt Here — starts battle immediately */}
                      <button
                        onClick={() => isDayActive && onBeginContract()}
                        disabled={!isDayActive}
                        style={{
                          width: '100%', fontSize: '0.56rem', fontWeight: 700,
                          color: isDayActive ? '#000' : 'rgba(220,38,38,0.3)',
                          background: isDayActive ? displayed.dangerColor : 'rgba(10,5,5,0.5)',
                          border: `1px solid ${displayed.dangerColor}50`,
                          borderRadius: '4px', padding: '7px 8px',
                          cursor: isDayActive ? 'pointer' : 'not-allowed',
                          letterSpacing: '0.12em', textTransform: 'uppercase',
                          boxShadow: isDayActive ? `0 0 12px ${displayed.dangerColor}55` : 'none',
                          transition: 'all 0.15s',
                        }}
                      >{activeContract?.type === 'task' ? 'Begin Contract' : 'Hunt Here'}</button>
                      {activeContract?.type !== 'task' && (
                        <button
                          onClick={() => setSelectedZone(null)}
                          style={{
                            width: '100%', fontSize: '0.48rem', fontWeight: 600,
                            color: 'rgba(180,160,140,0.4)',
                            background: 'transparent', border: '1px solid rgba(255,255,255,0.05)',
                            borderRadius: '4px', padding: '4px 8px',
                            cursor: 'pointer', letterSpacing: '0.1em', textTransform: 'uppercase',
                          }}
                        >Deselect Zone</button>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => setSelectedZone(displayed)}
                      style={{
                        width: '100%', fontSize: '0.56rem', fontWeight: 700,
                        color: displayed.dangerColor,
                        background: `${displayed.dangerColor}14`,
                        border: `1px solid ${displayed.dangerColor}50`,
                        borderRadius: '4px', padding: '7px 8px',
                        cursor: 'pointer', letterSpacing: '0.12em', textTransform: 'uppercase',
                        transition: 'all 0.15s',
                      }}
                    >Set as Hunting Ground</button>
                  )
                ) : displayed.type === 'landmark' ? (
                  null
                ) : activeContract?.type === 'location' && activeContract.contract.locationId === displayed.id ? (
                  <button
                    onClick={() => isDayActive && onBeginContract()}
                    disabled={!isDayActive}
                    style={{
                      width: '100%', fontSize: '0.56rem', fontWeight: 700,
                      color: isDayActive ? '#000' : 'rgba(212,175,55,0.3)',
                      background: isDayActive ? '#D4AF37' : 'rgba(20,15,0,0.5)',
                      border: '1px solid rgba(212,175,55,0.5)',
                      borderRadius: '4px', padding: '8px',
                      cursor: isDayActive ? 'pointer' : 'not-allowed',
                      letterSpacing: '0.12em', textTransform: 'uppercase',
                      boxShadow: isDayActive ? '0 0 16px rgba(212,175,55,0.4)' : 'none',
                      animation: isDayActive ? 'intro-hint-pulse 2s ease-in-out infinite' : 'none',
                    }}
                  >Begin Contract</button>
                ) : (
                  <div style={{
                    fontSize: '0.56rem', color: 'rgba(212,175,55,0.5)',
                    textAlign: 'center', letterSpacing: '0.1em', textTransform: 'uppercase',
                  }}>
                    Find contract in the Contracts tab
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  background: 'rgba(10,5,3,0.6)',
                  border: '1px solid rgba(212,175,55,0.06)',
                  borderRadius: '8px', padding: '28px 16px', textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '1.8rem', marginBottom: '10px', opacity: 0.15 }}>◈</div>
                <p style={{ fontSize: '0.6rem', color: 'rgba(180,165,150,0.3)', lineHeight: 1.7 }}>
                  Click any location on the map to view it.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick stats */}
          <div style={{
            marginTop: '12px',
            background: 'rgba(10,5,3,0.5)',
            border: '1px solid rgba(212,175,55,0.06)',
            borderRadius: '6px', padding: '10px 12px',
          }}>
            <div style={{ fontSize: '0.48rem', color: 'rgba(180,160,140,0.35)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '8px' }}>
              Map Overview
            </div>
            {[
              { label: 'Tame',      color: '#9CA3AF', count: LOCATIONS.filter(l => l.dangerLabel === 'Tame').length },
              { label: 'Moderate',  color: '#CD7F32', count: LOCATIONS.filter(l => l.dangerLabel === 'Moderate').length },
              { label: 'Dangerous', color: '#DC2626', count: LOCATIONS.filter(l => l.dangerLabel === 'Dangerous').length },
              { label: 'Dire',      color: '#7C3AED', count: LOCATIONS.filter(l => l.dangerLabel === 'Dire').length },
              { label: 'Elite',     color: '#A855F7', count: LOCATIONS.filter(l => l.dangerLabel === 'Elite').length },
              { label: 'Legendary', color: '#F59E0B', count: LOCATIONS.filter(l => l.dangerLabel === 'Legendary').length },
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                <span style={{ fontSize: '0.55rem', color: row.color, letterSpacing: '0.08em' }}>{row.label}</span>
                <span style={{ fontSize: '0.55rem', color: 'rgba(180,160,140,0.4)' }}>{row.count} locations</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorldMapTab;
