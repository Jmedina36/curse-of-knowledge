import React from 'react';
import { ShieldCheck, Swords } from 'lucide-react';
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
  onOpenHero,
  unspentStatPoints,
}) => {
  return (
            <div className="space-y-4">

            {/* ── Guild Card title ── */}
            <div className="max-w-2xl mx-auto flex items-center gap-3">
              <div style={{flex:1,height:'1px',background:'rgba(212,175,55,0.3)'}}/>
              <p style={{fontFamily:'Cinzel,serif',fontSize:'0.83rem',fontWeight:900,letterSpacing:'0.3em',textTransform:'uppercase',color:'rgba(212,175,55,0.75)',whiteSpace:'nowrap'}}>Guild Card</p>
              <div style={{flex:1,height:'1px',background:'rgba(212,175,55,0.3)'}}/>
            </div>

            <div className="rounded-xl p-4 max-w-2xl mx-auto relative overflow-hidden" style={{
              backgroundImage: 'url(/Updated%20scroll.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              border: (()=>{const m={red:'rgba(180,30,30,0.5)',blue:'rgba(59,130,246,0.4)',green:'rgba(16,185,129,0.4)',white:'rgba(200,200,200,0.35)',purple:'rgba(139,92,246,0.4)',yellow:'rgba(212,175,55,0.4)',amber:'rgba(34,197,94,0.4)'};return '2px solid '+(m[hero.class.color]||m.yellow);})(),
              boxShadow: (()=>{const m={red:'rgba(180,30,30,0.25)',blue:'rgba(59,130,246,0.2)',green:'rgba(16,185,129,0.2)',white:'rgba(200,200,200,0.15)',purple:'rgba(139,92,246,0.2)',yellow:'rgba(212,175,55,0.2)',amber:'rgba(34,197,94,0.2)'};const g=m[hero.class.color]||m.yellow;return '0 4px 30px '+g+', 0 0 60px '+g;})()
            }}>

              {/* RPG Character Sheet layout — ink on parchment */}
              <>
              {/* ── Watermark / Curse overlays ── */}
              {curseLevel === 0 && (
                /* Class emblem — no curse */
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{fontSize:'20rem',lineHeight:1,opacity:0.06,color:'#3D1F08'}}>
                  {getCardStyle(hero.class, currentDay).emblem}
                </div>
              )}

              {curseLevel === 1 && (
                /* Level 1 — single faint skull, purple shadow */
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{fontSize:'20rem',lineHeight:1,opacity:0.07,color:'#2A0040'}}>
                  ☠
                </div>
              )}

              {curseLevel === 2 && (<>
                {/* Level 2 — central skull + 4 corner skulls + card vignette */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{fontSize:'20rem',lineHeight:1,opacity:0.1,color:'#1A0030'}}>☠</div>
                {[{top:'6%',left:'4%'},{top:'6%',right:'4%'},{bottom:'6%',left:'4%'},{bottom:'6%',right:'4%'}].map((pos,i)=>(
                  <div key={i} className="absolute pointer-events-none" style={{...pos,fontSize:'2.36rem',opacity:0.07,color:'#1A0030',lineHeight:1}}>☠</div>
                ))}
                <div className="absolute inset-0 pointer-events-none" style={{borderRadius:'12px',background:'radial-gradient(ellipse at center, transparent 40%, rgba(30,0,50,0.18) 100%)'}}/>
              </>)}

              {curseLevel === 3 && (<>
                {/* Level 3 — macabre: dark overlay, blood drip, pulsing central skull, 8 surrounding skulls */}
                {/* Dark crimson wash over the whole card */}
                <div className="absolute inset-0 pointer-events-none" style={{borderRadius:'12px',background:'rgba(30,0,0,0.22)'}}/>
                {/* Blood seeping from top */}
                <div className="absolute inset-0 pointer-events-none" style={{borderRadius:'12px',background:'linear-gradient(to bottom, rgba(80,0,0,0.35) 0%, rgba(50,0,0,0.15) 25%, transparent 55%)'}}/>
                {/* Heavy vignette */}
                <div className="absolute inset-0 pointer-events-none" style={{borderRadius:'12px',background:'radial-gradient(ellipse at center, transparent 25%, rgba(60,0,0,0.38) 100%)'}}/>
                {/* Central skull — pulsing */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none animate-pulse" style={{fontSize:'20rem',lineHeight:1,opacity:0.14,color:'#5A0000'}}>☠</div>
                {/* 4 corner skulls */}
                {[{top:'5%',left:'3%'},{top:'5%',right:'3%'},{bottom:'5%',left:'3%'},{bottom:'5%',right:'3%'}].map((pos,i)=>(
                  <div key={`c${i}`} className="absolute pointer-events-none" style={{...pos,fontSize:'2.6rem',opacity:0.13,color:'#5A0000',lineHeight:1}}>☠</div>
                ))}
                {/* 4 mid-edge skulls */}
                {[{top:'3%',left:'50%',transform:'translateX(-50%)'},{bottom:'3%',left:'50%',transform:'translateX(-50%)'},{top:'50%',left:'1%',transform:'translateY(-50%)'},{top:'50%',right:'1%',transform:'translateY(-50%)'}].map((pos,i)=>(
                  <div key={`e${i}`} className="absolute pointer-events-none" style={{...pos,fontSize:'1.77rem',opacity:0.09,color:'#5A0000',lineHeight:1}}>☠</div>
                ))}
                {/* Condemned text stamp */}
                <div className="absolute pointer-events-none" style={{bottom:'14%',left:'50%',transform:'translateX(-50%) rotate(-8deg)',fontFamily:'Cinzel,serif',fontSize:'1.3rem',fontWeight:900,letterSpacing:'0.35em',textTransform:'uppercase',color:'rgba(100,0,0,0.55)',whiteSpace:'nowrap',userSelect:'none'}}>
                  CONDEMNED
                </div>
              </>)}

              <div className="relative z-10 pt-4">

                {/* ── Top row: portrait + stats ── */}
                <div style={{display:'flex',gap:'16px',alignItems:'flex-start',marginBottom:'12px'}}>

                  {/* LEFT: Portrait */}
                  <div style={{flexShrink:0,width:'clamp(90px,22%,130px)',display:'flex',flexDirection:'column',alignItems:'center',gap:'6px'}}>
                    <div className={curseLevel===3?'animate-pulse':''} style={{
                      width:'100%',aspectRatio:'3/4',borderRadius:'6px',overflow:'hidden',position:'relative',
                      border: curseLevel===3?'2px solid rgba(139,0,0,0.9)':curseLevel===2?'2px solid rgba(107,44,145,0.8)':curseLevel===1?'2px solid rgba(107,44,145,0.5)':'2px solid rgba(80,45,15,0.6)',
                      boxShadow: curseLevel===3?'0 0 18px rgba(139,0,0,0.7), 0 0 40px rgba(100,0,0,0.4)':curseLevel===2?'0 0 14px rgba(107,44,145,0.6), 0 0 30px rgba(80,20,120,0.3)':curseLevel===1?'0 0 10px rgba(107,44,145,0.3)':'0 2px 12px rgba(0,0,0,0.35)',
                      transition:'border-color 0.5s ease, box-shadow 0.5s ease',
                    }}>
                      <img src={getHeroPortrait(hero.class.name, hero.gender)} alt={hero.name}
                        style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:'top',
                          filter: curseLevel===3?'saturate(0.4) brightness(0.8) sepia(0.25)':curseLevel===2?'saturate(0.7) brightness(0.9)':'none',
                          transition:'filter 0.5s ease'}}
                        onError={e=>{e.currentTarget.style.display='none';}}
                      />
                      {/* Curse vignette — portrait only */}
                      {curseLevel > 0 && (
                        <div style={{position:'absolute',inset:0,pointerEvents:'none',
                          background: curseLevel===3?'radial-gradient(ellipse at center, transparent 25%, rgba(80,0,0,0.45) 100%)':curseLevel===2?'radial-gradient(ellipse at center, transparent 35%, rgba(40,0,60,0.35) 100%)':'radial-gradient(ellipse at center, transparent 55%, rgba(20,0,40,0.18) 100%)',
                        }}/>
                      )}
                      {/* Skull overlay at level 3 */}
                      {curseLevel === 3 && (
                        <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',pointerEvents:'none',fontSize:'3.54rem',opacity:0.18,color:'#8B0000',lineHeight:1}}>☠</div>
                      )}
                    </div>
                    <p style={{fontFamily:'Cinzel,serif',fontWeight:900,fontSize:'clamp(0.85rem,2vw,1.05rem)',letterSpacing:'0.05em',color:'#000',textAlign:'center',lineHeight:1.2,wordBreak:'break-word'}}>{hero.name}</p>
                    <p style={{fontFamily:'Cinzel,serif',fontSize:'1rem',fontWeight:700,letterSpacing:'0.1em',color:'#000',textAlign:'center',textTransform:'uppercase',marginTop:'-2px'}}>{hero.class.name}</p>
                  </div>

                  {/* RIGHT: Rank, HP, Mana, ATK, DEF */}
                  <div style={{flex:1,minWidth:0,display:'flex',flexDirection:'column',gap:'8px'}}>

                    {/* Guild Rank */}
                    {guildRank && (
                      <div style={{textAlign:'center',padding:'4px 0 6px'}}>
                        <p style={{fontFamily:'Cinzel,serif',fontSize:'1.53rem',fontWeight:900,letterSpacing:'0.15em',textTransform:'uppercase',margin:0,color:guildRank.name==='Initiate'?'rgba(60,45,20,0.85)':guildRank.color,textShadow:guildRank.name==='Initiate'?'none':`0 0 16px ${guildRank.color}99, 0 2px 4px rgba(0,0,0,0.3)`}}>{guildRank.name}</p>
                      </div>
                    )}

                    {/* HP + SP */}
                    <div style={{display:'flex',flexDirection:'column',gap:'5px'}}>
                      <div className="rounded p-2" style={{background:'rgba(180,140,80,0.2)',border:'1px solid rgba(139,0,0,0.3)'}}>
                        <div className="flex justify-between items-center mb-1">
                          <span style={{fontFamily:'Cinzel,serif',fontSize:'1rem',fontWeight:900,color:'#000',letterSpacing:'0.1em'}}>Health</span>
                          <span style={{fontFamily:'Cinzel,serif',fontSize:'1rem',fontWeight:900,color:'#000'}}>{hp}/{getMaxHp()}</span>
                        </div>
                        <div className="rounded h-2.5 overflow-hidden" style={{background:'rgba(139,0,0,0.15)'}}><div className="h-full rounded transition-all" style={{width:`${(hp/getMaxHp())*100}%`,background:hp/getMaxHp()<0.25?'#8B0000':'linear-gradient(to right,#7f1d1d,#b91c1c)'}}/></div>
                      </div>
                      <div className="rounded p-2" style={{background:'rgba(180,140,80,0.2)',border:'1px solid rgba(30,58,140,0.3)'}}>
                        <div className="flex justify-between items-center mb-1">
                          <span style={{fontFamily:'Cinzel,serif',fontSize:'1rem',fontWeight:900,color:'#000',letterSpacing:'0.1em'}}>Mana</span>
                          <span style={{fontFamily:'Cinzel,serif',fontSize:'1rem',fontWeight:900,color:'#000'}}>{stamina}/{getMaxStamina()}</span>
                        </div>
                        <div className="rounded h-2.5 overflow-hidden" style={{background:'rgba(30,58,140,0.15)'}}><div className="h-full rounded transition-all" style={{width:`${(stamina/getMaxStamina())*100}%`,background:'linear-gradient(to right,#1e3a8a,#2563eb)'}}/></div>
                      </div>
                    </div>

                    {/* ATK + DEF */}
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'6px'}}>
                      {(()=>{const ic=(()=>{const m={red:'#8B0000',blue:'#1E3A8A',green:'#064E3B',white:'#4B5563',purple:'#4B0082',yellow:'#92400E',amber:'#14532D'};return m[hero.class.color]||m.yellow;})();return(<>
                        <div className="rounded text-center" style={{padding:'12px 10px',background:'rgba(180,140,80,0.2)',border:'1px solid rgba(80,45,15,0.3)'}}>
                          <Swords size={15} style={{color:ic,margin:'0 auto 4px'}}/>
                          <p style={{fontFamily:'Cinzel,serif',fontWeight:900,fontSize:'1.65rem',color:'#000',lineHeight:1}}>{getBaseAttack()}</p>
                          <p style={{fontFamily:'Cinzel,serif',fontSize:'1rem',fontWeight:700,letterSpacing:'0.1em',color:'#000',marginTop:'4px',textTransform:'uppercase'}}>Attack</p>
                        </div>
                        <div className="rounded text-center" style={{padding:'12px 10px',background:'rgba(180,140,80,0.2)',border:'1px solid rgba(80,45,15,0.3)'}}>
                          <ShieldCheck size={15} style={{color:ic,margin:'0 auto 4px'}}/>
                          <p style={{fontFamily:'Cinzel,serif',fontWeight:900,fontSize:'1.65rem',color:'#000',lineHeight:1}}>{Math.floor((getBaseDefense()/(getBaseDefense()+50))*100)}%</p>
                          <p style={{fontFamily:'Cinzel,serif',fontSize:'1rem',fontWeight:700,letterSpacing:'0.1em',color:'#000',marginTop:'4px',textTransform:'uppercase'}}>Defense</p>
                        </div>
                      </>);})()}
                    </div>

                  </div>{/* end right column */}
                </div>{/* end top row */}

                {/* ── Full-width: Ability Scores ── */}
                {(()=>{const ab=hero.abilities||{str:10,dex:10,con:10,int:10,wis:10,cha:10};const pMap={Knight:'str',Wizard:'int',Assassin:'dex',Crusader:'con'};const primary=pMap[hero.class.name]||'str';const ic=(()=>{const m={red:'#7F0000',blue:'#142B6E',green:'#063B28',white:'#1F2937',purple:'#3B006A',yellow:'#6B2E00',amber:'#0E3D1E'};return m[hero.class.color]||m.yellow;})();const fullNames={str:'Strength',dex:'Dexterity',con:'Constitution',int:'Intelligence',wis:'Wisdom',cha:'Charisma'};return(<>
                  <div className="flex items-center gap-2 mb-2">
                    <div style={{flex:'1',height:'1px',background:'rgba(60,30,5,0.4)'}}/>
                    <p style={{fontFamily:'Cinzel,serif',fontSize:'1rem',fontWeight:900,letterSpacing:'0.15em',color:'#000',textTransform:'uppercase',whiteSpace:'nowrap'}}>Ability Scores</p>
                    <div style={{flex:'1',height:'1px',background:'rgba(60,30,5,0.4)'}}/>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'6px'}}>
                    {['str','dex','con','int','wis','cha'].map(key=>{
                      const score=ab[key]||10;const mod=Math.floor((score-10)/2);const ip=key===primary;
                      return(<div key={key} className="rounded text-center" style={{padding:'8px 6px',background:ip?'rgba(140,90,30,0.25)':'rgba(180,140,80,0.15)',border:`1px solid ${ip?'rgba(60,30,5,0.5)':'rgba(60,30,5,0.2)'}`}}>
                        <p style={{fontFamily:'Cinzel,serif',fontSize:'0.97rem',letterSpacing:'0.05em',color:'#000',marginBottom:'3px',fontWeight:900}}>{fullNames[key]}</p>
                        <p style={{fontFamily:'Cinzel,serif',fontSize:'1.77rem',fontWeight:900,color:'#000',lineHeight:1}}>{score}</p>
                        <p style={{fontFamily:'Cinzel,serif',fontSize:'0.97rem',color:'#000',marginTop:'3px',fontWeight:900}}>{mod>=0?'+':''}{mod}</p>
                      </div>);
                    })}
                  </div>
                </>);})()}


              </div>
              </>
            </div>

            {/* ── Guild Services separator — heavier ornament ── */}
            <div className="max-w-2xl mx-auto flex items-center gap-3">
              <div style={{flex:1,height:'1px',background:'rgba(212,175,55,0.4)'}}/>
              <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                <span style={{color:'rgba(212,175,55,0.78)',fontSize:'0.83rem'}}>✦</span>
                <p style={{fontFamily:'Cinzel,serif',fontSize:'0.97rem',fontWeight:900,letterSpacing:'0.3em',textTransform:'uppercase',color:'rgba(212,175,55,0.85)',whiteSpace:'nowrap',margin:0}}>Guild Services</p>
                <span style={{color:'rgba(212,175,55,0.78)',fontSize:'0.83rem'}}>✦</span>
              </div>
              <div style={{flex:1,height:'1px',background:'rgba(212,175,55,0.4)'}}/>
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
                  backgroundImage:'linear-gradient(160deg,rgba(10,8,5,0.85),rgba(18,14,8,0.85),rgba(6,5,3,0.85)), url(/Stonewall2.png)',
                  backgroundSize:'cover',backgroundPosition:'center',
                  border:'1px solid rgba(212,175,55,0.4)',
                  boxShadow:'0 4px 16px rgba(0,0,0,0.5), inset 0 1px 0 rgba(212,175,55,0.04)',
                  transition:'all 0.2s',display:'flex',flexDirection:'column',alignItems:'center',gap:'8px'}}
                onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-3px)';e.currentTarget.style.boxShadow='0 8px 24px rgba(150,120,20,0.3), inset 0 1px 0 rgba(212,175,55,0.04)';e.currentTarget.style.borderColor='rgba(212,175,55,0.72)';}}
                onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='0 4px 16px rgba(0,0,0,0.5), inset 0 1px 0 rgba(212,175,55,0.04)';e.currentTarget.style.borderColor='rgba(212,175,55,0.4)';}}
              >
                <img src={dwarf.img} alt={dwarf.name} style={{width:'96px',height:'96px',objectFit:'cover',objectPosition:'top',borderRadius:'50%',border:'2px solid rgba(212,175,55,0.5)',boxShadow:'0 0 12px rgba(212,175,55,0.2)'}}/>
                <div>
                  <p style={{fontFamily:"'Cinzel',serif",fontWeight:900,fontSize:'1.06rem',letterSpacing:'0.15em',textTransform:'uppercase',color:'rgba(212,175,55,0.75)',marginBottom:'3px'}}>{dwarf.name}</p>
                  <p style={{fontFamily:"'Cinzel',serif",fontWeight:900,fontSize:'clamp(1rem,2vw,1.15rem)',letterSpacing:'0.1em',textTransform:'uppercase',color:'rgba(235,210,110,1)',marginBottom:'4px'}}>The Armory</p>
                  <div style={{width:'30px',height:'1px',background:'rgba(212,175,55,0.35)',margin:'0 auto 5px'}}/>
                  <p style={{fontFamily:"'Cinzel',serif",fontSize:'1.04rem',letterSpacing:'0.1em',color:'rgba(180,148,50,0.78)',textTransform:'uppercase',lineHeight:1.4}}>Potions · Gear</p>
                </div>
              </button>

              {/* Merchant */}
              <button
                onClick={() => { sounds.click(); setShowCraftingModal(true); }}
                style={{padding:'16px 10px 14px',borderRadius:'10px',cursor:'pointer',textAlign:'center',
                  backgroundImage:'linear-gradient(160deg,rgba(10,8,5,0.85),rgba(18,14,8,0.85),rgba(6,5,3,0.85)), url(/Stonewall2.png)',
                  backgroundSize:'cover',backgroundPosition:'center',
                  border:'1px solid rgba(212,175,55,0.4)',
                  boxShadow:'0 4px 16px rgba(0,0,0,0.5), inset 0 1px 0 rgba(212,175,55,0.04)',
                  transition:'all 0.2s',display:'flex',flexDirection:'column',alignItems:'center',gap:'8px'}}
                onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-3px)';e.currentTarget.style.boxShadow='0 8px 24px rgba(150,120,20,0.3), inset 0 1px 0 rgba(212,175,55,0.04)';e.currentTarget.style.borderColor='rgba(212,175,55,0.72)';}}
                onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='0 4px 16px rgba(0,0,0,0.5), inset 0 1px 0 rgba(212,175,55,0.04)';e.currentTarget.style.borderColor='rgba(212,175,55,0.4)';}}
              >
                <img src={elf.img} alt={elf.name} style={{width:'96px',height:'96px',objectFit:'cover',objectPosition:'top',borderRadius:'50%',border:'2px solid rgba(212,175,55,0.5)',boxShadow:'0 0 12px rgba(212,175,55,0.2)'}}/>
                <div>
                  <p style={{fontFamily:"'Cinzel',serif",fontWeight:900,fontSize:'1.06rem',letterSpacing:'0.15em',textTransform:'uppercase',color:'rgba(212,175,55,0.75)',marginBottom:'3px'}}>{elf.name}</p>
                  <p style={{fontFamily:"'Cinzel',serif",fontWeight:900,fontSize:'clamp(1rem,2vw,1.15rem)',letterSpacing:'0.1em',textTransform:'uppercase',color:'rgba(235,210,110,1)',marginBottom:'4px'}}>The Merchant</p>
                  <div style={{width:'30px',height:'1px',background:'rgba(212,175,55,0.35)',margin:'0 auto 5px'}}/>
                  <p style={{fontFamily:"'Cinzel',serif",fontSize:'1.04rem',letterSpacing:'0.1em',color:'rgba(180,148,50,0.78)',textTransform:'uppercase',lineHeight:1.4}}>Craft · Trade</p>
                </div>
              </button>

              {/* Healer */}
              <button
                onClick={() => { sounds.click(); onOpenHealer && onOpenHealer(); }}
                style={{padding:'16px 10px 14px',borderRadius:'10px',cursor:'pointer',textAlign:'center',
                  backgroundImage:'linear-gradient(160deg,rgba(10,8,5,0.85),rgba(18,14,8,0.85),rgba(6,5,3,0.85)), url(/Stonewall2.png)',
                  backgroundSize:'cover',backgroundPosition:'center',
                  border:'1px solid rgba(212,175,55,0.4)',
                  boxShadow:'0 4px 16px rgba(0,0,0,0.5), inset 0 1px 0 rgba(212,175,55,0.04)',
                  transition:'all 0.2s',display:'flex',flexDirection:'column',alignItems:'center',gap:'8px'}}
                onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-3px)';e.currentTarget.style.boxShadow='0 8px 24px rgba(150,120,20,0.3), inset 0 1px 0 rgba(212,175,55,0.04)';e.currentTarget.style.borderColor='rgba(212,175,55,0.72)';}}
                onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='0 4px 16px rgba(0,0,0,0.5), inset 0 1px 0 rgba(212,175,55,0.04)';e.currentTarget.style.borderColor='rgba(212,175,55,0.4)';}}
              >
                <img src="/npcs/medic.png" alt="Healer" style={{width:'96px',height:'96px',objectFit:'cover',objectPosition:'top',borderRadius:'50%',border:'2px solid rgba(212,175,55,0.5)',boxShadow:'0 0 12px rgba(212,175,55,0.2)'}}/>
                <div>
                  <p style={{fontFamily:"'Cinzel',serif",fontWeight:900,fontSize:'1.06rem',letterSpacing:'0.15em',textTransform:'uppercase',color:'rgba(212,175,55,0.75)',marginBottom:'3px'}}>Sister Mara</p>
                  <p style={{fontFamily:"'Cinzel',serif",fontWeight:900,fontSize:'clamp(1rem,2vw,1.15rem)',letterSpacing:'0.1em',textTransform:'uppercase',color:'rgba(235,210,110,1)',marginBottom:'4px'}}>The Healer</p>
                  <div style={{width:'30px',height:'1px',background:'rgba(212,175,55,0.35)',margin:'0 auto 5px'}}/>
                  <p style={{fontFamily:"'Cinzel',serif",fontSize:'1.04rem',letterSpacing:'0.1em',color:'rgba(180,148,50,0.78)',textTransform:'uppercase',lineHeight:1.4}}>Restore HP</p>
                </div>
              </button>

            </div>

            {/* Row 2 — Kael · Rylan · TBD */}
            <div className="max-w-2xl mx-auto" style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'10px',marginTop:'10px'}}>

              {/* Bestiary — Kael */}
              <button
                onClick={() => { sounds.click(); onOpenBestiary && onOpenBestiary(); }}
                style={{padding:'16px 10px 14px',borderRadius:'10px',cursor:'pointer',textAlign:'center',
                  backgroundImage:'linear-gradient(160deg,rgba(10,8,5,0.85),rgba(18,14,8,0.85),rgba(6,5,3,0.85)), url(/Stonewall2.png)',
                  backgroundSize:'cover',backgroundPosition:'center',
                  border:'1px solid rgba(212,175,55,0.4)',
                  boxShadow:'0 4px 16px rgba(0,0,0,0.5), inset 0 1px 0 rgba(212,175,55,0.04)',
                  transition:'all 0.2s',display:'flex',flexDirection:'column',alignItems:'center',gap:'8px'}}
                onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-3px)';e.currentTarget.style.boxShadow='0 8px 24px rgba(150,120,20,0.3), inset 0 1px 0 rgba(212,175,55,0.04)';e.currentTarget.style.borderColor='rgba(212,175,55,0.72)';}}
                onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='0 4px 16px rgba(0,0,0,0.5), inset 0 1px 0 rgba(212,175,55,0.04)';e.currentTarget.style.borderColor='rgba(212,175,55,0.4)';}}
              >
                <img src="/npcs/female-warrior.png" alt="Kael" style={{width:'96px',height:'96px',objectFit:'cover',objectPosition:'top',borderRadius:'50%',border:'2px solid rgba(212,175,55,0.5)',boxShadow:'0 0 12px rgba(212,175,55,0.2)'}}/>
                <div>
                  <p style={{fontFamily:"'Cinzel',serif",fontWeight:900,fontSize:'1.06rem',letterSpacing:'0.15em',textTransform:'uppercase',color:'rgba(212,175,55,0.75)',marginBottom:'3px'}}>Kael</p>
                  <p style={{fontFamily:"'Cinzel',serif",fontWeight:900,fontSize:'clamp(1rem,2vw,1.15rem)',letterSpacing:'0.1em',textTransform:'uppercase',color:'rgba(235,210,110,1)',marginBottom:'4px'}}>The Bestiary</p>
                  <div style={{width:'30px',height:'1px',background:'rgba(212,175,55,0.35)',margin:'0 auto 5px'}}/>
                  <p style={{fontFamily:"'Cinzel',serif",fontSize:'1.04rem',letterSpacing:'0.1em',color:'rgba(180,148,50,0.78)',textTransform:'uppercase',lineHeight:1.4}}>Creatures · Factions</p>
                </div>
              </button>

              {/* Forge — Rylan */}
              <button
                onClick={() => { sounds.click(); onOpenForge && onOpenForge(); }}
                style={{padding:'16px 10px 14px',borderRadius:'10px',cursor:'pointer',textAlign:'center',
                  backgroundImage:'linear-gradient(160deg,rgba(10,8,5,0.85),rgba(18,14,8,0.85),rgba(6,5,3,0.85)), url(/Stonewall2.png)',
                  backgroundSize:'cover',backgroundPosition:'center',
                  border:'1px solid rgba(212,175,55,0.4)',
                  boxShadow:'0 4px 16px rgba(0,0,0,0.5), inset 0 1px 0 rgba(212,175,55,0.04)',
                  transition:'all 0.2s',display:'flex',flexDirection:'column',alignItems:'center',gap:'8px'}}
                onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-3px)';e.currentTarget.style.boxShadow='0 8px 24px rgba(150,120,20,0.3), inset 0 1px 0 rgba(212,175,55,0.04)';e.currentTarget.style.borderColor='rgba(212,175,55,0.72)';}}
                onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='0 4px 16px rgba(0,0,0,0.5), inset 0 1px 0 rgba(212,175,55,0.04)';e.currentTarget.style.borderColor='rgba(212,175,55,0.4)';}}
              >
                <img src="/npcs/warrior.png" alt="Rylan" style={{width:'96px',height:'96px',objectFit:'cover',objectPosition:'top',borderRadius:'50%',border:'2px solid rgba(212,175,55,0.5)',boxShadow:'0 0 12px rgba(212,175,55,0.2)'}}/>
                <div>
                  <p style={{fontFamily:"'Cinzel',serif",fontWeight:900,fontSize:'1.06rem',letterSpacing:'0.15em',textTransform:'uppercase',color:'rgba(212,175,55,0.75)',marginBottom:'3px'}}>Rylan</p>
                  <p style={{fontFamily:"'Cinzel',serif",fontWeight:900,fontSize:'clamp(1rem,2vw,1.15rem)',letterSpacing:'0.1em',textTransform:'uppercase',color:'rgba(235,210,110,1)',marginBottom:'4px'}}>The Forge</p>
                  <div style={{width:'30px',height:'1px',background:'rgba(212,175,55,0.35)',margin:'0 auto 5px'}}/>
                  <p style={{fontFamily:"'Cinzel',serif",fontSize:'1.04rem',letterSpacing:'0.1em',color:'rgba(180,148,50,0.78)',textTransform:'uppercase',lineHeight:1.4}}>Study · Flashcards</p>
                </div>
              </button>

              {/* Soren — The Chronicle */}
              <button
                onClick={() => { sounds.click(); onOpenHero && onOpenHero(); }}
                style={{padding:'16px 10px 14px',borderRadius:'10px',cursor:'pointer',textAlign:'center',position:'relative',
                  backgroundImage:'linear-gradient(160deg,rgba(10,8,5,0.85),rgba(18,14,8,0.85),rgba(6,5,3,0.85)), url(/Stonewall2.png)',
                  backgroundSize:'cover',backgroundPosition:'center',
                  border:'1px solid rgba(212,175,55,0.4)',
                  boxShadow:'0 4px 16px rgba(0,0,0,0.5), inset 0 1px 0 rgba(212,175,55,0.04)',
                  transition:'all 0.2s',display:'flex',flexDirection:'column',alignItems:'center',gap:'8px'}}
                onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-3px)';e.currentTarget.style.boxShadow='0 8px 24px rgba(150,120,20,0.3), inset 0 1px 0 rgba(212,175,55,0.04)';e.currentTarget.style.borderColor='rgba(212,175,55,0.72)';}}
                onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='0 4px 16px rgba(0,0,0,0.5), inset 0 1px 0 rgba(212,175,55,0.04)';e.currentTarget.style.borderColor='rgba(212,175,55,0.4)';}}
              >
                {unspentStatPoints > 0 && (
                  <div style={{position:'absolute',top:'-5px',right:'-5px',minWidth:'20px',height:'20px',borderRadius:'10px',background:'rgba(212,175,55,0.95)',border:'1px solid rgba(255,235,150,0.6)',display:'flex',alignItems:'center',justifyContent:'center',padding:'0 5px',boxShadow:'0 0 10px rgba(212,175,55,0.7)',zIndex:5}}>
                    <span style={{fontFamily:"'Cinzel',serif",fontSize:'0.71rem',fontWeight:900,color:'#1a1200',letterSpacing:'0.05em'}}>{unspentStatPoints}</span>
                  </div>
                )}
                <img src="/npcs/elf-warrior.png" alt="Soren" style={{width:'96px',height:'96px',objectFit:'cover',objectPosition:'top',borderRadius:'50%',border:'2px solid rgba(212,175,55,0.5)',boxShadow:'0 0 12px rgba(212,175,55,0.2)'}}
                  onError={e=>{e.currentTarget.style.display='none';}}/>
                <div>
                  <p style={{fontFamily:"'Cinzel',serif",fontWeight:900,fontSize:'1.06rem',letterSpacing:'0.15em',textTransform:'uppercase',color:'rgba(212,175,55,0.75)',marginBottom:'3px'}}>Soren</p>
                  <p style={{fontFamily:"'Cinzel',serif",fontWeight:900,fontSize:'clamp(1rem,2vw,1.15rem)',letterSpacing:'0.1em',textTransform:'uppercase',color:'rgba(235,210,110,1)',marginBottom:'4px'}}>The Chronicle</p>
                  <div style={{width:'30px',height:'1px',background:'rgba(212,175,55,0.35)',margin:'0 auto 5px'}}/>
                  <p style={{fontFamily:"'Cinzel',serif",fontSize:'1.04rem',letterSpacing:'0.1em',color:'rgba(180,148,50,0.78)',textTransform:'uppercase',lineHeight:1.4}}>Attributes · Growth</p>
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
