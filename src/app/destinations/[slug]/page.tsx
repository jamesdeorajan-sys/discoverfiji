import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { d1Query } from "@/lib/d1";

export const revalidate = 3600; // D1 REST API is rate-limited account-wide — cache an hour

type DestinationRow = {
  id: string;
  slug: string;
  name: string;
  region: string | null;
  summary: string | null;
  body_md: string | null;
  meta_title: string | null;
  meta_description: string | null;
  lat: number | null;
  lng: number | null;
  published: number;
};

type TourRow = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price_from: number | null;
  currency: string;
  duration_minutes: number | null;
  booking_url: string | null;
};

async function getDestination(slug: string): Promise<DestinationRow | null> {
  const rows = await d1Query<DestinationRow>(
    "SELECT * FROM destinations WHERE slug = ? AND published = 1 LIMIT 1",
    [slug]
  );
  return rows[0] ?? null;
}

async function getTours(destinationId: string): Promise<TourRow[]> {
  return d1Query<TourRow>(
    "SELECT id, slug, name, description, price_from, currency, duration_minutes, booking_url FROM tours WHERE destination_id = ? AND active = 1",
    [destinationId]
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const destination = await getDestination(slug);
  if (!destination) return {};

  return {
    title: destination.meta_title ?? `${destination.name} — Lagi's Fiji Guide`,
    description: destination.meta_description ?? destination.summary ?? undefined,
    alternates: {
      canonical: `/destinations/${destination.slug}`,
    },
  };
}

function formatDuration(minutes: number | null): string | null {
  if (!minutes) return null;
  const hrs = minutes / 60;
  return hrs % 1 === 0 ? `${hrs} hr${hrs === 1 ? "" : "s"}` : `${minutes} min`;
}

/** One stroke from the homepage's bathymetric contour family — a quiet
 *  section divider that echoes the signature without repeating the full
 *  hero backdrop on every page. */
function ContourRule() {
  return (
    <svg
      viewBox="0 0 1200 24"
      preserveAspectRatio="none"
      className="h-6 w-full text-reef-light/30"
      aria-hidden="true"
    >
      <path
        d="M 0 14 Q 200 4 400 12 T 800 10 T 1200 16"
        fill="none"
        stroke="currentColor"
        strokeWidth={1}
      />
    </svg>
  );
}

/** Builds the JSON-LD schema for a destination page: TouristDestination +
 *  Product/Offer per tour + BreadcrumbList. This is the piece that
 *  actually drives AI citation and rich results -- the visible page
 *  content alone isn't enough for crawlers to parse pricing, location,
 *  and offers reliably. Every one of the 500 planned pages gets this for
 *  free since it's built into the shared template, not per-page. */
function buildSchema(destination: DestinationRow, tours: TourRow[]) {
  const url = `https://discover.vakaviti.ai/destinations/${destination.slug}`;

  const touristDestination: Record<string, unknown> = {
    "@type": "TouristDestination",
    "@id": url,
    name: destination.name,
    description: destination.summary ?? undefined,
    url,
  };
  if (destination.lat != null && destination.lng != null) {
    touristDestination.geo = {
      "@type": "GeoCoordinates",
      latitude: destination.lat,
      longitude: destination.lng,
    };
  }

  const products = tours.map((tour) => ({
    "@type": "Product",
    name: tour.name,
    description: tour.description ?? undefined,
    url: tour.booking_url ?? url,
    offers:
      tour.price_from != null
        ? {
            "@type": "Offer",
            price: tour.price_from,
            priceCurrency: tour.currency,
            url: tour.booking_url ?? url,
            availability: "https://schema.org/InStock",
          }
        : undefined,
  }));

  const breadcrumb = {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Lagi", item: "https://discover.vakaviti.ai" },
      { "@type": "ListItem", position: 2, name: destination.name, item: url },
    ],
  };

  return {
    "@context": "https://schema.org",
    "@graph": [touristDestination, breadcrumb, ...products],
  };
}

export default async function DestinationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const destination = await getDestination(slug);
  if (!destination) notFound();

  const tours = await getTours(destination.id);
  const paragraphs = (destination.body_md ?? "")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  const schema = buildSchema(destination, tours);

  return (
    <main className="bg-depth text-cream">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <div className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
        <Link
          href="/"
          className="font-mono text-xs uppercase tracking-[0.2em] text-paper/50 transition hover:text-reef-light"
        >
          ← Lagi by Vakaviti.ai
        </Link>

        <p className="mt-8 font-mono text-xs uppercase tracking-[0.25em] text-reef-light">
          {destination.region}
        </p>

        <h1 className="mt-3 font-display text-4xl leading-[1.05] tracking-tight text-cream sm:text-5xl">
          {destination.name}
        </h1>

        {destination.summary && (
          <p className="mt-6 text-lg text-paper/90">{destination.summary}</p>
        )}

        <div className="my-12">
          <ContourRule />
        </div>

        <article className="space-y-5 text-paper/85">
          {paragraphs.map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </article>

        {tours.length > 0 && (
          <>
            <div className="my-12">
              <ContourRule />
            </div>

            <h2 className="font-display text-2xl text-cream">
              Tours in {destination.name}
            </h2>

            <div className="mt-6 space-y-4">
              {tours.map((tour) => (
                <div
                  key={tour.id}
                  className="rounded-lg border border-paper/15 bg-depth-light/40 p-6"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h3 className="font-display text-lg text-cream">
                        {tour.name}
                      </h3>
                      {tour.description && (
                        <p className="mt-2 max-w-xl text-sm text-paper/75">
                          {tour.description}
                        </p>
                      )}
                    </div>

                    {/* Price/duration as chart "soundings" — same monospace
                        depth-marker device as the homepage backdrop */}
                    <div className="flex shrink-0 gap-4 font-mono text-xs text-paper/50">
                      {tour.price_from != null && (
                        <span>
                          from{" "}
                          <span className="text-coral">
                            {tour.currency}${tour.price_from}
                          </span>
                        </span>
                      )}
                      {formatDuration(tour.duration_minutes) && (
                        <span>{formatDuration(tour.duration_minutes)}</span>
                      )}
                    </div>
                  </div>

                  {tour.booking_url && (
                    <a
                      href={tour.booking_url}
                      className="mt-4 inline-block rounded-md bg-coral px-5 py-2.5 font-display text-sm font-medium text-cream transition hover:bg-coral-light"
                    >
                      Book this tour
                    </a>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        <div className="my-12">
          <ContourRule />
        </div>

        <div className="rounded-lg border border-reef-light/30 bg-reef/5 p-6 text-center">
          <p className="text-paper/90">
            Want this built into a full itinerary around your dates?
          </p>
          <Link
            href="/#planner"
            className="mt-4 inline-block rounded-md border border-reef-light/40 px-6 py-3 font-display text-sm font-medium text-reef-light transition hover:border-reef-light hover:bg-reef/10"
          >
            Plan it with the AI guide
          </Link>
        </div>
      </div>

      <footer className="border-t border-paper/10 px-6 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 font-mono text-xs text-paper/50 sm:flex-row">
          <span>Lagi — Fiji&apos;s AI travel guide</span>
          <span>Powered by Vakaviti.ai</span>
        </div>
      </footer>
    </main>
  );
}
