export default function HomePage() {
  return (
    <main>
      <section className="hero">
        <div className="wrap">
          <div className="grid">
            <div>
              <h1>Apakah kondisi keuangan kamu sehat?</h1>

              <p className="lead">
                Banyak orang sebenarnya punya uang, tapi tetap merasa “nggak aman” karena
                nggak tahu:{" "}
                <b>prioritasnya apa, yang mana bisa ditunda, dan uangnya habis ke mana.</b>
              </p>

              <div className="empathy">
                Kalau kamu sering kepikiran <i>“sebenarnya kondisi keuanganku sehat nggak ya?”</i>,
                langkah paling aman adalah <b>cek kondisi dulu</b>, bukan langsung lompat ke investasi
                atau target besar.
              </div>

              <div className="ctaRow">
                <a className="btn primary" href="/financial-health-check/">
                  Mulai Financial Health Check GRATIS!
                </a>
              </div>

              <div className="trust">
                <span className="chip" title="Perencana Keuangan Tersertifikasi">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 2l3 6 6 .8-4.4 4.3 1.1 6-5.7-3-5.7 3 1.1-6L3 8.8 9 8l3-6z"
                      stroke="currentColor"
                      strokeWidth={1.6}
                    />
                  </svg>
                  Oleh Dendra Falah, MBA, CFP®
                </span>
              </div>
            </div>

            {/* Right visual (contoh hasil) */}
            <aside className="panel" aria-label="Contoh hasil">
              <div className="panelInner">
                <div className="panelTop">
                  <b>Contoh ringkasan hasil</b>
                  <span className="pill">ringkas • jelas</span>
                </div>

                <div className="rows">
                  <div className="row">
                    <span>Pengeluaran</span>
                    <span className="status">
                      <span className="warn"></span>perlu dirapikan
                    </span>
                  </div>

                  <div className="row">
                    <span>Dana darurat</span>
                    <span className="status">
                      <span className="no"></span>belum aman
                    </span>
                  </div>

                  <div className="row">
                    <span>Cicilan</span>
                    <span className="status">
                      <span className="ok"></span>sehat
                    </span>
                  </div>

                  <div className="row">
                    <span>Tabungan & investasi</span>
                    <span className="status">
                      <span className="warn"></span>belum optimal
                    </span>
                  </div>

                  <div className="row">
                    <span>Cashflow bulanan</span>
                    <span className="status">
                      <span className="ok"></span>positif
                    </span>
                  </div>
                </div>
              </div>
            </aside>
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
