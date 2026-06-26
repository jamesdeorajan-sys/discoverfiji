import type { MetadataRoute } from "next";
import { d1Query } from "@/lib/d1";

// Dynamic by design: as the 500-page build grows, every published row in
// D1 shows up here automatically -- no per-page sitemap maintenance needed.
export const revalidate = 3600;

type DestinationRow = { slug: string; updated_at: string };

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://discover.vakaviti.ai";
  const staticEntries: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
  ];

  let destinationEntries: MetadataRoute.Sitemap = [];
  try {
    const destinations = await d1Query<DestinationRow>(
      "SELECT slug, updated_at FROM destinations WHERE published = 1"
    );
    destinationEntries = destinations.map((d) => ({
      url: `${base}/destinations/${d.slug}`,
      lastModified: d.updated_at,
      changeFrequency: "weekly",
      priority: 0.8,
    }));
  } catch {
    // D1 hiccup shouldn't take down the whole sitemap -- ship what we have.
  }

  return [...staticEntries, ...destinationEntries];
}
