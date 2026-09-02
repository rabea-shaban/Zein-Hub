import { createClient } from '@supabase/supabase-js';
import { ENV } from './env.config.js';

const supabaseUrl = ENV.SUPABASE_URL;
const supabaseKey = ENV.SUPABASE_SERVICE_ROLE_KEY || ENV.SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('[Supabase] Warning: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY credentials.');
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
