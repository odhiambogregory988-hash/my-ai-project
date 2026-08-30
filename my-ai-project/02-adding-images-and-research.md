# Lesson 2: Adding Images & Researching Products

**Date:** August 28, 2026
**Project:** ORWAS (Fashion E-commerce Store)

---

## How to Add Images to a Next.js Project

### Step 1: Put images in the `public/` folder
```
public/
├── collections/
│   ├── clark.jpeg
│   ├── wakadinali.jpeg
│   └── collection-1.jpeg
```

**Why `public/`?**
- Next.js serves files from this folder directly
- You can access them with `/collections/clark.jpeg` in your code
- It's like the "front desk" — anything here is publicly accessible

### Step 2: Use images in your components
```tsx
<img
  src="/collections/clark.jpeg"
  alt="Clarks Desert Boot"
  className="h-full w-full object-cover"
/>
```

**Key points:**
- `src="/collections/clark.jpeg"` — Path relative to `public/` folder
- `alt="..."` — Description for screen readers (accessibility)
- `object-cover` — Makes image fill the container without stretching

---

## How We Added 7 Images

### Files we copied:
1. `clark.jpeg` → `public/collections/clark.jpeg`
2. `wakadinali.jpeg` → `public/collections/wakadinali.jpeg`
3. `clark-2.jpeg` → `public/collections/clark-2.jpeg`
4. `collection-1.jpeg` through `collection-4.jpeg`

### How we copied them:
```bash
cp "C:/Users/ADMIN/Downloads/whatsapp/clark.jpeg" "public/collections/clark.jpeg"
```

---

## How to Research Products Online

When you're not sure what something is, search for it!

### Example: "Clark" → Actually "Clarks"
**What we searched:** "Clark brand fashion Kenya"
**What we found:** Clarks is a British shoe brand famous for:
- Desert Boots (iconic since 1950)
- Wallabees (suede loafers)
- Torhill (modern classic)

### Example: "Wakadinali" → Kenyan Hip-Hop Group
**What we searched:** "Wakadinali Kenya"
**What we found:** Not a fashion brand — a hip-hop trio:
- Scar Mkadinali
- Domani Munga
- Sewersydaa
- Known for their signature Adidas tracksuits

### Why This Matters
- You want accurate product names on your store
- Research helps you write better descriptions
- Customers trust stores that know their products

---

## How We Updated the Collection Names

### Before (generic):
```tsx
{
  image: "/collections/clark.jpeg",
  title: "Clark",
  description: "Heritage collection piece",
}
```

### After (researched and accurate):
```tsx
{
  image: "/collections/clark.jpeg",
  title: "Clarks Desert Boot",
  description: "British heritage footwear — iconic since 1950",
}
```

---

## The `map()` Pattern (How We Display Arrays)

When you have a list of items, use `map()` to render each one:

```tsx
const COLLECTIONS = [
  { title: "Clarks", image: "/collections/clark.jpeg" },
  { title: "Wakadinali", image: "/collections/wakadinali.jpeg" },
];

{COLLECTIONS.map((item) => (
  <div key={item.title}>
    <img src={item.image} alt={item.title} />
    <h3>{item.title}</h3>
  </div>
))}
```

**Key concepts:**
- `map()` — Loops through an array and creates JSX for each item
- `key={item.title}` — React needs a unique identifier for each item
- `{item.title}` — Access properties of the object

---

## Tailwind Hover Effects

We added smooth hover effects to the collection cards:

```tsx
className="group relative transition-transform duration-500 hover:-translate-y-1"
```

Break it down:
- `group` — Enables group hover (child elements respond to parent hover)
- `relative` — Position context for absolute children
- `transition-transform duration-500` — Smooth animation (500ms)
- `hover:-translate-y-1` — Move up 4px on hover

For images inside the group:
```tsx
className="transition-transform duration-500 group-hover:scale-105"
```
- `group-hover:scale-105` — Zoom to 105% when parent is hovered

---

## What You Learned Today

1. ✅ How to add images to a Next.js project
2. ✅ How to use images in React components
3. ✅ How to research products online for accurate naming
4. ✅ How to use `map()` to render arrays of data
5. ✅ How Tailwind hover effects work

---

## Key Takeaways

### Image Files
- Always put images in `public/` folder
- Use descriptive filenames (no spaces, lowercase)
- Always add `alt` text for accessibility

### Research
- Never guess product names — search first
- Good descriptions sell products
- Accurate information builds trust

### Code Patterns
- `map()` is your friend for lists
- `key` is required for React lists
- Hover effects make your site feel alive

---

## Next Steps

- [ ] Make the collections clickable (link to detail pages)
- [ ] Add more hover effects and animations
- [ ] Learn how to fetch data from Supabase
- [ ] Build a product detail page

---

*Notes saved by Buffy (your AI coding assistant)*
*Review this anytime — open this file in VS Code or any text editor*
