import Link from "next/link";
import { DATA_SOURCE } from "@/lib/status";

const AUDIENCE_LINKS = [
  { label: "Buyers", href: "/buyers" },
  { label: "Preconstruction", href: "/preconstruction" },
  { label: "Sellers", href: "/sellers" },
  { label: "Foreign Buyers", href: "/foreign-buyers" },
  { label: "For Boards", href: "/for-boards" },
];

const DIRECTORY_LINKS = [
  { label: "Associations", href: "/associations" },
  { label: "Management Firms", href: "/managers/firms" },
  { label: "Licensed Managers", href: "/managers/cam" },
  { label: "Developers", href: "/developers" },
];

const RESOURCE_LINKS = [
  { label: "Counties", href: "/counties" },
  { label: "Resources", href: "/resources" },
  { label: "Verify a License", href: "/verify" },
  { label: "Corrections", href: "/corrections" },
];

export function SiteFooter() {
  return (
    <footer className="bg-navy-dark text-[#A9BDD1] text-xs mt-8">
      <div className="mx-auto max-w-content px-6 pt-8 pb-10">
        {/* Link columns */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-8">
          <div>
            <div className="text-[10px] font-bold tracking-[0.1em] uppercase text-[#6B8399] mb-3">
              Get Connected
            </div>
            {AUDIENCE_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block text-[#C8D4E0] no-underline py-1 hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div>
            <div className="text-[10px] font-bold tracking-[0.1em] uppercase text-[#6B8399] mb-3">
              Directory
            </div>
            {DIRECTORY_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block text-[#C8D4E0] no-underline py-1 hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div>
            <div className="text-[10px] font-bold tracking-[0.1em] uppercase text-[#6B8399] mb-3">
              Resources
            </div>
            {RESOURCE_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block text-[#C8D4E0] no-underline py-1 hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div>
            <div className="text-[10px] font-bold tracking-[0.1em] uppercase text-[#6B8399] mb-3">
              Counties
            </div>
            {["Miami-Dade", "Broward", "Palm Beach", "Hillsborough", "Orange", "Pinellas"].map(
              (county) => (
                <Link
                  key={county}
                  href={`/counties/${county.toLowerCase().replace(/\s+/g, "-")}`}
                  className="block text-[#C8D4E0] no-underline py-1 hover:text-white"
                >
                  {county}
                </Link>
              )
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[#1a3d5c] pt-5 flex justify-between flex-wrap gap-3">
          <span>
            © 2026 flhoaregistry.com · An independent directory of Florida
            public records
          </span>
          <span>
            Data: {DATA_SOURCE} · Not affiliated with the State of Florida
          </span>
        </div>
      </div>
    </footer>
  );
}
