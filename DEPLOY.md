# Deploy Ripple to Vercel

## 1. Push to GitHub

If you haven't already:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/gratitude.git
git push -u origin main
```

## 2. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in (use GitHub)
2. Click **Add New** → **Project**
3. Import your `gratitude` repo
4. Add these **Environment Variables** (from your `.env.local`):

   | Name | Value |
   |------|-------|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://fdueszuhdkfdcwozbtsr.supabase.co` |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | (your anon key) |
   | `NEXT_PUBLIC_SITE_URL` | `https://YOUR_VERCEL_APP.vercel.app` |

5. Deploy

After the first deploy, Vercel will give you a URL like `gratitude-xyz.vercel.app`. Update `NEXT_PUBLIC_SITE_URL` to that URL and redeploy if needed.

## 3. Update Supabase for production auth

1. Go to [Supabase Dashboard](https://supabase.com/dashboard) → your project → **Authentication** → **URL Configuration**
2. Add to **Redirect URLs**:
   - `https://YOUR_VERCEL_APP.vercel.app/auth/callback`
   - `https://YOUR_VERCEL_APP.vercel.app/**`
3. Set **Site URL** to `https://YOUR_VERCEL_APP.vercel.app`

4. If you use Google OAuth, go to **Authentication** → **Providers** → **Google** and add the production URL to the authorized redirect URIs in the [Google Cloud Console](https://console.cloud.google.com/apis/credentials).

## 4. Database migrations

Your migrations should already be applied. If not, run them via the Supabase Dashboard **SQL Editor** or `supabase db push` (after `supabase link`).

## 5. Share with friends

Once deployed, share your Vercel URL (e.g. `https://gratitude.vercel.app`) with your friends.
