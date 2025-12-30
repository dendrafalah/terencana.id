"use client";

import { useEffect } from "react";
import { initHasil } from "./hasil.client.js";

export default function ResultBoot() {
  useEffect(() => {
    initHasil();
  }, []);

  return null;
}
