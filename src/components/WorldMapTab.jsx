import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ZONES = [
  {
    id: 'outskirts',
    name: 'The Outskirts',
    subtitle: 'Village Edge',
    desc: 'Weak creatures roam just beyond the village walls. A safe place to begin the hunt.',
    marker: '/worldmap/wooden-house.png',
    tierWeights: { 1: 10, 2: 0, 3: 0 },
    unlockDay: 1,
    position: { left: '47%', top: '76%' },
    danger: 1,
    dangerLabel: 'Tame',
    dangerColor: '#9CA3AF',
  },
  {
    id: 'whisper_forest',
    name: 'Whisper Forest',
    subtitle: 'Ancient Woodland',
    desc: 'Old trees conceal things that have learned to hunt. Not all creatures here are mindless.',
    marker: '/worldmap/tree.png',
    tierWeights: { 1: 5, 2: 5, 3: 0 },
    unlockDay: 2,
    position: { left: '20%', top: '54%' },
    danger: 2,
    dangerLabel: 'Moderate',
    dangerColor: '#CD7F32',
  },
  {
    id: 'barrow_ruins',
    name: 'Barrow Ruins',
    subtitle: 'Forgotten Battleground',
    desc: 'The bones of old wars. Predators nest among the fallen, feeding on the remnants of history.',
    marker: '/worldmap/old-swords.png',
    tierWeights: { 1: 2, 2: 6, 3: 2 },
    unlockDay: 3,
    position: { left: '65%', top: '55%' },
    danger: 2,
    dangerLabel: 'Moderate',
    dangerColor: '#CD7F32',
  },
  {
    id: 'stonehenge_wilds',
    name: 'Stonehenge Wilds',
    subtitle: 'Ancient Circle',
    desc: 'A place of old power. The creatures here feel the pull of it — and so do you.',
    marker: '/worldmap/stonehenge.png',
    tierWeights: { 1: 1, 2: 4, 3: 5 },
    unlockDay: 4,
    position: { left: '33%', top: '35%' },
    danger: 3,
    dangerLabel: 'Dangerous',
    dangerColor: '#DC2626',
  },
  {
    id: 'stoneback_cave',
    name: 'Stoneback Cavern',
    subtitle: 'The Deep Dark',
    desc: 'No light reaches the bottom. Only dire things live here — things that have never needed it.',
    marker: '/worldmap/cave.png',
    tierWeights: { 1: 0, 2: 2, 3: 8 },
    unlockDay: 5,
    position: { left: '57%', top: '26%' },
    danger: 3,
    dangerLabel: 'Dangerous',
    dangerColor: '#DC2626',
  },
  {
    id: 'lava_wastes',
    name: 'Lava Wastes',
    subtitle: 'Scorched Earth',
    desc: 'The ground itself is hostile. The creatures born here are the world\'s way of killing everything else.',
    marker: '/worldmap/lava-lake.png',
    tierWeights: { 1: 0, 2: 0, 3: 10 },
    unlockDay: 6,
    position: { left: '74%', top: '18%' },
    danger: 3,
    dangerLabel: 'Dire',
    dangerColor: '#7C3AED',
  },
  {
    id: 'dungeon',
    name: 'Dungeon of the Fallen',
    subtitle: 'Elite Territory',
    desc: 'Elite horrors have claimed this place. Enter only when the contracts demand it.',
    marker: '/worldmap/dungeon.png',
    tierWeights: null,
    unlockDay: null,
    isContractOnly: true,
    position: { left: '43%', top: '43%' },
    danger: 4,
    dangerLabel: 'Elite',
    dangerColor: '#A855F7',
  },
  {
    id: 'skull_cave',
    name: 'Skull Cavern',
    subtitle: 'Legendary Darkness',
    desc: 'No one speaks of what lives inside. Those who returned did not speak at all.',
    marker: '/worldmap/skull-cave.png',
    tierWeights: null,
    unlockDay: null,
    isContractOnly: true,
    position: { left: '26%', top: '16%' },
    danger: 5,
    dangerLabel: 'Legendary',
    dangerColor: '#F59E0B',
  },
];

const DANGER_DOTS = (n, color) =>
  Array.from({ length: 5 }, (_, i) => (
    <span key={i} style={{ color: i < n ? color : 'rgba(255,255,255,0.1)', fontSize: '0.55rem' }}>◆</span>
  ));

const TIER_META = {
  1: { label: 'Grunt',    color: '#A8A8A8' },
  2: { label: 'Predator', color: '#CD7F32' },
  3: { label: 'Dire',     color: '#DC2626' },
};

const WorldMapTab = ({ currentDay, selectedZone, setSelectedZone }) => {
  const [hoveredZone, setHoveredZone] = useState(null);

  const isUnlocked = (zone) => {
    if (zone.isContractOnly) return false;
    return currentDay >= zone.unlockDay;
  };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', paddingBottom: '40px' }}>
      {/* Header */}
      <div className="text-center mb-5">
        <p style={{ fontSize: '0.6rem', color: 'rgba(212,175,55,0.4)', letterSpacing: '0.35em', textTransform: 'uppercase', marginBottom: '6px' }}>
          World of
        </p>
        <h2 style={{
          fontFamily: "'Cinzel', serif", fontSize: 'clamp(1.4rem, 3vw, 2rem)',
          letterSpacing: '0.25em', color: '#D4AF37', textTransform: 'uppercase',
          textShadow: '0 0 30px rgba(212,175,55,0.3)',
        }}>
          Ararlul
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginTop: '6px' }}>
          <div style={{ width: '40px', height: '1px', background: 'linear-gradient(to right, transparent, rgba(212,175,55,0.4))' }} />
          <p style={{ fontSize: '0.6rem', color: 'rgba(180,165,150,0.45)', letterSpacing: '0.25em', textTransform: 'uppercase' }}>
            Select your hunting ground
          </p>
          <div style={{ width: '40px', height: '1px', background: 'linear-gradient(to left, transparent, rgba(212,175,55,0.4))' }} />
        </div>
      </div>

      {/* Map + Panel */}
      <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>

        {/* Map container */}
        <div style={{ flex: 1, minWidth: 0, position: 'relative' }}>
          <div style={{
            position: 'relative',
            height: '520px',
            borderRadius: '8px',
            overflow: 'hidden',
            border: '1px solid rgba(212,175,55,0.18)',
            boxShadow: '0 0 40px rgba(0,0,0,0.6), inset 0 0 60px rgba(0,0,0,0.3)',
          }}>
            {/* Terrain base */}
            <img
              src="/worldmap/terrain.png"
              alt="Ararlul World Map"
              style={{
                width: '100%', height: '100%',
                objectFit: 'cover',
                objectPosition: 'center top',
                display: 'block',
              }}
            />

            {/* Atmospheric overlay */}
            <div style={{
              position: 'absolute', inset: 0, pointerEvents: 'none',
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.05) 40%, rgba(0,0,0,0.35) 100%)',
            }} />

            {/* Vignette */}
            <div style={{
              position: 'absolute', inset: 0, pointerEvents: 'none',
              boxShadow: 'inset 0 0 80px rgba(0,0,0,0.5)',
            }} />

            {/* Zone markers */}
            {ZONES.map(zone => {
              const unlocked = isUnlocked(zone);
              const isSelected = selectedZone?.id === zone.id;
              const isHovered = hoveredZone === zone.id;

              return (
                <motion.div
                  key={zone.id}
                  style={{
                    position: 'absolute',
                    left: zone.position.left,
                    top: zone.position.top,
                    transform: 'translate(-50%, -50%)',
                    cursor: unlocked ? 'pointer' : 'default',
                    zIndex: isSelected || isHovered ? 10 : 5,
                  }}
                  whileHover={unlocked ? { scale: 1.12 } : {}}
                  onClick={() => unlocked && setSelectedZone(zone)}
                  onMouseEnter={() => setHoveredZone(zone.id)}
                  onMouseLeave={() => setHoveredZone(null)}
                >
                  {/* Selection ring */}
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      style={{
                        position: 'absolute',
                        inset: '-10px',
                        borderRadius: '50%',
                        border: `2px solid ${zone.dangerColor}`,
                        boxShadow: `0 0 14px ${zone.dangerColor}88`,
                      }}
                    />
                  )}

                  <img
                    src={zone.marker}
                    alt={zone.name}
                    style={{
                      width: '44px',
                      height: '44px',
                      objectFit: 'contain',
                      filter: unlocked
                        ? isSelected
                          ? `drop-shadow(0 0 10px ${zone.dangerColor}) brightness(1.1)`
                          : 'drop-shadow(0 2px 5px rgba(0,0,0,0.9))'
                        : 'grayscale(1) brightness(0.35)',
                      transition: 'filter 0.2s',
                    }}
                  />

                  {/* Lock badge */}
                  {!unlocked && !zone.isContractOnly && (
                    <div style={{
                      position: 'absolute', top: '-2px', right: '-2px',
                      background: 'rgba(0,0,0,0.85)',
                      borderRadius: '50%',
                      width: '14px', height: '14px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '8px',
                    }}>
                      🔒
                    </div>
                  )}

                  {/* Contract badge */}
                  {zone.isContractOnly && (
                    <div style={{
                      position: 'absolute', top: '-6px', right: '-6px',
                      fontSize: '0.5rem', fontWeight: 700,
                      background: 'rgba(0,0,0,0.9)',
                      color: zone.dangerColor,
                      border: `1px solid ${zone.dangerColor}44`,
                      borderRadius: '3px',
                      padding: '1px 3px',
                      letterSpacing: '0.04em',
                      whiteSpace: 'nowrap',
                    }}>
                      CONTRACT
                    </div>
                  )}

                  {/* Hover tooltip */}
                  <AnimatePresence>
                    {isHovered && (
                      <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.12 }}
                        style={{
                          position: 'absolute',
                          bottom: 'calc(100% + 8px)',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          background: 'rgba(8,4,4,0.97)',
                          border: `1px solid ${zone.dangerColor}44`,
                          borderRadius: '4px',
                          padding: '5px 9px',
                          whiteSpace: 'nowrap',
                          pointerEvents: 'none',
                          zIndex: 20,
                          boxShadow: `0 4px 12px rgba(0,0,0,0.7)`,
                        }}
                      >
                        <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#F5F5DC', letterSpacing: '0.07em' }}>
                          {zone.name}
                        </div>
                        <div style={{ fontSize: '0.55rem', color: zone.dangerColor, letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: '1px' }}>
                          {zone.dangerLabel}
                          {!unlocked && !zone.isContractOnly && ` · Unlocks Day ${zone.unlockDay}`}
                          {zone.isContractOnly && ' · Contract Only'}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}

            {/* Active zone chip at bottom-left */}
            <AnimatePresence>
              {selectedZone && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  style={{
                    position: 'absolute', bottom: '12px', left: '12px',
                    background: 'rgba(0,0,0,0.88)',
                    border: `1px solid ${selectedZone.dangerColor}44`,
                    borderRadius: '5px',
                    padding: '6px 10px',
                    backdropFilter: 'blur(4px)',
                  }}
                >
                  <div style={{ fontSize: '0.5rem', color: 'rgba(180,160,140,0.55)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                    Hunting Ground
                  </div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: selectedZone.dangerColor, letterSpacing: '0.1em' }}>
                    {selectedZone.name}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Cardinal directions watermark */}
            <img
              src="/worldmap/cardinal.png"
              alt=""
              style={{
                position: 'absolute', bottom: '10px', right: '10px',
                width: '48px', height: '48px',
                objectFit: 'contain',
                opacity: 0.55,
                pointerEvents: 'none',
              }}
            />
          </div>
        </div>

        {/* Info panel */}
        <div style={{ width: '210px', flexShrink: 0 }}>
          <AnimatePresence mode="wait">
            {selectedZone ? (
              <motion.div
                key={selectedZone.id}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                transition={{ duration: 0.18 }}
                style={{
                  background: 'linear-gradient(to bottom, rgba(25,12,8,0.97), rgba(12,5,3,0.97))',
                  border: `1px solid ${selectedZone.dangerColor}2a`,
                  borderRadius: '8px',
                  padding: '14px',
                  boxShadow: `0 0 24px ${selectedZone.dangerColor}10`,
                }}
              >
                {/* Name */}
                <div style={{ marginBottom: '10px' }}>
                  <div style={{ fontSize: '0.5rem', color: 'rgba(180,160,140,0.45)', letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: '3px' }}>
                    {selectedZone.subtitle}
                  </div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#F5F5DC', letterSpacing: '0.07em', lineHeight: 1.2 }}>
                    {selectedZone.name}
                  </div>
                </div>

                {/* Danger */}
                <div style={{ marginBottom: '10px' }}>
                  <div style={{ fontSize: '0.5rem', color: 'rgba(180,160,140,0.45)', letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Danger
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ display: 'flex', gap: '2px' }}>
                      {DANGER_DOTS(selectedZone.danger, selectedZone.dangerColor)}
                    </div>
                    <span style={{ fontSize: '0.6rem', fontWeight: 700, color: selectedZone.dangerColor, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                      {selectedZone.dangerLabel}
                    </span>
                  </div>
                </div>

                {/* Creature breakdown */}
                {selectedZone.tierWeights && (
                  <div style={{ marginBottom: '10px' }}>
                    <div style={{ fontSize: '0.5rem', color: 'rgba(180,160,140,0.45)', letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: '6px' }}>
                      Creatures
                    </div>
                    {[1, 2, 3].map(tier => {
                      const w = selectedZone.tierWeights[tier] || 0;
                      const total = Object.values(selectedZone.tierWeights).reduce((a, b) => a + b, 0);
                      const pct = total > 0 ? Math.round((w / total) * 100) : 0;
                      if (pct === 0) return null;
                      const { label, color } = TIER_META[tier];
                      return (
                        <div key={tier} style={{ marginBottom: '5px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                            <span style={{ fontSize: '0.58rem', color, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</span>
                            <span style={{ fontSize: '0.58rem', color: 'rgba(180,160,140,0.5)' }}>{pct}%</span>
                          </div>
                          <div style={{ height: '3px', background: 'rgba(255,255,255,0.07)', borderRadius: '2px' }}>
                            <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '2px', opacity: 0.65 }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Lore desc */}
                <p style={{
                  fontSize: '0.62rem', color: 'rgba(180,165,150,0.6)',
                  lineHeight: 1.65, marginBottom: '12px', fontStyle: 'italic',
                }}>
                  "{selectedZone.desc}"
                </p>

                {/* Status footer */}
                {selectedZone.isContractOnly ? (
                  <div style={{
                    fontSize: '0.58rem', color: selectedZone.dangerColor,
                    background: `${selectedZone.dangerColor}10`,
                    border: `1px solid ${selectedZone.dangerColor}30`,
                    borderRadius: '4px', padding: '6px 8px',
                    textAlign: 'center', letterSpacing: '0.1em', textTransform: 'uppercase',
                  }}>
                    Contract Access Only
                  </div>
                ) : !isUnlocked(selectedZone) ? (
                  <div style={{
                    fontSize: '0.58rem', color: '#6B7280',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: '4px', padding: '6px 8px',
                    textAlign: 'center', letterSpacing: '0.08em',
                  }}>
                    Unlocks on Day {selectedZone.unlockDay}
                  </div>
                ) : (
                  <div style={{
                    fontSize: '0.55rem', color: `${selectedZone.dangerColor}aa`,
                    textAlign: 'center', letterSpacing: '0.15em', textTransform: 'uppercase',
                  }}>
                    ✦ Active hunting ground ✦
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  background: 'rgba(12,6,4,0.6)',
                  border: '1px solid rgba(212,175,55,0.07)',
                  borderRadius: '8px',
                  padding: '28px 16px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '1.8rem', marginBottom: '10px', opacity: 0.2 }}>◈</div>
                <p style={{ fontSize: '0.62rem', color: 'rgba(180,165,150,0.35)', lineHeight: 1.7, letterSpacing: '0.04em' }}>
                  Select a location on the map to set your hunting ground for today's battles.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Zone list */}
          <div style={{ marginTop: '10px' }}>
            {ZONES.filter(z => !z.isContractOnly).map(zone => {
              const unlocked = isUnlocked(zone);
              const isSelected = selectedZone?.id === zone.id;
              return (
                <button
                  key={zone.id}
                  onClick={() => unlocked && setSelectedZone(zone)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '5px 8px', marginBottom: '3px',
                    background: isSelected ? `${zone.dangerColor}14` : 'rgba(0,0,0,0.25)',
                    border: `1px solid ${isSelected ? zone.dangerColor + '40' : 'rgba(255,255,255,0.05)'}`,
                    borderRadius: '4px',
                    cursor: unlocked ? 'pointer' : 'default',
                    opacity: unlocked ? 1 : 0.38,
                    transition: 'all 0.15s',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: unlocked ? zone.dangerColor : '#333', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.58rem', color: isSelected ? zone.dangerColor : '#D4C5B0', letterSpacing: '0.07em', flex: 1 }}>
                    {zone.name}
                  </span>
                  {!unlocked && (
                    <span style={{ fontSize: '0.5rem', color: '#555', letterSpacing: '0.05em' }}>D{zone.unlockDay}</span>
                  )}
                </button>
              );
            })}

            {/* Contract-only divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: '8px 0 4px' }}>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
              <span style={{ fontSize: '0.48rem', color: 'rgba(180,160,140,0.3)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Contract</span>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
            </div>

            {ZONES.filter(z => z.isContractOnly).map(zone => (
              <button
                key={zone.id}
                onClick={() => setSelectedZone(zone)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '5px 8px', marginBottom: '3px',
                  background: selectedZone?.id === zone.id ? `${zone.dangerColor}14` : 'rgba(0,0,0,0.25)',
                  border: `1px solid ${selectedZone?.id === zone.id ? zone.dangerColor + '40' : 'rgba(255,255,255,0.05)'}`,
                  borderRadius: '4px',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  textAlign: 'left',
                }}
              >
                <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: zone.dangerColor, flexShrink: 0 }} />
                <span style={{ fontSize: '0.58rem', color: selectedZone?.id === zone.id ? zone.dangerColor : '#D4C5B0', letterSpacing: '0.07em', flex: 1 }}>
                  {zone.name}
                </span>
                <span style={{ fontSize: '0.48rem', color: zone.dangerColor, opacity: 0.6, letterSpacing: '0.08em' }}>⚔</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorldMapTab;
