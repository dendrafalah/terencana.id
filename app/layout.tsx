import "../assets/styles.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "terencana.id",
  description:
    "Perencanaan keuangan personal dan keluarga, dimulai dari langkah yang masuk akal.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
