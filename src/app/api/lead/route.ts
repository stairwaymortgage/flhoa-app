import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { FLOWS } from "@/lib/inquiryFlows";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GHL credentials are read only here, on the server. They must never carry a
// NEXT_PUBLIC_ prefix or be referenced from a client component.
const GHL_API = "https://services.leadconnectorhq.com";
const GHL_UPSERT = `${GHL_API}/contacts/upsert`;
const GHL_TIMEOUT_MS = 8000;

interface LeadBody {
  name?: string;
  email?: string;
  phone?: string;
  intent?: string;
  sponsor?: string;
  entityType?: string;
  entityName?: string;
  entitySlug?: string;
  pageUrl?: string;
  message?: string;
  consent?: boolean;
  /** Multi-step qualifier answers from InquiryModal. Stored as JSONB. */
  answers?: Record<string, unknown>;
  /** TCPA consent wording as shown. */
  consent_text?: string;
}

/* ---------------------------------------------------------------- helpers */

function splitName(full: string): { firstName: string; lastName: string } {
  const parts = full.trim().split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

function ghlHeaders(apiKey: string): Record<string, string> {
  return {
    Authorization: `Bearer ${apiKey}`,
    Version: "2021-07-28",
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

function fmtPrice(n: number): string {
  if (n >= 1_000_000) {
    const m = n / 1_000_000;
    return "$" + (m % 1 === 0 ? m : m.toFixed(1)) + "M";
  }
  return "$" + Math.round(n / 1_000) + "K";
}

/* ----------------------------------------- custom field key → id cache */

const FIELD_KEYS = {
  inquiry_type: "contact.inquiry_type",
  community_or_building: "contact.community_or_building",
  timeline_fl_hoa: "contact.timeline_fl_hoa",
  financial_status: "contact.financial_status",
  price_or_budget: "contact.price_or_budget",
  property_location: "contact.property_location",
  role_or_situation: "contact.role_or_situation",
  country_and_language: "contact.country_and_language",
  board_or_association_needs: "contact.board_or_association_needs",
  full_inquiry_details: "contact.full_inquiry_details",
} as const;

type FieldName = keyof typeof FIELD_KEYS;

interface FieldCache {
  ids: Partial<Record<FieldName, string>>;
  at: number;
}

let fieldCache: FieldCache | null = null;
const CACHE_MS = 10 * 60 * 1000;

/**
 * Resolve the location's custom fields to GHL IDs. Cached for 10 min.
 * Returns an empty map on any failure — the caller degrades to key form.
 */
async function resolveFieldIds(
  apiKey: string,
  locationId: string
): Promise<Partial<Record<FieldName, string>>> {
  if (fieldCache && Date.now() - fieldCache.at < CACHE_MS) return fieldCache.ids;

  const ids: Partial<Record<FieldName, string>> = {};
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), GHL_TIMEOUT_MS);
  try {
    const res = await fetch(`${GHL_API}/locations/${locationId}/customFields`, {
      method: "GET",
      headers: ghlHeaders(apiKey),
      signal: controller.signal,
    });
    if (!res.ok) {
      console.warn(`[ghl] custom field lookup failed (${res.status}); using key form`);
      fieldCache = { ids, at: Date.now() };
      return ids;
    }
    const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    const list = (json.customFields ?? json.customField ?? []) as {
      id?: unknown;
      fieldKey?: unknown;
    }[];

    const byKey = new Map<string, string>();
    for (const f of Array.isArray(list) ? list : []) {
      if (typeof f.id === "string" && typeof f.fieldKey === "string") {
        byKey.set(f.fieldKey.trim().toLowerCase(), f.id);
      }
    }

    for (const [name, key] of Object.entries(FIELD_KEYS) as [FieldName, string][]) {
      const id = byKey.get(key);
      if (id) ids[name] = id;
      else console.warn(`[ghl] no custom field in GHL for "${key}"`);
    }
  } catch (err) {
    console.warn("[ghl] custom field lookup threw; using key form:", err);
  } finally {
    clearTimeout(timer);
  }

  fieldCache = { ids, at: Date.now() };
  return ids;
}

/* ---------------------------------------- answer extraction helpers */

const INQUIRY_TYPE: Record<string, string> = {
  finance: "Buyer",
  preconstruction: "Preconstruction",
  sell: "Seller",
  "foreign-national": "Foreign Buyer",
  board: "Board/Association",
  "check-building": "Community Inquiry",
};

function ans(
  answers: Record<string, unknown> | null,
  key: string
): string | undefined {
  if (!answers) return undefined;
  const v = answers[key];
  return typeof v === "string" && v ? v : undefined;
}

function ansNum(
  answers: Record<string, unknown> | null,
  key: string
): number | undefined {
  if (!answers) return undefined;
  const v = answers[key];
  return typeof v === "number" ? v : undefined;
}

function ansArr(
  answers: Record<string, unknown> | null,
  key: string
): string[] | undefined {
  if (!answers) return undefined;
  const v = answers[key];
  if (Array.isArray(v) && v.length > 0) {
    const strings = v.filter((x): x is string => typeof x === "string");
    return strings.length > 0 ? strings : undefined;
  }
  return undefined;
}

function extractTimeline(
  intent: string,
  answers: Record<string, unknown> | null
): string | undefined {
  if (intent === "preconstruction") return ans(answers, "delivery");
  if (intent === "board") return ans(answers, "urgency");
  return ans(answers, "timeline");
}

function extractFinancialStatus(
  intent: string,
  answers: Record<string, unknown> | null
): string | undefined {
  if (intent === "finance") {
    const down = ans(answers, "down");
    const preapp = ans(answers, "preapp");
    if (!down && !preapp) return undefined;
    return [down, preapp].filter(Boolean).join(" · ");
  }
  if (intent === "foreign-national") return ans(answers, "down");
  if (intent === "preconstruction") return ans(answers, "finance");
  return undefined;
}

function extractPriceOrBudget(
  intent: string,
  answers: Record<string, unknown> | null
): string | undefined {
  if (
    intent === "finance" ||
    intent === "foreign-national" ||
    intent === "preconstruction"
  ) {
    const price = ansNum(answers, "price");
    return price != null ? fmtPrice(price) : undefined;
  }
  return undefined;
}

function extractPropertyLocation(
  intent: string,
  answers: Record<string, unknown> | null
): string | undefined {
  if (intent === "preconstruction") {
    const areas = ansArr(answers, "area");
    return areas ? areas.join(", ") : undefined;
  }
  return undefined;
}

function extractRoleOrSituation(
  intent: string,
  answers: Record<string, unknown> | null
): string | undefined {
  if (intent === "sell") return "Owner";
  if (intent === "board") return ans(answers, "role");
  if (intent === "check-building") return ans(answers, "relationship");
  if (
    intent === "finance" ||
    intent === "foreign-national" ||
    intent === "preconstruction"
  ) {
    return ans(answers, "purpose");
  }
  return undefined;
}

function extractCountryAndLanguage(
  intent: string,
  answers: Record<string, unknown> | null
): string | undefined {
  if (intent !== "foreign-national") return undefined;
  const country = ans(answers, "country");
  const language = ans(answers, "language");
  if (!country && !language) return undefined;
  return [country, language].filter(Boolean).join(" · ");
}

function extractBoardNeeds(
  intent: string,
  answers: Record<string, unknown> | null
): string | undefined {
  if (intent !== "board") return undefined;
  const needs = ansArr(answers, "needs");
  const trigger = ans(answers, "trigger");
  const company = ans(answers, "company");
  const parts: string[] = [];
  if (needs) parts.push(needs.join(", "));
  if (trigger) parts.push(trigger);
  if (company) parts.push(`Association: ${company}`);
  return parts.length > 0 ? parts.join(" · ") : undefined;
}

/* ------------------------------------------- full Q&A detail builder */

function formatAnswerValue(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number") return fmtPrice(value);
  if (Array.isArray(value)) return value.join(", ");
  return String(value);
}

/**
 * Build a Q-and-A summary of every step answered in this flow.
 * Uses the flow definition for question text so it reads naturally in GHL.
 */
function buildFullInquiryDetails(
  intent: string,
  answers: Record<string, unknown> | null,
  lead: LeadBody
): string {
  if (!answers || Object.keys(answers).length === 0) return "";

  const flow = FLOWS[intent];
  const lines: string[] = [];

  if (flow) {
    for (const step of flow.steps) {
      if (step.type === "contact" || step.type === "consent") continue;
      const value = answers[step.key];
      if (value == null) continue;
      lines.push(`Q: ${step.q}`);
      lines.push(`A: ${formatAnswerValue(value)}`);
      lines.push("");
    }
  } else {
    // Unknown flow — dump key/value pairs
    for (const [k, v] of Object.entries(answers)) {
      if (v == null) continue;
      lines.push(`${k}: ${formatAnswerValue(v)}`);
    }
    lines.push("");
  }

  // Company from board flow's contact step (not a regular flow step)
  if (answers.company && flow) {
    lines.push("Q: Association / company name");
    lines.push(`A: ${answers.company}`);
    lines.push("");
  }

  if (lead.message) {
    lines.push("Q: Anything else");
    lines.push(`A: ${lead.message}`);
    lines.push("");
  }

  return lines.join("\n").trim();
}

/* ------------------------------------------- build field-value map */

function buildFieldValues(
  intent: string,
  answers: Record<string, unknown> | null,
  lead: LeadBody
): Partial<Record<FieldName, string>> {
  const values: Partial<Record<FieldName, string>> = {};

  // inquiry_type — always
  const iType = INQUIRY_TYPE[intent];
  if (iType) values.inquiry_type = iType;

  // community_or_building
  const building = ans(answers, "building") || lead.entityName;
  if (building) values.community_or_building = building;

  // timeline_fl_hoa
  const tl = extractTimeline(intent, answers);
  if (tl) values.timeline_fl_hoa = tl;

  // financial_status
  const fin = extractFinancialStatus(intent, answers);
  if (fin) values.financial_status = fin;

  // price_or_budget
  const price = extractPriceOrBudget(intent, answers);
  if (price) values.price_or_budget = price;

  // property_location
  const loc = extractPropertyLocation(intent, answers);
  if (loc) values.property_location = loc;

  // role_or_situation
  const role = extractRoleOrSituation(intent, answers);
  if (role) values.role_or_situation = role;

  // country_and_language (foreign-national only)
  const cl = extractCountryAndLanguage(intent, answers);
  if (cl) values.country_and_language = cl;

  // board_or_association_needs (board only)
  const board = extractBoardNeeds(intent, answers);
  if (board) values.board_or_association_needs = board;

  // full_inquiry_details — always
  const details = buildFullInquiryDetails(intent, answers, lead);
  if (details) values.full_inquiry_details = details;

  return values;
}

/* ------------------------------------------------------------------ GHL push */

// The inquiry detail lands as a contact note. Best-effort: the contact and the
// Supabase row already hold the lead if this call fails.
function answersSummary(answers: Record<string, unknown>): string {
  const parts: string[] = [];
  for (const [key, value] of Object.entries(answers)) {
    if (key === "building" || value == null) continue;
    if (typeof value === "string") parts.push(value);
    else if (typeof value === "number") {
      parts.push(fmtPrice(value));
    } else if (Array.isArray(value) && value.length > 0) parts.push(value.join(", "));
  }
  return parts.join(" · ") || "(none)";
}

async function attachNote(
  contactId: string,
  lead: LeadBody,
  apiKey: string
): Promise<void> {
  const body = [
    lead.entityName ? `Record: ${lead.entityName}` : null,
    lead.pageUrl ? `Page: ${lead.pageUrl}` : null,
    lead.intent ? `Intent: ${lead.intent}` : null,
    lead.sponsor ? `Sponsor: ${lead.sponsor}` : null,
    lead.answers ? `Qualifier: ${answersSummary(lead.answers)}` : null,
    lead.message ? `Message: ${lead.message}` : null,
  ]
    .filter(Boolean)
    .join("\n");
  if (!body) return;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), GHL_TIMEOUT_MS);
  try {
    const res = await fetch(`${GHL_API}/contacts/${contactId}/notes`, {
      method: "POST",
      headers: ghlHeaders(apiKey),
      body: JSON.stringify({ body }),
      signal: controller.signal,
    });
    if (!res.ok) {
      console.error(
        "GHL note create failed",
        res.status,
        await res.text().catch(() => "")
      );
    }
  } catch (err) {
    console.error("GHL note create error", err);
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Push the lead into GoHighLevel. Never throws — a CRM outage must not cost us
 * the lead, so the caller treats a null return as "not synced" and moves on.
 *
 * Custom fields are attempted by resolved ID (most reliable), then by key form,
 * then without custom fields at all. Each step only falls through on a 400/422
 * shape rejection. Tags + note always carry the full lead either way.
 */
async function pushToGhl(lead: LeadBody): Promise<string | null> {
  const apiKey = process.env.GHL_API_KEY;
  const locationId = process.env.GHL_LOCATION_ID;
  if (!apiKey || !locationId) return null;

  const { firstName, lastName } = splitName(lead.name ?? "");
  const sourcePage = lead.pageUrl?.replace(/^\//, "") ?? "";
  const tagParts: (string | undefined)[] = [
    "flhoaregistry",
    lead.intent,
    lead.sponsor,
    lead.entityType,
    sourcePage,
  ];
  const tags = tagParts
    .filter((t): t is string => typeof t === "string" && t.length > 0)
    .map((t) => t.toLowerCase());

  const intent = lead.intent ?? "check-building";
  const answers = lead.answers ?? null;
  const fieldVals = buildFieldValues(intent, answers, lead);

  const base = {
    locationId,
    firstName,
    lastName,
    ...(lead.email ? { email: lead.email } : {}),
    ...(lead.phone ? { phone: lead.phone } : {}),
    ...(lead.entityName ? { companyName: lead.entityName } : {}),
    ...(lead.pageUrl
      ? { website: `https://flhoaregistry.com${lead.pageUrl}` }
      : {}),
    source: "flhoaregistry.com",
    tags,
  };

  try {
    // Resolve field IDs (cached, tolerant of failure)
    const ids = await resolveFieldIds(apiKey, locationId);

    const byId = Object.entries(fieldVals)
      .filter(([name]) => ids[name as FieldName])
      .map(([name, value]) => ({
        id: ids[name as FieldName]!,
        field_value: value,
      }));

    const byKey = Object.entries(fieldVals).map(([name, value]) => ({
      key: name,
      field_value: value,
      value,
    }));

    // Attempts in descending fidelity
    const attempts: { label: string; customFields?: unknown[] }[] = [];
    if (byId.length > 0) attempts.push({ label: "id", customFields: byId });
    if (byKey.length > 0)
      attempts.push({ label: "key", customFields: byKey });
    attempts.push({ label: "none" });

    let contactId: string | null = null;

    for (const attempt of attempts) {
      const payload = attempt.customFields
        ? { ...base, customFields: attempt.customFields }
        : base;

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), GHL_TIMEOUT_MS);
      let res: Response;
      try {
        res = await fetch(GHL_UPSERT, {
          method: "POST",
          headers: ghlHeaders(apiKey),
          body: JSON.stringify(payload),
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timer);
      }

      const json = await res.json().catch(() => null);
      const contact = json?.contact as { id?: string } | undefined;
      contactId = contact?.id ?? json?.id ?? null;

      if (contactId) {
        if (attempt.label === "none") {
          console.warn(
            `[ghl] contact ${contactId} upserted without custom fields — ` +
              `check the flhoaregistry field keys in GHL`
          );
        } else {
          console.info(
            `[ghl] contact ${contactId} upserted (fields by ${attempt.label})`
          );
        }
        break;
      }

      // Only retry on a shape/validation rejection
      if (res.status !== 400 && res.status !== 422) {
        const errText = json?.message ?? json?.msg ?? `status ${res.status}`;
        console.error(`[ghl] upsert failed: ${errText}`);
        break;
      }

      const next = attempts[attempts.indexOf(attempt) + 1];
      if (next) {
        console.warn(
          `[ghl] upsert rejected (fields by ${attempt.label}, ${res.status}); retrying by ${next.label}`
        );
      }
    }

    if (contactId) await attachNote(contactId, lead, apiKey);
    return contactId;
  } catch (err) {
    console.error("GHL contact upsert error", err);
    return null;
  }
}

/* ----------------------------------------------------------------- POST */

export async function POST(req: NextRequest) {
  let body: LeadBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body." },
      { status: 400 }
    );
  }

  const name = (body.name ?? "").trim();
  const email = (body.email ?? "").trim();
  const phone = (body.phone ?? "").trim();

  if (!name) {
    return NextResponse.json(
      { ok: false, error: "Name is required." },
      { status: 400 }
    );
  }
  if (!email && !phone) {
    return NextResponse.json(
      { ok: false, error: "An email address or phone number is required." },
      { status: 400 }
    );
  }
  if (body.consent !== true) {
    return NextResponse.json(
      { ok: false, error: "Consent is required to submit an inquiry." },
      { status: 400 }
    );
  }

  const lead: LeadBody = {
    ...body,
    name,
    email: email || undefined,
    phone: phone || undefined,
  };

  // GHL runs first so the sync result can be written with the row itself: the
  // anon role holds INSERT-only rights on `leads`, so a follow-up UPDATE to
  // stamp ghl_synced would be silently discarded by RLS. A CRM failure still
  // leaves the durable Supabase row below, flagged unsynced for later retry.
  const ghlContactId = await pushToGhl(lead);

  const answers =
    body.answers && typeof body.answers === "object" && !Array.isArray(body.answers)
      ? body.answers
      : null;

  const { error } = await supabase.from("leads").insert({
    name,
    email: email || null,
    phone: phone || null,
    intent: body.intent ?? null,
    sponsor: body.sponsor ?? null,
    entity_type: body.entityType ?? null,
    entity_name: body.entityName ?? null,
    entity_slug: body.entitySlug ?? null,
    page_url: body.pageUrl ?? null,
    message: body.message ?? null,
    consent: true,
    consent_text: body.consent_text ?? null,
    ghl_synced: Boolean(ghlContactId),
    ghl_contact_id: ghlContactId,
    ...(answers ? { answers } : {}),
  });

  if (error) {
    console.error("Supabase lead insert failed", error.message);
    // The CRM copy may already exist, so only report failure if both sinks missed.
    if (!ghlContactId) {
      return NextResponse.json(
        {
          ok: false,
          error: "We could not record your inquiry. Please try again.",
        },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ ok: true });
}
