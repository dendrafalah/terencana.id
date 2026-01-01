"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import type { FinalResult } from "@/lib/rencana-nikah/types";
import { fmtIDR } from "@/lib/rencana-nikah/format";
import { loadFinal, clearAll, loadDraft, saveDraft } from "@/lib/rencana-nikah/storage";
import ResultBadge from "../components/ResultBadge";

function fmtMonthID(ym: string) {
  try {
    if (!ym || ym.length < 7) return "-";
    const [y, m] = ym.split("-").map((x) => Number(x));
    const d = new Date(y, (m || 1) - 1, 1);
    return d.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
  } catch {
    return ym || "-";
  }
}

function clamp0(n: number) {
  return Number.isFinite(n) ? n : 0;
}

function safeNum(n: any) {
  const x = Number(n);
  return Number.isFinite(x) ? x : 0;
}

function statusLabel(status: "AMAN" | "KETAT" | "BERISIKO") {
  if (status === "AMAN") return "Aman";
  if (status === "KETAT") return "Ketat";
  return "Berisiko";
}

export default function HasilClient() {
  const router = useRouter();
  const [data, setData] = useState<FinalResult | null>(null);

  useEffect(() => {
    setData(loadFinal());
  }, []);

  const picked = useMemo(() => {
    if (!data) return null;
    const key = data.pickedScenarioKey;
    return key ? data.scenarios.find((s) => s.key === key) ?? data.scenarios[0] : data.scenarios[0];
  }, [data]);

  if (!data || !picked) {
    return (
      <main className="wrapN">
        <div className="card">
          <h1 className="h2">Belum ada hasil</h1>
          <p className="muted">Coba isi rencana nikah dulu ya.</p>
          <button className="btn btnPrimary" onClick={() => router.push("/rencana-nikah")}>
            Mulai rencana nikah
          </button>
        </div>
      </main>
    );
  }

  const weddingMonthText = fmtMonthID(data.finance.wedding_month);

  const income = clamp0(safeNum(data.finance.income_monthly));
  const savings = clamp0(safeNum(data.finance.savings_now));
  const debt = clamp0(safeNum(data.finance.debt_monthly));

  // reality.living_monthly_total kamu sudah include cicilan di calcReality
  const spendPlusDebt = clamp0(safeNum(data.reality.living_monthly_total));
  const leftoverToSave = clamp0(safeNum(data.reality.monthly_margin));

  const familyPct =
    (data.finance as any)?.family_support_pct !== undefined
      ? clamp0(safeNum((data.finance as any).family_support_pct))
      : null;

  const personalPct = familyPct === null ? null : Math.max(0, 100 - familyPct);

  // biaya nikah
  const totalWeddingEstimate = clamp0(safeNum(data.breakdown.total_before_support || 0)); // sudah include buffer
  const personalWeddingCost = clamp0(safeNum(picked.personal_wedding_cost || 0));
  const targetSave = clamp0(safeNum(picked.saving_per_month || 0));

  // snapshot
  const savingsAfter = clamp0(safeNum(data.snapshot.savings_after_wedding || 0));
  const safeMonths = Number.isFinite(data.snapshot.safe_months_after) ? data.snapshot.safe_months_after : 0;

  // === EXPLAIN SNAPSHOT DENGAN PATOKAN PENGELUARAN BULANAN ===
  // safeMonths artinya: sisa tabungan setelah bayar nikah / (biaya hidup + cicilan per bulan)
  const snapshotExplain = (() => {
    const monthsText = Number.isFinite(safeMonths) ? safeMonths.toFixed(1) : "-";

    if (savingsAfter < 0) {
      return {
        headline: `Tabungan kamu kurang ${fmtIDR(Math.abs(savingsAfter))} untuk menutup biaya nikah.`,
        sub: `Kalau biaya nikah dibayar dari tabungan sekarang, tabunganmu akan minus.`,
        why:
          "Solusi paling cepat biasanya: turunkan biaya nikah, tambah waktu persiapan, atau cari dukungan keluarga (kalau memungkinkan).",
      };
    }

    // kalau expense 0, jangan bikin user bingung
    if (spendPlusDebt <= 0) {
      return {
        headline: `Sisa tabungan setelah nikah: ${fmtIDR(savingsAfter)}.`,
        sub: `Kamu belum mengisi biaya hidup (atau nilainya 0), jadi indikator “berapa bulan aman” belum bisa dihitung dengan akurat.`,
        why: "Isi estimasi biaya hidup supaya statusnya lebih relevan.",
      };
    }

    // thresholds: 6 bulan aman / 3 bulan ketat (sudah di calcSnapshot)
    if (data.snapshot.status === "AMAN") {
      return {
        headline: `Setelah nikah, tabunganmu masih cukup untuk sekitar ${monthsText} bulan biaya hidup.`,
        sub: `Artinya, kamu masih punya “ruang napas” kalau ada kejadian tak terduga.`,
        why: `Patokan: sisa tabungan setelah nikah ÷ (biaya hidup + cicilan per bulan).`,
      };
    }

    if (data.snapshot.status === "KETAT") {
      return {
        headline: `Setelah nikah, tabunganmu kira-kira cukup untuk ${monthsText} bulan biaya hidup.`,
        sub: `Masih bisa jalan, tapi ruang napasnya tipis (kalau ada kejadian mendadak bisa terasa berat).`,
        why: `Target yang sehat biasanya ≥ 6 bulan biaya hidup.`,
      };
    }

    return {
      headline: `Setelah nikah, tabunganmu kira-kira hanya cukup untuk ${monthsText} bulan biaya hidup.`,
      sub: `Ini sering jadi sumber stres di bulan-bulan awal: keuangan terasa “kejar-kejaran”.`,
      why: `Pertimbangkan turunkan biaya nikah / tambah waktu persiapan / kurangi biaya hidup sementara.`,
    };
  })();

  // detail items (nikah)
  const weddingDetail = [
    { label: "Catering", value: clamp0(safeNum(data.breakdown.catering_cost || 0)) },
    { label: "Venue", value: clamp0(safeNum(data.breakdown.venue_cost || 0)) },
    { label: "Dekor", value: clamp0(safeNum(data.breakdown.decor_base || 0)) },
    { label: "WO / EO", value: clamp0(safeNum(data.breakdown.wo_cost || 0)) },
    { label: "Adat & busana", value: clamp0(safeNum(data.breakdown.adat_cost || 0)) },
    { label: "Dokumentasi (incl. prewedding)", value: clamp0(safeNum(data.breakdown.documentation_cost || 0)) },
    { label: "Souvenir / hiburan / detail", value: clamp0(safeNum(data.breakdown.guest_experience_cost || 0)) },
    { label: "Buffer tak terduga", value: clamp0(safeNum(data.breakdown.buffer_cost || 0)) },
  ];

  // detail items (hidup)
  const livingDetail = [
    { label: "Hunian", value: clamp0(safeNum(data.living.housing_monthly || 0)) },
    { label: "Makan", value: clamp0(safeNum(data.living.food_monthly || 0)) },
    { label: "Transport", value: clamp0(safeNum(data.living.transport_monthly || 0)) },
    { label: "Utilitas & internet", value: clamp0(safeNum(data.living.utilities_monthly || 0)) },
    { label: "Gaya hidup", value: clamp0(safeNum(data.living.lifestyle_monthly || 0)) },
    { label: "Kirim orang tua", value: clamp0(safeNum(data.living.parents_monthly || 0)) },
    { label: "Asuransi", value: clamp0(safeNum(data.living.insurance_monthly || 0)) },
    { label: "Tabungan bersama", value: clamp0(safeNum(data.living.joint_saving_monthly || 0)) },
    { label: "Cicilan", value: debt },
  ];

  const shareText =
    `Ringkasan Rencana Nikah\n` +
    `- Target nikah: ${weddingMonthText}\n` +
    `- Penghasilan gabungan/bulan: ${fmtIDR(income)}\n` +
    `- Tabungan sekarang: ${fmtIDR(savings)}\n` +
    `- Cicilan/bulan: ${fmtIDR(debt)}\n` +
    (familyPct !== null ? `- Ditanggung keluarga: ${familyPct}% (kamu siapkan ${personalPct}%)\n` : "") +
    `\nEstimasi:\n` +
    `- Total biaya nikah (estimasi): ${fmtIDR(totalWeddingEstimate)}\n` +
    `- Dana yang kamu siapkan (estimasi): ${fmtIDR(personalWeddingCost)}\n` +
    `- Target nabung/bulan: ${fmtIDR(targetSave)}\n` +
    `\nSetelah nikah (estimasi):\n` +
    `- Biaya hidup + cicilan/bulan: ${fmtIDR(spendPlusDebt)}\n` +
    `- Sisa penghasilan yang bisa ditabung: ${fmtIDR(leftoverToSave)}\n` +
    `- Status snapshot: ${statusLabel(data.snapshot.status)}\n`;

  return (
    <main className="wrapN">
      {/* ======================
          SECTION 1: RINGKASAN
          ====================== */}
      <div className="card">
        <div className="no-print rowBetween" style={{ marginBottom: 6 }}>
          <div>
            <h1 className="h2" style={{ marginBottom: 2 }}>
              Ringkasan Rencana Nikah
            </h1>
            <p className="muted" style={{ margin: 0 }}>
              Ringkasan cepat untuk diskusi berdua.
            </p>
          </div>

          <div className="printOnly muted" />
        </div>

        <div className="kv">
          <div className="muted">Target nikah</div>
          <div className="strong">{weddingMonthText}</div>
        </div>

        <div className="kv">
          <div className="muted">Penghasilan gabungan / bulan</div>
          <div className="strong">{fmtIDR(income)}</div>
        </div>

        <div className="kv">
          <div className="muted">Tabungan saat ini</div>
          <div className="strong">{fmtIDR(savings)}</div>
        </div>

        <div className="kv">
          <div className="muted">Cicilan bulanan</div>
          <div className="strong">{fmtIDR(debt)}</div>
        </div>

        {familyPct !== null && (
          <div className="kv">
            <div className="muted">Porsi ditanggung keluarga</div>
            <div className="strong">
              {familyPct}%{" "}
              <span className="muted" style={{ fontWeight: 700 }}>
                (kamu siapkan {personalPct}%)
              </span>
            </div>
          </div>
        )}

        <div className="kv">
          <div className="muted">Status persiapan (snapshot)</div>
          <div className="strong">
            <ResultBadge status={data.snapshot.status} />
          </div>
        </div>

        <div className="note" style={{ marginTop: 10 }}>
          <div style={{ fontWeight: 900 }}>{snapshotExplain.headline}</div>
          <div className="muted" style={{ marginTop: 6 }}>
            {snapshotExplain.sub}
          </div>
          <div className="hint" style={{ marginTop: 8 }}>
            {snapshotExplain.why}
          </div>
        </div>

        <div className="kv">
          <div className="muted">Estimasi total biaya nikah</div>
          <div className="strong">{fmtIDR(totalWeddingEstimate)}</div>
        </div>

        <div className="kv">
          <div className="muted">Estimasi biaya nikah (dana pribadi)</div>
          <div className="strong">{fmtIDR(personalWeddingCost)}</div>
        </div>

        <div className="kv">
          <div className="muted">Target nabung / bulan</div>
          <div className="strong">{fmtIDR(targetSave)}</div>
        </div>

        <div className="kv">
          <div className="muted">Biaya hidup + cicilan / bulan (estimasi)</div>
          <div className="strong">{fmtIDR(spendPlusDebt)}</div>
        </div>

        <div className="kv">
          <div className="muted">Sisa penghasilan yang bisa ditabung</div>
          <div className="strong">{fmtIDR(leftoverToSave)}</div>
        </div>

        <div className="hint" style={{ marginTop: 10 }}>
          Sisa penghasilan = penghasilan bulanan − (biaya hidup + cicilan).
        </div>

        {/* ACTIONS */}
        <div className="rowBetween gap no-print">
          <button
            className="btn btnGhost"
            onClick={() => {
              // reset total
              clearAll();
              router.push("/rencana-nikah");
            }}
          >
            Coba hitung ulang dari awal
          </button>

          <div style={{ display: "flex", gap: 10 }}>
            <button
              className="btn btnGhost"
              onClick={() => {
                // balik ke wizard step yang relevan tanpa reset
                const d = loadDraft();
                if (d) saveDraft({ ...d, step: 3 }); // step 3 = Estimasi biaya nikah
                router.push("/rencana-nikah");
              }}
            >
              Perbaiki isian
            </button>

            <button className="btn btnGhost" onClick={() => window.print()}>
              Simpan PDF
            </button>

            <button
              className="btn btnPrimary"
              onClick={() => {
                if (navigator.share) navigator.share({ text: shareText });
                else {
                  navigator.clipboard?.writeText(shareText);
                  alert("Ringkasan disalin.");
                }
              }}
            >
              Share ringkasan
            </button>
          </div>
        </div>
      </div>

      {/* ======================
          SECTION 2: DETAIL
          ====================== */}
      <div className="card printBlock" style={{ marginTop: 12 }}>
        <h2 className="h2" style={{ marginBottom: 2 }}>
          Detail Perhitungan
        </h2>
        <p className="muted">Rincian biar kamu tahu angka ini datang dari mana.</p>

        <div style={{ marginTop: 10, fontWeight: 900 }}>Detail biaya nikah (estimasi)</div>
        <div className="hint" style={{ marginTop: 6 }}>
          Total sudah termasuk buffer tak terduga. Dana pribadi mengikuti porsi dukungan keluarga (kalau diisi).
        </div>

        <div style={{ marginTop: 8 }}>
          {weddingDetail.map((it) => (
            <div className="kv" key={it.label}>
              <div className="muted">{it.label}</div>
              <div className="strong">{fmtIDR(it.value)}</div>
            </div>
          ))}
        </div>

        <div className="kv" style={{ marginTop: 6 }}>
          <div className="muted" style={{ fontWeight: 900 }}>
            Total (estimasi)
          </div>
          <div className="strong">{fmtIDR(totalWeddingEstimate)}</div>
        </div>

        <div className="kv">
          <div className="muted" style={{ fontWeight: 900 }}>
            Dana pribadi (estimasi)
          </div>
          <div className="strong">{fmtIDR(personalWeddingCost)}</div>
        </div>

        <div style={{ marginTop: 14, fontWeight: 900 }}>Detail biaya hidup per bulan (estimasi)</div>
        <div className="hint" style={{ marginTop: 6 }}>
          Ini angka yang paling sering bikin “kaget” setelah nikah.
        </div>

        <div style={{ marginTop: 8 }}>
          {livingDetail.map((it) => (
            <div className="kv" key={it.label}>
              <div className="muted">{it.label}</div>
              <div className="strong">{fmtIDR(it.value)}</div>
            </div>
          ))}
        </div>

        <div className="kv" style={{ marginTop: 6 }}>
          <div className="muted" style={{ fontWeight: 900 }}>
            Total biaya hidup + cicilan / bulan
          </div>
          <div className="strong">{fmtIDR(spendPlusDebt)}</div>
        </div>

        <div className="kv">
          <div className="muted" style={{ fontWeight: 900 }}>
            Sisa penghasilan yang bisa ditabung
          </div>
          <div className="strong">{fmtIDR(leftoverToSave)}</div>
        </div>

        <div className="printOnly hint" style={{ marginTop: 10 }}>
          Dicetak dari terencana.id — ringkasan ini bersifat estimasi dan bisa berbeda sesuai kondisi nyata.
        </div>
      </div>
    </main>
  );
}
