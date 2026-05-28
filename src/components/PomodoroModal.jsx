import React from 'react';
import { X } from 'lucide-react';
import { COLORS } from '../constants';

const PomodoroModal = ({
  pomodoroTask,
  pomodoroTimer,
  pomodoroRunning,
  setPomodoroRunning,
  isBreak,
  setIsBreak,
  pomodorosCompleted,
  setPomodorosCompleted,
  setShowPomodoro,
  setPomodoroTask,
  setPomodoroTimer,
  addLog,
}) => {
  return (
  <div className="fixed inset-0 bg-black bg-opacity-90 flex items-start justify-center p-4 z-50 overflow-y-auto">
    <div className="rounded-xl p-12 max-w-2xl w-full border-2 relative my-8" style={{
      background: 'linear-gradient(to bottom, rgba(60, 10, 10, 0.95), rgba(40, 0, 0, 0.95), rgba(20, 0, 10, 0.95))',
      borderColor: COLORS.gold,
      boxShadow: '0 0 15px rgba(212, 175, 55, 0.25), 0 0 30px rgba(212, 175, 55, 0.1)'
    }}>
      <div className="mb-6 relative">
        <button 
          onClick={() => {
            setShowPomodoro(false);
            setPomodoroTask(null);
            setPomodoroRunning(false);
            addLog(`Focus session ended. Completed ${pomodorosCompleted} pomodoro${pomodorosCompleted !== 1 ? 's' : ''}.`);
          }}
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
          <h2 className="text-3xl font-bold mb-2" style={{
            color: '#D4AF37',
            letterSpacing: '0.1em',
            fontFamily: 'Cinzel, serif'
          }}>
            {isBreak ? 'RESPITE' : 'DEEP FOCUS'}
          </h2>
          <p className="text-sm italic mb-4" style={{color: COLORS.silver}}>
            {isBreak ? '"Rest now, warrior. The battle awaits."' : '"Through focus, victory is forged."'}
          </p>
          <div className="flex items-center justify-center gap-2 mb-4">
            <div style={{width: '120px', height: '1px', background: 'linear-gradient(to right, transparent, rgba(212, 175, 55, 0.3))'}}></div>
            <span style={{color: 'rgba(212, 175, 55, 0.4)', fontSize: '8px'}}>◆</span>
            <div style={{width: '120px', height: '1px', background: 'linear-gradient(to left, transparent, rgba(212, 175, 55, 0.3))'}}></div>
          </div>
          <p className="text-xl mb-8" style={{color: COLORS.silver}}>{pomodoroTask.title}</p>
        </div>
      </div>
      
      <div className="text-center">
        <div className="mb-8">
          <div className="text-8xl font-bold mb-4" style={{color: '#F5F5DC'}}>
            {Math.floor(pomodoroTimer / 60)}:{String(pomodoroTimer % 60).padStart(2, '0')}
          </div>
          <div className="text-lg" style={{color: '#95A5A6'}}>
            {isBreak ? '5 minute respite' : '25 minute battle'}
          </div>
        </div>
        
        <div className="mb-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-xl" style={{color: '#F5F5DC'}}>Sessions Completed: {pomodorosCompleted}</span>
          </div>
          <div className="rounded-full h-3 overflow-hidden" style={{background: 'rgba(0, 0, 0, 0.4)'}}>
            <div 
              className="h-3 rounded-full transition-all"
              style={{
                width: `${((isBreak ? 5 * 60 : 25 * 60) - pomodoroTimer) / (isBreak ? 5 * 60 : 25 * 60) * 100}%`,
                background: isBreak 
                  ? 'linear-gradient(to right, #52C77A, #84E1A0)' 
                  : 'linear-gradient(to right, #B8860B, #D4AF37)'
              }}
            ></div>
          </div>
        </div>
        
        <div className="flex gap-4 justify-center mb-6">
          <button 
            onClick={() => setPomodoroRunning(!pomodoroRunning)}
            className="px-8 py-3 rounded-lg font-bold text-xl transition-all border-2"
            style={{
              backgroundColor: 'rgba(139, 0, 0, 0.6)',
              borderColor: '#8B0000',
              color: '#F5F5DC'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(139, 0, 0, 0.8)';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(139, 0, 0, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(139, 0, 0, 0.6)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '';
            }}
          >
            {pomodoroRunning ? 'Pause' : 'Resume'}
          </button>
          
          {isBreak && (
            <button 
              onClick={() => {
                setIsBreak(false);
                setPomodoroTimer(25 * 60);
                setPomodoroRunning(true);
                addLog('Skipped break - back to work!');
              }}
              className="px-8 py-3 rounded-lg font-bold text-xl transition-all border-2"
              style={{
                backgroundColor: 'rgba(184, 134, 11, 0.6)',
                borderColor: '#B8860B',
                color: '#F5F5DC'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(184, 134, 11, 0.8)';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(184, 134, 11, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(184, 134, 11, 0.6)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '';
              }}
            >
              Skip Break
            </button>
          )}
        </div>
      </div>
    </div>
  </div>
  );
};

export default PomodoroModal;
