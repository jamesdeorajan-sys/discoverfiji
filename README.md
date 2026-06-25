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

## Status: Phase 0/1 — Foundation + working chat

Built so far:

- Next.js 15 (App Router, TypeScript, Tailwind v4)
- Visual identity: bathymetric-chart design system (`src/app/globals.css`,
  `src/app/page.tsx`)
- **Working AI chat** (`src/components/PlannerChat.tsx` +
  `src/app/api/chat/route.ts`) — live on the homepage, real responses from Lagi
- Supabase schema (`supabase/schema.sql`) — destinations, tours, resorts,
  partners, reviews, blog articles. (No leads/quotes/conversations tables —
  see architecture decision above for why.)
- Supabase client setup (`src/lib/supabase/`) — browser, server, service-role
- OpenAI client setup (`src/lib/openai.ts`) — scoped to one job: drafting
  first-pass copy for destination pages, NOT live chat

## Setup

1. Copy `.env.local.example` to `.env.local` and fill in:
   - Supabase project URL + anon key + service role key (Supabase dashboard
     -> Project Settings -> API) — needed for content tables (destinations,
     tours, resorts, etc.), not for chat
   - OpenAI API key (platform.openai.com -> API keys) — only used for
     drafting page copy, not live chat
2. Run the schema: Supabase dashboard -> SQL Editor -> paste in
   `supabase/schema.sql` -> Run
3. `npm install`
4. `npm run dev`

Chat works with zero environment variables — it's a static proxy to Lagi's
public endpoint, no keys needed on this side.

## Deploy

Connect this repo to Vercel (vercel.com -> Add New Project -> Import this
repo) and add the Supabase/OpenAI environment variables in the Vercel
project settings once you have them. Every push to `main` auto-deploys.

Live: discoverfiji.ai (domain connection in progress)

## Next steps

- Write + review the first batch of destination pages, then push into
  Lagi's `/knowledge-add` endpoint
- Core destination/tour/resort pages using the Supabase content tables
- Programmatic SEO scale-out to 500+ pages
- Consider a small, surgical Worker change to recognize `discoverfiji` as
  its own site_id (still public-mode behavior) purely for analytics
  attribution in `conversation_events` — not required to ship, optional polish

See BRAIN.md / launch tracker on the Vakaviti.ai side for the fuller
strategic context this project sits alongside.
