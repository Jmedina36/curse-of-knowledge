import React from 'react';
import { Calendar, GripVertical, Plus, X } from 'lucide-react';
import { COLORS, GAME_CONSTANTS } from '../constants';

const PlannerTab = ({
  weeklyPlan,
  setWeeklyPlan,
  plannerSubTab,
  setPlannerSubTab,
  hidePlannerCompleted,
  setHidePlannerCompleted,
  currentMonth,
  setCurrentMonth,
  currentYear,
  setCurrentYear,
  calendarTasks,
  calendarEvents,
  calendarFocus,
  draggedPlanTask,
  setDraggedPlanTask,
  handlePlanDragEnd,
  handlePlanDragOver,
  getNextDayOfWeek,
  setSelectedDate,
  setSelectedDay,
  setShowCalendarModal,
  setShowPlanModal,
  addLog,
}) => {
  return (
            <div className="bg-black bg-opacity-50 rounded-xl p-6 border-2" style={{borderColor: 'rgba(212, 175, 55, 0.6)'}}>
              {/* Section header with decorative divider */}
              <div className="text-center mb-4">
                <h2 className="text-4xl font-bold mb-4" style={{color: '#D4AF37', letterSpacing: '0.15em'}}>BATTLE PLANNER</h2>
                <div className="flex items-center justify-center gap-2">
                  <div style={{width: '80px', height: '1px', background: 'linear-gradient(to right, transparent, rgba(212, 175, 55, 0.5))'}}></div>
                  <span style={{color: 'rgba(212, 175, 55, 0.6)', fontSize: '8px'}}>◆</span>
                  <div style={{width: '80px', height: '1px', background: 'linear-gradient(to left, transparent, rgba(212, 175, 55, 0.5))'}}></div>
                </div>
              </div>
              <p className="text-sm mb-6 italic text-center" style={{color: COLORS.silver}}>"Chart your path through the coming trials..."</p>
              
              {/* Sub-navigation tabs */}
              <div className="flex gap-2 justify-center mb-6">
                <button 
                  onClick={() => setPlannerSubTab('weekly')}
                  className="px-4 py-2 rounded-lg transition-all border-2"
                  style={{
                    backgroundColor: plannerSubTab === 'weekly' ? 'rgba(184, 134, 11, 0.5)' : 'rgba(30, 30, 30, 0.5)',
                    borderColor: plannerSubTab === 'weekly' ? '#D4AF37' : 'rgba(100, 100, 100, 0.5)',
                    color: '#F5F5DC'
                  }}
                >
                  Weekly Plan
                </button>
                <button 
                  onClick={() => setPlannerSubTab('calendar')}
                  className="px-4 py-2 rounded-lg transition-all border-2"
                  style={{
                    backgroundColor: plannerSubTab === 'calendar' ? 'rgba(184, 134, 11, 0.5)' : 'rgba(30, 30, 30, 0.5)',
                    borderColor: plannerSubTab === 'calendar' ? '#D4AF37' : 'rgba(100, 100, 100, 0.5)',
                    color: '#F5F5DC'
                  }}
                >
                  Calendar
                </button>
              </div>
              
              {/* Weekly Plan Content */}
              {plannerSubTab === 'weekly' && (
              <>
              <div className="grid gap-4">
                {Object.keys(weeklyPlan).map((day, dayIndex) => {
                  const dayTheme = GAME_CONSTANTS.DAY_NAMES[dayIndex] || { name: day, subtitle: '', theme: '' };
                  const today = new Date();
                  const todayDayName = today.toLocaleDateString('en-US', { weekday: 'long' });
                  const isToday = day === todayDayName;
                  
                  // Determine temporal status (past, today, future)
                  const dayOrder = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                  const todayIndex = dayOrder.indexOf(todayDayName);
                  const thisDayIndex = dayOrder.indexOf(day);
                  const isPast = thisDayIndex < todayIndex;
                  const isFuture = thisDayIndex > todayIndex;
                  
                  // Progressive emphasis styling
                  let cardStyle, titleColor, titleShadow, themeColor, borderColor, borderWidth, shadowStyle, dividerColor;
                  
                  if (isToday) {
                    // TODAY: Stand out ONLY when empty, blend in when filled
                    if (weeklyPlan[day].length > 0) {
                      // Has tasks - look like other days (blend in)
                      cardStyle = 'linear-gradient(135deg, rgba(15, 23, 42, 0.55) 0%, rgba(30, 41, 59, 0.42) 100%)';
                      titleColor = '#D4AF37';
                      titleShadow = 'none';
                      themeColor = '#DAA520';
                      borderColor = 'rgba(100, 116, 139, 0.35)';
                      borderWidth = '1px';
                      shadowStyle = '0 2px 4px rgba(0, 0, 0, 0.2)';
                    } else {
                      // Empty - stand out with golden glow
                      cardStyle = 'linear-gradient(to bottom, rgba(42, 36, 28, 0.97), rgba(26, 22, 18, 0.97))';
                      titleColor = '#D4AF37';
                      titleShadow = '0 0 8px rgba(212, 175, 55, 0.6)';
                      themeColor = '#DAA520';
                      borderColor = '#D4AF37';
                      borderWidth = '2px';
                      shadowStyle = '0 8px 16px rgba(0, 0, 0, 0.5), 0 0 12px rgba(212, 175, 55, 0.1)';
                    }
                    dividerColor = 'rgba(212, 175, 55, 0.5)';
                  } else if (isFuture) {
                    // FUTURE: 70% opacity, no glow, thinner border, muted colors
                    cardStyle = 'linear-gradient(135deg, rgba(15, 23, 42, 0.55) 0%, rgba(30, 41, 59, 0.42) 100%)';
                    titleColor = 'rgba(192, 192, 192, 0.75)'; // +5% brightness for legibility
                    titleShadow = 'none';
                    themeColor = 'rgba(156, 163, 175, 0.6)';
                    borderColor = 'rgba(100, 116, 139, 0.35)';
                    borderWidth = '1px';
                    shadowStyle = '0 2px 4px rgba(0, 0, 0, 0.2)';
                    dividerColor = 'rgba(156, 163, 175, 0.25)';
                  } else {
                    // PAST: 50% opacity, desaturated, subdued, no emphasis
                    cardStyle = 'linear-gradient(135deg, rgba(15, 23, 42, 0.4) 0%, rgba(30, 41, 59, 0.3) 100%)';
                    titleColor = 'rgba(156, 163, 175, 0.55)'; // +5% brightness for legibility
                    titleShadow = 'none';
                    themeColor = 'rgba(156, 163, 175, 0.4)';
                    borderColor = 'rgba(100, 116, 139, 0.25)';
                    borderWidth = '1px';
                    shadowStyle = '0 1px 2px rgba(0, 0, 0, 0.15)';
                    dividerColor = 'rgba(156, 163, 175, 0.2)';
                  }
                  
                  return (
                  <div 
                    key={day} 
                    className="rounded-lg p-6 relative overflow-hidden transition-all duration-300" 
                    style={{
                      background: cardStyle,
                      borderColor: borderColor,
                      borderWidth: borderWidth,
                      borderStyle: 'solid',
                      boxShadow: shadowStyle,
                      opacity: isPast ? 0.85 : 1
                    }}
                  >
                    {/* Day header with medieval styling */}
                    <div className="flex justify-between items-center mb-4 relative z-10">
                      <div className="flex-1 text-center">
                        <div className="mb-2">
                          <h3 className="text-2xl font-bold uppercase mb-1" style={{
                            color: titleColor,
                            fontFamily: 'Cinzel, serif',
                            letterSpacing: '0.15em',
                            textShadow: titleShadow
                          }}>
                            {day}
                          </h3>
                          {dayTheme.theme && (
                            <p className="text-xs italic mt-1" style={{color: themeColor}}>
                              "{dayTheme.theme}"
                            </p>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <div style={{width: '60px', height: '1px', background: `linear-gradient(to right, transparent, ${dividerColor})`}}></div>
                          <span style={{color: dividerColor, fontSize: '8px'}}>◆</span>
                          <div style={{width: '60px', height: '1px', background: `linear-gradient(to left, transparent, ${dividerColor})`}}></div>
                        </div>
                        
                        <p className="text-xs mb-2">
                          {isToday ? (
                            <span className="font-bold px-3 py-1 rounded-lg" style={{
                              color: '#1C1C1C',
                              background: 'linear-gradient(to right, #D4AF37, #DAA520)',
                              boxShadow: '0 2px 8px rgba(212, 175, 55, 0.4)'
                            }}>
                              TODAY
                            </span>
                          ) : (
                            <span style={{color: '#9CA3AF'}}>
                              {getNextDayOfWeek(day).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                          )}
                        </p>
                        
                        {weeklyPlan[day].length === 0 && (
                          <div className="mt-4 p-3 rounded-lg border border-dashed" style={{
                            borderColor: isToday ? 'rgba(212, 175, 55, 0.3)' : 'rgba(156, 163, 175, 0.2)',
                            backgroundColor: 'rgba(0, 0, 0, 0.2)'
                          }}>
                            <p className="text-sm italic" style={{
                              color: isToday ? 'rgba(156, 163, 175, 0.8)' : 'rgba(156, 163, 175, 0.5)'
                            }}>
                              No battles planned... yet.
                            </p>
                          </div>
                        )}
                      </div>
                      
                      <button 
                        onClick={() => { setSelectedDay(day); setShowPlanModal(true); }} 
                        className="px-4 py-2 rounded-lg text-sm transition-all flex items-center gap-2 ml-4" 
                        style={{
                          background: isToday
                            ? 'linear-gradient(to bottom, rgba(184, 134, 11, 0.8), rgba(161, 117, 10, 0.8))' 
                            : isFuture
                              ? 'linear-gradient(to bottom, rgba(120, 53, 15, 0.7), rgba(92, 40, 11, 0.7))'
                              : 'linear-gradient(to bottom, rgba(100, 43, 12, 0.6), rgba(76, 33, 9, 0.6))',
                          borderColor: isToday ? '#D4AF37' : isFuture ? 'rgba(212, 175, 55, 0.6)' : 'rgba(212, 175, 55, 0.45)',
                          borderWidth: isToday ? '2px' : '1.5px',
                          borderStyle: 'solid',
                          color: isToday ? '#1C1C1C' : isFuture ? 'rgba(212, 175, 55, 0.85)' : 'rgba(192, 192, 192, 0.7)',
                          boxShadow: isToday ? '0 0 15px rgba(212, 175, 55, 0.3)' : 'none'
                        }} 
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = isToday
                            ? 'linear-gradient(to bottom, rgba(212, 175, 55, 0.95), rgba(184, 134, 11, 0.95))' 
                            : isFuture
                              ? 'linear-gradient(to bottom, rgba(120, 53, 15, 0.85), rgba(92, 40, 11, 0.85))'
                              : 'linear-gradient(to bottom, rgba(100, 43, 12, 0.75), rgba(76, 33, 9, 0.75))';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                        }} 
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = isToday 
                            ? 'linear-gradient(to bottom, rgba(184, 134, 11, 0.8), rgba(161, 117, 10, 0.8))' 
                            : isFuture
                              ? 'linear-gradient(to bottom, rgba(120, 53, 15, 0.7), rgba(92, 40, 11, 0.7))'
                              : 'linear-gradient(to bottom, rgba(100, 43, 12, 0.6), rgba(76, 33, 9, 0.6))';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                      >
                        <Plus size={16}/> ADD TASK
                      </button>
                    </div>
                    
                    {weeklyPlan[day].length > 0 && (
                      <div className="space-y-2">
                      {[...weeklyPlan[day]].sort((a, b) => {
  // Incomplete tasks first, completed tasks last
  if (!a.completed && b.completed) return -1;
  if (a.completed && !b.completed) return 1;
  
  // Among incomplete: sort by priority
  if (!a.completed && !b.completed) {
    if (a.priority === 'important' && b.priority !== 'important') return -1;
    if (a.priority !== 'important' && b.priority === 'important') return 1;
  }
  return 0;
})
.filter(item => !hidePlannerCompleted || !item.completed)
.map((item) => {
  const idx = weeklyPlan[day].indexOf(item);
  return (
    <div 
      key={idx} 
      className={`rounded-lg p-4 transition-all duration-300 ${
        item.completed 
          ? 'opacity-60' 
          : ''
      }`}
      style={{
        background: item.completed 
          ? 'rgba(30, 41, 59, 0.4)' 
          : item.priority === 'important'
            ? 'linear-gradient(to right, rgba(184, 134, 11, 0.15), rgba(31, 41, 55, 0.6))'
            : 'linear-gradient(to right, rgba(30, 58, 95, 0.2), rgba(31, 41, 55, 0.6))',
        borderColor: item.completed 
          ? 'rgba(34, 197, 94, 0.6)' 
          : item.priority === 'important'
            ? COLORS.gold
            : 'rgba(59, 130, 246, 0.5)',
        borderWidth: isToday ? '2px' : '1px',
        borderStyle: 'solid',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: item.priority === 'important' && !item.completed && isToday
          ? `0 0 20px ${COLORS.gold}99`
          : item.completed
            ? '0 1px 3px rgba(0, 0, 0, 0.1)'
            : isToday 
              ? '0 2px 4px rgba(0, 0, 0, 0.2)'
              : '0 1px 2px rgba(0, 0, 0, 0.15)',
        opacity: isPast ? 0.7 : 1,
        filter: isPast ? 'saturate(0.7)' : 'none'
      }}
      draggable={!item.completed}
      onDragStart={(e) => handlePlanDragStart(e, {...item, day})}
      onDragEnd={handlePlanDragEnd}
      onDragOver={handlePlanDragOver}
      onDrop={(e) => handlePlanDrop(e, item, day)}
    >
      {/* COMPLETED watermark - centered horizontally */}
      {item.completed && (
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
        {!item.completed && (
          <div style={{opacity: 0.3, cursor: 'grab'}} onMouseEnter={(e) => e.currentTarget.style.opacity = 0.7} onMouseLeave={(e) => e.currentTarget.style.opacity = 0.3}>
            <GripVertical size={20} style={{color: '#C0C0C0'}}/>
          </div>
        )}
        <div className="flex-1">
          <p className={`font-medium ${item.completed ? 'line-through text-gray-500' : 'text-white'}`}>
            {item.title}
            {item.priority === 'important' && (
              <span className="text-xs ml-2" style={{color: COLORS.gold}}>• IMPORTANT</span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => {
              const today = new Date();
              const todayDayName = today.toLocaleDateString('en-US', { weekday: 'long' });
              const isToday = day === todayDayName;
              
              const confirmMsg = isToday 
                ? `Delete "${item.title}" from today's plan? This will also remove it from your quest tasks.`
                : `Delete "${item.title}" from ${day}'s plan?`;
              
              if (window.confirm(confirmMsg)) {
                // Remove from weekly plan
                setWeeklyPlan(prev => ({
                  ...prev,
                  [day]: prev[day].filter((_, i) => i !== idx)
                }));
                
                // Only remove from quest tab if deleting from today
                if (isToday) {
                  setTasks(prevTasks => prevTasks.filter(t => t.title !== item.title));
                  addLog(`Deleted "${item.title}" from today's plan and tasks`);
                } else {
                  addLog(`Deleted "${item.title}" from ${day} plan`);
                }
              }
            }}
            className="text-red-400 hover:text-red-300"
          >
            <X size={16}/>
          </button>
        </div>
      </div>
    </div>
  );
})}
    
                      </div>
                    )}
                  </div>
                  );
                })}
              </div>
              
              {/* Hide completed tasks toggle - global for all days */}
              {Object.values(weeklyPlan).some(dayTasks => dayTasks.some(t => t.completed)) && (
                <div className="flex items-center justify-center gap-2 py-3 mt-4">
                  <input 
                    type="checkbox" 
                    id="hidePlannerCompleted"
                    checked={hidePlannerCompleted}
                    onChange={(e) => setHidePlannerCompleted(e.target.checked)}
                    className="w-4 h-4 cursor-pointer"
                    style={{accentColor: '#D4AF37'}}
                  />
                  <label 
                    htmlFor="hidePlannerCompleted" 
                    className="text-sm cursor-pointer"
                    style={{color: '#C0C0C0'}}
                  >
                    Hide completed tasks
                  </label>
                </div>
              )}
              </>
              )}
              
              {/* Calendar Content */}
              {plannerSubTab === 'calendar' && (
              <div>
              <div className="flex justify-between items-center mb-6">
                <button onClick={() => { if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1); } else { setCurrentMonth(currentMonth - 1); } }} className="px-4 py-2 rounded-lg transition-all border-2 font-bold" style={{
                  background: 'linear-gradient(to bottom, rgba(51, 65, 85, 0.7), rgba(30, 41, 59, 0.8))',
                  borderColor: 'rgba(100, 116, 139, 0.6)',
                  color: '#F5F5DC',
                  cursor: 'pointer'
                }} onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(to bottom, rgba(71, 85, 105, 0.8), rgba(51, 65, 85, 0.9))';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }} onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(to bottom, rgba(51, 65, 85, 0.7), rgba(30, 41, 59, 0.8))';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}>
                  ← PREV
                </button>
                <h3 className="text-2xl font-bold uppercase tracking-wider" style={{color: '#F5F5DC'}}>{new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long' }).toUpperCase()} {currentYear}</h3>
                <button onClick={() => { if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1); } else { setCurrentMonth(currentMonth + 1); } }} className="px-4 py-2 rounded-lg transition-all border-2 font-bold" style={{
                  background: 'linear-gradient(to bottom, rgba(51, 65, 85, 0.7), rgba(30, 41, 59, 0.8))',
                  borderColor: 'rgba(100, 116, 139, 0.6)',
                  color: '#F5F5DC',
                  cursor: 'pointer'
                }} onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(to bottom, rgba(71, 85, 105, 0.8), rgba(51, 65, 85, 0.9))';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }} onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(to bottom, rgba(51, 65, 85, 0.7), rgba(30, 41, 59, 0.8))';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}>
                  NEXT →
                </button>
              </div>
              
              <div className="rounded-lg p-6" style={{backgroundColor: 'rgba(0, 0, 0, 0.4)'}}>
                <div className="grid grid-cols-7 gap-3 mb-4">
                  {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (<div key={day} className="text-center font-bold text-sm py-2" style={{color: '#9CA3AF'}}>{day}</div>))}
                </div>
                
                <div className="grid grid-cols-7 gap-3">
                  {(() => {
                    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
                    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
                    const today = new Date();
                    const isCurrentMonth = today.getMonth() === currentMonth && today.getFullYear() === currentYear;
                    const days = [];
                    for (let i = 0; i < firstDay; i++) { days.push(<div key={`empty-${i}`} className="aspect-square"></div>); }
                    for (let day = 1; day <= daysInMonth; day++) {
                      const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                      const isToday = isCurrentMonth && today.getDate() === day;
                      const isPast = isCurrentMonth ? day < today.getDate() : (currentYear < today.getFullYear() || (currentYear === today.getFullYear() && currentMonth < today.getMonth()));
                      const isFuture = isCurrentMonth ? day > today.getDate() : (currentYear > today.getFullYear() || (currentYear === today.getFullYear() && currentMonth > today.getMonth()));
                      
                      // Progressive emphasis styling
                      let bgColor, borderColor, borderWidth, textColor, shadowStyle;
                      
                      if (isToday) {
                        // TODAY: Bright gold, subtle glow, sharp
                        bgColor = 'rgba(234, 179, 8, 0.4)';
                        borderColor = '#E8C547'; // Brighter gold like day titles
                        borderWidth = '2px';
                        textColor = '#E8C547'; // Bright gold text
                        shadowStyle = '0 0 12px rgba(234, 179, 8, 0.4), 0 2px 4px rgba(0, 0, 0, 0.3)';
                      } else if (isFuture) {
                        // FUTURE: 80-85% brightness, clear, readable
                        bgColor = 'rgba(30, 41, 59, 0.5)';
                        borderColor = 'rgba(100, 116, 139, 0.4)';
                        borderWidth = '1px';
                        textColor = 'rgba(245, 245, 220, 0.85)'; // 85% brightness
                        shadowStyle = '0 1px 3px rgba(0, 0, 0, 0.15)';
                      } else if (isPast) {
                        // PAST: 60-70% brightness, muted, subdued
                        bgColor = 'rgba(30, 41, 59, 0.3)';
                        borderColor = 'rgba(100, 116, 139, 0.25)';
                        borderWidth = '1px';
                        textColor = 'rgba(156, 163, 175, 0.65)'; // 65% brightness
                        shadowStyle = '0 1px 2px rgba(0, 0, 0, 0.1)';
                      } else {
                        // OTHER MONTH: Very muted
                        bgColor = 'rgba(30, 41, 59, 0.3)';
                        borderColor = 'rgba(51, 65, 85, 0.3)';
                        borderWidth = '1px';
                        textColor = 'rgba(156, 163, 175, 0.5)';
                        shadowStyle = '0 1px 2px rgba(0, 0, 0, 0.1)';
                      }
                      
                      days.push(
                        <button 
                          key={day} 
                          onClick={() => { setSelectedDate(dateKey); setShowCalendarModal(true); }} 
                          className="aspect-square rounded-lg p-2 transition-all hover:scale-105 relative flex flex-col items-center justify-center"
                          style={{
                            backgroundColor: bgColor, 
                            borderColor: borderColor,
                            borderWidth: borderWidth,
                            borderStyle: 'solid',
                            boxShadow: shadowStyle
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(1.05)';
                            if (isToday) {
                              e.currentTarget.style.boxShadow = '0 0 16px rgba(234, 179, 8, 0.5), 0 4px 8px rgba(0, 0, 0, 0.3)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.boxShadow = shadowStyle;
                          }}
                        >
                          <div className="text-lg font-bold" style={{color: textColor}}>{day}</div>
                          {calendarFocus[dateKey] && (
                            <div className="text-sm mt-1 text-center truncate w-full px-1 font-bold" style={{color: '#EF4444'}}>
                              {calendarFocus[dateKey]}
                            </div>
                          )}
                          {calendarEvents[dateKey] && Array.isArray(calendarEvents[dateKey]) && calendarEvents[dateKey].length > 0 && (
                            <div className="text-xs mt-1 text-center w-full px-1" style={{
                              color: isToday ? 'rgba(218, 165, 32, 0.9)' : 'rgba(156, 163, 175, 0.7)'
                            }}>
                              {calendarEvents[dateKey].length} event{calendarEvents[dateKey].length > 1 ? 's' : ''}
                            </div>
                          )}
                          {isToday && (<div className="absolute top-1 right-1 w-2 h-2 rounded-full animate-pulse" style={{backgroundColor: '#FBBF24'}}></div>)}
                        </button>
                      );
                    }
                    return days;
                  })()}
                </div>
              </div>
              </div>
              )}
            </div>
  );
};

export default PlannerTab;
