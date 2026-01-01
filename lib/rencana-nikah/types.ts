export type Scale5 = 1 | 2 | 3 | 4 | 5;

export type Answers = {
  q1_scale: Scale5 | null;
  q2_venue: Scale5 | null;
  q3_adat: Scale5 | null;
  q4_docs: Scale5 | null;
  q5_experience: Scale5 | null;
  q6_priority: Scale5 | null;
  q7_support: Scale5 | null;
};

export type FinanceInputs = {
  income_monthly: number; // gabungan
  savings_now: number;
  debt_monthly: number; // cicilan
  wedding_month: string; // YYYY-MM

  // NEW (opsional biar backward compatible):
  family_support_pct?: number; // 0..100
};

export type WeddingBreakdown = {
  guest_count: number;
  catering_price: number;
  catering_cost: number;

  venue_cost: number;
  decor_base: number;

  adat_cost: number;
  documentation_cost: number; // include prewedding basic by default
  guest_experience_cost: number;

  wo_cost: number;

  buffer_rate: number;
  buffer_cost: number;

  total_before_support: number; // sudah include buffer (lihat calc.ts)
  support_factor: number; // 1.0 .. 0.0 (porsi yang kamu tanggung)
  personal_total: number; // total yang kamu siapkan
};

export type LivingAfterInputs = {
  housing_monthly: number;
  food_monthly: number;
  transport_monthly: number;
  utilities_monthly: number;
  lifestyle_monthly: number;
  parents_monthly: number;
  insurance_monthly: number;
  joint_saving_monthly: number;
};

export type Snapshot = {
  wedding_expense_months: number; // biaya nikah / biaya hidup bulanan
  savings_after_wedding: number;
  safe_months_after: number; // sisa tabungan / biaya hidup bulanan
  status: "AMAN" | "KETAT" | "BERISIKO";
};



export type RealityCheck = {
  living_monthly_total: number;
  monthly_margin: number;
  first_6_months_risk: "AMAN" | "KETAT" | "BERAT";
};

export type Scenario = {
  key: "A" | "B" | "C";
  title: string;
  subtitle: string;
  personal_wedding_cost: number; // total dana pribadi yg perlu disiapkan
  saving_per_month: number; // target nabung/bulan (SETELAH memperhitungkan tabungan existing)
  impact_status: Snapshot["status"]; // boleh kamu hapus pemakaiannya di UI jika tidak relevan
};

export type WizardDraft = {
  step: number;
  answers: Answers;
  finance: FinanceInputs;

  // NEW (persist pengaturan skenario)
  scenario_reduce_pct?: number; // 0..60
  scenario_postpone_month?: string; // YYYY-MM

  breakdownOverrides?: Partial<
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
  >;

  living: LivingAfterInputs;
};

export type FinalResult = {
  answers: Answers;
  finance: FinanceInputs;

  // NEW (ikut disimpan biar hasil konsisten)
  scenario_reduce_pct?: number;
  scenario_postpone_month?: string;

  breakdown: WeddingBreakdown;
  snapshot: Snapshot;
  living: LivingAfterInputs;
  reality: RealityCheck;
  scenarios: Scenario[];
  pickedScenarioKey?: "A" | "B" | "C";
};
