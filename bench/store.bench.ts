import { bench, describe } from "vitest";

// lib/store consults the Supabase env vars on every call. With them unset the
// catalog layer takes its deterministic browser-demo path (localStorage), which
// is exactly what we can measure in CI without a database.
delete process.env.NEXT_PUBLIC_SUPABASE_URL;
delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const {
  DEFAULT_PRODUCTS,
  PRODUCTS_STORAGE_KEY,
  detectCurrency,
  formatPrice,
  inferProductNameFromImage,
  loadCatalog,
  loadLocalProducts,
  mapProductRow,
  newProductId,
  parseProduct,
  productToRow,
  saveCatalog,
} = await import("@/lib/store");

import { IMAGE_FILE_NAMES, installBrowserStorage, makeProducts } from "./fixtures";

const catalogue = makeProducts(500);
const serializedCatalogue = JSON.stringify(catalogue);
// What a Supabase read actually hands back: snake_case rows.
const catalogueRows = catalogue.map((product) => productToRow(product));
const serializedRows = JSON.stringify(catalogueRows);

describe("catalogue wire validation", () => {
  bench("parseProduct - 500 wire rows", () => {
    const rows = JSON.parse(serializedCatalogue) as unknown[];
    let n = 0;
    for (const row of rows) {
      const p = parseProduct(row);
      if (p) n++;
    }
    // keep parseProduct's internal branches exercised (null-return path, id
    // regeneration, invalid amounts) without letting dead weight dominate.
    void n;
  });

  bench("parseProduct - 500 Supabase rows round-trip", () => {
    const rows = JSON.parse(serializedRows) as unknown[];
    for (const row of rows) {
      const product = mapProductRow(row as ReturnType<typeof productToRow>);
      if (product) productToRow(product);
    }
  });
});

describe("catalogue loading (browser demo path)", () => {
  bench("loadLocalProducts - 500 products from storage", () => {
    installBrowserStorage({ [PRODUCTS_STORAGE_KEY]: serializedCatalogue });
    loadLocalProducts();
  });

  bench("loadLocalProducts - empty storage falls back to defaults", () => {
    installBrowserStorage();
    loadLocalProducts();
  });

  bench("loadCatalog - 500 products, Supabase unconfigured", async () => {
    installBrowserStorage({ [PRODUCTS_STORAGE_KEY]: serializedCatalogue });
    await loadCatalog();
  });

  bench("loadCatalog - empty storage falls back to built-in defaults", async () => {
    installBrowserStorage();
    const result = await loadCatalog();
    if (result.products.length === 0) throw new Error("expected the built-in fallback");
  });
});

describe("catalogue saving (browser demo path)", () => {
  bench("saveCatalog - upsert the whole 500 product catalogue", async () => {
    installBrowserStorage({});
    const result = await saveCatalog(catalogue);
    if (!result.ok) throw new Error("save failed");
  });

  bench("saveCatalog - 10 product price revision", async () => {
    installBrowserStorage({ [PRODUCTS_STORAGE_KEY]: serializedCatalogue });
    const revisions = catalogue.slice(0, 10).map((product) => ({
      ...product,
      price: product.price + 100,
    }));
    const result = await saveCatalog(revisions);
    if (!result.ok) throw new Error("save failed");
  });
});

describe("price formatting", () => {
  const prices = DEFAULT_PRODUCTS.map((product) => product.price);

  bench("formatPrice - KES fast path (100 prices)", () => {
    for (let i = 0; i < 100; i++) {
      formatPrice(prices[i % prices.length], "en-KE", "KES");
    }
  });

  bench("formatPrice - Intl.NumberFormat path (100 prices)", () => {
    for (let i = 0; i < 100; i++) {
      formatPrice(prices[i % prices.length], "en-US", "USD");
    }
  });

  bench("formatPrice - whole 500 product catalogue in USD", () => {
    for (const product of catalogue) {
      formatPrice(product.price, "en-US", "USD");
    }
  });
});

describe("product name inference", () => {
  bench("inferProductNameFromImage - mixed upload file names", () => {
    for (const fileName of IMAGE_FILE_NAMES) {
      inferProductNameFromImage(fileName);
    }
  });

  bench("inferProductNameFromImage - long file name", () => {
    inferProductNameFromImage(
      `${"clarks_desert-boot--heritage_edition_".repeat(20)}limitedRelease.JPEG`,
    );
  });
});

describe("currency detection", () => {
  bench("detectCurrency", () => {
    detectCurrency();
  });
});
