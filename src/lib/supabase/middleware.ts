import { createMiddleware } from "@tanstack/react-start";

import { isSupabaseConfigured } from "./config";
import { createSupabaseServerClient } from "./server";

export const supabaseSessionMiddleware = createMiddleware().server(async ({ next }) => {
  // Without backend settings there is no session to refresh; public pages must still render.
  if (!isSupabaseConfigured()) return next();

  const supabase = createSupabaseServerClient();

  // getUser validates the session with Supabase Auth and lets the SSR client
  // refresh cookies when the access token has expired.
  await supabase.auth.getUser();

  return next();
});
