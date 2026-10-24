import { describe, expect, it } from "vitest";
import { isProductAvailable } from "@/lib/product-availability";

describe("isProductAvailable", () => {
  it("allows products with positive inventory", () => {
    expect(isProductAvailable(1)).toBe(true);
    expect(isProductAvailable(12)).toBe(true);
  });

  it("rejects zero and negative inventory", () => {
    expect(isProductAvailable(0)).toBe(false);
    expect(isProductAvailable(-1)).toBe(false);
  });

  it("rejects non-finite inventory values", () => {
    expect(isProductAvailable(Number.NaN)).toBe(false);
    expect(isProductAvailable(Number.POSITIVE_INFINITY)).toBe(false);
  });
});
