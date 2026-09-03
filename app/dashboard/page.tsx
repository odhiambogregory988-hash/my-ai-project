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
  updateCustomerAvatar,
  Customer,
  Order,
} from "@/lib/accounts";
import { createSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase";

export default function DashboardPage() {
  const router = useRouter();
  const [session, setSessionState] = useState<Customer | null>(null);
  const [ready, setReady] = useState(false);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [saved, setSaved] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [orderCount, setOrderCount] = useState(0);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [uploading, setUploading] = useState(false);
  const [photoMessage, setPhotoMessage] = useState("");

  useEffect(() => {
    (async () => {
      const customer = await getSession();
      if (!customer) {
        // A leftover ?code= means the confirmation (or OAuth) exchange failed,
        // e.g. an expired link — tell the user instead of bouncing silently.
        const failedExchange = window.location.search.includes("code=");
        router.replace(failedExchange ? "/login?confirmed=error" : "/login?next=/dashboard");
        return;
      }
      setSessionState(customer);
      setName(customer.name);
      setAddress(customer.address);
      const orders = await ordersFor(customer.email);
      setOrderCount(orders.length);
      setRecentOrders(orders.slice(0, 3));
      setReady(true);
    })();
  }, [router]);

  // Time-of-day greeting — like Claude's "Good morning".
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
      ? "A fresh start for today's steps."
      : hour >= 12 && hour < 17
        ? "The day is young — keep moving."
        : hour >= 17 && hour < 21
          ? "Evenings are for winding down in comfort."
          : "Late nights call for comfortable soles.";

  // Sign out, then send the customer straight to Google's account chooser
  // so they can switch to a different account and land back here.
  const switchAccount = async () => {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
        queryParams: { prompt: "select_account" },
      },
    });
  };

  const handleAvatarFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !session) return;
    setUploading(true);
    setPhotoMessage("");
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${session.id}-${Date.now()}.${ext}`;
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.storage.from("avatars").upload(path, file, {
      upsert: true,
      contentType: file.type || "image/jpeg",
    });
    if (error) {
      setPhotoMessage(error.message);
      setUploading(false);
      return;
    }
    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(path);
    const result = await updateCustomerAvatar(session.id, publicUrl);
    if (result.ok) {
      setSessionState({ ...session, avatarUrl: publicUrl });
      setPhotoMessage("Photo updated ✓");
    } else {
      setPhotoMessage(result.message || "Could not save photo.");
    }
    setUploading(false);
  };

  if (!ready || !session) return null;

  // Always show a name at the top — fall back to the email prefix when the
  // profile name is empty (e.g. older Google signups).
  const displayName = session.name.trim() || session.email.split("@")[0] || "there";
  const initials = (displayName.match(/\b\w/g) ?? []).slice(0, 2).join("").toUpperCase() || "OS";

  return (
    <>
      <Header />
      <main className="min-h-screen bg-orwas-ivory pb-20">
        {/* Hero band — name at the top, overlapping content below */}
        <div className="bg-orwas-ink pb-24 pt-32 text-orwas-cream">
          <div className="mx-auto max-w-6xl px-6 md:px-12 lg:px-20">
            <div className="flex flex-wrap items-start justify-between gap-8">
              <div className="flex items-start gap-5">
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full border-2 border-orwas-amber/60 bg-orwas-stone">
                  {session.avatarUrl ? (
                    <img src={session.avatarUrl} alt={session.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center font-display text-xl text-orwas-cream">
                      {initials}
                    </div>
                  )}
                </div>
                <div>
                  <p className="mb-3 text-xs uppercase tracking-[0.25em] text-orwas-amber">Profile dashboard</p>
                  <h1 className="font-display text-4xl md:text-6xl">
                    {greeting}, {displayName.split(" ")[0]}.
                  </h1>
                  <p className="mt-3 text-sm text-orwas-cream/70">{greetingNote}</p>
                </div>
              </div>
              <div className="flex flex-col items-start gap-3 md:items-end">
                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/orders"
                    className="border border-orwas-cream/30 px-6 py-3 text-[10px] uppercase tracking-[0.2em] text-orwas-cream transition-colors hover:bg-orwas-cream hover:text-orwas-ink"
                  >
                    My orders
                  </Link>
                  {isSupabaseConfigured() && (
                    <button
                      onClick={switchAccount}
                      className="border border-orwas-cream/30 px-6 py-3 text-[10px] uppercase tracking-[0.2em] text-orwas-cream transition-colors hover:bg-orwas-cream hover:text-orwas-ink"
                    >
                      Switch account
                    </button>
                  )}
                  <button
                    onClick={async () => {
                      await clearSession();
                      router.push("/login");
                    }}
                    className="border border-orwas-cream/30 px-6 py-3 text-[10px] uppercase tracking-[0.2em] text-orwas-cream transition-colors hover:bg-orwas-cream hover:text-orwas-ink"
                  >
                    Sign out
                  </button>
                </div>
                {isSupabaseConfigured() && (
                  <p className="text-xs text-orwas-cream/60">
                    Switch account signs you out first, then opens Google's account
                    chooser so you can pick another Google account.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Overlapping content — cards pull up over the hero band */}
        <div className="mx-auto max-w-6xl -mt-16 px-6 md:px-12 lg:px-20">
          {/* Stats — horizontal row */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-sm border border-orwas-sand/60 bg-white p-6 shadow-[0_20px_60px_rgba(17,24,39,0.08)]">
              <p className="text-[10px] uppercase tracking-[0.2em] text-orwas-clay">Orders placed</p>
              <p className="mt-2 font-display text-4xl">{orderCount}</p>
            </div>
            <div className="rounded-sm border border-orwas-sand/60 bg-white p-6 shadow-[0_20px_60px_rgba(17,24,39,0.08)]">
              <p className="text-[10px] uppercase tracking-[0.2em] text-orwas-clay">Member since</p>
              <p className="mt-2 font-display text-2xl">{formatDate(session.createdAt)}</p>
            </div>
            <div className="rounded-sm border border-orwas-sand/60 bg-white p-6 shadow-[0_20px_60px_rgba(17,24,39,0.08)]">
              <p className="text-[10px] uppercase tracking-[0.2em] text-orwas-clay">Email</p>
              <p className="mt-2 truncate font-display text-2xl">{session.email}</p>
            </div>
          </div>

          {/* Recent orders — horizontal cards following the stats */}
          <section className="mt-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-3xl text-orwas-ink">Recent orders</h2>
              <Link href="/orders" className="text-[10px] uppercase tracking-[0.2em] text-orwas-amber">
                View all
              </Link>
            </div>
            {recentOrders.length === 0 ? (
              <div className="rounded-sm border border-orwas-sand/60 bg-white px-8 py-12 text-center shadow-[0_20px_60px_rgba(17,24,39,0.06)]">
                <p className="font-display text-2xl text-orwas-ink">No orders yet.</p>
                <p className="mt-2 text-sm text-orwas-clay">
                  When you place an order it will appear here, following your stats.
                </p>
                <Link
                  href="/collections"
                  className="mt-6 inline-block bg-orwas-ink px-8 py-3 text-[10px] uppercase tracking-[0.25em] text-orwas-cream transition-colors hover:bg-orwas-stone"
                >
                  Start shopping
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {recentOrders.map((order) => (
                  <Link
                    key={order.id}
                    href="/orders"
                    className="group rounded-sm border border-orwas-sand/60 bg-white p-5 transition-all hover:border-orwas-amber/60 hover:shadow-[0_20px_50px_rgba(17,24,39,0.06)]"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-sm border border-orwas-sand bg-orwas-mist">
                        {order.items[0]?.image ? (
                          <img src={order.items[0].image} alt={order.items[0].name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[9px] uppercase tracking-widest text-orwas-clay">
                            OS
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-[10px] uppercase tracking-[0.18em] text-orwas-clay">{order.id}</p>
                        <p className="mt-1 truncate font-display text-lg text-orwas-ink">
                          {order.items[0]?.name ?? "Order"}
                          {order.items.length > 1 ? ` +${order.items.length - 1}` : ""}
                        </p>
                        <p className="mt-0.5 text-xs text-orwas-clay">{formatDate(order.createdAt)}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-orwas-sand/50 pt-4">
                      <span
                        className={`border px-2.5 py-1 text-[9px] uppercase tracking-[0.15em] ${
                          order.status === "Processing"
                            ? "border-orwas-amber/40 bg-orwas-amber/15 text-orwas-ink"
                            : order.status === "Shipped"
                              ? "border-blue-200 bg-blue-50 text-blue-700"
                              : order.status === "Delivered"
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                : "border-red-200 bg-red-50 text-red-600"
                        }`}
                      >
                        {order.status}
                      </span>
                      <p className="font-display text-orwas-ink">{order.total.toLocaleString()} KSh</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* Profile — photo, details and security following each other horizontally */}
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {/* Profile photo */}
            <section className="flex flex-col rounded-sm border border-orwas-sand/60 bg-white p-6 shadow-[0_20px_60px_rgba(17,24,39,0.06)]">
              <h2 className="font-display text-2xl text-orwas-ink">Profile photo</h2>
              <p className="mt-2 text-xs leading-relaxed text-orwas-clay">
                A photo makes your account feel personal — it shows on your dashboard and to the store team.
              </p>
              <div className="mt-6 flex flex-col items-start gap-4">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full border-2 border-orwas-amber/50 bg-orwas-ink">
                  {session.avatarUrl ? (
                    <img src={session.avatarUrl} alt={session.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center font-display text-lg text-orwas-cream">
                      {initials}
                    </div>
                  )}
                </div>
                {isSupabaseConfigured() ? (
                  <div>
                    <label className="inline-block cursor-pointer border border-orwas-ink px-5 py-2.5 text-[10px] uppercase tracking-[0.2em] transition-colors hover:bg-orwas-ink hover:text-orwas-cream">
                      {uploading ? "Uploading…" : "Upload photo"}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={uploading}
                        onChange={handleAvatarFile}
                      />
                    </label>
                    {photoMessage && <p className="mt-2 text-xs text-orwas-clay">{photoMessage}</p>}
                  </div>
                ) : (
                  <p className="text-xs text-orwas-clay">Photo upload is available once Supabase is configured.</p>
                )}
              </div>
            </section>

            {/* Profile details */}
            <section className="rounded-sm border border-orwas-sand/60 bg-white p-6 shadow-[0_20px_60px_rgba(17,24,39,0.06)]">
              <h2 className="font-display text-2xl text-orwas-ink">Profile details</h2>
              <p className="mt-2 text-xs text-orwas-clay">Keep your shipping information up to date for faster checkout.</p>
              <form
                className="mt-6 space-y-5"
                onSubmit={async (e) => {
                  e.preventDefault();
                  await updateCustomer(session.id, { name, address });
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

            {/* Security */}
            <section className="rounded-sm border border-orwas-sand/60 bg-white p-6 shadow-[0_20px_60px_rgba(17,24,39,0.06)]">
              <h2 className="font-display text-2xl text-orwas-ink">Security</h2>
              <p className="mt-2 text-xs text-orwas-clay">Change the password you use to sign in.</p>
              {passwordMessage && (
                <p className="mt-5 border border-orwas-amber/40 bg-orwas-amber/10 px-4 py-3 text-xs">{passwordMessage}</p>
              )}
              <form
                className="mt-6 space-y-5"
                onSubmit={async (e) => {
                  e.preventDefault();
                  const result = await changePassword(session.id, currentPassword, newPassword);
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