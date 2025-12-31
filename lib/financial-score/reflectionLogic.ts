import { REFLECTION_QUESTIONS, OptionValue } from "./reflectionQuestions";

export const STORE_KEY = "terencana_reflection_v1";

export type ReflectionLabelKey =
  | "singa"
  | "gajah"
  | "serigala"
  | "rubah"
  | "kura"
  | "tupai"
  | "ikan";

export type ReflectionResult = {
  version: 1;
  createdAtISO: string;
  answers: Record<string, OptionValue>;

  // internal (jangan ditampilkan di UI)
  total: number; // 0..22
  max: number; // 22

  // hasil versi hewan (untuk UI)
  animalKey: ReflectionLabelKey;
  animalName: string;
  animalTagline: string;
  animalImage: string; // path dari /public, contoh: "/images/cek-keuangan/rubah-cerdas.png"
  heroTitle: string;
  heroDesc: string;
  insightMain: string;

  strengths: string[];
  focus: string[];
  steps: { title: string; desc: string }[];
};

const MAX = REFLECTION_QUESTIONS.length * 2;

export function computeReflectionResult(
  answers: Record<string, OptionValue>
): ReflectionResult {
  const total = REFLECTION_QUESTIONS.reduce(
    (acc, q) => acc + (answers[q.id] ?? 0),
    0
  );

  const label = pickLabel(total);
  const { strengths, focus } = pickInsights(answers);
  const steps = pickSteps(label.key);

  return {
    version: 1,
    createdAtISO: new Date().toISOString(),
    answers,
    total,
    max: MAX,

    animalKey: label.key,
    animalName: label.name,
    animalTagline: label.tagline,
    animalImage: label.image,
    heroTitle: label.heroTitle,
    heroDesc: label.heroDesc,
    insightMain: label.insight,

    strengths,
    focus,
    steps,
  };
}

function pickLabel(total: number): {
  key: ReflectionLabelKey;
  name: string;
  tagline: string;
  image: string;
  heroTitle: string;
  heroDesc: string;
  insight: string;
} {
  // Mapping 7 hewan (angka hanya internal)
  if (total >= 20)
    return {
      key: "singa",
      name: "Singa Tenang",
      tagline: "Kuat, stabil, dan nggak gampang panik",
      image: "/images/cek-keuangan/singa-tenang.png",
      heroTitle: "Fondasi keuanganmu kuat dan stabil.",
      heroDesc:
        "Kamu bukan cuma bertahan—kamu punya kontrol. Tinggal dijaga ritmenya supaya tetap lega.",
      insight:
        "Kamu sudah punya sistem yang bekerja. Tugasmu sekarang: menjaga konsistensi.",
    };

  if (total >= 17)
    return {
      key: "gajah",
      name: "Gajah Kokoh",
      tagline: "Tahan banting, pelan tapi aman",
      image: "/images/cek-keuangan/gajah-kokoh.png",
      heroTitle: "Kamu kuat dan tahan banting.",
      heroDesc:
        "Walau pelan, kamu aman—tinggal arahkan langkahnya supaya makin lega.",
      insight: "Stabilitasmu bagus. Sekarang tinggal bikin tujuan terasa lebih nyata.",
    };

  if (total >= 14)
    return {
      key: "serigala",
      name: "Serigala Siaga",
      tagline: "Aman, tapi perlu waspada",
      image: "/images/cek-keuangan/serigala-siaga.png",
      heroTitle: "Kamu cukup aman, tapi masih perlu waspada.",
      heroDesc:
        "Kalau nggak dirapikan, kamu bisa terkuras pelan-pelan tanpa terasa.",
      insight:
        "Kuncinya bukan kerja lebih keras—tapi bikin pengeluaran lebih terkendali.",
    };

  if (total >= 11)
    return {
      key: "rubah",
      name: "Rubah Cerdas",
      tagline: "Jago adaptasi, rawan improvisasi",
      image: "/images/cek-keuangan/rubah-cerdas.png",
      heroTitle: "Kamu pintar beradaptasi.",
      heroDesc:
        "Tapi terlalu sering mengandalkan improvisasi. Sedikit perapihan bikin hidup jauh lebih lega.",
      insight:
        "Masalah terbesarmu bukan uang masuk—tapi kebocoran kecil yang dibiarkan.",
    };

  if (total >= 8)
    return {
      key: "kura",
      name: "Kura-kura Bertahan",
      tagline: "Masih jalan, tapi ruang bernapas sempit",
      image: "/images/cek-keuangan/kura-bertahan.png",
      heroTitle: "Kamu masih bertahan, tapi ruang geraknya sempit.",
      heroDesc:
        "Kalau tidak dibantu, capeknya numpuk. Fokus kita: bikin ruang bernapas dulu.",
      insight: "Prioritasmu sekarang: bikin ruang bernapas dulu.",
    };

  if (total >= 5)
    return {
      key: "tupai",
      name: "Tupai Sibuk",
      tagline: "Banyak gerak, belum terasa maju",
      image: "/images/cek-keuangan/tupai-sibuk.png",
      heroTitle: "Kamu banyak bergerak, tapi belum terasa maju.",
      heroDesc:
        "Energi kamu habis ngurus hal kecil. Kita perlu fokus ke satu perbaikan yang paling berdampak.",
      insight:
        "Satu perbaikan besar lebih efektif daripada banyak perubahan kecil.",
    };

  return {
    key: "ikan",
    name: "Ikan Terombang-ambing",
    tagline: "Sedang berat, tapi bisa dibantu",
    image: "/images/cek-keuangan/ikan-terombang.png",
    heroTitle: "Keuanganmu sedang berat dan gampang kebawa keadaan.",
    heroDesc:
      "Ini bukan gagal. Ini fase yang bisa dibantu—kita mulai dari pegangan pertama yang jelas.",
    insight: "Kita tidak perlu sempurna dulu. Kita perlu pegangan pertama.",
  };
}

function pickInsights(answers: Record<string, OptionValue>): {
  strengths: string[];
  focus: string[];
} {
  const map: Record<string, { good: string; bad: string }> = {
    q2: {
      good: "Arus bulananmu cenderung aman (akhir bulan masih punya sisa / tidak sering kurang).",
      bad: "Arus bulananmu sering mepet (akhir bulan pas-pasan atau sering kurang).",
    },
    q3: {
      good: "Kamu punya kontrol yang cukup atas pengeluaran harian.",
      bad: "Pengeluaran harian masih sering kebablasan / tidak terasa alurnya.",
    },
    q4: {
      good: "Kamu punya ketahanan kalau pemasukan tiba-tiba berhenti sementara.",
      bad: "Kalau pemasukan berhenti, kamu akan cepat merasa tertekan.",
    },
    q5: {
      good: "Dana cadanganmu sudah mulai memberi rasa aman.",
      bad: "Dana cadangan masih tipis—ini biasanya sumber rasa cemas utama.",
    },
    q6: {
      good: "Cicilan/utangmu belum jadi beban besar.",
      bad: "Cicilan/utangmu terasa membebani dan butuh strategi penenangan.",
    },
    q8: {
      good: "Proteksi dasar sudah ada (atau setidaknya kamu mulai memikirkannya).",
      bad: "Proteksi masih minim, risiko kejadian besar bisa bikin keuangan goyah.",
    },
    q10: {
      good: "Kebiasaan menyisihkan uang sudah terbentuk.",
      bad: "Kebiasaan menyisihkan uang belum terbentuk—kita mulai dari nominal kecil dulu.",
    },
    q9: {
      good: "Kamu sudah punya arah ke depan (tujuan) meskipun sederhana.",
      bad: "Arah ke depan belum kebayang—kita buat tujuan yang gampang dan dekat dulu.",
    },
  };

  const strengths: string[] = [];
  const focus: string[] = [];

  for (const [qid, val] of Object.entries(answers)) {
    const m = map[qid];
    if (!m) continue;

    if (val === 2 && strengths.length < 3) strengths.push(m.good);
    if (val === 0 && focus.length < 3) focus.push(m.bad);
  }

  if (strengths.length === 0)
    strengths.push("Kamu masih mau ngecek dan jujur—itu sudah langkah besar.");
  if (focus.length === 0)
    focus.push("Tinggal dipoles konsistensinya agar lebih terasa aman.");

  return { strengths, focus };
}

function pickSteps(animalKey: ReflectionLabelKey) {
  // 3 langkah (fun tapi tetap realistis)
  switch (animalKey) {
    case "singa":
      return [
        {
          title: "Kunci autopilot",
          desc: "Bikin sistem yang jalan sendiri (mis. auto-pindah ke tabungan tujuan).",
        },
        {
          title: "Naikkan level tujuan",
          desc: "Pilih 1 tujuan yang dekat dan konkret (3–12 bulan).",
        },
        {
          title: "Review ringan bulanan",
          desc: "Cukup 10 menit sebulan untuk cek kebocoran kecil.",
        },
      ];

    case "gajah":
      return [
        {
          title: "Tajamkan arah",
          desc: "Pilih 1 tujuan terdekat supaya langkahmu terasa jelas.",
        },
        {
          title: "Tambah konsistensi sedikit",
          desc: "Sisihkan kecil tapi rutin. Yang penting ‘pasti’ dulu.",
        },
        {
          title: "Rapikan 1 kebocoran",
          desc: "Ambil satu pengeluaran yang sering nggak terasa, lalu pasang batas sederhana.",
        },
      ];

    case "serigala":
      return [
        {
          title: "Stop tambah beban baru",
          desc: "Tahan cicilan baru dulu sampai kondisi makin lega.",
        },
        {
          title: "Cari titik paling menguras",
          desc: "Biasanya arus bulanan atau kebiasaan belanja yang ‘ngalir’.",
        },
        {
          title: "Tambah bantalan aman",
          desc: "Mulai dana penenang kecil tapi rutin.",
        },
      ];

    case "rubah":
      return [
        {
          title: "Pilih 1 kebocoran terbesar",
          desc: "Bukan semuanya. Satu dulu yang paling berpengaruh.",
        },
        {
          title: "Pasang batas sederhana",
          desc: "Buat aturan kecil untuk 1 kategori yang sering kebablasan.",
        },
        {
          title: "Tabungan ‘penenang’",
          desc: "Sekecil apa pun, yang penting rutin—biar rasa aman balik pelan-pelan.",
        },
      ];

    case "kura":
      return [
        {
          title: "Bikin ruang bernapas",
          desc: "Kurangi tekanan 1 sumber utama (tagihan/cicilan/pengeluaran rutin).",
        },
        {
          title: "Stop kebocoran rutin",
          desc: "Cari 1 pengeluaran kecil yang sering muncul dan rapikan.",
        },
        {
          title: "Tambah dana cadangan",
          desc: "Mulai dari nominal kecil tapi konsisten.",
        },
      ];

    case "tupai":
      return [
        {
          title: "Fokus 1 perbaikan besar",
          desc: "Satu perubahan yang paling berdampak lebih efektif daripada banyak perubahan kecil.",
        },
        {
          title: "Bikin sistem kecil",
          desc: "Auto / batas sederhana supaya kamu nggak capek mikir terus.",
        },
        {
          title: "Evaluasi 2 minggu",
          desc: "Cek hasilnya setelah 2 minggu, jangan tiap hari.",
        },
      ];

    case "ikan":
    default:
      return [
        {
          title: "Utamakan bulan ini dulu",
          desc: "Fokus bikin kondisi lebih ringan, bukan langsung sempurna.",
        },
        {
          title: "Stop tambah beban baru",
          desc: "Sementara waktu, tahan cicilan baru dan keputusan besar.",
        },
        {
          title: "Bikin 1 kebiasaan kecil",
          desc: "Yang penting pasti dilakukan 2–4 minggu ke depan.",
        },
      ];
  }
}

export function saveResultToStorage(result: ReflectionResult) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORE_KEY, JSON.stringify(result));
}

export function loadResultFromStorage(): ReflectionResult | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORE_KEY);
    return raw ? (JSON.parse(raw) as ReflectionResult) : null;
  } catch {
    return null;
  }
}
