import Link from "next/link";
import { getCamsSample } from "@/lib/data";
import { Breadcrumbs, Badge } from "@/components/ui";
import { SearchBox } from "@/components/SearchBox";

export const metadata = { title: "Florida Licensed Community Association Managers (CAMs)" };
export const revalidate = 3600;

export default async function CamIndex() {
  const cams = await getCamsSample();
  return (
    <div className="mx-auto max-w-content px-6 pb-12">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Licensed Managers" }]} />
      <h1 className="font-serif font-black text-[28px] mt-3 mb-1 text-navy">Licensed Managers (CAMs)</h1>
      <p className="text-mut text-sm mb-5">
        23,293 licensed Community Association Managers statewide. Verify a license by name.
      </p>
      <div className="mb-8"><SearchBox variant="plain" /></div>
      <div className="grid gap-3">
        {cams.map((c) => (
          <Link key={c.slug} href={`/managers/cam/${c.slug}`} className="flex items-center justify-between gap-3 bg-white border border-line rounded-lg px-4 py-3 no-underline text-ink hover:border-navy">
            <span>
              <span className="block font-semibold text-navy">{c.name}</span>
              <span className="block text-xs text-mut">{c.licenseNumber} · {c.city}, FL</span>
            </span>
            <Badge tone="ok">Active</Badge>
          </Link>
        ))}
      </div>
    </div>
  );
}
