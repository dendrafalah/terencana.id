"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import ProgressBar from "./components/ProgressBar";
import StepCard from "./components/StepCard";
import Option5 from "./components/Option5";
import MoneyInput from "./components/MoneyInput";
import StickyFooter from "./components/StickyFooter";
import Accordion from "./components/Accordion";
import SummaryBar from "./components/SummaryBar";
import ResultBadge from "./components/ResultBadge";
import ScenarioCards from "./components/ScenarioCards";

import type { Answers, FinalResult, LivingAfterInputs, WizardDraft } from "@/lib/rencana-nikah/types";
import { monthInputDefault, fmtIDR } from "@/lib/rencana-nikah/format";
import { buildBreakdown, calcReality, calcScenarios, calcSnapshot } from "@/lib/rencana-nikah/calc";
import { loadDraft, saveDraft, saveFinal } from "@/lib/rencana-nikah/storage";

const TOTAL_STEPS = 10; // 0..9

function emptyAnswers(): Answers {
  return {
    q1_scale: null,
    q2_venue: null,
    q3_adat: null,
    q4_docs: null,
    q5_experience: null,
    q6_priority: null,
    q7_support: null,
  };
}

function defaultSupportPct(q7: 1 | 2 | 3 | 4 | 5) {
  // Mandiri, sedikit, sebagian, mayoritas, hampir semua
  return [0, 0, 15, 40, 70, 90][q7];
}

function addMonthsToYM(ym: string, add: number) {
  try {
    if (!ym || ym.length < 7) return monthInputDefault(10);
    const [y, m] = ym.split("-").map((x) => Number(x));
    const d = new Date(y, (m || 1) - 1, 1);
    d.setMonth(d.getMonth() + add);
    const yy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    return `${yy}-${mm}`;
  } catch {
    return monthInputDefault(10);
  }
}

function defaultLiving(income: number): LivingAfterInputs {
  const base = Math.max(0, income || 0);
  return {
    housing_monthly: base * 0.18,
    food_monthly: base * 0.15,
    transport_monthly: base * 0.08,
    utilities_monthly: base * 0.05,
    lifestyle_monthly: base * 0.06,
    parents_monthly: base * 0.03,
    insurance_monthly: base * 0.03,
    joint_saving_monthly: base * 0.07,
  };
}

export default function NikahClient() {
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>(emptyAnswers());

  const [finance, setFinance] = useState({
    income_monthly: 12000000,
    savings_now: 15000000,
    debt_monthly: 0,
    wedding_month: monthInputDefault(10),

    family_support_pct: 0, // 0..100 (di-screen 3)
  });

  // pengaturan skenario
  const [reducePct, setReducePct] = useState(25); // 0..60
  const [comboMonth, setComboMonth] = useState(addMonthsToYM(monthInputDefault(10), 6));

  const [breakdownOverrides, setBreakdownOverrides] =
    useState<WizardDraft["breakdownOverrides"]>({});
  const [living, setLiving] = useState<LivingAfterInputs>(() => defaultLiving(12000000));
  const [pickedScenario, setPickedScenario] = useState<"A" | "B" | "C" | null>(null);

  // ✅ UI error (toast)
  const [uiError, setUiError] = useState<string | null>(null);

  const errTimer = useRef<number | null>(null);
  function showError(msg: string) {
    setUiError(msg);
    if (errTimer.current) window.clearTimeout(errTimer.current);
    errTimer.current = window.setTimeout(() => setUiError(null), 2400);
  }

  function missingAnswersLabel(a: Answers) {
    const missing: string[] = [];
    if (a.q1_scale === null) missing.push("Q1 Skala acara");
    if (a.q2_venue === null) missing.push("Q2 Tempat acara");
    if (a.q3_adat === null) missing.push("Q3 Adat & tradisi");
    if (a.q4_docs === null) missing.push("Q4 Dokumentasi");
    if (a.q5_experience === null) missing.push("Q5 Pengalaman tamu");
    if (a.q6_priority === null) missing.push("Q6 Fokus utama");
    if (a.q7_support === null) missing.push("Q7 Dukungan keluarga");
    return missing;
  }

  // Load draft once
  useEffect(() => {
    const d = loadDraft();
    if (!d) {
      // initial default comboMonth based on current finance wedding month
      setComboMonth(addMonthsToYM(monthInputDefault(10), 6));
      return;
    }

    setStep(d.step ?? 0);
    setAnswers(d.answers ?? emptyAnswers());

    setFinance((p) => ({
      ...p,
      ...(d.finance ?? {}),
      family_support_pct: (d.finance as any)?.family_support_pct ?? p.family_support_pct ?? 0,
    }));

    setReducePct(Number(d.scenario_reduce_pct ?? 25));

    // fallback: wedding_month draft, else default
    const wMonth = (d.finance as any)?.wedding_month ?? monthInputDefault(10);
    setComboMonth(d.scenario_postpone_month ?? addMonthsToYM(wMonth, 6));

    setBreakdownOverrides(d.breakdownOverrides ?? {});
    setLiving(d.living ?? defaultLiving((d.finance as any)?.income_monthly || 12000000));
    setPickedScenario((d as any)?.pickedScenarioKey ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Jika wedding_month berubah, default comboMonth ikut menyesuaikan (kalau kosong/invalid)
  useEffect(() => {
    const ideal = addMonthsToYM(finance.wedding_month, 6);
    if (!comboMonth || comboMonth.length < 7) setComboMonth(ideal);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finance.wedding_month]);

  // Auto update living defaults when income changes (only if user hasn't edited much)
  useEffect(() => {
    const sum = Object.values(living).reduce((a, b) => a + (Number(b) || 0), 0);
    if (sum === 0) setLiving(defaultLiving(finance.income_monthly));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finance.income_monthly]);

  const breakdown = useMemo(
    () => buildBreakdown(answers, breakdownOverrides || {}, finance.family_support_pct),
    [answers, breakdownOverrides, finance.family_support_pct]
  );

  const reality = useMemo(() => calcReality(finance as any, living), [finance, living]);

  // NOTE: assumes your calcSnapshot signature already supports (finance, personalCost, monthlyExpense)
  const snapshot = useMemo(
    () => calcSnapshot(finance as any, breakdown.personal_total, reality.living_monthly_total),
    [finance, breakdown.personal_total, reality.living_monthly_total]
  );

  const scenarios = useMemo(
    () =>
      calcScenarios(finance as any, breakdown, snapshot, {
        reducePct,
        postponeMonth: comboMonth,
        monthlyExpense: reality.living_monthly_total,
      }),
    [finance, breakdown, snapshot, reducePct, comboMonth, reality.living_monthly_total]
  );

  const statusExplain: any = {
    AMAN: {
      title: "Aman",
      text: "Setelah bayar nikah, kamu masih punya dana aman yang cukup.",
      tip: "Tetap sisakan buffer & pastikan biaya hidup setelah nikah realistis.",
    },
    KETAT: {
      title: "Ketat",
      text: "Masih bisa jalan, tapi ruang napasnya tipis.",
      tip: "Pertimbangkan tambah waktu persiapan atau turunkan beberapa komponen biaya.",
    },
    BERISIKO: {
      title: "Berisiko",
      text: "Sisa dana aman terlalu kecil (atau minus).",
      tip: "Prioritaskan aman setelah nikah: turunkan biaya atau pilih kombinasi yang lebih ringan.",
    },
  };

  const saveTimer = useRef<any>(null);

  // Persist draft on changes (debounced)
  useEffect(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);

    saveTimer.current = setTimeout(() => {
      const draft: WizardDraft = {
        step,
        answers,
        finance: finance as any,
        scenario_reduce_pct: reducePct,
        scenario_postpone_month: comboMonth,
        breakdownOverrides,
        living,
        // optional: kalau types kamu belum punya, aman diabaikan
        // @ts-ignore
        pickedScenarioKey: pickedScenario ?? undefined,
      };
      saveDraft(draft);
    }, 250);

    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [step, answers, finance, reducePct, comboMonth, breakdownOverrides, living, pickedScenario]);

  // ✅ validasi tetap di next(), jadi footer TIDAK usah disabled
  function next() {
    if (step === 2) {
      const missing = missingAnswersLabel(answers);
      if (missing.length > 0) {
        showError(`Masih ada yang belum diisi: ${missing.join(", ")}.`);
        return;
      }
    }

    if (step === 8) {
      if (!pickedScenario) {
        showError("Pilih dulu strategi yang paling bisa kamu jalani.");
        return;
      }
    }

    setStep((s) => Math.min(9, s + 1));
  }

  function back() {
    setStep((s) => Math.max(0, s - 1));
  }

  function finish() {
    const final: FinalResult = {
      answers,
      finance: finance as any,
      scenario_reduce_pct: reducePct,
      scenario_postpone_month: comboMonth,
      breakdown,
      snapshot,
      living,
      reality,
      scenarios,
      pickedScenarioKey: pickedScenario ?? undefined,
    };
    saveFinal(final);
    router.push("/rencana-nikah/hasil");
  }

  const opt5 = (labels: string[]) =>
    labels.map((label, i) => ({ value: (i + 1) as 1 | 2 | 3 | 4 | 5, label }));

  return (
    <main className="wrapN">
      <ProgressBar step={step} total={TOTAL_STEPS} />

      {/* SCREEN 0 */}
      {step === 0 && (
        <StepCard title="Rencana Persiapan Nikah" subtitle="Biar nikahnya jalan, dan hidup setelahnya tetap aman.">
          <div className="bullets">
            <div>• Dapat estimasi biaya nikah yang bisa kamu edit</div>
            <div>• Tahu apakah tabunganmu cukup (atau kurang berapa)</div>
            <div>• Dapat target nabung/bulan yang realistis (pakai tabungan existing)</div>
          </div>
        </StepCard>
      )}

      {/* SCREEN 1 */}
      {step === 1 && (
        <StepCard title="Konteks dulu" subtitle="Biar hitungannya sesuai situasi kamu.">
          <label className="field">
            <div className="fieldLabel">Target nikah (bulan-tahun)</div>
            <input
              className="input"
              type="month"
              value={finance.wedding_month}
              onChange={(e) => setFinance((p) => ({ ...p, wedding_month: e.target.value }))}
            />
          </label>
        </StepCard>
      )}

      {/* SCREEN 2 */}
      {step === 2 && (
        <StepCard title="Gambaran pernikahan" subtitle="Ini untuk bikin estimasi awal. Semua bisa kamu ubah nanti.">
          <Option5
            label="Q1 — Skala acara"
            value={1}
            current={answers.q1_scale}
            onChange={(v) => setAnswers((p) => ({ ...p, q1_scale: v as any }))}
            options={opt5(["Sangat kecil", "Kecil & intimate", "Sedang & wajar", "Besar", "Sangat besar"])}
          />

          <Option5
            label="Q2 — Tempat acara utama"
            value={1}
            current={answers.q2_venue}
            onChange={(v) => setAnswers((p) => ({ ...p, q2_venue: v as any }))}
            options={opt5(["Rumah", "Gedung sederhana", "Gedung menengah", "Ballroom hotel", "Premium/destination"])}
          />

          <Option5
            label="Q3 — Konsep adat & tradisi"
            value={1}
            current={answers.q3_adat}
            onChange={(v) => setAnswers((p) => ({ ...p, q3_adat: v as any }))}
            options={opt5(["Tanpa adat", "Adat sederhana", "1 adat utama", "Beberapa rangkaian", "Adat lengkap"])}
          />

          <Option5
            label="Q4 — Dokumentasi (prewedding sudah termasuk)"
            value={1}
            current={answers.q4_docs}
            onChange={(v) => setAnswers((p) => ({ ...p, q4_docs: v as any }))}
            options={opt5(["Standar", "Foto profesional", "Foto + video", "Plus cinematic", "Lengkap & detail"])}
          />

          <Option5
            label="Q5 — Pengalaman tamu & detail"
            value={1}
            current={answers.q5_experience}
            onChange={(v) => setAnswers((p) => ({ ...p, q5_experience: v as any }))}
            options={opt5(["Sangat sederhana", "Sederhana rapi", "Ada sentuhan", "Berkesan", "Sangat niat"])}
          />

          <Option5
            label="Q6 — Fokus utama kalian"
            value={1}
            current={answers.q6_priority}
            onChange={(v) => setAnswers((p) => ({ ...p, q6_priority: v as any }))}
            options={opt5([
              "Hemat semaksimal mungkin",
              "Keuangan aman setelah nikah",
              "Nyaman buat keluarga",
              "Momen spesial yang wajar",
              "Sekali seumur hidup (maksimal)",
            ])}
          />
          <div className="hint">Tenang, ini cuma buat estimasi awal. Nanti bisa kamu ubah.</div>

          <Option5
            label="Q7 — Dukungan keluarga (untuk estimasi awal)"
            value={1}
            current={answers.q7_support}
            onChange={(v) => {
              const q7 = v as any;
              setAnswers((p) => ({ ...p, q7_support: q7 }));
              setFinance((p) => ({ ...p, family_support_pct: defaultSupportPct(q7) }));
            }}
            options={opt5([
              "Mandiri (kita biayai sendiri)",
              "Dibantu sedikit",
              "Dibantu sebagian",
              "Mayoritas ditanggung keluarga",
              "Hampir semua ditanggung keluarga",
            ])}
          />
        </StepCard>
      )}

      {/* SCREEN 3 */}
      {step === 3 && (
        <>
          <StepCard title="Estimasi biaya nikah" subtitle="Ini estimasi awal. Kamu bisa atur sampai masuk akal.">
            <Accordion title="Resepsi" defaultOpen>
              <MoneyInput
                label="Catering (total)"
                value={breakdown.catering_cost}
                onChange={(n) => setBreakdownOverrides((p) => ({ ...p, catering_cost: n }))}
                hint={`Default: tamu ${breakdown.guest_count} × ${fmtIDR(breakdown.catering_price)}`}
              />
              <MoneyInput
                label="Venue"
                value={breakdown.venue_cost}
                onChange={(n) => setBreakdownOverrides((p) => ({ ...p, venue_cost: n }))}
              />
              <MoneyInput
                label="Dekor"
                value={breakdown.decor_base}
                onChange={(n) => setBreakdownOverrides((p) => ({ ...p, decor_base: n }))}
              />
              <MoneyInput
                label="WO / EO"
                value={breakdown.wo_cost}
                onChange={(n) => setBreakdownOverrides((p) => ({ ...p, wo_cost: n }))}
              />
            </Accordion>

            <Accordion title="Adat & Busana" defaultOpen>
              <MoneyInput
                label="Adat & busana"
                value={breakdown.adat_cost}
                onChange={(n) => setBreakdownOverrides((p) => ({ ...p, adat_cost: n }))}
              />
            </Accordion>

            <Accordion title="Dokumentasi" defaultOpen>
              <MoneyInput
                label="Dokumentasi (include prewedding)"
                value={breakdown.documentation_cost}
                onChange={(n) => setBreakdownOverrides((p) => ({ ...p, documentation_cost: n }))}
              />
            </Accordion>

            <Accordion title="Souvenir & detail" defaultOpen>
              <MoneyInput
                label="Souvenir / hiburan / detail"
                value={breakdown.guest_experience_cost}
                onChange={(n) => setBreakdownOverrides((p) => ({ ...p, guest_experience_cost: n }))}
              />
            </Accordion>

            <div className="hint">Buffer tak terduga otomatis: {(breakdown.buffer_rate * 100).toFixed(0)}%</div>

            <div className="field" style={{ marginTop: 12 }}>
              <div className="fieldLabel">Perkiraan porsi yang ditanggung keluarga</div>
              <div className="rowBetween gap">
                <input
                  className="range"
                  type="range"
                  min={0}
                  max={100}
                  value={finance.family_support_pct}
                  onChange={(e) => setFinance((p) => ({ ...p, family_support_pct: Number(e.target.value) }))}
                />
                <div className="pill">{finance.family_support_pct}%</div>
              </div>
              <div className="hint">
                Total yang perlu kamu siapkan otomatis menyesuaikan (kamu menanggung sekitar{" "}
                <b>{100 - finance.family_support_pct}%</b>).
              </div>
            </div>
          </StepCard>

          <SummaryBar total={breakdown.personal_total} />
        </>
      )}

      {/* SCREEN 4 */}
      {step === 4 && (
        <StepCard title="Kondisi keuangan saat ini" subtitle="Biar hitungannya jujur dan realistis.">
          <MoneyInput
            label="Penghasilan gabungan / bulan"
            value={finance.income_monthly}
            onChange={(n) => setFinance((p) => ({ ...p, income_monthly: n }))}
          />
          <MoneyInput
            label="Tabungan saat ini (yang siap dipakai)"
            value={finance.savings_now}
            onChange={(n) => setFinance((p) => ({ ...p, savings_now: n }))}
            hint="Asumsi: tabungan ini boleh dipakai untuk biaya nikah."
          />
          <MoneyInput
            label="Cicilan bulanan (jika ada)"
            value={finance.debt_monthly}
            onChange={(n) => setFinance((p) => ({ ...p, debt_monthly: n }))}
          />
        </StepCard>
      )}

      {/* SCREEN 5 */}
      {step === 5 && (
        <StepCard title="Biaya hidup setelah nikah" subtitle="Edit sesuai realita. Ini yang sering dilupakan.">
          <MoneyInput
            label="Hunian (kontrak/KPR/numpang)"
            value={living.housing_monthly}
            onChange={(n) => setLiving((p) => ({ ...p, housing_monthly: n }))}
          />
          <MoneyInput label="Makan" value={living.food_monthly} onChange={(n) => setLiving((p) => ({ ...p, food_monthly: n }))} />
          <MoneyInput
            label="Transport"
            value={living.transport_monthly}
            onChange={(n) => setLiving((p) => ({ ...p, transport_monthly: n }))}
          />
          <MoneyInput
            label="Utilitas & internet"
            value={living.utilities_monthly}
            onChange={(n) => setLiving((p) => ({ ...p, utilities_monthly: n }))}
          />
          <MoneyInput
            label="Gaya hidup"
            value={living.lifestyle_monthly}
            onChange={(n) => setLiving((p) => ({ ...p, lifestyle_monthly: n }))}
          />
          <MoneyInput
            label="Kirim orang tua (jika ada)"
            value={living.parents_monthly}
            onChange={(n) => setLiving((p) => ({ ...p, parents_monthly: n }))}
          />
          <MoneyInput
            label="Asuransi"
            value={living.insurance_monthly}
            onChange={(n) => setLiving((p) => ({ ...p, insurance_monthly: n }))}
          />
          <MoneyInput
            label="Tabungan bersama"
            value={living.joint_saving_monthly}
            onChange={(n) => setLiving((p) => ({ ...p, joint_saving_monthly: n }))}
          />
          <div className="hint">
            Total biaya bulanan (incl cicilan): <b>{fmtIDR(reality.living_monthly_total)}</b>
          </div>
        </StepCard>
      )}

      {/* SCREEN 6 */}
      {step === 6 && (
        <StepCard title="Snapshot dampak" subtitle="Biar kamu nggak kaget setelah hari H.">
          <div className="rowBetween">
            <div className="h3">Kondisi Persiapan</div>
            <ResultBadge status={snapshot.status} />
          </div>

          <div className="kv">
            <div className="muted">Biaya nikah setara</div>
            <div className="strong">
              {Number.isFinite((snapshot as any).wedding_expense_months)
                ? (snapshot as any).wedding_expense_months.toFixed(1)
                : "—"}{" "}
              bulan biaya hidup
            </div>
          </div>

          <div className="kv">
            <div className="muted">Sisa tabungan setelah nikah</div>
            <div className="strong">{fmtIDR(snapshot.savings_after_wedding)}</div>
          </div>

          <div className="kv">
            <div className="muted">Dana aman tersisa (setelah bayar nikah)</div>
            <div className="strong">
              {Number.isFinite(snapshot.safe_months_after) ? snapshot.safe_months_after.toFixed(1) : "—"} bulan
            </div>
          </div>

          <div className="hint" style={{ marginTop: 8 }}>
            Dana aman = <b>sisa tabungan setelah nikah</b> ÷ <b>biaya hidup per bulan</b>.
            <br />
            Contoh: kalau sisa tabungan Rp 30 juta & biaya hidup Rp 10 juta/bulan → dana aman = 3 bulan.
          </div>

          <div className="note">
            <b>{statusExplain[snapshot.status]?.title}:</b> {statusExplain[snapshot.status]?.text}
            <div className="muted" style={{ marginTop: 6 }}>
              Saran: {statusExplain[snapshot.status]?.tip}
            </div>
          </div>
        </StepCard>
      )}

      {/* SCREEN 7 */}
      {step === 7 && (
        <StepCard title="Reality check" subtitle="Ini yang paling terasa di 6 bulan awal.">
          <div className="kv">
            <div className="muted">Sisa penghasilan yang bisa ditabung</div>
            <div className="strong">{fmtIDR(reality.monthly_margin)}</div>
          </div>
          <div className="kv">
            <div className="muted">Perkiraan 6 bulan awal</div>
            <div className="strong">{reality.first_6_months_risk}</div>
          </div>
          <div className="note">
            Kalau sisa penghasilan tipis, biasanya yang bikin stres bukan acaranya — tapi bulan-bulan setelahnya.
          </div>
        </StepCard>
      )}

      {/* SCREEN 8 */}
      {step === 8 && (
        <StepCard title="Pilih strategi yang paling bisa kamu jalani" subtitle="Kamu bebas atur penurunan gaya dan (kalau perlu) mundurkan tanggal.">
          <ScenarioCards
            scenarios={scenarios}
            picked={pickedScenario}
            onPick={setPickedScenario}
            reducePct={reducePct}
            onReducePct={setReducePct}
            comboMonth={comboMonth}
            onComboMonth={setComboMonth}
          />
          <div className="hint" style={{ marginTop: 10 }}>
            Target nabung/bulan sudah otomatis memperhitungkan tabungan yang sudah ada.
          </div>
        </StepCard>
      )}

      {/* SCREEN 9 */}
      {step === 9 && (
        <StepCard title="Rencana bulanan" subtitle="Biar bisa dieksekusi, bukan cuma wacana.">
          {(() => {
            const chosen = scenarios.find((s) => s.key === (pickedScenario ?? "A"))!;
            return (
              <>
                <div className="kv">
                  <div className="muted">Target nabung / bulan</div>
                  <div className="strong">{fmtIDR(chosen.saving_per_month)}</div>
                </div>

                <div className="kv">
                  <div className="muted">Estimasi biaya nikah (dana pribadi)</div>
                  <div className="strong">{fmtIDR(chosen.personal_wedding_cost)}</div>
                </div>

                <div className="note">
                  Tips: kalau target nabung terasa berat, turunkan beberapa komponen biaya atau pilih strategi kombinasi.
                </div>
              </>
            );
          })()}
        </StepCard>
      )}

      {/* ✅ TOAST ERROR: taruh di bawah semua screen, sebelum footer */}
      {uiError && (
        <div className="toastError" role="alert" aria-live="polite">
          {uiError}
        </div>
      )}

      <StickyFooter
        secondaryLabel={step > 0 ? "Kembali" : undefined}
        onSecondary={step > 0 ? back : undefined}
        primaryLabel={step === 0 ? "Mulai" : step === 9 ? "Lihat ringkasan" : "Lanjut"}
        onPrimary={() => {
          if (step === 9) finish();
          else next();
        }}
        // ✅ jangan disable, biar bisa klik dan muncul error message
        disabled={false}
      />
    </main>
  );
}
