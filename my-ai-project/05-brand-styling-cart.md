# Lesson 5: Brand Styling — Cart Drawer

**Date:** August 28, 2026
**Project:** ORWAS (Fashion E-commerce Store)

---

## What We Built

We redesigned the CartDrawer to match the ORWAS brand aesthetic. Now it looks like a premium fashion store, not a generic e-commerce cart.

---

## The ORWAS Brand Palette

From your `tailwind.config.ts`:
```tsx
colors: {
  orwas: {
    ink: "#1a1714",        // Dark brown (text, backgrounds)
    clay: "#8c7b6b",       // Medium brown (secondary text)
    sand: "#d4c5b2",       // Light brown (borders, backgrounds)
    cream: "#f5f0eb",      // Off-white (main background)
    ivory: "#faf8f5",      // Pure white (cart background)
    amber: "#c8a96e",      // Gold (accents, badges)
    "amber-light": "#dcc59a", // Light gold (hover states)
    mist: "#e8e2da",       // Very light brown
    stone: "#6b5e50",      // Darker brown (hover states)
  },
}
```

---

## What We Changed

### 1. Background Colors
```tsx
// Before
<aside className="bg-orwas-cream">

// After
<aside className="bg-orwas-ivory">
```
- `orwas-cream` → `orwas-ivory` (cleaner white for cart)

### 2. Backdrop Blur
```tsx
// Before
<button className="bg-orwas-ink/40">

// After
<button className="bg-orwas-ink/60 backdrop-blur-sm">
```
- Added `backdrop-blur-sm` for modern glass effect
- Increased opacity from 40% to 60% for better contrast

### 3. Close Button
```tsx
// Before
<button className="text-2xl leading-none">×</button>

// After
<button className="w-8 h-8 flex items-center justify-center rounded-full bg-orwas-sand/50 hover:bg-orwas-sand">
  <span className="text-orwas-ink text-lg">×</span>
</button>
```
- Circular button with background
- Hover effect for better feedback

### 4. Empty Cart State
```tsx
// Before
<p className="py-12 text-sm text-orwas-clay">Your cart is waiting for something considered.</p>

// After
<div className="flex flex-col items-center justify-center h-full px-6">
  <div className="w-16 h-16 mb-4 rounded-full bg-orwas-sand/50 flex items-center justify-center">
    <svg className="w-8 h-8 text-orwas-clay" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
  </div>
  <p className="text-orwas-clay text-center font-display text-lg mb-2">Your cart is empty</p>
  <p className="text-orwas-clay/60 text-sm text-center">Discover something considered.</p>
  <button className="mt-6 px-6 py-3 bg-orwas-ink text-orwas-cream text-xs uppercase tracking-[0.2em] hover:bg-orwas-stone transition-colors duration-300">
    Continue Shopping
  </button>
</div>
```
- Added shopping bag icon
- Better messaging
- "Continue Shopping" button

### 5. Product Images
```tsx
// Before
<div className="h-20 w-16 shrink-0 bg-orwas-sand/40" />

// After
<div className="h-24 w-20 shrink-0 bg-orwas-sand/40 rounded-sm overflow-hidden">
  {item.image ? (
    <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
  ) : (
    <div className="h-full w-full flex items-center justify-center">
      {/* Placeholder icon */}
    </div>
  )}
</div>
```
- Shows actual product images
- Fallback icon if no image
- Slightly larger (24x20 vs 20x16)

### 6. Quantity Controls
```tsx
// Before
<div className="mt-3 flex items-center gap-3 text-sm">
  <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>−</button>
  <span>{item.quantity}</span>
  <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
  <button onClick={() => removeFromCart(item.id)} className="ml-3 text-xs uppercase tracking-wider text-orwas-clay">Remove</button>
</div>

// After
<div className="mt-3 flex items-center gap-3">
  <div className="flex items-center border border-orwas-clay/20 rounded-sm">
    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center text-orwas-clay hover:text-orwas-ink hover:bg-orwas-sand/50 transition-colors duration-300">
      −
    </button>
    <span className="w-8 h-8 flex items-center justify-center text-sm text-orwas-ink border-x border-orwas-clay/20">
      {item.quantity}
    </span>
    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center text-orwas-clay hover:text-orwas-ink hover:bg-orwas-sand/50 transition-colors duration-300">
      +
    </button>
  </div>
  <button onClick={() => removeFromCart(item.id)} className="text-[10px] uppercase tracking-[0.15em] text-orwas-clay hover:text-orwas-ink transition-colors duration-300">
    Remove
  </button>
</div>
```
- Boxed quantity controls (more polished)
- Hover effects on buttons
- Better spacing and alignment

### 7. Trust Badges
```tsx
<div className="mt-4 flex items-center justify-center gap-4 text-[10px] text-orwas-clay/60">
  <div className="flex items-center gap-1">
    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
    </svg>
    <span>Secure</span>
  </div>
  <div className="flex items-center gap-1">
    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
      {/* Truck icon */}
    </svg>
    <span>Free Delivery</span>
  </div>
</div>
```
- Security badge (lock icon)
- Free delivery badge (truck icon)
- Builds trust with customers

---

## Key Design Principles

### 1. Consistency
- Use brand colors everywhere (orwas-ink, orwas-cream, etc.)
- Match typography (font-display for headings)
- Same spacing patterns (py-5, px-6, gap-4)

### 2. Hierarchy
- Primary actions: Dark background (bg-orwas-ink)
- Secondary actions: Light background (bg-orwas-sand/50)
- Tertiary actions: Text only (text-orwas-clay)

### 3. Feedback
- Hover states on all interactive elements
- Smooth transitions (transition-colors duration-300)
- Visual feedback for clicks

### 4. Trust
- Show product images (customers want to see what they're buying)
- Trust badges (Secure, Free Delivery)
- Clear pricing and quantities

---

## Tailwind Classes Used

### Colors
- `bg-orwas-ivory` — Cart background
- `bg-orwas-sand/50` — Button backgrounds
- `text-orwas-amber` — Accent text (collection names)
- `text-orwas-clay` — Secondary text
- `border-orwas-clay/20` — Subtle borders

### Typography
- `font-display` — Playfair Display (headings)
- `text-[10px]` — Small labels
- `uppercase` — All caps
- `tracking-[0.2em]` — Letter spacing

### Layout
- `flex-1 overflow-y-auto` — Scrollable content
- `absolute bottom-0` — Fixed footer
- `rounded-sm` — Subtle border radius

### Effects
- `backdrop-blur-sm` — Glass effect
- `hover:bg-orwas-sand` — Hover states
- `transition-colors duration-300` — Smooth animations

---

## What You Learned Today

1. ✅ How to style components to match a brand
2. ✅ How to use brand colors consistently
3. ✅ How to improve UX with better empty states
4. ✅ How to add trust signals (security badges)
5. ✅ How to make quantity controls more intuitive
6. ✅ How to add product images to cart items

---

## Key Takeaways

### Brand Consistency
- Always use your brand colors (defined in tailwind.config.ts)
- Match typography (display font for headings, body font for text)
- Same spacing and patterns everywhere

### UX Improvements
- Empty states should guide users (not just say "empty")
- Trust badges build confidence
- Product images help customers verify their choices
- Clear quantity controls reduce errors

### Modern Design Patterns
- Backdrop blur for depth
- Subtle borders (border-orwas-clay/20)
- Hover states on all interactive elements
- Smooth transitions (300ms is ideal)

---

## Next Steps

- [ ] Add product detail pages
- [ ] Implement the caching APIs (your partner will handle)
- [ ] Add animations when items are added to cart
- [ ] Create a checkout page
- [ ] Add a "Recently Viewed" section

---

*Notes saved by Buffy (your AI coding assistant)*
*Review this anytime — open this file in VS Code or any text editor*
