import { absoluteUrl } from "@/lib/site";
import Link from "next/link";
import { getDevelopersSample } from "@/lib/data";
import { Breadcrumbs } from "@/components/ui";
import { SearchBox } from "@/components/SearchBox";

export const metadata = {
  title: "Florida Community Association Developers",
  description:
    "Browse 15,764 developers who filed community association projects with the State of Florida. See each developer's full project portfolio from state public records.",
  alternates: { canonical: absoluteUrl("/developers") },
};
export const revalidate = 3600;

export default async function DevelopersIndex() {
  const devs = await getDevelopersSample();
  return (
    <div className="mx-auto max-w-content px-6 pb-12">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Developers" }]} />
      <h1 className="font-serif font-black text-[28px] mt-3 mb-1 text-navy">Developers</h1>
      <p className="text-mut text-sm mb-5">
        15,766 developers who filed community projects with the state. Search by name.
      </p>
      <div className="mb-8"><SearchBox variant="plain" /></div>
      <div className="grid gap-3">
        {devs.map((d) => (
          <Link key={d.slug} href={`/developers/${d.slug}`} className="flex items-center justify-between gap-3 bg-white border border-line rounded-lg px-4 py-3 no-underline text-ink hover:border-navy">
            <span>
              <span className="block font-semibold text-navy">{d.name}</span>
              <span className="block text-xs text-mut">{d.projectsFiled} projects · {d.countiesCount} counties</span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
