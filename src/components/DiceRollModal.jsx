import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DiceD20 from './DiceD20';

const ROLL_CONFIG = {
  fumble: {
    label: 'FUMBLE!',
    color: '#EF4444',
    glow: 'rgba(239,68,68,0.6)',
    bg: 'rgba(80,10,10,0.5)',
    messages: [
      "A cursed fumble! The knowledge slips through your fingers...",
      "Your quill snaps at the worst possible moment.",
      "You trip over your own spellbook. Embarrassing.",
      "The curse laughs. You carry on anyway.",
    ],
  },
  low: {
    label: 'LOW ROLL',
    color: '#9CA3AF',
    glow: 'rgba(156,163,175,0.4)',
    bg: 'rgba(30,30,40,0.5)',
    messages: [
      "A modest effort. The knowledge takes root, slowly.",
      "You push through, though your mind wanders.",
      "Progress, however slow, is still progress.",
      "The dice were not kind. But you showed up.",
    ],
  },
  mid: {
    label: 'SOLID ROLL',
    color: '#34D399',
    glow: 'rgba(52,211,153,0.5)',
    bg: 'rgba(10,40,30,0.5)',
    messages: [
      "Solid work. The knowledge settles in.",
      "A competent effort. The realm takes note.",
      "Your focus holds. Well done, scholar.",
      "Another step forward. The curse weakens.",
    ],
  },
  high: {
    label: 'GREAT ROLL',
    color: '#60A5FA',
    glow: 'rgba(96,165,250,0.6)',
    bg: 'rgba(10,20,50,0.5)',
    messages: [
      "Excellent! Your focus was exceptional today.",
      "The knowledge burns bright in your mind.",
      "A remarkable effort. The curse retreats.",
      "The archives whisper your name in reverence.",
    ],
  },
  nat20: {
    label: 'NATURAL 20!',
    color: '#F59E0B',
    glow: 'rgba(245,158,11,0.85)',
    bg: 'rgba(50,35,0,0.5)',
    messages: [
      "NATURAL 20! The stars align! Knowledge floods your mind!",
      "CRITICAL SUCCESS! Legends will speak of this session!",
      "The gods of knowledge smile upon you!",
      "An achievement for the ages. The curse cowers.",
    ],
  },
};

const getConfig = (roll) => {
  if (roll === 1)  return ROLL_CONFIG.fumble;
  if (roll <= 9)   return ROLL_CONFIG.low;
  if (roll <= 14)  return ROLL_CONFIG.mid;
  if (roll <= 19)  return ROLL_CONFIG.high;
  return ROLL_CONFIG.nat20;
};

const DiceRollModal = ({ roll, bonusXP, bonusGold, onClose }) => {
  const config = getConfig(roll);
  const [msgIdx] = useState(() => Math.floor(Math.random() * config.messages.length));
  const [showBonus, setShowBonus] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowBonus(true), 800);
    return () => clearTimeout(t);
  }, []);

  const hasBonus = bonusXP > 0 || bonusGold > 0;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ background: 'rgba(0,0,0,0.85)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.75, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        onClick={e => e.stopPropagation()}
        className="rounded-xl p-8 text-center max-w-xs w-full"
        style={{
          background: `linear-gradient(to bottom, rgba(8,8,18,0.98), rgba(4,4,12,0.98))`,
          border: `2px solid ${config.color}`,
          boxShadow: `0 0 25px ${config.glow}, 0 0 60px ${config.glow.replace(/[\d.]+\)$/, '0.25)')}`,
        }}
      >
        {/* D20 die */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
          <DiceD20 roll={roll} color={config.color} glow={config.glow} size={100} rolling />
        </div>

        {/* Label */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
          style={{
            fontFamily: 'Cinzel, serif',
            fontSize: '1rem',
            fontWeight: 900,
            letterSpacing: '0.2em',
            color: config.color,
            textShadow: `0 0 10px ${config.glow}`,
            marginBottom: '10px',
          }}
        >{config.label}</motion.p>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.5, duration: 0.3 }}
          style={{ height: '1px', background: `linear-gradient(to right, transparent, ${config.color}, transparent)`, marginBottom: '10px' }}
        />

        {/* Message */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
          style={{
            fontFamily: 'Cinzel, serif',
            fontSize: '0.75rem',
            color: 'rgba(245,245,220,0.7)',
            fontStyle: 'italic',
            lineHeight: 1.6,
            marginBottom: hasBonus ? '14px' : '20px',
          }}
        >"{config.messages[msgIdx]}"</motion.p>

        {/* Bonuses */}
        {showBonus && hasBonus && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg p-3 mb-4"
            style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.35)' }}
          >
            {bonusXP > 0 && (
              <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.85rem', fontWeight: 700, color: '#D4AF37' }}>
                +{bonusXP} Bonus XP
              </p>
            )}
            {bonusGold > 0 && (
              <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.85rem', fontWeight: 700, color: '#D4AF37', marginTop: bonusXP > 0 ? '4px' : 0 }}>
                +{bonusGold} Gold
              </p>
            )}
          </motion.div>
        )}

        {/* Close button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.85 }}
          onClick={onClose}
          className="w-full py-2 rounded-lg transition-opacity hover:opacity-80"
          style={{
            background: 'rgba(0,0,0,0.4)',
            border: `1px solid ${config.color}`,
            color: config.color,
            fontFamily: 'Cinzel, serif',
            fontSize: '0.7rem',
            letterSpacing: '0.25em',
            cursor: 'pointer',
          }}
        >CONTINUE</motion.button>
      </motion.div>
    </div>
  );
};

export default DiceRollModal;
