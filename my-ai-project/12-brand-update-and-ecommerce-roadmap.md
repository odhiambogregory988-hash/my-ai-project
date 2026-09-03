# Lesson 12 — Brand Update + Full E-commerce Roadmap

> Session 15 · September 3, 2026

## What we built

You gave me a **brand design** (new colors) and a **development roadmap** with page
screenshots. We applied all of it to your site:

### 1. New brand colors (applied everywhere)

| Name | Hex | Used for |
|------|-----|----------|
| Primary | `#111827` | Dark backgrounds, buttons, headings |
| Gold | `#D4AF37` | Accents, highlights, labels |
| Accent | `#8B5E3C` | Secondary text, hovers |
| Background | `#F9FAFB` | Page background |
| Text | `#1F2937` | Body text |

**The trick:** we didn't change every component. We updated the color *definitions*
in `tailwind.config.ts` — so every class like `bg-orwas-ink` or `text-orwas-amber`
automatically uses the new colors. Change once, update everywhere.

### 2. The full page map (from your screenshots)

```
Public      Home · About · Shop · Product Details · Contact
Customer    Register · Login · Dashboard · Orders
Admin       Dashboard · Product Mgmt · Customer Mgmt · Order Mgmt
```

Every one of those pages now exists and is linked in the header.

### 3. A working customer → order loop (demo)

1. **Register** at `/register` — account is saved in the browser
2. **Add to cart** → **Proceed to Checkout**
3. Not signed in? You get sent to login and your bag is saved
4. Order is created → shows in **your Orders** page with a status timeline
5. Admin sees it in **Order Management** and can change status
   (Processing → Shipped → Delivered)

## Concepts you learned

- **Design tokens** — define colors once, reuse everywhere (Tailwind config)
- **Routing** — every folder inside `app/` is a page (`/contact`, `/login`, …)
- **Client vs server** — pages that read the browser (`localStorage`) need `"use client"`
- **Suspense** — Next.js requires pages using `useSearchParams` to wrap in `<Suspense>` (this was the build error we fixed)
- **Demo layer vs real backend** — today's accounts/orders live in the browser so you can test the full flow; your partner's real APIs replace them later

## What's next (roadmap Phase 6)

- Move accounts/orders from localStorage → Supabase (real database)
- Deploy to Vercel + connect custom domain
- SEO and security testing