import React from 'react';
import { motion } from 'framer-motion';
import DiceD20 from './DiceD20';
import { sounds } from '../sounds';

const InitiativeModal = ({ data, onClose }) => {
  const { roll, dexMod, total, playerFirst } = data;

  const color = playerFirst ? '#34D399' : '#EF4444';
  const glow  = playerFirst ? 'rgba(52,211,153,0.6)' : 'rgba(239,68,68,0.6)';

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.72)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: -24, scale: 0.85 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="rounded-xl p-6 text-center max-w-xs w-full"
        style={{
          background: 'linear-gradient(to bottom, rgba(8,8,18,0.98), rgba(4,4,12,0.98))',
          border: `2px solid ${color}`,
          boxShadow: `0 0 28px ${glow}, 0 0 60px ${glow.replace(/[\d.]+\)$/, '0.2)')}`,
        }}
        onClick={e => e.stopPropagation()}
      >
        <p style={{
          fontFamily: 'Cinzel, serif', fontSize: '0.58rem', letterSpacing: '0.4em',
          textTransform: 'uppercase', color: 'rgba(245,245,220,0.38)', marginBottom: '14px',
        }}>⚔ Initiative Roll</p>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '14px' }}>
          <DiceD20 roll={roll} color={color} glow={glow} size={88} rolling />
        </div>

        {dexMod !== 0 && (
          <p style={{
            fontFamily: 'Cinzel, serif', fontSize: '0.68rem',
            color: 'rgba(245,245,220,0.45)', marginBottom: '6px',
          }}>
            {roll} {dexMod > 0 ? '+' : ''}{dexMod} (DEX) ={' '}
            <span style={{ color, fontWeight: 700 }}>{total}</span>
          </p>
        )}

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{
            fontFamily: 'Cinzel, serif', fontSize: '0.95rem', fontWeight: 900,
            letterSpacing: '0.1em', color, textShadow: `0 0 14px ${glow}`,
            marginBottom: '18px',
          }}
        >
          {playerFirst ? '⚔ YOU ACT FIRST!' : '⚠ ENEMY STRIKES FIRST!'}
        </motion.p>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          onClick={() => { sounds.click(); onClose(); }}
          style={{
            fontFamily: 'Cinzel, serif', fontSize: '0.65rem', fontWeight: 700,
            letterSpacing: '0.22em', textTransform: 'uppercase',
            color, background: 'rgba(0,0,0,0.4)',
            border: `1px solid ${color}55`, padding: '8px 28px',
            borderRadius: '6px', cursor: 'pointer',
            animation: 'intro-hint-pulse 1.5s ease-in-out infinite',
          }}
        >
          Begin Battle
        </motion.button>
      </motion.div>
    </div>
  );
};

export default InitiativeModal;
