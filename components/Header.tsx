"use client";

import Link from "next/link";
import { useState } from "react";
import { useStore } from "@/components/StoreProvider";
import CartDrawer from "@/components/CartDrawer";

const NAV_LINKS = [
  { label: "Shop", href: "/collections" },
  { label: "Journal", href: "/journal" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Account", href: "/dashboard" },
  { label: "Admin", href: "/admin" },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const { cartCount } = useStore();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-orwas-ink/90 backdrop-blur-md">
      <nav className="flex items-center justify-between px-6 md:px-12 lg:px-20 py-6">
        {/* Brand mark */}
        <Link href="/" className="relative z-10">
          <span className="text-orwas-cream font-display text-2xl tracking-[0.08em]">
            ORWAS
          </span>
        </Link>

        {/* Desktop nav */}
        <ul className="hidden lg:flex items-center gap-7">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-orwas-cream/70 hover:text-orwas-cream text-xs tracking-[0.2em] uppercase transition-colors duration-300"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-5">
          <button onClick={() => setCartOpen(true)} className="text-orwas-cream text-xs uppercase tracking-[0.2em]" aria-label="Open shopping cart">
            Cart ({cartCount})
          </button>
          <button className="lg:hidden relative z-10 flex flex-col gap-1.5" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
            <span className={`block w-6 h-px bg-orwas-cream transition-all duration-300 ${mobileOpen ? "rotate-45 translate-y-[4px]" : ""}`} />
            <span className={`block w-6 h-px bg-orwas-cream transition-all duration-300 ${mobileOpen ? "-rotate-45 -translate-y-[4px]" : ""}`} />
          </button>
        </div>
      </nav>

      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 bg-orwas-ink/95 backdrop-blur-md transition-all duration-500 lg:hidden ${
          mobileOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <ul className="flex flex-col items-center justify-center h-full gap-10">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="text-orwas-cream font-display text-3xl tracking-wide hover:text-orwas-amber transition-colors duration-300"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </header>
  );
}
