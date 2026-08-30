"use client";

import { formatPrice } from "@/lib/store";
import { useStore } from "@/components/StoreProvider";

const SUGGESTED_PRODUCTS = [
  {
    id: "suggest-1",
    name: "Clarks Desert Boot",
    price: 8500,
    collection: "Heritage",
    inventory: 15,
    category: "Footwear" as const,
    image: "/collections/clark.jpeg",
    description: "British heritage footwear — iconic since 1950",
  },
  {
    id: "suggest-2",
    name: "Nairobi Street Tee",
    price: 2500,
    collection: "Street",
    inventory: 20,
    category: "Clothing" as const,
    image: "/collections/wakadinali.jpeg",
    description: "Urban culture meets contemporary fashion",
  },
  {
    id: "suggest-3",
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
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - total);

  return (
    <div className={`fixed inset-0 z-[60] transition ${open ? "pointer-events-auto" : "pointer-events-none"}`}>
      {/* Backdrop */}
      <button 
        aria-label="Close cart" 
        onClick={onClose} 
        className={`absolute inset-0 bg-orwas-ink/60 backdrop-blur-sm transition-opacity duration-500 ${open ? "opacity-100" : "opacity-0"}`} 
      />
      
      {/* Cart Drawer */}
      <aside className={`absolute right-0 top-0 h-full w-full max-w-md bg-orwas-ivory text-orwas-ink shadow-2xl transition-transform duration-500 ease-out flex flex-col ${open ? "translate-x-0" : "translate-x-full"}`}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-orwas-clay/20 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orwas-ink flex items-center justify-center">
              <svg className="w-5 h-5 text-orwas-cream" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <div>
              <h2 className="font-display text-xl text-orwas-ink">Your Cart</h2>
              <p className="text-[10px] text-orwas-clay">
                {itemCount} {itemCount === 1 ? 'item' : 'items'} • {formatPrice(total, locale, currency)}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            aria-label="Close cart" 
            className="w-8 h-8 flex items-center justify-center rounded-full bg-orwas-sand/50 hover:bg-orwas-sand transition-colors duration-300"
          >
            <span className="text-orwas-ink text-lg">×</span>
          </button>
        </div>

        {/* Free Shipping Progress */}
        {cart.length > 0 && remainingForFreeShipping > 0 && (
          <div className="px-6 py-3 bg-orwas-sand/30 border-b border-orwas-clay/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase tracking-[0.15em] text-orwas-clay">
                {remainingForFreeShipping > 0 ? `Add ${formatPrice(remainingForFreeShipping, locale, currency)} for free delivery` : 'You got free delivery!'}
              </span>
              <svg className="w-4 h-4 text-orwas-amber" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 6.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
              </svg>
            </div>
            <div className="w-full bg-orwas-clay/20 rounded-full h-1.5">
              <div 
                className="bg-orwas-amber h-1.5 rounded-full transition-all duration-500" 
                style={{ width: `${Math.min((total / freeShippingThreshold) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Cart Content */}
        {cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6">
            <div className="w-20 h-20 mb-6 rounded-full bg-orwas-sand/30 flex items-center justify-center">
              <svg className="w-10 h-10 text-orwas-clay/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h3 className="font-display text-xl text-orwas-ink mb-2">Your cart is empty</h3>
            <p className="text-orwas-clay/60 text-sm text-center mb-6">Discover something considered.</p>
            
            {/* Brand Story Teaser */}
            <div className="w-full p-4 bg-orwas-sand/20 rounded-sm mb-6">
              <p className="text-[10px] uppercase tracking-[0.2em] text-orwas-amber mb-2">Our Story</p>
              <p className="text-xs text-orwas-clay leading-relaxed">
                Born from heritage materials and contemporary vision. Each piece tells a story of origin.
              </p>
            </div>
            
            <button 
              onClick={onClose}
              className="w-full px-6 py-3 bg-orwas-ink text-orwas-cream text-xs uppercase tracking-[0.2em] hover:bg-orwas-stone transition-colors duration-300"
            >
              Explore Collections
            </button>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto">
              <div className="divide-y divide-orwas-clay/10">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-4 p-6 hover:bg-orwas-sand/20 transition-colors duration-300">
                    {/* Product Image - Larger for better visibility */}
                    <div className="relative h-32 w-28 shrink-0 bg-orwas-sand/40 rounded-sm overflow-hidden group cursor-pointer">
                      {item.image ? (
                        <>
                          <img 
                            src={item.image} 
                            alt={item.name}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-orwas-ink/0 group-hover:bg-orwas-ink/10 transition-colors duration-300" />
                          {/* Quick View Overlay */}
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <span className="bg-orwas-ink/80 text-orwas-cream text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-sm">
                              Quick View
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <svg className="w-10 h-10 text-orwas-clay/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                      {/* Category Badge */}
                      <div className="absolute top-2 left-2">
                        <span className="px-2 py-1 text-[8px] font-medium uppercase tracking-wider bg-orwas-ink/80 text-orwas-cream rounded-sm">
                          {item.category}
                        </span>
                      </div>
                    </div>
                    
                    {/* Product Details */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.2em] text-orwas-amber mb-1">
                            {item.collection}
                          </p>
                          <h3 className="text-sm font-medium text-orwas-ink mb-1">
                            {item.name}
                          </h3>
                          {item.description && (
                            <p className="text-[10px] text-orwas-clay mb-1">
                              {item.description}
                            </p>
                          )}
                        </div>
                        <button 
                          onClick={() => removeFromCart(item.id)} 
                          className="text-orwas-clay/40 hover:text-orwas-ink transition-colors duration-300"
                          aria-label={`Remove ${item.name}`}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      
                      {/* Price */}
                      <p className="text-sm font-medium text-orwas-ink mb-2">
                        {formatPrice(item.price, locale, currency)}
                      </p>
                      
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center border border-orwas-clay/20 rounded-sm">
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity - 1)} 
                            aria-label={`Decrease ${item.name}`}
                            className="w-7 h-7 flex items-center justify-center text-orwas-clay hover:text-orwas-ink hover:bg-orwas-sand/50 transition-colors duration-300"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                          </button>
                          <span className="w-8 h-7 flex items-center justify-center text-xs font-medium text-orwas-ink border-x border-orwas-clay/20">
                            {item.quantity}
                          </span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)} 
                            aria-label={`Increase ${item.name}`}
                            className="w-7 h-7 flex items-center justify-center text-orwas-clay hover:text-orwas-ink hover:bg-orwas-sand/50 transition-colors duration-300"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                        </div>
                        <span className="text-[10px] text-orwas-clay">
                          {item.quantity > 1 ? `${formatPrice(item.price * item.quantity, locale, currency)} total` : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Suggested Products */}
              <div className="p-6 border-t border-orwas-clay/10">
                <p className="text-[10px] uppercase tracking-[0.2em] text-orwas-amber mb-4">You might also like</p>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {SUGGESTED_PRODUCTS.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => addToCart(product)}
                      className="flex-shrink-0 w-32 group"
                    >
                      <div className="aspect-[3/4] bg-orwas-sand/30 rounded-sm overflow-hidden mb-2 relative">
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-orwas-ink/0 group-hover:bg-orwas-ink/20 transition-colors duration-300 flex items-center justify-center">
                          <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-[10px] uppercase tracking-wider text-orwas-cream bg-orwas-ink/80 px-3 py-1.5 rounded-sm">
                            Add +
                          </span>
                        </div>
                      </div>
                      <p className="text-[10px] text-orwas-clay truncate">{product.name}</p>
                      <p className="text-xs font-medium text-orwas-ink">{formatPrice(product.price, locale, currency)}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-orwas-clay/20 px-6 py-5 bg-orwas-ivory">
              {/* Summary */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-orwas-clay">Subtotal</span>
                  <span className="text-orwas-ink">{formatPrice(total, locale, currency)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-orwas-clay">Delivery</span>
                  <span className="text-orwas-amber text-xs font-medium">
                    {total >= freeShippingThreshold ? 'FREE' : formatPrice(500, locale, currency)}
                  </span>
                </div>
                <div className="border-t border-orwas-clay/20 pt-2 flex justify-between">
                  <span className="text-sm font-medium text-orwas-ink">Total</span>
                  <strong className="text-lg font-display text-orwas-ink">
                    {formatPrice(total >= freeShippingThreshold ? total : total + 500, locale, currency)}
                  </strong>
                </div>
              </div>
              
              {/* Checkout Button */}
              <button className="w-full bg-orwas-ink px-6 py-4 text-xs uppercase tracking-[0.2em] text-orwas-cream hover:bg-orwas-stone transition-all duration-300 flex items-center justify-center gap-2 group">
                <span>Continue to Delivery</span>
                <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
              
              {/* Trust Badges */}
              <div className="mt-4 grid grid-cols-3 gap-2">
                <div className="flex flex-col items-center p-2 bg-orwas-sand/20 rounded-sm">
                  <svg className="w-4 h-4 text-orwas-amber mb-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-[8px] uppercase tracking-wider text-orwas-clay">Secure</span>
                </div>
                <div className="flex flex-col items-center p-2 bg-orwas-sand/20 rounded-sm">
                  <svg className="w-4 h-4 text-orwas-amber mb-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 6.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                    <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                  </svg>
                  <span className="text-[8px] uppercase tracking-wider text-orwas-clay">Free Delivery</span>
                </div>
                <div className="flex flex-col items-center p-2 bg-orwas-sand/20 rounded-sm">
                  <svg className="w-4 h-4 text-orwas-amber mb-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                  </svg>
                  <span className="text-[8px] uppercase tracking-wider text-orwas-clay">Easy Returns</span>
                </div>
              </div>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}