"use client";

import Link from "next/link";
import Image from "next/image";
import { ChangeEvent, useEffect, useState } from "react";
import { useStore } from "@/components/StoreProvider";
import {
  fileToOptimizedDataUrl,
  hasLocalProducts,
  inferProductNameFromImage,
  loadLocalProducts,
  newProductId,
  Product,
  PRODUCT_CATEGORIES,
  saveCatalog,
} from "@/lib/store";

type Status = { tone: "ok" | "error"; text: string } | null;

export default function AdminProductsPage() {
  const { products, catalogMode, refreshProducts } = useStore();

  // Edits are staged locally and written in one round trip on "Save changes" —
  // a database write per keystroke would be both slow and lossy.
  const [rows, setRows] = useState<Product[]>(products);
  const [dirty, setDirty] = useState<Record<string, boolean>>({});
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const [draft, setDraft] = useState<Product | null>(null);
  const [status, setStatus] = useState<Status>(null);
  const [busy, setBusy] = useState(false);
  const [localBackup, setLocalBackup] = useState<Product[] | null>(null);

  const stagedCount = Object.keys(dirty).length + deletedIds.length;

  // Adopt catalog changes from Supabase — but never discard unsaved edits.
  useEffect(() => {
    if (stagedCount === 0) setRows(products);
  }, [products, stagedCount]);

  useEffect(() => {
    if (catalogMode === "supabase" && hasLocalProducts()) {
      setLocalBackup(loadLocalProducts());
    }
  }, [catalogMode]);

  const markDirty = (id: string) => setDirty((current) => ({ ...current, [id]: true }));

  const update = (id: string, field: keyof Product, value: string) => {
    setRows((current) =>
      current.map((product) =>
        product.id === id
          ? {
              ...product,
              [field]:
                field === "price" || field === "inventory" ? Number(value) : value,
            }
          : product,
      ),
    );
    markDirty(id);
  };

  const handleImageFile = async (id: string, event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const image = await fileToOptimizedDataUrl(file);
    const inferredName = inferProductNameFromImage(file.name);

    setRows((current) =>
      current.map((product) => {
        if (product.id !== id) return product;
        return {
          ...product,
          image,
          name: !product.name || product.name === "New product" ? inferredName : product.name,
        };
      }),
    );
    markDirty(id);
    event.target.value = "";
  };

  const handleDraftImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !draft) return;

    const image = await fileToOptimizedDataUrl(file);
    const inferredName = inferProductNameFromImage(file.name);

    setDraft({
      ...draft,
      image,
      name: !draft.name || draft.name === "New product" ? inferredName : draft.name,
    });
    event.target.value = "";
  };

  const addProduct = () =>
    setDraft({
      id: newProductId(),
      name: "New product",
      price: 0,
      collection: "Provenance",
      inventory: 0,
      image: "",
      category: "Clothing",
    });

  const saveDraft = () => {
    if (!draft) return;
    setRows((current) => [...current, draft]);
    markDirty(draft.id);
    setDraft(null);
    setStatus({ tone: "ok", text: `“${draft.name}” staged — press Save changes to publish it.` });
  };

  const removeRow = (product: Product) => {
    if (!window.confirm(`Remove “${product.name}” from the catalog? Save changes to apply this.`)) return;
    setRows((current) => current.filter((item) => item.id !== product.id));
    setDeletedIds((current) => (current.includes(product.id) ? current : [...current, product.id]));
    setDirty((current) => {
      const next = { ...current };
      delete next[product.id];
      return next;
    });
  };

  const discard = () => {
    setRows(products);
    setDirty({});
    setDeletedIds([]);
    setStatus({ tone: "ok", text: "Discarded unsaved changes." });
  };

  const importLocalBackup = () => {
    if (!localBackup) return;
    const merged = [...rows];
    for (const product of localBackup) {
      const index = merged.findIndex((candidate) => candidate.id === product.id);
      if (index >= 0) merged[index] = product;
      else merged.push(product);
    }
    setRows(merged);
    setDirty((current) => {
      const next = { ...current };
      for (const product of localBackup) next[product.id] = true;
      return next;
    });
    setLocalBackup(null);
    setStatus({
      tone: "ok",
      text: `Staged ${localBackup.length} product(s) from this browser — press Save changes to publish them.`,
    });
  };

  const save = async () => {
    const upserts = rows.filter(
      (product) => dirty[product.id] || !products.some((existing) => existing.id === product.id),
    );
    if (!upserts.length && !deletedIds.length) return;

    setBusy(true);
    const result = await saveCatalog(upserts, deletedIds);
    if (result.ok) await refreshProducts();
    setBusy(false);

    if (!result.ok) {
      setStatus({ tone: "error", text: result.message ?? "Could not save the catalog." });
      return;
    }

    setDirty({});
    setDeletedIds([]);
    setStatus({
      tone: result.message ? "error" : "ok",
      text:
        result.message ??
        `Saved ${upserts.length} product(s)${deletedIds.length ? ` and removed ${deletedIds.length}` : ""}.`,
    });
  };

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.assign("/admin/login");
  };

  return (
    <main className="min-h-screen bg-orwas-ivory px-6 py-10 text-orwas-ink md:px-12 lg:px-20">
      <header className="mb-10 rounded-sm border border-orwas-sand/60 bg-white p-6 shadow-[0_20px_60px_rgba(17,24,39,0.04)]">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="mb-2 text-xs uppercase tracking-[0.24em] text-orwas-clay">Orwa Sole Co. / Admin</p>
            <h1 className="font-display text-4xl md:text-5xl">Product management</h1>
            <p className="mt-2 max-w-2xl text-sm text-orwas-clay">
              This catalog is shared with every customer. Staged edits go live when you save.
            </p>
          </div>
          <div className="flex items-center gap-5">
            <button onClick={logout} className="text-xs uppercase tracking-[0.2em] text-orwas-clay transition-colors hover:text-orwas-ink">Sign out</button>
            <Link href="/admin" className="text-xs uppercase tracking-[0.2em] text-orwas-amber">← Dashboard</Link>
          </div>
        </div>
      </header>

      {catalogMode === "demo" && (
        <div className="mb-8 border border-orwas-amber/40 bg-orwas-amber/10 px-5 py-4 text-sm text-orwas-ink">
          <p className="font-medium">Catalog isn&apos;t reaching Supabase yet</p>
          <p className="mt-1 text-xs text-orwas-clay">
            Edits save in this browser only. Run <span className="font-mono">supabase/products.sql</span> and make sure{" "}
            <span className="font-mono">SUPABASE_SERVICE_ROLE_KEY</span> is set so customers see them.
          </p>
        </div>
      )}

      {localBackup && (
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border border-orwas-sand/60 bg-white px-5 py-4">
          <div>
            <p className="text-sm font-medium text-orwas-ink">
              {localBackup.length} product(s) are still stored in this browser
            </p>
            <p className="text-xs text-orwas-clay">
              From before the catalog moved to Supabase. Import them, then save to publish.
            </p>
          </div>
          <button
            onClick={importLocalBackup}
            className="border border-orwas-sand px-4 py-2 text-[10px] uppercase tracking-[0.2em] transition-colors hover:border-orwas-amber/60"
          >
            Import into editor
          </button>
        </div>
      )}

      {status && (
        <p
          role="alert"
          className={`mb-8 border px-5 py-4 text-sm ${
            status.tone === "ok"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-orwas-amber/40 bg-orwas-amber/10 text-orwas-ink"
          }`}
        >
          {status.text}
        </p>
      )}

      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-orwas-clay">
          {stagedCount === 0 ? (
            <>All changes saved.</>
          ) : (
            <>
              <span className="font-medium text-orwas-ink">
                {stagedCount} unsaved change{stagedCount === 1 ? "" : "s"}
              </span>{" "}
              — not visible to customers yet.
            </>
          )}
        </p>
        <div className="flex flex-wrap items-center gap-4">
          {stagedCount > 0 && (
            <button
              onClick={discard}
              disabled={busy}
              className="text-[10px] uppercase tracking-[0.2em] text-orwas-clay transition-colors hover:text-red-500 disabled:opacity-40"
            >
              Discard
            </button>
          )}
          <button
            onClick={addProduct}
            className="border border-orwas-sand px-5 py-3 text-xs uppercase tracking-[0.22em] transition-colors hover:border-orwas-amber/60"
          >
            Add product
          </button>
          <button
            onClick={save}
            disabled={busy || stagedCount === 0}
            className="bg-orwas-ink px-5 py-3 text-xs uppercase tracking-[0.22em] text-orwas-cream transition-colors hover:bg-orwas-stone disabled:opacity-40"
          >
            {busy ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-sm border border-orwas-sand/60 bg-white shadow-[0_20px_60px_rgba(17,24,39,0.04)]">
        <div className="overflow-x-auto">
          <div className="min-w-[820px]">
            {rows.length === 0 ? (
              <p className="px-6 py-12 text-center text-sm text-orwas-clay">
                The catalog is empty — add a product to get started.
              </p>
            ) : (
              rows.map((product) => (
                <div key={product.id} className="grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr_auto] items-center gap-4 border-b border-orwas-sand/50 px-5 py-5 last:border-b-0">
                  <div className="flex items-center gap-3">
                    <label className="relative block h-14 w-14 shrink-0 cursor-pointer overflow-hidden rounded-sm border border-orwas-sand bg-orwas-mist">
                      {product.image ? (
                        <Image src={product.image} alt={product.name} width={56} height={56} unoptimized className="h-full w-full object-cover" />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center text-[10px] uppercase tracking-[0.2em] text-orwas-clay">Image</span>
                      )}
                      <input type="file" accept="image/*" onChange={(event) => handleImageFile(product.id, event)} className="hidden" />
                    </label>
                    <label className="min-w-0 flex-1">
                      <span className="sr-only">Product name</span>
                      <input value={product.name} onChange={(event) => update(product.id, "name", event.target.value)} className="w-full border-b border-orwas-sand bg-transparent py-2 outline-none" />
                      {dirty[product.id] && (
                        <span className="mt-1 block text-[9px] uppercase tracking-[0.2em] text-orwas-amber">Unsaved</span>
                      )}
                    </label>
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

                  <button onClick={() => removeRow(product)} className="text-xs uppercase tracking-[0.2em] text-orwas-clay transition-colors hover:text-red-500">
                    Delete
                  </button>
                </div>
              ))
            )}
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
                  {draft.image ? (
                    <Image src={draft.image} alt={draft.name || "Draft"} width={80} height={80} unoptimized className="h-full w-full object-cover" />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-[10px] uppercase tracking-[0.2em] text-orwas-clay">Upload</span>
                  )}
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
              <input value={draft.description ?? ""} onChange={(event) => setDraft({ ...draft, description: event.target.value })} className="w-full border-b border-orwas-sand bg-transparent py-2 outline-none" placeholder="Short description" />
              <input type="number" value={draft.price} onChange={(event) => setDraft({ ...draft, price: Number(event.target.value) })} className="w-full border-b border-orwas-sand bg-transparent py-2 outline-none" placeholder="Price in KSh" />
              <input type="number" value={draft.inventory} onChange={(event) => setDraft({ ...draft, inventory: Number(event.target.value) })} className="w-full border-b border-orwas-sand bg-transparent py-2 outline-none" placeholder="Stock" />
            </div>

            <div className="mt-8 flex justify-end gap-4">
              <button onClick={() => setDraft(null)} className="px-4 py-3 text-xs uppercase tracking-[0.2em]">Cancel</button>
              <button onClick={saveDraft} className="bg-orwas-ink px-5 py-3 text-xs uppercase tracking-[0.2em] text-orwas-cream transition-colors hover:bg-orwas-stone">Stage product</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
