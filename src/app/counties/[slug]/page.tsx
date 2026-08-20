import Link from "next/link";
import { notFound } from "next/navigation";
import { getCounty, getCounties } from "@/lib/data";
import { Breadcrumbs } from "@/components/ui";
import { LeaderboardBanner } from "@/components/Sponsors";
import { JsonLd, breadcrumbList } from "@/components/JsonLd";
import { absoluteUrl } from "@/lib/site";
import type { Metadata } from "next";

export const dynamicParams = true;
export const revalidate = 86400;

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const c = await getCounty(params.slug);
  if (!c) return { title: "County Not Found" };
  const path = `/counties/${params.slug}`;
  const title = `${c.name} County Community Associations & Managers`;
  const description = `${c.associationCount.toLocaleString()} registered community associations and ${c.firmCount.toLocaleString()} managing entities on file in ${c.name} County, Florida. Browse every city and verify a record against state public records.`;
  return {
    title,
    description,
    alternates: { canonical: absoluteUrl(path) },
    openGraph: { title, description, url: absoluteUrl(path) },
    twitter: { card: "summary", title, description },
  };
}

export async function generateStaticParams() {
  const counties = await getCounties();
  return counties.map((c) => ({ slug: c.slug }));
}

export default async function CountyHub({ params }: { params: { slug: string } }) {
  const c = await getCounty(params.slug);
  if (!c) notFound();

  return (
    <div className="mx-auto max-w-content px-6 pb-12">
      <JsonLd
        data={breadcrumbList([
          { name: "Home", path: "/" },
          { name: "Counties", path: "/counties" },
          { name: `${c.name} County`, path: `/counties/${c.slug}` },
        ])}
      />
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Counties", href: "/counties" },
          { label: `${c.name} County` },
        ]}
      />
      <h1 className="font-serif font-black text-[28px] mt-3 mb-1 text-navy">{c.name} County</h1>
      <p className="text-mut text-sm mb-4">
        {c.associationCount.toLocaleString()} registered associations ·{" "}
        {c.firmCount.toLocaleString()} managing entities on file.
      </p>

      <LeaderboardBanner
        title={`Real estate & lending in ${c.name} County`}
        sub="Connect with a licensed local partner for financing or a home-value report."
      />

      {/* Full city directory — the local-SEO backbone */}
      <section className="mt-8">
        <h2 className="font-serif text-[20px] font-bold mb-3 text-navy">Cities in {c.name} County</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
          {c.cities.map((city) => (
            <Link
              key={city.slug}
              href={`/associations/${c.slug}/city/${city.slug}`}
              className="flex items-center justify-between bg-white border border-line rounded-lg px-4 py-3 no-underline text-ink hover:border-navy"
            >
              <span className="font-semibold text-navy">{city.name}</span>
              <span className="font-mono text-xs text-mut">{city.associationCount.toLocaleString()}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="font-serif text-[20px] font-bold mb-3 text-navy">Explore {c.name} County</h2>
        <div className="grid sm:grid-cols-3 gap-3">
          <Link href="/associations" className="bg-white border border-line rounded-lg px-4 py-3 no-underline text-navy font-semibold hover:border-navy">Associations →</Link>
          <Link href="/managers/firms" className="bg-white border border-line rounded-lg px-4 py-3 no-underline text-navy font-semibold hover:border-navy">Management firms →</Link>
          <Link href="/developers" className="bg-white border border-line rounded-lg px-4 py-3 no-underline text-navy font-semibold hover:border-navy">Developers →</Link>
        </div>
      </section>
    </div>
  );
}
