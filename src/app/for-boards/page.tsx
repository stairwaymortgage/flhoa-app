import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/site";
import { HeroCta } from "@/components/HeroCta";

export const metadata: Metadata = {
  title: "For HOA & Condo Boards — Getting Back on Lender Lists | Florida HOA Registry",
  description:
    "HOA and condo board members: learn what losing lender approval costs your owners, what re-approval involves, and how to start the documentation process.",
  alternates: { canonical: absoluteUrl("/for-boards") },
};

export default function ForBoardsPage() {
  return (
    <>
      {/* Navy hero */}
      <section className="bg-gradient-to-b from-navy to-navy-light text-white py-14">
        <div className="mx-auto max-w-content px-6">
          <div className="text-xs font-semibold tracking-[0.14em] uppercase text-gold mb-4">
            For community boards
          </div>
          <h1 className="font-serif font-black text-[clamp(26px,3.8vw,38px)] leading-tight max-w-[700px] mb-4">
            Getting your community back on lender approval lists — what it takes and where to start.
          </h1>
          <p className="text-[#C8D4E0] text-base max-w-[620px] leading-relaxed mb-8">
            When a Florida HOA or condo community loses eligibility for FHA, VA, or conventional
            financing programs, the effects ripple through every unit. Owners who want to sell
            face a narrower buyer pool. Buyers who want to purchase face limited financing choices.
            And values across the building tend to drift lower. The good news: re-approval is
            usually a documentation process, not a structural one.
          </p>
          <HeroCta
            intent="board"
            label="Talk to someone about our community"
            fine="Free · no account required · no obligation"
          />
        </div>
      </section>

      {/* Content sections */}
      <div className="mx-auto max-w-content px-6 py-12 space-y-14">

        {/* Section 1 — What lost approval costs */}
        <section>
          <h2 className="font-serif font-bold text-[22px] text-ink mb-4">
            What lost approval costs your owners
          </h2>
          <p className="text-mut text-[15px] leading-relaxed mb-6 max-w-[760px]">
            Boards are often unaware that their community has lost lender-program eligibility until
            an owner&apos;s sale falls apart or a buyer&apos;s loan is denied at the community level. By then,
            the cost is already real. Here is what limited approval typically means for residents:
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                heading: "Smaller buyer pool",
                body: "Buyers who need FHA or VA financing — a significant share of owner-occupant buyers — cannot purchase in a community that has lost that program&apos;s approval. Cash buyers and conventional borrowers may still transact, but at reduced competition.",
              },
              {
                heading: "Downward price pressure",
                body: "When fewer buyers can finance a unit, sellers face more negotiation and, over time, prices in the building can drift lower relative to comparable communities that maintain approval status.",
              },
              {
                heading: "Refinance limitations",
                body: "Current owners who want to refinance using certain programs may also find their options restricted if the community does not qualify. This affects owners even if they are not planning to sell.",
              },
              {
                heading: "Disclosure obligations",
                body: "In Florida, sellers and their agents have disclosure obligations related to material facts about the property. A community&apos;s known approval status is information that typically requires disclosure.",
              },
              {
                heading: "Board liability exposure",
                body: "Boards that are aware of an approval issue and do not act on it may face questions from owners about governance responsibilities. Taking action is a defensible position; inaction is not.",
              },
              {
                heading: "Perception and resale velocity",
                body: "Even buyers who could use non-restricted financing may be deterred by a community with documented compliance issues. The perception of the building matters as much as the technical eligibility.",
              },
            ].map(({ heading, body }) => (
              <div
                key={heading}
                className="bg-white border border-line rounded-lg p-5 hover:shadow-sm transition-shadow"
              >
                <h3 className="font-serif font-bold text-[14px] text-navy mb-2">{heading}</h3>
                <p
                  className="text-mut text-[13px] leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: body }}
                />
              </div>
            ))}
          </div>
        </section>

        {/* Section 2 — What re-approval involves */}
        <section>
          <h2 className="font-serif font-bold text-[22px] text-ink mb-4">
            What re-approval involves — documentation, not demolition
          </h2>
          <p className="text-mut text-[15px] leading-relaxed mb-6 max-w-[760px]">
            Boards sometimes assume that losing lender approval signals a structural deficiency or
            a massive remediation project. In most cases, that is not the situation. Approval
            lapses and denials are frequently the result of documentation gaps, outdated
            certifications, or administrative oversights — issues that can be addressed through
            organized paperwork rather than construction.
          </p>
          <div className="grid sm:grid-cols-2 gap-10 items-start">
            <div className="space-y-5">
              <h3 className="font-serif font-bold text-[17px] text-ink">Typical documentation involved</h3>
              {[
                {
                  label: "Current insurance certificates",
                  detail: "Master hazard, liability, and flood policies (where applicable) with coverage levels that meet program minimums.",
                },
                {
                  label: "HOA budget and meeting minutes",
                  detail: "Recent operating budget, board meeting minutes, and evidence of regular board activity. Programs want to see a functioning, actively managed association.",
                },
                {
                  label: "Owner-occupancy data",
                  detail: "For some programs, the percentage of units that are owner-occupied versus investor-owned is a factor. Boards can compile this data from their own records.",
                },
                {
                  label: "Delinquency report",
                  detail: "An accounting of current HOA fee delinquencies. Programs have thresholds; boards that know their numbers can assess where they stand before applying.",
                },
                {
                  label: "Litigation disclosure",
                  detail: "A statement of any pending or active litigation involving the association, including the nature of the claim and current status.",
                },
              ].map(({ label, detail }) => (
                <div key={label} className="flex gap-3">
                  <span className="shrink-0 mt-1 w-1.5 h-1.5 rounded-full bg-gold" />
                  <div>
                    <span className="font-bold text-[13.5px] text-ink">{label}: </span>
                    <span className="text-mut text-[13.5px] leading-relaxed">{detail}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-paper border border-line rounded-lg p-6 space-y-4">
              <h3 className="font-serif font-bold text-[17px] text-ink">Questions boards frequently ask</h3>
              {[
                {
                  q: "How long does re-approval take?",
                  a: "Timelines vary by program and by how complete the documentation package is. When the board has all required records organized in advance, the process is generally faster.",
                },
                {
                  q: "Does the board have to hire an attorney?",
                  a: "Not necessarily. Many approval applications are documentation reviews, not legal proceedings. Whether to involve counsel is a board decision depending on the specifics.",
                },
                {
                  q: "Can we get a preliminary assessment before applying?",
                  a: "Yes. A licensed partner familiar with the re-approval process can review your community&apos;s current record and documentation to identify gaps before a formal application is submitted.",
                },
                {
                  q: "What if there is a structural issue flagged?",
                  a: "If a program identifies a structural concern, the path forward depends on the specific finding and the program&apos;s guidelines. That is a separate conversation from a documentation-only lapse.",
                },
              ].map(({ q, a }) => (
                <div key={q}>
                  <h4 className="font-bold text-[13.5px] text-ink mb-0.5">{q}</h4>
                  <p
                    className="text-mut text-[13px] leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: a }}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA strip */}
        <section className="bg-navy text-white rounded-lg px-6 py-8 flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="flex-1">
            <h3 className="font-serif font-bold text-[18px] mb-1">
              Start with a conversation
            </h3>
            <p className="text-[#C8D4E0] text-[14px] leading-relaxed">
              A licensed partner can review your community&apos;s current registry record, walk you
              through the documentation picture, and help you understand your options — at no cost
              and no obligation to the board.
            </p>
          </div>
          <HeroCta
            intent="board"
            label="Talk to someone about our community"
            fine="Free · no account required · no obligation"
          />
        </section>
      </div>

      {/* Disclaimer */}
      <div className="mx-auto max-w-content px-6 pb-12">
        <p className="text-xs text-mut leading-relaxed max-w-[760px]">
          Nothing on this page is legal, financial, or governance advice. HOA and condo
          association approval requirements vary by program, lender, and year. Registry
          information is drawn from publicly available records. Boards should consult qualified
          legal counsel for guidance on their association&apos;s specific obligations. Not affiliated
          with the State of Florida, HUD, the VA, or any government agency.
        </p>
      </div>
    </>
  );
}
