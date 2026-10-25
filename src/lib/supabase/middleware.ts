import { createMiddleware } from "@tanstack/react-start";

import { createSupabaseServerClient } from "./server";

export const supabaseSessionMiddleware = createMiddleware().server(async ({ next }) => {
  const supabase = createSupabaseServerClient();

  // getUser validates the session with Supabase Auth and lets the SSR client
  // refresh cookies when the access token has expired.
  await supabase.auth.getUser();

  return next();
});

