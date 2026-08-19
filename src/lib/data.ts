import seed from "@/data/seed.json";
import type { Association, Firm, CamLicensee, Developer, County, SearchResult } from "./types";
import { decodeFirmStatus } from "./status";

// In production this layer is backed by Supabase queries over the full
// 109k-record dataset. For the scaffold it reads a real-record seed sample
// so every template renders against authentic DBPR data.

const data = seed as unknown as {
  associations: Association[];
  firms: Firm[];
  cams: CamLicensee[];
  developers: Developer[];
  counties: County[];
};

export function getAssociations(): Association[] {
  return data.associations;
}
export function getAssociation(county: string, slug: string): Association | undefined {
  return data.associations.find(
    (a) => a.county.toLowerCase() === county.toLowerCase() && a.slug === slug
  );
}
export function getAssociationsByCity(countySlug: string, citySlug: string): Association[] {
  return data.associations.filter(
    (a) => slug(a.county) === countySlug && a.citySlug === citySlug
  );
}

export function getFirms(): Firm[] {
  return data.firms.map((f) => ({ ...f, statusPlain: decodeFirmStatus(f.statusCode) }));
}
export function getFirm(slug: string): Firm | undefined {
  const f = data.firms.find((x) => x.slug === slug);
  return f ? { ...f, statusPlain: decodeFirmStatus(f.statusCode) } : undefined;
}

export function getCams(): CamLicensee[] {
  return data.cams;
}
export function getCam(slug: string): CamLicensee | undefined {
  return data.cams.find((c) => c.slug === slug);
}

export function getDevelopers(): Developer[] {
  return data.developers;
}
export function getDeveloper(slug: string): Developer | undefined {
  return data.developers.find((d) => d.slug === slug);
}

export function getCounties(): County[] {
  return data.counties;
}
export function getCounty(slug: string): County | undefined {
  return data.counties.find((c) => c.slug === slug);
}

export function slug(s: string): string {
  return s
    .toLowerCase()
    .replace(/[',.]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// Registry-wide totals (the real statewide counts, shown on the homepage).
export const TOTALS = {
  associations: 37159,
  firms: 32599,
  cams: 23293,
  developers: 15766,
  counties: 67,
  firmsAndCams: 55892,
};

export function search(q: string): SearchResult[] {
  const term = q.trim().toLowerCase();
  if (!term) return [];
  const results: SearchResult[] = [];

  for (const a of data.associations) {
    if (a.name.toLowerCase().includes(term)) {
      results.push({
        kind: "association", slug: a.slug, name: a.name, county: a.county,
        detail: `${a.city}, FL · ${a.sourceType}`,
        href: `/associations/${slug(a.county)}/${a.slug}`,
      });
    }
  }
  for (const f of data.firms) {
    if (f.name.toLowerCase().includes(term)) {
      results.push({
        kind: "firm", slug: f.slug, name: f.name, county: f.county,
        detail: `${f.licenseNumber} · ${decodeFirmStatus(f.statusCode)}`,
        href: `/managers/firms/${f.slug}`,
      });
    }
  }
  for (const c of data.cams) {
    if (c.name.toLowerCase().includes(term)) {
      results.push({
        kind: "cam", slug: c.slug, name: c.name, county: c.county,
        detail: `${c.licenseNumber} · CAM`,
        href: `/managers/cam/${c.slug}`,
      });
    }
  }
  for (const d of data.developers) {
    if (d.name.toLowerCase().includes(term)) {
      results.push({
        kind: "developer", slug: d.slug, name: d.name, county: d.county ?? "",
        detail: `${d.projectsFiled} projects filed`,
        href: `/developers/${d.slug}`,
      });
    }
  }
  return results.slice(0, 20);
}
