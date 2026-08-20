import { notFound } from "next/navigation";
import Link from "next/link";
import { getFirm, getFirmParams, slug as slugify } from "@/lib/data";
import { isFirmActive } from "@/lib/status";
import { PageGrid } from "@/components/PageGrid";
import { HookBar } from "@/components/HookBar";
import { Badge, Breadcrumbs, RecordShell, FactGrid, SubSection, SourceNote } from "@/components/ui";
import { LeaderboardBanner, InlineBanner, SidebarBox, SponsorCard, ClaimBox, SidebarLinks, REALTOR_SPONSOR, LENDER_SPONSOR } from "@/components/Sponsors";

export const dynamicParams = true;
export const revalidate = 86400;

export async function generateStaticParams() {
  return getFirmParams(1500);
}

export default async function FirmPage({ params }: { params: { slug: string } }) {
  const f = await getFirm(params.slug);
  if (!f) notFound();
  const active = isFirmActive(f.statusCode);

  return (
    <>
      <div className="mx-auto max-w-content px-6">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Management Firms", href: "/managers/firms" },
            { label: `${f.county} County`, href: `/counties/${slugify(f.county)}` },
            { label: f.name },
          ]}
        />
        <LeaderboardBanner
          title="Association Banking & Reserve Lending"
          sub="Repair loans, reserve funding & banking for the communities you manage."
        />
      </div>

      <PageGrid
        main={
          <RecordShell official="Official License Record · Florida DBPR">
            <div className="px-[26px] pt-6 pb-4 border-b border-line">
              <h1 className="font-serif font-black text-[24px] leading-tight">{f.name}</h1>
              <div className="text-mut text-sm mt-1.5">
                {f.street}, {f.city}, {f.state} {f.zip} · {f.county} County
              </div>
              <div className="flex gap-2 mt-3 flex-wrap">
                <Badge tone={active ? "ok" : "warn"}>
                  {active ? "✓ " : ""}License {f.statusPlain}
                </Badge>
                <Badge tone="info">Community Association Business (CAB)</Badge>
              </div>
            </div>

            <FactGrid
              items={[
                { k: "License No.", v: f.licenseNumber, mono: true },
                { k: "Status Code", v: `${f.statusCode.trim()} — ${f.statusPlain}`, mono: true },
                { k: "Licensed Since", v: f.originalDate || "—" },
                { k: "Expires", v: f.expirationDate || "—" },
              ]}
            />

            <SubSection title="Communities Managed (Portfolio)">
              {f.managedAssociations.length > 0 ? (
                <table className="w-full text-[13.5px]">
                  <thead>
                    <tr className="text-left text-[10px] font-bold tracking-[0.1em] uppercase text-mut">
                      <th className="py-2 pr-2 border-b-2 border-line">Association</th>
                      <th className="py-2 px-2 border-b-2 border-line">County</th>
                      <th className="py-2 px-2 border-b-2 border-line">Units</th>
                      <th className="py-2 pl-2 border-b-2 border-line">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {f.managedAssociations.map((m) => (
                      <tr key={m.slug}>
                        <td className="py-2.5 pr-2 border-b border-line">
                          <Link href={`/associations/${slugify(m.county)}/${m.slug}`} className="font-semibold no-underline">{m.name}</Link>
                        </td>
                        <td className="py-2.5 px-2 border-b border-line">{m.county}</td>
                        <td className="py-2.5 px-2 border-b border-line">{m.units ?? "—"}</td>
                        <td className="py-2.5 pl-2 border-b border-line"><Badge tone="ok">{m.status}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-sm text-mut">Managed-community matches are being compiled from the state registry.</p>
              )}
            </SubSection>

            <InlineBanner
              title="Insurance for Managed Communities"
              sub="Master policy reviews for HOA & condo portfolios — Florida admitted carriers."
            />

            <HookBar
              heading="Why are you looking up this firm?"
              hooks={[
                { title: "I'm on a board vetting this firm", sub: "Management comparison guide + association funding options" },
                { title: "I own in a community they manage", sub: "Home value report · assessment & refinancing help" },
              ]}
            />
            <SourceNote
              entityType="firm"
              entityName={f.name}
              entitySlug={f.slug}
              pageUrl={`/managers/firms/${f.slug}`}
            />
          </RecordShell>
        }
        sidebar={
          <>
            <SidebarBox label="For This Firm">
              <ClaimBox>
                <b>Is this your company?</b> <a href="/claim" className="font-bold">Claim this profile</a> — add your logo, service areas & contact info. Featured placement available.
              </ClaimBox>
            </SidebarBox>
            <SidebarBox label={`Featured Local Expert — ${f.county} County · Sponsored`}>
              <SponsorCard {...REALTOR_SPONSOR} />
            </SidebarBox>
            <SidebarBox label="Financing Partner — Sponsored">
              <SponsorCard {...LENDER_SPONSOR} gold />
            </SidebarBox>
            <SidebarBox label="Related Records">
              <SidebarLinks
                links={[
                  { label: "Licensed managers (CAMs)", href: "/managers/cam" },
                  { label: `All ${f.county} County firms`, href: "/managers/firms" },
                  { label: `${f.county} County hub`, href: `/counties/${slugify(f.county)}` },
                ]}
              />
            </SidebarBox>
          </>
        }
      />
    </>
  );
}
