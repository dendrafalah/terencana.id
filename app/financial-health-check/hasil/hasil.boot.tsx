"use client";

import { useEffect } from "react";
import { initHasil } from "./hasil.logic";

export default function ResultBoot() {
  useEffect(() => {
    initHasil();
  }, []);

  return null;
}
