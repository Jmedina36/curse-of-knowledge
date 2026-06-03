import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
  // ── SANDY ISLAND — Day 1 safe (bottom-right) ──────────────────────────────
  {
    id: 'outskirts',
    name: 'The Outskirts',
    subtitle: 'Village Edge',
    desc: 'The last safe ground before the wilds begin. Weak creatures roam here.',
    marker: '/worldmap/wooden-house.png',
    type: 'hunting',
    tierWeights: { 1: 10, 2: 0, 3: 0 },
    unlockDay: 1,
    position: { left: '56%', top: '80%' },
    danger: 1, dangerLabel: 'Tame', dangerColor: '#9CA3AF',
  },
  {
    id: 'fountain',
    name: 'Wellspring',
    subtitle: 'Ancient Fountain',
    desc: 'The water still runs clean. Those who drink from it speak of strange clarity.',
    marker: '/worldmap/fountain.png',
    type: 'contract',
    unlockDay: 1,
    position: { left: '62%', top: '76%' },
    danger: 1, dangerLabel: 'Tame', dangerColor: '#9CA3AF',
    contract: 'The Warden\'s Request',
  },
  {
    id: 'harbor',
    name: 'Ghost Harbor',
    subtitle: 'Abandoned Port',
    desc: 'Ships rot at the docks. Whatever happened here, the crews did not survive to tell it.',
    marker: '/worldmap/big-ship.png',
    type: 'contract',
    unlockDay: 1,
    position: { left: '28%', top: '79%' },
    danger: 1, dangerLabel: 'Tame', dangerColor: '#9CA3AF',
    contract: 'Missing Crew',
  },

  // ── GREEN ISLAND — Day 1-2 (bottom-left) ──────────────────────────────────
  {
    id: 'canopy_outpost',
    name: 'Canopy Outpost',
    subtitle: 'Scout Post',
    desc: 'A watchtower built into the oldest tree. Scouts report strange movement in the wilds.',
    marker: '/worldmap/tree-house.png',
    type: 'contract',
    unlockDay: 1,
    position: { left: '22%', top: '63%' },
    danger: 1, dangerLabel: 'Tame', dangerColor: '#9CA3AF',
    contract: 'Scouting Report',
  },
  {
    id: 'whisper_forest',
    name: 'Whisper Forest',
    subtitle: 'Ancient Woodland',
    desc: 'Old trees conceal things that have learned to hunt.',
    marker: '/worldmap/tree.png',
    type: 'hunting',
    tierWeights: { 1: 5, 2: 5, 3: 0 },
    unlockDay: 2,
    position: { left: '65%', top: '77%' },
    danger: 2, dangerLabel: 'Moderate', dangerColor: '#CD7F32',
  },
  {
    id: 'holy_tree',
    name: 'The Sacred Grove',
    subtitle: 'Holy Ground',
    desc: 'The tree still blooms despite the darkness around it. A last ember of something ancient.',
    marker: '/worldmap/holy-tree.png',
    type: 'contract',
    unlockDay: 2,
    position: { left: '28%', top: '67%' },
    danger: 2, dangerLabel: 'Moderate', dangerColor: '#CD7F32',
    contract: 'Protect the Grove',
  },
  {
    id: 'ivy_crossing',
    name: 'Ivy Crossing',
    subtitle: 'Overgrown Path',
    desc: 'The road is barely visible under the thorns. Something has been growing here for a long time.',
    marker: '/worldmap/thorny-ivy.png',
    type: 'contract',
    unlockDay: 2,
    position: { left: '72%', top: '88%' },
    danger: 2, dangerLabel: 'Moderate', dangerColor: '#CD7F32',
    contract: 'Clear the Road',
  },

  // ── CENTRAL LANDMASS — Day 2-5 ────────────────────────────────────────────
  {
    id: 'stone_bridge',
    name: 'The Old Crossing',
    subtitle: 'Ancient Bridge',
    desc: 'A bridge that has stood for centuries. Something lives beneath it now.',
    marker: '/worldmap/rock-bridge.png',
    type: 'contract',
    unlockDay: 2,
    position: { left: '58%', top: '55%' },
    danger: 2, dangerLabel: 'Moderate', dangerColor: '#CD7F32',
    contract: 'Toll of the Deep',
  },
  {
    id: 'treasure_vault',
    name: 'The Vault',
    subtitle: 'Hidden Cache',
    desc: 'Someone hid something here and never came back for it. The guardians they left behind did not leave.',
    marker: '/worldmap/treasure-chest.png',
    type: 'contract',
    unlockDay: 3,
    position: { left: '36%', top: '53%' },
    danger: 2, dangerLabel: 'Moderate', dangerColor: '#CD7F32',
    contract: 'The Lost Cache',
  },
  {
    id: 'barrow_ruins',
    name: 'Barrow Ruins',
    subtitle: 'Forgotten Battleground',
    desc: 'Predators nest among the fallen, feeding on the remnants of old wars.',
    marker: '/worldmap/old-swords.png',
    type: 'hunting',
    tierWeights: { 1: 2, 2: 6, 3: 2 },
    unlockDay: 3,
    position: { left: '48%', top: '47%' },
    danger: 2, dangerLabel: 'Moderate', dangerColor: '#CD7F32',
  },
  {
    id: 'old_tree',
    name: 'The Hollow',
    subtitle: 'Dead Landmark',
    desc: 'A massive dead tree used as a landmark by hunters. Something has nested inside.',
    marker: '/worldmap/old-tree.png',
    type: 'contract',
    unlockDay: 3,
    position: { left: '72%', top: '51%' },
    danger: 2, dangerLabel: 'Moderate', dangerColor: '#CD7F32',
    contract: 'Extermination Order',
  },
  {
    id: 'runic_circle',
    name: 'Runic Circle',
    subtitle: 'Arcane Site',
    desc: 'Ancient runes carved into the bedrock. Whatever ritual was performed here never stopped.',
    marker: '/worldmap/runic-stone.png',
    type: 'contract',
    unlockDay: 4,
    position: { left: '20%', top: '46%' },
    danger: 3, dangerLabel: 'Dangerous', dangerColor: '#DC2626',
    contract: 'Silence the Stones',
  },
  {
    id: 'stonehenge_wilds',
    name: 'Stonehenge Wilds',
    subtitle: 'Ancient Circle',
    desc: 'A place of old power. The creatures here feel the pull of it.',
    marker: '/worldmap/stonehenge.png',
    type: 'hunting',
    tierWeights: { 1: 1, 2: 4, 3: 5 },
    unlockDay: 4,
    position: { left: '36%', top: '38%' },
    danger: 3, dangerLabel: 'Dangerous', dangerColor: '#DC2626',
  },
  {
    id: 'magic_stone',
    name: 'The Arcane Monolith',
    subtitle: 'Power Node',
    desc: 'The stone hums with residual energy. Creatures drawn to it are changed by it.',
    marker: '/worldmap/magic-stone.png',
    type: 'contract',
    unlockDay: 4,
    position: { left: '50%', top: '34%' },
    danger: 3, dangerLabel: 'Dangerous', dangerColor: '#DC2626',
    contract: 'Shatter the Node',
  },
  {
    id: 'column_ruins',
    name: 'The Pillars',
    subtitle: 'Fallen Temple',
    desc: 'A temple reduced to columns. The god it was built for still watches from somewhere.',
    marker: '/worldmap/column.png',
    type: 'contract',
    unlockDay: 4,
    position: { left: '62%', top: '40%' },
    danger: 3, dangerLabel: 'Dangerous', dangerColor: '#DC2626',
    contract: 'Temple Cleansing',
  },
  {
    id: 'dungeon',
    name: 'Dungeon of the Fallen',
    subtitle: 'Elite Territory',
    desc: 'Elite horrors have claimed this place. Enter only when the contracts demand it.',
    marker: '/worldmap/dungeon.png',
    type: 'contract',
    unlockDay: null,
    isElite: true,
    position: { left: '74%', top: '36%' },
    danger: 4, dangerLabel: 'Elite', dangerColor: '#A855F7',
    contract: 'Blood Contract',
  },

  // ── TOP-LEFT MASS — Day 5-6 dangerous ─────────────────────────────────────
  {
    id: 'stoneback_cave',
    name: 'Stoneback Cavern',
    subtitle: 'The Deep Dark',
    desc: 'No light reaches the bottom. Only dire things live here.',
    marker: '/worldmap/cave.png',
    type: 'hunting',
    tierWeights: { 1: 0, 2: 2, 3: 8 },
    unlockDay: 5,
    position: { left: '22%', top: '18%' },
    danger: 3, dangerLabel: 'Dangerous', dangerColor: '#DC2626',
  },
  {
    id: 'precipice',
    name: 'The Precipice',
    subtitle: 'Sheer Cliff Face',
    desc: 'The cliff marks the edge of the known world. Beyond it, the darkness is uncharted.',
    marker: '/worldmap/cliff.png',
    type: 'contract',
    unlockDay: 5,
    position: { left: '10%', top: '24%' },
    danger: 3, dangerLabel: 'Dangerous', dangerColor: '#DC2626',
    contract: 'Edge of the World',
  },
  {
    id: 'dry_tree',
    name: 'The Withered Wood',
    subtitle: 'Ashen Forest',
    desc: 'A forest that burned and never recovered. The dead trees still move when no one is watching.',
    marker: '/worldmap/dry-tree.png',
    type: 'contract',
    unlockDay: 5,
    position: { left: '34%', top: '22%' },
    danger: 3, dangerLabel: 'Dangerous', dangerColor: '#DC2626',
    contract: 'The Restless Dead',
  },
  {
    id: 'crystal_stones',
    name: 'Crystal Wastes',
    subtitle: 'Corrupted Ground',
    desc: 'The crystals grew from corrupted earth. Everything that feeds on them grows wrong.',
    marker: '/worldmap/crystal-stones.png',
    type: 'contract',
    unlockDay: 6,
    position: { left: '20%', top: '10%' },
    danger: 3, dangerLabel: 'Dire', dangerColor: '#7C3AED',
    contract: 'Purge the Corruption',
  },

  // ── TOP-RIGHT ISLAND — Day 6 dire / Legendary ─────────────────────────────
  {
    id: 'lava_wastes',
    name: 'Lava Wastes',
    subtitle: 'Scorched Earth',
    desc: 'The creatures born here are the world\'s way of killing everything else.',
    marker: '/worldmap/lava-lake.png',
    type: 'hunting',
    tierWeights: { 1: 0, 2: 0, 3: 10 },
    unlockDay: 6,
    position: { left: '58%', top: '10%' },
    danger: 3, dangerLabel: 'Dire', dangerColor: '#7C3AED',
  },
  {
    id: 'crystal_lava',
    name: 'The Melt',
    subtitle: 'Crystallized Hellscape',
    desc: 'Where lava meets corrupted crystal. The things that survive here are not natural.',
    marker: '/worldmap/crystal-lava.png',
    type: 'contract',
    unlockDay: 6,
    position: { left: '50%', top: '5%' },
    danger: 3, dangerLabel: 'Dire', dangerColor: '#7C3AED',
    contract: 'Into the Melt',
  },
  {
    id: 'crystal_column',
    name: 'Void Spire',
    subtitle: 'Dimensional Fracture',
    desc: 'The crystal grew from nothing. Around it, reality is thinner than it should be.',
    marker: '/worldmap/crystal-column.png',
    type: 'contract',
    unlockDay: 6,
    position: { left: '70%', top: '7%' },
    danger: 3, dangerLabel: 'Dire', dangerColor: '#7C3AED',
    contract: 'Seal the Fracture',
  },
  {
    id: 'skull_cave',
    name: 'Skull Cavern',
    subtitle: 'Legendary Darkness',
    desc: 'No one speaks of what lives inside. Those who returned did not speak at all.',
    marker: '/worldmap/skull-cave.png',
    type: 'contract',
    unlockDay: null,
    isLegendary: true,
    position: { left: '82%', top: '4%' },
    markerSize: 72,
    danger: 5, dangerLabel: 'Legendary', dangerColor: '#F59E0B',
    contract: 'The Black Contract',
  },
];

const TIER_META = {
  1: { label: 'Grunt',    color: '#A8A8A8' },
  2: { label: 'Predator', color: '#CD7F32' },
  3: { label: 'Dire',     color: '#DC2626' },
};

const WorldMapTab = ({ currentDay, selectedZone, setSelectedZone }) => {
  const [activeLocation, setActiveLocation] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  const isUnlocked = (_loc) => true;

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

              {/* All location markers */}
              {LOCATIONS.map(loc => {
                const unlocked = isUnlocked(loc);
                const isHunting = loc.type === 'hunting';
                const isActive = activeLocation === loc.id || selectedZone?.id === loc.id;
                const isHovered = false; // handled via state if needed

                return (
                  <motion.div
                    key={loc.id}
                    style={{
                      position: 'absolute',
                      left: loc.position.left,
                      top: loc.position.top,
                      transform: 'translate(-50%, -50%)',
                      cursor: 'pointer',
                      zIndex: isActive ? 10 : 5,
                    }}
                    whileHover={{ scale: 1.15 }}
                    onClick={() => {
                      setActiveLocation(loc.id);
                      if (isHunting && unlocked) setSelectedZone(loc);
                    }}
                  >
                    {/* Active ring */}
                    {isActive && (
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
                        width: `${loc.markerSize || 56}px`, height: `${loc.markerSize || 56}px`,
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
                      background: isHunting ? loc.dangerColor : 'rgba(212,175,55,0.85)',
                      border: '1px solid rgba(0,0,0,0.6)',
                      boxShadow: `0 0 4px ${isHunting ? loc.dangerColor : '#D4AF37'}`,
                    }} />

                    {/* Lock */}
                    {!unlocked && !loc.isElite && !loc.isLegendary && (
                      <div style={{
                        position: 'absolute', top: '-3px', left: '-3px',
                        background: 'rgba(0,0,0,0.85)', borderRadius: '50%',
                        width: '14px', height: '14px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '7px',
                      }}>🔒</div>
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

        {/* Info panel */}
        <div style={{ width: '215px', flexShrink: 0 }}>
          <AnimatePresence mode="wait">
            {displayed ? (
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
                    color: displayed.type === 'hunting' ? displayed.dangerColor : '#D4AF37',
                    background: displayed.type === 'hunting' ? `${displayed.dangerColor}14` : 'rgba(212,175,55,0.08)',
                    border: `1px solid ${displayed.type === 'hunting' ? displayed.dangerColor + '30' : 'rgba(212,175,55,0.2)'}`,
                    padding: '2px 6px', borderRadius: '3px',
                  }}>
                    {displayed.type === 'hunting' ? 'Hunting Ground' : 'Contract Location'}
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

                {/* Contract name */}
                {displayed.contract && (
                  <div style={{ marginBottom: '10px' }}>
                    <div style={{ fontSize: '0.48rem', color: 'rgba(180,160,140,0.4)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '3px' }}>Contract</div>
                    <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#D4AF37', letterSpacing: '0.08em' }}>"{displayed.contract}"</div>
                  </div>
                )}

                {/* Lore */}
                <p style={{ fontSize: '0.6rem', color: 'rgba(180,165,150,0.55)', lineHeight: 1.65, marginBottom: '12px', fontStyle: 'italic' }}>
                  {displayed.desc}
                </p>

                {/* Status */}
                {displayed.isElite || displayed.isLegendary ? (
                  <div style={{
                    fontSize: '0.56rem', color: displayed.dangerColor,
                    background: `${displayed.dangerColor}0e`,
                    border: `1px solid ${displayed.dangerColor}28`,
                    borderRadius: '4px', padding: '6px 8px',
                    textAlign: 'center', letterSpacing: '0.1em', textTransform: 'uppercase',
                  }}>Contract Access Only</div>
                ) : !isUnlocked(displayed) ? (
                  <div style={{
                    fontSize: '0.56rem', color: '#555',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '4px', padding: '6px 8px',
                    textAlign: 'center', letterSpacing: '0.08em',
                  }}>Unlocks Day {displayed.unlockDay}</div>
                ) : displayed.type === 'hunting' ? (
                  <button
                    onClick={() => setSelectedZone(displayed)}
                    style={{
                      width: '100%',
                      fontSize: '0.56rem', fontWeight: 700,
                      color: selectedZone?.id === displayed.id ? '#000' : displayed.dangerColor,
                      background: selectedZone?.id === displayed.id ? displayed.dangerColor : `${displayed.dangerColor}14`,
                      border: `1px solid ${displayed.dangerColor}50`,
                      borderRadius: '4px', padding: '7px 8px',
                      cursor: 'pointer', letterSpacing: '0.12em', textTransform: 'uppercase',
                      transition: 'all 0.15s',
                    }}
                  >
                    {selectedZone?.id === displayed.id ? '✦ Active Hunting Ground ✦' : 'Set as Hunting Ground'}
                  </button>
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
              { label: 'Tame',      color: '#9CA3AF', count: LOCATIONS.filter(l => l.danger === 1).length },
              { label: 'Moderate',  color: '#CD7F32', count: LOCATIONS.filter(l => l.danger === 2).length },
              { label: 'Dangerous', color: '#DC2626', count: LOCATIONS.filter(l => l.danger === 3).length },
              { label: 'Elite',     color: '#A855F7', count: LOCATIONS.filter(l => l.danger === 4).length },
              { label: 'Legendary', color: '#F59E0B', count: LOCATIONS.filter(l => l.danger === 5).length },
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
