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

const TIER_LABELS = { 1: 'Grunt', 2: 'Predator', 3: 'Dire', 4: 'Elite', 5: 'Legendary' };
const TIER_COLORS = { 1: '#A8A8A8', 2: '#CD7F32', 3: '#DC2626', 4: '#A855F7', 5: '#F59E0B' };
const TIER_BORDER = { 1: 'rgba(168,168,168,0.35)', 2: 'rgba(205,127,50,0.45)', 3: 'rgba(220,38,38,0.45)', 4: 'rgba(168,85,247,0.45)', 5: 'rgba(245,158,11,0.55)' };
const TIER_GLOW   = { 1: 'rgba(168,168,168,0.08)', 2: 'rgba(205,127,50,0.1)', 3: 'rgba(220,38,38,0.1)', 4: 'rgba(168,85,247,0.12)', 5: 'rgba(245,158,11,0.15)' };

const getMonsterImg = (monster) => {
  if (monster.img) return monster.img;
  // fallback for old saves without img
  if (monster.tier === 5) return '/undead-king.png';
  if (monster.tier === 4) {
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
  const idx = monster.creatureIdx != null ? monster.creatureIdx : (monster.id % 25);
  return `/creatures/creature${1 + (idx % 25)}.png`;
};

const STAT_LABELS = { hp: 'HP', atk: 'ATK', def: 'DEF', spd: 'SPD', mag: 'MAG' };

const CREATURE_INDEX = [
  // T1 — Grunt (weakest, vermin-level)
  { id: 'c1',  name: 'Bloodmaw',              img: '/creatures/creature1.png',  tier: 1, desc: 'A savage predator that hunts by scent alone. Its jaws can crush iron.' },
  { id: 'c4',  name: 'Rot Creeper',           img: '/creatures/creature4.png',  tier: 1, desc: 'A colony of decay given form. Its touch spreads blight to living tissue.' },
  { id: 'c6',  name: 'Plagueborn',            img: '/creatures/creature6.png',  tier: 1, desc: 'Born in the fever-swamps. Where it walks, sickness follows.' },
  { id: 'c8',  name: 'Soulblight',            img: '/creatures/creature8.png',  tier: 1, desc: 'Feeds on the vital essence of the living, leaving hollow shells in its wake.' },
  { id: 'c9',  name: 'Darkfang',              img: '/creatures/creature9.png',  tier: 1, desc: 'Its venom corrodes both body and will. Survivors rarely speak of the encounter.' },
  { id: 'c10', name: 'Frostveil',             img: '/creatures/creature10.png', tier: 1, desc: 'A wraith of frozen air that numbs its prey into stillness before striking.' },
  { id: 'c12', name: 'Ashborn',               img: '/creatures/creature12.png', tier: 1, desc: 'Forged in the embers of a razed village. It carries the wrath of the fallen.' },
  { id: 'c22', name: 'Bog Fiend',             img: '/creatures/creature22.png', tier: 1, desc: 'Pulls victims beneath the mire. None have returned from its domain.' },
  // T2 — Predator (dangerous, territorial)
  { id: 'c2',  name: 'Graveborn Crusher',     img: '/creatures/creature2.png',  tier: 2, desc: 'Risen from mass graves, it shambles forward with unstoppable weight.' },
  { id: 'c5',  name: 'Bonescale Fiend',       img: '/creatures/creature5.png',  tier: 2, desc: 'Plated in fused bone, it shrugs off blows that would fell a lesser beast.' },
  { id: 'c11', name: 'Bloodthorn',            img: '/creatures/creature11.png', tier: 2, desc: 'A cursed bramble-creature that bleeds its victims dry through barbed tendrils.' },
  { id: 'c15', name: 'Thunderhide',           img: '/creatures/creature15.png', tier: 2, desc: 'A brute whose hide conducts lightning. Striking it risks a deadly discharge.' },
  { id: 'c16', name: 'Briarhunter',           img: '/creatures/creature16.png', tier: 2, desc: 'Stalks prey through dense undergrowth. Silent until the moment it lunges.' },
  { id: 'c17', name: 'Emberspecter',          img: '/creatures/creature17.png', tier: 2, desc: 'The ghost of something burned alive. It radiates searing heat in all directions.' },
  { id: 'c18', name: 'Viperous Shade',        img: '/creatures/creature18.png', tier: 2, desc: 'Half serpent, half shadow. Its bite poisons the mind as much as the body.' },
  { id: 'c19', name: 'Stoneblight',           img: '/creatures/creature19.png', tier: 2, desc: 'A slow, grinding horror. Its presence petrifies the ground beneath it.' },
  { id: 'c21', name: 'Stormscreech',          img: '/creatures/creature21.png', tier: 2, desc: 'A flying predator that calls lightning down on fleeing prey.' },
  // T3 — Dire (terrifying, borderline elite)
  { id: 'c3',  name: 'Shadowflesh',           img: '/creatures/creature3.png',  tier: 3, desc: 'Its body shifts between shadow and flesh, making it nearly impossible to strike.' },
  { id: 'c7',  name: 'Death Hollow',          img: '/creatures/creature7.png',  tier: 3, desc: 'A hollow vessel animated by residual death magic. It knows no pain.' },
  { id: 'c13', name: 'Grave Sentinel',        img: '/creatures/creature13.png', tier: 3, desc: 'An ancient guardian bound to protect a tomb long since plundered.' },
  { id: 'c14', name: 'Dusk Wraith',           img: '/creatures/creature14.png', tier: 3, desc: 'Emerges only at twilight. Its wail paralyzes those who hear it.' },
  { id: 'c20', name: 'Tomb Horror',           img: '/creatures/creature20.png', tier: 3, desc: 'Dragged from the deep dark of burial crypts. It despises the living.' },
  { id: 'c23', name: 'Void Spawn',            img: '/creatures/creature23.png', tier: 3, desc: 'A fragment of the void given grotesque form. It hungers without end.' },
  { id: 'c24', name: 'Lava Fiend',            img: '/creatures/creature24.png', tier: 3, desc: 'Crawls from volcanic fissures. Its body burns at temperatures that melt steel.' },
  { id: 'c25', name: 'Rift Horror',           img: '/creatures/creature25.png', tier: 3, desc: 'Slips between planes of existence. Wounds from it do not heal naturally.' },
  // T4 — Elite (named, unique)
  { id: 'e1',  name: 'Morvane, the Frozen Condemned',   img: '/bosses/frozen-zombie.png',         tier: 4, desc: 'A warrior executed in winter and cursed to walk forever. His rage has not thawed in three centuries.' },
  { id: 'e2',  name: 'Seraphine the Bloodless',          img: '/bosses/undead-vampire-woman.png',  tier: 4, desc: 'Once a high priestess, now an undying predator. She drains life with a whisper.' },
  { id: 'e3',  name: 'Grakthar the Unbroken',            img: '/bosses/orc-chief.png',             tier: 4, desc: 'No blade has ever drawn his blood. He has crushed every challenger beneath his fists.' },
  { id: 'e4',  name: 'Gryvara, Ironblood Matriarch',     img: '/bosses/orc-lady.png',              tier: 4, desc: 'Commander of a dozen warbands. She leads from the front and leaves nothing standing.' },
  { id: 'e5',  name: 'Korruk the Merciless',             img: '/bosses/orc-warrior.png',           tier: 4, desc: 'Has never offered quarter and never asked for it. His battlefield record spans forty years of war.' },
  // T5 — Legendary (apex, named with titles)
  { id: 'l1',  name: 'Sylvaris, Queen of Ruin',          img: '/bosses/dark-elf-queen.png',        tier: 5, desc: 'She dismantled an empire from within. Now she builds something far worse from its ashes.' },
  { id: 'l2',  name: 'Malachar, the Eternal Lich',       img: '/undead-king.png',                  tier: 5, desc: 'His phylactery has never been found. He has died seventeen times and returned each time stronger.' },
];

const getFusionResult = (a, b) => {
  if (!a || !b || a.tier !== b.tier || a.tier >= 5) return null;
  const pool = CREATURE_INDEX.filter(c => c.tier === a.tier + 1);
  if (!pool.length) return null;
  const seed = (a.name + b.name).split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return pool[seed % pool.length];
};

const BestiaryTab = ({ capturedMonsters, setCapturedMonsters, addLog }) => {
  const [kaelQuote, setKaelQuote] = useState(() => KAEL_IDLE[Math.floor(Math.random() * KAEL_IDLE.length)]);
  const [openStats, setOpenStats] = useState({});
  const [activeTab, setActiveTab] = useState('stable');
  const [fusionSlots, setFusionSlots] = useState([null, null]); // IDs of selected monsters
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
        {/* Tab bar */}
        <div style={{ display: 'flex', flexShrink: 0, borderBottom: '1px solid rgba(212,175,55,0.2)', background: 'rgba(0,0,0,0.3)' }}>
          {[{ key: 'stable', label: 'Stable' }, { key: 'index', label: 'Creature Index' }, { key: 'fusion', label: '⚗ Fusion' }].map(t => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              style={{
                flex: 1, padding: '12px', fontFamily: 'Cinzel, serif', fontWeight: 700,
                fontSize: '0.82rem', letterSpacing: '0.15em', textTransform: 'uppercase',
                cursor: 'pointer', transition: 'all 0.2s', border: 'none',
                background: activeTab === t.key ? 'rgba(212,175,55,0.12)' : 'transparent',
                color: activeTab === t.key ? '#D4AF37' : 'rgba(212,175,55,0.4)',
                borderBottom: `2px solid ${activeTab === t.key ? '#D4AF37' : 'transparent'}`,
              }}
            >{t.label}</button>
          ))}
        </div>

        {/* Fixed sub-header: stable capacity bar (Stable tab only) */}
        {activeTab === 'stable' && (
        <div style={{ flexShrink: 0, padding: '16px 24px 0' }}>
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
        )}

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px 24px' }}>
          {/* ── CREATURE INDEX TAB ── */}
          {activeTab === 'index' && (
            <div>
              {[5, 4, 3, 2, 1].map(tier => {
                const entries = CREATURE_INDEX.filter(c => c.tier === tier);
                const tierLabel = TIER_LABELS[tier];
                return (
                  <div key={tier} style={{ marginBottom: '32px' }}>
                    {/* Tier section header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                      <div style={{ flex: 1, height: '1px', background: `linear-gradient(to right, transparent, ${TIER_BORDER[tier]})` }}/>
                      <span style={{ fontFamily: 'Cinzel, serif', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: TIER_COLORS[tier] }}>
                        ◆ {tierLabel}
                      </span>
                      <div style={{ flex: 1, height: '1px', background: `linear-gradient(to left, transparent, ${TIER_BORDER[tier]})` }}/>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
                      {entries.map(creature => (
                        <div key={creature.id} style={{
                          borderRadius: '12px', padding: '22px 14px 18px', textAlign: 'center',
                          background: `linear-gradient(135deg, ${TIER_GLOW[creature.tier]}, rgba(0,0,0,0.55))`,
                          border: `1px solid ${TIER_BORDER[creature.tier]}`,
                          boxShadow: `0 4px 16px rgba(0,0,0,0.4), 0 0 24px ${TIER_GLOW[creature.tier]}`,
                          position: 'relative',
                        }}>
                          {/* Entry number within tier */}
                          <div style={{
                            position: 'absolute', top: '8px', left: '10px',
                            fontFamily: 'Cinzel, serif', fontSize: '0.65rem', fontWeight: 700,
                            color: TIER_COLORS[creature.tier], opacity: 0.7,
                          }}>
                            #{entries.indexOf(creature) + 1}
                          </div>
                          <img
                            src={creature.img}
                            alt={creature.name}
                            style={{
                              width: 110, height: 110, objectFit: 'contain', margin: '0 auto 14px', display: 'block',
                              filter: `drop-shadow(0 0 10px ${TIER_COLORS[creature.tier]}55)`,
                            }}
                          />
                          <p style={{
                            fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: '0.88rem',
                            color: TIER_COLORS[creature.tier], lineHeight: 1.35, marginBottom: '10px',
                          }}>{creature.name}</p>
                          {creature.desc && (
                            <p style={{
                              fontSize: '0.72rem', color: 'rgba(245,245,220,0.65)',
                              fontStyle: 'italic', lineHeight: 1.5, margin: 0,
                            }}>{creature.desc}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── FUSION TAB ── */}
          {activeTab === 'fusion' && (() => {
            const slotA = capturedMonsters.find(m => m.id === fusionSlots[0]) || null;
            const slotB = capturedMonsters.find(m => m.id === fusionSlots[1]) || null;
            const result = getFusionResult(slotA, slotB);
            const tierMismatch = slotA && slotB && slotA.tier !== slotB.tier;
            const canFuse = !!result;

            const selectForSlot = (monsterId) => {
              setFusionSlots(prev => {
                if (prev[0] === monsterId) return [null, prev[1]];
                if (prev[1] === monsterId) return [prev[0], null];
                if (!prev[0]) return [monsterId, prev[1]];
                if (!prev[1]) return [prev[0], monsterId];
                return [monsterId, prev[1]];
              });
            };

            const performFusion = () => {
              if (!canFuse) return;
              const newMonster = {
                ...result,
                id: `fused_${Date.now()}`,
                fusedFrom: [slotA.name, slotB.name],
              };
              setCapturedMonsters(prev => [
                ...prev.filter(m => m.id !== slotA.id && m.id !== slotB.id),
                newMonster,
              ]);
              setFusionSlots([null, null]);
              addLog(`Fusion complete — ${newMonster.name} emerged from the ritual.`);
            };

            const SlotCard = ({ monster, slotIdx }) => (
              <div style={{
                flex: 1, minHeight: 180, borderRadius: '12px', padding: '16px', textAlign: 'center',
                background: monster ? `linear-gradient(135deg, ${TIER_GLOW[monster.tier]}, rgba(0,0,0,0.6))` : 'rgba(0,0,0,0.3)',
                border: `2px dashed ${monster ? TIER_BORDER[monster.tier] : 'rgba(212,175,55,0.2)'}`,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px',
                position: 'relative',
              }}>
                <div style={{ fontSize: '0.6rem', fontFamily: 'Cinzel, serif', letterSpacing: '0.2em', color: 'rgba(212,175,55,0.4)', marginBottom: '4px' }}>
                  SLOT {slotIdx + 1}
                </div>
                {monster ? (
                  <>
                    <img src={getMonsterImg(monster)} alt={monster.name} style={{ width: 72, height: 72, objectFit: 'contain', filter: `drop-shadow(0 0 8px ${TIER_COLORS[monster.tier]}66)` }} />
                    <p style={{ fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: '0.8rem', color: TIER_COLORS[monster.tier], lineHeight: 1.3, margin: 0 }}>{monster.name}</p>
                    <span style={{ fontSize: '0.65rem', color: TIER_COLORS[monster.tier], opacity: 0.7, background: 'rgba(0,0,0,0.5)', padding: '2px 8px', borderRadius: '4px', border: `1px solid ${TIER_BORDER[monster.tier]}` }}>{TIER_LABELS[monster.tier]}</span>
                    <button onClick={() => setFusionSlots(prev => prev.map((v, i) => i === slotIdx ? null : v))} style={{ fontSize: '0.65rem', color: 'rgba(239,68,68,0.6)', background: 'none', border: 'none', cursor: 'pointer', marginTop: '4px' }}>✕ Remove</button>
                  </>
                ) : (
                  <p style={{ color: 'rgba(212,175,55,0.3)', fontStyle: 'italic', fontSize: '0.8rem' }}>Select a creature below</p>
                )}
              </div>
            );

            return (
              <div>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                  <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.72rem', color: 'rgba(212,175,55,0.5)', letterSpacing: '0.2em', textTransform: 'uppercase', margin: '0 0 6px' }}>Ritual of Binding</p>
                  <p style={{ fontSize: '0.78rem', color: 'rgba(245,245,220,0.5)', fontStyle: 'italic', margin: 0 }}>Select two creatures of the same tier to fuse them into something stronger.</p>
                </div>

                {/* Fusion slots + arrow + result */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                  <SlotCard monster={slotA} slotIdx={0} />
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                    <span style={{ fontSize: '1.5rem', color: tierMismatch ? '#EF4444' : canFuse ? '#D4AF37' : 'rgba(212,175,55,0.2)' }}>⚗</span>
                    <span style={{ fontSize: '0.9rem', color: tierMismatch ? '#EF4444' : canFuse ? '#D4AF37' : 'rgba(212,175,55,0.2)' }}>→</span>
                  </div>
                  <SlotCard monster={slotB} slotIdx={1} />
                </div>

                {/* Tier mismatch warning */}
                {tierMismatch && (
                  <p style={{ textAlign: 'center', color: '#EF4444', fontSize: '0.78rem', fontStyle: 'italic', marginBottom: '16px' }}>
                    Both creatures must be the same tier to fuse.
                  </p>
                )}

                {/* Result preview */}
                {canFuse && (
                  <div style={{ textAlign: 'center', marginBottom: '20px', padding: '16px', borderRadius: '12px', background: `linear-gradient(135deg, ${TIER_GLOW[result.tier]}, rgba(0,0,0,0.5))`, border: `1px solid ${TIER_BORDER[result.tier]}` }}>
                    <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.65rem', letterSpacing: '0.2em', color: 'rgba(212,175,55,0.5)', marginBottom: '10px' }}>FUSION RESULT</p>
                    <img src={result.img} alt={result.name} style={{ width: 80, height: 80, objectFit: 'contain', margin: '0 auto 10px', display: 'block', filter: `drop-shadow(0 0 12px ${TIER_COLORS[result.tier]}88)` }} />
                    <p style={{ fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: '1rem', color: TIER_COLORS[result.tier], marginBottom: '4px' }}>{result.name}</p>
                    <span style={{ fontSize: '0.65rem', color: TIER_COLORS[result.tier], opacity: 0.8, background: 'rgba(0,0,0,0.5)', padding: '2px 10px', borderRadius: '4px', border: `1px solid ${TIER_BORDER[result.tier]}` }}>{TIER_LABELS[result.tier]}</span>
                    <p style={{ fontSize: '0.72rem', color: 'rgba(245,245,220,0.55)', fontStyle: 'italic', marginTop: '10px', lineHeight: 1.5 }}>{result.desc}</p>
                    <button
                      onClick={performFusion}
                      style={{
                        marginTop: '14px', padding: '10px 32px', fontFamily: 'Cinzel, serif', fontWeight: 700,
                        fontSize: '0.85rem', letterSpacing: '0.15em', cursor: 'pointer', borderRadius: '8px',
                        background: `linear-gradient(135deg, ${TIER_GLOW[result.tier]}, rgba(0,0,0,0.7))`,
                        border: `1px solid ${TIER_COLORS[result.tier]}`, color: TIER_COLORS[result.tier],
                        textTransform: 'uppercase',
                      }}
                    >
                      Perform Fusion
                    </button>
                  </div>
                )}

                {/* Stable creature picker */}
                <div style={{ borderTop: '1px solid rgba(212,175,55,0.15)', paddingTop: '20px' }}>
                  <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.65rem', letterSpacing: '0.2em', color: 'rgba(212,175,55,0.4)', textTransform: 'uppercase', marginBottom: '12px' }}>Your Stable</p>
                  {capturedMonsters.length === 0 ? (
                    <p style={{ color: 'rgba(192,192,192,0.4)', fontStyle: 'italic', fontSize: '0.8rem' }}>No creatures in your stable.</p>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px' }}>
                      {capturedMonsters.map(monster => {
                        const inSlot = fusionSlots.includes(monster.id);
                        return (
                          <button
                            key={monster.id}
                            onClick={() => selectForSlot(monster.id)}
                            style={{
                              borderRadius: '10px', padding: '12px 10px', textAlign: 'center', cursor: 'pointer',
                              background: inSlot ? `linear-gradient(135deg, ${TIER_GLOW[monster.tier]}, rgba(0,0,0,0.4))` : 'rgba(0,0,0,0.35)',
                              border: `1px solid ${inSlot ? TIER_COLORS[monster.tier] : TIER_BORDER[monster.tier]}`,
                              boxShadow: inSlot ? `0 0 16px ${TIER_COLORS[monster.tier]}44` : 'none',
                              transition: 'all 0.15s',
                            }}
                          >
                            <img src={getMonsterImg(monster)} alt={monster.name} style={{ width: 52, height: 52, objectFit: 'contain', display: 'block', margin: '0 auto 8px', filter: `drop-shadow(0 0 6px ${TIER_COLORS[monster.tier]}55)` }} />
                            <p style={{ fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: '0.72rem', color: TIER_COLORS[monster.tier], margin: '0 0 4px', lineHeight: 1.3 }}>{monster.name}</p>
                            <span style={{ fontSize: '0.6rem', color: TIER_COLORS[monster.tier], opacity: 0.6 }}>{TIER_LABELS[monster.tier]}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* ── STABLE TAB ── */}
          {activeTab === 'stable' && capturedMonsters.length === 0 ? (
            <div className="text-center py-16 rounded-lg border-2" style={{
              background: 'rgba(0,0,0,0.3)',
              borderColor: 'rgba(212,175,55,0.2)',
              borderStyle: 'dashed',
            }}>
              <p className="text-lg mb-2" style={{ color: '#C0C0C0' }}>The stable is empty.</p>
              <p className="text-sm" style={{ color: '#9CA3AF' }}>Defeat bosses in battle and choose to capture them.</p>
            </div>
          ) : activeTab === 'stable' ? (
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
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default BestiaryTab;
