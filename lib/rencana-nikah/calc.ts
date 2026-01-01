import type {
  Answers,
  FinanceInputs,
  LivingAfterInputs,
  RealityCheck,
  Scenario,
  Snapshot,
  WeddingBreakdown,
} from "./types";
import {
  adatCostByChoice,
  cateringPriceByScale,
  defaultBufferRate,
  docsCostByChoice,
  experienceCostByChoice,
  guestCountByScale,
  venueCostByChoice,
} from "./defaults";
import { clamp, diffMonth } from "./format";

function req<T>(v: T | null, fallback: T): T {
  return v === null ? fallback : v;
}

/**
 * Build wedding cost breakdown
 * - total_before_support: total estimasi biaya nikah (sudah termasuk buffer)
 * - personal_total: total yang perlu kamu siapkan (setelah porsi keluarga)
 */
export function buildBreakdown(
  answers: Answers,
  overrides?: Partial<
    Pick<
      WeddingBreakdown,
      | "catering_cost"
      | "venue_cost"
      | "decor_base"
      | "adat_cost"
      | "documentation_cost"
      | "guest_experience_cost"
      | "wo_cost"
      | "buffer_rate"
    >
  >,
  familySupportPct?: number // 0..100 (porsi ditanggung keluarga)
): WeddingBreakdown {
  // fallback choice: 3 (sedang) kalau belum jawab
  const q1 = req(answers.q1_scale, 3);
  const q2 = req(answers.q2_venue, 3);
  const q3 = req(answers.q3_adat, 3);
  const q4 = req(answers.q4_docs, 3);
  const q5 = req(answers.q5_experience, 3);

  const guest_count = guestCountByScale(q1);
  const catering_price = cateringPriceByScale(q1);

  const catering_cost_default = guest_count * catering_price;
  const venue_cost_default = venueCostByChoice(q2);
  const decor_base_default = venue_cost_default * 0.3;

  const adat_cost_default = adatCostByChoice(q3);
  const documentation_cost_default = docsCostByChoice(q4);
  const guest_experience_cost_default = experienceCostByChoice(q5);

  // WO heuristic
  let wo_cost_default = 0;
  if (q1 >= 3 || q2 >= 3 || q3 >= 3) {
    wo_cost_default = 8000000 + q1 * 1500000;
  }

  const buffer_rate_default = defaultBufferRate();

  const catering_cost = overrides?.catering_cost ?? catering_cost_default;
  const venue_cost = overrides?.venue_cost ?? venue_cost_default;
  const decor_base = overrides?.decor_base ?? decor_base_default;
  const adat_cost = overrides?.adat_cost ?? adat_cost_default;
  const documentation_cost = overrides?.documentation_cost ?? documentation_cost_default;
  const guest_experience_cost = overrides?.guest_experience_cost ?? guest_experience_cost_default;
  const wo_cost = overrides?.wo_cost ?? wo_cost_default;

  const buffer_rate = clamp(overrides?.buffer_rate ?? buffer_rate_default, 0, 0.2);

  const total_before_buffer =
    catering_cost +
    venue_cost +
    decor_base +
    adat_cost +
    documentation_cost +
    guest_experience_cost +
    wo_cost;

  const buffer_cost = total_before_buffer * buffer_rate;

  // total_before_support sudah include buffer (biar konsisten dengan UI)
  const total_before_support = total_before_buffer + buffer_cost;

  // support_factor = porsi yang kamu tanggung (misal keluarga 30% => kamu 70% => factor 0.7)
  const pct = clamp(Number(familySupportPct ?? 0), 0, 100);
  const support_factor = clamp((100 - pct) / 100, 0, 1);

  const personal_total = total_before_support * support_factor;

  return {
    guest_count,
    catering_price,
    catering_cost,

    venue_cost,
    decor_base,

    adat_cost,
    documentation_cost,
    guest_experience_cost,

    wo_cost,

    buffer_rate,
    buffer_cost,

    total_before_support,
    support_factor,
    personal_total,
  };
}

/**
 * Snapshot:
 * - fokus: "setelah bayar nikah, tabungan tersisa cukup untuk berapa bulan biaya hidup?"
 *
 * monthlyExpense: biaya hidup + cicilan per bulan (pakai reality.living_monthly_total)
 */
export function calcSnapshot(
  finance: FinanceInputs,
  personal_wedding_cost: number,
  monthlyExpense: number
): Snapshot {
  const savings = Math.max(0, finance.savings_now || 0);

  const expense = Math.max(0, monthlyExpense || 0);

  const wedding_expense_months = expense > 0 ? personal_wedding_cost / expense : Infinity;

  const savings_after_wedding = savings - personal_wedding_cost;

  // berapa bulan biaya hidup yang bisa ditutup oleh tabungan sisa
  const safe_months_after = expense > 0 ? savings_after_wedding / expense : 0;

  let status: Snapshot["status"] = "BERISIKO";
  if (safe_months_after >= 6) status = "AMAN";
  else if (safe_months_after >= 3) status = "KETAT";

  return {
    wedding_expense_months,
    savings_after_wedding,
    safe_months_after,
    status,
  };
}

export function calcReality(finance: FinanceInputs, living: LivingAfterInputs): RealityCheck {
  const living_monthly_total =
    (living.housing_monthly || 0) +
    (living.food_monthly || 0) +
    (living.transport_monthly || 0) +
    (living.utilities_monthly || 0) +
    (living.lifestyle_monthly || 0) +
    (living.parents_monthly || 0) +
    (living.insurance_monthly || 0) +
    (living.joint_saving_monthly || 0) +
    (finance.debt_monthly || 0);

  const monthly_margin = (finance.income_monthly || 0) - living_monthly_total;

  let first_6_months_risk: RealityCheck["first_6_months_risk"] = "AMAN";
  if (monthly_margin < 0) first_6_months_risk = "BERAT";
  else if (monthly_margin < (finance.income_monthly || 0) * 0.15) first_6_months_risk = "KETAT";

  return {
    living_monthly_total,
    monthly_margin,
    first_6_months_risk,
  };
}

function monthsToTarget(now: Date, ym: string) {
  const m = diffMonth(now, ym || "");
  return Math.max(1, m || 10);
}

/**
 * Nabung per bulan dengan asumsi TABUNGAN SAAT INI dipakai untuk biaya nikah.
 * Jadi yang perlu ditabung = max(0, biaya - tabungan sekarang)
 */
function savingPerMonthUsingExistingSavings(
  finance: FinanceInputs,
  personalCost: number,
  months: number
) {
  const savings = Math.max(0, finance.savings_now || 0);
  const needed = Math.max(0, personalCost - savings);
  return needed / Math.max(1, months);
}

export function calcScenarios(
  finance: FinanceInputs,
  breakdown: WeddingBreakdown,
  snapshot: Snapshot,
  params?: {
    reducePct?: number; // 0..60
    postponeMonth?: string; // YYYY-MM
    monthlyExpense?: number; // biaya hidup + cicilan (untuk status snapshot per skenario)
  }
): Scenario[] {
  const now = new Date();

  const baseMonth = finance.wedding_month || "";
  const baseMonths = monthsToTarget(now, baseMonth);

  const reducePct = clamp(params?.reducePct ?? 25, 0, 60);
  const postponeMonth = params?.postponeMonth || baseMonth;
  const postponeMonths = monthsToTarget(now, postponeMonth);

  const monthlyExpense = Math.max(0, Number(params?.monthlyExpense ?? 0));

  const base = breakdown.personal_total;

  // A: tetap
  const A_cost = base;
  const A_save = savingPerMonthUsingExistingSavings(finance, A_cost, baseMonths);

  // B: turunkan gaya (slider)
  const B_cost = base * (1 - reducePct / 100);
  const B_save = savingPerMonthUsingExistingSavings(finance, B_cost, baseMonths);

  // C: kombinasi (turun + mundur)
  const C_cost = base * (1 - reducePct / 100);
  const C_save = savingPerMonthUsingExistingSavings(finance, C_cost, postponeMonths);

  // status per opsi harus konsisten dengan indikator snapshot (pakai monthlyExpense)
  const A_status = snapshot.status;
  const B_status = calcSnapshot(finance, B_cost, monthlyExpense).status;
  const C_status = calcSnapshot(finance, C_cost, monthlyExpense).status;

  return [
    {
      key: "A",
      title: "Tetap rencana awal",
      subtitle: "Tanpa turunkan gaya & tanpa mundur tanggal.",
      personal_wedding_cost: A_cost,
      saving_per_month: A_save,
      impact_status: A_status,
    },
    {
      key: "B",
      title: `Turunkan gaya nikah (${reducePct.toFixed(0)}%)`,
      subtitle: "Kamu bebas atur persen penurunannya.",
      personal_wedding_cost: B_cost,
      saving_per_month: B_save,
      impact_status: B_status,
    },
    {
      key: "C",
      title: "Kombinasi: turunkan + mundurkan",
      subtitle: "Lebih ringan karena biaya turun dan waktu persiapan lebih panjang.",
      personal_wedding_cost: C_cost,
      saving_per_month: C_save,
      impact_status: C_status,
    },
  ];
}
