import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Simple user management helpers
export const createUser = async (name: string, role: 'player' | 'master') => {
  const { data, error } = await supabase
    .from('users')
    .insert({ name, role })
    .select()
    .single();
  return { data, error };
};

export const getUserByName = async (name: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('name', name)
    .maybeSingle();
  return { data, error };
};

export const updateUserActivity = async (userId: string) => {
  const { error } = await supabase
    .from('users')
    .update({ last_active: new Date().toISOString() })
    .eq('id', userId);
  return { error };
};

export const updateUserPreferences = async (userId: string, preferences: any) => {
  const { error } = await supabase
    .from('users')
    .update({ preferences })
    .eq('id', userId);
  return { error };
};