import type { FinalResult, WizardDraft } from "./types";

const KEY_DRAFT = "terencana_rencana_nikah_v1_draft";
const KEY_FINAL = "terencana_rencana_nikah_v1_final";

/* ======================
   DRAFT (wizard progress)
   ====================== */

export function saveDraft(draft: WizardDraft) {
  try {
    localStorage.setItem(KEY_DRAFT, JSON.stringify(draft));
  } catch {}
}

export function loadDraft(): WizardDraft | null {
  try {
    const raw = localStorage.getItem(KEY_DRAFT);
    return raw ? (JSON.parse(raw) as WizardDraft) : null;
  } catch {
    return null;
  }
}

export function clearDraft() {
  try {
    localStorage.removeItem(KEY_DRAFT);
  } catch {}
}

/* ======================
   FINAL RESULT
   ====================== */

export function saveFinal(res: FinalResult) {
  try {
    localStorage.setItem(KEY_FINAL, JSON.stringify(res));
  } catch {}
}

export function loadFinal(): FinalResult | null {
  try {
    const raw = localStorage.getItem(KEY_FINAL);
    return raw ? (JSON.parse(raw) as FinalResult) : null;
  } catch {
    return null;
  }
}

export function clearFinal() {
  try {
    localStorage.removeItem(KEY_FINAL);
  } catch {}
}

/* ======================
   HARD RESET (IMPORTANT)
   ====================== */

export function clearAll() {
  clearDraft();
  clearFinal();
}
