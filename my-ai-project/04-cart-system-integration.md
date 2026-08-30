# Lesson 4: Cart System Integration

**Date:** August 28, 2026
**Project:** ORWAS (Fashion E-commerce Store)

---

## What We Built

We connected the "Add to Cart" and "Quick Buy" buttons to your existing cart system. Now when someone clicks those buttons, the item actually gets added to their cart!

---

## How the Cart System Works

### The Flow
```
User clicks "Add to Cart"
    ↓
handleAddToCart() is called
    ↓
Product data is converted to match Product interface
    ↓
addToCart() from StoreProvider adds item to cart state
    ↓
Cart is saved to localStorage (persists across refreshes)
    ↓
Header shows updated cart count
    ↓
User can click "Cart" to see their items
```

### Key Files
- **`lib/store.ts`** — Defines Product interface and cart logic
- **`components/StoreProvider.tsx`** — Provides cart state to all components
- **`components/CollectionsGrid.tsx`** — Our collection buttons (now connected!)
- **`components/CartDrawer.tsx`** — The cart sidebar that shows items

---

## How We Connected the Buttons

### Step 1: Import the Store Hook
```tsx
"use client";

import { useStore } from "@/components/StoreProvider";

export default function CollectionsGrid() {
  const { addToCart } = useStore();  // Get the addToCart function
  // ...
}
```

**What this does:**
- `"use client"` — This component runs in the browser (needs hooks)
- `useStore()` — Access the global cart state and functions
- `addToCart` — The function that adds items to the cart

### Step 2: Create a Handler Function
```tsx
const handleAddToCart = (product: typeof BRAND_COLLECTIONS[0]) => {
  addToCart({
    id: product.id,
    name: product.name,
    price: product.price,
    collection: product.collection,
    inventory: product.inventory,
    category: product.category,
    description: product.description,
    image: product.image,
  });
};
```

**Why we need this:**
- Our collection data has extra fields (stock, delivery, badge)
- The cart system expects a specific Product format
- This function converts between the two formats

### Step 3: Connect the Buttons
```tsx
<button 
  onClick={() => handleAddToCart(item)}
  className="..."
>
  Add to Cart
</button>
```

**What happens when clicked:**
1. `onClick` triggers `handleAddToCart(item)`
2. `handleAddToCart` converts the item to Product format
3. `addToCart` adds it to the cart state
4. Cart saves to localStorage
5. Header updates with new cart count

---

## The Product Interface

The cart system expects products to have this structure:

```tsx
interface Product {
  id: string;           // Unique identifier
  name: string;         // Product name
  price: number;        // Price in KSh
  collection: string;   // Collection name (Heritage, Street, etc.)
  inventory: number;    // How many in stock
  category: string;     // Clothing, Footwear, Accessories, Other
  description?: string; // Optional description
  image?: string;       // Optional image path
}
```

### Our Collection Data vs. Product Format

**Our collection item:**
```tsx
{
  id: "clark-desert-boot",
  name: "Clarks Desert Boot",
  description: "British heritage footwear — iconic since 1950",
  price: 8500,
  originalPrice: 12000,  // ← Not in Product interface
  stock: "in-stock",     // ← Not in Product interface
  stockCount: 15,        // ← Not in Product interface
  delivery: "24hr",      // ← Not in Product interface
  badge: "Best Seller",  // ← Not in Product interface
  image: "/collections/clark.jpeg",
  collection: "Heritage",
  inventory: 15,
  category: "Footwear",
}
```

**Product format (what cart expects):**
```tsx
{
  id: "clark-desert-boot",
  name: "Clarks Desert Boot",
  description: "British heritage footwear — iconic since 1950",
  price: 8500,
  image: "/collections/clark.jpeg",
  collection: "Heritage",
  inventory: 15,
  category: "Footwear",
}
```

The `handleAddToCart` function removes the extra fields (originalPrice, stock, stockCount, delivery, badge) that the cart doesn't need.

---

## How localStorage Works

The cart persists across page refreshes using localStorage:

```tsx
// In StoreProvider.tsx
useEffect(() => {
  // Load cart from localStorage on page load
  const savedCart = window.localStorage.getItem("orwas-cart");
  if (savedCart) setCart(JSON.parse(savedCart));
}, []);

useEffect(() => {
  // Save cart to localStorage whenever it changes
  window.localStorage.setItem("orwas-cart", JSON.stringify(cart));
}, [cart]);
```

**What this means:**
- Cart data is stored in your browser (not on a server)
- When you refresh the page, the cart loads from localStorage
- When you add/remove items, localStorage updates automatically
- Different browsers/devices have separate carts

---

## TypeScript Error We Fixed

**Error:** `Property 'title' does not exist on type...`

**Problem:** We renamed `title` to `name` in the data, but the JSX still used `item.title`.

**Fix:** Changed `item.title` to `item.name` in the JSX:
```tsx
// Before (wrong)
<h4>{item.title}</h4>

// After (correct)
<h4>{item.name}</h4>
```

**Why TypeScript caught this:**
- TypeScript checks that you're using properties that actually exist
- If you rename a property in the data, TypeScript warns you everywhere it's used
- This prevents bugs where you try to access undefined properties

---

## What You Learned Today

1. ✅ How to use React hooks (useStore)
2. ✅ How to connect UI buttons to backend logic
3. ✅ How to convert data formats between components
4. ✅ How TypeScript helps catch errors
5. ✅ How localStorage persists data across refreshes
6. ✅ How the cart system works end-to-end

---

## Key Takeaways

### React Context (useStore)
- Provides global state to any component
- Avoids "prop drilling" (passing data through many components)
- Used for data that many components need (cart, user, theme)

### Data Conversion
- Different components may need different data formats
- Create handler functions to convert between formats
- Keep the cart interface clean (only what it needs)

### localStorage
- Good for small amounts of data (cart, preferences)
- Not secure (users can edit it)
- Not shared across devices
- For real apps, you'd use a database (Supabase)

---

## Next Steps

- [ ] Add product detail pages (when user clicks a product)
- [ ] Implement the caching APIs (your partner will handle)
- [ ] Add animations when items are added to cart
- [ ] Create a checkout page
- [ ] Connect to Supabase for real data storage

---

*Notes saved by Buffy (your AI coding assistant)*
*Review this anytime — open this file in VS Code or any text editor*
