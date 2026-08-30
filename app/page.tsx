import Header from "@/components/Header";
import VideoShowcase from "@/components/VideoShowcase";
import Editorial from "@/components/Editorial";
import Marquee from "@/components/Marquee";
import FeaturedProducts from "@/components/FeaturedProducts";
import CollectionsGrid from "@/components/CollectionsGrid";
import Manifesto from "@/components/Manifesto";
import Footer from "@/components/Footer";

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <VideoShowcase />
        <Editorial />
        <Marquee />
        <FeaturedProducts />
        <CollectionsGrid />
        <Manifesto />
      </main>
      <Footer />
    </>
  );
}
