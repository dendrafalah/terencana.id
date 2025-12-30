import Script from "next/script";
import "../health.css";
import ResultBoot from "./hasil.client";

export const metadata = {
  title: "terencana.id — Hasil Cek Kesehatan Keuangan",
  themeColor: "#F4F1E8",
};

export default function HasilPage() {
  return (
    <>
      <Script src="/assets/main.js" strategy="afterInteractive" />

      <main className="wrap" style={{ paddingTop: 18, paddingBottom: 90 }}>
        <section className="fhcHero">
          <div className="fhcHeroCard">
            <div className="fhcTitleRow">
              <div>
                <h1 className="fhcH1">Hasil Cek Kesehatan Keuangan</h1>
                <div className="fhcByline">
                  oleh <b>Dendra Falah, CFP®</b>
                  <span className="fhcSocial">
                    {" "}
                    ·{" "}
                    <a
                      href="https://www.linkedin.com/in/dendrafalah/"
                      target="_blank"
                      rel="noopener"
                    >
                      LinkedIn
                    </a>{" "}
                    ·{" "}
                    <a
                      href="https://www.instagram.com/dendrafalah/"
                      target="_blank"
                      rel="noopener"
                    >
                      Instagram
                    </a>
                  </span>
                </div>
                <p className="fhcLead" id="subtitle">
                  Ini bedah ringkas + detail indikator, biar kamu tahu posisi dan
                  langkah berikutnya.
                </p>
              </div>

              <div className="fhcMode fhcModeResult">
                <div className="fhcModeBlock">
                  <span className="fhcModeLabel">Aksi:</span>
                  <button className="fhcChip" id="btnPdf" type="button">
                    Simpan PDF
                  </button>
                  <button className="fhcChip" id="btnExcel" type="button">
                    Export Excel
                  </button>
                </div>
              </div>

              <div className="fhcPrivacy">
                <span className="fhcDot" aria-hidden="true"></span>
                Hasil ini diambil dari data yang tersimpan di perangkatmu
                (browser).
              </div>
            </div>
          </div>
        </section>

        <section className="fhcWizard" style={{ paddingTop: 12 }}>
          <div className="fhcAnimIn" id="resultMount">
            <section id="resultView" className="fhcCard">
              Memuat hasil…
            </section>
            <section
              id="inputView"
              className="fhcCard"
              style={{ marginTop: 12 }}
            />
          </div>

          <div
            style={{
              marginTop: 12,
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <a className="btn ghost" href="/financial-health-check/">
              Perbaiki input
            </a>
            <a className="btn primary" href="/contact/">
              Saya ingin konsultasi
            </a>
          </div>
        </section>
      </main>

      <ResultBoot />
    </>
  );
}
