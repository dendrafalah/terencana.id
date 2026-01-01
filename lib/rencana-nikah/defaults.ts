import type { Scale5 } from "./types";

export function guestCountByScale(q1: Scale5) {
  return [0, 40, 100, 250, 500, 900][q1];
}

export function cateringPriceByScale(q1: Scale5) {
  return [0, 60000, 90000, 125000, 175000, 250000][q1];
}

export function venueCostByChoice(q2: Scale5) {
  // Q2: rumah, gedung sederhana, gedung menengah, ballroom, premium
  return [0, 3000000, 15000000, 30000000, 65000000, 120000000][q2];
}

export function adatCostByChoice(q3: Scale5) {
  return [0, 6000000, 10000000, 16000000, 25000000, 40000000][q3];
}

export function docsCostByChoice(q4: Scale5) {
  // prewedding basic included for all choices
  return [0, 7000000, 11000000, 16000000, 22000000, 32000000][q4];
}

export function experienceCostByChoice(q5: Scale5) {
  return [0, 4000000, 6500000, 10000000, 16000000, 25000000][q5];
}

/**
 * Default porsi biaya nikah yang ditanggung keluarga (0..100)
 * Catatan: user tetap bisa override lewat slider di UI.
 */
export function defaultSupportPctByChoice(q7: Scale5) {
  // Mandiri, dibantu sedikit, dibantu sebagian, mayoritas, hampir semua
  return [0, 0, 15, 40, 70, 90][q7];
}

export function defaultBufferRate() {
  return 0.08;
}
