import { NextRequest, NextResponse } from "next/server";
import { cookieName, isAdminTokenValid } from "@/lib/auth";
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

export async function GET(request: NextRequest) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  try {
    const supabase = createSupabaseAdminClient();

    const [ordersRes, usersRes, profilesRes] = await Promise.all([
      supabase.from("orders").select("*").order("created_at", { ascending: false }),
      supabase.auth.admin.listUsers(),
      supabase.from("profiles").select("id,name,address,created_at"),
    ]);

    if (ordersRes.error) throw new Error(ordersRes.error.message);
    if (usersRes.error) throw new Error(usersRes.error.message);
    if (profilesRes.error) throw new Error(profilesRes.error.message);

    const customers = profilesRes.data.map((profile) => {
      const user = usersRes.data.users.find((u) => u.id === profile.id);
      return {
        id: profile.id,
        name: profile.name,
        email: user?.email ?? "",
        address: profile.address,
        createdAt: profile.created_at,
      };
    });

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
    const supabase = createSupabaseAdminClient();

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
        const { error } = await supabase.auth.admin.deleteUser(body.id ?? "");
        if (error) throw new Error(error.message);
        // profiles + orders cascade / null out via foreign keys
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