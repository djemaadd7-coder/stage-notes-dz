// External Supabase client — connects directly to the user's own Supabase project.
// This bypasses the Lovable Cloud managed instance.
//
// Publishable / anon keys are safe to ship in client code (they only allow
// operations permitted by Row Level Security). NEVER put a service_role key here.
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

const SUPABASE_URL = "https://vcefyaqdxnkznggfajsl.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_VWyEYvSn7lc3RdxoMH69fw_dUd85fFZ";

function isNewSupabaseApiKey(value: string): boolean {
  return value.startsWith("sb_publishable_") || value.startsWith("sb_secret_");
}

// New-format Supabase keys are opaque strings, not JWTs — strip the auto-added
// Authorization: Bearer <apikey> header so PostgREST doesn't reject it.
const supabaseFetch: typeof fetch = (input, init) => {
  const headers = new Headers(
    typeof Request !== "undefined" && input instanceof Request ? input.headers : undefined,
  );
  if (init?.headers) {
    new Headers(init.headers).forEach((v, k) => headers.set(k, v));
  }
  if (
    isNewSupabaseApiKey(SUPABASE_PUBLISHABLE_KEY) &&
    headers.get("Authorization") === `Bearer ${SUPABASE_PUBLISHABLE_KEY}`
  ) {
    headers.delete("Authorization");
  }
  headers.set("apikey", SUPABASE_PUBLISHABLE_KEY);
  return fetch(input, { ...init, headers });
};

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  global: { fetch: supabaseFetch },
  auth: {
    storage: typeof window !== "undefined" ? window.localStorage : undefined,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
