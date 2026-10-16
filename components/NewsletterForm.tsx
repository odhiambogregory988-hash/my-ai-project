"use client";

/**
 * Newsletter form — the only interactive part of the footer,
 * split out so the footer itself can render on the server.
 */
export default function NewsletterForm() {
  return (
    <form
      className="flex w-full md:w-auto"
      onSubmit={(e) => e.preventDefault()}
    >
      <input
        type="email"
        placeholder="your@email.com"
        className="bg-transparent border border-orwas-cream/20 text-orwas-cream px-5 py-3 text-sm w-full md:w-72 placeholder:text-orwas-clay/50 focus:outline-none focus:border-orwas-amber transition-colors duration-300"
      />
      <button
        type="submit"
        className="bg-orwas-amber text-orwas-ink px-6 py-3 text-xs tracking-widest uppercase font-medium hover:bg-orwas-amber-light transition-colors duration-300"
      >
        Subscribe
      </button>
    </form>
  );
}
