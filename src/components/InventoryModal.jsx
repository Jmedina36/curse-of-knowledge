import React from 'react';
import { X } from 'lucide-react';
import { COLORS, VISUAL_STYLES, GAME_CONSTANTS } from '../constants';

const InventoryModal = ({
  // Display state
  suppliesTab,
  setSuppliesTab,
  setShowInventoryModal,
  // Player stats
  hp,
  stamina,
  level,
  gold,
  getMaxHp,
  getMaxStamina,
  getBaseAttack,
  getBaseDefense,
  // Consumables
  healthPots,
  staminaPots,
  cleansePots,
  setStaminaPots,
  // Weapon equipment
  equippedWeapon,
  setEquippedWeapon,
  weaponInventory,
  setWeaponInventory,
  // Armor equipment
  equippedArmor,
  setEquippedArmor,
  armorInventory,
  setArmorInventory,
  // Accessory equipment
  equippedPendant,
  setEquippedPendant,
  pendantInventory,
  setPendantInventory,
  equippedRing,
  setEquippedRing,
  ringInventory,
  setRingInventory,
  // Stamina setter (for using potions in inventory view)
  setStamina,
  // Helpers
  curseLevel,
  luckyCharmActive,
  getRarityColor,
  sortByRarity,
  addLog,
  // Potion use actions
  useHealth,
  useCleanse,
}) => {
  return (
            <div className="fixed inset-0 bg-black bg-opacity-90 flex items-start justify-center p-4 z-50 overflow-y-auto" onClick={() => setShowInventoryModal(false)}>
              <div className="rounded-xl p-6 max-w-lg w-full border-2 relative my-8" style={{background: VISUAL_STYLES.modal.paper, borderColor: COLORS.silver, boxShadow: VISUAL_STYLES.shadow.elevated}} onClick={e => e.stopPropagation()}>
                <button 
                  onClick={() => setShowInventoryModal(false)} 
                  className="absolute top-4 right-4 p-2 rounded-lg border-2 transition-all"
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
                
                <div className="text-center mb-6">
                  <h2 className="text-3xl font-bold mb-2" style={{color: COLORS.gold, letterSpacing: '0.1em'}}>SUPPLIES</h2>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <div style={{width: '120px', height: '1px', background: `linear-gradient(to right, transparent, rgba(212, 175, 55, 0.3))`}}></div>
                    <span style={{color: 'rgba(212, 175, 55, 0.4)', fontSize: '8px'}}>◆</span>
                    <div style={{width: '120px', height: '1px', background: `linear-gradient(to left, transparent, rgba(212, 175, 55, 0.3))`}}></div>
                  </div>
                  <p className="text-sm mt-2 italic" style={{color: COLORS.silver}}>"What keeps you alive in the darkness..."</p>
                </div>
                
                {/* Tabs */}
                <div className="grid grid-cols-4 gap-2 mb-6">
                  <button
                    onClick={() => setSuppliesTab('potions')}
                    className="py-2 rounded-lg font-bold uppercase text-sm transition-all border-2"
                    style={{
                      backgroundColor: suppliesTab === 'potions' ? 'rgba(139, 0, 0, 0.8)' : 'rgba(139, 0, 0, 0.3)',
                      borderColor: suppliesTab === 'potions' ? '#8B0000' : 'rgba(139, 0, 0, 0.5)',
                      color: '#F5F5DC'
                    }}
                  >
                    Potions
                  </button>
                  <button
                    onClick={() => setSuppliesTab('weapons')}
                    className="py-2 rounded-lg font-bold uppercase text-sm transition-all border-2"
                    style={{
                      backgroundColor: suppliesTab === 'weapons' ? 'rgba(192, 192, 192, 0.8)' : 'rgba(192, 192, 192, 0.3)',
                      borderColor: suppliesTab === 'weapons' ? '#C0C0C0' : 'rgba(192, 192, 192, 0.5)',
                      color: '#F5F5DC'
                    }}
                  >
                    Weapons
                  </button>
                  <button
                    onClick={() => setSuppliesTab('armor')}
                    className="py-2 rounded-lg font-bold uppercase text-sm transition-all border-2"
                    style={{
                      backgroundColor: suppliesTab === 'armor' ? 'rgba(184, 134, 11, 0.8)' : 'rgba(184, 134, 11, 0.3)',
                      borderColor: suppliesTab === 'armor' ? '#B8860B' : 'rgba(184, 134, 11, 0.5)',
                      color: '#F5F5DC'
                    }}
                  >
                    Armor
                  </button>
                  <button
                    onClick={() => setSuppliesTab('gear')}
                    className="py-2 rounded-lg font-bold uppercase text-sm transition-all border-2"
                    style={{
                      backgroundColor: suppliesTab === 'gear' ? 'rgba(75, 0, 130, 0.8)' : 'rgba(75, 0, 130, 0.3)',
                      borderColor: suppliesTab === 'gear' ? '#4B0082' : 'rgba(75, 0, 130, 0.5)',
                      color: '#F5F5DC'
                    }}
                  >
                    Gear
                  </button>
                </div>
                
                <div className="space-y-4">
                  {suppliesTab === 'potions' ? (
                    <>
                  {/* Health Potions */}
                  <div className="rounded-lg p-4 border-2" style={{backgroundColor: 'rgba(100, 0, 0, 0.2)', borderColor: 'rgba(139, 0, 0, 0.5)'}}>
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <p className="font-bold text-lg" style={{color: '#F5F5DC'}}>Health Potion</p>
                        <p className="text-sm mb-1" style={{color: '#FF6B6B'}}>Restores 30 HP</p>
                        <p className="text-xs italic" style={{color: COLORS.silver}}>"Crimson elixir. Mends wounds."</p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold mb-2" style={{color: '#FF6B6B', opacity: 0.9}}>{healthPots}</p>
                        <button 
                          onClick={useHealth} 
                          disabled={healthPots === 0 || hp >= getMaxHp()}
                          className="px-4 py-2 rounded transition-all text-sm border-2"
                          style={{
                            backgroundColor: (healthPots === 0 || hp >= getMaxHp()) ? '#2C3E50' : COLORS.crimson.base,
                            borderColor: (healthPots === 0 || hp >= getMaxHp()) ? '#95A5A6' : COLORS.crimson.border,
                            color: '#F5F5DC',
                            cursor: (healthPots === 0 || hp >= getMaxHp()) ? 'not-allowed' : 'pointer',
                            opacity: (healthPots === 0 || hp >= getMaxHp()) ? 0.5 : 1
                          }}
                          onMouseEnter={(e) => {if (!(healthPots === 0 || hp >= getMaxHp())) e.currentTarget.style.backgroundColor = COLORS.crimson.hover}}
                          onMouseLeave={(e) => {if (!(healthPots === 0 || hp >= getMaxHp())) e.currentTarget.style.backgroundColor = COLORS.crimson.base}}
                        >
                          Use
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Stamina Potions */}
                  <div className="rounded-lg p-4 border-2" style={{backgroundColor: 'rgba(30, 58, 95, 0.25)', borderColor: 'rgba(30, 58, 95, 0.5)'}}>
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <p className="font-bold text-lg" style={{color: '#F5F5DC'}}>Stamina Potion</p>
                        <p className="text-sm mb-1" style={{color: '#6BB6FF'}}>Restores 50% SP</p>
                        <p className="text-xs italic" style={{color: COLORS.silver}}>"Azure draught. Vigor renewed."</p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold mb-2" style={{color: '#6BB6FF', opacity: 0.9}}>{staminaPots}</p>
                        <button 
                          onClick={() => { 
                            if (staminaPots > 0 && stamina < getMaxStamina()) { 
                              setStaminaPots(s => s - 1);
                              const maxStamina = getMaxStamina();
                              const restoreAmount = Math.max(
                                GAME_CONSTANTS.STAMINA_POTION_MIN,
                                Math.floor(maxStamina * (GAME_CONSTANTS.STAMINA_POTION_RESTORE_PERCENT / 100))
                              );
                              setStamina(s => Math.min(maxStamina, s + restoreAmount)); 
                              addLog(`Used Stamina Potion! +${restoreAmount} SP`); 
                            } 
                          }} 
                          disabled={staminaPots === 0 || stamina >= getMaxStamina()}
                          className="px-4 py-2 rounded transition-all text-sm border-2"
                          style={{
                            backgroundColor: (staminaPots === 0 || stamina >= getMaxStamina()) ? '#2C3E50' : COLORS.sapphire.base,
                            borderColor: (staminaPots === 0 || stamina >= getMaxStamina()) ? '#95A5A6' : COLORS.sapphire.border,
                            color: '#F5F5DC',
                            cursor: (staminaPots === 0 || stamina >= getMaxStamina()) ? 'not-allowed' : 'pointer',
                            opacity: (staminaPots === 0 || stamina >= getMaxStamina()) ? 0.5 : 1
                          }}
                          onMouseEnter={(e) => {if (!(staminaPots === 0 || stamina >= getMaxStamina())) e.currentTarget.style.backgroundColor = COLORS.sapphire.hover}}
                          onMouseLeave={(e) => {if (!(staminaPots === 0 || stamina >= getMaxStamina())) e.currentTarget.style.backgroundColor = COLORS.sapphire.base}}
                        >
                          Use
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Cleanse Potions */}
                  <div className={`rounded-lg p-4 border-2 ${curseLevel > 0 ? 'animate-pulse' : ''}`} style={{backgroundColor: 'rgba(107, 44, 145, 0.2)', borderColor: curseLevel > 0 ? 'rgba(138, 59, 181, 0.6)' : 'rgba(107, 44, 145, 0.4)', boxShadow: curseLevel > 0 ? VISUAL_STYLES.shadow.glow('#8A3BB5', 0.15) : 'none'}}>
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <p className="font-bold text-lg" style={{color: '#F5F5DC'}}>Cleanse Potion</p>
                        <p className="text-sm mb-1" style={{color: '#B794F4'}}>Removes 1 curse level</p>
                        <p className="text-xs italic" style={{color: COLORS.silver}}>"Purifying brew. Breaks the hold."</p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold mb-2" style={{color: '#B794F4', opacity: 0.9}}>{cleansePots}</p>
                        <button 
                          onClick={useCleanse} 
                          disabled={cleansePots === 0 || curseLevel === 0}
                          className="px-4 py-2 rounded transition-all text-sm border-2"
                          style={{
                            backgroundColor: (cleansePots === 0 || curseLevel === 0) ? '#2C3E50' : COLORS.amethyst.base,
                            borderColor: (cleansePots === 0 || curseLevel === 0) ? '#95A5A6' : COLORS.amethyst.border,
                            color: '#F5F5DC',
                            cursor: (cleansePots === 0 || curseLevel === 0) ? 'not-allowed' : 'pointer',
                            opacity: (cleansePots === 0 || curseLevel === 0) ? 0.5 : 1
                          }}
                          onMouseEnter={(e) => {if (!(cleansePots === 0 || curseLevel === 0)) e.currentTarget.style.backgroundColor = COLORS.amethyst.hover}}
                          onMouseLeave={(e) => {if (!(cleansePots === 0 || curseLevel === 0)) e.currentTarget.style.backgroundColor = COLORS.amethyst.base}}
                        >
                          Use
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Lucky Charm (if active) */}
                  {luckyCharmActive && (
                    <div className="rounded-lg p-4 border-2" style={{backgroundColor: 'rgba(47, 82, 51, 0.2)', borderColor: 'rgba(47, 82, 51, 0.5)'}}>
                      <div>
                        <p className="font-bold text-lg mb-1" style={{color: '#F5F5DC'}}>Fortune Philter</p>
                        <p className="text-sm mb-1" style={{color: '#68D391'}}>2x loot from next elite boss</p>
                        <p className="text-xs italic" style={{color: COLORS.silver}}>"Fortune favors the bold."</p>
                        <p className="text-xs mt-2" style={{color: '#68D391'}}>Active</p>
                      </div>
                    </div>
                  )}
                    </>
                  ) : suppliesTab === 'weapons' ? (
                    <>
                  {/* Weapon Section */}
                  <div className="rounded-lg p-4 border-2 mb-4" style={{backgroundColor: 'rgba(100, 0, 0, 0.2)', borderColor: 'rgba(120, 0, 0, 0.5)'}}>
                    <h3 className="font-bold text-lg mb-3 text-center" style={{color: '#FF6B6B'}}>EQUIPPED WEAPON</h3>
                    
                    <div className="rounded p-4 border-2 mb-3" style={{
                      backgroundColor: 'rgba(0, 0, 0, 0.4)', 
                      borderColor: equippedWeapon ? getRarityColor(equippedWeapon.rarity || 'common') : 'rgba(192, 192, 192, 0.3)',
                      boxShadow: equippedWeapon ? `0 0 15px ${getRarityColor(equippedWeapon.rarity || 'common')}50` : 'none'
                    }}>
                      {equippedWeapon ? (
                        <div>
                          <p className="text-xl font-bold text-center mb-1" style={{color: getRarityColor(equippedWeapon.rarity || 'common')}}>{equippedWeapon.name}</p>
                          {equippedWeapon.rarity && (
                            <p className="text-xs italic text-center mb-2" style={{color: getRarityColor(equippedWeapon.rarity)}}>
                              {GAME_CONSTANTS.RARITY_TIERS[equippedWeapon.rarity].name}
                            </p>
                          )}
                          <p className="text-base text-center mb-3" style={{color: '#68D391'}}>+{equippedWeapon.attack} Attack</p>
                          {equippedWeapon.affixes && Object.keys(equippedWeapon.affixes).length > 0 && (
                            <>
                              <div className="border-t mx-6 mb-3" style={{borderColor: 'rgba(192, 192, 192, 0.3)'}}></div>
                              <div className="space-y-1">
                                {equippedWeapon.affixes.flatDamage && (
                                  <p className="text-xs" style={{color: '#90EE90'}}>+{Math.floor(equippedWeapon.affixes.flatDamage)} Attack Damage</p>
                                )}
                                {equippedWeapon.affixes.percentDamage && (
                                  <p className="text-xs" style={{color: '#90EE90'}}>+{Math.floor(equippedWeapon.affixes.percentDamage)}% Bonus Damage</p>
                                )}
                                {equippedWeapon.affixes.critChance && (
                                  <p className="text-xs" style={{color: '#FFD700'}}>+{Math.floor(equippedWeapon.affixes.critChance)}% Critical Hit Chance</p>
                                )}
                                {equippedWeapon.affixes.critMultiplier && (
                                  <p className="text-xs" style={{color: '#FFD700'}}>+{equippedWeapon.affixes.critMultiplier.toFixed(1)}x Critical Hit Damage</p>
                                )}
                                {equippedWeapon.affixes.poisonChance && (
                                  <p className="text-xs" style={{color: '#9370DB'}}>+{Math.floor(equippedWeapon.affixes.poisonChance)}% Poison Chance</p>
                                )}
                                {equippedWeapon.affixes.poisonDamage && (
                                  <p className="text-xs" style={{color: '#9370DB'}}>+{Math.floor(equippedWeapon.affixes.poisonDamage)} Poison Damage per Turn</p>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm italic text-center" style={{color: '#95A5A6'}}>No weapon equipped</p>
                      )}
                    </div>
                    
                    <div className="text-center pt-2 border-t" style={{borderColor: 'rgba(192, 192, 192, 0.2)'}}>
                      <p className="text-sm" style={{color: COLORS.silver}}>
                        Total Attack: <span className="font-bold text-lg" style={{color: '#68D391'}}>{getBaseAttack()}</span>
                      </p>
                    </div>
                  </div>
                  
                  {/* Collected Weapons */}
                  {weaponInventory.length > 0 ? (
                    <div className="rounded-lg p-4 border-2 mb-4" style={{backgroundColor: 'rgba(107, 44, 145, 0.2)', borderColor: 'rgba(107, 44, 145, 0.5)'}}>
                      <h3 className="font-bold text-lg mb-2 text-center" style={{color: '#B794F4'}}>COLLECTED WEAPONS</h3>
                      <p className="text-xs text-center mb-3 italic" style={{color: COLORS.silver}}>Weapons found in battle or unequipped</p>
                      
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {sortByRarity(weaponInventory)
                          .map((wpn) => (
                          <div key={wpn.id} className="rounded p-3 border-2 flex justify-between items-center" style={{
                            backgroundColor: 'rgba(0, 0, 0, 0.4)', 
                            borderColor: getRarityColor(wpn.rarity || 'common'),
                            boxShadow: `0 0 10px ${getRarityColor(wpn.rarity || 'common')}40`
                          }}>
                            <div className="flex-1">
                              <p className="text-base font-bold text-center mb-1" style={{color: getRarityColor(wpn.rarity || 'common')}}>{wpn.name}</p>
                              {wpn.rarity && (
                                <p className="text-xs italic text-center mb-1" style={{color: getRarityColor(wpn.rarity)}}>
                                  {GAME_CONSTANTS.RARITY_TIERS[wpn.rarity].name}
                                </p>
                              )}
                              <p className="text-sm text-center mb-2" style={{color: '#68D391'}}>+{wpn.attack} Attack</p>
                              {wpn.affixes && Object.keys(wpn.affixes).length > 0 && (
                                <>
                                  <div className="border-t mx-4 mb-2" style={{borderColor: 'rgba(192, 192, 192, 0.3)'}}></div>
                                  <div className="space-y-0.5">
                                    {wpn.affixes.flatDamage && <p className="text-xs" style={{color: '#90EE90'}}>+{Math.floor(wpn.affixes.flatDamage)} Attack Damage</p>}
                                    {wpn.affixes.percentDamage && <p className="text-xs" style={{color: '#90EE90'}}>+{Math.floor(wpn.affixes.percentDamage)}% Bonus Damage</p>}
                                    {wpn.affixes.critChance && <p className="text-xs" style={{color: '#FFD700'}}>+{Math.floor(wpn.affixes.critChance)}% Critical Hit Chance</p>}
                                    {wpn.affixes.critMultiplier && <p className="text-xs" style={{color: '#FFD700'}}>+{wpn.affixes.critMultiplier.toFixed(1)}x Critical Hit Damage</p>}
                                    {wpn.affixes.poisonChance && <p className="text-xs" style={{color: '#9370DB'}}>+{Math.floor(wpn.affixes.poisonChance)}% Poison Chance</p>}
                                    {wpn.affixes.poisonDamage && <p className="text-xs" style={{color: '#9370DB'}}>+{Math.floor(wpn.affixes.poisonDamage)} Poison Damage per Turn</p>}
                                  </div>
                                </>
                              )}
                            </div>
                            <button
                              onClick={() => {
                                const oldWeapon = equippedWeapon;
                                setEquippedWeapon(wpn);
                                setWeaponInventory(prev => [
                                  ...prev.filter(w => w.id !== wpn.id),
                                  ...(oldWeapon ? [oldWeapon] : [])
                                ]);
                                addLog(`Equipped: ${wpn.name} (+${wpn.attack} Attack)`);
                                if (oldWeapon) {
                                  addLog(`Unequipped: ${oldWeapon.name}`);
                                }
                              }}
                              className="px-3 py-1 rounded-lg text-xs border-2 transition-all font-bold"
                              style={{
                                background: 'linear-gradient(to bottom, rgba(59, 130, 246, 0.7), rgba(29, 78, 216, 0.8))',
                                borderColor: '#3B82F6',
                                color: '#F5F5DC',
                                cursor: 'pointer'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'linear-gradient(to bottom, rgba(96, 165, 250, 0.8), rgba(59, 130, 246, 0.9))';
                                e.currentTarget.style.transform = 'translateY(-1px)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'linear-gradient(to bottom, rgba(59, 130, 246, 0.7), rgba(29, 78, 216, 0.8))';
                                e.currentTarget.style.transform = 'translateY(0)';
                              }}
                            >
                              Equip
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-lg p-6 border-2 text-center mb-4" style={{backgroundColor: 'rgba(107, 44, 145, 0.1)', borderColor: 'rgba(107, 44, 145, 0.3)'}}>
                      <p className="text-sm italic" style={{color: '#95A5A6'}}>No weapons collected yet. Defeat enemies to find weapons.</p>
                    </div>
                  )}
                    </>
                  ) : suppliesTab === 'armor' ? (
                    <>
                  {/* Equipment Section */}
                  <div className="rounded-lg p-4 border-2" style={{backgroundColor: 'rgba(184, 134, 11, 0.2)', borderColor: 'rgba(184, 134, 11, 0.5)'}}>
                    <h3 className="font-bold text-lg mb-3 text-center" style={{color: COLORS.gold}}>EQUIPPED ARMOR</h3>
                    
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      {/* Helmet */}
                      <div className="rounded p-3 border-2" style={{
                        backgroundColor: 'rgba(0, 0, 0, 0.4)', 
                        borderColor: equippedArmor.helmet ? getRarityColor(equippedArmor.helmet.rarity || 'common') : 'rgba(192, 192, 192, 0.3)',
                        boxShadow: equippedArmor.helmet ? `0 0 8px ${getRarityColor(equippedArmor.helmet.rarity || 'common')}40` : 'none'
                      }}>
                        <p className="text-xs uppercase mb-2 text-center font-bold" style={{color: COLORS.silver}}>Helmet</p>
                        {equippedArmor.helmet ? (
                          <div>
                            <p className="text-sm font-bold text-center mb-1" style={{color: getRarityColor(equippedArmor.helmet.rarity || 'common')}}>{equippedArmor.helmet.name}</p>
                            <p className="text-xs text-center mb-1" style={{color: '#68D391'}}>+{equippedArmor.helmet.defense} Defense</p>
                            {equippedArmor.helmet.affixes && Object.keys(equippedArmor.helmet.affixes).length > 0 && (
                              <>
                                <div className="border-t mx-2 mb-1 mt-2" style={{borderColor: 'rgba(192, 192, 192, 0.3)'}}></div>
                                <div className="space-y-0.5">
                                  {equippedArmor.helmet.affixes.flatArmor && <p className="text-xs" style={{color: '#68D391'}}>+{Math.floor(equippedArmor.helmet.affixes.flatArmor)} Armor</p>}
                                  {equippedArmor.helmet.affixes.percentDR && <p className="text-xs" style={{color: '#68D391'}}>+{Math.floor(equippedArmor.helmet.affixes.percentDR)}% Damage Reduction</p>}
                                  {equippedArmor.helmet.affixes.flatHP && <p className="text-xs" style={{color: '#68D391'}}>+{Math.floor(equippedArmor.helmet.affixes.flatHP)} Maximum Health</p>}
                                </div>
                              </>
                            )}
                          </div>
                        ) : (
                          <p className="text-xs italic text-center" style={{color: '#95A5A6'}}>Empty</p>
                        )}
                      </div>
                      
                      {/* Chest */}
                      <div className="rounded p-3 border-2" style={{
                        backgroundColor: 'rgba(0, 0, 0, 0.4)', 
                        borderColor: equippedArmor.chest ? getRarityColor(equippedArmor.chest.rarity || 'common') : 'rgba(192, 192, 192, 0.3)',
                        boxShadow: equippedArmor.chest ? `0 0 8px ${getRarityColor(equippedArmor.chest.rarity || 'common')}40` : 'none'
                      }}>
                        <p className="text-xs uppercase mb-2 text-center font-bold" style={{color: COLORS.silver}}>Chest</p>
                        {equippedArmor.chest ? (
                          <div>
                            <p className="text-sm font-bold text-center mb-1" style={{color: getRarityColor(equippedArmor.chest.rarity || 'common')}}>{equippedArmor.chest.name}</p>
                            <p className="text-xs text-center mb-1" style={{color: '#68D391'}}>+{equippedArmor.chest.defense} Defense</p>
                            {equippedArmor.chest.affixes && Object.keys(equippedArmor.chest.affixes).length > 0 && (
                              <>
                                <div className="border-t mx-2 mb-1 mt-2" style={{borderColor: 'rgba(192, 192, 192, 0.3)'}}></div>
                                <div className="space-y-0.5">
                                  {equippedArmor.chest.affixes.flatArmor && <p className="text-xs" style={{color: '#68D391'}}>+{Math.floor(equippedArmor.chest.affixes.flatArmor)} Armor</p>}
                                  {equippedArmor.chest.affixes.percentDR && <p className="text-xs" style={{color: '#68D391'}}>+{Math.floor(equippedArmor.chest.affixes.percentDR)}% Damage Reduction</p>}
                                  {equippedArmor.chest.affixes.flatHP && <p className="text-xs" style={{color: '#68D391'}}>+{Math.floor(equippedArmor.chest.affixes.flatHP)} Maximum Health</p>}
                                </div>
                              </>
                            )}
                          </div>
                        ) : (
                          <p className="text-xs italic text-center" style={{color: '#95A5A6'}}>Empty</p>
                        )}
                      </div>
                      
                      {/* Gloves */}
                      <div className="rounded p-3 border-2" style={{
                        backgroundColor: 'rgba(0, 0, 0, 0.4)', 
                        borderColor: equippedArmor.gloves ? getRarityColor(equippedArmor.gloves.rarity || 'common') : 'rgba(192, 192, 192, 0.3)',
                        boxShadow: equippedArmor.gloves ? `0 0 8px ${getRarityColor(equippedArmor.gloves.rarity || 'common')}40` : 'none'
                      }}>
                        <p className="text-xs uppercase mb-2 text-center font-bold" style={{color: COLORS.silver}}>Gloves</p>
                        {equippedArmor.gloves ? (
                          <div>
                            <p className="text-sm font-bold text-center mb-1" style={{color: getRarityColor(equippedArmor.gloves.rarity || 'common')}}>{equippedArmor.gloves.name}</p>
                            <p className="text-xs text-center mb-1" style={{color: '#68D391'}}>+{equippedArmor.gloves.defense} Defense</p>
                            {equippedArmor.gloves.affixes && Object.keys(equippedArmor.gloves.affixes).length > 0 && (
                              <>
                                <div className="border-t mx-2 mb-1 mt-2" style={{borderColor: 'rgba(192, 192, 192, 0.3)'}}></div>
                                <div className="space-y-0.5">
                                  {equippedArmor.gloves.affixes.flatArmor && <p className="text-xs" style={{color: '#68D391'}}>+{Math.floor(equippedArmor.gloves.affixes.flatArmor)} Armor</p>}
                                  {equippedArmor.gloves.affixes.percentDR && <p className="text-xs" style={{color: '#68D391'}}>+{Math.floor(equippedArmor.gloves.affixes.percentDR)}% Damage Reduction</p>}
                                  {equippedArmor.gloves.affixes.flatHP && <p className="text-xs" style={{color: '#68D391'}}>+{Math.floor(equippedArmor.gloves.affixes.flatHP)} Maximum Health</p>}
                                </div>
                              </>
                            )}
                          </div>
                        ) : (
                          <p className="text-xs italic text-center" style={{color: '#95A5A6'}}>Empty</p>
                        )}
                      </div>
                      
                      {/* Boots */}
                      <div className="rounded p-3 border-2" style={{
                        backgroundColor: 'rgba(0, 0, 0, 0.4)', 
                        borderColor: equippedArmor.boots ? getRarityColor(equippedArmor.boots.rarity || 'common') : 'rgba(192, 192, 192, 0.3)',
                        boxShadow: equippedArmor.boots ? `0 0 8px ${getRarityColor(equippedArmor.boots.rarity || 'common')}40` : 'none'
                      }}>
                        <p className="text-xs uppercase mb-2 text-center font-bold" style={{color: COLORS.silver}}>Boots</p>
                        {equippedArmor.boots ? (
                          <div>
                            <p className="text-sm font-bold text-center mb-1" style={{color: getRarityColor(equippedArmor.boots.rarity || 'common')}}>{equippedArmor.boots.name}</p>
                            <p className="text-xs text-center mb-1" style={{color: '#68D391'}}>+{equippedArmor.boots.defense} Defense</p>
                            {equippedArmor.boots.affixes && Object.keys(equippedArmor.boots.affixes).length > 0 && (
                              <>
                                <div className="border-t mx-2 mb-1 mt-2" style={{borderColor: 'rgba(192, 192, 192, 0.3)'}}></div>
                                <div className="space-y-0.5">
                                  {equippedArmor.boots.affixes.flatArmor && <p className="text-xs" style={{color: '#68D391'}}>+{Math.floor(equippedArmor.boots.affixes.flatArmor)} Armor</p>}
                                  {equippedArmor.boots.affixes.percentDR && <p className="text-xs" style={{color: '#68D391'}}>+{Math.floor(equippedArmor.boots.affixes.percentDR)}% Damage Reduction</p>}
                                  {equippedArmor.boots.affixes.flatHP && <p className="text-xs" style={{color: '#68D391'}}>+{Math.floor(equippedArmor.boots.affixes.flatHP)} Maximum Health</p>}
                                </div>
                              </>
                            )}
                          </div>
                        ) : (
                          <p className="text-xs italic text-center" style={{color: '#95A5A6'}}>Empty</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-center pt-2 border-t" style={{borderColor: 'rgba(192, 192, 192, 0.2)'}}>
                      <p className="text-sm" style={{color: COLORS.silver}}>
                        Total Defense: <span className="font-bold text-lg" style={{color: COLORS.gold}}>{getBaseDefense()}</span>
                      </p>
                    </div>
                  </div>
                  
                  {/* Armor Inventory */}
                  {(armorInventory.helmet.length > 0 || armorInventory.chest.length > 0 || armorInventory.gloves.length > 0 || armorInventory.boots.length > 0) ? (
                    <div className="rounded-lg p-4 border-2" style={{backgroundColor: 'rgba(47, 82, 51, 0.2)', borderColor: 'rgba(47, 82, 51, 0.5)'}}>
                      <h3 className="font-bold text-lg mb-2 text-center" style={{color: '#68D391'}}>COLLECTED ARMOR</h3>
                      <p className="text-xs text-center mb-3 italic" style={{color: COLORS.silver}}>Pieces found in battle or unequipped</p>
                      
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {['helmet', 'chest', 'gloves', 'boots'].map(slot => 
                          armorInventory[slot].length > 0 ? (
                            <div key={slot}>
                              <p className="text-xs uppercase mb-2 font-bold" style={{color: COLORS.silver}}>{slot}s</p>
                              {sortByRarity(armorInventory[slot])
                                .map((piece, idx) => (
                                <div key={piece.id} className="rounded p-3 mb-2 border-2 flex justify-between items-center" style={{
                                  backgroundColor: 'rgba(0, 0, 0, 0.4)', 
                                  borderColor: getRarityColor(piece.rarity || 'common'),
                                  boxShadow: `0 0 10px ${getRarityColor(piece.rarity || 'common')}40`
                                }}>
                                  <div className="flex-1">
                                    <p className="text-base font-bold text-center mb-1" style={{color: getRarityColor(piece.rarity || 'common')}}>{piece.name}</p>
                                    {piece.rarity && (
                                      <p className="text-xs italic text-center mb-1" style={{color: getRarityColor(piece.rarity)}}>
                                        {GAME_CONSTANTS.RARITY_TIERS[piece.rarity].name}
                                      </p>
                                    )}
                                    <p className="text-sm text-center mb-2" style={{color: '#68D391'}}>+{piece.defense} Defense</p>
                                    {piece.affixes && Object.keys(piece.affixes).length > 0 && (
                                      <>
                                        <div className="border-t mx-4 mb-2" style={{borderColor: 'rgba(192, 192, 192, 0.3)'}}></div>
                                        <div className="space-y-0.5">
                                          {piece.affixes.flatArmor && <p className="text-xs" style={{color: '#68D391'}}>+{Math.floor(piece.affixes.flatArmor)} Armor</p>}
                                          {piece.affixes.percentDR && <p className="text-xs" style={{color: '#68D391'}}>+{Math.floor(piece.affixes.percentDR)}% Damage Reduction</p>}
                                          {piece.affixes.flatHP && <p className="text-xs" style={{color: '#68D391'}}>+{Math.floor(piece.affixes.flatHP)} Maximum Health</p>}
                                        </div>
                                      </>
                                    )}
                                  </div>
                                  <button
                                    onClick={() => {
                                      // Get the currently equipped piece (if any)
                                      const oldPiece = equippedArmor[slot];
                                      
                                      // Equip the new piece
                                      setEquippedArmor(prev => ({ ...prev, [slot]: piece }));
                                      
                                      // Update inventory: remove the new piece, add the old piece (if it exists)
                                      setArmorInventory(prev => ({
                                        ...prev,
                                        [slot]: [
                                          ...prev[slot].filter(p => p.id !== piece.id),
                                          ...(oldPiece ? [oldPiece] : [])
                                        ]
                                      }));
                                      
                                      addLog(`Equipped: ${piece.name} (+${piece.defense} Defense)`);
                                      if (oldPiece) {
                                        addLog(`Unequipped: ${oldPiece.name}`);
                                      }
                                    }}
                                    className="px-3 py-1 rounded-lg text-xs border-2 transition-all font-bold"
                                    style={{
                                      background: 'linear-gradient(to bottom, rgba(59, 130, 246, 0.7), rgba(29, 78, 216, 0.8))',
                                      borderColor: '#3B82F6',
                                      color: '#F5F5DC',
                                      cursor: 'pointer'
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.background = 'linear-gradient(to bottom, rgba(96, 165, 250, 0.8), rgba(59, 130, 246, 0.9))';
                                      e.currentTarget.style.transform = 'translateY(-1px)';
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.background = 'linear-gradient(to bottom, rgba(59, 130, 246, 0.7), rgba(29, 78, 216, 0.8))';
                                      e.currentTarget.style.transform = 'translateY(0)';
                                    }}
                                  >
                                    Equip
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : null
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-lg p-6 border-2 text-center" style={{backgroundColor: 'rgba(47, 82, 51, 0.1)', borderColor: 'rgba(47, 82, 51, 0.3)'}}>
                      <p className="text-sm italic" style={{color: '#95A5A6'}}>No armor collected yet. Defeat enemies to find armor pieces.</p>
                    </div>
                  )}
                    </>
                  ) : (
                    <>
                  {/* Gear Section - Pendant and Ring */}
                  <div className="rounded-lg p-4 border-2 mb-4" style={{backgroundColor: 'rgba(75, 0, 130, 0.2)', borderColor: 'rgba(75, 0, 130, 0.5)'}}>
                    <h3 className="font-bold text-lg mb-3 text-center" style={{color: '#9370DB'}}>EQUIPPED GEAR</h3>
                    
                    <div className="space-y-3 mb-4">
                      {/* Pendant */}
                      <div className="rounded p-3 border" style={{backgroundColor: 'rgba(0, 0, 0, 0.4)', borderColor: 'rgba(192, 192, 192, 0.4)'}}>
                        <p className="text-xs uppercase mb-2" style={{color: COLORS.silver}}>Pendant</p>
                        {equippedPendant ? (
                          <div>
                            <p className="text-sm font-bold" style={{color: getRarityColor(equippedPendant.rarity || 'common')}}>{equippedPendant.name}</p>
                            <p className="text-xs" style={{color: '#68D391'}}>+{equippedPendant.hp} Health</p>
                            {equippedPendant.rarity && (
                              <p className="text-xs italic mt-1" style={{color: getRarityColor(equippedPendant.rarity)}}>
                                {GAME_CONSTANTS.RARITY_TIERS[equippedPendant.rarity].name}
                              </p>
                            )}
                          </div>
                        ) : (
                          <p className="text-xs italic" style={{color: '#95A5A6'}}>Empty</p>
                        )}
                      </div>
                      
                      {/* Ring */}
                      <div className="rounded p-3 border" style={{backgroundColor: 'rgba(0, 0, 0, 0.4)', borderColor: 'rgba(192, 192, 192, 0.4)'}}>
                        <p className="text-xs uppercase mb-2" style={{color: COLORS.silver}}>Ring</p>
                        {equippedRing ? (
                          <div>
                            <p className="text-sm font-bold" style={{color: getRarityColor(equippedRing.rarity || 'common')}}>{equippedRing.name}</p>
                            <p className="text-xs" style={{color: '#4FC3F7'}}>+{equippedRing.stamina} STA</p>
                            {equippedRing.rarity && (
                              <p className="text-xs italic mt-1" style={{color: getRarityColor(equippedRing.rarity)}}>
                                {GAME_CONSTANTS.RARITY_TIERS[equippedRing.rarity].name}
                              </p>
                            )}
                          </div>
                        ) : (
                          <p className="text-xs italic" style={{color: '#95A5A6'}}>Empty</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-center pt-2 border-t" style={{borderColor: 'rgba(192, 192, 192, 0.2)'}}>
                      <p className="text-sm" style={{color: COLORS.silver}}>
                        Max HP: <span className="font-bold text-lg" style={{color: '#FF6B6B', opacity: 0.95}}>{getMaxHp()}</span>
                        {' | '}
                        Max STA: <span className="font-bold text-lg" style={{color: '#4FC3F7', opacity: 0.95}}>{getMaxStamina()}</span>
                      </p>
                    </div>
                  </div>
                  
                  {/* Collected Pendants */}
                  {pendantInventory.length > 0 && (
                    <div className="rounded-lg p-4 border-2 mb-4" style={{backgroundColor: 'rgba(139, 0, 0, 0.2)', borderColor: 'rgba(139, 0, 0, 0.5)'}}>
                      <h3 className="font-bold text-lg mb-2 text-center" style={{color: '#FF6B6B'}}>PENDANTS</h3>
                      <p className="text-xs text-center mb-3 italic" style={{color: COLORS.silver}}>Increase maximum health</p>
                      
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {sortByRarity(pendantInventory)
                          .map((pend) => (
                          <div key={pend.id} className="rounded p-2 border flex justify-between items-center" style={{backgroundColor: 'rgba(0, 0, 0, 0.3)', borderColor: 'rgba(192, 192, 192, 0.3)'}}>
                            <div>
                              <p className="text-sm font-bold" style={{color: getRarityColor(pend.rarity || 'common')}}>{pend.name}</p>
                              <p className="text-xs" style={{color: '#68D391'}}>+{pend.hp} Health</p>
                              {pend.rarity && (
                                <p className="text-xs italic" style={{color: getRarityColor(pend.rarity)}}>
                                  {GAME_CONSTANTS.RARITY_TIERS[pend.rarity].name}
                                </p>
                              )}
                            </div>
                            <button
                              onClick={() => {
                                const oldPendant = equippedPendant;
                                setEquippedPendant(pend);
                                setPendantInventory(prev => [
                                  ...prev.filter(p => p.id !== pend.id),
                                  ...(oldPendant ? [oldPendant] : [])
                                ]);
                                addLog(`Equipped: ${pend.name} (+${pend.hp} Health)`);
                                if (oldPendant) {
                                  addLog(`Unequipped: ${oldPendant.name}`);
                                }
                              }}
                              className="px-3 py-1 rounded-lg text-xs border-2 transition-all font-bold"
                              style={{
                                background: 'linear-gradient(to bottom, rgba(59, 130, 246, 0.7), rgba(29, 78, 216, 0.8))',
                                borderColor: '#3B82F6',
                                color: '#F5F5DC',
                                cursor: 'pointer'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'linear-gradient(to bottom, rgba(96, 165, 250, 0.8), rgba(59, 130, 246, 0.9))';
                                e.currentTarget.style.transform = 'translateY(-1px)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'linear-gradient(to bottom, rgba(59, 130, 246, 0.7), rgba(29, 78, 216, 0.8))';
                                e.currentTarget.style.transform = 'translateY(0)';
                              }}
                            >
                              Equip
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Collected Rings */}
                  {ringInventory.length > 0 && (
                    <div className="rounded-lg p-4 border-2 mb-4" style={{backgroundColor: 'rgba(0, 150, 255, 0.2)', borderColor: 'rgba(0, 150, 255, 0.5)'}}>
                      <h3 className="font-bold text-lg mb-2 text-center" style={{color: '#4FC3F7'}}>RINGS</h3>
                      <p className="text-xs text-center mb-3 italic" style={{color: COLORS.silver}}>Increase maximum stamina</p>
                      
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {sortByRarity(ringInventory)
                          .map((rng) => (
                          <div key={rng.id} className="rounded p-2 border flex justify-between items-center" style={{backgroundColor: 'rgba(0, 0, 0, 0.3)', borderColor: 'rgba(192, 192, 192, 0.3)'}}>
                            <div>
                              <p className="text-sm font-bold" style={{color: getRarityColor(rng.rarity || 'common')}}>{rng.name}</p>
                              <p className="text-xs" style={{color: '#4FC3F7'}}>+{rng.stamina} STA</p>
                              {rng.rarity && (
                                <p className="text-xs italic" style={{color: getRarityColor(rng.rarity)}}>
                                  {GAME_CONSTANTS.RARITY_TIERS[rng.rarity].name}
                                </p>
                              )}
                            </div>
                            <button
                              onClick={() => {
                                const oldRing = equippedRing;
                                setEquippedRing(rng);
                                setRingInventory(prev => [
                                  ...prev.filter(r => r.id !== rng.id),
                                  ...(oldRing ? [oldRing] : [])
                                ]);
                                addLog(`Equipped: ${rng.name} (+${rng.stamina} STA)`);
                                if (oldRing) {
                                  addLog(`Unequipped: ${oldRing.name}`);
                                }
                              }}
                              className="px-3 py-1 rounded-lg text-xs border-2 transition-all font-bold"
                              style={{
                                background: 'linear-gradient(to bottom, rgba(59, 130, 246, 0.7), rgba(29, 78, 216, 0.8))',
                                borderColor: '#3B82F6',
                                color: '#F5F5DC',
                                cursor: 'pointer'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'linear-gradient(to bottom, rgba(96, 165, 250, 0.8), rgba(59, 130, 246, 0.9))';
                                e.currentTarget.style.transform = 'translateY(-1px)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'linear-gradient(to bottom, rgba(59, 130, 246, 0.7), rgba(29, 78, 216, 0.8))';
                                e.currentTarget.style.transform = 'translateY(0)';
                              }}
                            >
                              Equip
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {pendantInventory.length === 0 && ringInventory.length === 0 && (
                    <div className="rounded-lg p-6 border-2 text-center" style={{backgroundColor: 'rgba(75, 0, 130, 0.1)', borderColor: 'rgba(75, 0, 130, 0.3)'}}>
                      <p className="text-sm italic" style={{color: '#95A5A6'}}>No accessories collected yet. Defeat enemies to find pendants and rings.</p>
                    </div>
                  )}
                    </>
                  )}
                </div>
              </div>
            </div>
  );
};

export default InventoryModal;
