"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "@/components/ui/Button";

const STORY_CHAPTERS = [
  {
    id: 1,
    title: "Origin",
    subtitle: "Where it all began",
    description: "Born from heritage materials and contemporary vision in the heart of Nairobi.",
    image: "/collections/clark.jpeg",
  },
  {
    id: 2,
    title: "Craft",
    subtitle: "The making process",
    description: "Each piece is carefully constructed with attention to detail and quality materials.",
    image: "/collections/clark-2.jpeg",
  },
  {
    id: 3,
    title: "Vision",
    subtitle: "Our philosophy",
    description: "Where craft meets curation — a collection that tells stories of origin.",
    image: "/collections/collection-1.jpeg",
  },
];

export default function VideoShowcase() {
  const [activeChapter, setActiveChapter] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  useState(() => {
    const timer = setTimeout(() => setIsLoaded(true), 500);
    return () => clearTimeout(timer);
  });

  return (
    <section className="relative h-screen min-h-[600px] overflow-hidden bg-orwas-ink">
      {/* Background Image */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeChapter}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <img
            src={STORY_CHAPTERS[activeChapter].image}
            alt={STORY_CHAPTERS[activeChapter].title}
            className="w-full h-full object-cover"
            onLoad={() => setImageLoaded(true)}
          />
        </motion.div>
      </AnimatePresence>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-orwas-ink via-orwas-ink/40 to-orwas-ink/60" />

      {/* Grain Texture */}
      <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iMSIvPjwvc3ZnPg==')] pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-between p-6 md:p-12 lg:p-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : -20 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex items-center justify-between"
        >
          <div>
            <p className="text-orwas-amber text-[10px] tracking-[0.3em] uppercase mb-2">
              Our Story
            </p>
            <h2 className="text-display-md font-display text-orwas-cream">
              The Making of ORWAS
            </h2>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <span className="text-orwas-cream/60 text-xs">Interactive</span>
            <div className="w-2 h-2 rounded-full bg-orwas-amber animate-pulse" />
          </div>
        </motion.div>

        {/* Center Content */}
        <div className="flex-1 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeChapter}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-2xl"
            >
              <p className="text-orwas-amber text-xs tracking-[0.3em] uppercase mb-4">
                Chapter {STORY_CHAPTERS[activeChapter].id} — {STORY_CHAPTERS[activeChapter].subtitle}
              </p>
              <h3 className="text-display-lg font-display text-orwas-cream mb-6">
                {STORY_CHAPTERS[activeChapter].title}
              </h3>
              <p className="text-orwas-cream/70 text-lg leading-relaxed max-w-lg mx-auto">
                {STORY_CHAPTERS[activeChapter].description}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="flex flex-col md:flex-row items-center justify-between gap-6"
        >
          {/* Chapter Navigation */}
          <div className="flex items-center gap-4">
            {STORY_CHAPTERS.map((chapter, index) => (
              <button
                key={chapter.id}
                onClick={() => setActiveChapter(index)}
                className={`flex items-center gap-2 transition-all duration-300 ${
                  activeChapter === index
                    ? "text-orwas-amber"
                    : "text-orwas-cream/40 hover:text-orwas-cream/70"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs transition-all duration-300 ${
                    activeChapter === index
                      ? "bg-orwas-amber text-orwas-ink scale-110"
                      : "bg-orwas-cream/10 text-orwas-cream/60 hover:bg-orwas-cream/20"
                  }`}
                >
                  {chapter.id}
                </div>
                <span className="hidden md:inline text-xs uppercase tracking-wider">
                  {chapter.title}
                </span>
              </button>
            ))}
          </div>

          {/* CTA Button */}
          <Button
            href="/collections"
            variant="ghost"
            className="!text-orwas-cream !border-orwas-cream/30 hover:!bg-orwas-cream hover:!text-orwas-ink"
          >
            Explore Collection →
          </Button>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoaded ? 1 : 0 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-orwas-cream/30 text-[10px] tracking-[0.3em] uppercase">
          Scroll
        </span>
        <div className="w-px h-8 bg-gradient-to-b from-orwas-cream/30 to-transparent" />
      </motion.div>
    </section>
  );
}
