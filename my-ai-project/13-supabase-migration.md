# Lesson 13 — Moving from Browser Demo to Real Supabase

> Session 15 (continued) · September 3, 2026

## What changed

Before, customer accounts and orders lived in the browser (`localStorage`) —
every visitor saw their own fake world. Now they live in **Supabase**, so data
persists for everyone and survives refreshes, devices, and other people.

### The new architecture

```
Browser (React pages)
   │  register / login / checkout / track
   ▼
Supabase Auth        → who is the user? (email + password, JWT session)
Supabase Database    → profiles table, orders table (Row Level Security)
   ▲
/api/admin/data      → server route using the service role key (admin only)
```

### Key concepts you just learned

- **Auth vs Database** — Supabase Auth handles "who are you?"; the database
  tables store the actual data (profiles, orders).
- **Row Level Security (RLS)** — the database itself decides who may read/write
  each row. Customers only see *their own* profile and orders.
- **Service role key** — a server-only key that bypasses RLS. It never touches
  the browser; admin pages call `/api/admin/data` which uses it.
- **Secure public lookup** — guests can't query the orders table directly;
  they call a SQL function `track_order('ORW-…')` that returns just the summary.
- **Graceful fallback** — if Supabase isn't ready (missing key or tables), the
  site keeps working with the browser demo and shows a notice.

### The two setup steps you must do

1. **Service role key** → paste into `.env.local`:
   `SUPABASE_SERVICE_ROLE_KEY=…`
   (Supabase Dashboard → Settings → API → service_role. Keep it secret!)
2. **Run the SQL** in Supabase → SQL Editor:
   - first `supabase/admin_users.sql` (admin roster)
   - then `supabase/schema.sql` (profiles, orders, RLS, tracking function)

Optional: turn OFF email confirmation (Authentication → Providers → Email)
so test sign-ups log in instantly.

## Why this matters

- Orders placed by a visitor now appear for *you* in the admin panel
- Customers sign in from any device and see the same history
- The demo fallback means you can ship before the backend is perfect