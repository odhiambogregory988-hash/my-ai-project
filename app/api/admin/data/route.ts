import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, resolveDataClient } from "@/lib/admin-server";

/** The only statuses the admin UI offers — anything else is rejected. */
const ORDER_STATUSES = ["Processing", "Shipped", "Delivered", "Cancelled"] as const;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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

    // Never trust the client's shape: reject anything that isn't a plain string.
    const orderNo = typeof body.id === "string" ? body.id.trim() : "";
    const status = typeof body.status === "string" ? body.status : "";

    switch (body.action) {
      case "update-order-status": {
        if (!orderNo) return NextResponse.json({ error: "Missing order number" }, { status: 400 });
        if (!(ORDER_STATUSES as readonly string[]).includes(status)) {
          return NextResponse.json({ error: "Unknown order status" }, { status: 400 });
        }
        const { error } = await supabase.from("orders").update({ status }).eq("order_no", orderNo);
        if (error) throw new Error(error.message);
        return NextResponse.json({ ok: true });
      }
      case "delete-order": {
        if (!orderNo) return NextResponse.json({ error: "Missing order number" }, { status: 400 });
        const { error } = await supabase.from("orders").delete().eq("order_no", orderNo);
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
        if (!UUID_RE.test(orderNo)) {
          return NextResponse.json({ error: "Missing customer id" }, { status: 400 });
        }
        const { error } = await supabase.auth.admin.deleteUser(orderNo);
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