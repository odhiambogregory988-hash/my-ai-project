# Google OAuth Redirect URL Setup — Orwa Sole Co.

This guide covers the **one-time Supabase dashboard configuration** needed to make
"Continue with Google" work on all three platforms: customer login/register, admin login,
and the dashboard switch-account flow.

## The Problem

Google sign-in redirects the browser to:

```
https://kgpkwapxntndsxmfzlgu.supabase.co/auth/v1/callback?...
```

Supabase then exchanges the code for a session and redirects the browser back to your app
at the URL you passed as `redirectTo` in `signInWithOAuth({ redirectTo: "..." })`.

If that `redirectTo` URL is **not** in Supabase's allow list, the auth fails silently or
with "Unable to exchange external code" / "Redirect URL not allowed" errors.

## Step 1 — Supabase Dashboard: URL Configuration

Open **https://supabase.com/dashboard/project/kgpkwapxntndsxmfzlgu**

Go to **Authentication → URL Configuration** (in the left sidebar, under "Authentication").

### Site URL
Set this to your production URL once you have one, e.g.:
```
https://orwas.co.ke
```
For local development only, leave it as `http://localhost:3000` or set it to your
production URL and rely on the wildcard below for local dev.

### Redirect URLs (add all three)
Click **Add URL** for each of these. Use the **wildcard** form so any port works:

```
http://localhost:3000/**
http://localhost:*/**
https://kgpkwapxntndsxmfzlgu.supabase.co/auth/v1/callback
```

- `http://localhost:3000/**` — covers the standard dev port
- `http://localhost:*/**` — covers any local dev port (the dev server picks a random
  port each time it starts; this wildcard handles that)
- `https://kgpkwapxntndsxmfzlgu.supabase.co/auth/v1/callback` — the Supabase OAuth
  callback endpoint itself (Google redirects here first, then Supabase redirects to
  your app)

Click **Save** after adding all three.

## Step 2 — Google Cloud Console: Authorized Redirect URIs

Open **https://console.cloud.google.com/apis/credentials**

Find your **OAuth 2.0 Client ID** (Web application type). Under **Authorized redirect URIs**,
ensure this exact URI is listed:

```
https://kgpkwapxntndsxmfzlgu.supabase.co/auth/v1/callback
```

If it's missing, click **+ ADD URI** and paste it. Click **Save**.

This is the **only** URI Google needs — Google redirects to Supabase's callback, and
Supabase handles the rest. You do NOT add `localhost` URLs to Google's allow list.

## Step 3 — Google Cloud Console: OAuth Consent Screen

If you haven't configured the consent screen yet:

1. Go to **OAuth consent screen** in Google Cloud Console
2. Set **User type** to **External** (unless you have Google Workspace)
3. Add your **App name** (e.g. "Orwa Sole Co.") and **Support email**
4. Under **Authorized domains**, add:
   - `supabase.co` (required for the Supabase callback to work)
5. Click **Save and Continue** through the Scopes and Test users sections
   (you can skip adding test users if the app is in "Testing" mode — just add your
   own Gmail as a test user)

**Important:** If the consent screen is in "Testing" mode, only added test users can
sign in. Add your Gmail(s) as test users, or publish the app to "In production" when
you're ready.

## Step 4 — Supabase Dashboard: Google Provider

Open **Authentication → Providers → Google**

1. Toggle Google **ON**
2. If the Client ID / Client Secret are blank, paste them from Google Cloud Console
   → APIs & Services → Credentials → your Web application OAuth client
   (Download JSON to get both values)
3. Click **Save**

## Step 5 — Verify It Works

Hard-refresh the relevant page (Ctrl + Shift + R) and click **Continue with Google**.

### Customer login
- **File:** `app/login/page.tsx`
- **Flow:** Click Google → Google consent → Supabase callback → redirect to `/dashboard`
- **redirectTo in code:** `window.location.origin + "/dashboard"`

### Customer register
- **File:** `app/register/page.tsx`
- **Flow:** Same as login — Google creates the account if it doesn't exist
- **redirectTo in code:** `window.location.origin + "/dashboard"`

### Admin login
- **File:** `app/admin/login/page.tsx`
- **Flow:** Click Google → Google consent → Supabase callback → `/admin/login?code=...`
  → the login page validates the code client-side → mints admin session → redirects to `/admin`
- **redirectTo in code:** `window.location.origin + "/admin/login"` (the callback page
  handles the `?code=` param)

### Dashboard switch account
- **File:** `app/dashboard/page.tsx`
- **Flow:** Click "Switch account" → signs out → Google consent with `prompt=select_account`
  → redirect back to `/dashboard`
- **redirectTo in code:** `window.location.origin + "/dashboard"`

## Troubleshooting

### "Unable to exchange external code: 4/0A..."
This means Supabase received the code from Google but couldn't redeem it. The #1 cause:
the **Client Secret** in Supabase's Google provider settings is stale (you regenerated it
in Google Cloud Console but didn't update Supabase). Fix: re-paste the Client ID and
Client Secret from Google Cloud Console → Download JSON.

### Redirect goes to localhost:3000 instead of the actual dev port
The `redirectTo` in `signInWithOAuth` uses `window.location.origin`, which is the actual
running port. If Supabase's URL Configuration only has `http://localhost:3000/**` but the
dev server is on port 52839, the redirect URL won't match. Add `http://localhost:*/**`
to the Redirect URLs list.

### Google shows "This site can't be reached" or "localhost refused to connect"
This happens when the dev server isn't running on the port Supabase is trying to redirect
to. Make sure your dev server is running, then try again. Adding `http://localhost:*/**`
to the Redirect URLs list prevents this.

### Works on PC but not on phone
`localhost` only exists on the machine running the dev server. On your phone,
`http://localhost:3000` points to the phone itself. For mobile testing, either:
- Use the Supabase **Project URL** as the Site URL and test with the deployed version, or
- Use your PC's LAN IP (e.g. `http://192.168.1.100:3000/**`) in the Redirect URLs
  and connect your phone to the same WiFi

### "Redirect URL not allowed" or "Invalid redirect URL"
The `redirectTo` URL doesn't match anything in Supabase's Redirect URLs list. Double-check
Step 1 — make sure the exact origin (including port) is covered by a wildcard or explicit
entry.

## How the Code Works

All Google sign-in flows use this pattern (from `components/GoogleSignInButton.tsx`):

```ts
supabase.auth.signInWithOAuth({
  provider: "google",
  options: {
    redirectTo: `${window.location.origin}${redirectTo}`,
  },
});
```

- `window.location.origin` = the actual running origin (e.g. `http://localhost:52839`)
- `redirectTo` = the path to send the user to after auth

The `redirectTo` path differs by platform:
| Platform | redirectTo |
|---|---|
| Customer login/register | `/dashboard` |
| Admin login | `/admin/login` (the login page handles `?code=`) |
| Dashboard switch account | `/dashboard` |

All of these become full URLs like `http://localhost:52839/admin/login` — and the
wildcard `http://localhost:*/**` in Supabase's Redirect URLs covers all of them.
