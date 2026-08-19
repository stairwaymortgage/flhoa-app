import { notFound } from "next/navigation";
import Link from "next/link";
import { getAssociation, getAssociations, slug as slugify } from "@/lib/data";
import { DELINQUENT_EXPLAINER, DATA_SOURCE, AS_OF_DATE } from "@/lib/status";
import { PageGrid } from "@/components/PageGrid";
import { HookBar } from "@/components/HookBar";
import { Badge, Breadcrumbs, RecordShell, FactGrid, SubSection, SourceNote } from "@/components/ui";
import { SidebarBox, SponsorCard, ClaimBox, SidebarLinks } from "@/components/Sponsors";

export function generateStaticParams() {
  return getAssociations().map((a) => ({ county: slugify(a.county), slug: a.slug }));
}

export default function AssociationPage({ params }: { params: { county: string; slug: string } }) {
  const a = getAssociation(params.county.replace(/-/g, " "), params.slug)
    ?? getAssociations().find((x) => slugify(x.county) === params.county && x.slug === params.slug);
  if (!a) notFound();

  const delinquent = a.secondaryStatus === "Delinquent";

  return (
    <>
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

            {delinquent && (
              <SubSection title='What "Delinquent" Status Means'>
                <p className="text-sm">{DELINQUENT_EXPLAINER}</p>
                <p className="text-xs text-mut mt-1.5">
                  Source: DBPR registry, as of {AS_OF_DATE} ·{" "}
                  <a href="/corrections" className="text-navy-light">Request a correction to this record</a>
                </p>
              </SubSection>
            )}

            <HookBar
              hooks={[
                { title: "I'm buying here", sub: "Financing & condo-approval check before you offer" },
                { title: "I own here", sub: "Home value report · special-assessment funding options" },
                { title: "I'm on the board", sub: "Association funding for repairs, reserves & projects" },
              ]}
            />
            <SourceNote>Data: {DATA_SOURCE} · flhoaregistry.com is not affiliated with the State of Florida</SourceNote>
          </RecordShell>
        }
        sidebar={
          <>
            <SidebarBox label="Featured Local Expert — Sponsored">
              <SponsorCard initials="MR" name="Maria Rodriguez, Realtor®" tag={`${a.city} specialist`} />
            </SidebarBox>
            <SidebarBox label="Financing Partner — Sponsored">
              <SponsorCard initials="$" name="Condo & Assessment Lending" tag="Purchase · Refi · HELOC · Foreign National" gold />
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
                Are you an officer or manager of {a.name}? <a href="/claim" className="font-bold">Claim this page</a> to update details and respond to inquiries.
              </ClaimBox>
            </SidebarBox>
          </>
        }
      />
    </>
  );
}
