export default function Option5<T extends number | string>({
  label,
  current,
  onChange,
  options,
}: {
  label: string;
  value: T; // (unused, boleh tetap ada biar nggak ganggu pemanggil)
  current: T | null;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div className="optionBlock">
      <div className="optionLabel">{label}</div>

      <div className="optionGrid">
        {options.map((opt) => {
          const active = current === opt.value;

          return (
            <button
              type="button"
              key={String(opt.value)}
              className={`chip ${active ? "chipActive" : ""}`}
              onClick={() => onChange(opt.value)}
              aria-pressed={active}
            >
              <span className="chipInner">
                <span className={`chipCheck ${active ? "chipCheckOn" : ""}`} aria-hidden="true">
                  ✓
                </span>
                <span className="chipText">{opt.label}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="hint">Tap salah satu opsi. Kamu bisa ganti kapan saja.</div>
    </div>
  );
}
