import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { marked } from "marked";
import { Breadcrumbs } from "@/components/ui";
import { JsonLd, breadcrumbList } from "@/components/JsonLd";
import { absoluteUrl, SITE_NAME, SITE_URL } from "@/lib/site";
import { DATA_SOURCE } from "@/lib/status";
import { getAllPosts, getPost, formatPostDate } from "@/lib/blog";

export const dynamic = "force-static";
export const dynamicParams = false;
export const revalidate = 86400;

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = getPost(params.slug);
  if (!post) return { title: "Guide Not Found" };
  const path = `/blog/${post.slug}`;
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: absoluteUrl(path) },
    openGraph: {
      title: post.title,
      description: post.description,
      url: absoluteUrl(path),
      type: "article",
      publishedTime: post.date || undefined,
      images: post.heroImage ? [{ url: post.heroImage, alt: post.heroAlt || post.title }] : undefined,
    },
    twitter: {
      card: post.heroImage ? "summary_large_image" : "summary",
      title: post.title,
      description: post.description,
    },
  };
}

export default function BlogPost({ params }: { params: { slug: string } }) {
  const post = getPost(params.slug);
  if (!post) notFound();

  const path = `/blog/${post.slug}`;
  const html = marked.parse(post.body, { async: false }) as string;

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    ...(post.date ? { datePublished: post.date, dateModified: post.date } : {}),
    ...(post.heroImage ? { image: [post.heroImage] } : {}),
    ...(post.tag ? { articleSection: post.tag } : {}),
    mainEntityOfPage: { "@type": "WebPage", "@id": absoluteUrl(path) },
    url: absoluteUrl(path),
    isAccessibleForFree: true,
    publisher: {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
    },
  };

  const faqLd =
    post.faq.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: post.faq.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }
      : null;

  return (
    <div className="mx-auto max-w-content px-6 pb-14">
      <JsonLd data={articleLd} />
      {faqLd ? <JsonLd data={faqLd} /> : null}
      <JsonLd
        data={breadcrumbList([
          { name: "Home", path: "/" },
          { name: "Guides", path: "/blog" },
          { name: post.title, path },
        ])}
      />

      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Guides", href: "/blog" },
          { label: post.title },
        ]}
      />

      <article className="max-w-[760px]">
        <header className="mt-3 mb-6">
          <div className="flex items-center gap-2.5 mb-3 text-[10px] font-bold tracking-[0.1em] uppercase">
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
          <h1 className="font-serif font-black text-[clamp(26px,4vw,34px)] text-navy leading-tight">
            {post.title}
          </h1>
          <p className="text-mut text-base mt-3 leading-relaxed">{post.description}</p>
        </header>

        {post.heroImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.heroImage}
            alt={post.heroAlt || post.title}
            className="w-full rounded-lg border border-line mb-8"
          />
        ) : null}

        <div className="blog-body" dangerouslySetInnerHTML={{ __html: html }} />

        {post.faq.length > 0 ? (
          <section className="mt-12">
            <h2 className="font-serif text-[22px] font-bold mb-1 text-navy">
              Frequently asked questions
            </h2>
            <div className="w-14 h-[3px] bg-gold mb-5" />
            <div className="grid gap-3">
              {post.faq.map((f, i) => (
                <details
                  key={i}
                  className="bg-white border border-line rounded-lg px-[22px] py-4 [&_summary]:cursor-pointer"
                >
                  <summary className="font-serif text-[16.5px] font-bold text-navy list-none">
                    {f.q}
                  </summary>
                  <p className="text-sm leading-relaxed mt-2.5 text-ink">{f.a}</p>
                </details>
              ))}
            </div>
          </section>
        ) : null}

        {/* Neutral, on-site CTA — registry tools only. No sales language. */}
        <aside className="mt-12 bg-navy text-white rounded-lg p-[26px]">
          <h2 className="font-serif text-[20px] font-bold mb-2">Check the public record yourself</h2>
          <p className="text-[#C8D4E0] text-sm leading-relaxed mb-5 max-w-[620px]">
            Every figure and filing fact in this guide ultimately traces back to {DATA_SOURCE}.
            Look up any Florida association, management firm, licensed manager, or developer and see
            its registration status and license as recorded by the state.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/"
              className="inline-block bg-gold text-navy-dark font-bold text-sm rounded-md px-5 py-2.5 no-underline hover:bg-gold-light"
            >
              Search the registry
            </Link>
            <Link
              href="/verify"
              className="inline-block bg-transparent text-white border border-[#4a6b8c] font-bold text-sm rounded-md px-5 py-2.5 no-underline hover:border-white"
            >
              Verify a license
            </Link>
          </div>
        </aside>

        <p className="text-xs text-mut mt-6 leading-relaxed">
          General information about Florida community association records and law, not legal advice.
          For a specific situation, consult a Florida-licensed attorney. flhoaregistry.com is an
          independent directory and is not affiliated with the State of Florida.
        </p>
      </article>
    </div>
  );
}
