"use client";

import { useEffect, useState } from "react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  // optional: lock scroll saat menu open
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
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
              aria-expanded={open}
              aria-controls="mnav"
              onClick={() => setOpen(true)}
            >
              Menu <span aria-hidden="true">☰</span>
            </button>

            <a className="btn primary" href="/financial-health-check/">
              Cek GRATIS
            </a>
          </div>
        </div>
      </div>

      {/* Overlay */}
      <div
        id="mnavOverlay"
        className="mnavOverlay"
        aria-hidden={!open}
        onClick={() => setOpen(false)}
        style={{
          display: open ? "block" : "none",
        }}
      />

      {/* Drawer */}
      <div
        id="mnav"
        className="mnav"
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        style={{
          display: open ? "block" : "none",
        }}
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

          <a href="/financial-health-check/">
            Fitur: Cek Kesehatan Keuangan
          </a>
          <a href="/goal-plan/">Fitur: Hitung Target Masa Depan</a>

          <a href="/faq/">FAQ</a>
          <a href="/contact/">Kontak</a>
        </div>

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
