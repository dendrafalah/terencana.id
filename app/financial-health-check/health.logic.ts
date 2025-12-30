import { initHealthWizard as init } from "./health.client.js";

export function initHealthWizard() {
  if (typeof window === "undefined") return;
  init();
}
