"use client";

import { formatPrice } from "@/lib/store";
import { useStore } from "@/components/StoreProvider";

const COMPLETE_YOUR_LOOK = [
  {
    id: "look-1",
    name: "Clarks Desert Boot",
    price: 8500,
    collection: "Heritage",
    inventory: 15,
    category: "Footwear" as const,
    image: "/collections/clark.jpeg",
    description: "British heritage footwear — iconic since 1950",
  },
  {
    id: "look-2",
    name: "Heritage Belt",
    price: 1800,
    collection: "Heritage",
    inventory: 12,
    category: "Accessories" as const,
    image: "/collections/collection-2.jpeg",
    description: "Hand-stitched leather belt — timeless finish",
  },
  {
    id: "look-3",
    name: "Clarks Wallabee",
    price: 7200,
    collection: "Heritage",
    inventory: 8,
    category: "Footwear" as const,
    image: "/collections/clark-2.jpeg",
    description: "Timeless suede silhouette — street culture staple",
  },
];

export default function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { cart, locale, currency, updateQuantity, removeFromCart, addToCart } = useStore();
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const freeShippingThreshold = 10000;
  const deliveryFee = total >= freeShippingThreshold ? 0 : 500;

  return (
    <div className={`fixed inset-0 z-[60] transition ${open ? "pointer-events-auto" : "pointer-events-none"}`}>
      {/* Backdrop */}
      <button
        aria-label="Close cart"
        onClick={onClose}
        className="absolute inset-0 bg-black transition-opacity duration-500"
        style={{ opacity: open ? 0.85 : 0 }}
      />

      {/* Cart Panel — luxury fashion drawer */}
      <aside
        className={`absolute right-0 top-0 h-full w-full max-w-[440px] text-orwas-ink transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col ${open ? "translate-x-0" : "translate-x-full"}`}
        style={{ backgroundColor: "#faf9f7", borderLeft: "1px solid rgba(26,23,20,0.06)" }}
      >
        {/* Header — editorial style */}
        <div className="px-6 pt-6 pb-4" style={{ borderBottom: "1px solid rgba(26,23,20,0.08)" }}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[9px] uppercase tracking-[0.35em] text-orwas-amber mb-1 font-medium">Your Selection</p>
              <h2 className="font-display text-2xl text-orwas-ink">Bag</h2>
            </div>
            <button
              onClick={onClose}
              aria-label="Close cart"
              className="w-9 h-9 flex items-center justify-center rounded-full transition-colors duration-300"
              style={{ border: "1px solid rgba(26,23,20,0.12)" }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(26,23,20,0.05)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
            >
              <svg className="w-4 h-4 text-orwas-ink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {itemCount > 0 && (
            <p className="text-[10px] text-orwas-clay mt-2 tracking-wider">
              {itemCount} {itemCount === 1 ? "piece" : "pieces"} · {formatPrice(total, locale, currency)}
            </p>
          )}
        </div>

        {/* Free shipping whisper */}
        {cart.length > 0 && (
          <div className="px-6 py-3" style={{ borderBottom: "1px solid rgba(26,23,20,0.04)" }}>
            {total >= freeShippingThreshold ? (
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <p className="text-[10px] tracking-wider text-emerald-700 font-medium">Complimentary delivery</p>
              </div>
            ) : (
              <div>
                <p className="text-[10px] tracking-wider text-orwas-clay">
                  Add <span className="text-orwas-ink font-medium">{formatPrice(freeShippingThreshold - total, locale, currency)}</span> for complimentary delivery
                </p>
                <div className="mt-2 w-full h-[2px] bg-orwas-sand/40 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${Math.min((total / freeShippingThreshold) * 100, 100)}%`,
                      backgroundColor: "var(--color-amber)",
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Content */}
        {cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-8">
            {/* Empty state — editorial */}
            <div className="w-16 h-16 mb-8" style={{ border: "1px solid rgba(26,23,20,0.1)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg className="w-6 h-6 text-orwas-clay" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <p className="text-[9px] uppercase tracking-[0.35em] text-orwas-amber mb-3 font-medium">Nothing yet</p>
            <h3 className="font-display text-xl text-orwas-ink mb-3 text-center">Your bag is empty</h3>
            <p className="text-xs text-orwas-clay text-center leading-relaxed mb-8 max-w-[240px]">
              Explore considered pieces crafted with intention. Each item tells a story of origin.
            </p>
            <button
              onClick={onClose}
              className="px-8 py-3 text-[10px] uppercase tracking-[0.25em] text-orwas-ink transition-colors duration-300"
              style={{ border: "1px solid rgba(26,23,20,0.2)" }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(26,23,20,0.05)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
            >
              Explore Collection
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto">
              {/* Cart items — editorial cards */}
              <div>
                {cart.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex gap-5 px-6 py-5 transition-colors duration-300"
                    style={{
                      borderBottom: index < cart.length - 1 ? "1px solid rgba(26,23,20,0.05)" : "1px solid rgba(26,23,20,0.08)",
                    }}
                  >
                    {/* Image — fashion card style */}
                    <div className="relative h-28 w-24 shrink-0 overflow-hidden" style={{ backgroundColor: "rgba(212,197,178,0.15)" }}>
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <svg className="w-6 h-6 text-orwas-clay/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Details — editorial typography */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-[9px] uppercase tracking-[0.3em] text-orwas-amber mb-1 font-medium">
                              {item.collection}
                            </p>
                            <h3 className="text-sm font-medium text-orwas-ink leading-snug">
                              {item.name}
                            </h3>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="shrink-0 mt-0.5 text-orwas-clay/50 hover:text-red-400 transition-colors duration-300"
                            aria-label={`Remove ${item.name}`}
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        {item.description && (
                          <p className="text-[10px] text-orwas-clay mt-1 leading-relaxed line-clamp-1">{item.description}</p>
                        )}
                      </div>

                      <div className="flex items-end justify-between mt-3">
                        <p className="text-sm font-display text-orwas-ink">
                          {formatPrice(item.price, locale, currency)}
                          {item.quantity > 1 && (
                            <span className="text-[10px] font-body text-orwas-clay ml-1.5">× {item.quantity}</span>
                          )}
                        </p>

                        {/* Quantity — minimal inline */}
                        <div className="flex items-center" style={{ border: "1px solid rgba(26,23,20,0.1)", borderRadius: "2px" }}>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="w-7 h-7 flex items-center justify-center text-orwas-clay hover:text-orwas-ink disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                          >
                            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                          </button>
                          <span className="w-8 h-7 flex items-center justify-center text-[11px] font-medium text-orwas-ink" style={{ borderLeft: "1px solid rgba(26,23,20,0.08)", borderRight: "1px solid rgba(26,23,20,0.08)" }}>
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-7 h-7 flex items-center justify-center text-orwas-clay hover:text-orwas-ink transition-colors"
                          >
                            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Complete Your Look — editorial upsell */}
              <div className="px-6 py-6" style={{ borderTop: "1px solid rgba(26,23,20,0.06)" }}>
                <p className="text-[9px] uppercase tracking-[0.35em] text-orwas-amber mb-4 font-medium">Complete Your Look</p>
                <div className="flex gap-4">
                  {COMPLETE_YOUR_LOOK.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => addToCart(product)}
                      className="flex-shrink-0 w-[100px] group text-left"
                    >
                      <div className="aspect-[3/4] overflow-hidden mb-2" style={{ backgroundColor: "rgba(212,197,178,0.15)" }}>
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                      <p className="text-[9px] text-orwas-clay truncate mb-0.5">{product.name}</p>
                      <p className="text-[10px] font-display text-orwas-ink">{formatPrice(product.price, locale, currency)}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer — editorial checkout */}
            <div style={{ borderTop: "1px solid rgba(26,23,20,0.08)" }}>
              {/* Summary */}
              <div className="px-6 py-5 space-y-3">
                <div className="flex justify-between">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-orwas-clay">Subtotal</span>
                  <span className="text-[11px] font-medium text-orwas-ink">{formatPrice(total, locale, currency)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-orwas-clay">Delivery</span>
                  <span className={`text-[11px] font-medium ${deliveryFee === 0 ? "text-emerald-600" : "text-orwas-ink"}`}>
                    {deliveryFee === 0 ? "Complimentary" : formatPrice(deliveryFee, locale, currency)}
                  </span>
                </div>
                <div className="flex justify-between pt-3" style={{ borderTop: "1px solid rgba(26,23,20,0.08)" }}>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-orwas-ink font-medium">Total</span>
                  <span className="text-base font-display text-orwas-ink">{formatPrice(total + deliveryFee, locale, currency)}</span>
                </div>
              </div>

              {/* Checkout */}
              <div className="px-6 pb-2">
                <button
                  className="w-full py-4 text-[10px] uppercase tracking-[0.3em] text-orwas-cream transition-all duration-300"
                  style={{ backgroundColor: "var(--color-ink)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(140,123,107,1)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "var(--color-ink)"; }}
                >
                  Proceed to Checkout
                </button>
              </div>

              {/* Trust whisper */}
              <div className="px-6 pb-5 pt-3 flex items-center justify-center gap-6">
                <div className="flex items-center gap-1.5">
                  <svg className="w-3 h-3 text-orwas-clay/40" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-[9px] tracking-wider text-orwas-clay/60">Secure</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <svg className="w-3 h-3 text-orwas-clay/40" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 6.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                    <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                  </svg>
                  <span className="text-[9px] tracking-wider text-orwas-clay/60">Free over KSh 10,000</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <svg className="w-3 h-3 text-orwas-clay/40" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  <span className="text-[9px] tracking-wider text-orwas-clay/60">Returns</span>
                </div>
              </div>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
