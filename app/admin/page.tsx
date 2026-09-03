"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { loadCustomers, loadOrders, formatDate, Order } from "@/lib/accounts";
import { loadProducts } from "@/lib/store";

const SECTIONS = [
  {
    href: "/admin/products",
    label: "Product management",
    description: "Add, edit, and delete products. Manage inventory and pricing.",
  },
  {
    href: "/admin/customers",
    label: "Customer management",
    description: "View customer accounts and their order activity.",
  },
  {
    href: "/admin/orders",
    label: "Order management",
    description: "Track every order and update shipping status.",
  },
  {
    href: "/admin/admins",
    label: "Admin management",
    description: "Add and remove admin emails. Only the owner can manage this list.",
  },
];

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({ products: 0, customers: 0, orders: 0, revenue: 0 });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [mode, setMode] = useState<"supabase" | "demo">("supabase");

  useEffect(() => {
    (async () => {
      const products = loadProducts();

      const applyData = (customers: { length: number }, orders: Order[]) => {
        setStats({
          products: products.length,
          customers: customers.length,
          orders: orders.length,
          revenue: orders.reduce((sum, o) => sum + o.total, 0),
        });
        setRecentOrders(orders.slice(0, 4));
      };

      try {
        const res = await fetch("/api/admin/data");
        const data = await res.json();
        if (data.configured) {
          setMode("supabase");
          applyData(data.customers, data.orders);
          return;
        }
      } catch {
        // fall through to demo
      }

      setMode("demo");
      applyData(await loadCustomers(), await loadOrders());
    })();
  }, []);

  // Time-of-day greeting — same touch as the customer dashboard.
  const hour = new Date().getHours();
  const greeting =
    hour >= 5 && hour < 12
      ? "Good morning"
      : hour >= 12 && hour < 17
        ? "Good afternoon"
        : hour >= 17 && hour < 21
          ? "Good evening"
          : "Good night";
  const greetingNote =
    hour >= 5 && hour < 12
      ? "Ready to run the store today?"
      : hour >= 12 && hour < 17
        ? "Orders are moving — keep an eye on them."
        : hour >= 17 && hour < 21
          ? "Wrapping up the day's orders?"
          : "Running the store after hours?";

  const logout = async () => { await fetch("/api/admin/logout", { method: "POST" }); window.location.assign("/admin/login"); };

  const statCards = [
    { label: "Products", value: stats.products, href: "/admin/products" },
    { label: "Customers", value: stats.customers, href: "/admin/customers" },
    { label: "Orders", value: stats.orders, href: "/admin/orders" },
    { label: "Revenue", value: `KSh ${stats.revenue.toLocaleString()}`, href: "/admin/orders" },
  ];

  return (
    <main className="min-h-screen bg-orwas-ivory px-6 py-10 text-orwas-ink md:px-12 lg:px-20">
      <header className="mb-12 rounded-sm border border-orwas-sand/60 bg-white p-6 shadow-[0_20px_60px_rgba(17,24,39,0.04)]">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="mb-2 text-xs uppercase tracking-[0.24em] text-orwas-clay">Orwa Sole Co. / Admin</p>
            <h1 className="font-display text-4xl md:text-5xl">Admin dashboard</h1>
            <p className="mt-2 text-sm text-orwas-clay">
              {greeting}. {greetingNote}
            </p>
          </div>
          <div className="flex items-center gap-5">
            <button onClick={logout} className="text-xs uppercase tracking-[0.2em] text-orwas-clay transition-colors hover:text-orwas-ink">Sign out</button>
            <Link href="/" className="text-xs uppercase tracking-[0.2em] underline underline-offset-4">View store</Link>
          </div>
        </div>
      </header>

      {mode === "demo" && (
        <div className="mb-8 border border-orwas-amber/40 bg-orwas-amber/10 px-5 py-4 text-sm text-orwas-ink">
          <p className="font-medium">Browser demo mode</p>
          <p className="mt-1 text-xs text-orwas-clay">
            Add <span className="font-mono">SUPABASE_SERVICE_ROLE_KEY</span> to your environment and run{" "}
            <span className="font-mono">supabase/schema.sql</span> to see real customers and orders.
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map((card) => (
          <Link key={card.label} href={card.href} className="rounded-sm border border-orwas-sand/60 bg-white p-6 transition-shadow hover:shadow-[0_20px_50px_rgba(17,24,39,0.06)]">
            <p className="text-[10px] uppercase tracking-[0.2em] text-orwas-clay">{card.label}</p>
            <p className="mt-2 font-display text-3xl text-orwas-ink">{card.value}</p>
          </Link>
        ))}
      </div>

      {/* Management sections */}
      <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {SECTIONS.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="group flex flex-col justify-between rounded-sm border border-orwas-sand/60 bg-white p-6 transition-all hover:border-orwas-amber/60 hover:shadow-[0_20px_50px_rgba(17,24,39,0.06)]"
          >
            <div>
              <p className="font-display text-2xl text-orwas-ink">{section.label}</p>
              <p className="mt-3 text-sm leading-relaxed text-orwas-clay">{section.description}</p>
            </div>
            <p className="mt-6 text-[10px] uppercase tracking-[0.25em] text-orwas-amber transition-transform duration-300 group-hover:translate-x-1">
              Open →
            </p>
          </Link>
        ))}
      </div>

      {/* Recent orders */}
      <section className="mt-10 overflow-hidden rounded-sm border border-orwas-sand/60 bg-white">
        <div className="flex items-center justify-between border-b border-orwas-sand/60 px-6 py-4">
          <h2 className="font-display text-2xl text-orwas-ink">Recent orders</h2>
          <Link href="/admin/orders" className="text-[10px] uppercase tracking-[0.2em] text-orwas-amber">View all</Link>
        </div>
        {recentOrders.length === 0 ? (
          <p className="px-6 py-10 text-sm text-orwas-clay">No orders yet — they will appear here as customers check out.</p>
        ) : (
          <div className="divide-y divide-orwas-sand/50">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between gap-4 px-6 py-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-orwas-ink">{order.id} · {order.customerName}</p>
                  <p className="text-xs text-orwas-clay">{formatDate(order.createdAt)} · {order.items.length} item(s)</p>
                </div>
                <div className="flex shrink-0 items-center gap-4">
                  <span className={`border px-3 py-1 text-[10px] uppercase tracking-[0.15em] ${
                    order.status === "Processing" ? "border-orwas-amber/40 bg-orwas-amber/15 text-orwas-ink"
                    : order.status === "Shipped" ? "border-blue-200 bg-blue-50 text-blue-700"
                    : order.status === "Delivered" ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-red-200 bg-red-50 text-red-600"
                  }`}>
                    {order.status}
                  </span>
                  <p className="font-display text-orwas-ink">{order.total.toLocaleString()} KSh</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
