// Placeholder sponsor units. Final banner creative is designed separately;
// these lock in the slot positions and the enforced "Sponsored" labeling.

export function LeaderboardBanner({
  title, sub,
}: { title: string; sub: string }) {
  return (
    <div className="relative mt-[18px] border border-line rounded-lg bg-gradient-to-r from-navy to-navy-light text-white flex items-center justify-between gap-4 px-[22px] py-4 flex-wrap">
      <span className="absolute -top-[9px] left-3.5 bg-paper border border-line rounded-[3px] text-mut text-[9px] font-bold tracking-[0.12em] uppercase px-2 py-px">
        Sponsored
      </span>
      <div>
        <b className="font-serif text-base">{title}</b>
        <span className="block text-[13px] text-[#C8D4E0]">{sub}</span>
      </div>
      <a href="#inquire" className="bg-gold text-navy-dark font-bold text-[13px] no-underline px-5 py-2.5 rounded-[5px] whitespace-nowrap">
        Inquire Now
      </a>
    </div>
  );
}

export function InlineBanner({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="relative px-[26px] py-4 bg-gold-light border-b border-line flex items-center justify-between gap-3.5 flex-wrap">
      <span className="absolute top-1.5 right-2.5 text-[#9A8A4F] text-[9px] font-bold tracking-[0.12em] uppercase">
        Sponsored
      </span>
      <div>
        <b className="text-sm text-navy-dark">{title}</b>
        <span className="block text-[13px] text-mut">{sub}</span>
      </div>
      <a href="#inquire" className="bg-navy text-white font-bold text-[13px] no-underline px-[18px] py-[9px] rounded-[5px] whitespace-nowrap">
        Inquire Now
      </a>
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

export function SponsorCard({
  initials, name, tag, gold = false,
}: { initials: string; name: string; tag: string; gold?: boolean }) {
  return (
    <div className="p-[15px]">
      <div className="flex gap-3 items-center">
        <span
          className={`w-[42px] h-[42px] rounded-full flex items-center justify-center font-bold text-[15px] shrink-0 ${
            gold ? "bg-gold text-navy-dark" : "bg-navy text-white"
          }`}
        >
          {initials}
        </span>
        <span>
          <b className="text-[13.5px] block">{name}</b>
          <span className="text-xs text-mut">{tag}</span>
        </span>
      </div>
      <a
        href="#inquire"
        className={`block mt-[11px] text-center font-bold text-[13px] no-underline rounded-[5px] py-[9px] ${
          gold ? "bg-gold text-navy-dark" : "bg-navy text-white"
        }`}
      >
        Inquire Now
      </a>
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
