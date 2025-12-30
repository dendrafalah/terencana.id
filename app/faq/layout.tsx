import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terencana.id — FAQ",
  description:
    "Pertanyaan yang sering muncul sebelum memulai Financial Health Check di terencana.id.",
  alternates: {
    canonical: "/faq/",
  },
  openGraph: {
    title: "FAQ — Terencana.id",
    description:
      "Jawaban atas pertanyaan umum sebelum memulai Financial Health Check.",
    url: "https://terencana.id/faq/",
    siteName: "terencana.id",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "FAQ — Terencana.id",
    description:
      "Jawaban atas pertanyaan umum sebelum memulai Financial Health Check.",
  },
};

export default function FaqLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
