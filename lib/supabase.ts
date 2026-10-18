import { createBrowserClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

/** True when real Supabase credentials are present in the environment. */
export function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Vercel warns when a NEXT_PUBLIC_ variable is set to a value that looks like
  // a callback path rather than the project URL. That usually means the env var
  // was filled in with the wrong value (for example the OAuth redirect URL).
  // When that happens, trust the env var value over any local .env.local file.
  if (url && url.includes("/auth/v1/callback")) {
    return false;
  }

  return Boolean(url && anon && url.includes("supabase.co"));
}

/** Server-only client with the service role key (bypasses RLS). Never used on the client. */
export function createSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured");
  }
  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}