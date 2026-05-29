import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { COLORS, VISUAL_STYLES, HERO_CLASSES } from '../constants';

const CustomizeModal = ({
  setShowCustomizeModal,
  customName,
  setCustomName,
  customClass,
  setCustomClass,
  setHero,
  addLog,
}) => {
  const classes = HERO_CLASSES;
  return (
  <div className="fixed inset-0 bg-black bg-opacity-90 flex items-start justify-center p-4 z-50 overflow-y-auto" onClick={() => setShowCustomizeModal(false)}>
    <motion.div className="rounded-xl p-6 max-w-md w-full border-2 my-8" initial={{ opacity: 0, scale: 0.97, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.18, ease: 'easeOut' }} style={{background: VISUAL_STYLES.modal.paper, borderColor: COLORS.silver, boxShadow: VISUAL_STYLES.shadow.elevated}} onClick={e => e.stopPropagation()}>
      <div className="mb-6 relative">
        <button 
          onClick={() => setShowCustomizeModal(false)} 
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
          <h3 className="text-3xl font-bold mb-2" style={{color: '#D4AF37', letterSpacing: '0.1em'}}>CUSTOMIZE YOUR HERO</h3>
          <div className="flex items-center justify-center gap-2">
            <div style={{width: '100px', height: '1px', background: 'linear-gradient(to right, transparent, rgba(212, 175, 55, 0.3))'}}></div>
            <span style={{color: 'rgba(212, 175, 55, 0.4)', fontSize: '8px'}}>◆</span>
            <div style={{width: '100px', height: '1px', background: 'linear-gradient(to left, transparent, rgba(212, 175, 55, 0.3))'}}></div>
          </div>
        </div>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm mb-2 text-center" style={{color: COLORS.silver}}>Hero Name</label>
        <input 
          type="text" 
          placeholder="Enter your hero's name" 
          value={customName}
          onChange={e => setCustomName(e.target.value)}
          spellCheck="true"
          autoCorrect="on"
          autoCapitalize="words"
          className="w-full p-3 rounded-lg border focus:outline-none" 
          style={{backgroundColor: 'rgba(0, 0, 0, 0.4)', color: '#F5F5DC', borderColor: 'rgba(212, 175, 55, 0.3)', fontFamily: 'Cinzel, serif'}}
          onFocus={e => e.target.style.borderColor = COLORS.gold}
          onBlur={e => e.target.style.borderColor = 'rgba(212, 175, 55, 0.3)'}
          autoFocus 
        />
      </div>
      
      <div className="mb-6">
        <label className="block text-sm mb-2 text-center" style={{color: COLORS.silver}}>Choose Your Class</label>
        <div className="grid grid-cols-2 gap-2">
          {classes.map(cls => (
            <button
              key={cls.name}
              type="button"
              onClick={() => setCustomClass(cls)}
              className="p-4 rounded-lg border-2 transition-all"
              style={{
                backgroundColor: customClass?.name === cls.name ? 'rgba(212, 175, 55, 0.15)' : 'rgba(0, 0, 0, 0.3)',
                borderColor: customClass?.name === cls.name ? COLORS.gold : 'rgba(128, 128, 128, 0.3)'
              }}
              onMouseEnter={(e) => {
                if (customClass?.name !== cls.name) {
                  e.currentTarget.style.borderColor = 'rgba(128, 128, 128, 0.5)';
                }
              }}
              onMouseLeave={(e) => {
                if (customClass?.name !== cls.name) {
                  e.currentTarget.style.borderColor = 'rgba(128, 128, 128, 0.3)';
                }
              }}
            >
              <div className="text-4xl mb-2">{cls.emblem}</div>
              <div className="font-bold" style={{color: '#F5F5DC'}}>{cls.name}</div>
            </button>
          ))}
        </div>
      </div>
      
      <div className="flex gap-2">
        <button 
          onClick={() => {
            if (customName.trim() || customClass) {
              setHero(prev => ({
                ...prev,
                name: customName.trim() || prev.name,
                class: customClass || prev.class
              }));
              setCustomName('');
              setCustomClass(null);
              setShowCustomizeModal(false);
              addLog(`The hero has been customized! ${customName.trim() ? `Name: ${customName.trim()}` : ''} ${customClass ? `Class: ${customClass.name}` : ''}`);
            }
          }}
          className="flex-1 py-2 rounded-lg transition-all font-bold border-2"
          style={{backgroundColor: COLORS.gold, borderColor: COLORS.obsidian.base, color: COLORS.obsidian.base}}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FFD700'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = COLORS.gold}
        >
          Confirm
        </button>
        <button 
          onClick={() => {
            setCustomName('');
            setCustomClass(null);
            setShowCustomizeModal(false);
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

export default CustomizeModal;
