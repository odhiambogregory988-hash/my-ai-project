import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-orwas-ivory px-6 pb-20 pt-32 text-orwas-ink md:px-12 lg:px-20">
        <div className="mx-auto max-w-4xl">
          <p className="mb-4 text-xs uppercase tracking-[0.25em] text-orwas-clay">
            Our Story
          </p>
          <h1 className="font-display text-5xl md:text-6xl">Crafted to endure.</h1>
          <div className="mt-10 space-y-6 text-lg leading-relaxed text-orwas-ink/80">
            <p>
              Orwas is a slow-living home and wardrobe brand shaped by material integrity,
              thoughtful utility, and the beauty of repetition.
            </p>
            <p>
              We work with small-batch makers, natural textures, and timeless silhouettes so
              each collection feels considered rather than excessive.
            </p>
            <p>
              The result is a calmer kind of luxury: objects and essentials designed to live
              with you for years, not just seasons.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
