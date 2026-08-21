import { supabase } from "./supabase";

// Sitemap generation reads ~109k rows across five tables. PostgREST caps a
// response at 1,000 rows, so each segment is assembled from parallel page
// requests rather than a long sequential walk — that keeps a single segment
// well inside a serverless request budget.

const PAGE_SIZE = 1000;
const CONCURRENCY = 10;

// Google's hard limit is 50,000 URLs per sitemap file. Staying under it with
// room to spare keeps each file small enough to fetch quickly.
export const SEGMENT_SIZE = 40000;

export interface SitemapEntity {
  /** Segment name prefix used in the child sitemap URL. */
  key: string;
  table: string;
  /** Extra column needed to build the path, beyond `slug`. */
  extraColumn?: string;
  /** Column the rows are ordered by, for stable paging. */
  orderBy: string;
  /** Slugs to keep out of the sitemap (placeholder rows with no real page). */
  excludeSlugs?: string[];
  toPath: (row: Record<string, string>) => string;
}

export const SITEMAP_ENTITIES: SitemapEntity[] = [
  {
    key: "associations",
    table: "associations",
    extraColumn: "county_slug",
    orderBy: "slug",
    toPath: (r) => `/associations/${r.county_slug}/${r.slug}`,
  },
  { key: "firms", table: "firms", orderBy: "slug", toPath: (r) => `/managers/firms/${r.slug}` },
  { key: "cams", table: "cam_licensees", orderBy: "slug", toPath: (r) => `/managers/cam/${r.slug}` },
  { key: "developers", table: "developers", orderBy: "slug", toPath: (r) => `/developers/${r.slug}` },
  {
    key: "counties",
    table: "counties",
    orderBy: "slug",
    // Same placeholder rows getCounties() hides from the UI — they have no real
    // county behind them, so they must not be submitted for indexing.
    excludeSlugs: ["unknown", "1"],
    toPath: (r) => `/counties/${r.slug}`,
  },
  {
    key: "cities",
    table: "cities",
    extraColumn: "county_slug",
    orderBy: "slug",
    toPath: (r) => `/associations/${r.county_slug}/city/${r.slug}`,
  },
];

export function findEntity(key: string): SitemapEntity | undefined {
  return SITEMAP_ENTITIES.find((e) => e.key === key);
}

async function countRows(table: string): Promise<number> {
  const { count } = await supabase.from(table).select("slug", { count: "exact", head: true });
  return count ?? 0;
}

/** How many child sitemaps each entity needs at the current row counts. */
export async function segmentCounts(): Promise<{ key: string; segments: number }[]> {
  const counts = await Promise.all(
    SITEMAP_ENTITIES.map(async (e) => ({
      key: e.key,
      segments: Math.max(1, Math.ceil((await countRows(e.table)) / SEGMENT_SIZE)),
    }))
  );
  return counts;
}

/** Fetch one segment's rows, paging concurrently within the segment window. */
export async function fetchSegmentRows(
  entity: SitemapEntity,
  segment: number
): Promise<Record<string, string>[]> {
  const columns = entity.extraColumn ? `slug,${entity.extraColumn}` : "slug";
  const start = segment * SEGMENT_SIZE;
  const pageCount = Math.ceil(SEGMENT_SIZE / PAGE_SIZE);
  const rows: Record<string, string>[] = [];

  for (let batchStart = 0; batchStart < pageCount; batchStart += CONCURRENCY) {
    const batch = Array.from(
      { length: Math.min(CONCURRENCY, pageCount - batchStart) },
      (_, i) => batchStart + i
    );
    const results = await Promise.all(
      batch.map(async (pageIndex) => {
        const from = start + pageIndex * PAGE_SIZE;
        const { data } = await supabase
          .from(entity.table)
          .select(columns)
          .order(entity.orderBy)
          .range(from, from + PAGE_SIZE - 1);
        return (data ?? []) as unknown as Record<string, string>[];
      })
    );
    let exhausted = false;
    for (const page of results) {
      rows.push(...page);
      if (page.length < PAGE_SIZE) exhausted = true;
    }
    if (exhausted) break;
  }
  if (entity.excludeSlugs?.length) {
    const drop = new Set(entity.excludeSlugs);
    return rows.filter((r) => !drop.has(r.slug));
  }
  return rows;
}

// Hub and utility pages that are worth indexing. /corrections and /claim are
// deliberately absent — they are noindex utility pages.
export const STATIC_PATHS: { path: string; priority: number }[] = [
  { path: "/", priority: 1.0 },
  { path: "/buyers", priority: 0.8 },
  { path: "/preconstruction", priority: 0.8 },
  { path: "/sellers", priority: 0.8 },
  { path: "/foreign-buyers", priority: 0.8 },
  { path: "/for-boards", priority: 0.8 },
  { path: "/associations", priority: 0.7 },
  { path: "/managers/firms", priority: 0.7 },
  { path: "/managers/cam", priority: 0.7 },
  { path: "/developers", priority: 0.7 },
  { path: "/counties", priority: 0.7 },
  { path: "/resources", priority: 0.7 },
  { path: "/verify", priority: 0.7 },
];
