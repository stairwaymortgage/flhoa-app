import Link from "next/link";
import { notFound } from "next/navigation";
import { getAssociationsByCity, getCityAssociationCount } from "@/lib/data";
import { Breadcrumbs, Badge } from "@/components/ui";
import { LeaderboardBanner } from "@/components/Sponsors";
import { JsonLd, breadcrumbList } from "@/components/JsonLd";
import { absoluteUrl } from "@/lib/site";
import type { Metadata } from "next";

export const dynamicParams = true;
export const revalidate = 86400;

export async function generateMetadata({
  params,
}: {
  params: { county: string; city: string };
}): Promise<Metadata> {
  const [list, total] = await Promise.all([
    getAssociationsByCity(params.county, params.city),
    getCityAssociationCount(params.county, params.city),
  ]);
  if (list.length === 0) return { title: "City Not Found" };
  const cityName = list[0].city;
  const countyName = list[0].county;
  const count = total ?? list.length;
  const path = `/associations/${params.county}/city/${params.city}`;
  const title = `Community Associations in ${cityName}, FL`;
  const description = `${count.toLocaleString()} registered community ${count === 1 ? "association" : "associations"} in ${cityName}, ${countyName} County, Florida. Registration status, unit counts, and managing entities from state public records.`;
  return {
    title,
    description,
    alternates: { canonical: absoluteUrl(path) },
    openGraph: { title, description, url: absoluteUrl(path) },
    twitter: { card: "summary", title, description },
  };
}

export function generateStaticParams() {
  // City hubs are rendered on demand and cached by ISR.
  return [];
}

export default async function CityHub({ params }: { params: { county: string; city: string } }) {
  const [list, total] = await Promise.all([
    getAssociationsByCity(params.county, params.city),
    getCityAssociationCount(params.county, params.city),
  ]);
  if (list.length === 0) notFound();
  // getAssociationsByCity caps at 500 rows; quote the registry count, not the page size.
  const totalCount = total ?? list.length;
  const cityName = list[0].city;
  const countyName = list[0].county;

  return (
    <div className="mx-auto max-w-content px-6 pb-12">
      <JsonLd
        data={breadcrumbList([
          { name: "Home", path: "/" },
          { name: `${countyName} County`, path: `/counties/${params.county}` },
          { name: cityName, path: `/associations/${params.county}/city/${params.city}` },
        ])}
      />
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
        {totalCount.toLocaleString()} registered {totalCount === 1 ? "association" : "associations"} in{" "}
        {cityName}, {countyName} County
        {list.length < totalCount ? ` — showing the first ${list.length.toLocaleString()}` : ""}.
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
