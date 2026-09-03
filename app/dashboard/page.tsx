"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  changePassword,
  clearSession,
  formatDate,
  getSession,
  ordersFor,
  updateCustomer,
} from "@/lib/accounts";

export default function DashboardPage() {
  const router = useRouter();
  const [session, setSessionState] = useState<ReturnType<typeof getSession>>(null);
  const [ready, setReady] = useState(false);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [saved, setSaved] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");

  useEffect(() => {
    const customer = getSession();
    if (!customer) {
      router.replace("/login?next=/dashboard");
      return;
    }
    setSessionState(customer);
    setName(customer.name);
    setAddress(customer.address);
    setReady(true);
  }, [router]);

  if (!ready || !session) return null;

  const orders = ordersFor(session.email);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-orwas-ivory px-6 pb-20 pt-32 text-orwas-ink md:px-12 lg:px-20">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-3 text-xs uppercase tracking-[0.25em] text-orwas-amber">Profile dashboard</p>
              <h1 className="font-display text-5xl md:text-6xl">Hello, {session.name.split(" ")[0]}.</h1>
            </div>
            <div className="flex gap-4">
              <Link
                href="/orders"
                className="border border-orwas-clay/30 px-6 py-3 text-[10px] uppercase tracking-[0.2em] transition-colors hover:bg-orwas-ink hover:text-orwas-cream"
              >
                My orders
              </Link>
              <button
                onClick={() => {
                  clearSession();
                  router.push("/");
                }}
                className="border border-orwas-clay/30 px-6 py-3 text-[10px] uppercase tracking-[0.2em] transition-colors hover:bg-orwas-ink hover:text-orwas-cream"
              >
                Sign out
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3">
            <div className="rounded-sm border border-orwas-sand/60 bg-white p-6">
              <p className="text-[10px] uppercase tracking-[0.2em] text-orwas-clay">Orders placed</p>
              <p className="mt-2 font-display text-4xl">{orders.length}</p>
            </div>
            <div className="rounded-sm border border-orwas-sand/60 bg-white p-6">
              <p className="text-[10px] uppercase tracking-[0.2em] text-orwas-clay">Member since</p>
              <p className="mt-2 font-display text-2xl">{formatDate(session.createdAt)}</p>
            </div>
            <div className="col-span-2 rounded-sm border border-orwas-sand/60 bg-white p-6 md:col-span-1">
              <p className="text-[10px] uppercase tracking-[0.2em] text-orwas-clay">Email</p>
              <p className="mt-2 truncate font-display text-2xl">{session.email}</p>
            </div>
          </div>

          <div className="mt-10 grid gap-10 lg:grid-cols-2">
            {/* Profile details */}
            <section className="rounded-sm border border-orwas-sand/60 bg-white p-8">
              <h2 className="font-display text-3xl">Profile details</h2>
              <p className="mt-2 text-xs text-orwas-clay">Keep your shipping information up to date for faster checkout.</p>

              <form
                className="mt-8 space-y-5"
                onSubmit={(e) => {
                  e.preventDefault();
                  updateCustomer(session.id, { name, address });
                  setSessionState({ ...session, name, address });
                  setSaved(true);
                  setTimeout(() => setSaved(false), 2500);
                }}
              >
                <label className="block">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-orwas-clay">Full name</span>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-2 w-full border-b border-orwas-sand bg-transparent py-3 text-sm outline-none transition-colors focus:border-orwas-amber"
                  />
                </label>
                <label className="block">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-orwas-clay">Shipping address</span>
                  <textarea
                    rows={3}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Street, city, postal code, country"
                    className="mt-2 w-full resize-none border-b border-orwas-sand bg-transparent py-3 text-sm outline-none transition-colors focus:border-orwas-amber"
                  />
                </label>
                <button
                  type="submit"
                  className="bg-orwas-ink px-8 py-3 text-[10px] uppercase tracking-[0.25em] text-orwas-cream transition-colors hover:bg-orwas-stone"
                >
                  {saved ? "Saved ✓" : "Save changes"}
                </button>
              </form>
            </section>

            {/* Change password */}
            <section className="rounded-sm border border-orwas-sand/60 bg-white p-8">
              <h2 className="font-display text-3xl">Security</h2>
              <p className="mt-2 text-xs text-orwas-clay">Change the password you use to sign in.</p>

              {passwordMessage && (
                <p className="mt-5 border border-orwas-amber/40 bg-orwas-amber/10 px-4 py-3 text-xs">{passwordMessage}</p>
              )}

              <form
                className="mt-8 space-y-5"
                onSubmit={(e) => {
                  e.preventDefault();
                  const result = changePassword(session.id, currentPassword, newPassword);
                  setPasswordMessage(result.message || "Password updated.");
                  if (result.ok) {
                    setCurrentPassword("");
                    setNewPassword("");
                  }
                }}
              >
                <label className="block">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-orwas-clay">Current password</span>
                  <input
                    required
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="mt-2 w-full border-b border-orwas-sand bg-transparent py-3 text-sm outline-none transition-colors focus:border-orwas-amber"
                  />
                </label>
                <label className="block">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-orwas-clay">New password</span>
                  <input
                    required
                    type="password"
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="mt-2 w-full border-b border-orwas-sand bg-transparent py-3 text-sm outline-none transition-colors focus:border-orwas-amber"
                  />
                </label>
                <button
                  type="submit"
                  className="bg-orwas-ink px-8 py-3 text-[10px] uppercase tracking-[0.25em] text-orwas-cream transition-colors hover:bg-orwas-stone"
                >
                  Update password
                </button>
              </form>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}