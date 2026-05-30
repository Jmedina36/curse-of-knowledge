import React from 'react';
import { motion } from 'framer-motion';

const RARITY_STYLES = {
  common:   { label: 'Common Encounter',   color: '#9CA3AF', glow: 'rgba(156,163,175,0.3)' },
  uncommon: { label: 'Uncommon Encounter', color: '#34D399', glow: 'rgba(52,211,153,0.4)'  },
  rare:     { label: 'Rare Encounter',     color: '#F59E0B', glow: 'rgba(245,158,11,0.5)'  },
};

const EncounterModal = ({ encounter, onAccept }) => {
  const rarity = RARITY_STYLES[encounter.rarity] || RARITY_STYLES.common;
  const hasEffect = encounter.effect.type !== 'none';

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ background: 'rgba(0,0,0,0.88)' }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="rounded-xl max-w-sm w-full overflow-hidden"
        style={{
          background: 'linear-gradient(to bottom, rgba(12,8,20,0.99), rgba(6,4,12,0.99))',
          border: `2px solid ${rarity.color}`,
          boxShadow: `0 0 30px ${rarity.glow}, 0 0 80px ${rarity.glow.replace(/[\d.]+\)$/, '0.15)')}`,
        }}
      >
        {/* Header bar */}
        <div style={{
          background: `linear-gradient(to right, transparent, ${rarity.glow}, transparent)`,
          borderBottom: `1px solid ${rarity.color}`,
          padding: '10px 20px',
          textAlign: 'center',
        }}>
          <p style={{
            fontFamily: 'Cinzel, serif',
            fontSize: '0.65rem',
            letterSpacing: '0.35em',
            textTransform: 'uppercase',
            color: rarity.color,
          }}>{rarity.label}</p>
        </div>

        <div className="p-6">
          {/* Icon + Title */}
          <div className="text-center mb-5">
            <div style={{ fontSize: '3rem', lineHeight: 1, marginBottom: '12px' }}>
              {encounter.icon}
            </div>
            <h2 style={{
              fontFamily: 'Cinzel, serif',
              fontWeight: 900,
              fontSize: 'clamp(1.2rem, 4vw, 1.6rem)',
              letterSpacing: '0.08em',
              color: '#F5F5DC',
              textShadow: `0 0 20px ${rarity.glow}, 0 2px 0 rgba(0,0,0,0.9)`,
              marginBottom: '4px',
            }}>{encounter.title}</h2>

            {/* Ornament */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '8px' }}>
              <div style={{ width: '60px', height: '1px', background: `linear-gradient(to right, transparent, ${rarity.color})` }} />
              <span style={{ color: rarity.color, fontSize: '8px' }}>◆</span>
              <div style={{ width: '60px', height: '1px', background: `linear-gradient(to left, transparent, ${rarity.color})` }} />
            </div>
          </div>

          {/* Description */}
          <p style={{
            fontFamily: 'Cinzel, serif',
            fontSize: '0.78rem',
            color: 'rgba(245,245,220,0.75)',
            lineHeight: 1.7,
            marginBottom: '12px',
            textAlign: 'center',
          }}>{encounter.description}</p>

          {/* Flavor text */}
          <p style={{
            fontFamily: 'Cinzel, serif',
            fontSize: '0.72rem',
            color: `${rarity.color}`,
            fontStyle: 'italic',
            textAlign: 'center',
            marginBottom: '16px',
            opacity: 0.85,
          }}>{encounter.flavor}</p>

          {/* Effect box */}
          {hasEffect && (
            <div className="rounded-lg p-3 mb-5 text-center" style={{
              background: `rgba(0,0,0,0.4)`,
              border: `1px solid ${rarity.color}`,
              boxShadow: `inset 0 0 20px ${rarity.glow.replace(/[\d.]+\)$/, '0.1)')}`,
            }}>
              <p style={{
                fontFamily: 'Cinzel, serif',
                fontSize: '0.9rem',
                fontWeight: 700,
                color: encounter.effectColor || rarity.color,
                letterSpacing: '0.05em',
              }}>{encounter.effectText}</p>
            </div>
          )}

          {/* Accept button */}
          <button
            onClick={onAccept}
            className="w-full py-3 rounded-lg transition-opacity hover:opacity-85"
            style={{
              background: `linear-gradient(to right, rgba(0,0,0,0.6), ${rarity.glow.replace(/[\d.]+\)$/, '0.25)')}, rgba(0,0,0,0.6))`,
              border: `2px solid ${rarity.color}`,
              color: '#F5F5DC',
              fontFamily: 'Cinzel, serif',
              fontSize: '0.8rem',
              fontWeight: 700,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              cursor: 'pointer',
            }}
          >{hasEffect ? 'Accept & Continue' : 'Acknowledged'}</button>
        </div>
      </motion.div>
    </div>
  );
};

export default EncounterModal;
