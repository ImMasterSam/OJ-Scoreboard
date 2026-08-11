import { useMemo, useState } from 'react';
import { useSubsData } from '../../hooks/useSubsData';
import { HistoricalSubmissionsSkeleton } from '../ChartPlaceholders';
import { COLORS } from '../../lib/constants';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const CustomTooltip = ({ active, payload, label, isCumulative }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const dateObj = data.dateObj as Date;
    const dateLabel = dateObj ? `${dateObj.getFullYear()} 年 ${dateObj.getMonth() + 1} 月` : label;
    const totalCount = isCumulative ? data.cumulativeCount : data.count;
    const sitesData: Record<string, number> = isCumulative ? data.cumulativeWebsites : data.websites;

    const sites = Object.entries(sitesData)
      .filter(([_, count]) => count > 0)
      .sort((a, b) => b[1] - a[1]);

    return (
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid var(--border-color)',
        borderRadius: '8px',
        padding: '12px',
        color: 'var(--text-primary)',
        minWidth: '160px',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '10px', paddingBottom: '8px', borderBottom: '1px solid var(--border-color)' }}>
          {dateLabel}
        </div>
        {sites.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '10px' }}>
            {sites.map(([site, count]) => (
              <div key={site} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: COLORS[site] || '#8E44AD' }} />
                  <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{site}</span>
                </div>
                <span style={{ fontSize: '14px', fontWeight: 600 }}>{count}</span>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '10px' }}>無提交紀錄</div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '14px', fontWeight: 'bold' }}>總計</span>
          <span style={{ fontSize: '16px', fontWeight: 'bold', color: isCumulative ? '#10b981' : '#3b82f6' }}>{totalCount}</span>
        </div>
      </div>
    );
  }
  return null;
};

export default function SubmissionsOverTimeChart() {
  const { rawData, filteredData, loading, error } = useSubsData();
  const [viewMode, setViewMode] = useState<'monthly' | 'cumulative'>('monthly');

  const chartData = useMemo(() => {
    const dataSource = filteredData || rawData;
    if (!dataSource || dataSource.length === 0) return [];

    let minDate: Date | null = null;
    let maxDate: Date | null = null;

    if (rawData) {
      rawData.forEach((sub) => {
        const dateStr = sub['完成時間'];
        if (!dateStr) return;
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return;

        if (!minDate || date < minDate) minDate = date;
        if (!maxDate || date > maxDate) maxDate = date;
      });
    }

    const countsByMonth = new Map<string, { total: number, websites: Record<string, number> }>();

    dataSource.forEach((sub) => {
      const dateStr = sub['完成時間'];
      if (!dateStr) return;
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return;

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const key = `${year}-${month}`;
      const site = sub['網站'] || 'Unknown';

      const entry = countsByMonth.get(key) || { total: 0, websites: {} };
      entry.total += 1;
      entry.websites[site] = (entry.websites[site] || 0) + 1;
      countsByMonth.set(key, entry);
    });

    if (!minDate || !maxDate) return [];

    const minD = minDate as Date;
    const maxD = maxDate as Date;

    const data = [];
    let cumulative = 0;
    let cumulativeWebsites: Record<string, number> = {};
    const current = new Date(minD.getFullYear(), minD.getMonth(), 1);
    const end = new Date(maxD.getFullYear(), maxD.getMonth(), 1);

    while (current <= end) {
      const year = current.getFullYear();
      const month = String(current.getMonth() + 1).padStart(2, '0');
      const key = `${year}-${month}`;
      const monthData = countsByMonth.get(key) || { total: 0, websites: {} };

      cumulative += monthData.total;

      Object.entries(monthData.websites).forEach(([site, count]) => {
        cumulativeWebsites[site] = (cumulativeWebsites[site] || 0) + count;
      });

      data.push({
        name: key, // YYYY-MM
        dateObj: new Date(current),
        count: monthData.total,
        cumulativeCount: cumulative,
        websites: { ...monthData.websites },
        cumulativeWebsites: { ...cumulativeWebsites },
      });
      current.setMonth(current.getMonth() + 1);
    }

    return data;
  }, [rawData, filteredData]);

  if (loading) {
    return <HistoricalSubmissionsSkeleton />;
  }
  if (error) {
    return <div className="chart-card dashboard-item error" style={{ gridColumn: 'span 8' }}>Error: {error}</div>;
  }

  const dataSource = filteredData || rawData;
  const totalSubmissions = dataSource ? dataSource.length : 0;
  const isCumulative = viewMode === 'cumulative';

  return (
    <div className="chart-card dashboard-item" style={{ gridColumn: 'span 8', display: 'flex', flexDirection: 'column' }}>
      <div className="chart-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <h2 className="chart-title" style={{ margin: 0 }}>歷年提交量</h2>
          <div style={{ display: 'flex', border: '1px solid var(--border-color)', borderRadius: '6px', overflow: 'hidden' }}>
            <button
              onClick={(e) => { e.stopPropagation(); setViewMode('monthly'); }}
              style={{
                padding: '6px 12px',
                border: 'none',
                background: !isCumulative ? 'var(--surface-color-hover, #666769)' : 'transparent',
                color: !isCumulative ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: !isCumulative ? 600 : 400,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              單月
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setViewMode('cumulative'); }}
              style={{
                padding: '6px 12px',
                border: 'none',
                borderLeft: '1px solid var(--border-color)',
                background: isCumulative ? 'var(--surface-color-hover, #666769)' : 'transparent',
                color: isCumulative ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: isCumulative ? 600 : 400,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              累計
            </button>
          </div>
        </div>
        <div style={{ textAlign: 'right', display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
          <span style={{ fontSize: '3rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1 }}>
            {totalSubmissions.toLocaleString()}
          </span>
          <span style={{ color: 'var(--text-secondary)', fontSize: '1.25rem' }}>
            總提交量
          </span>
        </div>
      </div>
      <div className="chart-container" style={{ flexGrow: 1, minHeight: '300px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorSubmissions" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorSubmissionsCumulative" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={true} />
            <XAxis
              dataKey="name"
              ticks={chartData.filter(d => d.dateObj.getMonth() === 0).map(d => d.name)}
              tickFormatter={(val: string) => {
                const year = val.split('-')[0];
                return `${year}年`;
              }}
              stroke="var(--text-secondary)"
              tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: 'var(--border-color)' }}
            />
            <YAxis
              stroke="var(--text-secondary)"
              tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip isCumulative={isCumulative} />} />
            <Area
              type="monotone"
              dataKey={isCumulative ? "cumulativeCount" : "count"}
              name={isCumulative ? "累計提交量" : "單月提交量"}
              stroke={isCumulative ? "#10b981" : "#3b82f6"}
              strokeWidth={3}
              fillOpacity={1}
              fill={isCumulative ? "url(#colorSubmissionsCumulative)" : "url(#colorSubmissions)"}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
