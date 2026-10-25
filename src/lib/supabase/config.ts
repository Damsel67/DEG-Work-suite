const supabaseUrl = import.meta.env["VITE_SUPABASE_URL"]?.trim();
const supabasePublishableKey = import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"]?.trim();

export function getSupabaseConfig() {
  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error(
      "Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to .env.local.",
    );
  }

  return { supabaseUrl, supabasePublishableKey };
}

