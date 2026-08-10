import { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useSubsData } from '../../hooks/useSubsData';

const COLORS: Record<string, string> = {
  'AC': 'var(--color-ac)',
  'WA': 'var(--color-wa)',
  'TLE': 'var(--color-tle)',
  'CE': 'var(--color-ce)',
  'RE': 'var(--color-re)',
  'MLE': 'var(--color-mle)',
  'OLE': 'var(--color-ole)',
  'RF': 'var(--color-rf)',
};

const DEFAULT_COLOR = '#8E44AD';

export default function VerdictDistributionChart() {
  const { rawData, loading, error } = useSubsData();

  const chartData = useMemo(() => {
    if (!rawData) return [];
    const counts: Record<string, number> = {};
    rawData.forEach(sub => {
      const verdict = sub['結果'] || 'Unknown';
      counts[verdict] = (counts[verdict] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [rawData]);

  if (loading) {
    return (
      <div className="glass-card col-span-4 skeleton-card">
        <h2 className="skeleton-title">解題統計</h2>
        <div className="skeleton-content-center" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="loader">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card col-span-4 skeleton-card">
        <h2 className="skeleton-title">解題統計</h2>
        <div style={{ color: 'var(--color-wa)', textAlign: 'center', marginTop: '2rem' }}>Error loading data</div>
      </div>
    );
  }

  return (
    <div className="glass-card col-span-4 skeleton-card" style={{ minHeight: '300px' }}>
      <h2 className="skeleton-title">解題統計</h2>
      <div className="skeleton-content-center" style={{ width: '100%', minHeight: '250px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius="60%"
              outerRadius="80%"
              paddingAngle={2}
              dataKey="value"
              stroke="none"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[entry.name] || DEFAULT_COLOR} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px', color: '#F8FAFC' }}
              itemStyle={{ color: '#F8FAFC' }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              wrapperStyle={{ color: '#94A3B8', fontSize: '0.9rem' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
