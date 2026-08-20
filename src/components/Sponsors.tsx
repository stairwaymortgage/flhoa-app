import Image from "next/image";
import { InquireButton } from "./InquireButton";
import type { LeadIntent, LeadSponsor } from "./LeadModal";

// Entity context threaded from the record page so a lead records which
// registry record it came from.
export interface SponsorContext {
  entityType?: string;
  entityName?: string;
  entitySlug?: string;
}

// Sponsor units. Final banner creative is designed separately; these lock in the
// slot positions and the enforced "Sponsored" labeling.

// Default sponsor identities rendered on every record page. Record pages import
// these so the two names stay in one place. `initials` is the fallback avatar
// used if the headshot is missing.
export const REALTOR_SPONSOR = {
  sponsor: "realtor" as LeadSponsor,
  initials: "OB",
  name: "Olga Blackburn, Realtor®",
  photo: "/sponsors/olga.jpeg",
  specialty: "South Florida real estate specialist",
  license: "FL Lic. SL3569153 · The Keyes Company",
  phone: "786-225-5654",
  phoneNote: "(786-CALL-OLG)",
  website: "https://www.olgablackburn.com/",
};

export const LENDER_SPONSOR = {
  sponsor: "lender" as LeadSponsor,
  initials: "JB",
  name: "Jim Blackburn",
  photo: "/sponsors/jim.jpeg",
  specialty: "South Florida lending specialist",
  license: "NMLS #1072866 · Equal Housing Lender · Stairway Mortgage",
  phone: "(954) 993-1625",
  website: "https://jamesjblackburn.com/",
};

export function LeaderboardBanner({
  title, sub, intent = "inquiry", sponsor = "general", entityType, entityName, entitySlug,
}: {
  title: string;
  sub: string;
  intent?: LeadIntent;
  sponsor?: LeadSponsor;
} & SponsorContext) {
  return (
    <div className="relative mt-[18px] border border-line rounded-lg bg-gradient-to-r from-navy to-navy-light text-white flex items-center justify-between gap-4 px-[22px] py-4 flex-wrap">
      <span className="absolute -top-[9px] left-3.5 bg-paper border border-line rounded-[3px] text-mut text-[9px] font-bold tracking-[0.12em] uppercase px-2 py-px">
        Sponsored
      </span>
      <div>
        <b className="font-serif text-base">{title}</b>
        <span className="block text-[13px] text-[#C8D4E0]">{sub}</span>
      </div>
      <InquireButton
        intent={intent}
        sponsor={sponsor}
        entityType={entityType}
        entityName={entityName}
        entitySlug={entitySlug}
        className="bg-gold text-navy-dark font-bold text-[13px] no-underline px-5 py-2.5 rounded-[5px] whitespace-nowrap"
      />
    </div>
  );
}

export function InlineBanner({
  title, sub, intent = "inquiry", sponsor = "general", entityType, entityName, entitySlug,
}: {
  title: string;
  sub: string;
  intent?: LeadIntent;
  sponsor?: LeadSponsor;
} & SponsorContext) {
  return (
    <div className="relative px-[26px] py-4 bg-gold-light border-b border-line flex items-center justify-between gap-3.5 flex-wrap">
      <span className="absolute top-1.5 right-2.5 text-[#9A8A4F] text-[9px] font-bold tracking-[0.12em] uppercase">
        Sponsored
      </span>
      <div>
        <b className="text-sm text-navy-dark">{title}</b>
        <span className="block text-[13px] text-mut">{sub}</span>
      </div>
      <InquireButton
        intent={intent}
        sponsor={sponsor}
        entityType={entityType}
        entityName={entityName}
        entitySlug={entitySlug}
        className="bg-navy text-white font-bold text-[13px] no-underline px-[18px] py-[9px] rounded-[5px] whitespace-nowrap"
      />
    </div>
  );
}

export function SidebarBox({
  label, children,
}: { label: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-line rounded-lg mb-4 overflow-hidden">
      <h5 className="text-[10px] font-bold tracking-[0.12em] uppercase text-mut px-4 py-[9px] border-b border-line bg-paper">
        {label}
      </h5>
      {children}
    </div>
  );
}

// Strip formatting to a dialable tel: target, adding the US country code when
// the number is a bare 10-digit one.
function telHref(phone: string): string {
  const digits = phone.replace(/[^0-9]/g, "");
  return `tel:${digits.length === 10 ? `+1${digits}` : digits}`;
}

// Display form of a sponsor URL — no scheme, no trailing slash.
function displayUrl(url: string): string {
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

export function SponsorCard({
  initials, name, tag, photo, specialty, license, phone, phoneNote, website, gold = false,
  sponsor = "general", entityType, entityName, entitySlug,
}: {
  initials?: string;
  name: string;
  tag?: string;
  photo?: string;
  specialty?: string;
  license?: string;
  phone?: string;
  phoneNote?: string;
  website?: string;
  gold?: boolean;
  sponsor?: LeadSponsor;
} & SponsorContext) {
  const subtitle = specialty ?? tag;
  return (
    <div className="p-[15px]">
      <div className="flex gap-3 items-center">
        {photo ? (
          <Image
            src={photo}
            alt={name}
            width={72}
            height={72}
            sizes="72px"
            // Sidebar sponsor art is always below the fold: explicit dimensions
            // reserve the box (no CLS) while the fetch stays lazy.
            priority={false}
            loading="lazy"
            className="w-[72px] h-[72px] rounded-lg object-cover shrink-0"
          />
        ) : (
          <span
            className={`w-[42px] h-[42px] rounded-full flex items-center justify-center font-bold text-[15px] shrink-0 ${
              gold ? "bg-gold text-navy-dark" : "bg-navy text-white"
            }`}
          >
            {initials}
          </span>
        )}
        <span>
          <b className="text-[13.5px] block">{name}</b>
          {subtitle && <span className="text-xs text-mut">{subtitle}</span>}
        </span>
      </div>

      {license && <p className="text-[11px] text-mut mt-2.5 leading-snug">{license}</p>}

      {phone && (
        <p className="text-[13px] mt-2">
          <a href={telHref(phone)} className="font-bold no-underline">
            {phone}
          </a>
          {phoneNote && <span className="text-mut"> {phoneNote}</span>}
        </p>
      )}

      {website && (
        <a
          href={website}
          target="_blank"
          rel="noopener"
          className="block text-[12.5px] mt-1 no-underline text-navy-light"
        >
          {displayUrl(website)}
        </a>
      )}

      <InquireButton
        intent="inquiry"
        sponsor={sponsor}
        entityType={entityType}
        entityName={entityName}
        entitySlug={entitySlug}
        className={`block w-full mt-[11px] text-center font-bold text-[13px] no-underline rounded-[5px] py-[9px] ${
          gold ? "bg-gold text-navy-dark" : "bg-navy text-white"
        }`}
      />
    </div>
  );
}

export function ClaimBox({ children }: { children: React.ReactNode }) {
  return <div className="p-4 text-[12.5px] text-mut">{children}</div>;
}

export function SidebarLinks({ links }: { links: { label: string; href: string }[] }) {
  return (
    <div className="px-4 pt-2 pb-3">
      {links.map((l, i) => (
        <a
          key={i}
          href={l.href}
          className="block text-[13px] py-[6px] no-underline text-navy-light border-b border-dashed border-line last:border-b-0"
        >
          {l.label}
        </a>
      ))}
    </div>
  );
}
