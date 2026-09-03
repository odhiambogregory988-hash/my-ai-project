"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase";

// Admin sign-in link validator. Google OAuth (and old email confirmation links)
// land here with a ?code= param. The PKCE code verifier lives in the browser's
// cookies (set by @supabase/ssr), so we exchange it client-side — exactly like
// the customer dashboard does — then mint the admin JWT via /api/admin/session.
export default function AdminCallbackPage() {
  const router = useRouter();
  const [message, setMessage] = useState("Validating your sign-in link…");
  const [done, setDone] = useState(false);

  useEffect(() => {
    (async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const providerError = params.get("error_description") || params.get("error");

      // No code — a plain visit or an OAuth failure/cancellation.
      if (!code) {
        setMessage(
          providerError
            ? `Google sign-in was not completed: ${decodeURIComponent(providerError)}`
            : "Nothing to validate — start from the sign-in page.",
        );
        setDone(true);
        return;
      }

      if (!isSupabaseConfigured()) {
        setMessage("Supabase is not configured yet. Add your keys to .env.local.");
        setDone(true);
        return;
      }

      try {
        // Creating the browser client auto-exchanges the PKCE code in the URL.
        const supabase = createSupabaseBrowserClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.user) {
          setMessage("That sign-in link was not valid. It may be expired — please sign in again.");
          setDone(true);
          return;
        }

        // Session established — mint the admin JWT cookie from it.
        const res = await fetch("/api/admin/session", { method: "POST" });
        if (res.ok) {
          router.replace("/admin");
          return;
        }
        const body = await res.json().catch(() => ({}));
        setMessage(
          body.message ||
            "You signed in, but this account is not on the admin list. Ask the store owner to add your email.",
        );
        setDone(true);
      } catch {
        setMessage("We could not validate that sign-in link. Please try again from the sign-in page.");
        setDone(true);
      }
    })();
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-orwas-ink px-6 text-orwas-cream">
      <div className="w-full max-w-sm text-center">
        <p className="mb-3 text-xs uppercase tracking-[0.2em] text-orwas-amber">Orwas / Private area</p>
        <h1 className="font-display text-4xl">Admin sign in</h1>
        {!done ? (
          <p className="mt-8 text-sm text-orwas-cream/70">{message}…</p>
        ) : (
          <div className="mt-8 space-y-6">
            <p className="border border-orwas-amber/40 bg-orwas-amber/10 px-4 py-3 text-sm text-orwas-amber">
              {message}
            </p>
            <Link
              href="/admin/login"
              className="inline-block border border-orwas-cream/30 px-8 py-3 text-[10px] uppercase tracking-[0.25em] text-orwas-cream transition-colors hover:bg-orwas-cream hover:text-orwas-ink"
            >
              Back to sign in
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
