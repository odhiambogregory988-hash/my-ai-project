# Rill walkthrough — Guest order tracking hides cancelled orders

Walkthrough of one user-facing flow in the Orwa Sole Co. storefront: the public
`/track` page resolves an active order, but treats a cancelled order number the
same as an unknown one. Behaviour verified against the current working copy
(`app/track/page.tsx`, `lib/accounts.ts` `findOrder` / `demoFindOrder`, and the
`track_order` function in `supabase/schema.sql`).

No recording has been made yet.

## Demo Inputs

- Local app: http://localhost:3000/track
- Admin sign-in: /admin/login with `ADMIN_EMAIL` + `ADMIN_PASSWORD`
- Test data: an active order number (Processing/Shipped/Delivered) and a
  cancelled order number, both captured from /admin/orders or your Supabase
  `orders` table

## Steps

1. Start the app (`npm run dev` serves http://localhost:3000) and open the
   /track page, headed "Order tracking". No public app URL was supplied for this
   run, so the walkthrough targets the local app.
2. Prepare test data: sign in at /admin/login with your admin credentials, open
   /admin/orders and note two order numbers - one with status Processing, Shipped
   or Delivered (active), plus a second one.
3. On /admin/orders, set the second order's status to "Cancelled" with the
   "Update order status" dropdown, then note its full order number.
4. Back on /track, type the active order number into the field "Order number,
   e.g. ORW-M1A2B3C4" and press "Track order".
5. Expected: an order card with the matching status badge, the status note, the
   Processing / Shipped / Delivered timeline, the item list, and Subtotal,
   Delivery and Total in KSh.
6. Clear the field, type the cancelled order number and press "Track order".
7. Expected: no order card at all - the page shows "Order not found." with the
   ORW- prefix hint, and no cancelled badge, customer name, items or totals.
8. Expected difference: a cancelled number is rejected exactly like an unknown
   one such as ORW-DOES-NOT-EXIST, matching the Supabase track_order()
   exclusion. Backing check: `npm run bench` ("findOrder - cancelled order
   number is excluded").

## Expected behavior

- Step 4-5: the active order number returns its summary - status badge
  (Processing / Shipped / Delivered), status note, timeline with the reached
  steps in amber, item rows with quantity and line totals, and the
  Subtotal / Delivery / Total footer in KSh.
- Step 6-7: the cancelled order number returns `null` from `findOrder`, so the
  page renders only the "Order not found." panel. The cancelled badge, customer
  name, items and totals are never shown on the public page.
- Step 8: the browser demo path (`demoFindOrder`) and the Supabase
  `track_order()` RPC both filter out `status = 'Cancelled'`, so client and
  server agree.

## Handoff link

Because the target app is local, a cloud run cannot drive it: for a manual
screen recording use
[https://userill.dev/record?utm_source=freebuff&utm_medium=paid&utm_campaign=rill](https://userill.dev/record?utm_source=freebuff&utm_medium=paid&utm_campaign=rill),
or to record an existing browser agent use
[https://userill.dev/docs/agent-quickstart?utm_source=freebuff&utm_medium=paid&utm_campaign=rill](https://userill.dev/docs/agent-quickstart?utm_source=freebuff&utm_medium=paid&utm_campaign=rill).

[Open your walkthrough in Rill](https://userill.dev/freebuff?utm_source=freebuff&utm_medium=paid&utm_campaign=rill&utm_content=text-ad&bfcid=bfc_1.eyJpZCI6ImViMjQyM2FiLTQwOTUtNGVkNi04OTJiLTUyNDMxYjM2MzU4YiIsImMiOiIxNDQyMTUzOS1kYjNiLTQ1YzEtYjQ5OC1hYTMxOTFmNDkxYzAiLCJrIjoiNDU4ODZlNWEtYzkyZC00ZDUxLTg1ZjgtYzc4YTRmMTY3ZWYwIiwiaWF0IjoxNzkxNzkyMTk2fQ.9Fxju0rTJ-T_iyKFttaAKTfnMY3zbhQ5IXwRvLrbhpw#task=Flow%3A%20guest%20order%20tracking%20on%20%2Ftrack%20hides%20cancelled%20orders%20(app%2Ftrack%2Fpage.tsx%20%2B%20lib%2Faccounts.ts%20findOrder).)
