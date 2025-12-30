import Script from "next/script";
import "./health.css";
import HealthBoot from "./health.boot";

export const metadata = {
  title: "terencana.id — Cek Kesehatan Keuangan",
  description:
    "Cek kondisi keuanganmu dengan cara yang ringan dan jelas. Isi bertahap, lihat hasil setelah submit.",
  themeColor: "#F4F1E8",
};

export default function FinancialHealthCheckPage() {
  return (
    <>
      {/* Script global kamu untuk mobile nav (menuBtn, overlay, dll) */}
      <Script src="/assets/main.js" strategy="afterInteractive" />

      <main>
        {/* HEADER (copy konsisten) */}

        <div className="wrap">
          <section className="fhcHero">
            <div className="fhcHeroCard">
              <div className="fhcTitleRow">
                <div>
                  <h1 className="fhcH1">Cek Kesehatan Keuangan</h1>
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
                  <p className="fhcLead">
                    Isi pelan-pelan. Ini bukan ujian. Kalau belum yakin angkanya,
                    isi perkiraan dulu — nanti bisa diperbaiki.
                  </p>
                </div>
              </div>

              <div className="fhcPrivacy">
                <span className="fhcDot" aria-hidden="true"></span>
                Data tersimpan di perangkatmu (browser). Tidak dikirim ke server.
              </div>

              <div className="fhcStepper" aria-label="Progress">
                <div className="fhcStepTop">
                  <div className="fhcStepText" id="stepText">
                    Langkah 1 dari 6
                  </div>
                  <div className="fhcStepMini" id="stepMini">
                    Profil
                  </div>
                </div>
                <div className="fhcBar">
                  <div
                    className="fhcBarFill"
                    id="barFill"
                    style={{ width: "16.6%" }}
                  ></div>
                </div>
              </div>
            </div>
          </section>

          <section className="fhcWizard" id="wizard">
            <div className="fhcStepWrap">
              <div className="fhcCard fhcAnimIn" id="stepMount"></div>

              <div className="fhcNav">
  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
    <button className="btn ghost" id="btnBack" type="button">
      Kembali
    </button>

    <button
      className="btn ghost"
      id="btnReset"
      type="button"
      style={{ opacity: 0.7 }}
    >
      Reset
    </button>
  </div>

  <div className="fhcNavRight">
    <span className="fhcHint" id="hintText">
      Isi yang kamu tahu dulu.
    </span>
    <button className="btn primary" id="btnNext" type="button">
      Lanjut
    </button>
  </div>
</div>

            </div>
          </section>

          <section className="fhcReview" id="review" hidden>
            <div className="fhcCard fhcAnimIn">
              <h2 className="fhcH2">Sebelum lihat hasil…</h2>
              <p className="fhcP">
                Pastikan angka utamamu sudah masuk. Kalau ada yang belum yakin,
                tidak apa-apa — hasilnya tetap bisa jadi gambaran awal.
              </p>

              <div className="fhcReviewGrid" id="reviewGrid"></div>

              <div className="fhcSubmitRow">
                <button className="btn ghost" id="btnEdit" type="button">
                  Perbaiki Jawaban
                </button>
                <button className="btn primary" id="btnSubmit" type="button">
                  Lihat Hasil
                </button>
              </div>

              <div className="fhcSmall">
                Setelah klik “Lihat Hasil”, kamu akan masuk ke halaman hasil.
                Kamu bisa simpan PDF/Excel di sana.
              </div>
            </div>
          </section>

          <div className="fhcToast" id="toast" role="status" aria-live="polite" hidden></div>
        </div>

        {/* Boot wizard (client) */}
        <HealthBoot />
      </main>
    </>
  );
}
