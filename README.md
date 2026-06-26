# DiscoverFiji.ai

"Your Personal AI Guide to Fiji" — an AI-powered trip planner and SEO content
engine that drives leads and bookings for Fiji Tour Transfers.

## Architecture decision (Session 46, 2026-06-23)

**This site does not run its own AI brain.** The chat interface proxies
server-side to the existing **Lagi Worker** (`fiji-chat-widget`, the same
brain powering 29+ partner sites and lagi.vakaviti.ai), in public mode
(`site_id: 'lagi_public'`). This means DiscoverFiji.ai automatically inherits,
for free, with zero extra code:

- RAG search across Lagi's full Vectorize knowledge base
- Heat scoring + automatic D1 lead capture
- Partner directory routing + WhatsApp referral buttons
- Email/WhatsApp notification to whichever partner matches the conversation

Building a separate OpenAI-powered chatbot with its own vector DB (as the
original project brief specified) was considered and rejected — it would
have meant starting from zero knowledge and fragmenting every conversation's
learning signal into a second, disconnected pool instead of compounding into
the one brain that already serves the whole network. See `src/app/api/chat/route.ts`
for the proxy implementation.

**Content strategy implication:** the planned 500 destination pages should,
once written, also be pushed into Lagi's knowledge base via its existing
`/knowledge-add` endpoint — not just live as static content here. That makes
every page written a permanent improvement to Lagi's knowledge for every
site it serves, not just this one. (Not yet automated — manual review before
ingestion recommended, since `/knowledge-add` has no auth and feeds the same
authoritative knowledge base every partner relies on — bad content in is bad
answers out, everywhere.)

**Booking model:** this site does not process payments. Quotes/itineraries
hand off to fijitourtransfers.com's existing WooCommerce checkout.

## Status: Phase 1 — Foundation + working chat + stop-gap nav fix

Built so far:

- Next.js 15 (App Router, TypeScript, Tailwind v4)
- Visual identity: bathymetric-chart design system (`src/app/globals.css`,
  `src/app/page.tsx`)
- **Working AI chat** (`src/components/PlannerChat.tsx` +
  `src/app/api/chat/route.ts`) — live on the homepage, real responses from Lagi
- **Stop-gap homepage nav fix (Session 48):** the category tiles and "Start
  Planning" CTAs previously linked to internal pages (`/tours`,
  `/airport-transfers`, etc.) that were never built — they were 404ing on
  the live site. Now route to real, live pages on fijitourtransfers.com /
  nadiairporttransfers.com, or scroll to the working chat box, so no click
  on the homepage is a dead end. Swap back to internal routes as the real
  DiscoverFiji pages below get built.
- D1 schema (`d1/schema.sql`) — destinations, tours, resorts, partners,
  reviews, blog articles. (No leads/quotes/conversations tables — see
  architecture decision above for why.)
- D1 REST API client (`src/lib/d1.ts`) — server-only, used from Route
  Handlers / Server Components, never from the browser

### Database: Cloudflare D1, not Supabase (Session 48 decision)

The original spec called for Supabase (Postgres) for content tables and
OpenAI for page-copy drafting. Both got dropped:

- **D1 instead of Supabase.** James already runs the whole platform on
  Cloudflare (`vakaviti-kb` D1 powers 21 tables across 29+ partners).
  Adding a second vendor/database for this site's content tables didn't
  serve any real purpose D1 couldn't — it just meant more dashboards and
  credentials to manage at the 50+ partner scale this platform is built
  for. DiscoverFiji.ai gets its **own dedicated D1 database**
  (`discoverfiji-content`), not the shared `vakaviti-kb` one — keeps this
  site's content work fully isolated from the live, revenue-critical
  partner/lead data, while staying 100% Cloudflare.
- **No OpenAI account.** Page copy gets drafted directly with Claude in
  build sessions — no separate API key, no extra vendor, for a job that
  doesn't need live API access anyway.
- **The technical wrinkle:** Vercel serverless functions can't use D1's
  native Worker bindings (Worker-only). Solved by calling D1's REST API
  over `fetch()` instead — the exact same pattern `api/chat/route.ts`
  already uses to call the Lagi Worker. See `src/lib/d1.ts`.

## Setup

1. Copy `.env.local.example` to `.env.local` and fill in:
   - `CLOUDFLARE_D1_DATABASE_ID` — from the D1 database's page in the
     Cloudflare dashboard (Workers & Pages → D1 SQL Database →
     discoverfiji-content)
   - `CLOUDFLARE_D1_API_TOKEN` — an Account API Token with **D1 Edit**
     permission, scoped to this account (My Profile → API Tokens →
     Create Token)
   - `CLOUDFLARE_ACCOUNT_ID` is already filled in (same account as the
     rest of the platform)
2. Run the schema: Cloudflare dashboard → D1 → discoverfiji-content →
   Console → paste in `d1/schema.sql` → Execute
3. `npm install`
4. `npm run dev`

Chat works with zero environment variables — it's a static proxy to Lagi's
public endpoint, no keys needed on this side.

## Deploy

Connect this repo to Vercel (vercel.com -> Add New Project -> Import this
repo) and add the three `CLOUDFLARE_*` environment variables in the Vercel
project settings once you have them. Every push to `main` auto-deploys.

Live: discover.vakaviti.ai (discoverfiji.ai redirects here — Session 48)

## Next steps

- Write + review the first batch of destination pages, then push into
  Lagi's `/knowledge-add` endpoint
- Core destination/tour/resort pages, reading from `discoverfiji-content`
  via `src/lib/d1.ts`
- Programmatic SEO scale-out to 500+ pages
- As real DiscoverFiji pages get built for each category, swap the
  corresponding stop-gap external link in `src/app/page.tsx` back to an
  internal route
- Consider a small, surgical Worker change to recognize `discoverfiji` as
  its own site_id (still public-mode behavior) purely for analytics
  attribution in `conversation_events` — not required to ship, optional polish

See BRAIN.md / launch tracker on the Vakaviti.ai side for the fuller
strategic context this project sits alongside.
