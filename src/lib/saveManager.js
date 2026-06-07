import { supabase } from './supabase';

const LOCAL_KEY = 'fantasyStudyQuest';
let writeTimer = null;

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
      // Keep local cache in sync
      localStorage.setItem(LOCAL_KEY, JSON.stringify(data.data));
      return data.data;
    }
  }
  // Fall back to localStorage (offline or not signed in)
  const local = localStorage.getItem(LOCAL_KEY);
  return local ? JSON.parse(local) : null;
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

