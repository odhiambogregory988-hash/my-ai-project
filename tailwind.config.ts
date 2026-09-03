import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        orwas: {
          // Brand palette — Orwa Sole Co.
          ink: "#111827", // Primary — near-black
          clay: "#8B5E3C", // Accent — warm brown
          sand: "#E5E7EB", // Neutral — light gray
          cream: "#FFFFFF", // Cards — white
          ivory: "#F9FAFB", // Background
          // Gold accent
          amber: "#D4AF37",
          "amber-light": "#E2C15F",
          // Utility
          mist: "#F3F4F6",
          stone: "#4B5563",
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', "Georgia", "serif"],
        body: ['"Inter"', "system-ui", "sans-serif"],
      },
      fontSize: {
        "display-xl": ["clamp(3rem, 8vw, 7rem)", { lineHeight: "0.95", letterSpacing: "-0.03em" }],
        "display-lg": ["clamp(2rem, 5vw, 4.5rem)", { lineHeight: "1.0", letterSpacing: "-0.02em" }],
        "display-md": ["clamp(1.5rem, 3vw, 2.5rem)", { lineHeight: "1.1", letterSpacing: "-0.01em" }],
      },
      spacing: {
        "section": "clamp(4rem, 12vw, 10rem)",
        "section-sm": "clamp(2rem, 6vw, 5rem)",
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(40px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "reveal-line": {
          "0%": { transform: "scaleX(0)" },
          "100%": { transform: "scaleX(1)" },
        },
        "marquee": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "reveal-line": "reveal-line 1s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "marquee": "marquee 30s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
