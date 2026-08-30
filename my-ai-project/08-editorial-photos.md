# Lesson 8: Editorial Photos — Three Pillars

**Date:** August 29, 2026
**Project:** ORWAS (Fashion E-commerce Store)

---

## What We Built

We added real photos to the three pillars of every collection:
1. **Origin Materials** — Natural fiber/wool texture
2. **Considered Making** — Artisan crafting hands
3. **Timeless Form** — Minimalist clothing display

---

## Finding Free-to-Use Photos

### Unsplash (Best Source)
- **URL:** https://unsplash.com
- **License:** Free for commercial use
- **No attribution required**
- **High quality images**

### How to Search
1. Go to Unsplash.com
2. Search for your topic (e.g., "wool texture", "sewing hands")
3. Click on an image
4. Copy the image URL
5. Download or use directly in your code

### Photo IDs We Used
- **Origin Materials:** `photo-1620799140408-edc6dcb6d633` (wool texture)
- **Considered Making:** `photo-1556905055-8f358a7a47b2` (artisan hands)
- **Timeless Form:** `photo-1490481651871-ab68de25d43d` (clothing display)

---

## How to Add Photos to Your Project

### Step 1: Create Folder
```bash
mkdir -p public/editorial
```

### Step 2: Download Images
```bash
curl -L -o public/editorial/origin-materials.jpg "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=1200&q=80"
```

### Step 3: Update Component
```tsx
const EDITORIAL_ITEMS = [
  {
    number: "01",
    title: "Origin Materials",
    image: "/editorial/origin-materials.jpg",  // Add image path
    imageAlt: "Raw materials — natural fibers",
  },
  // ... more items
];
```

### Step 4: Render Image
```tsx
<div className="relative aspect-[4/3] overflow-hidden rounded-sm">
  <img
    src={item.image}
    alt={item.imageAlt}
    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
  />
  <div className="absolute inset-0 bg-gradient-to-t from-orwas-ink/20 to-transparent" />
</div>
```

---

## What We Changed

### Before (Gradient Placeholder)
```tsx
<div className="img-hover flex aspect-[4/3] items-center justify-center rounded-sm bg-gradient-to-br from-orwas-sand/60 via-orwas-cream to-orwas-sand/30">
  <span className="max-w-xs text-center text-sm tracking-[0.18em] text-orwas-clay/50 uppercase">
    {item.imageAlt}
  </span>
</div>
```

### After (Real Photo)
```tsx
<div className="img-hover relative aspect-[4/3] overflow-hidden rounded-sm bg-orwas-sand/30">
  <img
    src={item.image}
    alt={item.imageAlt}
    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
  />
  <div className="absolute inset-0 bg-gradient-to-t from-orwas-ink/20 to-transparent" />
</div>
```

---

## Key Design Decisions

### 1. Aspect Ratio
- Used `aspect-[4/3]` for consistent photo dimensions
- Works well on both mobile and desktop

### 2. Hover Effect
- `group-hover:scale-105` — Image zooms to 105% on hover
- `transition-transform duration-700` — Slow, elegant animation

### 3. Text Readability
- Added gradient overlay: `bg-gradient-to-t from-orwas-ink/20 to-transparent`
- Darkens bottom of image for text contrast
- Keeps text readable over any photo

### 4. Overflow Hidden
- `overflow-hidden` — Prevents image from bleeding outside container
- `rounded-sm` — Subtle border radius

---

## How to Replace with Your Own Photos

### Option 1: Download from Unsplash
1. Find a photo you like on Unsplash
2. Click "Download" (free)
3. Put it in `public/editorial/`
4. Update the `image` path in the component

### Option 2: Use Your Own Photos
1. Put your photos in `public/editorial/`
2. Name them clearly (e.g., `origin-materials.jpg`)
3. Update the `image` path in the component

### Option 3: Use External URLs
```tsx
image: "https://your-cdn.com/photo.jpg",
```
- Works but slower (loads from external server)
- Better to download and host locally

---

## Photo Tips for Fashion Brands

### Origin Materials
- Wool/fiber textures
- Raw cotton, linen
- Natural dyes
- Earth tones

### Considered Making
- Hands crafting
- Sewing machines
- Artisan workshops
- Close-up details

### Timeless Form
- Minimalist clothing racks
- Clean displays
- Neutral colors
- Elegant compositions

---

## What You Learned Today

1. ✅ How to find free-to-use photos (Unsplash)
2. ✅ How to download and organize images
3. ✅ How to replace gradient placeholders with real photos
4. ✅ How to add hover effects to editorial images
5. ✅ How to maintain text readability over images

---

## Key Takeaways

### Photo Selection
- **Consistency** — Photos should match your brand aesthetic
- **Quality** — Use high-resolution images (1200px+ wide)
- **Relevance** — Photos should tell your brand story

### Technical Implementation
- **Local hosting** — Always download photos to `public/` folder
- **Alt text** — Always add descriptive alt text for accessibility
- **Hover effects** — Make images interactive
- **Overlays** — Ensure text readability

### Performance
- **Compress images** — Use TinyPNG or Squoosh
- **Right size** — Don't use 4K images for small displays
- **Lazy loading** — Add `loading="lazy"` for below-fold images

---

## Next Steps

- [ ] Replace photos with your own brand photos
- [ ] Add more editorial sections
- [ ] Create a photo gallery page
- [ ] Implement the caching APIs
- [ ] Connect to Supabase for dynamic content

---

*Notes saved by Buffy (your AI coding assistant)*
*Review this anytime — open this file in VS Code or any text editor*
