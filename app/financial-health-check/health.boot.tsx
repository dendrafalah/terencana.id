"use client";

import { useEffect } from "react";
import { initHealthWizard } from "./health.client";

export default function HealthBoot() {
  useEffect(() => {
    initHealthWizard();
  }, []);

  return null;
}
