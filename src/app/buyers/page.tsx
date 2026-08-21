import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/site";
import { HeroCta } from "@/components/HeroCta";

export const metadata: Metadata = {
  title: "Buying into a Florida HOA Community | Florida HOA Registry",
  description:
    "Planning to buy in a Florida HOA community? Check your community's standing before you make an offer. HOA and condo approval status can directly affect your financing options.",
  alternates: { canonical: absoluteUrl("/buyers") },
};

export default function BuyersPage() {
  return (
    <>
      {/* Navy hero */}
      <section className="bg-gradient-to-b from-navy to-navy-light text-white py-14">
        <div className="mx-auto max-w-content px-6">
          <div className="text-xs font-semibold tracking-[0.14em] uppercase text-gold mb-4">
            For community buyers
          </div>
          <h1 className="font-serif font-black text-[clamp(26px,3.8vw,38px)] leading-tight max-w-[700px] mb-4">
            Check the community&apos;s standing before you make an offer.
          </h1>
          <p className="text-[#C8D4E0] text-base max-w-[620px] leading-relaxed mb-8">
            When you buy into an HOA community, lenders don&apos;t just underwrite you — they
            underwrite the association. A community that has lost approval status on certain
            financing programs can quietly narrow your loan options before you ever submit an
            application. Knowing where the community stands takes minutes and could save you
            weeks of surprises.
          </p>
          <HeroCta
            intent="finance"
            label="Check where I stand"
            fine="Free · no account required · not a loan offer or commitment to lend"
          />
        </div>
      </section>

      {/* Content sections */}
      <div className="mx-auto max-w-content px-6 py-12 space-y-14">

        {/* Section 1 */}
        <section>
          <h2 className="font-serif font-bold text-[22px] text-ink mb-6">
            What lenders look at beyond your credit
          </h2>
          <p className="text-mut text-[15px] leading-relaxed mb-6 max-w-[760px]">
            Your personal credit, income, and down payment are only part of what a lender
            reviews. For purchases inside an HOA or condo community, underwriters also examine
            the association itself. Common community-level factors include:
          </p>
          <div className="grid sm:grid-cols-3 gap-5">
            {[
              {
                heading: "Approval list status",
                body: "Some financing programs maintain approved-community lists. Communities that are not on those lists may not be eligible for those loan types, which affects the range of programs available to you.",
              },
              {
                heading: "Insurance coverage",
                body: "Lenders want to confirm the association carries adequate hazard and, where required, flood insurance. Coverage gaps can delay or complicate closings.",
              },
              {
                heading: "Concentration & occupancy",
                body: "Certain programs have limits on how many units in a building can be investor-owned. A community that exceeds those thresholds may restrict which loan products you can use.",
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

        {/* Section 2 */}
        <section className="grid sm:grid-cols-2 gap-10 items-start">
          <div>
            <h2 className="font-serif font-bold text-[22px] text-ink mb-4">
              How to use the registry
            </h2>
            <p className="text-mut text-[15px] leading-relaxed mb-4">
              The Florida HOA Registry collects publicly available information about HOA and
              community associations across the state. You can search by community name, address,
              or county to find the association on record, review its status, and see whether
              there are any documented compliance issues.
            </p>
            <p className="text-mut text-[15px] leading-relaxed">
              The registry does not offer loans, make lending decisions, or represent any lender.
              It is a reference tool you can use to start a more informed conversation with your
              real estate agent or mortgage professional.
            </p>
          </div>
          <div>
            <h2 className="font-serif font-bold text-[22px] text-ink mb-4">
              Why checking early saves time
            </h2>
            <ol className="space-y-4">
              {[
                {
                  n: "1",
                  text: "You narrow your search to communities that work with the financing program you plan to use — before spending time and money on inspections.",
                },
                {
                  n: "2",
                  text: "You give your lender the community information they need upfront, which reduces back-and-forth during the loan process.",
                },
                {
                  n: "3",
                  text: "If a community has a known issue, you can address it in negotiations or adjust your plans rather than discovering it at the closing table.",
                },
              ].map(({ n, text }) => (
                <li key={n} className="flex gap-3 text-[14px] text-mut leading-relaxed">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-navy-light text-white text-[12px] font-bold flex items-center justify-center mt-0.5">
                    {n}
                  </span>
                  <span>{text}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* CTA strip */}
        <section className="bg-paper border border-line rounded-lg px-6 py-8 flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="flex-1">
            <h3 className="font-serif font-bold text-[18px] text-ink mb-1">
              Ready to look up your community?
            </h3>
            <p className="text-mut text-[14px] leading-relaxed">
              Use the registry now to see what the record shows, then connect with one of our
              licensed partners for guidance on your next step.
            </p>
          </div>
          <HeroCta
            intent="finance"
            label="Check where I stand"
            fine="Free · no account required"
          />
        </section>
      </div>

      {/* Disclaimer */}
      <div className="mx-auto max-w-content px-6 pb-12">
        <p className="text-xs text-mut leading-relaxed max-w-[760px]">
          Nothing on this page is legal or financial advice. Information from the registry is
          drawn from publicly available records and is provided for reference only. Eligibility
          for any financing program depends on lender guidelines, program rules, and your
          individual circumstances. Not a loan offer, rate quote, or commitment to lend. Not
          affiliated with the State of Florida or any government agency.
        </p>
      </div>
    </>
  );
}
