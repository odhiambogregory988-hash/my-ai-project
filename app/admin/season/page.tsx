"use client";

import Link from "next/link";
import Image from "next/image";
import { ChangeEvent, useEffect, useState } from "react";
import { useStore } from "@/components/StoreProvider";
import { fileToDataUrl, formatPrice, PRODUCT_CATEGORIES } from "@/lib/store";
import { formatDate } from "@/lib/accounts";
import {
  DELIVERY_WINDOWS,
  loadSeasons,
  newId,
  persistSeason,
  publishedSeason,
  removeSeason,
  SEASON_BADGES,
  Season,
  SeasonBadge,
  SeasonItem,
  DeliveryWindow,
} from "@/lib/season";

type Status = { tone: "ok" | "error"; text: string } | null;

/** A brand-new draft seeded from the season that is live now. */
function nextSeasonFrom(current: Season): Season {
  return {
    id: newId(),
    name: "",
    headline: "",
    heroImage: "",
    // Most pieces carry over between seasons — start from the current lineup.
    items: current.items.map((item) => ({ ...item, id: newId() })),
    published: false,
    updatedAt: new Date().toISOString(),
  };
}

export default function AdminSeasonPage() {
  const { products } = useStore();
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [draft, setDraft] = useState<Season | null>(null);
  const [mode, setMode] = useState<"supabase" | "demo">("demo");
  const [status, setStatus] = useState<Status>(null);
  const [busy, setBusy] = useState(false);
  const [catalogPick, setCatalogPick] = useState("");

  useEffect(() => {
    (async () => {
      const { seasons: stored, configured, unauthorized } = await loadSeasons();
      if (unauthorized) {
        window.location.assign("/admin/login?from=/admin/season");
        return;
      }
      setMode(configured ? "supabase" : "demo");
      setSeasons(stored);
      setDraft(publishedSeason(stored));
    })();
  }, []);

  const updateSeason = (patch: Partial<Season>) =>
    setDraft((current) => (current ? { ...current, ...patch } : current));

  const updateItem = (id: string, patch: Partial<SeasonItem>) =>
    setDraft((current) =>
      current
        ? { ...current, items: current.items.map((item) => (item.id === id ? { ...item, ...patch } : item)) }
        : current,
    );

  const removeItem = (id: string) =>
    setDraft((current) =>
      current ? { ...current, items: current.items.filter((item) => item.id !== id) } : current,
    );

  const moveItem = (id: string, direction: -1 | 1) =>
    setDraft((current) => {
      if (!current) return current;
      const index = current.items.findIndex((item) => item.id === id);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= current.items.length) return current;
      const items = [...current.items];
      [items[index], items[target]] = [items[target], items[index]];
      return { ...current, items };
    });

  const addBlankItem = () =>
    setDraft((current) =>
      current
        ? {
            ...current,
            items: [
              ...current.items,
              {
                id: newId(),
                name: "New piece",
                description: "",
                price: 0,
                originalPrice: null,
                badge: null,
                delivery: null,
                image: "",
                collection: current.name || "Season",
                category: "Clothing",
                inventory: 0,
              },
            ],
          }
        : current,
    );

  const addFromCatalog = () => {
    const product = products.find((item) => item.id === catalogPick);
    if (!product || !draft) return;
    setDraft({
      ...draft,
      items: [
        ...draft.items,
        {
          id: newId(),
          productId: product.id,
          name: product.name,
          description: product.description ?? "",
          price: product.price,
          originalPrice: null,
          badge: null,
          delivery: null,
          image: product.image ?? "",
          collection: product.collection,
          category: product.category,
          inventory: product.inventory,
        },
      ],
    });
    setCatalogPick("");
  };

  const handleImageFile = async (
    event: ChangeEvent<HTMLInputElement>,
    apply: (image: string) => void,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    apply(await fileToDataUrl(file));
    event.target.value = "";
  };

  const save = async (publish?: boolean) => {
    if (!draft) return;
    const name = draft.name.trim();
    if (!name) {
      setStatus({ tone: "error", text: "Give the season a name before saving — e.g. “Spring 2026”." });
      return;
    }
    const items = draft.items.filter((item) => item.name.trim());
    if (publish === true && items.length === 0) {
      setStatus({ tone: "error", text: "Add at least one piece before publishing." });
      return;
    }

    const next: Season = {
      ...draft,
      name,
      items,
      published: publish ?? draft.published,
      updatedAt: new Date().toISOString(),
    };

    setBusy(true);
    const result = await persistSeason(next);
    setBusy(false);

    if (!result.ok) {
      setStatus({ tone: "error", text: result.message ?? "Could not save the season." });
      return;
    }

    setDraft(next);
    setSeasons((current) => {
      const exists = current.some((season) => season.id === next.id);
      const merged = exists
        ? current.map((season) => (season.id === next.id ? next : season))
        : [next, ...current];
      return next.published ? merged.map((season) => (season.id === next.id ? season : { ...season, published: false })) : merged;
    });

    const headline =
      result.message ??
      (next.published
        ? "Published — this season is now live on the storefront."
        : "Saved as a draft.");
    setStatus({ tone: result.message ? "error" : "ok", text: headline });
  };

  const deleteSeason = async (season: Season) => {
    if (!window.confirm(`Delete “${season.name}”? This cannot be undone.`)) return;
    setBusy(true);
    const result = await removeSeason(season.id);
    setBusy(false);
    if (!result.ok) {
      setStatus({ tone: "error", text: result.message ?? "Could not delete the season." });
      return;
    }
    const remaining = seasons.filter((item) => item.id !== season.id);
    setSeasons(remaining);
    setDraft(publishedSeason(remaining));
    setStatus({ tone: "ok", text: result.message ?? `Deleted “${season.name}”.` });
  };

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.assign("/admin/login");
  };

  const live = draft?.published ?? false;

  return (
    <main className="min-h-screen bg-orwas-ivory px-6 py-10 text-orwas-ink md:px-12 lg:px-20">
      <header className="mb-10 rounded-sm border border-orwas-sand/60 bg-white p-6 shadow-[0_20px_60px_rgba(17,24,39,0.04)]">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="mb-2 text-xs uppercase tracking-[0.24em] text-orwas-clay">Orwa Sole Co. / Admin</p>
            <h1 className="font-display text-4xl md:text-5xl">Seasonal collection</h1>
            <p className="mt-2 max-w-2xl text-sm text-orwas-clay">
              Curate the brand collection each season. Publishing swaps the “Brand Collections” grid on the
              storefront and retires the season before it.
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-3">
            <Link href="/admin" className="text-xs uppercase tracking-[0.2em] text-orwas-amber">← Dashboard</Link>
            <Link href="/" target="_blank" className="text-xs uppercase tracking-[0.2em] text-orwas-clay underline underline-offset-4">Preview store ↗</Link>
            <button onClick={logout} className="text-xs uppercase tracking-[0.2em] text-orwas-clay transition-colors hover:text-orwas-ink">Sign out</button>
          </div>
        </div>
      </header>

      {mode === "demo" && (
        <div className="mb-8 border border-orwas-amber/40 bg-orwas-amber/10 px-5 py-4 text-sm text-orwas-ink">
          <p className="font-medium">Seasons aren&apos;t reaching Supabase yet</p>
          <p className="mt-1 text-xs text-orwas-clay">
            Edits save in this browser only. Run <span className="font-mono">supabase/season.sql</span> and make sure{" "}
            <span className="font-mono">SUPABASE_SERVICE_ROLE_KEY</span> is set so a published season reaches customers.
          </p>
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

      {!draft ? (
        <p className="rounded-sm border border-orwas-sand/60 bg-white px-8 py-16 text-center text-sm text-orwas-clay">
          Loading seasons…
        </p>
      ) : (
        <>
          {/* ---------- Season details ---------- */}
          <section className="rounded-sm border border-orwas-sand/60 bg-white shadow-[0_20px_60px_rgba(17,24,39,0.04)]">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-orwas-sand/60 px-6 py-4">
              <div className="flex items-center gap-4">
                <h2 className="font-display text-2xl">Season details</h2>
                <span className={`border px-3 py-1 text-[10px] uppercase tracking-[0.15em] ${
                  live ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-orwas-amber/40 bg-orwas-amber/15 text-orwas-ink"
                }`}>
                  {live ? "Live on storefront" : "Draft"}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => { setDraft(nextSeasonFrom(draft)); setStatus(null); }}
                  className="border border-orwas-sand px-4 py-2 text-[10px] uppercase tracking-[0.2em] transition-colors hover:border-orwas-amber/60"
                >
                  Start next season
                </button>
                <button
                  onClick={() => deleteSeason(draft)}
                  className="text-[10px] uppercase tracking-[0.2em] text-orwas-clay transition-colors hover:text-red-500"
                >
                  Delete
                </button>
              </div>
            </div>

            <div className="grid gap-8 px-6 py-6 lg:grid-cols-[1.4fr_1fr]">
              <div className="space-y-5">
                <label className="block text-xs text-orwas-clay">
                  Season name
                  <input
                    value={draft.name}
                    onChange={(event) => updateSeason({ name: event.target.value })}
                    placeholder="e.g. Spring 2026"
                    className="mt-1 w-full border-b border-orwas-sand bg-transparent py-2 text-base text-orwas-ink outline-none focus:border-orwas-amber"
                  />
                </label>
                <label className="block text-xs text-orwas-clay">
                  Headline
                  <input
                    value={draft.headline}
                    onChange={(event) => updateSeason({ headline: event.target.value })}
                    placeholder="One line on what defines this season"
                    className="mt-1 w-full border-b border-orwas-sand bg-transparent py-2 text-base text-orwas-ink outline-none focus:border-orwas-amber"
                  />
                </label>
                <p className="text-xs text-orwas-clay">
                  Last saved {formatDate(draft.updatedAt)} · {draft.items.length} piece(s)
                </p>
              </div>

              <div className="space-y-3">
                <p className="text-xs text-orwas-clay">Campaign banner (optional)</p>
                <label className="relative block h-40 w-full cursor-pointer overflow-hidden rounded-sm border border-orwas-sand bg-orwas-mist">
                  {draft.heroImage ? (
                    <Image src={draft.heroImage} alt="Season banner" fill unoptimized className="object-cover" />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-[10px] uppercase tracking-[0.2em] text-orwas-clay">
                      Upload banner
                    </span>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => handleImageFile(event, (image) => updateSeason({ heroImage: image }))}
                    className="hidden"
                  />
                </label>
                {draft.heroImage && (
                  <button
                    onClick={() => updateSeason({ heroImage: "" })}
                    className="text-[10px] uppercase tracking-[0.2em] text-orwas-clay transition-colors hover:text-red-500"
                  >
                    Remove banner
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-4 border-t border-orwas-sand/60 px-6 py-4">
              <button
                disabled={busy}
                onClick={() => save()}
                className="border border-orwas-sand px-5 py-3 text-xs uppercase tracking-[0.2em] transition-colors hover:border-orwas-amber/60 disabled:opacity-40"
              >
                Save
              </button>
              {live ? (
                <button
                  disabled={busy}
                  onClick={() => save(false)}
                  className="border border-orwas-sand px-5 py-3 text-xs uppercase tracking-[0.2em] transition-colors hover:border-orwas-amber/60 disabled:opacity-40"
                >
                  Unpublish
                </button>
              ) : (
                <button
                  disabled={busy}
                  onClick={() => save(true)}
                  className="bg-orwas-ink px-5 py-3 text-xs uppercase tracking-[0.22em] text-orwas-cream transition-colors hover:bg-orwas-stone disabled:opacity-40"
                >
                  Publish to storefront
                </button>
              )}
            </div>
          </section>

          {/* ---------- Pieces ---------- */}
          <section className="mt-10">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl">Seasonal pieces</h2>
                <p className="text-sm text-orwas-clay">
                  Link a piece to a catalog product and its stock stays live; prices here are what the season shows.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <select
                  aria-label="Pick a catalog product"
                  value={catalogPick}
                  onChange={(event) => setCatalogPick(event.target.value)}
                  className="border border-orwas-sand bg-white px-3 py-2 text-sm outline-none focus:border-orwas-amber"
                >
                  <option value="">Pick from catalog…</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} — {formatPrice(product.price, "en-KE", "KES")}
                    </option>
                  ))}
                </select>
                <button
                  onClick={addFromCatalog}
                  disabled={!catalogPick}
                  className="border border-orwas-sand px-4 py-2 text-[10px] uppercase tracking-[0.2em] transition-colors hover:border-orwas-amber/60 disabled:opacity-40"
                >
                  Add from catalog
                </button>
                <button
                  onClick={addBlankItem}
                  className="bg-orwas-ink px-5 py-2.5 text-[10px] uppercase tracking-[0.2em] text-orwas-cream transition-colors hover:bg-orwas-stone"
                >
                  Blank piece
                </button>
              </div>
            </div>

            <div className="overflow-hidden rounded-sm border border-orwas-sand/60 bg-white">
              {draft.items.length === 0 ? (
                <p className="px-6 py-12 text-center text-sm text-orwas-clay">
                  No pieces in this season yet — add one from the catalog or start blank.
                </p>
              ) : (
                draft.items.map((item, index) => (
                  <article
                    key={item.id}
                    className="flex flex-col gap-4 border-b border-orwas-sand/50 px-5 py-5 last:border-b-0 lg:flex-row"
                  >
                    <label className="relative block h-20 w-16 shrink-0 cursor-pointer overflow-hidden rounded-sm border border-orwas-sand bg-orwas-mist">
                      {item.image ? (
                        <Image src={item.image} alt={item.name} fill unoptimized className="object-cover" />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center text-[9px] uppercase tracking-[0.15em] text-orwas-clay">
                          Image
                        </span>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(event) => handleImageFile(event, (image) => updateItem(item.id, { image }))}
                        className="hidden"
                      />
                    </label>

                    <div className="grid flex-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                      <label className="block text-xs text-orwas-clay md:col-span-2">
                        Name
                        <input
                          value={item.name}
                          onChange={(event) => updateItem(item.id, { name: event.target.value })}
                          className="mt-1 w-full border-b border-orwas-sand bg-transparent py-2 text-sm text-orwas-ink outline-none"
                        />
                      </label>
                      <label className="block text-xs text-orwas-clay">
                        Price (KSh)
                        <input
                          type="number"
                          value={item.price}
                          onChange={(event) => updateItem(item.id, { price: Number(event.target.value) })}
                          className="mt-1 w-full border-b border-orwas-sand bg-transparent py-2 text-sm text-orwas-ink outline-none"
                        />
                      </label>
                      <label className="block text-xs text-orwas-clay">
                        Was price
                        <input
                          type="number"
                          placeholder="—"
                          value={item.originalPrice ?? ""}
                          onChange={(event) =>
                            updateItem(item.id, {
                              originalPrice: event.target.value === "" ? null : Number(event.target.value),
                            })
                          }
                          className="mt-1 w-full border-b border-orwas-sand bg-transparent py-2 text-sm text-orwas-ink outline-none"
                        />
                      </label>
                      <label className="block text-xs text-orwas-clay">
                        Badge
                        <select
                          value={item.badge ?? ""}
                          onChange={(event) =>
                            updateItem(item.id, { badge: (event.target.value || null) as SeasonBadge | null })
                          }
                          className="mt-1 w-full border-b border-orwas-sand bg-transparent py-2 text-sm outline-none"
                        >
                          <option value="">None</option>
                          {SEASON_BADGES.map((badge) => (
                            <option key={badge} value={badge}>{badge}</option>
                          ))}
                        </select>
                      </label>
                      <label className="block text-xs text-orwas-clay">
                        Delivery
                        <select
                          value={item.delivery ?? ""}
                          onChange={(event) =>
                            updateItem(item.id, { delivery: (event.target.value || null) as DeliveryWindow | null })
                          }
                          className="mt-1 w-full border-b border-orwas-sand bg-transparent py-2 text-sm outline-none"
                        >
                          <option value="">None</option>
                          {DELIVERY_WINDOWS.map((window) => (
                            <option key={window} value={window}>{window}</option>
                          ))}
                        </select>
                      </label>
                      <label className="block text-xs text-orwas-clay">
                        Catalog link
                        <select
                          value={item.productId ?? ""}
                          onChange={(event) => updateItem(item.id, { productId: event.target.value || undefined })}
                          className="mt-1 w-full border-b border-orwas-sand bg-transparent py-2 text-sm outline-none"
                        >
                          <option value="">Not linked</option>
                          {products.map((product) => (
                            <option key={product.id} value={product.id}>{product.name}</option>
                          ))}
                        </select>
                      </label>
                      <label className="block text-xs text-orwas-clay">
                        Category
                        <select
                          value={item.category}
                          onChange={(event) =>
                            updateItem(item.id, { category: event.target.value as SeasonItem["category"] })
                          }
                          className="mt-1 w-full border-b border-orwas-sand bg-transparent py-2 text-sm outline-none"
                        >
                          {PRODUCT_CATEGORIES.map((category) => (
                            <option key={category} value={category}>{category}</option>
                          ))}
                        </select>
                      </label>
                      <label className="block text-xs text-orwas-clay md:col-span-2 xl:col-span-4">
                        Description
                        <input
                          value={item.description}
                          onChange={(event) => updateItem(item.id, { description: event.target.value })}
                          placeholder="Short line shown on the card"
                          className="mt-1 w-full border-b border-orwas-sand bg-transparent py-2 text-sm text-orwas-ink outline-none"
                        />
                      </label>
                    </div>

                    <div className="flex shrink-0 items-start gap-3 lg:flex-col lg:items-stretch">
                      <button
                        aria-label={`Move ${item.name} earlier`}
                        disabled={index === 0}
                        onClick={() => moveItem(item.id, -1)}
                        className="border border-orwas-sand px-2 py-1 text-xs transition-colors hover:border-orwas-amber/60 disabled:opacity-30"
                      >
                        ↑
                      </button>
                      <button
                        aria-label={`Move ${item.name} later`}
                        disabled={index === draft.items.length - 1}
                        onClick={() => moveItem(item.id, 1)}
                        className="border border-orwas-sand px-2 py-1 text-xs transition-colors hover:border-orwas-amber/60 disabled:opacity-30"
                      >
                        ↓
                      </button>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-orwas-clay transition-colors hover:text-red-500"
                      >
                        Remove
                      </button>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>

          {/* ---------- Archive ---------- */}
          <section className="mt-10 overflow-hidden rounded-sm border border-orwas-sand/60 bg-white">
            <div className="border-b border-orwas-sand/60 px-6 py-4">
              <h2 className="font-display text-2xl">Season archive</h2>
              <p className="text-sm text-orwas-clay">Load a past season back into the editor to re-publish it.</p>
            </div>
            <div className="divide-y divide-orwas-sand/50">
              {seasons.map((season) => (
                <div key={season.id} className="flex flex-wrap items-center justify-between gap-4 px-6 py-4">
                  <div className="flex items-center gap-4">
                    <span className={`border px-3 py-1 text-[10px] uppercase tracking-[0.15em] ${
                      season.published
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-orwas-sand bg-orwas-ivory text-orwas-clay"
                    }`}>
                      {season.published ? "Live" : "Draft"}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-orwas-ink">{season.name}</p>
                      <p className="text-xs text-orwas-clay">
                        {season.items.length} piece(s) · updated {formatDate(season.updatedAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => { setDraft(season); setStatus(null); }}
                      className="text-[10px] uppercase tracking-[0.2em] text-orwas-amber"
                    >
                      Load
                    </button>
                    <button
                      onClick={() => deleteSeason(season)}
                      className="text-[10px] uppercase tracking-[0.2em] text-orwas-clay transition-colors hover:text-red-500"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </main>
  );
}
