import { bench, describe } from "vitest";

import {
  DEFAULT_PRODUCTS,
  PRODUCTS_STORAGE_KEY,
  detectCurrency,
  formatPrice,
  inferProductNameFromImage,
  loadProducts,
} from "@/lib/store";

import { IMAGE_FILE_NAMES, installBrowserStorage, makeProducts } from "./fixtures";

const catalogue = makeProducts(500);
const serializedCatalogue = JSON.stringify(catalogue);

describe("catalogue loading", () => {
  bench("loadProducts - 500 products from storage", () => {
    installBrowserStorage({ [PRODUCTS_STORAGE_KEY]: serializedCatalogue });
    loadProducts();
  });

  bench("loadProducts - empty storage falls back to defaults", () => {
    installBrowserStorage();
    loadProducts();
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
