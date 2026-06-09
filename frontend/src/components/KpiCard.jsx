export function formatMil(value) {
  if (value == null || Number.isNaN(value)) return '—';
  return Math.round(value).toLocaleString('es-ES');
}

export default function KpiCard({ title, value, icon, accent }) {
  return (
    <div className="kpi-card" style={{ '--accent': accent }}>
      <span className="kpi-icon" style={{ background: accent }}>{icon}</span>
      <div className="kpi-text">
        <div className="kpi-title">{title}</div>
        <div className="kpi-value">{formatMil(value)}<span className="kpi-unit"> h</span></div>
      </div>
    </div>
  );
}
