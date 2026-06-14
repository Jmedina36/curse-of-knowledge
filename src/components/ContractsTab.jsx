import React, { useState } from 'react';
import { Calendar, Plus } from 'lucide-react';
import { COLORS, GAME_CONSTANTS } from '../constants';
import { sounds } from '../sounds';
import { REWARD_LABELS, REWARD_COLORS } from '../data/locationContracts';

const TIER = {
  copper:   { label: 'Copper',   color: '#CD7F32', glow: 'rgba(205,127,50,0.5)',  border: 'rgba(205,127,50,0.4)',  bg: 'rgba(50,25,8,0.6)'   },
  silver:   { label: 'Silver',   color: '#C8C8C8', glow: 'rgba(200,200,200,0.4)', border: 'rgba(200,200,200,0.35)',bg: 'rgba(35,35,38,0.6)'  },
  gold:     { label: 'Gold',     color: '#D4AF37', glow: 'rgba(212,175,55,0.5)',  border: 'rgba(212,175,55,0.5)',  bg: 'rgba(40,30,0,0.6)'   },
  platinum: { label: 'Platinum', color: '#E8E8E8', glow: 'rgba(232,232,232,0.35)',border: 'rgba(220,220,220,0.4)', bg: 'rgba(20,20,28,0.7)'  },
  mythril:  { label: 'Mythril',  color: '#7DF9FF', glow: 'rgba(125,249,255,0.45)',border: 'rgba(125,249,255,0.4)', bg: 'rgba(0,18,22,0.85)'  },
  mercy:    { label: 'Mercy',    color: '#B0A0D8', glow: 'rgba(160,140,210,0.4)', border: 'rgba(160,140,210,0.38)',bg: 'rgba(18,14,28,0.65)' },
};

const TierDivider = ({ tier, label }) => (
  <div className="flex items-center gap-3 my-5">
    <div style={{ flex: 1, height: '1px', background: `linear-gradient(to right, transparent, ${TIER[tier].border})` }} />
    <span style={{
      fontFamily: 'Cinzel, serif', fontSize: '0.97rem', letterSpacing: '0.35em',
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
  eliteBossDefeatedToday,
  tasks,
  setShowModal,
  hideCompletedTasks,
  setHideCompletedTasks,
  handleDragStart,
  handleDragEnd,
  handleDragOver,
  handleDrop,
  start,
  activeContract,
  setActiveContract,
  setActiveTab,
  setShowImportModal,
  log,
  guildPoints,
  guildRank,
  guildRanks,
  locationContracts,
  completedLocationContracts,
  pendingLocationRewards,
  onCollectLocationReward,
  debugUnlockedZones = [],
}) => {
  const [hideCompletedContracts, setHideCompletedContracts] = useState(false);
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
            letterSpacing: '0.2em', textTransform: 'uppercase', color: '#D4AF37',
            textShadow: '0 0 28px rgba(212,175,55,0.85), 0 0 60px rgba(212,175,55,0.3)', marginBottom: '0.3rem',
          }}>Curse of Knowledge</h1>
          <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.71rem', letterSpacing: '0.5em', textTransform: 'uppercase', color: 'rgba(245,245,220,0.7)', marginBottom: '1.5rem' }}>A Fantasy Study Quest</p>
          <div className="flex items-center justify-center gap-2 mb-4">
            <div style={{width:'80px',height:'1px',background:'linear-gradient(to right,transparent,rgba(212,175,55,0.5))'}}/>
            <span style={{color:'rgba(212,175,55,0.78)',fontSize:'8px'}}>◆</span>
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
            <span style={{color:'rgba(212,175,55,0.78)',fontSize:'8px'}}>◆</span>
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
            <span style={{color:'rgba(212,175,55,0.78)',fontSize:'8px'}}>◆</span>
            <div style={{width:'80px',height:'1px',background:'linear-gradient(to left,transparent,rgba(212,175,55,0.5))'}}/>
          </div>
        </div>
      ) : (
        <>
          {/* ── BOARD SHELL ── */}
          <div style={{
            background: 'linear-gradient(rgba(6,4,1,0.62), rgba(6,4,1,0.62)), url("/Updated scroll.png")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            border: '2px solid rgba(212,175,55,0.6)',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 4px 32px rgba(0,0,0,0.6)',
          }}>

            {/* Board header */}
            <div className="text-center mb-5">

              {/* ── GUILD NOTICE BOARD title ── */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '6px' }}>
                  <div style={{ flex: 1, height: '2px', background: 'linear-gradient(to right, transparent, rgba(120,75,20,0.8))' }} />
                  <span style={{ color: 'rgba(180,120,40,0.78)', fontSize: '12px' }}>✦</span>
                  <div style={{ flex: 1, height: '2px', background: 'linear-gradient(to left, transparent, rgba(120,75,20,0.8))' }} />
                </div>
                <h2 style={{
                  fontFamily: 'Cinzel, serif', fontSize: 'clamp(1rem, 2.5vw, 1.5rem)', fontWeight: 900,
                  letterSpacing: '0.35em', textTransform: 'uppercase',
                  color: 'rgba(205,160,70,0.95)',
                  textShadow: '0 0 24px rgba(160,110,20,0.6), 0 2px 4px rgba(0,0,0,0.8)',
                  borderTop: '1px solid rgba(120,75,20,0.4)',
                  borderBottom: '1px solid rgba(120,75,20,0.4)',
                  padding: '8px 24px',
                  display: 'inline-block',
                  margin: '0 0 6px',
                }}>Guild Notice Board</h2>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginTop: '6px' }}>
                  <div style={{ flex: 1, height: '2px', background: 'linear-gradient(to right, transparent, rgba(120,75,20,0.8))' }} />
                  <span style={{ color: 'rgba(180,120,40,0.78)', fontSize: '12px' }}>✦</span>
                  <div style={{ flex: 1, height: '2px', background: 'linear-gradient(to left, transparent, rgba(120,75,20,0.8))' }} />
                </div>
              </div>

              {/* Guild rank badge */}
              {guildRank && (() => {
                const nextRank = guildRanks && guildRanks.find(r => r.min > guildPoints);
                const pct = nextRank ? Math.min(100, ((guildPoints - guildRank.min) / (nextRank.min - guildRank.min)) * 100) : 100;
                return (
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'8px', marginBottom:'18px' }}>
                    <span style={{
                      fontFamily:'Cinzel,serif', fontSize:'1.06rem', letterSpacing:'0.35em',
                      textTransform:'uppercase', color:'rgba(230,210,170,0.9)',
                    }}>Guild Rank</span>
                    <span style={{
                      fontFamily:'Cinzel,serif', fontSize:'2.36rem', fontWeight:900, letterSpacing:'0.25em',
                      textTransform:'uppercase', color: guildRank.color,
                      textShadow: `0 0 20px ${guildRank.color}99, 0 0 40px ${guildRank.color}44`,
                    }}>{guildRank.name}</span>
                    <span style={{ fontFamily:'Cinzel,serif', fontSize:'1.18rem', letterSpacing:'0.2em', color:'rgba(230,210,170,0.95)' }}>
                      {guildPoints} Guild Points
                    </span>
                    {nextRank && (
                      <div style={{ width:'240px' }}>
                        <div style={{ width:'100%', height:'10px', borderRadius:'5px', background:'rgba(255,255,255,0.06)', overflow:'hidden' }}>
                          <div style={{
                            height:'100%', width:`${pct}%`,
                            background: `linear-gradient(to right, ${guildRank.color}77, ${guildRank.color})`,
                            borderRadius:'5px', transition:'width 0.4s ease',
                            boxShadow: `0 0 8px ${guildRank.color}88`,
                          }} />
                        </div>
                        <p style={{ fontFamily:'Cinzel,serif', fontSize:'1rem', letterSpacing:'0.15em', color:'rgba(230,210,170,0.9)', textAlign:'center', marginTop:'5px', textTransform:'uppercase' }}>
                          {nextRank.min - guildPoints} GP to {nextRank.name}
                        </p>
                      </div>
                    )}
                    {!nextRank && (
                      <p style={{ fontFamily:'Cinzel,serif', fontSize:'0.85rem', letterSpacing:'0.2em', color: guildRank.color, opacity:0.7, textTransform:'uppercase' }}>
                        Pinnacle of the Guild
                      </p>
                    )}
                  </div>
                );
              })()}

              {/* Tier legend */}
              <div className="flex items-center justify-center gap-3 mb-3">
                <div style={{flex:1,height:'1px',background:'linear-gradient(to right,transparent,rgba(101,67,33,0.6))'}}/>
                <span style={{color:'rgba(212,175,55,0.7)',fontSize:'8px'}}>◆</span>
                <div style={{flex:1,height:'1px',background:'linear-gradient(to left,transparent,rgba(101,67,33,0.6))'}}/>
              </div>
              <div className="flex items-center justify-center gap-5 flex-wrap">
                {['copper','silver','gold','platinum','mythril'].map(t => (
                  <span key={t} style={{ fontFamily:'Cinzel,serif', fontSize:'1.06rem', letterSpacing:'0.2em', textTransform:'uppercase', color: TIER[t].color, opacity: 0.95 }}>
                    ◆ {TIER[t].label}
                  </span>
                ))}
              </div>
              <div className="flex items-center justify-center gap-3 mt-3">
                <div style={{flex:1,height:'1px',background:'linear-gradient(to right,transparent,rgba(101,67,33,0.6))'}}/>
                <span style={{color:'rgba(212,175,55,0.7)',fontSize:'8px'}}>◆</span>
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
                <p style={{fontFamily:'Cinzel,serif',fontSize:'0.94rem',letterSpacing:'0.2em',color:'rgba(160,135,80,0.78)',textTransform:'uppercase'}}>The board is bare. Post a contract to begin.</p>
              </div>
            ) : (
              <>
                <TierDivider tier="copper" label="Posted Contracts" />
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

                        {/* Tier badge row */}
                        <div style={{marginBottom:'8px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                          <span style={{
                            fontFamily:'Cinzel,serif', fontSize:'1rem', letterSpacing:'0.2em',
                            textTransform:'uppercase', padding:'2px 8px', borderRadius:'2px',
                            background: t.done ? 'rgba(60,90,40,0.3)' : t.overdue ? 'rgba(140,30,20,0.4)' : t.priority === 'important' ? 'rgba(50,50,55,0.5)' : 'rgba(45,25,8,0.5)',
                            border: t.done ? '1px solid rgba(80,120,60,0.4)' : t.overdue ? '1px solid rgba(180,40,30,0.5)' : t.priority === 'important' ? `1px solid ${TIER.silver.border}` : `1px solid ${TIER.copper.border}`,
                            color: t.done ? 'rgba(150,220,110,0.95)' : t.overdue ? '#EF4444' : t.priority === 'important' ? TIER.silver.color : TIER.copper.color,
                          }}>
                            {t.done ? 'Sealed' : t.overdue ? 'Overdue' : t.priority === 'important' ? 'Silver' : 'Copper'}
                          </span>
                          {!t.done && (
                            <span style={{fontSize:'1rem',color:'rgba(200,175,110,0.8)',fontFamily:'Cinzel,serif'}}>
                              {t.priority === 'important' ? '1.25x XP' : '1.0x XP'}
                            </span>
                          )}
                        </div>

                        {/* Contract title */}
                        <p style={{
                          fontFamily:'Cinzel,serif', fontSize:'1.24rem', fontWeight:600,
                          letterSpacing:'0.05em', lineHeight:1.45,
                          color: t.done ? 'rgba(180,175,150,0.65)' : t.overdue ? '#FF9980' : '#F5F0E0',
                          textDecoration: t.done ? 'line-through' : 'none',
                          marginBottom:'10px', wordBreak:'break-word',
                        }}>
                          {t.title}
                        </p>

                        {/* Actions */}
                        {!t.done && (
                          <div style={{display:'flex',gap:'6px',justifyContent:'flex-end',alignItems:'center'}}>
                            {activeContract?.type === 'task' && activeContract.task.id === t.id ? (
                              <div style={{
                                fontFamily:'Cinzel,serif', fontSize:'1rem', letterSpacing:'0.1em',
                                padding:'5px 10px', borderRadius:'2px',
                                background:'rgba(80,55,0,0.5)', border:'1px solid rgba(212,175,55,0.4)',
                                color:'rgba(212,175,55,0.9)', display:'flex', alignItems:'center', gap:'4px',
                              }}>✦ On Map</div>
                            ) : (
                              <button
                                onClick={() => {
                                  sounds.click();
                                  setActiveContract({ type: 'task', task: t });
                                  setActiveTab('map');
                                }}
                                disabled={!!activeContract}
                                style={{
                                  fontFamily:'Cinzel,serif', fontSize:'0.97rem', letterSpacing:'0.15em',
                                  padding:'5px 12px', borderRadius:'2px',
                                  background: activeContract ? 'rgba(30,20,5,0.4)' : 'rgba(80,55,10,0.6)',
                                  border: `1px solid ${activeContract ? 'rgba(180,140,40,0.18)' : 'rgba(180,140,40,0.5)'}`,
                                  color: activeContract ? 'rgba(180,150,80,0.3)' : 'rgba(212,175,55,0.95)',
                                  cursor: activeContract ? 'not-allowed' : 'pointer', transition:'all 0.2s',
                                }}
                                onMouseEnter={e=>{ if (!activeContract) { e.currentTarget.style.background='rgba(100,70,15,0.8)'; }}}
                                onMouseLeave={e=>{ if (!activeContract) { e.currentTarget.style.background='rgba(80,55,10,0.6)'; }}}
                              >Accept</button>
                            )}
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

            {/* ── LOCATION CONTRACTS ── */}
            {isDayActive && locationContracts?.length > 0 && (() => {
              const isZoneUnlocked = (zone) => {
                if (!zone || zone <= 1) return true;
                if (debugUnlockedZones?.includes(zone - 1)) return true;
                const prevContracts = locationContracts.filter(c => c.zone === zone - 1 && !c.mercyContract);
                if (prevContracts.length === 0) return false;
                return prevContracts.every(c => completedLocationContracts?.includes(c.id));
              };

              const visible = locationContracts.filter(lc => {
                if (!isZoneUnlocked(lc.zone)) return false;
                // Always show pending contracts — player already won the battle
                if (pendingLocationRewards?.includes(lc.id)) return true;
                if (completedLocationContracts?.includes(lc.id)) return true;
                if (!lc.requiredContracts?.length) return true;
                return lc.requiredContracts.every(id => completedLocationContracts?.includes(id));
              });
              const hasAnyCompleted = visible.some(lc => completedLocationContracts?.includes(lc.id) && !pendingLocationRewards?.includes(lc.id));
              const displayed = hideCompletedContracts
                ? visible.filter(lc => !completedLocationContracts?.includes(lc.id) || pendingLocationRewards?.includes(lc.id))
                : visible;
              const fieldContracts   = displayed.filter(lc => !lc.storyContract && !lc.mercyContract && lc.contractTier !== 'blood' && lc.contractTier !== 'mythril');
              const storyContracts   = displayed.filter(lc => lc.storyContract && lc.contractTier !== 'mythril');
              const mercyContracts   = displayed.filter(lc => lc.mercyContract);
              const bloodContracts   = displayed.filter(lc => !lc.storyContract && !lc.mercyContract && lc.contractTier === 'blood');
              const mythrilContracts = displayed.filter(lc => lc.contractTier === 'mythril');

              const renderCard = (lc) => {
                const isCompleted = completedLocationContracts?.includes(lc.id);
                const isPending = pendingLocationRewards?.includes(lc.id);
                const isActive = activeContract?.type === 'location' && activeContract.contract.id === lc.id;
                const tier = lc.contractTier === 'mythril' ? TIER.mythril : lc.mercyContract ? TIER.gold : lc.contractTier === 'blood' ? TIER.platinum : TIER.silver;
                const tierLabel = lc.contractTier === 'mythril' ? 'Mythril' : lc.mercyContract ? 'Gold' : lc.contractTier === 'blood' ? 'Platinum' : 'Silver';
                return (
                  <div key={lc.id} style={{
                    position: 'relative',
                    background: isCompleted
                      ? 'linear-gradient(160deg,rgba(42,42,48,0.52),rgba(35,35,42,0.52))'
                      : isPending
                        ? 'linear-gradient(160deg,rgba(40,55,20,0.6),rgba(30,45,15,0.6))'
                        : lc.contractTier === 'mythril'
                          ? 'linear-gradient(160deg,rgba(0,28,32,0.75),rgba(0,18,22,0.75))'
                          : lc.mercyContract || lc.contractTier === 'gold'
                            ? 'linear-gradient(160deg,rgba(45,35,5,0.7),rgba(32,24,4,0.7))'
                            : lc.contractTier === 'blood'
                              ? 'linear-gradient(160deg,rgba(38,38,60,0.72),rgba(26,26,48,0.72))'
                              : 'linear-gradient(160deg,rgba(38,38,45,0.6),rgba(28,28,35,0.6))',
                    border: isCompleted
                      ? '1px solid rgba(80,100,60,0.45)'
                      : isPending
                        ? '1px solid rgba(100,180,60,0.5)'
                        : `1px solid ${tier.border}`,
                    boxShadow: isPending
                      ? '0 0 16px rgba(100,200,60,0.2)'
                      : isCompleted ? 'none'
                        : `0 2px 12px ${tier.glow.replace('0.5','0.1').replace('0.4','0.1')}`,
                    borderRadius: '4px',
                    padding: '14px 14px 12px',
                    opacity: isCompleted ? 0.65 : 1,
                  }}>

                    {/* Tier badge */}
                    <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{
                        fontFamily: 'Cinzel,serif', fontSize: '1rem', letterSpacing: '0.2em',
                        textTransform: 'uppercase', padding: '2px 8px', borderRadius: '2px',
                        background: isCompleted ? 'rgba(60,90,40,0.3)' : 'rgba(0,0,0,0.25)',
                        border: isCompleted ? '1px solid rgba(80,120,60,0.4)' : `1px solid ${tier.border}`,
                        color: isCompleted ? 'rgba(150,220,110,0.95)' : tier.color,
                      }}>
                        {isCompleted ? 'Sealed' : tierLabel}
                      </span>
                    </div>

                    {/* Contract title */}
                    <p style={{
                      fontFamily: 'Cinzel,serif', fontSize: '1.18rem', fontWeight: 600,
                      letterSpacing: '0.05em', lineHeight: 1.4, textAlign: 'center',
                      color: isCompleted ? 'rgba(180,175,150,0.65)' : '#F5F0E0',
                      textDecoration: isCompleted ? 'line-through' : 'none',
                      marginBottom: '4px',
                    }}>{lc.name}</p>

                    {/* Location — where the mission takes place */}
                    <p style={{
                      fontFamily: 'Cinzel,serif', fontSize: '0.9rem', letterSpacing: '0.08em',
                      textAlign: 'center', color: 'rgba(180,160,120,0.8)', marginBottom: '8px',
                    }}>📍 {lc.locationName}</p>

                    {/* Description */}
                    <p style={{
                      fontSize: '0.97rem', color: 'rgba(180,165,140,0.78)',
                      lineHeight: 1.6, marginBottom: '10px', fontStyle: 'italic', textAlign: 'center',
                    }}>{lc.desc}</p>

                    {/* Story note — revealed after completion */}
                    {lc.storyNote && isCompleted && (
                      <div style={{
                        marginBottom: '10px', padding: '8px 10px', borderRadius: '3px',
                        background: 'rgba(20,15,0,0.5)',
                        border: '1px solid rgba(212,175,55,0.2)',
                        borderLeft: '2px solid rgba(212,175,55,0.5)',
                      }}>
                        <p style={{ fontSize: '0.92rem', color: 'rgba(212,175,55,0.75)', lineHeight: 1.6, fontStyle: 'italic', margin: 0 }}>
                          📜 {lc.storyNote}
                        </p>
                      </div>
                    )}

                    {/* Rewards */}
                    {!isCompleted && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px', justifyContent: 'center' }}>
                        {lc.rewards.map((r, i) => (
                          <span key={i} style={{
                            fontFamily: 'Cinzel,serif', fontSize: '0.83rem',
                            color: REWARD_COLORS[r.type] || 'rgba(200,200,200,0.8)',
                            background: 'rgba(0,0,0,0.2)',
                            border: `1px solid ${(REWARD_COLORS[r.type] || 'rgba(200,200,200,0.3)')}44`,
                            borderRadius: '2px', padding: '1px 6px',
                          }}>+{r.amount} {REWARD_LABELS[r.type]}</span>
                        ))}
                      </div>
                    )}

                    {/* Action */}
                    {!isCompleted && (
                      isPending ? (
                        <button
                          onClick={() => { sounds.click(); onCollectLocationReward(lc.id); }}
                          style={{
                            width: '100%',
                            fontFamily: 'Cinzel,serif', fontSize: '0.97rem', letterSpacing: '0.15em',
                            padding: '6px 12px', borderRadius: '2px',
                            background: 'rgba(30,80,15,0.7)',
                            border: '1px solid rgba(100,200,60,0.6)',
                            color: 'rgba(150,240,100,0.95)',
                            cursor: 'pointer', transition: 'all 0.2s',
                            boxShadow: '0 0 10px rgba(100,200,60,0.25)',
                            animation: 'intro-hint-pulse 2s ease-in-out infinite',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(40,110,20,0.85)'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(30,80,15,0.7)'; }}
                        >Complete — Collect Rewards</button>
                      ) : isActive ? (
                        <div style={{
                          fontFamily: 'Cinzel,serif', fontSize: '1rem', letterSpacing: '0.1em',
                          padding: '5px 10px', borderRadius: '2px', textAlign: 'center',
                          background: 'rgba(80,55,0,0.5)', border: '1px solid rgba(212,175,55,0.4)',
                          color: 'rgba(212,175,55,0.9)',
                        }}>On Map</div>
                      ) : (
                        <button
                          onClick={() => {
                            sounds.click();
                            setActiveContract({ type: 'location', contract: lc });
                            setActiveTab('map');
                          }}
                          disabled={!!activeContract}
                          style={{
                            width: '100%',
                            fontFamily: 'Cinzel,serif', fontSize: '0.97rem', letterSpacing: '0.15em',
                            padding: '5px 12px', borderRadius: '2px',
                            background: activeContract ? 'rgba(30,20,5,0.4)' : `rgba(0,0,0,0.3)`,
                            border: `1px solid ${activeContract ? tier.border.replace('0.5','0.15').replace('0.4','0.15') : tier.border}`,
                            color: activeContract ? `${tier.color}44` : tier.color,
                            cursor: activeContract ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
                          }}
                          onMouseEnter={e => { if (!activeContract) e.currentTarget.style.background = 'rgba(0,0,0,0.5)'; }}
                          onMouseLeave={e => { if (!activeContract) e.currentTarget.style.background = 'rgba(0,0,0,0.3)'; }}
                        >Accept</button>
                      )
                    )}
                  </div>
                );
              };

              return (
                <>
                  {hasAnyCompleted && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', marginBottom: '4px' }}>
                      <input
                        type="checkbox"
                        id="hideCompletedContracts"
                        checked={hideCompletedContracts}
                        onChange={e => setHideCompletedContracts(e.target.checked)}
                        style={{ width: '14px', height: '14px', cursor: 'pointer', accentColor: '#D4AF37' }}
                      />
                      <label htmlFor="hideCompletedContracts" style={{ fontSize: '0.83rem', color: 'rgba(192,192,192,0.65)', cursor: 'pointer', fontFamily: 'Cinzel, serif', letterSpacing: '0.08em' }}>
                        Hide sealed
                      </label>
                    </div>
                  )}
                  {fieldContracts.length > 0 && (
                    <>
                      <TierDivider tier="silver" label="Field Contracts" />
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px', marginBottom: '4px' }}>
                        {fieldContracts.map(renderCard)}
                      </div>
                    </>
                  )}
                  {storyContracts.length > 0 && (
                    <>
                      <TierDivider tier="gold" label="Story Contracts" />
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px', marginBottom: '4px' }}>
                        {storyContracts.map(renderCard)}
                      </div>
                    </>
                  )}
                  {mercyContracts.length > 0 && (
                    <>
                      <TierDivider tier="gold" label="Mercy Contracts — The Cursed" />
                      <p style={{ textAlign: 'center', fontSize: '0.92rem', color: 'rgba(212,175,55,0.7)', fontStyle: 'italic', lineHeight: 1.6, marginBottom: '12px' }}>
                        Fallen heroes who cannot rest. Find them. End it.
                      </p>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px', marginBottom: '4px' }}>
                        {mercyContracts.map(renderCard)}
                      </div>
                    </>
                  )}
                  {bloodContracts.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px', marginBottom: '4px' }}>
                      {bloodContracts.map(renderCard)}
                    </div>
                  )}
                  {mythrilContracts.length > 0 && (
                    <>
                      <TierDivider tier="mythril" label="The Order" />
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px', marginBottom: '4px' }}>
                        {mythrilContracts.map(renderCard)}
                      </div>
                    </>
                  )}
                </>
              );
            })()}


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
                        <span style={{ fontFamily:'Cinzel,serif', fontSize:'0.97rem', letterSpacing:'0.35em', color: TIER.platinum.color, textTransform:'uppercase', opacity:0.9 }}>
                          Platinum Contract
                        </span>
                        {eliteBossDefeatedToday && (
                          <span style={{ fontFamily:'Cinzel,serif', fontSize:'0.88rem', letterSpacing:'0.2em', color:'rgba(80,200,100,0.8)', textTransform:'uppercase' }}>
                            Sealed today
                          </span>
                        )}
                      </div>
                      <p style={{ fontFamily:'Cinzel,serif', fontSize:'1.42rem', fontWeight:800, color: eliteBossDefeatedToday ? 'rgba(180,220,180,0.85)' : '#F0F0F5', letterSpacing:'0.1em', margin:'0 0 4px' }}>
                        Blood Contract
                      </p>
                      <p style={{ fontFamily:'Cinzel,serif', fontSize:'1rem', color:'rgba(210,210,225,0.75)', margin:0 }}>
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
                            <span style={{ fontFamily:'Cinzel,serif', fontSize:'1rem', letterSpacing:'0.1em', color: taskGateMet ? TIER.platinum.color : 'rgba(210,185,120,0.9)', textTransform:'uppercase' }}>
                              {tasks.length === 0 ? 'Add tasks to unlock' : taskGateMet ? 'Guardian awakens' : `${completedTasks} / ${requiredTasks} tasks`}
                            </span>
                            <span style={{ fontFamily:'Cinzel,serif', fontSize:'0.97rem', color:'rgba(210,210,225,0.65)' }}>
                              {Math.round(pct)}%
                            </span>
                          </div>
                        </div>
                      )}
                      <button
                        onClick={() => {
                          sounds.click();
                          setActiveContract({ type: 'elite', eliteId: lc.encounter?.eliteId, eliteDialogue: lc.encounter?.dialogue });
                          setActiveTab('map');
                        }}
                        disabled={isDisabled}
                        style={{
                          width:'100%', padding:'10px', borderRadius:'6px',
                          fontFamily:'Cinzel,serif', fontSize:'0.94rem', fontWeight:700,
                          letterSpacing:'0.2em', textTransform:'uppercase',
                          background: isDisabled ? 'rgba(20,20,28,0.5)' : activeContract?.type === 'elite' ? TIER.platinum.color : 'rgba(40,40,55,0.8)',
                          border: `1px solid ${isDisabled ? 'rgba(180,180,200,0.12)' : TIER.platinum.border}`,
                          color: isDisabled ? 'rgba(180,180,200,0.3)' : activeContract?.type === 'elite' ? '#000' : TIER.platinum.color,
                          cursor: isDisabled ? 'not-allowed' : 'pointer',
                          transition:'all 0.2s',
                          boxShadow: taskGateMet && !isDisabled ? `0 0 16px ${TIER.platinum.glow}` : 'none',
                          animation: taskGateMet && !isDisabled && activeContract?.type !== 'elite' ? 'intro-hint-pulse 2s ease-in-out infinite' : 'none',
                        }}
                        onMouseEnter={e => { if (!isDisabled) { e.currentTarget.style.boxShadow=`0 0 22px ${TIER.platinum.glow}`; } }}
                        onMouseLeave={e => { if (!isDisabled) { e.currentTarget.style.boxShadow=taskGateMet ? `0 0 16px ${TIER.platinum.glow}` : 'none'; } }}
                      >
                        {eliteBossDefeatedToday ? 'Contract Complete' : activeContract?.type === 'elite' ? '✦ Active — Go to Dungeon' : taskGateMet ? 'Accept Blood Contract' : 'Locked'}
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
                <span style={{color:'rgba(212,175,55,0.7)',fontSize:'8px'}}>◆</span>
                <div style={{flex:1,height:'1px',background:'linear-gradient(to left,transparent,rgba(101,67,33,0.6))'}}/>
              </div>
              <h3 style={{fontFamily:'Cinzel,serif',fontSize:'1.53rem',fontWeight:900,letterSpacing:'0.25em',color:'#D4AF37',textShadow:'0 0 18px rgba(212,175,55,0.4)',marginBottom:'0.75rem'}}>CHRONICLE OF EVENTS</h3>
              <div className="flex items-center justify-center gap-3">
                <div style={{flex:1,height:'1px',background:'linear-gradient(to right,transparent,rgba(101,67,33,0.6))'}}/>
                <span style={{color:'rgba(212,175,55,0.7)',fontSize:'8px'}}>◆</span>
                <div style={{flex:1,height:'1px',background:'linear-gradient(to left,transparent,rgba(101,67,33,0.6))'}}/>
              </div>
            </div>
            {log.length === 0
              ? <p className="italic text-center" style={{fontSize:'1.06rem',color:'rgba(160,150,120,0.78)'}}>The journey begins...</p>
              : <div className="space-y-2">{log.map((l, i) => <p key={i} style={{fontSize:'1.06rem',color:'rgba(210,200,175,0.9)',fontFamily:'Cinzel,serif',letterSpacing:'0.05em'}}>{l}</p>)}</div>
            }
          </div>
        </>
      )}
    </div>
  );
};

export default ContractsTab;
