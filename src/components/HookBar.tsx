interface Hook {
  title: string;
  sub: string;
  href?: string;
}

export function HookBar({
  heading = "Are you connected to this community?",
  hooks,
}: { heading?: string; hooks: Hook[] }) {
  return (
    <div className="px-[26px] py-5 bg-gradient-to-b from-[#F7F9FC] to-[#EEF3F8]">
      <h4 className="font-serif text-base font-bold text-navy mb-1">{heading}</h4>
      <p className="text-[13px] text-mut mb-3">
        Free resources based on your situation — provided by the registry&apos;s licensed real
        estate &amp; lending partners.
      </p>
      <div className={`grid gap-3 ${hooks.length === 2 ? "md:grid-cols-2" : "md:grid-cols-3"}`}>
        {hooks.map((h, i) => (
          <a
            key={i}
            href={h.href ?? "#inquire"}
            className="block bg-white border border-line border-l-4 border-l-navy rounded-md px-4 py-[13px] no-underline text-ink transition hover:border-l-gold hover:shadow-[0_6px_16px_rgba(0,38,77,0.12)]"
          >
            <b className="block text-sm text-navy">{h.title}</b>
            <span className="block text-xs text-mut mt-[3px]">{h.sub}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
