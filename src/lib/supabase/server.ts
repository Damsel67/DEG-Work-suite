import { createServerClient } from "@supabase/ssr";
import { getRequestHeader, setCookie } from "@tanstack/react-start/server";

import { getSupabaseConfig } from "./config";

function readRequestCookies(cookieHeader: string | undefined) {
  if (!cookieHeader) return [];

  return cookieHeader.split(";").flatMap((part) => {
    const separator = part.indexOf("=");
    if (separator < 0) return [];

    const name = part.slice(0, separator).trim();
    const rawValue = part.slice(separator + 1).trim();
    if (!name) return [];

    try {
      return [{ name, value: decodeURIComponent(rawValue) }];
    } catch {
      return [{ name, value: rawValue }];
    }
  });
}

export function createSupabaseServerClient() {
  const { supabaseUrl, supabasePublishableKey } = getSupabaseConfig();

  return createServerClient(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll() {
        return readRequestCookies(getRequestHeader("cookie"));
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          setCookie(name, value, options);
        });
      },
    },
  });
}
