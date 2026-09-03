# Google Sign-In — Redirect URL Setup Sheet

Your Supabase project ref: **`kgpkwapxntndsxmfzlgu`**

Copy-paste these EXACT values into the two dashboards below.

---

## 1. Google Cloud Console (console.cloud.google.com)

1. Sign in → select your project at the top.
2. Left menu → **APIs & Services** → **Credentials**
3. Click your **OAuth client ID** (the web application one).
4. Under **Authorized redirect URIs** → **ADD URI**, paste:

```
https://kgpkwapxntndsxmfzlgu.supabase.co/auth/v1/callback
```

5. Click **Save**.

---

## 2. Supabase Dashboard

Open: https://supabase.com/dashboard/project/kgpkwapxntndsxmfzlgu

### a) Authentication → URL Configuration
- **Site URL**: `http://localhost:3000`
- **Redirect URLs** → **Add URL**:
```
http://localhost:3000/**
```

### b) Authentication → Providers → Google
- Toggle **Enable Sign in with Google** ON.
- **Client ID** and **Client Secret** — copy from Google Cloud (the same OAuth client from step 1).
- The **Callback URL** shown on this page should read:
```
https://kgpkwapxntndsxmfzlgu.supabase.co/auth/v1/callback
```
  …and it must match the Authorized redirect URI in Google Cloud exactly.

---

## How the flow works (so you understand the error)

```
Browser → Supabase → Google → back to Supabase callback → back to your site
```

1. You click "Continue with Google" → your app asks Supabase.
2. Supabase sends you to Google — Google only allows it if **`…supabase.co/auth/v1/callback`** is on the allowlist (step 1 above).
3. Google sends you back to Supabase's callback.
4. Supabase then sends you to `http://localhost:3000/dashboard` — only allowed if **`http://localhost:3000/**`** is in Supabase's Redirect URLs (step 2a above).

If either list is missing, you'll see a redirect error or land back without signing in.

---

## Common gotchas
- The callback URL must match **exactly** (no trailing slash difference, same https).
- If you open the site on a different port, add that too, e.g. `http://localhost:3001/**`.
- After changing Google Cloud settings, wait a couple of minutes — Google sometimes takes a moment to propagate.