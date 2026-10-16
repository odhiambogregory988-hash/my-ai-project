"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatPrice, DELIVERY_FEE, FREE_SHIPPING_THRESHOLD } from "@/lib/store";
import { useStore } from "@/components/StoreProvider";

import { ProductCategory } from "@/lib/store";

const COMPLETE_YOUR_LOOK: Array<{
  id: string;
  name: string;
  price: number;
  collection: string;
  inventory: number;
  category: ProductCategory;
  image: string;
  description: string;
}> = [
  {
    id: "1", // canonical store product id (Clarks Desert Boot)
    name: "Clarks Desert Boot",
    price: 8500,
    collection: "Heritage",
    inventory: 15,
    category: "Footwear",
    image: "/collections/clark.jpeg",
    description: "British heritage footwear — iconic since 1950",
  },
  {
    id: "5", // canonical store product id (Heritage Edit — matches Heritage Belt role)
    name: "Heritage Belt",
    price: 1800,
    collection: "Heritage",
    inventory: 12,
    category: "Accessories",
    image: "/collections/collection-2.jpeg",
    description: "Hand-stitched leather belt — timeless finish",
  },
  {
    id: "3", // canonical store product id (Clarks Wallabee)
    name: "Clarks Wallabee",
    price: 7200,
    collection: "Heritage",
    inventory: 8,
    category: "Footwear",
    image: "/collections/clark-2.jpeg",
    description: "Timeless suede silhouette — street culture staple",
  },
];

const YOU_MAY_ALSO_LIKE = COMPLETE_YOUR_LOOK;

/**
 * Full-page cart — Amazon structure, ORWAS brand.
 *
 * Covers the viewport as a solid, opaque page (no backdrop layer), so the page
 * behind can never show through. Rendered through a portal into document.body:
 * it used to live inside <header>, whose translateZ(0) GPU layer made
 * `position: fixed` resolve against the header box instead of the viewport —
 * the cart appeared as a small strip ("a peek") instead of a full page.
 */
function CartPortal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return createPortal(children, document.body);
}

export default function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { cart, locale, currency, updateQuantity, removeFromCart, addToCart, clearCart } = useStore();
  const [placing, setPlacing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (open) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      window.scrollTo(0, 0);
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [open]);

  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);
  const itemCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);
  const deliveryFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : DELIVERY_FEE;
  const total = subtotal + deliveryFee;
  const remainingForFree = Math.max(FREE_SHIPPING_THRESHOLD - subtotal, 0);
  const progressPct = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);

  const handleCheckout = () => {
    if (cart.length === 0 || placing) return;
    router.push("/checkout");
  };

  if (!open) return null;

  /* ---------------- Empty state — Amazon's "Your Amazon Cart is empty" ---------------- */
  if (cart.length === 0) {
    return (
      <CartPortal>
        <div className="fixed inset-0 z-[70] overflow-y-auto" style={{ backgroundColor: "#FFFFFF" }}>
        <div className="mx-auto w-full max-w-5xl px-6 py-10">
          <div className="flex items-center justify-between pb-6" style={{ borderBottom: "1px solid rgba(17,24,39,0.08)" }}>
            <button
              onClick={onClose}
              aria-label="Back to store"
              className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-orwas-ink/5"
            >
              <svg className="h-4 w-4 text-orwas-ink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="font-display text-lg tracking-[0.08em] text-orwas-ink">ORWAS</span>
            <span className="w-9" />
          </div>

          <div className="mx-auto max-w-md py-16 text-center">
            <div
              className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full"
              style={{ border: "1px solid rgba(17,24,39,0.1)" }}
            >
              <svg className="h-6 w-6 text-orwas-clay" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h1 className="font-display text-2xl text-orwas-ink">Your ORWAS Bag is empty</h1>
            <p className="mt-3 text-sm leading-relaxed text-orwas-clay">
              Your shopping bag lives to serve. Give it purpose — fill it with pieces crafted to endure.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3">
              <Link
                href="/collections"
                onClick={onClose}
                className="rounded-full px-8 py-3 text-[11px] font-medium uppercase tracking-[0.2em] text-orwas-ink transition-opacity hover:opacity-90"
                style={{ backgroundColor: "var(--color-amber)" }}
              >
                Continue shopping
              </Link>
              <button
                onClick={onClose}
                className="px-8 py-2 text-[10px] uppercase tracking-[0.25em] text-orwas-clay transition-colors hover:text-orwas-ink"
              >
                Back to store
              </button>
            </div>
          </div>

          {/* Deals inspiration — Amazon shows deals on the empty cart */}
          <section className="pb-10">
            <h2 className="mb-4 text-sm font-medium text-orwas-ink">Have something in mind? Popular right now</h2>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {YOU_MAY_ALSO_LIKE.map((product) => (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="group overflow-hidden rounded-md bg-white text-left shadow-[0_1px_2px_rgba(17,24,39,0.08)] transition-shadow hover:shadow-[0_4px_14px_rgba(17,24,39,0.12)]"
                  style={{ border: "1px solid rgba(17,24,39,0.06)" }}
                >
                  <div className="relative aspect-square" style={{ backgroundColor: "rgba(17,24,39,0.05)" }}>
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 50vw, 240px"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-3">
                    <p className="text-xs leading-snug text-orwas-ink line-clamp-2" style={{ display: "-webkit-box", WebkitBoxOrient: "vertical", WebkitLineClamp: 2 }}>
                      {product.name}
                    </p>
                    <p className="mt-1 font-display text-sm font-medium" style={{ color: "var(--color-clay)" }}>
                      {formatPrice(product.price, locale, currency)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>
      </CartPortal>
    );
  }

  /* ---------------- Filled cart — Amazon layout ---------------- */
  return (
    <CartPortal>
      <div className="fixed inset-0 z-[70] overflow-y-auto" style={{ backgroundColor: "#FFFFFF" }}>
      {/* ── Top bar — Amazon "Shopping Cart" header ── */}
      <header className="sticky top-0 z-10 bg-white px-5 md:px-8 pt-5 pb-4 shadow-[0_1px_0_rgba(17,24,39,0.08)]">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              aria-label="Back to store"
              className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-orwas-ink/5"
            >
              <svg className="h-4 w-4 text-orwas-ink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="font-display text-xl md:text-2xl text-orwas-ink">Shopping Bag</h1>
          </div>
          <span className="text-xs text-orwas-clay">Price</span>
        </div>
        {/* Free-shipping progress — ORWAS touch under the header */}
        <div className="mx-auto mt-3 w-full max-w-6xl">
          {remainingForFree === 0 ? (
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <p className="text-[11px] font-medium tracking-wide text-emerald-700">Complimentary delivery unlocked</p>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="h-[3px] flex-1 overflow-hidden rounded-full bg-orwas-sand/50">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${progressPct}%`, backgroundColor: "var(--color-amber)" }}
                />
              </div>
              <p className="whitespace-nowrap text-[10px] tracking-wide text-orwas-clay">
                {formatPrice(remainingForFree, locale, currency)} to free delivery
              </p>
            </div>
          )}
        </div>
      </header>

      <div className="mx-auto w-full max-w-6xl px-5 py-6 md:px-8">
        {/* Mobile subtotal bar — Amazon shows it right under the header on small screens */}
        <div className="mb-4 flex items-center justify-between rounded-md bg-white px-4 py-3 md:hidden" style={{ border: "1px solid rgba(17,24,39,0.08)" }}>
          <div>
            <p className="font-display text-lg text-orwas-ink">
              Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"}):{" "}
              <span className="font-medium">{formatPrice(subtotal, locale, currency)}</span>
            </p>
            <p className="text-[11px] text-orwas-clay">
              {deliveryFee === 0 ? "Free delivery" : `Delivery ${formatPrice(deliveryFee, locale, currency)} — free over ${formatPrice(FREE_SHIPPING_THRESHOLD, locale, currency)}`}
            </p>
          </div>
          <button
            onClick={handleCheckout}
            disabled={placing}
            className="shrink-0 rounded-full px-5 py-2.5 text-[11px] font-medium uppercase tracking-[0.15em] text-orwas-ink transition-opacity hover:opacity-90 disabled:opacity-60"
            style={{ backgroundColor: "var(--color-amber)" }}
          >
            {placing ? "Placing…" : "Checkout"}
          </button>
        </div>

        <div className="flex flex-col-reverse gap-8 lg:flex-row">
          {/* ── Left: item rows — Amazon cart lines ── */}
          <section className="flex-1">
            <h2 className="mb-2 text-lg font-medium text-orwas-ink">
              {itemCount} {itemCount === 1 ? "item" : "items"} in your bag
            </h2>
            {cart.map((item, index) => (
              <div
                key={item.id}
                className="flex gap-5 py-5"
                style={{ borderTop: index === 0 ? "none" : "1px solid rgba(17,24,39,0.08)" }}
              >
                {/* Thumbnail */}
                <Link
                  href={`/products/${item.id}`}
                  onClick={onClose}
                  className="relative h-28 w-28 shrink-0 overflow-hidden rounded-sm md:h-36 md:w-36"
                  style={{ backgroundColor: "rgba(17,24,39,0.05)" }}
                >
                  {item.image ? (
                    <Image src={item.image} alt={item.name} fill sizes="144px" className="object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <svg className="h-6 w-6 text-orwas-clay/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </Link>

                {/* Middle: name, stock, controls */}
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <Link
                      href={`/products/${item.id}`}
                      onClick={onClose}
                      className="min-w-0 flex-1 text-sm font-medium leading-snug text-orwas-ink hover:text-orwas-clay md:text-base"
                      style={{ display: "-webkit-box", WebkitBoxOrient: "vertical", WebkitLineClamp: 2 }}
                    >
                      {item.name}
                    </Link>
                    {/* Price — right-aligned on desktop like Amazon's Price column */}
                    <p className="hidden shrink-0 font-display text-base font-medium text-orwas-ink md:block">
                      {formatPrice(item.price * item.quantity, locale, currency)}
                    </p>
                  </div>

                  <p className="mt-1 text-[11px] font-medium uppercase tracking-wider text-orwas-clay/80">
                    {item.collection}
                  </p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-orwas-clay/80 line-clamp-1" style={{ display: "-webkit-box", WebkitBoxOrient: "vertical", WebkitLineClamp: 1 }}>
                    {item.description}
                  </p>
                  <p className="mt-1.5 text-xs font-medium text-emerald-700">
                    {item.inventory > 0 ? "In Stock" : "Currently unavailable"}
                  </p>

                  {/* Quantity stepper — Amazon's pill with trash icon at quantity 1 */}
                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex items-center overflow-hidden rounded-full shadow-[0_1px_3px_rgba(17,24,39,0.15)]" style={{ border: "1px solid rgba(17,24,39,0.12)" }}>
                      {item.quantity === 1 ? (
                        <button
                          onClick={() => removeFromCart(item.id)}
                          aria-label={`Delete ${item.name}`}
                          className="flex h-8 w-9 items-center justify-center text-orwas-ink transition-colors hover:bg-red-50"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      ) : (
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          aria-label={`Decrease quantity of ${item.name}`}
                          className="flex h-8 w-9 items-center justify-center text-orwas-ink transition-colors hover:bg-orwas-ink/5"
                        >
                          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeWidth={2} d="M20 12H4" />
                          </svg>
                        </button>
                      )}
                      <span className="flex h-8 w-9 items-center justify-center border-x text-xs font-medium text-orwas-ink" style={{ borderColor: "rgba(17,24,39,0.12)" }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        aria-label={`Increase quantity of ${item.name}`}
                        className="flex h-8 w-9 items-center justify-center text-orwas-ink transition-colors hover:bg-orwas-ink/5"
                      >
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>
                    <span className="text-orwas-clay/40">|</span>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-xs text-orwas-clay transition-colors hover:text-red-500 hover:underline"
                    >
                      Delete
                    </button>
                    <span className="text-orwas-clay/40">|</span>
                    <button
                      onClick={() => {
                        addToCart(item);
                      }}
                      className="hidden text-xs text-orwas-clay transition-colors hover:text-orwas-ink hover:underline md:inline"
                    >
                      Add another
                    </button>
                  </div>

                  {/* Line price on mobile — Amazon shows under controls on small screens */}
                  <p className="mt-3 font-display text-base font-medium text-orwas-ink md:hidden">
                    {formatPrice(item.price * item.quantity, locale, currency)}
                  </p>
                </div>
              </div>
            ))}

            {/* Subtotal under items — Amazon's bottom-left summary line */}
            <div className="py-5 text-right" style={{ borderTop: "1px solid rgba(17,24,39,0.08)" }}>
              <p className="text-sm text-orwas-ink">
                Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"}):{" "}
                <span className="font-display font-medium">{formatPrice(subtotal, locale, currency)}</span>
              </p>
            </div>
          </section>

          {/* ── Right: checkout sidebar — Amazon's subtotal card (desktop) ── */}
          <aside className="shrink-0 lg:w-72">
            <div className="lg:sticky lg:top-36">
              <div className="rounded-md bg-white p-5 shadow-[0_2px_8px_rgba(17,24,39,0.1)]" style={{ border: "1px solid rgba(17,24,39,0.08)" }}>
                {deliveryFee === 0 ? (
                  <p className="text-sm text-emerald-700">
                    <span className="font-medium">Your order qualifies for FREE delivery.</span> Choose this at checkout.
                  </p>
                ) : (
                  <p className="text-sm text-orwas-ink">
                    Add <span className="font-medium">{formatPrice(remainingForFree, locale, currency)}</span> of eligible items for FREE delivery.
                  </p>
                )}
                <p className="mt-4 font-display text-xl text-orwas-ink">
                  Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"}):{" "}
                  <span className="font-medium">{formatPrice(subtotal, locale, currency)}</span>
                </p>
                <p className="mt-1 text-[11px] text-orwas-clay">
                  Delivery: {deliveryFee === 0 ? "FREE" : formatPrice(deliveryFee, locale, currency)}
                </p>
                <p className="mt-0.5 text-[11px] text-orwas-clay">
                  Order total: <span className="font-medium text-orwas-ink">{formatPrice(total, locale, currency)}</span>
                </p>
                <label className="mt-3 flex items-center gap-2 text-xs text-orwas-clay">
                  <input type="checkbox" className="accent-[#D4AF37]" defaultChecked readOnly />
                  This order contains a gift
                </label>
                <button
                  onClick={handleCheckout}
                  disabled={placing}
                  className="mt-4 w-full rounded-full py-3 text-[11px] font-medium uppercase tracking-[0.2em] text-orwas-ink transition-opacity hover:opacity-90 disabled:opacity-60"
                  style={{ backgroundColor: "var(--color-amber)" }}
                >
                  {placing ? "Placing…" : "Proceed to Checkout"}
                </button>
              </div>

              {/* Upsell under sidebar — Amazon cross-sell position */}
              <div className="mt-5 hidden lg:block">
                <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-orwas-amber">Complete your look</p>
                <div className="flex flex-col gap-3">
                  {YOU_MAY_ALSO_LIKE.slice(0, 2).map((product) => (
                    <button
                      key={product.id}
                      onClick={() => addToCart(product)}
                      className="group flex items-center gap-3 rounded-md bg-white p-2 text-left transition-shadow hover:shadow-[0_2px_10px_rgba(17,24,39,0.1)]"
                      style={{ border: "1px solid rgba(17,24,39,0.06)" }}
                    >
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-sm" style={{ backgroundColor: "rgba(17,24,39,0.05)" }}>
                        <Image src={product.image} alt={product.name} fill sizes="56px" className="object-cover" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-[11px] text-orwas-ink">{product.name}</p>
                        <p className="text-xs font-medium" style={{ color: "var(--color-clay)" }}>
                          {formatPrice(product.price, locale, currency)}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* ── You may also like — full-width grid under the cart (mobile/tablet) ── */}
        <section className="mt-8 lg:hidden">
          <h2 className="mb-4 text-center text-sm font-medium text-orwas-ink">You may also like</h2>
          <div className="grid grid-cols-2 gap-3">
            {YOU_MAY_ALSO_LIKE.map((product) => (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                className="group overflow-hidden rounded-md bg-white text-left shadow-[0_1px_2px_rgba(17,24,39,0.06)] transition-shadow hover:shadow-[0_4px_14px_rgba(17,24,39,0.1)]"
              >
                <div className="relative aspect-square" style={{ backgroundColor: "rgba(17,24,39,0.05)" }}>
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 200px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-3">
                  <p className="text-xs leading-snug text-orwas-ink line-clamp-2" style={{ display: "-webkit-box", WebkitBoxOrient: "vertical", WebkitLineClamp: 2 }}>
                    {product.name}
                  </p>
                  <p className="mt-1 font-display text-sm font-medium" style={{ color: "var(--color-clay)" }}>
                    {formatPrice(product.price, locale, currency)}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Trust row */}
        <div className="flex items-center justify-center gap-6 py-8">
          <span className="flex items-center gap-1.5 text-[9px] tracking-wider text-orwas-clay/60">
            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            Secure checkout
          </span>
          <span className="flex items-center gap-1.5 text-[9px] tracking-wider text-orwas-clay/60">
            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Free over {formatPrice(FREE_SHIPPING_THRESHOLD, locale, currency)}
          </span>
          <span className="flex items-center gap-1.5 text-[9px] tracking-wider text-orwas-clay/60">
            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Easy returns
          </span>
        </div>
      </div>
    </div>
    </CartPortal>
  );
}
