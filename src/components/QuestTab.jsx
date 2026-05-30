import React from 'react';
import { Calendar, GripVertical, HeartPulse, Plus, ShieldCheck, Sparkles, Swords } from 'lucide-react';
import { COLORS, VISUAL_STYLES, GAME_CONSTANTS } from '../constants';

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
  hasStarted,
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
  canCustomize,
  setShowCustomizeModal,
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
  // Tasks
  tasks,
  setTasks,
  showModal,
  setShowModal,
  newTask,
  setNewTask,
  activeTask,
  setActiveTask,
  timer,
  setTimer,
  running,
  setRunning,
  overdueTask,
  hideCompletedTasks,
  setHideCompletedTasks,
  draggedTask,
  setDraggedTask,
  // Task actions
  complete,
  handleDragStart,
  handleDragEnd,
  handleDragOver,
  handleDrop,
  // Pomodoro
  setShowPomodoro,
  setPomodoroTask,
  setPomodoroTimer,
  setPomodoroRunning,
  setIsBreak,
  setPomodorosCompleted,
  // Combat
  start,
  miniBoss,
  finalBoss,
  // Modal triggers
  setSuppliesTab,
  setShowInventoryModal,
  setShowCraftingModal,
  setShowImportModal,
  // Battle log
  log,
  // Study stats
  studyStats,
  // Helpers
  addLog,
}) => {
  return (
            <div className="space-y-4">
            <div className="rounded-xl p-4 max-w-2xl mx-auto relative overflow-hidden" style={{
              background: (() => {
                const colorMap = {
                  red: '#3D0A0A',      // Warrior - Deep crimson red (darker, richer)
                  blue: '#1E2A5A',     // Mage - Brighter deep blue (more vibrant)
                  green: '#1A2A3A',    // Rogue - Deep indigo/midnight blue (stealth, shadows)
                  white: '#4A4A4A',    // Crusader - Lighter gray (for more contrast with white)
                  purple: '#2A1A3D',   // Legacy purple
                  yellow: '#3D3A1F',   // Legacy yellow
                  amber: '#1E3A2E'     // Ranger - Forest green (nature theme)
                };
                return colorMap[hero.class.color] || colorMap.yellow;
              })(),
              border: (() => { const m={red:'rgba(180,30,30,0.5)',blue:'rgba(59,130,246,0.4)',green:'rgba(30,80,140,0.4)',white:'rgba(200,200,200,0.35)',purple:'rgba(139,92,246,0.4)',yellow:'rgba(212,175,55,0.4)',amber:'rgba(34,197,94,0.4)'}; return '2px solid '+(m[hero.class.color]||m.yellow); })(),
              boxShadow: (() => { const m={red:'rgba(180,30,30,0.25)',blue:'rgba(59,130,246,0.2)',green:'rgba(30,80,140,0.2)',white:'rgba(200,200,200,0.15)',purple:'rgba(139,92,246,0.2)',yellow:'rgba(212,175,55,0.2)',amber:'rgba(34,197,94,0.2)'}; const g=m[hero.class.color]||m.yellow; return '0 4px 30px '+g+', 0 0 60px '+g+', inset 0 0 50px rgba(0,0,0,0.4)'; })()
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
                        <h3 className="font-black uppercase" style={{fontFamily:'Cinzel,serif',fontSize:'clamp(1.4rem,4vw,1.9rem)',letterSpacing:'0.06em',color:'#F5F5DC',textShadow:(()=>{const m={red:'rgba(220,50,50,0.5)',blue:'rgba(96,165,250,0.5)',green:'rgba(59,130,246,0.5)',white:'rgba(220,220,220,0.4)',purple:'rgba(167,139,250,0.5)',yellow:'rgba(212,175,55,0.5)',amber:'rgba(34,197,94,0.5)'};return '0 0 20px '+(m[hero.class.color]||m.yellow);})()}}>{hero.name}</h3>
                        <p className="text-xs uppercase tracking-widest mt-0.5" style={{color:'rgba(245,245,220,0.45)',fontFamily:'Cinzel,serif'}}>{hero.title} {hero.class.name}</p>
                      </div>
                      <div className="text-right">
                        <div className="px-3 py-1 rounded border" style={{background:'rgba(0,0,0,0.5)',borderColor:'rgba(212,175,55,0.4)'}}>
                          <span className="text-xs font-bold" style={{color:'#D4AF37',letterSpacing:'0.1em',fontFamily:'Cinzel,serif'}}>LVL {level}</span>
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

                    <button onClick={() => setHeroCardCollapsed(false)} className="w-full py-1.5 rounded text-xs uppercase tracking-widest transition-all hover:opacity-80" style={{background:'rgba(0,0,0,0.4)',border:'1px solid rgba(212,175,55,0.25)',color:'rgba(212,175,55,0.6)',fontFamily:'Cinzel,serif'}}>
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
                <span className="text-xs font-bold" style={{color:'rgba(212,175,55,0.7)',letterSpacing:'0.1em',fontFamily:'Cinzel,serif'}}>LVL {level}</span>
              </div>

              <div className="relative z-10">
                {/* Hero name — cinematic */}
                <div className="text-center mb-4 pt-7">
                  <h2 className="font-black uppercase" style={{fontFamily:'Cinzel,serif',fontSize:'clamp(2rem,5vw,3.2rem)',letterSpacing:'0.1em',lineHeight:1.1,color:'#F5F5DC',textShadow:(()=>{const m={red:'rgba(220,50,50,0.7)',blue:'rgba(96,165,250,0.7)',green:'rgba(59,130,246,0.7)',white:'rgba(220,220,220,0.6)',purple:'rgba(167,139,250,0.7)',yellow:'rgba(212,175,55,0.7)',amber:'rgba(34,197,94,0.7)'};const c=m[hero.class.color]||m.yellow;return `0 0 30px ${c}, 0 0 60px ${c.replace('0.7','0.3')}, 0 2px 0 rgba(0,0,0,0.9)`;})()}}>{hero.name}</h2>
                  <p className="text-xs uppercase tracking-[0.35em] mt-1.5" style={{color:'rgba(245,245,220,0.45)',fontFamily:'Cinzel,serif'}}>{hero.title} {hero.class.name}</p>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    {(()=>{const m={red:'rgba(220,50,50,0.5)',blue:'rgba(96,165,250,0.5)',green:'rgba(59,130,246,0.5)',white:'rgba(200,200,200,0.4)',purple:'rgba(167,139,250,0.5)',yellow:'rgba(212,175,55,0.5)',amber:'rgba(34,197,94,0.5)'};const c=m[hero.class.color]||m.yellow;return(<><div style={{width:'60px',height:'1px',background:`linear-gradient(to right,transparent,${c})`}}></div><span style={{color:c,fontSize:'8px'}}>◆</span><div style={{width:'60px',height:'1px',background:`linear-gradient(to left,transparent,${c})`}}></div></>);})()}
                  </div>
                </div>

                {/* Experience bar */}
                <div className="mb-3 rounded-lg p-2" style={{backgroundColor: 'rgba(0, 0, 0, 0.35)', border: '2px solid rgba(0, 0, 0, 0.3)'}}>
                  <div className="flex justify-between text-sm mb-1" style={{color: '#D4AF37'}}>
                    <span className="font-bold uppercase tracking-wide">Experience</span>
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
                          green: 'linear-gradient(90deg, #1E3A5F 0%, #3B82F6 100%)',         // Rogue - dark indigo to blue (stealth theme)
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
                  <div style={{flex: '1', height: '1px', background: 'rgba(245, 245, 220, 0.3)'}}></div>
                  <p className="text-xs uppercase tracking-wider whitespace-nowrap" style={{color: 'rgba(245, 245, 220, 0.5)'}}>Combat Stats</p>
                  <div style={{flex: '1', height: '1px', background: 'rgba(245, 245, 220, 0.3)'}}></div>
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
                  <div className="rounded-lg p-3 text-center" style={{background:'rgba(0,0,0,0.4)',border:'1px solid rgba(180,100,0,0.4)',boxShadow:'inset 0 2px 6px rgba(0,0,0,0.4)'}}>
                    <Swords size={18} style={{color:'#F59E0B',margin:'0 auto 6px'}}/>
                    <p className="text-2xl font-black" style={{color:'#F5F5DC',fontFamily:'Cinzel,serif',lineHeight:1}}>{getBaseAttack()}</p>
                    <p className="text-xs uppercase tracking-widest mt-1" style={{color:'rgba(245,245,220,0.45)'}}>Attack</p>
                  </div>

                  {/* Defense */}
                  <div className="rounded-lg p-3 text-center" style={{background:'rgba(0,0,0,0.4)',border:'1px solid rgba(100,120,160,0.4)',boxShadow:'inset 0 2px 6px rgba(0,0,0,0.4)'}}>
                    <ShieldCheck size={18} style={{color:'#94A3B8',margin:'0 auto 6px'}}/>
                    <p className="text-2xl font-black" style={{color:'#F5F5DC',fontFamily:'Cinzel,serif',lineHeight:1}}>{Math.floor((getBaseDefense() / (getBaseDefense() + 50)) * 100)}%</p>
                    <p className="text-xs uppercase tracking-widest mt-1" style={{color:'rgba(245,245,220,0.45)'}}>Defense</p>
                  </div>
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

                {/* Customize button */}
                {canCustomize && (
                  <div className="mb-3">
                    <button
                      onClick={() => setShowCustomizeModal(true)}
                      className="w-full py-2 rounded-lg transition-all duration-300 font-bold uppercase text-sm transform"
                      style={{backgroundColor: 'rgba(184, 134, 11, 0.6)', border: '2px solid #B8860B', color: '#F5F5DC'}}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(184, 134, 11, 0.8)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(184, 134, 11, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(184, 134, 11, 0.6)';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      ✦ Customize Your Hero
                    </button>
                  </div>
                )}

                {/* Decorative divider with text */}
                <div className="flex items-center justify-center gap-3 mb-4 mt-4">
                  <div style={{flex: '1', height: '1px', background: 'rgba(245, 245, 220, 0.3)'}}></div>
                  <p className="text-xs uppercase tracking-wider whitespace-nowrap" style={{color: 'rgba(245, 245, 220, 0.5)'}}>Equipment</p>
                  <div style={{flex: '1', height: '1px', background: 'rgba(245, 245, 220, 0.3)'}}></div>
                </div>

                {/* Supplies and Merchant buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setSuppliesTab('potions');
                      setShowInventoryModal(true);
                    }}
                    className="py-2 rounded-lg transition-all duration-300 font-bold uppercase text-sm transform"
                    style={{backgroundColor: 'rgba(139, 0, 0, 0.7)', border: '2px solid #8B0000', color: '#F5F5DC'}}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(139, 0, 0, 0.9)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(139, 0, 0, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(139, 0, 0, 0.7)';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    Supplies
                  </button>
                  <button
                    onClick={() => setShowCraftingModal(true)}
                    className="py-2 rounded-lg transition-all duration-300 font-bold uppercase text-sm transform"
                    style={{backgroundColor: 'rgba(120, 53, 15, 0.7)', border: '2px solid #92400E', color: '#F5F5DC'}}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(120, 53, 15, 0.9)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(120, 53, 15, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(120, 53, 15, 0.7)';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    Merchant
                  </button>
                </div>

                {/* Collapse Button - Centered at bottom */}
                <div className="flex justify-center mt-4">
                  <button
                    onClick={() => setHeroCardCollapsed(!heroCardCollapsed)}
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
              {!hasStarted ? (
                <div className="rounded-xl p-8 text-center" style={{
                  background: 'linear-gradient(to bottom, rgba(42, 36, 28, 0.97), rgba(26, 22, 18, 0.97))',
                  borderColor: '#D4AF37',
                  borderWidth: '2px',
                  borderStyle: 'solid',
                  boxShadow: '0 0 30px rgba(212, 175, 55, 0.3), inset 0 0 60px rgba(212, 175, 55, 0.1)'
                }}>

                  {/* Decorative divider above */}
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <div style={{width: '80px', height: '1px', background: 'linear-gradient(to right, transparent, rgba(212, 175, 55, 0.5))'}}></div>
                    <span style={{color: 'rgba(212, 175, 55, 0.6)', fontSize: '8px'}}>◆</span>
                    <div style={{width: '80px', height: '1px', background: 'linear-gradient(to left, transparent, rgba(212, 175, 55, 0.5))'}}></div>
                  </div>

                  {/* Date Section */}
                  <h2 className="text-3xl font-bold mb-2 uppercase" style={{
                    color: '#D4AF37',
                    fontFamily: 'Cinzel, serif',
                    letterSpacing: '0.15em',
                    textShadow: '0 0 8px rgba(212, 175, 55, 0.6)'
                  }}>
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </h2>
                  <p className="text-base mb-2" style={{color: 'rgba(156, 163, 175, 0.8)'}}>
                    {new Date().toLocaleDateString('en-US', { year: 'numeric' })}
                  </p>

                  {/* Decorative divider */}
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <div style={{width: '60px', height: '1px', background: 'linear-gradient(to right, transparent, rgba(212, 175, 55, 0.5))'}}></div>
                    <span style={{color: 'rgba(212, 175, 55, 0.6)', fontSize: '8px'}}>◆</span>
                    <div style={{width: '60px', height: '1px', background: 'linear-gradient(to left, transparent, rgba(212, 175, 55, 0.5))'}}></div>
                  </div>

                  <p className="text-sm italic mb-3" style={{color: '#FF6B6B'}}>BEGIN YOUR TRIALS</p>
                  <p className="text-xs italic mb-6" style={{color: '#DAA520'}}>
                    "{GAME_CONSTANTS.DAY_NAMES[currentDay].theme}"
                  </p>

                  <button
                    onClick={start}
                    className="px-8 py-3 rounded-lg font-bold text-xl transition-all"
                    style={{
                      backgroundColor: COLORS.gold,
                      color: COLORS.obsidian.base,
                      boxShadow: '0 4px 12px rgba(212, 175, 55, 0.4)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#FFD700';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 16px rgba(212, 175, 55, 0.5)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = COLORS.gold;
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(212, 175, 55, 0.4)';
                    }}
                  >START DAY</button>

                  {/* Decorative divider below */}
                  <div className="flex items-center justify-center gap-2 mt-6">
                    <div style={{width: '80px', height: '1px', background: 'linear-gradient(to right, transparent, rgba(212, 175, 55, 0.5))'}}></div>
                    <span style={{color: 'rgba(212, 175, 55, 0.6)', fontSize: '8px'}}>◆</span>
                    <div style={{width: '80px', height: '1px', background: 'linear-gradient(to left, transparent, rgba(212, 175, 55, 0.5))'}}></div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="bg-black bg-opacity-50 rounded-xl p-6 border-2" style={{borderColor: 'rgba(212, 175, 55, 0.6)'}}>
                    {/* Section header with decorative divider */}
                    <div className="text-center mb-4">
                      <h2 className="text-4xl font-bold mb-4" style={{color: COLORS.gold, letterSpacing: '0.15em'}}>TRIALS OF THE CURSED</h2>
                      <div className="flex items-center justify-center gap-2">
                        <div style={VISUAL_STYLES.divider.gold('80px').left}></div>
                        <span style={VISUAL_STYLES.divider.gold().diamond}>◆</span>
                        <div style={VISUAL_STYLES.divider.gold('80px').right}></div>
                      </div>
                    </div>
                    {tasks.length > 0 && (

                      <p className="text-sm mb-6 italic text-center" style={{color: COLORS.silver}}>"Complete your trials or be consumed by the curse..."</p>
                    )}
                    <div className="flex gap-3 justify-center mb-6">
                      <button
                        onClick={() => setShowImportModal(true)}
                        className="flex items-center gap-2 px-8 py-3 rounded-lg transition-all border-2 uppercase text-sm font-bold"
                        style={{backgroundColor: 'rgba(120, 53, 15, 0.6)', borderColor: '#92400E', color: '#F5F5DC'}}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(120, 53, 15, 0.8)';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(120, 53, 15, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(120, 53, 15, 0.6)';
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '';
                        }}
                      >
                        <Calendar size={18}/>Import from Planner
                      </button>
                      <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 px-8 py-3 rounded-lg transition-all border-2 uppercase text-sm font-bold"
                        style={{backgroundColor: COLORS.amber.base, borderColor: COLORS.amber.border, color: '#1C1C1C'}}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(234, 179, 8, 0.9)';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(234, 179, 8, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = COLORS.amber.base;
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '';
                        }}
                      >
                        <Plus size={18}/>Accept Trial
                      </button>
                    </div>

                    {tasks.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-base font-semibold tracking-wide" style={{color: '#F5F5DC', letterSpacing: '0.08em'}}>Your journey begins here.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {[...tasks].sort((a, b) => {
  // Incomplete tasks first, completed tasks last
  if (!a.done && b.done) return -1;
  if (a.done && !b.done) return 1;

  // Among incomplete tasks: overdue first, then important, then routine
  if (!a.done && !b.done) {
    // Overdue tasks always come first
    if (a.overdue && !b.overdue) return -1;
    if (!a.overdue && b.overdue) return 1;

    // If both overdue or both not overdue, sort by priority
    if (a.priority === 'important' && b.priority !== 'important') return -1;
    if (a.priority !== 'important' && b.priority === 'important') return 1;
  }
  return 0;
})
.filter(task => !hideCompletedTasks || !task.done)
.map(t => (
  <div key={t.id} className={`rounded-lg p-4 border-2 ${
    t.done
      ? 'opacity-60'
      : t.overdue
        ? 'bg-red-900/20 border-red-600 opacity-80'
      : t.priority === 'important'
        ? `bg-gradient-to-r from-yellow-900/30 to-gray-800`
        : 'bg-gradient-to-r from-blue-900/30 to-gray-800 border-blue-500'
  }`}
  style={{
    backgroundColor: t.done
      ? 'rgba(30, 41, 59, 0.4)'
      : t.overdue
        ? undefined
        : t.priority === 'important'
          ? undefined
          : undefined,
    borderColor: t.done
      ? 'rgba(34, 197, 94, 0.6)'
      : t.overdue
        ? undefined
        : t.priority === 'important'
          ? COLORS.gold
          : 'rgba(59, 130, 246, 0.5)',
    position: 'relative',
    overflow: 'hidden',
    animation: t.overdue && !t.done
      ? 'pulse-red-border 2s ease-in-out infinite'
      : undefined,
    boxShadow: t.priority === 'important' && !t.done && !t.overdue
      ? `0 0 20px ${COLORS.gold}99`
      : t.done
        ? '0 1px 3px rgba(0, 0, 0, 0.1)'
        : '0 2px 4px rgba(0, 0, 0, 0.2)'
  }}
  draggable={!t.done}
  onDragStart={(e) => handleDragStart(e, t)}
  onDragEnd={handleDragEnd}
  onDragOver={handleDragOver}
  onDrop={(e) => handleDrop(e, t)}
  >
    {/* OVERDUE watermark - centered from left edge to Focus button */}
    {t.overdue && !t.done && (
      <div className="absolute left-0 inset-y-0 flex items-center pointer-events-none" style={{zIndex: 0, right: '180px', justifyContent: 'center'}}>
        <span style={{
          fontSize: '3rem',
          fontWeight: 900,
          color: '#DC2626',
          opacity: 0.08,
          letterSpacing: '0.2em'
        }}>OVERDUE</span>
      </div>
    )}
    {/* COMPLETED watermark - centered horizontally */}
    {t.done && (
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{zIndex: 0}}>
        <span style={{
          fontSize: '3rem',
          fontWeight: 900,
          color: '#22C55E',
          opacity: 0.15,
          letterSpacing: '0.2em'
        }}>COMPLETED</span>
      </div>
    )}
    <div className="flex items-center gap-3" style={{position: 'relative', zIndex: 1}}>
      {!t.done && (
        <div style={{opacity: 0.3, cursor: 'grab'}} onMouseEnter={(e) => e.currentTarget.style.opacity = 0.7} onMouseLeave={(e) => e.currentTarget.style.opacity = 0.3}>
          <GripVertical size={20} style={{color: '#C0C0C0'}}/>
        </div>
      )}
      <div className="flex-1">
        <p className={t.done ? 'line-through text-gray-500' : t.overdue ? 'text-red-300 font-medium text-lg' : 'text-white font-medium text-lg'}>
          {t.title}
        </p>
        <p className="text-sm mt-1" style={{color: t.priority === 'important' ? COLORS.gold : '#9CA3AF'}}>
          {t.priority === 'important' ? 'IMPORTANT • 1.25x XP' : 'ROUTINE • 1.0x XP'}
        </p>
      </div>

      {!t.done && (
        <div className="flex gap-2">
          <button
            onClick={() => {
              setPomodoroTask(t);
              setShowPomodoro(true);
              setPomodoroTimer(25 * 60);
              setPomodorosCompleted(0);
              setIsBreak(false);
              setPomodoroRunning(true);
              addLog(`Starting focus session: ${t.title}`);
            }}
            className="px-3 py-1 rounded transition-all flex items-center gap-1 border-2" style={{backgroundColor: COLORS.amethyst.base, borderColor: COLORS.amethyst.border, color: '#F5F5DC'}} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.amethyst.hover} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = COLORS.amethyst.base}
          >
            Focus
          </button>
          <button
            onClick={() => complete(t.id)}
            className="px-3 py-1 rounded font-bold transition-all flex items-center gap-1 border-2" style={{backgroundColor: COLORS.emerald.base, borderColor: COLORS.emerald.border, color: '#F5F5DC'}} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.emerald.hover} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = COLORS.emerald.base}
          >
            Complete
          </button>
        </div>
      )}
    </div>
  </div>
))}
                      </div>
                    )}

                    {/* Hide completed tasks toggle - at bottom */}
                    {tasks.length > 0 && tasks.some(t => t.done) && (
                      <div className="flex items-center justify-center gap-2 py-3 mt-4">
                        <input
                          type="checkbox"
                          id="hideCompleted"
                          checked={hideCompletedTasks}
                          onChange={(e) => setHideCompletedTasks(e.target.checked)}
                          className="w-4 h-4 cursor-pointer"
                          style={{accentColor: '#D4AF37'}}
                        />
                        <label
                          htmlFor="hideCompleted"
                          className="text-sm cursor-pointer"
                          style={{color: '#C0C0C0'}}
                        >
                          Hide completed tasks
                        </label>
                      </div>
                    )}
                  </div>

                  {/* Elite Boss Warning - State Machine with Emotional Feedback */}
                  {isDayActive && !eliteBossDefeatedToday && (() => {
                    const currentHour = new Date().getHours();
                    const hasEnoughXP = xp >= 200;

                    let state;

                    // Use debug state if set, otherwise calculate normally
                    if (debugWarningState) {
                      state = debugWarningState;
                    } else {
                      if (!hasEnoughXP) {
                        state = 'locked'; // Progress phase
                      } else if (currentHour < 18) {
                        state = 'unlocked'; // Confrontation available
                      } else if (currentHour >= 18 && currentHour < 22) {
                        state = 'evening'; // Temporal urgency begins
                      } else {
                        state = 'finalhour'; // Critical window
                      }
                    }

                    const stateConfig = {
                      locked: {
                        bg: 'rgba(0, 0, 0, 0.5)',
                        border: 'rgba(212, 175, 55, 0.4)',
                        shadow: 'none',
                        textColor: '#D4AF37',
                        animate: false,
                        message: "Progress to unlock today's challenge."
                      },
                      unlocked: {
                        bg: 'rgba(0, 0, 0, 0.5)',
                        border: 'rgba(184, 134, 11, 0.5)',
                        shadow: '0 0 8px rgba(184, 134, 11, 0.2)',
                        textColor: '#DAA520',
                        animate: false,
                        message: 'The darkness awaits.'
                      },
                      evening: {
                        bg: 'rgba(0, 0, 0, 0.5)',
                        border: 'rgba(212, 175, 55, 0.6)',
                        shadow: '0 0 10px rgba(212, 175, 55, 0.15)',
                        textColor: '#EF4444',
                        animate: false,
                        message: 'Midnight approaches. The curse stirs.'
                      },
                      finalhour: {
                        bg: 'rgba(139, 0, 0, 0.3)',
                        border: 'rgba(220, 38, 38, 0.8)',
                        shadow: '0 0 20px rgba(220, 38, 38, 0.4)',
                        textColor: '#FF6B6B',
                        animate: true,
                        message: 'Final hour. Defeat the Darkness.'
                      }
                    };

                    const config = stateConfig[state];

                    if (!config) return null;

                    return (
                      <div
                        className={`rounded-lg p-4 mb-4 border-2 ${config.animate ? 'animate-pulse' : ''}`}
                        style={{
                          backgroundColor: config.bg,
                          borderColor: config.border,
                          boxShadow: config.shadow
                        }}
                      >
                        <div className="text-center">
                          <p className="font-bold text-sm" style={{color: config.textColor}}>
                            {config.message}
                          </p>
                        </div>
                      </div>
                    );
                  })()}

                  <div className="grid md:grid-cols-2 gap-4 mt-6">
                    <button
  onClick={miniBoss}
  disabled={!isDayActive || eliteBossDefeatedToday || xp < 150}
  className="px-8 py-6 rounded-xl font-bold text-xl transition-all border-2 disabled:cursor-not-allowed uppercase" style={{backgroundColor: (!isDayActive || eliteBossDefeatedToday || xp < 150) ? 'rgba(30, 41, 59, 0.5)' : 'rgba(30, 41, 59, 0.8)', borderColor: (!isDayActive || eliteBossDefeatedToday || xp < 150) ? 'rgba(71, 85, 105, 0.5)' : 'rgba(71, 85, 105, 0.8)', color: '#F5F5DC', opacity: (!isDayActive || eliteBossDefeatedToday || xp < 150) ? 0.5 : 1}} onMouseEnter={(e) => {if (isDayActive && !eliteBossDefeatedToday && xp >= 150) e.currentTarget.style.backgroundColor = 'rgba(51, 65, 85, 0.9)'}} onMouseLeave={(e) => {if (isDayActive && !eliteBossDefeatedToday && xp >= 150) e.currentTarget.style.backgroundColor = 'rgba(30, 41, 59, 0.8)'}}
>
  <div className="text-center">
    <div className="mb-2">FACE THE DARKNESS</div>
    {!isDayActive ? (
      <div className="text-xs font-normal uppercase" style={{color: '#9CA3AF'}}>Day dormant — add tasks to begin</div>
    ) : eliteBossDefeatedToday ? (
      <div className="text-xs font-normal uppercase" style={{color: '#4ADE80'}}>✓ Today's trial complete</div>
    ) : (
      <div className="text-xs font-normal uppercase" style={{color: xp >= 150 ? '#4ADE80' : '#FBBF24'}}>
        {xp >= 150 ? `Ready • 150 XP` : `${150 - xp} XP needed`}
      </div>
    )}
  </div>
</button>
                    <button
  onClick={finalBoss}
  disabled={!gauntletUnlocked || tasks.length === 0 || tasks.filter(t => t.done).length < tasks.length}
  className="px-8 py-6 rounded-xl font-bold text-xl transition-all border-2 disabled:cursor-not-allowed uppercase" style={{backgroundColor: (!gauntletUnlocked || tasks.length === 0 || tasks.filter(t => t.done).length < tasks.length) ? 'rgba(30, 41, 59, 0.5)' : 'rgba(30, 41, 59, 0.8)', borderColor: (!gauntletUnlocked || tasks.length === 0 || tasks.filter(t => t.done).length < tasks.length) ? 'rgba(71, 85, 105, 0.5)' : 'rgba(71, 85, 105, 0.8)', color: '#F5F5DC', opacity: (!gauntletUnlocked || tasks.length === 0 || tasks.filter(t => t.done).length < tasks.length) ? 0.5 : 1}} onMouseEnter={(e) => {if (gauntletUnlocked && tasks.length > 0 && tasks.filter(t => t.done).length >= tasks.length) e.currentTarget.style.backgroundColor = 'rgba(51, 65, 85, 0.9)'}} onMouseLeave={(e) => {if (gauntletUnlocked && tasks.length > 0 && tasks.filter(t => t.done).length >= tasks.length) e.currentTarget.style.backgroundColor = 'rgba(30, 41, 59, 0.8)'}}
>
  <div className="text-center">
    <div className="mb-2">THE GAUNTLET</div>
    {!gauntletUnlocked && (
      <div className="text-xs font-normal uppercase" style={{color: '#9CA3AF'}}>{gauntletMilestone - xp} XP needed</div>
    )}
  </div>
</button>
                  </div>

                  <div className="bg-black bg-opacity-50 rounded-xl p-4 border border-gray-800">
                    {/* Section header with decorative divider */}
                    <div className="text-center mb-4">
                      <h3 className="text-lg font-bold mb-2" style={{color: '#D4AF37', letterSpacing: '0.15em'}}>CHRONICLE OF EVENTS</h3>
                      <div className="flex items-center justify-center gap-2">
                        <div style={{width: '60px', height: '1px', background: 'linear-gradient(to right, transparent, rgba(212, 175, 55, 0.5))'}}></div>
                        <span style={{color: 'rgba(212, 175, 55, 0.6)', fontSize: '8px'}}>◆</span>
                        <div style={{width: '60px', height: '1px', background: 'linear-gradient(to left, transparent, rgba(212, 175, 55, 0.5))'}}></div>
                      </div>
                    </div>
                    {log.length === 0 ? (<p className="text-sm text-gray-500 italic text-center">The journey begins...</p>) : (<div className="space-y-1">{log.map((l, i) => (<p key={i} className="text-sm text-gray-300">{l}</p>))}</div>)}
                  </div>
                </>
              )}
            </div>
  );
};

export default QuestTab;
