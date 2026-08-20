import { notFound } from "next/navigation";
import { getCam, getCamParams } from "@/lib/data";
import { CAM_EXPLAINER, AS_OF_DATE } from "@/lib/status";
import { claimHref } from "@/lib/corrections";
import Link from "next/link";
import { PageGrid } from "@/components/PageGrid";
import { HookBar } from "@/components/HookBar";
import { Badge, Breadcrumbs, RecordShell, FactGrid, SubSection, SourceNote } from "@/components/ui";
import { SidebarBox, SponsorCard, ClaimBox, SidebarLinks, REALTOR_SPONSOR, LENDER_SPONSOR } from "@/components/Sponsors";

export const dynamicParams = true;
export const revalidate = 86400;

export async function generateStaticParams() {
  return getCamParams(1500);
}

export default async function CamPage({ params }: { params: { slug: string } }) {
  const c = await getCam(params.slug);
  if (!c) notFound();

  return (
    <>
      <div className="mx-auto max-w-content px-6">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Licensed Managers", href: "/managers/cam" },
            { label: c.name },
          ]}
        />
      </div>

      <PageGrid
        main={
          <RecordShell official="Official License Record · Florida DBPR">
            <div className="px-[26px] pt-6 pb-4 border-b border-line">
              <h1 className="font-serif font-black text-[24px] leading-tight">{c.name}, CAM</h1>
              <div className="text-mut text-sm mt-1.5">{c.city}, FL</div>
              <div className="flex gap-2 mt-3 flex-wrap">
                <Badge tone="ok">✓ License Active</Badge>
                <Badge tone="info">Community Association Manager</Badge>
              </div>
            </div>

            <FactGrid
              items={[
                { k: "License No.", v: c.licenseNumber, mono: true },
                { k: "Expires", v: c.expirationDate || "—" },
                { k: "CE Credits", v: c.ceCredits ?? "—" },
                { k: "CE Courses", v: c.ceCourses != null ? `${c.ceCourses} recorded` : "—" },
              ]}
            />

            <SubSection title="What Is a CAM?">
              <p className="text-sm">{CAM_EXPLAINER}</p>
              <p className="text-xs text-mut mt-1.5">
                Source: Fla. Stat. Ch. 468, Part VIII · DBPR license records, as of {AS_OF_DATE}
              </p>
            </SubSection>

            <HookBar
              heading="Working with this manager's community?"
              entityType="cam"
              entityName={c.name}
              entitySlug={c.slug}
              hooks={[
                { intent: "inquiry", title: "I'm this manager", sub: "Claim your license page · CE renewal reminders · featured listing" },
                { intent: "board", title: "I'm on a board", sub: "Association funding & banking options for your community" },
                { intent: "buying", title: "I'm buying or selling", sub: "Financing check & home value report for the community" },
              ]}
            />
            <SourceNote
              entityType="cam"
              entityName={c.name}
              entitySlug={c.slug}
              pageUrl={`/managers/cam/${c.slug}`}
            />
          </RecordShell>
        }
        sidebar={
          <>
            <SidebarBox label="For This Manager">
              <ClaimBox>
                <b>Is this you?</b>{" "}
                <Link href={claimHref({ type: "cam", entity: c.name, slug: c.slug })} className="font-bold">
                  Claim this page
                </Link>{" "}
                — add your firm, photo, and communities. Get renewal reminders before {c.expirationDate}.
              </ClaimBox>
            </SidebarBox>
            <SidebarBox label="Featured Local Expert — Sponsored">
              <SponsorCard {...REALTOR_SPONSOR} entityType="cam" entityName={c.name} entitySlug={c.slug} />
            </SidebarBox>
            <SidebarBox label="Financing Partner — Sponsored">
              <SponsorCard {...LENDER_SPONSOR} gold entityType="cam" entityName={c.name} entitySlug={c.slug} />
            </SidebarBox>
            <SidebarBox label="Related Records">
              <SidebarLinks
                links={[
                  { label: "All licensed managers", href: "/managers/cam" },
                  { label: "Management firms", href: "/managers/firms" },
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
