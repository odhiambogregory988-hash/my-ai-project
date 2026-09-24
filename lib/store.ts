// Product catalog + money helpers.
//
// The catalog lives in Supabase (`public.products`, see supabase/products.sql)
// so admin edits are store-wide. Reads go through the browser client with RLS,
// writes through /api/admin/products (service role). When Supabase isn't
// reachable the browser demo layer below keeps the store working: localStorage
// first, then DEFAULT_PRODUCTS.

import { createSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase";

export type ProductCategory = "Clothing" | "Footwear" | "Accessories" | "Other";

export interface Product {
  id: string;
  name: string;
  price: number;
  collection: string;
  description?: string;
  inventory: number;
  image?: string;
  category: ProductCategory;
}

export const PRODUCT_CATEGORIES: ProductCategory[] = ["Clothing", "Footwear", "Accessories", "Other"];

export async function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Failed to read image file"));
    reader.readAsDataURL(file);
  });
}

/**
 * Downscale + re-encode an uploaded image before it becomes a catalog row.
 *
 * Product photos are stored in their row, so a 6 MB phone shot would bloat the
 * database and slow the storefront down. Falls back to the untouched file
 * whenever the browser can't decode it.
 */
export async function fileToOptimizedDataUrl(
  file: File,
  maxDimension = 1400,
  quality = 0.82,
) {
  const original = await fileToDataUrl(file);
  if (typeof document === "undefined" || !file.type.startsWith("image/") || file.type === "image/svg+xml") {
    return original;
  }

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext("2d");
    if (!context) {
      bitmap.close?.();
      return original;
    }
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close?.();

    // Keep PNG (it may carry transparency); everything else becomes JPEG.
    const type = file.type === "image/png" ? "image/png" : "image/jpeg";
    const optimized = canvas.toDataURL(type, quality);
    return optimized.length < original.length ? optimized : original;
  } catch {
    return original;
  }
}

export function inferProductNameFromImage(fileName: string) {
  const stem = fileName.replace(/\.[^/.]+$/, "");

  return stem
    .replace(/[_-]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[^a-zA-Z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ") || "New product";
}

export interface CartItem extends Product {
  quantity: number;
}

export const FREE_SHIPPING_THRESHOLD = 10500;
export const DELIVERY_FEE = 125;

export const DEFAULT_PRODUCTS: Product[] = [
  { id: "1", name: "Clarks Desert Boot", price: 8500, collection: "Heritage", inventory: 15, category: "Footwear", image: "/collections/clark.jpeg", description: "British heritage footwear — iconic since 1950" },
  { id: "2", name: "Nairobi Street Style", price: 3500, collection: "Street", inventory: 8, category: "Clothing", image: "/collections/wakadinali.jpeg", description: "Urban culture meets contemporary fashion" },
  { id: "3", name: "Clarks Wallabee", price: 7200, collection: "Heritage", inventory: 3, category: "Footwear", image: "/collections/clark-2.jpeg", description: "Timeless suede silhouette — street culture staple" },
  { id: "4", name: "Urban Essentials", price: 2800, collection: "Street", inventory: 22, category: "Clothing", image: "/collections/collection-1.jpeg", description: "Everyday pieces for the modern wardrobe" },
  { id: "5", name: "Heritage Edit", price: 4500, collection: "Heritage", inventory: 2, category: "Clothing", image: "/collections/collection-2.jpeg", description: "Classic styles reimagined for today" },
  { id: "6", name: "Archive Collection", price: 5500, collection: "Archive", inventory: 6, category: "Accessories", image: "/collections/collection-4.jpeg", description: "Rare finds and vintage pieces" },
];

/** Legacy key — still read so pre-Supabase edits can be imported from a browser. */
export const PRODUCTS_STORAGE_KEY = "orwas-products";

/* ============================================================
   Validation — every product crossing the wire (or coming out
   of localStorage) is rebuilt from these fields, never trusted.
   ============================================================ */

export const CATALOG_TABLE = "products";
/** Product ids are the public URL segment: /products/<id>. */
export const PRODUCT_ID_RE = /^[A-Za-z0-9_-]{1,64}$/;

const MAX_IMAGE_LENGTH = 8_000_000;

function text(value: unknown, maxLength: number) {
  if (typeof value !== "string") return "";
  return value.length > maxLength ? "" : value;
}

function amount(value: unknown, max = 10_000_000) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return Math.min(Math.round(parsed), max);
}

export function newProductId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `p-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Returns a clean Product, or null when the row is unusable (e.g. no name). */
export function parseProduct(input: unknown): Product | null {
  if (!input || typeof input !== "object") return null;
  const raw = input as Record<string, unknown>;
  const name = text(raw.name, 160).trim();
  if (!name) return null;

  const id = text(raw.id, 64);
  return {
    id: PRODUCT_ID_RE.test(id) ? id : newProductId(),
    name,
    price: amount(raw.price),
    collection: text(raw.collection, 80).trim(),
    description: text(raw.description, 2000),
    inventory: amount(raw.inventory),
    image: text(raw.image, MAX_IMAGE_LENGTH),
    category: PRODUCT_CATEGORIES.find((candidate) => candidate === raw.category) ?? "Clothing",
  };
}

/* ============================================================
   Supabase row mapping (snake_case ⇄ app types)
   ============================================================ */

export interface ProductRow {
  id: string;
  name: string;
  price: number;
  collection: string;
  description: string;
  image: string;
  category: string;
  inventory: number;
  created_at?: string;
  updated_at?: string;
}

export function mapProductRow(row: ProductRow): Product | null {
  return parseProduct({
    id: row.id,
    name: row.name,
    price: row.price,
    collection: row.collection,
    description: row.description,
    image: row.image,
    category: row.category,
    inventory: row.inventory,
  });
}

export function productToRow(product: Product): Omit<ProductRow, "created_at"> {
  return {
    id: product.id,
    name: product.name,
    price: product.price,
    collection: product.collection,
    description: product.description ?? "",
    image: product.image ?? "",
    category: product.category,
    inventory: product.inventory,
    updated_at: new Date().toISOString(),
  };
}

/* ============================================================
   Browser demo storage (offline / pre-Supabase fallback)
   ============================================================ */

export function loadLocalProducts(): Product[] {
  if (typeof window === "undefined") return DEFAULT_PRODUCTS;
  try {
    const saved = window.localStorage.getItem(PRODUCTS_STORAGE_KEY);
    if (!saved) return DEFAULT_PRODUCTS;
    const parsed = JSON.parse(saved) as unknown[];
    if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_PRODUCTS;
    const products = parsed.map(parseProduct).filter((product): product is Product => product !== null);
    return products.length ? products : DEFAULT_PRODUCTS;
  } catch {
    return DEFAULT_PRODUCTS;
  }
}

export function saveLocalProducts(products: Product[]) {
  try {
    window.localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
  } catch {
    // ignore storage quota errors
  }
}

/** True when this browser still holds a pre-Supabase catalog worth importing. */
export function hasLocalProducts(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return Boolean(window.localStorage.getItem(PRODUCTS_STORAGE_KEY));
  } catch {
    return false;
  }
}

/* ============================================================
   Catalog read / write
   ============================================================ */

export interface CatalogResult {
  products: Product[];
  /** True when the list came from Supabase rather than this browser. */
  configured: boolean;
}

export interface CatalogWriteResult {
  ok: boolean;
  configured: boolean;
  message?: string;
}

/** The storefront catalog: Supabase when configured, browser demo otherwise. */
export async function loadCatalog(): Promise<CatalogResult> {
  const local = () => ({ products: loadLocalProducts(), configured: false });
  if (!isSupabaseConfigured()) return local();

  try {
    const supabase = createSupabaseBrowserClient();
    // Oldest first keeps the curated order stable (the seed sets created_at
    // deliberately); products added later append to the end.
    const { data, error } = await supabase
      .from(CATALOG_TABLE)
      .select("*")
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);

    const products = (data ?? [])
      .map((row) => mapProductRow(row as unknown as ProductRow))
      .filter((product): product is Product => product !== null);

    // An empty table means the catalog was deliberately emptied — don't
    // resurrect the demo products on top of it.
    return { products, configured: true };
  } catch {
    // Table not created yet, or offline — the shop still renders.
    return local();
  }
}

async function writeCatalog(body: Record<string, unknown>): Promise<CatalogWriteResult> {
  if (isSupabaseConfigured()) {
    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.status === 401) {
        return { ok: false, configured: false, message: "Your admin session expired — sign in again." };
      }
      const data = await res.json();
      if (data.ok) return { ok: true, configured: true };
      if (data.configured) {
        return { ok: false, configured: true, message: data.error ?? "Could not save the catalog." };
      }
      const detail = typeof data.error === "string" ? data.error : "";
      return {
        ok: true,
        configured: false,
        message: `Saved in this browser only. Customers won't see it until Supabase is set up${detail ? `: ${detail}` : " (add SUPABASE_SERVICE_ROLE_KEY and run supabase/products.sql)."}`,
      };
    } catch {
      // fall through to the browser demo store
    }
  }

  if (Array.isArray(body.products) && body.products.length) {
    const upserts = body.products
      .map(parseProduct)
      .filter((product): product is Product => product !== null);
    const merged = loadLocalProducts();
    for (const product of upserts) {
      const index = merged.findIndex((candidate) => candidate.id === product.id);
      if (index >= 0) merged[index] = product;
      else merged.push(product);
    }
    saveLocalProducts(merged);
  }
  if (Array.isArray(body.deleteIds) && body.deleteIds.length) {
    const remove = body.deleteIds.filter((id): id is string => typeof id === "string");
    saveLocalProducts(loadLocalProducts().filter((product) => !remove.includes(product.id)));
  }
  return {
    ok: true,
    configured: false,
    message: isSupabaseConfigured()
      ? "Saved in this browser only. Customers won't see it until Supabase is set up (add SUPABASE_SERVICE_ROLE_KEY and run supabase/products.sql)."
      : undefined,
  };
}

/** Upsert products (and optionally delete some) in one round trip. */
export function saveCatalog(
  products: Product[],
  deleteIds: string[] = [],
): Promise<CatalogWriteResult> {
  return writeCatalog({ action: "sync", products, deleteIds });
}

export function formatPrice(amount: number, locale: string, currency: string) {
  // For KES, use custom formatting to show "KSh" prefix
  if (currency === "KES") {
    return `KSh ${amount.toLocaleString()}`;
  }

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function detectCurrency() {
  const locale = typeof navigator === "undefined" ? "en-US" : navigator.language;
  const region = locale.split("-")[1]?.toUpperCase();
  const currencyByRegion: Record<string, string> = {
    KE: "KES",
    GB: "GBP",
    CA: "CAD",
    AU: "AUD",
    NZ: "NZD",
    JP: "JPY",
    CN: "CNY",
    IN: "INR",
    BR: "BRL",
    MX: "MXN",
    CH: "CHF",
    NO: "NOK",
    SE: "SEK",
    DK: "DKK",
    PL: "PLN",
    ZA: "ZAR",
  };

  return { locale, currency: currencyByRegion[region ?? ""] ?? "KES" };
}
