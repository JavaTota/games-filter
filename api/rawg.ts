interface RequestLike {
  method?: string;
  url?: string;
  headers: Record<string, string | string[] | undefined>;
}

interface ResponseLike {
  status: (code: number) => ResponseLike;
  json: (body: unknown) => unknown;
  send: (body: string) => unknown;
  setHeader: (name: string, value: string) => void;
}

/** Vercel serverless proxy keeps RAWG_API_KEY on the server and adds short CDN caching. */
export default async function handler(request: RequestLike, response: ResponseLike) {
  if (request.method !== "GET") return response.status(405).json({ error: "Method not allowed." });
  const runtime = globalThis as typeof globalThis & { process?: { env?: Record<string, string | undefined> } };
  const apiKey = runtime.process?.env?.RAWG_API_KEY;
  if (!apiKey) return response.status(500).json({ error: "RAWG_API_KEY is not configured." });

  const host = Array.isArray(request.headers.host) ? request.headers.host[0] : request.headers.host;
  const requestUrl = new URL(request.url ?? "/api/rawg", `https://${host ?? "localhost"}`);
  const path = requestUrl.searchParams.get("path") ?? "/games";
  if (!/^\/(games|genres|platforms)(\/[^?]*)?$/.test(path)) return response.status(400).json({ error: "Unsupported RAWG path." });

  const target = new URL(`https://api.rawg.io/api${path}`);
  target.searchParams.set("key", apiKey);
  requestUrl.searchParams.forEach((value, key) => { if (key !== "path") target.searchParams.append(key, value); });

  try {
    const upstream = await fetch(target, { headers: { Accept: "application/json" } });
    const body = await upstream.text();
    response.setHeader("Content-Type", upstream.headers.get("content-type") ?? "application/json");
    response.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=900");
    return response.status(upstream.status).send(body);
  } catch {
    return response.status(502).json({ error: "The game provider is temporarily unavailable." });
  }
}
