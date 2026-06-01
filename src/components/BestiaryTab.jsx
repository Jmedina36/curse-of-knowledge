import React, { useState, useEffect } from 'react';
import { COLORS } from '../constants';

const KAEL_IDLE = [
  "Every beast in here was defeated by your hand. Remember that.",
  "Study them well. A hunter who knows her prey never loses.",
  "They're contained... for now. Don't get sentimental.",
  "Each one tells a story. Most of them end with you winning.",
  "I've tracked creatures across a hundred realms. These are worthy trophies.",
  "The weak hunter fears the monster. The strong one collects it.",
  "Capture enough and the wilds themselves will fear your name.",
];

const TIER_LABELS = { 1: 'Common', 2: 'Elite', 3: 'Legendary' };
const TIER_COLORS = { 1: '#C0C0C0', 2: '#A855F7', 3: '#F59E0B' };
const TIER_BORDER = { 1: 'rgba(192,192,192,0.35)', 2: 'rgba(168,85,247,0.45)', 3: 'rgba(245,158,11,0.55)' };
const TIER_GLOW   = { 1: 'rgba(192,192,192,0.08)', 2: 'rgba(168,85,247,0.12)', 3: 'rgba(245,158,11,0.15)' };

const getMonsterImg = (monster) => {
  if (monster.tier === 3) return '/undead-king.png';
  if (monster.tier === 2) {
    const ELITE_IMGS = [
      '/bosses/frozen-zombie.png',
      '/bosses/undead-vampire-woman.png',
      '/bosses/orc-chief.png',
      '/bosses/orc-lady.png',
      '/bosses/orc-warrior.png',
    ];
    const seed = monster.name.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    return ELITE_IMGS[seed % ELITE_IMGS.length];
  }
  const idx = monster.creatureIdx != null ? monster.creatureIdx : (monster.id % 8);
  return `/creatures/creature${1 + (idx % 8)}.png`;
};

const BestiaryTab = ({ capturedMonsters, setCapturedMonsters, addLog }) => {
  const [kaelQuote, setKaelQuote] = useState(() => KAEL_IDLE[Math.floor(Math.random() * KAEL_IDLE.length)]);

  useEffect(() => {
    const t = setInterval(() => {
      setKaelQuote(KAEL_IDLE[Math.floor(Math.random() * KAEL_IDLE.length)]);
    }, 8000);
    return () => clearInterval(t);
  }, []);

  const releaseMonster = (monster) => {
    if (!window.confirm(`Release ${monster.name} back into the wilds?`)) return;
    setCapturedMonsters(prev => prev.filter(m => m.id !== monster.id));
    addLog(`Released ${monster.name} from the stable.`);
    setKaelQuote("Gone. Don't mourn it. There are always more.");
  };

  return (
    <div className="bg-black bg-opacity-50 rounded-xl p-6 border-2" style={{ borderColor: 'rgba(212, 175, 55, 0.6)' }}>

      {/* Kael the Beast Warden */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '20px',
        padding: '16px 20px', marginBottom: '24px', borderRadius: '12px',
        background: 'rgba(10,8,4,0.7)', border: '1px solid rgba(212,175,55,0.25)',
        boxShadow: '0 2px 16px rgba(0,0,0,0.4)',
      }}>
        <img
          src="/npcs/female-warrior.png"
          alt="Kael"
          style={{
            width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', objectPosition: 'top',
            flexShrink: 0, border: '2px solid rgba(212,175,55,0.6)',
            boxShadow: '0 0 20px rgba(34,197,94,0.25)',
          }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontFamily: 'Cinzel, serif', fontSize: '13px', fontWeight: 700, color: COLORS.gold, letterSpacing: '0.12em', marginBottom: '2px' }}>KAEL</p>
          <p style={{ fontSize: '11px', color: COLORS.silver, fontStyle: 'italic', marginBottom: '10px' }}>Beast Warden</p>
          <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(20,15,5,0.8)', border: '1px solid rgba(212,175,55,0.3)' }}>
            <p style={{ fontFamily: 'Cinzel, serif', fontSize: '12px', color: '#F5F5DC', fontStyle: 'italic', lineHeight: 1.5, margin: 0 }}>
              "{kaelQuote}"
            </p>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="text-center mb-4">
        <h2 className="text-4xl font-bold mb-4" style={{ color: '#D4AF37', letterSpacing: '0.15em' }}>THE BESTIARY</h2>
        <div className="flex items-center justify-center gap-2">
          <div style={{ width: '80px', height: '1px', background: 'linear-gradient(to right, transparent, rgba(212,175,55,0.5))' }} />
          <span style={{ color: 'rgba(212,175,55,0.6)', fontSize: '8px' }}>◆</span>
          <div style={{ width: '80px', height: '1px', background: 'linear-gradient(to left, transparent, rgba(212,175,55,0.5))' }} />
        </div>
      </div>
      <p className="text-sm mb-6 italic text-center" style={{ color: COLORS.silver }}>
        "Creatures bound by victory, kept as proof of your dominion..."
      </p>

      {/* Stable capacity bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
        marginBottom: '24px', fontSize: '12px', color: COLORS.silver,
      }}>
        <span style={{ letterSpacing: '0.1em' }}>STABLE</span>
        {[0, 1, 2, 3].map(i => (
          <div key={i} style={{
            width: 16, height: 16, borderRadius: '3px',
            background: i < capturedMonsters.length ? '#D4AF37' : 'rgba(192,192,192,0.1)',
            border: `1px solid ${i < capturedMonsters.length ? 'rgba(212,175,55,0.7)' : 'rgba(192,192,192,0.2)'}`,
            transition: 'all 0.2s',
          }} />
        ))}
        <span style={{ color: capturedMonsters.length >= 4 ? '#EF4444' : COLORS.silver }}>
          {capturedMonsters.length}/4
        </span>
        {capturedMonsters.length >= 4 && (
          <span style={{ color: '#EF4444', fontSize: '10px', fontStyle: 'italic' }}>— Release one to capture more</span>
        )}
      </div>

      {/* Monster grid */}
      {capturedMonsters.length === 0 ? (
        <div className="text-center py-16 rounded-lg border-2" style={{
          background: 'rgba(0,0,0,0.3)',
          borderColor: 'rgba(212,175,55,0.2)',
          borderStyle: 'dashed',
        }}>
          <p className="text-lg mb-2" style={{ color: '#C0C0C0' }}>The stable is empty.</p>
          <p className="text-sm" style={{ color: '#9CA3AF' }}>Defeat bosses in battle and choose to capture them.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
          {capturedMonsters.map(monster => (
            <div key={monster.id} style={{
              borderRadius: '12px', padding: '20px 16px', textAlign: 'center',
              background: `linear-gradient(135deg, ${TIER_GLOW[monster.tier]}, rgba(0,0,0,0.55))`,
              border: `1px solid ${TIER_BORDER[monster.tier]}`,
              boxShadow: `0 4px 16px rgba(0,0,0,0.4), 0 0 24px ${TIER_GLOW[monster.tier]}`,
              position: 'relative',
            }}>
              {/* Tier badge */}
              <div style={{
                position: 'absolute', top: '10px', left: '10px',
                fontSize: '9px', fontWeight: 700, letterSpacing: '0.1em',
                color: TIER_COLORS[monster.tier], padding: '2px 7px', borderRadius: '4px',
                background: 'rgba(0,0,0,0.6)', border: `1px solid ${TIER_BORDER[monster.tier]}`,
              }}>
                {TIER_LABELS[monster.tier].toUpperCase()}
              </div>

              {/* Portrait */}
              <img
                src={getMonsterImg(monster)}
                alt={monster.name}
                style={{
                  width: 88, height: 88, objectFit: 'contain', margin: '10px auto 14px',
                  filter: `drop-shadow(0 0 10px ${TIER_COLORS[monster.tier]}55)`,
                }}
              />

              {/* Name */}
              <p style={{
                fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: '13px',
                color: TIER_COLORS[monster.tier], marginBottom: '14px', lineHeight: 1.3,
              }}>
                {monster.name}
              </p>

              {/* Release button */}
              <button
                onClick={() => releaseMonster(monster)}
                style={{
                  padding: '5px 14px', borderRadius: '6px', fontSize: '11px', fontWeight: 700,
                  background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(192,192,192,0.18)',
                  color: 'rgba(192,192,192,0.4)', cursor: 'pointer', transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(239,68,68,0.5)'; e.currentTarget.style.color = '#EF4444'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(192,192,192,0.18)'; e.currentTarget.style.color = 'rgba(192,192,192,0.4)'; }}
              >
                Release
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BestiaryTab;
