export default function StickyFooter({
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
  disabled,
}: {
  primaryLabel: string;
  onPrimary: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="stickyFooter">
      {secondaryLabel && onSecondary && (
        <button type="button" className="btn btnGhost" onClick={onSecondary}>
          {secondaryLabel}
        </button>
      )}
      <button type="button" className="btn btnPrimary" onClick={onPrimary} disabled={disabled}>
        {primaryLabel}
      </button>
    </div>
  );
}
