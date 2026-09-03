"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const MESSAGES = [
  "Complimentary delivery on orders over KSh 10,000",
  "New season — the Clarks Heritage Drop has landed",
  "Crafted in Kenya for the long walk ahead",
];

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
        <AnimatePresence mode="wait">
          <motion.p
            key={index}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="text-center text-[10px] uppercase tracking-[0.28em] text-orwas-cream"
          >
            {MESSAGES[index]}
          </motion.p>
        </AnimatePresence>
        <span className="hidden text-orwas-amber sm:inline" aria-hidden="true">
          ✦
        </span>
      </div>
    </div>
  );
}