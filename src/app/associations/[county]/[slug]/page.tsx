import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getAssociation,
  getAssociationParams,
  getComplianceForAssociation,
  getRecertsForAddress,
  getRegistryForAssociation,
  slug as slugify,
} from "@/lib/data";
import { DELINQUENT_EXPLAINER, DATA_SOURCE, AS_OF_DATE } from "@/lib/status";
import { PageGrid } from "@/components/PageGrid";
import { HookBar } from "@/components/HookBar";
import { Badge, Breadcrumbs, RecordShell, FactGrid, SubSection, SourceNote } from "@/components/ui";
import { SidebarBox, SponsorCard, ClaimBox, SidebarLinks, REALTOR_SPONSOR, LENDER_SPONSOR } from "@/components/Sponsors";
import { ComplianceSection } from "@/components/ComplianceSection";
import { JsonLd, breadcrumbList, associationJsonLd } from "@/components/JsonLd";
import { absoluteUrl } from "@/lib/site";
import type { Metadata } from "next";
import { correctionHref, claimHref } from "@/lib/corrections";

export const dynamicParams = true;
export const revalidate = 86400;

export async function generateMetadata({
  params,
}: {
  params: { county: string; slug: string };
}): Promise<Metadata> {
  const a = await getAssociation(params.county, params.slug);
  if (!a) return { title: "Association Not Found" };
  const path = `/associations/${params.county}/${params.slug}`;
  const title = `${a.name} — ${a.city}, FL Community Association`;
  const description = [
    `${a.name} is a registered ${a.sourceType || "community association"} in ${a.city}, ${a.county} County, Florida`,
    a.units ? ` with ${a.units} units` : "",
    `. Registration status: ${a.primaryStatus}`,
    a.secondaryStatus ? ` (secondary status: ${a.secondaryStatus})` : "",
    ". Project number, managing entity, and filing facts from Florida DBPR public records.",
  ].join("");
  return {
    title,
    description,
    alternates: { canonical: absoluteUrl(path) },
    openGraph: { title, description, url: absoluteUrl(path), type: "profile" },
    twitter: { card: "summary", title, description },
  };
}

export async function generateStaticParams() {
  return getAssociationParams(1500);
}

export default async function AssociationPage({ params }: { params: { county: string; slug: string } }) {
  const a = await getAssociation(params.county, params.slug);
  if (!a) notFound();

  const delinquent = a.secondaryStatus === "Delinquent";
  const pageUrl = `/associations/${params.county}/${params.slug}`;

  // Enrichment sources. The Miami-Dade condominium registry only covers Dade.
  const [compliance, recerts, registry] = await Promise.all([
    getComplianceForAssociation(a.name),
    getRecertsForAddress(a.street),
    params.county === "dade" ? getRegistryForAssociation(a.name) : Promise.resolve(undefined),
  ]);

  return (
    <>
      <JsonLd
        data={associationJsonLd({
          name: a.name,
          street: a.street,
          city: a.city,
          state: a.state,
          zip: a.zip,
          url: pageUrl,
          sourceType: a.sourceType,
        })}
      />
      <JsonLd
        data={breadcrumbList([
          { name: "Home", path: "/" },
          { name: `${a.county} County`, path: `/counties/${params.county}` },
          { name: a.city, path: `/associations/${params.county}/city/${a.citySlug}` },
          { name: a.name, path: pageUrl },
        ])}
      />
      <div className="mx-auto max-w-content px-6">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Associations", href: "/associations" },
            { label: `${a.county} County`, href: `/counties/${slugify(a.county)}` },
            { label: a.city, href: `/associations/${slugify(a.county)}/city/${a.citySlug}` },
            { label: a.name },
          ]}
        />
      </div>

      <PageGrid
        main={
          <RecordShell official="Official Record · Florida DBPR Condominium Registry">
            <div className="px-[26px] pt-6 pb-4 border-b border-line">
              <h1 className="font-serif font-black text-[26px] leading-tight">{a.name}</h1>
              <div className="text-mut text-sm mt-1.5">
                {a.street}{a.street && ", "}{a.city}, {a.state} {a.zip} · {a.county} County
              </div>
              <div className="flex gap-2 mt-3.5 flex-wrap">
                <Badge tone="ok">✓ Registered — {a.primaryStatus}</Badge>
                {delinquent && <Badge tone="warn">Secondary Status: Delinquent</Badge>}
              </div>
            </div>

            <FactGrid
              items={[
                { k: "Project No.", v: a.projectNumber, mono: true },
                { k: "Units", v: a.units ?? "—" },
                { k: "Type", v: a.sourceType },
                { k: "Recorded", v: a.recordedDate || "—" },
              ]}
            />

            {a.managingEntity && (
              <SubSection title="Managing Entity">
                <p className="text-sm">
                  {a.managingEntity.firmSlug ? (
                    <Link href={`/managers/firms/${a.managingEntity.firmSlug}`}>{a.managingEntity.name}</Link>
                  ) : (
                    <span className="font-medium">{a.managingEntity.name}</span>
                  )}
                  {a.managingEntity.city && ` — ${a.managingEntity.city}, ${a.managingEntity.state ?? "FL"}`}
                </p>
                <p className="text-xs text-mut mt-1.5">
                  Verify this entity in the{" "}
                  <Link href="/managers/firms">Management Firms directory</Link>.
                </p>
              </SubSection>
            )}

            <ComplianceSection
              compliance={compliance}
              recerts={recerts}
              registry={registry}
              entityName={a.name}
              entitySlug={a.slug}
              pageUrl={pageUrl}
            />

            {delinquent && (
              <SubSection title='What "Delinquent" Status Means'>
                <p className="text-sm">{DELINQUENT_EXPLAINER}</p>
                <p className="text-xs text-mut mt-1.5">
                  Source: DBPR registry, as of {AS_OF_DATE} ·{" "}
                  <Link
                    href={correctionHref({
                      type: "association",
                      entity: a.name,
                      url: pageUrl,
                      slug: a.slug,
                    })}
                    className="text-navy-light"
                  >
                    Request a correction to this record
                  </Link>
                </p>
              </SubSection>
            )}

            <HookBar
              entityType="association"
              entityName={a.name}
              entitySlug={a.slug}
              hooks={[
                { intent: "buying", title: "I'm buying here", sub: "Financing & condo-approval check before you offer" },
                { intent: "owning", title: "I own here", sub: "Home value report · special-assessment funding options" },
                { intent: "board", title: "I'm on the board", sub: "Association funding for repairs, reserves & projects" },
              ]}
            />
            <SourceNote
              entityType="association"
              entityName={a.name}
              entitySlug={a.slug}
              pageUrl={pageUrl}
            >
              Data: {DATA_SOURCE} · flhoaregistry.com is not affiliated with the State of Florida
            </SourceNote>
          </RecordShell>
        }
        sidebar={
          <>
            <SidebarBox label="Featured Local Expert — Sponsored">
              <SponsorCard {...REALTOR_SPONSOR} entityType="association" entityName={a.name} entitySlug={a.slug} />
            </SidebarBox>
            <SidebarBox label="Financing Partner — Sponsored">
              <SponsorCard {...LENDER_SPONSOR} gold entityType="association" entityName={a.name} entitySlug={a.slug} />
            </SidebarBox>
            <SidebarBox label={`In ${a.county} County`}>
              <SidebarLinks
                links={[
                  { label: `All ${a.county} associations`, href: `/counties/${slugify(a.county)}` },
                  { label: `${a.county} management firms`, href: "/managers/firms" },
                  { label: `${a.county} County hub page`, href: `/counties/${slugify(a.county)}` },
                ]}
              />
            </SidebarBox>
            <SidebarBox label="For This Association">
              <ClaimBox>
                Are you an officer or manager of {a.name}?{" "}
                <Link
                  href={claimHref({ type: "association", entity: a.name, slug: a.slug })}
                  className="font-bold"
                >
                  Claim this page
                </Link>{" "}
                to update details and respond to inquiries.
              </ClaimBox>
            </SidebarBox>
          </>
        }
      />
    </>
  );
}
