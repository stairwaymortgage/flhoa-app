import Link from "next/link";
import { SubSection } from "./ui";
import { AS_OF_DATE } from "@/lib/status";
import { correctionHref } from "@/lib/corrections";
import type { ComplianceRecord, RecertCase, RegistryRecord } from "@/lib/types";

// Compliance & inspection facts drawn from the state registry: filing status,
// deadlines, and case numbers as recorded. Nothing here interprets a community's
// finances or condition — no reserve or financial data is carried by any of
// these sources.

function FactRow({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-[7px] border-b border-dashed border-line last:border-b-0">
      <span className="text-[13px] text-mut">{k}</span>
      <span className="text-[13px] font-semibold text-right">{v}</span>
    </div>
  );
}

export function ComplianceSection({
  compliance,
  recerts,
  registry,
  entityName,
  entitySlug,
  pageUrl,
}: {
  compliance?: ComplianceRecord;
  recerts: RecertCase[];
  registry?: RegistryRecord;
  entityName: string;
  entitySlug: string;
  pageUrl: string;
}) {
  // Render nothing at all when the record has no enrichment match.
  if (!compliance && !registry && recerts.length === 0) return null;

  return (
    <SubSection title="Compliance & Inspection Record">
      {compliance && (
        <div className="mb-3">
          <FactRow k="Milestone compliance status" v={compliance.status || "—"} />
          <FactRow k="Next filing deadline" v={compliance.nextDeadline || "—"} />
        </div>
      )}

      {registry && (
        <div className="mb-3">
          <FactRow k="Registration status" v={registry.registrationStatus || "—"} />
          <FactRow k="Enforcement status" v={registry.enforcementStatus || "—"} />
          {registry.registrationNumber && (
            <FactRow
              k="Registration no."
              v={<span className="font-mono text-xs">{registry.registrationNumber}</span>}
            />
          )}
        </div>
      )}

      {recerts.length > 0 && (
        <div className="mb-2">
          <h5 className="text-[10px] font-bold tracking-[0.1em] uppercase text-mut mb-1.5">
            Recertification Cases
          </h5>
          <table className="w-full text-[13.5px]">
            <thead>
              <tr className="text-left text-[10px] font-bold tracking-[0.1em] uppercase text-mut">
                <th className="py-2 pr-2 border-b-2 border-line">Case No.</th>
                <th className="py-2 px-2 border-b-2 border-line">Year</th>
                <th className="py-2 px-2 border-b-2 border-line">Case Status</th>
                <th className="py-2 pl-2 border-b-2 border-line">Enforcement</th>
              </tr>
            </thead>
            <tbody>
              {recerts.map((r) => (
                <tr key={r.caseNumber}>
                  <td className="py-2.5 pr-2 border-b border-line font-mono text-xs">
                    {r.caseNumber}
                  </td>
                  <td className="py-2.5 px-2 border-b border-line">{r.recertYear || "—"}</td>
                  <td className="py-2.5 px-2 border-b border-line">{r.caseStatus || "—"}</td>
                  <td className="py-2.5 pl-2 border-b border-line">{r.enforcementStatus || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-mut mt-1.5">
        Source: Florida DBPR, as of {AS_OF_DATE} ·{" "}
        <Link
          href={correctionHref({
            type: "association",
            entity: entityName,
            url: pageUrl,
            slug: entitySlug,
          })}
          className="text-navy-light"
        >
          Request a correction
        </Link>
      </p>
    </SubSection>
  );
}
