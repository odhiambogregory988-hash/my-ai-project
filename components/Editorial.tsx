"use client";

import Section from "@/components/ui/Section";

const EDITORIAL_ITEMS = [
  {
    number: "01",
    title: "Origin Materials",
    description:
      "Every fiber has a geography. We trace our materials to their source — merino from the high country, linen from northern fields, leather from heritage tanneries.",
    image: "/editorial/origin-materials.jpg",
    imageAlt: "Raw materials — natural fibers and earth tones",
  },
  {
    number: "02",
    title: "Considered Making",
    description:
      "Slow production by artisan hands. Small-batch dyeing, hand-finished seams, and patterns refined over decades. Nothing rushed, nothing wasted.",
    image: "/editorial/considered-making.jpg",
    imageAlt: "Artisan crafting a garment by hand",
  },
  {
    number: "03",
    title: "Timeless Form",
    description:
      "Designed to outlast trends. Clean silhouettes, considered proportions, and a palette drawn from nature — pieces that become more you with every wear.",
    image: "/editorial/timeless-form.jpg",
    imageAlt: "Minimal collection pieces on display",
  },
];

export default function Editorial() {
  return (
    <Section label="The Philosophy" className="py-section bg-orwas-ivory">
      <div className="flex flex-col gap-section-sm">
        <div className="mb-8 max-w-3xl">
          <h2 className="reveal font-display text-display-lg text-orwas-ink">
            Three pillars of
            <br />
            <span className="text-orwas-clay italic">every collection</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
          {EDITORIAL_ITEMS.map((item) => (
            <article
              key={item.number}
              className="group flex flex-col gap-6 rounded-sm border border-orwas-clay/10 bg-orwas-cream p-5 reveal md:p-6"
            >
              <div className="img-hover relative aspect-[4/3] overflow-hidden rounded-sm bg-orwas-sand/30">
                <img
                  src={item.image}
                  alt={item.imageAlt}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-orwas-ink/20 to-transparent" />
              </div>

              <div className="line-accent w-16" />

              <div className="flex gap-4">
                <span className="font-display text-sm text-orwas-amber">{item.number}</span>
                <div>
                  <h3 className="mb-3 font-display text-display-md text-orwas-ink">
                    {item.title}
                  </h3>
                  <p className="max-w-md leading-relaxed text-orwas-clay">
                    {item.description}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </Section>
  );
}
