import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import { cookieName, createAdminToken, isOwnerEmail } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();

  // Fallback: the old env-based gate, only when Supabase isn't configured.
  if (!isSupabaseConfigured()) {
    const valid = email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD;
    if (!valid) return NextResponse.json({ message: "Invalid email or password." }, { status: 401 });

    const token = await createAdminToken();
    const response = NextResponse.json({ ok: true });
    response.cookies.set(cookieName, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 8,
    });
    return response;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  // Capture the Supabase session cookies so the browser keeps a real session
  // (needed by the admin data API's session path to show real data).
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

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) {
    return NextResponse.json(
      {
        message:
          "No password account found for this email. Use Continue with Google to sign in as an admin.",
      },
      { status: 401 },
    );
  }

  // Owner always counts as admin; everyone else must be on the roster.
  if (!isOwnerEmail(data.user.email)) {
    const { data: isAdmin } = await supabase.rpc("is_admin", { user_id: data.user.id });
    if (!isAdmin) {
      return NextResponse.json(
        { message: "This account is not on the admin list. Ask the store owner to add you." },
        { status: 403 },
      );
    }
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