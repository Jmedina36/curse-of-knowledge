import React from 'react';
import { motion } from 'framer-motion';
import { sounds } from '../sounds';

const ContractFulfilledModal = ({ tasks, xpEarned, onClose }) => {
  const completedTasks = tasks.filter(t => t.done).length;
  const totalTasks = tasks.length;
  const allTasksDone = completedTasks === totalTasks && totalTasks > 0;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.92)' }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: -12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.36, ease: [0.16, 1, 0.3, 1] }}
        className="rounded-xl text-center w-full max-w-sm overflow-hidden"
        style={{
          background: 'linear-gradient(to bottom, rgba(8,12,4,0.99), rgba(4,8,2,0.99))',
          border: '1px solid rgba(52,211,153,0.35)',
          boxShadow: '0 0 48px rgba(52,211,153,0.12), 0 0 100px rgba(52,211,153,0.05)',
        }}
      >
        {/* Header stripe */}
        <div style={{
          borderBottom: '1px solid rgba(52,211,153,0.15)',
          padding: '14px 24px 12px',
          background: 'rgba(0,25,12,0.6)',
        }}>
          <p style={{
            fontFamily: 'Cinzel, serif', fontSize: '0.55rem', letterSpacing: '0.5em',
            textTransform: 'uppercase', color: 'rgba(245,245,220,0.28)', margin: 0,
          }}>
            Blood Contract
          </p>
        </div>

        {/* Seal stamp */}
        <div style={{ padding: '32px 24px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
          <motion.div
            initial={{ scale: 1.6, opacity: 0, rotate: -6 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ delay: 0.18, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            style={{
              width: 96, height: 96,
              borderRadius: '50%',
              border: '3px solid rgba(52,211,153,0.7)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 24px rgba(52,211,153,0.3), inset 0 0 16px rgba(52,211,153,0.08)',
              background: 'rgba(0,30,15,0.6)',
            }}
          >
            <svg viewBox="0 0 60 60" width={48} height={48}>
              <motion.polyline
                points="8,30 22,44 52,16"
                fill="none"
                stroke="#34D399"
                strokeWidth="4.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.42, duration: 0.45, ease: 'easeOut' }}
              />
            </svg>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.3 }}
          >
            <p style={{
              fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: '1.1rem',
              letterSpacing: '0.18em', textTransform: 'uppercase',
              color: '#34D399', textShadow: '0 0 22px rgba(52,211,153,0.6)',
              margin: '0 0 4px',
            }}>
              Contract Fulfilled
            </p>
            <p style={{
              fontFamily: 'Cinzel, serif', fontSize: '0.6rem', letterSpacing: '0.1em',
              color: 'rgba(245,245,220,0.3)', margin: 0,
            }}>
              The guardian has been silenced.
            </p>
          </motion.div>
        </div>

        {/* Separator */}
        <div style={{ margin: '0 20px', height: '1px', background: 'linear-gradient(to right, transparent, rgba(52,211,153,0.18), transparent)' }} />

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
                color: allTasksDone ? '#34D399' : '#FBBF24',
                textShadow: allTasksDone ? '0 0 14px rgba(52,211,153,0.5)' : '0 0 14px rgba(251,191,36,0.4)',
                margin: '0 0 3px',
              }}>
                {completedTasks}/{totalTasks}
              </p>
              <p style={{
                fontFamily: 'Cinzel, serif', fontSize: '0.5rem', letterSpacing: '0.2em',
                textTransform: 'uppercase', color: 'rgba(245,245,220,0.3)', margin: 0,
              }}>
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
              <p style={{
                fontFamily: 'Cinzel, serif', fontSize: '0.5rem', letterSpacing: '0.2em',
                textTransform: 'uppercase', color: 'rgba(245,245,220,0.3)', margin: 0,
              }}>
                XP
              </p>
            </div>
          </div>
        </motion.div>

        {/* Separator */}
        <div style={{ margin: '0 20px', height: '1px', background: 'linear-gradient(to right, transparent, rgba(52,211,153,0.12), transparent)' }} />

        {/* Continue button */}
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
              fontFamily: 'Cinzel, serif', fontSize: '0.62rem', fontWeight: 700,
              letterSpacing: '0.28em', textTransform: 'uppercase',
              color: '#34D399', background: 'rgba(0,0,0,0.3)',
              border: '1px solid rgba(52,211,153,0.35)',
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
