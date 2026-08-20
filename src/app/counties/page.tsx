import Link from "next/link";
import { getCounties } from "@/lib/data";
import { Breadcrumbs } from "@/components/ui";

export const metadata = { title: "Florida Counties — Community Association Records" };
export const revalidate = 3600;

export default async function CountiesIndex() {
  const counties = await getCounties();
  return (
    <div className="mx-auto max-w-content px-6 pb-12">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Counties" }]} />
      <h1 className="font-serif font-black text-[28px] mt-3 mb-1 text-navy">Florida Counties</h1>
      <p className="text-mut text-sm mb-5">
        Community association records across all 67 Florida counties.
      </p>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
        {counties.map((c) => (
          <Link key={c.slug} href={`/counties/${c.slug}`} className="flex items-center justify-between bg-white border border-line rounded-lg px-4 py-3 no-underline text-ink hover:border-navy">
            <span className="font-semibold text-navy">{c.name} County</span>
            <span className="font-mono text-xs text-mut">{c.associationCount.toLocaleString()}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
