"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useStore } from "@/components/StoreProvider";
import { formatPrice } from "@/lib/store";

export default function ProductDetailPage() {
  const params = useParams();
  const { products, locale, currency, addToCart } = useStore();
  const product = products.find((item) => item.id === params.id);

  if (!product) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-orwas-ivory px-6 pb-20 pt-32 text-orwas-ink md:px-12 lg:px-20">
          <div className="mx-auto max-w-3xl">
            <p className="text-xs uppercase tracking-[0.25em] text-orwas-clay">Product</p>
            <h1 className="mt-4 font-display text-5xl">Not found.</h1>
            <Link href="/collections" className="mt-8 inline-flex border-b border-orwas-ink/30 pb-1 text-xs uppercase tracking-[0.2em]">
              Back to collections
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const related = products.filter((item) => item.id !== product.id).slice(0, 3);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-orwas-ivory px-6 pb-20 pt-32 text-orwas-ink md:px-12 lg:px-20">
        <div className="mx-auto max-w-6xl">
          <Link href="/collections" className="mb-8 inline-flex text-xs uppercase tracking-[0.2em] text-orwas-clay">
            ← Back to collections
          </Link>

          <div className="grid gap-10 md:grid-cols-2">
            <div className="overflow-hidden rounded-sm bg-orwas-sand/30">
              {product.image ? (
                <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full min-h-[480px] w-full items-center justify-center text-[10px] uppercase tracking-[0.3em] text-orwas-clay">
                  Product image
                </div>
              )}
            </div>

            <div className="flex flex-col justify-center">
              <p className="text-xs uppercase tracking-[0.25em] text-orwas-clay">{product.collection}</p>
              <h1 className="mt-4 font-display text-5xl md:text-6xl">{product.name}</h1>
              <p className="mt-6 text-2xl text-orwas-ink/80">{formatPrice(product.price, locale, currency)}</p>

              <p className="mt-6 max-w-lg text-base leading-relaxed text-orwas-ink/75">
                {product.description ?? "Crafted with a considered balance of form, function, and material integrity."}
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <button
                  onClick={() => addToCart(product)}
                  className="bg-orwas-ink px-8 py-4 text-xs uppercase tracking-[0.2em] text-orwas-cream transition-colors hover:bg-orwas-stone"
                >
                  {product.inventory > 0 ? "Add to cart" : "Sold out"}
                </button>
                <Link href="/collections" className="inline-flex items-center border border-orwas-clay/30 px-8 py-4 text-xs uppercase tracking-[0.2em] text-orwas-ink">
                  Continue shopping
                </Link>
              </div>
            </div>
          </div>

          {related.length > 0 && (
            <div className="mt-20">
              <h2 className="font-display text-4xl text-orwas-ink">More pieces</h2>
              <div className="mt-8 grid gap-6 md:grid-cols-3">
                {related.map((item) => (
                  <Link key={item.id} href={`/products/${item.id}`} className="group block overflow-hidden rounded-sm border border-orwas-clay/15 bg-orwas-cream">
                    <div className="aspect-[3/4] bg-orwas-sand/30">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[10px] uppercase tracking-[0.3em] text-orwas-clay">
                          Product
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-orwas-clay">{item.collection}</p>
                      <h3 className="mt-2 font-display text-2xl text-orwas-ink">{item.name}</h3>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
