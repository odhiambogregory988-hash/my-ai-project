"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatDate } from "@/lib/accounts";

interface AdminRow {
  email: string;
  createdAt: string;
}

export default function AdminAdminsPage() {
  const [admins, setAdmins] = useState<AdminRow[]>([]);
  const [owner, setOwner] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/admin/admins");
      const data = await res.json();
      if (res.ok) {
        setAdmins(data.admins);
        setOwner(data.owner);
      } else {
        setError(data.error || "Could not load the admin list.");
      }
      setLoaded(true);
    })();
  }, []);

  const addAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");
    const res = await fetch("/api/admin/admins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (res.ok) {
      setEmail("");
      setMessage(`${data.email} added — they can now sign in with Google.`);
      setAdmins((prev) => [...prev, { email: data.email, createdAt: new Date().toISOString() }]);
    } else {
      setError(data.error || "Could not add that admin.");
    }
    setLoading(false);
  };

  const removeAdmin = async (adminEmail: string) => {
    setError("");
    setMessage("");
    const res = await fetch(`/api/admin/admins?email=${encodeURIComponent(adminEmail)}`, {
      method: "DELETE",
    });
    const data = await res.json();
    if (res.ok) {
      setMessage(`${adminEmail} removed from the admin list.`);
      setAdmins((prev) => prev.filter((a) => a.email !== adminEmail));
    } else {
      setError(data.error || "Could not remove that admin.");
    }
  };

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.assign("/admin/login");
  };

  return (
    <main className="min-h-screen bg-orwas-ivory px-6 py-10 text-orwas-ink md:px-12 lg:px-20">
      <header className="mb-12 rounded-sm border border-orwas-sand/60 bg-white p-6 shadow-[0_20px_60px_rgba(17,24,39,0.04)]">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="mb-2 text-xs uppercase tracking-[0.24em] text-orwas-clay">Orwa Sole Co. / Admin</p>
            <h1 className="font-display text-4xl md:text-5xl">Admin management</h1>
          </div>
          <div className="flex items-center gap-5">
            <button onClick={logout} className="text-xs uppercase tracking-[0.2em] text-orwas-clay transition-colors hover:text-orwas-ink">
              Sign out
            </button>
            <Link href="/admin" className="text-xs uppercase tracking-[0.2em] text-orwas-amber">
              ← Dashboard
            </Link>
          </div>
        </div>
      </header>

      {error && (
        <p role="alert" className="mb-8 border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600">
          {error}
        </p>
      )}
      {message && (
        <p className="mb-8 border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700">{message}</p>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Add an admin */}
        <section className="rounded-sm border border-orwas-sand/60 bg-white p-6 shadow-[0_20px_60px_rgba(17,24,39,0.04)]">
          <h2 className="font-display text-2xl text-orwas-ink">Add an admin</h2>
          <p className="mt-2 text-xs text-orwas-clay">
            Enter the email of the person you trust. They sign in with Google and get full access to manage the store.
          </p>
          <form onSubmit={addAdmin} className="mt-6 flex gap-3">
            <input
              type="email"
              required
              placeholder="teammate@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-orwas-sand bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-orwas-amber"
            />
            <button
              type="submit"
              disabled={loading}
              className="shrink-0 bg-orwas-ink px-6 py-3 text-[10px] uppercase tracking-[0.2em] text-orwas-cream transition-colors hover:bg-orwas-stone disabled:opacity-50"
            >
              {loading ? "Adding…" : "Add"}
            </button>
          </form>
          {owner && (
            <p className="mt-4 text-xs text-orwas-clay">
              Only the owner (<span className="font-medium text-orwas-ink">{owner}</span>) can add or remove admins.
            </p>
          )}
        </section>

        {/* Current admins */}
        <section className="rounded-sm border border-orwas-sand/60 bg-white p-6 shadow-[0_20px_60px_rgba(17,24,39,0.04)]">
          <h2 className="font-display text-2xl text-orwas-ink">Current admins</h2>
          <p className="mt-2 text-xs text-orwas-clay">Everyone on this list can sign in to the admin area.</p>
          {!loaded ? (
            <p className="mt-6 text-sm text-orwas-clay">Loading…</p>
          ) : admins.length === 0 ? (
            <p className="mt-6 text-sm text-orwas-clay">No admins yet.</p>
          ) : (
            <ul className="mt-6 divide-y divide-orwas-sand/50">
              {admins.map((admin) => {
                const isOwner = admin.email.toLowerCase() === owner.toLowerCase();
                return (
                  <li key={admin.email} className="flex items-center justify-between gap-4 py-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-medium text-orwas-ink">{admin.email}</p>
                        {isOwner && (
                          <span className="border border-orwas-amber/40 bg-orwas-amber/15 px-2 py-0.5 text-[9px] uppercase tracking-[0.15em] text-orwas-ink">
                            Owner
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-orwas-clay">Admin since {formatDate(admin.createdAt)}</p>
                    </div>
                    {!isOwner && (
                      <button
                        onClick={() => removeAdmin(admin.email)}
                        className="shrink-0 text-xs uppercase tracking-[0.2em] text-orwas-clay transition-colors hover:text-red-500"
                      >
                        Remove
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}