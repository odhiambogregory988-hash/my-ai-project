"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useStore } from "@/components/StoreProvider";

const TOAST_MS = 5000;

/**
 * "Added to bag" toast with Undo.
 *
 * - Slides up from the bottom-left (bottom-center on small screens) so it never
 *   collides with the cart's mobile checkout bar, which hugs the bottom-right.
 * - Undo restores the cart snapshot from just before the add.
 * - A thin gold timer bar drains over 5s; the toast then dismisses itself.
 */
export default function CartToast() {
  const { toast, undoLastAdd } = useStore();
  const [progress, setProgress] = useState(100);

  // Drive the draining timer bar with a short interval (cheap, smooth enough
  // at this size, and restarts cleanly every time a new toast arrives).
  useEffect(() => {
    if (!toast) return;
    setProgress(100);
    const started = Date.now();
    const tick = setInterval(() => {
      const left = 100 - ((Date.now() - started) / TOAST_MS) * 100;
      setProgress(Math.max(left, 0));
    }, 100);
    return () => clearInterval(tick);
  }, [toast]);

  if (!toast) return null;

  return (
    <div
      key={toast.name + (toast.image ?? "")}
      role="status"
      aria-live="polite"
      className="cart-toast fixed bottom-5 left-4 right-4 z-[80] sm:right-auto sm:w-96"
    >
      <div
        className="flex items-center gap-3 rounded-md bg-white px-4 py-3 shadow-[0_8px_30px_rgba(17,24,39,0.18)]"
        style={{ border: "1px solid rgba(17,24,39,0.08)" }}
      >
        {/* Thumbnail */}
        <div className="relative h-12 w-10 shrink-0 overflow-hidden rounded-sm" style={{ backgroundColor: "rgba(17,24,39,0.05)" }}>
          {toast.image ? (
            <Image src={toast.image} alt="" fill sizes="40px" className="object-cover" />
          ) : null}
        </div>

        {/* Copy */}
        <div className="min-w-0 flex-1">
          <p className="text-[9px] font-medium uppercase tracking-[0.25em] text-orwas-amber">Added to bag</p>
          <p className="truncate text-xs font-medium text-orwas-ink">{toast.name}</p>
        </div>

        {/* Undo */}
        <button
          onClick={undoLastAdd}
          className="shrink-0 rounded-full px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.15em] text-orwas-clay transition-colors hover:bg-orwas-ink/5 hover:text-orwas-ink"
        >
          Undo
        </button>
      </div>

      {/* Gold timer bar */}
      <div className="h-[2px] overflow-hidden rounded-b-md" style={{ backgroundColor: "rgba(17,24,39,0.06)" }}>
        <div
          className="h-full"
          style={{ width: `${progress}%`, backgroundColor: "var(--color-amber)", transition: "width 100ms linear" }}
        />
      </div>
    </div>
  );
}
