"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "@/components/ui/Button";

const STORY_CHAPTERS = [
  {
    id: 1,
    title: "Origin",
    subtitle: "Where it all began",
    description: "Born from heritage materials and contemporary vision in the heart of Nairobi.",
    timestamp: 0,
  },
  {
    id: 2,
    title: "Craft",
    subtitle: "The making process",
    description: "Each piece is carefully constructed with attention to detail and quality materials.",
    timestamp: 15,
  },
  {
    id: 3,
    title: "Vision",
    subtitle: "Our philosophy",
    description: "Where craft meets curation — a collection that tells stories of origin.",
    timestamp: 30,
  },
];

export default function VideoShowcase() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [activeChapter, setActiveChapter] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Use a sample video (replace with your 4K video URL)
  const videoUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4";

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 500);
    return () => clearTimeout(timer);
  }, []);

  // Cleanup video on unmount to prevent AbortError
  useEffect(() => {
    const video = videoRef.current;
    return () => {
      if (video) {
        video.pause();
        video.removeAttribute('src');
        video.load();
      }
    };
  }, []);

  const togglePlay = () => {
    if (videoRef.current) {
      try {
        if (isPlaying) {
          videoRef.current.pause();
        } else {
          videoRef.current.play().catch(() => {
            // Ignore abort errors from rapid interactions
          });
        }
        setIsPlaying(!isPlaying);
      } catch {
        // Ignore errors
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleChapterClick = (index: number) => {
    setActiveChapter(index);
    if (videoRef.current) {
      videoRef.current.currentTime = STORY_CHAPTERS[index].timestamp;
      if (!isPlaying) {
        videoRef.current.play().catch(() => {
          // Ignore abort errors from rapid interactions
        });
        setIsPlaying(true);
      }
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
  };

  return (
    <section className="relative h-screen min-h-[600px] overflow-hidden bg-orwas-ink">
      {/* Video Background */}
      <div 
        ref={containerRef}
        className="absolute inset-0"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setShowControls(true)}
      >
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          muted={isMuted}
          loop
          playsInline
          onLoadedData={() => setIsLoaded(true)}
          poster="/collections/clark.jpeg"
        >
          <source src={videoUrl} type="video/mp4" />
        </video>

        {/* Video Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-orwas-ink via-orwas-ink/30 to-orwas-ink/60" />

        {/* Grain Texture */}
        <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iMSIvPjwvc3ZnPg==')]" />
      </div>

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
            <span className="text-orwas-cream/60 text-xs">4K Experience</span>
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
                onClick={() => handleChapterClick(index)}
                className={`flex items-center gap-2 transition-all duration-300 ${
                  activeChapter === index
                    ? "text-orwas-amber"
                    : "text-orwas-cream/40 hover:text-orwas-cream/70"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${
                    activeChapter === index
                      ? "bg-orwas-amber text-orwas-ink"
                      : "bg-orwas-cream/10 text-orwas-cream/60"
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

          {/* Video Controls */}
          <div className="flex items-center gap-4">
            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              className="w-12 h-12 rounded-full bg-orwas-cream/10 hover:bg-orwas-cream/20 flex items-center justify-center transition-colors duration-300"
              aria-label={isPlaying ? "Pause video" : "Play video"}
            >
              {isPlaying ? (
                <svg className="w-5 h-5 text-orwas-cream" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-orwas-cream ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            {/* Mute/Unmute */}
            <button
              onClick={toggleMute}
              className="w-10 h-10 rounded-full bg-orwas-cream/10 hover:bg-orwas-cream/20 flex items-center justify-center transition-colors duration-300"
              aria-label={isMuted ? "Unmute video" : "Mute video"}
            >
              {isMuted ? (
                <svg className="w-4 h-4 text-orwas-cream" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-orwas-cream" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
              )}
            </button>

            {/* CTA Button */}
            <Button 
              href="/collections" 
              variant="ghost" 
              className="!text-orwas-cream !border-orwas-cream/30 hover:!bg-orwas-cream hover:!text-orwas-ink"
            >
              Explore Collection →
            </Button>
          </div>
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
