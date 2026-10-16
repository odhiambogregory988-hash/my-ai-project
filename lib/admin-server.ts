// Shared helpers for the admin API routes: session check plus the Supabase
// client resolution used by every admin data read/write.

import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import { cookieName, isAdminTokenValid, isOwnerEmail } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase";

/** 401 response when the admin session cookie is missing or expired, otherwise null. */
export async function requireAdmin(request: NextRequest) {
  const token = request.cookies.get(cookieName)?.value;
  const valid = await isAdminTokenValid(token);
  if (!valid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

/** Service-role client when the key exists, otherwise the signed-in Google admin's session + RLS. */
export async function resolveDataClient(request: NextRequest) {
  try {
    const supabase = createSupabaseAdminClient();
    return { supabase, serviceRole: true };
  } catch {
    // Fallback: the admin's own Supabase session (set during Google sign-in).
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !anon) return null;
    const supabase = createServerClient(url, anon, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: () => {},
      },
    });
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;
    const { data: isAdmin } = await supabase.rpc("is_admin", { user_id: user.id });
    // The owner is always recognized, even before the roster is seeded.
    if (!isOwnerEmail(user.email) && !isAdmin) return null;
    return { supabase, serviceRole: false };
  }
}
