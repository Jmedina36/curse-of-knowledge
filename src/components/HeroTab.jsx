import React, { useState } from 'react';
import { GAME_CONSTANTS } from '../constants';

const SOREN_QUOTES = [
  "The measure of a champion lies not in their victories, but in their relentless pursuit of mastery.",
  "Every scar tells a story. Every lesson, a step toward legend.",
  "Knowledge is the sharpest blade — and you are still learning to wield it.",
  "The abyss fears not the strong, but the wise. Never stop growing.",
  "Your path is etched in the chronicles now. Make it worth remembering.",
  "Strength without wisdom is a sword without a hand to guide it.",
  "I have watched many champions rise and fall. What sets the survivors apart is simple: they studied.",
];

const ABILITY_FULL = {
  str: 'Strength',
  dex: 'Dexterity',
  con: 'Constitution',
  int: 'Intelligence',
  wis: 'Wisdom',
  cha: 'Charisma',
};
const ABILITY_DESC = {
  str: 'Governs melee damage and physical feat checks.',
  dex: 'Affects agility, evasion, and precision attacks.',
  con: 'Increases maximum HP per point above 10.',
  int: 'Enhances spell power and learning speed.',
  wis: 'Improves perception, willpower, and capture chance.',
  cha: 'Affects negotiation, morale bonuses, and persuasion.',
};
const PRIMARY_MAP = { Knight: 'str', Wizard: 'int', Assassin: 'dex', Crusader: 'con' };

const getHeroPortrait = (className, gender) => {
  const classMap = { Knight: 'knight', Wizard: 'sorcerer', Assassin: 'thief', Crusader: 'crusader' };
  const g = gender === 'female' ? 'f' : gender === 'male' ? 'm' : gender || 'm';
  return `/npcs/${classMap[className] || 'knight'}-${g}.png`;
};

const CLASS_COLOR_MAP = {
  red:    { border: 'rgba(180,30,30,0.6)',   glow: 'rgba(180,30,30,0.3)',   text: '#FF6B6B',  bar: 'linear-gradient(90deg,#7F0000,#C41C1C)' },
  blue:   { border: 'rgba(59,130,246,0.6)',  glow: 'rgba(59,130,246,0.3)',  text: '#60A5FA',  bar: 'linear-gradient(90deg,#1E3A8A,#2563EB)' },
  green:  { border: 'rgba(16,185,129,0.6)',  glow: 'rgba(16,185,129,0.3)',  text: '#34D399',  bar: 'linear-gradient(90deg,#064E3B,#059669)' },
  white:  { border: 'rgba(200,200,200,0.6)', glow: 'rgba(200,200,200,0.3)', text: '#E5E7EB',  bar: 'linear-gradient(90deg,#4B5563,#9CA3AF)' },
  purple: { border: 'rgba(139,92,246,0.6)',  glow: 'rgba(139,92,246,0.3)',  text: '#A78BFA',  bar: 'linear-gradient(90deg,#4B0082,#7C3AED)' },
  yellow: { border: 'rgba(212,175,55,0.6)',  glow: 'rgba(212,175,55,0.3)',  text: '#D4AF37',  bar: 'linear-gradient(90deg,#92400E,#B45309)' },
  amber:  { border: 'rgba(34,197,94,0.6)',   glow: 'rgba(34,197,94,0.3)',   text: '#4ADE80',  bar: 'linear-gradient(90deg,#14532D,#15803D)' },
};

const CURSE_COLORS  = ['rgba(212,175,55,0.0)', 'rgba(107,44,145,0.7)', 'rgba(107,44,145,0.9)', 'rgba(139,0,0,0.9)'];
const CURSE_TEXT    = ['#D4AF37', '#C084FC', '#A855F7', '#FF4444'];
const CURSE_NAMES   = ['None', 'Cursed', 'Deeply Cursed', 'Condemned'];

const SKILL_TREE = [
  [{ id: 'sk1', label: 'Iron Will',      desc: '+5 Max HP',         reqLevel: 3  }],
  [
    { id: 'sk2', label: 'Keen Edge',      desc: '+2 Attack',         reqLevel: 5  },
    { id: 'sk3', label: 'Endurance',      desc: '+5 Max SP',         reqLevel: 5  },
  ],
  [
    { id: 'sk4', label: 'Battle-Hardened',desc: '+3% Defense',       reqLevel: 8  },
    { id: 'sk5', label: "Scholar's Mind", desc: '+XP gain',          reqLevel: 8  },
    { id: 'sk6', label: 'Resilience',     desc: 'Reduce curse dmg',  reqLevel: 8  },
  ],
  [{ id: 'sk7', label: 'Mastery',         desc: 'Unlock class power', reqLevel: 12 }],
];

const HeroTab = ({
  hero,
  xp,
  level,
  hp,
  stamina,
  currentDay,
  curseLevel,
  getMaxHp,
  getMaxStamina,
  getBaseAttack,
  getBaseDefense,
  equippedWeapon,
  equippedArmor,
  equippedGrimoire,
  equippedTome,
  guildRank,
}) => {
  const [sorenQuote] = useState(() => SOREN_QUOTES[Math.floor(Math.random() * SOREN_QUOTES.length)]);
  const [hoveredAbility, setHoveredAbility] = useState(null);

  if (!hero) return null;

  const ab = hero.abilities || { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 };
  const primaryKey = PRIMARY_MAP[hero.class?.name] || 'str';
  const cc = CLASS_COLOR_MAP[hero.class?.color] || CLASS_COLOR_MAP.yellow;

  // XP math
  let xpFloor = 0;
  for (let i = 1; i < level; i++) xpFloor += Math.floor(GAME_CONSTANTS.XP_PER_LEVEL * Math.pow(1.3, i - 1));
  const xpThisLevel = xp - xpFloor;
  const xpNeeded = Math.floor(GAME_CONSTANTS.XP_PER_LEVEL * Math.pow(1.3, level - 1));
  const xpPct = Math.min(100, (xpThisLevel / xpNeeded) * 100);

  const strMod = Math.floor((ab.str - 10) / 2);
  const conMod = Math.floor((ab.con - 10) / 2);
  const baseMaxHp = getMaxHp();
  const baseMaxSp = getMaxStamina();
  const totalAtk = getBaseAttack();
  const totalDef = getBaseDefense();
  const defPct = Math.floor((totalDef / (totalDef + 50)) * 100);
  const classBaseAtk = GAME_CONSTANTS.BASE_ATTACK_BY_CLASS?.[hero.class?.name] || 8;
  const classBaseDef = GAME_CONSTANTS.BASE_DEFENSE_BY_CLASS?.[hero.class?.name] || 5;

  const hasArmor = Object.values(equippedArmor || {}).some(a => a);
  const armorDefTotal = Object.values(equippedArmor || {}).reduce((t, p) => t + (p?.defense || 0), 0);

  return (
    <div style={{ position: 'relative', minHeight: 'calc(100vh - 180px)', display: 'flex', gap: '20px' }}>

      {/* ── Soren NPC — fixed right ── */}
      <div style={{
        position: 'fixed',
        right: '16px',
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '10px',
        pointerEvents: 'none',
        width: '160px',
      }}>
        <img
          src="/npcs/elf-warrior.png"
          alt="Soren"
          style={{
            height: 'clamp(170px, 20vh, 240px)',
            objectFit: 'contain',
            objectPosition: 'bottom',
            filter: 'drop-shadow(0 4px 20px rgba(0,0,0,0.85))',
            opacity: 0.9,
          }}
          onError={e => { e.currentTarget.style.opacity = '0'; }}
        />
        <div style={{
          background: 'rgba(12,10,5,0.92)',
          border: '1px solid rgba(212,175,55,0.3)',
          borderRadius: '8px',
          padding: '10px 12px',
          pointerEvents: 'auto',
        }}>
          <p style={{
            fontFamily: 'Cinzel, serif',
            fontSize: '0.62rem',
            fontStyle: 'italic',
            color: 'rgba(220,200,160,0.72)',
            lineHeight: 1.55,
            textAlign: 'center',
            margin: 0,
          }}>"{sorenQuote}"</p>
          <p style={{
            fontFamily: 'Cinzel, serif',
            fontSize: '0.6rem',
            fontWeight: 900,
            letterSpacing: '0.14em',
            color: 'rgba(212,175,55,0.5)',
            textAlign: 'center',
            marginTop: '6px',
            marginBottom: 0,
          }}>— Soren</p>
        </div>
      </div>

      {/* ── Main content (leave room for Soren) ── */}
      <div style={{
        flex: 1,
        marginRight: '190px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        paddingBottom: '40px',
      }}>

        {/* ── Hero Header ── */}
        <div style={{
          borderRadius: '12px',
          overflow: 'hidden',
          border: `2px solid ${cc.border}`,
          boxShadow: `0 4px 28px ${cc.glow}`,
          backgroundImage: 'url(/Stonewall1.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}>
          <div style={{ background: 'rgba(10,9,6,0.88)', padding: '20px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '18px', flexWrap: 'wrap' }}>

              {/* Portrait */}
              <div style={{
                width: '76px', height: '96px',
                borderRadius: '6px', overflow: 'hidden', flexShrink: 0,
                border: `2px solid ${cc.border}`,
                boxShadow: `0 0 18px ${cc.glow}`,
              }}>
                <img
                  src={getHeroPortrait(hero.class.name, hero.gender)}
                  alt={hero.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }}
                  onError={e => { e.currentTarget.style.display = 'none'; }}
                />
              </div>

              {/* Name / class / rank */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontFamily: 'Cinzel, serif', fontSize: 'clamp(1.2rem,3vw,1.7rem)', fontWeight: 900, letterSpacing: '0.06em', color: '#F5F5DC', margin: '0 0 2px' }}>{hero.name}</p>
                <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: cc.text, margin: '0 0 6px' }}>
                  {hero.title} · {hero.class.name}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
                  <span style={{ fontFamily: 'Cinzel, serif', fontSize: '0.72rem', color: 'rgba(200,180,140,0.65)', letterSpacing: '0.1em' }}>
                    Level {level}
                  </span>
                  <span style={{ color: 'rgba(212,175,55,0.25)', fontSize: '0.65rem' }}>◆</span>
                  <span style={{ fontFamily: 'Cinzel, serif', fontSize: '0.72rem', color: 'rgba(200,180,140,0.65)', letterSpacing: '0.1em' }}>
                    Day {currentDay}
                  </span>
                  {guildRank && (
                    <>
                      <span style={{ color: 'rgba(212,175,55,0.25)', fontSize: '0.65rem' }}>◆</span>
                      <span style={{ fontFamily: 'Cinzel, serif', fontSize: '0.72rem', letterSpacing: '0.1em', color: guildRank.name === 'Initiate' ? 'rgba(180,160,120,0.55)' : guildRank.color }}>
                        {guildRank.name}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Curse badge */}
              {curseLevel > 0 && (
                <div style={{
                  padding: '6px 14px', borderRadius: '6px',
                  background: 'rgba(15,5,20,0.65)',
                  border: `1px solid ${CURSE_COLORS[curseLevel]}`,
                  boxShadow: `0 0 14px ${CURSE_COLORS[curseLevel]}`,
                }}>
                  <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.72rem', fontWeight: 900, letterSpacing: '0.14em', textTransform: 'uppercase', color: CURSE_TEXT[curseLevel], margin: 0 }}>
                    {curseLevel === 3 ? '☠ ' : '⚠ '}{CURSE_NAMES[curseLevel]}
                  </p>
                  <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.58rem', color: CURSE_TEXT[curseLevel], opacity: 0.55, letterSpacing: '0.1em', textAlign: 'center', margin: '2px 0 0' }}>
                    {curseLevel}/3 curses
                  </p>
                </div>
              )}
            </div>

            {/* XP bar */}
            <div style={{ marginTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontFamily: 'Cinzel, serif', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(200,180,140,0.55)' }}>
                  Experience
                </span>
                <span style={{ fontFamily: 'Cinzel, serif', fontSize: '0.68rem', color: 'rgba(200,180,140,0.65)' }}>
                  {xpThisLevel} / {xpNeeded} XP
                </span>
              </div>
              <div style={{ height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.07)', overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: '3px', width: `${xpPct}%`, background: cc.bar, transition: 'width 0.5s ease' }} />
              </div>
              <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.6rem', color: 'rgba(180,160,120,0.4)', textAlign: 'right', marginTop: '3px', letterSpacing: '0.08em' }}>
                {xpNeeded - xpThisLevel} XP until level {level + 1}
              </p>
            </div>
          </div>
        </div>

        {/* ── Vitals ── */}
        <div style={{
          borderRadius: '12px',
          overflow: 'hidden',
          border: '2px solid rgba(212,175,55,0.3)',
          backgroundImage: 'url(/Stonewall1.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}>
          <div style={{ background: 'rgba(10,9,6,0.88)' }}>
            <div style={{ padding: '10px 20px', background: 'rgba(0,0,0,0.25)', borderBottom: '1px solid rgba(212,175,55,0.12)' }}>
              <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.7rem', fontWeight: 900, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.65)', margin: 0 }}>Vitals</p>
            </div>
            <div style={{ padding: '14px 20px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>

              {/* HP */}
              <div style={{ background: 'rgba(139,0,0,0.09)', border: '1px solid rgba(139,0,0,0.28)', borderRadius: '8px', padding: '12px 14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontFamily: 'Cinzel, serif', fontSize: '0.75rem', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(220,100,100,0.8)' }}>Hit Points</span>
                  <span style={{ fontFamily: 'Cinzel, serif', fontSize: '0.95rem', fontWeight: 900, color: '#F5F5DC' }}>{hp} / {baseMaxHp}</span>
                </div>
                <div style={{ height: '5px', borderRadius: '3px', background: 'rgba(139,0,0,0.18)', overflow: 'hidden', marginBottom: '6px' }}>
                  <div style={{ height: '100%', borderRadius: '3px', background: hp / baseMaxHp < 0.25 ? '#8B0000' : 'linear-gradient(to right,#7f1d1d,#b91c1c)', width: `${(hp / baseMaxHp) * 100}%`, transition: 'width 0.3s' }} />
                </div>
                <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.6rem', color: 'rgba(180,120,120,0.45)', letterSpacing: '0.07em', margin: 0 }}>
                  Base {GAME_CONSTANTS.MAX_HP}
                  {conMod > 0 ? ` + ${conMod * 5} (CON)` : ''}
                  {equippedGrimoire?.hp ? ` + ${equippedGrimoire.hp} (pendant)` : ''}
                </p>
              </div>

              {/* SP */}
              <div style={{ background: 'rgba(30,58,140,0.09)', border: '1px solid rgba(30,58,140,0.28)', borderRadius: '8px', padding: '12px 14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontFamily: 'Cinzel, serif', fontSize: '0.75rem', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(96,165,250,0.8)' }}>Stamina</span>
                  <span style={{ fontFamily: 'Cinzel, serif', fontSize: '0.95rem', fontWeight: 900, color: '#F5F5DC' }}>{stamina} / {baseMaxSp}</span>
                </div>
                <div style={{ height: '5px', borderRadius: '3px', background: 'rgba(30,58,140,0.18)', overflow: 'hidden', marginBottom: '6px' }}>
                  <div style={{ height: '100%', borderRadius: '3px', background: 'linear-gradient(to right,#1e3a8a,#2563eb)', width: `${(stamina / baseMaxSp) * 100}%`, transition: 'width 0.3s' }} />
                </div>
                <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.6rem', color: 'rgba(120,160,220,0.45)', letterSpacing: '0.07em', margin: 0 }}>
                  Base {GAME_CONSTANTS.MAX_STAMINA}
                  {equippedTome?.stamina ? ` + ${equippedTome.stamina} (ring)` : ''}
                </p>
              </div>

              {/* Attack */}
              <div style={{ background: 'rgba(80,50,10,0.09)', border: '1px solid rgba(80,50,10,0.28)', borderRadius: '8px', padding: '12px 14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontFamily: 'Cinzel, serif', fontSize: '0.75rem', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(210,170,80,0.8)' }}>Attack</span>
                  <span style={{ fontFamily: 'Cinzel, serif', fontSize: '1.2rem', fontWeight: 900, color: '#F5F5DC', lineHeight: 1 }}>{totalAtk}</span>
                </div>
                <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.6rem', color: 'rgba(180,140,70,0.45)', letterSpacing: '0.07em', margin: 0 }}>
                  Base {classBaseAtk}
                  {strMod > 0 ? ` + ${strMod} (STR)` : ''}
                  {equippedWeapon ? ` + ${equippedWeapon.attack} (${equippedWeapon.name || 'weapon'})` : ''}
                </p>
              </div>

              {/* Defense */}
              <div style={{ background: 'rgba(20,70,40,0.09)', border: '1px solid rgba(20,70,40,0.28)', borderRadius: '8px', padding: '12px 14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontFamily: 'Cinzel, serif', fontSize: '0.75rem', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(80,200,130,0.8)' }}>Defense</span>
                  <span style={{ fontFamily: 'Cinzel, serif', fontSize: '1.2rem', fontWeight: 900, color: '#F5F5DC', lineHeight: 1 }}>{defPct}%</span>
                </div>
                <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.6rem', color: 'rgba(80,160,110,0.45)', letterSpacing: '0.07em', margin: 0 }}>
                  DR {totalDef} — Base {classBaseDef}
                  {armorDefTotal > 0 ? ` + ${armorDefTotal} (armor)` : ''}
                </p>
              </div>

            </div>
          </div>
        </div>

        {/* ── Ability Scores ── */}
        <div style={{
          borderRadius: '12px',
          overflow: 'hidden',
          border: '2px solid rgba(212,175,55,0.3)',
          backgroundImage: 'url(/Stonewall1.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}>
          <div style={{ background: 'rgba(10,9,6,0.88)' }}>
            <div style={{ padding: '10px 20px', background: 'rgba(0,0,0,0.25)', borderBottom: '1px solid rgba(212,175,55,0.12)' }}>
              <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.7rem', fontWeight: 900, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.65)', margin: 0 }}>Ability Scores</p>
            </div>
            <div style={{ padding: '14px 20px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              {['str', 'dex', 'con', 'int', 'wis', 'cha'].map(key => {
                const score = ab[key] || 10;
                const mod = Math.floor((score - 10) / 2);
                const isPrimary = key === primaryKey;
                const isHov = hoveredAbility === key;
                return (
                  <div
                    key={key}
                    onMouseEnter={() => setHoveredAbility(key)}
                    onMouseLeave={() => setHoveredAbility(null)}
                    style={{
                      borderRadius: '8px',
                      padding: '12px 8px',
                      textAlign: 'center',
                      background: isPrimary ? 'rgba(212,175,55,0.1)' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${isPrimary ? cc.border : 'rgba(255,255,255,0.07)'}`,
                      boxShadow: isHov ? `0 0 14px ${isPrimary ? cc.glow : 'rgba(255,255,255,0.04)'}` : 'none',
                      transition: 'box-shadow 0.2s',
                      cursor: 'default',
                      minHeight: isHov ? 'auto' : undefined,
                    }}
                  >
                    <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.65rem', fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase', color: isPrimary ? cc.text : 'rgba(180,160,130,0.6)', margin: '0 0 4px' }}>
                      {ABILITY_FULL[key]}
                      {isPrimary && <span style={{ marginLeft: '4px', fontSize: '0.5rem', opacity: 0.7 }}>★</span>}
                    </p>
                    <p style={{ fontFamily: 'Cinzel, serif', fontSize: '2rem', fontWeight: 900, color: '#F5F5DC', lineHeight: 1, margin: '0 0 2px' }}>{score}</p>
                    <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.78rem', fontWeight: 700, color: mod >= 0 ? 'rgba(160,220,140,0.8)' : 'rgba(220,100,100,0.8)', margin: 0 }}>
                      {mod >= 0 ? '+' : ''}{mod}
                    </p>
                    {isHov && (
                      <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.58rem', color: 'rgba(180,160,130,0.5)', marginTop: '6px', lineHeight: 1.45, margin: '6px 0 0' }}>
                        {ABILITY_DESC[key]}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Skill Tree (placeholder) ── */}
        <div style={{
          borderRadius: '12px',
          overflow: 'hidden',
          border: '2px solid rgba(212,175,55,0.3)',
          backgroundImage: 'url(/Stonewall1.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}>
          <div style={{ background: 'rgba(10,9,6,0.88)' }}>
            <div style={{ padding: '10px 20px', background: 'rgba(0,0,0,0.25)', borderBottom: '1px solid rgba(212,175,55,0.12)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.7rem', fontWeight: 900, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.65)', margin: 0 }}>Skill Tree</p>
              <span style={{ fontFamily: 'Cinzel, serif', fontSize: '0.58rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(180,160,130,0.3)', fontStyle: 'italic' }}>
                In development
              </span>
            </div>
            <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
              {SKILL_TREE.map((row, ri) => (
                <div key={ri} style={{ display: 'flex', gap: '14px', justifyContent: 'center' }}>
                  {row.map(node => {
                    const unlocked = level >= node.reqLevel;
                    return (
                      <div
                        key={node.id}
                        style={{
                          width: '106px',
                          borderRadius: '8px',
                          padding: '10px 8px',
                          textAlign: 'center',
                          background: unlocked ? 'rgba(212,175,55,0.07)' : 'rgba(25,20,12,0.6)',
                          border: `1px solid ${unlocked ? 'rgba(212,175,55,0.38)' : 'rgba(80,70,50,0.25)'}`,
                          opacity: unlocked ? 1 : 0.45,
                          position: 'relative',
                        }}
                      >
                        {unlocked && (
                          <div style={{
                            position: 'absolute', top: '-3px', right: '-3px',
                            width: '8px', height: '8px', borderRadius: '50%',
                            background: 'rgba(212,175,55,0.85)',
                            boxShadow: '0 0 7px rgba(212,175,55,0.7)',
                          }} />
                        )}
                        <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.64rem', fontWeight: 900, letterSpacing: '0.07em', color: unlocked ? 'rgba(220,200,155,0.85)' : 'rgba(120,110,85,0.5)', margin: '0 0 3px' }}>
                          {node.label}
                        </p>
                        <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.55rem', letterSpacing: '0.06em', color: unlocked ? 'rgba(180,160,120,0.55)' : 'rgba(90,82,62,0.4)', margin: 0 }}>
                          {node.desc}
                        </p>
                        {!unlocked && (
                          <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.5rem', letterSpacing: '0.1em', color: 'rgba(130,115,85,0.35)', marginTop: '3px', marginBottom: 0 }}>
                            Lv {node.reqLevel}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
              <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.62rem', letterSpacing: '0.12em', color: 'rgba(150,130,100,0.28)', textAlign: 'center', marginTop: '8px', fontStyle: 'italic', marginBottom: 0 }}>
                Paths of power await those who endure
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default HeroTab;
