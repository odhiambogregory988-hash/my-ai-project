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
  loadProducts,
  Product,
  PRODUCTS_STORAGE_KEY,
} from "@/lib/store";

interface StoreContextValue {
  products: Product[];
  cart: CartItem[];
  currency: string;
  locale: string;
  cartCount: number;
  addToCart: (product: Product) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  saveProducts: (products: Product[]) => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(DEFAULT_PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [{ locale, currency }, setMoney] = useState({ locale: "en-US", currency: "USD" });
  const hasLoadedCart = useRef(false);

  useEffect(() => {
    setProducts(loadProducts());
    setMoney(detectCurrency());
    try {
      const savedCart = window.localStorage.getItem("orwas-cart");
      if (savedCart) setCart(JSON.parse(savedCart));
    } catch {
      setCart([]);
    } finally {
      hasLoadedCart.current = true;
    }
  }, []);

  useEffect(() => {
    if (!hasLoadedCart.current) return;
    try {
      window.localStorage.setItem("orwas-cart", JSON.stringify(cart));
    } catch {
      // ignore storage quota errors
    }
  }, [cart]);

  const addToCart = useCallback((product: Product) => {
    setCart((current) => {
      const existing = current.find((item) => item.id === product.id);
      if (existing) {
        return current.map((item) =>
          item.id === product.id
            ? { ...item, quantity: Math.min(item.quantity + 1, product.inventory) }
            : item,
        );
      }
      return product.inventory > 0 ? [...current, { ...product, quantity: 1 }] : current;
    });
  }, []);

  const removeFromCart = useCallback((id: string) => {
    setCart((current) => current.filter((item) => item.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    setCart((current) => {
      if (quantity <= 0) return current.filter((item) => item.id !== id);
      return current.map((item) =>
        item.id === id ? { ...item, quantity: Math.min(quantity, item.inventory) } : item,
      );
    });
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const saveProducts = useCallback((nextProducts: Product[]) => {
    setProducts(nextProducts);
    try {
      window.localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(nextProducts));
    } catch {
      // ignore
    }
  }, []);

  const cartCount = useMemo(() => cart.reduce((total, item) => total + item.quantity, 0), [cart]);

  const value = useMemo<StoreContextValue>(
    () => ({
      products,
      cart,
      currency,
      locale,
      cartCount,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      saveProducts,
    }),
    [
      products,
      cart,
      currency,
      locale,
      cartCount,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      saveProducts,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const store = useContext(StoreContext);
  if (!store) throw new Error("useStore must be used inside StoreProvider");
  return store;
}
