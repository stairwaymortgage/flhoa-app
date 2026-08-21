import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GHL credentials are read only here, on the server. They must never carry a
// NEXT_PUBLIC_ prefix or be referenced from a client component.
const GHL_CONTACTS = "https://services.leadconnectorhq.com/contacts/";
// upsert rather than create: this GHL location rejects duplicate contacts, so a
// returning visitor would otherwise fail to sync. Upsert tags the existing
// contact instead and hands back its id.
const GHL_UPSERT = "https://services.leadconnectorhq.com/contacts/upsert";
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

function splitName(full: string): { firstName: string; lastName: string } {
  const parts = full.trim().split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

// Push the lead into GoHighLevel. Never throws — a CRM outage must not cost us
// the lead, so the caller treats a null return as "not synced" and moves on.
async function pushToGhl(lead: LeadBody): Promise<string | null> {
  const apiKey = process.env.GHL_API_KEY;
  const locationId = process.env.GHL_LOCATION_ID;
  if (!apiKey || !locationId) return null;

  const { firstName, lastName } = splitName(lead.name ?? "");
  const sourcePage = lead.pageUrl?.replace(/^\//, "") ?? "";
  const tagParts: (string | undefined)[] = ["flhoaregistry", lead.intent, lead.sponsor, lead.entityType, sourcePage];
  const tags = tagParts
    .filter((t): t is string => typeof t === "string" && t.length > 0)
    .map((t) => t.toLowerCase());

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), GHL_TIMEOUT_MS);
  try {
    // The v2 contacts schema has no free-text field, so the record context that
    // fits goes on the contact and the rest follows as a note below.
    const res = await fetch(GHL_UPSERT, {
      method: "POST",
      headers: ghlHeaders(apiKey),
      body: JSON.stringify({
        locationId,
        firstName,
        lastName,
        ...(lead.email ? { email: lead.email } : {}),
        ...(lead.phone ? { phone: lead.phone } : {}),
        ...(lead.entityName ? { companyName: lead.entityName } : {}),
        ...(lead.pageUrl ? { website: `https://flhoaregistry.com${lead.pageUrl}` } : {}),
        source: "flhoaregistry.com",
        tags,
      }),
      signal: controller.signal,
    });
    if (!res.ok) {
      console.error("GHL contact upsert failed", res.status, await res.text().catch(() => ""));
      return null;
    }
    const json = await res.json().catch(() => null);
    const contactId: string | null = json?.contact?.id ?? json?.id ?? null;

    if (contactId) await attachNote(contactId, lead, apiKey);
    return contactId;
  } catch (err) {
    console.error("GHL contact upsert error", err);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function ghlHeaders(apiKey: string): Record<string, string> {
  return {
    Authorization: `Bearer ${apiKey}`,
    Version: "2021-07-28",
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

// The inquiry detail lands as a contact note. Best-effort: the contact and the
// Supabase row already hold the lead if this call fails.
function answersSummary(answers: Record<string, unknown>): string {
  const parts: string[] = [];
  for (const [key, value] of Object.entries(answers)) {
    if (key === "building" || value == null) continue;
    if (typeof value === "string") parts.push(value);
    else if (typeof value === "number") {
      if (value >= 1_000_000) {
        const m = value / 1_000_000;
        parts.push("$" + (m % 1 === 0 ? m : m.toFixed(1)) + "M");
      } else parts.push("$" + Math.round(value / 1_000) + "K");
    } else if (Array.isArray(value) && value.length > 0) parts.push(value.join(", "));
  }
  return parts.join(" · ") || "(none)";
}

async function attachNote(contactId: string, lead: LeadBody, apiKey: string): Promise<void> {
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
    const res = await fetch(`${GHL_CONTACTS}${contactId}/notes`, {
      method: "POST",
      headers: ghlHeaders(apiKey),
      body: JSON.stringify({ body }),
      signal: controller.signal,
    });
    if (!res.ok) {
      console.error("GHL note create failed", res.status, await res.text().catch(() => ""));
    }
  } catch (err) {
    console.error("GHL note create error", err);
  } finally {
    clearTimeout(timer);
  }
}

export async function POST(req: NextRequest) {
  let body: LeadBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }

  const name = (body.name ?? "").trim();
  const email = (body.email ?? "").trim();
  const phone = (body.phone ?? "").trim();

  if (!name) {
    return NextResponse.json({ ok: false, error: "Name is required." }, { status: 400 });
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
        { ok: false, error: "We could not record your inquiry. Please try again." },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ ok: true });
}
