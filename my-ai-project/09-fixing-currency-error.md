# Lesson 9: Fixing Currency Error — Dollar to KSh

**Date:** August 29, 2026
**Project:** ORWAS (Fashion E-commerce Store)

---

## What Was Wrong

The cart was showing prices in **USD ($)** instead of **KES (KSh)**:
- ❌ `$8,500` instead of `KSh 8,500`
- ❌ `$500` delivery fee instead of `KSh 500`
- ❌ `$10,000` threshold instead of `KSh 10,000`

---

## Why It Happened

### The `detectCurrency()` Function
```tsx
function detectCurrency() {
  const locale = navigator.language;  // e.g., "en-US"
  const region = locale.split("-")[1]?.toUpperCase();  // e.g., "US"
  
  const currencyByRegion: Record<string, string> = {
    GB: "GBP",
    CA: "CAD",
    // ... Kenya was missing!
  };
  
  return { locale, currency: currencyByRegion[region] ?? "USD" };
}
```

**Problem:**
- Kenya (KE) was not in the `currencyByRegion` map
- Default was set to `"USD"`
- If your browser locale is `en-US`, it shows `$`

---

## How We Fixed It

### Fix 1: Add Kenya to Currency Map
```tsx
const currencyByRegion: Record<string, string> = {
  KE: "KES",  // ← Added Kenya!
  GB: "GBP",
  CA: "CAD",
  // ... rest of countries
};
```

### Fix 2: Change Default Currency
```tsx
// Before
return { locale, currency: currencyByRegion[region] ?? "USD" };

// After
return { locale, currency: currencyByRegion[region] ?? "KES" };
```

### Fix 3: Custom KES Formatting
```tsx
export function formatPrice(amount: number, locale: string, currency: string) {
  // For KES, use custom formatting to show "KSh" prefix
  if (currency === "KES") {
    return `KSh ${amount.toLocaleString()}`;
  }
  
  // For other currencies, use Intl.NumberFormat
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}
```

**Why custom formatting?**
- `Intl.NumberFormat` for KES shows `KES 8,500` (not `KSh 8,500`)
- Custom function shows `KSh 8,500` (more familiar in Kenya)

---

## How Currency Detection Works

### Step 1: Get Browser Locale
```tsx
const locale = navigator.language;  // e.g., "en-KE" or "sw-KE"
```

### Step 2: Extract Region
```tsx
const region = locale.split("-")[1]?.toUpperCase();  // e.g., "KE"
```

### Step 3: Map to Currency
```tsx
const currency = currencyByRegion[region];  // e.g., "KES"
```

### Step 4: Format Price
```tsx
formatPrice(8500, "en-KE", "KES")  // → "KSh 8,500"
```

---

## What Changed in the Cart

### Before
```tsx
// Header
<p>{itemCount} items • $8,500</p>

// Price
<p>$8,500</p>

// Delivery
<span>$500</span>

// Total
<strong>$9,000</strong>
```

### After
```tsx
// Header
<p>{itemCount} items • KSh 8,500</p>

// Price
<p>KSh 8,500</p>

// Delivery
<span>KSh 500</span>

// Total
<strong>KSh 9,000</strong>
```

---

## How to Change Currency for Your Store

### Option 1: Force KES (Kenyan Shillings)
Already done! Default is now KES.

### Option 2: Force USD (US Dollars)
```tsx
return { locale, currency: "USD" };
```

### Option 3: Auto-Detect Based on User
Keep the current implementation — it detects based on browser locale.

### Option 4: Let User Choose
```tsx
// Add currency selector in settings
const [currency, setCurrency] = useState("KES");
```

---

## Common Currency Codes

| Country | Code | Symbol |
|---------|------|--------|
| Kenya | KES | KSh |
| US | USD | $ |
| UK | GBP | £ |
| EU | EUR | € |
| Japan | JPY | ¥ |
| India | INR | ₹ |
| South Africa | ZAR | R |

---

## What You Learned Today

1. ✅ How currency detection works in JavaScript
2. ✅ How to use `Intl.NumberFormat` for different currencies
3. ✅ How to add custom currency formatting
4. ✅ How to fix locale-based currency issues
5. ✅ How to set default currency for your store

---

## Key Takeaways

### Currency Detection
- **Browser locale** determines default currency
- **Region code** (e.g., "KE") maps to currency code
- **Fallback** should match your target market

### Custom Formatting
- `Intl.NumberFormat` is powerful but not always perfect
- Custom functions give you full control
- Format prices consistently across your app

### Localization
- Always consider your target market
- Use familiar currency symbols (KSh, $, £)
- Test with different locales

---

## Next Steps

- [ ] Add product detail pages
- [ ] Implement the caching APIs
- [ ] Create checkout page
- [ ] Add currency selector for international customers
- [ ] Connect to Supabase for real data

---

*Notes saved by Buffy (your AI coding assistant)*
*Review this anytime — open this file in VS Code or any text editor*
