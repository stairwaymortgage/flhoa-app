import Link from "next/link";
import { notFound } from "next/navigation";
import { getAssociations, getAssociationsByCity, slug as slugify } from "@/lib/data";
import { Breadcrumbs, Badge } from "@/components/ui";
import { LeaderboardBanner } from "@/components/Sponsors";

export function generateStaticParams() {
  const seen = new Set<string>();
  const out: { county: string; city: string }[] = [];
  for (const a of getAssociations()) {
    const key = `${slugify(a.county)}|${a.citySlug}`;
    if (!seen.has(key)) {
      seen.add(key);
      out.push({ county: slugify(a.county), city: a.citySlug });
    }
  }
  return out;
}

export default function CityHub({ params }: { params: { county: string; city: string } }) {
  const list = getAssociationsByCity(params.county, params.city);
  if (list.length === 0) notFound();
  const cityName = list[0].city;
  const countyName = list[0].county;

  return (
    <div className="mx-auto max-w-content px-6 pb-12">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Associations", href: "/associations" },
          { label: `${countyName} County`, href: `/counties/${params.county}` },
          { label: cityName },
        ]}
      />
      <h1 className="font-serif font-black text-[28px] mt-3 mb-1 text-navy">
        Community Associations in {cityName}, FL
      </h1>
      <p className="text-mut text-sm mb-4">
        {list.length} registered {list.length === 1 ? "association" : "associations"} in {cityName},
        {" "}{countyName} County.
      </p>

      <LeaderboardBanner
        title={`Buying or selling in ${cityName}?`}
        sub="Get a local financing & home-value readout from a licensed partner."
      />

      <div className="grid gap-3 mt-6">
        {list.map((a) => (
          <Link
            key={a.slug}
            href={`/associations/${params.county}/${a.slug}`}
            className="flex items-center justify-between gap-3 bg-white border border-line rounded-lg px-4 py-3 no-underline text-ink hover:border-navy"
          >
            <span>
              <span className="block font-semibold text-navy">{a.name}</span>
              <span className="block text-xs text-mut">{a.sourceType} · {a.units ?? "—"} units</span>
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
  );
}
