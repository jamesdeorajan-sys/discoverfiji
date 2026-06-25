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

-- ── AI Conversations (chat memory for the AI concierge) ────────────
create table ai_conversations (
  id uuid primary key default uuid_generate_v4(),
  session_id text not null,
  role text check (role in ('user','assistant')) not null,
  content text not null,
  intent text,
  created_at timestamptz default now()
);
create index idx_ai_conversations_session on ai_conversations(session_id);

-- ── Quotes (AI Quote Generator output) ─────────────────────────────
create table quotes (
  id uuid primary key default uuid_generate_v4(),
  session_id text,
  arrival_airport text,
  resort_id uuid references resorts(id),
  resort_name_freetext text, -- in case resort isn't in our table yet
  passengers int,
  travel_date date,
  vehicle_type text,
  price numeric,
  currency text default 'AUD',
  booking_handoff_url text, -- the fijitourtransfers.com link generated for this quote
  created_at timestamptz default now()
);

-- ── Leads (captured before handoff to Fiji Tour Transfers) ────────
create table leads (
  id uuid primary key default uuid_generate_v4(),
  session_id text,
  name text,
  email text,
  phone text,
  intent_category text,
  travel_dates text,
  group_size int,
  budget_signal text, -- 'budget','mid','premium'
  itinerary_summary text,
  quote_id uuid references quotes(id),
  source_page text, -- which page/flow the lead came from
  handed_off boolean default false, -- true once sent to Fiji Tour Transfers
  handed_off_at timestamptz,
  created_at timestamptz default now()
);

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

-- Lead/quote/conversation tables: no public read access at all.
-- All access goes through server-side code using the service role key.
alter table leads enable row level security;
alter table quotes enable row level security;
alter table ai_conversations enable row level security;
-- (No policies created = no access except via service role, which bypasses RLS.)
