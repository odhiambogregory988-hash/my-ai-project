"use client";

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  label?: string;
  id?: string;
}

export default function Section({
  children,
  className = "",
  label,
  id,
}: SectionProps) {
  return (
    <section id={id} className={`px-6 md:px-12 lg:px-20 ${className}`}>
      {label && (
        <p className="text-xs tracking-[0.2em] uppercase text-orwas-clay mb-8 reveal">
          {label}
        </p>
      )}
      {children}
    </section>
  );
}
