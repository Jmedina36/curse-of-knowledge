import React from 'react';
import { motion } from 'framer-motion';
import { sounds } from '../sounds';
import useEscapeClose from '../hooks/useEscapeClose';

const TIER_CONFIG = {
  platinum: {
    color: '#E8E8E8',
    glow: 'rgba(232,232,232,0.5)',
    border: 'rgba(220,220,220,0.4)',
    bg: 'linear-gradient(to bottom, rgba(8,8,16,0.99), rgba(4,4,10,0.99))',
    headerBg: 'rgba(20,20,32,0.6)',
    checkColor: '#E8E8E8',
    circleBorder: 'rgba(220,220,220,0.7)',
    circleBg: 'rgba(20,20,35,0.7)',
    circleGlow: 'rgba(220,220,220,0.25)',
    label: 'Platinum Contract',
    tagline: 'The guardian has been silenced.',
  },
  mythril: {
    color: '#7DF9FF',
    glow: 'rgba(125,249,255,0.5)',
    border: 'rgba(125,249,255,0.4)',
    bg: 'linear-gradient(to bottom, rgba(0,8,10,0.99), rgba(0,4,6,0.99))',
    headerBg: 'rgba(0,18,22,0.7)',
    checkColor: '#7DF9FF',
    circleBorder: 'rgba(125,249,255,0.7)',
    circleBg: 'rgba(0,20,25,0.8)',
    circleGlow: 'rgba(125,249,255,0.3)',
    label: 'Mythril Contract',
    tagline: 'The Gauntlet has fallen. Your name echoes through the guild.',
  },
};

const ContractFulfilledModal = ({ tasks, xpEarned, tier = 'platinum', onClose }) => {
  const cfg = TIER_CONFIG[tier] || TIER_CONFIG.platinum;
  useEscapeClose(onClose);
  const completedTasks = tasks.filter(t => t.done).length;
  const totalTasks = tasks.length;
  const allTasksDone = completedTasks === totalTasks && totalTasks > 0;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4"
      style={{ background: tier === 'mythril' ? 'rgba(0,0,0,0.96)' : 'rgba(0,0,0,0.92)' }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: -12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="rounded-xl text-center w-full max-w-sm overflow-hidden"
        style={{
          background: cfg.bg,
          border: `1px solid ${cfg.border}`,
          boxShadow: `0 0 48px ${cfg.glow.replace('0.5', '0.12')}, 0 0 100px ${cfg.glow.replace('0.5', '0.05')}`,
        }}
      >
        {/* Header stripe */}
        <div style={{ borderBottom: `1px solid ${cfg.border.replace('0.4', '0.12')}`, padding: '14px 24px 12px', background: cfg.headerBg }}>
          <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.65rem', letterSpacing: '0.5em', textTransform: 'uppercase', color: cfg.color, margin: 0, opacity: 0.6 }}>
            {cfg.label}
          </p>
        </div>

        {/* Seal */}
        <div style={{ padding: '32px 24px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
          <motion.div
            initial={{ scale: 1.6, opacity: 0, rotate: tier === 'mythril' ? 6 : -6 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ delay: 0.18, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            style={{
              width: 96, height: 96, borderRadius: '50%',
              border: `3px solid ${cfg.circleBorder}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 0 28px ${cfg.circleGlow}, inset 0 0 16px ${cfg.circleGlow.replace('0.3', '0.06')}`,
              background: cfg.circleBg,
            }}
          >
            {tier === 'mythril' ? (
              /* Mythril: rune-like star instead of checkmark */
              <svg viewBox="0 0 60 60" width={44} height={44}>
                <motion.polygon
                  points="30,6 34,24 52,24 38,35 43,53 30,42 17,53 22,35 8,24 26,24"
                  fill="none"
                  stroke="#7DF9FF"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                  initial={{ opacity: 0, scale: 0.4 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  style={{ transformOrigin: '30px 30px' }}
                />
              </svg>
            ) : (
              <svg viewBox="0 0 60 60" width={48} height={48}>
                <motion.polyline
                  points="8,30 22,44 52,16"
                  fill="none"
                  stroke={cfg.checkColor}
                  strokeWidth="4.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 0.42, duration: 0.45, ease: 'easeOut' }}
                />
              </svg>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.3 }}
          >
            <p style={{
              fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: '1.1rem',
              letterSpacing: '0.2em', textTransform: 'uppercase',
              color: cfg.color, textShadow: `0 0 22px ${cfg.glow}`,
              margin: '0 0 4px',
            }}>
              Contract Fulfilled
            </p>
            <p style={{ fontFamily: 'EB Garamond, serif', fontStyle: 'italic', fontSize: '0.78rem', letterSpacing: '0.04em', color: 'rgba(245,245,220,0.7)', margin: 0 }}>
              {cfg.tagline}
            </p>
          </motion.div>
        </div>

        {/* Separator */}
        <div style={{ margin: '0 20px', height: '1px', background: `linear-gradient(to right, transparent, ${cfg.border}, transparent)` }} />

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.72 }}
          style={{ padding: '18px 28px' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-around' }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{
                fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: '1.4rem',
                color: allTasksDone ? cfg.color : '#FBBF24',
                textShadow: allTasksDone ? `0 0 14px ${cfg.glow.replace('0.5','0.4')}` : '0 0 14px rgba(251,191,36,0.4)',
                margin: '0 0 3px',
              }}>
                {completedTasks}/{totalTasks}
              </p>
              <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.5rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(245,245,220,0.7)', margin: 0 }}>
                Tasks
              </p>
            </div>
            <div style={{ width: '1px', background: 'rgba(245,245,220,0.07)', margin: '0 8px' }} />
            <div style={{ textAlign: 'center' }}>
              <p style={{
                fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: '1.4rem',
                color: '#D4AF37', textShadow: '0 0 14px rgba(212,175,55,0.5)',
                margin: '0 0 3px',
              }}>
                +{xpEarned}
              </p>
              <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.5rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(245,245,220,0.7)', margin: 0 }}>
                XP
              </p>
            </div>
          </div>
        </motion.div>

        {/* Separator */}
        <div style={{ margin: '0 20px', height: '1px', background: `linear-gradient(to right, transparent, ${cfg.border.replace('0.4','0.1')}, transparent)` }} />

        {/* Continue */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          style={{ padding: '16px 20px 22px' }}
        >
          <button
            onClick={() => { sounds.click(); onClose(); }}
            style={{
              width: '100%',
              fontFamily: 'Cinzel, serif', fontSize: '0.72rem', fontWeight: 700,
              letterSpacing: '0.3em', textTransform: 'uppercase',
              color: cfg.color, background: 'rgba(0,0,0,0.3)',
              border: `1px solid ${cfg.border}`,
              padding: '10px 0', borderRadius: '6px', cursor: 'pointer',
              animation: 'intro-hint-pulse 1.5s ease-in-out infinite',
            }}
          >
            Continue
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ContractFulfilledModal;
