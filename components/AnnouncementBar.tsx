"use client";

import { useEffect, useState } from "react";

const MESSAGES = [
  "Complimentary delivery on orders over KSh 10,000",
  "New season — the Clarks Heritage Drop has landed",
  "Crafted in Kenya for the long walk ahead",
];

/**
 * Rotating storefront announcement bar.
 * Pure CSS crossfade — no animation library, so this ships in the header chunk
 * without pulling in framer-motion.
 */
export default function AnnouncementBar() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % MESSAGES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative overflow-hidden border-b border-orwas-amber/30 bg-orwas-ink">
      <div className="absolute inset-y-0 left-0 w-1 bg-orwas-amber" />
      <div className="flex items-center justify-center gap-3 px-6 py-2.5">
        <span className="hidden text-orwas-amber sm:inline" aria-hidden="true">
          ✦
        </span>
        <p
          key={index}
          className="announcement-crossfade text-center text-[10px] uppercase tracking-[0.28em] text-orwas-cream"
        >
          {MESSAGES[index]}
        </p>
        <span className="hidden text-orwas-amber sm:inline" aria-hidden="true">
          ✦
        </span>
      </div>
    </div>
  );
}
