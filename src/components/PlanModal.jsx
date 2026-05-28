import React from 'react';
import { COLORS } from '../constants';

const PlanModal = ({
  selectedDay,
  setShowPlanModal,
  newPlanItem,
  setNewPlanItem,
  addPlanTask,
}) => {
  return (
  <div className="fixed inset-0 bg-black bg-opacity-90 flex items-start justify-center p-4 z-50 overflow-y-auto" onClick={() => setShowPlanModal(false)}>
    <div className="rounded-xl p-6 max-w-md w-full border-2" style={{background: 'linear-gradient(to bottom, rgba(10, 40, 60, 0.95), rgba(5, 28, 45, 0.95), rgba(0, 18, 32, 0.95))', borderColor: COLORS.gold, boxShadow: '0 0 15px rgba(212, 175, 55, 0.25), 0 0 30px rgba(212, 175, 55, 0.1)'}} onClick={e => e.stopPropagation()}>
      <div className="mb-6">
        <div className="text-center">
          <h3 className="text-3xl font-bold mb-2" style={{color: '#D4AF37', letterSpacing: '0.1em'}}>PLAN FOR {selectedDay.toUpperCase()}</h3>
          <div className="flex items-center justify-center gap-2">
            <div style={{width: '100px', height: '1px', background: 'linear-gradient(to right, transparent, rgba(212, 175, 55, 0.3))'}}></div>
            <span style={{color: 'rgba(212, 175, 55, 0.4)', fontSize: '8px'}}>◆</span>
            <div style={{width: '100px', height: '1px', background: 'linear-gradient(to left, transparent, rgba(212, 175, 55, 0.3))'}}></div>
          </div>
        </div>
      </div>
      
      <input 
        type="text" 
        placeholder="What do you need to do?" 
        value={newPlanItem.title} 
        onChange={e => setNewPlanItem({...newPlanItem, title: e.target.value})} 
        spellCheck="true"
        autoCorrect="on"
        autoCapitalize="sentences"
        onKeyDown={e => {
          if (e.key === 'Enter' && newPlanItem.title) {
            addPlanTask();
          }
        }}
        className="w-full p-3 rounded-lg mb-4 border focus:outline-none" 
        style={{backgroundColor: 'rgba(0, 0, 0, 0.4)', color: '#F5F5DC', borderColor: 'rgba(96, 165, 250, 0.3)', fontFamily: 'Cinzel, serif'}}
        onFocus={e => e.target.style.borderColor = '#60A5FA'}
        onBlur={e => e.target.style.borderColor = 'rgba(96, 165, 250, 0.3)'}
        autoFocus 
      />
      
      <div className="mb-4">
        <label className="block text-sm mb-2 text-center" style={{color: COLORS.silver}}>Priority Level</label>
        <div className="grid grid-cols-2 gap-3">
          <button 
            type="button" 
            onClick={() => setNewPlanItem({...newPlanItem, priority: 'important'})} 
            className="p-4 rounded-lg border-2 transition-all"
            style={{
              backgroundColor: newPlanItem.priority === 'important' ? 'rgba(194, 144, 21, 0.35)' : 'rgba(0, 0, 0, 0.3)',
              borderColor: newPlanItem.priority === 'important' ? 'rgba(212, 175, 55, 0.7)' : 'rgba(128, 128, 128, 0.3)',
              color: '#F5F5DC',
              boxShadow: newPlanItem.priority === 'important' ? 'inset 0 1px 0 rgba(212, 175, 55, 0.1)' : 'none'
            }}
          >
            <div className="font-bold">IMPORTANT</div>
            <div className="text-xs mt-1" style={{color: COLORS.gold}}>1.25x XP</div>
          </button>
          
          <button 
            type="button" 
            onClick={() => setNewPlanItem({...newPlanItem, priority: 'routine'})} 
            className="p-4 rounded-lg border-2 transition-all"
            style={{
              backgroundColor: newPlanItem.priority === 'routine' ? 'rgba(30, 58, 95, 0.3)' : 'rgba(0, 0, 0, 0.3)',
              borderColor: newPlanItem.priority === 'routine' ? 'rgba(30, 58, 95, 0.6)' : 'rgba(128, 128, 128, 0.3)',
              color: '#F5F5DC'
            }}
          >
            <div className="font-bold">ROUTINE</div>
            <div className="text-xs mt-1" style={{color: '#6BB6FF'}}>1.0x XP</div>
          </button>
        </div>
      </div>
      
      <div className="flex gap-2">
        <button 
          onClick={addPlanTask}
          disabled={!newPlanItem.title} 
          className="flex-1 py-2 rounded-lg transition-all border-2"
          style={{
            backgroundColor: !newPlanItem.title ? '#2C3E50' : 'rgba(43, 80, 130, 0.8)',
            borderColor: !newPlanItem.title ? '#95A5A6' : 'rgba(96, 165, 250, 0.7)',
            color: '#F5F5DC',
            cursor: !newPlanItem.title ? 'not-allowed' : 'pointer',
            opacity: !newPlanItem.title ? 0.5 : 1
          }}
          onMouseEnter={(e) => {if (newPlanItem.title) e.currentTarget.style.backgroundColor = 'rgba(53, 100, 160, 0.9)'}}
          onMouseLeave={(e) => {if (newPlanItem.title) e.currentTarget.style.backgroundColor = 'rgba(43, 80, 130, 0.8)'}}
        >
          Add Task
        </button>
        <button 
          onClick={() => { 
            setShowPlanModal(false); 
            setNewPlanItem({ title: '', priority: 'routine' }); 
          }} 
          className="flex-1 py-2 rounded-lg transition-all border-2"
          style={{backgroundColor: COLORS.slate.base, borderColor: COLORS.slate.border, color: '#F5F5DC'}}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.slate.hover}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = COLORS.slate.base}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
  );
};

export default PlanModal;
