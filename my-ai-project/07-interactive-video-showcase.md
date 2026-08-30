# Lesson 7: Interactive 4K Video Showcase

**Date:** August 28, 2026
**Project:** ORWAS (Fashion E-commerce Store)

---

## What We Built

We created an interactive 4K video showcase that tells the ORWAS brand story. Users can play/pause, mute/unmute, and navigate through chapters.

---

## Key Features

### 1. Video Background
```tsx
<video
  ref={videoRef}
  className="w-full h-full object-cover"
  muted={isMuted}
  loop
  playsInline
>
  <source src={videoUrl} type="video/mp4" />
</video>
```

**Key concepts:**
- `ref={videoRef}` — Reference to control the video
- `muted={isMuted}` — Mute state controlled by React
- `loop` — Video repeats automatically
- `playsInline` — Plays inline on mobile (not fullscreen)

### 2. Video Controls
```tsx
const togglePlay = () => {
  if (videoRef.current) {
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  }
};
```

**Controls:**
- Play/Pause button
- Mute/Unmute button
- Chapter navigation

### 3. Chapter Navigation
```tsx
const STORY_CHAPTERS = [
  {
    id: 1,
    title: "Origin",
    subtitle: "Where it all began",
    description: "Born from heritage materials...",
    timestamp: 0,
  },
  {
    id: 2,
    title: "Craft",
    subtitle: "The making process",
    description: "Each piece is carefully constructed...",
    timestamp: 15,
  },
  {
    id: 3,
    title: "Vision",
    subtitle: "Our philosophy",
    description: "Where craft meets curation...",
    timestamp: 30,
  },
];
```

**How it works:**
- Each chapter has a timestamp
- Clicking a chapter jumps to that time
- Animated transitions between chapters

### 4. Interactive Elements
```tsx
// Play/Pause
<button onClick={togglePlay}>
  {isPlaying ? (
    <svg>/* Pause icon */</svg>
  ) : (
    <svg>/* Play icon */</svg>
  )}
</button>

// Mute/Unmute
<button onClick={toggleMute}>
  {isMuted ? (
    <svg>/* Muted icon */</svg>
  ) : (
    <svg>/* Unmuted icon */</svg>
  )}
</button>
```

### 5. Framer Motion Animations
```tsx
<motion.div
  initial={{ opacity: 0, y: -20 }}
  animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : -20 }}
  transition={{ duration: 0.8, delay: 0.3 }}
>
  {/* Content */}
</motion.div>
```

**Animations:**
- Fade in on load
- Slide up/down effects
- Chapter transitions
- Staggered delays

---

## How to Replace with Your 4K Video

### Step 1: Upload Your Video
Put your 4K video in the `public/videos/` folder:
```
public/
├── videos/
│   └── orwas-story.mp4
```

### Step 2: Update the Video URL
```tsx
// Before (sample video)
const videoUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4";

// After (your video)
const videoUrl = "/videos/orwas-story.mp4";
```

### Step 3: Update Chapter Timestamps
Adjust the timestamps to match your video:
```tsx
const STORY_CHAPTERS = [
  {
    id: 1,
    title: "Origin",
    timestamp: 0,  // Start of chapter 1
  },
  {
    id: 2,
    title: "Craft",
    timestamp: 30,  // Start of chapter 2 (30 seconds in)
  },
  {
    id: 3,
    title: "Vision",
    timestamp: 60,  // Start of chapter 3 (60 seconds in)
  },
];
```

---

## User Interactions

### 1. Play/Pause
- Click the play button to start the video
- Click again to pause
- Video loops automatically

### 2. Mute/Unmute
- Click the speaker icon to toggle sound
- Muted by default (better UX)

### 3. Chapter Navigation
- Click chapter buttons (1, 2, 3)
- Video jumps to that chapter's timestamp
- Title and description animate in

### 4. Scroll Indicator
- Animated pulse effect
- Guides users to scroll down

---

## Responsive Design

### Mobile
- Full-screen video
- Controls at bottom
- Chapter titles centered

### Desktop
- Full-screen video
- Controls at bottom
- Chapter navigation on left

---

## Performance Tips

### 1. Video Optimization
- Compress your 4K video (use HandBrake)
- Aim for 10-20MB for web
- Use MP4 format (H.264 codec)

### 2. Lazy Loading
```tsx
<video
  loading="lazy"  // Load video when needed
  preload="none"  // Don't preload
>
```

### 3. Poster Image
```tsx
<video
  poster="/collections/clark.jpeg"  // Show image before video loads
>
```

---

## What You Learned Today

1. ✅ How to create interactive video components
2. ✅ How to use HTML5 video API
3. ✅ How to add chapter navigation
4. ✅ How to use Framer Motion for animations
5. ✅ How to create immersive brand experiences
6. ✅ How to make videos responsive

---

## Key Takeaways

### Video UX
- **Mute by default** — Users prefer muted videos
- **Play button prominent** — Make it easy to start
- **Chapter navigation** — Let users skip ahead
- **Poster image** — Show something before video loads

### Performance
- **Compress videos** — Smaller files = faster loading
- **Lazy loading** — Don't load until needed
- **Mobile optimization** — Different sizes for different devices

### Brand Storytelling
- **Chapters** — Break story into digestible parts
- **Visual hierarchy** — Title > Subtitle > Description
- **Animation** — Make transitions smooth and engaging

---

## Next Steps

- [ ] Upload your 4K video to `public/videos/`
- [ ] Update chapter timestamps to match your video
- [ ] Add product detail pages
- [ ] Implement the caching APIs
- [ ] Create checkout page

---

*Notes saved by Buffy (your AI coding assistant)*
*Review this anytime — open this file in VS Code or any text editor*
