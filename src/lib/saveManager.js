import { supabase } from './supabase';

const LOCAL_KEY = 'fantasyStudyQuest';
let writeTimer = null;

function clamp(val, min, max, fallback) {
  const n = Number(val);
  return Number.isFinite(n) ? Math.max(min, Math.min(max, Math.floor(n))) : fallback;
}

function sanitizeSave(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return null;
  const d = { ...data };

  // Numerics — clamp to sane ranges
  if (d.level          !== undefined) d.level          = clamp(d.level,          1,         999,       1);
  if (d.currentDay     !== undefined) d.currentDay     = clamp(d.currentDay,     1,         9999,      1);
  if (d.hp             !== undefined) d.hp             = clamp(d.hp,             0,         9999,      100);
  if (d.stamina        !== undefined) d.stamina        = clamp(d.stamina,        0,         9999,      100);
  if (d.xp             !== undefined) d.xp             = clamp(d.xp,            0,         9_999_999, 0);
  if (d.gold           !== undefined) d.gold           = clamp(d.gold,          0,         9_999_999, 0);
  if (d.skipCount      !== undefined) d.skipCount      = clamp(d.skipCount,     0,         999,       0);
  if (d.consecutiveDays!== undefined) d.consecutiveDays= clamp(d.consecutiveDays,0,        9999,      0);
  if (d.curseLevel     !== undefined) d.curseLevel     = clamp(d.curseLevel,    0,         100,       0);
  if (d.healthPots     !== undefined) d.healthPots     = clamp(d.healthPots,    0,         999,       0);
  if (d.staminaPots    !== undefined) d.staminaPots    = clamp(d.staminaPots,   0,         999,       0);
  if (d.cleansePots    !== undefined) d.cleansePots    = clamp(d.cleansePots,   0,         999,       0);
  if (d.fusionCrystals !== undefined) d.fusionCrystals = clamp(d.fusionCrystals,0,         9999,      0);
  if (d.guildPoints    !== undefined) d.guildPoints    = clamp(d.guildPoints,   0,         9_999_999, 0);
  if (d.gauntletMilestone!==undefined)d.gauntletMilestone=clamp(d.gauntletMilestone,0,    999,       0);
  if (d.weapon         !== undefined) d.weapon         = clamp(d.weapon,        0,         9999,      0);
  if (d.armor          !== undefined) d.armor          = clamp(d.armor,         0,         9999,      0);
  if (d.daysSinceShop  !== undefined) d.daysSinceShop  = clamp(d.daysSinceShop, 0,         9999,      0);
  if (d.lastMarketUpdateDay!==undefined) d.lastMarketUpdateDay = clamp(d.lastMarketUpdateDay, 0, 9999, 0);

  // Booleans
  ['hasStarted', 'isDayActive', 'gauntletUnlocked', 'eliteBossDefeatedToday',
   'dailyQuestCompleted'].forEach(k => {
    if (d[k] !== undefined) d[k] = Boolean(d[k]);
  });

  // Arrays — corrupt non-arrays become empty arrays
  ['tasks', 'graveyard', 'weaponInventory', 'grimoireInventory',
   'tomeInventory', 'capturedMonsters', 'completedLocationContracts',
   'pendingLocationRewards', 'huntingChallenges', 'defeatedFactionMembers',
   'studyWebsites', 'shopInventory', 'restedCursed'].forEach(k => {
    if (d[k] !== undefined && !Array.isArray(d[k])) d[k] = [];
  });

  // armorInventory is an object with slot arrays — repair if corrupt
  if (d.armorInventory !== undefined) {
    if (typeof d.armorInventory !== 'object' || d.armorInventory === null || Array.isArray(d.armorInventory)) {
      d.armorInventory = { helmet: [], chest: [], gloves: [], boots: [] };
    } else {
      const slots = ['helmet', 'chest', 'gloves', 'boots'];
      slots.forEach(s => { if (!Array.isArray(d.armorInventory[s])) d.armorInventory[s] = []; });
    }
  }

  // Objects — corrupt non-objects are dropped (will fall back to defaults)
  ['hero', 'equippedWeapon', 'equippedArmor', 'equippedGrimoire', 'equippedTome',
   'studyStats', 'marketModifiers', 'weeklyPlan', 'calendarTasks',
   'calendarFocus', 'calendarEvents', 'flashcardDecks'].forEach(k => {
    if (d[k] !== undefined && (typeof d[k] !== 'object' || d[k] === null || Array.isArray(d[k]))) {
      delete d[k];
    }
  });

  // Hero name must be a non-empty string
  if (d.hero) {
    if (typeof d.hero.name !== 'string' || !d.hero.name.trim()) d.hero.name = 'Unknown';
  }

  return d;
}

export async function loadSave() {
  // If authenticated, fetch from Supabase (cloud save takes priority)
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data, error } = await supabase
      .from('saves')
      .select('data')
      .eq('user_id', user.id)
      .single();
    if (!error && data?.data) {
      const clean = sanitizeSave(data.data);
      localStorage.setItem(LOCAL_KEY, JSON.stringify(clean));
      return clean;
    }
  }
  // Fall back to localStorage (offline or not signed in)
  const local = localStorage.getItem(LOCAL_KEY);
  return local ? sanitizeSave(JSON.parse(local)) : null;
}

export function writeSave(saveData) {
  // Write locally immediately
  localStorage.setItem(LOCAL_KEY, JSON.stringify(saveData));

  // Debounce Supabase write (max once every 5 seconds)
  clearTimeout(writeTimer);
  writeTimer = setTimeout(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('saves').upsert(
      { user_id: user.id, data: saveData, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    );
  }, 5000);
}
