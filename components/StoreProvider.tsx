"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  CartItem,
  DEFAULT_PRODUCTS,
  detectCurrency,
  loadCatalog,
  Product,
} from "@/lib/store";

/** "demo" = the catalog came from this browser, not Supabase. */
export type CatalogMode = "loading" | "supabase" | "demo";

interface StoreContextValue {
  products: Product[];
  catalogMode: CatalogMode;
  /** Re-read the catalog from Supabase (admin writes call this afterwards). */
  refreshProducts: () => Promise<void>;
  cart: CartItem[];
  currency: string;
  locale: string;
  cartCount: number;
  /** True once the persisted cart has been read from localStorage. */
  cartReady: boolean;
  /** Last add-to-cart, for the "Added to bag" toast. Null = hidden. */
  toast: { name: string; image?: string } | null;
  /** Undo the last add-to-cart (restores the previous cart). */
  undoLastAdd: () => void;
  addToCart: (product: Product) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

/**
 * Merge cart lines that refer to the same product under different ids
 * (legacy home-grid ids like "clark-desert-boot" vs catalog ids like "1").
 * Prefers the catalog id when one of the lines has a purely numeric id.
 */
function mergeDuplicateLines(items: CartItem[]): CartItem[] {
  const byName = new Map<string, CartItem>();
  for (const item of items) {
    const key = (item.name ?? "").trim().toLowerCase();
    if (!key) continue;
    const existing = byName.get(key);
    if (!existing) {
      byName.set(key, { ...item });
      continue;
    }
    const numeric = /^\d+$/.test(item.id) ? item : /^\d+$/.test(existing.id) ? existing : null;
    const keep = numeric ?? existing;
    const other = keep === item ? existing : item;
    byName.set(key, {
      ...keep,
      quantity: Math.min(
        Math.max(existing.quantity, 1) + Math.max(other.quantity, 1),
        Math.max(keep.inventory, 1),
      ),
      image: keep.image || other.image,
      description: keep.description || other.description,
    });
  }
  return Array.from(byName.values());
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(DEFAULT_PRODUCTS);
  const [catalogMode, setCatalogMode] = useState<CatalogMode>("loading");
  const [cart, setCart] = useState<CartItem[]>([]);
  // False until the saved cart has been read from localStorage — lets pages
  // distinguish "cart genuinely empty" from "not hydrated yet" (used by /checkout).
  const [cartReady, setCartReady] = useState(false);
  const [{ locale, currency }, setMoney] = useState({ locale: "en-US", currency: "USD" });
  const hasLoadedCart = useRef(false);
  const [toast, setToast] = useState<{ name: string; image?: string } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Cart snapshot taken just before the last add-to-cart — what "Undo" restores.
  const preAddCart = useRef<CartItem[] | null>(null);
  // Mirrors `cart` so callbacks (addToCart etc.) can read the latest value
  // without being re-created on every cart change.
  const cartRef = useRef<CartItem[]>([]);
  cartRef.current = cart;

  const showToast = useCallback((item: { name: string; image?: string }) => {
    setToast(item);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 5000);
  }, []);

  /** Persist after every cart mutation. Deliberately NOT an effect on `cart`:
      in dev StrictMode that effect runs on the mount pass with the empty
      initial cart and can wipe the saved cart before the load effect's
      setState flushes — the "cart vanished on refresh" bug. */
  const persistCart = useCallback((items: CartItem[]) => {
    if (!hasLoadedCart.current) return;
    try {
      window.localStorage.setItem("orwas-cart", JSON.stringify(items));
    } catch {
      // ignore storage quota errors
    }
  }, []);

  const undoLastAdd = useCallback(() => {
    const snapshot = preAddCart.current;
    if (!snapshot) return;
    preAddCart.current = null;
    setToast(null);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setCart(snapshot);
    persistCart(snapshot);
  }, [persistCart]);

  /** Read the catalog — Supabase when configured, this browser otherwise. */
  const refreshProducts = useCallback(async () => {
    const { products: catalog, configured } = await loadCatalog();
    setProducts(catalog);
    setCatalogMode(configured ? "supabase" : "demo");
  }, []);

  useEffect(() => {
    refreshProducts().catch(() => {
      setProducts(DEFAULT_PRODUCTS);
      setCatalogMode("demo");
    });
    setMoney(detectCurrency());
    try {
      const savedCart = window.localStorage.getItem("orwas-cart");
      if (savedCart) {
        const parsed = JSON.parse(savedCart) as CartItem[];
        if (Array.isArray(parsed)) {
          setCart(mergeDuplicateLines(parsed));
        }
      }
    } catch {
      setCart([]);
    } finally {
      hasLoadedCart.current = true;
      setCartReady(true);
    }
  }, [refreshProducts]);

  // Note: persistence happens inside each mutator via persistCart — there is
  // intentionally no write-effect on `cart` (see persistCart comment).

  const addToCart = useCallback((product: Product) => {
    if (product.inventory <= 0) return;
    const snapshot = cartRef.current.map((item) => ({ ...item }));
    setCart((current) => {
      // Match on id first, then on name — protects against the same product
      // arriving with different ids from different surfaces (grid vs catalog).
      const key = (item: CartItem) => item.id === product.id || item.name.trim().toLowerCase() === product.name.trim().toLowerCase();
      const existing = current.find(key);
      let next: CartItem[];
      if (existing) {
        // Nothing changed (e.g. already at inventory cap) — don't toast/undo.
        if (existing.quantity >= Math.max(existing.inventory, 1)) return current;
        next = current.map((item) =>
          key(item)
            ? { ...item, id: /^\d+$/.test(product.id) ? product.id : item.id, quantity: Math.min(item.quantity + 1, Math.max(product.inventory, item.inventory)) }
            : item,
        );
      } else {
        next = [...current, { ...product, quantity: 1 }];
      }
      preAddCart.current = snapshot;
      persistCart(next);
      return next;
    });
    showToast({ name: product.name, image: product.image });
  }, [persistCart, showToast]);

  const removeFromCart = useCallback((id: string) => {
    preAddCart.current = null; // a manual removal invalidates the undo
    setCart((current) => {
      const next = current.filter((item) => item.id !== id);
      persistCart(next);
      return next;
    });
  }, [persistCart]);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    preAddCart.current = null; // a manual change invalidates the undo
    setCart((current) => {
      if (quantity <= 0) {
        const next = current.filter((item) => item.id !== id);
        persistCart(next);
        return next;
      }
      const next = current.map((item) =>
        item.id === id ? { ...item, quantity: Math.min(quantity, item.inventory) } : item,
      );
      persistCart(next);
      return next;
    });
  }, [persistCart]);

  const clearCart = useCallback(() => {
    preAddCart.current = null;
    setCart(() => {
      persistCart([]);
      return [];
    });
  }, [persistCart]);

  const cartCount = useMemo(() => cart.reduce((total, item) => total + item.quantity, 0), [cart]);

  const value = useMemo<StoreContextValue>(
    () => ({
      products,
      catalogMode,
      refreshProducts,
      cart,
      currency,
      locale,
      cartCount,
      cartReady,
      toast,
      undoLastAdd,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
    }),
    [
      products,
      catalogMode,
      refreshProducts,
      cart,
      currency,
      locale,
      cartCount,
      cartReady,
      toast,
      undoLastAdd,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const store = useContext(StoreContext);
  if (!store) throw new Error("useStore must be used inside StoreProvider");
  return store;
}
