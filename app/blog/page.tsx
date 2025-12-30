import Link from "next/link";
import { getAllPosts } from "../../lib/blog";

export const metadata = {
  title: "Blog — terencana.id",
  description: "Artikel ringan dan praktis untuk bantu kamu beresin keuangan pelan-pelan.",
};

export default function BlogIndexPage() {
  const posts = getAllPosts();

  return (
    <main style={{ maxWidth: 820, margin: "0 auto", padding: "32px 16px" }}>
      <h1 style={{ fontSize: 34, marginBottom: 8 }}>Blog</h1>
      <p style={{ opacity: 0.8, marginBottom: 24 }}>
        Artikel praktis tentang budgeting, kebiasaan finansial, dan langkah kecil yang masuk akal.
      </p>

      <div style={{ display: "grid", gap: 14 }}>
        {posts.map((p) => (
          <article key={p.slug} style={{ padding: 16, border: "1px solid rgba(0,0,0,.12)", borderRadius: 14 }}>
            <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>{p.frontmatter.date}</div>
            <h2 style={{ margin: 0, fontSize: 20 }}>
              <Link href={`/blog/${p.slug}`} style={{ textDecoration: "none" }}>
                {p.frontmatter.title}
              </Link>
            </h2>
            <p style={{ marginTop: 8, marginBottom: 0, opacity: 0.85 }}>{p.frontmatter.excerpt}</p>
          </article>
        ))}
      </div>
    </main>
  );
}
