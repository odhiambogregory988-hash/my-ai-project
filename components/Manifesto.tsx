/**
 * Full-bleed quote / manifesto block — scroll-driven fade-in.
 */
import Section from "@/components/ui/Section";

export default function Manifesto() {
  return (
    <Section className="flex min-h-[60vh] items-center justify-center bg-orwas-cream py-section">
      <blockquote className="reveal max-w-4xl rounded-sm border border-orwas-clay/10 bg-orwas-ivory px-6 py-12 text-center shadow-[0_20px_60px_rgba(26,23,20,0.04)] md:px-16">
        <p className="mb-8 font-display text-display-lg leading-[0.95] text-orwas-ink">
          &ldquo;We don&rsquo;t chase seasons.
          <br />
          <span className="text-orwas-clay italic">We build things that last.</span>
          &rdquo;
        </p>
        <div className="line-accent mx-auto mb-6 w-12" />
        <cite className="text-xs uppercase tracking-[0.24em] text-orwas-clay not-italic">
          The Orwas Manifesto
        </cite>
      </blockquote>
    </Section>
  );
}
