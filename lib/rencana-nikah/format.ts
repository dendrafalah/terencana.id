export const fmtIDR = (n: any) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(n || 0));

export function toNumber(x: any) {
  const n = Number(String(x ?? "").replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

export function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function diffMonth(from: Date, toYYYYMM: string) {
  // toYYYYMM: "YYYY-MM"
  const [Y, M] = (toYYYYMM || "").split("-").map((v) => Number(v));
  if (!Y || !M) return 0;
  const to = new Date(Y, M - 1, 1);
  return (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());
}

export function monthInputDefault(offsetMonths = 10) {
  const d = new Date();
  d.setMonth(d.getMonth() + offsetMonths);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}
