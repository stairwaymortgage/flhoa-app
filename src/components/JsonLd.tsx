import { SITE_NAME, SITE_URL, absoluteUrl } from "@/lib/site";

// Structured data. Every field below is drawn from a record we actually hold —
// no ratings, no invented attributes, no financial characterizations.

export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

export function breadcrumbList(items: { name: string; path: string }[]): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: absoluteUrl(it.path),
    })),
  };
}

export function organizationAndWebsite(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: SITE_NAME,
        url: SITE_URL,
        description:
          "An independent directory of Florida community association public records. Not affiliated with the State of Florida.",
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        name: SITE_NAME,
        url: SITE_URL,
        publisher: { "@id": `${SITE_URL}/#organization` },
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${SITE_URL}/verify?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };
}

/** Drop keys whose value is empty so no blank fields reach structured data. */
function compact(obj: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === null || v === undefined || v === "") continue;
    out[k] = v;
  }
  return out;
}

function postalAddress(a: {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
}): Record<string, unknown> | undefined {
  const address = compact({
    "@type": "PostalAddress",
    streetAddress: a.street,
    addressLocality: a.city,
    addressRegion: a.state || "FL",
    postalCode: a.zip,
    addressCountry: "US",
  });
  // "@type" plus country alone is not a real address.
  return Object.keys(address).length > 3 ? address : undefined;
}

export function associationJsonLd(a: {
  name: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  url: string;
  sourceType: string;
}): Record<string, unknown> {
  return compact({
    "@context": "https://schema.org",
    "@type": "Residence",
    name: a.name,
    url: absoluteUrl(a.url),
    address: postalAddress(a),
    additionalType: a.sourceType || undefined,
  });
}

export function firmJsonLd(f: {
  name: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  url: string;
  licenseNumber: string;
}): Record<string, unknown> {
  return compact({
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: f.name,
    url: absoluteUrl(f.url),
    address: postalAddress(f),
    identifier: f.licenseNumber || undefined,
  });
}

export function camJsonLd(c: {
  name: string;
  city: string;
  url: string;
  licenseNumber: string;
}): Record<string, unknown> {
  return compact({
    "@context": "https://schema.org",
    "@type": "Person",
    name: c.name,
    url: absoluteUrl(c.url),
    jobTitle: "Community Association Manager (CAM)",
    identifier: c.licenseNumber || undefined,
    address: postalAddress({ city: c.city }),
  });
}

export function developerJsonLd(d: {
  name: string;
  city: string | null;
  url: string;
}): Record<string, unknown> {
  return compact({
    "@context": "https://schema.org",
    "@type": "Organization",
    name: d.name,
    url: absoluteUrl(d.url),
    address: postalAddress({ city: d.city ?? undefined }),
  });
}
