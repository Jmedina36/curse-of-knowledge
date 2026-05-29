import React from 'react';
import { motion } from 'framer-motion';
import { COLORS, GAME_CONSTANTS } from '../constants';

const BattleModal = ({
  // Enemy state
  bossHp,
  bossMax,
  bossName,
  bossFlash,
  bossDebuffs,
  enragedTurns,
  battleType,
  isFinalBoss,
  // Wave state
  currentWaveEnemy,
  totalWaveEnemies,
  waveCount,
  // Boss phase state
  inPhase2,
  inPhase3,
  phase2DamageStacks,
  shadowAdds,
  aoeWarning,
  showDodgeButton,
  // Dialogue / taunt state
  showTauntBoxes,
  enemyDialogue,
  enemyTauntResponse,
  playerTaunt,
  isTauntAvailable,
  // Player state
  playerFlash,
  hp,
  getMaxHp,
  stamina,
  getMaxStamina,
  level,
  hero,
  gold,
  healthPots,
  staminaPots,
  curseLevel,
  // Battle UI state
  battling,
  battleMenu,
  setBattleMenu,
  canFlee,
  hasFled,
  setHasFled,
  setShowBoss,
  // Skill/ability state
  chargeStacks,
  recklessStacks,
  knightCrushingBlowCooldown,
  knightRallyingRoarCooldown,
  wizardTemporalCooldown,
  wizardEtherealBarrierCooldown,
  assassinMarkForDeathCooldown,
  crusaderJudgmentCooldown,
  crusaderSmiteCooldown,
  crusaderBastionOfFaithCooldown,
  // Victory
  victoryLoot,
  // Battle log
  log,
  // Callbacks
  attack,
  useCrushingBlow,
  useSmite,
  specialAttack,
  useTacticalSkill,
  useHealth,
  flee,
  dodge,
  taunt,
  advance,
  die,
  addLog,
  setStamina,
  setStaminaPots,
  getRarityColor,
}) => {
  return (
            <div className="fixed inset-0 flex items-start justify-center p-4 z-50 overflow-y-auto" style={{background: 'radial-gradient(ellipse at center, rgba(90, 14, 21, 0.3) 0%, rgba(0, 0, 0, 0.95) 70%)'}}>
              <motion.div className={`rounded-2xl p-4 max-w-3xl w-full relative boss-enter my-1 ${bossFlash ? 'damage-flash-boss' : ''}`} initial={{ opacity: 0, scale: 0.97, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.18, ease: 'easeOut' }} style={{
                background: 'linear-gradient(to bottom, rgba(60, 15, 15, 0.98), rgba(40, 10, 10, 0.98))',
                border: '2px solid rgba(139, 0, 0, 0.6)',
                boxShadow: '0 8px 24px rgba(139, 0, 0, 0.5), inset 0 0 20px rgba(0, 0, 0, 0.4)'
              }}>
                {/* Header Section */}
                <div className="text-center mb-3">
                  <p className="text-xs uppercase tracking-[0.3em] mb-1" style={{color: '#CD7F32', letterSpacing: '0.3em'}}>
                    {isFinalBoss ? (inPhase3 ? 'PHASE 3: ABYSS AWAKENING' : inPhase2 ? 'PHASE 2: THE PRESSURE' : 'THE UNDYING LEGEND') : 
                     battleType === 'elite' ? 'TORMENTED CHAMPION' : 
                     battleType === 'wave' ? `WAVE ASSAULT - Enemy ${currentWaveEnemy}/${totalWaveEnemies}` : 
                     'ENEMY ENCOUNTER'}
                  </p>
                  
                  {bossName && (
                    <h2 className="text-3xl font-bold mb-0" style={{
                      fontFamily: 'Cinzel, serif',
                      color: '#D4AF37',
                      textShadow: '0 0 20px rgba(212, 175, 55, 0.4)',
                      letterSpacing: '0.05em'
                    }}>
                      {bossName}
                      {bossDebuffs.poisonTurns > 0 && <span className="ml-3 text-lg text-green-400 animate-pulse"> ☠️ POISONED ({bossDebuffs.poisonTurns})</span>}
                      {bossDebuffs.stunned && <span className="ml-3 text-lg text-purple-400 animate-pulse"> ✨ STUNNED</span>}
                    </h2>
                  )}
                  
                  <div className="flex items-center justify-center gap-2 mt-1">
                    <div style={{width: '80px', height: '1px', background: 'linear-gradient(to right, transparent, rgba(212, 175, 55, 0.3))'}}></div>
                    <span style={{color: 'rgba(212, 175, 55, 0.5)', fontSize: '8px'}}>◆</span>
                    <div style={{width: '80px', height: '1px', background: 'linear-gradient(to left, transparent, rgba(212, 175, 55, 0.3))'}}></div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {/* Enemy HP Section */}
                  <div className="rounded-lg p-2" style={{backgroundColor: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(139, 0, 0, 0.5)'}}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm uppercase tracking-wider" style={{color: '#CD7F32'}}>
                        {bossName || 'Enemy'}
                        {enragedTurns > 0 && <span className="ml-3 text-orange-400 font-bold animate-pulse"> ENRAGED ({enragedTurns})</span>}
                      </span>
                      <span style={{color: '#F5F5DC'}}>{bossHp}/{bossMax}</span>
                    </div>
                    <div className="rounded-full h-3 overflow-hidden" style={{backgroundColor: 'rgba(0, 0, 0, 0.6)'}}>
                      <div className={`h-3 rounded-full transition-all duration-300 ${bossFlash ? 'hp-pulse' : ''}`} style={{
                        width: `${(bossHp / bossMax) * 100}%`,
                        background: 'linear-gradient(to right, #DC143C, #FF6B6B)'
                      }}></div>
                    </div>
                  </div>
                  
                  {/* Phase 2 Warning */}
                  {inPhase2 && !inPhase3 && phase2DamageStacks > 0 && (
                    <div className="rounded-lg p-2" style={{backgroundColor: 'rgba(204, 85, 0, 0.2)', border: '1px solid rgba(255, 140, 0, 0.5)'}}>
                      <p className="text-xs uppercase tracking-wider text-center mb-1" style={{color: '#CD7F32'}}>RAMPING PRESSURE</p>
                      <p className="text-white text-center text-sm">Boss damage: +{phase2DamageStacks * 5}% ({phase2DamageStacks} stacks)</p>
                    </div>
                  )}
                  
                  {/* Shadow Adds */}
                  {(inPhase2 || inPhase3) && shadowAdds.length > 0 && (
                    <div className="rounded-lg p-2" style={{backgroundColor: 'rgba(107, 44, 145, 0.2)', border: '1px solid rgba(147, 51, 234, 0.5)'}}>
                      <p className="text-xs uppercase tracking-wider text-center mb-2" style={{color: '#B794F4'}}>Shadow Add{shadowAdds.length > 1 ? 's' : ''} ({shadowAdds.length})</p>
                      <div className="space-y-2">
                        {shadowAdds.map((add, idx) => (
                          <div key={add.id} className="flex items-center gap-3">
                            <span className="text-xs" style={{color: '#F5F5DC'}}>#{idx + 1}</span>
                            <div className="flex-1 rounded-full h-2 overflow-hidden" style={{backgroundColor: 'rgba(0, 0, 0, 0.6)'}}>
                              <div className="h-2 rounded-full" style={{width: `${(add.hp / add.maxHp) * 100}%`, backgroundColor: '#B794F4'}}></div>
                            </div>
                            <span className="text-xs" style={{color: '#B794F4'}}>{add.hp}/{add.maxHp}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* AOE Warning */}
                  {aoeWarning && inPhase3 && (
                    <div className="rounded-lg p-4 animate-pulse" style={{backgroundColor: 'rgba(139, 0, 0, 0.4)', border: '2px solid #FBBF24'}}>
                      <p className="text-yellow-400 font-bold text-center">⚠️ DEVASTATING AOE INCOMING!</p>
                      <p className="text-white text-center text-sm mt-1">Next turn: 35 damage slam!</p>
                    </div>
                  )}
                  
                  {/* Enemy Dialogue */}
                  {showTauntBoxes ? (
                    <div className="rounded-lg p-2 relative" style={{backgroundColor: 'rgba(0, 0, 0, 0.6)', border: '1px solid rgba(139, 0, 0, 0.5)'}}>
                      <div className="absolute -top-2 left-3 px-2 py-0.5 rounded" style={{backgroundColor: 'rgba(139, 0, 0, 0.9)', border: '1px solid rgba(220, 38, 38, 0.6)'}}>
                        <p className="text-xs uppercase tracking-wider" style={{color: '#F5F5DC', fontSize: '10px'}}>Enemy</p>
                      </div>
                      <p className="text-sm italic mt-2 text-center" style={{color: '#F5F5DC'}}>"{enemyTauntResponse || '...'}"</p>
                    </div>
                  ) : enemyDialogue ? (
                    <div className="rounded-lg p-2 relative" style={{backgroundColor: 'rgba(0, 0, 0, 0.6)', border: '1px solid rgba(100, 100, 100, 0.3)'}}>
                      <div className="absolute -top-2 left-3 px-2 py-0.5 rounded" style={{backgroundColor: 'rgba(139, 0, 0, 0.9)', border: '1px solid rgba(220, 38, 38, 0.6)'}}>
                        <p className="text-xs uppercase tracking-wider" style={{color: '#F5F5DC', fontSize: '10px'}}>Enemy</p>
                      </div>
                      <p className="text-sm italic mt-2 text-center" style={{color: '#F5F5DC'}}>"{enemyDialogue}"</p>
                    </div>
                  ) : null}
                  
                  {/* VS Divider */}
                  <div className="text-center py-2">
                    <div className="flex items-center justify-center gap-3">
                      <div style={{width: '80px', height: '1px', background: 'linear-gradient(to right, transparent, rgba(212, 175, 55, 0.5))'}}></div>
                      <p className="text-xl font-bold uppercase tracking-wider" style={{
                        color: '#D4AF37',
                        textShadow: '0 0 10px rgba(212, 175, 55, 0.5)',
                        letterSpacing: '0.2em'
                      }}>VS</p>
                      <div style={{width: '80px', height: '1px', background: 'linear-gradient(to left, transparent, rgba(212, 175, 55, 0.5))'}}></div>
                    </div>
                  </div>
                  
                  {/* Player Section */}
                  <div className="rounded-lg p-2" style={{backgroundColor: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(0, 100, 0, 0.5)'}}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm uppercase tracking-wider" style={{color: '#68D391'}}>{hero.name}</span>
                      <span style={{color: '#F5F5DC'}}>HP: {hp}/{getMaxHp()} | SP: {stamina}/{getMaxStamina()}</span>
                    </div>
                    <div className="rounded-full h-3 overflow-hidden mb-1" style={{backgroundColor: 'rgba(0, 0, 0, 0.6)'}}>
                      <div className={`h-3 rounded-full transition-all duration-300 ${playerFlash ? 'hp-pulse' : ''}`} style={{
                        width: `${(hp / getMaxHp()) * 100}%`,
                        background: 'linear-gradient(to right, #2F5233, #68D391)'
                      }}></div>
                    </div>
                    <div className="rounded-full h-2 overflow-hidden" style={{backgroundColor: 'rgba(0, 0, 0, 0.6)'}}>
                      <div className="h-2 rounded-full transition-all duration-300" style={{
                        width: `${(stamina / getMaxStamina()) * 100}%`,
                        background: 'linear-gradient(to right, #0E7490, #06B6D4)'
                      }}></div>
                    </div>
                  </div>
                  
                  {/* Charge Stacks Only */}
                  {chargeStacks > 0 && (
                    <div className="rounded-lg p-2 text-center" style={{backgroundColor: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(212, 175, 55, 0.3)'}}>
                      <div className="flex items-center justify-center gap-1">
                        <span className="text-xs" style={{color: COLORS.gold}}>CHARGES:</span>
                        {[1, 2, 3].map(i => (
                          <div 
                            key={i}
                            className={`w-2 h-2 rounded-full transition-all`}
                            style={{
                              backgroundColor: i <= chargeStacks ? COLORS.gold : '#4B5563',
                              boxShadow: i <= chargeStacks ? `0 0 6px ${COLORS.gold}` : 'none'
                            }}
                          />
                        ))}
                        {chargeStacks === 3 && <span className="text-xs font-bold ml-1" style={{color: COLORS.gold}}>⚡ READY</span>}
                      </div>
                    </div>
                  )}
                  
                  {/* Player Dialogue */}
                  {showTauntBoxes && (
                    <div className="rounded-lg p-2" style={{backgroundColor: 'rgba(0, 0, 0, 0.6)', border: '1px solid rgba(59, 130, 246, 0.5)'}}>
                      <p className="text-sm" style={{color: '#F5F5DC'}}>"{playerTaunt}"</p>
                    </div>
                  )}
                  
                  {/* Actions Section */}
                  {battling && bossHp > 0 && hp > 0 && (
                    <>
                      <div className="text-center pt-2 pb-2">
                        <p className="text-sm font-bold uppercase tracking-[0.3em] mb-1" style={{color: '#D4AF37'}}>Actions</p>
                        <div className="flex items-center justify-center gap-2">
                          <div style={{width: '200px', height: '2px', background: 'linear-gradient(to right, transparent, rgba(212, 175, 55, 0.6), transparent)'}}></div>
                        </div>
                      </div>
                      
                      {/* Main Menu */}
                      {battleMenu === 'main' && (
                        <div className="grid grid-cols-3 gap-3">
                          <button 
                            onClick={() => setBattleMenu('fight')} 
                            className="rounded-lg py-3 px-4 font-bold transition-all border-2 hover:scale-105 active:scale-95"
                            style={{
                              background: 'linear-gradient(to bottom, rgba(139, 0, 0, 0.8), rgba(80, 0, 0, 0.8))',
                              borderColor: 'rgba(139, 0, 0, 0.6)',
                              color: '#F5F5DC'
                            }}
                          >
                            <div className="text-base uppercase">Fight</div>
                          </button>
                          
                          <button 
                            onClick={() => setBattleMenu('items')}
                            disabled={healthPots === 0 && staminaPots === 0}
                            className="rounded-lg py-3 px-4 font-bold transition-all border-2 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{
                              background: (healthPots > 0 || staminaPots > 0) ? 'linear-gradient(to bottom, rgba(184, 134, 11, 0.8), rgba(120, 87, 7, 0.8))' : 'rgba(44, 62, 80, 0.6)',
                              borderColor: (healthPots > 0 || staminaPots > 0) ? 'rgba(184, 134, 11, 0.6)' : 'rgba(128, 128, 128, 0.3)',
                              color: '#F5F5DC'
                            }}
                          >
                            <div className="text-base uppercase">Items</div>
                          </button>
                          
                          {canFlee && (
                            <button 
                              onClick={flee}
                              disabled={stamina < 25}
                              className="rounded-lg py-3 px-4 font-bold transition-all border-2 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                              style={{
                                background: stamina >= 25 ? 'linear-gradient(to bottom, rgba(47, 82, 51, 0.8), rgba(30, 52, 33, 0.8))' : 'rgba(44, 62, 80, 0.6)',
                                borderColor: stamina >= 25 ? 'rgba(47, 82, 51, 0.6)' : 'rgba(128, 128, 128, 0.3)',
                                color: '#F5F5DC'
                              }}
                            >
                              <div className="text-base uppercase">Flee</div>
                              {stamina >= 25 && <div className="text-xs mt-1 opacity-75">25 SP</div>}
                            </button>
                          )}
                          
                          {showDodgeButton && (
                            <button 
                              onClick={dodge}
                              className="rounded-lg py-3 px-4 font-bold transition-all border-2 hover:scale-105 active:scale-95 animate-pulse"
                              style={{
                                background: 'linear-gradient(to bottom, rgba(30, 58, 95, 0.8), rgba(20, 40, 65, 0.8))',
                                borderColor: 'rgba(30, 58, 95, 0.6)',
                                color: '#F5F5DC'
                              }}
                            >
                              <div className="text-base uppercase">Dodge</div>
                              <div className="text-xs mt-1 opacity-75">Avoid AOE</div>
                            </button>
                          )}
                        </div>
                      )}
                      
                      {/* Fight Submenu */}
                      {battleMenu === 'fight' && (
                        <>
                          <div className="grid grid-cols-4 gap-3 mb-4">
                            <button 
                              onClick={attack}
                              className="rounded-lg py-3 px-4 font-bold transition-all border-2 hover:scale-105 active:scale-95"
                              style={{
                                background: 'linear-gradient(to bottom, rgba(139, 0, 0, 0.8), rgba(80, 0, 0, 0.8))',
                                borderColor: 'rgba(139, 0, 0, 0.6)',
                                color: '#F5F5DC'
                              }}
                            >
                              <div className="text-base uppercase">{hero?.class?.name ? GAME_CONSTANTS.BASIC_ATTACK_NAMES[hero.class.name] : 'Attack'}</div>
                              <div className="text-xs mt-1 opacity-75">Basic Strike</div>
                            </button>
                            
                            {/* Knight Crushing Blow */}
                            {hero && hero.class && hero.class.name === 'Knight' && (
                              <button 
                                onClick={useCrushingBlow}
                                disabled={level < GAME_CONSTANTS.SKILL_UNLOCK_LEVELS.basicSkill || stamina < 17 || knightCrushingBlowCooldown}
                                className="rounded-lg py-3 px-4 font-bold transition-all border-2 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{
                                  background: (level >= GAME_CONSTANTS.SKILL_UNLOCK_LEVELS.basicSkill && stamina >= 17 && !knightCrushingBlowCooldown) 
                                    ? 'linear-gradient(to bottom, rgba(165, 42, 42, 0.8), rgba(100, 25, 25, 0.8))' 
                                    : 'rgba(44, 62, 80, 0.6)',
                                  borderColor: (level >= GAME_CONSTANTS.SKILL_UNLOCK_LEVELS.basicSkill && stamina >= 17 && !knightCrushingBlowCooldown) 
                                    ? 'rgba(165, 42, 42, 0.6)' 
                                    : 'rgba(128, 128, 128, 0.3)',
                                  color: '#F5F5DC'
                                }}
                                title={level < GAME_CONSTANTS.SKILL_UNLOCK_LEVELS.basicSkill ? `Unlocks at Level ${GAME_CONSTANTS.SKILL_UNLOCK_LEVELS.basicSkill}` : 'Powerful strike that cannot be used twice in a row'}
                              >
                                <div className="text-sm uppercase">Crushing Blow</div>
                                <div className="text-xs mt-1 opacity-75">
                                  {level < GAME_CONSTANTS.SKILL_UNLOCK_LEVELS.basicSkill ? (
                                    <span className="text-red-400">🔒 Lvl {GAME_CONSTANTS.SKILL_UNLOCK_LEVELS.basicSkill}</span>
                                  ) : knightCrushingBlowCooldown ? (
                                    <span className="text-yellow-400">⏳ Cooldown</span>
                                  ) : (
                                    <>17 SP</>
                                  )}
                                </div>
                              </button>
                            )}
                            
                            {/* Crusader Smite */}
                            {hero && hero.class && hero.class.name === 'Crusader' && (
                              <button 
                                onClick={useSmite}
                                disabled={level < GAME_CONSTANTS.SKILL_UNLOCK_LEVELS.basicSkill || stamina < 15 || crusaderSmiteCooldown}
                                className="rounded-lg py-3 px-4 font-bold transition-all border-2 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{
                                  background: (level >= GAME_CONSTANTS.SKILL_UNLOCK_LEVELS.basicSkill && stamina >= 15 && !crusaderSmiteCooldown) 
                                    ? 'linear-gradient(to bottom, rgba(218, 165, 32, 0.8), rgba(184, 134, 11, 0.8))' 
                                    : 'rgba(44, 62, 80, 0.6)',
                                  borderColor: (level >= GAME_CONSTANTS.SKILL_UNLOCK_LEVELS.basicSkill && stamina >= 15 && !crusaderSmiteCooldown) 
                                    ? 'rgba(218, 165, 32, 0.6)' 
                                    : 'rgba(128, 128, 128, 0.3)',
                                  color: '#F5F5DC'
                                }}
                                title={level < GAME_CONSTANTS.SKILL_UNLOCK_LEVELS.basicSkill ? `Unlocks at Level ${GAME_CONSTANTS.SKILL_UNLOCK_LEVELS.basicSkill}` : 'Holy strike that heals. Cannot be used twice in a row.'}
                              >
                                <div className="text-sm uppercase">Smite</div>
                                <div className="text-xs mt-1 opacity-75">
                                  {level < GAME_CONSTANTS.SKILL_UNLOCK_LEVELS.basicSkill ? (
                                    <span className="text-red-400">🔒 Lvl {GAME_CONSTANTS.SKILL_UNLOCK_LEVELS.basicSkill}</span>
                                  ) : crusaderSmiteCooldown ? (
                                    <span className="text-yellow-400">⏳ Cooldown</span>
                                  ) : (
                                    <>15 SP</>
                                  )}
                                </div>
                              </button>
                            )}
                            
                            {hero && hero.class && GAME_CONSTANTS.SPECIAL_ATTACKS[hero.class.name] && (
                              <button 
                                onClick={specialAttack}
                                disabled={
                                  level < GAME_CONSTANTS.SKILL_UNLOCK_LEVELS.special ||
                                  stamina < GAME_CONSTANTS.SPECIAL_ATTACKS[hero.class.name].cost || 
                                  (GAME_CONSTANTS.SPECIAL_ATTACKS[hero.class.name].hpCost && hp <= GAME_CONSTANTS.SPECIAL_ATTACKS[hero.class.name].hpCost) ||
                                  (hero.class.name === 'Wizard' && wizardTemporalCooldown) ||
                                  (hero.class.name === 'Crusader' && crusaderJudgmentCooldown)
                                }
                                className="rounded-lg py-3 px-4 font-bold transition-all border-2 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{
                                  background: (level >= GAME_CONSTANTS.SKILL_UNLOCK_LEVELS.special &&
                                              stamina >= GAME_CONSTANTS.SPECIAL_ATTACKS[hero.class.name].cost && 
                                              !(hero.class.name === 'Wizard' && wizardTemporalCooldown) && 
                                              !(hero.class.name === 'Crusader' && crusaderJudgmentCooldown)) 
                                              ? 'linear-gradient(to bottom, rgba(13, 116, 142, 0.8), rgba(8, 77, 94, 0.8))' : 'rgba(44, 62, 80, 0.6)',
                                  borderColor: (level >= GAME_CONSTANTS.SKILL_UNLOCK_LEVELS.special &&
                                               stamina >= GAME_CONSTANTS.SPECIAL_ATTACKS[hero.class.name].cost && 
                                               !(hero.class.name === 'Wizard' && wizardTemporalCooldown) && 
                                               !(hero.class.name === 'Crusader' && crusaderJudgmentCooldown)) 
                                               ? 'rgba(13, 116, 142, 0.6)' : 'rgba(128, 128, 128, 0.3)',
                                  color: '#F5F5DC'
                                }}
                                title={level < GAME_CONSTANTS.SKILL_UNLOCK_LEVELS.special ? `Unlocks at Level ${GAME_CONSTANTS.SKILL_UNLOCK_LEVELS.special}` : GAME_CONSTANTS.SPECIAL_ATTACKS[hero.class.name].effect}
                              >
                                <div className="text-sm uppercase">{GAME_CONSTANTS.SPECIAL_ATTACKS[hero.class.name].name}</div>
                                <div className="text-xs mt-1 opacity-75">
                                  {level < GAME_CONSTANTS.SKILL_UNLOCK_LEVELS.special ? (
                                    <span className="text-red-400">🔒 Lvl {GAME_CONSTANTS.SKILL_UNLOCK_LEVELS.special}</span>
                                  ) : hero.class.name === 'Wizard' && wizardTemporalCooldown ? (
                                    <span className="text-yellow-400">⏳ On Cooldown</span>
                                  ) : hero.class.name === 'Crusader' && crusaderJudgmentCooldown ? (
                                    <span className="text-yellow-400">⏳ On Cooldown</span>
                                  ) : (
                                    <>{GAME_CONSTANTS.SPECIAL_ATTACKS[hero.class.name].cost} SP{GAME_CONSTANTS.SPECIAL_ATTACKS[hero.class.name].hpCost && ` • ${GAME_CONSTANTS.SPECIAL_ATTACKS[hero.class.name].hpCost + (recklessStacks * 10)} HP`}</>
                                  )}
                                </div>
                              </button>
                            )}
                            
                            {hero && hero.class && GAME_CONSTANTS.TACTICAL_SKILLS[hero.class.name] && (
                              <button 
                                onClick={useTacticalSkill}
                                disabled={
                                  level < GAME_CONSTANTS.SKILL_UNLOCK_LEVELS.tactical ||
                                  stamina < GAME_CONSTANTS.TACTICAL_SKILLS[hero.class.name].cost ||
                                  (hero.class.name === 'Knight' && knightRallyingRoarCooldown) ||
                                  (hero.class.name === 'Wizard' && wizardEtherealBarrierCooldown) ||
                                  (hero.class.name === 'Assassin' && assassinMarkForDeathCooldown) ||
                                  (hero.class.name === 'Crusader' && crusaderBastionOfFaithCooldown)
                                }
                                className="rounded-lg py-3 px-4 font-bold transition-all border-2 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{
                                  background: (level >= GAME_CONSTANTS.SKILL_UNLOCK_LEVELS.tactical &&
                                              stamina >= GAME_CONSTANTS.TACTICAL_SKILLS[hero.class.name].cost &&
                                              !((hero.class.name === 'Knight' && knightRallyingRoarCooldown) ||
                                                (hero.class.name === 'Wizard' && wizardEtherealBarrierCooldown) ||
                                                (hero.class.name === 'Assassin' && assassinMarkForDeathCooldown) ||
                                                (hero.class.name === 'Crusader' && crusaderBastionOfFaithCooldown)))
                                              ? 'linear-gradient(to bottom, rgba(184, 134, 11, 0.8), rgba(120, 87, 7, 0.8))' : 'rgba(44, 62, 80, 0.6)',
                                  borderColor: (level >= GAME_CONSTANTS.SKILL_UNLOCK_LEVELS.tactical &&
                                               stamina >= GAME_CONSTANTS.TACTICAL_SKILLS[hero.class.name].cost &&
                                               !((hero.class.name === 'Knight' && knightRallyingRoarCooldown) ||
                                                 (hero.class.name === 'Wizard' && wizardEtherealBarrierCooldown) ||
                                                 (hero.class.name === 'Assassin' && assassinMarkForDeathCooldown) ||
                                                 (hero.class.name === 'Crusader' && crusaderBastionOfFaithCooldown)))
                                               ? 'rgba(184, 134, 11, 0.6)' : 'rgba(128, 128, 128, 0.3)',
                                  color: '#F5F5DC'
                                }}
                                title={level < GAME_CONSTANTS.SKILL_UNLOCK_LEVELS.tactical ? `Unlocks at Level ${GAME_CONSTANTS.SKILL_UNLOCK_LEVELS.tactical}` : GAME_CONSTANTS.TACTICAL_SKILLS[hero.class.name].effect}
                              >
                                <div className="text-sm uppercase">{GAME_CONSTANTS.TACTICAL_SKILLS[hero.class.name].name}</div>
                                <div className="text-xs mt-1 opacity-75">
                                  {level < GAME_CONSTANTS.SKILL_UNLOCK_LEVELS.tactical ? (
                                    <span className="text-red-400">🔒 Lvl {GAME_CONSTANTS.SKILL_UNLOCK_LEVELS.tactical}</span>
                                  ) : ((hero.class.name === 'Knight' && knightRallyingRoarCooldown) ||
                                    (hero.class.name === 'Wizard' && wizardEtherealBarrierCooldown) ||
                                    (hero.class.name === 'Assassin' && assassinMarkForDeathCooldown) ||
                                    (hero.class.name === 'Crusader' && crusaderBastionOfFaithCooldown)) ? (
                                    <span className="text-yellow-400">⏳ On Cooldown</span>
                                  ) : (
                                    <>{GAME_CONSTANTS.TACTICAL_SKILLS[hero.class.name].cost} SP</>
                                  )}
                                </div>
                              </button>
                            )}
                          </div>
                          
                          <button 
                            onClick={() => setBattleMenu('main')}
                            className="w-full rounded-lg py-3 px-4 font-bold transition-all border-2 hover:scale-105 active:scale-95"
                            style={{
                              background: 'rgba(44, 62, 80, 0.6)',
                              borderColor: 'rgba(128, 128, 128, 0.3)',
                              color: '#F5F5DC'
                            }}
                          >
                            <div className="text-sm uppercase">Back</div>
                          </button>
                        </>
                      )}
                      
                      {/* Items Submenu */}
                      {battleMenu === 'items' && (
                        <>
                          <div className="grid grid-cols-2 gap-3 mb-4">
                            <button 
                              onClick={useHealth}
                              disabled={healthPots === 0}
                              className="rounded-lg py-3 px-4 font-bold transition-all border-2 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                              style={{
                                background: healthPots > 0 ? 'linear-gradient(to bottom, rgba(220, 38, 38, 0.8), rgba(153, 27, 27, 0.8))' : 'rgba(44, 62, 80, 0.6)',
                                borderColor: healthPots > 0 ? 'rgba(220, 38, 38, 0.6)' : 'rgba(128, 128, 128, 0.3)',
                                color: '#F5F5DC'
                              }}
                            >
                              <div className="text-base uppercase">Health Potion</div>
                              <div className="text-xs mt-1 opacity-75">x{healthPots}</div>
                            </button>
                            
                            <button 
                              onClick={() => { 
                                if (staminaPots > 0) {
                                  const maxStamina = getMaxStamina();
                                  const restoreAmount = Math.max(
                                    GAME_CONSTANTS.STAMINA_POTION_MIN,
                                    Math.floor(maxStamina * (GAME_CONSTANTS.STAMINA_POTION_RESTORE_PERCENT / 100))
                                  );
                                  setStamina(Math.min(stamina + restoreAmount, maxStamina)); 
                                  setStaminaPots(staminaPots - 1); 
                                  addLog(`💙 Used Stamina Potion (+${restoreAmount} SP)`);
                                }
                              }}
                              disabled={staminaPots === 0}
                              className="rounded-lg py-3 px-4 font-bold transition-all border-2 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                              style={{
                                background: staminaPots > 0 ? 'linear-gradient(to bottom, rgba(6, 182, 212, 0.8), rgba(8, 145, 178, 0.8))' : 'rgba(44, 62, 80, 0.6)',
                                borderColor: staminaPots > 0 ? 'rgba(6, 182, 212, 0.6)' : 'rgba(128, 128, 128, 0.3)',
                                color: '#F5F5DC'
                              }}
                            >
                              <div className="text-base uppercase">Stamina Potion</div>
                              <div className="text-xs mt-1 opacity-75">x{staminaPots}</div>
                            </button>
                          </div>
                          
                          <button 
                            onClick={() => setBattleMenu('main')}
                            className="w-full rounded-lg py-3 px-4 font-bold transition-all border-2 hover:scale-105 active:scale-95"
                            style={{
                              background: 'rgba(44, 62, 80, 0.6)',
                              borderColor: 'rgba(128, 128, 128, 0.3)',
                              color: '#F5F5DC'
                            }}
                          >
                            <div className="text-sm uppercase">Back</div>
                          </button>
                        </>
                      )}
                      
                      {/* Taunt Button - Full Width Below Main Actions */}
                      {battleMenu === 'main' && isTauntAvailable && (
                        <button 
                          onClick={taunt}
                          className="w-full mt-3 rounded-lg py-3 px-4 font-bold transition-all border-2 hover:scale-105 active:scale-95 animate-pulse fade-in"
                          style={{
                            background: 'linear-gradient(to bottom, rgba(204, 85, 0, 0.8), rgba(153, 64, 0, 0.8))',
                            borderColor: 'rgba(204, 85, 0, 0.6)',
                            color: '#F5F5DC'
                          }}
                        >
                          <div className="text-base uppercase">Taunt Enemy (Enrage)</div>
                        </button>
                      )}
                    </>
                  )}
                  
                  {/* Victory/Defeat */}
                  {bossHp <= 0 && (
                    <div className="text-center pt-4">
                      {hasFled ? (
                        <>
                          <p className="text-4xl font-bold mb-4 animate-pulse" style={{color: '#FBBF24'}}>FLED</p>
                          <p className="text-lg mb-6 italic" style={{color: '#F5F5DC'}}>"Cowardice is also a strategy..."</p>
                        </>
                      ) : (
                        <>
                          <div className="mb-6">
                            <div className="flex items-center justify-center gap-3 mb-2">
                              <div style={{width: '100px', height: '2px', background: 'linear-gradient(to right, transparent, rgba(104, 211, 145, 0.6))'}}></div>
                              <p className="text-5xl font-bold" style={{
                                color: '#68D391', 
                                fontFamily: 'Cinzel, serif',
                                textShadow: '0 0 20px rgba(104, 211, 145, 0.5)',
                                letterSpacing: '0.1em'
                              }}>
                                {isFinalBoss ? 'CURSE BROKEN!' : 'VICTORY'}
                              </p>
                              <div style={{width: '100px', height: '2px', background: 'linear-gradient(to left, transparent, rgba(104, 211, 145, 0.6))'}}></div>
                            </div>
                            <p className="text-sm italic" style={{color: '#F5F5DC'}}>{isFinalBoss ? '"You are finally free..."' : '"The beast falls. You are healed and rewarded."'}</p>
                          </div>
                        </>
                      )}
                      
                      {!hasFled && victoryLoot.length > 0 && (
                        <div className="rounded-lg p-6 mb-6 fade-in" style={{
                          background: 'linear-gradient(to bottom, rgba(212, 175, 55, 0.15), rgba(184, 134, 11, 0.1))',
                          border: '2px solid rgba(212, 175, 55, 0.6)',
                          boxShadow: '0 0 30px rgba(212, 175, 55, 0.3)'
                        }}>
                          <div className="flex items-center justify-center gap-3 mb-4">
                            <div style={{width: '60px', height: '1px', background: 'linear-gradient(to right, transparent, rgba(212, 175, 55, 0.5))'}}></div>
                            <p className="font-bold text-lg uppercase tracking-wider" style={{
                              color: '#D4AF37',
                              textShadow: '0 0 10px rgba(212, 175, 55, 0.5)'
                            }}>Spoils of Battle</p>
                            <div style={{width: '60px', height: '1px', background: 'linear-gradient(to left, transparent, rgba(212, 175, 55, 0.5))'}}></div>
                          </div>
                          <div className="space-y-2">
                            {victoryLoot.map((loot, idx) => (
                              <div key={idx} className="rounded px-4 py-2 fade-in" style={{
                                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                                border: '1px solid rgba(212, 175, 55, 0.3)',
                                animationDelay: `${idx * 0.1}s`
                              }}>
                                <p className="text-base font-semibold" style={{color: '#F5F5DC'}}>{loot}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {(battleType === 'elite' || isFinalBoss) && (
                        <button 
                          onClick={advance}
                          className="px-8 py-3 rounded-lg font-bold text-xl transition-all border-2 hover:scale-105"
                          style={{
                            background: 'linear-gradient(to bottom, #D4AF37, #B8860B)',
                            borderColor: '#1C1C1C',
                            color: '#1C1C1C',
                            boxShadow: '0 0 20px rgba(212, 175, 55, 0.4)'
                          }}
                        >
                          {isFinalBoss ? 'CLAIM FREEDOM' : 'CONTINUE'}
                        </button>
                      )}
                      {(battleType === 'regular' || battleType === 'wave') && (
                        <button 
                          onClick={() => { setShowBoss(false); setHasFled(false); addLog('⚔️ Ready for your next trial...'); }}
                          className="px-8 py-3 rounded-lg font-bold text-xl transition-all border-2 hover:scale-105"
                          style={{
                            background: 'linear-gradient(to bottom, rgba(47, 82, 51, 0.8), rgba(30, 52, 33, 0.8))',
                            borderColor: 'rgba(192, 192, 192, 0.6)',
                            color: '#F5F5DC'
                          }}
                        >
                          CONTINUE
                        </button>
                      )}
                    </div>
                  )}
                  
                  {hp <= 0 && (
                    <div className="text-center pt-4">
                      <p className="text-4xl font-bold mb-2" style={{color: '#9B1B30', fontFamily: 'Cinzel, serif'}}>DEFEATED</p>
                      <p className="text-sm mb-4 italic" style={{color: '#F5F5DC'}}>"The curse claims another victim..."</p>
                      <button 
                        onClick={() => { setShowBoss(false); die(); }}
                        className="px-8 py-3 rounded-lg font-bold text-xl transition-all border-2 hover:scale-105"
                        style={{
                          background: 'linear-gradient(to bottom, rgba(107, 15, 26, 0.8), rgba(60, 8, 14, 0.8))',
                          borderColor: 'rgba(205, 127, 50, 0.6)',
                          color: '#F5F5DC'
                        }}
                      >
                        CONTINUE
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
  );
};

export default BattleModal;
