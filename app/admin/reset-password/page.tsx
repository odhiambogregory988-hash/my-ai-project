"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase";

type Status = "checking" | "form" | "done" | "error";

// Landing page for Supabase password-recovery emails ("Forgot password?" on
// /admin/login). The PKCE code in the URL is auto-exchanged when the browser
// client is created, which yields a session — then the admin chooses a new
// password. Afterwards email + password sign-in works on /admin/login.
export default function AdminResetPasswordPage() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("checking");
  const [message, setMessage] = useState("Opening your password link…");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const supabaseRef = useRef<ReturnType<typeof createSupabaseBrowserClient> | null>(null);

  useEffect(() => {
    (async () => {
      const params = new URLSearchParams(window.location.search);
      const desc = params.get("error_description") || params.get("error");
      if (desc) {
        let decoded = desc;
        try {
          decoded = decodeURIComponent(desc);
        } catch {
          /* keep raw value */
        }
        setStatus("error");
        setMessage(
          `This password link could not be used: ${decoded}. Request a new one from the sign-in page.`,
        );
        return;
      }
      if (!isSupabaseConfigured()) {
        setStatus("error");
        setMessage("Supabase is not configured yet. Add your keys to .env.local.");
        return;
      }

      try {
        const supabase = createSupabaseBrowserClient();
        supabaseRef.current = supabase;
        // The client auto-exchanges the recovery code on startup — but that
        // network call can hang, and getSession() waits on it. Race against a
        // timeout so the page ALWAYS resolves to a visible outcome.
        const exchangeWait = (async () => {
          for (let i = 0; i < 10; i++) {
            const { data } = await supabase.auth.getSession();
            if (data.session?.user) return data.session;
            await new Promise((r) => setTimeout(r, 300));
          }
          return null;
        })();
        const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), 6000));
        const session = await Promise.race([exchangeWait, timeout]);
        if (!session?.user) {
          setStatus("error");
          setMessage("This password link is invalid or has expired. Request a new one from the sign-in page.");
          return;
        }
        setStatus("form");
        setMessage("");
      } catch {
        setStatus("error");
        setMessage("Something went wrong opening that link. Please try again from the sign-in page.");
      }
    })();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const supabase = supabaseRef.current;
    if (!supabase) return;
    if (password.length < 8) {
      setMessage("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setMessage("Passwords do not match.");
      return;
    }
    setSaving(true);
    setMessage("");
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setMessage(error.message);
        return;
      }
      // Password set. The recovery session is live — mint the admin cookie
      // straight away so the owner lands in the dashboard.
      const res = await fetch("/api/admin/session", { method: "POST" });
      if (res.ok) {
        router.replace("/admin");
        return;
      }
      setStatus("done");
      setMessage("Password set! Sign in with your email and new password.");
    } catch {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-orwas-ink px-6 text-orwas-cream">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-1/4 h-96 w-96 rounded-full bg-orwas-amber/5 blur-3xl"
      />
      <div className="relative z-10 w-full max-w-[420px]">
        <div className="rounded-sm border border-orwas-cream/10 bg-orwas-ink/80 p-8 shadow-[0_20px_60px_rgba(0,0,0,0.4)] backdrop-blur-sm">
          {/* Brand mark */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-orwas-amber/40">
              <span className="font-display text-base text-orwas-amber">O</span>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-[0.25em] text-orwas-amber">Orwas / Private area</p>
              <p className="text-[9px] uppercase tracking-[0.3em] text-orwas-cream/30">Apparel &amp; footwear</p>
            </div>
          </div>

          <h1 className="font-display text-center text-4xl">
            {status === "form" ? "Choose a new password" : "Password reset"}
          </h1>

          {status === "checking" && (
            <p className="mt-8 text-center text-sm text-orwas-cream/70">{message}…</p>
          )}

          {status === "error" && (
            <div className="mt-8 space-y-6">
              <p className="border border-orwas-amber/40 bg-orwas-amber/10 px-4 py-3 text-center text-sm text-orwas-amber">
                {message}
              </p>
              <Link
                href="/admin/login"
                className="inline-block w-full border border-orwas-cream/30 px-8 py-3 text-center text-[10px] uppercase tracking-[0.25em] text-orwas-cream transition-colors hover:bg-orwas-cream hover:text-orwas-ink"
              >
                Back to sign in
              </Link>
            </div>
          )}

          {status === "form" && (
            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              {message && (
                <p role="alert" className="border border-orwas-amber/40 bg-orwas-amber/10 px-4 py-3 text-center text-sm text-orwas-amber">
                  {message}
                </p>
              )}
              <input
                type="password"
                placeholder="New password (min 8 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full bg-orwas-cream/5 border-b border-orwas-cream/10 px-4 py-3 text-xs uppercase tracking-[0.2em] text-orwas-cream placeholder-orwas-cream/30 outline-none transition-colors hover:border-orwas-cream/30 focus:border-orwas-amber"
              />
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                minLength={8}
                className="w-full bg-orwas-cream/5 border-b border-orwas-cream/10 px-4 py-3 text-xs uppercase tracking-[0.2em] text-orwas-cream placeholder-orwas-cream/30 outline-none transition-colors hover:border-orwas-cream/30 focus:border-orwas-amber"
              />
              <button
                type="submit"
                disabled={saving}
                className="w-full bg-orwas-cream px-6 py-3.5 text-xs uppercase tracking-[0.25em] text-orwas-ink transition-colors hover:bg-orwas-amber disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save password & continue"}
              </button>
              <p className="text-center text-[10px] leading-relaxed text-orwas-cream/40">
                After saving you can sign in with this email and password — no Google needed.
              </p>
            </form>
          )}

          {status === "done" && (
            <div className="mt-8 space-y-6">
              <p className="border border-emerald-300/40 bg-emerald-400/10 px-4 py-3 text-center text-sm text-emerald-300">
                {message}
              </p>
              <Link
                href="/admin/login"
                className="inline-block w-full bg-orwas-cream px-8 py-3 text-center text-[10px] uppercase tracking-[0.25em] text-orwas-ink transition-colors hover:bg-orwas-amber"
              >
                Go to sign in
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
