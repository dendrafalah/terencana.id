/* terencana.id — Financial Health Check Result */
const STORE_KEY = "terencana_fhc_v1";

const fmtIDR = (n)=> new Intl.NumberFormat("id-ID", { style:"currency", currency:"IDR", maximumFractionDigits:0 }).format(Number(n||0));
const pct = (n)=> Number.isFinite(n) ? (n*100).toFixed(1) + "%" : "-";
const monthlyEq = (amount, period)=> (period==="yearly") ? (Number(amount||0)/12) : Number(amount||0);

function load(){
  try{
    const raw = localStorage.getItem(STORE_KEY);
    return raw ? JSON.parse(raw) : null;
  }catch(e){
    return null;
  }
}

function sumListMonthly(list){
  return (list||[]).reduce((a,b)=> a + monthlyEq(b.amount||0, b.period||"monthly"), 0);
}
function pickTagMonthly(list, tag){
  const row = (list||[]).find(x=>x.tag===tag);
  if(!row) return 0;
  return monthlyEq(row.amount||0, row.period||"monthly");
}

function escapeHtml(str){
  return String(str ?? "")
    .replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;")
    .replaceAll('"',"&quot;").replaceAll("'","&#039;");
}

function statusByRule(type, value, ctx){
  if(type === "cashflow"){
    if(value >= 0) return {level:"good", label:"Sehat"};
    if(ctx.incomeM > 0 && value >= -0.05 * ctx.incomeM) return {level:"warn", label:"Tipis"};
    return {level:"bad", label:"Defisit"};
  }

  if(type === "debt"){
    if(value <= 0.30) return {level:"good", label:"Aman"};
    if(value <= 0.40) return {level:"warn", label:"Berat"};
    return {level:"bad", label:"Terlalu tinggi"};
  }

  if(type === "emergency"){
    if(value >= ctx.efTarget) return {level:"good", label:"Aman"};
    if(value >= 1) return {level:"warn", label:"Belum ideal"};
    return {level:"bad", label:"Belum aman"};
  }

  if(type === "saving"){
    if(value >= 0.20) return {level:"good", label:"Bagus"};
    if(value >= 0.10) return {level:"warn", label:"Rendah"};
    return {level:"bad", label:"Sangat rendah"};
  }

  return {level:"warn", label:"Cek ulang"};
}

function build(){
  const s = load();

  // sesuai hasil.html versi baru
  const resultView = document.getElementById("resultView");
  const inputView  = document.getElementById("inputView");

  if(!s){
    if(resultView){
      resultView.innerHTML = `
        <h2 class="fhcH2">Belum ada data</h2>
        <p class="fhcP">Kamu belum mengisi Financial Health Check.</p>
        <a class="btn primary" href="./index.html">Mulai cek</a>
      `;
    }
    if(inputView) inputView.innerHTML = "";
    bindActions(null, null);
    return;
  }

  // ===== hitung KPI =====
  const incomeM = sumListMonthly(s.pemasukan);
  const needsM  = sumListMonthly(s.wajib);
  const lifeM   = sumListMonthly(s.opsional);
  const livingM = needsM + lifeM;

  const debtPay = pickTagMonthly(s.komitmen, "debtpay");
  const premium = pickTagMonthly(s.komitmen, "premium");
  const saving  = pickTagMonthly(s.komitmen, "saving");
  const invest  = pickTagMonthly(s.komitmen, "invest");
  const otherC  = pickTagMonthly(s.komitmen, "other");

  const trueCashLeft = incomeM - livingM - debtPay - premium - saving - invest - otherC;

  const assets = (s.asetutang?.assets||[]);
  const debts  = (s.asetutang?.debts||[]);
  const assetsTotal = assets.reduce((a,b)=>a+(b.amount||0),0);
  const debtsTotal  = debts.reduce((a,b)=>a+(b.amount||0),0);
  const netWorth = assetsTotal - debtsTotal;

  const liquidAssets = assets.filter(x=>x.tag==="liquid").reduce((a,b)=>a+(b.amount||0),0);
  const efBase = needsM;
  const efMonths = efBase > 0 ? (liquidAssets / efBase) : NaN;

  const saveRate = incomeM > 0 ? ((saving+invest)/incomeM) : NaN;
  const debtRatio = incomeM > 0 ? (debtPay/incomeM) : NaN;
  const liquidityMonths = (livingM + debtPay + premium) > 0 ? (liquidAssets/(livingM + debtPay + premium)) : NaN;

  const efTarget = Number(s.profil?.targetDanaDarurat || 3);

  // ===== status umum (opsional, tetap kepake untuk narasi) =====
  let red=0, yellow=0;
  if(trueCashLeft < 0) red++; else if(incomeM>0 && trueCashLeft < incomeM*0.05) yellow++;
  if(debtRatio > 0.40) red++; else if(debtRatio > 0.30) yellow++;
  if(Number.isFinite(efMonths) && efMonths < 1) red++; else if(Number.isFinite(efMonths) && efMonths < efTarget) yellow++;

  let status = {label:"Relatif sehat", note:"Kondisi dasar cukup stabil. Fokus ke konsistensi dan tujuan.", tone:"green"};
  if(incomeM<=0) status = {label:"Belum lengkap", note:"Pemasukan masih kosong. Isi pemasukan agar hasil akurat.", tone:"yellow"};
  else if(red>=2) status = {label:"Perlu perhatian", note:"Ada beberapa indikator berisiko. Prioritas: stabilkan arus kas & kendalikan kewajiban.", tone:"red"};
  else if(red===1 || yellow>=2) status = {label:"Perlu dirapikan", note:"Fondasi sudah ada, tapi masih ada area yang perlu distabilkan.", tone:"yellow"};

  const ctx = {
    incomeM, needsM, lifeM, livingM,
    debtPay, premium, saving, invest, otherC,
    trueCashLeft,
    assetsTotal, debtsTotal, netWorth,
    efMonths, efTarget,
    saveRate, debtRatio, liquidityMonths,
    liquidAssets,
    status
  };

  // ===== langkah berikutnya (selalu ada, bukan cuma masalah) =====
  const steps = buildNextSteps(ctx);
  ctx.steps = steps;

  // ===== render hasil (advance only) =====
  if(resultView) resultView.innerHTML = renderAdvancedWithSteps(ctx);

  // ===== render ringkasan input (biar PDF ikut lengkap) =====
  if(inputView) inputView.innerHTML = renderInputSummary(s, ctx);

  // ===== actions =====
  bindActions(s, ctx);
}

function buildNextSteps(ctx){
  const steps = [];

  // Cashflow
  if(ctx.trueCashLeft < 0){
    steps.push("Stabilkan arus kas: cari 1–2 pengeluaran terbesar yang bisa diturunkan dulu (bukan yang kecil-kecil).");
  }else if(ctx.incomeM>0 && ctx.trueCashLeft < ctx.incomeM*0.05){
    steps.push("Biar tidak ‘tipis’: buat buffer minimal 5–10% dari pemasukan (sisihkan di awal, bukan sisa di akhir).");
  }else{
    steps.push("Pertahankan cashflow positif: otomatisasikan alokasi (tabungan/investasi/tujuan) begitu gajian masuk.");
  }

  // Debt ratio
  if(Number.isFinite(ctx.debtRatio) && ctx.debtRatio > 0.35){
    steps.push("Rapikan cicilan: hentikan utang konsumtif baru, dan prioritaskan lunasi bunga tertinggi dulu.");
  }else{
    steps.push("Kalau cicilan sudah aman: arahkan ‘ruang’ yang ada untuk percepat dana darurat/tujuan besar.");
  }

  // Emergency fund
  if(Number.isFinite(ctx.efMonths) && ctx.efMonths < 1){
    steps.push("Bangun dana darurat tahap 1: kumpulkan dulu 1 bulan kebutuhan pokok, baru naik bertahap.");
  }else if(Number.isFinite(ctx.efMonths) && ctx.efMonths < ctx.efTarget){
    steps.push(`Naikkan dana darurat sampai ${ctx.efTarget} bulan (cara paling mudah: auto-transfer kecil tapi rutin).`);
  }else if(Number.isFinite(ctx.efMonths)){
    steps.push("Dana darurat sudah aman: pisahkan rekeningnya dan jangan dicampur dengan tabungan tujuan.");
  }

  // Saving rate
  if(Number.isFinite(ctx.saveRate) && ctx.saveRate < 0.10 && ctx.trueCashLeft > 0){
    steps.push("Naikkan rasio menabung: target awal 10% dulu (konsisten lebih penting dari besar).");
  }else if(Number.isFinite(ctx.saveRate) && ctx.saveRate >= 0.20){
    steps.push("Tabungan/investasi sudah bagus: lanjutkan dan mulai mapping tujuan (6–24 bulan) biar makin terarah.");
  }else if(Number.isFinite(ctx.saveRate)){
    steps.push("Kalau menabung sudah jalan: pertimbangkan naikkan sedikit per 3 bulan (misal +1–2%).");
  }

  // Biar tidak kepanjangan: ambil 5 yang paling relevan
  return steps.slice(0, 5);
}

function renderAdvancedWithSteps(ctx){
  return `
    <h2 class="fhcH2">Ringkasan</h2>
    <p class="fhcP"><b>${escapeHtml(ctx.status.label)}</b> — ${escapeHtml(ctx.status.note)}</p>

    <div class="fhcReviewGrid" style="margin-top:12px;">
      ${stat("Sisa uang real / bulan", fmtIDR(ctx.trueCashLeft), "Sisa setelah biaya hidup, cicilan, proteksi, tabungan/investasi.")}
      ${stat("Dana darurat (perkiraan)", Number.isFinite(ctx.efMonths)? ctx.efMonths.toFixed(1)+" bulan":"-", "Aset likuid dibanding kebutuhan pokok.")}
      ${stat("Rasio cicilan", pct(ctx.debtRatio), "Patokan aman umumnya ≤ 30–35% dari pemasukan.")}
    </div>

    <div class="fhcCard" style="margin-top:14px;">
      <h2 class="fhcH2">Langkah berikutnya</h2>
      <ol style="margin:8px 0 0; padding-left:18px; line-height:1.7; color:rgba(17,17,17,.82);">
        ${ctx.steps.map(x=>`<li>${escapeHtml(x)}</li>`).join("")}
      </ol>
      <p class="fhcP" style="margin-top:10px;">Catatan: ini saran umum dari angka yang kamu isi—bukan keputusan finansial final.</p>
    </div>

    <div class="fhcCard" style="margin-top:14px;">
      <h2 class="fhcH2">Bedah indikator</h2>

      ${advItem(
        "Cashflow bulanan",
        fmtIDR(ctx.trueCashLeft),
        statusByRule("cashflow", ctx.trueCashLeft, ctx),
        "Sisa uang setelah semua pengeluaran & alokasi.",
        `Pemasukan ${fmtIDR(ctx.incomeM)} vs Total keluar ${fmtIDR(ctx.livingM + ctx.debtPay + ctx.premium)}`
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
        Number.isFinite(ctx.efMonths)? ctx.efMonths.toFixed(1)+" bulan":"-",
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

      <div class="fhcReviewGrid" style="margin-top:12px;">
        ${stat("Pemasukan / bulan", fmtIDR(ctx.incomeM), "")}
        ${stat("Biaya hidup / bulan", fmtIDR(ctx.livingM), "Kebutuhan pokok + gaya hidup")}
        ${stat("Likuiditas", Number.isFinite(ctx.liquidityMonths)? ctx.liquidityMonths.toFixed(1)+" bulan":"-", "Aset likuid dibanding (biaya hidup + cicilan + premi).")}
      </div>
    </div>
  `;
}

function stat(title, value, sub){
  return `
    <div class="fhcStat">
      <b>${escapeHtml(title)}</b>
      <div class="v">${escapeHtml(value)}</div>
      <div style="margin-top:6px;color:rgba(17,17,17,.62);font-size:13px;">${escapeHtml(sub||"")}</div>
    </div>
  `;
}

function advItem(title, value, st, explain, detail){
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

/* ========= INPUT SUMMARY (for PDF) ========= */
function renderInputSummary(s){
  const name = (s.profil?.nama || "").trim();
  const status = s.profil?.status || "";
  const tangg = s.profil?.tanggungan ?? "";
  const efTarget = s.profil?.targetDanaDarurat ?? "";

  const section = (title, list, isMonthly=true)=> {
    const rows = (list||[]).map(it=>{
      const per = isMonthly ? (it.period==="yearly" ? "Tahunan" : "Bulanan") : "Saat ini";
      const amt = (it.amount||0);
      const eqm = isMonthly ? (it.period==="yearly" ? amt/12 : amt) : amt;
      return `
        <tr>
          <td>${escapeHtml(it.label||"")}</td>
          <td style="text-align:right; white-space:nowrap;">${escapeHtml(per)}</td>
          <td style="text-align:right; white-space:nowrap;">${escapeHtml(fmtIDR(amt))}</td>
          <td style="text-align:right; white-space:nowrap;">${escapeHtml(fmtIDR(eqm))}</td>
        </tr>
      `;
    }).join("");

    return `
      <div style="margin-top:12px;">
        <h3 style="margin:0 0 8px; font-size:15px;">${escapeHtml(title)}</h3>
        <div style="overflow:auto; border:1px solid rgba(17,17,17,.10); border-radius:14px; background:rgba(255,255,255,.55);">
          <table style="width:100%; border-collapse:collapse; min-width:620px;">
            <thead>
              <tr>
                <th style="text-align:left; padding:10px; border-bottom:1px solid rgba(17,17,17,.10);">Item</th>
                <th style="text-align:right; padding:10px; border-bottom:1px solid rgba(17,17,17,.10);">Periode</th>
                <th style="text-align:right; padding:10px; border-bottom:1px solid rgba(17,17,17,.10);">Jumlah</th>
                <th style="text-align:right; padding:10px; border-bottom:1px solid rgba(17,17,17,.10);">Ekuiv. Bulanan</th>
              </tr>
            </thead>
            <tbody>
              ${rows || `<tr><td colspan="4" style="padding:10px; color:rgba(17,17,17,.62);">-</td></tr>`}
            </tbody>
          </table>
        </div>
      </div>
    `;
  };

  const assets = s.asetutang?.assets || [];
  const debts  = s.asetutang?.debts || [];

  const oneTimeTable = (title, list)=> {
    const rows = (list||[]).map(it=>`
      <tr>
        <td>${escapeHtml(it.label||"")}</td>
        <td style="text-align:right; white-space:nowrap;">${escapeHtml(fmtIDR(it.amount||0))}</td>
      </tr>
    `).join("");

    return `
      <div style="margin-top:12px;">
        <h3 style="margin:0 0 8px; font-size:15px;">${escapeHtml(title)}</h3>
        <div style="overflow:auto; border:1px solid rgba(17,17,17,.10); border-radius:14px; background:rgba(255,255,255,.55);">
          <table style="width:100%; border-collapse:collapse; min-width:520px;">
            <thead>
              <tr>
                <th style="text-align:left; padding:10px; border-bottom:1px solid rgba(17,17,17,.10);">Item</th>
                <th style="text-align:right; padding:10px; border-bottom:1px solid rgba(17,17,17,.10);">Jumlah</th>
              </tr>
            </thead>
            <tbody>
              ${rows || `<tr><td colspan="2" style="padding:10px; color:rgba(17,17,17,.62);">-</td></tr>`}
            </tbody>
          </table>
        </div>
      </div>
    `;
  };

  return `
    <h2 class="fhcH2">Ringkasan input (ikut tersimpan di PDF)</h2>
    <div class="fhcReviewGrid" style="margin-top:12px;">
      ${stat("Nama/Inisial", name || "-", "")}
      ${stat("Status", status || "-", "")}
      ${stat("Tanggungan", String(tangg || "-"), "")}
    </div>
    <div class="fhcReviewGrid" style="margin-top:10px;">
      ${stat("Target dana darurat", (efTarget? efTarget+" bulan":"-"), "")}
      ${stat("Catatan", "Data tersimpan di browser", "Kamu bisa edit lewat tombol ‘Perbaiki input’.")}
      ${stat("Export", "Excel berisi Input + Ringkasan", "PDF akan ikut memuat ringkasan input ini.")}
    </div>

    ${section("Pemasukan", s.pemasukan, true)}
    ${section("Kebutuhan pokok", s.wajib, true)}
    ${section("Gaya hidup", s.opsional, true)}
    ${section("Cicilan & alokasi", s.komitmen, true)}
    ${oneTimeTable("Aset (snapshot)", assets)}
    ${oneTimeTable("Utang (snapshot)", debts)}
  `;
}

/* ========= ACTIONS ========= */
function bindActions(s, ctx){
  document.getElementById("btnPdf")?.addEventListener("click", ()=> window.print());

  document.getElementById("btnExcel")?.addEventListener("click", ()=> {
    if(!s || !ctx) return;
    exportExcel(s, ctx);
  });
}

/* ========= EXCEL ========= */
function exportExcel(s, c){
  if(typeof XLSX === "undefined"){
    alert("Library Excel belum termuat.");
    return;
  }

  const now = new Date();
  const dateStr = now.toISOString().slice(0,10);
  const name = (s.profil?.nama || "").trim();
  const safeName = name ? name.replace(/[^\w\-]+/g,"_") : "anon";

  // Sheet Input
  const rows = [];
  const pushList = (section, list, isMonthly)=> {
    (list||[]).forEach(it=>{
      const period = isMonthly ? (it.period==="yearly" ? "Tahunan" : "Bulanan") : "Saat ini";
      const monthly = isMonthly ? (it.period==="yearly" ? (it.amount||0)/12 : (it.amount||0)) : (it.amount||0);
      rows.push([section, it.label||"", period, (it.amount||0), Math.round(monthly)]);
    });
  };
  pushList("Pemasukan", s.pemasukan, true);
  pushList("Kebutuhan Pokok", s.wajib, true);
  pushList("Gaya Hidup", s.opsional, true);
  pushList("Cicilan & Alokasi", s.komitmen, true);
  pushList("Aset", s.asetutang?.assets||[], false);
  pushList("Utang", s.asetutang?.debts||[], false);

  const wsInput = XLSX.utils.aoa_to_sheet([
    ["terencana.id — Financial Health Check (Input)"],
    ["Tanggal", dateStr],
    [],
    ["Nama/Inisial", s.profil?.nama||""],
    ["Status", s.profil?.status||""],
    ["Tanggungan", s.profil?.tanggungan||""],
    ["Target Dana Darurat (bulan)", s.profil?.targetDanaDarurat||""],
    [],
    ["Bagian", "Item", "Periode", "Jumlah (input)", "Ekuivalen Bulanan"],
    ...rows
  ]);
  wsInput["!cols"] = [{wch:22},{wch:40},{wch:12},{wch:18},{wch:18}];

  // Sheet Summary
  const wsSummary = XLSX.utils.aoa_to_sheet([
    ["terencana.id — Financial Health Check (Ringkasan)"],
    ["Tanggal", dateStr],
    [],
    ["Pemasukan/bulan", Math.round(c.incomeM||0)],
    ["Kebutuhan pokok/bulan", Math.round(c.needsM||0)],
    ["Gaya hidup/bulan", Math.round(c.lifeM||0)],
    ["Biaya hidup/bulan", Math.round(c.livingM||0)],
    ["Cicilan/bulan", Math.round(c.debtPay||0)],
    ["Premi proteksi/bulan", Math.round(c.premium||0)],
    ["Tabungan/bulan", Math.round(c.saving||0)],
    ["Investasi/bulan", Math.round(c.invest||0)],
    ["Sisa uang real/bulan", Math.round(c.trueCashLeft||0)],
    [],
    ["Dana darurat (bulan)", Number.isFinite(c.efMonths)? c.efMonths : ""],
    ["Target dana darurat (bulan)", c.efTarget||""],
    ["Rasio menabung", Number.isFinite(c.saveRate)? c.saveRate : ""],
    ["Rasio cicilan", Number.isFinite(c.debtRatio)? c.debtRatio : ""],
    ["Likuiditas (bulan)", Number.isFinite(c.liquidityMonths)? c.liquidityMonths : ""],
    [],
    ["Aset (snapshot)", Math.round(c.assetsTotal||0)],
    ["Utang (snapshot)", Math.round(c.debtsTotal||0)],
    ["Kekayaan bersih", Math.round(c.netWorth||0)]
  ]);
  wsSummary["!cols"] = [{wch:34},{wch:22}];

  // Number formats
  const numFmt = (ws, r, cidx)=> {
    const addr = XLSX.utils.encode_cell({r, c:cidx});
    if(ws[addr]) ws[addr].z = '#,##0';
  };
  for(let r=3; r<=13; r++) numFmt(wsSummary, r, 1);

  const ratioFmt = (ws, r)=> {
    const addr = XLSX.utils.encode_cell({r, c:1});
    if(ws[addr]){
      ws[addr].z = '0.0%';
      ws[addr].v = Number(ws[addr].v || 0);
    }
  };
  ratioFmt(wsSummary, 15);
  ratioFmt(wsSummary, 16);

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, wsInput, "Input");
  XLSX.utils.book_append_sheet(wb, wsSummary, "Ringkasan");

  XLSX.writeFile(wb, `health_check_${safeName}_${dateStr}.xlsx`);
}

build();
