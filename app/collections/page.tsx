"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useStore } from "@/components/StoreProvider";
import { formatPrice, PRODUCT_CATEGORIES } from "@/lib/store";

export default function CollectionsPage() {
  const { products, locale, currency, addToCart } = useStore();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [search, setSearch] = useState("");

  const visibleProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    const byCategory =
      selectedCategory === "All"
        ? products
        : products.filter((product) => product.category === selectedCategory);

    if (!query) return byCategory;

    return byCategory.filter((product) =>
      [product.name, product.collection, product.category, product.description ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [products, selectedCategory, search]);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-orwas-ivory px-6 pb-20 pt-32 text-orwas-ink md:px-12 lg:px-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-3 text-xs uppercase tracking-[0.25em] text-orwas-clay">Collections</p>
              <h1 className="font-display text-5xl md:text-6xl">Shop the edit.</h1>
            </div>
            <p className="max-w-lg text-base leading-relaxed text-orwas-ink/70">
              Quiet essentials, tactile layers, and objects designed for everyday rituals.
            </p>
          </div>

          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setSelectedCategory("All")}
              className={`px-4 py-2 text-[10px] uppercase tracking-[0.2em] transition-colors ${selectedCategory === "All" ? "bg-orwas-ink text-orwas-cream" : "border border-orwas-clay/20 bg-orwas-cream text-orwas-ink"}`}
            >
              All
            </button>
              {PRODUCT_CATEGORIES.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 text-[10px] uppercase tracking-[0.2em] transition-colors ${selectedCategory === category ? "bg-orwas-ink text-orwas-cream" : "border border-orwas-clay/20 bg-orwas-cream text-orwas-ink"}`}
                >
                  {category}
                </button>
              ))}
            </div>
            <div className="relative md:w-72">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products…"
                className="w-full border border-orwas-sand bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition-colors focus:border-orwas-amber"
              />
              <svg className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-orwas-clay" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z" />
              </svg>
            </div>
          </div>

          {visibleProducts.length === 0 && (
            <div className="rounded-sm border border-orwas-sand/60 bg-white px-8 py-16 text-center">
              <p className="font-display text-2xl text-orwas-ink">Nothing matches “{search}”.</p>
              <p className="mt-2 text-sm text-orwas-clay">Try a different search or clear the filters.</p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
            {visibleProducts.map((product) => (
              <article key={product.id} className="group overflow-hidden rounded-sm border border-orwas-clay/15 bg-orwas-cream">
                <Link href={`/products/${product.id}`} className="block">
                  <div className="aspect-[3/4] overflow-hidden bg-orwas-sand/30">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[10px] uppercase tracking-[0.3em] text-orwas-clay">
                        Product
                      </div>
                    )}
                  </div>
                </Link>

                <div className="space-y-4 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="mb-1 text-[10px] uppercase tracking-[0.2em] text-orwas-clay">
                        {product.category}
                      </p>
                      <p className="mb-1 text-[10px] uppercase tracking-[0.18em] text-orwas-clay/80">
                        {product.collection}
                      </p>
                      <Link href={`/products/${product.id}`} className="font-display text-2xl text-orwas-ink">
                        {product.name}
                      </Link>
                    </div>
                    <p className="text-sm text-orwas-ink/75">{formatPrice(product.price, locale, currency)}</p>
                  </div>

                  <button
                    onClick={() => addToCart(product)}
                    className="inline-flex items-center border-b border-orwas-ink/30 pb-1 text-[10px] uppercase tracking-[0.25em] text-orwas-ink transition-colors hover:text-orwas-clay"
                  >
                    {product.inventory > 0 ? "Add to cart" : "Sold out"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
