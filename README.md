# Gratitude

A simple social website where users sign in with Google, set a username, search for friends to follow, and post short gratitude updates to their timeline. Friends can see and heart posts.

## Tech Stack

- Next.js 14+ (App Router) + TypeScript
- Supabase (Google OAuth, PostgreSQL, Row Level Security)
- Tailwind CSS
- Vercel (deployment)

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a project
2. Copy your project URL and anon key from Settings → API

### 3. Configure Google OAuth

1. In [Google Cloud Console](https://console.cloud.google.com), create OAuth 2.0 credentials (Web application)
2. Add authorized redirect URI: `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
3. In Supabase: Authentication → Providers → Google, enable and add Client ID + Secret

### 4. Run database migrations

In the Supabase SQL Editor, run the contents of `supabase/migrations/001_initial.sql`.

### 5. Environment variables

Copy `.env.local.example` to `.env.local` and fill in:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

For production, set `NEXT_PUBLIC_SITE_URL` to your deployed URL (e.g. `https://your-app.vercel.app`) and add that URL to Supabase Authentication → URL Configuration → Redirect URLs.

### 6. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy on Vercel

1. Push to GitHub and import the repo in Vercel
2. Add the same environment variables in Vercel
3. Add your Vercel URL to Supabase redirect URLs
