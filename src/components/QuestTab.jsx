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
  // Hero card UI
  heroCardCollapsed,
  setHeroCardCollapsed,
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
}) => {
  return (
            <div className="space-y-4">
            <div className="rounded-xl p-4 max-w-2xl mx-auto relative overflow-hidden" style={{
              background: (() => {
                const colorMap = {
                  red: '#3D0A0A',      // Warrior - Deep crimson red (darker, richer)
                  blue: '#1E2A5A',     // Mage - Brighter deep blue (more vibrant)
                  green: '#0A2818',    // Assassin - Deep emerald shadow
                  white: '#4A4A4A',    // Crusader - Lighter gray (for more contrast with white)
                  purple: '#2A1A3D',   // Legacy purple
                  yellow: '#3D3A1F',   // Legacy yellow
                  amber: '#1E3A2E'     // Ranger - Forest green (nature theme)
                };
                return colorMap[hero.class.color] || colorMap.yellow;
              })(),
              border: (() => { const m={red:'rgba(180,30,30,0.5)',blue:'rgba(59,130,246,0.4)',green:'rgba(16,185,129,0.4)',white:'rgba(200,200,200,0.35)',purple:'rgba(139,92,246,0.4)',yellow:'rgba(212,175,55,0.4)',amber:'rgba(34,197,94,0.4)'}; return '2px solid '+(m[hero.class.color]||m.yellow); })(),
              boxShadow: (() => { const m={red:'rgba(180,30,30,0.25)',blue:'rgba(59,130,246,0.2)',green:'rgba(16,185,129,0.2)',white:'rgba(200,200,200,0.15)',purple:'rgba(139,92,246,0.2)',yellow:'rgba(212,175,55,0.2)',amber:'rgba(34,197,94,0.2)'}; const g=m[hero.class.color]||m.yellow; return '0 4px 30px '+g+', 0 0 60px '+g+', inset 0 0 50px rgba(0,0,0,0.4)'; })()
            }}>

              {heroCardCollapsed ? (
                // Collapsed state - minimal medieval theme
                <div className="relative">
                  {/* Large watermark emblem in center background */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{fontSize: '7rem', lineHeight: 1, opacity: 0.06, color: '#F5F5DC'}}>
                    {getCardStyle(hero.class, currentDay).emblem}
                  </div>

                  <div className="relative z-10">
                    {/* Header: name left, level right */}
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="font-black uppercase" style={{fontFamily:'Cinzel,serif',fontSize:'clamp(1.4rem,4vw,1.9rem)',letterSpacing:'0.06em',color:'#C8C8B0',textShadow:(()=>{const m={red:'rgba(220,50,50,0.35)',blue:'rgba(96,165,250,0.35)',green:'rgba(16,185,129,0.35)',white:'rgba(220,220,220,0.3)',purple:'rgba(167,139,250,0.35)',yellow:'rgba(212,175,55,0.35)',amber:'rgba(34,197,94,0.35)'};return '0 0 20px '+(m[hero.class.color]||m.yellow);})()}}>{hero.name}</h3>
                        <p className="text-xs uppercase tracking-widest mt-0.5" style={{color:(()=>{const m={red:'rgba(220,50,50,0.75)',blue:'rgba(96,165,250,0.75)',green:'rgba(16,185,129,0.75)',white:'rgba(200,200,200,0.75)',purple:'rgba(167,139,250,0.75)',yellow:'rgba(212,175,55,0.75)',amber:'rgba(34,197,94,0.75)'};return m[hero.class.color]||m.yellow;})(),fontFamily:'Cinzel,serif'}}>{hero.title} • {hero.class.name}</p>
                      </div>
                      <div className="text-right">
                        <div className="px-3 py-1 rounded border" style={{background:'rgba(0,0,0,0.5)',borderColor:'rgba(212,175,55,0.4)'}}>
                          <span className="text-xs font-bold" style={{color:'#D4AF37',letterSpacing:'0.1em',fontFamily:'Cinzel,serif'}}>LVL {level}</span>
                        </div>
                        <div className="px-2 py-0.5 rounded mt-1" style={{background:'rgba(0,0,0,0.4)',border:'1px solid rgba(212,175,55,0.2)'}}>
                          <span className="text-xs" style={{color:getGuildRank(level).color,letterSpacing:'0.08em',fontFamily:'Cinzel,serif'}}>{getGuildRank(level).name}</span>
                        </div>
                        <p className="text-xs mt-1" style={{color:'rgba(245,245,220,0.4)'}}>Day {currentDay}</p>
                      </div>
                    </div>

                    {/* HP Bar */}
                    <div className="mb-2">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs uppercase tracking-widest font-bold" style={{color:'#FF6B6B'}}>HP</span>
                        <span className="text-xs font-bold" style={{color:hp/getMaxHp()<0.25?'#EF4444':'#F5F5DC'}}>{hp} / {getMaxHp()}</span>
                      </div>
                      <div className="rounded h-2.5 overflow-hidden" style={{background:'rgba(0,0,0,0.6)',border:'1px solid rgba(139,0,0,0.4)'}}>
                        <div className="h-full rounded transition-all duration-300" style={{width:`${(hp/getMaxHp())*100}%`,background:hp/getMaxHp()<0.25?'linear-gradient(to right,#7F1D1D,#DC2626)':'linear-gradient(to right,#7f1d1d,#b91c1c,#dc2626)'}}/>
                      </div>
                    </div>
                    {/* SP Bar */}
                    <div className="mb-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs uppercase tracking-widest font-bold" style={{color:'#60A5FA'}}>SP</span>
                        <span className="text-xs font-bold" style={{color:'#93C5FD'}}>{stamina} / {getMaxStamina()}</span>
                      </div>
                      <div className="rounded h-2.5 overflow-hidden" style={{background:'rgba(0,0,0,0.6)',border:'1px solid rgba(30,58,140,0.4)'}}>
                        <div className="h-full rounded transition-all duration-300" style={{width:`${(stamina/getMaxStamina())*100}%`,background:'linear-gradient(to right,#1e3a8a,#2563eb,#3b82f6)'}}/>
                      </div>
                    </div>

                    {curseLevel > 0 && (
                      <div className={`rounded p-2 mb-3 ${curseLevel===3?'animate-pulse':''}`} style={{background:'rgba(107,44,145,0.25)',border:`1px solid ${curseLevel===3?'rgba(220,38,38,0.6)':'rgba(138,59,181,0.45)'}`}}>
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold uppercase" style={{color:curseLevel===3?'#FF6B6B':'#B794F4',fontFamily:'Cinzel,serif'}}>{curseLevel===1?'Cursed':curseLevel===2?'Deeply Cursed':'Condemned'}</p>
                          <p className="text-xs" style={{color:'#B794F4'}}>{curseLevel}/3</p>
                        </div>
                      </div>
                    )}

                    <button onClick={() => { sounds.click(); setHeroCardCollapsed(false); }} className="w-full py-1.5 rounded text-xs uppercase tracking-widest transition-all hover:opacity-80" style={{background:'rgba(0,0,0,0.4)',border:'1px solid rgba(212,175,55,0.25)',color:'rgba(212,175,55,0.6)',fontFamily:'Cinzel,serif'}}>
                      ▼ Show Full Card
                    </button>
                  </div>
                </div>
              ) : (
                // Expanded state - full hero card
                <>
              {/* Large watermark emblem in center background */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{fontSize: '20rem', lineHeight: 1, opacity: 0.04, color: '#F5F5DC'}}>
                {getCardStyle(hero.class, currentDay).emblem}
              </div>

              {/* Corner badges */}
              <div className="absolute top-0 left-0 px-3 py-1 rounded-br-lg z-20" style={{background:'rgba(0,0,0,0.6)',border:'1px solid rgba(212,175,55,0.3)',borderTop:'none',borderLeft:'none'}}>
                <span className="text-xs font-bold" style={{color:'rgba(212,175,55,0.7)',letterSpacing:'0.1em',fontFamily:'Cinzel,serif'}}>DAY {currentDay}</span>
              </div>
              <div className="absolute top-0 right-0 px-3 py-1 rounded-bl-lg z-20" style={{background:'rgba(0,0,0,0.6)',border:'1px solid rgba(212,175,55,0.3)',borderTop:'none',borderRight:'none'}}>
                <span className="text-xs font-bold" style={{color:'rgba(212,175,55,0.7)',letterSpacing:'0.1em',fontFamily:'Cinzel,serif'}}>LVL {level} • {getGuildRank(level).name}</span>
              </div>

              <div className="relative z-10">
                {/* Hero name — cinematic */}
                <div className="text-center mb-4 pt-7">
                  <h2 className="font-black uppercase" style={{fontFamily:'Cinzel,serif',fontSize:'clamp(2rem,5vw,3.2rem)',letterSpacing:'0.1em',lineHeight:1.1,color:'#C8C8B0',textShadow:(()=>{const m={red:'rgba(220,50,50,0.45)',blue:'rgba(96,165,250,0.45)',green:'rgba(16,185,129,0.45)',white:'rgba(220,220,220,0.35)',purple:'rgba(167,139,250,0.45)',yellow:'rgba(212,175,55,0.45)',amber:'rgba(34,197,94,0.45)'};const c=m[hero.class.color]||m.yellow;return `0 0 30px ${c}, 0 0 60px ${c.replace('0.45','0.2')}, 0 2px 0 rgba(0,0,0,0.9)`;})()}}>{hero.name}</h2>
                  <p className="text-xs uppercase tracking-[0.35em] mt-1.5" style={{color:(()=>{const m={red:'rgba(220,50,50,0.8)',blue:'rgba(96,165,250,0.8)',green:'rgba(16,185,129,0.8)',white:'rgba(200,200,200,0.8)',purple:'rgba(167,139,250,0.8)',yellow:'rgba(212,175,55,0.8)',amber:'rgba(34,197,94,0.8)'};return m[hero.class.color]||m.yellow;})(),fontFamily:'Cinzel,serif'}}>{hero.title} • {hero.class.name}</p>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    {(()=>{const m={red:'rgba(220,50,50,0.5)',blue:'rgba(96,165,250,0.5)',green:'rgba(16,185,129,0.5)',white:'rgba(200,200,200,0.4)',purple:'rgba(167,139,250,0.5)',yellow:'rgba(212,175,55,0.5)',amber:'rgba(34,197,94,0.5)'};const c=m[hero.class.color]||m.yellow;return(<><div style={{width:'60px',height:'1px',background:`linear-gradient(to right,transparent,${c})`}}></div><span style={{color:c,fontSize:'8px'}}>◆</span><div style={{width:'60px',height:'1px',background:`linear-gradient(to left,transparent,${c})`}}></div></>);})()}
                  </div>
                </div>

                {/* Experience bar */}
                <div className="mb-3 rounded-lg p-2" style={{backgroundColor: 'rgba(0, 0, 0, 0.35)', border: '2px solid rgba(0, 0, 0, 0.3)'}}>
                  <div className="flex justify-between text-sm mb-1" style={{color: '#D4AF37'}}>
                    <span className="font-bold uppercase tracking-wide" style={{color:(()=>{const m={red:'rgba(220,50,50,1)',blue:'rgba(96,165,250,1)',green:'rgba(16,185,129,1)',white:'rgba(200,200,200,1)',purple:'rgba(167,139,250,1)',yellow:'rgba(212,175,55,1)',amber:'rgba(34,197,94,1)'};return m[hero.class.color]||m.yellow;})()}}>Experience</span>
                    <span className="font-bold">{(() => {
                      let xpSpent = 0;
                      for (let i = 1; i < level; i++) {
                        xpSpent += Math.floor(GAME_CONSTANTS.XP_PER_LEVEL * Math.pow(1.3, i - 1));
                      }
                      const currentLevelXp = xp - xpSpent;
                      const xpNeeded = Math.floor(GAME_CONSTANTS.XP_PER_LEVEL * Math.pow(1.3, level - 1));
                      return `${currentLevelXp} / ${xpNeeded}`;
                    })()}</span>
                  </div>
                  <div className="rounded-full h-3 overflow-hidden" style={{backgroundColor: 'rgba(0, 0, 0, 0.5)'}}>
                    <div className="h-3 rounded-full transition-all duration-300" style={{
                      background: (() => {
                        const gradientMap = {
                          red: 'linear-gradient(90deg, #8B0000 0%, #DC143C 100%)',           // Warrior - unchanged
                          blue: 'linear-gradient(90deg, #2563EB 0%, #60A5FA 100%)',          // Mage - bright blue to lighter blue
                          green: 'linear-gradient(90deg, #064E3B 0%, #10B981 100%)',         // Assassin - dark forest to emerald
                          white: 'linear-gradient(90deg, #E5E7EB 0%, #FFFFFF 100%)',         // Crusader - light gray to pure white
                          purple: 'linear-gradient(90deg, #4B0082 0%, #9370DB 100%)',        // Legacy purple
                          yellow: 'linear-gradient(90deg, #B8860B 0%, #FFD700 100%)',        // Legacy yellow
                          amber: 'linear-gradient(90deg, #166534 0%, #22C55E 100%)'          // Ranger - dark forest to bright green
                        };
                        return gradientMap[hero.class.color] || 'linear-gradient(90deg, #B8860B 0%, #FFD700 100%)';
                      })(),
                      width: `${(() => {
                        let xpSpent = 0;
                        for (let i = 1; i < level; i++) {
                          xpSpent += Math.floor(GAME_CONSTANTS.XP_PER_LEVEL * Math.pow(1.3, i - 1));
                        }
                        const currentLevelXp = xp - xpSpent;
                        const xpNeeded = Math.floor(GAME_CONSTANTS.XP_PER_LEVEL * Math.pow(1.3, level - 1));
                        return (currentLevelXp / xpNeeded) * 100;
                      })()}%`
                    }}></div>
                  </div>
                  <p className="text-xs text-right mt-1" style={{color: '#F5F5DC', opacity: 0.7}}>{(() => {
                    let xpSpent = 0;
                    for (let i = 1; i < level; i++) {
                      xpSpent += Math.floor(GAME_CONSTANTS.XP_PER_LEVEL * Math.pow(1.3, i - 1));
                    }
                    const currentLevelXp = xp - xpSpent;
                    const xpNeeded = Math.floor(GAME_CONSTANTS.XP_PER_LEVEL * Math.pow(1.3, level - 1));
                    return xpNeeded - currentLevelXp;
                  })()} XP TO NEXT LEVEL</p>
                </div>

                {/* Combat Stats Header */}
                <div className="flex items-center justify-center gap-3 mb-3">
                  <div style={{flex:'1',height:'1px',background:`linear-gradient(to right,transparent,${(()=>{const m={red:'rgba(220,50,50,0.5)',blue:'rgba(96,165,250,0.5)',green:'rgba(16,185,129,0.5)',white:'rgba(200,200,200,0.5)',purple:'rgba(167,139,250,0.5)',yellow:'rgba(212,175,55,0.5)',amber:'rgba(34,197,94,0.5)'};return m[hero.class.color]||m.yellow;})()})`}}></div>
                  <p className="text-xs uppercase tracking-wider whitespace-nowrap" style={{color:(()=>{const m={red:'rgba(220,50,50,0.85)',blue:'rgba(96,165,250,0.85)',green:'rgba(16,185,129,0.85)',white:'rgba(200,200,200,0.85)',purple:'rgba(167,139,250,0.85)',yellow:'rgba(212,175,55,0.85)',amber:'rgba(34,197,94,0.85)'};return m[hero.class.color]||m.yellow;})()}}>Combat Stats</p>
                  <div style={{flex:'1',height:'1px',background:`linear-gradient(to left,transparent,${(()=>{const m={red:'rgba(220,50,50,0.5)',blue:'rgba(96,165,250,0.5)',green:'rgba(16,185,129,0.5)',white:'rgba(200,200,200,0.5)',purple:'rgba(167,139,250,0.5)',yellow:'rgba(212,175,55,0.5)',amber:'rgba(34,197,94,0.5)'};return m[hero.class.color]||m.yellow;})()})`}}></div>
                </div>

                {/* Combat stats 2x2 grid */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {/* HP */}
                  <div className="rounded-lg p-3" style={{background:'rgba(0,0,0,0.4)',border:'1px solid rgba(139,0,0,0.5)',boxShadow:'inset 0 2px 6px rgba(0,0,0,0.4)'}}>
                    <div className="flex justify-between items-center mb-1.5"><div className="flex items-center gap-1.5"><HeartPulse size={14} style={{color:'#FF6B6B'}}/><span className="text-xs font-bold uppercase tracking-widest" style={{color:'#FF6B6B'}}>HP</span></div><span className="text-sm font-bold" style={{color:hp/getMaxHp()<0.25?'#EF4444':'#F5F5DC'}}>{hp}/{getMaxHp()}</span></div>
                    <div className="rounded h-3 overflow-hidden" style={{background:'rgba(0,0,0,0.6)',border:'1px solid rgba(139,0,0,0.3)'}}><div className="h-full rounded transition-all duration-300" style={{width:`${(hp/getMaxHp())*100}%`,background:hp/getMaxHp()<0.25?'linear-gradient(to right,#7F1D1D,#DC2626)':'linear-gradient(to right,#7f1d1d,#b91c1c,#ef4444)'}}/></div>
                  </div>

                  {/* Stamina */}
                  <div className="rounded-lg p-3" style={{background:'rgba(0,0,0,0.4)',border:'1px solid rgba(30,58,140,0.5)',boxShadow:'inset 0 2px 6px rgba(0,0,0,0.4)'}}>
                    <div className="flex justify-between items-center mb-1.5"><div className="flex items-center gap-1.5"><Sparkles size={14} style={{color:'#60A5FA'}}/><span className="text-xs font-bold uppercase tracking-widest" style={{color:'#60A5FA'}}>SP</span></div><span className="text-sm font-bold" style={{color:'#93C5FD'}}>{stamina}/{getMaxStamina()}</span></div>
                    <div className="rounded h-3 overflow-hidden" style={{background:'rgba(0,0,0,0.6)',border:'1px solid rgba(30,58,140,0.3)'}}><div className="h-full rounded transition-all duration-300" style={{width:`${(stamina/getMaxStamina())*100}%`,background:'linear-gradient(to right,#1e3a8a,#2563eb,#3b82f6)'}}/></div>
                  </div>

                  {/* Attack */}
                  <div className="rounded-lg p-3 text-center" style={{background:'rgba(0,0,0,0.4)',border:`1px solid ${(()=>{const m={red:'rgba(220,50,50,0.5)',blue:'rgba(96,165,250,0.5)',green:'rgba(16,185,129,0.5)',white:'rgba(200,200,200,0.5)',purple:'rgba(167,139,250,0.5)',yellow:'rgba(212,175,55,0.5)',amber:'rgba(34,197,94,0.5)'};return m[hero.class.color]||m.yellow;})()}`,boxShadow:'inset 0 2px 6px rgba(0,0,0,0.4)'}}>
                    <Swords size={18} style={{color:(()=>{const m={red:'rgba(220,50,50,1)',blue:'rgba(96,165,250,1)',green:'rgba(16,185,129,1)',white:'rgba(200,200,200,1)',purple:'rgba(167,139,250,1)',yellow:'rgba(212,175,55,1)',amber:'rgba(34,197,94,1)'};return m[hero.class.color]||m.yellow;})(),margin:'0 auto 6px'}}/>
                    <p className="text-2xl font-black" style={{color:'#F5F5DC',fontFamily:'Cinzel,serif',lineHeight:1}}>{getBaseAttack()}</p>
                    <p className="text-xs uppercase tracking-widest mt-1" style={{color:'rgba(245,245,220,0.45)'}}>Attack</p>
                  </div>

                  {/* Defense */}
                  <div className="rounded-lg p-3 text-center" style={{background:'rgba(0,0,0,0.4)',border:`1px solid ${(()=>{const m={red:'rgba(220,50,50,0.5)',blue:'rgba(96,165,250,0.5)',green:'rgba(16,185,129,0.5)',white:'rgba(200,200,200,0.5)',purple:'rgba(167,139,250,0.5)',yellow:'rgba(212,175,55,0.5)',amber:'rgba(34,197,94,0.5)'};return m[hero.class.color]||m.yellow;})()}`,boxShadow:'inset 0 2px 6px rgba(0,0,0,0.4)'}}>
                    <ShieldCheck size={18} style={{color:(()=>{const m={red:'rgba(220,50,50,1)',blue:'rgba(96,165,250,1)',green:'rgba(16,185,129,1)',white:'rgba(200,200,200,1)',purple:'rgba(167,139,250,1)',yellow:'rgba(212,175,55,1)',amber:'rgba(34,197,94,1)'};return m[hero.class.color]||m.yellow;})(),margin:'0 auto 6px'}}/>
                    <p className="text-2xl font-black" style={{color:'#F5F5DC',fontFamily:'Cinzel,serif',lineHeight:1}}>{Math.floor((getBaseDefense() / (getBaseDefense() + 50)) * 100)}%</p>
                    <p className="text-xs uppercase tracking-widest mt-1" style={{color:'rgba(245,245,220,0.45)'}}>Defense</p>
                  </div>
                </div>


                {/* Ability Scores */}
                <div className="flex items-center justify-center gap-3 mb-2 mt-1">
                  {(()=>{const m={red:'rgba(220,50,50,0.45)',blue:'rgba(96,165,250,0.45)',green:'rgba(16,185,129,0.45)',white:'rgba(200,200,200,0.4)',purple:'rgba(167,139,250,0.45)',yellow:'rgba(212,175,55,0.45)',amber:'rgba(34,197,94,0.45)'};const c=m[hero.class.color]||m.yellow;return(<><div style={{flex:'1',height:'1px',background:`linear-gradient(to right,transparent,${c})`}}></div><p className="text-xs uppercase tracking-wider whitespace-nowrap" style={{color:c}}>Ability Scores</p><div style={{flex:'1',height:'1px',background:`linear-gradient(to left,transparent,${c})`}}></div></>);})()}
                </div>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {(()=>{
                    const ab = hero.abilities || {str:10,dex:10,con:10,int:10,wis:10,cha:10};
                    const primaryMap = {Knight:'str',Wizard:'int',Assassin:'dex',Crusader:'con'};
                    const primary = primaryMap[hero.class.name] || 'str';
                    const classColorMap = {red:'rgba(220,50,50,VAL)',blue:'rgba(96,165,250,VAL)',green:'rgba(16,185,129,VAL)',white:'rgba(200,200,200,VAL)',purple:'rgba(167,139,250,VAL)',yellow:'rgba(212,175,55,VAL)',amber:'rgba(34,197,94,VAL)'};
                    const baseColor = (classColorMap[hero.class.color]||classColorMap.yellow);
                    const abbrevs = {str:'STR',dex:'DEX',con:'CON',int:'INT',wis:'WIS',cha:'CHA'};
                    const fullNames = {str:'Strength',dex:'Dexterity',con:'Constitution',int:'Intelligence',wis:'Wisdom',cha:'Charisma'};
                    return ['str','dex','con','int','wis','cha'].map(key => {
                      const score = ab[key] || 10;
                      const mod = Math.floor((score - 10) / 2);
                      const isPrimary = key === primary;
                      const borderColor = isPrimary ? baseColor.replace('VAL','0.7') : 'rgba(80,80,80,0.4)';
                      const labelColor = isPrimary ? baseColor.replace('VAL','1') : 'rgba(180,180,180,0.5)';
                      return (
                        <div key={key} className="rounded-lg p-2 text-center" style={{
                          background: isPrimary ? baseColor.replace('VAL','0.08') : 'rgba(0,0,0,0.35)',
                          border: `1px solid ${borderColor}`,
                          boxShadow: isPrimary ? `inset 0 0 12px ${baseColor.replace('VAL','0.1')}` : 'none',
                        }}>
                          <p style={{fontFamily:'Cinzel,serif',fontSize:'0.58rem',letterSpacing:'0.15em',color:labelColor,marginBottom:'2px'}}>{abbrevs[key]}</p>
                          <p style={{fontFamily:'Cinzel,serif',fontSize:'1.3rem',fontWeight:900,color:'#F5F5DC',lineHeight:1}}>{score}</p>
                          <p style={{fontFamily:'Cinzel,serif',fontSize:'0.6rem',color:mod>=0?'#34D399':'#EF4444',marginTop:'2px'}}>{mod>=0?'+':''}{mod}</p>
                          <p style={{fontFamily:'Cinzel,serif',fontSize:'0.5rem',color:'rgba(180,180,180,0.3)',marginTop:'1px',letterSpacing:'0.05em'}}>{fullNames[key]}</p>
                        </div>
                      );
                    });
                  })()}
                </div>

                {/* Curse Status Display */}
                {curseLevel > 0 && (
                  <div
                    className={`rounded-lg p-2 mb-3 border-2 ${curseLevel === 3 ? 'animate-pulse' : ''}`}
                    style={{
                      backgroundColor: 'rgba(107, 44, 145, 0.3)',
                      borderColor: curseLevel === 3 ? 'rgba(220, 38, 38, 0.8)' : 'rgba(138, 59, 181, 0.6)',
                      boxShadow: curseLevel === 3 ? VISUAL_STYLES.shadow.glow('#DC2626', 0.2) : VISUAL_STYLES.shadow.glow('#8A3BB5', 0.15)
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span style={{fontSize: '1.5rem'}}>
                          {curseLevel === 1 ? '🌑' : curseLevel === 2 ? '🌑🌑' : '☠️'}
                        </span>
                        <div>
                          <p className="font-bold text-sm uppercase" style={{color: curseLevel === 3 ? '#FF6B6B' : '#B794F4'}}>
                            {curseLevel === 1 ? 'CURSED' : curseLevel === 2 ? 'DEEPLY CURSED' : 'CONDEMNED'}
                          </p>
                          <p className="text-xs" style={{color: '#F5F5DC', opacity: 0.8}}>
                            Level {curseLevel}/3
                            {curseLevel === 3 && ' - One more death...'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs" style={{color: '#B794F4'}}>
                          {curseLevel === 1 ? '75% XP' : curseLevel === 2 ? '50% XP' : '25% XP'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}



                {/* Collapse Button - Centered at bottom */}
                <div className="flex justify-center mt-4">
                  <button
                    onClick={() => { sounds.click(); setHeroCardCollapsed(!heroCardCollapsed); }}
                    className="px-3 py-1 rounded transition-all border-2 hover:scale-105"
                    style={{
                      background: 'rgba(0, 0, 0, 0.5)',
                      borderColor: 'rgba(212, 175, 55, 0.4)',
                      color: '#D4AF37',
                      fontSize: '0.7rem',
                      letterSpacing: '0.1em'
                    }}
                  >
                    ▲ Collapse
                  </button>
                </div>
              </div>
              </>
              )}
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
            </div>
  );
};

export default QuestTab;
