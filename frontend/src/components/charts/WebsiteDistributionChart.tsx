import { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { useSubsData } from '../../hooks/useSubsData';
import { WebsiteDistributionSkeleton } from '../ChartPlaceholders';

import { COLORS, DEFAULT_COLOR } from '../../lib/constants';

const renderCustomizedLabel = ({ cx, cy, midAngle, outerRadius, percent, name, fill }: any) => {
  if (percent < 0.05) return null;
  const RADIAN = Math.PI / 180;
  const sin = Math.sin(-midAngle * RADIAN);
  const cos = Math.cos(-midAngle * RADIAN);

  const sx = cx + (outerRadius) * cos;
  const sy = cy + (outerRadius) * sin;
  const mx = cx + (outerRadius * 1.15) * cos;
  const my = cy + (outerRadius * 1.15) * sin;

  const isRight = cos >= 0;
  const ex = mx + (isRight ? 1 : -1) * 15;

  const getLogoPath = (name: string) => {
    return `./OJ logos/${name}.png`;
  };

  const fWidth = 250;
  const fHeight = 40;
  const fX = isRight ? ex + 5 : ex - fWidth - 5;
  const fY = my - fHeight / 2;

  return (
    <g>
      <path d={`M${sx},${sy} L${mx},${my} L${ex},${my}`} stroke={fill} fill="none" strokeWidth={3} />
      <foreignObject x={fX} y={fY} width={fWidth} height={fHeight}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: isRight ? 'flex-start' : 'flex-end',
          width: '100%',
          height: '100%',
          fontSize: '20px',
          fontWeight: 'bold',
          color: fill,
          gap: '8px'
        }}>
          <img src={getLogoPath(name)} alt={name} style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
          <span>{`${name} (${(percent * 100).toFixed(0)}%)`}</span>
        </div>
      </foreignObject>
    </g>
  );
};

export default function WebsiteDistributionChart() {
  const { rawData, loading, error, selectedWebsite, selectedVerdict, setWebsiteFilter } = useSubsData();

  const chartData = useMemo(() => {
    if (!rawData) return [];
    const counts: Record<string, number> = {};

    // Cross-filtering: Filter by the other dimension (verdict) if selected
    const filteredRaw = selectedVerdict
      ? rawData.filter(sub => sub['結果'] === selectedVerdict)
      : rawData;

    filteredRaw.forEach(sub => {
      const site = sub['網站'] || 'Unknown';
      counts[site] = (counts[site] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [rawData, selectedVerdict]);

  if (loading) {
    return <WebsiteDistributionSkeleton />;
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
      <h2 className="chart-title">解題網站</h2>
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
              {chartData.map((entry, index) => {
                const isSelected = selectedWebsite === entry.name;
                const isDimmed = selectedWebsite && !isSelected;
                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[entry.name] || DEFAULT_COLOR}
                    opacity={isDimmed ? 0.3 : 1}
                    style={{
                      cursor: 'pointer',
                      outline: 'none',
                      transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                      transformOrigin: 'center',
                      transition: 'all 0.1s ease'
                    }}
                    onClick={(e: any) => {
                      if (e && e.stopPropagation) e.stopPropagation();
                      setWebsiteFilter(entry.name);
                    }}
                  />
                );
              })}
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
