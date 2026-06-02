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
  if (monster.img) return monster.img;
  // fallback for old saves without img
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

const STAT_LABELS = { hp: 'HP', atk: 'ATK', def: 'DEF', spd: 'SPD', mag: 'MAG' };

const BestiaryTab = ({ capturedMonsters, setCapturedMonsters, addLog }) => {
  const [kaelQuote, setKaelQuote] = useState(() => KAEL_IDLE[Math.floor(Math.random() * KAEL_IDLE.length)]);
  const [openStats, setOpenStats] = useState({});
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      setKaelQuote(KAEL_IDLE[Math.floor(Math.random() * KAEL_IDLE.length)]);
    }, 8000);
    return () => clearInterval(t);
  }, []);

  const showNPC = windowWidth >= 1150;

  const releaseMonster = (monster) => {
    if (!window.confirm(`Release ${monster.name} back into the wilds?`)) return;
    setCapturedMonsters(prev => prev.filter(m => m.id !== monster.id));
    addLog(`Released ${monster.name} from the stable.`);
    setKaelQuote("Gone. Don't mourn it. There are always more.");
  };

  return (
    <div style={{ position: 'relative' }}>
      {showNPC && (
        <div style={{
          position: 'fixed',
          left: 'calc(25% - min(15vw, 225px) - clamp(70px, 7.5vw, 120px))',
          top: 'calc(40% + 48px)',
          transform: 'translateY(-50%)',
          width: 'clamp(140px, 15vw, 240px)',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
        }}>
          <img
            src="/npcs/female-warrior.png"
            alt="Kael"
            style={{
              width: 'clamp(120px, 13vw, 210px)',
              height: 'auto',
              objectFit: 'contain',
              objectPosition: 'top',
              filter: 'drop-shadow(0 0 40px rgba(34,197,94,0.5)) drop-shadow(0 0 100px rgba(34,197,94,0.15))',
            }}
          />
          <p style={{ fontFamily: 'Cinzel, serif', fontSize: '13px', fontWeight: 700, color: COLORS.gold, letterSpacing: '0.12em', margin: 0 }}>KAEL</p>
          <p style={{ fontSize: '11px', color: COLORS.silver, fontStyle: 'italic', margin: 0 }}>Beast Warden</p>
          <div style={{
            position: 'relative',
            background: 'rgba(10,8,4,0.85)',
            border: '1px solid rgba(212,175,55,0.3)',
            borderRadius: '8px',
            padding: '10px 12px',
            marginTop: '4px',
            width: '100%',
          }}>
            <div style={{
              position: 'absolute',
              right: '-9px',
              top: '16px',
              width: 0,
              height: 0,
              borderTop: '8px solid transparent',
              borderBottom: '8px solid transparent',
              borderLeft: '9px solid rgba(212,175,55,0.3)',
            }} />
            <div style={{
              position: 'absolute',
              right: '-7px',
              top: '17px',
              width: 0,
              height: 0,
              borderTop: '7px solid transparent',
              borderBottom: '7px solid transparent',
              borderLeft: '8px solid rgba(10,8,4,0.85)',
            }} />
            <p style={{ fontFamily: 'Cinzel, serif', fontSize: '11px', color: '#F5F5DC', fontStyle: 'italic', lineHeight: 1.5, margin: 0 }}>
              "{kaelQuote}"
            </p>
          </div>
        </div>
      )}

      <div
        className="bg-black bg-opacity-50 rounded-xl border-2"
        style={{
          borderColor: 'rgba(212, 175, 55, 0.6)',
          width: showNPC ? 'min(60vw, 900px)' : 'min(90vw, calc(100vw - 32px))',
          margin: '0 auto',
          height: 'calc(100vh - 180px)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Fixed header: stable capacity bar */}
        <div style={{ flexShrink: 0, padding: '20px 24px 0' }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            paddingBottom: '16px', fontSize: '12px', color: COLORS.silver,
            borderBottom: '1px solid rgba(212,175,55,0.15)',
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
        </div>

        {/* Scrollable content: monster grid */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px 24px' }}>
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

                  {/* Stats panel */}
                  {openStats[monster.id] && (
                    <div style={{
                      margin: '10px 0 8px',
                      background: 'rgba(0,0,0,0.45)',
                      border: `1px solid ${TIER_BORDER[monster.tier]}`,
                      borderRadius: '8px',
                      padding: '8px 10px',
                      textAlign: 'center',
                    }}>
                      {monster.stats ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '4px' }}>
                          {Object.entries(STAT_LABELS).map(([key, label]) => (
                            <div key={key}>
                              <div style={{ fontSize: '9px', color: COLORS.silver, letterSpacing: '0.08em', marginBottom: '2px' }}>{label}</div>
                              <div style={{ fontSize: '12px', fontWeight: 700, color: TIER_COLORS[monster.tier] }}>{monster.stats[key]}</div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p style={{ fontSize: '10px', color: COLORS.silver, fontStyle: 'italic', margin: 0 }}>
                          Capture again to record stats
                        </p>
                      )}
                    </div>
                  )}

                  {/* Buttons row */}
                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                    <button
                      onClick={() => setOpenStats(prev => ({ ...prev, [monster.id]: !prev[monster.id] }))}
                      style={{
                        padding: '5px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 700,
                        background: 'rgba(0,0,0,0.4)', border: `1px solid ${openStats[monster.id] ? TIER_BORDER[monster.tier] : 'rgba(192,192,192,0.18)'}`,
                        color: openStats[monster.id] ? TIER_COLORS[monster.tier] : 'rgba(192,192,192,0.5)', cursor: 'pointer', transition: 'all 0.15s',
                      }}
                    >
                      Stats
                    </button>
                    <button
                      onClick={() => releaseMonster(monster)}
                      style={{
                        padding: '5px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 700,
                        background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(192,192,192,0.18)',
                        color: 'rgba(192,192,192,0.4)', cursor: 'pointer', transition: 'all 0.15s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(239,68,68,0.5)'; e.currentTarget.style.color = '#EF4444'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(192,192,192,0.18)'; e.currentTarget.style.color = 'rgba(192,192,192,0.4)'; }}
                    >
                      Release
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BestiaryTab;
