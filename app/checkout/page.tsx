"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useStore } from "@/components/StoreProvider";
import { formatPrice, DELIVERY_FEE, FREE_SHIPPING_THRESHOLD } from "@/lib/store";
import { createOrder, getSession, Order } from "@/lib/accounts";

/* ============================================================
   Checkout page — ORWAS premium, Amazon-checkout structure.

   Three steps: Delivery details → Delivery method → Review & place order.
   No payment gateway yet (that's the partner's integration), so "place
   order" creates the order with status "Processing" and shows the
   confirmation screen — the same flow /orders uses.
   ============================================================ */

type DeliveryMethod = "standard" | "express";

interface AddressForm {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  notes: string;
}

const EMPTY_FORM: AddressForm = {
  fullName: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  notes: "",
};

/** Nairobi + Kenya-major cities as suggestions; free text so nobody is blocked. */
const CITY_SUGGESTIONS = [
  "Nairobi",
  "Mombasa",
  "Kisumu",
  "Nakuru",
  "Eldoret",
  "Thika",
  "Malindi",
  "Kakamega",
  "Nyeri",
  "Machakos",
];

const EXPRESS_FEE = 1500;

function StepBadge({ step, label, active, done, onEdit }: {
  step: number;
  label: string;
  active: boolean;
  done: boolean;
  onEdit?: () => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <span
        className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-medium transition-colors ${
          done ? "bg-emerald-600 text-white" : active ? "text-orwas-ink" : "text-orwas-clay"
        }`}
        style={
          active && !done
            ? { backgroundColor: "var(--color-amber)" }
            : done
              ? undefined
              : { border: "1px solid rgba(17,24,39,0.15)" }
        }
      >
        {done ? (
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          step
        )}
      </span>
      <span className={`text-[11px] uppercase tracking-[0.2em] ${active ? "font-medium text-orwas-ink" : "text-orwas-clay"}`}>
        {label}
      </span>
      {done && onEdit && !active && (
        <button
          onClick={onEdit}
          className="text-[10px] uppercase tracking-wider text-orwas-clay underline-offset-2 hover:text-orwas-ink hover:underline"
        >
          Edit
        </button>
      )}
    </div>
  );
}

function CheckoutContent() {
  const router = useRouter();
  const { cart, cartReady, locale, currency, clearCart } = useStore();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [form, setForm] = useState<AddressForm>(EMPTY_FORM);
  const [delivery, setDelivery] = useState<DeliveryMethod>("standard");
  const [placing, setPlacing] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof AddressForm, string>>>({});
  const [placeError, setPlaceError] = useState("");
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  /* Prefill from the customer profile when they arrive signed in */
  useEffect(() => {
    (async () => {
      const session = await getSession();
      if (session) {
        setForm((f) => ({
          ...f,
          fullName: f.fullName || session.name || "",
          email: f.email || session.email || "",
          address: f.address || session.address || "",
        }));
      }
    })();
  }, []);

  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);
  const itemCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);
  const deliveryFee = useMemo(() => {
    if (delivery === "express") return EXPRESS_FEE;
    return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : DELIVERY_FEE;
  }, [delivery, subtotal]);
  const total = subtotal + deliveryFee;

  /* Empty cart → back to the store. Only after the cart has hydrated from
     localStorage, so a refresh on /checkout doesn't bounce the customer
     before their saved cart reappears. */
  useEffect(() => {
    if (cartReady && cart.length === 0 && !placedOrder) {
      router.replace("/collections");
    }
  }, [cartReady, cart.length, placedOrder, router]);

  const validate = (): boolean => {
    const next: Partial<Record<keyof AddressForm, string>> = {};
    if (!form.fullName.trim()) next.fullName = "Enter your full name";
    if (!/^[+]?[0-9\s-]{9,15}$/.test(form.phone.trim())) next.phone = "Enter a valid phone number";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) next.email = "Enter a valid email";
    if (!form.address.trim()) next.address = "Enter your street address";
    if (!form.city.trim()) next.city = "Enter your city or town";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handlePlaceOrder = async () => {
    if (placing) return;
    setPlacing(true);
    setPlaceError("");
    try {
      const session = await getSession();
      if (!session) {
        // Not signed in: keep the bag + checkout details, come back after login
        window.sessionStorage.setItem("orwas-pending-order", JSON.stringify(cart));
        window.location.assign("/login?next=/checkout");
        return;
      }
      const order = await createOrder(
        session,
        cart.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        })),
        { deliveryFee },
      );
      clearCart();
      setPlacedOrder(order);
    } catch {
      setPlaceError("Could not place the order — please try again.");
    } finally {
      setPlacing(false);
    }
  };

  /* ---------- Confirmation screen ---------- */
  if (placedOrder) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-orwas-ivory px-6 pb-20 pt-32 text-orwas-ink md:px-12 lg:px-20">
          <div className="mx-auto max-w-2xl">
            <div className="rounded-md bg-white p-10 text-center shadow-[0_2px_8px_rgba(17,24,39,0.08)]" style={{ border: "1px solid rgba(17,24,39,0.08)" }}>
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                <svg className="h-7 w-7 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="mb-2 text-xs uppercase tracking-[0.25em] text-orwas-amber">Order confirmed</p>
              <h1 className="font-display text-3xl md:text-4xl">Thank you, {placedOrder.customerName.split(" ")[0] || "friend"}.</h1>
              <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-orwas-clay">
                Your order <span className="font-medium text-orwas-ink">{placedOrder.id}</span> is confirmed and being
                prepared. We&apos;ll update the status as it moves from Processing to Delivered.
              </p>

              <div className="mx-auto mt-8 max-w-sm rounded-sm bg-orwas-ivory p-5 text-left">
                <div className="flex justify-between text-sm">
                  <span className="text-orwas-clay">Order total</span>
                  <span className="font-medium text-orwas-ink">{formatPrice(placedOrder.total, locale, currency)}</span>
                </div>
                <div className="mt-1.5 flex justify-between text-sm">
                  <span className="text-orwas-clay">Delivery</span>
                  <span className="text-orwas-ink">
                    {delivery === "express" ? "Express — tomorrow before 6pm" : "Standard — 2–4 business days"}
                  </span>
                </div>
                <div className="mt-1.5 flex justify-between text-sm">
                  <span className="text-orwas-clay">Deliver to</span>
                  <span className="max-w-[60%] truncate text-right text-orwas-ink">{form.city || "Your address"}</span>
                </div>
              </div>

              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <a
                  href="/orders?placed=1"
                  className="rounded-full px-8 py-3.5 text-[11px] font-medium uppercase tracking-[0.2em] text-orwas-ink transition-opacity hover:opacity-90"
                  style={{ backgroundColor: "var(--color-amber)" }}
                >
                  View my orders
                </a>
                <a
                  href="/collections"
                  className="rounded-full px-8 py-3.5 text-[10px] uppercase tracking-[0.2em] text-orwas-clay transition-colors hover:text-orwas-ink"
                >
                  Continue shopping
                </a>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  /* ---------- Main checkout ---------- */
  return (
    <>
      <Header />
      <main className="min-h-screen bg-orwas-ivory px-5 pb-24 pt-28 text-orwas-ink md:px-8">
        <div className="mx-auto max-w-6xl">
          {/* Step header */}
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.25em] text-orwas-amber">Secure checkout</p>
              <h1 className="font-display text-4xl md:text-5xl">Checkout</h1>
            </div>
            <div className="flex flex-wrap items-center gap-5 md:gap-6">
              <StepBadge step={1} label="Details" active={step === 1} done={step > 1} onEdit={() => setStep(1)} />
              <StepBadge step={2} label="Delivery" active={step === 2} done={step > 2} onEdit={() => setStep(2)} />
              <StepBadge step={3} label="Review" active={step === 3} done={false} />
            </div>
          </div>

          {placeError && (
            <div className="mt-6 rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{placeError}</div>
          )}

          <div className="mt-10 flex flex-col gap-10 lg:flex-row">
            {/* ---------- Left column: steps ---------- */}
            <div className="flex-1">
              {/* Step 1 — Delivery details */}
              {step === 1 && (
                <section className="rounded-md bg-white p-6 shadow-[0_2px_8px_rgba(17,24,39,0.08)]" style={{ border: "1px solid rgba(17,24,39,0.08)" }}>
                  <h2 className="mb-5 text-lg font-medium">Delivery details</h2>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field
                      label="Full name"
                      value={form.fullName}
                      error={errors.fullName}
                      onChange={(v) => setForm({ ...form, fullName: v })}
                      placeholder="Jane Wanjiku"
                      autoComplete="name"
                    />
                    <Field
                      label="Phone"
                      value={form.phone}
                      error={errors.phone}
                      onChange={(v) => setForm({ ...form, phone: v })}
                      placeholder="+254 7XX XXX XXX"
                      autoComplete="tel"
                    />
                    <Field
                      label="Email"
                      value={form.email}
                      error={errors.email}
                      onChange={(v) => setForm({ ...form, email: v })}
                      placeholder="you@email.com"
                      autoComplete="email"
                    />
                    <Field
                      label="City / Town"
                      value={form.city}
                      error={errors.city}
                      onChange={(v) => setForm({ ...form, city: v })}
                      placeholder="Nairobi"
                      list="city-suggestions"
                      autoComplete="address-level2"
                    />
                    <div className="sm:col-span-2">
                      <Field
                        label="Street address"
                        value={form.address}
                        error={errors.address}
                        onChange={(v) => setForm({ ...form, address: v })}
                        placeholder="Estate, street, house / apartment"
                        autoComplete="street-address"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="mb-1.5 block text-[10px] uppercase tracking-[0.2em] text-orwas-clay">
                        Delivery notes (optional)
                      </label>
                      <textarea
                        value={form.notes}
                        onChange={(e) => setForm({ ...form, notes: e.target.value })}
                        placeholder="Gate code, landmark, preferred drop-off…"
                        rows={2}
                        className="w-full rounded-sm bg-orwas-ivory px-3.5 py-3 text-sm text-orwas-ink outline-none transition-colors placeholder:text-orwas-clay/40 focus:border-orwas-amber"
                        style={{ border: "1px solid rgba(17,24,39,0.1)" }}
                      />
                    </div>
                  </div>
                  <datalist id="city-suggestions">
                    {CITY_SUGGESTIONS.map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>

                  <button
                    onClick={() => {
                      if (validate()) setStep(2);
                    }}
                    className="mt-6 w-full rounded-full py-3.5 text-[11px] font-medium uppercase tracking-[0.2em] text-orwas-ink transition-opacity hover:opacity-90 sm:w-auto sm:px-10"
                    style={{ backgroundColor: "var(--color-amber)" }}
                  >
                    Continue to delivery method
                  </button>
                </section>
              )}

              {/* Step 2 — Delivery method */}
              {step === 2 && (
                <section className="rounded-md bg-white p-6 shadow-[0_2px_8px_rgba(17,24,39,0.08)]" style={{ border: "1px solid rgba(17,24,39,0.08)" }}>
                  <h2 className="mb-5 text-lg font-medium">Delivery method</h2>
                  <div className="space-y-3">
                    <MethodCard
                      selected={delivery === "standard"}
                      onSelect={() => setDelivery("standard")}
                      title="Standard delivery"
                      eta="2–4 business days"
                      price={subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : DELIVERY_FEE}
                      priceLabel={subtotal >= FREE_SHIPPING_THRESHOLD ? "FREE" : undefined}
                      note={
                        subtotal >= FREE_SHIPPING_THRESHOLD
                          ? "Your order qualifies for complimentary delivery."
                          : `Free over ${formatPrice(FREE_SHIPPING_THRESHOLD, locale, currency)}`
                      }
                    />
                    <MethodCard
                      selected={delivery === "express"}
                      onSelect={() => setDelivery("express")}
                      title="Express delivery"
                      eta="Tomorrow, before 6pm"
                      price={EXPRESS_FEE}
                      note="Order by 2pm for next-day delivery in Nairobi."
                    />
                  </div>

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <button
                      onClick={() => setStep(1)}
                      className="rounded-full py-3 text-[10px] uppercase tracking-[0.2em] text-orwas-clay transition-colors hover:text-orwas-ink sm:px-8"
                    >
                      ← Back to details
                    </button>
                    <button
                      onClick={() => setStep(3)}
                      className="rounded-full py-3.5 text-[11px] font-medium uppercase tracking-[0.2em] text-orwas-ink transition-opacity hover:opacity-90 sm:px-10"
                      style={{ backgroundColor: "var(--color-amber)" }}
                    >
                      Review order
                    </button>
                  </div>
                </section>
              )}

              {/* Step 3 — Review & place order */}
              {step === 3 && (
                <section className="rounded-md bg-white p-6 shadow-[0_2px_8px_rgba(17,24,39,0.08)]" style={{ border: "1px solid rgba(17,24,39,0.08)" }}>
                  <h2 className="mb-5 text-lg font-medium">Review your order</h2>

                  {/* Shipping summary */}
                  <div className="mb-6 grid grid-cols-1 gap-4 rounded-sm bg-orwas-ivory p-4 sm:grid-cols-2">
                    <div>
                      <p className="mb-1 text-[10px] uppercase tracking-[0.2em] text-orwas-clay">Deliver to</p>
                      <p className="text-sm font-medium text-orwas-ink">{form.fullName}</p>
                      <p className="text-xs leading-relaxed text-orwas-clay">
                        {form.address}, {form.city}
                        <br />
                        {form.phone} · {form.email}
                      </p>
                      {form.notes && <p className="mt-1 text-[11px] italic text-orwas-clay">“{form.notes}”</p>}
                    </div>
                    <div>
                      <p className="mb-1 text-[10px] uppercase tracking-[0.2em] text-orwas-clay">Delivery method</p>
                      <p className="text-sm font-medium text-orwas-ink">
                        {delivery === "express" ? "Express — tomorrow before 6pm" : "Standard — 2–4 business days"}
                      </p>
                      <p className="text-xs text-orwas-clay">
                        Fee: {deliveryFee === 0 ? "FREE" : formatPrice(deliveryFee, locale, currency)}
                      </p>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="divide-y" style={{ borderColor: "rgba(17,24,39,0.06)" }}>
                    {cart.map((item) => (
                      <div key={item.id} className="flex items-center gap-4 py-3">
                        <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-sm" style={{ backgroundColor: "rgba(17,24,39,0.05)" }}>
                          {item.image ? (
                            <Image src={item.image} alt={item.name} fill sizes="56px" className="object-cover" />
                          ) : (
                            <div className="h-full w-full" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-orwas-ink">{item.name}</p>
                          <p className="text-xs text-orwas-clay">Qty {item.quantity}</p>
                        </div>
                        <p className="text-sm text-orwas-ink">{formatPrice(item.price * item.quantity, locale, currency)}</p>
                      </div>
                    ))}
                  </div>

                  {/* Payment note — gateway comes later */}
                  <div className="mt-6 flex items-start gap-3 rounded-sm px-4 py-3" style={{ backgroundColor: "rgba(212,175,55,0.08)", border: "1px solid rgba(212,175,55,0.25)" }}>
                    <svg className="mt-0.5 h-4 w-4 shrink-0 text-orwas-ink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-xs leading-relaxed text-orwas-ink">
                      Payment on delivery or via a link sent to your email — online card payment is coming soon.
                    </p>
                  </div>

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <button
                      onClick={() => setStep(2)}
                      className="rounded-full py-3 text-[10px] uppercase tracking-[0.2em] text-orwas-clay transition-colors hover:text-orwas-ink sm:px-8"
                    >
                      ← Back to delivery
                    </button>
                    <button
                      onClick={handlePlaceOrder}
                      disabled={placing}
                      className="rounded-full py-3.5 text-[11px] font-medium uppercase tracking-[0.2em] text-orwas-ink transition-opacity hover:opacity-90 disabled:opacity-60 sm:px-10"
                      style={{ backgroundColor: "var(--color-amber)" }}
                    >
                      {placing ? "Placing your order…" : `Place order — ${formatPrice(total, locale, currency)}`}
                    </button>
                  </div>
                </section>
              )}
            </div>

            {/* ---------- Right column: sticky order summary ---------- */}
            <aside className="shrink-0 lg:w-80">
              <div className="lg:sticky lg:top-32">
                <div className="rounded-md bg-white p-5 shadow-[0_2px_8px_rgba(17,24,39,0.1)]" style={{ border: "1px solid rgba(17,24,39,0.08)" }}>
                  <p className="mb-3 text-[10px] uppercase tracking-[0.25em] text-orwas-amber">Order summary</p>
                  <div className="max-h-56 space-y-2.5 overflow-y-auto pr-1">
                    {cart.map((item) => (
                      <div key={item.id} className="flex items-center gap-3">
                        <div className="relative h-12 w-10 shrink-0 overflow-hidden rounded-sm" style={{ backgroundColor: "rgba(17,24,39,0.05)" }}>
                          {item.image && <Image src={item.image} alt={item.name} fill sizes="40px" className="object-cover" />}
                        </div>
                        <p className="min-w-0 flex-1 truncate text-xs text-orwas-ink">
                          {item.name} <span className="text-orwas-clay">× {item.quantity}</span>
                        </p>
                        <p className="text-xs text-orwas-ink">{formatPrice(item.price * item.quantity, locale, currency)}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 space-y-2 pt-4" style={{ borderTop: "1px solid rgba(17,24,39,0.08)" }}>
                    <Row label={`Subtotal (${itemCount} ${itemCount === 1 ? "item" : "items"})`} value={formatPrice(subtotal, locale, currency)} />
                    <Row
                      label={delivery === "express" ? "Express delivery" : "Delivery"}
                      value={deliveryFee === 0 ? "FREE" : formatPrice(deliveryFee, locale, currency)}
                      highlight={deliveryFee === 0}
                    />
                    <div className="flex justify-between pt-2" style={{ borderTop: "1px solid rgba(17,24,39,0.08)" }}>
                      <span className="text-sm font-medium text-orwas-ink">Order total</span>
                      <span className="font-display text-lg font-medium text-orwas-ink">{formatPrice(total, locale, currency)}</span>
                    </div>
                  </div>
                  <p className="mt-4 flex items-center gap-1.5 text-[10px] text-orwas-clay">
                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    Secure checkout · Easy returns
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

/* ---------- Small shared pieces ---------- */

function Field({ label, value, error, onChange, placeholder, autoComplete, list }: {
  label: string;
  value: string;
  error?: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
  list?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[10px] uppercase tracking-[0.2em] text-orwas-clay">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        list={list}
        className="w-full rounded-sm bg-orwas-ivory px-3.5 py-3 text-sm text-orwas-ink outline-none transition-colors placeholder:text-orwas-clay/40 focus:border-orwas-amber"
        style={{ border: `1px solid ${error ? "rgb(248 113 113)" : "rgba(17,24,39,0.1)"}` }}
      />
      {error && <p className="mt-1 text-[11px] text-red-500">{error}</p>}
    </div>
  );
}

function MethodCard({ selected, onSelect, title, eta, price, priceLabel, note }: {
  selected: boolean;
  onSelect: () => void;
  title: string;
  eta: string;
  price: number;
  priceLabel?: string;
  note?: string;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex w-full items-center gap-4 rounded-md px-4 py-4 text-left transition-colors ${selected ? "bg-orwas-ivory" : "bg-white hover:bg-orwas-ivory/60"}`}
      style={{ border: `1px solid ${selected ? "var(--color-amber)" : "rgba(17,24,39,0.1)"}` }}
    >
      <span
        className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full"
        style={{ border: `2px solid ${selected ? "var(--color-amber)" : "rgba(17,24,39,0.25)"}` }}
      >
        {selected && <span className="h-2 w-2 rounded-full" style={{ backgroundColor: "var(--color-amber)" }} />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-orwas-ink">{title}</span>
        <span className="block text-xs text-orwas-clay">{eta}{note ? ` · ${note}` : ""}</span>
      </span>
      <span className="shrink-0 text-sm font-medium text-orwas-ink">{priceLabel ?? formatPrice(price, "en-KE", "KES")}</span>
    </button>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-xs text-orwas-clay">{label}</span>
      <span className={`text-xs ${highlight ? "font-medium text-emerald-700" : "text-orwas-ink"}`}>{value}</span>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={null}>
      <CheckoutContent />
    </Suspense>
  );
}
