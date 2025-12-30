/* terencana.id — Financial Health Check Wizard (Next.js client) */
const STORE_KEY = "terencana_fhc_v1";

const IDR = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 });
const fmtDigits = (n)=> IDR.format(n || 0);
const toNumber = (v)=> {
  if(!v) return 0;
  const d = String(v).replace(/[^\d]/g,"");
  return d ? parseInt(d,10) : 0;
};
const fmtIDR = (n)=> new Intl.NumberFormat("id-ID", { style:"currency", currency:"IDR", maximumFractionDigits:0 }).format(Number(n||0));

const STEPS = [
  { key:"profil", title:"Profil", help:"Isi singkat saja. Ini membantu rekomendasi jadi lebih pas." },
  { key:"pemasukan", title:"Pemasukan", help:"Masukkan pemasukan utama. Bonus/THR boleh tahunan." },
  { key:"wajib", title:"Kebutuhan Pokok", help:"Pengeluaran yang sulit dihindari (tempat tinggal, makan, transport)." },
  { key:"opsional", title:"Gaya Hidup", help:"Pengeluaran pilihan (jajan, hiburan, belanja). Bisa diisi kasar dulu." },
  { key:"komitmen", title:"Cicilan & Alokasi", help:"Cicilan, premi proteksi, tabungan, investasi, dan komitmen lain." },
  { key:"asetutang", title:"Aset & Utang", help:"Snapshot nilai saat ini. Kalau belum siap, isi yang utama dulu." },
];

const BASE = {
  meta: { stepIndex: 0 },
  profil: { nama:"", status:"single", tanggungan:"", targetDanaDarurat:"3", catatan:"", rencana12bulan:"" },
  pemasukan: [
    { label:"Gaji bersih (take home)", amount:0, period:"monthly", fixed:true },
    { label:"Penghasilan tambahan", amount:0, period:"monthly", fixed:true },
    { label:"Bonus/THR (jika ada)", amount:0, period:"yearly", fixed:true },
  ],
  wajib: [
    { label:"Tempat tinggal (kos/sewa/KPR)", amount:0, period:"monthly", fixed:true },
    { label:"Makan & kebutuhan rumah", amount:0, period:"monthly", fixed:true },
    { label:"Transport", amount:0, period:"monthly", fixed:true },
    { label:"Listrik/air/internet", amount:0, period:"monthly", fixed:true },
    { label:"Kesehatan rutin", amount:0, period:"monthly", fixed:true },
    { label:"Bantuan keluarga/orang tua", amount:0, period:"monthly", fixed:true },
    { label:"Biaya wajib tahunan (pajak, dll)", amount:0, period:"yearly", fixed:true },
  ],
  opsional: [
    { label:"Jajan/ngopi", amount:0, period:"monthly", fixed:true },
    { label:"Makan di luar", amount:0, period:"monthly", fixed:true },
    { label:"Hiburan/langganan", amount:0, period:"monthly", fixed:true },
    { label:"Belanja/shopping", amount:0, period:"monthly", fixed:true },
    { label:"Liburan", amount:0, period:"yearly", fixed:true },
  ],
  komitmen: [
    { label:"Cicilan total per bulan", amount:0, period:"monthly", tag:"debtpay", fixed:true },
    { label:"Premi proteksi (jika bayar sendiri)", amount:0, period:"monthly", tag:"premium", fixed:true },
    { label:"Tabungan rutin", amount:0, period:"monthly", tag:"saving", fixed:true },
    { label:"Investasi rutin", amount:0, period:"monthly", tag:"invest", fixed:true },
    { label:"Komitmen lain (arisan/iuran)", amount:0, period:"monthly", tag:"other", fixed:true },
  ],
  asetutang: {
    assets: [
      { label:"Uang tunai / tabungan (likuid)", amount:0, fixed:true, tag:"liquid" },
      { label:"Dana darurat (jika terpisah)", amount:0, fixed:true, tag:"liquid" },
      { label:"Investasi (reksa dana/saham/emas)", amount:0, fixed:true, tag:"invest" },
      { label:"Aset lain (opsional)", amount:0, fixed:true, tag:"other" },
    ],
    debts: [
      { label:"Utang jangka pendek (CC/PayLater/Pinjaman)", amount:0, fixed:true, tag:"short" },
      { label:"Utang jangka panjang (KPR/KKB)", amount:0, fixed:true, tag:"long" },
    ]
  }
};

function mergeDeep(target, source){
  if(typeof source !== "object" || source === null) return target;
  for(const k of Object.keys(source)){
    if(source[k] && typeof source[k] === "object" && !Array.isArray(source[k])){
      target[k] = mergeDeep(target[k] ?? {}, source[k]);
    } else {
      target[k] = source[k];
    }
  }
  return target;
}
function loadState(){
  try{
    const raw = localStorage.getItem(STORE_KEY);
    if(!raw) return structuredClone(BASE);
    const parsed = JSON.parse(raw);
    return mergeDeep(structuredClone(BASE), parsed);
  }catch(e){
    return structuredClone(BASE);
  }
}
function saveState(state){
  localStorage.setItem(STORE_KEY, JSON.stringify(state));
}

function escapeHtml(str){
  return String(str ?? "")
    .replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;")
    .replaceAll('"',"&quot;").replaceAll("'","&#039;");
}

function monthlyEq(amount, period){
  const a = Number(amount||0);
  return period === "yearly" ? (a/12) : a;
}
function sumListMonthly(list){
  return list.reduce((acc, it)=> acc + monthlyEq(it.amount||0, it.period||"monthly"), 0);
}
function clamp(n, a, b){ return Math.max(a, Math.min(b, n)); }

export function initHealthWizard(){
  // Guard: kalau element belum ada (misal render beda page), stop
  const stepMount = document.getElementById("stepMount");
  if(!stepMount) return;

  let state = loadState();

  const stepText = document.getElementById("stepText");
  const stepMini = document.getElementById("stepMini");
  const barFill  = document.getElementById("barFill");
  const btnBack  = document.getElementById("btnBack");
  const btnNext  = document.getElementById("btnNext");
  const btnReset = document.getElementById("btnReset");
  const hintText = document.getElementById("hintText");

  const wizard = document.getElementById("wizard");
  const review = document.getElementById("review");
  const reviewGrid = document.getElementById("reviewGrid");

  const btnEdit = document.getElementById("btnEdit");
  const btnSubmit = document.getElementById("btnSubmit");

  const toast = document.getElementById("toast");

  function showToast(msg){
    if(!toast) return;
    toast.textContent = msg;
    toast.hidden = false;
    clearTimeout(showToast._t);
    showToast._t = setTimeout(()=> toast.hidden = true, 2200);
  }

  function getAutoMode(){
    return window.matchMedia("(max-width: 820px)").matches ? "cards" : "table";
  }

  function updateSubtotalOnly(stepKey){
    const el = document.querySelector(".fhcSubtotal span:last-child");
    if(!el) return;

    let total = 0;
    if(stepKey === "pemasukan") total = sumListMonthly(state.pemasukan);
    else if(stepKey === "wajib") total = sumListMonthly(state.wajib);
    else if(stepKey === "opsional") total = sumListMonthly(state.opsional);
    else if(stepKey === "komitmen") total = sumListMonthly(state.komitmen);
    else if(stepKey === "asetutang"){
      const a = state.asetutang.assets.reduce((x,y)=> x+(y.amount||0), 0);
      const d = state.asetutang.debts.reduce((x,y)=> x+(y.amount||0), 0);
      total = a - d;
    } else return;

    el.textContent = fmtIDR(total);
  }

  function setAmount(token, amount){
    if(!token) return;
    const [key, idxStr] = token.split(":");
    const idx = parseInt(idxStr,10);

    if(key === "assets" || key === "debts"){
      const bucket = (key==="assets") ? state.asetutang.assets : state.asetutang.debts;
      if(bucket[idx]) bucket[idx].amount = amount;
      saveState(state);
      return;
    }
    if(state[key] && state[key][idx]){
      state[key][idx].amount = amount;
      saveState(state);
    }
  }

  function addCustomItem(key){
    if(!state[key] || !Array.isArray(state[key])) return;
    state[key].push({ label:"Item baru", amount:0, period:"monthly", fixed:false });
    saveState(state);
    showToast(getAutoMode()==="table"
      ? "Item ditambahkan. Kamu bisa ubah nama item di kolom Item."
      : "Item ditambahkan."
    );
    renderStep();
  }

  function removeItem(key, idx){
    if(key === "assets" || key === "debts") return;
    const list = state[key];
    if(!Array.isArray(list)) return;
    if(list[idx]?.fixed) return;
    list.splice(idx,1);
    saveState(state);
    renderStep();
  }

  function validateStep(stepIndex){
    const step = STEPS[stepIndex];
    if(step.key === "pemasukan"){
      const incomeM = sumListMonthly(state.pemasukan);
      if(incomeM <= 0){
        showToast("Isi pemasukan dulu ya (minimal satu angka).");
        return false;
      }
    }
    return true;
  }
  function validateAll(){
    const incomeM = sumListMonthly(state.pemasukan);
    if(incomeM <= 0){
      showToast("Pemasukan masih kosong. Isi dulu minimal satu angka ya.");
      return false;
    }
    return true;
  }

  function stat(label, value){
    return `
      <div class="fhcStat">
        <b>${escapeHtml(label)}</b>
        <div class="v">${escapeHtml(value)}</div>
      </div>
    `;
  }

  function pickTagMonthly(tag){
    const row = state.komitmen.find(x=>x.tag===tag);
    if(!row) return 0;
    return monthlyEq(row.amount||0, row.period||"monthly");
  }

  function openReview(){
    wizard.hidden = true;
    review.hidden = false;

    const incomeM = sumListMonthly(state.pemasukan);
    const needsM  = sumListMonthly(state.wajib);
    const lifeM   = sumListMonthly(state.opsional);

    const debtPay = pickTagMonthly("debtpay");
    const saving  = pickTagMonthly("saving");
    const invest  = pickTagMonthly("invest");

    const assetsTotal = state.asetutang.assets.reduce((a,b)=>a+(b.amount||0),0);
    const debtsTotal  = state.asetutang.debts.reduce((a,b)=>a+(b.amount||0),0);

    reviewGrid.innerHTML = `
      ${stat("Pemasukan per bulan", fmtIDR(incomeM))}
      ${stat("Biaya hidup per bulan", fmtIDR(needsM + lifeM))}
      ${stat("Cicilan per bulan", fmtIDR(debtPay))}
      ${stat("Tabungan + investasi per bulan", fmtIDR(saving + invest))}
      ${stat("Aset (saat ini)", fmtIDR(assetsTotal))}
      ${stat("Utang (saat ini)", fmtIDR(debtsTotal))}
    `;
  }

  function renderProfil(){
    const p = state.profil;
    return `
      <h2 class="fhcH2">Profil singkat</h2>
      <p class="fhcP">Tujuannya supaya rekomendasi bisa lebih nyambung dengan situasimu.</p>

      <div class="fhcGrid2">
        <div class="fhcField">
          <label>Nama / inisial</label>
          <input id="pf_nama" value="${escapeHtml(p.nama)}" placeholder="Contoh: Dendra / DF" />
        </div>

        <div class="fhcField">
          <label>Status</label>
          <select id="pf_status">
            <option value="single" ${p.status==="single"?"selected":""}>Single</option>
            <option value="menikah" ${p.status==="menikah"?"selected":""}>Menikah</option>
            <option value="menikah_anak" ${p.status==="menikah_anak"?"selected":""}>Menikah + anak</option>
          </select>
        </div>

        <div class="fhcField">
          <label>Tanggungan (jumlah orang)</label>
          <input id="pf_tanggungan" inputmode="numeric" value="${escapeHtml(p.tanggungan)}" placeholder="Contoh: 0 / 1 / 2" />
        </div>

        <div class="fhcField">
          <label>Target dana darurat</label>
          <select id="pf_target">
            <option value="1" ${p.targetDanaDarurat==="1"?"selected":""}>1 bulan</option>
            <option value="3" ${p.targetDanaDarurat==="3"?"selected":""}>3 bulan</option>
            <option value="6" ${p.targetDanaDarurat==="6"?"selected":""}>6 bulan</option>
            <option value="9" ${p.targetDanaDarurat==="9"?"selected":""}>9 bulan</option>
            <option value="12" ${p.targetDanaDarurat==="12"?"selected":""}>12 bulan</option>
          </select>
        </div>
      </div>

      <div class="fhcGrid2" style="margin-top:12px;">
        <div class="fhcField">
          <label>Isu utama yang kamu rasakan (opsional)</label>
          <textarea id="pf_catatan" placeholder="Contoh: sering defisit; cicilan terasa berat; sulit konsisten nabung.">${escapeHtml(p.catatan)}</textarea>
        </div>
        <div class="fhcField">
          <label>Rencana 12 bulan ke depan (opsional)</label>
          <textarea id="pf_rencana" placeholder="Contoh: pindah rumah; sekolah anak; ganti kerja; menikah.">${escapeHtml(p.rencana12bulan)}</textarea>
        </div>
      </div>
    `;
  }

  function renderCards(key, list){
    const items = list.map((it, idx)=> cardHTML(key, it, idx)).join("");
    const subtotal = fmtIDR(sumListMonthly(list));
    return `
      <div class="fhcItems">${items}</div>
      <div class="fhcSubtotal">
        <span>Total perkiraan per bulan</span>
        <span>${subtotal}</span>
      </div>
    `;
  }
  function cardHTML(key, it, idx){
    const removable = !it.fixed;
    const perMonthly = (it.period||"monthly")==="monthly";
    return `
      <div class="fhcItem" data-row="${key}:${idx}">
        <div class="fhcItemMain">
          <div class="fhcItemTitle">${escapeHtml(it.label || "Item baru")}</div>

          <div class="fhcRow">
            <div class="fhcInline">
              <small>Jumlah</small>
              <div class="fhcMoney">
                <span class="rp">Rp</span>
                <input class="money" inputmode="numeric" data-amt="${key}:${idx}" placeholder="0" value="${it.amount?fmtDigits(it.amount):""}" />
              </div>
            </div>

            <div class="fhcInline">
              <small>Periode</small>
              <div class="fhcPeriod">
                <button type="button" data-per="${key}:${idx}:monthly" aria-pressed="${perMonthly?"true":"false"}">Bulanan</button>
                <button type="button" data-per="${key}:${idx}:yearly" aria-pressed="${!perMonthly?"true":"false"}">Tahunan</button>
              </div>
            </div>
          </div>
        </div>

        <div class="fhcItemActions">
          ${removable ? `<button class="fhcIconBtn" type="button" title="Hapus" data-rm="${key}:${idx}">✕</button>` : ``}
        </div>
      </div>
    `;
  }

  function renderTable(key, list){
    const rows = list.map((it, idx)=>{
      const removable = !it.fixed;
      return `
        <tr>
          <td>
            ${it.fixed ? `<b>${escapeHtml(it.label)}</b>` :
            `<input data-label="${key}:${idx}" value="${escapeHtml(it.label||"")}" placeholder="Nama item (contoh: servis kendaraan)" />`}
          </td>
          <td class="per">
            <select data-perSel="${key}:${idx}">
              <option value="monthly" ${(it.period||"monthly")==="monthly"?"selected":""}>Bulanan</option>
              <option value="yearly" ${(it.period||"monthly")==="yearly"?"selected":""}>Tahunan</option>
            </select>
          </td>
          <td class="num">
            <input class="money" inputmode="numeric" data-amt="${key}:${idx}" placeholder="0" value="${it.amount?fmtDigits(it.amount):""}" />
          </td>
          <td style="width:80px; text-align:center;">
            ${removable ? `<button class="fhcIconBtn" type="button" data-rm="${key}:${idx}" title="Hapus">✕</button>` : `—`}
          </td>
        </tr>
      `;
    }).join("");

    const subtotal = fmtIDR(sumListMonthly(list));

    return `
      <div class="fhcTableWrap">
        <table class="fhcTable">
          <thead>
            <tr>
              <th>Item</th>
              <th class="per">Periode</th>
              <th class="num">Jumlah</th>
              <th style="width:80px;">Hapus</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
      <div class="fhcSubtotal">
        <span>Total perkiraan per bulan</span>
        <span>${subtotal}</span>
      </div>
    `;
  }

  function renderListStep(key, title, desc){
    const list = state[key];
    const head = `
      <div class="fhcSectionHead">
        <div>
          <h2 class="fhcH2">${title}</h2>
          <div class="fhcMiniHelp">${desc}</div>
        </div>
        <div class="fhcAddRow">
          <button class="btn ghost" type="button" data-add="${key}">+ Tambah item</button>
        </div>
      </div>
    `;
    const mode = getAutoMode();
    return head + (mode==="table" ? renderTable(key, list) : renderCards(key, list));
  }

  function renderSimpleCards(key, list){
    const items = list.map((it, idx)=>`
      <div class="fhcItem" data-row="${key}:${idx}">
        <div class="fhcItemMain">
          <div class="fhcItemTitle">${escapeHtml(it.label)}</div>
          <div class="fhcRow">
            <div class="fhcInline">
              <small>Jumlah</small>
              <div class="fhcMoney">
                <span class="rp">Rp</span>
                <input class="money" inputmode="numeric" data-amt="${key}:${idx}" placeholder="0" value="${it.amount?fmtDigits(it.amount):""}" />
              </div>
            </div>
            <div class="fhcInline">
              <small>Periode</small>
              <div style="padding:10px 12px;border-radius:12px;background:rgba(17,17,17,.06);border:1px solid rgba(17,17,17,.10);font-weight:1000;">
                Saat ini
              </div>
            </div>
          </div>
        </div>
      </div>
    `).join("");
    return `<div class="fhcItems">${items}</div>`;
  }
  function renderSimpleTable(key, list){
    const rows = list.map((it, idx)=>`
      <tr>
        <td><b>${escapeHtml(it.label)}</b></td>
        <td class="num">
          <input class="money" inputmode="numeric" data-amt="${key}:${idx}" placeholder="0" value="${it.amount?fmtDigits(it.amount):""}" />
        </td>
      </tr>
    `).join("");
    return `
      <div class="fhcTableWrap">
        <table class="fhcTable" style="min-width:0;">
          <thead><tr><th>Item</th><th class="num">Jumlah (saat ini)</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `;
  }

  function renderAssetsDebts(){
    const a = state.asetutang.assets;
    const d = state.asetutang.debts;
    const mode = getAutoMode();

    const head = `
      <div class="fhcSectionHead">
        <div>
          <h2 class="fhcH2">Aset & utang (saat ini)</h2>
          <div class="fhcMiniHelp">Isi yang utama dulu. Ini dipakai untuk menghitung “kekayaan bersih”.</div>
        </div>
      </div>
    `;
    const block = (title, key, list)=> `
      <div style="margin-top:12px;">
        <div style="font-weight:1000; margin-bottom:6px;">${title}</div>
        ${mode==="table" ? renderSimpleTable(key, list) : renderSimpleCards(key, list)}
      </div>
    `;
    const totalAssets = a.reduce((x,y)=> x+(y.amount||0), 0);
    const totalDebts = d.reduce((x,y)=> x+(y.amount||0), 0);

    return head + block("Aset", "assets", a) + block("Utang", "debts", d) + `
      <div class="fhcSubtotal">
        <span>Perkiraan kekayaan bersih</span>
        <span>${fmtIDR(totalAssets - totalDebts)}</span>
      </div>
    `;
  }

  function bindStepHandlers(stepKey){
    if(stepKey === "profil"){
      const p = state.profil;
      const byId = (id)=> document.getElementById(id);

      const nama = byId("pf_nama");
      const status = byId("pf_status");
      const tanggungan = byId("pf_tanggungan");
      const target = byId("pf_target");
      const catatan = byId("pf_catatan");
      const rencana = byId("pf_rencana");

      nama && nama.addEventListener("input", ()=>{ p.nama = nama.value; saveState(state); });
      status && status.addEventListener("change", ()=>{ p.status = status.value; saveState(state); });
      tanggungan && tanggungan.addEventListener("input", ()=> {
        tanggungan.value = String(tanggungan.value||"").replace(/[^\d]/g,"");
        p.tanggungan = tanggungan.value;
        saveState(state);
      });
      target && target.addEventListener("change", ()=>{ p.targetDanaDarurat = target.value; saveState(state); });
      catatan && catatan.addEventListener("input", ()=>{ p.catatan = catatan.value; saveState(state); });
      rencana && rencana.addEventListener("input", ()=>{ p.rencana12bulan = rencana.value; saveState(state); });
      return;
    }

    document.querySelectorAll("[data-add]").forEach(btn=>{
      btn.addEventListener("click", ()=> addCustomItem(btn.getAttribute("data-add")));
    });

    document.querySelectorAll("input.money").forEach(inp=>{
      inp.addEventListener("input", ()=>{
        const digits = String(inp.value || "").replace(/[^\d]/g, "");
        inp.value = digits;
        const raw = digits ? parseInt(digits, 10) : 0;
        setAmount(inp.dataset.amt, raw);
        updateSubtotalOnly(stepKey);
      });

      inp.addEventListener("blur", ()=>{
        const raw = toNumber(inp.value);
        inp.value = raw ? fmtDigits(raw) : "";
        setAmount(inp.dataset.amt, raw);
        updateSubtotalOnly(stepKey);
      });
    });

    document.querySelectorAll("[data-per]").forEach(btn=>{
      btn.addEventListener("click", ()=>{
        const [keyIdx, idxStr, per] = btn.getAttribute("data-per").split(":");
        const idx = parseInt(idxStr,10);
        state[keyIdx][idx].period = per;
        saveState(state);
        renderStep();
      });
    });

    document.querySelectorAll("[data-perSel]").forEach(sel=>{
      sel.addEventListener("change", ()=>{
        const [key, idxStr] = sel.getAttribute("data-perSel").split(":");
        const idx = parseInt(idxStr,10);
        if(!state[key]) return;
        state[key][idx].period = sel.value;
        saveState(state);
        renderStep();
      });
    });

    document.querySelectorAll("[data-label]").forEach(inp=>{
      inp.addEventListener("input", ()=>{
        const [key, idxStr] = inp.getAttribute("data-label").split(":");
        const idx = parseInt(idxStr,10);
        if(!state[key]) return;
        state[key][idx].label = inp.value || "";
        saveState(state);
      });
    });

    document.querySelectorAll("[data-rm]").forEach(btn=>{
      btn.addEventListener("click", ()=>{
        const [key, idxStr] = btn.getAttribute("data-rm").split(":");
        removeItem(key, parseInt(idxStr,10));
      });
    });
  }

  function renderStep(){
    review.hidden = true;
    wizard.hidden = false;

    const i = clamp(state.meta.stepIndex, 0, STEPS.length-1);
    const step = STEPS[i];

    stepText.textContent = `Langkah ${i+1} dari ${STEPS.length}`;
    stepMini.textContent = step.title;
    barFill.style.width = `${((i+1)/STEPS.length)*100}%`;
    hintText.textContent = step.help;

    btnBack.style.visibility = (i===0) ? "hidden" : "visible";
    btnNext.textContent = (i===STEPS.length-1) ? "Review" : "Lanjut";

    stepMount.classList.remove("fhcAnimIn");
    void stepMount.offsetWidth;
    stepMount.classList.add("fhcAnimIn");

    if(step.key === "profil") stepMount.innerHTML = renderProfil();
    if(step.key === "pemasukan") stepMount.innerHTML = renderListStep("pemasukan","Pemasukan","Masukkan pemasukan. Item tahunan akan dihitung ÷ 12.");
    if(step.key === "wajib") stepMount.innerHTML = renderListStep("wajib","Kebutuhan Pokok","Ini pengeluaran yang relatif wajib/utama.");
    if(step.key === "opsional") stepMount.innerHTML = renderListStep("opsional","Gaya Hidup (opsional)","Tidak apa-apa kalau belum detail. Isi perkiraan.");
    if(step.key === "komitmen") stepMount.innerHTML = renderListStep("komitmen","Cicilan & Alokasi","Cicilan, proteksi, tabungan, investasi, dan komitmen lain.");
    if(step.key === "asetutang") stepMount.innerHTML = renderAssetsDebts();

    bindStepHandlers(step.key);
  }

  // NAV handlers
  btnBack.addEventListener("click", ()=>{
    if(state.meta.stepIndex <= 0) return;
    state.meta.stepIndex--;
    saveState(state);
    renderStep();
  });

  btnNext.addEventListener("click", ()=>{
    if(!validateStep(state.meta.stepIndex)) return;
    if(state.meta.stepIndex >= STEPS.length-1){
      openReview();
      return;
    }
    state.meta.stepIndex++;
    saveState(state);
    renderStep();
  });

  if (btnReset) {
  btnReset.addEventListener("click", () => {
    const ok = confirm(
      "Reset semua data?\n\nSemua input akan dihapus dan kamu akan mulai dari awal."
    );
    if (!ok) return;

    // hapus data FHC saja (aman)
    localStorage.removeItem(STORE_KEY);

    // reload ke step awal
    location.reload();
  });
}


  btnEdit.addEventListener("click", ()=>{
    review.hidden = true;
    wizard.hidden = false;
    renderStep();
  });

  btnSubmit.addEventListener("click", ()=>{
    if(!validateAll()) return;

    state.meta.submittedAt = new Date().toISOString();
    saveState(state);

    btnSubmit.disabled = true;
    btnSubmit.textContent = "Menghitung…";
    setTimeout(()=> {
      // ✅ Next.js route hasil
      location.href = "/financial-health-check/hasil";
    }, 450);
  });

  // orientation refresh mode
  window.addEventListener("orientationchange", () => {
    const next = getAutoMode();
    if(state.meta._autoMode !== next){
      state.meta._autoMode = next;
      renderStep();
    }
  });
  state.meta._autoMode = getAutoMode();

  renderStep();
}
