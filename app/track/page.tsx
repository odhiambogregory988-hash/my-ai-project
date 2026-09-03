"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { findOrder, formatDate, loadCustomers, Order } from "@/lib/accounts";

const STATUS_META: Record<string, { note: string; badge: string; dot: string }> = {
  Processing: {
    note: "We have received your order and are preparing it for dispatch.",
    badge: "border-orwas-amber/40 bg-orwas-amber/15 text-orwas-ink",
    dot: "bg-orwas-amber",
  },
  Shipped: {
    note: "Your order is on its way — in transit to your delivery address.",
    badge: "border-blue-200 bg-blue-50 text-blue-700",
    dot: "bg-blue-500",
  },
  Delivered: {
    note: "Your order has been delivered. Enjoy your new pieces!",
    badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-500",
  },
  Cancelled: {
    note: "This order was cancelled. Contact us if you have questions.",
    badge: "border-red-200 bg-red-50 text-red-600",
    dot: "bg-red-400",
  },
};

const TIMELINE = ["Processing", "Shipped", "Delivered"] as const;

export default function TrackPage() {
  const [query, setQuery] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const found = findOrder(query);
    setOrder(found);
    setSearched(true);
  };

  const customer = order ? loadCustomers().find((c) => c.email === order.customerEmail) : null;
  const meta = order ? STATUS_META[order.status] : null;

  return (
    <>
      <Header />
      <main className="min-h-screen bg-orwas-ivory px-6 pb-20 pt-32 text-orwas-ink md:px-12 lg:px-20">
        <div className="mx-auto max-w-2xl">
          <p className="mb-3 text-xs uppercase tracking-[0.25em] text-orwas-amber">Order tracking</p>
          <h1 className="font-display text-5xl md:text-6xl">Track your order.</h1>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-orwas-ink/70">
            Enter your order number (e.g. <span className="font-medium text-orwas-ink">ORW-…</span>)
            to see where your pieces are — from processing to delivered.
          </p>

          {/* Search */}
          <form onSubmit={handleSubmit} className="mt-10 flex flex-col gap-3 sm:flex-row">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Order number, e.g. ORW-M1A2B3C4"
              className="w-full border border-orwas-sand bg-white px-5 py-4 text-sm outline-none transition-colors focus:border-orwas-amber"
            />
            <button
              type="submit"
              className="shrink-0 bg-orwas-ink px-8 py-4 text-[10px] uppercase tracking-[0.3em] text-orwas-cream transition-colors hover:bg-orwas-stone"
            >
              Track order
            </button>
          </form>

          {/* Not found */}
          {searched && !order && (
            <div className="mt-12 rounded-sm border border-orwas-sand/60 bg-white px-8 py-14 text-center">
              <p className="font-display text-3xl text-orwas-ink">Order not found.</p>
              <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-orwas-clay">
                Double-check your order number — it starts with <span className="font-medium text-orwas-ink">ORW-</span>.
                If you placed an order while signed in, your full history is on your orders page.
              </p>
            </div>
          )}

          {/* Found */}
          {order && meta && (
            <div className="mt-12 overflow-hidden rounded-sm border border-orwas-sand/60 bg-white shadow-[0_20px_60px_rgba(17,24,39,0.05)]">
              {/* Header */}
              <header className="flex flex-col gap-4 border-b border-orwas-sand/60 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-orwas-clay">{order.id}</p>
                  <p className="mt-1 text-sm text-orwas-ink">
                    Placed {formatDate(order.createdAt)} · {order.customerName}
                  </p>
                </div>
                <span className={`self-start border px-4 py-1.5 text-[10px] uppercase tracking-[0.15em] ${meta.badge}`}>
                  {order.status}
                </span>
              </header>

              {/* Status note */}
              <div className="border-b border-orwas-sand/60 bg-orwas-ivory/60 px-6 py-5">
                <div className="flex items-center gap-3">
                  <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${meta.dot}`} />
                  <p className="text-sm leading-relaxed text-orwas-ink/80">{meta.note}</p>
                </div>
              </div>

              {/* Timeline */}
              <div className="flex items-center gap-2 border-b border-orwas-sand/60 px-6 py-6">
                {TIMELINE.map((step, index) => {
                  const reached =
                    order.status === "Delivered" ||
                    (order.status === "Shipped" && step !== "Delivered") ||
                    (order.status === "Processing" && step === "Processing");
                  return (
                    <div key={step} className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${reached ? "bg-orwas-amber" : "bg-orwas-sand"}`} />
                      <span className={`text-[10px] uppercase tracking-[0.15em] ${reached ? "text-orwas-ink" : "text-orwas-clay"}`}>
                        {step}
                      </span>
                      {index < TIMELINE.length - 1 && <span className="mx-1 h-px w-8 bg-orwas-sand sm:w-16" />}
                    </div>
                  );
                })}
              </div>

              {/* Items */}
              <div className="divide-y divide-orwas-sand/40">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 px-6 py-4">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="h-14 w-12 shrink-0 rounded-sm object-cover" />
                    ) : (
                      <div className="h-14 w-12 shrink-0 rounded-sm bg-orwas-mist" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-orwas-ink">{item.name}</p>
                      <p className="text-xs text-orwas-clay">Qty {item.quantity}</p>
                    </div>
                    <p className="text-sm text-orwas-ink">{(item.price * item.quantity).toLocaleString()} KSh</p>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <footer className="flex flex-col gap-4 border-t border-orwas-sand/60 bg-orwas-ivory/60 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-xs text-orwas-clay">
                  <p>Subtotal {order.subtotal.toLocaleString()} KSh · Delivery {order.deliveryFee === 0 ? "Free" : `${order.deliveryFee.toLocaleString()} KSh`}</p>
                  {customer?.address && (
                    <p className="mt-1">Ship to: {customer.name}, {customer.address}</p>
                  )}
                </div>
                <p className="font-display text-xl text-orwas-ink">Total {order.total.toLocaleString()} KSh</p>
              </footer>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}