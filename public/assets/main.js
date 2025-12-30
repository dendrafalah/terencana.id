// === CONFIG: ganti nomor WA di sini (format 62xxxxxxxxxxx)
window.__T = {
  waNumber: "6281944123422",
  waText: "Halo terencana.id, saya ingin mulai Financial Health Check."
};

function buildWA(text){
  const n = (window.__T && window.__T.waNumber) ? window.__T.waNumber : "";
  const msg = text || ((window.__T && window.__T.waText) ? window.__T.waText : "Halo terencana.id");
  return "https://wa.me/" + n + "?text=" + encodeURIComponent(msg);
}

function bindWA(){
  document.querySelectorAll("[data-wa]").forEach((el) => {
    const msg = el.getAttribute("data-wa") || "Halo terencana.id";
    el.setAttribute("href", buildWA(msg));
  });
}

function bindYear(){
  const y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
}

// Mobile menu (kalau elemen ada)
function bindMobileMenu(){
  const menuBtn = document.getElementById("menuBtn");
  const menuClose = document.getElementById("menuClose");
  const mnavOverlay = document.getElementById("mnavOverlay");

  function openMenu(){
    document.body.classList.add("menuOpen");
    if (menuBtn) menuBtn.setAttribute("aria-expanded", "true");
  }
  function closeMenu(){
    document.body.classList.remove("menuOpen");
    if (menuBtn) menuBtn.setAttribute("aria-expanded", "false");
  }

  if (menuBtn) {
    menuBtn.addEventListener("click", () => {
      const isOpen = document.body.classList.contains("menuOpen");
      isOpen ? closeMenu() : openMenu();
    });
  }
  if (menuClose) menuClose.addEventListener("click", closeMenu);
  if (mnavOverlay) mnavOverlay.addEventListener("click", closeMenu);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });

  document.querySelectorAll("[data-close-menu]").forEach((el) => {
    el.addEventListener("click", closeMenu);
  });
}

// FAQ toggle (kalau ada)
function bindFAQ(){
  document.querySelectorAll(".faqQ").forEach(btn => {
    btn.addEventListener("click", () => {
      const item = btn.closest(".faqItem");
      item.classList.toggle("open");
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  bindYear();
  bindWA();
  bindMobileMenu();
  bindFAQ();
});
