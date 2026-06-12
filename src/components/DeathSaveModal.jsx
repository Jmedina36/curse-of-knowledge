import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DiceD20 from './DiceD20';
import { sounds } from '../sounds';

const rollOne = (conMod) => {
  const roll = Math.ceil(Math.random() * 20);
  const adjusted = roll + conMod;
  if (roll === 20) return { roll, nat20: true,  success: true };
  if (roll === 1)  return { roll, nat1: true,   success: false, doubleFail: true };
  return { roll, success: adjusted >= 10 };
};

const dieColor = (r) => r.nat20 ? '#D4AF37' : r.success ? '#34D399' : '#EF4444';
const dieGlow  = (r) => r.nat20 ? 'rgba(212,175,55,0.65)' : r.success ? 'rgba(52,211,153,0.6)' : 'rgba(239,68,68,0.6)';

const dieLabel = (r) => {
  if (r.nat20)      return { text: 'Miracle',     color: '#D4AF37' };
  if (r.doubleFail) return { text: 'Double Fail', color: '#EF4444' };
  if (r.success)    return { text: 'Success',      color: '#34D399' };
  return              { text: 'Failed',            color: '#EF4444' };
};

const GhostDie = () => (
  <svg viewBox="0 0 100 100" width={72} height={72} style={{ overflow: 'visible' }}>
    <polygon
      points="50,4 91,27 96,63 74,93 26,93 4,63 9,27"
      fill="none" stroke="rgba(245,245,220,0.1)" strokeWidth="2"
    />
    <text x="50" y="55" textAnchor="middle" dominantBaseline="middle"
      fill="rgba(245,245,220,0.08)" fontFamily="Cinzel,serif" fontWeight="900" fontSize="22">
      ?
    </text>
  </svg>
);

const DeathSaveModal = ({ conMod, onClose }) => {
  const [revealed, setRevealed] = useState([]);
  const [done, setDone]         = useState(false);
  const [survived, setSurvived] = useState(false);

  useEffect(() => {
    const rolls = [];
    let successes = 0, failures = 0, terminated = false;

    for (let i = 0; i < 3 && !terminated; i++) {
      const r = rollOne(conMod);
      rolls.push(r);
      if (r.nat20) { terminated = true; break; }
      if (r.doubleFail) failures += 2;
      else if (r.success) successes++;
      else failures++;
      if (successes >= 3 || failures >= 3) terminated = true;
    }

    const finalSurvived = rolls.some(r => r.nat20) || successes >= 3;

    rolls.forEach((r, i) => {
      setTimeout(() => setRevealed(prev => [...prev, r]), 500 + i * 950);
    });
    setTimeout(() => {
      setSurvived(finalSurvived);
      setDone(true);
    }, 500 + rolls.length * 950 + 700);
  }, [conMod]);

  const outcomeColor = survived ? '#34D399' : '#EF4444';
  const outcomeGlow  = survived ? 'rgba(52,211,153,0.7)' : 'rgba(239,68,68,0.7)';

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.93)' }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.88, y: -16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="rounded-xl text-center w-full max-w-sm overflow-hidden"
        style={{
          background: 'linear-gradient(to bottom, rgba(10,0,0,0.99), rgba(4,3,10,0.99))',
          border: '1px solid rgba(239,68,68,0.4)',
          boxShadow: '0 0 40px rgba(239,68,68,0.16), 0 0 80px rgba(239,68,68,0.06)',
        }}
      >
        {/* Header */}
        <div style={{
          borderBottom: '1px solid rgba(239,68,68,0.18)',
          padding: '16px 24px 14px',
          background: 'rgba(40,0,0,0.5)',
        }}>
          <p style={{
            fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: '0.9rem',
            letterSpacing: '0.25em', textTransform: 'uppercase',
            color: '#EF4444', textShadow: '0 0 16px rgba(239,68,68,0.55)',
            margin: '0 0 5px',
          }}>
            Death Saves
          </p>
          <p style={{
            fontFamily: 'Cinzel, serif', fontSize: '0.6rem', letterSpacing: '0.1em',
            color: 'rgba(245,245,220,0.3)', margin: 0,
          }}>
            {conMod !== 0
              ? `CON ${conMod > 0 ? `+${conMod}` : conMod} · need ${10 - conMod}+`
              : 'No modifier · need 10+'}
          </p>
        </div>

        {/* Dice row */}
        <div style={{ padding: '28px 24px 20px', display: 'flex', justifyContent: 'center', gap: '18px' }}>
          {Array.from({ length: 3 }).map((_, i) => {
            const r = revealed[i];
            if (!r) {
              return (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                  <GhostDie />
                  <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.65rem', letterSpacing: '0.1em', color: 'rgba(245,245,220,0.15)', margin: 0 }}>
                    —
                  </p>
                </div>
              );
            }
            const label = dieLabel(r);
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.7, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}
              >
                <DiceD20 roll={r.roll} color={dieColor(r)} glow={dieGlow(r)} size={72} rolling={false} />
                <p style={{
                  fontFamily: 'Cinzel, serif', fontSize: '0.65rem', fontWeight: 700,
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                  color: label.color, margin: 0,
                  textShadow: `0 0 8px ${dieGlow(r)}`,
                }}>
                  {label.text}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Separator */}
        <div style={{ margin: '0 20px', height: '1px', background: 'linear-gradient(to right, transparent, rgba(239,68,68,0.22), transparent)' }} />

        {/* Outcome */}
        <div style={{ padding: '18px 20px 24px' }}>
          {done ? (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <p style={{
                fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: '1.05rem',
                letterSpacing: '0.1em', textTransform: 'uppercase',
                color: outcomeColor, textShadow: `0 0 20px ${outcomeGlow}`,
                margin: '0 0 6px',
              }}>
                {survived ? 'You Stabilize' : 'Fallen'}
              </p>
              <p style={{
                fontFamily: 'Cinzel, serif', fontSize: '0.75rem',
                color: 'rgba(245,245,220,0.35)', margin: '0 0 18px', letterSpacing: '0.05em',
              }}>
                {survived ? 'Restored to 1 HP. The fight is not over.' : 'The curse claims what remains.'}
              </p>
              <button
                onClick={() => { sounds.click(); onClose(survived); }}
                style={{
                  width: '100%',
                  fontFamily: 'Cinzel, serif', fontSize: '0.72rem', fontWeight: 700,
                  letterSpacing: '0.3em', textTransform: 'uppercase',
                  color: outcomeColor, background: 'rgba(0,0,0,0.3)',
                  border: `1px solid ${survived ? 'rgba(52,211,153,0.35)' : 'rgba(239,68,68,0.35)'}`,
                  padding: '10px 0', borderRadius: '6px', cursor: 'pointer',
                  animation: 'intro-hint-pulse 1.5s ease-in-out infinite',
                }}
              >
                Continue
              </button>
            </motion.div>
          ) : (
            <p style={{
              fontFamily: 'Cinzel, serif', fontSize: '0.75rem', letterSpacing: '0.15em',
              color: 'rgba(245,245,220,0.22)',
              animation: 'intro-hint-pulse 1.5s ease-in-out infinite',
              margin: 0,
            }}>
              Rolling...
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default DeathSaveModal;
