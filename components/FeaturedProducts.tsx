"use client";

import Link from "next/link";
import Section from "@/components/ui/Section";
import { formatPrice } from "@/lib/store";
import { useStore } from "@/components/StoreProvider";
import Button from "@/components/ui/Button";

export default function FeaturedProducts() {
  const { products, locale, currency, addToCart } = useStore();

  return (
    <Section label="Featured Pieces" className="py-section overflow-hidden">
      <h2 className="text-display-lg font-display text-orwas-ink mb-12 reveal">
        Object <span className="text-orwas-clay italic">&amp; Form</span>
      </h2>

      {/* Horizontal scroll */}
      <div className="flex gap-6 overflow-x-auto pb-4 -mx-6 px-6 md:-mx-12 md:px-12 lg:-mx-20 lg:px-20 snap-x snap-mandatory scrollbar-hide">
        {products.map((product) => (
          <div
            key={product.id}
            className="group snap-start shrink-0 w-64 md:w-72 flex flex-col gap-4 reveal"
          >
            <div className="img-hover aspect-[3/4] bg-orwas-sand/30 rounded-sm relative overflow-hidden">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-orwas-clay text-[10px] uppercase tracking-[0.3em]">
                  Product
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-orwas-ink/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <span className="text-orwas-cream text-xs tracking-wider">
                  Quick View
                </span>
              </div>
            </div>

            {/* Details */}
            <Link href={`/products/${product.id}`}>
              <p className="mb-1 text-[10px] uppercase tracking-[0.2em] text-orwas-clay">
                {product.category}
              </p>
              <p className="mb-1 text-orwas-clay text-xs tracking-wider">
                {product.collection}
              </p>
              <h3 className="text-orwas-ink text-sm font-medium mb-1 group-hover:text-orwas-amber transition-colors duration-300">
                {product.name}
              </h3>
              <p className="text-orwas-clay text-sm">{formatPrice(product.price, locale, currency)}</p>
            </Link>
            <Button
              variant="underline"
              className="self-start text-xs"
              onClick={() => addToCart(product)}
            >
              {product.inventory > 0 ? "Add to cart" : "Sold out"}
            </Button>
          </div>
        ))}
      </div>
    </Section>
  );
}
