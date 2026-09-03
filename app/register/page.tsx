"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GoogleSignInButton from "@/components/GoogleSignInButton";
import { registerCustomer, setSession } from "@/lib/accounts";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingConfirmation, setPendingConfirmation] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const result = await registerCustomer(name, email, password);

    if (result.ok && result.customer) {
      // Straight to the customer home page.
      await setSession(result.customer.email);
      router.push("/dashboard");
    } else if (result.ok) {
      // Account created but email confirmation is on — guide them home.
      setMessage(result.message || "Account created!");
      setPendingConfirmation(true);
      setLoading(false);
    } else {
      setMessage(result.message || "Something went wrong.");
      setLoading(false);
    }
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-orwas-ivory px-6 pb-20 pt-32 text-orwas-ink md:px-12 lg:px-20">
        <div className="mx-auto max-w-md">
          <p className="mb-3 text-xs uppercase tracking-[0.25em] text-orwas-amber">Customer accounts</p>
          <h1 className="font-display text-5xl">Join Orwa Sole Co.</h1>
          <p className="mt-5 text-sm leading-relaxed text-orwas-clay">
            Create an account to place orders, track delivery, and save your details
            for faster checkout.
          </p>

          {pendingConfirmation ? (
            <div className="mt-8 border border-orwas-amber/40 bg-orwas-amber/10 p-8 text-center">
              <p className="font-display text-3xl">Almost there!</p>
              <p role="alert" className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-orwas-ink">
                {message}{" "}
                Once you confirm, signing in will take you straight to your
                customer home page.
              </p>
              <Link
                href="/login"
                className="mt-6 inline-block bg-orwas-ink px-8 py-3 text-[10px] uppercase tracking-[0.25em] text-orwas-cream transition-colors hover:bg-orwas-stone"
              >
                Go to sign in
              </Link>
            </div>
          ) : (
            <>
              {message && (
                <p role="alert" className="mt-6 border border-orwas-amber/40 bg-orwas-amber/10 px-4 py-3 text-sm text-orwas-ink">
                  {message}
                </p>
              )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <label className="block">
              <span className="text-[10px] uppercase tracking-[0.2em] text-orwas-clay">Full name</span>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                className="mt-2 w-full border-b border-orwas-sand bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-orwas-amber"
              />
            </label>
            <label className="block">
              <span className="text-[10px] uppercase tracking-[0.2em] text-orwas-clay">Email</span>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="mt-2 w-full border-b border-orwas-sand bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-orwas-amber"
              />
            </label>
            <label className="block">
              <span className="text-[10px] uppercase tracking-[0.2em] text-orwas-clay">Password</span>
              <input
                required
                type="password"
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="mt-2 w-full border-b border-orwas-sand bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-orwas-amber"
              />
            </label>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orwas-ink py-4 text-[10px] uppercase tracking-[0.3em] text-orwas-cream transition-colors hover:bg-orwas-stone disabled:opacity-50"
            >
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>

          <div className="mt-8 flex items-center gap-4">
            <span className="h-px flex-1 bg-orwas-sand" />
            <span className="text-[10px] uppercase tracking-[0.2em] text-orwas-clay">or</span>
            <span className="h-px flex-1 bg-orwas-sand" />
          </div>

          <div className="mt-8">
            <GoogleSignInButton />
          </div>

          <p className="mt-8 text-center text-xs text-orwas-clay">
            Already have an account?{" "}
            <Link href="/login" className="underline underline-offset-4 hover:text-orwas-ink">
              Sign in
            </Link>
          </p>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}