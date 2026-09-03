"use client";

import Link from "next/link";
import { ChangeEvent, useState } from "react";
import { fileToDataUrl, inferProductNameFromImage, Product, PRODUCT_CATEGORIES } from "@/lib/store";
import { useStore } from "@/components/StoreProvider";

export default function AdminProductsPage() {
  const { products, saveProducts } = useStore();
  const [draft, setDraft] = useState<Product | null>(null);

  const update = (id: string, field: keyof Product, value: string) => {
    saveProducts(products.map((product) => product.id === id ? { ...product, [field]: field === "price" || field === "inventory" ? Number(value) : value } : product));
  };

  const handleImageFile = async (id: string, event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const image = await fileToDataUrl(file);
    const inferredName = inferProductNameFromImage(file.name);

    saveProducts(products.map((product) => {
      if (product.id !== id) return product;
      return {
        ...product,
        image,
        name: !product.name || product.name === "New product" ? inferredName : product.name,
      };
    }));

    event.target.value = "";
  };

  const handleDraftImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !draft) return;

    const image = await fileToDataUrl(file);
    const inferredName = inferProductNameFromImage(file.name);

    setDraft({
      ...draft,
      image,
      name: !draft.name || draft.name === "New product" ? inferredName : draft.name,
    });

    event.target.value = "";
  };

  const addProduct = () => setDraft({ id: crypto.randomUUID(), name: "New product", price: 0, collection: "Provenance", inventory: 0, image: "", category: "Clothing" });
  const saveDraft = () => { if (draft) { saveProducts([...products, draft]); setDraft(null); } };
  const logout = async () => { await fetch("/api/admin/logout", { method: "POST" }); window.location.assign("/admin/login"); };

  return (
    <main className="min-h-screen bg-orwas-ivory px-6 py-10 text-orwas-ink md:px-12 lg:px-20">
      <header className="mb-12 rounded-sm border border-orwas-sand/60 bg-white p-6 shadow-[0_20px_60px_rgba(17,24,39,0.04)]">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="mb-2 text-xs uppercase tracking-[0.24em] text-orwas-clay">Orwa Sole Co. / Admin</p>
            <h1 className="font-display text-4xl md:text-5xl">Product management</h1>
          </div>
          <div className="flex items-center gap-5">
            <button onClick={logout} className="text-xs uppercase tracking-[0.2em] text-orwas-clay transition-colors hover:text-orwas-ink">Sign out</button>
            <Link href="/admin" className="text-xs uppercase tracking-[0.2em] text-orwas-amber">← Dashboard</Link>
          </div>
        </div>
      </header>

      <div className="mb-8 flex items-center justify-between gap-4">
        <p className="text-sm text-orwas-clay">Changes are saved to this browser.</p>
        <button onClick={addProduct} className="bg-orwas-ink px-5 py-3 text-xs uppercase tracking-[0.22em] text-orwas-cream transition-colors hover:bg-orwas-stone">
          Add product
        </button>
      </div>

      <div className="overflow-hidden rounded-sm border border-orwas-sand/60 bg-white shadow-[0_20px_60px_rgba(17,24,39,0.04)]">
        <div className="overflow-x-auto">
          <div className="min-w-[780px]">
            {products.map((product) => (
              <div key={product.id} className="grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr_auto] items-center gap-4 border-b border-orwas-sand/50 px-5 py-5 last:border-b-0">
                <div className="flex items-center gap-3">
                  <label className="relative block h-14 w-14 cursor-pointer overflow-hidden rounded-sm border border-orwas-sand bg-orwas-mist">
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-[10px] uppercase tracking-[0.2em] text-orwas-clay">Image</span>
                    )}
                    <input type="file" accept="image/*" onChange={(event) => handleImageFile(product.id, event)} className="hidden" />
                  </label>
                  <input aria-label="Product name" value={product.name} onChange={(event) => update(product.id, "name", event.target.value)} className="w-full border-b border-orwas-sand bg-transparent py-2 outline-none" />
                </div>

                <select
                  aria-label="Product category"
                  value={product.category || "Clothing"}
                  onChange={(event) => update(product.id, "category", event.target.value)}
                  className="border-b border-orwas-sand bg-transparent py-2 text-sm outline-none"
                >
                  {PRODUCT_CATEGORIES.map((category) => (
                    <option key={category} value={category} className="bg-white text-orwas-ink">
                      {category}
                    </option>
                  ))}
                </select>

                <input aria-label="Collection" value={product.collection} onChange={(event) => update(product.id, "collection", event.target.value)} className="border-b border-orwas-sand bg-transparent py-2 outline-none" />

                <label className="text-xs text-orwas-clay">
                  Price
                  <input type="number" value={product.price} onChange={(event) => update(product.id, "price", event.target.value)} className="mt-1 w-full border-b border-orwas-sand bg-transparent py-2 outline-none" />
                </label>

                <label className="text-xs text-orwas-clay">
                  Stock
                  <input type="number" value={product.inventory} onChange={(event) => update(product.id, "inventory", event.target.value)} className="mt-1 w-full border-b border-orwas-sand bg-transparent py-2 outline-none" />
                </label>

                <button onClick={() => saveProducts(products.filter((item) => item.id !== product.id))} className="text-xs uppercase tracking-[0.2em] text-orwas-clay transition-colors hover:text-red-500">
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {draft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-orwas-ink/50 p-6">
          <div className="w-full max-w-md rounded-sm border border-orwas-sand/60 bg-white p-6 shadow-[0_30px_80px_rgba(17,24,39,0.15)]">
            <h2 className="font-display text-2xl">New product</h2>
            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-3">
                <label className="relative block h-20 w-20 cursor-pointer overflow-hidden rounded-sm border border-orwas-sand bg-orwas-mist">
                  <img src={draft.image || undefined} alt={draft.name} className={draft.image ? "h-full w-full object-cover" : "hidden"} />
                  <span className={draft.image ? "hidden" : "flex h-full w-full items-center justify-center text-[10px] uppercase tracking-[0.2em] text-orwas-clay"}>Upload</span>
                  <input type="file" accept="image/*" onChange={handleDraftImage} className="hidden" />
                </label>
                <div className="flex-1">
                  <input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} className="w-full border-b border-orwas-sand bg-transparent py-2 outline-none" placeholder="Name" />
                </div>
              </div>

              <select
                value={draft.category}
                onChange={(event) => setDraft({ ...draft, category: event.target.value as Product["category"] })}
                className="w-full border-b border-orwas-sand bg-transparent py-2 outline-none"
              >
                {PRODUCT_CATEGORIES.map((category) => (
                  <option key={category} value={category} className="bg-white text-orwas-ink">
                    {category}
                  </option>
                ))}
              </select>
              <input value={draft.collection} onChange={(event) => setDraft({ ...draft, collection: event.target.value })} className="w-full border-b border-orwas-sand bg-transparent py-2 outline-none" placeholder="Collection" />
              <input type="number" value={draft.price} onChange={(event) => setDraft({ ...draft, price: Number(event.target.value) })} className="w-full border-b border-orwas-sand bg-transparent py-2 outline-none" placeholder="Price in KSh" />
              <input type="number" value={draft.inventory} onChange={(event) => setDraft({ ...draft, inventory: Number(event.target.value) })} className="w-full border-b border-orwas-sand bg-transparent py-2 outline-none" placeholder="Stock" />
            </div>

            <div className="mt-8 flex justify-end gap-4">
              <button onClick={() => setDraft(null)} className="px-4 py-3 text-xs uppercase tracking-[0.2em]">Cancel</button>
              <button onClick={saveDraft} className="bg-orwas-ink px-5 py-3 text-xs uppercase tracking-[0.2em] text-orwas-cream transition-colors hover:bg-orwas-stone">Save product</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}