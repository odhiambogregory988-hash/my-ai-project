"use client";

import Link from "next/link";

const FOOTER_LINKS = {
  Explore: [
    { label: "New Arrivals", href: "/collections" },
    { label: "Bestsellers", href: "/collections" },
    { label: "Gift Guide", href: "/collections" },
  ],
  Company: [
    { label: "Our Story", href: "/about" },
    { label: "Journal", href: "/journal" },
    { label: "My Account", href: "/dashboard" },
    { label: "Order Tracking", href: "/orders" },
    { label: "Admin", href: "/admin" },
  ],
  Support: [
    { label: "Contact", href: "/contact" },
    { label: "Shipping", href: "/shipping" },
    { label: "Returns", href: "/returns" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-orwas-ink text-orwas-cream px-6 md:px-12 lg:px-20 pt-20 pb-10">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        {/* Brand column */}
        <div className="md:col-span-1">
          <span className="font-display text-2xl tracking-[0.08em]">
            ORWAS
          </span>
          <p className="mt-2 text-[10px] uppercase tracking-[0.3em] text-orwas-amber">
            Orwa Sole Co.
          </p>
          <p className="mt-4 text-orwas-clay text-sm leading-relaxed max-w-xs">
            Premium footwear and considered apparel, crafted to endure. Where
            heritage meets the contemporary.
          </p>
        </div>

        {/* Link columns */}
        {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
          <div key={heading}>
            <h4 className="text-xs tracking-[0.2em] uppercase text-orwas-clay mb-6">
              {heading}
            </h4>
            <ul className="flex flex-col gap-3">
              {links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-orwas-cream/60 hover:text-orwas-cream transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Newsletter */}
      <div className="border-t border-orwas-cream/10 pt-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h4 className="text-sm tracking-widest uppercase mb-1">
            Join the collection
          </h4>
          <p className="text-orwas-clay text-xs">
            Early access, new drops, and the stories behind the craft.
          </p>
        </div>
        <form
          className="flex w-full md:w-auto"
          onSubmit={(e) => e.preventDefault()}
        >
          <input
            type="email"
            placeholder="your@email.com"
            className="bg-transparent border border-orwas-cream/20 text-orwas-cream px-5 py-3 text-sm w-full md:w-72 placeholder:text-orwas-clay/50 focus:outline-none focus:border-orwas-amber transition-colors duration-300"
          />
          <button
            type="submit"
            className="bg-orwas-amber text-orwas-ink px-6 py-3 text-xs tracking-widest uppercase font-medium hover:bg-orwas-amber-light transition-colors duration-300"
          >
            Subscribe
          </button>
        </form>
      </div>

      {/* Bottom bar */}
      <div className="mt-10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-orwas-clay/50">
        <p>© {new Date().getFullYear()} Orwa Sole Co. All rights reserved.</p>
        <div className="flex gap-6">
          <Link href="/privacy" className="hover:text-orwas-cream transition-colors">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-orwas-cream transition-colors">
            Terms
          </Link>
        </div>
      </div>
    </footer>
  );
}
