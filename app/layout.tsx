import "../assets/styles.css";
import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "terencana.id",
  description: "Perencanaan keuangan personal dan keluarga, dimulai dari langkah yang masuk akal.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>
        {/* =========================
            NAVBAR — terencana.id
           ========================= */}
        <header>
          <div className="wrap">
            <div className="topbar">
              <a className="brand" href="/" aria-label="terencana.id">
                <img
                  src="/images/logo-terencana1.png"
                  alt="terencana.id"
                  className="logoSvg"
                />
              </a>

              <nav className="nav" aria-label="Navigasi">
                <a href="/">Beranda</a>
                <a href="/about/">Tentang kami</a>
                <a href="/how/">Cara Kerja</a>

                <div className="dd" aria-label="Fitur">
                  <a href="/#fitur">
                    Fitur <span className="caret" aria-hidden="true"></span>
                  </a>
                  <div className="ddMenu" role="menu">
                    <a href="/financial-health-check/">Cek Kesehatan Keuangan</a>
                    <a href="/goal-plan/">Hitung Target Masa Depan</a>
                  </div>
                </div>

                <a href="/faq/">FAQ</a>
                <a href="/contact/">Kontak</a>
              </nav>

              <div className="actions">
                <button
                  id="menuBtn"
                  className="menuBtn"
                  type="button"
                  aria-expanded="false"
                  aria-controls="mnav"
                >
                  Menu <span aria-hidden="true">☰</span>
                </button>

                {/* CTA: tetap ke fitur utama */}
                <a className="btn primary" href="/financial-health-check/">
                  Cek GRATIS
                </a>
              </div>
            </div>
          </div>

          {/* ===== Mobile Nav ===== */}
          <div id="mnavOverlay" className="mnavOverlay" aria-hidden="true"></div>

          <div
            id="mnav"
            className="mnav"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
          >
            <div className="mnavTop">
              <b>Menu</b>
              <button id="menuClose" className="mnavClose" type="button">
                Tutup
              </button>
            </div>

            <div className="mnavLinks">
              <a href="/">Beranda</a>
              <a href="/about/">Tentang Kami</a>
              <a href="/how/">Cara Kerja</a>

              {/* Fitur */}
              <a href="/financial-health-check/">Fitur: Cek Kesehatan Keuangan</a>
              <a href="/goal-plan/">Fitur: Hitung Target Masa Depan</a>

              <a href="/faq/">FAQ</a>
              <a href="/contact/">Kontak</a>
            </div>

            <div className="mnavActions">
              <a className="btn primary" href="/financial-health-check/">
                Cek GRATIS (±5 menit)
              </a>
            </div>
          </div>
        </header>

        {/* =========================
            PAGE CONTENT
           ========================= */}
        <main>{children}</main>

        {/* =========================
            GLOBAL JS
           ========================= */}
        <Script src="/assets/main.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
