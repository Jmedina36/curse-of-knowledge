import React from 'react';
import { Calendar, GripVertical, Plus } from 'lucide-react';
import { COLORS, VISUAL_STYLES, GAME_CONSTANTS } from '../constants';
import { sounds } from '../sounds';

const TIER = {
  copper:   { label: 'Copper',   color: '#CD7F32', glow: 'rgba(205,127,50,0.5)',  border: 'rgba(205,127,50,0.4)',  bg: 'rgba(50,25,8,0.6)'   },
  silver:   { label: 'Silver',   color: '#C8C8C8', glow: 'rgba(200,200,200,0.4)', border: 'rgba(200,200,200,0.35)',bg: 'rgba(35,35,38,0.6)'  },
  gold:     { label: 'Gold',     color: '#D4AF37', glow: 'rgba(212,175,55,0.5)',  border: 'rgba(212,175,55,0.5)',  bg: 'rgba(40,30,0,0.6)'   },
  platinum: { label: 'Platinum', color: '#E8E8E8', glow: 'rgba(232,232,232,0.35)',border: 'rgba(220,220,220,0.4)', bg: 'rgba(20,20,28,0.7)'  },
  mythril:  { label: 'Mythril',  color: '#7DF9FF', glow: 'rgba(125,249,255,0.45)',border: 'rgba(125,249,255,0.4)', bg: 'rgba(0,18,22,0.85)'  },
};

const TierDivider = ({ tier, label }) => (
  <div className="flex items-center gap-3 my-5">
    <div style={{ flex: 1, height: '1px', background: `linear-gradient(to right, transparent, ${TIER[tier].border})` }} />
    <span style={{
      fontFamily: 'Cinzel, serif', fontSize: '0.72rem', letterSpacing: '0.4em',
      textTransform: 'uppercase', color: TIER[tier].color, opacity: 0.75,
      whiteSpace: 'nowrap',
    }}>
      {label || TIER[tier].label}
    </span>
    <div style={{ flex: 1, height: '1px', background: `linear-gradient(to left, transparent, ${TIER[tier].border})` }} />
  </div>
);

const ContractsTab = ({
  hasStarted,
  isDayActive,
  currentDay,
  xp,
  level,
  eliteBossDefeatedToday,
  debugWarningState,
  gauntletUnlocked,
  gauntletMilestone,
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
  complete,
  handleDragStart,
  handleDragEnd,
  handleDragOver,
  handleDrop,
  setShowPomodoro,
  setPomodoroTask,
  setPomodoroTimer,
  setPomodoroRunning,
  setIsBreak,
  setPomodorosCompleted,
  start,
  miniBoss,
  finalBoss,
  setShowImportModal,
  log,
  addLog,
  onRaid,
  banditWaveNumber,
  banditCaptainsDefeated,
  onDaughtersRaid,
  daughtersWaveNumber,
  daughtersCaptainsDefeated,
  guildPoints,
  guildRank,
  guildRanks,
}) => {
  return (
    <div className="space-y-4">
      {!hasStarted ? (
        <div
          className="rounded-xl p-8 text-center"
          style={{
            background: 'linear-gradient(to bottom, rgba(42, 36, 28, 0.97), rgba(26, 22, 18, 0.97))',
            borderColor: '#D4AF37', borderWidth: '2px', borderStyle: 'solid',
            boxShadow: '0 0 30px rgba(212, 175, 55, 0.3), inset 0 0 60px rgba(212, 175, 55, 0.1)'
          }}>
          <h1 style={{
            fontFamily: 'Cinzel, serif', fontSize: 'clamp(1.8rem, 5vw, 3.2rem)', fontWeight: 900,
            letterSpacing: '0.18em', textTransform: 'uppercase', color: '#D4AF37',
            textShadow: '0 0 28px rgba(212,175,55,0.85), 0 0 60px rgba(212,175,55,0.3)', marginBottom: '0.3rem',
          }}>Curse of Knowledge</h1>
          <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.6rem', letterSpacing: '0.5em', textTransform: 'uppercase', color: 'rgba(245,245,220,0.35)', marginBottom: '1.5rem' }}>A Fantasy Study Quest</p>
          <div className="flex items-center justify-center gap-2 mb-4">
            <div style={{width:'80px',height:'1px',background:'linear-gradient(to right,transparent,rgba(212,175,55,0.5))'}}/>
            <span style={{color:'rgba(212,175,55,0.6)',fontSize:'8px'}}>◆</span>
            <div style={{width:'80px',height:'1px',background:'linear-gradient(to left,transparent,rgba(212,175,55,0.5))'}}/>
          </div>
          <h2 className="text-3xl font-bold mb-2 uppercase" style={{ color: '#D4AF37', fontFamily: 'Cinzel, serif', letterSpacing: '0.15em', textShadow: '0 0 8px rgba(212,175,55,0.6)' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </h2>
          <p className="text-base mb-2" style={{color: 'rgba(156,163,175,0.8)'}}>
            {new Date().toLocaleDateString('en-US', { year: 'numeric' })}
          </p>
          <div className="flex items-center justify-center gap-2 mb-4">
            <div style={{width:'60px',height:'1px',background:'linear-gradient(to right,transparent,rgba(212,175,55,0.5))'}}/>
            <span style={{color:'rgba(212,175,55,0.6)',fontSize:'8px'}}>◆</span>
            <div style={{width:'60px',height:'1px',background:'linear-gradient(to left,transparent,rgba(212,175,55,0.5))'}}/>
          </div>
          <p className="text-sm italic mb-3" style={{color: '#FF6B6B'}}>BEGIN YOUR TRIALS</p>
          <p className="text-xs italic mb-6" style={{color: '#DAA520'}}>"{GAME_CONSTANTS.DAY_NAMES[currentDay].theme}"</p>
          <button
            onClick={() => { sounds.click(); start(); }}
            className="px-8 py-3 rounded-lg font-bold text-xl transition-all"
            style={{ backgroundColor: COLORS.gold, color: COLORS.obsidian.base, boxShadow: '0 4px 12px rgba(212,175,55,0.4)' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#FFD700'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(212,175,55,0.5)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = COLORS.gold; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(212,175,55,0.4)'; }}
          >START DAY</button>
          <div className="flex items-center justify-center gap-2 mt-6">
            <div style={{width:'80px',height:'1px',background:'linear-gradient(to right,transparent,rgba(212,175,55,0.5))'}}/>
            <span style={{color:'rgba(212,175,55,0.6)',fontSize:'8px'}}>◆</span>
            <div style={{width:'80px',height:'1px',background:'linear-gradient(to left,transparent,rgba(212,175,55,0.5))'}}/>
          </div>
        </div>
      ) : (
        <>
          {/* ── BOARD SHELL ── */}
          <div className="rounded-xl p-5 border-2" style={{
            background: 'linear-gradient(rgba(6,4,1,0.62), rgba(6,4,1,0.62)), url("/Updated scroll.png")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            borderColor: 'rgba(101,67,33,0.7)',
            boxShadow: '0 4px 32px rgba(0,0,0,0.6)',
          }}>

            {/* Board header */}
            <div className="text-center mb-5">
              {/* Guild rank badge */}
              {guildRank && (() => {
                const nextRank = guildRanks && guildRanks.find(r => r.min > guildPoints);
                const pct = nextRank ? Math.min(100, ((guildPoints - guildRank.min) / (nextRank.min - guildRank.min)) * 100) : 100;
                return (
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'8px', marginBottom:'18px' }}>
                    <span style={{
                      fontFamily:'Cinzel,serif', fontSize:'0.65rem', letterSpacing:'0.4em',
                      textTransform:'uppercase', color:'rgba(210,190,150,0.6)',
                    }}>Guild Rank</span>
                    <span style={{
                      fontFamily:'Cinzel,serif', fontSize:'1.5rem', fontWeight:900, letterSpacing:'0.25em',
                      textTransform:'uppercase', color: guildRank.color,
                      textShadow: `0 0 20px ${guildRank.color}99, 0 0 40px ${guildRank.color}44`,
                    }}>{guildRank.name}</span>
                    <span style={{ fontFamily:'Cinzel,serif', fontSize:'0.72rem', letterSpacing:'0.2em', color:'rgba(210,190,150,0.75)' }}>
                      {guildPoints} Guild Points
                    </span>
                    {nextRank && (
                      <div style={{ width:'200px' }}>
                        <div style={{ width:'100%', height:'5px', borderRadius:'3px', background:'rgba(255,255,255,0.06)', overflow:'hidden' }}>
                          <div style={{
                            height:'100%', width:`${pct}%`,
                            background: `linear-gradient(to right, ${guildRank.color}77, ${guildRank.color})`,
                            borderRadius:'3px', transition:'width 0.4s ease',
                            boxShadow: `0 0 6px ${guildRank.color}88`,
                          }} />
                        </div>
                        <p style={{ fontFamily:'Cinzel,serif', fontSize:'0.62rem', letterSpacing:'0.14em', color:'rgba(210,190,150,0.7)', textAlign:'center', marginTop:'5px', textTransform:'uppercase' }}>
                          {nextRank.min - guildPoints} GP to {nextRank.name}
                        </p>
                      </div>
                    )}
                    {!nextRank && (
                      <p style={{ fontFamily:'Cinzel,serif', fontSize:'0.62rem', letterSpacing:'0.22em', color: guildRank.color, opacity:0.7, textTransform:'uppercase' }}>
                        Pinnacle of the Guild
                      </p>
                    )}
                  </div>
                );
              })()}

              {/* Tier legend */}
              <div className="flex items-center justify-center gap-3 mb-3">
                <div style={{flex:1,height:'1px',background:'linear-gradient(to right,transparent,rgba(101,67,33,0.6))'}}/>
                <span style={{color:'rgba(212,175,55,0.4)',fontSize:'8px'}}>◆</span>
                <div style={{flex:1,height:'1px',background:'linear-gradient(to left,transparent,rgba(101,67,33,0.6))'}}/>
              </div>
              <div className="flex items-center justify-center gap-5 flex-wrap">
                {['copper','silver','gold','platinum','mythril'].map(t => (
                  <span key={t} style={{ fontFamily:'Cinzel,serif', fontSize:'0.72rem', letterSpacing:'0.2em', textTransform:'uppercase', color: TIER[t].color, opacity: 0.95 }}>
                    ◆ {TIER[t].label}
                  </span>
                ))}
              </div>
              <div className="flex items-center justify-center gap-3 mt-3">
                <div style={{flex:1,height:'1px',background:'linear-gradient(to right,transparent,rgba(101,67,33,0.6))'}}/>
                <span style={{color:'rgba(212,175,55,0.4)',fontSize:'8px'}}>◆</span>
                <div style={{flex:1,height:'1px',background:'linear-gradient(to left,transparent,rgba(101,67,33,0.6))'}}/>
              </div>
            </div>

            {/* Add task controls */}
            <div className="flex gap-3 justify-center mb-5">
              <button
                onClick={() => { sounds.click(); setShowImportModal(true); }}
                className="flex items-center gap-2 px-5 py-2 rounded transition-all uppercase text-xs font-bold"
                style={{background:'rgba(60,35,10,0.7)',border:'1px solid rgba(101,67,33,0.6)',color:'rgba(200,170,100,0.8)',fontFamily:'Cinzel,serif',letterSpacing:'0.15em'}}
                onMouseEnter={(e) => { e.currentTarget.style.background='rgba(80,50,15,0.8)'; e.currentTarget.style.color='rgba(212,175,55,1)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background='rgba(60,35,10,0.7)'; e.currentTarget.style.color='rgba(200,170,100,0.8)'; }}
              >
                <Calendar size={14}/>Import from Planner
              </button>
              <button
                onClick={() => { sounds.click(); setShowModal(true); }}
                className="flex items-center gap-2 px-5 py-2 rounded transition-all uppercase text-xs font-bold"
                style={{background:'rgba(80,55,10,0.8)',border:'1px solid rgba(180,140,40,0.5)',color:'rgba(212,175,55,0.95)',fontFamily:'Cinzel,serif',letterSpacing:'0.15em'}}
                onMouseEnter={(e) => { e.currentTarget.style.background='rgba(100,70,15,0.9)'; e.currentTarget.style.borderColor='rgba(212,175,55,0.8)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background='rgba(80,55,10,0.8)'; e.currentTarget.style.borderColor='rgba(180,140,40,0.5)'; }}
              >
                <Plus size={14}/>Post Contract
              </button>
            </div>

            {/* ── COPPER / SILVER TASK CARDS ── */}
            {tasks.length === 0 ? (
              <div className="text-center py-10">
                <p style={{fontFamily:'Cinzel,serif',fontSize:'0.8rem',letterSpacing:'0.2em',color:'rgba(160,135,80,0.5)',textTransform:'uppercase'}}>The board is bare. Post a contract to begin.</p>
              </div>
            ) : (
              <>
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))',gap:'16px',padding:'4px 2px'}}>
                  {[...tasks].sort((a, b) => {
                    if (!a.done && b.done) return -1;
                    if (a.done && !b.done) return 1;
                    if (!a.done && !b.done) {
                      if (a.overdue && !b.overdue) return -1;
                      if (!a.overdue && b.overdue) return 1;
                      if (a.priority === 'important' && b.priority !== 'important') return -1;
                      if (a.priority !== 'important' && b.priority === 'important') return 1;
                    }
                    return 0;
                  })
                  .filter(task => !hideCompletedTasks || !task.done)
                  .map(t => {
                    const tier = t.done ? null : t.overdue ? null : t.priority === 'important' ? TIER.silver : TIER.copper;
                    const pinColor = t.done ? 'rgba(80,120,60,0.8)' : t.overdue ? 'rgba(180,40,30,0.9)' : t.priority === 'important' ? TIER.silver.color : TIER.copper.color;
                    return (
                      <div
                        key={t.id}
                        draggable={!t.done}
                        onDragStart={(e) => handleDragStart(e, t)}
                        onDragEnd={handleDragEnd}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, t)}
                        style={{
                          position: 'relative',
                          background: t.done
                            ? 'linear-gradient(160deg,rgba(55,55,42,0.52),rgba(42,42,35,0.52))'
                            : t.overdue
                              ? 'linear-gradient(160deg,rgba(90,22,16,0.58),rgba(65,14,10,0.58))'
                              : t.priority === 'important'
                                ? 'linear-gradient(160deg,rgba(55,55,70,0.55),rgba(42,42,55,0.55))'
                                : 'linear-gradient(160deg,rgba(65,48,18,0.55),rgba(50,38,15,0.55))',
                          border: t.done
                            ? '1px solid rgba(80,100,60,0.45)'
                            : t.overdue
                              ? '1px solid rgba(180,40,30,0.6)'
                              : t.priority === 'important'
                                ? `1px solid ${TIER.silver.border}`
                                : `1px solid ${TIER.copper.border}`,
                          borderRadius: '4px',
                          padding: '14px 14px 12px',
                          boxShadow: t.overdue && !t.done
                            ? '0 2px 16px rgba(180,30,20,0.25), inset 0 0 20px rgba(0,0,0,0.4)'
                            : t.priority === 'important' && !t.done
                              ? `0 2px 12px ${TIER.silver.glow}, inset 0 0 20px rgba(0,0,0,0.4)`
                              : !t.done
                                ? `0 2px 10px ${TIER.copper.glow}, inset 0 0 20px rgba(0,0,0,0.4)`
                                : 'inset 0 0 20px rgba(0,0,0,0.35), 0 1px 6px rgba(0,0,0,0.4)',
                          cursor: t.done ? 'default' : 'grab',
                          transition: 'transform 0.15s, box-shadow 0.15s',
                          opacity: t.done ? 0.65 : 1,
                          animation: t.overdue && !t.done ? 'pulse-red-border 2s ease-in-out infinite' : undefined,
                        }}
                      >
                        {/* Push-pin */}
                        <div style={{
                          position: 'absolute', top: '-6px', left: '50%', transform: 'translateX(-50%)',
                          width: '12px', height: '12px', borderRadius: '50%',
                          background: pinColor,
                          border: '1px solid rgba(255,255,255,0.15)',
                          boxShadow: `0 1px 5px rgba(0,0,0,0.6), 0 0 6px ${pinColor}`,
                        }} />

                        {/* Tier badge row */}
                        <div style={{marginBottom:'8px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                          <span style={{
                            fontFamily:'Cinzel,serif', fontSize:'0.75rem', letterSpacing:'0.22em',
                            textTransform:'uppercase', padding:'2px 8px', borderRadius:'2px',
                            background: t.done ? 'rgba(60,90,40,0.3)' : t.overdue ? 'rgba(140,30,20,0.4)' : t.priority === 'important' ? 'rgba(50,50,55,0.5)' : 'rgba(45,25,8,0.5)',
                            border: t.done ? '1px solid rgba(80,120,60,0.4)' : t.overdue ? '1px solid rgba(180,40,30,0.5)' : t.priority === 'important' ? `1px solid ${TIER.silver.border}` : `1px solid ${TIER.copper.border}`,
                            color: t.done ? 'rgba(150,220,110,0.95)' : t.overdue ? '#EF4444' : t.priority === 'important' ? TIER.silver.color : TIER.copper.color,
                          }}>
                            {t.done ? 'Sealed' : t.overdue ? 'Overdue' : t.priority === 'important' ? 'Silver' : 'Copper'}
                          </span>
                          {!t.done && (
                            <span style={{fontSize:'0.75rem',color:'rgba(200,175,110,0.8)',fontFamily:'Cinzel,serif'}}>
                              {t.priority === 'important' ? '1.25x XP' : '1.0x XP'}
                            </span>
                          )}
                        </div>

                        {/* Contract title */}
                        <p style={{
                          fontFamily:'Cinzel,serif', fontSize:'1.05rem', fontWeight:600,
                          letterSpacing:'0.04em', lineHeight:1.45,
                          color: t.done ? 'rgba(180,175,150,0.65)' : t.overdue ? '#FF9980' : '#F5F0E0',
                          textDecoration: t.done ? 'line-through' : 'none',
                          marginBottom:'10px', wordBreak:'break-word',
                        }}>
                          {t.title}
                        </p>

                        {/* Actions */}
                        {!t.done && (
                          <div style={{display:'flex',gap:'6px',justifyContent:'flex-end'}}>
                            <button
                              onClick={() => {
                                sounds.click();
                                setPomodoroTask(t); setShowPomodoro(true);
                                setPomodoroTimer(25 * 60); setPomodorosCompleted(0);
                                setIsBreak(false); setPomodoroRunning(true);
                                addLog(`Starting focus session: ${t.title}`);
                              }}
                              style={{
                                fontFamily:'Cinzel,serif',fontSize:'0.82rem',letterSpacing:'0.15em',
                                padding:'5px 12px',borderRadius:'2px',
                                background:'rgba(60,30,80,0.6)',border:'1px solid rgba(150,100,200,0.6)',
                                color:'rgba(210,170,255,0.95)',cursor:'pointer',transition:'all 0.2s',
                              }}
                              onMouseEnter={e=>{e.currentTarget.style.background='rgba(80,40,110,0.8)';e.currentTarget.style.color='rgba(200,170,240,1)';}}
                              onMouseLeave={e=>{e.currentTarget.style.background='rgba(60,30,80,0.6)';e.currentTarget.style.color='rgba(180,140,220,0.85)';}}
                            >Focus</button>
                            <button
                              onClick={() => { sounds.click(); complete(t.id); }}
                              style={{
                                fontFamily:'Cinzel,serif',fontSize:'0.82rem',letterSpacing:'0.15em',
                                padding:'5px 12px',borderRadius:'2px',
                                background:'rgba(20,60,30,0.6)',border:'1px solid rgba(50,160,80,0.6)',
                                color:'rgba(130,230,150,0.95)',cursor:'pointer',transition:'all 0.2s',
                              }}
                              onMouseEnter={e=>{e.currentTarget.style.background='rgba(25,80,40,0.8)';e.currentTarget.style.color='rgba(130,220,150,1)';}}
                              onMouseLeave={e=>{e.currentTarget.style.background='rgba(20,60,30,0.6)';e.currentTarget.style.color='rgba(100,200,120,0.85)';}}
                            >Complete</button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Hide completed toggle */}
                {tasks.some(t => t.done) && (
                  <div className="flex items-center justify-center gap-2 py-3 mt-4">
                    <input type="checkbox" id="hideCompleted" checked={hideCompletedTasks}
                      onChange={(e) => setHideCompletedTasks(e.target.checked)}
                      className="w-4 h-4 cursor-pointer" style={{accentColor: '#D4AF37'}} />
                    <label htmlFor="hideCompleted" className="text-sm cursor-pointer" style={{color:'#C0C0C0'}}>
                      Hide completed tasks
                    </label>
                  </div>
                )}
              </>
            )}

            {/* ── GOLD CONTRACTS ── */}
            {isDayActive && (
              <>
                <TierDivider tier="gold" label="Gold Contracts" />
                <div className="grid md:grid-cols-2 gap-4">

                  {/* Bandit Raid */}
                  {(() => {
                    const captDefeated = banditCaptainsDefeated?.length || 0;
                    const allCaptainsDown = captDefeated >= 3;
                    const nextWave = (banditWaveNumber || 0) + 1;
                    return (
                      <div className="rounded-xl border overflow-hidden" style={{
                        borderColor: TIER.gold.border,
                        background: 'linear-gradient(160deg, rgba(70,45,12,0.52) 0%, rgba(50,32,8,0.52) 100%)',
                        boxShadow: `0 4px 18px ${TIER.gold.glow.replace('0.5','0.12')}`,
                      }}>
                        <div style={{ padding: '12px 16px 8px', borderBottom: `1px solid rgba(212,175,55,0.12)` }}>
                          <div className="flex items-center justify-between mb-1">
                            <span style={{ fontFamily:'Cinzel,serif', fontSize:'0.72rem', letterSpacing:'0.35em', color: TIER.gold.color, textTransform:'uppercase', opacity:0.95 }}>
                              Gold Contract
                            </span>
                            <div style={{ display:'flex', gap:'5px' }}>
                              {[0,1,2].map(i => (
                                <div key={i} style={{
                                  width:8, height:8, borderRadius:'50%',
                                  background: i < captDefeated ? TIER.gold.color : 'rgba(212,175,55,0.12)',
                                  border: `1px solid ${i < captDefeated ? 'rgba(212,175,55,0.8)' : 'rgba(212,175,55,0.25)'}`,
                                  boxShadow: i < captDefeated ? `0 0 4px ${TIER.gold.glow}` : 'none',
                                }} />
                              ))}
                            </div>
                          </div>
                          <p style={{ fontFamily:'Cinzel,serif', fontSize:'1.15rem', fontWeight:700, color:'#F0D898', letterSpacing:'0.08em', margin:0 }}>
                            {allCaptainsDown ? 'Bandit Lord Cutter' : `Bandit Raid — Wave ${nextWave}`}
                          </p>
                          <p style={{ fontFamily:'Cinzel,serif', fontSize:'0.85rem', color:'rgba(220,195,140,0.8)', marginTop:'3px' }}>
                            {allCaptainsDown ? 'All captains fallen. Cutter awaits.' : `Captains eliminated: ${captDefeated}/3`}
                          </p>
                        </div>
                        <div style={{ padding: '10px 16px' }}>
                          <button
                            onClick={() => { sounds.click(); onRaid(nextWave, banditCaptainsDefeated || []); }}
                            style={{
                              width:'100%', padding:'8px', borderRadius:'4px', fontFamily:'Cinzel,serif',
                              fontSize:'0.78rem', fontWeight:700, letterSpacing:'0.18em', textTransform:'uppercase',
                              background: 'rgba(55,38,0,0.7)', border: `1px solid ${TIER.gold.border}`,
                              color: TIER.gold.color, cursor:'pointer', transition:'all 0.2s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background='rgba(80,55,0,0.9)'; e.currentTarget.style.boxShadow=`0 0 12px ${TIER.gold.glow}`; }}
                            onMouseLeave={e => { e.currentTarget.style.background='rgba(55,38,0,0.7)'; e.currentTarget.style.boxShadow='none'; }}
                          >
                            {allCaptainsDown ? 'Confront the Bandit Lord' : 'Launch Raid'}
                          </button>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Daughters of Dusk Raid */}
                  {(() => {
                    const captDefeated = daughtersCaptainsDefeated?.length || 0;
                    const allCaptainsDown = captDefeated >= 3;
                    const nextWave = (daughtersWaveNumber || 0) + 1;
                    return (
                      <div className="rounded-xl border overflow-hidden" style={{
                        borderColor: TIER.gold.border,
                        background: 'linear-gradient(160deg, rgba(55,28,72,0.52) 0%, rgba(38,18,52,0.52) 100%)',
                        boxShadow: `0 4px 18px rgba(139,92,246,0.1)`,
                      }}>
                        <div style={{ padding: '12px 16px 8px', borderBottom: `1px solid rgba(212,175,55,0.12)` }}>
                          <div className="flex items-center justify-between mb-1">
                            <span style={{ fontFamily:'Cinzel,serif', fontSize:'0.72rem', letterSpacing:'0.35em', color: TIER.gold.color, textTransform:'uppercase', opacity:0.95 }}>
                              Gold Contract
                            </span>
                            <div style={{ display:'flex', gap:'5px' }}>
                              {[0,1,2].map(i => (
                                <div key={i} style={{
                                  width:8, height:8, borderRadius:'50%',
                                  background: i < captDefeated ? '#A855F7' : 'rgba(139,92,246,0.12)',
                                  border: `1px solid ${i < captDefeated ? 'rgba(168,85,247,0.8)' : 'rgba(139,92,246,0.25)'}`,
                                  boxShadow: i < captDefeated ? '0 0 4px rgba(168,85,247,0.5)' : 'none',
                                }} />
                              ))}
                            </div>
                          </div>
                          <p style={{ fontFamily:'Cinzel,serif', fontSize:'1.15rem', fontWeight:700, color:'rgba(225,205,255,0.98)', letterSpacing:'0.08em', margin:0 }}>
                            {allCaptainsDown ? 'Dusk Queen Mira' : `Daughters of Dusk — Wave ${nextWave}`}
                          </p>
                          <p style={{ fontFamily:'Cinzel,serif', fontSize:'0.85rem', color:'rgba(200,175,240,0.85)', marginTop:'3px' }}>
                            {allCaptainsDown ? 'All captains silenced. Mira awaits in the dark.' : `Captains silenced: ${captDefeated}/3`}
                          </p>
                        </div>
                        <div style={{ padding: '10px 16px' }}>
                          <button
                            onClick={() => { sounds.click(); onDaughtersRaid(nextWave, daughtersCaptainsDefeated || []); }}
                            style={{
                              width:'100%', padding:'8px', borderRadius:'4px', fontFamily:'Cinzel,serif',
                              fontSize:'0.78rem', fontWeight:700, letterSpacing:'0.18em', textTransform:'uppercase',
                              background: 'rgba(30,10,50,0.7)', border: `1px solid ${TIER.gold.border}`,
                              color: TIER.gold.color, cursor:'pointer', transition:'all 0.2s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background='rgba(55,20,80,0.9)'; e.currentTarget.style.boxShadow=`0 0 12px ${TIER.gold.glow}`; }}
                            onMouseLeave={e => { e.currentTarget.style.background='rgba(30,10,50,0.7)'; e.currentTarget.style.boxShadow='none'; }}
                          >
                            {allCaptainsDown ? 'Confront the Dusk Queen' : 'Enter the Dusk'}
                          </button>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </>
            )}

            {/* ── PLATINUM CONTRACT ── */}
            {(() => {
              const completedTasks = tasks.filter(t => t.done).length;
              const requiredTasks = Math.min(3, tasks.length);
              const taskGateMet = tasks.length > 0 && completedTasks >= requiredTasks;
              const isDisabled = !isDayActive || eliteBossDefeatedToday || !taskGateMet;
              const pct = tasks.length === 0 ? 0 : Math.min(100, (completedTasks / Math.max(1, requiredTasks)) * 100);

              return (
                <>
                  <TierDivider tier="platinum" label="Platinum Contract" />
                  <div style={{
                    borderRadius: '10px',
                    border: `1px solid ${eliteBossDefeatedToday ? 'rgba(80,200,100,0.3)' : taskGateMet && isDayActive ? 'rgba(220,220,220,0.45)' : TIER.platinum.border}`,
                    background: 'linear-gradient(160deg, rgba(50,50,75,0.52) 0%, rgba(35,35,58,0.52) 100%)',
                    boxShadow: taskGateMet && !eliteBossDefeatedToday && isDayActive
                      ? '0 0 28px rgba(232,232,232,0.1), 0 0 60px rgba(220,220,220,0.04)'
                      : 'none',
                    overflow: 'hidden',
                    opacity: !isDayActive ? 0.5 : 1,
                  }}>
                    <div style={{ padding: '16px 20px 12px', borderBottom: '1px solid rgba(220,220,220,0.06)' }}>
                      <div className="flex items-center justify-between mb-2">
                        <span style={{ fontFamily:'Cinzel,serif', fontSize:'0.72rem', letterSpacing:'0.4em', color: TIER.platinum.color, textTransform:'uppercase', opacity:0.9 }}>
                          Platinum Contract
                        </span>
                        {eliteBossDefeatedToday && (
                          <span style={{ fontFamily:'Cinzel,serif', fontSize:'0.65rem', letterSpacing:'0.2em', color:'rgba(80,200,100,0.8)', textTransform:'uppercase' }}>
                            Sealed today
                          </span>
                        )}
                      </div>
                      <p style={{ fontFamily:'Cinzel,serif', fontSize:'1.2rem', fontWeight:800, color: eliteBossDefeatedToday ? 'rgba(180,220,180,0.85)' : '#F0F0F5', letterSpacing:'0.1em', margin:'0 0 4px' }}>
                        Blood Contract
                      </p>
                      <p style={{ fontFamily:'Cinzel,serif', fontSize:'0.85rem', color:'rgba(210,210,225,0.75)', margin:0 }}>
                        {eliteBossDefeatedToday
                          ? 'The guardian has been silenced. Curse clears at midnight.'
                          : 'Complete your daily trials to summon the guardian.'}
                      </p>
                    </div>
                    <div style={{ padding: '14px 20px 16px' }}>
                      {!eliteBossDefeatedToday && (
                        <div style={{ marginBottom: '12px' }}>
                          {/* Progress bar track */}
                          <div style={{
                            width:'100%', height:'5px', borderRadius:'3px',
                            background:'rgba(255,255,255,0.06)', overflow:'hidden', marginBottom:'6px',
                          }}>
                            <div style={{
                              height:'100%',
                              width: `${pct}%`,
                              background: taskGateMet
                                ? `linear-gradient(to right, ${TIER.platinum.color}, #ffffff)`
                                : 'linear-gradient(to right, rgba(180,150,80,0.6), rgba(212,175,55,0.8))',
                              borderRadius:'3px',
                              transition:'width 0.45s ease',
                              boxShadow: taskGateMet ? `0 0 8px ${TIER.platinum.glow}` : 'none',
                            }} />
                          </div>
                          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                            <span style={{ fontFamily:'Cinzel,serif', fontSize:'0.75rem', letterSpacing:'0.12em', color: taskGateMet ? TIER.platinum.color : 'rgba(210,185,120,0.9)', textTransform:'uppercase' }}>
                              {tasks.length === 0 ? 'Add tasks to unlock' : taskGateMet ? 'Guardian awakens' : `${completedTasks} / ${requiredTasks} tasks`}
                            </span>
                            <span style={{ fontFamily:'Cinzel,serif', fontSize:'0.72rem', color:'rgba(210,210,225,0.65)' }}>
                              {Math.round(pct)}%
                            </span>
                          </div>
                        </div>
                      )}
                      <button
                        onClick={() => { sounds.click(); miniBoss(); }}
                        disabled={isDisabled}
                        style={{
                          width:'100%', padding:'10px', borderRadius:'6px',
                          fontFamily:'Cinzel,serif', fontSize:'0.8rem', fontWeight:700,
                          letterSpacing:'0.22em', textTransform:'uppercase',
                          background: isDisabled ? 'rgba(20,20,28,0.5)' : 'rgba(40,40,55,0.8)',
                          border: `1px solid ${isDisabled ? 'rgba(180,180,200,0.12)' : TIER.platinum.border}`,
                          color: isDisabled ? 'rgba(180,180,200,0.3)' : TIER.platinum.color,
                          cursor: isDisabled ? 'not-allowed' : 'pointer',
                          transition:'all 0.2s',
                          boxShadow: taskGateMet && !isDisabled ? `0 0 16px ${TIER.platinum.glow}` : 'none',
                          animation: taskGateMet && !isDisabled ? 'intro-hint-pulse 2s ease-in-out infinite' : 'none',
                        }}
                        onMouseEnter={e => { if (!isDisabled) { e.currentTarget.style.background='rgba(60,60,80,0.9)'; e.currentTarget.style.boxShadow=`0 0 22px ${TIER.platinum.glow}`; } }}
                        onMouseLeave={e => { if (!isDisabled) { e.currentTarget.style.background='rgba(40,40,55,0.8)'; e.currentTarget.style.boxShadow=taskGateMet ? `0 0 16px ${TIER.platinum.glow}` : 'none'; } }}
                      >
                        {eliteBossDefeatedToday ? 'Contract Complete' : taskGateMet ? 'Invoke the Blood Contract' : 'Locked'}
                      </button>
                    </div>
                  </div>
                </>
              );
            })()}

            {/* ── MYTHRIL CONTRACT ── */}
            {(() => {
              const allDone = tasks.length > 0 && tasks.filter(t => t.done).length >= tasks.length;
              const isDisabled = !gauntletUnlocked || tasks.length === 0 || !allDone;
              return (
                <>
                  <TierDivider tier="mythril" label="Mythril Contract" />
                  <div style={{
                    borderRadius: '10px',
                    border: `1px solid ${gauntletUnlocked && allDone ? TIER.mythril.border : 'rgba(125,249,255,0.1)'}`,
                    background: 'linear-gradient(160deg, rgba(4,40,48,0.58) 0%, rgba(2,28,34,0.58) 100%)',
                    boxShadow: gauntletUnlocked && allDone
                      ? `0 0 36px ${TIER.mythril.glow.replace('0.45','0.1')}, 0 0 80px rgba(125,249,255,0.04)`
                      : 'none',
                    overflow: 'hidden',
                    opacity: !isDayActive ? 0.4 : 1,
                  }}>
                    <div style={{ padding: '16px 20px 12px', borderBottom: 'rgba(125,249,255,0.04) solid 1px' }}>
                      <div className="flex items-center justify-between mb-2">
                        <span style={{ fontFamily:'Cinzel,serif', fontSize:'0.72rem', letterSpacing:'0.4em', color: TIER.mythril.color, textTransform:'uppercase', opacity: gauntletUnlocked ? 0.9 : 0.55 }}>
                          Mythril Contract
                        </span>
                        {!gauntletUnlocked && (
                          <span style={{ fontFamily:'Cinzel,serif', fontSize:'0.72rem', letterSpacing:'0.2em', color:'rgba(125,249,255,0.65)', textTransform:'uppercase' }}>
                            {gauntletMilestone - xp} XP to unseal
                          </span>
                        )}
                      </div>
                      <p style={{ fontFamily:'Cinzel,serif', fontSize:'1.2rem', fontWeight:800, letterSpacing:'0.1em', margin:'0 0 4px',
                        color: gauntletUnlocked && allDone ? TIER.mythril.color : 'rgba(125,249,255,0.55)',
                        textShadow: gauntletUnlocked && allDone ? `0 0 18px ${TIER.mythril.glow}` : 'none',
                      }}>
                        The Black Contract
                      </p>
                      <p style={{ fontFamily:'Cinzel,serif', fontSize:'0.85rem', color:'rgba(125,249,255,0.65)', margin:0 }}>
                        {!gauntletUnlocked
                          ? 'This contract is sealed. Earn enough renown to break the lock.'
                          : !allDone
                            ? 'All daily contracts must be fulfilled before the Gauntlet opens.'
                            : 'The Gauntlet awaits. There is no return.'}
                      </p>
                    </div>
                    <div style={{ padding: '14px 20px 16px' }}>
                      {/* Rune-like lock dots */}
                      {!gauntletUnlocked && (
                        <div style={{ display:'flex', justifyContent:'center', gap:'8px', marginBottom:'12px' }}>
                          {[0,1,2,3,4].map(i => (
                            <div key={i} style={{
                              width:6, height:6, borderRadius:'50%',
                              background:'rgba(125,249,255,0.08)',
                              border:'1px solid rgba(125,249,255,0.15)',
                            }} />
                          ))}
                        </div>
                      )}
                      <button
                        onClick={() => { sounds.click(); finalBoss(); }}
                        disabled={isDisabled}
                        style={{
                          width:'100%', padding:'10px', borderRadius:'6px',
                          fontFamily:'Cinzel,serif', fontSize:'0.8rem', fontWeight:700,
                          letterSpacing:'0.22em', textTransform:'uppercase',
                          background: isDisabled ? 'rgba(0,10,12,0.6)' : 'rgba(0,25,30,0.9)',
                          border: `1px solid ${isDisabled ? 'rgba(125,249,255,0.08)' : TIER.mythril.border}`,
                          color: isDisabled ? 'rgba(125,249,255,0.2)' : TIER.mythril.color,
                          cursor: isDisabled ? 'not-allowed' : 'pointer',
                          transition:'all 0.2s',
                          boxShadow: !isDisabled ? `0 0 18px ${TIER.mythril.glow}` : 'none',
                          animation: !isDisabled ? 'intro-hint-pulse 2s ease-in-out infinite' : 'none',
                        }}
                        onMouseEnter={e => { if (!isDisabled) { e.currentTarget.style.background='rgba(0,40,48,0.95)'; e.currentTarget.style.boxShadow=`0 0 28px ${TIER.mythril.glow}`; } }}
                        onMouseLeave={e => { if (!isDisabled) { e.currentTarget.style.background='rgba(0,25,30,0.9)'; e.currentTarget.style.boxShadow=`0 0 18px ${TIER.mythril.glow}`; } }}
                      >
                        {!gauntletUnlocked ? 'Sealed' : !allDone ? 'Fulfill all contracts first' : 'Enter the Gauntlet'}
                      </button>
                    </div>
                  </div>
                </>
              );
            })()}

          </div>

          {/* Chronicle of Events */}
          <div className="bg-black bg-opacity-50 rounded-xl p-4 border border-gray-800">
            <div className="text-center mb-4">
              <div className="flex items-center justify-center gap-3 mb-3">
                <div style={{flex:1,height:'1px',background:'linear-gradient(to right,transparent,rgba(101,67,33,0.6))'}}/>
                <span style={{color:'rgba(212,175,55,0.4)',fontSize:'8px'}}>◆</span>
                <div style={{flex:1,height:'1px',background:'linear-gradient(to left,transparent,rgba(101,67,33,0.6))'}}/>
              </div>
              <h3 style={{fontFamily:'Cinzel,serif',fontSize:'1.3rem',fontWeight:900,letterSpacing:'0.25em',color:'#D4AF37',textShadow:'0 0 18px rgba(212,175,55,0.4)',marginBottom:'0.75rem'}}>CHRONICLE OF EVENTS</h3>
              <div className="flex items-center justify-center gap-3">
                <div style={{flex:1,height:'1px',background:'linear-gradient(to right,transparent,rgba(101,67,33,0.6))'}}/>
                <span style={{color:'rgba(212,175,55,0.4)',fontSize:'8px'}}>◆</span>
                <div style={{flex:1,height:'1px',background:'linear-gradient(to left,transparent,rgba(101,67,33,0.6))'}}/>
              </div>
            </div>
            {log.length === 0
              ? <p className="italic text-center" style={{fontSize:'0.9rem',color:'rgba(160,150,120,0.6)'}}>The journey begins...</p>
              : <div className="space-y-2">{log.map((l, i) => <p key={i} style={{fontSize:'0.9rem',color:'rgba(210,200,175,0.9)',fontFamily:'Cinzel,serif',letterSpacing:'0.02em'}}>{l}</p>)}</div>
            }
          </div>
        </>
      )}
    </div>
  );
};

export default ContractsTab;
