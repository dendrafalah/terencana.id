"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  loadResultFromStorage,
  ReflectionResult,
} from "@/lib/financial-score/reflectionLogic";

function pickShareLine(r: ReflectionResult) {
  // kalimat shareable yang pendek & fun (tanpa angka)
  return `Hari ini aku tipe: ${r.animalName}. Pelan-pelan, aku lagi beresin keuanganku bareng terencana.id.`;
}

export default function FinancialReflectionResult() {
  const [result, setResult] = useState<ReflectionResult | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setResult(loadResultFromStorage());
  }, []);

  const shareLine = useMemo(() => (result ? pickShareLine(result) : ""), [result]);

  async function copyText() {
    try {
      await navigator.clipboard.writeText(shareLine);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // ignore
    }
  }

  if (!result) {
    return (
      <div className="fhcWrap">
        <div className="fhcResultCard">
          <h2 className="fhcLabel">Hasil belum ditemukan</h2>
          <p className="fhcMeta">
            Sepertinya kamu belum mengisi Potret Keuangan. Yuk mulai dulu ya 🙂
          </p>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 14 }}>
            <Link className="fhcBtn fhcBtnPrimary" href="/cek-keuangan">
              Mulai Potret Keuangan
            </Link>
            <Link className="fhcBtn" href="/">
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fhcWrap">
      {/* ============ RESULT HERO (WAH MOMENT) ============ */}
      <motion.section
        className="resHero"
        initial={{ opacity: 0, y: 12, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.28, ease: "easeOut" }}
      >
        <div className="resHeroInner">
          <div className="resHeroMedia" aria-hidden="true">
            {/* Slot image maskot */}
            <Image
              src={result.animalImage}
              alt={result.animalName}
              width={220}
              height={220}
              priority
              style={{ width: "100%", height: "auto" }}
            />
          </div>

          <div className="resHeroBody">
            <div className="resKicker">HASIL KAMU</div>

            <h1 className="resTitle">{result.animalName}</h1>
            <div className="resTagline">{result.animalTagline}</div>

            <h2 className="resHeroTitle">{result.heroTitle}</h2>
            <p className="resHeroDesc">{result.heroDesc}</p>

            <div className="resActions">
              <Link className="fhcBtn fhcBtnPrimary resPrimary" href="/financial-health-check">
                Bantu Aku Rapikan Keuangan
              </Link>

              <div className="resSecondary">
                <Link className="resLink" href="/cek-keuangan">
                  Ulangi Potret Keuangan
                </Link>
                <span className="resDot">•</span>
                <Link className="resLink" href="/">
                  Beranda
                </Link>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ============ MAIN INSIGHT ============ */}
      <motion.section
        className="resInsight"
        initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.26, ease: "easeOut", delay: 0.05 }}
      >
        <div className="resInsightIcon">💡</div>
        <div>
          <div className="resInsightLabel">Insight Utama</div>
          <div className="resInsightText">{result.insightMain}</div>
          <div className="resInsightSub">
            Kalau kamu cuma mau mulai dari 1 hal, mulai dari sini.
          </div>
        </div>
      </motion.section>

      {/* ============ 3 MINI CARDS ============ */}
      <motion.section
        className="resGrid3"
        initial="hidden"
        animate="show"
        variants={{
          hidden: { opacity: 0 },
          show: { opacity: 1, transition: { staggerChildren: 0.08 } },
        }}
      >
        <motion.div
          className="resMiniCard"
          variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
        >
          <div className="resMiniTop">
            <div className="resMiniIcon">🟢</div>
            <div className="resMiniTitle">Yang sudah oke</div>
          </div>
          <ul className="resList">
            {result.strengths.slice(0, 3).map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          className="resMiniCard"
          variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
        >
          <div className="resMiniTop">
            <div className="resMiniIcon">🟡</div>
            <div className="resMiniTitle">Yang perlu dirapikan dulu</div>
          </div>
          <ul className="resList">
            {result.focus.slice(0, 3).map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          className="resMiniCard"
          variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
        >
          <div className="resMiniTop">
            <div className="resMiniIcon">🧭</div>
            <div className="resMiniTitle">Langkah paling masuk akal</div>
          </div>
          <ol className="resSteps">
            {result.steps.slice(0, 3).map((st, i) => (
              <li key={i}>
                <strong>{st.title}:</strong> {st.desc}
              </li>
            ))}
          </ol>
        </motion.div>
      </motion.section>

      {/* ============ SHAREABLE LINE ============ */}
      <motion.section
        className="resShare"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: "easeOut", delay: 0.12 }}
      >
        <div className="resShareText">“{shareLine}”</div>
        <button className="resCopyBtn" onClick={copyText} type="button">
          {copied ? "Tersalin ✅" : "Copy teks"}
        </button>
      </motion.section>
    </div>
  );
}
