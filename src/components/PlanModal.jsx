import React from 'react';
import { motion } from 'framer-motion';
import { COLORS } from '../constants';
import { sounds } from '../sounds';

const PlanModal = ({
  selectedDay,
  setShowPlanModal,
  newPlanItem,
  setNewPlanItem,
  addPlanTask,
}) => {
  return (
  <div className="fixed inset-0 bg-black bg-opacity-90 flex items-start justify-center p-4 z-50 overflow-y-auto" onClick={() => setShowPlanModal(false)}>
    <motion.div className="rounded-xl p-6 max-w-md w-full border-2" initial={{ opacity: 0, scale: 0.97, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }} style={{background: 'linear-gradient(to bottom, rgba(26,22,18,0.97), rgba(15,13,10,0.97))', borderColor: COLORS.gold, boxShadow: '0 0 15px rgba(212, 175, 55, 0.25), 0 0 30px rgba(212, 175, 55, 0.1)'}} onClick={e => e.stopPropagation()}>
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
        style={{backgroundColor: 'rgba(0, 0, 0, 0.4)', color: '#F5F5DC', borderColor: 'rgba(212, 175, 55, 0.3)', fontFamily: 'Cinzel, serif'}}
        onFocus={e => e.target.style.borderColor = 'rgba(212, 175, 55, 0.7)'}
        onBlur={e => e.target.style.borderColor = 'rgba(212, 175, 55, 0.3)'}
        autoFocus 
      />
      
      <div className="mb-4">
        <label className="block text-sm mb-2 text-center" style={{color: COLORS.silver}}>Priority Level</label>
        <div className="grid grid-cols-2 gap-3">
          <button 
            type="button" 
            onClick={() => { sounds.click(); setNewPlanItem({...newPlanItem, priority: 'important'}); }}
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
            onClick={() => { sounds.click(); setNewPlanItem({...newPlanItem, priority: 'routine'}); }}
            className="p-4 rounded-lg border-2 transition-all"
            style={{
              backgroundColor: newPlanItem.priority === 'routine' ? 'rgba(42, 36, 28, 0.5)' : 'rgba(0, 0, 0, 0.3)',
              borderColor: newPlanItem.priority === 'routine' ? 'rgba(155, 139, 126, 0.5)' : 'rgba(128, 128, 128, 0.3)',
              color: '#F5F5DC'
            }}
          >
            <div className="font-bold">ROUTINE</div>
            <div className="text-xs mt-1" style={{color: 'rgba(245,245,220,0.45)'}}>1.0x XP</div>
          </button>
        </div>
      </div>
      
      <div className="flex gap-2">
        <button 
          onClick={() => { sounds.click(); addPlanTask(); }}
          disabled={!newPlanItem.title} 
          className="flex-1 py-2 rounded-lg transition-all border-2"
          style={{
            backgroundColor: !newPlanItem.title ? 'rgba(0,0,0,0.3)' : 'rgba(184, 134, 11, 0.35)',
            borderColor: !newPlanItem.title ? 'rgba(155,139,126,0.25)' : 'rgba(212, 175, 55, 0.7)',
            color: '#F5F5DC',
            cursor: !newPlanItem.title ? 'not-allowed' : 'pointer',
            opacity: !newPlanItem.title ? 0.5 : 1
          }}
          onMouseEnter={(e) => {if (newPlanItem.title) e.currentTarget.style.backgroundColor = 'rgba(184, 134, 11, 0.5)'}}
          onMouseLeave={(e) => {if (newPlanItem.title) e.currentTarget.style.backgroundColor = 'rgba(184, 134, 11, 0.35)'}}
        >
          Add Task
        </button>
        <button 
          onClick={() => {
            sounds.click();
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
    </motion.div>
  </div>
  );
};

export default PlanModal;
