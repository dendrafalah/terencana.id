import "./nikah.css";
import NikahClient from "./nikah.client";

export const metadata = {
  title: "Rencana Persiapan Nikah | terencana.id",
  description: "Kalkulator persiapan nikah yang fokus ke dampak setelah nikah. Estimasi bisa disesuaikan.",
};

export default function Page() {
  return <NikahClient />;
}
