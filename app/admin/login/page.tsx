"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import GoogleSignInButton from "@/components/GoogleSignInButton";
import { createSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase";

type Mode = "signin" | "create";

export default function AdminLoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get("error");
    const code = params.get("code");

    // A code param means a sign-in/confirmation link landed here — validate it
    // right away (PKCE exchange happens client-side), then mint the admin cookie.
    if (code) {
      setLoading(true);
      setMessage("Validating your sign-in link…");
      (async () => {
        try {
          if (!isSupabaseConfigured()) {
            setMessage("Supabase is not configured yet. Add your keys to .env.local.");
            return;
          }
          const supabase = createSupabaseBrowserClient();
          const {
            data: { session },
          } = await supabase.auth.getSession();
          if (!session?.user) {
            setMessage(
              "That sign-in link was not valid or has expired. Use Continue with Google, or sign in below with your email and password.",
            );
            return;
          }
          const res = await fetch("/api/admin/session", { method: "POST" });
          if (res.ok) {
            router.push("/admin");
            return;
          }
          const body = await res.json().catch(() => ({}));
          setMessage(
            body.message ||
              "You signed in, but this account is not on the admin list. Ask the store owner to add your email.",
          );
        } catch {
          setMessage("We could not validate that sign-in link. Please try again.");
        } finally {
          setLoading(false);
        }
      })();
      return;
    }

    if (error === "not-approved")
      setMessage("This Google account is not on the admin list. Ask the store owner to add your email.");
    if (error === "google") setMessage("Google sign-in failed. Please try again.");
    if (error === "invalid")
      setMessage("That sign-in link was not valid or has expired. Use Continue with Google, or sign in below with your email and password.");
    if (params.get("confirmed") === "ok")
      setMessage("Email confirmed ✓ Sign in below with your password.");
  }, [router]);

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

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }
    if (password !== confirm) {
      setMessage("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name: email.split("@")[0] },
          // Email confirmation lands here — a simple "confirmed, sign in now"
          // page, which works on any device (no OAuth cookie needed).
          emailRedirectTo: `${window.location.origin}/admin/login?confirmed=ok`,
        },
      });

      if (error) {
        setMessage(
          error.message.toLowerCase().includes("already registered")
            ? "That email is already registered — sign in instead."
            : error.message,
        );
        setLoading(false);
        return;
      }

      // Email confirmation is on — the account exists but isn't active yet.
      if (!data.session) {
        setMessage("Account created! Check your email to confirm, then sign in.");
        setLoading(false);
        return;
      }

      // Session ready — mint the admin session if this email is on the roster.
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const loginData = await res.json();
      if (res.ok) {
        router.push("/admin");
      } else {
        setMessage(loginData.message || "Account created, but this email is not on the admin list.");
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
        <h1 className="font-display text-4xl">
          {mode === "signin" ? "Admin sign in" : "Create admin account"}
        </h1>
        <p className="mt-5 text-sm leading-relaxed text-orwas-cream/60">
          {mode === "signin"
            ? "Enter your admin email and password to manage the catalog."
            : "Create an account with an email on the admin list to manage the catalog."}
        </p>

        {message && (
          <p role="alert" className="mt-6 border border-orwas-amber/40 bg-orwas-amber/10 px-4 py-3 text-sm text-orwas-amber">
            {message}
          </p>
        )}

        {mode === "signin" ? (
          <>
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
            {isSupabaseConfigured() && (
              <p className="mt-6 text-center text-xs text-orwas-cream/60">
                New admin?{" "}
                <button
                  type="button"
                  onClick={() => setMode("create")}
                  className="underline underline-offset-4 hover:text-orwas-cream"
                >
                  Create account
                </button>
              </p>
            )}
          </>
        ) : (
          <>
            <form onSubmit={handleCreate} className="mt-8 space-y-4">
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
              <input
                type="password"
                placeholder="Confirm password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full bg-orwas-cream/10 px-4 py-3 text-xs uppercase tracking-[0.2em] text-orwas-cream placeholder-orwas-cream/40 outline-none"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orwas-cream px-6 py-4 text-xs uppercase tracking-[0.2em] text-orwas-ink disabled:opacity-50"
              >
                {loading ? "Creating account..." : "Create Account"}
              </button>
            </form>
            <p className="mt-6 text-center text-xs text-orwas-cream/60">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => setMode("signin")}
                className="underline underline-offset-4 hover:text-orwas-cream"
              >
                Sign in
              </button>
            </p>
          </>
        )}

        <div className="mt-8 flex items-center gap-4">
          <span className="h-px flex-1 bg-orwas-cream/20" />
          <span className="text-[10px] uppercase tracking-[0.2em] text-orwas-cream/40">or</span>
          <span className="h-px flex-1 bg-orwas-cream/20" />
        </div>

        <div className="mt-8">
          <GoogleSignInButton redirectTo="/admin/callback" dark />
        </div>

        <Link href="/" className="mt-8 block text-center text-xs uppercase tracking-widest text-orwas-cream/60">
          Return to store
        </Link>
      </div>
    </main>
  );
}