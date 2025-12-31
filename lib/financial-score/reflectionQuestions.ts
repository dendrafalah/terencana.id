export type OptionValue = 2 | 1 | 0;

export type Question = {
  id: string;
  title: string;
  options: { label: string; value: OptionValue }[];
  pillar:
    | "Rasa Aman"
    | "Arus Bulanan"
    | "Kontrol"
    | "Ketahanan"
    | "Cadangan"
    | "Beban"
    | "Ruang"
    | "Proteksi"
    | "Arah"
    | "Kebiasaan"
    | "Ringkasan";
};

export const REFLECTION_QUESTIONS: Question[] = [
  {
    id: "q1",
    title: "Saat memikirkan kondisi keuanganmu sekarang, kamu merasa…",
    pillar: "Rasa Aman",
    options: [
      { label: "😌 Cukup tenang", value: 2 },
      { label: "😐 Kadang kepikiran", value: 1 },
      { label: "😟 Sering cemas", value: 0 },
    ],
  },
  {
    id: "q2",
    title: "Di akhir bulan, kondisi uangmu biasanya…",
    pillar: "Arus Bulanan",
    options: [
      { label: "😌 Masih ada sisa", value: 2 },
      { label: "😐 Pas-pasan", value: 1 },
      { label: "😟 Sering kurang", value: 0 },
    ],
  },
  {
    id: "q3",
    title: "Soal pengeluaran sehari-hari, kamu merasa…",
    pillar: "Kontrol",
    options: [
      { label: "😌 Masih terkendali", value: 2 },
      { label: "😐 Kadang kebablasan", value: 1 },
      { label: "😟 Sering nggak sadar habis ke mana", value: 0 },
    ],
  },
  {
    id: "q4",
    title: "Kalau tiba-tiba tidak ada pemasukan sementara waktu…",
    pillar: "Ketahanan",
    options: [
      { label: "😌 Masih cukup tenang", value: 2 },
      { label: "😐 Bisa bertahan sebentar", value: 1 },
      { label: "😟 Langsung khawatir", value: 0 },
    ],
  },
  {
    id: "q5",
    title: "Tentang tabungan atau dana cadanganmu…",
    pillar: "Cadangan",
    options: [
      { label: "😌 Ada dan terasa cukup", value: 2 },
      { label: "😐 Ada, tapi tipis", value: 1 },
      { label: "😟 Hampir tidak ada", value: 0 },
    ],
  },
  {
    id: "q6",
    title: "Soal cicilan atau utang yang kamu punya…",
    pillar: "Beban",
    options: [
      { label: "😌 Tidak membebani", value: 2 },
      { label: "😐 Ada, tapi masih bisa diatur", value: 1 },
      { label: "😟 Sering bikin kepikiran", value: 0 },
    ],
  },
  {
    id: "q7",
    title: "Setelah bayar semua kebutuhan & kewajiban, kamu merasa…",
    pillar: "Ruang",
    options: [
      { label: "😌 Masih ada ruang bernapas", value: 2 },
      { label: "😐 Agak sempit", value: 1 },
      { label: "😟 Sangat tertekan", value: 0 },
    ],
  },
  {
    id: "q8",
    title: "Kalau terjadi hal besar (sakit, musibah, dll)…",
    pillar: "Proteksi",
    options: [
      { label: "😌 Sudah ada perlindungan dasar", value: 2 },
      { label: "😐 Sebagian ada", value: 1 },
      { label: "😟 Belum siap sama sekali", value: 0 },
    ],
  },
  {
    id: "q9",
    title: "Soal rencana keuangan ke depan…",
    pillar: "Arah",
    options: [
      { label: "😌 Sudah punya arah", value: 2 },
      { label: "😐 Ada niat, tapi belum konsisten", value: 1 },
      { label: "😟 Belum kepikiran", value: 0 },
    ],
  },
  {
    id: "q10",
    title: "Dalam beberapa bulan terakhir, kamu…",
    pillar: "Kebiasaan",
    options: [
      { label: "😌 Rutin menyisihkan uang", value: 2 },
      { label: "😐 Kadang-kadang", value: 1 },
      { label: "😟 Hampir tidak pernah", value: 0 },
    ],
  },
  {
    id: "q11",
    title: "Kalau dirangkum, kondisi keuanganmu sekarang terasa…",
    pillar: "Ringkasan",
    options: [
      { label: "😌 Masih terkendali", value: 2 },
      { label: "😐 Perlu dirapikan", value: 1 },
      { label: "😟 Cukup berat", value: 0 },
    ],
  },
];
