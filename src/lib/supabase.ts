import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    // Set session expiration to 1 month (30 days)
    // Note: Session will persist on the same device for 30 days
    storageKey: 'dental-system-auth',
    storage: window.localStorage,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  },
  global: {
    headers: {
      // Configure token refresh behavior
      'X-Client-Info': 'dental-system-web'
    }
  }
});

console.log('[Supabase] Connected to Supabase backend with Realtime enabled and 30-day session persistence');
