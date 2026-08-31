# Lesson 11: Interactive Photo Showcase

## What We Built

Replaced the 4K video showcase with an **interactive product photo showcase** that's smoother and doesn't cause errors.

## Why We Changed It

The video component had issues:
1. **AbortError** — Video play requests were interrupted when React unmounted
2. **Heavy load** — 4K videos are large and slow to load
3. **No product images** — Using a random sample video, not your actual products

## The Solution

Use **your existing product photos** with smooth transitions instead of video.

## How It Works

### 1. **Image Background with Transitions**
```tsx
<AnimatePresence mode="wait">
  <motion.div
    key={activeChapter}
    initial={{ opacity: 0, scale: 1.1 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.95 }}
    transition={{ duration: 0.8, ease: "easeInOut" }}
  >
    <img src={STORY_CHAPTERS[activeChapter].image} />
  </motion.div>
</AnimatePresence>
```

**What this does:**
- Shows one image at a time
- Fades out old image while fading in new one
- Adds subtle zoom effect (110% → 100%)
- Smooth 0.8 second transition

### 2. **Chapter Data with Images**
```tsx
const STORY_CHAPTERS = [
  {
    id: 1,
    title: "Origin",
    image: "/collections/clark.jpeg",  // ← Your product photo
  },
  // ...
];
```

**What this does:**
- Each chapter has its own product image
- Clicking a chapter shows that product
- Stories flow: Origin → Craft → Vision

### 3. **Interactive Navigation**
```tsx
<button onClick={() => setActiveChapter(index)}>
  <div className={activeChapter === index ? "bg-orwas-amber" : "bg-orwas-cream/10"}>
    {chapter.id}
  </div>
  <span>{chapter.title}</span>
</button>
```

**What this does:**
- Click numbered buttons (1, 2, 3) to switch products
- Active chapter highlighted in amber
- Hover effects on inactive chapters

## Key Concepts

### **AnimatePresence**
From Framer Motion — handles exit animations. Without it, old content just disappears.

### **mode="wait"**
Waits for old content to exit before new content enters. Prevents overlapping.

### **scale: 1.1 → 1**
Subtle zoom-in effect. Makes images feel alive and premium.

## Your Product Photos

| Chapter | Image | Product |
|---------|-------|---------|
| Origin | clark.jpeg | Clarks Desert Boot |
| Craft | clark-2.jpeg | Clarks Wallabee |
| Vision | collection-1.jpeg | Urban Essentials |

## Benefits Over Video

| Video | Photo Showcase |
|-------|----------------|
| Large file size | Small file sizes |
| Slow to load | Instant loading |
| Requires playback controls | Just click to navigate |
| Can cause errors | No errors |
| Generic sample video | Your actual products |

## What's Next

- Add more product images to the showcase
- Create a product detail page when user clicks
- Add touch/swipe support for mobile
- Implement lazy loading for performance
