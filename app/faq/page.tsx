"use client";

import React from "react";

type Item = { q: string; a: string };

const FAQS: Item[] = [
  {
    q: "Apa itu Financial Health Check?",
    a: "Financial Health Check adalah alat evaluasi singkat untuk membantu kamu memahami kondisi keuangan saat ini—mulai dari pengeluaran, tabungan, cicilan, hingga arus kas bulanan—dalam format yang ringkas dan mudah dibaca.",
  },
  {
    q: "Apakah layanan ini gratis?",
    a: "Ya. Financial Health Check dapat digunakan secara gratis. Kamu bisa melihat ringkasan kondisi dan prioritas awal tanpa kewajiban untuk melanjutkan ke layanan lain.",
  },
  {
    q: "Apakah data keuangan saya aman?",
    a: "Data yang kamu masukkan digunakan untuk menghasilkan ringkasan kondisi dan tidak dibagikan ke pihak lain. Kami tidak menjual maupun memanfaatkan data untuk kepentingan komersial.",
  },
  {
    q: "Apakah ini cocok untuk pemula?",
    a: "Sangat cocok. Dirancang tanpa istilah teknis rumit, dan hasilnya fokus ke hal yang paling relevan untuk kondisi saat ini.",
  },
  {
    q: "Apakah ini menggantikan konsultasi keuangan?",
    a: "Tidak. Health Check membantu memahami kondisi dan prioritas awal. Untuk rencana jangka panjang atau pembahasan mendalam, konsultasi tetap disarankan (opsional).",
  },
  {
    q: "Apakah saya harus langsung investasi setelah ini?",
    a: "Tidak. Fokus utamanya memastikan fondasi keuangan cukup sehat. Investasi hanya relevan jika sesuai kondisi dan prioritas kamu saat ini.",
  },
];

const WA_NUMBER = "6281944123422"; // 62xxxxxxxxxxx

function buildWAHref(text: string, number = WA_NUMBER) {
  const n = String(number || "").replace(/[^\d]/g, ""); // sanitize
  return `https://wa.me/${n}?text=${encodeURIComponent(text)}`;
}

export default function FaqPage() {
  const [openIndex, setOpenIndex] = React.useState<number | null>(0);

  return (
    <main>
      <section className="section">
        <div className="wrap">
          <h1 style={{ margin: 0, letterSpacing: "-.04em" }}>FAQ</h1>
          <p className="sectionDesc">
            Beberapa pertanyaan yang sering muncul sebelum memulai Financial Health Check.
          </p>

          <div className="faqWrap">
            {FAQS.map((item, i) => {
              const open = openIndex === i;

              return (
                <div
                  className={`faqItem${open ? " open" : ""}`}
                  key={item.q}
                >
                  <button
                    className="faqQ"
                    type="button"
                    aria-expanded={open}
                    aria-controls={`faq-a-${i}`}
                    onClick={() => setOpenIndex(open ? null : i)}
                  >
                    <b>{item.q}</b>
                    <span className="faqIcon">{open ? "–" : "+"}</span>
                  </button>

                  {/* Selalu render jawabannya; CSS "open" yang ngatur tampilnya */}
                  <div
                    id={`faq-a-${i}`}
                    className="faqA"
                    style={{
                      display: open ? "block" : "none",
                    }}
                  >
                    {item.a}
                  </div>
                </div>
              );
            })}
          </div>

          <div
            style={{
              marginTop: 18,
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <a className="btn primary" href="/financial-health-check/">
              Mulai Health Check
            </a>

            <a
              className="btn ghost"
              href={buildWAHref(
                "Halo terencana.id, saya masih ada beberapa pertanyaan sebelum mulai Health Check."
              )}
              target="_blank"
              rel="noreferrer"
            >
              Masih ada pertanyaan?
            </a>
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
