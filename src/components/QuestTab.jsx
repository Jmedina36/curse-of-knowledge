import React from 'react';
import { HeartPulse, ShieldCheck, Sparkles, Swords } from 'lucide-react';
import { COLORS, VISUAL_STYLES, GAME_CONSTANTS } from '../constants';
import { sounds } from '../sounds';

const GUILD_RANKS = [
  { min: 1,  max: 2,  name: 'Initiate',    color: 'rgba(180,180,180,0.75)' },
  { min: 3,  max: 4,  name: 'Apprentice',  color: 'rgba(180,180,180,0.85)' },
  { min: 5,  max: 6,  name: 'Journeyman',  color: 'rgba(180,160,100,0.9)'  },
  { min: 7,  max: 9,  name: 'Adept',       color: 'rgba(212,175,55,0.95)'  },
  { min: 10, max: 14, name: 'Master',       color: 'rgba(230,200,80,1)'     },
  { min: 15, max: 999,name: 'Grand Master', color: 'rgba(255,220,100,1)'    },
];
const getGuildRank = (level) => GUILD_RANKS.find(r => level >= r.min && level <= r.max) || GUILD_RANKS[0];

const getHeroPortrait = (className, gender) => {
  const classMap = { Knight: 'knight', Wizard: 'sorcerer', Assassin: 'thief', Crusader: 'crusader' };
  const g = gender === 'female' ? 'f' : gender === 'male' ? 'm' : gender || 'm';
  return `/npcs/${classMap[className] || 'knight'}-${g}.png`;
};

const QuestTab = ({
  // Hero / player state
  hero,
  hp,
  stamina,
  xp,
  level,
  gold,
  currentDay,
  curseLevel,
  isDayActive,
  timeUntilMidnight,
  consecutiveDays,
  skipCount,
  miniBossCount,
  gauntletUnlocked,
  gauntletMilestone,
  eliteBossDefeatedToday,
  debugWarningState,
  // Equipment
  equippedWeapon,
  equippedArmor,
  equippedPendant,
  equippedRing,
  weaponOilActive,
  armorPolishActive,
  luckyCharmActive,
  // Computed stats
  getMaxHp,
  getMaxStamina,
  getBaseAttack,
  getBaseDefense,
  getCardStyle,
  // Modal triggers
  setSuppliesTab,
  setShowInventoryModal,
  setShowCraftingModal,
  capturedMonsters,
  fusionCrystals,
  onReleaseMonster,
}) => {
  return (
            <div className="space-y-4">
            <div className="rounded-xl p-4 max-w-2xl mx-auto relative overflow-hidden" style={{
              backgroundImage: 'url(/Updated%20scroll.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              border: (() => { const m={red:'rgba(180,30,30,0.5)',blue:'rgba(59,130,246,0.4)',green:'rgba(16,185,129,0.4)',white:'rgba(200,200,200,0.35)',purple:'rgba(139,92,246,0.4)',yellow:'rgba(212,175,55,0.4)',amber:'rgba(34,197,94,0.4)'}; return '2px solid '+(m[hero.class.color]||m.yellow); })(),
              boxShadow: (() => { const m={red:'rgba(180,30,30,0.25)',blue:'rgba(59,130,246,0.2)',green:'rgba(16,185,129,0.2)',white:'rgba(200,200,200,0.15)',purple:'rgba(139,92,246,0.2)',yellow:'rgba(212,175,55,0.2)',amber:'rgba(34,197,94,0.2)'}; const g=m[hero.class.color]||m.yellow; return '0 4px 30px '+g+', 0 0 60px '+g; })()
            }}>

              {/* RPG Character Sheet layout — ink on parchment */}
              <>
              {/* Watermark emblem */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{fontSize:'20rem',lineHeight:1,opacity:0.06,color:'#3D1F08'}}>
                {getCardStyle(hero.class, currentDay).emblem}
              </div>

              {/* Corner badges */}
              <div className="absolute top-0 left-0 px-3 py-1 rounded-br-lg z-20" style={{background:'rgba(200,170,120,0.5)',border:'1px solid rgba(100,60,20,0.35)',borderTop:'none',borderLeft:'none'}}>
                <span className="text-xs font-bold" style={{color:'#3D1F08',letterSpacing:'0.1em',fontFamily:'Cinzel,serif'}}>DAY {currentDay}</span>
              </div>
              <div className="absolute top-0 right-0 px-3 py-1 rounded-bl-lg z-20" style={{background:'rgba(200,170,120,0.5)',border:'1px solid rgba(100,60,20,0.35)',borderTop:'none',borderRight:'none'}}>
                <span className="text-xs font-bold" style={{color:'#3D1F08',letterSpacing:'0.1em',fontFamily:'Cinzel,serif'}}>LVL {level} • {getGuildRank(level).name}</span>
              </div>

              <div className="relative z-10 pt-8">
                <div style={{display:'flex',gap:'16px',alignItems:'flex-start'}}>

                  {/* ── LEFT: Portrait column ── */}
                  <div style={{flexShrink:0,width:'clamp(90px,22%,130px)',display:'flex',flexDirection:'column',alignItems:'center',gap:'6px'}}>
                    <div style={{
                      width:'100%',aspectRatio:'3/4',borderRadius:'6px',overflow:'hidden',position:'relative',
                      border:'2px solid rgba(80,45,15,0.6)',
                      boxShadow:'0 2px 12px rgba(0,0,0,0.35)',
                    }}>
                      <img src={getHeroPortrait(hero.class.name, hero.gender)} alt={hero.name}
                        style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:'top'}}
                        onError={e=>{e.currentTarget.style.display='none';}}
                      />
                    </div>
                    <p style={{fontFamily:'Cinzel,serif',fontWeight:900,fontSize:'clamp(0.65rem,1.5vw,0.8rem)',letterSpacing:'0.06em',color:'#2C1A0A',textAlign:'center',lineHeight:1.2,wordBreak:'break-word'}}>{hero.name}</p>
                    <p style={{fontFamily:'Cinzel,serif',fontSize:'0.55rem',letterSpacing:'0.1em',color:'#7A4520',textAlign:'center',textTransform:'uppercase',marginTop:'-2px'}}>{hero.class.name}</p>
                    <p style={{fontFamily:'Cinzel,serif',fontSize:'0.5rem',letterSpacing:'0.08em',color:'#A0692A',textAlign:'center',textTransform:'uppercase',marginTop:'-2px'}}>{hero.title}</p>
                    <div style={{width:'100%',borderRadius:'5px',padding:'4px 6px',background:'rgba(180,140,80,0.25)',border:'1px solid rgba(80,45,15,0.3)',textAlign:'center',marginTop:'2px'}}>
                      <span style={{fontFamily:'Cinzel,serif',fontSize:'0.55rem',color:'#7A4520',letterSpacing:'0.1em',display:'block',marginBottom:'1px'}}>GOLD</span>
                      <span style={{fontFamily:'Cinzel,serif',fontWeight:900,fontSize:'0.9rem',color:'#5C2E00'}}>{gold}</span>
                    </div>
                  </div>

                  {/* ── RIGHT: Stats column ── */}
                  <div style={{flex:1,minWidth:0,display:'flex',flexDirection:'column',gap:'8px'}}>

                    {/* XP bar */}
                    <div className="rounded p-2" style={{background:'rgba(180,140,80,0.2)',border:'1px solid rgba(80,45,15,0.25)'}}>
                      <div className="flex justify-between text-xs mb-1">
                        <span style={{fontFamily:'Cinzel,serif',fontWeight:700,letterSpacing:'0.08em',color:'#5C2E00',textTransform:'uppercase',fontSize:'0.65rem'}}>Experience</span>
                        <span style={{fontFamily:'Cinzel,serif',fontWeight:700,color:'#3D1F08',fontSize:'0.65rem'}}>{(()=>{let s=0;for(let i=1;i<level;i++)s+=Math.floor(GAME_CONSTANTS.XP_PER_LEVEL*Math.pow(1.3,i-1));const cur=xp-s;const need=Math.floor(GAME_CONSTANTS.XP_PER_LEVEL*Math.pow(1.3,level-1));return`${cur} / ${need}`;})()}</span>
                      </div>
                      <div className="rounded-full h-2.5 overflow-hidden" style={{background:'rgba(80,45,15,0.2)',border:'1px solid rgba(80,45,15,0.2)'}}>
                        <div className="h-full rounded-full transition-all duration-300" style={{
                          background:(()=>{const g={red:'linear-gradient(90deg,#7F0000,#C41C1C)',blue:'linear-gradient(90deg,#1E3A8A,#2563EB)',green:'linear-gradient(90deg,#064E3B,#059669)',white:'linear-gradient(90deg,#9CA3AF,#D1D5DB)',purple:'linear-gradient(90deg,#4B0082,#7C3AED)',yellow:'linear-gradient(90deg,#92400E,#B45309)',amber:'linear-gradient(90deg,#14532D,#15803D)'};return g[hero.class.color]||g.yellow;})(),
                          width:`${(()=>{let s=0;for(let i=1;i<level;i++)s+=Math.floor(GAME_CONSTANTS.XP_PER_LEVEL*Math.pow(1.3,i-1));const cur=xp-s;const need=Math.floor(GAME_CONSTANTS.XP_PER_LEVEL*Math.pow(1.3,level-1));return(cur/need)*100;})()}%`
                        }}/>
                      </div>
                    </div>

                    {/* HP + SP bars */}
                    <div style={{display:'flex',flexDirection:'column',gap:'5px'}}>
                      <div className="rounded p-2" style={{background:'rgba(180,140,80,0.2)',border:'1px solid rgba(139,0,0,0.3)'}}>
                        <div className="flex justify-between items-center mb-1">
                          <div className="flex items-center gap-1.5"><HeartPulse size={13} style={{color:'#8B0000'}}/><span style={{fontFamily:'Cinzel,serif',fontSize:'0.6rem',fontWeight:700,color:'#8B0000',letterSpacing:'0.1em'}}>HP</span></div>
                          <span style={{fontFamily:'Cinzel,serif',fontSize:'0.65rem',fontWeight:700,color:hp/getMaxHp()<0.25?'#8B0000':'#2C1A0A'}}>{hp}/{getMaxHp()}</span>
                        </div>
                        <div className="rounded h-2 overflow-hidden" style={{background:'rgba(139,0,0,0.15)'}}><div className="h-full rounded transition-all" style={{width:`${(hp/getMaxHp())*100}%`,background:hp/getMaxHp()<0.25?'#8B0000':'linear-gradient(to right,#7f1d1d,#b91c1c)'}}/></div>
                      </div>
                      <div className="rounded p-2" style={{background:'rgba(180,140,80,0.2)',border:'1px solid rgba(30,58,140,0.3)'}}>
                        <div className="flex justify-between items-center mb-1">
                          <div className="flex items-center gap-1.5"><Sparkles size={13} style={{color:'#1E3A8A'}}/><span style={{fontFamily:'Cinzel,serif',fontSize:'0.6rem',fontWeight:700,color:'#1E3A8A',letterSpacing:'0.1em'}}>SP</span></div>
                          <span style={{fontFamily:'Cinzel,serif',fontSize:'0.65rem',fontWeight:700,color:'#1E3A8A'}}>{stamina}/{getMaxStamina()}</span>
                        </div>
                        <div className="rounded h-2 overflow-hidden" style={{background:'rgba(30,58,140,0.15)'}}><div className="h-full rounded transition-all" style={{width:`${(stamina/getMaxStamina())*100}%`,background:'linear-gradient(to right,#1e3a8a,#2563eb)'}}/></div>
                      </div>
                    </div>

                    {/* ATK + DEF */}
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'6px'}}>
                      {(()=>{const ic=(()=>{const m={red:'#8B0000',blue:'#1E3A8A',green:'#064E3B',white:'#4B5563',purple:'#4B0082',yellow:'#92400E',amber:'#14532D'};return m[hero.class.color]||m.yellow;})();return(<>
                        <div className="rounded p-2 text-center" style={{background:'rgba(180,140,80,0.2)',border:'1px solid rgba(80,45,15,0.3)'}}>
                          <Swords size={14} style={{color:ic,margin:'0 auto 3px'}}/>
                          <p style={{fontFamily:'Cinzel,serif',fontWeight:900,fontSize:'1.1rem',color:'#2C1A0A',lineHeight:1}}>{getBaseAttack()}</p>
                          <p style={{fontFamily:'Cinzel,serif',fontSize:'0.5rem',letterSpacing:'0.1em',color:'#7A4520',marginTop:'2px',textTransform:'uppercase'}}>Attack</p>
                        </div>
                        <div className="rounded p-2 text-center" style={{background:'rgba(180,140,80,0.2)',border:'1px solid rgba(80,45,15,0.3)'}}>
                          <ShieldCheck size={14} style={{color:ic,margin:'0 auto 3px'}}/>
                          <p style={{fontFamily:'Cinzel,serif',fontWeight:900,fontSize:'1.1rem',color:'#2C1A0A',lineHeight:1}}>{Math.floor((getBaseDefense()/(getBaseDefense()+50))*100)}%</p>
                          <p style={{fontFamily:'Cinzel,serif',fontSize:'0.5rem',letterSpacing:'0.1em',color:'#7A4520',marginTop:'2px',textTransform:'uppercase'}}>Defense</p>
                        </div>
                      </>);})()}
                    </div>

                    {/* Ability Scores */}
                    {(()=>{const ab=hero.abilities||{str:10,dex:10,con:10,int:10,wis:10,cha:10};const pMap={Knight:'str',Wizard:'int',Assassin:'dex',Crusader:'con'};const primary=pMap[hero.class.name]||'str';const ic=(()=>{const m={red:'#8B0000',blue:'#1E3A8A',green:'#064E3B',white:'#374151',purple:'#4B0082',yellow:'#92400E',amber:'#14532D'};return m[hero.class.color]||m.yellow;})();return(<>
                      <div className="flex items-center gap-2 mb-1">
                        <div style={{flex:'1',height:'1px',background:'rgba(80,45,15,0.3)'}}/>
                        <p style={{fontFamily:'Cinzel,serif',fontSize:'0.5rem',letterSpacing:'0.15em',color:'#7A4520',textTransform:'uppercase',whiteSpace:'nowrap'}}>Ability Scores</p>
                        <div style={{flex:'1',height:'1px',background:'rgba(80,45,15,0.3)'}}/>
                      </div>
                      <div style={{display:'grid',gridTemplateColumns:'repeat(6,1fr)',gap:'4px'}}>
                        {['str','dex','con','int','wis','cha'].map(key=>{
                          const score=ab[key]||10;const mod=Math.floor((score-10)/2);const ip=key===primary;
                          return(<div key={key} className="rounded text-center" style={{padding:'5px 2px',background:ip?'rgba(180,140,80,0.35)':'rgba(180,140,80,0.15)',border:`1px solid ${ip?'rgba(80,45,15,0.5)':'rgba(80,45,15,0.2)'}`}}>
                            <p style={{fontFamily:'Cinzel,serif',fontSize:'0.48rem',letterSpacing:'0.08em',color:ip?ic:'#A0692A',marginBottom:'1px',fontWeight:ip?900:400}}>{key.toUpperCase()}</p>
                            <p style={{fontFamily:'Cinzel,serif',fontSize:'0.95rem',fontWeight:900,color:'#2C1A0A',lineHeight:1}}>{score}</p>
                            <p style={{fontFamily:'Cinzel,serif',fontSize:'0.52rem',color:mod>=0?'#2D5A27':'#8B0000',marginTop:'1px',fontWeight:700}}>{mod>=0?'+':''}{mod}</p>
                          </div>);
                        })}
                      </div>
                    </>);})()}

                    {/* Curse status */}
                    {curseLevel > 0 && (
                      <div className={`rounded p-2 ${curseLevel===3?'animate-pulse':''}`} style={{background:'rgba(107,44,145,0.15)',border:`1px solid ${curseLevel===3?'rgba(139,0,0,0.6)':'rgba(107,44,145,0.4)'}`}}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span style={{fontSize:'1rem'}}>{curseLevel===1?'🌑':curseLevel===2?'🌑🌑':'☠️'}</span>
                            <div>
                              <p style={{fontFamily:'Cinzel,serif',fontWeight:900,fontSize:'0.6rem',letterSpacing:'0.1em',textTransform:'uppercase',color:curseLevel===3?'#8B0000':'#4B0082'}}>{curseLevel===1?'CURSED':curseLevel===2?'DEEPLY CURSED':'CONDEMNED'}</p>
                              <p style={{fontFamily:'Cinzel,serif',fontSize:'0.55rem',color:'#5C2E00'}}>{curseLevel}/3{curseLevel===3?' — One more death...':''}</p>
                            </div>
                          </div>
                          <p style={{fontFamily:'Cinzel,serif',fontSize:'0.55rem',color:'#4B0082',fontWeight:700}}>{curseLevel===1?'75%':curseLevel===2?'50%':'25%'} XP</p>
                        </div>
                      </div>
                    )}

                  </div>{/* end right column */}
                </div>{/* end sheet row */}
              </div>
              </>
            </div>

            {/* ── Destination Cards ── */}
            <div className="space-y-3 max-w-2xl mx-auto">

              {/* Armory / Supplies */}
              <button
                onClick={() => { sounds.click(); setSuppliesTab('potions'); setShowInventoryModal(true); }}
                style={{
                  width: '100%', position: 'relative', overflow: 'hidden',
                  padding: '24px', borderRadius: '6px', cursor: 'pointer',
                  background: 'linear-gradient(110deg, #3d0c0c 0%, #5a1010 50%, #3d0c0c 100%)',
                  border: '1px solid rgba(200,60,50,0.55)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
                  transition: 'all 0.25s', textAlign: 'center',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'linear-gradient(110deg, #4e1010 0%, #6e1414 50%, #4e1010 100%)';
                  e.currentTarget.style.borderColor = 'rgba(240,80,60,0.75)';
                  e.currentTarget.style.boxShadow = '0 6px 28px rgba(180,30,20,0.45), inset 0 1px 0 rgba(255,255,255,0.07)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'linear-gradient(110deg, #3d0c0c 0%, #5a1010 50%, #3d0c0c 100%)';
                  e.currentTarget.style.borderColor = 'rgba(200,60,50,0.55)';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{position:'relative',zIndex:1}}>
                  <p style={{fontFamily:"'Cinzel',serif",fontWeight:900,fontSize:'clamp(1.05rem,2.5vw,1.3rem)',letterSpacing:'0.25em',textTransform:'uppercase',color:'rgba(255,190,180,1)',marginBottom:'5px',textShadow:'0 0 20px rgba(220,60,50,0.6)'}}>
                    The Armory
                  </p>
                  <p style={{fontFamily:"'Cinzel',serif",fontSize:'0.65rem',letterSpacing:'0.18em',color:'rgba(220,150,140,0.7)',textTransform:'uppercase'}}>
                    Potions • Provisions • Equipment
                  </p>
                </div>
              </button>

              {/* Merchant's Den */}
              <button
                onClick={() => { sounds.click(); setShowCraftingModal(true); }}
                style={{
                  width: '100%', position: 'relative', overflow: 'hidden',
                  padding: '24px', borderRadius: '6px', cursor: 'pointer',
                  background: 'linear-gradient(110deg, #2e1e00 0%, #4a3000 50%, #2e1e00 100%)',
                  border: '1px solid rgba(200,155,30,0.55)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
                  transition: 'all 0.25s', textAlign: 'center',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'linear-gradient(110deg, #3a2600 0%, #5c3c00 50%, #3a2600 100%)';
                  e.currentTarget.style.borderColor = 'rgba(212,175,55,0.85)';
                  e.currentTarget.style.boxShadow = '0 6px 28px rgba(180,140,20,0.35), inset 0 1px 0 rgba(255,255,255,0.07)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'linear-gradient(110deg, #2e1e00 0%, #4a3000 50%, #2e1e00 100%)';
                  e.currentTarget.style.borderColor = 'rgba(200,155,30,0.55)';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{position:'relative',zIndex:1}}>
                  <p style={{fontFamily:"'Cinzel',serif",fontWeight:900,fontSize:'clamp(1.05rem,2.5vw,1.3rem)',letterSpacing:'0.25em',textTransform:'uppercase',color:'rgba(255,215,80,1)',marginBottom:'5px',textShadow:'0 0 20px rgba(212,175,55,0.65)'}}>
                    The Merchant
                  </p>
                  <p style={{fontFamily:"'Cinzel',serif",fontSize:'0.65rem',letterSpacing:'0.18em',color:'rgba(200,165,70,0.75)',textTransform:'uppercase'}}>
                    Forge • Craft • Trade your gold for power
                  </p>
                </div>
              </button>

            </div>

            {/* ── Monster Stable ── */}
            {capturedMonsters && capturedMonsters.length > 0 && (
              <div className="max-w-2xl mx-auto">
                <div className="flex items-center gap-2 mb-2 px-1">
                  <p style={{ fontFamily: 'Cinzel, serif', fontSize: '10px', fontWeight: 700, color: 'rgba(168,85,247,0.8)', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
                    Monster Stable
                  </p>
                  {fusionCrystals > 0 && (
                    <span style={{ fontSize: '10px', color: 'rgba(168,85,247,0.6)', fontStyle: 'italic' }}>
                      · 🔮 {fusionCrystals} crystal{fusionCrystals !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {capturedMonsters.map(monster => (
                    <div key={monster.id} style={{
                      width: '90px', borderRadius: '10px', padding: '8px 6px',
                      background: 'rgba(30,15,50,0.85)',
                      border: `1px solid ${monster.tier === 3 ? 'rgba(212,175,55,0.5)' : monster.tier === 2 ? 'rgba(251,146,60,0.4)' : 'rgba(168,85,247,0.35)'}`,
                      boxShadow: `0 0 12px ${monster.tier === 3 ? 'rgba(212,175,55,0.15)' : monster.tier === 2 ? 'rgba(251,146,60,0.1)' : 'rgba(168,85,247,0.1)'}`,
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                      position: 'relative',
                    }}>
                      <img
                        src={`/creatures/creature${monster.creatureIdx}.png`}
                        alt={monster.name}
                        style={{ width: 52, height: 52, objectFit: 'contain',
                          filter: `drop-shadow(0 0 6px ${monster.tier === 3 ? 'rgba(212,175,55,0.6)' : monster.tier === 2 ? 'rgba(251,146,60,0.5)' : 'rgba(168,85,247,0.4)'})`
                        }}
                      />
                      <p style={{ fontSize: '8px', fontWeight: 700, color: '#F5F5DC', textAlign: 'center', fontFamily: 'Cinzel, serif', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '78px' }}>
                        {monster.name}
                      </p>
                      <p style={{ fontSize: '7px', color: monster.tier === 3 ? '#D4AF37' : monster.tier === 2 ? '#FB923C' : '#C084FC', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                        Tier {monster.tier}
                      </p>
                      <button
                        onClick={() => { sounds.click(); onReleaseMonster(monster.id); }}
                        style={{ fontSize: '7px', color: 'rgba(245,245,220,0.3)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
                      >
                        Release
                      </button>
                    </div>
                  ))}
                  {/* Empty slots */}
                  {Array.from({ length: 4 - capturedMonsters.length }).map((_, i) => (
                    <div key={i} style={{
                      width: '90px', height: '110px', borderRadius: '10px',
                      background: 'rgba(15,10,25,0.4)',
                      border: '1px dashed rgba(168,85,247,0.15)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <p style={{ fontSize: '9px', color: 'rgba(168,85,247,0.2)', fontFamily: 'Cinzel, serif' }}>Empty</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            </div>
  );
};

export default QuestTab;
