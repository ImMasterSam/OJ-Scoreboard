import { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
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

const renderCustomizedLabel = ({ cx, cy, midAngle, outerRadius, percent, name, fill }: any) => {
  if (percent < 0.02) return null;
  const RADIAN = Math.PI / 180;
  const sin = Math.sin(-midAngle * RADIAN);
  const cos = Math.cos(-midAngle * RADIAN);

  const sx = cx + (outerRadius) * cos;
  const sy = cy + (outerRadius) * sin;
  const mx = cx + (outerRadius * 1.15) * cos;
  const my = cy + (outerRadius * 1.15) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 15;

  return (
    <g>
      <path d={`M${sx},${sy} L${mx},${my} L${ex},${my}`} stroke={fill} fill="none" strokeWidth={3} />
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 5}
        y={my}
        fill={fill}
        textAnchor={cos >= 0 ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize={20}
        fontWeight="bold"
      >
        {`${name} (${(percent * 100).toFixed(0)}%)`}
      </text>
    </g>
  );
};

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
      <div className="skeleton-content-center" style={{ width: '100%', height: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius="50%"
              outerRadius="75%"
              paddingAngle={2}
              dataKey="value"
              stroke="none"
              label={renderCustomizedLabel}
              labelLine={false}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[entry.name] || DEFAULT_COLOR} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px', color: '#F8FAFC' }}
              itemStyle={{ color: '#F8FAFC' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
