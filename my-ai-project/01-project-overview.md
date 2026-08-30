# Lesson 1: Understanding Your Project Structure

**Date:** August 26, 2026
**Project:** ORWAS (Fashion E-commerce Store)

---

## What You Have

You have a **Next.js + React** website for a fashion brand called ORWAS. It's a store where people can browse collections, view products, and buy things.

---

## The Folder Structure (explained simply)

```
orwas-frontend/
├── app/              ← Your PAGES (each file = a URL on your website)
├── components/       ← Your REUSABLE PIECES (headers, buttons, cards)
├── lib/              ← Your HELPER CODE (database, authentication)
├── node_modules/     ← CODE OTHER PEOPLE WROTE (you never edit this)
├── .next/            ← TEMPORARY BUILD FILES (auto-generated, ignore)
├── .vscode/          ← YOUR EDITOR SETTINGS
├── public/           ← IMAGES AND STATIC FILES
└── package.json      ← YOUR PROJECT'S IDENTITY CARD
```

---

## The Tech Stack (what each tool does)

### 1. Next.js — The Framework
- **What:** The main structure of your website
- **Why:** It handles routing (which page shows when someone visits a URL), builds your site, and makes it fast
- **Think of it as:** The architect who designs how rooms connect

### 2. React — The UI Library
- **What:** Lets you build interactive, reusable pieces of your website
- **Why:** Instead of one giant HTML file, you break your page into small "components" that you can reuse
- **Think of it as:** LEGO bricks — each component is a brick you can snap together
- **Key concept:** "Components" — small, self-contained pieces of UI

### 3. Tailwind CSS — The Styling
- **What:** Makes your website look good (colors, spacing, fonts, layouts)
- **Why:** Instead of writing long CSS files, you add short classes directly in your HTML/JSX
- **Example:** `className="text-orwas-cream font-display text-2xl"` — this makes text cream-colored, use the display font, and be extra large
- **Think of it as:** A paint palette and ruler — you're decorating the building

### 4. Supabase — The Database + Auth
- **What:** Stores your data (products, users, orders) and handles user accounts (login/signup)
- **Why:** You need somewhere to save data that isn't just a file on your computer
- **Think of it as:** A filing cabinet (database) + a security guard (authentication)

### 5. Framer Motion — The Animations
- **What:** Makes things move beautifully (fade in, slide up, etc.)
- **Why:** Adds polish and professional feel to your site
- **Example:** In `Hero.tsx`, the text fades in one line at a time with a stagger effect
- **Think of it as:** An interior decorator who adds movement

### 6. TypeScript — The Safety Net
- **What:** JavaScript with added rules to catch errors before they happen
- **Why:** Prevents bugs — if you try to use a number as text, TypeScript warns you
- **Think of it as:** Spell-checker for your code

---

## Key Files Explained

### `app/page.tsx` — Your Home Page
This is the **entry point** — what people see when they visit your website.

```tsx
import Header from "@/components/Header"    // Import the header
import Hero from "@/components/Hero"        // Import the hero section

export default function HomePage() {       // This function IS your page
  return (
    <>
      <Header />           {/* Navigation bar at the top */}
      <main>
        <Hero />           {/* Big hero image/text */}
        <Editorial />      {/* Story section */}
        <Marquee />        {/* Scrolling text */}
        <FeaturedProducts /> {/* Product cards */}
        <CollectionsGrid />  {/* Collection cards */}
        <Manifesto />      {/* Brand story */}
      </main>
      <Footer />           {/* Bottom of page */}
    </>
  );
}
```

**Key concepts:**
- `import` — Bring in code from another file
- `export default` — Make this function available to other files
- `<>...</>` — React Fragment (a wrapper that doesn't add extra HTML)
- `<Component />` — Render a component (like placing furniture in a room)

---

### `components/Header.tsx` — Navigation Bar
This component handles:
1. The logo ("ORWAS")
2. Navigation links (Collections, Journal, About)
3. Mobile menu (hamburger button)
4. Shopping cart

**Key concepts:**
- `"use client"` — This component runs in the browser (not on the server)
- `useState` — React's way of remembering things (like "is the mobile menu open?")
- `onClick` — What happens when you click something

---

### `tailwind.config.ts` — Your Design System
This file defines your brand's look:
- **Colors:** `orwas-ink` (#1a1714), `orwas-cream` (#f5f0eb), `orwas-amber` (#c8a96e)
- **Fonts:** Playfair Display (display), Inter (body)
- **Animations:** fade-up, marquee, reveal-line

---

## How to Read This Code

### The `className` Pattern
In React with Tailwind, you style things with `className`:
```tsx
<h1 className="text-orwas-cream font-display text-2xl">
  Hello World
</h1>
```

Break it down:
- `text-orwas-cream` — Set text color to cream
- `font-display` — Use the display font (Playfair Display)
- `text-2xl` — Make text extra large

### The Component Pattern
Every component follows this pattern:
```tsx
"use client";                    // Optional: runs in browser

import Something from "somewhere"; // Bring in dependencies

export default function MyComponent() {  // The function name = component name
  return (
    <div className="...">
      {/* What you see on screen */}
    </div>
  );
}
```

---

## What You Learned Today

1. ✅ Project structure — what each folder does
2. ✅ Tech stack — what each tool does and why you use it
3. ✅ How to read a Next.js/React file
4. ✅ The `className` pattern with Tailwind
5. ✅ The component pattern in React

---

## Next Steps

- [ ] Learn how `useState` works (making things interactive)
- [ ] Build a new component together
- [ ] Understand how routing works (different pages)
- [ ] Learn how Supabase connects to your app

---

*Notes saved by Buffy (your AI coding assistant)*
*Review this anytime — open this file in VS Code or any text editor*
