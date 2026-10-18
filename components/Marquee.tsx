/**
 * Infinite scrolling brand marquee — pure CSS animation.
 * Fills negative space between sections with kinetic brand energy.
 */
export default function Marquee() {
  const words = [
    "Craft",
    "Heritage",
    "Curation",
    "Origin",
    "Timeless",
    "Form",
    "Material",
    "Considered",
  ];

  // Duplicate for seamless loop
  const items = [...words, ...words];

  return (
    <div className="py-10 border-y border-orwas-sand/60 overflow-hidden bg-orwas-cream">
      <div className="flex animate-marquee whitespace-nowrap">
        {items.map((word, i) => (
          <span key={i} className="flex items-center shrink-0">
            <span className="font-display text-display-md text-orwas-sand/50 mx-8 select-none">
              {word}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-orwas-amber/30 shrink-0" />
          </span>
        ))}
      </div>
    </div>
  );
}
