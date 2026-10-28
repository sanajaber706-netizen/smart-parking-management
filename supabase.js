const defaultSupabaseConfig = {
  url: 'https://your-project-url.supabase.co',
  key: 'your-anon-key'
};

const configuredSupabase = window.__SUPABASE_CONFIG__ || {};
const supabaseConfig = {
  url: configuredSupabase.url || defaultSupabaseConfig.url,
  key: configuredSupabase.key || defaultSupabaseConfig.key
};

window.supabaseConfig = supabaseConfig;

window.isSupabaseConfigured = () => {
  return !!(
    supabaseConfig.url &&
    supabaseConfig.key &&
    !supabaseConfig.url.includes('your-project-url') &&
    !supabaseConfig.key.includes('your-anon-key')
  );
};

if (window.isSupabaseConfigured()) {
  const { createClient } = window.supabase;
  if (createClient) {
    window.supabaseClient = createClient(supabaseConfig.url, supabaseConfig.key, {
      auth: { persistSession: false }
    });
  }
}

console.log('Supabase configuration loaded.');
