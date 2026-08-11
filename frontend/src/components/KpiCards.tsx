import '../css/KpiCards.css';
import { useSubsData } from '../hooks/useSubsData';

export default function KpiCards() {
  const { data, loading, error } = useSubsData();

  const formatValue = (val: number | undefined) => {
    if (loading) return "...";
    if (error) return "Error";
    if (val === undefined) return "0";
    return val.toLocaleString();
  };

  return (
    <div className="kpi-cards-container">
      <KpiCard label="AC" value={formatValue(data?.ac)} color="var(--color-ac)" />
      <KpiCard label="WA" value={formatValue(data?.wa)} color="var(--color-wa)" />
      <KpiCard label="TLE" value={formatValue(data?.tle)} color="var(--color-tle)" />
    </div>
  );
}

function KpiCard({ label, value, color }: { label: string, value: string, color: string }) {
  return (
    <div className="glass-card kpi-card" style={{ borderTop: `4px solid ${color}`, minWidth: '200px' }}>
      <div
        className="kpi-card-glow"
        style={{ background: `linear-gradient(180deg, ${color}33 0%, transparent 100%)` }}
      ></div>
      <div className="display-number kpi-card-value" style={{ color: color }}>
        {value}
      </div>
      <div className="kpi-card-label">
        {label}
      </div>
    </div>
  );
}
