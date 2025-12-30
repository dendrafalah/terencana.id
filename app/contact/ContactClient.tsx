"use client";

import React from "react";

function buildWAHref(text: string) {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export default function ContactClient() {
  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const form = e.currentTarget;
    const fd = new FormData(form);

    const name = String(fd.get("name") || "").trim();
    const email = String(fd.get("email") || "").trim();
    const topic = String(fd.get("topic") || "").trim();
    const message = String(fd.get("message") || "").trim();

    const to = "hello@terencana.id"; // TODO: ganti kalau perlu
    const subject = `[terencana.id] ${topic || "Pertanyaan"}`;
    const body = `Nama: ${name}
Email: ${email}

Pesan:
${message}
`;

    const mailto = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;

    window.location.href = mailto;
  }

  const waText =
    "Halo terencana.id, saya mau tanya dulu soal Financial Health Check.";

  return (
    <main>
      <section className="section">
        <div className="wrap">
          <h1 style={{ margin: 0, letterSpacing: "-.04em" }}>Kontak</h1>
          <p className="sectionDesc">
            Kirim pertanyaan via email, atau chat cepat lewat WhatsApp.
          </p>

          <div className="form">
            <form id="contactForm" onSubmit={onSubmit}>
              <div className="field">
                <label htmlFor="name">Nama</label>
                <input id="name" name="name" placeholder="Nama kamu" required />
              </div>

              <div className="field">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="email@kamu.com"
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="topic">Topik</label>
                <input
                  id="topic"
                  name="topic"
                  placeholder="Contoh: Tanya Health Check / Konsultasi / Lainnya"
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="message">Pertanyaan</label>
                <textarea
                  id="message"
                  name="message"
                  placeholder="Tulis pertanyaan kamu..."
                  required
                />
              </div>

              <div className="formRow">
                <button className="btn primary" type="submit">
                  Kirim via Email
                </button>

                <a
                  className="btn ghost"
                  href={buildWAHref(waText)}
                  target="_blank"
                  rel="noreferrer"
                >
                  Chat WhatsApp
                </a>
              </div>

              <p className="sectionDesc" style={{ marginTop: 12 }}>
                *Tombol “Kirim via Email” akan membuka aplikasi email kamu (mailto)
                dengan isi otomatis.
              </p>
            </form>
          </div>
        </div>
      </section>

      <footer>
        <div className="wrap">
          <div className="foot">
            <div>© {new Date().getFullYear()} terencana.id</div>
            <div className="links">
              <a
                href="https://www.linkedin.com/in/dendrafalah/"
                target="_blank"
                rel="noreferrer"
              >
                LinkedIn
              </a>
              <a
                href="https://www.instagram.com/dendrafalah/"
                target="_blank"
                rel="noreferrer"
              >
                Instagram
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
