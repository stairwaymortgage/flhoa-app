import { absoluteUrl } from "@/lib/site";
import Link from "next/link";
import { getAssociationsSample, slug as slugify } from "@/lib/data";
import { Breadcrumbs, Badge } from "@/components/ui";
import { SearchBox } from "@/components/SearchBox";
import { HeroCta } from "@/components/HeroCta";

export const metadata = {
  title: "Florida Community Associations — Directory",
  description:
    "Browse 37,159 registered Florida community associations. Search by name or browse by county for registration status, managing entity, and filing facts from state public records.",
  alternates: { canonical: absoluteUrl("/associations") },
  openGraph: {
    title: "Florida Community Associations — Directory",
    description:
      "Browse 37,159 registered Florida community associations. Registration status, managing entity, and filing facts from state public records.",
    url: absoluteUrl("/associations"),
  },
};
export const revalidate = 3600;

export default async function AssociationsIndex() {
  const associations = await getAssociationsSample();
  return (
    <>
      {/* Audience hero */}
      <section className="bg-gradient-to-b from-navy to-navy-light text-white py-12">
        <div className="mx-auto max-w-content px-6">
          <div className="text-xs font-semibold tracking-[0.14em] uppercase text-gold mb-4">
            Community research
          </div>
          <h2 className="font-serif font-black text-[clamp(24px,3.4vw,34px)] leading-tight max-w-[660px] mb-3">
            Need to know more than what the public record shows?
          </h2>
          <p className="text-[#C8D4E0] text-[15px] max-w-[580px] leading-relaxed mb-7">
            Registration status is one narrow record. If you need to know whether
            a lender will finance purchases in a community, or what the
            association&apos;s finances actually look like, that takes a licensed
            professional.
          </p>
          <HeroCta
            intent="check-building"
            label="Ask about a community"
            fine="Free &middot; no account required &middot; no obligation"
          />
        </div>
      </section>

      {/* Existing registry index */}
      <div className="mx-auto max-w-content px-6 pb-12">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Associations" }]} />
        <h1 className="font-serif font-black text-[28px] mt-3 mb-1 text-navy">
          Community Associations
        </h1>
        <p className="text-mut text-sm mb-5">
          37,159 registered Florida community associations. Search by name or browse
          a county.
        </p>
        <div className="mb-8">
          <SearchBox variant="plain" />
        </div>

        <div className="grid gap-3">
          {associations.map((a) => (
            <Link
              key={`${a.county}-${a.slug}`}
              href={`/associations/${slugify(a.county)}/${a.slug}`}
              className="flex items-center justify-between gap-3 bg-white border border-line rounded-lg px-4 py-3 no-underline text-ink hover:border-navy"
            >
              <span>
                <span className="block font-semibold text-navy">{a.name}</span>
                <span className="block text-xs text-mut">
                  {a.city}, FL · {a.county} County · {a.sourceType}
                </span>
              </span>
              {a.secondaryStatus === "Delinquent" ? (
                <Badge tone="warn">Delinquent</Badge>
              ) : (
                <Badge tone="ok">{a.primaryStatus}</Badge>
              )}
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
