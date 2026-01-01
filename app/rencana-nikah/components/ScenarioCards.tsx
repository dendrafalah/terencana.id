import { fmtIDR } from "@/lib/rencana-nikah/format";
import type { Scenario } from "@/lib/rencana-nikah/types";

export default function ScenarioCards({
  scenarios,
  picked,
  onPick,

  reducePct,
  onReducePct,
  comboMonth,
  onComboMonth,
}: {
  scenarios: Scenario[];
  picked: Scenario["key"] | null;
  onPick: (k: Scenario["key"]) => void;

  reducePct: number; // 0..60
  onReducePct: (n: number) => void;

  comboMonth: string; // YYYY-MM
  onComboMonth: (ym: string) => void;
}) {
  return (
    <div className="stack">
      {scenarios.map((s) => {
        const active = picked === s.key;

        return (
          <button
            key={s.key}
            type="button"
            className={`card cardBtn ${active ? "cardActive" : ""}`}
            onClick={() => onPick(s.key)}
          >
            <div className="rowBetween">
              <div>
                <div className="h3">{s.title}</div>
                <div className="muted">{s.subtitle}</div>
              </div>

              <div className={`radio ${active ? "radioOn" : ""}`} aria-hidden="true" />
            </div>

            <div className="grid2">
              <div>
                <div className="muted">Estimasi biaya (dana pribadi)</div>
                <div className="strong">{fmtIDR(s.personal_wedding_cost)}</div>
              </div>
              <div>
                <div className="muted">Target nabung / bulan</div>
                <div className="strong">{fmtIDR(s.saving_per_month)}</div>
              </div>
            </div>

            {/* Controls */}
            {active && (s.key === "B" || s.key === "C") && (
              <div className="cardInnerControls">
                <div className="field" style={{ marginTop: 10 }}>
                  <div className="fieldLabel">Turunkan gaya nikah</div>
                  <div className="rowBetween gap">
                    <input
                      className="range"
                      type="range"
                      min={0}
                      max={60}
                      value={reducePct}
                      onChange={(e) => onReducePct(Number(e.target.value))}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="pill">{reducePct}%</div>
                  </div>
                  <div className="hint">
                    Semakin besar persen, estimasi biaya turun (kamu tetap bisa sesuaikan detail komponennya).
                  </div>
                </div>

                {s.key === "C" && (
                  <div className="field" style={{ marginTop: 10 }}>
                    <div className="fieldLabel">Mundurkan tanggal nikah</div>
                    <input
                      className="input"
                      type="month"
                      value={comboMonth}
                      onChange={(e) => onComboMonth(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="hint">
                      Ini akan membuat target nabung/bulan lebih ringan karena waktunya lebih panjang.
                    </div>
                  </div>
                )}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
