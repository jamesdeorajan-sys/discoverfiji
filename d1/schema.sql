-- DiscoverFiji.ai — D1 Schema (Session 48)
-- Run this in the Cloudflare dashboard: D1 > discoverfiji-content > Console
-- (paste the whole file and execute, or use "Import" if offered)
--
-- Replaces the original Supabase/Postgres schema.sql — same six content
-- tables, converted to SQLite syntax for D1. Scope: content for the
-- destination/tour/resort SEO pages only.
--
-- DECISION (Session 46): no separate AI brain, leads table, or conversation
-- memory here. DiscoverFiji.ai's chat proxies server-side to the existing
-- Lagi Worker (fiji-chat-widget, site_id: 'lagi_public'), which already
-- handles RAG search, heat scoring, D1 lead capture (in vakaviti-kb, not
-- this database), partner routing, and WhatsApp/email notification.
--
-- DECISION (Session 48): uses a dedicated D1 database (discoverfiji-content),
-- not the shared vakaviti-kb database — keeps this site's content work
-- fully isolated from the live, revenue-critical partner/lead data.
--
-- ACCESS MODEL: D1 has no Row Level Security concept (unlike Postgres).
-- This database is only ever reached over Cloudflare's D1 REST API, called
-- server-side from Next.js Route Handlers using a secret API token that
-- never reaches the browser (see src/lib/d1.ts). Public/private access
-- control therefore lives entirely in the application code, not the
-- database — every query the browser can trigger must go through a
-- server-side function that explicitly filters (e.g. "where published = 1").

CREATE TABLE IF NOT EXISTS destinations (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  region TEXT,
  summary TEXT,
  body_md TEXT,
  hero_image_url TEXT,
  lat REAL,
  lng REAL,
  meta_title TEXT,
  meta_description TEXT,
  published INTEGER NOT NULL DEFAULT 0, -- 0/1 boolean
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS tours (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT, -- e.g. 'snorkeling','diving','horse-riding','cultural'
  destination_id TEXT REFERENCES destinations(id),
  description TEXT,
  price_from REAL,
  currency TEXT NOT NULL DEFAULT 'AUD',
  duration_minutes INTEGER,
  booking_url TEXT, -- handoff link to fijitourtransfers.com
  image_url TEXT,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS resorts (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  destination_id TEXT REFERENCES destinations(id),
  description TEXT,
  star_rating REAL,
  affiliate_url TEXT,
  image_url TEXT,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS partners (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  name TEXT NOT NULL,
  category TEXT,
  whatsapp_number TEXT,
  contact_email TEXT,
  website_url TEXT,
  featured INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  tour_id TEXT REFERENCES tours(id),
  resort_id TEXT REFERENCES resorts(id),
  author_name TEXT,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  body TEXT,
  source TEXT, -- 'google','tripadvisor','trustpilot','site'
  published INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS blog_articles (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  body_md TEXT,
  cover_image_url TEXT,
  published INTEGER NOT NULL DEFAULT 0,
  published_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_tours_destination ON tours(destination_id);
CREATE INDEX IF NOT EXISTS idx_resorts_destination ON resorts(destination_id);
CREATE INDEX IF NOT EXISTS idx_reviews_tour ON reviews(tour_id);
CREATE INDEX IF NOT EXISTS idx_reviews_resort ON reviews(resort_id);
