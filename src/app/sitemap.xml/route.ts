import { absoluteUrl } from "@/lib/site";
import { segmentCounts } from "@/lib/sitemap-data";

export const revalidate = 86400;

// Sitemap index. Child sitemaps live at /sitemaps/<entity>-<n>.xml so each file
// stays well under Google's 50,000-URL limit.
export async function GET() {
  const lastmod = new Date().toISOString();
  const counts = await segmentCounts();

  const children = ["static", ...counts.flatMap(({ key, segments }) =>
    Array.from({ length: segments }, (_, i) => `${key}-${i}`)
  )];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${children
  .map(
    (name) =>
      `  <sitemap>\n    <loc>${absoluteUrl(`/sitemaps/${name}.xml`)}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </sitemap>`
  )
  .join("\n")}
</sitemapindex>`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=0, s-maxage=86400, stale-while-revalidate",
    },
  });
}
