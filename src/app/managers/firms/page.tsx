import Link from "next/link";
import { getFirms } from "@/lib/data";
import { Breadcrumbs, Badge } from "@/components/ui";
import { SearchBox } from "@/components/SearchBox";

export const metadata = { title: "Florida Community Association Management Firms" };

export default function FirmsIndex() {
  const firms = getFirms();
  return (
    <div className="mx-auto max-w-content px-6 pb-12">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Management Firms" }]} />
      <h1 className="font-serif font-black text-[28px] mt-3 mb-1 text-navy">Management Firms</h1>
      <p className="text-mut text-sm mb-5">
        32,599 licensed Community Association Business (CAB) firms statewide. Verify a license by name.
      </p>
      <div className="mb-8"><SearchBox variant="plain" /></div>
      <div className="grid gap-3">
        {firms.map((f) => (
          <Link key={f.slug} href={`/managers/firms/${f.slug}`} className="flex items-center justify-between gap-3 bg-white border border-line rounded-lg px-4 py-3 no-underline text-ink hover:border-navy">
            <span>
              <span className="block font-semibold text-navy">{f.name}</span>
              <span className="block text-xs text-mut">{f.licenseNumber} · {f.city}, {f.county} County</span>
            </span>
            <Badge tone="ok">{f.statusPlain}</Badge>
          </Link>
        ))}
      </div>
    </div>
  );
}
