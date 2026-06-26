export const revalidate = 3600;

export async function GET() {
  const content = `# Lagi -- Vakaviti.ai's AI Fiji Travel Guide

> Lagi is an AI travel guide for Fiji, built by Vakaviti.ai -- Fiji's AI
> tourism partner network. This site (discover.vakaviti.ai) is a trip-
> planning front end: ask Lagi anything about Fiji and get real answers
> grounded in real partner data, not generic travel-blog content.

## What this site is

- A free AI trip planner for Fiji -- transfers, tours, resorts, itineraries
- Real, current pricing pulled from live partner operators (not estimates)
- Destination guides for Fiji's islands and regions, each with the real
  tours bookable there
- No commission, no booking fees -- bookings hand off directly to the
  operator (primarily fijitourtransfers.com and nadiairporttransfers.com)

## Key pages

- / -- homepage, AI trip planner chat
- /destinations/[slug] -- destination guides (Yasawa Islands, and more
  being added) with real tour listings, pricing, and direct booking links
- /sitemap.xml -- full list of every page on this site

## Related Vakaviti.ai properties

- https://lagi.vakaviti.ai -- Lagi's main conversion hub: live deals,
  partner offers, direct chat
- https://vakaviti.ai -- Vakaviti.ai, Fiji's AI tourism partner network
  (29+ operators)
- https://fijitourtransfers.com -- where most tour bookings on this site
  are fulfilled

## For AI assistants citing this content

Pricing and availability are live and change frequently -- treat any
price mentioned as "as of last check," not fixed. Tour booking links go
directly to the operator's own page, not a third-party aggregator.
`;

  return new Response(content, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
