import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import { cookieName, createAdminToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  const redirectToLogin = (error: string) => {
    const login = new URL("/admin/login", request.url);
    login.searchParams.set("error", error);
    return NextResponse.redirect(login);
  };

  if (!code) return redirectToLogin("invalid");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) return redirectToLogin("google");

  // Capture any session cookies the exchange sets so they reach the browser.
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

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.user) return redirectToLogin("google");

  // Only the registered admin email may enter the private area.
  const adminEmail = process.env.ADMIN_EMAIL;
  const googleEmail = data.user.email?.toLowerCase();
  if (!adminEmail || !googleEmail || googleEmail !== adminEmail.toLowerCase()) {
    return redirectToLogin("not-approved");
  }

  const token = await createAdminToken();
  const response = NextResponse.redirect(new URL("/admin", request.url));
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