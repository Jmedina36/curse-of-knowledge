import React from 'react';
import { motion } from 'framer-motion';
import DiceD20 from './DiceD20';
import { sounds } from '../sounds';
import useEscapeClose from '../hooks/useEscapeClose';

const InitiativeModal = ({ data, onClose }) => {
  const { playerRoll, playerMod, playerTotal, enemyRoll, enemyMod, enemyTotal, playerFirst, decisive } = data;
  useEscapeClose(onClose);

  const tier = playerFirst
    ? (decisive ? 'decisive_win' : 'win')
    : (decisive ? 'decisive_loss' : 'loss');

  const config = {
    decisive_win: {
      label: 'You seize the initiative',
      sub: 'The enemy is caught off guard.',
      color: '#D4AF37',
      glow: 'rgba(212,175,55,0.7)',
      border: 'rgba(212,175,55,0.5)',
      bg: 'rgba(40,30,0,0.55)',
    },
    win: {
      label: 'You act first',
      sub: 'Press your advantage.',
      color: '#34D399',
      glow: 'rgba(52,211,153,0.6)',
      border: 'rgba(52,211,153,0.35)',
      bg: 'rgba(0,30,15,0.55)',
    },
    loss: {
      label: 'Enemy acts first',
      sub: 'Brace yourself.',
      color: '#FB923C',
      glow: 'rgba(251,146,60,0.6)',
      border: 'rgba(251,146,60,0.35)',
      bg: 'rgba(40,15,0,0.55)',
    },
    decisive_loss: {
      label: 'Overwhelmed',
      sub: 'You are stunned — cannot act on turn 1.',
      color: '#EF4444',
      glow: 'rgba(239,68,68,0.7)',
      border: 'rgba(239,68,68,0.45)',
      bg: 'rgba(40,0,0,0.55)',
    },
  }[tier];

  const playerColor = playerFirst ? config.color : 'rgba(245,245,220,0.22)';
  const playerGlow  = playerFirst ? config.glow  : 'rgba(245,245,220,0.08)';
  const enemyColor  = !playerFirst ? config.color : 'rgba(245,245,220,0.22)';
  const enemyGlow   = !playerFirst ? config.glow  : 'rgba(245,245,220,0.08)';

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.88)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: -32, scale: 0.88 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="rounded-xl text-center w-full max-w-sm overflow-hidden"
        style={{
          background: 'linear-gradient(to bottom, rgba(26,22,18,0.99), rgba(15,13,10,0.99))',
          border: `1px solid ${config.border}`,
          boxShadow: `0 0 40px ${config.glow.replace(/[\d.]+\)$/, '0.22)')}, 0 0 80px ${config.glow.replace(/[\d.]+\)$/, '0.08)')}`,
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          borderBottom: `1px solid ${config.border}`,
          padding: '14px 24px 12px',
          background: config.bg,
        }}>
          <p style={{
            fontFamily: 'Cinzel, serif', fontSize: '0.7rem', letterSpacing: '0.5em',
            textTransform: 'uppercase', color: 'rgba(245,245,220,0.3)', margin: 0,
          }}>
            Initiative
          </p>
        </div>

        {/* Dice row */}
        <div style={{ padding: '28px 20px 18px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>

          {/* Player */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.65rem', letterSpacing: '0.35em', color: 'rgba(245,245,220,0.3)', textTransform: 'uppercase', margin: 0 }}>
              You
            </p>
            <DiceD20 roll={playerRoll} color={playerColor} glow={playerGlow} size={82} rolling />
            <div>
              {playerMod !== 0 && (
                <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.6rem', color: 'rgba(245,245,220,0.35)', margin: '0 0 2px', textAlign: 'center' }}>
                  {playerRoll} {playerMod > 0 ? '+' : ''}{playerMod} DEX
                </p>
              )}
              <p style={{ fontFamily: 'Cinzel, serif', fontSize: '1.15rem', fontWeight: 900, color: playerColor, margin: 0,
                textShadow: playerFirst ? `0 0 14px ${playerGlow}` : 'none', textAlign: 'center' }}>
                {playerTotal}
              </p>
            </div>
          </div>

          {/* VS divider */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
            <div style={{ width: '1px', height: '36px', background: 'rgba(245,245,220,0.07)' }} />
            <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.75rem', fontWeight: 900, letterSpacing: '0.2em',
              color: 'rgba(245,245,220,0.18)', margin: 0 }}>VS</p>
            <div style={{ width: '1px', height: '36px', background: 'rgba(245,245,220,0.07)' }} />
          </div>

          {/* Enemy */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.65rem', letterSpacing: '0.35em', color: 'rgba(245,245,220,0.3)', textTransform: 'uppercase', margin: 0 }}>
              Enemy
            </p>
            <DiceD20 roll={enemyRoll} color={enemyColor} glow={enemyGlow} size={82} rolling />
            <div>
              {enemyMod !== 0 && (
                <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.6rem', color: 'rgba(245,245,220,0.35)', margin: '0 0 2px', textAlign: 'center' }}>
                  {enemyRoll} +{enemyMod} mod
                </p>
              )}
              <p style={{ fontFamily: 'Cinzel, serif', fontSize: '1.15rem', fontWeight: 900, color: enemyColor, margin: 0,
                textShadow: !playerFirst ? `0 0 14px ${enemyGlow}` : 'none', textAlign: 'center' }}>
                {enemyTotal}
              </p>
            </div>
          </div>
        </div>

        {/* Separator */}
        <div style={{ margin: '0 20px', height: '1px', background: `linear-gradient(to right, transparent, ${config.border}, transparent)` }} />

        {/* Result */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.52 }}
          style={{ padding: '16px 20px 10px' }}
        >
          <p style={{
            fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: '1rem',
            letterSpacing: '0.05em', color: config.color, margin: '0 0 5px',
            textShadow: `0 0 18px ${config.glow}`,
          }}>
            {config.label}
          </p>
          <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.75rem', color: 'rgba(245,245,220,0.4)', margin: 0, letterSpacing: '0.05em' }}>
            {config.sub}
          </p>
        </motion.div>

        {/* Begin Battle */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          style={{ padding: '12px 20px 22px' }}
        >
          <button
            onClick={() => { sounds.click(); onClose(); }}
            style={{
              width: '100%',
              fontFamily: 'Cinzel, serif', fontSize: '0.72rem', fontWeight: 700,
              letterSpacing: '0.3em', textTransform: 'uppercase',
              color: config.color, background: 'rgba(0,0,0,0.3)',
              border: `1px solid ${config.border}`,
              padding: '10px 0', borderRadius: '6px', cursor: 'pointer',
              animation: 'intro-hint-pulse 1.5s ease-in-out infinite',
            }}
          >
            Begin Battle
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default InitiativeModal;
