import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import DiceD20 from './DiceD20';

const TIERS = {
  1.5: { label: 'GLANCING CRIT',    color: '#9CA3AF', glow: 'rgba(156,163,175,0.6)', sub: 'The charge fizzles — but still connects.' },
  2.0: { label: 'CRITICAL HIT!',    color: '#34D399', glow: 'rgba(52,211,153,0.6)',  sub: 'A solid strike drives through.' },
  2.5: { label: 'HEAVY CRIT!',      color: '#60A5FA', glow: 'rgba(96,165,250,0.6)',  sub: 'The charge explodes with force.' },
  3.0: { label: 'DEVASTATING CRIT!',color: '#A78BFA', glow: 'rgba(167,139,250,0.7)', sub: 'The enemy reels from the impact.' },
  4.0: { label: 'LEGENDARY STRIKE!',color: '#F59E0B', glow: 'rgba(245,158,11,0.85)', sub: 'A strike for the ages.' },
};

const ChargedCritModal = ({ data, onClose }) => {
  const { roll, multiplier, attackName } = data;
  const tier = TIERS[multiplier] ?? TIERS[2.0];

  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[65] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.80)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.82 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="rounded-xl p-6 text-center max-w-xs w-full"
        style={{
          background: 'linear-gradient(to bottom, rgba(8,8,18,0.98), rgba(4,4,12,0.98))',
          border: `2px solid ${tier.color}`,
          boxShadow: `0 0 30px ${tier.glow}, 0 0 70px ${tier.glow.replace(/[\d.]+\)$/, '0.18)')}`,
        }}
        onClick={e => e.stopPropagation()}
      >
        <p style={{
          fontFamily: 'Cinzel, serif', fontSize: '0.55rem', letterSpacing: '0.35em',
          textTransform: 'uppercase', color: 'rgba(245,245,220,0.35)', marginBottom: '12px',
        }}>⚡ Charged {attackName}</p>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '14px' }}>
          <DiceD20 roll={roll} color={tier.color} glow={tier.glow} size={90} rolling />
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
          style={{
            fontFamily: 'Cinzel, serif', fontSize: '1rem', fontWeight: 900,
            letterSpacing: '0.12em', color: tier.color,
            textShadow: `0 0 16px ${tier.glow}`, marginBottom: '6px',
          }}
        >{tier.label}</motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
          style={{
            fontFamily: 'Cinzel, serif', fontSize: '0.72rem', fontWeight: 700,
            color: tier.color, marginBottom: '6px',
          }}
        >{multiplier}x damage</motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.65 }}
          style={{
            fontFamily: 'Cinzel, serif', fontSize: '0.6rem', fontStyle: 'italic',
            color: 'rgba(245,245,220,0.38)', marginBottom: '10px',
          }}
        >"{tier.sub}"</motion.p>

        <p style={{
          fontFamily: 'Cinzel, serif', fontSize: '0.55rem',
          color: 'rgba(245,245,220,0.18)', letterSpacing: '0.15em',
        }}>click to dismiss</p>
      </motion.div>
    </div>
  );
};

export default ChargedCritModal;
