import { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useSubsData } from '../../hooks/useSubsData';

const COLORS: Record<string, string> = {
  'Zerojudge': '#4F86F7',
  'UVa': '#D23A5B',
  'Kattis': '#F5B041',
  'CodeForces': '#1E8449',
  'TOJ': '#2E4053',
  'AtCoder': '#989898ff',
};

const DEFAULT_COLOR = '#8E44AD';

export default function WebsiteDistributionChart() {
  const { rawData, loading, error } = useSubsData();

  const chartData = useMemo(() => {
    if (!rawData) return [];
    const counts: Record<string, number> = {};
    rawData.forEach(sub => {
      const site = sub['網站'] || 'Unknown';
      counts[site] = (counts[site] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [rawData]);

  if (loading) {
    return (
      <div className="glass-card col-span-4 skeleton-card">
        <h2 className="skeleton-title">解題網站</h2>
        <div className="skeleton-content-center" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="loader">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card col-span-4 skeleton-card">
        <h2 className="skeleton-title">解題網站</h2>
        <div style={{ color: 'var(--color-wa)', textAlign: 'center', marginTop: '2rem' }}>Error loading data</div>
      </div>
    );
  }

  return (
    <div className="glass-card col-span-4 skeleton-card" style={{ minHeight: '300px' }}>
      <h2 className="skeleton-title" style={{ margin: '1rem 1rem 0' }}>解題網站</h2>
      <div className="skeleton-content-center" style={{ width: '100%', minHeight: '250px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius="50%"
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
