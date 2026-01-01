"use client";

import { useMemo, useState } from "react";
import { fmtIDR, toNumber } from "@/lib/rencana-nikah/format";

export default function MoneyInput({
  label,
  value,
  onChange,
  placeholder,
  hint,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  placeholder?: string;
  hint?: string;
}) {
  const [raw, setRaw] = useState<string>("");

  const display = useMemo(() => {
    if (raw !== "") return raw;
    return value ? fmtIDR(value) : "";
  }, [raw, value]);

  return (
    <label className="field">
      <div className="fieldLabel">{label}</div>
      <input
        className="input"
        inputMode="numeric"
        placeholder={placeholder || "Rp0"}
        value={display}
        onChange={(e) => {
          const txt = e.target.value;
          setRaw(txt);
          onChange(toNumber(txt));
        }}
        onBlur={() => setRaw("")}
      />
      {hint && <div className="hint">{hint}</div>}
    </label>
  );
}
