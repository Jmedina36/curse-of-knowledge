import React, { useState, useEffect } from 'react';
import { sounds } from '../sounds';
import { GAME_CONSTANTS, KNIGHT_SKILL_TREE, WIZARD_SKILL_TREE, ASSASSIN_SKILL_TREE, CRUSADER_SKILL_TREE } from '../constants';

const SOREN_QUOTES = [
  "The measure of a champion lies not in their victories, but in their relentless pursuit of mastery.",
  "Every scar tells a story. Every lesson, a step toward legend.",
  "Knowledge is the sharpest blade — and you are still learning to wield it.",
  "The abyss fears not the strong, but the wise. Never stop growing.",
  "Your path is etched in the chronicles now. Make it worth remembering.",
  "Strength without wisdom is a sword without a hand to guide it.",
  "I have watched many champions rise and fall. What sets the survivors apart: they studied.",
];

const PRIMARY_MAP = { Knight: 'str', Wizard: 'int', Assassin: 'dex', Crusader: 'con' };

const ABILITY_LABEL = {
  str: 'Strength',
  dex: 'Dexterity',
  con: 'Constitution',
  int: 'Intelligence',
  wis: 'Wisdom',
  cha: 'Charisma',
};

const ABILITY_DESC = {
  str: 'Attack damage',
  dex: 'Dodge & initiative',
  con: 'Max HP',
  int: 'XP gain',
  wis: 'Damage reduction',
  cha: 'Gold drops',
};

const getHeroPortrait = (className, gender) => {
  const classMap = { Knight: 'knight', Wizard: 'sorcerer', Assassin: 'thief', Crusader: 'crusader' };
  const g = gender === 'female' ? 'f' : gender === 'male' ? 'm' : gender || 'm';
  return `/npcs/${classMap[className] || 'knight'}-${g}.png`;
};

const Divider = ({ gold }) => (
  <div style={{
    height: '1px',
    background: gold
      ? 'linear-gradient(to right, transparent, rgba(212,175,55,0.4), transparent)'
      : 'linear-gradient(to right, transparent, rgba(212,175,55,0.12), transparent)',
    margin: '6px 0',
  }} />
);

const SectionHeader = ({ label, badge }) => (
  <div style={{ paddingTop: '10px', paddingBottom: '4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
    <span style={{
      fontFamily: 'Cinzel, serif', fontSize: '0.58rem', fontWeight: 900,
      letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.45)',
    }}>{label}</span>
    {badge && (
      <span style={{
        fontFamily: 'Cinzel, serif', fontSize: '0.56rem', fontWeight: 900,
        letterSpacing: '0.12em', textTransform: 'uppercase',
        color: 'rgba(255,220,80,0.9)',
        background: 'rgba(212,175,55,0.15)',
        border: '1px solid rgba(212,175,55,0.4)',
        borderRadius: '3px', padding: '1px 6px',
        animation: 'pulse 2s ease-in-out infinite',
      }}>{badge}</span>
    )}
  </div>
);

const EMPTY_ALLOC = { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 };

const SKILL_TREE = [
  [{ id: 'sk1', label: 'Iron Will',        desc: '+5 Max HP',          reqLevel: 3  }],
  [
    { id: 'sk2', label: 'Keen Edge',        desc: '+2 Attack',          reqLevel: 5  },
    { id: 'sk3', label: 'Endurance',        desc: '+5 Max SP',          reqLevel: 5  },
  ],
  [
    { id: 'sk4', label: 'Battle-Hardened',  desc: '+3% Defense',        reqLevel: 8  },
    { id: 'sk5', label: "Scholar's Mind",   desc: '+XP gain',           reqLevel: 8  },
    { id: 'sk6', label: 'Resilience',       desc: 'Reduce curse dmg',   reqLevel: 8  },
  ],
  [{ id: 'sk7', label: 'Mastery',           desc: 'Unlock class power', reqLevel: 12 }],
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
  unspentStatPoints = 0,
  onConfirmStats,
  skillPoints = 0,
  unlockedSkillNodes = [],
  onUnlockSkillNode,
}) => {
  const [sorenQuote] = useState(() => SOREN_QUOTES[Math.floor(Math.random() * SOREN_QUOTES.length)]);
  const [showSkillTree, setShowSkillTree] = useState(false);
  const [pendingAlloc, setPendingAlloc] = useState({ ...EMPTY_ALLOC });

  // Reset pending alloc when we get fresh points
  useEffect(() => {
    setPendingAlloc({ ...EMPTY_ALLOC });
  }, [unspentStatPoints]);

  if (!hero) return null;

  const ab = hero.abilities || { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 };
  const primaryKey = PRIMARY_MAP[hero.class?.name] || 'str';

  const pointsSpent = Object.values(pendingAlloc).reduce((a, b) => a + b, 0);
  const remaining = unspentStatPoints - pointsSpent;
  const allAllocated = unspentStatPoints > 0 && remaining === 0;
  const isAllocating = unspentStatPoints > 0;

  const addPoint = (key) => {
    if (remaining <= 0) return;
    sounds.click();
    setPendingAlloc(p => ({ ...p, [key]: p[key] + 1 }));
  };
  const removePoint = (key) => {
    if (pendingAlloc[key] <= 0) return;
    sounds.click();
    setPendingAlloc(p => ({ ...p, [key]: p[key] - 1 }));
  };
  const confirmAlloc = () => {
    if (!allAllocated) return;
    const newAb = {};
    Object.keys(ab).forEach(k => { newAb[k] = (ab[k] || 10) + (pendingAlloc[k] || 0); });
    onConfirmStats && onConfirmStats(newAb);
    setPendingAlloc({ ...EMPTY_ALLOC });
  };

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

  const CURSE_NAMES  = ['None', 'Cursed', 'Deeply Cursed', 'Condemned'];
  const CURSE_COLORS = ['rgba(212,175,55,0.0)', 'rgba(167,139,250,0.8)', 'rgba(168,85,247,0.9)', 'rgba(239,68,68,0.9)'];

  // Stat row component — two modes: read-only or interactive allocation
  const StatRowStatic = ({ label, value, highlight, dim, indent }) => (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: `${dim ? '3px' : '5px'} ${indent ? '20px' : '0px'}`,
    }}>
      <span style={{
        fontFamily: 'Cinzel, serif',
        fontSize: dim ? '0.62rem' : '0.72rem',
        fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
        color: highlight ? 'rgba(212,175,55,0.85)' : dim ? 'rgba(160,145,118,0.4)' : 'rgba(190,175,148,0.65)',
        flex: 1,
      }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ width: '50px', height: '1px', background: 'linear-gradient(to right, transparent, rgba(212,175,55,0.1))' }} />
        <span style={{
          fontFamily: 'Cinzel, serif',
          fontSize: dim ? '0.65rem' : '0.78rem',
          fontWeight: 900, letterSpacing: '0.05em',
          color: highlight ? 'rgba(255,235,160,0.92)' : dim ? 'rgba(180,165,138,0.4)' : 'rgba(235,225,205,0.85)',
          minWidth: '50px', textAlign: 'right',
        }}>{value}</span>
      </div>
    </div>
  );

  const AbilityAllocRow = ({ statKey }) => {
    const score   = ab[statKey] || 10;
    const alloc   = pendingAlloc[statKey] || 0;
    const preview = score + alloc;
    const mod     = Math.floor((preview - 10) / 2);
    const isPrimary = statKey === primaryKey;
    const canAdd  = remaining > 0;
    const canSub  = alloc > 0;

    return (
      <div style={{
        display: 'flex', alignItems: 'center', padding: '4px 0',
        background: alloc > 0 ? 'rgba(212,175,55,0.05)' : 'transparent',
        borderRadius: '3px',
        transition: 'background 0.2s',
      }}>
        {/* Label */}
        <span style={{
          fontFamily: 'Cinzel, serif', fontSize: '0.72rem', fontWeight: 700,
          letterSpacing: '0.12em', textTransform: 'uppercase', flex: 1,
          color: isPrimary ? 'rgba(212,175,55,0.85)' : 'rgba(190,175,148,0.65)',
        }}>
          {ABILITY_LABEL[statKey]}{isPrimary ? ' ★' : ''}
        </span>

        {/* − button */}
        <button
          onClick={() => removePoint(statKey)}
          disabled={!canSub}
          style={{
            width: '22px', height: '22px', borderRadius: '3px',
            background: canSub ? 'rgba(212,175,55,0.12)' : 'rgba(255,255,255,0.03)',
            border: `1px solid ${canSub ? 'rgba(212,175,55,0.4)' : 'rgba(255,255,255,0.06)'}`,
            color: canSub ? 'rgba(212,175,55,0.85)' : 'rgba(255,255,255,0.15)',
            cursor: canSub ? 'pointer' : 'default',
            fontFamily: 'Cinzel, serif', fontSize: '0.8rem', fontWeight: 900,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            lineHeight: 1, flexShrink: 0,
            transition: 'all 0.15s',
          }}
        >−</button>

        {/* Value display */}
        <div style={{ minWidth: '80px', textAlign: 'center', padding: '0 6px' }}>
          {alloc > 0 ? (
            <span style={{ fontFamily: 'Cinzel, serif', fontSize: '0.78rem', fontWeight: 900 }}>
              <span style={{ color: 'rgba(200,185,155,0.6)' }}>{score}</span>
              <span style={{ color: 'rgba(212,175,55,0.5)', fontSize: '0.65rem', margin: '0 3px' }}>→</span>
              <span style={{ color: 'rgba(255,220,80,0.95)' }}>{preview}</span>
              <span style={{ color: 'rgba(160,220,130,0.7)', fontSize: '0.62rem', marginLeft: '4px' }}>
                ({mod >= 0 ? '+' : ''}{mod})
              </span>
            </span>
          ) : (
            <span style={{
              fontFamily: 'Cinzel, serif', fontSize: '0.78rem', fontWeight: 900,
              color: 'rgba(235,225,205,0.75)',
            }}>
              {score}
              <span style={{ color: 'rgba(160,145,118,0.4)', fontSize: '0.62rem', marginLeft: '4px' }}>
                ({mod >= 0 ? '+' : ''}{mod})
              </span>
            </span>
          )}
        </div>

        {/* + button */}
        <button
          onClick={() => addPoint(statKey)}
          disabled={!canAdd}
          style={{
            width: '22px', height: '22px', borderRadius: '3px',
            background: canAdd ? 'rgba(212,175,55,0.15)' : 'rgba(255,255,255,0.03)',
            border: `1px solid ${canAdd ? 'rgba(212,175,55,0.55)' : 'rgba(255,255,255,0.06)'}`,
            color: canAdd ? 'rgba(255,225,100,0.9)' : 'rgba(255,255,255,0.15)',
            cursor: canAdd ? 'pointer' : 'default',
            fontFamily: 'Cinzel, serif', fontSize: '0.8rem', fontWeight: 900,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            lineHeight: 1, flexShrink: 0,
            transition: 'all 0.15s',
            boxShadow: canAdd ? '0 0 6px rgba(212,175,55,0.2)' : 'none',
          }}
          onMouseEnter={e => { if (canAdd) e.currentTarget.style.background = 'rgba(212,175,55,0.25)'; }}
          onMouseLeave={e => { if (canAdd) e.currentTarget.style.background = 'rgba(212,175,55,0.15)'; }}
        >+</button>
      </div>
    );
  };

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto', paddingBottom: '40px' }}>

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
          width: '220px', flexShrink: 0,
          background: 'rgba(0,0,0,0.4)',
          borderRight: '1px solid rgba(212,175,55,0.1)',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          padding: '24px 16px 20px', gap: '12px',
        }}>

          {/* Portrait */}
          <div style={{
            width: '160px', aspectRatio: '3/4', borderRadius: '2px', overflow: 'hidden',
            border: '1px solid rgba(212,175,55,0.2)', background: 'rgba(0,0,0,0.5)', flexShrink: 0,
            filter: curseLevel === 3 ? 'saturate(0.35) brightness(0.75) sepia(0.3)'
                  : curseLevel === 2 ? 'saturate(0.6) brightness(0.88)' : 'none',
            transition: 'filter 0.5s ease',
          }}>
            <img src={getHeroPortrait(hero.class.name, hero.gender)} alt={hero.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }}
              onError={e => { e.currentTarget.style.display = 'none'; }}
            />
          </div>

          {/* Name */}
          <div style={{ textAlign: 'center', width: '100%' }}>
            <p style={{ fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: 'clamp(0.9rem,2vw,1.1rem)', letterSpacing: '0.08em', color: 'rgba(240,228,200,0.9)', margin: '0 0 3px' }}>{hero.name}</p>
            <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.55)', margin: '0 0 2px' }}>{hero.class.name}</p>
            <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.58rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(180,165,135,0.4)', margin: 0 }}>{hero.title}</p>
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

          {/* Soren */}
          <div style={{ marginTop: 'auto', paddingTop: '12px', width: '100%' }}>
            <Divider />
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginTop: '10px' }}>
              <img src="/npcs/elf-warrior.png" alt="Soren"
                style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover', objectPosition: 'top', border: '1px solid rgba(212,175,55,0.2)', flexShrink: 0, opacity: 0.75 }}
                onError={e => { e.currentTarget.style.display = 'none'; }}
              />
              <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.56rem', fontStyle: 'italic', color: 'rgba(190,170,130,0.38)', lineHeight: 1.55, margin: 0 }}>
                "{sorenQuote}"<br />
                <span style={{ fontStyle: 'normal', color: 'rgba(212,175,55,0.3)', fontSize: '0.52rem', letterSpacing: '0.1em' }}>— Soren</span>
              </p>
            </div>
          </div>

        </div>

        {/* RIGHT: Stats column */}
        <div style={{ flex: 1, padding: '24px 28px', overflowY: 'auto' }}>

          {/* Header row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
            <span style={{ fontFamily: 'Cinzel, serif', fontSize: '0.6rem', fontWeight: 900, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.4)' }}>
              The Chronicle
            </span>
            {guildRank && (
              <span style={{ fontFamily: 'Cinzel, serif', fontSize: '0.6rem', fontWeight: 900, letterSpacing: '0.18em', textTransform: 'uppercase', color: guildRank.name === 'Initiate' ? 'rgba(180,160,120,0.4)' : guildRank.color, opacity: 0.75 }}>
                {guildRank.name}
              </span>
            )}
          </div>
          <Divider gold />

          <StatRowStatic label="Level"    value={level}              highlight />
          <StatRowStatic label="Day"      value={currentDay} />
          <StatRowStatic label="Total XP" value={xp.toLocaleString()} />

          {/* ── ATTRIBUTES ── */}
          <SectionHeader
            label="Attributes"
            badge={isAllocating ? `${remaining} point${remaining !== 1 ? 's' : ''} to spend` : null}
          />
          <Divider />

          {isAllocating ? (
            /* Allocation mode */
            <>
              {['str', 'dex', 'con', 'int', 'wis', 'cha'].map(key => (
                <AbilityAllocRow key={key} statKey={key} />
              ))}

              {/* Confirm button */}
              <div style={{ marginTop: '12px' }}>
                <button
                  onClick={confirmAlloc}
                  disabled={!allAllocated}
                  style={{
                    width: '100%', fontFamily: 'Cinzel, serif', fontSize: '0.68rem',
                    letterSpacing: '0.22em', textTransform: 'uppercase', padding: '10px',
                    borderRadius: '3px', cursor: allAllocated ? 'pointer' : 'not-allowed',
                    background: allAllocated ? 'rgba(212,175,55,0.15)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${allAllocated ? 'rgba(212,175,55,0.6)' : 'rgba(255,255,255,0.07)'}`,
                    color: allAllocated ? 'rgba(255,225,100,0.9)' : 'rgba(255,255,255,0.18)',
                    boxShadow: allAllocated ? '0 0 14px rgba(212,175,55,0.2)' : 'none',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { if (allAllocated) { e.currentTarget.style.background = 'rgba(212,175,55,0.25)'; e.currentTarget.style.boxShadow = '0 0 20px rgba(212,175,55,0.35)'; } }}
                  onMouseLeave={e => { if (allAllocated) { e.currentTarget.style.background = 'rgba(212,175,55,0.15)'; e.currentTarget.style.boxShadow = '0 0 14px rgba(212,175,55,0.2)'; } }}
                >
                  {allAllocated ? 'Confirm Advancement' : `Distribute ${remaining} remaining point${remaining !== 1 ? 's' : ''}`}
                </button>
              </div>
            </>
          ) : (
            /* Read-only mode */
            ['str', 'dex', 'con', 'int', 'wis', 'cha'].map(key => {
              const score = ab[key] || 10;
              const mod   = Math.floor((score - 10) / 2);
              const isPrimary = key === primaryKey;
              return (
                <StatRowStatic
                  key={key}
                  label={`${ABILITY_LABEL[key]}${isPrimary ? ' ★' : ''}`}
                  value={`${score}  (${mod >= 0 ? '+' : ''}${mod})`}
                  highlight={isPrimary}
                />
              );
            })
          )}

          {/* ── DERIVED STATS ── */}
          <SectionHeader label="Derived Stats" />
          <Divider />

          <StatRowStatic label="Max HP"  value={maxHp}       highlight />
          <StatRowStatic label="Max SP"  value={maxSp}       highlight />
          <StatRowStatic label="Attack"  value={atk}         highlight />
          <StatRowStatic label="Defense" value={`${defPct}%`} highlight />

          <StatRowStatic label="Base HP"     value={GAME_CONSTANTS.MAX_HP}  dim indent />
          {conMod > 0 && <StatRowStatic label="CON Bonus"  value={`+${conMod * 5}`} dim indent />}
          {equippedGrimoire?.hp && <StatRowStatic label="Pendant"   value={`+${equippedGrimoire.hp}`} dim indent />}
          <StatRowStatic label="Base ATK"    value={classBaseAtk}           dim indent />
          {strMod > 0 && <StatRowStatic label="STR Bonus"  value={`+${strMod}`}     dim indent />}
          {equippedWeapon && <StatRowStatic label={equippedWeapon.name || 'Weapon'} value={`+${equippedWeapon.attack}`} dim indent />}
          <StatRowStatic label="Base DEF"    value={classBaseDef}           dim indent />
          {armorDef > 0 && <StatRowStatic label="Armor"    value={`+${armorDef}`}   dim indent />}

          {/* ── STATUS ── */}
          <SectionHeader label="Status" />
          <Divider />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '5px 0' }}>
            <span style={{ fontFamily: 'Cinzel, serif', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(190,175,148,0.65)' }}>Curse</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '50px', height: '1px', background: 'linear-gradient(to right, transparent, rgba(212,175,55,0.1))' }} />
              <span style={{ fontFamily: 'Cinzel, serif', fontSize: '0.78rem', fontWeight: 900, letterSpacing: '0.05em', color: curseLevel > 0 ? CURSE_COLORS[curseLevel] : 'rgba(180,165,138,0.4)', minWidth: '50px', textAlign: 'right' }}>
                {curseLevel > 0 ? `${CURSE_NAMES[curseLevel]}  (${curseLevel}/3)` : 'None'}
              </span>
            </div>
          </div>

          {/* ── EQUIPMENT ── */}
          {(equippedWeapon || Object.values(equippedArmor || {}).some(a => a)) && (
            <>
              <SectionHeader label="Equipment" />
              <Divider />
              {equippedWeapon && <StatRowStatic label="Weapon" value={equippedWeapon.name || 'Equipped'} />}
              {Object.entries(equippedArmor || {}).map(([slot, piece]) =>
                piece ? <StatRowStatic key={slot} label={slot.charAt(0).toUpperCase() + slot.slice(1)} value={piece.name || 'Equipped'} dim /> : null
              )}
            </>
          )}

          {/* ── SKILL TREE ── */}
          <div style={{ marginTop: '20px' }}>
            <button
              onClick={() => setShowSkillTree(v => !v)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', padding: 0, display: 'flex', alignItems: 'center', gap: '10px' }}
            >
              <span style={{ fontFamily: 'Cinzel, serif', fontSize: '0.58rem', fontWeight: 900, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.4)' }}>Skill Tree</span>
              {skillPoints > 0 && (
                <span style={{
                  fontFamily: 'Cinzel, serif', fontSize: '0.56rem', fontWeight: 900,
                  letterSpacing: '0.12em', textTransform: 'uppercase',
                  color: 'rgba(255,220,80,0.9)',
                  background: 'rgba(212,175,55,0.15)',
                  border: '1px solid rgba(212,175,55,0.4)',
                  borderRadius: '3px', padding: '1px 6px',
                  animation: 'pulse 2s ease-in-out infinite',
                }}>
                  {skillPoints} pt{skillPoints !== 1 ? 's' : ''}
                </span>
              )}
              <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, rgba(212,175,55,0.15), transparent)' }} />
              <span style={{ fontFamily: 'Cinzel, serif', fontSize: '0.55rem', color: 'rgba(212,175,55,0.3)', letterSpacing: '0.1em' }}>{showSkillTree ? '▲ hide' : '▼ show'}</span>
            </button>

            {showSkillTree && (() => {
              const CLASS_TREES = { Knight: KNIGHT_SKILL_TREE, Wizard: WIZARD_SKILL_TREE, Assassin: ASSASSIN_SKILL_TREE, Crusader: CRUSADER_SKILL_TREE };
              const tree = CLASS_TREES[hero.class?.name];
              if (!tree) return (
                <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.58rem', color: 'rgba(150,130,100,0.3)', textAlign: 'center', fontStyle: 'italic', marginTop: '16px' }}>
                  Skill tree coming soon.
                </p>
              );

              const byTierBranch = {};
              tree.forEach(n => {
                const key = `${n.tier}-${n.branch}`;
                if (!byTierBranch[key]) byTierBranch[key] = [];
                byTierBranch[key].push(n);
              });

              return (
                <div style={{ marginTop: '16px' }}>
                  {/* Branch labels */}
                  {(() => {
                    const cls = hero.class?.name;
                    const labels = {
                      Wizard:   { left: 'Fire / Burn',       right: 'Ice / Control',  lc: 'rgba(240,120,60,0.45)',  rc: 'rgba(80,190,240,0.45)' },
                      Assassin: { left: 'Blade / Blood',     right: 'Shadow / Crit',  lc: 'rgba(220,60,60,0.45)',   rc: 'rgba(140,100,220,0.45)' },
                      Crusader: { left: 'Lightning / Wrath', right: 'Shield / Faith', lc: 'rgba(240,210,60,0.45)',  rc: 'rgba(200,200,255,0.45)' },
                    };
                    const l = labels[cls] || { left: 'Offensive', right: 'Defensive', lc: 'rgba(220,120,80,0.45)', rc: 'rgba(80,160,220,0.45)' };
                    return (
                      <div style={{ display: 'flex', gap: '12px', marginBottom: '8px' }}>
                        <div style={{ flex: 1, textAlign: 'center' }}>
                          <span style={{ fontFamily: 'Cinzel, serif', fontSize: '0.52rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: l.lc }}>{l.left}</span>
                        </div>
                        <div style={{ flex: 1, textAlign: 'center' }}>
                          <span style={{ fontFamily: 'Cinzel, serif', fontSize: '0.52rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: l.rc }}>{l.right}</span>
                        </div>
                      </div>
                    );
                  })()}

                  {[1, 2, 3].map(tier => (
                    <div key={tier} style={{ display: 'flex', gap: '12px', marginBottom: '10px' }}>
                      {['left', 'right'].map(branch => {
                        const nodes = byTierBranch[`${tier}-${branch}`] || [];
                        return (
                          <div key={branch} style={{ flex: 1, display: 'flex', gap: '6px' }}>
                            {nodes.map(node => {
                              const isUnlocked = unlockedSkillNodes.includes(node.id);
                              const reqsMet = node.requires.every(r => unlockedSkillNodes.includes(r));
                              // Branch lock: once a T1 root is chosen, the opposite branch is locked
                              const BRANCH_ROOTS = {
                                Knight:   { left: 'kn_battle_forged', right: 'kn_ironclad' },
                                Wizard:   { left: 'wz_spellfire',     right: 'wz_arcane_veil' },
                                Assassin: { left: 'as_serrated_edge', right: 'as_shadowstep' },
                                Crusader: { left: 'cr_storm_blessed', right: 'cr_bulwark' },
                              };
                              let branchLocked = false;
                              const roots = BRANCH_ROOTS[hero.class?.name];
                              if (roots && !isUnlocked) {
                                const hasLeft = unlockedSkillNodes.includes(roots.left);
                                const hasRight = unlockedSkillNodes.includes(roots.right);
                                if (node.branch === 'left' && hasRight) branchLocked = true;
                                if (node.branch === 'right' && hasLeft) branchLocked = true;
                              }
                              const canUnlock = !isUnlocked && reqsMet && skillPoints >= node.cost && !branchLocked;
                              const isAvailable = !isUnlocked && reqsMet && !branchLocked;

                              return (
                                <div key={node.id} style={{
                                  flex: 1, borderRadius: '3px', padding: '8px',
                                  background: isUnlocked
                                    ? 'rgba(212,175,55,0.09)'
                                    : isAvailable ? 'rgba(22,19,11,0.8)' : 'rgba(14,12,7,0.6)',
                                  border: `1px solid ${isUnlocked
                                    ? 'rgba(212,175,55,0.45)'
                                    : isAvailable ? 'rgba(212,175,55,0.18)' : 'rgba(55,50,35,0.2)'}`,
                                  opacity: isAvailable || isUnlocked ? 1 : 0.4,
                                  position: 'relative',
                                  transition: 'all 0.15s',
                                }}>
                                  {isUnlocked && (
                                    <div style={{ position: 'absolute', top: '-3px', right: '-3px', width: '7px', height: '7px', borderRadius: '50%', background: 'rgba(212,175,55,0.9)', boxShadow: '0 0 6px rgba(212,175,55,0.7)' }} />
                                  )}

                                  {/* Icon placeholder — swap node.icon for an img src when ready */}
                                  <div style={{
                                    width: '28px', height: '28px', borderRadius: '2px', margin: '0 auto 5px',
                                    background: isUnlocked ? 'rgba(212,175,55,0.1)' : 'rgba(35,30,18,0.5)',
                                    border: `1px solid ${isUnlocked ? 'rgba(212,175,55,0.28)' : 'rgba(70,62,40,0.2)'}`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                  }}>
                                    {node.icon
                                      ? <img src={node.icon} alt="" style={{ width: '22px', height: '22px', objectFit: 'contain' }} />
                                      : <span style={{ fontSize: '0.55rem', color: isUnlocked ? 'rgba(212,175,55,0.35)' : 'rgba(70,62,42,0.3)' }}>◆</span>
                                    }
                                  </div>

                                  <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.58rem', fontWeight: 900, letterSpacing: '0.04em', textAlign: 'center', margin: '0 0 2px', color: isUnlocked ? 'rgba(230,215,165,0.9)' : isAvailable ? 'rgba(185,170,132,0.7)' : 'rgba(95,87,62,0.4)' }}>
                                    {node.name}
                                  </p>

                                  <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.5rem', textAlign: 'center', margin: '0 0 4px', lineHeight: 1.4, color: isUnlocked ? 'rgba(170,152,108,0.6)' : 'rgba(100,92,65,0.4)' }}>
                                    {node.desc}
                                  </p>

                                  {node.type === 'active' && (
                                    <div style={{ textAlign: 'center', marginBottom: '4px' }}>
                                      <span style={{ fontFamily: 'Cinzel, serif', fontSize: '0.46rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: isUnlocked ? 'rgba(100,175,240,0.65)' : 'rgba(60,90,120,0.35)', background: 'rgba(20,50,90,0.2)', borderRadius: '2px', padding: '1px 4px', border: '1px solid rgba(50,90,150,0.15)' }}>
                                        Active · {node.spCost} SP
                                      </span>
                                    </div>
                                  )}

                                  {!isUnlocked && (
                                    <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.46rem', textAlign: 'center', margin: '0 0 5px', color: 'rgba(140,125,88,0.38)', letterSpacing: '0.04em' }}>
                                      {node.cost} pt{node.cost !== 1 ? 's' : ''}
                                    </p>
                                  )}

                                  {canUnlock && (
                                    <button
                                      onClick={() => onUnlockSkillNode && onUnlockSkillNode(node.id, node.cost)}
                                      style={{
                                        display: 'block', width: '100%', fontFamily: 'Cinzel, serif', fontSize: '0.5rem',
                                        letterSpacing: '0.1em', textTransform: 'uppercase', padding: '4px 0',
                                        borderRadius: '2px', cursor: 'pointer',
                                        background: 'rgba(212,175,55,0.1)',
                                        border: '1px solid rgba(212,175,55,0.42)',
                                        color: 'rgba(255,225,100,0.82)',
                                        transition: 'all 0.15s',
                                      }}
                                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(212,175,55,0.2)'; }}
                                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(212,175,55,0.1)'; }}
                                    >
                                      Unlock
                                    </button>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  ))}

                  <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.54rem', letterSpacing: '0.1em', color: 'rgba(150,130,100,0.22)', textAlign: 'center', fontStyle: 'italic', marginTop: '6px' }}>
                    {skillPoints > 0 ? `${skillPoints} skill point${skillPoints !== 1 ? 's' : ''} available` : 'Earn points by leveling up'}
                  </p>
                </div>
              );
            })()}
          </div>

        </div>
      </div>
    </div>
  );
};

export default HeroTab;
