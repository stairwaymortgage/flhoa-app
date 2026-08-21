import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/site";
import { HeroCta } from "@/components/HeroCta";

export const metadata: Metadata = {
  title: "Selling in a Florida HOA Community | Florida HOA Registry",
  description:
    "Selling your home in a Florida HOA community with approval challenges? Learn why offers collapse over community status — and how to sell strategically into the constraint.",
  alternates: { canonical: absoluteUrl("/sellers") },
};

export default function SellersPage() {
  return (
    <>
      {/* Navy hero */}
      <section className="bg-gradient-to-b from-navy to-navy-light text-white py-14">
        <div className="mx-auto max-w-content px-6">
          <div className="text-xs font-semibold tracking-[0.14em] uppercase text-gold mb-4">
            For owners and sellers
          </div>
          <h1 className="font-serif font-black text-[clamp(26px,3.8vw,38px)] leading-tight max-w-[700px] mb-4">
            When the community has challenges, selling takes a different strategy.
          </h1>
          <p className="text-[#C8D4E0] text-base max-w-[620px] leading-relaxed mb-8">
            If your HOA community has fallen off an approval list, has an open compliance issue,
            or is facing a certification gap, you can still sell — but buyers using certain
            financing programs may not be able to close without extra steps. Understanding your
            community&apos;s status before you list puts you in control of the conversation.
          </p>
          <HeroCta
            intent="sell"
            label="Get my free value & building report"
            fine="Free to you · no obligation"
          />
        </div>
      </section>

      {/* Content sections */}
      <div className="mx-auto max-w-content px-6 py-12 space-y-14">

        {/* Section 1 — Why offers collapse */}
        <section>
          <h2 className="font-serif font-bold text-[22px] text-ink mb-4">
            Why offers fall apart — and it&apos;s not the buyer
          </h2>
          <p className="text-mut text-[15px] leading-relaxed mb-6 max-w-[760px]">
            Most sellers assume a deal collapses because of buyer credit or appraisal issues. But
            in HOA and condo communities, the building itself is the more common culprit. Here are
            the community-level situations that most often derail a closing:
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                heading: "Approval status lapse",
                body: "Some programs require a community to maintain active approval. When that approval lapses, buyers using those programs cannot close — even if they are perfectly qualified borrowers.",
              },
              {
                heading: "Insurance coverage gap",
                body: "An association that is underinsured or has an open insurance deficiency can trigger a lender condition that stalls or kills the transaction.",
              },
              {
                heading: "Delinquency concentration",
                body: "High HOA fee delinquency rates within the community can trigger underwriting overlays that restrict which loan products buyers can use.",
              },
              {
                heading: "Pending litigation",
                body: "Active litigation against the association — or by the association — is a material disclosure item that some financing programs treat as a disqualifying condition.",
              },
            ].map(({ heading, body }) => (
              <div
                key={heading}
                className="bg-white border border-line rounded-lg p-5 hover:shadow-sm transition-shadow"
              >
                <h3 className="font-serif font-bold text-[14px] text-navy mb-2">{heading}</h3>
                <p className="text-mut text-[13px] leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 2 — How to sell into the constraint */}
        <section className="grid sm:grid-cols-2 gap-10 items-start">
          <div>
            <h2 className="font-serif font-bold text-[22px] text-ink mb-4">
              How to sell when the community has constraints
            </h2>
            <p className="text-mut text-[15px] leading-relaxed mb-4">
              A community issue does not make your unit unsellable. It shapes the buyer pool and
              the deal structure. Sellers who understand that going in can price accurately and
              attract buyers who can actually close.
            </p>
            <p className="text-mut text-[15px] leading-relaxed mb-4">
              Some buyers — including cash buyers and those using portfolio or non-QM loan
              products — are not subject to the same community-eligibility requirements as
              conventional or government-backed loan programs. Marketing your listing to that
              audience intentionally, rather than discovering the constraint mid-contract, saves
              time and reduces fall-through risk.
            </p>
            <p className="text-mut text-[15px] leading-relaxed">
              In some cases, working with the board before listing to resolve a straightforward
              documentation issue can restore broader buyer access ahead of the sale.
            </p>
          </div>
          <div className="space-y-5">
            <h3 className="font-serif font-bold text-[18px] text-ink">Practical steps for sellers</h3>
            {[
              {
                n: "1",
                title: "Pull the community record",
                text: "Search the registry to see what the public record shows about your association. Issues you didn&apos;t know about can surface early.",
              },
              {
                n: "2",
                title: "Know your buyer pool",
                text: "Your licensed agent can help you understand which financing programs are compatible with your community&apos;s current status and how to reach those buyers.",
              },
              {
                n: "3",
                title: "Price to the reality",
                text: "A constrained buyer pool is not a crisis — it is information. Accurate pricing and a well-targeted listing avoid wasted time and repeated contract failures.",
              },
              {
                n: "4",
                title: "Engage the board",
                text: "If the community&apos;s issue is a documentation or compliance matter, a conversation with the board may lead to a fix that opens the door to more buyers before you list.",
              },
            ].map(({ n, title, text }) => (
              <div key={n} className="flex gap-4">
                <span className="shrink-0 w-7 h-7 rounded-full bg-gold text-navy-dark text-[12px] font-bold flex items-center justify-center mt-0.5">
                  {n}
                </span>
                <div>
                  <h4 className="font-bold text-[14px] text-ink mb-0.5">{title}</h4>
                  <p
                    className="text-mut text-[13px] leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: text }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA strip */}
        <section className="bg-paper border border-line rounded-lg px-6 py-8 flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="flex-1">
            <h3 className="font-serif font-bold text-[18px] text-ink mb-1">
              Start with your community&apos;s current record
            </h3>
            <p className="text-mut text-[14px] leading-relaxed">
              A licensed partner can walk you through the registry record, help you understand
              your community&apos;s standing, and outline what selling in your market looks like right now.
            </p>
          </div>
          <HeroCta
            intent="sell"
            label="Get my free value & building report"
            fine="Free to you · no obligation"
          />
        </section>
      </div>

      {/* Disclaimer */}
      <div className="mx-auto max-w-content px-6 pb-12">
        <p className="text-xs text-mut leading-relaxed max-w-[760px]">
          Nothing on this page is legal or financial advice. Registry information is drawn from
          publicly available records and is provided for reference only. Community status,
          approval eligibility, and financing program availability are subject to change and are
          determined by individual lenders and program rules, not by this registry. Not a loan
          offer, rate quote, or commitment to lend. Not affiliated with the State of Florida or
          any government agency.
        </p>
      </div>
    </>
  );
}
