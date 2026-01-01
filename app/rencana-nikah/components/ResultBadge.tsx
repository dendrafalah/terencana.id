export default function ResultBadge({ status }: { status: "AMAN" | "KETAT" | "BERISIKO" }) {
  const map = {
    AMAN: { icon: "🟢", text: "Aman" },
    KETAT: { icon: "🟡", text: "Ketat" },
    BERISIKO: { icon: "🔴", text: "Berisiko" },
  } as const;

  return (
    <span className={`badge badge-${status}`}>
      {map[status].icon} {map[status].text}
    </span>
  );
}
