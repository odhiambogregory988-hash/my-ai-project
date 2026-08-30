import Header from "@/components/Header";
import Footer from "@/components/Footer";

const JOURNAL_ENTRIES = [
  {
    title: "Why we keep the palette restrained",
    date: "April 2026",
    description:
      "A quiet palette allows texture, proportion, and material to do the talking.",
  },
  {
    title: "On repair and repetition",
    date: "March 2026",
    description:
      "The best pieces become more personal with time, use, and care.",
  },
  {
    title: "The ritual of everyday objects",
    date: "February 2026",
    description:
      "We design for the small moments: morning coffee, warm light, and the act of returning home.",
  },
];

export default function JournalPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-orwas-ivory px-6 pb-20 pt-32 text-orwas-ink md:px-12 lg:px-20">
        <div className="mx-auto max-w-5xl">
          <p className="mb-4 text-xs uppercase tracking-[0.25em] text-orwas-clay">Journal</p>
          <h1 className="font-display text-5xl md:text-6xl">Notes from the studio.</h1>

          <div className="mt-12 space-y-8">
            {JOURNAL_ENTRIES.map((entry) => (
              <article
                key={entry.title}
                className="border-b border-orwas-clay/20 pb-8 last:border-b-0"
              >
                <p className="text-xs uppercase tracking-[0.2em] text-orwas-clay">{entry.date}</p>
                <h2 className="mt-3 font-display text-3xl text-orwas-ink">{entry.title}</h2>
                <p className="mt-4 max-w-2xl text-lg leading-relaxed text-orwas-ink/80">
                  {entry.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
