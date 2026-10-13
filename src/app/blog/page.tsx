import Link from "next/link";
import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui";
import { absoluteUrl } from "@/lib/site";
import { DATA_SOURCE } from "@/lib/status";
import { getAllPosts, formatPostDate } from "@/lib/blog";

export const dynamic = "force-static";
export const revalidate = 86400;

const TITLE = "Guides — Florida Community Association Records Explained";
const DESCRIPTION =
  "Plain-English guides to Florida HOA and condominium public records: estoppel certificates, milestone inspections, reserves, CAM licensing, and how to verify any record against official state sources.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: absoluteUrl("/blog") },
  openGraph: { title: TITLE, description: DESCRIPTION, url: absoluteUrl("/blog"), type: "website" },
  twitter: { card: "summary", title: TITLE, description: DESCRIPTION },
};

export default function BlogIndex() {
  const posts = getAllPosts();

  return (
    <div className="mx-auto max-w-content px-6 pb-12">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Guides" }]} />
      <h1 className="font-serif font-black text-[28px] mt-3 mb-1 text-navy">Guides</h1>
      <p className="text-mut text-sm mb-8 max-w-[760px] leading-relaxed">
        Plain-English explainers for Florida homeowners and board members. Every guide sticks to
        the same standard as the rest of the registry: facts with sources, drawn from{" "}
        {DATA_SOURCE} and the Florida Statutes — never characterizations, and never a statement
        about any community&apos;s finances. Where a guide points to a record, verify it yourself
        using the tools on this site.
      </p>

      {posts.length === 0 ? (
        <p className="text-sm text-mut">No guides have been published yet.</p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="flex flex-col bg-white border border-line rounded-lg overflow-hidden no-underline text-ink transition hover:-translate-y-[2px] hover:border-navy hover:shadow-[0_12px_30px_rgba(0,38,77,0.10)]"
            >
              {post.heroImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={post.heroImage}
                  alt={post.heroAlt || post.title}
                  className="w-full h-44 object-cover border-b border-line"
                  loading="lazy"
                />
              ) : null}
              <div className="p-[22px] flex flex-col grow">
                <div className="flex items-center gap-2.5 mb-2 text-[10px] font-bold tracking-[0.1em] uppercase">
                  {post.tag ? (
                    <span className="text-navy-light bg-[#EDF2FA] border border-navy-light rounded px-2.5 py-[3px]">
                      {post.tag}
                    </span>
                  ) : null}
                  {post.date ? (
                    <span className="text-mut font-semibold tracking-normal normal-case">
                      {formatPostDate(post.date)}
                    </span>
                  ) : null}
                </div>
                <h2 className="font-serif text-[19px] font-bold text-navy mb-1.5 leading-snug">
                  {post.title}
                </h2>
                <p className="text-sm text-mut leading-relaxed">{post.description}</p>
                <span className="mt-auto pt-3.5 text-xs font-bold text-navy">Read the guide →</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
