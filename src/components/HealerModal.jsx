import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { GAME_CONSTANTS, COLORS, VISUAL_STYLES } from '../constants';
import { sounds } from '../sounds';

const MARA_QUOTES = {
  idle: [
    "Rest now. The body heals faster when the mind is still.",
    "You look like you've been dragged through a dungeon. Let me help.",
    "I've stitched worse. Sit down before you fall down.",
    "The curse takes its toll. I can mend the flesh — the rest is up to you.",
    "Another adventurer. Another collection of poor decisions.",
    "I've seen a hundred heroes come through that door. Most of them left walking.",
    "Don't be proud. Pride doesn't close wounds.",
    "The gods gave you a body. Try not to return it in this condition.",
  ],
  heal: [
    "There. Good as new. Try not to undo my work immediately.",
    "Mended. Do try to stay that way.",
    "You'll live. Probably.",
    "The bleeding has stopped. The foolishness, I suspect, has not.",
    "Done. Next time, consider ducking.",
  ],
  buy: [
    "Potions brewed fresh this morning. Mostly.",
    "Take care with that cleanse brew — it's potent.",
    "Stock up. You'll thank me later.",
    "Fine quality. I don't deal in anything less.",
    "Take it. The gold is secondary to you surviving.",
  ],
  fullHealth: [
    "You're already at full health. Save your coin.",
    "Nothing to mend here. Come back when you've done something reckless.",
    "You're fine. Go be a hero.",
  ],
};

const HealerModal = ({
  setShowHealerModal,
  hp,
  getMaxHp,
  gold,
  setGold,
  setHp,
  stamina,
  getMaxStamina,
  setStamina,
  healthPots,
  staminaPots,
  cleansePots,
  setHealthPots,
  setStaminaPots,
  setCleansePots,
  curseLevel,
  cleansePotionPurchasedToday,
  setCleansePotionPurchasedToday,
  healerModifiers,
  getHealerPotionPrice,
  addLog,
  useHealth,
  useCleanse,
}) => {
  const [tab, setTab] = useState('mend');
  const [quote, setQuote] = useState(() => MARA_QUOTES.idle[Math.floor(Math.random() * MARA_QUOTES.idle.length)]);
  const [windowWidth, setWindowWidth] = useState(() => window.innerWidth);

  useEffect(() => {
    const fn = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      setQuote(MARA_QUOTES.idle[Math.floor(Math.random() * MARA_QUOTES.idle.length)]);
    }, 7000);
    return () => clearInterval(t);
  }, []);

  const say = (pool) => setQuote(pool[Math.floor(Math.random() * pool.length)]);

  const showNPC = windowWidth >= 1150;
  const maxHp = getMaxHp();
  const missing = maxHp - hp;
  const costPerHp = 3;
  const halfMissing = Math.ceil(missing / 2);
  const halfCost = halfMissing * costPerHp;
  const fullCost = missing * costPerHp;

  const handleHealHalf = () => {
    if (gold < halfCost) { addLog('Not enough gold.'); return; }
    setGold(g => g - halfCost);
    setHp(h => Math.min(h + halfMissing, maxHp));
    addLog(`Sister Mara restored ${halfMissing} HP for ${halfCost} gold.`);
    say(MARA_QUOTES.heal);
    setShowHealerModal(false);
  };

  const handleHealFull = () => {
    if (gold < fullCost) { addLog('Not enough gold.'); return; }
    setGold(g => g - fullCost);
    setHp(maxHp);
    addLog(`Sister Mara restored ${missing} HP for ${fullCost} gold.`);
    say(MARA_QUOTES.heal);
    setShowHealerModal(false);
  };

  const handleBuyPotion = (key) => {
    const basePrices = { healthPotion: 25, staminaPotion: 20, cleansePotion: 250 };
    const price = getHealerPotionPrice ? getHealerPotionPrice(key, basePrices[key]) : Math.floor(basePrices[key] * ((healerModifiers?.[key]) || 1));
    if (gold < price) { addLog('Not enough gold.'); return; }
    if (key === 'cleansePotion' && cleansePotionPurchasedToday) {
      addLog('Sister Mara shakes her head: "Only one Cleanse Potion per day."');
      return;
    }
    setGold(g => g - price);
    if (key === 'healthPotion')  setHealthPots(p => p + 1);
    if (key === 'staminaPotion') setStaminaPots(p => p + 1);
    if (key === 'cleansePotion') { setCleansePots(p => p + 1); setCleansePotionPurchasedToday(true); }
    const names = { healthPotion: 'Health Potion', staminaPotion: 'Stamina Potion', cleansePotion: 'Cleanse Potion' };
    addLog(`Purchased ${names[key]} for ${price} gold.`);
    say(MARA_QUOTES.buy);
  };

  const green = COLORS.gold;
  const greenDim = 'rgba(212,175,55,0.6)';
  const greenBorder = 'rgba(212,175,55,0.35)';

  const tabBtn = (key, label) => (
    <button
      onClick={() => { sounds.click(); setTab(key); }}
      style={{
        flex: 1, padding: '10px', fontFamily: 'Cinzel, serif', fontWeight: 700,
        fontSize: '0.9rem', letterSpacing: '0.15em', textTransform: 'uppercase',
        cursor: 'pointer', transition: 'all 0.2s', border: 'none',
        background: tab === key
          ? 'linear-gradient(to bottom, rgba(212,175,55,0.35), rgba(16,185,129,0.35))'
          : 'rgba(0,0,0,0.2)',
        color: tab === key ? green : 'rgba(212,175,55,0.45)',
        borderBottom: `2px solid ${tab === key ? green : 'transparent'}`,
      }}
    >{label}</button>
  );

  const potionCard = ({ key, emoji, name, effect, effectColor, border, price, disabled, soldOut, count, onUse, onBuy }) => (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '14px',
      padding: '12px 16px', marginBottom: '10px', borderRadius: '10px',
      border: `1px solid ${border}`,
      background: 'rgba(37,33,24,0.88)',
    }}>
      <span style={{ fontSize: '28px', flexShrink: 0 }}>{emoji}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: '1.05rem', color: '#F5F5DC', marginBottom: '2px' }}>{name}</p>
        <p style={{ fontSize: '0.88rem', color: effectColor }}>{effect}</p>
        {soldOut && <p style={{ fontSize: '0.75rem', color: 'rgba(200,100,100,0.8)', marginTop: '2px', fontStyle: 'italic' }}>Limit reached today</p>}
      </div>
      <span style={{ fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: '1rem', color: '#F5F5DC', minWidth: '24px', textAlign: 'center' }}>{count}</span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flexShrink: 0 }}>
        <button
          onClick={() => { sounds.click(); onBuy(); }}
          disabled={soldOut || (healerModifiers ? gold < price : false)}
          style={{
            padding: '5px 12px', borderRadius: '6px', fontFamily: 'Cinzel, serif',
            fontSize: '0.82rem', fontWeight: 700, cursor: soldOut ? 'not-allowed' : 'pointer',
            background: soldOut ? 'rgba(37,33,24,0.88)' : 'linear-gradient(to bottom, rgba(184,134,11,0.6), rgba(139,101,8,0.65))',
            border: `1px solid ${soldOut ? 'rgba(155,139,126,0.2)' : 'rgba(212,175,55,0.5)'}`,
            color: soldOut ? 'rgba(245,245,220,0.3)' : '#F5F5DC',
            opacity: (!soldOut && gold < price) ? 0.45 : 1,
          }}
        >{soldOut ? 'Sold Out' : `Buy · ${price}g`}</button>
        <button
          onClick={() => { sounds.click(); onUse(); }}
          disabled={disabled}
          style={{
            padding: '5px 12px', borderRadius: '6px', fontFamily: 'Cinzel, serif',
            fontSize: '0.82rem', fontWeight: 700, cursor: disabled ? 'not-allowed' : 'pointer',
            background: disabled ? 'rgba(37,33,24,0.88)' : 'rgba(212,175,55,0.15)',
            border: `1px solid ${disabled ? 'rgba(212,175,55,0.1)' : greenBorder}`,
            color: disabled ? 'rgba(212,175,55,0.25)' : green,
          }}
        >Use</button>
      </div>
    </div>
  );

  const basePrices = { healthPotion: 25, staminaPotion: 20, cleansePotion: 250 };
  const hpPrice     = getHealerPotionPrice ? getHealerPotionPrice('healthPotion',  25)  : Math.floor(25  * ((healerModifiers?.healthPotion)  || 1));
  const spPrice     = getHealerPotionPrice ? getHealerPotionPrice('staminaPotion', 20)  : Math.floor(20  * ((healerModifiers?.staminaPotion) || 1));
  const clsPrice    = getHealerPotionPrice ? getHealerPotionPrice('cleansePotion', 250) : Math.floor(250 * ((healerModifiers?.cleansePotion) || 1));

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center overflow-hidden"
      onClick={() => setShowHealerModal(false)}
    >
      {/* Sister Mara NPC — wide screens only */}
      {showNPC && (
        <motion.div
          initial={{ opacity: 0, x: -20, y: '-50%' }}
          animate={{ opacity: 1, x: 0, y: '-50%' }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            left: 'calc(25% - min(15vw, 225px) - clamp(70px, 7.5vw, 120px))',
            top: '40%',
            width: 'clamp(140px, 15vw, 240px)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px',
            pointerEvents: 'auto',
          }}
          onClick={e => e.stopPropagation()}
        >
          <img
            src="/npcs/medic.png"
            alt="Sister Mara"
            style={{
              width: 'clamp(110px, 13vw, 210px)', height: 'clamp(110px, 13vw, 210px)',
              borderRadius: '50%', objectFit: 'cover', objectPosition: 'top',
              border: `3px solid ${green}`,
              boxShadow: '0 0 40px rgba(212,175,55,0.5), 0 0 100px rgba(212,175,55,0.2)',
            }}
          />
          <p style={{ fontFamily: 'Cinzel, serif', fontSize: '13px', fontWeight: 700, color: green, letterSpacing: '0.12em', textAlign: 'center' }}>SISTER MARA</p>
          <p style={{ fontSize: '11px', color: 'rgba(212,175,55,0.6)', fontStyle: 'italic', textAlign: 'center', marginTop: '-10px' }}>Apothecary & Healer</p>
          <div style={{
            marginTop: '8px', padding: '12px 16px', borderRadius: '10px', maxWidth: '280px',
            background: 'rgba(0,20,15,0.9)', border: `1px solid ${greenBorder}`,
            boxShadow: '0 2px 12px rgba(0,0,0,0.5)', position: 'relative',
          }}>
            <div style={{ position: 'absolute', top: '-8px', left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '8px solid transparent', borderRight: '8px solid transparent', borderBottom: `8px solid ${greenBorder}` }}/>
            <div style={{ position: 'absolute', top: '-6px', left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '7px solid transparent', borderRight: '7px solid transparent', borderBottom: '7px solid rgba(0,20,15,0.9)' }}/>
            <p style={{ fontFamily: 'Cinzel, serif', fontSize: '12px', color: '#F5F5DC', fontStyle: 'italic', lineHeight: 1.5, textAlign: 'center', margin: 0 }}>
              "{quote}"
            </p>
          </div>
        </motion.div>
      )}

      {/* Main panel */}
      <motion.div
        className="relative flex flex-col rounded-xl border-2 overflow-hidden"
        style={{
          width: showNPC ? 'min(60vw, 900px)' : 'min(90vw, calc(100vw - 32px))',
          maxWidth: '1200px', height: '90vh',
          backgroundImage: 'url(/Stonewall1.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderColor: greenBorder,
          boxShadow: '0 0 60px rgba(212,175,55,0.12), 0 0 120px rgba(212,175,55,0.05)',
        }}
        initial={{ opacity: 0, scale: 0.97, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '16px 20px', flexShrink: 0,
          borderBottom: `1px solid rgba(212,175,55,0.2)`,
          background: 'rgba(0,0,0,0.3)', position: 'relative',
        }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: '26px', color: green, letterSpacing: '0.18em', lineHeight: 1, textShadow: '0 0 20px rgba(212,175,55,0.5)' }}>THE APOTHECARY</p>
            <p style={{ fontSize: '11px', color: greenDim, fontStyle: 'italic', marginTop: '4px' }}>Sister Mara · Apothecary & Healer</p>
          </div>
          <button
            onClick={() => { sounds.click(); setShowHealerModal(false); }}
            style={{ position: 'absolute', right: '20px', background: 'rgba(0,0,0,0.5)', border: `1px solid ${greenBorder}`, borderRadius: '8px', padding: '8px', color: green, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          >
            <X size={18}/>
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: `1px solid rgba(212,175,55,0.15)`, flexShrink: 0, background: 'rgba(0,0,0,0.25)' }}>
          {tabBtn('mend', 'Mend')}
          {tabBtn('supplies', 'Supplies')}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', background: 'rgba(0,0,0,0.25)' }}>

          {/* ── MEND TAB ── */}
          {tab === 'mend' && (
            <div style={{ maxWidth: '420px', margin: '0 auto' }}>
              {/* HP display */}
              <div style={{
                background: 'rgba(37,33,24,0.88)', borderRadius: '12px', padding: '18px',
                marginBottom: '20px', border: `1px solid rgba(212,175,55,0.2)`, textAlign: 'center',
              }}>
                <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.88rem', color: greenDim, marginBottom: '6px', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Current HP</p>
                <p style={{ fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: '2rem', color: hp / maxHp < 0.25 ? '#EF4444' : '#fff', marginBottom: '8px' }}>
                  {hp} <span style={{ fontSize: '1rem', color: 'rgba(245,245,220,0.4)' }}>/ {maxHp}</span>
                </p>
                {/* HP bar */}
                <div style={{ height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', width: `${(hp / maxHp) * 100}%`,
                    background: hp / maxHp < 0.25 ? 'linear-gradient(to right, #EF4444, #DC2626)' : `linear-gradient(to right, ${greenDim}, ${green})`,
                    borderRadius: '3px', transition: 'width 0.3s ease',
                  }}/>
                </div>
                <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.78rem', color: 'rgba(212,175,55,0.4)', marginTop: '6px' }}>{costPerHp} gold per HP</p>
              </div>

              {missing > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <button
                    onClick={handleHealHalf}
                    disabled={gold < halfCost}
                    style={{
                      padding: '14px', borderRadius: '10px', fontFamily: 'Cinzel, serif', fontWeight: 700,
                      fontSize: '0.9rem', cursor: gold < halfCost ? 'not-allowed' : 'pointer',
                      background: gold < halfCost ? 'rgba(37,33,24,0.88)' : 'rgba(212,175,55,0.12)',
                      border: `1px solid ${gold < halfCost ? 'rgba(212,175,55,0.1)' : greenBorder}`,
                      color: gold < halfCost ? 'rgba(212,175,55,0.25)' : green,
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { if (gold >= halfCost) e.currentTarget.style.background = 'rgba(212,175,55,0.22)'; }}
                    onMouseLeave={e => { if (gold >= halfCost) e.currentTarget.style.background = 'rgba(212,175,55,0.12)'; }}
                  >
                    Heal Half — {halfCost} gold
                    <span style={{ display: 'block', fontSize: '0.65rem', color: greenDim, fontWeight: 400, marginTop: '3px' }}>Restores {halfMissing} HP</span>
                  </button>
                  <button
                    onClick={handleHealFull}
                    disabled={gold < fullCost}
                    style={{
                      padding: '14px', borderRadius: '10px', fontFamily: 'Cinzel, serif', fontWeight: 700,
                      fontSize: '0.9rem', cursor: gold < fullCost ? 'not-allowed' : 'pointer',
                      background: gold < fullCost ? 'rgba(37,33,24,0.88)' : 'rgba(212,175,55,0.22)',
                      border: `1px solid ${gold < fullCost ? 'rgba(212,175,55,0.1)' : green}`,
                      color: gold < fullCost ? 'rgba(212,175,55,0.25)' : green,
                      transition: 'all 0.2s',
                      boxShadow: gold >= fullCost ? '0 0 18px rgba(212,175,55,0.15)' : 'none',
                    }}
                    onMouseEnter={e => { if (gold >= fullCost) e.currentTarget.style.background = 'rgba(212,175,55,0.32)'; }}
                    onMouseLeave={e => { if (gold >= fullCost) e.currentTarget.style.background = 'rgba(212,175,55,0.22)'; }}
                  >
                    Full Heal — {fullCost} gold
                    <span style={{ display: 'block', fontSize: '0.65rem', color: greenDim, fontWeight: 400, marginTop: '3px' }}>Restores {missing} HP</span>
                  </button>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px', border: `1px solid rgba(212,175,55,0.15)`, borderRadius: '10px', background: 'rgba(37,33,24,0.88)' }}>
                  <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.9rem', color: greenDim }}>
                    {MARA_QUOTES.fullHealth[Math.floor(hp / maxHp * MARA_QUOTES.fullHealth.length) % MARA_QUOTES.fullHealth.length]}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ── SUPPLIES TAB ── */}
          {tab === 'supplies' && (
            <div style={{ maxWidth: '520px', margin: '0 auto' }}>
              <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.78rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.45)', marginBottom: '16px', textAlign: 'center' }}>
                Gold on hand: <span style={{ color: '#D4AF37', fontWeight: 700 }}>{gold}</span>
              </p>

              {potionCard({
                key: 'healthPotion',
                emoji: '🧪',
                name: 'Health Potion',
                effect: `Restores ${GAME_CONSTANTS.HEALTH_POTION_HEAL_PERCENT}% HP`,
                effectColor: '#FF6B6B',
                border: 'rgba(180,35,35,0.5)',
                price: hpPrice,
                count: healthPots,
                disabled: healthPots === 0 || hp >= maxHp,
                soldOut: false,
                onBuy: () => handleBuyPotion('healthPotion'),
                onUse: () => { useHealth(); },
              })}

              {potionCard({
                key: 'staminaPotion',
                emoji: '💙',
                name: 'Stamina Potion',
                effect: `Restores ${GAME_CONSTANTS.STAMINA_POTION_RESTORE_PERCENT}% Stamina`,
                effectColor: '#6BB6FF',
                border: 'rgba(59,130,246,0.5)',
                price: spPrice,
                count: staminaPots,
                disabled: staminaPots === 0 || stamina >= getMaxStamina(),
                soldOut: false,
                onBuy: () => handleBuyPotion('staminaPotion'),
                onUse: () => {
                  if (staminaPots > 0 && stamina < getMaxStamina()) {
                    setStaminaPots(s => s - 1);
                    const max = getMaxStamina();
                    const amt = Math.max(GAME_CONSTANTS.STAMINA_POTION_MIN, Math.floor(max * (GAME_CONSTANTS.STAMINA_POTION_RESTORE_PERCENT / 100)));
                    setStamina(s => Math.min(max, s + amt));
                    addLog(`Used Stamina Potion! +${amt} SP`);
                  }
                },
              })}

              {potionCard({
                key: 'cleansePotion',
                emoji: '🔮',
                name: 'Cleanse Potion',
                effect: 'Removes 1 curse level',
                effectColor: '#B794F4',
                border: `rgba(107,44,145,${curseLevel > 0 ? 0.6 : 0.3})`,
                price: clsPrice,
                count: cleansePots,
                disabled: cleansePots === 0 || curseLevel === 0,
                soldOut: cleansePotionPurchasedToday,
                onBuy: () => handleBuyPotion('cleansePotion'),
                onUse: () => { useCleanse(); },
              })}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default HealerModal;
