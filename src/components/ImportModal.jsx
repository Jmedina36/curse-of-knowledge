import React from 'react';
import { X } from 'lucide-react';
import { COLORS } from '../constants';

const ImportModal = ({
  setShowImportModal,
  importFromPlanner,
  flashcardDecks,
  setFlashcardDecks,
  addLog,
  updateAchievementStat,
}) => {
  return (
  <div className="fixed inset-0 bg-black bg-opacity-90 flex items-start justify-center p-4 z-50 overflow-y-auto" onClick={() => setShowImportModal(false)}>
    <div className="rounded-xl p-6 max-w-md w-full border-2 relative" style={{background: 'linear-gradient(to bottom, rgba(15, 35, 45, 0.98), rgba(10, 25, 35, 0.98), rgba(8, 18, 25, 0.98))', borderColor: COLORS.gold, boxShadow: '0 0 12px rgba(212, 175, 55, 0.25), 0 0 20px rgba(212, 175, 55, 0.1)'}} onClick={e => e.stopPropagation()}>
      <div className="mb-6 relative">
        <button 
          onClick={() => setShowImportModal(false)} 
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
          <h3 className="text-3xl font-bold mb-2" style={{color: '#D4AF37', letterSpacing: '0.1em'}}>IMPORT FROM PLANNER</h3>
          <div className="flex items-center justify-center gap-2 mb-2">
            <div style={{width: '100px', height: '1px', background: 'linear-gradient(to right, transparent, rgba(212, 175, 55, 0.3))'}}></div>
            <span style={{color: 'rgba(212, 175, 55, 0.4)', fontSize: '8px'}}>◆</span>
            <div style={{width: '100px', height: '1px', background: 'linear-gradient(to left, transparent, rgba(212, 175, 55, 0.3))'}}></div>
          </div>
          <p className="text-sm mt-2 italic" style={{color: COLORS.silver}}>"Draw upon your prepared plans..."</p>
        </div>
      </div>
      
      <div className="space-y-2">
        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day, idx) => {
          const taskCount = weeklyPlan[day]?.length || 0;
          // Highlight real-world current day, not game day
          const today = new Date();
          const todayDayIndex = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
          const realWorldDayIndex = todayDayIndex === 0 ? 6 : todayDayIndex - 1; // Convert to 0=Monday, 6=Sunday
          const isRealWorldToday = idx === realWorldDayIndex;
          
          return (
            <button
              key={day}
              onClick={() => importFromPlanner(day)}
              disabled={taskCount === 0}
              className="w-full p-4 rounded-lg border-2 transition-all text-left"
              style={{
                backgroundColor: isRealWorldToday 
                  ? 'rgba(0, 82, 82, 0.45)' 
                  : taskCount > 0 
                    ? 'rgba(0, 0, 0, 0.3)' 
                    : 'rgba(0, 0, 0, 0.3)',
                borderColor: isRealWorldToday 
                  ? 'rgba(93, 211, 211, 0.7)' 
                  : taskCount > 0 
                    ? 'rgba(128, 128, 128, 0.3)' 
                    : 'rgba(128, 128, 128, 0.3)',
                opacity: taskCount === 0 ? 0.5 : 1,
                cursor: taskCount === 0 ? 'not-allowed' : 'pointer'
              }}
              onMouseEnter={(e) => {
                if (taskCount > 0 && !isRealWorldToday) {
                  e.currentTarget.style.borderColor = 'rgba(93, 211, 211, 0.6)';
                  e.currentTarget.style.borderLeft = '3px solid rgba(93, 211, 211, 0.7)';
                  e.currentTarget.style.backgroundColor = 'rgba(0, 50, 50, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (taskCount > 0 && !isRealWorldToday) {
                  e.currentTarget.style.borderColor = 'rgba(128, 128, 128, 0.3)';
                  e.currentTarget.style.borderLeft = '2px solid transparent';
                  e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
                }
              }}
            >
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-bold" style={{color: '#F5F5DC'}}>{day}</span>
                  {isRealWorldToday && <span className="ml-2 text-xs" style={{color: '#5DD3D3'}}>(Today)</span>}
                </div>
                <span className="text-sm" style={{color: taskCount > 0 ? '#68D391' : COLORS.silver}}>
                  {taskCount} task{taskCount !== 1 ? 's' : ''}
                </span>
              </div>
            </button>
          );
        })}
      </div>
      
      <button 
        onClick={() => setShowImportModal(false)} 
        className="w-full mt-4 py-2 rounded-lg transition-all border-2"
        style={{backgroundColor: 'rgba(30, 50, 50, 0.6)', borderColor: 'rgba(128, 128, 128, 0.4)', color: '#F5F5DC'}}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(35, 60, 60, 0.7)';
          e.currentTarget.style.borderColor = 'rgba(93, 211, 211, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(30, 50, 50, 0.6)';
          e.currentTarget.style.borderColor = 'rgba(128, 128, 128, 0.4)';
        }}
      >
        Cancel
      </button>
    </div>
  </div>
  );
};

export default ImportModal;
