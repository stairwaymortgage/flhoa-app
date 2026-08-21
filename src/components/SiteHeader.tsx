"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { FloridaSeal } from "./FloridaSeal";
import { AS_OF_DATE } from "@/lib/status";

const AUDIENCE_NAV = [
  { label: "Buyers", href: "/buyers" },
  { label: "Preconstruction", href: "/preconstruction" },
  { label: "Sellers", href: "/sellers" },
  { label: "Foreign Buyers", href: "/foreign-buyers" },
  { label: "For Boards", href: "/for-boards" },
];

const DIRECTORY_ITEMS = [
  { label: "Search Associations", href: "/associations" },
  { label: "Management Firms", href: "/managers/firms" },
  { label: "Licensed Managers", href: "/managers/cam" },
  { label: "Developers", href: "/developers" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [dirOpen, setDirOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  const linkClass = (href: string) =>
    `text-sm font-semibold no-underline px-5 py-[13px] border-b-[3px] -mb-[3px] whitespace-nowrap transition-colors ${
      isActive(href)
        ? "text-navy border-navy bg-paper"
        : "text-navy border-transparent hover:border-navy hover:bg-paper"
    }`;

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
        <div className="mx-auto max-w-content px-6 py-4 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="flex items-center gap-4 no-underline text-white"
          >
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

          {/* Mobile hamburger */}
          <button
            type="button"
            className="md:hidden text-white p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              {mobileOpen ? (
                <path
                  d="M6 6l12 12M6 18L18 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              ) : (
                <path
                  d="M4 7h16M4 12h16M4 17h16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              )}
            </svg>
          </button>
        </div>
      </header>

      {/* Desktop nav */}
      <nav className="bg-white border-b-[3px] border-gold hidden md:block">
        <div className="mx-auto max-w-content px-6 flex items-stretch">
          {AUDIENCE_NAV.map((item) => (
            <Link key={item.href} href={item.href} className={linkClass(item.href)}>
              {item.label}
            </Link>
          ))}

          {/* Directory dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setDirOpen(true)}
            onMouseLeave={() => setDirOpen(false)}
          >
            <button
              type="button"
              className={`text-sm font-semibold px-5 py-[13px] border-b-[3px] -mb-[3px] whitespace-nowrap transition-colors inline-flex items-center gap-1.5 ${
                DIRECTORY_ITEMS.some((d) => isActive(d.href))
                  ? "text-navy border-navy bg-paper"
                  : "text-navy border-transparent hover:border-navy hover:bg-paper"
              }`}
              onClick={() => setDirOpen(!dirOpen)}
              aria-expanded={dirOpen}
            >
              Directory
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                className={`transition-transform ${dirOpen ? "rotate-180" : ""}`}
              >
                <path
                  d="M3 4.5l3 3 3-3"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            {dirOpen && (
              <div className="absolute top-full left-0 bg-white border border-line rounded-b-lg shadow-lg min-w-[220px] py-1 z-30">
                {DIRECTORY_ITEMS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block px-5 py-2.5 text-sm text-navy no-underline hover:bg-paper font-medium"
                    onClick={() => setDirOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link href="/verify" className={linkClass("/verify")}>
            Verify a License
          </Link>
        </div>
      </nav>

      {/* Mobile nav */}
      {mobileOpen && (
        <nav className="md:hidden bg-white border-b-[3px] border-gold">
          <div className="px-4 py-2">
            {AUDIENCE_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block py-3 px-3 text-sm font-semibold no-underline rounded ${
                  isActive(item.href)
                    ? "text-navy bg-paper"
                    : "text-navy hover:bg-paper"
                }`}
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="border-t border-line my-1" />
            <div className="px-3 py-2 text-[10px] font-bold tracking-[0.1em] uppercase text-mut">
              Directory
            </div>
            {DIRECTORY_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block py-2.5 px-3 text-sm text-navy no-underline hover:bg-paper"
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="border-t border-line my-1" />
            <Link
              href="/verify"
              className="block py-3 px-3 text-sm font-semibold text-navy no-underline hover:bg-paper"
              onClick={() => setMobileOpen(false)}
            >
              Verify a License
            </Link>
          </div>
        </nav>
      )}
    </>
  );
}
