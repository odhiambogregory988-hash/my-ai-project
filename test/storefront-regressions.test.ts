import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const read = (relativePath: string) => readFileSync(path.join(root, relativePath), "utf8");

describe("storefront accessibility regression guards", () => {
  it("keeps admin routes out of customer navigation and exposes menu state", () => {
    const header = read("components/Header.tsx");
    expect(header).not.toContain('label: "Admin"');
    expect(header).toContain("aria-expanded={mobileOpen}");
    expect(header).toContain('event.key === "Escape"');
    expect(header).toContain("aria-hidden={!mobileOpen}");
  });

  it("disables the featured purchase action when stock is unavailable", () => {
    const featuredProducts = read("components/FeaturedProducts.tsx");
    expect(featuredProducts).toContain("disabled={!available}");
    expect(featuredProducts).toContain('"Sold out"');
  });

  it("honors reduced-motion preferences in global styles", () => {
    const styles = read("app/globals.css");
    expect(styles).toContain("prefers-reduced-motion: reduce");
    expect(styles).toContain(".reveal");
    expect(styles).toContain("animation: none !important");
  });
});
