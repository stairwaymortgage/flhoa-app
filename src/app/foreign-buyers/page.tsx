import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/site";
import { HeroCta } from "@/components/HeroCta";

export const metadata: Metadata = {
  title: "International Buyers — Florida Community Financing | Florida HOA Registry",
  description:
    "International and non-resident buyers purchasing in Florida HOA communities. Learn how foreign-national financing works, what communities qualify, and what to expect.",
  alternates: { canonical: absoluteUrl("/foreign-buyers") },
};

export default function ForeignBuyersPage() {
  return (
    <>
      {/* Navy hero */}
      <section className="bg-gradient-to-b from-navy to-navy-light text-white py-14">
        <div className="mx-auto max-w-content px-6">
          <div className="text-xs font-semibold tracking-[0.14em] uppercase text-gold mb-4">
            For international &amp; non-resident buyers
          </div>
          <h1 className="font-serif font-black text-[clamp(26px,3.8vw,38px)] leading-tight max-w-[700px] mb-4">
            Buying into a Florida HOA community from abroad — what changes and what stays the same.
          </h1>
          <p className="text-[#C8D4E0] text-base max-w-[620px] leading-relaxed mb-8">
            Non-resident and international buyers have purchased Florida property for decades.
            Financing options exist specifically for buyers without a US credit history or Social
            Security number — but the community still matters. Before you make an offer, it helps
            to understand how foreign-national programs work and what lenders look for in the HOA
            in addition to the buyer.
          </p>
          <HeroCta
            intent="foreign-national"
            label="See if I qualify to finance from abroad"
            fine="Not a loan offer, a quote, or a commitment to lend"
          />
        </div>
      </section>

      {/* Content sections */}
      <div className="mx-auto max-w-content px-6 py-12 space-y-14">

        {/* Section 1 — How foreign-national programs work */}
        <section>
          <h2 className="font-serif font-bold text-[22px] text-ink mb-4">
            How foreign-national financing programs work
          </h2>
          <p className="text-mut text-[15px] leading-relaxed mb-6 max-w-[760px]">
            Foreign-national programs are offered by private lenders — not government agencies —
            and are designed for buyers who do not have US residency. They use alternative methods
            to evaluate creditworthiness, relying on international credit references, bank
            statements, and other documentation rather than a US credit file. Non-resident
            programs commonly start around 35% down.
          </p>
          <div className="grid sm:grid-cols-3 gap-5">
            {[
              {
                heading: "No US credit required",
                body: "Lenders offering foreign-national programs do not require a US Social Security number or a US credit history. Qualification is typically based on international banking records, income documentation, and asset verification.",
              },
              {
                heading: "Documentation requirements",
                body: "Expect to provide passport copies, proof of foreign address, bank statements (often covering 12–24 months), and sometimes a letter of reference from your home country bank. Requirements vary by lender.",
              },
              {
                heading: "Property and community eligibility",
                body: "The property must still meet the lender's requirements — which includes the community. A community that is not eligible under the program's guidelines can affect whether the purchase can be financed.",
              },
            ].map(({ heading, body }) => (
              <div
                key={heading}
                className="bg-white border border-line rounded-lg p-5 hover:shadow-sm transition-shadow"
              >
                <h3 className="font-serif font-bold text-[15px] text-navy mb-2">{heading}</h3>
                <p className="text-mut text-[13.5px] leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 2 — The community still matters */}
        <section className="grid sm:grid-cols-2 gap-10 items-start">
          <div>
            <h2 className="font-serif font-bold text-[22px] text-ink mb-4">
              Why the community still matters — even on a foreign-national loan
            </h2>
            <p className="text-mut text-[15px] leading-relaxed mb-4">
              Foreign-national programs have their own set of community-eligibility requirements,
              and they do not track the same lists used by conventional or government-backed
              programs. That said, lenders still evaluate the HOA or condo association as part of
              the underwriting process.
            </p>
            <p className="text-mut text-[15px] leading-relaxed mb-4">
              A community with unresolved compliance issues, inadequate insurance, or high
              delinquency rates can create conditions that complicate or prevent a closing —
              regardless of the buyer&apos;s country of origin or the loan product.
            </p>
            <p className="text-mut text-[15px] leading-relaxed">
              Using the Florida HOA Registry to check a community&apos;s public record before submitting
              an offer is a simple step that can prevent a late-stage surprise.
            </p>
          </div>
          <div className="space-y-4">
            <h3 className="font-serif font-bold text-[18px] text-ink">Common questions from international buyers</h3>
            {[
              {
                q: "Can I get a loan if I don't live in the US?",
                a: "Yes. Foreign-national loan programs are designed specifically for non-residents. Eligibility depends on the lender's requirements and the property.",
              },
              {
                q: "Do I need a US bank account?",
                a: "Requirements vary. Some programs accept international bank accounts for down payment and reserve verification; others require US accounts. Your mortgage professional can clarify this early.",
              },
              {
                q: "What HOA documents will the lender ask for?",
                a: "Typically: the association's current master insurance certificate, the HOA budget, meeting minutes, and any known litigation disclosures. These come from the association, not the buyer.",
              },
              {
                q: "Does the community need to be on an approved list?",
                a: "Foreign-national programs often have their own eligibility criteria that differ from government-program lists. The community may still need to meet certain standards, which is why checking the registry is a useful first step.",
              },
            ].map(({ q, a }) => (
              <div key={q} className="bg-paper border border-line rounded-lg p-4">
                <h4 className="font-bold text-[13.5px] text-ink mb-1">{q}</h4>
                <p className="text-mut text-[13px] leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA strip */}
        <section className="bg-navy text-white rounded-lg px-6 py-8 flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="flex-1">
            <h3 className="font-serif font-bold text-[18px] mb-1">
              Ready to take the first step?
            </h3>
            <p className="text-[#C8D4E0] text-[14px] leading-relaxed">
              Check the community you&apos;re interested in, then connect with a licensed partner who
              works with international buyers in Florida. No application, no credit pull.
            </p>
          </div>
          <HeroCta
            intent="foreign-national"
            label="See if I qualify to finance from abroad"
            fine="Not a loan offer, a quote, or a commitment to lend"
          />
        </section>
      </div>

      {/* Disclaimer */}
      <div className="mx-auto max-w-content px-6 pb-12">
        <p className="text-xs text-mut leading-relaxed max-w-[760px]">
          Nothing on this page is legal, immigration, or financial advice. Foreign-national
          financing programs are offered by private lenders and are subject to each lender&apos;s
          guidelines, which can change. Program eligibility, documentation requirements, and
          down payment minimums vary. Not a loan offer, rate quote, or commitment to lend. Not
          affiliated with the State of Florida or any government agency.
        </p>
      </div>
    </>
  );
}
