// app/blog/page.tsx
export const runtime = "nodejs";
import fs from "fs";
import path from "path";
import Link from "next/link";
import matter from "gray-matter";


type PostFrontmatter = {
  title: string;
  excerpt?: string;
  date: string; // ISO string: "2025-12-29"
  cover?: string; // "/images/blog/xxx.jpg"
  author?: string; // "terencana.id"
  tags?: string[];
};

type Post = {
  slug: string;
  fm: PostFrontmatter;
  readingMinutes: number;
};

export const metadata = {
  title: "Blog — terencana.id",
  description:
    "Panduan keuangan yang masuk akal untuk hidup yang lebih tenang. Artikel ringkas, praktis, dan ramah untuk pemula.",
};

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

function estimateReadingMinutes(text: string) {
  // rule of thumb 200 wpm
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

function getAllPosts(): Post[] {
  if (!fs.existsSync(BLOG_DIR)) return [];

  const files = fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".md") || f.endsWith(".mdx"));

  const posts: Post[] = files.map((filename) => {
    const fullPath = path.join(BLOG_DIR, filename);
    const raw = fs.readFileSync(fullPath, "utf8");
    const { data, content } = matter(raw);

    const slug = filename.replace(/\.mdx?$/, "");

    const fm: PostFrontmatter = {
      title: String(data.title || slug),
      excerpt: data.excerpt ? String(data.excerpt) : undefined,
      date: String(data.date || "1970-01-01"),
      cover: data.cover ? String(data.cover) : undefined,
      author: data.author ? String(data.author) : "terencana.id",
      tags: Array.isArray(data.tags) ? data.tags.map(String) : undefined,
    };

    return {
      slug,
      fm,
      readingMinutes: estimateReadingMinutes(content),
    };
  });

  // Sort by date desc (newest first)
  posts.sort((a, b) => {
    const ad = new Date(a.fm.date).getTime();
    const bd = new Date(b.fm.date).getTime();
    return bd - ad;
  });

  return posts;
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

export default function BlogPage() {
  const posts = getAllPosts();
  const featured = posts[0];
  const rest = posts.slice(1);

  return (
    <div className="blogPage">
      <div className="blogContainer">
        {/* HERO */}
        <header className="blogHero">
          <p className="blogKicker">Blog terencana.id</p>
          <h1 className="blogTitle">
            Panduan keuangan yang masuk akal untuk hidup yang lebih tenang.
          </h1>
          <p className="blogSubtitle">
            Artikel ringkas, praktis, dan ramah untuk pemula — tanpa bikin kamu
            merasa “gagal”.
          </p>
        </header>

        {/* FEATURED */}
        {featured ? (
          <section className="blogFeatured">
            <Link className="blogFeaturedCard" href={`/blog/${featured.slug}`}>
              <div className="blogFeaturedMeta">
                <div className="blogMetaRow">
                  <span className="blogMeta">
                    {formatDateID(featured.fm.date)}
                  </span>
                  <span className="blogDot" aria-hidden="true">
                    •
                  </span>
                  <span className="blogMeta">
                    {featured.readingMinutes} menit baca
                  </span>
                  {featured.fm.author ? (
                    <>
                      <span className="blogDot" aria-hidden="true">
                        •
                      </span>
                      <span className="blogMeta">{featured.fm.author}</span>
                    </>
                  ) : null}
                </div>

                <h2 className="blogFeaturedTitle">{featured.fm.title}</h2>

                {featured.fm.excerpt ? (
                  <p className="blogExcerpt">{featured.fm.excerpt}</p>
                ) : (
                  <p className="blogExcerpt">
                    Baca artikel ini untuk langkah paling masuk akal yang bisa
                    kamu mulai hari ini.
                  </p>
                )}

                <span className="blogReadMore">Baca selengkapnya →</span>
              </div>

              {featured.fm.cover ? (
                // NOTE: pakai <img> supaya tidak ribet konfigurasi next/image dulu
                <div className="blogFeaturedCover">
                  <img
                    src={featured.fm.cover}
                    alt={featured.fm.title}
                    loading="lazy"
                  />
                </div>
              ) : null}
            </Link>
          </section>
        ) : (
          <section className="blogEmpty">
            <div className="card">
              <h2>Belum ada artikel</h2>
              <p>
                Tambahkan file <code>.md</code> atau <code>.mdx</code> ke{" "}
                <code>content/blog</code> dengan frontmatter <code>title</code>{" "}
                dan <code>date</code>.
              </p>
            </div>
          </section>
        )}

        {/* LIST */}
        {rest.length ? (
          <section className="blogList">
            <h3 className="blogSectionTitle">Artikel lainnya</h3>

            <div className="blogGrid">
              {rest.map((p) => (
                <article key={p.slug} className="blogCard">
                  <Link className="blogCardLink" href={`/blog/${p.slug}`}>
                    {p.fm.cover ? (
                      <div className="blogCardCover">
                        <img
                          src={p.fm.cover}
                          alt={p.fm.title}
                          loading="lazy"
                        />
                      </div>
                    ) : (
                      <div className="blogCardCover blogCardCoverPlaceholder" />
                    )}

                    <div className="blogCardBody">
                      <div className="blogMetaRow">
                        <span className="blogMeta">{formatDateID(p.fm.date)}</span>
                        <span className="blogDot" aria-hidden="true">
                          •
                        </span>
                        <span className="blogMeta">
                          {p.readingMinutes} menit
                        </span>
                      </div>

                      <h4 className="blogCardTitle">{p.fm.title}</h4>

                      {p.fm.excerpt ? (
                        <p className="blogCardExcerpt">{p.fm.excerpt}</p>
                      ) : (
                        <p className="blogCardExcerpt">
                          Ringkasan belum diisi. Tambahkan <code>excerpt</code>{" "}
                          di frontmatter.
                        </p>
                      )}

                      <span className="blogReadMore">Baca →</span>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {/* CTA */}
        <section className="blogCTA">
          <div className="blogCTACard">
            <h3 className="blogCTATitle">Mau tahu kondisi keuanganmu hari ini?</h3>
            <p className="blogCTAText">
              Cek kesehatan keuanganmu (±5 menit). Kamu dapat ringkasan yang jelas:
              mana yang aman, mana yang rawan, dan langkah pertama yang paling masuk akal.
            </p>
            <div className="blogCTAButtons">
              <Link className="btn primary" href="/health-check/">
              Cek Kesehatan Keuangan
              </Link>
              <Link className="btn ghost" href="/">
              Kembali ke Beranda
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
