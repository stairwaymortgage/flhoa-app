import Link from "next/link";
import { DATA_SOURCE, AS_OF_DATE } from "@/lib/status";
import { correctionHref } from "@/lib/corrections";

export function Badge({
  children, tone = "info",
}: { children: React.ReactNode; tone?: "ok" | "warn" | "info" }) {
  const tones = {
    ok: "text-ok border-ok bg-[#EDF7F1]",
    warn: "text-warn border-warn bg-[#FBF3E4]",
    info: "text-navy-light border-navy-light bg-[#EDF2FA]",
  };
  return (
    <span className={`text-xs font-bold rounded border px-3 py-[5px] ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <div className="text-xs text-mut pt-[18px]">
      {items.map((it, i) => (
        <span key={i}>
          {it.href ? (
            <Link href={it.href} className="no-underline text-navy-light">{it.label}</Link>
          ) : (
            <b className="text-ink">{it.label}</b>
          )}
          {i < items.length - 1 && " › "}
        </span>
      ))}
    </div>
  );
}

export function RecordShell({
  official, children,
}: { official: string; children: React.ReactNode }) {
  return (
    <article className="bg-white border border-line rounded-lg overflow-hidden">
      <div className="bg-navy text-white px-[26px] py-2 text-[11px] tracking-[0.12em] uppercase flex justify-between flex-wrap gap-1.5">
        <span className="text-[#A9BDD1]">{official}</span>
        <span className="text-[#A9BDD1]">Record as of {AS_OF_DATE}</span>
      </div>
      {children}
    </article>
  );
}

export function FactGrid({ items }: { items: { k: string; v: React.ReactNode; mono?: boolean }[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 border-b border-line">
      {items.map((it, i) => (
        <div key={i} className="px-[18px] py-[13px] border-r border-line last:border-r-0">
          <div className="text-[10px] font-bold tracking-[0.1em] uppercase text-mut">{it.k}</div>
          <div className={`text-[15px] font-semibold mt-[3px] ${it.mono ? "font-mono text-[13px] font-medium" : ""}`}>
            {it.v}
          </div>
        </div>
      ))}
    </div>
  );
}

export function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="px-[26px] py-4 border-b border-line">
      <h4 className="text-xs font-bold tracking-[0.1em] uppercase text-navy mb-2.5">{title}</h4>
      {children}
    </div>
  );
}

export function SourceNote({
  children, entityType, entityName, entitySlug, pageUrl,
}: {
  children?: React.ReactNode;
  entityType?: string;
  entityName?: string;
  entitySlug?: string;
  pageUrl?: string;
}) {
  // With a record identified, the correction form arrives prefilled.
  const href =
    entityType && entityName && pageUrl
      ? correctionHref({ type: entityType, entity: entityName, url: pageUrl, slug: entitySlug })
      : "/corrections";
  return (
    <div className="px-[26px] py-[11px] text-[11px] text-mut flex justify-between flex-wrap gap-1.5">
      <span>{children ?? `Data: ${DATA_SOURCE}`}</span>
      <span><Link href={href} className="text-navy-light">Request a correction</Link></span>
    </div>
  );
}
