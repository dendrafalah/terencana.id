import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terencana.id — Tentang Kami",
  description: "Kenapa terencana.id ada dan siapa di baliknya.",
};

export default function AboutPage() {
  return (
    <main>
      <section className="section">
        <div className="wrap">
          <h1 style={{ margin: 0, letterSpacing: "-.04em" }}>
            Tentang terencana.id
          </h1>
          <p className="sectionDesc">
            Kenapa terencana.id ada, dan siapa yang membantu kamu menyederhanakan
            langkah keuangan.
          </p>

          <div className="aboutWrap">
            <div className="aboutBlock">
              <div className="aboutGrid">
                <div className="aboutText">
                  <div className="aboutKicker">
                    <span className="dot"></span>Kenapa terencana.id ada
                  </div>
                  <h3 className="aboutTitle">
                    Hidup tenang bukan soal punya banyak uang, tapi soal tahu arah
                  </h3>
                  <p>
                    Banyak orang terlihat “baik-baik saja”, tapi tiap malam
                    kepikiran: uang habis ke mana, prioritas apa dulu, dan takut
                    salah langkah. terencana.id dibuat untuk memecah kebingungan
                    itu jadi langkah kecil yang masuk akal.
                  </p>
                  <p>
                    Fokus kami sederhana: bikin kamu paham kondisi sekarang,
                    evaluasi pilihan rencana, lalu bantu pilih prioritas yang
                    paling realistis untuk dijalankan.
                  </p>

                  <div className="aboutStats">
                    <span className="statPill">
                      ±5 menit <small>cek kondisi</small>
                    </span>
                    <span className="statPill">
                      Praktis <small>bahasa simpel</small>
                    </span>
                    <span className="statPill">
                      Actionable <small>1 langkah dulu</small>
                    </span>
                  </div>

                  <div className="aboutCtaRow">
                    <a className="btn primary" href="/financial-health-check/">
                      Mulai Health Check
                    </a>
                    <a className="btn ghost" href="/how/">
                      Lihat cara kerja
                    </a>
                  </div>
                </div>

                <div className="aboutMedia" aria-label="Ilustrasi terencana.id">
                  <img
                    src="/images/about-1.JPG"
                    alt="about terencana.id"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>

            <div className="aboutBlock">
              <div className="aboutGrid">
                <div className="aboutText">
                  <div className="aboutKicker">
                    <span className="dot"></span>Founder
                  </div>
                  <h3 className="aboutTitle">Dendra Falah, MBA, CFP®</h3>
                  <p>
                    Dendra Falah, MBA, CFP® merupakan perencana keuangan
                    bersertifikasi yang memiliki pengalaman dalam pendampingan
                    perencanaan keuangan personal dan keluarga.
                  </p>
                  <p>
                    Melalui terencana.id, ia menerapkan pendekatan perencanaan
                    keuangan yang simple dan terstruktur, dengan fokus pada
                    pemahaman kondisi keuangan, penentuan prioritas, dan langkah
                    yang paling relevan untuk dijalankan saat ini.
                  </p>

                  <div className="aboutStats">
                    <span className="statPill">
                      CFP® <small>certified</small>
                    </span>
                    <span className="statPill">
                      Beginner-friendly <small>clear steps</small>
                    </span>
                    <span className="statPill">
                      Family finance <small>real life</small>
                    </span>
                  </div>

                  <div className="aboutCtaRow">
                    <a
                      className="chip"
                      href="https://www.linkedin.com/in/dendrafalah/"
                      target="_blank"
                      rel="noreferrer"
                    >
                      LinkedIn
                    </a>
                    <a
                      className="chip"
                      href="https://www.instagram.com/dendrafalah/"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Instagram
                    </a>
                  </div>
                </div>

                <div className="aboutMedia" aria-label="Foto founder">
                  <img
                    src="/images/about-2.jpg"
                    alt="Dendra Falah, Founder terencana.id"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
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
