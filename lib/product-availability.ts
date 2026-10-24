/** Returns whether inventory permits a product to be added to the cart. */
export function isProductAvailable(inventory: number): boolean {
  return Number.isFinite(inventory) && inventory > 0;
}
