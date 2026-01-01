"use client";

import { useEffect, useState } from "react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  // lock scroll saat mobile menu open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
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

          {/* ===== Desktop Nav ===== */}
          <nav className="nav" aria-label="Navigasi">
            <a href="/">Beranda</a>
            <a href="/about/">Tentang kami</a>
            <a href="/how/">Cara Kerja</a>

            <div className="dd" aria-label="Fitur">
              <a href="/#fitur">
                Fitur <span className="caret" aria-hidden="true"></span>
              </a>
              <div className="ddMenu" role="menu">
                <a href="/cek-keuangan/">
                  <strong>Potret Keuangan</strong>
                </a>
                <a href="/financial-health-check/">Cek Kesehatan Keuangan</a>
                <a href="/goal-plan/">Hitung Target Masa Depan</a>

                {/* NEW: Rencana Nikah */}
                <a href="/rencana-nikah/">Rencana Nikah</a>
              </div>
            </div>

            <a href="/faq/">FAQ</a>
            <a href="/contact/">Kontak</a>
            <a href="/blog/">Blog</a>
          </nav>

          {/* ===== Desktop Actions ===== */}
          <div className="actions">
            <button
              id="menuBtn"
              className="menuBtn"
              type="button"
              aria-expanded={open}
              aria-controls="mnav"
              onClick={() => setOpen(true)}
            >
              Menu <span aria-hidden="true">☰</span>
            </button>

            {/* CTA utama tetap */}
            <a className="btn primary" href="/financial-health-check/">
              Cek GRATIS
            </a>
          </div>
        </div>
      </div>

      {/* ===== Overlay ===== */}
      <div
        id="mnavOverlay"
        className="mnavOverlay"
        aria-hidden={!open}
        onClick={() => setOpen(false)}
        style={{ display: open ? "block" : "none" }}
      />

      {/* ===== Mobile Drawer ===== */}
      <div
        id="mnav"
        className="mnav"
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        style={{ display: open ? "block" : "none" }}
      >
        <div className="mnavTop">
          <b>Menu</b>
          <button
            id="menuClose"
            className="mnavClose"
            type="button"
            onClick={() => setOpen(false)}
          >
            Tutup
          </button>
        </div>

        <div className="mnavLinks" onClick={() => setOpen(false)}>
          <a href="/">Beranda</a>
          <a href="/about/">Tentang Kami</a>
          <a href="/how/">Cara Kerja</a>

          <hr />

          <a href="/cek-keuangan/">
            <strong>Potret Keuangan</strong>
          </a>
          <a href="/financial-health-check/">Cek Kesehatan Keuangan</a>
          <a href="/goal-plan/">Hitung Target Masa Depan</a>

          {/* NEW: Rencana Nikah */}
          <a href="/rencana-nikah/">Rencana Nikah</a>

          <hr />

          <a href="/faq/">FAQ</a>
          <a href="/contact/">Kontak</a>
          <a href="/blog/">Blog</a>
        </div>

        {/* CTA mobile tetap ke health check */}
        <div className="mnavActions">
          <a
            className="btn primary"
            href="/financial-health-check/"
            onClick={() => setOpen(false)}
          >
            Cek GRATIS (±5 menit)
          </a>
        </div>
      </div>
    </header>
  );
}
