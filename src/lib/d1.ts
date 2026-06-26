/**
 * Server-only Cloudflare D1 REST API client.
 *
 * Vercel's serverless functions can't use D1's native Worker bindings —
 * those only work inside Cloudflare Workers/Pages. This calls D1's REST
 * API instead, the same way the Lagi chat proxy (route.ts) calls the
 * fiji-chat-widget Worker over plain fetch().
 *
 * NEVER import this in a "use client" component — CLOUDFLARE_D1_API_TOKEN
 * must never reach the browser. Always call this from a Server Component,
 * Route Handler, or Server Action.
 */

type D1QueryResult<T = Record<string, unknown>> = {
  results: T[];
  success: boolean;
  meta: {
    duration: number;
    rows_read: number;
    rows_written: number;
  };
};

type D1ApiResponse<T> = {
  result: D1QueryResult<T>[];
  success: boolean;
  errors: { code: number; message: string }[];
};

/**
 * Run a single SQL statement against the discoverfiji-content D1 database.
 * Always use `?` placeholders + `params` — never interpolate values into
 * the SQL string directly.
 *
 * @example
 *   const rows = await d1Query<{ id: string; name: string }>(
 *     "SELECT id, name FROM destinations WHERE published = 1 LIMIT ?",
 *     [10]
 *   );
 */
export async function d1Query<T = Record<string, unknown>>(
  sql: string,
  params: (string | number | null)[] = []
): Promise<T[]> {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const databaseId = process.env.CLOUDFLARE_D1_DATABASE_ID;
  const apiToken = process.env.CLOUDFLARE_D1_API_TOKEN;

  if (!accountId || !databaseId || !apiToken) {
    throw new Error(
      "D1 env vars missing — set CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_D1_DATABASE_ID, " +
        "and CLOUDFLARE_D1_API_TOKEN in Vercel project settings."
    );
  }

  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sql, params }),
    }
  );

  const data: D1ApiResponse<T> = await res.json();

  if (!res.ok || !data.success) {
    const message = data.errors?.[0]?.message ?? `D1 query failed (HTTP ${res.status})`;
    throw new Error(message);
  }

  return data.result[0]?.results ?? [];
}
