import type { MetadataRoute } from "next";

// AI crawler allow-list matches the rest of the Vakaviti.ai platform
// (fijitourtransfers.com, GEO microsites) -- consistency matters here since
// these are the actual crawlers that matter for AI citation today.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "GPTBot", allow: "/" },
      { userAgent: "ClaudeBot", allow: "/" },
      { userAgent: "Claude-SearchBot", allow: "/" },
      { userAgent: "PerplexityBot", allow: "/" },
      { userAgent: "Bingbot", allow: "/" },
      { userAgent: "Google-Extended", allow: "/" },
      { userAgent: "FacebookBot", allow: "/" },
      { userAgent: "meta-externalagent", allow: "/" },
      { userAgent: "Applebot", allow: "/" },
      { userAgent: "*", allow: "/" },
    ],
    sitemap: "https://discover.vakaviti.ai/sitemap.xml",
  };
}
