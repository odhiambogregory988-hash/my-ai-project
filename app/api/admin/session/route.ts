import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import { cookieName, createAdminToken, isOwnerEmail } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase";

// Called by /admin/login after the browser client has exchanged the PKCE code.
// The Supabase session now lives in cookies, so we verify the user and mint the
// admin JWT cookie without needing the password again.
export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ message: "Supabase is not configured." }, { status: 500 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  let sessionCookies: { name: string; value: string; options?: Record<string, unknown> }[] = [];

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        sessionCookies = cookiesToSet.map((cookie) => ({
          name: cookie.name,
          value: cookie.value,
          options: cookie.options,
        }));
      },
    },
  });

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user?.email) {
    return NextResponse.json({ message: "No active sign-in. Please sign in again." }, { status: 401 });
  }

  // Owner always counts as admin; everyone else must be on the roster.
  let isAdmin = isOwnerEmail(user.email);
  if (!isAdmin) {
    const { data: roster } = await supabase.rpc("is_admin", { user_id: user.id });
    isAdmin = !!roster;
  }
  if (!isAdmin) {
    const { data: claimed } = await supabase.rpc("claim_owner");
    if (claimed) {
      const recheck = await supabase.rpc("is_admin", { user_id: user.id });
      isAdmin = !!recheck.data;
    }
  }
  if (!isAdmin) {
    return NextResponse.json(
      { message: `Signed in as ${user.email}, but this account is not on the admin list.` },
      { status: 403 },
    );
  }

  const token = await createAdminToken();
  const response = NextResponse.json({ ok: true });
  sessionCookies.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8,
      ...options,
    });
  });
  response.cookies.set(cookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  return response;
}
