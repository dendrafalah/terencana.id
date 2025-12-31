import "./cek-keuangan.css";
import FinancialReflectionWizard from "@/app/components/financial-score/FinancialReflectionWizard";

export const metadata = {
  title: "Potret Keuangan — terencana.id",
  description:
    "Cek kondisi keuanganmu dengan pertanyaan sederhana (±2 menit). Tanpa istilah rumit, tanpa biaya.",
};

export default function Page() {
  return <FinancialReflectionWizard />;
}
