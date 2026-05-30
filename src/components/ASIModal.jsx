import React, { useState } from 'react';
import { motion } from 'framer-motion';

const STAT_INFO = {
  str: { short: 'STR', desc: 'Attack damage (+1 per mod)' },
  dex: { short: 'DEX', desc: 'Initiative & dodge (3% per mod)' },
  con: { short: 'CON', desc: 'Max HP & death save DC' },
  int: { short: 'INT', desc: 'XP gain (+2% per mod)' },
  wis: { short: 'WIS', desc: 'Damage reduction (2% per mod)' },
  cha: { short: 'CHA', desc: 'Combat gold (+5% per mod)' },
};

const modStr = (score) => { const m = Math.floor((score - 10) / 2); return m >= 0 ? `+${m}` : `${m}`; };

const ASIModal = ({ hero, newLevel, onClose }) => {
  const [mode, setMode] = useState('one');
  const [selected, setSelected] = useState([]);

  const abilities = hero?.abilities || { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 };

  const handleStatClick = (stat) => {
    if (mode === 'one') {
      setSelected([stat]);
    } else {
      if (selected.includes(stat)) {
        setSelected(selected.filter(s => s !== stat));
      } else if (selected.length < 2) {
        setSelected([...selected, stat]);
      } else {
        setSelected([selected[1], stat]);
      }
    }
  };

  const canConfirm = mode === 'one' ? selected.length === 1 : selected.length === 2;

  const handleConfirm = () => {
    const ab = { ...abilities };
    if (mode === 'one') {
      ab[selected[0]] = (ab[selected[0]] || 10) + 2;
    } else {
      ab[selected[0]] = (ab[selected[0]] || 10) + 1;
      ab[selected[1]] = (ab[selected[1]] || 10) + 1;
    }
    onClose(ab);
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.88)' }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.88, y: -16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="rounded-xl p-6 w-full max-w-sm"
        style={{
          background: 'linear-gradient(to bottom, rgba(8,8,22,0.99), rgba(4,4,14,0.99))',
          border: '2px solid rgba(212,175,55,0.6)',
          boxShadow: '0 0 32px rgba(212,175,55,0.25), 0 0 80px rgba(212,175,55,0.08)',
        }}
      >
        <p style={{
          fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: '0.85rem',
          letterSpacing: '0.22em', color: '#D4AF37',
          textShadow: '0 0 14px rgba(212,175,55,0.6)', textAlign: 'center', marginBottom: '4px',
        }}>ABILITY SCORE IMPROVEMENT</p>
        <p style={{
          fontFamily: 'Cinzel, serif', fontSize: '0.6rem', letterSpacing: '0.15em',
          color: 'rgba(245,245,220,0.4)', textAlign: 'center', marginBottom: '18px',
        }}>LEVEL {newLevel} — CHOOSE YOUR ADVANCEMENT</p>

        {/* Mode toggle */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          {[
            { key: 'one', label: '+2 to One Stat' },
            { key: 'two', label: '+1 to Two Stats' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => { setMode(key); setSelected([]); }}
              style={{
                flex: 1, fontFamily: 'Cinzel, serif', fontSize: '0.6rem',
                letterSpacing: '0.1em', padding: '7px 4px', borderRadius: '6px', cursor: 'pointer',
                background: mode === key ? 'rgba(212,175,55,0.18)' : 'rgba(0,0,0,0.3)',
                border: `1px solid ${mode === key ? 'rgba(212,175,55,0.7)' : 'rgba(245,245,220,0.15)'}`,
                color: mode === key ? '#D4AF37' : 'rgba(245,245,220,0.4)',
              }}
            >{label}</button>
          ))}
        </div>

        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '18px' }}>
          {Object.entries(STAT_INFO).map(([key, info]) => {
            const score = abilities[key] || 10;
            const isSelected = selected.includes(key);
            const preview = isSelected ? score + (mode === 'one' ? 2 : 1) : null;
            return (
              <motion.button
                key={key}
                whileTap={{ scale: 0.96 }}
                onClick={() => handleStatClick(key)}
                style={{
                  textAlign: 'left', padding: '10px 12px', borderRadius: '8px', cursor: 'pointer',
                  background: isSelected ? 'rgba(212,175,55,0.14)' : 'rgba(0,0,0,0.35)',
                  border: `1px solid ${isSelected ? 'rgba(212,175,55,0.65)' : 'rgba(245,245,220,0.1)'}`,
                  boxShadow: isSelected ? '0 0 12px rgba(212,175,55,0.2)' : 'none',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '3px' }}>
                  <span style={{
                    fontFamily: 'Cinzel, serif', fontSize: '0.72rem', fontWeight: 700,
                    color: isSelected ? '#D4AF37' : 'rgba(245,245,220,0.85)',
                  }}>{info.short}</span>
                  <span style={{
                    fontFamily: 'Cinzel, serif', fontSize: '0.78rem', fontWeight: 900,
                    color: isSelected ? '#D4AF37' : 'rgba(245,245,220,0.9)',
                  }}>
                    {preview
                      ? <>{score}<span style={{ color: '#34D399', fontSize: '0.68rem' }}>→{preview}</span></>
                      : score}
                    <span style={{ fontSize: '0.58rem', marginLeft: '3px', color: 'rgba(245,245,220,0.4)', fontWeight: 400 }}>
                      ({modStr(preview ?? score)})
                    </span>
                  </span>
                </div>
                <p style={{
                  fontFamily: 'Cinzel, serif', fontSize: '0.55rem',
                  color: 'rgba(245,245,220,0.38)', lineHeight: 1.3, margin: 0,
                }}>{info.desc}</p>
              </motion.button>
            );
          })}
        </div>

        {/* Confirm */}
        <button
          onClick={handleConfirm}
          disabled={!canConfirm}
          style={{
            width: '100%', fontFamily: 'Cinzel, serif', fontSize: '0.72rem',
            letterSpacing: '0.22em', textTransform: 'uppercase',
            padding: '11px', borderRadius: '8px', cursor: canConfirm ? 'pointer' : 'not-allowed',
            background: canConfirm ? 'rgba(212,175,55,0.18)' : 'rgba(0,0,0,0.2)',
            border: `1px solid ${canConfirm ? 'rgba(212,175,55,0.7)' : 'rgba(245,245,220,0.1)'}`,
            color: canConfirm ? '#D4AF37' : 'rgba(245,245,220,0.2)',
          }}
        >
          {canConfirm
            ? 'Confirm Advancement'
            : mode === 'one' ? 'Select a stat' : `Select ${2 - selected.length} more`}
        </button>
      </motion.div>
    </div>
  );
};

export default ASIModal;
