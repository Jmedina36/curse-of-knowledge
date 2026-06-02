import React from 'react';
import { Calendar, GripVertical, Plus } from 'lucide-react';
import { COLORS, VISUAL_STYLES, GAME_CONSTANTS } from '../constants';
import { sounds } from '../sounds';

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
}) => {
  return (
    <div className="space-y-4">
      {!hasStarted ? (
                <div
                  className="rounded-xl p-8 text-center"
                  style={{
                    background: 'linear-gradient(to bottom, rgba(42, 36, 28, 0.97), rgba(26, 22, 18, 0.97))',
                    borderColor: '#D4AF37',
                    borderWidth: '2px',
                    borderStyle: 'solid',
                    boxShadow: '0 0 30px rgba(212, 175, 55, 0.3), inset 0 0 60px rgba(212, 175, 55, 0.1)'
                  }}>

                  {/* Game Title */}
                  <h1 style={{
                    fontFamily: 'Cinzel, serif',
                    fontSize: 'clamp(1.8rem, 5vw, 3.2rem)',
                    fontWeight: 900,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: '#D4AF37',
                    textShadow: '0 0 28px rgba(212,175,55,0.85), 0 0 60px rgba(212,175,55,0.3)',
                    marginBottom: '0.3rem',
                  }}>Curse of Knowledge</h1>
                  <p style={{
                    fontFamily: 'Cinzel, serif',
                    fontSize: '0.6rem',
                    letterSpacing: '0.5em',
                    textTransform: 'uppercase',
                    color: 'rgba(245,245,220,0.35)',
                    marginBottom: '1.5rem',
                  }}>A Fantasy Study Quest</p>

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
                    onClick={() => { sounds.click(); start(); }}
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
                  <div className="rounded-xl p-5 border-2" style={{
                    background: 'linear-gradient(160deg, #1c1007 0%, #130d05 60%, #0e0a03 100%)',
                    borderColor: 'rgba(101,67,33,0.7)',
                    boxShadow: '0 4px 32px rgba(0,0,0,0.6), inset 0 0 60px rgba(0,0,0,0.4)'
                  }}>
                    {/* Board header */}
                    <div className="text-center mb-5">
                      <div className="flex items-center justify-center gap-3 mb-2">
                        <div style={{flex:1,height:'2px',background:'linear-gradient(to right,transparent,rgba(101,67,33,0.8))'}}></div>
                        <h2 style={{fontFamily:'Cinzel,serif',fontSize:'clamp(1rem,3vw,1.3rem)',fontWeight:900,letterSpacing:'0.3em',color:'rgba(212,175,55,0.9)',textShadow:'0 0 20px rgba(212,175,55,0.4)'}}>GUILD NOTICE BOARD</h2>
                        <div style={{flex:1,height:'2px',background:'linear-gradient(to left,transparent,rgba(101,67,33,0.8))'}}></div>
                      </div>
                      {tasks.length > 0 && (
                        <p style={{fontFamily:'Cinzel,serif',fontSize:'0.65rem',letterSpacing:'0.2em',color:'rgba(180,155,100,0.5)',textTransform:'uppercase'}}>Post a contract • complete your trials • earn your keep</p>
                      )}
                    </div>
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

                    {tasks.length === 0 ? (
                      <div className="text-center py-10">
                        <p style={{fontFamily:'Cinzel,serif',fontSize:'0.8rem',letterSpacing:'0.2em',color:'rgba(160,135,80,0.5)',textTransform:'uppercase'}}>The board is bare. Post a contract to begin.</p>
                      </div>
                    ) : (
                      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))',gap:'16px',padding:'4px 2px'}}>
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
        ? 'linear-gradient(160deg,#1a1a12,#141410)'
        : t.overdue
          ? 'linear-gradient(160deg,#2a0a08,#1c0806)'
          : t.priority === 'important'
            ? 'linear-gradient(160deg,#2a2008,#1c1605)'
            : 'linear-gradient(160deg,#1e1a0e,#16130a)',
      border: t.done
        ? '1px solid rgba(80,100,60,0.45)'
        : t.overdue
          ? '1px solid rgba(180,40,30,0.6)'
          : t.priority === 'important'
            ? '1px solid rgba(180,145,40,0.6)'
            : '1px solid rgba(101,82,40,0.45)',
      borderRadius: '4px',
      padding: '14px 14px 12px',
      boxShadow: t.overdue && !t.done
        ? '0 2px 16px rgba(180,30,20,0.25), inset 0 0 20px rgba(0,0,0,0.4)'
        : t.priority === 'important' && !t.done
          ? '0 2px 16px rgba(180,145,40,0.2), inset 0 0 20px rgba(0,0,0,0.4)'
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
      background: t.done ? 'rgba(80,120,60,0.8)' : t.overdue ? 'rgba(180,40,30,0.9)' : t.priority === 'important' ? 'rgba(180,145,40,0.9)' : 'rgba(120,90,40,0.8)',
      border: '1px solid rgba(255,255,255,0.15)',
      boxShadow: '0 1px 4px rgba(0,0,0,0.5)',
    }} />

    {/* Difficulty tag */}
    <div style={{marginBottom:'8px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
      <span style={{
        fontFamily:'Cinzel,serif', fontSize:'0.6rem', letterSpacing:'0.2em',
        textTransform:'uppercase', padding:'2px 6px', borderRadius:'2px',
        background: t.done ? 'rgba(60,90,40,0.4)' : t.overdue ? 'rgba(140,30,20,0.4)' : t.priority === 'important' ? 'rgba(120,95,20,0.4)' : 'rgba(60,50,20,0.4)',
        border: t.done ? '1px solid rgba(80,120,60,0.4)' : t.overdue ? '1px solid rgba(180,40,30,0.5)' : t.priority === 'important' ? '1px solid rgba(180,145,40,0.5)' : '1px solid rgba(101,82,40,0.35)',
        color: t.done ? 'rgba(120,180,80,0.8)' : t.overdue ? 'rgba(220,80,60,0.9)' : t.priority === 'important' ? 'rgba(212,175,55,0.9)' : 'rgba(160,135,80,0.7)',
      }}>
        {t.done ? '✓ Sealed' : t.overdue ? '⚠ Overdue' : t.priority === 'important' ? '★ Elite' : '▦ Common'}
      </span>
      {!t.done && (
        <span style={{fontSize:'0.62rem',color:'rgba(140,115,60,0.6)',fontFamily:'Cinzel,serif'}}>
          {t.priority === 'important' ? '1.25x XP' : '1.0x XP'}
        </span>
      )}
    </div>

    {/* Contract title */}
    <p style={{
      fontFamily:'Cinzel,serif',
      fontSize:'0.88rem',
      fontWeight:600,
      letterSpacing:'0.04em',
      lineHeight:1.45,
      color: t.done ? 'rgba(160,155,130,0.6)' : t.overdue ? 'rgba(230,150,130,0.95)' : 'rgba(220,205,165,0.95)',
      textDecoration: t.done ? 'line-through' : 'none',
      marginBottom:'10px',
      wordBreak:'break-word',
    }}>
      {t.title}
    </p>

    {/* Actions */}
    {!t.done && (
      <div style={{display:'flex',gap:'6px',justifyContent:'flex-end'}}>
        <button
          onClick={() => {
            sounds.click();
            setPomodoroTask(t);
            setShowPomodoro(true);
            setPomodoroTimer(25 * 60);
            setPomodorosCompleted(0);
            setIsBreak(false);
            setPomodoroRunning(true);
            addLog(`Starting focus session: ${t.title}`);
          }}
          style={{
            fontFamily:'Cinzel,serif',fontSize:'0.62rem',letterSpacing:'0.15em',
            padding:'4px 10px',borderRadius:'2px',
            background:'rgba(60,30,80,0.6)',border:'1px solid rgba(120,80,160,0.5)',
            color:'rgba(180,140,220,0.85)',cursor:'pointer',transition:'all 0.2s',
          }}
          onMouseEnter={e=>{e.currentTarget.style.background='rgba(80,40,110,0.8)';e.currentTarget.style.color='rgba(200,170,240,1)';}}
          onMouseLeave={e=>{e.currentTarget.style.background='rgba(60,30,80,0.6)';e.currentTarget.style.color='rgba(180,140,220,0.85)';}}
        >Focus</button>
        <button
          onClick={() => { sounds.click(); complete(t.id); }}
          style={{
            fontFamily:'Cinzel,serif',fontSize:'0.62rem',letterSpacing:'0.15em',
            padding:'4px 10px',borderRadius:'2px',
            background:'rgba(20,60,30,0.6)',border:'1px solid rgba(40,120,60,0.5)',
            color:'rgba(100,200,120,0.85)',cursor:'pointer',transition:'all 0.2s',
          }}
          onMouseEnter={e=>{e.currentTarget.style.background='rgba(25,80,40,0.8)';e.currentTarget.style.color='rgba(130,220,150,1)';}}
          onMouseLeave={e=>{e.currentTarget.style.background='rgba(20,60,30,0.6)';e.currentTarget.style.color='rgba(100,200,120,0.85)';}}
        >Complete</button>
      </div>
    )}
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
                    {(() => {
                      const completedTasks = tasks.filter(t => t.done).length;
                      const requiredTasks = Math.min(3, tasks.length);
                      const taskGateMet = tasks.length > 0 && completedTasks >= requiredTasks;
                      const isDisabled = !isDayActive || eliteBossDefeatedToday || !taskGateMet;
                      return (
                        <button
                          onClick={() => { sounds.click(); miniBoss(); }}
                          disabled={isDisabled}
                          className="px-8 py-6 rounded-xl font-bold text-xl transition-all border-2 disabled:cursor-not-allowed uppercase"
                          style={{
                            backgroundColor: isDisabled ? 'rgba(30, 41, 59, 0.5)' : 'rgba(30, 41, 59, 0.8)',
                            borderColor: taskGateMet && !eliteBossDefeatedToday && isDayActive
                              ? 'rgba(239,68,68,0.7)'
                              : isDisabled ? 'rgba(71, 85, 105, 0.5)' : 'rgba(71, 85, 105, 0.8)',
                            color: '#F5F5DC',
                            opacity: isDisabled ? 0.5 : 1,
                            boxShadow: taskGateMet && !eliteBossDefeatedToday && isDayActive
                              ? '0 0 18px rgba(239,68,68,0.25)' : 'none',
                          }}
                          onMouseEnter={(e) => { if (!isDisabled) e.currentTarget.style.backgroundColor = 'rgba(51, 65, 85, 0.9)'; }}
                          onMouseLeave={(e) => { if (!isDisabled) e.currentTarget.style.backgroundColor = 'rgba(30, 41, 59, 0.8)'; }}
                        >
                          <div className="text-center">
                            <div className="mb-2">BLOOD CONTRACT</div>
                            {!isDayActive ? (
                              <div className="text-xs font-normal uppercase" style={{color: '#9CA3AF'}}>Day dormant — add tasks to begin</div>
                            ) : eliteBossDefeatedToday ? (
                              <div className="text-xs font-normal uppercase" style={{color: '#4ADE80'}}>Today's trial complete</div>
                            ) : (
                              <div>
                                {/* Progress bar */}
                                <div style={{
                                  width: '100%', height: '4px', borderRadius: '2px',
                                  background: 'rgba(255,255,255,0.08)',
                                  overflow: 'hidden', marginBottom: '6px',
                                }}>
                                  <div style={{
                                    height: '100%',
                                    width: tasks.length === 0 ? '0%' : `${Math.min(100, (completedTasks / requiredTasks) * 100)}%`,
                                    background: taskGateMet
                                      ? 'linear-gradient(to right, #dc2626, #ef4444)'
                                      : 'linear-gradient(to right, #92400e, #d97706)',
                                    borderRadius: '2px',
                                    transition: 'width 0.4s ease',
                                    boxShadow: taskGateMet ? '0 0 6px rgba(239,68,68,0.6)' : 'none',
                                  }} />
                                </div>
                                <div className="text-xs font-normal uppercase" style={{
                                  color: taskGateMet ? '#ef4444' : '#FBBF24',
                                  letterSpacing: '0.05em',
                                }}>
                                  {tasks.length === 0
                                    ? 'Add tasks to unlock'
                                    : taskGateMet
                                      ? 'Guardian awakens'
                                      : `${completedTasks} / ${requiredTasks} tasks`}
                                </div>
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })()}
                    <button
  onClick={() => { sounds.click(); finalBoss(); }}
  disabled={!gauntletUnlocked || tasks.length === 0 || tasks.filter(t => t.done).length < tasks.length}
  className="px-8 py-6 rounded-xl font-bold text-xl transition-all border-2 disabled:cursor-not-allowed uppercase" style={{backgroundColor: (!gauntletUnlocked || tasks.length === 0 || tasks.filter(t => t.done).length < tasks.length) ? 'rgba(30, 41, 59, 0.5)' : 'rgba(30, 41, 59, 0.8)', borderColor: (!gauntletUnlocked || tasks.length === 0 || tasks.filter(t => t.done).length < tasks.length) ? 'rgba(71, 85, 105, 0.5)' : 'rgba(71, 85, 105, 0.8)', color: '#F5F5DC', opacity: (!gauntletUnlocked || tasks.length === 0 || tasks.filter(t => t.done).length < tasks.length) ? 0.5 : 1}} onMouseEnter={(e) => {if (gauntletUnlocked && tasks.length > 0 && tasks.filter(t => t.done).length >= tasks.length) e.currentTarget.style.backgroundColor = 'rgba(51, 65, 85, 0.9)'}} onMouseLeave={(e) => {if (gauntletUnlocked && tasks.length > 0 && tasks.filter(t => t.done).length >= tasks.length) e.currentTarget.style.backgroundColor = 'rgba(30, 41, 59, 0.8)'}}
>
  <div className="text-center">
    <div className="mb-2">THE BLACK CONTRACT</div>
    {!gauntletUnlocked && (
      <div className="text-xs font-normal uppercase" style={{color: '#9CA3AF'}}>{gauntletMilestone - xp} XP needed</div>
    )}
  </div>
</button>
                  </div>

                  {/* Raid Contract */}
                  {isDayActive && (() => {
                    const captDefeated = banditCaptainsDefeated?.length || 0;
                    const allCaptainsDown = captDefeated >= 3;
                    const nextWave = (banditWaveNumber || 0) + 1;
                    return (
                      <div className="mt-4 rounded-xl border-2 overflow-hidden" style={{
                        borderColor: 'rgba(180,40,30,0.6)',
                        background: 'linear-gradient(160deg, #1c0808 0%, #130505 60%, #0e0303 100%)',
                        boxShadow: '0 4px 24px rgba(180,30,20,0.2)',
                      }}>
                        <div className="px-5 pt-4 pb-2 flex items-center justify-between">
                          <div>
                            <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.6rem', letterSpacing: '0.25em', color: 'rgba(239,68,68,0.6)', textTransform: 'uppercase', marginBottom: '2px' }}>
                              Raid Contract
                            </p>
                            <p style={{ fontFamily: 'Cinzel, serif', fontSize: '1rem', fontWeight: 700, color: 'rgba(239,68,68,0.9)', letterSpacing: '0.1em' }}>
                              {allCaptainsDown ? 'BANDIT LORD CUTTER' : `BANDIT RAID — WAVE ${nextWave}`}
                            </p>
                            <p style={{ fontSize: '0.7rem', color: 'rgba(200,150,140,0.7)', marginTop: '4px' }}>
                              {allCaptainsDown
                                ? 'All captains fallen. Cutter awaits.'
                                : `Captains eliminated: ${captDefeated}/3`}
                            </p>
                          </div>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            {[0,1,2].map(i => (
                              <div key={i} style={{
                                width: 10, height: 10, borderRadius: '50%',
                                background: i < captDefeated ? '#EF4444' : 'rgba(239,68,68,0.15)',
                                border: `1px solid ${i < captDefeated ? 'rgba(239,68,68,0.8)' : 'rgba(239,68,68,0.3)'}`,
                              }} />
                            ))}
                          </div>
                        </div>
                        <div className="px-5 pb-4">
                          <button
                            onClick={() => { sounds.click(); onRaid(nextWave, banditCaptainsDefeated || []); }}
                            style={{
                              width: '100%', padding: '10px', borderRadius: '6px', fontFamily: 'Cinzel, serif',
                              fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase',
                              background: 'rgba(127,29,29,0.7)', border: '1px solid rgba(239,68,68,0.5)',
                              color: '#F5F5DC', cursor: 'pointer', transition: 'all 0.2s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(153,27,27,0.9)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.8)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(127,29,29,0.7)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.5)'; }}
                          >
                            {allCaptainsDown ? '⚔️ Confront the Bandit Lord' : '⚔️ Launch Raid'}
                          </button>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Daughters of Dusk Raid Contract */}
                  {isDayActive && (() => {
                    const captDefeated = daughtersCaptainsDefeated?.length || 0;
                    const allCaptainsDown = captDefeated >= 3;
                    const nextWave = (daughtersWaveNumber || 0) + 1;
                    return (
                      <div className="mt-4 rounded-xl border-2 overflow-hidden" style={{
                        borderColor: 'rgba(139,92,246,0.6)',
                        background: 'linear-gradient(160deg, #0e0814 0%, #090510 60%, #050308 100%)',
                        boxShadow: '0 4px 24px rgba(139,92,246,0.15)',
                      }}>
                        <div className="px-5 pt-4 pb-2 flex items-center justify-between">
                          <div>
                            <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.6rem', letterSpacing: '0.25em', color: 'rgba(139,92,246,0.6)', textTransform: 'uppercase', marginBottom: '2px' }}>
                              Raid Contract
                            </p>
                            <p style={{ fontFamily: 'Cinzel, serif', fontSize: '1rem', fontWeight: 700, color: 'rgba(167,139,250,0.9)', letterSpacing: '0.1em' }}>
                              {allCaptainsDown ? 'DUSK QUEEN MIRA' : `DAUGHTERS OF DUSK — WAVE ${nextWave}`}
                            </p>
                            <p style={{ fontSize: '0.7rem', color: 'rgba(180,160,220,0.6)', marginTop: '4px' }}>
                              {allCaptainsDown
                                ? 'All captains silenced. Mira awaits in the dark.'
                                : `Captains silenced: ${captDefeated}/3`}
                            </p>
                          </div>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            {[0,1,2].map(i => (
                              <div key={i} style={{
                                width: 10, height: 10, borderRadius: '50%',
                                background: i < captDefeated ? '#A855F7' : 'rgba(139,92,246,0.15)',
                                border: `1px solid ${i < captDefeated ? 'rgba(168,85,247,0.8)' : 'rgba(139,92,246,0.3)'}`,
                              }} />
                            ))}
                          </div>
                        </div>
                        <div className="px-5 pb-4">
                          <button
                            onClick={() => { sounds.click(); onDaughtersRaid(nextWave, daughtersCaptainsDefeated || []); }}
                            style={{
                              width: '100%', padding: '10px', borderRadius: '6px', fontFamily: 'Cinzel, serif',
                              fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase',
                              background: 'rgba(76,29,149,0.7)', border: '1px solid rgba(139,92,246,0.5)',
                              color: '#F5F5DC', cursor: 'pointer', transition: 'all 0.2s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(109,40,217,0.9)'; e.currentTarget.style.borderColor = 'rgba(167,139,250,0.8)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(76,29,149,0.7)'; e.currentTarget.style.borderColor = 'rgba(139,92,246,0.5)'; }}
                          >
                            {allCaptainsDown ? '🌑 Confront the Dusk Queen' : '🌑 Enter the Dusk'}
                          </button>
                        </div>
                      </div>
                    );
                  })()}

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

export default ContractsTab;
