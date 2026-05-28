import React from 'react';
import { Skull } from 'lucide-react';
import { GAME_CONSTANTS } from '../constants';

const LegacyTab = ({ graveyard }) => {
  return (
            <div className="space-y-6">
              {/* Main Page Header */}
              <div className="text-center mb-6">
                <h2 className="text-4xl font-bold mb-4" style={{color: '#D4AF37', letterSpacing: '0.15em'}}>HALL OF LEGENDS</h2>
                <div className="flex items-center justify-center gap-2">
                  <div style={{width: '80px', height: '1px', background: 'linear-gradient(to right, transparent, rgba(212, 175, 55, 0.5))'}}></div>
                  <span style={{color: 'rgba(212, 175, 55, 0.6)', fontSize: '8px'}}>◆</span>
                  <div style={{width: '80px', height: '1px', background: 'linear-gradient(to left, transparent, rgba(212, 175, 55, 0.5))'}}></div>
                </div>
                <p className="text-sm mb-6 italic text-center" style={{color: COLORS.silver}}>"Remember the fallen... Honor the victorious..."</p>
              </div>
              
              {/* The Liberated Section */}
              <div className="bg-black bg-opacity-50 rounded-xl p-6 border-2" style={{borderColor: 'rgba(212, 175, 55, 0.6)'}}>
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-yellow-400 mb-2">THE LIBERATED</h2>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <div style={{width: '150px', height: '1px', background: 'linear-gradient(to right, transparent, rgba(250, 204, 21, 0.3))'}}></div>
                    <span style={{color: 'rgba(250, 204, 21, 0.4)', fontSize: '8px'}}>◆</span>
                    <div style={{width: '150px', height: '1px', background: 'linear-gradient(to left, transparent, rgba(250, 204, 21, 0.3))'}}></div>
                  </div>
                  <p className="text-green-400 text-sm italic">"Those who broke free from the curse..."</p>
                </div>
                {heroes.length === 0 ? (<div className="text-center py-12"><Trophy size={64} className="mx-auto mb-4 text-gray-700"/><p className="text-gray-400">None have escaped the curse... yet.</p><p className="text-sm text-gray-500 mt-2">Survive all 7 days to break free!</p></div>) : (<div className="space-y-4">{heroes.slice().reverse().map((hero, i) => (<div key={i} className={`bg-gradient-to-r ${hero.class ? hero.class.gradient[3] : 'from-yellow-900'} ${hero.class && hero.class.color === 'yellow' ? 'to-orange-400' : hero.class && hero.class.color === 'red' ? 'to-orange-500' : hero.class && hero.class.color === 'purple' ? 'to-pink-500' : hero.class && hero.class.color === 'green' ? 'to-teal-500' : 'to-yellow-500'} rounded-lg p-6 border-4 border-yellow-400 shadow-2xl shadow-yellow-500/50`}><div className="flex items-center gap-4"><div className="text-6xl animate-pulse">{hero.class ? hero.class.emblem : '✨'}</div><div className="flex-1"><h3 className="text-2xl font-bold text-white">{hero.name}</h3><p className="text-xl text-white text-opacity-90">{hero.title} {hero.class ? hero.class.name : ''}</p><p className="text-white">Level {hero.lvl} • {hero.xp} XP</p>{hero.skipCount !== undefined && hero.skipCount === 0 && (<p className="text-green-300 font-bold mt-1">✨ FLAWLESS RUN - No skips!</p>)}{hero.skipCount > 0 && (<p className="text-yellow-200 text-sm mt-1">Overcame {hero.skipCount} skip{hero.skipCount > 1 ? 's' : ''}</p>)}<p className="text-yellow-300 font-bold mt-2">✨ CURSE BROKEN ✨</p><p className="text-green-400 text-sm italic">"Free at last from the eternal torment..."</p></div></div></div>))}</div>)}
              </div>
              
              {/* The Consumed Section */}
              <div className="bg-black bg-opacity-50 rounded-xl p-6 border-2" style={{borderColor: 'rgba(212, 175, 55, 0.6)'}}>
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-400 mb-2">THE CONSUMED</h2>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <div style={{width: '150px', height: '1px', background: 'linear-gradient(to right, transparent, rgba(156, 163, 175, 0.3))'}}></div>
                    <span style={{color: 'rgba(156, 163, 175, 0.4)', fontSize: '8px'}}>◆</span>
                    <div style={{width: '150px', height: '1px', background: 'linear-gradient(to left, transparent, rgba(156, 163, 175, 0.3))'}}></div>
                  </div>
                  <p className="text-red-400 text-sm italic">"Those who fell to the curse..."</p>
                </div>
                {graveyard.length === 0 ? (<div className="text-center py-12"><Skull size={64} className="mx-auto mb-4 text-gray-700"/><p className="text-gray-500">No fallen heroes... yet.</p></div>) : (<div className="space-y-4">{graveyard.slice().reverse().map((fallen, i) => (<div key={i} className="bg-gray-900 rounded-lg p-4 border-2 border-red-900 opacity-70 hover:opacity-90 transition-opacity"><div className="flex items-center gap-4"><div className="text-4xl opacity-50">{fallen.class ? fallen.class.emblem : '☠️'}</div><div className="flex-1"><h3 className="text-xl font-bold text-red-400">{fallen.name}</h3><p className="text-gray-400">{fallen.title} {fallen.class ? fallen.class.name : ''} • Level {fallen.lvl}</p><p className="text-red-300">Fell on {fallen.day ? GAME_CONSTANTS.DAY_NAMES[fallen.day - 1]?.name || `Day ${fallen.day}` : 'Day 1'} • {fallen.xp} XP earned</p><p className="text-gray-300">Trials completed: {fallen.tasks}/{fallen.total}</p>{fallen.skipCount > 0 && (<p className="text-red-400 text-sm mt-1">💀 Skipped {fallen.skipCount} day{fallen.skipCount > 1 ? 's' : ''}</p>)}{fallen.cursed && (<p className="text-purple-400 text-sm">🌑 Died while cursed</p>)}<p className="text-red-500 text-sm italic mt-2">"The curse claimed another soul..."</p></div></div></div>))}</div>)}
              </div>
            </div>
  );
};

export default LegacyTab;
