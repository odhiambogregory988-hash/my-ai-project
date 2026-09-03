"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GoogleSignInButton from "@/components/GoogleSignInButton";
import { loginCustomer, setSession } from "@/lib/accounts";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const result = await loginCustomer(email, password);

    if (result.ok && result.customer) {
      await setSession(result.customer.email);
      router.push(next);
    } else {
      setMessage(result.message || "Invalid email or password.");
      setLoading(false);
    }
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-orwas-ivory px-6 pb-20 pt-32 text-orwas-ink md:px-12 lg:px-20">
        <div className="mx-auto max-w-md">
          <p className="mb-3 text-xs uppercase tracking-[0.25em] text-orwas-amber">Welcome back</p>
          <h1 className="font-display text-5xl">Sign in</h1>
          <p className="mt-5 text-sm leading-relaxed text-orwas-clay">
            Sign in to view your orders, track delivery, and check out faster.
          </p>

          {message && (
            <p role="alert" className="mt-6 border border-orwas-amber/40 bg-orwas-amber/10 px-4 py-3 text-sm text-orwas-ink">
              {message}
            </p>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                className="mt-2 w-full border-b border-orwas-sand bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-orwas-amber"
              />
            </label>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orwas-ink py-4 text-[10px] uppercase tracking-[0.3em] text-orwas-cream transition-colors hover:bg-orwas-stone disabled:opacity-50"
            >
              {loading ? "Signing in…" : "Sign in"}
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
            New to Orwa Sole Co.?{" "}
            <Link href="/register" className="underline underline-offset-4 hover:text-orwas-ink">
              Create an account
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}