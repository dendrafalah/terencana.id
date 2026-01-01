export default function ProgressBar({
  step,
  total,
}: {
  step: number;
  total: number;
}) {
  const pct = Math.round(((step + 1) / total) * 100);
  return (
    <div className="progressWrap" aria-label="progress">
      <div className="progressTop">
        <span className="muted">Step {step + 1} / {total}</span>
        <span className="muted">{pct}%</span>
      </div>
      <div className="progressBar">
        <div className="progressFill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
