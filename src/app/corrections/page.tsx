import { Suspense } from "react";
import { Breadcrumbs } from "@/components/ui";
import { CorrectionForm } from "@/components/CorrectionForm";
import { DATA_SOURCE, AS_OF_DATE } from "@/lib/status";

export const metadata = {
  title: "Request a Correction — Florida HOA Registry",
  description:
    "Report an error in a Florida community association, management firm, licensed manager, or developer record.",
};

export default function CorrectionsPage() {
  return (
    <div className="mx-auto max-w-[760px] px-6 pb-12">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Request a Correction" }]} />
      <h1 className="font-serif font-black text-[28px] mt-3 mb-1 text-navy">
        Request a Correction
      </h1>
      <p className="text-mut text-sm mb-6">
        Every page on this site reproduces a public record from {DATA_SOURCE} as of {AS_OF_DATE}. If
        a record is wrong, out of date, or matched to the wrong community, tell us and we will
        review it against the source.
      </p>

      <Suspense fallback={<div className="bg-white border border-line rounded-lg p-6 text-sm text-mut">Loading form…</div>}>
        <CorrectionForm />
      </Suspense>

      <section className="mt-8">
        <h2 className="font-serif text-[18px] font-bold mb-2 text-navy">What we can and cannot do</h2>
        <ul className="text-sm text-mut list-disc pl-5 space-y-1.5">
          <li>
            We can correct how a record is <b className="text-ink">displayed</b> here — a mismatched
            name, a wrong county or city, an association linked to the wrong management firm.
          </li>
          <li>
            We can remove an enrichment match (a compliance or inspection record) that belongs to a
            different property.
          </li>
          <li>
            We cannot change the underlying <b className="text-ink">official state record</b>. That
            has to be corrected with the issuing agency; see the{" "}
            <a href="/resources" className="text-navy-light">
              agency contacts on our Resources page
            </a>
            .
          </li>
        </ul>
      </section>
    </div>
  );
}
