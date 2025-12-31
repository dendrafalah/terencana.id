import "../assets/styles.css";
import type { Metadata } from "next";
import "./globals.css";
import Navbar from "./components/Navbar";

export const metadata: Metadata = {
  title: "terencana.id",
  description: "Perencanaan keuangan personal dan keluarga, dimulai dari langkah yang masuk akal.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
