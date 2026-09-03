"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useStore } from "@/components/StoreProvider";
import { createOrder, formatDate, getSession, ordersFor, Order } from "@/lib/accounts";

const STATUS_STYLES: Record<string, string> = {
  Processing: "bg-orwas-amber/15 text-orwas-ink border-orwas-amber/40",
  Shipped: "bg-blue-50 text-blue-700 border-blue-200",
  Delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Cancelled: "bg-red-50 text-red-600 border-red-200",
};

function OrdersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { clearCart } = useStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [ready, setReady] = useState(false);
  const [placed, setPlaced] = useState(false);

  useEffect(() => {
    (async () => {
      const session = await getSession();

      if (!session) {
        router.replace("/login?next=/orders");
        return;
      }

      // Auto-place any order that was waiting for the customer to sign in
      const pending = window.sessionStorage.getItem("orwas-pending-order");
      if (pending) {
        window.sessionStorage.removeItem("orwas-pending-order");
        try {
          const items = JSON.parse(pending);
          if (Array.isArray(items) && items.length > 0) {
            await createOrder(session, items);
            clearCart();
            setPlaced(true);
          }
        } catch {
          // ignore malformed pending order
        }
      }

      if (searchParams.get("placed") === "1") setPlaced(true);

      setOrders(await ordersFor(session.email));
      setReady(true);
    })();
  }, [router, searchParams, clearCart]);

  if (!ready) return null;

  return (
    <>
      <Header />
      <main className="min-h-screen bg-orwas-ivory px-6 pb-20 pt-32 text-orwas-ink md:px-12 lg:px-20">
        <div className="mx-auto max-w-4xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-3 text-xs uppercase tracking-[0.25em] text-orwas-amber">Order history</p>
              <h1 className="font-display text-5xl md:text-6xl">Your orders.</h1>
            </div>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/track"
                className="border border-orwas-clay/30 px-6 py-3 text-center text-[10px] uppercase tracking-[0.2em] transition-colors hover:bg-orwas-ink hover:text-orwas-cream"
              >
                Track by order number
              </Link>
              <Link
                href="/collections"
                className="border border-orwas-clay/30 px-6 py-3 text-center text-[10px] uppercase tracking-[0.2em] transition-colors hover:bg-orwas-ink hover:text-orwas-cream"
              >
                Continue shopping
              </Link>
            </div>
          </div>

          {placed && (
            <div className="mt-10 flex items-center gap-4 border border-emerald-200 bg-emerald-50 px-6 py-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                <svg className="h-5 w-5 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="font-display text-xl text-emerald-900">Order placed — thank you!</p>
                <p className="text-xs text-emerald-700">We&apos;ve received your order and will update the status as it ships.</p>
              </div>
            </div>
          )}

          {orders.length === 0 ? (
            <div className="mt-14 rounded-sm border border-orwas-sand/60 bg-white px-8 py-16 text-center">
              <p className="font-display text-3xl text-orwas-ink">No orders yet.</p>
              <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-orwas-clay">
                When you place an order it will appear here with live status updates from
                Processing to Delivered.
              </p>
              <Link
                href="/collections"
                className="mt-8 inline-block bg-orwas-ink px-8 py-4 text-[10px] uppercase tracking-[0.3em] text-orwas-cream transition-colors hover:bg-orwas-stone"
              >
                Shop the collection
              </Link>
            </div>
          ) : (
            <div className="mt-12 space-y-6">
              {orders.map((order) => (
                <article key={order.id} className="overflow-hidden rounded-sm border border-orwas-sand/60 bg-white">
                  <header className="flex flex-col gap-3 border-b border-orwas-sand/60 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-orwas-clay">{order.id}</p>
                      <p className="mt-1 text-sm text-orwas-ink">Placed {formatDate(order.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`border px-3 py-1 text-[10px] uppercase tracking-[0.15em] ${STATUS_STYLES[order.status]}`}>
                        {order.status}
                      </span>
                      <p className="font-display text-xl text-orwas-ink">
                        {order.total.toLocaleString()} KSh
                      </p>
                    </div>
                  </header>

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

                  {/* Status timeline */}
                  <div className="flex flex-wrap items-center gap-2 border-t border-orwas-sand/60 px-6 py-4">
                    {(["Processing", "Shipped", "Delivered"] as const).map((step, index) => {
                      const reached =
                        order.status === "Delivered" ||
                        (order.status === "Shipped" && step !== "Delivered") ||
                        (order.status === "Processing" && step === "Processing");
                      return (
                        <div key={step} className="flex items-center gap-2">
                          <span
                            className={`flex h-2.5 w-2.5 rounded-full ${
                              reached ? "bg-orwas-amber" : "bg-orwas-sand"
                            }`}
                          />
                          <span className={`text-[10px] uppercase tracking-[0.15em] ${reached ? "text-orwas-ink" : "text-orwas-clay"}`}>
                            {step}
                          </span>
                          {index < 2 && <span className="mx-1 h-px w-6 bg-orwas-sand" />}
                        </div>
                      );
                    })}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function OrdersPage() {
  return (
    <Suspense>
      <OrdersContent />
    </Suspense>
  );
}