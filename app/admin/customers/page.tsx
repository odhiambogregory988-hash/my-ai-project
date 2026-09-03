"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatDate, loadCustomers, ordersFor, saveCustomers, Customer } from "@/lib/accounts";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    setCustomers(loadCustomers());
  }, []);

  const removeCustomer = (id: string) => {
    const next = customers.filter((c) => c.id !== id);
    saveCustomers(next);
    setCustomers(next);
  };

  const logout = async () => { await fetch("/api/admin/logout", { method: "POST" }); window.location.assign("/admin/login"); };

  return (
    <main className="min-h-screen bg-orwas-ivory px-6 py-10 text-orwas-ink md:px-12 lg:px-20">
      <header className="mb-12 rounded-sm border border-orwas-sand/60 bg-white p-6 shadow-[0_20px_60px_rgba(17,24,39,0.04)]">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="mb-2 text-xs uppercase tracking-[0.24em] text-orwas-clay">Orwa Sole Co. / Admin</p>
            <h1 className="font-display text-4xl md:text-5xl">Customer management</h1>
          </div>
          <div className="flex items-center gap-5">
            <button onClick={logout} className="text-xs uppercase tracking-[0.2em] text-orwas-clay transition-colors hover:text-orwas-ink">Sign out</button>
            <Link href="/admin" className="text-xs uppercase tracking-[0.2em] text-orwas-amber">← Dashboard</Link>
          </div>
        </div>
      </header>

      {customers.length === 0 ? (
        <div className="rounded-sm border border-orwas-sand/60 bg-white px-8 py-16 text-center">
          <p className="font-display text-2xl text-orwas-ink">No customers yet.</p>
          <p className="mt-2 text-sm text-orwas-clay">Customer accounts will appear here as people register on the site.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-sm border border-orwas-sand/60 bg-white shadow-[0_20px_60px_rgba(17,24,39,0.04)]">
          <div className="overflow-x-auto">
            <div className="min-w-[720px]">
              {customers.map((customer) => (
                <div key={customer.id} className="grid grid-cols-[1.6fr_1.2fr_1fr_auto] items-center gap-4 border-b border-orwas-sand/50 px-5 py-5 last:border-b-0">
                  <div className="min-w-0">
                    <p className="font-display text-xl text-orwas-ink">{customer.name}</p>
                    <p className="mt-1 text-xs text-orwas-clay">Member since {formatDate(customer.createdAt)}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm text-orwas-ink">{customer.email}</p>
                    <p className="mt-1 truncate text-xs text-orwas-clay">{customer.address || "No shipping address saved"}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-orwas-clay">Orders</p>
                    <p className="mt-1 font-display text-2xl text-orwas-ink">{ordersFor(customer.email).length}</p>
                  </div>
                  <button
                    onClick={() => removeCustomer(customer.id)}
                    className="text-xs uppercase tracking-[0.2em] text-orwas-clay transition-colors hover:text-red-500"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}