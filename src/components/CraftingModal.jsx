import React from 'react';
import { X, Check } from 'lucide-react';
import { COLORS, VISUAL_STYLES, GAME_CONSTANTS } from '../constants';

const CraftingModal = ({
  setShowCraftingModal,
  craftingTab,
  setCraftingTab,
  // Player state
  hp,
  stamina,
  level,
  gold,
  currentDay,
  // Consumables
  healthPots,
  staminaPots,
  cleansePots,
  cleansePotionPurchasedToday,
  // Buffs
  weaponOilActive,
  armorPolishActive,
  luckyCharmActive,
  // Equipment inventories
  weaponInventory,
  armorInventory,
  pendantInventory,
  ringInventory,
  // Shop/merchant
  shopInventory,
  merchantTab,
  setMerchantTab,
  marketModifiers,
  // Study links (also in this modal's 'links' tab)
  studyWebsites,
  newWebsiteName,
  setNewWebsiteName,
  newWebsiteUrl,
  setNewWebsiteUrl,
  newWebsiteCategory,
  setNewWebsiteCategory,
  // Helpers
  getMerchantDialogue,
  getPotionPrice,
  calculateSellPrice,
  getRarityColor,
  sortByRarity,
  addLog,
  // Action callbacks
  buyItem,
  purchaseShopItem,
  sellEquipment,
  sellPotion,
  craftItem,
  addStudyWebsite,
  removeStudyWebsite,
  trackWebsiteClick,
}) => {
  return (
            <div className="fixed inset-0 bg-black bg-opacity-90 flex items-start justify-center p-4 z-50 overflow-y-auto" onClick={() => setShowCraftingModal(false)}>
              <div className="rounded-xl p-6 max-w-2xl w-full border-2 my-8 relative" style={{background: VISUAL_STYLES.modal.paper, borderColor: COLORS.silver, boxShadow: VISUAL_STYLES.shadow.elevated}} onClick={e => e.stopPropagation()}>
                <button 
                  onClick={() => setShowCraftingModal(false)} 
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
                  <h2 className="text-3xl font-bold mb-2" style={{
                    color: '#D4AF37',
                    fontFamily: 'Cinzel, serif',
                    letterSpacing: '0.1em',
                    textShadow: '0 0 20px rgba(212, 175, 55, 0.3)'
                  }}>
                    THE MERCHANT
                  </h2>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <div style={{width: '120px', height: '1px', background: 'linear-gradient(to right, transparent, rgba(212, 175, 55, 0.5))'}}></div>
                    <span style={{color: 'rgba(212, 175, 55, 0.6)', fontSize: '8px'}}>◆</span>
                    <div style={{width: '120px', height: '1px', background: 'linear-gradient(to left, transparent, rgba(212, 175, 55, 0.5))'}}></div>
                  </div>
                  <p className="text-sm mt-2 italic" style={{color: COLORS.silver}}>"{getMerchantDialogue()}"</p>
                </div>
                
                {/* Main Tabs: Potions / Equipment */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <button
                    onClick={() => {
                      if (merchantTab === 'buy' || merchantTab === 'sellPotions') {
                        setMerchantTab('buy'); // Stay in potions section
                      } else {
                        setMerchantTab('buy'); // Enter potions section
                      }
                    }}
                    className="py-3 rounded-lg font-bold uppercase text-sm transition-all border-2"
                    style={{
                      background: (merchantTab === 'buy' || merchantTab === 'sellPotions') 
                        ? 'linear-gradient(to bottom, rgba(168, 85, 247, 0.7), rgba(126, 34, 206, 0.8))' 
                        : 'linear-gradient(to bottom, rgba(80, 40, 120, 0.3), rgba(60, 30, 90, 0.4))',
                      borderColor: (merchantTab === 'buy' || merchantTab === 'sellPotions') ? '#A855F7' : 'rgba(168, 85, 247, 0.4)',
                      color: '#F5F5DC',
                      boxShadow: (merchantTab === 'buy' || merchantTab === 'sellPotions') ? '0 0 15px rgba(168, 85, 247, 0.3)' : 'none'
                    }}
                    onMouseEnter={(e) => {
                      if (merchantTab === 'buy' || merchantTab === 'sellPotions') {
                        e.currentTarget.style.background = 'linear-gradient(to bottom, rgba(192, 132, 252, 0.8), rgba(147, 51, 234, 0.9))';
                      } else {
                        e.currentTarget.style.background = 'linear-gradient(to bottom, rgba(100, 50, 150, 0.4), rgba(80, 40, 120, 0.5))';
                      }
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      if (merchantTab === 'buy' || merchantTab === 'sellPotions') {
                        e.currentTarget.style.background = 'linear-gradient(to bottom, rgba(168, 85, 247, 0.7), rgba(126, 34, 206, 0.8))';
                      } else {
                        e.currentTarget.style.background = 'linear-gradient(to bottom, rgba(80, 40, 120, 0.3), rgba(60, 30, 90, 0.4))';
                      }
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    Potions
                  </button>
                  <button
                    onClick={() => {
                      if (merchantTab === 'buyEquipment' || merchantTab === 'sellEquipment') {
                        setMerchantTab('buyEquipment'); // Stay in equipment section
                      } else {
                        setMerchantTab('buyEquipment'); // Enter equipment section
                      }
                    }}
                    className="py-3 rounded-lg font-bold uppercase text-sm transition-all border-2"
                    style={{
                      background: (merchantTab === 'buyEquipment' || merchantTab === 'sellEquipment') 
                        ? 'linear-gradient(to bottom, rgba(220, 38, 38, 0.7), rgba(153, 27, 27, 0.8))' 
                        : 'linear-gradient(to bottom, rgba(100, 20, 20, 0.3), rgba(80, 15, 15, 0.4))',
                      borderColor: (merchantTab === 'buyEquipment' || merchantTab === 'sellEquipment') ? '#DC2626' : 'rgba(220, 38, 38, 0.4)',
                      color: '#F5F5DC',
                      boxShadow: (merchantTab === 'buyEquipment' || merchantTab === 'sellEquipment') ? '0 0 15px rgba(220, 38, 38, 0.3)' : 'none'
                    }}
                    onMouseEnter={(e) => {
                      if (merchantTab === 'buyEquipment' || merchantTab === 'sellEquipment') {
                        e.currentTarget.style.background = 'linear-gradient(to bottom, rgba(239, 68, 68, 0.8), rgba(185, 28, 28, 0.9))';
                      } else {
                        e.currentTarget.style.background = 'linear-gradient(to bottom, rgba(120, 25, 25, 0.4), rgba(100, 20, 20, 0.5))';
                      }
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      if (merchantTab === 'buyEquipment' || merchantTab === 'sellEquipment') {
                        e.currentTarget.style.background = 'linear-gradient(to bottom, rgba(220, 38, 38, 0.7), rgba(153, 27, 27, 0.8))';
                      } else {
                        e.currentTarget.style.background = 'linear-gradient(to bottom, rgba(100, 20, 20, 0.3), rgba(80, 15, 15, 0.4))';
                      }
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    Equipment
                  </button>
                </div>
                
                {/* Potions Sub-tabs (Buy/Sell) - Appear below when Potions is selected */}
                {(merchantTab === 'buy' || merchantTab === 'sellPotions') && (
                  <div className="rounded-lg p-2 mb-6 border" style={{
                    background: 'rgba(168, 85, 247, 0.15)',
                    borderColor: 'rgba(168, 85, 247, 0.3)'
                  }}>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setMerchantTab('buy')}
                        className="py-2 rounded-lg font-bold text-sm transition-all border-2"
                        style={{
                          background: merchantTab === 'buy' 
                            ? 'linear-gradient(to bottom, rgba(184, 134, 11, 0.8), rgba(139, 101, 8, 0.8))' 
                            : 'rgba(0, 0, 0, 0.3)',
                          borderColor: merchantTab === 'buy' ? '#D4AF37' : 'rgba(184, 134, 11, 0.3)',
                          color: '#F5F5DC',
                          cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => {
                          if (merchantTab === 'buy') {
                            e.currentTarget.style.background = 'linear-gradient(to bottom, rgba(218, 165, 32, 0.9), rgba(184, 134, 11, 0.9))';
                          } else {
                            e.currentTarget.style.background = 'rgba(40, 40, 40, 0.4)';
                          }
                          e.currentTarget.style.transform = 'translateY(-1px)';
                        }}
                        onMouseLeave={(e) => {
                          if (merchantTab === 'buy') {
                            e.currentTarget.style.background = 'linear-gradient(to bottom, rgba(184, 134, 11, 0.8), rgba(139, 101, 8, 0.8))';
                          } else {
                            e.currentTarget.style.background = 'rgba(0, 0, 0, 0.3)';
                          }
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                      >
                        Buy
                      </button>
                      <button
                        onClick={() => setMerchantTab('sellPotions')}
                        className="py-2 rounded-lg font-bold text-sm transition-all border-2"
                        style={{
                          background: merchantTab === 'sellPotions' 
                            ? 'linear-gradient(to bottom, rgba(34, 197, 94, 0.8), rgba(22, 163, 74, 0.8))' 
                            : 'rgba(0, 0, 0, 0.3)',
                          borderColor: merchantTab === 'sellPotions' ? '#22C55E' : 'rgba(34, 197, 94, 0.3)',
                          color: '#F5F5DC',
                          cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => {
                          if (merchantTab === 'sellPotions') {
                            e.currentTarget.style.background = 'linear-gradient(to bottom, rgba(74, 222, 128, 0.9), rgba(34, 197, 94, 0.9))';
                          } else {
                            e.currentTarget.style.background = 'rgba(40, 40, 40, 0.4)';
                          }
                          e.currentTarget.style.transform = 'translateY(-1px)';
                        }}
                        onMouseLeave={(e) => {
                          if (merchantTab === 'sellPotions') {
                            e.currentTarget.style.background = 'linear-gradient(to bottom, rgba(34, 197, 94, 0.8), rgba(22, 163, 74, 0.8))';
                          } else {
                            e.currentTarget.style.background = 'rgba(0, 0, 0, 0.3)';
                          }
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                      >
                        Sell
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Equipment Sub-tabs (Buy/Sell) - Appear below when Equipment is selected */}
                {(merchantTab === 'buyEquipment' || merchantTab === 'sellEquipment') && (
                  <div className="rounded-lg p-2 mb-6 border" style={{
                    background: 'rgba(139, 0, 0, 0.15)',
                    borderColor: 'rgba(139, 0, 0, 0.3)'
                  }}>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setMerchantTab('buyEquipment')}
                        className="py-2 rounded-lg font-bold text-sm transition-all border-2"
                        style={{
                          background: merchantTab === 'buyEquipment' 
                            ? 'linear-gradient(to bottom, rgba(184, 134, 11, 0.8), rgba(139, 101, 8, 0.8))' 
                            : 'rgba(0, 0, 0, 0.3)',
                          borderColor: merchantTab === 'buyEquipment' ? '#D4AF37' : 'rgba(184, 134, 11, 0.3)',
                          color: '#F5F5DC',
                          cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => {
                          if (merchantTab === 'buyEquipment') {
                            e.currentTarget.style.background = 'linear-gradient(to bottom, rgba(218, 165, 32, 0.9), rgba(184, 134, 11, 0.9))';
                          } else {
                            e.currentTarget.style.background = 'rgba(40, 40, 40, 0.4)';
                          }
                          e.currentTarget.style.transform = 'translateY(-1px)';
                        }}
                        onMouseLeave={(e) => {
                          if (merchantTab === 'buyEquipment') {
                            e.currentTarget.style.background = 'linear-gradient(to bottom, rgba(184, 134, 11, 0.8), rgba(139, 101, 8, 0.8))';
                          } else {
                            e.currentTarget.style.background = 'rgba(0, 0, 0, 0.3)';
                          }
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                      >
                        Buy
                      </button>
                      <button
                        onClick={() => setMerchantTab('sellEquipment')}
                        className="py-2 rounded-lg font-bold text-sm transition-all border-2"
                        style={{
                          background: merchantTab === 'sellEquipment' 
                            ? 'linear-gradient(to bottom, rgba(34, 197, 94, 0.8), rgba(22, 163, 74, 0.8))' 
                            : 'rgba(0, 0, 0, 0.3)',
                          borderColor: merchantTab === 'sellEquipment' ? '#22C55E' : 'rgba(34, 197, 94, 0.3)',
                          color: '#F5F5DC',
                          cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => {
                          if (merchantTab === 'sellEquipment') {
                            e.currentTarget.style.background = 'linear-gradient(to bottom, rgba(74, 222, 128, 0.9), rgba(34, 197, 94, 0.9))';
                          } else {
                            e.currentTarget.style.background = 'rgba(40, 40, 40, 0.4)';
                          }
                          e.currentTarget.style.transform = 'translateY(-1px)';
                        }}
                        onMouseLeave={(e) => {
                          if (merchantTab === 'sellEquipment') {
                            e.currentTarget.style.background = 'linear-gradient(to bottom, rgba(34, 197, 94, 0.8), rgba(22, 163, 74, 0.8))';
                          } else {
                            e.currentTarget.style.background = 'rgba(0, 0, 0, 0.3)';
                          }
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                      >
                        Sell
                      </button>
                    </div>
                  </div>
                )}
                
                
                <div className="rounded-lg p-4 mb-6 border-2" style={{
                  background: 'rgba(184, 134, 11, 0.2)',
                  borderColor: 'rgba(212, 175, 55, 0.4)'
                }}>
                  <p className="text-center text-lg">
                    <span style={{color: COLORS.silver}}>Current Gold:</span> 
                    <span className="font-bold text-2xl ml-2" style={{color: '#D4AF37'}}>{gold}</span>
                  </p>
                </div>
                
                {/* Buy Potions Tab */}
                {merchantTab === 'buy' && (
                <div>
                  {/* Potion Market Status */}
                  <div className="rounded-lg p-2 mb-4 border" style={{
                    background: 'rgba(0, 0, 0, 0.3)',
                    borderColor: 'rgba(212, 175, 55, 0.3)'
                  }}>
                    <p className="text-xs font-bold mb-2 text-center" style={{color: '#D4AF37'}}>TODAY'S MARKET RATES</p>
                    <div className="flex justify-center gap-4 text-xs">
                      <div className="text-center">
                        <p style={{color: COLORS.silver}}>Health</p>
                        <p className="font-bold" style={{color: marketModifiers.healthPotion < 0.9 ? '#68D391' : marketModifiers.healthPotion > 1.1 ? '#FF6B6B' : '#F5F5DC'}}>
                          {marketModifiers.healthPotion < 0.9 ? 'SALE' : marketModifiers.healthPotion > 1.1 ? 'HIGH' : 'NORMAL'}
                        </p>
                      </div>
                      <div className="text-center">
                        <p style={{color: COLORS.silver}}>Stamina</p>
                        <p className="font-bold" style={{color: marketModifiers.staminaPotion < 0.9 ? '#68D391' : marketModifiers.staminaPotion > 1.1 ? '#FF6B6B' : '#F5F5DC'}}>
                          {marketModifiers.staminaPotion < 0.9 ? 'SALE' : marketModifiers.staminaPotion > 1.1 ? 'HIGH' : 'NORMAL'}
                        </p>
                      </div>
                      <div className="text-center">
                        <p style={{color: COLORS.silver}}>Cleanse</p>
                        <p className="font-bold" style={{color: marketModifiers.cleansePotion < 0.9 ? '#68D391' : marketModifiers.cleansePotion > 1.1 ? '#FF6B6B' : '#F5F5DC'}}>
                          {marketModifiers.cleansePotion < 0.9 ? 'SALE' : marketModifiers.cleansePotion > 1.1 ? 'HIGH' : 'NORMAL'}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs italic text-center mt-2" style={{color: '#9CA3AF'}}>Prices refresh daily</p>
                  </div>
                  
                <div className="grid grid-cols-3 gap-2">
                  {(() => {
                    const healthPrice = getPotionPrice('healthPotion', 25);
                    const staminaPrice = getPotionPrice('staminaPotion', 20);
                    const cleansePrice = getPotionPrice('cleansePotion', 250);
                    const weaponOilPrice = getPotionPrice('weaponOil', 40);
                    const armorPolishPrice = getPotionPrice('armorPolish', 40);
                    const luckyCharmPrice = getPotionPrice('luckyCharm', 80);
                    
                    return (<>
                  <button 
                    onClick={() => craftItem('healthPotion')} 
                    disabled={gold < healthPrice}
                    className="p-2 rounded-lg border-2 transition-all cursor-pointer relative overflow-hidden" 
                    style={{
                      background: gold >= healthPrice 
                        ? 'linear-gradient(135deg, rgba(180, 35, 35, 0.35) 0%, rgba(130, 25, 25, 0.4) 50%, rgba(100, 22, 22, 0.45) 100%)' 
                        : 'rgba(44, 62, 80, 0.3)', 
                      borderColor: gold >= healthPrice ? 'rgba(180, 35, 35, 0.6)' : 'rgba(149, 165, 166, 0.3)', 
                      opacity: gold >= healthPrice ? 1 : 0.5, 
                      cursor: gold >= healthPrice ? 'pointer' : 'not-allowed',
                      boxShadow: gold >= healthPrice ? VISUAL_STYLES.shadow.subtle : 'none'
                    }} 
                    onMouseEnter={(e) => {
                      if (gold >= healthPrice) {
                        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(200, 40, 40, 0.4) 0%, rgba(150, 30, 30, 0.45) 50%, rgba(120, 25, 25, 0.5) 100%)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }
                    }} 
                    onMouseLeave={(e) => {
                      if (gold >= healthPrice) {
                        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(180, 35, 35, 0.35) 0%, rgba(130, 25, 25, 0.4) 50%, rgba(100, 22, 22, 0.45) 100%)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }
                    }}
                  >
                    <div>
                      <p className="font-bold text-sm mb-1" style={{color: '#F5F5DC'}}>Health Potion</p>
                      <p className="text-xs font-bold mb-1" style={{color: '#D4AF37'}}>
                        {healthPrice}g
                      </p>
                      <p className="text-xs mb-1" style={{color: '#FF6B6B'}}>30% Health</p>
                      <p className="text-xs italic" style={{color: COLORS.silver, fontSize: '10px'}}>"Crimson elixir"</p>
                    </div>
                  </button>
                  
                  <button 
                    onClick={() => craftItem('staminaPotion')} 
                    disabled={gold < staminaPrice}
                    className="p-2 rounded-lg border-2 transition-all relative overflow-hidden" 
                    style={{
                      background: gold >= staminaPrice 
                        ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.35) 0%, rgba(30, 64, 175, 0.4) 50%, rgba(29, 78, 216, 0.45) 100%)' 
                        : 'rgba(44, 62, 80, 0.3)', 
                      borderColor: gold >= staminaPrice ? 'rgba(59, 130, 246, 0.65)' : 'rgba(149, 165, 166, 0.3)', 
                      opacity: gold >= staminaPrice ? 1 : 0.5, 
                      cursor: gold >= staminaPrice ? 'pointer' : 'not-allowed',
                      boxShadow: gold >= staminaPrice ? VISUAL_STYLES.shadow.subtle : 'none'
                    }} 
                    onMouseEnter={(e) => {
                      if (gold >= staminaPrice) {
                        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(80, 150, 250, 0.4) 0%, rgba(59, 130, 246, 0.45) 50%, rgba(37, 99, 235, 0.5) 100%)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }
                    }} 
                    onMouseLeave={(e) => {
                      if (gold >= staminaPrice) {
                        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(59, 130, 246, 0.35) 0%, rgba(30, 64, 175, 0.4) 50%, rgba(29, 78, 216, 0.45) 100%)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }
                    }}
                  >
                    <div>
                      <p className="font-bold text-sm mb-1" style={{color: '#F5F5DC'}}>Stamina Potion</p>
                      <p className="text-xs font-bold mb-1" style={{color: '#D4AF37'}}>
                        {staminaPrice}g
                      </p>
                      <p className="text-xs mb-1" style={{color: '#6BB6FF'}}>50% Stamina</p>
                      <p className="text-xs italic" style={{color: COLORS.silver, fontSize: '10px'}}>"Azure draught"</p>
                    </div>
                  </button>
                  
                  <button 
                    onClick={() => craftItem('cleansePotion')} 
                    disabled={gold < cleansePrice || cleansePotionPurchasedToday}
                    className="p-2 rounded-lg border-2 transition-all relative overflow-hidden" 
                    style={{
                      background: (gold >= cleansePrice && !cleansePotionPurchasedToday) 
                        ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.35) 0%, rgba(126, 34, 206, 0.4) 50%, rgba(107, 33, 168, 0.45) 100%)' 
                        : 'rgba(44, 62, 80, 0.3)', 
                      borderColor: (gold >= cleansePrice && !cleansePotionPurchasedToday) ? 'rgba(168, 85, 247, 0.65)' : 'rgba(149, 165, 166, 0.3)', 
                      opacity: (gold >= cleansePrice && !cleansePotionPurchasedToday) ? 1 : 0.5, 
                      cursor: (gold >= cleansePrice && !cleansePotionPurchasedToday) ? 'pointer' : 'not-allowed',
                      boxShadow: (gold >= cleansePrice && !cleansePotionPurchasedToday) ? '0 0 15px rgba(168, 85, 247, 0.2)' : 'none'
                    }} 
                    onMouseEnter={(e) => {
                      if (gold >= cleansePrice && !cleansePotionPurchasedToday) {
                        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(192, 132, 252, 0.4) 0%, rgba(147, 51, 234, 0.45) 50%, rgba(126, 34, 206, 0.5) 100%)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }
                    }} 
                    onMouseLeave={(e) => {
                      if (gold >= cleansePrice && !cleansePotionPurchasedToday) {
                        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(168, 85, 247, 0.35) 0%, rgba(126, 34, 206, 0.4) 50%, rgba(107, 33, 168, 0.45) 100%)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }
                    }}
                  >
                    <div>
                      <p className="font-bold text-sm mb-1" style={{color: '#F5F5DC'}}>Cleanse Potion</p>
                      <p className="text-xs font-bold mb-1" style={{color: '#D4AF37'}}>
                        {cleansePrice}g
                      </p>
                      <p className="text-xs mb-1" style={{color: '#B794F4'}}>Removes 1 curse level</p>
                      <p className="text-xs italic" style={{color: COLORS.silver, fontSize: '10px'}}>{cleansePotionPurchasedToday ? "Sold out today" : "Purifying brew"}</p>
                      {cleansePotionPurchasedToday && (
                        <p className="text-xs mt-1" style={{color: '#EF4444'}}>Daily limit reached</p>
                      )}
                    </div>
                  </button>
                  
                  <button 
                    onClick={() => craftItem('weaponOil')} 
                    disabled={gold < weaponOilPrice || weaponOilActive}
                    className="p-2 rounded-lg border-2 transition-all relative overflow-hidden" 
                    style={{
                      background: (gold >= weaponOilPrice && !weaponOilActive) 
                        ? 'linear-gradient(135deg, rgba(234, 179, 8, 0.35) 0%, rgba(202, 138, 4, 0.4) 50%, rgba(161, 98, 7, 0.45) 100%)' 
                        : 'rgba(44, 62, 80, 0.3)', 
                      borderColor: (gold >= weaponOilPrice && !weaponOilActive) ? 'rgba(234, 179, 8, 0.65)' : 'rgba(149, 165, 166, 0.3)', 
                      opacity: (gold >= weaponOilPrice && !weaponOilActive) ? 1 : 0.5, 
                      cursor: (gold >= weaponOilPrice && !weaponOilActive) ? 'pointer' : 'not-allowed',
                      boxShadow: (gold >= weaponOilPrice && !weaponOilActive) ? '0 0 12px rgba(234, 179, 8, 0.2)' : 'none'
                    }} 
                    onMouseEnter={(e) => {
                      if (gold >= weaponOilPrice && !weaponOilActive) {
                        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(250, 204, 21, 0.4) 0%, rgba(234, 179, 8, 0.45) 50%, rgba(202, 138, 4, 0.5) 100%)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }
                    }} 
                    onMouseLeave={(e) => {
                      if (gold >= weaponOilPrice && !weaponOilActive) {
                        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(234, 179, 8, 0.35) 0%, rgba(202, 138, 4, 0.4) 50%, rgba(161, 98, 7, 0.45) 100%)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }
                    }}
                  >
                    <div>
                      <p className="font-bold text-sm mb-1" style={{color: '#F5F5DC'}}>Fury Elixir</p>
                      <p className="text-xs font-bold mb-1" style={{color: '#D4AF37'}}>
                        {weaponOilPrice}g
                      </p>
                      <p className="text-xs mb-1" style={{color: '#DAA520'}}>+5 Attack{weaponOilActive && <span className="ml-1" style={{color: '#90EE90'}}>✓</span>}</p>
                      <p className="text-xs italic" style={{color: COLORS.silver, fontSize: '10px'}}>"Rage incarnate"</p>
                    </div>
                  </button>
                  
                  <button 
                    onClick={() => craftItem('armorPolish')} 
                    disabled={gold < armorPolishPrice || armorPolishActive}
                    className="p-2 rounded-lg border-2 transition-all relative overflow-hidden" 
                    style={{
                      background: (gold >= armorPolishPrice && !armorPolishActive) 
                        ? 'linear-gradient(135deg, rgba(20, 184, 166, 0.35) 0%, rgba(13, 148, 136, 0.4) 50%, rgba(15, 118, 110, 0.45) 100%)' 
                        : 'rgba(44, 62, 80, 0.3)', 
                      borderColor: (gold >= armorPolishPrice && !armorPolishActive) ? 'rgba(20, 184, 166, 0.65)' : 'rgba(149, 165, 166, 0.3)', 
                      opacity: (gold >= armorPolishPrice && !armorPolishActive) ? 1 : 0.5, 
                      cursor: (gold >= armorPolishPrice && !armorPolishActive) ? 'pointer' : 'not-allowed',
                      boxShadow: (gold >= armorPolishPrice && !armorPolishActive) ? '0 0 12px rgba(20, 184, 166, 0.2)' : 'none'
                    }} 
                    onMouseEnter={(e) => {
                      if (gold >= armorPolishPrice && !armorPolishActive) {
                        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(45, 212, 191, 0.4) 0%, rgba(20, 184, 166, 0.45) 50%, rgba(13, 148, 136, 0.5) 100%)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }
                    }} 
                    onMouseLeave={(e) => {
                      if (gold >= armorPolishPrice && !armorPolishActive) {
                        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(20, 184, 166, 0.35) 0%, rgba(13, 148, 136, 0.4) 50%, rgba(15, 118, 110, 0.45) 100%)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }
                    }}
                  >
                    <div>
                      <p className="font-bold text-sm mb-1" style={{color: '#F5F5DC'}}>Ironbark Tonic</p>
                      <p className="text-xs font-bold mb-1" style={{color: '#D4AF37'}}>
                        {armorPolishPrice}g
                      </p>
                      <p className="text-xs mb-1" style={{color: '#6BB6FF'}}>+5 Defense{armorPolishActive && <span className="ml-1" style={{color: '#90EE90'}}>✓</span>}</p>
                      <p className="text-xs italic" style={{color: COLORS.silver, fontSize: '10px'}}>"Stone-hard skin"</p>
                    </div>
                  </button>
                  
                  <button 
                    onClick={() => craftItem('luckyCharm')} 
                    disabled={gold < luckyCharmPrice || luckyCharmActive}
                    className="p-2 rounded-lg border-2 transition-all relative overflow-hidden" 
                    style={{
                      background: (gold >= luckyCharmPrice && !luckyCharmActive) 
                        ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.35) 0%, rgba(22, 163, 74, 0.4) 50%, rgba(21, 128, 61, 0.45) 100%)' 
                        : 'rgba(44, 62, 80, 0.3)', 
                      borderColor: (gold >= luckyCharmPrice && !luckyCharmActive) ? 'rgba(34, 197, 94, 0.65)' : 'rgba(149, 165, 166, 0.3)', 
                      opacity: (gold >= luckyCharmPrice && !luckyCharmActive) ? 1 : 0.5, 
                      cursor: (gold >= luckyCharmPrice && !luckyCharmActive) ? 'pointer' : 'not-allowed',
                      boxShadow: (gold >= luckyCharmPrice && !luckyCharmActive) ? '0 0 12px rgba(34, 197, 94, 0.2)' : 'none'
                    }} 
                    onMouseEnter={(e) => {
                      if (gold >= luckyCharmPrice && !luckyCharmActive) {
                        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(74, 222, 128, 0.4) 0%, rgba(34, 197, 94, 0.45) 50%, rgba(22, 163, 74, 0.5) 100%)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }
                    }} 
                    onMouseLeave={(e) => {
                      if (gold >= luckyCharmPrice && !luckyCharmActive) {
                        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(34, 197, 94, 0.35) 0%, rgba(22, 163, 74, 0.4) 50%, rgba(21, 128, 61, 0.45) 100%)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }
                    }}
                  >
                    <div>
                      <p className="font-bold text-sm mb-1" style={{color: '#F5F5DC'}}>Fortune Philter</p>
                      <p className="text-xs font-bold mb-1" style={{color: '#D4AF37'}}>
                        {luckyCharmPrice}g
                      </p>
                      <p className="text-xs mb-1" style={{color: '#68D391'}}>2x loot{luckyCharmActive && <span className="ml-1" style={{color: '#90EE90'}}>✓</span>}</p>
                      <p className="text-xs italic" style={{color: COLORS.silver, fontSize: '10px'}}>"Liquid luck"</p>
                    </div>
                  </button>
                  </>);
                  })()}
                </div>
                </div>
                )}
                
                {/* Sell Equipment Tab */}
                {/* Sell Potions Tab */}
                {merchantTab === 'sellPotions' && (
                <div>
                  {/* Market Status Indicator for Potions */}
                  <div className="rounded-lg p-2 mb-4 border" style={{
                    background: 'rgba(0, 0, 0, 0.3)',
                    borderColor: 'rgba(212, 175, 55, 0.3)'
                  }}>
                    <p className="text-xs font-bold mb-2 text-center" style={{color: '#D4AF37'}}>TODAY'S MARKET RATES</p>
                    <div className="flex justify-center gap-4 text-xs">
                      <div className="text-center">
                        <p style={{color: COLORS.silver}}>Health</p>
                        <p className="font-bold" style={{color: marketModifiers.healthPotion < 0.9 ? '#68D391' : marketModifiers.healthPotion > 1.1 ? '#FF6B6B' : '#F5F5DC'}}>
                          {marketModifiers.healthPotion < 0.9 ? 'SALE' : marketModifiers.healthPotion > 1.1 ? 'HIGH' : 'NORMAL'}
                        </p>
                      </div>
                      <div className="text-center">
                        <p style={{color: COLORS.silver}}>Stamina</p>
                        <p className="font-bold" style={{color: marketModifiers.staminaPotion < 0.9 ? '#68D391' : marketModifiers.staminaPotion > 1.1 ? '#FF6B6B' : '#F5F5DC'}}>
                          {marketModifiers.staminaPotion < 0.9 ? 'SALE' : marketModifiers.staminaPotion > 1.1 ? 'HIGH' : 'NORMAL'}
                        </p>
                      </div>
                      <div className="text-center">
                        <p style={{color: COLORS.silver}}>Cleanse</p>
                        <p className="font-bold" style={{color: marketModifiers.cleansePotion < 0.9 ? '#68D391' : marketModifiers.cleansePotion > 1.1 ? '#FF6B6B' : '#F5F5DC'}}>
                          {marketModifiers.cleansePotion < 0.9 ? 'SALE' : marketModifiers.cleansePotion > 1.1 ? 'HIGH' : 'NORMAL'}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs italic text-center mt-2" style={{color: '#9CA3AF'}}>Prices refresh daily</p>
                  </div>
                  
                  {/* Potions */}
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {(healthPots > 0 || staminaPots > 0 || cleansePots > 0) ? (
                      <div>
                        <h3 className="font-bold text-sm mb-2" style={{color: '#D4AF37'}}>POTIONS</h3>
                        <div className="space-y-2">
                          {healthPots > 0 && (
                            <div className="rounded-lg p-2 border flex justify-between items-center" style={{
                              background: 'rgba(0, 0, 0, 0.3)',
                              borderColor: 'rgba(220, 38, 38, 0.6)'
                            }}>
                              <div className="flex-1">
                                <p className="text-sm font-bold" style={{color: '#FF6B6B'}}>Health Potion</p>
                                <p className="text-xs" style={{color: '#F5F5DC'}}>Quantity: {healthPots}</p>
                              </div>
                              <button
                                onClick={() => sellPotion('healthPotion')}
                                className="px-4 py-2 rounded-lg text-sm font-bold border-2 transition-all"
                                style={{
                                  background: 'linear-gradient(to bottom, rgba(184, 134, 11, 0.5), rgba(139, 101, 8, 0.55))',
                                  borderColor: 'rgba(212, 175, 55, 0.7)',
                                  color: '#F5F5DC'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(to bottom, rgba(218, 165, 32, 0.6), rgba(184, 134, 11, 0.65))'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'linear-gradient(to bottom, rgba(184, 134, 11, 0.5), rgba(139, 101, 8, 0.55))'}
                              >
                                Sell: {Math.floor(25 * (marketModifiers.healthPotion || 1.0) * 0.7)} Gold
                              </button>
                            </div>
                          )}
                          
                          {staminaPots > 0 && (
                            <div className="rounded-lg p-2 border flex justify-between items-center" style={{
                              background: 'rgba(0, 0, 0, 0.3)',
                              borderColor: 'rgba(59, 130, 246, 0.6)'
                            }}>
                              <div className="flex-1">
                                <p className="text-sm font-bold" style={{color: '#6BB6FF'}}>Stamina Potion</p>
                                <p className="text-xs" style={{color: '#F5F5DC'}}>Quantity: {staminaPots}</p>
                              </div>
                              <button
                                onClick={() => sellPotion('staminaPotion')}
                                className="px-4 py-2 rounded-lg text-sm font-bold border-2 transition-all"
                                style={{
                                  background: 'linear-gradient(to bottom, rgba(184, 134, 11, 0.5), rgba(139, 101, 8, 0.55))',
                                  borderColor: 'rgba(212, 175, 55, 0.7)',
                                  color: '#F5F5DC'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(to bottom, rgba(218, 165, 32, 0.6), rgba(184, 134, 11, 0.65))'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'linear-gradient(to bottom, rgba(184, 134, 11, 0.5), rgba(139, 101, 8, 0.55))'}
                              >
                                Sell: {Math.floor(20 * (marketModifiers.staminaPotion || 1.0) * 0.7)} Gold
                              </button>
                            </div>
                          )}
                          
                          {cleansePots > 0 && (
                            <div className="rounded-lg p-2 border flex justify-between items-center" style={{
                              background: 'rgba(0, 0, 0, 0.3)',
                              borderColor: 'rgba(168, 85, 247, 0.6)'
                            }}>
                              <div className="flex-1">
                                <p className="text-sm font-bold" style={{color: '#B794F4'}}>Cleanse Potion</p>
                                <p className="text-xs" style={{color: '#F5F5DC'}}>Quantity: {cleansePots}</p>
                              </div>
                              <button
                                onClick={() => sellPotion('cleansePotion')}
                                className="px-4 py-2 rounded-lg text-sm font-bold border-2 transition-all"
                                style={{
                                  background: 'linear-gradient(to bottom, rgba(184, 134, 11, 0.5), rgba(139, 101, 8, 0.55))',
                                  borderColor: 'rgba(212, 175, 55, 0.7)',
                                  color: '#F5F5DC'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(to bottom, rgba(218, 165, 32, 0.6), rgba(184, 134, 11, 0.65))'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'linear-gradient(to bottom, rgba(184, 134, 11, 0.5), rgba(139, 101, 8, 0.55))'}
                              >
                                Sell: {Math.floor(50 * (marketModifiers.cleansePotion || 1.0) * 0.7)} Gold
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-lg p-8 border-2 text-center" style={{
                        background: 'rgba(0, 0, 0, 0.3)',
                        borderColor: 'rgba(212, 175, 55, 0.3)'
                      }}>
                        <p className="text-sm italic" style={{color: '#9CA3AF'}}>
                          No potions to sell. Purchase potions or defeat enemies to gather them.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                )}
                
                {/* Buy Equipment Tab */}
                {merchantTab === 'buyEquipment' && (
                <div>
                  {/* Market Status Indicator */}
                  <div className="rounded-lg p-2 mb-4 border" style={{
                    background: 'rgba(0, 0, 0, 0.3)',
                    borderColor: 'rgba(212, 175, 55, 0.3)'
                  }}>
                    <p className="text-xs font-bold mb-2 text-center" style={{color: '#D4AF37'}}>TODAY'S MARKET RATES</p>
                    <div className="grid grid-cols-4 gap-2 text-xs">
                      <div className="text-center">
                        <p style={{color: COLORS.silver}}>Weapons</p>
                        <p className="font-bold" style={{color: marketModifiers.weapon < 0.9 ? '#68D391' : marketModifiers.weapon > 1.1 ? '#FF6B6B' : '#F5F5DC'}}>
                          {marketModifiers.weapon < 0.9 ? 'SALE' : marketModifiers.weapon > 1.1 ? 'HIGH' : 'NORMAL'}
                        </p>
                      </div>
                      <div className="text-center">
                        <p style={{color: COLORS.silver}}>Armor</p>
                        <p className="font-bold" style={{color: marketModifiers.armor < 0.9 ? '#68D391' : marketModifiers.armor > 1.1 ? '#FF6B6B' : '#F5F5DC'}}>
                          {marketModifiers.armor < 0.9 ? 'SALE' : marketModifiers.armor > 1.1 ? 'HIGH' : 'NORMAL'}
                        </p>
                      </div>
                      <div className="text-center">
                        <p style={{color: COLORS.silver}}>Pendants</p>
                        <p className="font-bold" style={{color: marketModifiers.pendant < 0.9 ? '#68D391' : marketModifiers.pendant > 1.1 ? '#FF6B6B' : '#F5F5DC'}}>
                          {marketModifiers.pendant < 0.9 ? 'SALE' : marketModifiers.pendant > 1.1 ? 'HIGH' : 'NORMAL'}
                        </p>
                      </div>
                      <div className="text-center">
                        <p style={{color: COLORS.silver}}>Rings</p>
                        <p className="font-bold" style={{color: marketModifiers.ring < 0.9 ? '#68D391' : marketModifiers.ring > 1.1 ? '#FF6B6B' : '#F5F5DC'}}>
                          {marketModifiers.ring < 0.9 ? 'SALE' : marketModifiers.ring > 1.1 ? 'HIGH' : 'NORMAL'}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs italic text-center mt-2" style={{color: '#9CA3AF'}}>Prices refresh every 2 days</p>
                  </div>
                  
                  {/* Shop Items */}
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {shopInventory.length > 0 ? (
                      sortByRarity(shopInventory).map(item => {
                        const basePrice = GAME_CONSTANTS.SHOP_CONFIG.costs[item.rarity];
                        const itemType = item.type === 'armor' ? 'armor' : item.type;
                        const marketMod = marketModifiers[itemType] || 1.0;
                        const finalPrice = Math.floor(basePrice * marketMod);
                        const canAfford = gold >= finalPrice;
                        
                        return (
                          <div key={item.id} className="rounded-lg p-2 border-2 transition-all" style={{
                            background: 'rgba(0, 0, 0, 0.4)',
                            borderColor: getRarityColor(item.rarity)
                          }}>
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex-1">
                                <p className="text-sm font-bold mb-1" style={{color: getRarityColor(item.rarity)}}>
                                  {item.name}
                                </p>
                                <p className="text-xs mb-1" style={{color: COLORS.silver}}>
                                  {GAME_CONSTANTS.RARITY_TIERS[item.rarity].name} {item.type === 'armor' ? item.slot : item.type}
                                </p>
                                {item.type === 'weapon' && (
                                  <p className="text-xs" style={{color: '#68D391'}}>+{item.attack} Attack</p>
                                )}
                                {item.type === 'armor' && (
                                  <p className="text-xs" style={{color: '#6BB6FF'}}>+{item.defense} Defense</p>
                                )}
                                {item.type === 'pendant' && (
                                  <p className="text-xs" style={{color: '#68D391'}}>+{item.hp} Health</p>
                                )}
                                {item.type === 'ring' && (
                                  <p className="text-xs" style={{color: '#6BB6FF'}}>+{item.stamina} STA</p>
                                )}
                                {item.affixes && Object.keys(item.affixes).length > 0 && (
                                  <div className="mt-1">
                                    {Object.entries(item.affixes).map(([affix, value]) => (
                                      <p key={affix} className="text-xs" style={{color: '#D4AF37'}}>
                                        +{Math.round(value * 10) / 10} {affix.replace(/([A-Z])/g, ' $1').toLowerCase()}
                                      </p>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <button
                                onClick={() => purchaseShopItem(item)}
                                disabled={!canAfford}
                                className="px-4 py-2 rounded-lg font-bold text-sm transition-all border-2 ml-3"
                                style={{
                                  background: canAfford ? 'linear-gradient(to bottom, rgba(184, 134, 11, 0.6), rgba(139, 101, 8, 0.65))' : 'rgba(60, 60, 60, 0.5)',
                                  borderColor: canAfford ? 'rgba(212, 175, 55, 0.7)' : '#555',
                                  color: canAfford ? '#F5F5DC' : '#888',
                                  cursor: canAfford ? 'pointer' : 'not-allowed',
                                  opacity: canAfford ? 1 : 0.5
                                }}
                                onMouseEnter={(e) => {
                                  if (canAfford) {
                                    e.currentTarget.style.background = 'linear-gradient(to bottom, rgba(218, 165, 32, 0.7), rgba(184, 134, 11, 0.75))';
                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (canAfford) {
                                    e.currentTarget.style.background = 'linear-gradient(to bottom, rgba(184, 134, 11, 0.6), rgba(139, 101, 8, 0.65))';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                  }
                                }}
                              >
                                {finalPrice}g
                              </button>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-8">
                        <p style={{color: COLORS.silver}}>The merchant's shelves are empty.</p>
                        <p className="text-xs mt-2" style={{color: '#9CA3AF'}}>Check back in {2 - (currentDay % 2)} day(s)</p>
                      </div>
                    )}
                  </div>
                </div>
                )}
                
                {/* Sell Equipment Tab */}
                {merchantTab === 'sellEquipment' && (
                <div>
                  {/* Market Status Indicator */}
                  <div className="rounded-lg p-4 mb-4 border-2" style={{
                    background: 'rgba(0, 0, 0, 0.3)',
                    borderColor: 'rgba(212, 175, 55, 0.3)'
                  }}>
                    <p className="text-xs font-bold mb-2 text-center" style={{color: '#D4AF37'}}>TODAY'S MARKET RATES</p>
                    <div className="grid grid-cols-4 gap-2 text-xs">
                      <div className="text-center">
                        <p style={{color: COLORS.silver}}>Weapons</p>
                        <p className="font-bold" style={{color: marketModifiers.weapon < 0.9 ? '#68D391' : marketModifiers.weapon > 1.1 ? '#FF6B6B' : '#F5F5DC'}}>
                          {marketModifiers.weapon < 0.9 ? 'SALE' : marketModifiers.weapon > 1.1 ? 'HIGH' : 'NORMAL'}
                        </p>
                      </div>
                      <div className="text-center">
                        <p style={{color: COLORS.silver}}>Armor</p>
                        <p className="font-bold" style={{color: marketModifiers.armor < 0.9 ? '#68D391' : marketModifiers.armor > 1.1 ? '#FF6B6B' : '#F5F5DC'}}>
                          {marketModifiers.armor < 0.9 ? 'SALE' : marketModifiers.armor > 1.1 ? 'HIGH' : 'NORMAL'}
                        </p>
                      </div>
                      <div className="text-center">
                        <p style={{color: COLORS.silver}}>Pendants</p>
                        <p className="font-bold" style={{color: marketModifiers.pendant < 0.9 ? '#68D391' : marketModifiers.pendant > 1.1 ? '#FF6B6B' : '#F5F5DC'}}>
                          {marketModifiers.pendant < 0.9 ? 'SALE' : marketModifiers.pendant > 1.1 ? 'HIGH' : 'NORMAL'}
                        </p>
                      </div>
                      <div className="text-center">
                        <p style={{color: COLORS.silver}}>Rings</p>
                        <p className="font-bold" style={{color: marketModifiers.ring < 0.9 ? '#68D391' : marketModifiers.ring > 1.1 ? '#FF6B6B' : '#F5F5DC'}}>
                          {marketModifiers.ring < 0.9 ? 'SALE' : marketModifiers.ring > 1.1 ? 'HIGH' : 'NORMAL'}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs italic text-center mt-2" style={{color: '#9CA3AF'}}>Prices refresh daily</p>
                  </div>
                  
                  {/* Sellable Equipment Lists */}
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {/* Weapons */}
                    {weaponInventory.length > 0 && (
                      <div>
                        <h3 className="font-bold text-sm mb-2" style={{color: '#D4AF37'}}>WEAPONS</h3>
                        <div className="space-y-2">
                          {sortByRarity(weaponInventory).map(wpn => {
                            const sellPrice = calculateSellPrice(wpn, 'weapon');
                            return (
                              <div key={wpn.id} className="rounded-lg p-2 border flex justify-between items-center" style={{
                                background: 'rgba(0, 0, 0, 0.3)',
                                borderColor: getRarityColor(wpn.rarity || 'common')
                              }}>
                                <div className="flex-1">
                                  <p className="text-sm font-bold" style={{color: getRarityColor(wpn.rarity || 'common')}}>{wpn.name}</p>
                                  <p className="text-xs" style={{color: '#F5F5DC'}}>+{wpn.attack} Attack</p>
                                  {wpn.rarity && (
                                    <p className="text-xs italic" style={{color: getRarityColor(wpn.rarity)}}>
                                      {GAME_CONSTANTS.RARITY_TIERS[wpn.rarity].name}
                                    </p>
                                  )}
                                </div>
                                <button
                                  onClick={() => sellEquipment(wpn, 'weapon')}
                                  className="px-4 py-2 rounded-lg text-sm font-bold border-2 transition-all"
                                  style={{
                                    background: 'linear-gradient(to bottom, rgba(184, 134, 11, 0.5), rgba(139, 101, 8, 0.55))',
                                    borderColor: 'rgba(212, 175, 55, 0.7)',
                                    color: '#F5F5DC'
                                  }}
                                  onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(to bottom, rgba(218, 165, 32, 0.6), rgba(184, 134, 11, 0.65))'}
                                  onMouseLeave={(e) => e.currentTarget.style.background = 'linear-gradient(to bottom, rgba(184, 134, 11, 0.5), rgba(139, 101, 8, 0.55))'}
                                >
                                  Sell: {sellPrice} Gold
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    
                    {/* Armor - loop through each slot */}
                    {(armorInventory.helmet.length > 0 || armorInventory.chest.length > 0 || armorInventory.gloves.length > 0 || armorInventory.boots.length > 0) && (
                      <div>
                        <h3 className="font-bold text-sm mb-2" style={{color: '#D4AF37'}}>ARMOR</h3>
                        <div className="space-y-2">
                          {Object.entries(armorInventory).map(([slot, items]) => 
                            sortByRarity(items).map(arm => {
                              const sellPrice = calculateSellPrice(arm, 'armor');
                              return (
                                <div key={arm.id} className="rounded-lg p-2 border flex justify-between items-center" style={{
                                  background: 'rgba(0, 0, 0, 0.3)',
                                  borderColor: getRarityColor(arm.rarity || 'common')
                                }}>
                                  <div className="flex-1">
                                    <p className="text-sm font-bold" style={{color: getRarityColor(arm.rarity || 'common')}}>{arm.name}</p>
                                    <p className="text-xs" style={{color: '#F5F5DC'}}>+{arm.defense} Defense • {slot.charAt(0).toUpperCase() + slot.slice(1)}</p>
                                    {arm.rarity && (
                                      <p className="text-xs italic" style={{color: getRarityColor(arm.rarity)}}>
                                        {GAME_CONSTANTS.RARITY_TIERS[arm.rarity].name}
                                      </p>
                                    )}
                                  </div>
                                  <button
                                    onClick={() => sellEquipment(arm, 'armor', slot)}
                                    className="px-4 py-2 rounded-lg text-sm font-bold border-2 transition-all"
                                    style={{
                                      background: 'linear-gradient(to bottom, rgba(184, 134, 11, 0.5), rgba(139, 101, 8, 0.55))',
                                      borderColor: 'rgba(212, 175, 55, 0.7)',
                                      color: '#F5F5DC'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(to bottom, rgba(218, 165, 32, 0.6), rgba(184, 134, 11, 0.65))'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'linear-gradient(to bottom, rgba(184, 134, 11, 0.5), rgba(139, 101, 8, 0.55))'}
                                  >
                                    Sell: {sellPrice} Gold
                                  </button>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Pendants */}
                    {pendantInventory.length > 0 && (
                      <div>
                        <h3 className="font-bold text-sm mb-2" style={{color: '#D4AF37'}}>PENDANTS</h3>
                        <div className="space-y-2">
                          {sortByRarity(pendantInventory).map(pnd => {
                            const sellPrice = calculateSellPrice(pnd, 'pendant');
                            return (
                              <div key={pnd.id} className="rounded-lg p-2 border flex justify-between items-center" style={{
                                background: 'rgba(0, 0, 0, 0.3)',
                                borderColor: getRarityColor(pnd.rarity || 'common')
                              }}>
                                <div className="flex-1">
                                  <p className="text-sm font-bold" style={{color: getRarityColor(pnd.rarity || 'common')}}>{pnd.name}</p>
                                  <p className="text-xs" style={{color: '#68D391'}}>+{pnd.hp} Health</p>
                                  {pnd.rarity && (
                                    <p className="text-xs italic" style={{color: getRarityColor(pnd.rarity)}}>
                                      {GAME_CONSTANTS.RARITY_TIERS[pnd.rarity].name}
                                    </p>
                                  )}
                                </div>
                                <button
                                  onClick={() => sellEquipment(pnd, 'pendant')}
                                  className="px-4 py-2 rounded-lg text-sm font-bold border-2 transition-all"
                                  style={{
                                    background: 'linear-gradient(to bottom, rgba(184, 134, 11, 0.5), rgba(139, 101, 8, 0.55))',
                                    borderColor: 'rgba(212, 175, 55, 0.7)',
                                    color: '#F5F5DC'
                                  }}
                                  onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(to bottom, rgba(218, 165, 32, 0.6), rgba(184, 134, 11, 0.65))'}
                                  onMouseLeave={(e) => e.currentTarget.style.background = 'linear-gradient(to bottom, rgba(184, 134, 11, 0.5), rgba(139, 101, 8, 0.55))'}
                                >
                                  Sell: {sellPrice} Gold
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    
                    {/* Rings */}
                    {ringInventory.length > 0 && (
                      <div>
                        <h3 className="font-bold text-sm mb-2" style={{color: '#D4AF37'}}>RINGS</h3>
                        <div className="space-y-2">
                          {sortByRarity(ringInventory).map(rng => {
                            const sellPrice = calculateSellPrice(rng, 'ring');
                            return (
                              <div key={rng.id} className="rounded-lg p-2 border flex justify-between items-center" style={{
                                background: 'rgba(0, 0, 0, 0.3)',
                                borderColor: getRarityColor(rng.rarity || 'common')
                              }}>
                                <div className="flex-1">
                                  <p className="text-sm font-bold" style={{color: getRarityColor(rng.rarity || 'common')}}>{rng.name}</p>
                                  <p className="text-xs" style={{color: '#4FC3F7'}}>+{rng.stamina} STA</p>
                                  {rng.rarity && (
                                    <p className="text-xs italic" style={{color: getRarityColor(rng.rarity)}}>
                                      {GAME_CONSTANTS.RARITY_TIERS[rng.rarity].name}
                                    </p>
                                  )}
                                </div>
                                <button
                                  onClick={() => sellEquipment(rng, 'ring')}
                                  className="px-4 py-2 rounded-lg text-sm font-bold border-2 transition-all"
                                  style={{
                                    background: 'linear-gradient(to bottom, rgba(184, 134, 11, 0.5), rgba(139, 101, 8, 0.55))',
                                    borderColor: 'rgba(212, 175, 55, 0.7)',
                                    color: '#F5F5DC'
                                  }}
                                  onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(to bottom, rgba(218, 165, 32, 0.6), rgba(184, 134, 11, 0.65))'}
                                  onMouseLeave={(e) => e.currentTarget.style.background = 'linear-gradient(to bottom, rgba(184, 134, 11, 0.5), rgba(139, 101, 8, 0.55))'}
                                >
                                  Sell: {sellPrice} Gold
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    
                    {/* Empty State */}
                    {weaponInventory.length === 0 && 
                     armorInventory.helmet.length === 0 && 
                     armorInventory.chest.length === 0 && 
                     armorInventory.gloves.length === 0 && 
                     armorInventory.boots.length === 0 && 
                     pendantInventory.length === 0 && 
                     ringInventory.length === 0 && (
                      <div className="rounded-lg p-8 border-2 text-center" style={{
                        background: 'rgba(0, 0, 0, 0.3)',
                        borderColor: 'rgba(212, 175, 55, 0.3)'
                      }}>
                        <p className="text-sm italic" style={{color: '#9CA3AF'}}>
                          No equipment to sell. Defeat enemies to gather loot.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                )}
                
              </div>
            </div>
  );
};

export default CraftingModal;
