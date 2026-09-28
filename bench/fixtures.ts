/**
 * Shared fixtures for the CodSpeed benchmarks.
 *
 * The storefront logic in `lib/` reads and writes `window.localStorage`, so the
 * benchmarks install a small in-memory stand-in before exercising it.
 */

import type { Order, OrderItem, OrderStatus } from "@/lib/accounts";
import type { Product, ProductCategory } from "@/lib/store";

const CATEGORIES: ProductCategory[] = ["Clothing", "Footwear", "Accessories", "Other"];
const COLLECTIONS = ["Heritage", "Street", "Archive", "Essentials"];
const STATUSES: OrderStatus[] = ["Processing", "Shipped", "Delivered", "Cancelled"];

/** Deterministic pseudo-random generator so every run uses the same data. */
function makeRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

export function makeProducts(count: number): Product[] {
  const random = makeRandom(42);
  return Array.from({ length: count }, (_, index) => ({
    id: String(index + 1),
    name: `Product ${index + 1}`,
    price: Math.floor(random() * 20000) + 500,
    collection: COLLECTIONS[index % COLLECTIONS.length],
    description: `Seeded catalogue entry number ${index + 1} used for benchmarking.`,
    inventory: Math.floor(random() * 40),
    image: `/collections/product-${index % 12}.jpeg`,
    category: CATEGORIES[index % CATEGORIES.length],
  }));
}

export function makeOrderItems(count: number): OrderItem[] {
  return Array.from({ length: count }, (_, index) => ({
    id: String(index + 1),
    name: `Product ${index + 1}`,
    price: 1500 + index * 250,
    quantity: (index % 3) + 1,
    image: `/collections/product-${index % 12}.jpeg`,
  }));
}

export function makeOrders(count: number): Order[] {
  const random = makeRandom(7);
  return Array.from({ length: count }, (_, index) => {
    const items = makeOrderItems((index % 4) + 1);
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const deliveryFee = subtotal >= 10000 ? 0 : 500;
    return {
      id: `ORW-${index.toString(36).toUpperCase().padStart(6, "0")}`,
      customerEmail: `customer${index % 200}@example.com`,
      customerName: `Customer ${index % 200}`,
      items,
      subtotal,
      deliveryFee,
      total: subtotal + deliveryFee,
      status: STATUSES[Math.floor(random() * STATUSES.length)],
      createdAt: new Date(Date.UTC(2024, index % 12, (index % 27) + 1)).toISOString(),
    };
  });
}

export const IMAGE_FILE_NAMES = [
  "clarks_desert-boot.JPEG",
  "nairobiStreetStyle.png",
  "archive--collection__4.jpeg",
  "heritage edit (final) v2.webp",
  "WAKADINALI_hoodie-black.jpg",
  "urban.essentials.tee-2024.png",
  "  spaced   out   name  .jpeg",
  "SNEAKER-drop_03__limited.png",
];

export interface MemoryStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  clear(): void;
}

/**
 * Installs a minimal `window.localStorage` on `globalThis` so the browser-only
 * code paths in `lib/` can be measured outside a browser.
 */
export function installBrowserStorage(entries: Record<string, string> = {}): MemoryStorage {
  const store = new Map<string, string>(Object.entries(entries));

  const storage: MemoryStorage = {
    getItem: (key) => (store.has(key) ? (store.get(key) as string) : null),
    setItem: (key, value) => {
      store.set(key, String(value));
    },
    removeItem: (key) => {
      store.delete(key);
    },
    clear: () => {
      store.clear();
    },
  };

  Object.defineProperty(globalThis, "window", {
    value: { localStorage: storage },
    configurable: true,
    writable: true,
  });
  Object.defineProperty(globalThis, "localStorage", {
    value: storage,
    configurable: true,
    writable: true,
  });

  return storage;
}
