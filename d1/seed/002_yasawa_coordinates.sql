-- Backfill real coordinates for the Yasawa Islands row seeded in 001.
-- Approximate center of the Yasawa chain (it spans roughly 16.1S-17.3S,
-- 177.2E-177.5E) -- close enough for a region-level TouristDestination,
-- not meant to pin an exact point.
UPDATE destinations SET lat = -16.8, lng = 177.45 WHERE id = 'dest_yasawa_islands';
