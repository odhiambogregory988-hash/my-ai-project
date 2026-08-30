# Lesson 3: E-commerce Quick Checkout Features

**Date:** August 28, 2026
**Project:** ORWAS (Fashion E-commerce Store)

---

## What We Built

We added **Kilimall-style** quick checkout features to your brand collections:
- Stock availability indicators
- Price display with discounts
- Delivery time information
- Quick action buttons (Add to Cart, Quick Buy)
- Product badges (Best Seller, New Arrival, etc.)

---

## Research: Kilimall UI Pattern

Kilimall is Kenya's leading e-commerce platform. Key features we borrowed:

1. **Stock Status Indicators**
   - Green = In Stock
   - Yellow = Low Stock (only X left)
   - Red = Out of Stock

2. **Price Display**
   - Current price in bold
   - Original price crossed out (if discounted)
   - Currency: KSh (Kenyan Shillings)

3. **Delivery Information**
   - 24hr Delivery (fast)
   - 48hr Delivery (standard)
   - Delivery unavailable (for out-of-stock)

4. **Quick Action Buttons**
   - "Add to Cart" — adds to shopping cart
   - "Quick Buy" — instant checkout
   - "Notify Me" — for out-of-stock items

5. **Product Badges**
   - Best Seller, New Arrival, Limited, Popular, Almost Gone, Sold Out, Exclusive

---

## How It Works in Code

### Product Data Structure
```tsx
const BRAND_COLLECTIONS = [
  {
    image: "/collections/clark.jpeg",
    title: "Clarks Desert Boot",
    price: 8500,           // Current price in KSh
    originalPrice: 12000,  // Original price (if discounted)
    stock: "in-stock",     // "in-stock" | "low-stock" | "out-of-stock"
    stockCount: 15,        // How many items left
    delivery: "24hr",      // "24hr" | "48hr" | "-"
    badge: "Best Seller",  // Product badge
  },
  // ... more products
];
```

### Stock Status Indicator
```tsx
<div className={`flex items-center gap-1 px-2 py-1 rounded-sm text-[10px] font-medium ${\n  item.stock === 'in-stock' ? 'bg-green-500/90 text-white' :\n  item.stock === 'low-stock' ? 'bg-yellow-500/90 text-orwas-ink' :\n  'bg-red-500/90 text-white'\n}`}>\n  <div className={`w-1.5 h-1.5 rounded-full ${\n    item.stock === 'in-stock' ? 'bg-white' :\n    item.stock === 'low-stock' ? 'bg-orwas-ink' :\n    'bg-white'\n  }`} />\n  {item.stock === 'in-stock' ? 'In Stock' :\n   item.stock === 'low-stock' ? `Only ${item.stockCount} left` :\n   'Out of Stock'}\n</div>\n```

**Key concepts:**
- Conditional classes with `${}` — different styles based on stock status
- Color coding: green → yellow → red (traffic light system)
- Dynamic text: "Only X left" creates urgency

### Price Display with Discounts
```tsx
<div className=\"flex items-center gap-2 mb-3\">\n  <span className=\"text-orwas-cream font-medium\">\n    KSh {item.price.toLocaleString()}\n  </span>\n  {item.originalPrice && (\n    <span className=\"text-orwas-cream/50 text-xs line-through\">\n      KSh {item.originalPrice.toLocaleString()}\n    </span>\n  )}\n</div>\n```

**Key concepts:**
- `toLocaleString()` — Formats numbers with commas (8500 → 8,500)
- `line-through` — Crosses out the original price
- Conditional rendering: `{item.originalPrice && ...}` — only shows if there's a discount

### Quick Action Buttons
```tsx
{item.stock !== 'out-of-stock' ? (\n  <div className=\"flex gap-2\">\n    <button className=\"flex-1 bg-orwas-amber hover:bg-orwas-amber-light text-orwas-ink text-[10px] font-medium uppercase tracking-wider py-2 px-3 rounded-sm transition-colors duration-300\">\n      Add to Cart\n    </button>\n    <button className=\"bg-orwas-cream/20 hover:bg-orwas-cream/30 text-orwas-cream text-[10px] font-medium uppercase tracking-wider py-2 px-3 rounded-sm transition-colors duration-300\">\n      Quick Buy\n    </button>\n  </div>\n) : (\n  <button className=\"w-full bg-orwas-ink/50 text-orwas-cream/50 text-[10px] font-medium uppercase tracking-wider py-2 px-3 rounded-sm cursor-not-allowed\">\n    Notify Me\n  </button>\n)}\n```

**Key concepts:**
- Conditional rendering: Show different buttons based on stock status
- `cursor-not-allowed` — Disables the button visually
- `hover:` classes — Change appearance on mouse hover
- `transition-colors duration-300` — Smooth color transitions

### Product Badges
```tsx
{item.badge && (\n  <div className=\"absolute top-3 left-3 z-10\">\n    <span className={`inline-block px-2 py-1 text-[10px] font-medium uppercase tracking-wider rounded-sm ${\n      item.badge === 'Sold Out' ? 'bg-orwas-ink/80 text-orwas-cream' :\n      item.badge === 'Almost Gone' ? 'bg-orwas-amber/90 text-orwas-ink' :\n      item.badge === 'Best Seller' ? 'bg-orwas-amber text-orwas-ink' :\n      'bg-orwas-cream/90 text-orwas-ink'\n    }`}>\n      {item.badge}\n    </span>\n  </div>\n)}\n```

**Key concepts:**
- Absolute positioning for badges (top-left corner)
- Conditional styling based on badge type
- Uppercase text for emphasis

---

## Tailwind Classes Used

### Colors
- `bg-green-500/90` — Green with 90% opacity (in stock)
- `bg-yellow-500/90` — Yellow with 90% opacity (low stock)
- `bg-red-500/90` — Red with 90% opacity (out of stock)
- `bg-orwas-amber` — Your brand's amber color
- `text-orwas-cream` — Cream text color

### Typography
- `text-[10px]` — Very small text (for badges and labels)
- `font-medium` — Medium weight font
- `uppercase` — All caps
- `tracking-wider` — Letter spacing
- `line-through` — Strikethrough text

### Layout
- `flex gap-2` — Flexbox with gap between items
- `flex-1` — Take remaining space
- `rounded-sm` — Small border radius
- `py-2 px-3` — Padding (vertical 8px, horizontal 12px)

### Effects
- `hover:bg-orwas-amber-light` — Lighter on hover
- `transition-colors duration-300` — Smooth color change (300ms)
- `cursor-not-allowed` — Disable pointer
- `z-10` — Stack order (for badges)

---

## What You Learned Today

1. ✅ How to research UI patterns from other e-commerce sites
2. ✅ How to add stock status indicators with color coding
3. ✅ How to display prices with discounts
4. ✅ How to create quick action buttons
5. ✅ How to use conditional rendering for different states
6. ✅ How to format numbers with commas (toLocaleString)

---

## Key Takeaways

### E-commerce UX Patterns
- **Color coding** helps users understand status quickly (green/yellow/red)
- **Urgency** drives sales ("Only 3 left!")
- **Quick actions** reduce friction (Add to Cart, Quick Buy)
- **Badges** highlight important products

### Code Patterns
- **Conditional rendering** with `{condition && <Component />}`
- **Conditional classes** with `${condition ? 'class-a' : 'class-b'}`
- **Data-driven UI** — One component renders different products based on data

---

## Next Steps

- [ ] Connect these buttons to a real cart system (use your existing `StoreProvider`)
- [ ] Add product detail pages (when user clicks a product)
- [ ] Implement caching APIs (your partner will handle this)
- [ ] Add animations to the quick checkout buttons

---

*Notes saved by Buffy (your AI coding assistant)*
*Review this anytime — open this file in VS Code or any text editor*
