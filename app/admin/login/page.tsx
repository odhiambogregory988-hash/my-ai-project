"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import GoogleSignInButton from "@/components/GoogleSignInButton";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const error = new URLSearchParams(window.location.search).get("error");
    if (error === "full") setMessage("The two admin places are already filled.");
    if (error === "not-approved") setMessage("This Google account is not the registered admin. Use the admin email.");
    if (error === "invalid") setMessage("Invalid email or password.");
    if (error === "google") setMessage("Google sign-in failed. Please try again.");
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push("/admin");
      } else {
        setMessage(data.message || "Login failed. Please try again.");
      }
    } catch (error) {
      setMessage("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-orwas-ink px-6 text-orwas-cream">
      <div className="w-full max-w-sm">
        <p className="mb-3 text-xs uppercase tracking-[0.2em] text-orwas-amber">Orwas / Private area</p>
        <h1 className="font-display text-4xl">Admin sign in</h1>
        <p className="mt-5 text-sm text-orwas-cream/60">Enter your admin credentials to manage the catalog.</p>
        {message && <p role="alert" className="mt-6 text-sm text-orwas-amber">{message}</p>}
        
        <form onSubmit={handleLogin} className="mt-8 space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-orwas-cream/10 px-4 py-3 text-xs uppercase tracking-[0.2em] text-orwas-cream placeholder-orwas-cream/40 outline-none"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-orwas-cream/10 px-4 py-3 text-xs uppercase tracking-[0.2em] text-orwas-cream placeholder-orwas-cream/40 outline-none"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orwas-cream px-6 py-4 text-xs uppercase tracking-[0.2em] text-orwas-ink disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="mt-8 flex items-center gap-4">
          <span className="h-px flex-1 bg-orwas-cream/20" />
          <span className="text-[10px] uppercase tracking-[0.2em] text-orwas-cream/40">or</span>
          <span className="h-px flex-1 bg-orwas-cream/20" />
        </div>

        <div className="mt-8">
          <GoogleSignInButton redirectTo="/admin/callback" dark />
        </div>
        <p className="mt-4 text-center text-xs text-orwas-cream/50">
          Sign in with the Google account registered as the store admin.
        </p>

        <Link href="/" className="mt-8 block text-center text-xs uppercase tracking-widest text-orwas-cream/60">Return to store</Link>
      </div>
    </main>
  );
}
