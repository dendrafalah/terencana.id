"use client";

import React, { useMemo, useState } from "react";
import styles from "./page.module.css";

/**
 * FuturePlan — Next.js version
 * - Ported 1:1 from your compiled React app
 * - Uses Tailwind utility classes (assumes your project already has Tailwind)
 * - Local CSS module only for range width + print rules
 */

function formatCurrency(n: number) {
  if (Number.isNaN(n)) return "-";
  const s = n.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return "Rp " + s;
}
function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}
function formatPercent(n: number) {
  return Number.isNaN(n) ? "0%" : (n * 100).toFixed(1) + "%";
}

type GoalType = "education" | "house" | "retirement" | "wedding" | "travel" | "custom";

const GOAL_TYPES: { value: GoalType; label: string }[] = [
  { value: "education", label: "Dana Pendidikan Anak" },
  { value: "house", label: "DP Rumah" },
  { value: "retirement", label: "Dana Pensiun" },
  { value: "wedding", label: "Biaya Menikah" },
  { value: "travel", label: "Dana Liburan" },
  { value: "custom", label: "Goal Kustom" },
];

const HABIT_SUGGESTIONS = [
  "Kurangi jajan luar 1x per minggu",
  "Tambah top up tabungan Rp 100.000 tiap gajian",
  "Cek ulang pengeluaran langganan (subscription)",
  "Pisahkan rekening kebutuhan & jajan",
];

const DEFAULT_INFLATION_BY_TYPE: Record<GoalType, number> = {
  education: 0.08,
  house: 0.06,
  retirement: 0.05,
  wedding: 0.05,
  travel: 0.04,
  custom: 0.05,
};

let nextGoalId = 3;
let nextHabitId = 3;

function getIncomeAdvice(needsRatio: number, lifestyleRatio: number, savingRatio: number) {
  const r: string[] = [];

  if (needsRatio > 0.6)
    r.push(
      "Porsi kebutuhan di atas 60% dari penghasilan, cukup berat. Coba cek apakah ada biaya tetap yang bisa dikurangi atau dinegosiasi."
    );
  else if (needsRatio >= 0.4)
    r.push("Porsi kebutuhan sekitar 40–60% dari penghasilan, ini umumnya masih cukup sehat.");
  else
    r.push(
      "Porsi kebutuhan di bawah 40%, cukup ramping. Pastikan kualitas hidup tetap terjaga (makan, tempat tinggal, kesehatan)."
    );

  if (lifestyleRatio > 0.3)
    r.push(
      "Bagian gaya hidup cukup besar (>30%). Kalau tabungan masih tipis, area ini biasanya yang paling mudah dipangkas."
    );
  else if (lifestyleRatio >= 0.2)
    r.push("Gaya hidup di kisaran 20–30%. Masih oke selama tabungan juga sehat.");
  else r.push("Gaya hidup relatif terkendali (<20%), ini memberi ruang lebih besar untuk nabung/investasi.");

  if (savingRatio >= 0.2)
    r.push("Tabungan ≥20% dari penghasilan, ini sudah sangat bagus untuk tujuan jangka panjang.");
  else if (savingRatio >= 0.1)
    r.push(
      "Tabungan 10–20% lumayan, tapi kalau ingin kejar banyak goal sekaligus, coba perlahan naikkan mendekati 20%."
    );
  else if (savingRatio > 0)
    r.push(
      "Tabungan masih di bawah 10%. Risiko tujuan jangka panjang lebih sulit tercapai, pertimbangkan kurangi lifestyle atau naikkan penghasilan."
    );
  else r.push("Belum ada sisa untuk tabungan — artinya kebutuhan + lifestyle sedang menghabiskan seluruh penghasilan.");

  return r.join(" ");
}

type Goal = {
  id: number;
  type: GoalType;
  name: string;
  amount: number;
  years: number;
  priority: number;
  inflation?: number;
};

type Habit = { id: number; text: string; doneThisWeek: boolean };

type EnrichedGoal = Goal & {
  months: number;
  effInflation: number;
  futureCost: number;
  monthlyRate: number;
  factor: number;
  required: number;
  fvFromPV: number;
  fvRemaining: number;
  assigned: number;
  coveragePct: number;
  status: string;
};

function InstagramIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" ry="5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="17" cy="7" r="1.2" fill="currentColor" />
    </svg>
  );
}

function LinkedInIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M4.98 3.5C4.98 4.88 3.9 6 2.5 6 1.12 6 0 4.88 0 3.5 0 2.12 1.12 1 2.5 1 3.9 1 4.98 2.12 4.98 3.5zM0.24 8.25H4.76V23H0.24V8.25zM8.34 8.25H12.7V10.1H12.76C13.36 9.02 14.76 7.9 16.82 7.9 21.28 7.9 22.08 10.82 22.08 14.28V23H17.56V15.28C17.56 13.5 17.52 11.22 15.14 11.22 12.72 11.22 12.36 13.16 12.36 15.14V23H7.84V8.25H8.34z" />
    </svg>
  );
}

function PresetChip({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      title="Angka kisaran, silakan sesuaikan lagi kalau perlu."
      className="px-2 py-0.5 rounded-full border border-slate-200 bg-white hover:bg-slate-100 text-[11px] text-slate-700"
      type="button"
    >
      {label}
    </button>
  );
}

function ScenarioCard({
  title,
  description,
  scenario,
}: {
  title: string;
  description: string;
  scenario: { capacitySc: number; coverageSc: number };
}) {
  const { capacitySc, coverageSc } = scenario;
  const msg =
    coverageSc >= 100
      ? "Dengan skenario ini, secara matematis kamu aman untuk semua goal (kalau disiplin dengan rencana)."
      : coverageSc >= 70
      ? "Skenario ini cukup membantu, beberapa goal mungkin masih sedikit tertinggal."
      : "Bahkan dengan skenario ini, masih cukup jauh dari target. Butuh kombinasi naik penghasilan & turunkan lifestyle.";

  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3 space-y-2">
      <p className="font-semibold text-slate-800 text-xs">{title}</p>
      <p className="text-[11px] text-slate-500">{description}</p>

      <div className="flex justify-between items-baseline">
        <div className="text-[11px] text-slate-600">
          <p>Sisa untuk nabung:</p>
          <p className="font-semibold">{formatCurrency(capacitySc || 0)}</p>
        </div>

        <div className="text-right">
          <p className="text-xs font-bold text-emerald-700">{coverageSc.toFixed(0)}%</p>
          <p className="text-[10px] text-slate-500">coverage semua goal</p>
        </div>
      </div>

      <p className="text-[11px] text-slate-600">{msg}</p>
    </div>
  );
}

function GoalRow({
  goal,
  updateGoal,
  removeGoal,
  applyTemplate,
  mode,
  rangeClassName,
}: {
  goal: EnrichedGoal;
  updateGoal: (id: number, patch: Partial<Goal>) => void;
  removeGoal: (id: number) => void;
  applyTemplate: (id: number, type: GoalType, template: string) => void;
  mode: "simple" | "advanced";
  rangeClassName: string;
}) {
  const {
    id,
    type,
    name,
    amount,
    years,
    priority,
    inflation,
    required,
    assigned,
    coveragePct,
    status,
    futureCost,
    effInflation,
  } = goal;

  const infl = effInflation ?? inflation ?? DEFAULT_INFLATION_BY_TYPE[type] ?? 0.05;

  const covColor =
    coveragePct >= 100
      ? "text-emerald-700"
      : coveragePct >= 60
      ? "text-amber-700"
      : coveragePct > 0
      ? "text-rose-700"
      : "text-slate-600";

  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3 space-y-2 text-xs">
      <div className="flex justify-between items-center gap-2">
        <div className="flex items-center gap-2">
          <select
            className="rounded-xl border border-slate-200 bg-white px-2 py-1 text-xs"
            value={type}
            onChange={(e) => {
              const t = e.target.value as GoalType;
              updateGoal(id, {
                type: t,
                ...(t !== "custom" ? {} : { name: "Goal Kustom" }),
                inflation: DEFAULT_INFLATION_BY_TYPE[t] ?? infl,
              });
            }}
          >
            {GOAL_TYPES.map((g) => (
              <option key={g.value} value={g.value}>
                {g.label}
              </option>
            ))}
          </select>

          <input
            type="text"
            className="rounded-xl border border-slate-200 bg-white px-2 py-1 text-xs w-40"
            value={name}
            onChange={(e) => updateGoal(id, { name: e.target.value })}
          />
        </div>

        <button
          className={`text-[11px] text-slate-400 hover:text-rose-500 ${styles.noPrint}`}
          onClick={() => removeGoal(id)}
          type="button"
        >
          ✕
        </button>
      </div>

      <div className="grid grid-cols-[1.6fr,0.9fr,0.7fr] gap-2 items-center">
        <div>
          <label className="flex justify-between mb-0.5">
            <span className="text-slate-600">Nilai goal saat ini</span>
            <span className="text-slate-500">{formatCurrency(amount)}</span>
          </label>
          <input
            className={rangeClassName}
            type="range"
            min="10000000"
            max="2000000000"
            step="5000000"
            value={amount}
            onChange={(e) => updateGoal(id, { amount: Number(e.target.value) })}
          />
        </div>

        <div>
          <label className="flex justify-between mb-0.5">
            <span className="text-slate-600">Durasi</span>
            <span className="text-slate-500">{years} th</span>
          </label>
          <input
            className={rangeClassName}
            type="range"
            min="1"
            max="30"
            value={years}
            onChange={(e) => updateGoal(id, { years: Number(e.target.value) })}
          />
        </div>

        <div>
          <label className="flex justify-between mb-0.5">
            <span className="text-slate-600">
              Prioritas <span className="text-[10px] text-slate-400">(1 = paling penting)</span>
            </span>
            <span className="text-slate-500">{priority}</span>
          </label>
          <input
            className={rangeClassName}
            type="range"
            min="1"
            max="5"
            value={priority}
            onChange={(e) => updateGoal(id, { priority: Number(e.target.value) })}
          />
        </div>
      </div>

      {mode === "advanced" ? (
        <div className="mt-1">
          <label className="flex justify-between mb-0.5">
            <span className="text-slate-600">Inflasi goal ini (per tahun)</span>
            <span className="text-slate-500">{formatPercent(infl)}</span>
          </label>
          <input
            className={rangeClassName}
            type="range"
            min="0"
            max="0.15"
            step="0.005"
            value={infl}
            onChange={(e) => updateGoal(id, { inflation: parseFloat(e.target.value) })}
          />
          <p className="text-[11px] text-slate-500 mt-0.5">
            Contoh kasar: pendidikan 8–12%/tahun, rumah 5–8%/tahun, liburan 3–5%/tahun. Silakan sesuaikan
            dengan harapanmu.
          </p>
        </div>
      ) : (
        <p className="mt-1 text-[11px] text-slate-500">
          Asumsi inflasi goal ini: <span className="font-semibold">{formatPercent(infl)} per tahun</span>. Nilai
          ini dihitung beda-beda per jenis goal. Bisa diubah di <span className="font-semibold">Advanced mode</span>.
        </p>
      )}

      {type !== "custom" && (
        <div className={`flex flex-wrap gap-1 mt-1 ${styles.noPrint}`}>
          <span className="text-[11px] text-slate-500 mr-1">Template cepat:</span>

          {type === "education" && (
            <>
              <PresetChip label="Negeri" onClick={() => applyTemplate(id, type, "negeri")} />
              <PresetChip label="Swasta" onClick={() => applyTemplate(id, type, "swasta")} />
              <PresetChip label="Premium" onClick={() => applyTemplate(id, type, "premium")} />
            </>
          )}

          {type === "house" && (
            <>
              <PresetChip label="Subsidi" onClick={() => applyTemplate(id, type, "subsidi")} />
              <PresetChip label="Cluster" onClick={() => applyTemplate(id, type, "cluster")} />
              <PresetChip label="Premium" onClick={() => applyTemplate(id, type, "premium")} />
            </>
          )}

          {type === "retirement" && (
            <>
              <PresetChip label="Minimalis" onClick={() => applyTemplate(id, type, "minimalis")} />
              <PresetChip label="Nyaman" onClick={() => applyTemplate(id, type, "nyaman")} />
              <PresetChip label="Sangat nyaman" onClick={() => applyTemplate(id, type, "sangat_nyaman")} />
            </>
          )}

          {type === "wedding" && (
            <>
              <PresetChip label="Sederhana" onClick={() => applyTemplate(id, type, "sederhana")} />
              <PresetChip label="Menengah" onClick={() => applyTemplate(id, type, "menengah")} />
              <PresetChip label="Resepsi besar" onClick={() => applyTemplate(id, type, "besar")} />
            </>
          )}

          {type === "travel" && (
            <>
              <PresetChip label="Domestik" onClick={() => applyTemplate(id, type, "domestik")} />
              <PresetChip label="Asia" onClick={() => applyTemplate(id, type, "asia")} />
              <PresetChip label="Eropa" onClick={() => applyTemplate(id, type, "eropa")} />
            </>
          )}
        </div>
      )}

      <div className="mt-1 flex flex-col md:flex-row md:items-center md:justify-between gap-1">
        <div className="text-[11px] text-slate-600">
          <p>
            Estimasi biaya di tahun target{" "}
            <span className="font-semibold">
              ({years} th, inflasi {formatPercent(infl)})
            </span>
            : <span className="font-semibold">{formatCurrency(futureCost || amount)}</span>
          </p>
          <p>
            Kebutuhan tabungan / bulan: <span className="font-semibold">{formatCurrency(required || 0)}</span>
          </p>
          <p>
            Alokasi dari simulasi: <span className="font-semibold">{formatCurrency(assigned || 0)}</span>
          </p>
        </div>

        <div className="text-right text-[11px]">
          <p className={covColor}>Coverage: {coveragePct.toFixed(0)}%</p>
          <p className="text-slate-500">{status}</p>
        </div>
      </div>
    </div>
  );
}

export default function FuturePlanPage() {
  const [mode, setMode] = useState<"simple" | "advanced">("simple");
  const [income, setIncome] = useState<number>(8_000_000);
  const [needs, setNeeds] = useState<number>(3_500_000);
  const [lifestyle, setLifestyle] = useState<number>(2_500_000);
  const [startingSavings, setStartingSavings] = useState<number>(0);
  const [annualReturn, setAnnualReturn] = useState<number>(0.01);

  const [goals, setGoals] = useState<Goal[]>([
    {
      id: 1,
      type: "education",
      name: "Pendidikan Anak",
      amount: 50_000_000,
      years: 10,
      priority: 2,
      inflation: DEFAULT_INFLATION_BY_TYPE.education,
    },
    {
      id: 2,
      type: "house",
      name: "DP Rumah",
      amount: 300_000_000,
      years: 8,
      priority: 3,
      inflation: DEFAULT_INFLATION_BY_TYPE.house,
    },
  ]);

  const [habits, setHabits] = useState<Habit[]>([
    { id: 1, text: "Kurangi jajan luar 1x per minggu", doneThisWeek: false },
    { id: 2, text: "Tambah top up tabungan Rp 100.000", doneThisWeek: false },
  ]);

  const g = Number(income) || 0;
  const b = Number(needs) || 0;
  const l = Number(lifestyle) || 0;

  const savingCapacity = Math.max(0, g - b - l);
  const overBudget = b + l > g;

  const advice = getIncomeAdvice(g > 0 ? b / g : 0, g > 0 ? l / g : 0, g > 0 ? savingCapacity / g : 0);

  const { enrichedGoals, totalRequired, overallCoverageRatio, remainingCapacity, corpusContributionRatio } = useMemo(() => {
    if (!goals.length) {
      return {
        enrichedGoals: [] as EnrichedGoal[],
        totalRequired: 0,
        overallCoverageRatio: 0,
        remainingCapacity: savingCapacity,
        corpusContributionRatio: 0,
      };
    }

    const monthlyRate = annualReturn > 0 ? annualReturn / 12 : 0;

    const enrichedBase = goals.map((a) => {
      const years = Number(a.years) || 1;
      const months = Math.max(1, 12 * years);
      const effInflation = a.inflation ?? DEFAULT_INFLATION_BY_TYPE[a.type] ?? 0.05;
      const futureCost = a.amount * Math.pow(1 + effInflation, years);
      const factor = monthlyRate > 0 ? (Math.pow(1 + monthlyRate, months) - 1) / monthlyRate : 0;
      return { ...a, years, months, effInflation, futureCost, monthlyRate, factor };
    });

    // total required (full funding for each goal, ignoring startingSavings allocation)
    const totalRequired = enrichedBase.reduce((acc, x) => {
      const req = x.monthlyRate > 0 && x.factor > 0 ? x.futureCost / x.factor : x.futureCost / x.months;
      return acc + req;
    }, 0);

    // allocate startingSavings by priority, then compute remaining required per goal
    const byPriority = [...enrichedBase].sort((a, b) => Number(a.priority || 1) - Number(b.priority || 1));

    let pv = startingSavings;
    let requiredSumAfterPV = 0;
    const pvMap = new Map<number, { required: number; fvFromPV: number; fvRemaining: number }>();

    for (const a of byPriority) {
      const pvNeed = monthlyRate > 0 ? a.futureCost / Math.pow(1 + monthlyRate, a.months) : a.futureCost;
      const usedPV = pv > 0 ? Math.min(pv, pvNeed) : 0;
      pv -= usedPV;

      let fvFromPV = 0;
      let fvRemaining = 0;
      let required = 0;

      if (monthlyRate > 0) {
        fvFromPV = usedPV * Math.pow(1 + monthlyRate, a.months);
        fvRemaining = Math.max(0, a.futureCost - fvFromPV);
        required = fvRemaining <= 0 ? 0 : a.factor > 0 ? fvRemaining / a.factor : fvRemaining / a.months;
      } else {
        fvFromPV = usedPV;
        fvRemaining = Math.max(0, a.futureCost - usedPV);
        required = fvRemaining / a.months;
      }

      requiredSumAfterPV += required;
      pvMap.set(a.id, { required, fvFromPV, fvRemaining });
    }

    const enrichedWithPV = enrichedBase.map((e) => {
      const m = pvMap.get(e.id) || { required: 0, fvFromPV: 0, fvRemaining: e.futureCost };
      return { ...e, required: m.required, fvFromPV: m.fvFromPV, fvRemaining: m.fvRemaining };
    });

    // allocate monthly savingCapacity across goals by priority
    const sorted = [...enrichedWithPV].sort((a, b) => Number(a.priority || 1) - Number(b.priority || 1));
    let cap = savingCapacity;
    const assign: Record<number, { assigned: number }> = {};

    for (const e of sorted) {
      const req = e.required || 0;
      const take = Math.max(0, Math.min(req, cap));
      cap -= take;
      assign[e.id] = { assigned: take };
    }

    // corpusContributionRatio & overallCoverageRatio (same behavior as original)
    const h = requiredSumAfterPV > 0 ? savingCapacity / requiredSumAfterPV : 0;

    let p = 0;
    if (totalRequired > 0) {
      p = 1 - requiredSumAfterPV / totalRequired;
      p = clamp(p, 0, 1);
    } else {
      p = goals.length > 0 && startingSavings > 0 ? 1 : 0;
    }

    let overall = p + (1 - p) * h;
    overall = clamp(overall, 0, 1);

    const finalGoals: EnrichedGoal[] = enrichedWithPV.map((e) => {
      const assigned = assign[e.id]?.assigned || 0;

      // FV of assigned monthly contribution
      let fvFromMonthly = 0;
      if (e.monthlyRate > 0 && e.factor > 0) fvFromMonthly = assigned * e.factor;
      else fvFromMonthly = assigned * e.months;

      const fvTotal = (e.fvFromPV || 0) + fvFromMonthly;
      let ratio = e.futureCost > 0 ? fvTotal / e.futureCost : 0;
      ratio = clamp(ratio, 0, 2);

      const coveragePct = 100 * ratio;

      const status =
        !e.years || e.years <= 0
          ? "Lengkapi durasi goal"
          : coveragePct >= 100
          ? "On track / sudah tertutup"
          : coveragePct >= 60
          ? "Mendekati, perlu sedikit penyesuaian"
          : coveragePct > 0
          ? "Sebagian sudah tertutup, tapi masih jauh dari target"
          : "Belum ada alokasi";

      return { ...e, assigned, coveragePct, status };
    });

    return {
      enrichedGoals: finalGoals,
      totalRequired: requiredSumAfterPV,
      overallCoverageRatio: overall,
      remainingCapacity: cap,
      corpusContributionRatio: p,
    };
  }, [goals, savingCapacity, annualReturn, startingSavings]);

  function computeScenario({ incomeFactor = 1, lifestyleFactor = 1 }: { incomeFactor?: number; lifestyleFactor?: number }) {
    const incomeSc = g * incomeFactor;
    const lifestyleSc = l * lifestyleFactor;
    const capacitySc = Math.max(0, incomeSc - b - lifestyleSc);

    let coverageSc = 0;
    if (totalRequired > 0) coverageSc = clamp(100 * (corpusContributionRatio + (1 - corpusContributionRatio) * (capacitySc / totalRequired)), 0, 100);
    else coverageSc = goals.length > 0 && startingSavings > 0 ? 100 : 0;

    return { incomeSc, lifestyleSc, capacitySc, coverageSc };
  }

  const scenarioLifestyleDown = computeScenario({ incomeFactor: 1, lifestyleFactor: 0.9 });
  const scenarioIncomeUp = computeScenario({ incomeFactor: 1.2, lifestyleFactor: 1 });

  function updateGoal(id: number, patch: Partial<Goal>) {
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, ...patch } : g)));
  }
  function removeGoal(id: number) {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  }

  function applyTemplate(id: number, type: GoalType, template: string) {
    if (type === "education") {
      if (template === "negeri") updateGoal(id, { amount: 10_000_000, years: 10, inflation: DEFAULT_INFLATION_BY_TYPE.education });
      if (template === "swasta") updateGoal(id, { amount: 35_000_000, years: 10, inflation: DEFAULT_INFLATION_BY_TYPE.education });
      if (template === "premium") updateGoal(id, { amount: 120_000_000, years: 12, inflation: DEFAULT_INFLATION_BY_TYPE.education });
    }
    if (type === "house") {
      if (template === "subsidi") updateGoal(id, { amount: 50_000_000, years: 5, inflation: DEFAULT_INFLATION_BY_TYPE.house });
      if (template === "cluster") updateGoal(id, { amount: 250_000_000, years: 8, inflation: DEFAULT_INFLATION_BY_TYPE.house });
      if (template === "premium") updateGoal(id, { amount: 700_000_000, years: 10, inflation: DEFAULT_INFLATION_BY_TYPE.house });
    }
    if (type === "retirement") {
      if (template === "minimalis") updateGoal(id, { amount: 500_000_000, years: 20, inflation: DEFAULT_INFLATION_BY_TYPE.retirement });
      if (template === "nyaman") updateGoal(id, { amount: 1_000_000_000, years: 25, inflation: DEFAULT_INFLATION_BY_TYPE.retirement });
      if (template === "sangat_nyaman") updateGoal(id, { amount: 2_000_000_000, years: 30, inflation: DEFAULT_INFLATION_BY_TYPE.retirement });
    }
    if (type === "wedding") {
      if (template === "sederhana") updateGoal(id, { amount: 35_000_000, years: 3, inflation: DEFAULT_INFLATION_BY_TYPE.wedding });
      if (template === "menengah") updateGoal(id, { amount: 250_000_000, years: 4, inflation: DEFAULT_INFLATION_BY_TYPE.wedding });
      if (template === "besar") updateGoal(id, { amount: 700_000_000, years: 5, inflation: DEFAULT_INFLATION_BY_TYPE.wedding });
    }
    if (type === "travel") {
      if (template === "domestik") updateGoal(id, { amount: 10_000_000, years: 2, inflation: DEFAULT_INFLATION_BY_TYPE.travel });
      if (template === "asia") updateGoal(id, { amount: 25_000_000, years: 3, inflation: DEFAULT_INFLATION_BY_TYPE.travel });
      if (template === "eropa") updateGoal(id, { amount: 60_000_000, years: 4, inflation: DEFAULT_INFLATION_BY_TYPE.travel });
    }
  }

  const comp = {
    needs: g > 0 ? ((b / g) * 100).toFixed(0) : "0",
    lifestyle: g > 0 ? ((l / g) * 100).toFixed(0) : "0",
    saving: g > 0 ? ((savingCapacity / g) * 100).toFixed(0) : "0",
  };

  const overallPct = clamp(100 * overallCoverageRatio, 0, 100).toFixed(0);

  const rangeCls = styles.range;

  return (
    <div className={`max-w-6xl mx-auto px-4 py-6 md:py-8 ${styles.root}`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
            FuturePlan <span className="text-emerald-600">by Dendra Falah, CFP®</span>
          </h1>

          <div className="flex items-center gap-4 mt-1 text-xs md:text-sm text-slate-600">
            <a
              href="https://www.instagram.com/dendrafalah/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 hover:text-pink-500"
            >
              <InstagramIcon className="w-4 h-4" />
              <span>@dendrafalah</span>
            </a>

            <a
              href="https://id.linkedin.com/in/dendrafalah"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 hover:text-sky-700"
            >
              <LinkedInIcon className="w-4 h-4" />
              <span>LinkedIn</span>
            </a>
          </div>

          <p className="text-slate-600 text-sm md:text-base mt-2 max-w-xl">
            Simulasi sederhana untuk melihat apakah <span className="font-semibold">beberapa goal keuangan</span>{" "}
            bisa tercapai dengan penghasilan dan gaya hidupmu sekarang.
          </p>
        </div>

        <div className={`flex flex-col items-end gap-2 ${styles.noPrint}`}>
          <div className="inline-flex items-center rounded-full bg-slate-100 p-1 text-xs border border-slate-200">
            <button
              onClick={() => setMode("simple")}
              className={"px-3 py-1 rounded-full " + (mode === "simple" ? "bg-white shadow-sm text-slate-900" : "text-slate-500")}
              type="button"
            >
              Simple
            </button>
            <button
              onClick={() => setMode("advanced")}
              className={"px-3 py-1 rounded-full " + (mode === "advanced" ? "bg-white shadow-sm text-slate-900" : "text-slate-500")}
              type="button"
            >
              Advanced
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-amber-50 text-amber-700 text-xs font-semibold px-3 py-1 border border-amber-100">
              Premium Prototype
            </span>

            <button
              onClick={() => window.print()}
              className="text-xs md:text-sm px-3 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700"
              type="button"
            >
              📄 Print / Save as PDF
            </button>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="grid lg:grid-cols-[1.3fr,1.1fr] gap-6">
        {/* Left column */}
        <div className="space-y-6">
          <section className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
            <h2 className="text-lg font-semibold text-slate-800">1. Kondisi Keuangan Bulanan</h2>

            <div>
              <label className="flex justify-between text-sm font-medium text-slate-700 mb-1">
                <span>Penghasilan bulanan (perkiraan)</span>
                <span className="text-slate-500">{formatCurrency(g)}</span>
              </label>
              <input
                className={rangeCls}
                type="range"
                min="3000000"
                max="40000000"
                step="500000"
                value={income}
                onChange={(e) => setIncome(Number(e.target.value))}
              />
            </div>

            <div>
              <label className="flex justify-between text-sm font-medium text-slate-700 mb-1">
                <span>Kebutuhan dasar (sewa/KPR, makan, listrik, transport)</span>
                <span className="text-slate-500">{formatCurrency(b)}</span>
              </label>
              <input
                className={rangeCls}
                type="range"
                min="0"
                max="30000000"
                step="250000"
                value={needs}
                onChange={(e) => setNeeds(Number(e.target.value))}
              />
            </div>

            <div>
              <label className="flex justify-between text-sm font-medium text-slate-700 mb-1">
                <span>Gaya hidup (jajan, nongkrong, hobi, traveling, dsb.)</span>
                <span className="text-slate-500">{formatCurrency(l)}</span>
              </label>
              <input
                className={rangeCls}
                type="range"
                min="0"
                max="20000000"
                step="250000"
                value={lifestyle}
                onChange={(e) => setLifestyle(Number(e.target.value))}
              />
            </div>

            <div className="mt-1 rounded-2xl bg-slate-50 border border-slate-100 p-3 text-xs text-slate-600 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium text-slate-700">Sisa penghasilan yang bisa ditabung (otomatis)</span>
                <span className="font-semibold">{formatCurrency(savingCapacity)}</span>
              </div>

              <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full bg-emerald-500"
                  style={{ width: g > 0 ? `${clamp((savingCapacity / g) * 100, 0, 100).toFixed(0)}%` : "0%" }}
                />
              </div>

              <p>
                Rumus: <code className="bg-slate-100 px-2 py-1 rounded">Penghasilan – Kebutuhan dasar – Gaya hidup</code>
              </p>

              {overBudget && (
                <p className="text-rose-700 text-xs">
                  Saat ini kebutuhan + gaya hidup &gt; penghasilan. Di dunia nyata ini biasanya berarti{" "}
                  <span className="font-semibold">pakai utang / tarik tabungan lama</span>.
                </p>
              )}
            </div>
          </section>

          <section className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
            <h2 className="text-lg font-semibold text-slate-800">1b. Tabungan / Investasi yang Sudah Ada</h2>

            <div>
              <label className="flex justify-between text-sm font-medium text-slate-700 mb-1">
                <span>
                  Total tabungan/investasi yang ingin <br />
                  dikaitkan dengan semua goal ini
                </span>
                <span className="text-slate-500">{formatCurrency(startingSavings)}</span>
              </label>

              <input
                className={rangeCls}
                type="range"
                min="0"
                max="2000000000"
                step="1000000"
                value={startingSavings}
                onChange={(e) => setStartingSavings(Number(e.target.value))}
              />

              <p className="text-[11px] text-slate-500 mt-1">
                Diasumsikan tabungan/investasi ini ditempatkan di instrumen yang sama dengan{" "}
                <span className="font-semibold">asumsi investasi (1c)</span> dan akan dipakai untuk membantu mengejar
                semua goal sesuai prioritas.
              </p>
            </div>
          </section>

          <section className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
            <h2 className="text-lg font-semibold text-slate-800">1c. Asumsi Investasi</h2>

            {mode === "advanced" ? (
              <div>
                <label className="flex justify-between text-sm font-medium text-slate-700 mb-1">
                  <span>Imbal hasil investasi (per tahun)</span>
                  <span className="text-slate-500">{formatPercent(annualReturn)}</span>
                </label>

                <input
                  className={rangeCls}
                  type="range"
                  min="0"
                  max="0.2"
                  step="0.005"
                  value={annualReturn}
                  onChange={(e) => setAnnualReturn(parseFloat(e.target.value))}
                />

                <div className={`flex flex-wrap gap-1 mt-1 ${styles.noPrint}`}>
                  <PresetChip label="Deposito 3%" onClick={() => setAnnualReturn(0.03)} />
                  <PresetChip label="RDPU 5%" onClick={() => setAnnualReturn(0.05)} />
                  <PresetChip label="Campuran 8%" onClick={() => setAnnualReturn(0.08)} />
                  <PresetChip label="Agresif 12%" onClick={() => setAnnualReturn(0.12)} />
                </div>

                <p className="text-[11px] text-slate-500 mt-1">
                  Ini asumsi rata-rata imbal hasil tahunan dari instrumen utama yang kamu pakai untuk mengejar semua goal
                  (contoh: deposito, reksa dana, kombinasi). Berlaku untuk tabungan yang sudah ada dan setoran bulanan di
                  simulasi ini.
                </p>
              </div>
            ) : (
              <div className="text-xs text-slate-600 space-y-2">
                <p>
                  Saat ini simulasi memakai asumsi imbal hasil sekitar{" "}
                  <span className="font-semibold">{formatPercent(annualReturn)}</span> per tahun — mirip seperti{" "}
                  <span className="font-semibold">tabungan bank</span> yang bunganya rendah.
                </p>
                <p>
                  Tabungan awal di 1b dan setoran bulanan otomatis di 1 semuanya diasumsikan berkembang dengan angka ini.
                  Kalau kamu mau lihat skenario dengan <span className="font-semibold">deposito / reksa dana</span> yang
                  imbal hasilnya bisa lebih tinggi, buka <span className="font-semibold">Advanced mode</span> dan pilih
                  preset seperti Deposito 3% atau RDPU 5%.
                </p>
              </div>
            )}
          </section>

          <section className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-lg font-semibold text-slate-800">2. Goal Keuangan (Bisa Lebih dari 1)</h2>
              <button
                className={`text-xs px-3 py-1.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 ${styles.noPrint}`}
                onClick={() => {
                  const newGoal: Goal = {
                    id: nextGoalId++,
                    type: "custom",
                    name: "Goal Baru",
                    amount: 50_000_000,
                    years: 5,
                    priority: 3,
                    inflation: DEFAULT_INFLATION_BY_TYPE.custom,
                  };
                  setGoals((prev) => [...prev, newGoal]);
                }}
                type="button"
              >
                + Tambah Goal
              </button>
            </div>

            {goals.length === 0 && <p className="text-sm text-slate-500">Belum ada goal. Tambah minimal 1 goal untuk mulai simulasi.</p>}

            <div className="space-y-3">
              {enrichedGoals.map((g) => (
                <GoalRow
                  key={g.id}
                  goal={g}
                  updateGoal={updateGoal}
                  removeGoal={removeGoal}
                  applyTemplate={applyTemplate}
                  mode={mode}
                  rangeClassName={rangeCls}
                />
              ))}
            </div>

            {mode === "advanced" && (
              <p className="text-[11px] text-slate-500 mt-2">
                Catatan: inflasi tiap goal bisa berbeda. Contoh kasar: biaya pendidikan sering naik{" "}
                <span className="font-semibold">8–12%/tahun</span>, harga rumah sekitar{" "}
                <span className="font-semibold">5–8%/tahun</span>, liburan biasanya{" "}
                <span className="font-semibold">3–5%/tahun</span>. Angka ini bukan patokan pasti, tapi membantu kamu berpikir lebih realistis.
              </p>
            )}
          </section>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <section className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
            <h2 className="text-lg font-semibold text-slate-800">Ringkasan Rencana</h2>

            <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4 flex flex-col gap-3 text-sm">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-emerald-800 font-semibold">Seberapa kuat rencana kamu?</p>
                  <p className="text-emerald-700 text-xs mt-1">
                    Dibanding total kebutuhan tabungan semua goal, dengan asumsi investasi & inflasi yang kamu pakai sekarang
                    (termasuk tabungan awal yang ikut dihitung).
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-2xl font-bold text-emerald-700">{overallPct}%</p>
                  <p className="text-[11px] text-emerald-700">coverage keseluruhan</p>
                </div>
              </div>

              <div className="w-full h-2 rounded-full bg-emerald-100 overflow-hidden">
                <div className="h-full bg-emerald-500" style={{ width: `${Math.min(Math.max(Number(overallPct), 0), 100)}%` }} />
              </div>

              <p className="text-emerald-800 text-xs">
                Total kebutuhan tabungan bulanan semua goal (sudah memperhitungkan inflasi per goal & imbal hasil):{" "}
                <span className="font-semibold">{formatCurrency(totalRequired || 0)}</span>. Sisa penghasilan yang bisa ditabung:{" "}
                <span className="font-semibold">{formatCurrency(savingCapacity)}</span>. Tabungan/investasi awal yang ikut disimulasikan:{" "}
                <span className="font-semibold">{formatCurrency(startingSavings)}</span>.
              </p>

              <p className="text-[11px] text-emerald-700">
                Semakin dekat ke <span className="font-semibold">100%</span> artinya secara matematika rencana kamu{" "}
                <span className="font-semibold">masuk akal di kertas</span>. Tinggal PR di sisi perilaku: disiplin nabung, pilih instrumen yang cocok, dan review rutin.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4 text-xs space-y-2">
              <p className="font-semibold text-slate-700">Komposisi penghasilanmu:</p>

              <div className="flex flex-wrap gap-1 text-[11px] text-slate-600">
                <span className="px-2 py-0.5 rounded-full bg-slate-200">Kebutuhan {comp.needs}%</span>
                <span className="px-2 py-0.5 rounded-full bg-slate-200">Gaya hidup {comp.lifestyle}%</span>
                <span className="px-2 py-0.5 rounded-full bg-slate-200">Sisa untuk nabung {comp.saving}%</span>
              </div>

              <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden flex">
                <div className="h-full bg-slate-500" style={{ width: `${comp.needs}%` }} />
                <div className="h-full bg-slate-700" style={{ width: `${comp.lifestyle}%` }} />
                <div className="h-full bg-emerald-500" style={{ width: `${comp.saving}%` }} />
              </div>

              <p className="text-[11px] text-slate-600 mt-1">{advice}</p>

              <p className="text-[11px] text-slate-500">
                Bukan aturan saklek, tapi sebagai referensi banyak orang menargetkan pola mendekati{" "}
                <span className="font-semibold">50% kebutuhan, 30% gaya hidup, 20% nabung/investasi</span>. Yang penting: ada ruang sehat untuk{" "}
                <span className="font-semibold">nabung & fleksibilitas hidup</span>.
              </p>
            </div>
          </section>

          <section className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
            <h2 className="text-lg font-semibold text-slate-800">Simulator Skenario Cepat</h2>
            <p className="text-xs text-slate-500">Lihat dampak perubahan kecil tanpa mengubah angka utama dulu.</p>

            <div className="grid gap-3 md:grid-cols-2 text-xs">
              <ScenarioCard
                title="Kurangi gaya hidup 10%"
                description={`Gaya hidup dari ${formatCurrency(l)} menjadi ${formatCurrency(scenarioLifestyleDown.lifestyleSc)}.`}
                scenario={{ capacitySc: scenarioLifestyleDown.capacitySc, coverageSc: scenarioLifestyleDown.coverageSc }}
              />
              <ScenarioCard
                title="Gaji naik 20%"
                description={`Penghasilan dari ${formatCurrency(g)} menjadi ${formatCurrency(scenarioIncomeUp.incomeSc)}.`}
                scenario={{ capacitySc: scenarioIncomeUp.capacitySc, coverageSc: scenarioIncomeUp.coverageSc }}
              />
            </div>
          </section>

          <section className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-lg font-semibold text-slate-800">Rencana Kebiasaan Mingguan</h2>

              <button
                className={`text-xs px-2.5 py-1.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 ${styles.noPrint}`}
                onClick={() => {
                  const text = window.prompt("Masukkan kebiasaan baru yang ingin kamu coba:");
                  if (!text) return;
                  const newHabit: Habit = { id: nextHabitId++, text, doneThisWeek: false };
                  setHabits((prev) => [...prev, newHabit]);
                }}
                type="button"
              >
                + Kebiasaan baru
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Pilih 1–3 kebiasaan kecil yang <span className="font-semibold">realistis kamu jalankan minggu ini</span>. Konsistensi di kebiasaan jauh lebih penting daripada sekali-kali besar tapi cepat capek.
            </p>

            <div className="space-y-2">
              {habits.map((h) => (
                <label key={h.id} className="flex items-start gap-2 text-xs">
                  <input
                    type="checkbox"
                    className="mt-0.5"
                    checked={h.doneThisWeek}
                    onChange={() =>
                      setHabits((prev) => prev.map((x) => (x.id === h.id ? { ...x, doneThisWeek: !x.doneThisWeek } : x)))
                    }
                  />
                  <span className={h.doneThisWeek ? "line-through text-slate-400" : "text-slate-700"}>{h.text}</span>
                </label>
              ))}
            </div>

            <div className={styles.noPrint}>
              <p className="text-[11px] text-slate-500 mb-1">Ide kebiasaan (klik untuk tambahkan):</p>
              <div className="flex flex-wrap gap-1">
                {HABIT_SUGGESTIONS.map((t) => (
                  <button
                    key={t}
                    className="text-[11px] px-2 py-1 rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100"
                    onClick={() => {
                      setHabits((prev) => {
                        if (prev.some((x) => x.text === t)) return prev;
                        return [...prev, { id: nextHabitId++, text: t, doneThisWeek: false }];
                      });
                    }}
                    type="button"
                  >
                    + {t}
                  </button>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>

      <footer className="mt-8 text-[11px] text-slate-400 text-center">
        FuturePlan Premium – prototype untuk eksplorasi ide produk. Angka dan asumsi masih kasar dan bukan nasihat keuangan final.
      </footer>
    </div>
  );
}
