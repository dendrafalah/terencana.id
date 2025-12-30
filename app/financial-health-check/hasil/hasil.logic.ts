"use client";

/**
 * terencana.id — Financial Health Check Result logic
 * - Pure browser DOM manipulation (dipanggil dari hasil.boot.tsx)
 */

const STORE_KEY = "terencana_fhc_v1";

const fmtIDR = (n: any) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(n || 0));

const pct = (n: any) => (Number.isFinite(n) ? (n * 100).toFixed(1) + "%" : "-");

const monthlyEq = (amount: any, period: any) =>
  period === "yearly" ? Number(amount || 0) / 12 : Number(amount || 0);

function load(): any {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function sumListMonthly(list: any[]) {
  return (list || []).reduce(
    (a, b) => a + monthlyEq(b.amount || 0, b.period || "monthly"),
    0
  );
}

function pickTagMonthly(list: any[], tag: string) {
  const row = (list || []).find((x) => x.tag === tag);
  if (!row) return 0;
  return monthlyEq(row.amount || 0, row.period || "monthly");
}

function escapeHtml(str: any) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function statusByRule(type: string, value: any, ctx: any) {
  if (type === "cashflow") {
    if (value >= 0) return { level: "good", label: "Sehat" };
    if (ctx.incomeM > 0 && value >= -0.05 * ctx.incomeM)
      return { level: "warn", label: "Tipis" };
    return { level: "bad", label: "Defisit" };
  }
  if (type === "debt") {
    if (value <= 0.3) return { level: "good", label: "Aman" };
    if (value <= 0.4) return { level: "warn", label: "Berat" };
    return { level: "bad", label: "Terlalu tinggi" };
  }
  if (type === "emergency") {
    if (value >= ctx.efTarget) return { level: "good", label: "Aman" };
    if (value >= 1) return { level: "warn", label: "Belum ideal" };
    return { level: "bad", label: "Belum aman" };
  }
  if (type === "saving") {
    if (value >= 0.2) return { level: "good", label: "Bagus" };
    if (value >= 0.1) return { level: "warn", label: "Rendah" };
    return { level: "bad", label: "Sangat rendah" };
  }
  return { level: "warn", label: "Cek ulang" };
}

function stat(title: string, value: string, sub?: string) {
  return `
    <div class="fhcStat">
      <b>${escapeHtml(title)}</b>
      <div class="v">${escapeHtml(value)}</div>
      <div style="margin-top:6px;color:rgba(17,17,17,.62);font-size:13px;">${escapeHtml(
        sub || ""
      )}</div>
    </div>
  `;
}

function advItem(
  title: string,
  value: string,
  st: any,
  explain: string,
  detail: string
) {
  return `
    <div class="fhcIndicator ${st.level}" style="margin-top:10px;">
      <div class="head">
        <b>${escapeHtml(title)}</b>
        <span class="fhcPill ${st.level}">${st.label}</span>
      </div>
      <div class="val">${escapeHtml(value)}</div>
      <div class="mini">${escapeHtml(explain)}</div>
      <div class="detail">${escapeHtml(detail)}</div>
    </div>
  `;
}

function buildNextSteps(ctx: any) {
  const steps: string[] = [];

  if (ctx.trueCashLeft < 0) {
    steps.push(
      "Stabilkan arus kas: cari 1–2 pengeluaran terbesar yang bisa diturunkan dulu (bukan yang kecil-kecil)."
    );
  } else if (ctx.incomeM > 0 && ctx.trueCashLeft < ctx.incomeM * 0.05) {
    steps.push(
      "Biar tidak ‘tipis’: buat buffer minimal 5–10% dari pemasukan (sisihkan di awal, bukan sisa di akhir)."
    );
  } else {
    steps.push(
      "Pertahankan cashflow positif: otomatisasikan alokasi (tabungan/investasi/tujuan) begitu gajian masuk."
    );
  }

  if (Number.isFinite(ctx.debtRatio) && ctx.debtRatio > 0.35) {
    steps.push(
      "Rapikan cicilan: hentikan utang konsumtif baru, dan prioritaskan lunasi bunga tertinggi dulu."
    );
  } else {
    steps.push(
      "Kalau cicilan sudah aman: arahkan ‘ruang’ yang ada untuk percepat dana darurat/tujuan besar."
    );
  }

  if (Number.isFinite(ctx.efMonths) && ctx.efMonths < 1) {
    steps.push(
      "Bangun dana darurat tahap 1: kumpulkan dulu 1 bulan kebutuhan pokok, baru naik bertahap."
    );
  } else if (Number.isFinite(ctx.efMonths) && ctx.efMonths < ctx.efTarget) {
    steps.push(
      `Naikkan dana darurat sampai ${ctx.efTarget} bulan (auto-transfer kecil tapi rutin).`
    );
  } else if (Number.isFinite(ctx.efMonths)) {
    steps.push(
      "Dana darurat sudah aman: pisahkan rekeningnya dan jangan dicampur dengan tabungan tujuan."
    );
  }

  if (Number.isFinite(ctx.saveRate) && ctx.saveRate < 0.1 && ctx.trueCashLeft > 0) {
    steps.push("Naikkan rasio menabung: target awal 10% dulu (konsisten > besar).");
  } else if (Number.isFinite(ctx.saveRate) && ctx.saveRate >= 0.2) {
    steps.push(
      "Tabungan/investasi sudah bagus: lanjutkan dan mapping tujuan (6–24 bulan) biar makin terarah."
    );
  } else if (Number.isFinite(ctx.saveRate)) {
    steps.push("Kalau menabung sudah jalan: coba naikkan sedikit tiap 3 bulan (+1–2%).");
  }

  return steps.slice(0, 5);
}

function renderAdvancedWithSteps(ctx: any) {
  return `
    <h2 class="fhcH2">Ringkasan</h2>
    <p class="fhcP"><b>${escapeHtml(ctx.status.label)}</b> — ${escapeHtml(
    ctx.status.note
  )}</p>

    <div class="fhcReviewGrid" style="margin-top:12px;">
      ${stat(
        "Sisa uang real / bulan",
        fmtIDR(ctx.trueCashLeft),
        "Sisa setelah biaya hidup, cicilan, proteksi, tabungan/investasi."
      )}
      ${stat(
        "Dana darurat (perkiraan)",
        Number.isFinite(ctx.efMonths) ? ctx.efMonths.toFixed(1) + " bulan" : "-",
        "Aset likuid dibanding kebutuhan pokok."
      )}
      ${stat("Rasio cicilan", pct(ctx.debtRatio), "Patokan aman umumnya ≤ 30–35%.")}
    </div>

    <div class="fhcCard" style="margin-top:14px;">
      <h2 class="fhcH2">Langkah berikutnya</h2>
      <ol style="margin:8px 0 0; padding-left:18px; line-height:1.7; color:rgba(17,17,17,.82);">
        ${ctx.steps.map((x: string) => `<li>${escapeHtml(x)}</li>`).join("")}
      </ol>
      <p class="fhcP" style="margin-top:10px;">Catatan: ini saran umum dari angka yang kamu isi.</p>
    </div>

    <div class="fhcCard" style="margin-top:14px;">
      <h2 class="fhcH2">Bedah indikator</h2>

      ${advItem(
        "Cashflow bulanan",
        fmtIDR(ctx.trueCashLeft),
        statusByRule("cashflow", ctx.trueCashLeft, ctx),
        "Sisa uang setelah semua pengeluaran & alokasi.",
        `Pemasukan ${fmtIDR(ctx.incomeM)} vs Total keluar ${fmtIDR(
          ctx.livingM + ctx.debtPay + ctx.premium
        )}`
      )}

      ${advItem(
        "Rasio cicilan",
        pct(ctx.debtRatio),
        statusByRule("debt", ctx.debtRatio, ctx),
        "Porsi cicilan dibanding pemasukan.",
        "Ideal ≤ 30%, waspada di atas 35%"
      )}

      ${advItem(
        "Dana darurat",
        Number.isFinite(ctx.efMonths) ? ctx.efMonths.toFixed(1) + " bulan" : "-",
        statusByRule("emergency", ctx.efMonths, ctx),
        "Cadangan untuk kondisi darurat.",
        `Target pribadi: ${ctx.efTarget} bulan`
      )}

      ${advItem(
        "Tabungan + investasi",
        pct(ctx.saveRate),
        statusByRule("saving", ctx.saveRate, ctx),
        "Dana untuk tujuan masa depan.",
        "Disarankan minimal 10–20%"
      )}

      ${advItem(
        "Kekayaan bersih",
        fmtIDR(ctx.netWorth),
        { level: ctx.netWorth >= 0 ? "good" : "warn", label: ctx.netWorth >= 0 ? "Positif" : "Negatif" },
        "Aset dikurangi utang.",
        `Aset ${fmtIDR(ctx.assetsTotal)} • Utang ${fmtIDR(ctx.debtsTotal)}`
      )}
    </div>
  `;
}

function renderInputSummary(s: any) {
  const name = (s.profil?.nama || "").trim();
  const status = s.profil?.status || "";
  const tangg = s.profil?.tanggungan ?? "";
  const efTarget = s.profil?.targetDanaDarurat ?? "";

  return `
    <h2 class="fhcH2">Ringkasan input</h2>
    <div class="fhcReviewGrid" style="margin-top:12px;">
      ${stat("Nama/Inisial", name || "-", "")}
      ${stat("Status", status || "-", "")}
      ${stat("Tanggungan", String(tangg || "-"), "")}
    </div>
    <div class="fhcReviewGrid" style="margin-top:10px;">
      ${stat("Target dana darurat", efTarget ? efTarget + " bulan" : "-", "")}
      ${stat("Catatan", "Data tersimpan di browser", "Kamu bisa edit lewat tombol ‘Perbaiki input’.")}
      ${stat("Export", "Excel (opsional)", "Bisa ditambah lagi nanti.")}
    </div>
  `;
}

function bindActions() {
  document.getElementById("btnPdf")?.addEventListener("click", () => window.print());
  // btnExcel optional, biar build aman dulu
}

function periodLabel(p: any) {
  return p === "yearly" ? "Tahunan" : "Bulanan";
}

function safeName(row: any) {
  // beberapa data wizard biasanya pakai label/name/title, fallback ke tag
  const n = (row?.name || row?.label || row?.title || "").toString().trim();
  return n || (row?.tag ? String(row.tag) : "-");
}

function renderListTable(title: string, list: any[]) {
  const rows = (list || []).filter((x) => Number(x?.amount || 0) !== 0);

  const totalM = sumListMonthly(rows);

  const body =
    rows.length === 0
      ? `<tr><td colspan="4" style="padding:10px; color:rgba(17,17,17,.62);">Tidak ada data</td></tr>`
      : rows
          .map((r) => {
            const amt = Number(r?.amount || 0);
            const per = r?.period || "monthly";
            const perM = monthlyEq(amt, per);
            return `
              <tr>
                <td style="padding:10px; border-top:1px solid rgba(17,17,17,.12);">
                  ${escapeHtml(safeName(r))}
                </td>
                <td style="padding:10px; border-top:1px solid rgba(17,17,17,.12); white-space:nowrap;">
                  ${escapeHtml(periodLabel(per))}
                </td>
                <td style="padding:10px; border-top:1px solid rgba(17,17,17,.12); text-align:right; white-space:nowrap;">
                  ${escapeHtml(fmtIDR(amt))}
                </td>
                <td style="padding:10px; border-top:1px solid rgba(17,17,17,.12); text-align:right; white-space:nowrap;">
                  ${escapeHtml(fmtIDR(perM))}
                </td>
              </tr>
            `;
          })
          .join("");

  return `
    <div style="margin-top:14px;">
      <div style="display:flex; align-items:baseline; justify-content:space-between; gap:12px;">
        <h3 style="margin:0; font-size:15px;">${escapeHtml(title)}</h3>
        <div style="color:rgba(17,17,17,.68); font-size:13px;">
          Total / bulan: <b>${escapeHtml(fmtIDR(totalM))}</b>
        </div>
      </div>

      <div style="overflow:auto; margin-top:10px; border:1px solid rgba(17,17,17,.12); border-radius:14px; background:rgba(255,255,255,.55);">
        <table style="width:100%; border-collapse:collapse; min-width:560px;">
          <thead>
            <tr>
              <th style="text-align:left; padding:10px; font-size:13px; color:rgba(17,17,17,.68);">Item</th>
              <th style="text-align:left; padding:10px; font-size:13px; color:rgba(17,17,17,.68);">Periode</th>
              <th style="text-align:right; padding:10px; font-size:13px; color:rgba(17,17,17,.68);">Nominal</th>
              <th style="text-align:right; padding:10px; font-size:13px; color:rgba(17,17,17,.68);">Ekuivalen / bulan</th>
            </tr>
          </thead>
          <tbody>
            ${body}
          </tbody>
        </table>
      </div>

      <div style="margin-top:8px; font-size:12px; color:rgba(17,17,17,.62);">
        Catatan: item tahunan dihitung jadi ekuivalen bulanan (dibagi 12) untuk perbandingan.
      </div>
    </div>
  `;
}

function renderAssetsDebts(s: any) {
  const assets = s.asetutang?.assets || [];
  const debts = s.asetutang?.debts || [];

  const assetsTotal = assets.reduce((a: number, b: any) => a + (b.amount || 0), 0);
  const debtsTotal = debts.reduce((a: number, b: any) => a + (b.amount || 0), 0);

  const listSimple = (title: string, list: any[]) => {
    const rows = (list || []).filter((x) => Number(x?.amount || 0) !== 0);
    const body =
      rows.length === 0
        ? `<li style="color:rgba(17,17,17,.62);">Tidak ada data</li>`
        : rows
            .map(
              (r) =>
                `<li>${escapeHtml(safeName(r))} — <b>${escapeHtml(fmtIDR(r.amount || 0))}</b></li>`
            )
            .join("");

    return `
      <div style="margin-top:10px;">
        <div style="font-weight:700; margin-bottom:6px;">${escapeHtml(title)}</div>
        <ul style="margin:0; padding-left:18px; line-height:1.7; color:rgba(17,17,17,.82);">
          ${body}
        </ul>
      </div>
    `;
  };

  return `
    <div style="margin-top:14px;">
      <h3 style="margin:0; font-size:15px;">Aset & Utang</h3>
      <div class="fhcReviewGrid" style="margin-top:10px;">
        ${stat("Total aset", fmtIDR(assetsTotal), "")}
        ${stat("Total utang", fmtIDR(debtsTotal), "")}
        ${stat("Kekayaan bersih", fmtIDR(assetsTotal - debtsTotal), "")}
      </div>
      ${listSimple("Daftar aset", assets)}
      ${listSimple("Daftar utang", debts)}
    </div>
  `;
}

function renderInputDetail(s: any) {
  // timestamp kecil biar enak buat PDF/documentation
  const now = new Date();
  const stamp = new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(now);

  return `
    <div style="margin-top:16px;">
      <h2 class="fhcH2">Detail isian (untuk referensi & PDF)</h2>
      <p class="fhcP" style="margin-top:6px;">
        Dicetak pada: <b>${escapeHtml(stamp)}</b>
      </p>

      ${renderListTable("Pemasukan", s.pemasukan || [])}
      ${renderListTable("Pengeluaran wajib", s.wajib || [])}
      ${renderListTable("Pengeluaran opsional", s.opsional || [])}
      ${renderListTable("Komitmen (cicilan/proteksi/tabungan/investasi)", s.komitmen || [])}

      ${renderAssetsDebts(s)}
    </div>
  `;
}


function build() {
  const s = load();
  const resultView = document.getElementById("resultView");
  const inputView = document.getElementById("inputView");

  if (!resultView) return;

  if (!s) {
    resultView.innerHTML = `
      <h2 class="fhcH2">Belum ada data</h2>
      <p class="fhcP">Kamu belum mengisi Financial Health Check.</p>
      <a class="btn primary" href="/financial-health-check/">Mulai cek</a>
    `;
    if (inputView) inputView.innerHTML = "";
    bindActions();
    return;
  }

  const incomeM = sumListMonthly(s.pemasukan);
  const needsM = sumListMonthly(s.wajib);
  const lifeM = sumListMonthly(s.opsional);
  const livingM = needsM + lifeM;

  const debtPay = pickTagMonthly(s.komitmen, "debtpay");
  const premium = pickTagMonthly(s.komitmen, "premium");
  const saving = pickTagMonthly(s.komitmen, "saving");
  const invest = pickTagMonthly(s.komitmen, "invest");
  const otherC = pickTagMonthly(s.komitmen, "other");

  const trueCashLeft = incomeM - livingM - debtPay - premium - saving - invest - otherC;

  const assets = s.asetutang?.assets || [];
  const debts = s.asetutang?.debts || [];
  const assetsTotal = assets.reduce((a: number, b: any) => a + (b.amount || 0), 0);
  const debtsTotal = debts.reduce((a: number, b: any) => a + (b.amount || 0), 0);
  const netWorth = assetsTotal - debtsTotal;

  const liquidAssets = assets
    .filter((x: any) => x.tag === "liquid")
    .reduce((a: number, b: any) => a + (b.amount || 0), 0);

  const efBase = needsM;
  const efMonths = efBase > 0 ? liquidAssets / efBase : NaN;

  const saveRate = incomeM > 0 ? (saving + invest) / incomeM : NaN;
  const debtRatio = incomeM > 0 ? debtPay / incomeM : NaN;

  const efTarget = Number(s.profil?.targetDanaDarurat || 3);

  let red = 0,
    yellow = 0;
  if (trueCashLeft < 0) red++;
  else if (incomeM > 0 && trueCashLeft < incomeM * 0.05) yellow++;
  if (debtRatio > 0.4) red++;
  else if (debtRatio > 0.3) yellow++;
  if (Number.isFinite(efMonths) && efMonths < 1) red++;
  else if (Number.isFinite(efMonths) && efMonths < efTarget) yellow++;

  let status = {
    label: "Relatif sehat",
    note: "Kondisi dasar cukup stabil. Fokus ke konsistensi dan tujuan.",
    tone: "green",
  };
  if (incomeM <= 0)
    status = { label: "Belum lengkap", note: "Pemasukan masih kosong.", tone: "yellow" };
  else if (red >= 2)
    status = { label: "Perlu perhatian", note: "Ada indikator berisiko.", tone: "red" };
  else if (red === 1 || yellow >= 2)
    status = { label: "Perlu dirapikan", note: "Ada area yang perlu distabilkan.", tone: "yellow" };

  const ctx: any = {
    incomeM,
    needsM,
    lifeM,
    livingM,
    debtPay,
    premium,
    saving,
    invest,
    otherC,
    trueCashLeft,
    assetsTotal,
    debtsTotal,
    netWorth,
    efMonths,
    efTarget,
    saveRate,
    debtRatio,
    status,
  };

  ctx.steps = buildNextSteps(ctx);

    resultView.innerHTML = renderAdvancedWithSteps(ctx);
  if (inputView) inputView.innerHTML = renderInputSummary(s) + renderInputDetail(s);


  bindActions();
}

/** ✅ INI YANG DICARI IMPORT */
export function initHasil() {
  const resultView = document.getElementById("resultView");
  if (!resultView) return;
  build();
}
