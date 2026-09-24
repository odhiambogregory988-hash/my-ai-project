// Seasonal brand collection.
//
// The storefront "Brand Collections" grid is driven by whichever season the
// admin has published. Older seasons stay in the archive so the shop can roll
// back to a previous edit. Persistence mirrors lib/accounts.ts: Supabase (via
// the admin API when the service role key is present, read-through with RLS for
// customers) when configured, browser-local demo storage otherwise.

import { createSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase";
import { Product, ProductCategory, PRODUCT_CATEGORIES } from "@/lib/store";

export type SeasonBadge =
  | "New Arrival"
  | "Best Seller"
  | "Limited"
  | "Popular"
  | "Almost Gone"
  | "Exclusive"
  | "Sold Out";

export const SEASON_BADGES: SeasonBadge[] = [
  "New Arrival",
  "Best Seller",
  "Limited",
  "Popular",
  "Almost Gone",
  "Exclusive",
  "Sold Out",
];

export type DeliveryWindow = "24hr" | "48hr";

export const DELIVERY_WINDOWS: DeliveryWindow[] = ["24hr", "48hr"];

export interface SeasonItem {
  id: string;
  /** Catalog product (lib/store.ts Product.id) this card represents, when there is one. */
  productId?: string;
  name: string;
  description: string;
  price: number;
  /** Struck-through "was" price, for seasonal markdowns. Null = no discount shown. */
  originalPrice: number | null;
  badge: SeasonBadge | null;
  delivery: DeliveryWindow | null;
  image: string;
  collection: string;
  category: ProductCategory;
  /** Stock fallback for pieces that are not linked to a catalog product. */
  inventory: number;
}

export interface Season {
  id: string;
  /** Shown on the storefront, e.g. "Spring 2026". */
  name: string;
  /** One-line campaign note under the heading. */
  headline: string;
  /** Optional campaign banner. Empty = the grid stands alone. */
  heroImage: string;
  items: SeasonItem[];
  published: boolean;
  updatedAt: string;
}

/** Stable id for the built-in season, so editing it updates one row rather than forking. */
export const DEFAULT_SEASON_ID = "0f1e2d3c-4b5a-4c6d-8e7f-901122334455";

export const DEFAULT_SEASON: Season = {
  id: DEFAULT_SEASON_ID,
  name: "Heritage Season",
  headline:
    "Clarks icons, Nairobi street staples, and archive finds — the pieces in rotation right now.",
  heroImage: "",
  published: true,
  updatedAt: "2026-01-01T00:00:00.000Z",
  items: [
    {
      id: "1",
      productId: "1",
      name: "Clarks Desert Boot",
      description: "British heritage footwear — iconic since 1950",
      price: 8500,
      originalPrice: 12000,
      badge: "Best Seller",
      delivery: "24hr",
      image: "/collections/clark.jpeg",
      collection: "Heritage",
      category: "Footwear",
      inventory: 15,
    },
    {
      id: "2",
      productId: "2",
      name: "Nairobi Street Style",
      description: "Urban culture meets contemporary fashion",
      price: 3500,
      originalPrice: 5000,
      badge: "New Arrival",
      delivery: "24hr",
      image: "/collections/wakadinali.jpeg",
      collection: "Street",
      category: "Clothing",
      inventory: 8,
    },
    {
      id: "3",
      productId: "3",
      name: "Clarks Wallabee",
      description: "Timeless suede silhouette — street culture staple",
      price: 7200,
      originalPrice: null,
      badge: "Limited",
      delivery: "48hr",
      image: "/collections/clark-2.jpeg",
      collection: "Heritage",
      category: "Footwear",
      inventory: 3,
    },
    {
      id: "4",
      productId: "4",
      name: "Urban Essentials",
      description: "Everyday pieces for the modern wardrobe",
      price: 2800,
      originalPrice: 3500,
      badge: "Popular",
      delivery: "24hr",
      image: "/collections/collection-1.jpeg",
      collection: "Essentials",
      category: "Clothing",
      inventory: 22,
    },
    {
      id: "5",
      productId: "5",
      name: "Heritage Edit",
      description: "Classic styles reimagined for today",
      price: 4500,
      originalPrice: null,
      badge: "Almost Gone",
      delivery: "48hr",
      image: "/collections/collection-2.jpeg",
      collection: "Heritage",
      category: "Clothing",
      inventory: 2,
    },
    {
      id: "6b",
      name: "Street Culture",
      description: "Nairobi-inspired contemporary wear",
      price: 3200,
      originalPrice: 4000,
      badge: "Sold Out",
      delivery: null,
      image: "/collections/collection-3.jpeg",
      collection: "Street",
      category: "Clothing",
      inventory: 0,
    },
    {
      id: "6",
      productId: "6",
      name: "Archive Collection",
      description: "Rare finds and vintage pieces",
      price: 5500,
      originalPrice: null,
      badge: "Exclusive",
      delivery: "48hr",
      image: "/collections/collection-4.jpeg",
      collection: "Archive",
      category: "Accessories",
      inventory: 6,
    },
  ],
};

export const SEASONS_STORAGE_KEY = "orwas-seasons";

/* ============================================================
   Validation — everything crossing the wire (or localStorage)
   goes through these before we trust it.
   ============================================================ */

function text(value: unknown, maxLength: number) {
  if (typeof value !== "string") return "";
  return value.length > maxLength ? "" : value;
}

function count(value: unknown, max = 10_000_000) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return Math.min(Math.round(parsed), max);
}

export function newId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `s-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function parseSeasonItem(input: unknown): SeasonItem | null {
  if (!input || typeof input !== "object") return null;
  const raw = input as Record<string, unknown>;
  const name = text(raw.name, 160).trim();
  if (!name) return null;

  const badge = SEASON_BADGES.find((candidate) => candidate === raw.badge) ?? null;
  const delivery = DELIVERY_WINDOWS.find((candidate) => candidate === raw.delivery) ?? null;
  const category =
    PRODUCT_CATEGORIES.find((candidate) => candidate === raw.category) ?? "Clothing";
  const originalPrice = raw.originalPrice === null || raw.originalPrice === undefined
    ? null
    : count(raw.originalPrice);

  return {
    id: text(raw.id, 80) || newId(),
    productId: text(raw.productId, 80) || undefined,
    name,
    description: text(raw.description, 400),
    price: count(raw.price),
    originalPrice: originalPrice && originalPrice > 0 ? originalPrice : null,
    badge,
    delivery,
    image: text(raw.image, 8_000_000),
    collection: text(raw.collection, 80),
    category,
    inventory: count(raw.inventory),
  };
}

export function parseSeason(input: unknown): Season | null {
  if (!input || typeof input !== "object") return null;
  const raw = input as Record<string, unknown>;
  const name = text(raw.name, 80).trim();
  const items = Array.isArray(raw.items)
    ? raw.items.map(parseSeasonItem).filter((item): item is SeasonItem => item !== null)
    : [];
  if (!name && items.length === 0) return null;

  return {
    id: text(raw.id, 80) || newId(),
    name: name || "Untitled season",
    headline: text(raw.headline, 240),
    heroImage: text(raw.heroImage, 8_000_000),
    items,
    published: raw.published === true,
    updatedAt: text(raw.updatedAt, 40) || new Date().toISOString(),
  };
}

/* ============================================================
   Supabase row mapping (snake_case ⇄ app types)
   ============================================================ */

export interface SeasonRow {
  id: string;
  season: string;
  headline: string;
  hero_image: string;
  items: unknown;
  published: boolean;
  updated_at: string;
}

export function mapSeasonRow(row: SeasonRow): Season | null {
  return parseSeason({
    id: row.id,
    name: row.season,
    headline: row.headline,
    heroImage: row.hero_image,
    items: row.items,
    published: row.published,
    updatedAt: row.updated_at,
  });
}

export function seasonToRow(season: Season): SeasonRow {
  return {
    id: season.id,
    season: season.name,
    headline: season.headline,
    hero_image: season.heroImage,
    items: season.items,
    published: season.published,
    updated_at: new Date().toISOString(),
  };
}

/* ============================================================
   Browser demo storage (used until Supabase is configured)
   ============================================================ */

export function loadLocalSeasons(): Season[] {
  if (typeof window === "undefined") return [DEFAULT_SEASON];
  try {
    const raw = window.localStorage.getItem(SEASONS_STORAGE_KEY);
    if (!raw) return [DEFAULT_SEASON];
    const parsed = JSON.parse(raw) as unknown[];
    if (!Array.isArray(parsed)) return [DEFAULT_SEASON];
    const seasons = parsed.map(parseSeason).filter((season): season is Season => season !== null);
    return seasons.length ? seasons : [DEFAULT_SEASON];
  } catch {
    return [DEFAULT_SEASON];
  }
}

export function saveLocalSeasons(seasons: Season[]) {
  try {
    window.localStorage.setItem(SEASONS_STORAGE_KEY, JSON.stringify(seasons));
  } catch {
    // ignore storage quota errors
  }
}

function upsertLocal(season: Season) {
  const seasons = loadLocalSeasons();
  const exists = seasons.some((candidate) => candidate.id === season.id);
  const next = exists
    ? seasons.map((candidate) => (candidate.id === season.id ? season : candidate))
    : [season, ...seasons];
  // Only one season is live at a time.
  return season.published
    ? next.map((candidate) => (candidate.id === season.id ? candidate : { ...candidate, published: false }))
    : next;
}

/** Whichever season is live, falling back to the built-in one. */
export function publishedSeason(seasons: Season[]): Season {
  return seasons.find((season) => season.published) ?? DEFAULT_SEASON;
}

/* ============================================================
   Storefront read
   ============================================================ */

/** The published season, or the built-in default when nothing is published yet. */
export async function loadPublishedSeason(): Promise<Season> {
  const local = () => publishedSeason(loadLocalSeasons());
  if (!isSupabaseConfigured()) return local();

  try {
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase
      .from("season_collections")
      .select("*")
      .eq("published", true)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(error.message);
    const season = data ? mapSeasonRow(data as unknown as SeasonRow) : null;
    return season ?? local();
  } catch {
    // Table not created yet, or offline — the shop still renders.
    return local();
  }
}

/** A season card as a purchasable product, with stock read live from the catalog. */
export function resolveSeasonItem(item: SeasonItem, products: Product[]): Product {
  const linked = item.productId
    ? products.find((product) => product.id === item.productId)
    : undefined;

  return {
    id: linked?.id ?? item.id,
    name: item.name || linked?.name || "Seasonal piece",
    price: item.price || linked?.price || 0,
    collection: item.collection || linked?.collection || "",
    inventory: linked ? linked.inventory : item.inventory,
    category: item.category,
    description: item.description || linked?.description,
    image: item.image || linked?.image,
  };
}

/* ============================================================
   Admin read / write (via /api/admin/season, with demo fallback)
   ============================================================ */

export interface SeasonStore {
  seasons: Season[];
  /** True when the list came from Supabase rather than this browser. */
  configured: boolean;
  unauthorized?: boolean;
}

export interface SeasonWriteResult {
  ok: boolean;
  configured: boolean;
  message?: string;
}

export async function loadSeasons(): Promise<SeasonStore> {
  try {
    const res = await fetch("/api/admin/season", { cache: "no-store" });
    if (res.status === 401) {
      return { seasons: loadLocalSeasons(), configured: false, unauthorized: true };
    }
    const data = await res.json();
    if (data.configured && Array.isArray(data.seasons)) {
      const seasons = data.seasons
        .map(parseSeason)
        .filter((season: Season | null): season is Season => season !== null);
      if (seasons.length) return { seasons, configured: true };
    }
  } catch {
    // fall through to the browser demo store
  }
  return { seasons: loadLocalSeasons(), configured: false };
}

async function writeSeason(
  action: "save" | "delete",
  payload: { season?: Season; id?: string },
): Promise<SeasonWriteResult> {
  if (isSupabaseConfigured()) {
    try {
      const res = await fetch("/api/admin/season", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...payload }),
      });
      if (res.status === 401) {
        return { ok: false, configured: false, message: "Your admin session expired — sign in again." };
      }
      const data = await res.json();
      if (data.ok) return { ok: true, configured: true };
      if (data.configured) {
        return { ok: false, configured: true, message: data.error ?? "Could not save the season." };
      }
      // Supabase is configured for the app but this session can't reach it
      // (typically a service-role key is missing, or supabase/season.sql has
      // not been run) — keep working locally so the edit is not lost.
      const detail = typeof data.error === "string" ? data.error : "";
      return {
        ok: true,
        configured: false,
        message: `Saved in this browser only. Customers won't see it until Supabase is set up${detail ? `: ${detail}` : " (add SUPABASE_SERVICE_ROLE_KEY and run supabase/season.sql)."}`,
      };
    } catch {
      // fall through to the browser demo store
    }
  }

  const seasons = loadLocalSeasons();
  if (action === "delete") {
    saveLocalSeasons(seasons.filter((season) => season.id !== payload.id));
  } else if (payload.season) {
    saveLocalSeasons(upsertLocal(payload.season));
  }
  return {
    ok: true,
    configured: false,
    message: isSupabaseConfigured()
      ? "Saved in this browser only. Customers won't see it until Supabase is set up (add SUPABASE_SERVICE_ROLE_KEY and run supabase/season.sql)."
      : undefined,
  };
}

export function persistSeason(season: Season): Promise<SeasonWriteResult> {
  return writeSeason("save", { season });
}

export function removeSeason(id: string): Promise<SeasonWriteResult> {
  return writeSeason("delete", { id });
}

export { upsertLocal as upsertLocalSeason };
