export function StatCard({ label, value, format, details = [] }) {
  const display = format ? format(value) : value;
  return (
    <div className="card-surface p-5">
      <p className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
      <p className="tnum mt-2 font-heading text-2xl font-extrabold tracking-tight text-foreground">
        {display}
      </p>
      {details.length > 0 && (
        <dl className="mt-4 space-y-1.5 border-t border-border/60 pt-3">
          {details.map((d, i) => (
            <div key={i} className="flex items-center justify-between text-xs">
              <dt className="text-muted-foreground">{d.label}</dt>
              <dd className="tnum font-medium text-foreground">{d.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}