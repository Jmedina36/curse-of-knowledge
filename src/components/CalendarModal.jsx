import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { COLORS } from '../constants';

const CalendarModal = ({
  selectedDate,
  setShowCalendarModal,
  calendarTasks,
  setCalendarTasks,
  calendarEvents,
  setCalendarEvents,
  calendarFocus,
  setCalendarFocus,
  newCalendarTask,
  setNewCalendarTask,
  newEvent,
  setNewEvent,
  newFocus,
  setNewFocus,
  getDateKey,
  addLog,
}) => {
  return (
  <div className="fixed inset-0 bg-black bg-opacity-90 flex items-start justify-center p-4 z-50 overflow-y-auto" onClick={() => setShowCalendarModal(false)}>
    <motion.div className="rounded-xl p-6 max-w-md w-full border-2 my-8" initial={{ opacity: 0, scale: 0.97, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.18, ease: 'easeOut' }} style={{background: 'linear-gradient(to bottom, rgba(15, 35, 45, 0.98), rgba(10, 25, 35, 0.98), rgba(8, 18, 25, 0.98))', borderColor: COLORS.gold, boxShadow: '0 0 15px rgba(212, 175, 55, 0.25), 0 0 30px rgba(212, 175, 55, 0.1), inset 0 0 40px rgba(0, 0, 0, 0.15)'}} onClick={e => e.stopPropagation()}>
      <div className="mb-6 relative">
        <button 
          onClick={() => setShowCalendarModal(false)} 
          className="absolute -top-2 -right-2 p-2 rounded-lg border-2 transition-all"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            borderColor: 'rgba(212, 175, 55, 0.4)',
            color: '#D4AF37'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
            e.currentTarget.style.borderColor = '#D4AF37';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
            e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.4)';
          }}
        >
          <X size={20}/>
        </button>
        <div className="text-center">
          <div className="text-4xl font-bold" style={{color: '#D4AF37', letterSpacing: '0.1em'}}>
  {(() => {
    const [year, month, day] = selectedDate.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const weekday = date.toLocaleDateString('default', { weekday: 'long' }).toUpperCase();
    const monthDay = date.toLocaleDateString('default', { month: 'long', day: 'numeric' }).toUpperCase();
    return (
      <>
        <div>{weekday}</div>
        <div className="text-2xl mt-1">{monthDay}</div>
      </>
    );
  })()}
</div>
          <div className="flex items-center justify-center gap-2 mt-2">
            <div style={{width: '100px', height: '1px', background: 'linear-gradient(to right, transparent, rgba(88, 180, 120, 0.3))'}}></div>
            <span style={{color: 'rgba(88, 180, 120, 0.4)', fontSize: '8px'}}>◆</span>
            <div style={{width: '100px', height: '1px', background: 'linear-gradient(to left, transparent, rgba(88, 180, 120, 0.3))'}}></div>
          </div>
        </div>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm mb-2 text-center" style={{color: COLORS.silver}}>Today's Focus Class</label>
        <div className="flex gap-2 mb-2">
          <input 
            type="text" 
            placeholder="e.g., Math, Physics, Chemistry..." 
            value={newFocus} 
            onChange={e => setNewFocus(e.target.value)} 
            spellCheck="true"
            autoCorrect="on"
            autoCapitalize="words"
            onKeyPress={e => {
              if (e.key === 'Enter' && newFocus.trim()) {
                setCalendarFocus(prev => ({...prev, [selectedDate]: newFocus.trim()}));
                setNewFocus('');
              }
            }}
            className="flex-1 p-3 rounded-lg border focus:outline-none" 
            style={{backgroundColor: 'rgba(0, 0, 0, 0.5)', color: '#F5F5DC', borderColor: 'rgba(88, 180, 120, 0.4)', fontFamily: 'Cinzel, serif', boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.2)'}}
            onFocus={e => {
              e.target.style.borderColor = 'rgba(88, 180, 120, 0.8)';
              // Pre-fill with current focus if exists
              if (!newFocus && calendarFocus[selectedDate]) {
                setNewFocus(calendarFocus[selectedDate]);
              }
            }}
            onBlur={e => e.target.style.borderColor = 'rgba(88, 180, 120, 0.4)'}
          />
          <button
            onClick={() => {
              if (newFocus.trim()) {
                setCalendarFocus(prev => ({...prev, [selectedDate]: newFocus.trim()}));
                setNewFocus('');
              }
            }}
            disabled={!newFocus.trim()}
            className="px-4 py-2 rounded-lg transition-all border-2"
            style={{
              backgroundColor: !newFocus.trim() ? '#2C3E50' : 'rgba(61, 107, 69, 0.85)',
              borderColor: !newFocus.trim() ? '#95A5A6' : 'rgba(88, 180, 120, 0.7)',
              color: '#F5F5DC',
              cursor: !newFocus.trim() ? 'not-allowed' : 'pointer',
              opacity: !newFocus.trim() ? 0.5 : 1
            }}
            onMouseEnter={(e) => {if (newFocus.trim()) e.currentTarget.style.backgroundColor = 'rgba(75, 130, 85, 0.95)'}}
            onMouseLeave={(e) => {if (newFocus.trim()) e.currentTarget.style.backgroundColor = 'rgba(61, 107, 69, 0.85)'}}
          >
            Save
          </button>
        </div>
        {calendarFocus[selectedDate] && (
          <div className="flex items-center justify-between p-2 rounded bg-gray-800/50">
            <span className="text-sm font-bold" style={{color: '#EF4444'}}>Current: {calendarFocus[selectedDate]}</span>
            <button
              onClick={() => {
                setCalendarFocus(prev => {
                  const updated = {...prev};
                  delete updated[selectedDate];
                  return updated;
                });
                setNewFocus('');
              }}
              className="text-red-400 hover:text-red-300"
            >
              <X size={16}/>
            </button>
          </div>
        )}
      </div>
      
      {/* Decorative divider */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <div style={{width: '100px', height: '1px', background: 'linear-gradient(to right, transparent, rgba(88, 180, 120, 0.3))'}}></div>
        <span style={{color: 'rgba(88, 180, 120, 0.4)', fontSize: '8px'}}>◆</span>
        <div style={{width: '100px', height: '1px', background: 'linear-gradient(to left, transparent, rgba(88, 180, 120, 0.3))'}}></div>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm mb-2 text-center" style={{color: COLORS.silver}}>Add Event</label>
        <div className="flex gap-2 mb-4">
          <input 
            type="text" 
            placeholder="e.g., Midterm Exam, Office Hours..." 
            value={newEvent} 
            onChange={e => setNewEvent(e.target.value)} 
            spellCheck="true"
            autoCorrect="on"
            autoCapitalize="words"
            onKeyPress={e => {
              if (e.key === 'Enter' && newEvent.trim()) {
                setCalendarEvents(prev => ({
                  ...prev,
                  [selectedDate]: [...(prev[selectedDate] || []), newEvent.trim()]
                }));
                setNewEvent('');
              }
            }}
            className="flex-1 p-3 rounded-lg border focus:outline-none" 
            style={{backgroundColor: 'rgba(0, 0, 0, 0.5)', color: '#F5F5DC', borderColor: 'rgba(88, 180, 120, 0.4)', fontFamily: 'Cinzel, serif', boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.2)'}}
            onFocus={e => e.target.style.borderColor = 'rgba(88, 180, 120, 0.8)'}
            onBlur={e => e.target.style.borderColor = 'rgba(88, 180, 120, 0.4)'}
          />
          <button
            onClick={() => {
              if (newEvent.trim()) {
                setCalendarEvents(prev => ({
                  ...prev,
                  [selectedDate]: [...(prev[selectedDate] || []), newEvent.trim()]
                }));
                setNewEvent('');
              }
            }}
            disabled={!newEvent.trim()}
            className="px-4 py-2 rounded-lg transition-all border-2"
            style={{
              backgroundColor: !newEvent.trim() ? '#2C3E50' : 'rgba(61, 107, 69, 0.85)',
              borderColor: !newEvent.trim() ? '#95A5A6' : 'rgba(88, 180, 120, 0.7)',
              color: '#F5F5DC',
              cursor: !newEvent.trim() ? 'not-allowed' : 'pointer',
              opacity: !newEvent.trim() ? 0.5 : 1
            }}
            onMouseEnter={(e) => {if (newEvent.trim()) e.currentTarget.style.backgroundColor = 'rgba(75, 130, 85, 0.95)'}}
            onMouseLeave={(e) => {if (newEvent.trim()) e.currentTarget.style.backgroundColor = 'rgba(61, 107, 69, 0.85)'}}
          >
            Add
          </button>
        </div>
        
        {/* Event list */}
        {calendarEvents[selectedDate] && Array.isArray(calendarEvents[selectedDate]) && calendarEvents[selectedDate].length > 0 && (
          <div className="space-y-2">
            {calendarEvents[selectedDate].map((event, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 rounded bg-gray-800/50">
                <span className="text-sm italic" style={{color: '#9CA3AF'}}>{event}</span>
                <button
                  onClick={() => {
                    setCalendarEvents(prev => ({
                      ...prev,
                      [selectedDate]: prev[selectedDate].filter((_, i) => i !== idx)
                    }));
                  }}
                  className="text-red-400 hover:text-red-300"
                >
                  <X size={16}/>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  </div>
  );
};

export default CalendarModal;
