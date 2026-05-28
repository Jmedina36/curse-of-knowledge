import React from 'react';
import { COLORS, GAME_CONSTANTS } from '../constants';

const ProgressTab = ({ unlockedAchievements, achievementStats, selectedCategory, setSelectedCategory }) => {
  return (
            <div className="bg-black bg-opacity-50 rounded-xl p-6 border-2" style={{borderColor: 'rgba(212, 175, 55, 0.6)'}}>
              {/* Header */}
              <div className="text-center mb-6">
                <h2 className="text-4xl font-bold mb-2" style={{color: '#D4AF37', letterSpacing: '0.15em'}}>TRIALS CONQUERED</h2>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div style={{width: '120px', height: '1px', background: 'linear-gradient(to right, transparent, rgba(212, 175, 55, 0.3))'}}></div>
                  <span style={{color: 'rgba(212, 175, 55, 0.4)', fontSize: '8px'}}>◆</span>
                  <div style={{width: '120px', height: '1px', background: 'linear-gradient(to left, transparent, rgba(212, 175, 55, 0.3))'}}></div>
                </div>
                <p className="text-xl" style={{color: '#D4AF37'}}>{unlockedAchievements.length} / {GAME_CONSTANTS.ACHIEVEMENTS.length}</p>
                
                {/* Progress bar */}
                <div className="mt-4 mx-auto max-w-md">
                  <div className="h-3 rounded-full overflow-hidden" style={{background: 'rgba(0, 0, 0, 0.4)'}}>
                    <div 
                      className="h-3 rounded-full transition-all duration-500"
                      style={{
                        width: `${(unlockedAchievements.length / GAME_CONSTANTS.ACHIEVEMENTS.length) * 100}%`,
                        background: 'linear-gradient(to right, #B8860B, #D4AF37, #FFD700)'
                      }}
                    ></div>
                  </div>
                </div>
              </div>
              
              {/* Category tabs */}
              <div className="flex justify-center gap-2 mb-6 flex-wrap">
                {Object.entries(GAME_CONSTANTS.ACHIEVEMENT_CATEGORIES).map(([key, cat]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedCategory(key)}
                    className="px-4 py-2 rounded-lg transition-all border-2 text-sm font-bold uppercase"
                    style={{
                      backgroundColor: selectedCategory === key ? 'rgba(212, 175, 55, 0.3)' : 'rgba(0, 0, 0, 0.3)',
                      borderColor: selectedCategory === key ? '#D4AF37' : 'rgba(212, 175, 55, 0.3)',
                      color: selectedCategory === key ? '#D4AF37' : COLORS.silver
                    }}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
              {/* Achievement Grid */}
              <div className="max-w-5xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {GAME_CONSTANTS.ACHIEVEMENTS
                    .filter(ach => selectedCategory === 'ALL' || ach.category === selectedCategory)
                    .map(achievement => {
                      const isUnlocked = unlockedAchievements.includes(achievement.id);
                      const statValue = achievementStats[achievement.req.type] || 0;
                      const progress = Math.min(statValue / achievement.req.count, 1);
                      const rarityColor = GAME_CONSTANTS.RARITY_COLORS[achievement.rarity];
                      
                      return (
                        <div
                          key={achievement.id}
                          className="rounded-lg p-2 border-2 transition-all relative overflow-hidden"
                          style={{
                            background: isUnlocked 
                              ? `linear-gradient(135deg, rgba(60, 10, 10, 0.9), rgba(80, 20, 20, 0.9), rgba(40, 0, 0, 0.9))`
                              : 'linear-gradient(135deg, rgba(25, 25, 25, 0.8), rgba(35, 35, 35, 0.8), rgba(20, 20, 20, 0.8))',
                            borderColor: isUnlocked ? rarityColor : 'rgba(100, 100, 100, 0.3)',
                            borderWidth: '2px',
                            borderStyle: 'double',
                            opacity: isUnlocked ? 1 : 0.7,
                            boxShadow: isUnlocked 
                              ? `0 0 20px ${rarityColor}60, inset 0 0 30px rgba(0,0,0,0.5)` 
                              : 'inset 0 0 20px rgba(0,0,0,0.4)'
                          }}
                        >
                          {/* Decorative corner elements */}
                          {isUnlocked && (
                            <>
                              <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '30px',
                                height: '30px',
                                borderTop: `3px solid ${rarityColor}40`,
                                borderLeft: `3px solid ${rarityColor}40`,
                              }}></div>
                              <div style={{
                                position: 'absolute',
                                top: 0,
                                right: 0,
                                width: '30px',
                                height: '30px',
                                borderTop: `3px solid ${rarityColor}40`,
                                borderRight: `3px solid ${rarityColor}40`,
                              }}></div>
                              <div style={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                width: '30px',
                                height: '30px',
                                borderBottom: `3px solid ${rarityColor}40`,
                                borderLeft: `3px solid ${rarityColor}40`,
                              }}></div>
                              <div style={{
                                position: 'absolute',
                                bottom: 0,
                                right: 0,
                                width: '30px',
                                height: '30px',
                                borderBottom: `3px solid ${rarityColor}40`,
                                borderRight: `3px solid ${rarityColor}40`,
                              }}></div>
                            </>
                          )}
                          
                          <div style={{position: 'relative', zIndex: 1}}>
                            <div className="flex items-center justify-between mb-1.5">
                              <h3 className="font-bold text-base flex-1" style={{
                                color: isUnlocked ? COLORS.gold : COLORS.silver,
                                textShadow: isUnlocked ? '0 0 8px rgba(212, 175, 55, 0.5)' : 'none',
                                letterSpacing: '0.02em'
                              }}>
                                {achievement.name}
                              </h3>
                              <span 
                                className="text-xs px-2 py-0.5 rounded uppercase font-bold ml-2"
                                style={{
                                  backgroundColor: `${rarityColor}30`,
                                  color: rarityColor,
                                  border: `1px solid ${rarityColor}`,
                                  textShadow: `0 0 5px ${rarityColor}80`
                                }}
                              >
                                {achievement.rarity}
                              </span>
                            </div>
                            
                            <p className="text-xs mb-2 italic" style={{
                              color: isUnlocked ? '#C0C0C0' : '#888',
                              lineHeight: '1.3'
                            }}>
                              {achievement.desc}
                            </p>
                            
                            {/* Progress bar for incremental achievements */}
                            {!isUnlocked && (
                              <div className="mb-2">
                                <div className="h-1.5 rounded-full overflow-hidden" style={{
                                  background: 'rgba(0, 0, 0, 0.6)',
                                  border: '1px solid rgba(100, 100, 100, 0.3)'
                                }}>
                                  <div 
                                    className="h-1.5 rounded-full transition-all"
                                    style={{
                                      width: `${progress * 100}%`,
                                      background: `linear-gradient(to right, ${rarityColor}60, ${rarityColor})`,
                                      boxShadow: `0 0 8px ${rarityColor}80`
                                    }}
                                  ></div>
                                </div>
                                <p className="text-xs mt-0.5" style={{
                                  color: rarityColor,
                                  fontWeight: 'bold'
                                }}>
                                  {statValue} / {achievement.req.count}
                                </p>
                              </div>
                            )}
                            
                            {/* Rewards - compact display */}
                            <div className="mt-2 pt-2" style={{
                              borderTop: `1px solid ${isUnlocked ? 'rgba(212, 175, 55, 0.3)' : 'rgba(100, 100, 100, 0.2)'}`
                            }}>
                              <div className="flex items-center gap-1.5 flex-wrap text-xs font-bold" style={{
                                color: isUnlocked ? COLORS.gold : '#666'
                              }}>
                                {achievement.reward.xp && (
                                  <span className="px-1.5 py-0.5 rounded" style={{
                                    background: 'rgba(0, 0, 0, 0.4)',
                                    border: '1px solid rgba(100, 100, 100, 0.3)'
                                  }}>
                                    +{achievement.reward.xp} XP
                                  </span>
                                )}
                                {achievement.reward.maxHP && (
                                  <span className="px-1.5 py-0.5 rounded" style={{
                                    background: 'rgba(139, 0, 0, 0.3)',
                                    border: '1px solid rgba(220, 20, 60, 0.5)'
                                  }}>
                                    +{achievement.reward.maxHP} HP
                                  </span>
                                )}
                                {achievement.reward.maxSP && (
                                  <span className="px-1.5 py-0.5 rounded" style={{
                                    background: 'rgba(0, 100, 200, 0.3)',
                                    border: '1px solid rgba(100, 149, 237, 0.5)'
                                  }}>
                                    +{achievement.reward.maxSP} SP
                                  </span>
                                )}
                                {achievement.reward.weapon && (
                                  <span className="px-1.5 py-0.5 rounded" style={{
                                    background: 'rgba(255, 140, 0, 0.3)',
                                    border: '1px solid rgba(255, 140, 0, 0.5)'
                                  }}>
                                    +{achievement.reward.weapon} ATK
                                  </span>
                                )}
                                {achievement.reward.armor && (
                                  <span className="px-1.5 py-0.5 rounded" style={{
                                    background: 'rgba(46, 139, 87, 0.3)',
                                    border: '1px solid rgba(46, 139, 87, 0.5)'
                                  }}>
                                    +{achievement.reward.armor} DEF
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
  );
};

export default ProgressTab;
