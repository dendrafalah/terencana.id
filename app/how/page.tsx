import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terencana.id — Cara Kerja",
  description: "Cara kerja Financial Health Check terencana.id.",
};

function buildWAHref(text: string) {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export default function HowPage() {
  return (
    <main>
      {/* Cara kerja */}
      <section className="section">
        <div className="wrap">
          <h1 style={{ margin: 0, letterSpacing: "-.04em" }}>Cara kerja</h1>
          <p className="sectionDesc">
            Prosesnya ringkas dan terstruktur: kamu dapat ringkasan, lalu langkah pertama yang jelas.
          </p>

          <div className="howGrid howGridFancy">
            {/* STEP 1 */}
            <article className="stepFancy s1">
              <div className="stepFrame" aria-hidden="true"></div>

              <div className="stepCardInner">
                <div className="stepBadge">01</div>

                <h3 className="stepTitle">Isi Financial Health Check (±5 menit)</h3>
                <p className="stepDesc">
                  Isi data dasar untuk membaca kondisi: pengeluaran, tabungan, cicilan, dan arus kas
                  bulanan.
                </p>

                <div className="stepMeta">
                  <span className="metaPill">
                    Privat <small>di perangkatmu</small>
                  </span>
                  <span className="metaPill">
                    Singkat <small>tanpa istilah rumit</small>
                  </span>
                </div>

                <div className="stepIcon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path
                      d="M8 7h10M8 12h10M8 17h6"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                    />
                    <path
                      d="M6.5 7l-1 1-1-1"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M6.5 12l-1 1-1-1"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M6.5 17l-1 1-1-1"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            </article>

            {/* STEP 2 */}
            <article className="stepFancy s2">
              <div className="stepFrame" aria-hidden="true"></div>

              <div className="stepCardInner">
                <div className="stepBadge">02</div>

                <h3 className="stepTitle">Dapat ringkasan: aman vs perlu diperbaiki</h3>
                <p className="stepDesc">
                  Kamu melihat indikator inti secara ringkas: mana yang sehat, mana berisiko, dan
                  apa penyebab utamanya.
                </p>

                <div className="stepMeta">
                  <span className="metaPill">
                    Ringkas <small>mudah dibaca</small>
                  </span>
                  <span className="metaPill">
                    Prioritas <small>jelas</small>
                  </span>
                </div>

                <div className="stepIcon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 2a10 10 0 100 20 10 10 0 000-20Z"
                      stroke="currentColor"
                      strokeWidth={2}
                    />
                    <path
                      d="M15.5 8.5l-2 7-7 2 2-7 7-2Z"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinejoin="round"
                    />
                    <path
                      d="M12 12l3.5-3.5"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>
            </article>

            {/* STEP 3 */}
            <article className="stepFancy s3">
              <div className="stepFrame" aria-hidden="true"></div>

              <div className="stepCardInner">
                <div className="stepBadge">03</div>

                <h3 className="stepTitle">Pilih langkah pertama (opsional: konsultasi)</h3>
                <p className="stepDesc">
                  Setelah tahu prioritas, kamu bisa mulai dari satu langkah paling relevan. Kalau
                  perlu, konsultasi untuk interpretasi hasil dan rencana 30 hari.
                </p>

                <div className="stepMeta">
                  <span className="metaPill">
                    Actionable <small>1 langkah dulu</small>
                  </span>
                  <span className="metaPill">
                    Opsional <small>konsultasi</small>
                  </span>
                </div>

                <div className="stepIcon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path
                      d="M4 19V5"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                    />
                    <path
                      d="M4 19h16"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                    />
                    <path
                      d="M8 16v-6M12 16V7M16 16v-9"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>
            </article>
          </div>

          <div className="howCtaRow">
            <a className="btn primary" href="/financial-health-check/">
              Mulai Health Check (±5 menit)
            </a>
          </div>

          <p className="howNote">
            *Health Check bersifat edukatif. Untuk keputusan finansial besar, pertimbangkan konsultasi.
          </p>
        </div>
      </section>

      {/* Bingung baca hasilnya */}
      <section className="section">
        <div className="wrap">
          <h2 style={{ margin: 0, fontSize: 24, letterSpacing: "-.02em" }}>
            Bingung baca hasilnya?
          </h2>
          <p className="sectionDesc">
            Kalau kamu ingin dibantu memahami hasil Health Check, ini <b>3 hal yang akan kamu dapat</b>{" "}
            dari sesi konsultasi.
          </p>

          <div className="cards">
            <div className="card">
              <b>Masalah utama kamu sekarang</b>
              <p>
                Kita bantu jawab: <i>“Sebenernya yang paling bermasalah di keuanganku apa?”</i>{" "}
                Fokus ke 1–2 hal paling penting.
              </p>
            </div>
            <div className="card">
              <b>Urutan langkah yang masuk akal</b>
              <p>
                Kamu tahu mulai dari mana dulu, mana yang bisa nanti. Nggak semuanya dibenerin sekaligus.
              </p>
            </div>
            <div className="card">
              <b>Rencana 30 hari ke depan</b>
              <p>
                Langkah praktis yang realistis sesuai kondisi kamu sekarang. Bukan teori, bukan template.
              </p>
            </div>
          </div>

          <div className="ctaRow">
            <a
              className="btn primary"
              href={buildWAHref(
                "Halo terencana.id, saya sudah isi Health Check. Saya ingin konsultasi untuk interpretasi hasil dan langkah berikutnya. Bisa dibantu?"
              )}
              target="_blank"
              rel="noreferrer"
            >
              Tanya perencana keuangan (WhatsApp)
            </a>
            <a className="btn ghost" href="/financial-health-check/">
              Cek dulu hasilmu GRATIS! (±5 menit)
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
