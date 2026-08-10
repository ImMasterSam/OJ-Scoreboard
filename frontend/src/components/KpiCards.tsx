import '../css/KpiCards.css';

export default function KpiCards() {
  return (
    <div className="kpi-cards-container">
      <KpiCard label="AC" value="1,279" color="var(--color-ac)" />
      <KpiCard label="WA" value="567" color="var(--color-wa)" />
      <KpiCard label="TLE" value="76" color="var(--color-tle)" />
    </div>
  );
}

function KpiCard({ label, value, color }: { label: string, value: string, color: string }) {
  return (
    <div className="glass-card kpi-card" style={{ borderTop: `4px solid ${color}` }}>
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
