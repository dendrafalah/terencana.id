import "../cek-keuangan.css";
import FinancialReflectionResult from "@/app/components/financial-score/FinancialReflectionResult";

export const metadata = {
  title: "Hasil Potret Keuangan — terencana.id",
  description: "Ringkasan kondisi keuanganmu dan langkah paling masuk akal untuk dilakukan.",
};

export default function Page() {
  return <FinancialReflectionResult />;
}
