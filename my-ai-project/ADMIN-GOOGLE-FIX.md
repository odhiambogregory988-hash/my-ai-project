# Fix Google Sign-In on Admin Login — Orwa Sole Co.

## What's happening

The Google button on `/admin/login` calls `supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: window.location.origin + "/admin/login" } })`.

This redirects the browser to:
1. Google's consent screen
2. Back to `http://localhost:PORT/admin/login?code=...`
3. The page exchanges the code for a session, then mints the admin cookie and redirects to `/admin`

**If nothing happens when you click the button**, the issue is in Supabase's configuration.
**If you get redirected to Google then back with an error**, the redirect URL isn't registered.

## Step 1 — Check the Supabase URL Configuration

Open **https://supabase.com/dashboard/project/kgpkwapxntndsxmfzlgu**

Go to **Authentication → URL Configuration** (left sidebar).

### Site URL
Set this to your production URL (once you have one). For now, it can stay as `http://localhost:3000` — but see the redirect URLs below.

### Redirect URLs
These are the URLs Supabase will redirect to after auth. Click **Add URL** for each:

```
http://localhost:3000/**
http://localhost:*/**
https://kgpkwapxntndsxmfzlgu.supabase.co/auth/v1/callback
```

The key one is `http://localhost:*/**` — this wildcard covers **any** localhost port, so the changing dev server port won't break Google sign-in.

Click **Save** after adding all three.

## Step 2 — Check the Google Provider

Go to **Authentication → Providers → Google**

- Is Google **ON**?
- Are the **Client ID** and **Client Secret** filled in?

If either is missing or looks wrong:
1. Go to **Google Cloud Console → APIs & Services → Credentials**
2. Find your OAuth 2.0 Client ID (Web application type)
3. **Download JSON** to get the current Client ID + Client Secret
4. Copy both into Supabase's Google provider settings
5. Click **Save**

## Step 3 — Check Google Cloud Console

Open **https://console.cloud.google.com/apis/credentials**

Find your OAuth 2.0 Client ID. Under **Authorized redirect URIs**, confirm:
```
https://kgpkwapxntndsxmfzlgu.supabase.co/auth/v1/callback
```

If it's missing, add it. This is the **only** URI Google needs — Google redirects to Supabase, and Supabase handles the rest.

Also check **OAuth consent screen**:
- If it's in "Testing" mode, your Gmail must be added as a **Test user**
- Go to **OAuth consent screen → Test users** and add your Gmail if it's not there

## Step 4 — Test

1. Hard refresh the admin login page: `http://localhost:55408/admin/login` (Ctrl + Shift + R)
2. Click **Continue with Google**
3. Pick your Google account
4. You should land on the Admin Dashboard if your email is on the admin list

If it still fails, note the exact error:
- **In the browser console** (F12 → Console tab)
- **On the screen** after the redirect

## Common errors

| What you see | Cause | Fix |
|---|---|---|
| Nothing happens on click | `isSupabaseConfigured()` returns false, or JS error | Check browser console (F12); verify `.env.local` has valid keys |
| "Unable to exchange external code: 4/0A..." | Stale Client Secret in Supabase | Re-paste Client ID + Secret from Google Cloud Console → Download JSON |
| "Redirect URL not allowed" | The `redirectTo` URL isn't in Supabase's allow list | Add `http://localhost:*/**` to URL Configuration → Redirect URLs |
| Redirects to wrong port | Site URL in Supabase points elsewhere | Add `http://localhost:*/**` wildcard (covers all ports) |
| Google shows "This app isn't verified" | Consent screen is in Testing mode | Add your Gmail as a test user, or publish to "In production" |
| "This Google account is not on the admin list" | Your email isn't on the admin roster | Sign in to `/admin` with another admin account, go to Admin management, add your email |

## Current state of the code

The Google button on `/admin/login` is now properly wired:
- `handleGoogle()` function calls `supabase.auth.signInWithOAuth()`
- Redirects to `window.location.origin + "/admin/login"` (uses the actual running port)
- Shows "Connecting…" while loading
- Shows error message if Supabase isn't configured or the call fails
- The `?code=` exchange happens client-side on the login page (like the customer dashboard)

The code is correct. The issue is in the Supabase dashboard configuration.
