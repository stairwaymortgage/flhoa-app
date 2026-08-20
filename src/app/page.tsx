import Link from "next/link";
import { SearchBox } from "@/components/SearchBox";
import { TOTALS, getCounties } from "@/lib/data";

export const revalidate = 3600;

const FAMILIES = [
  { icon: "🏘️", title: "Associations", desc: "Who runs your community, its registration status, and its compliance record.", count: "37,159 pages", href: "/associations" },
  { icon: "🪪", title: "Managers", desc: "Verify any management firm or community association manager's license.", count: "55,892 pages", href: "/managers/firms" },
  { icon: "🏗️", title: "Developers", desc: "See every project a developer has filed with the state — their full portfolio.", count: "15,766 pages", href: "/developers" },
];

export default async function Home() {
  const counties = await getCounties();
  return (
    <>
      <section className="bg-gradient-to-b from-navy to-navy-light text-white py-[52px] text-center">
        <div className="mx-auto max-w-content px-6">
          <h1 className="font-serif font-black text-[clamp(26px,3.8vw,38px)] max-w-[780px] mx-auto mb-2.5 leading-tight">
            Search Florida&apos;s Community Association Records
          </h1>
          <p className="text-[#C8D4E0] max-w-[640px] mx-auto mb-7 text-base">
            {TOTALS.associations.toLocaleString()} registered associations ·{" "}
            {TOTALS.firms.toLocaleString()} management firms · {TOTALS.cams.toLocaleString()} licensed
            managers · {TOTALS.developers.toLocaleString()} developers — registration status,
            licenses, and compliance facts from state records.
          </p>
          <SearchBox variant="hero" />
          <div className="flex justify-center gap-[34px] mt-[26px] flex-wrap">
            {[
              ["37,159", "Associations"],
              ["55,892", "Firms & CAMs"],
              ["15,766", "Developers"],
              ["67", "Counties"],
            ].map(([n, l]) => (
              <div key={l} className="text-xs text-[#A9BDD1] uppercase tracking-[0.08em]">
                <strong className="block font-mono text-[22px] text-white font-medium">{n}</strong>
                {l}
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-content px-6">
        <div className="grid md:grid-cols-3 gap-5 my-14">
          {FAMILIES.map((f) => (
            <Link key={f.href} href={f.href} className="relative bg-white border border-line rounded-[20px] p-[26px] no-underline text-ink transition hover:-translate-y-[3px] hover:shadow-[0_14px_34px_rgba(0,38,77,0.10)] hover:border-navy">
              <div className="w-11 h-11 rounded-xl bg-[#EDF2FA] flex items-center justify-center text-xl mb-3.5">{f.icon}</div>
              <h3 className="font-serif text-[19px] font-bold mb-1.5 text-navy">{f.title}</h3>
              <p className="text-sm text-mut">{f.desc}</p>
              <span className="inline-block mt-3.5 text-xs font-bold text-navy bg-[#EDF2FA] rounded-full px-3 py-1">{f.count}</span>
            </Link>
          ))}
        </div>

        <section className="mb-16">
          <h2 className="font-serif text-[22px] font-bold mb-4 text-navy">Browse by county</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
            {counties.map((c) => (
              <Link key={c.slug} href={`/counties/${c.slug}`} className="flex items-center justify-between bg-white border border-line rounded-lg px-4 py-3 no-underline text-ink hover:border-navy">
                <span className="font-semibold text-navy">{c.name} County</span>
                <span className="font-mono text-xs text-mut">{c.associationCount.toLocaleString()}</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
