"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { REFLECTION_QUESTIONS, OptionValue } from "@/lib/financial-score/reflectionQuestions";
import { computeReflectionResult, saveResultToStorage } from "@/lib/financial-score/reflectionLogic";
import { useEffect } from "react";

type Answers = Record<string, OptionValue | undefined>;

export default function FinancialReflectionWizard() {
  const router = useRouter();

  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});

  const q = REFLECTION_QUESTIONS[idx];
  const maxIdx = REFLECTION_QUESTIONS.length - 1;

  const progressPct = useMemo(() => {
    // progress “terasa jalan” (step yang sudah lewat)
    const completed = Object.keys(answers).length;
    return Math.round((completed / REFLECTION_QUESTIONS.length) * 100);
  }, [answers]);

  const selected = answers[q.id];

  function pick(value: OptionValue) {
    setAnswers((prev) => ({ ...prev, [q.id]: value }));
  }

  function back() {
    setIdx((p) => Math.max(0, p - 1));
  }

  function next() {
    if (idx < maxIdx) setIdx((p) => p + 1);
  }

  function canNext() {
    return typeof selected === "number";
  }

  function submit() {
    // pastikan semua terisi (kalau user loncat-loncat)
    const allFilled = REFLECTION_QUESTIONS.every((qq) => typeof answers[qq.id] === "number");
    if (!allFilled) return;

    const finalized: Record<string, OptionValue> = {};
    for (const qq of REFLECTION_QUESTIONS) finalized[qq.id] = (answers[qq.id] as OptionValue) ?? 0;

    const result = computeReflectionResult(finalized);
    saveResultToStorage(result);
    router.push("/cek-keuangan/hasil");
  }

  const allAnswered = useMemo(
    () => REFLECTION_QUESTIONS.every((qq) => typeof answers[qq.id] === "number"),
    [answers]
  );

  useEffect(() => {
  function onKeyDown(e: KeyboardEvent) {
    if (e.key !== "Enter") return;

    // cegah enter submit form lain
    e.preventDefault();

    // kalau belum pilih jawaban, jangan lanjut
    if (typeof selected !== "number") return;

    // step terakhir → submit
    if (idx === maxIdx) {
      if (allAnswered) submit();
      return;
    }

    // step biasa → next
    next();
  }

  window.addEventListener("keydown", onKeyDown);
  return () => window.removeEventListener("keydown", onKeyDown);
}, [selected, idx, maxIdx, allAnswered]);


  return (
    <div className="fhcWrap">
      <div className="fhcHero">
        <div>
          <h1 className="fhcTitle">Potret Keuangan (± 2 menit)</h1>
          <p className="fhcSub">
            Jawab pertanyaan disini untuk mengetahui potret kondisi keuanganmu saat ini supaya bisa mengetahui langkah perbaikan yang paling bisa dilakukan.
          </p>
        </div>
      </div>

      <div className="fhcShell">
        <div className="fhcTop">
          <div className="fhcProgress" aria-label="Progress">
            <div className="fhcBar" style={{ width: `${progressPct}%` }} />
          </div>
          <div className="fhcStepText">
            {idx + 1} / {REFLECTION_QUESTIONS.length}
          </div>
        </div>

        <div className="fhcCard">
          <AnimatePresence mode="wait">
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              <h2 className="fhcQ">{q.title}</h2>

              <div className="fhcPillars" aria-label="Kategori">
                <span className="fhcPill">{q.pillar}</span>
                {idx === 0 && <span className="fhcPill">Santai aja</span>}
                {idx === 4 && <span className="fhcPill">Rasa aman</span>}
              </div>

              <div className="fhcOptions" role="radiogroup" aria-label="Pilihan jawaban">
                {q.options.map((opt) => {
                  const active = selected === opt.value;
                  return (
                    <label key={opt.label} className={`fhcOpt ${active ? "fhcOptActive" : ""}`}>
                      <input
                        type="radio"
                        name={q.id}
                        checked={active}
                        onChange={() => pick(opt.value)}
                      />
                      <div className="fhcOptLabel">{opt.label}</div>
                    </label>
                  );
                })}
              </div>

              <p className="fhcNote">
                Tips: Jawab yang paling mendekati keseharianmu. Nggak perlu “ideal”.
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="fhcFooter">
          <button className="fhcBtn" onClick={back} disabled={idx === 0}>
            ← Kembali
          </button>

          {idx < maxIdx ? (
            <button className="fhcBtn fhcBtnPrimary" onClick={next} disabled={!canNext()}>
              Lanjut →
            </button>
          ) : (
            <button className="fhcBtn fhcBtnPrimary" onClick={submit} disabled={!allAnswered}>
              Lihat Hasil
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
