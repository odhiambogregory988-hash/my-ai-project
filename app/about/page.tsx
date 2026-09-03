import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-orwas-ivory px-6 pb-20 pt-32 text-orwas-ink md:px-12 lg:px-20">
        <div className="mx-auto max-w-4xl">
          <p className="mb-4 text-xs uppercase tracking-[0.25em] text-orwas-amber">
            Our Story · Orwa Sole Co.
          </p>
          <h1 className="font-display text-5xl md:text-6xl">Footwear crafted to endure.</h1>
          <div className="mt-10 space-y-6 text-lg leading-relaxed text-orwas-ink/80">
            <p>
              Orwa Sole Co. is a footwear and apparel brand shaped by material integrity,
              thoughtful construction, and silhouettes that outlive seasons.
            </p>
            <p>
              We work with trusted makers, natural materials, and timeless designs so
              every pair feels considered rather than disposable.
            </p>
            <p>
              The result is a calmer kind of luxury: shoes and essentials designed to
              live with you for years — from first wear to everyday.
            </p>
          </div>

          {/* Three pillars */}
          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {[
              { step: "01", title: "Origin Materials", text: "Natural leathers, suedes, and textiles sourced with care and traceability." },
              { step: "02", title: "Considered Making", text: "Small-batch construction with lasting craftsmanship in every stitch." },
              { step: "03", title: "Timeless Form", text: "Clean silhouettes that stay relevant — designed for the long run." },
            ].map((pillar) => (
              <div key={pillar.step} className="rounded-sm border border-orwas-sand/60 bg-white p-6">
                <p className="text-xs uppercase tracking-[0.3em] text-orwas-amber">{pillar.step}</p>
                <h3 className="mt-3 font-display text-2xl text-orwas-ink">{pillar.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-orwas-clay">{pillar.text}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}