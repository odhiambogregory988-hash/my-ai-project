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

export const DEFAULT_PRODUCTS: Product[] = [
  { id: "1", name: "Raw Linen Overshirt", price: 285, collection: "Earthbound", inventory: 12, category: "Clothing" },
  { id: "2", name: "Merino Rib Knit", price: 195, collection: "Quiet Hours", inventory: 8, category: "Clothing" },
  { id: "3", name: "Leather Journal Folio", price: 145, collection: "Provenance", inventory: 18, category: "Accessories" },
  { id: "4", name: "Cashmere Beanie", price: 95, collection: "Earthbound", inventory: 24, category: "Accessories" },
  { id: "5", name: "Riverstone Trail Runner", price: 320, collection: "Provenance", inventory: 6, category: "Footwear" },
  { id: "6", name: "Ceramic Pour-Over Set", price: 110, collection: "Solstice", inventory: 15, category: "Other" },
];

export const PRODUCTS_STORAGE_KEY = "orwas-products";

export function loadProducts(): Product[] {
  if (typeof window === "undefined") return DEFAULT_PRODUCTS;

  try {
    const saved = window.localStorage.getItem(PRODUCTS_STORAGE_KEY);
    if (!saved) return DEFAULT_PRODUCTS;

    const parsed = JSON.parse(saved) as Product[];
    return parsed.map((product) => ({
      ...product,
      category: product.category && PRODUCT_CATEGORIES.includes(product.category) ? product.category : "Clothing",
    }));
  } catch {
    return DEFAULT_PRODUCTS;
  }
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