import { absoluteUrl } from "@/lib/site";
import { fetchSegmentRows, findEntity, STATIC_PATHS } from "@/lib/sitemap-data";

export const revalidate = 86400;
export const dynamicParams = true;

interface UrlEntry {
  loc: string;
  priority: number;
  changefreq: string;
}

function renderUrlset(entries: UrlEntry[], lastmod: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map(
    (e) =>
      `  <url>\n    <loc>${e.loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${e.changefreq}</changefreq>\n    <priority>${e.priority.toFixed(1)}</priority>\n  </url>`
  )
  .join("\n")}
</urlset>`;
}

function xml(body: string): Response {
  return new Response(body, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=0, s-maxage=86400, stale-while-revalidate",
    },
  });
}

// Hubs (counties, cities) rank for local queries and change as counts move, so
// they carry slightly higher priority than individual record pages.
const HUB_KEYS = new Set(["counties", "cities"]);

export async function GET(_req: Request, { params }: { params: { segment: string } }) {
  const name = params.segment.replace(/\.xml$/, "");
  const lastmod = new Date().toISOString();

  if (name === "static") {
    return xml(
      renderUrlset(
        STATIC_PATHS.map((s) => ({
          loc: absoluteUrl(s.path),
          priority: s.priority,
          changefreq: s.path === "/" ? "daily" : "weekly",
        })),
        lastmod
      )
    );
  }

  const match = name.match(/^(.*)-(\d+)$/);
  if (!match) return new Response("Not found", { status: 404 });

  const entity = findEntity(match[1]);
  if (!entity) return new Response("Not found", { status: 404 });

  const rows = await fetchSegmentRows(entity, Number(match[2]));
  if (rows.length === 0) return new Response("Not found", { status: 404 });

  const isHub = HUB_KEYS.has(entity.key);
  return xml(
    renderUrlset(
      rows.map((r) => ({
        loc: absoluteUrl(entity.toPath(r)),
        priority: isHub ? 0.7 : 0.6,
        changefreq: "weekly",
      })),
      lastmod
    )
  );
}
