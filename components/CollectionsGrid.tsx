"use client";

import Link from "next/link";
import Image from "next/image";
import Section from "@/components/ui/Section";
import Button from "@/components/ui/Button";
import { useStore } from "@/components/StoreProvider";
import { Product } from "@/lib/store";
import { resolveSeasonItem } from "@/lib/season";
import { usePublishedSeason } from "@/lib/usePublishedSeason";

const EXPLORE_ITEMS = [
  {
    href: "/collections",
    title: "Products",
    eyebrow: "Curated edit",
    description: "Browse pieces chosen for craft, restraint, and everyday ritual.",
  },
  {
    href: "/about",
    title: "About",
    eyebrow: "Our story",
    description: "Learn how Orwas blends heritage, material, and quiet modern living.",
  },
  {
    href: "/journal",
    title: "Journal",
    eyebrow: "Notes & ideas",
    description: "Read the thinking behind the collections, materials, and makers.",
  },
];

export default function CollectionsGrid() {
  const { addToCart, products } = useStore();
  const { season } = usePublishedSeason();

  const pieces = season.items.map((item) => ({
    item,
    product: resolveSeasonItem(item, products),
  }));

  const handleAddToCart = (product: Product) => addToCart(product);

  return (
    <Section label="Explore" className="py-section bg-orwas-cream content-auto">
      <div className="flex flex-col gap-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <h2 className="text-display-lg font-display text-orwas-ink reveal">
            Look through
            <br />
            <span className="text-orwas-clay italic">Our world</span>
          </h2>
          <Button href="/collections" variant="underline" className="reveal">
            Shop all →
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {EXPLORE_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group relative flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-sm bg-orwas-sand/40 p-8 reveal transition-transform duration-500 hover:-translate-y-1"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-orwas-ink/70 via-orwas-ink/10 to-transparent opacity-90" />
              <div className="relative z-10">
                <p className="mb-2 text-[10px] uppercase tracking-[0.24em] text-orwas-amber">
                  {item.eyebrow}
                </p>
                <h3 className="mb-3 font-display text-4xl text-orwas-cream">
                  {item.title}
                </h3>
                <p className="max-w-xs text-sm leading-relaxed text-orwas-cream/75">
                  {item.description}
                </p>
                <span className="mt-5 inline-block text-xs uppercase tracking-[0.2em] text-orwas-amber">
                  Explore →
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Brand Collections — the season the admin has published. */}
        <div className="mt-16">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-2 text-[10px] uppercase tracking-[0.24em] text-orwas-amber">
                {season.name}
              </p>
              <h3 className="text-display-md font-display text-orwas-ink">
                Brand <span className="text-orwas-clay italic">Collections</span>
              </h3>
              {season.headline && (
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-orwas-clay">
                  {season.headline}
                </p>
              )}
            </div>
            <Button href="/collections" variant="underline" className="self-start md:self-auto">
              Shop the season →
            </Button>
          </div>

          {season.heroImage && (
            <div className="reveal relative mb-6 aspect-[21/9] overflow-hidden rounded-sm bg-orwas-sand/30">
              <Image
                src={season.heroImage}
                alt={`${season.name} campaign`}
                fill
                sizes="100vw"
                unoptimized={season.heroImage.startsWith("data:")}
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-orwas-ink/60 via-orwas-ink/10 to-transparent" />
              <p className="absolute bottom-5 left-6 font-display text-display-md text-orwas-cream">
                {season.name}
              </p>
            </div>
          )}

          {pieces.length === 0 ? (
            <p className="rounded-sm border border-orwas-clay/10 bg-orwas-ivory px-8 py-12 text-center text-sm text-orwas-clay">
              This season&apos;s edit is being finalised — check back shortly.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
              {pieces.map(({ item, product }) => {
                const stock = product.inventory <= 0 ? "out" : product.inventory <= 3 ? "low" : "in";

                return (
                  <div
                    key={item.id}
                    className="group relative aspect-[3/4] overflow-hidden rounded-sm bg-orwas-sand/30 reveal transition-transform duration-500 hover:-translate-y-1"
                  >
                    <Image
                      src={product.image || "/collections/collection-1.jpeg"}
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      unoptimized={(product.image ?? "").startsWith("data:")}
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-orwas-ink/70 via-orwas-ink/10 to-transparent opacity-90" />

                    {/* Badge */}
                    {item.badge && (
                      <div className="absolute top-3 left-3 z-10">
                        <span className={`inline-block px-2 py-1 text-[10px] font-medium uppercase tracking-wider rounded-sm ${
                          item.badge === "Sold Out" ? "bg-orwas-ink/80 text-orwas-cream"
                          : item.badge === "Almost Gone" ? "bg-orwas-amber/90 text-orwas-ink"
                          : item.badge === "Best Seller" ? "bg-orwas-amber text-orwas-ink"
                          : "bg-orwas-cream/90 text-orwas-ink"
                        }`}>
                          {item.badge}
                        </span>
                      </div>
                    )}

                    {/* Stock status — read live from the catalog when the piece is linked. */}
                    <div className="absolute top-3 right-3 z-10">
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-sm text-[10px] font-medium ${
                        stock === "in" ? "bg-green-500/90 text-white"
                        : stock === "low" ? "bg-yellow-500/90 text-orwas-ink"
                        : "bg-red-500/90 text-white"
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          stock === "in" ? "bg-white" : stock === "low" ? "bg-orwas-ink" : "bg-white"
                        }`} />
                        {stock === "in" ? "In Stock" : stock === "low" ? `Only ${product.inventory} left` : "Out of Stock"}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h4 className="font-display text-lg text-orwas-cream mb-1 line-clamp-2 md:text-xl">
                        {product.name}
                      </h4>
                      {(item.description || product.description) && (
                        <p className="mb-2 line-clamp-1 text-xs text-orwas-cream/75">
                          {item.description || product.description}
                        </p>
                      )}

                      {/* Price */}
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-orwas-cream font-medium">
                          KSh {product.price.toLocaleString()}
                        </span>
                        {item.originalPrice && item.originalPrice > product.price && (
                          <span className="text-orwas-cream/50 text-xs line-through">
                            KSh {item.originalPrice.toLocaleString()}
                          </span>
                        )}
                      </div>

                      {/* Delivery */}
                      {item.delivery && (
                        <div className="flex items-center gap-1 mb-3">
                          <svg className="w-3 h-3 text-orwas-amber" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v-2h2v2zm0-4H9V5h2v4z" />
                          </svg>
                          <span className="text-orwas-cream/80 text-[10px]">
                            {item.delivery} Delivery
                          </span>
                        </div>
                      )}

                      {/* Actions */}
                      {stock !== "out" ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAddToCart(product)}
                            className="flex-1 bg-orwas-amber hover:bg-orwas-amber-light text-orwas-ink text-[10px] font-medium uppercase tracking-wider py-2 px-3 rounded-sm transition-colors duration-300"
                          >
                            Add to Cart
                          </button>
                          <Link
                            href={`/products/${product.id}`}
                            className="bg-orwas-cream/20 hover:bg-orwas-cream/30 text-orwas-cream text-[10px] font-medium uppercase tracking-wider py-2 px-3 rounded-sm transition-colors duration-300"
                          >
                            View
                          </Link>
                        </div>
                      ) : (
                        <Link
                          href={`/products/${product.id}`}
                          className="block w-full bg-orwas-ink/50 text-orwas-cream/70 text-center text-[10px] font-medium uppercase tracking-wider py-2 px-3 rounded-sm transition-colors hover:bg-orwas-ink/70"
                        >
                          View Piece
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Section>
  );
}
