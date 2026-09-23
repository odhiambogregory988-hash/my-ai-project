import { NextResponse, type NextRequest } from "next/server";
import { cookieName } from "@/lib/auth";

/**
 * Sign out.
 *
 * Clearing only `orwas-admin-session` is not enough: the Supabase session
 * cookies stay behind, and `POST /api/admin/session` mints a brand-new admin
 * token from those cookies without asking for credentials again. On a shared
 * computer that meant "sign out" left the admin area one fetch away.
 * So we expire the admin cookie AND every Supabase auth cookie in the request.
 */
export async function POST(request: NextRequest) {
  const response = NextResponse.json({ ok: true });
  const secure = process.env.NODE_ENV === "production";
  const expired = { httpOnly: true, expires: new Date(0), path: "/", secure };

  response.cookies.set(cookieName, "", { ...expired, sameSite: "strict" });

  // Supabase auth cookies are named `sb-<project-ref>-auth-token` and are
  // chunked with numeric suffixes (`…-auth-token.0`, `.1`) for large tokens.
  for (const cookie of request.cookies.getAll()) {
    if (cookie.name.startsWith("sb-")) {
      response.cookies.set(cookie.name, "", { ...expired, sameSite: "lax" });
    }
  }

  return response;
}
