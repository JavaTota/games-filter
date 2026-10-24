/** Small deployment smoke test: verify the SPA and RAWG proxy both answer successfully. */
const baseUrl = process.argv[2]?.replace(/\/$/, "");

if (!baseUrl) {
  console.error("Usage: node scripts/smoke-test.mjs <deployment-url>");
  process.exit(1);
}

async function check(path, expectedContentType) {
  const response = await fetch(`${baseUrl}${path}`);
  const contentType = response.headers.get("content-type") ?? "";

  if (!response.ok) {
    throw new Error(`${path} returned HTTP ${response.status}.`);
  }

  if (!contentType.includes(expectedContentType)) {
    throw new Error(`${path} returned unexpected content type: ${contentType}`);
  }

  console.log(`✓ ${path} (${response.status})`);
}

await check("/", "text/html");
await check("/api/rawg?path=/genres&page_size=1", "application/json");
