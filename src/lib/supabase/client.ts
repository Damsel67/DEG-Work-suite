import { createBrowserClient } from "@supabase/ssr";

import { getSupabaseConfig } from "./config";

let browserClient: ReturnType<typeof createBrowserClient> | undefined;

export function createSupabaseBrowserClient() {
  if (!browserClient) {
    const { supabaseUrl, supabasePublishableKey } = getSupabaseConfig();
    browserClient = createBrowserClient(supabaseUrl, supabasePublishableKey);
  }

  return browserClient;
}

