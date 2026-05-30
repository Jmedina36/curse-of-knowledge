import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DiceD20 from './DiceD20';

const rollOne = (conMod) => {
  const roll = Math.ceil(Math.random() * 20);
  const adjusted = roll + conMod;
  if (roll === 20) return { roll, nat20: true, success: true };
  if (roll === 1)  return { roll, nat1: true, success: false, doubleFail: true };
  return { roll, success: adjusted >= 10 };
};

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

  const SLOTS = 3;

  const dieColor = (r) => r.nat20 ? '#F59E0B' : r.success ? '#34D399' : '#EF4444';
  const dieGlow  = (r) => r.nat20 ? 'rgba(245,158,11,0.6)' : r.success ? 'rgba(52,211,153,0.6)' : 'rgba(239,68,68,0.6)';

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.93)' }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.88 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="rounded-xl p-7 text-center max-w-sm w-full"
        style={{
          background: 'linear-gradient(to bottom, rgba(14,0,0,0.99), rgba(6,4,12,0.99))',
          border: '2px solid rgba(239,68,68,0.55)',
          boxShadow: '0 0 40px rgba(239,68,68,0.22), 0 0 80px rgba(239,68,68,0.08)',
        }}
      >
        {/* Header */}
        <div style={{ borderBottom: '1px solid rgba(239,68,68,0.25)', paddingBottom: '12px', marginBottom: '22px' }}>
          <p style={{
            fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: '1rem',
            letterSpacing: '0.2em', color: '#EF4444',
            textShadow: '0 0 14px rgba(239,68,68,0.65)',
          }}>💀 DEATH SAVES</p>
          <p style={{
            fontFamily: 'Cinzel, serif', fontSize: '0.62rem',
            color: 'rgba(245,245,220,0.35)', marginTop: '5px',
          }}>
            {conMod !== 0
              ? `CON ${conMod > 0 ? `+${conMod}` : conMod} · need ${10 - conMod}+`
              : 'No modifier · need 10+'}
          </p>
        </div>

        {/* Dice row */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', marginBottom: '22px' }}>
          {Array.from({ length: SLOTS }).map((_, i) => {
            const r = revealed[i];
            if (!r) {
              return (
                <div key={i} style={{
                  width: '72px', height: '72px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  opacity: 0.3,
                }}>
                  {/* Ghost D20 outline */}
                  <svg viewBox="0 0 100 100" width={72} height={72} style={{ overflow: 'visible' }}>
                    <polygon
                      points="50,4 91,27 96,63 74,93 26,93 4,63 9,27"
                      fill="none"
                      stroke="rgba(245,245,220,0.2)"
                      strokeWidth="2"
                    />
                    <text x="50" y="55" textAnchor="middle" dominantBaseline="middle"
                      fill="rgba(245,245,220,0.15)" fontFamily="Cinzel,serif" fontWeight="900" fontSize="22">?</text>
                  </svg>
                </div>
              );
            }

            return (
              <div key={i}>
                <DiceD20
                  roll={r.roll}
                  color={dieColor(r)}
                  glow={dieGlow(r)}
                  size={72}
                  rolling={false}
                />
                <p style={{
                  fontFamily: 'Cinzel, serif', fontSize: '0.7rem', fontWeight: 700,
                  color: dieColor(r), marginTop: '4px', lineHeight: 1,
                }}>
                  {r.nat20 ? '⚡ CRIT!' : r.nat1 ? '☠ x2' : r.success ? '✓' : '✗'}
                </p>
              </div>
            );
          })}
        </div>

        {/* Outcome */}
        {done ? (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <p style={{
              fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: '1.1rem',
              letterSpacing: '0.1em',
              color: survived ? '#34D399' : '#EF4444',
              textShadow: `0 0 20px ${survived ? 'rgba(52,211,153,0.8)' : 'rgba(239,68,68,0.8)'}`,
              marginBottom: '8px',
            }}>
              {survived ? '💪 YOU STABILIZE!' : '☠ FALLEN...'}
            </p>
            <p style={{
              fontFamily: 'Cinzel, serif', fontSize: '0.68rem',
              color: 'rgba(245,245,220,0.38)', marginBottom: '20px',
            }}>
              {survived ? 'Restored to 1 HP. Fight on, hero.' : 'The curse grows stronger.'}
            </p>
            <button
              onClick={() => onClose(survived)}
              style={{
                fontFamily: 'Cinzel, serif', fontSize: '0.7rem', letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: survived ? '#34D399' : '#EF4444',
                background: 'rgba(0,0,0,0.4)',
                border: `1px solid ${survived ? 'rgba(52,211,153,0.4)' : 'rgba(239,68,68,0.4)'}`,
                padding: '10px 32px', borderRadius: '8px', cursor: 'pointer',
              }}
            >
              Continue
            </button>
          </motion.div>
        ) : (
          <p style={{
            fontFamily: 'Cinzel, serif', fontSize: '0.68rem',
            color: 'rgba(245,245,220,0.28)',
            animation: 'intro-hint-pulse 1.5s ease-in-out infinite',
          }}>Rolling...</p>
        )}
      </motion.div>
    </div>
  );
};

export default DeathSaveModal;
