// Canonical origin for absolute URLs (canonicals, sitemaps, JSON-LD, OpenGraph).
export const SITE_URL = "https://flhoaregistry.com";
export const SITE_NAME = "Florida HOA Registry";

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
