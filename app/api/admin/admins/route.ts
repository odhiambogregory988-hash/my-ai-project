import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import { ADMIN_OWNER_EMAIL, cookieName, isAdminTokenValid } from "@/lib/auth";

const OWNER_EMAIL = ADMIN_OWNER_EMAIL;

function supabaseFromRequest(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) return null;
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: () => {
        // Read-only for this route.
      },
    },
  });
}

export async function GET(request: NextRequest) {
  const token = request.cookies.get(cookieName)?.value;
  if (!(await isAdminTokenValid(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = supabaseFromRequest(request);
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      { error: "Sign in with Google once to manage admins." },
      { status: 401 },
    );
  }

  const { data, error } = await supabase
    .from("admin_users")
    .select("email,created_at")
    .order("created_at", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    owner: OWNER_EMAIL,
    admins: data.map((row) => ({ email: row.email, createdAt: row.created_at })),
  });
}

async function ownerGuard(request: NextRequest) {
  const token = request.cookies.get(cookieName)?.value;
  if (!(await isAdminTokenValid(token))) {
    return { error: "Unauthorized", status: 401 as const };
  }
  const supabase = supabaseFromRequest(request);
  if (!supabase) return { error: "Supabase not configured", status: 500 as const };
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) {
    return { error: "Sign in with Google once to manage admins.", status: 401 as const };
  }
  if (user.email.toLowerCase() !== OWNER_EMAIL) {
    return { error: "Only the store owner can manage the admin list.", status: 403 as const };
  }
  return { supabase, user };
}

export async function POST(request: NextRequest) {
  const guard = await ownerGuard(request);
  if ("error" in guard) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }
  const supabase = guard.supabase;

  let body: { email?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const email = body.email?.trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const { error } = await supabase.from("admin_users").insert({ email });
  if (error) {
    const message =
      error.code === "23505"
        ? `${email} is already an admin.`
        : error.message;
    return NextResponse.json({ error: message }, { status: 400 });
  }
  return NextResponse.json({ ok: true, email });
}

export async function DELETE(request: NextRequest) {
  const guard = await ownerGuard(request);
  if ("error" in guard) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }
  const supabase = guard.supabase;

  const email = new URL(request.url).searchParams.get("email")?.trim().toLowerCase();
  if (!email) return NextResponse.json({ error: "Missing email" }, { status: 400 });
  if (email === OWNER_EMAIL) {
    return NextResponse.json({ error: "The owner cannot be removed." }, { status: 400 });
  }

  const { error } = await supabase.from("admin_users").delete().eq("email", email);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, email });
}