import Link from "next/link";
import { getGovContacts } from "@/lib/data";
import { Breadcrumbs } from "@/components/ui";
import { DATA_SOURCE, AS_OF_DATE } from "@/lib/status";

export const metadata = {
  title: "Florida Community Association Resources — Law, Records & Agencies",
  description:
    "Plain-English explainers of Florida Chapter 718, Chapter 720 and the SB 4-D milestone inspection law, owners' records-access rights, and state agency contacts.",
};
export const revalidate = 86400;

const LAWS = [
  {
    title: "Chapter 718 — The Florida Condominium Act",
    body: "Chapter 718 of the Florida Statutes governs condominiums: how a condominium is created and registered with the state, how its board is elected, how budgets and assessments are adopted, and what the association owes unit owners in notice and access. It is the statute behind most of the registration facts shown on association pages in this directory, including the project number and the recorded date. Associations that fall behind on their required filings with the Division of Florida Condominiums, Timeshares, and Mobile Homes are the ones that appear here with a delinquent secondary status.",
  },
  {
    title: "Chapter 720 — Homeowners' Associations",
    body: "Chapter 720 covers homeowners' associations — communities of parcel owners governed by recorded covenants rather than condominium declarations. It sets the rules for HOA board meetings, elections, covenant enforcement, fining procedures, and the dispute-resolution steps an association must follow before it can take certain actions against an owner. HOAs are regulated more lightly than condominiums: the state maintains far less centralized filing data on them, which is why HOA records in public databases are typically thinner than condominium records.",
  },
  {
    title: "SB 4-D — Milestone Inspections & Structural Integrity Reserve Studies",
    body: "Passed in 2022 after the Surfside collapse, SB 4-D requires milestone structural inspections of condominium and cooperative buildings three stories or higher, on a schedule tied to the building's age and its distance from the coast. It also requires associations to commission structural integrity reserve studies on a recurring basis. On this site we publish only the filing facts the state records — whether an inspection case exists, its case number, year, and recorded status. We do not publish reserve figures or any assessment of a building's condition.",
  },
];

export default async function ResourcesPage() {
  const contacts = await getGovContacts(100);

  return (
    <div className="mx-auto max-w-content px-6 pb-12">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Resources" }]} />
      <h1 className="font-serif font-black text-[28px] mt-3 mb-1 text-navy">Resources</h1>
      <p className="text-mut text-sm mb-6 max-w-[760px]">
        Florida HOA Registry is an independent directory of Florida community association public
        records. Every record page reproduces facts from {DATA_SOURCE} with the date they were
        current. This page explains the laws those records sit under, what owners are entitled to
        inspect, and who to contact at the state.
      </p>

      <div className="grid sm:grid-cols-3 gap-3 mb-10">
        <Link
          href="/associations"
          className="bg-white border border-line rounded-lg px-4 py-3 no-underline text-navy font-semibold hover:border-navy"
        >
          Associations →
        </Link>
        <Link
          href="/managers/firms"
          className="bg-white border border-line rounded-lg px-4 py-3 no-underline text-navy font-semibold hover:border-navy"
        >
          Managers & firms →
        </Link>
        <Link
          href="/developers"
          className="bg-white border border-line rounded-lg px-4 py-3 no-underline text-navy font-semibold hover:border-navy"
        >
          Developers →
        </Link>
      </div>

      <section className="mb-10">
        <h2 className="font-serif text-[22px] font-bold mb-1 text-navy">
          Florida Community Association Law
        </h2>
        <div className="w-14 h-[3px] bg-gold mb-5" />
        <div className="grid gap-4">
          {LAWS.map((law) => (
            <article key={law.title} className="bg-white border border-line rounded-lg p-[22px]">
              <h3 className="font-serif text-[18px] font-bold text-navy mb-2">{law.title}</h3>
              <p className="text-sm leading-relaxed">{law.body}</p>
            </article>
          ))}
        </div>
        <p className="text-xs text-mut mt-3">
          General information about Florida law, not legal advice. For a specific situation, consult
          a Florida-licensed attorney.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="font-serif text-[22px] font-bold mb-1 text-navy">Records Access</h2>
        <div className="w-14 h-[3px] bg-gold mb-5" />
        <article className="bg-white border border-line rounded-lg p-[22px]">
          <p className="text-sm leading-relaxed">
            Florida law gives owners the right to inspect their association&apos;s official records —
            governing documents, meeting minutes, contracts, insurance policies, and budgets — within
            a set window after a written request, and to receive copies at a reasonable cost. The
            request should be in writing and delivered by a method that gives you proof of the date.
            An association that fails to provide access within the statutory window can face
            penalties, and the owner may recover the costs of enforcing the right. Condominium
            associations are covered by Chapter 718 and homeowners&apos; associations by Chapter 720;
            the categories of records and the exemptions differ slightly between them.
          </p>
        </article>
      </section>

      <section>
        <h2 className="font-serif text-[22px] font-bold mb-1 text-navy">State Agencies &amp; Contacts</h2>
        <div className="w-14 h-[3px] bg-gold mb-5" />
        <div className="bg-white border border-line rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[13.5px]">
              <thead>
                <tr className="text-left text-[10px] font-bold tracking-[0.1em] uppercase text-mut bg-paper">
                  <th className="py-2.5 px-4 border-b-2 border-line">District / Office</th>
                  <th className="py-2.5 px-4 border-b-2 border-line">Contact</th>
                  <th className="py-2.5 px-4 border-b-2 border-line">Location</th>
                  <th className="py-2.5 px-4 border-b-2 border-line">Phone</th>
                  <th className="py-2.5 px-4 border-b-2 border-line">Email</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((c, i) => (
                  <tr key={i}>
                    <td className="py-2.5 px-4 border-b border-line font-semibold text-navy">
                      {c.office || "—"}
                    </td>
                    <td className="py-2.5 px-4 border-b border-line">{c.contact || "—"}</td>
                    <td className="py-2.5 px-4 border-b border-line text-mut">{c.location || "—"}</td>
                    <td className="py-2.5 px-4 border-b border-line whitespace-nowrap">
                      {c.phone ? (
                        <a href={`tel:${c.phone.replace(/[^0-9]/g, "")}`} className="text-navy-light">
                          {c.phone}
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="py-2.5 px-4 border-b border-line">
                      {c.email ? (
                        <a href={`mailto:${c.email}`} className="text-navy-light break-all">
                          {c.email}
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <p className="text-xs text-mut mt-3">
          Source: {DATA_SOURCE}, as of {AS_OF_DATE} · flhoaregistry.com is not affiliated with the
          State of Florida ·{" "}
          <Link href="/corrections" className="text-navy-light">
            Request a correction
          </Link>
        </p>
      </section>
    </div>
  );
}
