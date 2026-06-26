-- Seed: Yasawa Islands destination + the real, live Sawa-I-Lau Caves tour.
-- Run in the Cloudflare dashboard: D1 > discoverfiji-content > Console.
--
-- The D1 dashboard console's query box is single-line, so paragraph breaks
-- in body_md use char(10) concatenation instead of literal newlines --
-- learned the hard way in Session 48 (pasting literal multi-line text
-- caused "Requests without any query are not supported").
--
-- Run each statement separately (paste one, Execute, then the next).
--
-- Tour data (price, duration, booking_url) pulled directly from the live
-- fijitourtransfers.com catalogue on 2026-06-26 -- not invented. Re-check
-- price_from periodically; it's a live, editable price on the source site
-- and could drift out of date here.

INSERT INTO destinations (id, slug, name, region, summary, body_md, meta_title, meta_description, published) VALUES ('dest_yasawa_islands', 'yasawa-islands', 'Yasawa Islands', 'Western Fiji', 'A chain of volcanic islands northwest of Nadi, known for the Sawa-i-Lau limestone caves, the Blue Lagoon, and some of Fiji''s most laid-back island life.', 'The Yasawa Islands are a string of roughly 20 volcanic islands stretching northwest from Viti Levu, reachable from Port Denarau by ferry or seaplane. They''re best known for the Sawa-i-Lau limestone caves -- a system of flooded caverns you swim into, with a hidden upper chamber lit by a natural skylight -- and for the Blue Lagoon, the turquoise bay made famous by the 1980 film of the same name.' || char(10) || char(10) || 'Most visitors base themselves at one of the resorts dotted along the chain and day-trip or island-hop from there, though the caves and lagoon are also commonly visited as a single full-day tour from Denarau. Compared to the Mamanuca Islands closer to Nadi, the Yasawas are quieter and less developed -- the appeal here is remoteness and water clarity rather than resort infrastructure.' || char(10) || char(10) || 'Getting there is part of the experience: most transport to the Yasawas runs via Port Denarau, so a transfer to Denarau is usually the first leg of any Yasawa trip from Nadi Airport.', 'Yasawa Islands, Fiji -- Sawa-i-Lau Caves & Blue Lagoon Guide', 'Everything to know about visiting Fiji''s Yasawa Islands: the Sawa-i-Lau caves, the Blue Lagoon, and how to get there from Nadi via Port Denarau.', 1);

INSERT INTO tours (id, slug, name, category, destination_id, description, price_from, currency, duration_minutes, booking_url, active) VALUES ('tour_sawa_i_lau_caves', 'sawa-i-lau-caves-yasawa-islands-tour', 'Sawa-I-Lau Caves (Yasawa Islands) Tour', 'island-tour', 'dest_yasawa_islands', 'A full-day tour from Port Denarau out to the Yasawa Islands to swim through the Sawa-i-Lau limestone caves, including the skylit upper chamber. Real live tour on fijitourtransfers.com -- rated 4.9 from 7 reviews at last check.', 580, 'AUD', 360, 'https://fijitourtransfers.com/st_tour/sawa-i-lau-caves-yasawa-islands-tour-fiji-2/', 1);
