import { fmtIDR } from "@/lib/rencana-nikah/format";

export default function SummaryBar({ total }: { total: number }) {
  return (
    <div className="summaryBar">
      <div>
        <div className="muted">Estimasi biaya nikah</div>
        <div className="summaryTotal">{fmtIDR(total)}</div>
      </div>
    </div>
  );
}
