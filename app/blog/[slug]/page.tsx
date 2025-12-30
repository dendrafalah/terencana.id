import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getPostBySlug, getAllSlugs } from "../../../lib/blog";

export const dynamicParams = true;

// Optional (biar build statis slug yang ada)
export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  try {
    const post = getPostBySlug(slug);
    return {
      title: `${post.frontmatter.title} — terencana.id`,
      description: post.frontmatter.excerpt,
      openGraph: {
        title: post.frontmatter.title,
        description: post.frontmatter.excerpt,
        images: post.frontmatter.cover ? [post.frontmatter.cover] : [],
      },
    };
  } catch {
    return { title: "Artikel tidak ditemukan — terencana.id" };
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let post;
  try {
    post = getPostBySlug(slug);
  } catch {
    notFound();
  }

  return (
    <main style={{ maxWidth: 820, margin: "0 auto", padding: "32px 16px" }}>
      <Link href="/blog" style={{ textDecoration: "none", opacity: 0.8 }}>
        ← Kembali ke Blog
      </Link>

      <header style={{ marginTop: 16, marginBottom: 18 }}>
        <div style={{ fontSize: 12, opacity: 0.7 }}>{post.frontmatter.date}</div>
        <h1 style={{ fontSize: 34, margin: "6px 0 0" }}>{post.frontmatter.title}</h1>
        <p style={{ marginTop: 10, opacity: 0.85 }}>{post.frontmatter.excerpt}</p>
      </header>

      <article style={{ lineHeight: 1.75 }}>
        <MDXRemote source={post.content} />
      </article>

      <section
        style={{
          marginTop: 28,
          padding: 16,
          border: "1px solid rgba(0,0,0,.12)",
          borderRadius: 14,
        }}
      >
        <strong>Mau cek kondisi keuanganmu sekarang?</strong>
        <p style={{ marginTop: 8, marginBottom: 12, opacity: 0.85 }}>
          Cukup ±5 menit untuk dapat ringkasan yang jelas: mana yang aman, mana yang rawan,
          dan langkah pertama yang masuk akal.
        </p>
        <a
          href="/financial-health-check/"
          style={{
            display: "inline-block",
            padding: "10px 14px",
            borderRadius: 12,
            border: "1px solid rgba(0,0,0,.2)",
          }}
        >
          Mulai Financial Health Check
        </a>
      </section>
    </main>
  );
}
