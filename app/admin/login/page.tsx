"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase";

/** decodeURIComponent that never throws on malformed input. */
function safeDecode(value: string | null): string {
  if (!value) return "";
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export default function AdminLoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"google" | "password">("google");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleFallbackUrl, setGoogleFallbackUrl] = useState("");
  const [loaded, setLoaded] = useState(false);

  async function handleGoogle() {
    if (!isSupabaseConfigured()) {
      setMessage("Supabase is not configured — Google sign-in is not available.");
      return;
    }
    setGoogleLoading(true);
    setMessage("");
    try {
      const supabase = createSupabaseBrowserClient();
      const { error, data } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/admin/login`,
        },
      });
      // If we're still here, the redirect never happened — show why.
      if (error) {
        setMessage(`Google sign-in error: ${error.message}`);
        setGoogleLoading(false);
        return;
      }
      // Navigation was initiated. If the page is still alive after a moment
      // (sandboxed preview, popup blocker), offer a manual link instead.
      const url = data?.url;
      setTimeout(() => {
        if (url) {
          setGoogleFallbackUrl(url);
        }
        setGoogleLoading(false);
      }, 1500);
    } catch {
      setMessage("Google sign-in failed. Check your internet connection and try again.");
      setGoogleLoading(false);
    }
  }

  async function handleForgotPassword() {
    if (!email) {
      setForgotMessage("Enter your email address first.");
      return;
    }
    if (!isSupabaseConfigured()) {
      setForgotMessage("Supabase is not configured — password reset is not available.");
      return;
    }
    setForgotLoading(true);
    setForgotMessage("");
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/admin/reset-password`,
      });
      if (error) {
        setForgotMessage(error.message);
      } else {
        setForgotMessage(
          `If an admin account exists for ${email}, a password reset link has been sent. Check your inbox (and spam).`,
        );
      }
    } catch {
      setForgotMessage("Something went wrong. Please try again.");
    } finally {
      setForgotLoading(false);
    }
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get("error");
    const code = params.get("code");

    if (code) {
      // CRITICAL: mark loaded so the page renders while validating — without
      // this the component returns null forever on any non-redirect path.
      setLoaded(true);
      setLoading(true);
      setMessage("Validating your sign-in…");
      (async () => {
        try {
          if (!isSupabaseConfigured()) {
            setMessage("Supabase is not configured yet. Add your keys to .env.local.");
            return;
          }
          const supabase = createSupabaseBrowserClient();
          // The browser client auto-exchanges the PKCE code on startup — but
          // that network call can hang (e.g. slow resumed project), and
          // getSession() waits on it. Race the whole wait against a timeout
          // so the page ALWAYS resolves to a visible outcome.
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
            setMessage("That sign-in link was not valid or has expired. Try again.");
            window.history.replaceState({}, "", window.location.pathname);
            return;
          }
          const res = await fetch("/api/admin/session", { method: "POST" });
          if (res.ok) { router.push("/admin"); return; }
          const body = await res.json().catch(() => ({}));
          setMessage(
            body.message ||
              "You signed in, but this email is not on the admin list. Ask the store owner to add it.",
          );
        } catch {
          setMessage("We could not validate that sign-in link. Please try again.");
        } finally {
          setLoading(false);
        }
      })();
      return;
    }

    if (error === "not-approved" || error === "access_denied") {
      setMessage("This Google account is not on the admin list. Ask the store owner to add your email.");
    } else if (error === "google") {
      setMessage("Google sign-in failed. Please try again.");
    } else if (error === "invalid") {
      setMessage("That sign-in link was not valid or has expired. Try again.");
    } else if (error) {
      const desc = safeDecode(params.get("error_description"));
      if (/exchange external code/i.test(desc)) {
        // Supabase could not trade Google's one-time code for tokens. Causes:
        // 1) client secret mismatch (every attempt fails) — re-paste the secret
        //    in Supabase → Authentication → Providers → Google; 2) a replayed
        //    code (refreshing the callback page) — just try signing in again.
        setMessage(
          "Google sign-in failed at the final step. If this happens every time, the Google client secret in your Supabase dashboard doesn't match Google Cloud Console — re-paste it under Authentication → Providers → Google. If it happened once, the code was simply reused — click Continue with Google again.",
        );
      } else {
        setMessage(desc ? `Sign-in failed: ${desc}` : "Sign-in failed. Please try again.");
      }
      // Clean the error out of the URL so refreshing doesn't replay it.
      window.history.replaceState({}, "", window.location.pathname);
    }
    if (params.get("confirmed") === "ok") {
      setMessage("Email confirmed ✓ Sign in below with your password.");
      window.history.replaceState({}, "", window.location.pathname);
    }
    setLoaded(true);
  }, [router]);

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      setMessage("Please enter your email and password.");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();
      if (res.ok) {
        router.push("/admin");
      } else {
        setMessage(data.message || "Login failed. Please try again.");
      }
    } catch {
      setMessage("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!loaded) return null;

  return (
    <main className="flex min-h-screen items-center justify-center bg-orwas-ink px-6 text-orwas-cream">
      {/* Decorative background accent */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-1/4 h-96 w-96 rounded-full bg-orwas-amber/5 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-0 bottom-1/4 h-80 w-80 rounded-full bg-orwas-clay/5 blur-3xl"
      />

      <div className="relative z-10 w-full max-w-[420px]">
        {/* Card */}
        <div className="rounded-sm border border-orwas-cream/10 bg-orwas-ink/80 p-8 shadow-[0_20px_60px_rgba(0,0,0,0.4)] backdrop-blur-sm">
          {/* Brand mark */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-orwas-amber/40">
              <span className="font-display text-base text-orwas-amber">O</span>
            </div>
            <div className="space-y-1">
              <p className="text-center text-[10px] uppercase tracking-[0.25em] text-orwas-amber">
                Orwas / Private area
              </p>
              <p className="text-center text-[9px] uppercase tracking-[0.3em] text-orwas-cream/30">
                Apparel & footwear
              </p>
            </div>
          </div>

          <h1 className="font-display text-center text-4xl">Admin sign in</h1>
          <p className="mx-auto mt-3 max-w-[280px] text-center text-sm leading-relaxed text-orwas-cream/50">
            Only emails acknowledged by the store owner can access this area.
          </p>

          {message && (
            <p
              role="alert"
              className="mt-6 rounded-sm border border-orwas-amber/40 bg-orwas-amber/10 px-4 py-3 text-center text-sm text-orwas-amber"
            >
              {message}
            </p>
          )}
          {forgotMessage && (
            <p
              className={`mt-4 text-center text-[10px] ${
                forgotMessage.includes("sent") || forgotMessage.includes("reset")
                  ? "text-orwas-amber"
                  : "text-orwas-cream/40"
              }`}
            >
              {forgotMessage}
            </p>
          )}

          {/* Email & password — primary method */}
          <div className="space-y-4">
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <input
                type="email"
                name="email"
                autoComplete="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-orwas-cream/5 border-b border-orwas-cream/10 px-4 py-3 text-xs uppercase tracking-[0.2em] text-orwas-cream placeholder-orwas-cream/30 outline-none transition-colors hover:border-orwas-cream/30 focus:border-orwas-amber"
                required
              />
              <input
                type="password"
                name="password"
                autoComplete="current-password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-orwas-cream/5 border-b border-orwas-cream/10 px-4 py-3 text-xs uppercase tracking-[0.2em] text-orwas-cream placeholder-orwas-cream/30 outline-none transition-colors hover:border-orwas-cream/30 focus:border-orwas-amber"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orwas-cream px-6 py-3.5 text-xs uppercase tracking-[0.25em] text-orwas-ink transition-colors hover:bg-orwas-amber disabled:opacity-50"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>
            <p className="text-center text-[10px] text-orwas-cream/30">
              Only emails acknowledged by the store owner can sign in with a password.
            </p>
            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={forgotLoading}
              className="w-full text-center text-[10px] uppercase tracking-[0.2em] text-orwas-amber transition-colors hover:text-orwas-cream disabled:opacity-40"
            >
              {forgotLoading ? "Sending…" : "Forgot password?"}
            </button>
          </div>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <span className="flex-1 border-t border-orwas-cream/10" />
            <span className="mx-4 text-[10px] uppercase tracking-[0.2em] text-orwas-cream/30">or</span>
            <span className="flex-1 border-t border-orwas-cream/10" />
          </div>

          {/* Google — secondary method */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleGoogle}
              disabled={googleLoading}
              className="flex w-full items-center justify-center rounded-sm border border-[#dadce0] bg-white px-6 py-3 text-sm font-medium text-[#3c4043] shadow-sm transition-colors duration-200 hover:bg-[#f8f9fa] disabled:opacity-50"
            >
              <svg
                className="mr-3 h-5 w-5 shrink-0"
                viewBox="0 0 24 24"
                aria-hidden="true"
                fill="none"
              >
                <path
                  fill="#4285F4"
                  d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75z"
                />
              </svg>
              {googleLoading ? "Connecting…" : "Continue with Google"}
            </button>
            <p className="text-center text-[10px] text-orwas-cream/40">
              You will be asked to pick a Google account — only acknowledged emails are allowed in.
            </p>
            {googleFallbackUrl && (
              <a
                href={googleFallbackUrl}
                className="block rounded-sm border border-orwas-amber bg-orwas-amber/10 px-4 py-3 text-center text-[10px] uppercase tracking-[0.2em] text-orwas-amber transition-colors hover:bg-orwas-amber hover:text-orwas-ink"
              >
                Nothing happened? Tap here to continue with Google →
              </a>
            )}
          </div>

          <Link
            href="/"
            className="mt-8 block text-center text-[10px] uppercase tracking-[0.25em] text-orwas-cream/30 transition-colors hover:text-orwas-cream/60"
          >
            Return to store
          </Link>
        </div>
      </div>
    </main>
  );
}
