"use client";

import { createContext, useContext, useEffect, useState } from "react";
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

  useEffect(() => {
    setProducts(loadProducts());
    setMoney(detectCurrency());
    try {
      const savedCart = window.localStorage.getItem("orwas-cart");
      if (savedCart) setCart(JSON.parse(savedCart));
    } catch {
      setCart([]);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("orwas-cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product: Product) => {
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
  };

  const updateQuantity = (id: string, quantity: number) => {
    const product = products.find((item) => item.id === id);
    if (!product) return;
    if (quantity <= 0) return removeFromCart(id);
    setCart((current) =>
      current.map((item) =>
        item.id === id ? { ...item, quantity: Math.min(quantity, product.inventory) } : item,
      ),
    );
  };

  const removeFromCart = (id: string) => setCart((current) => current.filter((item) => item.id !== id));

  const clearCart = () => setCart([]);

  const saveProducts = (nextProducts: Product[]) => {
    setProducts(nextProducts);
    window.localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(nextProducts));
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        cart,
        currency,
        locale,
        cartCount: cart.reduce((total, item) => total + item.quantity, 0),
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        saveProducts,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const store = useContext(StoreContext);
  if (!store) throw new Error("useStore must be used inside StoreProvider");
  return store;
}