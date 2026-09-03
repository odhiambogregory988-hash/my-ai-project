"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  return (
    <>
      <Header />
      <main className="min-h-screen bg-orwas-ivory px-6 pb-20 pt-32 text-orwas-ink md:px-12 lg:px-20">
        <div className="mx-auto max-w-6xl">
          <p className="mb-3 text-xs uppercase tracking-[0.25em] text-orwas-amber">
            Contact
          </p>
          <h1 className="font-display text-5xl md:text-6xl">We&apos;d love to hear from you.</h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-orwas-ink/70">
            Questions about sizing, an order, or a piece from the archive — our team
            responds within 24 hours.
          </p>

          <div className="mt-14 grid gap-10 lg:grid-cols-[1fr_1.2fr]">
            {/* Contact details */}
            <div className="space-y-8">
              {[
                { label: "Email", value: "hello@orwasole.co", hint: "Orders & general enquiries" },
                { label: "Phone / WhatsApp", value: "+254 700 000 000", hint: "Mon–Sat, 9am–6pm EAT" },
                { label: "Flagship Studio", value: "Nairobi, Kenya", hint: "By appointment only" },
              ].map((item) => (
                <div key={item.label} className="border-b border-orwas-sand/60 pb-6">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-orwas-clay">{item.label}</p>
                  <p className="mt-2 font-display text-2xl">{item.value}</p>
                  <p className="mt-1 text-xs text-orwas-clay">{item.hint}</p>
                </div>
              ))}

              <div className="rounded-sm bg-orwas-ink p-6 text-orwas-cream">
                <p className="text-[10px] uppercase tracking-[0.25em] text-orwas-amber mb-3">Returns & exchanges</p>
                <p className="text-sm leading-relaxed text-orwas-cream/70">
                  Changed your mind? We offer complimentary returns within 14 days of
                  delivery on unworn pieces.
                </p>
              </div>
            </div>

            {/* Contact form */}
            <div className="rounded-sm border border-orwas-sand/60 bg-white p-8">
              {sent ? (
                <div className="flex h-full flex-col items-center justify-center py-16 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-orwas-amber/15">
                    <svg className="h-6 w-6 text-orwas-amber" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="mt-6 font-display text-3xl">Message sent.</h2>
                  <p className="mt-3 max-w-sm text-sm leading-relaxed text-orwas-clay">
                    Thank you, {form.name.split(" ")[0] || "friend"}. We&apos;ll be in touch
                    at {form.email || "your email"} within 24 hours.
                  </p>
                  <button
                    onClick={() => {
                      setSent(false);
                      setForm({ name: "", email: "", message: "" });
                    }}
                    className="mt-8 border border-orwas-clay/30 px-6 py-3 text-[10px] uppercase tracking-[0.25em] text-orwas-ink transition-colors hover:bg-orwas-ink hover:text-orwas-cream"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setSent(true);
                  }}
                  className="space-y-6"
                >
                  <div className="grid gap-6 md:grid-cols-2">
                    <label className="block">
                      <span className="text-[10px] uppercase tracking-[0.2em] text-orwas-clay">Name</span>
                      <input
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="Your name"
                        className="mt-2 w-full border-b border-orwas-sand bg-transparent py-3 text-sm outline-none transition-colors focus:border-orwas-amber"
                      />
                    </label>
                    <label className="block">
                      <span className="text-[10px] uppercase tracking-[0.2em] text-orwas-clay">Email</span>
                      <input
                        required
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="you@email.com"
                        className="mt-2 w-full border-b border-orwas-sand bg-transparent py-3 text-sm outline-none transition-colors focus:border-orwas-amber"
                      />
                    </label>
                  </div>
                  <label className="block">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-orwas-clay">Message</span>
                    <textarea
                      required
                      rows={5}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="How can we help?"
                      className="mt-2 w-full resize-none border-b border-orwas-sand bg-transparent py-3 text-sm outline-none transition-colors focus:border-orwas-amber"
                    />
                  </label>
                  <button
                    type="submit"
                    className="w-full bg-orwas-ink py-4 text-[10px] uppercase tracking-[0.3em] text-orwas-cream transition-colors hover:bg-orwas-stone"
                  >
                    Send message
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}