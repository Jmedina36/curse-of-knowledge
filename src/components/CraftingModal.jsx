import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { COLORS, VISUAL_STYLES, GAME_CONSTANTS } from '../constants';
import { sounds } from '../sounds';

// ─── Sub-components ───────────────────────────────────────────────────────────

const MarketRates = ({ entries, footer }) => (
  <div className="rounded-lg p-2 mb-4 border"
    style={{ background: 'rgba(0,0,0,0.3)', borderColor: 'rgba(212,175,55,0.3)' }}>
    <p className="text-xs font-bold mb-2 text-center" style={{ color: '#D4AF37' }}>TODAY'S MARKET RATES</p>
    <div className={`text-xs ${entries.length <= 3 ? 'flex justify-center gap-4' : 'grid grid-cols-4 gap-2'}`}>
      {entries.map(({ label, mod }) => (
        <div key={label} className="text-center">
          <p style={{ color: COLORS.silver }}>{label}</p>
          <p className="font-bold" style={{ color: mod < 0.9 ? '#68D391' : mod > 1.1 ? '#FF6B6B' : '#F5F5DC' }}>
            {mod < 0.9 ? 'SALE' : mod > 1.1 ? 'HIGH' : 'NORMAL'}
          </p>
        </div>
      ))}
    </div>
    <p className="text-xs italic text-center mt-2" style={{ color: '#9CA3AF' }}>{footer}</p>
  </div>
);

const SellBtn = ({ onClick, children }) => (
  <button
    onClick={() => { sounds.click(); onClick(); }}
    className="px-4 py-2 rounded-lg text-sm font-bold border-2 transition-all"
    style={{
      background: 'linear-gradient(to bottom, rgba(184,134,11,0.5), rgba(139,101,8,0.55))',
      borderColor: 'rgba(212,175,55,0.7)',
      color: '#F5F5DC',
    }}
    onMouseEnter={e => { e.currentTarget.style.background = 'linear-gradient(to bottom, rgba(218,165,32,0.6), rgba(184,134,11,0.65))'; }}
    onMouseLeave={e => { e.currentTarget.style.background = 'linear-gradient(to bottom, rgba(184,134,11,0.5), rgba(139,101,8,0.55))'; }}
  >
    {children}
  </button>
);

const BuyPotionBtn = ({ label, price, effect, effectColor, lore, canBuy, active, soldOut, onClick, bgStop, hoverStop, border }) => {
  const bg = `linear-gradient(135deg, ${bgStop[0]} 0%, ${bgStop[1]} 50%, ${bgStop[2]} 100%)`;
  const hBg = `linear-gradient(135deg, ${hoverStop[0]} 0%, ${hoverStop[1]} 50%, ${hoverStop[2]} 100%)`;
  return (
    <button
      onClick={onClick}
      disabled={!canBuy}
      className="p-2 rounded-lg border-2 transition-all relative overflow-hidden"
      style={{
        background: canBuy ? bg : 'rgba(44,62,80,0.3)',
        borderColor: canBuy ? border : 'rgba(149,165,166,0.3)',
        opacity: canBuy ? 1 : 0.5,
        cursor: canBuy ? 'pointer' : 'not-allowed',
        boxShadow: canBuy ? VISUAL_STYLES.shadow.subtle : 'none',
      }}
      onMouseEnter={e => { if (canBuy) { e.currentTarget.style.background = hBg; e.currentTarget.style.transform = 'translateY(-2px)'; } }}
      onMouseLeave={e => { if (canBuy) { e.currentTarget.style.background = bg; e.currentTarget.style.transform = 'translateY(0)'; } }}
    >
      <p className="font-bold text-sm mb-1" style={{ color: '#F5F5DC' }}>{label}</p>
      <p className="text-xs font-bold mb-1" style={{ color: '#D4AF37' }}>{price}g</p>
      <p className="text-xs mb-1" style={{ color: effectColor }}>
        {effect}{active && <span className="ml-1" style={{ color: '#90EE90' }}>✓</span>}
      </p>
      <p className="text-xs italic" style={{ color: COLORS.silver, fontSize: '10px' }}>
        {soldOut ? 'Sold out today' : lore}
      </p>
      {soldOut && <p className="text-xs mt-1" style={{ color: '#EF4444' }}>Daily limit reached</p>}
    </button>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

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
  // Study links
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
  const isPotionsTab = merchantTab === 'buy' || merchantTab === 'sellPotions';
  const isEquipmentTab = merchantTab === 'buyEquipment' || merchantTab === 'sellEquipment';

  const [sellConfirm, setSellConfirm] = useState(null); // { label, price, rarityColor, onConfirm }

  // Sub-tab config (Buy = gold, Sell = green) — reused for both Potions and Equipment panels
  const subTabCfg = (buyKey, sellKey) => [
    { key: buyKey,  label: 'Buy',  activeGrad: 'linear-gradient(to bottom, rgba(184,134,11,0.8), rgba(139,101,8,0.8))',  hoverGrad: 'linear-gradient(to bottom, rgba(218,165,32,0.9), rgba(184,134,11,0.9))',  activeBorder: '#D4AF37',  inactiveBorder: 'rgba(184,134,11,0.3)' },
    { key: sellKey, label: 'Sell', activeGrad: 'linear-gradient(to bottom, rgba(34,197,94,0.8), rgba(22,163,74,0.8))',   hoverGrad: 'linear-gradient(to bottom, rgba(74,222,128,0.9), rgba(34,197,94,0.9))',   activeBorder: '#22C55E',  inactiveBorder: 'rgba(34,197,94,0.3)' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-start justify-center p-4 z-50 overflow-y-auto" onClick={() => setShowCraftingModal(false)}>
      <motion.div
        className="rounded-xl p-6 max-w-2xl w-full border-2 my-8 relative"
        initial={{ opacity: 0, scale: 0.97, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        style={{ background: VISUAL_STYLES.modal.paper, borderColor: COLORS.silver, boxShadow: VISUAL_STYLES.shadow.elevated }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={() => { sounds.click(); setShowCraftingModal(false); }}
          className="absolute top-4 right-4 p-2 rounded-lg border-2 transition-all"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', borderColor: 'rgba(212,175,55,0.4)', color: '#D4AF37' }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.7)'; e.currentTarget.style.borderColor = '#D4AF37'; }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.5)'; e.currentTarget.style.borderColor = 'rgba(212,175,55,0.4)'; }}
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold mb-2" style={{ color: '#D4AF37', fontFamily: 'Cinzel, serif', letterSpacing: '0.1em', textShadow: '0 0 20px rgba(212,175,55,0.3)' }}>
            THE MERCHANT
          </h2>
          <div className="flex items-center justify-center gap-2 mb-2">
            <div style={{ width: '120px', height: '1px', background: 'linear-gradient(to right, transparent, rgba(212,175,55,0.5))' }} />
            <span style={{ color: 'rgba(212,175,55,0.6)', fontSize: '8px' }}>◆</span>
            <div style={{ width: '120px', height: '1px', background: 'linear-gradient(to left, transparent, rgba(212,175,55,0.5))' }} />
          </div>
          <p className="text-sm mt-2 italic" style={{ color: COLORS.silver }}>"{getMerchantDialogue()}"</p>
        </div>

        {/* Main Tabs: Potions / Equipment */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {[
            { key: 'buy', label: 'Potions', active: isPotionsTab,
              activeGrad:   'linear-gradient(to bottom, rgba(168,85,247,0.7), rgba(126,34,206,0.8))',
              inactiveGrad: 'linear-gradient(to bottom, rgba(80,40,120,0.3), rgba(60,30,90,0.4))',
              activeHover:  'linear-gradient(to bottom, rgba(192,132,252,0.8), rgba(147,51,234,0.9))',
              inactiveHover:'linear-gradient(to bottom, rgba(100,50,150,0.4), rgba(80,40,120,0.5))',
              activeBorder: '#A855F7', inactiveBorder: 'rgba(168,85,247,0.4)', glow: 'rgba(168,85,247,0.3)' },
            { key: 'buyEquipment', label: 'Equipment', active: isEquipmentTab,
              activeGrad:   'linear-gradient(to bottom, rgba(220,38,38,0.7), rgba(153,27,27,0.8))',
              inactiveGrad: 'linear-gradient(to bottom, rgba(100,20,20,0.3), rgba(80,15,15,0.4))',
              activeHover:  'linear-gradient(to bottom, rgba(239,68,68,0.8), rgba(185,28,28,0.9))',
              inactiveHover:'linear-gradient(to bottom, rgba(120,25,25,0.4), rgba(100,20,20,0.5))',
              activeBorder: '#DC2626', inactiveBorder: 'rgba(220,38,38,0.4)', glow: 'rgba(220,38,38,0.3)' },
          ].map(({ key, label, active, activeGrad, inactiveGrad, activeHover, inactiveHover, activeBorder, inactiveBorder, glow }) => (
            <button key={key} onClick={() => { sounds.click(); setMerchantTab(key); }}
              className="py-3 rounded-lg font-bold uppercase text-sm transition-all border-2"
              style={{ background: active ? activeGrad : inactiveGrad, borderColor: active ? activeBorder : inactiveBorder, color: '#F5F5DC', boxShadow: active ? `0 0 15px ${glow}` : 'none' }}
              onMouseEnter={e => { e.currentTarget.style.background = active ? activeHover : inactiveHover; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = active ? activeGrad : inactiveGrad; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Potions Sub-tabs */}
        {isPotionsTab && (
          <div className="rounded-lg p-2 mb-6 border" style={{ background: 'rgba(168,85,247,0.15)', borderColor: 'rgba(168,85,247,0.3)' }}>
            <div className="grid grid-cols-2 gap-2">
              {subTabCfg('buy', 'sellPotions').map(({ key, label, activeGrad, hoverGrad, activeBorder, inactiveBorder }) => {
                const active = merchantTab === key;
                return (
                  <button key={key} onClick={() => { sounds.click(); setMerchantTab(key); }}
                    className="py-2 rounded-lg font-bold text-sm transition-all border-2"
                    style={{ background: active ? activeGrad : 'rgba(0,0,0,0.3)', borderColor: active ? activeBorder : inactiveBorder, color: '#F5F5DC', cursor: 'pointer' }}
                    onMouseEnter={e => { e.currentTarget.style.background = active ? hoverGrad : 'rgba(40,40,40,0.4)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = active ? activeGrad : 'rgba(0,0,0,0.3)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Equipment Sub-tabs */}
        {isEquipmentTab && (
          <div className="rounded-lg p-2 mb-6 border" style={{ background: 'rgba(139,0,0,0.15)', borderColor: 'rgba(139,0,0,0.3)' }}>
            <div className="grid grid-cols-2 gap-2">
              {subTabCfg('buyEquipment', 'sellEquipment').map(({ key, label, activeGrad, hoverGrad, activeBorder, inactiveBorder }) => {
                const active = merchantTab === key;
                return (
                  <button key={key} onClick={() => { sounds.click(); setMerchantTab(key); }}
                    className="py-2 rounded-lg font-bold text-sm transition-all border-2"
                    style={{ background: active ? activeGrad : 'rgba(0,0,0,0.3)', borderColor: active ? activeBorder : inactiveBorder, color: '#F5F5DC', cursor: 'pointer' }}
                    onMouseEnter={e => { e.currentTarget.style.background = active ? hoverGrad : 'rgba(40,40,40,0.4)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = active ? activeGrad : 'rgba(0,0,0,0.3)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Gold display */}
        <div className="rounded-lg p-4 mb-6 border-2" style={{ background: 'rgba(184,134,11,0.2)', borderColor: 'rgba(212,175,55,0.4)' }}>
          <p className="text-center text-lg">
            <span style={{ color: COLORS.silver }}>Current Gold:</span>
            <span className="font-bold text-2xl ml-2" style={{ color: '#D4AF37' }}>{gold}</span>
          </p>
        </div>

        {/* ── Buy Potions ── */}
        {merchantTab === 'buy' && (() => {
          const prices = {
            healthPotion:  getPotionPrice('healthPotion', 25),
            staminaPotion: getPotionPrice('staminaPotion', 20),
            cleansePotion: getPotionPrice('cleansePotion', 250),
            weaponOil:     getPotionPrice('weaponOil', 40),
            armorPolish:   getPotionPrice('armorPolish', 40),
            luckyCharm:    getPotionPrice('luckyCharm', 80),
          };
          const potions = [
            { key: 'healthPotion',  label: 'Health Potion',   price: prices.healthPotion,  effect: '30% Health',          effectColor: '#FF6B6B', lore: '"Crimson elixir"',  canBuy: gold >= prices.healthPotion,                             bgStop: ['rgba(180,35,35,0.35)', 'rgba(130,25,25,0.4)', 'rgba(100,22,22,0.45)'], hoverStop: ['rgba(200,40,40,0.4)',   'rgba(150,30,30,0.45)', 'rgba(120,25,25,0.5)'], border: 'rgba(180,35,35,0.6)' },
            { key: 'staminaPotion', label: 'Stamina Potion',  price: prices.staminaPotion, effect: '50% Stamina',          effectColor: '#6BB6FF', lore: '"Azure draught"',   canBuy: gold >= prices.staminaPotion,                            bgStop: ['rgba(59,130,246,0.35)', 'rgba(30,64,175,0.4)',  'rgba(29,78,216,0.45)'], hoverStop: ['rgba(80,150,250,0.4)',  'rgba(59,130,246,0.45)', 'rgba(37,99,235,0.5)'],  border: 'rgba(59,130,246,0.65)' },
            { key: 'cleansePotion', label: 'Cleanse Potion',  price: prices.cleansePotion, effect: 'Removes 1 curse level', effectColor: '#B794F4', lore: '"Purifying brew"', canBuy: gold >= prices.cleansePotion && !cleansePotionPurchasedToday, soldOut: cleansePotionPurchasedToday, bgStop: ['rgba(168,85,247,0.35)', 'rgba(126,34,206,0.4)', 'rgba(107,33,168,0.45)'], hoverStop: ['rgba(192,132,252,0.4)', 'rgba(147,51,234,0.45)', 'rgba(126,34,206,0.5)'], border: 'rgba(168,85,247,0.65)' },
            { key: 'weaponOil',     label: 'Fury Elixir',     price: prices.weaponOil,     effect: '+5 Attack',            effectColor: '#DAA520', lore: '"Rage incarnate"',  canBuy: gold >= prices.weaponOil && !weaponOilActive,     active: weaponOilActive,    bgStop: ['rgba(234,179,8,0.35)',  'rgba(202,138,4,0.4)', 'rgba(161,98,7,0.45)'],  hoverStop: ['rgba(250,204,21,0.4)',  'rgba(234,179,8,0.45)',  'rgba(202,138,4,0.5)'],  border: 'rgba(234,179,8,0.65)' },
            { key: 'armorPolish',   label: 'Ironbark Tonic',  price: prices.armorPolish,   effect: '+5 Defense',           effectColor: '#6BB6FF', lore: '"Stone-hard skin"', canBuy: gold >= prices.armorPolish && !armorPolishActive,  active: armorPolishActive,  bgStop: ['rgba(20,184,166,0.35)', 'rgba(13,148,136,0.4)', 'rgba(15,118,110,0.45)'], hoverStop: ['rgba(45,212,191,0.4)',  'rgba(20,184,166,0.45)', 'rgba(13,148,136,0.5)'], border: 'rgba(20,184,166,0.65)' },
            { key: 'luckyCharm',    label: 'Fortune Philter', price: prices.luckyCharm,    effect: '2x loot',              effectColor: '#68D391', lore: '"Liquid luck"',     canBuy: gold >= prices.luckyCharm && !luckyCharmActive,   active: luckyCharmActive,   bgStop: ['rgba(34,197,94,0.35)', 'rgba(22,163,74,0.4)',  'rgba(21,128,61,0.45)'],  hoverStop: ['rgba(74,222,128,0.4)', 'rgba(34,197,94,0.45)',  'rgba(22,163,74,0.5)'],  border: 'rgba(34,197,94,0.65)' },
          ];
          return (
            <div>
              <MarketRates
                entries={[
                  { label: 'Health',  mod: marketModifiers.healthPotion },
                  { label: 'Stamina', mod: marketModifiers.staminaPotion },
                  { label: 'Cleanse', mod: marketModifiers.cleansePotion },
                ]}
                footer="Prices refresh daily"
              />
              <div className="grid grid-cols-3 gap-2">
                {potions.map(p => <BuyPotionBtn key={p.key} {...p} onClick={() => { sounds.click(); craftItem(p.key); }} />)}
              </div>
            </div>
          );
        })()}

        {/* ── Sell Potions ── */}
        {merchantTab === 'sellPotions' && (
          <div>
            <MarketRates
              entries={[
                { label: 'Health',  mod: marketModifiers.healthPotion },
                { label: 'Stamina', mod: marketModifiers.staminaPotion },
                { label: 'Cleanse', mod: marketModifiers.cleansePotion },
              ]}
              footer="Prices refresh daily"
            />
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {(healthPots > 0 || staminaPots > 0 || cleansePots > 0) ? (
                <div>
                  <h3 className="font-bold text-sm mb-2" style={{ color: '#D4AF37' }}>POTIONS</h3>
                  <div className="space-y-2">
                    {healthPots > 0 && (
                      <div className="rounded-lg p-2 border flex justify-between items-center" style={{ background: 'rgba(0,0,0,0.3)', borderColor: 'rgba(220,38,38,0.6)' }}>
                        <div className="flex-1">
                          <p className="text-sm font-bold" style={{ color: '#FF6B6B' }}>Health Potion</p>
                          <p className="text-xs" style={{ color: '#F5F5DC' }}>Quantity: {healthPots}</p>
                        </div>
                        <SellBtn onClick={() => setSellConfirm({ label: 'Health Potion', price: Math.floor(25 * (marketModifiers.healthPotion || 1.0) * 0.7), onConfirm: () => sellPotion('healthPotion') })}>
                          Sell: {Math.floor(25 * (marketModifiers.healthPotion || 1.0) * 0.7)} Gold
                        </SellBtn>
                      </div>
                    )}
                    {staminaPots > 0 && (
                      <div className="rounded-lg p-2 border flex justify-between items-center" style={{ background: 'rgba(0,0,0,0.3)', borderColor: 'rgba(59,130,246,0.6)' }}>
                        <div className="flex-1">
                          <p className="text-sm font-bold" style={{ color: '#6BB6FF' }}>Stamina Potion</p>
                          <p className="text-xs" style={{ color: '#F5F5DC' }}>Quantity: {staminaPots}</p>
                        </div>
                        <SellBtn onClick={() => setSellConfirm({ label: 'Stamina Potion', price: Math.floor(20 * (marketModifiers.staminaPotion || 1.0) * 0.7), onConfirm: () => sellPotion('staminaPotion') })}>
                          Sell: {Math.floor(20 * (marketModifiers.staminaPotion || 1.0) * 0.7)} Gold
                        </SellBtn>
                      </div>
                    )}
                    {cleansePots > 0 && (
                      <div className="rounded-lg p-2 border flex justify-between items-center" style={{ background: 'rgba(0,0,0,0.3)', borderColor: 'rgba(168,85,247,0.6)' }}>
                        <div className="flex-1">
                          <p className="text-sm font-bold" style={{ color: '#B794F4' }}>Cleanse Potion</p>
                          <p className="text-xs" style={{ color: '#F5F5DC' }}>Quantity: {cleansePots}</p>
                        </div>
                        <SellBtn onClick={() => setSellConfirm({ label: 'Cleanse Potion', price: Math.floor(50 * (marketModifiers.cleansePotion || 1.0) * 0.7), onConfirm: () => sellPotion('cleansePotion') })}>
                          Sell: {Math.floor(50 * (marketModifiers.cleansePotion || 1.0) * 0.7)} Gold
                        </SellBtn>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="rounded-lg p-8 border-2 text-center" style={{ background: 'rgba(0,0,0,0.3)', borderColor: 'rgba(212,175,55,0.3)' }}>
                  <p className="text-sm italic" style={{ color: '#9CA3AF' }}>No potions to sell. Purchase potions or defeat enemies to gather them.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Buy Equipment ── */}
        {merchantTab === 'buyEquipment' && (
          <div>
            <MarketRates
              entries={[
                { label: 'Weapons',  mod: marketModifiers.weapon },
                { label: 'Armor',    mod: marketModifiers.armor },
                { label: 'Pendants', mod: marketModifiers.pendant },
                { label: 'Rings',    mod: marketModifiers.ring },
              ]}
              footer={`Prices refresh every ${GAME_CONSTANTS.SHOP_CONFIG.refreshInterval} days`}
            />
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {shopInventory.length > 0 ? (
                sortByRarity(shopInventory).map(item => {
                  const basePrice  = GAME_CONSTANTS.SHOP_CONFIG.costs[item.rarity];
                  const marketMod  = marketModifiers[item.type === 'armor' ? 'armor' : item.type] || 1.0;
                  const finalPrice = Math.floor(basePrice * marketMod);
                  const canAfford  = gold >= finalPrice;
                  return (
                    <div key={item.id} className="rounded-lg p-2 border-2 transition-all"
                      style={{ background: 'rgba(0,0,0,0.4)', borderColor: getRarityColor(item.rarity) }}>
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <p className="text-sm font-bold mb-1" style={{ color: getRarityColor(item.rarity) }}>{item.name}</p>
                          <p className="text-xs mb-1" style={{ color: COLORS.silver }}>
                            {GAME_CONSTANTS.RARITY_TIERS[item.rarity].name} {item.type === 'armor' ? item.slot : item.type}
                          </p>
                          {item.type === 'weapon'  && <p className="text-xs" style={{ color: '#68D391' }}>+{item.attack} Attack</p>}
                          {item.type === 'armor'   && <p className="text-xs" style={{ color: '#6BB6FF' }}>+{item.defense} Defense</p>}
                          {item.type === 'pendant' && <p className="text-xs" style={{ color: '#68D391' }}>+{item.hp} Health</p>}
                          {item.type === 'ring'    && <p className="text-xs" style={{ color: '#6BB6FF' }}>+{item.stamina} STA</p>}
                          {item.affixes && Object.keys(item.affixes).length > 0 && (
                            <div className="mt-1">
                              {Object.entries(item.affixes).map(([affix, value]) => (
                                <p key={affix} className="text-xs" style={{ color: '#D4AF37' }}>
                                  +{Math.round(value * 10) / 10} {affix.replace(/([A-Z])/g, ' $1').toLowerCase()}
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => { sounds.click(); purchaseShopItem(item); }}
                          disabled={!canAfford}
                          className="px-4 py-2 rounded-lg font-bold text-sm transition-all border-2 ml-3"
                          style={{
                            background: canAfford ? 'linear-gradient(to bottom, rgba(184,134,11,0.6), rgba(139,101,8,0.65))' : 'rgba(60,60,60,0.5)',
                            borderColor: canAfford ? 'rgba(212,175,55,0.7)' : '#555',
                            color: canAfford ? '#F5F5DC' : '#888',
                            cursor: canAfford ? 'pointer' : 'not-allowed',
                            opacity: canAfford ? 1 : 0.5,
                          }}
                          onMouseEnter={e => { if (canAfford) { e.currentTarget.style.background = 'linear-gradient(to bottom, rgba(218,165,32,0.7), rgba(184,134,11,0.75))'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
                          onMouseLeave={e => { if (canAfford) { e.currentTarget.style.background = 'linear-gradient(to bottom, rgba(184,134,11,0.6), rgba(139,101,8,0.65))'; e.currentTarget.style.transform = 'translateY(0)'; } }}
                        >
                          {finalPrice}g
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <p style={{ color: COLORS.silver }}>The merchant's shelves are empty.</p>
                  <p className="text-xs mt-2" style={{ color: '#9CA3AF' }}>
                    Check back in {GAME_CONSTANTS.SHOP_CONFIG.refreshInterval - (currentDay % GAME_CONSTANTS.SHOP_CONFIG.refreshInterval)} day(s)
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Sell Equipment ── */}
        {merchantTab === 'sellEquipment' && (() => {
          const armorFlat = Object.entries(armorInventory).flatMap(([slot, items]) =>
            sortByRarity(items).map(arm => ({ ...arm, slot }))
          );
          const sellRows = [
            { title: 'WEAPONS',  items: sortByRarity(weaponInventory),   getStat: w => `+${w.attack} Attack`,   onSell: w => sellEquipment(w, 'weapon'),           sellType: 'weapon' },
            { title: 'ARMOR',    items: armorFlat,                        getStat: a => `+${a.defense} Defense \u2022 ${a.slot.charAt(0).toUpperCase() + a.slot.slice(1)}`, onSell: a => sellEquipment(a, 'armor', a.slot), sellType: 'armor' },
            { title: 'PENDANTS', items: sortByRarity(pendantInventory),   getStat: p => `+${p.hp} Health`,       onSell: p => sellEquipment(p, 'pendant'),           sellType: 'pendant' },
            { title: 'RINGS',    items: sortByRarity(ringInventory),      getStat: r => `+${r.stamina} STA`,     onSell: r => sellEquipment(r, 'ring'),              sellType: 'ring' },
          ];
          const isEmpty = sellRows.every(r => r.items.length === 0);
          return (
            <div>
              <MarketRates
                entries={[
                  { label: 'Weapons',  mod: marketModifiers.weapon },
                  { label: 'Armor',    mod: marketModifiers.armor },
                  { label: 'Pendants', mod: marketModifiers.pendant },
                  { label: 'Rings',    mod: marketModifiers.ring },
                ]}
                footer="Prices refresh daily"
              />
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {isEmpty ? (
                  <div className="rounded-lg p-8 border-2 text-center" style={{ background: 'rgba(0,0,0,0.3)', borderColor: 'rgba(212,175,55,0.3)' }}>
                    <p className="text-sm italic" style={{ color: '#9CA3AF' }}>No equipment to sell. Defeat enemies to gather loot.</p>
                  </div>
                ) : (
                  sellRows.map(({ title, items, getStat, onSell, sellType }) =>
                    items.length > 0 && (
                      <div key={title}>
                        <h3 className="font-bold text-sm mb-2" style={{ color: '#D4AF37' }}>{title}</h3>
                        <div className="space-y-2">
                          {items.map(item => {
                            const color = getRarityColor(item.rarity || 'common');
                            const price = calculateSellPrice(item, sellType);
                            return (
                              <div key={item.id} className="rounded-lg p-2 border flex justify-between items-center"
                                style={{ background: 'rgba(0,0,0,0.3)', borderColor: color }}>
                                <div className="flex-1">
                                  <p className="text-sm font-bold" style={{ color }}>{item.name}</p>
                                  <p className="text-xs" style={{ color: '#F5F5DC' }}>{getStat(item)}</p>
                                  {item.rarity && (
                                    <p className="text-xs italic" style={{ color }}>
                                      {GAME_CONSTANTS.RARITY_TIERS[item.rarity].name}
                                    </p>
                                  )}
                                </div>
                                <SellBtn onClick={() => setSellConfirm({ label: item.name, price, rarityColor: color, onConfirm: () => onSell(item) })}>
                                  Sell: {price} Gold
                                </SellBtn>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )
                  )
                )}
              </div>
            </div>
          );
        })()}

      </motion.div>

      {/* ── Sell Confirmation Overlay ── */}
      {sellConfirm && (
        <div
          className="fixed inset-0 z-[55] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.65)' }}
          onClick={() => setSellConfirm(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-xl p-6 text-center max-w-xs w-full border-2"
            style={{
              background: 'linear-gradient(to bottom, rgba(12,8,2,0.99), rgba(6,4,1,0.99))',
              borderColor: sellConfirm.rarityColor || 'rgba(212,175,55,0.5)',
              boxShadow: `0 0 28px ${sellConfirm.rarityColor ? sellConfirm.rarityColor + '33' : 'rgba(212,175,55,0.15)'}`,
            }}
            onClick={e => e.stopPropagation()}
          >
            <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.55rem', letterSpacing: '0.3em', color: 'rgba(245,245,220,0.35)', marginBottom: '10px' }}>
              CONFIRM SALE
            </p>
            <p style={{ fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: '0.95rem', color: sellConfirm.rarityColor || '#F5F5DC', marginBottom: '4px' }}>
              {sellConfirm.label}
            </p>
            <p style={{ fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: '1.3rem', color: '#D4AF37', marginBottom: '22px' }}>
              {sellConfirm.price} Gold
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => { sounds.click(); setSellConfirm(null); }}
                style={{ flex: 1, padding: '10px 0', borderRadius: '8px', fontFamily: 'Cinzel, serif', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(245,245,220,0.18)', color: 'rgba(245,245,220,0.45)', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={() => { sounds.click(); sellConfirm.onConfirm(); setSellConfirm(null); }}
                style={{ flex: 1, padding: '10px 0', borderRadius: '8px', fontFamily: 'Cinzel, serif', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', background: 'linear-gradient(to bottom, rgba(184,134,11,0.85), rgba(139,101,8,0.9))', border: '1px solid rgba(212,175,55,0.6)', color: '#F5F5DC', cursor: 'pointer' }}
              >
                Sell
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default CraftingModal;
