import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, resolveDataClient } from "@/lib/admin-server";
import {
  CATALOG_TABLE,
  parseProduct,
  productToRow,
  Product,
} from "@/lib/store";

/** Guard rail so a runaway client can't push an unbounded payload. */
const MAX_PRODUCTS_PER_SYNC = 200;

/**
 * Admin catalog writes.
 *
 * Reads are public (the `products are public` select policy), so this route
 * only handles changes: upserting edited/added rows and deleting removed ones,
 * both with the service-role client when available.
 */
export async function POST(request: NextRequest) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  let body: { action?: string; products?: unknown; deleteIds?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  if (body.action !== "sync") {
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }

  const rawProducts = Array.isArray(body.products) ? body.products : [];
  const rawDeleteIds = Array.isArray(body.deleteIds) ? body.deleteIds : [];
  if (rawProducts.length > MAX_PRODUCTS_PER_SYNC) {
    return NextResponse.json({ error: "Too many products in one request." }, { status: 400 });
  }

  // Never trust the client's shape: rebuild every row, drop the unusable ones.
  const products: Product[] = [];
  for (const raw of rawProducts) {
    const product = parseProduct(raw);
    if (!product) {
      return NextResponse.json({ error: "Every product needs a name." }, { status: 400 });
    }
    if (products.some((existing) => existing.id === product.id)) {
      // Two rows claiming the same id would silently collapse into one.
      return NextResponse.json({ error: "Two products shared an id." }, { status: 400 });
    }
    products.push(product);
  }

  const deleteIds = rawDeleteIds.filter(
    (id): id is string => typeof id === "string" && id.length > 0 && id.length <= 64,
  );

  if (!products.length && !deleteIds.length) {
    return NextResponse.json({ error: "Nothing to save." }, { status: 400 });
  }

  try {
    const client = await resolveDataClient(request);
    if (!client) {
      return NextResponse.json({
        configured: false,
        error: "Sign in with Google to manage the catalog.",
      });
    }
    const { supabase } = client;

    if (products.length) {
      const { error } = await supabase.from(CATALOG_TABLE).upsert(products.map(productToRow));
      if (error) throw new Error(error.message);
    }

    if (deleteIds.length) {
      const { error } = await supabase.from(CATALOG_TABLE).delete().in("id", deleteIds);
      if (error) throw new Error(error.message);
    }

    return NextResponse.json({ ok: true, saved: products.length, deleted: deleteIds.length });
  } catch (error) {
    return NextResponse.json({
      configured: false,
      error: error instanceof Error ? error.message : "Supabase not configured",
    });
  }
}
