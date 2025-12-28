/* terencana.id — Financial Health Check Result */
const STORE_KEY = "terencana_fhc_v1";

const IDR = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 });
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

function build(){
  const s = load();
  const mount = document.getElementById("resultMount");
  if(!s){
    mount.innerHTML = `
      <h2 class="fhcH2">Belum ada data</h2>
      <p class="fhcP">Kamu belum mengisi wizard, atau data tersimpan sudah terhapus.</p>
      <div style="margin-top:12px;">
        <a class="btn primary" href="./index.html">Mulai cek</a>
      </div>
    `;
    return;
  }

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

  // simple scoring
  let red=0, yellow=0;
  if(trueCashLeft < 0) red++; else if(incomeM>0 && trueCashLeft < incomeM*0.05) yellow++;
  if(debtRatio > 0.40) red++; else if(debtRatio > 0.30) yellow++;
  if(Number.isFinite(efMonths) && efMonths < 1) red++; else if(Number.isFinite(efMonths) && efMonths < efTarget) yellow++;

  let status = {label:"Relatif sehat", note:"Kondisi dasar cukup stabil. Fokus ke konsistensi tabungan dan tujuan.", tone:"green"};
  if(incomeM<=0) status = {label:"Belum lengkap", note:"Pemasukan masih kosong. Isi pemasukan agar hasil akurat.", tone:"yellow"};
  else if(red>=2) status = {label:"Perlu perhatian", note:"Ada beberapa indikator berisiko. Prioritas: stabilkan arus kas & kendalikan kewajiban.", tone:"red"};
  else if(red===1 || yellow>=2) status = {label:"Perlu dirapikan", note:"Fondasi sudah ada, tapi masih ada area yang perlu distabilkan.", tone:"yellow"};

  const kpi = (title, value, sub)=>`
    <div class="fhcStat">
      <b>${escapeHtml(title)}</b>
      <div class="v">${escapeHtml(value)}</div>
      <div style="margin-top:6px;color:rgba(17,17,17,.62);font-size:13px;">${escapeHtml(sub||"")}</div>
    </div>
  `;

  const steps = [];
  if(trueCashLeft < 0) steps.push("Tutup defisit dulu: pangkas pengeluaran yang paling mudah dikurangi, dan hentikan kebiasaan bocor kecil yang sering berulang.");
  if(debtRatio > 0.35) steps.push("Kendalikan cicilan: fokus lunasi utang berbunga tinggi, hindari tambah utang konsumtif.");
  if(Number.isFinite(efMonths) && efMonths < 1) steps.push("Bangun dana darurat minimal 1 bulan kebutuhan pokok, lalu naik bertahap.");
  else if(Number.isFinite(efMonths) && efMonths < efTarget) steps.push(`Naikkan dana darurat bertahap sampai target ${efTarget} bulan.`);
  if(Number.isFinite(saveRate) && saveRate < 0.10 && trueCashLeft > 0) steps.push("Mulai auto-transfer tabungan setelah gajian. Target awal: 10% (pelan tapi konsisten).");
  if(steps.length===0) steps.push("Susun 1–2 tujuan keuangan prioritas (6–18 bulan), lalu cocokkan alokasi tabungan/investasi.");

  mount.innerHTML = `
    <h2 class="fhcH2">Ringkasan</h2>
    <p class="fhcP"><b>${escapeHtml(status.label)}</b> — ${escapeHtml(status.note)}</p>

    <div class="fhcReviewGrid" style="margin-top:12px;">
      ${kpi("Sisa uang real per bulan", fmtIDR(trueCashLeft), "Sisa setelah biaya hidup, cicilan, proteksi, tabungan/investasi.")}
      ${kpi("Dana darurat (perkiraan)", Number.isFinite(efMonths)? efMonths.toFixed(1)+" bulan":"-", "Berapa bulan kebutuhan pokok bisa ditutup aset likuid.")}
      ${kpi("Rasio cicilan", pct(debtRatio), "Patokan aman umumnya ≤ 30–35% dari pemasukan.")}
    </div>

    <div class="fhcReviewGrid" style="margin-top:10px;">
      ${kpi("Pemasukan per bulan", fmtIDR(incomeM), "")}
      ${kpi("Biaya hidup per bulan", fmtIDR(livingM), "Kebutuhan pokok + gaya hidup")}
      ${kpi("Tabungan + investasi per bulan", fmtIDR(saving+invest), `Rasio menabung: ${pct(saveRate)}`)}
    </div>

    <div style="margin-top:14px;" class="fhcCard">
      <h2 class="fhcH2">3 langkah awal yang paling masuk akal</h2>
      <ol style="margin:8px 0 0; padding-left:18px; line-height:1.7; color:rgba(17,17,17,.82);">
        ${steps.map(x=>`<li>${escapeHtml(x)}</li>`).join("")}
      </ol>
    </div>

    <div style="margin-top:14px;" class="fhcCard">
      <h2 class="fhcH2">Detail (untuk yang mau lebih lengkap)</h2>
      <div class="fhcReviewGrid" style="margin-top:10px;">
        ${kpi("Biaya hidup / pemasukan", incomeM>0 ? pct(livingM/incomeM) : "-", "")}
        ${kpi("Likuiditas", Number.isFinite(liquidityMonths)? liquidityMonths.toFixed(1)+" bulan":"-", "Aset likuid dibanding (biaya hidup + cicilan + premi).")}
        ${kpi("Kekayaan bersih", fmtIDR(netWorth), "Aset - utang (snapshot).")}
      </div>
    </div>
  `;

  // PDF
  document.getElementById("btnPdf").addEventListener("click", ()=>{
    window.print();
  });

  // Excel
  document.getElementById("btnExcel").addEventListener("click", ()=>{
    exportExcel(s, {
      incomeM, needsM, lifeM, livingM, debtPay, premium, saving, invest, otherC,
      trueCashLeft, assetsTotal, debtsTotal, netWorth, efMonths, efTarget, saveRate, debtRatio, liquidityMonths, liquidAssets
    });
  });
}

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
  const numFmt = (ws, r, c)=> {
    const addr = XLSX.utils.encode_cell({r,c});
    if(ws[addr]) ws[addr].z = '#,##0';
  };
  for(let r=3; r<=13; r++) numFmt(wsSummary, r, 1);
  // ratios
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
