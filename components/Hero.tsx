"use client";

import { motion } from "framer-motion";
import Button from "@/components/ui/Button";

const STAGGER = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15, delayChildren: 0.3 },
  },
};

const FADE_UP = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
  },
};

export default function Hero() {
  return (
    <section className="relative flex h-screen min-h-[620px] items-end overflow-hidden px-6 pb-20 md:px-12 md:pb-28 lg:px-20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(200,169,110,0.28),_transparent_36%),linear-gradient(135deg,#191612_0%,#2a221d_32%,#53473c_100%)]" />
      <div className="absolute inset-0 opacity-[0.08] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iMSIvPjwvc3ZnPg==')]" />
      <div className="absolute -left-24 top-20 h-72 w-72 rounded-full bg-orwas-amber/15 blur-3xl" />
      <div className="absolute bottom-8 right-10 h-80 w-80 rounded-full bg-orwas-clay/20 blur-3xl" />

      <motion.div
        className="relative z-10 max-w-4xl"
        variants={STAGGER}
        initial="hidden"
        animate="visible"
      >
        <motion.p
          variants={FADE_UP}
          className="mb-6 text-xs uppercase tracking-[0.32em] text-orwas-amber"
        >
          Autumn / Winter 2026
        </motion.p>

        <motion.h1
          variants={FADE_UP}
          className="mb-7 font-display text-display-xl text-orwas-cream"
        >
          Where Craft
          <br />
          <em className="text-orwas-amber-light">Meets Curation</em>
        </motion.h1>

        <motion.p
          variants={FADE_UP}
          className="mb-10 max-w-xl text-lg leading-relaxed text-orwas-cream/70"
        >
          Thoughtful silhouettes, enduring materials, and the quiet confidence of pieces
          designed to stay with you for years.
        </motion.p>

        <motion.div variants={FADE_UP} className="flex flex-wrap gap-4">
          <Button href="/collections" variant="ghost" className="!border-orwas-cream/30 !text-orwas-cream hover:!bg-orwas-cream hover:!text-orwas-ink">
            Explore the collection →
          </Button>
          <Button href="/journal" variant="underline" className="!text-orwas-cream !border-orwas-cream/30 hover:!text-orwas-amber">
            Read journal
          </Button>
        </motion.div>
      </motion.div>

      <motion.div
        className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
      >
        <span className="text-[10px] uppercase tracking-[0.3em] text-orwas-cream/35">Scroll</span>
        <div className="h-8 w-px bg-gradient-to-b from-orwas-cream/30 to-transparent" />
      </motion.div>
    </section>
  );
}
