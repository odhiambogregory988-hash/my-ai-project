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
  { id: "1", name: "Clarks Desert Boot", price: 8500, collection: "Heritage", inventory: 15, category: "Footwear", image: "/collections/clark.jpeg", description: "British heritage footwear — iconic since 1950" },
  { id: "2", name: "Nairobi Street Style", price: 3500, collection: "Street", inventory: 8, category: "Clothing", image: "/collections/wakadinali.jpeg", description: "Urban culture meets contemporary fashion" },
  { id: "3", name: "Clarks Wallabee", price: 7200, collection: "Heritage", inventory: 3, category: "Footwear", image: "/collections/clark-2.jpeg", description: "Timeless suede silhouette — street culture staple" },
  { id: "4", name: "Urban Essentials", price: 2800, collection: "Street", inventory: 22, category: "Clothing", image: "/collections/collection-1.jpeg", description: "Everyday pieces for the modern wardrobe" },
  { id: "5", name: "Heritage Edit", price: 4500, collection: "Heritage", inventory: 2, category: "Clothing", image: "/collections/collection-2.jpeg", description: "Classic styles reimagined for today" },
  { id: "6", name: "Archive Collection", price: 5500, collection: "Archive", inventory: 6, category: "Accessories", image: "/collections/collection-4.jpeg", description: "Rare finds and vintage pieces" },
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