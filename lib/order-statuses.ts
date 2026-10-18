// Shared order status constants for the Orwa Sole Co. admin/data surface.
//
// The only statuses the admin UI can set and the only statuses the admin and
// dashboard status visuals are wired up to render. A new status is not
// automatically “supported” — it has to be added here first, and then the
// status visuals have to be opted into on the same change.
//
// This is the regression guard for the stale-visuals problem: without a single
// source of truth, a new status can land in the database and then silently get
// the fallback/unknown visual treatment in one place and not another.
//
// Public tracking deliberately keeps its own narrower slice. See the comment on
// lib/accounts.ts findOrder and supabase/schema.sql public.track_order.
export const ORDER_STATUSES = [
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

/** Every known status. Any future status must be added to ORDER_STATUSES too. */
export const ALL_KNOWN_STATUSES: ReadonlyArray<string> = ORDER_STATUSES;
