import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/site";
import { HeroCta } from "@/components/HeroCta";

export const metadata: Metadata = {
  title: "Florida Preconstruction Communities | Florida HOA Registry",
  description:
    "Explore new-construction HOA communities in Florida. Learn how to find a community that fits your lifestyle, budget, and financing needs before the community opens.",
  alternates: { canonical: absoluteUrl("/preconstruction") },
};

export default function PreconstructionPage() {
  return (
    <>
      {/* Navy hero */}
      <section className="bg-gradient-to-b from-navy to-navy-light text-white py-14">
        <div className="mx-auto max-w-content px-6">
          <div className="text-xs font-semibold tracking-[0.14em] uppercase text-gold mb-4">
            Preconstruction · buyer representation
          </div>
          <h1 className="font-serif font-black text-[clamp(26px,3.8vw,38px)] leading-tight max-w-[700px] mb-4">
            Find a new-construction community that fits before the first walls go up.
          </h1>
          <p className="text-[#C8D4E0] text-base max-w-[620px] leading-relaxed mb-8">
            Buying preconstruction in Florida gives you more choices — floor plans, finishes, lot
            position, and in some developments, HOA structure. The right match comes from knowing
            which communities are actively selling, what approval pathways look like at opening,
            and how each builder&apos;s association is organized. We help you sort through it before
            you put a deposit down.
          </p>
          <HeroCta
            intent="preconstruction"
            label="Get my top matches"
            fine="Free consultation · no account required · no obligation"
          />
        </div>
      </section>

      {/* Content sections */}
      <div className="mx-auto max-w-content px-6 py-12 space-y-14">

        {/* How the matching process works */}
        <section>
          <h2 className="font-serif font-bold text-[22px] text-ink mb-2">
            How the matching process works
          </h2>
          <p className="text-mut text-[15px] leading-relaxed mb-8 max-w-[720px]">
            Preconstruction shopping is not like browsing resale inventory. The process is
            different — and so are the questions you should ask. Here is what to expect when you
            work with us.
          </p>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                step: "01",
                heading: "Discovery call",
                body: "We start by understanding what matters to you: location, community size, amenity priorities, target price range, and your expected timeline to move. There is no paperwork and no commitment at this stage.",
              },
              {
                step: "02",
                heading: "Community shortlist",
                body: "Using the registry and our knowledge of active Florida developments, we identify new-construction communities that match your profile — including how each association is structured and what the documented HOA obligations look like.",
              },
              {
                step: "03",
                heading: "Guided site visits",
                body: "We accompany you to community sales centers, help you ask the right questions about HOA governance, and make sure you understand what you are buying into — not just the unit, but the association that will govern it for years to come.",
              },
            ].map(({ step, heading, body }) => (
              <div
                key={step}
                className="bg-white border border-line rounded-lg p-6 hover:shadow-sm transition-shadow"
              >
                <div className="font-mono text-[11px] text-gold font-bold tracking-widest mb-3">
                  STEP {step}
                </div>
                <h3 className="font-serif font-bold text-[16px] text-navy mb-2">{heading}</h3>
                <p className="text-mut text-[13.5px] leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* What to look for */}
        <section className="grid sm:grid-cols-2 gap-10 items-start">
          <div>
            <h2 className="font-serif font-bold text-[22px] text-ink mb-4">
              What to look for in a new HOA community
            </h2>
            <p className="text-mut text-[15px] leading-relaxed mb-5">
              Not all HOA communities are created equal. When evaluating a new-construction
              development, look beyond the model home and the amenity renderings. Consider the
              association&apos;s governance documents, the developer&apos;s track record in Florida, and
              how the transition from developer control to resident control is structured.
            </p>
            <p className="text-mut text-[15px] leading-relaxed">
              Communities that are transparent about their HOA documents, fee structure, and
              operating budget from day one tend to have fewer surprises after closing.
            </p>
          </div>
          <div className="space-y-4">
            {[
              {
                heading: "HOA governing documents",
                body: "Request the Declaration of Covenants, Conditions &amp; Restrictions (CC&amp;Rs) and the bylaws before signing a purchase contract. Understand what is regulated, what the assessment structure is, and what the developer retains control of during the construction phase.",
              },
              {
                heading: "Fee structure and what it covers",
                body: "Ask for an itemized breakdown of the monthly or quarterly HOA assessment. Know what services are included, which amenities are separate, and whether the fee is expected to change after the developer turnover.",
              },
              {
                heading: "Association registry status",
                body: "Even new communities are required to register with the state once they begin operating as an association. Checking the registry at opening gives you an early view of how the board is organized and whether filings are current.",
              },
            ].map(({ heading, body }) => (
              <div
                key={heading}
                className="bg-paper border border-line rounded-lg p-5"
              >
                <h3 className="font-serif font-bold text-[14px] text-ink mb-1.5">{heading}</h3>
                <p
                  className="text-mut text-[13px] leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: body }}
                />
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Disclaimer */}
      <div className="mx-auto max-w-content px-6 pb-12">
        <p className="text-xs text-mut leading-relaxed max-w-[760px]">
          Nothing on this page is legal or financial advice. Information from the registry is
          drawn from publicly available records and is provided for reference only. Community
          availability, pricing, and HOA terms are set by individual developers and associations
          and are subject to change. Not a loan offer, rate quote, or commitment to lend. Not
          affiliated with the State of Florida or any government agency.
        </p>
      </div>
    </>
  );
}
