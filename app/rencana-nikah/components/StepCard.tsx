export default function StepCard({
  title,
  subtitle,
  children,
}: {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="card">
      {title && <h2 className="h2">{title}</h2>}
      {subtitle && <p className="muted">{subtitle}</p>}
      <div className="stack">{children}</div>
    </section>
  );
}
