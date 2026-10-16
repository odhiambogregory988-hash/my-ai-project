import { createServerClient } from "@supabase/ssr";
import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { cookieName, createAdminToken, isOwnerEmail, ADMIN_SESSION_MAX_AGE_SECONDS } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase";

/* ------------------------------------------------------------
   Brute-force throttle

   Without this an attacker can guess passwords as fast as the network
   allows. The counter lives in the instance's memory, so on serverless
   hosting it is a strong speed bump rather than a wall — enough to make
   guessing thousands of passwords a minute impossible.
   ------------------------------------------------------------ */
const LOGIN_WINDOW_MS = 10 * 60 * 1000;
const LOGIN_MAX_ATTEMPTS = 8;
const MAX_TRACKED_KEYS = 5000;
const loginAttempts = new Map<string, { count: number; start: number }>();

function loginThrottleKey(request: NextRequest, email: string) {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = (forwarded ? forwarded.split(",")[0] : request.headers.get("x-real-ip")) || "unknown";
  return `${ip.trim()}|${email.toLowerCase()}`;
}

/** Seconds before the caller may retry, or 0 when they are within the limit. */
function throttleDelay(key: string) {
  const record = loginAttempts.get(key);
  if (!record) return 0;
  const elapsed = Date.now() - record.start;
  if (elapsed > LOGIN_WINDOW_MS) {
    loginAttempts.delete(key);
    return 0;
  }
  if (record.count < LOGIN_MAX_ATTEMPTS) return 0;
  return Math.ceil((LOGIN_WINDOW_MS - elapsed) / 1000);
}

function noteLoginFailure(key: string) {
  const record = loginAttempts.get(key);
  if (!record || Date.now() - record.start > LOGIN_WINDOW_MS) {
    if (loginAttempts.size >= MAX_TRACKED_KEYS) loginAttempts.clear();
    loginAttempts.set(key, { count: 1, start: Date.now() });
    return;
  }
  record.count += 1;
}

/** Constant-time compare so response timing cannot leak the configured secret. */
function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export async function POST(request: NextRequest) {
  let body: { email?: unknown; password?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid request." }, { status: 400 });
  }
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!email || !password) {
    return NextResponse.json({ message: "Enter your email and password." }, { status: 400 });
  }

  const throttleKey = loginThrottleKey(request, email);
  const waitSeconds = throttleDelay(throttleKey);
  if (waitSeconds > 0) {
    return NextResponse.json(
      { message: `Too many sign-in attempts. Please try again in ${Math.ceil(waitSeconds / 60)} minute(s).` },
      { status: 429, headers: { "Retry-After": String(waitSeconds) } },
    );
  }

  // Fallback: the old env-based gate, only when Supabase isn't configured.
  if (!isSupabaseConfigured()) {
    const configuredEmail = String(process.env.ADMIN_EMAIL || "");
    const configuredPassword = String(process.env.ADMIN_PASSWORD || "");
    const valid =
      configuredEmail.length > 0 &&
      configuredPassword.length > 0 &&
      safeEqual(email.toLowerCase(), configuredEmail.toLowerCase()) &&
      safeEqual(password, configuredPassword);
    if (!valid) {
      noteLoginFailure(throttleKey);
      return NextResponse.json({ message: "Invalid email or password." }, { status: 401 });
    }
    loginAttempts.delete(throttleKey);

    const token = await createAdminToken();
    const response = NextResponse.json({ ok: true });
    response.cookies.set(cookieName, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
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
    noteLoginFailure(throttleKey);
    // Supabase returns the SAME error for wrong password, password-less
    // account, and unknown email — so give one honest message that points
    // Google users at the right button instead of a misleading claim.
    const msg = error?.message || "";
    const invalid = /invalid|credentials/i.test(msg) || (error as { code?: string } | null)?.code === "invalid_credentials";
    return NextResponse.json(
      {
        message: invalid
          ? "Invalid email or password. If you normally sign in with Google, tap Continue with Google below."
          : `Sign-in problem: ${msg}. Please try again.`,
      },
      { status: 401 },
    );
  }

  // Owner always counts as admin; everyone else must be on the roster.
  if (!isOwnerEmail(data.user.email)) {
    const { data: isAdmin } = await supabase.rpc("is_admin", { user_id: data.user.id });
    if (!isAdmin) {
      noteLoginFailure(throttleKey);
      return NextResponse.json(
        { message: "This account is not on the admin list. Ask the store owner to add you." },
        { status: 403 },
      );
    }
  }

  loginAttempts.delete(throttleKey);

  const token = await createAdminToken();
  const response = NextResponse.json({ ok: true });
  sessionCookies.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
      ...options,
    });
  });
  response.cookies.set(cookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
  });
  return response;
}