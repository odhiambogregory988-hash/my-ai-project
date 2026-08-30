"use client";

import Link from "next/link";

interface ButtonProps {
  children: React.ReactNode;
  href?: string;
  variant?: "filled" | "ghost" | "underline";
  className?: string;
  onClick?: () => void;
}

export default function Button({
  children,
  href,
  variant = "filled",
  className = "",
  onClick,
}: ButtonProps) {
  const base =
    "inline-flex items-center gap-2 text-sm tracking-widest uppercase transition-all duration-500 ease-out-expo";

  const variants = {
    filled:
      "bg-orwas-ink text-orwas-cream px-8 py-4 hover:bg-orwas-stone",
    ghost:
      "border border-orwas-clay/40 text-orwas-ink px-8 py-4 hover:bg-orwas-ink hover:text-orwas-cream",
    underline:
      "text-orwas-ink border-b border-orwas-ink/30 pb-1 hover:border-orwas-ink",
  };

  const classes = `${base} ${variants[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={classes}>
      {children}
    </button>
  );
}
