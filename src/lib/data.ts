import { supabase } from "./supabase";
import type {
  Association,
  AssociationStatus,
  SecondaryStatus,
  Firm,
  FirmStatusCode,
  CamLicensee,
  Developer,
  County,
  SearchResult,
  ComplianceRecord,
  RecertCase,
  RegistryRecord,
  GovContact,
  CorrectionSubmission,
} from "./types";
import { decodeFirmStatus } from "./status";

// Supabase-backed data layer over the full DBPR dataset
// (37,159 associations · 32,599 firms · 23,293 CAMs · 15,764 developers).
// Every function maps snake_case DB columns onto the camelCase types in ./types.

const ASSOC_COLS =
  "slug,project_number,file_number,name,county,county_slug,city,city_slug,street,state,zip,units,recorded_date,primary_status,secondary_status,source_type,mgmt_number,mgmt_name,mgmt_city,mgmt_state,firm_slug,developer_slug";

// PostgREST caps a single response at 1,000 rows, so anything larger is fetched
// in pages. Used by the generateStaticParams queries.
const PAGE_SIZE = 1000;

async function fetchPaged(
  table: string,
  columns: string,
  limit: number,
  orderBy: string,
  ascending = true
): Promise<any[]> {
  const rows: any[] = [];
  while (rows.length < limit) {
    const from = rows.length;
    const to = Math.min(from + PAGE_SIZE, limit) - 1;
    const { data } = await supabase
      .from(table)
      .select(columns)
      .order(orderBy, { ascending })
      // Tiebreaker so paging stays stable across requests when the primary
      // sort key has duplicates (e.g. many developers with 1 project filed).
      .order("slug")
      .range(from, to);
    if (!data || data.length === 0) break;
    rows.push(...data);
    if (data.length < to - from + 1) break;
  }
  return rows;
}

function mapAssociation(r: any): Association {
  return {
    slug: r.slug,
    projectNumber: r.project_number ?? "",
    fileNumber: r.file_number ?? "",
    name: r.name ?? "",
    county: r.county ?? "",
    city: r.city ?? "",
    citySlug: r.city_slug ?? "",
    street: r.street ?? "",
    state: r.state ?? "FL",
    zip: r.zip ?? "",
    units: r.units ?? null,
    recordedDate: r.recorded_date ?? "",
    primaryStatus: (r.primary_status ?? "Approved") as AssociationStatus,
    secondaryStatus: (r.secondary_status ?? null) as SecondaryStatus,
    sourceType: r.source_type ?? "",
    managingEntity: r.mgmt_name
      ? {
          number: r.mgmt_number ?? null,
          name: r.mgmt_name,
          city: r.mgmt_city ?? null,
          state: r.mgmt_state ?? null,
          firmSlug: r.firm_slug ?? null,
        }
      : null,
    developerSlug: r.developer_slug ?? null,
  };
}

function mapFirm(r: any, managedAssociations: Firm["managedAssociations"] = []): Firm {
  const statusCode = (r.status_code ?? "") as FirmStatusCode;
  return {
    slug: r.slug,
    licenseNumber: r.license_number ?? "",
    name: r.name ?? "",
    street: r.street ?? "",
    city: r.city ?? "",
    county: r.county ?? "",
    state: r.state ?? "FL",
    zip: r.zip ?? "",
    licenseType: r.license_type ?? "CAB",
    statusCode,
    statusPlain: r.status_plain || decodeFirmStatus(statusCode),
    originalDate: r.original_date ?? "",
    expirationDate: r.expiration_date ?? "",
    managedAssociations,
  };
}

function mapCam(r: any): CamLicensee {
  return {
    slug: r.slug,
    licenseNumber: r.license_number ?? "",
    name: r.name ?? "",
    city: r.city ?? "",
    county: r.county ?? "",
    expirationDate: r.expiration_date ?? "",
    ceCredits: r.ce_credits ?? null,
    ceCourses: r.ce_courses ?? null,
    firmSlug: r.firm_slug ?? null,
  };
}

function mapDeveloper(r: any, projects: Developer["projects"] = []): Developer {
  return {
    slug: r.slug,
    name: r.name ?? "",
    city: r.city ?? null,
    county: r.county ?? null,
    projectsFiled: r.projects_filed ?? 0,
    countiesCount: r.counties_count ?? 0,
    primaryType: r.primary_type ?? "",
    filingRange: r.filing_range ?? "",
    projects,
  };
}

function mapCounty(r: any, cities: County["cities"] = []): County {
  return {
    slug: r.slug,
    name: r.name ?? "",
    associationCount: r.association_count ?? 0,
    firmCount: r.firm_count ?? 0,
    developerCount: r.developer_count ?? 0,
    cities,
  };
}

/* ---------------------------------------------------------------- associations */

export async function getAssociation(
  countySlug: string,
  slug: string
): Promise<Association | undefined> {
  const { data } = await supabase
    .from("associations")
    .select(ASSOC_COLS)
    .eq("county_slug", countySlug)
    .eq("slug", slug)
    .maybeSingle();
  return data ? mapAssociation(data) : undefined;
}

export async function getAssociationsByCity(
  countySlug: string,
  citySlug: string
): Promise<Association[]> {
  const { data } = await supabase
    .from("associations")
    .select(ASSOC_COLS)
    .eq("county_slug", countySlug)
    .eq("city_slug", citySlug)
    .order("name")
    .limit(500);
  return (data ?? []).map(mapAssociation);
}

// The registry-wide count for a city. getAssociationsByCity caps its result at
// 500 rows, so this is the number to quote rather than the returned list length.
export async function getCityAssociationCount(
  countySlug: string,
  citySlug: string
): Promise<number | null> {
  const { data } = await supabase
    .from("cities")
    .select("association_count")
    .eq("county_slug", countySlug)
    .eq("slug", citySlug)
    .maybeSingle();
  return data?.association_count ?? null;
}

export async function getAssociationsSample(limit = 60): Promise<Association[]> {
  const { data } = await supabase
    .from("associations")
    .select(ASSOC_COLS)
    .order("name")
    .limit(limit);
  return (data ?? []).map(mapAssociation);
}

export async function getAssociationParams(
  limit = 1500
): Promise<{ county: string; slug: string }[]> {
  const rows = await fetchPaged("associations", "county_slug,slug", limit, "name");
  return rows.map((r) => ({ county: r.county_slug, slug: r.slug }));
}

/* ----------------------------------------------------------------------- firms */

export async function getFirm(slug: string): Promise<Firm | undefined> {
  const [{ data: firm }, { data: managed }] = await Promise.all([
    supabase.from("firms").select("*").eq("slug", slug).maybeSingle(),
    supabase
      .from("associations")
      .select("slug,name,county,units,primary_status")
      .eq("firm_slug", slug)
      .order("name")
      .limit(50),
  ]);
  if (!firm) return undefined;
  return mapFirm(
    firm,
    (managed ?? []).map((m: any) => ({
      slug: m.slug,
      name: m.name ?? "",
      county: m.county ?? "",
      units: m.units ?? null,
      status: (m.primary_status ?? "Approved") as AssociationStatus,
    }))
  );
}

export async function getFirmsSample(limit = 60): Promise<Firm[]> {
  const { data } = await supabase.from("firms").select("*").order("name").limit(limit);
  return (data ?? []).map((r) => mapFirm(r));
}

export async function getFirmParams(limit = 1500): Promise<{ slug: string }[]> {
  const rows = await fetchPaged("firms", "slug", limit, "name");
  return rows.map((r) => ({ slug: r.slug }));
}

/* ------------------------------------------------------------------------ cams */

export async function getCam(slug: string): Promise<CamLicensee | undefined> {
  const { data } = await supabase.from("cam_licensees").select("*").eq("slug", slug).maybeSingle();
  return data ? mapCam(data) : undefined;
}

export async function getCamsSample(limit = 60): Promise<CamLicensee[]> {
  const { data } = await supabase.from("cam_licensees").select("*").order("name").limit(limit);
  return (data ?? []).map(mapCam);
}

export async function getCamParams(limit = 1500): Promise<{ slug: string }[]> {
  const rows = await fetchPaged("cam_licensees", "slug", limit, "name");
  return rows.map((r) => ({ slug: r.slug }));
}

/* ------------------------------------------------------------------ developers */

export async function getDeveloper(slug: string): Promise<Developer | undefined> {
  const [{ data: dev }, { data: projects }] = await Promise.all([
    supabase.from("developers").select("*").eq("slug", slug).maybeSingle(),
    supabase
      .from("dev_projects")
      .select("project_name,project_slug,county,project_number")
      .eq("developer_slug", slug)
      .limit(200),
  ]);
  if (!dev) return undefined;
  return mapDeveloper(
    dev,
    (projects ?? []).map((p: any) => ({
      name: p.project_name ?? "",
      slug: p.project_slug ?? null,
      county: p.county ?? "",
      projectNumber: p.project_number ?? "",
    }))
  );
}

export async function getDevelopersSample(limit = 60): Promise<Developer[]> {
  const { data } = await supabase
    .from("developers")
    .select("*")
    .order("projects_filed", { ascending: false })
    .limit(limit);
  return (data ?? []).map((r) => mapDeveloper(r));
}

export async function getDeveloperParams(limit = 1500): Promise<{ slug: string }[]> {
  const rows = await fetchPaged("developers", "slug", limit, "projects_filed", false);
  return rows.map((r) => ({ slug: r.slug }));
}

/* -------------------------------------------------------------------- counties */

// Rows in `counties` that are not real counties: the "unknown" placeholder and a
// stray aggregate row keyed "1" left behind by the import.
const NON_COUNTY_SLUGS = ["unknown", "1"];

export async function getCounties(): Promise<County[]> {
  const { data } = await supabase
    .from("counties")
    .select("*")
    .not("slug", "in", `(${NON_COUNTY_SLUGS.join(",")})`)
    .order("association_count", { ascending: false });
  return (data ?? []).map((r) => mapCounty(r));
}

export async function getCounty(slug: string): Promise<County | undefined> {
  const [{ data: county }, { data: cities }] = await Promise.all([
    supabase.from("counties").select("*").eq("slug", slug).maybeSingle(),
    supabase
      .from("cities")
      .select("slug,name,association_count")
      .eq("county_slug", slug)
      .order("association_count", { ascending: false })
      .limit(200),
  ]);
  if (!county) return undefined;
  return mapCounty(
    county,
    (cities ?? []).map((c: any) => ({
      name: c.name ?? "",
      slug: c.slug,
      associationCount: c.association_count ?? 0,
    }))
  );
}

/* ---------------------------------------------------------------------- search */

export async function search(q: string): Promise<SearchResult[]> {
  const term = q.trim();
  if (!term) return [];
  // Escape PostgREST pattern wildcards so a literal % or _ cannot widen the match.
  const pattern = `%${term.replace(/[%_]/g, (m) => `\\${m}`)}%`;

  const [assocs, firms, cams, devs] = await Promise.all([
    supabase
      .from("associations")
      .select("slug,name,county,county_slug,city,source_type")
      .ilike("name", pattern)
      .limit(8),
    supabase
      .from("firms")
      .select("slug,name,county,license_number,status_code,status_plain")
      .ilike("name", pattern)
      .limit(6),
    supabase
      .from("cam_licensees")
      .select("slug,name,county,license_number")
      .ilike("name", pattern)
      .limit(4),
    supabase
      .from("developers")
      .select("slug,name,county,projects_filed")
      .ilike("name", pattern)
      .limit(4),
  ]);

  const results: SearchResult[] = [];

  for (const a of (assocs.data ?? []) as any[]) {
    results.push({
      kind: "association",
      slug: a.slug,
      name: a.name,
      county: a.county ?? "",
      detail: `${a.city ?? ""}, FL · ${a.source_type ?? ""}`,
      href: `/associations/${a.county_slug}/${a.slug}`,
    });
  }
  for (const f of (firms.data ?? []) as any[]) {
    results.push({
      kind: "firm",
      slug: f.slug,
      name: f.name,
      county: f.county ?? "",
      detail: `${f.license_number ?? ""} · ${f.status_plain || decodeFirmStatus(f.status_code ?? "")}`,
      href: `/managers/firms/${f.slug}`,
    });
  }
  for (const c of (cams.data ?? []) as any[]) {
    results.push({
      kind: "cam",
      slug: c.slug,
      name: c.name,
      county: c.county ?? "",
      detail: `${c.license_number ?? ""} · CAM`,
      href: `/managers/cam/${c.slug}`,
    });
  }
  for (const d of (devs.data ?? []) as any[]) {
    results.push({
      kind: "developer",
      slug: d.slug,
      name: d.name,
      county: d.county ?? "",
      detail: `${d.projects_filed ?? 0} projects filed`,
      href: `/developers/${d.slug}`,
    });
  }

  return results;
}

/* ------------------------------------------------- compliance & inspections */

// Escape the PostgREST pattern metacharacters so a name containing % or _ cannot
// widen the match.
function likeLiteral(v: string): string {
  return v.replace(/[%_\\]/g, (m) => `\\${m}`);
}

// Match key for an association name: the leading 40 characters, which is enough
// to identify a community without requiring the suffixes ("Condo", ", Inc.")
// to agree between two separately-maintained state datasets.
function namePrefix(name: string): string | null {
  const trimmed = name.trim();
  // Too short to match on safely — a 3-character prefix would match hundreds.
  if (trimmed.length < 5) return null;
  return likeLiteral(trimmed.slice(0, 40));
}

// Of several prefix matches, prefer an exact (case-insensitive) name match, then
// the shortest name — the closest thing to the association we started from.
function bestNameMatch<T extends { association_name?: string | null }>(
  rows: T[],
  name: string
): T | undefined {
  if (rows.length === 0) return undefined;
  const target = name.trim().toLowerCase();
  const exact = rows.find((r) => (r.association_name ?? "").trim().toLowerCase() === target);
  if (exact) return exact;
  return [...rows].sort(
    (a, b) => (a.association_name ?? "").length - (b.association_name ?? "").length
  )[0];
}

// Milestone / structural-integrity compliance filing facts. Filed-status and
// deadline only — this source carries no reserve or financial data by design.
export async function getComplianceForAssociation(
  name: string
): Promise<ComplianceRecord | undefined> {
  const prefix = namePrefix(name);
  if (!prefix) return undefined;
  const { data } = await supabase
    .from("compliance_full")
    .select("association_name,compliance_status,next_deadline,units,manager")
    .ilike("association_name", `${prefix}%`)
    .limit(5);
  const row = bestNameMatch(data ?? [], name);
  if (!row) return undefined;
  return {
    associationName: row.association_name ?? "",
    status: row.compliance_status ?? "",
    nextDeadline: row.next_deadline ?? "",
    units: row.units ?? null,
    manager: row.manager ?? null,
  };
}

// Normalize an association street for address matching: drop unit/building
// suffixes so "1234 Main St #101" and "1234 Main St" line up.
function normalizeStreet(street: string): string | null {
  const cleaned = street
    .replace(/\s*(#|apt\.?|unit|ste\.?|suite|bldg\.?|building)\s*[\w-]*$/i, "")
    .replace(/\s+/g, " ")
    .trim();
  // A bare street name with no number matches far too broadly to be useful.
  if (cleaned.length < 6 || !/\d/.test(cleaned)) return null;
  return likeLiteral(cleaned);
}

// Recertification / milestone inspection cases filed against the property.
export async function getRecertsForAddress(street: string): Promise<RecertCase[]> {
  const addr = normalizeStreet(street ?? "");
  if (!addr) return [];
  const { data } = await supabase
    .from("recerts_full")
    .select("case_number,recert_year,case_status,enforcement_status")
    .ilike("property_address", `${addr}%`)
    .order("recert_year", { ascending: false })
    .limit(5);
  return (data ?? []).map((r: any) => ({
    caseNumber: r.case_number ?? "",
    recertYear: r.recert_year ?? "",
    caseStatus: r.case_status ?? "",
    enforcementStatus: r.enforcement_status ?? "",
  }));
}

// Miami-Dade condominium registry: registration + enforcement status.
export async function getRegistryForAssociation(
  name: string
): Promise<RegistryRecord | undefined> {
  const prefix = namePrefix(name);
  if (!prefix) return undefined;
  const { data } = await supabase
    .from("condo_registry")
    .select(
      "registration_number,association_name,association_type,registration_status,enforcement_status,registration_date"
    )
    .ilike("association_name", `${prefix}%`)
    .limit(5);
  const row = bestNameMatch(data ?? [], name);
  if (!row) return undefined;
  return {
    registrationNumber: row.registration_number ?? "",
    associationName: row.association_name ?? "",
    associationType: row.association_type ?? "",
    registrationStatus: row.registration_status ?? "",
    enforcementStatus: row.enforcement_status ?? "",
    registrationDate: row.registration_date ?? "",
  };
}

/* ------------------------------------------------------ agencies & contacts */

export async function getGovContacts(limit = 100): Promise<GovContact[]> {
  const { data } = await supabase
    .from("gov_contacts_full")
    .select("col1,col2,col3,col4,col5")
    .order("id")
    .limit(limit);
  return (data ?? []).map((r: any) => ({
    office: r.col1 ?? "",
    contact: r.col2 ?? "",
    location: r.col3 ?? "",
    phone: r.col4 ?? "",
    email: r.col5 ?? "",
  }));
}

/* -------------------------------------------------------- correction requests */

// Insert-only for the anon role: submissions can be written but never read back,
// so one visitor can never see another visitor's report.
export async function submitCorrection(sub: CorrectionSubmission): Promise<void> {
  const { error } = await supabase.from("correction_requests").insert({
    entity_type: sub.entityType,
    entity_slug: sub.entitySlug,
    entity_name: sub.entityName,
    page_url: sub.pageUrl,
    message: sub.message,
    submitter_email: sub.submitterEmail,
  });
  if (error) throw new Error(error.message);
}

/* --------------------------------------------------------------------- helpers */

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
