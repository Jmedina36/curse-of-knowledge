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
  if (d.gauntletMilestone!==undefined)d.gauntletMilestone=clamp(d.gauntletMilestone,0,    9_999_999, 1500);
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

  // Save metadata (see writeSave): legacy saves have neither field
  d.savedAt = Number.isFinite(Number(d.savedAt)) ? Number(d.savedAt) : 0;
  if (typeof d.ownerId !== 'string') d.ownerId = null;

  return d;
}

// ─── Save syncing ───────────────────────────────────────────────────────────
// Every save is stamped with `savedAt` (ms timestamp) and `ownerId` (the
// Supabase user whose save is loaded, or null when playing signed out).
// localStorage is written immediately; the cloud write is debounced, so the
// local copy can be newer than the cloud one if the tab closes before the
// debounce fires. loadSave() therefore picks whichever copy is newest instead
// of always trusting the cloud.

// The user whose save is currently loaded. Only loadSave() changes it, so
// writes made between a sign-in and its loadSave() can't claim the new account.
let activeOwnerId = null;
let pendingSave = null;

async function sessionUserId() {
  // getSession reads the stored session — no network round-trip, works offline
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user?.id ?? null;
}

function readLocal() {
  const raw = localStorage.getItem(LOCAL_KEY);
  if (!raw) return null;
  try {
    return sanitizeSave(JSON.parse(raw));
  } catch {
    localStorage.removeItem(LOCAL_KEY);
    return null;
  }
}

async function pushToCloud(save) {
  const { error } = await supabase.from('saves').upsert(
    { user_id: save.ownerId, data: save, updated_at: new Date().toISOString() },
    { onConflict: 'user_id' }
  );
  return !error;
}

export async function loadSave() {
  const userId = await sessionUserId();
  const local = readLocal();

  if (!userId) {
    activeOwnerId = null;
    return local;
  }

  const { data, error } = await supabase
    .from('saves')
    .select('data')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    // Cloud unreachable (offline etc.) — play from the local copy. Keep
    // syncing as this user unless the local save belongs to someone else.
    activeOwnerId = local?.ownerId && local.ownerId !== userId ? null : userId;
    return local;
  }

  activeOwnerId = userId;
  const cloud = data?.data ? sanitizeSave(data.data) : null;
  const localIsMine = local?.ownerId === userId;

  // This user's local copy is newer: the last cloud write never landed.
  // Use it, and push it up now so other devices get it too.
  if (localIsMine && local.savedAt > (cloud?.savedAt ?? 0)) {
    pushToCloud(local);
    return local;
  }

  if (cloud) {
    cloud.ownerId = userId;
    localStorage.setItem(LOCAL_KEY, JSON.stringify(cloud));
    return cloud;
  }

  // No cloud save yet — carry on with whatever is local
  return local;
}

export function writeSave(saveData) {
  const save = { ...saveData, savedAt: Date.now(), ownerId: activeOwnerId };

  // Write locally immediately
  localStorage.setItem(LOCAL_KEY, JSON.stringify(save));
  if (!save.ownerId) return;

  // Debounce Supabase write (max once every 5 seconds)
  pendingSave = save;
  clearTimeout(writeTimer);
  writeTimer = setTimeout(flushSave, 5000);
}

// Send any debounced cloud write right away.
export async function flushSave() {
  clearTimeout(writeTimer);
  const save = pendingSave;
  pendingSave = null;
  if (!save) return;

  // Signed out or switched accounts since this was written — don't upload.
  // The local copy keeps its ownerId, so loadSave() can still recover it.
  if (await sessionUserId() !== save.ownerId) return;

  const ok = await pushToCloud(save);
  // On failure, keep it queued for the next flush unless something newer arrived
  if (!ok && !pendingSave) pendingSave = save;
}

// Flush when the tab is hidden or closed, so the cloud copy doesn't lag behind.
// Browsers may cut off requests during unload; loadSave()'s newest-wins check
// is the safety net for that case.
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flushSave();
  });
  window.addEventListener('pagehide', flushSave);
}
