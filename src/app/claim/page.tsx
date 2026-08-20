import { Suspense } from "react";
import { Breadcrumbs } from "@/components/ui";
import { ClaimForm } from "@/components/ClaimForm";

export const metadata = {
  title: "Claim a Record — Florida HOA Registry",
  description:
    "Claim your association, management firm, licensed manager, or developer listing on the Florida HOA Registry.",
  // Utility form: useful to visitors, nothing to index.
  robots: { index: false, follow: true },
};

export default function ClaimPage() {
  return (
    <div className="mx-auto max-w-[760px] px-6 pb-12">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Claim a Record" }]} />
      <h1 className="font-serif font-black text-[28px] mt-3 mb-1 text-navy">Claim a Record</h1>
      <p className="text-mut text-sm mb-6">
        If you are connected to a record on this site — as an owner, a board member, a licensed
        manager, or a management firm — you can claim it. Claiming lets you keep the listing&apos;s
        contact details current and respond to inquiries that come through the registry.
      </p>

      <Suspense
        fallback={
          <div className="bg-white border border-line rounded-lg p-6 text-sm text-mut">
            Loading form…
          </div>
        }
      >
        <ClaimForm />
      </Suspense>

      <section className="mt-8">
        <h2 className="font-serif text-[18px] font-bold mb-2 text-navy">How claiming works</h2>
        <ul className="text-sm text-mut list-disc pl-5 space-y-1.5">
          <li>We verify your connection to the record against the public state registry.</li>
          <li>
            Verified claimants can correct contact details and add context to the listing. The
            underlying state-record facts stay as the source reports them.
          </li>
          <li>
            To correct a factual error instead, use{" "}
            <a href="/corrections" className="text-navy-light">
              Request a correction
            </a>
            .
          </li>
        </ul>
      </section>
    </div>
  );
}
