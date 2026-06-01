import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { COLORS, VISUAL_STYLES, GAME_CONSTANTS } from '../constants';
import { sounds } from '../sounds';

// Armor sprite assignment — slot-specific, 5 variants each
const ARMOR_SPRITES = {
  helmet: ['/armor/helmet1.png','/armor/helmet2.png','/armor/helmet3.png','/armor/helmet4.png','/armor/helmet5.png'],
  chest:  ['/armor/chest1.png', '/armor/chest2.png', '/armor/chest3.png', '/armor/chest4.png', '/armor/chest5.png'],
  gloves: ['/armor/gloves1.png','/armor/gloves2.png','/armor/gloves3.png','/armor/gloves4.png','/armor/gloves5.png'],
  boots:  ['/armor/boots1.png', '/armor/boots2.png', '/armor/boots3.png', '/armor/boots4.png', '/armor/boots5.png'],
};
const getArmorSprite = (piece, slot) => {
  if (!piece || !ARMOR_SPRITES[slot]) return null;
  let seed = 0;
  if (piece?.id != null) seed = typeof piece.id === 'number' ? piece.id : String(piece.id).split('').reduce((a,c)=>a+c.charCodeAt(0),0);
  else if (piece?.name) seed = piece.name.split('').reduce((a,c)=>a+c.charCodeAt(0),0);
  return ARMOR_SPRITES[slot][Math.abs(seed) % ARMOR_SPRITES[slot].length];
};

// Weapon sprite assignment — same hash as ArmoryScene
const WEAPON_SPRITES = [
  '/weapons/sword1.png', '/weapons/sword2.png', '/weapons/sword3.png',
  '/weapons/dagger1.png', '/weapons/dagger2.png',
  '/weapons/mace1.png', '/weapons/staff.png', '/weapons/bow1.png',
];
const getWeaponSprite = (wpn) => {
  let seed = 0;
  if (wpn?.id != null) seed = typeof wpn.id === 'number' ? wpn.id : String(wpn.id).split('').reduce((a,c)=>a+c.charCodeAt(0),0);
  else if (wpn?.name) seed = wpn.name.split('').reduce((a,c)=>a+c.charCodeAt(0),0);
  return WEAPON_SPRITES[Math.abs(seed) % WEAPON_SPRITES.length];
};

const ARMOR_SLOTS = [
  { key: 'helmet', label: 'Helmet', icon: '' },
  { key: 'chest',  label: 'Chest',  icon: '' },
  { key: 'gloves', label: 'Gloves', icon: '' },
  { key: 'boots',  label: 'Boots',  icon: '' },
];

const CATEGORIES = [
  { key: 'weapons',     label: 'Weapons'   },
  { key: 'armor',       label: 'Armor'     },
  { key: 'accessories', label: 'Gear'      },
  { key: 'potions',     label: 'Potions'   },
];

const GRIMDAR_IDLE = [
  "...Are ye going to equip something or just stare at me?",
  "Every second ye stand here, a goblin gets stronger.",
  "I've forged better gear than that in me sleep.",
  "Pick something and get out of me shop.",
  "What are ye waitin' for? The rust to set in?",
  "Ye smell like a dungeon. That's not a compliment.",
  "I've seen corpses make faster decisions.",
  "Stop browsin' and start equipping, ye time-waster.",
];

const InventoryModal = ({
  // kept for compat but replaced by local state
  suppliesTab, setSuppliesTab,
  setShowInventoryModal,
  hp, stamina, level, gold,
  getMaxHp, getMaxStamina, getBaseAttack, getBaseDefense,
  healthPots, staminaPots, cleansePots, setStaminaPots,
  equippedWeapon, setEquippedWeapon, weaponInventory, setWeaponInventory,
  equippedArmor, setEquippedArmor, armorInventory, setArmorInventory,
  equippedPendant, setEquippedPendant, pendantInventory, setPendantInventory,
  equippedRing, setEquippedRing, ringInventory, setRingInventory,
  setStamina,
  curseLevel, luckyCharmActive,
  getRarityColor, sortByRarity,
  addLog,
  useHealth, useCleanse,
}) => {
  const [category, setCategory] = useState('weapons');
  const [grimdarQuote, setGrimdarQuote] = useState(() => GRIMDAR_IDLE[Math.floor(Math.random() * GRIMDAR_IDLE.length)]);
  const [windowWidth, setWindowWidth] = useState(() => window.innerWidth);
  useEffect(() => {
    const fn = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);
  const showNPC = windowWidth >= 1150;

  // Idle rotation — changes every 7s if no recent equip
  useEffect(() => {
    const t = setInterval(() => {
      setGrimdarQuote(q => {
        // Only rotate if it's an idle quote
        if (GRIMDAR_IDLE.includes(q)) {
          const next = GRIMDAR_IDLE[Math.floor(Math.random() * GRIMDAR_IDLE.length)];
          return next;
        }
        // Reactive quote fades back to idle after one cycle
        return GRIMDAR_IDLE[Math.floor(Math.random() * GRIMDAR_IDLE.length)];
      });
    }, 7000);
    return () => clearInterval(t);
  }, []);

  const weaponEffective = (wpn) => (wpn?.attack || 0) + Math.floor(wpn?.affixes?.flatDamage || 0);
  const armorEffective  = (piece) => (piece?.defense || 0) + Math.floor(piece?.affixes?.flatArmor || 0);

  // ── Equip handlers ──
  const equipWeapon = (wpn) => {
    const old = equippedWeapon;
    setEquippedWeapon(wpn);
    setWeaponInventory(prev => [...prev.filter(w => w.id !== wpn.id), ...(old ? [old] : [])]);
    addLog(`Equipped: ${wpn.name} (+${wpn.attack} Attack)`);
    if (old) addLog(`Unequipped: ${old.name}`);
    const isUpgrade = !old || weaponEffective(wpn) > weaponEffective(old);
    const quotes = isUpgrade
      ? ["Finally. Something worth swingin'.", "Aye, that's a proper weapon. Try not to embarrass it.", "Better. Don't waste sharp steel on rats."]
      : ["Ye're downgradin'? Did ye take a knock to the head?", "That's worse. Congratulations on the step backward.", "I've seen farmers with better taste in iron."];
    setGrimdarQuote(quotes[Math.floor(Math.random() * quotes.length)]);
  };

  const equipArmor = (piece, slot) => {
    const old = equippedArmor[slot];
    setEquippedArmor(prev => ({ ...prev, [slot]: piece }));
    setArmorInventory(prev => ({
      ...prev,
      [slot]: [...prev[slot].filter(p => p.id !== piece.id), ...(old ? [old] : [])],
    }));
    addLog(`Equipped: ${piece.name} (+${piece.defense} Defense)`);
    if (old) addLog(`Unequipped: ${old.name}`);
    const isUpgrade = !old || armorEffective(piece) > armorEffective(old);
    const quotes = isUpgrade
      ? ["Good. Maybe ye won't bleed out on the first hit now.", "Aye, cover yerself up. Ye were embarrassin' me.", "Defense up. Try not to walk into every axe ye see."]
      : ["Ye swapped down in defense. Brilliant strategy.", "Less protection. Bold choice. Stupid, but bold.", "Ye'd be safer wearin' a barrel."];
    setGrimdarQuote(quotes[Math.floor(Math.random() * quotes.length)]);
  };

  const equipPendant = (pend) => {
    const old = equippedPendant;
    setEquippedPendant(pend);
    setPendantInventory(prev => [...prev.filter(p => p.id !== pend.id), ...(old ? [old] : [])]);
    addLog(`Equipped: ${pend.name} (+${pend.hp} HP)`);
    if (old) addLog(`Unequipped: ${old.name}`);
    const quotes = ["A bauble. At least yer HP's up — it ain't just pretty.", "Jewelry. Aye, very fierce.", "More HP from a necklace. I've seen worse."];
    setGrimdarQuote(quotes[Math.floor(Math.random() * quotes.length)]);
  };

  const equipRing = (rng) => {
    const old = equippedRing;
    setEquippedRing(rng);
    setRingInventory(prev => [...prev.filter(r => r.id !== rng.id), ...(old ? [old] : [])]);
    addLog(`Equipped: ${rng.name} (+${rng.stamina} Stamina)`);
    if (old) addLog(`Unequipped: ${old.name}`);
    const quotes = ["A ring. More stamina. Don't spend it all running away.", "Stamina up. Good. Dying tired is still dying.", "Fine. More endurance. Ye'll need it."];
    setGrimdarQuote(quotes[Math.floor(Math.random() * quotes.length)]);
  };

  // ── Shared styles ──
  const equipBtnStyle = {
    padding: '5px 11px', borderRadius: '6px', fontSize: '11px', fontWeight: 700,
    border: '1px solid rgba(212,175,55,0.5)', cursor: 'pointer', flexShrink: 0,
    background: 'linear-gradient(to bottom, rgba(184,134,11,0.5), rgba(139,101,8,0.55))',
    color: '#F5F5DC',
  };

  const equippedBadge = {
    padding: '4px 9px', borderRadius: '6px', fontSize: '10px', fontWeight: 700,
    border: '1px solid rgba(212,175,55,0.5)',
    background: 'rgba(212,175,55,0.15)', color: '#D4AF37', flexShrink: 0,
  };

  const emptyMsg = (text = 'No items found yet.') => (
    <p style={{ color: COLORS.silver, fontStyle: 'italic', textAlign: 'center', padding: '28px 0', fontSize: '13px', opacity: 0.6 }}>
      {text}
    </p>
  );

  // ── LEFT PANEL renderers ──

  const renderWeapons = () => {
    const all = [
      ...(equippedWeapon ? [{ ...equippedWeapon, _eq: true }] : []),
      ...sortByRarity(weaponInventory),
    ];
    if (!all.length) return emptyMsg('No weapons found yet. Defeat enemies to find weapons.');
    return all.map((wpn, i) => (
      <div key={wpn.id ?? i} style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        padding: '10px 12px', marginBottom: '8px', borderRadius: '8px',
        border: `1px solid ${getRarityColor(wpn.rarity || 'common')}44`,
        background: VISUAL_STYLES.card.default,
      }}>
        <img src={getWeaponSprite(wpn)} alt={wpn.name}
          style={{ width: 44, height: 44, objectFit: 'contain', flexShrink: 0,
            filter: `drop-shadow(0 0 5px ${getRarityColor(wpn.rarity || 'common')}70)` }}/>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ color: getRarityColor(wpn.rarity || 'common'), fontWeight: 700, fontSize: '13px', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{wpn.name}</p>
          <p style={{ color: '#68D391', fontSize: '11px', marginBottom: '2px' }}>+{wpn.attack} Attack</p>
          {!wpn._eq && equippedWeapon && (
            <p style={{ fontSize: '10px', color: weaponEffective(wpn) > weaponEffective(equippedWeapon) ? '#34D399' : weaponEffective(wpn) < weaponEffective(equippedWeapon) ? '#EF4444' : 'rgba(192,192,192,0.4)' }}>
              {weaponEffective(wpn) > weaponEffective(equippedWeapon) ? `▲ +${weaponEffective(wpn) - weaponEffective(equippedWeapon)}` : weaponEffective(wpn) < weaponEffective(equippedWeapon) ? `▼ ${weaponEffective(wpn) - weaponEffective(equippedWeapon)}` : '='} vs equipped
            </p>
          )}
        </div>
        {wpn._eq
          ? <span style={equippedBadge}>✓ Equipped</span>
          : <button style={equipBtnStyle} onClick={() => { sounds.click(); equipWeapon(wpn); }}>Equip</button>}
      </div>
    ));
  };

  const renderArmor = () => {
    const hasAny = ARMOR_SLOTS.some(({ key }) => equippedArmor[key] || armorInventory[key]?.length > 0);
    if (!hasAny) return emptyMsg('No armor found yet. Defeat enemies to find armor pieces.');
    return ARMOR_SLOTS.map(({ key, label, icon }) => {
      const equipped = equippedArmor[key];
      const inv = sortByRarity(armorInventory[key] || []);
      const items = [...(equipped ? [{ ...equipped, _eq: true }] : []), ...inv];
      if (!items.length) return null;
      return (
        <div key={key} style={{ marginBottom: '14px' }}>
          <p style={{ color: COLORS.silver, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>{label}</p>
          {items.map((piece, i) => (
            <div key={piece.id ?? i} style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '9px 12px', marginBottom: '6px', borderRadius: '8px',
              border: `1px solid ${getRarityColor(piece.rarity || 'common')}44`,
              background: VISUAL_STYLES.card.default,
            }}>
              <img src={getArmorSprite(piece, key)} alt={piece.name}
                style={{ width: 40, height: 40, objectFit: 'contain', flexShrink: 0,
                  filter: `drop-shadow(0 0 4px ${getRarityColor(piece.rarity || 'common')}60)` }}/>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ color: getRarityColor(piece.rarity || 'common'), fontWeight: 700, fontSize: '13px', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{piece.name}</p>
                <p style={{ color: '#68D391', fontSize: '11px' }}>+{piece.defense} Defense</p>
                {!piece._eq && equippedArmor[key] && (
                  <p style={{ fontSize: '10px', color: armorEffective(piece) > armorEffective(equippedArmor[key]) ? '#34D399' : '#EF4444' }}>
                    {armorEffective(piece) > armorEffective(equippedArmor[key]) ? `▲ +${armorEffective(piece) - armorEffective(equippedArmor[key])}` : `▼ ${armorEffective(piece) - armorEffective(equippedArmor[key])}`} vs equipped
                  </p>
                )}
              </div>
              {piece._eq
                ? <span style={equippedBadge}>✓ Equipped</span>
                : <button style={equipBtnStyle} onClick={() => { sounds.click(); equipArmor(piece, key); }}>Equip</button>}
            </div>
          ))}
        </div>
      );
    });
  };

  const renderAccessories = () => {
    const allPendants = [...(equippedPendant ? [{ ...equippedPendant, _eq: true }] : []), ...sortByRarity(pendantInventory)];
    const allRings    = [...(equippedRing    ? [{ ...equippedRing,    _eq: true }] : []), ...sortByRarity(ringInventory)];
    if (!allPendants.length && !allRings.length) return emptyMsg('No accessories found yet. Defeat enemies to find pendants and rings.');
    return (
      <>
        {allPendants.length > 0 && (
          <div style={{ marginBottom: '14px' }}>
            <p style={{ color: COLORS.silver, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>Pendant</p>
            {allPendants.map((pend, i) => (
              <div key={pend.id ?? i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', marginBottom: '6px', borderRadius: '8px', border: `1px solid ${getRarityColor(pend.rarity || 'common')}44`, background: VISUAL_STYLES.card.default }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ color: getRarityColor(pend.rarity || 'common'), fontWeight: 700, fontSize: '13px', marginBottom: '2px' }}>{pend.name}</p>
                  <p style={{ color: '#FF6B6B', fontSize: '11px' }}>+{pend.hp} HP</p>
                </div>
                {pend._eq ? <span style={equippedBadge}>✓ Equipped</span> : <button style={equipBtnStyle} onClick={() => { sounds.click(); equipPendant(pend); }}>Equip</button>}
              </div>
            ))}
          </div>
        )}
        {allRings.length > 0 && (
          <div>
            <p style={{ color: COLORS.silver, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>Ring</p>
            {allRings.map((rng, i) => (
              <div key={rng.id ?? i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', marginBottom: '6px', borderRadius: '8px', border: `1px solid ${getRarityColor(rng.rarity || 'common')}44`, background: VISUAL_STYLES.card.default }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ color: getRarityColor(rng.rarity || 'common'), fontWeight: 700, fontSize: '13px', marginBottom: '2px' }}>{rng.name}</p>
                  <p style={{ color: '#6BB6FF', fontSize: '11px' }}>+{rng.stamina} Stamina</p>
                </div>
                {rng._eq ? <span style={equippedBadge}>✓ Equipped</span> : <button style={equipBtnStyle} onClick={() => { sounds.click(); equipRing(rng); }}>Equip</button>}
              </div>
            ))}
          </div>
        )}
      </>
    );
  };

  const renderPotions = () => {
    const potionRow = ({ emoji, name, desc, count, color, border, disabled, onUse }) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', marginBottom: '8px', borderRadius: '8px', border: `1px solid ${border}`, background: VISUAL_STYLES.card.default }}>
        <span style={{ fontSize: '22px' }}>{emoji}</span>
        <div style={{ flex: 1 }}>
          <p style={{ color: '#F5F5DC', fontWeight: 700, fontSize: '13px', marginBottom: '2px' }}>{name}</p>
          <p style={{ color, fontSize: '11px' }}>{desc}</p>
        </div>
        <span style={{ color, fontWeight: 700, fontSize: '18px', minWidth: '28px', textAlign: 'center' }}>{count}</span>
        <button disabled={disabled} onClick={onUse} style={{ ...equipBtnStyle, opacity: disabled ? 0.4 : 1, cursor: disabled ? 'not-allowed' : 'pointer', background: disabled ? 'rgba(0,0,0,0.3)' : equipBtnStyle.background, borderColor: disabled ? 'rgba(155,139,126,0.3)' : 'rgba(212,175,55,0.5)' }}>Use</button>
      </div>
    );
    return (
      <>
        {potionRow({ emoji: '🧪', name: 'Health Potion', desc: 'Restores 30 HP', count: healthPots, color: '#FF6B6B', border: 'rgba(139,0,0,0.4)', disabled: healthPots === 0 || hp >= getMaxHp(), onUse: () => { sounds.click(); useHealth(); } })}
        {potionRow({ emoji: '💙', name: 'Stamina Potion', desc: 'Restores 50% SP', count: staminaPots, color: '#6BB6FF', border: 'rgba(30,58,95,0.4)', disabled: staminaPots === 0 || stamina >= getMaxStamina(), onUse: () => { sounds.click(); if (staminaPots > 0 && stamina < getMaxStamina()) { setStaminaPots(s => s - 1); const max = getMaxStamina(); const amt = Math.max(GAME_CONSTANTS.STAMINA_POTION_MIN, Math.floor(max * (GAME_CONSTANTS.STAMINA_POTION_RESTORE_PERCENT / 100))); setStamina(s => Math.min(max, s + amt)); addLog(`Used Stamina Potion! +${Math.max(GAME_CONSTANTS.STAMINA_POTION_MIN, Math.floor(getMaxStamina() * (GAME_CONSTANTS.STAMINA_POTION_RESTORE_PERCENT / 100)))} SP`); } } })}
        {potionRow({ emoji: '🔮', name: 'Cleanse Potion', desc: 'Removes 1 curse level', count: cleansePots, color: '#B794F4', border: `rgba(107,44,145,${curseLevel > 0 ? 0.6 : 0.3})`, disabled: cleansePots === 0 || curseLevel === 0, onUse: () => { sounds.click(); useCleanse(); } })}
        {luckyCharmActive && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(47,82,51,0.5)', background: 'rgba(47,82,51,0.1)' }}>
            <span style={{ fontSize: '22px' }}>🍀</span>
            <div>
              <p style={{ color: '#F5F5DC', fontWeight: 700, fontSize: '13px', marginBottom: '2px' }}>Fortune Philter</p>
              <p style={{ color: '#68D391', fontSize: '11px' }}>2× loot from next elite boss · <span style={{ color: '#68D391', fontWeight: 700 }}>Active</span></p>
            </div>
          </div>
        )}
      </>
    );
  };

  // ── RIGHT PANEL helpers ──
  const slotBox = (item) => ({
    padding: '10px', borderRadius: '8px', minHeight: '68px',
    display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center',
    border: `1px solid ${item ? getRarityColor(item.rarity || 'common') + '60' : 'rgba(192,192,192,0.12)'}`,
    background: item ? VISUAL_STYLES.card.elevated : VISUAL_STYLES.card.subtle,
    boxShadow: item ? `0 0 8px ${getRarityColor(item.rarity || 'common')}18` : 'none',
  });

  const totalDR      = Object.values(equippedArmor).reduce((s, p) => s + (p?.affixes?.percentDR || 0), 0);
  const totalBonusHP = Object.values(equippedArmor).reduce((s, p) => s + (p?.affixes?.flatHP   || 0), 0) + (equippedPendant?.hp || 0);

  const counts = {
    weapons:     (equippedWeapon ? 1 : 0) + weaponInventory.length,
    armor:       ARMOR_SLOTS.reduce((s, { key }) => s + (equippedArmor[key] ? 1 : 0) + (armorInventory[key]?.length || 0), 0),
    accessories: (equippedPendant ? 1 : 0) + pendantInventory.length + (equippedRing ? 1 : 0) + ringInventory.length,
    potions:     healthPots + staminaPots + cleansePots,
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center overflow-hidden" onClick={() => setShowInventoryModal(false)}>
      {/* Blacksmith — only shown when viewport is wide enough that it won't clip off-screen */}
      {showNPC && <motion.div
        initial={{ opacity: 0, x: -20, y: '-50%' }} animate={{ opacity: 1, x: 0, y: '-50%' }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        style={{
          position: 'absolute',
          left: 'calc(25% - min(15vw, 225px) - clamp(70px, 7.5vw, 120px))',
          top: '40%',
          width: 'clamp(140px, 15vw, 240px)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '14px',
          pointerEvents: 'auto',
        }}
        onClick={e => e.stopPropagation()}
      >
        <img src="/npcs/blacksmith.png" alt="Grimdar"
          style={{ width: 'clamp(110px, 13vw, 210px)', height: 'clamp(110px, 13vw, 210px)', borderRadius: '50%', objectFit: 'cover', objectPosition: 'top',
            border: `3px solid ${COLORS.gold}`, boxShadow: '0 0 40px rgba(201,169,97,0.65), 0 0 100px rgba(201,169,97,0.2)' }}/>
        <p style={{ fontFamily: 'Cinzel, serif', fontSize: '13px', fontWeight: 700, color: COLORS.gold, letterSpacing: '0.12em', textAlign: 'center' }}>GRIMDAR</p>
        <p style={{ fontSize: '11px', color: COLORS.silver, fontStyle: 'italic', textAlign: 'center', marginTop: '-10px' }}>Master Smith</p>
        {/* Dialogue bubble */}
        <div style={{
          marginTop: '8px', padding: '12px 16px', borderRadius: '10px', maxWidth: '280px',
          background: 'rgba(20,15,5,0.85)', border: `1px solid rgba(212,175,55,0.35)`,
          boxShadow: '0 2px 12px rgba(0,0,0,0.5)', position: 'relative',
        }}>
          {/* Speech arrow pointing up */}
          <div style={{ position: 'absolute', top: '-8px', left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '8px solid transparent', borderRight: '8px solid transparent', borderBottom: `8px solid rgba(212,175,55,0.35)` }}/>
          <div style={{ position: 'absolute', top: '-6px', left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '7px solid transparent', borderRight: '7px solid transparent', borderBottom: '7px solid rgba(20,15,5,0.85)' }}/>
          <p style={{ fontFamily: 'Cinzel, serif', fontSize: '12px', color: '#F5F5DC', fontStyle: 'italic', lineHeight: 1.5, textAlign: 'center', margin: 0 }}>
            "{grimdarQuote}"
          </p>
        </div>
      </motion.div>}

      <motion.div
        className="relative flex flex-col rounded-xl border-2 overflow-hidden"
        style={{
          width: showNPC ? 'min(60vw, 900px)' : 'min(90vw, calc(100vw - 32px))', maxWidth: '1200px', height: '90vh',
          backgroundImage: 'url(/Gemini_Generated_Image_w9etpyw9etpyw9et.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderColor: COLORS.silver,
          boxShadow: VISUAL_STYLES.shadow.elevated,
        }}
        initial={{ opacity: 0, scale: 0.97, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        onClick={e => e.stopPropagation()}
      >
        {/* ── HEADER ── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '16px 20px', flexShrink: 0,
          borderBottom: `1px solid rgba(212,175,55,0.3)`,
          background: 'rgba(0,0,0,0.55)',
          position: 'relative',
        }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: '26px', color: COLORS.gold, letterSpacing: '0.18em', lineHeight: 1, textShadow: '0 0 20px rgba(201,169,97,0.5)' }}>THE ARMORY</p>
            <p style={{ fontSize: '11px', color: COLORS.silver, fontStyle: 'italic', marginTop: '4px' }}>Grimdar Ironforge · Master Smith</p>
          </div>
          <button
            onClick={() => { sounds.click(); setShowInventoryModal(false); }}
            style={{ position: 'absolute', right: '20px', background: 'rgba(0,0,0,0.5)', border: `1px solid rgba(212,175,55,0.4)`, borderRadius: '8px', padding: '8px', color: COLORS.gold, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          >
            <X size={18}/>
          </button>
        </div>

        {/* ── MAIN SPLIT ── */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

          {/* LEFT — Collected items */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', borderRight: `1px solid rgba(212,175,55,0.2)`, overflow: 'hidden', background: 'rgba(0,0,0,0.45)' }}>

            {/* Category filter */}
            <div style={{ display: 'flex', gap: '6px', padding: '10px 16px 8px', flexShrink: 0, background: 'rgba(0,0,0,0.2)', borderBottom: `1px solid rgba(212,175,55,0.2)` }}>
              {CATEGORIES.map(({ key, label }) => (
                <button key={key}
                  onClick={() => { sounds.click(); setCategory(key); }}
                  style={{
                    flex: 1, padding: '8px 4px', borderRadius: '6px', fontSize: '11px', fontWeight: 700,
                    border: `1px solid ${category === key ? 'rgba(212,175,55,0.6)' : 'rgba(155,139,126,0.25)'}`,
                    background: category === key ? 'rgba(184,134,11,0.3)' : 'rgba(0,0,0,0.3)',
                    color: category === key ? COLORS.gold : COLORS.silver,
                    cursor: 'pointer',
                  }}
                >
                  {label}
                  {counts[key] > 0 && <span style={{ marginLeft: '4px', opacity: 0.75, fontSize: '10px' }}>({counts[key]})</span>}
                </button>
              ))}
            </div>

            {/* Scrollable item list */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px 24px' }}>
              {category === 'weapons'     && renderWeapons()}
              {category === 'armor'       && renderArmor()}
              {category === 'accessories' && renderAccessories()}
              {category === 'potions'     && renderPotions()}
            </div>
          </div>

          {/* RIGHT — Equipped gear */}
          <div style={{ width: '44%', overflowY: 'auto', padding: '16px 18px 24px', background: 'rgba(0,0,0,0.5)', flexShrink: 0 }}>

            <p style={{ fontFamily: 'Cinzel, serif', fontSize: '10px', fontWeight: 700, color: COLORS.gold, letterSpacing: '0.18em', textAlign: 'center', marginBottom: '14px' }}>EQUIPPED GEAR</p>

            {/* Weapon slot */}
            <div style={{ ...slotBox(equippedWeapon), marginBottom: '10px', minHeight: '100px', gap: '6px' }}>
              <p style={{ fontSize: '9px', color: COLORS.silver, fontWeight: 700, letterSpacing: '0.12em' }}>WEAPON</p>
              {equippedWeapon ? (
                <>
                  <img src={getWeaponSprite(equippedWeapon)} alt={equippedWeapon.name}
                    style={{ width: 58, height: 58, objectFit: 'contain',
                      filter: `drop-shadow(0 0 7px ${getRarityColor(equippedWeapon.rarity || 'common')}90)` }}/>
                  <p style={{ color: getRarityColor(equippedWeapon.rarity || 'common'), fontWeight: 700, fontSize: '12px', marginBottom: '2px' }}>{equippedWeapon.name}</p>
                  <p style={{ color: '#68D391', fontSize: '11px' }}>+{equippedWeapon.attack} Attack</p>
                  {equippedWeapon.affixes?.flatDamage  > 0 && <p style={{ color: '#90EE90', fontSize: '10px' }}>+{Math.floor(equippedWeapon.affixes.flatDamage)} Flat Damage</p>}
                  {equippedWeapon.affixes?.critChance  > 0 && <p style={{ color: '#FFD700', fontSize: '10px' }}>+{Math.floor(equippedWeapon.affixes.critChance)}% Crit Chance</p>}
                  {equippedWeapon.affixes?.poisonChance > 0 && <p style={{ color: '#9370DB', fontSize: '10px' }}>+{Math.floor(equippedWeapon.affixes.poisonChance)}% Poison</p>}
                </>
              ) : (
                <p style={{ color: COLORS.silver, fontStyle: 'italic', fontSize: '12px', opacity: 0.4 }}>Empty slot</p>
              )}
            </div>

            {/* Armor slots — 2×2 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
              {ARMOR_SLOTS.map(({ key, label, icon }) => {
                const item = equippedArmor[key];
                return (
                  <div key={key} style={slotBox(item)}>
                    <p style={{ fontSize: '9px', color: COLORS.silver, fontWeight: 700, letterSpacing: '0.08em', marginBottom: '5px' }}>{label.toUpperCase()}</p>
                    {item ? (
                      <>
                        <img src={getArmorSprite(item, key)} alt={item.name}
                          style={{ width: 36, height: 36, objectFit: 'contain', marginBottom: '4px',
                            filter: `drop-shadow(0 0 5px ${getRarityColor(item.rarity || 'common')}70)` }}/>
                        <p style={{ color: getRarityColor(item.rarity || 'common'), fontWeight: 700, fontSize: '11px', marginBottom: '2px', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</p>
                        <p style={{ color: '#68D391', fontSize: '10px' }}>+{item.defense} Def</p>
                        {item.affixes?.percentDR > 0 && <p style={{ color: '#68D391', fontSize: '9px' }}>{Math.floor(item.affixes.percentDR)}% DR</p>}
                        {item.affixes?.flatHP     > 0 && <p style={{ color: '#FF6B6B', fontSize: '9px' }}>+{Math.floor(item.affixes.flatHP)} HP</p>}
                      </>
                    ) : (
                      <p style={{ color: COLORS.silver, fontStyle: 'italic', fontSize: '11px', opacity: 0.4 }}>Empty</p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Accessory slots — 1×2 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
              <div style={slotBox(equippedPendant)}>
                <p style={{ fontSize: '9px', color: COLORS.silver, fontWeight: 700, letterSpacing: '0.08em', marginBottom: '5px' }}>PENDANT</p>
                {equippedPendant ? (
                  <>
                    <p style={{ color: getRarityColor(equippedPendant.rarity || 'common'), fontWeight: 700, fontSize: '11px', marginBottom: '2px', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{equippedPendant.name}</p>
                    <p style={{ color: '#FF6B6B', fontSize: '10px' }}>+{equippedPendant.hp} HP</p>
                    {equippedPendant.affixes?.xpBonus > 0 && <p style={{ color: '#F59E0B', fontSize: '9px' }}>+{Math.floor(equippedPendant.affixes.xpBonus)}% XP</p>}
                  </>
                ) : (
                  <p style={{ color: 'rgba(192,192,192,0.18)', fontStyle: 'italic', fontSize: '11px' }}>Empty</p>
                )}
              </div>
              <div style={slotBox(equippedRing)}>
                <p style={{ fontSize: '9px', color: COLORS.silver, fontWeight: 700, letterSpacing: '0.08em', marginBottom: '5px' }}>RING</p>
                {equippedRing ? (
                  <>
                    <p style={{ color: getRarityColor(equippedRing.rarity || 'common'), fontWeight: 700, fontSize: '11px', marginBottom: '2px', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{equippedRing.name}</p>
                    <p style={{ color: '#6BB6FF', fontSize: '10px' }}>+{equippedRing.stamina} STA</p>
                    {equippedRing.affixes?.critChance > 0 && <p style={{ color: '#FFD700', fontSize: '9px' }}>+{Math.floor(equippedRing.affixes.critChance)}% Crit</p>}
                    {equippedRing.affixes?.goldBonus  > 0 && <p style={{ color: '#34D399', fontSize: '9px' }}>+{Math.floor(equippedRing.affixes.goldBonus)}% Gold</p>}
                  </>
                ) : (
                  <p style={{ color: 'rgba(192,192,192,0.18)', fontStyle: 'italic', fontSize: '11px' }}>Empty</p>
                )}
              </div>
            </div>

          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default InventoryModal;
