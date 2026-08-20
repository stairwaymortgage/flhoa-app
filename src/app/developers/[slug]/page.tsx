import { notFound } from "next/navigation";
import Link from "next/link";
import { getDeveloper, getDeveloperParams } from "@/lib/data";
import { PageGrid } from "@/components/PageGrid";
import { HookBar } from "@/components/HookBar";
import { Badge, Breadcrumbs, RecordShell, FactGrid, SubSection, SourceNote } from "@/components/ui";
import { LeaderboardBanner, SidebarBox, SponsorCard, SidebarLinks, REALTOR_SPONSOR, LENDER_SPONSOR } from "@/components/Sponsors";

export const dynamicParams = true;
export const revalidate = 86400;

export async function generateStaticParams() {
  return getDeveloperParams(1500);
}

export default async function DeveloperPage({ params }: { params: { slug: string } }) {
  const d = await getDeveloper(params.slug);
  if (!d) notFound();

  return (
    <>
      <div className="mx-auto max-w-content px-6">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Developers", href: "/developers" },
            { label: d.name },
          ]}
        />
        <LeaderboardBanner
          title="Buying in a New-Construction Community?"
          sub="Compare builder financing vs. outside lenders — including foreign-national programs."
          intent="buying"
          sponsor="lender"
          entityType="developer"
          entityName={d.name}
          entitySlug={d.slug}
        />
      </div>

      <PageGrid
        main={
          <RecordShell official="Official Filing Record · Florida DBPR">
            <div className="px-[26px] pt-6 pb-4 border-b border-line">
              <h1 className="font-serif font-black text-[24px] leading-tight">{d.name}</h1>
              <div className="text-mut text-sm mt-1.5">
                {d.city ? `${d.city}, FL · ` : ""}Filings across multiple Florida counties
              </div>
              <div className="flex gap-2 mt-3 flex-wrap">
                <Badge tone="info">{d.projectsFiled} Projects Filed Statewide</Badge>
              </div>
            </div>

            <FactGrid
              items={[
                { k: "Projects Filed", v: d.projectsFiled },
                { k: "Counties", v: d.countiesCount },
                { k: "Primary Type", v: d.primaryType },
                { k: "Filing Range", v: d.filingRange },
              ]}
            />

            <SubSection title="Project Portfolio">
              <table className="w-full text-[13.5px]">
                <thead>
                  <tr className="text-left text-[10px] font-bold tracking-[0.1em] uppercase text-mut">
                    <th className="py-2 pr-2 border-b-2 border-line">Project</th>
                    <th className="py-2 px-2 border-b-2 border-line">County</th>
                    <th className="py-2 pl-2 border-b-2 border-line">Project No.</th>
                  </tr>
                </thead>
                <tbody>
                  {d.projects.map((p, i) => (
                    <tr key={i}>
                      <td className="py-2.5 pr-2 border-b border-line font-semibold text-navy-light">{p.name}</td>
                      <td className="py-2.5 px-2 border-b border-line">{p.county}</td>
                      <td className="py-2.5 pl-2 border-b border-line font-mono text-xs text-mut">{p.projectNumber}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-mut mt-1.5">
                Showing {d.projects.length} of {d.projectsFiled} filed projects.
              </p>
            </SubSection>

            <HookBar
              heading={`Researching a ${d.name} community?`}
              entityType="developer"
              entityName={d.name}
              entitySlug={d.slug}
              hooks={[
                { intent: "buying", title: "I'm buying in one", sub: "Financing & approval check for any community in this portfolio" },
                { intent: "buying", title: "I'm buying from overseas", sub: "Foreign-national financing — no U.S. credit required" },
                { intent: "owning", title: "I own in one", sub: "Home value report & refinancing options" },
              ]}
            />
            <SourceNote
              entityType="developer"
              entityName={d.name}
              entitySlug={d.slug}
              pageUrl={`/developers/${d.slug}`}
            />
          </RecordShell>
        }
        sidebar={
          <>
            <SidebarBox label="Featured Local Expert — New Construction · Sponsored">
              <SponsorCard {...REALTOR_SPONSOR} entityType="developer" entityName={d.name} entitySlug={d.slug} />
            </SidebarBox>
            <SidebarBox label="Financing Partner — Sponsored">
              <SponsorCard {...LENDER_SPONSOR} gold entityType="developer" entityName={d.name} entitySlug={d.slug} />
            </SidebarBox>
            <SidebarBox label="Related Records">
              <SidebarLinks
                links={[
                  { label: `All ${d.projectsFiled} projects`, href: "#" },
                  { label: "Developer directory", href: "/developers" },
                  { label: "Browse counties", href: "/counties" },
                ]}
              />
            </SidebarBox>
          </>
        }
      />
    </>
  );
}
