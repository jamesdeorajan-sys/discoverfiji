-- DiscoverFiji.ai — Supabase Schema (Phase 0/1)
-- Run this in the Supabase SQL Editor after project creation.
-- Scope: AI concierge + lead/quote capture + content for SEO pages.
-- Booking/payment is NOT handled here — quotes hand off to
-- fijitourtransfers.com's existing WooCommerce checkout (decision: Session 46).

create extension if not exists "uuid-ossp";

-- ── Destinations (powers the 500+ SEO pages) ───────────────────────
create table destinations (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  name text not null,
  region text,
  summary text,
  body_md text,
  hero_image_url text,
  lat numeric,
  lng numeric,
  meta_title text,
  meta_description text,
  published boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ── Tours (reference content, can mirror fijitourtransfers.com data) ─
create table tours (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  name text not null,
  category text, -- e.g. 'snorkeling','diving','horse-riding','cultural'
  destination_id uuid references destinations(id),
  description text,
  price_from numeric,
  currency text default 'AUD',
  duration_minutes int,
  booking_url text, -- handoff link to fijitourtransfers.com
  image_url text,
  active boolean default true,
  created_at timestamptz default now()
);

-- ── Resorts (affiliate program reference data) ─────────────────────
create table resorts (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  name text not null,
  destination_id uuid references destinations(id),
  description text,
  star_rating numeric,
  affiliate_url text,
  image_url text,
  active boolean default true,
  created_at timestamptz default now()
);

-- ── Partners (tour operators, transfer companies, resorts paying for placement) ─
create table partners (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  category text,
  whatsapp_number text,
  contact_email text,
  website_url text,
  featured boolean default false,
  active boolean default true,
  created_at timestamptz default now()
);

-- ── Reviews ─────────────────────────────────────────────────────────
create table reviews (
  id uuid primary key default uuid_generate_v4(),
  tour_id uuid references tours(id),
  resort_id uuid references resorts(id),
  author_name text,
  rating int check (rating between 1 and 5),
  body text,
  source text, -- 'google','tripadvisor','trustpilot','site'
  published boolean default true,
  created_at timestamptz default now()
);

-- ── Blog articles (content strategy: guides, "best of" lists) ─────
create table blog_articles (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  title text not null,
  excerpt text,
  body_md text,
  cover_image_url text,
  published boolean default false,
  published_at timestamptz,
  created_at timestamptz default now()
);

-- ── AI chat + leads ─────────────────────────────────────────────────
-- DECISION (Session 46, 2026-06-23): no separate AI brain, leads table,
-- or conversation memory here. DiscoverFiji.ai's chat UI proxies server-side
-- to the existing Lagi Worker (fiji-chat-widget, site_id: 'lagi_public'),
-- which already handles RAG search, heat scoring, D1 lead capture, partner
-- routing, and WhatsApp/email notification automatically on every message.
-- Building a parallel leads/quotes/conversations system here would just
-- fragment the same signal Lagi already compounds across 29+ partner sites.
-- See src/app/api/chat/route.ts for the proxy implementation.

-- ── Row Level Security ─────────────────────────────────────────────
-- Public content tables: readable by anyone, writable only via service role (server-side).
alter table destinations enable row level security;
alter table tours enable row level security;
alter table resorts enable row level security;
alter table partners enable row level security;
alter table reviews enable row level security;
alter table blog_articles enable row level security;

create policy "Public read published destinations" on destinations
  for select using (published = true);
create policy "Public read active tours" on tours
  for select using (active = true);
create policy "Public read active resorts" on resorts
  for select using (active = true);
create policy "Public read active partners" on partners
  for select using (active = true);
create policy "Public read published reviews" on reviews
  for select using (published = true);
create policy "Public read published blog articles" on blog_articles
  for select using (published = true);
