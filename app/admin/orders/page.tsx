"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  formatDate,
  loadOrders,
  ORDER_STATUSES,
  Order,
  OrderStatus,
  saveOrders,
  updateOrderStatus,
} from "@/lib/accounts";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [mode, setMode] = useState<"supabase" | "demo">("supabase");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/data");
        const data = await res.json();
        if (data.configured) {
          setMode("supabase");
          setOrders(data.orders);
          return;
        }
      } catch {
        // fall through to demo
      }
      setMode("demo");
      setOrders(await loadOrders());
    })();
  }, []);

  const changeStatus = async (id: string, status: OrderStatus) => {
    if (mode === "supabase") {
      await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update-order-status", id, status }),
      });
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    } else {
      await updateOrderStatus(id, status);
      setOrders(await loadOrders());
    }
  };

  const removeOrder = async (id: string) => {
    if (mode === "supabase") {
      await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete-order", id }),
      });
      setOrders((prev) => prev.filter((o) => o.id !== id));
    } else {
      await saveOrders(orders.filter((o) => o.id !== id));
      setOrders(await loadOrders());
    }
  };

  const logout = async () => { await fetch("/api/admin/logout", { method: "POST" }); window.location.assign("/admin/login"); };

  const statusBadge = (status: OrderStatus) =>
    status === "Processing" ? "border-orwas-amber/40 bg-orwas-amber/15 text-orwas-ink"
    : status === "Shipped" ? "border-blue-200 bg-blue-50 text-blue-700"
    : status === "Delivered" ? "border-emerald-200 bg-emerald-50 text-emerald-700"
    : "border-red-200 bg-red-50 text-red-600";

  return (
    <main className="min-h-screen bg-orwas-ivory px-6 py-10 text-orwas-ink md:px-12 lg:px-20">
      <header className="mb-12 rounded-sm border border-orwas-sand/60 bg-white p-6 shadow-[0_20px_60px_rgba(17,24,39,0.04)]">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="mb-2 text-xs uppercase tracking-[0.24em] text-orwas-clay">Orwa Sole Co. / Admin</p>
            <h1 className="font-display text-4xl md:text-5xl">Order management</h1>
          </div>
          <div className="flex items-center gap-5">
            <button onClick={logout} className="text-xs uppercase tracking-[0.2em] text-orwas-clay transition-colors hover:text-orwas-ink">Sign out</button>
            <Link href="/admin" className="text-xs uppercase tracking-[0.2em] text-orwas-amber">← Dashboard</Link>
          </div>
        </div>
      </header>

      {mode === "demo" && (
        <div className="mb-8 border border-orwas-amber/40 bg-orwas-amber/10 px-5 py-4 text-sm text-orwas-ink">
          <p className="font-medium">Browser demo mode</p>
          <p className="mt-1 text-xs text-orwas-clay">
            Add <span className="font-mono">SUPABASE_SERVICE_ROLE_KEY</span> to your environment and run{" "}
            <span className="font-mono">supabase/schema.sql</span> to manage real orders.
          </p>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="rounded-sm border border-orwas-sand/60 bg-white px-8 py-16 text-center">
          <p className="font-display text-2xl text-orwas-ink">No orders yet.</p>
          <p className="mt-2 text-sm text-orwas-clay">Orders appear here the moment a customer checks out.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <article key={order.id} className="overflow-hidden rounded-sm border border-orwas-sand/60 bg-white shadow-[0_20px_60px_rgba(17,24,39,0.04)]">
              <header className="flex flex-col gap-3 border-b border-orwas-sand/50 px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-orwas-clay">{order.id}</p>
                  <p className="text-sm font-medium text-orwas-ink">{order.customerName} · {order.customerEmail}</p>
                  <p className="text-xs text-orwas-clay">{formatDate(order.createdAt)}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`border px-3 py-1 text-[10px] uppercase tracking-[0.15em] ${statusBadge(order.status)}`}>
                    {order.status}
                  </span>
                  <select
                    aria-label="Update order status"
                    value={order.status}
                    onChange={(e) => changeStatus(order.id, e.target.value as OrderStatus)}
                    className="border border-orwas-sand bg-orwas-ivory px-3 py-1.5 text-xs outline-none transition-colors focus:border-orwas-amber"
                  >
                    {ORDER_STATUSES.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => removeOrder(order.id)}
                    className="text-[10px] uppercase tracking-[0.2em] text-orwas-clay transition-colors hover:text-red-500"
                  >
                    Delete
                  </button>
                </div>
              </header>

              <div className="divide-y divide-orwas-sand/40">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 px-6 py-3">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="h-12 w-10 shrink-0 rounded-sm object-cover" />
                    ) : (
                      <div className="h-12 w-10 shrink-0 rounded-sm bg-orwas-mist" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-orwas-ink">{item.name}</p>
                      <p className="text-xs text-orwas-clay">Qty {item.quantity}</p>
                    </div>
                    <p className="text-sm text-orwas-ink">{(item.price * item.quantity).toLocaleString()} KSh</p>
                  </div>
                ))}
              </div>

              <footer className="flex items-center justify-between border-t border-orwas-sand/50 bg-orwas-ivory/60 px-6 py-3">
                <p className="text-xs text-orwas-clay">
                  Subtotal {order.subtotal.toLocaleString()} KSh · Delivery{" "}
                  {order.deliveryFee === 0 ? "Free" : `${order.deliveryFee.toLocaleString()} KSh`}
                </p>
                <p className="font-display text-lg text-orwas-ink">Total {order.total.toLocaleString()} KSh</p>
              </footer>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}