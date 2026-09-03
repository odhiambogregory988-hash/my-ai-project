import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import { cookieName, isAdminTokenValid, isOwnerEmail } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase";

interface OrderRow {
  order_no: string;
  customer_email: string;
  customer_name: string;
  items: unknown[];
  subtotal: number;
  delivery_fee: number;
  total: number;
  status: string;
  created_at: string;
}

async function requireAdmin(request: NextRequest) {
  const token = request.cookies.get(cookieName)?.value;
  const valid = await isAdminTokenValid(token);
  if (!valid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

function mapOrderRow(row: OrderRow) {
  return {
    id: row.order_no,
    customerEmail: row.customer_email,
    customerName: row.customer_name,
    items: row.items,
    subtotal: Number(row.subtotal),
    deliveryFee: Number(row.delivery_fee),
    total: Number(row.total),
    status: row.status,
    createdAt: row.created_at,
  };
}

/** Service-role client when the key exists, otherwise the signed-in Google admin's session + RLS. */
async function resolveDataClient(request: NextRequest) {
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

export async function GET(request: NextRequest) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  try {
    const client = await resolveDataClient(request);
    if (!client) {
      return NextResponse.json({
        configured: false,
        error: "Sign in with Google to see real data.",
      });
    }
    const { supabase, serviceRole } = client;

    let customers: {
      id: string;
      name: string;
      email: string;
      address: string;
      avatarUrl: string;
      provider: string;
      createdAt: string;
    }[] = [];
    let ordersRes;

    if (serviceRole) {
      const [orders, usersRes, profilesRes] = await Promise.all([
        supabase.from("orders").select("*").order("created_at", { ascending: false }),
        supabase.auth.admin.listUsers(),
        supabase.from("profiles").select("id,name,address,avatar_url,created_at"),
      ]);
      if (orders.error) throw new Error(orders.error.message);
      if (usersRes.error) throw new Error(usersRes.error.message);
      if (profilesRes.error) throw new Error(profilesRes.error.message);
      ordersRes = orders;
      customers = profilesRes.data.map((profile) => {
        const user = usersRes.data.users.find((u) => u.id === profile.id);
        const meta = user?.user_metadata ?? {};
        return {
          id: profile.id,
          name:
            profile.name ||
            (typeof meta.full_name === "string" ? meta.full_name : "") ||
            (typeof meta.name === "string" ? meta.name : "") ||
            "",
          email: user?.email ?? "",
          address: profile.address,
          avatarUrl:
            profile.avatar_url ||
            (typeof meta.avatar_url === "string" ? meta.avatar_url : "") ||
            "",
          provider: (user?.app_metadata?.provider as string) || "email",
          createdAt: profile.created_at,
        };
      });
    } else {
      const [orders, customersRes] = await Promise.all([
        supabase.from("orders").select("*").order("created_at", { ascending: false }),
        supabase.rpc("get_customers"),
      ]);
      if (orders.error) throw new Error(orders.error.message);
      if (customersRes.error) throw new Error(customersRes.error.message);
      ordersRes = orders;
      customers = (customersRes.data ?? []).map((row: any) => ({
        id: row.id,
        name: row.name,
        email: row.email,
        address: row.address,
        avatarUrl: row.avatar_url,
        provider: row.provider || "email",
        createdAt: row.created_at,
      }));
    }

    return NextResponse.json({
      configured: true,
      orders: ordersRes.data.map(mapOrderRow),
      customers,
    });
  } catch (error) {
    return NextResponse.json({
      configured: false,
      error: error instanceof Error ? error.message : "Supabase not configured",
    });
  }
}

export async function POST(request: NextRequest) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  let body: { action?: string; id?: string; status?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  try {
    const client = await resolveDataClient(request);
    if (!client) {
      return NextResponse.json({
        configured: false,
        error: "Sign in with Google to manage data.",
      });
    }
    const { supabase, serviceRole } = client;

    switch (body.action) {
      case "update-order-status": {
        const { error } = await supabase
          .from("orders")
          .update({ status: body.status })
          .eq("order_no", body.id);
        if (error) throw new Error(error.message);
        return NextResponse.json({ ok: true });
      }
      case "delete-order": {
        const { error } = await supabase.from("orders").delete().eq("order_no", body.id);
        if (error) throw new Error(error.message);
        return NextResponse.json({ ok: true });
      }
      case "delete-customer": {
        if (!serviceRole) {
          return NextResponse.json(
            { error: "Deleting customers needs the service role key in .env.local." },
            { status: 400 },
          );
        }
        const { error } = await supabase.auth.admin.deleteUser(body.id ?? "");
        if (error) throw new Error(error.message);
        return NextResponse.json({ ok: true });
      }
      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({
      configured: false,
      error: error instanceof Error ? error.message : "Supabase not configured",
    });
  }
}