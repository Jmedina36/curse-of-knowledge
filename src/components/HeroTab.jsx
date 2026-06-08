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

const PRIMARY_MAP = { Knight: 'str', Wizard: 'int', Assassin: 'dex', Crusader: 'con' };

const getHeroPortrait = (className, gender) => {
  const classMap = { Knight: 'knight', Wizard: 'sorcerer', Assassin: 'thief', Crusader: 'crusader' };
  const g = gender === 'female' ? 'f' : gender === 'male' ? 'm' : gender || 'm';
  return `/npcs/${classMap[className] || 'knight'}-${g}.png`;
};

const ABILITY_LABEL = { str: 'Strength', dex: 'Dexterity', con: 'Constitution', int: 'Intelligence', wis: 'Wisdom', cha: 'Charisma' };

const StatRow = ({ label, value, highlight, dim, indent }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${dim ? '3px' : '5px'} ${indent ? '24px' : '0px'}`,
    gap: '16px',
  }}>
    <span style={{
      fontFamily: 'Cinzel, serif',
      fontSize: dim ? '0.62rem' : '0.72rem',
      fontWeight: 700,
      letterSpacing: '0.14em',
      textTransform: 'uppercase',
      color: highlight ? 'rgba(212,175,55,0.85)' : dim ? 'rgba(160,145,118,0.45)' : 'rgba(190,175,148,0.65)',
      flex: 1,
    }}>{label}</span>
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <div style={{
        flex: 1,
        height: '1px',
        width: '60px',
        background: 'linear-gradient(to right, transparent, rgba(212,175,55,0.1))',
      }} />
      <span style={{
        fontFamily: 'Cinzel, serif',
        fontSize: dim ? '0.65rem' : '0.78rem',
        fontWeight: 900,
        letterSpacing: '0.06em',
        color: highlight ? 'rgba(255,235,160,0.95)' : dim ? 'rgba(190,175,148,0.45)' : 'rgba(240,230,210,0.88)',
        minWidth: '50px',
        textAlign: 'right',
      }}>{value}</span>
    </div>
  </div>
);

const Divider = ({ gold }) => (
  <div style={{
    height: '1px',
    background: gold
      ? 'linear-gradient(to right, transparent, rgba(212,175,55,0.35), transparent)'
      : 'linear-gradient(to right, transparent, rgba(212,175,55,0.1), transparent)',
    margin: '6px 0',
  }} />
);

const SectionHeader = ({ label }) => (
  <div style={{ paddingTop: '10px', paddingBottom: '2px' }}>
    <span style={{
      fontFamily: 'Cinzel, serif',
      fontSize: '0.58rem',
      fontWeight: 900,
      letterSpacing: '0.3em',
      textTransform: 'uppercase',
      color: 'rgba(212,175,55,0.45)',
    }}>{label}</span>
  </div>
);

const SKILL_TREE = [
  [{ id: 'sk1', label: 'Iron Will',       desc: '+5 Max HP',          reqLevel: 3  }],
  [
    { id: 'sk2', label: 'Keen Edge',       desc: '+2 Attack',          reqLevel: 5  },
    { id: 'sk3', label: 'Endurance',       desc: '+5 Max SP',          reqLevel: 5  },
  ],
  [
    { id: 'sk4', label: 'Battle-Hardened', desc: '+3% Defense',        reqLevel: 8  },
    { id: 'sk5', label: "Scholar's Mind",  desc: '+XP gain',           reqLevel: 8  },
    { id: 'sk6', label: 'Resilience',      desc: 'Reduce curse dmg',   reqLevel: 8  },
  ],
  [{ id: 'sk7', label: 'Mastery',          desc: 'Unlock class power', reqLevel: 12 }],
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
  const [showSkillTree, setShowSkillTree] = useState(false);

  if (!hero) return null;

  const ab = hero.abilities || { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 };
  const primaryKey = PRIMARY_MAP[hero.class?.name] || 'str';

  // XP math
  let xpFloor = 0;
  for (let i = 1; i < level; i++) xpFloor += Math.floor(GAME_CONSTANTS.XP_PER_LEVEL * Math.pow(1.3, i - 1));
  const xpThisLevel = xp - xpFloor;
  const xpNeeded = Math.floor(GAME_CONSTANTS.XP_PER_LEVEL * Math.pow(1.3, level - 1));
  const xpPct = Math.min(100, (xpThisLevel / xpNeeded) * 100);

  const conMod  = Math.floor((ab.con - 10) / 2);
  const strMod  = Math.floor((ab.str - 10) / 2);
  const maxHp   = getMaxHp();
  const maxSp   = getMaxStamina();
  const atk     = getBaseAttack();
  const def     = getBaseDefense();
  const defPct  = Math.floor((def / (def + 50)) * 100);
  const classBaseAtk = GAME_CONSTANTS.BASE_ATTACK_BY_CLASS?.[hero.class?.name] || 8;
  const classBaseDef = GAME_CONSTANTS.BASE_DEFENSE_BY_CLASS?.[hero.class?.name] || 5;
  const armorDef = Object.values(equippedArmor || {}).reduce((t, p) => t + (p?.defense || 0), 0);

  const hpPct = (hp / maxHp) * 100;
  const spPct = (stamina / maxSp) * 100;

  const CURSE_NAMES = ['None', 'Cursed', 'Deeply Cursed', 'Condemned'];
  const CURSE_COLORS = ['rgba(212,175,55,0.6)', 'rgba(167,139,250,0.8)', 'rgba(168,85,247,0.9)', 'rgba(239,68,68,0.9)'];
  const curseName = CURSE_NAMES[curseLevel] || 'None';
  const curseColor = CURSE_COLORS[curseLevel] || CURSE_COLORS[0];

  return (
    <div style={{
      maxWidth: '820px',
      margin: '0 auto',
      paddingBottom: '40px',
    }}>

      {/* ── Main panel ── */}
      <div style={{
        background: 'rgba(6,5,3,0.96)',
        border: '1px solid rgba(212,175,55,0.18)',
        borderRadius: '4px',
        overflow: 'hidden',
        display: 'flex',
        minHeight: '560px',
      }}>

        {/* LEFT: Portrait column */}
        <div style={{
          width: '220px',
          flexShrink: 0,
          background: 'rgba(0,0,0,0.4)',
          borderRight: '1px solid rgba(212,175,55,0.1)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '24px 16px 20px',
          gap: '12px',
        }}>

          {/* Portrait */}
          <div style={{
            width: '160px',
            aspectRatio: '3/4',
            borderRadius: '2px',
            overflow: 'hidden',
            border: '1px solid rgba(212,175,55,0.2)',
            background: 'rgba(0,0,0,0.5)',
            flexShrink: 0,
            filter: curseLevel === 3
              ? 'saturate(0.35) brightness(0.75) sepia(0.3)'
              : curseLevel === 2
                ? 'saturate(0.6) brightness(0.88)'
                : 'none',
            transition: 'filter 0.5s ease',
          }}>
            <img
              src={getHeroPortrait(hero.class.name, hero.gender)}
              alt={hero.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }}
              onError={e => { e.currentTarget.style.display = 'none'; }}
            />
          </div>

          {/* Name */}
          <div style={{ textAlign: 'center', width: '100%' }}>
            <p style={{
              fontFamily: 'Cinzel, serif', fontWeight: 900,
              fontSize: 'clamp(0.9rem,2vw,1.1rem)',
              letterSpacing: '0.08em', color: 'rgba(240,228,200,0.9)',
              margin: '0 0 3px',
            }}>{hero.name}</p>
            <p style={{
              fontFamily: 'Cinzel, serif', fontSize: '0.65rem', fontWeight: 700,
              letterSpacing: '0.2em', textTransform: 'uppercase',
              color: 'rgba(212,175,55,0.55)', margin: '0 0 2px',
            }}>{hero.class.name}</p>
            <p style={{
              fontFamily: 'Cinzel, serif', fontSize: '0.58rem',
              letterSpacing: '0.12em', textTransform: 'uppercase',
              color: 'rgba(180,165,135,0.4)', margin: 0,
            }}>{hero.title}</p>
          </div>

          <Divider />

          {/* HP bar */}
          <div style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontFamily: 'Cinzel, serif', fontSize: '0.6rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(220,90,90,0.6)' }}>HP</span>
              <span style={{ fontFamily: 'Cinzel, serif', fontSize: '0.6rem', color: 'rgba(230,210,180,0.65)' }}>{hp} / {maxHp}</span>
            </div>
            <div style={{ height: '4px', borderRadius: '2px', background: 'rgba(100,0,0,0.3)', overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: '2px', width: `${hpPct}%`, background: hpPct < 25 ? '#7f1d1d' : 'linear-gradient(to right, #7f1d1d, #dc2626)', transition: 'width 0.4s' }} />
            </div>
          </div>

          {/* SP bar */}
          <div style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontFamily: 'Cinzel, serif', fontSize: '0.6rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(60,120,220,0.6)' }}>SP</span>
              <span style={{ fontFamily: 'Cinzel, serif', fontSize: '0.6rem', color: 'rgba(230,210,180,0.65)' }}>{stamina} / {maxSp}</span>
            </div>
            <div style={{ height: '4px', borderRadius: '2px', background: 'rgba(0,0,80,0.3)', overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: '2px', width: `${spPct}%`, background: 'linear-gradient(to right, #1e3a8a, #3b82f6)', transition: 'width 0.4s' }} />
            </div>
          </div>

          <Divider />

          {/* XP bar */}
          <div style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontFamily: 'Cinzel, serif', fontSize: '0.6rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.45)' }}>Experience</span>
              <span style={{ fontFamily: 'Cinzel, serif', fontSize: '0.6rem', color: 'rgba(212,175,55,0.5)' }}>{Math.round(xpPct)}%</span>
            </div>
            <div style={{ height: '3px', borderRadius: '2px', background: 'rgba(100,80,10,0.25)', overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: '2px', width: `${xpPct}%`, background: 'linear-gradient(to right, #78350f, #d97706)', transition: 'width 0.4s' }} />
            </div>
            <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.56rem', color: 'rgba(180,155,100,0.35)', textAlign: 'right', marginTop: '3px', letterSpacing: '0.06em' }}>
              {xpNeeded - xpThisLevel} to Lv {level + 1}
            </p>
          </div>

          {/* Soren quote */}
          <div style={{ marginTop: 'auto', paddingTop: '12px', width: '100%' }}>
            <Divider />
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginTop: '10px' }}>
              <img
                src="/npcs/elf-warrior.png"
                alt="Soren"
                style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover', objectPosition: 'top', border: '1px solid rgba(212,175,55,0.2)', flexShrink: 0, opacity: 0.75 }}
                onError={e => { e.currentTarget.style.display = 'none'; }}
              />
              <p style={{
                fontFamily: 'Cinzel, serif', fontSize: '0.56rem', fontStyle: 'italic',
                color: 'rgba(190,170,130,0.38)', lineHeight: 1.55, margin: 0,
              }}>"{sorenQuote}"<br /><span style={{ fontStyle: 'normal', color: 'rgba(212,175,55,0.3)', fontSize: '0.52rem', letterSpacing: '0.1em' }}>— Soren</span></p>
            </div>
          </div>

        </div>

        {/* RIGHT: Stats column */}
        <div style={{ flex: 1, padding: '24px 28px', overflowY: 'auto' }}>

          {/* ── Identity ── */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
            <div>
              <span style={{ fontFamily: 'Cinzel, serif', fontSize: '0.6rem', fontWeight: 900, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.4)' }}>
                The Chronicle
              </span>
            </div>
            {guildRank && (
              <span style={{
                fontFamily: 'Cinzel, serif', fontSize: '0.6rem', fontWeight: 900,
                letterSpacing: '0.18em', textTransform: 'uppercase',
                color: guildRank.name === 'Initiate' ? 'rgba(180,160,120,0.4)' : guildRank.color,
                opacity: 0.75,
              }}>{guildRank.name}</span>
            )}
          </div>
          <Divider gold />

          <StatRow label="Level"     value={level}       highlight />
          <StatRow label="Day"       value={currentDay} />
          <StatRow label="Total XP"  value={xp.toLocaleString()} />

          <SectionHeader label="Attributes" />
          <Divider />

          {['str', 'dex', 'con', 'int', 'wis', 'cha'].map(key => {
            const score = ab[key] || 10;
            const mod   = Math.floor((score - 10) / 2);
            const isPrimary = key === primaryKey;
            return (
              <StatRow
                key={key}
                label={`${ABILITY_LABEL[key]}${isPrimary ? ' ★' : ''}`}
                value={`${score}  (${mod >= 0 ? '+' : ''}${mod})`}
                highlight={isPrimary}
              />
            );
          })}

          <SectionHeader label="Derived Stats" />
          <Divider />

          <StatRow label="Max HP"   value={maxHp} highlight />
          <StatRow label="Max SP"   value={maxSp} highlight />
          <StatRow label="Attack"   value={atk}   highlight />
          <StatRow label="Defense"  value={`${defPct}%`} highlight />

          {/* Breakdowns */}
          <StatRow label={`  Base HP`}        value={GAME_CONSTANTS.MAX_HP}               dim indent />
          {conMod > 0 && <StatRow label={`  CON Bonus`}   value={`+${conMod * 5}`}        dim indent />}
          {equippedGrimoire?.hp && <StatRow label={`  Pendant`} value={`+${equippedGrimoire.hp}`} dim indent />}
          <StatRow label={`  Base ATK`}       value={classBaseAtk}                        dim indent />
          {strMod > 0 && <StatRow label={`  STR Bonus`}  value={`+${strMod}`}              dim indent />}
          {equippedWeapon && <StatRow label={`  ${equippedWeapon.name || 'Weapon'}`} value={`+${equippedWeapon.attack}`} dim indent />}
          <StatRow label={`  Base DEF`}       value={classBaseDef}                        dim indent />
          {armorDef > 0 && <StatRow label={`  Armor`}    value={`+${armorDef}`}            dim indent />}

          <SectionHeader label="Status" />
          <Divider />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '5px 0' }}>
            <span style={{ fontFamily: 'Cinzel, serif', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(190,175,148,0.65)' }}>
              Curse
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '60px', height: '1px', background: 'linear-gradient(to right, transparent, rgba(212,175,55,0.1))' }} />
              <span style={{ fontFamily: 'Cinzel, serif', fontSize: '0.78rem', fontWeight: 900, letterSpacing: '0.06em', color: curseColor }}>
                {curseLevel > 0 ? `${curseName}  (${curseLevel}/3)` : 'None'}
              </span>
            </div>
          </div>

          {equippedWeapon && (
            <>
              <SectionHeader label="Equipment" />
              <Divider />
              <StatRow label="Weapon"  value={equippedWeapon.name || 'Equipped'} />
            </>
          )}

          {Object.values(equippedArmor || {}).some(a => a) && (
            Object.entries(equippedArmor).map(([slot, piece]) =>
              piece ? <StatRow key={slot} label={slot.charAt(0).toUpperCase() + slot.slice(1)} value={piece.name || 'Equipped'} dim /> : null
            )
          )}

          {/* ── Skill Tree ── */}
          <div style={{ marginTop: '20px' }}>
            <button
              onClick={() => setShowSkillTree(v => !v)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer', width: '100%', padding: 0,
                display: 'flex', alignItems: 'center', gap: '10px',
              }}
            >
              <span style={{ fontFamily: 'Cinzel, serif', fontSize: '0.58rem', fontWeight: 900, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.4)' }}>
                Skill Tree
              </span>
              <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, rgba(212,175,55,0.15), transparent)' }} />
              <span style={{ fontFamily: 'Cinzel, serif', fontSize: '0.55rem', color: 'rgba(212,175,55,0.3)', letterSpacing: '0.1em' }}>
                {showSkillTree ? '▲ hide' : '▼ show'}
              </span>
            </button>

            {showSkillTree && (
              <div style={{ marginTop: '16px' }}>
                {SKILL_TREE.map((row, ri) => (
                  <div key={ri} style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '10px' }}>
                    {row.map(node => {
                      const unlocked = level >= node.reqLevel;
                      return (
                        <div key={node.id} style={{
                          flex: '0 0 auto',
                          width: '110px',
                          borderRadius: '2px',
                          padding: '9px 10px',
                          textAlign: 'center',
                          background: unlocked ? 'rgba(212,175,55,0.06)' : 'rgba(20,18,12,0.6)',
                          border: `1px solid ${unlocked ? 'rgba(212,175,55,0.3)' : 'rgba(80,70,50,0.2)'}`,
                          opacity: unlocked ? 1 : 0.4,
                          position: 'relative',
                        }}>
                          {unlocked && (
                            <div style={{ position: 'absolute', top: '-2px', right: '-2px', width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(212,175,55,0.9)', boxShadow: '0 0 6px rgba(212,175,55,0.7)' }} />
                          )}
                          <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.62rem', fontWeight: 900, letterSpacing: '0.06em', color: unlocked ? 'rgba(230,210,165,0.85)' : 'rgba(120,110,85,0.45)', margin: '0 0 2px' }}>{node.label}</p>
                          <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.54rem', color: unlocked ? 'rgba(180,160,118,0.55)' : 'rgba(90,82,62,0.35)', margin: 0 }}>{node.desc}</p>
                          {!unlocked && <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.5rem', color: 'rgba(130,115,85,0.3)', marginTop: '2px', marginBottom: 0 }}>Lv {node.reqLevel}</p>}
                        </div>
                      );
                    })}
                  </div>
                ))}
                <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.58rem', letterSpacing: '0.1em', color: 'rgba(150,130,100,0.22)', textAlign: 'center', fontStyle: 'italic', marginTop: '8px' }}>
                  Paths of power await those who endure
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default HeroTab;
