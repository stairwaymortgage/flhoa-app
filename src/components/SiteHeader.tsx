import Link from "next/link";
import { FloridaSeal } from "./FloridaSeal";
import { AS_OF_DATE } from "@/lib/status";

const NAV = [
  { label: "Associations", href: "/associations" },
  { label: "Management Firms", href: "/managers/firms" },
  { label: "Licensed Managers", href: "/managers/cam" },
  { label: "Developers", href: "/developers" },
  { label: "Counties", href: "/counties" },
  { label: "Resources", href: "/resources" },
  { label: "Verify a License", href: "/verify" },
];

export function SiteHeader() {
  return (
    <>
      {/* Official top bar */}
      <div className="bg-navy-dark text-[#C8D4E0] text-xs">
        <div className="mx-auto max-w-content px-6 py-[7px] flex justify-between flex-wrap gap-2">
          <span>
            An independent public-records directory · Data sourced from{" "}
            <b className="text-white">Florida DBPR</b> official records
          </span>
          <span>
            Last updated: <b className="text-white">{AS_OF_DATE}</b>
          </span>
        </div>
      </div>

      {/* Masthead */}
      <header className="bg-navy text-white">
        <div className="mx-auto max-w-content px-6 py-4 flex items-center gap-4">
          <Link href="/" className="flex items-center gap-4 no-underline text-white">
            <FloridaSeal />
            <span>
              <span className="block font-serif font-black text-[21px] leading-none">
                Florida HOA Registry
              </span>
              <span className="block text-[10px] tracking-[0.14em] uppercase text-[#A9BDD1] mt-1">
                Community Association Public Records · flhoaregistry.com
              </span>
            </span>
          </Link>
        </div>
      </header>

      {/* Clean official nav — no sales language */}
      <nav className="bg-white border-b-[3px] border-gold">
        <div className="mx-auto max-w-content px-6 flex overflow-x-auto">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-semibold text-navy no-underline px-5 py-[13px] border-b-[3px] border-transparent -mb-[3px] whitespace-nowrap hover:border-navy hover:bg-paper"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
