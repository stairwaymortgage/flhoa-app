import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

// Markdown blog posts live at the repo root in content/blog/*.md.
// The auto-post engine writes posts here using the frontmatter contract below.
export const BLOG_DIR = path.join(process.cwd(), "content", "blog");

export type BlogFaq = { q: string; a: string };

export type BlogFrontmatter = {
  title: string;
  description: string;
  slug: string;
  date: string; // YYYY-MM-DD
  tag: string;
  heroImage: string; // may be empty
  heroAlt: string;
  faq: BlogFaq[];
};

export type BlogPost = BlogFrontmatter & {
  /** Raw markdown body (no H1). */
  body: string;
};

/** Normalise unknown frontmatter into the typed contract, filling safe defaults. */
function normalise(data: Record<string, unknown>, fallbackSlug: string): BlogFrontmatter {
  const faqRaw = Array.isArray(data.faq) ? data.faq : [];
  const faq: BlogFaq[] = faqRaw
    .map((item) => {
      const f = (item ?? {}) as Record<string, unknown>;
      return { q: String(f.q ?? "").trim(), a: String(f.a ?? "").trim() };
    })
    .filter((f) => f.q && f.a);

  return {
    title: String(data.title ?? "").trim(),
    description: String(data.description ?? "").trim(),
    slug: String(data.slug ?? fallbackSlug).trim(),
    date: String(data.date ?? "").trim(),
    tag: String(data.tag ?? "").trim(),
    heroImage: String(data.heroImage ?? "").trim(),
    heroAlt: String(data.heroAlt ?? "").trim(),
    faq,
  };
}

/** All published posts, newest first. Reads the filesystem at build time. */
export function getAllPosts(): BlogPost[] {
  if (!fs.existsSync(BLOG_DIR)) return [];

  const files = fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".md") && !f.startsWith("_") && !f.startsWith("."));

  const posts = files.map((file) => {
    const fileSlug = file.replace(/\.md$/, "");
    const raw = fs.readFileSync(path.join(BLOG_DIR, file), "utf8");
    const { data, content } = matter(raw);
    const fm = normalise(data, fileSlug);
    // Keep the URL stable on the filename even if frontmatter slug drifts.
    return { ...fm, slug: fm.slug || fileSlug, body: content.trim() };
  });

  return posts
    .filter((p) => p.title) // skip anything without at least a title
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

/** One post by slug, or null if not found. */
export function getPost(slug: string): BlogPost | null {
  return getAllPosts().find((p) => p.slug === slug) ?? null;
}

/** Format a YYYY-MM-DD date as e.g. "October 13, 2026" (UTC-safe). */
export function formatPostDate(date: string): string {
  if (!date) return "";
  const d = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return date;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}
