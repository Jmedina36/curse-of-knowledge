import React from 'react';
import { HeartPulse, ShieldCheck, Sparkles, Swords } from 'lucide-react';
import { COLORS, VISUAL_STYLES, GAME_CONSTANTS } from '../constants';
import { sounds } from '../sounds';

const DWARF_NPCS = [
  { img: '/npcs/dwarf-warrior.png',  name: 'Grimdar', title: 'Master Smith'     },
  { img: '/npcs/dwarf-explorer.png', name: 'Borin',   title: 'Wandering Forger' },
  { img: '/npcs/dwarf-lady.png',     name: 'Helga',   title: 'Iron Matron'      },
];
const ELF_NPCS = [
  { img: '/npcs/elf-prince.png',  name: 'Aldric', title: 'Wandering Merchant' },
  { img: '/npcs/elf-lady.png',    name: 'Sylara', title: 'Arcane Trader'      },
  { img: '/npcs/elf-warrior.png', name: 'Taeral', title: 'Blade Merchant'     },
];

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
  currentDay,
  curseLevel,
  // Computed stats
  getMaxHp,
  getMaxStamina,
  getBaseAttack,
  getBaseDefense,
  getCardStyle,
  // Modal triggers
  setShowInventoryModal,
  setShowCraftingModal,
  onOpenHealer,
  guildRank,
  onOpenBestiary,
  onOpenForge,
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
                <span style={{fontSize:'0.8rem',fontWeight:900,color:'#000',letterSpacing:'0.1em',fontFamily:'Cinzel,serif'}}>DAY {currentDay}</span>
              </div>
              <div className="absolute top-0 right-0 px-3 py-1 rounded-bl-lg z-20" style={{background:'rgba(200,170,120,0.5)',border:'1px solid rgba(100,60,20,0.35)',borderTop:'none',borderRight:'none'}}>
                <span style={{fontSize:'0.8rem',fontWeight:900,letterSpacing:'0.1em',fontFamily:'Cinzel,serif',color:'#000'}}>LVL {level}</span>
                {guildRank && (
                  <span style={{fontSize:'0.8rem',fontWeight:900,letterSpacing:'0.1em',fontFamily:'Cinzel,serif',color: guildRank.name === 'Initiate' ? '#000' : guildRank.color,textShadow: guildRank.name === 'Initiate' ? 'none' : '0 0 6px rgba(0,0,0,0.3)'}}>
                    {' '}• {guildRank.name}
                  </span>
                )}
              </div>

              <div className="relative z-10 pt-8">

                {/* ── Top row: portrait + stats ── */}
                <div style={{display:'flex',gap:'16px',alignItems:'flex-start',marginBottom:'12px'}}>

                  {/* LEFT: Portrait */}
                  <div style={{flexShrink:0,width:'clamp(90px,22%,130px)',display:'flex',flexDirection:'column',alignItems:'center',gap:'6px'}}>
                    <div style={{width:'100%',aspectRatio:'3/4',borderRadius:'6px',overflow:'hidden',position:'relative',border:'2px solid rgba(80,45,15,0.6)',boxShadow:'0 2px 12px rgba(0,0,0,0.35)'}}>
                      <img src={getHeroPortrait(hero.class.name, hero.gender)} alt={hero.name}
                        style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:'top'}}
                        onError={e=>{e.currentTarget.style.display='none';}}
                      />
                    </div>
                    <p style={{fontFamily:'Cinzel,serif',fontWeight:900,fontSize:'clamp(0.85rem,2vw,1.05rem)',letterSpacing:'0.06em',color:'#000',textAlign:'center',lineHeight:1.2,wordBreak:'break-word'}}>{hero.name}</p>
                    <p style={{fontFamily:'Cinzel,serif',fontSize:'0.75rem',fontWeight:700,letterSpacing:'0.1em',color:'#000',textAlign:'center',textTransform:'uppercase',marginTop:'-2px'}}>{hero.class.name}</p>
                    <p style={{fontFamily:'Cinzel,serif',fontSize:'0.7rem',fontWeight:700,letterSpacing:'0.08em',color:'#000',textAlign:'center',textTransform:'uppercase',marginTop:'-2px'}}>{hero.title}</p>
                    {guildRank && (
                      <div style={{
                        marginTop:'2px',
                        padding:'2px 8px', borderRadius:'3px',
                        background:'rgba(30,20,10,0.12)',
                        border:`1px solid ${guildRank.name === 'Initiate' ? 'rgba(100,80,40,0.3)' : guildRank.color + '55'}`,
                      }}>
                        <p style={{
                          fontFamily:'Cinzel,serif', fontSize:'0.6rem', fontWeight:700,
                          letterSpacing:'0.18em', textTransform:'uppercase', margin:0,
                          textAlign:'center',
                          color: guildRank.name === 'Initiate' ? 'rgba(80,60,30,0.7)' : guildRank.color,
                          textShadow: guildRank.name === 'Initiate' ? 'none' : '0 0 8px rgba(0,0,0,0.25)',
                        }}>
                          {guildRank.name}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* RIGHT: XP, HP, SP, ATK, DEF */}
                  <div style={{flex:1,minWidth:0,display:'flex',flexDirection:'column',gap:'8px'}}>

                    {/* XP bar */}
                    <div className="rounded p-2" style={{background:'rgba(180,140,80,0.2)',border:'1px solid rgba(80,45,15,0.25)'}}>
                      <div className="flex justify-between mb-1">
                        <span style={{fontFamily:'Cinzel,serif',fontWeight:900,letterSpacing:'0.08em',color:'#000',textTransform:'uppercase',fontSize:'0.85rem'}}>Experience</span>
                        <span style={{fontFamily:'Cinzel,serif',fontWeight:900,color:'#000',fontSize:'0.85rem'}}>{(()=>{let s=0;for(let i=1;i<level;i++)s+=Math.floor(GAME_CONSTANTS.XP_PER_LEVEL*Math.pow(1.3,i-1));const cur=xp-s;const need=Math.floor(GAME_CONSTANTS.XP_PER_LEVEL*Math.pow(1.3,level-1));return`${cur} / ${need}`;})()}</span>
                      </div>
                      <div className="rounded-full h-3 overflow-hidden" style={{background:'rgba(80,45,15,0.2)',border:'1px solid rgba(80,45,15,0.2)'}}>
                        <div className="h-full rounded-full transition-all duration-300" style={{background:(()=>{const g={red:'linear-gradient(90deg,#7F0000,#C41C1C)',blue:'linear-gradient(90deg,#1E3A8A,#2563EB)',green:'linear-gradient(90deg,#064E3B,#059669)',white:'linear-gradient(90deg,#9CA3AF,#D1D5DB)',purple:'linear-gradient(90deg,#4B0082,#7C3AED)',yellow:'linear-gradient(90deg,#92400E,#B45309)',amber:'linear-gradient(90deg,#14532D,#15803D)'};return g[hero.class.color]||g.yellow;})(),width:`${(()=>{let s=0;for(let i=1;i<level;i++)s+=Math.floor(GAME_CONSTANTS.XP_PER_LEVEL*Math.pow(1.3,i-1));const cur=xp-s;const need=Math.floor(GAME_CONSTANTS.XP_PER_LEVEL*Math.pow(1.3,level-1));return(cur/need)*100;})()}%`}}/>
                      </div>
                    </div>

                    {/* HP + SP */}
                    <div style={{display:'flex',flexDirection:'column',gap:'5px'}}>
                      <div className="rounded p-2" style={{background:'rgba(180,140,80,0.2)',border:'1px solid rgba(139,0,0,0.3)'}}>
                        <div className="flex justify-between items-center mb-1">
                          <div className="flex items-center gap-1.5"><HeartPulse size={15} style={{color:'#7F0000'}}/><span style={{fontFamily:'Cinzel,serif',fontSize:'0.85rem',fontWeight:900,color:'#000',letterSpacing:'0.1em'}}>HP</span></div>
                          <span style={{fontFamily:'Cinzel,serif',fontSize:'0.85rem',fontWeight:900,color:'#000'}}>{hp}/{getMaxHp()}</span>
                        </div>
                        <div className="rounded h-2.5 overflow-hidden" style={{background:'rgba(139,0,0,0.15)'}}><div className="h-full rounded transition-all" style={{width:`${(hp/getMaxHp())*100}%`,background:hp/getMaxHp()<0.25?'#8B0000':'linear-gradient(to right,#7f1d1d,#b91c1c)'}}/></div>
                      </div>
                      <div className="rounded p-2" style={{background:'rgba(180,140,80,0.2)',border:'1px solid rgba(30,58,140,0.3)'}}>
                        <div className="flex justify-between items-center mb-1">
                          <div className="flex items-center gap-1.5"><Sparkles size={15} style={{color:'#142B6E'}}/><span style={{fontFamily:'Cinzel,serif',fontSize:'0.85rem',fontWeight:900,color:'#000',letterSpacing:'0.1em'}}>SP</span></div>
                          <span style={{fontFamily:'Cinzel,serif',fontSize:'0.85rem',fontWeight:900,color:'#000'}}>{stamina}/{getMaxStamina()}</span>
                        </div>
                        <div className="rounded h-2.5 overflow-hidden" style={{background:'rgba(30,58,140,0.15)'}}><div className="h-full rounded transition-all" style={{width:`${(stamina/getMaxStamina())*100}%`,background:'linear-gradient(to right,#1e3a8a,#2563eb)'}}/></div>
                      </div>
                    </div>

                    {/* ATK + DEF */}
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'6px'}}>
                      {(()=>{const ic=(()=>{const m={red:'#8B0000',blue:'#1E3A8A',green:'#064E3B',white:'#4B5563',purple:'#4B0082',yellow:'#92400E',amber:'#14532D'};return m[hero.class.color]||m.yellow;})();return(<>
                        <div className="rounded p-2 text-center" style={{background:'rgba(180,140,80,0.2)',border:'1px solid rgba(80,45,15,0.3)'}}>
                          <Swords size={15} style={{color:ic,margin:'0 auto 3px'}}/>
                          <p style={{fontFamily:'Cinzel,serif',fontWeight:900,fontSize:'1.4rem',color:'#000',lineHeight:1}}>{getBaseAttack()}</p>
                          <p style={{fontFamily:'Cinzel,serif',fontSize:'0.75rem',fontWeight:700,letterSpacing:'0.1em',color:'#000',marginTop:'2px',textTransform:'uppercase'}}>Attack</p>
                        </div>
                        <div className="rounded p-2 text-center" style={{background:'rgba(180,140,80,0.2)',border:'1px solid rgba(80,45,15,0.3)'}}>
                          <ShieldCheck size={15} style={{color:ic,margin:'0 auto 3px'}}/>
                          <p style={{fontFamily:'Cinzel,serif',fontWeight:900,fontSize:'1.4rem',color:'#000',lineHeight:1}}>{Math.floor((getBaseDefense()/(getBaseDefense()+50))*100)}%</p>
                          <p style={{fontFamily:'Cinzel,serif',fontSize:'0.75rem',fontWeight:700,letterSpacing:'0.1em',color:'#000',marginTop:'2px',textTransform:'uppercase'}}>Defense</p>
                        </div>
                      </>);})()}
                    </div>

                  </div>{/* end right column */}
                </div>{/* end top row */}

                {/* ── Full-width: Ability Scores ── */}
                {(()=>{const ab=hero.abilities||{str:10,dex:10,con:10,int:10,wis:10,cha:10};const pMap={Knight:'str',Wizard:'int',Assassin:'dex',Crusader:'con'};const primary=pMap[hero.class.name]||'str';const ic=(()=>{const m={red:'#7F0000',blue:'#142B6E',green:'#063B28',white:'#1F2937',purple:'#3B006A',yellow:'#6B2E00',amber:'#0E3D1E'};return m[hero.class.color]||m.yellow;})();const fullNames={str:'Strength',dex:'Dexterity',con:'Constitution',int:'Intelligence',wis:'Wisdom',cha:'Charisma'};return(<>
                  <div className="flex items-center gap-2 mb-2">
                    <div style={{flex:'1',height:'1px',background:'rgba(60,30,5,0.4)'}}/>
                    <p style={{fontFamily:'Cinzel,serif',fontSize:'0.75rem',fontWeight:900,letterSpacing:'0.15em',color:'#000',textTransform:'uppercase',whiteSpace:'nowrap'}}>Ability Scores</p>
                    <div style={{flex:'1',height:'1px',background:'rgba(60,30,5,0.4)'}}/>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'6px'}}>
                    {['str','dex','con','int','wis','cha'].map(key=>{
                      const score=ab[key]||10;const mod=Math.floor((score-10)/2);const ip=key===primary;
                      return(<div key={key} className="rounded text-center" style={{padding:'8px 6px',background:ip?'rgba(140,90,30,0.25)':'rgba(180,140,80,0.15)',border:`1px solid ${ip?'rgba(60,30,5,0.5)':'rgba(60,30,5,0.2)'}`}}>
                        <p style={{fontFamily:'Cinzel,serif',fontSize:'0.72rem',letterSpacing:'0.04em',color:'#000',marginBottom:'3px',fontWeight:900}}>{fullNames[key]}</p>
                        <p style={{fontFamily:'Cinzel,serif',fontSize:'1.5rem',fontWeight:900,color:'#000',lineHeight:1}}>{score}</p>
                        <p style={{fontFamily:'Cinzel,serif',fontSize:'0.72rem',color:'#000',marginTop:'3px',fontWeight:900}}>{mod>=0?'+':''}{mod}</p>
                      </div>);
                    })}
                  </div>
                </>);})()}

                {/* Curse status */}
                {curseLevel > 0 && (
                  <div className={`rounded p-2 mt-2 ${curseLevel===3?'animate-pulse':''}`} style={{background:'rgba(107,44,145,0.15)',border:`1px solid ${curseLevel===3?'rgba(139,0,0,0.6)':'rgba(107,44,145,0.4)'}`}}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span style={{fontSize:'1.1rem'}}>{curseLevel===1?'🌑':curseLevel===2?'🌑🌑':'☠️'}</span>
                        <div>
                          <p style={{fontFamily:'Cinzel,serif',fontWeight:900,fontSize:'0.8rem',letterSpacing:'0.1em',textTransform:'uppercase',color:'#000'}}>{curseLevel===1?'CURSED':curseLevel===2?'DEEPLY CURSED':'CONDEMNED'}</p>
                          <p style={{fontFamily:'Cinzel,serif',fontSize:'0.75rem',fontWeight:700,color:'#000'}}>{curseLevel}/3{curseLevel===3?' — One more death...':''}</p>
                        </div>
                      </div>
                      <p style={{fontFamily:'Cinzel,serif',fontSize:'0.75rem',color:'#000',fontWeight:900}}>{curseLevel===1?'75%':curseLevel===2?'50%':'25%'} XP</p>
                    </div>
                  </div>
                )}

              </div>
              </>
            </div>

            {/* ── Guild Buttons ── */}
            {(() => {
              const dwarf = DWARF_NPCS[(currentDay ?? 1) % DWARF_NPCS.length];
              const elf   = ELF_NPCS[(currentDay ?? 1) % ELF_NPCS.length];
              return (
            <>
            <div className="max-w-2xl mx-auto" style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'10px'}}>

              {/* Armory */}
              <button
                onClick={() => { sounds.click(); setShowInventoryModal(true); }}
                style={{padding:'16px 10px 14px',borderRadius:'10px',cursor:'pointer',textAlign:'center',
                  backgroundImage:'linear-gradient(160deg,rgba(42,8,8,0.82),rgba(66,13,13,0.82),rgba(26,5,5,0.82)), url(/Stonewall2.png)',
                  backgroundSize:'cover',backgroundPosition:'center',
                  border:'1px solid rgba(180,50,40,0.55)',
                  boxShadow:'0 4px 16px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,120,100,0.06)',
                  transition:'all 0.2s',display:'flex',flexDirection:'column',alignItems:'center',gap:'8px'}}
                onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-3px)';e.currentTarget.style.boxShadow='0 8px 24px rgba(160,30,20,0.45), inset 0 1px 0 rgba(255,120,100,0.06)';e.currentTarget.style.borderColor='rgba(220,80,60,0.75)';}}
                onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='0 4px 16px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,120,100,0.06)';e.currentTarget.style.borderColor='rgba(180,50,40,0.55)';}}
              >
                <img src={dwarf.img} alt={dwarf.name} style={{width:'96px',height:'96px',objectFit:'cover',objectPosition:'top',borderRadius:'50%',border:'2px solid rgba(180,50,40,0.6)',boxShadow:'0 0 12px rgba(200,60,40,0.3)'}}/>
                <div>
                  <p style={{fontFamily:"'Cinzel',serif",fontWeight:900,fontSize:'0.9rem',letterSpacing:'0.16em',textTransform:'uppercase',color:'rgba(220,130,120,0.8)',marginBottom:'3px'}}>{dwarf.name}</p>
                  <p style={{fontFamily:"'Cinzel',serif",fontWeight:900,fontSize:'clamp(1rem,2vw,1.15rem)',letterSpacing:'0.12em',textTransform:'uppercase',color:'rgba(255,185,175,1)',marginBottom:'4px'}}>The Armory</p>
                  <div style={{width:'30px',height:'1px',background:'rgba(180,50,40,0.4)',margin:'0 auto 5px'}}/>
                  <p style={{fontFamily:"'Cinzel',serif",fontSize:'0.78rem',letterSpacing:'0.1em',color:'rgba(200,130,120,0.65)',textTransform:'uppercase',lineHeight:1.4}}>Potions · Gear</p>
                </div>
              </button>

              {/* Merchant */}
              <button
                onClick={() => { sounds.click(); setShowCraftingModal(true); }}
                style={{padding:'16px 10px 14px',borderRadius:'10px',cursor:'pointer',textAlign:'center',
                  background:'linear-gradient(160deg,#1e1400,#332200,#150f00)',
                  border:'1px solid rgba(180,135,20,0.55)',
                  boxShadow:'0 4px 16px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,200,60,0.06)',
                  transition:'all 0.2s',display:'flex',flexDirection:'column',alignItems:'center',gap:'8px'}}
                onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-3px)';e.currentTarget.style.boxShadow='0 8px 24px rgba(150,110,10,0.4), inset 0 1px 0 rgba(255,200,60,0.06)';e.currentTarget.style.borderColor='rgba(210,165,30,0.75)';}}
                onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='0 4px 16px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,200,60,0.06)';e.currentTarget.style.borderColor='rgba(180,135,20,0.55)';}}
              >
                <img src={elf.img} alt={elf.name} style={{width:'96px',height:'96px',objectFit:'cover',objectPosition:'top',borderRadius:'50%',border:'2px solid rgba(180,135,20,0.6)',boxShadow:'0 0 12px rgba(180,135,10,0.3)'}}/>
                <div>
                  <p style={{fontFamily:"'Cinzel',serif",fontWeight:900,fontSize:'0.9rem',letterSpacing:'0.16em',textTransform:'uppercase',color:'rgba(200,160,70,0.8)',marginBottom:'3px'}}>{elf.name}</p>
                  <p style={{fontFamily:"'Cinzel',serif",fontWeight:900,fontSize:'clamp(1rem,2vw,1.15rem)',letterSpacing:'0.12em',textTransform:'uppercase',color:'rgba(255,215,80,1)',marginBottom:'4px'}}>The Merchant</p>
                  <div style={{width:'30px',height:'1px',background:'rgba(180,135,20,0.4)',margin:'0 auto 5px'}}/>
                  <p style={{fontFamily:"'Cinzel',serif",fontSize:'0.78rem',letterSpacing:'0.1em',color:'rgba(190,150,60,0.65)',textTransform:'uppercase',lineHeight:1.4}}>Craft · Trade</p>
                </div>
              </button>

              {/* Healer */}
              <button
                onClick={() => { sounds.click(); onOpenHealer && onOpenHealer(); }}
                style={{padding:'16px 10px 14px',borderRadius:'10px',cursor:'pointer',textAlign:'center',
                  background:'linear-gradient(160deg,#071a12,#0d2b1e,#041009)',
                  border:'1px solid rgba(40,180,120,0.5)',
                  boxShadow:'0 4px 16px rgba(0,0,0,0.5), inset 0 1px 0 rgba(52,211,153,0.06)',
                  transition:'all 0.2s',display:'flex',flexDirection:'column',alignItems:'center',gap:'8px'}}
                onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-3px)';e.currentTarget.style.boxShadow='0 8px 24px rgba(20,140,80,0.35), inset 0 1px 0 rgba(52,211,153,0.06)';e.currentTarget.style.borderColor='rgba(52,211,153,0.7)';}}
                onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='0 4px 16px rgba(0,0,0,0.5), inset 0 1px 0 rgba(52,211,153,0.06)';e.currentTarget.style.borderColor='rgba(40,180,120,0.5)';}}
              >
                <img src="/npcs/medic.png" alt="Healer" style={{width:'96px',height:'96px',objectFit:'cover',objectPosition:'top',borderRadius:'50%',border:'2px solid rgba(40,180,120,0.6)',boxShadow:'0 0 12px rgba(40,180,120,0.3)'}}/>
                <div>
                  <p style={{fontFamily:"'Cinzel',serif",fontWeight:900,fontSize:'0.9rem',letterSpacing:'0.16em',textTransform:'uppercase',color:'rgba(100,210,160,0.8)',marginBottom:'3px'}}>Sister Mara</p>
                  <p style={{fontFamily:"'Cinzel',serif",fontWeight:900,fontSize:'clamp(1rem,2vw,1.15rem)',letterSpacing:'0.12em',textTransform:'uppercase',color:'rgba(110,231,183,1)',marginBottom:'4px'}}>The Healer</p>
                  <div style={{width:'30px',height:'1px',background:'rgba(40,180,120,0.4)',margin:'0 auto 5px'}}/>
                  <p style={{fontFamily:"'Cinzel',serif",fontSize:'0.78rem',letterSpacing:'0.1em',color:'rgba(80,190,140,0.65)',textTransform:'uppercase',lineHeight:1.4}}>Restore HP</p>
                </div>
              </button>

            </div>

            {/* Row 2 — Kael · Rylan · TBD */}
            <div className="max-w-2xl mx-auto" style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'10px',marginTop:'10px'}}>

              {/* Bestiary — Kael */}
              <button
                onClick={() => { sounds.click(); onOpenBestiary && onOpenBestiary(); }}
                style={{padding:'16px 10px 14px',borderRadius:'10px',cursor:'pointer',textAlign:'center',
                  background:'linear-gradient(160deg,#0f0820,#1a0f35,#090514)',
                  border:'1px solid rgba(139,92,246,0.5)',
                  boxShadow:'0 4px 16px rgba(0,0,0,0.5), inset 0 1px 0 rgba(167,139,250,0.06)',
                  transition:'all 0.2s',display:'flex',flexDirection:'column',alignItems:'center',gap:'8px'}}
                onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-3px)';e.currentTarget.style.boxShadow='0 8px 24px rgba(100,60,200,0.4), inset 0 1px 0 rgba(167,139,250,0.06)';e.currentTarget.style.borderColor='rgba(167,139,250,0.75)';}}
                onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='0 4px 16px rgba(0,0,0,0.5), inset 0 1px 0 rgba(167,139,250,0.06)';e.currentTarget.style.borderColor='rgba(139,92,246,0.5)';}}
              >
                <img src="/npcs/female-warrior.png" alt="Kael" style={{width:'96px',height:'96px',objectFit:'cover',objectPosition:'top',borderRadius:'50%',border:'2px solid rgba(139,92,246,0.6)',boxShadow:'0 0 12px rgba(139,92,246,0.3)'}}/>
                <div>
                  <p style={{fontFamily:"'Cinzel',serif",fontWeight:900,fontSize:'0.9rem',letterSpacing:'0.16em',textTransform:'uppercase',color:'rgba(167,139,250,0.8)',marginBottom:'3px'}}>Kael</p>
                  <p style={{fontFamily:"'Cinzel',serif",fontWeight:900,fontSize:'clamp(1rem,2vw,1.15rem)',letterSpacing:'0.12em',textTransform:'uppercase',color:'rgba(196,181,253,1)',marginBottom:'4px'}}>The Bestiary</p>
                  <div style={{width:'30px',height:'1px',background:'rgba(139,92,246,0.4)',margin:'0 auto 5px'}}/>
                  <p style={{fontFamily:"'Cinzel',serif",fontSize:'0.78rem',letterSpacing:'0.1em',color:'rgba(167,139,250,0.65)',textTransform:'uppercase',lineHeight:1.4}}>Creatures · Factions</p>
                </div>
              </button>

              {/* Forge — Rylan */}
              <button
                onClick={() => { sounds.click(); onOpenForge && onOpenForge(); }}
                style={{padding:'16px 10px 14px',borderRadius:'10px',cursor:'pointer',textAlign:'center',
                  background:'linear-gradient(160deg,#060e1a,#0c1a2e,#030810)',
                  border:'1px solid rgba(56,130,210,0.5)',
                  boxShadow:'0 4px 16px rgba(0,0,0,0.5), inset 0 1px 0 rgba(96,165,250,0.06)',
                  transition:'all 0.2s',display:'flex',flexDirection:'column',alignItems:'center',gap:'8px'}}
                onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-3px)';e.currentTarget.style.boxShadow='0 8px 24px rgba(30,90,180,0.4), inset 0 1px 0 rgba(96,165,250,0.06)';e.currentTarget.style.borderColor='rgba(96,165,250,0.75)';}}
                onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='0 4px 16px rgba(0,0,0,0.5), inset 0 1px 0 rgba(96,165,250,0.06)';e.currentTarget.style.borderColor='rgba(56,130,210,0.5)';}}
              >
                <img src="/npcs/warrior.png" alt="Rylan" style={{width:'96px',height:'96px',objectFit:'cover',objectPosition:'top',borderRadius:'50%',border:'2px solid rgba(56,130,210,0.6)',boxShadow:'0 0 12px rgba(56,130,210,0.3)'}}/>
                <div>
                  <p style={{fontFamily:"'Cinzel',serif",fontWeight:900,fontSize:'0.9rem',letterSpacing:'0.16em',textTransform:'uppercase',color:'rgba(96,165,250,0.8)',marginBottom:'3px'}}>Rylan</p>
                  <p style={{fontFamily:"'Cinzel',serif",fontWeight:900,fontSize:'clamp(1rem,2vw,1.15rem)',letterSpacing:'0.12em',textTransform:'uppercase',color:'rgba(147,197,253,1)',marginBottom:'4px'}}>The Forge</p>
                  <div style={{width:'30px',height:'1px',background:'rgba(56,130,210,0.4)',margin:'0 auto 5px'}}/>
                  <p style={{fontFamily:"'Cinzel',serif",fontSize:'0.78rem',letterSpacing:'0.1em',color:'rgba(96,165,250,0.65)',textTransform:'uppercase',lineHeight:1.4}}>Study · Flashcards</p>
                </div>
              </button>

              {/* TBD slot */}
              <button
                disabled
                style={{padding:'16px 10px 14px',borderRadius:'10px',textAlign:'center',
                  background:'linear-gradient(160deg,#0d0d0d,#141414,#0a0a0a)',
                  border:'1px solid rgba(80,80,80,0.25)',
                  boxShadow:'0 4px 16px rgba(0,0,0,0.3)',
                  opacity:0.35,display:'flex',flexDirection:'column',alignItems:'center',gap:'8px',cursor:'default'}}
              >
                <div style={{width:'96px',height:'96px',borderRadius:'50%',border:'2px solid rgba(80,80,80,0.3)',background:'rgba(40,40,40,0.4)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                  <span style={{fontSize:'2rem',opacity:0.3}}>?</span>
                </div>
                <div>
                  <p style={{fontFamily:"'Cinzel',serif",fontWeight:900,fontSize:'0.9rem',letterSpacing:'0.16em',textTransform:'uppercase',color:'rgba(120,120,120,0.5)',marginBottom:'3px'}}>Unknown</p>
                  <p style={{fontFamily:"'Cinzel',serif",fontWeight:900,fontSize:'clamp(1rem,2vw,1.15rem)',letterSpacing:'0.12em',textTransform:'uppercase',color:'rgba(140,140,140,0.4)',marginBottom:'4px'}}>Coming Soon</p>
                  <div style={{width:'30px',height:'1px',background:'rgba(80,80,80,0.2)',margin:'0 auto 5px'}}/>
                  <p style={{fontFamily:"'Cinzel',serif",fontSize:'0.78rem',letterSpacing:'0.1em',color:'rgba(100,100,100,0.4)',textTransform:'uppercase',lineHeight:1.4}}>· · ·</p>
                </div>
              </button>

            </div>
            </>
              );
            })()}


            </div>
  );
};

export default QuestTab;
