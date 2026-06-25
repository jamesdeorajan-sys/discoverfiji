# DiscoverFiji.ai

"Your Personal AI Guide to Fiji" — an AI-powered trip planner, quote generator,
and content engine that drives leads and bookings to Fiji Tour Transfers.

## Status: Phase 0 — Foundation

This is the initial scaffold. Built so far:

- Next.js 15 (App Router, TypeScript, Tailwind v4)
- Visual identity: bathymetric-chart design system (see `src/app/globals.css`
  for tokens, `src/app/page.tsx` for the homepage implementation)
- Supabase schema (`supabase/schema.sql`) — destinations, tours, resorts,
  partners, reviews, blog articles, AI conversations, quotes, leads
- Supabase client setup (`src/lib/supabase/`) — browser, server, and
  service-role clients
- OpenAI client setup (`src/lib/openai.ts`)

**Booking model:** this site does NOT process payments directly. The AI
Quote Generator and itinerary builder hand off to fijitourtransfers.com's
existing WooCommerce checkout — same pattern as Lagi's referral buttons on
the Vakaviti.ai platform. (Decision made Session 46, 2026-06-23.)

## Setup

1. Copy `.env.local.example` to `.env.local` and fill in:
   - Supabase project URL + anon key + service role key (from Supabase
     dashboard -> Project Settings -> API)
   - OpenAI API key (from platform.openai.com -> API keys)
2. Run the schema: open Supabase dashboard -> SQL Editor -> paste in the
   contents of `supabase/schema.sql` -> Run
3. `npm install`
4. `npm run dev`

## Deploy

Connect this repo to Vercel (vercel.com -> Add New Project -> Import this
repo) and add the same environment variables from `.env.local` in the
Vercel project settings. Every push to `main` will auto-deploy.

## Next steps (not yet built)

- AI concierge chat interface (Phase 1)
- AI Quote Generator UI + logic
- Core destination/tour/resort pages (Phase 3)
- Programmatic SEO scale-out to 500+ pages (Phase 4)
- Itinerary builder (PDF/email/WhatsApp output) (Phase 5)

See BRAIN.md / launch tracker on the Vakaviti.ai side for the fuller
strategic context this project sits alongside.
