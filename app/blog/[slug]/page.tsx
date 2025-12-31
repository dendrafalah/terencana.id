// app/blog/[slug]/page.tsx
export const runtime = "nodejs";

import fs from "fs";
import path from "path";
import Link from "next/link";
import matter from "gray-matter";
import { notFound } from "next/navigation";
import { remark } from "remark";
import remarkHtml from "remark-html";
import remarkGfm from "remark-gfm";

type PostFrontmatter = {
  title: string;
  excerpt?: string;
  date: string;
  cover?: string;
  author?: string;
  tags?: string[];
};

type Post = {
  slug: string;
  fm: PostFrontmatter;
  content: string;
  readingMinutes: number;
};

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

/* =========================
   Utils
   ========================= */
function estimateReadingMinutes(text: string) {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

function formatDateID(dateStr: string) {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(d);
}

/* =========================
   Data
   ========================= */
function getAllSlugs(): string[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".md") || f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx?$/, ""));
}

function getPostBySlug(slug: string): Post | null {
  const mdxPath = path.join(BLOG_DIR, `${slug}.mdx`);
  const mdPath = path.join(BLOG_DIR, `${slug}.md`);
  const fullPath = fs.existsSync(mdxPath)
    ? mdxPath
    : fs.existsSync(mdPath)
    ? mdPath
    : null;

  if (!fullPath) return null;

  const raw = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(raw);

  return {
    slug,
    fm: {
      title: String(data.title || slug),
      excerpt: data.excerpt ? String(data.excerpt) : undefined,
      date: String(data.date || "1970-01-01"),
      cover: data.cover ? String(data.cover) : undefined,
      author: data.author ? String(data.author) : "terencana.id",
      tags: Array.isArray(data.tags) ? data.tags.map(String) : undefined,
    },
    content,
    readingMinutes: estimateReadingMinutes(content),
  };
}

function getOtherPosts(currentSlug: string, limit = 3): Post[] {
  return getAllSlugs()
    .map((slug) => getPostBySlug(slug))
    .filter(Boolean)
    .sort(
      (a, b) => new Date(b!.fm.date).getTime() - new Date(a!.fm.date).getTime()
    )
    .filter((p) => p!.slug !== currentSlug)
    .slice(0, limit) as Post[];
}

/* =========================
   Static + SEO
   ========================= */
export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  const title = `${post.fm.title} — Blog terencana.id`;
  const description =
    post.fm.excerpt ||
    "Panduan keuangan yang masuk akal untuk hidup yang lebih tenang.";
  const ogImage = post.fm.cover || "/images/og-terencana.jpg";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      images: [{ url: ogImage }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

/* =========================
   Page
   ========================= */
export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const post = getPostBySlug(slug);
  if (!post) return notFound();

  const others = getOtherPosts(slug, 3);

  const html = String(
    await remark().use(remarkGfm).use(remarkHtml).process(post.content)
  );

  return (
    <div className="blogPage">
      <div className="blogContainer">
        {/* Back */}
        <div className="blogCrumb">
          <Link href="/blog" className="blogCrumbLink">
            ← Kembali ke Blog
          </Link>
        </div>

        {/* Header */}
        <header className="articleHead">
          <div className="blogMetaRow">
            <span className="blogMeta">{formatDateID(post.fm.date)}</span>
            <span className="blogDot">•</span>
            <span className="blogMeta">{post.readingMinutes} menit baca</span>
            {post.fm.author ? (
              <>
                <span className="blogDot">•</span>
                <span className="blogMeta">{post.fm.author}</span>
              </>
            ) : null}
          </div>

          <h1 className="articleTitle">{post.fm.title}</h1>

          {post.fm.excerpt ? (
            <p className="articleExcerpt">{post.fm.excerpt}</p>
          ) : null}

          {post.fm.tags?.length ? (
            <div className="articleTags">
              {post.fm.tags.map((t) => (
                <span key={t} className="tagPill">
                  {t}
                </span>
              ))}
            </div>
          ) : null}
        </header>

        {/* Cover */}
        {post.fm.cover ? (
          <div className="articleCover">
            <img src={post.fm.cover} alt={post.fm.title} />
          </div>
        ) : null}

        {/* Content */}
        <article
          className="articleContent"
          dangerouslySetInnerHTML={{ __html: html }}
        />

        {/* CTA */}
        <section className="blogCTA">
          <div className="blogCTACard">
            <h3 className="blogCTATitle">Mau tahu kondisi keuanganmu hari ini?</h3>
            <p className="blogCTAText">
              Cek kesehatan keuanganmu (±5 menit). Kamu dapat ringkasan yang jelas:
              mana yang aman, mana yang rawan, dan langkah pertama yang paling masuk
              akal.
            </p>
            <div className="blogCTAButtons">
              <Link className="btn primary" href="/financial-health-check/">
                Cek Kesehatan Keuangan
              </Link>
              <Link className="btn ghost" href="/">
                Kembali ke Beranda
              </Link>
            </div>
          </div>
        </section>

        {/* Other posts */}
        {others.length ? (
          <section className="blogList">
            <h3 className="blogSectionTitle">Artikel terbaru lainnya</h3>
            <div className="blogGrid">
              {others.map((p) => (
                <article key={p.slug} className="blogCard">
                  <Link className="blogCardLink" href={`/blog/${p.slug}`}>
                    {p.fm.cover ? (
                      <div className="blogCardCover">
                        <img src={p.fm.cover} alt={p.fm.title} loading="lazy" />
                      </div>
                    ) : (
                      <div className="blogCardCover blogCardCoverPlaceholder" />
                    )}

                    <div className="blogCardBody">
                      <div className="blogMetaRow">
                        <span className="blogMeta">
                          {formatDateID(p.fm.date)}
                        </span>
                        <span className="blogDot" aria-hidden="true">
                          •
                        </span>
                        <span className="blogMeta">{p.readingMinutes} menit</span>
                      </div>

                      <h4 className="blogCardTitle">{p.fm.title}</h4>

                      {p.fm.excerpt ? (
                        <p className="blogCardExcerpt">{p.fm.excerpt}</p>
                      ) : null}

                      <span className="blogReadMore">Baca →</span>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
